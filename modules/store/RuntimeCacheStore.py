import json
from interfaces import ISingleton
from paths import path_resolver

class RuntimeCacheStore(ISingleton):

    _cache: dict[str, dict] = {}
    
    @staticmethod
    def get_all_cache():
        return RuntimeCacheStore._cache

    @staticmethod
    def set_cache(key: str, value: dict):
        RuntimeCacheStore._cache[key] = value

    @staticmethod
    def get_cache(key: str, default = None):
        return RuntimeCacheStore._cache.get(key, default)

    @staticmethod
    def remove_cache(key: str):
        RuntimeCacheStore._cache.pop(key, None)

    @staticmethod
    def clear_cache():
        RuntimeCacheStore._cache.clear()

    @staticmethod
    def from_settings_to_cache(settings_keys: list[dict[str, str]]):
        with open(f"{path_resolver['global_path']}/settings.json") as f:
            settings = json.load(f)
            for key in settings_keys:
                RuntimeCacheStore.set_cache(key['key_to'], settings.get(key['key_from']))