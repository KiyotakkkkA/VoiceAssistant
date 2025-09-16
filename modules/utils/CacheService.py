import os
import pickle
import threading
from typing import Any, Dict, Optional, List
from datetime import datetime
from paths import path_resolver
from interfaces import ISingleton

class CacheService(ISingleton):    
    SERVICE_NAME = "CacheService"

    CACHE_BASE_DIR = path_resolver['cache_path']

    def _get_file_path(self, filename: str) -> str:
        if not filename.endswith(".dat"):
            filename += ".dat"
        return os.path.join(self.CACHE_BASE_DIR, filename)

    def set_cache(self, filename: str, data: Any) -> None:
        filepath = self._get_file_path(filename)
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        try:
            with open(filepath, "wb") as f:
                pickle.dump(data, f, protocol=pickle.HIGHEST_PROTOCOL)
        except Exception as e:
            print(f"[CacheService] Ошибка при записи кеша {filepath}: {e}")

    def get_cache(self, filename: str, default: Optional[Any] = None) -> Optional[Any]:
        filepath = self._get_file_path(filename)
        if not os.path.exists(filepath):
            return default
        try:
            with open(filepath, "rb") as f:
                return pickle.load(f)
        except Exception as e:
            print(f"[CacheService] Ошибка при чтении кеша {filepath}: {e}")
            return default

    