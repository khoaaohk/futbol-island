// Whole-body emote writer (user, Oct 22 2026) for Dance and Show off, shared by you, a friend and a townsperson. Call right after
// `rig.update` (like applyHighFive): it blends the named joints toward the move's pose (lib/town/emoteDance.ts channels): arms, legs
// (hip / knee / ankle), torso, head (and the bean's gaze), and the PELVIS for the hop, glide, spin and flips, so the whole body moves
// with it and every actor works the same whatever resets its root afterwards. The lowest foot (or knee) is kept on the ground.
// Each actor picks its own move from a shared shuffled bag when its emote starts (a townsperson dancing along gets the next one, so it
// always differs from yours). Cheap: ~30 joint writes, no allocation per frame (one small record per rig, once).
import type * as T from 'three';
import {BODY_CHANNELS, DANCES, DANCE_COUNT, GX, GZ, HOP, HX, HY, HZ, LAN, LEL, LHX, LHZ, LKN, LSX, LSZ, PP, PR, PY, RAN, REL, RHX, RHZ, RKN,
  RSX, RSZ, SPIN, TX, TY, TZ, createMoveBag, nextMove, pelvisLift, sampleMove, type BodyMove, type MoveBag} from '../town/emoteDance';
import {emitEmoteVariant, type EmoteVariantPick} from '../town/emoteVariantHook';

interface BodyJoints {
  ls: T.Object3D; rs: T.Object3D; le: T.Object3D; re: T.Object3D;
  pelvis: T.Object3D | null; torso: T.Object3D | null; head: T.Object3D | null;
  lh: T.Object3D | null; rh: T.Object3D | null; lk: T.Object3D | null; rk: T.Object3D | null; la: T.Object3D | null; ra: T.Object3D | null;
  npc: boolean;
}
const cache = new WeakMap<T.Object3D, BodyJoints | null>();
export function bodyJoints(root: T.Object3D): BodyJoints | null {
  if (cache.has(root)) return cache.get(root)!;
  const g = (n: string) => root.getObjectByName(n) ?? null;
  const ls = g('left-shoulder'), rs = g('right-shoulder'), le = g('left-elbow'), re = g('right-elbow');
  const id = String((g('player-jersey')?.userData as {playerId?: string} | undefined)?.playerId ?? '');
  const j = ls && rs && le && re ? {ls, rs, le, re, pelvis: g('player-pelvis'), torso: g('armor-torso'), head: g('player-head'), lh: g('left-hip'), rh: g('right-hip'),
    lk: g('left-knee'), rk: g('right-knee'), la: g('left-ankle'), ra: g('right-ankle'), npc: id.startsWith('town-npc-')} : null;
  cache.set(root, j); return j;
}
const TAU = Math.PI * 2;
const wrap = (a: number) => { const d = a % TAU; return d > Math.PI ? d - TAU : d < -Math.PI ? d + TAU : d; };
const clamp = (v: number, a: number, b: number) => v < a ? a : v > b ? b : v;
function limb(s: T.Object3D, e: T.Object3D, k: number, sx: number, sz: number, el: number) {
  s.rotation.x += (sx - s.rotation.x) * k; s.rotation.y *= 1 - k; s.rotation.z += (sz - s.rotation.z) * k; e.rotation.x += (el - e.rotation.x) * k;
}
/** Writes pose `ch` (BODY_CHANNELS numbers) onto `root` with weight `k` (0..1). */
export function applyBodyPose(root: T.Object3D, ch: ArrayLike<number>, k: number) {
  const j = bodyJoints(root); if (!j || k <= 0) return;
  limb(j.ls, j.le, k, ch[LSX], -ch[LSZ], ch[LEL]); limb(j.rs, j.re, k, ch[RSX], ch[RSZ], ch[REL]);
  if (j.lh && j.rh && j.lk && j.rk) {
    limb(j.lh, j.lk, k, ch[LHX], -ch[LHZ], ch[LKN]); limb(j.rh, j.rk, k, ch[RHX], ch[RHZ], ch[RKN]);
    j.lk.rotation.y *= 1 - k; j.lk.rotation.z *= 1 - k; j.rk.rotation.y *= 1 - k; j.rk.rotation.z *= 1 - k;
    if (j.la) j.la.rotation.x += (ch[LAN] - j.la.rotation.x) * k;
    if (j.ra) j.ra.rotation.x += (ch[RAN] - j.ra.rotation.x) * k;
  }
  if (j.pelvis) {
    const p = j.pelvis, legs = j.lh ? j.lh.scale.y || 1 : 1;
    p.position.y += k * pelvisLift(ch, legs);
    p.position.x += k * ch[GX]; p.position.z += k * ch[GZ];
    p.rotation.x += k * wrap(ch[PP]); p.rotation.y += k * (wrap(ch[SPIN]) + ch[PY]); p.rotation.z += k * ch[PR];
  }
  if (j.torso) { j.torso.rotation.x += k * ch[TX]; j.torso.rotation.y += k * ch[TY]; j.torso.rotation.z += k * ch[TZ]; }
  if (j.head) {
    const h = j.head; h.rotation.x += k * ch[HX]; h.rotation.y += k * ch[HY]; h.rotation.z += k * ch[HZ];
    const gaze = h.userData.beanGaze as Float32Array | undefined; // the bean's head is the top of the bean: bend it the same way
    if (gaze) { gaze[0] = clamp(gaze[0] + .4 * k * ch[HX], -.4, .45); gaze[1] = clamp(gaze[1] + .7 * k * ch[HY], -.5, .5); }
  }
}

