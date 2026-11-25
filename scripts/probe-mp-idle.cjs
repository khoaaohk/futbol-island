// AAA 3 (Nov 25 2026), live audit #5: two players land on the same station pin and stand still; do they keep drawing each other?
// Needs: relay  MP_PORT=8813 MP_DEV=1 MP_WORLD_OPEN=1 node multiplayer/dev-relay/server.mjs
//        app    NEXT_DIST_DIR=.next-aaa3 NEXT_PUBLIC_MULTIPLAYER=1 NEXT_PUBLIC_PUBLIC_WORLD=1 NEXT_PUBLIC_MULTIPLAYER_URL=http://127.0.0.1:8813 npx next dev -p 9192
// Run: node scripts/probe-mp-idle.cjs --port=9192 [--secs=75] [--station=summit] [--apart=0] [--ride=jetpack]   (one headless Chrome, --mute-audio)
const { chromium } = require('playwright');
const arg = (k, d) => { const a = process.argv.find((s) => s.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const port = arg('port'); if (!port || port === '8092') { console.error('give --port=<n>'); process.exit(2); }
const url = `http://localhost:${port}`, secs = +arg('secs', '75'), station = arg('station', 'summit'), apart = +arg('apart', '0'), ride = arg('ride', '');
const STATION_INDEX = { north: 0, west: 1, south: 2, summit: 3, cay: 4 };
async function boot(b, seed) {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  await ctx.addInitScript((seed) => { try { localStorage.setItem('fi2-welcome-v1', 'completed'); localStorage.setItem('fi2-public-hint-v1', 'card hint'); localStorage.setItem('fi2-holdout-v1', seed); } catch { /* */ } }, seed);
  await ctx.route('**/api/build-id', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  const p = await ctx.newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message.slice(0, 160)));
  await p.goto(url + '/play', { timeout: 240000, waitUntil: 'domcontentloaded' });
  for (let i = 0; i < 60 && !(await p.evaluate(() => !!window.__fi2?.trains && !!document.querySelector('[data-hud-triggers]')).catch(() => false)); i++) {
    for (const t of ['Start', 'Play', 'Continue', 'Done', 'Skip']) if (await p.click(`button:visible:has-text("${t}")`, { timeout: 250 }).then(() => true).catch(() => false)) break; await p.waitForTimeout(1500); }
  await p.keyboard.press('Shift'); await p.mouse.move(645, 405); await p.waitForTimeout(2500);
  return { ctx, p, errs };
}
(async () => {
  const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--mute-audio', '--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
  try {
    const A = await boot(b, '0'.repeat(32)), B = await boot(b, '1'.repeat(32));
    for (const [c, du] of [[A, 0], [B, apart]]) await c.p.evaluate(({ si, du }) => { const sp = window.__fi2.trainRide.stationSpot(si, -2 + du); window.__fi2.teleport(sp.x, sp.z, sp.yaw + Math.PI); }, { si: STATION_INDEX[station], du });
    if (ride) for (const c of [A, B]) { await c.p.evaluate((r) => window.__fi2.selectRide(r), ride); await c.p.keyboard.down('Space'); await c.p.waitForTimeout(1200); await c.p.keyboard.up('Space'); }
    const st = (p) => p.evaluate(() => { const f = window.__fi2, P = f.player.root.position; return { me: [+P.x.toFixed(1), +P.y.toFixed(1), +P.z.toFixed(1)], mode: f.rideRef?.current, shown: f.party?.shown, d: f.party?.debugDraw?.(), spots: (f.party?.tapSpots?.()?.spots || []).map((s) => +s.d?.toFixed?.(1)), hidden: document.hidden, loop: f.loopAwake ?? null }; });
    const t0 = Date.now(); let lostAt = -1, both = false;
    while ((Date.now() - t0) / 1000 < secs) { const a = await st(A.p), bb = await st(B.p); const t = ((Date.now() - t0) / 1000).toFixed(0);
      console.log(`t ${t}s A ${JSON.stringify(a)} | B ${JSON.stringify(bb)}`); if (a.shown > 0 && bb.shown > 0) both = true; else if (both && lostAt < 0) lostAt = +t; await A.p.waitForTimeout(5000); }
    console.log(!both ? 'RESULT never drew each other' : lostAt < 0 ? `RESULT ok: both kept drawing each other for ${secs} s standing still` : `RESULT LOST at ~${lostAt} s`);
    for (const [n, c] of [['A', A], ['B', B]]) if (c.errs.length) console.log(`${n} page errors: ${c.errs.slice(0, 3).join(' | ')}`);
    await A.ctx.close(); await B.ctx.close();
  } finally { await b.close(); }
})();
