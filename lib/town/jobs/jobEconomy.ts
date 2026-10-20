/**
 * Island jobs economy (docs/island-jobs.md). Pure rules plus a tiny localStorage ledger.
 * In-game coins only. No streaks, no timers that cost coins, no lost progress: a daily soft cap lowers pay gently
 * and resets at local midnight; a job can always be played again.
 */
import {signalExplore} from '../exploreSignals';
import {JOBS,JOB_PAY,STARTER_COINS as STARTER} from '../../economy';
export type JobId='leaf-rake'|'wall-rebounds'|'ball-kid'|'cone-setup'|'line-painter'|'court-cleanup'|'offside-flag'|'ball-pump'|'goal-anchor'|'farm-harvest'|'match-day-snacks'|'garden-shift'|'trail-cleanup'|'bug-scout';
/** Retired job ids and the job they merged into (saves, ledgers, counters). */
export const JOB_ID_ALIASES:Readonly<Record<string,JobId>>={'firefly-floodlights':'bug-scout'};
export const JOB_IDS:readonly JobId[]=['leaf-rake','wall-rebounds','ball-kid','cone-setup','line-painter','court-cleanup','offside-flag','ball-pump','goal-anchor','farm-harvest','match-day-snacks','garden-shift','trail-cleanup','bug-scout'];
/** One-time welcome coins: exactly one 40-coin card pack, or a few arcade plays or a small vending item (user, Sep 27 2026;
 *  raised 30 → 40 with pack prices in the economy pass, docs/economy/ECONOMY_PROPOSAL.md, 28 Sep 2026). */
export const STARTER_COINS=STARTER;// lib/economy.ts
/** Full pay for a job's first completions each day, then half pay, then a 1-coin thank-you tip. */
export const FULL_PAY_PER_DAY=JOBS.fullPerDay,HALF_PAY_PER_DAY=JOBS.halfPerDay,TIP_COINS=JOBS.tip;// lib/economy.ts
/** Extra coins the very first time a player finishes each job (mirrors the arcade's first puzzle solve bonus). */
export const FIRST_JOB_BONUS=JOBS.firstBonus;// lib/economy.ts
/** Base pay for a full-pay shift. The short jobs pay 7–10. Wall rebounds pays 26 (30 Sep 2026, user-approved). It became a
 *  ~3.5-minute drill (50 wall passes + 15 target shots, docs/island-jobs.md §11). At 8 coins it paid ~2 coins a minute, the lowest
 *  of all jobs. 26 puts it at the middle (median) of the other jobs' coins per minute (JOB_MINUTES below, tests/island-jobs.cjs).
 *  The tiers stay the same (half pay 13, then a 1-coin tip), and the Training meter still caps the day.
 *  Garden shift (30 Sep 2026, docs/island-jobs.md §13): 10 for a ~1-minute shift (8 picks + the crate) = 6.25 coins a minute, the
 *  middle (median) of the jobs per minute, like Wall rebounds.
 *  Pump the balls (1 Oct 2026, user: "make it harder"): ~85 small Pump strokes over five balls (8 → 24 each) instead of ~15, so
 *  its play time goes .45 → .85 min. Pay 7 → 10 keeps it in line per minute (6.67 → 6.90 coins a minute, inside the 7–10 band).
 *  Trail clean-up (Summit Isle, Oct 12 2026): 8 litter items along the trail and beach, like Court clean-up's pace, for 8
 *  coins at ~6.15 coins a minute (inside the 7–10 band; see JOB_MINUTES).
 *
 * Oct 14 2026 (docs/economy.md, user: "make it harder to buy things"): every job's pay cut about a third, band 7–10 → 4–7, wall
 * rebounds 26 → 16, so each job pays less per minute than a lesson quiz. The numbers live in lib/economy.ts JOB_PAY; the history
 * above explains their RELATIVE sizes (per-minute parity), which the cut keeps. Was: leaf 8, wall 26, ball-kid 10, cones 7,
 * lines 8, court 7, offside 9, pump 10, anchor 8, harvest 8, snacks 8, garden 10, trail 8. */
export const JOB_BASE_PAY:Record<JobId,number>=JOB_PAY;
/**
 * Estimated minutes of real play per shift (30 Sep 2026). Each estimate is the route length from the sign through the targets
 * and to the drop-off at walking pace (3.7 m/s), plus the actions (holds, taps, replays, shots). Wall rebounds: ~1 min of wall
 * passes + ~2.5 min of shots. Garden shift: ~95 m of paths between 8 spread-out picks and the crate (~26 s) plus 8 pick poses,
 * a not-ripe check and the crate (~25 s) + looking around for ripe ones (~10 s) ≈ 1 min. Pump the balls (1 Oct 2026): the walk to
 * the station (~3 s), ~78 strokes to reach five narrowing green zones plus a few top-ups after the slow leak or an over-pump (~85
 * taps at ~3 a second ≈ 28 s), five gauge checks and Ball ready presses (~20 s) ≈ 0.85 min. Bug squad / Firefly floodlights (Summit Isle, Oct 20 2026): ~150 m round the meadow from
 * the sign (~40 s), eight net / jar holds (~0.8 s each) plus circling a fluttering bug, and the release ≈ 0.9 min. Used only for pay balance (per-minute parity) and the economy sim, never at runtime.
 */
