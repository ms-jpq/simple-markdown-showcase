from asyncio import create_task
from asyncio.tasks import gather
from functools import lru_cache
from hashlib import sha256
from http import HTTPStatus
from pathlib import Path, PosixPath
from tempfile import NamedTemporaryFile
from typing import Awaitable, Iterator
from urllib.error import HTTPError
from urllib.parse import urlsplit

from std2.asyncio import run_in_executor
from std2.urllib import urlopen

from .consts import CACHE_DIR, TIMEOUT
from .log import log
from .parse import Node, ParseError, parse

_IMG_CACHE = CACHE_DIR / "img"


@lru_cache
def _fetch(uri: str) -> Awaitable[bytes]:
    def cont() -> bytes:
        with urlopen(uri, timeout=TIMEOUT) as resp:
            buf = resp.read()
        return buf

    return create_task(run_in_executor(cont))


async def _localize(node: Node) -> None:
    assert node.tag == "img"
    src = node.attrs.get("src")

    if src and src.startswith("http"):
        ext = PosixPath(urlsplit(src).path).suffix.casefold()
        sha = sha256(src.encode()).hexdigest()
        name = Path(sha).with_suffix(ext)
        path = _IMG_CACHE / name

        if not path.exists():
            try:
                buf = await _fetch(src)
                path.write_bytes(buf)
            except HTTPError as e:
                if e.code == HTTPStatus.FORBIDDEN:
                    pass
                else:
                    log.exception("%s", f"{e} -- {src}")
            else:
                with NamedTemporaryFile() as ntf:
                    ntf.write(buf)
                    ntf.flush()
                    Path(ntf.name).write_bytes(buf)


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

