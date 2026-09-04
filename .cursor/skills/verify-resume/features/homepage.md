# Homepage

The homepage is the public landing page. A visitor sees a typed `Hello, Nick Here.` headline, an interactive puzzle portrait, About, Today I Learned highlights, musings highlights, a futures ticker, and header links to the rest of the site.

## Sub-features

- `home-hero` shows the typed headline and Contact me mailto action.
- `home-about` lands on the About section from the header About link.
- `home-nav` reaches Musings, Library, and TIL from the main navigation.
- `home-featured-writing` lists up to three musing highlight rows that open `/writing/?article=<slug>`, or empty copy when none are published.
- `home-til-teaser` lists up to three note highlight rows that open `/notes/<slug>`, or empty copy, plus `all notes`.
- `home-pokemon` releases a named Pokemon from the pokeball button.
- `home-puzzle` scatters the portrait from its named button.

## How to get to it (user POV)

- Open `/` in the browser.
- Choose `Home` in the header on the homepage (jumps to `#home`).
- Choose `Home` or the `Nicholas Thomas` wordmark on an interior page.
- Choose the homepage wordmark button `Nicholas Thomas` to reload `/`.

## Driving it with control-resume

Preconditions:

- Resume is healthy at `http://127.0.0.1:5173`.
- `control-resume doctor` reports `ok`.

- **Open landing.** Go to `/`. Run `control-resume browser goto --path /`. Title is `Nicholas Thomas`. An `h1` named `Hello, Nick Here.` exists. A button named `Scatter the puzzle portrait and let it rebuild itself` is present.
- **Read About.** Choose `About`. Run `control-resume browser click --role link --name "About"`. URL contains `#about`. Heading `about me` is visible. The About photo alt is `Nick and his girlfriend taking a mirror selfie`.
- **Open Musings from header.** Choose `Musings`. Run `control-resume browser click --role link --name "Musings"`. URL is `/writing/`. Heading is `musings`.
- **Return home.** Choose `Home`. Run `control-resume browser click --role link --name "Home"`. URL is `/` and the typed headline is back.
- **Open Library.** Choose `Library`. Run `control-resume browser click --role link --name "Library"`. URL is `/library/`. Heading is `library` or the missing-resource heading.
- **Open TIL.** From `/`, choose `TIL`. Run `control-resume browser goto --path /` then `control-resume browser click --role link --name "TIL"`. URL is `/notes/`. Heading is `today i learned` or the missing-note heading.
- **Featured musing.** From `/`, wait for a highlight row or empty copy. Run `control-resume browser goto --path /` and `control-resume browser wait --selector '#featuredWritingGrid .highlights-row, #featuredWritingGrid .highlights-empty'`. A row click uses `control-resume browser click --selector '#featuredWritingGrid .highlights-row'`. Result URL matches `/writing/?article=` and an article `h1` appears. If only empty copy `Nothing published yet.` is shown, record that and do not invent a row.
- **Latest note teaser.** On `/`, inspect `#latestLearningNote`. Wait with `control-resume browser wait --selector '#latestLearningNote .highlights-row, #latestLearningNote .highlights-empty'`. A `.highlights-row` opens `/notes/<slug>`. Empty copy reads `Nothing published yet.` Choose `all notes` with `control-resume browser click --role link --name "all notes"` to reach `/notes/`.
- **Release Pokemon.** Choose `Release a random Pokemon`. Run `control-resume browser click --role button --name "Release a random Pokemon"`. `#pokemonWalker` has class `is-released`. `#pokemonSprite` `alt` is one of Bulbasaur, Shinx, Flareon, Gengar, Pikachu, Blastoise, Dragonite, Mewtwo, Charizard, Giratina.
- **Scatter portrait.** Choose `Scatter the puzzle portrait and let it rebuild itself`. Run `control-resume browser click --role button --name "Scatter the puzzle portrait and let it rebuild itself"`. Capture a screenshot of the hero. The button remains on the page.
- **Proof.** Run `control-resume browser snapshot --aria --path .cursor/skills/verify-resume/evidence/homepage/result.aria.txt` and `control-resume browser screenshot --path .cursor/skills/verify-resume/evidence/homepage/result.png`. The artifacts show the wordmark `Nicholas Thomas` and the heading for the screen you left on.

## Gotchas

- Header labels render in CSS uppercase. Drive them as `Home`, `About`, `Musings`, `Library`, and `TIL` as in the markup. `control-resume` matches those names case-insensitively.
- The homepage wordmark is a reload button, not a link. Interior wordmarks are links to `/`.
- The `h1` text types in over about two seconds. The accessible name `Hello, Nick Here.` is present immediately.
- Homepage highlights are title-and-date rows (`.highlights-row`), not card grids. Do not wait for `.writing-card` or `.til-home-card`.
- The homepage musings CTA is `all musings`. The TIL CTA is `all notes`.
- Empty highlight copy is `Nothing published yet.` Do not expect older empty strings.
- Pokemon `alt` is random. Do not assert a specific species.
- Do not call internal puzzle or walker functions. Click the named buttons.
