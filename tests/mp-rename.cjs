// Self rename (Oct 23 2026, relay v1.3): C.Rename protocol shape + validation, RoomCore rename / resume rename / host name lock (relay v1.5),
// the client connection's rename() on a new relay (Cap.Rename) and an old relay (local only), the store's own-nick patch, and the
// Your party List wiring (OwnNameRow). No network.
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), ts = require('typescript');
const { loadTs } = require('../multiplayer/dev-relay/loadTs.cjs');
const ROOT = path.join(__dirname, '..');
const P = loadTs(path.join(ROOT, 'multiplayer/protocol/index.ts'));
const { RoomCore } = loadTs(path.join(ROOT, 'multiplayer/relay/src/roomCore.ts'));
const { C, S, Cap, CAPS_ALL, ErrorCode, PROTOCOL_VERSION } = P;
let n = 0; const t = (name, fn) => { try { fn(); n++; } catch (e) { console.error('FAIL', name); throw e; } };
const j = (a) => JSON.stringify(a);

// ---- protocol ----
t('protocol: C.Rename / Cap.Rename shapes', () => {
  assert.equal(C.Rename, 13); assert.equal(Cap.Rename, 4); assert.equal(CAPS_ALL, 63);
  assert.equal(Cap.Live | Cap.Ball | Cap.Rename | Cap.EmoteAsk | Cap.NameLock | Cap.Hit, CAPS_ALL);
  assert.deepEqual(P.parseClient(j([C.Rename, 'Sam'])), [13, 'Sam']);
  assert.deepEqual(P.parseClient(j([C.Rename, ' sAM '])), [13, 'Sam'], 'normalised like the join name');
  assert.deepEqual(P.parseClient(j([C.Rename, 'élodie'])), [13, 'Élodie']);
  for (const bad of ['Sam Lee', 'S', 'Abcdefghijklm', 'Sam1', 'sam!', '', 'www.x.com', '😀😀', null, 5, ['Sam']]) {
    assert.equal(P.parseClient(j([C.Rename, bad])), null, 'rejects ' + JSON.stringify(bad));
  }
  assert.equal(P.parseClient(j([C.Rename])), null); assert.equal(P.parseClient(j([C.Rename, 'Sam', 1])), null);
  assert.ok(P.encode([C.Rename, 'Abcdefghijkl']).length < 64);
  // the old host-reset frame is unchanged (an old relay may still send it): Renamed still carries null only
  assert.ok(P.parseServer(j([S.Renamed, 3, null]))); assert.equal(P.parseServer(j([S.Renamed, 3, 'Sam'])), null);
  // C.ResetName stays reserved (10) and still parses, so an old host client's frame is never counted as bad
  assert.equal(C.ResetName, 10); assert.ok(P.parseClient(j([C.ResetName, 3])));
});

t('protocol: C.NameLock / S.NameLock / Cap.NameLock (relay v1.5)', () => {
  assert.equal(Cap.NameLock, 16); assert.equal(C.NameLock, 16); assert.equal(S.NameLock, 37);
  assert.deepEqual(P.parseClient(j([C.NameLock, 3, 1])), [16, 3, 1]); assert.deepEqual(P.parseClient(j([C.NameLock, 3, 0])), [16, 3, 0]);
  for (const bad of [[C.NameLock, 3], [C.NameLock, 3, 2], [C.NameLock, 32, 1], [C.NameLock, -1, 0], [C.NameLock, '3', 1], [C.NameLock, 3, 1, 1]]) assert.equal(P.parseClient(j(bad)), null, j(bad));
  assert.ok(P.parseServer(j([S.NameLock, 5, 1]))); assert.ok(P.parseServer(j([S.NameLock, 5, 0])));
  assert.equal(P.parseServer(j([S.NameLock, 5, true])), null); assert.equal(P.parseServer(j([S.NameLock, 40, 1])), null);
});

