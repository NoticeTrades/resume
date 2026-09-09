const { chromium, webkit, devices } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
(async () => {
  await fs.mkdir('test-results/market-ticker', { recursive: true });
  for (const engine of [chromium, webkit]) {
    const browser = await engine.launch();
    try {
      const page = await browser.newPage({ ...devices['iPhone 13'] });
      let mode = 'slow';
      await page.route('**/api/market-data', async route => {
        if (mode === 'slow') await new Promise(resolve => setTimeout(resolve, 1700));
        if (mode === 'offline') return route.fulfill({ status: 503, body: 'offline' });
        return route.fulfill({ json: { quotes: [{ symbol: 'NQ', price: 12345, changePercent: 1.2, fetchedAt: Date.now(), status: 'delayed' }] } });
      });
      await page.routeWebSocket('wss://ws.kraken.com/v2', ws => {
        ws.onMessage(() => ws.send(JSON.stringify({ channel: 'ticker', type: 'snapshot', data: [{ symbol: 'BTC/USD', last: 76543, change_pct: 2.2, timestamp: new Date().toISOString() }] })));
      });
      await page.goto('http://127.0.0.1:5173/');
      const first = page.locator('.ticker-group').first();
      assert.equal(await first.locator('.ticker-item').count(), 8);
      assert.equal(await first.locator('[data-symbol=NQ] small').textContent(), 'loading');
      await page.waitForFunction(() => document.querySelector('[data-symbol=NQ] .ticker-price').textContent === '12,345.00');
      await page.waitForFunction(() => document.querySelector('[data-symbol=BTC] small').textContent === 'live');
      assert.equal(await first.locator('[data-symbol=ETH] small').textContent(), 'offline');
      await page.evaluate(() => { window.originalTicker = document.querySelector('[data-symbol=NQ]'); });
      mode = 'offline';
      await page.evaluate(() => window.dispatchEvent(new Event('online')));
      await page.waitForFunction(() => document.querySelector('[data-symbol=NQ] small').textContent === 'stale');
      assert.equal(await first.locator('[data-symbol=NQ] .ticker-price').textContent(), '12,345.00');
      assert.ok(await page.evaluate(() => window.originalTicker === document.querySelector('[data-symbol=NQ]')));
      const widths = await page.locator('.ticker-group').evaluateAll(groups => groups.map(group => group.getBoundingClientRect().width));
      assert.ok(Math.abs(widths[0] - widths[1]) < 0.01);
      for (const portion of [0, .25, .5, .75, .99]) {
        assert.ok(await page.evaluate(fraction => {
          const track = document.querySelector('.ticker-track');
          const animation = track.getAnimations()[0];
          animation.pause(); animation.currentTime = 68000 * fraction;
          const frame = track.parentElement.getBoundingClientRect();
          return [...track.querySelectorAll('.ticker-item')].some(item => {
            const rect = item.getBoundingClientRect();
            return rect.left <= frame.left + frame.width / 2 && rect.right >= frame.left + frame.width / 2;
          });
        }, portion), 'ticker center must always be covered throughout the loop');
      }
      await page.evaluate(() => document.querySelector('.ticker-track').getAnimations()[0].cancel());
      await page.screenshot({ path: `test-results/market-ticker/${engine.name()}-mobile.png` });
      await page.getByRole('button', { name: 'Open menu' }).tap();
      const ranks = await page.locator('.mobile-menu .nav-card > span:first-child').allTextContents();
      assert.deepEqual(ranks, ['A', '2', '3', '4', '5']);
      const delays = await page.locator('.mobile-menu nav a').evaluateAll(links => links.map(link => link.getAnimations()[0]?.effect.getTiming().delay));
      assert.deepEqual(delays, [110, 175, 240, 305, 370]);
      await page.locator('.mobile-menu').evaluate(el => Promise.all(el.getAnimations({ subtree: true }).map(a => a.finished)));
      await page.screenshot({ path: `test-results/market-ticker/${engine.name()}-menu.png` });
      await page.getByRole('button', { name: 'Close menu' }).tap();
      await page.waitForFunction(() => !document.querySelector('dialog').open);
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.waitForTimeout(700);
      assert.equal(await page.getByRole('button', { name: 'Open menu' }).isVisible(), false);
      await page.screenshot({ path: `test-results/market-ticker/${engine.name()}-desktop.png` });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.reload();
      await page.waitForFunction(() => document.querySelector('[data-symbol=NQ] small').textContent === 'stale');
      assert.equal(await page.locator('[data-symbol=NQ] .ticker-price').first().textContent(), '12,345.00');
      console.log(`PASS ${engine.name()}: initial labels, partial quotes, stream, offline retention, cache reload, stable DOM, seamless loop, stagger, desktop`);
    } finally { await browser.close(); }
  }
})().catch(error => { console.error(error); process.exit(1); });
