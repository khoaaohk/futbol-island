// UI alignment safeguard (owner, Nov 24 2026: "ALL new designs"). Every visible button / pill / chip / badge / toast / tag whose
// text is one centred line: the text's box (a DOM Range's client rects: the font's ascent + descent box of the glyphs) must sit in
// the middle of the element's content box (border + padding removed). FAIL when off by more than 1.5 px vertically, or more than
// 2 px horizontally when the text is centred and alone. Measured twice 400 ms apart; only offenders seen both times count (no
// animation frames). Whole pages (below the fold too). Covers the site templates and the game states, phone 390x844 + desktop 1280x800.
// Allowlist: scripts/ui-align-allowlist.json  [{ "match": "<regex on the element descriptor>", "where": "<optional regex on the
// state>", "reason": "..." }]. A matched offender is listed as allowed, never as a failure.
// Needs a dev or production server: NEXT_DIST_DIR=.next-align npx next dev -p 9189   (never 8092 / 9160)
// Run: npm run check:ui-align -- --port=9189 [--only=site|game] [--vp=phone|desktop] [--json=<file>] [--shots=<dir>] [--report]
//      --report: print and exit 0 even with offenders. ONE headless Chrome (--mute-audio), closed at the end.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const arg = (k, d) => { const a = process.argv.find((s) => s.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const has = (k) => process.argv.includes(`--${k}`);
const port = arg('port'), only = arg('only', ''), vpOnly = arg('vp', ''), jsonOut = arg('json', ''), shots = arg('shots', '');
if (!port || ['8092', '9160', '8800'].includes(port)) { console.error('give --port=<n> (not 8092 / 9160 / 8800)'); process.exit(2); }
if (shots) fs.mkdirSync(shots, { recursive: true });
const url = `http://localhost:${port}`;
const allow = (() => { try { return JSON.parse(fs.readFileSync(path.join(__dirname, 'ui-align-allowlist.json'), 'utf8')); } catch { return []; } })();
const VIEWPORTS = [{ name: 'phone', vp: { width: 390, height: 844 }, mobile: true }, { name: 'desktop', vp: { width: 1280, height: 800 }, mobile: false }]
  .filter((v) => !vpOnly || v.name === vpOnly);
const found = new Map(); const covered = []; const missed = []; let checkedTotal = 0;

