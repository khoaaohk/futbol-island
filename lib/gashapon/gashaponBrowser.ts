'use client';
/**
 * Browser wiring for the gashapon store (round 2, Nov 8 2026; rules: lib/gashapon/store.ts). Same storage pattern as the Konbini
 * collection (lib/konbini/foodStore.ts): GASHAPON_KEY in localStorage (SYNC in lib/saves/snapshot.ts, so the account snapshot
 * carries it), an in-memory copy if storage is blocked, subscribers told on writes and on cross-tab `storage` events. Coins:
 * the arcade wallet (`spendArcadeCoins`, idempotent per spin id; repeat-toy refund through `creditOnce`, once per spin id).
 * No polling, no timers.
 *
 * Also the small "which machine panel is open" store the island and the arcade share (components/GashaponPanel.tsx), and the
 * round-3 overlay store: `openToyViewer(toyId, source)` and `openToyShelf()` (components/GashaponToyLayer.tsx shows them).
 */
import {useSyncExternalStore} from 'react';
import {spendArcadeCoins,creditOnce} from '../arcade/arcadeWallet';
import {localPlayDay} from '../town/dailyPlay';
import {createGashaponStore,emptyGashapon,GASHAPON_KEY,type GashaponState} from './store';

export const GASHAPON_CHANGED='fi2-gashapon-changed';
function storage():Storage|null{try{return typeof localStorage==='undefined'?null:localStorage;}catch{return null;}}
let memory:string|null=null;
const rawOf=()=>{try{return storage()?.getItem(GASHAPON_KEY)??memory;}catch{return memory;}};
let snapshot:GashaponState|null=null;const listeners=new Set<()=>void>();
function emit(){snapshot=null;listeners.forEach(fn=>fn());if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent(GASHAPON_CHANGED));}

const store=createGashaponStore({
 read:()=>JSON.parse(rawOf()??'null'),
 // A blocked or full storage throws here, and the store reports 'save' (coins already recorded under the spin id, so the
 // retry with the same id finishes without a second charge). The in-memory copy is only written once storage accepted it.
 write:s=>{const v=JSON.stringify(s);const st=storage();if(st)st.setItem(GASHAPON_KEY,v);memory=v;emit();},
 now:()=>Date.now(),day:localPlayDay,
 spend:(id,cost,reason)=>spendArcadeCoins(id,cost,reason),
 refund:(id,coins,reason)=>creditOnce(id,'island',coins,reason),
 lock:<T,>(fn:()=>T|Promise<T>)=>typeof navigator!=='undefined'&&navigator.locks?navigator.locks.request(GASHAPON_KEY,fn) as Promise<T>:Promise.resolve().then(fn),
});
export const gashapon=store;
/**
 * A spin whose coins were taken but whose save failed, per machine (QA Nov 8 2026): kept for the session so "Try again", even
 * after the panel was closed and reopened, finishes it under the SAME spin id (the wallet never charges an id twice). Before,
 * the id lived only in the panel, so closing it lost those 20 coins and the next spin charged again.
 */
const unsaved=new Map<string,string>();
export const unsavedSpin={get:(machine:string)=>unsaved.get(machine)??null,set(machine:string,spinId:string){unsaved.set(machine,spinId);},clear(machine:string){unsaved.delete(machine);}};
export const newSpinId=()=>globalThis.crypto?.randomUUID?.()??`${Date.now()}-${Math.random().toString(36).slice(2)}`;
export function readGashapon():GashaponState{return snapshot??=store.read();}
function subscribe(fn:()=>void){listeners.add(fn);const onStorage=(e:StorageEvent)=>{if(e.key===GASHAPON_KEY||e.key===null){snapshot=null;fn();}};
 window.addEventListener('storage',onStorage);return()=>{listeners.delete(fn);window.removeEventListener('storage',onStorage);};}
const EMPTY=emptyGashapon();
export const useGashapon=()=>useSyncExternalStore(subscribe,readGashapon,()=>EMPTY);

