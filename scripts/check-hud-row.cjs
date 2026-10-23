// Headless check (Oct 23 2026, docs/ui/HUD_STACK.md "Top row on phones"): the island top row [Paths][Play with friends][coins bar]
// [Settings] never overlaps.
// - Phones (portrait <= 480 wide, landscape <= 480 tall): 320x568 ... 440x956 (iPhone 16/17 Pro Max) and landscape 844x390,
//   touch, 3-, 4- and 5-digit balances, full / low / empty fuel. The bar shows only coins + fuel (fish / fruit hidden, still in its
//   aria-label and the pocket it opens), it sits right-aligned next to Settings with bar <-> Settings == Paths <-> friends (within
//   1 px), and the free space between friends and the bar is >= that same gap (the friends box includes the party badge).
// - Real-device pass (WebKit, Playwright's 'iPhone 15', 'iPhone 17 Pro Max' (+ landscape) descriptors: isMobile, hasTouch, DPR 3): the same
//   rules, measured with the fish / fruit chips' computed display. With a relay URL it first starts a party and three scripted
//   friends join (the badge shows 4), like the owner's phone.
// - Desktop 1280x800 and touch tablet 768x1024: all four counters, bar centred, and the bar rect equals the pre-change rect (1 px).
// Run: node --experimental-websocket scripts/check-hud-row.cjs <appUrl> [outDir] [relayUrl]
//   (app built with NEXT_PUBLIC_MULTIPLAYER=1 [+ NEXT_PUBLIC_MULTIPLAYER_URL=<relayUrl>]; PW_CHANNEL=chrome if the bundled chromium is missing)
const pw = require('playwright');
const path = require('path');
const url = process.argv[2] || 'http://localhost:8739', out = process.argv[3] || '/tmp/hud-coins', relay = process.argv[4] || '';
require('fs').mkdirSync(out, { recursive: true });
const PHONES = [[320, 568], [360, 740], [375, 667], [390, 844], [393, 852], [430, 932], [440, 956], [844, 390]];
const GAP = 8;
// The bar as it was before the phone re-layout (new player, 40 coins, full fuel; production build, Oct 23 2026).
const BASE = { 'desktop 1280x800': { l: 487, r: 793, t: 20 }, 'tablet 768x1024': { l: 278, r: 490, t: 16 } };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
async function enter(p) {
  await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 }); await p.waitForTimeout(6000);
  await p.click('text=Get my save code', { timeout: 20000 }).catch(() => {}); await p.waitForTimeout(2000);
  await p.click('button:has-text("Get my code")', { timeout: 4000 }).catch(() => {}); await p.waitForTimeout(2500);
  await p.click('button:has-text("I saved it")', { timeout: 4000 }).catch(() => {}); await p.waitForTimeout(1500);
  await p.click('button:has-text("Play")', { timeout: 8000 }).catch(() => {});
  await p.waitForFunction(() => !!document.querySelector('[data-job-wallet]'), null, { timeout: 120000 }).catch(() => {});
  await p.waitForTimeout(9000);
  await p.click('button:has-text("Skip")', { timeout: 8000 }).catch(() => {}); await p.waitForTimeout(1500);
  await p.keyboard.press('Escape').catch(() => {}); await p.waitForTimeout(800);
}
// Party of four (the player + three scripted friends over the dev relay), as in scripts/check-friend-bump-live.cjs.
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
  const ws = [['Ayako', [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8]], ['Leo', [2, 7, 1, 8, 2, 8, 1, 8, 2, 8, 4, 5]], ['Mia', [1, 4, 1, 4, 2, 1, 3, 5, 6, 2, 3, 7]]].map(([name, look]) => {
    const s = new WebSocket(relay.replace(/^http/, 'ws').replace(/\/$/, '') + '/party/' + code + '/ws');
    s.onopen = () => s.send(JSON.stringify([P.C.Hello, P.PROTOCOL_VERSION, look, null, null, null, name]));
    s.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m[0] === P.S.Caps) s.send(JSON.stringify([P.C.Caps, m[1]])); };
    return s;
  });
  await wait(1500); await p.click('[data-party-sheet] button:has-text("Done")'); await p.waitForTimeout(3000);
  return ws;
}
const measure = (p, digits) => p.evaluate(({ digits }) => {
  const rect = (e) => { if (!e) return null; const r = e.getBoundingClientRect(); return r.width ? { l: r.left, r: r.right, t: r.top, b: r.bottom, w: r.width } : null; };
  const b = (s) => rect(document.querySelector(s));
  // Layout boxes, not the Paths button's one-off shake (a transform): animations paused while measuring.
  const still = document.createElement('style'); still.textContent = '[data-hud-triggers] *{animation:none!important;transition:none!important}'; document.head.append(still);
  const bar = document.querySelector('[data-job-wallet]'), coin = bar?.querySelector(':scope > b'), was = coin?.textContent, wasD = bar?.dataset.coinDigits;
  if (digits && coin) { coin.textContent = digits; bar.dataset.coinDigits = String(digits.length); }
  // The friends box includes the party badge (it pokes 4 px out of the circle while a party is live).
  let friends = b('[data-party-open]'); const badge = b('[data-party-badge]');
  if (friends && badge) friends = { l: Math.min(friends.l, badge.l), r: Math.max(friends.r, badge.r), t: Math.min(friends.t, badge.t), b: Math.max(friends.b, badge.b), w: 0 };
  const boxes = { paths: b('[data-tour="quests"]'), friends, bar: b('[data-job-wallet]'), settings: b('[data-hud-triggers] button[aria-label="Settings"]') };
  const shown = [...document.querySelectorAll('[data-job-wallet] > em')].filter((e) => getComputedStyle(e).display !== 'none').map((e) => e.dataset.walletBasket || (e.dataset.fuel !== undefined ? 'fuel' : '?'));
  const pairCss = parseFloat(getComputedStyle(document.querySelector('nav[data-hud-triggers]')).columnGap) || 8;
  const stack = (() => { const e = document.querySelector('.hud-stack'); if (!e || getComputedStyle(e).display === 'none') return null; const r = e.getBoundingClientRect(); return { l: r.left, r: r.right, t: r.top }; })();
  if (digits && coin) { coin.textContent = was; bar.dataset.coinDigits = wasD; } still.remove();
  return { boxes, shown, pairCss, label: bar?.getAttribute('aria-label') || '', vw: innerWidth, stack, badge: !!badge };
}, { digits });
const sep = (a, c) => Math.max(c.l - a.r, a.l - c.r, c.t - a.b, a.t - c.b);
function judge(name, m, phone) {
  const fails = [], k = Object.keys(m.boxes).filter((x) => m.boxes[x]), B = m.boxes;
  if (!B.friends) fails.push('no friends button (build with NEXT_PUBLIC_MULTIPLAYER=1)');
  if (!B.bar) fails.push('no coins bar');
  const gaps = {};
  for (let i = 0; i < k.length; i++) for (let j = i + 1; j < k.length; j++) {
    const g = sep(B[k[i]], B[k[j]]); gaps[`${k[i]}-${k[j]}`] = Math.round(g * 10) / 10;
    if (g < GAP) fails.push(`${k[i]}/${k[j]} only ${g.toFixed(1)} px apart`);
  }
  const bar = B.bar, off = bar ? Math.round(((bar.l + bar.r) / 2 - m.vw / 2) * 10) / 10 : null;
  let pair = null;
  if (phone && bar && B.settings && B.paths) {
    // Owner (Oct 23 2026, final): left group Paths + friends, right group bar + Settings; bar <-> Settings == Paths <-> friends.
    const side = B.friends && Math.abs(B.friends.t - B.paths.t) < 2; // <= 340 px the friends button sits under Paths
    pair = side ? B.friends.l - B.paths.r : m.pairCss;
    const bs = B.settings.l - bar.r; if (Math.abs(bs - pair) > 1) fails.push(`bar <-> Settings ${bs.toFixed(1)} px, Paths <-> friends ${pair.toFixed(1)} px`);
    const left = side ? B.friends.r : B.paths.r, free = bar.l - left;
    if (free < pair) fails.push(`only ${free.toFixed(1)} px between the left group and the bar (want >= ${pair.toFixed(1)})`);
    if (bar.t !== B.settings.t && Math.abs(bar.t - B.settings.t) > 1) fails.push('bar is not in the Settings row');
  } else if (off !== null && Math.abs(off) > 2) fails.push(`coins bar is ${off} px off the screen centre`);
  if (!phone && BASE[name] && bar) { const e = BASE[name]; if (Math.abs(bar.l - e.l) > 1 || Math.abs(bar.r - e.r) > 1 || Math.abs(bar.t - e.t) > 1) fails.push(`bar rect ${Math.round(bar.l)}-${Math.round(bar.r)} @${Math.round(bar.t)} differs from before (${e.l}-${e.r} @${e.t})`); }
  if (m.stack && bar && m.stack.t < bar.b) fails.push('HUD stack starts above the bar bottom');
  if (m.stack && Math.abs((m.stack.l + m.stack.r) / 2 - m.vw / 2) > 1.5) fails.push('HUD stack is not centred');
  const f = B.friends; if (m.stack && f && m.stack.l < f.r && m.stack.r > f.l && m.stack.t < f.b + GAP) fails.push('HUD stack starts beside the friends button');
  if (phone && m.shown.join('+') !== 'fuel') fails.push(`phone bar shows ${m.shown.join('+')}, want only coins + fuel`);
  if (!phone && m.shown.join('+') !== 'fish+fruit+fuel') fails.push(`bar shows ${m.shown.join('+')}, want fish+fruit+fuel`);
  if (!/fish/.test(m.label) || !/fruit/.test(m.label)) fails.push('aria-label lost the fish / fruit counts');
  return { name, fails, gaps, pair, barW: bar && Math.round(bar.w), barOffCentre: off, shown: m.shown.join('+') };
}
(async () => {
  const b = await pw.chromium.launch({ channel: process.env.PW_CHANNEL || undefined, args: ['--mute-audio'] });
  let fail = 0; const rows = []; const sockets = [];
  try {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
    const p = await ctx.newPage(); await enter(p);
    for (const [w, h] of PHONES) {
      if (process.env.HUD_DEBUG) console.error('viewport', w, h);
      await p.setViewportSize({ width: w, height: h }); await p.waitForTimeout(900);
      for (const digits of [null, '9999', '12345']) rows.push(judge(`${w}x${h}${digits ? ` (${digits} coins)` : ''}`, await measure(p, digits), true));
      if (w === 320 || w === 360 || w === 440 || w === 844) await p.screenshot({ path: `${out}/phone-${w}x${h}.png` });
    }
    // Low / empty fuel adds a word ("Low", "Empty") to the bolt counter: the widest the slim bar gets.
    for (const fuel of [15, 0]) {
      const level = await p.evaluate((fuel) => { const k = 'fi2-fuel-v1', d = new Date(), day = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; localStorage.setItem(k, JSON.stringify({ version: 1, fuel, day })); window.dispatchEvent(new StorageEvent('storage', { key: k })); return new Promise((r) => setTimeout(() => r(document.querySelector('[data-fuel-level]')?.dataset.fuelLevel), 400)); }, fuel);
      for (const [w, h] of PHONES) {
        await p.setViewportSize({ width: w, height: h }); await p.waitForTimeout(500);
        for (const digits of [null, '12345']) { const r = judge(`${w}x${h} fuel ${level}${digits ? ` (${digits} coins)` : ''}`, await measure(p, digits), true); if (level !== 'low' && level !== 'empty') r.fails.push('could not set the fuel level'); rows.push(r); }
      }
    }
    await ctx.close();
    const d = await b.newContext({ viewport: { width: 1280, height: 800 } }); const q = await d.newPage(); await enter(q);
    rows.push(judge('desktop 1280x800', await measure(q, null), false)); await q.screenshot({ path: `${out}/desktop-1280x800.png` }); await d.close();
    const t = await b.newContext({ viewport: { width: 768, height: 1024 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 }); const tp = await t.newPage(); await enter(tp);
    rows.push(judge('tablet 768x1024', await measure(tp, null), false)); await t.close();
  } finally { await b.close(); }
  // Real-device descriptors in WebKit (the iPhone engine): the owner's phone, not a resized desktop page.
  const wk = await pw.webkit.launch();
  try {
    for (const dev of ['iPhone 15', 'iPhone 17 Pro Max', 'iPhone 17 Pro Max landscape']) {
      const c = await wk.newContext({ ...pw.devices[dev] }); const p = await c.newPage(); await enter(p);
      if (relay && dev === 'iPhone 15') sockets.push(...await party(p));
      for (const digits of [null, '12345']) { const m = await measure(p, digits), r = judge(`webkit ${dev}${relay && dev === 'iPhone 15' ? ' party of 4' : ''}${digits ? ` (${digits} coins)` : ''}`, m, true); if (relay && dev === 'iPhone 15' && !m.badge) r.fails.push('party badge missing'); rows.push(r); }
      if (dev === 'iPhone 15') await p.screenshot({ path: `${out}/iphone15-${relay ? 'party' : 'solo'}.png` });
      await c.close();
    }
  } finally { sockets.forEach((s) => { try { s.close(); } catch { /* gone */ } }); await wk.close(); }
  for (const r of rows) { console.log(`${r.fails.length ? 'FAIL' : 'ok  '} ${r.name}: bar ${r.barW}px, off-centre ${r.barOffCentre}px, pair ${r.pair ?? '-'}, counters coins+${r.shown}, gaps ${JSON.stringify(r.gaps)}${r.fails.length ? ' -> ' + r.fails.join('; ') : ''}`); fail += r.fails.length; }
  console.log(fail ? `FAIL hud row: ${fail} problem(s)` : `PASS hud row: ${rows.length} measurements`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
