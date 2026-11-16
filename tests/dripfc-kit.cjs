// Drip FC club kit in the Kit Shop (Nov 13 2026, lib/shop/dripKit.ts): the plain Drip FC items exist and cost island coins at the
// usual rates; club stickers survive the ball / boot / shirt codecs (old saves and old builds keep working); the long Kit (Cap.KitClub)
// round-trips, stays under its size cap, reaches only clients that understand it (everyone else gets the old short kit); remote
// players decode it; the "Sponsor" label is shown; nothing links anywhere. No browser, no network. usage: node tests/dripfc-kit.cjs
const assert = require('node:assert/strict'), path = require('node:path'), fs = require('node:fs'), vm = require('node:vm');
const { execFileSync } = require('node:child_process');
const ts = require('typescript'), T = require('three');
const { loadTs } = require('../multiplayer/dev-relay/loadTs.cjs');
const ROOT = path.join(__dirname, '..'), read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const P = loadTs(path.join(ROOT, 'multiplayer/protocol/index.ts'));
const { RoomCore } = loadTs(path.join(ROOT, 'multiplayer/relay/src/roomCore.ts'));
const { C, S, Cap, CAPS_ALL, CAPS_WORLD, KIT_LEN, KIT_CLUB_LEN, KIT_CLUB_MAX_BYTES, MAX_INBOUND_BYTES, PROTOCOL_VERSION } = P;
let n = 0; const t = (name, fn) => { try { const r = fn(); if (r && r.then) r.catch((e) => { console.error('FAIL', name); console.error(e); process.exit(1); }); n++; } catch (e) { console.error('FAIL', name); throw e; } };
const j = (a) => JSON.stringify(a), plain = (x) => JSON.parse(JSON.stringify(x) ?? "null"), deq = (a, b, m) => assert.deepEqual(plain(a), plain(b), m);

// TS loader: relative imports -> .ts; `src` lets a test load an OLD version of a file (from git) in the file's own folder.
const req = require('node:module').createRequire(ROOT + '/package.json');
function loader() {
  const cache = new Map();
  const load = (file, src) => {
    const key = src ? file + '#old' : file; if (cache.has(key)) return cache.get(key); const mod = { exports: {} }; cache.set(key, mod.exports);
    vm.runInNewContext(ts.transpileModule(src ?? fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText,
      { exports: mod.exports, module: mod, Math, Date, JSON, Number, Array, Object, Error, Map, Set, Promise, Float64Array, Float32Array, Uint8Array, Int16Array, Uint8ClampedArray, Symbol, console, process: { env: {} },
        TextEncoder, require: (id) => {
          if (id === 'three') return T;
          if (!id.startsWith('.')) return req(id);
          const base = path.resolve(path.dirname(file), id);
          return load(fs.existsSync(base + '.ts') ? base + '.ts' : path.join(base, 'index.ts'));
        } });
    cache.set(key, mod.exports); return mod.exports;
  };
  return load;
}
const load = loader(), L = (f) => load(path.join(ROOT, f));
const old = (f) => { let src; try { src = execFileSync('git', ['show', '828dcb09:' + f], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }); } catch { return null; } return load(path.join(ROOT, f), src); }; // the live build before this change (null outside git)
const D = L('lib/shop/dripKit.ts'), B = L('lib/shop/ball.ts'), BO = L('lib/shop/boots.ts'), J = L('lib/shop/jersey.ts');
const K = L('lib/multiplayer/kit.ts'), G = L('lib/shop/islandGear.ts'), SP = L('lib/shop/shopPurchases.ts'), SAFE = L('lib/site/safety.ts');
const { DEFAULT_HOME_KIT } = L('lib/graphics/beanLook.ts');

const ball = (decals, extra = {}) => B.validateBall({ ...B.cloneBall(B.DEFAULT_BALL), ...extra, decals });
const clubDecal = (ref, dir, i) => ({ id: 'c' + i, kind: 'club', ref, color: '#ffffff', dir, rot: .4, size: .25 });
const ang = (a, b) => Math.acos(Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]))) * 180 / Math.PI;
const jersey = J.validateJersey(J.PRESETS.find((p) => p.id === 'dripfc-home').design).design;
const bootPre = BO.PRESETS.find((p) => p.id === 'dripfc-home');
const boots = BO.validateBoots({ ...BO.DEFAULT_BOOTS, ...bootPre.design, decals: bootPre.decals });
const clubBall = ball([clubDecal('crest', [0, 0, 1], 0), clubDecal('wordmark', [1, .3, 0], 1), clubDecal('drop', [0, -.6, -1], 2), { id: 's', kind: 'sticker', ref: 'star', color: '#fff', dir: [0, 1, 0], rot: 0, size: .2 }]);
const gear = { jersey, boots, ball: clubBall, key: 'x' };

