from collections import OrderedDict
import os
import argparse
from datetime import datetime
from git import Repo, InvalidGitRepositoryError, NoSuchPathError, GitCommandError
from jet.file.utils import save_file
import fnmatch


def format_macos_modified_time(timestamp):
    """Format timestamp to ISO 8601 for parsability."""
    dt = datetime.fromtimestamp(timestamp)
    return dt.strftime("%Y-%m-%dT%H:%M:%S")


def get_last_commit_dates_optimized(base_dir, extensions=None, depth=1, output_file=None):
    if not os.path.isdir(base_dir):
        raise ValueError(f"{base_dir} is not a valid directory")

    # Define files and folders to exclude
    exclude_patterns = {
        # macOS system files
        '.DS_Store', 'Icon\r', '.Trashes', '.Spotlight-V100', '.fseventsd',
        # Development-related directories
        '.git', 'node_modules', 'venv', '__pycache__', '.idea',
        # Temporary and compiled files
        '*.pyc', '*.pyo', '*.swp'
    }

    # Add the output file to exclusions if specified
    if output_file:
        exclude_patterns.add(os.path.basename(output_file))

    base_depth = len(base_dir.split(os.sep))
    is_git_repo = False
    repo = None

    # Attempt to initialize a Git repository
    try:
        repo = Repo(base_dir, search_parent_directories=True)
        if repo.bare:
            raise ValueError(f"{base_dir} is a bare repository")
        # Check if there are any commits
        try:
            # Attempt to access commits via HEAD or any ref
            list(repo.iter_commits('HEAD', max_count=1))
            is_git_repo = True
        except (GitCommandError, ValueError):
            # No commits found (e.g., new repo or missing default branch)
            is_git_repo = False
    except (InvalidGitRepositoryError, NoSuchPathError):
        is_git_repo = False

    results = []

    def is_excluded(path, name):
        """Check if a file or directory should be excluded based on patterns."""
        if name in exclude_patterns:
            return True
        for pattern in exclude_patterns:
            if fnmatch.fnmatch(name, pattern):
                return True
        rel_path = os.path.relpath(path, base_dir)
        return any(excluded in rel_path.split(os.sep) for excluded in exclude_patterns)

    def calculate_depth(rel_path):
        """Calculate the depth of a relative path by counting path components."""
        components = rel_path.split(os.sep)
        # Count non-empty components, ensuring depth is at least 1
        return len([c for c in components if c]) or 1

    if is_git_repo:
        # Git mode
        tracked_paths = set(repo.git.ls_files().splitlines())
        ignored_paths = {
            os.path.join(repo.working_tree_dir, p)
            for p in repo.git.ls_files(others=True, exclude_standard=True).splitlines()
            if repo.ignored(os.path.join(repo.working_tree_dir, p))
        }

        file_paths = []
        dir_paths = []

        # First pass: collect files and directories
        for root, dirs, files in os.walk(base_dir):
            current_depth = len(root.split(os.sep)) - base_depth
            if current_depth > depth:
                continue
            # Filter out excluded directories
            dirs[:] = [d for d in dirs if not is_excluded(
                os.path.join(root, d), d)]
            for name in files:
                if is_excluded(os.path.join(root, name), name):
                    continue
                full_path = os.path.join(root, name)
                rel_path = os.path.relpath(full_path, repo.working_tree_dir)
                if rel_path in tracked_paths and full_path not in ignored_paths:
                    if extensions:
                        _, ext = os.path.splitext(name)
                        if ext in extensions:
                            file_paths.append(rel_path)
                    else:
                        file_paths.append(rel_path)
            for name in dirs:
                full_path = os.path.join(root, name)
                rel_path = os.path.relpath(full_path, repo.working_tree_dir)
                if rel_path not in ['.', '..'] and full_path not in ignored_paths:
                    # Check if the directory contains any tracked files
                    contains_tracked = any(
                        os.path.relpath(os.path.join(
                            subroot, fname), repo.working_tree_dir) in tracked_paths
                        for subroot, _, fnames in os.walk(full_path)
                        for fname in fnames
                    )
                    if contains_tracked:
                        dir_paths.append(rel_path)

        all_paths = sorted(list(set(file_paths + dir_paths)))
        commit_times = {}

        # Get commit times for files and directories
        if all_paths:
            for path in all_paths:
                try:
                    # For directories, find the latest commit affecting any file within
                    if path in dir_paths:
                        commits = list(repo.iter_commits(
                            paths=[p for p in tracked_paths if p.startswith(path + os.sep)], max_count=1))
                    else:
                        commits = list(repo.iter_commits(
                            paths=[path], max_count=1))
                    if commits:
                        commit_times[path] = format_macos_modified_time(
                            commits[0].committed_date)
                except (GitCommandError, ValueError):
                    # Skip paths that cause errors (e.g., no commits for this path)
                    continue

        # Second pass: build results
        for root, dirs, files in os.walk(base_dir):
            current_depth = len(root.split(os.sep)) - base_depth
            if current_depth > depth:
                continue
            dirs[:] = [d for d in dirs if not is_excluded(
                os.path.join(root, d), d)]
            for name in files:
                if is_excluded(os.path.join(root, name), name):
                    continue
                full_path = os.path.join(root, name)
                rel_path = os.path.relpath(full_path, repo.working_tree_dir)
                if rel_path in commit_times and full_path not in ignored_paths:
                    results.append({
                        "basename": name,
                        "updated_at": commit_times[rel_path],
                        "type": "file",
                        "rel_path": rel_path,
                        "path": full_path,
                        "depth": calculate_depth(rel_path)
                    })
            for name in dirs:
                full_path = os.path.join(root, name)
                rel_path = os.path.relpath(full_path, repo.working_tree_dir)
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
        # Non-Git mode (use file modification times)
        for root, dirs, files in os.walk(base_dir):
            current_depth = len(root.split(os.sep)) - base_depth
            if current_depth > depth:
                continue
            dirs[:] = [d for d in dirs if not is_excluded(
                os.path.join(root, d), d)]
            for name in files:
                if is_excluded(os.path.join(root, name), name):
                    continue
                full_path = os.path.join(root, name)
                if extensions:
                    _, ext = os.path.splitext(name)
                    if ext not in extensions:
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
            for name in dirs:
                full_path = os.path.join(root, name)
                if is_excluded(full_path, name):
                    continue
                try:
                    rel_path = os.path.relpath(full_path, base_dir)
                    mtime = os.stat(full_path).st_mtime
                    updated_at = format_macos_modified_time(mtime)
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
    for i, item in enumerate(sorted_results):
        ranked_item = OrderedDict()
        ranked_item['rank'] = i + 1
        ranked_item.update(item)
        ranked_results.append(ranked_item)

    return ranked_results, is_git_repo


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Get the last modified or commit dates of files and directories with macOS-style formatting.")
    parser.add_argument("base_dir", nargs="?", default=os.getcwd(),
                        help="The base directory of the Git repository or folder (default: current directory).")
    parser.add_argument("-e", "--extensions",
                        help="Filter files by these extensions, comma-separated (e.g., .ipynb,.md,.py).")
    parser.add_argument("-f", "--output-file", type=str, default=None,
                        help="Optional path to save results as a JSON file.")
    parser.add_argument("-d", "--depth", type=int, default=1,
                        help="Limit the depth of folder traversal relative to base_dir (default: 1).")
    args = parser.parse_args()

    base_dir = args.base_dir
    extensions = [ext.strip() for ext in args.extensions.split(',')
                  ] if args.extensions else None
    depth = args.depth

    try:
        # Run the function to determine if it's a Git repo and get results
        updates, is_git_repo = get_last_commit_dates_optimized(
            base_dir, extensions, depth, None)

        # Determine default output file based on Git availability
        default_filename = "_git_stats.json" if is_git_repo else "_file_stats.json"
        output_file = args.output_file or os.path.join(
            base_dir, default_filename)

        # Re-run with the output file to ensure it's excluded
        updates, _ = get_last_commit_dates_optimized(
            base_dir, extensions, depth, output_file)

        for item in updates:
            print(
                f"{item['rank']}. {item['rel_path']} ({item['type']}, depth={item['depth']}): {item['updated_at']}")

        save_file(updates, output_file)
        print(f"\nFile stats saved to: {output_file}")

    except ValueError as e:
        print(f"Error: {e}")
