// Headless check (Party rejoin, docs/multiplayer-design.md 2.6.1): the party session lives on the device, so
//  1. a host who CLOSES the tab (a new browser context with the same storage) opens a new page and auto-resumes as host, same slot;
//  2. two tabs: the second says "Your party is open in another tab"; "Use it here" moves it; the first says it moved and goes quiet;
//  3. a guest sees the code (read-only) with Share link, no New code; a New code from the host reaches the guest;
//  4. a lapsed slot (unknown token, valid code): the menu shows "Rejoin your party"; tapping it opens Join with the code filled in;
//  5. after End party the stored session is gone (host and guest).
// Screenshots (phone 390x844 + desktop 1280x800) of the menu states and the guest Code tab go to outDir.
// Run: node scripts/check-party-rejoin.cjs <appUrl> [outDir]  (app with NEXT_PUBLIC_MULTIPLAYER=1 + NEXT_PUBLIC_MULTIPLAYER_URL=<relay>;
//      PW_CHANNEL=chrome when the bundled browser is missing)
const { chromium } = require('playwright');
const url = (process.argv[2] || 'http://localhost:8661').replace(/\/$/, ''), out = process.argv[3] || '/tmp/party-rejoin';
require('fs').mkdirSync(out, { recursive: true });
const KEY = 'fi2-party-session-v1';
const PHONE = { width: 390, height: 844 }, DESK = { width: 1280, height: 800 };

