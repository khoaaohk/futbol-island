/**
 * Bridge from island jobs to the shared coin wallet owned by the arcade (lib/arcade/arcadeWalletCore.ts, not edited here).
 * The wallet only accepts credits as capped "runs" of a known source. Until it exposes an island source, job coins are
 * credited as runs of the highest-cap existing source ('live', 20 per run) with an "Island job" reason, so they are real,
 * spendable coins today. When ARCADE_COIN_CAPS gains an `island` key, credits switch to it automatically.
 * Every run id is deterministic, and the wallet keeps max(paid) per id, so retries and double calls never pay twice.
 */
import {jobShare,type ShareLine} from './harvestShare';
import {JOB_BASE_PAY,STARTER_COINS,jobPayout,localDay,payMessage,readJobLedger,recordCompletion,splitCredit,writeJobLedger,type JobId,type JobLedger,type PayTier} from './jobEconomy';
type Credit=(id:string,game:string,target:number,reason:string)=>Promise<number>;
export type JobWalletPorts={creditRun:Credit;balance:()=>number;caps:Record<string,number>;now?:()=>number;read?:(now:number)=>JobLedger;write?:(update:(l:JobLedger)=>JobLedger,now:number)=>JobLedger;
 /** Puts a job's goods share into the market basket once per `key` (idempotent); returns what was actually added. */
 grantGoods?:(key:string,items:ShareLine[])=>ShareLine[]};
/** `goods`: produce added to the basket (Harvest day's farmer's share, lib/town/jobs/harvestShare.ts); `offered`: the share before
 *  a full basket cut it down. */
export type JobPayResult={coins:number;credited:number;tier:PayTier;bonus:number;message:string;balance:number;goods:ShareLine[];offered:ShareLine[]};
export function createJobWallet(ports:JobWalletPorts){
 const now=ports.now??(()=>Date.now()),read=ports.read??readJobLedger,write=ports.write??writeJobLedger;
 const source=()=>typeof ports.caps.island==='number'?'island':'live';
 const cap=()=>ports.caps[source()]??20;
 async function credit(base:string,amount:number,reason:string){let total=0;const parts=splitCredit(amount,cap());for(let i=0;i<parts.length;i++)total+=await ports.creditRun(parts.length>1?`${base}:${i}`:base,source(),parts[i],reason);return total;}
 /** Pays one finished shift. `shift` is the job's completion number today (from the ledger), so a repeat call is a no-op in the wallet. */
 async function payJob(id:JobId,title:string,seconds:number,bag:readonly string[]=[]):Promise<JobPayResult>{
  const t=now(),before=read(t),{coins,tier,bonus}=jobPayout(id,before),shift=(before.today[id]??0)+1,runId=`island-job:${id}:${localDay(t)}:${shift}`;
  const after=write(l=>recordCompletion(l,id,coins,seconds),t);
  // The first-time bonus is its own run (economy fix, Sep 29 2026): outside the daily Training-meter cap, paid once per job
  // (fixed run id; the ledger's lifetime count also stops it for jobs finished before this change).
  // Goods first (sync, keyed by the shift's run id): a replayed or reloaded payday never adds the share twice.
  const offered=jobShare(id,tier,before.lifetime[id]??0,bag),goods=offered.length&&ports.grantGoods?ports.grantGoods(runId,offered):[];
  const credited=await credit(runId,coins-bonus,`Island job · ${title}`)
   +(bonus?await credit(`island-job-first:${id}`,bonus,`First shift bonus · ${title}`):0);
  return {coins,credited,tier,bonus,message:payMessage(id,after),balance:ports.balance(),goods,offered};
 }
 /** One-time welcome coins for a player whose wallet is empty. Idempotent via the ledger flag and a fixed wallet run id. */
 async function grantStarter():Promise<number>{
  const t=now(),ledger=read(t);if(ledger.starter)return 0;
  const empty=ports.balance()===0;write(l=>({...l,starter:true}),t);
  if(!empty)return 0;
  return credit('island-starter-coins',STARTER_COINS,'Welcome coins · Island jobs board');
 }
 return {payJob,grantStarter,credit,preview:(id:JobId)=>jobPayout(id,read(now())),source,basePay:(id:JobId)=>JOB_BASE_PAY[id]};
}
