// Self rename (Oct 23 2026, relay v1.3): C.Rename protocol shape + validation, RoomCore rename / resume rename / host-reset lock,
// the client connection's rename() on a new relay (Cap.Rename) and an old relay (local only), the store's own-nick patch, and the
// Your party List wiring (OwnNameRow). No network.
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), ts = require('typescript');
const { loadTs } = require('../multiplayer/dev-relay/loadTs.cjs');
const ROOT = path.join(__dirname, '..');
const P = loadTs(path.join(ROOT, 'multiplayer/protocol/index.ts'));
const { RoomCore } = loadTs(path.join(ROOT, 'multiplayer/relay/src/roomCore.ts'));
const { C, S, Cap, CAPS_ALL, ErrorCode, PROTOCOL_VERSION } = P;
let n = 0; const t = (name, fn) => { try { fn(); n++; } catch (e) { console.error('FAIL', name); throw e; } };
const j = (a) => JSON.stringify(a);

// ---- protocol ----
t('protocol: C.Rename / Cap.Rename shapes', () => {
  assert.equal(C.Rename, 13); assert.equal(Cap.Rename, 4); assert.equal(CAPS_ALL, 15);
  assert.equal(CAPS_ALL & (Cap.Live | Cap.Ball | Cap.Rename | Cap.EmoteAsk), CAPS_ALL);
  assert.deepEqual(P.parseClient(j([C.Rename, 'Sam'])), [13, 'Sam']);
  assert.deepEqual(P.parseClient(j([C.Rename, ' sAM '])), [13, 'Sam'], 'normalised like the join name');
  assert.deepEqual(P.parseClient(j([C.Rename, 'élodie'])), [13, 'Élodie']);
  for (const bad of ['Sam Lee', 'S', 'Abcdefghijklm', 'Sam1', 'sam!', '', 'www.x.com', '😀😀', null, 5, ['Sam']]) {
    assert.equal(P.parseClient(j([C.Rename, bad])), null, 'rejects ' + JSON.stringify(bad));
  }
  assert.equal(P.parseClient(j([C.Rename])), null); assert.equal(P.parseClient(j([C.Rename, 'Sam', 1])), null);
  assert.ok(P.encode([C.Rename, 'Abcdefghijkl']).length < 64);
  // the old host-reset frame is unchanged: Renamed still carries null only
  assert.ok(P.parseServer(j([S.Renamed, 3, null]))); assert.equal(P.parseServer(j([S.Renamed, 3, 'Sam'])), null);
});

// ---- relay ----
let seed = 777;
const random = (k) => { const a = new Uint8Array(k); for (let i = 0; i < k; i++) { seed = (seed * 1103515245 + 12345) & 0x7fffffff; a[i] = (seed >> 8) & 255; } return a; };
const LOOK = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
function peer() { const p = { msgs: [], closed: null, send(x) { p.msgs.push(JSON.parse(x)); }, close(c) { p.closed = c; } }; p.of = (op) => p.msgs.filter((m) => m[0] === op); return p; }
function mkRoom() {
  const clock = { t: 1_000_000, now() { return this.t; } };
  const room = new RoomCore({ code: 'K7MQ4R', createdAt: clock.t, clock, random });
  const hello = (p, nick, resume = null, hostKey = null) => { room.connect(p); room.message(p, j([C.Hello, PROTOCOL_VERSION, LOOK, resume, hostKey, null, nick])); };
  return { room, clock, hello };
}
const me = (p) => p.of(S.Welcome)[0][2];
const tok = (p) => p.of(S.Welcome).slice(-1)[0][3];

t('relay: S.Caps announces Cap.Rename; C.Rename re-announces the member as Joined to everyone (old clients upsert by id)', () => {
  const { room, clock, hello } = mkRoom();
  const host = peer(); hello(host, 'Emma', null, room.hostKey);
  const g = peer(); hello(g, 'Leo');
  assert.ok(g.of(S.Caps)[0][1] & Cap.Rename, 'the relay announces Cap.Rename');
  const gid = me(g);
  room.message(g, j([C.Caps, CAPS_ALL]));
  host.msgs.length = 0; g.msgs.length = 0;
  clock.t += 1000; room.message(g, j([C.Rename, 'sam']));
  const hj = host.of(S.Joined), gj = g.of(S.Joined);
  assert.equal(hj.length, 1); assert.equal(gj.length, 1, 'the sender gets its confirmation');
  assert.equal(hj[0][1][0], gid); assert.equal(hj[0][1][5], 'Sam');
  assert.ok(P.parseServer(j(hj[0])), 'the re-announce passes the (old and new) client validator');
  // same name: no-op; bad name: dropped by parseClient (counted as bad, nothing broadcast)
  host.msgs.length = 0; clock.t += 1000;
  room.message(g, j([C.Rename, 'Sam'])); room.message(g, j([C.Rename, 'Sam Lee'])); room.message(g, j([C.Rename, '1234']));
  assert.equal(host.of(S.Joined).length, 0);
  // a new joiner sees the new name in the roster
  const late = peer(); hello(late, 'Mia');
  assert.equal(late.of(S.Welcome)[0][7].find((m) => m[0] === gid)[5], 'Sam');
});

