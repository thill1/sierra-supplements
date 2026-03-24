#!/usr/bin/env bash
# Upsert admin_users: ADMIN_EMAILS from Vercel Production + DATABASE_URL from local .env.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

TMP="$(mktemp)"
cleanup() { rm -f "$TMP"; }
trap cleanup EXIT

vercel env pull "$TMP" --environment production --yes -S troy-hills-projects
SEED_VERCEL_ENV_PULL="$TMP" node scripts/run-seed-admins-vercel.mjs
