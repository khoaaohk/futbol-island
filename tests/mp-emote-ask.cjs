// Shared ball emotes as request + accept (owner, Oct 23 2026; relay v1.4, Cap.EmoteAsk): protocol shapes, the relay's checks (same island,
// on foot, near, outside the force field, new clients only) and anti-spam (one open ask per pair, 20 s cooldown, blocked for 2 min after
// 2 Nos in a row, a late or stray answer ignored), the Yes -> S.Duet to new clients + S.Emote per player to old ones, and the client's ask
// module (gate mirror, the card store, the 8 s card timeout = a No, the asker's timeout, muted / busy asks ignored). No network.
const assert = require('node:assert/strict'), path = require('node:path');
const { loadTs } = require('../multiplayer/dev-relay/loadTs.cjs');
const ROOT = path.join(__dirname, '..');
const P = loadTs(path.join(ROOT, 'multiplayer/protocol/index.ts'));
const { RoomCore } = loadTs(path.join(ROOT, 'multiplayer/relay/src/roomCore.ts'));
const A = loadTs(path.join(ROOT, 'lib/multiplayer/emoteAsk.ts'));
const { C, S, Cap, CAPS_ALL, Emote, Mode, Zone, AskReply, EMOTE_ASK, PROTOCOL_VERSION } = P;
let n = 0; const t = (name, fn) => { try { fn(); n++; } catch (e) { console.error('FAIL', name); throw e; } };
const j = (a) => JSON.stringify(a);

t('protocol: Cap.EmoteAsk is the next bit; message shapes validate', () => {
  assert.equal(Cap.EmoteAsk, 8); assert.equal(CAPS_ALL, 127);
  assert.equal(C.EmoteAsk, 14); assert.equal(C.EmoteAnswer, 15); assert.equal(S.EmoteAsk, 34); assert.equal(S.EmoteAnswer, 35); assert.equal(S.Duet, 36);
  assert.deepEqual(P.parseClient(j([C.EmoteAsk, 3, Emote.PassBall])), [14, 3, 6]);
  assert.deepEqual(P.parseClient(j([C.EmoteAsk, 3, Emote.JuggleWithMe])), [14, 3, 3]);
  for (const e of [Emote.Wave, Emote.Cheer, Emote.HighFive, Emote.Dance, 10, -1, '6']) assert.equal(P.parseClient(j([C.EmoteAsk, 3, e])), null, 'one-way emotes are never asked: ' + e);
  assert.equal(P.parseClient(j([C.EmoteAsk, 99, 6])), null); assert.equal(P.parseClient(j([C.EmoteAsk, 3])), null);
  assert.deepEqual(P.parseClient(j([C.EmoteAnswer, 2, 1])), [15, 2, 1]); assert.equal(P.parseClient(j([C.EmoteAnswer, 2, 2])), null);
  assert.ok(P.parseServer(j([S.EmoteAsk, 1, 6]))); assert.ok(P.parseServer(j([S.EmoteAnswer, 1, 3, AskReply.Unavailable])));
  assert.equal(P.parseServer(j([S.EmoteAnswer, 1, 3, 3])), null);
  assert.ok(P.parseServer(j([S.Duet, 1, 2, 6, 200]))); assert.equal(P.parseServer(j([S.Duet, 1, 1, 6, 0])), null, 'not with yourself');
  assert.equal(P.parseServer(j([S.Duet, 1, 2, 0, 0])), null);
});

