// Headless check for ball-emote asks (Oct 23 2026, relay v1.4 Cap.EmoteAsk): the game starts a party, a scripted friend stands 3 m to the
// player's side and (1) asks to pass the ball: the card shows on the phone, Join starts the two-ball duet (the player's ball reaches the friend
// and the friend's ball is drawn from the shared routine); (2) the player asks to juggle: the friend gets S.EmoteAsk, says No, the player's
// juggle plays alone; asking again within the cooldown plays alone at once (a one-way S.Emote, no ask); (3) a friend's wave: no errors.
// Run: node --experimental-websocket scripts/check-emote-ask-live.cjs <appUrl> <relayUrl> [outDir]
//   (app with NEXT_PUBLIC_MULTIPLAYER=1 + NEXT_PUBLIC_MULTIPLAYER_URL=<relayUrl>; the relay must be v1.4; closes only its own browser)
const { chromium } = require('playwright');
const path = require('path');
const { loadTs } = require('../multiplayer/dev-relay/loadTs.cjs');
const P = loadTs(path.join(__dirname, '../multiplayer/protocol/index.ts'));
const url = process.argv[2] || 'http://localhost:8971', relay = process.argv[3] || 'http://127.0.0.1:8972', out = process.argv[4] || '/tmp/emote-ask';
require('fs').mkdirSync(out, { recursive: true });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function friend(code, name, look) {
  const f = { me: -1, pid: -1, player: null, ws: null, seq: 0, pose: null, got: [] };
  f.ws = new WebSocket(relay.replace(/^http/, 'ws').replace(/\/$/, '') + '/party/' + code + '/ws');
  f.ws.onopen = () => f.ws.send(JSON.stringify([P.C.Hello, P.PROTOCOL_VERSION, look, null, null, null, name]));
  f.ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m[0] === P.S.Welcome) { f.me = m[2]; for (const mi of m[7]) if (mi[0] !== f.me) f.pid = mi[0]; }
    if (m[0] === P.S.Caps) f.ws.send(JSON.stringify([P.C.Caps, m[1]]));
    if (m[0] === P.S.Poses) for (let k = 2; k < m.length; k += 9) if (m[k] !== f.me) f.player = m.slice(k + 1, k + 9);
    if (m[0] === P.S.Live) for (let k = 0; k < m[2].length; k += 10) if (m[2][k] !== f.me) f.player = m[2].slice(k + 1, k + 9);
    if (m[0] === P.S.EmoteAsk || m[0] === P.S.EmoteAnswer || m[0] === P.S.Duet || m[0] === P.S.Emote) f.got.push(m);
  };
  f.send = (body) => { f.pose = body; f.ws.send(JSON.stringify([P.C.Pose, f.seq++, ...body])); };
  f.raw = (m) => f.ws.send(JSON.stringify(m));
  f.beat = setInterval(() => { if (f.ws.readyState === 1 && f.pose) f.send(f.pose); }, 1000);
  f.close = () => { clearInterval(f.beat); try { f.ws.close(); } catch { /* gone */ } };
  return f;
}