// ---- the in-page measurement (no closures: runs in the page)
function measureInPage() {
  const KIND = /(pill|chip|badge|toast|btn|button|cta)/i, TAG = /(^|[_-])tags?([_-]|$)|Tag(s)?([_-]|$)/;
  const els = new Set(document.querySelectorAll('button,[role="button"],a,span,div,li,p,output,label'));
  const out = []; let checked = 0; const skip = {};const S = (k) => { skip[k] = (skip[k] || 0) + 1; };
  const vw = innerWidth;
  const visible = (el) => { if (el.checkVisibility && !el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) return false; for (let e = el; e; e = e.parentElement) { const c = getComputedStyle(e); if (+c.opacity < .05) return false; if (c.transform && c.transform !== 'none') { const m = c.transform.match(/matrix\(([^,]+),([^,]+),([^,]+),([^,]+)/); if (m && (Math.abs(Math.hypot(+m[1], +m[2]) - 1) > .01 || Math.abs(Math.hypot(+m[3], +m[4]) - 1) > .01)) return false; } } return true; };
  for (const el of els) {
    const cls = typeof el.className === 'string' ? el.className : '';
    const isBtn = el.tagName === 'BUTTON' || el.getAttribute('role') === 'button';
    if (!isBtn && !KIND.test(cls) && !TAG.test(cls)) continue;
    if (el.closest('svg')) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 12 || r.height < 12 || r.right <= 0 || r.left >= vw) { S('size/offscreen'); continue; }
    // its text nodes (visible ones), as client rects
    const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), rects = [], parents = new Set(); let text = '', n;
    while ((n = tw.nextNode())) { if (!n.textContent.trim()) continue; const pe = n.parentElement, pr = pe.getBoundingClientRect(); if (pr.width <= 2 || pr.height <= 2) continue; const pc = getComputedStyle(pe); if (pc.visibility === 'hidden' || pc.position === 'absolute' && pc.clip && pc.clip !== 'auto') continue;
      const rg = document.createRange(); rg.selectNodeContents(n); for (const q of rg.getClientRects()) if (q.width > .5 && q.height > .5) rects.push(q); text += n.textContent; parents.add(pe); }
    text = text.replace(/\s+/g, ' ').trim();
    if (!rects.length || !text || text.length > 48) { S('no text / long'); continue; }
    if (!visible(el)) { S('hidden'); continue; }
    // one line: every text rect overlaps the first one's band
    const t0 = Math.min(...rects.map((q) => q.top)), b0 = Math.max(...rects.map((q) => q.bottom)), h0 = Math.max(...rects.map((q) => q.height));
    if (b0 - t0 > h0 * 1.45) { S('multi-line'); continue; }
    // a layout with something stacked above / below the text (icon over a label, two rows): not a single-line control
    let stacked = false, sideKids = false;
    for (const k of el.querySelectorAll('*')) { const kr = k.getBoundingClientRect(); if (kr.width < 2 || kr.height < 2) continue;
      const kidText = [...k.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim());
      if (kr.bottom <= t0 + 1 || kr.top >= b0 - 1) { stacked = true; break; }
      if (!kidText && !k.querySelector('*') && k.textContent.trim() === '' ) sideKids = true; }
    if (stacked) { S('stacked'); continue; }
    const cs = getComputedStyle(el), px = (v) => parseFloat(v) || 0;
    const cl = r.left + px(cs.borderLeftWidth) + px(cs.paddingLeft), cr = r.right - px(cs.borderRightWidth) - px(cs.paddingRight);
    const ct = r.top + px(cs.borderTopWidth) + px(cs.paddingTop), cb = r.bottom - px(cs.borderBottomWidth) - px(cs.paddingBottom);
    if (cb - ct < 4) continue;
    const tl = Math.min(...rects.map((q) => q.left)), tr = Math.max(...rects.map((q) => q.right));
    // text taller than its box (clipped / overflowing line-height): the box is the line, skip
    if (b0 - t0 > (cb - ct) + 1) { S('text>box'); continue; }
    checked++;
    const dy = ((t0 + b0) / 2) - ((ct + cb) / 2);
    const centred = cs.textAlign === 'center' || ((cs.display.includes('flex') || cs.display.includes('grid')) && (cs.justifyContent === 'center' || cs.placeContent?.includes('center') || cs.justifyItems === 'center')) || el.tagName === 'BUTTON' && cs.textAlign !== 'left' && cs.textAlign !== 'start' && !cs.display.includes('flex');
    const fits = tr - tl <= cr - cl + .5;
    // horizontal only for one text run (a label + a count badge in its own span is laid out on purpose)
    const dx = centred && !sideKids && fits && parents.size === 1 ? ((tl + tr) / 2) - ((cl + cr) / 2) : 0;
    if (Math.abs(dy) > 1.5 || Math.abs(dx) > 2) {
      const tok = cls.split(/\s+/).filter(Boolean).map((c) => c.replace(/__[A-Za-z0-9_-]{4,6}$/, '').replace(/^[A-Za-z0-9]+-module(__|_)/, '')).slice(0, 2).join('.');
      const data = [...el.attributes].map((a) => a.name).filter((a) => a.startsWith('data-')).slice(0, 1).join('');
      out.push({ d: `${el.tagName.toLowerCase()}${tok ? '.' + tok : ''}${data ? '[' + data + ']' : ''} "${text.slice(0, 28)}"`, dy: +dy.toFixed(1), dx: +dx.toFixed(1), h: Math.round(r.height) });
    }
  }
  return { checked, out, skip };
}

