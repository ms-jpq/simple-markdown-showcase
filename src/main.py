from argparse import ArgumentParser, Namespace
from asyncio import gather
from dataclasses import asdict
from json import dumps, loads
from locale import strxfrm
from os import linesep
from pathlib import Path, PurePath
from shutil import copytree
from subprocess import CalledProcessError
from typing import (
    Any,
    AsyncIterator,
    Awaitable,
    Iterable,
    Iterator,
    Mapping,
    Sequence,
    Tuple,
)

from std2.asyncio import call
from std2.pathlib import walk
from std2.pickle import decode, encode
from std2.pickle.coders import BUILTIN_DECODERS, BUILTIN_ENCODERS

from .consts import ASSETS, CACHE_DIR, DIST_DIR, NPM_DIR, TEMPLATES, TOP_LV
from .github import ls
from .j2 import build, render
from .log import log
from .markdown import css
from .optimize import optimize
from .types import Linguist, RepoInfo

_TS = ASSETS / "js"
_SCSS = ASSETS / "css"
_GH_CACHE = CACHE_DIR / "github.json"
_CSS = CACHE_DIR / "hl.css"
_PAGES = PurePath("pages")
_NPM_BIN = NPM_DIR / ".bin"
_FONTS_SRC = NPM_DIR / "@fortawesome" / "fontawesome-free" / "webfonts"
_FONTS_DEST = DIST_DIR / "webfonts"


async def _compile() -> None:
    DIST_DIR.mkdir(parents=True, exist_ok=True)
    ts_paths = (
        (
            path,
            DIST_DIR / "_".join(path.with_suffix(".js").relative_to(_TS).parts),
        )
        for path in walk(_TS)
    )
    scss_paths = (
        f"{path}:{DIST_DIR / '_'.join(path.with_suffix('.css').relative_to(_SCSS).parts)}"
        for path in walk(_SCSS)
        if not path.name.startswith("_")
    )
    _CSS.write_text(css())
    copytree(_FONTS_SRC, _FONTS_DEST, dirs_exist_ok=True)
    try:
        procs = await gather(
            *(
                call(
                    _NPM_BIN / "esbuild",
                    "--bundle",
                    "--minify",
                    f"--outfile={dest}",
                    str(src),
                    cwd=TOP_LV,
                    check_returncode=True,
                )
                for src, dest in ts_paths
            ),
            call(
                _NPM_BIN / "sass",
                "--load-path",
                str(TOP_LV),
                "--style",
                "compressed",
                *scss_paths,
                cwd=TOP_LV,
                check_returncode=True,
            ),
        )
    except CalledProcessError as e:
        log.exception("%s", f"{e}{linesep}{e.stderr}")
        exit(1)
    else:
        for p in procs:
            if p.err:
                log.warn("%s", p.err)
            print(p.out.decode())


def _splat(colours: Linguist, spec: RepoInfo) -> Mapping[str, Any]:
    colour = colours.get(spec.repo.language or "")
    env = {
        **asdict(spec.info),
        "read_me": spec.read_me,
        "colour": colour,
        **asdict(spec.repo),
    }
    return env


async def _j2(
    colours: Linguist, specs: Sequence[RepoInfo]
) -> Sequence[Tuple[Path, str]]:
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

    async def cont() -> AsyncIterator[Tuple[Path, str]]:
        for src, env in frame.items():
            dest = DIST_DIR / src.relative_to(_PAGES)
            html = await render(j2, path=src, env=env)
            yield dest, html

        for spec in specs:
            dest = DIST_DIR / spec.repo.name / "index.html"
            env = _splat(colours, spec=spec)
            html = await render(j2, path=_PAGES / "repo.html", env=env)
            yield dest, html

    return [e async for e in cont()]


async def _write(instructions: Iterable[Tuple[Path, str]]) -> None:
    async def go(path: Path, html: str) -> None:
        optimized = await optimize(path, html=html)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(optimized)

    def cont() -> Iterator[Awaitable[None]]:
        for path, html in instructions:
            yield go(path, html=html)

    await gather(*cont())


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

    _, instructions = await gather(_compile(), _j2(colours, specs=specs))
    await _write(instructions)

