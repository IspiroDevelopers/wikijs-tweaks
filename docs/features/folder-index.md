# Folder index (A–Z)

<!-- SPDX-License-Identifier: AGPL-3.0-only -->

When a folder in the sidebar has many subfolders (a folder of customers, for example), Wiki.js
makes you scroll through all of them. The folder index adds a strip of letters on the edge of
the sidebar, like the tabs of an address book. A click on a letter scrolls to the first
subfolder starting with it and highlights it for a moment.

![The strip at the edge of the sidebar](images/folder-index-1-start.png)
![After a click on M](images/folder-index-2-jump.png)
![In Wiki.js's light theme the letters have the colour of the folder names](images/folder-index-3-light.png)

*(Test wiki with invented names.)*

## Turn it on

```html
<script>
window.WikiJsTweaks = { folderIndex: { enabled: true } };
</script>
```

Options (`minFolders`, `side`) are in [configuration](../configuration.md).

## Behaviour

- It appears **only** when the current folder has more subfolders than `minFolders` (default 20).
  Moving into a smaller folder removes it; moving back brings it back, without reloading the page.
- `#` collects names starting with a digit or a symbol (`01-Archive`, `3Towers`). Accents and capitals are ignored
  (`École` sits under `E`).
- Letters with no folder are dimmed and cannot be clicked.
- Only **folders** are counted; pages of the current folder are not.
- It works with the keyboard (Tab to a letter, Enter) and has a text label for screen readers, in English or Italian.
- It takes its colours from the folder names in your sidebar (white names give white letters, dark names dark letters), so it follows the dark and the light theme and custom sidebar colours.

## How it finds the folders

Wiki.js does not offer an interface for this, so the script reads the sidebar it already rendered:
the list in the navigation drawer, the "Current Directory" heading, and the folder items after it
(an item with a folder icon and a title). It only reads the titles you can already see,
makes no request, and writes nothing but its own strip.

## Limits

- It needs the sidebar in **folder-browsing navigation** (*Administration → Navigation*: *Mixed* or *Tree*) because that is
  where the folder list is shown. With a static navigation there is nothing to index.
- It has been tried on a wide screen only. On narrow screens, where Wiki.js hides the sidebar behind a menu button, it is **not tested**.
- If a future Wiki.js changes the markup of the sidebar, the strip stops appearing and
  `WikiJsTweaks.status().folderIndex.detail` says `sidebar not found`; see [troubleshooting](../troubleshooting.md).
- It does not filter or reorder the folders; the order is the one Wiki.js gives.
