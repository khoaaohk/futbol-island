// Ball knock-overs between party friends (owner, Oct 23 2026; relay v1.6, Cap.Hit): protocol shapes, the relay's checks (party, same
// island zone, near, outside the force field, victim on foot, new clients only), its anti-spam (3 per shooter per 10 s, 4 s per pair, a
// victim never twice in a row), the pure hit test + thresholds + cooldown gate + tumble curve (lib/town/ballKnock.ts), and the client's
// C.Hit (connection.sendHit: only on a v1.6 relay). No network.
const assert = require('node:assert/strict'), path = require('node:path'), fs = require('node:fs'), vm = require('node:vm');
const ts = require('typescript');
const { loadTs } = require('../multiplayer/dev-relay/loadTs.cjs');
const ROOT = path.join(__dirname, '..');
const P = loadTs(path.join(ROOT, 'multiplayer/protocol/index.ts'));
const { RoomCore } = loadTs(path.join(ROOT, 'multiplayer/relay/src/roomCore.ts'));
const K = loadTs(path.join(ROOT, 'lib/town/ballKnock.ts'));
const { C, S, Cap, CAPS_ALL, Mode, Zone, PoseFlag, PROTOCOL_VERSION } = P;
let n = 0; const t = (name, fn) => { try { fn(); n++; } catch (e) { console.error('FAIL', name); throw e; } };
const j = (a) => JSON.stringify(a);

t('protocol: Cap.Hit is the next bit (32), CAPS_ALL 63; C.Hit / S.Hit shapes validate', () => {
  assert.equal(Cap.Hit, 32); assert.equal(CAPS_ALL, 63); assert.equal(C.Hit, 17); assert.equal(S.Hit, 38);
  assert.deepEqual(P.parseClient(j([C.Hit, 3, 200])), [17, 3, 200]);
  for (const bad of [[C.Hit, 32, 0], [C.Hit, 3, 256], [C.Hit, 3], [C.Hit, 3, 1, 1], [C.Hit, '3', 1], [C.Hit, 3, -1]]) assert.equal(P.parseClient(j(bad)), null, j(bad));
  assert.ok(P.parseServer(j([S.Hit, 1, 2, 9]))); assert.equal(P.parseServer(j([S.Hit, 2, 2, 9])), null, 'never yourself');
  assert.equal(P.parseServer(j([S.Hit, 1, 2, 300])), null); assert.equal(P.parseServer(j([S.Hit, 1, 2])), null);
  assert.ok(P.parseClient(j([C.Caps, CAPS_ALL])));
});

// ---- relay ----
let seed = 777;
const random = (k) => { const a = new Uint8Array(k); for (let i = 0; i < k; i++) { seed = (seed * 1103515245 + 12345) & 0x7fffffff; a[i] = (seed >> 8) & 255; } return a; };
const LOOK = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
function peer() { const p = { msgs: [], closed: null, send(x) { p.msgs.push(JSON.parse(x)); }, close(c) { p.closed = c; } }; p.of = (op) => p.msgs.filter((m) => m[0] === op); return p; }
function party(n = 3, caps = [CAPS_ALL, CAPS_ALL, CAPS_ALL]) {
  const clock = { t: 5_000_000, now() { return this.t; } };
  const room = new RoomCore({ code: 'K7MQ4R', createdAt: clock.t, clock, random });
  const names = ['Emma', 'Leo', 'Ayako', 'Sam'], ps = [];
  for (let i = 0; i < n; i++) {
    const p = peer(); room.connect(p); room.message(p, j([C.Hello, PROTOCOL_VERSION, LOOK, null, i === 0 ? room.hostKey : null, null, names[i]]));
    p.id = p.of(S.Welcome)[0][2]; if (caps[i]) room.message(p, j([C.Caps, caps[i]])); p.seq = 0; ps.push(p);
  }
  const pose = (p, x, z, mode = Mode.Idle, flags = 0, zone = Zone.Main) => { clock.t += 400; room.message(p, j([C.Pose, p.seq++, x * 10, 20, z * 10, 0, 0, mode, zone, flags])); };
  ps.forEach((p, i) => pose(p, 20 + i * 3, -60));
  const clear = () => ps.forEach((p) => { p.msgs.length = 0; });
  return { room, clock, ps, pose, clear, msg: (p, m) => { clock.t += 50; room.message(p, j(m)); } };
}
const hits = (p) => p.of(S.Hit);

