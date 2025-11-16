#!/bin/zsh

# Clear package manager caches
pip cache purge
uv cache clean
yarn cache clean --all
npm cache clean --force
pod cache clean --all
pnpm store prune
brew cleanup && rm -rf "$(brew --cache)"

# Clear user caches except ms-playwright
find ~/Library/Caches -mindepth 1 -maxdepth 1 ! \( -name "ms-playwright" \) -exec rm -rf {} \+

# Reclaim ownership of system temp directories
sudo chown -R "$(whoami)" /private/var/folders/* /var/folders/* /tmp/* /var/tmp/* /usr/tmp/*

# Clear system temp directories
find /private/var/folders/ -mindepth 1 -maxdepth 1 -exec sudo rm -rf {} +
find /var/folders/ -mindepth 1 -maxdepth 1 -exec sudo rm -rf {} +
rm -rf /tmp/* /var/tmp/* /usr/tmp/*

# Clear Xcode DerivedData
sudo chown -R "$(whoami)" ~/Library/Developer/Xcode/DerivedData/*
rm -rf ~/Library/Developer/Xcode/DerivedData/*

# Clear other user caches except huggingface, ms-playwright, venv
find ~/.cache -mindepth 1 -maxdepth 1 ! \( -name "huggingface" -o -name "ms-playwright" -o -name "venv" \) -exec rm -rf {} \+

# Clear npx cache
rm -rf ~/.npm/_npx/

# Prune Git LFS
git lfs prune --dry-run && git lfs prune

# Reclaim ownership of user caches
sudo chown -R "$(whoami)" ~/Library/Caches/*

# Clear additional Xcode caches
rm -rf ~/Library/Developer/CoreSimulator/Caches/* ~/Library/Developer/Xcode/Archives/* ~/Library/Developer/Xcode/DerivedData/*