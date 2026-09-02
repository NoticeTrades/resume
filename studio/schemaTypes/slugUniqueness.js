const API_VERSION = "2026-08-23";

// Sanity does not check slug uniqueness on its own, and the website resolves detail
// routes with `[0]`, so a second document sharing a slug would silently shadow the
// first. Scoped to `_type` because /library and /notes are separate namespaces.
export function isUniqueSlugForType(slug, context) {
  if (!slug) return true;

  const { document, getClient } = context;
  const publishedId = (document?._id ?? "").replace(/^drafts\./, "");

  return getClient({ apiVersion: API_VERSION }).fetch(
    `!defined(*[
      _type == $type &&
      !(_id in [$draft, $published]) &&
      slug.current == $slug
    ][0]._id)`,
    {
      type: document?._type ?? "",
      draft: `drafts.${publishedId}`,
      published: publishedId,
      slug,
    }
  );
}
