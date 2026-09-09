import test from 'node:test';
import assert from 'node:assert/strict';
import { createQuoteService } from '../server/yahooQuotes.js';

test('partial failure retains healthy symbols; cached values are marked stale and expire', async () => {
  let time = 100000;
  let fail = false;
  let calls = 0;
  const service = createQuoteService(async url => {
    calls++;
    const failed = fail && decodeURIComponent(url.pathname).endsWith('ES=F');
    return { ok: !failed, json: async () => ({ chart: { result: [{ meta: { regularMarketPrice: 120, chartPreviousClose: 100, regularMarketTime: 90 } }] } }) };
  }, () => time);
  const first = await Promise.all([service(), service()]);
  assert.equal(calls, 8);
  assert.equal(first[0].quotes.length, 8);
  assert.equal(first[0].quotes[1].changePercent, 20);
  await service();
  assert.equal(calls, 8);
  fail = true; time += 16000;
  const next = await service();
  assert.equal(next.quotes[1].status, 'stale');
  assert.equal(next.quotes[1].price, 120);
  assert.equal(next.quotes[0].status, 'delayed');
  time += 86400000;
  assert.equal((await service()).quotes[1].status, 'unavailable');
});

test('null, invalid and rejected prices never become zero quotes or erase symbol labels', async () => {
  const service = createQuoteService(async url => {
    if (url.pathname.includes('NQ')) throw new Error('offline');
    return { ok: true, json: async () => ({ chart: { result: [{ meta: { regularMarketPrice: null, chartPreviousClose: 10 } }] } }) };
  });
  const result = await service();
  assert.equal(result.quotes.length, 8);
  assert.ok(result.quotes.every(quote => quote.price === null && quote.status === 'unavailable'));
});
