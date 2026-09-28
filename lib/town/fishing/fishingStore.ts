'use client';
/**
 * Browser binding for fishing: the Fishbook in localStorage, and landed fish going into the shared farmers-market basket
 * (lib/town/market/market.ts via the island wallet bridge in lib/town/jobs/islandWallet.ts — imported, never edited here).
 * No timers or polling: everything runs on a catch or a storage event.
 */
import {useSyncExternalStore} from 'react';
import {FISHBOOK_STORAGE_KEY,emptyFishbook,mergeFishbooks,recordCatch,sanitizeFishbook,type Fishbook} from './fishingCore';
import type {FishId} from './fishCatalog';
import {islandMarket} from '../jobs/islandWallet';

const server=emptyFishbook();let state=server,loaded=false;const listeners=new Set<()=>void>();
const readSaved=()=>{try{return sanitizeFishbook(JSON.parse(localStorage.getItem(FISHBOOK_STORAGE_KEY)??'null'));}catch{return emptyFishbook();}};
export function readFishbook():Fishbook{if(!loaded&&typeof window!=='undefined'){loaded=true;state=readSaved();}return state;}
const emit=()=>listeners.forEach(fn=>fn());
const storage=(e:StorageEvent)=>{if(e.key===FISHBOOK_STORAGE_KEY||e.key===null){loaded=false;readFishbook();emit();}};
export function subscribeFishbook(fn:()=>void){listeners.add(fn);if(listeners.size===1)window.addEventListener('storage',storage);return()=>{listeners.delete(fn);if(!listeners.size)window.removeEventListener('storage',storage);};}
export const useFishbook=()=>useSyncExternalStore(subscribeFishbook,readFishbook,()=>server);

export type LandResult={isNew:boolean;isBiggest:boolean;inBasket:boolean};
/** Log the catch (merging with another tab's save) and put the fish in the market basket if there is room. */
export function landFish(id:FishId,size:number,now=Date.now()):LandResult{
 const r=recordCatch(mergeFishbooks(readFishbook(),readSaved()),id,size,now);
 state=r.book;try{localStorage.setItem(FISHBOOK_STORAGE_KEY,JSON.stringify(r.book));}catch{}emit();
 let added=0;try{added=islandMarket.gather(id,1);}catch{}
 return {isNew:r.isNew,isBiggest:r.isBiggest,inBasket:added>0};
}

// ---- The live session singleton (HUD <-> island loop). Sounds reuse the island sound system's document cues. ----
import {createFishingSession} from './fishingSession';
const CUES={tick:['fi2-path-cue','path-pop'],splash:['fi2-path-cue','undock'],plunge:['fi2-path-cue','swipe-left'],cast:['fi2-path-cue','swipe-right'],fanfare:['fi2-story-cue','finish']} as const;
export const fishingSession=createFishingSession(
 (id,size)=>{const r=landFish(id,size);return {isNew:r.isNew,isBiggest:r.isBiggest,inBasket:r.inBasket};},
 kind=>{try{const [name,detail]=CUES[kind];document.dispatchEvent(new CustomEvent(name,{detail}));}catch{}},
);
