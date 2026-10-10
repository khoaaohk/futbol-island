// SHARED FILE: the 7v7, 9v9, 11v11 and futsal AI agents all edit it (Oct 10 2026).
// Rule: re-read right before every write, ADD only your own format's fields and entry, and never rewrite the whole file.
// Collision log: at 01:32 the 7v7 agent overwrote this file by mistake. At 01:34 it restored the 9v9 agent's version
// from the futsal agent's 01:32 snapshot; the 9v9 knobs should be checked against that agent's intent.
// Per-format AI rules and coaching knobs for the live island matches (lib/town/match/matchSim.ts).
// Every format runs the same engine; a format opts in to a behaviour here, so tuning one format never
// moves another. FORMAT_AI_NEUTRAL is exactly the engine's previous behaviour.
//
// 9v9 (Club Grounds, 3-2-3, U11-U12): the laws a 9v9 child plays under (US Soccer Player Development
// Initiatives; IFAB Laws 11 and 15) and the habits its lessons teach (lib/paths/formatPaths.json, learn9_* / nx9_*):
//  - the ball comes back in from the touchline with a THROW-IN (kick-ins are futsal and beach);
//  - offside applies (no build-out line: that is 7v7 only), but never directly from a throw-in, goal kick or corner;
//  - forwards stay onside, level with the last defender, and time the run as the pass is shaped;
//  - the keeper steps up behind a high back line (sweeper keeper) and is a back-pass outlet under pressure.
import type { LiveFormat } from "../venues";

export type FormatAI = {
  /** What the feed calls a touchline restart. */
  touchline: "Kick-in" | "Throw-in";
  /** Off-ball attackers hold this many units goal-side of the offside line (0 = no onside discipline). */
  onsideHold: number;
  /** Chance a passer misreads a forward standing offside as a target: the pass goes and offside is CALLED. */
  offsideMisread: number;
  /** Law 11: no offside from a throw-in, a goal kick or a corner (the taker's first pass). */
  restartOffsideFree: boolean;
  /** Most units a keeper steps off his line behind a high back line (0 = keeper stays on the angle line). */
  sweeper: number;
  /** Pressured build-up: score added to the back pass to an open keeper (the default -50 makes it a last resort). */
  keeperOutlet: number;
  /** The sim narrates this format's rules and habits in the live feed (cooldown-limited). */
  teach: boolean;
  // ---- futsal (Palm Coast Rooftop; helpers and law references in futsalAI.ts) ----
  /** Metres opponents keep from the ball at a kick-in or corner (futsal Laws 15-17: 5 m; 0 = no ring). */
  restartRing: number;
  /** Law 12 (futsal): once the keeper has released it, team-mates never pass it back to him in his own half until an opponent touches it. */
  keeperBackPass: boolean;
  /** The keeper restarts with a thrown GOAL CLEARANCE, not a goal kick. */
  goalClearance: boolean;
  /** 0..1 blend from the zonal block to man-oriented marking (each defender picks up an attacker, goal-side). */
  manMark: number;
  /** 0..1 chance a shooter with a clearly better-placed team-mate plays the extra pass instead (0 = off). */
  extraPass: number;
  /** 0..1 cut to the shot appetite for a long-range strike through a defender (0 = shoot as before). */
  shotPatience: number;
  // ---- 7v7 (Old Town Ground; helpers and notes in sevenAI.ts) ----
  /** Settled possession: wide players hold this far (u) from the centre line to stretch the block (0 = off). */
  attackWidth: number;
  /** Out of possession each outfielder's home x offset is scaled by this (1 = off; < 1 = a narrower block). */
  defendNarrow: number;
  /** Build-out (goal kick / keeper's hands): the centre-backs split this far (u) from the centre (0 = off). */
  buildOutSplit: number;
  /** US Youth 7v7: offside counts only beyond the opponent's build-out line (needs the build-out line). */
  offsideZone: boolean;
  /** The build-out retreat applies to the keeper's HANDS (save, claim, goal kick) only, not a back pass to his feet. */
  handsBuildOut: boolean;
  /** Multiplier on the shot range (< 1 = fewer speculative long shots). */
  shotRange: number;
  /** The sim narrates the 7v7 rules and habits (SEVEN_NOTES) in the live feed. */
  coach7: boolean;
  /** xG multiplier on AI finishing (1 = off): restores goals/game when a format's shape makes chances rarer but better. */
  finishMul: number;
  /** Chance a pressed carrier in his own third recycles through a free keeper instead of forcing it forward (0 = off). */
  keeperRecycle: number;
};

