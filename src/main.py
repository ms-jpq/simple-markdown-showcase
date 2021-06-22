from argparse import ArgumentParser, Namespace
from asyncio import gather
from json import dumps, loads
from typing import Sequence, Tuple

from std2.asyncio import call
from std2.pathlib import walk
from std2.pickle import decode, encode
from std2.pickle.coders import BUILTIN_DECODERS, BUILTIN_ENCODERS

from .consts import CACHE_DIR, DIST_DIR, PAGES, SCSS, TOP_LV
from .github.api import ls
from .github.types import Linguist, RepoInfo
from .j2 import build
from .markdown import css

_GH_CACHE = CACHE_DIR / "github.json"
_CSS = CACHE_DIR / "hl.css"


async def _compile() -> None:
    DIST_DIR.mkdir(parents=True, exist_ok=True)
    scss_paths = (
        f"{path}:{DIST_DIR / path.relative_to(SCSS)}"
        for path in walk(SCSS)
        if not path.name.startswith("_")
    )
    scss = css()
    _CSS.write_text(scss)
    await gather(call("tsc", cwd=TOP_LV), call("sass", *scss_paths, cwd=TOP_LV))


def _parse_args() -> Namespace:
    parser = ArgumentParser()
    parser.add_argument("--cache", action="store_true")
    parser.add_argument("user")
    return parser.parse_args()


async def main() -> None:
    args = _parse_args()
    j2 = build(PAGES)

    if args.cache:
        json = loads(_GH_CACHE.read_text())
        cached: Tuple[Linguist, Sequence[RepoInfo]] = decode(
            Tuple[Linguist, Sequence[RepoInfo]], json, decoders=BUILTIN_DECODERS
        )
        colours, repos = cached
    else:
        colours, repos = await ls(args.user)
        fetched = encode((colours, repos), encoders=BUILTIN_ENCODERS)
        json = dumps(fetched, check_circular=False, ensure_ascii=False, indent=2)
        CACHE_DIR.mkdir(parents=True, exist_ok=True)
        _GH_CACHE.write_text(json)

    await _compile()

    print(len(repos))

