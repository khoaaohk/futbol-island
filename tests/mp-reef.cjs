// Shared reefs (docs/multiplayer-rooms-design.md Phase 5, owner Nov 21 2026): reef room codes, the dive pose, the "2 exploring" flag
// hint and the prompt's invite, the reef cap (3 rigs on phones, nearest first), the reef layer (same reef only, swim pose, leave /
// enter) and the island side (fade, count, beat forwarding, warp back). No browser, no network.
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), ts = require('typescript'), T = require('three');
const ROOT = path.join(__dirname, '..'), read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
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

// ---- the harness of tests/mp-rooms.cjs (real store / index / interp / presence; fake connection + avatars) ------------------
function harness(room, opts = {}) {
  const clock = { t: 10_000 }, state = { saver: false, wakes: 0, upd: [] };
  const msg = new Set(), sts = new Set();
  const conn = { status: 'idle', code: 'K7MQ4R', rttMs: null, reconnects: 0, sent: [], emotes: [], session: opts.session ?? true, before: null,
    onMessage(f) { msg.add(f); return () => msg.delete(f); }, onStatus(f) { sts.add(f); return () => sts.delete(f); },
    hasSession() { return conn.session; }, resume() { return true; }, leave() { conn.status = 'idle'; for (const f of [...sts]) f('idle'); },
    sendPose(b, now) { if (conn.status === 'live') conn.sent.push({ b: b.slice(), t: now }); }, sendEmote(e) { conn.emotes.push(e); return true; },
    onBeforeBeat(f) { conn.before = f; }, emit(m) { for (const f of [...msg]) f(m); }, live() { conn.status = 'live'; for (const f of [...sts]) f('live'); } };
  const avatars = { root: new T.Group(), labels: new T.Group(), shown: 0, upsert() {}, setKit() {}, remove() {}, setHidden() {}, setMuted() {}, emote: () => true, bumpField() {}, dispose() {},
    update(dt, poses, cam, red, local) { state.upd.push({ poses: new Map([...poses].map(([k, v]) => [k, { ...v }])), local: local ? { ...local } : null }); } };
  const over = { remoteAvatars: { createRemoteAvatars: () => avatars, remoteCap: () => 5 }, heatTier: { batterySaverOn: () => state.saver },
    customization: { loadCustomization: () => ({}) }, look: { lookToWire: () => LOOK, wireToLook: (l) => l }, config: { multiplayerEnabled: () => true, relayWsUrl: () => null },
    connection: { createPartyConnection: () => conn }, emoteReact: { emoteSeconds: () => 4 }, react: { useSyncExternalStore: () => null }, forceFieldBounce: { bounceOffField: () => false, fieldHit: {} } };
  const perf = { now: () => clock.t };
  const mod = load(opts.file ?? 'lib/multiplayer/roomParty.ts', over, { performance: perf });
  return { clock, state, conn, avatars, mod, over, perf };
}

const P = load('multiplayer/protocol/index.ts');
const pres = load('lib/multiplayer/presence.ts');
const { Mode, Zone, S, Activity, RoomCode, PROTOCOL_VERSION } = P;
const LOOK = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const ME = (pose = null) => [0, [0, 0], LOOK, 1, pose, 'Me'];
const FR = (id, pose, colour = id) => [id, [colour, 0], LOOK, 0, pose, 'F' + id];
const welcome = (members) => [S.Welcome, PROTOCOL_VERSION, 0, 'tok', 1e15, 1e15, 0, members];
const dv = (room, x, y, z, mode = Mode.Dive, flags = 0) => P.roomBody([0, 0, 0, 0, 0, 0, 0, 0], room, x, y, z, 0, mode, flags);
const SPOTS = load('lib/town/water/diveSpots.ts');

