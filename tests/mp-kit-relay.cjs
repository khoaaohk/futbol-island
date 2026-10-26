// Friends see each other's Kit Shop gear (relay v1.7, Cap.Kit, Oct 26 2026): the Kit wire shape + strict validation + size cap, the
// relay (kept per slot, forwarded only to Cap.Kit members, deduped, rate limited with latest-wins, replayed after C.Caps, kept in the
// hibernation attachment), and backward compatibility both ways (old clients never see S.Kit; the roster / Welcome shape is unchanged).
// No network. usage: node tests/mp-kit-relay.cjs
const assert = require('node:assert/strict'), path = require('node:path');
const { loadTs } = require('../multiplayer/dev-relay/loadTs.cjs');
const ROOT = path.join(__dirname, '..');
const P = loadTs(path.join(ROOT, 'multiplayer/protocol/index.ts'));
const { RoomCore } = loadTs(path.join(ROOT, 'multiplayer/relay/src/roomCore.ts'));
const { C, S, Cap, CAPS_ALL, KIT_LEN, KIT_MAX_BYTES, KIT_RATE, KIT_GAP_MS, MAX_INBOUND_BYTES, PROTOCOL_VERSION } = P;
let n = 0; const t = (name, fn) => { try { fn(); n++; } catch (e) { console.error('FAIL', name); throw e; } };
const j = (a) => JSON.stringify(a);
const OLD_CAPS = 63; // a v1.6 client / relay

// shirt, trim, shorts, socks, sock tops, number, boots, ball layout, a, b, c, pattern, c1, c2, on, seed, finish
const FULL = [0xd62828, 0xffffff, 0x003049, 0xd62828, 0x003049, 7, 0xff00aa, 0, 0x112233, 0xffee00, 0x00ff00, 3, 0xffffff, 0x000000, 0, 42, 1];
const JERSEY = [0x2ec4d6, 0xf7f3ea, 0x1b2a4a, 0x2ec4d6, 0x1b2a4a, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1];
const BOOTS = [-1, -1, -1, -1, -1, -1, 0x123456, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1];

t('protocol: Cap.Kit = 64, CAPS_ALL 127, C.Kit 18 / S.Kit 39, KIT_LEN 17, rate + gap agree', () => {
  assert.equal(Cap.Kit, 64); assert.equal(CAPS_ALL, 127); assert.equal(C.Kit, 18); assert.equal(S.Kit, 39); assert.equal(KIT_LEN, 17);
  assert.equal(FULL.length, KIT_LEN); assert.ok(1000 / KIT_RATE[0] <= KIT_GAP_MS, 'the client gap never outruns the relay bucket');
  assert.ok(P.parseClient(j([C.Caps, CAPS_ALL])) && P.parseServer(j([S.Caps, CAPS_ALL])), 'the 7-bit caps still fit the 0..255 caps check');
});

t('protocol: valid kits parse (full, jersey only, boots only, none = null), both directions', () => {
  for (const k of [FULL, JERSEY, BOOTS, null]) {
    assert.deepEqual(P.parseClient(j([C.Kit, k])), [C.Kit, k], j(k));
    assert.deepEqual(P.parseServer(j([S.Kit, 3, k])), [S.Kit, 3, k], j(k));
  }
  const max = FULL.map((v, i) => (i === 5 ? 99 : i === 14 ? 3 : i === 15 ? 9999 : [7, 11, 16].includes(i) ? 63 : 0xffffff));
  assert.ok(P.isKit(max)); assert.ok(j(max).length <= KIT_MAX_BYTES, 'the biggest kit fits KIT_MAX_BYTES');
  assert.ok(j([C.Kit, max]).length < MAX_INBOUND_BYTES / 2, 'a C.Kit frame is far under the 512 B inbound cap');
  assert.ok(P.isKit(FULL.map((v, i) => (i === 5 ? -1 : v))), 'a training shirt (no number)');
});

