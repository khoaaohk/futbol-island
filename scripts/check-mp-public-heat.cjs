// Public island heat (phase 1, Nov 11 2026, Agent D): what strangers cost to DRAW, on the phone profile (iPhone 13 viewport, CPU x4).
// SYNTHETIC strangers: the page joins a party on the dev relay (so its friend layer is live), then the dev-only hook
// (lib/graphics/remotePublic.ts devRegisterLayer, never in production) forces the public drawing rules and feeds N made-up strangers into
// the live layer's update (positions orbiting the player, 3..26 m; generated [colour, animal] names). Real world sockets are not used:
// the island does not connect to a world yet (the UI agent wires that). Measures, per N = 0 / 5 / 12 / 23 and per forced heat tier:
// draw calls and triangles of the rendered frame, and the friend layer's update() ms (script time); then a party of 19 friends
// (today's rules) for comparison, and 6 strangers in the Arcade room. Saves docs/qa/public-island-outdoor-23.png and -arcade-6.png.
// Needs: a dev relay  MP_PORT=8791 MP_DEV=1 MP_WORLD_OPEN=1 node multiplayer/dev-relay/server.mjs
//        a DEV server  NEXT_DIST_DIR=.next-agent-mpdraw NEXT_PUBLIC_MULTIPLAYER=1 NEXT_PUBLIC_PUBLIC_WORLD=1 NEXT_PUBLIC_MULTIPLAYER_URL=http://127.0.0.1:8791 npx next dev -p 8142
// Run:   PW_CHANNEL=chrome node --experimental-websocket scripts/check-mp-public-heat.cjs http://localhost:8142 http://127.0.0.1:8791 [--no-throttle]
const { chromium, devices } = require('playwright');
const path = require('path');
const { loadTs } = require('../multiplayer/dev-relay/loadTs.cjs');
const P = loadTs(path.join(__dirname, '../multiplayer/protocol/index.ts'));
const url = (process.argv[2] || 'http://localhost:8142').replace(/\/$/, ''), relay = (process.argv[3] || 'http://127.0.0.1:8791').replace(/\/$/, '');
if (/:8092\b/.test(url)) { console.error('never the owner\'s dev server (8092)'); process.exit(2); }
const ARCADE_ONLY = process.argv.includes("--arcade-only");
const THROTTLE = process.argv.includes('--no-throttle') ? 1 : 4;
const QA = path.join(__dirname, '../docs/qa');
function kidSlot(code) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(relay.replace(/^http/, 'ws') + '/party/' + code + '/ws');
    ws.onopen = () => ws.send(JSON.stringify([P.C.Hello, P.PROTOCOL_VERSION, [1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 2, 3], null, null]));
    ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m[0] === P.S.Welcome) { ws.close(1000); resolve(m[3]); } };
    setTimeout(() => reject(new Error('no welcome')), 8000);
  });
}
// In the page: wrap the newest friend layer's update (inject synthetic poses, time the real update).
function install(opts) {
  const H = window.__fi2PublicDraw; if (!H || !H.layers.length) return 'no layer';
  const L = H.layers[H.layers.length - 1];
  if (L.__synth) return 'ok';
  const S = window.__synth = { pub: true, ids: [], poses: new Map(), t: 0, ms: 0, n: 0, lx: opts.cx, lz: opts.cz, room: opts.room, R: opts.R };
  H.setPublicDrawSource({ isPublic: () => S.pub, nameIdx: (id) => (S.pub ? [[1, 4, 6, 2, 0, 5, 7, 14, 13, 12, 10, 8, 11, 17, 9][id % 15], id % 32] : null), hidden: () => false });
  const orig = L.update.bind(L);
  L.update = (dt, poses, cam, reduced, local, balls) => {
    if (local) { S.lx = local.x; S.lz = local.z; }
    S.t += dt;
    for (let i = 0; i < S.ids.length; i++) {
      const id = S.ids[i], p = S.poses.get(id), r = S.R[0] + (i * S.R[1]) % S.R[2], a = i * 2.39996 + S.t * (0.25 / Math.max(1, r / 6)) * (i % 2 ? 1 : -1);
      p.x = S.lx + Math.cos(a) * r; p.z = S.lz + Math.sin(a) * r; p.yaw = a + Math.PI / 2; p.speed = 1.2; p.mode = 1; poses.set(id, p);
    }
    const t0 = performance.now(); orig(dt, poses, cam, reduced, local, balls); S.ms += performance.now() - t0; S.n++;
  };
  L.__synth = true; window.__synthLayer = L;
  return 'ok';
}
function setCount(n, pub) {
  const S = window.__synth, L = window.__synthLayer;
  S.pub = pub;
  while (S.ids.length > n) { const id = S.ids.pop(); L.remove(id); S.poses.delete(id); }
  while (S.ids.length < n) {
    const id = 40 + S.ids.length;
    S.ids.push(id); S.poses.set(id, { x: S.lx, y: 0, z: S.lz, yaw: 0, speed: 0, mode: 1, zone: 0, fade: 1, flags: 0, activity: 0 });
    L.upsert(id, [1 + id % 3, id % 5, 2, 3, 4, 5, id % 7, 1, 2, 1, 2, 3], 'Nick' + id, { hex: ['#0072B2', '#E69F00', '#009E73', '#F0E442', '#D62828', '#7B3FA0', '#CC79A7', '#1B9AAA'][id % 8] });
  }
}
async function measure(p, info, wake) {
  await p.evaluate(() => { window.__synth.ms = 0; window.__synth.n = 0; });
  const calls = [], tris = [];
  for (let i = 0; i < 12; i++) { if (wake) await p.evaluate(wake); await p.waitForTimeout(250); const r = await p.evaluate(info); calls.push(r.calls); tris.push(r.triangles); }
  const s = await p.evaluate(() => ({ ms: window.__synth.ms / Math.max(1, window.__synth.n), n: window.__synth.n, d: window.__synthLayer.debugPublic(), rigs: window.__synthLayer.rigs, shown: window.__synthLayer.shown }));
  const med = (a) => a.slice().sort((x, y) => x - y)[a.length >> 1];
  return { calls: med(calls), tris: med(tris), updMs: +s.ms.toFixed(3), frames: s.n, rigs: s.rigs, shown: s.shown, rings: s.d.rings, near: s.d.ghostRings, labels: s.d.labels.length };
}
(async () => {
  const made = await (await fetch(relay + '/party', { method: 'POST' })).json();
  const token = await kidSlot(made.code);
  const sess = JSON.stringify({ code: made.code, resumeToken: token, at: Date.now() });
  const b = await chromium.launch({ channel: process.env.PW_CHANNEL || undefined, args: ['--mute-audio'] });
  const out = { throttle: THROTTLE, island: [], tiers: [], party19: null, arcade: null };
  try {
    const ctx = await b.newContext({ ...devices['iPhone 13'], viewport: { width: 390, height: 844 } });
    await ctx.addInitScript((s) => { try { localStorage.setItem('fi2-party-session-v1', s); } catch { /* none */ } }, sess);
    const p = await ctx.newPage();
    const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 300)); }); // verify pass: the dev overlay counts console errors too
    const cdp = await ctx.newCDPSession(p);
    if (!ARCADE_ONLY) {
    await p.goto(url + '/play', { waitUntil: 'domcontentloaded', timeout: 240000 });
    await p.waitForTimeout(8000);
    await p.click('text=Get my save code', { timeout: 20000 }).catch(() => {}); await p.waitForTimeout(2000);
    await p.click('button:has-text("Get my code")', { timeout: 8000 }).catch(() => {}); await p.waitForTimeout(1500);
    await p.click('button:has-text("I saved it")', { timeout: 8000 }).catch(() => {}); // the Nov 2026 "Before you start" sheet
    await p.click('button:has-text("Play")', { timeout: 8000 }).catch(() => {});
    await p.waitForFunction(() => !!window.__fi2?.scene, null, { timeout: 240000 });
    await p.waitForTimeout(9000);
    await p.click('button:has-text("Skip")', { timeout: 8000 }).catch(() => {}); await p.waitForTimeout(1200);
    for (let i = 0; i < 12; i++) { const r = await p.evaluate(() => { const f = window.__fi2; if (f.rideRef?.current !== 'walk') f.selectRide('walk'); return f.rideRef?.current; }); if (r === 'walk') break; await p.waitForTimeout(800); }
    await p.evaluate(() => window.__fi2.teleport(104, 40, 0));
    await p.waitForFunction(() => (window.__fi2PublicDraw?.layers?.length ?? 0) > 0, null, { timeout: 60000 });
    console.log('install', await p.evaluate(install, { cx: 104, cz: 40, room: false, R: [3, 1.0, 23] }));
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: THROTTLE });
    const info = () => { const r = window.__fi2.renderer.info.render; return { calls: r.calls, triangles: r.triangles }; };
    for (const n of [0, 5, 12, 23]) {
      await p.evaluate(`(${setCount.toString()})(${n}, true)`); await p.evaluate(() => window.__fi2.heat.force(0));
      await p.waitForTimeout(3500); const r = await measure(p, info); out.island.push({ n, ...r }); console.log('island', n, JSON.stringify(r));
      if (n === 23) await p.screenshot({ path: path.join(QA, 'public-island-outdoor-23.png') });
    }
    for (const t of [1, 2, 3, 4]) {
      await p.evaluate((t) => window.__fi2.heat.force(t), t); await p.waitForTimeout(2500);
      const r = await measure(p, info); out.tiers.push({ tier: t, ...r }); console.log('tier', t, JSON.stringify(r));
    }
    await p.evaluate(() => window.__fi2.heat.force(0)); await p.waitForTimeout(12000);
    // today's party of 20 (19 friends), party rules
    await p.evaluate(`(${setCount.toString()})(0, true)`); await p.waitForTimeout(1500);
    await p.evaluate(`(${setCount.toString()})(19, false)`); await p.waitForTimeout(3500);
    out.party19 = await measure(p, info); console.log('party19', JSON.stringify(out.party19));
    await p.evaluate(`(${setCount.toString()})(0, false)`); await p.waitForTimeout(1500);
    out.base = await measure(p, info);
    await p.evaluate(() => window.__fi2.heat.force(null));
    }
    // the Arcade: 6 strangers in the room (10 sent: the room cap draws the nearest 6)
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    await p.goto(url + '/arcade', { waitUntil: 'domcontentloaded', timeout: 240000 });
    await p.waitForFunction(() => !!window.__arcadeRoom?.state && (window.__fi2PublicDraw?.layers?.length ?? 0) > 0, null, { timeout: 180000 });
    await p.waitForTimeout(4000);
    const st = await p.evaluate(() => { const s = window.__arcadeRoom.state; return { x: s.x, z: s.z }; });
    console.log('arcade install', await p.evaluate(install, { cx: st.x ?? 0, cz: st.z ?? 0, room: true, R: [1.6, 0.55, 3.4] }));
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: THROTTLE });
    const ainfo = () => window.__arcadeRoom.state.render, wake = () => window.__arcadeRoom.holdPrompt(null);
    await p.evaluate(`(${setCount.toString()})(0, true)`); await p.waitForTimeout(1500);
    const a0 = await measure(p, ainfo, wake);
    await p.evaluate(`(${setCount.toString()})(6, true)`);
    for (let i = 0; i < 14; i++) { await p.evaluate(wake); await p.waitForTimeout(250); }
    const a6 = await measure(p, ainfo, wake);
    await p.screenshot({ path: path.join(QA, 'public-island-arcade-6.png') });
    await p.evaluate(`(${setCount.toString()})(10, true)`);
    for (let i = 0; i < 14; i++) { await p.evaluate(wake); await p.waitForTimeout(250); }
    const a10 = await measure(p, ainfo, wake);
    out.arcade = { none: a0, six: a6, tenSent: a10 }; console.log('arcade', JSON.stringify(out.arcade));
    out.errors = errs.slice(0, 12); out.errorCount = errs.length;
    await ctx.close();
  } finally { await b.close(); }
  console.log('RESULT ' + JSON.stringify(out));
})().catch((e) => { console.error(e); process.exit(1); });
