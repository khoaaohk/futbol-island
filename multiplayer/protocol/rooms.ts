// Room poses on the v1 wire (docs/multiplayer-rooms-design.md 2.2). A friend inside a room page (Konbini, Museum, Arcade, Kit Shop)
// sends a NORMAL pose body, so the deployed relay and old clients keep parsing every frame (no new Zone values, no version bump):
//  - zone = Zone.Indoors (old clients: the friend fades out at the island door, as before);
//  - y_dm in the reserved band [ROOM_Y_MIN, ROOM_Y_MAX] marks "x / z are room-local metres * 10" (island poses never go below -29 m);
//  - the speed byte (body[4]) carries the ROOM CODE in every mode (Konbini = 8 = Activity.Konbini, so an old client still prints
//    "In the Konbini" while that friend is Busy). Receivers derive the walk cycle from the mode or the position delta.
// Pure TS, no imports beyond the protocol types: shared by the client, the dev relay and (Phase 4) the worker.
import { Mode, Zone, type PoseBody } from './types';

export const ROOM_Y_MIN = -400, ROOM_Y_MAX = -300, ROOM_Y_MID = -350; // dm (WORLD_BOUNDS.minY is -400: inside today's range)
/** Room-local x / z are clamped to +-ROOM_XZ_MAX dm (38 m): every room is smaller, and this sits well inside WORLD_BOUNDS. */
export const ROOM_XZ_MAX = 380;

/** Room codes, carried in the speed byte while the pose is a room pose. 5..8 = the Activity codes of the four rooms. */
export const RoomCode = {
  Arcade: 5, Museum: 6, Shop: 7, Konbini: 8,
  /** The Coral Cay Konbini: a separate room (friends in one Konbini never see the other). New rooms use 32..63: old clients read
   *  unknown codes as plain "Busy". */
  KonbiniCay: 32,
  /** Reserved (Phase 5, not built): 40 + dive spot area (1..7) = 41..47. */
  Reef: 40,
} as const;
export type RoomCode = (typeof RoomCode)[keyof typeof RoomCode];

/** A valid room code (5..8, 32..63). */
export function isRoomCode(c: number): boolean {
  return Number.isInteger(c) && ((c >= RoomCode.Arcade && c <= RoomCode.Konbini) || (c >= 32 && c <= 63));
}

const TAU = Math.PI * 2;
const clampI = (v: number, lo: number, hi: number): number => (v < lo ? lo : v > hi ? hi : v);

/** Room-local pose -> wire body (writes `out`, returns it). x / z: room metres * 10 (clamped to +-ROOM_XZ_MAX); y: ROOM_Y_MID + y * 10
 *  clamped to the band; yaw: radians -> 0..255; speed byte = the room code; zone = Indoors. */
export function roomBody(out: PoseBody, room: number, x: number, y: number, z: number, yaw: number, mode: number, flags: number): PoseBody {
  out[0] = clampI(Math.round(x * 10), -ROOM_XZ_MAX, ROOM_XZ_MAX);
  out[1] = clampI(ROOM_Y_MID + Math.round(y * 10), ROOM_Y_MIN, ROOM_Y_MAX);
  out[2] = clampI(Math.round(z * 10), -ROOM_XZ_MAX, ROOM_XZ_MAX);
  out[3] = Math.round((((yaw % TAU) + TAU) % TAU / TAU) * 256) & 255;
  out[4] = isRoomCode(room) ? room : 0;
  out[5] = mode as Mode;
  out[6] = Zone.Indoors;
  out[7] = flags & 3;
  return out;
}

/** The room a body is in (its room code), or -1: an island pose, or a legacy door pose (Indoors with y above the band). */
export function roomOf(body: ArrayLike<number>): number {
  if (body[6] !== Zone.Indoors) return -1;
  const y = body[1];
  if (!(y >= ROOM_Y_MIN && y <= ROOM_Y_MAX)) return -1;
  const c = body[4];
  return isRoomCode(c) ? c : -1;
}

/** Room-local height (m) from the wire y (dm) of a room pose. */
export function roomLocalY(yDm: number): number {
  return (yDm - ROOM_Y_MID) / 10;
}
