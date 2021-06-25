from contextlib import contextmanager
from shutil import get_terminal_size
from typing import Any, Iterator

from std2.timeit import timeit as _timeit

from .log import log


@contextmanager
def timeit(label: str, *args: Any) -> Iterator[None]:
    with _timeit() as t:
        yield None
    delta = t()
    cols, _ = get_terminal_size()
    msg = f"{label.ljust(10)} -- {delta}  " + " ".join(args)
    log.info("%s", msg.ljust(cols - len(msg), "="))