t('items: a Drip FC home shirt and Drip FC boots, coin prices at the usual rates, nothing random', () => {
  assert.ok(J.validateJersey(J.PRESETS.find((p) => p.id === 'dripfc-home').design).ok, 'the shirt preset validates');
  deq(jersey.club, { crest: 'chest', word: true });
  const jp = J.jerseyPrice(jersey), plainShirt = J.jerseyPrice({ ...jersey, club: undefined });
  assert.ok(Number.isInteger(jp) && jp >= 300 && jp === plainShirt, 'the club shirt costs what the same plain shirt costs');
  assert.equal(bootPre.club, true); assert.ok(BO.PRESETS.some((p) => p.design.model === bootPre.design.model && !p.club), 'a plain boot of the same model exists');
  assert.equal(boots.decals.filter((d) => d.kind === 'club').length, 2, 'the Drip FC logo on both sides');
  const bp = BO.bootPrice(boots), withStars = BO.bootPrice({ ...boots, decals: boots.decals.map((d) => ({ ...d, kind: 'sticker', ref: 'star' })) });
  assert.ok(Number.isInteger(bp) && bp > 0 && bp === withStars, 'club stickers cost what any sticker costs');
  const bl = B.ballPrice(clubBall), starsBall = B.ballPrice(ball(clubBall.decals.map((d) => ({ ...d, kind: 'sticker', ref: 'star' })))); assert.equal(bl, starsBall);
  assert.equal(BO.MODELS.some((m) => /trainer|casual|sneaker/i.test(m.label + m.blurb)), false, 'no casual shoes in the shop: no Drip FC trainers');
  for (const f of ['lib/shop/dripKit.ts', 'lib/shop/clubArt.ts']) assert.doesNotMatch(read(f), /Math\.random|real money|stripe|checkout/i, f + ': no randomness, no money');
  console.log(`  prices: shirt ${jp}, boots ${bp}, ball with 3 club stickers ${bl} coins`);
});

t('shop: bought only through the coin wallet (idempotent spend), never money', async () => {
  const mem = {}, store = { getItem: (k) => mem[k] ?? null, setItem: (k, v) => { mem[k] = v; } }, spent = [];
  const spend = async (id, cost, why) => { spent.push([id, cost, why]); return { ok: true }; };
  return SP.buyDesign('jersey', jersey, J.jerseyPrice(jersey), spend, { store }).then((r) => { assert.ok(r.ok); assert.equal(spent.length, 1); assert.match(spent[0][2], /^Kit Shop/); });
});

t('ball codec: club stickers validate, at most MAX_CLUB_BALL, unknown art dropped; an old save and an old build still load', () => {
  assert.equal(clubBall.decals.length, 4); deq(clubBall.decals.map((d) => d.kind), ['club', 'club', 'club', 'sticker']);
  const four = ball([0, 1, 2, 3].map((i) => clubDecal('crest', [i, 1, 0], i)));
  assert.equal(four.decals.length, D.MAX_CLUB_BALL, 'a fourth club sticker is dropped');
  assert.equal(ball([clubDecal('nike', [0, 0, 1], 0), { ...clubDecal('crest', [0, 0, 1], 1), kind: 'clubx' }]).decals.length, 0, 'unknown club art / kind dropped');
  const store = B.parseBallStore(j({ v: 2, current: clubBall, slots: [{ name: 'Club', design: clubBall, savedAt: 1 }, null, null], art: {}, bought: [] }));
  deq(plain(store.current), plain(clubBall), 'store round trip'); deq(plain(store.slots[0].design), plain(clubBall));
  const before = { v: 2, current: ball([{ id: 'a', kind: 'sticker', ref: 'star', color: '#fff', dir: [0, 0, 1], rot: 0, size: .2 }]), slots: [null, null, null], art: {}, bought: [] };
  assert.equal(j(B.parseBallStore(j(before)).current), j(before.current), 'an old save loads byte for byte');
  assert.equal(SP.purchaseId('ball', B.validateBall(before.current)), SP.purchaseId('ball', before.current), 'same purchase id');
  const OB = old('lib/shop/ball.ts');
  if (OB) { const o = OB.validateBall(plain(clubBall)); deq(o.decals.map((d) => d.kind), ['sticker'], 'an old build drops club stickers and keeps the rest'); }
});

t('boot + shirt codecs: club stickers and the club badge round-trip; old saves and old builds unchanged', () => {
  const again = BO.validateBoots(plain(boots)); deq(plain(again), plain(boots));
  assert.equal(BO.validateBoots({ ...boots, decals: [{ id: 'x', kind: 'club', ref: 'logo', zone: 'heel', x: 0, y: 0, size: 1, rot: 0 }] }).decals.length, 0);
  assert.equal(BO.bootClubBits(boots), D.BOOT_CLUB_SIDE); assert.equal(BO.bootClubBits({ decals: [{ kind: 'club', zone: 'heel' }] }), D.BOOT_CLUB_HEEL);
  const OBO = old('lib/shop/boots.ts'); if (OBO) assert.ok(OBO.validateBoots(plain(boots)).decals.every((d) => d.kind !== 'club'), 'an old build never shows a club sticker as a star');
  const sv = J.validateJersey(plain(jersey)); assert.ok(sv.ok); deq(plain(sv.design), plain(jersey));
  assert.equal(J.validateJersey({ ...jersey, club: { crest: 'hat', word: 'yes' } }).design.club, undefined, 'junk club block dropped');
  const plainJ = J.PRESETS[1].design; assert.equal(j(J.validateJersey(plainJ).design), j(J.validateJersey(J.validateJersey(plainJ).design).design));
  assert.ok(!('club' in J.validateJersey(plainJ).design), 'a shirt without club kit keeps its old JSON (and purchase id)');
});

