from argparse import ArgumentParser, Namespace
from asyncio import gather

from std2.asyncio import run_in_executor

from .consts import PAGES
from .github.api import colours, repos
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
    c, r = await gather(run_in_executor(colours), run_in_executor(repos, args.user))