async function measure(p, state, vpName) {
  const a = await p.evaluate(measureInPage).catch((e) => ({ checked: 0, out: [], err: e.message }));
  await p.waitForTimeout(400);
  const b = await p.evaluate(measureInPage).catch(() => ({ checked: 0, out: [] }));
  const keep = a.out.filter((o) => b.out.some((q) => q.d === o.d && Math.abs(q.dy - o.dy) < .6 && Math.abs(q.dx - o.dx) < .6));
  checkedTotal += a.checked; if (has('debug')) console.log(state, vpName, a.checked, JSON.stringify(a.skip)); covered.push(`${state}/${vpName}(${a.checked})`);
  for (const o of keep) {
    const key = o.d; const rule = allow.find((r) => new RegExp(r.match).test(o.d) && (!r.where || new RegExp(r.where).test(state)));
    const prev = found.get(key); const where = `${state}/${vpName}`;
    if (prev) { if (!prev.where.includes(where)) prev.where.push(where); if (Math.abs(o.dy) + Math.abs(o.dx) > Math.abs(prev.dy) + Math.abs(prev.dx)) Object.assign(prev, { dy: o.dy, dx: o.dx }); }
    else found.set(key, { ...o, where: [where], allowed: rule ? rule.reason : '' });
  }
  if (shots) await p.screenshot({ path: path.join(shots, `${vpName}-${state.replace(/\W+/g, '-')}.png`) }).catch(() => {});
}

