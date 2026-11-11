import {arcadeCoinTarget} from '../arcadeWalletCore';
import {TENNIS_COURTS,tennisBoardFor,type TennisState} from '../../games/soccerTennis';
import type {ArcadeResult} from './types';

export const TENNIS_COIN_REASON='Clean returns and points';
/** Endless play (Nov 10 2026): points are the whole run's won points (the match score resets at every seam) and "won" is a match won. */
const wonMatch=(s:TennisState)=>s.winner==='you'||(s.matchesWon??0)>0;
export const tennisCoins=(s:TennisState)=>arcadeCoinTarget('tennis',{cleanReturns:s.cleanReturns,points:s.pointsWon??s.score.you,won:wonMatch(s)});
/** A tour (Pro, Legend) posts its tour score to its own board and keeps its own best (the component's tennisOver).
 * Endless play (Nov 10 2026): a court run posts its RUN SCORE to the same 'tennis' board (it posted the best rally before; a run now
 * scores every touch, so a longer run scores more) and keeps the arcade record as it was: best rally, and the highest court reached
 * (every court passed in the run is unlocked, all nine once the stops have looped). */
export function tennisResult(s:TennisState):ArcadeResult{
 const tour=s.tour;
 return {kind:'tennis',coins:tennisCoins(s),coinReason:TENNIS_COIN_REASON,board:tennisBoardFor(tour),score:s.tourScore,
  record:tour?null:{game:'tennis',best:s.bestRally,unlocked:Math.min(TENNIS_COURTS.length,Math.max(s.topLevel??s.level,s.level+(s.winner==='you'?1:0)))},tour,
  today:{kind:'tennis',court:s.startLevel??s.level/* the court the run was picked on: a daily 'on court N' asks for a run started there */,won:wonMatch(s),rally:s.bestRally,perfect:s.perfectTouches??0,clean:s.cleanReturns,tour}};
}
