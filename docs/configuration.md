# Configuration

<!-- SPDX-License-Identifier: AGPL-3.0-only -->

The settings are one JavaScript object, `window.WikiJsTweaks`, placed **before** the script
(see [installation](installation.md)). Anything you leave out has its default. Unknown names are
reported in the browser console and ignored; wrong values fall back to the default and
are reported too.

```html
<script>
window.WikiJsTweaks = {
  language: "auto",                                  // optional
  debug: false,                                      // optional
  folderIndex: { enabled: true, minFolders: 20, side: "right" }
};
</script>
```

## General options

| Option | Values | Default | Meaning |
|---|---|---|---|
| `language` | `"auto"` or a two-letter code | `"auto"` | Language of the labels the script adds. `auto` follows the browser. Available: `en`, `it`; others show English. |
| `debug` | `true` / `false` | `false` | Writes what the script does to the browser console. |

## Tweaks

**Every tweak is off by default**, and is on only with `enabled: true` exactly (not `"true"`, not `1`).

| Tweak | Option | Values | Default | Meaning |
|---|---|---|---|---|
| [`folderIndex`](features/folder-index.md) | `enabled` | `true` / `false` | `false` | Turns the A–Z strip on. |
| | `minFolders` | whole number, 1 to 1000 | `20` | The strip appears when the current folder has **more** than this many subfolders. |
| | `side` | `"right"` / `"left"` | `"right"` | The edge of the sidebar the strip sits on. |

## In the browser console

`WikiJsTweaks.status()` returns the state of every tweak (`active`, `idle` with the reason, `disabled`).
`WikiJsTweaks.stop()` removes everything the script added until the next reload.
