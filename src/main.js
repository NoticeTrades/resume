import "./style.css";
import "./writing.css";
import { initializeIndexPointer, initializeNavPrefetch, readCache, writeCache } from "./lib/pageData.js";
import { initializePokemonRelease } from "./lib/pokemonRelease.js";
import { createPuzzlePortrait } from "./lib/puzzlePortrait.js";
import { syncHeaderOffset } from "./lib/pageUi.js";
import {
  escapeHtml,
  loadLearningNotes,
  loadPublishedArticles,
} from "./lib/sanity.js";

const marketSymbols = [
  { symbol: "NQ", name: "Nasdaq" },
  { symbol: "ES", name: "S&P 500" },
  { symbol: "YM", name: "Dow" },
  { symbol: "RTY", name: "Russell" },
];

const demoQuotes = [
  { symbol: "NQ", price: 23785.25, change: 42.5, changePercent: 0.18 },
  { symbol: "ES", price: 6512.75, change: 8.25, changePercent: 0.13 },
  { symbol: "YM", price: 45864, change: -31, changePercent: -0.07 },
  { symbol: "RTY", price: 2284.6, change: 4.2, changePercent: 0.18 },
];

const app = document.querySelector("#app");
function selectHighlights(source) {
  return [...source]
    .sort((left, right) => {
      const views = (Number(right.views) || 0) - (Number(left.views) || 0);
      if (views) return views;
      if (Boolean(right.featured) !== Boolean(left.featured)) return right.featured ? 1 : -1;
      return new Date(right.publishedAt || 0) - new Date(left.publishedAt || 0);
    })
    .slice(0, 3);
}

function renderHomeRows(items, hrefFor) {
  if (!items.length) return `<p class="highlights-empty reveal-on-scroll">Nothing published yet.</p>`;

  return `
    <ul class="highlights-list">
      ${items
        .map(
          (item, index) => `
            <li>
              <a class="highlights-row reveal-on-scroll" href="${hrefFor(item)}" style="--reveal-delay: ${90 + index * 90}ms">
                <span class="highlights-row-title">${escapeHtml(item.title)}</span>
                <time class="highlights-row-meta">${escapeHtml(item.displayDate)}</time>
              </a>
            </li>
          `
        )
        .join("")}
    </ul>
  `;
}

const cachedArticles = (readCache("articles") ?? []).filter((article) => article && !article.sample);
const featuredWritingCards = renderHomeRows(
  selectHighlights(cachedArticles),
  (article) => `/writing/?article=${encodeURIComponent(article.slug)}`
);
const cachedNotes = readCache("notes");
const featuredNotes = renderHomeRows(
  selectHighlights(cachedNotes ?? []),
  (note) => `/notes/${encodeURIComponent(note.slug)}`
);

