import os
from git import Repo
from jet.file.utils import save_file
from datetime import datetime


def get_last_commit_dates(base_dir):
    if not os.path.isdir(base_dir):
        raise ValueError(f"{base_dir} is not a valid directory")

    try:
        # Initialize the Git repository
        repo = Repo(base_dir, search_parent_directories=True)
        if repo.bare:
            raise ValueError(f"{base_dir} is a bare repository")

        results = []

        def process_directory(current_dir, prefix=""):
            dir_results = []
            entries = os.listdir(current_dir)

            for entry in entries:
                full_path = os.path.join(current_dir, entry)
                if not os.path.exists(full_path):
                    continue

                # Skip .git directory
                if entry == ".git":
                    continue

                try:
                    # Get the relative path from the repo root
                    rel_path = os.path.relpath(
                        full_path, repo.working_tree_dir)

                    # Check if the path is tracked by Git
                    if repo.ignored(full_path) or rel_path not in repo.git.ls_files(rel_path, cached=True, others=True):
                        continue

                    # Get the latest commit that modified this file or folder
                    commits = list(repo.iter_commits(
                        paths=rel_path, max_count=1))
                    if commits:
                        last_commit = commits[0]
                        commit_date = datetime.fromtimestamp(
                            last_commit.committed_date).isoformat()
                        dir_results.append({
                            "basename": f"{prefix}{entry}",
                            "updated_at": commit_date,
                            "type": "directory" if os.path.isdir(full_path) else "file",
                            "path": full_path
                        })

                    # Recursively process subdirectories
                    if os.path.isdir(full_path):
                        sub_results = process_directory(
                            full_path, prefix=f"{prefix}{entry}/")
                        dir_results.extend(sub_results)

                except Exception:
                    continue  # Skip entries with no commits or errors

            return dir_results

        # Process the base directory
        results = process_directory(base_dir)

        # Sort by updated_at in descending order
        return sorted(results, key=lambda x: (x['updated_at'], x['path']), reverse=True)

    except Exception as e:
        raise ValueError(
            f"Failed to access Git repository in {base_dir}: {str(e)}")


if __name__ == "__main__":
    base_dir = "/Users/jethroestrada/Desktop/External_Projects/AI/code_agents/GenAI_Agents/all_agents_tutorials"
    updates = get_last_commit_dates(base_dir)

    for item in updates:
        print(f"{item['basename']} ({item['type']}): {item['updated_at']}")

    save_file(updates, f"{base_dir}/_git_stats.json")
