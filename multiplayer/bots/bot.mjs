// Scripted multiplayer bots. Needs a WebSocket client: `node --experimental-websocket` on Node 20.
//   node --experimental-websocket multiplayer/bots/bot.mjs --url http://127.0.0.1:8790 --code K7MQ4R --n 3 \
//        [--path circle|line] [--cheat speed|flood|bounds] [--host-key KEY] [--ms 3000] [--spread 300]
//        [--room 8 --room-after 6000 --walk 6000 --stand 6000 --emote-every 7000] [--busy-at 3.1,-4.2 --busy-after 20000 --busy-for 30000]
// --room: after --room-after ms on the island the bot walks into that room (docs/multiplayer-rooms-design.md 2.2: room poses with
// the entry Warp + one retry 5.5 s later), walking --walk ms then standing --stand ms in turn, and sends a Wave every --emote-every ms.
// --n up to 20 (the party cap). --spread = decimetres between bots along X (default 0: everyone on one spot), to exercise interest management.
// Each bot also counts its received frames (msgs, bytes, poseFrames, poseEntries) so a run can report messages per second.
// Prints one JSON line: { bots: [ { id, welcomed, seen, posesFrom, maxXFrom, errors, closeCode, ... } ] }
// Relay v2.0 public worlds:
//   node --experimental-websocket multiplayer/bots/bot.mjs --world --url http://127.0.0.1:8790 --n 24 --ms 60000 [--devip p1]
//        [--spread 3000] [--speed 1.5] [--emote-every 7000] [--follow 2] [--report] [--nick Emma] [--summary] [--room 5 [--room-at 1,2]]
// --room R (world): the bots stand in room R (Arcade 5, Museum 6, Shop 7, Konbini 8, Cay Konbini 32) and send room poses
// (roomBody: Zone.Indoors, y in the room band, the room code in the speed byte; the first pose is a Warp), wandering inside
// lib/multiplayer/roomPos.ts ROOM_BOUNDS (kept 1 m in), or standing within ~1 m of --room-at x,z (room-local metres).
// --in S (world): ask the lobby with ?in=S (rejoin semantics: stay in world S while it has fewer than WORLD_HARD), to fill one world past the soft cap.
// --world: each bot asks GET /world (fill-first), joins /world/:shard/ws, answers S.Caps, wanders (random heading, --speed m/s,
// starting within --spread dm of (100 m, 50 m)), drops to 2 Hz poses while S.Quiet says 0, and waves every --emote-every ms.
// --devip: label for ?devip= (the dev relay counts each bot as its own address only with MP_DEV=1). --follow N: the first N bots
// stick ~2 m behind the nearest stranger they can see (the relay's following guard should hide them). --report: a bot reports
// (Following) anyone who stays within 4 m of it for 10 s. --nick: sends a 7-element Hello with that name (the relay must drop it).
// --summary: print totals instead of every bot (msgs in / out, largest frame, shards, far / joined counts, strings seen).
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { loadTs } = require('../dev-relay/loadTs.cjs');
const here = path.dirname(fileURLToPath(import.meta.url));
const P = loadTs(path.join(here, '../protocol/index.ts'));
const { C, S, PROTOCOL_VERSION, Mode, Zone, Emote, roomBody, roomOf } = P;

const LOOK = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8];
const wsUrl = (url, code) => url.replace(/^http/, 'ws').replace(/\/$/, '') + '/party/' + code + '/ws';

