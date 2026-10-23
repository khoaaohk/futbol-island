// Heat sanity, multiplayer rooms (verifier pass, Oct 22 2026): six bot friends walking in ONE room, per room, desktop and phone.
// Reports friends drawn (the layer caps 5/5/3/1/0 by tier, Battery saver 0), layer update ms, render ms with / without friends,
// draw calls, and the real frame cadence over 3 s. The player's slot is handed to the page through sessionStorage (as a reload).
// Run: node --experimental-websocket scripts/check-mp-rooms-heat.cjs <appUrl> <relayUrl>
const { chromium, devices } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const { loadTs } = require('../multiplayer/dev-relay/loadTs.cjs');
const P = loadTs(path.join(__dirname, '../multiplayer/protocol/index.ts'));
const url = (process.argv[2] || 'http://localhost:8615').replace(/\/$/, ''), relay = (process.argv[3] || 'http://127.0.0.1:8616').replace(/\/$/, '');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const ROOMS = [
  { name: 'konbini', code: 8, page: '/konbini?door=main', w: 'window.__konbini', st: 'window.__konbini?.state' },
  { name: 'museum', code: 6, page: '/museum', w: 'window.__museum', st: 'window.__museum?.state' },
  { name: 'arcade', code: 5, page: '/arcade', w: 'window.__arcadeRoom', st: 'window.__arcadeRoom?.state' },
  { name: 'shop', code: 7, page: '/shop', w: 'window.__shop.scene', st: 'window.__shop?.scene?.state' },
];
function kidSlot(code) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(relay.replace(/^http/, 'ws') + '/party/' + code + '/ws');
    ws.onopen = () => ws.send(JSON.stringify([P.C.Hello, P.PROTOCOL_VERSION, [1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 2, 3], null, null]));
    ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m[0] === P.S.Welcome) { ws.close(1000); resolve(m[3]); } };
    setTimeout(() => reject(new Error('no welcome')), 8000);
  });
}
(async () => {
  const b = await chromium.launch({ channel: process.env.PW_CHANNEL || undefined, args: ['--mute-audio'] });
  for (const r of ROOMS) {
    const made = await (await fetch(relay + '/party', { method: 'POST' })).json();
    const bots = spawn('node', ['--experimental-websocket', 'multiplayer/bots/bot.mjs', '--url', relay, '--code', made.code, '--n', '6', '--spread', '0', '--ms', '200000',
      '--room', String(r.code), '--room-after', '500', '--walk', '60000', '--stand', '1000'], { stdio: 'ignore' });
    await wait(1500);
    const token = await kidSlot(made.code);
    const sess = JSON.stringify({ code: made.code, resumeToken: token, at: Date.now() });
    for (const kind of ['desktop', 'phone']) {
      const ctx = await b.newContext(kind === 'phone' ? { ...devices['iPhone 13'], viewport: { width: 390, height: 844 } } : { viewport: { width: 1280, height: 800 } });
      await ctx.addInitScript((s) => { try { sessionStorage.setItem('fi-party-session', s); } catch { /* none */ } }, sess);
      const pg = await ctx.newPage();
      await pg.goto(url + r.page, { waitUntil: 'domcontentloaded', timeout: 90000 });
      await pg.waitForFunction((ex) => (eval(ex)?.party?.friends ?? []).filter((f) => f.fade > .9).length >= 6, r.st, { timeout: 60000 }).catch(() => {});
      await pg.waitForTimeout(3000);
      const res = await pg.evaluate(async ([w, se]) => {
        const s0 = eval(se), W = eval(w);
        const a = { frames: s0.frames ?? s0.draws, t: performance.now() };
        await new Promise((ok) => setTimeout(ok, 3000));
        const s1 = eval(se);
        const fps = ((s1.frames ?? s1.draws) - a.frames) / ((performance.now() - a.t) / 1000);
        const m = W.measureParty?.(60) ?? null, rr = W.measureRender?.(30) ?? null;
        return { sampled: s1.party?.friends?.length, shown: s1.party?.shown, fps: +fps.toFixed(1), frameMs: s1.frameMs ?? s1.cadence ?? null, calls: s1.render?.calls ?? null,
          update: m?.update != null ? +m.update.toFixed(3) : null, renderWith: m?.renderWith != null ? +m.renderWith.toFixed(3) : rr != null ? +rr.toFixed(3) : null,
          renderWithout: m?.renderWithout != null ? +m.renderWithout.toFixed(3) : null, callsWith: m?.calls ?? null, callsWithout: m?.callsWithout ?? null };
      }, [r.w, r.st]).catch((e) => ({ error: e.message }));
      console.log(r.name, kind, JSON.stringify(res));
      await ctx.close(); await wait(500);
    }
    bots.kill('SIGTERM');
  }
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
