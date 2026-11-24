'use client';
/**
 * The Island stamp book's learning coins (lib/town/islandStamps.ts), through the wallet's creditOnce (never paid twice), with the
 * usual learning-coin toast: a first stamp pays LEARN_COINS.book (`learn:book:stamp-<id>`); the full book of 8 pays
 * STAMP_BOOK_BONUS once (`learn:book:stamp-book`). Browser only.
 */
import {creditOnce} from '@/lib/arcade/arcadeWallet';
import {createLearnCoins,LEARN_COINS_EARNED,learnAmount} from './learnCoins';
import {STAMP_BOOK_BONUS,STAMP_BOOK_REWARD_ID,bookComplete,markStampReward,readStamps,stampById,stampRewardId,type StampId} from './islandStamps';

const notify=(detail:unknown)=>{if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent(LEARN_COINS_EARNED,{detail}));};
const learnCoins=createLearnCoins({creditOnce:(id,game,amount,reason)=>creditOnce(id,game,amount,reason),notify});
/** Coins a first stamp shows in the stamping moment (the amount claimStamp pays). */
export const STAMP_COINS=learnAmount('book');
export async function claimStamp(id:StampId):Promise<number>{
 let paid=0;
 try{paid+=await learnCoins.pay('book',stampRewardId(id),`Island stamp book: ${stampById(id)?.name??id}`);}catch{/* offline: retried on the next open */}
 const s=readStamps();
 if(bookComplete(s)&&!s.reward){try{const got=await creditOnce(`learn:book:${STAMP_BOOK_REWARD_ID}`,'learn',STAMP_BOOK_BONUS,'Learning · Island stamp book complete');
  if(got>0)notify({kind:'book',amount:got,reason:'Island stamp book complete: all 8 stamps!'});paid+=got;markStampReward();}catch{/* retried next time */}}
 return paid;
}
