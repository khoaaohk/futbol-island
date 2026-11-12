// Konbini: the nearer thing wins (public island phase 1, owner Nov 12 2026), headless. Never port 8092.
// A stranger standing in front of a shelf: the tap opens their card (the shelf pick is not run). A shelf with no one in front: the
// shelf pick runs exactly as before (no card). Flag off (--profile=off): taps never open a card.
// Needs:  relay  MP_PORT=8803 MP_DEV=1 MP_WORLD_OPEN=1 node multiplayer/dev-relay/server.mjs
//         app    NEXT_DIST_DIR=.next-konbini NEXT_PUBLIC_MULTIPLAYER=1 NEXT_PUBLIC_PUBLIC_WORLD=1 NEXT_PUBLIC_MULTIPLAYER_URL=http://127.0.0.1:8803 npx next dev -p 8154
// Run:    node --experimental-websocket scripts/check-mp-konbini-tap.cjs --port=8154 --relay=http://127.0.0.1:8803 [--profile=phone,desktop|off]
// Screenshots: docs/qa/public-konbini-card-<profile>.png. One headless Chrome (--mute-audio), closed at the end.
const { chromium } = require('playwright');
const path = require('path');
const arg = (k, d) => { const a = process.argv.find((s) => s.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const port = arg('port'), relay = (arg('relay', '') || '').replace(/\/$/, '');
if (!port || port === '8092') { console.error('give --port=<n> (never 8092, the owner\'s server)'); process.exit(2); }
const url = `http://localhost:${port}`, QA = path.join(__dirname, '../docs/qa');
const profiles = arg('profile', 'phone,desktop').split(',');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
const check = (name, ok, extra = '') => { results.push({ name, ok: !!ok }); console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${extra ? ' (' + extra + ')' : ''}`); };

async function start(p) { // the title screen (as check-mp-player-tap.cjs)
  for (let i = 0; i < 90 && !(await p.evaluate(() => !!window.__fi2)); i++) {
    for (const t of ['I saved it', 'Get my code', 'Play']) await p.click(`button:visible:has-text("${t}")`, { timeout: 300 }).catch(() => {});
    if (i === 0) await p.click('text=Get my save code', { timeout: 4000 }).catch(() => {});
    await p.waitForTimeout(2000);
  }
  await p.waitForFunction(() => !!window.__fi2 && !!document.querySelector('[data-hud-triggers]'), null, { timeout: 180000 });
  await p.waitForTimeout(2500);
}
async function boot(b, vp, mobile) {
  const ctx = await b.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2 : 1 });
  await ctx.addInitScript(() => { try { if (!sessionStorage.getItem('__t_boot')) { localStorage.setItem('fi2-welcome-v1', 'completed'); localStorage.setItem('fi2-public-hint-v1', 'card hint'); } sessionStorage.setItem('__t_boot', '1'); } catch { /* */ } });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message.slice(0, 200)));
  p.on('console', (m) => { if (m.type() === 'error' && !/Download the React DevTools|favicon|ERR_CONNECTION|Failed to load resource/.test(m.text())) errs.push(m.text().slice(0, 200)); });
  await p.goto(url + '/play', { timeout: 180000 }); await p.waitForTimeout(3000);
  await start(p);
  return { ctx, p, errs };
}
// Every drawn stranger's body middle on screen, plus the shelf depth under it and its own camera depth (window.__konbini = the scene).
const bodies = (p) => p.evaluate(() => {
  const h = window.__fi2PublicDraw, k = window.__konbini; if (!h || !k) return [];
  const out = [], canvas = document.querySelector('canvas'), r = canvas.getBoundingClientRect();
  for (const layer of h.layers) {
    if (typeof layer.tapSpots !== 'function') continue;
    const { camera, spots } = layer.tapSpots(); if (!camera) continue;
    const m = camera.matrixWorldInverse.elements, q = camera.projectionMatrix.elements;
    const view = (x, y, z) => [m[0] * x + m[4] * y + m[8] * z + m[12], m[1] * x + m[5] * y + m[9] * z + m[13], m[2] * x + m[6] * y + m[10] * z + m[14], m[3] * x + m[7] * y + m[11] * z + m[15]];
    const proj = (x, y, z) => { const [vx, vy, vz, vw] = view(x, y, z);
      const cx = q[0] * vx + q[4] * vy + q[8] * vz + q[12] * vw, cy = q[1] * vx + q[5] * vy + q[9] * vz + q[13] * vw, cz = q[2] * vx + q[6] * vy + q[10] * vz + q[14] * vw, cw = q[3] * vx + q[7] * vy + q[11] * vz + q[15] * vw;
      return { x: r.left + (cx / cw + 1) / 2 * r.width, y: r.top + (1 - cy / cw) / 2 * r.height, z: cz / cw }; };
    for (const s of spots) { const kk = Math.min(1, s.k), f = proj(s.x, s.y, s.z), hd = proj(s.x, s.y + 2.1 * kk, s.z);
      if (!(f.z > -1 && f.z < 1)) continue;
      const x = (f.x + hd.x) / 2, y = (f.y + hd.y) / 2;
      // points up the body (middle .. near the head): a shelf hit there and that body point's own depth
      const at = [.5, .65, .8].map((u) => { const px = f.x + (hd.x - f.x) * u, py = f.y + (hd.y - f.y) * u; return { u, x: px, y: py, depth: -view(s.x, s.y + 2.1 * kk * u, s.z)[2], shelf: k.shelfDepth(px, py) }; });
      out.push({ id: s.id, k: s.k, x, y, h: Math.abs(f.y - hd.y), at }); }
  }
  return out;
});
const card = (p) => p.evaluate(() => { const c = document.querySelector('[data-player-card]'); return c ? +c.getAttribute('data-player-card') : null; });
async function press(p, mobile, x, y) { if (mobile) await p.touchscreen.tap(x, y); else await p.mouse.click(x, y); await p.waitForTimeout(600); }
const spyPick = (p) => p.evaluate(() => { const k = window.__konbini; if (k.__spied) { k.__picks = []; return; } const orig = k.pick.bind(k); k.__picks = []; k.pick = (x, y) => { const r = orig(x, y); k.__picks.push(r); return r; }; k.__spied = true; });
const picks = (p) => p.evaluate(() => window.__konbini.__picks.slice());
const onCanvas = (p, x, y) => p.evaluate(([a, c]) => document.elementFromPoint(a, c)?.tagName === 'CANVAS', [x, y]);

async function toKonbini(p) {
  await p.goto(url + '/konbini', { timeout: 180000 });
  await p.waitForFunction(() => !!window.__konbini, null, { timeout: 120000 });
  await p.waitForTimeout(6000); // the door walk-in, the room layer
}
async function run(b, name, vp, mobile) {
  const { runBots } = await import('../multiplayer/bots/bot.mjs');
  const tag = 't' + Date.now().toString(36);
  // strangers standing still in the Konbini (room 8), spread over the floor in front of the shelves
  for (const [i, at] of [[0, '0,1'], [1, '-3,0'], [2, '3,0'], [3, '0,-2']].entries()) void runBots({ world: true, url: relay, n: 1, ms: 240000, room: 8, roomAt: at[1].split(',').map(Number), devip: tag + i });
  await wait(3000);
  const { ctx, p, errs } = await boot(b, vp, mobile);
  for (let i = 0; i < 4 && !(await p.evaluate(() => !!document.querySelector('[data-public-count]'))); i++) { // first input: connect
    if (mobile) await p.touchscreen.tap(vp.width * (.3 + .2 * (i % 3)), i % 2 ? 260 : 90); else await p.keyboard.press('ArrowUp');
    await p.keyboard.press('ArrowUp').catch(() => {});
    await p.waitForFunction(() => !!document.querySelector('[data-public-count]'), null, { timeout: 15000 }).catch(() => {});
  }
  await p.waitForTimeout(3000);
  console.log(`${name}: on the island, public count`, await p.evaluate(() => document.querySelector('[data-public-count]')?.textContent ?? null));
  await toKonbini(p);
  let bs = [];
  for (let i = 0; i < 30 && !bs.length; i++) { bs = (await bodies(p)).filter((x) => x.k > .6 && x.h > 8 && x.x > 40 && x.x < vp.width - 40 && x.y > 100 && x.y < vp.height - 200); if (!bs.length) await p.waitForTimeout(1000); }
  if (!bs.length) console.log('debug', JSON.stringify(await p.evaluate(() => { const h = window.__fi2PublicDraw; return { chip: document.querySelector('[data-room-party-chip],[data-public-count]')?.textContent ?? null, layers: h ? h.layers.length : -1, spots: h ? h.layers.map((l) => typeof l.tapSpots === 'function' ? l.tapSpots().spots.length : 'x') : null }; })));
  check(`${name}: strangers drawn in the Konbini`, bs.length > 0, `${bs.length}`);
  // 1. a stranger with a shelf BEHIND them (the old failure): their card opens, the shelf pick never runs
  const front = [];
  for (const x of bs) for (const a of x.at) if (a.shelf !== null && a.depth < a.shelf - .05 && await onCanvas(p, a.x, a.y)) { front.push({ id: x.id, x: a.x, y: a.y }); break; }
  check(`${name}: a stranger stands in front of a shelf (the old failing case)`, front.length > 0, bs.map((x) => `#${x.id} ` + x.at.map((a) => `${a.depth.toFixed(1)}/${a.shelf === null ? '-' : a.shelf.toFixed(1)}`).join(' ')).join(', '));
  if (front.length) {
    await spyPick(p);
    const t = front[0];
    await press(p, mobile, t.x, t.y);
    const c = await card(p), pk = await picks(p);
    check(`${name}: tap on that stranger opens their card`, c === t.id, `card ${c} want ${t.id}`);
    check(`${name}: and the shelf pick did not run`, pk.length === 0, JSON.stringify(pk));
    await p.screenshot({ path: path.join(QA, `public-konbini-card-${name}.png`) });
    await p.keyboard.press('Escape'); await p.waitForTimeout(600);
    if (await card(p)) { await p.click('[data-player-card] [data-act="card-done"]', { timeout: 1500 }).catch(() => {}); await p.waitForTimeout(500); }
  }
  // 2. a shelf with NO stranger in front: the shelf pick runs and takes it (no card)
  const now = await bodies(p);
  let spot = null;
  for (let y = 140; y < vp.height - 220 && !spot; y += 24) for (let x = 60; x < vp.width - 60 && !spot; x += 24) {
    if (now.some((o) => Math.hypot(o.x - x, o.y - y) < Math.max(70, o.h))) continue;
    if (await p.evaluate(([a, c]) => window.__konbini.shelfDepth(a, c) !== null, [x, y]) && await onCanvas(p, x, y)) spot = { x, y };
  }
  check(`${name}: a clear shelf spot found`, !!spot);
  if (spot) {
    await spyPick(p);
    await press(p, mobile, spot.x, spot.y);
    const pk = await picks(p), c = await card(p);
    check(`${name}: shelf tap with no one in front: the shelf pick takes it`, pk.length === 1 && pk[0] !== null, JSON.stringify(pk));
    check(`${name}: and no card`, c === null);
  }
  check(`${name}: no console errors`, errs.length === 0, errs.slice(0, 3).join(' | '));
  await ctx.close();
}
async function runOff(b) { // FLAG-OFF server: shelf taps as before, never a card, no party code
  const { ctx, p, errs } = await boot(b, { width: 390, height: 664 }, true);
  await toKonbini(p);
  await spyPick(p);
  for (const [x, y] of [[195, 300], [120, 380], [260, 340]]) await press(p, true, x, y);
  check('off: no card', !(await card(p)));
  check('off: every tap went to the room pick', (await picks(p)).length === 3);
  check('off: no console errors', errs.length === 0, errs.slice(0, 3).join(' | '));
  await ctx.close();
}

(async () => {
  const b = await chromium.launch({ channel: 'chrome', args: ['--mute-audio', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  try {
    for (const pr of profiles) {
      if (pr === 'off') await runOff(b);
      else if (pr === 'phone') await run(b, 'phone', { width: 390, height: 664 }, true);
      else if (pr === 'desktop') await run(b, 'desktop', { width: 1280, height: 800 }, false);
    }
  } finally { await b.close(); }
  const bad = results.filter((r) => !r.ok);
  console.log(bad.length ? `check-mp-konbini-tap: ${bad.length} FAILED of ${results.length}` : `check-mp-konbini-tap: all ${results.length} passed`);
  process.exit(bad.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
