// The rider's body for the in-place ride tricks (lib/town/rideEmotes.ts sampleRideTrick): arms, head, chest lean and legs blended over the
// rig's own ride pose, right after `rig.update` (the bean skin reads the same named joints, so every body type shows it). Used for you (Town)
// and for a friend on their own ride rig (remoteAvatars -> celebrations.applyRideEmote). No allocation per frame.
import type * as T from 'three';
import {RT, RT_CH, sampleRideTrick} from '../town/rideEmotes';

interface RiderJoints {rs: T.Object3D; re: T.Object3D; ls: T.Object3D; le: T.Object3D; head: T.Object3D | null; chest: T.Object3D | null; lh: T.Object3D | null; lk: T.Object3D | null; rh: T.Object3D | null; rk: T.Object3D | null}
const cache = new WeakMap<T.Object3D, RiderJoints | null>();
function riderJoints(root: T.Object3D): RiderJoints | null {
  if (cache.has(root)) return cache.get(root)!;
  const g = (n: string) => root.getObjectByName(n) ?? null;
  const rs = g('right-shoulder'), re = g('right-elbow'), ls = g('left-shoulder'), le = g('left-elbow');
  const j = rs && re && ls && le ? {rs, re, ls, le, head: g('player-head'), chest: g('player-chest'), lh: g('left-hip'), lk: g('left-knee'), rh: g('right-hip'), rk: g('right-knee')} : null;
  cache.set(root, j); return j;
}
const buf = new Float32Array(RT_CH);
const clamp01 = (v: number) => v < 0 ? 0 : v > 1 ? 1 : v;
/** Pose the rider for ride trick `emote` at trick-age `age` with overall weight `w` (0..1). `pose` = an already sampled RT array (Town samples once per frame). */
export function applyRideTrickBody(root: T.Object3D, emote: number, age: number, w = 1, pose?: Float32Array) {
  const j = riderJoints(root); if (!j || w <= 0) return;
  const p = pose ?? sampleRideTrick(emote, age, buf), k = clamp01(w);
  const armTo = (s: T.Object3D, e: T.Object3D, sx: number, sz: number, ex: number, a: number) => {
    if (a <= 0) return; s.rotation.x += (sx - s.rotation.x) * a; s.rotation.y *= 1 - a; s.rotation.z += (sz - s.rotation.z) * a; e.rotation.x += (ex - e.rotation.x) * a;
  };
  armTo(j.rs, j.re, p[RT.RSX], p[RT.RSZ], p[RT.REX], p[RT.RW] * k);
  armTo(j.ls, j.le, p[RT.LSX], p[RT.LSZ], p[RT.LEX], p[RT.LW] * k);
  const legTo = (h: T.Object3D | null, kn: T.Object3D | null, hx: number, hz: number, kx: number, a: number) => {
    if (!h || !kn || a <= 0) return; h.rotation.x += (hx - h.rotation.x) * a; h.rotation.z += (hz - h.rotation.z) * a; kn.rotation.x += (kx - kn.rotation.x) * a;
  };
  legTo(j.lh, j.lk, p[RT.LHX], p[RT.LHZ], p[RT.LKN], p[RT.LLW] * k);
  legTo(j.rh, j.rk, p[RT.RHX], p[RT.RHZ], p[RT.RKN], p[RT.RLW] * k);
  if (j.head) { const a = p[RT.HW] * k; j.head.rotation.y += (p[RT.HY] - j.head.rotation.y) * a; j.head.rotation.x += p[RT.HX] * k; }
  if (j.chest) { j.chest.rotation.x += p[RT.CX] * k; j.chest.rotation.z += p[RT.CZ] * k; }
}