t('protocol: strict validation refuses every malformed kit', () => {
  const bad = [];
  const mut = (i, v) => { const k = FULL.slice(); k[i] = v; return k; };
  bad.push(FULL.slice(0, 16), [...FULL, 0], 'kit', {}, [], new Array(17).fill(-1) /* nothing worn must be null */);
  bad.push(mut(0, 0x1000000), mut(1, -1) /* half a jersey */, mut(2, 1.5), mut(3, '0'), mut(5, 100), mut(5, -2), mut(6, -5));
  bad.push(mut(7, 64), mut(8, -1) /* half a ball */, mut(11, 64), mut(14, 4), mut(15, 10000), mut(16, -1), mut(12, null), mut(9, true));
  { const k = JERSEY.slice(); k[5] = 7; k[0] = -1; k[1] = k[2] = k[3] = k[4] = -1; bad.push(k); } // a number without a jersey
  { const k = BOOTS.slice(); k[9] = 0; bad.push(k); } // ball colours without a ball
  for (const k of bad) {
    assert.equal(P.isKit(k), false, j(k));
    assert.equal(P.parseClient(j([C.Kit, k])), null, 'C.Kit ' + j(k));
    assert.equal(P.parseServer(j([S.Kit, 1, k])), null, 'S.Kit ' + j(k));
  }
  assert.equal(P.parseClient(j([C.Kit])), null); assert.equal(P.parseClient(j([C.Kit, null, 1])), null);
  assert.equal(P.parseServer(j([S.Kit, 32, null])), null, 'member id range'); assert.equal(P.parseServer(j([S.Kit, 1])), null);
});

// ---- relay ----
let seed = 4242;
const random = (k) => { const a = new Uint8Array(k); for (let i = 0; i < k; i++) { seed = (seed * 1103515245 + 12345) & 0x7fffffff; a[i] = (seed >> 8) & 255; } return a; };
const LOOK = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
function peer() { const p = { msgs: [], closed: null, send(x) { p.msgs.push(JSON.parse(x)); }, close(c) { p.closed = c; } }; p.of = (op) => p.msgs.filter((m) => m[0] === op); return p; }
function party(caps) {
  const clock = { t: 7_000_000, now() { return this.t; } };
  const room = new RoomCore({ code: 'K7MQ4R', createdAt: clock.t, clock, random });
  const names = ['Emma', 'Leo', 'Ayako', 'Sam'], ps = [];
  const join = (i, c) => {
    const p = peer(); room.connect(p); room.message(p, j([C.Hello, PROTOCOL_VERSION, LOOK, null, i === 0 ? room.hostKey : null, null, names[i]]));
    p.id = p.of(S.Welcome)[0][2]; if (c) room.message(p, j([C.Caps, c])); ps.push(p); return p;
  };
  caps.forEach((c, i) => join(i, c));
  const clear = () => ps.forEach((p) => { p.msgs.length = 0; });
  return { room, clock, ps, join, clear, msg: (p, m) => { clock.t += 50; room.message(p, j(m)); } };
}
const kits = (p) => p.of(S.Kit);

t('relay: a C.Kit reaches every OTHER Cap.Kit member as S.Kit; an old client (no Cap.Kit) never sees one', () => {
  const { ps: [a, b, old], clear, msg } = party([CAPS_ALL, CAPS_ALL, OLD_CAPS]); clear();
  msg(a, [C.Kit, FULL]);
  assert.deepEqual(kits(b), [[S.Kit, a.id, FULL]]);
  assert.equal(kits(a).length, 0, 'not echoed to the sender'); assert.equal(kits(old).length, 0, 'an old client never gets S.Kit');
  assert.equal(a.of(S.Error).length + b.of(S.Error).length, 0);
});

t('relay: an unchanged kit is not re-sent; null takes it off for everyone', () => {
  const { ps: [a, b], clear, msg } = party([CAPS_ALL, CAPS_ALL]); clear();
  msg(a, [C.Kit, JERSEY]); msg(a, [C.Kit, JERSEY]); msg(a, [C.Kit, JERSEY]);
  assert.equal(kits(b).length, 1, 'deduped');
  msg(a, [C.Kit, null]); assert.deepEqual(kits(b)[1], [S.Kit, a.id, null]);
});

t('relay: C.Kit from a client without Cap.Kit is ignored silently (never a bad frame, never forwarded)', () => {
  const { ps: [a, b], clear, msg } = party([OLD_CAPS, CAPS_ALL]); clear();
  msg(a, [C.Kit, FULL]);
  assert.equal(kits(b).length, 0); assert.equal(a.of(S.Error).length, 0); assert.equal(a.closed, null);
});

