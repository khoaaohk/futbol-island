// Headless check for friends on the map (Oct 23 2026): the game starts a party, three scripted friends join over the dev relay
// (Ayako walking nearby, Leo busy, Mia indoors at a door), then the phone page (390 x 844) opens the travel map. Checks: three
// friend dots on the full map (Leo dimmed, Mia with the door badge), "Friends" in the key (7 entries), a tap shows the friend's name,
// and the minimap draws the near friend. One phone screenshot of the full map (+ a small minimap crop).
// Run: node --experimental-websocket scripts/check-friend-map-live.cjs <appUrl> <relayUrl> [outDir]
//   (app built with NEXT_PUBLIC_MULTIPLAYER=1 + NEXT_PUBLIC_MULTIPLAYER_URL=<relayUrl>; closes only its own browser)
const { chromium } = require('playwright');
const path = require('path');
const { loadTs } = require('../multiplayer/dev-relay/loadTs.cjs');
const P = loadTs(path.join(__dirname, '../multiplayer/protocol/index.ts'));
const url = process.argv[2] || 'http://localhost:8971', relay = process.argv[3] || 'http://127.0.0.1:8972', out = process.argv[4] || '/tmp/friend-map';
require('fs').mkdirSync(out, { recursive: true });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function friend(code, name, look) {
  const f = { me: -1, ws: null, seq: 0, pose: null };
  f.ws = new WebSocket(relay.replace(/^http/, 'ws').replace(/\/$/, '') + '/party/' + code + '/ws');
  f.ws.onopen = () => f.ws.send(JSON.stringify([P.C.Hello, P.PROTOCOL_VERSION, look, null, null, null, name]));
  f.ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m[0] === P.S.Welcome) f.me = m[2]; if (m[0] === P.S.Caps) f.ws.send(JSON.stringify([P.C.Caps, m[1]])); };
  f.send = (body) => { f.pose = body; if (f.ws.readyState === 1) f.ws.send(JSON.stringify([P.C.Pose, f.seq++, ...body])); };
  f.beat = setInterval(() => { if (f.pose) f.send(f.pose); }, 1000);
  f.close = () => { clearInterval(f.beat); try { f.ws.close(); } catch { /* gone */ } };
  return f;
}
const dm = (m) => Math.round(m * 10);