// ---- relay ----
let seed = 777;
const random = (k) => { const a = new Uint8Array(k); for (let i = 0; i < k; i++) { seed = (seed * 1103515245 + 12345) & 0x7fffffff; a[i] = (seed >> 8) & 255; } return a; };
const LOOK = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
function peer() { const p = { msgs: [], closed: null, send(x) { p.msgs.push(JSON.parse(x)); }, close(c) { p.closed = c; } }; p.of = (op) => p.msgs.filter((m) => m[0] === op); return p; }
function mkRoom() {
  const clock = { t: 1_000_000, now() { return this.t; } };
  const room = new RoomCore({ code: 'K7MQ4R', createdAt: clock.t, clock, random });
  const hello = (p, nick, resume = null, hostKey = null) => { room.connect(p); room.message(p, j([C.Hello, PROTOCOL_VERSION, LOOK, resume, hostKey, null, nick])); };
  return { room, clock, hello };
}
const me = (p) => p.of(S.Welcome)[0][2];
const tok = (p) => p.of(S.Welcome).slice(-1)[0][3];

t('relay: S.Caps announces Cap.Rename; C.Rename re-announces the member as Joined to everyone (old clients upsert by id)', () => {
  const { room, clock, hello } = mkRoom();
  const host = peer(); hello(host, 'Emma', null, room.hostKey);
  const g = peer(); hello(g, 'Leo');
  assert.ok(g.of(S.Caps)[0][1] & Cap.Rename, 'the relay announces Cap.Rename');
  const gid = me(g);
  room.message(g, j([C.Caps, CAPS_ALL]));
  host.msgs.length = 0; g.msgs.length = 0;
  clock.t += 1000; room.message(g, j([C.Rename, 'sam']));
  const hj = host.of(S.Joined), gj = g.of(S.Joined);
  assert.equal(hj.length, 1); assert.equal(gj.length, 1, 'the sender gets its confirmation');
  assert.equal(hj[0][1][0], gid); assert.equal(hj[0][1][5], 'Sam');
  assert.ok(P.parseServer(j(hj[0])), 'the re-announce passes the (old and new) client validator');
  // same name: no-op; bad name: dropped by parseClient (counted as bad, nothing broadcast)
  host.msgs.length = 0; clock.t += 1000;
  room.message(g, j([C.Rename, 'Sam'])); room.message(g, j([C.Rename, 'Sam Lee'])); room.message(g, j([C.Rename, '1234']));
  assert.equal(host.of(S.Joined).length, 0);
  // a new joiner sees the new name in the roster
  const late = peer(); hello(late, 'Mia');
  assert.equal(late.of(S.Welcome)[0][7].find((m) => m[0] === gid)[5], 'Sam');
});

t('relay: rename is rate limited (4 per minute)', () => {
  const { room, clock, hello } = mkRoom();
  const host = peer(); hello(host, 'Emma', null, room.hostKey);
  const g = peer(); hello(g, 'Leo'); room.message(g, j([C.Caps, CAPS_ALL]));
  host.msgs.length = 0;
  for (const nm of ['Aa', 'Bb', 'Cc', 'Dd', 'Ee', 'Ff']) { clock.t += 2000; room.message(g, j([C.Rename, nm])); }
  assert.equal(host.of(S.Joined).length, 4);
  clock.t += 60_000; room.message(g, j([C.Rename, 'Gg']));
  assert.equal(host.of(S.Joined).length, 5, 'allowed again after a minute');
});

function lockParty() {
  const r = mkRoom(); const { room, hello } = r;
  const host = peer(); hello(host, 'Emma', null, room.hostKey); room.message(host, j([C.Caps, CAPS_ALL]));
  const g = peer(); hello(g, 'Leo'); room.message(g, j([C.Caps, CAPS_ALL]));
  const old = peer(); hello(old, 'Mia'); room.message(old, j([C.Caps, 15])); // a v1.4 client: no Cap.NameLock
  return { ...r, host, g, old, hid: me(host), gid: me(g) };
}
const clearAll = (...ps) => ps.forEach((p) => { p.msgs.length = 0; });

