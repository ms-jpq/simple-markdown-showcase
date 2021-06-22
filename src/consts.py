from pathlib import Path

_SRC = Path(__file__).resolve().parent
TOP_LV = _SRC.parent

TEMPLATES = _SRC / "templates"
SCSS = _SRC / "css"

MARKDOWNS = TOP_LV / "markdown"
CACHE_DIR = TOP_LV / ".cache"
DIST_DIR = TOP_LV / "dist"


TIMEOUT = 5.0

