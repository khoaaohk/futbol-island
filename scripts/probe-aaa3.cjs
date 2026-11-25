// AAA 3 (Nov 25 2026): the live-audit fixes as a player would meet them, on ONE headless Chrome (--mute-audio, closed at the end).
//   arrive  (desktop) a station pin on the map lands you on foot, out of the drink machine's "Go" reach; the OLD spot (u +6) did show
//           "Go", and pressing it zooms onto the machine and opens its face (the island pauses: that was the live audit's "freeze")
//   map     (phone) the travel map's off-screen station chips: every station either on screen or on a chip; a chip pans to its pin
//   seat    (phone) Seat view standing at Summit Isle and at every stop: the camera never inside / behind a station board
// Needs: app  NEXT_DIST_DIR=.next-aaa3 npx next dev -p 9192    Run: node scripts/probe-aaa3.cjs --port=9192 [--parts=arrive,map,seat] [--shots=<dir>]
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const arg = (k, d) => { const a = process.argv.find((s) => s.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const port = arg('port'); if (!port || port === '8092') { console.error('give --port=<n>'); process.exit(2); }
const url = `http://localhost:${port}`, parts = arg('parts', 'arrive,map,seat').split(','), shots = arg('shots', '');
if (shots) fs.mkdirSync(shots, { recursive: true });
const res = []; const check = (n, ok, x = '') => { res.push(!!ok); console.log(`${ok ? 'ok  ' : 'FAIL'} ${n}${x ? ' (' + x + ')' : ''}`); };
const shot = (p, n) => shots ? p.screenshot({ path: path.join(shots, n + '.png') }).catch(() => {}) : null;
async function boot(b, phone) {
  const vp = phone ? { width: 390, height: 844 } : { width: 1440, height: 900 };
  const ctx = await b.newContext({ viewport: vp, isMobile: phone, hasTouch: phone, deviceScaleFactor: 1 });
  await ctx.addInitScript(() => { try { localStorage.setItem('fi2-welcome-v1', 'completed'); localStorage.setItem('fi2-public-hint-v1', 'card hint'); } catch { /* */ } const n = Date.now.bind(Date); window.__skew = 0; Date.now = () => n() + window.__skew; });
  await ctx.route('**/api/build-id', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  const p = await ctx.newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message.slice(0, 160)));
  await p.goto(url + '/play?from=arcade', { timeout: 240000 });
  await p.waitForFunction(() => !!window.__fi2?.trains && !!window.__fi2.renderer && !!document.querySelector('[data-hud-triggers]') && !document.querySelector('[data-island-return-loading]'), null, { timeout: 240000 });
  await p.waitForTimeout(3000); return { ctx, p, errs, vp };
}
const MAP = '[class*="IslandTravelMap_dialog"]';
const mapOpen = (p) => p.evaluate((M) => { const e = document.querySelector(M); return !!e && e.getBoundingClientRect().width > 100; }, MAP);
async function openMap(p) { if (!(await mapOpen(p))) { await p.keyboard.press('m'); await p.waitForTimeout(1500); } if (!(await mapOpen(p))) { await p.click('button[aria-label="View map"]').catch(() => {}); await p.waitForTimeout(1500); } return mapOpen(p); }
const goPrompt = (p) => p.evaluate(() => { const e = document.querySelector('[data-vending]'); return !!e && !e.hidden && e.getBoundingClientRect().width > 0 && getComputedStyle(e).visibility !== 'hidden'; });
const setLap = (p, k, T) => p.evaluate(({ k, T }) => { const s = window.__fi2.trains.sched, P = s.trainPhase(k, s.clock()); window.__skew += (((T - P) % 360) + 360) % 360 * 1000; }, { k, T });
const stopAt = (p, id) => p.evaluate((id) => { const s = window.__fi2.trains.sched; return s.stops.find((x) => x.station.id === id).arrive; }, id);

async function partArrive(b) {
  const { ctx, p, errs } = await boot(b, false);
  try {
    // old spot: u +6 at Summit Isle
    await p.evaluate(() => { const sp = window.__fi2.trainRide.stationSpot(3, 6); window.__fi2.teleport(sp.x, sp.z, sp.yaw + Math.PI); }); await p.waitForTimeout(1500);
    const oldGo = await goPrompt(p); check('old arrival spot (u +6, Summit Isle) is inside the drink machine\'s "Go" reach', oldGo);
    if (oldGo) { const n0 = await p.evaluate(() => window.__fi2.trainRide.lastWant.n); await p.click('[data-vending]').catch(() => {}); await p.waitForTimeout(3000);
      const st = await p.evaluate(() => ({ zoom: window.__fi2.vending?.focused ?? null, dlg: [...document.querySelectorAll('dialog[open],[role=dialog]')].length, n: window.__fi2.trainRide.lastWant.n }));
      await shot(p, 'arrive-old-go-pressed');
      check('pressing "Go" there zooms onto the machine and opens it (the island pauses: the live audit\'s "freeze")', st.zoom !== null, JSON.stringify({ ...st, n0 }));
      await p.keyboard.press('Escape'); await p.waitForTimeout(2500); }
    // the real pin flow: map, Summit Isle pin
    await p.evaluate(() => { const sp = window.__fi2.trainRide.stationSpot(2, 0); window.__fi2.teleport(sp.x, sp.z, sp.yaw); }); await p.waitForTimeout(1200);
    await p.evaluate(() => window.__fi2.selectRide('jetpack')); await p.waitForTimeout(800);
    if (!(await openMap(p))) { check('map opens', false); return; }
    const pin = `${MAP} [data-train-station="summit"][role="button"]`; const bb = await (await p.$(pin))?.boundingBox();
    if (bb) await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); else await p.evaluate((pin) => document.querySelector(pin)?.dispatchEvent(new MouseEvent('click', { bubbles: true })), pin);
    await p.waitForTimeout(3500);
    const a = await p.evaluate(() => { const f = window.__fi2, P = f.player.root.position, sp = f.trainRide.stationSpot(3, -2); return { mode: f.rideRef.current, d: Math.hypot(P.x - sp.x, P.z - sp.z), y: P.y, py: sp.y, n: f.trainRide.lastWant.n, zoom: f.vending?.focused ?? null }; });
    const go = await goPrompt(p); await p.waitForTimeout(2000); const n2 = await p.evaluate(() => window.__fi2.trainRide.lastWant.n);
    await shot(p, 'arrive-summit-desktop');
    check('Summit Isle pin: lands on foot at the new spot (u -2)', a.mode === 'walk' && a.d < 2.5 && Math.abs(a.y - a.py) < 1.2, `mode ${a.mode}, ${a.d.toFixed(1)} m off, y ${a.y.toFixed(2)} / ${a.py.toFixed(2)}`);
    check('no "Go" prompt at the arrival spot, no zoom, the island keeps running', !go && a.zoom === null && n2 > a.n, `go ${go}, zoom ${a.zoom}, frames ${a.n} -> ${n2}`);
    if (errs.length) check('no page errors', false, errs.slice(0, 2).join(' | '));
  } finally { await ctx.close(); }
}
async function partMap(b) {
  const { ctx, p, errs, vp } = await boot(b, true);
  try {
    for (const [si, label] of [[2, 'south'], [0, 'north']]) {
      await p.evaluate((si) => { const sp = window.__fi2.trainRide.stationSpot(si, 0); window.__fi2.teleport(sp.x, sp.z, sp.yaw); }, si); await p.waitForTimeout(1200);
      if (!(await openMap(p))) { check('map opens', false); continue; }
      await p.waitForTimeout(600);
      const st = await p.evaluate((M) => { const d = document.querySelector(M), fr = d.querySelector('[class*=IslandTravelMap_map]').getBoundingClientRect(), out = {};
        for (const e of d.querySelectorAll('[data-train-station][role=button]')) { const r = e.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2; out[e.getAttribute('data-train-station')] = { pin: x > fr.left && x < fr.right && y > fr.top && y < fr.bottom }; }
        for (const c of d.querySelectorAll('[data-station-chip]')) { const r = c.getBoundingClientRect(); (out[c.getAttribute('data-station-chip')] ||= {}).chip = { side: c.dataset.side, in: r.left >= fr.left - 1 && r.right <= fr.right + 1 && r.top >= fr.top - 1 && r.bottom <= fr.bottom + 1, h: Math.round(r.height), text: c.innerText.trim() }; }
        return out; }, MAP);
      const all = Object.values(st).every((s) => s.pin || (s.chip && s.chip.in));
      check(`phone map from ${label}: every station is a pin on screen or a chip on the edge`, all && Object.keys(st).length === 5, JSON.stringify(st));
      await shot(p, `map-chips-${label}-phone`);
      const first = Object.entries(st).find(([, s]) => s.chip);
      if (first) { await p.tap(`[data-station-chip="${first[0]}"]`); await p.waitForTimeout(900);
        const on = await p.evaluate(({ M, id }) => { const d = document.querySelector(M), fr = d.querySelector('[class*=IslandTravelMap_map]').getBoundingClientRect(), r = d.querySelector(`[data-train-station="${id}"][role=button]`).getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2; return x > fr.left && x < fr.right && y > fr.top && y < fr.bottom; }, { M: MAP, id: first[0] });
        check(`tapping the ${first[0]} chip brings its pin on screen`, on); }
      await p.keyboard.press('Escape'); await p.waitForTimeout(800);
    }
    if (errs.length) check('no page errors', false, errs.slice(0, 2).join(' | '));
  } finally { await ctx.close(); }
}
async function partSeat(b) {
  const { ctx, p, errs } = await boot(b, true);
  try {
    const T = await stopAt(p, 'south'); await setLap(p, 0, T + 3.5); await p.waitForTimeout(500);
    await p.evaluate(() => { const sp = window.__fi2.trainRide.stationSpot(2, 0); window.__fi2.teleport(sp.x, sp.z, sp.yaw + Math.PI); }); await p.waitForTimeout(1500);
    await p.evaluate(() => { document.querySelector('[data-train-board]')?.click(); if (!window.__fi2.trainRide.active) window.__fi2.trainRide.board(); }); await p.waitForTimeout(1500);
    const k = await p.evaluate(() => window.__fi2.trainRide.train); check('boarded', k >= 0); if (k < 0) return;
    await p.evaluate(() => window.__fi2.trainRide.setView('seat'));
    for (const id of ['summit', 'cay', 'north', 'west', 'south']) {
      const Ts = await stopAt(p, id); await setLap(p, k, Ts + 6); await p.waitForTimeout(2600);
      const c = await p.evaluate(() => { const cam = window.__fi2.camera.position, f = window.__fi2; return { x: cam.x, y: cam.y, z: cam.z, at: f.trains.states[f.trainRide.train].at }; });
      const bad = await p.evaluate(({ x, y, z }) => window.__fi2.camBlockedProbe ? window.__fi2.camBlockedProbe(x, y, z) : null, c);
      // the boards' world spots (same maths as the unit test) and the camera's distance to their panels
      const dB = await p.evaluate(({ id, c }) => { const L = ['north', 'west', 'south', 'summit', 'cay'], si = L.indexOf(id), r = window.__fi2.trainRide; const a = r.stationSpot(si, 9.5), b2 = r.stationSpot(si, -12.5); return Math.min(Math.hypot(a.x - c.x, a.z - c.z), Math.hypot(b2.x - c.x, b2.z - c.z)); }, { id, c });
      await shot(p, `seat-${id}-phone`);
      check(`Seat view standing at ${id}: camera not at a board`, c.at >= 0 && bad !== true, `stop ${c.at}, ${dB.toFixed(1)} m from the nearest board spot (platform-frame approx)`);
    }
    if (errs.length) check('no page errors', false, errs.slice(0, 2).join(' | '));
  } finally { await ctx.close(); }
}
(async () => {
  const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--mute-audio', '--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
  try { for (const [n, f] of [['arrive', partArrive], ['map', partMap], ['seat', partSeat]]) if (parts.includes(n)) { try { await f(b); } catch (e) { check(n + ' ran', false, e.message.slice(0, 200)); } } }
  finally { await b.close(); }
  console.log(`probe-aaa3: ${res.filter(Boolean).length}/${res.length} ok`); process.exit(res.every(Boolean) ? 0 : 1);
})();
