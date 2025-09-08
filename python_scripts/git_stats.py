from collections import OrderedDict
import os
import argparse
from datetime import datetime
from git import Repo, InvalidGitRepositoryError, NoSuchPathError, GitCommandError
from jet.file.utils import save_file
import fnmatch
from tqdm import tqdm
from typing import Literal, Optional, List, Dict


def format_macos_modified_time(timestamp: float) -> str:
    """Format timestamp to ISO 8601 for parsability."""
    dt = datetime.fromtimestamp(timestamp)
    return dt.strftime("%Y-%m-%dT%H:%M:%S")


def find_git_repos(base_dir: str) -> list[str]:
    """Find all git repos inside base_dir (non-recursive deeper than one repo)."""
    repos = []
    for root, dirs, _ in os.walk(base_dir):
        if ".git" in dirs:
            repos.append(root)
            dirs[:] = []  # don’t descend further once repo is found
    return repos


def get_last_commit_dates_optimized(
    base_dir: str,
    extensions: Optional[List[str]] = None,
    depth: Optional[int] = None,
    output_file: Optional[str] = None,
    mode: Literal["auto", "git", "file"] = "auto",
    type_filter: Literal["files", "dirs", "both"] = "both",
    file_pattern: Optional[str] = None
) -> tuple[List[Dict], bool]:
    if not os.path.isdir(base_dir):
        raise ValueError(f"{base_dir} is not a valid directory")

    exclude_patterns = {
        '.DS_Store', 'Icon\r', '.Trashes', '.Spotlight-V100', '.fseventsd',
        '.git', 'node_modules', 'venv', ".venv", '__pycache__', '.idea',
        '*.pyc', '*.pyo', '*.swp'
    }
    if output_file:
        exclude_patterns.add(os.path.basename(output_file))

    base_depth = len(base_dir.split(os.sep))
    is_git_repo = False
    repo = None

    try:
        repo = Repo(base_dir, search_parent_directories=True)
        if repo.bare:
            raise ValueError(f"{base_dir} is a bare repository")
        try:
            list(repo.iter_commits('HEAD', max_count=1))
            is_git_repo = True
        except (GitCommandError, ValueError):
            is_git_repo = False
    except (InvalidGitRepositoryError, NoSuchPathError):
        is_git_repo = False

    effective_mode = "git" if mode == "auto" and is_git_repo else "file" if mode in [
        "auto", "git"] else mode
    results = []

    def is_excluded(path: str, name: str) -> bool:
        if name in exclude_patterns:
            return True
        for pattern in exclude_patterns:
            if fnmatch.fnmatch(name, pattern):
                return True
        rel_path = os.path.relpath(path, base_dir)
        return any(excluded in rel_path.split(os.sep) for excluded in exclude_patterns)

    def calculate_depth(rel_path: str) -> int:
        components = rel_path.split(os.sep)
        return len([c for c in components if c]) or 1

    if effective_mode == "git":
        tracked_paths = set(repo.git.ls_files().splitlines())
        ignored_paths = {
            os.path.join(repo.working_tree_dir, p)
            for p in repo.git.ls_files(others=True, exclude_standard=True).splitlines()
            if repo.ignored(os.path.join(repo.working_tree_dir, p))
        }

        file_paths = []
        dir_paths = []

        for root, dirs, files in tqdm(os.walk(base_dir), desc="Scanning directories"):
            current_depth = len(root.split(os.sep)) - base_depth
            if depth is not None and current_depth > depth:
                continue
            dirs[:] = [d for d in dirs if not is_excluded(
                os.path.join(root, d), d)]
            if type_filter in ["files", "both"]:
                for name in files:
                    if is_excluded(os.path.join(root, name), name):
                        continue
                    full_path = os.path.join(root, name)
                    rel_path = os.path.relpath(
                        full_path, repo.working_tree_dir)
                    if rel_path in tracked_paths and full_path not in ignored_paths:
                        if extensions:
                            _, ext = os.path.splitext(name)
                            if ext not in extensions:
                                continue
                        if file_pattern and not (
                            fnmatch.fnmatch(name, file_pattern) or fnmatch.fnmatch(
                                rel_path, file_pattern)
                        ):
                            continue
                        file_paths.append(rel_path)
            if type_filter in ["dirs", "both"]:
                for name in dirs:
                    full_path = os.path.join(root, name)
                    rel_path = os.path.relpath(
                        full_path, repo.working_tree_dir)
                    if rel_path not in ['.', '..'] and full_path not in ignored_paths:
                        contains_tracked = any(
                            os.path.relpath(os.path.join(
                                subroot, fname), repo.working_tree_dir) in tracked_paths
                            for subroot, _, fnames in os.walk(full_path)
                            for fname in fnames
                        )
                        if contains_tracked:
                            dir_paths.append(rel_path)

        commit_times = {}
        file_commits = {}
        if file_paths and type_filter in ["files", "both"]:
            try:
                for path in tqdm(file_paths, desc="Processing file commits"):
                    commits = list(repo.iter_commits(
                        paths=[path], max_count=1))
                    if commits:
                        file_commits[path] = format_macos_modified_time(
                            commits[0].committed_date)
            except (GitCommandError, ValueError):
                pass

        if type_filter in ["dirs", "both"]:
            for dir_path in tqdm(dir_paths, desc="Processing directory commits"):
                try:
                    commits = list(repo.iter_commits(
                        paths=[dir_path], max_count=1))
                    if commits:
                        commit_times[dir_path] = format_macos_modified_time(
                            commits[0].committed_date)
                except (GitCommandError, ValueError):
                    continue

        commit_times.update(file_commits)

        for root, dirs, files in tqdm(os.walk(base_dir), desc="Building results"):
            current_depth = len(root.split(os.sep)) - base_depth
            if depth is not None and current_depth > depth:
                continue
            dirs[:] = [d for d in dirs if not is_excluded(
                os.path.join(root, d), d)]
            if type_filter in ["files", "both"]:
                for name in files:
                    if is_excluded(os.path.join(root, name), name):
                        continue
                    full_path = os.path.join(root, name)
                    rel_path = os.path.relpath(
                        full_path, repo.working_tree_dir)
                    if rel_path in commit_times and full_path not in ignored_paths:
                        if file_pattern and not (
                            fnmatch.fnmatch(name, file_pattern) or fnmatch.fnmatch(
                                rel_path, file_pattern)
                        ):
                            continue
                        results.append({
                            "basename": name,
                            "updated_at": commit_times[rel_path],
                            "type": "file",
                            "rel_path": rel_path,
                            "path": full_path,
                            "depth": calculate_depth(rel_path)
                        })
            if type_filter in ["dirs", "both"]:
                for name in dirs:
                    full_path = os.path.join(root, name)
                    rel_path = os.path.relpath(
                        full_path, repo.working_tree_dir)
                    if rel_path in commit_times and full_path not in ignored_paths:
                        results.append({
                            "basename": name,
                            "updated_at": commit_times[rel_path],
                            "type": "directory",
                            "rel_path": rel_path,
                            "path": full_path,
                            "depth": calculate_depth(rel_path)
                        })

    else:
        for root, dirs, files in tqdm(os.walk(base_dir), desc="Scanning files (non-Git)"):
            current_depth = len(root.split(os.sep)) - base_depth
            if depth is not None and current_depth > depth:
                continue
            dirs[:] = [d for d in dirs if not is_excluded(
                os.path.join(root, d), d)]
            if type_filter in ["files", "both"]:
                for name in files:
                    if is_excluded(os.path.join(root, name), name):
                        continue
                    full_path = os.path.join(root, name)
                    if extensions:
                        _, ext = os.path.splitext(name)
                        if ext not in extensions:
                            continue
                    if file_pattern and not (
                        fnmatch.fnmatch(name, file_pattern) or fnmatch.fnmatch(
                            os.path.relpath(full_path, base_dir), file_pattern)
                    ):
                        continue
                    try:
                        rel_path = os.path.relpath(full_path, base_dir)
                        mtime = os.stat(full_path).st_mtime
                        updated_at = format_macos_modified_time(mtime)
                        results.append({
                            "basename": name,
                            "updated_at": updated_at,
                            "type": "file",
                            "rel_path": rel_path,
                            "path": full_path,
                            "depth": calculate_depth(rel_path)
                        })
                    except Exception:
                        continue
            if type_filter in ["dirs", "both"]:
                for name in dirs:
                    full_path = os.path.join(root, name)
                    if is_excluded(full_path, name):
                        continue
                    try:
                        rel_path = os.path.relpath(full_path, base_dir)
                        latest_mtime = None
                        for subroot, _, fnames in os.walk(full_path):
                            for fname in fnames:
                                fpath = os.path.join(subroot, fname)
                                try:
                                    mtime = os.stat(fpath).st_mtime
                                    if latest_mtime is None or mtime > latest_mtime:
                                        latest_mtime = mtime
                                except Exception:
                                    continue
                        if latest_mtime:
                            updated_at = format_macos_modified_time(
                                latest_mtime)
                            results.append({
                                "basename": name,
                                "updated_at": updated_at,
                                "type": "directory",
                                "rel_path": rel_path,
                                "path": full_path,
                                "depth": calculate_depth(rel_path)
                            })
                    except Exception:
                        continue

    sorted_results = sorted(results, key=lambda x: (
        x['updated_at'], x['path']), reverse=True)
    ranked_results = []
    for i, item in enumerate(tqdm(sorted_results, desc="Ranking results")):
        ranked_item = OrderedDict()
        ranked_item['rank'] = i + 1
        ranked_item.update(item)
        ranked_results.append(ranked_item)

    return ranked_results, is_git_repo


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Get the last modified or commit dates of files and directories with macOS-style formatting."
    )
    parser.add_argument("base_dir", nargs="?", default=os.getcwd(),
                        help="The base directory of the Git repository or folder (default: current directory).")
    parser.add_argument("-e", "--extensions",
                        help="Filter files by these extensions, comma-separated (e.g., .ipynb,.md,.py).")
    parser.add_argument("-f", "--output-file", type=str, default=None,
                        help="Optional path to save results as a JSON file.")
    parser.add_argument("-d", "--depth", type=int, default=None, nargs="?",
                        help="Limit the depth of folder traversal relative to base_dir (default: None, no limit).")
    parser.add_argument("-m", "--mode", choices=["auto", "git", "file"], default="auto",
                        help="Mode to retrieve timestamps: 'auto' uses git if repo exists else file, 'git' for commit times, 'file' for modification times (default: auto).")
    parser.add_argument("-t", "--type", choices=["files", "dirs", "both"], default="files",
                        help="Filter results to include files, directories, or both (default: files).")
    parser.add_argument("-p", "--file-pattern", type=str, default=None,
                        help="Filter files by name or relative path pattern (e.g., '*mcp*').")
    args = parser.parse_args()

    base_dir = args.base_dir
    extensions = [ext.strip() for ext in args.extensions.split(',')
                  ] if args.extensions else None
    depth = args.depth
    mode = args.mode
    type_filter = args.type
    file_pattern = args.file_pattern

    # -------------------------
    # NEW: Short-circuit for file mode
    # -------------------------
    if mode == "file":
        updates, _ = get_last_commit_dates_optimized(
            base_dir, extensions, depth, None, mode, type_filter, file_pattern
        )
        output_file = args.output_file or os.path.join(
            base_dir, "_file_stats.json")

        # Ensure sorting by updated_at desc
        updates = sorted(updates, key=lambda x: x["updated_at"], reverse=True)

        for item in updates[:10]:
            print(
                f"{item['rank']}. {item['rel_path']} ({item['type']}, depth={item['depth']}): {item['updated_at']}")
        for item in updates:
            if "path" in item:
                item["path"] = os.path.abspath(item["path"])
        save_file(updates, output_file)
        print(f"File stats saved to: {output_file}")
        exit(0)

    # -------------------------
    # Otherwise: git or auto mode
    # -------------------------
    git_repos = find_git_repos(base_dir)
    combined_updates = []

    if git_repos:
        for repo_dir in git_repos:
            print(f"\n=== Scanning repo: {repo_dir} ===")
            updates, is_git_repo = get_last_commit_dates_optimized(
                repo_dir, extensions, depth, None, mode, type_filter, file_pattern
            )
            default_filename = "_git_stats.json" if is_git_repo and mode != "file" else "_file_stats.json"
            output_file = args.output_file or os.path.join(
                repo_dir, default_filename)

            for item in updates:
                if "path" in item:
                    item["path"] = os.path.abspath(item["path"])
            save_file(updates, output_file)
            print(f"Repo stats saved to: {output_file}")

            combined_updates.extend(updates)

        # Save combined results at base dir
        combined_updates = sorted(
            combined_updates, key=lambda x: x["updated_at"], reverse=True)
        combined_file = args.output_file or os.path.join(
            base_dir, "_combined_stats.json")
        save_file(combined_updates, combined_file)
        print(f"\nCombined stats saved to: {combined_file}")

    else:
        # No repos found → scan base dir normally
        updates, is_git_repo = get_last_commit_dates_optimized(
            base_dir, extensions, depth, None, mode, type_filter, file_pattern
        )
        default_filename = "_git_stats.json" if is_git_repo and mode != "file" else "_file_stats.json"
        output_file = args.output_file or os.path.join(
            base_dir, default_filename)

        for item in updates:
            if "path" in item:
                item["path"] = os.path.abspath(item["path"])
        save_file(updates, output_file)
        print(f"Stats saved to: {output_file}")
