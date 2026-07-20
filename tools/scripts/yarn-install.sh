#!/usr/bin/env sh

# Runs `yarn install --immutable` with retries. Yarn's own `httpRetry` only
# retries individual HTTP requests; it does not recover when the fetch step is
# torn down as a whole (connection reset, EPIPE, TLS abort) under load. Retrying
# the entire install reuses the already-populated cache, so retries are cheap.

set -u

max_attempts=3
attempt=1

while true; do
  if yarn install --immutable; then
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
