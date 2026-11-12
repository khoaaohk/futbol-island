// Public island UI, headless (Agent C, Nov 11 2026; docs/multiplayer/CLIENT-HANDOFF.md, WORLD-HANDOFF.md). Never port 8092.
// Needs:  relay  MP_PORT=8792 MP_DEV=1 MP_WORLD_OPEN=1 MP_CONTROL_TOKEN=<16+> node multiplayer/dev-relay/server.mjs
//         bots   started by this script per profile (multiplayer/bots/bot.mjs runBots --world, 6 slow walkers; they end on their own)
//         app    NEXT_DIST_DIR=.next-agent-mpui NEXT_PUBLIC_MULTIPLAYER=1 NEXT_PUBLIC_PUBLIC_WORLD=1 NEXT_PUBLIC_MULTIPLAYER_URL=http://127.0.0.1:8792 npx next dev -p 8143
// Run:    node --experimental-websocket scripts/check-mp-public-browser.cjs --port=8143 --relay=http://127.0.0.1:8792 --token=<MP_CONTROL_TOKEN>
//         [--profile=phone|tall|desktop|new|existing|existing-desktop|off] (default: phone, tall, desktop, new, existing). --profile=off: against a
//         FLAG-OFF server (today's UI). Phase 2 (Nov 12 2026): the full runs are a player whose tour ran after public play arrived
//         (fi2-public-since-v1 'new': the first-time card); 'existing' is an island from before (the one-time hint + the live count).
// Screenshots (phone run): docs/qa/public-panel-phone.png, public-roster-report.png, public-first-card.png, public-lock-settings.png,
// public-arcade-chip.png. One headless Chrome at a time (--mute-audio); closes only its own browser.
const { chromium } = require('playwright');
const path = require('path');
const arg = (k, d) => { const a = process.argv.find((s) => s.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const port = arg('port'), relay = (arg('relay', '') || '').replace(/\/$/, ''), token = arg('token', process.env.MP_CONTROL_TOKEN || '');
if (!port || port === '8092') { console.error('give --port=<n> (never 8092, the owner\'s server)'); process.exit(2); }
const url = `http://localhost:${port}`, QA = path.join(__dirname, '../docs/qa');
const profiles = (arg('profile', 'phone,tall,desktop,new,existing')).split(',');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
const check = (name, ok, extra = '') => { results.push({ name, ok: !!ok }); console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${extra ? ' (' + extra + ')' : ''}`); };
async function control(on) {
  const r = await fetch(relay + '/control', { method: 'POST', headers: { Authorization: 'Bearer ' + token, 'content-type': 'application/json' }, body: JSON.stringify({ public: on }) });
  return r.ok ? r.json() : null;
}
async function gate(p) { // the grown-up multiplication
  await p.waitForSelector('[data-parent-gate-answer]', { timeout: 10000 });
  await p.waitForFunction(() => /times|×|x/.test(document.querySelector('[data-parent-gate] label')?.textContent || ''), null, { timeout: 8000 });
  const q = (await p.textContent('[data-parent-gate] label')).toLowerCase();
  const w = { two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12 };
  const mm = q.match(/(\w+) times (\w+)/), nn = q.match(/\d+/g);
  await p.fill('[data-parent-gate-answer]', String(mm ? (w[mm[1]] ?? +mm[1]) * (w[mm[2]] ?? +mm[2]) : +nn[0] * +nn[1]));
  await p.click('[data-parent-gate] button[type=submit]');
}
async function start(p) { // the title screen: save code once (a fresh profile), then Play
  await p.click('text=Get my save code', { timeout: 4000 }).catch(() => {}); await p.waitForTimeout(1500);
  await p.click('button:has-text("Get my code")', { timeout: 4000 }).catch(() => {}); await p.waitForTimeout(2500);
  await p.click('button:has-text("I saved it")', { timeout: 4000 }).catch(() => {}); await p.waitForTimeout(1500);
  await p.click('button:has-text("Play")', { timeout: 8000 }).catch(() => {});
  await p.waitForFunction(() => !!window.__fi2 && !!document.querySelector('[data-hud-triggers]'), null, { timeout: 120000 });
  await p.waitForTimeout(2500);
}
async function boot(b, vp, { returning = true, mobile = true, since = null } = {}) {
  const ctx = await b.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2 : 1 });
  await ctx.addInitScript(([ret, since]) => { try { if (ret && !sessionStorage.getItem('__c_boot')) { localStorage.setItem('fi2-welcome-v1', 'completed'); if (since) localStorage.setItem('fi2-public-since-v1', since); } sessionStorage.setItem('__c_boot', '1'); } catch { /* */ } window.__fi2WelcomeMs = 2500; }, [returning, since]);
  const p = await ctx.newPage();
  const errs = [], sockets = [];
  p.on('pageerror', (e) => errs.push(e.message.slice(0, 200)));
  p.on('console', (m) => { if (m.type() === 'error' && !/Download the React DevTools|favicon|ERR_CONNECTION|Failed to load resource/.test(m.text())) errs.push(m.text().slice(0, 200)); });
  p.on('websocket', (ws) => sockets.push(ws.url()));
  await p.goto(url + '/play'); await p.waitForTimeout(4000);
  await start(p);
  return { ctx, p, errs, sockets };
}
const tap = async (p) => { const vp = p.viewportSize(); if (vp.width > 900) { await p.keyboard.press('ArrowUp'); return; } await p.mouse.click(vp.width * 0.2, vp.height * 0.3); }; // a real first input (desktop: a key; a centre click opens the player's own wardrobe) // a real first input on the canvas
const worldOn = (p) => p.evaluate(() => !!document.querySelector('[data-public-count]'));
async function toIsland(p) { // stand near where the bots wander (x 100, z 50)
  await p.evaluate(() => { const f = window.__fi2; try { f.selectRide('walk'); } catch { /* */ } f.location.x = 100; f.location.z = 50; f.rooftop?.reset?.(100, 50); f.velocity.x = f.velocity.z = 0; });
}
async function openPanel(p) { await p.click('[data-party-open]'); await p.waitForSelector('[data-presence-panel]', { timeout: 8000 }); await p.waitForTimeout(500); }
async function closePanel(p) { await p.keyboard.press('Escape'); await p.waitForTimeout(600); }

async function fullRun(b, name, vp, shots) {
  // six fresh world bots per profile (multiplayer/bots/bot.mjs --world), slow walkers around (100, 50) so they stay near the player
  const { runBots } = await import('../multiplayer/bots/bot.mjs');
  const bots = runBots({ world: true, url: relay, n: 6, ms: 420000, spread: 240, speed: 0.25, devip: 'c' + Date.now().toString(36) }); void bots;
  await wait(3000);
  const { ctx, p, errs, sockets } = await boot(b, vp, { mobile: name !== 'desktop', since: 'new' });
  const before = sockets.filter((s) => /\/world\//.test(s)).length;
  check(`${name}: island loads, no world socket before the first input`, before === 0, `${before} sockets`);
  await toIsland(p); await tap(p);
  await p.waitForFunction(() => !!document.querySelector('[data-public-count]'), null, { timeout: 30000 }).catch(() => {});
  check(`${name}: connects lazily after the first input, badge shows a count`, await worldOn(p), await p.getAttribute('[data-party-open]', 'aria-label'));
  // first-time card (25 m): not stacked with Welcome back
  await p.waitForSelector('[data-public-first-card]', { timeout: 40000 }).catch(() => {});
  const card = await p.evaluate(() => ({ card: !!document.querySelector('[data-public-first-card]'), welcome: !!document.querySelector('[data-welcome-back], [data-welcome]') }));
  check(`${name}: first-time card appears, alone`, card.card && !card.welcome, JSON.stringify(card));
  if (!card.card) await p.screenshot({ path: path.join(require('os').tmpdir(), `mp-public-nocard-${vp.width}.png`) });
  if (shots && card.card) await p.screenshot({ path: `${QA}/public-first-card.png` });
  if (card.card && (shots || name === 'desktop')) await p.screenshot({ path: `${QA}/phase2-first-card-${name === 'desktop' ? 'desktop' : 'phone'}.png` });
  check(`${name}: no existing-player hint for a new player`, !(await p.$('[data-public-hint]')));
  await p.click('[data-public-first-ok]').catch(() => {}); await p.waitForTimeout(800);
  // panel
  await openPanel(p);
  const panel = await p.evaluate(() => ({ choices: [...document.querySelectorAll('[data-presence-choice]')].map((e) => e.getAttribute('data-presence-choice') + (e.getAttribute('aria-current') ? '*' : '')),
    names: [...document.querySelectorAll('[data-public-member] .' + 'x')].length, rows: [...document.querySelectorAll('[data-public-member]')].map((e) => e.textContent.replace(/HideReport$/, '')),
    party: !!document.querySelector('[data-presence-panel] :is([data-party-code],[data-party-invite],input,textarea,[data-name-lock],[data-party-end])') }));
  check(`${name}: panel shows three choices, public marked, no party things`, panel.choices.join() === 'solo,public*,friends' && !panel.party, panel.choices.join());
  check(`${name}: roster lists bots with generated names`, panel.rows.length > 0 && panel.rows.every((r) => /^[A-Z][a-z]+ [A-Z][a-z]+/.test(r)), panel.rows.slice(0, 3).join(', '));
  if (shots) await p.screenshot({ path: `${QA}/public-panel-phone.png` });
  // Hide one, then Report another
  const n0 = panel.rows.length;
  await p.click('[data-act="public-hide"]'); await p.waitForTimeout(500);
  const hid = await p.evaluate(() => ({ rows: document.querySelectorAll('[data-public-member]').length, hidden: document.querySelectorAll('[data-public-hidden] li').length }));
  check(`${name}: Hide removes a bot (listed under Hidden)`, hid.hidden === 1 && hid.rows <= n0, JSON.stringify(hid));
  if (hid.rows > 0) {
    await p.click('[data-act="public-report"]'); await p.waitForSelector('[data-report-sheet]');
    const noInput = await p.evaluate(() => !document.querySelector('[data-report-sheet] input, [data-report-sheet] textarea, [contenteditable]'));
    await p.click('[data-report-reason="following"]'); await p.waitForSelector('[data-report-done]');
    check(`${name}: Report hides and shows the thanks line (no typing)`, noInput && /Thanks for telling us/.test(await p.textContent('[data-report-done]')));
    if (shots) await p.screenshot({ path: `${QA}/public-roster-report.png` });
    await p.click('[data-report-ok]'); await p.waitForTimeout(400);
  }
  // switch Just me <-> With other players, no reload
  await p.evaluate(() => { window.__noReload = 1; });
  await p.click('[data-presence-choice="solo"]'); await p.waitForTimeout(2500);
  const solo = await p.evaluate(() => ({ same: window.__noReload === 1, pub: !!document.querySelector('[data-public-count]'), label: document.querySelector('[data-party-open]')?.getAttribute('aria-label') }));
  check(`${name}: Just me switches with no reload`, solo.same && !solo.pub, JSON.stringify(solo));
  await openPanel(p); await p.click('[data-presence-choice="public"]');
  await p.waitForFunction(() => !!document.querySelector('[data-public-count]'), null, { timeout: 20000 }).catch(() => {});
  check(`${name}: With other players switches back, no reload`, (await p.evaluate(() => window.__noReload === 1)) && await worldOn(p));
  if (!shots) { check(`${name}: no console errors`, errs.length === 0, errs.slice(0, 3).join(' | ')); await ctx.close(); return; }
  // grown-up lock: Friends only closes public and the panel explains why
  await p.click('button[aria-label="Settings"]'); await p.waitForSelector('[data-play-lock]', { state: 'attached', timeout: 10000 });
  await p.locator('[data-play-lock]').scrollIntoViewIfNeeded();
  await p.click('[data-play-lock-option="friends"]'); await gate(p); await p.waitForTimeout(1500);
  await p.locator('[data-play-lock]').scrollIntoViewIfNeeded();
  if (shots) await p.screenshot({ path: `${QA}/public-lock-settings.png` });
  const locked = await p.evaluate(() => document.querySelector('[data-play-lock-option="friends"]')?.getAttribute('aria-pressed'));
  await p.keyboard.press('Escape'); await p.waitForTimeout(800);
  await openPanel(p);
  const why = await p.evaluate(() => ({ pub: !!document.querySelector('[data-public-count]'), reason: document.querySelector('[data-presence-reason]')?.textContent, off: document.querySelector('[data-presence-choice="public"]')?.disabled }));
  check(`${name}: Friends only closes public and explains why`, locked === 'true' && !why.pub && /grown-up/i.test(why.reason || '') && why.off, JSON.stringify(why));
  await closePanel(p);
  await p.click('button[aria-label="Settings"]'); await p.waitForSelector('[data-play-lock]', { state: 'attached' }); await p.locator('[data-play-lock]').scrollIntoViewIfNeeded();
  await p.click('[data-play-lock-option="all"]'); await p.waitForTimeout(800); await p.keyboard.press('Escape'); await p.waitForTimeout(800);
  await tap(p); await p.waitForFunction(() => !!document.querySelector('[data-public-count]'), null, { timeout: 20000 }).catch(() => {});
  check(`${name}: back to Everyone reconnects`, await worldOn(p));
  // the Arcade: the room chip, never party controls
  await p.goto(url + '/arcade'); await p.waitForTimeout(12000);
  await p.waitForSelector('[data-room-public]', { timeout: 30000 }).catch(() => {});
  const room = await p.evaluate(() => ({ chip: document.querySelector('[data-room-public] [data-room-party-chip]')?.getAttribute('aria-label'), party: !!document.querySelector('[data-room-leave]') }));
  if (room.chip) { await p.click('[data-room-public] [data-room-party-chip]'); await p.waitForTimeout(500); }
  const roster = await p.evaluate(() => !!document.querySelector('[data-room-public-roster]') && !document.querySelector('[data-room-public-roster] [data-room-leave], [data-room-public-roster] [data-act="mute"]'));
  check(`${name}: Arcade shows the "N players here" chip and roster, no party controls`, !!room.chip && !room.party && roster, room.chip || 'no chip');
  if (shots) await p.screenshot({ path: `${QA}/public-arcade-chip.png` });
  await p.goto(url + '/play'); await p.waitForTimeout(3000); await start(p); await toIsland(p); await tap(p);
  await p.waitForFunction(() => !!document.querySelector('[data-public-count]'), null, { timeout: 30000 }).catch(() => {});
  const cardAgain = await p.evaluate(() => !!document.querySelector('[data-public-first-card]'));
  check(`${name}: first-time card never shows twice`, !cardAgain);
  // the owner closes public play: Just me, silently
  if (token) {
    const toasts = [];
    await p.exposeFunction('__toast', (t) => toasts.push(t)).catch(() => {});
    await p.evaluate(() => { new MutationObserver(() => { const t = document.querySelector('[data-party-toast]'); if (t) window.__toast(t.textContent); }).observe(document.body, { childList: true, subtree: true }); });
    const alerts0 = await p.evaluate(() => document.querySelectorAll('[role=alert]').length);
    await control(false); await p.waitForTimeout(6000);
    const closed = await p.evaluate((n) => ({ pub: !!document.querySelector('[data-public-count]'), alert: document.querySelectorAll('[role=alert]').length > n, alerts: [...document.querySelectorAll('[role=alert]')].map((e) => e.textContent.slice(0, 60)) }), alerts0);
    check(`${name}: closing public with /control drops to Just me silently`, !closed.pub && !closed.alert && toasts.length === 0, JSON.stringify({ ...closed, toasts }));
    await control(true);
  } else check(`${name}: /control close (no --token given)`, false, 'skipped');
  check(`${name}: no console errors`, errs.length === 0, errs.slice(0, 3).join(' | '));
  await ctx.close();
}

async function newPlayer(b) {
  const { ctx, p, errs, sockets } = await boot(b, { width: 390, height: 664 }, { returning: false });
  await tap(p); await p.waitForTimeout(8000);
  const s = await p.evaluate(() => ({ label: document.querySelector('[data-party-open]')?.getAttribute('aria-label') ?? null, pub: !!document.querySelector('[data-public-count]'), card: !!document.querySelector('[data-public-first-card]') }));
  const ws = sockets.filter((u) => /\/world/.test(u)).length;
  check('new player: no presence UI change and no connection before the tour ends', ws === 0 && !s.pub && !s.card && (s.label === null || s.label === 'Play with friends'), JSON.stringify({ ...s, ws }));
  check('new player: no console errors', errs.length === 0, errs.slice(0, 3).join(' | '));
  await ctx.close();
}
// Phase 2: an island from before public play (the tour already done on the first flag-on visit): the one-time hint beside the
// people button, never the first-time card; the live count under the button; OK closes it without opening the panel; never again.
async function existingRun(b, name, vp, mobile) {
  const { runBots } = await import('../multiplayer/bots/bot.mjs');
  runBots({ world: true, url: relay, n: 8, ms: 240000, spread: 120, speed: 0.25, devip: 'e' + Date.now().toString(36) });
  await wait(3000);
  const { ctx, p, errs } = await boot(b, vp, { mobile });
  check(`${name}: classified as an existing island`, (await p.evaluate(() => localStorage.getItem('fi2-public-since-v1'))) === 'old');
  await toIsland(p); await tap(p);
  await p.waitForFunction(() => !!document.querySelector('[data-public-count]'), null, { timeout: 30000 }).catch(() => {});
  await p.waitForSelector('[data-public-hint]', { timeout: 20000 }).catch(() => {});
  const h = await p.evaluate(() => ({ hint: document.querySelector('[data-public-hint] p')?.textContent ?? null, ok: !!document.querySelector('[data-public-hint-ok]'),
    badge: document.querySelector('[data-public-badge]')?.textContent ?? null, n: +(document.querySelector('[data-public-count]')?.getAttribute('data-public-count') ?? -1),
    rect: (() => { const r = document.querySelector('[data-public-hint]')?.getBoundingClientRect(); return r ? [r.left, r.right, innerWidth] : null; })() }));
  check(`${name}: one-time hint explains others and Just me`, !!h.hint && /Just me/.test(h.hint) && h.ok && !!h.rect && h.rect[0] >= 0 && h.rect[1] <= h.rect[2], JSON.stringify(h));
  check(`${name}: live count under the people button`, h.n > 0 ? h.badge === (h.n > 24 ? 'lots on now' : `${h.n} on now`) : h.badge === null, `${h.badge} / ${h.n}`);
  await p.screenshot({ path: `${QA}/phase2-existing-hint-${mobile ? 'phone' : 'desktop'}.png` });
  await p.click('[data-public-hint-ok]').catch(() => {}); await p.waitForTimeout(600);
  const after = await p.evaluate(() => ({ hint: !!document.querySelector('[data-public-hint]'), panel: !!document.querySelector('[data-presence-panel]') }));
  check(`${name}: OK closes the hint, panel stays shut`, !after.hint && !after.panel, JSON.stringify(after));
  await p.waitForTimeout(25000);
  check(`${name}: never the first-time card`, !(await p.$('[data-public-first-card]')));
  await p.goto(url + '/play'); await p.waitForTimeout(3000); await start(p); await toIsland(p); await tap(p);
  await p.waitForFunction(() => !!document.querySelector('[data-public-count]'), null, { timeout: 30000 }).catch(() => {}); await p.waitForTimeout(4000);
  check(`${name}: the hint never shows twice`, !(await p.$('[data-public-hint]')));
  check(`${name}: no console errors`, errs.length === 0, errs.slice(0, 3).join(' | '));
  await ctx.close();
}
async function flagOff(b) {
  const { ctx, p, errs } = await boot(b, { width: 390, height: 664 });
  await tap(p); await p.waitForTimeout(4000);
  const label = await p.getAttribute('[data-party-open]', 'aria-label');
  await p.click('[data-party-open]'); await p.waitForTimeout(1000);
  const menu = await p.evaluate(() => ({ menu: !!document.querySelector('[data-party-menu]'), panel: !!document.querySelector('[data-presence-panel]') }));
  await p.keyboard.press('Escape'); await p.waitForTimeout(600);
  await p.click('button[aria-label="Settings"]'); await p.waitForTimeout(1200);
  const toggle = await p.evaluate(() => ({ old: !!document.querySelector('[data-party-allowed]'), lock: !!document.querySelector('[data-play-lock]') }));
  check('flag off: today\'s button, menu and Allowed / Off toggle', label === 'Play with friends' && menu.menu && !menu.panel && toggle.old && !toggle.lock, JSON.stringify({ label, ...menu, ...toggle }));
  check('flag off: no console errors', errs.length === 0, errs.slice(0, 3).join(' | '));
  await ctx.close();
}

(async () => {
  const b = await chromium.launch({ channel: 'chrome', args: ['--mute-audio'] });
  try {
    if (token && profiles.some((x) => x !== 'off')) await control(true);
    for (const pr of profiles) {
      if (pr === 'phone') await fullRun(b, 'phone 390x664', { width: 390, height: 664 }, true);
      else if (pr === 'tall') await fullRun(b, 'phone 390x844', { width: 390, height: 844 }, false);
      else if (pr === 'desktop') await fullRun(b, 'desktop', { width: 1280, height: 800 }, false);
      else if (pr === 'new') await newPlayer(b);
      else if (pr === 'existing') await existingRun(b, 'existing phone', { width: 390, height: 664 }, true);
      else if (pr === 'existing-desktop') await existingRun(b, 'existing desktop', { width: 1280, height: 800 }, false);
      else if (pr === 'off') await flagOff(b);
    }
  } catch (e) { check('run', false, e.message.slice(0, 300)); }
  finally { await b.close(); }
  const bad = results.filter((r) => !r.ok).length;
  console.log(`check-mp-public-browser: ${results.length - bad}/${results.length} ok`);
  process.exit(bad ? 1 : 0);
})();
