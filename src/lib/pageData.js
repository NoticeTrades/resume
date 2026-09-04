import {
  loadLearningNotes,
  loadLearningResources,
  loadPublishedArticles,
} from "./sanity.js";

const PREFIX = "nt-cache-v1:";

const WARMERS = {
  "/writing/": async () => {
    const data = await loadPublishedArticles();
    if (data.length) writeCache("articles", data);
  },
  "/library/": async () => {
    writeCache("resources", await loadLearningResources());
  },
  "/notes/": async () => {
    writeCache("notes", await loadLearningNotes());
  },
};

export function readCache(key) {
  try {
    const raw = sessionStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeCache(key, value) {
  try {
    sessionStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Private mode or a full quota should not block the page.
  }
}

export function sameSlugList(left = [], right = []) {
  if (left.length !== right.length) return false;
  return left.every((item, index) => item.slug === right[index]?.slug);
}

export function initializeNavPrefetch(root = document) {
  const warmed = new Set();

  root.querySelectorAll('.site-header nav a[href^="/"]').forEach((link) => {
    const path = new URL(link.getAttribute("href"), window.location.origin).pathname;
    const key = path.endsWith("/") ? path : `${path}/`;
    const warmer = WARMERS[key];
    if (!warmer) return;

    const warm = () => {
      if (warmed.has(key)) return;
      warmed.add(key);

      if (!document.head.querySelector(`link[rel="prefetch"][href="${key}"]`)) {
        const prefetch = document.createElement("link");
        prefetch.rel = "prefetch";
        prefetch.href = key;
        document.head.append(prefetch);
      }

      warmer().catch(() => {});
    };

    link.addEventListener("pointerenter", warm, { once: true });
    link.addEventListener("focus", warm, { once: true });
  });
}

export function initializeIndexPointer(root = document) {
  const hosts = root.querySelectorAll(".index-page, .home-index, .learning-page");
  if (!hosts.length) return () => {};

  const clear = () => {
    root.querySelectorAll(".index-row").forEach((row) => {
      row.style.setProperty("--row-glow", "0");
    });
  };

  const move = (event) => {
    root.querySelectorAll(".index-row").forEach((row) => {
      const rect = row.getBoundingClientRect();
      const distance = Math.abs(event.clientY - (rect.top + rect.height / 2));
      row.style.setProperty("--row-glow", distance < 28 ? "1" : "0");
    });
  };

  hosts.forEach((host) => {
    host.addEventListener("pointermove", move);
    host.addEventListener("pointerleave", clear);
  });

  return () => {
    hosts.forEach((host) => {
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", clear);
    });
  };
}
