import os
import pickle
import threading
from typing import Any, Dict, Optional, List
from datetime import datetime
from paths import path_resolver
from interfaces import ISingleton

class CacheService(ISingleton):    
    def __init__(self, cache_file: str = "cache.dat"):
        self.cache_file = os.path.join(path_resolver['temp_path'], cache_file)
        self._cache: Dict[str, Any] = {}
        self._lock = threading.RLock()
        self._ensure_cache_directory()
        self._load_cache()
    
    def _ensure_cache_directory(self):
        cache_dir = os.path.dirname(self.cache_file)
        if not os.path.exists(cache_dir):
            os.makedirs(cache_dir, exist_ok=True)
    
    def _load_cache(self):
        try:
            if os.path.exists(self.cache_file):
                with open(self.cache_file, 'rb') as f:
                    self._cache = pickle.load(f)
                print(f"[CacheService] Loaded cache with {len(self._cache)} entries")
            else:
                self._cache = {}
                print(f"[CacheService] Initialized empty cache")
        except Exception as e:
            print(f"[CacheService] Error loading cache: {e}")
            self._cache = {}
    
    def _save_cache(self):
        try:
            with open(self.cache_file, 'wb') as f:
                pickle.dump(self._cache, f)
        except Exception as e:
            print(f"[CacheService] Error saving cache: {e}")
    
    def set(self, key: str, value: Any, auto_save: bool = True) -> bool:
        try:
            with self._lock:
                self._cache[key] = {
                    'value': value,
                    'created_at': datetime.now().isoformat(),
                    'updated_at': datetime.now().isoformat()
                }
                if auto_save:
                    self._save_cache()
                return True
        except Exception as e:
            print(f"[CacheService] Error setting key '{key}': {e}")
            return False
    
    def get(self, key: str, default: Any = None) -> Any:
        try:
            with self._lock:
                if key in self._cache:
                    return self._cache[key]['value']
                return default
        except Exception as e:
            print(f"[CacheService] Error getting key '{key}': {e}")
            return default
    
    def exists(self, key: str) -> bool:
        with self._lock:
            return key in self._cache
    
    def delete(self, key: str, auto_save: bool = True) -> bool:
        try:
            with self._lock:
                if key in self._cache:
                    del self._cache[key]
                    if auto_save:
                        self._save_cache()
                    return True
                return False
        except Exception as e:
            print(f"[CacheService] Error deleting key '{key}': {e}")
            return False
    
    def update(self, key: str, value: Any, auto_save: bool = True) -> bool:
        try:
            with self._lock:
                if key in self._cache:
                    self._cache[key]['value'] = value
                    self._cache[key]['updated_at'] = datetime.now().isoformat()
                else:
                    self._cache[key] = {
                        'value': value,
                        'created_at': datetime.now().isoformat(),
                        'updated_at': datetime.now().isoformat()
                    }
                if auto_save:
                    self._save_cache()
                return True
        except Exception as e:
            print(f"[CacheService] Error updating key '{key}': {e}")
            return False
    
    def keys(self) -> List[str]:
        with self._lock:
            return list(self._cache.keys())
    
    def values(self) -> List[Any]:
        with self._lock:
            return [item['value'] for item in self._cache.values()]
    
    def items(self) -> List[tuple]:
        with self._lock:
            return [(key, item['value']) for key, item in self._cache.items()]
    
    def clear(self, auto_save: bool = True) -> bool:
        try:
            with self._lock:
                self._cache.clear()
                if auto_save:
                    self._save_cache()
                return True
        except Exception as e:
            print(f"[CacheService] Error clearing cache: {e}")
            return False
    
    def size(self) -> int:
        with self._lock:
            return len(self._cache)
    
    def get_metadata(self, key: str) -> Optional[Dict]:
        with self._lock:
            if key in self._cache:
                return {
                    'created_at': self._cache[key]['created_at'],
                    'updated_at': self._cache[key]['updated_at']
                }
            return None
    
    def save_force(self) -> bool:
        try:
            with self._lock:
                self._save_cache()
                return True
        except Exception as e:
            print(f"[CacheService] Error force saving cache: {e}")
            return False
