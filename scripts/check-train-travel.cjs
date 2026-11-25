// Train travel check (owner Nov 25 2026: "while standing on the train, unable to transport to other areas"). One headless Chrome
// (--mute-audio, closed at the end). From every train state (seated / standing inside, moving / stopped, a camera view, the roof) open
// the travel map the way a player does (the corner minimap, or the cluster's map toggle on a phone) and tap a pin: you must leave the
// train, arrive at the place and get the follow camera back. Run: node scripts/check-train-travel.cjs --port=<n> [--phone=0]
const { chromium } = require('playwright');
const arg = (k, d) => { const a = process.argv.find((s) => s.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const port = arg('port'), phone = arg('phone', '1') === '1', only = arg('only', '');
if (!port || port === '8092') { console.error('give --port=<n> (never 8092)'); process.exit(2); }
const url = `http://localhost:${port}`; const results = [];
const check = (name, ok, extra = '') => { results.push(!!ok); console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${extra ? ' (' + extra + ')' : ''}`); };
const setLap = (p, k, T) => p.evaluate(({ k, T }) => { const s = window.__fi2.trains.sched, P = s.trainPhase(k, s.clock()); window.__skew += (((T - P) % 360) + 360) % 360 * 1000; }, { k, T });
async function boot(b) {
  const ctx = await b.newContext({ viewport: phone ? { width: 390, height: 844 } : { width: 1440, height: 900 }, isMobile: phone, hasTouch: phone, deviceScaleFactor: 1 });
  await ctx.addInitScript(() => { try { localStorage.setItem('fi2-welcome-v1', 'completed'); localStorage.setItem('fi2-public-hint-v1', 'card hint'); } catch { /* */ }
    const n = Date.now.bind(Date); window.__skew = 0; Date.now = () => n() + window.__skew; });
  await ctx.route('**/api/build-id', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  const p = await ctx.newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message.slice(0, 200)));
  await p.goto(url + '/play?from=arcade', { timeout: 240000 }); await p.waitForTimeout(3000);
  for (let i = 0; i < 90 && !(await p.evaluate(() => !!window.__fi2)); i++) {
    for (const t of ['I saved it', 'Get my code', 'Play']) await p.click(`button:visible:has-text("${t}")`, { timeout: 300 }).catch(() => {});
    if (i === 0) await p.click('text=Get my save code', { timeout: 4000 }).catch(() => {});
    await p.waitForTimeout(2000);
  }
  await p.waitForFunction(() => !!window.__fi2?.trainRide && !!window.__fi2.trains && !!document.querySelector('[data-hud-triggers]'), null, { timeout: 240000 });
  await p.waitForFunction(() => !!window.__fi2.renderer && !document.querySelector('[data-island-return-loading]'), null, { timeout: 240000 });
  await p.waitForTimeout(3000); return { ctx, p, errs };
}
async function settle(p) {
  await p.keyboard.press('Escape').catch(() => {}); await p.waitForTimeout(300);
  await p.evaluate(() => { const f = window.__fi2; if (f.trainRide.active) f.trainRide.finish(); if (f.roofRide) { f.roofRide.k = -1; f.roofRide.hop = false; } try { if (f.rideRef?.current !== 'walk') f.selectRide('walk'); } catch { /* */ } const sp = f.trainRide.stationSpot(0, 0); f.teleport(sp.x, sp.z, sp.yaw); });
  await p.waitForTimeout(1500);
}
// board train 0 standing at South (doors open), seated
async function board(p) {
  const T = await p.evaluate(() => window.__fi2.trains.sched.stops.find((x) => x.station.id === 'south').arrive + 3.5);
  await setLap(p, 0, T); await p.waitForTimeout(500);
  await p.evaluate(() => { const sp = window.__fi2.trainRide.stationSpot(2, 0); window.__fi2.teleport(sp.x, sp.z, sp.yaw + Math.PI); }); await p.waitForTimeout(1500);
  await p.evaluate(() => { document.querySelector('[data-train-board]')?.click(); if (!window.__fi2.trainRide.active) window.__fi2.trainRide.board(); });
  await p.waitForTimeout(1200); return p.evaluate(() => window.__fi2.trainRide.active);
}
async function landRoof(p, T) {
  await setLap(p, 0, T); await p.waitForTimeout(400);
  for (let q = 0; q < 3; q++) { await p.waitForTimeout(250); await p.evaluate((T) => { const d = ((((T - window.__fi2.trains.runner.t[0] + 180) % 360) + 360) % 360) - 180; if (Math.abs(d) > 2) window.__skew += d * 1000; }, T); }
  const c0 = await p.evaluate(() => { const t = window.__fi2.trains, o = { x: 0, y: 0, z: 0, yaw: 0 }; t.standAt(0, 0, 4.6, 0, o, undefined, 3.75); return o; });
  await p.evaluate(({ x, z }) => window.__fi2.teleport(x, z, 0), c0); await p.evaluate(() => window.__fi2.selectRide('jetpack')); await p.waitForTimeout(2500);
  return p.evaluate(async () => { const f = window.__fi2, t = f.trains, o = { x: 0, y: 0, z: 0, yaw: 0 }; const t0 = performance.now(); let pressed = false;
    while (performance.now() - t0 < 15000) { await new Promise((r) => requestAnimationFrame(r)); if (f.roofRide.k >= 0) return { ok: true, k: f.roofRide.k };
      if (f.pendingRide?.current == null || !pressed) { t.standAt(0, 0, 4.6, 0, o, undefined, 3.75); f.location.x = o.x; f.location.z = o.z; }
      if (!pressed && performance.now() - t0 > 1500 && f.rideRef.current === 'jetpack') { f.selectRide('walk'); pressed = true; } }
    return { ok: false, k: f.roofRide.k, ride: f.rideRef.current }; });
}
async function departed(p) { for (let i = 0; i < 40; i++) { if (await p.evaluate(() => window.__fi2.trains.states[window.__fi2.trainRide.train]?.at < 0 && window.__fi2.trains.states[window.__fi2.trainRide.train]?.v > 3)) return true; await p.waitForTimeout(500); } return false; }
// open the travel map as a player does: the corner minimap if it is on screen, else the cluster's map toggle (then the minimap)
async function openMap(p) {
  const how = await p.evaluate(() => { const vis = (e) => { if (!e) return false; const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 4 && r.height > 4 && s.visibility !== 'hidden' && s.display !== 'none' && e.getAttribute('aria-hidden') !== 'true'; };
    const m = document.querySelector('#corner-map'); if (vis(m)) return 'corner'; const t = document.querySelector('.travel-actions .minimap-toggle, .minimap-toggle'); if (vis(t)) return 'toggle'; return 'none'; });
  if (how === 'corner') await (phone ? p.locator('#corner-map').tap({ timeout: 3000 }) : p.locator('#corner-map').click({ timeout: 3000 })).catch((e) => console.log('  corner click: ' + e.message.split('\n')[0]));
  else if (how === 'toggle') { await (phone ? p.locator('.travel-actions .minimap-toggle').first().tap({ timeout: 3000 }) : p.locator('.travel-actions .minimap-toggle').first().click({ timeout: 3000 })).catch(() => {}); await p.waitForTimeout(500);
    if (!(await p.locator('dialog[open] [aria-label^="Travel to"]').count()))/* the closed map dialog keeps its pins in the DOM */ await (phone ? p.locator('#corner-map').tap({ timeout: 3000 }) : p.locator('#corner-map').click({ timeout: 3000 })).catch((e) => console.log('  corner after toggle: ' + e.message.split('\n')[0])); }
  if (process.env.TTDIAG) console.log('  diag: ' + JSON.stringify(await p.evaluate(() => { const m = document.querySelector('#corner-map'), r = m?.getBoundingClientRect(), t = document.querySelector('.minimap-toggle'); const at = r ? document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2) : null; return { how: 0, mini: document.querySelector('.town-minimap')?.className, r: r && [r.x, r.y, r.width, r.height].map(Math.round), top: at ? (at.id || at.className?.baseVal || at.className || at.tagName) : null, toggle: t?.getAttribute('aria-label'), dialog: !!document.querySelector('dialog[open]'), mapState: window.__fi2.mapRef?.current }; })) + ' via ' + how);
  const open = await p.waitForSelector('[aria-label^="Travel to"]', { timeout: 6000 }).then(() => true).catch(() => false);
  return { how, open };
}
async function travel(p, label, want, name) {
  const from = await p.evaluate(() => ({ x: window.__fi2.location.x, z: window.__fi2.location.z }));
  const m = await openMap(p);
  if (!m.open) { check(`${name}: the travel map opens`, false, JSON.stringify(m)); return; }
  await p.waitForTimeout(500);
  if (process.env.TTLIST) console.log('  pins: ' + (await p.evaluate(() => [...document.querySelectorAll('dialog[open] [aria-label^="Travel to"]')].map((e) => e.getAttribute('aria-label').slice(10)).join('|'))));
  // a real tap / click where the pin is on screen (hit-tested: whatever lies over the pin gets it, as on a phone)
  const pin = p.locator(`dialog[open] [aria-label="Travel to ${label}"]`).first();
  let hit = 'ok'; if (!(await pin.count())) hit = 'no pin';
  else { // a phone shows part of the map: pan with its arrow buttons (as a player would) until the pin is well inside the view
    for (let i = 0; i < 16; i++) { const g = await p.evaluate((label) => { const e = document.querySelector(`dialog[open] [aria-label="Travel to ${label}"]`), v = document.querySelector('dialog[open] [role="region"]'); if (!e || !v) return null; const a = e.getBoundingClientRect(), r = v.getBoundingClientRect(), cx = a.x + a.width / 2, cy = a.y + a.height / 2, m = Math.min(140, r.width / 3), n = Math.min(120, r.height / 3);/* clear of the edge station chips */
        return cx < r.left + m ? 'left' : cx > r.right - m ? 'right' : cy < r.top + n ? 'up' : cy > r.bottom - n ? 'down' : ''; }, label);
      if (!g) break; const btn = p.locator(`dialog[open] button[data-dir="${g}"]`); if (!(await btn.count()) || !(await btn.isEnabled().catch(() => false)) || !(await btn.isVisible().catch(() => false))) break;
      await btn.click({ timeout: 1500 }).catch(() => {}); await p.waitForTimeout(450); }
    const bb = await pin.boundingBox(); if (!bb) hit = 'pin not on screen';
    else { const x = bb.x + bb.width / 2, y = bb.y + bb.height / 2, top = await p.evaluate(({ x, y }) => { const e = document.elementFromPoint(x, y); return e ? (e.closest('[aria-label^="Travel to"]')?.getAttribute('aria-label') ?? (e.id || e.getAttribute('class') || e.tagName)) : null; }, { x, y });
      if (process.env.TTDIAG) console.log(`  pin ${label} at ${Math.round(x)},${Math.round(y)}: top ${top}`);
      if (top !== 'Travel to ' + label) { if (phone) await p.touchscreen.tap(x, y); else await p.mouse.click(x, y); await p.waitForTimeout(900);/* an edge chip over the pin pans the map to it first */
        const b2 = (await p.locator('dialog[open]').count()) ? await pin.boundingBox() : null;/* the chip over a visible pin travels there itself (owner Nov 25) */ if (process.env.TTDIAG) console.log(`  chip tap: map ${b2 ? 'still open' : 'closed'}`); if (b2) { const x2 = b2.x + b2.width / 2, y2 = b2.y + b2.height / 2; if (process.env.TTDIAG) console.log(`  pin again at ${Math.round(x2)},${Math.round(y2)}`); if (phone) await p.touchscreen.tap(x2, y2); else await p.mouse.click(x2, y2); } }
      else if (phone) await p.touchscreen.tap(x, y); else await p.mouse.click(x, y); } }
  if (hit !== 'ok') { check(`${name}: pin "${label}"`, false, hit); return; }
  await p.waitForTimeout(3500);
  const a0 = await p.evaluate(() => ({ x: window.__fi2.location.x, z: window.__fi2.location.z })); await p.waitForTimeout(2000);
  const a = await p.evaluate(() => { const f = window.__fi2, c = f.camera.position, l = f.location; return { active: f.trainRide.active, roof: f.roofRide?.k ?? -9, hop: !!f.roofRide?.hop, x: Math.round(l.x), z: Math.round(l.z), cam: +Math.hypot(c.x - l.x, c.z - l.z).toFixed(1), map: !!document.querySelector('[aria-label^="Travel to"]') && !!document.querySelector('dialog[open]'), store: !!document.querySelector('[data-train-note]:not([hidden])') }; });
  const moved = Math.hypot(a.x - from.x, a.z - from.z), drift = Math.hypot(a.x - a0.x, a.z - a0.z), d = want ? Math.hypot(a.x - want.x, a.z - want.z) : 0;
  check(`${name}: off the train, at ${label}, stays there, follow camera back`, !a.active && a.roof < 0 && !a.hop && !a.map && moved > 40 && drift < 6 && d < 30 && a.cam < 60, JSON.stringify({ ...a, moved: Math.round(moved), drift: +drift.toFixed(1), d: Math.round(d), via: m.how }));
}
(async () => {
  const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--mute-audio', '--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
  let c; try {
    c = await boot(b); const { p } = c;
    const NORTH = { x: 15, z: -206 };
    const NEAR_KENJI = async () => { await p.evaluate(() => window.__fi2.trainRide.setView('inside')); await p.waitForTimeout(1500); await p.evaluate(() => { const sp = window.__fi2.trainRide.spot; sp.x = 0; sp.u = 4.2; }); await p.waitForTimeout(1200); };
    const cases = [
      { name: 'seated, stopped at South', setup: async () => {}, label: 'North station', want: NORTH },
      { name: 'seated, moving', setup: async () => { await departed(p); }, label: 'DRIP FC Stadium' },
      { name: 'standing inside, moving', setup: async () => { await departed(p); await p.evaluate(() => window.__fi2.trainRide.setView('inside')); await p.waitForTimeout(1500); }, label: 'North station', want: NORTH, standing: true },
      { name: 'standing inside, stopped', setup: async () => { await p.evaluate(() => window.__fi2.trainRide.setView('inside')); await p.waitForTimeout(1500); }, label: '7v7 field', standing: true },
      { name: 'standing by Kenji, moving', setup: async () => { await departed(p); await NEAR_KENJI(); }, label: 'Coral Cay', standing: true },
      { name: 'standing by Kenji, stopped', setup: NEAR_KENJI, label: 'Arcade', standing: true },
      { name: 'seated, Driver view, moving', setup: async () => { await departed(p); await p.evaluate(() => window.__fi2.trainRide.setView('driver')); await p.waitForTimeout(1500); }, label: 'Summit Isle station' },
      { name: 'seated, Above view, moving', setup: async () => { await departed(p); await p.evaluate(() => window.__fi2.trainRide.setView('above')); await p.waitForTimeout(1500); }, label: 'Kit Shop' },
    ];
    for (const cs of cases) { if (only && !only.split(',').some((o) => cs.name.includes(o))) continue;
      await settle(p); const on = await board(p); if (!on) { check(`${cs.name}: boarded`, false); continue; }
      await cs.setup();
      if (cs.standing) { const st = await p.evaluate(() => window.__fi2.trainRide.standing ?? document.querySelector('[data-train-actions]') !== null); if (st !== true) check(`${cs.name}: standing in the aisle`, false, String(st)); }
      await travel(p, cs.label, cs.want, cs.name);
    }
    // Go fishing (the welcome card / a deep link: lib/welcome/act.ts requestGoFishing) from inside the car: off the train, at a shore spot
    for (const st of (only && !only.includes('fish')) ? [] : ['seated', 'standing']) {
      await settle(p); if (!(await board(p))) { check(`go fishing ${st}: boarded`, false); continue; } await departed(p);
      if (st === 'standing') { await p.evaluate(() => window.__fi2.trainRide.setView('inside')); await p.waitForTimeout(1500); }
      const from = await p.evaluate(() => ({ x: window.__fi2.location.x, z: window.__fi2.location.z }));
      await p.evaluate(() => window.dispatchEvent(new CustomEvent('fi2-go-fishing', { detail: {} }))); await p.waitForTimeout(3500);
      const a0 = await p.evaluate(() => ({ x: window.__fi2.location.x, z: window.__fi2.location.z })); await p.waitForTimeout(2000);
      const a = await p.evaluate(() => { const f = window.__fi2, c = f.camera.position, l = f.location; return { active: f.trainRide.active, x: Math.round(l.x), z: Math.round(l.z), cam: +Math.hypot(c.x - l.x, c.z - l.z).toFixed(1) }; });
      check(`go fishing while ${st} on a moving train: off the train, at the shore, stays there`, !a.active && Math.hypot(a.x - from.x, a.z - from.z) > 20 && Math.hypot(a.x - a0.x, a.z - a0.z) < 6 && a.cam < 60, JSON.stringify(a));
    }
    // the roof (owner Nov 25 2026, 5bf7a1d9): Land on a moving train's roof with the jetpack (check-train-aaa's landRoof), then travel
    const T = await p.evaluate(() => { const s = window.__fi2.trains.sched; let best = 0, bd = 1e9; for (let q = 0; q < 2700; q++) { const a = s.trackAt(q), d = Math.hypot(a.x - 538.5, a.z - 169.5); if (d < bd) { bd = d; best = q; } }
      for (let t = 0; t < 360; t += .1) { const st = s.trainAt(0, t); if (((best - 260 - st.s) % 2700 + 2700) % 2700 < 3) return t; } return 0; });
    for (const [label, want] of (only && !only.includes('roof')) ? [] : [['North station', NORTH], ['7v7 field', null]]) {
      await settle(p); let on = await landRoof(p, T); if (!on.ok) { await settle(p); on = await landRoof(p, T); }
      if (!on.ok) { check(`on the roof (for ${label})`, false, JSON.stringify(on)); continue; }
      await p.waitForTimeout(1200); await travel(p, label, want, 'on the roof, moving');
    }
    if (c.errs.length) console.log('  page errors: ' + c.errs.slice(0, 3).join(' | '));
  } finally { if (c) await c.ctx.close().catch(() => {}); await b.close(); }
  const bad = results.filter((r) => !r).length; console.log(`${results.length - bad}/${results.length} ok`); process.exit(bad ? 1 : 0);
})();
