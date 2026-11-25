// Live-site train audit as a player (Nov 24 2026). Plays https://futbolisland.app/play (or --url=) in ONE headless Chrome
// (--mute-audio, closed at the end). On a production host the player-moving debug hooks are off (lib/dev/debugHooks.ts), so this
// moves only the way a kid does: the travel map's station pins (Fly there), the Board prompt, the camera button, the ride
// cluster, the Get off pill. It reads the read-only __fi2 probes (trains, trainRide, player) to know when a train is in.
// Parts (--parts=, default cold,ride): cold (no save: time to the island and to the first Board), ride (board, every camera view
// with frame times, walk/sit/talk, get off, the stamp prompt), mem (stay on 5 min: heap before/after), mp (two clients on the
// live relay: B draws A on the platform and seated), night (fi2-time-of-day=night: one ride shot). --vp=phone|tablet|desktop.
// Run: node --experimental-websocket scripts/audit-train-live.cjs --vp=phone --shots=<dir> [--url=https://futbolisland.app]
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const arg = (k, d) => { const a = process.argv.find((s) => s.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const url = arg('url', 'https://futbolisland.app').replace(/\/$/, ''), shots = arg('shots', ''), vpName = arg('vp', 'phone');
const parts = arg('parts', 'cold,ride').split(','), memMin = +arg('mem-min', '5');
if (/localhost:(8092|9160|8800)\b/.test(url)) { console.error('never 8092 / 9160 / 8800'); process.exit(2); }
const VPS = { phone: [{ width: 390, height: 844 }, true], tablet: [{ width: 820, height: 1180 }, true], desktop: [{ width: 1440, height: 900 }, false] };
const [vp, mobile] = VPS[vpName];
if (shots) fs.mkdirSync(shots, { recursive: true });
const results = [];
const note = (sev, name, extra = '') => { results.push({ sev, name, extra }); console.log(`${sev.padEnd(5)} ${name}${extra ? ' (' + extra + ')' : ''}`); };
const check = (name, ok, extra = '') => note(ok ? 'ok' : 'FAIL', name, extra);
const shot = async (p, name) => { if (shots) await p.screenshot({ path: path.join(shots, `${vpName}-${name}.png`) }).catch(() => {}); };
const STOP_STATION = ['west', 'south', 'summit', 'cay', 'north'], STATION_INDEX = { north: 0, west: 1, south: 2, summit: 3, cay: 4 };

async function boot(b, { save = true, seed = '', night = false, label = '' } = {}) {
  const ctx = await b.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1 });
  await ctx.addInitScript(({ save, seed, night }) => {
    try { if (!sessionStorage.getItem('__l_boot')) { if (save) { localStorage.setItem('fi2-welcome-v1', 'completed'); localStorage.setItem('fi2-public-hint-v1', 'card hint'); }
      if (seed) localStorage.setItem('fi2-holdout-v1', seed); if (night) localStorage.setItem('fi2-time-of-day', 'night'); } sessionStorage.setItem('__l_boot', '1'); } catch { /* */ }
    window.__lt = []; try { new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lt.push([Math.round(e.startTime), Math.round(e.duration)]); }).observe({ type: 'longtask', buffered: true }); } catch { /* */ }
  }, { save, seed, night });
  const p = await ctx.newPage(), errs = [], warns = [], net = [];
  p.on('pageerror', (e) => errs.push(e.message.slice(0, 200)));
  p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') warns.push(`${m.type()}: ${m.text().slice(0, 180)}`); });
  p.on('response', (r) => { if (r.status() >= 400) net.push(`${r.status()} ${r.url().slice(0, 140)}`); });
  p.on('requestfailed', (r) => { const f = r.failure()?.errorText || ''; if (!/ERR_ABORTED/.test(f)) net.push(`failed ${f} ${r.url().slice(0, 140)}`); });
  const t0 = Date.now();
  await p.goto(url + '/play', { timeout: 240000, waitUntil: 'domcontentloaded' });
  const steps = [];
  for (let i = 0; i < 90 && !(await p.evaluate(() => !!window.__fi2 && !!window.__fi2.trains && !!window.__fi2.renderer && !document.querySelector('[data-island-return-loading]')).catch(() => false)); i++) {
    // a kid taps the obvious primary button of each welcome screen; record what was offered
    const offered = await p.evaluate(() => [...document.querySelectorAll('button')].filter((b) => b.offsetParent && b.getBoundingClientRect().width > 20).map((b) => (b.innerText || b.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 40)).filter(Boolean).slice(0, 8)).catch(() => []);
    if (!save && offered.length) { const key = offered.join(' | '); if (steps[steps.length - 1] !== key) steps.push(key); }
    for (const t of ['Start', 'I saved it', 'Get my code', 'Play', 'Next', "Let's go", 'Continue', 'Done', 'Skip']) if (await p.click(`button:visible:has-text("${t}")`, { timeout: 250 }).then(() => true).catch(() => false)) break;
    await p.waitForTimeout(1500);
  }
  const ready = await p.waitForFunction(() => !!window.__fi2 && !!window.__fi2.trains && !!window.__fi2.renderer && !!document.querySelector('[data-hud-triggers]'), null, { timeout: 240000 }).then(() => true).catch(() => false);
  const readyMs = Date.now() - t0;
  // the public world connects only after a first input
  await p.keyboard.press('Shift').catch(() => {}); await p.mouse.move(vp.width / 2 + 5, vp.height / 2 + 5).catch(() => {});
  await p.waitForTimeout(2500);
  console.log(`[${label || vpName}] island ready ${ready} in ${(readyMs / 1000).toFixed(1)} s${steps.length ? `; welcome screens: ${steps.join(' || ')}` : ''}`);
  return { ctx, p, errs, warns, net, readyMs, ready, steps, t0 };
}
// rAF frame times over ms (p50/p95/max) + long tasks in that window
const frames = (p, ms) => p.evaluate(async (ms) => { const d = []; let last = performance.now(); const t0 = last, lt0 = window.__lt.length;
  while (performance.now() - t0 < ms) { await new Promise((r) => requestAnimationFrame(r)); const n = performance.now(); d.push(n - last); last = n; }
  d.sort((a, b) => a - b); const q = (f) => +(d[Math.min(d.length - 1, Math.floor(d.length * f))] || 0).toFixed(1);
  const lt = window.__lt.slice(lt0); return { n: d.length, p50: q(.5), p95: q(.95), max: q(.999), longTasks: lt.length, longMax: lt.reduce((m, x) => Math.max(m, x[1]), 0) }; }, ms);
