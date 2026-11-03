# Compatibility and tested versions

<!-- SPDX-License-Identifier: AGPL-3.0-only -->

"Tested" means exactly what the *How* column says. Anything not listed is **untested**: it may
work or not, and we make no claim either way. Checked on **2026-11-03** on one host (Ubuntu 24.04.4 LTS,
Docker Engine 29.3.0, Docker Compose 5.1.0, Chromium from Playwright 1.63.0).

## Wiki.js

| Version | Node.js in the image | How it was checked |
|---|---|---|
| **2.5.316** (`ghcr.io/requarks/wiki:2`) | 24.21.0 | `npm run test:compat`: a fresh wiki with 48 folders, the bundle injected through the theme's code injection, signed in as an administrator in Chromium, dark theme: the strip appears, lists `#`–`Z`, dims the empty letters, jumps and highlights, disappears and returns while navigating inside the single-page app, stays away from small folders and when disabled |
| 2.5.300 | 18.17.0 | same check |
| 2.5.170 | 14.14.0 | same check |

- **Wiki.js 3.x** is out of scope (a different interface); not tested.
- The tweaks depend on Wiki.js's markup, which is stable across 2.x but not a documented interface.
  Each tweak lists the elements it uses in its own page. The compatibility check runs on every change and weekly
  (the *CI* workflow), against the versions above.

## Browsers

Checked: Chromium (Playwright). The script uses only long-standing features (`MutationObserver`, `scrollIntoView`,
`String.prototype.normalize`, CSS `clamp()`), so current Firefox, Safari and Edge are expected to work; this is **not tested**.

## Theme

Checked with the default Wiki.js theme in dark mode. A light mode style is included but not part of the automated check. Custom themes that restructure the sidebar may not match.
