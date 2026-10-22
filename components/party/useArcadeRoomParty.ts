'use client';
// The Arcade's party layer (docs/multiplayer-rooms-design.md Phase 3): one per PAGE, not per hub, because a game replaces the hub and
// the party must keep going (Busy "Playing <game>" at the cabinet) and come back with friends when the game ends. The hub registers
// itself through lib/arcade/arcadeRoomHooks.ts; this hook resumes the stored party and attaches lib/arcade/arcadeRoomParty.ts once.
// Flag off: nothing is even loaded (the layer, the chip and the avatar code are dynamic imports). The switch Off leaves the party;
// no stored party: nothing is created and the hub's hooks stay no-ops.
import { useEffect, useState, useSyncExternalStore } from 'react';
import { multiplayerEnabled } from '@/lib/multiplayer/config';
import { multiplayerAllowed, subscribeMultiplayerAllowed } from '@/lib/multiplayerAllowed';
import type { RoomPartyHandle } from './useRoomParty';

export function useArcadeRoomParty(): RoomPartyHandle | null {
  const allowed = useSyncExternalStore(subscribeMultiplayerAllowed, multiplayerAllowed, () => true);
  const [handle, setHandle] = useState<RoomPartyHandle | null>(null);
  useEffect(() => {
    if (!multiplayerEnabled()) return;
    let dead = false, stop: (() => void) | null = null;
    import('@/lib/arcade/arcadeRoomParty').then((m) => { if (!dead) stop = m.startArcadeParty(allowed, setHandle); }).catch(() => {});
    return () => { dead = true; stop?.(); };
  }, [allowed]);
  return handle;
}