const tl = async (p, what) => console.log(`  @${what}: ` + JSON.stringify(await p.evaluate(() => { const f = window.__fi2, r = f.trainRide, k = r.active ? r.train : -1, st = k >= 0 ? f.trains.states[k] : null;
  return st ? { k, at: st.at, next: st.next, v: +st.v.toFixed(1), doors: +st.doors.toFixed(2), dwell: +(st.dwellLeft || 0).toFixed(1), s: +st.s.toFixed(0), pill: document.querySelector('[data-train-exit]')?.textContent || '' } : { riding: false }; })));
const me = (p) => p.evaluate(() => { const r = window.__fi2.player.root; return { x: r.position.x, z: r.position.z }; });
const boardShown = (p) => p.evaluate(() => { const e = document.querySelector('[data-train-board]'); return !!e && !e.hidden && e.getBoundingClientRect().width > 0; });
// pairwise overlaps of visible HUD controls / toasts (fixed or absolute, not nested): the kid-facing "two things on top of each other"
const overlaps = (p) => p.evaluate(() => {
  const sel = 'button, [role="status"], [data-hud-slot], [data-train-note], [class*="toast"], [class*="pill"], [class*="prompt"]';
  const els = [...document.querySelectorAll(sel)].filter((e) => { if (e.closest('svg') || e.hidden) return false; const r = e.getBoundingClientRect(); if (r.width < 8 || r.height < 8 || r.bottom < 0 || r.top > innerHeight) return false;
    for (let a = e; a; a = a.parentElement) { const c = getComputedStyle(a); if (c.visibility === 'hidden' || c.display === 'none' || +c.opacity < .1) return false; } return (e.innerText || e.getAttribute('aria-label') || '').trim().length > 0; });
  const name = (e) => `${e.tagName.toLowerCase()}${[...e.attributes].filter((a) => a.name.startsWith('data-')).slice(0, 1).map((a) => `[${a.name}]`).join('')} "${(e.innerText || e.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 28)}"`;
  const out = [];
  for (let i = 0; i < els.length; i++) for (let j = i + 1; j < els.length; j++) { const a = els[i], b = els[j]; if (a.contains(b) || b.contains(a)) continue;
    const r = a.getBoundingClientRect(), s = b.getBoundingClientRect(); const w = Math.min(r.right, s.right) - Math.max(r.left, s.left), h = Math.min(r.bottom, s.bottom) - Math.max(r.top, s.top);
    if (w > 4 && h > 4) { const top = document.elementFromPoint((Math.max(r.left, s.left) + Math.min(r.right, s.right)) / 2, (Math.max(r.top, s.top) + Math.min(r.bottom, s.bottom)) / 2); out.push(`${name(a)} x ${name(b)} ${Math.round(w)}x${Math.round(h)}px${top ? '' : ''}`); } }
  const off = els.filter((e) => { const r = e.getBoundingClientRect(); return r.left < -1 || r.right > innerWidth + 1; }).map(name);
  return { pairs: out.slice(0, 12), offscreen: off.slice(0, 6) }; });
