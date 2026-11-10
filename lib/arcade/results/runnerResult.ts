import {arcadeCoinTarget} from '../arcadeWalletCore';
import {runnerBoardFor,runnerKeepsOwnBest} from '../runnerModes';
import type {ArcadeResult} from './types';

/** The parts of a Breakaway run the result reads (lib/arcade/runnerGame.ts RunnerGame). */
export type RunnerEnd={mode:string;score:number;level:number;goals:number;collected:number;/** Daily Run: the play day its course came from. */day?:string};
export const RUNNER_COIN_REASON='Goals and collected footballs';
export const runnerCoins=(s:RunnerEnd)=>arcadeCoinTarget('runner',s);
/** A route with its own best (elite tiers, the Daily Run) never touches the classic record or the old best key.
 * The Daily Run's best and its one board run a day are kept by claimRunnerDailyRun (settle.ts). */
export function runnerResult(s:RunnerEnd):ArcadeResult{
 const own=runnerKeepsOwnBest(s.mode);
 return {kind:'runner',coins:runnerCoins(s),coinReason:RUNNER_COIN_REASON,board:runnerBoardFor(s.mode),score:s.score,
  record:own?null:{game:'runner',best:s.score,unlocked:Math.min(6,s.level)},
  runnerTierBest:own&&s.mode!=='daily'?{mode:s.mode,score:s.score}:null,legacyRunnerBest:own?null:s.score,
  runnerDaily:s.mode==='daily'?{day:s.day||'',score:s.score}:null,today:{kind:'runner',mode:s.mode,day:s.day}};
}
