from datetime import datetime, timezone
from os import environ
from pathlib import Path
from shutil import rmtree
from subprocess import check_call, run

_TOP_LV = Path(__file__).resolve().parent.parent


def _git_identity() -> None:
    email = "ci@ci.ci"
    username = "ci-bot"
    check_call(("git", "config", "--global", "user.email", email))
    check_call(("git", "config", "--global", "user.name", username))


def _git_clone(path: Path) -> None:
    if not path.is_dir():
        token = environ["CI_TOKEN"]
        uri = f"https://ms-jpq:{token}@github.com/ms-jpq/ms-jpq.github.io.git"
        check_call(("git", "clone", uri, str(path)))


def _build(path: Path) -> None:
    for p in path.iterdir():
        if p.name in {".git", "_config.yml"}:
            pass
        elif p.is_dir():
            rmtree(p)
        else:
            p.unlink(missing_ok=True)

    check_call(
        ("python3", "-m", "src", "ms-jpq", "--production", "--", path), cwd=_TOP_LV
    )


def _git_push(cwd: Path) -> None:
    proc = run(("git", "diff", "--exit-code"), cwd=cwd)
    if proc.returncode:
        time = datetime.now(tz=timezone.utc).strftime("%Y-%m-%d")
        check_call(("git", "add", "."), cwd=cwd)
        check_call(("git", "commit", "-m", f"update_artifacts: {time}"), cwd=cwd)
        check_call(("git", "push"), cwd=cwd)


def main() -> None:
    cwd = _TOP_LV / "tmp"
    _git_identity()
    _git_clone(cwd)
    _build(cwd)
    _git_push(cwd)
