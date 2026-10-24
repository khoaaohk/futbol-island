// Screenshot check for the sky keep-up (Oct 24 2026, lib/town/walkBall.ts KEEPUP_SKY): starts a keep-up with J held ~1.15 s
// (a full charge → the big kick), then takes one shot mid-flight with the red landing mark, on a phone (390 x 844) and a desktop
// (1280 x 800). Prints the ball / mark state. Closes only its own browser.
// Run: PW_CHANNEL=chrome node scripts/check-keepup-sky-shot.cjs <appUrl> [outDir]
const { chromium } = require('playwright');
const url = process.argv[2] || 'http://localhost:8135', out = process.argv[3] || '/tmp/keepup-sky';
require('fs').mkdirSync(out, { recursive: true });
(async () => {
  const b = await chromium.launch({ channel: process.env.PW_CHANNEL || undefined, args: ['--mute-audio'] });
  let fail = 0;
  try {
    for (const [name, vp] of [['phone', { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }], ['desktop', { viewport: { width: 1280, height: 800 } }]]) {
      const ctx = await b.newContext(vp), p = await ctx.newPage();const errs = [];p.on('pageerror', (e) => errs.push(e.message));
      await p.goto(url); await p.waitForTimeout(6000);
      await p.click('text=Get my save code').catch(() => {}); await p.waitForTimeout(2000);
      await p.click('button:has-text("Play")').catch(() => {}); await p.waitForTimeout(15000);
      await p.click('button:has-text("Skip")').catch(() => {}); await p.waitForTimeout(1500);
      await p.evaluate(() => { const f = window.__fi2; f.selectRide('walk'); }); await p.waitForTimeout(2500);
      await p.evaluate(() => { const f = window.__fi2; const X = 23, Z = -62; f.location.x = X; f.location.z = Z; f.rooftop.reset(X, Z); f.player.root.rotation.y = Math.PI; f.velocity.x = f.velocity.z = 0; }); await p.waitForTimeout(2000);
      await p.mouse.click(5, 400).catch(() => {});
      await p.keyboard.down('j'); await p.waitForTimeout(1150); await p.keyboard.up('j');
      await p.waitForTimeout(1500);
      const st = await p.evaluate(() => { const s = window.__fi2.walkBall.state; return { mode: s.mode, y: +s.y.toFixed(2), streak: s.streak, mark: [+s.skyX.toFixed(1), +s.skyZ.toFixed(1)], left: +s.skyLeft.toFixed(2) }; });
      await p.screenshot({ path: `${out}/keepup-sky-${name}.png` });
      console.log(name, JSON.stringify(st), errs.length ? 'errors: ' + errs.slice(0, 2).join(' | ') : '');
      if (st.mode !== 'sky') fail++;
      await ctx.close();
    }
  } finally { await b.close(); }
  process.exit(fail ? 1 : 0);
})();
