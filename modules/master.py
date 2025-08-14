import os
import json
import threading
import time
import signal
import runpy
from typing import Any, Dict, List, Tuple
from clients import SocketClient
from paths import path_resolver
from enums.Events import EventsType, EventsTopic

class Orchestrator:

	BINDINGS = {
		'ready_voice_recognizer': EventsTopic.READY_VOICE_RECOGNIZER.value,
	}

	def __init__(self):
		self.modules_manifests: Dict[str, Dict[str, Any]] = {}
		self._running: Dict[Tuple[str, str], Tuple[threading.Thread, threading.Event]] = {}
		self.registry: Dict[str, Dict[str, Any]] = {}
		self.client = SocketClient(log=True)

		self.modules_root = f"{os.path.dirname(os.path.abspath(__file__))}/src"

		def _on_open():
			self.client.send({
				'type': EventsType.EVENT.value,
				'topic': EventsTopic.SERVICE_WAS_REGISTERED.value,
				'payload': {
					'service': 'orchestrator',
					'subscribes': ['*']
				},
				'from': 'orchestrator'
			})
		self.client.on_open(_on_open)

		self.client.subscribe(EventsTopic.SERVICE_WAS_REGISTERED.value, self._on_service_register)

	def _on_service_register(self, msg: Dict[str, Any]):
		p = msg.get('payload') or {}
		name = p.get('service') or 'unknown'
		self.registry[name] = {
			'subscribes': p.get('subscribes') or [],
			'ts': time.time()
		}
		on_start_event = self.BINDINGS.get(self.modules_manifests.get(name, {}).get('service.on_start.event'))
		if on_start_event:
			self.client.send({
				'type': EventsType.SERVICE_INIT.value,
				'topic': f'{on_start_event}',
				'payload': {
					'service': name
				},
				'from': 'orchestrator'
			})
		print(f"[Orchestrator] registered service: {name} -> {self.registry[name]}")

	def load_modules(self):
		modules_root = self.modules_root
		if not os.path.isdir(modules_root):
			print('[Orchestrator] no modules dir found')
			return
		for module_dir in os.listdir(modules_root):
			manifest_path = os.path.join(modules_root, module_dir, 'manifest.json')
			if os.path.exists(manifest_path):
				try:
					with open(manifest_path, 'r', encoding='utf-8') as f:
						manifest = json.load(f)
						manifest['__dir__'] = os.path.join(modules_root, module_dir)
						self.modules_manifests[module_dir] = manifest
				except Exception as e:
					print('[Orchestrator] manifest error', manifest_path, e)

	def _run_module_file(self, name: str, file_rel_path: str, stop_event: threading.Event):
		abs_path = os.path.join(self.modules_root, file_rel_path)
		if not os.path.isfile(abs_path):
			print(f"[Orchestrator] main file not found for {name}: {abs_path}")
			return
		g = {'__name__': '__main__', 'ORC_STOP': stop_event}
		print(f"[Orchestrator] starting module '{name}' -> {abs_path}")
		try:
			import sys
			if self.modules_root not in sys.path:
				sys.path.insert(0, self.modules_root)
			runpy.run_path(abs_path, init_globals=g)
		except SystemExit:
			pass
		except Exception as e:
			raise e
		finally:
			print(f"[Orchestrator] module '{name}' finished")

	def start_all(self):
		self.client.connect()
		for m in self.modules_manifests.values():
			name = m.get('module.name', 'unknown')
			rel_path = m.get('module.main.path')
			if not rel_path:
				continue
			key = (name, rel_path)
			if key in self._running:
				continue
			stop_event = threading.Event()
			th = threading.Thread(target=self._run_module_file, args=(name, rel_path, stop_event), daemon=True)
			self._running[key] = (th, stop_event)
			th.start()

	def stop_all(self):
		print('[Orchestrator] stopping modules...')
		for (name, _), (th, ev) in list(self._running.items()):
			try:
				ev.set()
			except Exception:
				pass
		for (name, _), (th, ev) in list(self._running.items()):
			try:
				th.join(timeout=3)
			except Exception:
				pass
		self._running.clear()
		try:
			self.client.close()
		except Exception:
			pass

def start():
	try:
		print('[Orchestrator] os.getcwd() =', os.getcwd())
	except Exception:
		pass
	orchestrator = Orchestrator()
	orchestrator.load_modules()
	orchestrator.start_all()
	print('[Orchestrator] loaded manifests:', [m.get('module.name') for m in orchestrator.modules_manifests.values()])

	def _shutdown(*_):
		orchestrator.stop_all()
		raise SystemExit(0)

	signal.signal(signal.SIGINT, _shutdown)
	try:
		while True:
			time.sleep(0.5)
	except KeyboardInterrupt:
		_shutdown()


start()