export const JOB_MINUTES:Record<JobId,number>={'leaf-rake':1.2,'wall-rebounds':3.5,'ball-kid':1.8,'cone-setup':.45,'line-painter':.5,'court-cleanup':.85,'offside-flag':.8,'ball-pump':.85,'goal-anchor':.5,'farm-harvest':1.75,'match-day-snacks':.7,'garden-shift':1,'trail-cleanup':.7,'bug-scout':.9};
/** Per shift, on top of the play: walk to the sign, the intro card and the payday card. With it, the short jobs average 1.5 min a
 *  shift, the economy sim's long-standing job assumption. */
export const JOB_SHIFT_OVERHEAD_MINUTES=.6;
export const jobShiftMinutes=(id:JobId)=>JOB_MINUTES[id]+JOB_SHIFT_OVERHEAD_MINUTES;
/** Full-pay coins per minute of a shift. */
export const jobCoinsPerMinute=(id:JobId)=>JOB_BASE_PAY[id]/jobShiftMinutes(id);
export const JOBS_STORAGE_KEY='fi2-island-jobs-v1';
export type PayTier='full'|'half'|'tip';
export type JobLedger={version:1;day:string;today:Partial<Record<JobId,number>>;lifetime:Partial<Record<JobId,number>>;earned:number;best:Partial<Record<JobId,number>>;starter:boolean};
export const emptyJobLedger=(day=''):JobLedger=>({version:1,day,today:{},lifetime:{},earned:0,best:{},starter:false});
export function localDay(now=Date.now()){const d=new Date(now);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
const count=(v:unknown,max=1e6)=>typeof v==='number'&&Number.isFinite(v)?Math.max(0,Math.min(max,Math.floor(v))):0;
export function sanitizeJobLedger(value:unknown,day:string):JobLedger{
 const v=value&&typeof value==='object'?value as Partial<JobLedger>:{},out=emptyJobLedger(day);
 const sameDay=typeof v.day==='string'&&v.day===day;
 // Merged job ids (Oct 20 2026): an old id's counts fold into its current id (firefly-floodlights → bug-scout), so no progress is
 // lost: today / lifetime add up, the best time keeps the faster one.
 const fold=<X extends Record<string,number|undefined>|undefined>(m:X,best=false):X=>{if(!m||typeof m!=='object')return m;let out:Record<string,number|undefined>|null=null;
  for(const [old,id] of Object.entries(JOB_ID_ALIASES)){const o=m[old];if(typeof o!=='number'||!Number.isFinite(o)||o<=0)continue;out??={...m};const c=out[id];
   out[id]=typeof c==='number'&&Number.isFinite(c)&&c>0?(best?Math.min(c,o):c+o):o;delete out[old];}
  return (out??m) as X;};
 const today=fold(v.today as Record<string,number>|undefined),lifetime=fold(v.lifetime as Record<string,number>|undefined),bestIn=fold(v.best as Record<string,number>|undefined,true);
 for(const id of JOB_IDS){const t=count(today?.[id],999),l=count(lifetime?.[id]),bv=bestIn?.[id],b=typeof bv==='number'&&Number.isFinite(bv)&&bv>0?Math.min(3600,bv):0;
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
 const next=payTier(ledger.today[id]??0),done:Record<JobId,string>={'leaf-rake':'The pitch is spotless!','wall-rebounds':'The wall needs a rest!','ball-kid':'Every ball is back in play!','cone-setup':'The coach has every drill ready!','line-painter':'The lines are bright and fresh!','court-cleanup':'The court is sparkling!','offside-flag':'The linesman needs a rest!','ball-pump':'Every ball is match-ready!','goal-anchor':'Both goals are safe and steady!','farm-harvest':'The harvest is in and the stand is full!','match-day-snacks':'Every snack is in the right crate!','garden-shift':'The garden crate is full for the market!','trail-cleanup':'The trail is clear for the next hiker!','bug-scout':'The whole Bug squad is back in the meadow!'};
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
/** `fresh`: re-read storage instead of this tab's cache (payday and the intro card: another tab may have finished a shift; bug A7). */
export function readJobLedger(now=Date.now(),fresh=false):JobLedger{const day=localDay(now);if(fresh||!cached||cached.day!==day)cached=readRaw(day);return cached;}
export function writeJobLedger(update:(ledger:JobLedger)=>JobLedger,now=Date.now()){const day=localDay(now),fresh=readRaw(day);const next=update(fresh);cached=next;try{localStorage.setItem(JOBS_STORAGE_KEY,JSON.stringify(next));}catch{}listeners.forEach(fn=>fn());if(Object.values(next.lifetime).some(n=>(n??0)>0))signalExplore('job');return next;}
export function subscribeJobLedger(fn:()=>void){listeners.add(fn);const storage=(e:StorageEvent)=>{if(e.key===JOBS_STORAGE_KEY||e.key===null){cached=null;fn();}};if(typeof window!=='undefined')window.addEventListener('storage',storage);return()=>{listeners.delete(fn);if(typeof window!=='undefined')window.removeEventListener('storage',storage);};}