// ---- 1. room codes -------------------------------------------------------------------------------------------------------
t('reef room codes: 40 + area, every dive spot its own code 41..47, inverse, relay bounds hold the dive room', () => {
  const codes = SPOTS.DIVE_SPOTS.map((s) => P.reefRoom(s.area));
  deq(codes.slice().sort((a, b) => a - b), [41, 42, 43, 44, 45, 46, 47], 'seven spots, seven reefs');
  for (const s of SPOTS.DIVE_SPOTS) { const c = P.reefRoom(s.area); assert.ok(P.isRoomCode(c)); assert.equal(P.reefArea(c), s.area); }
  for (const a of [0, 8, -1, 1.5, NaN]) assert.equal(P.reefRoom(a), -1, 'no reef for area ' + a);
  for (const c of [40, 48, 8, 32, -1]) assert.equal(P.reefArea(c), -1, 'not a reef: ' + c);
  for (const c of codes) { const b = P.RELAY_ROOM_BOUNDS[c]; assert.ok(b && b.hx >= SPOTS.DIVE_ROOM_R + 3 && b.hz >= SPOTS.DIVE_ROOM_R + 3, 'relay bounds ' + c); }
});
t('presence: a reef reads "Exploring the reef"; the diver sends Mode.Dive in the band (surface and seabed both fit)', () => {
  assert.equal(pres.roomActivity(42), Activity.Reef); assert.equal(pres.roomText(47), 'Exploring the reef');
  assert.equal(pres.roomActivity(RoomCode.Konbini), Activity.Konbini, 'other rooms unchanged');
  const st = pres.roomPoseState(), b = [0, 0, 0, 0, 0, 0, 0, 0];
  const L = (o = {}) => ({ x: 3, y: 0, z: -4, facing: 1, speed: 0, busy: false, hidden: false, ...o });
  pres.fillRoomBody(st, L(), 42, b, 0); assert.equal(b[5], Mode.Dive, 'still: Dive (treading)'); assert.equal(P.roomOf(b), 42);
  pres.fillRoomBody(st, L({ speed: 3 }), 42, b, 0); assert.equal(b[5], Mode.Dive, 'moving: Dive (never Run)');
  pres.fillRoomBody(st, L({ busy: true }), 42, b, 0); assert.equal(b[5], Mode.Busy);
  pres.fillRoomBody(st, L({ speed: 3 }), RoomCode.Konbini, b, 0); assert.equal(b[5], Mode.Run, 'rooms keep the walk modes');
  for (const y of [SPOTS.DIVE_SURFACE_Y - 1.15, SPOTS.DIVE_SURFACE_Y - 6.5]) {
    P.roomBody(b, 42, 0, y, 0, 0, Mode.Dive, 0); assert.ok(Math.abs(P.roomLocalY(b[1]) - y) < .051, 'y round trips ' + y);
  }
  // the deployed relay keeps a reef pose (clampPose, room bounds) and the dive stroke passes its speed check
  assert.ok(P.clampPose(dv(43, 20, -1, -20)) && P.roomBoundsOk(dv(43, 20, -1, -20)));
  assert.ok(P.MAX_SPEED_MS[Mode.Dive] * 1.5 * pres.POSE_SAFE > 3.2, 'DIVE_SPEED 3.2 m/s passes the governor');
});
t('words: "2 exploring" over the flag, the prompt invites ("Dive in: 2 friends exploring"; strangers are players)', () => {
  const R = load('lib/multiplayer/reefParty.ts', { roomParty: { createRoomParty: () => null, reefCap: () => 3, REEF_PHONE_CAP: 3 } });
  assert.equal(R.reefHintText(2), '2 exploring'); assert.equal(R.reefHintText(0), '');
  assert.equal(R.reefPromptText(2, false), 'Dive in: 2 friends exploring'); assert.equal(R.reefPromptText(1, false), 'Dive in: 1 friend exploring');
  assert.equal(R.reefPromptText(3, true), 'Dive in: 3 players exploring'); assert.equal(R.reefPromptText(0, false), '');
  assert.ok(R.reefPromptText(20, false).length <= 30, 'short enough for the prompt button');
  assert.match(R.reefPromptAria(2, false), /2 friends are exploring this reef/);
  assert.equal(R.createReefParty({ scene: null, area: 9, local: () => ({}), phone: true, reducedMotion: () => false }), null, 'no reef: nothing');
});

