# Upgrading

<!-- SPDX-License-Identifier: AGPL-3.0-only -->

The script is a copy that lives in your wiki's settings, so an upgrade means replacing that copy. It takes
about two minutes and nothing else is involved: no server, no database. Read the [changelog](../CHANGELOG.md) first;
a new version never turns anything on by itself.

1. Download the new `wikijs-tweaks.js` and `SHA256SUMS` from the [releases page](https://github.com/IspiroDevelopers/wikijs-tweaks/releases) and
   check them (`sha256sum --check --ignore-missing SHA256SUMS`).
2. Open **Administration → Theme → Code Injection → Body HTML**. **Keep** your settings block
   (`window.WikiJsTweaks = { ... }`). Replace **only** the second `<script>`, the one that starts with
   `/*! wikijs-tweaks v…`, with the new file's content.
3. If you want a new tweak from the changelog, add it to the settings block (see [configuration](configuration.md)).
4. **Apply**, reload with **Ctrl+F5**, and run `WikiJsTweaks.status()` in the console.

If you load the file from your own server, replace the file and the `integrity="sha384-…"` hash together.

## Going back

Paste the previous copy again. It is always safe: the script keeps no data.

## Updating Wiki.js itself

Nothing to do: the setting is stored by Wiki.js and survives its updates. After a **major** update,
run `WikiJsTweaks.status()` once. If a tweak says `idle` with `sidebar not found`, Wiki.js changed
the markup; check the [compatibility page](compatibility.md) for a newer version of this project.
