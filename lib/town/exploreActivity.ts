'use client';
import {useSyncExternalStore} from 'react';
import {isLearningPreview} from './learningProgress';
import {EXPLORE_SIGNAL,type ExploreSignal} from './exploreSignals';
export const EXPLORE_ACTIVITY_KEY='fi2-explore-activity-v1';
export type ExploreActivity={characters:string[];store:boolean;arcade:boolean;ramp:boolean;truck:boolean;target:boolean;parachute:boolean;roofDrop:boolean;knockovers:number;knockoutWins:number;
 /** G-13 (Sep 30 2026): the island's other places and activities. Fired through lib/town/exploreSignals.ts. */
 fish:boolean;job:boolean;sold:boolean;cay:boolean;jetty:boolean;konbini:boolean;
 /** Oct 3 2026: the walk-in History Museum, ticked on first entry to /museum (components/MuseumRoom.tsx). */
 museum:boolean};
const FLAGS=['store','arcade','ramp','truck','target','parachute','roofDrop','fish','job','sold','cay','jetty','konbini','museum'] as const;
const empty:ExploreActivity={characters:[],store:false,arcade:false,ramp:false,truck:false,target:false,parachute:false,roofDrop:false,knockovers:0,knockoutWins:0,fish:false,job:false,sold:false,cay:false,jetty:false,konbini:false,museum:false};
const count=(v:unknown,max:number)=>typeof v==='number'&&Number.isFinite(v)?Math.min(max,Math.max(0,Math.floor(v))):0;
export function sanitizeExploreActivity(value:unknown):ExploreActivity{const v=value&&typeof value==='object'?value as Partial<ExploreActivity>:{};const out={...empty,characters:Array.isArray(v.characters)?[...new Set(v.characters.filter((id):id is string=>typeof id==='string'&&id.length>0&&id.length<100))].slice(0,10):[],knockovers:count(v.knockovers,20),knockoutWins:count(v.knockoutWins,5)};for(const k of FLAGS)out[k]=v[k]===true;return out;}
const listeners=new Set<()=>void>();let state=empty,loaded=false;const server=JSON.stringify(empty);let snapshot=server;
/**
 * Existing saves already show some new items done (G-13): a caught fish (Fishbook), a finished job (jobs ledger), a sale at Rosa's
 * (market), a shot at the East Jetty target (pier challenge) or a Konbini purchase. Read once with the checklist; the keys are the
 * stores' own (tests/explore-checklist.cjs checks they match). The card watcher's baseline means these never pay retroactively.
 */
export const SAVE_EVIDENCE_KEYS={fish:'fi2-fishbook-v1',job:'fi2-island-jobs-v1',sold:'fi2-market-v1',jetty:'fi2-east-pier-challenge-v1',konbini:'fi2-konbini-collection-v1'} as const;
export function evidenceFromSaves(get:(key:string)=>string|null):Partial<Pick<ExploreActivity,'fish'|'job'|'sold'|'jetty'|'konbini'>>{
 const json=(k:string)=>{try{return JSON.parse(get(k)??'null');}catch{return null;}},out:Partial<Pick<ExploreActivity,'fish'|'job'|'sold'|'jetty'|'konbini'>>={};
 const fish=json(SAVE_EVIDENCE_KEYS.fish);if(fish&&typeof fish.total==='number'&&fish.total>0)out.fish=true;
 const jobs=json(SAVE_EVIDENCE_KEYS.job);if(jobs&&jobs.lifetime&&typeof jobs.lifetime==='object'&&Object.values(jobs.lifetime).some(n=>typeof n==='number'&&n>0))out.job=true;
 const market=json(SAVE_EVIDENCE_KEYS.sold);if(market&&typeof market.sales==='number'&&market.sales>0)out.sold=true;
 const pier=json(SAVE_EVIDENCE_KEYS.jetty);if(pier&&typeof pier.hits==='number'&&pier.hits>0)out.jetty=true;
 const konbini=json(SAVE_EVIDENCE_KEYS.konbini);if(konbini&&konbini.items&&typeof konbini.items==='object'&&Object.keys(konbini.items).length>0)out.konbini=true;
 return out;
}
function read(){if(loaded||typeof window==='undefined')return;loaded=true;try{state=sanitizeExploreActivity(JSON.parse(localStorage.getItem(EXPLORE_ACTIVITY_KEY)??'null'));}catch{state=empty;}
 try{const derived=evidenceFromSaves(k=>localStorage.getItem(k));if(Object.entries(derived).some(([k,v])=>v&&!state[k as keyof typeof derived]))state={...state,...Object.fromEntries(Object.entries(derived).filter(([,v])=>v))};}catch{}
 snapshot=JSON.stringify(state);}
function notify(){snapshot=JSON.stringify(state);listeners.forEach(fn=>fn());}
function storage(e:StorageEvent){if(e.key===EXPLORE_ACTIVITY_KEY||e.key===null){loaded=false;read();notify();}}
function subscribe(fn:()=>void){listeners.add(fn);if(listeners.size===1)window.addEventListener('storage',storage);return()=>{listeners.delete(fn);if(!listeners.size)window.removeEventListener('storage',storage);};}
export function recordExploreActivity(kind:'character'|Exclude<keyof ExploreActivity,'characters'>,id?:string){
 if(isLearningPreview())return;read();
 const limit=kind==='knockovers'?20:kind==='knockoutWins'?5:0;
 if(kind==='character'?(!id||state.characters.includes(id)||state.characters.length>=10):limit?Number(state[kind])>=limit:state[kind])return;
 // Persist only successful events, never idle frames. Merge older saved progress.
 try{const saved=sanitizeExploreActivity(JSON.parse(localStorage.getItem(EXPLORE_ACTIVITY_KEY)??'null'));
 const merged:ExploreActivity={...state,characters:[...new Set([...state.characters,...saved.characters])].slice(0,10),
 knockovers:Math.max(state.knockovers,saved.knockovers),knockoutWins:Math.max(state.knockoutWins,saved.knockoutWins)};
 for(const k of FLAGS)merged[k]=state[k]||saved[k];state=merged;}catch{}
 state=sanitizeExploreActivity(kind==='character'?{...state,characters:[...state.characters,id!]}:{...state,[kind]:limit?Number(state[kind])+1:true});
 try{localStorage.setItem(EXPLORE_ACTIVITY_KEY,JSON.stringify(state));}catch{}notify();
}
export function recordExploreKnockover(hit:boolean){if(hit)recordExploreActivity('knockovers');return hit;}
export function useExploreActivity():ExploreActivity{const value=useSyncExternalStore(subscribe,()=>{read();return snapshot;},()=>server);return JSON.parse(value);}
/** The checklist signals (lib/town/exploreSignals.ts) from the fishing, jobs and market stores and the island's zone check. */
if(typeof window!=='undefined'&&typeof window.addEventListener==='function')window.addEventListener(EXPLORE_SIGNAL,(e:Event)=>{const kind=(e as CustomEvent<ExploreSignal>).detail;if((FLAGS as readonly string[]).includes(kind))recordExploreActivity(kind);});
/** The current checklist activity (non-React readers, e.g. the island's zone check at startup). */
export function exploreActivityNow():ExploreActivity{read();return state;}
