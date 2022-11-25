from contextlib import contextmanager
from shutil import get_terminal_size
from typing import Any, Iterator

from std2.locale import si_prefixed_smol
from std2.timeit import timeit as _timeit

from .log import log


@contextmanager
def timeit(label: str, *args: Any) -> Iterator[None]:
    with _timeit() as t:
        yield None
    delta = t().total_seconds()
    time = f"{si_prefixed_smol(delta)}s".ljust(8)
    cols, _ = get_terminal_size()
    msg = f"{label.ljust(10)} -- {time}  " + " ".join(map(str, args)) + " "
    log.info("%s", msg.ljust(cols, "="))

