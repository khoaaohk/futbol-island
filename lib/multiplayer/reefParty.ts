// Shared reefs (docs/multiplayer-rooms-design.md Phase 5, owner Nov 21 2026: "this should be a shared experience"). Players diving
// the SAME reef see each other swim inside the dive room; the island shows "2 exploring" at the flag. No relay change: a diver sends an
// ordinary room pose (rooms.ts roomBody) under the reef's room code 40 + spot area (41..47), Mode.Dive, room-local metres; the relay's
// room rules (v1.1: same-room 5 Hz, room flip = implicit warp, RELAY_ROOM_BOUNDS Reef 28 x 28 m) already cover it.
// The friend layer is the rooms' createRoomParty (one remote batch, one ring, labels) made in the dive scene on the way under and
// disposed on the way up: nothing exists or runs on the island for it. Caps: reefCap (3 rigs on phones / tier 2+, 5 on desktop,
// Battery saver 0), nearest first (remoteAvatars' rig priority). No analytics imports (tests/mp-isolation.cjs).
import type * as THREE from 'three';
import { reefArea, reefRoom } from '../../multiplayer/protocol';
import { createRoomParty, reefCap, type RoomParty } from './roomParty';
import type { RoomLocal } from './presence';

export { reefRoom, reefArea } from '../../multiplayer/protocol';
export { REEF_PHONE_CAP, reefCap } from './roomParty';

/** The flag hint over a dive spot's buoy: "2 exploring" ('' when nobody is). Pure. */
export function reefHintText(n: number): string {
  return n > 0 ? `${n} exploring` : '';
}
/** The dive prompt when others are down there (kid-facing, short): "Dive in: 2 friends exploring"; strangers on the public island are
 *  "players". n = 0: the usual Explore label (the caller's). Pure. */
export function reefPromptText(n: number, world: boolean): string {
  if (!(n > 0)) return '';
  const who = world ? (n === 1 ? 'player' : 'players') : n === 1 ? 'friend' : 'friends';
  return `Dive in: ${n} ${who} exploring`;
}
/** The prompt's spoken label with others down there. Pure. */
export function reefPromptAria(n: number, world: boolean): string {
  if (!(n > 0)) return '';
  const who = world ? (n === 1 ? 'player is' : 'players are') : n === 1 ? 'friend is' : 'friends are';
  return `Dive in and explore: ${n} ${who} exploring this reef`;
}

export interface ReefParty {
  readonly room: number;
  /** One dive frame (before the room render): samples, draws and sends. dt s, nowMs = performance.now(). */
  update(dt: number, nowMs: number, camera: THREE.Camera): void;
  /** The beat while the dive loop is stopped (the island runtime forwards its beat hook here, townBridge setRoomLayer). */
  sendNow(): void;
  readonly shown: number;
  readonly rigs: number;
  debugFriends(): ReturnType<RoomParty['debugFriends']>;
  dispose(): void;
}

/** The reef layer for dive spot `area` in the dive room's scene; null when multiplayer is off, there is no party / world slot, or the
 *  area is not a reef. The first pose is a Warp (+ the 5.5 s retry): island -> reef is a jump the relay would otherwise refuse. */
export function createReefParty(ctx: { scene: THREE.Scene; area: number; local: () => RoomLocal; phone: boolean; reducedMotion: () => boolean;
  onEmoteSeen?: () => void }): ReefParty | null {
  const room = reefRoom(ctx.area);
  if (room < 0 || reefArea(room) < 0) return null;
  const rp = createRoomParty({ scene: ctx.scene, room, local: ctx.local, phone: ctx.phone, reducedMotion: ctx.reducedMotion,
    wake: () => {}, // the dive room renders every frame (its own rest cap): nothing to wake
    onEmoteSeen: ctx.onEmoteSeen, cap: reefCap, ownBeat: false, closeLabels: true });
  if (!rp) return null;
  rp.warpNext();
  rp.sendNow();
  return {
    room,
    update(dt, nowMs, camera) { rp.update(dt, nowMs, camera, false); },
    sendNow() { rp.sendNow(); },
    get shown() { return rp.shown; },
    get rigs() { return rp.rigs; },
    debugFriends: () => rp.debugFriends(),
    dispose() { rp.dispose(); },
  };
}