async function newPage(b, v) {
  const ctx = await b.newContext({ viewport: v.vp, isMobile: v.mobile, hasTouch: v.mobile, deviceScaleFactor: 1 });
  await ctx.addInitScript(() => { try { localStorage.setItem('fi2-welcome-v1', 'completed'); localStorage.setItem('fi2-public-hint-v1', 'card hint'); } catch { /* */ }
    const n = Date.now.bind(Date); window.__skew = 0; Date.now = () => n() + window.__skew; });
  await ctx.route('**/api/build-id', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  const p = await ctx.newPage(); return { ctx, p };
}
const go = async (p, u) => { await p.goto(url + u, { timeout: 300000, waitUntil: 'domcontentloaded' }); await p.waitForLoadState('load', { timeout: 60000 }).catch(() => {}); await p.waitForTimeout(1800); };
const firstLink = (p, prefix) => p.evaluate((pre) => { const a = [...document.querySelectorAll('a[href]')].map((x) => x.getAttribute('href')).find((h) => h.startsWith(pre) && h.length > pre.length && !h.includes('#')); return a || null; }, prefix);

async function site(b, v) {
  const { ctx, p } = await newPage(b, v);
  const fixed = [['home', '/'], ['games', '/games'], ['library', '/library'], ['marketing', '/marketing'], ['books', '/books'], ['tools', '/tools']];
  const discover = [['game-page', '/games', '/games/'], ['book', '/books', '/books/'], ['tool', '/tools', '/tools/'], ['rule', '/learn/soccer-rules', '/learn/soccer-rules/'],
    ['term', '/learn/soccer-terms', '/learn/soccer-terms/'], ['quiz', '/learn/quizzes', '/learn/quizzes/'], ['es-home', null, '/es'], ['es-games', '/es', '/es/games'], ['es-learn', '/es', '/es/learn/']];
  for (const [name, u] of fixed) { try { await go(p, u); await measure(p, name, v.name); } catch (e) { missed.push(`${name}/${v.name}: ${e.message.slice(0, 60)}`); } }
  for (const [name, from, pre] of discover) {
    try { let u = pre; if (from) { await go(p, from); u = await firstLink(p, pre); } if (!u) { missed.push(`${name}/${v.name}: no ${pre} link`); continue; } await go(p, u); await measure(p, `${name} ${u}`, v.name); }
    catch (e) { missed.push(`${name}/${v.name}: ${e.message.slice(0, 60)}`); }
  }
  for (const [name, u] of [['arcade-room', '/arcade'], ['arcade-cabinet', '/arcade?game=kitrush'], ['museum', '/museum'], ['konbini', '/konbini'], ['kit-shop', '/shop']]) {
    try { await go(p, u); await p.waitForTimeout(4000); for (let i = 0; i < 3; i++) await p.click('button:visible:has-text("Skip")', { timeout: 400 }).catch(() => {}); await measure(p, name, v.name); }
    catch (e) { missed.push(`${name}/${v.name}: ${e.message.slice(0, 60)}`); }
  }
  await ctx.close();
}

async function game(b, v) {
  const { ctx, p } = await newPage(b, v); const errs = []; p.on('pageerror', (e) => errs.push(e.message.slice(0, 160)));
  const tryState = async (name, fn) => { try { const ok = await fn(); if (ok === false) { missed.push(`${name}/${v.name}: not reached`); return; } await measure(p, name, v.name); } catch (e) { missed.push(`${name}/${v.name}: ${e.message.slice(0, 70)}`); } };
  const esc = async () => { for (let i = 0; i < 3; i++) { if (!(await p.locator('dialog[open]').count())) break; await p.keyboard.press('Escape'); await p.waitForTimeout(500); } };
  await p.goto(url + '/play?from=arcade', { timeout: 300000 }); await p.waitForTimeout(3000);
  for (let i = 0; i < 90 && !(await p.evaluate(() => !!window.__fi2)); i++) {
    for (const t of ['I saved it', 'Get my code', 'Play']) await p.click(`button:visible:has-text("${t}")`, { timeout: 300 }).catch(() => {});
    if (i === 0) await p.click('text=Get my save code', { timeout: 4000 }).catch(() => {});
    await p.waitForTimeout(2000);
  }
  const ready = () => p.waitForFunction(() => !!window.__fi2 && !!window.__fi2.trainRide && !!window.__fi2.trains && !!window.__fi2.renderer && !document.querySelector('[data-island-return-loading]'), null, { timeout: 300000 });
  // a dev server can restart mid-load (memory threshold): one reload
  await ready().catch(async () => { await p.reload({ timeout: 300000 }); await p.waitForTimeout(3000); for (const t of ['I saved it', 'Get my code', 'Play']) await p.click(`button:visible:has-text("${t}")`, { timeout: 500 }).catch(() => {}); await ready(); });
  await p.waitForTimeout(3000); await esc();
  await tryState('island-hud', async () => true);
  await tryState('travel-map', async () => { await p.click('[aria-label="View map"]', { timeout: 5000 }); await p.waitForTimeout(1500); return true; }); await esc(); await p.keyboard.press('Escape'); await p.waitForTimeout(600);
  await tryState('backpack', async () => {
    const xy = await p.evaluate(() => { const f = window.__fi2, V = f.camera.position.constructor, w = new V(); f.player.root.getWorldPosition(w); w.y += .9; const s = w.project(f.camera), r = f.renderer.domElement.getBoundingClientRect(); return { x: r.left + (s.x + 1) / 2 * r.width, y: r.top + (1 - s.y) / 2 * r.height }; });
    if (v.mobile) await p.touchscreen.tap(xy.x, xy.y); else await p.mouse.click(xy.x, xy.y);
    await p.waitForTimeout(1500); const tg = p.locator('[data-view-toggle] button:has-text("Backpack"), [data-view-toggle] [role="radio"]:has-text("Backpack")').first();
    if (!(await tg.count())) return false; await tg.click(); await p.waitForTimeout(1200); return !!(await p.$('[data-backpack]')); }); await esc();
  await tryState('stamp-book', async () => { await p.evaluate(() => window.dispatchEvent(new CustomEvent('fi2-open-stamp-book', { detail: {} }))); await p.waitForTimeout(1500); return !!(await p.$('[data-stamp-book]')); }); await esc();
  // ---- the Half-Time Café (Nov 24 2026, lib/town/seasideCafe.ts): the Visit café pill on its deck
  await tryState('cafe-visit', async () => { await p.evaluate(() => window.__fi2.teleport(707, -90.2, Math.PI)); await p.waitForTimeout(2500); return !!(await p.$('[data-cafe-go]:not([hidden])')); });
  // ---- the Island Line: Board pill at South, the ride HUD at the stop (Get off pill, toasts), Talk, moving, the next arrival
  const setLap = (k, T) => p.evaluate(({ k, T }) => { const s = window.__fi2.trains.sched, P = s.trainPhase(k, s.clock()); window.__skew += (((T - P) % 360) + 360) % 360 * 1000; }, { k, T });
  await tryState('train-board', async () => {
    const T = await p.evaluate(() => window.__fi2.trains.sched.stops.find((x) => x.station.id === 'south').arrive + 3.5); await setLap(0, T); await p.waitForTimeout(500);
    await p.evaluate(() => { const sp = window.__fi2.trainRide.stationSpot(2, 0); window.__fi2.teleport(sp.x, sp.z, sp.yaw + Math.PI); }); await p.waitForTimeout(1500);
    return !!(await p.$('[data-train-board]')); });
  let k = -1, toasts = 0;
  const pollToast = async () => { const t = await p.evaluate(() => [...document.querySelectorAll('[class*="toast"]')].some((e) => e.getBoundingClientRect().height > 8 && getComputedStyle(e).visibility !== 'hidden' && +getComputedStyle(e).opacity > .5)); if (t && toasts < 3) { toasts++; await measure(p, `train-toast-${toasts}`, v.name); } };
  await tryState('train-ride-stop', async () => { await p.evaluate(() => { document.querySelector('[data-train-board]')?.click(); if (!window.__fi2.trainRide.active) window.__fi2.trainRide.board(); }); await p.waitForTimeout(1600);
    k = await p.evaluate(() => window.__fi2.trainRide.active ? window.__fi2.trainRide.train : -1); return k >= 0; });
  if (k >= 0) {
    await tryState('npc-conversation', async () => { const el = await p.$('.npc-talk-prompt'); if (!el) return false; if (v.mobile) await el.tap(); else await p.keyboard.press('e'); await p.waitForSelector('dialog[open] #npc-conversation-title', { timeout: 10000 }); await p.waitForTimeout(800); return true; });
    await p.click('dialog[open] header button', { timeout: 2000 }).catch(async () => { await p.keyboard.press('Escape'); }); await p.waitForTimeout(800);
    for (let i = 0; i < 30 && !(await p.evaluate((k) => window.__fi2.trains.states[k].at < 0, k)); i++) { await pollToast(); await p.waitForTimeout(700); }
    for (let i = 0; i < 6; i++) { await pollToast(); await p.waitForTimeout(500); }
    await tryState('train-ride-moving', async () => { await p.waitForTimeout(600); return true; });
    // jump the clock to 5 s before the next stop, then catch the arrival / leaving toasts and the Get off pill at that stop
    await p.evaluate((k) => { const s = window.__fi2.trains.sched, P = s.trainPhase(k, s.clock()); const nx = s.stops.map((x) => x.arrive).filter((a) => a > P + 8).sort((a, b) => a - b)[0]; if (nx != null) window.__skew += (nx - 5 - P) * 1000; }, k);
    let getoff = false;
    for (let i = 0; i < 40 && (toasts < 3 || !getoff); i++) {
      const st = await p.evaluate(() => ({ toast: [...document.querySelectorAll('[class*="toast"]')].some((e) => e.getBoundingClientRect().height > 8 && getComputedStyle(e).visibility !== 'hidden' && +getComputedStyle(e).opacity > .5), off: [...document.querySelectorAll('button')].some((b) => /^Get off/.test(b.textContent.trim()) && b.getBoundingClientRect().height > 8) }));
      if (st.toast && toasts < 3) { toasts++; await measure(p, `train-toast-${toasts}`, v.name); }
      if (st.off && !getoff) { getoff = true; await measure(p, 'train-getoff-pill', v.name); }
      await p.waitForTimeout(500);
    }
    if (!toasts) missed.push(`train-toast/${v.name}: no toast seen`); if (!getoff) missed.push(`train-getoff-pill/${v.name}: not seen`);
    await p.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /^Get off/.test(x.textContent.trim())); b?.click(); }); await p.waitForTimeout(2500);
  }
  // ---- a live game (join the first running venue; last: it leaves the island state changed)
  await tryState('live-game-hud', async () => {
    const ok = await p.waitForFunction(() => window.__fi2.games && window.__fi2.games.entries.length > 0, null, { timeout: 60000 }).then(() => true).catch(() => false); if (!ok) return false;
    const vn = await p.evaluate(() => { const e = window.__fi2.games.entries[0]; return { x: e.venue.x, z: e.venue.z, w: e.venue.width, yaw: e.venue.yaw ?? 0 }; });
    await p.evaluate(({ x, z, w, yaw }) => { const f = window.__fi2; f.rideRef.current = 'walk'; f.flight.height = 0; const off = w / 2 + 2; f.location.x = x + (yaw ? 0 : off); f.location.z = z + (yaw ? off : 0); }, vn); await p.waitForTimeout(2500);
    for (let i = 0; i < 3 && !(await p.evaluate(() => !!window.__fi2.liveJoin?.joined)); i++) { const j = await p.$('[data-live-join]:visible, button:visible:has-text("Join")'); if (j) await j.click().catch(() => {}); else await p.keyboard.press('Enter'); await p.waitForTimeout(1800); }
    await p.waitForTimeout(1500); return await p.evaluate(() => !!window.__fi2.liveJoin?.joined); });
  if (errs.length) console.log(`  page errors (${v.name}): ${errs.slice(0, 3).join(' | ')}`);
  await ctx.close();
}

