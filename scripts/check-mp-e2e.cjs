// End-to-end multiplayer check (Oct 22 2026, owner: "add testing the new multiplayer end to end as another job"): the owner's TWO-DEVICE
// TEST (docs/deploy-and-test-checklist-oct22.md section 3) as real headless browsers. Device A (host, desktop 1280x800) and device B
// (guest, phone 390x844, touch) are two SEPARATE browser contexts (separate storage) against a dev relay; C (a second guest), D (a
// fourth device) and a link-joiner are short-lived extra contexts; bots (multiplayer/bots/bot.mjs) fill the party for the heat step.
// Steps (one pass/fail line each, a screenshot per step in OUT):
//   1 host start (name filter, gate, the one 'Your party' card, HUD badge)   2 guest join (code + ?party= link), toast, list row, rings, labels
//   3 emotes (75 degree cone, wave / high five / dance / show off / pass it / juggle with me, moving emotes, framing)
//   4 jetpack (ring tilt, flying emote set only with a friend flying)       5 busy (Settings: force field + line, ball bounce, emote ignored)
//   6 rooms (Konbini, Museum, Arcade + a game, Kit Shop through the doors) 7 recovery (reload, new context, second tab, guest code, device C)
//   8 host controls (New code, Close, Reset name, Remove C + 60 s block, End party)  9 island keep-ups (count, wall kick, hold for higher)
//   10 heat (bots on the island and in a room: frame time, draw calls, caps 5/5/3/1/0)  11 privacy sweep (storage + analytics beats, every step)
// Needs: a dev relay   MP_PORT=<relay port> MP_DEV=1 node multiplayer/dev-relay/server.mjs
//        a production build of the game with NEXT_PUBLIC_MULTIPLAYER=1 NEXT_PUBLIC_MULTIPLAYER_URL=<relay url> FI_VISITS_LOCAL=1
//        (FI_VISITS_LOCAL lets the visit tracker run on localhost, so step 11 can read its beats), served by `next start -p <app port>`.
// Env:   APP_URL    the game (default http://localhost:8701)
//        RELAY_URL  the dev relay (default http://127.0.0.1:8702)
//        OUT        screenshot folder (default /tmp/mp-e2e)
//        PW_CHANNEL chrome when Playwright's bundled browser is missing
//        STEPS      optional subset, e.g. "1,2,3" (1 and 2 always run: they make the party)
//        BOTS       bots for the heat step (default 8, 6-10)
//        SKIP_KICK_WAIT=1  do not wait out the 60 s rejoin block after Remove (step 8 then only checks the block)
// Run:   PW_CHANNEL=chrome node --experimental-websocket scripts/check-mp-e2e.cjs
// Prints one line per check: "PASS|FAIL <step>.<n> <what> <detail>", then a table, and exits 1 on any FAIL.
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { loadTs } = require('../multiplayer/dev-relay/loadTs.cjs');
const P = loadTs(path.join(__dirname, '../multiplayer/protocol/index.ts'));

const APP = (process.env.APP_URL || 'http://localhost:8701').replace(/\/$/, '');
const RELAY = (process.env.RELAY_URL || 'http://127.0.0.1:8702').replace(/\/$/, '');
const OUT = process.env.OUT || '/tmp/mp-e2e';
const STEPS = new Set((process.env.STEPS || '1,2,3,4,5,6,7,8,9,10,11').split(',').map((s) => +s.trim()).concat([1, 2]));
const NBOTS = Math.max(6, Math.min(10, +(process.env.BOTS || 8)));
const KEY = 'fi2-party-session-v1';
const DESK = { width: 1280, height: 800 }, PHONE = { width: 390, height: 844 };
const NAMES = { A: 'Zorabel', B: 'Mabelle', C: 'Quincey', D: 'Odalys', L: 'Linnea' }; // distinctive, so a storage / beat sweep cannot false-match
fs.mkdirSync(OUT, { recursive: true });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const results = []; // [step, check, ok, detail]
let curStep = 0, nChecks = 0;
function rec(ok, what, detail = '') {
  nChecks++; results.push([curStep, what, !!ok, detail]);
  console.log(`${ok ? 'PASS' : 'FAIL'} ${curStep}.${results.filter((r) => r[0] === curStep).length} ${what}${detail ? '  ' + detail : ''}`);
  return !!ok;
}
const note = (m) => console.log(`     ${m}`);

// ---------- browser + device helpers ----------
let browser;
const errs = [];
const beats = []; // analytics bodies sent to /api/visit (any device)
const devices = {};
async function device(name, { phone = false, storageState } = {}) {
  const ctx = await browser.newContext(phone ? { viewport: PHONE, hasTouch: true, isMobile: true, deviceScaleFactor: 2, storageState } : { viewport: DESK, storageState });
  // The visit tracker skips automated browsers: present as a normal one so step 11 can read what it would send.
  await ctx.addInitScript(() => { try { Object.defineProperty(Navigator.prototype, 'webdriver', { get: () => false }); } catch { /* none */ } });
  await ctx.route('**/api/visit', async (r) => { try { beats.push({ dev: name, body: r.request().postData() || '' }); } catch { /* none */ } await r.fulfill({ status: 204, body: '' }); });
  const p = await ctx.newPage();
  watch(p, name);
  const d = { name, ctx, p, phone };
  devices[name] = d;
  return d;
}
function watch(p, name) { p.on('pageerror', (e) => errs.push(`${name}: ${e.message}`)); }
async function shot(p, file) { try { await p.screenshot({ path: `${OUT}/${file}.png` }); } catch (e) { note('screenshot failed ' + file + ' ' + e.message.slice(0, 80)); } }
const waitFor = async (p, fn, ms = 30000, every = 400) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { try { if (await fn()) return true; } catch { /* page busy */ } await p.waitForTimeout(every); } return false; };

// New player: save code, Play, skip the walkthrough. Returning: Play if asked.
async function enter(p, pathQ = '/', fresh = true, reload = false) {
  if (reload) await p.reload({ waitUntil: 'domcontentloaded', timeout: 120000 }); else await p.goto(APP + pathQ, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.waitForTimeout(6000);
  if (fresh) { await p.click('text=Get my save code', { timeout: 20000 }).catch(() => {}); await p.waitForTimeout(2000); }
  await p.click('button:has-text("Play")', { timeout: 8000 }).catch(() => {});
  await p.waitForFunction(() => !!window.__fi2?.scene, null, { timeout: 60000 }).catch(() => {});
  await p.waitForTimeout(9000);
  await p.click('button:has-text("Skip")', { timeout: 8000 }).catch(() => {}); await p.waitForTimeout(1200);
  await clearOverlays(p);
  await walkMode(p);
}
// On foot (desktop starts on the jetpack: leaving it waits for the landing; the pending ride then applies).
async function walkMode(p) {
  for (let i = 0; i < 12; i++) {
    const r = await p.evaluate(() => { const f = window.__fi2; if (!f) return 'none'; if (f.rideRef?.current !== 'walk') f.selectRide('walk'); return f.rideRef?.current; }).catch(() => 'none');
    if (r === 'walk' || r === 'none') break; await p.waitForTimeout(800);
  }
}
// A map ("Pick your patch") or another full-screen card left open by the first-run flow: close it.
async function clearOverlays(p) {
  for (let i = 0; i < 3; i++) {
    const open = await p.evaluate(() => /Pick your patch/.test(document.body.innerText)).catch(() => false);
    if (!open) return;
    await p.keyboard.press('Escape').catch(() => {}); await p.waitForTimeout(500);
    await p.evaluate(() => { const d = [...document.querySelectorAll('button')].find((x) => x.getBoundingClientRect().width > 0 && /^Done$/.test(x.innerText.trim())); d?.click(); }).catch(() => {}); await p.waitForTimeout(800);
  }
}
async function gate(p, optional = false) {
  const shown = await p.waitForSelector('[data-parent-gate-answer]', { timeout: optional ? 4000 : 15000 }).then(() => true).catch((e) => { if (!optional) throw e; return false; });
  if (!shown) return; // a rejoin soon after a grown-up answered skips the gate (mp:gate_skip)
  await p.waitForTimeout(400);
  const q = (await p.textContent('[data-parent-gate]')).toLowerCase();
  const w = { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12 };
  const mm = q.match(/(\w+) times (\w+)/); const nn = q.match(/\d+/g);
  await p.fill('[data-parent-gate-answer]', String(mm ? (w[mm[1]] ?? +mm[1]) * (w[mm[2]] ?? +mm[2]) : nn ? +nn[0] * +nn[1] : 0));
  await p.click('[data-parent-gate] button[type=submit]');
}
async function nick(p, name) {
  const sel = 'input[aria-label="First name"]';
  await p.waitForSelector(sel, { timeout: 15000 });
  for (let i = 0; i < 4 && (await p.evaluate((s) => document.querySelector(s).value, sel)) !== name; i++) { await p.fill(sel, name); await p.waitForTimeout(500); }
}
const openMenu = async (p) => { await clearOverlays(p); await p.evaluate(() => document.querySelector('[data-party-open]')?.click()); await p.waitForTimeout(900); };
const closeCard = async (p) => { await p.click('[data-party-sheet] button:has-text("Done")', { timeout: 1500 }).catch(() => {}); await p.keyboard.press('Escape').catch(() => {}); await p.waitForTimeout(600); };
const isLive = (p) => p.evaluate(() => document.querySelector('[data-party-open]')?.getAttribute('data-party-live') === 'true').catch(() => false);
const session = (p) => p.evaluate((k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } }, KEY).catch(() => null);
const codeOf = async (p) => ((await p.textContent('[data-party-code]', { timeout: 5000 }).catch(() => '')) || '').replace(/[^A-Z0-9]/gi, '');
const toastOf = (p) => p.evaluate(() => [...document.querySelectorAll('[data-party-toast],[data-room-party-note]')].map((e) => e.textContent).join(' | ')).catch(() => '');
async function joinByCode(p, code, name) {
  await openMenu(p); await nick(p, name);
  await p.click('button:has-text("Join with a code")');
  await p.waitForSelector('[data-party-join]', { timeout: 10000 });
  for (let i = 0; i < code.length; i++) { await p.locator('[data-party-join] [data-code-box]').nth(i).fill(code[i]); await p.waitForTimeout(60); } // fill, never page-level keys ('m' opens the map)
  await nick(p, name);
  await p.click('[data-party-join] button:has-text("Join")');
}
async function listTab(p) { await openMenu(p); await p.click('#party-tab-party', { timeout: 4000 }).catch(() => {}); await p.waitForTimeout(500); }
const listRows = (p) => p.evaluate(() => [...document.querySelectorAll('[data-party-sheet] li')].map((li) => ({ label: li.getAttribute('aria-label') || '', text: li.innerText.replace(/\s+/g, ' '), dot: !!li.querySelector('[class*=dot]') && getComputedStyle(li.querySelector('[class*=dot]')).backgroundColor }))).catch(() => []);

