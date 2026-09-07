# Card reveal verification — September 7, 2026

This replaces the earlier settle-only reveal and cooldown implementation. Changes are local; nothing has been pushed, merged, or deployed.

## Current behavior

- No cooldown. Mouse interaction, native taps, keyboard activation and Pokemon contact can start a new trick immediately after the active trick finishes. Active tricks are neither restarted nor queued.
- The next decoded photo is mounted invisibly in advance. It switches on at the final face-down keyframe: 81% for fan, 85% for riffle, 87% for Hindu.
- The entire photo frame is explicitly hidden while the Joker faces away. It reappears just after the final turn crosses 90 degrees, with the next image already present. Image opacity, frame opacity and card transforms share one Web Animations timeline.
- Settle retains that already-visible image node. It performs no image insertion, source change, decode or delayed crossfade.
- Cancellation removes the staged photo and its temporary opacity. Reduced motion restores the original childhood photo, including cancellation during cycle wraparound.
- Hero copy, navy/aqua palette, typewriter, NT back, Pokemon, ticker and shuffle trajectories remain intact.

## Checks

- Production build: passed (`npm run build`).
- Seven regression tests: passed (`node --test tests/cardPortrait.test.js`).
- Desktop Chromium, mobile Chromium and desktop WebKit: passed all three shuffle techniques.
- Mobile WebKit: passed all three shuffle techniques, including native taps and unchanged portrait pixels after settle.

The browser checks pause the actual animations at 0%, 20%, 78%, 87.5%, 90%, 92.5%, 95% and 99.5%. They verify that the incoming image cannot appear early, the photo frame is hidden while the card faces backward, and the new image is fully visible during the final face-up turn. Screenshots at 20% and 95% provide visual evidence.

The same animations also run on their normal three-second timeline. The real-time check compares photo visibility to the rendered card orientation, accounting for slow WebKit frame delivery. Portrait screenshots at settle and 1.1 seconds later must be pixel-identical, proving there is no delayed photo change. Native taps/clicks and keyboard activation are exercised, as is cancellation through reduced motion.

Evidence: `test-results/card-reveal/` (ignored by Git). The older `test-results/card-portrait/` records a superseded implementation and must not be used as evidence for this revision.

## Limits

Windows WebKit with an iPhone 13 viewport is not physical iOS Safari. Actual iPhone testing remains outstanding. These checks validate local source, not the unchanged production site.