t('relay: the host locks a name; a locked member cannot rename (C.Rename refused, lock re-sent); unlock allows it again', () => {
  const { room, clock, host, g, old, gid } = lockParty();
  assert.ok(g.of(S.Caps)[0][1] & Cap.NameLock, 'the relay announces Cap.NameLock');
  clearAll(host, g, old); clock.t += 1000;
  room.message(host, j([C.NameLock, gid, 1]));
  assert.deepEqual(g.of(S.NameLock), [[S.NameLock, gid, 1]], 'the locked player hears it');
  assert.deepEqual(host.of(S.NameLock), [[S.NameLock, gid, 1]], 'the host hears it (its button state)');
  assert.equal(old.msgs.length, 0, 'an old client never gets S.NameLock');
  clearAll(host, g, old); clock.t += 2000;
  room.message(g, j([C.Rename, 'Sam']));
  assert.equal(host.of(S.Joined).length, 0, 'locked: no rename');
  assert.deepEqual(g.msgs, [[S.NameLock, gid, 1]], 'the refused sender is reminded of the lock');
  clock.t += 1000; room.message(host, j([C.NameLock, gid, 1])); assert.equal(host.of(S.NameLock).length, 0, 'no change: no news');
  clock.t += 1000; room.message(host, j([C.NameLock, gid, 0]));
  assert.deepEqual(g.of(S.NameLock).slice(-1)[0], [S.NameLock, gid, 0]);
  clearAll(host); clock.t += 2000; room.message(g, j([C.Rename, 'Sam']));
  assert.equal(host.of(S.Joined)[0][1][5], 'Sam', 'unlocked: renames again');
});

t('relay: name lock is host only; unknown ids and the host itself are no-ops; ResetName is ignored', () => {
  const { room, clock, host, g, old, hid, gid } = lockParty();
  clearAll(host, g, old); clock.t += 1000;
  room.message(g, j([C.NameLock, hid, 1]));
  assert.deepEqual(g.of(S.Error), [[S.Error, ErrorCode.NotHost]], 'a guest gets NotHost');
  assert.equal(host.of(S.NameLock).length, 0);
  clock.t += 1000; room.message(host, j([C.NameLock, 30, 1])); // nobody in slot 30
  clock.t += 1000; room.message(host, j([C.NameLock, hid, 1])); // the host's own name
  assert.equal(host.msgs.length + g.msgs.length, 1, 'only the guest error so far');
  clock.t += 1000; room.message(host, j([C.Rename, 'Zoe'])); assert.equal(g.of(S.Joined)[0][1][5], 'Zoe', 'the host can always rename');
  clearAll(host, g, old); clock.t += 1000;
  room.message(old, j([C.ResetName, gid])); room.message(host, j([C.ResetName, gid]));
  assert.equal(host.msgs.length + g.msgs.length + old.msgs.length, 0, 'the retired ResetName does nothing (no error, no Renamed)');
  assert.equal(old.closed, null);
});

t('relay: the lock survives a resume (re-sent after C.Caps), a resume Hello cannot rename, and an eviction (attachment)', () => {
  const { room, clock, host, g, gid, hello } = lockParty();
  clock.t += 1000; room.message(host, j([C.NameLock, gid, 1]));
  room.disconnect(g);
  const g2 = peer(); hello(g2, 'Sam', tok(g));
  assert.equal(me(g2), gid); assert.equal(g2.of(S.Welcome)[0][7].find((m) => m[0] === gid)[5], 'Leo', 'a resume Hello cannot rename');
  assert.equal(g2.of(S.NameLock).length, 0, 'not before C.Caps');
  room.message(g2, j([C.Caps, CAPS_ALL]));
  assert.deepEqual(g2.of(S.NameLock), [[S.NameLock, gid, 1]], 'the resumed client learns its lock');
  const late = peer(); hello(late, 'Ava'); room.message(late, j([C.Caps, CAPS_ALL]));
  assert.deepEqual(late.of(S.NameLock), [[S.NameLock, gid, 1]], 'a new joiner learns every lock');
  clearAll(host); clock.t += 2000; room.message(g2, j([C.Rename, 'Sam'])); assert.equal(host.of(S.Joined).length, 0, 'still locked');
  const att = room.attachmentFor(g2); assert.equal(att.nameLock, 1, 'the attachment keeps the lock');
  assert.equal(room.attachmentFor(host).nameLock, undefined);
  const r2 = mkRoom(); const p = peer(); r2.room.restoreMember(p, att);
  r2.room.message(p, j([C.Caps, CAPS_ALL])); r2.room.message(p, j([C.Rename, 'Sam']));
  assert.deepEqual(p.of(S.NameLock).slice(-1)[0], [S.NameLock, gid, 1], 'restored after an eviction');
});