t('relay: rename is rate limited (4 per minute)', () => {
  const { room, clock, hello } = mkRoom();
  const host = peer(); hello(host, 'Emma', null, room.hostKey);
  const g = peer(); hello(g, 'Leo'); room.message(g, j([C.Caps, CAPS_ALL]));
  host.msgs.length = 0;
  for (const nm of ['Aa', 'Bb', 'Cc', 'Dd', 'Ee', 'Ff']) { clock.t += 2000; room.message(g, j([C.Rename, nm])); }
  assert.equal(host.of(S.Joined).length, 4);
  clock.t += 60_000; room.message(g, j([C.Rename, 'Gg']));
  assert.equal(host.of(S.Joined).length, 5, 'allowed again after a minute');
});

t('relay: after a host reset the member cannot rename (C.Rename or a resume Hello)', () => {
  const { room, clock, hello } = mkRoom();
  const host = peer(); hello(host, 'Emma', null, room.hostKey);
  const g = peer(); hello(g, 'Leo'); room.message(g, j([C.Caps, CAPS_ALL]));
  const gid = me(g), gt = tok(g);
  clock.t += 1000; room.message(host, j([C.ResetName, gid]));
  assert.deepEqual(host.of(S.Renamed)[0], [S.Renamed, gid, null]);
  host.msgs.length = 0; clock.t += 2000;
  room.message(g, j([C.Rename, 'Sam']));
  assert.equal(host.of(S.Joined).length, 0, 'locked: no rename');
  const g2 = peer(); hello(g2, 'Sam', gt);
  assert.equal(g2.of(S.Welcome)[0][7].find((m) => m[0] === gid)[5], null, 'a resume does not bring a name back either');
  assert.equal(host.of(S.Joined).length, 0);
});

t('relay: a resume never renames; the slot keeps the C.Rename name across a reload (empty name slot)', () => {
  const { room, clock, hello } = mkRoom();
  const host = peer(); hello(host, 'Emma', null, room.hostKey);
  const g = peer(); hello(g, 'Leo'); const gid = me(g);
  room.message(g, j([C.Caps, CAPS_ALL])); clock.t += 1000; room.message(g, j([C.Rename, 'Sam']));
  host.msgs.length = 0; clock.t += 1000;
  const g2 = peer(); hello(g2, 'Zed', tok(g));
  assert.equal(me(g2), gid, 'same slot');
  assert.equal(g2.of(S.Welcome)[0][7].find((m) => m[0] === gid)[5], 'Sam', 'a resume Hello cannot rename');
  assert.equal(host.of(S.Joined).length, 0);
  const g3 = peer(); hello(g3, null, tok(g2)); // a page reload: empty name slot
  assert.equal(me(g3), gid); assert.equal(g3.of(S.Error).length, 0);
  assert.equal(g3.of(S.Welcome)[0][7].find((m) => m[0] === gid)[5], 'Sam', 'the slot keeps the new name');
});

