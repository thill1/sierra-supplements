#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
if [[ -f .playwright/e2e-runtime.env ]]; then
    set -a
    # shellcheck disable=SC1091
    source .playwright/e2e-runtime.env
    set +a
fi
if [[ ! -f .next/BUILD_ID ]]; then
    pnpm exec next build
fi
export PORT="${PORT:-3001}"
exec pnpm exec next start
