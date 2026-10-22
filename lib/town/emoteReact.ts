// Island emotes (user, Oct 22 2026): the Emote button is always on the island, with or without a party. Pure helpers only:
// which townsperson reacts, the 2 s cooldown, busy townsfolk, the arm/hop timing, and the tiny bus the button fires into.
import {celebrationJump} from '../graphics/celebrations';
import {RIDE_SCRIPTS, rideScriptsFor} from './rideEmotes';
import {CTX_EMOTE_EMOJI} from './emoteContexts';
import {NPC_SET_EMOJI} from './npcEmoteSets';
import {MOVE_EMOTE_EMOJI} from './moveEmotes';
import {JUGGLE_SECONDS, PASS_SECONDS as PASS_LEN} from './emotePass';

/** The ten preset emotes (the wheel shows five at a time and scrolls). The numbers are the multiplayer protocol's Emote values (multiplayer/protocol/types.ts). */
export const EMOTE = {Wave: 0, Cheer: 1, HighFive: 2, JuggleWithMe: 3, ShowOff: 4, WellPlayed: 5, PassBall: 6, Laugh: 7, Dance: 8, Thanks: 9} as const;
export type LocalEmote = (typeof EMOTE)[keyof typeof EMOTE];
export const LOCAL_EMOTES: {emote: LocalEmote; icon: string; label: string}[] = [
  {emote: EMOTE.Wave, icon: 'hand', label: 'Wave'},
  {emote: EMOTE.HighFive, icon: 'handshake', label: 'High five'},
  {emote: EMOTE.Cheer, icon: 'star', label: 'Cheer'},
  {emote: EMOTE.WellPlayed, icon: 'heart', label: 'Well played'},
  {emote: EMOTE.PassBall, icon: 'pass', label: 'Pass it'},
  {emote: EMOTE.Laugh, icon: 'smile', label: 'Laugh'},
  {emote: EMOTE.Dance, icon: 'music', label: 'Dance'},
  {emote: EMOTE.Thanks, icon: 'thanks', label: 'Thanks'},
  {emote: EMOTE.JuggleWithMe, icon: 'juggle-air', label: 'Juggle with me'},
  {emote: EMOTE.ShowOff, icon: 'show-off', label: 'Show off'},
];
/** What the wheel shows: on foot the ten presets; on a scooter, bike or moped (user, Oct 22 2026) Wave, Cheer and the three scripted rides that fit that vehicle (foot-only emotes are hidden). */
export interface WheelEmote {emote: number; icon: string; label: string}
export function wheelEmotesFor(ride: string): WheelEmote[] {
  const scripts = rideScriptsFor(ride);
  if (!scripts.length) return LOCAL_EMOTES;
  return [{emote: EMOTE.Wave, icon: 'hand', label: 'Wave'}, ...scripts.map(r => ({emote: r.emote, icon: r.icon, label: r.label})), {emote: EMOTE.Cheer, icon: 'star', label: 'Cheer'}];
}
export const EMOTE_EMOJI: Record<number, string> = {...CTX_EMOTE_EMOJI, ...NPC_SET_EMOJI, ...MOVE_EMOTE_EMOJI, ...Object.fromEntries(RIDE_SCRIPTS.map(r => [r.emote, r.emoji])), 0: '\u{1F44B}', 1: '\u{1F389}', 2: '\u{1F64C}', 5: '\u{1F44F}', 3: '\u{1F939}', 4: '\u{1F31F}', 6: '\u{26BD}', 7: '\u{1F602}', 8: '\u{1F483}', 9: '\u{1F64F}'};
/** Every simple emote lasts about 4 s (user, Oct 22 2026), for you, a friend and a townsperson alike; Pass it ~5.9 s (five passes); a high five with a variation keeps its own length. */
export const EMOTE_SECONDS = 4, NPC_EMOTE_SECONDS = 4, PASS_SECONDS = PASS_LEN, NPC_BUBBLE_SECONDS = 4, NPC_COOLDOWN_SECONDS = 2, NPC_EMOTE_RANGE = 9;
/** A townsperson farther than NPC_STEP_FROM (m) takes up to NPC_STEP_MAX steps toward you (never closer than NPC_STEP_TO) at NPC_STEP_SPEED m/s. */
export const NPC_STEP_FROM = 3, NPC_STEP_TO = 2.2, NPC_STEP_MAX = 2.5, NPC_STEP_SPEED = 3.6;
/** How far a townsperson at distance `d` walks toward the player so the two fit one close frame (0 when already close). */
export const npcStepDistance = (d: number): number => d <= NPC_STEP_FROM ? 0 : Math.min(NPC_STEP_MAX, d - NPC_STEP_TO);

