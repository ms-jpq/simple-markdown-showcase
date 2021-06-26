from datetime import datetime, timezone
from os import environ
from pathlib import Path
from subprocess import check_call, run

_TOP_LV = Path(__file__).resolve().parent.parent


def _git_identity() -> None:
    email = "ci@ci.ci"
    username = "ci-bot"
    check_call(("git", "config", "--global", "user.email", email))
    check_call(("git", "config", "--global", "user.name", username))


def _get_branch() -> str:
    ref = environ["GITHUB_REF"]
    return ref.replace("refs/heads/", "")


def _git_clone(path: Path) -> None:
    if not path.is_dir():
        token = environ["CI_TOKEN"]
        uri = f"https://ms-jpq:{token}@github.com/ms-jpq/coq_nvim.git"
        branch = _get_branch()
        check_call(("git", "clone", "--branch", branch, uri, str(path)))


def _build() -> None:
    check_call(("python3", "-m", f"src"), cwd=_TOP_LV)


def _git_push(cwd: Path) -> None:
    proc = run(("git", "diff", "--exit-code"), cwd=cwd)
    if proc.returncode:
        time = datetime.now(tz=timezone.utc).strftime("%Y-%m-%d")
        check_call(("git", "add", "."), cwd=cwd)
        check_call(("git", "commit", "-m", f"update_artifacts: {time}"), cwd=cwd)
        check_call(("git", "push"), cwd=cwd)


def main() -> None:
    cwd = _TOP_LV / "dist"
    _git_identity()
    _git_clone(cwd)
    _build()
    _git_push(cwd)

