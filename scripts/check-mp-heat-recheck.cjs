// Heat recheck, multiplayer (Oct 22 2026): the friend-rig cap now follows the heat tier DURING a party (lib/graphics/rigCap.ts), not
// only when a friend is first admitted. Six bots walk round a phone player on the island; the tier is forced down and back up through
// window.__fi2.heat.force and the drawn rigs (__fi2.partyHeat(): shown + rigs alive) must follow 5 -> 3 -> 1 -> 0, wait ~10 s on the
// way back up, not thrash on a flapping tier, and never leak (rigs alive == the cap once settled). Page errors fail the run.
// Needs: a dev relay  MP_PORT=<relay port> MP_DEV=1 node multiplayer/dev-relay/server.mjs
//        a production build with NEXT_PUBLIC_MULTIPLAYER=1 NEXT_PUBLIC_MULTIPLAYER_URL=<relay url>, served by `next start -p <app port>`.
// Run:   PW_CHANNEL=chrome node --experimental-websocket scripts/check-mp-heat-recheck.cjs <appUrl> <relayUrl>   (OUT=/tmp/mp-heat)
const { chromium, devices } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { loadTs } = require('../multiplayer/dev-relay/loadTs.cjs');
const P = loadTs(path.join(__dirname, '../multiplayer/protocol/index.ts'));
const url = (process.argv[2] || 'http://localhost:8641').replace(/\/$/, ''), relay = (process.argv[3] || 'http://127.0.0.1:8642').replace(/\/$/, '');
const OUT = process.env.OUT || '/tmp/mp-heat';
fs.mkdirSync(OUT, { recursive: true });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
let fail = 0;
const rec = (ok, what, detail = '') => { if (!ok) fail++; console.log(`${ok ? 'PASS' : 'FAIL'} ${what} ${detail}`); };
function kidSlot(code) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(relay.replace(/^http/, 'ws') + '/party/' + code + '/ws');
    ws.onopen = () => ws.send(JSON.stringify([P.C.Hello, P.PROTOCOL_VERSION, [1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 2, 3], null, null]));
    ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m[0] === P.S.Welcome) { ws.close(1000); resolve(m[3]); } };
    setTimeout(() => reject(new Error('no welcome')), 8000);
  });
}
(async () => {
  const made = await (await fetch(relay + '/party', { method: 'POST' })).json();
  // Bots walk 6 m circles round (100 + 1.5 i, 50) m.
  const bots = spawn('node', ['--experimental-websocket', 'multiplayer/bots/bot.mjs', '--url', relay, '--code', made.code, '--n', '6', '--spread', '15', '--ms', '400000'], { stdio: 'ignore' });
  await wait(1500);
  const token = await kidSlot(made.code);
  const sess = JSON.stringify({ code: made.code, resumeToken: token, at: Date.now() });
  const b = await chromium.launch({ channel: process.env.PW_CHANNEL || undefined, args: ['--mute-audio'] });
  const errs = [];
  try {
    const ctx = await b.newContext({ ...devices['iPhone 13'], viewport: { width: 390, height: 844 } });
    await ctx.addInitScript((s) => { try { localStorage.setItem('fi2-party-session-v1', s); } catch { /* none */ } }, sess);
    const p = await ctx.newPage();
    p.on('pageerror', (e) => errs.push(e.message));
    await p.goto(url + '/', { waitUntil: 'domcontentloaded', timeout: 120000 });
    await p.waitForTimeout(6000);
    await p.click('text=Get my save code', { timeout: 20000 }).catch(() => {}); await p.waitForTimeout(2000);
    await p.click('button:has-text("Play")', { timeout: 8000 }).catch(() => {});
    await p.waitForFunction(() => !!window.__fi2?.scene, null, { timeout: 90000 });
    await p.waitForTimeout(9000);
    await p.click('button:has-text("Skip")', { timeout: 8000 }).catch(() => {}); await p.waitForTimeout(1200);
    for (let i = 0; i < 12; i++) { const r = await p.evaluate(() => { const f = window.__fi2; if (f.rideRef?.current !== 'walk') f.selectRide('walk'); return f.rideRef?.current; }); if (r === 'walk') break; await p.waitForTimeout(800); }
    const place = () => p.evaluate(() => { const f = window.__fi2; f.teleport(104, 40, 0); });
    const heat = () => p.evaluate(() => window.__fi2.partyHeat?.() ?? null);
    const force = (t) => p.evaluate((t) => window.__fi2.heat.force(t), t);
    const settle = async (ms) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { await place(); await p.waitForTimeout(500); } };
    await force(0); await place();
    let ok = false; for (let i = 0; i < 60 && !ok; i++) { await settle(1000); const h = await heat(); ok = !!h && h.rigs >= 5; }
    let h = await heat();
    rec(ok, 'tier 0: five friends drawn as rigs (6 bots, 1 ring-only)', JSON.stringify(h));
    await p.screenshot({ path: `${OUT}/1-tier0.png` });
    const steps = [];
    for (const [t, cap] of [[2, 3], [3, 1], [4, 0]]) {
      await force(t); await settle(2500); h = await heat(); steps.push([t, h]);
      rec(h && h.rigs === cap && h.shown <= cap, `tier ${t} mid-party: rigs follow the cap ${cap} within ~2 s (demoted, released)`, JSON.stringify(h));
      if (t === 3) await p.screenshot({ path: `${OUT}/2-tier3.png` });
    }
    // Recovery: tier 0 again. Not before ~10 s (hysteresis), then the nearest five are re-admitted.
    await force(0); await settle(5000); h = await heat();
    rec(h && h.rigs === 0, 'recovery: still 0 rigs 5 s after the tier recovered (10 s hold)', JSON.stringify(h));
    await settle(8000); h = await heat();
    rec(h && h.rigs === 5, 'recovery: 5 rigs ~12 s after the tier recovered', JSON.stringify(h));
    await p.screenshot({ path: `${OUT}/3-recovered.png` });
    // Flapping 3 <-> 0 every second for 15 s: after the first drop to 1, nothing is re-made.
    const flap = [];
    for (let i = 0; i < 15; i++) { await force(i % 2 ? 0 : 3); await place(); await p.waitForTimeout(1000); flap.push((await heat())?.rigs); }
    rec(flap.slice(2).every((n) => n === 1), 'flapping tier 3 <-> 0 (1 s): rigs stay at 1 (no thrash)', JSON.stringify(flap));
    await force(null);
    const mem = await p.evaluate(() => window.__fi2.renderer.info.memory);
    rec(errs.length === 0, 'no page errors', JSON.stringify(errs.slice(0, 3)));
    console.log('memory', JSON.stringify(mem), 'steps', JSON.stringify(steps));
    await ctx.close();
  } finally {
    await b.close();
    bots.kill('SIGTERM');
  }
  console.log(fail ? `FAILED ${fail}` : 'ALL PASS');
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
