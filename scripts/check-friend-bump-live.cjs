// Headless check for friend bumps (Oct 23 2026, docs/multiplayer-friend-bumps.md): the game starts a party, two scripted friends join over
// the dev relay and (1) fly into each other 4 m up in front of the player, (2) ride bikes into each other on the ground. One phone page
// (390 x 844): a short frame sequence per bump + a scene check (the friend-bumps burst sprites are visible).
// Run: node --experimental-websocket scripts/check-friend-bump-live.cjs <appUrl> <relayUrl> [outDir]
//   (app built with NEXT_PUBLIC_MULTIPLAYER=1 + NEXT_PUBLIC_MULTIPLAYER_URL=<relayUrl>; closes only its own browser)
const { chromium } = require('playwright');
const path = require('path');
const { loadTs } = require('../multiplayer/dev-relay/loadTs.cjs');
const P = loadTs(path.join(__dirname, '../multiplayer/protocol/index.ts'));
const url = process.argv[2] || 'http://localhost:8942', relay = process.argv[3] || 'http://127.0.0.1:8943', out = process.argv[4] || '/tmp/friend-bump';
require('fs').mkdirSync(out, { recursive: true });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function friend(code, name, look) {
  const f = { me: -1, player: null, ws: null, seq: 0, pose: null };
  f.ws = new WebSocket(relay.replace(/^http/, 'ws').replace(/\/$/, '') + '/party/' + code + '/ws');
  f.ws.onopen = () => f.ws.send(JSON.stringify([P.C.Hello, P.PROTOCOL_VERSION, look, null, null, null, name]));
  f.ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m[0] === P.S.Welcome) f.me = m[2];
    if (m[0] === P.S.Caps) f.ws.send(JSON.stringify([P.C.Caps, m[1]]));
    if (m[0] === P.S.Poses) for (let k = 2; k < m.length; k += 9) if (m[k] !== f.me) f.player ??= m.slice(k + 1, k + 9);
    if (m[0] === P.S.Live) for (let k = 0; k < m[2].length; k += 10) if (m[2][k] !== f.me) f.player ??= m[2].slice(k + 1, k + 9);
  };
  f.send = (body) => { f.pose = body; f.ws.send(JSON.stringify([P.C.Pose, f.seq++, ...body])); };
  f.beat = setInterval(() => { if (f.ws.readyState === 1 && f.pose && !f.busy) f.send(f.pose); }, 1000);
  f.close = () => { clearInterval(f.beat); try { f.ws.close(); } catch { /* gone */ } };
  return f;
}
const bumpState = (p) => p.evaluate(() => {
  const s = window.__fi2?.scene; if (!s) return null;
  const g = s.getObjectByName('friend-bumps'); let vis = 0; g?.traverse((o) => { if (o.isSprite && o.visible) vis++; });
  return { sprites: vis };
});

