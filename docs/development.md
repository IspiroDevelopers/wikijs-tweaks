# Development

<!-- SPDX-License-Identifier: AGPL-3.0-only -->

## Setup

Node.js ≥ 20 (`.nvmrc` pins 24) **or** only Docker: `scripts/dev-node.sh` runs any command in a throwaway
`node:24-alpine` container with the repo mounted.

```sh
scripts/dev-node.sh npm ci --ignore-scripts
scripts/dev-node.sh npm run check        # typecheck + tests + build + hygiene
```

| Command | What |
|---|---|
| `npm run typecheck` | `tsc --noEmit` (strict) |
| `npm test` | unit tests with Vitest and jsdom; also builds the bundle and scans it |
| `npm run build` | `dist/wikijs-tweaks.js`, `dist/wikijs-tweaks.min.js`, `dist/SHA256SUMS` |
| `npm run test:compat` | runs the built bundle in Chromium against a real Wiki.js (needs Docker and a prior build). `sh scripts/compat-wikijs.sh --screenshots docs/images` also refreshes the documentation screenshots |
| `sh scripts/check-repo.sh` | hygiene: SPDX headers, no secret files, no private strings |

## Adding a tweak

1. Create `src/features/<name>/index.ts` exporting a `Feature` ([architecture](architecture.md)); put pure helpers in their own file.
2. Add it to `src/features/index.ts`.
3. Unit tests in `test/`, using `test/helpers/sidebar.ts` or a similar fixture with **invented** names.
4. A check in `scripts/compat/run.mjs` that exercises it in a real Wiki.js (and a screenshot if it is visible).
5. Documentation: `docs/features/<name>.md` (what it does, options, the Wiki.js elements it relies on, limits), a row in the
   README and in [configuration](configuration.md), an entry in the [changelog](../CHANGELOG.md).
6. Follow the [rules](architecture.md#rules-every-feature-follows); `test/build.test.ts` will fail if the bundle starts using the network.

## Branches and releases

`main` is always releasable; work in short-lived branches and open a pull request ([ADR-0001](adr/0001-one-bundle-opt-in-features.md)).
To release: update `version` in `package.json` and the changelog in a pull request, merge it, then push a tag `vX.Y.Z` on `main`.
The *Release* workflow checks that the tag matches `package.json`, runs the checks and publishes the files and `SHA256SUMS`.

## Test data

Fixtures, screenshots and examples use **invented** names only. Keep a local, git-ignored `.privacy-denylist` (one regular expression per
line) with the customer names and hostnames that must never be published; `scripts/check-repo.sh` fails on any of them.
