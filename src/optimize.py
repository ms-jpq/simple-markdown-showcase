from pathlib import Path

from .log import log
from .parse import ParseError, parse


def optimize(path: Path, html: str) -> str:
    try:
        node = parse(html)
    except ParseError:
        log.exception("%s", path)
        raise
    else:
        return str(node)

