from dataclasses import dataclass
from typing import AbstractSet

from .github.types import Repo


@dataclass(frozen=True)
class Info:
    title: str
    showcase: str
    images: AbstractSet[str]


@dataclass(frozen=True)
class RepoInfo:
    repo: Repo
    info: Info

