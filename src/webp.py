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


def _downsize(args: Tuple[Image, Path, int]) -> Tuple[int, Path]:
    img, path, limit = args
    existing = (img.width, img.height)
    ratio = limit / max(img.width, img.height)

    desired = tuple(map(lambda l: round(l * ratio), existing))
    width, height = min(desired, existing)

    if desired != existing:
        smol_path = path.with_stem(f"{path.stem}--{width}x{height}")

        smol, *frames = (frame.resize((width, height)) for frame in FrameIter(img))
        smol.save(smol_path, format="WEBP", save_all=True, append_images=frames)

        return width, smol_path.relative_to(DIST_DIR)
    else:
        return width, path.relative_to(DIST_DIR)


def _src_set(img: Image, path: Path) -> str:
    smol = tuple(_POOL.map(_downsize, ((img, path, limit) for limit in IMG_SIZES)))
    sources = (
        f"{quote(str(PurePosixPath(sep) / path))} {width}w" for width, path in {*smol}
    )
    srcset = ", ".join(sorted(sources, key=strxfrm))
    return srcset


def _attrs(src: str) -> ImageAttrs:
    uri = urlsplit(src)
    ext = PurePosixPath(uri.path).suffix.casefold() or _guess_type(uri)
    if not ext:
        raise ValueError(uri)
    else:
        hashed_path = PurePath(sha256(src.encode()).hexdigest()).with_suffix(ext)
        new_path = DIST_DIR / hashed_path

        succ = _fetch(uri, path=new_path)
        if succ:
            try:
                with open_i(new_path) as img:
                    img = cast(Image, img)
                    webp_path = hashed_path.with_suffix(".webp")
                    save_path = DIST_DIR / webp_path

                    frames = (frame.copy() for frame in FrameIter(img))
                    next(frames, None)
                    img.save(
                        save_path, format="WEBP", save_all=True, append_images=frames
                    )

                    srcset = _src_set(img, path=save_path)
                return {
                    "src": quote(str(PurePosixPath(sep) / webp_path)),
                    "width": str(img.width),
                    "height": str(img.height),
                    "srcset": srcset,
                }
            except UnidentifiedImageError:
                return {"src": quote(str(PurePosixPath(sep) / hashed_path))}
        else:
            return {"src": quote(str(PurePosixPath(sep) / hashed_path))}


def attrs(src: str) -> ImageAttrs:
    fut = _POOL.submit(_attrs, src)
    return fut.result()

