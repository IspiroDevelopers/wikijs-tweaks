#!/bin/sh
# SPDX-License-Identifier: AGPL-3.0-only
#
# Repository hygiene checks, run in CI and before publishing:
#   1. every source file carries an SPDX license identifier
#   2. no secret-looking files are tracked (env files, keys, dumps)
#   3. no 64-hex-character literals (API keys) in tracked files
#   4. no strings from your local, git-ignored .privacy-denylist (one regular
#      expression per line: customer names, your domains, IPs, e-mail addresses…),
#      neither in file contents, file names, nor in git author/commit data
#   5. no build output tracked
#
# Usage: sh scripts/check-repo.sh
set -eu
cd "$(dirname "$0")/.."

fail=0
problem() { echo "✘ $1"; fail=1; }

FILES=$(git ls-files --cached --others --exclude-standard)

# 1 ── license headers
for f in $(printf '%s\n' "$FILES" | grep -E '\.(ts|mjs|cjs|sh|yml|yaml|html|css)$'); do
  head -8 "$f" | grep -q 'SPDX-License-Identifier: AGPL-3.0-only' || problem "missing SPDX header: $f"
done

# 2 ── forbidden files
printf '%s\n' "$FILES" | grep -E '(^|/)(\.env(\..*)?|[^/]*\.env|[^/]*\.(key|pem|p12|pfx|sql|sql\.gz|dump)|TEST_[^/]*)$' \
  | grep -v -E '\.env\.example$' | while read -r f; do echo "✘ secret-looking file tracked: $f"; done | grep . && fail=1 || true

# 3 ── long hex literals
hex=$(printf '%s\n' "$FILES" | grep -v -E '^package-lock\.json$|\.png$' | xargs grep -n -I -E '\b[0-9a-fA-F]{64}\b' 2>/dev/null | grep -v -E 'check-repo:allow|@sha256:' || true)
[ -n "$hex" ] && { problem "64-hex literal (key?) found:"; echo "$hex" | sed 's/^/    /'; }

# 4 ── private strings
if [ -f .privacy-denylist ]; then
  pattern=$(grep -v -E '^\s*(#|$)' .privacy-denylist | paste -sd'|' -)
  if [ -n "$pattern" ]; then
    hits=$(printf '%s\n' "$FILES" | grep -v -E '\.png$' | xargs grep -n -I -i -E "$pattern" 2>/dev/null | grep -v '^.privacy-denylist' || true)
    [ -n "$hits" ] && { problem "private strings in file contents:"; echo "$hits" | sed 's/^/    /'; }
    names=$(printf '%s\n' "$FILES" | grep -i -E "$pattern" || true)
    [ -n "$names" ] && { problem "private strings in file names:"; echo "$names" | sed 's/^/    /'; }
    if git rev-parse --verify HEAD >/dev/null 2>&1; then
      meta=$(git log --format='%an <%ae>%n%cn <%ce>%n%B' | grep -i -E "$pattern" || true)
      [ -n "$meta" ] && problem "private strings in git history (authors/messages)"
    fi
  fi
else
  echo "ℹ no .privacy-denylist found: skipping the private-strings check (create one before publishing; it is git-ignored)"
fi

# 5 ── build output
printf '%s\n' "$FILES" | grep -E '^dist/' | grep -q . && problem "build output is tracked (dist/)"

if [ "$fail" = 0 ]; then echo "✔ repository checks passed"; else exit 1; fi
