from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True)
class _Linguist:
    color: str | None = None


Linguist = Mapping[str, _Linguist]


@dataclass(frozen=True)
class Repo:
    archived: bool
    created_at: datetime
    default_branch: str
    description: str | None
    fork: bool
    forks_count: int
    full_name: str
    html_url: str
    language: str | None
    name: str
    stargazers_count: int
    updated_at: datetime


@dataclass(frozen=True)
class Info:
    title: str
    showcase: bool
    images: Sequence[str]


@dataclass(frozen=True)
class RepoInfo:
    repo: Repo
    info: Info
    read_me: str | None
