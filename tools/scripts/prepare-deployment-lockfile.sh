#!/usr/bin/env sh
set -e

# Completes the pruned lockfile that Nx' `generatePackageJson` produces for the
# deployment output. Nx' Yarn Berry lockfile pruning drops some legitimate
# transitive dependencies (e.g. axios -> form-data), which makes a
# `yarn install --immutable` inside the container fail. Running
# `yarn install --mode=update-lockfile` re-resolves the full dependency graph and
# rewrites the lockfile without fetching packages or creating node_modules.
#
# It also writes the .yarnrc.yml that the container relies on (node-modules
# linker + build scripts for native modules like better-sqlite3).

OUTPUT_DIR="$1"

if [ -z "$OUTPUT_DIR" ]; then
  echo "Usage: $0 <output-dir>" >&2
  exit 1
fi

printf 'nodeLinker: node-modules\nenableScripts: true\n' > "$OUTPUT_DIR/.yarnrc.yml"

cd "$OUTPUT_DIR"
corepack yarn install --mode=update-lockfile
