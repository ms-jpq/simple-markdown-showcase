from functools import lru_cache
from pathlib import PurePath
from typing import Any, Mapping

from jinja2 import Environment, FileSystemLoader, StrictUndefined

from .consts import MARKDOWNS
from .markdown import render as render_md

_render = lru_cache(render_md("friendly"))


@lru_cache
def _read_markdown(path: str) -> str:
    resolved = MARKDOWNS / path
    md = resolved.read_text()
    return _render(md)


_FILTERS = {"markdown": _render}
_GLOBALS = {"read_md": _read_markdown}


def build(path: PurePath, *paths: PurePath) -> Environment:
    j2 = Environment(
        enable_async=False,
        trim_blocks=True,
        lstrip_blocks=True,
        undefined=StrictUndefined,
        loader=FileSystemLoader((path, *paths), followlinks=True),
    )
    j2.filters = {**_FILTERS, **j2.filters}
    j2.globals = {**_GLOBALS, **j2.globals}
    return j2


def render(j2: Environment, path: PurePath, env: Mapping[str, Any]) -> str:
    text = j2.get_template(str(path)).render(env)
    return text

