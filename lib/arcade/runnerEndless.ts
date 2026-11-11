/**
 * Breakaway Run endless play (Nov 10 2026, owner: "the user can play as long as they want to increase their score" and "all these
 * games should also increase in difficulty the further they play"). Pure numbers, no imports: tests read these tables directly.
 *
 * A run is a chain of ROUNDS. On a route with a goal line (Warm-up, Night Derby, Storm Final, Cup Final, Daily Run) a round is the
 * route itself: reaching the goal line no longer ends the run, it CLEARS the round (the strike beat plays, a bonus banks, a heart
 * comes back) and the road carries on past the goal into the next round, score and hearts carried on. On the routes that never had
 * a goal line (Breakaway, Legend) a round is RUNNER_OPEN_ROUND metres. The run ends only when the hearts run out.
 * ("Round", not "stage": the game already calls every 360 m a stage, with its own lesson. A round is the bigger unit.)
 *
 * RUNNER_RAMP is the difficulty per round (1-based; rounds past the table play the last row). Round 1 is every route exactly as it
 * was before endless play: every multiplier 1, every extra 0/false. The stages inside a run (pace by distance, patterns by stage,
 * hills and bends by stage) keep climbing with distance as they always did; the ramp is laid on top of them.
 *  - speed      pace multiplier. The top-speed fairness ceiling (runnerTopSpeed × the route's capped pace) does NOT move: the run cruises
 *               faster, but boost + burst + a descent never pass the speed every read-to-contact window was measured at
 *  - gap        multiplier on the route's spacing between defensive lines (smaller = denser; never under RUNNER_GAP_FLOOR in total)
 *  - moving     added to the route's share of defenders that drift across lanes before they set (capped at 1)
 *  - telegraph  multiplier on how far out a drifting defender sets (26 m at round 1: the read time before contact)
 *  - pickups    share of pick-ups kept: footballs per trail (never under one) and how often a magnet ball appears
 *  - keeper     multiplier on the goal-line keeper's sway period (smaller = quicker)
 *  - blockers   defenders standing on the final hill in front of the goal line (one lane always stays open)
 *  - refill     extra goals needed to win one heart back (added to the route's own count: pick-ups of hearts get scarcer)
 *  - rollers    rolling loose balls on routes that did not have them (the double jump comes with them)
 *  - combos     jump-then-slide gauntlets on routes that did not have them
 *  - bonus      points banked for clearing this round (× RUNNER_KEEPER_BONUS when the goal-line keeper is beaten)
 */
