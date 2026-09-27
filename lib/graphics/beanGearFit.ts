import type {Object3D} from 'three';
import {characterStyle} from './characterStyle';
import {BEAN_SHAPES,BD,beanPoint,beanRadius,beanHeadFrame,type BeanShape} from './beanSkin';

/**
 * Lane F (docs/bean-characters/CONTRACT.md): how rides and flight gear fit the bean body.
 * The bean is one squashy shell for head + torso on the rig's `armor-torso` joint (lane A's beanSkin.ts owns the
 * shape; `beanPoint` is its exact CPU mirror). Gear reads the rig's live shape from the skin's per-instance data row
 * (so every build fits), and falls back to the regular build. Pure maths plus one mesh lookup; no allocation per frame.
 */
export type {BeanShape};
export const DEFAULT_BEAN_SHAPE: BeanShape = BEAN_SHAPES.regular;
export const BEAN_Y0 = -.13;
/** Face panel centre (fraction of the bean height) and half-extents (arc length, height), as lane A draws it. */
export const BEAN_FACE = { u: .775, rx: .2, ry: .17 } as const;
export {beanRadius};

const scratch = { x: 0, y: 0, z: 0 };
function point(s: BeanShape, u: number, a: number) {
  const span = s.H - BEAN_Y0, uu = Math.min(1, Math.max(0, u)), r = beanRadius(s, uu);
  let x = Math.sin(a) * r, z = Math.cos(a) * r * s.D;
  if (z > 0) z *= 1 + s.belly * Math.sin(Math.PI * uu) * (1 - uu * .6);
  x += s.leanX * uu * uu * span; z += s.leanZ * uu * uu * span;
  scratch.x = x; scratch.y = BEAN_Y0 + uu * span; scratch.z = z; return scratch;
}
/** Torso-local surface point (same as lane A's beanPoint, without a Vector3). */
export function beanSurface(s: BeanShape, u: number, a: number) { return point(s, u, a); }
/** Back surface z (negative) at torso-local height y. */
export function beanBackZ(s: BeanShape, y: number) { return point(s, (y - BEAN_Y0) / (s.H - BEAN_Y0), Math.PI).z; }
/** Deepest back point over a torso-local height band: a pack hangs flush on this. */
export function beanBackExtent(s: BeanShape, yFrom: number, yTo: number) {
  let z = 0; for (let i = 0; i <= 12; i++) z = Math.min(z, beanBackZ(s, yFrom + (yTo - yFrom) * i / 12)); return z;
}
/** Half-width of the shell at torso-local height y. */
export function beanHalfWidth(s: BeanShape, y: number) { return beanRadius(s, (y - BEAN_Y0) / (s.H - BEAN_Y0)); }

/**
 * The bean shape a rig is showing right now, or undefined when it renders the classic body (classic style, or a
 * costume that still uses the classic body). Reads the skin's own data row, so it always matches the mesh.
 */
export function beanShapeOf(rig: Object3D | undefined): BeanShape | undefined {
  if (!rig) return characterStyle() === 'bean' ? DEFAULT_BEAN_SHAPE : undefined;
  const cache = rig.userData as { beanGearBody?: Object3D | null };
  if (cache.beanGearBody === undefined) cache.beanGearBody = rig.getObjectByName('bean-body') ?? null;
  const body = cache.beanGearBody;
  if (!body || !body.visible) return undefined;
  const data = (body.userData.beanData?.array as Float32Array | undefined);
  if (!data) return DEFAULT_BEAN_SHAPE;
  const o = BD.shape0 * 4, p = BD.shape1 * 4;
  if (!(data[o] > .3 && data[o + 1] > .1)) return DEFAULT_BEAN_SHAPE;
  return { H: data[o], W: data[o + 1], D: data[o + 2], taper: data[o + 3], belly: data[p], leanX: data[p + 1], leanZ: data[p + 2] };
}
export function sameShape(a: BeanShape | undefined, b: BeanShape | undefined) {
  if (!a || !b) return a === b;
  return a.H === b.H && a.W === b.W && a.D === b.D && a.taper === b.taper && a.belly === b.belly && a.leanX === b.leanX && a.leanZ === b.leanZ;
}

