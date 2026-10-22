// Multiplayer in rooms, Phase 4 client (docs/multiplayer-rooms-design.md): the Kit Shop. The room descriptor (code 7, bounds,
// areas, 9 spawn slots round the doors, wake rule, caps), the busy table checked against a source scan of ShopRoom.tsx, the
// receiver's station line, the hooks seam (no-op without a layer), the shared room layer driving a shop (same-room filter, fields,
// wake rules, Battery saver), the island door hint, outfits from Hello only, and the page / scene wiring. No browser, no network.
// usage: node tests/mp-rooms-shop.cjs
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), ts = require('typescript'), T = require('three');
const ROOT = path.join(__dirname, '..'), read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const deq = (a, b, msg) => assert.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)), msg);
let n = 0; const t = (name, fn) => { try { fn(); n++; } catch (e) { console.error('FAIL', name); throw e; } };

// TS loader (tests/mp-rooms.cjs): relative and '@/' imports resolve to .ts / .tsx; `over` swaps a module by file name; one cache =
// one instance of every module (the shop registers its station words on THAT presence module).
function load(file, over = {}, ctx = {}, cache = new Map()) {
  const full = path.join(ROOT, file);
  if (cache.has(full)) return cache.get(full).exports;
  const m = { exports: {} }; cache.set(full, m);
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
const cache = new Map();
const SH = load('lib/multiplayer/rooms/shop.ts', {}, {}, cache);
const pres = load('lib/multiplayer/presence.ts', {}, {}, cache);
const P = load('multiplayer/protocol/index.ts', {}, {}, cache);
const RP = load('lib/multiplayer/roomPos.ts', {}, {}, cache);
const LAY = load('lib/shop/shopLayout.ts', {}, {}, cache);
const CAST = load('lib/shop/shopCast.ts', {}, {}, cache);
const { Mode, Zone, S, Activity, RoomCode, PROTOCOL_VERSION } = P;
const { WORLD_BOUNDS } = load('multiplayer/protocol/limits.ts', {}, {}, cache);
const D = SH.SHOP_ROOM, inR = (r, x, z) => x >= r.minX && x <= r.maxX && z >= r.minZ && z <= r.maxZ;
const shopRoom = read('components/shop/ShopRoom.tsx'), scene = read('lib/shop/shopScene.ts'), hooksSrc = read('lib/multiplayer/rooms/shopHooks.ts');

// ---- 1. descriptor --------------------------------------------------------------------------------------------------------------
t('descriptor: code 7 = RoomCode.Shop = Activity.Shop, shape, bounds = the room clamp, inside the wire and relay v1.1 box', () => {
  assert.equal(D.code, 7); assert.equal(D.code, RoomCode.Shop); assert.equal(D.code, Activity.Shop, 'old clients still print the shop while Busy');
  for (const k of ['code', 'id', 'name', 'scale', 'bounds', 'areas', 'door', 'spawns', 'wake', 'caps', 'busy']) assert.ok(k in D, k);
  assert.equal(D.id, 'shop'); assert.equal(D.scale, 1);
  const b = D.bounds; deq([b.minX, b.maxX, b.minZ, b.maxZ], [-LAY.ROOM.halfW, LAY.ROOM.halfW, LAY.ROOM.back, LAY.ROOM.front]);
  const rb = RP.ROOM_BOUNDS[RoomCode.Shop]; deq([rb.minX, rb.maxX, rb.minZ, rb.maxZ], [b.minX, b.maxX, b.minZ, b.maxZ], 'same box as roomPos ROOM_BOUNDS (what the client clamps to)');
  assert.ok(Math.max(-b.minX, b.maxX) + 3 <= 12 && Math.max(-b.minZ, b.maxZ + .6) + 3 <= 10, 'inside relay v1.1 ROOM_BOUNDS Shop 12 x 10 (incl. 3 m margin)');
  assert.ok(b.minX * 10 >= WORLD_BOUNDS.minX && b.maxX * 10 <= WORLD_BOUNDS.maxX && b.minZ * 10 >= WORLD_BOUNDS.minZ && (b.maxZ + 1) * 10 <= WORLD_BOUNDS.maxZ, 'x/z dm inside WORLD_BOUNDS');
  deq(D.caps, { max: 5, fieldR: .8, stationR: 2.5 });
  deq(D.door.inside, SH.SHOP_ARRIVAL); assert.ok(D.door.z > b.maxZ - .1 && D.door.z <= b.maxZ + .6, 'door on the sill');
});
t('areas: the three studio stands, the till, the bench, the door and the floor, all inside bounds', () => {
  const ids = D.areas.map((a) => a.id);
  for (const id of ['studio-jersey', 'studio-boots', 'studio-ball', 'till', 'bench', 'door', 'floor']) assert.ok(ids.includes(id), id);
  for (const a of D.areas) assert.ok(inR(D.bounds, a.rect.minX, a.rect.minZ) && inR(D.bounds, a.rect.maxX, a.rect.maxZ), a.id + ' inside bounds');
  for (const p of LAY.stationPois()) { const r = D.areas.find((a) => a.id === 'studio-' + p.station).rect; assert.ok(inR(r, p.stand.x, p.stand.z), p.station + ' stand inside its area'); }
});
t('spawn slots: 9, slot 0 = today\'s arrival, inside, walkable, apart, clamp-stable, facing in; pickShopSpawn', () => {
  const Sp = D.spawns; assert.equal(Sp.length, 9);
  deq([Sp[0].x, Sp[0].z], [SH.SHOP_ARRIVAL.x, SH.SHOP_ARRIVAL.z]);
  assert.match(scene, /target=\{x:DOOR\.x,z:ROOM\.front-1\.8\};/, 'the scene\'s walk-in target is SHOP_ARRIVAL');
  for (const s of Sp) {
    assert.ok(inR(D.bounds, s.x, s.z), 'inside'); assert.ok(SH.shopWalkable(s.x, s.z), `slot ${s.x},${s.z} walkable`); assert.equal(s.yaw, Math.PI);
    const c = SH.clampToShop({ x: 0, z: 0 }, s.x, s.z); assert.ok(Math.abs(c.x - s.x) < 1e-9 && Math.abs(c.z - s.z) < 1e-9, 'clamp leaves a slot alone');
    assert.ok(Math.hypot(s.x - D.door.x, s.z - D.door.z) < 3.4, 'an arc round the doors');
  }
  for (let i = 0; i < Sp.length; i++) for (let j = i + 1; j < Sp.length; j++) assert.ok(Math.hypot(Sp[i].x - Sp[j].x, Sp[i].z - Sp[j].z) >= .7, `slots ${i},${j} apart`);
  const o = { x: 0, z: 0, yaw: 0 };
  deq(SH.pickShopSpawn(o, []), { x: Sp[0].x, z: Sp[0].z, yaw: Math.PI }, 'empty shop: today\'s arrival');
  deq([SH.pickShopSpawn(o, [{ x: Sp[0].x, z: Sp[0].z }]).x], [Sp[1].x], 'a friend on slot 0: the next slot');
  deq([SH.pickShopSpawn(o, Sp, 11).x], [Sp[11 % 9].x], 'all taken: the seed spreads');
  const c = SH.clampToShop({ x: 0, z: 0 }, 30, -30); assert.ok(inR(D.bounds, c.x, c.z), 'clamp brings a far point inside');
});
t('wake rule: remote wake, 20 fps remote frames on phones, 300 ms settle, Battery saver never wakes', () => {
  deq(D.wake, { remote: true, remoteFpsPhone: 20, settleMs: 300, batterySaver: false });
  assert.match(scene, /SHOP_REMOTE_FRAME_MS=50;/); assert.equal(1000 / 50, D.wake.remoteFpsPhone, 'scene remote rate matches the descriptor');
  assert.match(read('lib/multiplayer/roomParty.ts'), /const wake = \(\) => \{ if \(!batterySaverOn\(\)\) ctx\.wake\(\); \};/, 'the layer never wakes a room in Battery saver');
});

// ---- 2. busy ---------------------------------------------------------------------------------------------------------------------
t('busy table covers every shop busy flag (source scan of ShopRoom.tsx), in precedence order', () => {
  const m = shopRoom.match(/const covered=([^;]+);/); assert.ok(m, 'ShopRoom has the covered expression');
  const flags = m[1].split('||').map((s) => s.replace(/!/g, '').trim());
  deq(flags.sort(), ['myKit', 'studio', 'talking']);
  for (const f of flags) assert.ok(D.busy.some((b) => b.flag === f), f + ' in SHOP_BUSY');
  deq(D.busy.map((b) => b.flag), ['studio', 'talking', 'myKit']);
  assert.match(shopRoom, /shopRoomHooks\.setBusy\(studio,myKit,talking\?\.id\?\?null\)/, 'the page reports its flags');
  assert.match(shopRoom, /useRoomParty\(shopRoomHooks\.hostRef,RoomCode\.Shop,ready,covered\)/, 'covered = Busy on the wire');
  const f = SH.shopBusyFlags(); assert.equal(SH.shopBusyFlag(f), null); assert.equal(SH.shopBusyText(f), '');
  f.myKit = true; assert.equal(SH.shopBusyText(f), 'Looking at my kit');
  f.talking = CAST.SHOP_CLERK.def.id; assert.equal(SH.shopBusyText(f), 'Talking to Femi'); f.talking = 'shop-yuna'; assert.equal(SH.shopBusyText(f), 'Chatting');
  f.studio = 'jersey'; assert.equal(SH.shopBusyFlag(f), 'studio'); assert.equal(SH.shopBusyText(f), 'Designing a kit');
});
t('station line (receiver): studio stand "Designing a kit", the till "Talking to Femi", elsewhere "Looking at my kit"; words registered', () => {
  const ST = pres.STATION;
  for (const p of LAY.stationPois()) assert.equal(SH.shopStationAt(p.stand.x, p.stand.z), ST.ShopDesign, p.station);
  const till = LAY.clerkPoi('Femi'); assert.equal(SH.shopStationAt(0, till.a.z), ST.ShopClerk);
  assert.equal(SH.shopStationAt(-3, 3.2), ST.ShopKit); assert.equal(SH.shopStationAt(SH.SHOP_ARRIVAL.x, SH.SHOP_ARRIVAL.z), ST.ShopKit);
  assert.equal(pres.presenceText('busy', ST.ShopDesign), 'Designing a kit'); assert.equal(pres.presenceText('busy', ST.ShopClerk), 'Talking to Femi');
  assert.equal(pres.presenceText('busy', ST.ShopKit), 'Looking at my kit'); assert.ok(pres.presenceIcon('busy', ST.ShopDesign) !== pres.presenceIcon('busy', Activity.None));
  for (const b of D.busy) assert.equal(pres.presenceText('busy', b.station), b.text.replace('Chatting', b.text), b.flag + ' station words');
  for (const k of ['ShopDesign', 'ShopKit', 'ShopClerk']) assert.ok(ST[k] >= 101 && ![101, 102, 103].includes(ST[k]), k + ' is a local code clear of the Konbini');
  assert.equal(pres.roomText(RoomCode.Shop), 'In the Kit Shop'); assert.equal(pres.presenceText('indoors', Activity.Shop), 'In the Kit Shop', 'party list: "In the Kit Shop"');
});

// ---- 3. hooks seam --------------------------------------------------------------------------------------------------------------
t('hooks: no-op without a layer (frame false, pushOut moves nothing, no host before the scene registers)', () => {
  const H = load('lib/multiplayer/rooms/shopHooks.ts', {}, {}, new Map()).shopRoomHooks;
  assert.equal(H.hostRef.current, null, 'no scene: useRoomParty sees no host');
  assert.equal(H.frame(.016, 0, {}), false); const p = { x: 1, z: 1 }; assert.equal(H.pushOut(p, .3), false); deq(p, { x: 1, z: 1 });
  assert.equal(H.meRing, false); assert.equal(H.shown, 0); assert.equal(H.attached, false); deq(H.debugFriends(), []);
  let wakes = 0, slots = [], arrived = null; const src = { scene: {}, camera: {}, phone: true, reduced: false, readPose(o) { o.x = 1; o.z = 2; o.facing = 3; o.speed = .5; },
    wakeRemote() { wakes++; }, arrive(x, z) { arrived = { x, z }; }, emote() {}, setFriendSlots(k) { slots.push(k); }, sleeping: () => true };
  H.register(src); assert.equal(H.frame(.016, 0, {}), false, 'registered, still no layer: unchanged sleep rule'); deq(slots, [], 'no crowd change without a layer');
  const host = H.hostRef.current; assert.ok(host); assert.equal(host.threeScene, src.scene); assert.equal(host.phone, true);
  deq(host.localPose(), { x: 1, z: 2, facing: 3, speed: .5, eating: false, zoomed: false }); assert.equal(host.localPose(), host.localPose(), 'one reused object');
  assert.equal(host.stationAt(-3.9, -3.4), pres.STATION.ShopDesign, 'station codes pass through useRoomParty');
  // a layer attaches: wakes once, drives frames, swaps shoppers for friends, re-aims the walk-in when a friend already stands at slot 0
  const friend = { x: SH.SHOP_SPAWNS[0].x, z: SH.SHOP_SPAWNS[0].z };
  const layer = { shown: 1, meRing: true, update: () => true, pushOut: (q) => { q.x = 9; return true; }, nearestFriend: () => null, friendsHere: () => [friend] };
  host.setFriendLayer(layer); assert.equal(wakes, 1, 'attach wakes the shop once'); assert.equal(H.attached, true);
  assert.equal(H.frame(.016, 100, {}), true); deq(slots, [1], 'one friend drawn: one shopper steps out'); deq(arrived, { x: SH.SHOP_SPAWNS[1].x, z: SH.SHOP_SPAWNS[1].z }, 'walk-in re-aimed to a free slot');
  arrived = null; H.frame(.016, 200, {}); assert.equal(arrived, null, 'arrival re-aim happens once'); deq(slots, [1], 'no crowd churn while the count holds');
  assert.equal(H.pushOut(p, .3), true); assert.equal(H.meRing, true);
  H.setBusy('ball', false, null); assert.equal(H.busyFlag, 'studio'); assert.equal(H.busyText, 'Designing a kit');
  host.setFriendLayer(null); assert.equal(H.attached, false); deq(slots, [1, 0], 'detach: shoppers come back'); assert.equal(H.frame(.016, 300, {}), false);
  H.unregister(src); assert.equal(H.hostRef.current, null);
});
t('crowd: friends replace shoppers (rig count never rises)', () => {
  assert.equal(SH.shopCrowdCount(0), CAST.SHOP_SHOPPER_CAP); assert.equal(SH.shopCrowdCount(2), CAST.SHOP_SHOPPER_CAP - 2); assert.equal(SH.shopCrowdCount(9), 0); assert.equal(SH.shopCrowdCount(-1), CAST.SHOP_SHOPPER_CAP);
  for (let k = 0; k <= 5; k++) assert.ok(SH.shopCrowdCount(k) + Math.min(k, D.caps.max) <= CAST.SHOP_SHOPPER_CAP, 'shoppers + friends <= the old shopper count');
  assert.match(scene, /const STEP_OUT=\['shop-tane','shop-yuna','shop-yusuf','shop-oskar','shop-nadia'\];/, 'a kid steps out before the parent it walks with');
  deq([...scene.match(/const STEP_OUT=\[([^\]]+)\]/)[1].matchAll(/'(shop-[a-z]+)'/g)].map((m) => m[1]).sort(), CAST.SHOP_SHOPPERS.map((s) => s.def.id).sort(), 'every shopper is in the step-out order');
  assert.match(scene, /for\(const a of actors\)if\(!a\.away&&stepActor\(a,dt,t,youMoving\)\)crowd=true;/, 'a shopper who stepped out is never posed');
  assert.match(scene, /const pois=\(\):ShopPoi\[\]=>\[\.\.\.stations,clerkPoiValue,\.\.\.shoppers\.filter\(a=>!a\.away\)/, '…nor a prompt / tap target');
});

// ---- 4. the shared room layer in the shop (real store / interp / presence; fake connection + avatars) ----------------------------
function harness() {
  const clock = { t: 10_000 }, state = { saver: false, wakes: 0, upd: [] };
  const msg = new Set(), sts = new Set();
  const conn = { status: 'idle', code: 'K7MQ4R', rttMs: null, reconnects: 0, sent: [], emotes: [], session: true, before: null,
    onMessage(f) { msg.add(f); return () => msg.delete(f); }, onStatus(f) { sts.add(f); return () => sts.delete(f); },
    hasSession() { return conn.session; }, resume() { return true; }, leave() { conn.status = 'idle'; for (const f of [...sts]) f('idle'); },
    sendPose(b, now) { if (conn.status === 'live') conn.sent.push({ b: b.slice(), t: now }); }, sendEmote(e) { conn.emotes.push(e); return true; },
    onBeforeBeat(f) { conn.before = f; }, emit(m) { for (const f of [...msg]) f(m); }, live() { conn.status = 'live'; for (const f of [...sts]) f('live'); } };
  const looks = new Map();
  const avatars = { root: new T.Group(), labels: new T.Group(), shown: 0, upsert(id, look) { looks.set(id, look); }, remove() {}, setHidden() {}, setMuted() {}, emote: () => true, bumpField() {}, dispose() {},
    update(dt, poses) { state.upd.push({ poses: new Map([...poses].map(([k, v]) => [k, { ...v }])) }); } };
  const over = { remoteAvatars: { createRemoteAvatars: () => avatars, remoteCap: () => 5 }, heatTier: { batterySaverOn: () => state.saver },
    customization: { loadCustomization: () => ({}) }, look: { lookToWire: () => LOOK, wireToLook: (l) => l }, config: { multiplayerEnabled: () => true, relayWsUrl: () => null },
    connection: { createPartyConnection: () => conn }, emoteReact: { emoteSeconds: () => 4 }, react: { useSyncExternalStore: () => null }, forceFieldBounce: { bounceOffField: () => false, fieldHit: {} } };
  const mod = load('lib/multiplayer/roomParty.ts', over, { performance: { now: () => clock.t } });
  return { clock, state, conn, avatars, mod, looks };
}
const LOOK = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], LOOK2 = [2, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const ME = () => [0, [0, 0], LOOK, 1, null, 'Me'];
const FR = (id, pose, look = LOOK) => [id, [id, 0], look, 0, pose, 'F' + id];
const rb = (room, x, z, mode = Mode.Idle, flags = 0) => P.roomBody([0, 0, 0, 0, 0, 0, 0, 0], room, x, 0, z, 0, mode, flags);
const welcome = (members) => [S.Welcome, PROTOCOL_VERSION, 0, 'tok', 1e15, 1e15, 0, members];
const cam = new T.PerspectiveCamera();

t('shop layer: only friends in the Kit Shop are drawn; a busy friend at a studio stand reads "Designing a kit" and is solid', () => {
  const h = harness(), L = { x: 0, y: 0, z: 2.7, facing: 0, speed: 0, busy: false, hidden: false };
  const layer = h.mod.createRoomParty({ scene: new T.Scene(), room: RoomCode.Shop, local: () => L, phone: true, reducedMotion: () => false, wake() { h.state.wakes++; }, station: SH.shopStationAt });
  assert.ok(layer);
  const stand = LAY.stationPois()[0].stand;
  h.conn.live(); h.conn.emit(welcome([ME(), FR(1, rb(7, -2, 3)), FR(2, rb(7, stand.x, stand.z, Mode.Busy)), FR(3, rb(8, 1, 1)), FR(4, [100, 0, 100, 0, 0, Mode.Walk, Zone.Main, 0])]));
  h.clock.t += 600; layer.update(.05, h.clock.t, cam);
  const f = h.state.upd.at(-1); deq([...f.poses.keys()].sort(), [1, 2], 'the Konbini friend and the island friend stay roster-only');
  assert.equal(f.poses.get(2).mode, Mode.Busy); assert.equal(f.poses.get(2).activity, pres.STATION.ShopDesign, 'busy at the jersey stand: Designing a kit');
  assert.equal(f.poses.get(1).activity, 0, 'a walking friend has no line');
  const me = { x: stand.x + .2, z: stand.z }; assert.equal(layer.pushOut(me, .3), true, 'the stand\'s force field blocks walking');
  assert.ok(Math.hypot(me.x - stand.x, me.z - stand.z) >= .9 - 1e-9, 'pushed out to field r 0.6 + body 0.3');
  deq([...layer.friendsHere()].length, 1, 'friend-pair emotes pick from walking friends only');
  const first = h.conn.sent[0].b; assert.equal(P.roomOf(first), RoomCode.Shop); assert.equal(first[7] & 1, 1, 'entry Warp (current relay v1: + one retry 5.5 s later)');
  L.busy = true; h.clock.t += 100; layer.update(.05, h.clock.t, cam); const busy = h.conn.sent.at(-1).b; assert.equal(busy[5], Mode.Busy); assert.equal(busy[4], 7, 'Busy in the shop: the room code in the speed byte');
  layer.dispose();
});
t('shop wake rules: same-room changes wake, other rooms do not, frames stop <= 550 ms after, Battery saver never wakes', () => {
  const h = harness(), L = { x: 0, y: 0, z: 2.7, facing: 0, speed: 0, busy: false, hidden: false };
  const layer = h.mod.createRoomParty({ scene: new T.Scene(), room: RoomCode.Shop, local: () => L, phone: true, reducedMotion: () => false, wake() { h.state.wakes++; }, station: SH.shopStationAt });
  h.conn.live(); h.conn.emit(welcome([ME(), FR(1, rb(7, -2, 3)), FR(2, rb(8, 1, 1))])); h.clock.t += 2000; layer.update(.05, h.clock.t, cam);
  const w0 = h.state.wakes;
  h.conn.emit([S.Poses, 1, 1, ...rb(7, -1.6, 3, Mode.Walk)]); assert.equal(h.state.wakes, w0 + 1);
  h.conn.emit([S.Poses, 2, 2, ...rb(8, 2, 2, Mode.Walk)]); assert.equal(h.state.wakes, w0 + 1, 'a Konbini friend never wakes the shop');
  h.clock.t += 100; assert.equal(layer.update(.05, h.clock.t, cam), true); h.clock.t += 500; assert.equal(layer.update(.05, h.clock.t, cam), false);
  h.state.saver = true; const w1 = h.state.wakes; h.conn.emit([S.Poses, 3, 1, ...rb(7, -1, 2, Mode.Walk)]); assert.equal(h.state.wakes, w1, 'Battery saver: no wake');
  h.clock.t += 50; assert.equal(layer.update(.05, h.clock.t, cam), false, 'Battery saver: no remote frames');
  layer.dispose();
});
t('outfits: a friend\'s look is the one from their Hello / roster (no live try-on, no new protocol message)', () => {
  const h = harness(); const layer = h.mod.createRoomParty({ scene: new T.Scene(), room: RoomCode.Shop, local: () => ({ x: 0, y: 0, z: 2, facing: 0, speed: 0, busy: false, hidden: false }), phone: false, reducedMotion: () => false, wake() {} });
  h.conn.live(); h.conn.emit(welcome([ME(), FR(1, rb(7, 1, 2), LOOK2)])); deq(h.looks.get(1), LOOK2, 'the look from the Welcome roster');
  h.conn.emit([S.Poses, 1, 1, ...rb(7, 1.4, 2, Mode.Walk)]); deq(h.looks.get(1), LOOK2, 'poses never change the look');
  layer.dispose();
  assert.ok(!('Look' in P.C), 'no C.Look message (live outfits are out of scope in v1; relay v1.1 re-sends the look on a resume Hello)');
  for (const f of ['components/shop/ShopRoom.tsx', 'lib/shop/shopScene.ts', 'lib/multiplayer/rooms/shop.ts', 'lib/multiplayer/rooms/shopHooks.ts'])
    assert.ok(!/sendLook|C\.Look|conn\.send\(/.test(read(f)), f + ' sends nothing new');
});

// ---- 5. wiring ------------------------------------------------------------------------------------------------------------------
t('page wiring: the shared hook + Leave-only chip (hidden while covered), the scene stays lazy', () => {
  assert.match(shopRoom, /import \{useRoomParty\} from '\.\.\/party\/useRoomParty';import RoomPartyChip from '\.\.\/party\/RoomPartyChip';/);
  assert.match(shopRoom, /\{party&&<div className=\{styles\.partySlot\} data-shop-party><RoomPartyChip party=\{party\} hidden=\{covered\}\/><\/div>\}/);
  assert.ok(shopRoom.indexOf('useRoomParty(') < shopRoom.indexOf("import('@/lib/shop/shopScene')"), 'the layer is created before the scene effect (disposed first on unmount)');
  assert.ok(!/PartyHost/.test(shopRoom), 'no island party sheet in the shop (host controls stay on the island)');
  const chip = read('components/party/RoomPartyChip.tsx'); assert.ok(/data-room-leave/.test(chip) && !/data-party-end|data-party-code|\.kick\(|sendKick|lock\(/.test(chip), 'the room chip is Leave-only');
  assert.match(read('components/party/useRoomParty.ts'), /typeof k === 'number' \? k :/, 'useRoomParty passes a room\'s station codes through');
});
t('scene wiring: hooks registered / unregistered, friends drawn before render, fields solid, one ring, emotes without camera change', () => {
  assert.match(scene, /shopRoomHooks\.register\(hookSource\);/); assert.match(scene, /shopRoomHooks\.unregister\(hookSource\);/);
  const iFrame = scene.indexOf('const remoteKeep=shopRoomHooks.frame(dt,performance.now(),camera);'), iRender = scene.indexOf('renderer.render(scene,camera);draws++;');
  assert.ok(iFrame > 0 && iFrame < iRender, 'the layer updates before the render');
  assert.match(scene, /if\(shopRoomHooks\.pushOut\(pushPt,\.3\)\)\{pos\.x=pushPt\.x;pos\.z=pushPt\.z;\}\s*shopCollide\(pos,obstacles\);/, 'busy friends\' fields push you out, then the room clamp');
  assert.match(scene, /placeShadow\(0,x,z,ringHid\?0:\.42\)/, 'your blob shadow hides while the party ring shows');
  assert.match(scene, /function wakeRemote\(\)\{if\(!frame&&!covered&&!disposed&&!document\.hidden\)/, 'remote wake never runs while covered or hidden');
  assert.match(scene, /remoteOnly=!you&&settle<=0&&!crowd&&remoteKeep;if\(remoteOnly\)remoteFrames\+\+;/);
  const emote = scene.slice(scene.indexOf('async function playEmote'), scene.indexOf('async function playEmote') + 500);
  assert.ok(emote && !/camera\.|fov|dist=/.test(emote), 'emotes in rooms: no camera zoom');
  // the scene only knows the seam: no multiplayer runtime imports (the bundle stays lean without a party)
  for (const m of scene.matchAll(/from '([^']*multiplayer[^']*)'/g)) assert.ok(/rooms\/shop(Hooks)?$/.test(m[1]), 'only the shop seam: ' + m[1]);
  assert.ok(!/from '\.\.\/\.\.\/multiplayer|roomParty|connection'/.test(hooksSrc), 'the hooks import no network code');
});
t('island: "2 in the Kit Shop" over the shop door (Konbini hint mechanism), party list "In the Kit Shop"', () => {
  const town = read('components/Town.tsx'), hint = read('lib/town/shopDoorHint.ts');
  assert.match(town, /const PARTY_DOOR_HINTS=\[\.\.\.KONBINI_DOOR_HINTS,SHOP_DOOR_HINT\];/); assert.match(town, /doors:PARTY_DOOR_HINTS\}/);
  assert.match(hint, /room:RoomCode\.Shop,x:SHOP_DOOR\.x,y:SHOP_CANOPY\.y\+1\.4,z:SHOP_DOOR\.front\+\.3/);
  const tb = read('lib/multiplayer/townBridge.ts'); const m = [tb.slice(tb.indexOf('export function doorHintText'), tb.indexOf('export function doorHintText') + 200)]; m[1] = m[0];
  const doorHintText = (k, room) => (k > 0 ? `${k} ${pres.roomText(room).replace(/^In /, 'in ')}` : '');
  assert.ok(m[1].includes("roomText(room).replace(/^In /, 'in ')"), 'townBridge words = roomText');
  assert.equal(doorHintText(2, RoomCode.Shop), '2 in the Kit Shop'); assert.equal(SH.shopDoorHintText(1), '1 in the Kit Shop'); assert.equal(SH.shopDoorHintText(0), '');
  assert.ok(!/rooms\/shop'|shopCast|shopLayout/.test(hint), 'the island bundle does not load the shop layout for the hint');
});

console.log(`mp-rooms-shop: ${n} checks passed`);
