/**
 * Claw Club coins + prizes (Nov 21 2026). Pure, with the gashapon store's ports (lib/gashapon/store.ts): no React, no three.js.
 *
 * The claw is the ONLY arcade machine that costs coins (the screen games earn them). One try = one idempotent wallet debit
 * `claw:<playId>` of CLAW_PRICE; the wallet refuses it when the balance is short (never negative).
 *
 * Price, 10 coins, and why: a gashapon capsule is 20 coins for a toy every time. A claw try wins about half the time for a
 * careful aim (tests/claw-machine.cjs measures it), so a toy costs about the same 20 coins on average, and one screen-game run
 * (up to 12 coins) pays for one try.
 *
 * Refunds: a try that never reached the drop (you left, the machine failed to start, the page closed) is refunded in full
 * through a one-off credit `claw-refund:<playId>` (idempotent, so a refund is never paid twice).
 *
 * Prizes go into the SAME save as gashapon toys (`owned`, synced with the account), so the Toy Shelf and the 3D viewer show them.
 * A toy you already own counts up (like a repeat capsule) and pays back GASHAPON.repeatRefund (5) through `claw-repeat:<playId>`.
 * Receipts per play id (in the save's `claw` record) make finishing a play idempotent: the same id never awards twice.
 *
 * Daily cap (owner, Nov 21 2026: "like gashapon's 12 a day"): CLAW_TRIES_PER_DAY paid tries per local play day (ports.day, the
 * gashapon day key: lib/town/dailyPlay.ts localPlayDay, so both reset at local midnight). The paid play ids live in the save's
 * `claw.paid` for `claw.day`; a refunded try is taken off the list, so it never counts. At 0 left, `pay` refuses with no charge.
 *
 * Pity rule (fair for kids): after CLAW_PITY_AFTER misses in a row, the next try has a firm grip (lib/claw/clawPhysics.ts
 * FIRM_GRIP: the grip holds ~30 % more load and a weak grab counts as a better one). A win resets the count. Nothing ever makes
 * a grip weaker on purpose.
 */
import {GASHAPON_REFUND,RECEIPTS_KEPT,sanitizeGashapon,type GashaponPorts,type GashaponState,type ClawReceipt} from '../gashapon/store';
import {gashaponToy,type GashaponToy} from '../gashapon/toys';
import {clawPrize} from './clawPrizes';

export const CLAW_PRICE=10,CLAW_PITY_AFTER=4,CLAW_TRIES_PER_DAY=12;
export const CLAW_DAILY_MESSAGE=`That's ${CLAW_TRIES_PER_DAY} claw tries today. The claw machine refills tomorrow!`;
export type ClawFinish=
 |{ok:true;playId:string;toy:GashaponToy|null;duplicate:boolean;count:number;refund:number;streak:number;repeat:boolean}
 |{ok:false;playId:string;reason:'id'|'toy'|'save';message:string};

const isId=(s:unknown):s is string=>typeof s==='string'&&s.length>0&&s.length<=80&&/^[A-Za-z0-9_.:-]+$/.test(s);

