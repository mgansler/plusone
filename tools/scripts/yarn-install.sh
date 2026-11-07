#!/usr/bin/env sh

# Runs `yarn install --immutable` with retries. Yarn's own `httpRetry` only
# retries individual HTTP requests; it does not recover when the fetch step is
# torn down as a whole (connection reset, EPIPE, TLS abort) under load. Retrying
# the entire install reuses the already-populated cache, so retries are cheap.
#
# Each attempt is also time-limited. Downloads started by install scripts in the
# link step (node-gyp headers, Cypress binary) are not covered by Yarn's
# `httpTimeout`, so a stalled connection can otherwise hang for >10 minutes and
# eat the whole job timeout. A regular install takes well under a minute.

set -u

max_attempts=3
attempt_timeout="${YARN_INSTALL_TIMEOUT:-240}"
attempt=1

# GNU timeout also signals the child processes (node-gyp, cypress), not only yarn.
# Fall back to no time limit where `timeout` is unavailable (e.g. macOS runners).
if command -v timeout >/dev/null 2>&1; then
  run_install() { timeout "${attempt_timeout}" yarn install --immutable; }
else
  run_install() { yarn install --immutable; }
fi

while true; do
  if run_install; then
    exit 0
  fi

  if [ "${attempt}" -ge "${max_attempts}" ]; then
    echo "yarn install failed after ${attempt} attempts" >&2
    exit 1
  fi

  delay=$((attempt * 10))
  echo "yarn install failed (attempt ${attempt}/${max_attempts}), retrying in ${delay}s..." >&2
  sleep "${delay}"
  attempt=$((attempt + 1))
done