// ---- relay ----
let seed = 4242;
const random = (k) => { const a = new Uint8Array(k); for (let i = 0; i < k; i++) { seed = (seed * 1103515245 + 12345) & 0x7fffffff; a[i] = (seed >> 8) & 255; } return a; };
const LOOK = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
function peer() { const p = { msgs: [], closed: null, send(x) { p.msgs.push(JSON.parse(x)); }, close(c) { p.closed = c; } }; p.of = (op) => p.msgs.filter((m) => m[0] === op); return p; }
function party(n = 3, caps = [CAPS_ALL, CAPS_ALL, CAPS_ALL]) {
  const clock = { t: 5_000_000, now() { return this.t; } };
  const room = new RoomCore({ code: 'K7MQ4R', createdAt: clock.t, clock, random });
  const names = ['Emma', 'Leo', 'Ayako', 'Sam'], ps = [];
  for (let i = 0; i < n; i++) {
    const p = peer(); room.connect(p); room.message(p, j([C.Hello, PROTOCOL_VERSION, LOOK, null, i === 0 ? room.hostKey : null, null, names[i]]));
    p.id = p.of(S.Welcome)[0][2]; if (caps[i]) room.message(p, j([C.Caps, caps[i]])); p.seq = 0; ps.push(p);
  }
  const pose = (p, x, z, mode = Mode.Idle, flags = 0, zone = Zone.Main) => { clock.t += 400; room.message(p, j([C.Pose, p.seq++, x * 10, 20, z * 10, 0, 0, mode, zone, flags])); };
  ps.forEach((p, i) => pose(p, 20 + i * 3, -60));
  const clear = () => ps.forEach((p) => { p.msgs.length = 0; });
  return { room, clock, ps, pose, clear, msg: (p, m) => { clock.t += 50; room.message(p, j(m)); } };
}

t('relay: an ask reaches only the asked friend; No goes back to the asker', () => {
  const { ps: [a, b, c], clear, msg } = party(); clear();
  msg(a, [C.EmoteAsk, b.id, Emote.PassBall]);
  assert.deepEqual(b.of(S.EmoteAsk), [[S.EmoteAsk, a.id, Emote.PassBall]]);
  assert.equal(c.of(S.EmoteAsk).length, 0); assert.equal(a.of(S.EmoteAsk).length, 0);
  msg(b, [C.EmoteAnswer, a.id, 0]);
  assert.deepEqual(a.of(S.EmoteAnswer), [[S.EmoteAnswer, b.id, Emote.PassBall, AskReply.No]]);
  assert.equal(a.of(S.Duet).length + b.of(S.Duet).length + c.of(S.Duet).length, 0, 'nothing starts on a No');
  msg(b, [C.EmoteAnswer, a.id, 1]); assert.equal(c.of(S.Duet).length, 0, 'a second answer to a closed ask is ignored');
});

t('relay: Yes starts the duet on every new client; old clients get one S.Emote per player', () => {
  const { ps: [a, b, c], clear, msg } = party(3, [CAPS_ALL, CAPS_ALL, Cap.Live | Cap.Ball]); clear();
  msg(a, [C.EmoteAsk, b.id, Emote.JuggleWithMe]); msg(b, [C.EmoteAnswer, a.id, 1]);
  assert.deepEqual(a.of(S.EmoteAnswer).map((m) => m[3]), [AskReply.Yes]);
  const da = a.of(S.Duet), db = b.of(S.Duet);
  assert.equal(da.length, 1); assert.deepEqual(da, db, 'both play the same routine (same seed)');
  assert.deepEqual(da[0].slice(0, 4), [S.Duet, a.id, b.id, Emote.JuggleWithMe]); assert.ok(da[0][4] >= 0 && da[0][4] <= 255);
  assert.equal(c.of(S.Duet).length, 0); assert.deepEqual(c.of(S.Emote), [[S.Emote, a.id, 3], [S.Emote, b.id, 3]], 'the old client sees both play it');
});

