import {arcadeCoinTarget} from '../arcadeWalletCore';
import {TENNIS_COURTS,tennisBoardFor,type TennisState} from '../../games/soccerTennis';
import type {ArcadeResult} from './types';

export const TENNIS_COIN_REASON='Clean returns and points';
export const tennisCoins=(s:TennisState)=>arcadeCoinTarget('tennis',{cleanReturns:s.cleanReturns,points:s.score.you,won:s.winner==='you'});
/** A tour (Pro, Legend) posts its tour score to its own board and keeps its own best (the component's tennisOver);
 * the classic ladder posts the best rally and keeps the arcade record (best rally, courts reached). */
export function tennisResult(s:TennisState):ArcadeResult{
 const tour=s.tour;
 return {kind:'tennis',coins:tennisCoins(s),coinReason:TENNIS_COIN_REASON,board:tennisBoardFor(tour),score:tour?s.tourScore:s.bestRally,
  record:tour?null:{game:'tennis',best:s.bestRally,unlocked:Math.min(TENNIS_COURTS.length,s.level+(s.winner==='you'?1:0))},tour,
  today:{kind:'tennis',court:s.level,won:s.winner==='you',rally:s.bestRally,perfect:s.perfectTouches??0,clean:s.cleanReturns,tour}};
}
