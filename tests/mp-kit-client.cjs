// Friends see each other's Kit Shop gear (relay v1.7, Cap.Kit, Oct 26 2026), client side: the gear <-> Kit mapping (lib/multiplayer/kit.ts
// mirrors lib/shop/islandGear.ts gearOutfit), the connection (C.Kit only on a v1.7 relay, after S.Caps and on a change, at most one per
// KIT_GAP_MS, latest wins, a page that never sets a kit sends nothing), and the remote avatars (outfit slots, at most 2 ball skins,
// evicted skins disposed, no bake while drawing). No network, no browser. usage: node tests/mp-kit-client.cjs
const assert = require('node:assert/strict'), path = require('node:path'), fs = require('node:fs'), vm = require('node:vm');
const ts = require('typescript'), T = require('three');
const { loadTs } = require('../multiplayer/dev-relay/loadTs.cjs');
const ROOT = path.join(__dirname, '..'), read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const P = loadTs(path.join(ROOT, 'multiplayer/protocol/index.ts'));
const { C, S, Cap, CAPS_ALL, KIT_GAP_MS } = P;
let n = 0; const t = (name, fn) => { try { fn(); n++; } catch (e) { console.error('FAIL', name); throw e; } };
const j = (a) => JSON.stringify(a), plain = (x) => JSON.parse(JSON.stringify(x)), same = (a, b, m) => assert.deepEqual(plain(a), plain(b), m);

// TS loader (relative imports -> .ts; `over` replaces a module by its base name).
const env = { NEXT_PUBLIC_MULTIPLAYER: '1', NEXT_PUBLIC_MULTIPLAYER_URL: 'http://localhost:8790/' };
const req = require('node:module').createRequire(ROOT + '/package.json');
function loader(over = {}) {
  const cache = new Map();
  const load = (file) => {
    if (cache.has(file)) return cache.get(file); const mod = { exports: {} }; cache.set(file, mod.exports);
    vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText,
      { exports: mod.exports, module: mod, Math, Date, JSON, Number, Array, Object, Error, Map, Set, Promise, Float64Array, Float32Array, Uint8Array, Int16Array, Uint8ClampedArray, Symbol, console, process: { env }, performance: { now: () => 0 },
        document: { createElement: () => ({ getContext: () => null, width: 0, height: 0 }) },
        require: (id) => {
          if (id === 'three') return T;
          if (!id.startsWith('.')) return req(id);
          const base = path.resolve(path.dirname(file), id), key = path.basename(base);
          if (over[key]) return over[key];
          return load(fs.existsSync(base + '.ts') ? base + '.ts' : path.join(base, 'index.ts'));
        } });
    cache.set(file, mod.exports); return mod.exports;
  };
  return load;
}
const load = loader();
const K = load(path.join(ROOT, 'lib/multiplayer/kit.ts'));
const G = load(path.join(ROOT, 'lib/shop/islandGear.ts'));
const { DEFAULT_JERSEY } = load(path.join(ROOT, 'lib/shop/jersey.ts'));
const { DEFAULT_BALL, LAYOUTS, PATTERNS, FINISHES, validateBall } = load(path.join(ROOT, 'lib/shop/ball.ts'));
const { validateBoots } = load(path.join(ROOT, 'lib/shop/boots.ts'));
const { DEFAULT_HOME_KIT } = load(path.join(ROOT, 'lib/graphics/beanLook.ts'));

const jersey = { ...DEFAULT_JERSEY, primary: '#d62828', secondary: '#ffffff', accent: '#003049', number: 7 };
const boots = validateBoots({}); boots.colors = { ...boots.colors, mid: '#ff00aa' };
const ball = validateBall({ ...DEFAULT_BALL, layout: 'panel26', colors: { a: '#112233', b: '#ffee00', c: '#00ff00' },
  pattern: { kind: 'stars', c1: '#ffffff', c2: '#000000', on: 'b', seed: 42 }, finish: 'holo', art: { id: '', fills: [] } });
const gear = { jersey, boots, ball, key: 'j|b|l' };
const base = { ...DEFAULT_HOME_KIT, kind: 'casual', number: 10 };

t('kit.ts: gear -> Kit -> outfit equals the island\'s own gearOutfit (what I see is what friends see)', () => {
  const kit = K.kitFromGear(gear);
  assert.ok(P.isKit(kit), j(kit)); assert.equal(kit.length, P.KIT_LEN);
  same(K.kitOutfit(base, kit), G.gearOutfit(base, gear));
  const onlyJersey = { ...gear, boots: null, ball: null }, k2 = K.kitFromGear(onlyJersey);
  same(K.kitOutfit(base, k2), G.gearOutfit(base, onlyJersey)); assert.equal(K.kitBallKey(k2), '');
  const onlyBoots = { jersey: null, boots, ball: null, key: 'b' };
  same(K.kitOutfit(base, K.kitFromGear(onlyBoots)), G.gearOutfit(base, onlyBoots));
  const training = { ...gear, jersey: { ...jersey, number: null } };
  assert.equal(K.kitOutfit(base, K.kitFromGear(training)).number, null, 'no number = a training shirt');
});

