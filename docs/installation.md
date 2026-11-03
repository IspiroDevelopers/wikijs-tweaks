# Installation

<!-- SPDX-License-Identifier: AGPL-3.0-only -->

You need to be an **administrator of Wiki.js 2.x** (the *Administration* area). Nothing is
installed on the server: the script lives in a setting of Wiki.js. About 5 minutes.

Read the [disclaimer](../README.md#disclaimer) and check the [tested versions](compatibility.md) first.

## Step 1: Get the script

**From a release (recommended).** On the [releases page](https://github.com/IspiroDevelopers/wikijs-tweaks/releases/latest)
download `wikijs-tweaks.js` (readable) or `wikijs-tweaks.min.js` (smaller) and `SHA256SUMS`.
Check the file:

```sh
sha256sum --check --ignore-missing SHA256SUMS
# wikijs-tweaks.js: OK
```

**From source.** With Node.js 20 or newer, or with Docker alone:

```sh
git clone https://github.com/IspiroDevelopers/wikijs-tweaks.git && cd wikijs-tweaks
npm ci --ignore-scripts && npm run build          # or: scripts/dev-node.sh npm ci --ignore-scripts && scripts/dev-node.sh npm run build
```

The files are in `dist/`. To build with only some of the tweaks:
`npm run build -- --features folderIndex`.

## Step 2: Keep a copy of what is there

Open **Administration → Theme → Code Injection** and copy the current content of the three
fields (CSS, Head HTML, Body HTML) somewhere safe. If something goes wrong you can paste it back.

## Step 3: Paste the script

In **Body HTML** (add to what is already there; do not replace it) paste, first the settings and
then the **whole content** of `wikijs-tweaks.js` between `<script>` tags:

```html
<script>
window.WikiJsTweaks = {
  folderIndex: { enabled: true, minFolders: 20 }
};
</script>
<script>
/*! wikijs-tweaks v0.1.0 ... */
...the rest of the file...
</script>
```

Click **Apply**. Use the *Body HTML* field, not *Head HTML*: the script needs the page to exist.
The settings block comes first, because the script reads it when it starts. Every option is
explained in [configuration](configuration.md); a tweak you do not list stays off.

## Step 4: Check

1. Reload a Wiki.js page (**Ctrl+F5**) and open a folder with more subfolders than `minFolders`
   in the sidebar. The A–Z strip appears on its edge.
2. Open the browser console (F12) and type `WikiJsTweaks.status()`. You should see:

   ```
   { folderIndex: { state: "active", detail: "60 subfolders" } }
   ```

   `state` is `active` (running and showing), `idle` (running, nothing to show here; `detail` says why) or
   `disabled` (not turned on in your settings).

## Alternative: serve the file from your own server

If you prefer not to paste 10 kB into a setting, put `wikijs-tweaks.min.js` on a web server
**you control** (for example next to Wiki.js, under the same host) and load it with a
[Subresource Integrity](https://developer.mozilla.org/docs/Web/Security/Subresource_Integrity) hash, so that a changed file is
refused by the browser:

```html
<script>window.WikiJsTweaks = { folderIndex: { enabled: true } };</script>
<script src="/assets/wikijs-tweaks.min.js" integrity="sha384-..." crossorigin="anonymous"></script>
```

Create the hash with `openssl dgst -sha384 -binary wikijs-tweaks.min.js | openssl base64 -A`.
We deliberately do not host the script on a public CDN for you: code from a third party inside
your wiki would be a risk you do not need.

## Removing it

Delete the two `<script>` blocks from **Body HTML** and click **Apply**. Reload the page. Nothing else remains.
