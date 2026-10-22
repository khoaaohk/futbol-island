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
// Full at the 7th joiner, size/full in info(); Full does not eat a slot
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
  assert.equal(welcome(ps[5])[7].length, PARTY_MAX);
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
// code TTL 2 h rejects new joins; party ends at 4 h
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
  clock.t += 6000; send(room, b, pose(2, 5010, 300)); room.tick();
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
console.log('mp-room-core: ok');
