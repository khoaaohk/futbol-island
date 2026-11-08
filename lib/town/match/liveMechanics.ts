// Live match mechanics (Nov 7 2026; docs/join-live-game-design.md): tackle wind-up and result variety, through balls, near /
// far-post crosses and assists. Every behaviour change here is HUMAN-GATED in matchSim.ts (read only while a human is joined;
// no rng draw on the AI-only path), so the island's AI-only matches stay byte-identical (tests/live-mechanics.cjs).
// Pure constants + helpers: no allocation, no DOM.
import type { LiveFormat } from "../venues";

/** Tackle wind-up (a readable telegraph before the lunge, so the carrier can react; fair between friends):
 *  - wind: real s a human tackler "sets" once in reach before the tackle resolves (he keeps tracking the carrier: the lunge);
 *  - slack: × the tackle reach he may be at when the wind-up ends and still win it (the carrier only escapes by really
 *    getting away: past `escape` × the reach it is a whiff);
 *  - aiWind: real s an AI defender right on a HUMAN carrier must stay on him before his tackle roll can land (the human
 *    carrier sees him set, and can cut, shield, trick or pass away);
 *  - results (the same one roll as before): from the front / side TACKLE_TUNE.deflect of the old clean-win share becomes a deflection
 *    (the ball squirts loose, ±`deflectSpread` rad round the tackler); from behind a miss is a stumble with a quick
 *    recovery (`stumble` real s); a set tackle from behind wins at TACKLE_TUNE.behind (TACKLE_ASSIST.chanceAway .75 without a set: the
 *    set costs him time, so the committed tackle is a little surer and the win rates stay where they were). Never a foul, a
 *    card or a long penalty. */
export const TACKLE_FX = { wind: 0.2, slack: 1.6, escape: 2.6, aiWind: 0.15, deflectSpread: 2.2, stumble: 0.15 } as const;
/** Per format (measured, 64 seeds x 3 real min, scripted kid): the set tackle's from-behind chance and the deflection share of a
 *  front / side win, so each format's tackle win rate stays where it was before the wind-up (tests/live-mechanics.cjs). */
export const TACKLE_TUNE: Record<LiveFormat, { behind: number; deflect: number }> = {
  "7v7": { behind: 0.8, deflect: 0.1 }, futsal: { behind: 0.75, deflect: 0.25 }, beach: { behind: 0.75, deflect: 0.25 },
  "9v9": { behind: 0.75, deflect: 0.25 }, "11v11": { behind: 0.85, deflect: 0.1 },
};
export type TackleFxKind = "windup" | "steal" | "deflect" | "stumble";
/** Wire order of the result kinds (matchNet: 2 bits). */
export const TACKLE_KINDS: readonly TackleFxKind[] = ["steal", "deflect", "stumble", "windup"];

/** Through balls. A human's Pass becomes a through ball (led into the space ahead of a runner) when the target is ahead of
 *  him, onside and running forward (`runV` sim u/s toward goal, or an off-ball runner at `runnerV`), and either his stick is
 *  pushed forward (forward share ≥ `stickFwd`) or the Forward assist already picked that runner, and no defender is within
 *  `lane` units of the lane / 1.5 × of the spot. `space`: units ahead of the runner's path. AI team-mates (not on sand) play one to a HUMAN who is running forward (`feedRunV`) when the lane to the space
 *  `feedSpace` ahead of him is clear (no defender within `feedLane` units of it). */
export const THROUGH = { runV: 30, runnerV: 12, ahead: 12, stickFwd: 0.55, space: 8, lane: 8, feedRunV: 45, feedAhead: 10, feedSpace: 6, feedLane: 8 } as const;

/** Near / far-post crosses (human receiver; AI-to-AI on 9v9 / 11v11 while a human is joined). Spots in front of the goal
 *  the cross is attacking: near post `nearX` units across from the centre on the crosser's side, `nearD` out; far post
 *  `farX` across on the other side, `farD` out. A spot is used only when the receiver can arrive within the flight time
 *  + `slack` s and before every opponent (the keeper too) by `lead` s; the one with the better lead wins (tie → near), none
 *  → the cross keeps its old landing. The AI receiver runs into it. */
export const POST_CROSS = { nearX: 14, nearD: 28, farX: 20, farD: 32, slack: 0.2, lead: 0.05 } as const;

/** Assist: the last completed pass by a team-mate (not the scorer) within `window` real s before the goal. Cosmetic only. */
export const ASSIST = { window: 3 } as const;

/** The spot (sim units) of the near (`far` false) or far post run for a cross from `fromX` at the goal on line y `gy`,
 *  attacking direction `dirY` (−1 = toward smaller y). Writes `out`. Pure. */
export function postSpot(far: boolean, fromX: number, gy: number, dirY: number, out: { x: number; y: number }) {
  const side = fromX >= 135 ? 1 : -1;
  out.x = 135 + (far ? -side * POST_CROSS.farX : side * POST_CROSS.nearX);
  out.y = gy - dirY * (far ? POST_CROSS.farD : POST_CROSS.nearD);
  return out;
}
