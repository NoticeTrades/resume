import "./style.css";
import "./writing.css";
import { articles } from "./content/articles.js";
import { escapeHtml, loadPublishedArticles, recordPageView } from "./lib/sanity.js";
import { readCache, sameSlugList, writeCache } from "./lib/pageData.js";
import { initializeRevealAnimations } from "./lib/pageUi.js";
import {
  initializeInteriorChrome,
  renderInteriorHeader,
  renderSiteFooter,
} from "./lib/siteChrome.js";

const app = document.querySelector("#app");
const params = new URLSearchParams(window.location.search);
let writingArticles = articles;
let cleanupPokemonRelease = () => {};
let cleanupReveals = () => {};

function articleDateTime(article) {
  if (!article.publishedAt) return "";
  return ` datetime="${escapeHtml(String(article.publishedAt).slice(0, 10))}"`;
}

function renderArticleRow(article, index) {
  return `
    <li>
      <a class="index-row index-enter" href="/writing/?article=${encodeURIComponent(article.slug)}" style="--stagger: ${index + 1}">
        <span class="index-row-title">${escapeHtml(article.title)}</span>
        <time class="index-row-meta"${articleDateTime(article)}>${escapeHtml(article.displayDate)}</time>
      </a>
    </li>
  `;
}

function renderLibrary() {
  return `
    <main class="index-page">
      <header class="index-intro index-enter">
        <h1>musings</h1>
        <p>philosophy, markets, books, technology, and whatever else is worth thinking through.</p>
      </header>
      ${
        writingArticles.length
          ? `<ul class="index-list">${writingArticles.map(renderArticleRow).join("")}</ul>`
          : `<p class="index-empty index-enter" style="--stagger: 1">Nothing published yet.</p>`
      }
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

function renderWritingPage() {
  cleanupPokemonRelease();
  cleanupReveals();
  const selectedArticle = writingArticles.find((article) => article.slug === params.get("article"));
  app.innerHTML = `
    ${renderInteriorHeader("/writing/")}
    ${selectedArticle ? renderArticle(selectedArticle) : renderLibrary()}
    ${renderSiteFooter()}
  `;
  cleanupPokemonRelease = initializeInteriorChrome();
  cleanupReveals = initializeRevealAnimations(app);
  if (selectedArticle && !selectedArticle.sample) recordPageView("article", selectedArticle.slug);
}

async function initializeWriting() {
  const cached = readCache("articles");
  if (cached?.length) writingArticles = cached;
  renderWritingPage();

  try {
    const publishedArticles = await loadPublishedArticles();
    if (!publishedArticles.length) return;
    writeCache("articles", publishedArticles);
    if (sameSlugList(writingArticles, publishedArticles) && cached?.length) return;
    writingArticles = publishedArticles;
    renderWritingPage();
  } catch {
    // Sample articles stay available if Sanity is empty or unreachable.
  }
}

initializeWriting();