(async () => {
  const b = await chromium.launch({ channel: process.env.PW_CHANNEL || undefined, args: ['--mute-audio'] });
  let fail = 0; const bad = (msg) => { fail++; console.log('FAIL: ' + msg); };
  try {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }), p = await ctx.newPage();
    const errs = []; p.on('pageerror', (e) => errs.push(e.message));
    const unfold = async () => { if (await p.getAttribute('#corner-map', 'aria-hidden') === 'true') { await p.click('.minimap-toggle'); await p.waitForTimeout(800); } };
    await p.goto(url); await p.waitForTimeout(6000);
    await p.click('text=Get my save code').catch(() => {}); await p.waitForTimeout(2000);
    await p.click('button:has-text("Play")').catch(() => {}); await p.waitForTimeout(15000);
    await p.click('button:has-text("Skip")').catch(() => {}); await p.waitForTimeout(1500);
    await p.evaluate(() => { const f = window.__fi2; f.selectRide('walk'); }); await p.waitForTimeout(2500);
    const X = 23, Z = -62;
    await p.evaluate(([X, Z]) => { const f = window.__fi2; f.location.x = X; f.location.z = Z; f.rooftop.reset(X, Z); f.velocity.x = f.velocity.z = 0; }, [X, Z]); await p.waitForTimeout(2500);
    // No party yet: the key is unchanged (6 entries) and no dots.
    await unfold(); await p.click('#corner-map'); await p.waitForSelector('[data-map-legend]', { timeout: 8000 }); await p.waitForTimeout(800);
    const before = await p.evaluate(() => ({ n: document.querySelectorAll('[data-map-legend] li').length, dots: document.querySelectorAll('[data-friend-dot]').length }));
    if (before.n !== 6 || before.dots) bad('no party: key ' + before.n + ' entries, ' + before.dots + ' dots');
    await p.click('dialog[open] button:has-text("Done")'); await p.waitForTimeout(800);
    await p.click('button[aria-label="Play with friends"]');
    await p.waitForSelector('[role=dialog][aria-label="Play with friends"]', { timeout: 10000 });
    await p.fill('input[aria-label="First name"]', 'Sam'); await p.waitForTimeout(500);
    await p.click('text=Start a party'); await p.waitForSelector('[data-parent-gate-answer]');
    await p.waitForFunction(() => /times/.test(document.querySelector('[data-parent-gate] label')?.textContent || ''), null, { timeout: 8000 });
    const q = (await p.textContent('[data-parent-gate] label')).toLowerCase();
    const w = { two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12 };
    const mm = q.match(/(\w+) times (\w+)/); const nn = q.match(/\d+/g);
    await p.fill('[data-parent-gate-answer]', String(mm ? (w[mm[1]] ?? +mm[1]) * (w[mm[2]] ?? +mm[2]) : +nn[0] * +nn[1]));
    await p.click('[data-parent-gate] button[type=submit]'); await p.waitForSelector('[data-party-code]', { timeout: 10000 });
    const code = (await p.textContent('[data-party-code]')).replace(/[^A-Z0-9]/gi, '');
    const fa = friend(code, 'Ayako', [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8]); await wait(500);
    const fb = friend(code, 'Leo', [2, 7, 1, 8, 2, 8, 1, 8, 2, 8, 4, 5]); await wait(500);
    const fc = friend(code, 'Mia', [1, 4, 1, 4, 2, 1, 3, 5, 6, 2, 3, 7]); await wait(800);
    fa.send([dm(X + 22), 0, dm(Z + 18), 0, 0, P.Mode.Walk, P.Zone.Main, 0]);
    fb.send([dm(X - 35), 0, dm(Z - 40), 0, 0, P.Mode.Busy, P.Zone.Main, 0]);
    fc.send([dm(X + 60), 0, dm(Z - 30), 0, 0, P.Mode.Busy, P.Zone.Indoors, 0]); // a door pose (Indoors at the island door)
    await p.click('[data-party-sheet] button:has-text("Done")'); await p.waitForTimeout(2500);
    // Phones fold the minimap while the map or a sheet is open: unfold it.
    await unfold();
    // Ayako walks 4 m in 1 m steps: the minimap redraws for it.
    for (let i = 1; i <= 4; i++) { fa.send([dm(X + 22 + i), 0, dm(Z + 18), 64, 8, P.Mode.Walk, P.Zone.Main, 0]); await wait(250); }
    await wait(1200);
    const mini = await p.evaluate(() => Array.from(document.querySelectorAll('[data-friend-dots="mini"] [data-friend-dot]')).map((g) => g.getAttribute('data-friend-presence')));
    console.log('minimap dots:', mini.join(',') || 'none'); if (!mini.includes('active')) bad('minimap has no dot for the near friend');
    await p.locator('#corner-map').screenshot({ path: `${out}/minimap.png` }).catch(() => {});
    await unfold(); await p.click('#corner-map'); await p.waitForSelector('[data-friend-dots="full"] [data-friend-dot]', { timeout: 8000 }).catch(() => {}); await p.waitForTimeout(1200);
    const full = await p.evaluate(() => ({ legend: Array.from(document.querySelectorAll('[data-map-legend] li')).map((l) => l.textContent), overflow: (() => { const u = document.querySelector('[data-map-legend]'); return u.scrollWidth > u.clientWidth + 1 || u.getBoundingClientRect().right > innerWidth; })(),
      dots: Array.from(document.querySelectorAll('[data-friend-dots="full"] [data-friend-dot]')).map((g) => ({ p: g.getAttribute('data-friend-presence'), dim: g.getAttribute('opacity'), door: !!g.querySelector('[data-friend-door]'), label: g.getAttribute('aria-label') })) }));
    console.log('key:', full.legend.join(' | '), full.overflow ? '(OVERFLOWS)' : ''); console.log('full map dots:', JSON.stringify(full.dots));
    if (full.legend.length !== 7 || full.legend[6] !== 'Friends') bad('key has no Friends entry'); if (full.overflow) bad('key overflows the phone');
    if (full.dots.length !== 3) bad('expected 3 friend dots');
    if (!full.dots.some((d) => d.p === 'busy' && d.dim === '0.5')) bad('busy friend not dimmed');
    if (!full.dots.some((d) => d.p === 'indoors' && d.door)) bad('indoors friend has no door badge');
    const dot = p.locator('[data-friend-dots="full"] [data-friend-presence="active"]').first();
    await dot.tap().catch(() => dot.click({ force: true })); await p.waitForTimeout(400);
    const tip = await p.textContent('#map-tip').catch(() => null); console.log('tap tooltip:', tip); if (!tip || !/Ayako/.test(tip)) bad('tapping a dot shows no name');
    await p.screenshot({ path: `${out}/friend-map-phone.png` });
    console.log('page errors:', errs.length ? errs.slice(0, 3).join(' ; ') : 'none'); if (errs.length) fail++;
    fa.close(); fb.close(); fc.close(); await ctx.close();
  } finally { await b.close(); }
  console.log(fail ? 'check-friend-map-live: ' + fail + ' failures' : 'check-friend-map-live: ok');
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
