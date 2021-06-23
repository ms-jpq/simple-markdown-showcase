from pathlib import Path

from .log import log
from .parse import Node, ParseError, parse


def optimize(path: Path, html: str) -> str:
    try:
        node = parse(html)
    except ParseError:
        log.exception("%s", path)
        return html
    else:
        main, *_ = (
            child
            for child in node.children
            if isinstance(child, Node) and child.tag == "html"
        )
        return "<!DOCTYPE html>" + str(main)

