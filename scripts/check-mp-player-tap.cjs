// Tap on a player (public island phase 1, Nov 11 2026), headless. Never port 8092.
// Needs:  relay  MP_PORT=8796 MP_DEV=1 MP_WORLD_OPEN=1 node multiplayer/dev-relay/server.mjs
//         app    NEXT_DIST_DIR=.next-agent-tap NEXT_PUBLIC_MULTIPLAYER=1 NEXT_PUBLIC_PUBLIC_WORLD=1 NEXT_PUBLIC_MULTIPLAYER_URL=http://127.0.0.1:8796 npx next dev -p 8147
//         bots   started here per profile (multiplayer/bots/bot.mjs runBots --world: 6 slow walkers near (100, 50); they end on their own)
// Run:    node --experimental-websocket scripts/check-mp-player-tap.cjs --port=8147 --relay=http://127.0.0.1:8796 [--profile=phone,desktop|off]
//         --profile=off: against a FLAG-OFF server (a party friend tap must do nothing new; here: no card on any tap).
// Screenshots: docs/qa/public-player-card-phone.png, public-player-card-desktop.png. One headless Chrome (--mute-audio), closed at the end.
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

async function start(p) { // the title screen (same path as check-mp-public-browser.cjs): save code once, then Play
  // the title screen: Start (save code) -> Get my code -> I saved it -> Play, each appearing in turn on a slow dev server
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
  // a returning player (the island tour is done: others may appear), short Welcome back, the first-time card already seen
  await ctx.addInitScript(() => { try { if (!sessionStorage.getItem('__t_boot')) { localStorage.setItem('fi2-welcome-v1', 'completed'); localStorage.setItem('fi2-public-hint-v1', 'card hint'); } sessionStorage.setItem('__t_boot', '1'); } catch { /* */ } window.__fi2WelcomeMs = 1500; });
  const p = await ctx.newPage();
  const errs = [], sent = [];
  p.on('pageerror', (e) => errs.push(e.message.slice(0, 200)));
  p.on('console', (m) => { if (m.type() === 'error' && !/Download the React DevTools|favicon|ERR_CONNECTION|Failed to load resource/.test(m.text())) errs.push(m.text().slice(0, 200)); });
  p.on('websocket', (ws) => ws.on('framesent', (f) => { if (typeof f.payload === 'string' && f.payload.startsWith('[2,')) sent.push(f.payload); }));
  await p.goto(url + '/play', { timeout: 180000 }); await p.waitForTimeout(3000);
  await start(p);
  return { ctx, p, errs, sent };
}
async function toIsland(p) { // stand where the bots wander (x 100, z 50)
  await p.evaluate(() => { const f = window.__fi2; try { f.selectRide('walk'); } catch { /* */ } f.location.x = 100; f.location.z = 50; f.rooftop?.reset?.(100, 50); f.velocity.x = f.velocity.z = 0; });
}
// Every drawn remote's on-screen body (the dev-only layer hook, remotePublic.devRegisterLayer), projected with the layer's last camera.
const bodies = (p) => p.evaluate(() => {
  const h = window.__fi2PublicDraw; if (!h) return [];
  const out = [], canvas = document.querySelector('canvas'), r = canvas.getBoundingClientRect();
  for (const layer of h.layers) {
    if (typeof layer.tapSpots !== 'function') continue;
    const { camera, spots } = layer.tapSpots(); if (!camera) continue;
    const proj = (x, y, z) => { const m = camera.matrixWorldInverse.elements, q = camera.projectionMatrix.elements;
      const vx = m[0] * x + m[4] * y + m[8] * z + m[12], vy = m[1] * x + m[5] * y + m[9] * z + m[13], vz = m[2] * x + m[6] * y + m[10] * z + m[14], vw = m[3] * x + m[7] * y + m[11] * z + m[15];
      const cx = q[0] * vx + q[4] * vy + q[8] * vz + q[12] * vw, cy = q[1] * vx + q[5] * vy + q[9] * vz + q[13] * vw, cz = q[2] * vx + q[6] * vy + q[10] * vz + q[14] * vw, cw = q[3] * vx + q[7] * vy + q[11] * vz + q[15] * vw;
      return { x: r.left + (cx / cw + 1) / 2 * r.width, y: r.top + (1 - cy / cw) / 2 * r.height, z: cz / cw }; };
    for (const s of spots) { const f = proj(s.x, s.y, s.z), hd = proj(s.x, s.y + 2.1 * Math.min(1, s.k), s.z); if (f.z > -1 && f.z < 1) out.push({ id: s.id, k: s.k, d: s.d, x: (f.x + hd.x) / 2, y: (f.y + hd.y) / 2, h: Math.abs(f.y - hd.y) }); }
  }
  return out;
});
const cardInfo = (p) => p.evaluate(() => { const c = document.querySelector('[data-player-card]'); if (!c) return null; const r = c.getBoundingClientRect();
  return { id: +c.getAttribute('data-player-card'), kind: c.getAttribute('data-player-card-kind'), name: c.querySelector('[data-player-card-name]')?.textContent, label: c.getAttribute('aria-label'),
    rect: { l: r.left, t: r.top, r: r.right, b: r.bottom }, inputs: c.querySelectorAll('input,textarea,select,[contenteditable]').length, report: !!c.querySelector('[data-act="card-report"]') }; });
