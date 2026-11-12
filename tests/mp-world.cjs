// Relay v2.0 public worlds (docs/multiplayer/WORLD-HANDOFF.md): RoomCore kind 'world', WorldLobbyCore, the WorldLobby object and the
// worker's /world + /control routes, with fake peers, a fake clock and fake Durable Object stubs. Plain node, no network.
const assert = require('node:assert/strict');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { loadTs } = require('../multiplayer/dev-relay/loadTs.cjs');
const ROOT = path.join(__dirname, '..');
const P = loadTs(path.join(ROOT, 'multiplayer/protocol/index.ts'));
const { RoomCore, CLOSE } = loadTs(path.join(ROOT, 'multiplayer/relay/src/roomCore.ts'));
const LC = loadTs(path.join(ROOT, 'multiplayer/relay/src/worldLobbyCore.ts'));
const SC = loadTs(path.join(ROOT, 'multiplayer/relay/src/relayStatsCore.ts'));
const { C, S, Mode, Zone, Emote, LeaveReason, ErrorCode, PROTOCOL_VERSION, CAPS_WORLD, CAPS_ALL, Cap, WORLD_HARD, WORLD_SOFT } = P;

let n = 0;
const t = (name, fn) => { try { fn(); n++; } catch (e) { console.error('FAIL', name); throw e; } };
let seed = 4242;
const random = (k) => { const a = new Uint8Array(k); for (let i = 0; i < k; i++) { seed = (seed * 1103515245 + 12345) & 0x7fffffff; a[i] = (seed >> 8) & 255; } return a; };
const LOOK = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
function peer() {
  const p = { msgs: [], raw: [], closed: null, seq: 0, send(x) { p.raw.push(x); p.msgs.push(JSON.parse(x)); }, close(c) { if (p.closed === null) p.closed = c; } };
  p.of = (op) => p.msgs.filter((m) => m[0] === op);
  return p;
}
function world(kind = 'world') {
  const clock = { t: 1_000_000, now() { return this.t; } };
  const room = new RoomCore({ code: 'pub-1', createdAt: clock.t, clock, random, kind });
  const W = { clock, room, stats: [], holds: [], half: false };
  room.onStat = (id) => W.stats.push(id); room.onHold = (h) => W.holds.push(h);
  W.run = (ms) => { for (let e = 0; e < ms; e += 100) { clock.t += 100; W.half = !W.half; if (W.half) room.halfTick(); else room.tick(); } };
  return W;
}
const send = (W, p, arr) => W.room.message(p, JSON.stringify(arr));
function join(W, { nick, ipKey = null, held = false, caps = CAPS_WORLD, resume = null, hostKey = null } = {}) {
  const p = peer();
  W.room.connect(p, false, { ipKey, held });
  const h = [C.Hello, PROTOCOL_VERSION, LOOK, resume, hostKey];
  if (nick !== undefined) h.push(null, nick);
  send(W, p, h);
  const w = p.of(S.Welcome)[0];
  if (w) { p.id = w[2]; p.token = w[3]; }
  const sc = p.of(S.Caps)[0];
  if (sc && caps) send(W, p, [C.Caps, sc[1] & caps]);
  return p;
}
const at = (W, p, x, z, { flags = 0, mode = Mode.Walk } = {}) => send(W, p, [C.Pose, ++p.seq, x, 0, z, 0, 0, mode, Zone.Main, flags]);
/** Who p currently knows, replayed from its frames (Welcome resets, Joined adds, Left removes). */
function known(p) {
  const s = new Set();
  for (const m of p.msgs) {
    if (m[0] === S.Welcome) { s.clear(); for (const mi of m[7]) if (mi[0] !== m[2]) s.add(mi[0]); }
    else if (m[0] === S.Joined) s.add(m[1][0]);
    else if (m[0] === S.Left) s.delete(m[1]);
  }
  return s;
}
/** Member ids whose poses reached p after frame index `from`. */
function posedIds(p, from = 0) {
  const ids = new Set();
  for (const m of p.msgs.slice(from)) {
    if (m[0] === S.Live) for (let i = 0; i < m[2].length; i += 10) ids.add(m[2][i]);
    if (m[0] === S.Poses) for (let i = 2; i < m.length; i += 9) ids.add(m[i]);
  }
  return ids;
}
const lastOf = (p, op) => { const l = p.of(op); return l.length ? l[l.length - 1] : undefined; };
const strings = (v, out = []) => { if (typeof v === 'string') out.push(v); else if (Array.isArray(v)) v.forEach((x) => strings(x, out)); return out; };