const clusterLabels = (p) => p.evaluate(() => [...document.querySelectorAll('[data-job-buttons] button, [data-train-actions] button')].filter((b) => b.offsetParent).map((b) => (b.getAttribute('aria-label') || b.innerText || '').trim().slice(0, 40)));
const realClick = async (p, sel) => { const h = await p.$(sel); if (!h) return false; const bb = await h.boundingBox(); if (!bb) return false;
  if (mobile) await p.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); else await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); return true; };

// the full travel map (the minimap carries the same station pins: the open map is the one with [data-map-fit] and the live dots)
const MAP = '[class*="IslandTravelMap_dialog"]';
const mapOpen = (p) => p.evaluate((M) => { const e = document.querySelector(M); return !!e && e.getBoundingClientRect().width > 100; }, MAP);
async function openMap(p) {
  if (await mapOpen(p)) return true;
  await realClick(p, 'button[aria-label="View map"]'); await p.waitForTimeout(1800);
  if (!(await mapOpen(p))) { await p.keyboard.press('m'); await p.waitForTimeout(1800); }
  return mapOpen(p);
}
const PIN = (id) => `${MAP} [data-train-station="${id}"][role="button"]`;
// a kid on the jetpack taps Land (the parachute button) and waits to touch down
async function landIfFlying(p, tag) {
  const mode = await p.evaluate(() => window.__fi2.rideRef?.current); if (mode !== 'jetpack') return mode;
  const labs = await clusterLabels(p);
  const land = await p.$('button[aria-label="Blast up and parachute"]:visible');
  if (!land) { note('WARN', `${tag}: hovering on the jetpack, no Land / parachute button found`, labs.join(' | ')); return mode; }
  const lab = await land.getAttribute('aria-label');
  const bb = await land.boundingBox(); if (mobile) await p.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); else await land.click();
  let y0 = 1e9; for (let i = 0; i < 40; i++) { await p.waitForTimeout(500); const y = await p.evaluate(() => window.__fi2.player.root.position.y); if (Math.abs(y - y0) < .02 && i > 6) break; y0 = y; }
  const m = await p.evaluate(() => window.__fi2.rideRef?.current);
  const where = await p.evaluate(() => { const r = window.__fi2.trainRide, P = window.__fi2.player.root.position; return { y: +P.y.toFixed(1), want: r.lastWant.can }; });
  note('info', `${tag}: tapped "${lab}" and waited to touch down`, `mode now ${m}, y ${where.y}, Board possible ${where.want}`);
  return m;
}
// Fly to the station the next train is heading for, as a kid reading the map's live dots
async function flyToNextTrain(p, c, tag) {
  let s = null; for (let i = 0; i < 60 && !s; i++) { s = await p.evaluate(() => { const st = window.__fi2.trains.states; for (let i = 0; i < st.length; i++) if (st[i].at < 0) return { train: i, stop: st[i].next }; return null; }); if (!s) await p.waitForTimeout(1000); }
  if (!s) { check(`${tag}: a train is running somewhere`, false); return null; }
  const id = STOP_STATION[s.stop], si = STATION_INDEX[id];
  const mapOk = await openMap(p); check(`${tag}: travel map opens with the station pins`, mapOk);
  if (!mapOk) return null;
  if (tag === 'ride') await shot(p, 'map');
  const dots = await p.locator('[data-train-dot]').count(); check(`${tag}: live train dots on the map`, dots === 3, `${dots} dots`);
  const pin = PIN(id); const tFly = Date.now(); const modeBefore = await p.evaluate(() => window.__fi2.rideRef?.current);
  await p.locator(pin).scrollIntoViewIfNeeded({ timeout: 2000 }).catch(() => {});
  const hit = await p.evaluate((pin) => { const e = document.querySelector(pin), r = e.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, t = document.elementFromPoint(x, y);
    return { x: Math.round(x), y: Math.round(y), inView: x > 0 && y > 0 && x < innerWidth && y < innerHeight, top: t ? `${t.tagName}.${(t.getAttribute('class') || '').toString().slice(0, 30)} ${t.closest('[data-train-station]') === e ? '(the pin)' : (t.closest('[aria-label]')?.getAttribute('aria-label') || '').slice(0, 50)}` : 'none' }; }, pin);
  const tapped = await realClick(p, pin); await p.waitForTimeout(1200);
  if (await mapOpen(p)) console.log('  pin tap diag: ' + JSON.stringify(hit));
  if (!tapped || await mapOpen(p)) { note('WARN', `${tag}: a real tap on the ${id} station pin did not travel`, tapped ? 'tap landed on something else' : 'pin not tappable'); await p.evaluate((pin) => document.querySelector(pin)?.dispatchEvent(new MouseEvent('click', { bubbles: true })), pin); await p.waitForTimeout(800); }
  // a confirm step?
  for (const t of ['Fly there', 'Go', 'Travel']) await p.click(`button:visible:text-is("${t}")`, { timeout: 300 }).catch(() => {});
  const spot = await p.evaluate((si) => window.__fi2.trainRide.stationSpot(si, 0), si);
  let d = 1e9; for (let i = 0; i < 40; i++) { const m = await me(p); d = Math.hypot(m.x - spot.x, m.z - spot.z); if (d < 25 && !(await mapOpen(p))) break; await p.waitForTimeout(500); }
  const arr = await p.evaluate(() => ({ mode: window.__fi2.rideRef?.current, y: +window.__fi2.player.root.position.y.toFixed(1) }));
  check(`${tag}: Fly there lands on ${id} platform`, d < 25, `${d.toFixed(1)} m from the platform spot, ${((Date.now() - tFly) / 1000).toFixed(1)} s, mode ${modeBefore} -> ${arr.mode}, y ${arr.y} (platform y ${spot.y?.toFixed?.(1)})`);
  check(`${tag}: a station pin lands you on foot on the platform (Board is never offered from the jetpack)`, arr.mode !== 'jetpack' && Math.abs(arr.y - spot.y) < 1.5, `mode ${arr.mode}, y ${arr.y}`);
  if (tag === 'ride') await shot(p, 'arrival');
  await landIfFlying(p, tag);
  return { ...s, id, si, spot };
}
async function waitBoard(p, s, tag) {
  const tW = Date.now(); let k = -1, shown = false, standSeen = false;
  for (let i = 0; i < 300; i++) { k = await p.evaluate((stop) => window.__fi2.trains.states.findIndex((x) => x.at === stop && x.doors > .6 && x.dwellLeft > 3), s.stop);
    if (k >= 0) { standSeen = true; shown = await boardShown(p); if (shown) break; } await p.waitForTimeout(500); }
  const waited = (Date.now() - tW) / 1000;
  if (!shown) { const diag = await p.evaluate(() => { const r = window.__fi2.trainRide, w = r.lastWant; return { want: { x: +w.x.toFixed(1), z: +w.z.toFixed(1), can: w.can }, ride: window.__fi2.rideRef?.current }; }); check(`${tag}: Board prompt shows when the train stands at the platform`, false, `train standing seen ${standSeen}, ${JSON.stringify(diag)}`); }
  else check(`${tag}: Board prompt shows`, true, `waited ${waited.toFixed(0)} s`);
  return shown ? k : -1;
}

