# Architecture

<!-- SPDX-License-Identifier: AGPL-3.0-only -->

One script, made of small independent **tweaks** (called *features* in the code), built into a single file.

```
window.WikiJsTweaks = { ... }  ──►  core/run.ts  ──►  for every feature with enabled: true:
   (your settings)                  reads settings        normalize(options)  →  start(options, env)
                                    one failure never          │
                                    stops the others           └─ returns { stop(), status() }
```

## Parts

| Path | What |
|---|---|
| `src/core/run.ts` | Reads `window.WikiJsTweaks`, validates it, starts the enabled features, exposes `status()` and `stop()`, runs only once per page |
| `src/core/dom.ts` | `env`: a debounced `watch()` of the page (Wiki.js is a single-page app), `injectStyle()`, logging. Everything the script adds carries `data-wjs-tweaks`, and changes inside it are ignored, so a feature cannot trigger itself |
| `src/features/<name>/` | One tweak: its code, its styles, its pure helpers. `src/features/index.ts` lists them |
| `scripts/build.mjs` | esbuild: one readable file, one minified file, `SHA256SUMS`; `--features a,b` builds a subset |
| `scripts/compat-wikijs.sh` | Starts a throwaway Wiki.js + PostgreSQL and runs the bundle in Chromium |

## A feature

```ts
export const myFeature: Feature<Options> = {
  id: 'myFeature',                       // the key in window.WikiJsTweaks
  title: 'Human name',
  normalize(raw, warn) { /* turn user input into valid options, warn on bad values */ },
  start(options, env) {
    const stopWatching = env.watch(() => { /* idempotent: look at the page, add or remove your UI */ })
    return { stop() { /* undo everything */ }, status: () => ({ state: 'active' }) }
  },
}
```

## Rules every feature follows

1. **Off by default;** `enabled: true` turns it on.
2. **Idempotent and reversible.** `update()` may run any number of times; `stop()` removes everything the feature added.
3. **Text only.** User-visible text goes in with `textContent`; no `innerHTML`, so a folder named `<img onerror=…>` is only text.
4. **No network, no storage, no eval, no dependencies at run time,** and no `localStorage`/cookies. A build test fails if the bundle contains any of these.
5. **Fail safe and explain.** If the expected markup is not there, do nothing and say why in `status()`; never throw into the page.
6. **Depend on as little of Wiki.js as possible,** and name those elements in the feature's documentation page.

The reasons are in the [decision records](adr/README.md).
