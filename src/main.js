import "./style.css";

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

app.innerHTML = `
  <header class="site-header">
    <div class="header-left">
      <button class="wordmark" type="button" id="reloadSite">Nicholas Thomas</button>
      <nav aria-label="Main navigation">
        <a href="#home">Home</a>
        <a href="#about">About</a>
        <a href="#books">Books</a>
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
    </div>
  </header>

  <main>
    <section class="hero" id="home">
      <canvas id="pixelPortrait" class="pixel-stage"></canvas>
      <div class="hero-inner">
        <button class="portrait-shell" type="button" aria-label="Scatter pixel portrait">
          <img src="/nick-pixel-source.jpg" alt="" id="portraitSource" />
        </button>
        <div class="hero-copy">
          <p class="eyebrow">finance / trading / technology</p>
          <h1 id="typedIntro" aria-label="Hello, Nick Here."></h1>
          <p>
            I turn messy business assumptions into useful financial models, then spend
            my off-hours pulling apart markets, trading ideas, and new AI tools to see
            what actually holds up.
          </p>
          <a class="contact-action" href="mailto:nickthomasfx@gmail.com">Contact me</a>
        </div>
      </div>
    </section>

    <section class="about-section reveal-on-scroll" id="about">
      <div class="section-heading">
        <h2>/ about me</h2>
        <span></span>
      </div>
      <div class="about-grid">
        <article class="about-copy reveal-on-scroll">
          <p>
            During the day, I work with HVAC companies as a financial advisor, translating
            operating assumptions into models, forecasts, and revenue projections that
            make business decisions easier to understand.
          </p>
          <p>
            Away from work, I am usually studying something: financial markets, trading,
            finance, AI, machine learning, or new technology that can make analysis and
            decision-making more useful.
          </p>
          <p>
            I am also studying for the CMA, Certified Management Accountant, license and
            continuing to develop my trading framework. My main markets are index futures,
            especially NQ, ES, and YM.
          </p>
        </article>
        <aside class="focus-panel reveal-on-scroll">
          <h3>current focus</h3>
          <ul>
            <li>Financial forecasting</li>
            <li>Revenue projection models</li>
            <li>CMA exam preparation</li>
            <li>AI and machine learning</li>
            <li>NQ, ES, and YM futures</li>
          </ul>
        </aside>
      </div>
    </section>

    <section class="books-section reveal-on-scroll" id="books">
      <div class="section-heading">
        <h2>/ book recommendations</h2>
        <span></span>
      </div>
      <p>Coming soon. I’ll add the books, notes, and resources that have shaped how I think about markets, business, and decision-making.</p>
    </section>
  </main>
`;

const tickerTrack = document.getElementById("tickerTrack");
const marketDataEndpoint = import.meta.env.VITE_MARKET_DATA_ENDPOINT;

document.getElementById("reloadSite").addEventListener("click", () => {
  window.location.reload();
});

