# Market ticker

The market ticker is the homepage strip of NQ, ES, YM, and RTY futures. It reads `/api/market-data` and falls back to labeled demo prices when that feed fails.

## Sub-features

- `ticker-visible` shows the strip named `Futures market prices` on `/`.
- `ticker-live` renders NQ, ES, YM, and RTY with status `Yahoo delayed` or another live payload status when the proxy returns quotes.
- `ticker-offline` renders the same four symbols with status `feed offline` when the proxy errors.
- `ticker-http` exposes `GET /api/market-data` as JSON from the same Vite origin used by the page.

## How to get to it (user POV)

- Open `/`. The strip sits in the header between the main nav and the social icons.
- Request `/api/market-data` in the same origin the page uses. There is no ticker on interior pages.

## Driving it with control-resume

Preconditions:

- Resume is healthy at `http://127.0.0.1:5173`.
- `control-resume doctor` reports `ok`.

- **Open homepage.** Run `control-resume browser goto --path /`. A region named `Futures market prices` exists (`[aria-label="Futures market prices"]`).
- **Wait for quotes.** Run `control-resume browser wait --selector '.ticker-item, .ticker-status'`. Four symbols appear: `NQ`, `ES`, `YM`, `RTY`.
- **Read status.** Run `control-resume browser text --selector '.ticker-status'`. Live is `Yahoo delayed` or another non-empty status from the payload. Offline is `feed offline`.
- **Fetch the proxy.** Run `control-resume http --path /api/market-data --out .cursor/skills/verify-resume/evidence/market-ticker/market-data.json --quiet`. `200` with a `quotes` array of NQ/ES/YM/RTY matches a live ticker. `502` with `Market data is temporarily unavailable` matches `feed offline`.
- **Cross-check.** If HTTP is 200, the on-page symbols must be those four contracts and status must not be `feed offline`. If HTTP is 502, status must be `feed offline` and demo prices may appear (NQ `23785.25` is the local demo NQ value).
- **Proof.** Capture the header strip and the HTTP body. Run `control-resume browser screenshot --path .cursor/skills/verify-resume/evidence/market-ticker/ticker.png` and `control-resume browser snapshot --aria --path .cursor/skills/verify-resume/evidence/market-ticker/ticker.aria.txt`. Keep the saved JSON. Both the visible status and the response status belong in `report.txt`.

## Gotchas

- Doctor does not require `/api/market-data` to be 200. Yahoo can fail while the site is healthy.
- `.ticker-status` text may render in CSS uppercase (`YAHOO DELAYED`). Match case-insensitively against `Yahoo delayed` or `feed offline`.
- Interior pages have no ticker. Do not look for it on `/writing/`, `/library/`, or `/notes/`.
- The strip duplicates items for animation. Count unique symbols, not `.ticker-item` nodes.
- Do not stub `fetch` inside the page. The production boundary is the Yahoo request inside the proxy.
- `VITE_MARKET_DATA_ENDPOINT` can point elsewhere. This skill assumes the default `/api/market-data` on the Vite origin.
