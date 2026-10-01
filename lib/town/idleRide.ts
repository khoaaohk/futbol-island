/** Idle ride / flight frame rate (Oct 1 2026, user: "when flying or riding idle should not waste energy").
 *
 * On a ride or the jetpack, once the player has given no input and neither the player nor the camera has travelled for
 * IDLE_RIDE_AFTER_MS, the island renders at IDLE_RIDE_FRAME_MS (20 fps) instead of 30 (phones) or the display rate
 * (desktop). Any pointer, key or wheel input, or real travel, restores the normal rate on the next frame.
 *
 * "Travel" is horizontal speed of the player or camera above IDLE_TRAVEL_MPS, or vertical speed above IDLE_CLIMB_MPS:
 * the jetpack hover bob and ride idles stay under them (so a hover counts as idle), while a parachute descent, a
 * landing or a carried truck ride does not. Walking is never throttled here.
 *
 * Tradeoff: the hover bob, exhaust, townsfolk and traffic animate at 20 fps while you sit still on a ride. The
 * simulation's dt clamp (0.05 s) equals one 20 fps frame, so nothing runs slower, only less often. */
export const IDLE_RIDE_AFTER_MS = 4000;
export const IDLE_RIDE_FRAME_MS = 1000 / 20;
export const IDLE_TRAVEL_MPS = 0.35;
export const IDLE_CLIMB_MPS = 1.5;

type Point = {x: number; y: number; z: number};

export type IdleRide = {
  /** Input happened (pointer, key, wheel). */
  stir(now: number): void;
  /** Record a rendered frame's player and camera positions; real travel counts as activity. */
  sample(now: number, player: Point, camera: Point): void;
  /** The frame interval to cap at while riding idle, or 0 for the normal rate. */
  interval(now: number, riding: boolean): number;
};

export function createIdleRide(): IdleRide {
  let stirAt = -Infinity, at = NaN, px = 0, py = 0, pz = 0, cx = 0, cy = 0, cz = 0;
  return {
    stir(now) { stirAt = now; },
    sample(now, p, c) {
      const dt = (now - at) / 1000;
      if (dt > 0 && dt < 1) {
        const flat = Math.max(Math.hypot(p.x - px, p.z - pz), Math.hypot(c.x - cx, c.z - cz)) / dt;
        const climb = Math.max(Math.abs(p.y - py), Math.abs(c.y - cy)) / dt;
        if (flat > IDLE_TRAVEL_MPS || climb > IDLE_CLIMB_MPS) stirAt = now;
      } else stirAt = Math.max(stirAt, now); // first sample or after a pause: start the idle wait from here
      at = now; px = p.x; py = p.y; pz = p.z; cx = c.x; cy = c.y; cz = c.z;
    },
    interval(now, riding) {
      // Walking, or the first frame ever: the 4 s wait starts now.
      if (!riding || stirAt === -Infinity) { stirAt = Math.max(stirAt, now); return 0; }
      return now - stirAt >= IDLE_RIDE_AFTER_MS ? IDLE_RIDE_FRAME_MS : 0;
    },
  };
}