t('protocol: world constants, caps, new frames', () => {
  assert.equal(WORLD_SOFT, 26); assert.equal(WORLD_HARD, 30); assert.ok(WORLD_HARD <= P.MAX_MEMBER_ID + 1 - P.WORLD_ID_SPARE, '2 member ids stay spare'); assert.equal(P.WORLD_SEE_M, 160); assert.equal(P.QUIET_RANGE_M, 40);
  assert.equal(P.WORLD_AWAY_GRACE_MS, 120000); assert.equal(P.WORLD_IDLE_MS, 300000);
  assert.deepEqual({ ...P.FOLLOW }, { nearM: 4, holdMs: 45000, movedM: 30, releaseM: 15, releaseMs: 30000 });
  assert.deepEqual({ ...P.ReportReason }, { Following: 0, InMyWay: 1, TooManyWaves: 2, SomethingElse: 3 });
  assert.deepEqual([...P.REPORT_REASON_IDS], [...SC.REPORT_REASONS], 'relay stats reasons = protocol reasons');
  assert.equal(CAPS_ALL, 255, 'a party is offered exactly what it was');
  assert.equal(Cap.World, 256); assert.equal(Cap.Quiet, 512); assert.equal(Cap.Report, 1024);
  assert.equal(CAPS_WORLD & (Cap.Rename | Cap.NameLock | Cap.Hit), 0, 'no rename, name lock or knock-over between strangers');
  assert.equal(C.Report, 60); assert.equal(S.Quiet, 41); assert.equal(S.World, 42); assert.equal(LeaveReason.Far, 4);
  assert.deepEqual({ ...P.CloseCode }, { WorldOff: 4007, Idle: 4008 }); assert.equal(CLOSE.WorldOff, 4007); assert.equal(CLOSE.Idle, 4008);
  const j = JSON.stringify;
  assert.ok(P.parseClient(j([60, 5, 0]))); assert.ok(P.parseClient(j([60, 31, 3]))); assert.equal(P.parseClient(j([60, 5, 4])), null); assert.equal(P.parseClient(j([60, 32, 0])), null);
  assert.equal(P.parseClient(j([60, 5, 'Following'])), null, 'reasons are ints');
  assert.ok(P.encode([60, 1, 0]).length < 20);
  assert.ok(P.parseServer(j([41, 0]))); assert.ok(P.parseServer(j([42, WORLD_HARD]))); assert.equal(P.parseServer(j([42, WORLD_HARD + 1])), null); assert.equal(P.parseServer(j([41, 'x'])), null);
  assert.ok(P.parseServer(j([22, 3, 4])), 'S.Left Far'); assert.ok(P.parseServer(j([32, CAPS_WORLD]))); assert.ok(P.parseClient(j([11, CAPS_WORLD])));
});

t('names: 32 reviewed animals, world colours, [colour, animal] fits the old wire', () => {
  const A = P.WORLD_ANIMALS;
  assert.equal(A.length, 32); assert.equal(new Set(A).size, 32); assert.equal(A.length, P.RESERVED_NAME_SLOTS);
  for (const a of A) assert.match(a, /^[A-Z][a-z]{2,9}$/, a);
  const banned = ['Pig', 'Cow', 'Donkey', 'Monkey', 'Ape', 'Rat', 'Snake', 'Shark', 'Wolf', 'Fox', 'Lion', 'Tiger', 'Eagle', 'Magpie', 'Owl', 'Canary', 'Seagull', 'Hornet', 'Bee', 'Robin', 'Swan', 'Ram', 'Zebra', 'Chicken', 'Sloth', 'Snail', 'Whale', 'Beaver', 'Spider', 'Bat', 'Worm', 'Skunk', 'Hyena', 'Gorilla'];
  for (const b of banned) assert.ok(!A.includes(b), b);
  for (const c of P.WORLD_COLOUR_ORDER) assert.ok(!['Yellow', 'Peach', 'Brown', 'Black', 'White'].includes(P.NAME_COLOURS[c]));
  assert.equal(P.WORLD_COLOUR_ORDER.length, 15);
  assert.equal(P.worldNameFor([1, 0]), 'Blue Otter'); assert.equal(P.nameFor([1, 0]), 'Blue', 'an old client shows the colour only');
  const member = [3, [7, 31], LOOK, 0, null];
  assert.ok(P.parseServer(JSON.stringify([21, member])), 'a world roster row parses with the party parser shape (5 elements)');
});

t('no free text in any world frame: nicks in Hello are dropped, never echoed', () => {
  const W = world();
  const nicks = ['Emma', 'Zoë', 'Abcdefghijkl', 'bad name', 'x', 'http://evil', '🙂', '', 'NULL', 'Ölaf', 'Jo', 'Fred'];
  const ps = nicks.map((nk, i) => { const p = join(W, { nick: nk, ipKey: 'aa' + i.toString(16).padStart(6, '0') }); assert.ok(p.of(S.Welcome)[0], 'admitted with nick ' + j(nk)); return p; });
  function j(x) { return JSON.stringify(x); }
  ps.push(join(W)); // a 5-element Hello too
  ps.forEach((p, i) => at(W, p, 1000 + i * 30, 500));
  W.run(1200);
  ps.forEach((p) => send(W, p, [C.Emote, Emote.Wave]));
  W.run(1200);
  for (const p of ps) {
    assert.equal(p.closed, null); assert.deepEqual(p.of(S.Error), []);
    const w = p.of(S.Welcome)[0];
    assert.deepEqual(w.slice(4, 7), [0, 0, 0], 'no code expiry, no party end, never locked');
    for (const m of p.msgs) {
      for (const s of strings(m)) assert.equal(s, p.token, 'only my own resume token is a string: ' + JSON.stringify(m).slice(0, 80));
      assert.ok(P.parseServer(JSON.stringify(m)), 'parses: ' + JSON.stringify(m).slice(0, 60));
      if (m[0] === S.Joined) assert.equal(m[1].length, 5, 'roster rows carry no nick slot');
      if (m[0] === S.Welcome) for (const mi of m[7]) { assert.equal(mi.length, 5); assert.equal(mi[3], 0, 'nobody is host'); }
    }
    for (const nk of nicks) if (nk.length >= 2) assert.ok(!p.raw.some((r) => r.includes('"' + nk + '"')), 'nick ' + nk + ' never sent');
    assert.ok(known(p).size >= 10, 'everyone near sees everyone');
    assert.equal(lastOf(p, S.Caps)[1], CAPS_WORLD);
  }
});