const hero = document.querySelector(".hero");
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
  const sample = 11;

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
      const index = (y * portraitWidth + x) * 4;
      const red = data[index];
      const green = data[index + 1];
      const blue = data[index + 2];
      const alpha = data[index + 3];
      const brightness = (red + green + blue) / 3;
      const mask = portraitMask(x / portraitWidth, y / portraitHeight);

      if (alpha > 20 && brightness > 18 && mask > 0.08) {
        const teal = Math.min(255, Math.round(green * 0.55 + blue * 0.65 + 60));
        const homeX = offsetX + x;
        const homeY = offsetY + y;
        const introAngle = Math.random() * Math.PI * 2;
        const introDistance = 90 + Math.random() * Math.max(canvasWidth, canvasHeight) * 0.32;
        pixels.push({
          x: homeX + Math.cos(introAngle) * introDistance,
          y: homeY + Math.sin(introAngle) * introDistance,
          homeX,
          homeY,
          vx: (Math.random() - 0.5) * 3,
          vy: (Math.random() - 0.5) * 3,
          angle: Math.random() * Math.PI * 2,
          homeAngle: ((x / sample + y / sample) % 7) * 0.045 - 0.135,
          spin: (Math.random() - 0.5) * 0.24,
          shape: Math.round(x / sample + y / sample) % 4,
          size: (sample * 1.06 + (brightness / 255) * 1.1) * Math.min(1, mask * 1.25),
          color: `rgba(${Math.round(red * 0.34)}, ${teal}, ${Math.min(255, blue + 44)}, ${(0.76 + brightness / 820) * Math.min(1, mask * 1.16)})`,
        });
      }
    }
  }

  cancelAnimationFrame(animationId);
  introTimer = setTimeout(() => {
    introAssembling = false;
  }, 1500);
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
  const paper = softEllipse(nx, ny, 0.21, 0.58, 0.25, 0.42, 0.18);
  const body = softEllipse(nx, ny, 0.58, 0.58, 0.34, 0.38, 0.16);
  const hand = softEllipse(nx, ny, 0.47, 0.82, 0.18, 0.1, 0.12);

  let mask = Math.max(mainShape * verticalFade, head, paper * 0.92, body, hand);
  const topLeftTrim = softEllipse(nx, ny, -0.08, 0, 0.36, 0.26, 0.2);
  const lowerLeftTrim = softEllipse(nx, ny, -0.12, 1.02, 0.34, 0.22, 0.16);
  const lowerRightTrim = softEllipse(nx, ny, 1.06, 0.98, 0.34, 0.22, 0.16);
  mask *= 1 - Math.max(topLeftTrim * 0.9, lowerLeftTrim * 0.8, lowerRightTrim * 0.8);
  return Math.max(0, Math.min(1, mask));
}

function softEllipse(x, y, cx, cy, rx, ry, feather) {
  const distance = Math.sqrt(((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2);
  return smoothstep(1 + feather, 1 - feather, distance);
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

function animatePortrait() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const pixel of pixels) {
    if (pointer.active) {
      const dx = pixel.x - pointer.x;
      const dy = pixel.y - pointer.y;
      const distance = Math.hypot(dx, dy);
      const radius = 145;
      if (distance < radius) {
        const falloff = 1 - distance / radius;
        const centerSoftener = distance < 38 ? distance / 38 : 1;
        const force = falloff * centerSoftener * 8.5;
        const angle = Math.atan2(dy, dx) + Math.sin(distance * 0.05) * 0.32;
        pixel.vx += Math.cos(angle) * force;
        pixel.vy += Math.sin(angle) * force;
        pixel.spin += falloff * 0.08;
      }
    }

    const pull = introAssembling ? 0.032 : 0.07;
    const friction = introAssembling ? 0.82 : 0.68;
    pixel.vx += (pixel.homeX - pixel.x) * pull;
    pixel.vy += (pixel.homeY - pixel.y) * pull;
    pixel.vx *= friction;
    pixel.vy *= friction;
    pixel.spin *= 0.72;
    pixel.angle += (pixel.homeAngle - pixel.angle) * 0.11 + pixel.spin;
    pixel.x += pixel.vx;
    pixel.y += pixel.vy;

    drawPuzzlePiece(pixel);
  }

  animationId = requestAnimationFrame(animatePortrait);
}

function drawPuzzlePiece(pixel) {
  const size = pixel.size;
  const notch = size * 0.18;
  const tab = size * 0.12;
  ctx.save();
  ctx.translate(pixel.x, pixel.y);
  ctx.rotate(pixel.angle);
  ctx.fillStyle = pixel.color;
  ctx.strokeStyle = "rgba(6, 19, 37, 0.7)";
  ctx.lineWidth = 1;
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

window.addEventListener("resize", initPortrait);

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
  if (!marketDataEndpoint) {
    renderQuotes(demoQuotes, "demo feed");
    return;
  }

  try {
    const response = await fetch(marketDataEndpoint, { cache: "no-store" });
    if (!response.ok) throw new Error(`Quote endpoint returned ${response.status}`);
    const payload = await response.json();
    const quotes = normalizeQuotes(payload);
    renderQuotes(quotes, "live");
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
setInterval(fetchQuotes, 15000);
