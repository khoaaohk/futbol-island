// Multiplayer RoomCore rules (multiplayer/relay/src/roomCore.ts) with fake peers and a fake clock.
const assert = require('node:assert/strict');
const path = require('node:path');
const { loadTs } = require('../multiplayer/dev-relay/loadTs.cjs');
const ROOT = path.join(__dirname, '..');
const P = loadTs(path.join(ROOT, 'multiplayer/protocol/index.ts'));
const { RoomCore, CLOSE } = loadTs(path.join(ROOT, 'multiplayer/relay/src/roomCore.ts'));
const { C, S, ErrorCode, LeaveReason, EndReason, Mode, Zone, PoseFlag, PROTOCOL_VERSION, PARTY_MAX,
  CODE_TTL_MS, PARTY_MAX_MS, RESUME_GRACE_MS, HOST_GRACE_MS, EMPTY_CLOSE_MS } = P;

let seed = 12345;
const random = (n) => { const a = new Uint8Array(n); for (let i = 0; i < n; i++) { seed = (seed * 1103515245 + 12345) & 0x7fffffff; a[i] = (seed >> 8) & 255; } return a; };
const LOOK = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const mk = (t0 = 1_000_000) => {
  const clock = { t: t0, now() { return this.t; } };
  const room = new RoomCore({ code: 'K7MQ4R', createdAt: t0, clock, random });
  return { clock, room };
};
function peer() {
  const p = { msgs: [], closed: null, send(t) { p.msgs.push(JSON.parse(t)); }, close(c) { p.closed = c; } };
  p.of = (op) => p.msgs.filter((m) => m[0] === op);
  return p;
}
const hello = (room, p, resume = null, hostKey = null) => { room.connect(p); room.message(p, JSON.stringify([C.Hello, PROTOCOL_VERSION, LOOK, resume, hostKey])); };
const join = (room, hostKey = null) => { const p = peer(); hello(room, p, null, hostKey); return p; };
const welcome = (p) => p.of(S.Welcome)[0];
const send = (room, p, arr) => room.message(p, JSON.stringify(arr));
const pose = (seq, x, z, mode = Mode.Walk, flags = 0) => [C.Pose, seq, x, 0, z, 0, 0, mode, Zone.Main, flags];
const errs = (p) => p.of(S.Error).map((m) => m[1]);

