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
    if (i === 0) await p.click('text=Get my save code', { timeout: 4000 }).catch(() => {});
    await p.waitForTimeout(2000);
  }
  await p.waitForFunction(() => !!window.__fi2 && !!window.__fi2.trainRide && !!window.__fi2.trains && !!window.__fi2.trainTalk && !!window.__fi2.renderer && !document.querySelector('[data-island-return-loading]'), null, { timeout: 300000 });
  await p.waitForTimeout(3000);
  return { ctx, p, errs };
}
const setLap = (p, k, T) => p.evaluate(({ k, T }) => { const s = window.__fi2.trains.sched, P = s.trainPhase(k, s.clock()); window.__skew += (((T - P) % 360) + 360) % 360 * 1000; }, { k, T });
async function ride(p) {
  const T = await p.evaluate(() => window.__fi2.trains.sched.stops.find((x) => x.station.id === 'south').arrive + 3.5);
  await setLap(p, 0, T); await p.waitForTimeout(500);
  await p.evaluate(() => { const sp = window.__fi2.trainRide.stationSpot(2, 0); window.__fi2.teleport(sp.x, sp.z, sp.yaw + Math.PI); });
  await p.waitForTimeout(1200);
  await p.evaluate(() => { document.querySelector('[data-train-board]')?.click(); if (!window.__fi2.trainRide.active) window.__fi2.trainRide.board(); });
  await p.waitForTimeout(1300);
  const k = await p.evaluate(() => window.__fi2.trainRide.active ? window.__fi2.trainRide.train : -1);
  // ride out of the station (doors shut, between stops)
  for (let i = 0; i < 30 && !(await p.evaluate((k) => window.__fi2.trains.states[k].at < 0, k)); i++) await p.waitForTimeout(700);
  await p.waitForTimeout(800);
  return k;
}
// on-screen spots (px) of the ridden train's passengers, nearest my seat first
const targets = (p, k) => p.evaluate((k) => { const f = window.__fi2, cam = f.camera, V = cam.position.constructor, {list, count} = f.trainPassengers.spots(), r = f.renderer.domElement.getBoundingClientRect();
  const out = [];
  for (let i = 0; i < count; i++) { const s = list[i]; if (s.k !== k) continue; const v = new V(s.x, s.y + (s.standing ? 1.1 : .85), s.z).project(cam); if (Math.abs(v.x) > .95 || Math.abs(v.y) > .9 || v.z > 1) continue;
    const d = Math.hypot(s.x - f.location.x, s.z - f.location.z); if (d < 2.9) out.push({ cast: s.cast, x: r.left + (v.x + 1) / 2 * r.width, y: r.top + (1 - v.y) / 2 * r.height, d }); }
  return out.sort((a, b) => a.d - b.d); }, k);
async function partTalk(c, label, mobile) {
  const { p } = c; const k = await ride(p);
  check(`${label}: riding`, k >= 0); if (k < 0) return;
  const labels = await p.evaluate(() => ({ prompt: !!document.querySelector('.npc-talk-prompt'), aimed: window.__fi2.trainTalk.aimed, tags: document.querySelectorAll('[data-npc-tag],[data-npc-label]').length }));
  check(`${label}: seated, not aiming: no Talk prompt, no labels`, (!labels.prompt || labels.aimed) && !labels.tags, JSON.stringify(labels));
  let opened = null;
  // a camera view that shows a passenger within ~2 seats of mine (the portrait seat view may show none)
  let seenAny = false;
  for (const v of ['seat', 'back', 'front', 'left', 'right']) { if (opened) break; await p.evaluate((v) => window.__fi2.trainRide.setView(v), v); await p.waitForTimeout(1600); const list = await targets(p, k); if (list.length) seenAny = true;
  for (const t of list.slice(0, 4)) {
    if (!mobile) { await p.mouse.move(t.x, t.y); await p.waitForTimeout(250);
      const h = await p.evaluate(() => ({ ring: window.__fi2.trainTalk.ring.visible, cursor: window.__fi2.renderer.domElement.style.cursor, hovered: window.__fi2.trainTalk.hovered }));
      if (h.hovered >= 0 && !results.some((r) => r.name.startsWith(`${label}: hover`))) check(`${label}: hover = faint ring + pointer only`, h.ring && h.cursor === 'pointer', JSON.stringify(h)); }
    if (mobile) await p.touchscreen.tap(t.x, t.y); else await p.mouse.click(t.x, t.y);
    // the slide-out is loaded on first use (a dynamic chunk): wait for it
    if (await p.evaluate(() => window.__fi2.trainTalk.lastTap === 'open')) await p.waitForSelector('dialog[open] #npc-conversation-title', { timeout: 15000 }).catch(() => {}); else await p.waitForTimeout(400);
    opened = await p.evaluate(() => { const d = document.querySelector('dialog[open] #npc-conversation-title'); return d ? { name: d.textContent, replies: document.querySelectorAll('dialog[open] [aria-label="Choose your next reply"] button').length, quick: !!document.querySelector('dialog[open] [data-npc-challenge]') } : null; });
    if (opened) break;
  } }
  check(`${label}: a passenger near my seat on screen`, seenAny);
  check(`${label}: a ${mobile ? 'tap' : 'click'} on a nearby passenger opens their talk`, opened && opened.replies >= 4, JSON.stringify(opened));
  if (!opened) return;
  check(`${label}: the talk has a quick question`, opened.quick);
  const facing = await p.evaluate(() => window.__fi2.trainTalk.hovered === -1 && !window.__fi2.trainTalk.ring.visible);
  check(`${label}: no hover ring while talking`, facing);
  if (shots) { await p.waitForTimeout(900); } if (shots) await p.screenshot({ path: path.join(shots, `talk-${label}.png`) });
  const how = await p.click('dialog[open] header button', { timeout: 3000 }).then(() => 'done', async (e) => { await p.keyboard.press('Escape'); return 'escape ' + e.message.slice(0, 300); });
  await p.waitForTimeout(1200);
  const after = await p.evaluate(() => document.querySelector('dialog[open] #npc-conversation-title')?.textContent ?? null);
  check(`${label}: Done closes it`, after === null, String(after));
}
(async () => {
  const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--mute-audio', '--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
  try {
    for (const [label, vp, mobile] of [['phone', { width: 390, height: 844 }, true], ['desktop', { width: 1440, height: 900 }, false]]) {
      const c = await boot(b, vp, mobile);
      try { await partTalk(c, label, mobile); } catch (e) { check(`${label} ran`, false, e.message.slice(0, 200)); }
      check(`${label}: no page errors`, !c.errs.length, c.errs.slice(0, 3).join(' | '));
      await c.ctx.close();
    }
  } catch (e) { check('ran to the end', false, e.message.slice(0, 200)); }
  finally { await b.close(); }
  const bad = results.filter((r) => !r.ok).length; console.log(bad ? `${bad} FAILED` : 'all ok'); process.exit(bad ? 1 : 0);
})();
