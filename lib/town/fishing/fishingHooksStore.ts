'use client';
/**
 * Browser binding for the fishing return hooks (fishingHooks.ts, docs/fishing.md "Return hooks"): the synced save
 * (`fi2-fishing-hooks-v1`) in localStorage, the catch listener, and what the catch card / toast / Fishbook show.
 * Event-driven only: one listener on the fishing event API, no timers, nothing per frame. Never touches the odds, the basket or
 * any price: a golden catch is the same fish with a stamp.
 */
import {useSyncExternalStore} from 'react';
import {FISHING_HOOKS_KEY,claimSets,emptyHooks,hookCatch,mergeHooks,sanitizeHooks,setFloats,type FishSet,type HookEffects,type HooksSave} from './fishingHooks';
import {fishingSession,readFishbook} from './fishingStore';
import {grantFloats,readFishingLog} from './fishingLogStore';

const server=emptyHooks();
let state:HooksSave=server,loaded=false;
const listeners=new Set<()=>void>();
const emit=()=>listeners.forEach(fn=>fn());
const readSaved=():HooksSave=>{try{return sanitizeHooks(JSON.parse(localStorage.getItem(FISHING_HOOKS_KEY)??'null'));}catch{return emptyHooks();}};
export function readFishingHooks():HooksSave{if(!loaded&&typeof window!=='undefined'){loaded=true;state=readSaved();}return state;}
function write(next:HooksSave){state=next;try{localStorage.setItem(FISHING_HOOKS_KEY,JSON.stringify(next));}catch{/* full storage: kept in memory this visit */}emit();}
const update=(fn:(s:HooksSave)=>HooksSave)=>write(fn(mergeHooks(readFishingHooks(),readSaved())));
const onStorage=(e:StorageEvent)=>{if(e.key===FISHING_HOOKS_KEY||e.key===null){loaded=false;readFishingHooks();emit();}};
export function subscribeFishingHooks(fn:()=>void){listeners.add(fn);if(listeners.size===1&&typeof window!=='undefined')window.addEventListener('storage',onStorage);return()=>{listeners.delete(fn);if(!listeners.size&&typeof window!=='undefined')window.removeEventListener('storage',onStorage);};}
export const useFishingHooks=()=>useSyncExternalStore(subscribeFishingHooks,readFishingHooks,()=>server);

export type LastHook={key:number;id:string;size:number;effects:HookEffects;sets:FishSet[]};
let last:LastHook|null=null,lastKey=0;
/** What the last landed catch did here (golden, visitor, a chapter, a completed set), for the catch card and the toast. */
export const lastHookEffects=()=>last;

/** Claim completed sets and make sure their floats are in the fishing log (also mends a save merged from another device). */
export function refreshSets():FishSet[]{
 let done:FishSet[]=[];const r=claimSets(mergeHooks(readFishingHooks(),readSaved()),readFishbook());
 if(r.done.length){done=r.done;write(r.save);}
 const floats=setFloats(readFishingHooks().sets);if(floats.length)grantFloats(floats);
 return done;
}

export function handleHookCatch(c:{id:string;size:number;spot:string|null},now=Date.now(),rand=Math.random()):LastHook|null{
 if(!c.spot)return null;let effects:HookEffects|null=null;
 const count=readFishbook().species[c.id]?.count??0;
 update(s=>{const r=hookCatch(s,{id:c.id,spot:c.spot!,count,now,rand,released:readFishingLog().legends});effects=r.effects;return r.save;});
 const sets=refreshSets(),e=effects as HookEffects|null;if(!e)return null;
 last={key:++lastKey,id:c.id,size:c.size,effects:e,sets};emit();return last;
}

// ---- Wiring to the Event API: one listener for the page, kept across hot updates. ----
type Hot={off?:()=>void};
const hot:Hot=typeof globalThis==='undefined'?{}:((globalThis as {__fi2FishingHooks?:Hot}).__fi2FishingHooks??={});
if(typeof window!=='undefined'){
 hot.off?.();
 hot.off=fishingSession.onFishingEvent(e=>{if(e.type==='catch'&&e.fish&&typeof e.size==='number')handleHookCatch({id:e.fish,size:e.size,spot:e.spot},e.at);});
}
