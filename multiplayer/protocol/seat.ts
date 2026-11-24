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

// Riding the Island Line (train Phase 3, Nov 23 2026; every seat + standing, Nov 24 2026), on the v1 wire with NO relay change:
//  - mode = Mode.Idle; the pose x, y, z = where the rider was when their train last stood at a platform (it changes once per stop).
//  - Seated: speed byte = TRAIN_SEAT_Q0 + train (2 … 4), yaw byte = the seat (0 … 27: trainRunning SEAT_TABLE, 14 a car).
//  - Standing in the aisle: speed byte = TRAIN_STAND_Q0 + train × TRAIN_STAND_CODES + hi (5 … 31), yaw byte = lo, where
//    hi × 256 + lo = (uq × TRAIN_STAND_XN + xq) × 4 + face: u (along the train, car 0's frame) in TRAIN_STAND_DU m steps from
//    TRAIN_STAND_U0, x across in TRAIN_STAND_DX m lanes round the centre line, the facing in quarter turns (train frame). It changes
//    only as the rider walks (a few poses a second at most).
//  - Receivers draw the rider from the shared timetable clock (lib/town/trainSchedule.ts): a moving rider costs nothing on the wire.
//  - Every train speed byte is ≤ 31 (≤ 7.75 m/s): under the interpolator's fast-mover brake (8 m/s), so an old client never hides
//    one as an unseen fast mover; a plain Idle pose's speed byte is 0 or 1, so it never reads as a rider. The relay checks the
//    distance moved, not this byte, and the yaw byte is free 0 … 255: the deployed relay accepts it all (no relay deploy).
//  - An old client (no trains) reads an Idle pose at 0.5 … 7.75 m/s: the friend stands at the platform they last stopped at.
export const TRAIN_WIRE_TRAINS = 3, TRAIN_WIRE_SEATS = 28, TRAIN_SEAT_Q0 = 2, TRAIN_STAND_Q0 = TRAIN_SEAT_Q0 + TRAIN_WIRE_TRAINS, TRAIN_STAND_CODES = 9;
export const TRAIN_STAND_U0 = -17, TRAIN_STAND_DU = .2, TRAIN_STAND_UN = 108, TRAIN_STAND_DX = .4, TRAIN_STAND_XN = 5;
/** A rider code (what trainWire returns): train × TRAIN_RIDER_SPAN + place; place < TRAIN_WIRE_SEATS = a seat, else standing state + TRAIN_WIRE_SEATS. */
export const TRAIN_RIDER_SPAN = 4096;
const TAU = Math.PI * 2;
/** Rider code for seat `seat` (0 … 27) of train `train`. */
export const riderSeatCode = (train: number, seat: number): number => train * TRAIN_RIDER_SPAN + Math.max(0, Math.min(TRAIN_WIRE_SEATS - 1, Math.round(seat)));
/** Rider code for standing at train-frame (x across, u along) facing `yaw` (rad, train frame: 0 = toward +u). */
export function riderStandCode(train: number, u: number, x: number, yaw: number): number {
  const uq = Math.max(0, Math.min(TRAIN_STAND_UN - 1, Math.round((u - TRAIN_STAND_U0) / TRAIN_STAND_DU)));
  const xq = Math.max(0, Math.min(TRAIN_STAND_XN - 1, Math.round(x / TRAIN_STAND_DX) + (TRAIN_STAND_XN >> 1)));
  const face = ((Math.round(yaw / (TAU / 4)) % 4) + 4) % 4;
  return train * TRAIN_RIDER_SPAN + TRAIN_WIRE_SEATS + (uq * TRAIN_STAND_XN + xq) * 4 + face;
}
export const riderTrain = (code: number): number => Math.floor(code / TRAIN_RIDER_SPAN);
/** The seat of a rider code, -1 when standing. */
export const riderSeat = (code: number): number => { const p = code % TRAIN_RIDER_SPAN; return p < TRAIN_WIRE_SEATS ? p : -1; };
/** A standing rider code's spot (out.u, out.x m, out.yaw rad, train frame); false when seated. */
export function riderStand(code: number, out: { u: number; x: number; yaw: number }): boolean {
  const p = code % TRAIN_RIDER_SPAN - TRAIN_WIRE_SEATS; if (p < 0) return false;
  const face = p & 3, r = p >> 2, xq = r % TRAIN_STAND_XN, uq = (r - xq) / TRAIN_STAND_XN;
  out.u = TRAIN_STAND_U0 + uq * TRAIN_STAND_DU; out.x = (xq - (TRAIN_STAND_XN >> 1)) * TRAIN_STAND_DX; out.yaw = face * TAU / 4; return true;
}
/** The pose bytes of a rider code: out.q = the speed byte, out.yaw = the yaw byte. */
export function riderBytes(code: number, out: { q: number; yaw: number }): { q: number; yaw: number } {
  const k = riderTrain(code), p = code % TRAIN_RIDER_SPAN;
  if (p < TRAIN_WIRE_SEATS) { out.q = TRAIN_SEAT_Q0 + k; out.yaw = p; return out; }
  const st = p - TRAIN_WIRE_SEATS; out.q = TRAIN_STAND_Q0 + k * TRAIN_STAND_CODES + (st >> 8); out.yaw = st & 255; return out;
}
/** A pose's rider code from its mode, speed byte and yaw byte, or -1 when it is not riding. */
export function trainWire(mode: number, speedQ: number, yawByte: number): number {
  if (mode !== Mode.Idle) return -1;
  const q = Math.round(speedQ), y = Math.round(yawByte) & 255;
  if (q >= TRAIN_SEAT_Q0 && q < TRAIN_STAND_Q0) return y < TRAIN_WIRE_SEATS ? (q - TRAIN_SEAT_Q0) * TRAIN_RIDER_SPAN + y : -1;
  const s = q - TRAIN_STAND_Q0;
  if (s < 0 || s >= TRAIN_WIRE_TRAINS * TRAIN_STAND_CODES) return -1;
  const k = Math.floor(s / TRAIN_STAND_CODES), st = (s % TRAIN_STAND_CODES) * 256 + y;
  return st < TRAIN_STAND_UN * TRAIN_STAND_XN * 4 ? k * TRAIN_RIDER_SPAN + TRAIN_WIRE_SEATS + st : -1;
}
