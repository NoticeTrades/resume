# Learning Library

The Learning Library is the public shelf of published learning resources. A visitor opens a resource from the list and follows related notes. A currently-learning CMA resource, when published, is called out above the rest of the shelf. Missing slugs and a failed load have their own copy.

## Sub-features

- `library-index` lists resource rows or the empty shelf copy.
- `library-cma` shows a `currently learning` callout when a published Currently Learning CMA/Gleim resource exists.
- `library-detail` opens `/library/<slug>` with progress, facts, and `Notes From This Resource`.
- `library-404` shows `nothing on this shelf` for an unknown slug.
- `library-related-notes` links related TIL notes when the resource has them.

## How to get to it (user POV)

- Choose `Library` in the header.
- Open `/library/` or `/library/<slug>` directly.
- Choose a `Learning From` link on a note detail page.

## Driving it with control-resume

Preconditions:

- Resume is healthy at `http://127.0.0.1:5173`.
- `control-resume doctor` reports `ok`.

- **Open shelf.** Choose `Library`. Run `control-resume browser goto --path /` then `control-resume browser click --role link --name "Library"`. URL is `/library/`. Wait with `control-resume browser wait --selector '.index-row, .index-empty, .index-featured'`. `h1` is `library` or the error shelf heading.
- **Index content.** After load, either `.index-row` links exist or the empty copy `Nothing on the shelf yet.` is visible.
- **Currently learning CMA.** If `.index-featured` is present, heading `#cmaStudyTitle` is `currently learning` and its `.index-row` opens `/library/<slug>`. If the callout is absent, record that no matching Currently Learning CMA resource is published.
- **Open a resource.** If a row exists, choose it. Run `control-resume browser click --selector '.index-row'`. URL is `/library/<slug>`. `h1.learning-detail-title` matches the row title. A progressbar named `Learning progress` is present. `.detail-back` reads `← Learning Library`.
- **Related notes.** On a detail page, the heading `Notes From This Resource` is present. Either `.index-row` links go to `/notes/<slug>`, or the empty copy `No notes yet.` is shown.
- **Unknown slug.** Run `control-resume browser goto --path /library/this-slug-does-not-exist-verify`. `h1` is `nothing on this shelf`. Body includes `That resource is not on this shelf.` A link `Back to the Library` returns to `/library/`.
- **Proof.** Save ARIA and a screenshot of the index or detail you drove. Run `control-resume browser snapshot --aria --path .cursor/skills/verify-resume/evidence/library/result.aria.txt` and `control-resume browser screenshot --path .cursor/skills/verify-resume/evidence/library/result.png`. Record whether the shelf had live resources, a CMA callout, or empty copy.

## Gotchas

- The index `h1` paints before Sanity settles. Wait for `.index-row`, `.index-empty`, or `.index-featured` before asserting the list. There is no `[role="status"]` loading copy.
- There are no type/status filter buttons and no `#learningCount`. Do not look for `Books`, `aria-pressed`, or `.resource-card`.
- Empty shelf is valid. It is not a failed launch.
- The CMA callout is data-driven. Absence is a published-data miss, not a harness failure. Do not create a Sanity resource to force it.
- Direct `/library/<slug>` and `/library/?slug=<slug>` are the same entry. Vite rewrites the clean path.
- Do not create Sanity resources to satisfy this feature.
