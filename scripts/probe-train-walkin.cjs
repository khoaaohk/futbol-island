// POLISH 4 probe: board by walking in through an open door (shot 69). Based on check-train-talk's boot.
// Island Line train talk (Nov 24 2026): headless check on ONE Chrome (--mute-audio, closed at the end), phone then desktop.
// Board at South, ride out of the station, then: no Talk prompt / no passenger labels while seated and not aiming; a tap (phone) or
// click (desktop) on a passenger near my seat opens the NPC slide-out with their talk; Done closes it; desktop hover shows only the
// faint ring + pointer cursor. One screenshot per viewport (the open talk) into --shots.
// Needs: app  NEXT_DIST_DIR=.next-talk npx next dev -p 9180     Run: node scripts/check-train-talk.cjs --port=9180 [--shots=<dir>]
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const arg = (k, d) => { const a = process.argv.find((s) => s.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const port = arg('port'), shots = arg('shots', '');
if (!port || port === '8092') { console.error('give --port=<n> (never 8092)'); process.exit(2); }
const url = `http://localhost:${port}`, results = [];
const check = (name, ok, extra = '') => { results.push({ name, ok: !!ok }); console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${extra ? ' (' + extra + ')' : ''}`); };
if (shots) fs.mkdirSync(shots, { recursive: true });
async function boot(b, vp, mobile) {
  const ctx = await b.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1 });
  await ctx.addInitScript(() => { try { localStorage.setItem('fi2-welcome-v1', 'completed'); localStorage.setItem('fi2-public-hint-v1', 'card hint'); } catch { /* */ }
    const n = Date.now.bind(Date); window.__skew = 0; Date.now = () => n() + window.__skew; });
  await ctx.route('**/api/build-id', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  const p = await ctx.newPage(), errs = [];
  p.on('pageerror', (e) => errs.push(e.message.slice(0, 200)));
  await p.goto(url + '/play?from=arcade', { timeout: 300000 }); await p.waitForTimeout(3000);
  for (let i = 0; i < 90 && !(await p.evaluate(() => !!window.__fi2)); i++) {
    for (const t of ['I saved it', 'Get my code', 'Play']) await p.click(`button:visible:has-text("${t}")`, { timeout: 300 }).catch(() => {});
    if (i === 0) await p.click('[data-title-start]', { timeout: 4000 }).catch(() => {});
    await p.waitForTimeout(2000);
  }
  await p.waitForFunction(() => !!window.__fi2 && !!window.__fi2.trainRide && !!window.__fi2.trains && !!window.__fi2.trainTalk && !!window.__fi2.renderer && !document.querySelector('[data-island-return-loading]'), null, { timeout: 300000 });
  await p.waitForTimeout(3000);
  return { ctx, p, errs };
}
const setLap = (p, k, T) => p.evaluate(({ k, T }) => { const s = window.__fi2.trains.sched, P = s.trainPhase(k, s.clock()); window.__skew += (((T - P) % 360) + 360) % 360 * 1000; }, { k, T });

function keysToward(dx, dz) { const l = Math.hypot(dx, dz) || 1; let best = null;
  for (const sx of [-1, 0, 1]) for (const sy of [-1, 0, 1]) { if (!sx && !sy) continue; const ix = sx * .857 + sy * .515, iz = -sx * .515 + sy * .857, il = Math.hypot(ix, iz), a = Math.acos(Math.max(-1, Math.min(1, (ix * dx + iz * dz) / il / l))); if (!best || a < best.a) best = { a, keys: [sx > 0 ? 'd' : sx < 0 ? 'a' : '', sy > 0 ? 's' : sy < 0 ? 'w' : ''].filter(Boolean) }; }
  return best; }
async function hold(p, keys, ms, until) { for (const k of keys) await p.keyboard.down(k); const t0 = Date.now(); try { while (Date.now() - t0 < ms) { await p.waitForTimeout(100); if (until && await p.evaluate(until)) return true; } return false; } finally { for (const k of keys) await p.keyboard.up(k); } }
const state = (p) => p.evaluate(() => { const f = window.__fi2, r = f.trainRide; return { active: r.active, standing: r.standing, view: r.view, ride: f.rideRef.current, x: +f.location.x.toFixed(2), z: +f.location.z.toFixed(2) }; });
async function atSouth(p) { const T = await p.evaluate(() => window.__fi2.trains.sched.stops.find((x) => x.station.id === 'south').arrive + 3.5); await setLap(p, 0, T); await p.waitForTimeout(800);
  for (let i = 0; i < 20 && !(await p.evaluate(() => { const s = window.__fi2.trains.states[0]; return s.at >= 0 && s.doors > .95; })); i++) await p.waitForTimeout(300); }
const offTrain = async (p) => { if (await p.evaluate(() => window.__fi2.trainRide.active)) { await p.evaluate(() => { window.__fi2.trainRide.getOff(true); window.__fi2.teleport(150, 205, 0); }); await p.waitForTimeout(800); } await p.evaluate(() => window.__fi2.selectRide('walk')).catch(() => {}); };
// put the player 0.4 m inside car `car`'s solid box (local x = sgn·(edge − 0.4), z = the door's z + dz), hands off: boarded or pushed out?
async function placeIn(p, opt) { await offTrain(p); await atSouth(p);
  return p.evaluate(async (opt) => { const f = window.__fi2, t = f.trains, o = { x: 0, y: 0, z: 0, yaw: 0, car: 0, door: 0 }; const sp = f.trainRide.stationSpot(2, 0); const ds = t.doorSpot(0, sp.x, sp.z, o);
    const M = f.camera.matrixWorld.constructor, m = new M(), V = f.camera.position.constructor; t.carMatrixOf(0, ds.car, m); const inv = m.clone().invert(), q = new V(ds.x, 0, ds.z).applyMatrix4(inv), side = Math.sign(q.x) * (opt.far ? -1 : 1);
    const edge = Math.abs(q.x) - .55 + .35; /* HALF_W + PLAYER_R (doorSpot sits 0.55 m out) */ const a = new V(side * (edge - .4), 0, q.z + (opt.dz || 0)).applyMatrix4(m);
    f.teleport(a.x, a.z, 0); await new Promise((r) => setTimeout(r, 500)); const l = f.location, b = new V(l.x, 0, l.z).applyMatrix4(inv);
    return { active: f.trainRide.active, standing: f.trainRide.standing, lx0: +(side * (edge - .4)).toFixed(2), lx: +b.x.toFixed(2), edge: +edge.toFixed(2) }; }, opt); }
async function tryDoor(p, name, mode, door, opt = {}) {
  await offTrain(p);
  await atSouth(p);
  const g = await p.evaluate(({ door, opt }) => { const f = window.__fi2, t = f.trains, o = { x: 0, y: 0, z: 0, yaw: 0, car: 0, door: 0 }; const st = t.states[0];
    let best = null; for (let c = 0; c < 2; c++) for (let d = 0; d < 4; d++) { /* the doorSpot nearest a probe point per car/door */ }
    const ds = t.doorSpot(0, f.location.x, f.location.z, o); if (!ds) return null; const M = f.camera.matrixWorld.constructor, m = new M(), V = f.camera.position.constructor; t.carMatrixOf(0, ds.car, m);
    const inv = m.clone().invert(), q = new V(ds.x, 0, ds.z).applyMatrix4(inv), side = Math.sign(q.x), z = q.z + (opt.dz || 0), x = side * (opt.far ? -1 : 1) * 2.6;
    const a = new V(x, 0, z).applyMatrix4(m), b = new V(0, 0, z).applyMatrix4(m); return { ax: a.x, az: a.z, bx: b.x, bz: b.z, car: ds.car, door: ds.door, doors: st.doors }; }, { door, opt });
  if (!g) { console.log('FAIL', name, 'no door spot'); return false; }
  await p.evaluate(() => window.__fi2.selectRide('walk')).catch(() => {}); await p.evaluate(({ ax, az }) => window.__fi2.teleport(ax, az, 0), g); await p.waitForTimeout(700);
  if (mode !== 'walk') { await p.evaluate((m) => window.__fi2.selectRide(m), mode); await p.waitForTimeout(700); }
  const k = keysToward(g.bx - g.ax, g.bz - g.az); const boarded = await hold(p, k.keys, 2200, () => window.__fi2.trainRide.active);
  await p.waitForTimeout(700); const s = await state(p); return { boarded, s, g };
}
(async () => {
  const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--mute-audio', '--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
  try { const c = await boot(b, { width: 1280, height: 800 }, false), p = c.p;
    await p.evaluate(() => { const sp = window.__fi2.trainRide.stationSpot(2, 0); window.__fi2.teleport(sp.x, sp.z, sp.yaw); }); await p.waitForTimeout(800);
    let r = await tryDoor(p, 'walk', 'walk', 0); check('walking through an open door from the platform boards you standing (Inside view)', r.boarded && r.s.standing && r.s.view === 'inside', JSON.stringify(r));
    if (shots) await p.screenshot({ path: path.join(shots, 'walkin-desktop.png') });
    r = await tryDoor(p, 'scooter', 'scooter', 0); check('a scooter through an open door: stowed, on board standing', r.boarded && r.s.standing && r.s.ride === 'walk', JSON.stringify(r));
    r = await placeIn(p, {}); check('control: 0.4 m into the open doorway on the platform side boards you', r.active && r.standing, JSON.stringify(r));
    r = await placeIn(p, { dz: 2.6 }); check('the car side between doors stays solid (pushed out, no boarding)', !r.active && Math.abs(r.lx) >= r.edge - .05, JSON.stringify(r));
    r = await placeIn(p, { far: true }); check('the off-platform side stays solid (pushed out, no boarding)', !r.active && Math.abs(r.lx) >= r.edge - .05, JSON.stringify(r));
    // doors closed: braking in (at the platform, doors shut): the doorway is solid
    await offTrain(p); const Tb = await p.evaluate(() => window.__fi2.trains.sched.stops.find((x) => x.station.id === 'south').arrive + .3); await setLap(p, 0, Tb); await p.waitForTimeout(400);
    const cl = await p.evaluate(async () => { const f = window.__fi2, t = f.trains, st = t.states[0], o = { x: 0, y: 0, z: 0, yaw: 0, car: 0, door: 0 }, sp = f.trainRide.stationSpot(2, 0); const ds = st.at >= 0 ? t.doorSpot(0, sp.x, sp.z, o) : null; if (!ds) return { skip: true, at: st.at, doors: st.doors };
      const M = f.camera.matrixWorld.constructor, m = new M(), V = f.camera.position.constructor; t.carMatrixOf(0, ds.car, m); const inv = m.clone().invert(), q = new V(ds.x, 0, ds.z).applyMatrix4(inv), side = Math.sign(q.x), edge = Math.abs(q.x) - .2, a = new V(side * (edge - .4), 0, q.z).applyMatrix4(m);
      f.teleport(a.x, a.z, 0); await new Promise((r) => setTimeout(r, 400)); return { active: f.trainRide.active, doors: +st.doors.toFixed(2), at: st.at }; });
    check('closed doors stay solid (no boarding while they are shut)', cl.skip || (!cl.active || cl.doors > .9), JSON.stringify(cl));
    // Board button still works
    await offTrain(p); await atSouth(p); await p.evaluate(() => { const sp = window.__fi2.trainRide.stationSpot(2, 0); window.__fi2.teleport(sp.x, sp.z, sp.yaw + Math.PI); }); await p.waitForTimeout(1500);
    const vis = await p.evaluate(() => { const e = document.querySelector('[data-train-board]'); return !!e && !e.hidden; });
    await p.evaluate(() => { document.querySelector('[data-train-board]')?.click(); }); await p.waitForTimeout(1500);
    check('the Board button still boards (seat)', vis && (await p.evaluate(() => window.__fi2.trainRide.active)), JSON.stringify({ vis }));
    check('no page errors', !c.errs.length, c.errs.slice(0, 2).join(' | '));
  } finally { await b.close(); }
  const bad = results.filter((r) => !r.ok).length; console.log(bad ? `${bad} FAILED` : 'all ok'); process.exit(bad ? 1 : 0);
})();
