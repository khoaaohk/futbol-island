// Spawns the dev relay on a free port, runs 6 bots (incl. a speed cheater and a flooder), then a FULL 20-bot party (21st refused as Full) and prints the measured message rates.
// Run: node --experimental-websocket scripts/mp-relay-smoke.mjs   (< 30 s, kills only its own server PID)
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runBots } from '../multiplayer/bots/bot.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
if (typeof WebSocket === 'undefined') { console.error('run with: node --experimental-websocket'); process.exit(2); }

const srv = spawn(process.execPath, [path.join(ROOT, 'multiplayer/dev-relay/server.mjs')], {
  env: { ...process.env, MP_PORT: '0' }, stdio: ['ignore', 'pipe', 'inherit'],
});
let srvOut = '';
srv.stdout.on('data', (d) => { srvOut += d; });
const killServer = () => { try { srv.kill('SIGTERM'); } catch { /* already gone */ } };
process.on('exit', killServer);
const hardStop = setTimeout(() => { console.error('smoke: timeout'); killServer(); process.exit(1); }, 50000);

try {
  const port = await new Promise((resolve, reject) => {
    let acc = '';
    srv.stdout.on('data', (d) => {
      acc += d;
      const m = /"listening":(\d+)/.exec(acc);
      if (m) resolve(Number(m[1]));
    });
    srv.on('exit', () => reject(new Error('dev relay exited early')));
    setTimeout(() => reject(new Error('dev relay did not start')), 8000);
  });
  const base = 'http://127.0.0.1:' + port;

  const created = await fetch(base + '/party', { method: 'POST' });
  assert.equal(created.status, 201);
  const { code, hostKey, expiresAt } = await created.json();
  assert.match(code, /^[23456789BCDFGHJKMNPQRSTVWXYZ]{6}$/);
  assert.ok(hostKey && expiresAt > Date.now());
  assert.deepEqual(await (await fetch(base + '/party/' + code)).json(), { open: true, full: false });
  assert.equal((await fetch(base + '/party/ZZZZZZ')).status, 404);
  assert.equal((await fetch(base + '/party/' + code, { headers: { Origin: 'https://evil.example' } })).status, 403);

  const common = { url: base, code, ms: 3000 };
  const group = Promise.all([
    runBots({ ...common, n: 1, hostKey, path: 'circle' }), // host
    runBots({ ...common, n: 3, path: 'line' }), // three normal friends
    runBots({ ...common, n: 1, cheat: 'speed' }),
    runBots({ ...common, n: 1, cheat: 'flood' }),
  ]);
  await new Promise((r) => setTimeout(r, 1500));
  const status = await (await fetch(base + '/party/' + code)).json();
  assert.equal(status.size, undefined, 'the info endpoint does not reveal the party size');
  assert.equal(status.full, false, 'six of twenty seats are taken: not full');

  const [[host], friends, [cheater], [flooder]] = await group;
  const all = [host, ...friends, cheater];
  for (const b of all) {
    assert.ok(b.welcomed, 'welcomed');
    assert.equal(b.seen, 5, `bot ${b.index} sees 5 others (saw ${b.seen})`);
  }
  assert.ok(host.host, 'hostKey bot is host');
  assert.equal(host.posesFrom.length >= 3, true, 'host receives friends poses');
  for (const b of [host, ...friends]) {
    assert.ok(!b.posesFrom.includes(b.id), 'no self echo');
    for (const [id, maxX] of Object.entries(b.maxXFrom)) {
      assert.ok(maxX < 3000, `bot ${b.index} saw a cheat pose (x=${maxX}) from ${id}`);
    }
  }
  assert.ok(cheater.sent > 3);
  assert.equal(flooder.closeCode, 4002, 'flood bot closed by the relay (' + flooder.closeCode + ')');
  assert.ok(flooder.errors.includes(1), 'flooder got RateLimited');
  // Rotate: the new code is joinable, the old one is retired (404 info, /ws only for a resume token or the host key)
  {
    const p2 = await (await fetch(base + '/party', { method: 'POST' })).json();
    const wsBase = 'ws://127.0.0.1:' + port + '/party/';
    const open = (c) => new Promise((res, rej) => { const w = new WebSocket(wsBase + c + '/ws'); const msgs = []; w.onmessage = (e) => msgs.push(JSON.parse(e.data)); w.onopen = () => res({ w, msgs }); w.onerror = () => rej(new Error('ws')); });
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const h = await open(p2.code); h.w.send(JSON.stringify([0, 1, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], null, p2.hostKey])); await wait(300);
    const tok = h.msgs.find((m) => m[0] === 20)[3];
    h.w.send(JSON.stringify([6])); await wait(300);
    const newCode = h.msgs.find((m) => m[0] === 27)[1];
    assert.equal((await fetch(base + '/party/' + p2.code)).status, 404, 'retired code is not joinable');
    assert.equal((await fetch(base + '/party/' + newCode)).status, 200);
    const stranger = await open(p2.code); stranger.w.send(JSON.stringify([0, 1, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], null, null])); await wait(300);
    assert.ok(stranger.msgs.some((m) => m[0] === 29 && m[1] === 3) || !stranger.msgs.some((m) => m[0] === 20), 'stranger on a retired code is not welcomed');
    assert.ok(!stranger.msgs.some((m) => m[0] === 20));
    h.w.close(); await wait(100);
    const back = await open(p2.code); back.w.send(JSON.stringify([0, 1, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], tok, null])); await wait(300);
    assert.ok(back.msgs.some((m) => m[0] === 20), 'resume through the retired code');
    back.w.close();
  }
  // first-name nick: normalised in the roster, host can reset it, the relay's log lines never contain it
  {
    const p3 = await (await fetch(base + '/party', { method: 'POST' })).json();
    const wsBase = 'ws://127.0.0.1:' + port + '/party/';
    const open = (c) => new Promise((res, rej) => { const w = new WebSocket(wsBase + c + '/ws'); const msgs = []; w.onmessage = (e) => msgs.push(JSON.parse(e.data)); w.onopen = () => res({ w, msgs }); w.onerror = () => rej(new Error('ws')); });
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const L = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const h = await open(p3.code); h.w.send(JSON.stringify([0, 1, L, null, p3.hostKey, null, 'SMOKEKID'])); await wait(300);
    const g = await open(p3.code); g.w.send(JSON.stringify([0, 1, L, null, null, null, 'Emma'])); await wait(300);
    const hid = h.msgs.find((m) => m[0] === 20)[2];
    const gid = g.msgs.find((m) => m[0] === 20)[2];
    assert.equal(g.msgs.find((m) => m[0] === 20)[7].find((m) => m[0] === hid)[5], 'Smokekid', 'roster carries the normalised nick');
    assert.equal(h.msgs.find((m) => m[0] === 21)[1][5], 'Emma');
    h.w.send(JSON.stringify([10, gid])); await wait(300);
    assert.ok(g.msgs.some((m) => m[0] === 31 && m[1] === gid && m[2] === null), 'Renamed broadcast');
    g.w.send(JSON.stringify([10, hid])); await wait(300);
    assert.ok(g.msgs.some((m) => m[0] === 29 && m[1] === 6), 'guest ResetName -> NotHost');
    // the name is required for new clients: a bad / missing name is refused with BadName (9); an old nick-less Hello still joins (colour only); an old animal wish is ignored
    const bad = await open(p3.code); bad.w.send(JSON.stringify([0, 1, L, null, null, null, 'Emma Lou'])); await wait(300);
    assert.ok(bad.msgs.some((m) => m[0] === 29 && m[1] === 9), 'invalid name -> BadName');
    const old = await open(p3.code); old.w.send(JSON.stringify([0, 1, L, null, null, 3])); await wait(300);
    const ow = old.msgs.find((m) => m[0] === 20); assert.ok(ow, 'old Hello (animal wish, no name) still joins');
    assert.equal(ow[7].find((m) => m[0] === ow[2])[1][1], 0, 'animal wish ignored: reserved slot is 0');
    assert.equal(ow[7].find((m) => m[0] === ow[2])[5], null, 'no name -> colour name only');
    old.w.close(); bad.w.close();
    h.w.close(); g.w.close();
  }
  assert.ok(!/smokekid|emma/i.test(srvOut), 'no nick in the relay log');
  // relay v1.1 rooms (docs/multiplayer-rooms-design.md 2.3): two bots walking in the museum hear each other at 5 Hz; an island bot
  // hears them only on the 1 Hz beacon (and they hear the island bot only on the beacon); an out-of-room pose is dropped, not kicked
  {
    const p4 = await (await fetch(base + '/party', { method: 'POST' })).json();
    const wsBase = 'ws://127.0.0.1:' + port + '/party/';
    const open = (c) => new Promise((res, rej) => { const w = new WebSocket(wsBase + c + '/ws'); const msgs = []; w.onmessage = (e) => msgs.push(JSON.parse(e.data)); w.onopen = () => res({ w, msgs }); w.onerror = () => rej(new Error('ws')); });
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const L = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const isl = await open(p4.code); isl.w.send(JSON.stringify([0, 1, L, null, p4.hostKey, null, 'Ana']));
    const ra = await open(p4.code); ra.w.send(JSON.stringify([0, 1, L, null, null, null, 'Bo']));
    const rb = await open(p4.code); rb.w.send(JSON.stringify([0, 1, L, null, null, null, 'Cy']));
    await wait(300);
    const id = (b) => b.msgs.find((m) => m[0] === 20)[2];
    const [ii, ia, ib] = [id(isl), id(ra), id(rb)];
    const heard = (b, who, from) => b.msgs.slice(from).filter((m) => { if (m[0] !== 23) return false; for (let k = 2; k < m.length; k += 9) if (m[k] === who) return true; return false; }).length;
    const mark = [isl.msgs.length, ra.msgs.length, rb.msgs.length];
    const MUSEUM = 6, INDOORS = 4, WALK = 0; // RoomCode.Museum, Zone.Indoors, Mode.Walk
    for (let i = 0; i < 15; i++) { // 3 s at 5 Hz
      isl.w.send(JSON.stringify([1, i, 1000 + i * 8, 0, 0, 0, 0, WALK, 0, 0]));
      ra.w.send(JSON.stringify([1, i, i * 8, -350, 0, 0, MUSEUM, WALK, INDOORS, 0]));
      rb.w.send(JSON.stringify([1, i, i * 8, -350, 20, 0, MUSEUM, WALK, INDOORS, 0]));
      await wait(200);
    }
    await wait(250);
    const aHearsB = heard(ra, ib, mark[1]), bHearsA = heard(rb, ia, mark[2]), islHearsA = heard(isl, ia, mark[0]), aHearsIsl = heard(ra, ii, mark[1]);
    assert.ok(aHearsB >= 10 && bHearsA >= 10, 'same room: ~5 Hz (' + aHearsB + ', ' + bHearsA + ' frames in 3 s)');
    assert.ok(islHearsA >= 1 && islHearsA <= 4, 'island bot hears room walking only on the 1 Hz beacon (' + islHearsA + ' in 3 s)');
    assert.ok(aHearsIsl >= 1 && aHearsIsl <= 4, 'room bot hears island running only on the beacon (' + aHearsIsl + ' in 3 s)');
    for (let i = 15; i < 25; i++) { ra.w.send(JSON.stringify([1, i, 300, -350, 0, 0, 8, WALK, INDOORS, 0])); await wait(60); } // Konbini x 30 m: out of the room
    await wait(300);
    assert.ok(!ra.msgs.some((m) => m[0] === 29), 'out-of-room poses: no error, no kick');
    const lastA = rb.msgs.filter((m) => m[0] === 23).map((m) => { for (let k = 2; k < m.length; k += 9) if (m[k] === ia) return m[k + 1]; return null; }).filter((x) => x !== null).pop();
    assert.ok(lastA < 300, 'the out-of-room pose was never relayed (last x ' + lastA + ')');
    isl.w.close(); ra.w.close(); rb.w.close();
    console.log('mp-relay-smoke: rooms: same-room ' + aHearsB + '/' + bHearsA + ' frames in 3 s, island<->room ' + islHearsA + '/' + aHearsIsl + ' (beacon only)');
  }
  // 20 players: every seat taken by a moving bot spread 30 m apart, the 21st is refused, interest management keeps frames small
  {
    const big = await (await fetch(base + '/party', { method: 'POST' })).json();
    const DUR = 5000;
    const bigGroup = runBots({ url: base, code: big.code, hostKey: big.hostKey, n: 20, ms: DUR, spread: 300, stagger: 25 });
    await new Promise((r) => setTimeout(r, 1500));
    const st = await (await fetch(base + '/party/' + big.code)).json();
    assert.equal(st.full, true, 'all 20 seats taken');
    const twentyFirst = (await runBots({ url: base, code: big.code, n: 1, ms: 500 }))[0];
    assert.ok(twentyFirst.errors.includes(2), '21st joiner gets Full: ' + JSON.stringify(twentyFirst.errors));
    assert.equal(twentyFirst.welcomed, false);
    const bots = await bigGroup;
    assert.equal(bots.filter((b) => b.welcomed).length, 20, '20 bots welcomed');
    for (const b of bots) {
      assert.equal(b.seen, 19, `bot ${b.index} sees all 19 others on the roster (saw ${b.seen})`);
      assert.ok(b.posesFrom.length >= 12, `bot ${b.index} gets poses from at least its 12 nearest (${b.posesFrom.length})`);
      assert.ok(!b.posesFrom.includes(b.id), 'no self echo');
      assert.ok(b.maxFrame < 2048, 'server frames stay small (' + b.maxFrame + ' B)');
      assert.equal(b.errors.length, 0, 'no errors for a well-behaved bot: ' + JSON.stringify(b.errors));
    }
    const secs = (DUR - 800) / 1000; // bots pose from their Welcome to ~DUR
    const inMsgs = bots.reduce((a, b) => a + b.sent, 0);
    const outFrames = bots.reduce((a, b) => a + b.msgs, 0), outEntries = bots.reduce((a, b) => a + b.poseEntries, 0), outBytes = bots.reduce((a, b) => a + b.bytes, 0);
    const pf = bots.reduce((a, b) => a + b.poseFrames, 0);
    const mid = bots[10];
    console.log('mp-relay-smoke: 20 bots: incoming ~' + (inMsgs / (DUR / 1000)).toFixed(0) + ' msg/s per party (' + (inMsgs / 20 / (DUR / 1000)).toFixed(1) + ' per player), outgoing ~' +
      (outFrames / (DUR / 1000)).toFixed(0) + ' frames/s per party (' + (outFrames / 20 / (DUR / 1000)).toFixed(1) + ' per client), pose entries/frame ' + (outEntries / Math.max(1, pf)).toFixed(1) +
      ', ' + (outBytes / 20 / (DUR / 1000) / 1024).toFixed(2) + ' KB/s per client, biggest frame ' + Math.max(...bots.map((b) => b.maxFrame)) + ' B; mid-party bot saw ' + mid.poseFrames + ' Poses frames');
    void secs;
  }
  console.log('mp-relay-smoke: ok (port ' + port + ', 6 bots + 20-bot party, 21st Full, cheat dropped, flood closed, v1.1 room interest)');
} catch (e) {
  console.error('mp-relay-smoke: FAILED', e && e.stack ? e.stack : e);
  process.exitCode = 1;
} finally {
  clearTimeout(hardStop);
  killServer();
  setTimeout(() => process.exit(process.exitCode ?? 0), 100).unref();
}
