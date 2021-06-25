from argparse import ArgumentParser, Namespace
from json import dump, loads
from sys import executable, stdout

from std2.asyncio import call

from .reactor import attrs
from .types import ImageAttrs


def _parse_args() -> Namespace:
    parser = ArgumentParser()

    return parser.parse_args()


def main() -> None:
    args = _parse_args()
    img_attrs = attrs(args.src)
    dump(img_attrs, stdout, check_circular=False, ensure_ascii=False)


async def run(src: str) -> ImageAttrs:
    p = await call(executable, "-m", __name__, src, check_returncode=True)
    attrs: ImageAttrs = loads(p.out)
    return attrs

