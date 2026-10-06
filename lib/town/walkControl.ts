// Walking controller feel (A7, Oct 4 2026): touch-stick shaping, walk-camera framing and the "hidden behind a
// building" probe. Pure, allocation-free helpers; components/Town.tsx owns when they run.

/** Below this fraction of the stick radius a resting or brushing thumb does not move the player. */
export const STICK_DEAD_ZONE = .12;
/** Smallest walking effort once the stick leaves the dead zone: 0.36 × 3.7 m/s ≈ 1.3 m/s, a natural slow walk.
 *  Slower creeping (0.2–0.9 m/s) made the procedural gait shuffle its boots along the ground. */
export const STICK_WALK_FLOOR = .36;

/** Radial dead zone, then a walk floor and a linear ramp to full speed; the direction stays fully analog. */
export function shapeStick(x: number, y: number, out: {x: number; z: number}) {
  const m = Math.hypot(x, y);
  if (m <= STICK_DEAD_ZONE) { out.x = 0; out.z = 0; return out; }
  const u = Math.min(1, (m - STICK_DEAD_ZONE) / (1 - STICK_DEAD_ZONE)), effort = STICK_WALK_FLOOR + (1 - STICK_WALK_FLOOR) * u;
  out.x = x / m * effort; out.z = y / m * effort;
  return out;
}

/** The island camera looks along (−16, −23, −33). The original walking offset (18, 23, 30) aims ~3 m right of the
 *  player, which on a portrait phone puts them at ~28 % of the screen width beside the joystick. Portrait views
 *  use the centred offset (16, 23, 33); wide desktop views keep the established framing. */
export function walkCameraOffset(aspect: number, out: {x: number; z: number}) {
  const k = Math.min(1, Math.max(0, (1.3 - aspect) / .5));
  out.x = 18 - 2 * k; out.z = 30 + 3 * k;
  return out;
}

/** Seconds of travel the walking camera looks ahead. It roughly cancels the eased follow's lag (rate 4 ⇒ v/4 m), so
 *  turns and sprints keep the player near the centre with a little room ahead instead of trailing a body behind. */
export const WALK_CAMERA_LEAD = .3, WALK_CAMERA_LEAD_MAX = 2.2;
export function walkCameraLead(vx: number, vz: number, out: {x: number; z: number}) {
  const s = Math.hypot(vx, vz), k = s * WALK_CAMERA_LEAD > WALK_CAMERA_LEAD_MAX ? WALK_CAMERA_LEAD_MAX / s : WALK_CAMERA_LEAD;
  out.x = vx * k; out.z = vz * k;
  return out;
}

export type OccluderBox = {x: number; z: number; w: number; d: number; floor: number; top: number};
/** Segment (a → b) against an axis-aligned box (slab test). */
export function segmentHitsBox(ax: number, ay: number, az: number, bx: number, by: number, bz: number, o: OccluderBox) {
  let t0 = 0, t1 = 1;
  const slab = (a: number, d: number, lo: number, hi: number) => {
    if (Math.abs(d) < 1e-9) return a >= lo && a <= hi;
    let u = (lo - a) / d, v = (hi - a) / d;
    if (u > v) { const s = u; u = v; v = s; }
    t0 = Math.max(t0, u); t1 = Math.min(t1, v);
    return t0 <= t1;
  };
  return slab(ax, bx - ax, o.x - o.w / 2, o.x + o.w / 2) && slab(az, bz - az, o.z - o.d / 2, o.z + o.d / 2) && slab(ay, by - ay, o.floor, o.top);
}

/** Is the walking player hidden behind scenery from the camera? Both the hips and the head must be blocked.
 *  Runs at ~6 Hz from the caller's frame (no loop of its own) and reuses the caller's spatial grid, querying only
 *  the cells along the first `reach` metres toward the camera (anything farther sits above the sight line). */
export function createOcclusionProbe<T extends OccluderBox>(query: (x: number, z: number, radius: number) => T[], reach = 18, interval = .16) {
  let wait = 0, hidden = false;
  const blocked = (px: number, py: number, pz: number, cx: number, cy: number, cz: number, items: T[], h: number) => {
    for (const o of items) if (o.top > py + h && segmentHitsBox(px, py + h, pz, cx, cy, cz, o)) return true;
    return false;
  };
  return {
    get hidden() { return hidden; },
    reset() { wait = 0; hidden = false; },
    update(dt: number, px: number, py: number, pz: number, cx: number, cy: number, cz: number) {
      wait -= dt; if (wait > 0) return hidden;
      wait = interval;
      const hx = cx - px, hz = cz - pz, l = Math.hypot(hx, hz) || 1, r = Math.min(reach, l) / 2;
      const items = query(px + hx / l * r, pz + hz / l * r, r);
      hidden = blocked(px, py, pz, cx, cy, cz, items, .7) && blocked(px, py, pz, cx, cy, cz, items, 1.55);
      return hidden;
    },
  };
}
