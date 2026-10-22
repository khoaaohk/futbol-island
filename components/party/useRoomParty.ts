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
import { createRoomParty, partyConnection, partyLook, type RoomParty } from '@/lib/multiplayer/roomParty';
import { STATION, type RoomLocal } from '@/lib/multiplayer/presence';
import { Emote } from '../../multiplayer/protocol';

/** What a room scene exposes for its party layer (konbiniScene.ts today; the Museum / Arcade / Shop scenes next). */
export interface RoomPartyHost {
  readonly threeScene: THREE.Scene; readonly phone: boolean; readonly reduced: boolean;
  setFriendLayer(layer: RoomParty | null): void;
  wakeRemote(): void;
  stationAt(x: number, z: number): 'counter' | 'shelves' | null;
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
    const conn = partyConnection();
    if (!allowed) { if (conn.hasSession() || conn.status !== 'idle') conn.leave(); return; }
    conn.resume({ look: partyLook() });
  }, [allowed]);
  useEffect(() => {
    const host = hostRef.current;
    if (!ready || !host || !allowed || !multiplayerEnabled()) return;
    const out: RoomLocal = { x: 0, y: 0, z: 0, facing: 0, speed: 0, busy: false, hidden: false };
    const layer = createRoomParty({
      scene: host.threeScene, room, phone: host.phone, reducedMotion: () => host.reduced, wake: host.wakeRemote,
      local: () => {
        const l = host.localPose();
        out.x = l.x; out.z = l.z; out.facing = l.facing; out.speed = l.speed;
        out.busy = busyRef.current || l.eating || l.zoomed; out.hidden = typeof document !== 'undefined' && document.hidden;
        return out;
      },
      station: (x, z) => { const k = host.stationAt(x, z); return k === 'counter' ? STATION.Counter : k === 'shelves' ? STATION.Shelves : STATION.Snack; },
    });
    if (!layer) return;
    host.setFriendLayer(layer);
    host.wakeRemote();
    setHandle({
      layer, room,
      emote(kind) {
        layer.sendEmote(kind);
        const l = host.localPose();
        host.emote(kind, kind === Emote.HighFive ? layer.nearestFriend(l.x, l.z, 3) : null); // friend-pair emotes pick from friendsHere()
      },
    });
    return () => { host.setFriendLayer(null); layer.dispose(); setHandle(null); };
  }, [ready, room, allowed, hostRef]);
  return handle;
}
