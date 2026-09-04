# Today I Learned

Today I Learned is the public notebook of short published notes. A visitor reads the newest-first list, opens a note, and can follow an optional Learning From link back to a Library resource.

## Sub-features

- `notes-index` lists note rows under `today i learned` or the empty notebook copy.
- `notes-detail` opens `/notes/<slug>` with body, date, and read time.
- `notes-learning-from` links to `/library/<slug>` when the note has a related resource.
- `notes-404` shows `still learning` for an unknown slug.
- `notes-from-home` opens the same index from the homepage `all notes` and `TIL` links.

## How to get to it (user POV)

- Choose `TIL` in the header.
- Choose `all notes` on the homepage.
- Choose a homepage note highlight row.
- Choose a related note row on a Library resource page.
- Open `/notes/` or `/notes/<slug>` directly.

## Driving it with control-resume

Preconditions:

- Resume is healthy at `http://127.0.0.1:5173`.
- `control-resume doctor` reports `ok`.

- **Open index from header.** Choose `TIL`. Run `control-resume browser goto --path /` then `control-resume browser click --role link --name "TIL"`. URL is `/notes/`. Wait with `control-resume browser wait --selector '.index-row, .index-empty'`. `h1` is `today i learned` or the missing-note heading.
- **Open index from homepage CTA.** From `/`, choose `all notes`. Run `control-resume browser goto --path /` then `control-resume browser click --role link --name "all notes"`. Same `/notes/` index appears.
- **Index content.** After load, either `.index-row` links exist or the empty copy `Nothing published yet.` is visible.
- **Open a note.** If a row exists, choose it. Run `control-resume browser click --selector '.index-row'`. URL is `/notes/<slug>`. `h1` matches the row title. `.detail-back` reads `← Today I Learned`. `.article-body` is not empty.
- **Learning From.** If `.learning-from` is present, choose it. Run `control-resume browser click --selector '.learning-from'`. URL becomes `/library/<slug>` and a resource title is shown. If the block is absent, record that the note has no related resource.
- **Unknown slug.** Run `control-resume browser goto --path /notes/this-slug-does-not-exist-verify`. `h1` is `still learning`. Body includes `this note could not be found.` A link `all notes` returns to `/notes/`.
- **Proof.** Save ARIA and a screenshot. Run `control-resume browser snapshot --aria --path .cursor/skills/verify-resume/evidence/notes/result.aria.txt` and `control-resume browser screenshot --path .cursor/skills/verify-resume/evidence/notes/result.png`. Record live notes vs empty notebook.

## Gotchas

- The index `h1` paints before Sanity settles. Wait for `.index-row` or `.index-empty` before asserting the list. There is no `[role="status"]` loading copy.
- There is no note-count toolbar. Do not look for `.note-card`.
- A load error reuses the same missing-note copy as a bad slug. Say which URL you opened.
- Empty notebook is valid. Do not publish a note to force a row.
- Direct `/notes/<slug>` and `/notes/?slug=<slug>` are the same entry.
- The homepage CTA is `all notes`, not `View all notes`.
