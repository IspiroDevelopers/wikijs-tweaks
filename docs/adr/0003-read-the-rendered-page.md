# ADR-0003: Tweaks read the page Wiki.js rendered, and are checked against real Wiki.js

<!-- SPDX-License-Identifier: AGPL-3.0-only -->

- Status: Accepted (2026-11-03)

## Context

Wiki.js 2.x has no extension interface for its sidebar. The only things a tweak can rely on are the
elements Wiki.js renders (its UI library, Vuetify, class names such as `.v-navigation-drawer`) and the page's behaviour as a
single-page application. These are stable across 2.x but not documented, and Wiki.js 3 is a different product.

## Decision

1. A tweak finds what it needs by **structure** (for example "the list items after the heading of the sidebar list")
   rather than by visible text, so it works in every language of Wiki.js.
2. It **does nothing and says why** (`status()`) when the structure is not found.
3. Every tweak is checked in a real browser against a real Wiki.js, on the versions in
   [compatibility](../compatibility.md), on every change and weekly. Each tweak's documentation lists the elements it relies on.
4. Unit tests build the markup of a real Wiki.js page (with invented names) to test the logic quickly.

## Consequences

- A Wiki.js update that changes the markup makes a tweak disappear rather than misbehave, and the weekly check shows it first.
- Wiki.js 3.x is not supported and would need its own work.

## Alternatives rejected

- *Fork or patch Wiki.js:* makes every update a merge, which is what the project avoids.
- *Match on visible words:* breaks in other languages.
