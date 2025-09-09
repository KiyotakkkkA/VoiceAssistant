import threading
import time
import json
import websocket
from typing import Callable, Any, Optional, Dict, List
from utils.EnvHelper import getenv

class SocketClient:
	def __init__(self,
			 url: str = f"ws://{getenv('SOCKET_HOST', 'localhost')}:{getenv('SOCKET_PORT', '8765')}",
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
		self._subscriptions: Dict[str, List[Callable[[Any], None]]] = {}
		self._hb = auto_heartbeat
		self._hb_interval = heartbeat_interval
		self._echo_ui = echo_ui
		self._last_hb_sent = 0.0

	def _log(self, *a):
		if self.log:
			print("[PySocketClient]", *a)

	def on_message(self, handler: Callable[[Any], None]):
		self._on_message = handler

	def subscribe(self, topic: str, handler: Callable[[Any], None]):
		if topic not in self._subscriptions:
			self._subscriptions[topic] = []
		self._subscriptions[topic].append(handler)
		return lambda: self.unsubscribe(topic, handler)

	def unsubscribe(self, topic: str, handler: Callable[[Any], None]):
		lst = self._subscriptions.get(topic)
		if not lst:
			return
		try:
			lst.remove(handler)
		except ValueError:
			pass
		if not lst:
			del self._subscriptions[topic]

	def _match_topic(self, topic: str, pattern: str) -> bool:
		if pattern.endswith('*'):
			prefix = pattern[:-1]
			return topic.startswith(prefix)
		return topic == pattern

	def _dispatch(self, data: Any):
		if isinstance(data, dict):
			topic = data.get('topic') or data.get('type')
			if topic:
				for pattern, handlers in list(self._subscriptions.items()):
					if self._match_topic(topic, pattern):
						for h in list(handlers):
							try:
								h(data)
							except Exception as e:
								self._log('subscription handler error', e)
		if self._on_message:
			try:
				self._on_message(data)
			except Exception as e:
				self._log('on_message handler error', e)

	def on_open(self, handler: Callable[[], None]):
		self._on_open = handler

	def _run(self):
		def _on_open(_ws):
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
			self._dispatch(data)

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