t('relay: a locked member who becomes host is unlocked (the host name is never locked)', () => {
  const { room, clock, host, g, gid } = lockParty();
  clock.t += 1000; room.message(host, j([C.NameLock, gid, 1]));
  clearAll(g); room.message(host, j([C.Leave]));
  assert.deepEqual(g.of(S.Host)[0], [S.Host, gid]);
  assert.deepEqual(g.of(S.NameLock).slice(-1)[0], [S.NameLock, gid, 0]);
});

t('relay: a resume never renames; the slot keeps the C.Rename name across a reload (empty name slot)', () => {
  const { room, clock, hello } = mkRoom();
  const host = peer(); hello(host, 'Emma', null, room.hostKey);
  const g = peer(); hello(g, 'Leo'); const gid = me(g);
  room.message(g, j([C.Caps, CAPS_ALL])); clock.t += 1000; room.message(g, j([C.Rename, 'Sam']));
  host.msgs.length = 0; clock.t += 1000;
  const g2 = peer(); hello(g2, 'Zed', tok(g));
  assert.equal(me(g2), gid, 'same slot');
  assert.equal(g2.of(S.Welcome)[0][7].find((m) => m[0] === gid)[5], 'Sam', 'a resume Hello cannot rename');
  assert.equal(host.of(S.Joined).length, 0);
  const g3 = peer(); hello(g3, null, tok(g2)); // a page reload: empty name slot
  assert.equal(me(g3), gid); assert.equal(g3.of(S.Error).length, 0);
  assert.equal(g3.of(S.Welcome)[0][7].find((m) => m[0] === gid)[5], 'Sam', 'the slot keeps the new name');
});

// ---- client (connection + store) ----
const env = { NEXT_PUBLIC_MULTIPLAYER: '1', NEXT_PUBLIC_MULTIPLAYER_URL: 'http://localhost:8790/' };
const req = require('node:module').createRequire(ROOT + '/package.json'), cache = new Map();
function resolveTs(from, id) { const base = path.resolve(path.dirname(from), id); return fs.existsSync(base + '.ts') ? base + '.ts' : path.join(base, 'index.ts'); }
function load(file) {
  if (cache.has(file)) return cache.get(file); const mod = { exports: {} }; cache.set(file, mod.exports);
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText,
    { exports: mod.exports, module: mod, Math, Date, JSON, Number, Array, Object, Error, Map, Set, Float64Array, Uint8Array, Symbol, console, process: { env }, performance: { now: () => 0 },
      localStorage: { getItem: () => null, setItem: () => {} }, require: (id) => (id.startsWith('.') ? load(resolveTs(file, id)) : req(id)) });
  cache.set(file, mod.exports); return mod.exports;
}
const conn = load(path.join(ROOT, 'lib/multiplayer/connection.ts')), st = load(path.join(ROOT, 'lib/multiplayer/store.ts'));
function makeEnv() {
  let now = 1e6, seq = 0; const timers = [], sockets = [];
  class WS { constructor(url) { this.url = url; this.readyState = 0; this.sent = []; sockets.push(this); } send(x) { this.sent.push(x); } close() { this.readyState = 3; }
    open() { this.readyState = 1; this.onopen && this.onopen(); } recv(m) { this.onmessage && this.onmessage({ data: j(m) }); } drop() { this.readyState = 3; this.onclose && this.onclose(); } }
  const advance = (ms) => { const end = now + ms; for (;;) { timers.sort((a, b) => a.at - b.at); const nx = timers[0]; if (!nx || nx.at > end) break; timers.shift(); now = Math.max(now, nx.at); nx.fn(); } now = end; };
  const m = new Map();
  const c = conn.createPartyConnection({ WebSocketImpl: WS, now: () => now, random: () => 0.5,
    setTimeout: (fn, ms) => { const h = { id: ++seq, at: now + ms, fn }; timers.push(h); return h.id; },
    clearTimeout: (id) => { const i = timers.findIndex((x) => x.id === id); if (i >= 0) timers.splice(i, 1); },
    visibility: { hidden: () => false, on: () => () => {} }, storage: { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v), removeItem: (k) => m.delete(k) } });
  return { c, sockets, advance, last: () => sockets[sockets.length - 1], msgs: (s) => s.sent.map((x) => JSON.parse(x)) };
}
const welcomeMsg = () => [20, 1, 1, 'tok-abcdefghij012345', Date.now() + 7200000, Date.now() + 14400000, 0, [[1, [2, 0], LOOK, 1, null, 'Leo']]];