export function createClawStore(ports:GashaponPorts){
 const lock=<T,>(fn:()=>T|Promise<T>)=>ports.lock?ports.lock(fn):Promise.resolve().then(fn);
 const read=():GashaponState=>{try{return sanitizeGashapon(ports.read());}catch{return sanitizeGashapon(null);}};
 const save=(s:GashaponState)=>{try{ports.write(s);return true;}catch{return false;}};
 const claw=(s:GashaponState)=>s.claw??{plays:{},streak:0};
 const paidToday=(s:GashaponState)=>{const c=claw(s);return c.day===ports.day(ports.now())?c.paid??[]:[];};
 return {
  /** Misses in a row before this try. */
  streak:()=>claw(read()).streak,
  /** True when the next try gets the pity rule's firm grip. */
  firmNext:()=>claw(read()).streak>=CLAW_PITY_AFTER,
  /** Tries left today (refunded tries do not count). */
  triesLeft:()=>Math.max(0,CLAW_TRIES_PER_DAY-paidToday(read()).length),
  /** Pay for one try (before the claw moves). Refused with no charge when today's tries are used up (`daily: true`). */
  async pay(playId:string):Promise<{ok:true}|{ok:false;reason:string;daily?:true}>{
   if(!isId(playId))return {ok:false,reason:'Something went wrong. Try again.'};
   try{return await lock(async()=>{
    const s=read(),paid=paidToday(s),again=paid.includes(playId);
    if(!again&&paid.length>=CLAW_TRIES_PER_DAY)return {ok:false as const,reason:CLAW_DAILY_MESSAGE,daily:true as const};
    const r=await ports.spend(`claw:${playId}`,CLAW_PRICE,'Claw Club try');
    if(r.ok&&!again){const now=read();save({...now,claw:{...claw(now),day:ports.day(ports.now()),paid:[...paidToday(now),playId]}});}
    return r;
   });}catch{return {ok:false,reason:'Something went wrong. Your coins are safe.'};}
  },
  /** Give the coins back for a try that never dropped (idempotent per play id). Returns the coins credited (0 if already). */
  async refund(playId:string):Promise<number>{
   if(!isId(playId))return 0;const s=read();if(claw(s).plays[playId])return 0;// a finished play is never refunded
   let coins=0;try{coins=await ports.refund(`claw-refund:${playId}`,CLAW_PRICE,'Claw Club · coins back');}catch{return 0;}
   // a refunded try does not count toward today's cap
   const now=read(),c=claw(now);if(c.paid?.includes(playId))save({...now,claw:{...c,paid:c.paid.filter(id=>id!==playId)}});
   return coins;
  },
  /** Record the try's result: the toy that reached the tray (or null for a miss). Same play id → same answer, no second award. */
  async finish(playId:string,toyId:string|null):Promise<ClawFinish>{
   if(!isId(playId))return {ok:false,playId,reason:'id',message:'Something went wrong.'};
   if(toyId!==null&&(!gashaponToy(toyId)||!clawPrize(toyId)))return {ok:false,playId,reason:'toy',message:'That toy is not in this machine.'};
   try{return await lock(async()=>{
    const s=read(),c=claw(s),old=c.plays[playId];
    if(old){const toy=old.toy?gashaponToy(old.toy)!:null;let refund=old.refund;
     if(toy&&old.dup&&!refund)refund=await payRepeat(playId,toy);
     return {ok:true as const,playId,toy,duplicate:old.dup,count:toy?s.owned[toy.id]?.n??1:0,refund,streak:c.streak,repeat:true};}
    const at=ports.now(),toy=toyId?gashaponToy(toyId)!:null,had=toy?s.owned[toy.id]:undefined,dup=!!had,count=toy?(had?.n??0)+1:0;
    const plays:Record<string,ClawReceipt>={...c.plays,[playId]:{toy:toy?.id??null,at,dup,refund:0}};
    const keep=Object.entries(plays).sort((a,b)=>b[1].at-a[1].at).slice(0,RECEIPTS_KEPT);
    const streak=toy?0:c.streak+1;
    const next:GashaponState={...s,owned:toy?{...s.owned,[toy.id]:{n:count,first:had?.first??at}}:s.owned,claw:{...c,plays:Object.fromEntries(keep),streak}};
    if(!save(next))return {ok:false as const,playId,reason:'save' as const,message:'Your prize could not be saved. Tap to try again.'};
    const refund=toy&&dup?await payRepeat(playId,toy):0;
    return {ok:true as const,playId,toy,duplicate:dup,count,refund,streak,repeat:false};
   });}catch{return {ok:false,playId,reason:'save',message:'Your prize could not be saved. Tap to try again.'};}
  },
 };
 async function payRepeat(playId:string,toy:GashaponToy){
  let refund=0;try{refund=await ports.refund(`claw-repeat:${playId}`,GASHAPON_REFUND,`Claw Club repeat · ${toy.name}`);}catch{refund=0;}
  if(refund>0){const after=read(),c=after.claw;if(c?.plays[playId]){c.plays[playId]={...c.plays[playId],refund};save(after);}}
  return refund;
 }
}
export type ClawStore=ReturnType<typeof createClawStore>;
