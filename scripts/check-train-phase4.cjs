// Island Line Phase 4 (Nov 23 2026): the REAL two-client check. Two headless clients (--mute-audio) join the same public world
// (each its own holdout-free device seed and a real first input: publicWorld.ts only connects after one), stand on the same
// platform, see each other, BOTH board the same train and must each draw the other seated in the moving train, with the train
// at the same place on both screens (within 1 s). Also: the station islanders and drink machine on the platform (draws with
// them), the between-stops quiz card, the quiz card on a landscape phone, Get off. One phone (A riding, quiz) + one desktop (B on
// the platform at night: lanterns, panes, board, machine, islanders) screenshot. Never port 8092.
// Needs:  relay  MP_PORT=8797 MP_DEV=1 MP_WORLD_OPEN=1 node multiplayer/dev-relay/server.mjs
//         app    NEXT_DIST_DIR=.next-train4 NEXT_PUBLIC_MULTIPLAYER=1 NEXT_PUBLIC_PUBLIC_WORLD=1 NEXT_PUBLIC_MULTIPLAYER_URL=http://127.0.0.1:8797 npx next dev -p 9157
// Run:    node scripts/check-train-phase4.cjs --port=9157 [--shots=<dir>]
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
  await p.waitForTimeout(3000);
}
async function boot(b, vp, mobile, seed, time) {
  const ctx = await b.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1 });
  await ctx.addInitScript(({ seed, time }) => { try { if (!sessionStorage.getItem('__t_boot')) { localStorage.setItem('fi2-welcome-v1', 'completed'); localStorage.setItem('fi2-public-hint-v1', 'card hint');
    localStorage.setItem('fi2-holdout-v1', seed);/* a seed in the "on" arm (lib/multiplayer/holdout.ts): never the 10 % Just-me holdout */ if (time) localStorage.setItem('fi2-time-of-day', time); } sessionStorage.setItem('__t_boot', '1'); } catch { /* */ } }, { seed, time });
  const p = await ctx.newPage(), errs = [];
  p.on('pageerror', (e) => errs.push(e.message.slice(0, 200)));
  await p.goto(url + '/play?from=arcade', { timeout: 240000 }); await p.waitForTimeout(3000);
  await start(p);
  // the public world connects only after a first input (+3 s and an idle callback): a real key press, then a short wait
  await p.keyboard.press('Shift'); await p.mouse.move(vp.width / 2 + 5, vp.height / 2 + 5);
  await p.evaluate(() => { const f = window.__fi2, r = f.renderer, orig = r.render.bind(r), log = window.__gfx = { on: false, rows: [] };
    r.render = (scene, camera) => { orig(scene, camera); if (log.on && scene === f.scene && r.getRenderTarget() === null) log.rows.push([r.info.render.calls, r.info.render.triangles]); }; });
  return { ctx, p, errs, vp };
}
const gfx = async (p, ms = 2500) => { await p.evaluate(() => { window.__gfx.rows.length = 0; window.__gfx.on = true; }); await p.waitForTimeout(ms);
  const rows = await p.evaluate(() => { window.__gfx.on = false; return window.__gfx.rows; }); const med = (i) => { const s = rows.map((r) => r[i]).sort((a, b) => a - b); return s[s.length >> 1] ?? 0; };
  return { calls: med(0), tris: med(1), frames: rows.length }; };
// Remotes this page draws (the public draw layers' tap spots) and the nearest one to (x, z).
const nearestRemote = (p, x, z) => p.evaluate(({ x, z }) => { const h = window.__fi2PublicDraw; let best = Infinity, n = 0;
  if (h) for (const layer of h.layers) { if (typeof layer.tapSpots !== 'function') continue; for (const sp of layer.tapSpots().spots) { n++; best = Math.min(best, Math.hypot(sp.x - x, sp.z - z)); } }
  return { best, n }; }, { x, z });
