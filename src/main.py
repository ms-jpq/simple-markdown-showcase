from argparse import ArgumentParser, Namespace
from asyncio import gather
from dataclasses import asdict
from json import dumps, loads
from locale import strxfrm
from os import linesep
from pathlib import PurePath
from subprocess import CalledProcessError
from typing import Any, Mapping, Sequence, Tuple

from std2.asyncio import call
from std2.pathlib import walk
from std2.pickle import decode, encode
from std2.pickle.coders import BUILTIN_DECODERS, BUILTIN_ENCODERS

from .consts import CACHE_DIR, DIST_DIR, NPM_BIN, SCSS, TEMPLATES, TOP_LV
from .github import ls
from .j2 import build, render
from .log import log
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
    try:
        await gather(
            call(NPM_BIN / "tsc", cwd=TOP_LV, check_returncode=True),
            call(NPM_BIN / "sass", *scss_paths, cwd=TOP_LV, check_returncode=True),
        )
    except CalledProcessError as e:
        log.exception("%s", f"{e}{linesep}{e.stderr}")
        exit(1)


def _splat(colours: Linguist, spec: RepoInfo) -> Mapping[str, Any]:
    colour = colours.get(spec.repo.language or "")
    env = {
        **asdict(spec.info),
        "read_me": spec.read_me,
        "colour": colour,
        **asdict(spec.repo),
    }
    return env


def _j2(colours: Linguist, specs: Sequence[RepoInfo]) -> None:
    j2 = build(TEMPLATES)
    ordered = sorted(
        specs,
        key=lambda s: (
            s.repo.stargazers_count,
            s.repo.forks_count,
            s.repo.updated_at,
            s.repo.created_at,
            strxfrm(s.repo.name),
        ),
        reverse=True,
    )
    frame: Mapping[PurePath, Mapping[str, Any]] = {
        _PAGES / "404.html": {},
        _PAGES / "about_me.html": {},
        _PAGES / "contact_me.html": {},
        _PAGES
        / "index.html": {
            "specs": tuple(_splat(colours, spec=spec) for spec in ordered)
        },
    }
    for src, env in frame.items():
        dest = DIST_DIR / src.relative_to(_PAGES)
        html = render(j2, path=src, env=env)
        dest.write_text(html)

    for spec in specs:
        dest = DIST_DIR / spec.repo.name / "index.html"
        env = _splat(colours, spec=spec)
        html = render(j2, path=_PAGES / "repo.html", env=env)
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(html)


def _parse_args() -> Namespace:
    parser = ArgumentParser()
    parser.add_argument("--cache", action="store_true")
    parser.add_argument("user")
    return parser.parse_args()


async def main() -> None:
    args = _parse_args()

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
    _j2(colours, specs=specs)