(async () => {
  const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--mute-audio', '--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
  try { for (const v of VIEWPORTS) { if (only !== 'game') await site(b, v).catch((e) => missed.push(`site/${v.name}: ${e.message.slice(0, 80)}`)); if (only !== 'site') await game(b, v).catch((e) => missed.push(`game/${v.name}: ${e.message.slice(0, 80)}`)); } }
  finally { await b.close(); }
  const rows = [...found.values()].sort((a, b) => (!!a.allowed - !!b.allowed) || (Math.abs(b.dy) + Math.abs(b.dx)) - (Math.abs(a.dy) + Math.abs(a.dx)));
  const fails = rows.filter((r) => !r.allowed), allowed = rows.filter((r) => r.allowed);
  console.log(`checked ${checkedTotal} single-line controls in ${covered.length} states; ${fails.length} FAIL, ${allowed.length} allowed`);
  if (fails.length) { console.log('FAIL  dy    dx    element  (states)'); for (const r of fails) console.log(`FAIL ${String(r.dy).padStart(5)} ${String(r.dx).padStart(5)}  ${r.d}  (${r.where.slice(0, 3).join(', ')}${r.where.length > 3 ? ` +${r.where.length - 3}` : ''})`); }
  for (const r of allowed) console.log(`allow ${String(r.dy).padStart(4)} ${String(r.dx).padStart(5)}  ${r.d}  [${r.allowed}]`);
  if (missed.length) console.log(`not covered (${missed.length}): ${missed.join(' ; ')}`);
  if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify({ checked: checkedTotal, covered, missed, fails, allowed }, null, 1));
  process.exit(fails.length && !has('report') ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
