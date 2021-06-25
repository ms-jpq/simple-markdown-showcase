from asyncio import create_task
from asyncio.tasks import gather
from functools import cache
from hashlib import sha256
from http import HTTPStatus
from locale import strxfrm
from mimetypes import guess_extension
from os import sep
from pathlib import Path, PurePath, PurePosixPath
from shutil import copy2
from typing import Awaitable, Iterator, Optional, Tuple, cast
from urllib.error import HTTPError
from urllib.parse import SplitResult, quote, urlsplit, urlunsplit

from PIL import ImageFile
from PIL.features import check
from PIL.Image import Image, UnidentifiedImageError
from PIL.Image import open as open_i
from PIL.ImageSequence import Iterator as FrameIter
from std2.asyncio import run_in_executor
from std2.urllib import urlopen

from .consts import ASSETS, DIST_DIR, IMG_SIZES, TIMEOUT
from .log import log
from .parse import Node, ParseError, parse
from .timeit import timeit

_IMG_DIR = ASSETS / "images"

assert check("webp_anim")
ImageFile.LOAD_TRUNCATED_IMAGES = True


async def _guess_type(uri: SplitResult) -> Optional[str]:
    if uri.scheme in {"http", "https"}:
        src = urlunsplit(uri)

        def cont() -> Optional[str]:
            with urlopen(src, timeout=TIMEOUT) as resp:
                for key, val in resp.getheaders():
                    if key.casefold() == "content-type":
                        mime, _, _ = val.partition(";")
                        ext = guess_extension(mime)
                        return ext
                else:
                    return None

        return await run_in_executor(cont)
    else:
        return None


async def _fetch(uri: SplitResult, path: Path) -> bool:
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
                    if e.code in {HTTPStatus.FORBIDDEN, 404}:
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

    return await run_in_executor(cont)





def _downsize(img: Image, path: Path, limit: int) -> Awaitable[Tuple[int, Path]]:
    def cont() -> Tuple[int, Path]:
        existing = (img.width, img.height)
        ratio = limit / max(img.width, img.height)

        desired = tuple(map(lambda l: round(l * ratio), existing))
        width, height = min(desired, existing)

        if desired != existing:
            smol_path = path.with_stem(f"{path.stem}--{width}x{height}")
            smol = img.resize((width, height))

            frames = (frame.resize((width, height)) for frame in FrameIter(img))
            next(frames, None)
            smol.save(smol_path, format="WEBP", save_all=True, append_images=frames)

            return width, smol_path.relative_to(DIST_DIR)
        else:
            return width, path.relative_to(DIST_DIR)

    return run_in_executor(cont)


async def _src_set(img: Image, path: Path) -> str:
    smol = await gather(
        *(_downsize(img, path=path, limit=limit) for limit in IMG_SIZES)
    )
    sources = (
        f"{quote(str(PurePosixPath(sep) / path))} {width}w" for width, path in {*smol}
    )
    srcset = ", ".join(sorted(sources, key=strxfrm))
    return srcset


@cache
def _magic(
    src: str,
) -> Awaitable[Tuple[PurePath, Optional[Tuple[Tuple[int, int], str]]]]:
    async def cont() -> Tuple[PurePath, Optional[Tuple[Tuple[int, int], str]]]:
        uri = urlsplit(src)
        ext = PurePosixPath(uri.path).suffix.casefold() or await _guess_type(uri)
        if not ext:
            raise ValueError(uri)
        else:
            hashed_path = PurePath(sha256(src.encode()).hexdigest()).with_suffix(ext)
            new_path = DIST_DIR / hashed_path

            succ = await _fetch(uri, path=new_path)
            if succ:
                try:
                    with open_i(new_path) as img:
                        img = cast(Image, img)
                        webp_path = hashed_path.with_suffix(".webp")
                        save_path = DIST_DIR / webp_path

                        frames = (frame.copy() for frame in FrameIter(img))
                        next(frames, None)
                        img.save(save_path, format="WEBP", save_all=True, append_images=frames)

                        srcset = await _src_set(img, path=save_path)
                        return webp_path, ((img.width, img.height), srcset)
                except UnidentifiedImageError:
                    return hashed_path, None
            else:
                return hashed_path, None

    return create_task(cont())


async def _localize(node: Node) -> None:
    assert node.tag == "img"
    node.attrs["loading"] = "lazy"

    src = node.attrs.get("src")
    if not src:
        raise KeyError(str(node))
    else:
        with timeit("WEBP", src):
            path, attrs = await _magic(src)
        node.attrs["src"] = quote(str(PurePosixPath(sep) / path))
        if attrs:
            (width, height), srcset = attrs
            node.attrs["width"] = str(width)
            node.attrs["height"] = str(height)
            node.attrs["srcset"] = srcset


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

