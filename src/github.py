from asyncio import gather, to_thread
from datetime import datetime
from http import HTTPStatus
from json import loads
from pathlib import PurePosixPath
from typing import Any, Iterator, MutableSet, Optional, Sequence
from urllib.error import HTTPError

from std2.pickle.coders import DEFAULT_DECODERS
from std2.pickle.decoder import new_decoder
from std2.pickle.types import DecodeError, Decoder, DParser, DStep
from std2.string import removeprefix, removesuffix
from std2.urllib import urlopen
from yaml import safe_load

from .consts import TIMEOUT
from .log import log
from .types import Info, Linguist, Repo, RepoInfo

_LINGUIST = "https://raw.githubusercontent.com/github/linguist/master/lib/linguist/languages.yml"
_CONFIG = PurePosixPath("_config.yml")
_README = PurePosixPath("README.md")


def _colours() -> Linguist:
    decode = new_decoder[Linguist](Linguist, strict=False)
    with urlopen(_LINGUIST, timeout=TIMEOUT) as resp:
        raw = resp.read()
    yaml = safe_load(raw)
    l = decode(yaml)
    return l


def _page(link: str) -> Optional[str]:
    for sections in link.split(","):
        uri, *params = sections.split(";")
        for param in params:
            key, _, value = param.strip().partition("=")
            val = (
                removesuffix(removeprefix(value, '"'), '"')
                if value.startswith('"') and value.endswith('"')
                else value
            )
            if key == "rel" and val == "next":
                return removesuffix(removeprefix(uri, "<"), ">")
    else:
        return None


def _date_decoder(
    tp: Any, path: Sequence[Any], strict: bool, decoders: Sequence[Decoder]
) -> Optional[DParser]:
    if not issubclass(tp, datetime):
        return None
    else:

        def cont(thing: Any) -> DStep:
            if not isinstance(thing, str):
                return False, DecodeError(path=(*path, tp), actual=thing)
            else:
                fmt = "%Y-%m-%dT%H:%M:%S%z"
                return True, datetime.strptime(thing, fmt)

        return cont


def _repos(uri: str) -> Iterator[Repo]:
    pages: MutableSet[str] = set()
    with urlopen(uri, timeout=TIMEOUT) as resp:
        raw = resp.read()
        for key, val in resp.getheaders():
            if key.casefold() == "link":
                page = _page(val)
                if page:
                    pages.add(page)

    decode = new_decoder[Sequence[Repo]](
        Sequence[Repo],
        strict=False,
        decoders=(*DEFAULT_DECODERS, _date_decoder),
    )
    json = loads(raw)
    repos = decode(json)

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
    decode = new_decoder[Info](Info)
    raw_info, raw_readme = await gather(
        to_thread(_resource, repo, path=_CONFIG),
        to_thread(_resource, repo, path=_README),
    )
    info = (
        decode(safe_load(raw_info))
        if raw_info
        else Info(title=repo.name.capitalize(), showcase=False, images=())
    )
    read_me = raw_readme.decode() if raw_readme else None
    ri = RepoInfo(repo=repo, info=info, read_me=read_me)
    return ri


async def ls(user: str) -> tuple[Linguist, Sequence[RepoInfo]]:
    colours, repos = await gather(to_thread(_colours), to_thread(_ls_repos, user))
    infos = await gather(*(_repo_info(repo) for repo in repos if not repo.archived))
    show = tuple(info for info in infos if info.info.showcase)
    return colours, show
