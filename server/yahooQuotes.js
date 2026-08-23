const yahooContracts = [
  { symbol: "NQ", yahooSymbol: "NQ=F" },
  { symbol: "ES", yahooSymbol: "ES=F" },
  { symbol: "YM", yahooSymbol: "YM=F" },
  { symbol: "RTY", yahooSymbol: "RTY=F" },
];

async function fetchYahooContract({ symbol, yahooSymbol }) {
  const endpoint = new URL(
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}`
  );
  endpoint.searchParams.set("interval", "1m");
  endpoint.searchParams.set("range", "1d");

  const response = await fetch(endpoint, {
    headers: {
      Accept: "application/json",
      "User-Agent": "Mozilla/5.0 (compatible; NicholasThomasPortfolio/1.0)",
    },
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new Error(`Yahoo returned ${response.status} for ${yahooSymbol}`);
  }

  const payload = await response.json();
  const result = payload.chart?.result?.[0];
  const meta = result?.meta;

  if (!meta || payload.chart?.error) {
    throw new Error(`Yahoo returned no quote for ${yahooSymbol}`);
  }

  const closes = result.indicators?.quote?.[0]?.close ?? [];
  const latestClose = [...closes].reverse().find(Number.isFinite);
  const price = Number(meta.regularMarketPrice ?? latestClose);
  const previousClose = Number(meta.chartPreviousClose ?? meta.previousClose);

  if (!Number.isFinite(price) || !Number.isFinite(previousClose)) {
    throw new Error(`Yahoo returned an incomplete quote for ${yahooSymbol}`);
  }

  const change = price - previousClose;

  return {
    symbol,
    price,
    change,
    changePercent: previousClose ? (change / previousClose) * 100 : 0,
    marketTime: meta.regularMarketTime ? meta.regularMarketTime * 1000 : null,
  };
}

export async function fetchYahooQuotes() {
  const quotes = await Promise.all(yahooContracts.map(fetchYahooContract));

  return {
    quotes,
    provider: "Yahoo Finance",
    status: "Yahoo delayed",
    fetchedAt: Date.now(),
  };
}
