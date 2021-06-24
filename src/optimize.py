from asyncio import create_task
from asyncio.tasks import gather
from functools import lru_cache
from hashlib import sha256
from http import HTTPStatus
from pathlib import Path, PurePosixPath
from shutil import copy2
from typing import Awaitable, Iterator
from urllib.error import HTTPError
from urllib.parse import SplitResult, urlsplit, urlunsplit

from std2.asyncio import run_in_executor
from std2.urllib import urlopen

from .consts import ASSETS, CACHE_DIR, TIMEOUT
from .log import log
from .parse import Node, ParseError, parse

_IMG_DIR = ASSETS / "images"
_IMG_CACHE = CACHE_DIR / "img"


def _fetch(uri: str) -> bytes:
    with urlopen(uri, timeout=TIMEOUT) as resp:
        buf = resp.read()
    return buf


@lru_cache
def _move(uri: SplitResult, cache_path: Path) -> Awaitable[None]:
    def cont() -> None:
        if not cache_path.exists():
            if uri.scheme in {"http", "https"}:
                src = urlunsplit(uri)
                try:
                    buf = _fetch(src)
                    cache_path.write_bytes(buf)
                except HTTPError as e:
                    if e.code in {HTTPStatus.FORBIDDEN}:
                        pass
                    else:
                        log.exception("%s", f"{e} -- {src}")
                else:
                    cache_path.write_bytes(buf)
            else:
                img_path = _IMG_DIR / uri.path
                if img_path.is_file():
                    copy2(img_path, cache_path)

    return create_task(run_in_executor(cont))


async def _localize(node: Node) -> None:
    assert node.tag == "img"
    src = node.attrs.get("src") or ""
    uri = urlsplit(src)

    ext = PurePosixPath(uri.path).suffix.casefold()
    sha = sha256(src.encode()).hexdigest()
    cache_path = (_IMG_CACHE / sha).with_suffix(ext)
    await _move(uri, cache_path=cache_path)


def _optimize(node: Node) -> Iterator[Awaitable[None]]:
    _IMG_CACHE.mkdir(parents=True, exist_ok=True)
    for n in node:
        if isinstance(n, Node):
            if n.tag == "img":
                yield _localize(n)


async def optimize(path: Path, html: str) -> str:
    try:
        node = parse(html)
    except ParseError:
        log.exception("%s", path)
        raise
    else:
        main, *_ = (
            child
            for child in node.children
            if isinstance(child, Node) and child.tag == "html"
        )
        await gather(*_optimize(main))
        return "<!DOCTYPE html>" + str(main)