const scratch = new Float32Array(BODY_CHANNELS);
/** The move's 0..1 weight: in over the first 0.25 s, out over the last 0.25 s. */
export const moveEnvelope = (age: number, dur: number): number => Math.max(0, Math.min(1, age / .25, (dur - age) / .25));
/** Poses `root` for move `m` at `age` of an emote lasting `dur` seconds (the move is time-scaled to fit). */
export function applyBodyMove(root: T.Object3D, m: BodyMove, age: number, dur: number) {
  const k = moveEnvelope(age, dur); if (k <= 0) return;
  applyBodyPose(root, sampleMove(m, age * m.seconds / Math.max(.01, dur), scratch), k);
}

// ---- which move each actor plays: a fresh pick from the bag whenever its emote (re)starts
let rand: () => number = Math.random;
/** Tests: a seeded random for the bags (null = Math.random). */
export function setMoveRandom(r: (() => number) | null) { rand = r ?? Math.random; }
interface Run { kind: number; age: number; v: number }
const runs = new WeakMap<T.Object3D, Run>();
/** The move index `root` plays for emote `kind` now, picking a new one from `bag` when the emote (re)starts. */
export function pickMove(root: T.Object3D, kind: number, age: number, bag: MoveBag, family?: EmoteVariantPick): number {
  let r = runs.get(root);
  if (!r) { r = {kind: -1, age: 0, v: -1}; runs.set(root, r); }
  if (r.kind !== kind || r.v < 0 || age < r.age - 1e-4) {
    let v = nextMove(rand, bag);
    if (v === r.v && r.kind === kind) v = nextMove(rand, bag); // the bag is shared (a townsperson took one in between): still never your last move twice
    r.kind = kind; r.v = v;
    if (family) emitEmoteVariant(family, v, root); // analytics: Town keeps your own pick and a townsperson's reaction (emoteVariantHook.ts)
  }
  r.age = age; return r.v;
}
const danceBag = createMoveBag(DANCE_COUNT);
/** Dance: every actor (you, a friend, a townsperson dancing along) plays its own dance from the shared bag. Call after `rig.update`. */
export function applyDance(root: T.Object3D, kind: number, age: number, dur: number) {
  applyBodyMove(root, DANCES[pickMove(root, kind, age, danceBag, 'dance')], age, dur);
}
