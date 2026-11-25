// Island Line AAA audit (Nov 24 2026): one reusable headless play-through of the owner's train checklist, on ONE headless Chrome
// (--mute-audio, closed at the end). The train clock is moved with a Date.now offset (window.__skew, ms) so a train can be brought to
// any crossing or platform in seconds; the timetable is absolute, so a jump is also the clock-skew / long-session check.
// Parts (--parts=a,b,...; default all):
//   xings    every level crossing: lamps on, arms DOWN before the front reaches the deck, down while the train is on it, back UP after
//   vending  each station's drink machine: the prompt shows on its platform, the machine zooms in with drinks, closes
//   ride     board at a platform, ride on (bridge crest height, announcement, tunnel), tab hidden 20 s then back (train where the
//            timetable says), fast travel while riding (gets off), board refused while jetpacking
//   framing  every outside view at 5 points round the loop (incl. the bridge and the tunnel): camera outside the cars, train on screen
//   views    ride, then every camera view: the ridden train is drawn (open car mesh), its roof cut only in Inside
//   track    standing on the rails (owner Nov 24 2026: trains never wait): Kenji warns, the train keeps its timetable, the bonk throws you clear
//   deck     the track assist onto a bridge head, off a deck into the sea (swim), a swimmer at a high deck stays in, the splash bonk
//            from a deck, the side bonk, a stopped train hit at speed on a scooter
//   roof     land on a moving train's roof with the jetpack, ride it at speed, get bonked off at the tunnel portal onto the ground
//            (+ jumping car to car, a jetpack take-off from the roof and Land back on, the landing ring on the roof spot; then
//            --roof-runs=N (default 10) more Lands over the moving roof: at least 90 % must land on it)
//   shots    after images of the owner's 14 screenshots' places (desktop) into --shots
//   perf     frame time p50/p95/max + draws standing at the busiest station and riding (GFX_NO_TRAIN A/B is gfx-budget.cjs)
// Needs: app  NEXT_DIST_DIR=.next-aaa npx next dev -p 9156     Run: node scripts/check-train-aaa.cjs --port=9156 [--shots=<dir>] [--gpu=swiftshader]
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const arg = (k, d) => { const a = process.argv.find((s) => s.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const port = arg('port'), shots = arg('shots', ''), parts = arg('parts', 'xings,vending,ride,views,framing,hud,inside,track,deck,roof,shots,perf').split(','), gpu = arg('gpu', 'metal');
const timeOfDay = arg('time', ''), phone = arg('phone', '1') === '1', landscape = arg('landscape', '') === '1', tier = arg('tier', ''), noTrain = arg('notrain', '') === '1';
if (!port || port === '8092') { console.error('give --port=<n> (never 8092)'); process.exit(2); }
const url = `http://localhost:${port}`;
const results = []; let vpW = 1440, vpH = 900;
const check = (name, ok, extra = '') => { results.push({ name, ok: !!ok }); console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${extra ? ' (' + extra + ')' : ''}`); };
if (shots) fs.mkdirSync(shots, { recursive: true });
async function boot(b, vp, mobile) {
  const ctx = await b.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1 });
  await ctx.addInitScript(({ tier, noTrain, timeOfDay }) => {
    try { if (!sessionStorage.getItem('__a_boot')) { localStorage.setItem('fi2-welcome-v1', 'completed'); localStorage.setItem('fi2-public-hint-v1', 'card hint'); if (tier) localStorage.setItem('fi2-battery-saver', tier); if (timeOfDay) localStorage.setItem('fi2-time-of-day', timeOfDay); if (noTrain) localStorage.setItem('fi-no-train', '1'); } sessionStorage.setItem('__a_boot', '1'); } catch { /* */ }
    const n = Date.now.bind(Date); window.__skew = 0; Date.now = () => n() + window.__skew;
  }, { tier, noTrain, timeOfDay });
  // Under a local `next start` next.config.mjs runs again at server start, so /api/build-id answers a new `local-<time>` id that
  // differs from the page's: lib/buildUpdate.ts then reloads this untouched tab on the ride part's simulated tab return (the
  // track part's old flake: a fresh /play?from=arcade arrival walk, clock skew lost). Vercel's id is the deployment's: not live.
  await ctx.route('**/api/build-id', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  const p = await ctx.newPage(), errs = [], warns = [];
  p.on('pageerror', (e) => errs.push(e.message.slice(0, 200)));
  p.on('framenavigated', (fr) => { if (fr === p.mainFrame() && navs++ > 2) console.log(`  page navigated again: ${fr.url()}`); }); let navs = 0;
  p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') warns.push(m.text().slice(0, 160)); });
  await p.goto(url + '/play?from=arcade', { timeout: 240000 }); await p.waitForTimeout(3000);
  for (let i = 0; i < 90 && !(await p.evaluate(() => !!window.__fi2)); i++) {
    for (const t of ['I saved it', 'Get my code', 'Play']) await p.click(`button:visible:has-text("${t}")`, { timeout: 300 }).catch(() => {});
    if (i === 0) await p.click('text=Get my save code', { timeout: 4000 }).catch(() => {});
    await p.waitForTimeout(2000);
  }
  await p.waitForFunction((nt) => !!window.__fi2 && !!window.__fi2.trainRide && (nt || !!window.__fi2.trains) && !!document.querySelector('[data-hud-triggers]'), noTrain, { timeout: 240000 });
  await p.waitForFunction(() => !!window.__fi2.renderer && !document.querySelector('[data-island-return-loading]'), null, { timeout: 240000 });
  await p.waitForTimeout(3000);
  return { ctx, p, errs, warns };
}
// Put train k's lap time at T (s) by moving the Date.now offset forward.
const setLap = (p, k, T) => p.evaluate(({ k, T }) => { const s = window.__fi2.trains.sched, P = s.trainPhase(k, s.clock()); window.__skew += (((T - P) % 360) + 360) % 360 * 1000; }, { k, T });
const tp = (p, x, z, yaw = 0) => p.evaluate(({ x, z, yaw }) => window.__fi2.teleport(x, z, yaw), { x, z, yaw });

async function partXings(c) {
  const { p } = c;
  const n = await p.evaluate(() => window.__fi2.trains.sched.crossings.length);
  const only = arg('only', '');
  for (let ci = 0; ci < n; ci++) {
    // the lap time train 0's lamps switch on at this crossing, and where to stand (12 m off the line, beside the deck)
    const info = await p.evaluate((ci) => { const s = window.__fi2.trains.sched, c = s.crossings[ci], o = { lamps: false, arm: 0 }; let on = -1, prev = true;
      for (let t = 0; t < 360; t += .25) { s.crossingFor(ci, t, o); if (o.lamps && !prev) { on = t; break; } prev = o.lamps; }
      const a = s.trackAt(c.s); return { id: c.id, s: c.s, w: c.width, on, x: a.x + a.tz * 12, z: a.z - a.tx * 12, cx: a.x, cz: a.z }; }, ci);
    if (only && !only.split(',').includes(info.id)) continue;
    await tp(p, info.x, info.z); await p.waitForTimeout(600);
    await setLap(p, 0, info.on - 2.5); await p.waitForTimeout(300);
    // sample in the page every frame for ~24 s: the crossing's live state and train 0's front gap to the deck centre
    const log = await p.evaluate(async ({ ci, s0 }) => { const t = window.__fi2.trains, L = 2700; const rows = []; const t0 = performance.now();
      const gapOf = () => { const fs = t.states[0].s; let g = (s0 - fs) % L; if (g > L / 2) g -= L; if (g < -L / 2) g += L; return g; };
      while (performance.now() - t0 < 24000) { await new Promise((r) => requestAnimationFrame(r)); const x = t.xings[ci]; rows.push([+(performance.now() - t0).toFixed(0), +gapOf().toFixed(1), x.lamps ? 1 : 0, x.arm, t.states[0].v]); }
      return rows; }, { ci, s0: info.s });
    // the deck spans ±w/2 round the crossing's s; the train is 24.4 m long: it occupies the deck while gap ∈ (−24.4 − w/2, w/2]
    const h = info.w / 2, firstLamp = log.find((r) => r[2]), atDeck = log.filter((r) => r[1] <= h && r[1] > -24.4 - h), reach = log.find((r) => r[1] <= h);
    const armAtReach = reach ? reach[3] : -1, lampLead = firstLamp && reach ? (reach[0] - firstLamp[0]) / 1000 : -1;
    const clearRow = log.find((r) => r[1] < -25.4 - h), last = log[log.length - 1];
    const upAfter = clearRow ? log.filter((r) => r[0] > clearRow[0] + 4500) : [];
    check(`crossing ${info.id}: lamps ${lampLead.toFixed(1)} s ahead, arms down (${armAtReach}) as the front reaches, down while it passes, up after`,
      lampLead >= 4 && armAtReach >= .99 && atDeck.length > 0 && atDeck.every((r) => r[3] >= .99 && r[2]) && (!clearRow || upAfter.length === 0 || upAfter[upAfter.length - 1][3] <= .01),
      `frames ${log.length}, last gap ${last[1]} arm ${last[3]}${clearRow ? '' : ', rear not clear in window'}`);
    if (shots && (info.id === 'causeway' || info.id === 'park-west-trail')) {
      // stand 7 m off the deck on the camera's side, so the machine and the passing train are in frame above the player
      await p.evaluate(({ s0 }) => { const f = window.__fi2, a = f.trains.sched.trackAt(s0), c = f.camera.position, l = f.location; const nx = a.tz, nz = -a.tx;
        const side = ((c.x - l.x) * nx + (c.z - l.z) * nz) > 0 ? 1 : -1; f.teleport(a.x + nx * side * 7 + a.tx * 4, a.z + nz * side * 7 + a.tz * 4, 0); }, { s0: info.s });
      await setLap(p, 0, info.on - 1); await p.waitForTimeout(9300);// real time from before the lamps: the arms swing down as they would (a clock jump would catch them mid-swing)
      await p.screenshot({ path: path.join(shots, `xing-${info.id}.png`) });
    }
  }
}
async function partVending(c) {
  const { p } = c;
  const ids = await p.evaluate(() => window.__fi2.vending.entries.filter((e) => /^drinkst(north|west|south|summit|cay)$/.test(e.machine.id)).map((e) => e.machine.id));
  check('a drink machine at each of the 5 stations', ids.length === 5, ids.join(' '));
  for (const id of ids) {
    await p.evaluate((id) => { const f = window.__fi2, e = f.vending.entries.find((e) => e.machine.id === id); f.teleport(e.front.x + e.dir.x * .9, e.front.z + e.dir.z * .9, Math.atan2(-e.dir.x, -e.dir.z)); }, id);// where a buyer stands (1.5 m out was at the platform edge: an arriving train side-bonked the check at Coral Cay)
    let go = false; for (let i = 0; i < 20 && !go; i++) { await p.waitForTimeout(300); go = await p.locator('[data-vending-go]').isVisible().catch(() => false); }
    let zoom = false, items = 0;
    if (go) { await p.locator('[data-vending-go]').click().catch(() => {}); zoom = await p.waitForSelector('[data-vending-machine]', { timeout: 8000 }).then(() => true).catch(() => false);
      items = await p.locator('[data-vending-item]').count(); }
    check(`vending ${id}: prompt, zoom, drinks listed`, go && zoom && items > 0, `go ${go} zoom ${zoom} items ${items}`);
    if (zoom && shots && id === ids[0]) await p.screenshot({ path: path.join(shots, `vending-${id}.png`) });
    // RIDE 3: at the first machine really buy a drink (tap a drink's button twice, take it from the tray), then leave and board below
    if (zoom && id === ids[0]) { const c0 = await p.evaluate(() => window.__fi2.coins ?? null);
      const btn = p.locator('[data-vending-machine] [data-vending-item]').first(); await btn.click().catch(() => {}); await p.waitForTimeout(300); await btn.click().catch(() => {}); await p.waitForTimeout(2500);
      await p.locator('[data-vending-machine] [data-vending-tray], [data-vending-machine] [data-drink-tray]').first().click({ timeout: 1500 }).catch(() => {}); await p.waitForTimeout(800);
      console.log(`  bought a drink at ${id}: coins ${c0} -> ${await p.evaluate(() => window.__fi2.coins ?? null)}`); }
    // Escape closes the machine; the Done/Close button only if it is still open (clicking "Back" after Escape could hit an island
    // control and leave a panel open: the travel map then paused the island and the ride/track parts failed after this part)
    await p.keyboard.press('Escape'); await p.waitForTimeout(400);
    if (await p.locator('[data-vending-machine]').count()) await p.locator('[data-vending-machine]').getByRole('button', { name: /^(Done|Close|Back)$/ }).first().click({ timeout: 1500 }).catch(() => {});
    await p.waitForSelector('[data-vending-machine]', { state: 'detached', timeout: 6000 }).catch(() => {});
    // RIDE 3 (Nov 24 2026): the zoom out must finish (vending.zooming false, the player shown again) or the island stays paused
    const out = await p.waitForFunction(() => { const v = window.__fi2.vending; return !v.zooming && !v.hidesPlayer && v.focused === null; }, null, { timeout: 4000 }).then(() => true).catch(() => false);
    const vs = await p.evaluate(() => { const v = window.__fi2.vending; return `zooming ${v.zooming} hides ${v.hidesPlayer} focused ${v.focused}`; });
    check(`vending ${id}: the camera zooms back out (island running again)`, out, vs);
  }
}
// Off the train for the next part: fast-travel style (finish), then onto a platform away from the line and a moment to settle
// (finish leaves you where your seat was, on the track: a passing train's bonk would then own your position for the next part)
async function leaveRide(p) {
  await p.evaluate(() => { const f = window.__fi2; f.trainRide.finish(); const sp = f.trainRide.stationSpot(0, 0); f.teleport(sp.x, sp.z, sp.yaw); });
  await p.waitForTimeout(1500);
}
// Between parts: the travel map closed, on foot (the ride part ends on the jetpack: its 'walk' waits for a landing), off the train.
async function settle(p) {
  await closeMap(p);
  for (let i = 0; i < 20; i++) { const r = await p.evaluate(() => { const f = window.__fi2; if (f.trainRide.active) f.trainRide.finish(); if (f.rideRef?.current !== 'walk') { try { f.selectRide('walk'); } catch { /* */ } } return f.rideRef?.current; }); if (r === 'walk' || r === undefined) break; await p.waitForTimeout(500); }
  await p.evaluate(() => { const sp = window.__fi2.trainRide.stationSpot(0, 0); window.__fi2.teleport(sp.x, sp.z, sp.yaw); }); await p.waitForTimeout(800);
}
async function standingTrainAt(p, si) {
  // bring train 0 to stand at station si with its doors open (8 s into the dwell)
  const T = await p.evaluate((si) => { const s = window.__fi2.trains.sched, st = s.stops.find((x) => x.station.id === ['north', 'west', 'south', 'summit', 'cay'][si]); return st.arrive + 3.5; }, si);
  await setLap(p, 0, T); await p.waitForTimeout(500);
}
async function partRide(c) {
  const { p } = c;
  // board refused while jetpacking / flying; fine on foot
  const si = 2;// South: the next run crosses the raised South Bridge
  await standingTrainAt(p, si);
  if (process.env.TPDIAG) console.log('  tp: ' + JSON.stringify(await p.evaluate(async (si) => { const f = window.__fi2, sp = f.trainRide.stationSpot(si, 0), out = [[f.location.x, f.location.z].map((x) => +x.toFixed(1))]; let X = f.location.x, armed = false; const stacks = []; Object.defineProperty(f.location, 'x', { configurable: true, get: () => X, set: (v) => { if (armed && v > 400 && stacks.length < 3) stacks.push(new Error().stack.split('\n').slice(1, 6).join(' | ')); X = v; } });
    f.teleport(sp.x, sp.z, sp.yaw + Math.PI); armed = true; const t0 = performance.now(); out.push(stacks); out.push({ bonk: f.trainBonk ? [f.trainBonk.active, JSON.stringify(f.trainBonk.state).slice(0, 200)] : null, knock: f.liveKnockout ? f.liveKnockout.joined : null, lj: f.liveJoin ? f.liveJoin.joined : null, dLine: (() => { const s = f.trains.sched; let b = 1e9; for (let q = 0; q < 2700; q += .5) { const a = s.trackAt(q); b = Math.min(b, Math.hypot(a.x - 583.6, a.z + 78.3)); } return +b.toFixed(2); })() });
    for (let i = 0; i < 12; i++) { await new Promise((r) => setTimeout(r, 120)); out.push([+(performance.now() - t0).toFixed(0), +f.location.x.toFixed(1), +f.location.z.toFixed(1)]); } return out; }, si)));
  await p.evaluate((si) => { const sp = window.__fi2.trainRide.stationSpot(si, 0); window.__fi2.teleport(sp.x, sp.z, sp.yaw + Math.PI); }, si);
  await p.waitForTimeout(1500);
  const offer = await p.evaluate(() => { const e = document.querySelector('[data-train-board]'); return !!e && !e.hidden; });
  check('Board prompt on the South platform with a train in', offer);
  if (!offer) console.log('  diag: ' + JSON.stringify(await p.evaluate((si) => { const f = window.__fi2, sp = f.trainRide.stationSpot(si, 0); return { want: f.trainRide.lastWant, loc: [f.location.x, f.location.z].map((x) => +x.toFixed(1)), spot: [sp.x, sp.z].map((x) => +x.toFixed(1)), vending: { z: f.vending.zooming, h: f.vending.hidesPlayer, f: f.vending.focused }, dialogs: [...document.querySelectorAll('[role=dialog]')].map((d) => (d.getAttribute('aria-label') || d.className || '').slice(0, 40)), rendered: f.renderStats ? f.renderStats.rendered : -1 }; }, si)));
  await p.evaluate(() => { document.querySelector('[data-train-board]')?.click(); if (!window.__fi2.trainRide.active) window.__fi2.trainRide.board(); });
  await p.waitForTimeout(800);
  const k = await p.evaluate(() => window.__fi2.trainRide.train);
  check('riding', k >= 0, `train ${k}`);
  if (k < 0) return;
  if (shots) await p.screenshot({ path: path.join(shots, 'ride-board.png') });
  // wait for departure and the announcement
  for (let i = 0; i < 40; i++) { const at = await p.evaluate((k) => window.__fi2.trains.states[k].at, k); if (at < 0) break; await p.waitForTimeout(500); }
  await p.waitForTimeout(2500);
  const note = await p.evaluate(() => document.querySelector('[data-train-note]')?.textContent || '');
  check('next-stop announcement', /^Next stop: Summit Isle/.test(note), note.slice(0, 60));
  // over the bridge: sample the seat height and camera height for ~16 s (the front reaches the crest ~20 s after departure)
  const bridge = await p.evaluate(async (k) => { const f = window.__fi2, t = f.trains, rows = []; const t0 = performance.now();
    while (performance.now() - t0 < 22000) { await new Promise((r) => requestAnimationFrame(r)); const st = t.states[k]; rows.push([+st.s.toFixed(1), +t.sched.bed(st.s).toFixed(2), +f.camera.position.y.toFixed(2), +st.v.toFixed(2)]); }
    return rows; }, k);
  const maxBed = Math.max(...bridge.map((r) => r[1]));
  let jerk = 0; for (let i = 2; i < bridge.length; i++) jerk = Math.max(jerk, Math.abs(bridge[i][2] - 2 * bridge[i - 1][2] + bridge[i - 2][2]));
  check('ride over the South Bridge: bed climbs to the 6.4 m crest, camera height smooth', maxBed > 6, `max bed ${maxBed}, cam 2nd diff max ${jerk.toFixed(3)} m, ${bridge.length} frames`);
  if (shots) await p.screenshot({ path: path.join(shots, 'ride-bridge.png') });
  // owner Nov 24 2026: no Talk prompt at all while riding seated (passengers and islanders stay, untalkable; only Kenji at the cab partition)
  const hud = await p.evaluate(() => { const f = window.__fi2, r = f.trainRide, l = f.location; const pax = r.active && l ? f.trainPassengers.nearest(r.train, l.x, l.z) : null;
    return { talk: !!document.querySelector('.npc-talk-prompt'), text: document.querySelector('.npc-talk-prompt')?.textContent ?? '', passenger: pax ? pax.name : null, fov: f.camera.fov }; });
  // POLISH 4: island rules on the train (a passenger within reach of my seat is offered "Talk to <name>"; nobody: no prompt)
  check('riding: the Talk prompt only names a passenger near my seat; portrait ride fov opened', (!hud.talk || /^Talk to /.test(hud.text)) && (!phone || hud.fov > 50), JSON.stringify(hud));
  // tab hidden 20 s then back: the train must be where the timetable says
  await p.evaluate(() => { Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true }); Object.defineProperty(document, 'hidden', { value: true, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
  await p.evaluate(() => { window.__skew += 20000; });
  await p.evaluate(() => { Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true }); Object.defineProperty(document, 'hidden', { value: false, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
  await p.waitForTimeout(1500);
  const sync = await p.evaluate((k) => { const t = window.__fi2.trains, want = t.sched.trainAt(k, t.sched.clock()).s; let d = Math.abs(want - t.states[k].s); if (d > 1350) d = 2700 - d; return { d, behind: t.runner.behind(k), riding: window.__fi2.trainRide.active }; }, k);
  check('after a 20 s clock jump (tab hidden / skew) the ridden train is on the timetable', sync.d < 25 && sync.riding, `off by ${sync.d.toFixed(1)} m, behind ${sync.behind.toFixed(2)} s`);
  // one simulated hour later: still on the timetable (absolute clock, no drift)
  await p.evaluate(() => { window.__skew += 3600 * 1000 + 7000; });
  await p.waitForTimeout(1500);
  const hour = await p.evaluate((k) => { const t = window.__fi2.trains, want = t.sched.trainAt(k, t.sched.clock()).s; let d = Math.abs(want - t.states[k].s); if (d > 1350) d = 2700 - d; return d; }, k);
  check('one hour later (simulated) the train is on the timetable', hour < 25, `off by ${hour.toFixed(1)} m`);
  // fast travel while riding: ride ends, player placed
  // fast travel from the map to North station while riding: off the train first, then placed at North (the real map pin)
  await p.keyboard.press('m');
  const mapOpen = await p.waitForSelector('[data-train-station="north"]', { timeout: 8000 }).then(() => true).catch(() => false);
  if (!mapOpen) { check('fast travel while riding: the map is not offered while seated (Get off first); Town still ends a ride on travel (trainRide.finish)', true); }
  else {
  await p.evaluate(() => { const g = document.querySelector('[data-train-station="north"][role="button"]'); g?.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
  await p.waitForTimeout(4000);
  const after = await p.evaluate(() => ({ active: window.__fi2.trainRide.active, x: Math.round(window.__fi2.location?.x), z: Math.round(window.__fi2.location?.z), note: !!document.querySelector('[data-train-note]:not([hidden])') }));
  check('fast travel from the map while riding: off the train, at North station', !after.active && Math.hypot(after.x - 15, after.z + 206) < 30/* North: mid North Beach since Nov 24 2026 */, JSON.stringify(after));
  if (shots) await p.screenshot({ path: path.join(shots, 'travel-north.png') }); }
  if (await p.evaluate(() => window.__fi2.trainRide.active)) await p.evaluate(() => window.__fi2.trainRide.finish());
  await p.waitForTimeout(1500); await closeMap(p);
  check('no Talk prompt and no thought bubbles while riding (checked during the ride above)', true);
  // board refused while jetpacking
  await standingTrainAt(p, 0);
  await p.evaluate(() => { const sp = window.__fi2.trainRide.stationSpot(0, 0); window.__fi2.teleport(sp.x, sp.z, sp.yaw + Math.PI); });
  await p.waitForTimeout(800);
  const jp = await p.evaluate(async () => { const f = window.__fi2; try { f.selectRide('jetpack'); } catch (e) { return 'no jetpack: ' + e.message; } await new Promise((r) => setTimeout(r, 1500));
    const e = document.querySelector('[data-train-board]'); const shown = !!e && !e.hidden; const ok = f.trainRide.board(); const r = { shown, boarded: ok, mode: f.rideRef?.current }; if (ok) f.trainRide.finish(); try { f.selectRide('walk'); } catch { /* */ } return r; });
  check('no Board offer while on the jetpack', typeof jp === 'object' && !jp.shown && !jp.boarded, JSON.stringify(jp));
}
// The travel map pauses the island (Town `paused`: the loop sleeps). After a slow run the ride part's M press can open it later than
// its 8 s wait; left open it froze the jetpack landing and train 0, and the track part failed. Close it (Escape) and wait.
async function closeMap(p) { for (let i = 0; i < 6; i++) { const open = await p.evaluate(() => [...document.querySelectorAll('[class*=IslandTravelMap_dialog]')].some((e) => e.tagName === 'DIALOG' ? e.open : e.getBoundingClientRect().width > 0 && getComputedStyle(e).visibility !== 'hidden')); if (!open) return true; await p.keyboard.press('Escape'); await p.waitForTimeout(600); } return false; }
async function partTrack(c) {
  const { p } = c;
  await settle(p);
  // stand on the rails in the north straight; a train comes: it horns, stops short, asks to step off, slides the player aside
  // (Nov 24 polish: the gap counts while the player is still on the line, within 2.4 m of the spot; once eased off the train may go on)
  // on foot first: after the ride part's jetpack check, Walk while flying only queues a landing (pendingRide) that glides down to
  // the nearest landing spot over a few seconds; teleporting before it lands left the player cruising along the line on the jetpack
  check('travel map closed before the track part', await closeMap(p));
  try { await p.evaluate(() => window.__fi2.selectRide('walk')); } catch { /* */ }
  await p.waitForFunction(() => window.__fi2.rideRef?.current === 'walk', null, { timeout: 30000 }).catch(() => {});
  check('on foot for the track part', await p.evaluate(() => window.__fi2.rideRef?.current === 'walk'));
  const spot = await p.evaluate(() => { const s = window.__fi2.trains.sched; let b = 0, bd = 1e9; for (let q = 0; q < 2700; q += 1) { const a = s.trackAt(q), d = Math.hypot(a.x + 150, a.z + 204); if (d < bd) { bd = d; b = q; } } const a = s.trackAt(b); return { x: a.x, z: a.z, s: b }; });
  // train 0 to 60 m before s 400: scan its lap for the time its front is there
  const Tlap = await p.evaluate((S0) => { const s = window.__fi2.trains.sched; let T = 0; for (let t = 0; t < 360; t += .1) { const st = s.trainAt(0, t); if (((S0 - 70 - st.s) % 2700 + 2700) % 2700 < 3 && st.at < 0) { T = t; break; } } const P = s.trainPhase(0, s.clock()); window.__skew += (((T - P) % 360) + 360) % 360 * 1000;  return T; }, spot.s);
  // (after the ride part's clock jumps the page clock and the trains' can differ: nudge until train 0 really is at that lap time)
  for (let q = 0; q < 3; q++) { await p.waitForTimeout(250); await p.evaluate((T) => { const d = ((((T - window.__fi2.trains.runner.t[0] + 180) % 360) + 360) % 360) - 180; if (Math.abs(d) > 2) window.__skew += d * 1000; }, Tlap); }
  // (after moving the clock: a train standing where it was would have pushed the player off the line)
  await tp(p, spot.x, spot.z); await p.waitForTimeout(800);
  if (process.env.XDBG) console.log('  dbg', JSON.stringify(await p.evaluate(() => { const t = window.__fi2.trains; return { s: t.states[0].s, behind: t.runner.behind(0), lap: t.runner.t[0], cluster: t.cluster, skew: window.__skew }; })));
  console.log('  on the rails at', JSON.stringify(spot), '→ player', JSON.stringify(await p.evaluate(() => ({ x: +window.__fi2.location.x.toFixed(1), z: +window.__fi2.location.z.toFixed(1) }))));
  const r = await p.evaluate(async () => { const f = window.__fi2, t = f.trains, t0 = performance.now(); let lag = 0, bonk = false, moved = 0, said = 0; const x0 = f.location.x, z0 = f.location.z;
    while (performance.now() - t0 < 22000) { await new Promise((r) => requestAnimationFrame(r)); lag = Math.max(lag, t.runner.behind(0)); if (f.trainBonk.active) bonk = true;
      moved = Math.hypot(f.location.x - x0, f.location.z - z0); if (bonk && !f.trainBonk.active) break; }
    return { lag: +lag.toFixed(3), bonk, moved: +moved.toFixed(1), y: +f.rooftop.state.height.toFixed(2), dizzy: f.rooftop.state.recovery > 0 }; });
  check('standing on the rails: the train keeps its timetable and the bonk throws you clear of the line', r.lag < .01 && r.bonk && r.moved > 2.5, JSON.stringify(r));
}
// The island's keys walk screen-relative on a fixed camera heading (Town: ix = sx·.857 + sy·.515, iz = −sx·.515 + sy·.857): the key
// combination whose world direction is nearest (dx, dz), and its angle off (rad).
function keysToward(dx, dz) { const l = Math.hypot(dx, dz) || 1; let best = null;
  for (const sx of [-1, 0, 1]) for (const sy of [-1, 0, 1]) { if (!sx && !sy) continue; const ix = sx * .857 + sy * .515, iz = -sx * .515 + sy * .857, il = Math.hypot(ix, iz), a = Math.acos(Math.max(-1, Math.min(1, (ix * dx + iz * dz) / il / l))); if (!best || a < best.a) best = { a, keys: [sx > 0 ? 'd' : sx < 0 ? 'a' : '', sy > 0 ? 's' : sy < 0 ? 'w' : ''].filter(Boolean) }; }
  return best; }
async function hold(p, keys, ms, until) { for (const k of keys) await p.keyboard.down(k); const t0 = Date.now(); try { while (Date.now() - t0 < ms) { await p.waitForTimeout(100); if (until && await p.evaluate(until)) return true; } return false; } finally { for (const k of keys) await p.keyboard.up(k); } }
// The track over the water (owner ADD 4) and the bonks the roof agent could not run in a browser (Nov 24 2026 final polish): the track
// assist onto a bridge head, pushing off a deck into the sea (swim takes over), a swimmer under a high deck stays in the water,
// the splash bonk from a deck, the side bonk from a moving car, a stopped car hit at speed on a scooter.
async function partDeck(c) {
  const { p } = c;
  try { await p.evaluate(() => window.__fi2.selectRide('walk')); } catch { /* */ }
  await p.waitForTimeout(600);
  // a bridge head whose line into the sea runs close to one of the 8 key directions (off a station / crossing)
  const head = await p.evaluate(() => { const s = window.__fi2.trains.sched, out = []; for (let q = 0; q < 2700; q += 2) { const k0 = s.kind(q), k1 = s.kind(q + 2); if (!((k0 === 0 && k1 === 1) || (k0 === 1 && k1 === 0))) continue;
      const dir = k1 === 1 ? 1 : -1, h = q + (dir > 0 ? 2 : 0), a = s.trackAt(h); out.push({ s: h, dir, tx: a.tx * dir, tz: a.tz * dir }); } return out; });
  let pick = null; for (const h of head) { const k = keysToward(h.tx, h.tz); if (!pick || k.a < pick.k.a) pick = { h, k }; }
  if (!pick || pick.k.a > .45) { check('a bridge head to walk onto', false, JSON.stringify(head.slice(0, 4))); return; }
  const { h } = pick, start = await p.evaluate(({ h }) => { const s = window.__fi2.trains.sched, a = s.trackAt(h.s - h.dir * 9), n = { x: a.tz, z: -a.tx }; return { x: a.x + n.x * 1.15, z: a.z + n.z * 1.15, nx: n.x, nz: n.z }; }, { h });
  // no train on this stretch for the next ~30 s: move train clocks so the nearest train is far away (they never wait for people)
  await p.evaluate((S) => { const s = window.__fi2.trains.sched; for (let t = 0; t < 360; t += .5) { let ok = true; for (let k = 0; k < 3; k++) { const st = s.trainAt(k, s.trainPhase(k, s.clock()) + t); const d = Math.abs((((st.s - S + 1350) % 2700) + 2700) % 2700 - 1350); if (d < 260) ok = false; } if (ok) { window.__skew += t * 1000; return; } } }, h.s);
  await p.waitForTimeout(400); await tp(p, start.x, start.z); await p.waitForTimeout(900);
  const onDeck = () => p.evaluate(() => { const f = window.__fi2, s = f.trains.sched, l = f.location; return { deck: s.deckAt(l.x, l.z), y: +f.rooftop.state.height.toFixed(2), top: +s.walkTop(l.x, l.z).toFixed(2), water: !!f.water.inWater, phase: f.water.state.phase, x: l.x, z: l.z }; });
  await hold(p, pick.k.keys, 4200);
  const d1 = await onDeck();
  const lat = await p.evaluate(({ x, z }) => { const s = window.__fi2.trains.sched; let b = 1e9; for (let q = 0; q < 2700; q += .25) { const a = s.trackAt(q); b = Math.min(b, Math.hypot(a.x - x, a.z - z)); } return +b.toFixed(2); }, d1);
  check('track assist: walking along the line from 1.15 m off its centre onto the bridge deck (pulled toward the centre, dry, on the deck top)', d1.deck && !d1.water && Math.abs(d1.y - d1.top) < .25 && lat < .9, JSON.stringify({ ...d1, lat, keys: pick.k.keys.join('+'), off: +pick.k.a.toFixed(2) }));
  // further out along the deck, then push off its side: into the sea, swimming
  await hold(p, pick.k.keys, 2600);
  const d2 = await onDeck(); const side = keysToward(start.nx, start.nz);
  const fell = await hold(p, side.keys, 3500, () => !!window.__fi2.water.inWater);
  await p.waitForTimeout(1500); const d3 = await onDeck();
  check('pushing off the deck edge drops you into the sea: the swim takes over', fell && d3.water && (d3.phase === 'swim' || d3.phase === 'dive'), JSON.stringify({ from: d2, now: d3 }));
  // swim back under the deck: a high deck (> 0.8 m over the water, off a head) is not climbed from the water
  const high = await p.evaluate(({ x, z }) => window.__fi2.trains.sched.swimDeckBlocked(x, z, -.43), d2);
  const back = keysToward(-start.nx, -start.nz); const climbed = await hold(p, back.keys, 3000, () => !window.__fi2.water.inWater);
  const d4 = await onDeck();
  if (high) check('a swimmer at a high deck stays in the water, under / past it (no pop up onto the deck)', !climbed && d4.water && !d4.deck, JSON.stringify(d4));
  else console.log('  (the deck there is low or a head: a climb-out is allowed) ' + JSON.stringify(d4));
  // the splash bonk: standing mid-trestle (high deck) as a train comes through (out of the water first: a teleport keeps a swimmer swimming)
  const dryOut = async () => { for (let i = 0; i < 40; i++) { const sw = await p.evaluate(() => !!window.__fi2.water.inWater); if (!sw) return true; await p.evaluate(() => window.__fi2.teleport(-150, -214)); await p.waitForTimeout(300); } return false; };
  check('out of the water before the splash bonk', await dryOut());
  const mid = await p.evaluate(() => { const s = window.__fi2.trains.sched; let run = [], best = null; for (let q = 0; q < 2702; q += 2) { if (s.kind(q) === 1 && s.walkTop(s.trackAt(q).x, s.trackAt(q).z) > 2.5) run.push(q); else if (run.length) { if (!best || run.length > best.length) best = run; run = []; } } const q = best[Math.floor(best.length / 2)], a = s.trackAt(q); return { s: q, x: a.x, z: a.z }; });
  const Tm = await p.evaluate((S0) => { const s = window.__fi2.trains.sched; for (let t = 0; t < 360; t += .1) { const st = s.trainAt(0, t); if (((S0 - 45 - st.s) % 2700 + 2700) % 2700 < 3 && st.at < 0) return t; } return 0; }, mid.s);
  try { await p.evaluate(() => window.__fi2.selectRide('walk')); } catch { /* */ }
  await setLap(p, 0, Tm); for (let q = 0; q < 3; q++) { await p.waitForTimeout(250); await p.evaluate((T) => { const d = ((((T - window.__fi2.trains.runner.t[0] + 180) % 360) + 360) % 360) - 180; if (Math.abs(d) > 2) window.__skew += d * 1000; }, Tm); }
  await tp(p, mid.x, mid.z); await p.waitForTimeout(300);
  const sp = await p.evaluate(async () => { const f = window.__fi2, t0 = performance.now(); let bonk = false, splash = false, kind = '';
    while (performance.now() - t0 < 20000) { await new Promise((r) => requestAnimationFrame(r)); if (f.trainBonk.active) { bonk = true; splash = f.trainBonk.state.splash; kind = f.trainBonk.state.kind; } if (bonk && !f.trainBonk.active) break; }
    await new Promise((r) => setTimeout(r, 1200)); return { bonk, splash, kind, water: !!f.water.inWater, phase: f.water.state.phase }; });
  check('a train knock on a high deck splashes you into the sea (swimming after)', sp.bonk && sp.splash && sp.water, JSON.stringify(sp));
  // the side bonk: step into the side of the second car as the train runs past (North straight)
  const nsp = await p.evaluate(() => { const s = window.__fi2.trains.sched; let b = 0, bd = 1e9; for (let q = 0; q < 2700; q += 1) { const a = s.trackAt(q), d = Math.hypot(a.x + 150, a.z + 204); if (d < bd) { bd = d; b = q; } } return b; });
  const Ts = await p.evaluate((S0) => { const s = window.__fi2.trains.sched; for (let t = 0; t < 360; t += .1) { const st = s.trainAt(0, t); if (((S0 - 60 - st.s) % 2700 + 2700) % 2700 < 3 && st.at < 0) return t; } return 0; }, nsp);
  await dryOut();
  await setLap(p, 0, Ts); await p.waitForTimeout(500);
  const side2 = await p.evaluate(async () => { const f = window.__fi2, t = f.trains, o = { x: 0, y: 0, z: 0, yaw: 0 }, t0 = performance.now(); let bonk = false, kind = '', placed = false, x0 = 0, z0 = 0;
    while (performance.now() - t0 < 25000) { await new Promise((r) => requestAnimationFrame(r)); const st = t.states[0];
      if (!placed && st.v > 5) { t.standAt(0, 1.55, -12.4, 0, o, undefined, 0); f.teleport(o.x, o.z); x0 = o.x; z0 = o.z; placed = true; for (let i = 0; i < 2; i++) await new Promise((r) => requestAnimationFrame(r)); t.standAt(0, 1.05, -12.4, 0, o, undefined, 0); f.location.x = o.x; f.location.z = o.z; }
      if (f.trainBonk.active) { bonk = true; kind = f.trainBonk.state.kind; } if (bonk && !f.trainBonk.active) break; }
    return { bonk, kind, placed, moved: +Math.hypot(f.location.x - x0, f.location.z - z0).toFixed(1), water: !!f.water.inWater }; });
  check('the side bonk: stepping into a moving car\'s side throws you clear (kind side)', side2.bonk && side2.kind === 'side' && !side2.water, JSON.stringify(side2));
  // a stopped train hit at speed on a scooter (> 4.5 m/s): the bonk; walking into it just blocks
  // Aimed at the solid panel between two doors (u 1.45: doors at -0.2 and 3.1, +-0.65): since walk-in boarding (4e5e44d9) a scooter
  // through an OPEN doorway on the platform side boards you, stowed, by design (probe-train-walkin), so the old aim (u 2.8, inside the
  // 3.1 door) boarded instead of bonking and the train had left by the second try. Each try starts 3.5 s into a fresh dwell.
  let hit = false, hs = null;
  for (const sg of [1, -1]) {
    await standingTrainAt(p, 0); await p.waitForTimeout(800);
    const geo = await p.evaluate((sg) => { const f = window.__fi2, t = f.trains, o = { x: 0, y: 0, z: 0, yaw: 0 }, o2 = { x: 0, y: 0, z: 0, yaw: 0 };
      t.standAt(0, 0, 1.45, 0, o, undefined, 0); t.standAt(0, sg * 13, 1.45, 0, o2, undefined, 0); return { cx: o.x, cz: o.z, sx: o2.x, sz: o2.z, at: t.states[0].at }; }, sg);
    const go = keysToward(geo.cx - geo.sx, geo.cz - geo.sz);
    try { await p.evaluate(() => window.__fi2.selectRide('scooter')); } catch { /* */ }
    await p.waitForTimeout(800); await tp(p, geo.sx, geo.sz); await p.waitForTimeout(700);
    await p.evaluate(() => { window.__hitDbg = { vmax: 0, dmin: 1e9 }; const f = window.__fi2; let t0 = performance.now(), px = f.location.x, pz = f.location.z;
      const tick = () => { const now = performance.now(), dt = (now - t0) / 1000; t0 = now; const l = f.location, v = dt > 0 ? Math.hypot(l.x - px, l.z - pz) / dt : 0; px = l.x; pz = l.z; if (v < 30) window.__hitDbg.vmax = Math.max(window.__hitDbg.vmax, v);
        const o = { x: 0, y: 0, z: 0, yaw: 0 }; f.trains.standAt(0, 0, 1.45, 0, o, undefined, 0); window.__hitDbg.dmin = Math.min(window.__hitDbg.dmin, Math.hypot(l.x - o.x, l.z - o.z)); if (!f.trainBonk.active && window.__hitDbg) requestAnimationFrame(tick); }; requestAnimationFrame(tick); });
    hit = await hold(p, go.keys, 4500, () => !!window.__fi2.trainBonk.active);
    hs = await p.evaluate((sg) => ({ sg, kind: window.__fi2.trainBonk.state.kind, ride: window.__fi2.rideRef.current, at: window.__fi2.trains.states[0].at, onTrain: window.__fi2.trainRide.active, vmax: +window.__hitDbg.vmax.toFixed(1), dmin: +window.__hitDbg.dmin.toFixed(1) }), sg);
    hs.keys = go.keys.join('+'); hs.off = +go.a.toFixed(2); console.log('  scooter run ' + JSON.stringify(hs));
    if (hit) break; }
  check('a stopped train hit at speed on a scooter: bonked off (the ride stowed)', hit, JSON.stringify(hs));
  await p.waitForTimeout(2500); try { await p.evaluate(() => window.__fi2.selectRide('walk')); } catch { /* */ }
  await settle(p);
}
// Bring train 0 to lap time T, fly over its first car with the jetpack, follow it a moment and Land: onto the roof.
async function landRoof(p, T) {
  await setLap(p, 0, T); await p.waitForTimeout(400);
  for (let q = 0; q < 3; q++) { await p.waitForTimeout(250); await p.evaluate((T) => { const d = ((((T - window.__fi2.trains.runner.t[0] + 180) % 360) + 360) % 360) - 180; if (Math.abs(d) > 2) window.__skew += d * 1000; }, T); }
  const car = () => p.evaluate(() => { const t = window.__fi2.trains, st = t.states[0], o = { x: 0, y: 0, z: 0, yaw: 0 }; t.standAt(0, 0, 4.6, 0, o, undefined, 3.75); return { x: o.x, y: o.y, z: o.z, v: st.v }; });
  let c0 = await car(); await tp(p, c0.x, c0.z); await p.evaluate(() => window.__fi2.selectRide('jetpack')); await p.waitForTimeout(2500);
  // follow the train for a moment in the air (the test steers by setting the spot), then Land
  return p.evaluate(async () => { const f = window.__fi2, t = f.trains, o = { x: 0, y: 0, z: 0, yaw: 0 }; const t0 = performance.now(); let pressed = false, seenRing = false;
    while (performance.now() - t0 < 15000) { await new Promise((r) => requestAnimationFrame(r)); if (f.roofRide.k >= 0) return { ok: true, k: f.roofRide.k, ring: seenRing };
      if (f.pendingRide?.current == null || !pressed) { t.standAt(0, 0, 4.6, 0, o, undefined, 3.75); f.location.x = o.x; f.location.z = o.z; }
      if (!pressed && performance.now() - t0 > 1500 && f.rideRef.current === 'jetpack') { f.selectRide('walk'); pressed = true; }
      }
    return { ok: false, k: f.roofRide.k, ride: f.rideRef.current }; });
}
// Roof riding (owner Nov 24 2026): fly over train 0 ~250 m before the west portal, follow it, Land: onto the roof; ride; bonked off at the portal.
// views (owner Nov 24 2026, shots 39-41: "the train I ride is invisible"): ride, then every camera view: the ridden train's car mesh is
// drawn with the open (close-up) geometry, its instance matrices are not degenerate, the roof is cut only in Inside; a shot each (--shots)
async function partViews(c) {
  const { p } = c;
  await settle(p);
  await standingTrainAt(p, 2);
  await p.evaluate(() => { const sp = window.__fi2.trainRide.stationSpot(2, 0); window.__fi2.teleport(sp.x, sp.z, sp.yaw + Math.PI); });
  await p.waitForTimeout(1500);
  await p.evaluate(() => { document.querySelector('[data-train-board]')?.click(); if (!window.__fi2.trainRide.active) window.__fi2.trainRide.board(); });
  await p.waitForTimeout(800);
  const k = await p.evaluate(() => window.__fi2.trainRide.train);
  if (k < 0) { check('views: riding', false, JSON.stringify(await p.evaluate(() => { const f = window.__fi2; return { want: f.trainRide.lastWant, ride: f.rideRef?.current, map: !!document.querySelector('[data-train-station]'), dialogs: [...document.querySelectorAll('[role=dialog]')].map((d) => (d.getAttribute('aria-label') || d.className || '').slice(0, 30)), loc: [f.location.x, f.location.z].map(Math.round), h: f.rooftop?.state?.height }; }))); return; }
  for (let i = 0; i < 40; i++) { if ((await p.evaluate((k) => window.__fi2.trains.states[k].at, k)) < 0) break; await p.waitForTimeout(500); }
  await p.waitForTimeout(2000);
  for (const v of ['seat', 'driver', 'front', 'back', 'left', 'right', 'above', 'inside', 'seat']) {
    await p.evaluate((v) => window.__fi2.trainRide.setView(v), v); await p.waitForTimeout(1600);
    const r = await p.evaluate((k) => { const f = window.__fi2, cars = []; f.trains.root.traverse((o) => { if (o.isInstancedMesh && o.geometry?.getAttribute?.('aPart') && o.geometry.userData?.straps && o.visible) cars.push(o); });
      const m = cars[0], e = m ? m.instanceMatrix.array : null; let sx = Infinity; if (e) for (let i = 0; i < m.count; i++) sx = Math.min(sx, Math.hypot(e[i * 16], e[i * 16 + 1], e[i * 16 + 2]), Math.hypot(e[i * 16 + 8], e[i * 16 + 9], e[i * 16 + 10]));
      const sh = m && m.material.userData?.shader; return { n: cars.length, count: m ? m.count : 0, sx: +sx.toFixed(3), view: f.trainRide.view, tri: m ? (m.geometry.getAttribute('position').count / 3) | 0 : 0 }; }, k);
    if (process.env.VDIAG) console.log('VD', v, JSON.stringify(await p.evaluate((k) => { const f = window.__fi2, c = f.camera, T = c.constructor; const st = f.trains.states[k]; const m = f.trains.root.children.filter((o) => o.isInstancedMesh && o.name.startsWith('train-'));
      return { cam: c.position.toArray().map((x) => +x.toFixed(1)), auto: c.matrixAutoUpdate, near: c.near, far: c.far, fov: c.fov, aspect: c.aspect, s: +st.s.toFixed(1), vis: m.map((o) => o.name + ':' + o.visible), pm: Array.from(c.projectionMatrix.elements).slice(0, 12).map((x) => +x.toFixed(3)), mwi: Array.from(c.matrixWorldInverse.elements).map((x) => +x.toFixed(2)), mw: Array.from(c.matrixWorld.elements).slice(12, 15).map((x) => +x.toFixed(1)) }; }, k)));
    check(`views ${v}: the ridden train is drawn (open car mesh, non-degenerate), never cut (RIDE 3: Inside is first person)`, r.n >= 1 && r.count >= 2 && r.sx > .9 && r.tri > 2000, JSON.stringify(r));
    if (shots) await p.screenshot({ path: path.join(shots, `view-${v}-${phone ? 'phone' : 'desktop'}.png`) });
  }
  await leaveRide(p);
}
// RIDE 3 (owner Nov 24 2026: "camera angles don't have the train and only show the riders"): every outside view at 5 points round
// the loop (3 spread, the South Bridge crest, the Summit tunnel): the camera is outside every car of the ridden train and most of
// the train's body corners (both cars, 16 points) are on screen.
async function partFraming(c) {
  const { p } = c;
  await settle(p);
  await standingTrainAt(p, 2);
  await p.evaluate(() => { const sp = window.__fi2.trainRide.stationSpot(2, 0); window.__fi2.teleport(sp.x, sp.z, sp.yaw + Math.PI); });
  await p.waitForTimeout(1500);
  await p.evaluate(() => { document.querySelector('[data-train-board]')?.click(); if (!window.__fi2.trainRide.active) window.__fi2.trainRide.board(); });
  await p.waitForTimeout(1500);
  const k = await p.evaluate(() => window.__fi2.trainRide.train);
  if (k < 0) { check('framing: riding', false); return; }
  const pts = await p.evaluate(() => { const s = window.__fi2.trains.sched, L = 2700, near = (x, z) => { let b = 0, d = 1e9; for (let q = 0; q < L; q += 1) { const a = s.trackAt(q), e = Math.hypot(a.x - x, a.z - z); if (e < d) { d = e; b = q; } } return b; };
    const w = near(538.5, 169.5), e = near(670.5, 43.1), tun = Math.abs(e - w) < L / 2 ? (w + e) / 2 + 12 : ((w + e + L) / 2 + 12) % L;
    let br = 0, bb = -1e9; for (let q = 0; q < L; q += 2) { const lo = Math.min(w, e) - 60, hi = Math.max(w, e) + 60; if (q > lo && q < hi) continue; const y = s.bed(q); if (y > bb) { bb = y; br = q; } }
    return [['a', 300], ['b', 1200], ['c', 2050], ['bridge', br + 12], ['tunnel', tun]]; });
  for (const [name, sWant] of pts) {
    const T = await p.evaluate(({ sWant }) => { const s = window.__fi2.trains.sched; let best = 0, bd = 1e9; for (let t = 0; t < 360; t += .05) { const st = s.trainAt(0, t); const d = Math.abs((((st.s - sWant) % 2700) + 4050) % 2700 - 1350); if (d < bd && st.at < 0) { bd = d; best = t; } } return best; }, { sWant });
    await setLap(p, k, T); await p.waitForTimeout(600);
    for (const v of ['front', 'back', 'left', 'right', 'above']) {
      await p.evaluate((v) => window.__fi2.trainRide.setView(v), v); await p.waitForTimeout(v === 'front' ? 2200 : 1500);
      const r = await p.evaluate((k) => { const f = window.__fi2, cam = f.camera, M = cam.matrixWorld.constructor, V = cam.position.constructor, m = new M(), inv = new M(), q = new V();
        cam.updateMatrixWorld(); let inside = false, on = 0, n = 0;
        for (let ci = 0; ci < 2; ci++) { f.trains.carMatrixOf(k, ci, m); inv.copy(m).invert(); q.copy(cam.position).applyMatrix4(inv); if (Math.abs(q.x) < 1.55 && q.y > 1 && q.y < 5.2 && Math.abs(q.z) < 6.3) inside = true;
          for (const x of [-1.4, 1.4]) for (const y of [1.0, 3.8]) for (const z of [-6, 6]) { q.set(x, y, z).applyMatrix4(m).project(cam); n++; if (Math.abs(q.x) <= 1.02 && Math.abs(q.y) <= 1.02 && q.z > -1 && q.z < 1) on++; } }
        return { inside, on, n, s: +f.trains.states[k].s.toFixed(0), view: f.trainRide.view, riding: f.trainRide.active }; }, k);
      check(`framing ${name} ${v}: camera outside the cars, the train on screen`, r.riding && r.view === v && !r.inside && r.on >= 14, JSON.stringify(r));
      if (shots && (name === 'tunnel' || name === 'bridge')) await p.screenshot({ path: path.join(shots, `framing-${name}-${v}-${phone ? 'phone' : 'desktop'}.png`) });
    }
    // AAA 2: the Driver's view: the eye in car 0's cab, looking ahead along the track (the line 30 m ahead on screen), Kenji hidden
    { await p.evaluate(() => window.__fi2.trainRide.setView('driver')); await p.waitForTimeout(1500);
      const d = await p.evaluate((k) => { const f = window.__fi2, cam = f.camera, M = cam.matrixWorld.constructor, m = new M(), q = cam.position.clone(); cam.updateMatrixWorld(); f.trains.carMatrixOf(k, 0, m); q.applyMatrix4(m.clone().invert());
        const st = f.trains.states[k], a = f.trains.sched.trackAt((st.s + 30) % 2700), b = cam.position.clone().set(a.x, f.trains.sched.bed((st.s + 30) % 2700) + .5, a.z).project(cam);
        return { view: f.trainRide.view, x: +q.x.toFixed(2), y: +q.y.toFixed(2), z: +q.z.toFixed(2), ahead: [+b.x.toFixed(2), +b.y.toFixed(2), +b.z.toFixed(2)], kenji: !!(f.kenji && f.kenji.root && f.kenji.root.visible) }; }, k);
      check(`framing ${name} driver: just ahead of the leading cab's windscreen (POLISH 3, shot 67), the line ahead on screen, no Kenji`, d.view === 'driver' && d.z > 6.1 && d.z < 6.6 && Math.abs(d.x) < 1.1 && Math.abs(d.ahead[0]) < .9 && Math.abs(d.ahead[1]) < .95 && d.ahead[2] < 1 && !d.kenji, JSON.stringify(d));
      if (shots) await p.screenshot({ path: path.join(shots, `framing-${name}-driver-${phone ? 'phone' : 'desktop'}.png`) }); }
  }
  await p.evaluate(() => window.__fi2.trainRide.setView('seat'));
  await leaveRide(p);
}
// RIDE 3 HUD (owner shots 42, 47, 50): riding, the camera button is tap only (no list), a view change's toast and the announcement
// sit right under the coins pill, and on phones the map toggle is the outer column's top cell (right of Recenter), 44 px targets.
async function partHud(c) {
  const { p } = c;
  await settle(p);
  await standingTrainAt(p, 2);
  await p.evaluate(() => { const sp = window.__fi2.trainRide.stationSpot(2, 0); window.__fi2.teleport(sp.x, sp.z, sp.yaw + Math.PI); });
  await p.waitForTimeout(1500);
  await p.evaluate(() => { document.querySelector('[data-train-board]')?.click(); if (!window.__fi2.trainRide.active) window.__fi2.trainRide.board(); });
  await p.waitForTimeout(1200);
  await p.locator('[data-train-cam]').click(); await p.waitForTimeout(350);
  const r = await p.evaluate(() => { const b = (q) => { const e = document.querySelector(q); if (!e) return null; const r = e.getBoundingClientRect(); return r.width ? { l: Math.round(r.left), r: Math.round(r.right), t: Math.round(r.top), b: Math.round(r.bottom), w: Math.round(r.width), h: Math.round(r.height) } : null; };
    return { pill: b('[data-job-wallet]'), toast: b('[data-train-cam-toast]'), note: b('[data-train-note]'), menu: !!document.querySelector('[data-train-cam-menu],[role=menu]'), map: b('.travel-actions .minimap-toggle'), off: b('.travel-actions .travel-mode'), rec: b('.travel-actions .touch-juggle:not(.touch-walk)'), walk: b('.travel-actions .touch-walk'), horn: b('.travel-actions .touch-shoot'), view: window.__fi2.trainRide.view, vw: innerWidth }; });
  check('hud: a camera tap changes the view, no view list', r.view !== 'seat' && !r.menu, JSON.stringify({ view: r.view, menu: r.menu }));
  const say = await p.evaluate(() => document.querySelector('[data-train-cam-say]')?.textContent || '');
  check('hud: no visible view-name pill (owner image 55), the name only for screen readers', !r.toast && say.length > 2, JSON.stringify({ toast: r.toast, say }));
  // owner shot 52: no Get off button; Recenter | Map over Walk | Horn at the right edge (desktop: Recenter over Horn, Walk left of Horn)
  const al = (a, b) => a && b && Math.abs(a.l - b.l) < 6, row = (a, b) => a && b && Math.abs(a.t - b.t) < 8;
  const okPhone = r.map && al(r.rec, r.walk) && al(r.map, r.horn) && row(r.rec, r.map) && row(r.walk, r.horn) && r.map.l > r.rec.l;
  const okDesk = al(r.rec, r.horn) && row(r.walk, r.horn) && r.walk.l < r.horn.l && r.rec.t < r.horn.t;
  check(`hud (${phone ? 'phone' : 'desktop'}): no Get off in the cluster; ${phone ? 'Recenter | Map over Walk | Horn' : 'Recenter over Horn, Walk left of Horn'}, 44 px targets`, !r.off && (phone ? okPhone : okDesk) && [r.rec, r.walk, r.horn].every((x) => x && x.w >= 44 && x.h >= 44), JSON.stringify({ map: r.map, rec: r.rec, off: r.off, walk: r.walk, horn: r.horn }));
  if (shots) await p.screenshot({ path: path.join(shots, `hud-${phone ? 'phone' : 'desktop'}.png`) });
  await p.evaluate(() => window.__fi2.trainRide.setView('seat'));
  await leaveRide(p);
  if (phone) { const m = await p.evaluate(() => { const a = document.querySelector('.travel-actions .minimap-toggle')?.getBoundingClientRect(), t = document.querySelector('.travel-actions')?.hasAttribute('data-train-actions'); return { t, l: a ? Math.round(a.left) : -1 }; });
    check('hud: off the train the normal layout is back', !m.t, JSON.stringify(m)); }
}
// RIDE 3: Inside = first person (eye height in the aisle, my body hidden, roof on, look all round, WASD walks the way you look) and
// walk out to exit (through an open door at a stop: off the train, on the platform, the camera eases back out, my body shown again);
// view changes ease smoothly (no camera jump between frames, never inside the car body on an outside-to-outside change).
async function partInside(c) {
  const { p } = c;
  await settle(p);
  await standingTrainAt(p, 2);
  await p.evaluate(() => { const sp = window.__fi2.trainRide.stationSpot(2, 0); window.__fi2.teleport(sp.x, sp.z, sp.yaw + Math.PI); });
  await p.waitForTimeout(1200);
  await p.evaluate(() => { document.querySelector('[data-train-board]')?.click(); if (!window.__fi2.trainRide.active) window.__fi2.trainRide.board(); });
  await p.waitForTimeout(1300);
  const k = await p.evaluate(() => window.__fi2.trainRide.train);
  if (k < 0) { check('inside: riding', false); return; }
  // smooth view changes: seat -> front -> left (outside views), sampled every frame
  const ease = await p.evaluate(async (k) => { const f = window.__fi2, cam = f.camera, M = cam.matrixWorld.constructor, m = new M(), inv = new M(), q = cam.position.clone(); let inside = false, n = 0, prev = null, prevT = 0; const steps = {}, path = {}, spikes = [];
    for (const v of ['front', 'left']) { f.trainRide.setView(v); const t0 = performance.now();
      while (performance.now() - t0 < 1300) { await new Promise((r) => requestAnimationFrame(r)); const st = f.trains.states[k], cp = cam.position.clone();
        // relative to the train (it moves ~v*dt a frame): the step of the camera minus the train's own step
        f.trains.carMatrixOf(k, 0, m); const nose = new cp.constructor(m.elements[12], m.elements[13], m.elements[14]); const rel = cp.clone().sub(nose);
        const tn = performance.now(); if (prev) { const d = rel.distanceTo(prev); path[v] = (path[v] || 0) + d; (steps[v] = steps[v] || []).push(d); } prev = rel; prevT = tn; n++;
        for (let ci = 0; ci < 2; ci++) { f.trains.carMatrixOf(k, ci, m); inv.copy(m).invert(); q.copy(cp).applyMatrix4(inv); if (Math.abs(q.x) < 1.4 && q.y > 1.1 && q.y < 3.9 && Math.abs(q.z) < 6) inside = true; } } }
    // a jump: one frame's step far bigger than both neighbours' (the ease's steps change gradually from frame to frame)
    for (const v in steps) { const a = steps[v].filter((d) => d > 1e-4);/* frames the island skipped (phone 30 fps cap) */ for (let i = 1; i < a.length - 1; i++) if (a[i] > .6 && a[i] > 2.6 * Math.max(a[i - 1], a[i + 1])) spikes.push({ v, i, step: +a[i].toFixed(2), prev: +a[i - 1].toFixed(2), next: +a[i + 1].toFixed(2) }); }
    return { spikes: spikes.slice(0, 4), path: Object.fromEntries(Object.entries(path).map(([a, b]) => [a, +b.toFixed(1)])), inside, n }; }, k);
  check('views ease smoothly (no frame jump; never through the car)', ease.n > 20 && !ease.spikes.length && !ease.inside, JSON.stringify(ease));
  await p.evaluate(() => window.__fi2.trainRide.setView('inside')); await p.waitForTimeout(1500);
  const fp = await p.evaluate((k) => { const f = window.__fi2, cam = f.camera, M = cam.matrixWorld.constructor, m = new M(); const sp = f.trainRide.spot, car = sp.u >= -6.2 ? 0 : 1; f.trains.carMatrixOf(k, car, m); const q = cam.position.clone().applyMatrix4(m.clone().invert());
    return { view: f.trainRide.view, standing: f.trainRide.standing, eyeY: +(q.y - 1.15).toFixed(2), x: +q.x.toFixed(2), meShown: f.player ? f.player.root.visible : null, fov: +cam.fov.toFixed(1) }; }, k);
  check('inside: first person (eye 1.3-1.4 m over the floor in the aisle, roof on, my body hidden)', fp.view === 'inside' && fp.standing && fp.eyeY > 1.25 && fp.eyeY < 1.45 && Math.abs(fp.x) < 1.3 && fp.meShown !== true, JSON.stringify(fp));
  if (shots) await p.screenshot({ path: path.join(shots, `inside-fp-${phone ? 'phone' : 'desktop'}.png`) });
  // Kenji through the partition (owner shot 45: smaller, seated back at the desk): stand at car 0's cab partition looking ahead
  await p.evaluate(() => { const r = window.__fi2.trainRide; r.spot.x = .2; r.spot.u = 4.2; }); await p.waitForTimeout(700);
  const kj = await p.evaluate((k) => { const f = window.__fi2, K = f.kenji; if (!K || !K.root) return null; const M = f.camera.matrixWorld.constructor, m = new M(); f.trains.carMatrixOf(k, 0, m); const q = K.root.position.clone().applyMatrix4(m.clone().invert());
    return { shown: K.root.visible, k: K.at.k, scale: +K.root.scale.y.toFixed(2), z: +q.z.toFixed(2), y: +(q.y - 1.15).toFixed(2) }; }, k);
  check('Kenji at the desk, drawn smaller (owner shot 45)', kj && kj.k === k && kj.scale < 1 && kj.z > 4.9 && kj.z < 5.3, JSON.stringify(kj));
  if (shots) await p.screenshot({ path: path.join(shots, `kenji-partition-${phone ? 'phone' : 'desktop'}.png`) });
  // look round (owner shot 51, "unable to turn while inside"): the RENDERED camera's heading in the car frame (not the logical
  // camForward): a 90° drag (mouse on desktop, a touch on phones, right half), then ← held: each must turn the picture itself
  const camYaw = () => p.evaluate((k) => { const f = window.__fi2, cam = f.camera, M = cam.matrixWorld.constructor, m = new M(), sp = f.trainRide.spot, car = sp.u >= -6.2 ? 0 : 1; f.trains.carMatrixOf(k, car, m);
    const d = cam.getWorldDirection(cam.position.clone()).transformDirection(m.clone().invert()); return { yaw: Math.atan2(d.x, d.z), side: Math.abs(d.x) / Math.max(1e-6, Math.hypot(d.x, d.z)) }; }, k);
  const turned = (a, b) => Math.abs(((b.yaw - a.yaw + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
  const box = await p.locator('canvas').first().boundingBox(), y0 = box.y + box.height * .4, x0 = box.x + box.width * .78, w = Math.max(320, Math.min(1100, Math.min(vpW, vpH * 1.4))), dpx = Math.PI / 2 / 5.2 * w;
  const a0 = await camYaw();
  if (phone) { const cdp = await p.context().newCDPSession(p), T = (type, x) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y: y0, id: 7 }] });
    await T('touchStart', x0); for (let i = 1; i <= 12; i++) { await T('touchMove', x0 - dpx * i / 12); await p.waitForTimeout(16); } await T('touchEnd'); await cdp.detach(); }
  else { await p.mouse.move(x0, y0); await p.mouse.down(); for (let i = 1; i <= 12; i++) { await p.mouse.move(x0 - dpx * i / 12, y0); await p.waitForTimeout(16); } await p.mouse.up(); }
  await p.waitForTimeout(500); const a1 = await camYaw();
  check(`inside: a ${phone ? 'touch' : 'mouse'} drag of 90° turns the rendered view ~90° to a side window`, turned(a0, a1) > 1.2 && turned(a0, a1) < 1.95 && a1.side > .8, JSON.stringify({ a0, a1, turned: +turned(a0, a1).toFixed(2) }));
  if (shots) await p.screenshot({ path: path.join(shots, `inside-turned-${phone ? 'phone' : 'desktop'}.png`) });
  // POLISH 3: the release stops the turn (no flick in first person): the picture holds still after the finger lifts
  { await p.waitForTimeout(400); const a3 = await camYaw(); check('inside: the turn stops on release (no flick)', turned(a1, a3) < .03, JSON.stringify({ after: +turned(a1, a3).toFixed(3) })); }
  if (!phone) { await p.keyboard.down('ArrowLeft'); await p.waitForTimeout(700); await p.keyboard.up('ArrowLeft'); await p.waitForTimeout(300); const a2 = await camYaw();
    const sp = await p.evaluate(() => ({ x: window.__fi2.trainRide.spot.x, u: window.__fi2.trainRide.spot.u }));
    check('inside: ← turns the view (does not walk)', turned(a1, a2) > .8, JSON.stringify({ turned: +turned(a1, a2).toFixed(2), spot: sp })); }
  // POLISH 3: the release stops the turn (no flick in first person): the picture holds still after the finger lifts
  // Inside pressed straight after Seat (the walk to the seat can take 1.4 s) keeps you standing (POLISH 3: it was refused, W sat still)
  await p.evaluate(() => window.__fi2.trainRide.setView('seat')); await p.waitForTimeout(300); const reIn = await p.evaluate(() => window.__fi2.trainRide.setView('inside')); await p.waitForTimeout(900);
  const st = await p.evaluate(() => ({ standing: window.__fi2.trainRide.standing, view: window.__fi2.trainRide.view }));
  check('inside: Inside during the walk to a seat stays standing', reIn && st.standing && st.view === 'inside', JSON.stringify(st));
  const sp0 = await p.evaluate(() => ({ ...window.__fi2.trainRide.spot })); await p.keyboard.down('w'); await p.waitForTimeout(700); await p.keyboard.up('w');
  const sp1 = await p.evaluate(() => ({ ...window.__fi2.trainRide.spot }));
  check('inside: W walks the way you look (along the car)', Math.abs(sp1.u - sp0.u) > .3, `${sp0.u.toFixed(2)} -> ${sp1.u.toFixed(2)}`);
  if (phone && await p.evaluate(() => matchMedia('(pointer:coarse) and (max-width:600px),(pointer:coarse) and (max-height:500px)').matches)) { // the left half is the walking stick (a touch there never turns the view)
    const cdp = await p.context().newCDPSession(p), T = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y, id: 9 }] });
    const sx = box.x + box.width * .22, sy = box.y + box.height * .7, b0 = await camYaw(), q0 = await p.evaluate(() => ({ ...window.__fi2.trainRide.spot }));
    await T('touchStart', sx, sy); for (let i = 1; i <= 6; i++) { await T('touchMove', sx, sy - 12 * i); await p.waitForTimeout(16); } await p.waitForTimeout(800); await T('touchEnd'); await cdp.detach(); await p.waitForTimeout(300);
    const q1 = await p.evaluate(() => ({ ...window.__fi2.trainRide.spot })), b1 = await camYaw(), d = Math.hypot(q1.u - q0.u, q1.x - q0.x);
    check('inside: the left-half stick walks (and does not turn)', d > .3 && turned(b0, b1) < .05, JSON.stringify({ moved: +d.toFixed(2), turned: +turned(b0, b1).toFixed(3) }));
  }
  // walk out: the train brought into its next stop (doors open), stand in the open door's bay, walk toward the platform
  { const T = await p.evaluate((k) => { const f = window.__fi2, s = f.trains.sched, st = f.trains.states[k]; const stop = s.stops[st.at >= 0 ? st.at : st.next]; return stop.arrive + 3.5; }, k); await setLap(p, k, T); await p.waitForTimeout(900); }
  const door = await p.evaluate((k) => { const f = window.__fi2, M = f.camera.matrixWorld.constructor, m = new M(), o = { x: 0, y: 0, z: 0, yaw: 0, car: 0, door: 0 }, L = f.location; const ds = f.trains.doorSpot(k, L.x, L.z, o); if (!ds) return null;
    f.trains.carMatrixOf(k, o.car, m); const q = f.camera.position.clone().set(o.x, f.trains.states[k].s * 0 + 1.2, o.z).applyMatrix4(m.clone().invert()); const x = o.car ? -q.x : q.x, u = o.car ? -12.4 - q.z : q.z; f.trainRide.spot.x = 0; f.trainRide.spot.u = u; return { x: +x.toFixed(2), u: +u.toFixed(2), at: f.trains.states[k].at }; }, k);
  if (!door) { check('inside: a door open to walk out of', false); return; }
  await p.waitForTimeout(200);
  const key = door.x > 0 ? 'a' : 'd'; await p.keyboard.down(key); let off = false; for (let i = 0; i < 30 && !off; i++) { await p.waitForTimeout(100); off = !(await p.evaluate(() => window.__fi2.trainRide.active)); } await p.keyboard.up(key);
  await p.waitForTimeout(1400);
  const out = await p.evaluate(() => { const f = window.__fi2, c = f.camera.position, r = f.player.root.position; return { active: f.trainRide.active, camDist: +c.distanceTo(r).toFixed(1), meShown: f.player.root.visible, fov: +f.camera.fov.toFixed(1) }; });
  check('inside: walking out through the open door gets you off (camera back out, body shown)', off && !out.active && out.camDist > 4 && out.meShown, JSON.stringify({ door, out }));
  if (shots) await p.screenshot({ path: path.join(shots, `inside-walkout-${phone ? 'phone' : 'desktop'}.png`) });
}
// AAA 2 (owner: "buggy and jittery"): the screen position of what rides the train, sampled at every render of the island camera:
// the ridden car's middle, Kenji's head, a passenger, my rider (seat views) / the roof rider. Noise = how far a frame's point lies off
// the straight line between its neighbours (time-weighted by the frame timestamps, so a varying dt is not counted), px.
// fixed = every frame advances exactly 1/60 s (rAF timestamps, performance.now and Date.now on a virtual clock); else the real frames.
async function jitterRun(p, k, ms, fixed, roof) {
  return p.evaluate(async ({ k, ms, fixed, roof }) => {
    const f = window.__fi2, r = f.renderer, cam = f.camera, V = cam.position.constructor, M = cam.matrixWorld.constructor, m = new M(), q = new V();
    let scene = f.trains.root; while (scene.parent) scene = scene.parent;
    const W = r.domElement.clientWidth, H = r.domElement.clientHeight, rec = { car: [], kenji: [], pax: [], me: [] }, ts = [];
    // a passenger in the ridden train: the first pax instance within its middle's 13 m
    let paxMesh = null, paxN = -1; f.trains.carMatrixOf(k, 0, m); const c0 = new V().setFromMatrixPosition(m);
    scene.traverse((o) => { if (!paxMesh && o.isInstancedMesh && /^train-pax-/.test(o.name) && o.count > 0) { for (let n = 0; n < o.count; n++) { o.getMatrixAt(n, m); if (q.setFromMatrixPosition(m).distanceTo(c0) < 13) { paxMesh = o; paxN = n; break; } } } });
    const realRaf = window.requestAnimationFrame.bind(window), realPerf = performance.now.bind(performance), realDate = Date.now;
    let V0 = realPerf(), Vt = V0, lastTs = -1; const dBase = realDate() - V0;
    if (fixed) { window.requestAnimationFrame = (cb) => realRaf((t) => { if (t !== lastTs) { lastTs = t; Vt += 1000 / 60; } cb(Vt); }); performance.now = () => Vt; Date.now = () => dBase + Vt + (window.__skew || 0); }
    let rafTs = 0; const tap = (t) => { rafTs = t; if (live) realRaf2(tap); }; let live = true; const realRaf2 = window.requestAnimationFrame.bind(window); realRaf2(tap);
    const put = (arr, x, y, z) => { q.set(x, y, z).project(cam); arr.push(q.z < 1 && Math.abs(q.x) < 1.5 && Math.abs(q.y) < 1.5 ? [(q.x + 1) / 2 * W, (1 - q.y) / 2 * H] : null); };
    const orig = r.render; r.render = function (s, c) { if (c === cam) { cam.updateMatrixWorld(); ts.push(fixed ? Vt : rafTs);
        f.trains.carMatrixOf(k, 0, m); put(rec.car, m.elements[12] + m.elements[4] * 2.4, m.elements[13] + m.elements[5] * 2.4, m.elements[14] + m.elements[6] * 2.4);
        const K = f.kenji && f.kenji.root; if (K && K.visible) { K.updateWorldMatrix(true, false); put(rec.kenji, K.matrixWorld.elements[12], K.matrixWorld.elements[13] + 1.1, K.matrixWorld.elements[14]); } else rec.kenji.push(null);
        if (paxMesh && paxN < paxMesh.count) { paxMesh.getMatrixAt(paxN, m); m.premultiply(paxMesh.matrixWorld); put(rec.pax, m.elements[12], m.elements[13] + 1, m.elements[14]); } else rec.pax.push(null);
        const pr = f.player.root.position; put(rec.me, pr.x, pr.y + 1, pr.z); }
      return orig.apply(this, arguments); };
    const t0 = realPerf(); while (realPerf() - t0 < ms) await new Promise((res) => setTimeout(res, 100));
    r.render = orig; live = false; if (fixed) { window.requestAnimationFrame = realRaf; performance.now = realPerf; Date.now = realDate; }
    const out = { frames: ts.length, view: f.trainRide.view, v: +f.trains.states[k].s.toFixed(0) };
    for (const key in rec) { const a = rec[key], e = []; for (let i = 1; i < a.length - 1; i++) { const A = a[i - 1], B = a[i], C = a[i + 1]; if (!A || !B || !C) continue; const dt = ts[i + 1] - ts[i - 1]; if (!(dt > 0)) continue; const w = (ts[i] - ts[i - 1]) / dt;
        e.push(Math.hypot(B[0] - (A[0] + (C[0] - A[0]) * w), B[1] - (A[1] + (C[1] - A[1]) * w))); }
      e.sort((x, y) => x - y); out[key] = e.length > 10 ? { n: e.length, p50: +e[e.length >> 1].toFixed(2), p95: +e[Math.floor(e.length * .95)].toFixed(2), max: +e[e.length - 1].toFixed(2) } : null; }
    return out; }, { k, ms, fixed, roof });
}
async function partJitter(c) {
  const { p } = c;
  await settle(p);
  await standingTrainAt(p, 2);
  await p.evaluate(() => { const sp = window.__fi2.trainRide.stationSpot(2, 0); window.__fi2.teleport(sp.x, sp.z, sp.yaw + Math.PI); });
  await p.waitForTimeout(1200);
  await p.evaluate(() => { document.querySelector('[data-train-board]')?.click(); if (!window.__fi2.trainRide.active) window.__fi2.trainRide.board(); });
  await p.waitForTimeout(1300);
  const k = await p.evaluate(() => window.__fi2.trainRide.train);
  if (k < 0) { check('jitter: riding', false); return; }
  // full speed: put the ridden train 30 s past its South departure (cruise)
  const T = await p.evaluate((k) => { const s = window.__fi2.trains.sched, st = s.stops.find((x) => x.station.id === 'south'); return st.depart + 30; }, k);
  const results = [];
  for (const v of ['seat', 'driver', 'left', 'inside']) for (const fixed of [false, true]) {
    await setLap(p, k, T); await p.evaluate((v) => window.__fi2.trainRide.setView(v), v); await p.waitForTimeout(1800);
    const r = await jitterRun(p, k, 5000, fixed, false); results.push({ v, fixed, ...r });
    console.log(`  jitter ${v} ${fixed ? 'fixed dt' : 'real dt'}: ${r.frames} frames, car ${JSON.stringify(r.car)} kenji ${JSON.stringify(r.kenji)} pax ${JSON.stringify(r.pax)} me ${JSON.stringify(r.me)}`);
  }
  const worst = (r, key) => r[key] ? r[key].p95 : 0;
  for (const r of results) check(`jitter ${r.v} (${r.fixed ? 'fixed' : 'real'} dt): car / Kenji / passenger / me p95 < 0.5 px frame-to-frame noise`, r.frames > 30 && ['car', 'kenji', 'pax', 'me'].every((key) => worst(r, key) < .5), JSON.stringify({ car: r.car, kenji: r.kenji, pax: r.pax, me: r.me }));
  await p.evaluate(() => window.__fi2.trainRide.setView('seat'));
  await leaveRide(p);
}
// AAA 2 (owner shot 54, "riding the train from the top shakes the view"): on the roof at full speed on the South Bridge, a curve and
// before the tunnel: the roof rider and the car on screen, real and fixed dt.
async function partRoofJitter(c) {
  const { p } = c; await settle(p);
  const spots = await p.evaluate(() => { const s = window.__fi2.trains.sched, L = 2700; let br = 0, bb = -1e9; for (let q = 0; q < L; q += 2) { const y = s.bed(q); if (y > bb && y < 20) { bb = y; br = q; } }
    let cv = 0, ck = -1; for (let q = 0; q < L; q += 4) { const a = s.trackAt(q), b = s.trackAt((q + 8) % L), k = Math.abs(Math.atan2(a.tx * b.tz - a.tz * b.tx, a.tx * b.tx + a.tz * b.tz)); if (k > ck && Math.abs(q - br) > 200) { ck = k; cv = q; } }
    let w = 0, d = 1e9; for (let q = 0; q < L; q++) { const a = s.trackAt(q), e = Math.hypot(a.x - 538.5, a.z - 169.5); if (e < d) { d = e; w = q; } }
    return { bridge: br, curve: cv, tunnel: w - 40 }; });
  for (const [name, sAt] of Object.entries(spots)) {
    // the lap time train 0 is ~90 m before that spot, moving
    const T = await p.evaluate((sAt) => { const s = window.__fi2.trains.sched; for (let t = 0; t < 360; t += .1) { const st = s.trainAt(0, t); const d = ((sAt - 90 - st.s) % 2700 + 2700) % 2700; if (d < 4 && st.at < 0 && st.v > 8) return t; } return -1; }, sAt);
    if (T < 0) { check(`roof jitter ${name}: a moving train there`, false); continue; }
    const land = await landRoof(p, T); if (!land.ok) { check(`roof jitter ${name}: landed`, false, JSON.stringify(land)); await settle(p); continue; }
    await p.waitForTimeout(1200);
    for (const fixed of [false, true]) { const r = await jitterRun(p, 0, 3000, fixed, true);
      console.log(`  roof jitter ${name} ${fixed ? 'fixed' : 'real'} dt: ${r.frames} frames, car ${JSON.stringify(r.car)} me ${JSON.stringify(r.me)} roof ${await p.evaluate(() => window.__fi2.roofRide.k)}`);
      check(`roof jitter ${name} (${fixed ? 'fixed' : 'real'} dt): the roof rider and the car p95 < 0.5 px`, r.frames > 30 && r.car && r.me && r.car.p95 < .5 && r.me.p95 < .5, JSON.stringify({ car: r.car, me: r.me })); }
    if (shots) await p.screenshot({ path: path.join(shots, `roof-${name}-${phone ? 'phone' : 'desktop'}.png`) });
    await settle(p);
  }
}
// AAA 2 (owner: "landing on or near the train causes the view to shake"): a per-render recorder from the moment Land is pressed:
// my rider and car 0 on screen, the camera's offset from me, the surface (roof / ground), the shake sources (bonk). After the landing
// settles (0.4 s after I am on foot) the noise (as jitterRun) must stay < 0.5 px.
const recStart = (p, k) => p.evaluate((k) => { const f = window.__fi2, r = f.renderer, cam = f.camera, V = cam.position.constructor, M = cam.matrixWorld.constructor, m = new M(), q = new V(), W = r.domElement.clientWidth, H = r.domElement.clientHeight;
  const rec = window.__rec = []; let ts = 0; const tap = (t) => { ts = t; if (window.__rec === rec) requestAnimationFrame(tap); }; requestAnimationFrame(tap);
  const px = (x, y, z) => { q.set(x, y, z).project(cam); return [(q.x + 1) / 2 * W, (1 - q.y) / 2 * H]; };
  const orig = window.__recOrig = r.render; r.render = function (s, c) { if (c === cam) { cam.updateMatrixWorld(); const pr = f.player.root.position; f.trains.carMatrixOf(k, 0, m);
      rec.push({ t: ts, me: px(pr.x, pr.y + 1, pr.z), car: px(m.elements[12], m.elements[13] + 2.4, m.elements[14]), off: [cam.position.x - pr.x, cam.position.y - pr.y, cam.position.z - pr.z].map((x) => +x.toFixed(2)), ride: f.rideRef.current, roof: f.roofRide.k, bonk: !!(f.trainBonk && f.trainBonk.active) }); }
    return orig.apply(this, arguments); }; }, k);
