<!-- SPDX-License-Identifier: AGPL-3.0-only -->
## What and why

## Checklist

- [ ] `npm run check` passes (typecheck, tests, build) and `sh scripts/check-repo.sh` is clean
- [ ] Visible changes: `npm run test:compat` passes against a real Wiki.js
- [ ] Tests added or updated; a new tweak is **off by default** and `stop()` removes everything it added
- [ ] No page content, customer name, hostname, token or real screenshot in code, tests, fixtures or docs
- [ ] Docs, changelog and ADR updated if behaviour changed
- [ ] I agree my contribution is licensed under AGPL-3.0-only
