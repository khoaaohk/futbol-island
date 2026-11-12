// Local dev relay: the same three endpoints as the Cloudflare worker, the same RoomCore (loaded from TS).
//   GET /stats?from&to (Bearer MP_STATS_TOKEN; 404 when the env var is unset; in-memory daily counters, same shape as the worker)
//   POST /party -> 201 {code, hostKey, expiresAt};  GET /party/:code -> {open,size,full} | 404;  GET /party/:code/ws (Upgrade)
// Run: MP_PORT=8790 node multiplayer/dev-relay/server.mjs   (MP_PORT=0 picks a free port; the first stdout line says which)
// Relay v2.0 public worlds (the same RoomCore in kind 'world' + the same WorldLobbyCore as the worker):
//   GET /world[?in=N] -> {open:true, shard, n} | {open:false};  GET /world/:shard/ws (Upgrade);  GET|POST /control (Bearer MP_CONTROL_TOKEN)
//   Public play starts CLOSED, like the worker: open it with MP_WORLD_OPEN=1 (dev only) or POST /control {"public":true}.
//   MP_DEV=1 also honours ?devip=<label> on /world and /world/:shard/ws (stands in for distinct IPs: bots, report / quarantine checks)
//   and serves GET /dev/metrics (frames in / out, largest frame, tick CPU, shard counts).
// Logs counts only: no codes, tokens or addresses.
import http from 'node:http';
import { randomFillSync, createHmac } from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { acceptUpgrade } from './wsLite.mjs';

const require = createRequire(import.meta.url);
const { loadTs } = require('./loadTs.cjs');
const here = path.dirname(fileURLToPath(import.meta.url));
const P = loadTs(path.join(here, '../protocol/index.ts'));
const { RoomCore } = loadTs(path.join(here, '../relay/src/roomCore.ts'));
const SC = loadTs(path.join(here, '../relay/src/relayStatsCore.ts'));
const { WorldLobbyCore, WORLD_HEARTBEAT_MS } = loadTs(path.join(here, '../relay/src/worldLobbyCore.ts'));

