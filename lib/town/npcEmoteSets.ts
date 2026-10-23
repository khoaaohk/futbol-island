// Emote answers for townsfolk that do something of their own, pure data + rules, no three.js.
// Owner, Oct 23 2026 ("every kind of townsperson must answer ALL 10 emotes"): the wheel shows the standard ten (lib/town/emoteReact.ts
// LOCAL_EMOTES, same order) for EVERY townsperson; skaters, scooter riders and jugglers answer each of the ten with a reaction that fits
// what they are doing. They never leave their route: `slow` dips their own speed for a moment and restores it, everything else is a pose
// overlay (arm, nod, bow, a small hop, a sway, a skid wiggle of the rider). ~3-4 s each, kid-friendly lines with a small football tip.
//  - SKATERS: glide wave, rolling high five, kick-flip hop + spin, carve sway...
//  - SCOOTER riders: bell ring, skid + hop + wave, ride-by wave...
//  - JUGGLERS (court freestylers, they own a ball): keep juggling and answer with their tricks; the BALL emotes (Pass it, Juggle with me,
//    Show off, Well played, Dance) become a TWO-BALL duet (lib/town/emoteDuet.ts, the party-friend code): each passes / juggles their own
//    ball, they swap, and both balls end back with their owners. `duet` = the duet emote (3 juggle / 6 pass) and routine seed (-1 = random).
//  - Walkers, runners, workers and seated townsfolk already answer all ten through islandNpcs.react (a seated one stands up first).
//  - Townsfolk PLAYING (the volleyball rally, the coaches' wall practice, the live matches) refuse with one grumpy bubble (owner confirmed).
// NPC_SET keeps the older local ids 40..49 (analytics tables list them); they are now only the bubble emoji of some answers.
export const NPC_SET = {SkateFive: 40, TrickSwap: 41, GlideWave: 42, RideByWave: 43, BellRing: 44, SideGlide: 45, KeepUps: 46, NodHeader: 47, CatchBow: 48, NiceTouch: 49} as const;
export type NpcSetKind = 'skater' | 'scooter' | 'juggler';
export type NpcClass = 'walker' | 'seated' | 'skater' | 'scooter' | 'juggler' | 'field' | 'lie';
/** Arm overlays: -1 none, 0 wave, 1 fist pump / thumbs, 2 air five, 5 clap, 7 laugh (hands on belly), 9 thanks (palms together). */
export type NpcArm = -1 | 0 | 1 | 2 | 5 | 7 | 9;
export interface NpcScript {
  kind: NpcSetKind;
  /** The standard emote it answers (0..9, emoteReact.ts EMOTE). */
  wire: number;
  label: string;
  /** Emote id whose emoji the answer bubble shows. */
  bubble: number;
  /** A short line over its head ('' = none). */
  line: string;
  seconds: number;
  /** The fraction of its own speed the townsperson keeps while it answers (1 = unchanged; 0.35 = it nearly stops, then resumes). */
  slow: number;
  arm: NpcArm; nod?: boolean; bow?: boolean;
  /** Small hops of the rider / juggler (count). */
  hops?: number;
  /** Turns of a spin (0 / 1). */
  spin?: number;
  lean?: 'sway' | 'wobble';
  /** The rider's rear swings out and back (a skid-stop look). */
  skid?: boolean;
  /** A bell ring cue. */
  bell?: boolean;
  /** The keep-up counter bubble ("7... 8... 9!"). */
  counter?: boolean;
  /** Ball townsfolk: a two-ball duet instead (emote 3 juggle / 6 pass, routine seed, -1 = random). The overlay above is the fallback. */
  duet?: {emote: 3 | 6; seed: number};
}
const W = {Wave: 0, Cheer: 1, HighFive: 2, Juggle: 3, ShowOff: 4, WellPlayed: 5, Pass: 6, Laugh: 7, Dance: 8, Thanks: 9} as const;
type More = Partial<NpcScript>;
const sk = (wire: number, label: string, bubble: number, line: string, seconds: number, slow: number, arm: NpcArm, more: More = {}): NpcScript => ({kind: 'skater', wire, label, bubble, line, seconds, slow, arm, ...more});
const sc = (wire: number, label: string, bubble: number, line: string, seconds: number, slow: number, arm: NpcArm, more: More = {}): NpcScript => ({kind: 'scooter', wire, label, bubble, line, seconds, slow, arm, ...more});
const ju = (wire: number, label: string, bubble: number, line: string, seconds: number, arm: NpcArm, more: More = {}): NpcScript => ({kind: 'juggler', wire, label, bubble, line, seconds, slow: 1, arm, ...more});
export const NPC_SCRIPTS: readonly NpcScript[] = [
  sk(W.Wave, 'Wave while gliding', NPC_SET.GlideWave, 'Hey there!', 3, .6, 0),
  sk(W.HighFive, 'Skate high five', NPC_SET.SkateFive, 'Up top!', 3, .35, 2),
  sk(W.Cheer, 'Hop and cheer', W.Cheer, 'Woo-hoo!', 3.4, .6, 1, {hops: 2}),
  sk(W.Pass, 'Ollie nod', W.Pass, 'Nice pass! Inside of the foot!', 3, .5, -1, {hops: 1, nod: true}),
  sk(W.Juggle, 'Rolling thumbs up', W.Juggle, 'Cool keep-ups!', 3, .6, 1, {nod: true}),
  sk(W.WellPlayed, 'Rolling clap', W.WellPlayed, 'Well played!', 3.2, .5, 5),
  sk(W.Laugh, 'Wobble laugh', W.Laugh, 'Ha ha ha!', 3.2, .6, 7, {lean: 'wobble'}),
  sk(W.Dance, 'Carve groove', W.Dance, 'Balance, like a dribble!', 3.6, .65, 1, {lean: 'sway'}),
  sk(W.Thanks, 'Board bow', W.Thanks, 'Any time!', 3, .5, 9, {bow: true}),
  sk(W.ShowOff, 'Kick-flip spin', NPC_SET.TrickSwap, 'Kick-flip!', 3, .5, -1, {hops: 1, spin: 1}),
  sc(W.Wave, 'Ride-by wave', NPC_SET.RideByWave, 'Hello!', 3, .7, 0),
  sc(W.HighFive, 'Scooter high five', NPC_SET.SkateFive, 'High five!', 3, .4, 2),
  sc(W.Cheer, 'Bell ring', NPC_SET.BellRing, 'Ring ring!', 3, .8, 1, {bell: true}),
  sc(W.Pass, 'Bell and skid', NPC_SET.BellRing, 'Nice pass! Eyes up!', 3.2, .45, -1, {bell: true, skid: true}),
  sc(W.Juggle, 'Bell and nod', NPC_SET.BellRing, 'Keep it up!', 3, .6, 1, {bell: true, nod: true}),
  sc(W.WellPlayed, 'Scooter clap', W.WellPlayed, 'Well played!', 3, .5, 5),
  sc(W.Laugh, 'Giggle wobble', W.Laugh, 'Hee hee!', 3, .6, 7, {lean: 'wobble'}),
  sc(W.Dance, 'Scooter sway', W.Dance, 'Scooter dance!', 3.6, .6, 1, {lean: 'sway', bell: true}),
  sc(W.Thanks, 'Nod and wave', W.Thanks, "You're welcome!", 3, .6, 0, {nod: true}),
  sc(W.ShowOff, 'Skid, hop and wave', NPC_SET.SideGlide, 'Ta-da!', 3.4, .35, 0, {bell: true, skid: true, hops: 1}),
  ju(W.Wave, 'Juggling wave', W.Wave, 'Hi! Watch the ball!', 3, 0, {nod: true}),
  ju(W.HighFive, 'Juggling air five', NPC_SET.SkateFive, 'Up top!', 3, 2),
  ju(W.Cheer, 'Count my keep-ups', NPC_SET.KeepUps, '', 4, 1, {counter: true}),
  ju(W.Pass, 'Two-ball passes', W.Pass, 'Pass it here!', 3, 1, {nod: true, duet: {emote: 6, seed: -1}}),
  ju(W.Juggle, 'Two-ball keep-ups', W.Juggle, "Let's juggle!", 3, 1, {counter: true, duet: {emote: 3, seed: -1}}),
  ju(W.WellPlayed, 'One-touch passes', NPC_SET.NiceTouch, 'Well played! One touch!', 3, 5, {duet: {emote: 6, seed: 2}}),
  ju(W.Laugh, 'Juggling laugh', W.Laugh, 'Ha ha, nice one!', 3, 7),
  ju(W.Dance, 'Keep-ups to the beat', W.Dance, 'Juggle to the beat!', 3.6, 1, {lean: 'sway', duet: {emote: 3, seed: 2}}),
  ju(W.Thanks, 'Catch & bow', NPC_SET.CatchBow, 'Thank you!', 3, 9, {bow: true}),
  ju(W.ShowOff, 'Trick swap', NPC_SET.NodHeader, 'Show me your tricks!', 3, 1, {nod: true, duet: {emote: 3, seed: 1}}),
];
const BY_KIND: Record<NpcSetKind, NpcScript[]> = {skater: [], scooter: [], juggler: []};
for (const s of NPC_SCRIPTS) BY_KIND[s.kind][s.wire] = s;
export const isNpcSetEmote = (e: number) => e >= 40 && e <= 49;
/** The answer of a skater / scooter rider / juggler to the standard emote `wire` (0..9). */
export const npcScriptFor = (kind: NpcSetKind, wire: number): NpcScript | undefined => BY_KIND[kind]?.[wire];
/** Every answer of one kind, in wire order (always ten). */
export const npcAnswersFor = (kind: NpcSetKind): NpcScript[] => BY_KIND[kind].slice();
/** Townsfolk with their own ball answer the ball emotes with a two-ball duet. */
export const npcHasBall = (cls: NpcClass | NpcSetKind) => cls === 'juggler';
/** Labels of the older local ids 40..49 (past analytics beats still carry them; lib/analytics/emoteLabels.ts). */
export const NPC_SET_LABELS: Record<number, {label: string; kind: NpcSetKind}> = {
  [NPC_SET.SkateFive]: {label: 'Skate high five', kind: 'skater'}, [NPC_SET.TrickSwap]: {label: 'Trick exchange', kind: 'skater'}, [NPC_SET.GlideWave]: {label: 'Wave while gliding', kind: 'skater'},
  [NPC_SET.RideByWave]: {label: 'Ride-by wave', kind: 'scooter'}, [NPC_SET.BellRing]: {label: 'Bell ring', kind: 'scooter'}, [NPC_SET.SideGlide]: {label: 'Side-by-side glide', kind: 'scooter'},
  [NPC_SET.KeepUps]: {label: 'Count my keep-ups', kind: 'juggler'}, [NPC_SET.NodHeader]: {label: 'Nice header', kind: 'juggler'}, [NPC_SET.CatchBow]: {label: 'Catch & bow', kind: 'juggler'}, [NPC_SET.NiceTouch]: {label: 'Nice touch', kind: 'juggler'}};
