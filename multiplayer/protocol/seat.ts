// Seated in the West Coast Stadium's stands (docs/stadium/PLAN.md phase 5, Nov 12 2026), on the v1 wire with NO relay change:
//  - mode = Mode.Idle, zone = Zone.Main, speed byte (body[4]) = SEAT_SPEED_Q, the pose = the seat itself (x, row height, z) and its
//    yaw toward the pitch. The deployed relay already accepts every part of it (Idle is a valid mode, its speed cap is 6 m/s, the
//    speed byte is free 0..255, flags stay Warp / Hidden), so it works before any relay redeploy.
//  - An old client reads Idle with a speed of 0.25 m/s (below remoteAvatars' 0.3 m/s walk threshold): the friend stands still on
//    the seat row, facing the pitch. That is the "unknown means Idle" fallback, for free.
//  - New senders never send SEAT_SPEED_Q in a plain Idle pose (presence.ts fillLocalBody sends 0 instead); an older sender can, for
//    a frame, while slowing to a stop, so receivers also check the pose sits on a real seat (lib/town/stadiumSeatShare.ts).
// Pure TS, no imports beyond the protocol types.
import { Mode, Zone } from './types';

export const SEAT_SPEED_Q = 1;

/** True when a pose's mode, speed byte and zone say "seated in the stands" (the receiver still checks the seat). */
export function seatedWire(mode: number, speedQ: number, zone: number): boolean {
  return mode === Mode.Idle && Math.round(speedQ) === SEAT_SPEED_Q && zone === Zone.Main;
}