// Put the player on a spot facing yaw (radians, forward = (sin yaw, cos yaw)).
const place = async (p, x, z, yaw, ride = 'walk') => { if (ride === 'walk') await walkMode(p); return placeNow(p, x, z, yaw, ride); };
const placeNow = (p, x, z, yaw, ride) => p.evaluate(([x, z, yaw, ride]) => { const f = window.__fi2; if (ride && f.rideRef?.current !== ride) f.selectRide(ride); if (f.teleport) f.teleport(x, z, yaw); else { f.location.x = x; f.location.z = z; f.rooftop.reset(x, z); f.player.root.rotation.y = yaw; } f.velocity.x = f.velocity.z = 0; }, [x, z, yaw, ride]);
// Townspeople answer emotes too (within 9 m in front): hide them while checking the friend cone, so only the friend counts.
const npcs = (p, on) => p.evaluate((on) => { const f = window.__fi2; window.__e2eNpcOff = !on; if (!window.__e2eNpcHook) { window.__e2eNpcHook = 1; const tick = () => { if (window.__e2eNpcOff) { if (f.islandNpcs?.root) f.islandNpcs.root.visible = false; if (f.volleyballGame?.root) f.volleyballGame.root.visible = false; } requestAnimationFrame(tick); }; tick(); } if (on) { if (f.islandNpcs?.root) f.islandNpcs.root.visible = true; if (f.volleyballGame?.root) f.volleyballGame.root.visible = true; } }, on);
const turn = (p, yaw) => p.evaluate((yaw) => { const f = window.__fi2; f.teleport ? f.teleport(f.location.x, f.location.z, yaw) : (f.player.root.rotation.y = yaw); }, yaw);
const meAt = (p) => p.evaluate(() => { const f = window.__fi2; return { x: f.location.x, z: f.location.z, y: f.player.root.position.y, yaw: f.player.root.rotation.y }; });
// The friend layer on this page: ring instances (scale, tilt), cream ring, visible names, emote bubbles, force fields.
const probe = (p, sceneExpr = 'window.__fi2.scene') => p.evaluate((ex) => {
  const sc = eval(ex); const r = { rings: -1, ringScales: [], ringTilts: [], partyRingR: 0, cream: null, creamR: 0, names: 0, bubbles: [], fields: 0, layers: 0 };
  if (!sc) return r;
  const vis = (o) => { for (let q = o; q; q = q.parent) if (!q.visible) return false; return true; };
  sc.traverse((o) => {
    if (o.name === 'remote-avatars') r.layers++;
    if (o.name === 'remote-avatar-rings') {
      r.rings = o.count; if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere(); const R = o.geometry.boundingSphere.radius; r.partyRingR = R;
      const m = o.matrixWorld.clone(); for (let i = 0; i < o.count; i++) { o.getMatrixAt(i, m); const e = m.elements; const sx = Math.hypot(e[0], e[1], e[2]), sy = Math.hypot(e[4], e[5], e[6]); r.ringScales.push(+(sx * R).toFixed(3)); r.ringTilts.push(+Math.acos(Math.max(-1, Math.min(1, e[5] / (sy || 1)))).toFixed(3)); }
    }
    if (o.name === 'player-foot-ring') { r.cream = vis(o); if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere(); const e = o.matrixWorld.elements; r.creamR = +(o.geometry.boundingSphere.radius * Math.hypot(e[0], e[1], e[2])).toFixed(3); }
    if (o.name === 'remote-name' && vis(o)) r.names++;
    if (o.name === 'remote-emote' && vis(o)) r.bubbles.push(o.userData.icon);
    if (o.name === 'remote-force-fields' && vis(o)) r.fields = o.count;
    if (o.name === 'remote-status' && vis(o)) r.status = (r.status || 0) + 1;
    if (o.name === 'remote-avatars-batch') { let mx = 0; o.traverse((q) => { if (q.isInstancedMesh && q.visible) mx = Math.max(mx, q.count); }); r.bodies = mx; }
  });
  return r;
}, sceneExpr).catch((e) => ({ error: e.message }));

// ---------- privacy sweep (step 11, run after every step) ----------
const privacy = { checks: 0, bad: [] };
async function sweep(where) {
  if (!STEPS.has(11)) return;
  const secrets = new Set(Object.values(NAMES).map((n) => n.toLowerCase()));
  for (const d of Object.values(devices)) {
    for (const pg of d.ctx.pages()) {
      const st = await pg.evaluate(() => { const o = {}; for (const s of [localStorage, sessionStorage]) for (let i = 0; i < s.length; i++) { const k = s.key(i); o[(s === localStorage ? 'L:' : 'S:') + k] = s.getItem(k); } return o; }).catch(() => null);
      if (!st) continue;
      privacy.checks++;
      for (const [k, v] of Object.entries(st)) {
        const low = (k + '=' + v).toLowerCase();
        for (const s of secrets) if (low.includes(s)) privacy.bad.push(`${where}/${d.name}: first name in ${k}`);
        if (/party|mp-|multiplayer/i.test(k) && k !== 'L:' + KEY && !/^S:fi2-party-(tab|owner|seeded)/.test(k) && !(k === 'L:fi2-mp-firsts-v1' && /^[ph]{0,2}$/.test(v || '')) /* fi2-mp-firsts-v1: two letters ('p' played, 'h' hosted), lib/analytics/partyFirsts.ts, privacy policy 11 */) privacy.extraKeys = [...new Set([...(privacy.extraKeys || []), k])];
      }
    }
  }
  // Analytics beats: no code, name or token in any body.
  const tokens = new Set();
  for (const d of Object.values(devices)) for (const pg of d.ctx.pages()) { const s = await session(pg); if (s) { for (const v of [s.code, s.resumeToken, s.hostKey]) if (v) tokens.add(String(v)); } }
  for (const c of seenCodes) tokens.add(c);
  for (const b of beats) {
    const low = b.body.toLowerCase();
    for (const s of secrets) if (low.includes(s)) privacy.bad.push(`${where}: first name in a beat from ${b.dev}`);
    for (const t of tokens) if (t.length >= 6 && b.body.includes(t)) privacy.bad.push(`${where}: code/token ${t.slice(0, 3)}… in a beat from ${b.dev}`);
  }
}
const seenCodes = new Set();

// ---------- bots ----------
const bots = [];
function bot(code, n, extra = []) {
  const c = spawn('node', ['--experimental-websocket', path.join(__dirname, '../multiplayer/bots/bot.mjs'), '--url', RELAY, '--code', code, '--n', String(n), '--ms', '600000', ...extra], { stdio: 'ignore' });
  bots.push(c); return c;
}

// ---------- the steps ----------
const st = { code: '', A: null, B: null };
const SPOT = { x: 23, z: -62 }; // the open plaza (check-mp-presence.cjs)

