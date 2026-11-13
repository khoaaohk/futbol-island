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
//  - keeper: × the AI keeper's reach against a human's AIMED shot (a picked corner is never wide). NB the live HUD's 1-tap
//    shot is aimed too (liveJoinRuntime sends tapShotCorner's AIM_MARK), so it IS scaled; only a shot sent with no aim mark
//    (NaN aimX / aimH: the sim's own auto-aim) keeps the plain keeper.
// The tackle-assist constants (TACKLE_ASSIST), human speeds and pose limits are not touched here.
// Measured (scripted idle / kid / average / skilled humans, 20 seeds x 3 real min per format): docs/join-live-game-design.md.
import type { SimFormat } from "../venues";

export type HumanDefence = { intercept: number; lane: number; read: number; tackle: number; attack: number; keeper: number; ramp: number; start: number; margin: number; sag: number; tight: number };
export const HUMAN_DEFENCE_NEUTRAL: Readonly<HumanDefence> = { intercept: 1, lane: 1, read: 1, tackle: 1, attack: 1, keeper: 1, ramp: 0, start: 1, margin: 0, sag: 1, tight: 1 };
export const HUMAN_DEFENCE: Record<SimFormat, HumanDefence> = {
  "7v7": { intercept: 1.6, lane: 1.15, read: 1.6, tackle: 1, attack: 1.5, keeper: 1.1, ramp: 240, start: 0.35, margin: 3, sag: 0.4, tight: 1.35 },
  futsal: { intercept: 1.6, lane: 1.2, read: 1.6, tackle: 1, attack: 1.4, keeper: 1.35, ramp: 120, start: 0.6, margin: 3, sag: 0.5, tight: 1.25 },
  "9v9": { intercept: 1.4, lane: 1.15, read: 1.2, tackle: 1, attack: 1.2, keeper: 1.3, ramp: 120, start: 0.5, margin: 3, sag: 0.5, tight: 1.25 },
  "11v11": { intercept: 1.8, lane: 1.4, read: 1.2, tackle: 1.1, attack: 1.1, keeper: 1.15, ramp: 120, start: 0.5, margin: 3, sag: 0.5, tight: 1.25 }, // Tier 2: eased toward the 9v9 shape (was 2.4 / 1.8 / 1.7 / 1.2 / 1.5, ramp 30 from .8, no band)
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

// Tier 2 (balance, Nov 7 2026): the AI side CHASING a human side that leads. With scripted kids (48 seeds x 6 real min) a
// kid's side won the 7v7 0.52-0.07 a minute after tier 1: the AI barely got a shot away. The AI side (no human on it) plays
// like a team that wants a goal: its possessions read as a counter (fast, direct, runners going), it shoots a little sooner,
// finishes better and the human side's AI team-mates ease off. Strength k from the human side's lead SINCE THE JOIN: 0 below
// `from`, `level` at `from`, a linear step to 1 at `full`. Behind counts as level (k never drops when the human side is
// behind: no new rubber band; the 3-goal `sag` above stays the only help a losing kid gets); 0 with humans on both sides.
// The 7v7 starts at level (`from` 0): a 2-goal gate alone cannot reach the conceded target in a short session (the AI scores,
// the lead drops under the gate, so goals against ≈ goals for - 2 / minutes played); the 9v9 too, gently. The rest: the 2-goal gate.
// Knobs (× at strength k, 1 = unchanged):
//  - attack: × the AI carrier's shooting instinct; range: × the distance it shoots from; finish: × its shots' xG;
//  - counter: its possessions play in the counter phase (tempo, firm passes, off-ball runs) once k reaches it (0 = never);
//  - ease: × the tackle and lane-read chances of the leading human side's AI team-mates against it (a side two up eases off).
export type HumanChase = { from: number; level: number; full: number; attack: number; range: number; finish: number; counter: number; ease: number };
export const HUMAN_CHASE_NEUTRAL: Readonly<HumanChase> = { from: 99, level: 0, full: 99, attack: 1, range: 1, finish: 1, counter: 0, ease: 1 };
export const HUMAN_CHASE: Record<SimFormat, HumanChase> = {
  "7v7": { from: 0, level: 0.5, full: 2, attack: 2.5, range: 1.1, finish: 4, counter: 0.4, ease: 0.4 },
  futsal: { from: 2, level: 0.5, full: 3, attack: 1.4, range: 1.15, finish: 1.3, counter: 0.5, ease: 0.7 },
  "9v9": { from: 0, level: 0.3, full: 2, attack: 1.4, range: 1.15, finish: 1.3, counter: 0.5, ease: 0.7 },
  "11v11": { from: 2, level: 0.5, full: 3, attack: 1.3, range: 1.1, finish: 1.2, counter: 1, ease: 0.8 },
  beach: { from: 2, level: 0.5, full: 3, attack: 1.4, range: 1.15, finish: 1.3, counter: 0.5, ease: 0.7 },
};
/** 0..1: how hard the AI side chases. `lead` = the HUMAN side's goal margin since the join (> 0 = the humans ahead). Pure. */
export function chaseStrength(c: HumanChase, lead: number, bothSides: boolean): number {
  const l = Math.max(0, lead); // behind counts as level: the AI never eases off a losing kid here (only the 3-goal `sag` does)
  if (bothSides || l < c.from) return 0;
  if (l >= c.full) return 1;
  return c.level + (1 - c.level) * (l - c.from) / Math.max(1, c.full - c.from);
}

// Tier 2 (Nov 7 2026): a contest for the ball near a DEFENDING human. An AI player claiming a pass with a human opponent within
// `r` sim units takes a heavy first touch (the ball squirts on, the receiver barred from the instant re-claim) at up to `loose`
// (fading to half at the edge of `r`) on top of the engine's rare loose touch. Measured: AI pass completion near a kid ~98 % -> ~90 %.
// Rides the engine's existing roll (no new rng draw); 0 in AI-only matches.
export type HumanContest = { r: number; loose: number };
export const HUMAN_CONTEST: Record<SimFormat, HumanContest> = {
  "7v7": { r: 45, loose: 0.14 },
  futsal: { r: 36, loose: 0.14 },
  "9v9": { r: 40, loose: 0.2 },
  "11v11": { r: 34, loose: 0.12 },
  beach: { r: 36, loose: 0.14 },
};

// Tier 2 (Nov 7 2026): getting a human the ball. `giveGo`: the AI team-mate he has just passed to may play it straight back
// to him when he is open (the return of a one-two; tier 1's soft feed skipped the last passer). Still at most one soft feed
// in SOFT_FEED.every AI passes (`giveGoFree`: the return is outside that cap on the small-sided formats: more touches and
// fewer AI counters there). `square`: an AI team-mate about to shoot squares it to an open human
// whose chance is at least `square` x his own (0 = off): the extra pass, and the kid gets the finish.
export type HumanFeed = { giveGo: boolean; giveGoFree: boolean; square: number };
export const HUMAN_FEED: Record<SimFormat, HumanFeed> = {
  "7v7": { giveGo: true, giveGoFree: true, square: 0.7 }, futsal: { giveGo: true, giveGoFree: true, square: 0.8 },
  "9v9": { giveGo: true, giveGoFree: false, square: 0.7 }, "11v11": { giveGo: true, giveGoFree: false, square: 0.8 },
  beach: { giveGo: true, giveGoFree: true, square: 0.7 },
};

// Tier 2 (Nov 7 2026): the HUMAN's side (AI team-mates + the human), only while a human is joined and only humans on that side.
//  - pace: × the human's run / dribble top speed (11v11 only; matchSim keeps the sprint top 8.99 m/s and the lunge under the
//    pose limit by dividing the sprint boost); finish: × his AI team-mates' xG; shoot: × their shooting instinct;
//  - crossWide: sim units a cross may reach further across / deeper for a HUMAN receiver (the width gate relaxed to the posts).
export type HumanSide = { pace: number; finish: number; shoot: number; crossWide: number };
export const HUMAN_SIDE: Record<SimFormat, HumanSide> = {
  "7v7": { pace: 1, finish: 1, shoot: 1, crossWide: 0 },
  futsal: { pace: 1, finish: 1, shoot: 1, crossWide: 0 },
  "9v9": { pace: 1, finish: 1.4, shoot: 1.2, crossWide: 12 },
  "11v11": { pace: 1.15, finish: 1.5, shoot: 1.3, crossWide: 20 },
  beach: { pace: 1, finish: 1, shoot: 1, crossWide: 0 },
};

// Kid / adult 11v11 (Nov 7 2026; settings key fi2-match-11-mode-v1, lib/town/match/matchModeSetting.ts). `kid` (default) is the
// Tier 2 balance above. `adult` is the honest pre-Tier-2 tuning: the original HUMAN_DEFENCE 11v11 row (eased in tier 2) and no
// HUMAN_SIDE boosts (the human's run at 1, his AI team-mates' finish / shooting at 1, no wider crosses to him). The chase,
// contest and give-and-go stay as they are in both (they are not boosts of the human side). Read by MatchSim.setElevenMode on
// the sim owner's device only (friends' screens are puppets that never step).
export type ElevenMode = "kid" | "adult";
export const HUMAN_DEFENCE_ADULT_11: Readonly<HumanDefence> = { intercept: 2.4, lane: 1.8, read: 1.7, tackle: 1.2, attack: 1.5, keeper: 1.15, ramp: 30, start: 0.8, margin: 0, sag: 1, tight: 1 };
export const HUMAN_SIDE_NEUTRAL: Readonly<HumanSide> = { pace: 1, finish: 1, shoot: 1, crossWide: 0 };
