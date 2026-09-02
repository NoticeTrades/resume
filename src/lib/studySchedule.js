export const STUDY_STORAGE_KEY = "resume-study-v1";
export const AGAIN_DELAY_MS = 10 * 60 * 1000;
export const GOT_IT_INTERVAL_DAYS = [1, 3, 7, 14];

const EMPTY_SCHEDULE = { v: 1, cards: {} };

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function createEmptySchedule() {
  return { v: 1, cards: {} };
}

export function parseSchedule(raw) {
  if (!raw) return createEmptySchedule();

  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!isObject(parsed) || !isObject(parsed.cards)) {
      return createEmptySchedule();
    }

    const cards = {};
    Object.entries(parsed.cards).forEach(([noteId, card]) => {
      if (!noteId || !isObject(card) || !Number.isFinite(card.dueAt)) return;
      cards[noteId] = {
        dueAt: Number(card.dueAt),
        intervalIndex: Number.isInteger(card.intervalIndex) ? card.intervalIndex : -1,
        reps: Number.isFinite(card.reps) ? card.reps : 0,
        lastRating: typeof card.lastRating === "string" ? card.lastRating : "",
        updatedAt: Number.isFinite(card.updatedAt) ? card.updatedAt : 0,
      };
    });

    return { v: 1, cards };
  } catch {
    return createEmptySchedule();
  }
}

export function loadSchedule(storage = globalThis.localStorage) {
  try {
    return parseSchedule(storage?.getItem(STUDY_STORAGE_KEY));
  } catch {
    return createEmptySchedule();
  }
}

export function saveSchedule(schedule, storage = globalThis.localStorage) {
  const payload = {
    v: 1,
    updatedAt: Date.now(),
    cards: schedule?.cards ?? {},
  };

  try {
    storage?.setItem(STUDY_STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

export function endOfLocalDay(now = Date.now()) {
  const date = new Date(now);
  date.setHours(23, 59, 59, 999);
  return date.getTime();
}

export function getCard(schedule, noteId) {
  return schedule?.cards?.[noteId] ?? null;
}

export function isScheduled(card) {
  return Boolean(card && Number.isFinite(card.dueAt));
}

export function isDue(card, now = Date.now()) {
  return isScheduled(card) && card.dueAt <= now;
}

export function isDueToday(card, now = Date.now()) {
  return isScheduled(card) && card.dueAt <= endOfLocalDay(now);
}

export function isCmaOrGleimResource(resource) {
  if (!resource) return false;
  const haystack = [resource.title, resource.authorCreator, resource.resourceType]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return /\b(cma|gleim)\b/.test(haystack);
}

export function isCmaOrGleimNote(note) {
  return isCmaOrGleimResource(note?.relatedResource);
}

function compareStudyNotes(a, b, dueAtById = {}) {
  const preferred = Number(isCmaOrGleimNote(b)) - Number(isCmaOrGleimNote(a));
  if (preferred) return preferred;

  const aDue = dueAtById[a._id];
  const bDue = dueAtById[b._id];
  if (Number.isFinite(aDue) && Number.isFinite(bDue) && aDue !== bDue) {
    return aDue - bDue;
  }

  return new Date(a.publishedAt || 0).getTime() - new Date(b.publishedAt || 0).getTime();
}

export function partitionNotes(notes = [], schedule = EMPTY_SCHEDULE, now = Date.now()) {
  const due = [];
  const unscheduled = [];
  const later = [];
  const dueAtById = {};

  notes.forEach((note) => {
    if (!note?._id) return;
    const card = getCard(schedule, note._id);
    if (!isScheduled(card)) {
      unscheduled.push(note);
      return;
    }

    dueAtById[note._id] = card.dueAt;
    if (isDue(card, now)) {
      due.push(note);
      return;
    }

    later.push(note);
  });

  due.sort((a, b) => compareStudyNotes(a, b, dueAtById));
  unscheduled.sort((a, b) => compareStudyNotes(a, b));
  later.sort((a, b) => (dueAtById[a._id] ?? 0) - (dueAtById[b._id] ?? 0));

  const dueTodayCount = notes.filter((note) => isDueToday(getCard(schedule, note._id), now)).length;
  const nextLaterAt = later.length ? dueAtById[later[0]._id] : null;

  return { due, unscheduled, later, dueTodayCount, nextLaterAt };
}

export function nextGotItIntervalIndex(currentIndex = -1) {
  if (!Number.isInteger(currentIndex) || currentIndex < 0) return 0;
  return Math.min(currentIndex + 1, GOT_IT_INTERVAL_DAYS.length - 1);
}

export function daysToMs(days) {
  return days * 24 * 60 * 60 * 1000;
}

export function applyRating(schedule, noteId, rating, now = Date.now()) {
  if (!noteId) return schedule;

  const previous = getCard(schedule, noteId) ?? {
    dueAt: 0,
    intervalIndex: -1,
    reps: 0,
    lastRating: "",
    updatedAt: 0,
  };

  let intervalIndex = previous.intervalIndex;
  let dueAt = now;

  if (rating === "again") {
    intervalIndex = -1;
    dueAt = now + AGAIN_DELAY_MS;
  } else if (rating === "hard") {
    intervalIndex = previous.intervalIndex >= 0 ? previous.intervalIndex : 0;
    dueAt = now + daysToMs(GOT_IT_INTERVAL_DAYS[intervalIndex]);
  } else {
    intervalIndex = nextGotItIntervalIndex(previous.intervalIndex);
    dueAt = now + daysToMs(GOT_IT_INTERVAL_DAYS[intervalIndex]);
  }

  return {
    v: 1,
    cards: {
      ...schedule.cards,
      [noteId]: {
        dueAt,
        intervalIndex,
        reps: (previous.reps || 0) + 1,
        lastRating: rating,
        updatedAt: now,
      },
    },
  };
}

export function formatDueIn(dueAt, now = Date.now()) {
  if (!Number.isFinite(dueAt)) return "";
  const delta = dueAt - now;
  if (delta <= 0) return "now";

  const minutes = Math.round(delta / 60000);
  if (minutes < 60) return `in ${minutes} min`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `in ${hours} ${hours === 1 ? "hour" : "hours"}`;

  const days = Math.round(hours / 24);
  return `in ${days} ${days === 1 ? "day" : "days"}`;
}

export function formatNextInterval(rating, card) {
  if (rating === "again") return "10 min";
  if (rating === "hard") {
    const index = card?.intervalIndex >= 0 ? card.intervalIndex : 0;
    return `${GOT_IT_INTERVAL_DAYS[index]}d`;
  }
  const index = nextGotItIntervalIndex(card?.intervalIndex);
  return `${GOT_IT_INTERVAL_DAYS[index]}d`;
}
