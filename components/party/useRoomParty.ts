'use client';
// Mounts the party friend layer in a room page (docs/multiplayer-rooms-design.md 3.1-3.3). A few lines per room:
//   const party = useRoomParty(roomRef, konbiniRoom(shop), ready, busy);
//   {party && <RoomPartyChip party={party} hidden={covered} />}
// It resumes the stored party on page load (party persistence: connection.resume({look})), creates the layer once the scene is up,
// and disposes it on unmount WITHOUT closing the connection (the next page resumes the slot). Only Leave / End / the grown-up switch
// close it. Flag off, the switch Off, or no stored party: nothing is created and the room's frame loop never sees a layer.
import { useEffect, useRef, useState, useSyncExternalStore, type RefObject } from 'react';
import type * as THREE from 'three';
import { multiplayerEnabled } from '@/lib/multiplayer/config';
import { multiplayerAllowed, subscribeMultiplayerAllowed } from '@/lib/multiplayerAllowed';
import type { RoomParty } from '@/lib/multiplayer/roomParty';
import { STATION, type RoomLocal } from '@/lib/multiplayer/presence'; // pure constants (no connection, no three.js)
import { Emote } from '../../multiplayer/protocol';
// Flag off, the room pages load NO party code (verifier, Oct 22 2026: the Konbini, Museum and Kit Shop pages shipped the connection,
// the avatar layer and the chip in their first chunks): the layer is a dynamic import behind multiplayerEnabled(), as in the Arcade.
const loadLayer = () => import('@/lib/multiplayer/roomParty');

/** What a room scene exposes for its party layer (konbiniScene.ts, museumScene.ts; the Kit Shop through lib/multiplayer/rooms/shopHooks.ts; the Arcade next). */
export interface RoomPartyHost {
  readonly threeScene: THREE.Scene; readonly phone: boolean; readonly reduced: boolean;
  setFriendLayer(layer: RoomParty | null): void;
  wakeRemote(): void;
  /** The busy kind at a room-local spot: the Konbini's words, or a STATION code (a room's own local codes, e.g. the Kit Shop). */
  stationAt(x: number, z: number): 'counter' | 'shelves' | null | number;
  /** A room with its own station lines (the Museum: presence.defineStationLines codes >= 110) returns the code directly. */
  stationCode?(x: number, z: number): number;
  localPose(): { x: number; z: number; facing: number; speed: number; eating: boolean; zoomed: boolean };
  emote(kind: number, face?: { x: number; z: number } | null): void;
}
export interface RoomPartyHandle { readonly layer: RoomParty; readonly room: number;
  /** An emote from the wheel: sent to the party and played on your own rig (a high five turns you to the nearest friend here). */
  emote(kind: number): void }

export function useRoomParty(hostRef: RefObject<RoomPartyHost | null>, room: number, ready: boolean, busy: boolean): RoomPartyHandle | null {
  const allowed = useSyncExternalStore(subscribeMultiplayerAllowed, multiplayerAllowed, () => true);
  const busyRef = useRef(busy);
  busyRef.current = busy;
  const [handle, setHandle] = useState<RoomPartyHandle | null>(null);
  // Back into the stored party as the page loads (before the scene is ready), and the grown-up switch Off leaves from any room.
  useEffect(() => {
    if (!multiplayerEnabled()) return;
    let dead = false;
    loadLayer().then(({ partyConnection, partyLook }) => {
      if (dead) return;
      const conn = partyConnection();
      if (!allowed) { if (conn.hasSession() || conn.status !== 'idle') conn.leave(); return; }
      conn.resume({ look: partyLook() });
    }).catch(() => {});
    return () => { dead = true; };
  }, [allowed]);
  useEffect(() => {
    const host = hostRef.current;
    if (!ready || !host || !allowed || !multiplayerEnabled()) return;
    let dead = false, layer: RoomParty | null = null;
    loadLayer().then(({ createRoomParty, partyConnection, partyLook }) => {
      if (dead) return;
      // The resume effect's import may land after this one: resume here too (a no-op when already resuming / live).
      partyConnection().resume({ look: partyLook() });
      const out: RoomLocal = { x: 0, y: 0, z: 0, facing: 0, speed: 0, busy: false, hidden: false };
      layer = createRoomParty({
        scene: host.threeScene, room, phone: host.phone, reducedMotion: () => host.reduced, wake: host.wakeRemote,
        local: () => {
          const l = host.localPose();
          out.x = l.x; out.z = l.z; out.facing = l.facing; out.speed = l.speed;
          out.busy = busyRef.current || l.eating || l.zoomed; out.hidden = typeof document !== 'undefined' && document.hidden;
          return out;
        },
        station: host.stationCode ? (x, z) => host.stationCode!(x, z) : (x, z) => { const k = host.stationAt(x, z); return typeof k === 'number' ? k : k === 'counter' ? STATION.Counter : k === 'shelves' ? STATION.Shelves : STATION.Snack; },
      });
      if (!layer) return;
      const l0 = layer;
      host.setFriendLayer(l0);
      host.wakeRemote();
      setHandle({
        layer: l0, room,
        emote(kind) {
          l0.sendEmote(kind);
          const l = host.localPose();
          host.emote(kind, kind === Emote.HighFive ? l0.nearestFriend(l.x, l.z, 3) : null); // friend-pair emotes pick from friendsHere()
        },
      });
    }).catch(() => {});
    return () => { dead = true; if (layer) { host.setFriendLayer(null); layer.dispose(); layer = null; } setHandle(null); };
  }, [ready, room, allowed, hostRef]);
  return handle;
}
