from pathlib import Path

TOP_LV = Path(__file__).resolve().parent.parent
NPM_DIR = TOP_LV / "node_modules"
ASSETS = TOP_LV / "assets"

TEMPLATES = ASSETS / "templates"

CACHE_DIR = TOP_LV / ".cache"


TIMEOUT = 5.0

IMG_SIZES = (200, 400, 600, 800, 1000)

