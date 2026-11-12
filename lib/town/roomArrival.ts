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
