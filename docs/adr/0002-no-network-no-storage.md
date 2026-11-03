# ADR-0002: The script never uses the network, storage or code evaluation

<!-- SPDX-License-Identifier: AGPL-3.0-only -->

- Status: Accepted (2026-11-03)

## Context

Code in the theme's code injection runs for every reader of the wiki, with the same rights as Wiki.js,
including access to the session of a signed-in user. The smaller the script's powers, the smaller the damage
a flaw (or a compromised copy) can do.

## Decision

The script does not call `fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource` or `sendBeacon`, does not use
`localStorage`, `sessionStorage` or cookies, does not call `eval` or `new Function`, does not write `innerHTML`
or `document.write`, and loads no library or remote file. It reads the page and adds interface elements.
A test (`test/build.test.ts`) scans the built bundle for these and fails the build when it finds one.

## Consequences

- A tweak cannot send page content anywhere or remember anything between visits. Features that need a setting use
  `window.WikiJsTweaks`, which the administrator controls.
- Some ideas (a favourites list, a recent-pages box) are not possible in this project as it is. They need a
  decision that changes this record first.
- Hosting the script on a public CDN is not offered, because it would put third-party code in the wiki.

## Alternatives rejected

- *Allow network access behind an option:* one switch away from sending page data out.
- *Persist settings in `localStorage`:* per-browser state is hard to explain and to support.
