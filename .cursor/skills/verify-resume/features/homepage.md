# Homepage

The homepage is the public landing page. A visitor sees a typed `Hello, Nick Here.` headline, an interactive puzzle portrait, About, a latest Today I Learned teaser, featured musings, a futures ticker, and header links to the rest of the site.

## Sub-features

- `home-hero` shows the typed headline and Contact me mailto action.
- `home-about` lands on the About section from the header About link.
- `home-nav` reaches Musings, Library, and TIL from the main navigation.
- `home-featured-writing` lists up to three musing cards that open `/writing/?article=<slug>`.
- `home-til-teaser` shows the latest note card or empty notebook copy, plus `View all notes`.
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
- **Open Musings from header.** Choose `Musings`. Run `control-resume browser click --role link --name "Musings"`. URL is `/writing/`. Heading contains `Nick's Musings`.
- **Return home.** Choose `Home`. Run `control-resume browser click --role link --name "Home"`. URL is `/` and the typed headline is back.
- **Open Library.** Choose `Library`. Run `control-resume browser click --role link --name "Library"`. URL is `/library/`. Heading contains `Learning Library` or the 404/error shelf copy.
- **Open TIL.** From `/`, choose `TIL`. Run `control-resume browser goto --path /` then `control-resume browser click --role link --name "TIL"`. URL is `/notes/`. Heading contains `Today I` or the missing-note copy.
- **Featured musing.** From `/`, wait for `.writing-card` or the empty musings copy. Run `control-resume browser goto --path /` and `control-resume browser wait --selector '.writing-card, .writing-empty-state'`. A card click uses `control-resume browser click --selector '.writing-card'`. Result URL matches `/writing/?article=` and an article `h1` appears. If only empty copy is shown, record that and do not invent a card.
- **Latest note teaser.** On `/`, inspect `#latestLearningNote`. A `.til-home-card` opens `/notes/<slug>`. Empty copy reads `New learning notes will appear here as I publish them.` `View all notes` goes to `/notes/`.
- **Release Pokemon.** Choose `Release a random Pokemon`. Run `control-resume browser click --role button --name "Release a random Pokemon"`. `#pokemonWalker` has class `is-released`. `#pokemonSprite` `alt` is one of Bulbasaur, Shinx, Flareon, Gengar, Pikachu, Blastoise, Dragonite, Mewtwo, Charizard, Giratina.
- **Scatter portrait.** Choose `Scatter the puzzle portrait and let it rebuild itself`. Run `control-resume browser click --role button --name "Scatter the puzzle portrait and let it rebuild itself"`. Capture a screenshot of the hero. The button remains on the page.
- **Proof.** Run `control-resume browser snapshot --aria --path .cursor/skills/verify-resume/evidence/homepage/result.aria.txt` and `control-resume browser screenshot --path .cursor/skills/verify-resume/evidence/homepage/result.png`. The artifacts show the wordmark `Nicholas Thomas` and the heading for the screen you left on.

## Gotchas

- Header labels render in CSS uppercase. Drive them as `Home`, `About`, `Musings`, `Library`, and `TIL` as in the markup. `control-resume` matches those names case-insensitively.
- The homepage wordmark is a reload button, not a link. Interior wordmarks are links to `/`.
- The `h1` text types in over about two seconds. The accessible name `Hello, Nick Here.` is present immediately.
- Featured musings first render from local samples, then may replace with Sanity. Wait for `.writing-card` or the empty state before asserting titles.
- `#latestLearningNote` starts as `Opening the notebook…` and then becomes a card or empty copy. Do not snapshot during the loading paragraph.
- Pokemon `alt` is random. Do not assert a specific species.
- Do not call internal puzzle or walker functions. Click the named buttons.
