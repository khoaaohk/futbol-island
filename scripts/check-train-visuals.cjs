// Island Line train visuals (Nov 24 2026): before / after shots of the car model on ONE headless Chrome (--mute-audio, closed at the end).
// Views: platform (North, train 0 standing with its doors open), ride (seated ride camera after departure), near (all three trains
// pinned at North, the gfx-budget view), trestle (a train on the raised sea line: the contact shadow), each desktop + phone.
// Needs: NEXT_DIST_DIR=.next-vis npx next dev -p 9162     Run: node scripts/check-train-visuals.cjs --port=9162 --out=<dir> [--tag=after] [--views=a,b]
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const arg = (k, d) => { const a = process.argv.find((s) => s.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const port = arg('port'), out = arg('out', ''), tag = arg('tag', 'after'), views = arg('views', 'platform,ride,near,trestle').split(','), vps = arg('vps', 'desktop,phone').split(',');
if (!port || port === '8092' || !out) { console.error('give --port=<n> (never 8092) and --out=<dir>'); process.exit(2); }
fs.mkdirSync(out, { recursive: true });
const url = `http://localhost:${port}`;
async function boot(b, vp, mobile) {
  const ctx = await b.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1 });
  await ctx.addInitScript(() => {
    try { localStorage.setItem('fi2-welcome-v1', 'completed'); localStorage.setItem('fi2-public-hint-v1', 'card hint'); } catch {}
    const n = Date.now.bind(Date); window.__skew = 0; Date.now = () => n() + window.__skew;
  });
  await ctx.route('**/api/build-id', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message.slice(0, 200)));
  await p.goto(url + '/play?from=arcade', { timeout: 300000 }); await p.waitForTimeout(3000);
  for (let i = 0; i < 90 && !(await p.evaluate(() => !!window.__fi2)); i++) {
    for (const t of ['I saved it', 'Get my code', 'Play']) await p.click(`button:visible:has-text("${t}")`, { timeout: 300 }).catch(() => {});
    if (i === 0) await p.click('text=Get my save code', { timeout: 4000 }).catch(() => {});
    await p.waitForTimeout(2000);
  }
  await p.waitForFunction(() => !!window.__fi2 && !!window.__fi2.trainRide && !!window.__fi2.trains && !!window.__fi2.renderer && !document.querySelector('[data-island-return-loading]'), null, { timeout: 300000 });
  await p.waitForTimeout(3000);
  return { ctx, p, errs };
}
const setLap = (p, k, T) => p.evaluate(({ k, T }) => { const s = window.__fi2.trains.sched, P = s.trainPhase(k, s.clock()); window.__skew += (((T - P) % 360) + 360) % 360 * 1000; }, { k, T });
const tp = (p, x, z, yaw = 0) => p.evaluate(({ x, z, yaw }) => window.__fi2.teleport(x, z, yaw), { x, z, yaw });
const shot = (p, name, vpName) => p.screenshot({ path: path.join(out, `${tag}-${name}-${vpName}.png`) });
async function standAt(p, si) {
  const T = await p.evaluate((si) => { const s = window.__fi2.trains.sched, st = s.stops.find((x) => x.station.id === ['north', 'west', 'south', 'summit', 'cay'][si]); return st.arrive + 3.5; }, si);
  await setLap(p, 0, T); await p.waitForTimeout(600);
}
(async () => {
  const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--mute-audio', '--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
  try {
    for (const vpName of vps) {
      const mobile = vpName === 'phone', c = await boot(b, mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 }, mobile), { p } = c;
      await p.keyboard.press('Escape').catch(() => {});
      if (views.includes('near')) {
        await p.evaluate(() => { window.__fi2.trains.cluster = 2534; }); await tp(p, 186, -203.5, -Math.PI / 2); await p.waitForTimeout(2500); await shot(p, 'near', vpName);
        await p.evaluate(() => { window.__fi2.trains.cluster = NaN; });
      }
      if (views.includes('trestle')) {
        // the highest bed on the line (the raised sea trestle), trains pinned there, the player 22 m off to the side on the water
        const at = await p.evaluate(() => { const s = window.__fi2.trains.sched; let best = 0, bs = 0; for (let x = 0; x < 2700; x += 4) { const b = s.bed(x); if (b > best) { best = b; bs = x; } }
          const a = s.trackAt(bs); return { s: bs, x: a.x + a.tz * 16, z: a.z - a.tx * 16, yaw: Math.atan2(-a.tz, a.tx) }; });
        await p.evaluate((s) => { window.__fi2.trains.cluster = s - 30; }, at.s); await tp(p, at.x, at.z, at.yaw); await p.waitForTimeout(3000); await shot(p, 'trestle', vpName);
        await p.evaluate(() => { window.__fi2.trains.cluster = NaN; });
      }
      if (views.includes('platform') || views.includes('ride')) {
        await standAt(p, 0);
        await p.evaluate(() => { const sp = window.__fi2.trainRide.stationSpot(0, 0); window.__fi2.teleport(sp.x, sp.z, sp.yaw + Math.PI); }); await p.waitForTimeout(2500);
        if (views.includes('platform')) await shot(p, 'platform', vpName);
        if (views.includes('ride')) {
          await p.evaluate(() => { document.querySelector('[data-train-board]')?.click(); if (!window.__fi2.trainRide.active) window.__fi2.trainRide.board(); }); await p.waitForTimeout(2500);
          await shot(p, 'seated', vpName);
          for (let i = 0; i < 40; i++) { const at = await p.evaluate(() => window.__fi2.trains.states[window.__fi2.trainRide.train]?.at ?? -1); if (at < 0) break; await p.waitForTimeout(500); }
          await p.waitForTimeout(4000); await shot(p, 'ride', vpName);
        }
      }
      if (c.errs.length) console.log(`${vpName}: page errors: ${c.errs.slice(0, 3).join(' | ')}`);
      await c.ctx.close();
    }
  } finally { await b.close(); }
  console.log(`shots in ${out}`);
})().catch((e) => { console.error(e); process.exit(1); });
