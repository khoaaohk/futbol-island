'use client';
import {useSyncExternalStore} from 'react';
import {isLearningPreview} from '../town/learningProgress';
import {EXHIBITS,timelineOrder,type Exhibit} from '../endgame/museum';
/**
 * The museum passport (Oct 9 2026): which exhibits the player has stepped inside (`seen`, a stamp) and which they finished
 * (`done`, a gold stamp: an experience calls ExperienceProps.onComplete). Progress, so it syncs with the save code (SYNC_KEYS in
 * lib/saves/snapshot.ts; docs/accounts-design.md table A). Written only when a stamp is new (never per frame); a write merges with
 * what is already saved (a set union), so two tabs or a restored save never lose a stamp.
 *
 * Ids are the case ids in lib/endgame/museum.ts plus 'timeline' (the story wall); anything else is dropped when read.
 */
export const MUSEUM_VISITS_KEY='fi2-museum-visits-v1';
export const PASSPORT_IDS:readonly string[]=['timeline',...EXHIBITS.map(e=>e.id)];
export type MuseumVisits={seen:string[];done:string[]};
const EMPTY:MuseumVisits={seen:[],done:[]};
const ids=(v:unknown)=>Array.isArray(v)?PASSPORT_IDS.filter(id=>v.includes(id)):[];
/** Keeps known ids only, in a fixed order; a finished exhibit is always also a visited one. */
export function sanitizeMuseumVisits(value:unknown):MuseumVisits{
 const v=value&&typeof value==='object'?value as Partial<Record<keyof MuseumVisits,unknown>>:{};
 const done=ids(v.done),seen=ids([...ids(v.seen),...done]);
 return {seen,done};
}
export const mergeMuseumVisits=(a:MuseumVisits,b:MuseumVisits)=>sanitizeMuseumVisits({seen:[...a.seen,...b.seen],done:[...a.done,...b.done]});

/** The passport's numbers: stamps among the 12 cases (the timeline wall is a bonus stamp, not one of the 12). */
export function passport(v:MuseumVisits,list:readonly Exhibit[]=EXHIBITS){
 const cases=list.map(e=>e.id),seen=cases.filter(id=>v.seen.includes(id)).length,done=cases.filter(id=>v.done.includes(id)).length;
 return {seen,done,total:cases.length,all:seen===cases.length&&cases.length>0};
}
/** The next exhibit to step inside: the first open case on the timeline (date order) without a stamp; null when there is none. */
export function nextToVisit(v:MuseumVisits,isOpen:(id:string)=>boolean,canEnter:(id:string)=>boolean=()=>true,after?:string):Exhibit|null{
 const order=timelineOrder(),start=after?Math.max(0,order.findIndex(e=>e.id===after)+1):0;
 const pick=(e:Exhibit)=>isOpen(e.id)&&canEnter(e.id)&&!v.seen.includes(e.id);
 return order.slice(start).find(pick)??order.slice(0,start).find(pick)??null;
}

const listeners=new Set<()=>void>();let state=EMPTY,loaded=false,snapshot=JSON.stringify(EMPTY);const server=snapshot;
function readSaved():MuseumVisits{try{return sanitizeMuseumVisits(JSON.parse(localStorage.getItem(MUSEUM_VISITS_KEY)??'null'));}catch{return EMPTY;}}
function read(){if(loaded||typeof window==='undefined')return;loaded=true;state=readSaved();snapshot=JSON.stringify(state);}
function notify(){snapshot=JSON.stringify(state);listeners.forEach(fn=>fn());}
function storage(e:StorageEvent){if(e.key===MUSEUM_VISITS_KEY||e.key===null){loaded=false;read();notify();}}
function subscribe(fn:()=>void){listeners.add(fn);if(listeners.size===1)window.addEventListener('storage',storage);return()=>{listeners.delete(fn);if(!listeners.size)window.removeEventListener('storage',storage);};}
/** Stamp the passport. Returns true when this was a new stamp (the host shows its reward only then). */
export function recordMuseumVisit(id:string,kind:'seen'|'done'='seen'):boolean{
 if(typeof window==='undefined'||isLearningPreview()||!PASSPORT_IDS.includes(id))return false;read();
 if(state[kind].includes(id))return false;
 state=mergeMuseumVisits(mergeMuseumVisits(state,readSaved()),{seen:[id],done:kind==='done'?[id]:[]});
 try{localStorage.setItem(MUSEUM_VISITS_KEY,JSON.stringify(state));}catch{/* private mode: this visit only */}
 notify();return true;
}
export function useMuseumVisits():MuseumVisits{const value=useSyncExternalStore(subscribe,()=>{read();return snapshot;},()=>server);return JSON.parse(value);}
export function museumVisitsNow():MuseumVisits{read();return state;}