export const NPC_SET_EMOJI: Record<number, string> = {
  [NPC_SET.SkateFive]: '\u{1F64C}', [NPC_SET.TrickSwap]: '\u{1F300}', [NPC_SET.GlideWave]: '\u{1F44B}', [NPC_SET.RideByWave]: '\u{1F44B}', [NPC_SET.BellRing]: '\u{1F514}',
  [NPC_SET.SideGlide]: '\u{1F6F4}', [NPC_SET.KeepUps]: '\u{26BD}', [NPC_SET.NodHeader]: '\u{1F929}', [NPC_SET.CatchBow]: '\u{1F647}', [NPC_SET.NiceTouch]: '\u{1F44F}'};

/** What a townsperson is, for emotes: from its definition (travel, freestyle routine, pose) or the field it plays on. */
export function npcEmoteClass(d: {travel?: string; freestyle?: number; pose?: string}, field = false): NpcClass {
  if (field) return 'field';
  if (d.pose === 'lie') return 'lie';
  if (d.travel === 'skateboard') return 'skater';
  if (d.travel === 'scooter') return 'scooter';
  if (d.freestyle !== undefined) return 'juggler';
  if (d.pose === 'bench' || d.pose === 'sit') return 'seated';
  return 'walker';
}
/** Which answer set the townsperson you would emote at uses ('' = the ordinary townsperson reaction). On a ride only a scooter rider
 *  answers a scooter rider (the player keeps the ride wheel; the rider answers the trick's wire value). */
