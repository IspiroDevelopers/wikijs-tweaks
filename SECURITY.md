# Security Policy

<!-- SPDX-License-Identifier: AGPL-3.0-only -->

The script runs inside your wiki, so security reports are taken seriously.

## Reporting a vulnerability

**Please report privately.** Use GitHub's **"Report a vulnerability"** (Security → Advisories → *New draft security advisory*)
on this repository. Do **not** open a public issue, and never include real content, cookies or tokens in a report.

Helpful to include: the version (the banner on the first line of the script), the Wiki.js version, what an attacker needs, how to reproduce it on a test wiki and the impact you see.

This is a volunteer project: reports are handled on a best-effort basis. We coordinate a fix and a disclosure date with you and credit you in the advisory unless you prefer otherwise.

## No warranty

This software is provided as is, without warranty and without an independent audit; see the disclaimer in the
[README](README.md#disclaimer) and sections 15–16 of the [license](LICENSE).

## Supported versions

Only the latest release receives security fixes. The project is pre-1.0.

## Scope

In scope: the script, the build, the release files and the documentation's security guidance.
Out of scope: vulnerabilities in Wiki.js or your reverse proxy; please report those upstream.

## Design guarantees and known limits

- The script **makes no network requests, stores nothing in the browser, loads no library and never evaluates strings as code**;
  a test checks the built file for this ([ADR-0002](docs/adr/0002-no-network-no-storage.md)). It only reads the page and adds interface elements.
- It writes text with `textContent`, never HTML.
- **But:** anything pasted into the theme's code injection runs for every reader with the same rights as Wiki.js. Whoever can edit
  that setting, or the file if you serve it yourself, controls your wiki's pages. Protect the administrator account, check the file
  against `SHA256SUMS` before pasting, prefer pasting it to loading it from a third party, and use Subresource Integrity if you serve it.
