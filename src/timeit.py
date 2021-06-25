from contextlib import contextmanager
from shutil import get_terminal_size
from typing import Any, Iterator

from std2.timeit import timeit as _timeit
from std2.locale import si_prefixed_smol

from .log import log


@contextmanager
def timeit(label: str, *args: Any) -> Iterator[None]:
    with _timeit() as t:
        yield None
    delta = t()
    time = si_prefixed_smol(delta, precision=3)
    cols, _ = get_terminal_size()
    msg = f"{label.ljust(10)} -- {time}  " + " ".join(map(str, args)) + " "
    log.info("%s", msg.ljust(cols, "="))

