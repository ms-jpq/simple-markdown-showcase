from __future__ import annotations

from dataclasses import dataclass, field
from html import escape
from html.parser import HTMLParser
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
            f'{key}="{escape(self.attrs[key] or "")}"' if self.attrs[key] else key
            for key in sorted(self.attrs.keys(), key=strxfrm)
        )
        opening = f"<{self.tag} {attrs}>"
        closing = f"</{self.tag}>"
        middle = linesep.join(f"  {child}" for child in self.children)
        return f"{opening}{linesep}{middle}{linesep}{closing}"

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
            raise ParseError(f"Orphan tag -- {tag} :: {attrs}")

    def handle_endtag(self, tag: str) -> None:
        if stack := self._stack:
            node = stack.pop()
            if node.tag != tag:
                msg = f"Unexpected tag -- {tag} :: Excepting -- {node.tag}"
                raise ParseError(msg)
        else:
            raise ParseError(f"Orphan tag -- {tag}")

    def handle_data(self, data: str) -> None:
        if stack := self._stack:
            parent = stack[-1]
            parent.children.append(data)
        else:
            raise ParseError(f"Orphan textnode -- {data}")

    def consume(self) -> Node:
        return self._root


def parse(html: str) -> Node:
    parser = _Parser(root_el="div")
    parser.feed(html)
    node = parser.consume()

    return node

