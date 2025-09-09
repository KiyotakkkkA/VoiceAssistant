import os
from .PropertiesService import PropertiesService

_properties_service = None

def _get_properties_service():
    global _properties_service
    if _properties_service is None:
        try:
            from pathlib import Path
            app_root = Path(__file__).resolve().parents[2]
            properties_path = app_root / 'init.properties'
            _properties_service = PropertiesService(str(properties_path))
        except Exception as e:
            print(f"[env_helper] Failed to initialize properties service: {e}")
            _properties_service = PropertiesService()  # Empty service as fallback
    return _properties_service

def getenv(key: str, default: str = "") -> str:
    try:
        properties_service = _get_properties_service()
        value = properties_service.get_str(key)
        if value:
            return value
        
        result = os.getenv(key, default)
        return result if result is not None else default
    except Exception:
        result = os.getenv(key, default)
        return result if result is not None else default

def getenv_int(key: str, default: int = 0) -> int:
    try:
        properties_service = _get_properties_service()
        return properties_service.get_int(key, default)
    except Exception:
        try:
            return int(os.getenv(key, str(default)))
        except (ValueError, TypeError):
            return default

def getenv_float(key: str, default: float = 0.0) -> float:
    try:
        properties_service = _get_properties_service()
        return properties_service.get_float(key, default)
    except Exception:
        try:
            return float(os.getenv(key, str(default)))
        except (ValueError, TypeError):
            return default

def getenv_bool(key: str, default: bool = False) -> bool:
    try:
        properties_service = _get_properties_service()
        return properties_service.get_bool(key, default)
    except Exception:
        value = os.getenv(key)
        if value is None:
            return default
        return value.lower() in ('true', '1', 'yes', 'on')
