from dataclasses import dataclass
from datetime import datetime
from typing import Mapping, Optional


@dataclass(frozen=True)
class _Linguist:
    color: Optional[str] = None


Linguist = Mapping[str, _Linguist]


@dataclass(frozen=True)
class Repo:
    created_at: datetime
    default_branch: str
    description: str
    fork: bool
    forks_count: int
    full_name: str
    language: Optional[str]
    name: str
    stargazers_count: int
    updated_at: datetime
