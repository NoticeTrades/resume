import { fetchYahooQuotes } from "../server/yahooQuotes.js";

export default async function handler(request, response) {
  if (request.method && request.method !== "GET") {
    response.setHeader("Allow", "GET");
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const payload = await fetchYahooQuotes();
    response.setHeader("Cache-Control", "s-maxage=5, stale-while-revalidate=15");
    response.status(200).json(payload);
  } catch (error) {
    response.status(502).json({
      error: "Market data is temporarily unavailable",
      detail: error instanceof Error ? error.message : "Unknown Yahoo Finance error",
    });
  }
}