async function step1() {
  curStep = 1;
  const A = st.A = await device('A');
  const p = A.p;
  await enter(p);
  await openMenu(p);
  const sel = 'input[aria-label="First name"]';
  await p.waitForSelector(sel, { timeout: 15000 });
  const startDisabled = () => p.evaluate(() => [...document.querySelectorAll('[data-party-menu] button')].find((x) => /Start a party/.test(x.innerText))?.disabled);
  await p.fill(sel, '');
  const ride0 = await p.evaluate(() => window.__fi2?.rideRef?.current);
  rec(await startDisabled(), 'Start a party disabled with no name');
  await p.click(sel); await p.keyboard.type('7 3', { delay: 40 }); await p.keyboard.insertText('\u{1F600}'); await p.waitForTimeout(300);
  const v1 = await p.inputValue(sel);
  rec(v1 === '' && (await startDisabled()), 'digits / space / emoji dropped, button still disabled', JSON.stringify(v1));
  await p.keyboard.type('Z'); await p.waitForTimeout(200);
  rec(await startDisabled(), 'one letter: still disabled (2 to 12 letters)');
  await p.keyboard.type('o1ra b'); await p.keyboard.insertText('\u{1F44B}'); await p.keyboard.type('el m'); await p.keyboard.press('Backspace'); await p.waitForTimeout(300);
  const v2 = await p.inputValue(sel);
  const after = await p.evaluate(() => ({ ride: window.__fi2?.rideRef?.current, map: /Pick your patch/.test(document.body.innerText) }));
  rec(after.ride === ride0 && !after.map, 'typing a name (with R, E, M ... keys) drives no game hotkey', JSON.stringify({ before: ride0, ...after }));
  rec(v2 === NAMES.A && !(await startDisabled()), 'mixed input filtered to letters, button enabled', JSON.stringify(v2));
  await shot(p, 's1-a-name');
  await p.click('text=Start a party'); await gate(p);
  const made = await p.waitForSelector('[data-party-code]', { timeout: 20000 }).then(() => true).catch(() => false);
  await p.waitForTimeout(1500);
  st.code = await codeOf(p); seenCodes.add(st.code);
  rec(made && st.code.length === 6, 'gate answered: lands on the party card with a code', st.code);
  const dialogs = await p.evaluate(() => [...document.querySelectorAll('[role=dialog]')].map((d) => d.getAttribute('aria-label')));
  rec(dialogs.filter((d) => d === 'Your party').length === 1 && !dialogs.includes('Play with friends'), 'exactly one "Your party" card', JSON.stringify(dialogs));
  const codeTab = await p.evaluate(() => document.querySelector('#party-panel-code')?.innerText.replace(/\s+/g, ' ') || '');
  rec(/Works for/.test(codeTab), 'Code tab: "Works for ..."', (codeTab.match(/Works for[^.]*\./) || [''])[0]);
  rec(await p.isVisible('[data-party-share]') && /(Share|Copy) link/.test(await p.textContent('[data-party-share]')), 'Code tab: Share / Copy link');
  rec(await p.isVisible('[data-party-new-code]') && await p.isVisible('[data-party-lock]') && /Close to new friends/.test(await p.textContent('[data-party-lock]')), 'Code tab: New code + Close to new friends');
  const box = () => p.evaluate(() => { const r = document.querySelector('[data-party-sheet]').getBoundingClientRect(); return [r.width, r.height].map((v) => Math.round(v)).join('x'); });
  const bCode = await box();
  await shot(p, 's1-a-code-tab');
  await p.click('#party-tab-party'); await p.waitForTimeout(600);
  const bList = await box();
  const count = await p.getAttribute('[data-party-count]', 'aria-label').catch(() => '');
  const countText = await p.textContent('[data-party-count]').catch(() => '');
  rec(/1 of 20/.test(count || '') , 'List tab header "1 of 20"', `${count} / "${countText.trim()}"`);
  rec(await p.isVisible('[data-party-end]') && /End party/.test(await p.textContent('[data-party-end]')), 'List tab: small red "End party" link', await p.evaluate(() => getComputedStyle(document.querySelector('[data-party-end]')).color));
  rec(bCode === bList, 'card the same size on both tabs', `${bCode} vs ${bList}`);
  await shot(p, 's1-a-list-tab');
  await closeCard(p);
  const badge = await p.evaluate(() => { const b = document.querySelector('[data-party-open]'); return { live: b?.getAttribute('data-party-live'), label: b?.getAttribute('aria-label'), badge: !!document.querySelector('[data-party-badge]') }; });
  rec(badge.live === 'true', 'HUD party button live (badge)', JSON.stringify(badge));
  await shot(p, 's1-a-hud');
  await sweep('step1');
}

async function step2() {
  curStep = 2;
  const B = st.B = await device('B', { phone: true });
  const a = st.A.p, b = B.p;
  await enter(b);
  await joinByCode(b, st.code, NAMES.B);
  // A watches for the join toast while B answers the gate.
  const toasts = [];
  const poll = (async () => { for (let i = 0; i < 60; i++) { const t = await toastOf(a); if (t) toasts.push(t); if (/joined/.test(t)) break; await a.waitForTimeout(250); } })();
  await gate(b);
  rec(await waitFor(b, () => isLive(b)), 'B joined with the code');
  await poll;
  rec(toasts.some((t) => t.includes(NAMES.B) && /joined/.test(t)), 'A sees "<name> joined"', JSON.stringify([...new Set(toasts)].slice(0, 3)));
  await shot(a, 's2-a-join-toast');
  await listTab(a);
  const rows = await listRows(a);
  const rowB = rows.find((r) => r.text.includes(NAMES.B));
  rec(!!rowB && rowB.dot && rowB.dot !== 'rgba(0, 0, 0, 0)', 'A list: B row with a colour dot + name', rowB ? `${rowB.text.slice(0, 40)} ${rowB.dot}` : JSON.stringify(rows.map((r) => r.text.slice(0, 30))));
  rec(/2 of 20/.test(await a.getAttribute('[data-party-count]', 'aria-label').catch(() => '')), 'A list header "2 of 20"');
  await shot(a, 's2-a-list');
  await closeCard(a); await closeCard(b);
  // Side by side on the plaza, facing each other 2.5 m apart.
  await place(a, SPOT.x, SPOT.z, 0); await place(b, SPOT.x, SPOT.z + 2.5, Math.PI);
  for (const p of [a, b]) { await p.keyboard.down('ArrowUp'); await p.waitForTimeout(120); await p.keyboard.up('ArrowUp'); } // a step: the follow camera settles on the new spot
  if (process.env.DEBUG) for (let i = 0; i < 12; i++) { await a.waitForTimeout(1000); note(`t+${i + 1}s A rings ${(await probe(a)).rings} B rings ${(await probe(b)).rings} Bpos ${JSON.stringify(await meAt(b))}`); }
  await waitFor(a, async () => { const x = await probe(a), y = await probe(b); return x.rings >= 2 && y.rings >= 2 && x.names >= 1 && y.names >= 1; }, 18000, 500); // a teleport reaches friends with the Warp retry (<= 5.5 s)
  const pa = await probe(a), pb = await probe(b);
  if (process.env.DEBUG) note('A ride ' + await a.evaluate(() => window.__fi2.rideRef?.current + ' / ' + typeof window.__fi2.rideRef));
  note('A layer ' + JSON.stringify(pa)); note('B layer ' + JSON.stringify(pb));
  note('A at ' + JSON.stringify(await meAt(a)) + ' B at ' + JSON.stringify(await meAt(b)));
  if (process.env.DEBUG) for (const p of [a, b]) note('labels ' + JSON.stringify(await p.evaluate(() => { const out = []; window.__fi2.scene.traverse((o) => { if (o.name === 'remote-name') { const ch = []; for (let q = o; q; q = q.parent) ch.push((q.name || q.type) + ':' + q.visible); out.push({ pos: [o.position.x, o.position.y, o.position.z].map((v) => +v.toFixed(1)), op: o.material.opacity, ch }); } }); return { out, rs: window.__fi2.renderStats }; })));
  for (const [n, pr] of [['A', pa], ['B', pb]]) {
    rec(pr.rings === 2, `${n}: two party rings (mine + friend's), one each`, `rings=${pr.rings}`);
    rec(pr.cream === false, `${n}: the island cream ring hidden`, `cream visible=${pr.cream}`);
    const minS = Math.min(...pr.ringScales);
    rec(pr.creamR > 0 && Math.abs(minS - pr.creamR) / pr.creamR < 0.2, `${n}: party ring the same size as the island ring`, `party ${pr.ringScales.join('/')} vs cream ${pr.creamR}`);
    rec(pr.names >= 1, `${n}: friend's name label shown`, `labels=${pr.names}`);
  }
  await shot(a, 's2-a-rings'); await shot(b, 's2-b-rings');
  // Second run: a device joins from the ?party= link, then leaves.
  const L = await device('L', { phone: true });
  await enter(L.p, `/?party=${st.code}`);
  const card = await L.p.waitForSelector('[data-party-join]', { timeout: 20000 }).then(() => true).catch(() => false);
  const pre = await L.p.evaluate(() => Array.from(document.querySelectorAll('[data-party-join] input')).map((i) => i.value).join('')).catch(() => '');
  rec(card && pre.toUpperCase().includes(st.code), 'the ?party= link opens Join with the code filled in', pre);
  await nick(L.p, NAMES.L); await L.p.click('[data-party-join] button:has-text("Join")'); await gate(L.p);
  rec(await waitFor(L.p, () => isLive(L.p)), 'link joiner is in the party');
  await shot(L.p, 's2-link-join');
  await listTab(L.p); await L.p.click('button:has-text("Leave party")').catch(() => {});
  let lNote = ''; await waitFor(L.p, async () => { lNote = await toastOf(L.p); return /left|ended/.test(lNote); }, 6000, 200); await L.p.waitForTimeout(800);
  rec(!(await isLive(L.p)) && !(await session(L.p)) && /You left the party/.test(lNote), 'link joiner taps Leave party: "You left the party", session cleared', JSON.stringify(lNote));
  await sweep('step2');
  await L.ctx.close(); delete devices.L;
}