// ---- 2. caps -------------------------------------------------------------------------------------------------------------
const realCap = (tier, phone, saver) => (saver ? 0 : !phone ? 5 : tier <= 1 ? 5 : tier === 2 ? 3 : tier === 3 ? 1 : 0); // remoteAvatars.remoteCap
t('reefCap: 3 rigs on phones (tier 0..2), 1 / 0 at tier 3 / 4, desktop 5 (3 at tier 2+), Battery saver 0 through the layer', () => {
  const h = harness(42); h.over.remoteAvatars.remoteCap = realCap;
  let opts = null; h.over.remoteAvatars.createRemoteAvatars = (sc, o) => { opts = o; return h.avatars; };
  const RP = load('lib/multiplayer/roomParty.ts', h.over, { performance: h.perf });
  deq([0, 1, 2, 3, 4].map((tr) => RP.reefCap(tr, true)), [3, 3, 3, 1, 0], 'phone');
  deq([0, 1, 2, 3, 4].map((tr) => RP.reefCap(tr, false)), [5, 5, 3, 3, 3], 'desktop');
  const layer = RP.createRoomParty({ scene: new T.Scene(), room: 42, local: () => ({ x: 0, y: 0, z: 0, facing: 0, speed: 0, busy: false, hidden: false }), phone: true, reducedMotion: () => false, wake() {}, cap: RP.reefCap, ownBeat: false });
  assert.equal(opts.maxFor(0, true), 3); assert.equal(opts.maxFor(0, false), 5);
  h.state.saver = true; assert.equal(opts.maxFor(0, false), 0, 'Battery saver: no rigs'); h.state.saver = false;
  assert.equal(h.conn.before, null, 'ownBeat false: the island keeps the beat hook');
  layer.dispose(); assert.equal(h.conn.before, null);
});
t('nearest first: 5 divers on a phone, the real remote layer draws the nearest 3 as rigs (the rest ring + label)', () => {
  const state = { live: new Set(), drawn: 0 };
  const over = {
    player: { createPlayer: (name) => { state.live.add(name); return { root: new T.Group(), setAppearance() {}, setBeanLook() {}, setExpression() {}, update() {}, dispose() { state.live.delete(name); } }; } },
    playerBatch: { playerBatch: () => ({ begin() { state.drawn = 0; }, draw() { state.drawn++; }, end() {}, dispose() {} }) },
    heatTier: { effectiveTier: () => 0, batterySaverOn: () => false },
    celebrations: { applyCelebrationArms() {}, celebrationMotion() {} }, emotePose: { applyEmoteArms() {}, emoteBody() { return { called: 0, jump: undefined }; } },
    customization: { beanLookFor: () => ({}), playerOutfit: () => ({}) }, look: { wireToLook: (l) => l },
  };
  const RA = load('lib/graphics/remoteAvatars.ts', over);
  const RPm = load('lib/multiplayer/roomParty.ts', { remoteAvatars: RA, heatTier: { batterySaverOn: () => false }, customization: { loadCustomization: () => ({}) }, look: { lookToWire: () => LOOK, wireToLook: (l) => l }, config: { multiplayerEnabled: () => false }, emoteReact: { emoteSeconds: () => 4 } });
  const av = RA.createRemoteAvatars(new T.Scene(), { phone: true, maxFor: (tr, ph) => RPm.reefCap(tr, ph), fieldScale: .7 });
  const cam = new T.PerspectiveCamera(60, 1, .1, 500); cam.position.set(0, 2, 6); cam.lookAt(0, 0, -6);
  const poses = new Map();
  for (const id of [1, 2, 3, 4, 5]) { av.upsert(id, LOOK, 'F' + id, { hex: '#ff0000' }); poses.set(id, { x: 0, y: 0, z: -id * 2.5, yaw: 0, speed: 1, mode: Mode.Dive, zone: Zone.Sea, fade: 1 }); }
  for (let i = 0; i < 40; i++) av.update(.05, poses, cam, true, { x: 0, y: 0, z: 0, hex: '#00ff00' });
  assert.equal(av.shown, 3, 'three rigs drawn');
  deq([...state.live].map((n) => +String(n).replace(/\D+/g, '')).sort(), [1, 2, 3], 'rigs = the nearest three');
  av.dispose();
});

