# test_git_repo_finder.py

from __future__ import annotations

import tempfile
from pathlib import Path

import pytest
from git_repo_finder import find_git_repositories, is_git_repository


@pytest.fixture
def temp_git_structure(tmp_path: Path) -> Path:
    """
    Create this structure:

    temp/
    ├── project-a/               ← git repo
    │   └── .git/
    ├── project-b/               ← git repo
    │   ├── .git/
    │   └── nested/              ← should NOT be scanned
    │       └── .git/            ← ignored because parent is repo
    ├── regular-folder/
    │   └── .git/                ← fake .git (missing HEAD)
    └── deep/
        ├── client/
        │   └── app/             ← git repo
        │       └── .git/
        └── server/              ← git repo
            └── .git/
    """
    base = tmp_path / "projects"
    base.mkdir(exist_ok=True)

    # project-a (repo)
    (base / "project-a" / ".git").mkdir(parents=True, exist_ok=True)
    (base / "project-a" / ".git" / "HEAD").write_text("ref: refs/heads/main\n")

    # project-b (repo) + fake nested repo
    (base / "project-b" / ".git").mkdir(parents=True, exist_ok=True)
    (base / "project-b" / ".git" / "HEAD").write_text("ref: refs/heads/main\n")
    (base / "project-b" / "nested" / ".git").mkdir(parents=True, exist_ok=True)

    # regular folder with .git but not valid repo
    (base / "regular-folder" / ".git").mkdir(parents=True, exist_ok=True)

    # deep structure
    (base / "deep" / "client" / "app" / ".git").mkdir(parents=True, exist_ok=True)
    (base / "deep" / "client" / "app" / ".git" / "HEAD").write_text(
        "ref: refs/heads/main\n"
    )
    (base / "deep" / "server" / ".git").mkdir(parents=True, exist_ok=True)
    (base / "deep" / "server" / ".git" / "HEAD").write_text("ref: refs/heads/main\n")

    return base


def test_is_git_repository():
    with tempfile.TemporaryDirectory() as tmpdir:
        path = Path(tmpdir)

        # not git
        assert not is_git_repository(path)

        # fake .git but no HEAD
        (path / ".git").mkdir()
        assert not is_git_repository(path)

        # real-looking git repo
        (path / ".git" / "HEAD").write_text("ref: refs/heads/main")
        assert is_git_repository(path)


def test_find_git_repositories(temp_git_structure: Path):
    # Given
    base = temp_git_structure

    # When
    repos = list(find_git_repositories(base))

    # Then
    expected = [
        base / "project-a",
        base / "project-b",
        base / "deep" / "client" / "app",
        base / "deep" / "server",
    ]

    assert len(repos) == len(expected)
    assert set(repos) == set(expected)


def test_does_not_descend_into_git_repos(temp_git_structure: Path):
    """
    Make sure we don't report nested .git folders
    when parent is already a git repo
    """
    # Given
    base = temp_git_structure / "project-b"

    # When
    repos = list(find_git_repositories(base))

    # Then
    assert len(repos) == 1
    assert repos[0] == base.resolve()


def test_handles_non_existing_directory():
    with pytest.raises(NotADirectoryError):
        list(find_git_repositories("/this/does/not/exist/123456"))


def test_handles_empty_directory(tmp_path: Path):
    # Given empty folder
    result = list(find_git_repositories(tmp_path))

    # Then
    assert result == []
