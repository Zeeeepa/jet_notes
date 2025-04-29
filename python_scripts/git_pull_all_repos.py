import os
import subprocess
import argparse


def git_pull_all_repos(target_dir="."):
    """
    Recursively finds all directories under target_dir that contain a .git folder,
    and runs 'git pull' in each of them.
    """
    for root, dirs, files in os.walk(target_dir):
        if '.git' in dirs:
            print(f"\nFound git repo: {root}")
            try:
                result = subprocess.run(
                    ['git', '-C', root, 'pull'],
                    check=True,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True
                )
                print(result.stdout)
            except subprocess.CalledProcessError as e:
                print(f"Failed to pull {root}")
                print(e.stderr)


def main():
    parser = argparse.ArgumentParser(
        description="Recursively pull all Git repositories under a directory.")
    parser.add_argument(
        "target_dir",
        nargs="?",
        default=".",
        help="Target directory to search (default: current directory)"
    )
    args = parser.parse_args()
    git_pull_all_repos(args.target_dir)


if __name__ == "__main__":
    main()


# Example usage:
# git_pull_all_repos()
# git_pull_all_repos('/path/to/your/target/directory')
