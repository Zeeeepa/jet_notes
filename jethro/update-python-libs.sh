BASE_DIR="$HOME/Desktop/External_Projects/AI"
PROGRESS_DIR="$BASE_DIR/git_progress.json"
echo "Starting Python library update in $BASE_DIR ..."
echo "Progress will be saved to $PROGRESS_DIR"
python "$HOME/Desktop/External_Projects/Jet_Projects/jet_notes/python_scripts/git_pull_all_repos.py" "$BASE_DIR" -o $PROGRESS_DIR
