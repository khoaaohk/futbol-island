// Island Line Phase 3 (Nov 23 2026): two headless clients (--mute-audio) on the public island. A boards a train with the real Board
// prompt and rides; B, standing at the same platform, must draw A seated in that moving seat (from the shared clock, no new messages).
// Also: Get off at the next stop, draw calls / triangles while riding (A) and with the travel map open (B), and one phone (A riding)
// + one desktop (B's travel map with the line, pins and live train dots) screenshot. Never port 8092.
// Needs:  relay  MP_PORT=8793 MP_DEV=1 MP_WORLD_OPEN=1 node multiplayer/dev-relay/server.mjs
//         app    NEXT_DIST_DIR=.next-train3 NEXT_PUBLIC_MULTIPLAYER=1 NEXT_PUBLIC_PUBLIC_WORLD=1 NEXT_PUBLIC_MULTIPLAYER_URL=http://127.0.0.1:8793 npx next dev -p 9153
// Run:    node --experimental-websocket scripts/check-train-ride.cjs --port=9153 [--shots=<dir>]
const { chromium } = require('playwright');
const path = require('path');
const arg = (k, d) => { const a = process.argv.find((s) => s.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const port = arg('port'), shots = arg('shots', '');
if (!port || port === '8092') { console.error('give --port=<n> (never 8092)'); process.exit(2); }
const url = `http://localhost:${port}`;
const results = [];
const check = (name, ok, extra = '') => { results.push({ name, ok: !!ok }); console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${extra ? ' (' + extra + ')' : ''}`); };
async function start(p) {
  for (let i = 0; i < 90 && !(await p.evaluate(() => !!window.__fi2)); i++) {
    for (const t of ['I saved it', 'Get my code', 'Play']) await p.click(`button:visible:has-text("${t}")`, { timeout: 300 }).catch(() => {});
    if (i === 0) await p.click('text=Get my save code', { timeout: 4000 }).catch(() => {});
    await p.waitForTimeout(2000);
  }
  await p.waitForFunction(() => !!window.__fi2 && !!window.__fi2.trainRide && !!document.querySelector('[data-hud-triggers]'), null, { timeout: 240000 });
  await p.waitForFunction(() => !!window.__fi2.renderer && !document.querySelector('[data-island-return-loading]'), null, { timeout: 240000 });
  await p.waitForTimeout(4000);
}
async function boot(b, vp, mobile, seed) {
  const ctx = await b.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1 });
  // under a local `next start` / dev /api/build-id answers a new id: no "new release" reload mid-check (as check-train-aaa)
  await ctx.route('**/api/build-id', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  // as check-train-phase4: a holdout seed in the "on" arm (lib/multiplayer/holdout.ts), never the 10 % Just-me holdout
  await ctx.addInitScript((seed) => { try { if (!sessionStorage.getItem('__t_boot')) { localStorage.setItem('fi2-welcome-v1', 'completed'); localStorage.setItem('fi2-public-hint-v1', 'card hint'); localStorage.setItem('fi2-holdout-v1', seed); } sessionStorage.setItem('__t_boot', '1'); } catch { /* */ } }, seed);
  const p = await ctx.newPage(), errs = [];
  p.on('pageerror', (e) => errs.push(e.message.slice(0, 200)));
  await p.goto(url + '/play?from=arcade', { timeout: 240000 }); await p.waitForTimeout(3000);
  await start(p);
  // the public world connects only after a first input (as check-train-phase4): a real key press and a pointer move
  await p.keyboard.press('Shift'); await p.mouse.move(vp.width / 2 + 5, vp.height / 2 + 5);
  await p.evaluate(() => { const f = window.__fi2, r = f.renderer, orig = r.render.bind(r), log = window.__gfx = { on: false, rows: [] };
    r.render = (scene, camera) => { orig(scene, camera); if (log.on && scene === f.scene && r.getRenderTarget() === null) log.rows.push([r.info.render.calls, r.info.render.triangles]); }; });
  return { ctx, p, errs };
}
const gfx = async (p, ms = 2500) => { await p.evaluate(() => { window.__gfx.rows.length = 0; window.__gfx.on = true; }); await p.waitForTimeout(ms);
  const rows = await p.evaluate(() => { window.__gfx.on = false; return window.__gfx.rows; }); const med = (i) => { const s = rows.map((r) => r[i]).sort((a, b) => a - b); return s[s.length >> 1] ?? 0; };
  return { calls: med(0), tris: med(1), frames: rows.length }; };
// Remotes this page draws (the public draw layers' tap spots): the distance from (x, z) to the nearest one (check-train-phase4's probe).
const nearestRemote = (p, x, z) => p.evaluate(({ x, z }) => { const h = window.__fi2PublicDraw; let best = Infinity;
  if (h) for (const layer of h.layers) { if (typeof layer.tapSpots !== 'function') continue; for (const sp of layer.tapSpots().spots) best = Math.min(best, Math.hypot(sp.x - x, sp.z - z)); } return best; }, { x, z });
// The next stop a train will stand at with its doors open, and how long until then (s).
const nextStanding = (p) => p.evaluate(() => { const t = window.__fi2.trains; const st = t.states;
  for (let i = 0; i < st.length; i++) if (st[i].at < 0) return { train: i, stop: st[i].next };// running: meet it at its next stop
  return null; });
const STOP_STATION = ['west', 'south', 'summit', 'cay', 'north'], STATION_INDEX = { north: 0, west: 1, south: 2, summit: 3, cay: 4 };
(async () => {
  const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--mute-audio', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  try {
    const A = await boot(b, { width: 390, height: 844 }, true, '0'.repeat(32)), B = await boot(b, { width: 1440, height: 900 }, false, '1'.repeat(32));
    // wait for a train standing at a platform (one comes every ~24 s somewhere on the loop)
    let s = null; for (let i = 0; i < 80 && !s; i++) { s = await nextStanding(A.p); if (!s) await A.p.waitForTimeout(1000); }
    check('a train is on its way to a platform', !!s, s ? `train ${s.train} to ${STOP_STATION[s.stop]}` : '');
    if (!s) throw new Error('no train');
    const si = STATION_INDEX[STOP_STATION[s.stop]];
    const spots = {};
    for (const [k, c, du] of [['A', A, 0], ['B', B, 10]]) spots[k] = await c.p.evaluate(({ si, du }) => { const sp = window.__fi2.trainRide.stationSpot(si, du); window.__fi2.teleport(sp.x, sp.z, sp.yaw + Math.PI); return sp; }, { si, du });
    // as check-train-phase4: both in one public world first, each drawing the other on the platform (a Shift now and then keeps them active)
    for (let i = 0; i < 60; i++) { const a = await nearestRemote(A.p, spots.B.x, spots.B.z), bb = await nearestRemote(B.p, spots.A.x, spots.A.z); if (a < 2.5 && bb < 2.5) break; await A.p.waitForTimeout(1000); if (i % 10 === 9) for (const c of [A, B]) await c.p.keyboard.press('Shift'); }
    // any train standing at that stop (a train comes every 2:00; the relay clock may shift the timetable once on connect)
    for (let i = 0; i < 340; i++) { const k = await A.p.evaluate((stop) => window.__fi2.trains.states.findIndex((x) => x.at === stop && x.doors > .6 && x.dwellLeft > 4), s.stop); if (k >= 0) { s.train = k; break; } await A.p.waitForTimeout(500); }
    let shown = false; for (let i = 0; i < 24 && !shown; i++) { await A.p.waitForTimeout(250); shown = await A.p.evaluate(() => { const e = document.querySelector('[data-train-board]'); return !!e && !e.hidden; }); }
    check('A sees the Board prompt on the platform', shown);
    await A.p.evaluate(() => document.querySelector('[data-train-board]').click());// the prompt's own onClick (a real tap can miss it on a 1 fps loaded headless frame)
    if (!(await A.p.evaluate(() => window.__fi2.trainRide.active))) await A.p.evaluate(() => window.__fi2.trainRide.board());
    await A.p.waitForTimeout(800);
    const ride = await A.p.evaluate(() => ({ active: window.__fi2.trainRide.active, train: window.__fi2.trainRide.train, seat: window.__fi2.trainRide.seat, cluster: !!document.querySelector('[data-job-buttons]') }));
    check('A is riding', ride.active && ride.train === s.train, `train ${ride.train} seat ${ride.seat}`);
    if (!ride.active) console.log('diag', JSON.stringify(await A.p.evaluate(() => { const r = window.__fi2.trainRide; return { lw: r.lastWant, st: window.__fi2.trains.states.map((x) => [x.at, +x.doors.toFixed(2), +x.dwellLeft.toFixed(1)]), board: r.board(), note: document.querySelector('[data-train-note]')?.textContent }; })));
    // B: is A drawn seated in that seat? (B's runtime got the seat code: that train draws its open variant, and a remote stands on the seat)
    const seen = async () => B.p.evaluate(({ k, j }) => { const t = window.__fi2.trains, seat = { x: 0, y: 0, z: 0, yaw: 0 }; t.seatPose(k, j, seat);
      const h = window.__fi2PublicDraw; let best = Infinity; if (h) for (const layer of h.layers) { if (typeof layer.tapSpots !== 'function') continue; for (const sp of layer.tapSpots().spots) best = Math.min(best, Math.hypot(sp.x - seat.x, sp.z - seat.z)); }
      return { ridden: t.ridden[k], best, x: seat.x, z: seat.z }; }, { k: ride.train, j: ride.seat });
    let v = null; for (let i = 0; i < 20; i++) { v = await seen(); if (v.ridden && v.best < 1) break; await B.p.waitForTimeout(500); }
    check('B draws A in the seat (standing train)', v && v.ridden === 1 && v.best < 1, v ? `ridden ${v.ridden}, ${v.best.toFixed(2)} m from the seat` : '');
    // ride on: wait for the departure, then B (teleported along to keep the train in view) still draws A in the MOVING seat
    for (let i = 0; i < 40; i++) { const at = await A.p.evaluate((k) => window.__fi2.trains.states[k].at, ride.train); if (at < 0) break; await A.p.waitForTimeout(500); }
    await A.p.waitForTimeout(6000);
    const note = await A.p.evaluate(() => document.querySelector('[data-train-note]')?.textContent || '');
    check('A hears the next-stop announcement', /^Next stop: .+ Did you know\?/.test(note), note.slice(0, 70));
    if (!/^Next stop/.test(note)) console.log('diag A', JSON.stringify(await A.p.evaluate((k) => { const r = window.__fi2.trainRide, st = window.__fi2.trains.states[k]; return { walking: r.walking, exiting: r.exiting, standing: r.standing, view: r.view, seat: r.seat, at: st.at, next: st.next, v: +st.v.toFixed(1), hidden: document.hidden, fps: window.__fi2.renderer?.info?.render?.frame }; }, ride.train)));
    const v1 = await seen(); await B.p.waitForTimeout(3000); const v2 = await seen();// 3 s: on a loaded 1-5 fps headless frame the train may still be pulling out (0.8 m/s²)
    check('B draws A in the moving seat', v2.ridden === 1 && v2.best < 1.2 && Math.hypot(v2.x - v1.x, v2.z - v1.z) > 2, `${v2.best.toFixed(2)} m from the seat, the seat moved ${Math.hypot(v2.x - v1.x, v2.z - v1.z).toFixed(1)} m`);
    const g1 = await gfx(A.p); console.log(`riding (A, phone 390x844): ${g1.calls} draw calls, ${g1.tris} triangles (${g1.frames} frames)`);
    // owner Nov 25 2026: the between-stops quiz is off (trainRide.ts TRAIN_QUIZ): no card on the run
    await A.p.waitForTimeout(8000); const quiz = false;
    check('no quiz card while riding', !(await A.p.locator('[data-train-quiz]').count()));
    if (shots) { require('fs').mkdirSync(shots, { recursive: true }); await A.p.screenshot({ path: path.join(shots, 'train-ride-phone.png') }); }
    // B: the travel map with the line, the pins and the live dots
    await B.p.evaluate(() => window.__fi2.teleport(170, -150, 0)); await B.p.waitForTimeout(1500);
    await B.p.click('[data-tour="map"], button[aria-label*="map" i]', { timeout: 5000 }).catch(() => {});
    await B.p.waitForTimeout(1500);
    if (!(await B.p.locator('[data-train-dot]').count())) { await B.p.keyboard.press('m'); await B.p.waitForTimeout(1500); }// the button can sit under a toast on a slow frame: the M key opens the same map
    const map = await B.p.evaluate(() => ({ line: !!document.querySelector('[data-train-line]'), pins: document.querySelectorAll('[data-train-station]').length, dots: [...document.querySelectorAll('[data-train-dot]')].map((d) => d.getAttribute('transform')) }));
    await B.p.waitForTimeout(1200); const dots2 = await B.p.evaluate(() => [...document.querySelectorAll('[data-train-dot]')].map((d) => d.getAttribute('transform')));
    check('map: line, 5 station pins, 3 live dots that move', map.line && map.pins >= 5 && map.dots.length === 3 && dots2.some((d, i) => d !== map.dots[i]), `pins ${map.pins}, dots ${map.dots.length}`);
    const g2 = await gfx(B.p); console.log(`travel map open (B, desktop 1440x900): ${g2.calls} draw calls, ${g2.tris} triangles (${g2.frames} frames)`);
    if (shots) await B.p.screenshot({ path: path.join(shots, 'train-map-desktop.png') });
    // A: Get off at the next stop
    let off = false; for (let i = 0; i < 160 && !off; i++) { off = await A.p.evaluate(() => { const r = window.__fi2.trainRide; return r.active && !!document.querySelector('[data-job-buttons]') && window.__fi2.trains.states[r.train].at >= 0 && window.__fi2.trains.states[r.train].doors > .6; }); if (!off) await A.p.waitForTimeout(500); }
    // (Get off is a short step-out walk to the nearest open door, Nov 24 2026: under 1 s)
    await A.p.waitForTimeout(600); await A.p.keyboard.press('e'); for (let i = 0; i < 12 && (await A.p.evaluate(() => window.__fi2.trainRide.active)); i++) await A.p.waitForTimeout(250);
    check('A gets off at the next stop', await A.p.evaluate(() => !window.__fi2.trainRide.active));
    if (await A.p.evaluate(() => window.__fi2.trainRide.active)) console.log('diag off', JSON.stringify(await A.p.evaluate(() => { const r = window.__fi2.trainRide, st = window.__fi2.trains.states[r.train]; return { off: true, walking: r.walking, exiting: r.exiting, queued: r.exitQueued, at: st.at, doors: +st.doors.toFixed(2), left: +st.dwellLeft.toFixed(1), note: document.querySelector('[data-train-note]')?.textContent?.slice(0, 50), pill: document.querySelector('[data-train-exit]')?.textContent, focus: document.activeElement?.tagName + ':' + (document.activeElement?.getAttribute('aria-label') || '') }; })), 'offLoop', off);
    check('no page errors', !A.errs.length && !B.errs.length, [...A.errs, ...B.errs].slice(0, 3).join(' | '));
  } catch (e) { check('ran to the end', false, e.message.slice(0, 200)); }
  finally { await b.close(); }
  const bad = results.filter((r) => !r.ok).length; console.log(bad ? `${bad} FAILED` : 'all ok'); process.exit(bad ? 1 : 0);
})();
