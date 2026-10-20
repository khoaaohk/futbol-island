'use client';
/**
 * The Bug book's learning coins (lib/town/jobs/bugBook.ts), all through the wallet's creditOnce (never paid twice, never metered),
 * with the usual learning-coin toast (LEARN_COINS_EARNED):
 *  - all 20 bugs: LEARN_COINS.book (`learn:book:bug-book`); all 8 fireflies: LEARN_COINS.book (`learn:book:bug-book-night`);
 *  - a species' first catch ever: NEW_SPECIES_COINS (`learn:book:bug-new-<id>`, a small bonus on top of the shift's pay).
 * Called on jobScene's BUG_BOOK_COMPLETE_EVENT / BUG_NEW_SPECIES_EVENT (IslandJobs) and again whenever the book opens complete, so a
 * missed event still pays. Browser only.
 */
import {creditOnce} from '@/lib/arcade/arcadeWallet';
import {createLearnCoins,LEARN_COINS_EARNED} from '../learnCoins';
import {BUG_BOOK_REWARD_ID,BUG_BOOK_NIGHT_REWARD_ID,bugBookComplete,nightBookComplete,bugNewRewardId,markBugBookReward,readBugBook} from './bugBook';
import {NEW_SPECIES_COINS} from './bugCatch';
import {bugSpeciesById,fireflyById} from './bugSpecies';

const notify=(detail:unknown)=>{if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent(LEARN_COINS_EARNED,{detail}));};
const learnCoins=createLearnCoins({creditOnce:(id,game,amount,reason)=>creditOnce(id,game,amount,reason),notify});
export async function claimBugBookReward():Promise<number>{
 const s=readBugBook();let paid=0;
 if(bugBookComplete(s)){paid+=await learnCoins.pay('book',BUG_BOOK_REWARD_ID,'Bug book complete: the full squad of 20!');markBugBookReward();}
 if(nightBookComplete(s)){paid+=await learnCoins.pay('book',BUG_BOOK_NIGHT_REWARD_ID,'Bug book: every firefly call!');markBugBookReward(undefined,true);}
 return paid;
}
/** A new species for the book: a small one-time bonus (creditOnce id per species). */
export async function claimNewSpecies(id:string):Promise<number>{
 const name=bugSpeciesById(id)?.name??(fireflyById(id)?`“${fireflyById(id)!.call}” firefly`:'');if(!name)return 0;
 try{const paid=await creditOnce(`learn:book:${bugNewRewardId(id)}`,'learn',NEW_SPECIES_COINS,`Learning · New in the Bug book: ${name}`);
  if(paid>0)notify({kind:'book',amount:paid,reason:`New in the Bug book: ${name}`});return paid;}catch{return 0;}
}
