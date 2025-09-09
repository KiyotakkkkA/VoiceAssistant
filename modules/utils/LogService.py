"""
LogService - Централизованная система логирования для модулей
"""
import os
import logging
import threading
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, Any
from interfaces import ISingleton

class LogService(ISingleton):
    def __init__(self, log_file: str = "crash-report.log"):
        self.log_file = log_file
        self._lock = threading.RLock()
        self._logger: Optional[logging.Logger] = None
        self._setup_logger()
    
    def _setup_logger(self):
        try:
            log_path = Path(self.log_file)
            log_path.parent.mkdir(parents=True, exist_ok=True)
            
            self._logger = logging.getLogger('VoiceAssistant')
            self._logger.setLevel(logging.DEBUG)
            
            for handler in self._logger.handlers[:]:
                self._logger.removeHandler(handler)
            
            file_handler = logging.FileHandler(self.log_file, encoding='utf-8')
            file_handler.setLevel(logging.DEBUG)
            
            console_handler = logging.StreamHandler()
            console_handler.setLevel(logging.INFO)
            
            formatter = logging.Formatter(
                '%(asctime)s | %(levelname)-8s | %(name)s | %(message)s',
                datefmt='%Y-%m-%d %H:%M:%S'
            )
            
            file_handler.setFormatter(formatter)
            console_handler.setFormatter(formatter)
            
            self._logger.addHandler(file_handler)
            self._logger.addHandler(console_handler)
            
            self._logger.propagate = False
            
        except Exception as e:
            print(f"[LogService] Failed to setup logger: {e}")
    
    def _log(self, level: str, message: str, module_name: str = "", exception: Optional[Exception] = None):
        with self._lock:
            try:
                if not self._logger:
                    self._setup_logger()
                
                full_message = f"[{module_name}] {message}" if module_name else message
                
                if exception:
                    full_message += f" | Exception: {type(exception).__name__}: {str(exception)}"
                
                if self._logger:
                    if level.upper() == 'DEBUG':
                        self._logger.debug(full_message)
                    elif level.upper() == 'INFO':
                        self._logger.info(full_message)
                    elif level.upper() == 'WARNING':
                        self._logger.warning(full_message)
                    elif level.upper() == 'ERROR':
                        self._logger.error(full_message)
                    elif level.upper() == 'CRITICAL':
                        self._logger.critical(full_message)
                    else:
                        self._logger.info(full_message)
                    
            except Exception as e:
                timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                print(f"{timestamp} | ERROR | LogService | Failed to log message: {e}")
                print(f"{timestamp} | {level.upper()} | {module_name} | {message}")
    
    def debug(self, message: str, module_name: str = "", exception: Optional[Exception] = None):
        self._log('DEBUG', message, module_name, exception)
    
    def info(self, message: str, module_name: str = "", exception: Optional[Exception] = None):
        self._log('INFO', message, module_name, exception)
    
    def warning(self, message: str, module_name: str = "", exception: Optional[Exception] = None):
        self._log('WARNING', message, module_name, exception)
    
    def error(self, message: str, module_name: str = "", exception: Optional[Exception] = None):
        self._log('ERROR', message, module_name, exception)
    
    def critical(self, message: str, module_name: str = "", exception: Optional[Exception] = None):
        self._log('CRITICAL', message, module_name, exception)
    
    def log_crash(self, message: str, module_name: str = "", exception: Optional[Exception] = None, 
                  additional_info: Optional[Dict[str, Any]] = None):
        crash_message = f"CRASH REPORT: {message}"
        
        if additional_info:
            crash_message += f" | Additional info: {additional_info}"
        
        self.critical(crash_message, module_name, exception)
        
        print(f"\n{'='*50}")
        print(f"CRASH DETECTED in {module_name}")
        print(f"Message: {message}")
        if exception:
            print(f"Exception: {type(exception).__name__}: {str(exception)}")
        if additional_info:
            print(f"Additional info: {additional_info}")
        print(f"{'='*50}\n")
    
    def set_log_file(self, new_log_file: str):
        with self._lock:
            self.log_file = new_log_file
            self._setup_logger()
    
    def get_log_file_path(self) -> str:
        return os.path.abspath(self.log_file)
    
    def clear_log(self):
        try:
            with open(self.log_file, 'w', encoding='utf-8') as f:
                f.write("")
            self.info("Log file cleared", "LogService")
        except Exception as e:
            self.error(f"Failed to clear log file: {e}", "LogService", e)


def get_logger() -> LogService:
    return LogService.getInstance()

def log_debug(message: str, module_name: str = "", exception: Optional[Exception] = None):
    get_logger().debug(message, module_name, exception)

def log_info(message: str, module_name: str = "", exception: Optional[Exception] = None):
    get_logger().info(message, module_name, exception)

def log_warning(message: str, module_name: str = "", exception: Optional[Exception] = None):
    get_logger().warning(message, module_name, exception)

def log_error(message: str, module_name: str = "", exception: Optional[Exception] = None):
    get_logger().error(message, module_name, exception)

def log_critical(message: str, module_name: str = "", exception: Optional[Exception] = None):
    get_logger().critical(message, module_name, exception)

def log_crash(message: str, module_name: str = "", exception: Optional[Exception] = None, 
              additional_info: Optional[Dict[str, Any]] = None):
    get_logger().log_crash(message, module_name, exception, additional_info)