const running = []; // live reports, printed early on SIGTERM (a check that ends before --ms)
function runBot({ url, code, path: shape = 'circle', cheat = null, hostKey = null, ms = 3000, index = 0, spread = 0, room = -1, roomAfter = 0, walk = 6000, stand = 6000, emoteEvery = 0, busyAt = null, busyAfter = 0, busyFor = 0 }) {
  return new Promise((resolve) => {
    const out = {
      index, cheat, welcomed: false, id: -1, host: false, token: null, seen: 0, posesFrom: [], maxXFrom: {}, errors: [],
      closeCode: null, ended: null, left: [], sent: 0, msgs: 0, bytes: 0, poseFrames: 0, poseEntries: 0, maxFrame: 0,
      roomFrom: {}, emotesFrom: {}, emotesSent: 0, busyFrom: {},
    };
    let t0 = 0, roomWarps = 0;
    const seen = new Set();
    const posesFrom = new Set();
    running.push(() => ({ ...out, seen: seen.size, posesFrom: [...posesFrom], token: undefined }));
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
      const el = Date.now() - t0;
      if (room >= 0 && el >= roomAfter) { // inside the room: walk a line in front of the door, then stand still, in turn
        const r = el - roomAfter, cyc = r % (walk + stand), walking = cyc < walk, k = Math.min(cyc, walk) / 1000;
        // --busy-at: Busy (an arcade game, an overlay) at a room-local spot for --busy-for ms after --busy-after ms in the room.
        if (busyAt && r >= busyAfter && (!busyFor || r < busyAfter + busyFor)) {
          if (out.lastBusy && r - out.busySentAt < 2000) return; // repeated every 2 s (a dropped first pose must not lose the state)
          const first = !out.lastBusy;
          out.lastBusy = true; out.lastStill = false; out.busySentAt = r;
          send([C.Pose, seq, ...roomBody([0, 0, 0, 0, 0, 0, 0, 0], room, busyAt[0], 0, busyAt[1], Math.PI, Mode.Busy, first ? 1 : 0)]); // first: a Warp (the relay drops a multi-metre jump)
          out.wasBusy = true;
          return;
        }
        out.lastBusy = false;
        const x = -1.5 + 2.2 * Math.sin(k * 0.9), z = 2.4 + 0.8 * Math.cos(k * 0.6);
        const warp = roomWarps === 0 || (roomWarps === 1 && r >= 5500) || out.wasBusy ? 1 : 0; if (warp) roomWarps++; out.wasBusy = false;
        const b = roomBody([0, 0, 0, 0, 0, 0, 0, 0], room, x, 0, z, walking ? k * 0.9 : 0.6, walking ? Mode.Walk : Mode.Idle, warp);
        if (!walking && !warp && out.lastStill) return; // standing: send once, like the client's delta suppression
        out.lastStill = !walking;
        send([C.Pose, seq, ...b]);
        if (emoteEvery > 0 && r - (out.lastEmoteAt ?? -1e9) >= emoteEvery) { out.lastEmoteAt = r; send([C.Emote, Emote.Wave]); out.emotesSent++; }
        return;
      }
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
          if (cheat === 'flood') { for (let i = 0; i < 300; i++) send([C.Beat, i]); } // past the relay's FLOOD_BURST (120, Nov 5 2026)
          t0 = Date.now(); timer = setInterval(pose, 200);
          setTimeout(() => { try { ws.close(1000); } catch { /* ignore */ } setTimeout(finish, 300); }, ms);
          break;
        case S.Joined: if (m[1][0] !== out.id) seen.add(m[1][0]); break;
        case S.Left: out.left.push(m[1]); break;
        case S.Poses:
          out.poseFrames++; out.poseEntries += (m.length - 2) / 9;
          for (let i = 2; i + 8 < m.length + 0; i += 9) {
            const id = m[i];
            posesFrom.add(id);
            const rm = roomOf(m.slice(i + 1, i + 9)); if (rm >= 0) out.roomFrom[id] = rm;
            if (rm >= 0 && m[i + 6] === Mode.Busy) { const l = (out.busyFrom[id] ??= []), x = m[i + 1] / 10, z = m[i + 3] / 10, k = l[l.length - 1]; if (!k || k[0] !== x || k[1] !== z) { l.push([x, z]); if (l.length > 20) l.shift(); } } // every Busy spot seen
            out.maxXFrom[id] = Math.max(out.maxXFrom[id] ?? -1e9, m[i + 1]);
          }
          break;
        case S.Emote: out.emotesFrom[m[1]] = (out.emotesFrom[m[1]] ?? 0) + 1; break;
        case S.Error: out.errors.push(m[1]); break;
        case S.Ended: out.ended = m[1]; break;
        default: break;
      }
    };
    setTimeout(finish, ms + 4000); // hard stop: never hang
  });
}

