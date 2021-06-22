from pathlib import Path

_SRC = Path(__file__).resolve().parent
_TOP_LV = _SRC.parent

PAGES = _SRC / "pages"
MARKDOWNS = _TOP_LV / "markdown"

TIMEOUT = 1.0