// Wait for an emote bubble with `icon` on page `p`.
async function seesBubble(p, icon, ms = 4000) { let last = null; const ok = await waitFor(p, async () => { last = await probe(p); return icon == null ? (last.bubbles || []).length > 0 : (last.bubbles || []).includes(icon); }, ms, 150); return { ok, last }; }
const emoteBtn = (p) => p.evaluate(() => { const b = document.querySelector('[data-emote-btn]'); return b ? { hidden: b.hasAttribute('data-hidden'), ctx: b.getAttribute('data-emote-ctx') } : null; });
async function pick(p, label) {
  const st0 = await emoteBtn(p); if (!st0 || st0.hidden) return 'button hidden ' + JSON.stringify(st0);
  await p.click('[data-emote-btn]', { timeout: 5000 }); await p.waitForSelector('[data-emote-wheel]', { timeout: 3000 });
  const btn = p.locator(`[data-emote-wheel] button[aria-label="${label}"]`);
  if (!(await btn.count())) { const labels = await p.evaluate(() => [...document.querySelectorAll('[data-emote-wheel] .emote-wheel-btn')].map((x) => x.getAttribute('aria-label'))); await p.keyboard.press('Escape'); return labels; }
  await btn.scrollIntoViewIfNeeded().catch(() => {}); await btn.click(); return true;
}
// The player on screen during an emote: projected inside the viewport for every sample.
async function inFrame(p, ms = 2500) {
  let worst = null;
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    const r = await p.evaluate(() => { const f = window.__fi2, cam = f.camera, o = f.player.root; const v = o.position.clone(); v.y += 1.0; v.project(cam); const h = o.position.clone(); h.y += 1.9; h.project(cam); return [v.x, v.y, h.x, h.y]; });
    const m = Math.max(...r.map(Math.abs)); if (!worst || m > worst) worst = m;
    await p.waitForTimeout(200);
  }
  return worst;
}

async function step3() {
  curStep = 3;
  const a = st.A.p, b = st.B.p;
  await npcs(a, false); await npcs(b, false);
  await place(a, SPOT.x, SPOT.z, 0); await place(b, SPOT.x, SPOT.z + 2.5, Math.PI); await a.waitForTimeout(2000);
  let ea = await emoteBtn(a), eb = await emoteBtn(b);
  rec(ea && !ea.hidden && eb && !eb.hidden, 'facing each other: Emote button shown on both', JSON.stringify({ ea, eb }));
  await shot(b, 's3-b-facing');
  await turn(a, Math.PI); await a.waitForTimeout(1200); ea = await emoteBtn(a);
  rec(ea && ea.hidden, 'A turned away (180 degrees): Emote button hidden', JSON.stringify(ea));
  await turn(a, Math.PI / 2 - 0.1); await a.waitForTimeout(1200); const side = await emoteBtn(a); // ~84 degrees off: outside the 75 degree cone
  rec(side && side.hidden, 'friend about 84 degrees to the side: hidden', JSON.stringify(side));
  await turn(a, 1.0); await a.waitForTimeout(1200); const in57 = await emoteBtn(a);
  rec(in57 && !in57.hidden, 'friend about 57 degrees to the side: shown', JSON.stringify(in57));
  await turn(a, 0); await a.waitForTimeout(800);
  await shot(a, 's3-a-turned-back');
  const E = P.Emote;
  const list = [['Wave', E.Wave], ['High five', E.HighFive], ['Dance', E.Dance], ['Show off', E.ShowOff], ['Pass it', E.PassBall], ['Juggle with me', E.JuggleWithMe]];
  let worst = 0;
  for (const [label, id] of list) {
    for (const [from, to, fn] of [[a, b, 'A->B'], [b, a, 'B->A']]) {
      await place(a, SPOT.x, SPOT.z, 0); await place(b, SPOT.x, SPOT.z + 2.5, Math.PI); await a.waitForTimeout(1500);
      const r = await pick(from, label);
      if (r !== true) { rec(false, `${fn} ${label}: in the wheel`, 'wheel: ' + JSON.stringify(r)); continue; }
      const frameP = inFrame(from, 2200);
      const s = await seesBubble(to, id);
      const w = await frameP; worst = Math.max(worst, w);
      rec(s.ok, `${fn} ${label}: the friend sees the matching bubble`, s.ok ? '' : 'bubbles ' + JSON.stringify(s.last?.bubbles));
      if (label === 'High five' && fn === 'A->B') { await shot(b, 's3-b-sees-high-five'); }
      await from.waitForTimeout(2500);
    }
  }
  rec(worst <= 1.0, 'no emote leaves the frame (player stays inside the view)', `max |ndc| ${worst.toFixed(2)}`);
  // Moving emotes: A walks toward B (ArrowUp held); the wheel is the "move" set and B sees it.
  const fwd = await a.evaluate(() => { const f = window.__fi2, c = f.camera.position, o = f.player.root.position; const dx = o.x - c.x, dz = o.z - c.z, d = Math.hypot(dx, dz); return { x: dx / d, z: dz / d }; });
  const yawF = Math.atan2(fwd.x, fwd.z);
  await place(a, SPOT.x, SPOT.z, yawF); await place(b, SPOT.x + fwd.x * 12, SPOT.z + fwd.z * 12, yawF + Math.PI);
  await a.waitForTimeout(6500); // B's teleport reaches A with the Warp retry
  await a.keyboard.down('ArrowUp'); await a.waitForTimeout(900);
  const mv = await emoteBtn(a);
  const r = await pick(a, 'Wave on the move');
  const sm = r === true ? await seesBubble(b, 0, 4000) : { ok: false };
  await a.keyboard.up('ArrowUp');
  rec(mv && mv.ctx === 'move' && r === true, 'walking: the Emote wheel is the moving set', JSON.stringify({ mv, r }));
  rec(sm.ok, 'moving emote reaches the friend (wave on the move bubble)', sm.ok ? '' : JSON.stringify(sm.last?.bubbles));
  await shot(a, 's3-a-moving-emote');
  await npcs(a, true); await npcs(b, true);
  await sweep('step3');
}

async function step4() {
  curStep = 4;
  const a = st.A.p, b = st.B.p;
  const fwd = await a.evaluate(() => { const f = window.__fi2, c = f.camera.position, o = f.player.root.position; const dx = o.x - c.x, dz = o.z - c.z, d = Math.hypot(dx, dz); return { x: dx / d, z: dz / d }; });
  const yawF = Math.atan2(fwd.x, fwd.z);
  // (a) A takes off with B on the ground next to it: A has no flying emotes (nobody flying near).
  await place(a, SPOT.x, SPOT.z, yawF); await place(b, SPOT.x + fwd.x * 4, SPOT.z + fwd.z * 4, yawF + Math.PI);
  await a.waitForTimeout(6500);
  await a.evaluate(() => window.__fi2.selectRide('jetpack')); await a.waitForTimeout(2500);
  const ownA = await emoteBtn(a);
  rec(ownA && ownA.hidden && ownA.ctx === 'fly', 'A flying, B on the ground: no flying emotes (button hidden)', JSON.stringify(ownA));
  await shot(a, 's4-a-flying-alone');
  // (b) B takes off 25 m ahead; A flies forward past B: B sees A's ring lean with the flight. (A ground player's camera never
  // frames a friend at jetpack height, ~28 m: the camera sits ~23 m up looking down, so the check is done from the air.)
  await place(b, SPOT.x + fwd.x * 25, SPOT.z + fwd.z * 25, yawF, null);
  await b.evaluate(() => window.__fi2.selectRide('jetpack')); await b.waitForTimeout(6500);
  await a.keyboard.down('ArrowUp');
  let maxTilt = 0, lastB = null;
  if (process.env.DEBUG) for (let i = 0; i < 8; i++) { await b.waitForTimeout(400); note('fly ' + JSON.stringify({ A: await meAt(a), B: await b.evaluate(() => { const f = window.__fi2, c = f.camera, d = c.getWorldDirection(c.position.clone()); return { me: [f.location.x, f.player.root.position.y, f.location.z].map((v) => +v.toFixed(1)), cam: [c.position.x, c.position.y, c.position.z].map((v) => +v.toFixed(1)), dir: [d.x, d.y, d.z].map((v) => +v.toFixed(2)), ride: f.rideRef.current }; }), pr: await probe(b) })); }
  await waitFor(b, async () => { lastB = await probe(b); maxTilt = Math.max(maxTilt, ...(lastB.ringTilts || [0])); return maxTilt > 0.15; }, 6000, 120);
  await shot(b, 's4-b-sees-a-flying');
  await a.keyboard.up('ArrowUp');
  rec(maxTilt > 0.15, "B (flying) sees A's ring tilt while A flies forward", `max tilt ${maxTilt.toFixed(2)} rad, rings seen ${lastB?.rings}`);
  // (c) both flying, side by side: A gets the flying set; a Wing wave reaches B.
  const at = await meAt(a);
  await placeNow(b, at.x + fwd.x * 6, at.z + fwd.z * 6, yawF + Math.PI, null);
  let both = null;
  await waitFor(a, async () => { both = await emoteBtn(a); return both && !both.hidden && both.ctx === 'fly'; }, 9000, 250);
  rec(both && !both.hidden && both.ctx === 'fly', 'both flying near: A gets the flying emote set', JSON.stringify(both));
  if (both && !both.hidden) {
    const r = await pick(a, 'Wing wave'); const s = r === true ? await seesBubble(b, null, 4000) : { ok: false };
    rec(r === true && s.ok, 'Wing wave from A reaches B', JSON.stringify(r === true ? s.last?.bubbles : r));
    await shot(a, 's4-a-fly-set');
  }
  for (const p of [a, b]) await walkMode(p);
  await a.waitForTimeout(3000);
  await sweep('step4');
}

