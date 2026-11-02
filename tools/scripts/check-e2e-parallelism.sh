#!/bin/sh
# Fails when an e2e target is not allowed to run in parallel.
# @nx/cypress sets parallelism: false when it can no longer infer the web server command
# (e.g. when it is prefixed with env vars), which makes the e2e job hang once all e2e projects are affected.
set -e

GRAPH_DIR=$(mktemp -d)
GRAPH_FILE="$GRAPH_DIR/project-graph.json"
trap 'rm -rf "$GRAPH_DIR"' EXIT

yarn nx graph --file="$GRAPH_FILE" >/dev/null

node -e '
const { nodes } = require(process.argv[1]).graph
const serial = Object.entries(nodes)
  .filter(([, project]) => project.data.targets?.e2e?.parallelism === false)
  .map(([name]) => name)
if (serial.length > 0) {
  console.error(`e2e target has parallelism: false in: ${serial.join(", ")}`)
  console.error("Do not prefix webServerCommands with env vars, set them via process.env in cypress.config.ts instead.")
  process.exit(1)
}
console.log("All e2e targets can run in parallel.")
' "$GRAPH_FILE"
