// Headless check for ball knock-overs between party friends (Oct 23 2026, relay v1.6 Cap.Hit; lib/town/ballKnock.ts): the game starts a
// party, two scripted friends join over the dev relay. (1) The game kicks its ball at friend Ayako standing 4 m in front: the relay sends
// S.Hit [me, Ayako] to everyone and her avatar tumbles on the game's screen. (2) Friend Leo's (scripted) ball knocks the GAME's player
// over (C.Hit from Leo): the game plays its own local tumble. (3) Ayako steps inside the force field (Busy): a kick at her bounces off the
// field and nothing is sent. One phone page (390 x 844) + one screenshot mid-tumble.
// Run: node --experimental-websocket scripts/check-ball-hit-live.cjs <appUrl> <relayUrl> [outDir]
//   (app built with NEXT_PUBLIC_MULTIPLAYER=1 + NEXT_PUBLIC_MULTIPLAYER_URL=<relayUrl>; closes only its own browser)
const { chromium } = require('playwright');
const path = require('path');
const { loadTs } = require('../multiplayer/dev-relay/loadTs.cjs');
const P = loadTs(path.join(__dirname, '../multiplayer/protocol/index.ts'));
const url = process.argv[2] || 'http://localhost:8942', relay = process.argv[3] || 'http://127.0.0.1:8943', out = process.argv[4] || '/tmp/ball-hit';
require('fs').mkdirSync(out, { recursive: true });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function friend(code, name, look) {
  const f = { me: -1, player: null, playerId: -1, ws: null, seq: 0, pose: null, hits: [] };
  f.ws = new WebSocket(relay.replace(/^http/, 'ws').replace(/\/$/, '') + '/party/' + code + '/ws');
  f.ws.onopen = () => f.ws.send(JSON.stringify([P.C.Hello, P.PROTOCOL_VERSION, look, null, null, null, name]));
  f.ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m[0] === P.S.Welcome) { f.me = m[2]; const host = m[7].find((x) => x[3] === 1); if (host) f.playerId = host[0]; }
    if (m[0] === P.S.Caps) f.ws.send(JSON.stringify([P.C.Caps, m[1]]));
    if (m[0] === P.S.Hit) f.hits.push(m);
    if (m[0] === P.S.Poses) for (let k = 2; k < m.length; k += 9) if (m[k] === f.playerId) f.player = m.slice(k + 1, k + 9);
    if (m[0] === P.S.Live) for (let k = 0; k < m[2].length; k += 10) if (m[2][k] === f.playerId) f.player = m[2].slice(k + 1, k + 9);
  };
  f.send = (body) => { f.pose = body; f.ws.send(JSON.stringify([P.C.Pose, f.seq++, ...body])); };
  f.beat = setInterval(() => { if (f.ws.readyState === 1 && f.pose) f.send(f.pose); }, 1000);
  f.close = () => { clearInterval(f.beat); try { f.ws.close(); } catch { /* gone */ } };
  return f;
}
// glide a friend to (x, z) metres over ~2 s (the relay's speed check never drops a pose), then stand
async function glide(f, x, y, z, yaw, mode = P.Mode.Idle) {
  const x0 = f.pose ? f.pose[0] / 10 : x, z0 = f.pose ? f.pose[2] / 10 : z;
  for (let i = 1; i <= 20; i++) { const u = i / 20; f.send([Math.round((x0 + (x - x0) * u) * 10), Math.round(y * 10), Math.round((z0 + (z - z0) * u) * 10), yaw, 0, mode, 0, 0]); await wait(100); }
}

