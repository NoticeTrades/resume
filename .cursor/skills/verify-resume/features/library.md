# Learning Library

The Learning Library is the public shelf of published learning resources. A visitor filters the shelf, opens a resource, and follows related notes. Missing slugs and a failed load have their own copy.

## Sub-features

- `library-index` lists resource cards or the empty shelf copy.
- `library-filter` limits cards by type or status and updates the count.
- `library-detail` opens `/library/<slug>` with progress, facts, and `Notes From This Resource`.
- `library-404` shows `Nothing on this shelf.` for an unknown slug.
- `library-related-notes` links related TIL notes when the resource has them.

## How to get to it (user POV)

- Choose `Library` in the header.
- Open `/library/` or `/library/<slug>` directly.
- Choose a `Learning From` link on a note detail page.

## Driving it with control-resume

Preconditions:

- Resume is healthy at `http://127.0.0.1:5173`.
- `control-resume doctor` reports `ok`.

- **Open shelf.** Choose `Library`. Run `control-resume browser goto --path /` then `control-resume browser click --role link --name "Library"`. URL is `/library/`. Wait until `[role="status"]` is gone. `h1` contains `Learning Library` or the error shelf heading.
- **Index content.** After load, either `.resource-card` links exist or the empty copy `The first shelf is ready.` is visible. `#learningCount` reads `N resource` or `N resources` when cards exist.
- **Filter Books.** If cards exist, choose `Books`. Run `control-resume browser click --role button --name "Books"`. That button has `aria-pressed="true"`. Visible cards have `data-resource-type="Book"`. `#learningCount` matches the visible count. If none match, `#resourceFilterEmpty` is visible: `No resources match this filter yet.`
- **Reset All.** Choose `All`. Run `control-resume browser click --role button --name "All"`. `aria-pressed="true"` moves to `All`. All cards are visible again.
- **Open a resource.** If a card exists, choose it. Run `control-resume browser click --selector '.resource-card'`. URL is `/library/<slug>`. `h1.learning-detail-title` matches the card title. A progressbar named `Learning progress` is present. `.detail-back` reads `← Learning Library`.
- **Related notes.** On a detail page, the heading `Notes From This Resource` is present. Either `.note-card` links go to `/notes/<slug>`, or the empty copy `No notes yet.` is shown.
- **Unknown slug.** Run `control-resume browser goto --path /library/this-slug-does-not-exist-verify`. `h1` contains `Nothing on`. Body includes `That resource is not on this shelf.` A link returns to `/library/`.
- **Proof.** Save ARIA and a screenshot of the index or detail you drove. Run `control-resume browser snapshot --aria --path .cursor/skills/verify-resume/evidence/library/result.aria.txt` and `control-resume browser screenshot --path .cursor/skills/verify-resume/evidence/library/result.png`. Record whether the shelf had live resources or empty copy.

## Gotchas

- The first paint is `Opening the library…` with `role="status"`. Wait until that node is gone.
- Filters render only when at least one resource exists. Do not look for filter buttons on an empty shelf.
- Empty shelf is valid. It is not a failed launch.
- Direct `/library/<slug>` and `/library/?slug=<slug>` are the same entry. Vite rewrites the clean path.
- Do not create Sanity resources to satisfy this feature.
