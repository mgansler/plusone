#!/bin/bash
set -euo pipefail

# ── Create a git worktree with IntelliJ settings ──────────────────────────
# Usage:
#   ./tools/scripts/worktree.sh <branch> [<path>]
#
# Examples:
#   ./tools/scripts/worktree.sh feature/my-new-feature
#   ./tools/scripts/worktree.sh feature/my-new-feature ./apps/stgtrails/worktree-feat
#   ./tools/scripts/worktree.sh main           # reuse root (detached)
#   ./tools/scripts/worktree.sh fix/bug-123 ./tmp/fix-bug-123
#
# The script:
#   1. Creates (or reuses) a worktree at <path>
#   2. Symlinks IntelliJ settings from the repo's .idea/ into the worktree
#      so all worktrees share the same IDE configuration.

REPO_ROOT="$(git rev-parse --show-toplevel)"
WORKTREES_ROOT="$(dirname "$REPO_ROOT")/plusone-worktrees"
IDEA_SRC="$REPO_ROOT/.idea"
WORKTREE_DIR="${2:-}"
BRANCH="$1"

# ── Helpers ───────────────────────────────────────────────────────────────
info()  { echo -e "\033[0;32m[+] $*\033[0m"; }
warn()  { echo -e "\033[0;33m[!] $*\033[0m"; }
error() { echo -e "\033[0;31m[✗] $*\033[0m"; exit 1; }

# ── Validate branch exists ────────────────────────────────────────────────
if [ -z "$BRANCH" ]; then
  error "Usage: $0 <branch> [<path>]"
fi

if ! git rev-parse --verify "$BRANCH" >/dev/null 2>&1; then
  error "Branch '$BRANCH' does not exist locally or remotely"
fi

# ── Determine worktree path ───────────────────────────────────────────────
if [ -z "$WORKTREE_DIR" ]; then
  # Auto-generate path from branch name
  WORKTREE_DIR="$WORKTREES_ROOT/$(echo "$BRANCH" | sed 's/[^a-zA-Z0-9._-]/-/g')"
fi

# Ensure worktrees root exists
mkdir -p "$WORKTREES_ROOT"

# Resolve to absolute path (macOS compatible)
case "$WORKTREE_DIR" in
  /*) ;; # already absolute
  *)  WORKTREE_DIR="$(pwd)/$WORKTREE_DIR" ;;
esac

# IntelliJ settings destination in worktree
IDEA_DST="$WORKTREE_DIR/.idea"

# ── Check if worktree already exists ──────────────────────────────────────
EXISTING=$(git worktree list --porcelain | awk '/^worktree / {print $2}' | grep -F "$WORKTREE_DIR" || true)
if [ -n "$EXISTING" ]; then
  warn "Worktree already exists at $WORKTREE_DIR"
  info "Reusing existing worktree on branch $(git -C "$WORKTREE_DIR" branch --show-current)"
else
  info "Creating worktree for '$BRANCH' at $WORKTREE_DIR"
  git worktree add -b "$BRANCH" "$WORKTREE_DIR" "$BRANCH" || \
    git worktree add "$WORKTREE_DIR" "$BRANCH"
fi

# ── Symlink IntelliJ settings ────────────────────────────────────────────
if [ ! -d "$IDEA_SRC" ]; then
  warn "No IntelliJ settings found at $IDEA_SRC — skipping symlink"
else
  # Remove stale symlink/directory
  if [ -e "$IDEA_DST" ] || [ -L "$IDEA_DST" ]; then
    rm -rf "$IDEA_DST"
  fi

  ln -s "$IDEA_SRC" "$IDEA_DST"
  info "Symlinked $IDEA_DST -> $IDEA_SRC"
fi

# ── Summary ───────────────────────────────────────────────────────────────
BRANCH_NAME=$(git -C "$WORKTREE_DIR" branch --show-current 2>/dev/null || echo "(detached)")
info "Worktree ready: $WORKTREE_DIR (branch: $BRANCH_NAME)"
info "Open in IntelliJ: $WORKTREE_DIR"
