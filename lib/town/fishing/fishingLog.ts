/**
 * The fishing log (Oct 15 2026, docs/fishing.md "Content systems"): everything the new fishing content remembers, in ONE small
 * synced key, `fi2-fishing-log-v1` (lib/saves/snapshot.ts SYNC_KEYS: it is progress, so it follows the save code):
 *  - B5 records: the 3 biggest catches per spot (records.ts);
 *  - C1 legends: the spots whose clue is found, and the legends caught once and released;
 *  - per-spot kinds caught (the legend clue's "3 different kinds" rule);
 *  - B4 requests: today's progress, the total ever finished;
 *  - C3 lures earned and the one on the line; C5 Fishbook milestones claimed, float skins and the Golden Rod;
 *  - C2 derby: best score, total points (trophies), derbies played.
 * Pure (no storage, no React): fishingLogStore.ts is the browser binding. Sizes stay small (a few KB at most: every list is capped).
 */
import {FISH,FISH_SPOTS,fishById} from './fishCatalog';
import {addRecord,mergeRecords,sanitizeRecords,type RecordBoard} from './records';
import {LEGEND_CLUE_KINDS,isLegendId,legendForSpot} from './legendary';
import {isLureId,type LureId} from './lures';
import {requestProgress,requestsForDay,type FishRequest} from './requests';

export const FISHING_LOG_KEY='fi2-fishing-log-v1';
export type FloatSkin='classic'|'football'|'seagull'|'golden';
export const FLOAT_SKINS:Record<FloatSkin,{name:string;color:string}>={classic:{name:'Classic red float',color:'#d6453a'},football:{name:'Football float',color:'#f4f4f0'},seagull:{name:'Seagull float',color:'#9fb7c9'},golden:{name:'Golden float',color:'#e3b53c'}};
export type FishingLog={version:1;
 records:RecordBoard;
 /** Distinct kinds caught per spot (capped). */
 kinds:Record<string,string[]>;
 /** Spots whose legend clue was found. */
 clues:string[];
 /** Legends caught (and released): id → when. */
 legends:Record<string,number>;
 /** Today's requests: the day, progress per request id, done ids, and today's distinct kinds (the variety request). */
 req:{day:string;progress:Record<string,number>;done:string[];kinds:string[]};
 reqTotal:number;
 lures:LureId[];lure:LureId|null;
 /** Fishbook milestones claimed (25 / 50 / 75 / 100). */
 milestones:number[];
 floats:FloatSkin[];float:FloatSkin;goldenRod:boolean;rod:'standard'|'golden';
 derby:{best:number;points:number;played:number}};
