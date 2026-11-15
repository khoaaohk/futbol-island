'use client';
/**
 * Browser binding for the "come back tomorrow" features (./comeback.ts, docs/fishing.md "Come back tomorrow"): the small synced save
 * `fi2-fishing-comeback-v1`, one listener on the fishing Event API, and what the catch card shows (fish of the day, the weekly
 * visitor, a new record with the old best). Event-driven only: no timers, nothing per frame. It never pays or touches the basket:
 * the double pay for the fish of the day lives in the market's own price rule (lib/town/market/market.ts fotdFactor).
 */
import {useSyncExternalStore} from 'react';
import {COMEBACK_KEY,comebackCatch,emptyComeback,mergeComeback,sanitizeComeback,type ComebackEffects,type ComebackSave} from './comeback';
import {fishingSession} from './fishingStore';
import {countFotdCatch,countNewRecord,countVisitorWeek} from '../../analytics/fishingEvents';

const server=emptyComeback();
let state:ComebackSave=server,loaded=false;
const listeners=new Set<()=>void>();
const emit=()=>listeners.forEach(fn=>fn());
const readSaved=():ComebackSave=>{try{return sanitizeComeback(JSON.parse(localStorage.getItem(COMEBACK_KEY)??'null'));}catch{return emptyComeback();}};
export function readComeback():ComebackSave{if(!loaded&&typeof window!=='undefined'){loaded=true;state=readSaved();}return state;}
function write(next:ComebackSave){state=next;try{localStorage.setItem(COMEBACK_KEY,JSON.stringify(next));}catch{/* full storage: kept in memory */}emit();}
const onStorage=(e:StorageEvent)=>{if(e.key===COMEBACK_KEY||e.key===null){loaded=false;readComeback();emit();}};
export function subscribeComeback(fn:()=>void){listeners.add(fn);if(listeners.size===1&&typeof window!=='undefined')window.addEventListener('storage',onStorage);return()=>{listeners.delete(fn);if(!listeners.size&&typeof window!=='undefined')window.removeEventListener('storage',onStorage);};}
export const useComeback=()=>useSyncExternalStore(subscribeComeback,readComeback,()=>server);

export type LastComeback={id:string;size:number;effects:ComebackEffects};
let last:LastComeback|null=null;
/** What the last landed catch did here, for the catch card (matched by id and size). */
export const lastComeback=()=>last;

/** One landed Fishbook catch (legends are never sold, so they are skipped by the caller's event). */
export function handleComebackCatch(c:{id:string;size:number;spot:string|null;prevBest?:number},now=Date.now()):LastComeback|null{
 if(!c.spot)return null;
 const r=comebackCatch(mergeComeback(readComeback(),readSaved()),{id:c.id,spot:c.spot,size:c.size,now,prevBest:c.prevBest});
 if(r.save!==state)write(r.save);
 if(r.effects.fotdFirstToday)countFotdCatch();if(r.effects.visitor)countVisitorWeek();if(r.effects.record)countNewRecord();
 last={id:c.id,size:c.size,effects:r.effects};emit();return last;
}

// ---- Wiring to the Event API: one listener for the page, kept across hot updates. ----
type Hot={off?:()=>void};
const hot:Hot=typeof globalThis==='undefined'?{}:((globalThis as {__fi2FishComeback?:Hot}).__fi2FishComeback??={});
if(typeof window!=='undefined'){
 hot.off?.();
 hot.off=fishingSession.onFishingEvent(e=>{if(e.type!=='catch'||!e.fish||typeof e.size!=='number'||e.legend)return;
  handleComebackCatch({id:e.fish,size:e.size,spot:e.spot,prevBest:e.prevBest},e.at);});
}
