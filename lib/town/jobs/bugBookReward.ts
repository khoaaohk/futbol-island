'use client';
/**
 * The Bug book's one-time completion bonus (lib/town/jobs/bugBook.ts): LEARN_COINS.book through the wallet's creditOnce
 * (`learn:book:bug-book`, never paid twice, never metered), with the usual learning-coin toast (LEARN_COINS_EARNED).
 * Called when the 16th kind is caught (IslandJobs, on jobScene's BUG_BOOK_COMPLETE_EVENT) and again whenever the book opens
 * complete, so a missed event still pays. Browser only.
 */
import {creditOnce} from '@/lib/arcade/arcadeWallet';
import {createLearnCoins,LEARN_COINS_EARNED} from '../learnCoins';
import {BUG_BOOK_REWARD_ID,bugBookComplete,markBugBookReward,readBugBook} from './bugBook';

const learnCoins=createLearnCoins({creditOnce:(id,game,amount,reason)=>creditOnce(id,game,amount,reason),notify:detail=>{if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent(LEARN_COINS_EARNED,{detail}));}});
export async function claimBugBookReward():Promise<number>{
 const s=readBugBook();if(!bugBookComplete(s))return 0;
 const paid=await learnCoins.pay('book',BUG_BOOK_REWARD_ID,'Bug book complete: the full squad!');
 markBugBookReward();return paid;
}
