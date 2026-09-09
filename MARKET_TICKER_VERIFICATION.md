# Expanded market ticker and compact homepage — September 8, 2026

Local changes only; no push or deployment requested for this iteration.

## Data behavior

- Symbols: NQ, ES, YM, RTY futures; FTSE 100 (`^FTSE`) and Nikkei 225 (`^N225`) cash indices; BTC/USD and ETH/USD spot.
- Crypto: unauthenticated Kraken v2 ticker subscription, updated on trades. Display paints at most four times per second. Reconnect/backoff and hidden-page cleanup are bounded.
- Other markets: existing Yahoo chart endpoint, refreshed every 15 seconds, with shared response caching. These remain delayed quotes, not tick-by-tick futures data. Yahoo crypto quotes provide fallback if the Kraken stream is unavailable.
- Prices are never fabricated. Every symbol renders before fetching. Invalid/missing values show offline placeholders; last valid quotes remain visible with stale labels. Storage is optional and cached values expire after 24 hours on reload.
- Requests time out and never overlap. Server failures are isolated per symbol. Two equal groups with stable DOM and widths prevent an empty scrolling segment or animation restarts on updates.

Sources: [Kraken ticker schema](https://docs.kraken.com/exchange/api-reference/spot-websocket-v2/ticker), [Kraken public feeds](https://support.kraken.com/articles/360022326871-kraken-websocket-api-frequently-asked-questions), [Yahoo delays](https://help.yahoo.com/kb/finance/article-exchanges-data-delays-sln2310.html).

## Evidence

- Actual upstream smoke test returned all eight Yahoo quotes.
- Actual Chromium mobile browser connected to Kraken and showed live BTC and ETH prices alongside six delayed markets. X href verified as `https://x.com/nickonfinance`.
- `node --test tests/marketData.test.js tests/cardAudio.test.js tests/cardPortrait.test.js`: 16 pass. Includes per-symbol outage isolation, stale retention/expiry, malformed prices and request coalescing.
- `tests/marketTicker.browser.cjs`: Chromium and WebKit pass controlled slow/partial/offline responses, crypto messages, persistent cached values, unchanged ticker nodes, equal group widths, coverage through a whole animation cycle, corrected card ranks and stagger delays, and desktop visibility. Test fixtures are deliberately controlled; these are distinct from the actual-feed smoke test.
- Screenshots in ignored `test-results/market-ticker/` were inspected at mobile and desktop sizes.
- `tests/mobileNav.browser.cjs`: all four mobile/desktop routes, scrolling, focus, dismissal, resize and reduced-motion checks pass in Chromium and WebKit.
- Final production build passes. Width checks at 320, 390, 768, 900, 901, 1024, 1280 and 1440px report no horizontal overflow. The 901–1199px homepage header now places the ticker on a second row.
- Nick tested this iteration on iPhone and said the smaller homepage feels better. He requested more portrait spacing, so phone/tablet top inset was increased to 28px and the portrait-to-heading gap to 44px. His response did not explicitly confirm the Safari return/ticker test; do not infer that physical-device coverage from the layout feedback. Automated WebKit coverage is separate.

## Design

Menu cards now use A, 2, 3, 4, 5, with 20px labels and sequential entrances. The homepage uses smaller typography and portrait dimensions with reduced vertical spacing. Desktop keeps inline navigation; the drawer remains limited to 900px and below. Browser zoom and card physics are unchanged.