export const emptyLog=():FishingLog=>({version:1,records:{},kinds:{},clues:[],legends:{},req:{day:'',progress:{},done:[],kinds:[]},reqTotal:0,lures:[],lure:null,milestones:[],floats:['classic'],float:'classic',goldenRod:false,rod:'standard',derby:{best:0,points:0,played:0}});
const SPOT_IDS=FISH_SPOTS.map(s=>s.id);
const whole=(v:unknown,max=1e9)=>typeof v==='number'&&Number.isFinite(v)?Math.max(0,Math.min(max,Math.floor(v))):0;
const strList=(v:unknown,ok:(s:string)=>boolean,cap:number)=>Array.isArray(v)?[...new Set(v.filter((x):x is string=>typeof x==='string'&&ok(x)))].slice(0,cap):[];
const isSpot=(s:string)=>SPOT_IDS.includes(s as never);
const isFish=(s:string)=>FISH.some(f=>f.id===s);
const SKINS=Object.keys(FLOAT_SKINS) as FloatSkin[];
export const MILESTONES=[25,50,75,100] as const;
export function sanitizeLog(value:unknown):FishingLog{
 const v=value&&typeof value==='object'?value as Partial<FishingLog>:{},out=emptyLog();
 out.records=sanitizeRecords(v.records,SPOT_IDS);
 if(v.kinds&&typeof v.kinds==='object')for(const id of SPOT_IDS){const k=strList((v.kinds as Record<string,unknown>)[id],isFish,40);if(k.length)out.kinds[id]=k;}
 out.clues=strList(v.clues,isSpot,SPOT_IDS.length);
 if(v.legends&&typeof v.legends==='object')for(const [id,t] of Object.entries(v.legends))if(isLegendId(id))out.legends[id]=whole(t,9e15)||1;
 const r=v.req&&typeof v.req==='object'?v.req:null;
 if(r&&typeof r.day==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(r.day)){out.req.day=r.day;const ids=new Set(requestsForDay(r.day).map(q=>q.id));
  if(r.progress&&typeof r.progress==='object')for(const [id,n] of Object.entries(r.progress))if(ids.has(id))out.req.progress[id]=whole(n,99);
  out.req.done=strList(r.done,s=>ids.has(s),5);out.req.kinds=strList(r.kinds,isFish,40);}
 out.reqTotal=whole(v.reqTotal,1e6);
 out.lures=strList(v.lures,isLureId,8) as LureId[];out.lure=isLureId(v.lure)&&out.lures.includes(v.lure)?v.lure:null;
 out.milestones=(Array.isArray(v.milestones)?v.milestones:[]).filter((m):m is number=>MILESTONES.includes(m as never)).filter((m,i,a)=>a.indexOf(m)===i);
 out.floats=[...new Set<FloatSkin>(['classic',...strList(v.floats,s=>SKINS.includes(s as FloatSkin),8) as FloatSkin[]])];
 out.float=SKINS.includes(v.float as FloatSkin)&&out.floats.includes(v.float as FloatSkin)?v.float as FloatSkin:'classic';
 out.goldenRod=v.goldenRod===true;out.rod=out.goldenRod&&v.rod==='golden'?'golden':'standard';
 const d=v.derby&&typeof v.derby==='object'?v.derby:null;if(d)out.derby={best:whole(d.best,999),points:whole(d.points,1e6),played:whole(d.played,1e6)};
 return out;
}
/** Two tabs / a downloaded save: keep the larger of everything (nothing earned is ever lost). */
export function mergeLogs(a:FishingLog,b:FishingLog):FishingLog{
 const u=<T,>(x:readonly T[],y:readonly T[])=>[...new Set([...x,...y])];
 const kinds:Record<string,string[]>={};for(const id of new Set([...Object.keys(a.kinds),...Object.keys(b.kinds)]))kinds[id]=u(a.kinds[id]??[],b.kinds[id]??[]).slice(0,40);
 const legends={...b.legends};for(const [id,t] of Object.entries(a.legends))legends[id]=Math.min(t,legends[id]??t);
 const req=a.req.day===b.req.day?{day:a.req.day,progress:Object.fromEntries(u(Object.keys(a.req.progress),Object.keys(b.req.progress)).map(id=>[id,Math.max(a.req.progress[id]??0,b.req.progress[id]??0)])),done:u(a.req.done,b.req.done),kinds:u(a.req.kinds,b.req.kinds).slice(0,40)}:(a.req.day>b.req.day?a.req:b.req);
 return {version:1,records:mergeRecords(a.records,b.records),kinds,clues:u(a.clues,b.clues),legends,req,reqTotal:Math.max(a.reqTotal,b.reqTotal),
  lures:u(a.lures,b.lures),lure:a.lure??b.lure,milestones:u(a.milestones,b.milestones),floats:u(a.floats,b.floats),float:a.float,goldenRod:a.goldenRod||b.goldenRod,rod:a.rod,
  derby:{best:Math.max(a.derby.best,b.derby.best),points:Math.max(a.derby.points,b.derby.points),played:Math.max(a.derby.played,b.derby.played)}};
}

// ---- Unlocks (earned, never bought) ----
/** Requests finished (in total) → what they unlock. */
export const REQUEST_UNLOCKS:readonly {at:number;lure?:LureId;float?:FloatSkin;label:string}[]=[
 {at:1,lure:'panenka',label:'Panenka lure'},{at:3,float:'football',label:'Football float'},{at:6,float:'seagull',label:'Seagull float'},
];
/** Fishbook milestones (percent of species caught, internal) → rewards. Kids see words, never a percentage (MILESTONE_WORD). The
 *  whole Fishbook is the Golden Rod (cosmetic only: no odds or value perk) and the golden float. */
export const MILESTONE_WORD:Record<number,string>={25:'A quarter',50:'Half',75:'Three quarters',100:'All'};
export const MILESTONE_REWARDS:Record<number,{lure?:LureId;float?:FloatSkin;rod?:boolean;label:string}>={
 25:{lure:'nutmeg',label:'Nutmeg lure'},50:{lure:'rabona',label:'Rabona lure'},75:{lure:'knuckleball',label:'Knuckleball lure'},100:{rod:true,float:'golden',label:'Golden Rod'},
};
/** The Fishbook percentage (species caught of FISH; legends never count). */
export const fishbookPercent=(caught:number)=>Math.floor(100*Math.max(0,caught)/FISH.length);

