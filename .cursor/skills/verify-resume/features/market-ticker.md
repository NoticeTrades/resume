# Market ticker

The market ticker is the homepage strip of eight symbols: NQ, ES, YM, RTY, BTC, ETH, FTSE, and NIKKEI. It reads `/api/market-data` and paints a status on each item. There is no strip-level `.ticker-status` and no demo-price fallback.

## Sub-features

- `ticker-visible` shows the strip named `Market prices` on `/`.
- `ticker-live` renders all eight symbols. After a successful proxy response, item status is the payload status (`delayed`) unless BTC/ETH have gone `live` over Kraken or a quote is `stale`.
- `ticker-offline` keeps the same eight symbols when the proxy errors. Missing quotes show `offline` and an em dash. A still-valid local cache shows `stale` and the last known price. It does not show `feed offline` or canned demo numbers.
- `ticker-http` exposes `GET /api/market-data` as JSON from the same Vite origin used by the page.

## How to get to it (user POV)

- Open `/`. The strip sits in the header between the main nav and the social icons.
- Request `/api/market-data` in the same origin the page uses. There is no ticker on interior pages.

## Driving it with control-resume

Preconditions:

- Resume is healthy at `http://127.0.0.1:5173`.
- `control-resume doctor` reports `ok`.

- **Open homepage.** Run `control-resume browser goto --path /`. A region named `Market prices` exists (`[aria-label="Market prices"]`).
- **Wait for items.** Run `control-resume browser wait --selector '.ticker-item'`. Eight unique symbols appear: `NQ`, `ES`, `YM`, `RTY`, `BTC`, `ETH`, `FTSE`, `NIKKEI`.
- **Read per-item status.** Do not query `.ticker-status`. Run `control-resume browser eval --js "[...document.querySelectorAll('.ticker-group:not([aria-hidden]) .ticker-item')].map((el) => el.dataset.symbol + ' ' + el.querySelector('.ticker-price').textContent + ' ' + el.querySelector('small').textContent).join('\\n')"`. Each `small` is `loading`, `delayed`, `live`, `stale`, or `offline`. Visible `em` shows the percent change, or `stale` / `offline` / `loading`.
- **Fetch the proxy.** Run `control-resume http --path /api/market-data --out .cursor/skills/verify-resume/evidence/market-ticker/market-data.json --quiet`. `200` with `status: "delayed"` and a `quotes` array of those eight symbols matches a live ticker. `502` with `Market data is temporarily unavailable` is a valid proxy failure.
- **Cross-check.** If HTTP is 200, the on-page symbols must be those eight contracts and item status must not be a strip-wide `feed offline`. If HTTP is 502, the UI shows `offline` with `—`, or `stale` with a cached price. Do not expect `feed offline` or NQ `23785.25`.
- **Proof.** Capture the header strip and the HTTP body. Run `control-resume browser screenshot --path .cursor/skills/verify-resume/evidence/market-ticker/ticker.png` and `control-resume browser snapshot --aria --path .cursor/skills/verify-resume/evidence/market-ticker/ticker.aria.txt`. Keep the saved JSON. Record the visible per-item statuses and the response status in `report.txt`.

## Gotchas

- Doctor does not require `/api/market-data` to be 200. Yahoo can fail while the site is healthy.
- There is no `.ticker-status` node. Status lives on each `.ticker-item` (`small` for the token, `em` for the visible change or fallback word). `small` is visually clipped; read it with `eval` / `textContent`, not a glance at the strip.
- Interior pages have no ticker. Do not look for it on `/writing/`, `/library/`, or `/notes/`.
- The strip duplicates items for animation. Count unique `data-symbol` values in the first `.ticker-group`, not `.ticker-item` nodes.
- BTC and ETH can flip to `live` from the Kraken socket while the Yahoo payload stays `status: "delayed"`.
- A 24-hour `localStorage` cache (`nt-market-v2`) can paint `stale` prices before or after a failed fetch. That is not a demo book.
- Do not stub `fetch` inside the page. The production boundary is the Yahoo request inside the proxy.
- `VITE_MARKET_DATA_ENDPOINT` can point elsewhere. This skill assumes the default `/api/market-data` on the Vite origin.
