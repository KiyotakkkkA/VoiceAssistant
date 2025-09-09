import os
import threading
from typing import Any, Dict
from interfaces import ISingleton

class PropertiesService(ISingleton):
    def __init__(self, properties_file: str = "init.properties"):
        self.properties_file = properties_file
        self._properties: Dict[str, Any] = {}
        self._lock = threading.RLock()
        self._load_properties()
    
    def _load_properties(self):
        try:
            if os.path.exists(self.properties_file):
                with open(self.properties_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                    self._properties = self._parse_properties(content)
                print(f"[PropertiesService] Loaded {len(self._properties)} properties from {self.properties_file}")
            else:
                self._properties = {}
                print(f"[PropertiesService] Properties file not found: {self.properties_file}, using empty properties")
        except Exception as e:
            print(f"[PropertiesService] Error loading properties: {e}")
            self._properties = {}
    
    def _parse_properties(self, content: str) -> Dict[str, Any]:
        properties = {}
        lines = content.split('\n')
        
        for line in lines:
            line = line.strip()
            
            if not line or line.startswith('#'):
                continue
            
            if '=' not in line:
                continue
            
            key, value = line.split('=', 1)
            key = key.strip()
            value = value.strip()
            
            if (value.startswith('"') and value.endswith('"')) or \
               (value.startswith("'") and value.endswith("'")):
                value = value[1:-1]
            
            if value.isdigit():
                properties[key] = int(value)
            elif value.replace('.', '', 1).isdigit():
                properties[key] = float(value)
            elif value.lower() == 'true':
                properties[key] = True
            elif value.lower() == 'false':
                properties[key] = False
            else:
                properties[key] = value
        
        return properties
    
    def get(self, key: str, default: Any = None) -> Any:
        with self._lock:
            return self._properties.get(key, default)
    
    def get_int(self, key: str, default: int = 0) -> int:
        value = self.get(key, default)
        try:
            return int(value)
        except (ValueError, TypeError):
            return default
    
    def get_float(self, key: str, default: float = 0.0) -> float:
        value = self.get(key, default)
        try:
            return float(value)
        except (ValueError, TypeError):
            return default
    
    def get_bool(self, key: str, default: bool = False) -> bool:
        value = self.get(key, default)
        if isinstance(value, bool):
            return value
        if isinstance(value, str):
            return value.lower() in ('true', '1', 'yes', 'on')
        return bool(value)
    
    def get_str(self, key: str, default: str = "") -> str:
        value = self.get(key, default)
        return str(value) if value is not None else default
    
    def reload(self):
        with self._lock:
            self._load_properties()
    
    def set_properties_file(self, file_path: str):
        with self._lock:
            self.properties_file = file_path
            self._load_properties()
    
    def get_all(self) -> Dict[str, Any]:
        with self._lock:
            return self._properties.copy()
    
    def has_property(self, key: str) -> bool:
        """Проверяет наличие свойства"""
        with self._lock:
            return key in self._properties
