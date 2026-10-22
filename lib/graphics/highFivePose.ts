// The high five pose layer (user, Oct 22 2026). Like applyCelebrationArms: call right after `rig.update`, before rendering. It writes the
// named shoulder / elbow joints, the chest pitch (player-lumbar), and the rig root's hop / crouch (y) and turn / spin (yaw) from the
// keyframed halves in lib/town/highFive.ts. A few joint writes per frame while an emote is active; nothing is allocated.
import type * as T from 'three';
import {HIGH_FIVES, HF_STRIDE, hfEnvelope, sampleKeys, segBlend} from '../town/highFive';

interface Joints {ls: T.Object3D; rs: T.Object3D; le: T.Object3D; re: T.Object3D; lumbar: T.Object3D | null}
const cache = new WeakMap<T.Object3D, Joints | null>();
const scratch = new Float32Array(HF_STRIDE - 1);
const TAU = 6.2832;
function joints(root: T.Object3D): Joints | null {
  if (cache.has(root)) return cache.get(root)!;
  const ls = root.getObjectByName('left-shoulder'), rs = root.getObjectByName('right-shoulder'), le = root.getObjectByName('left-elbow'), re = root.getObjectByName('right-elbow');
  const j = ls && rs && le && re ? {ls, rs, le, re, lumbar: root.getObjectByName('player-lumbar') ?? null} : null;
  cache.set(root, j); return j;
}
function arm(s: T.Object3D, e: T.Object3D, sx: number, sz: number, el: number, k: number) {
  s.rotation.x += (sx - s.rotation.x) * k; s.rotation.y *= 1 - k; s.rotation.z += (sz - s.rotation.z) * k; e.rotation.x += (el - e.rotation.x) * k;
}
/** Shortest signed angle from a to b. */
const turnBy = (a: number, b: number) => { let d = (b - a) % (2 * Math.PI); if (d > Math.PI) d -= 2 * Math.PI; else if (d < -Math.PI) d += 2 * Math.PI; return d; };

/**
 * Poses `root` for variation `v`, half 0 (you / a friend) or 1 (the townsperson), at `age` seconds on the shared clock.
 * `side` is the five arm (+1 right, -1 left); `faceYaw` the heading to turn toward (NaN = keep the heading); `scale` the character's
 * height scale (hop / crouch distances). Returns the sequence's blend 0..1 (0 = nothing was written).
 */
export function applyHighFive(root: T.Object3D, v: number, half: 0 | 1, age: number, side: -1 | 1, faceYaw: number, scale = 1): number {
  const d = HIGH_FIVES[v], j = joints(root); if (!d || !j) return 0;
  const w = hfEnvelope(age, d.duration); if (w <= 0) return 0;
  const o = sampleKeys(half === 0 ? d.player : d.npc, age, scratch);
  const a = side > 0 ? j.rs : j.ls, ae = side > 0 ? j.re : j.le, b = side > 0 ? j.ls : j.rs, be = side > 0 ? j.le : j.re;
  const wa = w * (1 - segBlend(d, age)); // inside an arcade skill window the rig owns the arms and chest
  if (wa > 0) { arm(a, ae, o[0], o[1] * side, o[2], wa); arm(b, be, o[3], -o[4] * side, o[5], wa); }
  if (j.lumbar) j.lumbar.rotation.x += (o[6] - j.lumbar.rotation.x) * wa;
  root.position.y += o[7] * w * scale;
  const spin = o[8] >= TAU - 1e-3 ? 0 : o[8];
  root.rotation.y += (faceYaw === faceYaw ? turnBy(root.rotation.y, faceYaw) * w : 0) + spin;
  return w;
}
