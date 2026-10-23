// Headless check for the multiplayer live feel (Oct 23 2026): the game starts a party, a scripted v1.2 friend "Ayako" joins over
// the dev relay, stands 3 m in front dribbling (ball at the feet), shoots (a Free ball at 10 Hz), then flies a jetpack (the plume).
// One phone (390 x 844) and one desktop page. Screenshots + scene checks (friend ball meshes, label sprite size, plume particles).
// Run: node --experimental-websocket scripts/check-mp-live.cjs <appUrl> <relayUrl> [outDir]
//   (app built with NEXT_PUBLIC_MULTIPLAYER=1 + NEXT_PUBLIC_MULTIPLAYER_URL=<relayUrl>; closes only its own browser)
const { chromium } = require('playwright');
const path = require('path');
const { loadTs } = require('../multiplayer/dev-relay/loadTs.cjs');
const P = loadTs(path.join(__dirname, '../multiplayer/protocol/index.ts'));
const url = process.argv[2] || 'http://localhost:8932', relay = process.argv[3] || 'http://127.0.0.1:8931', out = process.argv[4] || '/tmp/mp-live';
require('fs').mkdirSync(out, { recursive: true });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function friend(code) {
  const f = { me: -1, player: null, ws: null, seq: 0, pose: null, caps: 0 };
  f.ws = new WebSocket(relay.replace(/^http/, 'ws').replace(/\/$/, '') + '/party/' + code + '/ws');
  f.ws.onopen = () => f.ws.send(JSON.stringify([P.C.Hello, P.PROTOCOL_VERSION, [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8], null, null, null, 'Ayako']));
  f.ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m[0] === P.S.Welcome) f.me = m[2];
    if (m[0] === P.S.Caps) { f.caps = m[1]; f.ws.send(JSON.stringify([P.C.Caps, m[1]])); }
    if (m[0] === P.S.Poses) for (let k = 2; k < m.length; k += 9) if (m[k] !== f.me) f.player = m.slice(k + 1, k + 9);
    if (m[0] === P.S.Live) for (let k = 0; k < m[2].length; k += 10) if (m[2][k] !== f.me) f.player = m[2].slice(k + 1, k + 9);
  };
  f.send = (body) => { f.pose = body; f.ws.send(JSON.stringify([P.C.Pose, f.seq++, ...body])); };
  f.ball = (st, x, y, z) => f.ws.send(JSON.stringify([P.C.Ball, st, Math.round(x), Math.round(y), Math.round(z)]));
  f.beat = setInterval(() => { if (f.ws.readyState === 1 && !f.busy) { if (f.pose) f.send(f.pose); else f.ws.send(JSON.stringify([P.C.Beat, 1])); } }, 1000);
  f.close = () => { clearInterval(f.beat); try { f.ws.close(); } catch { /* gone */ } };
  return f;
}
function inFront(p, d, side = 0) {
  const yaw = (p[3] / 256) * Math.PI * 2, x = p[0] / 10 + Math.sin(yaw) * d + Math.cos(yaw) * side, z = p[2] / 10 + Math.cos(yaw) * d - Math.sin(yaw) * side;
  return [Math.round(x * 10), p[1], Math.round(z * 10), (p[3] + 128) & 255];
}
const sceneState = (p) => p.evaluate(() => {
  const s = window.__fi2?.scene; if (!s) return null;
  const balls = []; s.traverse((o) => { if (o.name === 'remote-ball' && o.visible) balls.push(o.position.toArray().map((v) => +v.toFixed(2))); });
  const plume = s.getObjectByName('remote-jet-plumes'), label = s.getObjectByName('remote-name');
  return { balls, plume: plume ? plume.count : -1, label: label ? { w: +label.scale.x.toFixed(2), visible: label.visible } : null };
});

