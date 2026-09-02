import { defineConfig } from "vite";
import { fetchYahooQuotes } from "./server/yahooQuotes.js";

function yahooFinanceDevProxy() {
  return {
    name: "yahoo-finance-dev-proxy",
    configureServer(server) {
      server.middlewares.use("/api/market-data", async (request, response) => {
        if (request.method !== "GET") {
          response.statusCode = 405;
          response.setHeader("Allow", "GET");
          response.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }

        response.setHeader("Content-Type", "application/json");

        try {
          const payload = await fetchYahooQuotes();
          response.statusCode = 200;
          response.end(JSON.stringify(payload));
        } catch (error) {
          response.statusCode = 502;
          response.end(
            JSON.stringify({
              error: "Market data is temporarily unavailable",
              detail: error instanceof Error ? error.message : "Unknown Yahoo Finance error",
            })
          );
        }
      });
    },
  };
}

function rewriteLearningRoute(request) {
  const requestUrl = new URL(request.url, "http://localhost");
  const match = requestUrl.pathname.match(/^\/(library|notes)\/([^/]+)\/?$/);
  if (!match) return;

  const [, section, slug] = match;
  requestUrl.pathname = `/${section}/`;
  try {
    requestUrl.searchParams.set("slug", decodeURIComponent(slug));
  } catch {
    requestUrl.searchParams.set("slug", slug);
  }
  request.url = `${requestUrl.pathname}${requestUrl.search}`;
}

function learningRouteFallbacks() {
  const configure = (server) => {
    server.middlewares.use((request, _response, next) => {
      rewriteLearningRoute(request);
      next();
    });
  };

  return {
    name: "learning-route-fallbacks",
    configureServer: configure,
    configurePreviewServer: configure,
  };
}

export default defineConfig({
  plugins: [learningRouteFallbacks(), yahooFinanceDevProxy()],
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        writing: "writing/index.html",
        library: "library/index.html",
        notes: "notes/index.html",
        study: "study/index.html",
      },
    },
  },
});
