// Spawns the dev relay on a free port, runs 6 bots (incl. a speed cheater and a flooder) and a 7th joiner.
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
const hardStop = setTimeout(() => { console.error('smoke: timeout'); killServer(); process.exit(1); }, 28000);

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
  assert.equal(status.full, true);
  const seventh = (await runBots({ ...common, n: 1, ms: 500 }))[0];
  assert.ok(seventh.errors.includes(2), '7th joiner gets Full: ' + JSON.stringify(seventh.errors));
  assert.equal(seventh.welcomed, false);

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
    const g = await open(p3.code); g.w.send(JSON.stringify([0, 1, L, null, null, 3, 'Emma'])); await wait(300);
    const hid = h.msgs.find((m) => m[0] === 20)[2];
    const gid = g.msgs.find((m) => m[0] === 20)[2];
    assert.equal(g.msgs.find((m) => m[0] === 20)[7].find((m) => m[0] === hid)[5], 'Smokekid', 'roster carries the normalised nick');
    assert.equal(h.msgs.find((m) => m[0] === 21)[1][5], 'Emma');
    h.w.send(JSON.stringify([10, gid])); await wait(300);
    assert.ok(g.msgs.some((m) => m[0] === 31 && m[1] === gid && m[2] === null), 'Renamed broadcast');
    g.w.send(JSON.stringify([10, hid])); await wait(300);
    assert.ok(g.msgs.some((m) => m[0] === 29 && m[1] === 6), 'guest ResetName -> NotHost');
    h.w.close(); g.w.close();
  }
  assert.ok(!/smokekid|emma/i.test(srvOut), 'no nick in the relay log');
  console.log('mp-relay-smoke: ok (port ' + port + ', 6 bots, 7th Full, cheat dropped, flood closed)');
} catch (e) {
  console.error('mp-relay-smoke: FAILED', e && e.stack ? e.stack : e);
  process.exitCode = 1;
} finally {
  clearTimeout(hardStop);
  killServer();
  setTimeout(() => process.exit(process.exitCode ?? 0), 100).unref();
}
