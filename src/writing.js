import "./style.css";
import "./writing.css";
import { articles } from "./content/articles.js";
import { escapeHtml, loadPublishedArticles } from "./lib/sanity.js";
import { initializePokemonRelease } from "./lib/pokemonRelease.js";

const app = document.querySelector("#app");
const params = new URLSearchParams(window.location.search);
let writingArticles = articles;
let cleanupPokemonRelease = () => {};

function renderHeader() {
  return `
    <header class="site-header writing-site-header">
      <div class="header-left">
        <a class="wordmark" href="/">Nicholas Thomas</a>
        <nav aria-label="Main navigation">
          <a href="/">Home</a>
          <a href="/#about">About</a>
          <a href="/writing/" aria-current="page">Musings</a>
        </nav>
      </div>
      <div class="social-icons writing-socials" aria-label="Social links">
        <a href="https://www.linkedin.com/in/nicktrades/" target="_blank" rel="noreferrer" aria-label="LinkedIn">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.94 8.86H3.2V20h3.74V8.86ZM5.07 7.34c1.2 0 1.95-.8 1.95-1.8-.02-1.02-.75-1.8-1.92-1.8s-1.95.78-1.95 1.8c0 1 .75 1.8 1.9 1.8h.02ZM20.85 13.62c0-3.42-1.82-5.02-4.25-5.02-1.96 0-2.84 1.08-3.33 1.84V8.86H9.53c.05 1.05 0 11.14 0 11.14h3.74v-6.22c0-.33.02-.66.12-.9.27-.66.88-1.35 1.9-1.35 1.34 0 1.88 1.02 1.88 2.52V20h3.74l-.06-6.38Z"/></svg>
        </a>
        <a href="https://www.youtube.com/@noticetrades" target="_blank" rel="noreferrer" aria-label="YouTube">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.62 7.3a3 3 0 0 0-2.11-2.12C17.65 4.68 12 4.68 12 4.68s-5.65 0-7.51.5A3 3 0 0 0 2.38 7.3 31.24 31.24 0 0 0 1.88 12c0 1.64.17 3.28.5 4.7a3 3 0 0 0 2.11 2.12c1.86.5 7.51.5 7.51.5s5.65 0 7.51-.5a3 3 0 0 0 2.11-2.12c.33-1.42.5-3.06.5-4.7s-.17-3.28-.5-4.7ZM9.98 15.55v-7.1L15.9 12l-5.92 3.55Z"/></svg>
        </a>
        <a href="https://x.com/noticetrades" target="_blank" rel="noreferrer" aria-label="X">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.42 10.27 22.13 1.3h-1.83l-6.7 7.8-5.35-7.8H2.08l8.08 11.77-8.08 9.4h1.83l7.06-8.22 5.64 8.22h6.17l-8.36-12.2Zm-2.5 2.9-.82-1.17L4.6 2.68h2.77l5.26 7.53.82 1.17 6.84 9.8h-2.77l-5.6-8.01Z"/></svg>
        </a>
        <a href="mailto:nickthomasfx@gmail.com" aria-label="Email Nicholas Thomas">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.75 5.25h16.5A2.75 2.75 0 0 1 23 8v8a2.75 2.75 0 0 1-2.75 2.75H3.75A2.75 2.75 0 0 1 1 16V8a2.75 2.75 0 0 1 2.75-2.75Zm0 1.75a1 1 0 0 0-.72.3L12 13.66l8.97-6.36a1 1 0 0 0-.72-.3H3.75Zm17.5 2.12-8.74 6.2a.88.88 0 0 1-1.02 0l-8.74-6.2V16c0 .55.45 1 1 1h16.5c.55 0 1-.45 1-1V9.12Z"/></svg>
        </a>
        <button class="pokeball-release" id="pokeballRelease" type="button" aria-label="Release a random Pokemon">
          <img src="/pokemon/pokeball.png" alt="" />
        </button>
      </div>
      <div class="pokemon-walker" id="pokemonWalker" aria-hidden="true">
        <img id="pokemonSprite" alt="" />
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
  cleanupPokemonRelease();
  const selectedArticle = writingArticles.find((article) => article.slug === params.get("article"));
  app.innerHTML = `
    ${renderHeader()}
    ${selectedArticle ? renderArticle(selectedArticle) : renderLibrary()}
    <footer class="site-footer">
      <p>Built by Nick Thomas. All rights reserved.</p>
    </footer>
  `;
  cleanupPokemonRelease = initializePokemonRelease();
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