/** Ankle → sole of lane A's rounded boot (ellipsoid centre -.03, radius .058). */
export const BEAN_SOLE_DROP = .088;
/** Rig ride poses (player.ts owns them): pelvis height/offset and torso pitch per seated ride. */
export const RIDE_POSE = {
  scooter: { pelvisY: 1.04, pelvisZ: 0, torso: .04 },
  bike: { pelvisY: 1.0, pelvisZ: -.12, torso: .35 },
  moped: { pelvisY: 1.0, pelvisZ: -.12, torso: .35 },
  car: { pelvisY: 1.0, pelvisZ: -.1, torso: .08 },
  truck: { pelvisY: .44, pelvisZ: -.28, torso: .1 },
} as const;
/** Lowest shell point (rig-space y and z) of a seated pose, across the seat width |x| < halfWidth. */
export function beanSeatContact(s: BeanShape, pose: { pelvisY: number; pelvisZ: number; torso: number }, halfWidth = .13) {
  let bestY = Infinity, bestZ = 0; const c = Math.cos(pose.torso), sn = Math.sin(pose.torso);
  for (let i = 0; i <= 16; i++) for (let j = 0; j < 24; j++) {
    const p = point(s, i / 16 * .5, j / 24 * Math.PI * 2); if (Math.abs(p.x) > halfWidth) continue;
    const y = pose.pelvisY + p.y * c - p.z * sn, z = pose.pelvisZ + p.y * sn + p.z * c;
    if (y < bestY) { bestY = y; bestZ = z; }
  }
  return { y: bestY, z: bestZ };
}
export {beanPoint};
/** Rig-space flying pelvis height at full air (player.ts: .88 + .13); the torso-following packs use it as their rest. */
export const FLIGHT_TORSO_REST = 1.01;
/**
 * Shared per-frame gear state written by the vehicle (lane F) and read by the jet downwash, so the exhaust leaves
 * the nozzles of a pack that sits further back on a bean without another call site in Town.tsx.
 * `packBack` is the extra backward offset of the nozzles in rig metres (0 on the classic body).
 */
export const gearState = { packBack: 0 };
/** Closed ring following the bean cross-section at torso-local height y, pushed out by `gap` (harness straps). */
export function beanRing(s: BeanShape, y: number, gap: number, segments = 28) {
  const u = (y - BEAN_Y0) / (s.H - BEAN_Y0), out: [number, number, number][] = [];
  for (let j = 0; j < segments; j++) {
    const a = j / segments * Math.PI * 2, p = point(s, u, a), cx = s.leanX * u * u * (s.H - BEAN_Y0), cz = s.leanZ * u * u * (s.H - BEAN_Y0);
    const dx = p.x - cx, dz = p.z - cz, l = Math.hypot(dx, dz) || 1;
    out.push([p.x + dx / l * gap, p.y, p.z + dz / l * gap]);
  }
  return out;
}
/** Torso-local height of the lowest headwear rim (the bucket brim hangs to .56 R under the head frame). */
export function beanBrimY(s: BeanShape) { const h = beanHeadFrame(s); return h.origin.y - .56 * h.R; }
/** Torso-local point on the bean at (u, a), pushed out `off` along the true surface normal. */
export function beanSurfaceOffset(s: BeanShape, u: number, a: number, off: number): [number, number, number] {
  const c = point(s, u, a), p: [number, number, number] = [c.x, c.y, c.z];
  const hi = point(s, Math.min(1, u + .01), a), du = [hi.x, hi.y, hi.z], lo = point(s, Math.max(0, u - .01), a); du[0] -= lo.x; du[1] -= lo.y; du[2] -= lo.z;
  const r = point(s, u, a + .02), da = [r.x, r.y, r.z], l = point(s, u, a - .02); da[0] -= l.x; da[1] -= l.y; da[2] -= l.z;
  let nx = da[1] * du[2] - da[2] * du[1], ny = da[2] * du[0] - da[0] * du[2], nz = da[0] * du[1] - da[1] * du[0];
  const n = Math.hypot(nx, ny, nz) || 1; nx /= n; ny /= n; nz /= n;
  return [p[0] + nx * off, p[1] + ny * off, p[2] + nz * off];
}
/**
 * Backpack straps drawn on the bean's surface (torso-local points): per side, a loop from the upper back over the
 * shoulder, down the front, and back under the arm; plus a slim sternum strap joining the fronts. Each strap is a
 * list of [u, a] stations; `beanSurfaceOffset` places them flush on the shell, so they hug every build.
 */
export function beanStrapPaths(): { closed: boolean; stations: [number, number][] }[] {
  const out: { closed: boolean; stations: [number, number][] }[] = [];
  // Closed Catmull-Rom loop through [u, |a|] controls: upper back → over the top of the side → down the front
  // (bowing in with the chest) → round under the arm → lower back. Sampled densely so the strap reads as one curve.
  const ctrl: [number, number][] = [[.66, Math.PI - .5], [.72, 1.55], [.63, .55], [.47, .4], [.31, .5], [.27, 1.35], [.36, Math.PI - .5]];
  const cr = (p0: number, p1: number, p2: number, p3: number, t: number) => .5 * (2 * p1 + (p2 - p0) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (3 * p1 - p0 - 3 * p2 + p3) * t * t * t);
  for (const side of [-1, 1]) {
    const st: [number, number][] = [], n = ctrl.length;
    for (let i = 0; i < n; i++) for (let k = 0; k < 7; k++) {
      const t = k / 7, c = (j: number) => ctrl[(i + j + n) % n];
      st.push([cr(c(-1)[0], c(0)[0], c(1)[0], c(2)[0], t), side * cr(c(-1)[1], c(0)[1], c(1)[1], c(2)[1], t)]);
    }
    out.push({ closed: true, stations: st });
  }
  const chest: [number, number][] = []; for (let i = 0; i <= 8; i++) chest.push([.48, -.41 + .82 * i / 8]);
  out.push({ closed: false, stations: chest });
  return out;
}
