# Today I Learned

Today I Learned is the public notebook of short published notes. A visitor reads the newest-first list, opens a note, and can follow an optional Learning From link back to a Library resource.

## Sub-features

- `notes-index` lists note cards under `Recent notes` or the empty notebook copy.
- `notes-detail` opens `/notes/<slug>` with body, date, and read time.
- `notes-learning-from` links to `/library/<slug>` when the note has a related resource.
- `notes-404` shows `Still learning.` for an unknown slug.
- `notes-from-home` opens the same index from the homepage `View all notes` and `TIL` links.

## How to get to it (user POV)

- Choose `TIL` in the header.
- Choose `View all notes` on the homepage.
- Choose the homepage latest-note card.
- Choose a related note card on a Library resource page.
- Open `/notes/` or `/notes/<slug>` directly.

## Driving it with control-resume

Preconditions:

- Resume is healthy at `http://127.0.0.1:5173`.
- `control-resume doctor` reports `ok`.

- **Open index from header.** Choose `TIL`. Run `control-resume browser goto --path /` then `control-resume browser click --role link --name "TIL"`. URL is `/notes/`. Wait until `[role="status"]` is gone. `h1` contains `Today I` or the missing-note heading.
- **Open index from homepage CTA.** From `/`, choose `View all notes`. Run `control-resume browser goto --path /` then `control-resume browser click --role link --name "View all notes"`. Same `/notes/` index appears.
- **Index content.** After load, either `.note-card` links exist or the empty copy `The notebook is open.` is visible. The count line reads `N note` or `N notes` when the toolbar rendered.
- **Open a note.** If a card exists, choose it. Run `control-resume browser click --selector '.note-card'`. URL is `/notes/<slug>`. `h1` matches the card title. `.detail-back` reads `← Today I Learned`. `.article-body` is not empty.
- **Learning From.** If `.learning-from` is present, choose it. Run `control-resume browser click --selector '.learning-from'`. URL becomes `/library/<slug>` and a resource title is shown. If the block is absent, record that the note has no related resource.
- **Unknown slug.** Run `control-resume browser goto --path /notes/this-slug-does-not-exist-verify`. `h1` contains `Still`. Body includes `This note could not be found.` A link `View all notes` returns to `/notes/`.
- **Proof.** Save ARIA and a screenshot. Run `control-resume browser snapshot --aria --path .cursor/skills/verify-resume/evidence/notes/result.aria.txt` and `control-resume browser screenshot --path .cursor/skills/verify-resume/evidence/notes/result.png`. Record live notes vs empty notebook.

## Gotchas

- The first paint is `Opening the notebook…` with `role="status"`. Wait until that node is gone.
- A load error reuses the same missing-note copy as a bad slug. Say which URL you opened.
- Empty notebook is valid. Do not publish a note to force a card.
- Direct `/notes/<slug>` and `/notes/?slug=<slug>` are the same entry.
- Homepage teaser copy `Opening the notebook…` is a loading placeholder, not the empty state.
