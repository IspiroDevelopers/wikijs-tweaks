# Troubleshooting

<!-- SPDX-License-Identifier: AGPL-3.0-only -->

First step, always: reload with **Ctrl+F5**, open the browser console (F12) and run

```js
WikiJsTweaks.status()
```

(Turn on `debug: true` in the settings for more detail.)

| What you see | Cause | Fix |
|---|---|---|
| `WikiJsTweaks is not defined` | the settings block or the script is not on the page | check **Body HTML** and that you clicked **Apply**; pasted into *Head HTML* by mistake? move it to *Body HTML* |
| `status()` is not a function, or the settings are there but nothing runs | the script was not pasted, or an error stopped it. Look for a red error in the console | paste the **whole** file; compare with `SHA256SUMS` |
| Console: `unknown option "folderIdnex" is ignored` | a typo in the settings | fix the name (see [configuration](configuration.md)) |
| `state: "disabled"` | the tweak is not turned on | `enabled: true` exactly (not `"true"`) |
| `state: "idle"`, `sidebar not found` | the page has no sidebar (login page, editor) or Wiki.js changed its markup | open a normal page; if it still fails on every page, [report it](https://github.com/IspiroDevelopers/wikijs-tweaks/issues/new/choose) with your Wiki.js version |
| `state: "idle"`, `12 subfolders, at most 20` | the current folder is small enough | lower `minFolders` if you want the strip here |
| The strip shows on the wrong side or too close to the names | `side` | set `side: "left"` or `"right"` |
| It works for administrators but not for readers | the injected code is not served to guests, or a reverse proxy strips inline scripts | check with a signed-out window; see the next row |
| Console: *Refused to execute inline script because it violates the Content Security Policy* | your reverse proxy sends a CSP header without `'unsafe-inline'` | allow it (the script is yours), or serve the file from your own server and allow that address, see [installation](installation.md#alternative-serve-the-file-from-your-own-server) |
| The old version is still active | the browser cached the page | **Ctrl+F5**; check the `v…` in the banner on the first line of the pasted script |
| Everything is broken after pasting | a typo in a field | paste back the copy you made in step 2 of the [installation](installation.md) and start again |

## Reporting a problem

Open an [issue](https://github.com/IspiroDevelopers/wikijs-tweaks/issues/new/choose) with the output of
`WikiJsTweaks.status()`, your Wiki.js and browser versions and what you expected. **Do not paste** page content or
anything private; a screenshot of the sidebar with names hidden is enough. Security problems go to the private channel in [SECURITY.md](../SECURITY.md).