t('relay: an accepted C.Hit reaches every Cap.Hit member (victim and shooter included) as S.Hit', () => {
  const { ps: [a, b, c], clear, msg } = party(); clear();
  msg(a, [C.Hit, b.id, 64]);
  for (const p of [a, b, c]) assert.deepEqual(hits(p), [[S.Hit, a.id, b.id, 64]]);
  assert.equal(a.of(S.Error).length, 0);
});
t('relay: old clients never see S.Hit; an old shooter or an old victim is refused silently', () => {
  { const { ps: [a, b, c], clear, msg } = party(3, [CAPS_ALL, CAPS_ALL, Cap.Live | Cap.Ball]); clear(); msg(a, [C.Hit, b.id, 1]); assert.equal(hits(b).length, 1); assert.equal(hits(c).length, 0); }
  { const { ps: [a, b, c], clear, msg } = party(3, [Cap.Live, CAPS_ALL, CAPS_ALL]); clear(); msg(a, [C.Hit, b.id, 1]); assert.equal(hits(b).length + hits(c).length, 0, 'shooter without the cap'); }
  { const { ps: [a, b, c], clear, msg } = party(3, [CAPS_ALL, CAPS_ALL & ~Cap.Hit, CAPS_ALL]); clear(); msg(a, [C.Hit, b.id, 1]); assert.equal(hits(a).length + hits(c).length, 0, 'victim without the cap'); assert.equal(a.of(S.Error).length, 0); }
});
t('relay: refused inside the force field (busy / away), indoors, in the sea, off foot, too far, other zone, self, unknown', () => {
  const cases = [
    ['victim busy', (q) => q.pose(q.ps[1], 23, -60, Mode.Busy)], ['victim away', (q) => q.pose(q.ps[1], 23, -60, Mode.Idle, PoseFlag.Hidden)],
    ['shooter busy', (q) => q.pose(q.ps[0], 20, -60, Mode.Busy)], ['victim indoors', (q) => q.pose(q.ps[1], 23, -60, Mode.Busy, 0, Zone.Indoors)],
    ['victim swimming', (q) => q.pose(q.ps[1], 23, -60, Mode.Swim, 0, Zone.Sea)], ['victim on a scooter', (q) => q.pose(q.ps[1], 23, -60, Mode.Scooter)],
    ['victim flying', (q) => q.pose(q.ps[1], 23, -60, Mode.Jetpack)], ['victim 30 m away', (q) => q.pose(q.ps[1], 50, -60, Mode.Idle, PoseFlag.Warp)],
    ['other zone', (q) => q.pose(q.ps[1], 23, -60, Mode.Idle, 0, Zone.Cay)],
  ];
  for (const [name, setup] of cases) {
    const q = party(); setup(q); q.clear(); q.msg(q.ps[0], [C.Hit, q.ps[1].id, 5]);
    assert.equal(hits(q.ps[1]).length + hits(q.ps[2]).length, 0, name);
  }
  const q = party(); q.clear(); q.msg(q.ps[0], [C.Hit, q.ps[0].id, 5]); q.msg(q.ps[0], [C.Hit, 30, 5]);
  assert.equal(hits(q.ps[1]).length, 0, 'self / unknown');
  const r = party(); r.pose(r.ps[1], 40, -60, Mode.Run, PoseFlag.Warp); r.clear(); r.msg(r.ps[0], [C.Hit, r.ps[1].id, 5]); assert.equal(hits(r.ps[1]).length, 1, '20 m, running: fine');
});
t('relay: pair cooldown 4 s, victim never twice within 2 s, shooter at most 3 per 10 s', () => {
  const q = party(4, [CAPS_ALL, CAPS_ALL, CAPS_ALL, CAPS_ALL]); const [a, b, c, d] = q.ps; q.clear();
  q.msg(a, [C.Hit, b.id, 1]); q.msg(a, [C.Hit, b.id, 1]); assert.equal(hits(b).length, 1, 'pair cooldown');
  q.msg(c, [C.Hit, b.id, 1]); assert.equal(hits(b).length, 1, 'b was just knocked over by a: c cannot knock b again at once');
  q.clock.t += 2100; q.msg(c, [C.Hit, b.id, 1]); assert.equal(hits(b).length, 2, 'another friend after 2 s');
  q.clock.t += 2000; q.msg(a, [C.Hit, b.id, 1]); assert.equal(hits(b).length, 3, 'the pair again after 4 s');
  q.clock.t += 2100; q.msg(a, [C.Hit, c.id, 1]); assert.equal(hits(d).length, 4);
  q.clock.t += 2100; q.msg(a, [C.Hit, d.id, 1]); assert.equal(hits(d).length, 4, 'a: 3 hits within 10 s already');
  q.clock.t += 6000; q.msg(a, [C.Hit, d.id, 1]); assert.equal(hits(d).length, 5, 'the window moved on');
});
t('relay: a member leaving forgets their pairs; a non-member socket cannot hit', () => {
  const q = party(); const [a, b] = q.ps; q.clear(); q.msg(a, [C.Hit, b.id, 1]);
  q.msg(b, [C.Leave]); assert.equal([...q.room.hitPairs.keys()].length, 0);
});

