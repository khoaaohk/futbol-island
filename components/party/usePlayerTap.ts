'use client';
// Public island, tap on a player (phase 1, Nov 11 2026; docs/multiplayer-public-island-plan-2026-11-11.md): the glue between a tap on
// the 3D view and PlayerCard. Town (pickCharacter) and the room pages (their canvas pointerup) call tapPlayer() only behind
// publicWorldEnabled(); with the flag off nothing here runs and the game behaves exactly as before (tests/mp-player-tap.cjs).
//
// Priority (the callers keep it): Town asks only after its own player, a live-match player, the islanders / coaches / volleyball
// players, the vending machines and the gashapon machines missed; a remote player then wins over the big building boxes behind
// them (ferry, Museum, Kit Shop, Arcade, Konbini, Coaches) because the tap is on their body, which stands in front. Rooms ask only
// when the room's own pick found no cabinet / exhibit / shelf. A drag (> 10-12 px) never reaches here: the callers' tap tests.
//
// One card at a time. While it shows it holds the one-message lane (lib/ui/toastLane.ts, id 'player-card'), so nothing stacks on
// it; it never opens while another card or quiet gap holds the lane (Welcome back, the first-time card, the dive's find card).
import * as T from 'three';
import { pickRemote, anchorFor, playerNearer, BODY_H, type TapSpot } from '@/lib/graphics/remotePick';
import { partyStore } from '@/lib/multiplayer/store';
import { publicWorldEnabled } from '@/lib/multiplayer/publicFlag';
import { toastLane } from '@/lib/ui/toastLane';

export const PLAYER_CARD_LANE = 'player-card';
/** What the tap needs from the avatar layer (townBridge PartyRuntime / RoomParty / RemoteAvatars). */
export interface TapSource { tapSpots(): { camera: T.Camera | null; spots: TapSpot[] } }
export interface PlayerCardOpen {
  id: number; friend: boolean; kind: 'party' | 'world' | null;
  /** Viewport px just above their head (desktop anchor); null = off screen (docked). */
  anchor: { x: number; y: number } | null;
  room: boolean;
}
type Ctx = { source: TapSource; canvas: HTMLElement; wave: () => boolean; room: boolean };

let open: PlayerCardOpen | null = null, ctx: Ctx | null = null;
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());
const v3 = new T.Vector3();

/** Projects with the layer's last camera into canvas px. */
export function projector(camera: T.Camera, w: number, h: number) {
  return (x: number, y: number, z: number) => { v3.set(x, y, z).project(camera); return { x: (v3.x + 1) / 2 * w, y: (1 - v3.y) / 2 * h, z: v3.z }; };
}

export const playerCard = {
  get: () => open,
  subscribe(fn: () => void) { subs.add(fn); return () => { subs.delete(fn); }; },
  /** Wave through the opener's emote path (Town: emoteBus; rooms: the room handle). False when it could not be sent. */
  wave: () => (ctx ? ctx.wave() : false),
  /** Where the player is now (feet distance from me, viewport anchor), or null when they are not drawn (left, hidden, indoors, off screen). */
  locate(id: number): { d: number; anchor: { x: number; y: number } | null } | null {
    if (!ctx) return null;
    const { camera, spots } = ctx.source.tapSpots();
    const s = spots.find((p) => p.id === id);
    if (!s || !camera) return null;
    const r = ctx.canvas.getBoundingClientRect(), a = anchorFor(s, projector(camera, r.width, r.height));
    return { d: s.d, anchor: a ? { x: a.x + r.left, y: a.y + r.top } : null };
  },
  close() {
    if (!open) return;
    open = null; ctx = null; toastLane.hold(PLAYER_CARD_LANE, false); emit();
  },
  /** Tests only. */
  reset() { open = null; ctx = null; toastLane.hold(PLAYER_CARD_LANE, false); emit(); },
};

/** A tap (viewport px) on `canvas`: opens the card when it lands on a drawn remote player. True = handled (the caller stops there).
 *  `objectDepth` (Konbini only, Nov 12 2026): the camera-space depth of the shelf the same tap hits; the player must stand nearer. */
export function tapPlayer(clientX: number, clientY: number, canvas: HTMLElement, source: TapSource | null | undefined, wave: () => boolean, room = false, objectDepth?: number): boolean {
  if (!publicWorldEnabled() || !source) return false;
  const s = partyStore.get();
  if (s.kind === null || s.status !== 'live') return false;
  if (!open && toastLane.held) return false; // another card / quiet gap holds the lane (our own hold is let go just below)
  const { camera, spots } = source.tapSpots();
  if (!camera || !spots.length) return false;
  const r = canvas.getBoundingClientRect(), project = projector(camera, r.width, r.height);
  const id = pickRemote(clientX - r.left, clientY - r.top, spots, project);
  if (id === null || id === s.you) return false;
  if (!s.members.some((m) => m.id === id)) return false;
  if (objectDepth !== undefined) { // Konbini: only when they stand in front of the shelf at the tapped point of their body
    const sp = spots.find((p) => p.id === id)!, fy = project(sp.x, sp.y, sp.z).y, hy = project(sp.x, sp.y + BODY_H * Math.min(1, sp.k), sp.z).y;
    if (!playerNearer(sp, (x, y, z) => -v3.set(x, y, z).applyMatrix4(camera.matrixWorldInverse).z, objectDepth, (fy - (clientY - r.top)) / (fy - hy))) return false;
  }
  playerCard.close();
  if (toastLane.held) return false;
  const a = anchorFor(spots.find((p) => p.id === id)!, project);
  ctx = { source, canvas, wave, room };
  open = { id, friend: s.kind !== 'world', kind: s.kind, anchor: a ? { x: a.x + r.left, y: a.y + r.top } : null, room };
  toastLane.hold(PLAYER_CARD_LANE, true);
  emit();
  return true;
}
