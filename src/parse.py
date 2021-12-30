from __future__ import annotations

from dataclasses import dataclass, field
from html import escape
from html.parser import HTMLParser
from itertools import chain
from locale import strxfrm
from os import linesep
from typing import (
    Iterator,
    MutableMapping,
    MutableSequence,
    Optional,
    Sequence,
    Tuple,
    Union,
)
from weakref import ref

_VOID = {
    "area",
    "base",
    "basefont",
    "bgsound",
    "br",
    "col",
    "command",
    "embed",
    "frame",
    "hr",
    "image",
    "img",
    "input",
    "isindex",
    "keygen",
    "link",
    "menuitem",
    "meta",
    "nextid",
    "param",
    "source",
    "track",
    "wbr",
}


class ParseError(Exception):
    ...


@dataclass
class Node:
    parent: Optional[ref[Node]]
    tag: str
    attrs: MutableMapping[str, Optional[str]] = field(default_factory=dict)
    children: MutableSequence[Union[Node, str]] = field(default_factory=list)

    def __str__(self) -> str:
        attrs = " ".join(
            f'{key}="{escape((self.attrs[key] or ""))}"' if self.attrs[key] else key
            for key in sorted(self.attrs.keys(), key=strxfrm)
        )
        kids = "".join(
            escape(child) if isinstance(child, str) else str(child)
            for child in self.children
        )
        if self.tag in _VOID:
            return f"<{self.tag} {attrs}/>"
        else:
            return f"<{self.tag} {attrs}>{kids}</{self.tag}>"

    def __iter__(self) -> Iterator[Union[Node, str]]:
        yield self
        for child in self.children:
            if isinstance(child, Node):
                yield from child
            else:
                yield child


class _Parser(HTMLParser):
    def __init__(self, root_el: str):
        super().__init__()
        root = Node(parent=None, tag=root_el)
        self._root = root
        self._stack: MutableSequence[Node] = [root]

    def handle_starttag(
        self, tag: str, attrs: Sequence[Tuple[str, Optional[str]]]
    ) -> None:
        if stack := self._stack:
            parent = stack[-1]
            node = Node(parent=ref(parent), tag=tag, attrs=dict(attrs))
            parent.children.append(node)
            stack.append(node)
        else:
            msg = f"Orphan tag -- {tag} :: {attrs}"
            raise ParseError(msg)

    def handle_endtag(self, tag: str) -> None:
        if stack := self._stack:
            node = stack.pop()
            if node.tag != tag:
                msg = (
                    f"Unexpected tag -- {tag}"
                    " :: "
                    f"Excepting -- {node.tag}"
                    f"{linesep}"
                    f"{linesep.join(map(str, chain(self._stack, (node,))))}"
                )
                raise ParseError(msg)
        else:
            msg = f"Orphan tag -- {tag}"
            raise ParseError(msg)

    def handle_data(self, data: str) -> None:
        if stack := self._stack:
            parent = stack[-1]
            parent.children.append(data)
        else:
            msg = f"Orphan textnode -- {data}"
            raise ParseError(msg)

    def consume(self) -> Node:
        return self._root


def parse(html: str) -> Node:
    parser = _Parser(root_el="")
    parser.feed(html)
    node = parser.consume()
    return node

