import type {BoardGame} from '../leaderboard';
import type {TodayFacts} from '../arcadeTodayCore';

/**
 * What a finished arcade game leaves behind (Nov 10 2026, part 1 of the arcade audit). Each game has one small adapter
 * (runnerResult.ts, pinballResult.ts, tennisResult.ts) that reads its finished state and returns this plan; settleArcadeResult
 * (settle.ts) applies it in the order the old inline game-over code used, so coins, records, tier bests, boards and keys
 * stay exactly as they were. Adapters are pure: no storage, no React.
 */
export type ArcadeResultKind='runner'|'pinball'|'tennis';
export type ArcadeResult={
 kind:ArcadeResultKind;
 /** Coin target for the run so far (arcadeCoinTarget) and the line the wallet history shows. */
 coins:number;coinReason:string;
 /** The island board this run posts to, and the score it posts (0 = nothing to post). */
 board:BoardGame;score:number;
 /** The classic arcade record (fi2-arcade-record-<game>-v1), or null when the run keeps its own best instead. */
 record:{game:string;best:number;unlocked:number}|null;
 /** Breakaway route with its own best (runnerModes.ts saveRunnerTierBest): the route id and the score. */
 runnerTierBest?:{mode:string;score:number}|null;
 /** Daily Run (Nov 10 2026): the day and score; only the first finished run of the day posts to its board. */
 runnerDaily?:{day:string;score:number}|null;
 /** The old Breakaway best key (fi.game.runner.best), written for runs that also write the classic record. */
 legacyRunnerBest?:number|null;
 /** Pinball elite tier (soccerPinballTiers.ts savePinballTier) or, for the classic table, the score that may beat the record. */
 pinballTier?:{id:'derby'|'final';score:number;goals:number}|null;pinballScore?:number;
 /** Tennis tour number (0 = classic ladder). */
 tour?:number;
 /** "Today in the arcade" (Nov 10 2026, arcadeTodayCore.ts): what the daily challenge checks. Not used by settling. */
 today?:TodayFacts;
};
/** What settling changed, for the component's own state (record chip, NEW BEST, high-score entry). */
export type ArcadeSettled={record:{best:number;unlocked:number}|null;pinballFresh:boolean;boardScore:number|null};
