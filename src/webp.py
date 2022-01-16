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

from PIL import ImageFile, UnidentifiedImageError
from PIL.features import check
from PIL.Image import Image
from PIL.Image import open as open_i
from PIL.ImageSequence import Iterator as FrameIter
from std2.asyncio import run_in_executor
from std2.urllib import urlopen

from .consts import ASSETS, IMG_SIZES, TIMEOUT
from .log import log

assert check("webp_anim")
ImageFile.LOAD_TRUNCATED_IMAGES = True


class ImageAttrs(TypedDict, total=False):
    src: str
    srcset: str
    width: str
    height: str


_IMG_DIR = ASSETS / "images"


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


async def _fetch(cache: bool, uri: SplitResult, path: Path) -> bool:
    def cont() -> bool:
        if cache and path.is_file():
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

    return await run_in_executor(cont)


def _esc(dist: Path, path: Path) -> str:
    src = quote(str(PurePosixPath(sep) / path.relative_to(dist)))
    return src


def _downsize(cache: bool, path: Path, limit: int) -> Tuple[int, Path]:
    with open_i(path) as img:
        img = cast(Image, img)
        existing = (img.width, img.height)
        ratio = limit / max(img.width, img.height)

        desired = tuple(map(lambda l: round(l * ratio), existing))
        width, height = min(desired, existing)

        if desired != existing:
            suffixes = "".join(path.suffixes)
            smol_path = path.with_name(f"{path.stem}--{width}x{height}{suffixes}")

            if cache and smol_path.exists():
                pass
            else:
                smol, *frames = (
                    frame.resize((width, height)) for frame in FrameIter(img)
                )
                smol.save(smol_path, format="WEBP", save_all=True, append_images=frames)

            return width, smol_path
        else:
            return width, path


async def _srcset(pool: Executor, cache: bool, dist: Path, path: Path) -> str:
    loop = get_event_loop()
    smol = await gather(
        *(
            loop.run_in_executor(pool, _downsize, cache, path, limit)
            for limit in IMG_SIZES
        )
    )
    sources = (f"{_esc(dist, path=p)} {width}w" for width, p in {*smol})
    srcset = ", ".join(sorted(sources, key=strxfrm))
    return srcset


def _webp(cache: bool, path: Path) -> Tuple[Path, int, int]:
    dest = path.with_suffix(".webp")
    with open_i(path) as img:
        img = cast(Image, img)
        if cache and dest.exists():
            pass
        else:
            frames = (frame.copy() for frame in FrameIter(img))
            next(frames, None)
            img.save(dest, format="WEBP", save_all=True, append_images=frames)

        return dest, img.width, img.height


async def attrs(pool: Executor, cache: bool, dist: Path, src: str) -> ImageAttrs:
    loop = get_event_loop()
    uri = urlsplit(src)
    ext = PurePosixPath(uri.path).suffix.casefold() or await _guess_type(uri)
    if not ext:
        raise ValueError(uri)
    else:
        sha = sha256(src.encode()).hexdigest()
        path = (dist / sha).with_suffix(ext)
        src = _esc(dist, path=path)
        succ = await _fetch(cache, uri=uri, path=path)
        if succ:
            try:
                webp_path, width, height = await loop.run_in_executor(
                    pool, _webp, cache, path
                )
                srcset = await _srcset(pool, cache=cache, dist=dist, path=webp_path)
                return {
                    "src": _esc(dist, path=webp_path),
                    "width": str(width),
                    "height": str(height),
                    "srcset": srcset,
                }
            except (UnidentifiedImageError, OSError) as e:
                log.error("%s", f"{src} --> {e}")
                return {"src": src}
        else:
            return {"src": src}
