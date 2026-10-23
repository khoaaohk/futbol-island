// Headless check, multiplayer rooms (verifier pass, Oct 22 2026): the party ending while the player is INSIDE a room, and Battery
// saver in rooms. Per room a scripted host (raw socket, holds the host key) walks in that room; the player's slot is made by a second
// socket (Welcome -> resume token) and handed to the page through sessionStorage, as a reload would. (1) Battery saver on: no friend
// drawn and the room loop sleeps while the friend walks. (2) Saver off: the friend is drawn. (3) The host Ends the party (Konbini,
// Arcade) or kicks the player (Museum, Kit Shop): the chip goes, a note shows, no avatar / ring is left.
// Run: node --experimental-websocket scripts/check-mp-rooms-end.cjs <appUrl> <relayUrl> [outDir]
const { chromium } = require('playwright');
const path = require('path');
const { loadTs } = require('../multiplayer/dev-relay/loadTs.cjs');
const P = loadTs(path.join(__dirname, '../multiplayer/protocol/index.ts'));
const url = (process.argv[2] || 'http://localhost:8615').replace(/\/$/, ''), relay = (process.argv[3] || 'http://127.0.0.1:8616').replace(/\/$/, ''), out = process.argv[4] || '/tmp/mp-rooms-end';
require('fs').mkdirSync(out, { recursive: true });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const LOOK = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8];
const ROOMS = [
  { name: 'konbini', code: 8, page: '/konbini?door=main', st: 'window.__konbini?.state', sc: 'window.__konbini?.threeScene', end: 'end' },
  { name: 'museum', code: 6, page: '/museum', st: 'window.__museum?.state', sc: 'window.__museum?.threeScene', end: 'kick' },
  { name: 'arcade', code: 5, page: '/arcade', st: 'window.__arcadeRoom?.state', sc: 'window.__arcadeRoom?.threeScene', end: 'end' },
  { name: 'shop', code: 7, page: '/shop', st: 'window.__shop?.scene?.state', sc: 'window.__shop?.scene?.threeScene', end: 'kick' },
];
function sock(code, hostKey) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(relay.replace(/^http/, 'ws') + '/party/' + code + '/ws');
    const s = { ws, id: -1, token: null, send: (m) => ws.readyState === 1 && ws.send(JSON.stringify(m)) };
    ws.onopen = () => s.send([P.C.Hello, P.PROTOCOL_VERSION, LOOK, null, hostKey ?? null]);
    ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m[0] === P.S.Welcome) { s.id = m[2]; s.token = m[3]; resolve(s); } };
    ws.onerror = () => reject(new Error('socket'));
    setTimeout(() => reject(new Error('no welcome')), 8000);
  });
}

