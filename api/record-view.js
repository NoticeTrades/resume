import { recordDocumentView } from "../server/recordView.js";

export default async function handler(request, response) {
  if (request.method && request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  let body = request.body ?? {};
  if (typeof body === "string") {
    try {
      body = JSON.parse(body || "{}");
    } catch {
      response.status(400).json({ error: "Invalid JSON" });
      return;
    }
  }

  const result = await recordDocumentView(body);

  if (result.skipped) {
    response.status(204).end();
    return;
  }

  response.status(result.status).json(result.ok ? { ok: true } : { error: result.error });
}
