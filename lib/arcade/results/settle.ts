import {readArcadeRecord,saveArcadeRecord} from '../arcadeRecords';
import {claimRunnerDailyRun,saveRunnerTierBest,type RunnerModeId} from '../runnerModes';
import {savePinballTier} from '../../games/soccerPinballTiers';
import type {ArcadeResult,ArcadeSettled} from './types';
import {runnerResult as runnerR} from './runnerResult';
import {pinballResult as pinballR} from './pinballResult';
import {tennisResult as tennisR} from './tennisResult';
import type {RunnerEnd} from './runnerResult';
import type {PinballState} from '../../games/soccerPinball';
import type {TennisState} from '../../games/soccerTennis';
export type {ArcadeResult,ArcadeSettled,ArcadeResultKind} from './types';
export {runnerResult,runnerCoins,RUNNER_COIN_REASON} from './runnerResult';
export {pinballResult,pinballCoins,PINBALL_COIN_REASON} from './pinballResult';
export {tennisResult,tennisCoins,TENNIS_COIN_REASON} from './tennisResult';

/** The old Breakaway best key, still read by older island code; written only by runs that write the classic record. */
export const LEGACY_RUNNER_BEST_KEY='fi.game.runner.best';

/**
 * Applies a finished game's result (one place, same order as the old inline game-over code in ArcadeGame3D.tsx):
 *  1. pinball: an elite tier saves its own best; the classic table checks the record BEFORE it is saved (NEW BEST);
 *  2. `beforeRecord` (tennis: the component's tennisOver reads the old best, saves a tour best);
 *  3. a route with its own best saves it, else the classic arcade record is saved;
 *  4. the old Breakaway best key;
 *  5. the board score (floored, 0 = no high-score entry); a Daily Run posts only the day's first finished run (practice after).
 */
export function settleArcadeResult(r:ArcadeResult,hooks:{beforeRecord?:()=>void}={}):ArcadeSettled{
 let pinballFresh=false,record:ArcadeSettled['record']=null;
 if(r.kind==='pinball')pinballFresh=r.pinballTier?savePinballTier(r.pinballTier.id,r.pinballTier.score,r.pinballTier.goals).best:(r.pinballScore??0)>0&&(r.pinballScore??0)>readArcadeRecord('pinball').best;
 hooks.beforeRecord?.();
 if(r.runnerTierBest)saveRunnerTierBest(r.runnerTierBest.mode as RunnerModeId,r.runnerTierBest.score);
 else if(r.record)record=saveArcadeRecord(r.record.game,r.record.best,r.record.unlocked);
 if(r.legacyRunnerBest!=null)try{const best=Number(localStorage.getItem(LEGACY_RUNNER_BEST_KEY)||0);if(r.legacyRunnerBest>best)localStorage.setItem(LEGACY_RUNNER_BEST_KEY,String(r.legacyRunnerBest));}catch{}
 const boardRun=r.runnerDaily?claimRunnerDailyRun(r.runnerDaily.day,r.runnerDaily.score):true;
 return {record,pinballFresh,boardScore:boardRun&&r.score>0?Math.floor(r.score):null};
}

/** The three cabinets' live states (createArcadeGame().state). */
export type ArcadeStates={runner:RunnerEnd;pinball:PinballState;tennis:TennisState};
export function arcadeResultFor(kind:ArcadeResult['kind'],s:ArcadeStates):ArcadeResult{return kind==='runner'?runnerR(s.runner):kind==='pinball'?pinballR(s.pinball):tennisR(s.tennis);}
