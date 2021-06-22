from pathlib import Path, PurePath
from typing import Any, Mapping

from jinja2 import Environment, FileSystemLoader, StrictUndefined


def build(path: Path, *paths: Path) -> Environment:
    j2 = Environment(
        enable_async=False,
        trim_blocks=True,
        lstrip_blocks=True,
        undefined=StrictUndefined,
        loader=FileSystemLoader((path, *paths), followlinks=True),
    )
    return j2


def render(j2: Environment, path: PurePath, env: Mapping[str, Any]) -> str:
    text = j2.get_template(str(path)).render(env)
    return text

