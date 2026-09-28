#!/usr/bin/env bash
# Install dependencies in Claude Code on the web sessions so `pnpm check` works immediately.
set -euo pipefail
[ "${CLAUDE_CODE_REMOTE:-}" = "true" ] || exit 0
cd "$CLAUDE_PROJECT_DIR"
corepack enable >/dev/null 2>&1 || true
pnpm install --frozen-lockfile --prefer-offline >/dev/null
