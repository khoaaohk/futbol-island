// Headless check for party presence (docs/multiplayer-design.md 4.4.1): the game starts a party, a scripted friend joins over the
// dev relay. (1) The friend goes busy / away in front of the player: screenshots of the green force field + status line, and a ball
// kicked into the field. (2) The player opens the map and Settings: the friend records the Busy pose it receives (frozen spot,
// activity code), then the return.
// Run: node --experimental-websocket scripts/check-mp-presence.cjs <appUrl> <relayUrl> [outDir]
//   (app on NEXT_PUBLIC_MULTIPLAYER=1 + NEXT_PUBLIC_MULTIPLAYER_URL=<relayUrl>; closes only its own browser)
const { chromium } = require('playwright');
const path = require('path');
const { loadTs } = require('../multiplayer/dev-relay/loadTs.cjs');
const P = loadTs(path.join(__dirname, '../multiplayer/protocol/index.ts'));
const url = process.argv[2] || 'http://localhost:8992', relay = process.argv[3] || 'http://127.0.0.1:8991', out = process.argv[4] || '/tmp/mp-presence';
require('fs').mkdirSync(out, { recursive: true });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function friend(code) {
  const f = { me: -1, player: null, got: [], ws: null, seq: 0, pose: null };
  f.ws = new WebSocket(relay.replace(/^http/, 'ws').replace(/\/$/, '') + '/party/' + code + '/ws');
  f.ws.onopen = () => f.ws.send(JSON.stringify([P.C.Hello, P.PROTOCOL_VERSION, [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8], null, null]));
  f.ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m[0] === P.S.Welcome) f.me = m[2];
    if (m[0] === P.S.Poses) for (let k = 2; k < m.length; k += 9) if (m[k] !== f.me) { f.player = m.slice(k + 1, k + 9); f.got.push([Date.now(), ...f.player]); }
  };
  f.send = (body) => { f.pose = body; f.ws.send(JSON.stringify([P.C.Pose, f.seq++, ...body])); };
  f.beat = setInterval(() => { if (f.ws.readyState === 1) { if (f.pose) f.send(f.pose); else f.ws.send(JSON.stringify([P.C.Beat, 1])); } }, 1000);
  f.close = () => { clearInterval(f.beat); try { f.ws.close(); } catch { /* gone */ } };
  return f;
}
// a spot `d` m in front of the player (their facing), feet on their height
function inFront(p, d, side = 0) {
  const yaw = (p[3] / 256) * Math.PI * 2, x = p[0] / 10 + Math.sin(yaw) * d + Math.cos(yaw) * side, z = p[2] / 10 + Math.cos(yaw) * d - Math.sin(yaw) * side;
  return [Math.round(x * 10), p[1], Math.round(z * 10), (p[3] + 128) & 255];
}