app.innerHTML = `
  <header class="site-header">
    <div class="header-left">
      <button class="wordmark" type="button" id="reloadSite">Nicholas Thomas</button>
      <nav aria-label="Main navigation">
        <a href="#home" aria-current="page">Home</a>
        <a href="#about">About</a>
        <a href="/writing/">Musings</a>
        <a href="/library/">Library</a>
        <a href="/notes/">TIL</a>
      </nav>
    </div>
    <div class="market-strip" aria-label="Futures market prices">
      <div class="ticker-track" id="tickerTrack"></div>
    </div>
    <div class="social-icons" aria-label="Social links">
      <a href="https://www.linkedin.com/in/nicktrades/" target="_blank" rel="noreferrer" aria-label="LinkedIn">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.94 8.86H3.2V20h3.74V8.86ZM5.07 7.34c1.2 0 1.95-.8 1.95-1.8-.02-1.02-.75-1.8-1.92-1.8s-1.95.78-1.95 1.8c0 1 .75 1.8 1.9 1.8h.02ZM20.85 13.62c0-3.42-1.82-5.02-4.25-5.02-1.96 0-2.84 1.08-3.33 1.84V8.86H9.53c.05 1.05 0 11.14 0 11.14h3.74v-6.22c0-.33.02-.66.12-.9.27-.66.88-1.35 1.9-1.35 1.34 0 1.88 1.02 1.88 2.52V20h3.74l-.06-6.38Z"/></svg>
      </a>
      <a href="https://www.youtube.com/@NickSpeaksFinance" target="_blank" rel="noreferrer" aria-label="YouTube">
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
  </header>

  <main>
    <section class="hero" id="home">
      <canvas id="pixelPortrait" class="pixel-stage"></canvas>
      <div class="pokemon-walker" id="pokemonWalker" aria-hidden="true">
        <img id="pokemonSprite" alt="" />
      </div>
      <div class="hero-inner">
        <button
          class="portrait-shell"
          type="button"
          aria-label="Scatter the puzzle portrait and let it rebuild itself"
        >
          <img src="/nick-cutout.webp" alt="" id="portraitSource" />
        </button>
        <div class="hero-copy">
          <p class="eyebrow">finance / trading / technology</p>
          <h1 id="typedIntro" aria-label="Hello, Nick Here."></h1>
          <p>
            Eight hours turning messy business assumptions into useful financial models.
            Eight hours testing markets, trading ideas, AI tools, and automations.
            Eight hours recharging for the next iteration.
          </p>
          <a class="contact-action" href="mailto:nickthomasfx@gmail.com">Contact me</a>
        </div>
      </div>
    </section>

    <section class="about-section" id="about">
      <div class="section-heading reveal-on-scroll">
        <h2>about me</h2>
        <span></span>
      </div>
      <div class="about-layout">
        <article class="about-copy reveal-on-scroll">
          <p>
            I work in <strong>financial planning</strong> for HVAC businesses,
            building models, forecasts, and revenue projections from the assumptions
            that drive real operating decisions.
          </p>
          <p>
            Outside of work, I stay close to markets and technology. I am continuing
            to develop my trading framework around index futures, mainly
            <strong>NQ, ES, and YM</strong>, while studying AI, machine learning, and
            automation as tools for better analysis.
          </p>
          <p>
            I am also studying for the <strong>CMA</strong>, Certified Management
            Accountant, license to keep sharpening how I think about finance,
            strategy, and business performance.
          </p>
          <div class="about-focus-list" aria-label="Current focus areas">
            <span style="--focus-delay: 120ms">Financial modeling</span>
            <span style="--focus-delay: 240ms">CMA prep</span>
            <span style="--focus-delay: 360ms">Student <small>(always learning)</small></span>
            <span style="--focus-delay: 480ms">AI technology + workflows</span>
            <span style="--focus-delay: 600ms">Trading</span>
            <span style="--focus-delay: 720ms">Basketball</span>
          </div>
        </article>
        <figure class="about-portrait reveal-on-scroll">
          <img
            src="/nick-about.webp"
            alt="Nick and his girlfriend taking a mirror selfie"
            width="471"
            height="1024"
            loading="lazy"
            decoding="async"
          />
        </figure>
      </div>
    </section>

    <section class="highlights-section" id="til">
      <div class="section-heading reveal-on-scroll">
        <h2>today i learned</h2>
        <span></span>
      </div>
      <p class="highlights-label reveal-on-scroll">highlights</p>
      <div id="latestLearningNote">${featuredNotes}</div>
      <a class="highlights-more reveal-on-scroll" href="/notes/">all notes</a>
    </section>

    <section class="highlights-section" id="writing">
      <div class="section-heading reveal-on-scroll">
        <h2>musings</h2>
        <span></span>
      </div>
      <p class="highlights-label reveal-on-scroll">highlights</p>
      <div id="featuredWritingGrid">${featuredWritingCards}</div>
      <a class="highlights-more reveal-on-scroll" href="/writing/">all musings</a>
    </section>
  </main>

  <footer class="site-footer">
    <p>Built by Nick Thomas. All rights reserved.</p>
  </footer>
`;

const tickerTrack = document.getElementById("tickerTrack");
const marketDataEndpoint = import.meta.env.VITE_MARKET_DATA_ENDPOINT || "/api/market-data";

document.getElementById("reloadSite").addEventListener("click", () => {
  window.location.reload();
});

const hero = document.querySelector(".hero");
const portraitShell = document.querySelector(".portrait-shell");
const puzzlePortrait = createPuzzlePortrait({
  hero,
  canvas: document.getElementById("pixelPortrait"),
  image: document.getElementById("portraitSource"),
  shell: portraitShell,
});

syncHeaderOffset();

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
  { threshold: 0.18 }
);

revealItems.forEach((item) => revealObserver.observe(item));

const focusList = document.querySelector(".about-focus-list");
const focusObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        focusObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.35,
    rootMargin: "0px 0px -8% 0px",
  }
);

focusObserver.observe(focusList);

function fillHomeList(id, html) {
  const mount = document.getElementById(id);
  if (!mount) return;
  mount.innerHTML = html;
  mount.querySelectorAll(".reveal-on-scroll").forEach((item) => revealObserver.observe(item));
}

initializeNavPrefetch();
initializeIndexPointer();

loadPublishedArticles()
  .then((publishedArticles) => {
    writeCache("articles", publishedArticles);
    fillHomeList(
      "featuredWritingGrid",
      renderHomeRows(selectHighlights(publishedArticles), (article) => `/writing/?article=${encodeURIComponent(article.slug)}`)
    );
  })
  .catch(() => {
    if (!cachedArticles.length) {
      fillHomeList("featuredWritingGrid", renderHomeRows([], () => "/writing/"));
    }
  });

