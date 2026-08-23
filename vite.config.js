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

export default defineConfig({
  plugins: [yahooFinanceDevProxy()],
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        writing: "writing/index.html",
      },
    },
  },
});