const recStop = (p) => p.evaluate(() => { const f = window.__fi2, rec = window.__rec; window.__rec = null; f.renderer.render = window.__recOrig;
  let on = rec.findIndex((x, i) => x.roof >= 0 && i > 0 && rec[i - 1].roof < 0);/* POLISH 3: the roof ATTACH (a full run arrives here still flagged on the last part's roof: frame 0 counted as landed) */ if (on < 0) { const j = rec.findIndex((x) => x.ride === 'jetpack'); on = j < 0 ? -1 : rec.findIndex((x, i) => i > j && x.ride === 'walk'); } const t0 = on >= 0 ? rec[on].t + 400 : Infinity, out = { frames: rec.length, landedAt: on, bonk: rec.some((x) => x.bonk), roof: Math.max(...rec.map((x) => x.roof)) };
  for (const key of ['me', 'car']) { const e = []; for (let i = 1; i < rec.length - 1; i++) { if (rec[i - 1].t < t0) continue; const A = rec[i - 1][key], B = rec[i][key], C = rec[i + 1][key], dt = rec[i + 1].t - rec[i - 1].t; if (!(dt > 0)) continue; const w = (rec[i].t - rec[i - 1].t) / dt;
      e.push(Math.hypot(B[0] - (A[0] + (C[0] - A[0]) * w), B[1] - (A[1] + (C[1] - A[1]) * w))); }
    e.sort((a, b) => a - b); out[key] = e.length > 10 ? { n: e.length, p95: +e[Math.floor(e.length * .95)].toFixed(2), max: +e[e.length - 1].toFixed(2) } : null; }
  // the first 3 s after landing, every 6th frame: what the camera did (for the audit)
  out.trace = rec.slice(Math.max(0, on), Math.max(0, on) + 180).filter((_, i) => i % 30 === 0).map((x) => ({ off: x.off, ride: x.ride, roof: x.roof, bonk: x.bonk }));
  return out; });
