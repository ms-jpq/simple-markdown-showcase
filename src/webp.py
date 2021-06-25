from concurrent.futures import ProcessPoolExecutor
from hashlib import sha256
from http import HTTPStatus
from locale import strxfrm
from mimetypes import guess_extension
from os import sep
from pathlib import Path, PurePath, PurePosixPath
from shutil import copy2
from typing import Optional, Tuple, TypedDict, cast
from urllib.error import HTTPError
from urllib.parse import SplitResult, quote, urlsplit, urlunsplit

from PIL import ImageFile
from PIL.features import check
from PIL.Image import Image, UnidentifiedImageError
from PIL.Image import open as open_i
from PIL.ImageSequence import Iterator as FrameIter
from std2.urllib import urlopen

from .consts import ASSETS, DIST_DIR, IMG_SIZES, TIMEOUT
from .log import log


class ImageAttrs(TypedDict, total=False):
    src: str
    srcset: str
    width: str
    height: str


_POOL = ProcessPoolExecutor()
_IMG_DIR = ASSETS / "images"

assert check("webp_anim")
ImageFile.LOAD_TRUNCATED_IMAGES = True


def _guess_type(uri: SplitResult) -> Optional[str]:
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


def _fetch(uri: SplitResult, path: Path) -> bool:
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


def _downsize(args: Tuple[Path, int]) -> Tuple[int, Path]:
    path, limit = args
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


def _esc(path: Path) -> str:
    src = quote(str(PurePosixPath(sep) / path.relative_to(DIST_DIR)))
    return src


def _srcset(path: Path) -> str:
    smol = tuple(_POOL.map(_downsize, ((path, limit) for limit in IMG_SIZES)))
    sources = (f"{_esc(p)} {width}w" for width, p in {*smol})
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


def attrs(src: str) -> ImageAttrs:
    uri = urlsplit(src)
    ext = PurePosixPath(uri.path).suffix.casefold() or _guess_type(uri)
    if not ext:
        raise ValueError(uri)
    else:
        sha = sha256(src.encode()).hexdigest()
        path = (DIST_DIR / sha).with_suffix(ext)
        succ = _fetch(uri, path=path)
        src = _esc(path)
        if succ:
            try:
                webp_path, width, height = _POOL.submit(_webp, path).result()
            except UnidentifiedImageError:
                return {"src": src}
            else:
                srcset = _srcset(webp_path)
                return {
                    "src": _esc(webp_path),
                    "width": str(width),
                    "height": str(height),
                    "srcset": srcset,
                }
        else:
            return {"src": src}