t('client: rename on a v1.3 relay sends C.Rename and every reconnect Hello carries the new name', () => {
  const e = makeEnv();
  assert.equal(e.c.rename('Sam'), null, 'not in a party');
  e.c.join('K7MQ4R', { look: LOOK, nick: 'Leo' }); const s = e.last(); s.open(); s.recv(welcomeMsg()); s.recv([S.Caps, CAPS_ALL]);
  assert.equal(e.c.rename('Sam Lee'), null, 'bad name refused'); assert.equal(e.c.rename('1'), null);
  assert.equal(e.c.rename('sam'), 'sent');
  const out = e.msgs(s); assert.deepEqual(out[out.length - 1], [C.Rename, 'Sam']);
  assert.ok(P.parseClient(s.sent[s.sent.length - 1]), 'passes the relay validator');
  s.drop(); e.advance(20000); const s2 = e.last(); assert.notEqual(s2, s); s2.open();
  const hello = e.msgs(s2)[0]; assert.equal(hello[0], C.Hello); assert.equal(hello[6], 'Sam', 'resume Hello carries the new name');
});

t('client: a rename while reconnecting goes out right after the next S.Caps (a resume Hello never renames)', () => {
  const e = makeEnv();
  e.c.join('K7MQ4R', { look: LOOK, nick: 'Leo' }); const s = e.last(); s.open(); s.recv(welcomeMsg()); s.recv([S.Caps, CAPS_ALL]);
  s.drop();
  assert.equal(e.c.rename('Sam'), 'sent');
  e.advance(20000); const s2 = e.last(); s2.open(); s2.recv(welcomeMsg());
  assert.ok(!e.msgs(s2).some((m) => m[0] === C.Rename), 'not before S.Caps');
  s2.recv([S.Caps, CAPS_ALL]);
  const out = e.msgs(s2); assert.deepEqual(out[out.length - 1], [C.Rename, 'Sam']);
  s2.recv([S.Caps, CAPS_ALL]); assert.equal(e.msgs(s2).filter((m) => m[0] === C.Rename).length, 1, 'sent once');
});

t('client: an old relay (no Cap.Rename) never gets C.Rename: local only', () => {
  const e = makeEnv();
  e.c.join('K7MQ4R', { look: LOOK, nick: 'Leo' }); const s = e.last(); s.open(); s.recv(welcomeMsg()); s.recv([S.Caps, Cap.Live | Cap.Ball]);
  const before = s.sent.length;
  assert.equal(e.c.rename('Sam'), 'local');
  assert.equal(s.sent.length, before, 'no frame the old relay would count as bad');
  const e2 = makeEnv(); e2.c.join('K7MQ4R', { look: LOOK, nick: 'Leo' }); const s3 = e2.last(); s3.open(); s3.recv(welcomeMsg()); // v1.1 relay: no S.Caps at all
  assert.equal(e2.c.rename('Sam'), 'local');
  assert.ok(!e2.msgs(s3).some((m) => m[0] === C.Rename));
});

t('client: S.NameLock locks / unlocks my rename; a v1.5 S.Caps clears it (the relay re-sends locks); legacy Renamed still locks', () => {
  const e = makeEnv();
  e.c.join('K7MQ4R', { look: LOOK, nick: 'Leo' }); const s = e.last(); s.open(); s.recv(welcomeMsg()); s.recv([S.Caps, CAPS_ALL]);
  s.recv([S.NameLock, 2, 1]); assert.equal(e.c.nameLocked, false, 'someone else');
  s.recv([S.NameLock, 1, 1]); assert.equal(e.c.nameLocked, true); assert.equal(e.c.rename('Sam'), null);
  s.recv([S.NameLock, 1, 0]); assert.equal(e.c.nameLocked, false); assert.equal(e.c.rename('Sam'), 'sent');
  s.recv([S.NameLock, 1, 1]); s.recv([S.Caps, CAPS_ALL]); assert.equal(e.c.nameLocked, false, 'reset; the lock list follows C.Caps');
  s.recv([S.Renamed, 1, null]); assert.equal(e.c.nameLocked, true, 'an old relay reset');
  e.c.leave(); assert.equal(e.c.nameLocked, false);
});

