from asyncio import create_task
from asyncio.tasks import gather
from functools import lru_cache
from hashlib import sha256
from http import HTTPStatus
from mimetypes import guess_extension
from os import sep
from pathlib import Path, PurePath, PurePosixPath
from shutil import copy2
from typing import Awaitable, Iterator, Optional
from urllib.error import HTTPError
from urllib.parse import SplitResult, quote, urlsplit, urlunsplit

from PIL.Image import Image, UnidentifiedImageError
from PIL.Image import open as open_i
from std2.asyncio import run_in_executor
from std2.urllib import urlopen

from .consts import ASSETS, DIST_DIR, TIMEOUT
from .log import log
from .parse import Node, ParseError, parse

_IMG_DIR = ASSETS / "images"


@lru_cache
def _guess_type(uri: SplitResult) -> Awaitable[Optional[str]]:
    def cont() -> Optional[str]:
        if uri.scheme in {"http", "https"}:
            src = urlunsplit(uri)
            with urlopen(src, timeout=TIMEOUT) as resp:
                for key, val in resp.getheaders():
                    if key.casefold() == "content-type":
                        mime, _, _ = val.partition(";")
                        ext = guess_extension(mime)
                        return ext
                else:
                    return None
        else:
            return None

    return create_task(run_in_executor(cont))


@lru_cache
def _fetch(uri: SplitResult, path: Path) -> Awaitable[bool]:
    def cont() -> bool:
        if path.is_file():
            return True
        else:
            if uri.scheme in {"http", "https"}:
                src = urlunsplit(uri)
                try:
                    with urlopen(src, timeout=TIMEOUT) as resp:
                        buf = resp.read()
                except HTTPError as e:
                    if e.code in {HTTPStatus.FORBIDDEN}:
                        return False
                    else:
                        log.exception("%s", f"{e} -- {src}")
                        raise
                else:
                    path.write_bytes(buf)
                    return True
            else:
                img_path = _IMG_DIR / uri.path
                if img_path.is_file():
                    copy2(img_path, path)
                    return True
                else:
                    return False

    return create_task(run_in_executor(cont))


@lru_cache
def _resize(img: Image) -> Awaitable[Path]:
    def cont() -> Path:
        return Path()

    return create_task(run_in_executor(cont))


async def _src_set(img: Image) -> str:
    return ""


async def _localize(node: Node) -> None:
    assert node.tag == "img"
    node.attrs["loading"] = "lazy"

    src = node.attrs.get("src")
    if not src:
        raise KeyError(str(node))
    else:
        uri = urlsplit(src)
        ext = PurePosixPath(uri.path).suffix.casefold() or await _guess_type(uri)
        if not ext:
            raise ValueError(uri)
        else:
            hashed_path = PurePath(sha256(src.encode()).hexdigest()).with_suffix(ext)
            new_path = DIST_DIR / hashed_path

            succ = await _fetch(uri, path=new_path)
            if succ:
                with open(new_path, "rb") as fd:
                    try:
                        img: Image = open_i(fd)
                    except UnidentifiedImageError:
                        node.attrs["src"] = quote(str(PurePosixPath(sep) / hashed_path))
                    else:
                        webp_path = hashed_path.with_suffix(".webp")
                        with open(webp_path, "wb") as fd:
                            img.save(fd, format="WEBP")

                        node.attrs["src"] = quote(str(PurePosixPath(sep) / webp_path))
                        node.attrs["width"] = str(img.width)
                        node.attrs["height"] = str(img.height)
                        node.attrs["srcset"] = await _src_set(img)


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

