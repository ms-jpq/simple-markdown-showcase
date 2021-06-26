from asyncio import create_task
from asyncio.tasks import gather
from concurrent.futures import Executor
from functools import cache
from pathlib import Path
from typing import Awaitable, Iterator, Mapping, cast

from .log import log
from .parse import Node, ParseError, parse
from .timeit import timeit
from .webp import ImageAttrs, attrs


@cache
def _run(pool: Executor, cache: bool, dist: Path, src: str) -> Awaitable[ImageAttrs]:
    return create_task(attrs(pool, cache=cache, dist=dist, src=src))


async def _localize(pool: Executor, cache: bool, dist: Path, node: Node) -> None:
    assert node.tag == "img"
    node.attrs["loading"] = "lazy"

    src = node.attrs.get("src")
    if not src:
        raise KeyError(str(node))
    else:
        with timeit("WEBP", src):
            attrs = await _run(pool, cache=cache, dist=dist, src=src)
        node.attrs.update(cast(Mapping[str, str], attrs))


def _optimize(
    pool: Executor, cache: bool, dist: Path, node: Node
) -> Iterator[Awaitable[None]]:
    for n in node:
        if isinstance(n, Node):
            if n.tag == "img":
                yield _localize(pool, cache=cache, dist=dist, node=n)


async def optimize(
    pool: Executor, cache: bool, dist: Path, path: Path, html: str
) -> str:
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
        await gather(*_optimize(pool, cache=cache, dist=dist, node=main))
        return "<!DOCTYPE html>" + str(main)