async function partRide(c) {
  const { p } = c;
  const s = await flyToNextTrain(p, c, 'ride'); if (!s) return;
  const stampNear = await p.evaluate(() => { const e = document.querySelector('[data-stamp-go]'); return !!e && !e.hidden && e.getBoundingClientRect().width > 0; });
  note(stampNear ? 'ok' : 'info', 'stamp: Collect stamp offered right where Fly there lands', stampNear ? '' : 'not in reach of the landing spot (walk to the station house)');
  await shot(p, 'platform');
  const k = await waitBoard(p, s, 'ride'); if (k < 0) return;
  const ov0 = await overlaps(p); if (ov0.pairs.length) note('WARN', 'platform: HUD overlaps', ov0.pairs.join(' ; '));
  await shot(p, 'board-prompt');
  await realClick(p, '[data-train-board]'); await p.waitForTimeout(1200);
  let r = await p.evaluate(() => ({ a: window.__fi2.trainRide.active, k: window.__fi2.trainRide.train, j: window.__fi2.trainRide.seat }));
  if (!r.a) { await p.evaluate(() => document.querySelector('[data-train-board]')?.click()); await p.waitForTimeout(1200); r = await p.evaluate(() => ({ a: window.__fi2.trainRide.active, k: window.__fi2.trainRide.train, j: window.__fi2.trainRide.seat })); check('ride: a real tap on Board boards', false, `element click boarded: ${r.a}`); }
  check('ride: boarded', r.a, `train ${r.k} seat ${r.j}`); if (!r.a) return; await tl(p, 'boarded');
  const note0 = await p.evaluate(() => document.querySelector('[data-train-note]')?.textContent || ''); note('info', 'ride: first note', note0.slice(0, 90));
  console.log(`  cluster while seated: ${(await clusterLabels(p)).join(' | ')}`);
  // every camera view: a real tap on the camera button, then 3 s of frames
  const views = []; for (let i = 0; i < 9; i++) {
    const v = await p.evaluate(() => window.__fi2.trainRide.view);
    await p.waitForTimeout(1500); const f = await frames(p, 3000); const ov = await overlaps(p);
    const said = await p.evaluate(() => document.querySelector('[data-train-cam-say]')?.textContent || '');
    views.push(v); console.log(`  view ${v.padEnd(7)} p50 ${f.p50} p95 ${f.p95} max ${f.max} ms (${f.n} frames, ${f.longTasks} long tasks, max ${f.longMax} ms)${said ? ` said "${said}"` : ''}`);
    if (ov.pairs.length) note('WARN', `view ${v}: HUD overlaps`, ov.pairs.join(' ; ')); if (ov.offscreen.length) note('WARN', `view ${v}: off screen`, ov.offscreen.join(' ; '));
    if (['seat', 'inside', 'above'].includes(v)) await shot(p, `view-${v}`);
    if (i < 8) { if (!(await realClick(p, '[data-train-cam]'))) { check('ride: camera button present', false); break; } }
    if (i === 8) break;
  }
  await tl(p, 'after views');
  check('ride: the camera button cycles all 8 views and back', new Set(views).size === 8 && views[8] === views[0], views.join(' > '));
  // stand up and walk the aisle (cluster "walk"), then sit again
  const lab = await clusterLabels(p);
  const walkBtn = await p.$('[data-job-buttons] button[data-job-button="walk"], [data-job-buttons] button[aria-label*="Stand" i], [data-job-buttons] button[aria-label*="Walk" i]');
  if (walkBtn) { await walkBtn.click().catch(() => {}); await p.waitForTimeout(1200);
    const st = await p.evaluate(() => window.__fi2.trainRide.standing); check('ride: Stand up from the seat', st, lab.join(' | '));
    const n1 = await p.evaluate(() => document.querySelector('[data-train-note]')?.textContent || ''); note('info', 'ride: walk note', n1.slice(0, 90));
    await p.keyboard.down('w'); await p.waitForTimeout(1500); await p.keyboard.up('w'); await p.waitForTimeout(500);
    console.log(`  cluster standing: ${(await clusterLabels(p)).join(' | ')}`);
    const talk = await p.$('button:visible:has-text("Talk"), button[aria-label*="Talk" i]:visible'); if (talk) { const tl = (await talk.getAttribute('aria-label')) || (await talk.innerText()); await talk.click().catch(() => {}); await p.waitForTimeout(1800);
      const dlg = await p.evaluate(() => { const d = document.querySelector('dialog[open], [role="dialog"]'); return d ? (d.innerText || '').replace(/\s+/g, ' ').slice(0, 160) : ''; }); note('info', `ride: "${tl}"`, dlg || '(no panel)'); await shot(p, 'talk');
      const st0 = await p.evaluate(() => window.__fi2.trains.states[window.__fi2.trainRide.train].s);
      await p.waitForTimeout(3000); const st1 = await p.evaluate(() => window.__fi2.trains.states[window.__fi2.trainRide.train].s); note('info', 'ride: the train while the talk panel is open', `moved ${(st1 - st0).toFixed(1)} m in 3 s`);
      for (const t of ['Thanks, see you around.', 'Done']) if (await p.click(`button:visible:has-text("${t}")`, { timeout: 800 }).then(() => true).catch(() => false)) break;
      await p.waitForTimeout(1200); check('ride: the talk panel closes back to the ride', !(await p.evaluate(() => !!document.querySelector('dialog[open]'))) && await p.evaluate(() => window.__fi2.trainRide.active)); }
    else note('info', 'ride: no Talk button after walking 1.5 s up the aisle');
    const sit = await p.$('[data-job-buttons] button[aria-label^="Sit" i]:not([disabled])'); if (sit) { await sit.click().catch(() => {}); await p.waitForTimeout(1200); check('ride: Sit again', !(await p.evaluate(() => window.__fi2.trainRide.standing))); }
    else note('info', 'ride: no Sit button after the walk (not by a free seat)');
    await shot(p, 'walk-aisle');
  } else note('WARN', 'ride: no Stand/Walk button in the cluster', lab.join(' | '));
  // ride to the next stop: the pill, the announcement, get off
  const tN = Date.now(); let exitShown = false, nextNote = '';
  for (let i = 0; i < 200 && !exitShown; i++) { if (i % 20 === 0) console.log('  wait: ' + JSON.stringify(await p.evaluate(() => { const f = window.__fi2, r = f.trainRide, st = f.trains.states[r.train] || {}; return { active: r.active, standing: r.standing, view: r.view, at: st.at, next: st.next, v: +(st.v || 0).toFixed(1), dlg: !!document.querySelector('dialog[open]'), note: (document.querySelector('[data-train-note]')?.textContent || '').slice(0, 50) }; })));
    exitShown = await p.evaluate(() => !!document.querySelector('[data-train-exit]')); if (!nextNote) { const n = await p.evaluate(() => document.querySelector('[data-train-note]')?.textContent || ''); if (/^Next stop/.test(n)) nextNote = n; } if (!exitShown) await p.waitForTimeout(500); }
  note('info', 'ride: next-stop announcement', nextNote.slice(0, 110) || '(none seen)');
  check('ride: Get off pill shows at the next stop', exitShown, `${((Date.now() - tN) / 1000).toFixed(0)} s`);
  if (!exitShown) return;
  await tl(p, 'pill shown');
  const ov1 = await overlaps(p); if (ov1.pairs.length) note('WARN', 'stop: HUD overlaps with the Get off pill', ov1.pairs.join(' ; '));
  await shot(p, 'getoff-pill');
  await realClick(p, '[data-train-exit]'); const tE = Date.now();
  let off = false; for (let i = 0; i < 40 && !off; i++) { await p.waitForTimeout(400); off = !(await p.evaluate(() => window.__fi2.trainRide.active)); }
  check('ride: Get off (pill) walks you out onto the platform', off, `${((Date.now() - tE) / 1000).toFixed(1)} s`);
  const after = await p.evaluate(() => ({ platform: (() => { const P = window.__fi2.player.root.position, names = ['north', 'west', 'south', 'summit', 'cay']; let best = '', d = 1e9; for (let i = 0; i < 5; i++) { const sp = window.__fi2.trainRide.stationSpot(i, 0), e = Math.hypot(sp.x - P.x, sp.z - P.z); if (e < d) { d = e; best = names[i]; } } return `${best} ${d.toFixed(0)} m`; })(), ride: window.__fi2.rideRef?.current, stamp: (() => { const e = document.querySelector('[data-stamp-go]'); return !!e && !e.hidden && e.getBoundingClientRect().width > 0; })() }));
  note('info', 'after getting off', JSON.stringify(after));
  if (after.stamp) { await realClick(p, '[data-stamp-go]'); await p.waitForTimeout(2500); await shot(p, 'stamp'); const book = await p.evaluate(() => !!document.querySelector('[class*="StampBook" i], [data-stamp-book]')); check('stamp: Collect stamp opens the book', book); await p.keyboard.press('Escape'); await p.waitForTimeout(800); }
}
async function partMem(c) {
  const { p } = c;
  const s = await flyToNextTrain(p, c, 'mem'); if (!s) return; const k = await waitBoard(p, s, 'mem'); if (k < 0) return;
  await p.evaluate(() => document.querySelector('[data-train-board]')?.click()); await p.waitForTimeout(2000);
  const h0 = await p.evaluate(() => performance.memory.usedJSHeapSize); const g0 = await p.evaluate(() => { const i = window.__fi2.renderer.info.memory; return [i.geometries, i.textures]; });
  const rows = []; const end = Date.now() + memMin * 60000; let pressed = 0;
  while (Date.now() < end) { const f = await frames(p, 4000); rows.push(f); await p.waitForTimeout(16000);
    if (rows.length % 3 === 0) console.log('  mem t+' + rows.length * 20 + ' s: ' + JSON.stringify(await p.evaluate(() => { const i = window.__fi2.renderer.info.memory; return { heapMB: +(performance.memory.usedJSHeapSize / 1e6).toFixed(0), geo: i.geometries, tex: i.textures, riding: window.__fi2.trainRide.active }; })));
    // stay on: never press Get off (the ride goes round the loop); keep the tab "active"
    await p.mouse.move(vp.width / 2 + (pressed++ % 2) * 4, vp.height / 2); }
  const h1 = await p.evaluate(() => performance.memory.usedJSHeapSize); const g1 = await p.evaluate(() => { const i = window.__fi2.renderer.info.memory; return [i.geometries, i.textures]; });
  const still = await p.evaluate(() => window.__fi2.trainRide.active);
  const p95 = rows.map((r) => r.p95).sort((a, b) => a - b), p50 = rows.map((r) => r.p50).sort((a, b) => a - b);
  note('info', `mem: ${memMin} min riding`, `heap ${(h0 / 1e6).toFixed(1)} -> ${(h1 / 1e6).toFixed(1)} MB, geometries ${g0[0]}->${g1[0]}, textures ${g0[1]}->${g1[1]}, still riding ${still}, frame p50 median ${p50[p50.length >> 1]} ms, p95 worst ${p95[p95.length - 1]} ms`);
  check('mem: heap growth under 40 MB over the ride', h1 - h0 < 40e6, `${((h1 - h0) / 1e6).toFixed(1)} MB`);
  check('mem: no geometry/texture leak (growth <= 10)', g1[0] - g0[0] <= 10 && g1[1] - g0[1] <= 10);
}
async function partNight(c) {
  const { p } = c; const s = await flyToNextTrain(p, c, 'night'); if (!s) return; await shot(p, 'night-platform');
  const k = await waitBoard(p, s, 'night'); if (k < 0) return; await realClick(p, '[data-train-board]'); await p.waitForTimeout(6000); await shot(p, 'night-seat');
  const f = await frames(p, 3000); note('info', 'night: seat view frames', `p50 ${f.p50} p95 ${f.p95}`);
}
async function partMp(b) {
  const A = await boot(b, { seed: '0'.repeat(32), label: 'mp-A' }); const B = await boot(b, { seed: '1'.repeat(32), label: 'mp-B' });
  try {
    const s = await flyToNextTrain(A.p, A, 'mp A'); if (!s) return;
    if (!(await openMap(B.p))) return; await B.p.evaluate((pin) => document.querySelector(pin)?.dispatchEvent(new MouseEvent('click', { bubbles: true })), PIN(s.id)); await B.p.waitForTimeout(4000); await landIfFlying(B.p, 'mp B');
    const nearest = (pg, x, z) => pg.evaluate(({ x, z }) => { let best = Infinity; const t = window.__fi2.party?.tapSpots?.(); if (t) for (const sp of t.spots) best = Math.min(best, Math.hypot(sp.x - x, sp.z - z)); return best; }, { x, z });
    let dA = Infinity, dB = Infinity; for (let i = 0; i < 40; i++) { const a = await me(A.p), bb = await me(B.p); dA = await nearest(A.p, bb.x, bb.z); dB = await nearest(B.p, a.x, a.z); if (dA < 3 && dB < 3) break; await A.p.waitForTimeout(1000); if (i % 8 === 7) for (const c of [A, B]) await c.p.keyboard.press('Shift'); }
    const shownN = async (pg) => pg.evaluate(() => ({ shown: window.__fi2.party?.shown, spots: window.__fi2.party?.tapSpots?.()?.spots?.length }));
    check('mp: A and B (public world, live relay) draw each other on the platform', dA < 3 && dB < 3, `A sees B ${dA.toFixed(1)} m off, B sees A ${dB.toFixed(1)} m off; A ${JSON.stringify(await shownN(A.p))}, B ${JSON.stringify(await shownN(B.p))}`);
    const k = await waitBoard(A.p, s, 'mp A'); if (k < 0) return;
    await A.p.evaluate(() => document.querySelector('[data-train-board]')?.click()); await A.p.waitForTimeout(1500);
    const r = await A.p.evaluate(() => ({ k: window.__fi2.trainRide.train, j: window.__fi2.trainRide.seat, a: window.__fi2.trainRide.active }));
    let v = null; for (let i = 0; i < 20; i++) { v = await B.p.evaluate(({ k, j }) => { const t = window.__fi2.trains, seat = { x: 0, y: 0, z: 0, yaw: 0 }; t.seatPose(k, j, seat); let best = Infinity; const ts = window.__fi2.party?.tapSpots?.(); if (ts) for (const sp of ts.spots) best = Math.min(best, Math.hypot(sp.x - seat.x, sp.z - seat.z)); return { ridden: t.ridden[k], best }; }, r); if (v.ridden && v.best < 1.2) break; await B.p.waitForTimeout(500); }
    check('mp: B draws A seated on the standing train', r.a && v && v.ridden === 1 && v.best < 1.2, v ? `ridden ${v.ridden}, ${v.best.toFixed(2)} m from the seat` : '');
    await shot(B.p, 'mp-B-sees-A');
    for (const [n, c] of [['A', A], ['B', B]]) { if (c.errs.length) note('FAIL', `mp ${n}: page errors`, c.errs.slice(0, 3).join(' | ')); const relay = c.net.filter((x) => /relay|multiplayer|wss?:|partykit/i.test(x)); if (relay.length) note('WARN', `mp ${n}: relay network errors`, relay.slice(0, 3).join(' | ')); }
  } finally { await A.ctx.close(); await B.ctx.close(); }
}
function report(c, tag) {
  if (c.errs.length) note('FAIL', `${tag}: page errors`, [...new Set(c.errs)].slice(0, 4).join(' | ')); else check(`${tag}: no page errors`, true);
  const w = [...new Set(c.warns)]; if (w.length) note('info', `${tag}: console errors/warnings (${w.length} distinct)`, w.slice(0, 8).join(' || '));
  const n = [...new Set(c.net)]; if (n.length) note('WARN', `${tag}: network errors (${n.length} distinct)`, n.slice(0, 8).join(' || '));
}
(async () => {
  const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--mute-audio', '--enable-precise-memory-info', '--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
  try {
    if (parts.includes('cold')) { const c = await boot(b, { save: false, label: 'cold' }); await shot(c.p, 'cold-ready');
      // the first-time Welcome tour: a kid taps Next (then the last button) until it closes
      const tour = []; for (let i = 0; i < 8; i++) { const h = await c.p.evaluate(() => { const d = document.querySelector('dialog[open], [role="dialog"]'); return d ? (d.querySelector('h1,h2,h3')?.textContent || d.innerText.slice(0, 30)).trim() : ''; }); if (!h) break; tour.push(h);
        let hit = false; for (const t of ['Skip', 'Next', "Let's play", "Let's go", 'Play', 'Start', 'Done', 'Got it']) if (await c.p.click(`dialog[open] button:visible:text-is("${t}"), [role="dialog"] button:visible:text-is("${t}")`, { timeout: 400 }).then(() => true).catch(() => false)) { hit = true; break; }
        if (!hit) { const labs = await c.p.evaluate(() => [...document.querySelectorAll('dialog[open] button, [role="dialog"] button')].map((b) => b.innerText.trim()).filter(Boolean).slice(0, 8)); tour.push(`[stuck: ${labs.join(' | ')}]`); await c.p.click('button:visible:text-is("Skip")', { timeout: 500 }).catch(() => {}); }
        await c.p.waitForTimeout(1200); }
      note('info', 'cold: welcome tour', tour.join(' > '));
      const lt = await c.p.evaluate(() => { const l = window.__lt; return { n: l.length, sum: l.reduce((s, x) => s + x[1], 0), max: l.reduce((m, x) => Math.max(m, x[1]), 0) }; });
      note('info', 'cold: island ready (no save, welcome tapped through)', `${(c.readyMs / 1000).toFixed(1)} s, long tasks ${lt.n} (total ${lt.sum} ms, max ${lt.max} ms)`);
      const s = await flyToNextTrain(c.p, c, 'cold'); if (s) { const k = await waitBoard(c.p, s, 'cold'); if (k >= 0) note('info', 'cold: first-load time to a Board prompt', `${((Date.now() - c.t0) / 1000).toFixed(0)} s`); }
      report(c, 'cold'); await c.ctx.close(); }
    if (parts.includes('pins')) { const c = await boot(b, { label: 'pins' }); await openMap(c.p);
      for (const id of ['north', 'west', 'south', 'summit', 'cay']) { const h = await c.p.evaluate((pin) => { const e = document.querySelector(pin); if (!e) return null; const r = e.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, t = document.elementFromPoint(x, y);
          return { x: Math.round(x), y: Math.round(y), w: Math.round(r.width), inView: x > 0 && y > 0 && x < innerWidth && y < innerHeight, onPin: !!t && t.closest('[data-train-station]') === e, top: t ? `${t.tagName}.${String(t.getAttribute('class') || '').slice(0, 30)} ${(t.closest('[aria-label]')?.getAttribute('aria-label') || '').slice(0, 40)}` : 'none' }; }, PIN(id));
        check(`pins: the ${id} station pin is on screen and tappable on the open map`, h && h.inView && h.onPin, JSON.stringify(h)); }
      await shot(c.p, 'map-pins'); report(c, 'pins'); await c.ctx.close(); }
    if (parts.includes('ride')) { const c = await boot(b, { label: 'ride' }); const gl = await c.p.evaluate(() => { const g = window.__fi2.renderer.getContext(), e = g.getExtension('WEBGL_debug_renderer_info'); return e ? g.getParameter(e.UNMASKED_RENDERER_WEBGL) : '?'; }); console.log(`GL ${gl}`);
      try { await partRide(c); } catch (e) { check('ride ran', false, e.message.slice(0, 200)); } report(c, 'ride'); await c.ctx.close(); }
    if (parts.includes('mem')) { const c = await boot(b, { label: 'mem' }); try { await partMem(c); } catch (e) { check('mem ran', false, e.message.slice(0, 200)); } report(c, 'mem'); await c.ctx.close(); }
    if (parts.includes('night')) { const c = await boot(b, { night: true, label: 'night' }); try { await partNight(c); } catch (e) { check('night ran', false, e.message.slice(0, 200)); } report(c, 'night'); await c.ctx.close(); }
    if (parts.includes('mp')) { try { await partMp(b); } catch (e) { check('mp ran', false, e.message.slice(0, 200)); } }
  } catch (e) { check('ran to the end', false, e.message.slice(0, 200)); }
  finally { await b.close(); }
  const bad = results.filter((r) => r.sev === 'FAIL').length; console.log(bad ? `${bad} FAILED` : 'no failures'); process.exit(bad ? 1 : 0);
})();
