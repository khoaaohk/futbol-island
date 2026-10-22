// A busy friend's force field as a ball collider (multiplayer presence, docs/multiplayer-design.md 4.4.1). Pure math, no allocation:
// the island ball (walkBall 'shot') that enters the dome is pushed back to its surface and its velocity reflected about the
// surface normal with a little energy loss. A ball already moving outward is only pushed out (never stuck inside, never through).
export const FIELD_RADIUS = 1.15, FIELD_CENTER_Y = 1.0, FIELD_RESTITUTION = .78;

export type FieldBall = { x: number; y: number; z: number; vx: number; vy: number; vz: number };
/** The outward unit normal at the contact (written by bounceOffField when it returns true). */
export const fieldHit = { nx: 0, ny: 1, nz: 0, speed: 0 };

/**
 * Sphere (centre cx, cy, cz; radius r) vs ball (radius br). Returns true when the ball touched the dome this step and was
 * pushed out (and reflected if it was moving inward); fieldHit then holds the normal and the impact speed.
 */
export function bounceOffField(b: FieldBall, cx: number, cy: number, cz: number, r = FIELD_RADIUS, br = .2, e = FIELD_RESTITUTION): boolean {
  // Below the centre the dome is a cylinder down to the ground: a rolling ball is pushed out sideways, never into the floor.
  let dx = b.x - cx, dy = Math.max(0, b.y - cy), dz = b.z - cz;
  const reach = r + br, d2 = dx * dx + dy * dy + dz * dz;
  if (d2 >= reach * reach) return false;
  let d = Math.sqrt(d2);
  if (d < 1e-6) { dx = 0; dy = 1; dz = 0; d = 1; } // dead centre: out through the top
  const nx = dx / d, ny = dy / d, nz = dz / d;
  const vn = b.vx * nx + b.vy * ny + b.vz * nz;
  if (vn < 0) { // moving inward: reflect, losing (1 - e) of the normal speed
    const k = (1 + e) * vn;
    b.vx -= k * nx; b.vy -= k * ny; b.vz -= k * nz;
  }
  const out = reach + .01;
  b.x = cx + nx * out; b.z = cz + nz * out;
  if (ny > 0) b.y = cy + ny * out; // the cylinder part keeps the ball's height
  fieldHit.nx = nx; fieldHit.ny = ny; fieldHit.nz = nz; fieldHit.speed = Math.max(0, -vn);
  return true;
}
