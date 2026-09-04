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
import { readCache, sameSlugList, writeCache } from "./lib/pageData.js";
import { getRouteSlug, initializeRevealAnimations, setPageTitle } from "./lib/pageUi.js";

const app = document.querySelector("#app");
const resourceSlug = getRouteSlug("library");
let cleanupChrome = () => {};
let cleanupReveals = () => {};

const CMA_IDENTITY_PATTERN = /\b(cma|gleim|certified management accountant)\b/i;

function statusKey(status = "") {
  return status.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function resourceIdentityText(resource = {}) {
  return [resource.title, resource.resourceType, resource.category, resource.authorCreator, ...(resource.tags ?? [])]
    .filter(Boolean)
    .join(" ");
}

function isCmaStudyResource(resource) {
  return CMA_IDENTITY_PATTERN.test(resourceIdentityText(resource));
}

function findCurrentlyLearningCma(resources = []) {
  const matches = resources.filter(
    (resource) => resource.status === "Currently Learning" && isCmaStudyResource(resource)
  );
  return matches.find((resource) => resource.featured) ?? matches[0] ?? null;
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

function renderResourceRow(resource, index) {
  const cover = resource.coverImage
    ? `<img class="index-row-cover" src="${escapeHtml(buildSanityImageUrl(resource.coverImage, 160))}" alt="${escapeHtml(resource.coverAlt || `${resource.title} cover`)}" width="40" height="56" loading="lazy" />`
    : `<span class="index-row-cover-fallback" aria-hidden="true">${escapeHtml(resourceInitials(resource.title))}</span>`;
  const meta = resource.status || resource.resourceType || "";

  return `
    <li>
      <a class="index-row index-row-book index-enter" href="/library/${encodeURIComponent(resource.slug)}" style="--stagger: ${index + 1}">
        ${cover}
        <span class="index-row-copy">
          <span class="index-row-title">${escapeHtml(resource.title)}</span>
          ${resource.authorCreator ? `<span class="index-row-sub">${escapeHtml(resource.authorCreator)}</span>` : ""}
        </span>
        <span class="index-row-meta">${escapeHtml(meta)}</span>
      </a>
    </li>
  `;
}

function renderCmaStudyCallout(resource) {
  if (!resource) return "";

  return `
    <section class="index-featured" aria-labelledby="cmaStudyTitle">
      <h2 id="cmaStudyTitle" class="index-featured-label">currently learning</h2>
      <ul class="index-list">${renderResourceRow(resource, 0)}</ul>
    </section>
  `;
}

function renderLibrary(resources, { pending = false } = {}) {
  const cmaResource = findCurrentlyLearningCma(resources);
  const shelf = cmaResource
    ? resources.filter((resource) => resource.slug !== cmaResource.slug)
    : resources;

  return `
    <main class="index-page">
      <header class="index-intro index-enter">
        <h1>library</h1>
        <p>books, courses, and the other things still shaping what I know.</p>
      </header>
      ${renderCmaStudyCallout(cmaResource)}
      ${
        shelf.length
          ? `<ul class="index-list">${shelf.map((resource, index) => renderResourceRow(resource, index + (cmaResource ? 1 : 0))).join("")}</ul>`
          : cmaResource || pending
            ? ""
            : `<p class="index-empty index-enter" style="--stagger: 1">Nothing on the shelf yet.</p>`
      }
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
  const published = note.publishedAt ? ` datetime="${escapeHtml(String(note.publishedAt).slice(0, 10))}"` : "";
  return `
    <li>
      <a class="index-row index-enter" href="/notes/${encodeURIComponent(note.slug)}" style="--stagger: ${index + 1}">
        <span class="index-row-title">${escapeHtml(note.title)}</span>
        <time class="index-row-meta"${published}>${escapeHtml(note.displayDate)}</time>
      </a>
    </li>
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
            ? `<ul class="index-list">${notes.map(renderRelatedNote).join("")}</ul>`
            : `<p class="index-empty">No notes yet.</p>`
        }
      </section>
    </main>
  `;
}

function renderNotFound(message, href, label) {
  return `
    <main class="index-page">
      <header class="index-intro index-enter">
        <h1>nothing on this shelf</h1>
        <p>${escapeHtml(message)}</p>
        <p class="index-empty"><a href="${escapeHtml(href)}">${escapeHtml(label)}</a></p>
      </header>
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

async function initializeLibrary() {
  try {
    if (resourceSlug) {
      const { resource, notes } = await loadLearningResource(resourceSlug);
      renderPage(renderResourceDetail(resource, notes));
      return;
    }

    const cached = readCache("resources");
    setPageTitle("Learning Library");
    renderPage(renderLibrary(cached ?? [], { pending: !cached }));

    const resources = await loadLearningResources();
    writeCache("resources", resources);
    if (!cached || !sameSlugList(cached, resources)) renderPage(renderLibrary(resources));
  } catch {
    renderPage(renderNotFound("The Library could not be loaded right now. Please try again shortly.", "/library/", "Try the Library again"));
  }
}

initializeLibrary();
