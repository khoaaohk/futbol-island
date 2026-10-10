import {useSyncExternalStore} from 'react';

/**
 * Card offers wait for the end of a lesson, quiz or story (Oct 10 2026, user). An earned offer is saved at once (cardRewardStore,
 * localStorage, so a reload loses nothing), but CardOfferHost only opens it once no holder is active: FieldLearning holds from the
 * moment a lesson opens until its quiz has ended (or it closes back to Paths or the island), and Paths holds while a story plays.
 * Each holder registers under its own id, so one closing never releases another that has just opened (Paths' "Next lesson" swaps
 * one FieldLearning for the next in the same commit). In-memory only: nothing is held after a reload, when no lesson is open.
 */
const holds=new Set<string>(),listeners=new Set<()=>void>();
let nextId=0;
/** A fresh holder id (one per mounted holder). */
export const cardHoldId=(name:string)=>`${name}:${++nextId}`;
export function holdCardOffers(id:string,held:boolean){
 if(holds.has(id)===held)return;
 if(held)holds.add(id);else holds.delete(id);
 listeners.forEach(fn=>fn());
}
export const cardOffersHeld=()=>holds.size>0;
function subscribe(fn:()=>void){listeners.add(fn);return()=>{listeners.delete(fn);};}
/** True while any lesson, quiz or story holds card offers back. */
export function useCardOffersHeld():boolean{return useSyncExternalStore(subscribe,cardOffersHeld,()=>false);}
/**
 * FieldLearning's rule, pure for tests: a lesson screen holds offers while it is loading a Paths or journey launch, playing or
 * paused in a lesson, in its quiz, or replaying "Watch that part". It lets them through only with no lesson chosen (the live
 * match view) or after its quiz has ended on the lesson's end screen.
 */
export function lessonHoldsCards(s:{launching:boolean;chosen:boolean;quiz:boolean;quizEnded:boolean;playing:boolean;rewatch:boolean}):boolean{
 if(!s.chosen)return s.launching;
 return s.quiz||s.rewatch||s.playing||!s.quizEnded;
}