export function npcSetFor(cls: NpcClass, ride: string): NpcSetKind | '' {
  if (cls === 'skater' || cls === 'juggler') return ride === 'walk' ? cls : '';
  if (cls === 'scooter') return ride === 'walk' || ride === 'scooter' ? 'scooter' : '';
  return '';
}

/** The townsperson's overlay at `age` s into its answer: speed factor, arm pose (NpcArm) and weight, a spin (turns, 0..1), a bow lean
 *  (0..1), a head nod (0..1), a hop (m), a side lean (rad) and a skid yaw (rad). Writes `out` (no allocation). */
export interface NpcIx {slow: number; arm: number; armW: number; spin: number; bow: number; nod: number; hop: number; lean: number; yaw: number}
const clamp01 = (v: number) => v < 0 ? 0 : v > 1 ? 1 : v;
const smooth = (v: number) => { const t = clamp01(v); return t * t * (3 - 2 * t); };
const HOP_AT = .45, HOP_LEN = .45, HOP_GAP = 1.05, HOP_H = .22;
export function npcIxAt(s: NpcScript, age: number, out: NpcIx): NpcIx {
  const ramp = clamp01(Math.min(age / .3, (s.seconds - age) / .35));
  out.slow = 1 + (s.slow - 1) * ramp; out.arm = s.arm; out.armW = 0; out.spin = 0; out.bow = 0; out.nod = 0; out.hop = 0; out.lean = 0; out.yaw = 0;
  if (s.arm >= 0) {
    out.armW = clamp01(Math.min((age - .2) / .25, (s.seconds - .15 - age) / .3));
    if (s.bell && s.arm === 1) out.armW *= .55 + .45 * Math.abs(Math.sin(age * 9)); // the thumb flicks the bell
  }
  if (s.nod) out.nod = ramp * Math.abs(Math.sin(age * 7));
  if (s.bow) out.bow = smooth((age - .9) / .45) * (1 - smooth((age - 2) / .45));
  if (s.hops) for (let i = 0; i < s.hops; i++) { const u = (age - HOP_AT - i * HOP_GAP) / HOP_LEN; if (u > 0 && u < 1) out.hop = HOP_H * Math.sin(u * Math.PI); }
  if (s.spin) out.spin = s.spin * smooth((age - HOP_AT) / 1.1);
  if (s.lean === 'sway') out.lean = .2 * ramp * Math.sin(age * 5);
  else if (s.lean === 'wobble') out.lean = .1 * ramp * Math.sin(age * 13);
  if (s.skid) out.yaw = .5 * Math.sin(clamp01((age - .25) / 1.1) * Math.PI);
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
/** The set townsperson (skater / scooter / juggler) answers when it is nearer than both the ordinary pick and any field player (< 0 = none). */
export const setNpcWins = (setD: number, ordinaryD: number, fieldD: number): boolean => setD >= 0 && (ordinaryD < 0 || setD < ordinaryD) && (fieldD < 0 || setD < fieldD);