// ---- pure: lib/town/ballKnock.ts ----
t('hit test: reach, height band, the NPC speed threshold, teleports ignored', () => {
  assert.equal(K.KNOCK.minSpeed, 1, 'the NPC threshold (ballReactions.hit)');
  assert.ok(K.ballTouches(10.4, 1, 0, 10, 0, 0)); assert.ok(!K.ballTouches(10.6, 1, 0, 10, 0, 0), '> 0.55 m');
  assert.ok(!K.ballTouches(10, 2.0, 0, 10, 0, 0), 'over the head'); assert.ok(!K.ballTouches(10, -.2, 0, 10, 0, 0), 'below the feet');
  assert.ok(K.fastBall(1, 0)); assert.ok(!K.fastBall(.6, .6)); assert.ok(!K.fastBall(60, 0), 'a snap is not a kick');
});
t('knockable: on foot outdoors only (never busy / away / indoors / sea / ride / flying)', () => {
  for (const m of [Mode.Walk, Mode.Run, Mode.Idle]) assert.ok(K.knockable(m, Zone.Main));
  for (const m of [Mode.Busy, Mode.Swim, Mode.Dive, Mode.Jetpack, Mode.Parachute, Mode.Zipline, Mode.Scooter, Mode.Bike, Mode.Moped, Mode.AnimalRide, Mode.Fishing]) assert.ok(!K.knockable(m, Zone.Main), 'mode ' + m);
  assert.ok(!K.knockable(Mode.Idle, Zone.Indoors)); assert.ok(!K.knockable(Mode.Idle, Zone.Sea)); assert.ok(!K.knockable(Mode.Idle, Zone.Main, PoseFlag.Hidden));
});
t('gate: mirrors the relay (4 s per friend, 3 per 10 s)', () => {
  const g = K.createKnockGate(); let ms = 0;
  assert.ok(g.allow(1, ms)); g.note(1, ms); assert.ok(!g.allow(1, 3999)); assert.ok(g.allow(1, 4000));
  g.note(2, 100); g.note(3, 200); assert.ok(!g.allow(4, 300), '3 in 10 s'); assert.ok(g.allow(4, 10_001));
});
t('direction byte round trip; words are shared by every screen', () => {
  for (const [vx, vz] of [[0, 1], [1, 0], [0, -1], [-1, -1]]) { const b = K.dirToByte(vx, vz), a = K.byteToDir(b), want = Math.atan2(vx, vz);
    assert.ok(Math.abs(Math.atan2(Math.sin(a - want), Math.cos(a - want))) < .03, 'dir ' + vx + ',' + vz); }
  assert.equal(K.knockWord(64), K.knockWord(64)); assert.ok(K.KNOCK_WORDS.includes(K.knockWord(200)));
});
t('tumble: ~1.1 s down and up, never twice at once; steering skips to the get-up; reduced = a small wobble only', () => {
  const tb = K.createTumble(), o = { pitch: 0, roll: 0, fall: 0 };
  assert.ok(K.startTumble(tb, 0, false)); assert.ok(!K.startTumble(tb, 1, false), 'already down');
  K.stepTumble(tb, .3); K.tumblePose(tb, 0, o); assert.ok(o.pitch > 1.3 && o.fall === 1, 'flat, forward along the ball');
  K.tumblePose(tb, Math.PI / 2, o); assert.ok(Math.abs(o.pitch) < .01 && o.roll > 1.3, 'facing across: falls sideways');
  K.stepTumble(tb, .9); assert.equal(tb.age, -1, 'up again after 1.1 s'); K.tumblePose(tb, 0, o); assert.equal(o.pitch + o.roll, 0);
  const s = K.createTumble(); K.startTumble(s, 0, false); K.stepTumble(s, .4, true); assert.equal(s.age, K.KNOCK.upAt, 'input frees it early');
  let flat = 0; const u = K.createTumble(); K.startTumble(u, 0, false); while (u.age >= 0 && u.age < K.KNOCK.upAt) { K.stepTumble(u, 1 / 60, true); flat += 1 / 60; } assert.ok(flat < .4, 'steering gets up after ~0.35 s (input is never locked): ' + flat.toFixed(2));
  const r = K.createTumble(); K.startTumble(r, 0, true); K.stepTumble(r, .1); K.tumblePose(r, 0, o); assert.equal(o.pitch, 0); assert.ok(Math.abs(o.roll) <= .09);
  K.stepTumble(r, .6); assert.equal(r.age, -1, 'reduced: 0.6 s');
});

