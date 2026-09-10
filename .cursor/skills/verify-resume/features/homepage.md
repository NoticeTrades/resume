# Homepage

The homepage is the public landing page. A visitor sees a complete `Hello, Nick Here.` headline, an interactive card portrait, About, Today I Learned highlights, musings highlights, a market-prices ticker, and header links to the rest of the site.

## Sub-features

- `home-hero` shows the headline and Contact me mailto action.
- `home-about` lands on the About section from the header About link.
- `home-nav` reaches Musings, Library, and TIL from the main navigation.
- `home-featured-writing` lists up to three musing highlight rows that open `/writing/?article=<slug>`, or empty copy when none are published.
- `home-til-teaser` lists up to three note highlight rows that open `/notes/<slug>`, or empty copy, plus `all notes`.
- `home-pokemon` releases a named Pokemon from the pokeball button.
- `home-cards` shuffles the portrait from its named button.

## How to get to it (user POV)

- Open `/` in the browser.
- Choose `Home` in the header on the homepage (jumps to `#home`).
- Choose `Home` or the `Nicholas Thomas` wordmark on an interior page.
- Choose the homepage wordmark button `Nicholas Thomas` to reload `/`.

## Driving it with control-resume

Preconditions:

- Resume is healthy at `http://127.0.0.1:5173`.
- `control-resume doctor` reports `ok`.

- **Open landing.** Go to `/`. Run `control-resume browser goto --path /`. Title is `Nicholas Thomas`. An `h1` named `Hello, Nick Here.` exists. A button named `Shuffle Nicholas Thomas’s portrait cards` is present.
- **Read About.** Choose `About`. Run `control-resume browser click --role link --name "About"`. URL contains `#about`. Heading `about me` is visible. The About photo alt is `Nick and his girlfriend taking a mirror selfie`.
- **Open Musings from header.** Choose `Musings`. Run `control-resume browser click --role link --name "Musings"`. URL is `/writing/`. Heading is `musings`.
- **Return home.** Choose `Home`. Run `control-resume browser click --role link --name "Home"`. URL is `/` and the headline is back.
- **Open Library.** Choose `Library`. Run `control-resume browser click --role link --name "Library"`. URL is `/library/`. Heading is `library` or the missing-resource heading.
- **Open TIL.** From `/`, choose `TIL`. Run `control-resume browser goto --path /` then `control-resume browser click --role link --name "TIL"`. URL is `/notes/`. After `.index-row` or `.index-empty` appears, heading is `today i learned`. `still learning` on `/notes/` means the notes fetch failed (often a CORS/port miss), not an empty notebook.
- **Featured musing.** From `/`, wait for a highlight row or empty copy. Run `control-resume browser goto --path /` and `control-resume browser wait --selector '#featuredWritingGrid .highlights-row, #featuredWritingGrid .highlights-empty'`. A row click uses `control-resume browser click --selector '#featuredWritingGrid .highlights-row'`. Result URL matches `/writing/?article=` and an article `h1` appears. If only empty copy `Nothing published yet.` is shown, record that and do not invent a row.
- **Latest note teaser.** On `/`, inspect `#latestLearningNote`. Wait with `control-resume browser wait --selector '#latestLearningNote .highlights-row, #latestLearningNote .highlights-empty'`. A `.highlights-row` opens `/notes/<slug>`. Empty copy reads `Nothing published yet.` Choose `all notes` with `control-resume browser click --role link --name "all notes"` to reach `/notes/`.
- **Release Pokemon.** Choose `Release a random Pokemon`. Run `control-resume browser click --role button --name "Release a random Pokemon"`. `#pokemonWalker` has class `is-released`. `#pokemonSprite` `alt` is one of Bulbasaur, Shinx, Flareon, Gengar, Pikachu, Blastoise, Dragonite, Mewtwo, Charizard, Giratina.
- **Shuffle portrait.** Choose `Shuffle Nicholas Thomas’s portrait cards`. Run `control-resume browser click --role button --name "Shuffle Nicholas Thomas’s portrait cards"`. Capture a screenshot of the hero. The button remains on the page.
- **One intro, then idle.** Leave the visible portrait untouched for at least 14 seconds. It shuffles once on load, settles after three seconds, and does not replay. Fan, riffle, and Hindu techniques remain unchanged.
- **Interactions.** Enter the hero with a mouse, then after four seconds enter the card, then after another four seconds move at least 12px over it. Each action triggers a shuffle; a still cursor does not. In-flight actions never restart or queue motion. Click/tap and Enter/Space also work. Drag a released Pokemon into the card to check collision replay.
- **Photo rotation.** Verify on local port 5173. The childhood photo is visible initially. The next decoded photo is staged while the Joker is face-down, before the final flip. Observe at least two full shuffles: the new photo must already be present at the reveal, with no post-settle pop or letterboxing. Completion commits the new photo node. Cancel a shuffle by scrolling offscreen and confirm the current photo remains. Enabling reduced motion restores the childhood photo, and subsequent activation does not change it.
- **Skin.** Verify the SVG card back (`/nick-card-back.svg`) and Oxanium `NT` monogram plus ranks/suits. No eyebrow, replacement tagline, metaphor captions, sparkles, or glass contact button. The childhood photo, market ticker, and Pokemon remain. The headline types once with a blinking `.intro-cursor`; reduced motion hides that caret.
- **Reduced motion.** With the browser's reduced-motion preference enabled, the portrait remains assembled, even when activated. Enabling the preference during a shuffle cancels it immediately.
- **Offscreen.** Choose About or hide the tab during a shuffle; the cards settle. Returning leaves the portrait still until another interaction.
- **Proof.** Run `control-resume browser snapshot --aria --path .cursor/skills/verify-resume/evidence/homepage/result.aria.txt` and `control-resume browser screenshot --path .cursor/skills/verify-resume/evidence/homepage/result.png`. The artifacts show the wordmark `Nicholas Thomas` and the heading for the screen you left on.

## Gotchas

- Header labels render in CSS uppercase. Drive them as `Home`, `About`, `Musings`, `Library`, and `TIL` as in the markup. `control-resume` matches those names case-insensitively.
- The homepage wordmark is a reload button, not a link. Interior wordmarks are links to `/`.
- The accessible `h1` name is `Hello, Nick Here.` immediately via `aria-label`. Visible text types in once (`.intro-cursor`); reduced motion paints the full headline and hides the caret. `goto /` is ready when that aria-label exists; do not treat a partial visual `H` as a failed landing.
- Homepage highlights are title-and-date rows (`.highlights-row`), not card grids. Do not wait for `.writing-card` or `.til-home-card`.
- The homepage musings CTA is `all musings`. The TIL CTA is `all notes`.
- Empty highlight copy is `Nothing published yet.` Do not expect older empty strings.
- Pokemon `alt` is random. Do not assert a specific species.
- Do not call internal portrait or walker functions. Click the named buttons.
- Header links include decorative `aria-hidden` card ranks. Drive them as `Home`, `About`, `Musings`, `Library`, and `TIL`. `control-resume` snapshots skip those ranks.
- Sanity CORS is bound to `http://127.0.0.1:5173`. Another port makes `#featuredWritingGrid` and `#latestLearningNote` show `Nothing published yet.` even when documents are published.
