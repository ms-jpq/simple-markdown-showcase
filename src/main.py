from argparse import ArgumentParser, Namespace
from asyncio import gather
from json import dumps, loads
from pathlib import PurePath
from typing import Any, Mapping, Sequence, Tuple

from std2.asyncio import call
from std2.pathlib import walk
from std2.pickle import decode, encode
from std2.pickle.coders import BUILTIN_DECODERS, BUILTIN_ENCODERS

from .consts import CACHE_DIR, DIST_DIR, SCSS, TEMPLATES, TOP_LV
from .github import ls
from .j2 import build, render
from .markdown import css
from .types import Linguist, RepoInfo

_GH_CACHE = CACHE_DIR / "github.json"
_CSS = CACHE_DIR / "hl.css"
_PAGES = PurePath("pages")


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
    j2 = build(TEMPLATES)

    if args.cache:
        json = loads(_GH_CACHE.read_text())
        cached: Tuple[Linguist, Sequence[RepoInfo]] = decode(
            Tuple[Linguist, Sequence[RepoInfo]], json, decoders=BUILTIN_DECODERS
        )
        colours, specs = cached
    else:
        colours, specs = await ls(args.user)
        fetched = encode((colours, specs), encoders=BUILTIN_ENCODERS)
        json = dumps(fetched, check_circular=False, ensure_ascii=False, indent=2)
        CACHE_DIR.mkdir(parents=True, exist_ok=True)
        _GH_CACHE.write_text(json)

    await _compile()

    frame: Mapping[PurePath, Mapping[str, Any]] = {
        _PAGES / "404.html": {},
        _PAGES / "about_me.html": {},
        _PAGES / "contact_me.html": {},
        _PAGES / "index.html": {"specs": specs},
    }
    for src, env in frame.items():
        dest = DIST_DIR / src.relative_to(_PAGES)
        html = render(j2, path=src, env=env)
        dest.write_text(html)

    for spec in specs:
        dest = DIST_DIR / spec.repo.full_name / "index.html"
        env = {"spec": spec}
        html = render(j2, path=_PAGES / "repo.html", env=env)
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(html)

