from argparse import ArgumentParser, Namespace
from asyncio import gather, run, to_thread
from dataclasses import asdict
from json import dumps, loads
from locale import strxfrm
from logging import DEBUG, INFO
from os import altsep, environ, getcwd, sep
from os.path import normcase
from pathlib import Path, PurePath
from shutil import copytree
from subprocess import CompletedProcess
from typing import Any, AsyncIterator, Awaitable, Iterable, Iterator, Mapping, Sequence

from std2.asyncio.subprocess import call
from std2.pathlib import walk
from std2.pickle.coders import (
    DEFAULT_DECODERS,
    DEFAULT_ENCODERS,
    iso_date_decoder,
    iso_date_encoder,
)
from std2.pickle.decoder import new_decoder
from std2.pickle.encoder import new_encoder

from .consts import ASSETS, CACHE_DIR, MD_STYLE, NPM_DIR, TEMPLATES, TOP_LV
from .github import ls
from .j2 import build, render
from .log import log
from .markdown import css
from .timeit import timeit
from .types import Linguist, RepoInfo

_TS_DIR = ASSETS / "js"
_CSS_DIR = ASSETS / "css"
_GH_CACHE = CACHE_DIR / "github.json"
_CSS = CACHE_DIR / "hl.css"
_PAGES = PurePath("pages")
_NPM_BIN = NPM_DIR / ".bin"

_FONTS_SRC = NPM_DIR / "@fortawesome" / "fontawesome-free"
_FONTS_CSS = _FONTS_SRC / "css" / "all.css"
_FONTS_DIR = _FONTS_SRC / "webfonts"


async def _compile(verbose: bool, production: bool, dist: Path) -> None:
    env = {**environ, "NODE_ENV": "production"} if production else None

    def c0() -> None:
        dist.mkdir(parents=True, exist_ok=True)
        fonts_dest = dist / "webfonts"
        _CSS.write_text(css(MD_STYLE))
        copytree(_FONTS_DIR, fonts_dest, dirs_exist_ok=True)

    async def c1() -> CompletedProcess[bytes]:
        fut = call(
            _NPM_BIN / "purgecss",
            "--content",
            f"{ASSETS}/**/*.html",
            "--css",
            _FONTS_CSS,
            "--output",
            CACHE_DIR / "font-awesome.css",
            cwd=TOP_LV,
            env=env,
            capture_stdout=False,
            capture_stderr=False,
        )
        _, proc = await gather(to_thread(c0), fut)
        return proc

    def c2() -> Awaitable[CompletedProcess[bytes]]:
        return call(
            _NPM_BIN / "esbuild",
            *(("--log-level=verbose",) if verbose else ()),
            "--bundle",
            *(("--minify",) if production else ()),
            "--format=esm",
            f"--outdir={dist}",
            *walk(_TS_DIR),
            cwd=TOP_LV,
            env=env,
            capture_stdout=False,
            capture_stderr=False,
        )

    def c3() -> Iterator[Awaitable[CompletedProcess[bytes]]]:
        yield call(
            _NPM_BIN / "stylelint",
            "--",
            "**/*.scss",
            cwd=_CSS_DIR,
            capture_stdout=False,
            capture_stderr=False,
        )
        for path in _CSS_DIR.rglob("*.scss"):
            name = normcase(path.relative_to(_CSS_DIR).with_suffix(".css"))
            out = dist / name.replace(altsep or sep, "_")
            out.parent.mkdir(parents=True, exist_ok=True)

            yield call(
                _NPM_BIN / "postcss",
                "--output",
                out,
                "--",
                path,
                cwd=TOP_LV,
                env=env,
                capture_stdout=False,
                capture_stderr=False,
            )

    await gather(c1(), c2())
    await gather(*c3())


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
    colours: Linguist, user: str, specs: Sequence[RepoInfo], dist: Path
) -> Sequence[tuple[Path, str]]:
    j2 = build(TEMPLATES)

    base_env = {"user": user}

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
            "specs": tuple(_splat(colours, spec=spec) for spec in ordered),
        },
    }

    async def cont() -> AsyncIterator[tuple[Path, str]]:
        for src, env in frame.items():
            dest = dist / src.relative_to(_PAGES)
            html = await render(j2, path=src, env=base_env | env)
            yield dest, html

        for spec in specs:
            dest = dist / spec.repo.name / "index.html"
            env = _splat(colours, spec=spec)
            html = await render(j2, path=_PAGES / "repo.html", env=base_env | env)
            yield dest, html

    return [e async for e in cont()]


async def _commit(
    cache: bool, dist: Path, instructions: Iterable[tuple[Path, str]]
) -> None:
    async def go(path: Path, html: str) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)

        if cache:
            path.write_text(html)
        else:
            text = "<!DOCTYPE html>" + html
            path.write_text(text)

    def cont() -> Iterator[Awaitable[None]]:
        for path, html in instructions:
            yield go(path, html=html)

    with timeit("OPTIMIZED"):
        await gather(*cont())

    if not cache:
        with timeit("PRETTY"):
            await call(
                _NPM_BIN / "prettier",
                "--write",
                "--",
                "**/*.html",
                cwd=dist,
                capture_stdout=False,
                capture_stderr=False,
            )


def _parse_args() -> Namespace:
    parser = ArgumentParser()
    parser.add_argument("-v", "--verbose", action="store_true")

    group = parser.add_mutually_exclusive_group()
    group.add_argument("--production", action="store_true")
    group.add_argument("--cache", action="store_true")

    parser.add_argument("user")
    parser.add_argument("dist", type=Path)
    return parser.parse_args()


_CACHE_TYPE = tuple[Linguist, Sequence[RepoInfo]]


async def main() -> None:
    args = _parse_args()
    log.setLevel(DEBUG if args.verbose else INFO)

    dist = Path(args.dist)
    dist = dist if dist.is_absolute() else Path(getcwd()) / dist
    dist.mkdir(parents=True, exist_ok=True)

    with timeit("GITHUB API"):
        if args.cache:
            decode = new_decoder[_CACHE_TYPE](
                _CACHE_TYPE,
                decoders=(*DEFAULT_DECODERS, iso_date_decoder),
            )
            json = loads(_GH_CACHE.read_text())
            cached: _CACHE_TYPE = decode(json)
            colours, specs = cached
        else:
            encode = new_encoder[_CACHE_TYPE](
                _CACHE_TYPE,
                encoders=(*DEFAULT_ENCODERS, iso_date_encoder),
            )
            colours, specs = await ls(args.user)
            fetched = encode((colours, specs))
            json = dumps(fetched, check_circular=False, ensure_ascii=False, indent=2)
            CACHE_DIR.mkdir(parents=True, exist_ok=True)
            _GH_CACHE.write_text(json)

    with timeit("COMPILE"):
        _, instructions = await gather(
            _compile(args.verbose, production=args.production, dist=dist),
            _j2(colours, user=args.user, specs=specs, dist=dist),
        )

    with timeit("COMMIT"):
        await _commit(args.cache, dist=dist, instructions=instructions)


run(main())
