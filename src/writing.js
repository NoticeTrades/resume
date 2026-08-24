import "./style.css";
import "./writing.css";
import { articles } from "./content/articles.js";
import { escapeHtml, loadPublishedArticles } from "./lib/sanity.js";

const app = document.querySelector("#app");
const params = new URLSearchParams(window.location.search);
let writingArticles = articles;

function renderHeader() {
  return `
    <header class="site-header writing-site-header">
      <div class="header-left">
        <a class="wordmark" href="/">Nicholas Thomas</a>
        <nav aria-label="Main navigation">
          <a href="/">Home</a>
          <a href="/#about">About</a>
          <a href="/writing/" aria-current="page">Musings</a>
          <a href="mailto:nickthomasfx@gmail.com">Contact</a>
        </nav>
      </div>
      <div class="social-icons writing-socials" aria-label="Social links">
        <a href="https://www.linkedin.com/in/nicktrades/" target="_blank" rel="noreferrer" aria-label="LinkedIn">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.94 8.86H3.2V20h3.74V8.86ZM5.07 7.34c1.2 0 1.95-.8 1.95-1.8-.02-1.02-.75-1.8-1.92-1.8s-1.95.78-1.95 1.8c0 1 .75 1.8 1.9 1.8h.02ZM20.85 13.62c0-3.42-1.82-5.02-4.25-5.02-1.96 0-2.84 1.08-3.33 1.84V8.86H9.53c.05 1.05 0 11.14 0 11.14h3.74v-6.22c0-.33.02-.66.12-.9.27-.66.88-1.35 1.9-1.35 1.34 0 1.88 1.02 1.88 2.52V20h3.74l-.06-6.38Z"/></svg>
        </a>
        <a href="https://x.com/noticetrades" target="_blank" rel="noreferrer" aria-label="X">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.42 10.27 22.13 1.3h-1.83l-6.7 7.8-5.35-7.8H2.08l8.08 11.77-8.08 9.4h1.83l7.06-8.22 5.64 8.22h6.17l-8.36-12.2Zm-2.5 2.9-.82-1.17L4.6 2.68h2.77l5.26 7.53.82 1.17 6.84 9.8h-2.77l-5.6-8.01Z"/></svg>
        </a>
      </div>
    </header>
  `;
}

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
  const selectedArticle = writingArticles.find((article) => article.slug === params.get("article"));
  app.innerHTML = `
    ${renderHeader()}
    ${selectedArticle ? renderArticle(selectedArticle) : renderLibrary()}
    <footer class="site-footer">
      <p>Built by Nick Thomas. All rights reserved.</p>
    </footer>
  `;
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
