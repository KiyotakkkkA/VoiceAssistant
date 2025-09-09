import os
import websocket
import json
import time
import threading
from typing import Callable, Optional, Dict, Any, List
from enums.Events import EventsType, EventsTopic
from utils.EnvHelper import getenv


class ModuleClient:
    def __init__(
        self,
        service_name: str,
        manifest_file: str,
        subscribes: Optional[List[str]] = None,
        socket_host: str = getenv('SOCKET_HOST', 'localhost'),
        socket_port: str = getenv('SOCKET_PORT', '8765'),
        heartbeat_interval: float = 5.0,
        max_reconnect_attempts: int = 10,
        log_prefix: Optional[str] = None,
    ) -> None:
        self.service_name = service_name
        self.subscribes = subscribes or []
        self.url = f"ws://{socket_host}:{socket_port}"
        self.heartbeat_interval = heartbeat_interval
        self.max_reconnect_attempts = max_reconnect_attempts
        self.log_prefix = log_prefix or service_name

        self._ws = None
        self._stop = threading.Event()
        self._attempts = 0
        self._hb_stop = threading.Event()

        self._manifest_file = manifest_file
        self._manifest_path = f"{os.getcwd()}/modules/src/{service_name}/{manifest_file}"
        self._manifest_data = self._read_manifest()

        self._on_message = None
        self._on_command: Dict[str, Callable[[Dict[str, Any]], None]] = {}

    def _read_manifest(self):
        try:
            with open(self._manifest_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            self._log('error reading manifest', e)
            return {}

    def _log(self, *args):
        print(f"[{self.log_prefix}]", *args)

    def on_message(self, handler: Callable[[Any], None]):
        self._on_message = handler

    def on(self, topic: str, handler: Callable[[Dict[str, Any]], None]):
        self._on_command[topic] = handler
        return self

    def emit(self, obj: Dict[str, Any]):
        try:
            if self._ws and self._ws.sock and self._ws.sock.connected:
                self._ws.send(json.dumps(obj))
        except Exception:
            pass

    def start(self, stop_event: Optional[threading.Event] = None, block: bool = True):
        if stop_event is not None:
            self._stop = stop_event
        threading.Thread(target=self._run_loop, daemon=True).start()
        if block:
            while not self._stop.is_set():
                time.sleep(0.2)

    def _run_loop(self):
        while not self._stop.is_set() and self._attempts < self.max_reconnect_attempts:
            self._hb_stop.clear()

            def _on_open(ws):
                self._attempts = 0
                try:
                    ws.send(json.dumps({
                        'type': EventsType.EVENT.value, 'topic': EventsTopic.SERVICE_WAS_REGISTERED.value,
                        'payload': {
                            'service': self.service_name,
                            'service_name': self._manifest_data.get('module.name'),
                            'service_desc': self._manifest_data.get('module.desc'),
                            'subscribes': self.subscribes
                        },
                        'from': self.service_name
                    }))
                except Exception:
                    pass

            def _on_message(ws, msg):
                try:
                    data = json.loads(msg)
                except Exception:
                    data = msg
                if isinstance(data, dict):
                    topic = data.get('topic') or data.get('type')
                    if topic:
                        handler = self._on_command.get(topic)
                        if handler:
                            try:
                                handler(data)
                            except Exception as e:
                                self._log('handler error for', topic, e)
                        else:
                            for pat, h in list(self._on_command.items()):
                                if pat.endswith('*') and topic.startswith(pat[:-1]):
                                    try:
                                        h(data)
                                    except Exception as e:
                                        self._log('handler error for', pat, e)
                if self._on_message:
                    try:
                        self._on_message(data)
                    except Exception as e:
                        self._log('on_message error', e)

            def _on_close(ws, status, msg):
                self._hb_stop.set()

            def _on_error(ws, err):
                self._log('error', err)

            self._ws = websocket.WebSocketApp(
                self.url,
                on_open=_on_open,
                on_message=_on_message,
                on_error=_on_error,
                on_close=_on_close,
            )
            try:
                self._ws.run_forever(ping_interval=25, ping_timeout=10)
            except Exception:
                pass
            finally:
                self._hb_stop.set()
            if not self._stop.is_set():
                self._attempts += 1
                self._log(f"reconnect attempt {self._attempts}/{self.max_reconnect_attempts}")
                if self._attempts >= self.max_reconnect_attempts:
                    self._log("maximum reconnect attempts reached. Stopping service loop.")
                    break
                time.sleep(2)

    def stop(self):
        self._stop.set()
        self._hb_stop.set()
        try:
            if self._ws:
                self._ws.close()
        except Exception:
            pass
        self._ws = None
