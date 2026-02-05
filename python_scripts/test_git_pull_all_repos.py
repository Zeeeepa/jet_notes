from __future__ import annotations

import json
import subprocess
from pathlib import Path

import pytest
from _pytest.capture import CaptureFixture
from git_pull_all_repos import git_pull_all_repos, run_git_pull


def fake_git_repo(path: str) -> Path:
    return Path(path).resolve()


# -------------------------------------------------------------------------
# run_git_pull tests (these are fine – keeping them mostly unchanged)
# -------------------------------------------------------------------------
class TestRunGitPull:
    def test_successful_pull_with_changes(self, mocker):
        mock_result = mocker.Mock(
            returncode=0,
            stdout="""remote: Enumerating objects: 12, done.
From ... * branch main -> FETCH_HEAD
   abc123..def456  main     -> origin/main
Updating abc123..def456
Fast-forward
 file.txt | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)
""",
            stderr="",
        )
        mocker.patch("subprocess.run", return_value=mock_result)

        status, msg = run_git_pull(fake_git_repo("/home/user/project"))
        assert status == "success"
        assert "Fast-forward" in msg or "Pulled successfully" in msg

    def test_already_up_to_date(self, mocker):
        mock_result = mocker.Mock(
            returncode=0, stdout="Already up to date.\n", stderr=""
        )
        mocker.patch("subprocess.run", return_value=mock_result)

        status, msg = run_git_pull(fake_git_repo("/tmp/repo"))
        assert status == "up-to-date"
        assert "up to date" in msg.lower()

    def test_non_zero_exit_code(self, mocker):
        mock_result = mocker.Mock(
            returncode=1,
            stdout="",
            stderr="error: Your local changes ... would be overwritten by merge:\n    important.txt\nAborting\n",
        )
        mocker.patch("subprocess.run", return_value=mock_result)

        status, msg = run_git_pull(fake_git_repo("/code/myapp"))
        assert status == "failed"
        assert "overwritten" in msg

    def test_timeout(self, mocker):
        mocker.patch(
            "subprocess.run", side_effect=subprocess.TimeoutExpired("git", 120)
        )
        status, msg = run_git_pull(fake_git_repo("/slow/repo"))
        assert status == "error"
        assert "Timed out" in msg


# -------------------------------------------------------------------------
# git_pull_all_repos tests – fixed version
# -------------------------------------------------------------------------
class TestGitPullAllRepos:
    @pytest.mark.parametrize(
        "repos, pull_outcomes, expected_counts",
        [
            pytest.param(
                ["/home/user/projectA", "/home/user/projectB"],
                ["success", "up-to-date"],
                {"success": 1, "up-to-date": 1, "failed": 0, "error": 0},
                id="one_success_one_uptodate",
            ),
            pytest.param(
                ["/tmp/repo1", "/tmp/repo2", "/tmp/repo3"],
                ["success", "failed", "error"],
                {"success": 1, "up-to-date": 0, "failed": 1, "error": 1},
                id="mixed_outcomes",
            ),
            pytest.param(
                [],
                [],
                {"success": 0, "up-to-date": 0, "failed": 0, "error": 0},
                id="no_repos_found",
            ),
        ],
    )
    def test_various_scenarios(
        self,
        mocker,
        capsys: CaptureFixture[str],
        repos: list[str],
        pull_outcomes: list[str],
        expected_counts: dict[str, int],
    ):
        # Given
        mocker.patch(
            "git_pull_all_repos.find_git_repositories",
            return_value=(fake_git_repo(p) for p in repos),
        )

        def fake_pull(repo: Path) -> tuple[str, str]:
            idx = [fake_git_repo(r) for r in repos].index(repo)
            outcome = pull_outcomes[idx]
            if outcome == "success":
                return "success", "3 files changed, 1 insertion(+)"
            if outcome == "up-to-date":
                return "up-to-date", "Already up to date."
            if outcome == "failed":
                return "failed", "CONFLICT (content): Merge conflict"
            return "error", "Timeout"

        mocker.patch("git_pull_all_repos.run_git_pull", side_effect=fake_pull)

        # When
        git_pull_all_repos("/fake/base")
        out, _ = capsys.readouterr()

        has_repos = bool(repos)

        if has_repos:
            assert "Found" in out
            assert str(len(repos)) in out
            assert "Starting pull" in out or "repositories" in out
            assert "Pull Summary" in out
        else:
            assert "No git repositories found" in out
            assert "Pull Summary" not in out

        for status, count in expected_counts.items():
            if count > 0:
                assert str(count) in out

    @pytest.mark.parametrize(
        "input_path, expected",
        [
            (".", Path(".").resolve()),
            ("~/projects", Path.home() / "projects"),
            ("/tmp", Path("/tmp").resolve()),
        ],
    )
    def test_resolves_path(self, mocker, input_path, expected):
        mock_find = mocker.patch("git_pull_all_repos.find_git_repositories")
        mocker.patch("git_pull_all_repos.run_git_pull")

        git_pull_all_repos(input_path)

        mock_find.assert_called_once()
        assert mock_find.call_args[0][0] == expected


class TestGitPullAllReposOutput:
    def test_writes_progress_file_incrementally(self, mocker, tmp_path):
        # Given
        repos = ["/repo/A", "/repo/B"]
        out_file = tmp_path / "progress.json"

        mocker.patch(
            "git_pull_all_repos.find_git_repositories",
            return_value=(Path(p) for p in repos),
        )

        outcomes = [
            ("success", "Pulled successfully."),
            ("failed", "Merge conflict"),
        ]

        def fake_pull(repo: Path):
            idx = repos.index(str(repo))
            return outcomes[idx]

        mocker.patch("git_pull_all_repos.run_git_pull", side_effect=fake_pull)

        git_pull_all_repos._out_path = out_file

        # When
        git_pull_all_repos("/base")

        # Then
        assert out_file.exists()
        data = json.loads(out_file.read_text())

        expected = {
            str(Path("/repo/A")): {
                "status": "success",
                "message": "Pulled successfully.",
            },
            str(Path("/repo/B")): {
                "status": "failed",
                "message": "Merge conflict",
            },
        }

        assert data == expected

        del git_pull_all_repos._out_path


class TestGitPullAllReposOutputEdgeCases:
    def test_out_file_written_when_no_repos_found(self, mocker, tmp_path):
        # Given
        out_file = tmp_path / "progress.json"

        mocker.patch(
            "git_pull_all_repos.find_git_repositories",
            return_value=iter([]),
        )
        mocker.patch("git_pull_all_repos.run_git_pull")

        git_pull_all_repos._out_path = out_file

        # When
        git_pull_all_repos("/empty")

        # Then
        assert out_file.exists()
        data = json.loads(out_file.read_text())
        assert data == {}

        del git_pull_all_repos._out_path

    def test_creates_parent_directories_for_out_file(self, mocker, tmp_path):
        # Given
        repos = ["/repo/one"]
        out_file = tmp_path / "nested" / "dir" / "progress.json"

        mocker.patch(
            "git_pull_all_repos.find_git_repositories",
            return_value=(Path(p) for p in repos),
        )

        mocker.patch(
            "git_pull_all_repos.run_git_pull",
            return_value=("success", "Pulled successfully."),
        )

        git_pull_all_repos._out_path = out_file

        # When
        git_pull_all_repos("/base")

        # Then
        assert out_file.exists()
        data = json.loads(out_file.read_text())

        expected = {
            str(Path("/repo/one")): {
                "status": "success",
                "message": "Pulled successfully.",
            }
        }

        assert data == expected

        del git_pull_all_repos._out_path
