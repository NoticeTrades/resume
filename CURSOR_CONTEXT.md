# Cursor Project Context — Nicholas Thomas Portfolio

Last verified: September 1, 2026

Read this file before making changes. It summarizes the current architecture, working features, content workflow, and important implementation decisions.

## Project overview

This repository powers Nicholas Thomas's personal portfolio at [www.bynickthomas.com](https://www.bynickthomas.com/). It combines a creative portfolio homepage, long-form writing, a Learning Library, short Today I Learned notes, live market data, and interactive Pokemon details.

The public website is a multi-page, vanilla JavaScript Vite application. It is not a React application. Sanity Studio is a separate React-based CMS application inside `studio/`.

Preserve the existing visual language: dark navy backgrounds, aqua accents, rounded cards, subtle borders and glows, pixel/Pokemon details, generous spacing, and scroll-triggered reveals. Extend existing components and CSS before introducing a new visual system.

## Technology and hosting

- Public frontend: Vite 6, HTML, CSS, and ES modules
- Rich text rendering: `@portabletext/to-html`
- CMS: Sanity project `vzrug3c0`, dataset `production`
- Public hosting: Vercel, deployed from the GitHub `main` branch
- Sanity Studio: [bynickthomas.sanity.studio](https://bynickthomas.sanity.studio/)
- Production website: [www.bynickthomas.com](https://www.bynickthomas.com/)
- Required Node.js version: 20 or newer

The repository root is the Vercel project root. Vercel runs `npm run build` and serves `dist/`.

## Important commands

Public site:

```powershell
npm install
npm run dev
npm run build
npm run preview
```

Sanity Studio:

```powershell
cd studio
npm install
npm run dev
npm run build
npm run deploy
```

Always run the public production build after frontend changes. Run the Studio build after schema or Studio configuration changes.

## Public routes

| Route | Purpose | Main entry file |
| --- | --- | --- |
| `/` | Portfolio homepage | `index.html`, `src/main.js` |
| `/writing` | Nick's Musings article index and article details | `writing/index.html`, `src/writing.js` |
| `/library` | Learning Library index | `library/index.html`, `src/library.js` |
| `/library/[slug]` | Individual Learning Resource | `library/index.html`, `src/library.js` |
| `/notes` | Today I Learned index | `notes/index.html`, `src/notes.js` |
| `/notes/[slug]` | Individual Learning Note | `notes/index.html`, `src/notes.js` |
| `/api/market-data` | Vercel serverless Yahoo Finance proxy | `api/market-data.js` |

Vite uses `vite.config.js` to build four HTML entry points. During local development it rewrites clean Library and Notes detail URLs to their index pages with a `slug` query parameter. `vercel.json` provides equivalent production rewrites. Keep both routing implementations aligned if these routes change.

## Current working features

### Homepage

- Responsive hero and About sections
- Interactive jigsaw portrait (see **Puzzle portrait** below)
- Square photo beside the About copy, popping in on scroll
- Scroll-triggered reveal animations
- Animated skill/interest items
- Featured Musings loaded from published Sanity articles
- Compact **Today I Learned** section loaded from the newest published Learning Note
- YouTube and email icon links in the header
- Clickable Pokeball with shine animation
- Random released Pokemon that can move and be dragged
- Scrolling futures ticker for NQ, ES, YM, and RTY

The ticker calls `/api/market-data` immediately and every eight seconds while the page is visible. The serverless endpoint queries Yahoo Finance and returns delayed data. Its Vercel cache is five seconds with stale-while-revalidate enabled. The UI falls back to demo values when the feed is unavailable.

### Puzzle portrait

The hero portrait is a real jigsaw rendered to the `#pixelPortrait` canvas by `src/lib/puzzlePortrait.js`. It replaced an earlier pixel-mosaic effect that scattered roughly 1,400 tiny quads and reassembled them with an underdamped spring, which read as a churning cluster rather than a picture.

How it works:

- The puzzle is a floating cutout of Nick, not a framed board. There is no tray, no rectangle, and no socket drawn behind an absent piece: a vacated slot reads as open hero.
- A grid is derived from the `.portrait-shell` size, targeting roughly 42px pieces and clamping to 5–10 columns and 6–12 rows. The grid is finer than a classic jigsaw because the outer edge of the puzzle is a silhouette, and smaller pieces trace it more faithfully.
- Which grid cells become pieces is read from the alpha channel of `/nick-cutout.webp`. Cells below `KEEP_THRESHOLD` coverage are dropped, and a piece's edge is flat wherever its neighbour was dropped, so the perimeter reads as a cut edge instead of stray tabs.
- Seam directions are stored once per grid in shared `vertical` and `horizontal` arrays. A tab on one piece is always the mirrored socket on its neighbour, so pieces genuinely interlock.
- Each piece is cut with a `Path2D` knob outline, tinted toward the navy/aqua palette, bevelled, and cached as its own offscreen canvas. Tints and bevels are then trimmed back to the cutout's alpha, so nothing paints outside the silhouette. The animation loop only draws these cached bitmaps, so pieces stay crisp and cheap to render.
- The snapshot crops Nick mid-chest and clips the newspaper at the frame, so the bottom and side bands are faded out. Without that the silhouette would end on ruler-straight lines and read as a cropped rectangle.
- The intro is a choreographed tween, not physics. Pieces fly in from their own side of the board with delays assigned by rank order of distance from centre, so they click into place at an even cadence from the outside in over roughly two seconds.
- Once seated, a piece is pinned exactly to its slot and skipped by the physics step, which is what keeps the assembled portrait sharp. A nearby cursor only applies a small smoothed magnetic offset.
- Clicking the portrait, sweeping the cursor quickly across it, or a Pokemon colliding with it unlocks pieces into free motion. Each piece drifts, then a damped spring pulls it home and snaps it back into its slot.

Implementation notes worth preserving:

- `/nick-cutout.webp` is background-removed and trimmed to the subject, which is why the image is contained inside the board rather than cropped to fill it. `/nick-pixel-source.jpg` is the untouched original and is no longer rendered. The cutout was produced with `rembg`'s `u2net_human_seg` model plus alpha matting; general-purpose models kept only the head and dropped the jacket and newspaper.
- The seat highlight is a prerendered bitmap trimmed the same way the artwork is. Stroking the piece outline directly flashed an aqua rectangle into empty hero for every piece on the silhouette.
- Every timestamp comes from one clock inside the animation loop. Mixing `performance.now()` with `requestAnimationFrame` timestamps previously left the intro permanently stalled at zero opacity.
- Piece impulses are capped by `MAX_PIECE_SPEED` and `MAX_SPIN`. The Pokemon and a fast cursor both push every frame they overlap a piece, so uncapped impulses compound.
- Cursor-driven releases use a much shorter hold than clicks and Pokemon hits, otherwise continuous mouse movement shoves pieces into a corner and piles them up.
- Resize rebuilds are skipped unless the board geometry actually changed, because mobile browsers fire `resize` when the address bar hides.
- Under `prefers-reduced-motion: reduce` the board renders once, fully assembled, and all scatter interactions are ignored.

### Anchor scrolling

`html` carries `scroll-padding-top: calc(var(--header-height) + 26px)` so header links such as About land with the section heading visible instead of tucked under the sticky header. `--header-height` is measured by `syncHeaderOffset()` rather than hardcoded, because the header wraps to two rows below 900px and three below 560px, growing from 60px to roughly 196px.

The anchored sections deliberately do not carry `reveal-on-scroll` themselves; their heading blocks do. While a section held the class, its `translateY(34px)` shifted the element the browser was scrolling to, so the jump overshot by that amount on top of the header overlap.

### Nick's Musings

- Published Sanity `article` documents appear on `/writing`
- Article detail views use their slug
- Portable Text, images, links, and uploaded Sanity videos are supported
- Featured articles are also used on the homepage
- The shared header includes Home, About, Musings, Library, TIL, YouTube, email, and the Pokeball interaction

### Learning Library

- `/library` queries all published `learningResource` documents
- Responsive cards display covers, titles, creators, resource types, categories, status, progress, and ratings where available
- Lightweight filters: All, Books, Courses, Certifications, Currently Learning, and Completed
- A **Currently learning CMA** callout sits above the shelf. It selects a published resource whose status is `Currently Learning` and whose title, type, category, tags, or author/creator mentions CMA, Gleim, or Certified Management Accountant. No extra CMS field is required.
- If no matching resource is published, the callout shows an empty state that points at [Sanity Studio](https://bynickthomas.sanity.studio/). The frontend does not hardcode a Gleim resource.
- `/library/[slug]` displays the full resource, personal thoughts, key takeaways, progress, rating, external link, and related notes
- Related notes are derived by querying Learning Notes that reference the resource

### Today I Learned

- `/notes` queries all published `learningNote` documents newest first
- Previews display title, date, category, calculated or manually supplied read time, excerpt, and related resource when present
- `/notes/[slug]` displays the note body, metadata, tags, and an optional **Learning From** link back to its resource
- Notes are intentionally lightweight and do not require hero images, SEO descriptions, or complex article fields

## Sanity content model

Schema registration lives in `studio/schemaTypes/index.js`.

### `article`

Used for longer Nick's Musings posts. Its schema is in `studio/schemaTypes/articleType.js`. It supports cover images, rich Portable Text, uploaded videos, and article metadata.

### `learningResource`

Defined in `studio/schemaTypes/learningResourceType.js`.

Important fields include title, generated slug, type, author/creator, cover, category, tags, learning status, progress from 0–100, optional rating from 1–5, dates, description, personal summary, key takeaways, external URL, featured flag, and display order.

### `learningNote`

Defined in `studio/schemaTypes/learningNoteType.js`.

Important fields include title, generated slug, publication date, short Portable Text body, category, tags, optional `relatedResource` reference, featured flag, and optional read time. When read time is blank, the frontend estimates it at approximately 220 words per minute.

The resource/note relationship is deliberately stored only on `learningNote.relatedResource`. Never add a duplicate array of notes to a resource. `loadLearningResource()` derives related notes with a GROQ query.

There is currently no Sanity Project document type, so Learning Notes do not contain a Project reference.

## Sanity data layer

All public Sanity queries and rendering helpers live in `src/lib/sanity.js`.

Key exports:

- `loadPublishedArticles()`
- `loadLearningResources()`
- `loadLearningResource(slug)`
- `loadLearningNotes()`
- `loadLearningNote(slug)`
- `loadLatestLearningNote()`
- `renderPortableText()`
- `estimateReadTime()`
- `buildSanityImageUrl()`

Queries use the published perspective, disable browser caching, and have a five-second timeout. Keep Sanity query fields synchronized with schema field names.

Sanity identifiers default to the production project in code but should also be configured in Vercel:

```text
VITE_SANITY_PROJECT_ID=vzrug3c0
VITE_SANITY_DATASET=production
```

These identifiers are public. Never expose a Sanity write token through a `VITE_` environment variable.

Required Sanity CORS origins include:

```text
http://127.0.0.1:5173
http://localhost:5173
http://localhost:5174
https://www.bynickthomas.com
https://bynickthomas.com
```

These are configured in Sanity Manage under the project's API settings, not in this repository. If a localhost origin is missing, Sanity answers local dev requests with `403 Forbidden`, the browser reports a CORS error, and the homepage keeps showing the sample articles from `src/content/articles.js` while the Learning Note sections fall back to their empty states. Production is unaffected. Vite picks the next free port when 5173 is taken, so allow the ports actually used locally.

## Shared frontend modules

- `src/lib/siteChrome.js`: shared interior-page header, footer, navigation, social links, and Pokeball markup
- `src/lib/puzzlePortrait.js`: homepage jigsaw portrait engine, exposing `disturb()`, `scatterFrom()`, `resume()`, and `pause()`
- `src/lib/pokemonRelease.js`: reusable Pokemon release and drag behavior for interior pages
- `src/lib/pageUi.js`: shared scroll reveal initialization and safe slug extraction
- `src/learning.css`: shared Library and Today I Learned styles
- `src/style.css`: homepage and shared global visual styles
- `src/writing.css`: Musings-specific styles

Prefer these shared modules over duplicating header, footer, reveal, or Pokemon logic. The homepage contains an older, more elaborate Pokemon implementation directly in `src/main.js`; interior pages use the reusable module.

## Publishing workflow

### Learning Resource

1. Open the hosted Sanity Studio.
2. Create a **Learning Resource**.
3. Enter the required fields and generate the slug from the title.
4. Set status and progress, then add optional details.
5. Publish it. It will appear on `/library`.

### Learning Note

1. Create a **Learning Note** in Sanity.
2. Enter a title, generate the slug, write the short body, and choose a category.
3. Optionally choose a resource under **Learning From**.
4. Publish it. It will appear on `/notes` and on the linked resource page.

### Long-form article

Create and publish an **Article** in Sanity. It will appear under `/writing` and may appear in the homepage Musings section when featured.

## Design and implementation guidelines

- Do not convert the public frontend to React unless the owner explicitly requests a migration.
- Do not rewrite working pages simply to add a feature.
- Reuse existing CSS variables, card treatments, typography, spacing, and motion patterns.
- Keep Library and TIL content driven by Sanity rather than hardcoded frontend arrays.
- Keep the Learning Note → Learning Resource relationship one-way in Sanity and query the reverse relationship.
- Maintain accessible labels, keyboard controls, reduced-motion behavior, and responsive layouts.
- Escape CMS-provided values before inserting them into HTML. Use the existing helpers in `src/lib/sanity.js`.
- Preserve graceful loading, empty, not-found, and API-error states.
- Do not add secret tokens to source control.
- Preserve unrelated user changes in a dirty working tree.

## Verification checklist

After relevant changes:

1. Run `npm run build` from the repository root.
2. If schemas changed, run `npm run build` from `studio/`.
3. Test `/`, `/writing`, `/library`, and `/notes` at desktop and mobile widths.
4. Test one real detail route for each content type when published content is available.
5. Test a nonexistent `/library/[slug]` and `/notes/[slug]` route.
6. Confirm `/api/market-data` returns JSON and that the homepage fallback remains usable when it fails.
7. Check the browser console for errors and confirm there is no horizontal mobile overflow.
8. After pushing `main`, verify the Vercel production pages and clean detail-route rewrites.

## Deployment state

The Learning Library and Today I Learned implementation was introduced in commit `1dd8358` (`Add connected learning library and notes`). At the time of this document, the repository's `main` branch matches `origin/main`, the Sanity Studio schemas are deployed, and the production Library and Notes routes are reachable.

