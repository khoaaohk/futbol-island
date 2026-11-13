// Map dots (Nov 13 2026; owner: "2 on now" but "Nobody near you" and no way to find them): Cap.Map / S.Map. The relay sends each Cap.Map
// member of a world, every MAP_DOTS.everyMs and only on change, the OTHER players on the open island as [cellX, cellZ, count] cells of
// MAP_DOTS.cellM m: never an id, name, kit or exact spot. Pins: the protocol bits, quantisation, exclusions (self, rooms / indoors, away,
// quarantined, not posed, reports and the following guard both ways), cadence + change-only, cap gating, no ids, the client store and
// the map drawing rules (lib/town/playerMarks.ts). Plain node, fake peers and clock.
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadTs } = require('../multiplayer/dev-relay/loadTs.cjs');
const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const P = loadTs(path.join(ROOT, 'multiplayer/protocol/index.ts'));
const { RoomCore } = loadTs(path.join(ROOT, 'multiplayer/relay/src/roomCore.ts'));
const { C, S, Mode, Zone, PoseFlag, PROTOCOL_VERSION, CAPS_WORLD, CAPS_ALL, Cap, MAP_DOTS, WORLD_HARD } = P;

let n = 0;
const t = (name, fn) => { try { fn(); n++; } catch (e) { console.error('FAIL', name); throw e; } };
let seed = 99;
const random = (k) => { const a = new Uint8Array(k); for (let i = 0; i < k; i++) { seed = (seed * 1103515245 + 12345) & 0x7fffffff; a[i] = (seed >> 8) & 255; } return a; };
const LOOK = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
function peer() {
  const p = { msgs: [], seq: 0, send(x) { p.msgs.push(JSON.parse(x)); }, close() {} };
  p.of = (op) => p.msgs.filter((m) => m[0] === op);
  p.map = () => { const l = p.of(S.Map); return l.length ? l[l.length - 1][1] : []; };
  return p;
}
function world(kind = 'world') {
  const clock = { t: 1_000_000, now() { return this.t; } };
  const room = new RoomCore({ code: 'pub-1', createdAt: clock.t, clock, random, kind });
  const W = { clock, room, half: false, peers: [] };
  W.run = (ms) => { for (let e = 0; e < ms; e += 100) { clock.t += 100; W.half = !W.half; if (W.half) room.halfTick(); else room.tick(); } };
  /** Run `ms` while every posed peer keeps sending its last pose each second (silence would mark them away). */
  W.live = (ms) => { for (let e = 0; e < ms; e += 1000) { for (const p of W.peers) if (p.last) send(W, p, [C.Pose, ++p.seq, ...p.last]); W.run(1000); } };
  return W;
}
const send = (W, p, arr) => W.room.message(p, JSON.stringify(arr));
function join(W, { caps = CAPS_WORLD, ipKey = null, hostKey = null } = {}) {
  const p = peer();
  W.room.connect(p, false, { ipKey, held: false });
  send(W, p, [C.Hello, PROTOCOL_VERSION, LOOK, null, hostKey]);
  const w = p.of(S.Welcome)[0]; if (w) p.id = w[2];
  W.peers.push(p);
  const sc = p.of(S.Caps)[0];
  if (sc && caps) send(W, p, [C.Caps, sc[1] & caps]);
  return p;
}
/** x / z in metres (the wire is decimetres). */
const at = (W, p, x, z, { flags = 0, mode = Mode.Walk, zone = Zone.Main } = {}) => { p.last = [Math.round(x * 10), 0, Math.round(z * 10), 0, 0, mode, zone, flags]; send(W, p, [C.Pose, ++p.seq, ...p.last]); };
const cell = (x, z) => [Math.floor(x / MAP_DOTS.cellM), Math.floor(z / MAP_DOTS.cellM)];
const sorted = (cells) => cells.slice().sort((a, b) => a[1] - b[1] || a[0] - b[0]);

