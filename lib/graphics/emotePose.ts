// Body moves for the 4-second emotes (user, Oct 22 2026), shared by you, a friend and a townsperson: arms on the named shoulder / elbow joints right
// after `rig.update` (like celebrations.ts) plus the rig's own `jump` hop. Cheap: no allocation but the hop object, no geometry.
// Rig conventions: shoulder -x swings the arm forward / up, +side*z lifts it out sideways, elbow -x bends it.
import type * as T from 'three';
import {EMOTE, emoteCalled, emoteCelebration, emoteClap, emoteHop} from '../town/emoteReact';
import {applyApplause, applyCelebrationArms, joints} from './celebrations';
import {applyDance} from './dancePose';
import {applyShowOff} from './showOffPose';

const ramp = (age: number, dur: number) => Math.max(0, Math.min(1, age / .25, (dur - age) / .25));

const set = (s: T.Object3D, e: T.Object3D, k: number, sx: number, sz: number, el: number) => {
  s.rotation.x += (sx - s.rotation.x) * k; s.rotation.y *= 1 - k; s.rotation.z += (sz - s.rotation.z) * k; e.rotation.x += (el - e.rotation.x) * k;
};
export const emoteHasMove = (kind: number) => kind === EMOTE.JuggleWithMe || kind === EMOTE.ShowOff || kind === EMOTE.Laugh || kind === EMOTE.Dance || kind === EMOTE.Thanks;
/** Arms for the moves that are not the wave / celebration / clap: Pass to me (point), Show off and Dance (whole-body moves, dancePose.ts / showOffPose.ts), Laugh (hands on belly, shaking), Dance, Thanks (hands together, bowing). Call after `rig.update`. */
export function applyEmoteMove(root: T.Object3D, kind: number, age: number, dur: number) {
  if (!emoteHasMove(kind)) return;
  if (kind === EMOTE.Dance) { applyDance(root, kind, age, dur); return; }
  if (kind === EMOTE.ShowOff) { applyShowOff(root, kind, age, dur); return; }
  const j = joints(root); if (!j) return;
  const k = ramp(age, dur);
  if (k <= 0) return;
  if (kind === EMOTE.Laugh) { // hands on the belly, shaking with each ha
    const sh = Math.sin(age * 26) * .09, nod = .12 * Math.sin(age * 13);
    set(j.ls, j.le, k, -.75 + sh, -.25, -1.5 + nod); set(j.rs, j.re, k, -.75 - sh, .25, -1.5 - nod); return;
  }
  if (kind === EMOTE.Thanks) { // palms together at the chest, three small bows
    const bow = .5 + .5 * Math.sin(age / dur * Math.PI * 6 - Math.PI / 2);
    set(j.ls, j.le, k, -.95 - .25 * bow, -.12, -1.95); set(j.rs, j.re, k, -.95 - .25 * bow, .12, -1.95); return;
  }
  if (kind === EMOTE.JuggleWithMe) { // the right arm points out, jabbing twice a second
    const jab = .12 * Math.max(0, Math.sin(age * Math.PI * 4));
    set(j.rs, j.re, k, -1.5 - jab, .25, -.15); return;
  }
}
export interface EmoteBody {called: number; jump: {progress: number; height: number} | undefined}
const body: EmoteBody = {called: 0, jump: undefined};
/** The rig-level part of an emote at `age` (shared output object, read at once): the raised "called" arm and the hop. */
export function emoteBody(kind: number, age: number, dur: number): EmoteBody {
  body.called = emoteCalled(kind, age, dur); body.jump = undefined;
  const c = emoteCelebration(kind, age, dur);
  if (c >= 0) body.jump = emoteHop(c);
  else if (kind === EMOTE.Laugh) body.jump = {progress: (age * 3) % 1, height: .05};
  return body;
}
/** Every arm pose an emote needs on the body: the cheer, the clap and the moves above. */
export function applyEmoteArms(root: T.Object3D, kind: number, age: number, dur: number) {
  const c = emoteCelebration(kind, age, dur); if (c >= 0) applyCelebrationArms(root, c, ramp(age, dur) > 0 ? 1 : 0);
  const cl = emoteClap(kind, age, dur); if (cl > 0) applyApplause(root, age, cl);
  applyEmoteMove(root, kind, age, dur);
}