t('kit codec: a club kit is KIT_CLUB_LEN long and valid; an ordinary kit is unchanged; stickers pack to ~3°', () => {
  const k = K.kitFromGear(gear);
  assert.equal(KIT_CLUB_LEN, 22); assert.equal(k.length, KIT_CLUB_LEN); assert.ok(P.isKit(k));
  assert.equal(k[17], 5, 'chest crest + wordmark'); assert.equal(k[18], 1, 'side marks');
  const plainKit = K.kitFromGear({ ...gear, jersey: { ...jersey, club: undefined }, boots: { ...boots, decals: [] }, ball: B.validateBall(B.DEFAULT_BALL) });
  assert.equal(plainKit.length, KIT_LEN, 'no club kit: the old 17 slots');
  deq(K.kitShort(k), k.slice(0, KIT_LEN)); deq(K.kitShort(k), K.kitFromGear({ ...gear, jersey: { ...jersey, club: undefined }, boots: { ...boots, decals: [] }, ball: B.validateBall({ ...clubBall, decals: [] }) }));
  for (const d of clubBall.decals.filter((x) => x.kind === 'club')) {
    const u = D.unpackBallClub(D.packBallClub(d.ref, d.dir, d.rot, d.size));
    assert.equal(u.ref, d.ref); assert.ok(ang(u.dir, d.dir) < 3.5, 'direction within 3.5°'); assert.ok(Math.abs(u.size - d.size) < .02); assert.ok(Math.abs(((u.rot - d.rot + 9 * Math.PI) % (2 * Math.PI)) - Math.PI) < .11);
  }
  for (const v of [-1, 0x1000000, 1.5, 3]) assert.equal(D.unpackBallClub(v), null, 'bad packed sticker ' + v);
});

t('remote decode: a friend sees the club crest, the boot marks and the ball stickers; old kits look as before', () => {
  const k = K.kitFromGear(gear), o = K.kitOutfit(DEFAULT_HOME_KIT, k);
  assert.equal(o.club, 1); assert.equal(o.bootClub, 1); assert.equal(o.shirt, jersey.primary);
  const fb = K.kitBall(k); deq(fb.decals.map((d) => d.ref), ['crest', 'wordmark', 'drop']);
  fb.decals.forEach((d, i) => assert.ok(ang(d.dir, clubBall.decals[i].dir.map((x, _, a) => x / Math.hypot(...a))) < 3.5));
  assert.notEqual(K.kitBallKey(k), K.kitBallKey(K.kitShort(k)), 'a club ball bakes its own skin');
  const s = K.kitShort(k), os = K.kitOutfit(DEFAULT_HOME_KIT, s);
  assert.equal(os.club, undefined); assert.equal(os.bootClub, undefined); assert.equal(K.kitBall(s).decals.length, 0);
  const g = G.gearOutfit(DEFAULT_HOME_KIT, gear); assert.equal(g.club, 1); assert.equal(g.bootClub, 1, 'my own island player shows them too');
  // the island / friend ball skin: the stamp is pure and lands on the sticker's side of the ball only
  const W = 64, H = 32, px = new Uint8ClampedArray(W * H * 4).fill(0), red = { data: new Uint8ClampedArray(16 * 16 * 4).map((_, i) => (i % 4 === 0 || i % 4 === 3 ? 255 : 0)), w: 16, h: 16 };
  G.stampDecalPixels(px, W, H, { dir: [0, 0, 1], rot: 0, size: .3 }, red);
  let hit = 0; for (let i = 0; i < W * H; i++) if (px[i * 4] > 200) hit++; assert.ok(hit > 4 && hit < W * H / 8, 'a small red patch, ' + hit + ' texels');
});

t('wire: size caps; strict validation of the five club slots', () => {
  const k = K.kitFromGear(gear), max = k.map((v, i) => (i === 5 ? 99 : i === 15 ? 9999 : i === 17 ? 7 : i === 18 ? 3 : i >= 19 ? 0xfffffe : i === 7 || i === 11 || i === 14 || i === 16 ? (i === 14 ? 3 : 63) : 0xffffff));
  assert.ok(P.isKit(max), 'the biggest long kit is valid'); assert.ok(j(max).length <= KIT_CLUB_MAX_BYTES); assert.ok(j([C.Kit, max]).length < MAX_INBOUND_BYTES / 2);
  const mut = (i, v) => { const c = k.slice(); c[i] = v; return c; };
  const bad = [k.slice(0, 18), [...k, 0], mut(17, 8), mut(18, 4), mut(19, 3) /* art 3 */, mut(20, -2), mut(21, 0x1000000), mut(19, 1.5)];
  { const c = k.slice(); for (let i = 7; i <= 16; i++) c[i] = -1; bad.push(c); } // ball stickers without a ball
  { const c = k.slice(); for (let i = 0; i <= 5; i++) c[i] = -1; bad.push(c); } // a club crest without a shirt
  for (const b of bad) { assert.equal(P.isKit(b), false, j(b)); assert.equal(P.parseClient(j([C.Kit, b])), null); }
  assert.ok(P.parseServer(j([S.Kit, 1, k])), 'S.Kit carries the long kit');
});

