# Mobile menu and iPhone audio — September 8, 2026

Local preview: `http://127.0.0.1:5173/`; same-network phone preview: `http://192.168.1.74:5173/`.

## Changes

- Shared drawer on Home, Musings, Library and TIL at widths up to 900px. Desktop retains its original navigation and socials. Existing link nodes and listeners are reused.
- 23px link labels with decorative spade cards: A, 1, 2, 3, 4. Cards are hidden from screen readers and on desktop.
- Native modal background isolation, explicit keyboard cycling (including Safari), Escape/close/backdrop dismissal, page scroll restoration, same-page About navigation, desktop resize cleanup, and reduced-motion support.
- iOS playback audio-session policy requested only during gesture unlock. Unsupported session APIs fail gracefully; recorded cue timing and silent intro are preserved.

## Checks

- `node --test tests/cardAudio.test.js tests/cardPortrait.test.js`: 14 pass, including supported/rejected audio-session policy, silent intro, first activation, timing, cancellation and photo retention.
- `tests/cardAudio.browser.cjs`: Chromium desktop and mobile pass actual decoded audio, trusted activation, all three cues, interruption and cancellation. Installed Windows WebKit does not expose Web Audio; audio is explicitly not tested there.
- `tests/mobileNav.browser.cjs`: Chromium and WebKit pass the four mobile and desktop routes, keyboard focus, backdrop, scroll restoration, About anchor, Library navigation, resizing an open drawer, reduced motion and 320px width. Screenshots go to ignored `test-results/mobile-nav/`. WebKit screenshots were visually reviewed after the opening animation finished. The Windows WebKit run is browser-engine coverage, not physical iOS instrumentation.
- Final `npm run build`: pass.
- Chromium occasionally reports `Transition was skipped` when automated navigation supersedes the existing native cross-document transition. Tests log this exact browser cancellation separately; all other page exceptions fail the run. Navigation and the resulting page are still asserted.
- Automated `locator.tap()` can scroll a sticky trigger toward its original document position. The scrolled-page test uses a direct touchscreen tap at the visible button's measured coordinates.

## Physical iPhone

Nick tested the same-network preview in Safari with the bell muted and media volume up. He reported: “The side button looks good, and the sound plays.” He then requested smaller text and spade-card markers, which were added locally. Device model/iOS version were not supplied. This is user-reported device verification, not remote iOS instrumentation.

Reference: [WebKit's audio-session guidance](https://bugs.webkit.org/show_bug.cgi?id=237322#c6).

These changes have not been pushed. The latest checked remote main remains `894fbb2`.
