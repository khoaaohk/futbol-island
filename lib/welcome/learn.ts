/**
 * What the Welcome back suggestion learned on THIS device (Nov 14 2026, docs/welcome-suggestions.md): per kind shown / tapped /
 * ignored in a row, the visit count, the open suggestion and a tapped one waiting to be "acted" (the player really got there).
 * Pure. Stored in the device key WELCOME_LEARN_KEY (lib/saves/snapshot.ts DEVICE_KEYS: never synced, never sent). The 10%
 * holdout arm is its own device key, WELCOME_ARM_KEY.
 */
import {INTERESTS,type Interest} from './tally';
import {WELCOME_KINDS,type WelcomeKind} from './kinds';

export const WELCOME_LEARN_KEY='fi2-welcome-learn-v1',WELCOME_ARM_KEY='fi2-welcome-arm-v1';
/** A kind ignored this many times in a row backs off (the picker tries the next interest)... */
export const BACKOFF_IGNORES=3;
/** ...for this many days after the last ignore, then it may come back once more. */
export const BACKOFF_DAYS=14;
/** A tap counts as "acted" when the interest really starts within this long (fishing begins, the lesson opens…). */
export const ACT_WINDOW_MS=15*60_000;
/** Each tap on an interest's suggestions adds this to its score (taps reinforce), at most TAP_BOOST_MAX. */
export const TAP_BOOST=4,TAP_BOOST_MAX=20;
/** The holdout: this share of devices gets the plain welcome line only (a stable random draw, stored once). */
export const HOLDOUT_SHARE=0.1;
export type Arm='on'|'hold';
export const armFor=(rand:number):Arm=>Number.isFinite(rand)&&rand>=0&&rand<HOLDOUT_SHARE?'hold':'on';

/** k: kind → [shown, tapped, ignored in a row, day of the last ignore]. n: welcome notes shown on this device. last: the day of the last one. */
export type Learn={v:1;n:number;last:number;k:Partial<Record<WelcomeKind,[number,number,number,number]>>;
 cur:{kind:WelcomeKind}|null;pend:{kind:WelcomeKind;interest:Interest;at:number}|null};
export const emptyLearn=():Learn=>({v:1,n:0,last:0,k:{},cur:null,pend:null});
const whole=(v:unknown,max=1e9)=>typeof v==='number'&&Number.isFinite(v)?Math.max(0,Math.min(max,Math.floor(v))):0;
const isKind=(k:unknown):k is WelcomeKind=>typeof k==='string'&&(WELCOME_KINDS as readonly string[]).includes(k);
const isInterest=(i:unknown):i is Interest=>typeof i==='string'&&(INTERESTS as readonly string[]).includes(i);
export function sanitizeLearn(raw:unknown):Learn{
 if(!raw||typeof raw!=='object'||(raw as {v?:unknown}).v!==1)return emptyLearn();
 const o=raw as Record<string,unknown>,k:Learn['k']={};
 if(o.k&&typeof o.k==='object')for(const [id,v] of Object.entries(o.k as Record<string,unknown>))if(isKind(id)&&Array.isArray(v))k[id]=[whole(v[0]),whole(v[1]),whole(v[2],99),whole(v[3],1e6)];
 const cur=o.cur as {kind?:unknown}|null,pend=o.pend as {kind?:unknown;interest?:unknown;at?:unknown}|null;
 return {v:1,n:whole(o.n),last:whole(o.last,1e6),k,cur:cur&&isKind(cur.kind)?{kind:cur.kind}:null,
  pend:pend&&isKind(pend.kind)&&isInterest(pend.interest)?{kind:pend.kind,interest:pend.interest,at:whole(pend.at,1e15)}:null};
}
/** The interest a kind belongs to (a cross nudge belongs to where it sends the player). */
export function interestOfKind(kind:WelcomeKind):Interest{
 const p=kind.startsWith('cross_')?kind.split('_')[2]:kind.split('_')[0];
 return p==='fish'?'fishing':p==='lesson'?'lessons':p==='arcade'?'arcade':p==='kit'?'kit':'roam';
}
const row=(l:Learn,kind:WelcomeKind)=>[...(l.k[kind]??[0,0,0,0])] as [number,number,number,number];
/** A suggestion still on screen when the page closed counts as ignored; no suggestion → nothing. */
function settle(l:Learn,today:number):Learn{
 if(!l.cur)return l;const r=row(l,l.cur.kind);r[2]++;r[3]=today;return {...l,k:{...l.k,[l.cur.kind]:r},cur:null};
}
/** A Welcome back note opened (with this suggestion, or none). Counts the visit. */
export function noteShown(l0:Learn,kind:WelcomeKind|null,today:number):Learn{
 const l=settle(l0,today),out={...l,n:l.n+1,last:today};
 if(!kind)return out;const r=row(out,kind);r[0]++;return {...out,k:{...out.k,[kind]:r},cur:{kind}};
}
/** The note tapped: reinforce (the ignore streak resets) and wait for the player to get there. */
export function noteTapped(l:Learn,kind:WelcomeKind,now:number):Learn{
 const r=row(l,kind);r[1]++;r[2]=0;return {...l,k:{...l.k,[kind]:r},cur:null,pend:{kind,interest:interestOfKind(kind),at:now}};
}
/** The note left on its own (timeout) with a suggestion on it: one ignore. */
export const noteIgnored=(l:Learn,today:number)=>settle(l,today);
/** An interest started: the tapped kind it acts on, if it is within ACT_WINDOW_MS (then the wait clears). */
export function noteActed(l:Learn,interest:Interest,now:number):{learn:Learn;kind:WelcomeKind|null}{
 const p=l.pend;if(!p)return {learn:l,kind:null};
 if(now-p.at>ACT_WINDOW_MS||now<p.at)return {learn:{...l,pend:null},kind:null};
 return p.interest===interest?{learn:{...l,pend:null},kind:p.kind}:{learn:l,kind:null};
}
export function backedOff(l:Learn,kind:WelcomeKind,today:number):boolean{
 const r=l.k[kind];return !!r&&r[2]>=BACKOFF_IGNORES&&today-r[3]<BACKOFF_DAYS;
}
/** Score boost per interest from taps (taps reinforce). */
export function tapBoost(l:Learn):Partial<Record<Interest,number>>{
 const out:Partial<Record<Interest,number>>={};
 for(const [kind,r] of Object.entries(l.k) as [WelcomeKind,[number,number,number,number]][]){const i=interestOfKind(kind);out[i]=Math.min(TAP_BOOST_MAX,(out[i]??0)+TAP_BOOST*r[1]);}
 return out;
}