// ---- The open panel (one at a time) ---------------------------------------------------------------------------------------
let openId:string|null=null;const panelListeners=new Set<()=>void>();
export const gashaponPanel={
 get:()=>openId,server:()=>null as string|null,
 subscribe(fn:()=>void){panelListeners.add(fn);return()=>{panelListeners.delete(fn);};},
 open(id:string){if(openId===id)return;openId=id;panelListeners.forEach(f=>f());},
 close(){if(openId===null)return;openId=null;panelListeners.forEach(f=>f());},
};
export const useGashaponPanel=()=>useSyncExternalStore(gashaponPanel.subscribe,gashaponPanel.get,gashaponPanel.server);
/**
 * How the island's Gashapon button (and a tap on a machine) opens a panel (owner, Nov 9 2026: "it should zoom into the machine
 * like the vending machines"): Town registers a handler that zooms the camera onto the glass and opens the panel on arrival.
 * With no handler (tests, a torn-down island) it opens the panel straight away. The arcade room opens its panel directly.
 */
let opener:((id:string)=>void)|null=null;
export const gashaponOpener={
 set(fn:((id:string)=>void)|null){opener=fn;},
 open(id:string){if(gashaponPanel.get()!==null)return;if(opener)opener(id);else gashaponPanel.open(id);},
};

// ---- The toy viewer + Toy Shelf overlay (round 3A, Nov 8 2026; components/GashaponToyLayer.tsx) ------------------------------
export type ToyViewSource='result'|'shelf';
export type ToyOverlay={toy:string|null;source:ToyViewSource;shelf:boolean};
let overlay:ToyOverlay={toy:null,source:'result',shelf:false};const overlayListeners=new Set<()=>void>();
const SERVER_OVERLAY:ToyOverlay={toy:null,source:'result',shelf:false};
function setOverlay(next:ToyOverlay){overlay=next;overlayListeners.forEach(f=>f());}
export const toyOverlay={
 get:()=>overlay,server:()=>SERVER_OVERLAY,
 subscribe(fn:()=>void){overlayListeners.add(fn);return()=>{overlayListeners.delete(fn);};},
 closeViewer(){if(overlay.toy)setOverlay({...overlay,toy:null});},
 closeShelf(){if(overlay.shelf||overlay.toy)setOverlay({toy:null,source:overlay.source,shelf:false});},
 /** True while the viewer or the shelf covers the screen (the arcade room covers its scene, panels ignore their keys). */
 covering:()=>overlay.toy!==null||overlay.shelf,
};
export const useToyOverlay=()=>useSyncExternalStore(toyOverlay.subscribe,toyOverlay.get,toyOverlay.server);
/**
 * Where the 3D viewer mounts (Nov 9 2026): the backpack lives in Make it yours, a modal <dialog> (the browser's top layer), so a
 * viewer opened from its Toys section must render inside that dialog. While such a nested host is mounted it claims the viewer
 * and the island's own layer (GashaponHud) leaves it out, so exactly one viewer shows.
 */
let viewerHosts=0;
export const toyViewerHost={
 claim(){viewerHosts++;overlayListeners.forEach(f=>f());return()=>{viewerHosts--;overlayListeners.forEach(f=>f());};},
 claimed:()=>viewerHosts>0,
};
export const useToyViewerClaimed=()=>useSyncExternalStore(toyOverlay.subscribe,toyViewerHost.claimed,()=>false);
/**
 * Open the full-screen 3D toy viewer (squeeze / poke / tap) for a toy you own: from the spin result card ('result') or the Toy
 * Shelf ('shelf'). Also announces `fi2-gashapon-viewer` (detail {toyId, source}) for anything else that wants to know.
 */
export function openToyViewer(toyId:string,source:ToyViewSource='result'){
 setOverlay({...overlay,toy:toyId,source});
 if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent('fi2-gashapon-viewer',{detail:{toyId,source}}));
}
/** Open the Toy Shelf (every machine's toys, found ones tappable). */
export function openToyShelf(){setOverlay({...overlay,shelf:true});if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent('fi2-gashapon-shelf'));}
