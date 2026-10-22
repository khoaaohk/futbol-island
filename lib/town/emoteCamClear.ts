// Emote camera occlusion (user, Oct 22 2026: "on zoom for the emotes, the building is covering the view"). Pure geometry, no three.js:
// the eye must not sit inside (or within EYE_CLEAR of) a solid, and several rays from the eye (centre and a shoulder either side) to the feet,
// chest, head and raised hands of BOTH characters must miss every solid. Solids are the island's wall boxes (buildings with their height)
// plus the big props; Town passes them from its obstacle grids.
export interface Solid {x: number; z: number; w: number; d: number; floor: number; top: number}
export const EYE_CLEAR = .6;
/** Heights (m above the feet) the rays aim at: feet, chest, head, raised hands. */
const HEIGHTS = [.2, 1, 1.7, 2.3];
/** Segment a -> b against an axis-aligned box padded by `pad`. */
export function segHitsSolid(ax: number, ay: number, az: number, bx: number, by: number, bz: number, o: Solid, pad = 0): boolean {
  let t0 = 0, t1 = 1;
  const slab = (a: number, d: number, lo: number, hi: number) => {
    if (Math.abs(d) < 1e-9) return a >= lo && a <= hi;
    let u = (lo - a) / d, v = (hi - a) / d;
    if (u > v) { const s = u; u = v; v = s; }
    t0 = Math.max(t0, u); t1 = Math.min(t1, v);
    return t0 <= t1;
  };
  return slab(ax, bx - ax, o.x - o.w / 2 - pad, o.x + o.w / 2 + pad) && slab(az, bz - az, o.z - o.d / 2 - pad, o.z + o.d / 2 + pad) && slab(ay, by - ay, o.floor - pad, o.top + pad);
}
/** Is the eye inside a solid, or closer than `pad` to one? */
export function eyeBlocked(solids: readonly Solid[], ex: number, ey: number, ez: number, pad = EYE_CLEAR): boolean {
  for (const o of solids) if (ey >= o.floor - pad && ey <= o.top + pad && Math.abs(ex - o.x) <= o.w / 2 + pad && Math.abs(ez - o.z) <= o.d / 2 + pad) return true;
  return false;
}
/** Is the view from the eye to a character (feet at cx, cy, cz) free of solids? `yaw` = the camera heading (for the shoulder offsets). */
function seesCharacter(solids: readonly Solid[], ex: number, ey: number, ez: number, cx: number, cy: number, cz: number, yaw: number): boolean {
  const rx = Math.cos(yaw), rz = -Math.sin(yaw);
  for (let s = -1; s <= 1; s++) {
    const sx = ex + rx * .35 * s, sz = ez + rz * .35 * s;
    for (let h = 0; h < HEIGHTS.length; h++) for (let w = -1; w <= 1; w++) {
      if (w !== 0 && h !== 1) continue; // sideways rays at chest height only
      const tx = cx + rx * .5 * w, tz = cz + rz * .5 * w, ty = cy + HEIGHTS[h];
      const dx = tx - sx, dy = ty - ey, dz = tz - sz, len = Math.hypot(dx, dy, dz) || 1, k = Math.max(0, 1 - .25 / len); // stop 25 cm short of the body
      for (const o of solids) if (segHitsSolid(sx, ey, sz, sx + dx * k, ey + dy * k, sz + dz * k, o)) return false;
    }
  }
  return true;
}
/** The whole test: the eye is clear of every solid and sees both characters (the partner only when `hasQ`). */
export function viewClear(solids: readonly Solid[], ex: number, ey: number, ez: number, p: {x: number; y: number; z: number}, hasQ: boolean, q: {x: number; y: number; z: number}, yaw: number): boolean {
  if (eyeBlocked(solids, ex, ey, ez)) return false;
  return seesCharacter(solids, ex, ey, ez, p.x, p.y, p.z, yaw) && (!hasQ || seesCharacter(solids, ex, ey, ez, q.x, q.y, q.z, yaw));
}
/** Headings tried (rad, relative to the best one) when the first is blocked: nearby first, the opposite side last. */
export const YAW_TRIES: readonly number[] = [0, .35, -.35, .7, -.7, 1.2, -1.2, 1.9, -1.9, Math.PI];
/** Pitches tried (rad above the horizon): the usual three-quarter view, then higher to look over a wall. */
export const PITCH_TRIES: readonly number[] = [.36, .6, .9];