t('kit.ts: nothing worn = null and the same base outfit object (no allocation)', () => {
  assert.equal(K.kitFromGear(G.NO_GEAR), null); assert.equal(K.kitFromGear(null), null);
  assert.equal(K.kitOutfit(base, null), base); assert.equal(K.kitKey(null), ''); assert.equal(K.kitBall(null), null);
});

t('kit.ts: the ball travels as its design only (layout, colours, pattern, finish), never the drawing / fills / decals', () => {
  const withArt = { ...gear, ball: { ...ball, art: { id: 'abcdefgh', fills: ['#ff0000'] }, decals: [{ id: 'x' }] } };
  const kit = K.kitFromGear(withArt), d = K.kitBall(kit);
  assert.equal(d.layout, 'panel26'); same(d.colors, ball.colors); assert.equal(d.finish, 'holo');
  same(d.pattern, { kind: 'stars', c1: '#ffffff', c2: '#000000', on: 'b', seed: 42 });
  same(d.art, { id: '', fills: [] }); assert.equal(d.decals.length, 0);
  assert.ok(j(kit).length <= P.KIT_MAX_BYTES);
  assert.equal(K.kitBallKey(kit), kit.slice(7).join(','));
  // indexes are the shop's own list order (a new shop option needs no relay deploy: the wire allows 0..63, unknown -> default)
  assert.equal(kit[7], LAYOUTS.findIndex((l) => l.id === 'panel26')); assert.equal(kit[11], PATTERNS.findIndex((p) => p.id === 'stars'));
  assert.equal(kit[16], FINISHES.findIndex((f) => f.id === 'holo'));
  const future = kit.slice(); future[7] = 60; future[11] = 61; future[16] = 62;
  const fd = K.kitBall(future); assert.equal(fd.layout, DEFAULT_BALL.layout); assert.equal(fd.pattern.kind, 'none'); assert.equal(fd.finish, DEFAULT_BALL.finish);
});

// ---- connection ----
const conn = load(path.join(ROOT, 'lib/multiplayer/connection.ts'));
function makeEnv() {
  const clk = { now: 1e6 }; let seq = 0; const timers = [], sockets = [];
  class WS { constructor(url) { this.url = url; this.readyState = 0; this.sent = []; sockets.push(this); } send(x) { this.sent.push(x); } close() { this.readyState = 3; }
    open() { this.readyState = 1; this.onopen && this.onopen(); } recv(m) { this.onmessage && this.onmessage({ data: j(m) }); } }
  const m = new Map();
  const c = conn.createPartyConnection({ WebSocketImpl: WS, now: () => clk.now, random: () => 0.5,
    setTimeout: (fn, ms) => { const h = { id: ++seq, at: clk.now + ms, fn }; timers.push(h); return h.id; },
    clearTimeout: (id) => { const i = timers.findIndex((x) => x.id === id); if (i >= 0) timers.splice(i, 1); },
    visibility: { hidden: () => false, on: () => () => {} }, storage: { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v), removeItem: (k) => m.delete(k) } });
  const last = () => sockets[sockets.length - 1];
  const kitsSent = (s) => s.sent.map((x) => JSON.parse(x)).filter((x) => x[0] === C.Kit);
  return { c, clk, last, kitsSent };
}
const LOOK = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const welcome = () => [20, 1, 1, 'tok-abcdefghij012345', Date.now() + 7200000, Date.now() + 14400000, 0, [[1, [2, 0], LOOK, 1, null, 'Leo']]];
const POSE = [100, 20, 100, 0, 0, 13, 0, 0];
const KIT = K.kitFromGear(gear), KIT2 = K.kitFromGear({ ...gear, ball: null });

t('client: an OLD relay (no S.Caps, or S.Caps without Cap.Kit) never gets C.Kit: friends simply see no kit', () => {
  for (const caps of [null, 63]) {
    const e = makeEnv(); e.c.setKit(KIT); e.c.join('K7MQ4R', { look: LOOK, nick: 'Leo' }); const s = e.last(); s.open(); s.recv(welcome());
    if (caps !== null) s.recv([S.Caps, caps]);
    e.clk.now += 60_000; e.c.sendPose(POSE.slice(), e.clk.now); e.c.setKit(KIT2); e.clk.now += 60_000; e.c.sendPose(POSE.slice(), e.clk.now);
    assert.equal(e.kitsSent(s).length, 0, 'caps ' + caps); assert.equal(e.c.status, 'live');
    const got = []; e.c.onMessage((m) => got.push(m)); s.recv([S.Kit, 1, KIT]); assert.equal(got.length, 1, 'an S.Kit still parses (from a mixed relay)');
  }
});