async function run(b, name, ctxOpts) {
  let fail = 0;
  const ctx = await b.newContext(ctxOpts), p = await ctx.newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(url); await p.waitForTimeout(6000);
  await p.click('text=Get my save code').catch(() => {}); await p.waitForTimeout(2000);
  await p.click('button:has-text("Play")').catch(() => {}); await p.waitForTimeout(15000);
  await p.click('button:has-text("Skip")').catch(() => {}); await p.waitForTimeout(1500);
  await p.evaluate(() => { const f = window.__fi2; f.selectRide('walk'); }); await p.waitForTimeout(2500);
  await p.evaluate(() => { const f = window.__fi2; const X = 23, Z = -62; f.location.x = X; f.location.z = Z; f.rooftop.reset(X, Z); f.player.root.rotation.y = Math.PI; f.velocity.x = f.velocity.z = 0; }); await p.waitForTimeout(2500);
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
  const f = friend(code);
  await p.click('[data-party-sheet] button:has-text("Done")'); await p.waitForTimeout(1500);
  await p.keyboard.down('ArrowUp'); await p.waitForTimeout(300); await p.keyboard.up('ArrowUp'); await p.waitForTimeout(1500);
  if (!f.player) { console.log(name, 'FAIL: friend saw no player pose'); f.close(); await ctx.close(); return 1; }
  if (f.caps !== 3) { fail++; console.log(name, 'FAIL: relay did not offer caps', f.caps); }
  const me = f.player.slice();
  // (1) dribbling 3 m in front (a little step so the ball rolls)
  const spot = inFront(me, 3, -.6);
  f.send([spot[0], spot[1], spot[2], spot[3], 0, P.Mode.Idle, 0, 0]); await wait(200);
  f.ball(P.BallState.Feet, spot[0], spot[1] + 2, spot[2]); await p.waitForTimeout(1600);
  let st = await sceneState(p); console.log(name, 'dribble:', JSON.stringify(st));
  if (!st || st.balls.length !== 1) { fail++; console.log(name, 'FAIL: no friend ball at the feet'); }
  if (!st?.label || st.label.w < 3) { fail++; console.log(name, 'FAIL: label not the readable size'); }
  await p.screenshot({ path: `${out}/${name}-1-friend-ball.png` });
  // (2) a shot: a Free ball flying sideways at 10 Hz (14 m/s, up 5 m/s), then rolling, then settled
  const yaw = (spot[3] / 256) * Math.PI * 2, sx = Math.cos(yaw), sz = -Math.sin(yaw);
  let bx = spot[0] / 10 + Math.sin(yaw) * .5, bz = spot[2] / 10 + Math.cos(yaw) * .5, by = spot[1] / 10 + .19, vy = 5;
  const ground = spot[1] / 10 + .19;
  f.busy = true;
  for (let i = 0; i < 14; i++) {
    bx += sx * 1.4; bz += sz * 1.4; vy -= 9.8 * .1; by += vy * .1; if (by < ground) { by = ground; vy = -vy * .5; }
    f.ball(P.BallState.Free, bx * 10, by * 10, bz * 10); await wait(100);
    if (i === 5) { st = await sceneState(p); await p.screenshot({ path: `${out}/${name}-2-friend-shot.png` }); console.log(name, 'shot:', JSON.stringify(st)); if (!st || st.balls.length !== 1 || st.balls[0][1] < ground + .3) { fail++; console.log(name, 'FAIL: the shot ball is not in the air'); } }
  }
  f.busy = false;
  // (3) flying: Jetpack 4 m up, moving across in front
  for (let i = 0; i < 30; i++) {
    const a = i * .06, x = spot[0] + Math.round(Math.sin(a) * 60), z = spot[2] + Math.round((1 - Math.cos(a)) * 30);
    f.send([x, spot[1] + 40, z, (spot[3] + 64) & 255, 36, P.Mode.Jetpack, 0, 0]); await wait(100);
  }
  st = await sceneState(p); console.log(name, 'flying:', JSON.stringify(st));
  if (!st || st.plume <= 0) { fail++; console.log(name, 'FAIL: no jet plume on the flying friend'); }
  await p.screenshot({ path: `${out}/${name}-3-friend-jet.png` });
  console.log(name, 'page errors:', errs.length ? errs.slice(0, 3).join(' ; ') : 'none');
  if (errs.length) fail++;
  f.close(); await ctx.close();
  return fail;
}

(async () => {
  const b = await chromium.launch({ channel: process.env.PW_CHANNEL || undefined, args: ['--mute-audio'] });
  let fail = 0;
  try {
    fail += await run(b, 'phone', { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    fail += await run(b, 'desktop', { viewport: { width: 1280, height: 800 } });
  } finally { await b.close(); }
  console.log(fail ? 'check-mp-live: ' + fail + ' failures' : 'check-mp-live: ok');
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
