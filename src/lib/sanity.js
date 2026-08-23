import { toHTML } from "@portabletext/to-html";

const projectId = import.meta.env.VITE_SANITY_PROJECT_ID || "vzrug3c0";
const dataset = import.meta.env.VITE_SANITY_DATASET || "production";

const articleQuery = `
  *[
    _type == "article" &&
    defined(slug.current) &&
    defined(publishedAt)
  ] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    category,
    excerpt,
    publishedAt,
    readTime,
    featured,
    "coverImage": coverImage.asset->url,
    body[]{
      ...,
      _type == "image" => {
        "url": asset->url,
        alt,
        caption
      }
    }
  }
`;

export function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function estimateReadTime(body = []) {
  const wordCount = body
    .filter((block) => block?._type === "block")
    .flatMap((block) => block.children ?? [])
    .map((child) => child.text ?? "")
    .join(" ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(1, Math.ceil(wordCount / 220));
}

function formatPublishedDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Published article";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function renderPortableText(body = []) {
  return toHTML(body, {
    components: {
      types: {
        image: ({ value }) => {
          if (!value?.url) return "";
          const alt = escapeHtml(value.alt || "Article image");
          const caption = value.caption
            ? `<figcaption>${escapeHtml(value.caption)}</figcaption>`
            : "";
          return `<figure><img src="${escapeHtml(value.url)}" alt="${alt}" loading="lazy" />${caption}</figure>`;
        },
      },
      marks: {
        link: ({ children, value }) => {
          const href = typeof value?.href === "string" ? value.href : "#";
          const external = href.startsWith("http");
          return `<a href="${escapeHtml(href)}"${external ? ' target="_blank" rel="noreferrer"' : ""}>${children}</a>`;
        },
      },
    },
  });
}

export async function loadPublishedArticles() {
  const endpoint = new URL(
    `https://${projectId}.apicdn.sanity.io/v2026-08-23/data/query/${dataset}`
  );
  endpoint.searchParams.set("query", articleQuery);
  endpoint.searchParams.set("perspective", "published");

  const response = await fetch(endpoint, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(4000),
  });

  if (!response.ok) {
    throw new Error(`Sanity returned ${response.status}`);
  }

  const payload = await response.json();
  const documents = payload.result ?? [];

  return documents.map((article) => {
    const minutes = Number(article.readTime) || estimateReadTime(article.body);
    return {
      ...article,
      displayDate: formatPublishedDate(article.publishedAt),
      readTime: `${minutes} min read`,
      bodyHtml: renderPortableText(article.body),
    };
  });
}