const me = (p) => p.evaluate(() => { const r = window.__fi2.trainRide; const pos = window.__fi2.playerPosition?.() ?? null; return { riding: r.active, train: r.train, seat: r.seat, pos }; });
const STOP_STATION = ['west', 'south', 'summit', 'cay', 'north'], STATION_INDEX = { north: 0, west: 1, south: 2, summit: 3, cay: 4 };
(async () => {
  const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--mute-audio', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  try {
    const A = await boot(b, { width: 390, height: 844 }, true, '0'.repeat(32), '');
    const B = await boot(b, { width: 1440, height: 900 }, false, '1'.repeat(32), 'night');
    // the next stop a running train will reach: both go and wait on that platform
    let s = null; for (let i = 0; i < 60 && !s; i++) { s = await A.p.evaluate(() => { const st = window.__fi2.trains.states; for (let i = 0; i < st.length; i++) if (st[i].at < 0) return { train: i, stop: st[i].next }; return null; }); if (!s) await A.p.waitForTimeout(1000); }
    if (!s) throw new Error('no train');
    const si = STATION_INDEX[STOP_STATION[s.stop]];
    const spots = {};
    for (const [k, c, du] of [['A', A, 2], ['B', B, -2]]) spots[k] = await c.p.evaluate(({ si, du }) => { const sp = window.__fi2.trainRide.stationSpot(si, du); window.__fi2.teleport(sp.x, sp.z, sp.yaw + Math.PI); return sp; }, { si, du });
    for (const c of [A, B]) { await c.p.keyboard.press('Shift'); }
    // both in the same world: each draws the other on the platform (the relay counts 2 joins)
    let seenA = null, seenB = null;
    for (let i = 0; i < 60; i++) { seenB = await nearestRemote(B.p, spots.A.x, spots.A.z); seenA = await nearestRemote(A.p, spots.B.x, spots.B.z); if (seenA.best < 2.5 && seenB.best < 2.5) break; await A.p.waitForTimeout(1000); if (i % 10 === 9) for (const c of [A, B]) await c.p.keyboard.press('Shift'); }
    const metrics = await fetch('http://127.0.0.1:8797/dev/metrics').then((r) => r.json()).catch(() => null);
    check('both clients in one public world and drawing each other on the platform', seenA.best < 2.5 && seenB.best < 2.5, `A sees B ${seenA.best.toFixed(2)} m (${seenA.n} remotes), B sees A ${seenB.best.toFixed(2)} m (${seenB.n}); relay ${JSON.stringify(metrics?.worlds ?? metrics)?.slice(0, 120)}`);
    // station islanders and the drink machine on this platform; draw calls on the phone with them in view
    const sta = await A.p.evaluate((id) => { const f = window.__fi2, npcs = f.islandNpcs?.entries ?? []; const here = npcs.filter((e) => e.id.startsWith('stn-') && e.definition.station === id);
      const vend = f.scene.getObjectByName('vending-drinkst' + id); return { npcs: here.map((e) => ({ id: e.id, shown: e.rig.root.visible })), vending: !!vend, vendShadow: vend?.castShadow }; }, STOP_STATION[s.stop]);
    check('two station islanders drawn on the platform', sta.npcs.length === 2 && sta.npcs.every((n) => n.shown), JSON.stringify(sta.npcs));
    check('the station drink machine stands there (no shadow caster)', sta.vending && sta.vendShadow === false);
    const g0 = await gfx(A.p); console.log(`station view (A, phone 390x844, ${STOP_STATION[s.stop]}, islanders + machine + B): ${g0.calls} draw calls, ${g0.tris} triangles (${g0.frames} frames)`);
    // a train standing at the stop with its doors open
    let k = -1; for (let i = 0; i < 340 && k < 0; i++) { k = await A.p.evaluate((stop) => window.__fi2.trains.states.findIndex((x) => x.at === stop && x.doors > .6 && x.dwellLeft > 5), s.stop); if (k < 0) await A.p.waitForTimeout(500); }
    check('a train stands at the platform', k >= 0, `train ${k}`);
    const turned = await A.p.evaluate(() => (window.__fi2.islandNpcs?.entries ?? []).filter((e) => e.id.startsWith('stn-')).map((e) => e.id + ':' + (window.__fi2.islandNpcs.isAway(e.id) ? 'away' : 'here')).join(' '));
    if (shots) { require('fs').mkdirSync(shots, { recursive: true }); await B.p.screenshot({ path: path.join(shots, 'phase4-station-night-desktop.png') }); }
    // both board the same train
    for (const c of [A, B]) { await c.p.evaluate(() => { const e = document.querySelector('[data-train-board]'); if (e && !e.hidden) e.click(); }); await c.p.waitForTimeout(400); if (!(await c.p.evaluate(() => window.__fi2.trainRide.active))) await c.p.evaluate(() => window.__fi2.trainRide.board()); await c.p.waitForTimeout(900); }
    const ra = await me(A.p), rb = await me(B.p);
    check('both ride the same train in different seats', ra.riding && rb.riding && ra.train === k && rb.train === k && ra.seat !== rb.seat, `A train ${ra.train} seat ${ra.seat}, B train ${rb.train} seat ${rb.seat}`);
    const seatOf = (p, kk, j) => p.evaluate(({ kk, j }) => { const o = { x: 0, y: 0, z: 0, yaw: 0 }; window.__fi2.trains.seatPose(kk, j, o); return o; }, { kk, j });
    const mutual = async () => { const sa = await seatOf(B.p, k, ra.seat), sb = await seatOf(A.p, k, rb.seat); const bSeesA = await nearestRemote(B.p, sa.x, sa.z), aSeesB = await nearestRemote(A.p, sb.x, sb.z); return { bSeesA: bSeesA.best, aSeesB: aSeesB.best, sa }; };
    let m0 = null; for (let i = 0; i < 20; i++) { m0 = await mutual(); if (m0.bSeesA < 1 && m0.aSeesB < 1) break; await A.p.waitForTimeout(500); }
    check('each draws the other in their seat (standing train)', m0.bSeesA < 1 && m0.aSeesB < 1, `B sees A ${m0.bSeesA.toFixed(2)} m, A sees B ${m0.aSeesB.toFixed(2)} m from the seat`);
    for (let i = 0; i < 40; i++) { const at = await A.p.evaluate((kk) => window.__fi2.trains.states[kk].at, k); if (at < 0) break; await A.p.waitForTimeout(500); }
    await A.p.waitForTimeout(5000);
    const m1 = await mutual(); await A.p.waitForTimeout(1500); const m2 = await mutual();
    check('each draws the other in the MOVING seat', m2.bSeesA < 1.2 && m2.aSeesB < 1.2 && Math.hypot(m2.sa.x - m1.sa.x, m2.sa.z - m1.sa.z) > 5, `B sees A ${m2.bSeesA.toFixed(2)} m, A sees B ${m2.aSeesB.toFixed(2)} m; seat moved ${Math.hypot(m2.sa.x - m1.sa.x, m2.sa.z - m1.sa.z).toFixed(1)} m`);
    // timing: the train's place on both screens at the same moment (3 samples), as seconds of running
    const dts = [];
    for (let i = 0; i < 3; i++) { const [a, bb] = await Promise.all([A.p, B.p].map((p) => p.evaluate((kk) => { const t = window.__fi2.trains; return { s: t.states[kk].s, v: t.states[kk].v, now: t.drawn.now, wall: Date.now() }; }, k)));
      // each page's last frame: (shared clock, s, speed); carried to the same clock moment, the gap in s over the speed is the time gap
      const T = Math.max(a.now, bb.now), sa = a.s + a.v * (T - a.now), sb = bb.s + bb.v * (T - bb.now), L = 2540, ds = ((sa - sb) % L + L * 1.5) % L - L / 2, v = Math.max(1, (a.v + bb.v) / 2);
      dts.push(Math.abs(ds / v)); await A.p.waitForTimeout(700); }
    const worst = Math.max(...dts);
    check('the train is at the same place on both screens (within 1 s)', worst < 1, dts.map((d) => d.toFixed(2) + ' s').join(', '));
    const note = await A.p.evaluate(() => document.querySelector('[data-train-note]')?.textContent || '');
    check('A hears the next-stop announcement', /^Next stop: .+ Did you know\?/.test(note), note.slice(0, 70));
    const quiz = await A.p.waitForSelector('[data-train-quiz]', { timeout: 30000 }).then(() => true).catch(() => false);
    check('the between-stops quiz card shows', quiz);
    const g1 = await gfx(A.p); console.log(`riding with a friend (A, phone): ${g1.calls} draw calls, ${g1.tris} triangles (${g1.frames} frames)`);
    if (shots) await A.p.screenshot({ path: path.join(shots, 'phase4-ride-quiz-phone.png') });
    if (quiz) { await A.p.setViewportSize({ width: 844, height: 390 }); await A.p.waitForTimeout(900);
      const box = await A.p.evaluate(() => { const r = document.querySelector('[data-train-quiz]')?.getBoundingClientRect(); return r ? { t: r.top, b: r.bottom, l: r.left, r: r.right, W: innerWidth, H: innerHeight } : null; });
      check('landscape phone: the quiz card fits the screen', box && box.t >= 0 && box.b <= box.H + 1 && box.l >= 0 && box.r <= box.W, JSON.stringify(box));
      await A.p.setViewportSize({ width: 390, height: 844 }); }
    console.log('station islanders when the train stood there: ' + turned);
    // Get off at the next stop (both)
    let off = false; for (let i = 0; i < 160 && !off; i++) { off = await A.p.evaluate(() => { const r = window.__fi2.trainRide; return r.active && window.__fi2.trains.states[r.train].at >= 0 && window.__fi2.trains.states[r.train].doors > .6; }); if (!off) await A.p.waitForTimeout(500); }
    for (const c of [A, B]) { await c.p.waitForTimeout(500); await c.p.keyboard.press('e'); }
    await A.p.waitForTimeout(900);
    check('both get off at the next stop', !(await A.p.evaluate(() => window.__fi2.trainRide.active)) && !(await B.p.evaluate(() => window.__fi2.trainRide.active)));
    check('no page errors', !A.errs.length && !B.errs.length, [...A.errs, ...B.errs].slice(0, 3).join(' | '));
  } catch (e) { check('ran to the end', false, e.message.slice(0, 300)); }
  finally { await b.close(); }
  const bad = results.filter((r) => !r.ok).length; console.log(bad ? `${bad} FAILED` : 'all ok'); process.exit(bad ? 1 : 0);
})();
