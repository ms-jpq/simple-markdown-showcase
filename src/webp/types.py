from typing import TypedDict


class ImageAttrs(TypedDict, total=False):
    src: str
    srcset: str
    width: str
    height: str

