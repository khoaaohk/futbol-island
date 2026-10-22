'use client';
// The Arcade's party layer (docs/multiplayer-rooms-design.md Phase 3): one per PAGE, not per hub, because a game replaces the hub and
// the party must keep going (Busy "Playing <game>" at the cabinet) and come back with friends when the game ends. The hub registers
// itself through lib/arcade/arcadeRoomHooks.ts; this hook resumes the stored party and attaches lib/arcade/arcadeRoomParty.ts once.
// Flag off, the switch Off or no stored party: nothing is created (the hub's hooks stay no-ops).
import { useEffect, useState } from 'react';
import { multiplayerEnabled } from '@/lib/multiplayer/config';
import { attachArcadeLayer } from '@/lib/arcade/arcadeRoomHooks';
import { createArcadeParty } from '@/lib/arcade/arcadeRoomParty';
import { RoomCode } from '@/lib/multiplayer/roomPos';
import { useRoomPartyResume, type RoomPartyHandle } from './useRoomParty';

export function useArcadeRoomParty(): RoomPartyHandle | null {
  const allowed = useRoomPartyResume();
  const [handle, setHandle] = useState<RoomPartyHandle | null>(null);
  useEffect(() => {
    if (!allowed || !multiplayerEnabled()) return;
    const p = createArcadeParty({ phone: matchMedia('(pointer:coarse)').matches, reduced: matchMedia('(prefers-reduced-motion:reduce)').matches });
    if (!p) return;
    const detach = attachArcadeLayer(p.layer);
    setHandle({ layer: p.party, room: RoomCode.Arcade, emote: (kind) => p.emote(kind) });
    return () => { detach(); p.dispose(); setHandle(null); };
  }, [allowed]);
  return handle;
}
