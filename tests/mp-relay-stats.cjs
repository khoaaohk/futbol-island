// Relay stats (Phase B): pure counters/buckets, privacy of every stored key and value, GET /stats auth, the prune alarm, the dev relay.
const assert = require('node:assert/strict');
const path = require('node:path');
const { loadTs } = require('../multiplayer/dev-relay/loadTs.cjs');
const ROOT = path.join(__dirname, '..');
const P = loadTs(path.join(ROOT, 'multiplayer/protocol/index.ts'));
const SC = loadTs(path.join(ROOT, 'multiplayer/relay/src/relayStatsCore.ts'));
const { RoomCore } = loadTs(path.join(ROOT, 'multiplayer/relay/src/roomCore.ts'));
const { RelayStats } = loadTs(path.join(ROOT, 'multiplayer/relay/src/relayStats.ts'));
const worker = loadTs(path.join(ROOT, 'multiplayer/relay/src/index.ts')).default;
const { C, S, ErrorCode, EndReason, PROTOCOL_VERSION } = P;

const mkKv = () => {
  const m = new Map();
  return {
    m,
    get: async (k) => (m.has(k) ? JSON.parse(JSON.stringify(m.get(k))) : undefined),
    put: async (k, v) => { m.set(k, JSON.parse(JSON.stringify(v))); },
    delete: async (k) => m.delete(k),
    list: async (o = {}) => new Map([...m].filter(([k]) => k.startsWith(o.prefix || '')).map(([k, v]) => [k, JSON.parse(JSON.stringify(v))])),
  };
};
const T0 = Date.UTC(2026, 9, 22, 12, 0, 0);
const DAY = 86400000;