(async () => {
  const b = await chromium.launch({ channel: process.env.PW_CHANNEL || undefined, args: ['--mute-audio'] });
  let fail = 0; const bad = (m) => { fail++; console.log('FAIL: ' + m); };
  try {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }), p = await ctx.newPage();
    const errs = []; p.on('pageerror', (e) => errs.push(e.message));
    await p.goto(url, { timeout: 300000 }); await p.waitForTimeout(6000);
    await p.click('text=Get my save code').catch(() => {}); await p.waitForTimeout(2000);
    await p.click('button:has-text("Play")').catch(() => {});
    await p.waitForFunction(() => window.__fi2 && window.__fi2.selectRide, null, { timeout: 300000 }); await p.waitForTimeout(3000);
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
    const fa = friend(code, 'Ayako', [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8]);
    await p.click('[data-party-sheet] button:has-text("Done")').catch(() => {}); await p.waitForTimeout(1500);
    await p.keyboard.down('ArrowUp'); await p.waitForTimeout(250); await p.keyboard.up('ArrowUp'); await p.waitForTimeout(1500);
    const me = await p.evaluate(() => { const f = window.__fi2; return { x: f.location.x, z: f.location.z, y: f.player.root.position.y, yaw: f.player.root.rotation.y }; });
    const rx = Math.cos(me.yaw), rz = -Math.sin(me.yaw), fx = me.x + rx * 3.1, fz = me.z + rz * 3.1, fyaw = Math.round((Math.atan2(me.x - fx, me.z - fz) / (Math.PI * 2)) * 256) & 255;
    for (let i = 0; i < 12; i++) { fa.send([Math.round(fx * 10), Math.round(me.y * 10), Math.round(fz * 10), fyaw, 0, P.Mode.Idle, 0, 0]); await wait(120); }
    await wait(1500);
    if (fa.pid < 0) bad('friend does not know the player id');

    // (1) the friend asks; the card shows; Join starts the two-ball pass
    fa.raw([P.C.EmoteAsk, fa.pid, P.Emote.PassBall]);
    const card = await p.waitForSelector('[data-emote-ask]', { timeout: 4000 }).catch(() => null);
    if (!card) bad('no ask card on the receiver');
    else {
      const text = (await card.textContent()).replace(/\s+/g, ' ');
      console.log('card:', text);
      if (!/Ayako wants to pass the ball/.test(text)) bad('card text');
      await p.waitForTimeout(450); await p.screenshot({ path: out + '/ask-card-phone.png' });
      const before = await p.evaluate(() => window.__fi2.emoteFx.kind);
      if (before !== -1) bad('the receiver moved before tapping Join');
      await p.click('[data-emote-ask-join]');
      await p.waitForTimeout(400);
      const st = await p.evaluate(() => ({ fx: window.__fi2.emoteFx, duet: window.__fi2.duet }));
      console.log('after Join:', JSON.stringify(st));
      if (st.fx.kind !== 6 || !st.duet.on) bad('the duet did not start on the receiver');
      if (!fa.got.some((m) => m[0] === P.S.Duet)) bad('the asker got no S.Duet');
      let minToFriend = 99, remoteBalls = 0, shot = false;
      for (let i = 0; i < 40; i++) {
        const s = await p.evaluate(() => { const f = window.__fi2, sc = f.scene; let n = 0; sc.traverse((o) => { if (o.name === 'remote-ball' && o.visible) n++; }); return { bx: f.ball.position.x, bz: f.ball.position.z, n, kind: f.emoteFx.kind, age: f.emoteFx.age }; });
        minToFriend = Math.min(minToFriend, Math.hypot(s.bx - fx, s.bz - fz)); remoteBalls = Math.max(remoteBalls, s.n);
        if (!shot && s.age > 1.15) { shot = true; await p.screenshot({ path: out + '/two-ball-pass-phone.png' }); }
        if (s.kind < 0) break;
        await wait(150);
      }
      console.log('two-ball pass: my ball came within', minToFriend.toFixed(2), 'm of the friend; friend balls drawn', remoteBalls);
      if (minToFriend > 1.2) bad('my ball never reached the friend');
      if (remoteBalls < 1) bad("the friend's own ball was not drawn");
    }
    await wait(2500);
    // (2) the player asks to juggle; the friend says No; then the cooldown plays alone at once
    fa.got.length = 0;
    await p.evaluate(() => window.__fi2.emote(3)); await wait(600);
    const ask = fa.got.find((m) => m[0] === P.S.EmoteAsk);
    if (!ask || ask[1] !== fa.pid || ask[2] !== 3) bad('the friend got no S.EmoteAsk for Juggle with me');
    const waiting = await p.evaluate(() => window.__fi2.emoteFx.kind);
    if (waiting !== -1) bad('the juggle played before the answer');
    fa.raw([P.C.EmoteAnswer, fa.pid, 0]); await wait(500);
    const alone = await p.evaluate(() => window.__fi2.emoteFx.kind);
    console.log('after No: my emote', alone);
    if (alone !== 3) bad('after a No the juggle did not play alone');
    await wait(7000); fa.got.length = 0;
    await p.evaluate(() => window.__fi2.emote(6)); await wait(600);
    const k2 = await p.evaluate(() => window.__fi2.emoteFx.kind);
    console.log('cooldown pick: my emote', k2, 'friend got', JSON.stringify(fa.got));
    if (k2 !== 6 || fa.got.some((m) => m[0] === P.S.EmoteAsk) || !fa.got.some((m) => m[0] === P.S.Emote)) bad('the cooldown pick should play alone at once, one-way');
    // (3) a friend's one-way wave: shown, no errors
    await wait(8000); fa.raw([P.C.Emote, P.Emote.Wave]); await wait(800);
    console.log('page errors:', errs.length ? errs.slice(0, 3).join(' ; ') : 'none'); if (errs.length) fail++;
    fa.close(); await ctx.close();
  } finally { await b.close(); }
  console.log(fail ? 'check-emote-ask-live: ' + fail + ' failures' : 'check-emote-ask-live: ok');
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
