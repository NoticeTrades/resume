import "./style.css";
import { articles } from "./content/articles.js";
import { createPuzzlePortrait } from "./lib/puzzlePortrait.js";
import { syncHeaderOffset } from "./lib/pageUi.js";
import {
  escapeHtml,
  loadLatestLearningNote,
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
function selectFeaturedWriting(source) {
  const manuallyFeatured = source.filter((article) => article.featured);
  const remaining = source.filter((article) => !article.featured);
  return [...manuallyFeatured, ...remaining].slice(0, 3);
}

function renderFeaturedWritingCards(source) {
  if (!source.length) {
    return `
      <div class="writing-empty-state reveal-on-scroll">
        <span aria-hidden="true">✦</span>
        <h3>New musings are taking shape.</h3>
        <p>Fresh thoughts, observations, and ideas will appear here soon.</p>
      </div>
    `;
  }

  return selectFeaturedWriting(source)
  .map(
    (article, index) => `
      <a
        class="writing-card reveal-on-scroll ${index === 0 ? "is-featured" : ""}"
        href="/writing/?article=${encodeURIComponent(article.slug)}"
        style="--reveal-delay: ${index * 90}ms"
      >
        <div class="writing-card-copy">
          <div class="writing-card-topline">
            <span class="writing-category">${escapeHtml(article.category)}</span>
            <span class="writing-card-mark" aria-hidden="true">✦</span>
          </div>
          <h3>${escapeHtml(article.title)}</h3>
          <p>${escapeHtml(article.excerpt)}</p>
          <span class="writing-meta">${escapeHtml(article.displayDate)} · ${escapeHtml(article.readTime)}</span>
          <span class="writing-card-cta">Read musing <span aria-hidden="true">↗</span></span>
        </div>
      </a>
    `
  )
  .join("");
}

function renderLatestLearningNote(note) {
  if (!note) {
    return `
      <div class="til-home-empty">
        <span aria-hidden="true">✦</span>
        <p>New learning notes will appear here as I publish them.</p>
      </div>
    `;
  }

  return `
    <a class="til-home-card" href="/notes/${encodeURIComponent(note.slug)}">
      <div class="til-home-topline">
        <span class="writing-category">${escapeHtml(note.category)}</span>
        <span class="writing-meta">${escapeHtml(note.displayDate)}</span>
      </div>
      <h3>${escapeHtml(note.title)}</h3>
      <p>${escapeHtml(note.excerpt)}</p>
      <div class="til-home-footer">
        <span>${escapeHtml(note.readTimeLabel)}</span>
        ${note.relatedResource ? `<span>From ${escapeHtml(note.relatedResource.title)}</span>` : ""}
        <strong>Read note ↗</strong>
      </div>
    </a>
  `;
}

const featuredWritingCards = renderFeaturedWritingCards(articles);

app.innerHTML = `
  <header class="site-header">
    <div class="header-left">
      <button class="wordmark" type="button" id="reloadSite">Nicholas Thomas</button>
      <nav aria-label="Main navigation">
        <a href="#home">Home</a>
        <a href="#about">About</a>
        <a href="/writing/">Musings</a>
        <a href="/library/">Library</a>
        <a href="/notes/">TIL</a>
        <a href="/study/">Study</a>
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

    <section class="til-home-section" id="til">
      <div class="section-heading til-home-heading reveal-on-scroll">
        <div>
          <p class="section-kicker">a small idea worth keeping</p>
          <h2>Today I Learned</h2>
        </div>
        <span></span>
      </div>
      <div id="latestLearningNote" class="reveal-on-scroll">
        <div class="til-home-empty"><span aria-hidden="true">✦</span><p>Opening the notebook…</p></div>
      </div>
      <a class="view-writing-action reveal-on-scroll" href="/notes/">
        View all notes <span aria-hidden="true">→</span>
      </a>
    </section>

    <section class="writing-section" id="writing">
      <div class="section-heading writing-heading reveal-on-scroll">
        <div>
          <p class="section-kicker">thoughts, observations & ideas</p>
          <h2>Nick's Musings</h2>
        </div>
        <span></span>
      </div>
      <p class="writing-intro reveal-on-scroll">
        A place for whatever has my attention: markets, philosophy, technology,
        books, useful tools, personal observations, and life as it unfolds.
      </p>
      <div class="writing-grid" id="featuredWritingGrid">
        ${featuredWritingCards}
      </div>
      <a class="view-writing-action reveal-on-scroll" href="/writing/">
        Explore all musings <span aria-hidden="true">→</span>
      </a>
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
const pokeballRelease = document.getElementById("pokeballRelease");
const pokemonWalker = document.getElementById("pokemonWalker");
const pokemonSprite = document.getElementById("pokemonSprite");
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

loadPublishedArticles()
  .then((publishedArticles) => {
    const writingGrid = document.getElementById("featuredWritingGrid");
    writingGrid.innerHTML = renderFeaturedWritingCards(publishedArticles);
    writingGrid.querySelectorAll(".reveal-on-scroll").forEach((item) => revealObserver.observe(item));
  })
  .catch(() => {
    // Keep the local sample articles visible until Sanity is configured and published.
  });

loadLatestLearningNote()
  .then((note) => {
    const latestNote = document.getElementById("latestLearningNote");
    latestNote.innerHTML = renderLatestLearningNote(note);
  })
  .catch(() => {
    const latestNote = document.getElementById("latestLearningNote");
    latestNote.innerHTML = renderLatestLearningNote(null);
  });

const pokemonOptions = [
  { name: "Bulbasaur", src: "/pokemon/bulbasaur.webp", size: "sm" },
  { name: "Shinx", src: "/pokemon/shinx.webp", size: "sm" },
  { name: "Flareon", src: "/pokemon/flareon.webp", size: "lg" },
  { name: "Gengar", src: "/pokemon/gengar.webp", size: "md" },
  { name: "Pikachu", src: "/pokemon/pikachu.webp", size: "md" },
  { name: "Blastoise", src: "/pokemon/blastoise.webp", size: "lg" },
  { name: "Dragonite", src: "/pokemon/dragonite.webp", size: "sm" },
  { name: "Mewtwo", src: "/pokemon/mewtwo.webp", size: "md" },
  { name: "Charizard", src: "/pokemon/charizard.webp", size: "lg" },
  { name: "Giratina", src: "/pokemon/giratina.webp", size: "lg" },
];

const walker = {
  released: false,
  x: window.innerWidth - 150,
  y: 120,
  vx: 1.45,
  vy: 1.05,
  facing: 1,
  frameId: null,
  lastTime: 0,
  pointerX: 0,
  pointerY: 0,
  pointerActive: false,
  dragging: false,
  dragOffsetX: 0,
  dragOffsetY: 0,
  dragLastX: 0,
  dragLastY: 0,
  dragLastTime: 0,
};

function pickPokemon() {
  return pokemonOptions[Math.floor(Math.random() * pokemonOptions.length)];
}

function setReleasedPokemon(pokemon) {
  pokemonSprite.src = pokemon.src;
  pokemonSprite.alt = pokemon.name;
  pokemonWalker.dataset.size = pokemon.size;
  pokemonWalker.classList.remove("is-popping");
  requestAnimationFrame(() => pokemonWalker.classList.add("is-popping"));
}

function releasePokemon() {
  setReleasedPokemon(pickPokemon());
  pokeballRelease.classList.add("is-open");
  window.setTimeout(() => pokeballRelease.classList.remove("is-open"), 700);

  if (walker.released) {
    launchWalker();
    return;
  }

  const ballRect = pokeballRelease.getBoundingClientRect();
  walker.x = ballRect.left - 40;
  walker.y = ballRect.bottom + 8;
  walker.released = true;
  pokemonWalker.classList.add("is-released");
  launchWalker();
  setWalkerPosition();
  walker.frameId = requestAnimationFrame(animateWalker);
}

function launchWalker() {
  const angle = Math.random() * Math.PI * 2;
  const speed = 1.45 + Math.random() * 0.85;
  walker.vx = Math.cos(angle) * speed || 1.4;
  walker.vy = Math.sin(angle) * speed || 1;
  walker.facing = walker.vx >= 0 ? 1 : -1;
}

function animateWalker(time) {
  if (!walker.released || document.hidden) {
    walker.frameId = 0;
    return;
  }

  const dt = Math.min(2.2, Math.max(0.75, (time - (walker.lastTime || time)) / 16.67));
  walker.lastTime = time;

  if (!walker.dragging) {
    applyCursorPush();
    walker.x += walker.vx * dt;
    walker.y += walker.vy * dt;
    handleWalkerCollisions();
  } else {
    disturbPortraitOnWalkerOverlap(getWalkerBounds());
  }

  walker.facing = walker.vx >= 0 ? 1 : -1;
  setWalkerPosition();
  walker.frameId = requestAnimationFrame(animateWalker);
}

function applyCursorPush() {
  if (!walker.pointerActive) return;

  const bounds = getWalkerBounds();
  const centerX = bounds.left + bounds.width / 2;
  const centerY = bounds.top + bounds.height / 2;
  const dx = centerX - walker.pointerX;
  const dy = centerY - walker.pointerY;
  const distance = Math.hypot(dx, dy);
  const radius = 132;

  if (distance >= radius || distance < 1) return;

  const falloff = (1 - distance / radius) ** 2;
  const force = 0.38 + falloff * 1.18;
  walker.vx += (dx / distance) * force;
  walker.vy += (dy / distance) * force;
  normalizeWalkerSpeed(3.25);
}

function handleWalkerCollisions() {
  const bounds = getWalkerBounds();
  const viewportHit = clampWalkerToViewport(bounds);

  if (viewportHit.x) walker.vx = Math.abs(walker.vx) * viewportHit.x;
  if (viewportHit.y) walker.vy = Math.abs(walker.vy) * viewportHit.y;

  const walkerRect = getWalkerBounds();
  disturbPortraitOnWalkerOverlap(walkerRect);

  for (const obstacle of getCollisionObstacles()) {
    const overlap = getOverlap(walkerRect, obstacle);
    if (!overlap) continue;

    if (overlap.x < overlap.y) {
      walker.x += walkerRect.left < obstacle.left ? -overlap.x - 2 : overlap.x + 2;
      walker.vx *= -1;
    } else {
      walker.y += walkerRect.top < obstacle.top ? -overlap.y - 2 : overlap.y + 2;
      walker.vy *= -1;
    }

    walker.vx += (Math.random() - 0.5) * 0.34;
    walker.vy += (Math.random() - 0.5) * 0.34;
    normalizeWalkerSpeed();
    break;
  }
}

function clampWalkerToViewport(bounds = getWalkerBounds()) {
  const padding = 8;
  const maxX = window.innerWidth - bounds.width - padding;
  const maxY = window.innerHeight - bounds.height - padding;
  const hit = { x: 0, y: 0 };

  if (walker.x < padding) {
    walker.x = padding;
    hit.x = 1;
  } else if (walker.x > maxX) {
    walker.x = maxX;
    hit.x = -1;
  }

  if (walker.y < 70) {
    walker.y = 70;
    hit.y = 1;
  } else if (walker.y > maxY) {
    walker.y = maxY;
    hit.y = -1;
  }

  return hit;
}

function disturbPortraitOnWalkerOverlap(walkerRect) {
  const portraitRect = portraitShell.getBoundingClientRect();
  const overlap = getOverlap(walkerRect, {
    left: portraitRect.left,
    top: portraitRect.top,
    right: portraitRect.right,
    bottom: portraitRect.bottom,
  });

  if (!overlap) return;

  const heroRect = hero.getBoundingClientRect();
  const walkerSpeed = Math.hypot(walker.vx, walker.vy);
  puzzlePortrait.disturb(
    walkerRect.left + walkerRect.width / 2 - heroRect.left,
    walkerRect.top + walkerRect.height / 2 - heroRect.top,
    136,
    4.5 + Math.min(6, walkerSpeed * 1.6)
  );
}

function getWalkerBounds() {
  const rect = pokemonWalker.getBoundingClientRect();
  return {
    left: walker.x + rect.width * 0.18,
    top: walker.y + rect.height * 0.2,
    right: walker.x + rect.width * 0.82,
    bottom: walker.y + rect.height * 0.82,
    width: rect.width * 0.64,
    height: rect.height * 0.62,
  };
}

function getCollisionObstacles() {
  return Array.from(
    document.querySelectorAll(
      ".wordmark, .site-header nav a, .market-strip, .social-icons a, .hero-copy, .contact-action, .about-copy, .section-heading"
    )
  )
    .map((target) => ({ target, rect: target.getBoundingClientRect() }))
    .filter(({ target, rect }) => {
      if (target === pokemonWalker || target === pokeballRelease) return false;
      return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < window.innerHeight;
    })
    .map(({ target, rect }) => ({
      target,
      left: rect.left - 6,
      top: rect.top - 6,
      right: rect.right + 6,
      bottom: rect.bottom + 6,
    }));
}

function getOverlap(a, b) {
  const x = Math.min(a.right, b.right) - Math.max(a.left, b.left);
  const y = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
  return x > 0 && y > 0 ? { x, y } : null;
}

function normalizeWalkerSpeed(maxSpeed = 2.65) {
  const speed = Math.hypot(walker.vx, walker.vy);
  if (speed < 0.01) {
    launchWalker();
    return;
  }
  const target = Math.min(maxSpeed, Math.max(1.45, speed));
  walker.vx = (walker.vx / speed) * target;
  walker.vy = (walker.vy / speed) * target;
}

function setWalkerPosition() {
  const bob = Math.sin(performance.now() / 140) * 5;
  pokemonWalker.style.setProperty("--x", `${walker.x}px`);
  pokemonWalker.style.setProperty("--y", `${walker.y + bob}px`);
  pokemonWalker.style.setProperty("--facing", walker.facing);
}

pokeballRelease.addEventListener("click", releasePokemon);
pokemonWalker.addEventListener("animationend", () => pokemonWalker.classList.remove("is-popping"));
pokemonWalker.addEventListener("pointerenter", launchWalker);
pokemonWalker.addEventListener("pointerdown", startPokemonDrag);
window.addEventListener("pointermove", updatePokemonPointer);
window.addEventListener("pointerup", endPokemonDrag);
window.addEventListener("pointercancel", endPokemonDrag);

function updatePokemonPointer(event) {
  walker.pointerX = event.clientX;
  walker.pointerY = event.clientY;
  walker.pointerActive = true;

  if (!walker.dragging) return;

  const now = performance.now();
  const previousX = walker.x;
  const previousY = walker.y;
  walker.x = event.clientX - walker.dragOffsetX;
  walker.y = event.clientY - walker.dragOffsetY;
  walker.vx = (walker.x - previousX) * 0.22;
  walker.vy = (walker.y - previousY) * 0.22;
  walker.dragLastX = event.clientX;
  walker.dragLastY = event.clientY;
  walker.dragLastTime = now;
  clampWalkerToViewport();
  setWalkerPosition();
}

function startPokemonDrag(event) {
  if (!walker.released) return;

  const rect = pokemonWalker.getBoundingClientRect();
  walker.dragging = true;
  walker.dragOffsetX = event.clientX - rect.left;
  walker.dragOffsetY = event.clientY - rect.top;
  walker.dragLastX = event.clientX;
  walker.dragLastY = event.clientY;
  walker.dragLastTime = performance.now();
  pokemonWalker.classList.add("is-dragging");
  pokemonWalker.setPointerCapture?.(event.pointerId);
  event.preventDefault();
}

function endPokemonDrag(event) {
  if (!walker.dragging) return;

  walker.dragging = false;
  pokemonWalker.classList.remove("is-dragging");
  pokemonWalker.releasePointerCapture?.(event.pointerId);
  normalizeWalkerSpeed(3.1);
}

function handleAnimationVisibility() {
  if (document.hidden) {
    puzzlePortrait.pause();
    cancelAnimationFrame(walker.frameId);
    walker.frameId = 0;
    return;
  }

  puzzlePortrait.resume();

  if (walker.released && !walker.frameId) {
    walker.lastTime = 0;
    walker.frameId = requestAnimationFrame(animateWalker);
  }
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