t('client: host.nameLock sends C.NameLock only to a v1.5 relay (Cap.NameLock)', () => {
  const e = makeEnv();
  e.c.join('K7MQ4R', { look: LOOK, nick: 'Leo' }); const s = e.last(); s.open(); s.recv(welcomeMsg()); s.recv([S.Caps, 15]);
  e.c.host.nameLock(2, true); assert.ok(!e.msgs(s).some((m) => m[0] === C.NameLock), 'an old relay never sees it');
  s.recv([S.Caps, CAPS_ALL]); e.c.host.nameLock(2, true); e.c.host.nameLock(2, false);
  assert.deepEqual(e.msgs(s).filter((m) => m[0] === C.NameLock), [[C.NameLock, 2, 1], [C.NameLock, 2, 0]]);
  assert.ok(P.parseClient(s.sent[s.sent.length - 1]));
  assert.equal(typeof e.c.host.resetName, 'undefined', 'Reset name is gone');
});

t('store: nameLocks + canLockNames follow S.Caps / S.NameLock; Welcome and Left clear them', () => {
  st.partyStore.reset();
  st.partyStore.apply([20, 1, 1, 'tok-abcdefghij012345', 0, 0, 0, [[1, [2, 0], LOOK, 1, null, 'Emma'], [2, [1, 0], LOOK, 0, null, 'Leo']]], 0);
  assert.equal(st.partyStore.get().canLockNames, false);
  st.partyStore.apply([S.Caps, 15], 0); assert.equal(st.partyStore.get().canLockNames, false, 'an old relay');
  st.partyStore.apply([S.Caps, CAPS_ALL], 0); assert.equal(st.partyStore.get().canLockNames, true);
  st.partyStore.apply([S.NameLock, 2, 1], 0); st.partyStore.apply([S.NameLock, 2, 1], 0); assert.deepEqual([...st.partyStore.get().nameLocks], [2]);
  st.partyStore.apply([S.NameLock, 2, 0], 0); assert.deepEqual([...st.partyStore.get().nameLocks], []);
  st.partyStore.apply([S.NameLock, 2, 1], 0); st.partyStore.apply([S.Left, 2, 0], 0); assert.deepEqual([...st.partyStore.get().nameLocks], []);
  st.partyStore.apply([S.NameLock, 1, 1], 0);
  st.partyStore.apply([20, 1, 1, 'tok-abcdefghij012345', 0, 0, 0, [[1, [2, 0], LOOK, 1, null, 'Emma']]], 0);
  assert.deepEqual([...st.partyStore.get().nameLocks], []); assert.equal(st.partyStore.get().canLockNames, false, 'a Welcome waits for S.Caps again');
  st.partyStore.reset();
});

t('store: setOwnNick patches only my row; the relay echo (Joined) agrees; friends upsert in place', () => {
  st.partyStore.reset();
  st.partyStore.apply([20, 1, 2, 'tok-abcdefghij012345', 0, 0, 0, [[1, [2, 0], LOOK, 1, null, 'Emma'], [2, [1, 0], LOOK, 0, null, 'Leo']]], 0);
  let emits = 0; const off = st.partyStore.subscribe(() => emits++);
  st.partyStore.setOwnNick('Sam');
  let ms = st.partyStore.get().members;
  assert.equal(ms.find((x) => x.id === 2).nick, 'Sam'); assert.equal(ms.find((x) => x.id === 1).nick, 'Emma'); assert.equal(emits, 1);
  st.partyStore.setOwnNick('Sam'); assert.equal(emits, 1, 'no emit when unchanged');
  st.partyStore.apply([S.Joined, [1, [2, 0], LOOK, 1, null, 'Zoe']], 1);
  ms = st.partyStore.get().members; assert.equal(ms.length, 2, 'a rename never doubles a row'); assert.equal(ms.find((x) => x.id === 1).nick, 'Zoe');
  off(); st.partyStore.reset();
});

