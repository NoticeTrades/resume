export function initializeRevealAnimations(root = document) {
  const items = root.querySelectorAll(".reveal-on-scroll");

  if (!("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-visible"));
    return () => {};
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12 }
  );

  items.forEach((item) => observer.observe(item));
  return () => observer.disconnect();
}

// The header is sticky, so anchor targets land underneath it. Its height is
// measured rather than hardcoded: the mobile homepage includes a ticker row,
// while interior pages use a compact single-row header.
export function syncHeaderOffset(header = document.querySelector(".site-header")) {
  if (!header) return () => {};

  const apply = () => {
    const height = Math.round(header.getBoundingClientRect().height);
    document.documentElement.style.setProperty("--header-height", `${height}px`);
  };

  apply();

  if (!("ResizeObserver" in window)) {
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }

  const observer = new ResizeObserver(apply);
  observer.observe(header);
  return () => observer.disconnect();
}

export function getRouteSlug(section, queryName = "slug") {
  const querySlug = new URLSearchParams(window.location.search).get(queryName);
  if (querySlug) return querySlug;

  const parts = window.location.pathname.split("/").filter(Boolean);
  const sectionIndex = parts.indexOf(section);
  if (sectionIndex < 0 || !parts[sectionIndex + 1]) return "";

  try {
    return decodeURIComponent(parts[sectionIndex + 1]);
  } catch {
    return parts[sectionIndex + 1];
  }
}

export function setPageTitle(title) {
  document.title = title ? `${title} | Nicholas Thomas` : "Nicholas Thomas";
}
