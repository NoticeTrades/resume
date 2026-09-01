# Resume verification map

This directory is the maintained source for verifying the user-facing behavior of the public resume site. Read this index before driving, then use the matching feature file as the recipe.

## Baseline preconditions

- Launch with `control-resume launch --host 127.0.0.1 --port 5173` from the repository root after `npm install`.
- Put `.cursor/skills/verify-resume/bin` on `PATH`.
- Set `RESUME_VERIFY_DIR=/tmp/resume-verify` unless this run must share the machine with another instance. Then use a unique dir and port.
- Run `control-resume doctor` and require `ok` plus origin `http://127.0.0.1:<port>`.
- Never drive an instance that this run did not start.
- Do not open Sanity Studio. Do not publish or unpublish CMS documents.

## Driving conventions

- Start every recipe from the baseline unless its preconditions say otherwise.
- Prefer ARIA names, `data-filter`, `data-resource-filter`, and route paths over CSS position.
- Treat every command as literal. Keep quoted names and flags unchanged.
- Run browser actions through `control-resume browser`.
- Run raw HTTP through `control-resume http`.
- After a mutation-like UI action (filter, poke ball, portrait click), capture both the control state and the resulting view.

## Proof and skip reporting

- Capture the user action and the resulting state, not only the final screen.
- UI proof includes an ARIA snapshot and a screenshot that shows the site identity (wordmark or page heading).
- HTTP proof includes status code and body.
- Record the feature ID and entry point used with every artifact.
- Report an unreachable path with the attempted command and the unmet precondition.
- Do not report a skipped entry point as verified through a different path.
- Empty Library or TIL content is a valid published-data miss, not a harness failure. Record the empty copy.

## Feature entry contract

Each feature file starts with an H1 title and one paragraph describing the user-visible behavior. It then uses exactly four H2 sections in this order.

1. `Sub-features` lists short IDs with one line for each behavior.
2. `How to get to it (user POV)` lists every user entry point.
3. `Driving it with control-resume` starts with `Preconditions:` and uses labeled bullets that pair each user action with an exact command and observable result.
4. `Gotchas` lists traps that can waste or invalidate a verification run.

Keep implementation details out of the map. Name only user paths, stable handles, required state, commands, and observable proof.

## Features

- [Homepage](./homepage.md) covers the landing hero, About, featured musings, latest TIL teaser, and header navigation.
- [Nick's Musings](./writing.md) covers the writing index, category filters, and article detail including the sample fallback.
- [Learning Library](./library.md) covers the shelf, resource filters, detail pages, and missing-slug copy.
- [Today I Learned](./notes.md) covers the notes index, note detail, Learning From links, and missing-slug copy.
- [Market ticker](./market-ticker.md) covers the homepage futures strip and `GET /api/market-data`.
