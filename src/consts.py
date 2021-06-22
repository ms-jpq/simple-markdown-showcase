from pathlib import Path

_SRC = Path(__file__).resolve().parent
TOP_LV = _SRC.parent
ASSETS = TOP_LV / "assets"

TEMPLATES = ASSETS / "templates"
SCSS = ASSETS / "css"

CACHE_DIR = TOP_LV / ".cache"
DIST_DIR = TOP_LV / "dist"


TIMEOUT = 5.0

