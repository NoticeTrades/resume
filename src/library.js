import "./style.css";
import "./writing.css";
import "./learning.css";
import {
  buildSanityImageUrl,
  escapeHtml,
  loadLearningResource,
  loadLearningResources,
  renderPortableText,
} from "./lib/sanity.js";
import {
  initializeInteriorChrome,
  renderInteriorHeader,
  renderSiteFooter,
} from "./lib/siteChrome.js";
import { getRouteSlug, initializeRevealAnimations, setPageTitle } from "./lib/pageUi.js";

const app = document.querySelector("#app");
const resourceSlug = getRouteSlug("library");
let cleanupChrome = () => {};
let cleanupReveals = () => {};

function statusKey(status = "") {
  return status.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function clampProgress(value) {
  return Math.min(100, Math.max(0, Number(value) || 0));
}

function resourceInitials(title = "Learning") {
  return title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function renderCover(resource, className = "resource-cover") {
  const image = resource.coverImage
    ? `<img src="${escapeHtml(buildSanityImageUrl(resource.coverImage, 720))}" alt="${escapeHtml(resource.coverAlt || `${resource.title} cover`)}" loading="lazy" />`
    : `<div class="resource-cover-placeholder" aria-hidden="true">${escapeHtml(resourceInitials(resource.title))}</div>`;

  return `<div class="${className}">${image}</div>`;
}

function renderProgress(resource) {
  const progress = clampProgress(resource.progress);
  return `
    <div
      class="resource-progress"
      role="progressbar"
      aria-label="Learning progress"
      aria-valuemin="0"
      aria-valuemax="100"
      aria-valuenow="${progress}"
    >
      <div class="resource-progress-label">
        <span>Progress</span>
        <span>${progress}%</span>
      </div>
      <div class="resource-progress-track" aria-hidden="true">
        <span style="--progress: ${progress}%"></span>
      </div>
    </div>
  `;
}

function renderRating(rating) {
  if (!Number.isFinite(Number(rating))) return "";
  return `<div class="resource-rating" aria-label="Rated ${escapeHtml(rating)} out of 5">★ ${escapeHtml(rating)} / 5</div>`;
}

function renderResourceCard(resource, index) {
  const status = resource.status || "Want to Learn";
  return `
    <a
      class="resource-card reveal-on-scroll"
      href="/library/${encodeURIComponent(resource.slug)}"
      data-resource-type="${escapeHtml(resource.resourceType)}"
      data-resource-status="${escapeHtml(status)}"
      style="--reveal-delay: ${Math.min(index, 8) * 65}ms"
    >
      <div class="resource-cover">
        ${
          resource.coverImage
            ? `<img src="${escapeHtml(buildSanityImageUrl(resource.coverImage, 640))}" alt="${escapeHtml(resource.coverAlt || `${resource.title} cover`)}" loading="lazy" />`
            : `<div class="resource-cover-placeholder" aria-hidden="true">${escapeHtml(resourceInitials(resource.title))}</div>`
        }
        <span class="resource-type-badge">${escapeHtml(resource.resourceType)}</span>
      </div>
      <div class="resource-card-body">
        <div class="resource-card-topline">
          <span class="resource-category">${escapeHtml(resource.category)}</span>
          <span class="learning-status" data-status="${statusKey(status)}">${escapeHtml(status)}</span>
        </div>
        <h2>${escapeHtml(resource.title)}</h2>
        <p class="resource-creator">${escapeHtml(resource.authorCreator || "Independent resource")}</p>
        ${renderProgress(resource)}
        ${renderRating(resource.rating)}
      </div>
    </a>
  `;
}

function renderLibrary(resources) {
  const cards = resources.length
    ? resources.map(renderResourceCard).join("")
    : `<div class="learning-empty reveal-on-scroll">
        <strong>The first shelf is ready.</strong>
        Add a Learning Resource in Sanity and it will appear here after publishing.
      </div>`;

  return `
    <main class="learning-page">
      <section class="learning-hero reveal-on-scroll">
        <p class="section-kicker">books, courses & useful rabbit holes</p>
        <h1>Learning <span>Library</span></h1>
        <p>
          A living shelf of the books, courses, certifications, research, and media
          shaping what I know—and what I am still working to understand.
        </p>
      </section>
      <section aria-labelledby="libraryTitle">
        <div class="learning-toolbar reveal-on-scroll">
          <h2 id="libraryTitle">On the shelf</h2>
          <p class="learning-count" id="learningCount">${resources.length} ${resources.length === 1 ? "resource" : "resources"}</p>
        </div>
        ${
          resources.length
            ? `<div class="learning-filters reveal-on-scroll" aria-label="Filter learning resources">
                <button type="button" data-resource-filter="all" class="is-active" aria-pressed="true">All</button>
                <button type="button" data-resource-filter="type:Book" aria-pressed="false">Books</button>
                <button type="button" data-resource-filter="type:Course" aria-pressed="false">Courses</button>
                <button type="button" data-resource-filter="type:Certification" aria-pressed="false">Certifications</button>
                <button type="button" data-resource-filter="status:Currently Learning" aria-pressed="false">Currently Learning</button>
                <button type="button" data-resource-filter="status:Completed" aria-pressed="false">Completed</button>
              </div>`
            : ""
        }
        <div class="resource-grid" id="resourceGrid">${cards}</div>
        ${resources.length ? '<p class="learning-empty" id="resourceFilterEmpty" hidden>No resources match this filter yet.</p>' : ""}
      </section>
    </main>
  `;
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function renderRelatedNote(note, index) {
  return `
    <a class="note-card reveal-on-scroll" href="/notes/${encodeURIComponent(note.slug)}" style="--reveal-delay: ${index * 70}ms">
      <div class="note-card-topline">
        <span class="note-category">${escapeHtml(note.category)}</span>
        <span class="note-date">${escapeHtml(note.displayDate)}</span>
      </div>
      <h3>${escapeHtml(note.title)}</h3>
      <p>${escapeHtml(note.excerpt)}</p>
      <div class="note-card-footer"><span>${escapeHtml(note.readTimeLabel)}</span><span>Read note ↗</span></div>
    </a>
  `;
}

function renderResourceDetail(resource, notes) {
  if (!resource) {
    setPageTitle("Resource Not Found");
    return renderNotFound("That resource is not on this shelf.", "/library/", "Back to the Library");
  }

  setPageTitle(`${resource.title} — Learning Library`);
  const status = resource.status || "Want to Learn";
  const thoughts = resource.personalSummary?.length
    ? `<section class="learning-detail-section reveal-on-scroll">
        <h2>My thoughts</h2>
        <div class="article-body">${renderPortableText(resource.personalSummary)}</div>
      </section>`
    : "";
  const takeaways = resource.keyTakeaways?.length
    ? `<section class="learning-detail-section reveal-on-scroll">
        <h2>Key takeaways</h2>
        <ul class="takeaway-list">${resource.keyTakeaways.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
      </section>`
    : "";

  return `
    <main class="learning-page resource-detail">
      <a class="detail-back" href="/library/">← Learning Library</a>
      <div class="resource-detail-grid">
        ${renderCover(resource, "resource-detail-cover reveal-on-scroll")}
        <article class="resource-detail-copy reveal-on-scroll">
          <div class="resource-card-topline">
            <span class="resource-type-badge">${escapeHtml(resource.resourceType)}</span>
            <span class="learning-status" data-status="${statusKey(status)}">${escapeHtml(status)}</span>
          </div>
          <h1 class="learning-detail-title">${escapeHtml(resource.title)}</h1>
          ${resource.authorCreator ? `<p class="resource-creator">By ${escapeHtml(resource.authorCreator)}</p>` : ""}
          <p class="resource-detail-description">${escapeHtml(resource.description)}</p>
          ${renderProgress(resource)}
          ${renderRating(resource.rating)}
          <div class="resource-facts">
            <div class="resource-fact"><span>Category</span><strong>${escapeHtml(resource.category)}</strong></div>
            <div class="resource-fact"><span>Type</span><strong>${escapeHtml(resource.resourceType)}</strong></div>
            <div class="resource-fact"><span>Started</span><strong>${escapeHtml(formatDate(resource.startDate))}</strong></div>
            <div class="resource-fact"><span>Finished</span><strong>${escapeHtml(formatDate(resource.finishDate))}</strong></div>
          </div>
          ${
            resource.externalUrl
              ? `<a class="resource-external" href="${escapeHtml(resource.externalUrl)}" target="_blank" rel="noreferrer">Open resource <span aria-hidden="true">↗</span></a>`
              : ""
          }
        </article>
      </div>
      ${thoughts}
      ${takeaways}
      <section class="learning-detail-section reveal-on-scroll" aria-labelledby="resourceNotesTitle">
        <h2 id="resourceNotesTitle">Notes From This Resource</h2>
        ${
          notes.length
            ? `<div class="note-list">${notes.map(renderRelatedNote).join("")}</div>`
            : `<div class="learning-empty"><strong>No notes yet.</strong>Learning notes connected to this resource will collect here automatically.</div>`
        }
      </section>
    </main>
  `;
}

function renderNotFound(message, href, label) {
  return `
    <main class="learning-page">
      <section class="learning-hero reveal-on-scroll">
        <p class="section-kicker">404 / still learning</p>
        <h1>Nothing on <span>this shelf.</span></h1>
        <p>${escapeHtml(message)}</p>
        <a class="resource-external" href="${href}">${escapeHtml(label)} <span aria-hidden="true">→</span></a>
      </section>
    </main>
  `;
}

function renderPage(content) {
  cleanupChrome();
  cleanupReveals();
  app.innerHTML = `${renderInteriorHeader("/library/")}${content}${renderSiteFooter()}`;
  cleanupChrome = initializeInteriorChrome();
  cleanupReveals = initializeRevealAnimations(app);
}

function initializeFilters(resources) {
  const buttons = document.querySelectorAll("[data-resource-filter]");
  const cards = document.querySelectorAll(".resource-card");
  const count = document.getElementById("learningCount");
  const empty = document.getElementById("resourceFilterEmpty");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.resourceFilter;
      let visibleCount = 0;

      buttons.forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      cards.forEach((card) => {
        const [kind, value] = filter.split(":");
        const visible =
          filter === "all" ||
          (kind === "type" && card.dataset.resourceType === value) ||
          (kind === "status" && card.dataset.resourceStatus === value);
        card.hidden = !visible;
        if (visible) visibleCount += 1;
      });

      if (count) count.textContent = `${visibleCount} ${visibleCount === 1 ? "resource" : "resources"}`;
      if (empty) empty.hidden = visibleCount > 0;
    });
  });

  if (count) count.textContent = `${resources.length} ${resources.length === 1 ? "resource" : "resources"}`;
}

async function initializeLibrary() {
  renderPage('<main class="learning-page"><div class="loading-state" role="status">Opening the library…</div></main>');

  try {
    if (resourceSlug) {
      const { resource, notes } = await loadLearningResource(resourceSlug);
      renderPage(renderResourceDetail(resource, notes));
      return;
    }

    const resources = await loadLearningResources();
    setPageTitle("Learning Library");
    renderPage(renderLibrary(resources));
    initializeFilters(resources);
  } catch {
    renderPage(renderNotFound("The Library could not be loaded right now. Please try again shortly.", "/library/", "Try the Library again"));
  }
}

initializeLibrary();
