// The handshake pose layer (user, Oct 22 2026): high fives, thanks and well played as WHOLE-BODY moves. Call right after `rig.update`
// (which resets the root and joints every frame), before rendering. Writes both arms, the chest (lean / twist / side bend), the head,
// both legs (crouch with planted feet, knee lifts, a tuck in the air) and the root (hop, step toward the partner, side shuffle, spin)
// from the keyed halves in lib/town/emoteHandshakes.ts. A few joint writes per frame while one plays; nothing is allocated.
import type * as T from 'three';
import {CH, HANDSHAKES, HS_CHANNELS, crouchAngle, crouchDrop, handshakeStep, hsEnvelope, sampleHandshake, spinShown} from '../town/emoteHandshakes';

interface Joints {
  ls: T.Object3D; rs: T.Object3D; le: T.Object3D; re: T.Object3D; lumbar: T.Object3D | null; head: T.Object3D | null;
  lh: T.Object3D | null; rh: T.Object3D | null; lk: T.Object3D | null; rk: T.Object3D | null; la: T.Object3D | null; ra: T.Object3D | null;
}
const cache = new WeakMap<T.Object3D, Joints | null>();
const scratch = new Float32Array(HS_CHANNELS), step = {f: 0, s: 0};
const PI2 = Math.PI * 2;
function joints(root: T.Object3D): Joints | null {
  if (cache.has(root)) return cache.get(root)!;
  const g = (n: string) => root.getObjectByName(n) ?? null;
  const ls = g('left-shoulder'), rs = g('right-shoulder'), le = g('left-elbow'), re = g('right-elbow');
  const j = ls && rs && le && re ? {ls, rs, le, re, lumbar: g('player-lumbar'), head: g('player-head'), lh: g('left-hip'), rh: g('right-hip'), lk: g('left-knee'), rk: g('right-knee'), la: g('left-ankle'), ra: g('right-ankle')} : null;
  cache.set(root, j); return j;
}
/** Shortest signed angle from a to b. */
const turnBy = (a: number, b: number) => { let d = (b - a) % PI2; if (d > Math.PI) d -= PI2; else if (d < -Math.PI) d += PI2; return d; };
function arm(s: T.Object3D, e: T.Object3D, sx: number, sz: number, el: number, k: number) {
  s.rotation.x += turnBy(s.rotation.x, sx) * k; s.rotation.y *= 1 - k; s.rotation.z += (sz - s.rotation.z) * k; e.rotation.x += (el - e.rotation.x) * k;
}
function leg(hip: T.Object3D | null, knee: T.Object3D | null, ankle: T.Object3D | null, bend: number, lift: number, tuck: number, k: number) {
  if (!hip || !knee) return;
  hip.rotation.x += (-(bend + lift + tuck * .55) - hip.rotation.x) * k; hip.rotation.y *= 1 - k;
  knee.rotation.x += (2 * bend + lift * 1.3 + tuck * 1.1 - knee.rotation.x) * k;
  if (ankle) ankle.rotation.x += (-bend + tuck * .25 - ankle.rotation.x) * k;
}

/**
 * Poses `root` for handshake `v` (global index into HANDSHAKES), half 0 (you / a friend) or 1 (the partner), at `age` seconds on the shared
 * clock. `side` is the A arm (+1 right, -1 left); `faceYaw` the heading toward the partner (NaN = keep the heading); `scale` the body's
 * height scale; `gap` the feet-to-feet distance to the partner (NaN = no partner: the authored step). Returns the blend 0..1 (0 = nothing written).
 */
export function applyHandshake(root: T.Object3D, v: number, half: 0 | 1, age: number, side: -1 | 1, faceYaw: number, scale = 1, gap = NaN): number {
  const d = HANDSHAKES[v], j = joints(root); if (!d || !j) return 0;
  const w = hsEnvelope(age, d.duration); if (w <= 0) return 0;
  const o = sampleHandshake(half === 0 ? d.player : d.npc, age, scratch);
  const aRight = side > 0;
  const a = aRight ? j.rs : j.ls, ae = aRight ? j.re : j.le, b = aRight ? j.ls : j.rs, be = aRight ? j.le : j.re;
  arm(a, ae, o[CH.a0], o[CH.a1] * side, o[CH.a2], w); arm(b, be, o[CH.b0], -o[CH.b1] * side, o[CH.b2], w);
  if (j.lumbar) { const l = j.lumbar.rotation; l.x += (o[CH.lean] - l.x) * w; l.y += (o[CH.twist] * side - l.y) * w; l.z += (-o[CH.tilt] * side - l.z) * w; }
  if (j.head) { const h = j.head.rotation; h.x += (o[CH.nod] - h.x) * w; h.y += (o[CH.look] * side - h.y) * w; }
  const dy = o[CH.dy], bend = crouchAngle(o[CH.crouch]), tuck = dy > .04 ? Math.min(1, dy / .4) : 0;
  leg(aRight ? j.rh : j.lh, aRight ? j.rk : j.lk, aRight ? j.ra : j.la, bend, o[CH.legA], tuck, w);
  leg(aRight ? j.lh : j.rh, aRight ? j.lk : j.rk, aRight ? j.la : j.ra, bend, o[CH.legB], tuck, w);
  const yaw = faceYaw === faceYaw ? faceYaw : root.rotation.y;
  handshakeStep(step, o, gap);
  const sx = Math.cos(yaw) * side, sz = -Math.sin(yaw) * side; // the A side on the ground (the rig's +x is its right)
  root.position.x += (Math.sin(yaw) * step.f + sx * step.s * scale) * w;
  root.position.z += (Math.cos(yaw) * step.f + sz * step.s * scale) * w;
  root.position.y += (dy - crouchDrop(o[CH.crouch])) * w * scale;
  root.rotation.y += (faceYaw === faceYaw ? turnBy(root.rotation.y, faceYaw) * w : 0) + spinShown(o[CH.spin]) * side * w;
  return w;
}