// ---- UI wiring (source checks; the phone screenshot covers the look) ----
t('UI: own row has Change name with the join form rules; friends rows are not editable', () => {
  const row = fs.readFileSync(path.join(ROOT, 'components/party/OwnNameRow.tsx'), 'utf8');
  const host = fs.readFileSync(path.join(ROOT, 'components/party/PartyHost.tsx'), 'utf8');
  const field = fs.readFileSync(path.join(ROOT, 'components/party/NickField.tsx'), 'utf8');
  assert.match(row, />Change name<\/button>/); assert.match(row, /<NickInput value=\{text\} onText=\{setText\}/, 'the join form box itself'); assert.match(row, /normalizeNick/);
  assert.doesNotMatch(row, /<input/, 'no second text input (owner rule: code boxes + the NickField box only)');
  assert.match(field, /export function NickInput/); assert.match(field, /<NickInput value=\{text\} onText=\{commit\}/, 'the join form uses it too');
  assert.match(field, /filterNickInput\(raw\)/); assert.match(field, /maxLength=\{NICK_MAX\}/); assert.match(field, /enterKeyHint="done"/);
  assert.match(row, /data-rename-save/); assert.match(row, /data-rename-cancel/);
  assert.match(host, /<OwnNameRow me=\{me\} locked=\{state\.nameLocks\.includes\(me\.id\) \|\| connection\.nameLocked\}/);
  assert.equal((host.match(/<OwnNameRow/g) || []).length, 1, "used once (own row only)");
  assert.match(host, /connection\.rename\(n\)/); assert.match(host, /setNick\(n\)/);
  assert.doesNotMatch(row, /localStorage|sessionStorage|document\.cookie/, 'memory only');
});

