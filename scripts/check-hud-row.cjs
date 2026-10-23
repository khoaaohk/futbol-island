// Headless check (Oct 23 2026, docs/ui/HUD_STACK.md "Top row on phones"): the island top row [Paths][Play with friends][coins bar]
// [Settings] never overlaps.
// - Phones (portrait <= 480 wide, landscape <= 480 tall): 320, 360, 375, 390, 393, 430, 440 wide, portrait and landscape, touch,
//   3-, 4- and 5-digit balances, full / low / empty fuel, solo and (with a relay URL) in a party of 4 (badge). Owner (Oct 23 2026,
//   stretched bar): the bar fills the row between the left group and Settings: Paths <-> friends == friends <-> bar ==
//   bar <-> Settings (within 1 px; <= 340 px friends sits under Paths, so Paths <-> bar), all four counters (coins, fish, fruit,
//   fuel) inside the bar, not overlapping, with equal spaces between them (within 2 px), coin number 20 px, measured with fish and
//   fruit at 2 digits (the basket holds 20). Where the bar's content box is under FOUR[coin digits] px (container query 'hudbar'
//   in IslandJobs.module.css) fish / fruit are display:none and coins + energy sit at the two ends; at or above it all four show.
// - Real-device pass (WebKit, Playwright's 'iPhone 15', 'iPhone 17 Pro Max' (+ landscape) descriptors: isMobile, hasTouch, DPR 3): the same
//   rules, measured with the fish / fruit chips' computed display. With a relay URL it first starts a party and three scripted
//   friends join (the badge shows 4), like the owner's phone.
// - Desktop 1280x800 and touch tablet 768x1024: all four counters, bar centred, and the bar rect equals the pre-change rect (1 px).
// - Narrow desktop windows (Oct 23 2026, owner at ~497 px): fine pointer, not isMobile, 958 tall, every width 320..900 px, full and
//   empty fuel, 3-5 digit coins, solo and (with a relay URL) in a party of 4. <= HUD_NARROW (660) the phone asserts above; wider,
//   the centred bar with >= 8 px to every neighbour; at the breakpoint the centred bar keeps >= 8 px margin past the pair gap and
//   no bar edge moves more than 1.5 px between neighbouring widths except at 340/341 (friends row), 600/601 (18 -> 24 px edge)
//   and HUD_NARROW/+1 (stretched -> centred). HUD_ONLY=narrow runs just this sweep.
// Run: node --experimental-websocket scripts/check-hud-row.cjs <appUrl> [outDir] [relayUrl]
//   (app built with NEXT_PUBLIC_MULTIPLAYER=1 [+ NEXT_PUBLIC_MULTIPLAYER_URL=<relayUrl>]; PW_CHANNEL=chrome if the bundled chromium is missing)
const pw = require('playwright');
const path = require('path');
const url = process.argv[2] || 'http://localhost:8739', out = process.argv[3] || '/tmp/hud-coins', relay = process.argv[4] || '';
require('fs').mkdirSync(out, { recursive: true });
const PHONES = [[320, 568], [360, 740], [375, 667], [390, 844], [393, 852], [430, 932], [440, 956], [568, 320], [740, 360], [667, 375], [844, 390], [852, 393], [932, 430], [956, 440]];
const GAP = 8;
// HUD_NARROW (docs/ui/HUD_STACK.md "Narrow windows"): <= this width every window gets the stretched phone bar.
const NARROW = 660;
// Four-chip thresholds (bar content-box width) by coin digits; keep in step with the @container hudbar rules.
const FOUR = (d) => (d >= 5 ? 241 : d === 4 ? 234 : 222);
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
const measure = (p, digits, worst = true) => p.evaluate(({ digits, worst }) => {
  const rect = (e) => { if (!e) return null; const r = e.getBoundingClientRect(); return r.width ? { l: r.left, r: r.right, t: r.top, b: r.bottom, w: r.width } : null; };
  const b = (s) => rect(document.querySelector(s));
  // Layout boxes, not the Paths button's one-off shake (a transform): animations paused while measuring.
  const still = document.createElement('style'); still.textContent = '[data-hud-triggers] *{animation:none!important;transition:none!important}'; document.head.append(still);
  const bar = document.querySelector('[data-job-wallet]'), coin = bar?.querySelector(':scope > b'), was = coin?.textContent, wasD = bar?.dataset.coinDigits;
  if (digits && coin) { coin.textContent = digits; bar.dataset.coinDigits = String(digits.length); }
  // Worst case for fish / fruit: 2 digits each.
  const basket = bar ? [...bar.querySelectorAll('[data-wallet-basket] span')].map((e) => [e, e.textContent]) : []; if (worst) basket.forEach(([e]) => { e.textContent = '10'; });
  // The friends box includes the party badge (it pokes 4 px out of the circle while a party is live).
  let friends = b('[data-party-open]'); const badge = b('[data-party-badge]');
  if (friends && badge) friends = { l: Math.min(friends.l, badge.l), r: Math.max(friends.r, badge.r), t: Math.min(friends.t, badge.t), b: Math.max(friends.b, badge.b), w: 0 };
  const boxes = { paths: b('[data-tour="quests"]'), friends, bar: b('[data-job-wallet]'), settings: b('[data-hud-triggers] button[aria-label="Settings"]') };
  // The four chips: coin group (coin icon + number), fish, fruit, fuel.
  const cs = bar ? getComputedStyle(bar) : null, inner = bar && { l: bar.getBoundingClientRect().left + parseFloat(cs.borderLeftWidth), r: bar.getBoundingClientRect().right - parseFloat(cs.borderRightWidth) };
  const coinR = rect(bar?.querySelector(':scope > span')), numR = rect(coin);
  const chips = bar ? [coinR && numR ? { n: 'coins', l: coinR.l, r: numR.r } : null, ...[...bar.querySelectorAll(':scope > em')].filter((e) => getComputedStyle(e).display !== 'none').map((e) => ({ n: e.dataset.walletBasket || 'fuel', ...rect(e) }))] : [];
  const coinFont = coin ? parseFloat(getComputedStyle(coin).fontSize) : 0, coinClip = coin ? coin.scrollWidth > Math.ceil(coin.getBoundingClientRect().width) + 1 : true;
  const shown = [...document.querySelectorAll('[data-job-wallet] > em')].filter((e) => getComputedStyle(e).display !== 'none').map((e) => e.dataset.walletBasket || (e.dataset.fuel !== undefined ? 'fuel' : '?'));
  const pairCss = parseFloat(getComputedStyle(document.querySelector('nav[data-hud-triggers]')).columnGap) || 8;
  const stack = (() => { const e = document.querySelector('.hud-stack'); if (!e || getComputedStyle(e).display === 'none') return null; const r = e.getBoundingClientRect(); return { l: r.left, r: r.right, t: r.top }; })();
  const content = bar ? bar.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) : 0, nd = Number(bar?.dataset.coinDigits || 1);
  basket.forEach(([e, t]) => { e.textContent = t; });
  if (digits && coin) { coin.textContent = was; bar.dataset.coinDigits = wasD; } still.remove();
  return { boxes, shown, pairCss, chips, inner, coinFont, coinClip, content, nd, label: bar?.getAttribute('aria-label') || '', vw: innerWidth, stack, badge: !!badge };
}, { digits, worst });
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
    if (Math.abs(free - pair) > 1) fails.push(`left group <-> bar ${free.toFixed(1)} px, want ${pair.toFixed(1)} (bar fills the row)`);
    if (side && Math.abs(B.friends.l - B.paths.r - GAP) > 1) fails.push(`Paths <-> friends ${(B.friends.l - B.paths.r).toFixed(1)} px`);
    if (bar.t !== B.settings.t && Math.abs(bar.t - B.settings.t) > 1) fails.push('bar is not in the Settings row');
  } else if (off !== null && Math.abs(off) > 2) fails.push(`coins bar is ${off} px off the screen centre`);
  if (!phone && BASE[name] && bar) { const e = BASE[name]; if (Math.abs(bar.l - e.l) > 1 || Math.abs(bar.r - e.r) > 1 || Math.abs(bar.t - e.t) > 1) fails.push(`bar rect ${Math.round(bar.l)}-${Math.round(bar.r)} @${Math.round(bar.t)} differs from before (${e.l}-${e.r} @${e.t})`); }
  if (m.stack && bar && m.stack.t < bar.b) fails.push('HUD stack starts above the bar bottom');
  if (m.stack && Math.abs((m.stack.l + m.stack.r) / 2 - m.vw / 2) > 1.5) fails.push('HUD stack is not centred');
  const f = B.friends; if (m.stack && f && m.stack.l < f.r && m.stack.r > f.l && m.stack.t < f.b + GAP) fails.push('HUD stack starts beside the friends button');
  const four = !phone || m.content >= FOUR(m.nd), want = four ? 'fish+fruit+fuel' : 'fuel';
  if (m.shown.join('+') !== want) fails.push(`bar (${Math.round(m.content)} px content, ${m.nd} digits) shows ${m.shown.join('+')}, want ${want}`);
  let chipGaps = null;
  if (phone && m.chips.length >= 2 && m.inner) {
    const c = m.chips, n = c.length - 1; chipGaps = c.slice(1).map((x, i) => Math.round((x.l - c[i].r) * 10) / 10);
    if (c[0].l < m.inner.l - 0.5 || c[n].r > m.inner.r + 0.5) fails.push(`counters clipped: ${c[0].l.toFixed(1)}-${c[n].r.toFixed(1)} outside ${m.inner.l.toFixed(1)}-${m.inner.r.toFixed(1)}`);
    if (chipGaps.some((g) => g < 6)) fails.push(`counters too close: gaps ${chipGaps.join(', ')}`);
    if (Math.max(...chipGaps) - Math.min(...chipGaps) > 2) fails.push(`uneven counter spacing ${chipGaps.join(', ')}`);
    if (m.coinFont < 20 || m.coinClip) fails.push(`coin number ${m.coinFont}px${m.coinClip ? ', clipped' : ''}`);
  } else if (phone) fails.push(`want counters, got ${m.chips.length}`);
  if (!/fish/.test(m.label) || !/fruit/.test(m.label)) fails.push('aria-label lost the fish / fruit counts');
  return { name, fails, gaps, pair, chipGaps, coinFont: m.coinFont, content: Math.round(m.content), barW: bar && Math.round(bar.w), barOffCentre: off, shown: m.shown.join('+') };
}
// Threshold sweep: every width from 416 to 476 px portrait, so the bar's content box crosses the four-chip thresholds (full
// fuel "100", the widest number) and the Low / Empty word thresholds (empty fuel "0 EMPTY", the widest word) 1 px at a time.
async function sweep(p, fuel) {
  for (let w = 416; w <= 476; w++) {
    await p.setViewportSize({ width: w, height: 900 }); await p.waitForTimeout(120);
    for (const digits of ['999', '9999', '12345']) rows.push(judge(`sweep ${w}x900 fuel ${fuel} (${digits} coins)`, await measure(p, digits), true));
  }
}
// Narrow desktop windows: 1 px steps 320..900, fine pointer. Returns after recording rows; jumps checked per series.
async function narrowSweep(p, tag) {
  for (const fuel of [100, 0]) {
    await p.evaluate((fuel) => { const k = 'fi2-fuel-v1', d = new Date(), day = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; localStorage.setItem(k, JSON.stringify({ version: 1, fuel, day })); window.dispatchEvent(new StorageEvent('storage', { key: k })); return new Promise((r) => setTimeout(r, 500)); }, fuel);
    const prev = {};
    for (let w = 320; w <= 900; w++) {
      await p.setViewportSize({ width: w, height: 958 }); await p.waitForTimeout(60);
      for (const digits of ['999', '9999', '12345']) {
        const m = await measure(p, digits), r = judge(`narrow ${w}x958 ${tag} fuel ${fuel} (${digits} coins)`, m, w <= NARROW), B = m.boxes;
        if (tag === 'party' && !m.badge) r.fails.push('party badge missing');
        // Known (pre-existing on phones too, the 480 px predicate never changed there): 341-343 px with the friends button still in
        // the row and a 5-digit balance ("12.3k" + "100") leave only the CSS minimum 4 px between coins and fuel. Not an overlap.
        if (w >= 341 && w <= 343 && digits === '12345') r.fails = r.fails.filter((f) => !(/^counters too close/.test(f) && r.chipGaps.every((g) => g >= 3.9)));
        const q = prev[digits];
        if (q && B.bar) {
          const dl = Math.abs(B.bar.l - q.l), dr = Math.abs(B.bar.r - q.r);
          const allow = w === 341 ? 60 : w === 601 ? 6.5 : w === NARROW + 1 ? Infinity : 1.5;
          if (dl > allow || dr > allow) r.fails.push(`bar jumped ${dl.toFixed(1)} / ${dr.toFixed(1)} px from ${w - 1} px`);
          if (w === NARROW + 1) {
            const left = Math.max(B.paths.r, B.friends && Math.abs(B.friends.t - B.paths.t) < 2 ? B.friends.r : 0);
            if (B.bar.l - left < GAP + 8 || B.settings.l - B.bar.r < GAP + 8) r.fails.push(`centred bar just past HUD_NARROW only ${(B.bar.l - left).toFixed(1)} / ${(B.settings.l - B.bar.r).toFixed(1)} px from its neighbours (want >= ${GAP + 8})`);
            if (B.bar.w > q.w + 0.5) r.fails.push('bar grew past HUD_NARROW');
          }
        }
        prev[digits] = B.bar; rows.push(r);
      }
    }
  }
}
const rows = [];
(async () => {
  const b = await pw.chromium.launch({ channel: process.env.PW_CHANNEL || undefined, args: ['--mute-audio'] });
  let fail = 0; const sockets = [];
  try {
    {
      const n = await b.newContext({ viewport: { width: 497, height: 958 } }); const np = await n.newPage(); await enter(np);
      await narrowSweep(np, 'solo');
      if (relay) {
        sockets.push(...await party(np)); await narrowSweep(np, 'party');
        await np.setViewportSize({ width: 497, height: 958 }); await np.waitForTimeout(600);
        await np.evaluate(() => document.querySelectorAll('[data-hud-triggers] *').forEach((e) => { e.style.animation = 'none'; }));
        await np.screenshot({ path: `${out}/desktop-window-497x958-party.png` });
      }
      await n.close();
    }
    const only = process.env.HUD_ONLY === 'narrow';
    if (!only) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
    const p = await ctx.newPage(); await enter(p);
    for (const [w, h] of PHONES) {
      if (process.env.HUD_DEBUG) console.error('viewport', w, h);
      await p.setViewportSize({ width: w, height: h }); await p.waitForTimeout(900);
      for (const digits of [null, '9999', '12345']) rows.push(judge(`${w}x${h}${digits ? ` (${digits} coins)` : ''}`, await measure(p, digits), true));
      if (w === 320 || w === 360 || w === 440 || w === 844) await p.screenshot({ path: `${out}/phone-${w}x${h}.png` });
    }
    await sweep(p, 'full');
    // Low / empty fuel adds a word ("Low", "Empty") to the bolt counter: the widest the slim bar gets.
    for (const fuel of [15, 0]) {
      const level = await p.evaluate((fuel) => { const k = 'fi2-fuel-v1', d = new Date(), day = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; localStorage.setItem(k, JSON.stringify({ version: 1, fuel, day })); window.dispatchEvent(new StorageEvent('storage', { key: k })); return new Promise((r) => setTimeout(() => r(document.querySelector('[data-fuel-level]')?.dataset.fuelLevel), 400)); }, fuel);
      for (const [w, h] of PHONES) {
        await p.setViewportSize({ width: w, height: h }); await p.waitForTimeout(500);
        for (const digits of [null, '12345']) { const r = judge(`${w}x${h} fuel ${level}${digits ? ` (${digits} coins)` : ''}`, await measure(p, digits), true); if (level !== 'low' && level !== 'empty') r.fails.push('could not set the fuel level'); rows.push(r); }
      }
    }
    await sweep(p, 'empty');
    if (relay) {
      // Full fuel again, then a party of four (three scripted friends): every phone size, plus the owner's screenshots (4-digit coins).
      await p.setViewportSize({ width: 390, height: 844 });
      await p.evaluate(() => { const k = 'fi2-fuel-v1', d = new Date(), day = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; localStorage.setItem(k, JSON.stringify({ version: 1, fuel: 100, day })); window.dispatchEvent(new StorageEvent('storage', { key: k })); });
      sockets.push(...await party(p));
      for (const [w, h] of PHONES) {
        await p.setViewportSize({ width: w, height: h }); await p.waitForTimeout(500);
        for (const digits of [null, '9999', '12345']) { const m = await measure(p, digits), r = judge(`${w}x${h} party${digits ? ` (${digits} coins)` : ''}`, m, true); if (!m.badge) r.fails.push('party badge missing'); rows.push(r); }
        if ((w === 393 && h === 852) || (w === 360 && h === 740)) {
          const was = await p.evaluate(() => { const bar = document.querySelector('[data-job-wallet]'), c = bar.querySelector(':scope > b'), o = [c.textContent, bar.dataset.coinDigits]; c.textContent = '2480'; bar.dataset.coinDigits = '4'; return o; });
          await p.evaluate(() => document.querySelectorAll('[data-hud-triggers] *').forEach((e) => { e.style.animation = 'none'; }));
          await p.screenshot({ path: `${out}/party-${w}x${h}-4digit.png` });
          await p.evaluate((o) => { const bar = document.querySelector('[data-job-wallet]'), c = bar.querySelector(':scope > b'); c.textContent = o[0]; bar.dataset.coinDigits = o[1]; }, was);
        }
      }
    }
    await ctx.close();
    const d = await b.newContext({ viewport: { width: 1280, height: 800 } }); const q = await d.newPage(); await enter(q);
    rows.push(judge('desktop 1280x800', await measure(q, null, false), false)); await q.screenshot({ path: `${out}/desktop-1280x800.png` }); await d.close();
    const t = await b.newContext({ viewport: { width: 768, height: 1024 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 }); const tp = await t.newPage(); await enter(tp);
    rows.push(judge('tablet 768x1024', await measure(tp, null, false), false)); await t.close();
    }
  } finally { await b.close(); }
  // Real-device descriptors in WebKit (the iPhone engine): the owner's phone, not a resized desktop page.
  if (process.env.HUD_ONLY !== 'narrow') {
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
  } else sockets.forEach((s) => { try { s.close(); } catch { /* gone */ } });
  for (const r of rows) { console.log(`${r.fails.length ? 'FAIL' : 'ok  '} ${r.name}: bar ${r.barW}px, off-centre ${r.barOffCentre}px, pair ${r.pair ?? '-'}, content ${r.content}px, chip gaps ${r.chipGaps ? r.chipGaps.join('/') : '-'}, coin ${r.coinFont}px, counters coins+${r.shown}, gaps ${JSON.stringify(r.gaps)}${r.fails.length ? ' -> ' + r.fails.join('; ') : ''}`); fail += r.fails.length; }
  console.log(fail ? `FAIL hud row: ${fail} problem(s)` : `PASS hud row: ${rows.length} measurements`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