async function step5() {
  curStep = 5;
  const a = st.A.p, b = st.B.p;
  await place(a, SPOT.x, SPOT.z, 0); await place(b, SPOT.x, SPOT.z + 2.6, Math.PI); await a.waitForTimeout(2500);
  const sBtn = await a.$('button[aria-label="Settings"]');
  await sBtn?.click(); await a.waitForTimeout(7000); // the island loop sleeps: the beat tick sends Busy
  let pr = null;
  const field = await waitFor(b, async () => { pr = await probe(b); return pr.fields > 0; }, 10000, 300);
  rec(field, 'A in Settings: B sees the green force field', JSON.stringify({ fields: pr?.fields }));
  await listTab(b);
  const line = (await listRows(b)).find((r) => r.text.includes(NAMES.A));
  rec(!!line && /Settings/.test(line.text + line.label), 'B list: A "In Settings"', line ? line.text.slice(0, 60) : '');
  await closeCard(b);
  const eb = await emoteBtn(b);
  rec(eb && eb.hidden, "emotes to a busy friend ignored (B's Emote button off: A in the field)", JSON.stringify(eb));
  await shot(b, 's5-b-force-field');
  // B kicks the ball at A's field.
  const aSpot = { x: SPOT.x, z: SPOT.z };
  await b.keyboard.down('Space'); await b.waitForTimeout(120); await b.keyboard.up('Space');
  const track = [];
  for (let i = 0; i < 16; i++) { await b.waitForTimeout(90); track.push(await b.evaluate(() => { const o = window.__fi2.ball.position; return [o.x, o.y, o.z]; })); if (i === 5) await shot(b, 's5-b-ball-bounce'); }
  const ds = track.map((q) => Math.hypot(q[0] - aSpot.x, q[2] - aSpot.z));
  const minD = Math.min(...ds), iMin = ds.indexOf(minD), after = ds.slice(iMin);
  rec(minD > 0.5 && Math.max(...after) > minD + 0.3, 'ball kicked into the field bounces off', `closest ${minD.toFixed(2)} m, then ${Math.max(...after).toFixed(2)} m`);
  await a.keyboard.press('Escape'); await a.waitForTimeout(800);
  await a.evaluate(() => { const d = [...document.querySelectorAll('button')].find((x) => x.getBoundingClientRect().width > 0 && /^Done$/.test(x.innerText.trim())); d?.click(); }); await a.waitForTimeout(3000);
  const gone = await waitFor(b, async () => (await probe(b)).fields === 0, 10000, 400);
  rec(gone, 'A back from Settings: the field goes');
  await sweep('step5');
}

const ROOMS = [
  { name: 'konbini', label: 'Konbini', enter: '[data-konbini-enter]', path: /\/konbini/, ready: () => window.__konbini?.state?.party, scene: 'window.__konbini.threeScene', state: 'window.__konbini.state', done: '[data-konbini-done]', line: /Konbini/, hint: 'in the Konbini' },
  { name: 'museum', label: 'Museum', enter: '[data-museum-enter]', path: /\/museum/, ready: () => window.__museum?.state?.party, scene: 'window.__museum.threeScene', state: 'window.__museum.state', done: '[data-museum-done]', line: /museum/i, hint: 'in the Museum' },
  { name: 'arcade', label: 'Arcade', enter: '[data-arcade-enter]', path: /\/arcade/, ready: () => window.__arcadeRoom?.state?.party, scene: 'window.__arcadeRoom.threeScene', state: 'window.__arcadeRoom.state', done: '[data-navigation]', line: /arcade/i, hint: 'in the Arcade' },
  { name: 'shop', label: 'Kit Shop', enter: '[data-shop-enter]', path: /\/shop/, ready: () => window.__shop?.scene?.state?.party, scene: 'window.__shop.scene.threeScene', state: 'window.__shop.scene.state', done: '[data-shop-done]', line: /Kit Shop/, hint: 'in the Kit Shop' },
];
async function intoRoom(p, r) {
  await p.evaluate((s) => document.querySelector(s)?.click(), r.enter);
  const ok = await p.waitForURL(r.path, { timeout: 90000, waitUntil: 'commit' }).then(() => true).catch(() => false);
  await p.waitForFunction(r.ready, null, { timeout: 60000 }).catch(() => {});
  await p.waitForSelector('[data-room-party-chip]', { timeout: 30000 }).catch(() => {});
  return ok;
}
async function backToIsland(p, r) {
  await p.click(r.done, { timeout: 8000 }).catch(() => {});
  await p.waitForURL((u) => !r.path.test(u.pathname), { timeout: 60000 }).catch(() => {});
  await p.waitForFunction(() => !!window.__fi2?.scene, null, { timeout: 60000 }).catch(() => {});
  await p.waitForTimeout(6000); await p.click('button:has-text("Skip")', { timeout: 4000 }).catch(() => {});
  await p.evaluate(() => window.__fi2?.selectRide?.('walk')).catch(() => {}); await p.waitForTimeout(1500);
}
const doorHints = (p) => p.evaluate(() => { const out = []; window.__fi2?.scene?.traverse((o) => { if (o.name === 'party-door-hint' && o.userData.text) out.push(o.userData.text); }); return out; }).catch(() => []);
const friendsDrawn = (p, r) => p.evaluate((ex) => (eval(ex).party?.friends ?? []).filter((f) => !f.gone && f.fade > .5).length, r.state).catch(() => -1);