t('protocol: Cap.Map is a world-only bit; S.Map parses only counts in bounded cells', () => {
  assert.equal(Cap.Map, 4096); assert.ok(CAPS_WORLD & Cap.Map); assert.equal(CAPS_ALL & Cap.Map, 0, 'a party is never offered it');
  assert.equal(S.Map, 44); assert.equal(PROTOCOL_VERSION, 1, 'a cap, not a version bump: old clients keep joining');
  assert.deepEqual({ ...MAP_DOTS }, { cellM: 25, everyMs: 5000, maxCells: 32 });
  assert.ok(P.parseServer('[44,[]]')); assert.ok(P.parseServer('[44,[[0,0,1],[-20,-24,3],[40,24,30]]]'));
  for (const bad of ['[44]', '[44,[[0,0]]]', '[44,[[0,0,0]]]', '[44,[[0,0,31]]]', '[44,[[0.5,0,1]]]', '[44,[[0,0,"a"]]]', '[44,[[41,0,1]]]',
    '[44,[[0,-25,1]]]', '[44,{"0":1}]', '[44,[[0,0,1,7]]]', JSON.stringify([44, Array.from({ length: 33 }, (_, i) => [i, 0, 1])])]) assert.equal(P.parseServer(bad), null, bad);
});

t('quantisation: 25 m cells with a count; the recipient and its own count are left out', () => {
  const W = world();
  const me = join(W), a = join(W), b = join(W), c = join(W);
  at(W, me, 0, 0); at(W, a, 300.4, 12.9); at(W, b, 324.9, 0.1); at(W, c, -80, -30.2);
  W.run(1000);
  assert.deepEqual(me.map(), sorted([[...cell(300, 0), 2], [...cell(-80, -30.2), 1]]), 'a and b share cell (12, 0); c is in (-4, -2)');
  assert.deepEqual(cell(-80, -30.2), [-4, -2], 'floor, not round, so negatives land in the right cell');
  assert.deepEqual(a.map(), sorted([[...cell(0, 0), 1], [12, 0, 1], [-4, -2, 1]]), 'a sees its own cell with only b in it');
  const ids = new Set([me.id, a.id, b.id, c.id]);
  for (const p of [me, a, b, c]) for (const m of p.of(S.Map)) {
    assert.equal(m.length, 2); assert.ok(m[1].every((x) => Array.isArray(x) && x.length === 3 && x.every(Number.isInteger)), 'only integer triples');
    const raw = JSON.stringify(m);
    assert.ok(!/"|\./.test(raw), 'no string, no decimals (no names, kits or exact spots): ' + raw);
    assert.ok(m[1].every((x) => x[2] >= 1 && x[2] <= WORLD_HARD), 'counts only');
  }
  assert.ok(ids.size === 4);
});

t('cadence: every 5 s at most, and only when the list changed', () => {
  const W = world();
  const me = join(W), a = join(W);
  at(W, me, 0, 0); at(W, a, 200, 0); W.run(1000);
  const first = me.of(S.Map).length; assert.equal(first, 1, 'one S.Map once a is posed');
  for (let i = 0; i < 30; i++) { at(W, a, 200 + (i % 2) * 3, 0); W.run(1000); } // 30 s inside one cell
  assert.equal(me.of(S.Map).length, first, 'same cells: nothing re-sent');
  const t0 = W.clock.t;
  for (let x = 200; x <= 260; x += 4) { at(W, a, x, 0); W.run(500); } // walks through three cells in ~8 s
  const sends = me.of(S.Map).slice(first);
  assert.ok(sends.length >= 1 && sends.length <= Math.ceil((W.clock.t - t0) / MAP_DOTS.everyMs), 'at most one per 5 s: ' + sends.length);
  W.run(6000); assert.deepEqual(me.map(), [[...cell(260, 0), 1]], 'it settles on the last cell');
  const k = me.of(S.Map).length;
  for (let i = 0; i < 20; i++) { at(W, a, 260, 0); at(W, me, 0, 0); W.run(1000); }
  assert.equal(me.of(S.Map).length, k, 'quiet again');
  W.run(P.AWAY_SILENCE_MS + 6000); assert.deepEqual(me.map(), [], 'silent (relay-away: Hidden) players leave the map');
});

t('exclusions: rooms, indoors, away (Hidden), not posed, dropped and quarantined members never show', () => {
  const W = world();
  const me = join(W), inRoom = join(W), door = join(W), away = join(W), never = join(W), plain = join(W), gone = join(W);
  at(W, me, 0, 0); at(W, plain, 100, 0); at(W, door, 150, 0, { zone: Zone.Indoors }); at(W, away, 200, 0, { flags: PoseFlag.Hidden }); at(W, gone, 250, 0);
  // a room pose: Indoors zone, y in the room band, room code in the speed byte (roomBody); the relay keeps it as room >= 0
  const body = P.roomBody([0, 0, 0, 0, 0, 0, 0, 0], P.RoomCode.Arcade, 0, 0, 0, 0, Mode.Walk, 0);
  inRoom.last = body; send(W, inRoom, [C.Pose, ++inRoom.seq, ...body]);
  W.run(1000);
  assert.ok(W.room.members.get(inRoom.id).room >= 0, 'the room pose was taken');
  W.room.disconnect(gone);
  W.live(6000);
  assert.deepEqual(me.map(), [[...cell(100, 0), 1]], 'only the plain member on the open island');
  // quarantine plain: gone from everyone's map; a quarantined recipient gets nothing to look for
  W.room.members.get(plain.id).quarantined = true; W.live(6000);
  assert.deepEqual(me.map(), [], 'a quarantined member is never a dot');
  assert.ok(W.room.members.get(plain.id).pose[7] === 0, 'plain is not away (the map is empty because of the quarantine)');
  const q = join(W); at(W, q, 400, 0); W.room.members.get(q.id).quarantined = true; W.live(6000);
  assert.deepEqual(q.map(), [], 'a quarantined recipient is sent no cells to look for');
  assert.ok(never.id >= 0, 'never posed: not counted (the map above has the plain member only)');
});

t('hidden pairs: a report and the following guard hold BOTH sides off each other\'s map', () => {
  const W = world();
  const a = join(W), b = join(W), c = join(W);
  at(W, a, 0, 0); at(W, b, 100, 0); at(W, c, -500, 0); W.live(6000);
  assert.equal(a.map().length, 2);
  send(W, a, [C.Report, b.id, P.ReportReason.InMyWay]); W.live(6000);
  assert.deepEqual(a.map(), [[...cell(-500, 0), 1]], 'the reporter no longer sees the reported player on the map');
  assert.deepEqual(b.map(), [[...cell(-500, 0), 1]], 'nor the reported player the reporter');
  assert.equal(c.map().length, 2, 'others are not affected');
  const W2 = world();
  const f = join(W2), g = join(W2), h = join(W2);
  at(W2, f, 0, 0); at(W2, g, 300, 0); at(W2, h, -300, 0); W2.live(6000);
  W2.room.follow.set(f.id * 64 + g.id, { since: 1, path: 99, lx: 0, lz: 0, blocked: true, farSince: 0 }); // f followed g: blocked
  W2.live(6000);
  assert.deepEqual(f.map(), [[...cell(-300, 0), 1]], 'the follower cannot find the one followed');
  assert.deepEqual(g.map(), [[...cell(-300, 0), 1]], 'and the followed one does not see the follower either');
  assert.equal(h.map().length, 2);
});

t('cap gating: no Cap.Map = no S.Map; a party never sends one', () => {
  const W = world();
  const old = join(W, { caps: CAPS_WORLD & ~Cap.Map }), a = join(W);
  at(W, old, 0, 0); at(W, a, 300, 0); W.run(12000);
  assert.equal(old.of(S.Map).length, 0, 'an old client gets nothing new');
  assert.deepEqual(a.map(), [[...cell(0, 0), 1]], 'but is still counted on the others\' maps');
  const Wp = world('party');
  const host = join(Wp, { hostKey: Wp.room.hostKey }), guest = join(Wp, { caps: 0xffff });
  at(Wp, host, 0, 0); at(Wp, guest, 300, 0); Wp.run(12000);
  assert.equal(host.of(S.Map).length + guest.of(S.Map).length, 0, 'parties: friend dots only, never S.Map');
});

t('list cap: a full world fits under maxCells; the relay still slices to the fullest cells', () => {
  assert.ok(WORLD_HARD - 1 <= MAP_DOTS.maxCells, 'every other member of a full world can have their own cell');
  const W = world();
  const me = join(W); at(W, me, -400, -500);
  for (let i = 0; i < 28; i++) { const p = join(W); at(W, p, i * 30, 0); } // 28 separate cells
  W.run(6000);
  assert.equal(me.map().length, 28, 'under the cap: every cell');
  assert.ok(JSON.stringify([S.Map, me.map()]).length < 600, 'a full list stays small on the wire');
  assert.match(read('multiplayer/relay/src/roomCore.ts'), /cells\.length > MAP_DOTS\.maxCells\) cells = cells\.sort\(\(a, b\) => b\[2\] - a\[2\]\)\.slice\(0, MAP_DOTS\.maxCells\)/);
});

