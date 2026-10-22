// Scripted multiplayer bots. Needs a WebSocket client: `node --experimental-websocket` on Node 20.
//   node --experimental-websocket multiplayer/bots/bot.mjs --url http://127.0.0.1:8790 --code K7MQ4R --n 3 \
//        [--path circle|line] [--cheat speed|flood|bounds] [--host-key KEY] [--ms 3000] [--spread 300]
// --n up to 20 (the party cap). --spread = decimetres between bots along X (default 0: everyone on one spot), to exercise interest management.
// Each bot also counts its received frames (msgs, bytes, poseFrames, poseEntries) so a run can report messages per second.
// Prints one JSON line: { bots: [ { id, welcomed, seen, posesFrom, maxXFrom, errors, closeCode, ... } ] }
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { loadTs } = require('../dev-relay/loadTs.cjs');
const here = path.dirname(fileURLToPath(import.meta.url));
const P = loadTs(path.join(here, '../protocol/index.ts'));
const { C, S, PROTOCOL_VERSION, Mode, Zone } = P;

const LOOK = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8];
const wsUrl = (url, code) => url.replace(/^http/, 'ws').replace(/\/$/, '') + '/party/' + code + '/ws';

function runBot({ url, code, path: shape = 'circle', cheat = null, hostKey = null, ms = 3000, index = 0, spread = 0 }) {
  return new Promise((resolve) => {
    const out = {
      index, cheat, welcomed: false, id: -1, host: false, token: null, seen: 0, posesFrom: [], maxXFrom: {}, errors: [],
      closeCode: null, ended: null, left: [], sent: 0, msgs: 0, bytes: 0, poseFrames: 0, poseEntries: 0, maxFrame: 0,
    };
    const seen = new Set();
    const posesFrom = new Set();
    let ws, timer, seq = 0, t = 0, done = false;
    const finish = () => {
      if (done) return;
      done = true;
      clearInterval(timer);
      out.seen = seen.size;
      out.posesFrom = [...posesFrom];
      resolve(out);
    };
    const send = (arr) => { if (ws.readyState === 1) { ws.send(JSON.stringify(arr)); out.sent++; } };
    const pose = () => {
      t++;
      seq++;
      let x, z;
      if (shape === 'line') { const k = t % 100; x = 1000 + index * spread + (k < 50 ? k : 100 - k) * 4; z = 500; }
      else { x = 1000 + index * spread + Math.round(60 * Math.cos(t * 0.1)); z = 500 + Math.round(60 * Math.sin(t * 0.1)); }
      if (cheat === 'speed' && t % 5 === 0) x = 9000; // 800 m in 200 ms
      if (cheat === 'bounds' && t > 2) x = 99999; // outside WORLD_BOUNDS
      send([C.Pose, seq, x, 0, z, (t * 3) & 255, 8, Mode.Walk, Zone.Main, 0]);
    };
    try { ws = new WebSocket(wsUrl(url, code)); } catch (e) { out.errors.push('connect'); finish(); return; }
    ws.onopen = () => send([C.Hello, PROTOCOL_VERSION, LOOK, null, hostKey]);
    ws.onerror = () => { out.errors.push('socket'); };
    ws.onclose = (ev) => { out.closeCode = ev.code; finish(); };
    ws.onmessage = (ev) => {
      let m;
      out.msgs++; out.bytes += ev.data.length; out.maxFrame = Math.max(out.maxFrame, ev.data.length);
      try { m = JSON.parse(ev.data); } catch { return; }
      switch (m[0]) {
        case S.Welcome:
          out.welcomed = true; out.id = m[2]; out.token = m[3];
          for (const mi of m[7]) { if (mi[0] !== out.id) seen.add(mi[0]); if (mi[0] === out.id) out.host = mi[3] === 1; }
          if (cheat === 'flood') { for (let i = 0; i < 80; i++) send([C.Beat, i]); }
          timer = setInterval(pose, 200);
          setTimeout(() => { try { ws.close(1000); } catch { /* ignore */ } setTimeout(finish, 300); }, ms);
          break;
        case S.Joined: if (m[1][0] !== out.id) seen.add(m[1][0]); break;
        case S.Left: out.left.push(m[1]); break;
        case S.Poses:
          out.poseFrames++; out.poseEntries += (m.length - 2) / 9;
          for (let i = 2; i + 8 < m.length + 0; i += 9) {
            const id = m[i];
            posesFrom.add(id);
            out.maxXFrom[id] = Math.max(out.maxXFrom[id] ?? -1e9, m[i + 1]);
          }
          break;
        case S.Error: out.errors.push(m[1]); break;
        case S.Ended: out.ended = m[1]; break;
        default: break;
      }
    };
    setTimeout(finish, ms + 4000); // hard stop: never hang
  });
}

export async function runBots({ n = 1, stagger = 40, ...opts }) {
  const jobs = [];
  for (let i = 0; i < n; i++) {
    jobs.push(new Promise((r) => setTimeout(r, i * stagger)).then(() => runBot({ ...opts, index: i, hostKey: i === 0 ? opts.hostKey ?? null : null })));
  }
  return Promise.all(jobs);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  if (typeof WebSocket === 'undefined') { console.error('run with: node --experimental-websocket'); process.exit(2); }
  const a = process.argv.slice(2);
  const get = (k, d) => { const i = a.indexOf('--' + k); return i >= 0 ? a[i + 1] : d; };
  const bots = await runBots({
    url: get('url', 'http://127.0.0.1:8790'), code: get('code'), n: Number(get('n', 1)), path: get('path', 'circle'),
    cheat: get('cheat', null), hostKey: get('host-key', null), ms: Number(get('ms', 3000)), spread: Number(get('spread', 0)),
  });
  console.log(JSON.stringify({ bots: bots.map((b) => ({ ...b, token: undefined })) }));
}