// ---- relay: a world with a new client, a new client and an old one (no Cap.KitClub) ----
let seed = 77;
const random = (k) => { const a = new Uint8Array(k); for (let i = 0; i < k; i++) { seed = (seed * 1103515245 + 12345) & 0x7fffffff; a[i] = (seed >> 8) & 255; } return a; };
const LOOK = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
function peer() { const p = { msgs: [], seq: 0, send(x) { p.msgs.push(JSON.parse(x)); }, close() {} }; p.of = (op) => p.msgs.filter((m) => m[0] === op); return p; }
function world() {
  const clock = { t: 1_000_000, now() { return this.t; } }, room = new RoomCore({ code: 'pub-1', createdAt: clock.t, clock, random, kind: 'world' }), peers = [];
  const send = (p, a) => room.message(p, j(a));
  const join = (caps) => { const p = peer(); room.connect(p, false, { ipKey: null, held: false }); send(p, [C.Hello, PROTOCOL_VERSION, LOOK, null, null]); p.id = p.of(S.Welcome)[0][2];
    const sc = p.of(S.Caps)[0]; send(p, [C.Caps, sc[1] & caps]); p.last = [0, 0, 0, 0, 0, 0, 0, 0]; send(p, [C.Pose, ++p.seq, ...p.last]); peers.push(p); return p; };
  const run = (ms) => { for (let e = 0; e < ms; e += 100) { clock.t += 100; if ((e / 100) % 2) room.halfTick(); else room.tick(); for (const p of peers) if (e % 1000 === 0) send(p, [C.Pose, ++p.seq, ...p.last]); } };
  return { room, join, send, run, clock };
}
t('relay: the long kit reaches Cap.KitClub members; an old client gets the short kit it understands; a party keeps the short one', () => {
  assert.equal(Cap.KitClub, 8192); assert.ok(CAPS_WORLD & Cap.KitClub); assert.equal(CAPS_ALL & Cap.KitClub, 0, 'a party is never offered it (CAPS_ALL stays 255)');
  const W = world(), a = W.join(CAPS_WORLD), b = W.join(CAPS_WORLD), o = W.join(CAPS_WORLD & ~Cap.KitClub); W.run(3000);
  const k = K.kitFromGear(gear); W.clock.t += 2000; W.send(a, [C.Kit, k]); W.run(500);
  const last = (p) => { const l = p.of(S.Kit).filter((m) => m[1] === a.id); return l[l.length - 1]; };
  deq(last(b), [S.Kit, a.id, k], 'a new client gets the Drip FC slots');
  deq(last(o), [S.Kit, a.id, k.slice(0, KIT_LEN)], 'an old client gets the old 17 slots');
  const OV = old('multiplayer/protocol/validate.ts'); if (OV) { assert.equal(OV.isKit(last(o)[2]), true, "the old client's own validator accepts it"); assert.equal(OV.isKit(k), false, 'and would have refused the long one'); }
  // a client without Cap.KitClub that sends a long kit anyway is cut to the short one
  W.clock.t += 2000; W.send(o, [C.Kit, k]); W.run(500); const fromOld = b.of(S.Kit).filter((m) => m[1] === o.id).pop(); assert.equal(fromOld[2].length, KIT_LEN);
  // a late joiner replays: long to new, short to old
  const c = W.join(CAPS_WORLD), d = W.join(CAPS_WORLD & ~Cap.KitClub); W.run(3000);
  const seen = (p) => p.of(S.Kit).filter((m) => m[1] === a.id).pop();
  assert.equal(seen(c)[2].length, KIT_CLUB_LEN); assert.equal(seen(d)[2].length, KIT_LEN);
  assert.equal([a, b, o, c, d].reduce((s, p) => s + p.of(S.Error).length, 0), 0, 'no errors');
});
t('client: the connection sends the short kit unless the relay offered Cap.KitClub', () => {
  const src = read('lib/multiplayer/connection.ts');
  assert.match(src, /const kit = kitForCaps\(myKit, caps\);/, 'flushKit cuts the kit to the agreed caps');
  assert.match(src, /caps = worldOn \? m\[1\] & CAPS_WORLD : \(m\[1\] & CAPS_ALL\) \| \(capsHi & CAPS_PARTY_HI\)/, 'caps = what the relay offered AND what this build knows (a party: S.Caps 255 + S.CapsHi)');
});

t('honesty: "Drip FC club kit" + "Sponsor" tag in every studio; no links, no buy pressure; the parents\' line', () => {
  assert.equal(D.CLUB_LABEL, 'Drip FC club kit'); assert.equal(D.SPONSOR_TAG, 'Sponsor');
  const label = read('components/shop/ClubLabel.tsx'); assert.match(label, /CLUB_LABEL/); assert.match(label, /SPONSOR_TAG/);
  for (const f of ['components/shop/BallStudio.tsx', 'components/shop/BootStudio.tsx', 'components/shop/JerseyStudio.tsx']) assert.match(read(f), /<Club(Note|Tag)\b/, f + ' shows the label');
  for (const f of ['components/shop/ClubLabel.tsx', 'lib/shop/dripKit.ts', 'lib/shop/clubArt.ts', 'lib/graphics/clubMark.ts']) {
    const s = read(f); assert.doesNotMatch(s, /href|https?:\/\/|window\.open|<a[\s>]|location\./, f + ': no links');
    assert.doesNotMatch(s, /buy now|limited|hurry|only today|don.t miss/i, f + ': no buy pressure');
  }
  for (const s of D.CLUB_STICKERS) assert.match(s.src, /^\/stadium\/dripfc\/[\w-]+\.webp$/, 'same-origin art');
  assert.match(SAFE.SPONSOR_KIT_LINE, /sponsor/i); assert.match(SAFE.SPONSOR_KIT_LINE, /game coins/); assert.match(SAFE.SPONSOR_KIT_LINE, /picks them/);
  assert.ok(SAFE.SAFE_FAQ.some((f) => f.a.includes(SAFE.SPONSOR_KIT_LINE)), 'in the parents\' FAQ');
  assert.ok(read('lib/site/learnFeatures.ts').includes(SAFE.SPONSOR_KIT_LINE), 'and on the learn hub FAQ');
});

