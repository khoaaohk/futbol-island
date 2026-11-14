// QA Nov 14 2026 (overnight multiplayer round 3): away strangers (zzz statues: a backgrounded phone, a closed tab in the relay's away
// grace) no longer take the rigs from the kids playing beside me. lib/graphics/rigCap.ts rigPriority + planNearest, and its use in
// lib/graphics/remoteAvatars.ts recheckCaps. usage: node tests/rig-away.cjs
const assert = require('node:assert/strict'), path = require('node:path'), fs = require('node:fs');
const { loadTs } = require('../multiplayer/dev-relay/loadTs.cjs');
const R = loadTs(path.join(__dirname, '../lib/graphics/rigCap.ts'));
let n = 0; const t = (name, fn) => { try { fn(); n++; } catch (e) { console.error('FAIL', name); throw e; } };
const slot = (id, d, away, pub = true, admitted = false) => ({ id, admitted, plan: 0, pd2: R.rigPriority(d * d, away, pub) });
const plan = (slots, cap) => { const order = []; R.planNearest(slots, order, (s) => s.admitted, cap, 160 * 160, R.RIG_HYST_M); return slots.filter((s) => s.admitted ? s.plan >= 0 : s.plan > 0).map((s) => s.id).sort(); };
t('a party keeps plain distance', () => { assert.equal(R.rigPriority(16, true, false), 16); assert.equal(R.rigPriority(16, false, true), 16); });
t('an away stranger ranks AWAY_RIG_M farther', () => assert.equal(R.rigPriority(16, true, true), 16 + R.AWAY_RIG_M ** 2));
t('five away statues at 3-5 m and two kids playing at 6 m: the two playing get rigs (cap 5)', () => {
  const s = [1, 2, 3, 4, 5].map((i) => slot('away' + i, 3 + i * 0.4, true)).concat([slot('play1', 6, false), slot('play2', 6.3, false)]);
  const got = plan(s, 5); assert.ok(got.includes('play1') && got.includes('play2'), got.join()); assert.equal(got.length, 5);
});
t('already-held away statues are swapped for a nearby player (one per recheck, with hysteresis)', () => {
  const s = [1, 2, 3, 4, 5].map((i) => slot('away' + i, 3 + i * 0.4, true, true, true)).concat([slot('play1', 6, false)]);
  const order = []; R.planNearest(s, order, (x) => x.admitted, 5, 160 * 160, R.RIG_HYST_M);
  assert.equal(s.find((x) => x.id === 'play1').plan, 1); assert.equal(s.filter((x) => x.plan === -1).length, 1);
});
t('free rigs still go to away strangers', () => assert.deepEqual(plan([slot('a', 3, true), slot('b', 4, true)], 5), ['a', 'b']));
t('an away stranger at the edge of range is ring-only', () => assert.deepEqual(plan([slot('far', 150, true)], 5), []));
t('remoteAvatars ranks by rigPriority with the Hidden flag, public only', () => {
  const src = fs.readFileSync(path.join(__dirname, '../lib/graphics/remoteAvatars.ts'), 'utf8');
  assert.match(src, /rigPriority\(\(p\.x-ox\)\*\(p\.x-ox\)\+\(p\.z-oz\)\*\(p\.z-oz\),\(\(p\.flags\?\?0\)&PoseFlag\.Hidden\)!==0,pub\)/);
});
console.log(`rig-away: ${n} checks passed`);
