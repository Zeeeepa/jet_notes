from collections import OrderedDict
import os
import argparse
from git import Repo
from jet.file.utils import save_file
from datetime import datetime


def get_last_commit_dates_optimized(base_dir, extensions=None, depth=1):
    if not os.path.isdir(base_dir):
        raise ValueError(f"{base_dir} is not a valid directory")

    try:
        repo = Repo(base_dir, search_parent_directories=True)
        if repo.bare:
            raise ValueError(f"{base_dir} is a bare repository")

        tracked_paths = set(repo.git.ls_files().splitlines())
        ignored_paths = {os.path.join(repo.working_tree_dir, p) for p in repo.git.ls_files(
            others=True, exclude_standard=True).splitlines() if repo.ignored(os.path.join(repo.working_tree_dir, p))}

        file_paths = []
        dir_paths = []

        base_depth = len(base_dir.split(os.sep))
        for root, _, files in os.walk(base_dir):
            current_depth = len(root.split(os.sep)) - base_depth
            if current_depth > depth:
                continue
            for name in files:
                full_path = os.path.join(root, name)
                rel_path = os.path.relpath(full_path, repo.working_tree_dir)
                if rel_path in tracked_paths and full_path not in ignored_paths:
                    if extensions:
                        _, ext = os.path.splitext(name)
                        if ext in extensions:
                            file_paths.append(rel_path)
                    else:
                        file_paths.append(rel_path)
            for name in _:  # Directories
                full_path = os.path.join(root, name)
                rel_path = os.path.relpath(full_path, repo.working_tree_dir)
                if rel_path not in ['.', '..'] and rel_path in tracked_paths and full_path not in ignored_paths:
                    dir_paths.append(rel_path)

        all_paths = sorted(list(set(file_paths + dir_paths)))
        commit_times = {}

        if all_paths:
            for commit in repo.iter_commits(paths=all_paths, max_count=1, reverse=True):
                for file_change in commit.diff(None):
                    if file_change.a_path in all_paths:
                        commit_times[file_change.a_path] = datetime.fromtimestamp(
                            commit.committed_date).isoformat()
                        if file_change.a_path in all_paths:
                            all_paths.remove(file_change.a_path)
                    if file_change.b_path in all_paths and file_change.b_path is not None:
                        commit_times[file_change.b_path] = datetime.fromtimestamp(
                            commit.committed_date).isoformat()
                        if file_change.b_path in all_paths:
                            all_paths.remove(file_change.b_path)
                for path in all_paths:  # Handle cases where a file/dir exists but wasn't in the first commit
                    if path not in commit_times:
                        commits = list(repo.iter_commits(
                            paths=[path], max_count=1))
                        if commits:
                            commit_times[path] = datetime.fromtimestamp(
                                commits[0].committed_date).isoformat()

        results = []
        for root, _, files in os.walk(base_dir):
            current_depth = len(root.split(os.sep)) - base_depth
            if current_depth > depth:
                continue
            for name in files:
                full_path = os.path.join(root, name)
                rel_path = os.path.relpath(full_path, repo.working_tree_dir)
                if rel_path in commit_times and full_path not in ignored_paths:
                    results.append({
                        "basename": name,
                        "updated_at": commit_times[rel_path],
                        "type": "file",
                        "rel_path": rel_path,
                        "path": full_path,
                    })
            for name in _:  # Directories
                full_path = os.path.join(root, name)
                rel_path = os.path.relpath(full_path, repo.working_tree_dir)
                if rel_path in commit_times and full_path not in ignored_paths:
                    results.append({
                        "basename": name,
                        "updated_at": commit_times[rel_path],
                        "type": "directory",
                        "rel_path": rel_path,
                        "path": full_path,
                    })

        sorted_results = sorted(results, key=lambda x: (
            x['updated_at'], x['path']), reverse=True)
        ranked_results = []
        for i, item in enumerate(sorted_results):
            ranked_item = OrderedDict()
            ranked_item['rank'] = i + 1
            ranked_item.update(item)
            ranked_results.append(ranked_item)

        return ranked_results

    except Exception as e:
        raise ValueError(
            f"Failed to access Git repository in {base_dir}: {str(e)}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Get the last commit dates of files and directories in a Git repository with improved performance and ranking.")
    parser.add_argument("base_dir", nargs="?", default=os.getcwd(),
                        help="The base directory of the Git repository (default: current directory).")
    parser.add_argument("-e", "--extensions",
                        help="Filter files by these extensions, comma-separated (e.g., .ipynb,.md,.mx).")
    parser.add_argument("-f", "--output-file", type=str, default=None,
                        help="Optional path to save results as a JSON file.")
    parser.add_argument("-d", "--depth", type=int, default=1,
                        help="Limit the depth of folder traversal relative to base_dir (default: 1).")
    args = parser.parse_args()

    base_dir = args.base_dir
    # Split comma-separated extensions into a list, strip whitespace
    extensions = [ext.strip() for ext in args.extensions.split(',')
                  ] if args.extensions else None
    depth = args.depth

    try:
        updates = get_last_commit_dates_optimized(base_dir, extensions, depth)

        for item in updates:
            print(
                f"{item['rank']}. {item['rel_path']} ({item['type']}): {item['updated_at']}")

        output_file = args.output_file or os.path.join(
            base_dir, "_git_stats.json")

        save_file(updates, output_file)
        print(f"\nGit stats saved to: {output_file}")

    except ValueError as e:
        print(f"Error: {e}")