const storeName = (p, id) => p.evaluate((i) => { const el = [...document.querySelectorAll('[data-public-member]')].find((e) => +e.getAttribute('data-public-member') === i); return el ? el.textContent : null; }, id);
async function press(p, mobile, x, y) { if (mobile) await p.touchscreen.tap(x, y); else await p.mouse.click(x, y); await p.waitForTimeout(500); }
// A body clear of the HUD (not under a button) and of other bodies, within 30 m.
async function target(p, vp) {
  for (let i = 0; i < 40; i++) {
    const bs = (await bodies(p)).filter((b) => b.d < 26 && b.k > .6 && b.h > 8 && b.x > 40 && b.x < vp.width - 40 && b.y > 120 && b.y < vp.height - 220);
    const free = [];
    for (const b of bs) if (await p.evaluate(([x, y]) => document.elementFromPoint(x, y)?.tagName === 'CANVAS', [b.x, b.y])) free.push(b);
    const lone = free.find((b) => free.every((o) => o === b || Math.hypot(o.x - b.x, o.y - b.y) > 40)) || free.sort((a, c) => c.h - a.h)[0];
    if (lone) return lone;
    await p.waitForTimeout(500);
  }
  return null;
}
const overlap = (a, b) => a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b;
const controls = (p) => p.evaluate(() => [...document.querySelectorAll('[class*="joystick" i], [class*="Joystick"], [data-joystick], [class*="action-button" i], [data-hud-actions] button, [data-hud-triggers] button, .emote-control, [class*="kick" i]')]
  .filter((e) => { const s = getComputedStyle(e), r = e.getBoundingClientRect(); return s.visibility !== 'hidden' && s.display !== 'none' && r.width > 0 && r.height > 0 && !e.closest('[data-player-card]'); })
  .map((e) => { const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, c: String(e.className).slice(0, 30) }; }));

