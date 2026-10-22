// Emote sets for townsfolk that do something of their own (user, Oct 22 2026), pure data + rules, no three.js:
//  C) SKATERS and SCOOTER riders: the wheel shows their set when one is the one you would emote at. The townsperson keeps its route: it only slows
//     for a moment (`slow` = a fraction of its speed, restored afterwards), raises a hand, spins a little or rings its bell; no collision, no teleport.
//  D) JUGGLERS (court freestylers): they keep juggling and answer with a short overlay (a keep-up counter bubble, a nod, a bow, a clap); the ball
//     logic is never touched.
//  E) Townsfolk PLAYING on the field (the beach volleyball rally): they answer ANY emote with ONE short refusal bubble and keep playing.
// Local ids 40..49 (ground 0..9, rides 10..18, flying / swimming 20..34); friends only get the protocol value in `wire`.
export const NPC_SET = {SkateFive: 40, TrickSwap: 41, GlideWave: 42, RideByWave: 43, BellRing: 44, SideGlide: 45, KeepUps: 46, NodHeader: 47, CatchBow: 48, NiceTouch: 49} as const;
export type NpcSetKind = 'skater' | 'scooter' | 'juggler';
export type NpcClass = 'walker' | 'skater' | 'scooter' | 'juggler' | 'field' | 'lie';
export interface NpcScript {
  emote: number; kind: NpcSetKind; label: string; icon: string; emoji: string;
  seconds: number; wire: number;
  /** The fraction of its own speed the townsperson keeps while it answers (1 = unchanged; 0.35 = it nearly stops, then resumes). */
  slow: number;
}
export const NPC_SCRIPTS: readonly NpcScript[] = [
  {emote: NPC_SET.SkateFive, kind: 'skater', label: 'Skate high five', icon: 'handshake', emoji: '\u{1F64C}', seconds: 2.4, wire: 2, slow: .35},
  {emote: NPC_SET.TrickSwap, kind: 'skater', label: 'Trick exchange', icon: 'ride-spin', emoji: '\u{1F300}', seconds: 2.4, wire: 1, slow: .5},
  {emote: NPC_SET.GlideWave, kind: 'skater', label: 'Wave while gliding', icon: 'hand', emoji: '\u{1F44B}', seconds: 2.6, wire: 0, slow: .6},
  {emote: NPC_SET.RideByWave, kind: 'scooter', label: 'Ride-by wave', icon: 'hand', emoji: '\u{1F44B}', seconds: 2.6, wire: 0, slow: .7},
  {emote: NPC_SET.BellRing, kind: 'scooter', label: 'Bell ring', icon: 'ride-bell', emoji: '\u{1F514}', seconds: 2.2, wire: 1, slow: .8},
  {emote: NPC_SET.SideGlide, kind: 'scooter', label: 'Side-by-side glide', icon: 'ride-glide', emoji: '\u{1F6F4}', seconds: 2.4, wire: 0, slow: .45},
  {emote: NPC_SET.KeepUps, kind: 'juggler', label: 'Count my keep-ups', icon: 'star', emoji: '\u{26BD}', seconds: 4, wire: 0, slow: 1},
  {emote: NPC_SET.NodHeader, kind: 'juggler', label: 'Nice header', icon: 'smile', emoji: '\u{1F929}', seconds: 2.4, wire: 1, slow: 1},
  {emote: NPC_SET.CatchBow, kind: 'juggler', label: 'Catch & bow', icon: 'thanks', emoji: '\u{1F647}', seconds: 3, wire: 9, slow: 1},
  {emote: NPC_SET.NiceTouch, kind: 'juggler', label: 'Nice touch', icon: 'heart', emoji: '\u{1F44F}', seconds: 3, wire: 5, slow: 1},
];
export const isNpcSetEmote = (e: number) => e >= 40 && e <= 49;
export const npcScriptFor = (e: number): NpcScript | undefined => NPC_SCRIPTS.find(s => s.emote === e);
export const npcWheelFor = (kind: NpcSetKind): NpcScript[] => NPC_SCRIPTS.filter(s => s.kind === kind);
export const NPC_SET_EMOJI: Record<number, string> = Object.fromEntries(NPC_SCRIPTS.map(s => [s.emote, s.emoji]));

/** What a townsperson is, for emotes: from its definition (travel, freestyle routine, pose) or the field it plays on. */
export function npcEmoteClass(d: {travel?: string; freestyle?: number; pose?: string}, field = false): NpcClass {
  if (field) return 'field';
  if (d.pose === 'lie') return 'lie';
  if (d.travel === 'skateboard') return 'skater';
  if (d.travel === 'scooter') return 'scooter';
  if (d.freestyle !== undefined) return 'juggler';
  return 'walker';
}
/** The wheel's set for the townsperson you would emote at (a ride other than the scooter keeps its own ride wheel; on a scooter beside a scooter rider the pair set shows). */
export function npcSetFor(cls: NpcClass, ride: string): NpcSetKind | '' {
  if (cls === 'skater' || cls === 'juggler') return ride === 'walk' ? cls : '';
  if (cls === 'scooter') return ride === 'walk' || ride === 'scooter' ? 'scooter' : '';
  return '';
}