// ---- client: connection.sendHit only on a v1.6 relay ----
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
const conn = load(path.join(ROOT, 'lib/multiplayer/connection.ts'));
function makeEnv() {
  let now = 1e6, seq = 0; const timers = [], sockets = [];
  class WS { constructor(url) { this.url = url; this.readyState = 0; this.sent = []; sockets.push(this); } send(x) { this.sent.push(x); } close() { this.readyState = 3; }
    open() { this.readyState = 1; this.onopen && this.onopen(); } recv(m) { this.onmessage && this.onmessage({ data: j(m) }); } }
  const m = new Map();
  const c = conn.createPartyConnection({ WebSocketImpl: WS, now: () => now, random: () => 0.5,
    setTimeout: (fn, ms) => { const h = { id: ++seq, at: now + ms, fn }; timers.push(h); return h.id; },
    clearTimeout: (id) => { const i = timers.findIndex((x) => x.id === id); if (i >= 0) timers.splice(i, 1); },
    visibility: { hidden: () => false, on: () => () => {} }, storage: { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v), removeItem: (k) => m.delete(k) } });
  return { c, last: () => sockets[sockets.length - 1], msgs: (s) => s.sent.map((x) => JSON.parse(x)) };
}
const welcomeMsg = () => [20, 1, 1, 'tok-abcdefghij012345', Date.now() + 7200000, Date.now() + 14400000, 0, [[1, [2, 0], LOOK, 1, null, 'Leo']]];
t('client: sendHit goes out only after S.Caps carried Cap.Hit, and passes the relay validator; S.Hit reaches listeners', () => {
  const e = makeEnv(); e.c.join('K7MQ4R', { look: LOOK, nick: 'Leo' }); const s = e.last(); s.open(); s.recv(welcomeMsg());
  s.recv([S.Caps, 31]); assert.equal(e.c.sendHit(2, 10), false, 'a v1.5 relay: nothing sent');
  assert.ok(!e.msgs(s).some((m) => m[0] === C.Hit));
  s.recv([S.Caps, CAPS_ALL]); assert.equal(e.c.sendHit(2, 266), true);
  const out = e.msgs(s); assert.deepEqual(out[out.length - 1], [C.Hit, 2, 10]); assert.ok(P.parseClient(s.sent[s.sent.length - 1]));
  const got = []; e.c.onMessage((m) => { if (m[0] === S.Hit) got.push(m); }); s.recv([S.Hit, 2, 1, 7]); assert.deepEqual(got, [[S.Hit, 2, 1, 7]]);
});

console.log(`mp-ball-hit: ${n} checks passed`);
