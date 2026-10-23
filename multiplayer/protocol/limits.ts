// Rate limits, world bounds, speed checks and pose clamping (design 4.4 / 4.5).
import { Mode, Zone, type PoseBody } from './types';
import { RoomCode, roomOf } from './rooms';

export const RATE = {
  pose: [12, 16], // relay v1.2: 10 Hz near poses (was [8, 12] for 5 Hz)
  ball: [12, 16],
  emote: [0.5, 2],
  ping: [0.33, 2],
  control: [1, 3],
  closeAbovePerSec: 30,
  emotePerMin: 10,
} as const;

/** Decimetres. Contains main island, Cay (612,-160), Summit (640,130) with margin for flight. */
export const WORLD_BOUNDS = { minX: -4000, maxX: 10000, minZ: -6000, maxZ: 6000, minY: -400, maxY: 2000 } as const;

export const MAX_SPEED_MS: Record<Mode, number> = {
  [Mode.Walk]: 3.7 * 1.7,
  [Mode.Run]: 3.7 * 1.7,
  [Mode.Scooter]: 14,
  [Mode.Bike]: 20,
  [Mode.Moped]: 28,
  [Mode.Jetpack]: 34,
  [Mode.Parachute]: 6,
  [Mode.Zipline]: 6,
  [Mode.Swim]: 3,
  [Mode.Dive]: 6,
  [Mode.AnimalRide]: 6,
  [Mode.Fishing]: 6,
  [Mode.Busy]: 6,
  [Mode.Idle]: 6,
};

const isInt = (n: unknown): n is number => typeof n === 'number' && Number.isInteger(n);
const inRange = (n: unknown, lo: number, hi: number): boolean => isInt(n) && n >= lo && n <= hi;

/** Returns a fresh copy of the body if valid, else null. */
export function clampPose(body: PoseBody): PoseBody | null {
  if (!Array.isArray(body) || body.length !== 8) return null;
  const [x, y, z, yaw, sp, mode, zone, flags] = body;
  const B = WORLD_BOUNDS;
  if (!inRange(x, B.minX, B.maxX) || !inRange(y, B.minY, B.maxY) || !inRange(z, B.minZ, B.maxZ)) return null;
  if (!inRange(yaw, 0, 255) || !inRange(sp, 0, 255)) return null;
  if (!inRange(mode, Mode.Walk, Mode.Idle) || !inRange(zone, Zone.Main, Zone.Indoors)) return null;
  if (!inRange(flags, 0, 3)) return null;
  return [x, y, z, yaw, sp, mode, zone, flags];
}

/**
 * Relay v1.1 (docs/multiplayer-rooms-design.md 2.3 item 1, "ROOM_BOUNDS"; renamed so it never shadows the client's roomPos ROOM_BOUNDS): half extents (m) of each room's floor, room-local and centred on 0,
 * = the client clamp (lib/multiplayer/roomPos.ts ROOM_BOUNDS, lib/multiplayer/rooms/*.ts) + a 3 m margin, rounded up. A room pose
 * (roomOf(body) >= 0) outside its room is DROPPED by the relay (never bad(): a layout change must never kick anyone). Rooms with
 * no entry (future codes 33..63) are only held to ROOM_XZ_MAX / WORLD_BOUNDS, so a new room never needs a relay deploy first.
 * tests/mp-rooms.cjs keeps every client clamp + 3 m inside these.
 */
export const RELAY_ROOM_BOUNDS: Readonly<Record<number, { hx: number; hz: number }>> = (() => {
  const t: Record<number, { hx: number; hz: number }> = {
    [RoomCode.Konbini]: { hx: 11, hz: 10 }, // client clamp |x| 7.4, |z| 6.3 (+3 = 9.3, so 10, not the 9 in the design table)
    [RoomCode.KonbiniCay]: { hx: 11, hz: 10 },
    [RoomCode.Museum]: { hx: 25, hz: 22 }, // |x| 21, |z| 18
    [RoomCode.Arcade]: { hx: 18, hz: 16 }, // |x| 14, |z| 12
    [RoomCode.Shop]: { hx: 12, hz: 10 }, // |x| 8, |z| 7
  };
  for (let a = 1; a <= 7; a++) t[RoomCode.Reef + a] = { hx: 28, hz: 28 }; // Reef spots 41..47 (Phase 5, reserved)
  return t;
})();

/** True unless `body` is a room pose standing outside its room's RELAY_ROOM_BOUNDS (island poses and unknown rooms: true). */
export function roomBoundsOk(body: ArrayLike<number>): boolean {
  const room = roomOf(body);
  if (room < 0) return true;
  const b = RELAY_ROOM_BOUNDS[room];
  if (!b) return true;
  return Math.abs(body[0]) <= b.hx * 10 && Math.abs(body[2]) <= b.hz * 10;
}

/** Distance (m) <= MAX_SPEED_MS[next mode] * 1.5 * dt + 2. Always true with Warp (caller limits Warp to 1 per 5 s). */
export function speedOk(prev: PoseBody, next: PoseBody, dtMs: number): boolean {
  if (next[7] & 1) return true;
  const dx = (next[0] - prev[0]) / 10;
  const dy = (next[1] - prev[1]) / 10;
  const dz = (next[2] - prev[2]) / 10;
  const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
  const max = MAX_SPEED_MS[next[5]] ?? 6;
  return dist <= max * 1.5 * (Math.max(0, dtMs) / 1000) + 2;
}

export class TokenBucket {
  private tokens: number;
  private last = -1;
  constructor(private perSec: number, private burst: number) {
    this.tokens = burst;
  }
  take(nowMs: number): boolean {
    if (this.last >= 0 && nowMs > this.last) {
      this.tokens = Math.min(this.burst, this.tokens + ((nowMs - this.last) / 1000) * this.perSec);
    }
    this.last = nowMs;
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return true;
    }
    return false;
  }
}
