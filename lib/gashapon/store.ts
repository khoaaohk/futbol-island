/**
 * Gashapon collection + spin rules (Nov 8 2026; docs/gashapon-design.md). Pure, with ports: no React, no three.js, no window.
 *
 * Save: GASHAPON_KEY (SYNC in lib/saves/snapshot.ts, so it travels with the account snapshot like the Konbini Collection; no new
 * table). It holds the owned map (count + first-found time per toy), the recent spin receipts (for idempotency), and today's
 * spin count + the last spin time (the daily cap and cool-down).
 *
 * Coins: the arcade wallet is the only balance. A spin is ONE idempotent debit `gashapon:<spinId>` of GASHAPON.price; the wallet
 * refuses it when the balance is short (never negative) and a repeat of the same id is never charged twice. A toy you already
 * own pays back GASHAPON.repeatRefund through a one-off wallet credit `gashapon-refund:<spinId>` (also idempotent).
 * The toy is rolled from a hash of the spin id, so a retry after a failed save (same spin id) gives the same toy and no new charge.
 *
 * Browser wiring (next round, e.g. lib/gashapon/gashaponBrowser.ts):
 *   createGashaponStore({read:()=>JSON.parse(localStorage.getItem(GASHAPON_KEY)??'null'),write:s=>localStorage.setItem(GASHAPON_KEY,JSON.stringify(s)),
 *    now:Date.now,day:localPlayDay,spend:(id,cost,reason)=>spendArcadeCoins(id,cost,reason),
 *    refund:(id,coins,reason)=>creditOnce(id,'island',coins,reason),lock:fn=>navigator.locks?navigator.locks.request(GASHAPON_KEY,fn):Promise.resolve().then(fn)})
 */
import {GASHAPON} from '../economy';
import {isGashaponMachine,gashaponMachine,gashaponSetOf,type GashaponMachineId} from './machines';
import {gashaponToy,pickToy,type GashaponToy} from './toys';

export const GASHAPON_KEY='fi2-gashapon-v1';
export const GASHAPON_PRICE=GASHAPON.price,GASHAPON_REFUND=GASHAPON.repeatRefund,GASHAPON_SPINS_PER_DAY=GASHAPON.spinsPerDay,GASHAPON_MIN_SPIN_MS=GASHAPON.minSpinMs;
/** Spin receipts kept for idempotency (older ones drop off; the wallet still never re-charges an old id). */
export const RECEIPTS_KEPT=40;

export type OwnedToy={n:number;first:number};
export type SpinReceipt={m:GashaponMachineId;toy:string;at:number;dup:boolean;refund:number};
export type GashaponState={version:1;owned:Record<string,OwnedToy>;spins:Record<string,SpinReceipt>;day:string;today:number;last:number};
export const emptyGashapon=():GashaponState=>({version:1,owned:{},spins:{},day:'',today:0,last:0});

export type SpinResult=
 |{ok:true;spinId:string;machine:GashaponMachineId;toy:GashaponToy;duplicate:boolean;count:number;refund:number;repeat:boolean}
 |{ok:false;spinId:string;reason:'machine'|'id'|'busy'|'daily'|'cooldown'|'coins'|'save';message:string};

export type GashaponPorts={
 read:()=>unknown;write:(s:GashaponState)=>void;now:()=>number;day:(at:number)=>string;
 spend:(id:string,cost:number,reason:string)=>Promise<{ok:true}|{ok:false;reason:string}>;
 refund:(id:string,coins:number,reason:string)=>Promise<number>;
 lock?:<T>(fn:()=>T|Promise<T>)=>Promise<T>;
};

const isId=(s:unknown):s is string=>typeof s==='string'&&s.length>0&&s.length<=80&&/^[A-Za-z0-9_.:-]+$/.test(s);
const whole=(v:unknown,max:number)=>typeof v==='number'&&Number.isFinite(v)?Math.min(max,Math.max(0,Math.floor(v))):0;

/** Keeps only known toys/machines and sane numbers; anything else becomes the empty save. Never throws. */
export function sanitizeGashapon(v:unknown):GashaponState{
 const out=emptyGashapon();
 try{
  if(!v||typeof v!=='object'||(v as {version?:unknown}).version!==1)return out;const s=v as Partial<GashaponState>;
  for(const [id,o] of Object.entries(s.owned??{}))if(gashaponToy(id)&&o&&typeof o==='object'){const n=whole(o.n,9999);if(n>0)out.owned[id]={n,first:whole(o.first,9e15)};}
  const receipts=Object.entries(s.spins??{}).filter(([id,r])=>isId(id)&&r&&isGashaponMachine(r.m)&&gashaponToy(r.toy)?.machine===gashaponSetOf(r.m))
   .sort((a,b)=>whole(b[1].at,9e15)-whole(a[1].at,9e15)).slice(0,RECEIPTS_KEPT);
  for(const [id,r] of receipts)out.spins[id]={m:r.m,toy:r.toy,at:whole(r.at,9e15),dup:r.dup===true,refund:whole(r.refund,GASHAPON_REFUND)};
  out.day=typeof s.day==='string'&&s.day.length<=16?s.day:'';out.today=whole(s.today,999);out.last=whole(s.last,9e15);
 }catch{return emptyGashapon();}
 return out;
}

