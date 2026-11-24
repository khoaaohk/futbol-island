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
/** A seated member (watching a match from the stands) is not idle: the relay frees a seated slot only after this long without other
 *  activity (relay change, Nov 13 2026; needs a relay redeploy, until then the old 5 min WORLD_IDLE_MS applies). */
export const SEATED_IDLE_MS = 30 * 60_000;

/** True when a pose's mode, speed byte and zone say "seated in the stands" (the receiver still checks the seat). */
export function seatedWire(mode: number, speedQ: number, zone: number): boolean {
  return mode === Mode.Idle && Math.round(speedQ) === SEAT_SPEED_Q && zone === Zone.Main;
}

// Riding the Island Line (train Phase 3, Nov 23 2026), on the v1 wire with NO relay change, like the seat above:
//  - mode = Mode.Idle, speed byte = TRAIN_SPEED_Q0 + train × TRAIN_WIRE_SEATS + seat (2 … 25: an Idle speed the relay accepts, and
//    under the interpolator's fast-mover threshold), the pose = where the rider sat when their train last stood at a platform (it
//    changes once per stop: no traffic while the train runs). Receivers draw the rider in that seat of that train from the shared
//    timetable clock (lib/town/trainSchedule.ts), so a moving rider costs nothing on the wire.
//  - A plain Idle pose's speed byte is 0 or 1 (Idle is under 0.15 m/s), so it never reads as a train seat.
//  - An old client reads Idle at 0.5 … 6.25 m/s: the friend stands at the platform they last stopped at (the unknown-means-Idle fallback).
export const TRAIN_SPEED_Q0 = 2, TRAIN_WIRE_TRAINS = 3, TRAIN_WIRE_SEATS = 8;
/** The speed byte for seat `seat` of train `train`. */
export const trainSeatCode = (train: number, seat: number): number => TRAIN_SPEED_Q0 + train * TRAIN_WIRE_SEATS + seat;
/** A pose's train seat code (0 … 23: train = code >> 3, seat = code & 7), or -1 when it is not riding. */
export function trainWire(mode: number, speedQ: number): number {
  const q = Math.round(speedQ) - TRAIN_SPEED_Q0;
  return mode === Mode.Idle && q >= 0 && q < TRAIN_WIRE_TRAINS * TRAIN_WIRE_SEATS ? q : -1;
}