// join, Welcome roster, Joined/Left
{
  const { room } = mk();
  const host = join(room, room.hostKey);
  const w = welcome(host);
  assert.equal(w[1], PROTOCOL_VERSION);
  assert.equal(w[7].length, 1);
  assert.equal(w[7][0][3], 1, 'hostKey holder is host');
  assert.equal(w[4], 1_000_000 + CODE_TTL_MS);
  assert.equal(w[5], 1_000_000 + PARTY_MAX_MS);
  const a = join(room);
  const wa = welcome(a);
  assert.equal(wa[7].length, 2, 'roster has everyone present');
  assert.equal(wa[7].find((m) => m[0] === wa[2])[3], 0, 'plain joiner is not host');
  assert.notDeepEqual(wa[7][0][1], wa[7][1][1], 'names unique');
  assert.equal(host.of(S.Joined).length, 1);
  assert.equal(host.of(S.Joined)[0][1][0], wa[2]);
  assert.equal(a.of(S.Joined).length, 0, 'no Joined for yourself');
  send(room, a, [C.Leave]);
  assert.deepEqual(host.of(S.Left)[0].slice(1), [wa[2], LeaveReason.Left]);
  assert.equal(a.closed, CLOSE.Normal);
  assert.equal(room.info().size, 1);
}
// hello timeout, bad first frame, bad version
{
  const { clock, room } = mk();
  const p = peer(); room.connect(p); clock.t += 4900; room.tick(); assert.equal(p.closed, null);
  clock.t += 200; room.tick(); assert.equal(p.closed, CLOSE.HelloTimeout);
  const q = peer(); room.connect(q); send(room, q, [C.Leave]); assert.equal(q.closed, CLOSE.BadMessages);
  const r = peer(); room.connect(r); send(room, r, [C.Hello, 99, LOOK, null, null]); assert.deepEqual(errs(r), [ErrorCode.BadVersion]); assert.ok(r.closed);
}
// Full at the 21st joiner, size/full in info(); Full does not eat a slot
{
  const { room } = mk();
  const ps = [join(room, room.hostKey)];
  for (let i = 1; i < PARTY_MAX; i++) ps.push(join(room));
  assert.equal(room.info().size, PARTY_MAX);
  assert.equal(room.info().full, true);
  assert.equal(room.info().open, false);
  const seventh = join(room);
  assert.deepEqual(errs(seventh), [ErrorCode.Full]);
  assert.ok(seventh.closed);
  assert.equal(room.info().size, PARTY_MAX);
  assert.equal(welcome(ps[PARTY_MAX - 1])[7].length, PARTY_MAX);
  assert.equal(new Set(ps.map((p) => welcome(p)[2])).size, PARTY_MAX, 'distinct ids');
  send(room, ps[3], [C.Leave]);
  assert.ok(welcome(join(room)), 'a slot frees up');
}
// Lock, NotHost, Kick (kicked cannot resume), Rotate
{
  const { clock, room } = mk();
  const host = join(room, room.hostKey);
  const a = join(room), b = join(room);
  const ida = welcome(a)[2], idb = welcome(b)[2];
  send(room, a, [C.Lock, 1]); assert.deepEqual(errs(a), [ErrorCode.NotHost]);
  send(room, a, [C.Kick, idb]); assert.deepEqual(errs(a), [ErrorCode.NotHost, ErrorCode.NotHost]);
  send(room, a, [C.End]); send(room, a, [C.Rotate]);
  assert.equal(room.ended, false);
  assert.equal(room.info().size, 3);
  send(room, host, [C.Lock, 1]);
  assert.equal(room.info().open, false);
  const late = join(room); assert.deepEqual(errs(late), [ErrorCode.Locked]);
  send(room, a, [C.Beat, 5]); assert.deepEqual(a.of(S.Beat), [[S.Beat, 5]], 'beat echoed');
  // the host still gets in while locked (hostKey)
  send(room, host, [C.Lock, 0]);
  assert.equal(room.info().open, true);
  const tokB = welcome(b)[3];
  clock.t += 5000; host.msgs.length = 0; a.msgs.length = 0;
  send(room, host, [C.Kick, idb]);
  assert.deepEqual(errs(b).slice(-1), [ErrorCode.Kicked]);
  assert.equal(b.closed, CLOSE.Kicked);
  assert.deepEqual(a.of(S.Left)[0].slice(1), [idb, LeaveReason.Kicked]);
  const again = peer(); hello(room, again, tokB);
  assert.deepEqual(errs(again), [ErrorCode.Kicked], 'kicked token revoked');
  assert.equal(room.info().size, 2);
  // Rotate: host gets the new code, the room keeps its members, TTL restarts
  const old = room.code;
  let seen = null; room.onRotate = (o, n) => { seen = [o, n]; };
  clock.t += 5000;
  send(room, host, [C.Rotate]);
  const sc = host.of(S.Code)[0];
  assert.ok(sc && sc[1] !== old && sc[1] === room.code && sc[1].length === 6);
  assert.deepEqual(seen, [old, room.code]);
  assert.equal(a.of(S.Code).length, 0, 'new code goes to the host only');
  assert.equal(room.info().size, 2);
  void ida;
}
// identity: colours unique across 6 joins (best-separated first); the old animal slot is parsed but ignored (always 0 on the wire)
{
  const { room } = mk();
  const helloA = (animal, resume = null, hostKey = null) => { const p = peer(); room.connect(p); room.message(p, JSON.stringify(animal === undefined ? [C.Hello, PROTOCOL_VERSION, LOOK, resume, hostKey] : [C.Hello, PROTOCOL_VERSION, LOOK, resume, hostKey, animal])); return p; };
  const ps = [helloA(3, null, room.hostKey), helloA(3), helloA(undefined), helloA(null), helloA(31), helloA(7)];
  const ws = ps.map(welcome);
  const mine = (w) => w[7].find((m) => m[0] === w[2])[1];
  const names = ws.map(mine);
  assert.equal(new Set(names.map((n) => n[0])).size, 6, 'colours unique across 6 joins');
  assert.deepEqual(names.map((n) => n[0]), P.COLOUR_ORDER.slice(0, 6), 'best-separated colours first');
  assert.ok(names.every((n) => n[1] === 0), 'the reserved second slot is always 0: an old client animal wish is ignored');
  // an out-of-range reserved slot is still a bad message
  const bad = peer(); room.connect(bad); room.message(bad, JSON.stringify([C.Hello, PROTOCOL_VERSION, LOOK, null, null, 99]));
  assert.ok(bad.closed, 'out-of-range reserved slot is refused (BadMessages)');
  // a leaver frees their colour
  send(room, ps[1], [C.Leave]);
  const again = helloA(5); assert.equal(mine(welcome(again))[0], names[1][0], 'freed colour is reused'); assert.equal(mine(welcome(again))[1], 0);
  room.disconnect(ps[4]);
  const back = helloA(0, ws[4][3]);
  assert.deepEqual(mine(welcome(back)), names[4], 'resume keeps the same colour');
}
// pickNameWith directly: deterministic colour, reserved slot 0
{
  assert.deepEqual(JSON.parse(JSON.stringify(P.pickNameWith([], () => 0.5))), [P.COLOUR_ORDER[0], 0]);
  assert.deepEqual(JSON.parse(JSON.stringify(P.pickNameWith([[P.COLOUR_ORDER[0], 0]], () => 0))), [P.COLOUR_ORDER[1], 0]);
}
// resume within 60 s keeps id and name; after 60 s the slot is gone (Left/Timeout)
{
  const { clock, room } = mk();
  const host = join(room, room.hostKey);
  const a = join(room);
  const wa = welcome(a);
  const myName = wa[7].find((m) => m[0] === wa[2])[1];
  room.disconnect(a);
  clock.t += RESUME_GRACE_MS - 1000; room.tick();
  assert.equal(host.of(S.Left).length, 0, 'no Left during grace');
  assert.equal(room.info().size, 2, 'slot held');
  const a2 = peer(); hello(room, a2, wa[3]);
  const w2 = welcome(a2);
  assert.equal(w2[2], wa[2]); assert.deepEqual(w2[7].find((m) => m[0] === w2[2])[1], myName);
  assert.equal(w2[3], wa[3]);
  assert.equal(host.of(S.Joined).length, 1, 'resume is invisible to others');
  room.disconnect(a2);
  clock.t += RESUME_GRACE_MS + 10; room.tick();
  assert.deepEqual(host.of(S.Left)[0].slice(1), [wa[2], LeaveReason.Timeout]);
  const late = peer(); hello(room, late, wa[3]);
  assert.ok(welcome(late) && welcome(late)[2] !== undefined, 'lapsed token = fresh join, new token');
  assert.notEqual(welcome(late)[3], wa[3]);
  // resume replaces a still-open old socket
  const old = late, repl = peer(); hello(room, repl, welcome(late)[3]);
  assert.equal(old.closed, CLOSE.Replaced); assert.ok(welcome(repl));
}
// host migration after 30 s; host can resume before then
{
  const { clock, room } = mk();
  const host = join(room, room.hostKey);
  const a = join(room), b = join(room);
  const wh = welcome(host);
  room.disconnect(host);
  clock.t += HOST_GRACE_MS - 1000; room.tick();
  assert.equal(a.of(S.Host).length, 0);
  clock.t += 1500; room.tick();
  assert.deepEqual(a.of(S.Host), [[S.Host, welcome(a)[2]]], 'oldest connected member becomes host');
  assert.deepEqual(b.of(S.Host), [[S.Host, welcome(a)[2]]]);
  send(room, a, [C.Lock, 1]); assert.equal(room.info().open, false, 'new host has host powers');
  const h2 = peer(); hello(room, h2, wh[3]);
  assert.equal(welcome(h2)[7].find((m) => m[0] === wh[2])[3], 0, 'returning host is a plain member now');
  // explicit host Leave migrates at once
  send(room, a, [C.Leave]);
  assert.equal(b.of(S.Host).length, 2);
  assert.equal(b.of(S.Host)[1][1], welcome(h2)[2], 'oldest connected member (the returned old host) takes over');
  // a host that returns within the grace keeps host
  const m2 = mk(); const hh = join(m2.room, m2.room.hostKey); const o = join(m2.room);
  m2.room.disconnect(hh); m2.clock.t += 20000; m2.room.tick();
  const hh2 = peer(); hello(m2.room, hh2, welcome(hh)[3]); m2.clock.t += 20000; m2.room.tick();
  assert.equal(o.of(S.Host).length, 0);
}
// code TTL 8 h rejects new joins; party ends at 12 h
{
  const { clock, room } = mk();
  const host = join(room, room.hostKey);
  clock.t += CODE_TTL_MS - 1; room.tick();
  assert.equal(room.info().open, true);
  const ok = join(room); assert.ok(welcome(ok));
  clock.t += 2;
  assert.equal(room.info().open, false);
  const late = join(room); assert.deepEqual(errs(late), [ErrorCode.Expired]);
  const rejoin = peer(); hello(room, rejoin, welcome(ok)[3]);
  room.disconnect(ok); // resume still allowed after code TTL
  const back = peer(); hello(room, back, welcome(ok)[3]); assert.ok(welcome(back));
  // rotate restarts the TTL
  clock.t += 5000; send(room, host, [C.Rotate]);
  assert.equal(room.info().open, true);
  clock.t = 1_000_000 + PARTY_MAX_MS - 1; room.tick(); assert.equal(room.ended, false);
  clock.t += 1; room.tick();
  assert.equal(room.ended, true);
  assert.deepEqual(host.of(S.Ended).slice(-1), [[S.Ended, EndReason.Expired]]);
  assert.ok(host.closed);
  assert.deepEqual(errs(join(room)), [ErrorCode.Expired]);
}
// End by host; empty close after 2 min; never-joined room also closes
{
  const { room } = mk();
  const host = join(room, room.hostKey), a = join(room);
  send(room, host, [C.End]);
  assert.ok(room.ended);
  assert.deepEqual(a.of(S.Ended), [[S.Ended, EndReason.HostEnded]]);
  assert.ok(a.closed && host.closed);
  const { clock, room: r2 } = mk();
  const p = join(r2, r2.hostKey);
  clock.t += 5000; send(r2, p, [C.Leave]);
  clock.t += EMPTY_CLOSE_MS - 1000; r2.tick(); assert.equal(r2.ended, false);
  clock.t += 1500; r2.tick(); assert.equal(r2.ended, true);
  const { clock: c3, room: r3 } = mk();
  c3.t += EMPTY_CLOSE_MS + 1; r3.tick(); assert.equal(r3.ended, true);
}
// batching: only dirty poses, once per tick, never to the sender; invalid / speed / warp rules
{
  const { clock, room } = mk();
  const host = join(room, room.hostKey), a = join(room), b = join(room);
  const ih = welcome(host)[2], ia = welcome(a)[2], ib = welcome(b)[2];
  host.msgs.length = a.msgs.length = b.msgs.length = 0;
  send(room, host, pose(1, 100, 100));
  send(room, a, pose(1, 200, 200));
  assert.equal(b.of(S.Poses).length, 0, 'nothing before the tick');
  room.tick();
  const flat = (p) => p.of(S.Poses).map((m) => m.slice(2));
  assert.deepEqual(flat(host), [[ia, 200, 0, 200, 0, 0, Mode.Walk, Zone.Main, 0]]);
  assert.equal(flat(b)[0].length, 18, 'b sees both host and a');
  assert.equal(flat(host)[0][0] === ih, false, 'host does not get its own pose');
  assert.equal(flat(a)[0][0], ih);
  assert.equal(a.of(S.Poses)[0][1], 1);
  room.tick();
  assert.equal(b.of(S.Poses).length, 1, 'clean members are not resent');
  clock.t += 1000;
  send(room, host, pose(2, 110, 100)); room.tick();
  assert.equal(b.of(S.Poses).length, 2); assert.equal(flat(b)[1].length, 9, 'only the dirty member');
  assert.equal(flat(host).length, 1, 'host got nothing for its own change');
  // speed cheat: 400 m in 1 s while walking is dropped
  clock.t += 1000;
  send(room, a, pose(2, 4200, 200)); room.tick();
  assert.equal(b.of(S.Poses).length, 2, 'speed-cheat pose not relayed');
  // out of bounds is a bad frame; 5 of them close the socket
  for (let i = 0; i < 5; i++) send(room, a, pose(10 + i, 99999, 0));
  assert.ok(a.closed);
  // warp: allowed once, second within 5 s dropped
  clock.t += 1000;
  send(room, b, pose(1, 300, 300)); room.tick();
  clock.t += 1000; send(room, b, pose(2, 5000, 300, Mode.Walk, PoseFlag.Warp)); room.tick();
  const n = host.of(S.Poses).length;
  clock.t += 1000; send(room, b, pose(3, 9000, 300, Mode.Walk, PoseFlag.Warp)); room.tick();
  assert.equal(host.of(S.Poses).length, n, 'second warp inside 5 s dropped');
  // old seq ignored
  clock.t += 1000; send(room, b, pose(2, 5010, 300)); room.tick(); // (under 8 s: no relay away flag yet)
  assert.equal(host.of(S.Poses).length, n);
  // Welcome carries the last pose of members for late joiners
  const late = join(room); const wl = welcome(late)[7].find((m) => m[0] === ib);
  assert.deepEqual(wl[4].slice(0, 3), [5000, 0, 300]);
}
// flood: > 30 frames in a second closes
{
  const { room } = mk();
  const host = join(room, room.hostKey), f = join(room);
  for (let i = 0; i < 40; i++) send(room, f, [C.Beat, i]);
  assert.equal(f.closed, CLOSE.Flood);
  assert.ok(errs(f).includes(ErrorCode.RateLimited));
  assert.equal(host.closed, null);
}
// emotes and pings relay to others only, with rate limits
{
  const { clock, room } = mk();
  const host = join(room, room.hostKey), a = join(room);
  send(room, a, [C.Emote, 1]); send(room, a, [C.Ping, 0, 100, 100]);
  assert.deepEqual(host.of(S.Emote), [[S.Emote, welcome(a)[2], 1]]);
  assert.deepEqual(host.of(S.Ping), [[S.Ping, welcome(a)[2], 0, 100, 100]]);
  assert.equal(a.of(S.Emote).length + a.of(S.Ping).length, 0, 'no self echo');
  for (let i = 0; i < 6; i++) send(room, a, [C.Emote, 0]);
  assert.equal(host.of(S.Emote).length, 2, 'emote burst capped at 2');
  clock.t += 100000;
}
// no token or hostKey ever reaches another peer
{
  const { clock, room } = mk();
  const host = join(room, room.hostKey), a = join(room), b = join(room);
  const secrets = [room.hostKey, welcome(host)[3], welcome(a)[3], welcome(b)[3]];
  send(room, a, pose(1, 10, 10)); send(room, a, [C.Emote, 2]); send(room, host, [C.Rotate]);
  room.tick(); clock.t += 1000; room.disconnect(b);
  const c = peer(); hello(room, c, welcome(b)[3]);
  secrets.push(welcome(c)[3]);
  const own = new Map([[host, welcome(host)[3]], [a, welcome(a)[3]], [b, welcome(b)[3]]]);
  for (const p of [host, a, b]) {
    for (const m of p.msgs) {
      const t = JSON.stringify(m);
      for (const s of secrets) {
        if (s === own.get(p) && m[0] === S.Welcome) continue;
        assert.ok(!t.includes(s), 'secret leaked to a peer: ' + t);
      }
    }
  }
  // the resumed socket gets its own token back only inside its Welcome
  assert.equal(c.msgs.filter((m) => JSON.stringify(m).includes(welcome(c)[3])).length, 1);
}
// codes: Welcome list is never above PARTY_MAX; hostKey format
{
  const { room } = mk();
  assert.match(room.hostKey, /^[A-Za-z0-9_-]{22}$/);
}
// review #1: Rotate retires the old code. It still reaches /ws, but admits only a resume token or the host key.
{
  const { clock, room } = mk();
  const host = join(room, room.hostKey), g = join(room);
  const gTok = welcome(g)[3], old = room.code;
  send(room, host, [C.Rotate]);
  assert.equal(host.of(S.Code).length, 1);
  assert.notEqual(room.code, old);
  assert.equal(room.codeStatus(old), 'retired'); assert.equal(room.codeStatus(room.code), 'current'); assert.equal(room.codeStatus('ZZZZZZ'), null);
  // a stranger on the retired code is refused, even with a made-up token
  const s1 = peer(); room.connect(s1, true); send(room, s1, [C.Hello, PROTOCOL_VERSION, LOOK, null, null]);
  assert.deepEqual(errs(s1), [ErrorCode.NotFound]); assert.ok(s1.closed);
  const s2 = peer(); room.connect(s2, true); send(room, s2, [C.Hello, PROTOCOL_VERSION, LOOK, 'x'.repeat(22), null]);
  assert.deepEqual(errs(s2), [ErrorCode.NotFound]);
  assert.equal(room.info().size, 2);
  // a guest whose socket dropped resumes through the old code
  room.disconnect(g); clock.t += 5000;
  const g2 = peer(); room.connect(g2, true); send(room, g2, [C.Hello, PROTOCOL_VERSION, LOOK, gTok, null]);
  assert.ok(welcome(g2), 'resume via the retired code'); assert.equal(welcome(g2)[2], welcome(g)[2]);
  // the host key also works through a retired code
  const h2 = peer(); room.connect(h2, true); send(room, h2, [C.Hello, PROTOCOL_VERSION, LOOK, null, room.hostKey]);
  assert.ok(welcome(h2), 'host key via the retired code');
}
// review #7: a resumed member restarts its pose counter at 0
{
  const { clock, room } = mk();
  const host = join(room, room.hostKey), g = join(room);
  const tok = welcome(g)[3];
  for (let i = 1; i <= 5; i++) { clock.t += 250; send(room, g, pose(i, 10 * i, 10)); }
  room.disconnect(g); clock.t += 3000;
  const g2 = peer(); hello(room, g2, tok);
  clock.t += 300; send(room, g2, pose(0, 55, 10)); room.tick();
  const last = host.of(S.Poses).pop(); assert.ok(last, 'poses flow'); assert.ok(last.includes(55), 'seq 0 after resume is accepted');
  clock.t += 300; send(room, g2, pose(100000, 58, 10)); room.tick();
  assert.ok(host.of(S.Poses).pop().includes(58), 'no 16-bit wrap: a large seq is fine');
}
// review #6: after a kick the room auto-locks for 60 s; a manual unlock clears it
{
  const { clock, room } = mk();
  const host = join(room, room.hostKey), g = join(room);
  send(room, host, [C.Kick, welcome(g)[2]]);
  assert.equal(room.info().open, false, 'closed right after a kick');
  assert.deepEqual(errs(join(room)), [ErrorCode.Locked]);
  clock.t += 61000; assert.equal(room.info().open, true);
  assert.ok(welcome(join(room)), 'open again after 60 s');
  const { clock: c2, room: r2 } = mk();
  const h2 = join(r2, r2.hostKey), g2 = join(r2);
  send(r2, h2, [C.Kick, welcome(g2)[2]]); c2.t += 1500; send(r2, h2, [C.Lock, 0]);
  assert.equal(r2.info().open, true, 'host unlock clears the auto-lock');
}
// review #2 / #14: snapshot + restore keeps lock, kicks, retired codes; only a digest of the host key is kept
{
  const { room } = mk();
  const host = join(room, room.hostKey), g = join(room);
  const gTok = welcome(g)[3];
  send(room, host, [C.Lock, 1]); send(room, host, [C.Rotate]);
  send(room, host, [C.Kick, welcome(g)[2]]);
  assert.equal(room.stateChanged, true);
  const snap = JSON.parse(JSON.stringify(room.snapshot()));
  assert.ok(!JSON.stringify(snap).includes(room.hostKey), 'no raw host key in the snapshot');
  assert.notEqual(room.digest, room.hostKey); assert.match(room.digest, /^[0-9a-f]{64}$/);
  const clock = { t: 1_000_000 + 1000, now() { return this.t; } };
  const back = new RoomCore({ code: 'K7MQ4R', createdAt: 1_000_000, clock, random, hostKeyHash: room.digest, restore: snap });
  assert.equal(back.hostKey, ''); assert.equal(back.code, room.code);
  assert.equal(back.codeStatus('K7MQ4R'), 'retired');
  const k = peer(); hello(back, k, gTok); assert.deepEqual(errs(k), [ErrorCode.Kicked], 'a revoked token stays revoked');
  assert.deepEqual(errs(join(back)), [ErrorCode.Locked], 'lock survives');
  assert.ok(welcome(join(back, room.hostKey)), 'the original host key still works against the digest');
  assert.deepEqual(errs(join(back, 'A'.repeat(22))), [ErrorCode.Locked]);
  // ended parties report it, so the Durable Object can write a tombstone
  const { room: r3 } = mk(); const h3 = join(r3, r3.hostKey); r3.stateChanged = false; send(r3, h3, [C.End]);
  assert.equal(r3.ended, true); assert.equal(r3.stateChanged, true);
}
// review #2: a hibernated Durable Object puts members back on their sockets from the attachment
{
  const { room } = mk();
  const host = join(room, room.hostKey), g = join(room);
  const ah = room.attachmentFor(host), ag = room.attachmentFor(g);
  assert.equal(ah.host, true); assert.equal(ag.host, false); assert.equal(room.attachmentFor(peer()), null);
  const clock = { t: 1_000_500, now() { return this.t; } };
  const back = new RoomCore({ code: 'K7MQ4R', createdAt: 1_000_000, clock, random, hostKeyHash: room.digest });
  const hp = peer(), gp = peer();
  back.restoreMember(hp, JSON.parse(JSON.stringify(ah))); back.restoreMember(gp, JSON.parse(JSON.stringify(ag)));
  assert.equal(back.info().size, 2);
  send(back, gp, [C.Emote, 1]);
  assert.equal(hp.of(S.Emote).length, 1, 'restored members talk to each other');
  send(back, hp, [C.Lock, 1]); assert.equal(back.info().open, false, 'restored host keeps host powers');
  const r = peer(); hello(back, r, ag.token); assert.equal(welcome(r)[2], ag.id, 'resume token survives the eviction');
}
// review #10: origin allow-list
{
  const { originAllowed, compileOrigins } = loadTs(path.join(ROOT, 'multiplayer/relay/src/origins.ts'));
  const prod = {};
  assert.equal(originAllowed('https://futbolisland.app', prod), true);
  assert.equal(originAllowed('https://www.futbolisland.app', prod), true);
  for (const bad of ['https://futbol-island-evil.vercel.app', 'http://localhost:3000', 'http://127.0.0.1', 'https://futbolisland.app.evil.com', null, '']) assert.equal(originAllowed(bad, prod), false, String(bad));
  const team = { MP_ALLOWED_ORIGINS: 'https://futbolisland.app, https://futbol-island-*-myteam.vercel.app' };
  assert.equal(originAllowed('https://futbol-island-git-feat-myteam.vercel.app', team), true);
  assert.equal(originAllowed('https://futbol-island-git-feat-other.vercel.app', team), false);
  assert.equal(originAllowed('https://futbol-island-x-myteam.vercel.app.evil.com', team), false);
  assert.equal(compileOrigins('not a url,*').length, 0, 'malformed entries are dropped');
  const dev = { MP_DEV: '1' };
  assert.equal(originAllowed('http://localhost:3000', dev), true); assert.equal(originAllowed(null, dev), true);
}

