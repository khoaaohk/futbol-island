// Local dev relay: the same three endpoints as the Cloudflare worker, the same RoomCore (loaded from TS).
//   GET /stats?from&to (Bearer MP_STATS_TOKEN; 404 when the env var is unset; in-memory daily counters, same shape as the worker)
//   POST /party -> 201 {code, hostKey, expiresAt};  GET /party/:code -> {open,size,full} | 404;  GET /party/:code/ws (Upgrade)
// Run: MP_PORT=8790 node multiplayer/dev-relay/server.mjs   (MP_PORT=0 picks a free port; the first stdout line says which)
// Logs counts only: no codes, tokens or addresses.
import http from 'node:http';
import { randomFillSync } from 'node:crypto';
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

export function startServer({ port = Number(process.env.MP_PORT ?? 8790), quiet = false, statsToken = process.env.MP_STATS_TOKEN } = {}) {
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
  // MP_DEV=1: POST /dev/advance?ms=N moves the relay clock forward (grace / away timeouts in checks without waiting minutes).
  let skew = 0;
  const clock = { now: () => Date.now() + skew };
  const random = (n) => randomFillSync(new Uint8Array(n));
  const LOCAL = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

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
    cors(req, res);
    if (!originOk(req)) { stat(() => statsCore.inc('rl:origin_refused')); return json(res, 403, { error: 'origin' }); }
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
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
        if (!quiet) console.log(JSON.stringify({ rooms: rooms.size, ...stats }));
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
