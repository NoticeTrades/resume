# Grok Team Briefing — bynickthomas.com

Read this before changing the site. For deeper architecture detail, also read `CURSOR_CONTEXT.md`.

**Site:** [www.bynickthomas.com](https://www.bynickthomas.com/)  
**Repo:** NoticeTrades/resume  
**Production branch:** `main` (Vercel deploys from `main`)  
**Owner:** Nicholas Thomas

---

## What this project is

A personal portfolio for Nick Thomas: finance / trading / technology. It is a **vanilla Vite multi-page site** (HTML + CSS + ES modules). It is **not React**.

Content is managed in **Sanity CMS** (`studio/`). The public site reads published documents only.

| Surface | Role |
| --- | --- |
| `/` | Homepage: hero, puzzle portrait, About, TIL highlights, Musings highlights, ticker, Pokemon |
| `/writing` | Nick's Musings (articles) |
| `/library` | Learning Library (books, courses, certifications) |
| `/notes` | Today I Learned short notes |
| `/api/market-data` | Yahoo Finance proxy for the futures ticker |
| `/api/record-view` | Server-only view counter for musings and notes |

There is **no `/study` route**. Do not add one unless Nick asks for it.

---

## Stack (do not reinvent)

- Frontend: Vite 6, plain JS, CSS
- CMS: Sanity project `vzrug3c0`, dataset `production`
- Hosting: Vercel from GitHub `main`
- Studio: [bynickthomas.sanity.studio](https://bynickthomas.sanity.studio/)
- Node: 20+

Shared modules to reuse instead of duplicating:

- `src/lib/sanity.js` — all Sanity queries / Portable Text / view recording
- `src/lib/siteChrome.js` — interior header, footer, nav, socials, Pokeball
- `src/lib/pageData.js` — session cache + nav prefetch (faster tab feel)
- `src/lib/pageUi.js` — scroll reveals, slug helpers
- `src/lib/pokemonRelease.js` — Pokeball release on every page
- `src/lib/puzzlePortrait.js` — homepage jigsaw portrait only

---

## What we have built so far

### Homepage

- Dark navy + aqua visual language, sticky header, market ticker
- Interactive **jigsaw puzzle portrait** (cutout silhouette, seat/scatter physics)
- **About me** section with scroll reveal + square photo
- **Today I Learned** and **Musings** homepage blocks are now **highlights**:
  - Same heading style as About (`section-heading` + rule)
  - Aqua **highlights** label
  - Clean title + date rows (no cards)
  - Rows pop in on scroll like About (fade + slight scale, staggered)
  - Up to **3 most viewed** published items (tie-break: featured, then newest)
  - Links to full indexes: “all notes” / “all musings”

### View counting

- Articles and Learning Notes have a read-only `views` number in Sanity
- Opening a **real** musing or note posts once per browser session to `POST /api/record-view`
- Server uses **`SANITY_API_WRITE_TOKEN` only** (never a `VITE_` write token)
- Sample/local fallback musings do **not** increment views
- Without the write token, counting is skipped safely; homepage still works

### Musings / Library / TIL indexes

- Typography lists (title + date/status), not category-chip card grids
- Library still pins a **currently learning CMA** resource at the top when a published match exists
- Session cache + hover prefetch so revisiting tabs feels instant
- Shared header hover underline; current page keeps aqua underline

### Pokemon

- One shared release module on homepage and interior pages
- Walker bounces off viewport edges and text/UI obstacles
- Homepage still disturbs the puzzle portrait on collision

### Content model (Sanity)

| Type | Used for |
| --- | --- |
| `article` | Long Musings posts |
| `learningResource` | Library items |
| `learningNote` | Short TIL notes |

Notes optionally reference one resource via `relatedResource`. Do not duplicate that relationship the other way.

---

## Recent decisions Grok bots must respect

1. **Do not convert the public site to React** unless Nick explicitly asks.
2. **Do not re-add `/study`** or study-schedule code unless Nick asks.
3. **Preserve the visual language** — dark navy, aqua accents, existing reveal motion. Prefer extending CSS over inventing a new system.
4. **Homepage TIL + Musings are highlights**, not full feeds. Full lists live on `/notes` and `/writing`.
5. **Homepage order is most views → featured → newest.** Do not invent fake view numbers in the UI.
6. **Never put Sanity write tokens in `VITE_` env vars** or commit secrets.
7. Keep Vite `vite.config.js` rewrites and `vercel.json` production rewrites aligned for `/library/[slug]` and `/notes/[slug]`.
8. Escape CMS text before injecting HTML. Use helpers in `src/lib/sanity.js`.
9. Prefer editing existing files over creating parallel systems.
10. After frontend changes, run `npm run build`. After schema changes, also build/deploy Studio.

---

## Environment (Vercel + local)

Public (safe in frontend):

```text
VITE_SANITY_PROJECT_ID=vzrug3c0
VITE_SANITY_DATASET=production
```

Server-only (for view counting):

```text
SANITY_API_WRITE_TOKEN=
```

Sanity CORS must allow local Vite origins and production domains. See `README.md` and `CURSOR_CONTEXT.md`.

---

## How Nick publishes content

1. Open Sanity Studio
2. Create/publish **Article**, **Learning Resource**, or **Learning Note**
3. Site reads **published** documents only — drafts stay invisible

Homepage Musings stay on sample articles until real articles are published in Sanity.

---

## Verify before shipping

1. `npm run build` at repo root
2. Check `/`, `/writing`, `/library`, `/notes` on desktop and mobile
3. Confirm homepage highlights show the **highlights** label and pop-in on scroll
4. Open one real note/musing and confirm no console errors
5. Confirm `/api/market-data` still returns JSON or homepage demo fallback works
6. After push to `main`, check production on Vercel

---

## Source of truth files

| File | Use |
| --- | --- |
| `GROK_TEAM_BRIEFING.md` | This handoff for Grok bots |
| `CURSOR_CONTEXT.md` | Full architecture and implementation notes |
| `README.md` | Setup, env, deploy basics |
| `studio/schemaTypes/*` | CMS field definitions |

When in doubt: match existing patterns on the live site, keep changes small, and do not widen scope beyond what Nick asked for.
