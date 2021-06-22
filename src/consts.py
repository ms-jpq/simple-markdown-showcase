from pathlib import Path

_SRC = Path(__file__).resolve().parent
TOP_LV = _SRC.parent

PAGES = _SRC / "pages"
MARKDOWNS = TOP_LV / "markdown"
CACHE_DIR = TOP_LV / ".cache"

TIMEOUT = 5.0

