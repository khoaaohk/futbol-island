/**
 * The browser side of the on-device tally (lib/welcome/tally.ts; docs/welcome-suggestions.md). Event-driven only: told by the
 * tracker's on-device watcher (lib/analytics/tracker.ts watchLocalActivity) when the open activity changes, plus
 * visibilitychange and pagehide. No timer, no frame work, no request. One small localStorage write per change of interest.
 * The tally is a synced save key (follows a save code); what was learned from taps is a device key (lib/welcome/learn.ts).
 */
import {count,localActivity,watchLocalActivity} from '../analytics/tracker';
import {addAction,addMinutes,cabinetOf,dayNumber,emptyTally,interestOf,sanitizeTally,WELCOME_TALLY_KEY,type Interest,type Tally} from './tally';
import {armFor,emptyLearn,noteActed,sanitizeLearn,WELCOME_ARM_KEY,WELCOME_LEARN_KEY,type Arm,type Learn} from './learn';

type Store=Pick<Storage,'getItem'|'setItem'>;
const store=():Store|null=>{try{return window.localStorage;}catch{return null;}};
export function readTally(s:Store|null=store()):Tally{try{return sanitizeTally(JSON.parse(s?.getItem(WELCOME_TALLY_KEY)??'null'));}catch{return emptyTally();}}
export function writeTally(t:Tally,s:Store|null=store()){try{s?.setItem(WELCOME_TALLY_KEY,JSON.stringify(t));}catch{}}
export function readLearn(s:Store|null=store()):Learn{try{return sanitizeLearn(JSON.parse(s?.getItem(WELCOME_LEARN_KEY)??'null'));}catch{return emptyLearn();}}
export function writeLearn(l:Learn,s:Store|null=store()){try{s?.setItem(WELCOME_LEARN_KEY,JSON.stringify(l));}catch{}}
/** This device's holdout arm: drawn once (10% 'hold'), then stored. Without storage: 'on'. */
export function readArm(s:Store|null=store(),rand=Math.random):Arm{
 try{const v=s?.getItem(WELCOME_ARM_KEY);if(v==='on'||v==='hold')return v;const a=armFor(rand());s?.setItem(WELCOME_ARM_KEY,a);return a;}catch{return 'on';}
}
/** Off the island the page says what it is (the beat's own fallback: /arcade → the lobby, /shop → the Kit Shop). */
const pageActivity=(path:string)=>path.startsWith('/arcade')?'arcade_lobby':path.startsWith('/shop')?'kit_shop':null;

let started=false;
/** Starts the tally for this page (once; returns a cleanup). */
export function startWelcomeTally():()=>void{
 if(started||typeof window==='undefined')return()=>{};started=true;
 let cur:Interest|null=null,cab:string|null=null,since=Date.now(),visible=document.visibilityState==='visible';
 const book=()=>{const now=Date.now();if(cur&&visible){const min=(now-since)/60000;if(min>=0.05)writeTally(addMinutes(readTally(),cur,min,dayNumber(now)));}since=now;};
 const change=()=>{
  const act=localActivity()??pageActivity(location.pathname),i=interestOf(act),c=cabinetOf(act);
  if(i===cur&&c===cab)return;
  book();
  if(i&&(i!==cur||(c&&c!==cab))&&i!=='roam'){const now=Date.now();writeTally(addAction(readTally(),i,dayNumber(now),c));
   const l=readLearn();if(l.pend){const r=noteActed(l,i,now);if(r.kind)count(`ws:a_${r.kind}`);if(r.learn!==l)writeLearn(r.learn);}}
  cur=i;cab=c;
 };
 const vis=()=>{if(document.visibilityState==='visible'){visible=true;since=Date.now();}else{book();visible=false;}};
 const hide=()=>book();
 const unwatch=watchLocalActivity(change);
 document.addEventListener('visibilitychange',vis);window.addEventListener('pagehide',hide);
 change();
 return()=>{book();unwatch();document.removeEventListener('visibilitychange',vis);window.removeEventListener('pagehide',hide);started=false;};
}