export type CatchInput={id:string;size:number;spot:string;now:number;day:string;
 /** Species caught in the Fishbook, after this catch (the milestone check). */
 speciesCaught:number};
export type CatchEffects={rank:number;legend:boolean;newClues:string[];requestsDone:FishRequest[];unlocked:string[]};
/** Roll today's request state over to `day` (a new local day starts fresh). */
export function ensureDay(log:FishingLog,day:string):FishingLog{return log.req.day===day?log:{...log,req:{day,progress:{},done:[],kinds:[]}};}
function grant(log:FishingLog,u:{lure?:LureId;float?:FloatSkin;rod?:boolean},out:string[],label:string){
 let changed=false;
 if(u.lure&&!log.lures.includes(u.lure)){log.lures=[...log.lures,u.lure];changed=true;}
 if(u.float&&!log.floats.includes(u.float)){log.floats=[...log.floats,u.float];changed=true;}
 if(u.rod&&!log.goldenRod){log.goldenRod=true;log.rod='golden';changed=true;}
 if(changed)out.push(label);
}
/** Apply Fishbook milestones (idempotent). */
export function claimMilestones(log:FishingLog,speciesCaught:number):{log:FishingLog;unlocked:string[]}{
 const pct=fishbookPercent(speciesCaught),out:string[]=[];let next=log;
 for(const m of MILESTONES)if(pct>=m&&!next.milestones.includes(m)){next={...next,milestones:[...next.milestones,m]};grant(next,MILESTONE_REWARDS[m],out,MILESTONE_REWARDS[m].label);}
 return {log:next,unlocked:out};
}
/** One landed catch: records, kinds per spot, legend clue / release, requests, milestones. Pure: returns the new log and what happened. */
export function logCatch(log0:FishingLog,c:CatchInput):{log:FishingLog;effects:CatchEffects}{
 let log=ensureDay({...log0},c.day);const effects:CatchEffects={rank:0,legend:false,newClues:[],requestsDone:[],unlocked:[]};
 if(isLegendId(c.id)){
  // Caught once, then released: it never returns, it is never sold, and it does not count as a Fishbook species.
  if(!log.legends[c.id])log={...log,legends:{...log.legends,[c.id]:c.now||1}};effects.legend=true;
 }else if(fishById(c.id)){
  const r=addRecord(log.records,c.spot,{f:c.id,s:c.size,t:c.now});log={...log,records:r.board};effects.rank=r.rank;
  const k=log.kinds[c.spot]??[];if(!k.includes(c.id)&&isSpot(c.spot)){log={...log,kinds:{...log.kinds,[c.spot]:[...k,c.id].slice(0,40)}};
   if(k.length+1>=LEGEND_CLUE_KINDS&&legendForSpot(c.spot)&&!log.clues.includes(c.spot)){log={...log,clues:[...log.clues,c.spot]};effects.newClues.push(c.spot);}}
  // Requests (today's three).
  const reqs=requestsForDay(c.day),progress={...log.req.progress},done=[...log.req.done];
  for(const q of reqs){if(done.includes(q.id))continue;const p=q.kind==='kinds'?requestProgress(q,c,log.req.kinds):(progress[q.id]??0)+requestProgress(q,c,log.req.kinds);
   progress[q.id]=Math.min(q.count,Math.max(progress[q.id]??0,p));
   if(progress[q.id]>=q.count){done.push(q.id);effects.requestsDone.push(q);
    if(!log.clues.includes(q.clueSpot)&&legendForSpot(q.clueSpot)){log={...log,clues:[...log.clues,q.clueSpot]};effects.newClues.push(q.clueSpot);}}}
  const kindsToday=log.req.kinds.includes(c.id)?log.req.kinds:[...log.req.kinds,c.id].slice(0,40);
  log={...log,req:{day:c.day,progress,done,kinds:kindsToday},reqTotal:log.reqTotal+effects.requestsDone.length};
  for(const u of REQUEST_UNLOCKS)if(log.reqTotal>=u.at)grant(log,u,effects.unlocked,u.label);
 }
 const m=claimMilestones(log,c.speciesCaught);log=m.log;effects.unlocked.push(...m.unlocked);
 return {log,effects};
}
/** Spots whose legend is swimming now: the clue is found and it was not caught yet. */
export const legendsDue=(log:FishingLog)=>log.clues.filter(s=>{const L=legendForSpot(s);return !!L&&!log.legends[L.id];});