t('client: v1.7 relay: my kit goes out right after S.Caps, valid for the relay; a resume / reconnect sends it again', () => {
  const e = makeEnv(); e.c.setKit(KIT); e.c.join('K7MQ4R', { look: LOOK, nick: 'Leo' }); const s = e.last(); s.open(); s.recv(welcome());
  assert.equal(e.kitsSent(s).length, 0, 'nothing before S.Caps'); s.recv([S.Caps, CAPS_ALL]);
  same(e.kitsSent(s), [[C.Kit, KIT]]); assert.ok(P.parseClient(s.sent.find((x) => JSON.parse(x)[0] === C.Kit)));
  const caps = s.sent.map((x) => JSON.parse(x)).find((x) => x[0] === C.Caps); assert.ok(caps[1] & Cap.Kit, 'C.Caps answers with Cap.Kit');
  s.recv(welcome()); s.recv([S.Caps, CAPS_ALL]); assert.equal(e.kitsSent(s).length, 2, 'a new Welcome + S.Caps: sent again (the relay dedupes)');
});

t('client: a change is sent at once, a quicker second change waits KIT_GAP_MS and the LATEST goes (via sendPose or the beat)', () => {
  const e = makeEnv(); e.c.setKit(null); e.c.join('K7MQ4R', { look: LOOK, nick: 'Leo' }); const s = e.last(); s.open(); s.recv(welcome()); s.recv([S.Caps, CAPS_ALL]);
  same(e.kitsSent(s), [[C.Kit, null]], 'the island says "nothing worn" once (clears an old slot kit)');
  e.clk.now += KIT_GAP_MS; e.c.setKit(KIT); assert.equal(e.kitsSent(s).length, 2);
  e.clk.now += 100; e.c.setKit(KIT2); e.c.setKit(null); e.c.setKit(KIT2); e.c.sendPose(POSE.slice(), e.clk.now);
  assert.equal(e.kitsSent(s).length, 2, 'held inside the gap');
  e.c.setKit(KIT2); assert.equal(e.kitsSent(s).length, 2, 'same kit again: nothing new');
  e.clk.now += KIT_GAP_MS; e.c.sendPose(POSE.slice(), e.clk.now);
  same(e.kitsSent(s).slice(2), [[C.Kit, KIT2]], 'only the latest');
  e.clk.now += 60_000; e.c.sendPose(POSE.slice(), e.clk.now); assert.equal(e.kitsSent(s).length, 3, 'never repeated');
});

t('client: a page that never sets a kit (a room page) sends nothing, so the relay keeps the slot\'s kit', () => {
  const e = makeEnv(); e.c.join('K7MQ4R', { look: LOOK, nick: 'Leo' }); const s = e.last(); s.open(); s.recv(welcome()); s.recv([S.Caps, CAPS_ALL]);
  e.clk.now += 60_000; e.c.sendPose(POSE.slice(), e.clk.now); assert.equal(e.kitsSent(s).length, 0);
});

// ---- remote avatars ----
function avatarHarness() {
  const st = { looks: new Map(), baked: [], disposedMats: 0 };
  const shopBallSkin = { friendBallMaterial: (d, key) => { st.baked.push(key); const m = new T.MeshStandardMaterial(); m.map = new T.Texture(); const md = m.dispose.bind(m); m.dispose = () => { st.disposedMats++; md(); }; m.userData.key = key; return m; } };
  const over = {
    player: { createPlayer: (name) => ({ root: new T.Group(), setAppearance() {}, setBeanLook(look, outfit) { st.looks.set(name, outfit); }, setExpression() {}, update() {}, dispose() {} }) },
    playerBatch: { playerBatch: () => ({ begin() {}, draw() {}, end() {}, dispose() {} }) },
    heatTier: { effectiveTier: () => 0, batterySaverOn: () => false },
    customization: { beanLookFor: () => ({}), playerOutfit: () => base },
    look: { wireToLook: (l) => l }, shopBallSkin,
  };
  const mod = loader(over)(path.join(ROOT, 'lib/graphics/remoteAvatars.ts'));
  const scene = new T.Scene(), camera = new T.PerspectiveCamera(60, 1, 0.1, 500); camera.position.set(0, 5, 10); camera.lookAt(0, 0, 0); camera.updateMatrixWorld();
  const avatars = mod.createRemoteAvatars(scene, { phone: true, maxFor: () => 5 });
  return { st, avatars, camera, mod, scene };
}
const tick = () => new Promise((r) => setImmediate(r));

