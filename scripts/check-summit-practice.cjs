// Summit 5s practice area, headless check (Nov 24 2026). Needs a dev or production server (never 8092 / 9160 / 8800):
//   NEXT_DIST_DIR=.next-practice npx next start -p 9182
//   node scripts/check-summit-practice.cjs --port=9182 [--shots=<dir>]
// Phone 390x844 and desktop 1280x800 in ONE headless Chrome (--mute-audio), closed at the end. Walks onto the pitch (teleport),
// checks practice mode (HUD hidden / shown, camera cycle, Shuffle, the kick and a ball swap, the editor's drag + add + reset,
// Exit back to walking with the ball), counts the draw calls on and off, and saves one screenshot per viewport.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const arg = (k, d) => { const a = process.argv.find((s) => s.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const port = arg('port'), shots = arg('shots', '');
if (!port || ['8092', '9160', '8800'].includes(port)) { console.error('give --port=<n> (not 8092 / 9160 / 8800)'); process.exit(2); }
if (shots) fs.mkdirSync(shots, { recursive: true });
const url = `http://localhost:${port}`;
let fails = 0; const log = (ok, msg) => { if (!ok) fails++; console.log(`${ok ? 'ok  ' : 'FAIL'} ${msg}`); };
const VPS = [{ name: 'phone', vp: { width: 390, height: 844 }, mobile: true }, { name: 'desktop', vp: { width: 1280, height: 800 }, mobile: false }];

