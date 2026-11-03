# Changelog

<!-- SPDX-License-Identifier: AGPL-3.0-only -->

All notable changes are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/);
versions follow [Semantic Versioning](https://semver.org/) (pre-1.0: minor versions may contain breaking changes, which are always listed).

## [Unreleased]

## [0.1.1] — 2026-11-03

Drop-in upgrade from 0.1.0: replace the pasted script, keep your settings.

### Fixed
- **Folder index:** the letters had dark text on a blue sidebar in Wiki.js's light theme. The strip now takes its colours from the folder names themselves, so white names give white letters and dark names on a light sidebar give dark letters, in every theme. It no longer looks at the page's theme class.

## [0.1.0] — 2026-11-03

First release.

### Added
- The script itself: one file, a settings object (`window.WikiJsTweaks`), `status()` and `stop()` in the browser console. Every tweak is off until enabled.
- **Folder index** (`folderIndex`): an A–Z strip in the sidebar of folders with more than `minFolders` (default 20) subfolders, on the `right` or `left` edge, in English and Italian.
- Build with `--features` for a file with only some tweaks, `SHA256SUMS`, a build test that checks the bundle uses no network, storage or code evaluation.
- Checks in a real browser against Wiki.js 2.5.316, 2.5.300 and 2.5.170.
