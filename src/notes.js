import "./style.css";
import "./writing.css";
import "./learning.css";
import {
  buildSanityImageUrl,
  escapeHtml,
  loadLearningNote,
  loadLearningNotes,
} from "./lib/sanity.js";
import {
  initializeInteriorChrome,
  renderInteriorHeader,
  renderSiteFooter,
} from "./lib/siteChrome.js";
import { getRouteSlug, initializeRevealAnimations, setPageTitle } from "./lib/pageUi.js";

const app = document.querySelector("#app");
const noteSlug = getRouteSlug("notes");
let cleanupChrome = () => {};
let cleanupReveals = () => {};

function resourceInitials(title = "Learning") {
  return title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function renderNoteCard(note, index) {
  return `
    <a class="note-card reveal-on-scroll" href="/notes/${encodeURIComponent(note.slug)}" style="--reveal-delay: ${Math.min(index, 10) * 55}ms">
      <div class="note-card-topline">
        <span class="note-category">${escapeHtml(note.category)}</span>
        <span class="note-date">${escapeHtml(note.displayDate)}</span>
      </div>
      <h2>${escapeHtml(note.title)}</h2>
      <p>${escapeHtml(note.excerpt)}</p>
      <div class="note-card-footer">
        <span>${escapeHtml(note.readTimeLabel)}</span>
        ${note.relatedResource ? `<span class="note-resource-link">Learning from ${escapeHtml(note.relatedResource.title)}</span>` : ""}
        <span>Read note ↗</span>
      </div>
    </a>
  `;
}

function renderNotesIndex(notes) {
  return `
    <main class="learning-page">
      <section class="learning-hero reveal-on-scroll">
        <p class="section-kicker">small ideas worth keeping</p>
        <h1>Today I <span>Learned</span></h1>
        <p>
          Short notes from books, courses, markets, technology, and everyday
          curiosity—captured while the idea is still fresh.
        </p>
      </section>
      <section aria-labelledby="notesTitle">
        <div class="learning-toolbar reveal-on-scroll">
          <h2 id="notesTitle">Recent notes</h2>
          <p class="learning-count">${notes.length} ${notes.length === 1 ? "note" : "notes"}</p>
        </div>
        ${
          notes.length
            ? `<div class="note-list">${notes.map(renderNoteCard).join("")}</div>`
            : `<div class="learning-empty reveal-on-scroll" style="margin-top: 28px">
                <strong>The notebook is open.</strong>
                Publish a Learning Note in Sanity and it will appear here.
              </div>`
        }
      </section>
    </main>
  `;
}

function renderLearningFrom(resource) {
  if (!resource) return "";
  const cover = resource.coverImage
    ? `<img src="${escapeHtml(buildSanityImageUrl(resource.coverImage, 180))}" alt="${escapeHtml(resource.coverAlt || `${resource.title} cover`)}" loading="lazy" />`
    : escapeHtml(resourceInitials(resource.title));

  return `
    <a class="learning-from" href="/library/${encodeURIComponent(resource.slug)}">
      <div class="learning-from-cover">${cover}</div>
      <div>
        <span class="learning-from-label">Learning From</span>
        <strong>${escapeHtml(resource.title)}</strong>
      </div>
      <span aria-hidden="true">→</span>
    </a>
  `;
}

function renderNoteDetail(note) {
  if (!note) {
    setPageTitle("Note Not Found");
    return renderNotFound();
  }

  setPageTitle(`${note.title} — Today I Learned`);
  return `
    <main class="learning-page note-detail">
      <article class="note-detail-inner reveal-on-scroll">
        <a class="detail-back" href="/notes/">← Today I Learned</a>
        <header class="note-detail-header">
          <span class="note-category">${escapeHtml(note.category)}</span>
          <h1>${escapeHtml(note.title)}</h1>
          <div class="note-detail-meta">
            <span>${escapeHtml(note.displayDate)}</span>
            <span>${escapeHtml(note.readTimeLabel)}</span>
          </div>
          ${
            note.tags?.length
              ? `<div class="note-tags" aria-label="Tags">${note.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>`
              : ""
          }
        </header>
        <div class="article-signal" aria-hidden="true"><span></span></div>
        <div class="article-body">${note.bodyHtml}</div>
        ${renderLearningFrom(note.relatedResource)}
      </article>
    </main>
  `;
}

function renderNotFound() {
  return `
    <main class="learning-page">
      <section class="learning-hero reveal-on-scroll">
        <p class="section-kicker">404 / note misplaced</p>
        <h1>Still <span>learning.</span></h1>
        <p>This note could not be found. It may have been unpublished or moved.</p>
        <a class="resource-external" href="/notes/">View all notes <span aria-hidden="true">→</span></a>
      </section>
    </main>
  `;
}

function renderPage(content) {
  cleanupChrome();
  cleanupReveals();
  app.innerHTML = `${renderInteriorHeader("/notes/")}${content}${renderSiteFooter()}`;
  cleanupChrome = initializeInteriorChrome();
  cleanupReveals = initializeRevealAnimations(app);
}

async function initializeNotes() {
  renderPage('<main class="learning-page"><div class="loading-state" role="status">Opening the notebook…</div></main>');

  try {
    if (noteSlug) {
      const note = await loadLearningNote(noteSlug);
      renderPage(renderNoteDetail(note));
      return;
    }

    const notes = await loadLearningNotes();
    setPageTitle("Today I Learned");
    renderPage(renderNotesIndex(notes));
  } catch {
    renderPage(renderNotFound());
  }
}

initializeNotes();
