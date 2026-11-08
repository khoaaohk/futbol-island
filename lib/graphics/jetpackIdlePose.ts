// Jetpack idle gestures on the arms (lib/town/jetpackIdleWave.ts picks which and when). Call right after `rig.update`, like applyRideEmote:
// the one-arm wave, fist pump and salute reuse celebrations.applyRideEmote's right-arm keyframes; the two-arm ones blend both shoulders and elbows
// with the same rig conventions (−x swings the arm forward / up, +side·z lifts it out sideways, −x bends the elbow). No allocation per frame.
import type * as T from 'three';
import {applyRideEmote, joints} from './celebrations';
import {IDLE_GESTURE} from '../town/jetpackIdleWave';

const clamp01 = (v: number) => v < 0 ? 0 : v > 1 ? 1 : v;
function arm(s: T.Object3D, e: T.Object3D, k: number, sx: number, sz: number, el: number) {
  s.rotation.x += (sx - s.rotation.x) * k; s.rotation.y *= 1 - k; s.rotation.z += (sz - s.rotation.z) * k; e.rotation.x += (el - e.rotation.x) * k;
}
/** Poses gesture `kind` (IDLE_GESTURE) at `age` s with weight `w` (0 leaves the rig's hover arms). */
export function applyIdleGesture(root: T.Object3D, kind: number, age: number, w: number) {
  if (kind < 0 || w <= 0) return;
  if (kind === IDLE_GESTURE.Wave) { applyRideEmote(root, 0, age, w); return; }
  if (kind === IDLE_GESTURE.FistPump) { applyRideEmote(root, 1, age, w); return; }
  if (kind === IDLE_GESTURE.Salute) { applyRideEmote(root, 3, age, w); return; }
  const j = joints(root); if (!j) return;
  const k = clamp01(w);
  if (kind === IDLE_GESTURE.BothWave) { // both hands up and waving, out of step
    const a = Math.sin(age * 9), b = Math.sin(age * 9 + 1.6);
    arm(j.rs, j.re, k, -.3, 2.55 + .2 * a, -.2 - .12 * a); arm(j.ls, j.le, k, -.3, -(2.55 + .2 * b), -.2 - .12 * b);
  } else if (kind === IDLE_GESTURE.Swirl) { // a slow "hula" sway: arms out to one side and the other, forearms rolling
    const s = Math.sin(age * 2.4), c = Math.cos(age * 4.8);
    arm(j.rs, j.re, k, -.9 - .35 * s, 1.15 + .45 * s, -.55 - .25 * c); arm(j.ls, j.le, k, -.9 + .35 * s, -(1.15 - .45 * s), -.55 + .25 * c);
  } else if (kind === IDLE_GESTURE.Hips) { // hands on hips, a little proud lean of the elbows
    const p = .04 * Math.sin(age * 3);
    arm(j.rs, j.re, k, .35, .62 + p, -1.75); arm(j.ls, j.le, k, .35, -(.62 + p), -1.75);
  } else if (kind === IDLE_GESTURE.Cheer) { // both arms up in a V, pumping
    const b = Math.max(0, Math.sin(age * 8));
    arm(j.rs, j.re, k, -2.85 - .15 * b, .42, -.25 - .3 * b); arm(j.ls, j.le, k, -2.85 - .15 * b, -.42, -.25 - .3 * b);
  }
}
