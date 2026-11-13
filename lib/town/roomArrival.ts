// Room entry spread (live QA Nov 12 2026): two players entering a room (Konbini, Arcade, Kit Shop, Museum) landed on the exact same
// spot, inside each other. The room version of publicArrivalSpot (lib/town/simulation.ts, 1.5-4 m outdoors): a small 0.6-1.5 m step
// round the room's entry spot, kept on the walkable floor (never in a shelf, counter or cabinet). Pure: no three.js, no React.

export const ROOM_SPREAD_MIN = 0.6;
export const ROOM_SPREAD_MAX = 1.5;

/** A spot on a 0.6-1.5 m ring round (x, z) at the angle and distance picked by `rand` (0..1 twice); the first of 12 turns round the
 *  ring that `walkable` accepts (the shorter 0.6 m ring is tried too). Falls back to (x, z). Writes `out`. Called once per entry. */
export function roomArrivalSpread<P extends { x: number; z: number }>(out: P, x: number, z: number, walkable: (x: number, z: number) => boolean,
  rand: () => number = Math.random): P {
  const a0 = rand() * 2 * Math.PI, r = ROOM_SPREAD_MIN + rand() * (ROOM_SPREAD_MAX - ROOM_SPREAD_MIN);
  for (let i = 0; i < 12; i++) {
    const a = a0 + i * Math.PI / 6;
    for (const d of [r, ROOM_SPREAD_MIN]) {
      const nx = x + Math.cos(a) * d, nz = z + Math.sin(a) * d;
      if (walkable(nx, nz)) { out.x = nx; out.z = nz; return out; }
    }
  }
  out.x = x; out.z = z; return out;
}

/** Live QA round 4 (Nov 12 2026): the spread was measured from the slot, not from the others, so two Kit Shop arrivals stood 0.53 m
 *  apart. The gap (m) a room arrival keeps from every remote player already known there. */
export const ROOM_CLEAR_M = 0.9;
const WIDE_RINGS = [2, 2.6, 3.2] as const;
function clearOfAll(x: number, z: number, others: ArrayLike<{ x: number; z: number }>, gap: number): boolean {
  for (let i = 0; i < others.length; i++) { const o = others[i]; if ((o.x - x) * (o.x - x) + (o.z - z) * (o.z - z) < gap * gap) return false; }
  return true;
}
/** roomArrivalSpread, but the spot must also be at least `gap` m from every one of `others` (their real room-local spots). Tries the
 *  0.6-1.5 m ring, then wider 2-3.2 m rings (16 turns each); nothing clear: the plain spread (still walkable). Writes `out`. */
export function roomArrivalClear<P extends { x: number; z: number }>(out: P, x: number, z: number, walkable: (x: number, z: number) => boolean,
  others: ArrayLike<{ x: number; z: number }>, rand: () => number = Math.random, gap: number = ROOM_CLEAR_M): P {
  if (!others.length) return roomArrivalSpread(out, x, z, walkable, rand);
  const ok = (px: number, pz: number) => walkable(px, pz) && clearOfAll(px, pz, others, gap);
  roomArrivalSpread(out, x, z, ok, rand);
  if (ok(out.x, out.z)) return out;
  const a0 = rand() * 2 * Math.PI;
  for (const d of WIDE_RINGS) for (let i = 0; i < 16; i++) {
    const a = a0 + i * Math.PI / 8, nx = x + Math.cos(a) * d, nz = z + Math.sin(a) * d;
    if (ok(nx, nz)) { out.x = nx; out.z = nz; return out; }
  }
  return roomArrivalSpread(out, x, z, walkable, rand);
}
