// Headless ghost-friend check (Oct 23 2026): a flying friend (Jetpack, blue plume) must leave NOTHING drawn after they are gone.
// The game starts a party; scripted friends join over the dev relay, fly next to the player, then (a) Leave, (b) are removed by the host,
// (c) drop hard and the relay's resume grace lapses, (d) go Away while flying and drop (the 10 min away grace), (e) the host ends the party.
// After each: every friend layer under 'remote-avatars' (bodies, plume, rides, balls, fields, labels, status, bumps) must draw nothing
// (only my own colour ring while the party is live). The relay clock is skipped forward (dev relay MP_DEV=1: POST /dev/advance).
// Run: MP_PORT=8957 MP_DEV=1 node multiplayer/dev-relay/server.mjs &
//      node --experimental-websocket scripts/check-mp-ghost-live.cjs <appUrl> <relayUrl>
//   (app built with NEXT_PUBLIC_MULTIPLAYER=1 + NEXT_PUBLIC_MULTIPLAYER_URL=<relayUrl>; closes only its own browser)
const { chromium } = require('playwright');
const path = require('path');
const { loadTs } = require('../multiplayer/dev-relay/loadTs.cjs');
const P = loadTs(path.join(__dirname, '../multiplayer/protocol/index.ts'));
const url = process.argv[2] || 'http://localhost:8956', relay = process.argv[3] || 'http://127.0.0.1:8957';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function friend(code, name, look) {
  const f = { me: -1, ws: null, seq: 0, pose: null, away: false };
  f.ws = new WebSocket(relay.replace(/^http/, 'ws').replace(/\/$/, '') + '/party/' + code + '/ws');
  f.ws.onopen = () => f.ws.send(JSON.stringify([P.C.Hello, P.PROTOCOL_VERSION, look, null, null, null, name]));
  f.ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m[0] === P.S.Welcome) f.me = m[2]; if (m[0] === P.S.Caps) f.ws.send(JSON.stringify([P.C.Caps, m[1]])); };
  f.send = (body) => { f.pose = body; if (f.ws.readyState === 1) f.ws.send(JSON.stringify([P.C.Pose, f.seq++, ...body])); };
  f.beat = setInterval(() => { if (f.pose) f.send(f.pose); }, 700);
  f.stop = () => clearInterval(f.beat);
  f.leave = () => { f.stop(); try { f.ws.send(JSON.stringify([P.C.Leave])); } catch { /* gone */ } };
  f.drop = () => { f.stop(); try { f.ws.close(); } catch { /* gone */ } };
  return f;
}
// Everything drawn under the friend layer (ancestor visibility respected), by object name.
const drawn = (p) => p.evaluate(() => {
  const s = window.__fi2?.scene, root = s?.getObjectByName('remote-avatars'); if (!root) return null;
  const out = {};
  root.traverse((o) => {
    for (let q = o; q; q = q.parent) { if (!q.visible) return; if (q === root) break; }
    const n = o.isInstancedMesh ? o.count : (o.isMesh || o.isSprite) ? 1 : 0;
    if (n > 0) { const k = o.name || o.parent?.name || (o.isSprite ? 'sprite' : 'mesh'); out[k] = (out[k] || 0) + n; }
  });
  return out;
});
async function flyNear(p, f, me, dx) {
  const yaw = (me[3] / 256) * Math.PI * 2, fx = Math.sin(yaw), fz = Math.cos(yaw);
  const x = Math.round((me[0] / 10 + fx * 6 + Math.cos(yaw) * dx) * 10), z = Math.round((me[2] / 10 + fz * 6 - Math.sin(yaw) * dx) * 10), y = me[1] + 40;
  for (let i = 0; i < 12; i++) { f.send([x, y, z, me[3], i % 2 ? 8 : 0, P.Mode.Jetpack, 0, 0]); await wait(150); }
  await wait(1200);
}
const myPose = (p) => p.evaluate(() => { const f = window.__fi2; return [Math.round(f.location.x * 10), Math.round(f.player.root.position.y * 10), Math.round(f.location.z * 10), Math.round((f.player.root.rotation.y / (Math.PI * 2)) * 256) & 255]; });
const advance = (ms) => fetch(relay + '/dev/advance?ms=' + ms, { method: 'POST' });

(async () => {
  const b = await chromium.launch({ channel: process.env.PW_CHANNEL || undefined, args: ['--mute-audio'] });
  let fail = 0;
  const expect = async (p, label, live) => {
    await wait(2500);
    const d = await drawn(p), extra = { ...d };
    if (live && extra['remote-avatar-rings'] === 1) delete extra['remote-avatar-rings']; // my own ring
    const left = Object.keys(extra);
    console.log((left.length ? 'FAIL ' : 'ok   ') + label + ' ' + JSON.stringify(d));
    if (left.length) fail++;
  };
  try {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } }), p = await ctx.newPage();
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
    await p.click('[data-party-sheet] button:has-text("Done")'); await p.waitForTimeout(1500);
    const me = await myPose(p);
    const LOOK = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8];
    const fly = async (name, dx) => { const f = friend(code, name, LOOK); await wait(800); await flyNear(p, f, me, dx); const d = await drawn(p); if (!d || !(d['remote-jet-plumes'] > 0)) { console.log('FAIL ' + name + ' not drawn flying ' + JSON.stringify(d)); fail++; } return f; };
    // (a) Leave
    let f = await fly('Ayako', -2); f.leave(); await expect(p, '(a) friend left while flying', true);
    // (b) removed by the host (List > Remove > confirm)
    f = await fly('Leo', 2);
    await p.click('[data-party-open]'); await p.waitForSelector('[data-party-sheet]'); await p.click('[data-party-sheet] [role=tab]:has-text("List")').catch(() => {}); await p.waitForTimeout(400);
    await p.click(`[data-remove-open][data-member="${f.me}"]`); await p.waitForTimeout(1600); await p.click('[data-party-sheet] button:has-text("Remove"):not([data-remove-open])');
    await p.waitForTimeout(600); await p.click('[data-party-sheet] button:has-text("Done")').catch(() => p.keyboard.press('Escape')); f.stop();
    await expect(p, '(b) friend removed while flying', true);
    await advance(61000); // the relay's auto-lock after a kick (KICK_LOCK_MS) would refuse the next friend
    // (c) hard drop, the resume grace lapses
    f = await fly('Mia', -3); f.drop(); await wait(800); await advance(65000); await expect(p, '(c) friend dropped, grace lapsed', true);
    // (d) Away while flying (Hidden flag), then a drop and the away grace lapses
    f = await fly('Noa', 3); f.send([...f.pose.slice(0, 7), P.PoseFlag.Hidden]); await wait(1500); f.drop(); await wait(800); await advance(11 * 60000); await expect(p, '(d) away friend timed out', true);
    // (e) the host ends the party while a friend flies
    f = await fly('Kai', 0);
    await p.click('[data-party-open]'); await p.waitForSelector('[data-party-sheet]'); await p.click('[data-party-end]'); await p.waitForTimeout(1600);
    await p.click('[data-party-sheet] button:has-text("End party"):not([data-party-end])'); await p.waitForTimeout(800); await p.keyboard.press('Escape').catch(() => {}); f.stop();
    await expect(p, '(e) host ended the party', false);
    console.log('page errors:', errs.length ? errs.slice(0, 3).join(' ; ') : 'none'); if (errs.length) fail++;
    await ctx.close();
  } finally { await b.close(); }
  console.log(fail ? 'check-mp-ghost-live: ' + fail + ' failures' : 'check-mp-ghost-live: ok');
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
