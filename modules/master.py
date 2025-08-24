import os
import json
import threading
import time
import signal
import runpy
from typing import Any, Dict, List, Tuple, Optional
from clients import SocketClient
from paths import path_resolver
from enums.Events import EventsType, EventsTopic

class Logger:

	_DEBUG = True

	@staticmethod
	def info(message: str):
		if Logger._DEBUG:
			print(f"\033[38;5;208m[PYTHON - Orchestrator]\x1b[0m \x1b[32mINFO:\x1b[0m {message}")

	@staticmethod
	def warn(message: str):
		if Logger._DEBUG:
			print(f"\033[38;5;208m[PYTHON - Orchestrator]\x1b[0m \x1b[33mWARN:\x1b[0m {message}")

	@staticmethod
	def error(message: str):
		if Logger._DEBUG:
			print(f"\033[38;5;208m[PYTHON - Orchestrator]\x1b[0m \x1b[31mERROR:\x1b[0m {message}")

	@staticmethod
	def debug(message: str):
		if Logger._DEBUG:
			print(f"\033[38;5;208m[PYTHON - Orchestrator]\x1b[0m \x1b[36mDEBUG:\x1b[0m {message}")

class Orchestrator:
	def __init__(self):
		self.modules_manifests: Dict[str, Dict[str, Any]] = {}
		self._running: Dict[Tuple[str, str, str], Tuple[threading.Thread, threading.Event]] = {}
		self.registry: Dict[str, Dict[str, Any]] = {}
		self.client = SocketClient(log=True)
		self.logger = Logger()

		self.modules_root = f"{os.path.dirname(os.path.abspath(__file__))}/src"

		self.client.subscribe(EventsTopic.ACTION_SERVICE_RELOAD.value, self._on_service_reload)
		self.client.subscribe(EventsTopic.ACTION_SERVICE_DISABLE.value, self._on_service_disable)
		self.client.subscribe(EventsTopic.ACTION_SERVICE_ENABLE.value, self._on_service_enable)

		def _on_open():
			self.client.send({
				'type': EventsType.EVENT.value,
				'topic': EventsTopic.SERVICE_WAS_REGISTERED.value,
				'payload': {
					'service': 'orchestrator',
					'service_name': "Orchestrator",
					'service_desc': "Оркестрирование подключёнными модулями",
					'subscribes': ['*']
				},
				'from': 'orchestrator'
			})

			self.client.send({
				'type': EventsType.SERVICE_INIT.value,
				'topic': EventsTopic.READY_ORCHESTRATOR.value,
				'payload': {
					'service': 'orchestrator',
					'subscribes': ['*']
				},
				'from': 'orchestrator'
			})
		self.client.on_open(_on_open)

		self.client.subscribe(EventsTopic.SERVICE_WAS_REGISTERED.value, self._on_service_register)

	def _on_service_reload(self, msg: Dict[str, Any]):
		service_name = msg.get('payload', {}).get('serviceId')

		if not service_name:
			self.logger.error('serviceId missing in reload message or this service does not exist')
			return

		self.restart_module(service_name)

	def _on_service_disable(self, msg: Dict[str, Any]):
		service_name = msg.get('payload', {}).get('serviceId')

		if not service_name:
			self.logger.warn('serviceId missing in disable message or this service does not exist')
			return

		self.stop_module(service_name)

	def _on_service_enable(self, msg: Dict[str, Any]):
		service_name = msg.get('payload', {}).get('serviceId')

		if not service_name:
			self.logger.warn('serviceId missing in enable message or this service does not exist')
			return

		self.start_module(service_name)

	def _on_service_register(self, msg: Dict[str, Any]):
		p = msg.get('payload') or {}
		name = p.get('service') or 'unknown'
		self.registry[name] = {
			'subscribes': p.get('subscribes') or [],
			'ts': time.time()
		}
		self.client.send({
			'type': EventsType.SERVICE_INIT.value,
			'topic': f'ready_{name}',
			'payload': {
				'service': name
			},
			'from': 'orchestrator'
		})
		self.logger.info(f"registered service: {name} -> {self.registry[name]}")

	def load_modules(self):
		modules_root = self.modules_root
		if not os.path.isdir(modules_root):
			self.logger.warn('no modules dir found')
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

	def _find_module_by_service_id(self, service_id: str) -> Optional[Dict[str, Any]]:
		for manifest in self.modules_manifests.values():
			if manifest.get('module.id') == service_id:
				return manifest
		return None

	def _get_running_key_by_service_id(self, service_id: str) -> Optional[Tuple[str, str, str]]:
		print(self._running)
		for (s_id, name, rel_path) in self._running.keys():
			if s_id == service_id:
				return (s_id, name, rel_path)
		return None

	def _run_module_file(self, name: str, file_rel_path: str, stop_event: threading.Event):
		abs_path = os.path.join(self.modules_root, file_rel_path)
		if not os.path.isfile(abs_path):
			self.logger.error(f"main file not found for {name}: {abs_path}")
			return
		
		g = {'__name__': '__main__', 'ORC_STOP': stop_event}
		self.logger.info(f"starting module '{name}' -> {abs_path}")
		
		start_time = time.time()
		try:
			import sys
			if self.modules_root not in sys.path:
				sys.path.insert(0, self.modules_root)
			
			if stop_event.is_set():
				self.logger.info(f"module '{name}' received stop signal before execution")
				return
				
			runpy.run_path(abs_path, init_globals=g)
			
		except SystemExit as e:
			self.logger.debug(f"module '{name}' exited with SystemExit: {e}")
		except KeyboardInterrupt:
			self.logger.info(f"module '{name}' interrupted by keyboard")
		except Exception as e:
			self.logger.error(f"module '{name}' crashed with error: {e}")
			import traceback
			self.logger.debug(f"module '{name}' traceback: {traceback.format_exc()}")
			raise e
		finally:
			runtime = time.time() - start_time
			self.logger.info(f"module '{name}' finished (runtime: {runtime:.2f}s)")
			
			if stop_event.is_set():
				self.logger.debug(f"module '{name}' acknowledged stop signal")
			else:
				self.logger.warn(f"module '{name}' finished without acknowledging stop signal")

	def start_module(self, service_id: str) -> bool:
		manifest = self._find_module_by_service_id(service_id)
		if not manifest:
			self.logger.warn(f"module manifest not found for service: {service_id}")
			return False

		s_id = manifest.get('module.id', 'unknown')
		name = manifest.get('module.name', 'unknown')
		rel_path = manifest.get('module.main.path')
		if not rel_path:
			self.logger.warn(f"no main path in manifest for service: {service_id}")
			return False

		key = (s_id, name, rel_path)
		if key in self._running:
			self.logger.warn(f"module '{service_id}' is already running")
			return False

		stop_event = threading.Event()
		th = threading.Thread(target=self._run_module_file, args=(name, rel_path, stop_event), daemon=True)
		self._running[key] = (th, stop_event)
		th.start()
		self.logger.info(f"started module '{service_id}'")
		return True

	def stop_module(self, service_id: str) -> bool:
		key = self._get_running_key_by_service_id(service_id)
		if not key:
			self.logger.warn(f"module '{service_id}' is not running")
			return False

		th, stop_event = self._running[key]
		self.logger.info(f"stopping module '{service_id}'...")
		
		success = False
		try:
			stop_event.set()
			
			th.join(timeout=5)
			
			if th.is_alive():
				self.logger.warn(f"module '{service_id}' did not stop gracefully within timeout")
				
				self.logger.info(f"attempting forced termination of module '{service_id}'...")
				
				th.join(timeout=3)
				
				if th.is_alive():
					self.logger.error(f"module '{service_id}' is still running after forced termination attempt")
					self.logger.warn(f"marking module '{service_id}' as zombie process - it will be cleaned up on next restart")
				else:
					self.logger.info(f"module '{service_id}' was forcefully terminated")
					success = True
			else:
				self.logger.info(f"module '{service_id}' stopped gracefully")
				success = True
				
		except Exception as e:
			self.logger.error(f"error stopping module '{service_id}': {e}")
		finally:
			if key in self._running:
				del self._running[key]
			if service_id in self.registry:
				del self.registry[service_id]
			
			try:
				self.client.send({
					'type': EventsType.EVENT.value,
					'topic': EventsTopic.SERVICE_WAS_DISABLED.value,
					'payload': {
						'service': service_id,
						'graceful': success
					},
					'from': 'orchestrator'
				})
			except Exception as e:
				self.logger.error(f"failed to send stop notification for '{service_id}': {e}")
		
		return True

	def restart_module(self, service_id: str) -> bool:
		self.logger.info(f"restarting module '{service_id}'...")

		key = self._get_running_key_by_service_id(service_id)
		if key:
			if not self.stop_module(service_id):
				return False
			time.sleep(0.5)
		
		return self.start_module(service_id)

	def get_running_modules(self) -> List[str]:
		return [name for (s_id, name, _) in self._running.keys()]

	def is_module_running(self, service_id: str) -> bool:
		return self._get_running_key_by_service_id(service_id) is not None

	def get_module_health_status(self, service_id: str) -> Dict[str, Any]:
		"""Получить детальную информацию о состоянии модуля"""
		key = self._get_running_key_by_service_id(service_id)
		if not key:
			return {
				'status': 'not_running',
				'service_id': service_id,
				'thread_alive': False,
				'stop_event_set': False
			}
		
		th, stop_event = self._running[key]
		registry_info = self.registry.get(service_id, {})
		
		return {
			'status': 'running' if th.is_alive() else 'dead',
			'service_id': service_id,
			'thread_alive': th.is_alive(),
			'stop_event_set': stop_event.is_set(),
			'thread_name': th.name,
			'thread_daemon': th.daemon,
			'last_heartbeat': registry_info.get('ts'),
			'subscribes': registry_info.get('subscribes', [])
		}

	def cleanup_dead_modules(self):
		"""Очистка мертвых модулей из реестра"""
		dead_modules = []
		
		for key, (th, stop_event) in list(self._running.items()):
			s_id, name, rel_path = key
			if not th.is_alive():
				dead_modules.append(s_id)
				self.logger.warn(f"found dead module '{s_id}' - cleaning up")
				
				if key in self._running:
					del self._running[key]
				if s_id in self.registry:
					del self.registry[s_id]
		
		if dead_modules:
			self.logger.info(f"cleaned up {len(dead_modules)} dead modules: {dead_modules}")
		
		return dead_modules

	def start_all(self):
		self.client.connect()
		for m in self.modules_manifests.values():
			s_id = m.get('module.id', 'unknown')
			name = m.get('module.name', 'unknown')
			rel_path = m.get('module.main.path')
			if not rel_path:
				continue
			key = (s_id, name, rel_path)
			if key in self._running:
				continue
			stop_event = threading.Event()
			th = threading.Thread(target=self._run_module_file, args=(name, rel_path, stop_event), daemon=True)
			self._running[key] = (th, stop_event)
			th.start()

	def stop_all(self):
		self.logger.info('stopping all modules...')
		
		modules_to_stop = list(self._running.items())
		
		if not modules_to_stop:
			self.logger.info('no modules to stop')
			try:
				self.client.close()
			except Exception:
				pass
			return
		
		self.logger.info(f'sending stop signal to {len(modules_to_stop)} modules...')
		for (s_id, name, _), (th, stop_event) in modules_to_stop:
			try:
				stop_event.set()
				self.logger.debug(f"stop signal sent to module '{s_id}'")
			except Exception as e:
				self.logger.error(f"failed to send stop signal to module '{s_id}': {e}")
		
		self.logger.info('waiting for graceful shutdown...')
		graceful_count = 0
		forced_count = 0
		
		for (s_id, name, _), (th, stop_event) in modules_to_stop:
			try:
				th.join(timeout=3)
				if th.is_alive():
					self.logger.warn(f"module '{s_id}' did not stop gracefully")
					forced_count += 1
				else:
					self.logger.debug(f"module '{s_id}' stopped gracefully")
					graceful_count += 1
			except Exception as e:
				self.logger.error(f"error waiting for module '{s_id}': {e}")
				forced_count += 1
		
		if forced_count > 0:
			self.logger.info(f'attempting forced termination of {forced_count} remaining modules...')
			
			for (s_id, name, _), (th, stop_event) in modules_to_stop:
				if th.is_alive():
					try:
						th.join(timeout=2)
						if th.is_alive():
							self.logger.error(f"module '{s_id}' is still running after forced termination - marking as zombie")
						else:
							self.logger.info(f"module '{s_id}' was forcefully terminated")
					except Exception as e:
						self.logger.error(f"error during forced termination of module '{s_id}': {e}")
		
		self.logger.info(f'shutdown complete: {graceful_count} graceful, {forced_count} forced')
		self._running.clear()
		self.registry.clear()
		
		try:
			self.client.close()
		except Exception as e:
			self.logger.error(f"error closing client connection: {e}")

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