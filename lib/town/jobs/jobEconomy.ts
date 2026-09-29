/**
 * Island jobs economy (docs/island-jobs.md). Pure rules plus a tiny localStorage ledger.
 * In-game coins only. No streaks, no timers that cost coins, no lost progress: a daily soft cap lowers pay gently
 * and resets at local midnight; a job can always be played again.
 */
export type JobId='leaf-rake'|'wall-rebounds'|'ball-kid'|'cone-setup'|'line-painter'|'court-cleanup'|'offside-flag'|'ball-pump'|'goal-anchor';
export const JOB_IDS:readonly JobId[]=['leaf-rake','wall-rebounds','ball-kid','cone-setup','line-painter','court-cleanup','offside-flag','ball-pump','goal-anchor'];
/** One-time welcome coins: exactly one 40-coin card pack, or a few arcade plays or a small vending item (user, Sep 27 2026;
 *  raised 30 → 40 with pack prices in the economy pass, docs/economy/ECONOMY_PROPOSAL.md, 28 Sep 2026). */
export const STARTER_COINS=40;
/** Full pay for a job's first completions each day, then half pay, then a 1-coin thank-you tip. */
export const FULL_PAY_PER_DAY=2,HALF_PAY_PER_DAY=2,TIP_COINS=1;
/** Extra coins the very first time a player finishes each job (mirrors the arcade's first puzzle solve bonus). */
export const FIRST_JOB_BONUS=4;
export const JOB_BASE_PAY:Record<JobId,number>={'leaf-rake':8,'wall-rebounds':8,'ball-kid':10,'cone-setup':7,'line-painter':8,'court-cleanup':7,'offside-flag':9,'ball-pump':7,'goal-anchor':8};
export const JOBS_STORAGE_KEY='fi2-island-jobs-v1';
export type PayTier='full'|'half'|'tip';
export type JobLedger={version:1;day:string;today:Partial<Record<JobId,number>>;lifetime:Partial<Record<JobId,number>>;earned:number;best:Partial<Record<JobId,number>>;starter:boolean};
export const emptyJobLedger=(day=''):JobLedger=>({version:1,day,today:{},lifetime:{},earned:0,best:{},starter:false});
export function localDay(now=Date.now()){const d=new Date(now);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
const count=(v:unknown,max=1e6)=>typeof v==='number'&&Number.isFinite(v)?Math.max(0,Math.min(max,Math.floor(v))):0;
export function sanitizeJobLedger(value:unknown,day:string):JobLedger{
 const v=value&&typeof value==='object'?value as Partial<JobLedger>:{},out=emptyJobLedger(day);
 const sameDay=typeof v.day==='string'&&v.day===day;
 for(const id of JOB_IDS){const t=count(v.today?.[id],999),l=count(v.lifetime?.[id]),b=typeof v.best?.[id]==='number'&&Number.isFinite(v.best[id])&&v.best[id]!>0?Math.min(3600,v.best[id]!):0;
  if(sameDay&&t)out.today[id]=t;if(l)out.lifetime[id]=Math.max(l,sameDay?t:0);if(b)out.best[id]=Math.round(b*10)/10;}
 out.earned=count(v.earned,1e9);out.starter=v.starter===true;return out;
}
/** Tier for the `completedToday`+1-th completion of a job today. */
export function payTier(completedToday:number):PayTier{return completedToday<FULL_PAY_PER_DAY?'full':completedToday<FULL_PAY_PER_DAY+HALF_PAY_PER_DAY?'half':'tip';}
export function jobPayout(id:JobId,ledger:JobLedger):{coins:number;tier:PayTier;bonus:number}{
 const done=ledger.today[id]??0,tier=payTier(done),base=JOB_BASE_PAY[id];
 const pay=tier==='full'?base:tier==='half'?Math.ceil(base/2):TIP_COINS,bonus=(ledger.lifetime[id]??0)===0?FIRST_JOB_BONUS:0;
 return {coins:pay+bonus,tier,bonus};
}
/** The friendly line under the payout. Never guilt, never a countdown. */
export function payMessage(id:JobId,ledger:JobLedger):string{
 const next=payTier(ledger.today[id]??0),done:Record<JobId,string>={'leaf-rake':'The pitch is spotless!','wall-rebounds':'The wall needs a rest!','ball-kid':'Every ball is back in play!','cone-setup':'The coach has every drill ready!','line-painter':'The lines are bright and fresh!','court-cleanup':'The court is sparkling!','offside-flag':'The linesman needs a rest!','ball-pump':'Every ball is match-ready!','goal-anchor':'Both goals are safe and steady!'};
 if(next==='full')return 'Full pay for the next shift too.';
 if(next==='half')return `${done[id]} The next shifts today pay half — try a different job for full pay.`;
 return `${done[id]} Come back tomorrow for full pay. You can still help for a 1-coin thank-you tip.`;
}
export function recordCompletion(ledger:JobLedger,id:JobId,coins:number,seconds:number):JobLedger{
 const best=ledger.best[id],time=Number.isFinite(seconds)&&seconds>0?Math.round(seconds*10)/10:0;
 return {...ledger,today:{...ledger.today,[id]:(ledger.today[id]??0)+1},lifetime:{...ledger.lifetime,[id]:(ledger.lifetime[id]??0)+1},earned:ledger.earned+Math.max(0,Math.floor(coins)),best:time&&(!best||time<best)?{...ledger.best,[id]:time}:ledger.best};
}
/** Split a credit into chunks no larger than the wallet's per-run cap (deterministic ids keep every chunk idempotent). */
export function splitCredit(amount:number,cap:number){const out:number[]=[];let left=Math.max(0,Math.floor(amount));const c=Math.max(1,Math.floor(cap));while(left>0){const n=Math.min(c,left);out.push(n);left-=n;}return out;}

// --- Ledger store (browser). Every write re-reads storage first so two tabs merge instead of overwriting. ---
const listeners=new Set<()=>void>();let cached:JobLedger|null=null;
function readRaw(day:string){try{return sanitizeJobLedger(JSON.parse(localStorage.getItem(JOBS_STORAGE_KEY)??'null'),day);}catch{return emptyJobLedger(day);}}
export function readJobLedger(now=Date.now()):JobLedger{const day=localDay(now);if(!cached||cached.day!==day)cached=readRaw(day);return cached;}
export function writeJobLedger(update:(ledger:JobLedger)=>JobLedger,now=Date.now()){const day=localDay(now),fresh=readRaw(day);const next=update(fresh);cached=next;try{localStorage.setItem(JOBS_STORAGE_KEY,JSON.stringify(next));}catch{}listeners.forEach(fn=>fn());return next;}
export function subscribeJobLedger(fn:()=>void){listeners.add(fn);const storage=(e:StorageEvent)=>{if(e.key===JOBS_STORAGE_KEY||e.key===null){cached=null;fn();}};if(typeof window!=='undefined')window.addEventListener('storage',storage);return()=>{listeners.delete(fn);if(typeof window!=='undefined')window.removeEventListener('storage',storage);};}