// ---- 3. the reef layer (real store / interp / presence; fake connection + avatars) --------------------------------------
const cam0 = () => new T.OrthographicCamera();
t('reef layer: divers in the SAME reef only (not another reef, the island or a room), swim pose + stroke from the delta, Dive on the wire', () => {
  const h = harness(42, { file: 'lib/multiplayer/reefParty.ts' });
  const L = { x: 0, y: -1, z: 5, facing: 0, speed: 0, busy: false, hidden: false };
  const reef = h.mod.createReefParty({ scene: new T.Scene(), area: 2, local: () => L, phone: true, reducedMotion: () => false });
  assert.ok(reef); assert.equal(reef.room, 42);
  h.conn.live(); h.conn.emit(welcome([ME(), FR(1, dv(42, 1, -1, 1)), FR(2, dv(43, 1, -1, 1)), FR(3, [100, 0, 100, 0, 0, Mode.Walk, Zone.Main, 0]), FR(4, dv(8, 1, 0, 1, Mode.Idle))]));
  h.clock.t += 600; reef.update(.05, h.clock.t, cam0());
  let f = h.state.upd.at(-1);
  deq([...f.poses.keys()], [1], 'only the diver in THIS reef');
  assert.equal(f.local, null, 'no colour ring under my own diver'); assert.equal(reef.room, 42);
  let p = f.poses.get(1); assert.equal(p.mode, Mode.Dive); assert.equal(p.zone, Zone.Sea, 'zone Sea: the remote layer draws the wet body'); assert.ok(Math.abs(p.y + 1) < .051, 'room-local depth');
  const first = h.conn.sent.find((x) => P.roomOf(x.b) === 42); assert.ok(first, 'sends this reef'); assert.equal(first.b[5], Mode.Dive); assert.equal(first.b[7] & 1, 1, 'entry warp');
  // friend 1 swims 0.6 m per 100 ms: the stroke speed rises toward 6 m/s
  for (let i = 1; i <= 10; i++) { h.clock.t += 100; h.conn.emit([S.Poses, i, 1, ...dv(42, 1 + i * .6, -1, 1)]); reef.update(.1, h.clock.t, cam0()); }
  p = h.state.upd.at(-1).poses.get(1); assert.ok(p.speed > 2, 'a moving diver crawls (speed ' + p.speed.toFixed(2) + ')');
  for (let i = 0; i < 20; i++) { h.clock.t += 100; reef.update(.1, h.clock.t, cam0()); }
  p = h.state.upd.at(-1).poses.get(1); assert.ok(p.speed < .3, 'a still diver treads');
  // friend 2 swims into MY reef: shown; friend 1 surfaces to the island: fades out at their reef spot (gone)
  h.conn.emit([S.Poses, 40, 2, ...dv(42, -3, -1, 2, Mode.Dive, 1)]);
  h.conn.emit([S.Poses, 41, 1, 5120, 0, -2935, 0, 0, Mode.Swim, Zone.Sea, 1]);
  h.clock.t += 600; reef.update(.05, h.clock.t, cam0());
  f = h.state.upd.at(-1);
  assert.equal(f.poses.get(2).zone, Zone.Sea, 'friend 2 joined this reef'); assert.equal(f.poses.get(1).zone, Zone.Indoors, 'friend 1 left: fade out underwater');
  // the beat while the dive loop is stopped: sendNow carries the reef pose
  const n0 = h.conn.sent.length; L.x = 4; reef.sendNow(); assert.equal(h.conn.sent.length, n0 + 1); assert.equal(P.roomOf(h.conn.sent.at(-1).b), 42);
  reef.dispose();
});

