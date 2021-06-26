from asyncio import gather, get_event_loop
from concurrent.futures import Executor
from hashlib import sha256
from http import HTTPStatus
from locale import strxfrm
from mimetypes import guess_extension
from os import sep
from pathlib import Path, PurePosixPath
from shutil import copy2
from typing import Optional, Tuple, TypedDict, cast
from urllib.error import HTTPError
from urllib.parse import SplitResult, quote, urlsplit, urlunsplit

from PIL import ImageFile
from PIL.features import check
from PIL.Image import Image, UnidentifiedImageError
from PIL.Image import open as open_i
from PIL.ImageSequence import Iterator as FrameIter
from std2.asyncio import run_in_executor
from std2.urllib import urlopen

from .consts import ASSETS, IMG_SIZES, TIMEOUT
from .log import log


class ImageAttrs(TypedDict, total=False):
    src: str
    srcset: str
    width: str
    height: str


_IMG_DIR = ASSETS / "images"

assert check("webp_anim")
ImageFile.LOAD_TRUNCATED_IMAGES = True


async def _guess_type(uri: SplitResult) -> Optional[str]:
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

    return await run_in_executor(cont)


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


def _esc(dist: Path, path: Path) -> str:
    src = quote(str(PurePosixPath(sep) / path.relative_to(dist)))
    return src


def _downsize(path: Path, limit: int) -> Tuple[int, Path]:
    with open_i(path) as img:
        img = cast(Image, img)
        existing = (img.width, img.height)
        ratio = limit / max(img.width, img.height)

        desired = tuple(map(lambda l: round(l * ratio), existing))
        width, height = min(desired, existing)

        if desired != existing:
            smol_path = path.with_stem(f"{path.stem}--{width}x{height}")

            smol, *frames = (frame.resize((width, height)) for frame in FrameIter(img))
            smol.save(smol_path, format="WEBP", save_all=True, append_images=frames)

            return width, smol_path
        else:
            return width, path


async def _srcset(pool: Executor, dist: Path, path: Path) -> str:
    loop = get_event_loop()
    smol = await gather(
        *(loop.run_in_executor(pool, _downsize, path, limit) for limit in IMG_SIZES)
    )
    sources = (f"{_esc(dist, path=p)} {width}w" for width, p in {*smol})
    srcset = ", ".join(sorted(sources, key=strxfrm))
    return srcset


def _webp(path: Path) -> Tuple[Path, int, int]:
    with open_i(path) as img:
        img = cast(Image, img)
        dest = path.with_suffix(".webp")
        frames = (frame.copy() for frame in FrameIter(img))
        next(frames, None)
        img.save(dest, format="WEBP", save_all=True, append_images=frames)
        return dest, img.width, img.height


async def attrs(pool: Executor, dist: Path, src: str) -> ImageAttrs:
    loop = get_event_loop()
    uri = urlsplit(src)
    ext = PurePosixPath(uri.path).suffix.casefold() or await _guess_type(uri)
    if not ext:
        raise ValueError(uri)
    else:
        sha = sha256(src.encode()).hexdigest()
        path = (dist / sha).with_suffix(ext)
        src = _esc(dist, path=path)
        succ = await _fetch(uri, path=path)
        if succ:
            try:
                webp_path, width, height = await loop.run_in_executor(pool, _webp, path)
            except UnidentifiedImageError:
                return {"src": src}
            else:
                srcset = await _srcset(pool, dist=dist, path=webp_path)
                return {
                    "src": _esc(dist, path=webp_path),
                    "width": str(width),
                    "height": str(height),
                    "srcset": srcset,
                }
        else:
            return {"src": src}

