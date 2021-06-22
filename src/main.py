from argparse import ArgumentParser, Namespace

from .consts import PAGES
from .github.api import ls
from .j2 import build
from .markdown import css


def _parse_args() -> Namespace:
    parser = ArgumentParser()
    parser.add_argument("user")
    return parser.parse_args()


async def main() -> None:
    args = _parse_args()
    j2 = build(PAGES)
    scss = css()
    colours, repos = await ls(args.user)