t('refused in world mode: Kick, Lock, Rotate, End, NameLock, Rename, Ping, Hit (silently); a host key makes nobody host', () => {
  const W = world();
  const a = join(W, { hostKey: W.room.hostKey }), b = join(W);
  at(W, a, 1000, 500); at(W, b, 1010, 500); W.run(400);
  assert.equal(a.of(S.Welcome)[0][7][0][3], 0);
  const before = b.msgs.length, beforeA = a.msgs.length;
  for (const m of [[C.Kick, b.id], [C.Lock, 1], [C.Rotate], [C.End], [C.NameLock, b.id, 1], [C.Rename, 'Bobby'], [C.Ping, 0, 1000, 500], [C.Ping, 1, 1000, 500], [C.Hit, b.id, 10], [C.ResetName, b.id]]) send(W, a, m);
  W.run(100);
  assert.equal(W.room.ended, false); assert.equal(b.closed, null); assert.equal(a.closed, null);
  assert.deepEqual(b.msgs.slice(before).filter((m) => ![S.Live, S.Poses, S.Quiet, S.World].includes(m[0])), [], 'nothing reaches the other member');
  assert.deepEqual(a.msgs.slice(beforeA).filter((m) => m[0] === S.Error || m[0] === S.Code || m[0] === S.Ended), [], 'no NotHost error: refused silently');
  for (let i = 0; i < 8; i++) send(W, a, [C.Kick, b.id]);
  assert.equal(a.closed, null, 'refused frames are never counted as bad');
});

t('names: unique animals per world, in range, re-rolled on a fresh join, kept on a resume; hard cap WORLD_HARD', () => {
  const W = world();
  const ps = [];
  for (let i = 0; i < WORLD_HARD; i++) ps.push(join(W));
  const names = ps.map((p) => p.of(S.Welcome)[0][7].find((m) => m[0] === p.id)[1]);
  assert.equal(new Set(names.map((x) => x[1])).size, WORLD_HARD, 'animals unique per world');
  for (const [c, a] of names) { assert.ok(P.WORLD_COLOUR_ORDER.includes(c)); assert.ok(a >= 0 && a < 32); }
  const extra = join(W);
  assert.deepEqual(extra.of(S.Error).map((m) => m[1]), [ErrorCode.Full]); assert.equal(extra.closed, CLOSE.Refused);
  // a member who walks through a door of a FULL world (the lobby keeps ?in=) resumes its own seat; a fresh join is still refused
  W.room.disconnect(ps[WORLD_HARD - 1]); W.run(1000);
  const back = join(W, { resume: ps[WORLD_HARD - 1].token });
  assert.equal(back.id, ps[WORLD_HARD - 1].id, 'a seat holder comes back into a full world'); assert.equal(back.of(S.Error).length, 0);
  assert.deepEqual(join(W).of(S.Error).map((m) => m[1]), [ErrorCode.Full], 'still full for a newcomer');
  // fresh joins: a new name (most of the time) and a new token
  for (let k = 8; k < WORLD_HARD - 1; k++) send(W, ps[k], [C.Leave]); send(W, back, [C.Leave]); // the cap is 30 of 32 animals: re-roll in a part-full world
  let changed = 0;
  for (let k = 0; k < 8; k++) {
    const p = ps[k], old = names[k];
    send(W, p, [C.Leave]);
    const q = join(W);
    const nm = q.of(S.Welcome)[0][7].find((m) => m[0] === q.id)[1];
    if (nm[0] !== old[0] || nm[1] !== old[1]) changed++;
  }
  assert.ok(changed >= 7, 'a fresh join rolls a new name (' + changed + '/8)');
  // a resume within the grace keeps the slot and the name
  const W2 = world();
  const r = join(W2);
  const nm = r.of(S.Welcome)[0][7][0][1];
  W2.room.disconnect(r); W2.run(1000);
  const r2 = join(W2, { resume: r.token });
  assert.equal(r2.id, r.id); assert.deepEqual(r2.of(S.Welcome)[0][7][0][1], nm);
});

