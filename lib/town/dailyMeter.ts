/**
 * Training meter (docs/economy/ECONOMY_PROPOSAL.md §5.1, applied 28 Sep 2026). Pure rules, no storage, no timers.
 *
 * One gentle daily soft cap across every REPEATABLE way to earn coins: island jobs, arcade payouts (incl. Pass Puzzles),
 * farmers-market sales and card trade-ins. Coins pay in full until TRAINING_FULL_COINS have been paid today, then half until
 * TRAINING_HALF_COINS, then a 1-coin thank-you tip per earning. Nothing is ever blocked, and it resets at local midnight.
 * Learning coins (lessons, hidden balls, stories, journeys, explore, paths), the daily kick-off and welcome coins are NEVER
 * metered. The per-job caps (jobEconomy.ts) and the market's daily allowance (market.ts) still apply first.
 *
 * The wallet (lib/arcade/arcadeWalletCore.ts) applies it under its own lock: today's total is computed from its saved runs, so
 * there is no extra ledger to drift out of step, and a retried or growing run is metered as one earning (idempotent).
 */
export const TRAINING_FULL_COINS=60,TRAINING_HALF_COINS=120,TRAINING_TIP_COINS=1;
export type TrainingTier='full'|'half'|'tip';
/** Arcade machines whose payouts count as training (every arcade game, puzzles included). */
export const TRAINING_GAMES:readonly string[]=['runner','pinball','tennis','live','puzzle'];
/** Island wallet runs that count as training: job shifts, market sales, card trade-ins. */
const TRAINING_ISLAND_RUN=/^(island-job:|market:|market-sale:|card-trade:)/;
/** Whether a wallet run is repeatable training (metered) rather than a one-off grant or a learning reward. */
export function isTrainingRun(id:string,game:string):boolean{return TRAINING_GAMES.includes(game)||game==='island'&&TRAINING_ISLAND_RUN.test(id);}
const whole=(n:number)=>Number.isFinite(n)?Math.max(0,Math.floor(n)):0;
/** The tier the next earning pays at, given the training coins already paid today. */
export function trainingTier(paidToday:number):TrainingTier{const p=whole(paidToday);return p<TRAINING_FULL_COINS?'full':p<TRAINING_HALF_COINS?'half':'tip';}
/**
 * Coins actually paid for an earning worth `raw` coins when `paidToday` training coins have been paid already today.
 * Full coins up to the full line, half coins up to the half line, and at least one coin for any real earning (the tip).
 */
export function trainingPay(paidToday:number,raw:number):number{
 const start=whole(paidToday),amount=whole(raw);if(!amount)return 0;
 let pay=0;for(let i=0;i<amount;i++){const t=start+pay;if(t<TRAINING_FULL_COINS)pay+=1;else if(t<TRAINING_HALF_COINS)pay+=.5;else break;}
 return Math.max(TRAINING_TIP_COINS,Math.floor(pay));
}
/** What the pocket drawer shows: the tier and how far along today's meter is (0–1). No countdown, just a bar and a line. */
export function trainingMeterView(paidToday:number):{paid:number;tier:TrainingTier;fill:number;line:string}{
 const paid=whole(paidToday),tier=trainingTier(paid);
 const line=tier==='full'?`Full pay for the next ${TRAINING_FULL_COINS-paid} coins of jobs, arcade games and market sales today.`
  :tier==='half'?'Great training today! Jobs, arcade games and sales pay half for the rest of the day.'
  :'Brilliant day! Extra jobs and games earn a 1-coin thank-you tip. Full pay again tomorrow.';
 return {paid,tier,fill:Math.min(1,paid/TRAINING_HALF_COINS),line};
}