(async () => {
  let fail = 0;
  const bad = (m) => { fail++; console.log('FAIL:', m); };
  const b = await chromium.launch({ channel: process.env.PW_CHANNEL || undefined, args: ['--mute-audio'] });
  const errs = [];
  for (const r of ROOMS) {
    const made = await (await fetch(relay + '/party', { method: 'POST' })).json();
    const host = await sock(made.code, made.hostKey);
    // The host walks a slow circle in this room (a Warp first: the relay drops the jump from no pose otherwise... it is the first pose).
    let seq = 0, t = 0;
    const timer = setInterval(() => { t++; host.send([P.C.Pose, ++seq, ...P.roomBody([0, 0, 0, 0, 0, 0, 0, 0], r.code, -1 + 1.2 * Math.cos(t * 0.05), 0, 2 + 1.2 * Math.sin(t * 0.05), t * 0.05, P.Mode.Walk, t === 1 ? 1 : 0)]); }, 200);
    const kid = await sock(made.code); kid.ws.close(1000); await wait(300);
    const sess = JSON.stringify({ code: made.code, resumeToken: kid.token, at: Date.now() });
    const open = async (saver, vp) => {
      const ctx = await b.newContext({ viewport: vp ?? { width: 1280, height: 800 } });
      await ctx.addInitScript(([s, on]) => { try { sessionStorage.setItem('fi-party-session', s); if (on) localStorage.setItem('fi2-battery-saver', 'on'); } catch { /* none */ } }, [sess, saver]);
      const pg = await ctx.newPage(); pg.on('pageerror', (e) => errs.push(r.name + ': ' + e.message));
      await pg.goto(url + r.page, { waitUntil: 'domcontentloaded', timeout: 90000 });
      await pg.waitForFunction((ex) => !!eval(ex)?.party, r.st, { timeout: 60000 }).catch(() => bad(`${r.name}: no party layer`));
      await pg.waitForSelector('[data-room-party-chip]', { timeout: 30000 }).catch(() => bad(`${r.name}: no chip`));
      return { ctx, pg };
    };
    const probe = (pg) => pg.evaluate(([se, sc]) => { const s = eval(se), scene = eval(sc); let names = 0, rings = -1; scene?.traverse((o) => { if (o.name === 'remote-name' && o.visible) names++; if (o.name === 'remote-avatar-rings') rings = o.count; });
      return { frames: s?.frames ?? s?.draws ?? null, draws: s?.draws ?? null, shown: s?.party?.shown ?? null, drawn: (s?.party?.friends ?? []).filter((f) => !f.gone && f.fade > .9).length, names, rings, chip: !!document.querySelector('[data-room-party-chip]'), note: document.querySelector('[data-room-party-note]')?.textContent ?? null }; }, [r.st, r.sc]);

    // (1) Battery saver on.
    { const { ctx, pg } = await open(true); await pg.waitForTimeout(8000);
      const a = await probe(pg); await pg.waitForTimeout(3000); const c = await probe(pg);
      console.log(r.name, 'saver', JSON.stringify({ shown: c.shown, names: c.names, framesIn3s: c.frames !== null ? c.frames - a.frames : null, drawsIn3s: c.draws !== null ? c.draws - a.draws : null }));
      if (c.names > 0 || c.shown > 0) bad(`${r.name}: friends drawn with Battery saver on`);
      if (c.frames !== null && c.frames - a.frames > 6) bad(`${r.name}: the room loop runs with Battery saver on (${c.frames - a.frames} frames in 3 s)`);
      await ctx.close(); await wait(500); }
    // (2) Saver off: the friend is drawn; (3) the party ends / the player is kicked inside the room.
    { const { ctx, pg } = await open(false);
      for (let i = 0; i < 40 && (await probe(pg)).drawn < 1; i++) await pg.waitForTimeout(500);
      const a = await probe(pg); console.log(r.name, 'with friend', JSON.stringify(a)); if (a.drawn !== 1) bad(`${r.name}: the friend is not drawn`);
      if (r.end === 'end') host.send([P.C.End]); else host.send([P.C.Kick, kid.id]);
      await pg.waitForTimeout(2000);
      const c = await probe(pg); console.log(r.name, 'after ' + r.end, JSON.stringify(c));
      if (c.chip) bad(`${r.name}: chip still shown after ${r.end}`); if (c.names > 0 || c.rings > 0) bad(`${r.name}: avatars or rings left after ${r.end}`);
      if (!c.note) bad(`${r.name}: no note after ${r.end}`);
      const stored = await pg.evaluate(() => sessionStorage.getItem('fi-party-session'));
      if (stored) bad(`${r.name}: the stored session survived ${r.end}`);
      await pg.screenshot({ path: `${out}/${r.name}-after-${r.end}.png` });
      await ctx.close(); }
    clearInterval(timer); try { host.ws.close(1000); } catch { /* gone */ }
  }
  console.log('page errors:', errs.length ? errs.slice(0, 4).join(' ; ') : 'none');
  await b.close();
  console.log(fail ? `FAILED (${fail})` : 'PASS');
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