(async () => {
  {
    const h = avatarHarness(), { avatars, st, camera } = h;
    const kit = (c) => { const k = KIT.slice(); k[8] = c; return k; };
    for (const id of [1, 2, 3]) avatars.upsert(id, LOOK, 'F' + id, { hex: '#ff0000' });
    const poses = new Map([1, 2, 3].map((id) => [id, { x: id - 2, y: 0, z: -2, yaw: 0, speed: 0, mode: 13, zone: 0, fade: 1 }]));
    const balls = new Map([1, 2, 3].map((id) => [id, { state: 3, x: id - 2, y: 0.19, z: -1 }]));
    avatars.update(0.016, poses, camera, false, null, balls);
    t('avatars: a kit dresses the friend through the outfit slots (shirt, trim, shorts, socks, number, boots)', () => {
      avatars.setKit(1, KIT);
      const o = st.looks.get('remote-1'); assert.equal(o.shirt, '#d62828'); assert.equal(o.shorts, '#003049'); assert.equal(o.number, 7); assert.equal(o.boots, '#ff00aa');
      avatars.setKit(1, null); assert.equal(st.looks.get('remote-1'), base, 'taken off: back to their own outfit');
    });
    avatars.setKit(1, kit(1)); avatars.setKit(2, kit(2)); avatars.setKit(2, kit(2)); await tick();
    t('avatars: one skin per ball design, baked on the S.Kit (an unchanged kit bakes nothing)', () => {
      assert.equal(st.baked.length, 2); assert.equal(avatars.kitSkins, 2);
    });
    t('avatars: drawing puts each friend\'s skin on their ball mesh without baking', () => {
      avatars.update(0.016, poses, camera, false, null, balls);
      const shown = h.scene.getObjectsByProperty('name', 'remote-ball').filter((m) => m.visible);
      assert.equal(shown.length, 3); const skinned = shown.filter((m) => m.material.name !== 'classic-ball');
      assert.equal(skinned.length, 2, 'friends 1 and 2 skinned, friend 3 (no kit) classic'); assert.equal(st.baked.length, 2);
      assert.ok(skinned.every((m) => m.geometry.attributes.uv), 'the skin sphere has UVs');
    });
    avatars.setKit(3, kit(3)); await tick();
    t('avatars: a third design evicts the least recently drawn skin and disposes it (max 2 alive)', () => {
      assert.equal(avatars.kitSkins, 2); assert.equal(st.baked.length, 3); assert.equal(st.disposedMats, 1);
      avatars.update(0.016, poses, camera, false, null, balls);
      const shown = h.scene.getObjectsByProperty('name', 'remote-ball').filter((m) => m.visible);
      assert.equal(shown.filter((m) => m.material.name !== 'classic-ball').length, 2, 'the evicted friend falls back to the classic ball');
      assert.ok(shown.every((m) => m.material.userData.key === undefined || m.material.map), 'no disposed skin left on a mesh');
    });
    t('avatars: dispose frees every skin', () => { avatars.dispose(); assert.equal(st.disposedMats, 3); assert.equal(avatars.kitSkins, 0); });
  }

  t('wiring: friend core applies S.Kit; Town sends the worn gear; drawBalls never bakes', () => {
    const rp = read('lib/multiplayer/roomParty.ts'), town = read('components/Town.tsx'), ra = read('lib/graphics/remoteAvatars.ts');
    assert.match(rp, /m\[0\] === S\.Kit/); assert.match(rp, /avatars\.setKit\(m\.id, kits\.get\(m\.id\) \?\? null\)/);
    assert.match(town, /partyConnection\(\)\.setKit\(kitFromGear\(gearRef\.current\)\)/);
    const draw = ra.slice(ra.indexOf('function drawBalls'), ra.indexOf('function addLocalRing'));
    assert.ok(!/new T\.|wantSkin|friendBallMaterial|import\(/.test(draw), 'drawBalls allocates / bakes nothing');
    assert.match(ra, /export const KIT_SKINS=2/); assert.match(ra, /import\('\.\/shopBallSkin'\)/, 'the baker loads on demand');
    assert.ok(!/localStorage|fi2-shop-owned/.test(read('lib/multiplayer/kit.ts')), 'kit.ts reads no storage');
  });

  console.log(`mp-kit-client: ${n} checks passed`);
})().catch((e) => { console.error(e); process.exit(1); });
