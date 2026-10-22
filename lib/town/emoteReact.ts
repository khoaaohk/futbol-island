// Island emotes (user, Oct 22 2026): the Emote button is always on the island, with or without a party. Pure helpers only:
// which townsperson reacts, the 2 s cooldown, busy townsfolk, the arm/hop timing, and the tiny bus the button fires into.
import {celebrationJump} from '../graphics/celebrations';

/** The four preset emotes. The numbers are the multiplayer protocol's Emote values (multiplayer/protocol/types.ts). */
export const EMOTE = {Wave: 0, Cheer: 1, HighFive: 2, WellPlayed: 5} as const;
export type LocalEmote = (typeof EMOTE)[keyof typeof EMOTE];
export const LOCAL_EMOTES: {emote: LocalEmote; icon: string; label: string}[] = [
  {emote: EMOTE.Wave, icon: 'hand', label: 'Wave'},
  {emote: EMOTE.HighFive, icon: 'handshake', label: 'High five'},
  {emote: EMOTE.Cheer, icon: 'star', label: 'Cheer'},
  {emote: EMOTE.WellPlayed, icon: 'heart', label: 'Well played'},
];
export const EMOTE_EMOJI: Record<number, string> = {0: '\u{1F44B}', 1: '\u{1F389}', 2: '\u{1F64C}', 5: '\u{1F44F}'};
/** Your own pose + bubble last 1.5 s (same as a friend's); a townsperson answers for 2 s. */
export const EMOTE_SECONDS = 1.5, NPC_EMOTE_SECONDS = 2, NPC_COOLDOWN_SECONDS = 2, NPC_EMOTE_RANGE = 5;

export interface EmoteCandidate {id: string; x: number; y: number; z: number; busy: boolean; cooldownUntil: number}
/** The nearest townsperson within `range` metres (3D, like the Talk prompt) that is not busy and not cooling down. */
export function pickEmoteNpc(list: readonly EmoteCandidate[], p: {x: number; y: number; z: number}, now: number, range = NPC_EMOTE_RANGE): string | null {
  let best: string | null = null, bestD = range;
  for (let i = 0; i < list.length; i++) {
    const c = list[i];
    if (c.busy || now < c.cooldownUntil) continue;
    const d = Math.hypot(c.x - p.x, c.y - p.y, c.z - p.z);
    if (d <= bestD) { bestD = d; best = c.id; }
  }
  return best;
}
/** Busy townsfolk ignore emotes: riding or driving, sleeping, hidden, stunned, or in a court freestyle routine. */
export function npcBusy(e: {travel?: string; pose?: string; visible: boolean; stunned: boolean; freestyle: boolean}): boolean {
  return Boolean(e.travel && e.travel !== 'run') || e.pose === 'lie' || !e.visible || e.stunned || e.freestyle;
}
const ramp = (age: number, dur: number) => Math.max(0, Math.min(1, age / .2, (dur - age) / .2));
/** The raised "called" arm for a wave or a high five (0 for the celebration emotes). */
export function emoteCalled(emote: number, age: number, dur: number): number {
  return emote === EMOTE.Wave || emote === EMOTE.HighFive ? ramp(age, dur) : 0;
}
/** Cheer / Well played: celebration progress 0..1 (or -1 when the emote is not a celebration). */
export function emoteCelebration(emote: number, age: number, dur: number): number {
  return emote === EMOTE.Cheer || emote === EMOTE.WellPlayed ? Math.min(1, age / dur) : -1;
}
export const emoteHop = (p: number) => celebrationJump(p);

/** The button fires; Town registers the one handler (plays it on you, sends it to friends, wakes the nearest townsperson). */
type Handler = (e: LocalEmote) => void;
let handler: Handler | null = null;
export const emoteBus = {
  set(h: Handler | null) { handler = h; },
  fire(e: LocalEmote): boolean { if (!handler) return false; handler(e); return true; },
};
