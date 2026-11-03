# ADR-0001: One bundle, tweaks off by default, one trunk branch

<!-- SPDX-License-Identifier: AGPL-3.0-only -->

- Status: Accepted (2026-11-03)

## Context

Wiki.js 2.x lets an administrator add CSS and JavaScript in the theme's code injection, stored in the
database and kept across updates. We want a growing set of independent interface tweaks that each
administrator can pick from, without patching Wiki.js.

## Decision

1. **One repository, one script.** Every tweak is a module in `src/features/` built into one file.
2. **Choice at run time:** the administrator's `window.WikiJsTweaks` object enables each tweak; **all are off by default.**
   For a smaller file the build accepts `--features`.
3. **Branches:** `main` is always releasable and holds all tweaks. Work happens in short-lived branches and pull requests
   (`feature/<name>`, `fix/<name>`); there are no long-lived per-feature branches. A tweak that is not ready is merged
   **disabled and marked experimental** in its documentation.
4. **Versions** are `vX.Y.Z` tags with release notes in the [changelog](../../CHANGELOG.md); a new tweak is a minor version.

## Consequences

- Updating never changes how a wiki looks, because nothing is on until the administrator says so.
- Pasting the file once serves any combination of tweaks; there is nothing to merge between branches.
- The file grows with every tweak (a few kilobytes each); `--features` mitigates this.

## Alternatives rejected

- *One repository branch per tweak:* users would have to merge branches to combine two tweaks, and every update becomes a merge.
- *One repository per tweak:* the shared parts (settings, status, tests, release) would be copied around.
- *Tweaks on by default:* a version bump could change a production wiki unexpectedly.