/** The townsperson's overlay at `age` s into its answer: speed factor, which arm pose (-1 none, 0 wave, 1 fist, 2 air five, 5 clap, 9 bow arms), a spin (turns, 0..1), a bow lean (0..1) and a head nod (0..1). Writes `out`. */
export interface NpcIx {slow: number; arm: number; armW: number; spin: number; bow: number; nod: number}
const clamp01 = (v: number) => v < 0 ? 0 : v > 1 ? 1 : v;
const smooth = (v: number) => { const t = clamp01(v); return t * t * (3 - 2 * t); };
export function npcIxAt(s: NpcScript, age: number, out: NpcIx): NpcIx {
  const ramp = clamp01(Math.min(age / .3, (s.seconds - age) / .35));
  out.slow = 1 + (s.slow - 1) * ramp; out.arm = -1; out.armW = 0; out.spin = 0; out.bow = 0; out.nod = 0;
  switch (s.emote) {
    case NPC_SET.SkateFive: out.arm = 2; out.armW = clamp01(Math.min((age - .35) / .25, (s.seconds - .2 - age) / .3)); break; // the hand goes up as it rolls past, then down
    case NPC_SET.TrickSwap: out.spin = smooth((age - .3) / 1.3); break;
    case NPC_SET.GlideWave: case NPC_SET.RideByWave: case NPC_SET.SideGlide: out.arm = 0; out.armW = clamp01(Math.min((age - .2) / .25, (s.seconds - .15 - age) / .3)); break;
    case NPC_SET.BellRing: out.arm = 1; out.armW = clamp01(Math.min((age - .15) / .2, (s.seconds - .1 - age) / .25)) * (.55 + .45 * Math.abs(Math.sin(age * 9))); break;
    case NPC_SET.KeepUps: out.arm = 1; out.armW = .6 * ramp; break;
    case NPC_SET.NodHeader: out.nod = ramp * Math.abs(Math.sin(age * 7)); out.arm = 1; out.armW = .5 * ramp; break;
    case NPC_SET.CatchBow: out.arm = 9; out.armW = clamp01((age - .8) / .3) * clamp01((s.seconds - age) / .3); out.bow = smooth((age - 1.1) / .5) * (1 - smooth((age - 2.2) / .5)); break;
    case NPC_SET.NiceTouch: out.arm = 5; out.armW = ramp; break;
  }
  return out;
}
/** The keep-up counter bubble: '7...' '8...' then '9!' on the last beat (`start` is where it begins). */
export function keepUpLine(age: number, seconds: number, start: number): string {
  const n = start + Math.floor(age / .55), last = Math.floor((seconds - .6) / .55);
  return age >= seconds - .6 ? `${start + last + 1}!` : `${n}...`;
}
export const juggleCounterStart = (seed: number) => 4 + Math.floor((seed % 1) * 6);

// ---- E: the busy field players ----
/** Ten short, kid-friendly, a little grumpy lines (<= 8 words each). */
export const REFUSALS: readonly string[] = [
  "Hey, leave me alone, I'm playing!",
  'Get off the field, I’m busy!'.replace('’', "'"),
  "Not now, game's on!",
  "Can't talk, I'm mid-match!",
  "Wait your turn, I'm playing!",
  "Shh, I'm focusing on the ball!",
  'Not now, this is the big game!',
  "Move along, I'm in the zone!",
  "Ball's coming, step aside!",
  'Busy playing, ask me later!',
];
export const FIELD_COOLDOWN = 3, FIELD_RANGE = 9;
/** A shuffled bag: every line once, in a fresh random order, and never the same line twice in a row (also across refills). */
export function createRefusalBag(rand: () => number = Math.random, lines: readonly string[] = REFUSALS) {
  let bag: string[] = [], last = '';
  const refill = () => {
    bag = lines.slice();
    for (let i = bag.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); const t = bag[i]; bag[i] = bag[j]; bag[j] = t; }
    if (bag[bag.length - 1] === last && bag.length > 1) { const t = bag[bag.length - 1]; bag[bag.length - 1] = bag[0]; bag[0] = t; } // pop() takes the end: it must not repeat `last`
  };
  return { next(): string { if (!bag.length) refill(); last = bag.pop()!; return last; } };
}
export interface FieldCandidate {id: string; x: number; y: number; z: number; cooldownUntil: number}
/** The nearest field player within `range` m (horizontal, same floor) that is off its 3 s cooldown, or null. */
export function pickFieldPlayer(list: readonly FieldCandidate[], me: {x: number; y: number; z: number}, now: number, range = FIELD_RANGE): {id: string; d: number} | null {
  let best: {id: string; d: number} | null = null;
  for (const c of list) {
    if (now < c.cooldownUntil || Math.abs(c.y - me.y) > 4) continue;
    const d = Math.hypot(c.x - me.x, c.z - me.z);
    if (d <= range && (!best || d < best.d)) best = {id: c.id, d};
  }
  return best;
}
/** The field player answers (refusal) when no friendlier townsperson is nearer. `friendlyD` < 0 = none. */
export const fieldWins = (fieldD: number, friendlyD: number): boolean => fieldD >= 0 && (friendlyD < 0 || fieldD <= friendlyD);