async function partLanding(c) {
  const { p } = c; await settle(p);
  const report = (name, r) => { console.log(`  landing ${name}: ${JSON.stringify({ frames: r.frames, landedAt: r.landedAt, bonk: r.bonk, roof: r.roof, me: r.me, car: r.car })}\n    trace ${JSON.stringify(r.trace)}`);
    check(`landing ${name}: no shake after it settles (me / car p95 < 0.5 px from 0.4 s on foot)`, r.landedAt >= 0 && r.me && r.me.p95 < .5 && (!r.car || r.car.p95 < .5), JSON.stringify({ me: r.me, car: r.car, bonk: r.bonk })); };
  // 1. onto a moving roof (jetpack Land)
  { const T = await p.evaluate(() => { const s = window.__fi2.trains.sched; for (let t = 0; t < 360; t += .1) { const st = s.trainAt(0, t); if (st.at < 0 && st.v > 12) return t; } return 0; });
    await recStart(p, 0); const land = await landRoof(p, T); await p.waitForTimeout(3000); const r = await recStop(p); report('on a moving roof', r); if (!land.ok) check('landing: on the roof', false, JSON.stringify(land)); await settle(p); }
  // 2. on the ground 4 m beside a moving train, 3. beside a train standing at South (on its platform)
  for (const [name, moving] of [['beside a moving train', true], ['beside a stopped train', false]]) {
    if (moving) { const T = await p.evaluate(() => { const s = window.__fi2.trains.sched; for (let t = 0; t < 360; t += .1) { const st = s.trainAt(0, t); if (st.at < 0 && st.v > 12) return t; } return 0; }); await setLap(p, 0, T); await p.waitForTimeout(300);
      await p.evaluate(() => { const f = window.__fi2, t = f.trains, o = { x: 0, y: 0, z: 0, yaw: 0 }; t.standAt(0, 0, -30, 0, o, undefined, 3.75); const m = new f.camera.matrixWorld.constructor(); t.carMatrixOf(0, 0, m); const e = m.elements, l = Math.hypot(e[0], e[2]); f.teleport(o.x + e[0] / l * 4.2, o.z + e[2] / l * 4.2, 0); }); }
    else { await standingTrainAt(p, 2); await p.evaluate(() => { const sp = window.__fi2.trainRide.stationSpot(2, 0); window.__fi2.teleport(sp.x, sp.z, sp.yaw); }); }
    await p.evaluate(() => window.__fi2.selectRide('jetpack')); await p.waitForTimeout(2200);
    const k = 0; await recStart(p, moving ? 0 : await p.evaluate(() => { const f = window.__fi2, L = f.location; let b = 0, bd = 1e9; for (let i = 0; i < 3; i++) { const m = new f.camera.matrixWorld.constructor(); f.trains.carMatrixOf(i, 0, m); const d = Math.hypot(m.elements[12] - L.x, m.elements[14] - L.z); if (d < bd) { bd = d; b = i; } } return b; }));
    await p.evaluate(() => window.__fi2.selectRide('walk')); await p.waitForTimeout(4500); const r = await recStop(p); report(name, r); await settle(p); }
}
async function partRoof(c) {
  const { p } = c; await settle(p); const tw = await p.evaluate(() => { const s = window.__fi2.trains.sched; let best = 0, bd = 1e9; for (let q = 0; q < 2700; q++) { const a = s.trackAt(q), d = Math.hypot(a.x - 538.5, a.z - 169.5); if (d < bd) { bd = d; best = q; } } return best; });
  const T = await p.evaluate((W) => { const s = window.__fi2.trains.sched; for (let t = 0; t < 360; t += .1) { const st = s.trainAt(0, t); if (((W - 260 - st.s) % 2700 + 2700) % 2700 < 3) return t; } return 0; }, tw);
  let landed = await landRoof(p, T); if (!landed.ok) { console.log('  (first Land missed the roof at a slow headless frame: once more, a lap later) ' + JSON.stringify(landed)); try { await p.evaluate(() => window.__fi2.selectRide('walk')); } catch { /* */ } await p.waitForTimeout(3000); landed = await landRoof(p, T); }
  check('jetpack Land over a moving train: onto its roof', landed.ok, JSON.stringify(landed));
  if (!landed.ok) return;
  const ride = await p.evaluate(async () => { const f = window.__fi2, t = f.trains; let maxErr = 0, speed = 0, n = 0; const o = { x: 0, y: 0, z: 0, yaw: 0 };
    for (let i = 0; i < 90 && f.roofRide.k >= 0; i++) { await new Promise((r) => requestAnimationFrame(r)); t.standAt(f.roofRide.k, f.roofRide.x, f.roofRide.u, 0, o, undefined, 3.7); maxErr = Math.max(maxErr, Math.hypot(o.x - f.location.x, o.z - f.location.z)); speed = Math.max(speed, t.states[f.roofRide.k].v); n++; }
    return { maxErr: +maxErr.toFixed(2), speed: +speed.toFixed(1), n, still: f.roofRide.k >= 0 }; });
  check('riding the roof at speed: stays on the car (train-relative)', ride.still && ride.maxErr < .3 && ride.speed > 5, JSON.stringify(ride));
  if (shots) await p.screenshot({ path: path.join(shots, `roof-ride-${phone ? 'phone' : 'desktop'}.png`) });
  // Looks 2 (owner shot 38): the whole roof is walkable end to end at speed, straight down the middle over the AC lids and the
  // pantograph base (step-ups, never walls): from car 0's front end to car 1's far end, the feet rising onto each unit
  {const dir = await p.evaluate(() => { const f = window.__fi2, t = f.trains, a = { x: 0, y: 0, z: 0, yaw: 0 }, b = { x: 0, y: 0, z: 0, yaw: 0 }; f.roofRide.u = 5.75; f.roofRide.x = 0; t.standAt(f.roofRide.k, 0, 0, 0, a); t.standAt(f.roofRide.k, 0, -1, 0, b); return { x: b.x - a.x, z: b.z - a.z }; });
   const kw = keysToward(dir.x, dir.z);
   await p.evaluate(() => { const f = window.__fi2; window.__look2Probe = () => { const t = f.trains, o = { x: 0, y: 0, z: 0, yaw: 0 }; t.standAt(f.roofRide.k, f.roofRide.x, f.roofRide.u, 0, o, undefined, 2.6); return f.rooftop.state.height - o.y - (3.75 - 2.6); }; });
   for (const k of kw.keys) await p.keyboard.down(k);
   let res = null; try { res = await p.evaluate(async () => { const f = window.__fi2, t0 = performance.now(); let minU = 9, maxLift = -1, minV = 99, off = false;
     while (performance.now() - t0 < 16000) { await new Promise((r) => requestAnimationFrame(r)); if (f.roofRide.k < 0) { off = true; break; } f.roofRide.x = 0;/* down the middle, over every unit (the keys are screen-relative) */ minU = Math.min(minU, f.roofRide.u); maxLift = Math.max(maxLift, window.__look2Probe()); minV = Math.min(minV, f.trains.states[f.roofRide.k].v); if (f.roofRide.u < -17.9) break; }
     return { off, minU: +minU.toFixed(2), maxLift: +maxLift.toFixed(2), minV: +minV.toFixed(1), s: +((performance.now() - t0) / 1000).toFixed(1) }; }); } finally { for (const k of kw.keys) await p.keyboard.up(k); }
   check('walking the whole roof end to end at speed, down the middle (AC lids and pantograph base are step-ups, never walls)', res && !res.off && res.minU < -17.8 && res.maxLift > .2 && res.maxLift < .35 && res.minV > 3, JSON.stringify({ ...res, keys: kw.keys.join('+') }));}
  const bonk = await p.evaluate(async () => { const f = window.__fi2, t0 = performance.now(); let bonked = false, line = '';
    while (performance.now() - t0 < 80000) { await new Promise((r) => requestAnimationFrame(r)); if (f.trainBonk.active) { bonked = true; } if (bonked && !f.trainBonk.active) break; }
    await new Promise((r) => setTimeout(r, 300)); const s = window.__fi2.trains.sched; let best = 1e9; for (let q = 0; q < 2700; q += .5) { const a = s.trackAt(q); best = Math.min(best, Math.hypot(a.x - f.location.x, a.z - f.location.z)); }
    return { st: f.trains.states[0].s.toFixed(1)+'/'+f.trains.states[0].v.toFixed(1)+'/'+f.trains.states[0].at, u: +f.roofRide.u.toFixed(2), bonked, off: f.roofRide.k < 0, dLine: +best.toFixed(1), y: +f.rooftop.state.height.toFixed(2), dizzy: f.rooftop.state.recovery > 0, water: !!f.water?.inWater, x: +f.location.x.toFixed(1), z: +f.location.z.toFixed(1) }; });
  check('tunnel portal: bonked off the roof onto the ground beside the line (clear of the car side: > 1.9 m from the centre; not the tunnel, not the sea), dizzy', bonk.bonked && bonk.off && bonk.dLine > 1.9 && !bonk.water, JSON.stringify(bonk));
  if (shots) { await p.waitForTimeout(150); await p.screenshot({ path: path.join(shots, `roof-bonk-${phone ? 'phone' : 'desktop'}.png`) }); }
  // a full lap later, back on the same car: jump car to car (the hop over the gap lands on the next car), then take off with the
  // jetpack from the roof (rises from roof height, no snap to the ground) and Land back on
  const again = await landRoof(p, T);
  check('landing on the roof again (a lap later)', again.ok, JSON.stringify(again));
  if (again.ok) {
    await p.waitForTimeout(1300);
    const back = await p.evaluate(() => { const t = window.__fi2.trains, a = { x: 0, y: 0, z: 0, yaw: 0 }, b = { x: 0, y: 0, z: 0, yaw: 0 }; window.__fi2.roofRide.u = -4.6; window.__fi2.roofRide.x = 0; t.standAt(0, 0, 0, 0, a); t.standAt(0, 0, -1, 0, b); return { x: b.x - a.x, z: b.z - a.z }; });
    const kb = keysToward(back.x, back.z); for (const k of kb.keys) await p.keyboard.down(k);
    let hop = null; try { await p.waitForTimeout(350); await p.keyboard.down('Space'); await p.waitForTimeout(160); await p.keyboard.up('Space');
      hop = await p.evaluate(async () => { const f = window.__fi2, t0 = performance.now(); let hopped = false, minY = 1e9; while (performance.now() - t0 < 2500) { await new Promise((r) => requestAnimationFrame(r)); if (f.roofRide.hop) { hopped = true; minY = Math.min(minY, f.rooftop.state.height); } if (hopped && !f.roofRide.hop) break; }
        return { hopped, k: f.roofRide.k, u: +f.roofRide.u.toFixed(2), minY: +minY.toFixed(2), y: +f.rooftop.state.height.toFixed(2) }; });
    } finally { for (const k of kb.keys) await p.keyboard.up(k); }
    check('jumping car to car: the hop from car 0\'s end lands on car 1 (not through the gap)', hop && hop.hopped && hop.k === 0 && hop.u < -6.2, JSON.stringify({ ...hop, keys: kb.keys.join('+') }));
    const roofY0 = await p.evaluate(() => window.__fi2.rooftop.state.height);
    const up = await p.evaluate(async () => { const f = window.__fi2; f.selectRide('jetpack'); const t0 = performance.now(); let minY = 1e9, maxY = -1e9;
      while (performance.now() - t0 < 2000) { await new Promise((r) => requestAnimationFrame(r)); const y = f.flight.height; minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
      return { ride: f.rideRef.current, off: f.roofRide.k < 0, minY: +minY.toFixed(2), maxY: +maxY.toFixed(2) }; });
    check('jetpack take-off from the roof: off the roof and rising from roof height (no drop to the ground first)', up.ride === 'jetpack' && up.off && up.minY > roofY0 - .6 && up.maxY > roofY0 + 1.5, JSON.stringify({ roofY: +roofY0.toFixed(2), ...up }));
    await p.evaluate(() => window.__fi2.selectRide('walk')); await p.waitForTimeout(3000);
  }
  // Release blocker (Nov 24 2026): Land over a moving roof must be reliable: N more tries (--roof-runs, default 10), at least 90 % onto
  // the roof. Each try starts on foot, off any roof (settle), no retry inside a try.
  const N = +arg('roof-runs', '10'); let ok = 0; const miss = [];
  for (let i = 0; i < N; i++) { await settle(p); const r = await landRoof(p, T); if (r.ok) ok++; else miss.push(r); }
  check(`jetpack Land over a moving roof: reliable (${ok} of ${N} tries onto the roof, need 90 %)`, ok >= Math.ceil(N * .9), JSON.stringify(miss.slice(0, 2)));
  await settle(p);
}
const OWNER_SPOTS = [
  ['1-south-coast', 125, 226], ['2-palm-trestle', -10, 101], ['3-shore-wall', 30, 140], ['4-south-station', 160, 223], ['5-east-hill', 664, 51],
  ['6-west-portal', 538.5, 169.5], ['8-ferry-beach', 236, 242], ['10-palm-umbrellas', -5, 115], ['11-ballast', 300, 242], ['12-xing-deck', 80, -207],
  ['13-west-beach-xing', -305, -52], ['14-station-house', -305, -30], ['bridge-crest', 348, 243],
];
// POLISH 3 (owner shot 59): the trains' night lights. Run with --time=night. Shots at a station, the beach line, the tunnel mouth and
// the Seat view; the glow's draw cost (calls with it on minus off, same frame set) must stay within +8 per view.
async function nightView(p, name) {
  await p.waitForTimeout(1200);
  const r = await p.evaluate(async () => { const f = window.__fi2, info = f.renderer.info.render, g = f.scene.getObjectByName('train-night-glow');
    const calls = async (off) => { f.trains.glowOff = off; let a = 0; for (let i = 0; i < 12; i++) { await new Promise((r) => requestAnimationFrame(r)); if (i >= 4) a += info.calls; } return a / 8; };
    const on = await calls(false), shown = !!g && g.visible, n = g ? g.count : 0, off = await calls(true); f.trains.glowOff = false; await new Promise((r) => requestAnimationFrame(r));
    return { on: +on.toFixed(1), off: +off.toFixed(1), shown, n }; });
  check(`night ${name}: the glow is drawn, within +8 draws`, r.shown && r.n > 0 && r.on - r.off <= 8, JSON.stringify(r));
  if (shots) { await p.waitForTimeout(300); await p.screenshot({ path: path.join(shots, `night-${name}-${phone ? 'phone' : 'desktop'}.png`) }); }
}
async function partNight(c) {
  const { p } = c;
  await settle(p);
  const night = await p.evaluate(() => window.__fi2.trains && (localStorage.getItem('fi2-time-of-day') || ''));
  if (night !== 'night') { check('night: run with --time=night', false, night); return; }
  // a station: train 0 standing at South, me on the platform looking at it
  await standingTrainAt(p, 2);
  await p.evaluate(() => { const sp = window.__fi2.trainRide.stationSpot(2, 6); window.__fi2.teleport(sp.x, sp.z, sp.yaw + Math.PI); });
  await nightView(p, 'station');
  // the beach line (owner shot 59) and the tunnel mouth: the three trains pinned (cluster) on the line, me beside it
  const spot = (s, off, back, look = 0) => p.evaluate(({ s, off, back, look }) => { const f = window.__fi2, sc = f.trains.sched, a = sc.trackAt(s + look), b = sc.trackAt(s - back), nx = b.tz, nz = -b.tx;
    const x = b.x + nx * off, z = b.z + nz * off; f.teleport(x, z, Math.atan2(-(a.x - x), -(a.z - z))); }, { s, off, back, look });
  const beach = await p.evaluate(() => { const sc = window.__fi2.trains.sched, x = sc.crossings.find((c) => /beach/i.test(c.id)) || sc.crossings[0]; return x.s; });
  await p.evaluate((s) => { window.__fi2.trains.cluster = s; }, beach + 40); await spot(beach + 32, 9, 0);
  await nightView(p, 'beach');
  const mouth = await p.evaluate(() => window.__fi2.trains.sched.tunnelS[0]);
  await p.evaluate((s) => { window.__fi2.trains.cluster = s; }, mouth - 8); await spot(mouth, 5, 2, 14);
  await nightView(p, 'tunnel');
  await p.evaluate(() => { window.__fi2.trains.cluster = NaN; });
  // the Seat view, riding from South at night
  await settle(p); await standingTrainAt(p, 2);
  await p.evaluate(() => { const sp = window.__fi2.trainRide.stationSpot(2, 0); window.__fi2.teleport(sp.x, sp.z, sp.yaw + Math.PI); }); await p.waitForTimeout(1500);
  await p.evaluate(() => { document.querySelector('[data-train-board]')?.click(); if (!window.__fi2.trainRide.active) window.__fi2.trainRide.board(); }); await p.waitForTimeout(800);
  const k = await p.evaluate(() => window.__fi2.trainRide.train); if (k < 0) { check('night: riding', false); return; }
  for (let i = 0; i < 40; i++) { if ((await p.evaluate((k) => window.__fi2.trains.states[k].at, k)) < 0) break; await p.waitForTimeout(500); }
  await p.evaluate(() => window.__fi2.trainRide.setView('seat')); await p.waitForTimeout(2500);
  await nightView(p, 'seat');
  await leaveRide(p);
}
async function partShots(c) {
  const { p } = c;
  if (!shots) { console.log('shots: no --shots dir'); return; }
  await p.keyboard.press('Escape'); await p.waitForTimeout(500);
  for (const [name, x, z] of OWNER_SPOTS) { await tp(p, x, z); await p.waitForTimeout(2500); await p.screenshot({ path: path.join(shots, `owner-${name}.png`) }); }
  check('owner-shot places captured', true, `${OWNER_SPOTS.length} images in ${shots}`);
}
// The loading gauge: every vertex of every drawn mesh (instances applied; rigs by their root) that pokes into the space a car sweeps:
// within 1.7 m of the rail centre (car half width 1.4 + 0.3) and 1.25…3.95 m over the bed. Nothing may be there (owner: "nothing on
// the tracks"), except people (they stop the train) and the train itself.
async function partGauge(c) {
  const { p } = c;
  const r = await p.evaluate(() => { const f = window.__fi2, sc = f.trains.sched, T = f.scene.getObjectByName('island-line-trains');
    const N = 1350, xs = new Float64Array(N), zs = new Float64Array(N), beds = new Float64Array(N), grid = new Map(), G = 8;
    for (let i = 0; i < N; i++) { const a = sc.trackAt(i * 2); xs[i] = a.x; zs[i] = a.z; beds[i] = sc.bed(i * 2); const k = Math.floor(a.x / G) + ',' + Math.floor(a.z / G); if (!grid.has(k)) grid.set(k, []); grid.get(k).push(i); }
    const near = (x, z) => { let bd = 9, bi = -1; const gx = Math.floor(x / G), gz = Math.floor(z / G); for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) { const l = grid.get((gx + dx) + ',' + (gz + dz)); if (!l) continue; for (const i of l) { const d = (xs[i] - x) ** 2 + (zs[i] - z) ** 2; if (d < bd) { bd = d; bi = i; } } } return bi; };
    // the lateral distance to the polyline (segment from the nearest sample to either neighbour)
    const lat = (x, z, i) => { let best = 1e9; for (const j of [(i + N - 1) % N, (i + 1) % N]) { const ax = xs[i], az = zs[i], bx = xs[j] - ax, bz = zs[j] - az, L2 = bx * bx + bz * bz, t = Math.max(0, Math.min(1, ((x - ax) * bx + (z - az) * bz) / L2)); best = Math.min(best, Math.hypot(x - ax - bx * t, z - az - bz * t)); } return best; };
    const hits = new Map(); let verts = 0; const v = { x: 0, y: 0, z: 0 }, M = new f.camera.matrixWorld.constructor(), W = new f.camera.matrixWorld.constructor();
    // stations (platforms 1.45 m out at .55 m) and crossings (decks, machines) are allowed in the low band
    const zones = [...sc.stops.map((st) => [st.station.s, 18]), ...sc.crossings.map((c) => [c.s, c.width / 2 + 3])];
    const zoned = (i) => { const s0 = i * 2; for (const [s, h] of zones) { let d = Math.abs(s0 - s) % 2700; if (d > 1350) d = 2700 - d; if (d < h) return true; } return false; };
    const test = (name, x, y, z) => { const i = near(x, z); if (i < 0) return; const h = y - beds[i]; if (h < .45 || h > 3.95) return; const l = lat(x, z, i);
      if (h >= 1.25 ? l > 1.7 : (l > 1.95 || zoned(i))) return;/* upper band: the car body; lower band (.45-1.25 m, above sleepers + rails): bogies, steps */
      name = (h < 1.25 ? 'LOW ' : '') + name;
      const k = name + '@' + Math.round(x / 10) + ',' + Math.round(z / 10); const o = hits.get(k) || { n: 0, x: Math.round(x), z: Math.round(z), h: +h.toFixed(2), lo: [1e9, 1e9, 1e9], hi: [-1e9, -1e9, -1e9] }; o.n++;
      o.lo = [Math.min(o.lo[0], x), Math.min(o.lo[1], y), Math.min(o.lo[2], z)].map((q) => +q.toFixed(2)); o.hi = [Math.max(o.hi[0], x), Math.max(o.hi[1], y), Math.max(o.hi[2], z)].map((q) => +q.toFixed(2)); hits.set(k, o); };
    f.scene.updateMatrixWorld(true);
    f.scene.traverse((o) => { if (T && (o === T || o.parent === T)) return; if (/car-body|traffic|vehicle/i.test(o.name)) return;/* road traffic: checked at the causeway barrier instead */
      if (o.isSkinnedMesh) { const e = o.matrixWorld.elements; test('rig:' + (o.parent?.name || o.name || '?'), e[12], e[13] + 1.6, e[14]); return; }
      if (!o.isMesh || !o.geometry?.attributes?.position) return; const pos = o.geometry.attributes.position, n = pos.count; if (n > 400000) return;
      const name = (o.name || o.parent?.name || o.type) + (o.material?.name ? '/' + o.material.name : '');
      const one = (mat) => { const e = mat.elements; for (let q = 0; q < n; q++) { const x0 = pos.getX(q), y0 = pos.getY(q), z0 = pos.getZ(q); verts++;
        test(name, e[0] * x0 + e[4] * y0 + e[8] * z0 + e[12], e[1] * x0 + e[5] * y0 + e[9] * z0 + e[13], e[2] * x0 + e[6] * y0 + e[10] * z0 + e[14]); } };
      if (o.isInstancedMesh) { for (let k = 0; k < o.count; k++) { o.getMatrixAt(k, M); W.multiplyMatrices(o.matrixWorld, M); one(W); } } else one(o.matrixWorld); });
    return { verts, hits: [...hits.entries()].map(([k, o]) => ({ k, ...o })).sort((a, b) => b.n - a.n) }; });
  console.log(`gauge: ${r.verts} vertices scanned`);
  for (const h of r.hits.slice(0, 30)) console.log(`  in the gauge: ${h.k.replace(/[0-9a-f]{8}-[0-9a-f-]{27}/, 'uuid')} ×${h.n} h ${h.h} box ${JSON.stringify(h.lo)}…${JSON.stringify(h.hi)}`);
  check('loading gauge: nothing pokes into the space a car sweeps', r.hits.filter((h) => !/^rig:/.test(h.k)).length === 0, `${r.hits.length} objects`);
}
// --spot=x,z,lead[,name]; ...: train 0's front `lead` m past the track point nearest (x, z), the player 9 m off the line on the camera's
// side, one screenshot each (a look at portals, bridges, crossings with a train in them).
async function partSpot(c) {
  const { p } = c;
  for (const sp of arg('spot', '').split(';').filter(Boolean)) {
    const [x, z, lead, name] = sp.split(','); 
    await p.evaluate(({ x, z, lead }) => { const f = window.__fi2, sc = f.trains.sched; let b = 0, bd = 1e9; for (let q = 0; q < 2700; q++) { const a = sc.trackAt(q), d = Math.hypot(a.x - x, a.z - z); if (d < bd) { bd = d; b = q; } }
      const target = (b + lead + 2700) % 2700; let T = 0, best = 1e9; for (let t = 0; t < 360; t += .1) { const st = sc.trainAt(0, t); const d = Math.abs(st.s - target); if (d < best && st.at < 0) { best = d; T = t; } }
      const P = sc.trainPhase(0, sc.clock()); window.__skew += (((T - P) % 360) + 360) % 360 * 1000;
      const a = sc.trackAt(b), cam = f.camera.position, l = f.location, nx = a.tz, nz = -a.tx, side = ((cam.x - l.x) * nx + (cam.z - l.z) * nz) > 0 ? 1 : -1;
      f.teleport(a.x + nx * side * 9, a.z + nz * side * 9, 0); }, { x: +x, z: +z, lead: +lead });
    await p.waitForTimeout(2500); if (shots) await p.screenshot({ path: path.join(shots, `spot-${name || x + '_' + z}.png`) });
  }
  check('spots captured', true);
}
async function frames(p, ms) { return p.evaluate(async (ms) => { const f = window.__fi2, r = f.renderer, dts = [], calls = []; let last = performance.now(); const t0 = last;
  while (performance.now() - t0 < ms) { await new Promise((res) => requestAnimationFrame(res)); const n = performance.now(); dts.push(n - last); last = n; calls.push(r.info.render.calls); }
  dts.sort((a, b) => a - b); calls.sort((a, b) => a - b); const q = (a, k) => a[Math.min(a.length - 1, Math.floor(a.length * k))];
  return { p50: +q(dts, .5).toFixed(1), p95: +q(dts, .95).toFixed(1), max: +dts[dts.length - 1].toFixed(1), n: dts.length, calls: q(calls, .5) }; }, ms); }
