// Headless check (Oct 23 2026, docs/ui/HUD_STACK.md "Pocket covers the HUD row"): while the island pocket (and the other
// drawers: Settings, Paths, party card, Shellbook, character / Backpack, vending) is open, no HUD row button (Paths, Play with
// friends, coins bar, Settings) is visible or hit-testable: elementFromPoint at each button's centre lands in the drawer. The
// drawer title and Done sit in the row's vertical band (row top .. row top + 44 px, 2 px slack). Closing restores the row; the
// pocket gives focus back to the coins bar. Phones 393x852, 440x956 portrait and 852x393 landscape (touch), in a party of 4.
// Run: node --experimental-websocket scripts/check-pocket-covers-row.cjs <appUrl> <relayUrl> [shotDir]
//   (app built with NEXT_PUBLIC_MULTIPLAYER=1 NEXT_PUBLIC_MULTIPLAYER_URL=<relayUrl>; PW_CHANNEL=chrome if bundled chromium is missing)
const pw = require('playwright');
const path = require('path');
const url = process.argv[2] || 'http://localhost:8780', relay = process.argv[3] || '', shots = process.argv[4] || '';
const ROW = ['[data-hud-triggers] [data-tour="quests"]', '[data-hud-triggers] [data-party-open]', '[data-job-wallet]', '[data-hud-triggers] button[aria-label="Settings"]'];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
let fails = 0; const bad = (m) => { fails++; console.log('FAIL ' + m); };
async function enter(p, q = '') {
  await p.goto(url + q, { waitUntil: 'domcontentloaded', timeout: 120000 }); await p.waitForTimeout(6000);
  await p.click('text=Get my save code', { timeout: 15000 }).catch(() => {}); await p.waitForTimeout(1500);
  await p.click('button:has-text("Get my code")', { timeout: 3000 }).catch(() => {}); await p.waitForTimeout(2000);
  await p.click('button:has-text("I saved it")', { timeout: 3000 }).catch(() => {}); await p.waitForTimeout(1200);
  await p.click('button:has-text("Play")', { timeout: 6000 }).catch(() => {});
  await p.waitForFunction(() => !!document.querySelector('[data-job-wallet]'), null, { timeout: 120000 }).catch(() => {});
  await p.waitForTimeout(8000);
  await p.click('button:has-text("Skip")', { timeout: 6000 }).catch(() => {}); await p.waitForTimeout(1200);
  await p.keyboard.press('Escape').catch(() => {}); await p.waitForTimeout(800);
}
async function party(p) {
  const { loadTs } = require('../multiplayer/dev-relay/loadTs.cjs');
  const P = loadTs(path.join(__dirname, '../multiplayer/protocol/index.ts'));
  await p.click('button[aria-label="Play with friends"]'); await p.waitForSelector('[role=dialog][aria-label="Play with friends"]', { timeout: 10000 });
  await p.fill('input[aria-label="First name"]', 'Sam'); await p.waitForTimeout(500);
  await p.click('text=Start a party'); await p.waitForSelector('[data-parent-gate-answer]');
  await p.waitForFunction(() => /times/.test(document.querySelector('[data-parent-gate] label')?.textContent || ''), null, { timeout: 8000 });
  const q = (await p.textContent('[data-parent-gate] label')).toLowerCase();
  const w = { two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12 };
  const mm = q.match(/(\w+) times (\w+)/), nn = q.match(/\d+/g);
  await p.fill('[data-parent-gate-answer]', String(mm ? (w[mm[1]] ?? +mm[1]) * (w[mm[2]] ?? +mm[2]) : +nn[0] * +nn[1]));
  await p.click('[data-parent-gate] button[type=submit]'); await p.waitForSelector('[data-party-code]', { timeout: 10000 });
  const code = (await p.textContent('[data-party-code]')).replace(/[^A-Z0-9]/gi, '');
  const ws = ['Ayako', 'Leo', 'Mia'].map((name, i) => {
    const s = new WebSocket(relay.replace(/^http/, 'ws').replace(/\/$/, '') + '/party/' + code + '/ws');
    s.onopen = () => s.send(JSON.stringify([P.C.Hello, P.PROTOCOL_VERSION, [i + 1, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8], null, null, null, name]));
    s.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m[0] === P.S.Caps) s.send(JSON.stringify([P.C.Caps, m[1]])); };
    return s;
  });
  await wait(1500); await p.click('[data-party-sheet] button:has-text("Done")'); await p.waitForTimeout(3000);
  return ws;
}
const rowRects = (p) => p.evaluate((ROW) => ROW.map((s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return r.width ? { s, x: r.left + r.width / 2, y: r.top + r.height / 2, t: r.top, b: r.bottom } : null; }), ROW);
// The topmost open drawer: the last open <dialog> or role=dialog that is visible.
const probe = (p, rects) => p.evaluate((rects) => {
  const ds = [...document.querySelectorAll('dialog[open],[role=dialog]')].filter((d) => d.getBoundingClientRect().width > 0 && d.checkVisibility());
  const d = ds.pop(); if (!d) return null;
  const hits = rects.filter(Boolean).map((r) => { const e = document.elementFromPoint(r.x, r.y); const btn = document.querySelector(r.s);
    return { s: r.s, inDrawer: !!e && d.contains(e), btnVisible: !!btn && btn.checkVisibility({ visibilityProperty: true }), onPanel: !!e && e !== d && d.contains(e) }; });
  const R = (e) => { if (!e) return null; const r = e.getBoundingClientRect(); return { t: r.top, b: r.bottom, l: r.left, r: r.right, h: r.height }; };
  const title = d.querySelector('h2'), done = d.querySelector('[data-navigation=done]') || [...d.querySelectorAll('button')].find((b) => /^done$/i.test(b.textContent.trim()));
  return { label: (title?.textContent || d.getAttribute('aria-label') || '').trim().slice(0, 30), hits, title: R(title), done: R(done), vw: innerWidth };
}, rects);
async function check(p, size, name, open, { band = true } = {}) {
  const rects = await rowRects(p), top = Math.min(...rects.filter(Boolean).map((r) => r.t));
  const ok = await open().then(() => true, (e) => { console.log(`skip ${size} ${name}: ${String(e.message).split('\n')[0]}`); return false; });
  if (!ok) return;
  await p.waitForTimeout(1600);
  const r = await probe(p, rects);
  if (!r) { const live = await p.evaluate((ROW) => ROW.filter((s) => { const b = document.querySelector(s); if (!b) return false; const q = b.getBoundingClientRect(); return q.width > 0 && b.contains(document.elementFromPoint(q.left + q.width / 2, q.top + q.height / 2)) && b.checkVisibility({ visibilityProperty: true }); }), ROW);
    console.log(`${size.padEnd(8)} ${name.padEnd(9)} (no dialog) row buttons live: ${live.map((s) => s.replace(/.*\[|\]/g, '')).join(',') || 'none'}`); return; }
  // Covered: the hit lands on the drawer's panel (top layer). The pocket also hides the row itself (visibility).
  const shown = r.hits.filter((h) => !h.inDrawer || !h.onPanel || (name === 'pocket' && h.btnVisible));
  const inBand = (x) => x && x.t >= top - 2 && x.b <= top + 44 + 2;
  const line = `${size.padEnd(8)} ${name.padEnd(9)} "${r.label}" rowTop ${top.toFixed(0)} title ${r.title ? `${r.title.t.toFixed(0)}-${r.title.b.toFixed(0)}` : '-'} done ${r.done ? `${r.done.t.toFixed(0)}-${r.done.b.toFixed(0)} r${(r.vw - r.done.r).toFixed(0)}` : '-'} row-visible ${shown.map((h) => h.s.replace(/.*\[|\]/g, '')).join(',') || 'none'}`;
  console.log(line);
  if (band) { if (shown.length) bad(`${size} ${name}: row shows (${shown.map((h) => JSON.stringify(h)).join(' ')})`);
    if (!inBand(r.title)) (name === 'pocket' ? bad : (m) => console.log('WARN ' + m))(`${size} ${name}: title outside the row band (top ${r.title?.t.toFixed(0)}, a wrapped title)`); if (!inBand(r.done)) bad(`${size} ${name}: Done outside the row band`);
    if (r.done && r.done.h < 43.5) bad(`${size} ${name}: Done under 44 px`); }
  if (shots && name === 'pocket' && size === '393x852') await p.screenshot({ path: path.join(shots, 'pocket-open-393x852.png') });
  return rects;
}
async function close(p, size, name, rects, focusWallet = false) {
  await p.keyboard.press('Escape'); await p.waitForTimeout(1200);
  if (await p.evaluate(() => [...document.querySelectorAll('dialog[open],[role=dialog]')].some((d) => d.getBoundingClientRect().width > 0 && d.checkVisibility()))) { await p.keyboard.press('Escape'); await p.waitForTimeout(1200); }
  const back = await p.evaluate((ROW) => ROW.map((s) => { const b = document.querySelector(s); if (!b) return s + ':missing'; const r = b.getBoundingClientRect(); const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return b.contains(e) && b.checkVisibility({ visibilityProperty: true }) ? null : s + ':covered'; }).filter(Boolean), ROW);
  if (back.length) bad(`${size} ${name}: after close ${back.join(' ')}`);
  if (focusWallet) { const f = await p.evaluate(() => document.activeElement?.hasAttribute('data-job-wallet')); if (!f) bad(`${size} ${name}: focus did not return to the coins bar`); }
}
(async () => {
  const b = await pw.chromium.launch({ channel: process.env.PW_CHANNEL || undefined, args: ['--mute-audio'] });
  try {
    for (const [w, h] of [[393, 852], [440, 956], [852, 393]]) {
      const size = `${w}x${h}`;
      const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 }); const p = await ctx.newPage();
      await enter(p); let ws = [];
      if (relay) ws = await party(p).catch((e) => { console.log('party failed: ' + e.message.split('\n')[0]); return []; });
      // Keyboard modality (Tab, then Enter on the bar): lib/town/hudFocus.ts blurs script focus on HUD buttons after pointer input by design.
      const kb = async () => { await p.keyboard.press('Tab'); await p.focus('[data-job-wallet]'); await p.keyboard.press('Enter'); };
      let rects = await check(p, size, 'pocket', kb);
      if (rects) { await close(p, size, 'pocket', rects, true); }
      rects = await check(p, size, 'pocket-done', async () => { await kb(); await p.waitForTimeout(1500); await p.focus('dialog[open] [data-navigation=done]'); await p.keyboard.press('Enter'); await p.waitForTimeout(1200); throw new Error('closed with Done'); });
      { const f = await p.evaluate(() => document.activeElement?.hasAttribute('data-job-wallet')); if (!f) bad(`${size} pocket: Done did not return focus to the coins bar`); }
      rects = await check(p, size, 'settings', () => p.click('[data-hud-triggers] button[aria-label="Settings"]', { timeout: 4000 })); if (rects) await close(p, size, 'settings', rects);
      rects = await check(p, size, 'paths', () => p.click('[data-hud-triggers] [data-tour="quests"]', { timeout: 4000 })); if (rects) await close(p, size, 'paths', rects);
      rects = await check(p, size, 'party', () => p.click('[data-hud-triggers] [data-party-open]', { timeout: 4000 }), { band: false }); if (rects) await close(p, size, 'party', rects);
      rects = await check(p, size, 'shellbook', () => p.evaluate(() => window.dispatchEvent(new Event('fi2-open-shellbook')))); if (rects) await close(p, size, 'shellbook', rects);
      rects = await check(p, size, 'look', async () => { const c = await p.$('canvas'); const bb = await c.boundingBox(); await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height * 0.58); await p.waitForTimeout(800); if (!(await p.$('dialog[open]'))) throw new Error('character tap opened nothing'); }); if (rects) await close(p, size, 'look', rects);
      ws.forEach((s) => s.close()); await ctx.close();
    }
    // Vending is not a drawer: VendingMachine.module.css hides every other .town-app child (the HUD row too) and draws its own Done in the row.
  } finally { await b.close(); }
  console.log(fails ? `POCKET_ROW_FAIL ${fails}` : 'POCKET_ROW_PASS'); process.exit(fails ? 1 : 0);
})();
