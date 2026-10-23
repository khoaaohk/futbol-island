// Headless check (Oct 23 2026, docs/ui/HUD_STACK.md "Top row on phones"): the island top row [Paths][Play with friends][coins bar]
// [Settings] never overlaps. Measures the four boxes at 320x568, 360x740, 390x844, 430x932 and landscape 844x390 (touch phone) and
// 1280x800 (desktop): every pair is >= 8 px apart (horizontally, or vertically where the friends button sits under Paths), the phone
// bar shows only coins + fuel (fish / fruit hidden, still in its aria-label and the pocket it opens), desktop keeps all four, and
// the HUD stack stays centred under the bar. Also measures 4- and 5-digit coin counts.
// Run: node scripts/check-hud-row.cjs <appUrl> [outDir]   (app built with NEXT_PUBLIC_MULTIPLAYER=1 so the friends button shows)
const { chromium } = require('playwright');
const url = process.argv[2] || 'http://localhost:8739', out = process.argv[3] || '/tmp/hud-coins';
require('fs').mkdirSync(out, { recursive: true });
const PHONES = [[320, 568], [360, 740], [390, 844], [430, 932], [844, 390]];
const GAP = 8;
async function enter(p) {
  await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 }); await p.waitForTimeout(6000);
  await p.click('text=Get my save code', { timeout: 20000 }).catch(() => {}); await p.waitForTimeout(2000);
  await p.click('button:has-text("Get my code")', { timeout: 4000 }).catch(() => {}); await p.waitForTimeout(2500);
  await p.click('button:has-text("I saved it")', { timeout: 4000 }).catch(() => {}); await p.waitForTimeout(1500);
  await p.click('button:has-text("Play")', { timeout: 8000 }).catch(() => {});
  await p.waitForFunction(() => !!window.__fi2?.scene, null, { timeout: 90000 }).catch(() => {});
  await p.waitForTimeout(9000);
  await p.click('button:has-text("Skip")', { timeout: 8000 }).catch(() => {}); await p.waitForTimeout(1500);
  await p.keyboard.press('Escape').catch(() => {}); await p.waitForTimeout(800);
}
const measure = (p, digits) => p.evaluate(({ digits }) => {
  const b = (s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return r.width ? { l: r.left, r: r.right, t: r.top, b: r.bottom, w: r.width } : null; };
  // Layout boxes, not the Paths button's one-off shake (a transform): animations paused while measuring.
  const still = document.createElement('style'); still.textContent = '[data-hud-triggers] *{animation:none!important;transition:none!important}'; document.head.append(still);
  const bar = document.querySelector('[data-job-wallet]'), coin = bar?.querySelector(':scope > b'), was = coin?.textContent, wasD = bar?.dataset.coinDigits;
  if (digits && coin) { coin.textContent = digits; bar.dataset.coinDigits = String(digits.length); }
  const boxes = { paths: b('[data-tour="quests"]'), friends: b('[data-party-open]'), bar: b('[data-job-wallet]'), settings: b('[data-hud-triggers] button[aria-label="Settings"]') };
  const shown = [...document.querySelectorAll('[data-job-wallet] > em')].filter((e) => getComputedStyle(e).display !== 'none').map((e) => e.dataset.walletBasket || (e.dataset.fuel !== undefined ? 'fuel' : '?'));
  // The column's box (it may be empty: then its width still comes from CSS; a covered stack is display:none and skipped).
  const stack = (() => { const e = document.querySelector('.hud-stack'); if (!e || getComputedStyle(e).display === 'none') return null; const r = e.getBoundingClientRect(); return { l: r.left, r: r.right, t: r.top }; })();
  if (digits && coin) { coin.textContent = was; bar.dataset.coinDigits = wasD; } still.remove();
  return { boxes, shown, label: document.querySelector('[data-job-wallet]')?.getAttribute('aria-label') || '', vw: innerWidth, stack, stackTop: stack ? stack.t : null, stackMid: stack ? (stack.l + stack.r) / 2 : null };
}, { digits });
function judge(name, m) {
  const fails = [], k = Object.keys(m.boxes).filter((x) => m.boxes[x]);
  if (!m.boxes.friends) fails.push('no friends button (build with NEXT_PUBLIC_MULTIPLAYER=1)');
  if (!m.boxes.bar) fails.push('no coins bar');
  const gaps = {};
  for (let i = 0; i < k.length; i++) for (let j = i + 1; j < k.length; j++) {
    const a = m.boxes[k[i]], c = m.boxes[k[j]];
    const dx = Math.max(c.l - a.r, a.l - c.r), dy = Math.max(c.t - a.b, a.t - c.b), g = Math.max(dx, dy);
    gaps[`${k[i]}-${k[j]}`] = Math.round(g * 10) / 10; if (g < GAP) fails.push(`${k[i]}/${k[j]} only ${g.toFixed(1)} px apart`);
  }
  const bar = m.boxes.bar, off = bar ? Math.round(((bar.l + bar.r) / 2 - m.vw / 2) * 10) / 10 : null;
  if (m.stackTop !== null && bar && m.stackTop < bar.b) fails.push('HUD stack starts above the bar bottom');
  if (m.stackMid !== null && Math.abs(m.stackMid - m.vw / 2) > 1.5) fails.push('HUD stack is not centred');
  const f = m.boxes.friends; if (m.stack && f && m.stack.l < f.r && m.stack.r > f.l && m.stack.t < f.b + GAP) fails.push('HUD stack starts beside the friends button');
  return { name, fails, gaps, barW: bar && Math.round(bar.w), barOffCentre: off, shown: m.shown.join('+') };
}
(async () => {
  const b = await chromium.launch({ channel: process.env.PW_CHANNEL || undefined, args: ['--mute-audio'] });
  let fail = 0; const rows = [];
  try {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
    const p = await ctx.newPage(); await enter(p);
    for (const [w, h] of PHONES) {
      await p.setViewportSize({ width: w, height: h }); await p.waitForTimeout(900);
      for (const digits of [null, '9999', '12345']) {
        const m = await measure(p, digits), r = judge(`${w}x${h}${digits ? ` (${digits} coins)` : ''}`, m);
        if (r.shown !== 'fuel') r.fails.push(`phone bar shows ${r.shown}, want only coins + fuel`);
        if (!/fish/.test(m.label) || !/fruit/.test(m.label)) r.fails.push('aria-label lost the fish / fruit counts');
        rows.push(r);
      }
      if (w === 320 || w === 390 || w === 844) await p.screenshot({ path: `${out}/phone-${w}x${h}.png` });
    }
    // Low / empty fuel adds a word ("Low", "Empty") to the bolt counter: the widest the slim bar gets.
    for (const fuel of [15, 0]) {
      const level = await p.evaluate((fuel) => { const k = 'fi2-fuel-v1', d = new Date(), day = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; localStorage.setItem(k, JSON.stringify({ version: 1, fuel, day })); window.dispatchEvent(new StorageEvent('storage', { key: k })); return new Promise((r) => setTimeout(() => r(document.querySelector('[data-fuel-level]')?.dataset.fuelLevel), 400)); }, fuel);
      for (const [w, h] of PHONES) {
        await p.setViewportSize({ width: w, height: h }); await p.waitForTimeout(500);
        for (const digits of [null, '9999']) { const m = await measure(p, digits), r = judge(`${w}x${h} fuel ${level}${digits ? ` (${digits} coins)` : ''}`, m); if (level !== 'low' && level !== 'empty') r.fails.push('could not set the fuel level'); rows.push(r); }
      }
    }
    await ctx.close();
    const d = await b.newContext({ viewport: { width: 1280, height: 800 } }); const q = await d.newPage(); await enter(q);
    const m = await measure(q, null), r = judge('desktop 1280x800', m);
    if (r.shown !== 'fish+fruit+fuel') r.fails.push(`desktop bar shows ${r.shown}, want fish+fruit+fuel`);
    rows.push(r); await q.screenshot({ path: `${out}/desktop-1280x800.png` }); await d.close();
  } finally { await b.close(); }
  for (const r of rows) { console.log(`${r.fails.length ? 'FAIL' : 'ok  '} ${r.name}: bar ${r.barW}px, off-centre ${r.barOffCentre}px, counters coins+${r.shown}, gaps ${JSON.stringify(r.gaps)}${r.fails.length ? ' -> ' + r.fails.join('; ') : ''}`); fail += r.fails.length; }
  console.log(fail ? `FAIL hud row: ${fail} problem(s)` : `PASS hud row: no overlap at ${rows.length} measurements (gap >= ${GAP} px)`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
