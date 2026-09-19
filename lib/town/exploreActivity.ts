'use client';
import {useSyncExternalStore} from 'react';
import {isLearningPreview} from './learningProgress';
export const EXPLORE_ACTIVITY_KEY='fi2-explore-activity-v1';
export type ExploreActivity={characters:string[];store:boolean;arcade:boolean;ramp:boolean;truck:boolean;target:boolean;parachute:boolean;roofDrop:boolean;knockovers:number;knockoutWins:number};
const empty:ExploreActivity={characters:[],store:false,arcade:false,ramp:false,truck:false,target:false,parachute:false,roofDrop:false,knockovers:0,knockoutWins:0};
const count=(v:unknown,max:number)=>typeof v==='number'&&Number.isFinite(v)?Math.min(max,Math.max(0,Math.floor(v))):0;
export function sanitizeExploreActivity(value:unknown):ExploreActivity{const v=value&&typeof value==='object'?value as Partial<ExploreActivity>:{};return{characters:Array.isArray(v.characters)?[...new Set(v.characters.filter((id):id is string=>typeof id==='string'&&id.length>0&&id.length<100))].slice(0,10):[],store:v.store===true,arcade:v.arcade===true,ramp:v.ramp===true,truck:v.truck===true,target:v.target===true,parachute:v.parachute===true,roofDrop:v.roofDrop===true,knockovers:count(v.knockovers,20),knockoutWins:count(v.knockoutWins,5)};}
const listeners=new Set<()=>void>();let state=empty,loaded=false;const server=JSON.stringify(empty);let snapshot=server;
function read(){if(loaded||typeof window==='undefined')return;loaded=true;try{state=sanitizeExploreActivity(JSON.parse(localStorage.getItem(EXPLORE_ACTIVITY_KEY)??'null'));}catch{state=empty;}snapshot=JSON.stringify(state);}
function notify(){snapshot=JSON.stringify(state);listeners.forEach(fn=>fn());}
function storage(e:StorageEvent){if(e.key===EXPLORE_ACTIVITY_KEY||e.key===null){loaded=false;read();notify();}}
function subscribe(fn:()=>void){listeners.add(fn);if(listeners.size===1)window.addEventListener('storage',storage);return()=>{listeners.delete(fn);if(!listeners.size)window.removeEventListener('storage',storage);};}
export function recordExploreActivity(kind:'character'|Exclude<keyof ExploreActivity,'characters'>,id?:string){
 if(isLearningPreview())return;read();
 const limit=kind==='knockovers'?20:kind==='knockoutWins'?5:0;
 if(kind==='character'?(!id||state.characters.includes(id)||state.characters.length>=10):limit?Number(state[kind])>=limit:state[kind])return;
 // Persist only successful events, never idle frames. Merge older saved progress.
 try{const saved=sanitizeExploreActivity(JSON.parse(localStorage.getItem(EXPLORE_ACTIVITY_KEY)??'null'));
 state={characters:[...new Set([...state.characters,...saved.characters])].slice(0,10),
 store:state.store||saved.store,arcade:state.arcade||saved.arcade,ramp:state.ramp||saved.ramp,
 truck:state.truck||saved.truck,target:state.target||saved.target,parachute:state.parachute||saved.parachute,roofDrop:state.roofDrop||saved.roofDrop,
 knockovers:Math.max(state.knockovers,saved.knockovers),knockoutWins:Math.max(state.knockoutWins,saved.knockoutWins)};}catch{}
 state=sanitizeExploreActivity(kind==='character'?{...state,characters:[...state.characters,id!]}:{...state,[kind]:limit?Number(state[kind])+1:true});
 try{localStorage.setItem(EXPLORE_ACTIVITY_KEY,JSON.stringify(state));}catch{}notify();
}
export function recordExploreKnockover(hit:boolean){if(hit)recordExploreActivity('knockovers');return hit;}
export function useExploreActivity():ExploreActivity{const value=useSyncExternalStore(subscribe,()=>{read();return snapshot;},()=>server);return JSON.parse(value);}
