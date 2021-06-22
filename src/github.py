from asyncio import gather
from datetime import datetime
from http import HTTPStatus
from inspect import isclass
from json import loads
from pathlib import PurePosixPath
from typing import Any, Iterator, MutableSet, Optional, Sequence, Tuple
from urllib.error import HTTPError

from std2.asyncio import run_in_executor
from std2.pickle import decode
from std2.pickle.decoder import DecodeError, Decoders
from std2.urllib import urlopen
from yaml import safe_load

from .consts import TIMEOUT
from .log import log
from .types import Info, Linguist, Repo, RepoInfo

_LINGUIST = "https://raw.githubusercontent.com/github/linguist/master/lib/linguist/languages.yml"
_CONFIG = PurePosixPath("_config.yml")
_README = PurePosixPath("README.md")


def _colours() -> Linguist:
    with urlopen(_LINGUIST, timeout=TIMEOUT) as resp:
        raw = resp.read()
    yaml = safe_load(raw)
    l: Linguist = decode(Linguist, yaml, strict=False)
    return l


def _page(link: str) -> Optional[str]:
    for sections in link.split(","):
        uri, *params = sections.split(";")
        for param in params:
            key, _, value = param.strip().partition("=")
            val = (
                value.removeprefix('"').removesuffix('"')
                if value.startswith('"') and value.endswith('"')
                else value
            )
            if key == "rel" and val == "next":
                return uri.removeprefix("<").removesuffix(">")
    else:
        return None


def _date_decoder(
    tp: Any, thing: Any, strict: bool, decoders: Decoders, path: Sequence[Any]
) -> datetime:
    if not (isclass(tp) and issubclass(tp, datetime) and isinstance(thing, str)):
        raise DecodeError(path=(*path, tp), actual=thing)
    else:
        fmt = "%Y-%m-%dT%H:%M:%S%z"
        return datetime.strptime(thing, fmt)


def _repos(uri: str) -> Iterator[Repo]:
    pages: MutableSet[str] = set()
    with urlopen(uri, timeout=TIMEOUT) as resp:
        raw = resp.read()
        for key, val in resp.getheaders():
            if key.casefold() == "link":
                page = _page(val)
                if page:
                    pages.add(page)

    json = loads(raw)
    repos: Sequence[Repo] = decode(
        Sequence[Repo], json, strict=False, decoders=(_date_decoder,)
    )

    yield from repos
    for page in pages:
        yield from _repos(page)


def _ls_repos(user: str) -> Sequence[Repo]:
    uri = f"https://api.github.com/users/{user}/repos"
    repos = tuple(_repos(uri))
    return repos


def _resource(repo: Repo, path: PurePosixPath) -> Optional[bytes]:
    uri = f"https://raw.githubusercontent.com/{repo.full_name}/{repo.default_branch}/{path}"
    try:
        with urlopen(uri, timeout=TIMEOUT) as resp:
            raw = resp.read()
    except HTTPError as e:
        if e.code == HTTPStatus.NOT_FOUND:
            return None
        else:
            log.exception("%s", e, uri)
            raise
    else:
        return raw


async def _repo_info(repo: Repo) -> RepoInfo:
    raw_info, raw_readme = await gather(
        run_in_executor(_resource, repo, path=_CONFIG),
        run_in_executor(_resource, repo, path=_README),
    )
    info = (
        decode(Info, safe_load(raw_info))
        if raw_info
        else Info(title=repo.name.capitalize(), showcase=False, images=())
    )
    read_me = raw_readme.decode() if raw_readme else None
    ri = RepoInfo(repo=repo, info=info, read_me=read_me)
    return ri


async def ls(user: str) -> Tuple[Linguist, Sequence[RepoInfo]]:
    colours, repos = await gather(
        run_in_executor(_colours), run_in_executor(_ls_repos, user)
    )
    infos = await gather(*map(_repo_info, repos))
    return colours, infos
