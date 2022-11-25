from json import loads
from pathlib import Path
from typing import Sequence

from std2.pickle.decoder import new_decoder

TOP_LV = Path(__file__).resolve().parent.parent
NPM_DIR = TOP_LV / "node_modules"
ASSETS = TOP_LV / "assets"

TEMPLATES = ASSETS / "templates"

CACHE_DIR = TOP_LV / ".cache"

MD_STYLE = "friendly"

TIMEOUT = 5.0

IMG_LAZY = new_decoder[int](int)(loads((ASSETS / "image_lazy.json").read_text()))
IMG_SIZES = new_decoder[Sequence[int]](Sequence[int])(
    loads((ASSETS / "image_sizes.json").read_text())
)