t('lobby: fill-first, soft 26 / hard 30, reservations, open and forget shards, counts only, default closed', () => {
  let now = 5_000_000, token = true;
  const L = new LC.WorldLobbyCore(() => now, () => token);
  assert.deepEqual(L.assign(), { open: false }, 'stored switch defaults to off');
  L.stored = true;
  token = false; assert.deepEqual(L.assign(), { open: false }, 'no CONTROL_TOKEN: closed whatever is stored'); token = true;
  assert.deepEqual(L.assign(), { open: true, shard: 1, n: 0 });
  L.report(1, 1);
  assert.equal(L.assign().shard, 1);
  L.report(1, WORLD_SOFT);
  assert.deepEqual(L.assign(), { open: true, shard: 2, n: 0 }, 'shard 1 at the soft cap: a new shard');
  L.report(2, 5); L.report(1, WORLD_SOFT - 1);
  now += LC.RESERVE_MS; // reservations lapse
  assert.equal(L.assign().shard, 1, 'the fullest under the soft cap');
  now += LC.RESERVE_MS;
  L.report(1, WORLD_SOFT + 2);
  assert.deepEqual(L.assign(1), { open: true, shard: 1, n: WORLD_SOFT + 2 }, 'a member already assigned may come back up to the hard cap');
  assert.equal(L.assign().shard, 2, 'but nobody new is sent to a world over the soft cap');
  now += LC.RESERVE_MS; L.report(1, WORLD_HARD);
  assert.deepEqual(L.assign(1), { open: true, shard: 1, n: WORLD_HARD - 1 }, 'a full world keeps a returning member (a door / reconnect usually still holds a seat; n leaves the caller out)');
  assert.equal(L.assign().shard, 2, 'a newcomer never goes to a full world');
  assert.equal(L.assign(9).shard, 2, 'a gone world: assigned like a newcomer');
  // a burst of lookups before any socket arrives still fills in order
  const L2 = new LC.WorldLobbyCore(() => now, () => true); L2.stored = true;
  const got = []; for (let i = 0; i < 2 * WORLD_SOFT + 5; i++) got.push(L2.assign().shard);
  assert.deepEqual([got.filter((s) => s === 1).length, got.filter((s) => s === 2).length, got.filter((s) => s === 3).length], [WORLD_SOFT, WORLD_SOFT, 5]);
  // empty shards are forgotten; stale ones too
  L.report(2, 0);
  assert.deepEqual(L.state().shards.map((s) => s.shard), [1]);
  now += LC.SHARD_STALE_MS;
  assert.deepEqual(L.state().shards, [], 'no report for 90 s: forgotten');
  const st = JSON.stringify(L.state());
  assert.ok(!/name|id"|pos|hash/.test(st), 'state holds counts only: ' + st);
  // shard numbers stay in range; a full lobby says closed
  const L3 = new LC.WorldLobbyCore(() => now, () => true); L3.stored = true;
  for (let s = 1; s <= P.WORLD_MAX_SHARDS; s++) L3.report(s, WORLD_SOFT);
  assert.deepEqual(L3.assign(), { open: false });
  assert.equal(L3.report(999, 5), true); assert.equal(L3.state().shards.length, P.WORLD_MAX_SHARDS);
});

t('lobby (Nov 12 2026 stress test): a restart keeps counts, a Full refusal pushes the count, a lookup never picks a full shard', () => {
  let now = 9_000_000;
  const L = new LC.WorldLobbyCore(() => now, () => true); L.stored = true;
  L.report(1, WORLD_HARD); L.report(2, 4);
  const v = L.version; L.report(1, WORLD_HARD); assert.equal(L.version, v, 'a heartbeat with the same count is not a change (no write)');
  const rows = L.snapshot(); assert.deepEqual(rows.map((r) => [r[0], r[1]]), [[1, WORLD_HARD], [2, 4]]);
  assert.ok(!/[a-z]/i.test(JSON.stringify(rows)), 'counts and times only');
  now += 20_000;
  const R = new LC.WorldLobbyCore(() => now, () => true); R.stored = true; R.restore(rows);
  assert.deepEqual(R.assign(2), { open: true, shard: 2, n: 4 }, 'after a restart ?in=2 stays on pub-2 (was "shard 1, n 0")');
  assert.equal(R.assign().shard, 2, 'a plain lookup goes to the fullest world with room, never the full one');
  const R2 = new LC.WorldLobbyCore(() => now + LC.SHARD_STALE_MS, () => true); R2.stored = true; R2.restore(rows);
  assert.deepEqual(R2.state().shards, [], 'stored rows older than the stale window are not restored');
  R.restore([[1, 3, now], ['x', 1, now], [99, 1, now], [3, 0, now], [4, 2, now + 5]]); assert.deepEqual(R.state().shards.map((s) => s.shard), [1, 2], 'bad rows ignored, live wins');
  // a forgotten full world: the room's Full refusal pushes its count before the client's one retry
  const F = new LC.WorldLobbyCore(() => now, () => true); F.stored = true; F.report(2, 4);
  const W = world(); const pushed = []; W.room.onFull = () => { pushed.push(W.room.size); F.report(1, W.room.size); };
  for (let i = 0; i < WORLD_HARD; i++) join(W);
  assert.deepEqual(pushed, [], 'no push while there is room');
  const over = join(W); assert.ok(over.of(S.Error).some((m) => m[1] === ErrorCode.Full)); assert.deepEqual(pushed, [WORLD_HARD]);
  assert.equal(F.assign().shard, 2, 'the retry without ?in= lands on pub-2');
  // every known shard full: a new shard, never a full one
  const G = new LC.WorldLobbyCore(() => now, () => true); G.stored = true; G.report(1, WORLD_HARD); G.report(2, WORLD_SOFT);
  assert.equal(G.assign().shard, 3);
});

t('interest: nobody beyond 160 m is ever sent (no beacon); 150 m to come back; other rooms unseen', () => {
  const W = world();
  const a = join(W), b = join(W), c = join(W);
  at(W, a, 0, 0); at(W, b, 1500, 0); at(W, c, 4000, 0); // b at 150 m, c at 400 m
  W.run(400);
  assert.ok(known(a).has(b.id)); assert.ok(!known(a).has(c.id)); assert.ok(!known(c).has(a.id));
  const mark = a.msgs.length;
  for (let s = 0; s < 40; s++) { at(W, c, 4000 + (s % 2) * 20, 0); at(W, b, 1500 + s * 4, 0); W.run(200); } // b walks out to ~165 m
  assert.ok(!known(a).has(b.id), 'b went beyond 160 m: Far');
  assert.ok(a.msgs.slice(mark).some((m) => m[0] === S.Left && m[1] === b.id && m[2] === LeaveReason.Far));
  assert.ok(!posedIds(a, mark).has(c.id), 'c (400 m) never reached a, not even on a 1 Hz beacon');
  const mark2 = a.msgs.length;
  for (let s = 0; s < 20; s++) { at(W, b, 1660 - s * 4, 0); W.run(200); } // back to ~158 m: still unseen (150 m to return)
  assert.ok(!known(a).has(b.id)); assert.ok(!posedIds(a, mark2).has(b.id), 'no pose of a member out of sight');
  for (let s = 0; s < 6; s++) { at(W, b, 1570 - s * 20, 0); W.run(200); }
  assert.ok(known(a).has(b.id), 'within 150 m: S.Joined again');
  // a room member is seen only from inside the same room
  const r = join(W);
  send(W, r, [C.Pose, ++r.seq, ...P.roomBody([0, 0, 0, 0, 0, 0, 0, 0], P.RoomCode.Arcade, 1, 0, 1, 0, Mode.Walk, 0)]);
  W.run(400);
  assert.ok(!known(a).has(r.id)); assert.ok(!known(r).has(a.id));
  const r2 = join(W);
  send(W, r2, [C.Pose, ++r2.seq, ...P.roomBody([0, 0, 0, 0, 0, 0, 0, 0], P.RoomCode.Arcade, 2, 0, 1, 0, Mode.Walk, 0)]);
  W.run(400);
  assert.ok(known(r).has(r2.id) && known(r2).has(r.id), 'two strangers in the same Arcade see each other');
});

t('Quiet hint and live count: others within 40 m, sent on change', () => {
  const W = world();
  const a = join(W);
  at(W, a, 0, 0); W.run(1000);
  assert.equal(lastOf(a, S.Quiet)[1], 0); assert.equal(lastOf(a, S.World)[1], 1);
  const b = join(W);
  at(W, b, 300, 0); W.run(1000); // 30 m
  assert.equal(lastOf(a, S.Quiet)[1], 1); assert.equal(lastOf(a, S.World)[1], 2); assert.equal(lastOf(b, S.Quiet)[1], 1);
  const quietCount = a.of(S.Quiet).length;
  W.run(3000);
  assert.equal(a.of(S.Quiet).length, quietCount, 'unchanged: not re-sent');
  const far = join(W); at(W, far, 1000, 0); W.run(1000); // 100 m: in sight, not near
  assert.equal(lastOf(a, S.Quiet)[1], 1); assert.equal(lastOf(a, S.World)[1], 3);
  const old = join(W, { caps: Cap.Live | Cap.Ball });
  assert.equal(old.of(S.Quiet).length, 0, 'only a Cap.Quiet client gets the hint'); assert.equal(old.of(S.World).length, 0);
});

t('report: one reporter never quarantines; two distinct ones do; duplicates and same-home reports ignored; window; quarantined invisible', () => {
  const W = world();
  const mk = (ip, x) => { const p = join(W, { ipKey: ip }); at(W, p, x, 0); return p; };
  const a = mk('a0a0a0a0', 0), b = mk('b0b0b0b0', 20), sib = mk('a0a0a0a0', 40), tg = mk('d0d0d0d0', 60), e = mk('e0e0e0e0', 80);
  W.run(400);
  for (const p of [a, b, sib, e]) assert.ok(known(p).has(tg.id));
  send(W, a, [C.Report, tg.id, P.ReportReason.Following]);
  assert.ok(!known(a).has(tg.id), 'the reporter stops seeing the target at once'); assert.ok(!known(tg).has(a.id), 'and the target stops seeing the reporter');
  assert.deepEqual(W.stats, ['rl:report_following']);
  send(W, a, [C.Report, tg.id, P.ReportReason.InMyWay]); W.run(400);
  assert.deepEqual(W.stats, ['rl:report_following'], 'the same reporter twice in the window: ignored');
  send(W, sib, [C.Report, tg.id, P.ReportReason.TooManyWaves]); W.run(400);
  assert.equal(W.stats.length, 1, 'a second tab / the same home counts once');
  assert.ok(known(b).has(tg.id) && known(e).has(tg.id), 'one reporter never quarantines anyone');
  assert.ok(!known(a).has(tg.id), 'the hide holds through the visibility pass');
  const mark = e.msgs.length;
  send(W, b, [C.Report, tg.id, P.ReportReason.SomethingElse]); W.run(400);
  assert.deepEqual(W.stats, ['rl:report_following', 'rl:report_something_else', 'rl:quarantine']);
  assert.deepEqual(W.holds, ['d0d0d0d0'], 'the target IP hash is held (WorldLobby, memory)');
  for (const p of [a, b, sib, e]) assert.ok(!known(p).has(tg.id), 'quarantined: nobody sees them');
  assert.ok(e.msgs.slice(mark).some((m) => m[0] === S.Left && m[1] === tg.id && m[2] === LeaveReason.Far), 'they just fade out of sight (Far)');
  const tm = tg.msgs.length, em = e.msgs.length;
  send(W, tg, [C.Emote, Emote.Cheer]); for (let s = 0; s < 10; s++) { at(W, tg, 60 + s * 2, 0); at(W, e, 80 + s * 2, 0); W.run(200); }
  send(W, tg, [C.EmoteAsk, e.id, Emote.JuggleWithMe]);
  assert.ok(!e.msgs.slice(em).some((m) => (m[0] === S.Emote || m[0] === S.EmoteAsk) && m[1] === tg.id), 'no emote or ask from them reaches anyone');
  assert.ok(!posedIds(e, em).has(tg.id), 'no pose either');
  assert.equal(tg.closed, null); assert.ok(!tg.msgs.slice(tm).some((m) => m[0] === S.Error || m[0] === S.EmoteAnswer), 'they are not told');
  assert.ok(posedIds(tg, tm).has(e.id), 'they still see the others');
  assert.equal(W.room.attachmentFor(tg).q, 1, 'the flag survives an eviction');
  const att = JSON.stringify(W.room.attachmentFor(tg)), snap = JSON.stringify(W.room.snapshot());
  assert.ok(!att.includes('d0d0d0d0') && !snap.includes('d0d0d0d0') && !snap.includes('report'), 'nothing about reports or the hash is persisted');
  // a held hash lands in quarantine again on a fresh join
  const back = join(W, { ipKey: 'd0d0d0d0', held: true }); at(W, back, 50, 0); W.run(400);
  for (const p of [a, b, e]) assert.ok(!known(p).has(back.id), 'held: invisible from the first frame');
  assert.ok(known(back).has(e.id));
  assert.equal(W.stats.filter((s) => s === 'rl:quarantine').length, 1, 'a held reconnect is not a new quarantine');
});

t('report: window expiry, unknown ids, the reporter bucket, party rooms ignore it', () => {
  const W = world();
  const a = join(W, { ipKey: '11111111' }), b = join(W, { ipKey: '22222222' }), tg = join(W, { ipKey: '33333333' }), never = join(W, { ipKey: '44444444' });
  at(W, a, 0, 0); at(W, b, 10, 0); at(W, tg, 20, 0); at(W, never, 5000, 0); W.run(400);
  send(W, a, [C.Report, never.id, 0]); send(W, a, [C.Report, 31, 0]); send(W, a, [C.Report, a.id, 0]);
  assert.deepEqual(W.stats, [], 'an id never seen, an empty slot or myself: nothing');
  send(W, a, [C.Report, tg.id, 0]);
  W.clock.t += P.REPORT.windowMs + 1000; // 10 min later (no tick: nobody idles out)
  send(W, b, [C.Report, tg.id, 0]);
  assert.ok(!W.stats.includes('rl:quarantine'), 'reports more than 10 min apart never add up');
  // bucket: burst 3, then 1 per 10 s
  const W2 = world();
  const r = join(W2, { ipKey: '55555555' }); at(W2, r, 0, 0);
  const ts = []; for (let i = 0; i < 6; i++) { const p = join(W2, { ipKey: '6' + i + '666666' }); at(W2, p, 10 + i, 0); ts.push(p); }
  W2.run(400);
  for (const p of ts) send(W2, r, [C.Report, p.id, 1]);
  assert.equal(W2.stats.length, 3, 'a reporter is rate limited (burst 3)');
  const party = world('party');
  const host = join(party, { nick: 'Emma', hostKey: party.room.hostKey, caps: CAPS_ALL }), g = join(party, { nick: 'Liam', caps: CAPS_ALL });
  for (let i = 0; i < 8; i++) send(party, host, [C.Report, g.id, 0]);
  assert.equal(host.closed, null, 'a party ignores C.Report (never a bad frame)'); assert.deepEqual(party.stats, []);
});

t('following guard: hides a follower from the one being followed, and lets them back after 30 s apart', () => {
  const W = world();
  const b = join(W), a = join(W), other = join(W);
  at(W, b, 0, 0); at(W, a, -20, 0); at(W, other, 600, 300); W.run(400);
  const bm = b.msgs.length;
  let x = 0;
  for (let s = 0; s < 260; s++) { x += 3; at(W, b, x, 0); at(W, a, x - 20, 0); at(W, other, 600 + (s % 2), 300); W.run(200); } // 52 s, b walks 78 m, a 2 m behind
  assert.ok(!known(b).has(a.id), 'b no longer receives a');
  assert.ok(b.msgs.slice(bm).some((m) => m[0] === S.Left && m[1] === a.id && m[2] === LeaveReason.Far));
  assert.ok(!known(a).has(b.id), 'a walked 78 m beside b too, so the rule also holds the other way: a chaser loses sight of b');
  const bm2 = b.msgs.length;
  for (let s = 0; s < 20; s++) { at(W, b, x, 0); at(W, a, x - 20, 0); W.run(200); }
  assert.ok(!posedIds(b, bm2).has(a.id), 'no pose of a reaches b while blocked');
  for (let s = 0; s < 10; s++) { at(W, a, x - 20 - (s + 1) * 25, 0); W.run(200); } // a walks 25 m off (fast walk)
  for (let s = 0; s < 125; s++) { at(W, a, x - 280 + (s % 2) * 6, 0); at(W, b, x, 0); W.run(200); } // 25 s apart: still hidden
  assert.ok(!known(b).has(a.id), 'not released before 30 s apart');
  for (let s = 0; s < 40; s++) { at(W, a, x - 280 + (s % 2) * 6, 0); at(W, b, x, 0); W.run(200); }
  assert.ok(known(b).has(a.id), 'released after more than 30 s farther than 15 m');
  // one way: b circles a still a (3 m radius) for 50 s: b stops receiving a; a (who never moved) still sees b
  const W3 = world();
  const st = join(W3), cir = join(W3);
  at(W3, st, 0, 0); at(W3, cir, 30, 0);
  for (let s = 0; s < 250; s++) { const k = s * 0.35; at(W3, cir, Math.round(30 * Math.cos(k)), Math.round(30 * Math.sin(k))); at(W3, st, s % 2, 0); W3.run(200); }
  assert.ok(!known(cir).has(st.id), 'the one who moved stops receiving the one who stayed close');
  assert.ok(known(st).has(cir.id), 'the still one keeps seeing them');
  // off: standing together for a minute (b does not move) is never "following"
  const W2 = world();
  const p = join(W2), q = join(W2);
  at(W2, p, 0, 0); at(W2, q, 15, 0);
  for (let s = 0; s < 320; s++) { at(W2, p, s % 2, 0); at(W2, q, 15 + (s % 2), 0); W2.run(200); }
  assert.ok(known(p).has(q.id) && known(q).has(p.id), 'two kids playing on one spot stay visible');
});

t('duet asks between strangers: one No ends asking that player this connection; none from someone they reported', () => {
  const W = world();
  const a = join(W), b = join(W), c = join(W);
  at(W, a, 0, 0); at(W, b, 20, 0); at(W, c, 30, 0); W.run(400);
  send(W, a, [C.EmoteAsk, b.id, Emote.JuggleWithMe]);
  assert.deepEqual(lastOf(b, S.EmoteAsk), [S.EmoteAsk, a.id, Emote.JuggleWithMe]);
  send(W, b, [C.EmoteAnswer, a.id, 0]);
  assert.equal(lastOf(a, S.EmoteAnswer)[3], P.AskReply.No);
  W.clock.t += 25000; at(W, a, 0, 0); at(W, b, 20, 0); at(W, c, 30, 0); W.run(400);
  const asks = b.of(S.EmoteAsk).length;
  send(W, a, [C.EmoteAsk, b.id, Emote.PassBall]);
  assert.equal(b.of(S.EmoteAsk).length, asks, 'blocked for the connection after one No');
  assert.equal(lastOf(a, S.EmoteAnswer)[3], P.AskReply.Unavailable);
  // a party allows a second ask after the cooldown (declinesToBlock 2): unchanged
  const party = world('party');
  const h = join(party, { nick: 'Emma', hostKey: party.room.hostKey, caps: CAPS_ALL }), g = join(party, { nick: 'Liam', caps: CAPS_ALL });
  at(party, h, 0, 0); at(party, g, 20, 0); party.run(400);
  send(party, h, [C.EmoteAsk, g.id, Emote.JuggleWithMe]); send(party, g, [C.EmoteAnswer, h.id, 0]);
  party.clock.t += 25000; at(party, h, 0, 0); at(party, g, 20, 0); party.run(400);
  const pa = g.of(S.EmoteAsk).length; send(party, h, [C.EmoteAsk, g.id, Emote.PassBall]);
  assert.equal(g.of(S.EmoteAsk).length, pa + 1, 'party: asked again');
  // c reports a: a's asks never reach c
  send(W, c, [C.Report, a.id, 1]);
  W.clock.t += 25000; at(W, a, 0, 0); at(W, c, 30, 0); W.run(400);
  const ca = c.of(S.EmoteAsk).length;
  send(W, a, [C.EmoteAsk, c.id, Emote.JuggleWithMe]);
  assert.equal(c.of(S.EmoteAsk).length, ca);
});

t('slots: away grace 2 min, idle or away 5 min frees the slot (CloseCode.Idle)', () => {
  const W = world();
  const a = join(W), b = join(W);
  at(W, a, 0, 0); at(W, b, 20, 0, { mode: Mode.Busy }); W.run(400);
  W.room.disconnect(b); W.run(110000);
  const b2 = join(W, { resume: b.token }); assert.equal(b2.id, b.id, 'an announced away keeps the slot under 2 min');
  W.room.disconnect(b2); W.run(125000);
  const b3 = join(W, { resume: b.token }); assert.notEqual(b3.of(S.Welcome)[0][3], b.token, 'past 2 min: a fresh join');
  const W2 = world();
  const p = join(W2), q = join(W2);
  at(W2, p, 0, 0); at(W2, q, 200, 0); W2.run(400);
  for (let s = 0; s < 1600; s++) { if (s % 5 === 0) at(W2, q, 200 + (s % 10 === 0 ? 0 : 10), 0); send(W2, p, [C.Beat, s]); W2.run(200); } // 320 s: p beats but never moves
  assert.equal(p.closed, CLOSE.Idle, 'idle 5 min: closed with CloseCode.Idle');
  assert.equal(q.closed, null, 'a moving member stays');
  assert.ok(q.of(S.Left).some((m) => m[1] === p.id && m[2] === LeaveReason.Timeout));
});

t('kill switch: closeWorld closes every socket with WorldOff; the world opens again', () => {
  const W = world();
  const ps = [join(W), join(W), join(W)];
  const pend = peer(); W.room.connect(pend);
  W.room.closeWorld();
  for (const p of ps) assert.equal(p.closed, P.CloseCode.WorldOff);
  assert.equal(pend.closed, P.CloseCode.WorldOff); assert.equal(W.room.size, 0); assert.equal(W.room.ended, false);
  const again = join(W); assert.ok(again.of(S.Welcome)[0], 'a later connect starts it fresh');
  const party = world('party'); join(party, { nick: 'Emma', hostKey: party.room.hostKey, caps: CAPS_ALL });
  party.room.closeWorld(); assert.equal(party.room.size, 1, 'never closes a party');
});

// ---- the WorldLobby object and the worker routes, with fake Durable Object stubs ----
(async () => {
  const { WorldLobby } = loadTs(path.join(ROOT, 'multiplayer/relay/src/worldLobby.ts'));
  const worker = loadTs(path.join(ROOT, 'multiplayer/relay/src/index.ts')).default;
  const store = () => { const m = new Map(); return { m, get: async (k) => m.get(k), put: async (k, v) => { m.set(k, v); }, delete: async (k) => m.delete(k), getAlarm: async () => null, setAlarm: async () => {} }; };
  const closed = [];
  const PARTY = { idFromName: (n) => n, get: (id) => ({ fetch: async (u) => { closed.push(id + ' ' + new URL(typeof u === 'string' ? u : u.url).pathname); return new Response('ok'); } }) };
  const TOKEN = 'control-token-0123456789';
  const mkEnv = (token) => {
    const st = store();
    const env = { PARTY, STATS: null, MP_ALLOWED_ORIGINS: 'https://futbolisland.app', CONTROL_TOKEN: token };
    const lobby = new WorldLobby({ storage: st }, env);
    env.LOBBY = { idFromName: () => 'lobby', get: () => ({ fetch: (u, i) => lobby.fetch(new Request(u, i)) }) };
    return { env, st };
  };
  const call = (env, p, init = {}) => worker.fetch(new Request('https://relay.example' + p, init), env);
  const O = { Origin: 'https://futbolisland.app' };
  // no secret: /control is 404 and public play is closed (fail safe)
  {
    const { env } = mkEnv(undefined);
    assert.equal((await call(env, '/control', { headers: { Authorization: 'Bearer ' + TOKEN } })).status, 404);
    assert.deepEqual(await (await call(env, '/world', { headers: O })).json(), { open: false });
    const noLobby = { PARTY, MP_ALLOWED_ORIGINS: 'https://futbolisland.app' };
    assert.deepEqual(await (await call(noLobby, '/world', { headers: O })).json(), { open: false }, 'an old config without LOBBY: closed');
  }
  {
    const { env, st } = mkEnv(TOKEN);
    const auth = { Authorization: 'Bearer ' + TOKEN, 'content-type': 'application/json' };
    assert.equal((await call(env, '/control', { headers: { Authorization: 'Bearer wrong-token-0123456789' } })).status, 401);
    assert.deepEqual(await (await call(env, '/world', { headers: O })).json(), { open: false }, 'deployed with the secret: still closed until switched on');
    assert.equal((await call(env, '/world', { headers: { Origin: 'https://evil.example' } })).status, 403, 'origin allow-list');
    const on = await (await call(env, '/control', { method: 'POST', headers: auth, body: JSON.stringify({ public: true }) })).json();
    assert.equal(on.public, true); assert.equal(st.m.get('public'), true, 'only the switch is stored');
    const w = await (await call(env, '/world', { headers: O })).json();
    assert.deepEqual(w, { open: true, shard: 1, n: 0 });
    await env.LOBBY.get().fetch('https://do/count', { method: 'POST', body: JSON.stringify({ shard: 1, n: 7 }) });
    assert.deepEqual(await (await call(env, '/world?in=1', { headers: O })).json(), { open: true, shard: 1, n: 7 }, '"N on now" for my world');
    { // the lobby object restarts (eviction / deploy): the stored counts come back (Nov 12 2026 stress test)
      await new Promise((r) => setTimeout(r, 0));
      const again = new WorldLobby({ storage: st }, env);
      assert.deepEqual(await (await again.fetch(new Request('https://do/assign?in=1'))).json(), { open: true, shard: 1, n: 7 }, 'a restarted lobby keeps the count');
    }
    const s = await (await call(env, '/control', { headers: auth })).json();
    assert.deepEqual(s.shards, [{ shard: 1, n: 7 }]); assert.equal(s.total, 7);
    assert.equal((await call(env, '/control', { method: 'POST', headers: auth, body: '{"public":"yes"}' })).status, 400);
    const off = await (await call(env, '/control', { method: 'POST', headers: auth, body: JSON.stringify({ public: false }) })).json();
    assert.equal(off.public, false); assert.ok(closed.includes('pub-1 /world-close'), 'every known world is told to close');
    assert.deepEqual(await (await call(env, '/world', { headers: O })).json(), { open: false });
    const cnt = await (await env.LOBBY.get().fetch('https://do/count', { method: 'POST', body: JSON.stringify({ shard: 2, n: 3 }) })).json();
    assert.equal(cnt.public, false, 'a world that reports while public is off is told to close (second path)');
    // a world socket while closed: opened and closed at once with WorldOff (needs the Workers WebSocketPair: faked here)
    const sockets = [];
    globalThis.WebSocketPair = class { constructor() { const mk = () => { const s = { accept() { s.accepted = true; }, close(c) { s.code = c; } }; sockets.push(s); return s; }; this[0] = mk(); this[1] = mk(); } };
    const origResponse = globalThis.Response;
    globalThis.Response = class extends origResponse { constructor(b, i = {}) { super(b, i && i.status === 101 ? { ...i, status: 200 } : i); if (i && i.webSocket) this.webSocket = i.webSocket; } };
    try {
      const r = await call(env, '/world/1/ws', { headers: { ...O, Upgrade: 'websocket' } });
      assert.ok(r.webSocket); assert.equal(sockets[1].code, P.CloseCode.WorldOff); assert.ok(sockets[1].accepted);
    } finally { globalThis.Response = origResponse; delete globalThis.WebSocketPair; }
    // holds: memory only, 1 hour
    await env.LOBBY.get().fetch('https://do/hold', { method: 'POST', body: JSON.stringify({ h: 'abcdef0123456789' }) });
    const ad = await (await env.LOBBY.get().fetch('https://do/admit', { method: 'POST', body: JSON.stringify({ shard: 1, h: 'abcdef0123456789' }) })).json();
    assert.equal(ad.held, true);
    assert.deepEqual([...st.m.keys()].sort(), ['counts', 'public'], 'only the switch and the counts are stored');
    assert.ok(!/abcdef/.test(JSON.stringify([...st.m.values()])), 'the hash never reaches storage');
  }
  {
    let now = 0; const L = new LC.WorldLobbyCore(() => now, () => true);
    L.hold('abcd1234'); assert.equal(L.held('abcd1234'), true); now += P.REPORT.holdMs - 1; assert.equal(L.held('abcd1234'), true);
    now += 2; assert.equal(L.held('abcd1234'), false, 'the hold lapses after 1 hour'); assert.equal(L.held(null), false);
  }
  {
    assert.ok(SC.ALLOWED.has('rl:quarantine') && SC.ALLOWED.has('rl:report_following') && SC.ALLOWED.has('rl:report_something_else') && SC.ALLOWED.has('rl:world_rate'));
  }
  n += 4;
  // party behaviour unchanged: every RoomCore party expectation, run against an explicit kind 'party'
  execFileSync(process.execPath, [path.join(__dirname, 'mp-room-core.cjs')], { env: { ...process.env, MP_ROOM_KIND: 'party' }, stdio: 'pipe' });
  n++;
  console.log('mp-world: ' + n + ' groups passed');
})().catch((e) => { console.error(e); process.exit(1); });
