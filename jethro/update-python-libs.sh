#!/bin/zsh

# Base directories
BASE_DIR=~/Desktop/External_Projects/AI
TARGETS=("repo-libs" "repo-libs/audio" "examples" "lessons" "apps")

# Exclude list (absolute paths)
EXCLUDES=(
  "$BASE_DIR/repo-libs/docutils"
)

echo "🔄 Updating Git repositories in $BASE_DIR..."

for target in $TARGETS; do
  DIR="$BASE_DIR/$target"

  if [[ ! -d "$DIR" ]]; then
    echo "⚠️  Skipping $DIR (not found)"
    continue
  fi

  echo "📂 Scanning $DIR"

  # Find all .git directories recursively
  while IFS= read -r gitdir; do
    repo="${gitdir:h}"  # parent directory of .git

    # Exclude check
    if [[ " ${EXCLUDES[@]} " == *" $repo "* ]]; then
      echo "⏭️  Skipping $(basename "$repo") (excluded)"
      continue
    fi

    echo "➡️  Updating $(basename "$repo")"
    (cd "$repo" && git pull --ff-only)

  done < <(find "$DIR" -type d -name ".git")

done

echo "✅ All repositories updated."
