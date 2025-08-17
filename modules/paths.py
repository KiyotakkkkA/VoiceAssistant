from pathlib import Path
from dotenv import load_dotenv
import os

APP_ROOT = Path(__file__).resolve().parents[1]
ENV_FILE = APP_ROOT / '.env'

if ENV_FILE.exists():
    load_dotenv(ENV_FILE)

def _clean(v: str | None) -> str | None:
    if v is None:
        return None
    return v.strip().strip('"').strip("'")

def resolve_path(val: str | None, default_rel: str) -> Path:
    raw = _clean(val)
    if raw:
        p = Path(raw)
    else:
        p = APP_ROOT / default_rel
    if not p.is_absolute():
        p = (APP_ROOT / p).resolve()
    return p

def _as_str(p: Path) -> str:
    return str(p)

resources = Path('resources')

path_resolver = {
    'voice_model_path': _as_str(resolve_path(os.getenv('VOICE_RECOGNITION_MODEL_DIR_PATH'), _as_str(resources / 'models' / 'voice_small'))),
    'cl_datasets_path': _as_str(resolve_path(os.getenv('TEXT_CLASSIFICATION_DATASETS_DIR_PATH'), _as_str(resources / 'datasets'))),
    'cl_model_path': _as_str(resolve_path(os.getenv('TEXT_CLASSIFICATION_MODEL_DIR_PATH'), _as_str(resources / 'temp'))),
    'yaml_configs_path': _as_str(resolve_path(os.getenv('PATH_TO_YAML_CONFIGS_DIR'), _as_str(resources / 'configs'))),
    'templates_path': _as_str(resolve_path(os.getenv('PATH_TO_TEMPLATES_DIR_PATH'), _as_str(resources / 'assets' / 'templates'))),
    'audio_path': _as_str(resolve_path(os.getenv('PATH_TO_AUDIO_DIR'), _as_str(resources / 'assets' / 'audio'))),
    'global_path': _as_str(resolve_path(os.getenv('PATH_TO_GLOBALS_DIR'), _as_str(resources / 'global'))),
    'new_projects_path': _as_str(resolve_path(os.getenv('PATH_TO_NEW_PROJECTS_DIR'), 'DESKTOP')),
}