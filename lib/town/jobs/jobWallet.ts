/**
 * Bridge from island jobs to the shared coin wallet owned by the arcade (lib/arcade/arcadeWalletCore.ts, not edited here).
 * The wallet only accepts credits as capped "runs" of a known source. Until it exposes an island source, job coins are
 * credited as runs of the highest-cap existing source ('live', 20 per run) with an "Island job" reason, so they are real,
 * spendable coins today. When ARCADE_COIN_CAPS gains an `island` key, credits switch to it automatically.
 * Every run id is deterministic, and the wallet keeps max(paid) per id, so retries and double calls never pay twice.
 */
import {JOB_BASE_PAY,STARTER_COINS,jobPayout,localDay,payMessage,readJobLedger,recordCompletion,splitCredit,writeJobLedger,type JobId,type JobLedger,type PayTier} from './jobEconomy';
type Credit=(id:string,game:string,target:number,reason:string)=>Promise<number>;
export type JobWalletPorts={creditRun:Credit;balance:()=>number;caps:Record<string,number>;now?:()=>number;read?:(now:number)=>JobLedger;write?:(update:(l:JobLedger)=>JobLedger,now:number)=>JobLedger};
export type JobPayResult={coins:number;credited:number;tier:PayTier;bonus:number;message:string;balance:number};
export function createJobWallet(ports:JobWalletPorts){
 const now=ports.now??(()=>Date.now()),read=ports.read??readJobLedger,write=ports.write??writeJobLedger;
 const source=()=>typeof ports.caps.island==='number'?'island':'live';
 const cap=()=>ports.caps[source()]??20;
 async function credit(base:string,amount:number,reason:string){let total=0;const parts=splitCredit(amount,cap());for(let i=0;i<parts.length;i++)total+=await ports.creditRun(parts.length>1?`${base}:${i}`:base,source(),parts[i],reason);return total;}
 /** Pays one finished shift. `shift` is the job's completion number today (from the ledger), so a repeat call is a no-op in the wallet. */
 async function payJob(id:JobId,title:string,seconds:number):Promise<JobPayResult>{
  const t=now(),before=read(t),{coins,tier,bonus}=jobPayout(id,before),shift=(before.today[id]??0)+1;
  const after=write(l=>recordCompletion(l,id,coins,seconds),t);
  const credited=await credit(`island-job:${id}:${localDay(t)}:${shift}`,coins,`Island job · ${title}`);
  return {coins,credited,tier,bonus,message:payMessage(id,after),balance:ports.balance()};
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
