from functools import lru_cache
from json import loads
from pathlib import Path, PurePath
from typing import Any, Mapping, Tuple

from jinja2 import Environment, FileSystemLoader, StrictUndefined
from yaml import safe_load

from .consts import ASSETS, MD_STYLE
from .markdown import render as render_md

_MARKDOWN_DIR = ASSETS / "markdown"
_DATA_DIR = ASSETS / "data"


@lru_cache
def _slurp(base: Path, part: str, *parts: str) -> Tuple[PurePath, str]:
    path = base.joinpath(part, *parts)
    return path, path.read_text()


@lru_cache
def _read_data(path: str, *paths: str) -> Any:
    resoure, raw = _slurp(_DATA_DIR, path, *paths)
    if resoure.suffix in {".yml", ".yaml"}:
        data = safe_load(raw)
    elif resoure.suffix in {".json"}:
        data = loads(raw)
    else:
        raise ValueError(f"Unknown filetype -- {resoure}")
    return data


_render = lru_cache(render_md(MD_STYLE))


def _read_markdown(path: str, *paths: str) -> str:
    _, md = _slurp(_MARKDOWN_DIR, path, *paths)
    return _render(md)


_FILTERS = {"markdown": _render}
_GLOBALS = {"read_data": _read_data, "read_markdown": _read_markdown}


def build(path: PurePath, *paths: PurePath) -> Environment:
    j2 = Environment(
        enable_async=True,
        trim_blocks=True,
        lstrip_blocks=True,
        undefined=StrictUndefined,
        loader=FileSystemLoader((path, *paths), followlinks=True),
    )
    j2.filters = {**_FILTERS, **j2.filters}
    j2.globals = {**_GLOBALS, **j2.globals}
    return j2


async def render(j2: Environment, path: PurePath, env: Mapping[str, Any]) -> str:
    text = await j2.get_template(str(path)).render_async(env)
    return text