(async () => {
  // ---- bucket edges ----
  assert.deepEqual([1, 2, 3, 4, 5, 8, 9, 12, 13, 20].map(SC.peakBucket), ['peak_1', 'peak_2', 'peak_3_4', 'peak_3_4', 'peak_5_8', 'peak_5_8', 'peak_9_12', 'peak_9_12', 'peak_13_20', 'peak_13_20']);
  assert.deepEqual([0, 4.99 * 60000, 5 * 60000, 14.99 * 60000, 15 * 60000, 30 * 60000, 59.99 * 60000, 60 * 60000, 180 * 60000].map(SC.lenBucket),
    ['len_5m', 'len_5m', 'len_15m', 'len_15m', 'len_30m', 'len_60m', 'len_60m', 'len_3h', 'len_long']);
  assert.deepEqual([1, 2, 3, 4, 9, 10, 50].map(SC.joinsBucket), ['1', '2_3', '2_3', '4_9', '4_9', '10p', '10p']);
  assert.deepEqual([0, 999, 1000, 9999, 10000, 49999, 50000].map(SC.msgsBucket), ['lt_1k', 'lt_1k', 'k1_10k', 'k1_10k', 'k10_50k', 'k10_50k', 'k50k_plus']);

  // ---- counters, gauges ----
  const kv = mkKv();
  let now = T0;
  const core = new SC.RelayStatsCore(kv, () => now);
  await core.created(); await core.created();
  await core.players(3); await core.players(-1);
  assert.deepEqual(await kv.get('live'), { parties: 2, players: 2 });
  const sum = { endReason: EndReason.HostEnded, peak: 3, lenMs: 20 * 60000, joins: 3, resumes: 1, kicks: 1, rotates: 2, locks: 1, nameResets: 0, rateCloses: 1, msgs: 12000,
    fails: { full: 2, locked: 1, closed: 1 }, errs: { full: 2, rate: 1 } };
  await core.ended(sum, 2);
  await core.inc('rl:origin_refused'); await core.inc('rl:lookup_miss', 3);
  assert.equal(await core.inc('rl:evil'), false, 'unknown ids are refused');
  assert.equal(await core.inc('rl:live_parties_max'), false, 'gauges cannot be incremented from outside');
  const day = SC.dayOf(T0);
  const row = await kv.get('day:' + day);
  assert.equal(row['rl:created'], 2);
  assert.equal(row['rl:ended_host'], 1); assert.equal(row['rl:peak_3_4'], 1); assert.equal(row['rl:len_30m'], 1);
  assert.equal(row['rl:joins_2_3'], 1); assert.equal(row['rl:msgs_k10_50k'], 1); assert.equal(row['rl:msgs'], 12000);
  assert.equal(row['rl:welcome'], 3); assert.equal(row['rl:resume'], 1); assert.equal(row['rl:kick'], 1); assert.equal(row['rl:rotate'], 2);
  assert.equal(row['rl:lock'], 1); assert.equal(row['rl:rate_close'], 1);
  assert.equal(row['rl:fail_full'], 2); assert.equal(row['rl:fail_locked'], 1); assert.equal(row['rl:fail_closed'], 1);
  assert.equal(row['rl:err_full'], 2); assert.equal(row['rl:err_rate'], 1);
  assert.equal(row['rl:origin_refused'], 1); assert.equal(row['rl:lookup_miss'], 3);
  assert.equal(row['rl:live_parties_max'], 2, 'daily peak of live parties');
  assert.equal(row['rl:live_players_max'], 3, 'daily peak of live players');
  assert.deepEqual(await kv.get('live'), { parties: 1, players: 0 }, 'summary takes the room off the gauge');
  await core.ended({ ...sum, endReason: 99 }, 999); // hostile numbers never go negative or invent keys
  assert.deepEqual(await kv.get('live'), { parties: 0, players: 0 });

  // ---- privacy: drive a REAL room with identifying data, then inspect everything that was stored ----
  const CODE = 'K7MQ4R', NICK = 'Zoeyname';
  let seed = 7;
  const random = (n) => { const a = new Uint8Array(n); for (let i = 0; i < n; i++) { seed = (seed * 1103515245 + 12345) & 0x7fffffff; a[i] = (seed >> 8) & 255; } return a; };
  const clock = { t: T0, now() { return this.t; } };
  const room = new RoomCore({ code: CODE, createdAt: T0, clock, random });
  const mkPeer = () => { const p = { msgs: [], send(t) { p.msgs.push(JSON.parse(t)); }, close() {} }; return p; };
  const look = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const a = mkPeer(), b = mkPeer(), x = mkPeer();
  room.connect(a); room.message(a, JSON.stringify([C.Hello, PROTOCOL_VERSION, look, null, room.hostKey, null, NICK]));
  room.connect(b); room.message(b, JSON.stringify([C.Hello, PROTOCOL_VERSION, look, null, null, null, 'Maxwell']));
  room.connect(x); room.message(x, JSON.stringify([C.Hello, PROTOCOL_VERSION + 5, look, null, null, null, 'Nope']));
  room.message(a, JSON.stringify([C.Lock, 1]));
  const c = mkPeer(); room.connect(c); room.message(c, JSON.stringify([C.Hello, PROTOCOL_VERSION, look, null, null, null, 'Lockedout']));
  clock.t += 3 * 60000;
  room.message(a, JSON.stringify([C.End]));
  assert.ok(room.ended);
  const s = room.summary();
  assert.equal(s.peak, 2); assert.equal(s.joins, 2); assert.equal(s.locks, 1); assert.equal(s.endReason, EndReason.HostEnded);
  assert.equal(s.fails.locked, 1); assert.equal(s.fails.bad_name, undefined);
  assert.ok(s.msgs >= 2);
  const kv2 = mkKv();
  const core2 = new SC.RelayStatsCore(kv2, () => T0);
  await core2.created(); await core2.players(2); await core2.ended(s, 2);
  await core2.inc('rl:lookup_miss');
  const dump = JSON.stringify([...kv2.m]);
  for (const bad of [CODE, NICK, 'Maxwell', 'Lockedout', room.hostKey, room.digest, '127.0.0.1', '203.0.113', 'token']) assert.ok(!dump.includes(bad), 'stored data leaks ' + bad);
  assert.ok(!/[A-Z0-9]{22}/.test(dump), 'nothing token-shaped');
  for (const [k, v] of kv2.m) {
    if (k === 'live') { assert.deepEqual(Object.keys(v).sort(), ['parties', 'players']); continue; }
    assert.match(k, /^day:\d{4}-\d{2}-\d{2}$/, 'only day keys');
    for (const [id, n] of Object.entries(v)) { assert.ok(SC.ALLOWED.has(id), 'unlisted id ' + id); assert.ok(Number.isInteger(n) && n >= 0, 'value is a count'); }
  }
  // the snapshot carries counters and buckets, and none of it is identifying
  const snap = JSON.stringify(room.snapshot().stats);
  assert.ok(!snap.includes(NICK) && !snap.includes(CODE));
  assert.equal(room.snapshot().stats.buckets.peak, 'peak_2');

  // ---- the Durable Object shell: routes, alarm, prune ----
  const store = new Map();
  let alarm = null;
  const state = { storage: {
    get: async (k) => store.get(k), put: async (k, v) => { store.set(k, JSON.parse(JSON.stringify(v))); }, delete: async (k) => store.delete(k),
    list: async (o = {}) => new Map([...store].filter(([k]) => k.startsWith(o.prefix || ''))),
    getAlarm: async () => alarm, setAlarm: async (t) => { alarm = t; }, deleteAlarm: async () => { alarm = null; },
  } };
  const realNow = Date.now;
  const post = (o, p, body) => o.fetch(new Request('https://do' + p, { method: 'POST', body: JSON.stringify(body || {}) }));
  try {
    Date.now = () => T0 - 401 * DAY;
    const doo = new RelayStats(state);
    await post(doo, '/created');
    Date.now = () => T0 - 399 * DAY;
    await post(doo, '/created');
    assert.ok(alarm !== null, 'the prune alarm is armed on first use');
    Date.now = () => T0;
    await post(doo, '/created');
    assert.equal([...store.keys()].filter((k) => k.startsWith('day:')).length, 3);
    await doo.alarm();
    const left = [...store.keys()].filter((k) => k.startsWith('day:')).sort();
    assert.deepEqual(left, ['day:' + SC.dayOf(T0 - 399 * DAY), 'day:' + SC.dayOf(T0)], 'rows older than 400 days are pruned, 399 kept');
    assert.equal(alarm, T0 + DAY, 'the alarm re-arms for the next day');
    assert.equal((await post(doo, '/inc', { id: 'rl:' + CODE })).status, 400, 'a code can never become a key');
    assert.equal((await post(doo, '/nope')).status, 404);
    const st = await (await doo.fetch(new Request('https://do/stats?from=' + SC.dayOf(T0) + '&to=' + SC.dayOf(T0)))).json();
    assert.equal(st.totals['rl:created'], 1); assert.deepEqual(Object.keys(st.days), [SC.dayOf(T0)]);

    // ---- GET /stats on the worker ----
    const TOKEN = 'x'.repeat(8) + 'secret-token-1234';
    const statsDo = new RelayStats({ storage: state.storage });
    const env = { STATS_TOKEN: TOKEN, MP_ALLOWED_ORIGINS: 'https://futbolisland.app', STATS: { idFromName: () => 'id', get: () => ({ fetch: (u, i) => statsDo.fetch(new Request(u, i)) }) }, PARTY: {} };
    const get = (h, o = env, url = 'https://r.example/stats') => worker.fetch(new Request(url, { headers: h }), o, { waitUntil() {} });
    assert.equal((await get({})).status, 401, 'no token');
    assert.equal((await get({ Authorization: 'Bearer wrong' })).status, 401);
    assert.equal((await get({ Authorization: TOKEN })).status, 401, 'needs the Bearer scheme');
    assert.equal((await get({ Authorization: 'Bearer ' + TOKEN + 'x' })).status, 401);
    assert.equal((await get({}, { ...env, STATS_TOKEN: undefined })).status, 404, 'no secret configured -> 404');
    assert.equal((await get({}, { ...env, STATS_TOKEN: 'short' })).status, 401, 'a short secret never matches');
    assert.equal((await get({ Authorization: 'Bearer short' }, { ...env, STATS_TOKEN: 'short' })).status, 401);
    const ok = await get({ Authorization: 'Bearer ' + TOKEN, Origin: 'https://evil.example' });
    assert.equal(ok.status, 200);
    assert.equal(ok.headers.get('access-control-allow-origin'), null, 'CORS stays closed');
    assert.ok((await ok.json()).totals, 'returns totals');
    assert.equal((await worker.fetch(new Request('https://r.example/stats', { method: 'POST', headers: { Authorization: 'Bearer ' + TOKEN } }), env, { waitUntil() {} })).status, 404);
    assert.equal((await worker.fetch(new Request('https://r.example/stats', { method: 'OPTIONS', headers: { Origin: 'https://futbolisland.app' } }), env, { waitUntil() {} })).status, 404, 'no preflight');
    assert.equal(SC.bearerOk('Bearer ' + TOKEN, TOKEN), true);
    assert.equal(SC.bearerOk(null, TOKEN), false);
  } finally { Date.now = realNow; }

  // ---- the dev relay ----
  const { startServer } = await import(path.join(ROOT, 'multiplayer/dev-relay/server.mjs'));
  const srv = await startServer({ port: 0, quiet: true, statsToken: 'dev-stats-token-123456' });
  try {
    const base = 'http://127.0.0.1:' + srv.port;
    assert.equal((await fetch(base + '/stats')).status, 401);
    assert.equal((await fetch(base + '/stats', { headers: { Authorization: 'Bearer nope' } })).status, 401);
    await fetch(base + '/party', { method: 'POST' });
    const r = await fetch(base + '/stats', { headers: { Authorization: 'Bearer dev-stats-token-123456' } });
    assert.equal(r.status, 200);
    const body = await r.json();
    assert.equal(body.totals['rl:created'], 1); assert.equal(body.live.parties, 1);
  } finally { srv.close(); }
  const off = await startServer({ port: 0, quiet: true, statsToken: '' });
  try { assert.equal((await fetch('http://127.0.0.1:' + off.port + '/stats')).status, 404, 'no token configured -> 404'); } finally { off.close(); }

  // relay v1.1: out-of-room pose drops are one allow-listed count; summaries from before v1.1 (no roomOob) still add up
  {
    assert.ok(SC.ALLOWED.has('rl:room_oob'));
    const base = { endReason: EndReason.Empty, peak: 2, lenMs: 60000, joins: 2, resumes: 0, kicks: 0, rotates: 0, locks: 0, nameResets: 0, rateCloses: 0, msgs: 10, fails: {}, errs: {} };
    assert.equal(SC.summaryIncrements({ ...base, roomOob: 7 })['rl:room_oob'], 7);
    assert.equal(SC.summaryIncrements(base)['rl:room_oob'], undefined, 'a v1 summary has no room_oob row');
    const restored = new RoomCore({ code: 'K7MQ4R', createdAt: 0, clock: { now: () => 1000 }, random: (n) => new Uint8Array(n), restore: { code: 'K7MQ4R', codeIssuedAt: 0, locked: false, revoked: [], retired: [], stats: { peak: 1, joins: 1, resumes: 0, kicks: 0, rotates: 0, locks: 0, nameResets: 0, rateCloses: 0, msgs: 3, fails: {}, errs: {}, endReason: -1, buckets: {} } } });
    assert.equal(restored.summary().roomOob, 0, 'a snapshot saved by the v1 relay restores with roomOob 0');
  }
  console.log('mp-relay-stats: ok');
})().catch((e) => { console.error(e); process.exit(1); });