// Two friends approach a meeting point (mx, my, mz in decimetres) from either side along x, at `speed` m/s, then hold.
async function collide(p, a, b, me, mode, up, speed, name) {
  const yaw = (me[3] / 256) * Math.PI * 2, fx = Math.sin(yaw), fz = Math.cos(yaw), sx = Math.cos(yaw), sz = -Math.sin(yaw);
  const mx = me[0] / 10 + fx * 4.5, mz = me[2] / 10 + fz * 4.5, my = me[1] / 10 + up;
  const yawA = Math.round((Math.atan2(sx, sz) / (Math.PI * 2)) * 256) & 255, yawB = (yawA + 128) & 255;
  let seen = 0;
  a.busy = b.busy = true;
  // settle: glide to the start spots (3 m either side) over 3 s, so the relay's speed check never drops a pose
  const y0 = a.pose ? a.pose[1] / 10 : my, ax0 = a.pose ? a.pose[0] / 10 : mx - sx * 3, az0 = a.pose ? a.pose[2] / 10 : mz - sz * 3, bx0 = b.pose ? b.pose[0] / 10 : mx + sx * 3, bz0 = b.pose ? b.pose[2] / 10 : mz + sz * 3;
  for (let i = 1; i <= 30; i++) {
    const u = i / 30, y = y0 + (my - y0) * u;
    a.send([Math.round((ax0 + (mx - sx * 3 - ax0) * u) * 10), Math.round(y * 10), Math.round((az0 + (mz - sz * 3 - az0) * u) * 10), yawA, 0, mode, 0, 0]);
    b.send([Math.round((bx0 + (mx + sx * 3 - bx0) * u) * 10), Math.round(y * 10), Math.round((bz0 + (mz + sz * 3 - bz0) * u) * 10), yawB, 0, mode, 0, 0]);
    await wait(100);
  }
  for (let i = 0; i <= 30; i++) {
    const d = Math.max(.25, 3 - i * speed * .1); // each one 3 m out, closing until 0.5 m apart
    const pa = [Math.round((mx - sx * d) * 10), Math.round(my * 10), Math.round((mz - sz * d) * 10), yawA, d > .25 ? speed * 4 : 0, mode, 0, 0];
    const pb = [Math.round((mx + sx * d) * 10), Math.round(my * 10), Math.round((mz + sz * d) * 10), yawB, d > .25 ? speed * 4 : 0, mode, 0, 0];
    a.send(pa); b.send(pb); await wait(100);
    if (i === 22 && process.env.BUMP_DEBUG) await p.screenshot({ path: `${out}/${name}-debug.png` });
    if (process.env.BUMP_DEBUG && i % 5 === 0) console.log(name, i, JSON.stringify(await p.evaluate(() => { const s = window.__fi2.scene, r = s.getObjectByName('remote-avatar-rings'), m = new (r.matrix.constructor)(), out = []; for (let k = 0; k < r.count; k++) { r.getMatrixAt(k, m); const e = m.elements; out.push([+Math.hypot(e[0], e[1], e[2]).toFixed(2), +e[12].toFixed(1), +e[13].toFixed(1), +e[14].toFixed(1)]); } return out; })));
    const st = await bumpState(p); if (st && st.sprites > 0) { if (seen < 4) await p.screenshot({ path: `${out}/${name}-${seen}.png` }); seen++; }
  }
  a.busy = b.busy = false;
  return seen;
}

(async () => {
  const b = await chromium.launch({ channel: process.env.PW_CHANNEL || undefined, args: ['--mute-audio'] });
  let fail = 0;
  try {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }), p = await ctx.newPage();
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
    const fa = friend(code, 'Ayako', [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8]); await wait(600);
    const fb = friend(code, 'Leo', [2, 7, 1, 8, 2, 8, 1, 8, 2, 8, 4, 5]);
    await p.click('[data-party-sheet] button:has-text("Done")'); await p.waitForTimeout(1500);
    await p.keyboard.down('ArrowUp'); await p.waitForTimeout(300); await p.keyboard.up('ArrowUp'); await p.waitForTimeout(1500);
    if (!fa.player) { console.log('FAIL: friend saw no player pose'); fail++; }
    else {
      const me = fa.player.slice();
      // park both apart first (the interpolators settle), then the bumps
      const fly = await collide(p, fa, fb, me, P.Mode.Jetpack, 4, 3, 'fly-bump'); console.log('fly bump frames with a burst:', fly);
      if (!fly) { fail++; console.log('FAIL: no burst for the flying bump'); }
      await wait(3000);
      const bike = await collide(p, fa, fb, me, P.Mode.Bike, 0, 4, 'bike-bump'); console.log('bike bump frames with a burst:', bike);
      if (!bike) { fail++; console.log('FAIL: no burst for the bike bump'); }
    }
    console.log('page errors:', errs.length ? errs.slice(0, 3).join(' ; ') : 'none'); if (errs.length) fail++;
    fa.close(); fb.close(); await ctx.close();
  } finally { await b.close(); }
  console.log(fail ? 'check-friend-bump-live: ' + fail + ' failures' : 'check-friend-bump-live: ok');
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