// ---- client (connection + store) ----
const env = { NEXT_PUBLIC_MULTIPLAYER: '1', NEXT_PUBLIC_MULTIPLAYER_URL: 'http://localhost:8790/' };
const req = require('node:module').createRequire(ROOT + '/package.json'), cache = new Map();
function resolveTs(from, id) { const base = path.resolve(path.dirname(from), id); return fs.existsSync(base + '.ts') ? base + '.ts' : path.join(base, 'index.ts'); }
function load(file) {
  if (cache.has(file)) return cache.get(file); const mod = { exports: {} }; cache.set(file, mod.exports);
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText,
    { exports: mod.exports, module: mod, Math, Date, JSON, Number, Array, Object, Error, Map, Set, Float64Array, Uint8Array, Symbol, console, process: { env }, performance: { now: () => 0 },
      localStorage: { getItem: () => null, setItem: () => {} }, require: (id) => (id.startsWith('.') ? load(resolveTs(file, id)) : req(id)) });
  cache.set(file, mod.exports); return mod.exports;
}
const conn = load(path.join(ROOT, 'lib/multiplayer/connection.ts')), st = load(path.join(ROOT, 'lib/multiplayer/store.ts'));
function makeEnv() {
  let now = 1e6, seq = 0; const timers = [], sockets = [];
  class WS { constructor(url) { this.url = url; this.readyState = 0; this.sent = []; sockets.push(this); } send(x) { this.sent.push(x); } close() { this.readyState = 3; }
    open() { this.readyState = 1; this.onopen && this.onopen(); } recv(m) { this.onmessage && this.onmessage({ data: j(m) }); } drop() { this.readyState = 3; this.onclose && this.onclose(); } }
  const advance = (ms) => { const end = now + ms; for (;;) { timers.sort((a, b) => a.at - b.at); const nx = timers[0]; if (!nx || nx.at > end) break; timers.shift(); now = Math.max(now, nx.at); nx.fn(); } now = end; };
  const m = new Map();
  const c = conn.createPartyConnection({ WebSocketImpl: WS, now: () => now, random: () => 0.5,
    setTimeout: (fn, ms) => { const h = { id: ++seq, at: now + ms, fn }; timers.push(h); return h.id; },
    clearTimeout: (id) => { const i = timers.findIndex((x) => x.id === id); if (i >= 0) timers.splice(i, 1); },
    visibility: { hidden: () => false, on: () => () => {} }, storage: { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v), removeItem: (k) => m.delete(k) } });
  return { c, sockets, advance, last: () => sockets[sockets.length - 1], msgs: (s) => s.sent.map((x) => JSON.parse(x)) };
}
const welcomeMsg = () => [20, 1, 1, 'tok-abcdefghij012345', Date.now() + 7200000, Date.now() + 14400000, 0, [[1, [2, 0], LOOK, 1, null, 'Leo']]];

t('client: rename on a v1.3 relay sends C.Rename and every reconnect Hello carries the new name', () => {
  const e = makeEnv();
  assert.equal(e.c.rename('Sam'), null, 'not in a party');
  e.c.join('K7MQ4R', { look: LOOK, nick: 'Leo' }); const s = e.last(); s.open(); s.recv(welcomeMsg()); s.recv([S.Caps, CAPS_ALL]);
  assert.equal(e.c.rename('Sam Lee'), null, 'bad name refused'); assert.equal(e.c.rename('1'), null);
  assert.equal(e.c.rename('sam'), 'sent');
  const out = e.msgs(s); assert.deepEqual(out[out.length - 1], [C.Rename, 'Sam']);
  assert.ok(P.parseClient(s.sent[s.sent.length - 1]), 'passes the relay validator');
  s.drop(); e.advance(20000); const s2 = e.last(); assert.notEqual(s2, s); s2.open();
  const hello = e.msgs(s2)[0]; assert.equal(hello[0], C.Hello); assert.equal(hello[6], 'Sam', 'resume Hello carries the new name');
});

t('client: a rename while reconnecting goes out right after the next S.Caps (a resume Hello never renames)', () => {
  const e = makeEnv();
  e.c.join('K7MQ4R', { look: LOOK, nick: 'Leo' }); const s = e.last(); s.open(); s.recv(welcomeMsg()); s.recv([S.Caps, CAPS_ALL]);
  s.drop();
  assert.equal(e.c.rename('Sam'), 'sent');
  e.advance(20000); const s2 = e.last(); s2.open(); s2.recv(welcomeMsg());
  assert.ok(!e.msgs(s2).some((m) => m[0] === C.Rename), 'not before S.Caps');
  s2.recv([S.Caps, CAPS_ALL]);
  const out = e.msgs(s2); assert.deepEqual(out[out.length - 1], [C.Rename, 'Sam']);
  s2.recv([S.Caps, CAPS_ALL]); assert.equal(e.msgs(s2).filter((m) => m[0] === C.Rename).length, 1, 'sent once');
});

t('client: an old relay (no Cap.Rename) never gets C.Rename: local only', () => {
  const e = makeEnv();
  e.c.join('K7MQ4R', { look: LOOK, nick: 'Leo' }); const s = e.last(); s.open(); s.recv(welcomeMsg()); s.recv([S.Caps, Cap.Live | Cap.Ball]);
  const before = s.sent.length;
  assert.equal(e.c.rename('Sam'), 'local');
  assert.equal(s.sent.length, before, 'no frame the old relay would count as bad');
  const e2 = makeEnv(); e2.c.join('K7MQ4R', { look: LOOK, nick: 'Leo' }); const s3 = e2.last(); s3.open(); s3.recv(welcomeMsg()); // v1.1 relay: no S.Caps at all
  assert.equal(e2.c.rename('Sam'), 'local');
  assert.ok(!e2.msgs(s3).some((m) => m[0] === C.Rename));
});