export interface EmoteCandidate {id: string; x: number; y: number; z: number; busy: boolean; cooldownUntil: number}
/** The best townsperson within `range` metres (3D) that is not busy and not cooling down: the nearest, with a bonus of up to 2 m for one
 *  in front of you (`facing` = your unit heading on the ground). A merely walking townsperson counts; only `busy` ones are skipped. */
export function pickEmoteNpc(list: readonly EmoteCandidate[], p: {x: number; y: number; z: number}, now: number, range = NPC_EMOTE_RANGE, facing?: {x: number; z: number}): string | null {
  let best: string | null = null, bestScore = Infinity;
  for (let i = 0; i < list.length; i++) {
    const c = list[i];
    if (c.busy || now < c.cooldownUntil) continue;
    if (Math.abs(c.y - p.y) > 4) continue; // another floor / a rooftop above: not in the same scene
    const d = Math.hypot(c.x - p.x, c.z - p.z);
    if (d > range) continue;
    let score = d;
    if (facing && d > .05) score -= 2 * Math.max(0, ((c.x - p.x) * facing.x + (c.z - p.z) * facing.z) / d);
    if (score < bestScore) { bestScore = score; best = c.id; }
  }
  return best;
}
/** Busy townsfolk ignore emotes: riding or driving, sleeping, hidden, stunned, or in a court freestyle routine. */
export function npcBusy(e: {travel?: string; pose?: string; visible: boolean; stunned: boolean; freestyle: boolean}): boolean {
  return Boolean(e.travel && e.travel !== 'run') || e.pose === 'lie' || !e.visible || e.stunned || e.freestyle;
}
/** How long an emote runs (s). */
export const emoteSeconds = (emote: number): number => emote === EMOTE.PassBall ? PASS_SECONDS : emote === EMOTE.JuggleWithMe ? JUGGLE_SECONDS : emote === EMOTE.HighFive ? 2.2 : EMOTE_SECONDS;
const ramp = (age: number, dur: number) => Math.max(0, Math.min(1, age / .2, (dur - age) / .2));
/** The raised "called" arm for a wave or a high five (0 for the celebration emotes). */
export function emoteCalled(emote: number, age: number, dur: number): number {
  return emote === EMOTE.Wave || emote === EMOTE.HighFive ? ramp(age, dur) : 0;
}
/** Cheer: celebration progress 0..1 (or -1 when the emote is not a cheer). Two full cheers (hops, arms up V, fist pump) back to back fill the 4 s. */
export function emoteCelebration(emote: number, age: number, dur: number): number {
  if (emote !== EMOTE.Cheer) return -1;
  const u = Math.min(.9999, Math.max(0, age / dur)) * 2;
  return u - Math.floor(u);
}
/** Well played: the clap (0 = not a clap, else the ramped weight 0..1).  */
export function emoteClap(emote: number, age: number, dur: number): number {
  return emote === EMOTE.WellPlayed ? ramp(age, dur) : 0;
}
export const emoteHop = (p: number) => celebrationJump(p);

/** The button fires; Town registers the one handler (plays it on you, sends it to friends, wakes the nearest townsperson). */
type Handler = (e: number) => void;
let handler: Handler | null = null;
export const emoteBus = {
  set(h: Handler | null) { handler = h; },
  fire(e: number): boolean { if (!handler) return false; handler(e); return true; },
};
