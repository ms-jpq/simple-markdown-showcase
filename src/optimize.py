from pathlib import Path

from .log import log
from .parse import ParseError, parse

from difflib import unified_diff

def optimize(path: Path, html: str) -> str:
    try:
        node = parse(html)
    except ParseError:
        log.exception("%s", path)
        return html
    else:
        main, *_ = node
        return str(main)

