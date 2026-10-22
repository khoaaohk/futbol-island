// Room positions for the client (docs/multiplayer-rooms-design.md 2.2, 2.3): which room code a page is, each room's walkable
// bounds (room-local metres), and encode / decode of a room-local pose. Pure: no three.js, no React, no storage.
import { RoomCode, isRoomCode, roomBody, roomLocalY, roomOf, type PoseBody } from '../../multiplayer/protocol';

export { RoomCode, isRoomCode, roomBody, roomOf, roomLocalY };

/** Walkable room-local bounds (m), from each scene's own clamp (konbiniScene collide, museumScene, arcadeRoomScene, shopScene).
 *  Both Konbinis share one layout engine (the door is at x -2 in main, +2 in cay). */
export type RoomBounds = { minX: number; maxX: number; minZ: number; maxZ: number };
export const ROOM_BOUNDS: Record<number, RoomBounds> = {
  [RoomCode.Konbini]: { minX: -7.4, maxX: 7.4, minZ: -5.6, maxZ: 6.3 },
  [RoomCode.KonbiniCay]: { minX: -7.4, maxX: 7.4, minZ: -5.6, maxZ: 6.3 },
  [RoomCode.Museum]: { minX: -21, maxX: 12, minZ: -8, maxZ: 18 },
  [RoomCode.Arcade]: { minX: -14, maxX: 14, minZ: -11, maxZ: 12 },
  [RoomCode.Shop]: { minX: -8, maxX: 8, minZ: -7, maxZ: 4.5 },
};

/** The room code of a Konbini page: the two Konbinis are SEPARATE rooms (owner decision, Oct 22 2026). */
export function konbiniRoom(shop: 'main' | 'cay'): number {
  return shop === 'cay' ? RoomCode.KonbiniCay : RoomCode.Konbini;
}

/** Inside the room's bounds (+ margin m)? Unknown rooms: false. */
export function inRoomBounds(room: number, x: number, z: number, margin = 0): boolean {
  const b = ROOM_BOUNDS[room];
  return !!b && x >= b.minX - margin && x <= b.maxX + margin && z >= b.minZ - margin && z <= b.maxZ + margin;
}

/** Clamp a room-local point into the room (writes `out`). A receiver uses it so a stale or odd pose never stands in a wall. */
export function clampToRoom(room: number, x: number, z: number, out: { x: number; z: number }): { x: number; z: number } {
  const b = ROOM_BOUNDS[room];
  if (!b) { out.x = x; out.z = z; return out; }
  out.x = x < b.minX ? b.minX : x > b.maxX ? b.maxX : x;
  out.z = z < b.minZ ? b.minZ : z > b.maxZ ? b.maxZ : z;
  return out;
}

/** Room-local pose -> wire body, clamped to the room's bounds first. */
export function encodeRoomPose(out: PoseBody, room: number, p: { x: number; y: number; z: number; facing: number }, mode: number, flags: number): PoseBody {
  const b = ROOM_BOUNDS[room];
  const x = b ? Math.max(b.minX, Math.min(b.maxX, p.x)) : p.x, z = b ? Math.max(b.minZ, Math.min(b.maxZ, p.z)) : p.z;
  return roomBody(out, room, x, p.y, z, p.facing, mode, flags);
}

export type DecodedRoomPose = { room: number; x: number; y: number; z: number; yaw: number };
/** Wire body -> room-local pose (writes `out`); false (out untouched) when the body is not a room pose. */
export function decodeRoomPose(body: ArrayLike<number>, out: DecodedRoomPose): boolean {
  const room = roomOf(body);
  if (room < 0) return false;
  out.room = room; out.x = body[0] / 10; out.y = roomLocalY(body[1]); out.z = body[2] / 10; out.yaw = (body[3] * Math.PI * 2) / 256;
  return true;
}