(async () => {
  const b = await chromium.launch({ channel: process.env.PW_CHANNEL || undefined, args: ['--mute-audio'] });
  let fail = 0; const ok = (c, msg) => { console.log((c ? 'ok   ' : 'FAIL ') + msg); if (!c) fail++; };
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
    ok(!!fa.player, 'friends see the game player');
    const me = await p.evaluate(() => { const f = window.__fi2; return { x: f.location.x, z: f.location.z, y: f.player.root.position.y, yaw: f.player.root.rotation.y }; });
    const fx = Math.sin(me.yaw), fz = Math.cos(me.yaw), ax = me.x + fx * 4, az = me.z + fz * 4, faceMe = Math.round(((me.yaw + Math.PI) / (Math.PI * 2)) * 256) & 255;
    await Promise.all([glide(fa, ax, me.y, az, faceMe), glide(fb, me.x - fz * 5, me.y, me.z + fx * 5, faceMe)]);
    await wait(1500);
    // (1) my kick knocks Ayako over
    const kick = () => p.evaluate(() => { const f = window.__fi2, yaw = f.player.root.rotation.y; f.walkBall.reset({ x: f.location.x, z: f.location.z, y: f.player.root.position.y, yaw }); f.walkBall.shoot({ x: f.location.x, z: f.location.z, y: f.player.root.position.y, yaw }, yaw, .05); });
    await kick();
    let shot = false, tumbled = 0, words = 0;
    for (let i = 0; i < 25; i++) {
      await wait(80);
      const [s, wv] = await p.evaluate(() => { let v = 0; window.__fi2.scene.traverse((o) => { if (o.name === 'ball-knock-word' && o.visible) v++; }); return [window.__fi2.party?.tumbling ?? -1, v]; });
      if (wv > 0) words++;
      if (s > 0) { tumbled++; if (!shot) { shot = true; await wait(150); await p.screenshot({ path: out + '/friend-knocked-over-phone.png' }); } }
    }
    ok(fa.hits.some((m) => m[2] === fa.me), 'the relay sent S.Hit for Ayako (to her client): ' + JSON.stringify(fa.hits));
    ok(fb.hits.some((m) => m[2] === fa.me), 'the other friend hears it too');
    ok(tumbled > 0, 'Ayako tumbles on the game screen (' + tumbled + ' samples)');
    ok(words > 0, 'an Oof! word pops over her (' + words + ' samples)');
    await wait(1500);
    const after = await p.evaluate(() => window.__fi2.party?.tumbling ?? -1);
    ok(after === 0, 'she is back up after the tumble');
    // (2) Leo's ball knocks ME over (his client detected it; the game trusts S.Hit only)
    fb.ws.send(JSON.stringify([P.C.Hit, fb.playerId, 40])); await wait(250);
    const mine = await p.evaluate(() => window.__fi2.meTumble.age);
    ok(mine >= 0, 'my own player tumbles on my screen (age ' + mine + ')');
    await wait(1400);
    ok((await p.evaluate(() => window.__fi2.meTumble.age)) < 0, 'and pops back up');
    // (3) Ayako busy (force field): a kick bounces off, nothing is sent
    await wait(4200); const before = fa.hits.length;
    fa.send([fa.pose[0], fa.pose[1], fa.pose[2], fa.pose[3], 0, P.Mode.Busy, 0, 0]); await wait(1500);
    await kick(); await wait(1800);
    ok(fa.hits.length === before, 'no knock-over inside the force field');
    // (4) Leo's kicked ball (his network ball, drawn here) rolls through a townsperson: MY screen knocks my own NPC over
    const npc = await p.evaluate(() => { const f = window.__fi2; let best = null, bd = 1e9; for (const e of f.islandNpcs.entries) { const d = Math.hypot(e.position.x - f.location.x, e.position.z - f.location.z); if (d > 6 && d < bd && !f.ballReactions.get('npc:' + e.id)) { bd = d; best = { id: e.id, x: e.position.x, y: e.position.y, z: e.position.z, d }; } } return best; });
    if (!npc || npc.d > 60) console.log('skip (4): no townsperson within 60 m');
    else {
      for (let i = 0; i <= 16; i++) { // 8 m/s through the NPC (it may wander: aimed at its spot each step), then it rests
        const at = await p.evaluate((id) => { const e = window.__fi2.islandNpcs.entries.find((q) => q.id === id); return { x: e.position.x, z: e.position.z }; }, npc.id);
        const sz = at.z, bx = at.x - 6 + Math.min(12, i * .8); fb.ws.send(JSON.stringify([P.C.Ball, P.BallState.Free, Math.round(bx * 10), Math.round((npc.y + .5) * 10), Math.round(sz * 10)])); await wait(100);
      }
      await wait(400);
      const knocked = await p.evaluate((id) => { const f = window.__fi2, e = f.islandNpcs.entries.find((q) => q.id === id); return !!f.ballReactions.get('npc:' + id) || null; }, npc.id);
      ok(knocked === true, "a friend's ball knocks my townsperson over (" + npc.id + ', ' + npc.d.toFixed(1) + ' m away)');
    }
    console.log('page errors:', errs.length ? errs.slice(0, 3).join(' ; ') : 'none'); if (errs.length) fail++;
    fa.close(); fb.close(); await ctx.close();
  } finally { await b.close(); }
  console.log(fail ? 'check-ball-hit-live: ' + fail + ' failures' : 'check-ball-hit-live: ok');
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
