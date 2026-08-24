import "./style.css";
import "./writing.css";
import { articles } from "./content/articles.js";
import { escapeHtml, loadPublishedArticles } from "./lib/sanity.js";
import {
  initializeInteriorChrome,
  renderInteriorHeader,
  renderSiteFooter,
} from "./lib/siteChrome.js";

const app = document.querySelector("#app");
const params = new URLSearchParams(window.location.search);
let writingArticles = articles;
let cleanupPokemonRelease = () => {};

function renderArticleCard(article, index) {
  return `
    <a
      class="writing-card writing-library-card reveal-on-scroll"
      href="/writing/?article=${encodeURIComponent(article.slug)}"
      data-category="${escapeHtml(article.category)}"
      style="--reveal-delay: ${index * 80}ms"
    >
      <div class="writing-card-copy">
        <div class="writing-card-topline">
          <span class="writing-category">${escapeHtml(article.category)}</span>
          <span class="writing-card-mark" aria-hidden="true">✦</span>
        </div>
        <h2>${escapeHtml(article.title)}</h2>
        <p>${escapeHtml(article.excerpt)}</p>
        <span class="writing-meta">${escapeHtml(article.displayDate)} · ${escapeHtml(article.readTime)}</span>
        <span class="writing-card-cta">Read musing <span aria-hidden="true">↗</span></span>
      </div>
    </a>
  `;
}

function renderLibrary() {
  const categories = ["All", ...new Set(writingArticles.map((article) => article.category))];

  return `
    <main class="writing-page">
      <section class="writing-page-hero reveal-on-scroll">
        <p class="section-kicker">thoughts without a fixed category</p>
        <h1>Nick's <span>Musings</span></h1>
        <p>
          Philosophy, market ideas, books, technology, useful tools, personal
          observations, and whatever else I find worth thinking through.
        </p>
      </section>

      <section class="writing-library" aria-labelledby="writingLibraryTitle">
        <div class="writing-library-heading reveal-on-scroll">
          <h2 id="writingLibraryTitle">Latest musings</h2>
          <p>A growing collection of ideas, observations, experiments, and things learned along the way.</p>
        </div>
        ${
          writingArticles.length
            ? `<div class="writing-filters reveal-on-scroll" aria-label="Filter writing by category">
                ${categories
                  .map(
                    (category, index) => `
                      <button type="button" data-filter="${category}" class="${index === 0 ? "is-active" : ""}">
                        ${escapeHtml(category)}
                      </button>
                    `
                  )
                  .join("")}
              </div>`
            : ""
        }
        <div class="writing-library-grid">
          ${
            writingArticles.length
              ? writingArticles.map(renderArticleCard).join("")
              : `<div class="writing-empty-state writing-library-empty reveal-on-scroll">
                  <span aria-hidden="true">✦</span>
                  <h3>The next musing starts here.</h3>
                  <p>There are no published articles right now. New writing will appear here as soon as it is published.</p>
                </div>`
          }
        </div>
        ${writingArticles.length ? '<p class="writing-empty" hidden>No musings are available in this category yet.</p>' : ""}
      </section>
    </main>
  `;
}

function renderArticle(article) {
  const bodyHtml = article.bodyHtml
    ? article.bodyHtml
    : (article.body ?? []).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("");

  return `
    <main class="writing-page article-page">
      <article class="article-detail reveal-on-scroll">
        <a class="article-back" href="/writing/">← All musings</a>
        <header class="article-header">
          <span class="writing-category">${escapeHtml(article.category)}</span>
          <h1>${escapeHtml(article.title)}</h1>
          <p>${escapeHtml(article.excerpt)}</p>
          <span class="writing-meta">${escapeHtml(article.displayDate)} · ${escapeHtml(article.readTime)}</span>
        </header>
        <div class="article-signal" aria-hidden="true"><span></span></div>
        <div class="article-body">
          ${bodyHtml}
        </div>
        ${
          article.sample
            ? `<aside class="article-placeholder-note">
                <strong>Sample layout</strong>
                <p>This entry is temporary and will be replaced when your Sanity publishing workflow is connected.</p>
              </aside>`
            : ""
        }
      </article>
    </main>
  `;
}

function initializePageInteractions() {
  const revealItems = document.querySelectorAll(".reveal-on-scroll");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));

  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      const selectedCategory = button.dataset.filter;
      let visibleCount = 0;

      document.querySelectorAll("[data-filter]").forEach((item) => {
        item.classList.toggle("is-active", item === button);
      });

      document.querySelectorAll(".writing-library-card").forEach((card) => {
        const visible = selectedCategory === "All" || card.dataset.category === selectedCategory;
        card.hidden = !visible;
        if (visible) visibleCount += 1;
      });

      const emptyMessage = document.querySelector(".writing-empty");
      if (emptyMessage) emptyMessage.hidden = visibleCount > 0;
    });
  });
}

function renderWritingPage() {
  cleanupPokemonRelease();
  const selectedArticle = writingArticles.find((article) => article.slug === params.get("article"));
  app.innerHTML = `
    ${renderInteriorHeader("/writing/")}
    ${selectedArticle ? renderArticle(selectedArticle) : renderLibrary()}
    ${renderSiteFooter()}
  `;
  cleanupPokemonRelease = initializeInteriorChrome();
  initializePageInteractions();
}

async function initializeWriting() {
  renderWritingPage();

  try {
    const publishedArticles = await loadPublishedArticles();
    writingArticles = publishedArticles;
    renderWritingPage();
  } catch {
    // The sample library remains available while Sanity is empty or unreachable.
  }
}

initializeWriting();
