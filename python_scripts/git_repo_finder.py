# git_repo_finder.py

from __future__ import annotations

import os
from collections.abc import Generator, Iterator
from pathlib import Path

from rich.console import Console

# For nice console output (optional but matches your preference)
console = Console()


def is_git_repository(path: Path) -> bool:
    """
    Check if the given path is the root of a git repository.
    Looks for .git/HEAD file (most reliable lightweight check).
    """
    return (path / ".git" / "HEAD").is_file()


def find_git_repositories(
    base_dir: str | Path,
    *,
    follow_symlinks: bool = False,
) -> Iterator[Path]:
    """
    Recursively find all git repositories under base_dir.

    Optimization:
        - Once a .git folder is found, we SKIP walking inside that directory
          (no need to look for nested repos unless you explicitly want them)

    Yields absolute paths to git repository **roots**.
    """
    base_path = Path(base_dir).resolve()

    if not base_path.is_dir():
        raise NotADirectoryError(f"Not a directory: {base_path}")

    # Special case: if the starting directory itself is a git repo,
    # yield it and do NOT recurse into it
    if is_git_repository(base_path):
        yield base_path
        return

    visited: set[Path] = set()

    def walk(start: Path) -> Generator[Path, None, None]:
        try:
            for entry in os.scandir(start):
                try:
                    entry_path = Path(entry.path)

                    # Skip already visited (symlink protection)
                    if entry_path in visited:
                        continue

                    if entry.is_dir(follow_symlinks=follow_symlinks):
                        # Check if this directory IS a git repo
                        if is_git_repository(entry_path):
                            visited.add(entry_path)
                            yield entry_path.resolve()
                            # Important optimization: skip walking INSIDE this repo
                            continue

                        # Not a git repo → recurse
                        yield from walk(entry_path)

                except (PermissionError, OSError):
                    # Skip inaccessible directories
                    continue

        except (PermissionError, OSError):
            pass

    yield from walk(base_path)


# Convenience function with rich printing
def print_git_repositories(
    base_dir: str | Path,
    follow_symlinks: bool = False,
) -> None:
    console.print(f"[bold cyan]Searching git repositories in:[/bold cyan] {base_dir}\n")

    count = 0
    for repo in find_git_repositories(base_dir, follow_symlinks=follow_symlinks):
        console.print(f"  • [green]{repo}[/green]")
        count += 1

    console.print(f"\n[bold]Found [magenta]{count}[/magenta] git repositories.[/bold]")


if __name__ == "__main__":
    # Example usage
    import sys

    start_dir = sys.argv[1] if len(sys.argv) > 1 else "."
    print_git_repositories(start_dir)
