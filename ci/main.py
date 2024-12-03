from datetime import datetime, timezone
from os import environ
from pathlib import Path
from shutil import rmtree
from subprocess import check_call, run
from sys import executable

_TOP_LV = Path(__file__).resolve().parent.parent

_USER = environ["GITHUB_ACTOR"]


def _git_identity(repo: Path) -> None:
    email, username = "ci@ci.ci", "ci[bot]"
    check_call(("git", "-C", repo, "config", "--local", "--", "user.email", email))
    check_call(("git", "-C", repo, "config", "--local", "--", "user.name", username))


def _git_clone(path: Path) -> None:
    if not path.is_dir():
        token = environ["CI_TOKEN"]
        uri = f"https://{_USER}:{token}@github.com/{_USER}/{_USER}.github.io"
        check_call(("git", "clone", "--", uri, path))


def _build(path: Path) -> None:
    for p in path.iterdir():
        if p.name in {".git", ".github", "_config.yml"}:
            pass
        elif p.is_dir():
            rmtree(p)
        else:
            p.unlink(missing_ok=True)

    check_call(
        (executable, "-m", "src", _USER, "--production", "--", path), cwd=_TOP_LV
    )


def _git_push(cwd: Path) -> None:
    proc = run(("git", "-C", cwd, "diff", "--exit-code"))
    if proc.returncode:
        time = datetime.now(tz=timezone.utc).strftime("%Y-%m-%d")
        check_call(("git", "-C", cwd, "add", "."))
        check_call(("git", "-C", cwd, "commit", "--amend", "--message", time))
        check_call(("git", "-C", cwd, "push", "--force"))


def main() -> None:
    cwd = _TOP_LV / "tmp"
    _git_clone(cwd)
    _git_identity(cwd)
    _build(cwd)
    _git_push(cwd)
    print("<> ~~ <>")
