// Headless check, Konbini Emote button rule + header layout (owner, Oct 22 2026). A bot far / near / busy, then you at the cashier
// alone: the Emote button is hidden / shown / hidden / hidden; the coins pill is centred (+-2 px) on phone 390, 360 and desktop.
// Run: node scripts/check-konbini-emote-rule.cjs <appUrl> <relayUrl> [outDir]   (env as check-mp-rooms.cjs)
const { chromium, devices } = require('playwright');
const { spawn } = require('child_process');
const url = (process.argv[2] || 'http://localhost:8694').replace(/\/$/, ''), relay = process.argv[3] || 'http://127.0.0.1:8693', out = process.argv[4] || '/tmp/konbini-emote-rule';
require('fs').mkdirSync(out, { recursive: true });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  let fail = 0;
  const bad = (m) => { fail++; console.log('FAIL:', m); };
  await fetch(url + '/konbini?door=main').catch(() => {}); // compile the room page first (dev server)
  const b = await chromium.launch({ channel: process.env.PW_CHANNEL || undefined, args: ['--mute-audio'] });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(url); await p.waitForTimeout(6000);
  await p.click('text=Get my save code'); await p.waitForTimeout(2000);
  await p.click('button:has-text("Play")'); await p.waitForTimeout(15000);
  await p.click('button:has-text("Skip")').catch(() => {}); await p.waitForTimeout(1500);
  await p.evaluate(() => document.querySelector('[data-party-open]')?.click());
  await p.waitForSelector('input[aria-label="First name"]', { timeout: 10000 });
  for (let i = 0; i < 4 && !(await p.evaluate(() => document.querySelector('input[aria-label="First name"]').value)); i++) { await p.fill('input[aria-label="First name"]', 'Sam'); await p.waitForTimeout(600); }
  await p.click('text=Start a party');
  await p.waitForSelector('[data-parent-gate-answer]'); await p.waitForTimeout(400);
  const q = (await p.textContent('[data-parent-gate]')).toLowerCase();
  const w = { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12 };
  const mm = q.match(/(\w+) times (\w+)/), nn = q.match(/\d+/g);
  await p.fill('[data-parent-gate-answer]', String(mm ? (w[mm[1]] ?? +mm[1]) * (w[mm[2]] ?? +mm[2]) : nn ? +nn[0] * +nn[1] : 0));
  await p.click('[data-parent-gate] button[type=submit]');
  await p.waitForSelector('[data-party-code]', { timeout: 15000 }); await p.waitForTimeout(1500);
  const code = (await p.textContent('[data-party-code]')).replace(/[^A-Z0-9]/gi, '');
  await p.click('[data-party-sheet] button:has-text("Done")').catch(() => {}); await p.waitForTimeout(1200);
  console.log('party', code.length === 6 ? 'made' : 'MISSING');
  const btn = () => p.evaluate(() => { const e = document.querySelector('[data-room-emote-dock]'); if (!e) return 'absent'; const c = getComputedStyle(e), b = e.getBoundingClientRect(); return { near: e.dataset.emoteNear, op: +c.opacity, vis: c.visibility, x: Math.round(b.x), y: Math.round(b.y) }; });
  const shown = (s) => s !== 'absent' && s.near === '1' && s.op > .9 && s.vis === 'visible';
  const hiddenB = (s) => s !== 'absent' && s.near === '0' && s.op < .05;
  const dist = () => p.evaluate(() => { const s = window.__konbini.state, f = s.party?.friends?.filter((q) => !q.gone && q.fade > .9 && q.presence !== 'away').sort((a, c) => (c.presence === 'busy') - (a.presence === 'busy'))[0]; return { fx: f?.x, all: (s.party?.friends ?? []).map((q) => q.presence + (q.gone ? '/gone' : '')).join(','), me: [s.x, s.z], d: f ? Math.hypot(f.x - s.x, f.z - s.z) : null, pres: f?.presence ?? null, near: s.emoteNear }; });
  const walk = async (key, ms) => { await p.keyboard.down(key); await p.waitForTimeout(ms); await p.keyboard.up(key); await p.waitForTimeout(700); };
  const startBot = (extra) => { const bt = spawn('node', ['--experimental-websocket', 'multiplayer/bots/bot.mjs', '--url', relay, '--code', code, '--n', '1', '--ms', '200000', '--room', '8', '--room-after', '0', ...extra], { stdio: ['ignore', 'ignore', 'ignore'] }); return bt; };
  let bot = startBot(['--walk', '5000', '--stand', '60000']);
  await p.evaluate(() => document.querySelector('[data-konbini-enter]')?.click());
  await p.waitForURL(/\/konbini/, { timeout: 90000, waitUntil: 'commit' });
  await p.waitForFunction(() => window.__konbini?.state?.party, null, { timeout: 60000 });
  await p.waitForSelector('[data-room-emote-dock]', { timeout: 30000 });
  await p.keyboard.press('Escape');
  for (let i = 0; i < 60 && !(await dist()).d; i++) await p.waitForTimeout(500);
  // Phase 1/2: sample the rule against the true distance while the bot stands and we walk about.
  const seen = { far: null, near: null };
  const probe = async () => { await p.waitForTimeout(900); const d = await dist(), b = await btn(); const tag = d.d === null ? 'nobody' : d.d > 8.4 ? 'far' : d.d < 7.6 ? 'near' : 'edge'; return { d, b, tag }; };
  for (const [k, ms] of [['KeyA', 1500], ['KeyA', 1500], ['KeyD', 3000], ['KeyD', 3000], ['KeyW', 2500], ['KeyS', 5000], ['KeyA', 3000], ['KeyD', 4500]]) {
    await walk(k, ms); const r = await probe(); console.log('probe', r.tag, r.d.d?.toFixed(1), JSON.stringify(r.b));
    if (r.tag === 'far') { seen.far = r; if (!hiddenB(r.b)) bad('far friend: the Emote button must be hidden ' + JSON.stringify(r.b)); }
    if (r.tag === 'near') { seen.near = r; if (!shown(r.b)) bad('near friend: the Emote button must be shown ' + JSON.stringify(r.b)); }
  }
  for (let i = 0; i < 8 && !seen.far; i++) { const d0 = await dist(); await walk(d0.fx > d0.me[0] ? 'KeyA' : 'KeyD', 2500); const r = await probe(); console.log('probe+', r.tag, r.d.d?.toFixed(1), JSON.stringify(r.b)); if (r.tag === 'far') { seen.far = r; if (!hiddenB(r.b)) bad('far friend: the Emote button must be hidden'); } }
  if (!seen.far) bad('never got >8 m from the bot (move the script)'); else console.log('far: hidden ok', JSON.stringify(seen.far.b));
  if (!seen.near) bad('never got <8 m of the bot'); else console.log('near: shown ok', JSON.stringify(seen.near.b));
  // Keep-up / kick unmoved: the dock keeps its cell hidden or shown.
  if (seen.far && seen.near && (seen.far.b.x !== seen.near.b.x || seen.far.b.y !== seen.near.b.y)) bad('the Emote cell moved between hidden and shown');
  // Wheel closes when the last candidate leaves: open it near, then walk away.
  // (screenshots: near, then far)
  await p.screenshot({ path: `${out}/desktop-last.png` });
  // Header layout: coins pill centred within 2 px, chip left, Done right.
  const hdr = (pg) => pg.evaluate(() => { const r = (s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { l: b.left, r: b.right, cx: (b.left + b.right) / 2, t: b.top, b: b.bottom }; };
    return { vw: document.documentElement.clientWidth, coins: r('[data-konbini-wallet]'), chip: r('[data-room-party-chip]'), done: r('[data-konbini-done]') }; });
  const checkHdr = (h, tag) => { console.log(tag + ' header', JSON.stringify(h));
    if (!h.coins || Math.abs(h.coins.cx - h.vw / 2) > 2) bad(tag + ': coins pill not centred ' + JSON.stringify(h.coins));
    if (h.chip && !(h.chip.r <= h.coins.l + .5)) bad(tag + ': chip overlaps coins'); if (h.done && !(h.done.l >= h.coins.r - .5)) bad(tag + ': Done overlaps coins');
    if (h.chip && h.chip.l > h.vw * .12) bad(tag + ': chip not on the left edge'); if (h.done && h.done.r < h.vw * .88) bad(tag + ': Done not on the right edge'); };
  checkHdr(await hdr(p), 'desktop');
  // Phase 3: a busy friend close by does not count.
  bot.kill('SIGTERM'); await wait(1500);
  const me = await p.evaluate(() => [window.__konbini.state.x, window.__konbini.state.z]);
  bot = startBot(['--busy-at', `${(me[0] + 1.5).toFixed(1)},${(me[1] + 1.5).toFixed(1)}`, '--busy-after', '0', '--busy-for', '0']);
  let bs = null; for (let i = 0; i < 40; i++) { await p.waitForTimeout(500); bs = await dist(); if (bs.pres === 'busy') break; }
  if (bs.pres !== 'busy') bad('the busy bot never showed as busy ' + JSON.stringify(bs));
  await p.waitForTimeout(1500); const bb = await btn(); const bd = await dist();
  console.log('busy friend', JSON.stringify({ d: bd.d?.toFixed(1), b: bb }));
  if (!hiddenB(bb)) bad('a busy (force-fielded) friend must not show the Emote button ' + JSON.stringify(bb));
  bot.kill('SIGTERM'); await wait(1500);
  // Phase 4: alone at the cashier.
  for (let i = 0; i < 6 && (await dist()).me[0] < 5.6; i++) await walk('KeyD', 1500);
  for (let i = 0; i < 4 && Math.abs((await dist()).me[1] - 1.2) > .6; i++) await walk((await dist()).me[1] > 1.2 ? 'KeyW' : 'KeyS', 500);
  const cb = await btn(); console.log('at the cashier', JSON.stringify(cb), JSON.stringify(await dist()));
  if (!hiddenB(cb)) bad('near the cashier only: the Emote button must stay hidden ' + JSON.stringify(cb));
  await p.screenshot({ path: `${out}/desktop-cashier.png` });
  const sess = await p.evaluate(() => sessionStorage.getItem('fi-party-session'));
  for (const [w, h, tag, mobile] of [[390, 844, 'phone390', true], [360, 740, 'phone360', true]]) {
    const c2 = await b.newContext({ viewport: { width: w, height: h }, hasTouch: mobile, isMobile: mobile, deviceScaleFactor: 2 });
    await c2.addInitScript((s) => { if (s) sessionStorage.setItem('fi-party-session', s); }, sess);
    const q2 = await c2.newPage(); await q2.goto(url + '/konbini?door=main', { waitUntil: 'commit' }); await q2.waitForSelector('[data-konbini-wallet]', { timeout: 60000 }); await q2.waitForTimeout(6000);
    const h2 = await hdr(q2); checkHdr(h2, tag); await q2.screenshot({ path: `${out}/${tag}.png` });
    if (!h2.chip) console.log(tag + ': (no party chip on this fresh page; centred coins + Done checked)');
    await c2.close();
  }
  bot.kill('SIGTERM'); console.log('errors', JSON.stringify(errs.slice(0, 3)));
  await b.close(); console.log(fail ? 'FAIL ' + fail : 'PASS'); process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