async function step6() {
  curStep = 6;
  const a = st.A.p, b = st.B.p;
  const s0 = await session(a), b0 = await session(b);
  for (const r of ROOMS) {
    await place(b, SPOT.x, SPOT.z, 0);
    const entered = await intoRoom(a, r);
    rec(entered, `${r.label}: A walks in through the door`);
    // B on the island: door hint + list line.
    let hints = [];
    await waitFor(b, async () => { hints = await doorHints(b); return hints.some((h) => h.includes(r.hint)); }, 15000, 500);
    rec(hints.some((h) => h === '1 ' + r.hint), `${r.label}: island door hint "1 ${r.hint}"`, JSON.stringify(hints));
    await listTab(b);
    const line = (await listRows(b)).find((x) => x.text.includes(NAMES.A));
    rec(!!line && r.line.test(line.text), `${r.label}: B's list says A is "In the ${r.label}"`, line ? line.text.slice(0, 50) : '');
    await closeCard(b);
    rec(await friendsDrawn(a, r) === 0, `${r.label}: A inside sees nobody (B is on the island)`);
    // B follows.
    await intoRoom(b, r);
    const both = await waitFor(a, async () => (await friendsDrawn(a, r)) === 1 && (await friendsDrawn(b, r)) === 1, 20000, 500);
    rec(both, `${r.label}: both inside see each other`);
    const sa = await session(a), sb = await session(b);
    rec(sa && s0 && sa.resumeToken === s0.resumeToken && sa.you === s0.you && sb && sb.resumeToken === b0.resumeToken, `${r.label}: party intact (same slots)`);
    const chip = await a.evaluate(() => { const c = document.querySelector('[data-room-party-chip]'); return c ? { here: c.getAttribute('data-here'), text: c.innerText.replace(/\s+/g, ' ') } : null; });
    await a.click('[data-room-party-chip]'); await a.waitForTimeout(500);
    const roster = await a.evaluate(() => ({ leave: !!document.querySelector('[data-room-roster] [data-room-leave]'), host: !!document.querySelector('[data-room-roster] [data-party-new-code],[data-room-roster] [data-party-end],[data-room-roster] [data-party-lock]'), btns: [...document.querySelectorAll('[data-room-roster] button')].map((x) => x.innerText.trim()).filter(Boolean) }));
    await a.click('[data-room-party-chip]'); await a.waitForTimeout(300);
    rec(chip && chip.here === '1' && /1 here/.test(chip.text) && roster.leave && !roster.host, `${r.label}: chip "1 here", Leave only`, JSON.stringify({ chip, roster }));
    await shot(b, `s6-b-${r.name}`);
    if (r.name === 'konbini') await konbiniChecks(a, b);
    if (r.name === 'arcade') {
      await a.click('button[aria-controls="arcade-coins-panel"]').catch(() => {}); await a.waitForTimeout(600);
      await a.click('button[aria-label="Play Pass Puzzles"]', { timeout: 5000 }).catch(() => {});
      const playing = await a.waitForSelector('[data-arcade-room=playing]', { timeout: 20000 }).then(() => true).catch(() => false);
      rec(playing, 'Arcade: A starts a game');
      let fld = null, fr = null;
      await waitFor(b, async () => { fld = await probe(b, r.scene); return fld.fields > 0 && fld.status > 0; }, 12000, 400);
      fr = await b.evaluate((ex) => JSON.stringify((eval(ex).party?.friends ?? []).map((f) => ({ ...f, rig: undefined })).slice(0, 1)).slice(0, 400), r.state).catch((e) => e.message);
      rec(fld.fields > 0 && fld.status > 0, 'Arcade: B sees A in a green field with a "Playing" line at the cabinet', JSON.stringify({ fields: fld.fields, status: fld.status, friend: fr }));
      await shot(b, 's6-b-arcade-a-playing');
      let hub = false;
      for (let i = 0; i < 4 && !hub; i++) { await a.keyboard.press('Escape'); await a.waitForTimeout(1500); hub = await a.evaluate(() => !!document.querySelector('[data-arcade-room=room]')); }
      if (!hub) { await shot(a, 's6-a-arcade-stuck'); note('arcade buttons: ' + JSON.stringify(await a.evaluate(() => [...document.querySelectorAll('button')].filter((x) => x.getBoundingClientRect().width > 0).map((x) => x.getAttribute('aria-label') || x.innerText.slice(0, 20)).slice(0, 15)))); }
      const still = await waitFor(a, async () => (await friendsDrawn(a, r)) === 1, 15000);
      rec(hub && still, 'Arcade: A back at the hub, B still there');
    }
    await backToIsland(a, r); await backToIsland(b, r);
    const sa2 = await session(a);
    rec(sa2 && sa2.resumeToken === s0.resumeToken && (await isLive(a)) && (await isLive(b)), `${r.label}: back on the island, party intact`);
  }
  await sweep('step6');
}
async function konbiniChecks(a, b) {
  const m = await b.evaluate(() => {
    const R = (s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), op: getComputedStyle(e).opacity }; };
    return { keep: R('[data-konbini-action="keepups"]'), shoot: R('[data-konbini-action="shoot"]'), emote: R('[data-room-emote-dock]'), near: document.querySelector('[data-room-emote-dock]')?.getAttribute('data-emote-near'),
      chip: R('[data-room-party-chip]'), wallet: R('[data-konbini-wallet]'), done: R('[data-konbini-done]'), vw: innerWidth };
  });
  note('konbini layout ' + JSON.stringify(m));
  rec(m.keep && m.shoot && m.keep.y + m.keep.h <= m.shoot.y + 1, 'Konbini: Keep-ups above Kick');
  rec(m.keep && m.emote && Math.abs(m.keep.w - m.emote.w) <= 1 && Math.abs(m.keep.h - m.emote.h) <= 1, 'Konbini: Emote button the same size as Keep-ups', `keep ${m.keep?.w}x${m.keep?.h} emote ${m.emote?.w}x${m.emote?.h}`);
  rec(m.near === '1', 'Konbini: Emote button shown near a friend', `near=${m.near}`);
  const c = (q) => q.x + q.w / 2;
  rec(m.chip && m.wallet && m.done && c(m.chip) < c(m.wallet) && c(m.wallet) < c(m.done) && Math.abs(c(m.wallet) - m.vw / 2) < m.vw * 0.12, 'Konbini header: chip left, coins centred, Done right', `chip ${c(m.chip || { x: 0, w: 0 })} coins ${c(m.wallet || { x: 0, w: 0 })} done ${c(m.done || { x: 0, w: 0 })} of ${m.vw}`);
  await shot(b, 's6-b-konbini-layout');
  // No friend in the room any more (A walks out): B's Emote button fades out (the cashier never counts).
  await backToIsland(a, ROOMS[0]);
  let far = null;
  await waitFor(b, async () => { far = await b.evaluate(() => { const d = document.querySelector('[data-room-emote-dock]'); return d ? d.getAttribute('data-emote-near') + '/' + getComputedStyle(d).opacity : 'none'; }); return /^0\//.test(far) || far === 'none'; }, 10000, 400);
  rec(/^0\//.test(far) || far === 'none', 'Konbini: Emote button hidden with no friend near (A left)', far);
  await shot(b, 's6-b-konbini-alone');
  await intoRoom(a, ROOMS[0]); // back in for the walk out together
}

async function step7() {
  curStep = 7;
  let a = st.A.p; const b = st.B.p;
  const s0 = await session(a);
  // Reload on the island.
  await enter(a, '/', true, true); // this local build has no save service: the title may ask for a code again
  rec(await waitFor(a, () => isLive(a), 40000), 'A reload on the island: party resumes by itself');
  const s1 = await session(a);
  rec(s1 && s1.resumeToken === s0.resumeToken, 'same slot after the reload');
  // Reload inside a room.
  const r = ROOMS[0];
  await intoRoom(a, r);
  await a.reload({ waitUntil: 'domcontentloaded' });
  const roomOk = await a.waitForFunction(r.ready, null, { timeout: 60000 }).then(() => true).catch(() => false);
  await a.waitForSelector('[data-room-party-chip]', { timeout: 30000 }).catch(() => {});
  rec(roomOk && (await session(a))?.resumeToken === s0.resumeToken && await a.isVisible('[data-room-party-chip]'), 'A reload inside the Konbini: party resumes');
  await shot(a, 's7-a-reload-konbini');
  await backToIsland(a, r);
  // Close A's page; a new context with A's storage.
  const state = await st.A.ctx.storageState();
  await st.A.ctx.close();
  const A2 = st.A = await device('A', { storageState: state });
  a = A2.p;
  await enter(a, '/'); // this local build has no save service: the title may ask for a code again (the party session is separate)
  rec(await waitFor(a, () => isLive(a), 40000), 'A closed + new context with its storage: rejoined by itself');
  const s2 = await session(a);
  await openMenu(a); await a.click('[data-party-tab="code"]').catch(() => {}); await a.waitForTimeout(400);
  rec(s2 && s2.resumeToken === s0.resumeToken && s2.hostKey && await a.isVisible('[data-party-new-code]') && (await codeOf(a)) === st.code, 'A is still the host and sees the code', await codeOf(a));
  await shot(a, 's7-a-rejoined-host');
  await closeCard(a);
  // A second tab for A.
  const a3 = await A2.ctx.newPage(); watch(a3, 'A-tab2');
  await enter(a3, '/');
  await openMenu(a3);
  const elsewhere = await a3.textContent('[data-party-elsewhere]').catch(() => '');
  rec(/open in another tab/.test(elsewhere || '') && !(await isLive(a3)), 'second tab: "Your party is open in another tab"', JSON.stringify(elsewhere));
  await shot(a3, 's7-a-second-tab');
  await a3.click('[data-party-use-here]').catch(() => {});
  const moved = await waitFor(a3, () => isLive(a3), 20000) && await waitFor(a, async () => !(await isLive(a)), 15000);
  await a.bringToFront(); await openMenu(a);
  const movedText = await a.textContent('[data-party-elsewhere]').catch(() => '');
  rec(moved && /moved to another tab/.test(movedText || ''), '"Use it here" takes over; the old tab says it moved', JSON.stringify(movedText));
  await shot(a, 's7-a-old-tab-moved');
  await a.close(); st.A.p = a3; A2.p = a3; a = a3; await a3.bringToFront(); await a3.waitForTimeout(1000);
  await closeCard(a3);
  // B (guest) sees the code + Share link, no host buttons.
  await openMenu(b); await b.click('[data-party-tab="code"]').catch(() => {}); await b.waitForTimeout(500);
  const gCode = await codeOf(b);
  rec(gCode === st.code && await b.isVisible('[data-party-share]') && !(await b.$('[data-party-new-code]')) && !(await b.$('[data-party-lock]')), 'guest B: code + Share link, no New code / Close', gCode);
  await shot(b, 's7-b-guest-code');
  await closeCard(b);
  // Device C joins with the code B reads out.
  const C = await device('C', { phone: true });
  await enter(C.p);
  await joinByCode(C.p, gCode, NAMES.C); await gate(C.p);
  rec(await waitFor(C.p, () => isLive(C.p)), 'device C joins with the code from B');
  await listTab(a); const rows = await listRows(a);
  rec(rows.some((x) => x.text.includes(NAMES.C)) && /3 of 20/.test(await a.getAttribute('[data-party-count]', 'aria-label').catch(() => '')), 'A list: 3 of 20 with C');
  await shot(a, 's7-a-list-with-c');
  await closeCard(a);
  await sweep('step7');
}

async function step8() {
  curStep = 8;
  const a = st.A.p, b = st.B.p, c = devices.C?.p;
  const old = st.code;
  await openMenu(a); await a.click('[data-party-tab="code"]').catch(() => {}); await a.click('[data-party-new-code]'); await a.waitForTimeout(2000);
  const nc = await codeOf(a); seenCodes.add(nc);
  rec(nc.length === 6 && nc !== old, 'New code made', `${old} -> ${nc}`);
  await closeCard(a);
  st.code = nc;
  const info = await (await fetch(`${RELAY}/party/${old}`)).json().catch(() => null);
  const D = await device('D', { phone: true });
  await enter(D.p);
  await joinByCode(D.p, old, NAMES.D);
  await D.p.waitForTimeout(2500);
  const dMsg = await D.p.textContent('[data-party-join]').catch(() => '');
  const dGate = await D.p.$('[data-parent-gate-answer]');
  if (dGate) { await gate(D.p); await D.p.waitForTimeout(2500); }
  rec(!(await isLive(D.p)), 'the old code stops working', JSON.stringify({ relay: info, msg: (await D.p.textContent('[role=status]').catch(() => '') || dMsg || '').slice(0, 80) }));
  await shot(D.p, 's8-d-old-code');
  rec((await isLive(b)) && c && (await isLive(c)), 'B and C stay in the party');
  await openMenu(b); await b.click('[data-party-tab="code"]').catch(() => {}); await b.waitForTimeout(500);
  rec((await codeOf(b)) === nc && (await session(b))?.code === nc, "guest B's code updates (card + stored session)");
  await closeCard(b);
  // Close to new friends: a fourth device cannot join.
  await openMenu(a); await a.click('[data-party-tab="code"]').catch(() => {}); await a.click('[data-party-lock]'); await a.waitForTimeout(1000);
  rec(await a.isVisible('[data-party-closed]'), 'Close to new friends: "Closed to new friends" badge');
  await shot(a, 's8-a-closed');
  await closeCard(a);
  await enter(D.p, '/');
  await joinByCode(D.p, nc, NAMES.D); await D.p.waitForTimeout(1500);
  if (await D.p.$('[data-parent-gate-answer]')) { await gate(D.p); await D.p.waitForTimeout(2500); }
  const closedMsg = await D.p.evaluate(() => [...document.querySelectorAll('[data-party-join] [role=status],[data-party-toast]')].map((e) => e.textContent).join(' | ')).catch(() => '');
  rec(!(await isLive(D.p)) && /closed/i.test(closedMsg), 'a fourth device cannot join: "closed"', JSON.stringify(closedMsg));
  await shot(D.p, 's8-d-closed');
  await D.ctx.close(); delete devices.D;
  await openMenu(a); await a.click('[data-party-tab="code"]').catch(() => {}); await a.click('[data-party-lock]'); await a.waitForTimeout(600); await closeCard(a); // open again
  // Reset name (B).
  await listTab(a);
  const reset = await a.$(`[data-party-sheet] li:has-text("${NAMES.B}") [data-reset-name]`);
  const resetLabel = reset ? await reset.getAttribute('aria-label') : null;
  if (reset) { await reset.click(); await a.waitForTimeout(1500); }
  const rowsAfter = await listRows(a);
  rec(!!reset && !rowsAfter.some((x) => x.text.includes(NAMES.B)), 'Reset name: B shown by a colour name, not the typed name', JSON.stringify({ resetLabel, rows: rowsAfter.map((x) => x.text.slice(0, 24)) }));
  await shot(a, 's8-a-reset-name');
  // Remove C.
  const rm = await a.$(`[data-party-sheet] button[aria-label^="Remove ${NAMES.C}"]`);
  await rm?.click(); await a.waitForTimeout(800);
  const prompt = await a.isVisible('[data-party-kick-prompt]').catch(() => false);
  let cNote = '';
  await waitFor(c, async () => { cNote = await toastOf(c); return /You left the party/.test(cNote); }, 10000, 250);
  rec(!!rm && /You left the party/.test(cNote) && !(await isLive(c)), 'Remove C: C sees "You left the party"', JSON.stringify({ cNote, prompt }));
  await shot(c, 's8-c-removed');
  await a.click('[data-party-kick-prompt] button:has-text("Not now")').catch(() => {}); await closeCard(a);
  rec(!(await session(c)), "C's stored session cleared");
  const t0 = Date.now();
  await joinByCode(c, nc, NAMES.C); await c.waitForTimeout(1200);
  if (await c.$('[data-parent-gate-answer]')) { await gate(c); }
  await c.waitForTimeout(4000);
  const blockMsg = await c.evaluate(() => [...document.querySelectorAll('[data-party-join] [role=status],[data-party-toast]')].map((e) => e.textContent).join(' | ')).catch(() => '');
  rec(!(await isLive(c)), 'C cannot rejoin right away', JSON.stringify(blockMsg));
  await shot(c, 's8-c-blocked');
  if (!process.env.SKIP_KICK_WAIT) {
    await c.keyboard.press('Escape').catch(() => {});
    const left = 62000 - (Date.now() - t0); if (left > 0) await c.waitForTimeout(left);
    await enter(c, '/');
    await joinByCode(c, nc, NAMES.C); await c.waitForTimeout(1200); if (await c.$('[data-parent-gate-answer]')) await gate(c);
    rec(await waitFor(c, () => isLive(c), 15000), 'after 60 s C can join again');
  }
  // End party for everyone.
  const live = Object.values(devices).filter((d) => d.name !== 'A');
  await listTab(a); await a.click('[data-party-end]'); await a.waitForTimeout(300); await a.click('[data-party-end]');
  const notes = {};
  await Promise.all(live.map(async (d) => { await waitFor(d.p, async () => { notes[d.name] = await toastOf(d.p); return /party ended/.test(notes[d.name]); }, 10000, 250); }));
  rec(live.every((d) => /The party ended/.test(notes[d.name] || '')), 'End party: every guest gets "The party ended"', JSON.stringify(notes));
  await shot(b, 's8-b-ended');
  await a.waitForTimeout(2000);
  for (const d of Object.values(devices)) {
    const pr = await probe(d.p);
    rec(!(await session(d.p)) && !(await isLive(d.p)), `${d.name}: stored session cleared, party off`);
    rec(pr.rings === 0 && pr.cream === true, `${d.name}: party rings gone, the island cream ring back`, JSON.stringify({ rings: pr.rings, cream: pr.cream }));
  }
  await shot(a, 's8-a-after-end');
  await sweep('step8');
}

async function step9() {
  curStep = 9;
  const a = st.A.p;
  await place(a, SPOT.x, SPOT.z, 0); await a.waitForTimeout(800);
  const st0 = () => a.evaluate(() => { const w = window.__fi2.walkBall.state; return { mode: w.mode, phase: w.jugglePhase, streak: w.streak, y: w.y, counted: w.counted, wallPhase: w.wallPhase, lift: w.keepLift }; });
  // Tap J as the ball comes down.
  async function run(n, holdMs = 0) {
    await a.keyboard.press('j'); await a.waitForTimeout(250); let best = 0, maxY = 0, lift = 1; let last = -1;
    for (let i = 0; i < 400 && best < n; i++) {
      const s = await st0(); best = Math.max(best, s.streak); maxY = Math.max(maxY, s.y);
      if (!s.counted && i > 8) break;
      lift = Math.max(lift, s.lift);
      if (holdMs && s.mode === 'juggle' && s.phase > 0.05 && s.phase < 0.3 && last !== s.streak) { last = s.streak; await a.keyboard.down('j'); await a.waitForTimeout(holdMs); await a.keyboard.up('j'); } // held through the window: a higher touch
      else if (!holdMs && s.mode === 'juggle' && s.phase > 0.55 && s.phase < 0.85 && last !== s.streak) { last = s.streak; await a.keyboard.press('j'); }
      if (s.mode === 'wall-juggle' && (s.wallPhase === 'returning') && last !== s.streak) { last = s.streak; await a.keyboard.press('j'); }
      await a.waitForTimeout(25);
    }
    return { best, maxY: +maxY.toFixed(2), lift: +lift.toFixed(2) };
  }
  const r1 = await run(4);
  const pill = await a.evaluate(() => { const e = document.querySelector('[data-island-keepups]'); return e ? { n: e.getAttribute('data-island-keepups'), text: e.innerText.replace(/\s+/g, ' ') } : null; });
  rec(r1.best >= 3 && pill && +pill.n >= 2 && /Keep-?ups/i.test(pill.text), 'keep-ups count on the island pill', JSON.stringify({ r1, pill }));
  await shot(a, 's9-a-keepups');
  await a.waitForTimeout(3500);
  // Hold for higher: one held touch, compare peak height with taps.
  const tap = await run(4); await a.waitForTimeout(3500); const held = await run(4, 650);
  rec(held.lift >= 1.4 && tap.lift <= 1.05 && held.maxY > tap.maxY, 'holding the button kicks higher', JSON.stringify({ tap, held }));
  await a.waitForTimeout(3500);
  // Wall kick: stand 3 m in front of a real wall (the game's own wall list) facing it; the counted run turns into wall kicks.
  const wall = await a.evaluate(() => { const W = window.__fi2.world?.walls || []; const inside = (x, z) => W.some((w) => Math.abs(x - w.x) <= w.w / 2 + 0.8 && Math.abs(z - w.z) <= w.d / 2 + 0.8);
    const c = W.filter((w) => w.floor <= 0.3 && w.top >= 3 && w.w >= 4).sort((p, q) => Math.hypot(p.x - 23, p.z + 62) - Math.hypot(q.x - 23, q.z + 62));
    for (const w of c.slice(0, 80)) { const zS = w.z - w.d / 2 - 3, zN = w.z + w.d / 2 + 3; if (!inside(w.x, zS)) return { x: w.x, z: zS, yaw: 0, w }; if (!inside(w.x, zN)) return { x: w.x, z: zN, yaw: Math.PI, w }; }
    return null; });
  if (wall) {
    await place(a, wall.x, wall.z, wall.yaw); await a.waitForTimeout(1500);
    let modes = new Set(), best = 0;
    await a.keyboard.press('j');
    for (let i = 0; i < 300; i++) { const s = await st0(); modes.add(s.mode); best = Math.max(best, s.streak); if (!s.counted && i > 10) break;
      if ((s.mode === 'wall-juggle' && s.wallPhase === 'returning') || (s.mode === 'juggle' && s.phase > 0.55 && s.phase < 0.85)) { await a.keyboard.press('j'); await a.waitForTimeout(120); }
      if (best >= 4 && modes.has('wall-juggle')) break; await a.waitForTimeout(25); }
    await shot(a, 's9-a-wall-kick');
    rec(modes.has('wall-juggle') && best >= 2, 'wall kick: the keep-up run kicks off the wall and keeps counting', JSON.stringify({ modes: [...modes], best, wall: { x: Math.round(wall.x), z: Math.round(wall.z) } }));
  } else rec(false, 'wall kick: no wall found near the plaza');
  await sweep('step9');
}

// Real frame cadence (rAF), the renderer's draw calls per frame, rings drawn. `w` = the page's test hook ('window.__fi2' on the island).
async function frameStats(p, w = 'window.__fi2', ms = 3000) {
  return p.evaluate(async ([w, ms]) => {
    const W = eval(w); const r = W?.renderer || W?.threeRenderer || null; const times = []; let last = performance.now(); let calls = 0, n = 0;
    await new Promise((ok) => { const t0 = performance.now(); const tick = (t) => { times.push(t - last); last = t; if (r?.info?.render) { calls += r.info.render.calls; n++; } if (t - t0 < ms) requestAnimationFrame(tick); else ok(); }; requestAnimationFrame(tick); });
    times.sort((x, y) => x - y);
    const m = W?.measureParty?.(60) ?? null;
    return { frameMs: +(times[Math.floor(times.length / 2)]).toFixed(1), p95: +(times[Math.floor(times.length * .95)]).toFixed(1), fps: +(1000 / (times.reduce((a, b) => a + b, 0) / times.length)).toFixed(0), calls: n ? Math.round(calls / n) : (m?.calls ?? null), partyMs: m?.update != null ? +m.update.toFixed(3) : null };
  }, [w, ms]).catch((e) => ({ error: e.message.slice(0, 120) }));
}
const heat = {};
async function step10() {
  curStep = 10;
  // A fresh party (step 8 ended the last one): A hosts on desktop, B joins on the phone, NBOTS bots walk around them.
  const a = st.A.p, b = st.B.p;
  let code = (await session(a))?.code;
  if (!(await isLive(a)) || !code) {
    await openMenu(a); await nick(a, NAMES.A); await a.click('text=Start a party'); await gate(a);
    await a.waitForSelector('[data-party-code]', { timeout: 20000 }).catch(() => {});
    code = await codeOf(a); seenCodes.add(code); await closeCard(a);
  }
  if (!(await isLive(b))) { await joinByCode(b, code, NAMES.B); await gate(b); await waitFor(b, () => isLive(b)); await closeCard(b); }
  await place(a, 104, 44, 0); await place(b, 106, 44, 0); await a.waitForTimeout(6500); // the bots walk 6 m circles round (100 + 1.5 i, 50) m
  heat.islandBase = { A: await frameStats(a), B: await frameStats(b) };
  bot(code, NBOTS, ['--spread', '15']);
  await waitFor(a, async () => (await probe(a)).rings >= Math.min(NBOTS, 6), 20000, 500);
  await a.waitForTimeout(4000);
  heat.island = { A: await frameStats(a), B: await frameStats(b), ringsA: (await probe(a)).rings, ringsB: (await probe(b)).rings, bodiesA: (await probe(a)).bodies, bodiesB: (await probe(b)).bodies };
  await shot(b, 's10-b-island-bots'); await shot(a, 's10-a-island-bots');
  rec(!heat.island.A.error && !heat.island.B.error, `island, ${NBOTS} bots: frame time + draw calls measured`, JSON.stringify({ base: heat.islandBase, bots: heat.island }));
  // Caps by heat tier on the phone (window.__fi2.heat.force): 5 / 5 / 3 / 1 / 0 friends drawn as bodies; desktop always 5. The cap
  const caps = [];
  // The cap is applied when a friend is ADMITTED (remoteAvatars.ts: a shown friend is never dropped), so B leaves and rejoins under
  // each forced tier and counts the friends it admits.
  for (const t of [0, 1, 2, 3, 4]) {
    try {
      await listTab(b); await b.locator('[data-party-sheet] button:has-text("Leave party")').click({ timeout: 5000 });
      await waitFor(b, async () => !(await isLive(b)), 8000); await b.waitForTimeout(2500); await clearOverlays(b);
      await b.evaluate((t) => window.__fi2.heat.force(t), t);
      await openMenu(b); await shot(b, `s10-b-tier${t}-menu`); await closeCard(b);
      await joinByCode(b, code, NAMES.B); await gate(b, true); await waitFor(b, () => isLive(b)); await closeCard(b);
      await place(b, 106, 44, 0); await b.waitForTimeout(7000);
    } catch (e) { note(`tier ${t} rejoin: ${e.message.split('\n')[0]}`); await shot(b, `s10-b-tier${t}-fail`); }
    caps.push((await probe(b)).bodies);
  }
  await b.evaluate(() => window.__fi2.heat.force(null));
  heat.caps = caps;
  const CAP = [5, 5, 3, 1, 0];
  rec(caps.every((c, i) => c != null && c <= CAP[i]) && caps[4] === 0, 'phone: bodies drawn never above the tier cap 5/5/3/1/0 (rest ring-only)', JSON.stringify({ caps, cap: CAP, desktop: heat.island.bodiesA, note: 'bodies in view; bots walking off screen lower the count' }));
  for (const c of bots.splice(0)) c.kill('SIGTERM');
  // One room (the Konbini): NBOTS bots walk inside; A and B go in through the door.
  bot(code, NBOTS, ['--room', '8', '--room-after', '500', '--walk', '60000', '--stand', '1000']);
  const r = ROOMS[0];
  await intoRoom(a, r); await intoRoom(b, r);
  await waitFor(b, async () => (await friendsDrawn(b, r)) >= 5, 30000, 500);
  await b.waitForTimeout(3000);
  heat.room = { A: await frameStats(a, 'window.__konbini'), B: await frameStats(b, 'window.__konbini') };
  heat.roomShown = await b.evaluate(() => window.__konbini?.state?.party?.shown ?? null).catch(() => null);
  await shot(b, 's10-b-konbini-bots');
  rec(!heat.room.A.error && !heat.room.B.error, `Konbini, ${NBOTS} bots: frame time + draw calls measured`, JSON.stringify(heat.room));
  rec(heat.roomShown != null && heat.roomShown <= 5, 'Konbini (phone): friends drawn within the cap', String(heat.roomShown));
  for (const c of bots.splice(0)) c.kill('SIGTERM');
  await backToIsland(a, r); await backToIsland(b, r);
  await sweep('step10');
}

async function main() {
  browser = await chromium.launch({ channel: process.env.PW_CHANNEL || undefined, args: ['--mute-audio'] });
  const steps = [step1, step2, step3, step4, step5, step6, step7, step8, step9, step10];
  for (let i = 0; i < steps.length; i++) {
    if (!STEPS.has(i + 1)) continue;
    const t0 = Date.now();
    try { await steps[i](); } catch (e) { curStep = i + 1; rec(false, `step ${i + 1} crashed`, e.message.split('\n')[0].slice(0, 200)); for (const d of Object.values(devices)) await shot(d.p, `s${i + 1}-crash-${d.name}`); }
    note(`step ${i + 1} took ${Math.round((Date.now() - t0) / 1000)} s`);
  }
  if (STEPS.has(11)) {
    curStep = 11;
    rec(privacy.checks > 0 && !privacy.bad.length, 'no first name in localStorage / sessionStorage on any device, any step', privacy.bad.slice(0, 3).join(' ; ') || `${privacy.checks} sweeps`);
    rec(!privacy.extraKeys, `the only stored party key is ${KEY}`, JSON.stringify(privacy.extraKeys || []));
    const withCounts = beats.filter((b) => /"k":\{/.test(b.body));
    rec(beats.length > 0, 'analytics beats captured and checked for codes / names / tokens', `${beats.length} beats (${withCounts.length} with counts)`);
    const mp = new Set(); for (const b of beats) { const m = b.body.match(/"k":\{[^}]*\}/); if (m) for (const k of m[0].matchAll(/"([a-z_:]+)"/g)) if (/^mp|^emote|party/.test(k[1])) mp.add(k[1]); }
    note('party/emote count ids seen in beats: ' + [...mp].slice(0, 30).join(','));
  }
  for (const c of bots) c.kill('SIGTERM');
  await browser.close();
  // Table.
  console.log('\n step | check | result');
  for (const [s, w, ok, d] of results) console.log(` ${String(s).padStart(4)} | ${ok ? 'PASS' : 'FAIL'} | ${w}${ok ? '' : '  (' + d + ')'}`);
  const real = errs.filter((e) => !/ResizeObserver|AbortError|Lock broken|Target page, context or browser has been closed/i.test(e));
  if (real.length) console.log('page errors:', [...new Set(real)].slice(0, 6).join(' ; '));
  const fails = results.filter((r) => !r[2]).length;
  console.log(`\nmp-e2e: ${results.length - fails}/${results.length} passed${fails ? `, ${fails} FAILED` : ''}`);
  process.exit(fails ? 1 : 0);
}
main().catch(async (e) => { console.error(e); for (const c of bots) c.kill('SIGTERM'); try { await browser?.close(); } catch { /* gone */ } process.exit(1); });