t('heat: nothing per frame; the bean marks are one shared texture; the club pictures load only on demand', () => {
  const bean = read('lib/graphics/beanSkin.ts'); assert.match(bean, /beanClub:\{value:kind==='body'\|\|kind==='limbs'\?clubMarkTexture\(\):null\}/);
  assert.match(read('lib/graphics/clubMark.ts'), /if\(asked\|\|typeof document==='undefined'\)return;asked=true;/);
  assert.doesNotMatch(read('lib/shop/clubArt.ts'), /requestAnimationFrame|setInterval/);
  assert.match(read('lib/graphics/shopBallSkin.ts'), /layClub\(d,g,map/);
});

t('QA Nov 14: the preset tiles use the compact label (words over the tag), so it never breaks one word per line', () => {
  for (const f of ['components/shop/BootStudio.tsx', 'components/shop/JerseyStudio.tsx']) assert.match(read(f), /<ClubTag compact\/>/, f);
  const label = read('components/shop/ClubLabel.tsx'), css = read('components/shop/ClubLabel.module.css');
  assert.match(label, /<span className=\{styles\.text\}>\{CLUB_LABEL\}<\/span>/);
  assert.match(css, /\.compact\.compact\{display:flex;flex-direction:column[^}]*max-width:100%/);
  assert.match(css, /\.compact\.compact \.text\{white-space:normal;text-wrap:balance\}/);
});

// ---- Nov 15 2026: Drip FC art colours (lib/shop/dripKit.ts CLUB_PALETTE / clubCode) ----------------------------------------
t('colours: a curated palette, compact codes, defaults never written, junk dropped', () => {
  assert.ok(D.CLUB_PALETTE.length >= 10 && D.CLUB_PALETTE.length <= 15, 'about a dozen colours, indexes fit 4 bits');
  deq(D.CLUB_PALETTE.slice(0, 3).map((c) => c.hex), [D.CLUB_COLORS.blue, D.CLUB_COLORS.navy, D.CLUB_COLORS.white], 'the club three first');
  const bootHex = new Set(BO.PALETTE.map((p) => p.hex)); for (const c of D.CLUB_PALETTE.slice(3)) assert.ok(bootHex.has(c.hex), c.name + ' comes from the Boot Studio palette');
  deq(D.clubColorsOf(undefined), { art: D.CLUB_COLORS.white, bg: D.CLUB_COLORS.blue }, 'no code = white art on club blue');
  assert.equal(D.cleanClubCode(D.CLUB_DEFAULT_CODE), undefined, 'a sticker never stores the club pair');
  assert.equal(D.cleanClubCode(D.clubCode(3, 6)), D.clubCode(3, 6));
  for (const bad of [-1, 256, 1.5, '34', null, D.clubCode(13, 0), D.clubCode(0, D.CLUB_NO_BACKING)]) assert.equal(D.cleanClubCode(bad), undefined, String(bad));
  assert.equal(D.cleanClubCode(D.clubCode(1, D.CLUB_NO_BACKING), true), D.clubCode(1, D.CLUB_NO_BACKING), 'shirts may print without a backing');
  assert.equal(D.clubColorsOf(D.clubCode(1, D.CLUB_NO_BACKING)).bg, null);
});
t('colours: the ball, boot and shirt codecs keep a chosen pair and drop it on anything else', () => {
  const code = D.clubCode(3, 6);
  const b = ball([{ ...clubDecal('crest', [0, 0, 1], 0), cc: code }, { ...clubDecal('drop', [1, 0, 0], 1), cc: D.CLUB_DEFAULT_CODE }, { id: 's', kind: 'sticker', ref: 'star', color: '#fff', dir: [0, 1, 0], rot: 0, size: .2, cc: code }]);
  assert.equal(b.decals[0].cc, code); assert.equal('cc' in b.decals[1], false, 'the default is not stored'); assert.equal('cc' in b.decals[2], false, 'only club stickers carry colours');
  const bo = BO.validateBoots({ ...boots, decals: [{ ...boots.decals[0], cc: code }, { ...boots.decals[1], cc: 999 }] });
  assert.equal(bo.decals[0].cc, code); assert.equal('cc' in bo.decals[1], false);
  const jj = J.validateJersey({ ...jersey, club: { crest: 'chest', word: true, cc: D.clubCode(2, 4), wc: D.clubCode(1, D.CLUB_NO_BACKING) } }).design;
  deq(jj.club, { crest: 'chest', word: true, cc: D.clubCode(2, 4), wc: D.clubCode(1, D.CLUB_NO_BACKING) });
  deq(J.validateJersey({ ...jersey, club: { crest: null, word: true, cc: 5, wc: 'x' } }).design.club, { crest: null, word: true }, 'no crest, no crest colours');
  deq(jersey.club, { crest: 'chest', word: true }, 'the preset keeps its old JSON');
});
t('colours: recolouring an owned design is free (same purchase id) and the new colours are worn', async () => {
  const code = D.clubCode(4, 2), recol = ball(clubBall.decals.map((d, i) => (d.kind === 'club' && i === 0 ? { ...d, cc: code } : d)));
  assert.equal(SP.purchaseId('ball', recol), SP.purchaseId('ball', clubBall), 'colours are not part of the purchase id');
  assert.equal(SP.purchaseId('jersey', { ...jersey, club: { ...jersey.club, cc: 7 } }), SP.purchaseId('jersey', jersey));
  assert.equal(SP.purchaseId('ball', clubBall), 'shop:ball:' + SP.designHash(clubBall), 'designs without colours keep their old id');
  const mem = new Map(), store = { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v) };
  let spent = 0; const spend = async () => { spent++; return { ok: true }; };
  await SP.buyDesign('ball', clubBall, 120, spend, { store });
  const r = await SP.buyDesign('ball', recol, 120, spend, { store });
  assert.equal(spent, 1, 'no second charge'); assert.ok(r.ok && r.already);
  assert.equal(SP.loadOwned(store).items[0].design.decals[0].cc, code, 'the stored (worn) design has the new colours');
});
t('colours: contrast help (WCAG ratio), Best contrast is readable and keeps the club pair when it already reads', () => {
  assert.ok(Math.abs(D.clubContrast('#ffffff', '#000000') - 21) < .01);
  assert.ok(D.clubReadability(undefined, ['#f6f3ea']).ok, 'club pair on white boots reads');
  const royal = D.clubReadability(undefined, ['#2253d6']); assert.equal(royal.ok, false); assert.equal(royal.problem, 'item', 'blue sticker on royal boots: hard to see');
  assert.equal(D.clubReadability(D.clubCode(6, 2), ['#18191d']).problem, 'pair', 'lemon on white: the pair itself is weak');
  assert.equal(D.bestClubCode(['#f6f3ea']), D.CLUB_DEFAULT_CODE, 'keeps the club colours when they read');
  for (const under of [['#2253d6'], ['#1d5fd1'], ['#17295e'], ['#18191d', '#f7f4ec'], ['#ffe14a']]) {
    const best = D.bestClubCode(under); assert.ok(D.clubReadability(best, under).ok, 'best contrast reads on ' + under);
  }
  const pr = D.bestClubCode(['#1d5fd1'], true); assert.equal(pr >> 4, D.CLUB_NO_BACKING); assert.ok(D.clubReadability(pr, ['#1d5fd1']).ok, 'a printed crest picks a readable ink');
  assert.match(D.clubHint(royal, 'boot'), /boot/); assert.doesNotMatch(D.clubHint(royal, 'boot') + D.clubHint({ problem: 'pair' }, 'x'), /\d/, 'no numbers in the hint');
});
t('colours: the studios offer it (Club colours + Best contrast), new pieces start in club colours, a counter only', () => {
  const ui = read('components/shop/ClubColors.tsx');
  assert.match(ui, />Club colours</); assert.match(ui, />Best contrast</); assert.match(ui, /role="status"/); assert.match(ui, /countClubColor\(\)/);
  assert.doesNotMatch(ui, /type="color"|<a |href=/, 'curated palette only, no links');
  for (const f of ['components/shop/BootStudio.tsx', 'components/shop/BallStudio.tsx', 'components/shop/JerseyStudio.tsx']) assert.match(read(f), /<ClubColors /, f);
  assert.doesNotMatch(read('components/shop/BootStudio.tsx') + read('components/shop/BallStudio.tsx'), /bestClubCode/, 'nothing auto-switches a new placement (owner)');
  assert.match(read('lib/analytics/countIds.ts'), /\['club_color','Drip FC colours changed'\]/);
  assert.match(read('lib/analytics/shopEvents.ts'), /countClubColor=\(\)=>count\('sh:club_color'\)/);
});
// ---- Drip FC colours for friends (Nov 16 2026, Cap.KitClubColor, KIT_CLUB_COLOR_LEN = 29) ----
const { KIT_CLUB_COLOR_LEN, KIT_CLUB_COLOR_MAX_BYTES, CLUB_PALETTE_LEN, CLUB_NO_BACKING_IDX } = P;
// the relay deployed before this change (b631f5de: Cap.KitClub, 22 slots); its own file name so the loader cache keeps it apart from old()
const deployed = (f) => { let src; try { src = execFileSync('git', ['show', 'b631f5de:' + f], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }); } catch { return null; } return load(path.join(ROOT, f.replace(/\.ts$/, '.b631f5de.ts')), src); };
const RED_ON_LEMON = D.clubCode(4, 6), NAVY_PRINT = D.clubCode(1, D.CLUB_NO_BACKING), PINK_ON_BLACK = D.clubCode(11, 3), VOLT_ON_NAVY = D.clubCode(7, 1);
const colourGear = () => ({
  ...gear,
  jersey: { ...jersey, club: { ...jersey.club, cc: NAVY_PRINT, wc: RED_ON_LEMON } },
  boots: { ...boots, decals: boots.decals.map((d) => (d.kind === 'club' ? { ...d, cc: PINK_ON_BLACK } : d)) },
  ball: ball(clubBall.decals.map((d, i) => (d.kind === 'club' && i !== 1 ? { ...d, cc: VOLT_ON_NAVY } : d))),
});
t('colours: the protocol palette mirrors CLUB_PALETTE; Cap.KitClubColor is a world bit, never a party bit', () => {
  assert.equal(CLUB_PALETTE_LEN, D.CLUB_PALETTE.length, 'protocol CLUB_PALETTE_LEN = lib/shop/dripKit.ts CLUB_PALETTE.length');
  assert.equal(CLUB_NO_BACKING_IDX, D.CLUB_NO_BACKING);
  assert.equal(Cap.KitClubColor, 16384); assert.ok(CAPS_WORLD & Cap.KitClubColor); assert.equal(CAPS_ALL & Cap.KitClubColor, 0); assert.ok(Cap.KitClubColor <= P.CAPS_MAX);
  assert.equal(KIT_CLUB_COLOR_LEN, 29); assert.equal(KIT_CLUB_COLOR_MAX_BYTES, 330);
  for (let c = 0; c < 256; c++) { assert.equal(P.isClubCode(c, true), D.cleanClubCode(c, true) !== undefined, 'shirt code ' + c); assert.equal(P.isClubCode(c, false), (c & 15) < 12 && (c >> 4) < 12, 'sticker code ' + c); }
});
t('colours: kitFromGear packs one palette code per worn piece (29 slots); no colours keeps the 22 kit byte for byte', () => {
  const k = K.kitFromGear(colourGear());
  assert.equal(k.length, KIT_CLUB_COLOR_LEN); assert.ok(P.isKit(k)); deq(k.slice(0, KIT_CLUB_LEN), K.kitFromGear(gear), 'the first 22 slots are the club kit');
  deq(k.slice(22), [NAVY_PRINT, RED_ON_LEMON, PINK_ON_BLACK, -1, VOLT_ON_NAVY, -1, VOLT_ON_NAVY], 'crest, wordmark, side, heel (none), stickers');
  assert.equal(K.kitFromGear(gear).length, KIT_CLUB_LEN, 'club colours only: no colour slots');
  // a code on a piece that is not worn never travels (the shirt has no wordmark)
  const g2 = colourGear(); g2.jersey = { ...g2.jersey, club: { crest: 'chest', word: false, cc: NAVY_PRINT, wc: RED_ON_LEMON } };
  assert.equal(K.kitFromGear(g2)[23], -1);
});
t('colours: friends decode the codes (crest, boot side / heel, ball stickers); my own player shows them too', () => {
  const k = K.kitFromGear(colourGear()), o = K.kitOutfit(DEFAULT_HOME_KIT, k);
  assert.equal(o.clubCc, NAVY_PRINT); assert.equal(o.bootCc, PINK_ON_BLACK); assert.equal(o.heelCc, undefined);
  deq(K.kitBall(k).decals.map((d) => d.cc), [VOLT_ON_NAVY, undefined, VOLT_ON_NAVY], 'the ball stickers keep their colours (shopBallSkin tints them)');
  assert.notEqual(K.kitBallKey(k), K.kitBallKey(K.kitFromGear(gear)), 'a recoloured ball bakes its own skin');
  const o22 = K.kitOutfit(DEFAULT_HOME_KIT, K.kitFor(k, Cap.Kit | Cap.KitClub));
  assert.equal(o22.club, 1); assert.equal(o22.clubCc, undefined, 'cut to 22: club ink, as before');
  const mine = G.gearOutfit(DEFAULT_HOME_KIT, colourGear()); assert.equal(mine.clubCc, NAVY_PRINT); assert.equal(mine.bootCc, PINK_ON_BLACK);
  const heel = { ...boots, decals: [{ ...boots.decals.find((d) => d.kind === 'club'), id: 'h', zone: 'heel', cc: RED_ON_LEMON }] };
  deq(BO.bootClubCodes(heel), { heel: RED_ON_LEMON }); const kh = K.kitFromGear({ ...gear, boots: heel });
  assert.equal(kh[18], 2); assert.equal(kh[25], RED_ON_LEMON); assert.equal(K.kitOutfit(DEFAULT_HOME_KIT, kh).heelCc, RED_ON_LEMON);
  // the bean shaders get code+1 in a spare .w channel; anything off-palette is the club ink (0)
  const CM = L('lib/graphics/clubMark.ts');
  assert.equal(CM.clubCodeTexel(undefined), 0); assert.equal(CM.clubCodeTexel(NAVY_PRINT), NAVY_PRINT + 1); assert.equal(CM.clubCodeTexel(12), 0); assert.equal(CM.clubCodeTexel(-1), 0);
  assert.match(CM.CLUB_PALETTE_GLSL, new RegExp('BEAN_CLUB_PAL\\[' + D.CLUB_PALETTE.length + '\\]'));
  const sk = read('lib/graphics/beanSkin.ts'); assert.equal((sk.match(/beanClubInk\(/g) || []).length, 3, 'crest + side + heel tinted');
});
t('colours wire: strict validation of the seven colour slots; size cap', () => {
  const k = K.kitFromGear(colourGear()), mut = (i, v) => { const c = k.slice(); c[i] = v; return c; };
  const max = k.slice(); for (let i = 0; i < 22; i++) max[i] = (i === 5 ? 99 : i === 15 ? 9999 : i === 17 ? 7 : i === 18 ? 3 : i >= 19 ? 0xfffffe : i === 7 || i === 11 || i === 16 ? 63 : i === 14 ? 3 : 0xffffff);
  for (let i = 22; i < 29; i++) max[i] = i < 24 ? D.clubCode(11, 15) : D.clubCode(11, 11);
  assert.ok(P.isKit(max), 'the biggest colour kit is valid'); assert.ok(j(max).length <= KIT_CLUB_COLOR_MAX_BYTES, j(max).length + ' bytes'); assert.ok(j([C.Kit, max]).length < MAX_INBOUND_BYTES / 2);
  const allNone = k.slice(); for (let i = 22; i < 29; i++) allNone[i] = -1;
  const bad = [
    k.slice(0, 28), [...k, -1], allNone /* no colour: must travel as 22 */,
    mut(22, 12) /* art off-palette */, mut(22, 0xc0) /* backing 12 */, mut(22, 256), mut(22, -2), mut(22, 1.5), mut(22, '2'), mut(22, null),
    mut(24, D.clubCode(2, 15)) /* boots never print without backing */, mut(26, D.clubCode(3, 15)),
    mut(25, RED_ON_LEMON) /* no heel mark worn */, null,
  ];
  bad.pop(); bad.push(mut(27, D.clubCode(3, 3)).map((v, i) => (i === 20 ? -1 : v))); // sticker 20 absent but coloured
  bad.push(mut(17, 4)); // crest code but no crest on the shirt (wordmark only)
  bad.push(mut(21, -1)); // a colour for an absent ball sticker
  bad.push(mut(17, 1)); // a wordmark colour without a wordmark
  for (const b of bad) { assert.equal(P.isKit(b), false, j(b)); assert.equal(P.parseClient(j([C.Kit, b])), null, j(b)); }
  for (const good of [mut(23, -1), mut(22, D.clubCode(0, 0)), mut(24, D.clubCode(11, 11))]) assert.ok(P.isKit(good), j(good));
  assert.ok(P.parseServer(j([S.Kit, 1, k])), 'S.Kit carries the colour kit');
  // every cut of a valid colour kit is valid
  deq(P.kitForCaps(k, CAPS_WORLD), k); deq(P.kitForCaps(k, CAPS_WORLD & ~Cap.KitClubColor), k.slice(0, 22)); deq(P.kitForCaps(k, Cap.Kit), k.slice(0, 17));
  deq(P.kitForCaps(k, Cap.Kit | Cap.KitClubColor), k.slice(0, 17), 'KitClubColor without KitClub: the short kit'); assert.equal(P.kitForCaps(null, CAPS_WORLD), null);
  for (const c of [k.slice(0, 22), k.slice(0, 17)]) assert.ok(P.isKit(c));
});
t('colours relay: 29 slots to Cap.KitClubColor members, 22 to Cap.KitClub members, 17 to the rest; replays and senders are cut too', () => {
  const W = world(), a = W.join(CAPS_WORLD), b = W.join(CAPS_WORLD), m = W.join(CAPS_WORLD & ~Cap.KitClubColor), o = W.join(CAPS_WORLD & ~Cap.KitClub & ~Cap.KitClubColor); W.run(3000);
  const k = K.kitFromGear(colourGear()); W.clock.t += 2000; W.send(a, [C.Kit, k]); W.run(500);
  const last = (p, from = a) => p.of(S.Kit).filter((x) => x[1] === from.id).pop();
  deq(last(b), [S.Kit, a.id, k]); deq(last(m), [S.Kit, a.id, k.slice(0, KIT_CLUB_LEN)]); deq(last(o), [S.Kit, a.id, k.slice(0, KIT_LEN)]);
  const OV = deployed('multiplayer/protocol/validate.ts'); if (OV) { assert.equal(OV.isKit(last(m)[2]), true, 'a Nov 13 client accepts its 22'); assert.equal(OV.isKit(k), false, 'and would refuse 29'); }
  // a Nov 13 client (no Cap.KitClubColor) that sends 29 anyway is cut to 22 for everyone
  W.clock.t += 2000; W.send(m, [C.Kit, k]); W.run(500); assert.equal(last(b, m)[2].length, KIT_CLUB_LEN);
  // late joiners replay at their own length
  const c = W.join(CAPS_WORLD), d = W.join(CAPS_WORLD & ~Cap.KitClubColor), e = W.join(Cap.Kit); W.run(3000);
  assert.equal(last(c)[2].length, 29); assert.equal(last(d)[2].length, 22); assert.equal(last(e)[2].length, 17);
  // a colour change alone reaches 29-members; 22 / 17 members get an S.Kit with the same body (harmless, latest wins)
  const k2 = k.slice(); k2[22] = D.clubCode(5, 15); W.clock.t += 2000; W.send(a, [C.Kit, k2]); W.run(500); deq(last(b)[2], k2);
  assert.equal([a, b, m, o, c, d, e].reduce((s, p) => s + p.of(S.Error).length, 0), 0, 'no errors');
});
t('colours compat: a new client on an old relay (no Cap.KitClubColor in S.Caps) sends at most 22 slots, which the old relay accepts', () => {
  const OV = deployed('multiplayer/protocol/validate.ts');
  const k = K.kitFromGear(colourGear()), OLD_RELAY_WORLD = CAPS_WORLD & ~Cap.KitClubColor;
  const sent = P.kitForCaps(k, OLD_RELAY_WORLD & CAPS_WORLD); assert.equal(sent.length, KIT_CLUB_LEN);
  if (OV) { assert.equal(OV.isKit(sent), true, 'the deployed relay accepts it'); assert.equal(OV.isKit(k), false, 'it would have refused 29 (never sent)'); assert.equal(OV.isKit(P.kitForCaps(k, CAPS_ALL)), true, 'party: 17'); }
});

Promise.resolve().then(() => console.log(`dripfc-kit: ${n} checks passed`));