t('client: a host reset locks rename for this party; leave clears it', () => {
  const e = makeEnv();
  e.c.join('K7MQ4R', { look: LOOK, nick: 'Leo' }); const s = e.last(); s.open(); s.recv(welcomeMsg()); s.recv([S.Caps, CAPS_ALL]);
  s.recv([S.Renamed, 1, null]);
  assert.equal(e.c.nameLocked, true); assert.equal(e.c.rename('Sam'), null);
  e.c.leave(); assert.equal(e.c.nameLocked, false);
});

t('store: setOwnNick patches only my row; the relay echo (Joined) agrees; friends upsert in place', () => {
  st.partyStore.reset();
  st.partyStore.apply([20, 1, 2, 'tok-abcdefghij012345', 0, 0, 0, [[1, [2, 0], LOOK, 1, null, 'Emma'], [2, [1, 0], LOOK, 0, null, 'Leo']]], 0);
  let emits = 0; const off = st.partyStore.subscribe(() => emits++);
  st.partyStore.setOwnNick('Sam');
  let ms = st.partyStore.get().members;
  assert.equal(ms.find((x) => x.id === 2).nick, 'Sam'); assert.equal(ms.find((x) => x.id === 1).nick, 'Emma'); assert.equal(emits, 1);
  st.partyStore.setOwnNick('Sam'); assert.equal(emits, 1, 'no emit when unchanged');
  st.partyStore.apply([S.Joined, [1, [2, 0], LOOK, 1, null, 'Zoe']], 1);
  ms = st.partyStore.get().members; assert.equal(ms.length, 2, 'a rename never doubles a row'); assert.equal(ms.find((x) => x.id === 1).nick, 'Zoe');
  off(); st.partyStore.reset();
});

// ---- UI wiring (source checks; the phone screenshot covers the look) ----
t('UI: own row has Change name with the join form rules; friends rows are not editable', () => {
  const row = fs.readFileSync(path.join(ROOT, 'components/party/OwnNameRow.tsx'), 'utf8');
  const host = fs.readFileSync(path.join(ROOT, 'components/party/PartyHost.tsx'), 'utf8');
  const field = fs.readFileSync(path.join(ROOT, 'components/party/NickField.tsx'), 'utf8');
  assert.match(row, /aria-label="Change name"/); assert.match(row, /<NickInput value=\{text\} onText=\{setText\}/, 'the join form box itself'); assert.match(row, /normalizeNick/);
  assert.doesNotMatch(row, /<input/, 'no second text input (owner rule: code boxes + the NickField box only)');
  assert.match(field, /export function NickInput/); assert.match(field, /<NickInput value=\{text\} onText=\{commit\}/, 'the join form uses it too');
  assert.match(field, /filterNickInput\(raw\)/); assert.match(field, /maxLength=\{NICK_MAX\}/); assert.match(field, /enterKeyHint="done"/);
  assert.match(row, /data-rename-save/); assert.match(row, /data-rename-cancel/);
  assert.match(host, /<OwnNameRow me=\{me\} locked=\{connection\.nameLocked\}/);
  assert.equal((host.match(/<OwnNameRow/g) || []).length, 1, "used once (own row only)");
  assert.match(host, /connection\.rename\(n\)/); assert.match(host, /setNick\(n\)/);
  assert.doesNotMatch(row, /localStorage|sessionStorage|document\.cookie/, 'memory only');
});

