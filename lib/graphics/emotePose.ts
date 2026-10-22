// Body moves for the 4-second emotes (user, Oct 22 2026), shared by you, a friend and a townsperson: arms on the named shoulder / elbow joints right
// after `rig.update` (like celebrations.ts) plus the rig's own `jump` hop. Cheap: no allocation but the hop object, no geometry.
// Rig conventions: shoulder -x swings the arm forward / up, +side*z lifts it out sideways, elbow -x bends it.
import type * as T from 'three';
import {EMOTE, emoteCalled, emoteCelebration, emoteClap, emoteHop} from '../town/emoteReact';
import {applyApplause, applyCelebrationArms, joints} from './celebrations';

const clamp01 = (v: number) => v < 0 ? 0 : v > 1 ? 1 : v;
const smooth = (v: number) => { const t = clamp01(v); return t * t * (3 - 2 * t); };
const ramp = (age: number, dur: number) => Math.max(0, Math.min(1, age / .25, (dur - age) / .25));

/** Dance, one arm pose per key at u = move time / length: [leftShoulderX, leftShoulderZ, leftElbow, rightShoulderX, rightShoulderZ, rightElbow]. */
const DANCE_U = [0, .1, .2, .3, .4, .5, .62, .75, .88, 1];
const DANCE_KEYS: readonly (readonly number[])[] = [
  [-.3, -.5, -1.2, -2.7, .5, -.3],   // right arm up
  [-2.7, -.5, -.3, -.3, .5, -1.2],   // left arm up
  [-.3, -.5, -1.2, -2.7, .5, -.3],
  [-2.7, -.5, -.3, -.3, .5, -1.2],
  [-.2, -.9, -1.9, -.2, .9, -1.9],   // hands on hips
  [-.9, -1.2, -.2, -.9, 1.2, -.2],   // arms out for the spin
  [-.9, -1.4, -.1, -.9, 1.4, -.1],
  [-.4, -1.4, -.1, -.4, 1.4, -.1],   // arms low and wide, swaying
  [-2.85, -.42, -.25, -2.85, .42, -.25], // arms up
  [-2.85, -.42, -.25, -2.85, .42, -.25], // the final pose
];
const mix = [0, 0, 0, 0, 0, 0];
function danceArms(u: number, age: number) {
  let i = 0; while (i < DANCE_U.length - 2 && u > DANCE_U[i + 1]) i++;
  const f = smooth((u - DANCE_U[i]) / (DANCE_U[i + 1] - DANCE_U[i])), a = DANCE_KEYS[i], b = DANCE_KEYS[i + 1];
  for (let k = 0; k < 6; k++) mix[k] = a[k] + (b[k] - a[k]) * f;
  if (u < .4) { const pump = .22 * Math.sin(age * Math.PI * 4); mix[0] += pump; mix[3] -= pump; } // the bounce pumps the arms
  else if (u > .62 && u < .88) { const sway = .3 * Math.sin(age * Math.PI * 3); mix[1] += sway; mix[4] += sway; }
  return mix;
}
/** The dance's spin (the 0..1 turn) for move progress u: one full turn in the middle (u .5 - .75). */
export const danceTurn = (u: number): number => smooth((u - .5) / .25);
/** The dance's hop: a bounce on the beat in the first half, one big jump into the spin, small sways after. */
function danceJump(u: number, age: number): {progress: number; height: number} | undefined {
  if (u < .4) return {progress: (age * 2) % 1, height: .1};
  if (u >= .48 && u < .62) return {progress: clamp01((u - .48) / .14), height: .26};
  if (u >= .75 && u < .88) return {progress: ((age * 2) % 1), height: .08};
  return undefined;
}
const set = (s: T.Object3D, e: T.Object3D, k: number, sx: number, sz: number, el: number) => {
  s.rotation.x += (sx - s.rotation.x) * k; s.rotation.y *= 1 - k; s.rotation.z += (sz - s.rotation.z) * k; e.rotation.x += (el - e.rotation.x) * k;
};
export const emoteHasMove = (kind: number) => kind === EMOTE.PassToMe || kind === EMOTE.Space || kind === EMOTE.Laugh || kind === EMOTE.Dance || kind === EMOTE.Thanks;
/** Arms for the moves that are not the wave / celebration / clap: Pass to me (point), Space (palms out), Laugh (hands on belly, shaking), Dance, Thanks (hands together, bowing). Call after `rig.update`. */
export function applyEmoteMove(root: T.Object3D, kind: number, age: number, dur: number) {
  if (!emoteHasMove(kind)) return;
  const j = joints(root); if (!j) return;
  const k = ramp(age, dur);
  if (k <= 0) return;
  if (kind === EMOTE.Dance) {
    const m = danceArms(clamp01(age / dur), age);
    set(j.ls, j.le, k, m[0], m[1], m[2]); set(j.rs, j.re, k, m[3], m[4], m[5]); return;
  }
  if (kind === EMOTE.Laugh) { // hands on the belly, shaking with each ha
    const sh = Math.sin(age * 26) * .09, nod = .12 * Math.sin(age * 13);
    set(j.ls, j.le, k, -.75 + sh, -.25, -1.5 + nod); set(j.rs, j.re, k, -.75 - sh, .25, -1.5 - nod); return;
  }
  if (kind === EMOTE.Thanks) { // palms together at the chest, three small bows
    const bow = .5 + .5 * Math.sin(age / dur * Math.PI * 6 - Math.PI / 2);
    set(j.ls, j.le, k, -.95 - .25 * bow, -.12, -1.95); set(j.rs, j.re, k, -.95 - .25 * bow, .12, -1.95); return;
  }
  if (kind === EMOTE.PassToMe) { // the right arm points out, jabbing twice a second
    const jab = .12 * Math.max(0, Math.sin(age * Math.PI * 4));
    set(j.rs, j.re, k, -1.5 - jab, .25, -.15); return;
  }
  // Space: both arms forward, palms out, pushing gently
  const push = .1 * Math.sin(age * Math.PI * 3);
  set(j.ls, j.le, k, -1.45 + push, -.28, -.1); set(j.rs, j.re, k, -1.45 + push, .28, -.1);
}
export interface EmoteBody {called: number; jump: {progress: number; height: number} | undefined}
const body: EmoteBody = {called: 0, jump: undefined};
/** The rig-level part of an emote at `age` (shared output object, read at once): the raised "called" arm and the hop. */
export function emoteBody(kind: number, age: number, dur: number): EmoteBody {
  body.called = emoteCalled(kind, age, dur); body.jump = undefined;
  const c = emoteCelebration(kind, age, dur);
  if (c >= 0) body.jump = emoteHop(c);
  else if (kind === EMOTE.Dance) body.jump = danceJump(clamp01(age / dur), age);
  else if (kind === EMOTE.Laugh) body.jump = {progress: (age * 3) % 1, height: .05};
  return body;
}
/** Every arm pose an emote needs on the body: the cheer, the clap and the moves above. */
export function applyEmoteArms(root: T.Object3D, kind: number, age: number, dur: number) {
  const c = emoteCelebration(kind, age, dur); if (c >= 0) applyCelebrationArms(root, c, ramp(age, dur) > 0 ? 1 : 0);
  const cl = emoteClap(kind, age, dur); if (cl > 0) applyApplause(root, age, cl);
  applyEmoteMove(root, kind, age, dur);
}