export const FORMAT_AI_NEUTRAL: Readonly<FormatAI> = {
  touchline: "Kick-in", onsideHold: 0, offsideMisread: 0, restartOffsideFree: false, sweeper: 0, keeperOutlet: 0, teach: false,
  restartRing: 0, keeperBackPass: false, goalClearance: false, manMark: 0, extraPass: 0, shotPatience: 0,
  attackWidth: 0, defendNarrow: 1, buildOutSplit: 0, offsideZone: false, handsBuildOut: false, shotRange: 1, coach7: false, finishMul: 1, keeperRecycle: 0,
};

// Units: the 270 x 400 field (9v9: 73.2 m long, so ~5.2 u per metre; the 13 m penalty area is ~67 u deep).
export const FORMAT_AI: Partial<Record<LiveFormat, Partial<FormatAI>>> = {
  // futsal: 40 m court (~9.5 u per metre along it, ~13.5 u across); FIFA Futsal Laws 2024-25, see futsalAI.ts
  futsal: { restartRing: 5, keeperBackPass: true, goalClearance: true, manMark: 0.7, extraPass: 0.8, shotPatience: 0.5, finishMul: 1.08 }, // own notes (FUTSAL_NOTES), not `teach` (9v9's lines); finishMul: tighter marking → fewer, better shots, goals ≈ held
  "9v9": { touchline: "Throw-in", onsideHold: 3, offsideMisread: 0.22, restartOffsideFree: true, sweeper: 46, keeperOutlet: 40, teach: true },
  // 7v7 (Old Town Ground, 2-3-1, U9-U10; 34.3 × 52.2 m, 1 u ≈ 0.137 m). The island's 7v7 lessons teach the US Youth
  // small-sided rules (learn7_buildout, next7_offsideboundary, bld_7_usekeeper, prn_7_spread), so the live match plays them:
  // build-out line on goal kicks and the keeper's hands (a back pass is played with the feet), offside only past the
  // build-out line, wide in possession / narrow without it, the keeper as the spare player, patient finishing.
  // attackWidth 104 u ≈ 3 m inside the touchline; buildOutSplit 80 u = the edges of the 23 m box; shotRange .9 ≈ 16.5 m;
  // finishMul 1.5: the narrow block makes chances rarer but better (72 seeds × 180 s: shots 23 → 14.5, xG/shot .18 → .22,
  // goals 4.4 → 3.4, games with a 3-goal lead 26 % → 11 %).
  "7v7": { touchline: "Throw-in", onsideHold: 2, restartOffsideFree: true, sweeper: 30, keeperOutlet: 46, attackWidth: 104, defendNarrow: 0.82, buildOutSplit: 80, offsideZone: true, handsBuildOut: true, shotRange: 0.9, coach7: true, finishMul: 1.5, keeperRecycle: 0.5 },
};

export function formatAI(format: LiveFormat): FormatAI {
  return { ...FORMAT_AI_NEUTRAL, ...FORMAT_AI[format] };
}

/** How far (u) the keeper steps off his line: nothing while the ball is near his goal, up to `max` once it is in the
 *  other half, never closer than 24 u behind his own back line (lineDepth = the line's depth from his goal). */
export function sweeperOffset(max: number, danger: number, lineDepth: number): number {
  if (max <= 0) return 0;
  const reach = max * Math.max(0, Math.min(1, (danger - 150) / 110));
  return Math.max(0, Math.min(reach, lineDepth - 24));
}

/** Deepest point (depth from own goal) an off-ball attacker may hold and stay onside: `hold` units short of the
 *  offside line (the second-last defender or the ball, whichever is deeper); anywhere in his own half is fine. */
export function onsideDepth(offsideLine: number, ballDepth: number, hold: number): number {
  return Math.max(200, Math.max(offsideLine, ballDepth) - hold);
}

/** The live feed's coaching lines for 9v9 (text, reason). */
export const NINE_NOTES = {
  throwIn: (team: string) => [`Throw-in for ${team}`, "In 9v9 the ball comes back in with both hands, from behind and over the head, with both feet on the ground"],
  offside: ["Offside!", "He was past the last defender when the pass was played. Wait level with the defender, then run"],
  onside: ["Onside run", "He stayed level until the pass was played, then ran in behind: that's how to beat the offside line"],
  keeper: ["Back to the keeper", "Under pressure with nothing ahead? Your keeper is a free player: pass back and start again"],
  cover: ["One presses, one covers", "The first defender wins it while a team-mate covers behind him"],
} as const;
