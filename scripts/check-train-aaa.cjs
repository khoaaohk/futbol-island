// Island Line AAA audit (Nov 24 2026): one reusable headless play-through of the owner's train checklist, on ONE headless Chrome
// (--mute-audio, closed at the end). The train clock is moved with a Date.now offset (window.__skew, ms) so a train can be brought to
// any crossing or platform in seconds; the timetable is absolute, so a jump is also the clock-skew / long-session check.
// Parts (--parts=a,b,...; default all):
//   xings    every level crossing: lamps on, arms DOWN before the front reaches the deck, down while the train is on it, back UP after
//   vending  each station's drink machine: the prompt shows on its platform, the machine zooms in with drinks, closes
//   ride     board at a platform, ride on (bridge crest height, announcement, tunnel), tab hidden 20 s then back (train where the
//            timetable says), fast travel while riding (gets off), board refused while jetpacking
//   track    nothing on the rails: player push-out from the track, step-off note when standing on it
//   shots    after images of the owner's 14 screenshots' places (desktop) into --shots
//   perf     frame time p50/p95/max + draws standing at the busiest station and riding (GFX_NO_TRAIN A/B is gfx-budget.cjs)
// Needs: app  NEXT_DIST_DIR=.next-aaa npx next dev -p 9156     Run: node scripts/check-train-aaa.cjs --port=9156 [--shots=<dir>] [--gpu=swiftshader]
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const arg = (k, d) => { const a = process.argv.find((s) => s.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const port = arg('port'), shots = arg('shots', ''), parts = arg('parts', 'xings,vending,ride,track,shots,perf').split(','), gpu = arg('gpu', 'metal');
const phone = arg('phone', '1') === '1', tier = arg('tier', ''), noTrain = arg('notrain', '') === '1';
if (!port || port === '8092') { console.error('give --port=<n> (never 8092)'); process.exit(2); }
const url = `http://localhost:${port}`;
const results = [];
const check = (name, ok, extra = '') => { results.push({ name, ok: !!ok }); console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${extra ? ' (' + extra + ')' : ''}`); };
if (shots) fs.mkdirSync(shots, { recursive: true });
async function boot(b, vp, mobile) {
  const ctx = await b.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1 });
  await ctx.addInitScript(({ tier, noTrain }) => {
    try { if (!sessionStorage.getItem('__a_boot')) { localStorage.setItem('fi2-welcome-v1', 'completed'); localStorage.setItem('fi2-public-hint-v1', 'card hint'); if (tier) localStorage.setItem('fi2-battery-saver', tier); if (noTrain) localStorage.setItem('fi-no-train', '1'); } sessionStorage.setItem('__a_boot', '1'); } catch { /* */ }
    const n = Date.now.bind(Date); window.__skew = 0; Date.now = () => n() + window.__skew;
  }, { tier, noTrain });
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
    await p.evaluate((id) => { const f = window.__fi2, e = f.vending.entries.find((e) => e.machine.id === id); f.teleport(e.front.x + e.dir.x * 1.5, e.front.z + e.dir.z * 1.5, Math.atan2(-e.dir.x, -e.dir.z)); }, id);
    let go = false; for (let i = 0; i < 20 && !go; i++) { await p.waitForTimeout(300); go = await p.locator('[data-vending-go]').isVisible().catch(() => false); }
    let zoom = false, items = 0;
    if (go) { await p.locator('[data-vending-go]').click().catch(() => {}); zoom = await p.waitForSelector('[data-vending-machine]', { timeout: 8000 }).then(() => true).catch(() => false);
      items = await p.locator('[data-vending-item]').count(); }
    check(`vending ${id}: prompt, zoom, drinks listed`, go && zoom && items > 0, `go ${go} zoom ${zoom} items ${items}`);
    if (zoom && shots && id === ids[0]) await p.screenshot({ path: path.join(shots, `vending-${id}.png`) });
    // Escape closes the machine; the Done/Close button only if it is still open (clicking "Back" after Escape could hit an island
    // control and leave a panel open: the travel map then paused the island and the ride/track parts failed after this part)
    await p.keyboard.press('Escape'); await p.waitForTimeout(400);
    if (await p.locator('[data-vending-machine]').count()) await p.locator('[data-vending-machine]').getByRole('button', { name: /^(Done|Close|Back)$/ }).first().click({ timeout: 1500 }).catch(() => {});
    await p.waitForSelector('[data-vending-machine]', { state: 'detached', timeout: 6000 }).catch(() => {});
  }
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
  await p.evaluate((si) => { const sp = window.__fi2.trainRide.stationSpot(si, 0); window.__fi2.teleport(sp.x, sp.z, sp.yaw + Math.PI); }, si);
  await p.waitForTimeout(1500);
  const offer = await p.evaluate(() => { const e = document.querySelector('[data-train-board]'); return !!e && !e.hidden; });
  check('Board prompt on the South platform with a train in', offer);
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
    return { talk: !!document.querySelector('.npc-talk-prompt'), passenger: pax ? pax.name : null, fov: f.camera.fov }; });
  check('riding: no "Talk to" prompt; portrait ride fov opened', !hud.talk && (!phone || hud.fov > 50), JSON.stringify(hud));
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
  const r = await p.evaluate(async (S0) => { const f = window.__fi2, t = f.trains, t0 = performance.now(); let note = '', minGap = 1e9, moved = 0; const x0 = f.location.x, z0 = f.location.z;
    while (performance.now() - t0 < 22000) { await new Promise((r) => requestAnimationFrame(r)); const n = document.querySelector('[data-island-toast], [data-train-note], [role="status"]')?.textContent || ''; if (/step off/i.test(n)) note = n;
      const fs = t.states[0].s; moved = Math.hypot(f.location.x - x0, f.location.z - z0); if (moved < 2.4) minGap = Math.min(minGap, ((S0 - fs) % 2700 + 2700) % 2700); if (moved > 3) break; }
    return { note, minGap: +minGap.toFixed(1), moved: +moved.toFixed(1), held: +t.runner.heldFor(0).toFixed(1) }; }, spot.s);
  check('standing on the rails: the train stops short of you and you are eased off the track', r.minGap > 2 && r.minGap < 8 && r.moved > 1.5, JSON.stringify(r)); // (< 8: the train really came up to you)
}
const OWNER_SPOTS = [
  ['1-south-coast', 125, 226], ['2-palm-trestle', -10, 101], ['3-shore-wall', 30, 140], ['4-south-station', 160, 223], ['5-east-hill', 664, 51],
  ['6-west-portal', 538.5, 169.5], ['8-ferry-beach', 236, 242], ['10-palm-umbrellas', -5, 115], ['11-ballast', 300, 242], ['12-xing-deck', 80, -207],
  ['13-west-beach-xing', -305, -52], ['14-station-house', -305, -30], ['bridge-crest', 348, 243],
];
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
    const vp = phone ? { width: 390, height: 844 } : { width: 1440, height: 900 };
    const c = await boot(b, vp, phone);
    const gl = await c.p.evaluate(() => { const g = window.__fi2.renderer.getContext(), e = g.getExtension('WEBGL_debug_renderer_info'); return e ? g.getParameter(e.UNMASKED_RENDERER_WEBGL) : '?'; });
    console.log(`viewport ${vp.width}x${vp.height}, GL ${gl}`);
    for (const part of parts) {
      try { await ({ perfab: partPerfAB, spot: partSpot, gauge: partGauge, xings: partXings, vending: partVending, ride: partRide, track: partTrack, shots: partShots, perf: partPerf })[part](c); }
      catch (e) { check(`${part} ran`, false, e.message.slice(0, 200)); }
    }
    check('no page errors', !c.errs.length, c.errs.slice(0, 3).join(' | '));
    const w = [...new Set(c.warns)].filter((x) => !/Download the React DevTools|HMR|Fast Refresh/.test(x));
    console.log(`console errors/warnings (${w.length} distinct):`); for (const x of w.slice(0, 12)) console.log('  ' + x);
  } catch (e) { check('ran to the end', false, e.message.slice(0, 200)); }
  finally { await b.close(); }
  const bad = results.filter((r) => !r.ok).length; console.log(bad ? `${bad} FAILED` : 'all ok'); process.exit(bad ? 1 : 0);
})();
