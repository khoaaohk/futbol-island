// Ride ground contact (owner, Oct 23 2026: "looks like it's going into the ground too much"). The wheels as lib/graphics/vehicle.ts draws them
// (vehicle units; the town renders the rides at RIDE_SCALE): each tyre's outer radius equals its axle height, so at rest the tyre bottoms sit on
// the ride's root. A pitch / roll about the root drops one tyre into the ground; rideGroundLift is the lift that puts the lowest tyre point back on
// the ground. Pure math, no allocation (scripts/check-ride-ground.cjs measures the real meshes, tests/ride-ground.cjs gates it).
export type GroundRide = 'scooter' | 'bike' | 'moped';
export const RIDE_SCALE = 1.12;
export const RIDE_WHEELS: Record<GroundRide, {radius: number; rear: number; front: number}> = {
  scooter: {radius: .12, rear: -.4, front: .5}, bike: {radius: .32, rear: -.53, front: .62}, moped: {radius: .24, rear: -.53, front: .62},
};
const tyreLow = (r: number, z: number, c: number, s: number) => r * c - z * s - r * Math.sqrt(c * c + s * s);
/** Lowest tyre point (m, relative to the root) after the root turns by roll (z) then pitch (x, + = nose down), three.js 'YXZ' order. */
export function rideWheelLow(ride: GroundRide, pitch: number, roll = 0): number {
  const w = RIDE_WHEELS[ride], r = w.radius * RIDE_SCALE, c = Math.cos(roll) * Math.cos(pitch), s = Math.sin(pitch);
  return Math.min(tyreLow(r, w.rear * RIDE_SCALE, c, s), tyreLow(r, w.front * RIDE_SCALE, c, s));
}
/** Lift (m, >= 0) that keeps both tyres on or above the ground for this pitch / roll about the root. */
export const rideGroundLift = (ride: GroundRide, pitch: number, roll = 0): number => Math.max(0, -rideWheelLow(ride, pitch, roll));
/** The axle a trick pitches about: z (m, + = forward) and height (m) of the rear (`side` < 0) or front wheel's axle. */
export const rideAxleZ = (ride: GroundRide, side: number): number => (side < 0 ? RIDE_WHEELS[ride].rear : RIDE_WHEELS[ride].front) * RIDE_SCALE;
export const rideAxleY = (ride: GroundRide): number => RIDE_WHEELS[ride].radius * RIDE_SCALE;
