'use client';
/**
 * Browser instance of the fuel store (rules: ./fuel.ts, design: docs/economy/FUEL_2026-09-30.md). SSR-safe: no storage access
 * at import; React reads a whole-number snapshot through useSyncExternalStore, so a component re-renders only when the number on
 * the bar changes (at most every ~5.6 s while flying), never per frame. No timers, no polling: fuel changes on Town's existing
 * 150 ms HUD tick (fuelTravel) and when the player eats (eatFuel).
 */
import {useSyncExternalStore} from 'react';
import {createFuelStore,createTravelSampler,fuelShown,fuelLevel,FUEL_STORAGE_KEY,type FuelMode,type FuelLevel,type FuelNotice} from './fuel';
import {localPlayDay} from './dailyPlay';

function storage():Storage|null{try{return typeof localStorage==='undefined'?null:localStorage;}catch{return null;}}
export const fuelStore=createFuelStore({
 read:()=>JSON.parse(storage()?.getItem(FUEL_STORAGE_KEY)??'null'),
 write:s=>{storage()?.setItem(FUEL_STORAGE_KEY,JSON.stringify(s));},
 now:()=>Date.now(),day:localPlayDay,
});
let watching=false;
function subscribe(fn:()=>void){
 const off=fuelStore.subscribe(fn);
 // Another tab ate a snack: re-read once (event-driven, no polling).
 const onStorage=(e:StorageEvent)=>{if(e.key===FUEL_STORAGE_KEY||e.key===null)fuelStore.refresh();};
 if(typeof window!=='undefined'&&!watching){watching=true;window.addEventListener('storage',onStorage);}
 return off;
}
const shown=()=>fuelShown(fuelStore.read().fuel);
/** The number on the bar (0–100). Server snapshot: a full tank. */
export function useFuel():{fuel:number;level:FuelLevel}{const fuel=useSyncExternalStore(subscribe,shown,()=>100);return {fuel,level:fuelLevel(fuel)};}
const noticeOf=()=>fuelStore.notice;
/** The latest gentle fuel note (low / empty / a ride refused); shown once through the HUD toast lane by components/FuelToast.tsx. */
export function useFuelNotice():FuelNotice|null{return useSyncExternalStore(subscribe,noticeOf,()=>null);}

const sampler=createTravelSampler();
const RIDES:ReadonlySet<string>=new Set(['scooter','bike','moped','jetpack']);
/**
 * Town's HUD tick (every ~150 ms, already running): charge the movement since the last tick. `paused` = a lesson, a field menu,
 * a truck bed, anything not under the player's own steam. Returns true when the easy modes are out of fuel (Town then lands /
 * steps off to walk). Cheap: a hypot and a compare; storage is written only when the shown number changes.
 */
export function fuelTravel(now:number,ride:string,x:number,z:number,sprint:boolean,paused:boolean,airborne=false,arrival=false):boolean{
 const mode:FuelMode=RIDES.has(ride)?ride as FuelMode:sprint?'sprint':'walk';
 const seconds=sampler({now,mode,x,z,paused,airborne,arrival});
 const s=seconds>0?fuelStore.travel(mode,seconds):fuelStore.read();sprintOk=s.fuel>=1;
 // `arrival`: the scripted arrival and opening hover never cost fuel and never force a landing (bug A6).
 return !paused&&!arrival&&mode!=='walk'&&mode!=='sprint'&&s.fuel<1;
}
/** May this ride / the jetpack start now? Walking always may. On a refusal the gentle note is shown. */
export function fuelAllowsRide(ride:string):boolean{
 if(!RIDES.has(ride))return true;if(fuelStore.canUse(ride as FuelMode))return true;
 fuelStore.blocked(ride as FuelMode);return false;
}
let sprintOk=true;
/** Sprinting rests at 0 fuel (the player jogs at walking pace instead). A cached flag from the last HUD tick: safe per frame. */
export const fuelCanSprint=()=>sprintOk;
/** Eat or drink something worth `amount` fuel. Returns the fuel actually gained. */
export const eatFuel=(amount:number)=>fuelStore.eat(amount);