async function run(b, v) {
  const ctx = await b.newContext({ viewport: v.vp, deviceScaleFactor: v.mobile ? 2 : 1, isMobile: v.mobile, hasTouch: v.mobile });
  await ctx.route('**/api/build-id', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  const p = await ctx.newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message.slice(0, 160)));
  await p.goto(url + '/play?from=arcade', { timeout: 300000 }); await p.waitForTimeout(3000);
  for (let i = 0; i < 90 && !(await p.evaluate(() => !!(window.__fi2 && window.__fi2.practice && window.__fi2.renderer))); i++) {
    for (const t of ['I saved it', 'Get my code', 'Play']) await p.click(`button:visible:has-text("${t}")`, { timeout: 300 }).catch(() => {});
    if (i === 0) await p.click('text=Get my save code', { timeout: 4000 }).catch(() => {});
    await p.waitForTimeout(2000);
  }
  await p.waitForTimeout(2500); for (let i = 0; i < 3; i++) { if (!(await p.locator('dialog[open]').count())) break; await p.keyboard.press('Escape'); await p.waitForTimeout(400); }
  const vis = (sel) => p.evaluate((s) => { const e = document.querySelector(s); if (!e) return false; const r = e.getBoundingClientRect(), c = getComputedStyle(e); return r.width > 0 && r.height > 0 && c.visibility !== 'hidden' && c.display !== 'none'; }, sel);
  const st = () => p.evaluate(() => { const f = window.__fi2, x = f.practice; return { active: x.active, editing: x.editing, drill: x.drill, cam: x.cameraAngle, held: x.heldStyle, layout: x.layout.map((q) => [q.k, q.u, q.v]), mode: f.walkBall?.state?.mode }; });
  const calls = () => p.evaluate(async () => { await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); return window.__fi2.renderer.info.render.calls; });
  // ---- off the pitch, just outside the gate, then onto it
  const c = await p.evaluate(() => window.__fi2.practice.pitch);
  await p.evaluate((c) => window.__fi2.teleport(c.x + 10.5, c.z + 15, Math.PI), c); await p.waitForTimeout(1500);
  log(!(await st()).active, `${v.name}: off the pitch = normal island`); log(await vis('nav[data-hud-triggers]'), `${v.name}: paths / settings shown off the pitch`);
  await p.evaluate((c) => window.__fi2.teleport(c.x - 6, c.z + 2, Math.PI / 2), c); await p.waitForTimeout(1500);
  let s = await st(); const callsOn = await calls();
  log(s.active, `${v.name}: walking onto the pitch enters practice (${s.drill}, ${s.layout.length} props)`);
  log(!(await vis('nav[data-hud-triggers]')) && !(await vis('.town-minimap')), `${v.name}: paths / settings / map hidden`);
  log(await vis('[data-practice-cam]') && await vis('[data-practice-exit]') && await vis('[data-practice-card]'), `${v.name}: camera, Exit and the drill card shown`);
  log(await vis('.touch-shoot') || !v.mobile, `${v.name}: kick control kept`);
  // camera cycle (the live games' button)
  const seen = []; for (let i = 0; i < 4; i++) { await p.click('[data-practice-cam]'); await p.waitForTimeout(700); seen.push((await st()).cam); }
  log(seen.join() === 'wide,behind,side,broadcast', `${v.name}: camera cycles ${seen.join(' → ')}`);
  await p.click('[data-practice-cam]'); await p.waitForTimeout(1200);// Tactical for the shot
  // Shuffle: another drill
  const d0 = (await st()).drill; await p.click('[data-practice-shuffle]'); await p.waitForTimeout(600); s = await st(); log(s.drill !== d0, `${v.name}: Shuffle ${d0} → ${s.drill}`);
  // Owner Nov 25 2026: no ball of your own while practising, no fuel (energy) readout; walk up to a white ball to dribble it.
  const bare = await p.evaluate(() => { const f = window.__fi2; return { bare: f.practice.bare, shown: f.ball.visible }; });
  log(bare.bare && !bare.shown, `${v.name}: bare feet on entry (own ball hidden)`);
  log(!(await vis('[data-job-wallet]')), `${v.name}: energy bar (coins / fuel bar) hidden while practising`);
  const white = await p.evaluate(() => { const m = window.__fi2.scene.getObjectByName('practice-balls'); if (!m || !m.instanceColor) return false; const a = m.instanceColor.array; for (let i = 0; i < m.count * 3; i++) if (a[i] < .99) return false; return m.count > 0; });
  log(white, `${v.name}: every practice ball is white`);
  await p.click('[data-practice-cam]'); await p.click('[data-practice-cam]'); await p.click('[data-practice-cam]'); await p.waitForTimeout(900);// back to Follow
  await p.evaluate(() => { const f = window.__fi2, x = f.practice, b = x.world.balls.find((q) => !q.awake); f.teleport(b.x - 1.4, b.z - 1.4, Math.PI / 4); }); await p.waitForTimeout(1200);
  if (v.mobile && shots) await p.screenshot({ path: path.join(shots, 'practice-walk-up-phone.png') });
  const took = await p.evaluate(async () => { const f = window.__fi2, x = f.practice, b = x.world.balls.find((q) => !q.awake); f.teleport(b.x, b.z - .3, 0);
    await new Promise((r) => setTimeout(r, 400)); return { carrying: x.carrying, shown: f.ball.visible, held: x.heldStyle, mode: f.walkBall.state.mode }; });
  log(took.carrying && took.shown && took.mode === 'attached', `${v.name}: walking up to a ball picks it up (shown at the feet)`);
  const kicked = await p.evaluate(async () => { const f = window.__fi2, x = f.practice, w = f.walkBall.state; const n = x.world.balls.length; Object.assign(w, { mode: 'shot', vx: 0, vy: 1, vz: 8 });
    await new Promise((r) => setTimeout(r, 300)); return { carrying: x.carrying, back: x.world.balls.length === n + 1, shown: f.ball.visible }; });
  log(!kicked.carrying && kicked.back && !kicked.shown, `${v.name}: a kick lets it go (it stays on the pitch, feet bare again)`);

  if (v.mobile && shots) await p.screenshot({ path: path.join(shots, 'practice-phone.png') });
  // ---- the editor: drag the first prop, add a cone, reset
  await p.click('[data-practice-edit]'); await p.waitForTimeout(1500); s = await st();
  log(s.editing && s.cam === 'wide' && !(await vis('.touch-shoot')), `${v.name}: Edit: tactical view, controls hidden`);
  const before = s.layout[0];
  const xy = await p.evaluate(() => { const f = window.__fi2, x = f.practice, q = x.layout[0], V = f.camera.position.constructor, g = x.world.balls[0] ? x.world.balls[0].y - .2 : 0;
    const sc = new V(x.pitch.x + q.u, g, x.pitch.z + q.v).project(f.camera), r = f.renderer.domElement.getBoundingClientRect(); return { x: r.left + (sc.x + 1) / 2 * r.width, y: r.top + (1 - sc.y) / 2 * r.height }; });
  if (v.mobile) { const cdp = await ctx.newCDPSession(p); const t = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] });
    await t('touchStart', xy.x, xy.y); for (let i = 1; i <= 8; i++) { await t('touchMove', xy.x + i * 8, xy.y + i * 5); await p.waitForTimeout(30); } await t('touchEnd'); }
  else { await p.mouse.move(xy.x, xy.y); await p.mouse.down(); for (let i = 1; i <= 8; i++) { await p.mouse.move(xy.x + i * 8, xy.y + i * 5); await p.waitForTimeout(30); } await p.mouse.up(); }
  await p.waitForTimeout(500); s = await st(); const after = s.layout[0];
  log(after[1] !== before[1] || after[2] !== before[2], `${v.name}: drag moved ${before.join(' ')} → ${after.join(' ')}`);
  log(after[1] * 2 === Math.round(after[1] * 2) && after[2] * 2 === Math.round(after[2] * 2), `${v.name}: dropped on the 0.5 m grid`);
  const n0 = s.layout.length; await p.click('[data-practice-add="man"]'); await p.waitForTimeout(400); s = await st(); log(s.layout.length === n0 + 1, `${v.name}: add a mannequin`);
  await p.click('[data-practice-add="cone-yellow"]'); await p.waitForTimeout(400);
  const persisted = await p.evaluate(() => JSON.parse(localStorage.getItem('fi2-summit-practice-v1')));
  log(persisted && persisted.layouts[persisted.drill]?.length === n0 + 2, `${v.name}: edited layout saved for ${persisted?.drill}`);
  if (!v.mobile && shots) await p.screenshot({ path: path.join(shots, 'practice-edit-desktop.png') });
  await p.click('[data-practice-reset]'); await p.waitForTimeout(400); s = await st(); log(s.layout.length === n0 - 0 || s.layout.length < n0 + 2, `${v.name}: Reset drill (${s.layout.length} props)`);
  await p.click('[data-practice-done]'); await p.waitForTimeout(600); log(!(await st()).editing, `${v.name}: Done returns to play`);
  // draw calls: on the pitch vs off it, same spot of the island (the gate)
  await p.click('[data-practice-exit]'); await p.waitForTimeout(1500); s = await st(); const callsOff = await calls();
  log(!s.active && s.mode === 'attached' && s.held === -1 && (await p.evaluate(() => window.__fi2.ball.visible)), `${v.name}: Exit: normal walking, own ball at the feet`);
  log(await vis('[data-job-wallet]'), `${v.name}: energy bar back after Exit`);
  log(await vis('nav[data-hud-triggers]'), `${v.name}: paths / settings back`);
  console.log(`     ${v.name}: draw calls practising ${callsOn}, after Exit (at the gate) ${callsOff}`);
  if (errs.length) log(false, `${v.name}: page errors: ${errs.slice(0, 3).join(' | ')}`);
  await ctx.close();
}
(async () => {
  const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--mute-audio', '--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
  try { for (const v of VPS) await run(b, v).catch((e) => log(false, `${v.name}: ${e.message.slice(0, 200)}`)); } finally { await b.close(); }
  console.log(fails ? `${fails} failed` : 'all passed'); process.exit(fails ? 1 : 0);
})();
