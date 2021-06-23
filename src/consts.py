from pathlib import Path

TOP_LV = Path(__file__).resolve().parent.parent
NPM_DIR = TOP_LV / "node_modules"
ASSETS = TOP_LV / "assets"

TEMPLATES = ASSETS / "templates"
SCSS = ASSETS / "css"

CACHE_DIR = TOP_LV / ".cache"
DIST_DIR = TOP_LV / "dist"


TIMEOUT = 5.0