const STRINGS_OK = (v, token) => { // every string in a world frame must be a protocol token (the resume token): never a name
  const bad = [];
  const walk = (x) => { if (typeof x === 'string') { if (x !== token) bad.push(x); } else if (Array.isArray(x)) x.forEach(walk); };
  walk(v);
  return bad;
};

function runWorldBot({ url, ms = 3000, index = 0, spread = 3000, speed = 1.5, emoteEvery = 0, follow = 0, report = false, nick = null, devip = 'bot', room = -1, roomAt = null, inShard = 0 }) {
  return new Promise((resolve) => {
    const out = { index, world: true, room, shard: -1, welcomed: false, id: -1, errors: [], closeCode: null, sent: 0, msgs: 0, bytes: 0, maxFrame: 0,
      joined: 0, far: 0, left: 0, emotesFrom: 0, emotesSent: 0, reportsSent: 0, quiet: [], worldN: [], strings: [], liveFrames: 0, poseEntries: 0, follower: index < follow };
    running.push(() => ({ ...out }));
    const label = devip + '-' + index;
    const others = new Map(); // id -> [x, z] (decimetres)
    const close = new Map(); // id -> since (within 4 m of me)
    let ws, timer, done = false, seq = 0, token = null, quiet = -1, tick = 0;
    let x = 1000 + Math.round((Math.random() - 0.5) * spread), z = 500 + Math.round((Math.random() - 0.5) * spread), yaw = Math.random() * Math.PI * 2;
    if (index < follow) { x = 1000 + index * 10; z = 500; } // followers start beside the first wanderer
    else if (follow > 0 && index === follow) { x = 1000; z = 520; }
    const RB = { 5: [-14, 14, -11, 12], 6: [-21, 12, -8, 18], 7: [-8, 8, -7, 4.5], 8: [-7.4, 7.4, -5.6, 6.3], 32: [-7.4, 7.4, -5.6, 6.3] }[room] || [-5, 5, -5, 5];
    let rx = roomAt ? roomAt[0] + (Math.random() - 0.5) * 2 : RB[0] + 1 + Math.random() * (RB[1] - RB[0] - 2);
    let rz = roomAt ? roomAt[1] + (Math.random() - 0.5) * 2 : RB[2] + 1 + Math.random() * (RB[3] - RB[2] - 2);
    let roomWarped = 0;
    const finish = () => { if (done) return; done = true; clearInterval(timer); resolve(out); };
    const send = (arr) => { if (ws && ws.readyState === 1) { ws.send(JSON.stringify(arr)); out.sent++; } };
    const step = () => {
      tick++;
      const now = Date.now();
      if (quiet === 0 && tick % 5 !== 0 && tick % 5 !== 2) return; // S.Quiet 0: ~2 Hz instead of 5 Hz
      const dt = 0.2;
      if (out.follower && others.size) { // stick ~2 m behind the nearest stranger
        let best = null, bd = Infinity;
        for (const [, p] of others) { const d = Math.hypot(p[0] - x, p[1] - z); if (d < bd) { bd = d; best = p; } }
        if (best && bd > 20) { const k = Math.min(1, (6 * 10 * dt) / bd); x += Math.round((best[0] - x) * k); z += Math.round((best[1] - z) * k); }
      } else {
        yaw += (Math.random() - 0.5) * 0.6;
        x += Math.round(Math.sin(yaw) * speed * 10 * dt); z += Math.round(Math.cos(yaw) * speed * 10 * dt);
        if (x < -3000 || x > 9000) yaw += Math.PI; if (z < -5000 || z > 5000) yaw += Math.PI;
        x = Math.max(-3900, Math.min(9900, x)); z = Math.max(-5900, Math.min(5900, z));
      }
      seq++;
      if (room >= 0) { // indoors: room-local metres, slow walk inside the room (or a small shuffle around --room-at)
        if (!roomAt) { rx += Math.sin(yaw) * 0.8 * dt; rz += Math.cos(yaw) * 0.8 * dt; if (rx < RB[0] + 1 || rx > RB[1] - 1 || rz < RB[2] + 1 || rz > RB[3] - 1) yaw += Math.PI; rx = Math.max(RB[0] + 1, Math.min(RB[1] - 1, rx)); rz = Math.max(RB[2] + 1, Math.min(RB[3] - 1, rz)); }
        const warp = roomWarped === 0 || (roomWarped === 1 && tick > 27) ? 1 : 0; if (warp) roomWarped++; // the entry Warp + one retry ~5.5 s later
        x = Math.round(rx * 10); z = Math.round(rz * 10);
        send([C.Pose, seq, ...roomBody([0, 0, 0, 0, 0, 0, 0, 0], room, rx, 0, rz, yaw, roomAt ? Mode.Idle : Mode.Walk, warp)]);
      } else
      send([C.Pose, seq, x, 0, z, Math.round(((yaw % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) / (2 * Math.PI) * 255) & 255, 8, Mode.Walk, Zone.Main, 0]);
      if (emoteEvery > 0 && now - (out.lastEmoteAt ?? 0) >= emoteEvery) { out.lastEmoteAt = now; send([C.Emote, Emote.Wave]); out.emotesSent++; }
      if (report) for (const [id, p] of others) {
        if (Math.hypot(p[0] - x, p[1] - z) <= 40) { if (!close.has(id)) close.set(id, now); else if (now - close.get(id) >= 10000 && close.get(id) > 0) { send([C.Report, id, P.ReportReason.Following]); out.reportsSent++; close.set(id, -1); } }
        else if (close.get(id) !== -1) close.delete(id);
      }
    };
    const connect = async () => {
      let a;
      try { a = await (await fetch(url.replace(/\/$/, '') + '/world?devip=' + encodeURIComponent(label) + (inShard > 0 ? '&in=' + inShard : ''))).json(); } catch { out.errors.push('lookup'); finish(); return; }
      if (!a || !a.open) { out.errors.push('closed'); finish(); return; }
      out.shard = a.shard; out.lookupN = a.n;
      try { ws = new WebSocket(url.replace(/^http/, 'ws').replace(/\/$/, '') + '/world/' + a.shard + '/ws?devip=' + encodeURIComponent(label)); } catch { out.errors.push('connect'); finish(); return; }
      ws.onopen = () => send(nick ? [C.Hello, PROTOCOL_VERSION, LOOK, null, null, null, nick] : [C.Hello, PROTOCOL_VERSION, LOOK, null, null]);
      ws.onerror = () => { out.errors.push('socket'); };
      ws.onclose = (ev) => { out.closeCode = ev.code; finish(); };
      ws.onmessage = (ev) => {
        out.msgs++; out.bytes += ev.data.length; out.maxFrame = Math.max(out.maxFrame, ev.data.length);
        let m;
        try { m = JSON.parse(ev.data); } catch { return; }
        if (m[0] === S.Welcome) token = m[3];
        for (const b of STRINGS_OK(m, token)) if (out.strings.length < 5) out.strings.push(b);
        switch (m[0]) {
          case S.Welcome:
            out.welcomed = true; out.id = m[2];
            for (const mi of m[7]) if (mi[0] !== out.id && mi[4]) others.set(mi[0], [mi[4][0], mi[4][2]]);
            timer = setInterval(step, 200);
            setTimeout(() => { try { ws.close(1000); } catch { /* ignore */ } setTimeout(finish, 300); }, ms);
            break;
          case S.Caps: send([C.Caps, m[1] & P.CAPS_WORLD]); break;
          case S.Joined: out.joined++; if (m[1][4]) others.set(m[1][0], [m[1][4][0], m[1][4][2]]); break;
          case S.Left: if (m[2] === P.LeaveReason.Far) out.far++; else out.left++; others.delete(m[1]); close.delete(m[1]); break;
          case S.Live: out.liveFrames++; for (let i = 0; i < m[2].length; i += 10) { others.set(m[2][i], [m[2][i + 1], m[2][i + 3]]); out.poseEntries++; } break;
          case S.Poses: for (let i = 2; i + 8 < m.length; i += 9) { others.set(m[i], [m[i + 1], m[i + 3]]); out.poseEntries++; } break;
          case S.Emote: out.emotesFrom++; break;
          case S.Quiet: quiet = m[1]; if (out.quiet.length < 20) out.quiet.push(m[1]); break;
          case S.World: if (out.worldN.length < 30) out.worldN.push(m[1]); break;
          case S.Error: out.errors.push(m[1]); break;
          default: break;
        }
      };
    };
    void connect();
    setTimeout(finish, ms + 6000); // hard stop: never hang
  });
}

export async function runBots({ n = 1, stagger = 40, ...opts }) {
  if (opts.world) {
    const jobs = [];
    for (let i = 0; i < n; i++) jobs.push(new Promise((r) => setTimeout(r, i * stagger)).then(() => runWorldBot({ ...opts, index: i })));
    return Promise.all(jobs);
  }
  const jobs = [];
  for (let i = 0; i < n; i++) {
    jobs.push(new Promise((r) => setTimeout(r, i * stagger)).then(() => runBot({ ...opts, index: i, hostKey: i === 0 ? opts.hostKey ?? null : null })));
  }
  return Promise.all(jobs);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  if (typeof WebSocket === 'undefined') { console.error('run with: node --experimental-websocket'); process.exit(2); }
  process.on('SIGTERM', () => { console.log(JSON.stringify({ bots: running.map((f) => f()) })); process.exit(0); });
  const a = process.argv.slice(2);
  const get = (k, d) => { const i = a.indexOf('--' + k); return i >= 0 ? a[i + 1] : d; };
  if (a.includes('--world')) {
    const bots = await runBots({ world: true, url: get('url', 'http://127.0.0.1:8790'), n: Number(get('n', 1)), ms: Number(get('ms', 3000)), stagger: Number(get('stagger', 40)),
      spread: Number(get('spread', 3000)), speed: Number(get('speed', 1.5)), emoteEvery: Number(get('emote-every', 0)), follow: Number(get('follow', 0)),
      report: a.includes('--report'), nick: get('nick', null), devip: get('devip', 'bot'), room: Number(get('room', -1)), roomAt: get('room-at', null)?.split(',').map(Number) ?? null, inShard: Number(get('in', 0)) });
    if (a.includes('--summary')) {
      const sum = (k) => bots.reduce((t, b) => t + (b[k] || 0), 0), shards = {};
      for (const b of bots) shards[b.shard] = (shards[b.shard] || 0) + 1;
      console.log(JSON.stringify({ bots: bots.length, welcomed: bots.filter((b) => b.welcomed).length, shards, msgsIn: sum('msgs'), msgsOut: sum('sent'), bytesIn: sum('bytes'),
        maxFrame: Math.max(0, ...bots.map((b) => b.maxFrame)), joined: sum('joined'), far: sum('far'), emotesSent: sum('emotesSent'), emotesFrom: sum('emotesFrom'),
        reportsSent: sum('reportsSent'), strings: bots.flatMap((b) => b.strings).slice(0, 5), errors: bots.flatMap((b) => b.errors).slice(0, 10),
        closeCodes: [...new Set(bots.map((b) => b.closeCode))] }));
    } else console.log(JSON.stringify({ bots }));
    process.exit(0);
  }
  const bots = await runBots({
    url: get('url', 'http://127.0.0.1:8790'), code: get('code'), n: Number(get('n', 1)), path: get('path', 'circle'),
    cheat: get('cheat', null), hostKey: get('host-key', null), ms: Number(get('ms', 3000)), spread: Number(get('spread', 0)),
    room: Number(get('room', -1)), roomAfter: Number(get('room-after', 0)), walk: Number(get('walk', 6000)), stand: Number(get('stand', 6000)), emoteEvery: Number(get('emote-every', 0)),
    busyAt: get('busy-at', null)?.split(',').map(Number) ?? null, busyAfter: Number(get('busy-after', 0)), busyFor: Number(get('busy-for', 0)),
  });
  console.log(JSON.stringify({ bots: bots.map((b) => ({ ...b, token: undefined })) }));
}