t('heat: one O(members) histogram per pass; no timers in the relay pass', () => {
  const src = read('multiplayer/relay/src/roomCore.ts');
  const body = src.slice(src.indexOf('private mapPass('), src.indexOf('/** Phase 3: today\'s goal count'));
  assert.doesNotMatch(body, /setTimeout|setInterval|canSee\(/, 'no timers, no pairwise sight checks');
  assert.match(src, /if \(second && now - this\.mapAt >= MAP_DOTS\.everyMs\)/);
});

// ---- the client: store + drawing rules ----
const { createLoader } = require('./summit-harness.cjs');
t('client: the store keeps the latest cells only in a live world, and clears otherwise', () => {
  const L = createLoader();
  const D = L('lib/multiplayer/mapDots.ts');
  const subs = { msg: new Set(), st: new Set() };
  const conn = { kind: 'world', status: 'live', onMessage(f) { subs.msg.add(f); return () => subs.msg.delete(f); }, onStatus(f) { subs.st.add(f); return () => subs.st.delete(f); } };
  const off = D.attachMapDots(conn);
  let hits = 0; const unsub = D.mapDots.subscribe(() => hits++);
  for (const f of subs.msg) f([S.Map, [[1, 2, 1], [3, 4, 2]]]);
  assert.deepEqual(D.mapDots.get(), [[1, 2, 1], [3, 4, 2]]); assert.equal(hits, 1);
  for (const f of subs.msg) f([S.Map, [[1, 2, 1], [3, 4, 2]]]); assert.equal(hits, 1, 'the same list: no emit');
  conn.kind = 'party'; for (const f of subs.msg) f([S.Map, [[9, 9, 1]]]);
  assert.deepEqual(D.mapDots.get(), [], 'a party never keeps cells');
  conn.kind = 'world'; for (const f of subs.msg) f([S.Map, [[5, 5, 1]]]); conn.status = 'reconnecting'; for (const f of subs.st) f();
  assert.deepEqual(D.mapDots.get(), [], 'not live: cleared');
  unsub(); off();
  const src = read('lib/multiplayer/mapDots.ts');
  assert.doesNotMatch(src.replace(/\/\/.*$/gm, ''), /setInterval|setTimeout|requestAnimationFrame|localStorage/);
});
t('client: dots at cell centres, my own cell left out, counts as badges', () => {
  const M = createLoader()('lib/town/playerMarks.ts');
  const B = { minX: -400, maxX: 900, minZ: -500, maxZ: 500 };
  const dots = M.playerDots([[0, 0, 1], [4, -2, 3], [-1, 0, 1]], { x: 10, z: 10 }, B);
  assert.deepEqual(Array.from(dots, (d) => [d.x, d.z, d.n]), [[112.5, -37.5, 3], [-12.5, 12.5, 1]], 'centres; the cell I stand in is gone');
  assert.equal(M.playerDots([[0, 0, 1]], null, B).length, 1, 'no position known: nothing is left out');
  assert.equal(M.playerBadge(1), null); assert.equal(M.playerBadge(4), '4'); assert.equal(M.playerBadge(12), '9+');
  const comp = read('components/PlayerMapDots.tsx');
  assert.match(comp, /pointerEvents="none"/, 'not tappable'); assert.doesNotMatch(comp, /onClick|role=|tabIndex|onSelect/, 'no travel target');
  assert.doesNotMatch(comp, /setInterval|requestAnimationFrame/, 'no frame loop');
  const ov = read('components/IslandOverview.tsx');
  assert.ok(ov.indexOf('<PlayerMapDots') > -1 && ov.indexOf('<PlayerMapDots') < ov.indexOf('<FriendMapDots mode="full"'), 'drawn under the friend dots');
  const town = read('components/Town.tsx');
  assert.match(town, /const offMap=attachMapDots\(partyConnection\(\)\);/, 'attached with the island life, inside the public-world effect');
  assert.match(town, /pub\.dispose\(\);offMap\(\);/, 'and detached with it');
  assert.match(read('components/party/PresenceChoice.tsx'), /world && !near\.length && onMap \? PUBLIC_ROSTER\.furtherMap : PUBLIC_ROSTER\.further/, 'the map line only when others are only far away and the map shows them');
  const M2 = createLoader()('lib/town/mapMarkers.ts');
  assert.deepEqual(Array.from(M2.mapLegend(false, true), (i) => i.label).slice(-1), ['Players']);
  assert.equal(M2.mapLegend(false, false).length, 7); assert.match(M2.legendTipText('players'), /^Players: /);
});

console.log(`mp-map-dots: ${n} checks passed`);
