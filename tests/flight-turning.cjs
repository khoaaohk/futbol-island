// Sustained turning in free flight: a banked orbit (upright-ish, rolled into the turn) instead of the flat Superman.
// Straight flight must stay bit-identical to the pose before the orbit existed (golden hash below).
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const vm = require('node:vm');
const path = require('node:path');
const crypto = require('node:crypto');
const DT = 1 / 60;

/** Deterministic loader: every module shares one seeded Math so the random cruise variants replay exactly. */
function makeLoader(resolveFile = f => f) {
  let seed = 11;
  const SeededMath = Object.create(Math);
  SeededMath.random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const cache = new Map();
  const load = file => {
    file = resolveFile(file);
    if (cache.has(file)) return cache.get(file);
    const mod = { exports: {} };
    cache.set(file, mod.exports);
    vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText,
      { module: mod, exports: mod.exports, Math: SeededMath, Float32Array, Float64Array, Uint8Array, Uint16Array, Int32Array, Map, Set, WeakMap, performance, console,
        require: id => id.startsWith('.') ? load(path.resolve(path.dirname(file), id + (id.endsWith('.ts') ? '' : '.ts'))) : require(id) });
    cache.set(file, mod.exports);
    return mod.exports;
  };
  return load;
}

/** Straight flight only: hover, accelerate along a fixed heading, long cruise (variant switches), brake to hover. */
function straightRun(load, root = 'lib/graphics') {
  const { createFlightMotion } = load(path.resolve(root, 'flightMotion.ts'));
  const { createPlayer } = load(path.resolve(root, 'player.ts'));
  const fm = createFlightMotion(), rig = createPlayer('flight-turning', 'home', true, true);
  const heading = .6, values = [];
  let x = 0, z = 0, speed = 0;
  for (let i = 0; i < 60 * 18; i++) {
    const t = i * DT;
    const want = t < 1 ? 0 : t < 16 ? 34 : 0;
    speed += Math.max(-40 * DT, Math.min(40 * DT, want - speed));
    const vx = Math.sin(heading) * speed, vz = Math.cos(heading) * speed;
    x += vx * DT; z += vz * DT;
    const pose = fm.update(DT, t, vx, vz, heading, 'cruise', 1, false, x, z, 28, 'idle', 'classic');
    rig.update(x, z, DT, t, false, { travelMode: 'jetpack', facing: heading, flight: pose });
    values.push(pose.pitch, pose.roll, pose.bob, pose.style ? pose.style.total : -1);
    if (i % 6 === 0) rig.root.traverse(n => { if (n.name) values.push(n.rotation.x, n.rotation.y, n.rotation.z, n.position.y); });
  }
  rig.dispose();
  return crypto.createHash('sha1').update(values.map(v => (Object.is(v, -0) ? 0 : v).toPrecision(12)).join(',')).digest('hex');
}

module.exports = { makeLoader, straightRun };
if (require.main !== module) return;

const T = require('three');
const load = makeLoader();
const { createFlightMotion } = load(path.resolve('lib/graphics/flightMotion.ts'));
const { createPlayer } = load(path.resolve('lib/graphics/player.ts'));
const { FLIGHT_POSES, ORBIT_POSE } = load(path.resolve('lib/graphics/flightPoses.ts'));
assert.equal(FLIGHT_POSES[ORBIT_POSE], 'orbit');
/** Flat Superman lies at ~1.38 rad; anything above this reads as "lying flat". */
const FLAT = .8;

