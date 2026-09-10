# Market ticker

The market ticker is the homepage strip of NQ, ES, YM, RTY, BTC, ETH, FTSE, and NIKKEI. It reads `/api/market-data` for Yahoo delayed quotes. BTC and ETH can also show Kraken `live` ticks. A symbol with no usable quote shows `—` and `offline` or `loading`. Last-known quotes can remain `stale`. There are no demo prices.

## Sub-features

- `ticker-visible` shows the strip named `Market prices` on `/`.
- `ticker-live` renders eight unique symbols. Per-item status is `delayed`, `live`, `stale`, or `loading` when a quote exists or is still in flight.
- `ticker-offline` keeps the same eight symbols when the proxy errors: prices stay `—` or last-known `stale`, not a global `feed offline` label and not fabricated numbers.
- `ticker-http` exposes `GET /api/market-data` as JSON from the same Vite origin used by the page.

## How to get to it (user POV)

- Open `/`. The strip sits in the header between the main nav and the social icons.
- Request `/api/market-data` in the same origin the page uses. There is no ticker on interior pages.

## Driving it with control-resume

Preconditions:

- Resume is healthy at `http://127.0.0.1:5173`.
- `control-resume doctor` reports `ok`.

- **Open homepage.** Run `control-resume browser goto --path /`. A region named `Market prices` exists (`[aria-label="Market prices"]`).
- **Wait for quotes.** Run `control-resume browser wait --selector '.ticker-item'`. Count unique `[data-symbol]` values, not `.ticker-item` nodes. The eight symbols are `NQ`, `ES`, `YM`, `RTY`, `BTC`, `ETH`, `FTSE`, `NIKKEI`.
- **Read per-item status.** Run `control-resume browser eval --js "[...document.querySelectorAll('.ticker-group:not([aria-hidden]) .ticker-item')].map(el => el.dataset.symbol + ':' + el.querySelector('small').textContent.trim() + ':' + el.querySelector('.ticker-price').textContent.trim())"`. Do not query `.ticker-status`; that class is unused CSS and is not in the DOM.
- **Fetch the proxy.** Run `control-resume http --path /api/market-data --out .cursor/skills/verify-resume/evidence/market-ticker/market-data.json --quiet`. `200` with a `quotes` array of those eight symbols and top-level `status` `delayed` matches a live Yahoo payload. `502` with `Market data is temporarily unavailable` matches a proxy error.
- **Cross-check.** If HTTP is 200, the on-page unique symbols must be those eight and per-item status must not be a single global `feed offline`. BTC/ETH may read `live` while futures read `delayed`. If HTTP is 502, prices may be `—` or stale last-known values from `localStorage`. Never expect demo NQ `23785.25`.
- **Proof.** Capture the header strip and the HTTP body. Run `control-resume browser screenshot --path .cursor/skills/verify-resume/evidence/market-ticker/ticker.png` and `control-resume browser snapshot --aria --path .cursor/skills/verify-resume/evidence/market-ticker/ticker.aria.txt`. The ARIA dump should include `region: Market prices`. Keep the saved JSON. Record HTTP status and per-item statuses in `report.txt`.

## Gotchas

- Doctor does not require `/api/market-data` to be 200. Yahoo can fail while the site is healthy.
- Interior pages have no ticker. Do not look for it on `/writing/`, `/library/`, or `/notes/`.
- The strip duplicates items for animation. Count unique `data-symbol` values, not `.ticker-item` nodes.
- Do not stub `fetch` inside the page. The production boundary is the Yahoo request inside the proxy, plus the Kraken WebSocket for BTC/ETH.
- `VITE_MARKET_DATA_ENDPOINT` can point elsewhere. This skill assumes the default `/api/market-data` on the Vite origin.