t('relay: refused (Unavailable) when the friend is an old client, busy / away, indoors, riding, far, or not in the party', () => {
  { const { ps: [a, b], clear, msg } = party(2, [CAPS_ALL, Cap.Live]); clear(); msg(a, [C.EmoteAsk, b.id, 6]); assert.equal(b.of(S.EmoteAsk).length, 0); assert.deepEqual(a.of(S.EmoteAnswer)[0], [S.EmoteAnswer, b.id, 6, AskReply.Unavailable]); }
  { const { ps: [a, b], clear, msg, pose } = party(2); pose(b, 23, -60, Mode.Busy); clear(); msg(a, [C.EmoteAsk, b.id, 6]); assert.equal(b.of(S.EmoteAsk).length, 0, 'busy: in the force field'); assert.equal(a.of(S.EmoteAnswer)[0][3], AskReply.Unavailable); }
  { const { ps: [a, b], clear, msg, pose } = party(2); pose(b, 23, -60, Mode.Idle, P.PoseFlag.Hidden); clear(); msg(a, [C.EmoteAsk, b.id, 6]); assert.equal(b.of(S.EmoteAsk).length, 0, 'away'); }
  { const { ps: [a, b], clear, msg, pose } = party(2); pose(b, 23, -60, Mode.Bike); clear(); msg(a, [C.EmoteAsk, b.id, 6]); assert.equal(b.of(S.EmoteAsk).length, 0, 'on a bike'); }
  { const { ps: [a, b], clear, msg, pose } = party(2); pose(a, 20, -60, Mode.Busy); clear(); msg(a, [C.EmoteAsk, b.id, 6]); assert.equal(b.of(S.EmoteAsk).length, 0, 'the asker is busy'); }
  { const { ps: [a, b], clear, msg, pose, clock } = party(2); for (let x = 25; x <= 40; x += 3) { clock.t += 1000; pose(b, x, -60, Mode.Walk); } clear(); msg(a, [C.EmoteAsk, b.id, 6]); assert.equal(b.of(S.EmoteAsk).length, 0, 'too far'); }
  { const { ps: [a], clear, msg } = party(2); clear(); msg(a, [C.EmoteAsk, a.id, 6]); msg(a, [C.EmoteAsk, 17, 6]); assert.equal(a.of(S.EmoteAnswer).length, 2); assert.ok(a.of(S.EmoteAnswer).every((m) => m[3] === AskReply.Unavailable)); }
  { const { ps: [a, b], clear, msg } = party(2, [Cap.Live, CAPS_ALL]); clear(); msg(a, [C.EmoteAsk, b.id, 6]); assert.equal(b.of(S.EmoteAsk).length + a.of(S.EmoteAnswer).length, 0, 'a client without the cap is ignored'); }
});

t('relay: a busy friend at answer time -> Unavailable, no duet', () => {
  const { ps: [a, b], clear, msg, pose } = party(2); clear();
  msg(a, [C.EmoteAsk, b.id, 6]); pose(b, 23, -60, Mode.Busy); msg(b, [C.EmoteAnswer, a.id, 1]);
  assert.equal(a.of(S.Duet).length, 0); assert.equal(a.of(S.EmoteAnswer).slice(-1)[0][3], AskReply.Unavailable);
});