(async () => {
  let fail = 0;
  const b = await chromium.launch({ channel: process.env.PW_CHANNEL || undefined, args: ['--mute-audio'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (/shader|THREE|WebGL|GL_/i.test(m.text())) errs.push('console: ' + m.text().slice(0, 400)); });
  await p.goto(url); await p.waitForTimeout(6000);
  await p.click('text=Get my save code').catch(() => {}); await p.waitForTimeout(2000);
  await p.click('button:has-text("Play")').catch(() => {}); await p.waitForTimeout(15000);
  await p.click('button:has-text("Skip")').catch(() => {}); await p.waitForTimeout(1500);
  await p.evaluate(() => { const f = window.__fi2; window.__spawn = { x: f.location.x, z: f.location.z }; f.selectRide('walk'); }); await p.waitForTimeout(3000);
  // land on the open plaza (the walking camera is close)
  await p.evaluate(() => { const f = window.__fi2, s = window.__spawn; const X = +(new URLSearchParams(location.search).get('x') ?? 23), Z = -62; void s; f.location.x = X; f.location.z = Z; f.rooftop.reset(X, Z); f.player.root.rotation.y = Math.PI; f.velocity.x = f.velocity.z = 0; }); await p.waitForTimeout(3000);
  await p.screenshot({ path: `${out}/0-start.png` });
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
  console.log('party code', code);
  const f = friend(code);
  await p.click('[data-party-sheet] button:has-text("Done")'); await p.waitForTimeout(1500);
  // make the player send a pose (a short walk), so the friend knows where they are
  await p.keyboard.down('ArrowUp'); await p.waitForTimeout(400); await p.keyboard.up('ArrowUp'); await p.waitForTimeout(1500);
  if (!f.player) { console.log('FAIL: friend saw no player pose'); fail++; }
  const me = f.player.slice();
  // (1) the friend is busy (a lesson) 3.2 m in front
  const spot = inFront(me, 3.2);
  f.send([spot[0], spot[1], spot[2], spot[3], 0, P.Mode.Idle, 0, 0]); await p.waitForTimeout(1200);
  f.send([spot[0], spot[1], spot[2], spot[3], P.Activity.Lesson, P.Mode.Busy, 0, 0]); await p.waitForTimeout(1800);
  await p.screenshot({ path: `${out}/1-friend-lesson.png` });
  console.log('errors so far:', errs.slice(0, 4).join(' || ').slice(0, 1500));
  f.send([spot[0], spot[1], spot[2], spot[3], P.Activity.Quiz, P.Mode.Busy, 0, 0]); await p.waitForTimeout(800);
  await p.screenshot({ path: `${out}/2-friend-quiz.png` });
  f.send([spot[0], spot[1], spot[2], spot[3], 0, P.Mode.Idle, 0, P.PoseFlag.Hidden]); await p.waitForTimeout(800);
  await p.screenshot({ path: `${out}/3-friend-away.png` });
  const list = await p.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => x.getBoundingClientRect().width > 0 && /friend|Party/i.test(x.getAttribute('aria-label') || '')); b?.click(); return b?.getAttribute('aria-label'); });
  console.log('party button:', list);
  await p.waitForTimeout(1200); await p.click('#party-tab-party').catch(() => {}); await p.waitForTimeout(500);
  const rows = await p.evaluate(() => [...document.querySelectorAll('[data-party-activity]')].map((x) => x.textContent));
  console.log('party list activity lines (away):', JSON.stringify(rows)); if (!rows.some((r) => /Away/.test(r))) { fail++; console.log('FAIL: no Away line'); }
  await p.screenshot({ path: `${out}/4-party-list.png` }); void list;
  await p.click('[data-party-sheet] button:has-text("Done")').catch(() => {}); await p.waitForTimeout(800);
  // ball into the field: the friend busy right in front, the player kicks (Space)
  const near = inFront(me, 2.4);
  f.send([near[0], near[1], near[2], near[3], P.Activity.Settings, P.Mode.Busy, 0, 0]); await p.waitForTimeout(1500);
  await p.keyboard.down('Space'); await p.waitForTimeout(120); await p.keyboard.up('Space');
  for (let i = 0; i < 6; i++) { await p.waitForTimeout(110); await p.screenshot({ path: `${out}/5-ball-${i}.png` }); }
  // back: the field pops
  f.send([near[0], near[1], near[2], near[3], 0, P.Mode.Idle, 0, 0]); await p.waitForTimeout(420);
  await p.screenshot({ path: `${out}/6-friend-back-pop.png` });
  // (3) the player starts a lesson (the 'Start lesson 1 · Go' card): Busy / Lesson, frozen; back with one warp
  const go = await p.locator(':is(button,a):visible', { hasText: /Start lesson/ }).last().elementHandle({ timeout: 3000 }).catch(() => null);
  if (go) {
    const pre = f.player.slice(0, 3), n0 = f.got.length;
    await go.click({ timeout: 5000 }).catch(() => console.log('note: Go not clickable')); await p.waitForTimeout(9000);
    console.log('dialogs:', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('[role=dialog]')].map((d) => d.getAttribute('aria-label')))));
    const during = f.got.slice(n0).map((g) => g.slice(1));
    console.log('friend sees during the lesson:', JSON.stringify(during.slice(-1)), 'poses', during.length);
    await p.screenshot({ path: `${out}/8-local-lesson.png` });
    if (!during.length || during.some((d) => d[5] !== P.Mode.Busy) || during.some((d) => Math.abs(d[0] - pre[0]) > 3 || Math.abs(d[2] - pre[2]) > 3)) { console.log('note: lesson poses', JSON.stringify(during.slice(0, 4)), 'pre', JSON.stringify(pre)); }
    if (!during.length || during[during.length - 1][5] !== P.Mode.Busy) { fail++; console.log('FAIL: lesson not Busy'); }
  } else console.log('note: no lesson Go button');
    // leave the lesson: Escape / an Exit button, then the friend should see one warp back (or the same spot)
    await p.evaluate(() => { const d = [...document.querySelectorAll('button')].find((x) => x.getBoundingClientRect().width > 0 && /^Done$/i.test(x.innerText.trim())); d?.click(); }); await p.waitForTimeout(3000);
    await p.screenshot({ path: `${out}/8b-after-lesson.png` });
    for (let i = 0; i < 2; i++) { await p.evaluate(() => { const d = [...document.querySelectorAll('button')].find((x) => x.getBoundingClientRect().width > 0 && /^Done$/i.test(x.innerText.trim())); d?.click(); }); await p.waitForTimeout(2000); }
    const after = f.got.slice(-6).map((g) => g.slice(1)); console.log('friend sees after the lesson (Done, Paths, Done):', JSON.stringify(after.slice(-3)));
    const fin = after[after.length - 1]; if (fin[5] === P.Mode.Busy) { fail++; console.log('FAIL: still busy after the lesson'); }
  // (2) the player opens the map, then Settings: what the friend receives
  const before = f.got.length, mePos = f.player.slice(0, 3);
  await p.keyboard.press('m'); await p.waitForTimeout(2500);
  const mapPose = f.got.slice(before).map((g) => g.slice(1)).pop();
  console.log('friend sees during map:', JSON.stringify(mapPose));
  if (!mapPose || mapPose[5] !== P.Mode.Busy || mapPose[4] !== P.Activity.Map) { fail++; console.log('FAIL: map not Busy/Map'); }
  else if (Math.abs(mapPose[0] - mePos[0]) > 3 || Math.abs(mapPose[2] - mePos[2]) > 3) { fail++; console.log('FAIL: not frozen at the last spot'); }
  await p.keyboard.press('Escape'); await p.waitForTimeout(1500);
  const backPose = f.player; console.log('friend sees after the map:', JSON.stringify(backPose));
  if (backPose[5] === P.Mode.Busy) { fail++; console.log('FAIL: still busy after closing the map'); }
  const settings = await p.$('[aria-label="Settings"], [aria-label^="Settings"], [data-settings-open]');
  if (settings) {
    await settings.click(); await p.waitForTimeout(6500); // the island loop sleeps: the beat tick sends it
    const sp = f.player; console.log('friend sees during Settings:', JSON.stringify(sp));
    if (sp[5] !== P.Mode.Busy || sp[4] !== P.Activity.Settings) { fail++; console.log('FAIL: Settings not Busy/Settings'); }
    await p.screenshot({ path: `${out}/7-local-settings.png` });
    await p.keyboard.press('Escape'); await p.waitForTimeout(800);
    await p.evaluate(() => { const d = [...document.querySelectorAll('button')].find((x) => x.getBoundingClientRect().width > 0 && /^Done$/.test(x.innerText.trim())); d?.click(); }); await p.waitForTimeout(1500);
    const back = f.player; console.log('friend sees after Settings:', JSON.stringify(back)); if (back[5] === P.Mode.Busy) { fail++; console.log('FAIL: still busy after Settings'); }
  } else console.log('note: no Settings button found');
  console.log('page errors:', errs.length ? errs.slice(0, 3).join(' ; ') : 'none');
  f.close(); await b.close();
  process.exit(fail ? 1 : 0);
})().catch(async (e) => { console.error(e); process.exit(1); });
