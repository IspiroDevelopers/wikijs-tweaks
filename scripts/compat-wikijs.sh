#!/bin/sh
# SPDX-License-Identifier: AGPL-3.0-only
#
# Runs the built bundle in a real browser against official Wiki.js images, in throwaway
# containers on a private network. Never touches a running wiki.
#   sh scripts/compat-wikijs.sh [--screenshots DIR] [image ...]     (default: ghcr.io/requarks/wiki:2)
set -eu
ROOT=$(cd "$(dirname "$0")/.." && pwd)
[ -f "$ROOT/dist/wikijs-tweaks.js" ] || { echo "Build first: npm run build" >&2; exit 1; }
SHOTS=""
if [ "${1:-}" = "--screenshots" ]; then SHOTS="$2"; shift 2; mkdir -p "$SHOTS"; fi
[ $# -gt 0 ] || set -- ghcr.io/requarks/wiki:2
PW_VERSION=$(sed -n 's/.*"playwright": "\([0-9.]*\)".*/\1/p' "$ROOT/package.json")
PW_IMAGE="mcr.microsoft.com/playwright:v${PW_VERSION}-noble"
status=0
for image in "$@"; do
  id="wjs-tweaks-$$-$(date +%s)"
  cleanup() { docker rm -f "$id-wiki" "$id-db" >/dev/null 2>&1 || true; docker network rm "$id" >/dev/null 2>&1 || true; }
  trap cleanup EXIT INT TERM
  echo "── $image"
  docker network create "$id" >/dev/null
  docker run -d --name "$id-db" --network "$id" -e POSTGRES_DB=wiki -e POSTGRES_USER=wiki -e POSTGRES_PASSWORD=compat postgres:17 >/dev/null
  docker run -d --name "$id-wiki" --network "$id" -e DB_TYPE=postgres -e DB_HOST="$id-db" -e DB_PORT=5432 \
    -e DB_USER=wiki -e DB_PASS=compat -e DB_NAME=wiki "$image" >/dev/null
  set -- "$@"
  extra=""
  [ -n "$SHOTS" ] && extra="-v $SHOTS:/out -e SHOTS=1 --user $(id -u):$(id -g) -e HOME=/tmp"
  # shellcheck disable=SC2086
  docker run --rm --network "$id" --ipc=host $extra -e WIKI="http://$id-wiki:3000" -v "$ROOT:/app:ro" -w /app \
    "$PW_IMAGE" node scripts/compat/run.mjs || status=1
  cleanup
  trap - EXIT INT TERM
done
exit $status