t('relay: rate limit KIT_RATE (burst 3, then 1 per 5 s); a held change goes out on a later tick and the LATEST wins', () => {
  const { room, clock, ps: [a, b], clear, msg } = party([CAPS_ALL, CAPS_ALL]); clear();
  const k = (c) => FULL.map((v, i) => (i === 0 || i === 3 ? c : v));
  for (let i = 1; i <= 6; i++) msg(a, [C.Kit, k(i)]);
  assert.deepEqual(kits(b).map((m) => m[2][0]), [1, 2, 3], 'the burst of 3 goes out at once');
  room.tick(); assert.equal(kits(b).length, 3, 'nothing more before the bucket refills');
  clock.t += 5000; room.tick();
  assert.deepEqual(kits(b).map((m) => m[2][0]), [1, 2, 3, 6], 'then the latest (6), never the skipped 4 / 5');
  clock.t += 6000; room.tick(); assert.equal(kits(b).length, 4, 'nothing pending: no repeat');
  assert.equal(a.closed, null);
});

t('relay: a member joining (or resuming) later hears every current kit right after its C.Caps', () => {
  const p = party([CAPS_ALL, CAPS_ALL]); const [a, b] = p.ps;
  p.msg(a, [C.Kit, FULL]); p.msg(b, [C.Kit, BOOTS]);
  const c = p.join(2, CAPS_ALL);
  assert.deepEqual(kits(c).sort((x, y) => x[1] - y[1]), [[S.Kit, a.id, FULL], [S.Kit, b.id, BOOTS]]);
  const d = p.join(3, OLD_CAPS); assert.equal(kits(d).length, 0, 'an old joiner hears none');
  // the Welcome / Joined roster shape is unchanged (old clients parse it): MemberInfo stays 6 long, no kit inside
  const w = d.of(S.Welcome)[0]; for (const m of w[7]) assert.equal(m.length, 6);
  assert.ok(P.parseServer(j(w)), 'the Welcome still parses');
  // b takes everything off: c hears null, and a later joiner hears only a's kit
  p.msg(b, [C.Kit, null]); assert.deepEqual(kits(c).pop(), [S.Kit, b.id, null]);
});

t('relay: the kit is kept on the slot through an eviction (attachment), and a corrupted attachment kit is dropped', () => {
  const p = party([CAPS_ALL, CAPS_ALL]); const [a] = p.ps;
  p.msg(a, [C.Kit, FULL]);
  const att = p.room.attachmentFor(a); assert.deepEqual(att.kit, FULL);
  assert.ok(j(att).length < 2048, 'the attachment stays small');
  const clock = { t: p.clock.t, now() { return this.t; } };
  const room2 = new RoomCore({ code: 'K7MQ4R', createdAt: clock.t, clock, random });
  const pa = peer(); room2.restoreMember(pa, att);
  const pb = peer(); room2.restoreMember(pb, { ...p.room.attachmentFor(p.ps[1]), kit: [1, 2, 3] });
  assert.deepEqual(room2.attachmentFor(pa).kit, FULL); assert.equal(room2.attachmentFor(pb).kit, undefined, 'a bad kit is not restored');
  room2.message(pb, j([C.Caps, CAPS_ALL]));
  assert.deepEqual(pb.of(S.Kit), [[S.Kit, att.id, FULL]], 'the restored kit is replayed on C.Caps');
  const plain = party([CAPS_ALL]); assert.equal(plain.room.attachmentFor(plain.ps[0]).kit, undefined, 'no kit, no field');
});

t('relay: a frame that fails validation counts as bad (a modded client), like every other malformed frame', () => {
  const { ps: [a, b], clear, msg } = party([CAPS_ALL, CAPS_ALL]); clear();
  for (let i = 0; i < 4; i++) msg(a, [C.Kit, [1, 2, 3]]);
  assert.equal(kits(b).length, 0); assert.equal(a.closed, null, 'four bad frames: still connected (limit 5)');
});

console.log(`mp-kit-relay: ${n} checks passed`);