const rd = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
t('UI: every row icon has a visible word (Rename, Hide/Show, Mute/Unmute, Reset name, Remove)', () => {
  const host = rd('components/party/PartyHost.tsx'), row = rd('components/party/OwnNameRow.tsx');
  assert.match(row, /<span data-act-label>Rename<\/span>/);
  const acts = host.slice(host.indexOf('data-row-actions'), host.indexOf('</span>\n                </li>'));
  assert.ok(acts.length > 100, 'found the friend row actions');
  for (const w of [/\? 'Show' : 'Hide'\}<\/span>/, /\? 'Unmute' : 'Mute'\}<\/span>/, /<span data-act-label>Reset name<\/span>/, /<span data-act-label>Remove<\/span>/]) assert.match(acts, w);
  const buttons = acts.match(/<button[\s\S]*?<\/button>/g) || [];
  assert.equal(buttons.length, 4);
  for (const b of buttons) { assert.match(b, /className=\{styles\.act\}/); assert.match(b, /data-act-label/, 'label: ' + b.slice(0, 80)); }
  assert.doesNotMatch(host, /className=\{styles\.mini\}[^>]*aria-label=\{`(Hide|Show|Remove|Mute|Unmute|Reset)/, 'no icon-only row button left');
  const css = rd('components/party/party.module.css');
  assert.match(css, /\.act\{[^}]*min-height:44px/, 'labelled buttons keep a 44px tap target');
});

t('UI: Remove, Leave party and End party all go through the one ConfirmStep (Cancel focused, armed red button)', () => {
  const host = rd('components/party/PartyHost.tsx'), chip = rd('components/party/RoomPartyChip.tsx'), cs = rd('components/party/ConfirmStep.tsx');
  // the X only opens the confirm; kick() runs only from the confirm's onYes
  assert.match(host, /data-remove-open[^>]*onClick=\{\(\) => askKick\(m\.id\)\}/);
  const kicks = host.match(/connection\.host\.kick\(/g) || []; assert.equal(kicks.length, 1);
  assert.match(host, /<ConfirmStep as="li" kind="remove" question=\{`Remove \$\{displayName\(m\)\} from the party\?`\} yes="Remove"\s+onYes=\{\(\) => \{ setConfirmKick\(null\); connection\.host\.kick\(m\.id\)/);
  assert.match(host, /<ConfirmStep kind="end" question="End the party for everyone\?" yes="End party"\s+onYes=\{\(\) => \{ track\.current\?\.\('end'\); trackHealth\(\); connection\.host\.end\(\)/);
  assert.equal((host.match(/connection\.host\.end\(\)/g) || []).length, 1, 'End only from the confirm');
  assert.doesNotMatch(host, /Tap again/, 'the old same-spot double tap is gone');
  assert.match(host, /<ConfirmStep kind="leave" question="Leave the party\?" yes="Leave" onYes=\{\(\) => \{ setConfirmLeave\(false\); leave\(\); \}\}/);
  assert.match(host, /data-party-leave onClick=\{\(\) => setConfirmLeave\(true\)\}/, 'Leave party only opens the confirm');
  assert.match(chip, /<ConfirmStep kind="room-leave" question="Leave the party\?" yes="Leave" onYes=\{leave\}/);
  assert.match(chip, /data-room-leave onClick=\{\(\) => setConfirmLeave\(true\)\}/);
  // ConfirmStep: Cancel is focused on open and comes after (to the right of) the red button; the red button is armed
  assert.match(cs, /cancel\.current\?\.focus/); assert.ok(cs.indexOf('data-confirm-yes') < cs.indexOf('data-confirm-cancel'));
  assert.match(cs, /performance\.now\(\) - openedAt\.current < CONFIRM_ARM_MS\) return/);
  const { CONFIRM_ARM_MS } = (() => { const m = { exports: {} }; vm.runInNewContext(ts.transpileModule(cs, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020 } }).outputText, { exports: m.exports, module: m, require: (id) => (id.endsWith('.css') ? {} : req(id)), performance: { now: () => 0 } }); return m.exports; })();
  assert.ok(CONFIRM_ARM_MS >= 300 && CONFIRM_ARM_MS <= 800, 'arming delay long enough to stop a double tap, short enough not to annoy');
});

t('UI: Leave party shares the End party destructive red (one token, no second red)', () => {
  const host = rd('components/party/PartyHost.tsx'), chip = rd('components/party/RoomPartyChip.tsx'), css = rd('components/party/party.module.css');
  const end = host.match(/<button type="button" className=\{styles\.(\w+)\} data-party-end/), leave = host.match(/<button type="button" className=\{styles\.(\w+)\} data-party-leave/);
  assert.ok(end && leave); assert.equal(leave[1], end[1], 'same class'); assert.equal(end[1], 'endLink');
  assert.match(chip, /className=\{`\$\{styles\.secondary\} \$\{styles\.dangerText\}`\} data-room-leave/, 'room Leave keeps its pill size, takes the red');
  assert.match(css, /\.endLink\{[^}]*color:var\(--party-danger\)/); assert.match(css, /\.dangerText\{color:var\(--party-danger\)\}/);
  assert.match(css, /\.danger\{background:var\(--party-danger\)/); assert.match(css, /\.act\[data-danger\]\{color:var\(--party-danger\)\}/);
  const reds = (css.match(/rgb\(163 38 28\)|#a3262a|#c8423f/gi) || []); assert.equal(reds.length, 1, 'the red is declared once');
});

console.log(`mp-rename: ${n} checks passed`);
