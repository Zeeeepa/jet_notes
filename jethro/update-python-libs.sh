#!/bin/zsh

# Base directories
BASE_DIR=~/Desktop/External_Projects/AI
TARGETS=("repo-libs" "examples" "lessons" "apps")

# Exclude list (absolute paths)
EXCLUDES=(
  "$BASE_DIR/repo-libs/docutils"
)

echo "🔄 Updating Git repositories in $BASE_DIR..."

for target in $TARGETS; do
  DIR="$BASE_DIR/$target"
  if [[ -d "$DIR" ]]; then
    echo "📂 Entering $DIR"
    for repo in "$DIR"/*; do
      if [[ -d "$repo/.git" ]]; then
        # Check against excludes
        if [[ " ${EXCLUDES[@]} " == *" $repo "* ]]; then
          echo "⏭️  Skipping $(basename "$repo") (excluded)"
          continue
        fi

        echo "➡️  Updating $(basename "$repo")"
        (cd "$repo" && git pull --ff-only)
      fi
    done
  else
    echo "⚠️  Skipping $DIR (not found)"
  fi
done

echo "✅ All repositories updated."