export function startServer({ port = Number(process.env.MP_PORT ?? 8790), quiet = false, statsToken = process.env.MP_STATS_TOKEN,
  controlToken = process.env.MP_CONTROL_TOKEN, worldOpen = process.env.MP_WORLD_OPEN === '1', dev = process.env.MP_DEV === '1' } = {}) {
  // Local stand-in for the RelayStats Durable Object: the same core over a Map. Updates are chained so they apply in order.
  const kvMap = new Map();
  const kv = {
    get: async (k) => kvMap.get(k), put: async (k, v) => { kvMap.set(k, JSON.parse(JSON.stringify(v))); }, delete: async (k) => kvMap.delete(k),
    list: async (o = {}) => new Map([...kvMap].filter(([k]) => k.startsWith(o.prefix || ''))),
  };
  const statsCore = new SC.RelayStatsCore(kv, () => Date.now());
  let chain = Promise.resolve();
  const stat = (fn) => { chain = chain.then(fn).catch(() => undefined); };
  const reported = new Map(); // room -> members reported live
  const rooms = new Map(); // code -> RoomCore
  const stats = { created: 0, joins: 0, ended: 0 };
  // MP_DEV=1: POST /dev/lobby-restart drops the in-process lobby and reloads its stored counts (the DO eviction path). POST /dev/advance?ms=N moves the relay clock forward (grace / away timeouts in checks without waiting minutes).
  let skew = 0;
  const clock = { now: () => Date.now() + skew };
  const random = (n) => randomFillSync(new Uint8Array(n));
  const LOCAL = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

  // ---- relay v2.0 worlds ----
  let lobby = new WorldLobbyCore(() => clock.now(), () => (typeof controlToken === 'string' && controlToken.length >= 16) || worldOpen);
  lobby.stored = worldOpen;
  const worlds = new Map(); // shard -> RoomCore (kind 'world')
  const worldN = new Map(); // shard -> count last given to the lobby
  const metrics = { framesIn: 0, framesOut: 0, bytesOut: 0, maxFrameOut: 0, ticks: 0, tickMsTotal: 0, maxTickMs: 0 };
  let salt = randomFillSync(new Uint8Array(16)), saltDay = -1;
  const ipKey = (req, url) => { // the worker's daily-salted IP hash (memory only); MP_DEV=1: ?devip= stands in for the address
    const day = Math.floor(Date.now() / 86400000);
    if (day !== saltDay) { saltDay = day; salt = randomFillSync(new Uint8Array(16)); rl.clear(); }
    const ip = (dev && url.searchParams.get('devip')) || req.socket.remoteAddress || 'unknown';
    return createHmac('sha256', salt).update(String(ip)).digest('hex').slice(0, 16);
  };
  const rl = new Map(); // in-memory equivalent of the WORLD_RL binding (same numbers as the worker's fallback buckets)
  const allowWorld = (key, kind) => {
    let l = rl.get(key);
    if (!l) { if (rl.size > 5000) rl.clear(); l = { l: new P.TokenBucket(60 / 60, 60), s: new P.TokenBucket(30 / 60, 30) }; rl.set(key, l); }
    return l[kind].take(Date.now());
  };
  const worldFor = (shard) => {
    let w = worlds.get(shard);
    if (!w) {
      w = new RoomCore({ code: 'pub-' + shard, createdAt: Date.now(), clock, random, kind: 'world' });
      w.onStat = (id) => stat(() => statsCore.inc(id));
      w.onHold = (h) => lobby.hold(h);
      w.onFull = () => syncWorld(shard, w, true); // as the DO: a Full refusal pushes the count so the client's retry goes elsewhere
      worlds.set(shard, w);
    }
    return w;
  };
  const worldAt = new Map(); // shard -> when the count was last given (the DO's 30 s heartbeat, so a stable world is not pruned)
  const syncWorld = (shard, w, force = false) => { // the DO's syncLobby, in process: count changes to the lobby; public off closes the world
    const n = w.size;
    if (!force && worldN.get(shard) === n && clock.now() - (worldAt.get(shard) ?? 0) < WORLD_HEARTBEAT_MS) return;
    worldN.set(shard, n); worldAt.set(shard, clock.now());
    if (!lobby.report(shard, n) && n > 0) { w.closeWorld(); worldN.set(shard, 0); lobby.report(shard, 0); }
    if (n === 0 && w.idle) { worlds.delete(shard); worldN.delete(shard); worldAt.delete(shard); } // empty, no socket waiting: forgotten (the DO hibernates)
  };
  const closeAllWorlds = () => { for (const [shard, w] of worlds) { w.closeWorld(); syncWorld(shard, w); } lobby.clear(); };

  const cors = (req, res) => {
    const o = req.headers.origin;
    if (o && LOCAL.test(o)) {
      res.setHeader('Access-Control-Allow-Origin', o);
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'content-type');
    }
  };
  const json = (res, status, body) => {
    res.writeHead(status, { 'content-type': 'application/json', 'cache-control': 'no-store' });
    res.end(JSON.stringify(body));
  };
  const routeCode = (url) => {
    const m = /^\/party\/([^/]+)(\/ws)?$/.exec(url.pathname);
    if (!m) return null;
    let raw = '';
    try { raw = decodeURIComponent(m[1]); } catch { /* malformed escape: an unknown code, not a 500 (review #12) */ }
    return { code: P.normalizeCode(raw), ws: !!m[2] };
  };
  const originOk = (req) => !req.headers.origin || LOCAL.test(req.headers.origin);

  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://x');
    if (url.pathname === '/stats') { // server-to-server: no CORS headers, bearer token, constant-time compare
      if (req.method !== 'GET' || !statsToken) return json(res, 404, { error: 'not_found' });
      if (!SC.bearerOk(req.headers.authorization ?? null, statsToken)) return json(res, 401, { error: 'unauthorized' });
      const r = SC.parseRange(url.searchParams.get('from'), url.searchParams.get('to'), Date.now());
      return chain.then(() => statsCore.stats(r.from, r.to)).then((b) => json(res, 200, b));
    }
    if (url.pathname === '/control') { // relay v2.0 kill switch: server-to-server, bearer MP_CONTROL_TOKEN, 404 while unset
      if ((req.method !== 'GET' && req.method !== 'POST') || !controlToken) return json(res, 404, { error: 'not_found' });
      if (!SC.bearerOk(req.headers.authorization ?? null, controlToken)) return json(res, 401, { error: 'unauthorized' });
      if (req.method === 'GET') return json(res, 200, lobby.state());
      let body = '';
      req.on('data', (c) => { body += c; if (body.length > 1000) req.destroy(); });
      req.on('end', () => {
        let b = null;
        try { b = JSON.parse(body); } catch { /* bad */ }
        if (!b || typeof b.public !== 'boolean') return json(res, 400, { error: 'bad' });
        lobby.stored = b.public;
        if (!lobby.isPublic) closeAllWorlds();
        json(res, 200, lobby.state());
      });
      return;
    }
    cors(req, res);
    if (!originOk(req)) { stat(() => statsCore.inc('rl:origin_refused')); return json(res, 403, { error: 'origin' }); }
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
    if (dev && req.method === 'GET' && url.pathname === '/dev/metrics') return json(res, 200, { ...metrics, worlds: lobby.state() });
    if (req.method === 'GET' && url.pathname === '/world') {
      if (!allowWorld(ipKey(req, url), 'l')) { stat(() => statsCore.inc('rl:world_rate')); return json(res, 429, { error: 'rate_limited' }); }
      const q = url.searchParams.get('in');
      return json(res, 200, lobby.assign(q && /^\d{1,3}$/.test(q) ? Number(q) : undefined));
    }
    if (dev && req.method === 'POST' && url.pathname === '/dev/lobby-restart') { // the WorldLobby DO evicted: a fresh core reloads the stored counts
      const rows = lobby.snapshot(), was = lobby.stored;
      lobby = new WorldLobbyCore(() => clock.now(), () => (typeof controlToken === 'string' && controlToken.length >= 16) || worldOpen);
      lobby.stored = was; lobby.restore(JSON.parse(JSON.stringify(rows)));
      return json(res, 200, { restored: rows.length });
    }
    if (process.env.MP_DEV === '1' && req.method === 'POST' && url.pathname === '/dev/advance') { skew += Math.max(0, Number(url.searchParams.get('ms')) || 0); res.writeHead(200); return res.end(String(skew)); }
    if (req.method === 'POST' && url.pathname === '/party') {
      let code;
      do { code = P.generateCode(random); } while (rooms.has(code));
      const room = new RoomCore({ code, createdAt: Date.now(), clock, random });
      // Rotate: the new code finds the room; the old one stays mapped but RETIRED (RoomCore.codeStatus), so /ws still takes it
      // for a resume token or the host key while /party/:code answers 404 for it.
      room.onRotate = (_o, n) => { rooms.set(n, room); };
      rooms.set(code, room);
      stats.created++;
      reported.set(room, 0);
      stat(() => statsCore.created());
      return json(res, 201, { code, hostKey: room.hostKey, expiresAt: room.codeExpiresAt });
    }
    const r = req.method === 'GET' ? routeCode(url) : null;
    if (r && !r.ws) {
      const room = r.code && rooms.get(r.code);
      if (!room || room.ended || room.codeStatus(r.code) !== 'current') return json(res, 404, { error: 'not_found' });
      const i = room.info();
      return json(res, 200, { open: i.open, full: i.full }); // no party size (review #23)
    }
    json(res, 404, { error: 'not_found' });
  });

  server.on('upgrade', (req, socket) => {
    const url = new URL(req.url, 'http://x');
    const wm = /^\/world\/(\d{1,3})\/ws$/.exec(url.pathname);
    if (wm) { // relay v2.0 world socket: origin, rate limit, lobby admit (switch + IP-hash hold), then the shard's RoomCore
      const shard = Number(wm[1]);
      if (!originOk(req)) { socket.end('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n'); return; }
      if (shard < 1 || shard > P.WORLD_MAX_SHARDS) { socket.end('HTTP/1.1 404 Not Found\r\nConnection: close\r\n\r\n'); return; }
      const key = ipKey(req, url);
      if (!allowWorld(key, 's')) { stat(() => statsCore.inc('rl:world_rate')); socket.end('HTTP/1.1 429 Too Many Requests\r\nConnection: close\r\n\r\n'); return; }
      const ad = lobby.admit(shard, key);
      const conn = acceptUpgrade(req, socket);
      if (!conn) return;
      if (!ad.open) { conn.close(P.CloseCode.WorldOff); return; }
      const room = worldFor(shard);
      const peer = { send: (t) => { metrics.framesOut++; metrics.bytesOut += t.length; if (t.length > metrics.maxFrameOut) metrics.maxFrameOut = t.length; conn.send(t); }, close: (c) => conn.close(c) };
      stats.joins++;
      room.connect(peer, false, { ipKey: key, held: ad.held });
      conn.onMessage((t) => { metrics.framesIn++; room.message(peer, t); syncWorld(shard, room); });
      conn.onClose(() => { room.disconnect(peer); });
      return;
    }
    const r = routeCode(url);
    const room = r && r.ws && r.code && rooms.get(r.code);
    if (!originOk(req)) { socket.end('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n'); return; }
    if (!room || room.ended) { socket.end('HTTP/1.1 404 Not Found\r\nConnection: close\r\n\r\n'); return; }
    const conn = acceptUpgrade(req, socket);
    if (!conn) return;
    const peer = { send: (t) => conn.send(t), close: (c) => conn.close(c) };
    stats.joins++;
    room.connect(peer, room.codeStatus(r.code) === 'retired');
    conn.onMessage((t) => room.message(peer, t));
    conn.onClose(() => room.disconnect(peer));
  });

  let step = 0;
  const timer = setInterval(() => {
    const half = ++step % 2 === 1; // relay v1.2: 10 Hz steps, the full tick every other step (as the Durable Object)
    const t0 = process.hrtime.bigint();
    for (const [shard, w] of Array.from(worlds)) { if (half) w.halfTick(); else { w.tick(); syncWorld(shard, w); } }
    if (worlds.size) { const ms = Number(process.hrtime.bigint() - t0) / 1e6; metrics.ticks++; metrics.tickMsTotal += ms; if (ms > metrics.maxTickMs) metrics.maxTickMs = ms; }
    for (const room of new Set(rooms.values())) {
      if (half) { room.halfTick(); continue; }
      room.tick();
      const n = room.ended ? 0 : room.liveMembers, was = reported.get(room) ?? 0;
      if (n !== was && !room.ended) { reported.set(room, n); stat(() => statsCore.players(n - was)); }
      if (room.ended) {
        const sum = room.summary(), rep = reported.get(room) ?? 0;
        reported.delete(room);
        stat(() => statsCore.ended(sum, rep)); for (const [code, r] of rooms) if (r === room) rooms.delete(code); stats.ended++; }
    }
  }, 100);
  timer.unref();

  return new Promise((resolve) => {
    server.listen(port, '127.0.0.1', () => {
      const actual = server.address().port;
      if (!quiet) console.log(JSON.stringify({ listening: actual }));
      const log = setInterval(() => {
        if (!quiet) console.log(JSON.stringify({ rooms: rooms.size, worlds: worlds.size, ...stats }));
      }, 60000);
      log.unref();
      resolve({
        port: actual,
        close() { clearInterval(timer); clearInterval(log); server.closeAllConnections?.(); server.close(); },
      });
    });
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  startServer();
}
