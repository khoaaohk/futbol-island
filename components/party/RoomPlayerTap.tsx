'use client';
// Tap on a player in the Arcade, Museum, Kit Shop and Konbini (public island phase 1, Nov 11 2026). The room page calls
// roomTapPlayer() from its canvas tap ONLY when its own pick found no cabinet / exhibit / shelf (those keep priority), and mounts
// <RoomPlayerCard/>. Flag off: both are inert and nothing else is loaded (the card and the picking are dynamic imports), so the room
// pages keep loading no party code (useRoomParty.ts).
import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { publicWorldEnabled } from '@/lib/multiplayer/publicFlag';
import type { RoomPartyHandle } from './useRoomParty';
import { Emote } from '../../multiplayer/protocol';

const PlayerCard = dynamic(() => import('./PlayerCard'), { ssr: false });
type TapMod = typeof import('./usePlayerTap');
let tapMod: TapMod | null = null;
const loadTap = () => import('./usePlayerTap').then((m) => (tapMod = m));

/** A tap (viewport px) on the room canvas that the room's own pick did not use. */
export function roomTapPlayer(party: RoomPartyHandle | null, clientX: number, clientY: number, canvas: HTMLElement): void {
  if (!publicWorldEnabled() || !party) return;
  void loadTap().then((m) => m.tapPlayer(clientX, clientY, canvas, party.layer, () => { party.emote(Emote.Wave); return true; }, true)).catch(() => {});
}

/** Konbini only (owner, Nov 12 2026): the nearer thing wins. Asked BEFORE the shelf pick with the depth of the shelf the tap hits
 *  (konbiniScene.shelfDepth): true = a stranger stands in front of it and their card opened, so the shelf is skipped. Synchronous, so
 *  it uses the module RoomPlayerCard preloads; until that lands it answers false and the shelf works as before. */
export function roomTapPlayerNearer(party: RoomPartyHandle | null, clientX: number, clientY: number, canvas: HTMLElement, shelfDepth: number): boolean {
  if (!publicWorldEnabled() || !party || !tapMod) return false;
  return tapMod.tapPlayer(clientX, clientY, canvas, party.layer, () => { party.emote(Emote.Wave); return true; }, true, shelfDepth);
}

/** The card, in a room (null with the flag off or without a live layer). `blocked`: an overlay or a zoomed shelf / exhibit. */
export function RoomPlayerCard({ party, blocked = false }: { party: RoomPartyHandle | null; blocked?: boolean }) {
  const on = publicWorldEnabled() && !!party;
  useEffect(() => { if (on && !tapMod) void loadTap().catch(() => {}); }, [on]); // ready for roomTapPlayerNearer's synchronous answer
  if (!on) return null;
  return <PlayerCard blocked={blocked} />;
}
