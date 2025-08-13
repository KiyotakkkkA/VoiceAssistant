import json
import threading
import time
import os
from typing import Callable, Any, Optional

try:
	import websocket
except ImportError as e:
	raise SystemExit("Install dependency first: pip install websocket-client") from e


class SocketClient:
	def __init__(self,
			 url: str = f"ws://{os.getenv('SOCKET_HOST', 'localhost')}:{os.getenv('SOCKET_PORT', 8765)}",
			 reconnect_delay: float = 1.5,
			 log: bool = True,
			 auto_heartbeat: bool = True,
			 heartbeat_interval: float = 5.0,
			 echo_ui: bool = True):
		self.url = url
		self.reconnect_delay = reconnect_delay
		self.log = log
		self.ws: Optional[websocket.WebSocketApp] = None
		self._thread: Optional[threading.Thread] = None
		self._stop = threading.Event()
		self._on_message = None
		self._on_open = None
		self._hb = auto_heartbeat
		self._hb_interval = heartbeat_interval
		self._echo_ui = echo_ui
		self._last_hb_sent = 0.0

	def _log(self, *a):
		if self.log:
			print("[PySocketClient]", *a)

	def on_message(self, handler: Callable[[Any], None]):
		self._on_message = handler

	def on_open(self, handler: Callable[[], None]):
		self._on_open = handler

	def _run(self):
		def _on_open(_ws):
			self.send({"type": "python_ready", "from": "python", "payload": "online"})
			if self._on_open:
				try:
					self._on_open()
				except Exception as e:
					self._log("on_open handler error", e)

		def _on_message(_ws, message: str):
			try:
				data = json.loads(message)
			except Exception:
				data = message
			if isinstance(data, dict) and self._echo_ui and data.get('from') == 'ui' and data.get('type') == 'ui_message':
				self.send({'type': 'python_echo', 'from': 'python', 'payload': f"Получено от UI: {data.get('payload')}"})
			if self._on_message:
				self._on_message(data)

		def _on_error(_ws, err):
			self._log("error", err)

		def _on_close(_ws, status, msg):
			self._log("closed", status, msg)
			if not self._stop.is_set():
				time.sleep(self.reconnect_delay)
				self._create_and_run()

		self.ws = websocket.WebSocketApp(
			self.url,
			on_open=_on_open,
			on_message=_on_message,
			on_error=_on_error,
			on_close=_on_close,
		)
		if self._hb:
			threading.Thread(target=self._heartbeat_loop, daemon=True).start()
		self.ws.run_forever(ping_interval=25, ping_timeout=10)

	def _heartbeat_loop(self):
		while not self._stop.is_set():
			now = time.time()
			if now - self._last_hb_sent >= self._hb_interval:
				self._last_hb_sent = now
			time.sleep(0.5)
	def _create_and_run(self):
		if self._stop.is_set():
			return
		self._thread = threading.Thread(target=self._run, daemon=True)
		self._thread.start()

	def connect(self):
		if self._thread and self._thread.is_alive():
			return
		self._stop.clear()
		self._create_and_run()

	def send(self, obj: Any):
		data = json.dumps(obj)
		if not self.ws:
			self._log("no socket yet, buffering send -> will retry")
			for _ in range(5):
				time.sleep(0.2)
				if self.ws:
					break
		try:
			if self.ws and self.ws.sock and self.ws.sock.connected:
				self.ws.send(data)
				return True
		except Exception as e:
			self._log("send failed", e)
		return False

	def close(self):
		self._stop.set()
		try:
			if self.ws:
				self.ws.close()
		finally:
			self.ws = None
		if self._thread:
			self._thread.join(timeout=2)
			self._thread = None
