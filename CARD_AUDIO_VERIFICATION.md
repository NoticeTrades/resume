# Card audio — September 7, 2026

## Mapping and levels

| Recorded sound | Trick | Cue from animation start | Measured loudness | True peak |
| --- | --- | ---: | ---: | ---: |
| Fan Cards.mp3 | Fan spread | 0.500s | -23.06 LUFS | -3.13 dBTP |
| Shuffle.mp3 | Riffle release | 1.240s | -23.01 LUFS | -3.90 dBTP |
| Count 4 cards.mp3 | Hindu packet pulls | 0.936s | -23.09 LUFS | -3.64 dBTP |

Removed leading/trailing silence, adjusted tempo without changing pitch, and matched loudness with individual gain and peak limiting. Prepared mono WAVs avoid MP3 encoder delay. Original recordings were not changed. Processing details are in `public/audio/cards/README.md`.

`src/lib/cardAudio.js` predecodes the recordings and schedules playback from the same animation start used by the cards. It unlocks on trusted input, keeps the opening autoplay silent, skips late/missing audio, and cancels pending or active sound when the trick is cancelled. Returning to the tab does not replay an old sound. There is still no shuffle cooldown.

## Results

- `npm run build`: passed.
- `node --test tests/cardAudio.test.js tests/cardPortrait.test.js`: 13 passed.
- Desktop/mobile Chromium: actual decoding, silent intro, input unlock, all three clips, cue scheduling within 80ms tolerance, and cancellation passed.
- Windows WebKit audio: not tested. The installed build does not expose Web Audio. This limitation is recorded rather than treated as a pass.
- **Physical iPhone Safari: Nick tested the Wi-Fi preview and reported, “All three sound right, including after returning to Safari.”** This is user-reported device verification; model/iOS version were not supplied, and no remote instrumentation was used.

Detailed normalization measurements and automated logs are under ignored `test-results/audio/`.

Changes remain local. Nothing was pushed, merged or deployed.

## First desktop interaction correction

Reproduced with a fresh Chromium browser and real mouse input: hover started a silent shuffle with AudioContext suspended; the click unlocked audio but was ignored by the active-shuffle guard. Zero sound sources played on that first click. The earlier desktop test used Enter and missed this path.

Hover and Pokemon contact now wait for an unlocked, running audio context. Direct click/tap/keyboard activation unlocks audio before starting the trick. The opening animation is explicitly silent. The readiness guard also prevents silent hover from consuming a click after audio interruption. No cooldown was added.

Retested using real first mouse clicks, subsequent hover, recovery from a suspended context, and mobile taps. Chromium desktop/mobile passed, including an analyser checking actual non-zero rendered audio samples. Production build and all 13 regression tests passed. The earlier physical iPhone result remains user-reported for the preceding revision; this desktop correction was not newly tested on a physical iPhone.
