# Contributing

<!-- SPDX-License-Identifier: AGPL-3.0-only -->

Thanks for helping. Code added here runs in the browser of everyone who reads a wiki, so changes are reviewed with
care; the rules below keep that quick.

## Ground rules

- **Security problems go to the private channel** in [SECURITY.md](SECURITY.md), not to a public issue.
- **Never** put real page content, customer names, hostnames, tokens or screenshots showing them in issues, pull requests, tests or fixtures. Use invented data.
- By contributing you agree that your contribution is licensed under **AGPL-3.0-only**. Add the SPDX header to new source files: `// SPDX-License-Identifier: AGPL-3.0-only`.
- Be kind: see the [Code of Conduct](CODE_OF_CONDUCT.md).

## Workflow

1. Open an issue first for a new tweak or anything larger than a small fix. Describe what the reader sees and which part of Wiki.js it touches.
2. Fork, branch from `main`, make the change **with tests**.
3. Run `npm run check` (Docker alone is enough: `scripts/dev-node.sh npm run check`) and, for visible changes, `npm run test:compat`. See the [development guide](docs/development.md).
4. Update the docs and the [changelog](CHANGELOG.md); if you change how the script behaves toward the page or the network, add an [ADR](docs/adr/README.md).
5. Open a pull request; the template has the checklist.

## What gets extra scrutiny

- Anything that adds a **capability**: network, storage, code evaluation, a new dependency ([ADR-0002](docs/adr/0002-no-network-no-storage.md)).
- DOM code: `textContent` only, never `innerHTML`.
- A new tweak must be **off by default** and reversible (`stop()` removes everything).
- Dependencies: the bundle has none at run time on purpose. Development dependencies are pinned exactly.

## Translations

Labels live in the tweak that shows them (for example `TEXT` in `src/features/folder-index/index.ts`). To add a language, add an object with the same keys.