loadLearningNotes()
  .then((notes) => {
    writeCache("notes", notes);
    fillHomeList(
      "latestLearningNote",
      renderHomeRows(selectHighlights(notes), (note) => `/notes/${encodeURIComponent(note.slug)}`)
    );
  })
  .catch(() => {
    if (!cachedNotes?.length) fillHomeList("latestLearningNote", renderHomeRows([], () => "/notes/"));
  });

function getOverlap(a, b) {
  const x = Math.min(a.right, b.right) - Math.max(a.left, b.left);
  const y = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
  return x > 0 && y > 0 ? { x, y } : null;
}

function disturbPortraitOnWalkerOverlap(walkerRect, velocity = { vx: 0, vy: 0 }) {
  const portraitRect = portraitShell.getBoundingClientRect();
  const overlap = getOverlap(walkerRect, {
    left: portraitRect.left,
    top: portraitRect.top,
    right: portraitRect.right,
    bottom: portraitRect.bottom,
  });
  if (!overlap) return;

  const heroRect = hero.getBoundingClientRect();
  const walkerSpeed = Math.hypot(velocity.vx, velocity.vy);
  puzzlePortrait.disturb(
    walkerRect.left + walkerRect.width / 2 - heroRect.left,
    walkerRect.top + walkerRect.height / 2 - heroRect.top,
    136,
    4.5 + Math.min(6, walkerSpeed * 1.6)
  );
}

initializePokemonRelease({
  onMove(rect, velocity) {
    disturbPortraitOnWalkerOverlap(rect, velocity);
  },
});

function handleAnimationVisibility() {
  if (document.hidden) {
    puzzlePortrait.pause();
    return;
  }
  puzzlePortrait.resume();
}

document.addEventListener("visibilitychange", handleAnimationVisibility);

const typedIntro = document.getElementById("typedIntro");
// Segments carry both the typing order and the colour, so the headline wording
// can change without recalculating character offsets by hand.
const introSegments = [
  { text: "Hello, ", tone: "light" },
  { text: "Nick", tone: "accent" },
  { text: " Here.", tone: "light" },
];
const introText = introSegments.map((segment) => segment.text).join("");
let typedIndex = 0;

function renderTyped(revealedCount) {
  let remaining = revealedCount;
  const markup = introSegments
    .map((segment) => {
      if (remaining <= 0) return "";
      const visible = segment.text.slice(0, remaining);
      remaining -= visible.length;
      // Non-breaking spaces keep the caret from drifting when a segment ends on
      // a space mid-type.
      return `<span class="typed-${segment.tone}">${visible.replaceAll(" ", "&nbsp;")}</span>`;
    })
    .join("");
  typedIntro.innerHTML = `${markup}<span class="type-cursor" aria-hidden="true"></span>`;
}

function typeHeadline() {
  renderTyped(typedIndex);
  typedIndex += 1;
  if (typedIndex <= introText.length) {
    setTimeout(typeHeadline, typedIndex === 1 ? 350 : 78);
  }
}

typeHeadline();

function renderQuotes(quotes, status = "live") {
  const rows = quotes.map((quote) => {
    const change = Number(quote.change ?? 0);
    const changePercent = Number(quote.changePercent ?? quote.percent ?? 0);
    const direction = change >= 0 ? "up" : "down";
    const sign = change >= 0 ? "+" : "";
    return `
      <span class="ticker-item ${direction}">
        <strong>${quote.symbol}</strong>
        <span>${formatPrice(quote.price ?? quote.last ?? quote.value)}</span>
        <em>${sign}${change.toFixed(2)} / ${sign}${changePercent.toFixed(2)}%</em>
      </span>
    `;
  });
  tickerTrack.innerHTML = [...rows, ...rows].join("") + `<span class="ticker-status">${status}</span>`;
}

function formatPrice(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "--";
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: number > 10000 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(number);
}

async function fetchQuotes() {
  try {
    const response = await fetch(marketDataEndpoint, { cache: "no-store" });
    if (!response.ok) throw new Error(`Quote endpoint returned ${response.status}`);
    const payload = await response.json();
    const quotes = normalizeQuotes(payload);
    renderQuotes(quotes, payload.status ?? "Yahoo delayed");
  } catch {
    renderQuotes(demoQuotes, "feed offline");
  }
}

function normalizeQuotes(payload) {
  const source = Array.isArray(payload) ? payload : payload.quotes ?? payload.data ?? [];
  const bySymbol = new Map(source.map((quote) => [quote.symbol, quote]));
  return marketSymbols.map(({ symbol }) => {
    const quote = bySymbol.get(symbol) ?? {};
    return {
      symbol,
      price: quote.price ?? quote.last ?? quote.value,
      change: quote.change ?? quote.netChange ?? 0,
      changePercent: quote.changePercent ?? quote.percent ?? 0,
    };
  });
}

fetchQuotes();
setInterval(() => {
  if (!document.hidden) fetchQuotes();
}, 8000);

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) fetchQuotes();
});