const rd = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
t('UI: plain text row buttons (Mute emotes / Hide friend / Change name / Lock name / Remove from party), no Reset name', () => {
  const host = rd('components/party/PartyHost.tsx'), row = rd('components/party/OwnNameRow.tsx'), chip = rd('components/party/RoomPartyChip.tsx');
  assert.match(row, /disabled aria-label="Name locked by the host"><Glyph name="lock" size=\{16\} \/>Name locked<\/button>/, 'locked: a disabled Name locked with a lock mark');
  const acts = host.slice(host.indexOf('data-row-actions'), host.indexOf('</span>\n                </li>'));
  assert.ok(acts.length > 100, 'found the friend row actions');
  for (const w of [/\? 'Emotes muted' : 'Mute emotes'\}<\/button>/, /\? 'Friend hidden' : 'Hide friend'\}<\/button>/, /\? 'Unlock name' : 'Lock name'\}<\/button>/, />Remove from party<\/button>/]) assert.match(acts, w);
  const buttons = acts.match(/<button[\s\S]*?<\/button>/g) || [];
  assert.equal(buttons.length, 4);
  for (const b of buttons) { assert.match(b, /className=\{styles\.act\}/); assert.doesNotMatch(b, /<Glyph|<Icon/, 'words only: ' + b.slice(0, 80)); }
  assert.match(acts, /state\.isHost && state\.canLockNames &&/, 'Lock name: host only, hidden on an old relay');
  assert.match(acts, /connection\.host\.nameLock\(m\.id, !nl\)/);
  assert.match(host, /'The host locked your name'/, 'toast to the locked player');
  assert.match(host, /data-party-help>Mute = no emotes from them\. Hide = hide them from your screen\.<\/p>/);
  assert.match(chip, /data-party-help>Mute = no emotes from them\. Hide = hide them from your screen\.<\/p>/, 'rooms roster matches');
  assert.match(chip, /\? 'Emotes muted' : 'Mute emotes'\}<\/button>/); assert.match(chip, /\? 'Friend hidden' : 'Hide friend'\}<\/button>/);
  for (const src of [host, row, chip]) assert.doesNotMatch(src, /Reset name|resetName|data-reset-name|data-act-label/);
  assert.doesNotMatch(host + chip, /className=\{styles\.mini\}[^>]*aria-label=\{`(Hide|Show|Remove|Mute|Unmute|Reset)/, 'no icon-only row button left');
  const css = rd('components/party/party.module.css');
  assert.match(css, /\.act\{[^}]*min-height:44px/, 'text buttons keep a 44px tap target');
  assert.match(css, /\.act\[data-danger\]\{color:var\(--party-danger\)\}/, 'Remove from party in the shared red');
});

t('UI: Remove, Leave party and End party all go through the one ConfirmStep (Cancel focused, armed red button)', () => {
  const host = rd('components/party/PartyHost.tsx'), chip = rd('components/party/RoomPartyChip.tsx'), cs = rd('components/party/ConfirmStep.tsx');
  // the X only opens the confirm; kick() runs only from the confirm's onYes
  assert.match(host, /data-remove-open[^>]*onClick=\{\(\) => askKick\(m\.id\)\}/);
  const kicks = host.match(/connection\.host\.kick\(/g) || []; assert.equal(kicks.length, 1);
  assert.match(host, /<ConfirmStep as="li" kind="remove" question=\{`Remove \$\{displayName\(m\)\} from the party\?`\} yes="Remove"\s+onYes=\{\(\) => \{ setConfirmKick\(null\); connection\.host\.kick\(m\.id\)/);
  assert.match(host, /<ConfirmStep kind="end" question="End the party for everyone\?" yes="End party"\s+onYes=\{\(\) => \{ track\.current\?\.\('end'\); trackHealth\(\); connection\.host\.end\(\)/);
  assert.equal((host.match(/connection\.host\.end\(\)/g) || []).length, 1, 'End only from the confirm');
  assert.doesNotMatch(host, /Tap again/, 'the old same-spot double tap is gone');
  assert.match(host, /<ConfirmStep kind="leave" question="Leave the party\?" yes="Leave" onYes=\{\(\) => \{ setConfirmLeave\(false\); leave\(\); \}\}/);
  assert.match(host, /data-party-leave onClick=\{\(\) => setConfirmLeave\(true\)\}/, 'Leave party only opens the confirm');
  assert.match(chip, /<ConfirmStep kind="room-leave" question="Leave the party\?" yes="Leave" onYes=\{leave\}/);
  assert.match(chip, /data-room-leave onClick=\{\(\) => setConfirmLeave\(true\)\}/);
  // ConfirmStep: Cancel is focused on open and comes after (to the right of) the red button; the red button is armed
  assert.match(cs, /cancel\.current\?\.focus/); assert.ok(cs.indexOf('data-confirm-yes') < cs.indexOf('data-confirm-cancel'));
  assert.match(cs, /performance\.now\(\) - openedAt\.current < CONFIRM_ARM_MS\) return/);
  const { CONFIRM_ARM_MS } = (() => { const m = { exports: {} }; vm.runInNewContext(ts.transpileModule(cs, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020 } }).outputText, { exports: m.exports, module: m, require: (id) => (id.endsWith('.css') ? {} : req(id)), performance: { now: () => 0 } }); return m.exports; })();
  assert.ok(CONFIRM_ARM_MS >= 300 && CONFIRM_ARM_MS <= 800, 'arming delay long enough to stop a double tap, short enough not to annoy');
});

t('UI: Leave party shares the End party destructive red (one token, no second red)', () => {
  const host = rd('components/party/PartyHost.tsx'), chip = rd('components/party/RoomPartyChip.tsx'), css = rd('components/party/party.module.css');
  const end = host.match(/<button type="button" className=\{styles\.(\w+)\} data-party-end/), leave = host.match(/<button type="button" className=\{styles\.(\w+)\} data-party-leave/);
  assert.ok(end && leave); assert.equal(leave[1], end[1], 'same class'); assert.equal(end[1], 'endLink');
  assert.match(chip, /className=\{`\$\{styles\.secondary\} \$\{styles\.dangerText\}`\} data-room-leave/, 'room Leave keeps its pill size, takes the red');
  assert.match(css, /\.endLink\{[^}]*color:var\(--party-danger\)/); assert.match(css, /\.dangerText\{color:var\(--party-danger\)\}/);
  assert.match(css, /\.danger\{background:var\(--party-danger\)/); assert.match(css, /\.act\[data-danger\]\{color:var\(--party-danger\)\}/);
  const reds = (css.match(/rgb\(163 38 28\)|#a3262a|#c8423f/gi) || []); assert.equal(reds.length, 1, 'the red is declared once');
});

console.log(`mp-rename: ${n} checks passed`);
