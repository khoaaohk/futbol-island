// 11v11 lane of the live-match AI (Eleven Park, 4-3-3; lib/town/match/matchSim.ts).
// The 11v11 row for the shared per-format knobs (formatAI.ts, owned by the 9v9 lane), the extra knobs 11v11 adds,
// and Eleven Park's own coaching lines. Every other format reads neutral values here, so nothing else moves.
// Tests: tests/eleven-ai.cjs. Measured (16 seeded 3-minute games, before → after) in the comments on each knob.
//
// Field units: 270 x 400. Eleven Park is 105 m long, so ~3.8 u per metre and the 16.5 m penalty area is ~63 u deep.
import type { LiveFormat } from "../venues";
import { NINE_NOTES, type FormatAI } from "./formatAI";

/** 11v11 values for the shared formatAI knobs (merged over formatAI("11v11") in the MatchSim constructor).
 *  - Throw-ins, not kick-ins (Law 15), and no offside straight from a throw-in, goal kick or corner (Law 11).
 *  - Forwards play on the defender's shoulder (onsideHold 0.5 u: level, as coached); now and then a passer misreads one
 *    who has crept beyond and the flag goes up. Before this pass offside was never called in 11v11 (0 per game) while
 *    ~3.6 passes a game were played to receivers already offside; now ~0.5 calls a game, each explained in the feed.
 *  - A sweeper keeper (up to ~14 m off his line behind a high back four) and a keeper outlet under pressure. */
export const ELEVEN_FORMAT_AI: Partial<FormatAI> = {
  touchline: "Throw-in", onsideHold: 0.5, offsideMisread: 0.35, restartOffsideFree: true, sweeper: 52, keeperOutlet: 24, teach: true,
};

/** Defending knobs the shared table does not have (neutral = 0 = the engine's previous behaviour). */
export type DefendAI = {
  /** Recovery runs: out of possession with the ball in our half, every outfielder except the presser / cover / balance
   *  and the central striker (the out-ball) gets at least this many units goal-side of the ball; defenders keep half
   *  of it, and floors keep the shape when the ball is in a corner. */
  recover: number;
  /** Offside at the strike: the chance a passer whose receiver drifted offside during the wind-up sees it and plays an
   *  onside team-mate instead (the rest are flagged when the receiver touches it, lofted balls included). 0 = off. */
  releaseRead: number;
};
export const DEFEND_AI_NEUTRAL: Readonly<DefendAI> = { recover: 0, releaseRead: 0 };
export const DEFEND_AI: Partial<Record<LiveFormat, Partial<DefendAI>>> = {
  "11v11": { recover: 8, releaseRead: 0.4 },
};
export function defendAI(format: LiveFormat): DefendAI {
  return { ...DEFEND_AI_NEUTRAL, ...DEFEND_AI[format] };
}

/** Goal-side cap (depth from own goal) for an outfielder recovering behind the ball: `recover` units behind the ball
 *  (half that for a defender), never deeper than the six-yard line (defenders) or the penalty spot (everyone else).
 *  Infinity = no cap (the knob is off, or the ball is in the other half). */
export function recoveryDepth(recover: number, ballDepth: number, defender: boolean): number {
  if (recover <= 0 || ballDepth >= 210) return Infinity;
  return Math.max(defender ? 16 : 44, ballDepth - recover * (defender ? 0.5 : 1));
}

/** A format's coaching lines for the live feed (text, reason). Corner and goal-kick lines are optional. */
export type CoachNotes = {
  throwIn: (team: string) => readonly string[];
  offside: readonly string[]; onside: readonly string[]; keeper: readonly string[]; cover: readonly string[];
  corner?: (team: string) => readonly string[]; goalKick?: (team: string) => readonly string[];
};
/** Eleven Park explains the full-size laws a child meets there: every restart, offside, the timed run. */
export const ELEVEN_NOTES: CoachNotes = {
  throwIn: (team: string) => [`Throw-in for ${team}`, "The other team touched it last over the touchline: both hands, from behind the head, both feet on the ground"],
  offside: ["Offside!", "He was past the second-last defender when the pass was played. Stay level, then run as the pass is struck"],
  onside: ["Onside run", "He waited level with the last defender, then ran as the pass was played: that beats the offside trap"],
  keeper: ["Back to the keeper", "No safe pass forward? The keeper is the spare player: play it back and build again"],
  cover: ["One presses, one covers", "The first defender closes the ball while a team-mate covers behind him"],
  corner: (team: string) => [`Corner for ${team}`, "A defender touched it last over his own goal line, so the attackers restart from the corner"],
  goalKick: (team: string) => [`Goal kick for ${team}`, "An attacker touched it last over the goal line, so the defenders restart from their six-yard box"],
};
/** The coaching lines a format's live feed uses (9v9's are the default the shared knobs were written with). */
export function formatNotes(format: LiveFormat): CoachNotes {
  return format === "11v11" ? ELEVEN_NOTES : NINE_NOTES;
}
