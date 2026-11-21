// Reef counts (Nov 21 2026, owner: "yes ... go ahead"; docs/multiplayer-rooms-design.md Phase 5): Cap.Reef / S.Reef. On a public
// world the relay hides a stranger who is inside a room from the island, so the "2 exploring" flag could only count party friends. The
// relay now sends each Cap.Reef member S.Reef [46, [n41..n47]]: how many OTHER players are in each reef room, counts only, at most once
// a second and only on a change. Pins: protocol bits + parser, counting (enter, surface, leave, drop, hidden tab, quarantine, reports
// both ways), self left out, shard isolation, coalescing, cap gating (an old client is never sent it; a party never), no ids/names.
'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const { loadTs } = require('../multiplayer/dev-relay/loadTs.cjs');
const ROOT = path.join(__dirname, '..');
const P = loadTs(path.join(ROOT, 'multiplayer/protocol/index.ts'));
const { RoomCore } = loadTs(path.join(ROOT, 'multiplayer/relay/src/roomCore.ts'));
const { C, S, Mode, Zone, PoseFlag, PROTOCOL_VERSION, CAPS_WORLD, CAPS_ALL, CAPS_PARTY, Cap, WORLD_HARD, REEF_AREAS } = P;

let n = 0;
const t = (name, fn) => { try { fn(); n++; } catch (e) { console.error('FAIL', name); throw e; } };
let seed = 7;
const random = (k) => { const a = new Uint8Array(k); for (let i = 0; i < k; i++) { seed = (seed * 1103515245 + 12345) & 0x7fffffff; a[i] = (seed >> 8) & 255; } return a; };
const LOOK = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
function peer() {
  const p = { msgs: [], seq: 0, send(x) { p.msgs.push(JSON.parse(x)); }, close() {} };
  p.of = (op) => p.msgs.filter((m) => m[0] === op);
  p.reef = () => { const l = p.of(S.Reef); return l.length ? l[l.length - 1][1] : [0, 0, 0, 0, 0, 0, 0]; };
  return p;
}
function world(kind = 'world', code = 'pub-1') {
  const clock = { t: 1_000_000, now() { return this.t; } };
  const room = new RoomCore({ code, createdAt: clock.t, clock, random, kind });
  const W = { clock, room, half: false, peers: [] };
  W.run = (ms) => { for (let e = 0; e < ms; e += 100) { clock.t += 100; W.half = !W.half; if (W.half) room.halfTick(); else room.tick(); } };
  W.live = (ms) => { for (let e = 0; e < ms; e += 1000) { for (const p of W.peers) if (p.last && !p.left) send(W, p, [C.Pose, ++p.seq, ...p.last]); W.run(1000); } };
  return W;
}
const send = (W, p, arr) => W.room.message(p, JSON.stringify(arr));
function join(W, { caps = CAPS_WORLD } = {}) {
  const p = peer();
  W.room.connect(p, false, { ipKey: null, held: false });
  send(W, p, [C.Hello, PROTOCOL_VERSION, LOOK, null, null]);
  const w = p.of(S.Welcome)[0]; if (w) p.id = w[2];
  W.peers.push(p);
  const sc = p.of(S.Caps)[0];
  if (sc && caps) send(W, p, [C.Caps, sc[1] & caps]);
  return p;
}
const island = (W, p, x = 0, z = 0, flags = 0) => { p.last = [x * 10, 0, z * 10, 0, 0, Mode.Swim, Zone.Sea, flags]; send(W, p, [C.Pose, ++p.seq, ...p.last]); };
/** Dive into reef `area` (1..7): the room pose the client sends (roomBody, Mode.Dive). */
const dive = (W, p, area, flags = 0) => { p.last = P.roomBody([0, 0, 0, 0, 0, 0, 0, 0], P.reefRoom(area), 0, -1, 0, 0, Mode.Dive, flags); send(W, p, [C.Pose, ++p.seq, ...p.last]); };
const Z = [0, 0, 0, 0, 0, 0, 0];
const at = (area, k) => { const c = Z.slice(); c[area - 1] = k; return c; };

t('protocol: Cap.Reef is a world-only bit; S.Reef parses only small integer counts', () => {
  assert.equal(Cap.Reef, 32768); assert.ok(CAPS_WORLD & Cap.Reef); assert.equal(CAPS_ALL & Cap.Reef, 0); assert.equal(CAPS_PARTY & Cap.Reef, 0, 'a party is never offered it');
  assert.ok(Cap.Reef <= P.CAPS_MAX, 'a new relay parser takes it'); assert.equal(S.Reef, 46); assert.equal(PROTOCOL_VERSION, 1, 'a cap, not a version bump');
  assert.equal(REEF_AREAS, 7);
  assert.ok(P.parseServer('[46,[0,0,0,0,0,0,0]]')); assert.ok(P.parseServer('[46,[0,2,0,0,0,0,30]]'));
  assert.ok(P.parseServer('[46,[1]]'), 'fewer entries: the client reads 0 for the rest'); assert.ok(P.parseServer(JSON.stringify([46, new Array(16).fill(1)])), 'a later relay may add reefs');
  for (const bad of ['[46]', '[46,[]]', '[46,[-1]]', '[46,[1.5]]', '[46,["2"]]', `[46,[${WORLD_HARD + 1}]]`, '[46,{"42":2}]', '[46,[0],1]', JSON.stringify([46, new Array(17).fill(0)])])
    assert.equal(P.parseServer(bad), null, bad);
});