(async () => {
  let fail = 0;
  const bad = (m) => { fail++; console.log('FAIL:', m); };
  const okIf = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fail++; };
  const b = await chromium.launch({ channel: process.env.PW_CHANNEL || undefined, args: ['--mute-audio'] });
  const errs = [];
  const watch = (p) => p.on('pageerror', (e) => errs.push(e.message));
  const session = (p) => p.evaluate((k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } }, KEY).catch(() => null);
  const isLive = (p) => p.evaluate(() => document.querySelector('[data-party-open]')?.getAttribute('data-party-live') === 'true').catch(() => false);
  const waitFor = async (p, fn, ms = 40000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await fn()) return true; await p.waitForTimeout(500); } return false; };
  const shot = async (p, name) => {
    const vp = p.viewportSize();
    await p.setViewportSize(PHONE); await p.waitForTimeout(700); await p.screenshot({ path: `${out}/${name}-phone.png` });
    await p.setViewportSize(DESK); await p.waitForTimeout(700); await p.screenshot({ path: `${out}/${name}-desktop.png` });
    await p.setViewportSize(vp);
  };
  const gate = async (p) => {
    await p.waitForSelector('[data-parent-gate-answer]', { timeout: 15000 }); await p.waitForTimeout(400);
    const q = (await p.textContent('[data-parent-gate]')).toLowerCase();
    const w = { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12 };
    const mm = q.match(/(\w+) times (\w+)/); const nn = q.match(/\d+/g);
    await p.fill('[data-parent-gate-answer]', String(mm ? (w[mm[1]] ?? +mm[1]) * (w[mm[2]] ?? +mm[2]) : nn ? +nn[0] * +nn[1] : 0));
    await p.click('[data-parent-gate] button[type=submit]');
  };
  const nick = async (p, name) => {
    const sel = 'input[aria-label="First name"]';
    await p.waitForSelector(sel, { timeout: 15000 });
    for (let i = 0; i < 4 && !(await p.evaluate((s) => document.querySelector(s).value, sel)); i++) { await p.fill(sel, name); await p.waitForTimeout(600); }
  };
  // New player: take a save code, play, skip the walkthrough. Returning (stored save): Play if asked, skip.
  const enter = async (p, path = '/', fresh = true) => {
    await p.goto(url + path, { waitUntil: 'domcontentloaded', timeout: 120000 }); await p.waitForTimeout(6000);
    if (fresh) { await p.click('text=Get my save code', { timeout: 20000 }).catch(() => {}); await p.waitForTimeout(2000); }
    await p.click('button:has-text("Play")', { timeout: 8000 }).catch(() => {}); await p.waitForTimeout(14000);
    await p.click('button:has-text("Skip")', { timeout: 12000 }).catch(() => {}); await p.waitForTimeout(1500);
  };
  const openMenu = async (p) => { await p.evaluate(() => document.querySelector('[data-party-open]')?.click()); await p.waitForTimeout(900); };
  const closeCard = async (p) => { await p.keyboard.press('Escape').catch(() => {}); await p.waitForTimeout(600); };

  // ---- 1. host starts a party, closes the tab, comes back in a new page ----
  const ctxA = await b.newContext({ viewport: DESK });
  const a1 = await ctxA.newPage(); watch(a1);
  await enter(a1);
  await openMenu(a1); await nick(a1, 'Sam');
  await a1.click('text=Start a party'); await gate(a1);
  await a1.waitForSelector('[data-party-code]', { timeout: 20000 }); await a1.waitForTimeout(1500);
  const code = (await a1.textContent('[data-party-code]')).replace(/[^A-Z0-9]/gi, '');
  okIf(code.length === 6, 'party made');
  await closeCard(a1);
  const s0 = await session(a1);
  okIf(!!(s0 && s0.code === code && s0.resumeToken && s0.hostKey), 'session stored on the device (code, token, host key)');
  okIf(s0 && !JSON.stringify(s0).includes('Sam'), 'no first name in the stored session');
  const state = await ctxA.storageState();
  await ctxA.close(); // the tab (and the whole browser profile) is gone
  const ctxA2 = await b.newContext({ viewport: DESK, storageState: state });
  const a2 = await ctxA2.newPage(); watch(a2);
  await enter(a2, '/'); // this dev build has no save service: the title may ask for a code again (the party session is separate)
  okIf(await waitFor(a2, () => isLive(a2)), 'new page after closing the tab: auto-resumed');
  const s1 = await session(a2);
  okIf(!!(s1 && s1.resumeToken === s0.resumeToken && s1.code === code), 'same slot (same resume token)');
  await openMenu(a2);
  okIf(await a2.isVisible('[data-party-new-code]').catch(() => false), 'still the host (New code on the Code tab)');
  await closeCard(a2);

  // ---- 2. two tabs: the second sees the party is open elsewhere, Use it here moves it ----
  const a3 = await ctxA2.newPage(); watch(a3);
  await enter(a3, '/'); // this dev build has no save service: the title may ask for a code again (the party session is separate)
  okIf(!(await isLive(a3)), 'second tab does not take the party by itself');
  await openMenu(a3);
  const elsewhere = await a3.textContent('[data-party-elsewhere]').catch(() => '');
  okIf(/open in another tab/.test(elsewhere || ''), 'second tab: "Your party is open in another tab"');
  await shot(a3, 'menu-open-in-another-tab');
  await a3.click('[data-party-use-here]');
  okIf(await waitFor(a3, () => isLive(a3)), 'Use it here: the second tab is live');
  okIf(await waitFor(a2, async () => !(await isLive(a2)), 15000), 'the first tab went quiet');
  const movedToast = await a2.textContent('[data-party-toast]').catch(() => '');
  console.log('     first tab note:', JSON.stringify(movedToast));
  okIf(!!(await session(a2)), 'the session was not cleared by the move');
  await a2.bringToFront(); await openMenu(a2);
  okIf(/moved to another tab/.test((await a2.textContent('[data-party-elsewhere]').catch(() => '')) || ''), 'first tab menu: "Your party moved to another tab"');
  await shot(a2, 'menu-moved-to-another-tab');
  await closeCard(a2); await a2.close();
  await a3.bringToFront();
  const s2 = await session(a3);
  okIf(!!(s2 && s2.resumeToken === s0.resumeToken), 'same slot after the move');

  // ---- 3. a guest sees the code ----
  const ctxG = await b.newContext({ viewport: PHONE });
  const g = await ctxG.newPage(); watch(g);
  await enter(g, `/?party=${code}`);
  await g.waitForSelector('[data-party-join]', { timeout: 20000 }).catch(() => bad('the join card did not open from the link'));
  await nick(g, 'Mia');
  await g.click('[data-party-join] button:has-text("Join")'); await gate(g);
  okIf(await waitFor(g, () => isLive(g)), 'guest joined');
  await closeCard(g); await openMenu(g);
  await g.click('[data-party-tab="code"]').catch(() => {}); await g.waitForTimeout(600);
  const gCode = ((await g.textContent('[data-party-code]').catch(() => '')) || '').replace(/[^A-Z0-9]/gi, '');
  okIf(gCode === code, 'guest Code tab shows the code');
  okIf(await g.isVisible('[data-party-share]'), 'guest has Share link / Copy link');
  okIf(!(await g.$('[data-party-new-code]')) && !(await g.$('[data-party-lock]')), 'guest has no New code / Close to new friends');
  okIf(/Only the host can make a new code/.test((await g.textContent('[data-party-host-only]').catch(() => '')) || ''), 'guest note: only the host can make a new code');
  okIf(/Share only with friends you know/.test((await g.textContent('[data-party-invite]')) || ''), 'guest keeps the safety line');
  await shot(g, 'guest-code-tab');
  // the host makes a new code: the guest's card and stored session follow
  await openMenu(a3); await a3.click('[data-party-tab="code"]').catch(() => {}); await a3.click('[data-party-new-code]'); await a3.waitForTimeout(2000);
  const code2 = ((await a3.textContent('[data-party-code]')) || '').replace(/[^A-Z0-9]/gi, '');
  okIf(code2.length === 6 && code2 !== code, 'host made a new code');
  okIf(await waitFor(g, async () => ((await g.textContent('[data-party-code]').catch(() => '')) || '').replace(/[^A-Z0-9]/gi, '') === code2, 10000), 'guest sees the NEW code');
  okIf(((await session(g)) || {}).code === code2, 'guest stored session follows the new code');
  await closeCard(a3);

  // ---- 4. a lapsed slot: Rejoin your party -> Join with the code, pre-filled ----
  const ctxL = await b.newContext({ viewport: PHONE });
  await ctxL.addInitScript(([k, c]) => { try { if (!sessionStorage.getItem('rejoin-seeded')) { sessionStorage.setItem('rejoin-seeded', '1'); localStorage.setItem(k, JSON.stringify({ code: c, resumeToken: 'AAAAAAAAAAAAAAAAAAAAAA', at: Date.now() })); } } catch { /* none */ } }, [KEY, code2]);
  const l = await ctxL.newPage(); watch(l);
  await enter(l);
  okIf(!(await isLive(l)), 'lapsed slot: not live (no nameless new slot)');
  okIf(!!(await session(l)), 'lapsed slot: the stored session is kept');
  await openMenu(l);
  okIf(await l.isVisible('[data-party-rejoin-btn]').catch(() => false), 'menu shows "Rejoin your party"');
  await shot(l, 'menu-rejoin-your-party');
  await l.click('[data-party-rejoin-btn]');
  await l.waitForSelector('[data-party-join]', { timeout: 15000 }).catch(() => bad('Rejoin did not fall back to Join with the code'));
  const boxes = await l.evaluate(() => Array.from(document.querySelectorAll('[data-party-join] input')).map((i) => i.value).join('')).catch(() => '');
  okIf(boxes.toUpperCase().includes(code2), 'Join with the code is pre-filled');
  okIf(/timed out/.test((await l.textContent('[data-party-join]')) || ''), 'with the "spot timed out" message');
  await shot(l, 'join-prefilled-after-lapse');
  await ctxL.close();

  // ---- 5. End party clears the stored session (host and guest) ----
  await openMenu(a3); await a3.click('[data-party-tab="party"]').catch(() => {}); await a3.waitForTimeout(400);
  await a3.click('[data-party-end]'); await a3.waitForTimeout(300); await a3.click('[data-party-end]');
  okIf(await waitFor(a3, async () => !(await session(a3)), 10000), 'host: session gone after End party');
  okIf(await waitFor(g, async () => !(await session(g)), 10000), 'guest: session gone after the party ended');

  const real = errs.filter((e) => !/ResizeObserver|AbortError|Lock broken/i.test(e));
  if (real.length) { console.log('page errors:', real.slice(0, 5)); fail++; }
  await b.close();
  console.log(fail ? `party-rejoin: ${fail} FAILED` : 'party-rejoin: all passed');
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