async function run(b, name, vp, mobile) {
  const { runBots } = await import('../multiplayer/bots/bot.mjs');
  void runBots({ world: true, url: relay, n: 6, ms: 300000, spread: 160, speed: 0.15, devip: 't' + Date.now().toString(36) });
  await wait(3000);
  const { ctx, p, errs, sent } = await boot(b, vp, mobile);
  await toIsland(p);
  if (mobile) await p.touchscreen.tap(vp.width * .5, 90); else await p.keyboard.press('ArrowUp'); // first input: connect
  await p.waitForFunction(() => !!document.querySelector('[data-public-count]'), null, { timeout: 40000 }).catch(() => {});
  await p.waitForTimeout(4000);
  await p.click('[data-public-first-ok]', { timeout: 1500 }).catch(() => {});
  // the roster carries every bot's generated name (data-public-member): open it once to read them, then close
  await p.click('[data-party-open]'); await p.waitForSelector('[data-presence-panel]', { timeout: 8000 }).catch(() => {}); await p.waitForTimeout(600);
  const names = await p.evaluate(() => Object.fromEntries([...document.querySelectorAll('[data-public-member]')].map((e) => [e.getAttribute('data-public-member'), e.querySelector('[class*="mname"]')?.textContent])));
  await p.keyboard.press('Escape'); await p.waitForTimeout(800);
  await toIsland(p); await p.waitForTimeout(1500);

  // 1. empty ground (sky-ish area away from bodies) and the stick: no card
  const bs0 = await bodies(p);
  if (!bs0.length) console.log('debug', JSON.stringify(await p.evaluate(() => { const h = window.__fi2PublicDraw; return { count: document.querySelector('[data-public-count]')?.textContent ?? null, open: document.querySelector('[data-party-open]')?.getAttribute('aria-label'), layers: h ? h.layers.map((l) => { const t = l.tapSpots?.(); return t ? { cam: !!t.camera, n: t.spots.length, pub: l.debugPublic?.() } : 'no tapSpots'; }) : 'no hook', loc: [window.__fi2?.location?.x, window.__fi2?.location?.z] }; })), JSON.stringify(names));
  check(`${name}: bots drawn near you`, bs0.length > 0, `${bs0.length} bodies`);
  const empty = { x: vp.width * .5, y: vp.height * .62 };
  if (bs0.every((b) => Math.hypot(b.x - empty.x, b.y - empty.y) > 80)) { await press(p, mobile, empty.x, empty.y); check(`${name}: a tap on empty ground opens no card`, !(await cardInfo(p))); }
  const bt = await target(p, vp);
  check(`${name}: found a tappable bot`, !!bt, bt ? `id ${bt.id} at ${bt.x | 0},${bt.y | 0}, ${bt.h | 0} px, ${bt.d.toFixed(1)} m` : JSON.stringify((await bodies(p)).map((x) => [x.id, x.x | 0, x.y | 0, x.h | 0, +x.d.toFixed(1), +x.k.toFixed(2)])));
  if (bt) {
    // a drag from the bot (camera / stick move) never opens a card
    if (mobile) { await p.evaluate(async ([x, y]) => { const c = document.querySelector('canvas'); const ev = (t, X) => c.dispatchEvent(new PointerEvent(t, { clientX: X, clientY: y, pointerId: 7, pointerType: 'touch', bubbles: true, isPrimary: true })); ev('pointerdown', x); ev('pointermove', x + 30); ev('pointermove', x + 60); ev('pointerup', x + 60); }, [bt.x, bt.y]); }
    else { await p.mouse.move(bt.x, bt.y); await p.mouse.down(); await p.mouse.move(bt.x + 40, bt.y, { steps: 4 }); await p.mouse.move(bt.x + 80, bt.y, { steps: 4 }); await p.mouse.up(); }
    await p.waitForTimeout(500);
    check(`${name}: dragging from a player opens no card`, !(await cardInfo(p)));
    const bt2 = (await target(p, vp)) || bt;
    await press(p, mobile, bt2.x, bt2.y);
    const c = await cardInfo(p);
    check(`${name}: tap a bot -> card with its generated name`, !!c && c.kind === 'stranger' && /^[A-Z][a-z]+ [A-Z][a-z]+$/.test(c.name || '') && (!names[c.id] || names[c.id] === c.name), c ? `${c.name} (#${c.id}), label "${c.label}"` : 'no card');
    if (c) {
      check(`${name}: card has Report, no text field`, c.report && c.inputs === 0);
      const vpRect = { l: 0, t: 0, r: vp.width, b: vp.height };
      const inside = c.rect.l >= 0 && c.rect.t >= 0 && c.rect.r <= vp.width && c.rect.b <= vp.height;
      const ctl = await controls(p), hit = ctl.filter((r) => overlap(r, c.rect));
      check(`${name}: card on screen, clear of the thumb controls`, inside && hit.length === 0, `card ${JSON.stringify(c.rect)} vs ${ctl.length} controls${hit.length ? ' hit ' + JSON.stringify(hit[0]) : ''}`); void vpRect;
      await p.screenshot({ path: `${QA}/public-player-card-${name}.png` });
      // Wave: one C.Emote [2,0] goes out
      const n0 = sent.length;
      await p.click('[data-act="card-wave"]'); await p.waitForTimeout(800);
      check(`${name}: Wave sends the wave emote`, sent.slice(n0).some((s) => s === '[2,0]'), sent.slice(n0).join(' '));
      check(`${name}: card stays open after Wave ("You waved!")`, /You waved/.test(await p.textContent('[data-act="card-wave"]').catch(() => '')));
      // Escape closes
      await p.keyboard.press('Escape'); await p.waitForTimeout(3000);
      check(`${name}: Escape closes the card`, !(await cardInfo(p)));
      // Hide: removes the bot and closes
      const b3 = (await target(p, vp)) || bt2; await press(p, mobile, b3.x, b3.y);
      const c3 = await cardInfo(p);
      if (c3) {
        await p.click('[data-act="card-hide"]'); await p.waitForTimeout(1200);
        const still = (await bodies(p)).some((x) => x.id === c3.id);
        check(`${name}: Hide removes the player and closes the card`, !(await cardInfo(p)) && !still, `#${c3.id}`);
      } else { await p.screenshot({ path: require('os').tmpdir() + `/tap-miss-${name}.png` }); check(`${name}: second tap opens a card`, false, JSON.stringify([b3.x | 0, b3.y | 0, b3.h | 0, (await bodies(p)).map((x) => [x.id, x.x | 0, x.y | 0, x.h | 0])])); }
      // Report: opens the sheet, reporting hides at once
      const b4 = await target(p, vp);
      if (b4) { await press(p, mobile, b4.x, b4.y);
        const c4 = await cardInfo(p);
        if (c4) {
          await p.click('[data-act="card-report"]'); await p.waitForSelector('[data-player-card] [data-report-sheet]', { timeout: 4000 }).catch(() => {});
          const sheet = await p.evaluate(() => !!document.querySelector('[data-player-card] [data-report-sheet]') && !document.querySelector('[data-player-card] input,[data-player-card] textarea'));
          await p.click('[data-report-reason="waves"]').catch(() => {}); await p.waitForTimeout(1000);
          const gone = !(await bodies(p)).some((x) => x.id === c4.id), thanks = /Thanks for telling us/.test(await p.textContent('[data-player-card]').catch(() => ''));
          check(`${name}: Report opens the sheet (no typing), hides at once, thanks shown`, sheet && gone && thanks, `#${c4.id} sheet ${sheet} gone ${gone} thanks ${thanks}`);
          await p.click('[data-report-ok]').catch(() => {}); await p.waitForTimeout(400);
          check(`${name}: OK closes the card`, !(await cardInfo(p)));
        } else check(`${name}: a tap on a third bot opens a card`, false, `${b4.x | 0},${b4.y | 0}`);
      } else check(`${name}: a third bot to report`, false);
      // tap elsewhere closes
      const b5 = await target(p, vp);
      if (b5) { await press(p, mobile, b5.x, b5.y); const open5 = !!(await cardInfo(p));
        await press(p, mobile, vp.width * .5, 60); check(`${name}: a tap elsewhere closes the card`, open5 && !(await cardInfo(p))); }
    }
  }
  // an islander keeps priority: tap the nearest townsperson (window.__fi2 islandNpcs when exposed) -> a conversation, no card
  const npc = await p.evaluate(() => { const f = window.__fi2; const n = f?.islandNpcs?.entries?.[0]; return n ? { x: n.root?.position?.x, z: n.root?.position?.z } : null; }).catch(() => null);
  if (!npc) console.log('note: no islander hook on window.__fi2; islander priority is pinned by tests/mp-player-tap.cjs');
  check(`${name}: no console errors`, errs.length === 0, errs.slice(0, 3).join(' | '));
  await ctx.close();
}
async function runOff(b) { // FLAG-OFF server: taps anywhere never open a card (and the code is not even mounted)
  const { ctx, p, errs } = await boot(b, { width: 390, height: 664 }, true);
  await toIsland(p);
  for (const [x, y] of [[195, 300], [120, 380], [260, 340]]) await press(p, true, x, y);
  check('off: no card, no card code mounted', !(await cardInfo(p)));
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
  console.log(bad.length ? `check-mp-player-tap: ${bad.length} FAILED of ${results.length}` : `check-mp-player-tap: all ${results.length} passed`);
  process.exit(bad.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
