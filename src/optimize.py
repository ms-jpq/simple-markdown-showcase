from asyncio import create_task
from asyncio.tasks import gather
from functools import lru_cache
from hashlib import sha256
from http import HTTPStatus
from os import sep
from pathlib import Path, PurePath, PurePosixPath
from shutil import copy2
from typing import Awaitable, Iterator
from urllib.error import HTTPError
from urllib.parse import SplitResult, urlsplit, urlunsplit

from std2.asyncio import run_in_executor
from std2.urllib import urlopen

from .consts import ASSETS, DIST_DIR, TIMEOUT
from .log import log
from .parse import Node, ParseError, parse

_IMG_DIR = ASSETS / "images"


def _get(uri: str) -> bytes:
    with urlopen(uri, timeout=TIMEOUT) as resp:
        buf = resp.read()
    return buf


@lru_cache
def _fetch(uri: SplitResult, path: Path) -> Awaitable[None]:
    def cont() -> None:
        if not path.exists():
            if uri.scheme in {"http", "https"}:
                src = urlunsplit(uri)
                try:
                    buf = _get(src)
                    path.write_bytes(buf)
                except HTTPError as e:
                    if e.code in {HTTPStatus.FORBIDDEN}:
                        pass
                    else:
                        log.exception("%s", f"{e} -- {src}")
                else:
                    path.write_bytes(buf)
            else:
                img_path = _IMG_DIR / uri.path
                if img_path.is_file():
                    copy2(img_path, path)

    return create_task(run_in_executor(cont))


async def _localize(node: Node) -> None:
    assert node.tag == "img"
    src = node.attrs.get("src")
    if not src:
        raise KeyError(str(node))
    else:
        uri = urlsplit(src)
        ext = PurePosixPath(uri.path).suffix.casefold()
        hashed_path = PurePath(sha256(src.encode()).hexdigest()).with_suffix(ext)
        new_path = DIST_DIR / hashed_path
        await _fetch(uri, path=new_path)

        node.attrs["loading"] = "lazy"
        node.attrs["src"] = str(PurePosixPath(sep) / hashed_path)


def _optimize(node: Node) -> Iterator[Awaitable[None]]:
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