t('counting: a diver entering a reef is counted for the others (never for themself), surfacing / leaving / a drop / a hidden tab drop the count', () => {
  const W = world();
  const a = join(W), b = join(W), c = join(W), d = join(W);
  island(W, a, 300, 0); island(W, b, 310, 0); island(W, c, 320, 0); island(W, d, 330, 0);
  W.live(2000);
  assert.equal(a.of(S.Reef).length, 0, 'nobody diving: nothing sent (a fresh socket already reads zeros)');
  dive(W, b, 2); W.live(1000);
  assert.deepEqual(a.reef(), at(2, 1), "a sees 1 in Paul's Grotto (room 42)"); assert.deepEqual(b.reef(), Z, 'b is not counted for b');
  dive(W, c, 2); dive(W, d, 5); W.live(1000);
  assert.deepEqual(a.reef(), [0, 2, 0, 0, 1, 0, 0]); assert.deepEqual(b.reef(), [0, 1, 0, 0, 1, 0, 0], 'divers hear the others too');
  island(W, c, 320, 0); W.live(1000); assert.deepEqual(a.reef(), [0, 1, 0, 0, 1, 0, 0], 'c surfaced');
  dive(W, b, 2, PoseFlag.Hidden); W.live(1000); assert.deepEqual(a.reef(), at(5, 1), 'a hidden tab (Hidden pose) is not exploring');
  dive(W, b, 2); W.live(1000); assert.deepEqual(a.reef(), [0, 1, 0, 0, 1, 0, 0], 'back');
  W.room.disconnect(b); b.left = true; W.live(1000); assert.deepEqual(a.reef(), at(5, 1), 'a dropped socket stops counting at once (its slot grace does not count)');
  send(W, d, [C.Leave]); d.left = true; W.live(1000); assert.deepEqual(a.reef(), Z, 'C.Leave (pagehide): back to zero');
  for (const p of [a, c]) for (const m of p.of(S.Reef)) {
    assert.equal(m.length, 2); assert.equal(m[1].length, REEF_AREAS); assert.ok(!/"|\./.test(JSON.stringify(m)), 'integers only: no id, name or spot');
  }
});

t('coalescing: a diver bouncing in and out is at most one S.Reef a second, and nothing when the count ends where it was', () => {
  const W = world();
  const a = join(W), b = join(W);
  island(W, a, 300, 0); island(W, b, 300, 5); W.live(2000);
  for (let i = 0; i < 20; i++) { dive(W, b, 3); W.run(100); island(W, b, 300, 5); W.run(100); } // 10 flips a second for 4 s
  assert.ok(a.of(S.Reef).length <= 4, 'at most one frame per second: ' + a.of(S.Reef).length);
  const k = a.of(S.Reef).length; island(W, b, 300, 5); W.live(3000);
  assert.ok(a.of(S.Reef).length <= k + 1); assert.deepEqual(a.reef(), Z);
  const k2 = a.of(S.Reef).length; W.live(5000); assert.equal(a.of(S.Reef).length, k2, 'no change: no frame');
});

t('shard isolation: divers in another world never count; a party never sends S.Reef', () => {
  const W1 = world('world', 'pub-1'), W2 = world('world', 'pub-2');
  const a = join(W1), x = join(W2), y = join(W2);
  island(W1, a, 0, 0); island(W2, x, 0, 0); dive(W2, y, 2);
  W1.live(2000); W2.live(2000);
  assert.deepEqual(a.reef(), Z); assert.deepEqual(x.reef(), at(2, 1));
  const Pt = world('party', 'K7MQ4R'); const h = join(Pt, { caps: CAPS_PARTY }), f = join(Pt, { caps: CAPS_PARTY });
  island(Pt, h, 0, 0); dive(Pt, f, 2); Pt.live(2000);
  assert.equal(h.of(S.Reef).length, 0, 'a party keeps its roster (friends stay listed)');
});

t('cap gating: an old client (no Cap.Reef) is never sent S.Reef; a new socket hears the current counts at once', () => {
  const W = world();
  const old = join(W, { caps: CAPS_WORLD & ~Cap.Reef }), b = join(W);
  island(W, old, 0, 0); dive(W, b, 4); W.live(2000);
  assert.equal(old.of(S.Reef).length, 0);
  const late = join(W); assert.deepEqual(late.reef(), at(4, 1), 'right after its C.Caps');
});

t('privacy: a quarantined diver never counts; a quarantined recipient hears zeros; a report holds both sides apart', () => {
  const W = world();
  const a = join(W), b = join(W), q = join(W);
  island(W, a, 0, 0); dive(W, b, 6); dive(W, q, 6); W.live(1000);
  assert.deepEqual(a.reef(), at(6, 2));
  W.room.members.get(q.id).quarantined = true; W.live(1000);
  assert.deepEqual(a.reef(), at(6, 1), 'quarantined q is not counted');
  dive(W, a, 6); island(W, a, 0, 0); W.live(2000); assert.deepEqual(q.reef(), Z, 'q hears nothing to look for');
  // a reports b (they met on the island): neither counts the other any more
  island(W, b, 1, 0); W.live(2000); send(W, a, [C.Report, b.id, P.ReportReason.InMyWay]); dive(W, b, 6); W.live(2000);
  assert.deepEqual(a.reef(), Z, 'the reporter does not see the reported one exploring');
  dive(W, a, 6); island(W, b, 1, 0); W.live(1000); assert.deepEqual(b.reef(), Z, 'and the reported one does not count the reporter');
});

console.log(`mp-reef-counts: ${n} checks passed`);
