from argparse import ArgumentParser, Namespace
from asyncio import gather
from concurrent.futures import ProcessPoolExecutor
from dataclasses import asdict
from json import dumps, loads
from locale import strxfrm
from logging import DEBUG, INFO
from os import environ
from pathlib import Path, PurePath
from shutil import copytree
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

from std2.asyncio import run_in_executor
from std2.asyncio.subprocess import ProcReturn, call
from std2.pathlib import walk
from std2.pickle import new_decoder, new_encoder
from std2.pickle.coders import (
    DEFAULT_DECODERS,
    DEFAULT_ENCODERS,
    iso_date_decoder,
    iso_date_encoder,
)

from .consts import ASSETS, CACHE_DIR, MD_STYLE, NPM_DIR, TEMPLATES, TOP_LV
from .github import ls
from .j2 import build, render
from .log import log
from .markdown import css
from .optimize import optimize
from .timeit import timeit
from .types import Linguist, RepoInfo

_TS_DIR = ASSETS / "js"
_CSS_DIR = ASSETS / "css"
_GH_CACHE = CACHE_DIR / "github.json"
_CSS = CACHE_DIR / "hl.css"
_PAGES = PurePath("pages")
_NPM_BIN = NPM_DIR / ".bin"
_FONTS_SRC = NPM_DIR / "@fortawesome" / "fontawesome-free" / "webfonts"


async def _compile(verbose: bool, production: bool, dist: Path) -> None:
    env = {**environ, "NODE_ENV": "production"} if production else None

    def c1() -> None:
        dist.mkdir(parents=True, exist_ok=True)
        fonts_dest = dist / "webfonts"
        _CSS.write_text(css(MD_STYLE))
        copytree(_FONTS_SRC, fonts_dest, dirs_exist_ok=True)

    def c2() -> Awaitable[ProcReturn]:
        js = dist / "js"
        return call(
            _NPM_BIN / "esbuild",
            *(("--log-level=verbose",) if verbose else ()),
            "--bundle",
            *(("--minify",) if production else ()),
            f"--outdir={js}",
            *walk(_TS_DIR),
            cwd=TOP_LV,
            env=env,
            capture_stdout=False,
            capture_stderr=False,
        )

    def c3() -> Iterator[Awaitable[ProcReturn]]:
        css = dist / "css"
        for path in (_CSS_DIR / "markdown.scss",):
            out = css / path.relative_to(_CSS_DIR).with_suffix(".css")
            out.parent.mkdir(parents=True, exist_ok=True)

            yield call(
                _NPM_BIN / "tailwindcss",
                "--postcss",
                "--input",
                path,
                "--output",
                out,
                cwd=TOP_LV,
                env=env,
                capture_stdout=False,
                capture_stderr=False,
            )

    await gather(
        run_in_executor(c1),
        c2(),
        *c3(),
    )


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
    colours: Linguist, specs: Sequence[RepoInfo], dist: Path
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
            dest = dist / src.relative_to(_PAGES)
            html = await render(j2, path=src, env=env)
            yield dest, html

        for spec in specs:
            dest = dist / spec.repo.name / "index.html"
            env = _splat(colours, spec=spec)
            html = await render(j2, path=_PAGES / "repo.html", env=env)
            yield dest, html

    return [e async for e in cont()]


async def _commit(
    cache: bool, dist: Path, instructions: Iterable[Tuple[Path, str]]
) -> None:
    with ProcessPoolExecutor() as pool:

        async def go(path: Path, html: str) -> None:
            with timeit("OPTIMIZE", path.relative_to(dist)):
                optimized = await optimize(
                    pool, cache=cache, dist=dist, path=path, html=html
                )

            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(optimized)

        def cont() -> Iterator[Awaitable[None]]:
            for path, html in instructions:
                yield go(path, html=html)

        with timeit("OPTIMIZED"):
            await gather(*cont())


def _parse_args() -> Namespace:
    parser = ArgumentParser()
    parser.add_argument("-v", "--verbose", action="store_true")

    group = parser.add_mutually_exclusive_group()
    group.add_argument("--production", action="store_true")
    group.add_argument("--cache", action="store_true")

    parser.add_argument("user")
    parser.add_argument("dist", type=Path)
    return parser.parse_args()


_CACHE_TYPE = Tuple[Linguist, Sequence[RepoInfo]]


async def main() -> None:
    args = _parse_args()
    log.setLevel(DEBUG if args.verbose else INFO)

    dist = Path(args.dist)

    with timeit("GITHUB API"):
        if args.cache:
            decode = new_decoder(
                _CACHE_TYPE, decoders=(*DEFAULT_DECODERS, iso_date_decoder)
            )
            json = loads(_GH_CACHE.read_text())
            cached: _CACHE_TYPE = decode(json)
            colours, specs = cached
        else:
            encode = new_encoder(
                _CACHE_TYPE, encoders=(*DEFAULT_ENCODERS, iso_date_encoder)
            )
            colours, specs = await ls(args.user)
            fetched = encode((colours, specs))
            json = dumps(fetched, check_circular=False, ensure_ascii=False, indent=2)
            CACHE_DIR.mkdir(parents=True, exist_ok=True)
            _GH_CACHE.write_text(json)

    with timeit("COMPILE"):
        _, instructions = await gather(
            _compile(args.verbose, production=args.production, dist=dist),
            _j2(colours, specs=specs, dist=dist),
        )

    with timeit("COMMIT"):
        await _commit(args.cache, dist=dist, instructions=instructions)
