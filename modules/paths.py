from pathlib import Path
import sys
import os


_env_app_root = os.getenv('APP_ROOT')
if _env_app_root:
    APP_ROOT = Path(_env_app_root).resolve()
else:
    APP_ROOT = Path(__file__).resolve().parents[1]

if not APP_ROOT.exists():
    APP_ROOT = Path.cwd()

sys.path.append(str(Path(__file__).resolve().parent))

try:
    from utils.PropertiesService import PropertiesService  # type: ignore
    _properties_path = APP_ROOT / 'init.properties'
    properties_service = PropertiesService(str(_properties_path))
except Exception:
    properties_service = None  # noqa: E305


def _clean(v: str | None) -> str:
    if v is None:
        return ""
    return v.strip().strip('"').strip("'")


def _first_existing(*candidates: Path) -> Path:
    for c in candidates:
        if c.exists():
            return c
    return candidates[0]



_res_candidates = [
    APP_ROOT / 'resources',            # deployment via extraFiles (nested)
    APP_ROOT                            # direct (assets placed directly beside init.properties)
]
RESOURCES_DIR = _first_existing(*_res_candidates)

def _r(*parts: str) -> Path:
    return (RESOURCES_DIR / Path(*parts)).resolve()


def _as_str(p: Path) -> str:
    return str(p)


VOICE_MODEL_DIR = _r('models', 'voice_small')
ASSETS_AUDIO_DIR = _r('assets', 'audio')
ASSETS_NOTES_DIR = _r('assets', 'notes')
GLOBAL_DIR = _r('global')
TEMP_DIR = _r('temp')
DATABASES_DIR = _r('databases')

path_resolver = {
    'voice_model_path': _as_str(VOICE_MODEL_DIR),
    'audio_path': _as_str(ASSETS_AUDIO_DIR),
    'notes_path': _as_str(ASSETS_NOTES_DIR),
    'global_path': _as_str(GLOBAL_DIR),
    'temp_path': _as_str(TEMP_DIR),
    'database_path': _as_str(DATABASES_DIR)
}

if os.getenv('DEBUG_PATHS') == '1':
    try:
        print('[paths.py] APP_ROOT =', APP_ROOT)
        print('[paths.py] RESOURCES_DIR =', RESOURCES_DIR)
        for k, v in path_resolver.items():
            print(f'[paths.py] {k} => {v}')
    except Exception:
        pass