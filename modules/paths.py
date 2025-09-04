from pathlib import Path
from dotenv import load_dotenv

APP_ROOT = Path(__file__).resolve().parents[1]

def _clean(v: str | None) -> str:
    if v is None:
        return ""
    return v.strip().strip('"').strip("'")

def resolve_path(val: str) -> Path:
    raw = _clean(val)
    p = Path(raw)
    if not p.is_absolute():
        p = (APP_ROOT / p).resolve()
    return p

def _as_str(p: Path) -> str:
    return str(p)

resources = Path('resources')

path_resolver = {
    'voice_model_path': _as_str(resolve_path(_as_str(resources / 'models' / 'voice_small'))),
    'audio_path': _as_str(resolve_path(_as_str(resources / 'assets' / 'audio'))),
    'notes_path': _as_str(resolve_path(_as_str(resources / 'assets' / 'notes'))),
    'global_path': _as_str(resolve_path(_as_str(resources / 'global'))),
    'temp_path': _as_str(resolve_path(_as_str(resources / 'temp'))),
    'database_path': _as_str(resolve_path(_as_str(resources / 'databases')))
}