t('relay anti-spam: one open ask, 20 s cooldown per pair, 2 Nos in a row block for 2 min, a timeout counts as a No', () => {
  const { ps: [a, b, c], clear, msg, clock } = party(); clear();
  msg(a, [C.EmoteAsk, b.id, 6]); clock.t += 3000; msg(a, [C.EmoteAsk, b.id, 6]);
  assert.equal(b.of(S.EmoteAsk).length, 1, 'one open ask per pair'); assert.equal(a.of(S.EmoteAnswer).slice(-1)[0][3], AskReply.Unavailable);
  msg(a, [C.EmoteAsk, c.id, 3]); assert.equal(c.of(S.EmoteAsk).length, 1, 'another friend is a different pair');
  msg(b, [C.EmoteAnswer, a.id, 0]); clock.t += 5000; msg(a, [C.EmoteAsk, b.id, 6]); assert.equal(b.of(S.EmoteAsk).length, 1, 'cooldown');
  clock.t += EMOTE_ASK.cooldownMs; msg(a, [C.EmoteAsk, b.id, 6]); assert.equal(b.of(S.EmoteAsk).length, 2, 'after the cooldown');
  msg(b, [C.EmoteAnswer, a.id, 0]); // second No in a row: blocked
  clock.t += EMOTE_ASK.cooldownMs + 1000; msg(a, [C.EmoteAsk, b.id, 6]); assert.equal(b.of(S.EmoteAsk).length, 2, 'blocked after 2 Nos');
  clock.t += EMOTE_ASK.blockMs; msg(a, [C.EmoteAsk, b.id, 6]); assert.equal(b.of(S.EmoteAsk).length, 3, 'free again after the block');
  // that ask times out (no answer), then a late answer is ignored
  clock.t += EMOTE_ASK.timeoutMs + EMOTE_ASK.graceMs + 100; msg(b, [C.EmoteAnswer, a.id, 1]); assert.equal(a.of(S.Duet).length, 0, 'a late Join is ignored');
  clock.t += EMOTE_ASK.cooldownMs; msg(a, [C.EmoteAsk, b.id, 6]); assert.equal(b.of(S.EmoteAsk).length, 4);
  clock.t += EMOTE_ASK.timeoutMs + EMOTE_ASK.graceMs + EMOTE_ASK.cooldownMs; msg(a, [C.EmoteAsk, b.id, 6]);
  assert.equal(b.of(S.EmoteAsk).length, 4, 'two unanswered asks in a row block too');
  // a Yes resets the run of Nos
  const q = party(2); q.clear(); const [x, y] = q.ps;
  q.msg(x, [C.EmoteAsk, y.id, 6]); q.msg(y, [C.EmoteAnswer, x.id, 0]); q.clock.t += EMOTE_ASK.cooldownMs;
  q.msg(x, [C.EmoteAsk, y.id, 6]); q.msg(y, [C.EmoteAnswer, x.id, 1]); q.clock.t += EMOTE_ASK.cooldownMs;
  q.msg(x, [C.EmoteAsk, y.id, 6]); q.msg(y, [C.EmoteAnswer, x.id, 0]); q.clock.t += EMOTE_ASK.cooldownMs;
  q.msg(x, [C.EmoteAsk, y.id, 6]); assert.equal(y.of(S.EmoteAsk).length, 4, 'No, Yes, No is not two in a row');
});

t('relay: an answer from someone who was not asked does nothing; leaving clears the pair', () => {
  const { room, ps: [a, b, c], clear, msg, clock } = party(); clear();
  msg(c, [C.EmoteAnswer, a.id, 1]); assert.equal(a.of(S.Duet).length + a.of(S.EmoteAnswer).length, 0);
  msg(a, [C.EmoteAsk, b.id, 6]); msg(c, [C.EmoteAnswer, a.id, 1]); assert.equal(a.of(S.Duet).length, 0, 'only the asked friend can answer');
  msg(b, [C.Leave]); assert.equal(room.asks.size, 0, 'the pair is forgotten'); void clock;
});

// ---- client: lib/multiplayer/emoteAsk.ts ----
function fakeConn(caps = CAPS_ALL) {
  const c = { caps, sent: [], subs: new Set(), onMessage(f) { c.subs.add(f); return () => c.subs.delete(f); }, recv(m) { for (const f of c.subs) f(m); },
    sendEmoteAsk(to, e) { c.sent.push([C.EmoteAsk, to, e]); return true; }, sendEmoteAnswer(from, yes) { c.sent.push([C.EmoteAnswer, from, yes ? 1 : 0]); return true; } };
  return c;
}
function fakeTimers() { const T = { list: [], set(fn, ms) { const h = { fn, at: T.now + ms }; T.list.push(h); return h; }, clear(h) { T.list = T.list.filter((x) => x !== h); }, now: 0,
  advance(ms) { T.now += ms; for (const h of T.list.slice()) if (h.at <= T.now) { T.list = T.list.filter((x) => x !== h); h.fn(); } } }; return T; }
