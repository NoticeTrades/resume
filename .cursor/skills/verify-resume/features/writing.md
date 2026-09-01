# Nick's Musings

Nick's Musings is the writing index and article reader. A visitor browses published articles, filters them by category, and opens a single musing. When Sanity is empty or unreachable, three local sample musings still appear.

## Sub-features

- `writing-index` lists musing cards under `Latest musings`.
- `writing-filter` hides cards that do not match the selected category button.
- `writing-detail` opens `/writing/?article=<slug>` with title, excerpt, body, and `← All musings`.
- `writing-sample` marks local fallback entries with a `Sample layout` aside.
- `writing-empty` shows `The next musing starts here.` when the list is truly empty.

## How to get to it (user POV)

- Choose `Musings` in the header from any page.
- Choose `Explore all musings` on the homepage.
- Choose a featured homepage card (opens a detail URL).
- Open `/writing/` or `/writing/?article=<slug>` directly.

## Driving it with control-resume

Preconditions:

- Resume is healthy at `http://127.0.0.1:5173`.
- `control-resume doctor` reports `ok`.

- **Open index from header.** From `/`, choose `Musings`. Run `control-resume browser goto --path /` then `control-resume browser click --role link --name "Musings"`. URL ends with `/writing/`. `h1` contains `Nick's Musings`. Title is `Nick's Musings | Nicholas Thomas` or, after a live Sanity load, the same.
- **Open index from homepage CTA.** From `/`, choose `Explore all musings`. Run `control-resume browser goto --path /` then `control-resume browser click --role link --name "Explore all musings"`. Same index heading appears.
- **Confirm cards or empty.** Run `control-resume browser wait --selector '.writing-library-card, .writing-library-empty'`. Cards are links whose `href` contains `/writing/?article=`. Empty copy is `The next musing starts here.`
- **Filter by category.** If cards exist, choose a non-`All` button. Run `control-resume browser click --selector '[data-filter]:not([data-filter="All"])'`. The chosen button has class `is-active`. Hidden cards have `[hidden]`. Visible cards keep `data-category` equal to the button's `data-filter`. Choosing `All` with `control-resume browser click --selector '[data-filter="All"]'` shows every card again. If a category has no cards, `.writing-empty` becomes visible with `No musings are available in this category yet.`
- **Open a musing.** Choose a card. Run `control-resume browser click --selector '.writing-library-card'`. URL contains `?article=`. An `h1` matches the card title. A link `.article-back` named `← All musings` is present.
- **Sample fallback.** If the article body includes `Sample layout`, record `writing-sample`. That is valid when Sanity did not replace the local articles. Live articles must not show that aside.
- **Return to index.** Choose `← All musings`. Run `control-resume browser click --selector '.article-back'`. URL is `/writing/` without `article` and the card list is back.
- **Direct detail entry.** Run `control-resume browser goto --path '/writing/?article=the-quiet-value-of-changing-your-mind'`. If that slug exists (sample or live), the detail `h1` is `The Quiet Value of Changing Your Mind`. If live Sanity no longer has that slug, the index renders instead. Record which outcome you got.
- **Proof.** Capture the index at the click and the detail after the card opens. Run `control-resume browser snapshot --aria --path .cursor/skills/verify-resume/evidence/writing/action-index.aria.txt` and `control-resume browser screenshot --path .cursor/skills/verify-resume/evidence/writing/action-index.png` on the list, then the same commands with `result-detail.aria.txt` and `result-detail.png` on the article. The detail artifacts must show the musing heading and `← All musings`.

## Gotchas

- The header link name is `Musings` in markup. CSS shows `MUSINGS`. Use `--name "Musings"`.
- First paint can show the three local sample musings. A successful empty Sanity response then replaces them with `The next musing starts here.` Click a card as soon as it appears, or wait ~2s and treat the settled empty copy as valid.
- Sanity may replace the sample list after first paint. Wait for cards before reading titles.
- Writing filter buttons do not use `aria-pressed`. Use `is-active` and visible vs `[hidden]` cards.
- A homepage featured card skips the index. That verifies `writing-detail`, not `writing-filter`.
- `curl /writing/` only returns the empty `#app` shell. It is not a musing list.
- Unknown `?article=` slugs render the index, not a 404 page.