// ---- 4. the island side ---------------------------------------------------------------------------------------------------
t('island: a diver fades at their last island spot (no frozen busy figure), "1 exploring" at that flag only, roomCount, beat forwarding, warp back', () => {
  const h = harness(42, { file: 'lib/multiplayer/townBridge.ts' });
  const doors = SPOTS.DIVE_SPOTS.map((s) => ({ room: P.reefRoom(s.area), x: s.surface.x, y: 3.9, z: s.surface.z }));
  const L = { x: 505, y: 0, z: -290, facing: 0, speed: 0, mode: Mode.Swim, zone: Zone.Sea, warp: false, hidden: false, activity: -1 };
  const rt = h.mod.createPartyRuntime({ scene: new T.Scene(), viewGate: { addUnitRoots() {} }, local: () => L, phone: true, reducedMotion: () => false, doors });
  h.conn.live(); h.conn.emit(welcome([ME(), FR(1, [5100, 0, -2920, 0, 0, Mode.Swim, Zone.Sea, 0]), FR(2, dv(43, 0, -1, 0))]));
  const cam = new T.PerspectiveCamera(); cam.position.set(510, 20, -280);
  h.clock.t += 600; rt.update(.05, h.clock.t, cam);
  const hints = h.avatars.root.children.filter((c) => c.name === 'party-door-hint');
  assert.equal(hints.length, 7);
  const at = (room) => hints[SPOTS.DIVE_SPOTS.findIndex((s) => P.reefRoom(s.area) === room)];
  assert.equal(at(43).userData.text, '1 exploring', 'friend 2 is diving the Kelp Forest Wreck'); assert.equal(at(42).visible, false);
  assert.equal(rt.roomCount(43), 1); assert.equal(rt.roomCount(42), 0); assert.equal(rt.roomCount(8), 0, 'no hint, no count');
  // friend 1 dives Paul's Grotto: drawn Indoors at the last island spot (the layer fades them), the hint counts them
  h.conn.emit([S.Poses, 1, 1, ...dv(42, 0, -1, 9, Mode.Dive, 1)]);
  h.clock.t += 600; rt.update(.05, h.clock.t, cam);
  const p = h.state.upd.at(-1).poses.get(1);
  assert.equal(p.zone, Zone.Indoors, 'fades out (no busy figure frozen at the flag)'); assert.ok(Math.abs(p.x - 510) < .01 && Math.abs(p.z + 292) < .01, 'at their last island spot');
  assert.equal(at(42).userData.text, '1 exploring'); assert.equal(rt.roomCount(42), 1);
  assert.equal(h.mod.doorHintText(2, 45), '2 exploring');
  assert.equal(at(42).visible, true, 'in range: shown');
  rt.muteRoomHint(42); h.clock.t += 50; rt.update(.05, h.clock.t, cam); assert.equal(at(42).visible, false, 'the invite on the dive prompt replaces that flag hint');
  rt.muteRoomHint(-1); h.clock.t += 50; rt.update(.05, h.clock.t, cam); assert.equal(at(42).visible, true);
  // I dive: the island's beat forwards to the reef layer; back up: the next island pose is a Warp
  let fwd = 0; rt.setRoomLayer({ sendNow() { fwd++; } });
  h.clock.t += 6000; h.conn.before(); assert.equal(fwd, 1, 'the beat asks the reef layer while under');
  rt.setRoomLayer(null); h.clock.t += 6000;
  const n0 = h.conn.sent.length; L.x += 1; rt.update(.05, h.clock.t, cam);
  assert.equal(h.conn.sent.length, n0 + 1); assert.equal(h.conn.sent.at(-1).b[7] & 1, 1, 'surfacing warps the island pose');

  rt.dispose();
});

// ---- 5. wiring (source) ---------------------------------------------------------------------------------------------------
t('wiring: the layer is made on the way under and ended on the way up; the dive frame updates it before its one render', () => {
  const town = read('components/Town.tsx'), dr = read('lib/town/water/diveRuntime.ts');
  assert.match(town, /REEF_DOOR_HINTS=DIVE_SPOTS\.map\(s=>\(\{room:reefRoom\(s\.area\)/);
  assert.match(town, /createReefParty\(\{scene:room0\.scene,area:spot\.area/);
  assert.match(town, /surfaced:\(spot,reason\)=>\{[^\n]*endReefParty\(\)/);
  assert.match(town, /party\.muteRoomHint\(dive\.promptShown&&ns\?reefRoom\(ns\.area\):-1\)/);
  assert.match(town, /beforeRender:\(_s,cam,dt\)=>\{if\(reefParty\)reefParty\.update\(dt,performance\.now\(\),cam\);\}/);
  assert.ok(dr.indexOf('ports.beforeRender?.(room.scene,room.camera,dt);') > 0 && dr.indexOf('ports.beforeRender?.(room.scene,room.camera,dt);') < dr.indexOf('ports.renderer.render(room.scene,room.camera);'), 'before the room render');
  // the island stays frozen: the dive branch still returns before party.update
  const branch = town.indexOf('if(dive.diving){const rest0='), upd = town.indexOf('party?.update(active?dt:0');
  assert.ok(branch > 0 && upd > branch, 'island party update after the dive branch (never while under)');
  assert.ok(/disposers\.add\(endReefParty\)/.test(town), 'page teardown ends the layer');
  // no analytics in the reef module
  assert.ok(!/from '[^']*analytics/.test(read('lib/multiplayer/reefParty.ts')));
});

console.log(`mp-reef: ${n} checks passed`);
