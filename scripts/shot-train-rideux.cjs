// Island Line ride UX (Nov 24 2026): screenshots of the Get off pill braking in, the camera button, the Inside view (the arcade /
// museum room framing) and one outside view, desktop + phone, plus the arcade room for comparison. ONE headless Chrome (--mute-audio),
// closed at the end. Never port 8092.
// Needs: app  NEXT_DIST_DIR=.next-rux npx next dev -p 9172     Run: node scripts/shot-train-rideux.cjs --port=9172 --shots=<dir>
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const arg = (k, d) => { const a = process.argv.find((s) => s.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const port = arg('port'), shots = arg('shots', ''), only = arg('only', 'desktop,phone,arcade').split(',');
if (!port || port === '8092' || !shots) { console.error('give --port=<n> (never 8092) and --shots=<dir>'); process.exit(2); }
fs.mkdirSync(shots, { recursive: true });
const url = `http://localhost:${port}`;
const out = [];
const log = (s) => { out.push(s); console.log(s); };
async function boot(b, vp, mobile) {
  const ctx = await b.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1 });
  await ctx.addInitScript(() => {
    try { localStorage.setItem('fi2-welcome-v1', 'completed'); localStorage.setItem('fi2-public-hint-v1', 'card hint'); } catch {}
    const n = Date.now.bind(Date); window.__skew = 0; Date.now = () => n() + window.__skew;
  });
  await ctx.route('**/api/build-id', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  const p = await ctx.newPage(), errs = [];
  p.on('pageerror', (e) => errs.push(e.message.slice(0, 200)));
  await p.goto(url + '/play?from=arcade', { timeout: 240000 }); await p.waitForTimeout(3000);
  for (let i = 0; i < 90 && !(await p.evaluate(() => !!window.__fi2)); i++) {
    for (const t of ['I saved it', 'Get my code', 'Play']) await p.click(`button:visible:has-text("${t}")`, { timeout: 300 }).catch(() => {});
    if (i === 0) await p.click('[data-title-start]', { timeout: 4000 }).catch(() => {});
    await p.waitForTimeout(2000);
  }
  await p.waitForFunction(() => !!window.__fi2 && !!window.__fi2.trainRide && !!window.__fi2.trains && !!document.querySelector('[data-hud-triggers]'), null, { timeout: 240000 });
  await p.waitForFunction(() => !!window.__fi2.renderer && !document.querySelector('[data-island-return-loading]'), null, { timeout: 240000 });
  await p.waitForTimeout(3000);
  return { ctx, p, errs };
}
const setLap = (p, k, T) => p.evaluate(({ k, T }) => { const s = window.__fi2.trains.sched, P = s.trainPhase(k, s.clock()); window.__skew += (((T - P) % 360) + 360) % 360 * 1000; }, { k, T });
async function ride(p) {
  const si = 0;
  const T = await p.evaluate((si) => window.__fi2.trains.sched.stops.find((x) => x.station.id === ['north', 'west', 'south', 'summit', 'cay'][si]).arrive + 3.5, si);
  await setLap(p, 0, T); await p.waitForTimeout(500);
  await p.evaluate((si) => { const sp = window.__fi2.trainRide.stationSpot(si, 0); window.__fi2.teleport(sp.x, sp.z, sp.yaw + Math.PI); }, si);
  await p.waitForTimeout(1500);
  await p.evaluate(() => { document.querySelector('[data-train-board]')?.click(); if (!window.__fi2.trainRide.active) window.__fi2.trainRide.board(); });
  await p.waitForTimeout(1500);
  return p.evaluate(() => window.__fi2.trainRide.train);
}
async function shoot(c, tag) {
  const { p } = c;
  const k = await ride(p);
  log(`${tag}: riding train ${k}`);
  if (k < 0) return;
  // wait for departure, then bring it to braking into the next stop (~3 s before the doors open): the pill
  for (let i = 0; i < 40; i++) { if (await p.evaluate((k) => window.__fi2.trains.states[k].at, k) < 0) break; await p.waitForTimeout(500); }
  await p.waitForTimeout(1500);
  const hud = await p.evaluate(() => ({ fuel: !!document.querySelector('[data-fuel]')?.checkVisibility(), settings: !!document.querySelector('nav[data-hud-triggers] button[aria-label=Settings]')?.checkVisibility(),
    paths: getComputedStyle(document.querySelector('nav[data-hud-triggers]>button[data-tour=quests]')).visibility, cam: !!document.querySelector('[data-train-cam]')?.checkVisibility(), pill: !!document.querySelector('[data-train-exit]') }));
  log(`${tag}: riding HUD ${JSON.stringify(hud)}`);
  const next = await p.evaluate((k) => window.__fi2.trains.states[k].next, k);
  const arr = await p.evaluate(({ k, next }) => window.__fi2.trains.sched.stops[next].arrive, { k, next });
  await setLap(p, k, arr - 2.2);
  // (a rider holds the doors up to 3 s at each stop, so the train may run a few seconds behind the timetable: wait for the pill)
  await p.waitForFunction(() => !!document.querySelector('[data-train-exit]'), null, { timeout: 15000 }).catch(() => {});
  const pill = await p.evaluate((k) => { const e = document.querySelector('[data-train-exit]'), st = window.__fi2.trains.states[k]; return `${e ? e.textContent : ''}" at ${st.at} doors ${st.doors.toFixed(2)} v ${st.v.toFixed(1)}`; }, k);
  log(`${tag}: braking in: pill "${pill}"`);
  await p.screenshot({ path: path.join(shots, `${tag}-exit-pill.png`) });
  // Inside view
  await p.evaluate(() => window.__fi2.trainRide.setView('inside')); await p.waitForTimeout(2200);
  const ins = await p.evaluate(() => { const r = window.__fi2.trainRide, c = window.__fi2.camera, d = c.getWorldDirection(new c.position.constructor()); return { view: r.view, standing: r.standing, pitch: +(Math.asin(-d.y) * 57.3).toFixed(1) }; });
  log(`${tag}: inside ${JSON.stringify(ins)}`);
  // walk a little along the aisle (the stick), then shoot
  await p.keyboard.down('ArrowRight'); await p.waitForTimeout(700); await p.keyboard.up('ArrowRight'); await p.waitForTimeout(900);
  await p.screenshot({ path: path.join(shots, `${tag}-inside.png`) });
  // one outside view (the left side shot)
  await p.evaluate(() => window.__fi2.trainRide.setView('left')); await p.waitForTimeout(2200);
  await p.screenshot({ path: path.join(shots, `${tag}-left.png`) });
  log(`${tag}: page errors ${c.errs.length ? c.errs.join(' | ') : 'none'}`);
}
(async () => {
  const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--mute-audio', '--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
  try {
    if (only.includes('desktop')) { const c = await boot(b, { width: 1440, height: 900 }, false); await shoot(c, 'desktop'); await c.ctx.close(); }
    if (only.includes('phone')) { const c = await boot(b, { width: 390, height: 844 }, true); await shoot(c, 'phone'); await c.ctx.close(); }
    if (only.includes('arcade')) { const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }); await ctx.addInitScript(() => { try { localStorage.setItem('fi2-welcome-v1', 'completed'); } catch {} });
      const p = await ctx.newPage(); await p.goto(url + '/arcade', { timeout: 240000 }); await p.waitForTimeout(12000); await p.screenshot({ path: path.join(shots, 'arcade-room-desktop.png') }); await ctx.close(); }
  } finally { await b.close(); }
})().catch((e) => { console.error(e); process.exit(1); });