/** FNV-1a 32-bit → a 0..1 roll (mulberry32 step) for the spin id, so a retried spin rolls the same toy. */
export function spinRoll(spinId:string,machine:string):number{
 let h=0x811c9dc5;const s=machine+'|'+spinId;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193);}
 let a=h>>>0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;
}

export function createGashaponStore(ports:GashaponPorts){
 let busy=false;
 const lock=<T,>(fn:()=>T|Promise<T>)=>ports.lock?ports.lock(fn):Promise.resolve().then(fn);
 function read():GashaponState{try{return sanitizeGashapon(ports.read());}catch{return emptyGashapon();}}
 function save(s:GashaponState):boolean{try{ports.write(s);return true;}catch{return false;}}
 async function payRefund(spinId:string,toy:GashaponToy):Promise<number>{
  let refund=0;try{refund=await ports.refund(`gashapon-refund:${spinId}`,GASHAPON_REFUND,`Gashapon repeat · ${toy.name}`);}catch{refund=0;}
  if(refund>0){const after=read();if(after.spins[spinId]){after.spins[spinId]={...after.spins[spinId],refund};save(after);}}
  return refund;
 }
 const fail=(spinId:string,reason:Extract<SpinResult,{ok:false}>['reason'],message:string):SpinResult=>({ok:false,spinId,reason,message});

 /** One spin. `spinId` is made once per button press by the caller (a UUID); pressing "retry" re-sends the same id. */
 async function spin(machineId:string,spinId:string):Promise<SpinResult>{
  if(!isGashaponMachine(machineId))return fail(spinId,'machine','That machine is not here.');
  if(!isId(spinId))return fail(spinId,'id','Something went wrong. Try again.');
  if(busy)return fail(spinId,'busy','The capsule is still coming out!');
  busy=true;
  try{return await lock(async()=>{
   const s=read(),at=ports.now(),old=s.spins[spinId];
   // Same spin id again: the same result, no new charge, no second toy.
   if(old){const toy=gashaponToy(old.toy)!;let refund=old.refund;
    // A repeat toy whose refund did not land last time: ask again (the wallet credit is once-only per id, never doubled).
    if(old.dup&&!refund){refund=await payRefund(spinId,toy);}
    return {ok:true as const,spinId,machine:old.m,toy,duplicate:old.dup,count:s.owned[old.toy]?.n??1,refund,repeat:true};}
   const day=ports.day(at),today=s.day===day?s.today:0;
   if(today>=GASHAPON_SPINS_PER_DAY)return fail(spinId,'daily',`That's ${GASHAPON_SPINS_PER_DAY} capsules today. The machines refill tomorrow!`);
   if(s.last&&at>=s.last&&at-s.last<GASHAPON_MIN_SPIN_MS)return fail(spinId,'cooldown','One at a time! Open your capsule first.');
   const toy=pickToy(machineId,spinRoll(spinId,machineId))!;
   const paid=await ports.spend(`gashapon:${spinId}`,GASHAPON_PRICE,`Gashapon · ${gashaponMachine(machineId)!.name}`);
   if(!paid.ok)return fail(spinId,'coins',paid.reason);
   const had=s.owned[toy.id],dup=!!had,count=(had?.n??0)+1;
   const spins={...s.spins,[spinId]:{m:machineId,toy:toy.id,at,dup,refund:0}};
   const keep=Object.entries(spins).sort((a,b)=>b[1].at-a[1].at).slice(0,RECEIPTS_KEPT);
   const next:GashaponState={version:1,owned:{...s.owned,[toy.id]:{n:count,first:had?.first??at}},spins:Object.fromEntries(keep),day,today:today+1,last:at};
   // Coins are already spent under this id: if the save fails, a retry with the same id finishes it without a new charge.
   if(!save(next))return fail(spinId,'save','Your capsule could not be saved. Tap again to open it (no extra coins).');
   const refund=dup?await payRefund(spinId,toy):0;
   return {ok:true as const,spinId,machine:machineId,toy,duplicate:dup,count,refund,repeat:false};
  });}
  catch{return fail(spinId,'save','Something went wrong. Your coins are safe; try again.');}
  finally{busy=false;}
 }
 return {
  read,spin,
  owned:(toyId:string)=>read().owned[toyId]??null,
  /** Toys found per machine (0–6) and in all (0–84). */
  progress(){const s=read(),per:Record<string,number>={};let all=0;for(const id of Object.keys(s.owned)){const m=gashaponToy(id)!.machine;per[m]=(per[m]??0)+1;all++;}return {per,all};},
  spinsLeftToday(){const s=read();return Math.max(0,GASHAPON_SPINS_PER_DAY-(s.day===ports.day(ports.now())?s.today:0));},
 };
}
