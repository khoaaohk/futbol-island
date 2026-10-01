/**
 * Learning coins (docs/economy/ECONOMY_PROPOSAL.md §5.1, applied 28 Sep 2026). Pure rules; the browser instance lives in
 * cardRewardTriggers.ts, next to the card triggers it pays alongside.
 *
 * Learning pays coins as well as cards, once ever per lesson/ball/story/stage/item/path (idempotent wallet ids
 * `learn:<kind>:<id>` through the wallet's creditOnce). Learning coins are never capped and never metered by the Training meter.
 */
export type LearnKind='quiz'|'ball'|'story'|'journey'|'explore'|'path'|'review'|'book';
/** Coins per learning moment. A quiz pays LEARN_COINS.quiz on its first completion, plus quizPerfect when that first run is
 *  perfect on the first try (the same run that earns the quiz card).
 *  ball 5 → 10 (29 Sep 2026, docs/economy/ECONOMY_UPDATE_2026-09-29.md): the hunt grew to 100 balls with the 20 far Coral Cay
 *  balls, and 5 coins per ball (~86/h) was the weakest learning pay, below the arcade. 10 (~170/h) stays below a lesson quiz
 *  (~240/h) and pays for the 4 new books. Forward-only: balls already paid keep their saved 5 (creditOnce never pays an id twice).
 *  review 2 / book 5 (30 Sep 2026, docs/economy/ECONOMY_UPDATE_2026-09-30.md): a correct Daily warm-up answer pays 2, at most
 *  REVIEW_PAID_PER_DAY (3) a day (ids `learn:review:<day>:<n>`, lib/learning/review.ts), and a book's "Take it to your game"
 *  check pays 5 once per book (`learn:book:<bookId>`). The only daily-repeatable learning coins, hard-capped at 6 a day. */
export const LEARN_COINS={quiz:12,quizPerfect:6,ball:10,story:10,journey:8,explore:5,path:75,review:2,book:5} as const;
/** Window event the island HUD listens for to show the coin toast. Detail: LearnCoinsEarned. */
export const LEARN_COINS_EARNED='fi2-learn-coins-earned';
export type LearnCoinsEarned={kind:LearnKind;amount:number;reason:string};
export const learnRunId=(kind:LearnKind,id:string)=>`learn:${kind}:${id}`;
export function learnAmount(kind:LearnKind,perfect=false):number{return kind==='quiz'?LEARN_COINS.quiz+(perfect?LEARN_COINS.quizPerfect:0):LEARN_COINS[kind];}
/** The toast title: "+12 coins · You passed ‘Scanning’". */
export const learnToastTitle=(amount:number,reason:string)=>`+${amount} coin${amount===1?'':'s'} · ${reason}`;
type Ports={creditOnce:(id:string,game:'learn',amount:number,reason:string)=>Promise<number>;notify:(detail:LearnCoinsEarned)=>void};
export function createLearnCoins(ports:Ports){
 /** Pays once ever for this learning moment; resolves to the coins paid now (0 when it had already paid). */
 async function pay(kind:LearnKind,id:string,reason:string,perfect=false):Promise<number>{
  if(!id)return 0;const amount=learnAmount(kind,perfect);
  let paid=0;try{paid=await ports.creditOnce(learnRunId(kind,id),'learn',amount,`Learning · ${reason}`);}catch{return 0;}
  if(paid>0)try{ports.notify({kind,amount:paid,reason});}catch{/* the coins are saved; only the toast is lost */}
  return paid;
 }
 return {pay};
}
