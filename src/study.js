import "./style.css";
import "./writing.css";
import "./learning.css";
import { escapeHtml, loadLearningNotes } from "./lib/sanity.js";
import {
  initializeInteriorChrome,
  renderInteriorHeader,
  renderSiteFooter,
} from "./lib/siteChrome.js";
import { initializeRevealAnimations, setPageTitle } from "./lib/pageUi.js";
import {
  applyRating,
  formatDueIn,
  formatNextInterval,
  getCard,
  loadSchedule,
  partitionNotes,
  saveSchedule,
} from "./lib/studySchedule.js";

const STUDIO_URL = "https://bynickthomas.sanity.studio/";
const REVEAL_CAP = 20;
const SESSION_MS_CAP = 30 * 60 * 1000;

const app = document.querySelector("#app");
let cleanupChrome = () => {};
let cleanupReveals = () => {};
let stopKeyboard = () => {};

const session = {
  startedAt: Date.now(),
  revealCount: 0,
  continueAfterCap: false,
  practicingUnscheduled: false,
  notes: [],
  schedule: loadSchedule(),
  currentNoteId: "",
  revealed: false,
  view: "loading",
};

function sessionElapsedMs(now = Date.now()) {
  return Math.max(0, now - session.startedAt);
}

function sessionHitCap(now = Date.now()) {
  if (session.revealCount <= 0) return false;
  return session.revealCount >= REVEAL_CAP || sessionElapsedMs(now) >= SESSION_MS_CAP;
}

function queueSnapshot(now = Date.now()) {
  return partitionNotes(session.notes, session.schedule, now);
}

function nextNote(now = Date.now()) {
  const { due, unscheduled } = queueSnapshot(now);
  if (due.length) return due[0];
  if (session.practicingUnscheduled && unscheduled.length) return unscheduled[0];
  return null;
}

function persistSchedule() {
  saveSchedule(session.schedule);
}

function bindKeyboard() {
  stopKeyboard();

  const onKeyDown = (event) => {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
    const target = event.target;
    if (target instanceof HTMLElement) {
      const tag = target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable) {
        return;
      }
    }

    const key = event.key;
    if (!session.revealed && session.view === "prompt" && (key === " " || key === "Enter")) {
      event.preventDefault();
      revealCurrent();
      return;
    }

    if (session.revealed && session.view === "prompt") {
      if (key === "1" || key === "j" || key === "J") {
        event.preventDefault();
        rateCurrent("again");
      } else if (key === "2" || key === "k" || key === "K") {
        event.preventDefault();
        rateCurrent("got-it");
      } else if (key === "3" || key === "h" || key === "H") {
        event.preventDefault();
        rateCurrent("hard");
      }
    }
  };

  document.addEventListener("keydown", onKeyDown);
  stopKeyboard = () => document.removeEventListener("keydown", onKeyDown);
}

function renderShell(content) {
  cleanupChrome();
  cleanupReveals();
  app.innerHTML = `${renderInteriorHeader("/study/")}${content}${renderSiteFooter()}`;
  cleanupChrome = initializeInteriorChrome();
  cleanupReveals = initializeRevealAnimations(app);
  bindStudyActions(app);
}

function bindStudyActions(root) {
  root.querySelectorAll("[data-study-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.getAttribute("data-study-action");
      if (action === "reveal") revealCurrent();
      if (action === "again") rateCurrent("again");
      if (action === "hard") rateCurrent("hard");
      if (action === "got-it") rateCurrent("got-it");
      if (action === "practice-unscheduled") startUnscheduled();
      if (action === "continue-after-cap") continueAfterCap();
      if (action === "stop") showStopped();
    });
  });
}

function renderHero() {
  return `
    <section class="learning-hero study-hero reveal-on-scroll">
      <p class="section-kicker">retrieval practice</p>
      <h1>Study the <span>notes.</span></h1>
      <p>
        Hide the answer, try to recall, then reveal. This drills Nick's published
        Today I Learned notes — not a copied exam bank.
      </p>
    </section>
  `;
}

function renderKeys() {
  return `
    <p class="study-keys">
      Keyboard: <kbd>Space</kbd> or <kbd>Enter</kbd> reveal ·
      <kbd>1</kbd>/<kbd>J</kbd> again ·
      <kbd>2</kbd>/<kbd>K</kbd> got it ·
      <kbd>3</kbd>/<kbd>H</kbd> hard
    </p>
  `;
}

