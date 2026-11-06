// How hard the AI defends against a HUMAN side (QA round 2, balance, Nov 6 2026; docs/join-live-game-design.md "QA round 2 (balance)").
// Read only when a human is joined: an AI-only match never calls these, so the island's matches stay byte-identical.
// Each knob is a multiplier on the engine's existing behaviour (1 = unchanged); `defenceStrength` scales how much of it
// (knob - 1) applies right now:
//  - ramp: from `start` of the strength when the first human joins to the full value `ramp` real seconds later (no pressure
//    spike at kick-off; the 7v7 asks a little more of a kid the longer he plays);
//  - margin: a goal lead SINCE THE JOIN of `margin` or more (human side ahead) multiplies the strength by `tight`, the same
//    deficit by `sag` (defenders sit off a touch). Off (`margin` 0) on the adult 11v11, and whenever humans play on both
//    sides (friends against friends: no help to either).
// Knobs:
//  - intercept: × the chance a defender reading the lane cuts out a human's pass (PASS_HELP.interceptMul still halves it
//    for the highlighted target);
//  - lane: × how far off the lane that defender can read it (11v11: adult defenders step into the lane);
//  - read: an AI carrier counts a HUMAN closing within P.pressDist × read as pressure and releases the ball (the engine's
//    pressured pass), instead of waiting to be tackled: the AI side keeps the ball against a human who hunts it;
//  - tackle: × HUMAN_GUARD.tackleMul, an AI defender right on a human carrier (adults may be dispossessed a little more).
//  - attack: × an AI carrier's shooting instinct in range of a goal a human defends (the AI side still gets shots off);
//  - keeper: × the AI keeper's reach against a human's AIMED shot (a picked corner is never wide); the 1-tap auto-aimed
//    shot is unchanged, so a little kid's goals are not touched.
// The tackle-assist constants (TACKLE_ASSIST), human speeds and pose limits are not touched here.
// Measured (scripted idle / kid / average / skilled humans, 20 seeds x 3 real min per format): docs/join-live-game-design.md.
import type { LiveFormat } from "../venues";

export type HumanDefence = { intercept: number; lane: number; read: number; tackle: number; attack: number; keeper: number; ramp: number; start: number; margin: number; sag: number; tight: number };
export const HUMAN_DEFENCE_NEUTRAL: Readonly<HumanDefence> = { intercept: 1, lane: 1, read: 1, tackle: 1, attack: 1, keeper: 1, ramp: 0, start: 1, margin: 0, sag: 1, tight: 1 };
export const HUMAN_DEFENCE: Record<LiveFormat, HumanDefence> = {
  "7v7": { intercept: 1.6, lane: 1.15, read: 1.6, tackle: 1, attack: 1.5, keeper: 1.1, ramp: 240, start: 0.35, margin: 3, sag: 0.4, tight: 1.35 },
  futsal: { intercept: 1.6, lane: 1.2, read: 1.6, tackle: 1, attack: 1.4, keeper: 1.35, ramp: 120, start: 0.6, margin: 3, sag: 0.5, tight: 1.25 },
  "9v9": { intercept: 1.4, lane: 1.15, read: 1.2, tackle: 1, attack: 1.2, keeper: 1.3, ramp: 120, start: 0.5, margin: 3, sag: 0.5, tight: 1.25 },
  "11v11": { intercept: 2.4, lane: 1.8, read: 1.7, tackle: 1.2, attack: 1.5, keeper: 1.15, ramp: 30, start: 0.8, margin: 0, sag: 1, tight: 1 },
  beach: { intercept: 1.6, lane: 1.2, read: 1.6, tackle: 1, attack: 1.4, keeper: 1.3, ramp: 120, start: 0.6, margin: 3, sag: 0.5, tight: 1.25 },
};

/** 0..~1.35: how much of each knob's (value - 1) applies. `since` = real s since the first human joined, `lead` = the human
 *  side's goal margin since then, `bothSides` = humans on both teams (no rubber band). Pure. */
export function defenceStrength(d: HumanDefence, since: number, lead: number, bothSides: boolean): number {
  const r = d.ramp > 0 ? Math.min(1, Math.max(0, since) / d.ramp) : 1;
  let k = d.start + (1 - d.start) * r;
  if (d.margin > 0 && !bothSides) { if (lead <= -d.margin) k *= d.sag; else if (lead >= d.margin) k *= d.tight; }
  return k;
}
/** A knob at strength k: 1 + (value - 1) × k. */
export const atStrength = (value: number, k: number) => 1 + (value - 1) * k;
