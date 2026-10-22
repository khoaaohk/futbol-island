// Multiplayer in rooms, Phase 1 (docs/multiplayer-rooms-design.md): the room pose wire encoding, old-client / old-relay compatibility,
// the entry warp + 5.5 s retry against the real RoomCore with a fake clock, the shared friend layer's room filter, wake rules and
// Battery saver, separate Konbinis, the island door hint, the Leave-only chip and the Konbini wiring. No browser, no network.
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), ts = require('typescript'), T = require('three');
const ROOT = path.join(__dirname, '..'), read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const { loadTs } = require('../multiplayer/dev-relay/loadTs.cjs');
const deq = (a, b, msg) => assert.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)), msg);
let n = 0; const t = (name, fn) => { try { fn(); n++; } catch (e) { console.error('FAIL', name); throw e; } };

// TS / TSX loader: relative and '@/' imports resolve to .ts / .tsx; `over` maps a module's file name (no extension) to a replacement.
function load(file, over = {}, ctx = {}, cache = new Map()) {
  const full = path.join(ROOT, file);
  if (cache.has(full)) return cache.get(full).exports;
  const m = { exports: {} }; cache.set(full, m); // one instance per module per top-level load (the store / connection are shared)
  const out = ts.transpileModule(read(file), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  vm.runInNewContext(out, { module: m, exports: m.exports, process: { env: {} }, document: { createElement: () => ({ getContext: () => null, width: 0, height: 0 }), hidden: false },
    Date, Math, Number, Set, Map, Array, Object, JSON, Float64Array, Float32Array, Uint8Array, Promise, Symbol, Error, ...ctx,
    require: (id) => {
      if (id === 'three') return T;
      if (/\.css$/.test(id)) return new Proxy({}, { get: (_, k) => String(k) });
      const rel = id.startsWith('@/') ? path.join(ROOT, id.slice(2)) : id.startsWith('.') ? path.resolve(path.dirname(full), id) : null;
      if (rel) {
        const key = path.basename(rel);
        if (over[key]) return over[key];
        for (const ext of ['.ts', '.tsx', '/index.ts']) if (fs.existsSync(rel + ext)) return load(path.relative(ROOT, rel + ext), over, ctx, cache);
      }
      return require(id);
    } });
  return m.exports;
}
const P = load('multiplayer/protocol/index.ts');
const pres = load('lib/multiplayer/presence.ts');
const RP = load('lib/multiplayer/roomPos.ts');
const { Mode, Zone, S, C, Activity, RoomCode, PROTOCOL_VERSION } = P;
const LOOK = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

// ---- 1. encoding -------------------------------------------------------------------------------------------------------
t('room codes: 5..8 = the room Activities, the Cay Konbini is its own code', () => {
  deq([RoomCode.Arcade, RoomCode.Museum, RoomCode.Shop, RoomCode.Konbini], [Activity.Arcade, Activity.Museum, Activity.Shop, Activity.Konbini]);
  assert.notEqual(RoomCode.KonbiniCay, RoomCode.Konbini);
  assert.equal(RP.konbiniRoom('main'), RoomCode.Konbini); assert.equal(RP.konbiniRoom('cay'), RoomCode.KonbiniCay);
  for (const c of [5, 6, 7, 8, 32, 63]) assert.ok(P.isRoomCode(c), 'room code ' + c);
  for (const c of [0, 4, 9, 13, 31, 64, 255, 1.5]) assert.ok(!P.isRoomCode(c), 'not a room code ' + c);
});
t('encode / decode round trips (x / z to 0.1 m, yaw to 1/256 turn, y in the band)', () => {
  const body = [0, 0, 0, 0, 0, 0, 0, 0], d = { room: 0, x: 0, y: 0, z: 0, yaw: 0 };
  for (const room of [RoomCode.Konbini, RoomCode.KonbiniCay, RoomCode.Museum, RoomCode.Arcade, RoomCode.Shop]) {
    const b = RP.ROOM_BOUNDS[room];
    for (const [x, z, yaw] of [[0, 0, 0], [b.minX, b.minZ, 3], [b.maxX, b.maxZ, 6.1], [1.23, -4.56, -1]]) {
      RP.encodeRoomPose(body, room, { x, y: 0, z, facing: yaw }, Mode.Walk, 0);
      assert.equal(P.roomOf(body), room); assert.ok(RP.decodeRoomPose(body, d));
      assert.ok(Math.abs(d.x - x) <= .05 && Math.abs(d.z - z) <= .05 && Math.abs(d.y) < 1e-9, `${room} ${x},${z}`);
      const dy = Math.abs((((d.yaw - yaw) % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2) - Math.PI); assert.ok(dy <= Math.PI / 256 + 1e-9, 'yaw');
      assert.equal(body[4], room, 'speed byte = room code'); assert.equal(body[6], Zone.Indoors);
      assert.ok(body[1] >= P.ROOM_Y_MIN && body[1] <= P.ROOM_Y_MAX);
    }
  }
  P.roomBody(body, RoomCode.Konbini, 0, 99, 0, 0, Mode.Idle, 0); assert.equal(body[1], P.ROOM_Y_MAX, 'y clamps to the band');
  P.roomBody(body, RoomCode.Konbini, 0, -99, 0, 0, Mode.Idle, 0); assert.equal(body[1], P.ROOM_Y_MIN);
  P.roomBody(body, RoomCode.Museum, 999, 0, -999, 0, Mode.Idle, 0); deq([body[0], body[2]], [P.ROOM_XZ_MAX, -P.ROOM_XZ_MAX], 'x / z clamp to +-38 m');
});
t('bounds: clamp and inside checks per room; encode clamps a pose into its room', () => {
  const o = { x: 0, z: 0 };
  deq(RP.clampToRoom(RoomCode.Konbini, 20, -20, o), { x: 7.4, z: -5.6 });
  assert.ok(RP.inRoomBounds(RoomCode.Konbini, 0, 6.3) && !RP.inRoomBounds(RoomCode.Konbini, 0, 6.4) && RP.inRoomBounds(RoomCode.Konbini, 0, 6.4, .2));
  assert.ok(RP.inRoomBounds(RoomCode.Museum, -20, 17) && !RP.inRoomBounds(RoomCode.Shop, 0, 6) && !RP.inRoomBounds(99, 0, 0));
  const body = [0, 0, 0, 0, 0, 0, 0, 0]; RP.encodeRoomPose(body, RoomCode.Konbini, { x: 30, y: 0, z: 30, facing: 0 }, Mode.Walk, 0);
  deq([body[0], body[2]], [74, 63]);
  for (const b of Object.values(RP.ROOM_BOUNDS)) assert.ok(Math.max(-b.minX, b.maxX, -b.minZ, b.maxZ) * 10 <= P.ROOM_XZ_MAX, 'every room fits the clamp');
});
t('roomOf: island poses and legacy door poses are -1; the band sits below every island pose (> -29 m)', () => {
  assert.ok(P.ROOM_Y_MAX < -290, 'band below -29 m');
  assert.equal(P.roomOf([100, 0, 100, 0, 8, Mode.Walk, Zone.Main, 0]), -1);
  assert.equal(P.roomOf([710, 12, -530, 0, Activity.Konbini, Mode.Busy, Zone.Indoors, 0]), -1, 'legacy door pose (y above the band)');
  assert.equal(P.roomOf([0, -350, 0, 0, 13, Mode.Busy, Zone.Indoors, 0]), -1, 'Indoors in the band with a non-room code');
  assert.equal(P.roomOf([0, -350, 0, 0, 8, Mode.Walk, Zone.Sea, 0]), -1, 'not Indoors');
  assert.equal(P.roomOf([0, -350, 0, 0, 8, Mode.Walk, Zone.Indoors, 0]), 8);
});

// ---- 2. compatibility --------------------------------------------------------------------------------------------------
t('old relay: clampPose accepts every room body (all codes, modes, band edges, flags); no bad frame, no kick', () => {
  for (const room of [5, 6, 7, 8, 32, 41, 47, 63]) for (const mode of [Mode.Walk, Mode.Run, Mode.Idle, Mode.Busy, Mode.Dive]) for (const y of [-400, -350, -300]) for (const f of [0, 1, 2, 3]) {
    const b = [380, y, -380, 255, room, mode, Zone.Indoors, f];
    deq(P.clampPose(b), b);
  }
});
t('old clients: parseServer keeps Poses / Welcome / Joined with room poses; the old reading is "indoors" + "In the Konbini" when Busy', () => {
  const body = P.roomBody([0, 0, 0, 0, 0, 0, 0, 0], RoomCode.Konbini, 1, 0, 2, 0, Mode.Walk, 0);
  assert.ok(P.parseServer(JSON.stringify([S.Poses, 7, 3, ...body])), 'Poses batch kept');
  const info = [3, [2, 0], LOOK, 0, body, 'Ana'];
  assert.ok(P.parseServer(JSON.stringify([S.Welcome, PROTOCOL_VERSION, 1, 'tok-keep-0123456789', 1, 2, 0, [info]])), 'Welcome kept (an old client can still join)');
  assert.ok(P.parseServer(JSON.stringify([S.Joined, info])));
  assert.equal(P.presenceOf(body[5], body[6], body[7]), 'indoors', 'walking in a room = indoors to an old client: fades out at the door');
  const busy = P.roomBody([0, 0, 0, 0, 0, 0, 0, 0], RoomCode.Konbini, 1, 0, 2, 0, Mode.Busy, 0);
  assert.equal(pres.presenceText('indoors', P.activityOf(busy[5], busy[4])), 'In the Konbini', 'old clients still print In the Konbini while busy');
  const cay = P.roomBody([0, 0, 0, 0, 0, 0, 0, 0], RoomCode.KonbiniCay, 1, 0, 2, 0, Mode.Busy, 0);
  assert.equal(pres.presenceText('indoors', P.activityOf(cay[5], cay[4])), 'Busy', 'unknown room codes read as plain Busy');
});
t('new store: a friend walking in a room reads "In the Konbini" (both shops), and pings from a room are ignored', () => {
  const store = load('lib/multiplayer/store.ts', { react: {} }).partyStore;
  const walk = P.roomBody([0, 0, 0, 0, 0, 0, 0, 0], RoomCode.KonbiniCay, 1, 0, 2, 0, Mode.Walk, 0);
  store.apply([S.Welcome, 1, 0, 'tok', 1, 2, 0, [[0, [0, 0], LOOK, 1, null, 'Me'], [3, [2, 0], LOOK, 0, walk, 'Ana']]], 0);
  const ana = () => store.get().members.find((m) => m.id === 3);
  assert.equal(ana().room, RoomCode.KonbiniCay); assert.equal(pres.presenceText(ana().presence, ana().activity), 'In the Konbini');
  let emits = 0; const off = store.subscribe(() => emits++);
  const island = [100, 0, 100, 0, 0, Mode.Walk, Zone.Main, 0];
  store.apply([S.Poses, 1, 3, ...island], 0); assert.equal(ana().room, -1); assert.equal(emits, 1, 'room flip emits once');
  store.apply([S.Poses, 2, 3, 101, 0, 100, 0, 0, Mode.Walk, Zone.Main, 0], 0); assert.equal(emits, 1, 'ordinary movement never emits');
  store.apply([S.Poses, 3, 3, ...walk], 0); assert.equal(emits, 2);
  store.apply([S.Ping, 3, 0, 10, 10], 0); assert.equal(store.get().pings.length, 0, 'island-only pings: ignored from a room');
  off(); store.reset();
  assert.equal(pres.roomText(RoomCode.Museum), 'In the museum'); assert.equal(pres.roomText(RoomCode.Shop), 'In the Kit Shop'); assert.equal(pres.roomText(-1), '');
});

// ---- 3. entry warp + 5.5 s retry against the deployed relay rules (fake clock) ------------------------------------------
// v1 = the deployed relay (frozen copy, tests/fixtures/mp-roomCore-v1.ts): the first warp lands in the 5 s window and is dropped, the
// retry recovers it. v1.1 (multiplayer/relay/src/roomCore.ts, design 2.3 item 2): a room change is an implicit warp, accepted at once.
for (const [ver, file] of [['v1', 'tests/fixtures/mp-roomCore-v1.ts'], ['v1.1', 'multiplayer/relay/src/roomCore.ts']]) t('entry warp (' + ver + ' relay): first room pose warps, one retry 5.5 s later; a dropped first warp is recovered by the retry', () => {
  const { RoomCore } = loadTs(path.join(ROOT, file));
  let seed = 7; const random = (k) => { const a = new Uint8Array(k); for (let i = 0; i < k; i++) { seed = (seed * 1103515245 + 12345) & 0x7fffffff; a[i] = (seed >> 8) & 255; } return a; };
  const clock = { t: 1_000_000, now() { return this.t; } };
  const room = new RoomCore({ code: 'K7MQ4R', createdAt: clock.t, clock, random });
  const peer = () => { const p = { msgs: [], closed: null, send(x) { p.msgs.push(JSON.parse(x)); }, close(c) { p.closed = c; } }; return p; };
  const a = peer(), b = peer();
  for (const p of [a, b]) { room.connect(p); room.message(p, JSON.stringify([C.Hello, PROTOCOL_VERSION, LOOK, null, room.hostKey, null, 'Ana'])); }
  const idA = a.msgs.find((m) => m[0] === S.Welcome)[2];
  let seq = 0; const send = (body) => room.message(a, JSON.stringify([C.Pose, seq++, ...body]));
  const relayPose = () => { const w = []; room.members.forEach((m) => { if (m.id === idA) w.push(m.pose); }); return w[0]; };
  send([2000, 0, -500, 0, 8, Mode.Walk, Zone.Main, 0]); // on the island near the door
  clock.t += 1000; send([2000, 0, -500, 0, 0, Mode.Walk, Zone.Main, 1]); // a lesson pop-out warp: the relay's 5 s window starts
  clock.t += 2000; // the Konbini page loads: the first room pose (with Warp) lands inside the 5 s window and is DROPPED
  const st = pres.roomPoseState(); pres.armEntryWarp(st.warp);
  const L = { x: -2, y: 0, z: 4.9, facing: Math.PI, speed: 0, busy: false, hidden: false };
  let body = pres.fillRoomBody(st, L, RoomCode.Konbini, [0, 0, 0, 0, 0, 0, 0, 0], clock.t);
  assert.equal(body[7] & 1, 1, 'first pose after the Welcome carries Warp'); send(body);
  if (ver === 'v1') assert.equal(P.roomOf(relayPose()), -1, 'the v1 relay dropped it (one warp per 5 s)');
  else assert.equal(P.roomOf(relayPose()), RoomCode.Konbini, 'v1.1: entering a room is an implicit warp, accepted at once');
  for (let i = 1; i <= 50; i++) { clock.t += 100; L.z = 4.9 - i * .02; body = pres.fillRoomBody(st, L, RoomCode.Konbini, body, clock.t); assert.equal(body[7] & 1, 0, 'no warp in between'); send(body); }
  if (ver === 'v1') assert.equal(P.roomOf(relayPose()), -1, 'speed check keeps refusing the room poses');
  else assert.equal(relayPose()[2], body[2], 'v1.1: walking in the room accepted throughout');
  clock.t += 600; body = pres.fillRoomBody(st, L, RoomCode.Konbini, body, clock.t);
  assert.equal(body[7] & 1, 1, 'the retry warp 5.5 s after the first'); send(body);
  assert.equal(P.roomOf(relayPose()), RoomCode.Konbini, 'retry accepted: the friend is in the Konbini');
  clock.t += 200; L.z -= .3; body = pres.fillRoomBody(st, L, RoomCode.Konbini, body, clock.t); assert.equal(body[7] & 1, 0, 'one retry only'); send(body);
  assert.equal(relayPose()[2], body[2], 'walking poses accepted again');
  assert.equal(a.closed, null, 'never kicked (no bad frames)');
  room.tick(); const poses = b.msgs.filter((m) => m[0] === S.Poses).pop();
  assert.ok(poses && poses.includes(RoomCode.Konbini) && P.parseServer(JSON.stringify(poses)), 'friends receive the room pose');
  // Happy path: no recent warp -> the first one is accepted at once (the retry is harmless).
  const e = pres.entryWarp(); pres.armEntryWarp(e); assert.equal(pres.entryWarpDue(e, 0), true); assert.equal(pres.entryWarpDue(e, 5499), false); assert.equal(pres.entryWarpDue(e, 5500), true); assert.equal(pres.entryWarpDue(e, 99999), false);
});
t('fillRoomBody: modes from speed, Busy at the room spot, Hidden flag, room code in every case', () => {
  const st = pres.roomPoseState(), b = [0, 0, 0, 0, 0, 0, 0, 0];
  const L = (o) => ({ x: 1, y: 0, z: 2, facing: 0, speed: 0, busy: false, hidden: false, ...o });
  assert.equal(pres.fillRoomBody(st, L({}), 8, b, 0)[5], Mode.Idle);
  assert.equal(pres.fillRoomBody(st, L({ speed: 2 }), 8, b, 0)[5], Mode.Walk);
  assert.equal(pres.fillRoomBody(st, L({ speed: 3.6 }), 8, b, 0)[5], Mode.Run);
  pres.fillRoomBody(st, L({ busy: true, x: 4.1, z: 1.2, speed: 3 }), 8, b, 0);
  deq([b[0], b[2], b[4], b[5], b[6]], [41, 12, 8, Mode.Busy, Zone.Indoors], 'busy at the counter: the spot itself, the room code');
  assert.equal(pres.fillRoomBody(st, L({ hidden: true }), 32, b, 0)[7] & 2, 2); assert.equal(b[4], 32);
});

// ---- 4. the room friend layer (real store / index / interp / presence; fake connection + avatars) ------------------------
function harness(room, opts = {}) {
  const clock = { t: 10_000 }, state = { saver: false, wakes: 0, upd: [] };
  const msg = new Set(), sts = new Set();
  const conn = { status: 'idle', code: 'K7MQ4R', rttMs: null, reconnects: 0, sent: [], emotes: [], session: opts.session ?? true, before: null,
    onMessage(f) { msg.add(f); return () => msg.delete(f); }, onStatus(f) { sts.add(f); return () => sts.delete(f); },
    hasSession() { return conn.session; }, resume() { return true; }, leave() { conn.status = 'idle'; for (const f of [...sts]) f('idle'); },
    sendPose(b, now) { if (conn.status === 'live') conn.sent.push({ b: b.slice(), t: now }); }, sendEmote(e) { conn.emotes.push(e); return true; },
    onBeforeBeat(f) { conn.before = f; }, emit(m) { for (const f of [...msg]) f(m); }, live() { conn.status = 'live'; for (const f of [...sts]) f('live'); } };
  const avatars = { root: new T.Group(), labels: new T.Group(), shown: 0, upsert() {}, remove() {}, setHidden() {}, setMuted() {}, emote: () => true, bumpField() {}, dispose() {},
    update(dt, poses, cam, red, local) { state.upd.push({ poses: new Map([...poses].map(([k, v]) => [k, { ...v }])), local: local ? { ...local } : null }); } };
  const over = { remoteAvatars: { createRemoteAvatars: () => avatars, remoteCap: () => 5 }, heatTier: { batterySaverOn: () => state.saver },
    customization: { loadCustomization: () => ({}) }, look: { lookToWire: () => LOOK, wireToLook: (l) => l }, config: { multiplayerEnabled: () => true, relayWsUrl: () => null },
    connection: { createPartyConnection: () => conn }, emoteReact: { emoteSeconds: () => 4 }, react: { useSyncExternalStore: () => null }, forceFieldBounce: { bounceOffField: () => false, fieldHit: {} } };
  const perf = { now: () => clock.t };
  const mod = load(opts.file ?? 'lib/multiplayer/roomParty.ts', over, { performance: perf });
  return { clock, state, conn, avatars, mod, over, perf };
}
const ME = (pose = null) => [0, [0, 0], LOOK, 1, pose, 'Me'];
const FR = (id, pose, colour = id) => [id, [colour, 0], LOOK, 0, pose, 'F' + id];
const rb = (room, x, z, mode = Mode.Idle, flags = 0) => P.roomBody([0, 0, 0, 0, 0, 0, 0, 0], room, x, 0, z, 0, mode, flags);
const welcome = (members) => [S.Welcome, PROTOCOL_VERSION, 0, 'tok', 1e15, 1e15, 0, members];

t('no party (flag on, no stored session): createRoomParty returns null, nothing is built', () => {
  const h = harness(RoomCode.Konbini, { session: false });
  assert.equal(h.mod.createRoomParty({ scene: new T.Scene(), room: RoomCode.Konbini, local: () => ({}), phone: true, reducedMotion: () => false, wake() {} }), null);
});
t('room layer: same-room friends only (separate Konbinis), seeded from the Welcome, room-local height, speed from the mode', () => {
  const h = harness(RoomCode.Konbini);
  const L = { x: -2, y: 0, z: 4, facing: 0, speed: 0, busy: false, hidden: false };
  const layer = h.mod.createRoomParty({ scene: new T.Scene(), room: RoomCode.Konbini, local: () => L, phone: true, reducedMotion: () => false, wake() { h.state.wakes++; },
    station: (x, z) => (Math.hypot(x - 4.1, z - 1.2) < 2.5 ? pres.STATION.Counter : pres.STATION.Snack) });
  assert.ok(layer);
  h.conn.live(); h.conn.emit(welcome([ME(), FR(1, rb(8, 1, 1)), FR(2, rb(32, 1, 1)), FR(3, [100, 0, 100, 0, 0, Mode.Walk, Zone.Main, 0])]));
  assert.ok(h.state.wakes >= 1, 'the Welcome wakes the room');
  h.clock.t += 600; assert.equal(layer.update(.05, h.clock.t, new T.OrthographicCamera()), false, 'a still friend: nothing to settle 0.6 s later');
  const f = h.state.upd.at(-1);
  deq([...f.poses.keys()], [1], 'only the friend in THIS Konbini is drawn (not the Cay Konbini, not the island)');
  const p = f.poses.get(1); assert.ok(Math.abs(p.y) < 1e-9 && p.zone === Zone.Main && p.speed === 0, 'room-local y, no door fade, idle');
  assert.ok(f.local && f.local.hex, 'my colour ring while live');
  assert.equal(layer.meRing, true, 'one ring: the party ring replaces the room foot disc');
  // first pose: a room body with Warp
  const first = h.conn.sent[0].b; assert.equal(P.roomOf(first), RoomCode.Konbini); assert.equal(first[7] & 1, 1);
  // the Cay layer sees friend 2 only
  const h2 = harness(RoomCode.KonbiniCay);
  const cay = h2.mod.createRoomParty({ scene: new T.Scene(), room: RoomCode.KonbiniCay, local: () => L, phone: false, reducedMotion: () => false, wake() {} });
  h2.conn.live(); h2.conn.emit(welcome([ME(), FR(1, rb(8, 1, 1)), FR(2, rb(32, 1, 1))])); h2.clock.t += 600; cay.update(.05, h2.clock.t, new T.OrthographicCamera());
  deq([...h2.state.upd.at(-1).poses.keys()], [2], 'friends in one Konbini never see the other');
  layer.dispose(); cay.dispose();
});
t('wake rules: a changed same-room pose wakes (frames for <= 550 ms), repeats / other rooms do not, Battery saver never wakes', () => {
  const h = harness(RoomCode.Konbini);
  const L = { x: -2, y: 0, z: 4, facing: 0, speed: 0, busy: false, hidden: false };
  const layer = h.mod.createRoomParty({ scene: new T.Scene(), room: RoomCode.Konbini, local: () => L, phone: true, reducedMotion: () => false, wake() { h.state.wakes++; } });
  h.conn.live(); h.conn.emit(welcome([ME(), FR(1, rb(8, 1, 1)), FR(2, rb(32, 1, 1))]));
  h.clock.t += 2000; layer.update(.05, h.clock.t, new T.OrthographicCamera());
  const w0 = h.state.wakes;
  const moved = rb(8, 1.4, 1, Mode.Walk);
  h.conn.emit([S.Poses, 1, 1, ...moved]); assert.equal(h.state.wakes, w0 + 1, 'changed same-room pose wakes');
  h.conn.emit([S.Poses, 2, 1, ...moved]); assert.equal(h.state.wakes, w0 + 1, 'an identical pose does not');
  h.conn.emit([S.Poses, 3, 2, ...rb(32, 3, 3, Mode.Walk)]); assert.equal(h.state.wakes, w0 + 1, 'the other Konbini never wakes this one');
  h.clock.t += 100; assert.equal(layer.update(.05, h.clock.t, new T.OrthographicCamera()), true, 'keeps frames while the friend moves');
  h.clock.t += 500; assert.equal(layer.update(.05, h.clock.t, new T.OrthographicCamera()), false, 'sleeps <= 550 ms after the last change');
  assert.equal(h.state.upd.at(-1).poses.get(1).speed, 2, 'walk cycle speed from the mode (the speed byte is the room code)');
  // a friend's emote keeps the room awake for the emote
  h.conn.emit([S.Emote, 1, 0]); assert.equal(h.state.wakes, w0 + 2, 'emote wakes'); h.clock.t += 1000; assert.equal(layer.update(.05, h.clock.t, new T.OrthographicCamera()), true);
  h.clock.t += 5000; layer.update(.05, h.clock.t, new T.OrthographicCamera());
  // Battery saver: no wake at all, no frames kept
  h.state.saver = true; const w1 = h.state.wakes;
  h.conn.emit([S.Poses, 4, 1, ...rb(8, 2.4, 1, Mode.Walk)]); assert.equal(h.state.wakes, w1, 'Battery saver: no remote wake');
  h.clock.t += 50; assert.equal(layer.update(.05, h.clock.t, new T.OrthographicCamera()), false, 'Battery saver: no remote frames');
  layer.dispose();
});
t('busy friends: field obstacle (pushOut) + station line; a friend who leaves fades at the door; entry warp retry from the beat', () => {
  const h = harness(RoomCode.Konbini);
  const L = { x: -2, y: 0, z: 4, facing: 0, speed: 0, busy: false, hidden: false };
  const layer = h.mod.createRoomParty({ scene: new T.Scene(), room: RoomCode.Konbini, local: () => L, phone: true, reducedMotion: () => false, wake() {},
    station: (x, z) => (Math.hypot(x - 4.1, z - 1.2) < 2.5 ? pres.STATION.Counter : pres.STATION.Snack) });
  h.conn.live(); h.conn.emit(welcome([ME(), FR(1, rb(8, 4.1, 1.2, Mode.Busy))]));
  h.clock.t += 600; layer.update(.05, h.clock.t, new T.OrthographicCamera());
  const p = h.state.upd.at(-1).poses.get(1);
  assert.equal(P.presenceOf(p.mode, p.zone, p.flags), 'busy'); assert.equal(pres.presenceText('busy', p.activity), 'At the counter');
  assert.equal([...layer.friendsHere()].length, 0, 'busy friends are not emote / high five targets');
  const pt = { x: 4.3, z: 1.2 }; assert.ok(layer.pushOut(pt, .3)); assert.ok(Math.hypot(pt.x - 4.1, pt.z - 1.2) >= .9 - 1e-6, 'walking into the field nudges you out');
  // leaves for the island: kept as Indoors (the avatar layer fades them out at their spot)
  h.conn.emit([S.Poses, 1, 1, 100, 0, 100, 0, 0, Mode.Walk, Zone.Main, 0]);
  h.clock.t += 100; layer.update(.05, h.clock.t, new T.OrthographicCamera());
  assert.equal(h.state.upd.at(-1).poses.get(1).zone, Zone.Indoors, 'gone: door fade at their last room spot');
  // the covered room: the beat sends the pose, and carries the retry warp
  const before = h.conn.sent.length; h.clock.t += 6000; h.conn.before();
  assert.equal(h.conn.sent.length, before + 1, 'beat sends while the loop sleeps'); assert.equal(h.conn.sent.at(-1).b[7] & 1, 1, 'the retry warp rides the beat');
  // Leave: the layer draws one empty frame then nothing
  h.conn.leave(); h.conn.emit([S.Left, 0, 0]);
  layer.dispose();
});

// ---- 5. island side: door hint + room poses fade at the door --------------------------------------------------------------
t('island: a friend entering a room fades at their last island spot; a friend first heard in a room stays roster-only; door hint "1 in the Konbini"', () => {
  const h = harness(RoomCode.Konbini, { file: 'lib/multiplayer/townBridge.ts' });
  const tb = h.mod;
  const doors = [{ room: RoomCode.Konbini, x: 70.45, y: 3.5, z: -52.4 }, { room: RoomCode.KonbiniCay, x: 523, y: 3.5, z: -177 }];
  const L = { x: 60, y: 0, z: -40, facing: 0, speed: 0, mode: Mode.Idle, zone: Zone.Main, warp: false, hidden: false, activity: -1 };
  const rt = tb.createPartyRuntime({ scene: new T.Scene(), viewGate: { addUnitRoots() {} }, local: () => L, phone: false, reducedMotion: () => false, doors });
  h.conn.live(); h.conn.emit(welcome([ME(), FR(1, [705, 0, -520, 0, 0, Mode.Walk, Zone.Main, 0]), FR(2, rb(8, 0, 0))]));
  const cam = new T.PerspectiveCamera(); cam.position.set(80, 20, -20);
  h.clock.t += 600; rt.update(.05, h.clock.t, cam);
  deq([...h.state.upd.at(-1).poses.keys()], [1], 'friend 2 (first heard in the Konbini) is roster-only on the island');
  const hints = h.avatars.root.children.filter((c) => c.name === 'party-door-hint');
  assert.equal(hints.length, 2); assert.equal(hints[0].visible, true); assert.equal(hints[0].userData.text, '1 in the Konbini'); assert.equal(hints[1].visible, false);
  h.conn.emit([S.Poses, 1, 1, ...rb(8, -2, 4.9, Mode.Walk, 1)]); // friend 1 walks into the Konbini (room pose)
  h.clock.t += 600; rt.update(.05, h.clock.t, cam);
  const p = h.state.upd.at(-1).poses.get(1);
  assert.equal(p.zone, Zone.Indoors); assert.ok(Math.abs(p.x - 70.5) < .01 && Math.abs(p.z + 52) < .01, 'indoors at the door spot, never at the room origin');
  assert.equal(hints[0].userData.text, '2 in the Konbini');
  assert.equal(tb.doorHintText(3, RoomCode.Konbini), '3 in the Konbini'); assert.equal(tb.doorHintText(1, RoomCode.Museum), '1 in the Museum'); assert.equal(tb.doorHintText(0, 8), '');
  // Arcade (Phase 3): the building's own name, and a LEGACY door pose (old client: Indoors + Activity.Arcade, room -1) counts too.
  assert.equal(tb.doorHintText(1, RoomCode.Arcade), '1 in the Arcade'); assert.equal(tb.doorHintText(0, RoomCode.Arcade), '');
  assert.equal(tb.atRoomDoor({ room: RoomCode.Arcade, presence: 'active', activity: 5 }, RoomCode.Arcade), true);
  assert.equal(tb.atRoomDoor({ room: -1, presence: 'indoors', activity: P.Activity.Arcade }, RoomCode.Arcade), true);
  assert.equal(tb.atRoomDoor({ room: -1, presence: 'busy', activity: P.Activity.Arcade }, RoomCode.Arcade), false, 'busy at an island cabinet is not the Arcade');
  assert.equal(tb.atRoomDoor({ room: -1, presence: 'indoors', activity: P.Activity.Konbini }, RoomCode.Konbini), false, 'Konbini: room poses only (unchanged)');
  assert.equal(h.conn.sent[0].b[7] & 1, 1, 'island: the first pose after a Welcome warps too (back from a room)');
  rt.dispose();
});

// ---- 5b. the Museum (rooms Phase 2) ---------------------------------------------------------------------------------------
t('museum layer: museum friends only, wake on a changed pose, Battery saver never wakes, busy line from the exhibit, free spawn slot', () => {
  const cache = new Map(), MH = load('lib/multiplayer/rooms/museumHooks.ts', {}, {}, cache), MR = load('lib/multiplayer/rooms/museum.ts', {}, {}, cache);
  const mpres = load('lib/multiplayer/presence.ts', {}, {}, cache), L = load('lib/museum/museumLayout.ts', {}, {}, cache);
  const h = harness(RoomCode.Museum);
  const me = { x: 0, y: 0, z: 6.4, facing: Math.PI, speed: 0, busy: false, hidden: false };
  const layer = h.mod.createRoomParty({ scene: new T.Scene(), room: RoomCode.Museum, local: () => me, phone: true, reducedMotion: () => false, wake() { h.state.wakes++; },
    station: (x, z) => MH.museumRoomHooks.station(x, z) });
  h.conn.live(); h.conn.emit(welcome([ME(), FR(1, rb(6, 0, 6.4)), FR(2, rb(8, 1, 1)), FR(3, [100, 0, 100, 0, 0, Mode.Walk, Zone.Main, 0])]));
  h.clock.t += 600; assert.equal(layer.update(.05, h.clock.t, new T.OrthographicCamera()), false, 'a still friend: the museum sleeps');
  deq([...h.state.upd.at(-1).poses.keys()], [1], 'only the friend in the museum is drawn (not the Konbini, not the island)');
  assert.equal(P.roomOf(h.conn.sent[0].b), RoomCode.Museum, 'my poses carry room 6');
  // arrival: friend 1 stands on slot 0 (today's arrival point) -> I walk in to the next free slot
  const spot = { x: 0, z: 0, yaw: 0 }; MR.pickMuseumSpawn(spot, layer.debugFriends().filter((f) => !f.gone), 0);
  assert.deepEqual([spot.x, spot.z], [MR.MUSEUM_SPAWNS[1].x, MR.MUSEUM_SPAWNS[1].z], 'a friend on the arrival point: the next slot');
  const w0 = h.state.wakes;
  h.conn.emit([S.Poses, 1, 1, ...rb(6, -3, 2, Mode.Walk)]); assert.equal(h.state.wakes, w0 + 1, 'changed museum pose wakes');
  h.conn.emit([S.Poses, 2, 2, ...rb(8, 2, 2, Mode.Walk)]); assert.equal(h.state.wakes, w0 + 1, 'a Konbini friend never wakes the museum');
  h.clock.t += 100; assert.equal(layer.update(.05, h.clock.t, new T.OrthographicCamera()), true, 'frames while the friend walks');
  h.clock.t += 600; assert.equal(layer.update(.05, h.clock.t, new T.OrthographicCamera()), false, 'sleeps after the friend settles');
  // busy at a case: the line is that exhibit, from this client's own layout (never on the wire); at Ada; nowhere near anything
  const poi = (id) => L.museumPois().find((p) => p.id === id), mid = (p) => ({ x: (p.a.x + p.b.x) / 2, z: (p.a.z + p.b.z) / 2 });
  const cases = L.museumPois().filter((p) => !['guide', 'wc-balls', 'timeline'].includes(p.id)), c0 = cases[0], at = mid(c0);
  h.conn.emit([S.Poses, 3, 1, ...rb(6, at.x, at.z, Mode.Busy, 1)]); h.clock.t += 1500; layer.update(.05, h.clock.t, new T.OrthographicCamera());
  let p = h.state.upd.at(-1).poses.get(1); assert.equal(P.presenceOf(p.mode, p.zone, p.flags), 'busy');
  assert.equal(mpres.presenceText('busy', p.activity), 'Looking at ' + c0.label, 'busy at a case reads "Looking at <exhibit>"');
  const pt = { x: p.x + .2, z: p.z }; assert.ok(layer.pushOut(pt, .3), 'the busy field blocks walking, as in the Konbini');
  const g = mid(poi('guide')); h.conn.emit([S.Poses, 4, 1, ...rb(6, g.x, g.z, Mode.Busy, 1)]); h.clock.t += 1500; layer.update(.05, h.clock.t, new T.OrthographicCamera());
  p = h.state.upd.at(-1).poses.get(1); assert.equal(mpres.presenceText('busy', p.activity), 'Talking to Ada');
  assert.equal(MH.museumRoomHooks.station(-17, 17.5), RoomCode.Museum, 'nothing near: "In the museum"'); assert.equal(mpres.presenceText('busy', RoomCode.Museum), 'In the museum');
  assert.ok(Object.keys(MR.museumStationLines()).every((k) => +k >= 120 && +k < 256), 'local station codes stay off the wire Activities');
  // Battery saver: no wake, no frames kept
  h.state.saver = true; const w1 = h.state.wakes;
  h.conn.emit([S.Poses, 5, 1, ...rb(6, 2, 4, Mode.Walk)]); assert.equal(h.state.wakes, w1, 'Battery saver: no remote wake');
  h.clock.t += 50; assert.equal(layer.update(.05, h.clock.t, new T.OrthographicCamera()), false, 'Battery saver: no remote frames');
  layer.dispose();
  // island door hint for the museum
  assert.ok(/MUSEUM_DOOR_HINT/.test(read('components/Town.tsx')) && /ROOM_DOOR_HINTS=\[\.\.\.KONBINI_DOOR_HINTS,MUSEUM_DOOR_HINT(?:,SHOP_DOOR_HINT)?(?:,ARCADE_DOOR_HINT)?\]/.test(read('components/Town.tsx')), 'Town passes the museum door hint');
});

// ---- 6. UI + wiring (source) ----------------------------------------------------------------------------------------------
t('RoomPartyChip: Leave only (no invite / code / kick / lock / end / ping), the emote wheel, Hide / Mute, roster lines', () => {
  const src = read('components/party/RoomPartyChip.tsx').replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
  assert.ok(!/\.host\.|kick(?!ed)|\block\(|rotate|\.end\(|sendPing|PartyInvite|JoinParty|CodeBoxes|<input/i.test(src), 'no host controls in rooms');
  // Verifier, Oct 22 2026: End / kick / Leave while in a room said nothing (the chip just vanished): one note, as PartyHost says it.
  assert.ok(/data-room-party-note/.test(src) && /'You left the party'/.test(src) && /'The party ended'/.test(src) && /ErrorCode\.Kicked/.test(src), 'a note when the party ends in a room');
  assert.ok(/selfLeft\.current = true; partyConnection\(\)\.leave\(\)/.test(src), 'own Leave says "You left the party"');
  assert.equal((src.match(/\.leave\(\)/g) || []).length, 1, 'one Leave');
  assert.ok(/<EmoteWheel/.test(src) && /setHiddenFriends/.test(src) && /setMutedFriends/.test(src));
  const chip = load('components/party/RoomPartyChip.tsx', { EmoteWheel: { default: () => null }, PartyChip: { Glyph: () => null }, roomParty: {}, multiplayer: { displayName: (m) => m.nick || m.name, usePartyState: () => ({}) }, react: { useEffect() {}, useState: (v) => [typeof v === 'function' ? v() : v, () => {}] } });
  const line = chip.roomMemberLine;
  assert.equal(line({ presence: 'indoors', activity: 8, room: 8, zone: 4 }, 8), 'Here with you');
  assert.equal(line({ presence: 'indoors', activity: 8, room: 32, zone: 4 }, 8), 'In the other Konbini');
  assert.equal(line({ presence: 'indoors', activity: 6, room: 6, zone: 4 }, 8), 'In the museum');
  assert.equal(line({ presence: 'active', activity: 0, room: -1, zone: 1 }, 8), 'At Coral Cay');
  assert.ok(/Taking a lesson/.test(line({ presence: 'busy', activity: 1, room: -1, zone: 0 }, 8)));
});
t('Konbini wiring: layer in the loop, 20 fps remote frames on phones, one ring, field obstacle, hook before the scene effect', () => {
  const sc = read('lib/konbini/konbiniScene.ts'), kr = read('components/KonbiniRoom.tsx');
  assert.ok(/REMOTE_FRAME_MS=50/.test(sc) && /remoteOnly&&mobile\?Math\.max\(base,REMOTE_FRAME_MS\):base/.test(sc), 'remote-only frames capped at 20 fps on phones');
  assert.ok(sc.indexOf('friends.update(') > 0 && sc.indexOf('friends.update(') < sc.indexOf('renderer.render(scene,camera);draws++'), 'the layer updates before the render');
  assert.ok(/if\(friends\?\.meRing\)playerShadow\.visible=false/.test(sc), 'one ring rule');
  assert.ok(/friends\.pushOut\(pushPt,\.3\)/.test(sc), 'busy friends are obstacles');
  assert.ok(/if\(settle>0\|\|leaving\|\|remoteKeep\)frame=requestAnimationFrame\(tick\)/.test(sc), 'sleeps when friends settle');
  assert.ok(!/multiplayer/.test(sc.replace(/\/\/.*$|\/\*\*[\s\S]*?\*\//gm, '').split('\n').filter((l) => /^import/.test(l)).join('\n')), 'the scene imports no multiplayer code');
  assert.ok(kr.indexOf('useRoomParty(room,konbiniRoom(shop)') > 0 && kr.indexOf('useRoomParty(room') < kr.indexOf("import('@/lib/konbini/konbiniScene')"), 'hook declared before the scene effect (disposed first)');
  assert.ok(/\{party&&<RoomPartyChip party=\{party\} hidden=\{covered\|\|!!zoom\}\/>\}/.test(kr), 'chip in the header, hidden while covered / zoomed');
  const hook = read('components/party/useRoomParty.ts');
  assert.ok(/conn\.resume\(\{ look: partyLook\(\) \}\)/.test(hook) && !/useEffect\(\(\) => \(\) => [^\n]*leave/.test(hook), 'resume on load, never leave on unmount');
  const rp = read('lib/multiplayer/roomParty.ts');
  assert.ok(!/requestAnimationFrame|setInterval|setTimeout/.test(rp) && !/lib\/analytics|\.\.\/analytics/.test(rp), 'no timers, no analytics');
  assert.ok(/KONBINI_DOOR_HINTS/.test(read('components/Town.tsx')), 'Town passes the door hints');
});

// ---- relay v1.1 room bounds (design 2.3 item 1): every client clamp + 3 m margin sits inside the relay's RELAY_ROOM_BOUNDS ---------
t('relay v1.1: RELAY_ROOM_BOUNDS hold every client room clamp (roomPos + room descriptors) with a 3 m margin', () => {
  const check = (code, b, src) => {
    const r = P.RELAY_ROOM_BOUNDS[code];
    assert.ok(r, src + ': relay bounds for room ' + code);
    const hx = Math.max(-b.minX, b.maxX) + 3, hz = Math.max(-b.minZ, b.maxZ) + 3;
    assert.ok(hx <= r.hx && hz <= r.hz, src + ' room ' + code + ': client |x| ' + hx + ' / |z| ' + hz + ' (incl. 3 m) must fit ' + r.hx + ' x ' + r.hz);
    // the farthest legal client pose, encoded as the client sends it, passes the relay check
    for (const [x, z] of [[b.minX, b.minZ], [b.maxX, b.maxZ], [b.minX, b.maxZ], [b.maxX, b.minZ]]) {
      const body = RP.encodeRoomPose([0, 0, 0, 0, 0, 0, 0, 0], code, { x, y: 0, z, facing: 0 }, Mode.Walk, 0);
      assert.ok(P.roomBoundsOk(body), src + ' room ' + code + ' corner ' + x + ',' + z);
    }
  };
  for (const code of Object.keys(RP.ROOM_BOUNDS)) check(Number(code), RP.ROOM_BOUNDS[code], 'roomPos');
  for (const [f, k] of [['lib/multiplayer/rooms/arcade.ts', 'ARCADE_ROOM'], ['lib/multiplayer/rooms/museum.ts', 'MUSEUM_ROOM']]) {
    const d = load(f)[k]; check(d.code, d.bounds, k);
  }
  assert.equal(P.roomBoundsOk(P.roomBody([0, 0, 0, 0, 0, 0, 0, 0], RoomCode.Konbini, 11.5, 0, 0, 0, Mode.Walk, 0)), false, 'past 11 m: out');
  assert.equal(P.roomBoundsOk([4300, 0, 300, 0, 8, Mode.Busy, Zone.Indoors, 0]), true, 'legacy door pose: no room bounds');
});
console.log(`mp-rooms: ${n} groups passed`);
