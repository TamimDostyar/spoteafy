#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

PNPM_VERSION="10.33.0"

if ! command -v pnpm >/dev/null 2>&1; then
	if command -v corepack >/dev/null 2>&1; then
		corepack enable
		corepack prepare "pnpm@${PNPM_VERSION}" --activate
	else
		npm install -g "pnpm@${PNPM_VERSION}"
	fi
fi

pnpm install

cleanup() {
	if [[ -n "${server_pid:-}" ]] && kill -0 "$server_pid" >/dev/null 2>&1; then
		kill "$server_pid" >/dev/null 2>&1 || true
	fi

	if [[ -n "${dev_pid:-}" ]] && kill -0 "$dev_pid" >/dev/null 2>&1; then
		kill "$dev_pid" >/dev/null 2>&1 || true
	fi
}

trap cleanup EXIT INT TERM

pnpm run server &
server_pid=$!

pnpm run dev &
dev_pid=$!

while true; do
	if ! kill -0 "$server_pid" >/dev/null 2>&1; then
		wait "$server_pid"
		exit_code=$?
		cleanup
		exit "$exit_code"
	fi

	if ! kill -0 "$dev_pid" >/dev/null 2>&1; then
		wait "$dev_pid"
		exit_code=$?
		cleanup
		exit "$exit_code"
	fi

	sleep 1
done
