from pathlib import Path

TOP_LV = Path(__file__).resolve().parent.parent
NPM_BIN = TOP_LV / "node_modules" / ".bin"
ASSETS = TOP_LV / "assets"

TEMPLATES = ASSETS / "templates"
SCSS = ASSETS / "css"

CACHE_DIR = TOP_LV / ".cache"
DIST_DIR = TOP_LV / "dist"


TIMEOUT = 5.0