function formatSessionClock(now = Date.now()) {
  const minutes = Math.floor(sessionElapsedMs(now) / 60000);
  const seconds = Math.floor((sessionElapsedMs(now) % 60000) / 1000);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function renderMeta(now = Date.now()) {
  const { due, unscheduled, dueTodayCount } = queueSnapshot(now);
  const capNote = sessionHitCap(now)
    ? "Soft cap reached — keep going only if you want."
    : `Soft cap ${REVEAL_CAP} reveals / 30 min.`;

  return `
    <div class="study-meta" aria-live="polite">
      <p>
        <strong>${dueTodayCount}</strong> due today
        · <strong>${due.length}</strong> due now
        · <strong>${unscheduled.length}</strong> unscheduled
      </p>
      <p>
        Session ${session.revealCount}/${REVEAL_CAP} · ${formatSessionClock(now)}
        · ${capNote}
      </p>
    </div>
  `;
}

function renderEmptyNotes() {
  setPageTitle("Study");
  session.view = "empty";
  return `
    <main class="learning-page study-page">
      ${renderHero()}
      <div class="learning-empty reveal-on-scroll">
        <strong>No published notes to drill.</strong>
        Write a Learning Note in
        <a href="${STUDIO_URL}" target="_blank" rel="noreferrer">Sanity Studio</a>
        and it will appear here as a recall prompt. This page never seeds sample cards.
      </div>
    </main>
  `;
}

function renderLoadError() {
  setPageTitle("Study");
  session.view = "error";
  return `
    <main class="learning-page study-page">
      ${renderHero()}
      <div class="learning-empty reveal-on-scroll">
        <strong>The notebook could not be opened.</strong>
        Try again in a moment, or browse
        <a href="/notes/">Today I Learned</a>.
      </div>
    </main>
  `;
}

function renderOfferUnscheduled(queue) {
  session.view = "offer-unscheduled";
  session.currentNoteId = "";
  session.revealed = false;
  const count = queue.unscheduled.length;
  return `
    <main class="learning-page study-page">
      ${renderHero()}
      ${renderMeta()}
      <section class="study-panel reveal-on-scroll" aria-labelledby="studyOfferTitle">
        <h2 id="studyOfferTitle">Nothing is due right now.</h2>
        <p>
          ${count} published ${count === 1 ? "note has" : "notes have"} no review
          schedule yet. Practice ${count === 1 ? "it" : "those"} now, or stop.
        </p>
        <div class="study-actions">
          <button class="study-btn study-btn-primary" type="button" data-study-action="practice-unscheduled">
            Practice remaining
          </button>
          <button class="study-btn" type="button" data-study-action="stop">Stop for now</button>
        </div>
        <a class="detail-back" href="/notes/">← Today I Learned</a>
      </section>
    </main>
  `;
}

function renderCaughtUp(queue, now = Date.now()) {
  session.view = "caught-up";
  session.currentNoteId = "";
  session.revealed = false;
  const next = queue.nextLaterAt ? formatDueIn(queue.nextLaterAt, now) : "";
  return `
    <main class="learning-page study-page">
      ${renderHero()}
      ${renderMeta(now)}
      <section class="study-panel reveal-on-scroll" aria-labelledby="studyCaughtUpTitle">
        <h2 id="studyCaughtUpTitle">Caught up.</h2>
        <p>
          No due notes and nothing left to schedule.
          ${next ? `The next review is ${escapeHtml(next)}.` : ""}
        </p>
        <a class="resource-external" href="/notes/">Browse notes <span aria-hidden="true">→</span></a>
      </section>
    </main>
  `;
}

function renderStopped() {
  session.view = "stopped";
  session.currentNoteId = "";
  session.revealed = false;
  return `
    <main class="learning-page study-page">
      ${renderHero()}
      ${renderMeta()}
      <section class="study-panel reveal-on-scroll" aria-labelledby="studyStoppedTitle">
        <h2 id="studyStoppedTitle">Session parked.</h2>
        <p>The schedule stays in this browser. Come back when you want the next recall.</p>
        <a class="resource-external" href="/notes/">Browse notes <span aria-hidden="true">→</span></a>
      </section>
    </main>
  `;
}

function renderCap(now = Date.now()) {
  session.view = "cap";
  session.currentNoteId = "";
  session.revealed = false;
  const reason =
    session.revealCount >= REVEAL_CAP
      ? `${REVEAL_CAP} reveals`
      : "30 minutes";
  return `
    <main class="learning-page study-page">
      ${renderHero()}
      ${renderMeta(now)}
      <section class="study-panel reveal-on-scroll" aria-labelledby="studyCapTitle">
        <h2 id="studyCapTitle">That's a full sit.</h2>
        <p>
          You hit the soft ${escapeHtml(reason)} cap — the same length as a
          20-item / 30-minute quiz block. The page is not locked.
        </p>
        <div class="study-actions">
          <button class="study-btn study-btn-primary" type="button" data-study-action="continue-after-cap">
            Keep going
          </button>
          <button class="study-btn" type="button" data-study-action="stop">Stop here</button>
        </div>
      </section>
    </main>
  `;
}

function renderPrompt(note, now = Date.now()) {
  session.view = "prompt";
  session.currentNoteId = note._id;
  const card = getCard(session.schedule, note._id);
  const resource = note.relatedResource
    ? `<p class="study-resource">Learning from ${escapeHtml(note.relatedResource.title)}</p>`
    : "";

  const answer = session.revealed
    ? `
      <div class="study-answer">
        <div class="article-signal" aria-hidden="true"><span></span></div>
        <div class="article-body">${note.bodyHtml}</div>
        <a class="study-open-note" href="/notes/${encodeURIComponent(note.slug)}">Open full note ↗</a>
      </div>
      <div class="study-actions" role="group" aria-label="How well did you recall this note?">
        <button class="study-btn study-btn-again" type="button" data-study-action="again">
          Again
          <span>${formatNextInterval("again", card)}</span>
        </button>
        <button class="study-btn study-btn-hard" type="button" data-study-action="hard">
          Hard
          <span>${formatNextInterval("hard", card)}</span>
        </button>
        <button class="study-btn study-btn-got-it" type="button" data-study-action="got-it">
          Got it
          <span>${formatNextInterval("got-it", card)}</span>
        </button>
      </div>
    `
    : `
      <p class="study-hint">Recall the idea in your own words, then reveal. The body stays hidden until you do.</p>
      <div class="study-actions">
        <button class="study-btn study-btn-primary" type="button" data-study-action="reveal" id="studyReveal">
          Reveal
        </button>
      </div>
    `;

  return `
    <main class="learning-page study-page">
      ${renderHero()}
      ${renderMeta(now)}
      <article class="study-card reveal-on-scroll" aria-live="polite">
        <div class="note-card-topline">
          <span class="note-category">${escapeHtml(note.category || "Note")}</span>
          <span class="note-date">${escapeHtml(note.displayDate)}</span>
        </div>
        <h2>${escapeHtml(note.title)}</h2>
        ${resource}
        ${answer}
      </article>
      ${renderKeys()}
    </main>
  `;
}

function showCurrentView(now = Date.now()) {
  if (!session.notes.length) {
    renderShell(renderEmptyNotes());
    return;
  }

  const current = session.currentNoteId
    ? session.notes.find((note) => note._id === session.currentNoteId)
    : null;

  if (current) {
    renderShell(renderPrompt(current, now));
    if (!session.revealed) document.getElementById("studyReveal")?.focus();
    return;
  }

  if (!session.continueAfterCap && sessionHitCap(now)) {
    renderShell(renderCap(now));
    return;
  }

  const note = nextNote(now);
  if (note) {
    renderShell(renderPrompt(note, now));
    document.getElementById("studyReveal")?.focus();
    return;
  }

  const queue = queueSnapshot(now);
  if (queue.unscheduled.length && !session.practicingUnscheduled) {
    renderShell(renderOfferUnscheduled(queue));
    return;
  }

  renderShell(renderCaughtUp(queue, now));
}

function revealCurrent() {
  if (session.view !== "prompt" || session.revealed || !session.currentNoteId) return;
  session.revealed = true;
  session.revealCount += 1;
  showCurrentView();
}

function rateCurrent(rating) {
  if (session.view !== "prompt" || !session.revealed || !session.currentNoteId) return;
  session.schedule = applyRating(session.schedule, session.currentNoteId, rating);
  persistSchedule();
  session.revealed = false;
  session.currentNoteId = "";
  showCurrentView();
}

function startUnscheduled() {
  session.practicingUnscheduled = true;
  session.revealed = false;
  showCurrentView();
}

function continueAfterCap() {
  session.continueAfterCap = true;
  showCurrentView();
}

function showStopped() {
  renderShell(renderStopped());
}

async function initializeStudy() {
  setPageTitle("Study");
  renderShell(`
    <main class="learning-page study-page">
      ${renderHero()}
      <div class="loading-state" role="status">Shuffling the due notes…</div>
    </main>
  `);

  try {
    session.notes = await loadLearningNotes();
    session.schedule = loadSchedule();
    showCurrentView();
  } catch {
    renderShell(renderLoadError());
  }

  bindKeyboard();
}

initializeStudy();
