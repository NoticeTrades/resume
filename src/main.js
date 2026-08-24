import "./style.css";
import { articles } from "./content/articles.js";
import { escapeHtml, loadPublishedArticles } from "./lib/sanity.js";

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

const featuredWritingCards = renderFeaturedWritingCards(articles);

app.innerHTML = `
  <header class="site-header">
    <div class="header-left">
      <button class="wordmark" type="button" id="reloadSite">Nicholas Thomas</button>
      <nav aria-label="Main navigation">
        <a href="#home">Home</a>
        <a href="#about">About</a>
        <a href="/writing/">Musings</a>
        <a href="mailto:nickthomasfx@gmail.com">Contact</a>
      </nav>
    </div>
    <div class="market-strip" aria-label="Futures market prices">
      <div class="ticker-track" id="tickerTrack"></div>
    </div>
    <div class="social-icons" aria-label="Social links">
      <a href="https://www.linkedin.com/in/nicktrades/" target="_blank" rel="noreferrer" aria-label="LinkedIn">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.94 8.86H3.2V20h3.74V8.86ZM5.07 7.34c1.2 0 1.95-.8 1.95-1.8-.02-1.02-.75-1.8-1.92-1.8s-1.95.78-1.95 1.8c0 1 .75 1.8 1.9 1.8h.02ZM20.85 13.62c0-3.42-1.82-5.02-4.25-5.02-1.96 0-2.84 1.08-3.33 1.84V8.86H9.53c.05 1.05 0 11.14 0 11.14h3.74v-6.22c0-.33.02-.66.12-.9.27-.66.88-1.35 1.9-1.35 1.34 0 1.88 1.02 1.88 2.52V20h3.74l-.06-6.38Z"/></svg>
      </a>
      <a href="https://www.youtube.com/@noticetrades" target="_blank" rel="noreferrer" aria-label="YouTube">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.62 7.3a3 3 0 0 0-2.11-2.12C17.65 4.68 12 4.68 12 4.68s-5.65 0-7.51.5A3 3 0 0 0 2.38 7.3 31.24 31.24 0 0 0 1.88 12c0 1.64.17 3.28.5 4.7a3 3 0 0 0 2.11 2.12c1.86.5 7.51.5 7.51.5s5.65 0 7.51-.5a3 3 0 0 0 2.11-2.12c.33-1.42.5-3.06.5-4.7s-.17-3.28-.5-4.7ZM9.98 15.55v-7.1L15.9 12l-5.92 3.55Z"/></svg>
      </a>
      <a href="https://x.com/noticetrades" target="_blank" rel="noreferrer" aria-label="X">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.42 10.27 22.13 1.3h-1.83l-6.7 7.8-5.35-7.8H2.08l8.08 11.77-8.08 9.4h1.83l7.06-8.22 5.64 8.22h6.17l-8.36-12.2Zm-2.5 2.9-.82-1.17L4.6 2.68h2.77l5.26 7.53.82 1.17 6.84 9.8h-2.77l-5.6-8.01Z"/></svg>
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
        <img id="pokemonSprite" src="/pokemon/bulbasaur.webp" alt="" />
      </div>
      <div class="hero-inner">
        <button class="portrait-shell" type="button" aria-label="Scatter pixel portrait">
          <img src="/nick-pixel-source.jpg" alt="" id="portraitSource" />
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

    <section class="about-section reveal-on-scroll" id="about">
      <div class="section-heading">
        <h2>about me</h2>
        <span></span>
      </div>
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
    </section>

    <section class="writing-section reveal-on-scroll" id="writing">
      <div class="section-heading writing-heading">
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
const canvas = document.getElementById("pixelPortrait");
const image = document.getElementById("portraitSource");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
const pointer = { x: 0, y: 0, active: false };
let introAssembling = true;
let pixels = [];
let animationId;
let introTimer;

function initPortrait() {
  introAssembling = true;
  clearTimeout(introTimer);
  const heroRect = hero.getBoundingClientRect();
  const portraitRect = portraitShell.getBoundingClientRect();
  const canvasWidth = Math.max(1, Math.round(heroRect.width));
  const canvasHeight = Math.max(1, Math.round(heroRect.height));
  const portraitWidth = Math.max(1, Math.round(portraitRect.width));
  const portraitHeight = Math.max(1, Math.round(portraitRect.height));
  const sample = 8;

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  const temp = document.createElement("canvas");
  const tempCtx = temp.getContext("2d", { willReadFrequently: true });
  temp.width = portraitWidth;
  temp.height = portraitHeight;

  const scale = Math.max(portraitWidth / image.naturalWidth, portraitHeight / image.naturalHeight) * 1.06;
  const imageWidth = image.naturalWidth * scale;
  const imageHeight = image.naturalHeight * scale;
  const left = (portraitWidth - imageWidth) / 2 + portraitWidth * 0.02;
  const top = (portraitHeight - imageHeight) / 2 - portraitHeight * 0.03;

  tempCtx.drawImage(image, left, top, imageWidth, imageHeight);
  const data = tempCtx.getImageData(0, 0, portraitWidth, portraitHeight).data;
  const offsetX = portraitRect.left - heroRect.left;
  const offsetY = portraitRect.top - heroRect.top;
  pixels = [];

  for (let y = 0; y < portraitHeight; y += sample) {
    for (let x = 0; x < portraitWidth; x += sample) {
      const colorSample = sampleAverageColor(data, portraitWidth, portraitHeight, x, y, sample);
      const { red, green, blue, alpha, brightness } = colorSample;
      const mask = portraitMask(x / portraitWidth, y / portraitHeight);

      if (alpha > 10 && brightness > 20 && mask > 0.11) {
        const detail = Math.max(0.4, brightness / 255);
        const themedRed = Math.round(red * 0.62 + 10);
        const themedGreen = Math.round(green * 0.82 + 34);
        const themedBlue = Math.round(blue * 0.86 + 38);
        const homeX = offsetX + x;
        const homeY = offsetY + y;
        const introAngle = Math.random() * Math.PI * 2;
        const introDistance = 150 + Math.random() * Math.max(canvasWidth, canvasHeight) * 0.48;
        pixels.push({
          x: homeX + Math.cos(introAngle) * introDistance,
          y: homeY + Math.sin(introAngle) * introDistance,
          homeX,
          homeY,
          vx: (Math.random() - 0.5) * 3,
          vy: (Math.random() - 0.5) * 3,
          angle: Math.random() * Math.PI * 2,
          homeAngle: ((x / sample + y / sample) % 7) * 0.025 - 0.075,
          spin: (Math.random() - 0.5) * 0.24,
          shape: Math.round(x / sample + y / sample) % 4,
          size: (sample * 1.08 + detail * 0.75) * Math.min(1, Math.max(0.72, mask * 1.2)),
          color: `rgba(${Math.min(255, themedRed)}, ${Math.min(255, themedGreen)}, ${Math.min(255, themedBlue)}, ${Math.min(0.95, (0.7 + detail * 0.2) * Math.max(0.68, mask))})`,
        });
      }
    }
  }

  cancelAnimationFrame(animationId);
  introTimer = setTimeout(() => {
    introAssembling = false;
  }, 3600);
  animatePortrait();
}

function portraitMask(nx, ny) {
  const center = 0.47 + Math.sin((ny - 0.16) * Math.PI) * 0.05;
  const upperWidth = 0.12 + smoothstep(0.04, 0.22, ny) * 0.24;
  const middleWidth = 0.34 + smoothstep(0.24, 0.48, ny) * 0.17;
  const lowerTaper = 1 - smoothstep(0.78, 1, ny) * 0.42;
  const halfWidth = Math.min(0.45, Math.max(upperWidth, middleWidth * lowerTaper));
  const mainShape = smoothstep(halfWidth + 0.035, halfWidth - 0.035, Math.abs(nx - center));
  const verticalFade = smoothstep(0.04, 0.13, ny) * (1 - smoothstep(0.96, 1.02, ny));
  const head = softEllipse(nx, ny, 0.56, 0.2, 0.2, 0.16, 0.22);
  const faceNeck = softEllipse(nx, ny, 0.56, 0.38, 0.17, 0.2, 0.12);
  const shirt = softEllipse(nx, ny, 0.58, 0.58, 0.34, 0.38, 0.16);
  const newspaper = softPolygon(nx, ny, [
    [0.02, 0.02],
    [0.17, 0.23],
    [0.43, 0.3],
    [0.49, 0.53],
    [0.43, 0.9],
    [0.12, 0.95],
    [0.02, 0.72],
  ]);
  const rightArm = softPolygon(nx, ny, [
    [0.47, 0.43],
    [0.82, 0.36],
    [0.94, 0.66],
    [0.86, 0.92],
    [0.54, 0.91],
    [0.43, 0.66],
  ]);
  const hand = softEllipse(nx, ny, 0.47, 0.82, 0.18, 0.1, 0.12);

  let mask = Math.max(mainShape * verticalFade, head, faceNeck, shirt, newspaper * 0.92, rightArm * 0.78, hand);
  const topLeftTrim = softEllipse(nx, ny, -0.08, 0, 0.36, 0.26, 0.2);
  const lowerLeftTrim = softEllipse(nx, ny, -0.12, 1.02, 0.34, 0.22, 0.16);
  const lowerRightTrim = softEllipse(nx, ny, 1.06, 0.98, 0.34, 0.22, 0.16);
  const newspaperCornerTrim = softEllipse(nx, ny, 0.05, 0.08, 0.22, 0.16, 0.1);
  const topLeftBlockTrim = softPolygon(nx, ny, [
    [0, 0],
    [0.24, 0],
    [0.2, 0.2],
    [0.06, 0.27],
    [0, 0.2],
  ]);
  const bottomRightGridTrim = softEllipse(nx, ny, 0.98, 0.96, 0.2, 0.16, 0.1);
  const rightEdgeTaper = smoothstep(0.98, 0.84, nx + Math.max(0, ny - 0.62) * 0.24);
  mask *= rightEdgeTaper;
  mask *= 1 - Math.max(
    topLeftTrim * 0.62,
    lowerLeftTrim * 0.54,
    lowerRightTrim * 0.42,
    newspaperCornerTrim * 0.82,
    topLeftBlockTrim * 0.7,
    bottomRightGridTrim * 0.42
  );
  return Math.max(0, Math.min(1, mask));
}

function sampleAverageColor(data, width, height, startX, startY, size) {
  let red = 0;
  let green = 0;
  let blue = 0;
  let alpha = 0;
  let count = 0;
  const endY = Math.min(height, startY + size);
  const endX = Math.min(width, startX + size);
  for (let y = startY; y < endY; y += 2) {
    for (let x = startX; x < endX; x += 2) {
      const index = (y * width + x) * 4;
      red += data[index];
      green += data[index + 1];
      blue += data[index + 2];
      alpha += data[index + 3];
      count += 1;
    }
  }
  red /= count;
  green /= count;
  blue /= count;
  alpha /= count;
  return {
    red,
    green,
    blue,
    alpha,
    brightness: (red + green + blue) / 3,
  };
}

function softEllipse(x, y, cx, cy, rx, ry, feather) {
  const distance = Math.sqrt(((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2);
  return smoothstep(1 + feather, 1 - feather, distance);
}

function softPolygon(x, y, points) {
  if (!inPolygon(x, y, points)) return 0;
  const distance = points.reduce((closest, point, index) => {
    const next = points[(index + 1) % points.length];
    return Math.min(closest, distanceToSegment(x, y, point[0], point[1], next[0], next[1]));
  }, Infinity);
  return smoothstep(0, 0.055, distance);
}

function inPolygon(x, y, points) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const xi = points[i][0];
    const yi = points[i][1];
    const xj = points[j][0];
    const yj = points[j][1];
    const intersects = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

function distanceToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const length = dx * dx + dy * dy;
  const t = length === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / length));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

function smoothstep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function scatterPortrait(event) {
  const heroRect = hero.getBoundingClientRect();
  const clickX = event.clientX - heroRect.left;
  const clickY = event.clientY - heroRect.top;

  for (const pixel of pixels) {
    const dx = pixel.homeX - clickX;
    const dy = pixel.homeY - clickY;
    const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 1.25;
    const distance = Math.max(24, Math.hypot(dx, dy));
    const burst = 16 + Math.random() * 18 + Math.max(0, 260 - distance) * 0.07;
    pixel.vx += Math.cos(angle) * burst + (Math.random() - 0.5) * 8;
    pixel.vy += Math.sin(angle) * burst + (Math.random() - 0.5) * 8;
    pixel.spin += (Math.random() - 0.5) * 0.32;
  }
}

function disturbPortrait(originX, originY, radius = 145, strength = 8.5) {
  for (const pixel of pixels) {
    const dx = pixel.x - originX;
    const dy = pixel.y - originY;
    const distance = Math.hypot(dx, dy);
    if (distance < radius) {
      const falloff = 1 - distance / radius;
      const centerSoftener = distance < 38 ? distance / 38 : 1;
      const force = falloff * centerSoftener * strength;
      const angle = Math.atan2(dy, dx) + Math.sin(distance * 0.05) * 0.32;
      pixel.vx += Math.cos(angle) * force;
      pixel.vy += Math.sin(angle) * force;
      pixel.spin += falloff * 0.08;
    }
  }
}

function animatePortrait() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (pointer.active) {
    disturbPortrait(pointer.x, pointer.y);
  }

  for (const pixel of pixels) {
    const pull = introAssembling ? 0.011 : 0.07;
    const friction = introAssembling ? 0.93 : 0.68;
    pixel.vx += (pixel.homeX - pixel.x) * pull;
    pixel.vy += (pixel.homeY - pixel.y) * pull;
    pixel.vx *= friction;
    pixel.vy *= friction;
    pixel.spin *= 0.72;
    pixel.angle += (pixel.homeAngle - pixel.angle) * (introAssembling ? 0.045 : 0.11) + pixel.spin;
    pixel.x += pixel.vx;
    pixel.y += pixel.vy;

    drawPuzzlePiece(pixel);
  }

  animationId = requestAnimationFrame(animatePortrait);
}

function drawPuzzlePiece(pixel) {
  const size = pixel.size;
  const notch = size * 0.14;
  const tab = size * 0.13;
  ctx.save();
  ctx.translate(pixel.x, pixel.y);
  ctx.rotate(pixel.angle);
  ctx.fillStyle = pixel.color;
  ctx.strokeStyle = "rgba(6, 19, 37, 0.34)";
  ctx.lineWidth = 0.55;
  ctx.lineJoin = "round";
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.moveTo(-size / 2, -size / 2);
  ctx.lineTo(-tab, -size / 2);
  ctx.lineTo(0, -size / 2 - (pixel.shape % 2 === 0 ? notch : -notch));
  ctx.lineTo(tab, -size / 2);
  ctx.lineTo(size / 2, -size / 2);
  ctx.lineTo(size / 2, -tab);
  ctx.lineTo(size / 2 + (pixel.shape % 3 === 0 ? notch : -notch), 0);
  ctx.lineTo(size / 2, tab);
  ctx.lineTo(size / 2, size / 2);
  ctx.lineTo(tab, size / 2);
  ctx.lineTo(0, size / 2 + (pixel.shape % 2 === 1 ? notch : -notch));
  ctx.lineTo(-tab, size / 2);
  ctx.lineTo(-size / 2, size / 2);
  ctx.lineTo(-size / 2, tab);
  ctx.lineTo(-size / 2 + (pixel.shape % 3 === 1 ? notch : -notch), 0);
  ctx.lineTo(-size / 2, -tab);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function updatePointer(event) {
  const heroRect = hero.getBoundingClientRect();
  pointer.x = event.clientX - heroRect.left;
  pointer.y = event.clientY - heroRect.top;
  pointer.active = true;
}

portraitShell.addEventListener("pointermove", updatePointer);
portraitShell.addEventListener("pointerenter", (event) => {
  updatePointer(event);
});
portraitShell.addEventListener("pointerleave", () => {
  pointer.active = false;
});
portraitShell.addEventListener("click", scatterPortrait);

if (image.complete) {
  initPortrait();
} else {
  image.addEventListener("load", initPortrait);
}

let portraitResizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(portraitResizeTimer);
  portraitResizeTimer = setTimeout(initPortrait, 140);
});

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
  if (!walker.released) return;

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
  disturbPortrait(
    walkerRect.left + walkerRect.width / 2 - heroRect.left,
    walkerRect.top + walkerRect.height / 2 - heroRect.top,
    128,
    6.2
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

const typedIntro = document.getElementById("typedIntro");
const introText = "Hello, Nick Here.";
let typedIndex = 0;

function renderTyped(text) {
  const helloLength = Math.min(text.length, 6);
  const nickStart = Math.min(Math.max(text.length, 7), 7);
  const nickEnd = Math.min(text.length, 11);
  const beforeNick = text.slice(helloLength, nickStart);
  const afterNick = text.slice(nickEnd);
  typedIntro.innerHTML = `
    <span class="typed-white">${text.slice(0, helloLength)}</span>${beforeNick}<span class="typed-white">${text.slice(nickStart, nickEnd)}</span>${afterNick}<span class="type-cursor" aria-hidden="true"></span>
  `;
}

function typeHeadline() {
  renderTyped(introText.slice(0, typedIndex));
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
setInterval(fetchQuotes, 8000);