/** Fly a scripted yaw-rate profile w(t) at speed v(t); returns per-frame samples (and the rig when asked). */
function fly({ v = () => 28, w, T: seconds, hz = 60, reduced = false, rig = false }) {
  const dt = 1 / hz, fm = createFlightMotion(), body = rig ? createPlayer('flight-turning-' + hz, 'home', true, true) : null, out = [];
  let x = 0, z = 0, h = 0;
  for (let i = 0, n = Math.round(seconds * hz); i < n; i++) {
    const t = i * dt, om = w(t), s = v(t);
    h += om * dt;
    const vx = Math.sin(h) * s, vz = Math.cos(h) * s;
    x += vx * dt; z += vz * dt;
    const pose = fm.update(dt, t, vx, vz, h, 'cruise', 1, reduced, x, z, 28, 'idle', 'classic');
    if (body) body.update(x, z, dt, t, reduced, { travelMode: 'jetpack', facing: h, flight: pose });
    const st = fm.poses.style;
    out.push({ t, om, yaw: h, pitch: pose.pitch, roll: pose.roll, orbit: st.weights[ORBIT_POSE], sum: Array.from(st.weights).reduce((a, b) => a + b, 0), dominant: st.dominant });
  }
  return { out, body };
}
/** World-space tilt of the body's up axis toward the turn centre (Town applies root rotation order YXZ). */
function tiltTowardCentre(s) {
  const q = new T.Quaternion().setFromEuler(new T.Euler(s.pitch, s.yaw, s.roll, 'YXZ'));
  const up = new T.Vector3(0, 1, 0).applyQuaternion(q);
  // Yaw increasing turns toward local +x (left); the centre lies on that side.
  const side = Math.sign(s.om), centre = new T.Vector3(Math.cos(s.yaw), 0, -Math.sin(s.yaw)).multiplyScalar(side);
  return up.dot(centre);
}
const after = (out, t) => out.filter(s => s.t >= t);
const circle = (w, from = 1) => t => (t > from ? w : 0);

// 1. Straight flight is bit-identical to the pose before the orbit existed (golden recorded from the previous code).
assert.equal(straightRun(makeLoader()), '8d0db7499fa5316f034d405896d9633796f9d9c1', 'straight flight pose unchanged');

// 2. Sustained fast circles either way: upright-ish (never flat), banked toward the centre, capped.
for (const [v, w] of [[28, 3], [28, -3], [34, 1.2], [34, -1.2], [20, 2]]) {
  const { out } = fly({ v: () => v, w: circle(w), T: 8 });
  const settled = after(out, 4.5);
  assert(settled.every(s => s.dominant === 'orbit'), `v${v} w${w}: a long circle settles into the banked orbit`);
  const maxPitch = Math.max(...settled.map(s => s.pitch));
  assert(maxPitch < FLAT && maxPitch > .3, `v${v} w${w}: torso pitched forward but not flat (max ${maxPitch.toFixed(2)} rad)`);
  const tilt = settled.map(tiltTowardCentre), minTilt = Math.min(...tilt);
  assert(minTilt > .2, `v${v} w${w}: body banks toward the turn centre (min tilt ${minTilt.toFixed(2)})`);
  assert(settled.every(s => Math.sign(s.roll) === -Math.sign(w)), `v${v} w${w}: roll sign points into the turn`);
  assert(settled.every(s => Math.abs(s.roll) < .62), `v${v} w${w}: bank is capped`);
  assert(out.every(s => s.sum <= 1.0001), 'pose weights never exceed 1');
}

// 3. Slow circling / hovering while turning: nearly upright with a gentle bank into the turn.
{
  const { out } = fly({ v: () => 4, w: circle(1.2), T: 8 });
  const settled = after(out, 4.5), mean = settled.reduce((a, s) => a + s.roll, 0) / settled.length;
  assert(settled.every(s => s.pitch < .25), 'slow circle stays nearly upright');
  assert(mean < -.03 && settled.every(s => Math.abs(s.roll) < .22), 'slow circle banks gently into the turn (mean ' + mean.toFixed(3) + ')');
}

// 4. Hysteresis: quick direction changes and S-turns never flip into the orbit; a wide gentle curve stays Superman.
{
  const quick = fly({ w: t => (t > 2 && t < 2.52 ? 3 : 0), T: 5 }).out;
  assert(Math.max(...quick.map(s => s.orbit)) < .02 && quick.every(s => s.dominant !== 'orbit'), 'a quick 90° turn keeps the flying pose');
  const uturn = fly({ w: t => (t > 2 && t < 3.05 ? 3 : 0), T: 6 }).out;
  assert(Math.max(...uturn.map(s => s.orbit)) < .2 && uturn.every(s => s.dominant !== 'orbit'), 'a U-turn only hints at the bank');
  const slalom = fly({ w: t => (t > 1 ? (Math.floor(t / .6) % 2 ? 3 : -3) : 0), T: 8 }).out;
  assert(Math.max(...slalom.map(s => s.orbit)) < .02, 'alternating S-turns never charge the orbit');
  const wide = fly({ v: () => 34, w: circle(.45), T: 8 }).out;
  assert(after(wide, 4).every(s => s.orbit === 0 && s.pitch > 1.2), 'a wide gentle curve keeps the flat flying pose');
}