// first-name nick (owner decision): in memory only, set at Hello, host can reset, nothing persisted
{
  const { room, clock } = mk();
  const nickHello = (p, nick, resume = null, hostKey = null) => { room.connect(p); room.message(p, JSON.stringify([C.Hello, PROTOCOL_VERSION, LOOK, resume, hostKey, null, nick])); };
  const host = peer(); nickHello(host, 'EMMA', null, room.hostKey);
  assert.equal(welcome(host)[7][0][5], 'Emma', 'nick normalised and in the roster');
  const g = peer(); nickHello(g, 'élodie');
  const gw = welcome(g);
  assert.equal(gw[7].find((m) => m[0] === gw[2])[5], 'Élodie');
  assert.equal(host.of(S.Joined)[0][1][5], 'Élodie', 'Joined carries the nick');
  // the name is REQUIRED for new clients: a 7-element Hello with a bad / missing name is refused with BadName
  for (const badNick of ['Emma Lou', '12345', 'a', '', null]) {
    const r = peer(); nickHello(r, badNick);
    assert.deepEqual(errs(r), [ErrorCode.BadName], 'refused: ' + JSON.stringify(badNick)); assert.ok(r.closed === CLOSE.Refused); assert.equal(r.of(S.Welcome).length, 0);
  }
  // compatibility window: an old Hello (5 elements, no name) still joins, shown by colour name only
  const bad = peer(); hello(room, bad);
  assert.ok(welcome(bad), 'an old nick-less Hello still joins');
  assert.equal(welcome(bad)[7].find((m) => m[0] === welcome(bad)[2])[5], null, 'old Hello -> colour name only');
  const none = peer(); hello(room, none);
  assert.equal(welcome(none)[7].find((m) => m[0] === welcome(none)[2])[5], null, 'old Hello -> null');
  const idg = welcome(g)[2], idh = welcome(host)[2];
  // ResetName: host only, never on itself, broadcast to all
  send(room, g, [C.ResetName, idh]);
  assert.deepEqual(errs(g).slice(-1), [ErrorCode.NotHost], 'a guest cannot reset');
  assert.equal(host.of(S.Renamed).length, 0);
  clock.t += 2000;
  send(room, host, [C.ResetName, idh]);
  assert.equal(host.of(S.Renamed).length, 0, 'host cannot reset itself (no-op)');
  send(room, host, [C.ResetName, idg]);
  assert.deepEqual(g.of(S.Renamed)[0], [S.Renamed, idg, null], 'target hears Renamed');
  assert.deepEqual(host.of(S.Renamed)[0], [S.Renamed, idg, null], 'host hears Renamed');
  assert.deepEqual(bad.of(S.Renamed)[0], [S.Renamed, idg, null], 'everyone hears Renamed');
  const late = peer(); hello(room, late);
  assert.equal(welcome(late)[7].find((m) => m[0] === idg)[5], null, 'the reset sticks for later joiners');
  // resume keeps the nick; a resume Hello cannot rename
  const tok = welcome(host)[3];
  host.msgs.length = 0; room.disconnect(host);
  const host2 = peer(); nickHello(host2, 'Zed', tok);
  assert.equal(welcome(host2)[7].find((m) => m[0] === idh)[5], 'Emma', 'resume keeps the nick, ignores a new one');
  // leave / kick: nick vanishes with the member
  const k = peer(); nickHello(k, 'Kaya'); const idk = welcome(k)[2];
  clock.t += 2000; send(room, host2, [C.Kick, idk]);
  const probe = peer(); hello(room, probe, null, room.hostKey);
  assert.ok(!JSON.stringify(probe.msgs).includes('Kaya'), 'kicked nick is gone');
  // nothing persisted or attached
  assert.ok(!JSON.stringify(room.snapshot()).match(/Emma|Elodie|Élodie|Kaya|nick/i), 'no nick in the snapshot');
  const att = JSON.stringify([room.attachmentFor(host2), room.attachmentFor(g)]);
  assert.ok(!att.match(/Emma|Élodie|nick/i), 'no nick in the hibernation attachment');
  const { room: back } = mk();
  const rp = peer(); back.restoreMember(rp, room.attachmentFor(host2));
  const rj = peer(); hello(back, rj);
  assert.equal(welcome(rj)[7].find((m) => m[0] === idh)[5], null, 'after an eviction the nick is simply gone (colour name)');
  const src = require('node:fs').readFileSync(path.join(ROOT, 'multiplayer/relay/src/roomCore.ts'), 'utf8') + require('node:fs').readFileSync(path.join(ROOT, 'multiplayer/relay/src/partyRoom.ts'), 'utf8');
  assert.ok(!/console\.|\.put\(.*nick/.test(src), 'relay never logs or stores');
  // party end drops everything
  send(room, host2, [C.End]);
  assert.equal(room.ended, true);
}

// ---- 20 players: roster, 21st refused, unique colours, ids to 19+, interest management ----
{
  const { clock, room } = mk();
  const ps = [join(room, room.hostKey)];
  for (let i = 1; i < 20; i++) ps.push(join(room));
  assert.equal(PARTY_MAX, 20);
  assert.equal(room.info().size, 20); assert.equal(room.info().full, true); assert.equal(room.info().open, false);
  const w = welcome(ps[19]);
  assert.equal(w[7].length, 20, 'roster complete for the 20th joiner');
  assert.equal(new Set(w[7].map((m) => m[0])).size, 20, '20 distinct ids');
  assert.ok(w[7].every((m) => m[0] >= 0 && m[0] <= P.MAX_MEMBER_ID));
  assert.equal(new Set(w[7].map((m) => m[1][0])).size, 20, '20 unique colours');
  assert.deepEqual(w[7].map((m) => m[1][0]), P.COLOUR_ORDER.slice(0, 20));
  assert.ok(JSON.stringify(w).length < 8192, 'Welcome fits the server cap');
  for (let i = 0; i < 19; i++) assert.equal(ps[i].of(S.Joined).length, 19 - i, 'everyone earlier heard every later Joined');
  const extra = join(room);
  assert.deepEqual(errs(extra), [ErrorCode.Full], '21st refused: full');
  assert.ok(extra.closed);
  assert.equal(room.info().size, 20);
  // a freed slot is reusable; ids stay unique
  send(room, ps[7], [C.Leave]);
  const again = join(room); assert.ok(welcome(again));
  assert.equal(new Set(welcome(again)[7].map((m) => m[0])).size, 20);
}
{
  // interest management: 20 members on a line 10 m apart, all moving. Each normal tick = nearest 12 only; every 5th tick (beacon) = everyone changed since the last beacon.
  const { clock, room } = mk();
  const ps = [join(room, room.hostKey)];
  for (let i = 1; i < 20; i++) ps.push(join(room));
  const ids = ps.map((p) => welcome(p)[2]);
  const xAt = (i) => 1000 + i * 100; // 10 m apart (decimetres)
  let seq = 0;
  const moveAll = (dx) => { seq++; ps.forEach((p, i) => { clock.t += 1; send(room, p, pose(seq, xAt(i) + dx, 500)); }); clock.t += 200; };
  const clear = () => ps.forEach((p) => { p.msgs.length = 0; });
  const entries = (p) => p.of(S.Poses).flatMap((m) => { const out = []; for (let k = 2; k < m.length; k += 9) out.push(m[k]); return out; });
  // tick 1..4 are normal ticks
  moveAll(0); clear(); room.tick();
  // run ticks without the beacon: we need to know where the beacon falls; count ticks from a fresh room, so use the first four
  const mid = ps[10];
  assert.equal(mid.of(S.Poses).length, 1);
  const got = entries(mid);
  assert.equal(got.length, 12, 'normal tick: nearest 12 of the 19 moving friends');
  assert.ok(!got.includes(ids[10]), 'never itself');
  // nearest to member 10 (x index 10): neighbours by distance; ties by id
  const expect = ids.map((id, i) => ({ id, d: Math.abs(i - 10) })).filter((e) => e.id !== ids[10]).sort((a, b) => a.d - b.d || a.id - b.id).slice(0, 12).map((e) => e.id).sort((a, b) => a - b);
  assert.deepEqual(got.slice().sort((a, b) => a - b), expect, 'the 12 nearest, deterministic');
  // the edge member's 12 nearest are the 12 on one side
  const edge = entries(ps[0]).sort((a, b) => a - b);
  assert.deepEqual(edge, ids.slice(1, 13).sort((a, b) => a - b));
  // ticks 2,3,4: still 12; tick 5 = beacon: all 19 (changed since the last beacon)
  for (let n = 2; n <= 5; n++) {
    clear(); moveAll(n * 3); room.tick();
    const c = entries(ps[10]).length;
    if (n < 5) assert.equal(c, 12, 'tick ' + n + ' near only'); else assert.equal(c, 19, 'tick 5 is the 1 Hz beacon: everyone, so far friends still update');
  }
  assert.equal(entries(ps[0]).length, 19, 'beacon reaches the edge member too');
  // after the beacon the next ticks go back to near-only; an idle tick sends nothing
  clear(); moveAll(40); room.tick(); assert.equal(entries(ps[10]).length, 12);
  clear(); room.tick(); assert.equal(ps[10].of(S.Poses).length, 0, 'nothing moved: nothing sent');
  // with 12 or fewer movers every mover is sent (the old behaviour)
  clear(); seq++; for (let i = 0; i < 5; i++) send(room, ps[i], pose(seq + 100, xAt(i) + 77, 500)); room.tick();
  assert.deepEqual(entries(ps[15]).sort((a, b) => a - b), ids.slice(0, 5).sort((a, b) => a - b));
  assert.ok(room.stats.poseFrames > 0 && room.stats.poseEntries >= room.stats.poseFrames);
}
{
  // a far, slow friend is still on the roster/map: moves only seen via beacon (1 Hz); a lone mover inside the near set is sent every tick
  const { clock, room } = mk();
  const ps = [join(room, room.hostKey)]; for (let i = 1; i < 14; i++) ps.push(join(room));
  const ids = ps.map((p) => welcome(p)[2]);
  let seq = 0;
  const step = () => { seq++; ps.forEach((p, i) => { clock.t += 1; send(room, p, pose(seq, 1000 + i * 100 + seq, 500)); }); clock.t += 200; };
  const seen = new Map(); let ticks = 0;
  for (let n = 0; n < 10; n++) { ps.forEach((p) => { p.msgs.length = 0; }); step(); room.tick(); ticks++; ps[0].of(S.Poses).forEach((m) => { for (let k = 2; k < m.length; k += 9) seen.set(m[k], (seen.get(m[k]) || 0) + 1); }); }
  const far = ids[13]; // 13th friend of ps[0]: not among the nearest 12
  assert.equal(seen.get(far), 2, 'the far friend arrives only on the 2 beacons in 10 ticks (1 Hz)');
  assert.ok(seen.get(ids[1]) >= 10, 'the nearest friend arrives every tick');
}

// Presence (design 4.4.1): Busy poses, frozen positions, beats, the relay's 8 s away flag, emotes from a busy member
{
  const { clock, room } = mk();
  const { Activity, AWAY_SILENCE_MS } = P;
  const host = join(room, room.hostKey), a = join(room);
  const ia = welcome(a)[2];
  const last = (p, id) => { const ms = p.of(S.Poses); for (let j = ms.length - 1; j >= 0; j--) { const m = ms[j]; for (let k = 2; k < m.length; k += 9) if (m[k] === id) return m.slice(k + 1, k + 9); } return null; };
  send(room, a, pose(1, 300, 300)); room.tick();
  // goes busy (lesson): Mode.Busy with the Activity in the speed byte, the same spot
  clock.t += 200; send(room, a, [C.Pose, 2, 300, 0, 300, 0, Activity.Lesson, Mode.Busy, Zone.Main, 0]); room.tick();
  assert.deepEqual(last(host, ia), [300, 0, 300, 0, Activity.Lesson, Mode.Busy, Zone.Main, 0], 'Busy pose relayed with its activity');
  // frozen for a long while, then back 400 m away (the lesson moved them) with Warp: never a speed cheat
  for (let i = 0; i < 6; i++) { clock.t += 5000; send(room, a, [C.Beat, 1]); room.tick(); }
  assert.equal(last(host, ia)[7] & PoseFlag.Hidden, 0, 'beats every 5 s keep a busy member present (no away flag)');
  assert.equal(room.info().size, 2, 'busy member never dropped as idle');
  send(room, a, [C.Pose, 3, 4300, 0, 300, 0, 0, Mode.Walk, Zone.Main, PoseFlag.Warp]); room.tick();
  assert.deepEqual(last(host, ia).slice(0, 3), [4300, 0, 300], 'the warp back is relayed');
  // an emote from a busy member is dropped by the relay
  clock.t += 6000; send(room, a, [C.Pose, 4, 4300, 0, 300, 0, Activity.Quiz, Mode.Busy, Zone.Main, 0]); room.tick();
  const before = host.of(S.Emote).length; send(room, a, [C.Emote, 1]);
  assert.equal(host.of(S.Emote).length, before, 'no emotes from inside the force field');
  clock.t += 200; send(room, a, [C.Pose, 5, 4300, 0, 300, 0, 0, Mode.Idle, Zone.Main, 0]); room.tick();
  clock.t += 3000; send(room, a, [C.Emote, 1]); assert.equal(host.of(S.Emote).length, before + 1, 'emotes again once back');
  // silence: 8 s with no frame -> the relay sets the Hidden (away) flag itself; the next frame clears it
  clock.t += AWAY_SILENCE_MS - 100; send(room, host, [C.Beat, 1]); room.tick(); assert.equal(last(host, ia)[7] & PoseFlag.Hidden, 0);
  clock.t += 200; send(room, host, [C.Beat, 1]); room.tick();
  assert.equal(last(host, ia)[7] & PoseFlag.Hidden, PoseFlag.Hidden, 'away after 8 s of silence');
  const late = join(room); assert.equal(welcome(late)[7].find((m) => m[0] === ia)[4][7] & PoseFlag.Hidden, PoseFlag.Hidden, 'late joiner sees them away');
  clock.t += 200; send(room, a, [C.Beat, 2]); room.tick();
  assert.equal(last(host, ia)[7] & PoseFlag.Hidden, 0, 'a beat clears the relay away flag');
  // a dropped socket: away after 8 s, still a member; resume inside the 60 s grace clears it
  const tok = welcome(a)[3];
  room.disconnect(a); clock.t += AWAY_SILENCE_MS + 200; room.tick();
  assert.equal(last(host, ia)[7] & PoseFlag.Hidden, PoseFlag.Hidden, 'dropped -> away, not gone');
  assert.equal(host.of(S.Left).filter((m) => m[1] === ia).length, 0);
  const a2 = peer(); hello(room, a2, tok); clock.t += 200; room.tick();
  assert.equal(welcome(a2)[2], ia, 'resumed the same slot'); assert.equal(last(host, ia)[7] & PoseFlag.Hidden, 0, 'back from away on resume');
  // indoors (a room on another page) is never flagged away; the grace ends with LeaveReason.Indoors
  send(room, a2, [C.Pose, 0, 4300, 0, 300, 0, Activity.Museum, Mode.Busy, Zone.Indoors, 0]); room.tick();
  room.disconnect(a2); clock.t += AWAY_SILENCE_MS + 200; room.tick();
  assert.equal(last(host, ia)[6], Zone.Indoors); assert.equal(last(host, ia)[7] & PoseFlag.Hidden, 0, 'indoors stays indoors');
  clock.t += 60_000; send(room, host, [C.Beat, 3]); room.tick();
  assert.deepEqual(host.of(S.Left).filter((m) => m[1] === ia)[0].slice(1), [ia, LeaveReason.Indoors]);
}

// stats counters + buckets survive snapshot / restore (relay analytics, Phase B)
{
  const { clock, room } = mk();
  const host = join(room, room.hostKey);
  const a = join(room), b = join(room);
  const tok = welcome(a)[3];
  send(room, host, [C.Lock, 1]); clock.t += 5000; send(room, host, [C.Lock, 0]); clock.t += 5000;
  send(room, host, [C.Rotate]); clock.t += 5000;
  const late = join(room); // a fresh code, unlocked: fine
  send(room, host, [C.Kick, welcome(b)[2]]);
  room.disconnect(a); clock.t += 1000; hello(room, peer(), tok);
  const full = join(room, null); assert.ok(full);
  const snap = JSON.parse(JSON.stringify(room.snapshot()));
  const st = snap.stats;
  assert.equal(st.locks, 1); assert.equal(st.rotates, 1); assert.equal(st.kicks, 1); assert.equal(st.resumes, 1);
  assert.ok(st.joins >= 4 && st.peak >= 3 && st.msgs >= 4, 'counters moved');
  assert.deepEqual(Object.keys(st.buckets).sort(), ['joins', 'len', 'msgs', 'peak']);
  assert.equal(st.buckets.msgs, 'lt_1k');
  const room2 = new RoomCore({ code: snap.code, createdAt: 1_000_000, clock, random, hostKeyHash: room.digest, restore: snap });
  assert.deepEqual(room2.snapshot().stats.buckets.peak, st.buckets.peak);
  const s2 = room2.summary();
  assert.equal(s2.locks, 1); assert.equal(s2.rotates, 1); assert.equal(s2.kicks, 1); assert.equal(s2.resumes, 1); assert.equal(s2.joins, st.joins);
  assert.equal(s2.peak, st.peak);
  assert.equal(JSON.stringify(snap.stats).includes('K7MQ4R'), false, 'no code in the counters');
  // an old snapshot without stats restores with zero counters
  const old = { ...snap }; delete old.stats;
  assert.equal(new RoomCore({ code: snap.code, createdAt: 1_000_000, clock, random, hostKeyHash: room.digest, restore: old }).summary().joins, 0);
  // refusals are counted by reason, ended room counts as closed
  const { room: r3 } = mk();
  const h3 = join(r3, r3.hostKey); send(r3, h3, [C.Lock, 1]); join(r3);
  assert.equal(r3.summary().fails.locked, 1);
  send(r3, h3, [C.End]); join(r3);
  assert.equal(r3.summary().fails.closed, 1); assert.equal(r3.summary().endReason, EndReason.HostEnded);
}
console.log('mp-room-core: ok');