export type RunnerRampRow={round:number;speed:number;gap:number;moving:number;telegraph:number;pickups:number;keeper:number;blockers:number;refill:number;rollers:boolean;combos:boolean;bonus:number};
export const RUNNER_RAMP:readonly RunnerRampRow[]=[
 {round:1, speed:1,   gap:1,  moving:0, telegraph:1,  pickups:1,  keeper:1,  blockers:0,refill:0,rollers:false,combos:false,bonus:1000},
 {round:2, speed:1.02,gap:.97,moving:.1,telegraph:.97,pickups:.95,keeper:.96,blockers:0,refill:1,rollers:true, combos:false,bonus:1500},
 {round:3, speed:1.03,gap:.94,moving:.2,telegraph:.94,pickups:.9, keeper:.92,blockers:1,refill:1,rollers:true, combos:false,bonus:2000},
 {round:4, speed:1.04,gap:.92,moving:.3,telegraph:.91,pickups:.85,keeper:.88,blockers:1,refill:2,rollers:true, combos:true, bonus:2500},
 {round:5, speed:1.05,gap:.9, moving:.4,telegraph:.88,pickups:.8, keeper:.85,blockers:2,refill:2,rollers:true, combos:true, bonus:3000},
 {round:6, speed:1.06,gap:.88,moving:.5,telegraph:.86,pickups:.75,keeper:.82,blockers:2,refill:3,rollers:true, combos:true, bonus:3500},
 {round:7, speed:1.07,gap:.86,moving:.6,telegraph:.84,pickups:.7, keeper:.8, blockers:2,refill:3,rollers:true, combos:true, bonus:4000},
 {round:8, speed:1.08,gap:.84,moving:.7,telegraph:.82,pickups:.65,keeper:.78,blockers:2,refill:4,rollers:true, combos:true, bonus:4500},
 {round:9, speed:1.09,gap:.82,moving:.8,telegraph:.8, pickups:.6, keeper:.76,blockers:2,refill:4,rollers:true, combos:true, bonus:5000},
 {round:10,speed:1.1, gap:.8, moving:.9,telegraph:.78,pickups:.55,keeper:.74,blockers:2,refill:5,rollers:true, combos:true, bonus:5500},
];
export const RUNNER_RAMP_TOP=RUNNER_RAMP.length;
/** The ramp row for a round. Anything below 1 or not a number plays round 1; past the table plays the last row. */
export const runnerRamp=(round:number):RunnerRampRow=>RUNNER_RAMP[Math.max(0,Math.min(RUNNER_RAMP_TOP-1,Math.floor(Number.isFinite(round)?round:1)-1))];
/** The tightest total spacing multiplier (route gap × ramp gap): every line still leaves a read before the next. */
export const RUNNER_GAP_FLOOR=.64;
/** Metres per round on the routes without a goal line (Breakaway, Legend): three stages. */
export const RUNNER_OPEN_ROUND=1080;
/** Beating the goal-line keeper multiplies the round bonus. */
export const RUNNER_KEEPER_BONUS=2;
/** Seconds at the start of every round after the first in which no new defensive line, roller or gauntlet is placed. */
export const RUNNER_ROUND_GRACE=2.4;
/** Hearts back for clearing a round (never above the route's own heart cap: 5 on the Warm-up, 2 on Legend, 3 elsewhere). */
export const RUNNER_ROUND_HEARTS=1;
/** The five skies in the order a long run passes through them: golden hour, dusk, night, storm, red sun, then round again. */
export const RUNNER_SKY_ORDER=['arcade','final','night','storm','legend'] as const;
export type RunnerSkyId=typeof RUNNER_SKY_ORDER[number];
/** The sky of a round: the route's own sky in round 1, then the next one along for every round cleared. */
export const runnerRoundSky=(start:string,round:number):RunnerSkyId=>{const i=Math.max(0,(RUNNER_SKY_ORDER as readonly string[]).indexOf(start));return RUNNER_SKY_ORDER[(i+Math.max(0,Math.floor(round)-1))%RUNNER_SKY_ORDER.length];};
/** What each sky is called on the round-clear line. */
export const RUNNER_SKY_NAMES:Record<RunnerSkyId,string>={arcade:'Golden hour',final:'Dusk',night:'Night',storm:'Storm front',legend:'Red sun'};
/** One football lesson per round clear, in rotation (the coach's voice between rounds). */
export const RUNNER_ROUND_LESSONS:readonly string[]=[
 'Look up early: find the open lane before the defender sets.',
 'Beat the tackle first, then find the goal.',
 'Watch which way the keeper sways, shoot the other side.',
 'Use your teammate: pass and move for the one-two.',
 'Take the inside lane on a bend: the short way round.',
 'A defender who drifts leaves a gap behind: wait, then go.',
 'Keeper off the line? Chip it. Feet apart? Nutmeg.',
 'Tired legs make mistakes: keep your touches small and calm.',
];
export const runnerRoundLesson=(round:number)=>RUNNER_ROUND_LESSONS[((Math.max(1,Math.floor(round))-1)%RUNNER_ROUND_LESSONS.length+RUNNER_ROUND_LESSONS.length)%RUNNER_ROUND_LESSONS.length];
/** The round label on the margin strip and the results line. */
export const runnerRoundLabel=(round:number)=>`ROUND ${Math.max(1,Math.floor(round))}`;
/** Footballs in a trail of `n` at a pick-up share (never under one). */
export const runnerTrailBalls=(n:number,pickups:number)=>Math.max(1,Math.min(n,Math.round(n*pickups+.2)));
/** The first goal after a round clear: the next 90 + 180k m mark at least 150 m on (the route keeps those segments gentle). */
export const runnerNextGoalAfter=(distance:number)=>90+180*Math.ceil((distance+150-90)/180);
/** Highest score any Breakaway board, device best or record accepts (lib/arcade/leaderboard.ts BOARD_RULES; the table's ceiling is 9,000,000). */
export const RUNNER_SCORE_MAX=5_000_000;
