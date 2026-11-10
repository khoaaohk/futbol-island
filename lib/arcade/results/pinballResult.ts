import {arcadeCoinTarget} from '../arcadeWalletCore';
import {pinballUnlockReach,type PinballState} from '../../games/soccerPinball';
import {pinballBoardFor,pinballTierOf} from '../../games/soccerPinballTiers';
import type {ArcadeResult} from './types';

export const PINBALL_COIN_REASON='Goals and passing moves';
export const pinballCoins=(s:PinballState)=>arcadeCoinTarget('pinball',s);
/** An elite tier (Derby Night, World Final) keeps its own best and board; the classic table keeps the arcade record. */
export function pinballResult(s:PinballState):ArcadeResult{
 const tier=pinballTierOf(s.tier);
 return {kind:'pinball',coins:pinballCoins(s),coinReason:PINBALL_COIN_REASON,board:pinballBoardFor(s.tier),score:s.score,
  record:tier?null:{game:'pinball',best:s.score,unlocked:pinballUnlockReach(s)},
  pinballTier:tier?{id:tier.id,score:s.score,goals:s.goals}:null,pinballScore:s.score,
  today:{kind:'pinball',hot:s.hot?.n??0,moves:s.moves,goals:s.goals}};
}