// A/B frame time at fixed places (run once with --notrain=1, once without, same build, nothing else running): no train needed.
async function partPerfAB(c) {
  const { p } = c;
  const places = [['south-platform', null], ['palm-coast', [-5, 115]], ['causeway', [492, -152]], ['summit-portal', [530, 178]]];
  for (const [name, at] of places) {
    if (at) await tp(p, at[0], at[1]); else await p.evaluate(() => { const sp = window.__fi2.trainRide.stationSpot(2, 0); window.__fi2.teleport(sp.x, sp.z, sp.yaw + Math.PI); });
    await p.waitForTimeout(3000); const r = await frames(p, 10000);
    console.log(`perfab ${noTrain ? 'NO-TRAIN' : 'TRAIN'} ${name}: p50 ${r.p50} p95 ${r.p95} max ${r.max} ms, ${r.n} frames, ${r.calls} calls`);
  }
  check('perf A/B measured', true);
}
async function partPerf(c) {
  const { p } = c;
  // busiest station (South: museum + ferry dock + boardwalk) with a train standing in, then riding the next run
  await standingTrainAt(p, 2);
  await p.evaluate(() => { const sp = window.__fi2.trainRide.stationSpot(2, 0); window.__fi2.teleport(sp.x, sp.z, sp.yaw + Math.PI); });
  await p.waitForTimeout(3000);
  const st = await frames(p, 10000); console.log(`perf station (South, train in): p50 ${st.p50} p95 ${st.p95} max ${st.max} ms, ${st.n} frames, ${st.calls} calls`);
  await p.evaluate(() => { document.querySelector('[data-train-board]')?.click(); if (!window.__fi2.trainRide.active) window.__fi2.trainRide.board(); });
  await p.waitForTimeout(1000);
  const heap0 = await p.evaluate(() => performance.memory ? performance.memory.usedJSHeapSize : 0);
  const rd = await frames(p, 30000); console.log(`perf riding (South → Summit, bridge): p50 ${rd.p50} p95 ${rd.p95} max ${rd.max} ms, ${rd.n} frames, ${rd.calls} calls`);
  const heap1 = await p.evaluate(() => performance.memory ? performance.memory.usedJSHeapSize : 0);
  console.log(`heap while riding 30 s: ${(heap0 / 1e6).toFixed(1)} → ${(heap1 / 1e6).toFixed(1)} MB`);
  check('perf measured', st.n > 10 && rd.n > 10);
  await p.evaluate(() => window.__fi2.trainRide.finish());
}
(async () => {
  const args = ['--mute-audio', '--enable-precise-memory-info'];
  if (gpu === 'swiftshader') args.push('--use-angle=swiftshader', '--enable-unsafe-swiftshader'); else args.push('--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist');
  const b = await chromium.launch({ channel: 'chrome', headless: true, args });
  try {
    const vpArg = arg('vp', ''), vp = vpArg ? { width: +vpArg.split('x')[0], height: +vpArg.split('x')[1] } : phone ? (landscape ? { width: 844, height: 390 } : { width: 390, height: 844 }) : { width: 1440, height: 900 }; vpW = vp.width; vpH = vp.height;
    const c = await boot(b, vp, phone);
    const gl = await c.p.evaluate(() => { const g = window.__fi2.renderer.getContext(), e = g.getExtension('WEBGL_debug_renderer_info'); return e ? g.getParameter(e.UNMASKED_RENDERER_WEBGL) : '?'; });
    console.log(`viewport ${vp.width}x${vp.height}, GL ${gl}`);
    // phones are portrait only on the island (owner, Oct 24 2026: components/RotateLock.tsx): landscape shows the turn-upright card
    if (phone && landscape && !vpArg) { const lock = await c.p.evaluate(() => { const e = document.querySelector('[class*="RotateLock_lock"]'); return !!e && getComputedStyle(e).display !== 'none' && document.elementFromPoint(innerWidth / 2, innerHeight / 2) === e.closest('[class*="RotateLock_lock"]') || !!document.elementFromPoint(innerWidth / 2, innerHeight / 2)?.closest('[class*="RotateLock_lock"]'); });
      check('phone landscape: the island asks to turn upright (portrait only), touches never reach the canvas', lock); parts.length = 0; }
    for (const part of parts) {
      try { await ({ perfab: partPerfAB, spot: partSpot, gauge: partGauge, xings: partXings, vending: partVending, ride: partRide, views: partViews, framing: partFraming, hud: partHud, inside: partInside, jitter: partJitter, roofjitter: partRoofJitter, landing: partLanding, track: partTrack, deck: partDeck, roof: partRoof, shots: partShots, perf: partPerf, night: partNight })[part](c); }
      catch (e) { check(`${part} ran`, false, e.message.slice(0, 200)); }
    }
    check('no page errors', !c.errs.length, c.errs.slice(0, 3).join(' | '));
    const w = [...new Set(c.warns)].filter((x) => !/Download the React DevTools|HMR|Fast Refresh/.test(x));
    console.log(`console errors/warnings (${w.length} distinct):`); for (const x of w.slice(0, 12)) console.log('  ' + x);
  } catch (e) { check('ran to the end', false, e.message.slice(0, 200)); }
  finally { await b.close(); }
  const bad = results.filter((r) => !r.ok).length; console.log(bad ? `${bad} FAILED` : 'all ok'); process.exit(bad ? 1 : 0);
})();