// 5. Continuity and frame-rate independence through entry and exit (circle 1–7 s, then straight).
{
  const profile = t => (t > 1 && t < 7 ? 3 : 0), runs = {};
  for (const hz of [30, 60, 120]) {
    const { out } = fly({ w: profile, T: 10, hz });
    runs[hz] = out;
    let maxPitchRate = 0, maxRollRate = 0, maxOrbitStep = 0;
    // From 0.9 s: the start (instant 28 m/s from rest) is the pre-existing hover→Superman blend, not the orbit.
    for (let i = Math.round(.9 * hz); i < out.length; i++) {
      const dt = out[i].t - out[i - 1].t;
      maxPitchRate = Math.max(maxPitchRate, Math.abs(out[i].pitch - out[i - 1].pitch) / dt);
      maxRollRate = Math.max(maxRollRate, Math.abs(out[i].roll - out[i - 1].roll) / dt);
      maxOrbitStep = Math.max(maxOrbitStep, Math.abs(out[i].orbit - out[i - 1].orbit) / dt);
    }
    // Pitch swings ~0.85 rad between Superman and the orbit; eased over ~1 s, not popped.
    assert(maxPitchRate < 2.2, `${hz} Hz: pitch blends smoothly (${maxPitchRate.toFixed(2)} rad/s)`);
    assert(maxRollRate < 3.5, `${hz} Hz: roll blends smoothly (${maxRollRate.toFixed(2)} rad/s)`);
    assert(maxOrbitStep < 2.5, `${hz} Hz: orbit weight has no jumps (${maxOrbitStep.toFixed(2)}/s)`);
    const at = t => out.find(s => s.t >= t - 1e-9);
    assert(at(6.5).dominant === 'orbit' && at(9.5).dominant !== 'orbit' && at(9.5).pitch > 1.2, `${hz} Hz: enters the orbit and returns to flat flight`);
  }
  // Tolerance covers the half-frame sampling of the yaw-rate step at 30 Hz (the flight code damps exactly per dt).
  for (const t of [2.5, 3, 4, 7.5, 8]) {
    const a = runs[30].find(s => s.t >= t - 1e-9), b = runs[120].find(s => s.t >= t - 1e-9);
    assert(Math.abs(a.pitch - b.pitch) < .08 && Math.abs(a.orbit - b.orbit) < .1, `30 Hz and 120 Hz agree at ${t}s (pitch ${a.pitch.toFixed(3)}/${b.pitch.toFixed(3)}, orbit ${a.orbit.toFixed(3)}/${b.orbit.toFixed(3)})`);
  }
}

// 6. Rig: head turns into the turn, inside knee tucks, outside arm opens; mirrored for the other direction.
for (const w of [3, -3]) {
  const { body } = fly({ w: circle(w), T: 6, rig: true });
  const j = n => body.root.getObjectByName(n).rotation, inside = w > 0 ? 'right' : 'left', outside = w > 0 ? 'left' : 'right';
  const outward = n => j(n).z * (n.startsWith('right') ? 1 : -1);
  assert(Math.sign(j('player-head').y) === Math.sign(w) && Math.abs(j('player-head').y) > .3, 'head looks toward the centre');
  assert(j(inside + '-knee').x > j(outside + '-knee').x + .4, 'inside knee tucks, outside leg trails');
  assert(j(inside + '-hip').x < j(outside + '-hip').x - .4, 'inside thigh comes forward, outside thigh trails back');
  assert(outward(outside + '-shoulder') > outward(inside + '-shoulder') + .6, 'outside arm opens for balance, inside arm stays in');
  body.root.traverse(n => assert([...n.position, ...n.quaternion].every(Number.isFinite), 'finite rig'));
  body.dispose();
}

// 7. Reduced motion: still upright while circling, with a softer bank.
{
  const { out } = fly({ w: circle(3), T: 8, reduced: true });
  const settled = after(out, 5);
  assert(settled.every(s => s.pitch < FLAT && s.roll < 0 && s.roll > -.32), 'reduced motion: upright, softer bank');
}
console.log('FLIGHT_TURNING_PASS banked orbit (upright, bank into turn, head/limbs), hysteresis, slow circle, continuity at 30/60/120 Hz, reduced motion, straight flight unchanged');