function client(caps, opts = {}) {
  const conn = fakeConn(caps), T = fakeTimers(), log = [];
  const cl = A.createEmoteAskClient(conn, { now: () => T.now, canShow: opts.canShow || (() => true), nameOf: (id) => 'Friend' + id,
    onReply: (by, e, r) => log.push(['reply', by, e, r]), onDuet: (a, b, e, s) => log.push(['duet', a, b, e, s]) }, T);
  return { conn, T, log, cl };
}
t('client: an old relay is not supported (no ask is ever sent)', () => {
  const { cl, conn } = client(Cap.Live | Cap.Ball | Cap.Rename);
  assert.equal(cl.supported, false); assert.equal(cl.ask(2, 6), false); assert.equal(conn.sent.length, 0); cl.dispose();
});
t('client: asks once, mirrors the cooldown, a No / timeout counts, 2 in a row block (state for the greyed button)', () => {
  const { cl, conn, T, log } = client(CAPS_ALL);
  assert.equal(cl.ask(2, 6), true); assert.deepEqual(conn.sent[0], [C.EmoteAsk, 2, 6]); assert.equal(cl.state(2), 'pending'); assert.equal(cl.ask(2, 6), false);
  conn.recv([S.EmoteAnswer, 2, 6, AskReply.No]); assert.deepEqual(log[0], ['reply', 2, 6, AskReply.No]); assert.equal(cl.pending, null); assert.equal(cl.state(2), 'cooldown');
  T.advance(EMOTE_ASK.cooldownMs); assert.equal(cl.state(2), 'ok'); assert.equal(cl.ask(2, 3), true);
  T.advance(EMOTE_ASK.timeoutMs + EMOTE_ASK.graceMs); assert.deepEqual(log[1], ['reply', 2, 3, AskReply.No], 'no answer = a No after the timeout');
  assert.equal(cl.state(2), 'blocked'); T.advance(EMOTE_ASK.blockMs); assert.equal(cl.state(2), 'ok');
  assert.equal(cl.ask(2, 6), true); conn.recv([S.EmoteAnswer, 2, 6, AskReply.Unavailable]); assert.equal(cl.state(2), 'ok', 'Unavailable: the relay never asked, no cooldown');
  cl.dispose();
});
t('client: the card (store), Join / No thanks, its 8 s timeout, muted or busy asks ignored, one card at a time, the duet event', () => {
  let ok = true; const { cl, conn, T, log } = client(CAPS_ALL, { canShow: () => ok });
  conn.recv([S.EmoteAsk, 4, 6]); const c = A.emoteAskStore.get(); assert.equal(c.from, 4); assert.equal(c.name, 'Friend4'); assert.equal(c.emote, 6);
  conn.recv([S.EmoteAsk, 5, 3]); assert.equal(A.emoteAskStore.get().from, 4, 'one card at a time');
  A.answerEmoteAsk(true); assert.deepEqual(conn.sent.slice(-1)[0], [C.EmoteAnswer, 4, 1]); assert.equal(A.emoteAskStore.get(), null);
  conn.recv([S.Duet, 4, 1, 6, 9]); assert.deepEqual(log.slice(-1)[0], ['duet', 4, 1, 6, 9]);
  conn.recv([S.EmoteAsk, 5, 3]); T.advance(EMOTE_ASK.timeoutMs); assert.deepEqual(conn.sent.slice(-1)[0], [C.EmoteAnswer, 5, 0], 'the card times out as a No'); assert.equal(A.emoteAskStore.get(), null);
  ok = false; conn.recv([S.EmoteAsk, 6, 6]); assert.equal(A.emoteAskStore.get(), null, 'muted / hidden / busy: never shown, no tap needed');
  ok = true; conn.recv([S.EmoteAsk, 7, 6]); conn.recv([S.Left, 7, 0]); assert.equal(A.emoteAskStore.get(), null, 'the asker left: the card closes');
  const sent = conn.sent.length; T.advance(EMOTE_ASK.timeoutMs * 2); assert.equal(conn.sent.length, sent, 'no stray timer');
  cl.dispose();
});
t('client: no loops, no analytics (tests/mp-isolation.cjs rule)', () => {
  const src = require('node:fs').readFileSync(path.join(ROOT, 'lib/multiplayer/emoteAsk.ts'), 'utf8');
  assert.ok(!/setInterval|requestAnimationFrame/.test(src)); assert.ok(!/analytics/.test(src.split('\n').filter((l) => l.startsWith('import')).join('\n')));
});
console.log('mp-emote-ask: ' + n + ' checks passed');
