'use client';
import {useSyncExternalStore} from 'react';
import {spendArcadeCoins,creditOnce} from '../arcade/arcadeWallet';
import {localPlayDay} from '../town/dailyPlay';
import {createLearnCoins,LEARN_COINS_EARNED} from '../town/learnCoins';
import {createKonbiniLedger,emptyKonbini,emptyCollection,pouch,boughtToday,collect,type KonbiniState,type CollectionState,type KonbiniShop} from './food';
import {STAMP_CARD_SIZE} from './konbiniContent';

/**
 * Browser wiring for the Konbini food ledger (pure rules: food.ts). Coins go through the arcade wallet (the sole balance) with
 * one idempotent spend id per purchase. Two small saves of its own, each versioned:
 *  - KONBINI_KEY: what happened to the food (in hand, in the Snacks pouch, eaten) and the magazine stamp card;
 *  - KONBINI_COLLECTION_KEY: the permanent Konbini Collection (first purchase time per item) and the set rewards paid.
 * No polling: subscribers are told on writes and on cross-tab `storage`.
 *
 * STABLE API for other features (e.g. the outdoor drink machines): buyConsumable / resolveFood / eatFromPouch /
 * markCollected / useKonbini / useKonbiniCollection, plus registerConsumables / registerCollectionGroup in food.ts.
 */
export const KONBINI_KEY='fi2-konbini-v1';
export const KONBINI_COLLECTION_KEY='fi2-konbini-collection-v1';
export const KONBINI_CHANGED='fi2-konbini-changed';
function storage():Storage|null{try{return typeof localStorage==='undefined'?null:localStorage;}catch{return null;}}
const memory=new Map<string,string>();
const rawOf=(key:string)=>{try{return storage()?.getItem(key)??memory.get(key)??null;}catch{return memory.get(key)??null;}};
const writeRaw=(key:string,value:unknown)=>{const v=JSON.stringify(value);memory.set(key,v);try{storage()?.setItem(key,v);}catch{/* this visit still knows */}emit();};
let snapshot:KonbiniState|null=null,collectionSnapshot:CollectionState|null=null;const listeners=new Set<()=>void>();
function emit(){snapshot=null;collectionSnapshot=null;listeners.forEach(fn=>fn());if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent(KONBINI_CHANGED));}
const learnCoins=createLearnCoins({creditOnce:(id,game,amount,reason)=>creditOnce(id,game,amount,reason),notify:detail=>{if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent(LEARN_COINS_EARNED,{detail}));}});
const ledger=createKonbiniLedger({
 read:()=>JSON.parse(rawOf(KONBINI_KEY)??'null'),write:s=>writeRaw(KONBINI_KEY,s),
 readCollection:()=>JSON.parse(rawOf(KONBINI_COLLECTION_KEY)??'null'),writeCollection:s=>writeRaw(KONBINI_COLLECTION_KEY,s),
 now:()=>Date.now(),day:localPlayDay,
 spend:(id,cost,reason)=>spendArcadeCoins(id,cost,reason),
 // Collection rewards are one-off learning coins (learn:explore:<id>), paid once ever by the wallet's creditOnce.
 reward:async(id,coins,reason)=>{const paid=await creditOnce(`learn:explore:${id}`,'learn',coins,`Learning · ${reason}`);if(paid>0&&typeof window!=='undefined')window.dispatchEvent(new CustomEvent(LEARN_COINS_EARNED,{detail:{kind:'explore',amount:paid,reason}}));return paid;},
 lock:<T,>(fn:()=>T|Promise<T>)=>typeof navigator!=='undefined'&&navigator.locks?navigator.locks.request(KONBINI_KEY,fn) as Promise<T>:Promise.resolve().then(fn),
});
export const newPurchaseId=()=>globalThis.crypto?.randomUUID?.()??`${Date.now()}-${Math.random().toString(36).slice(2)}`;
/** Buy one Konbini food (or a registered consumable) with a purchase id made once per deliberate Buy. */
export const buyConsumable=(itemId:string,purchaseId:string,shop?:KonbiniShop)=>ledger.buy(itemId,purchaseId,shop);
export const buyFood=buyConsumable;
export const resolveFood=ledger.resolve,keepFood=ledger.keep,eatFromPouch=ledger.eatFromPouch;
export function readKonbini():KonbiniState{return snapshot??=ledger.read();}
export function readKonbiniCollection():CollectionState{return collectionSnapshot??=ledger.readCollection();}
export const foodBoughtToday=(key='food')=>boughtToday(readKonbini(),Date.now(),localPlayDay,key);
export const snackPouch=()=>pouch(readKonbini());
/** Mark an item of a registered collection group as collected (e.g. a drink bought elsewhere). Returns true when new. */
export function markCollected(itemId:string,at=Date.now()){const before=readKonbiniCollection(),{state}=collect(before,itemId,at);if(state===before)return false;writeRaw(KONBINI_COLLECTION_KEY,state);return true;}

/** Stamp card: one stamp per magazine lesson read (both stores); the full card pays the learning "explore" reward once
 *  ever (learn:explore:konbini-stamp-card, 5 coins, never metered). Resolves to the coins paid now. */
export async function stampMagazine(id:string):Promise<number>{
 const s=ledger.addStamp(id);if(s.stamps.length<STAMP_CARD_SIZE||s.stampPaid)return 0;
 const paid=await learnCoins.pay('explore','konbini-stamp-card','You filled the Konbini stamp card');ledger.markStampPaid();return paid;
}
function subscribe(fn:()=>void){listeners.add(fn);const onStorage=(e:StorageEvent)=>{if(e.key===KONBINI_KEY||e.key===KONBINI_COLLECTION_KEY||e.key===null){snapshot=null;collectionSnapshot=null;fn();}};
 window.addEventListener('storage',onStorage);return()=>{listeners.delete(fn);window.removeEventListener('storage',onStorage);};}
const EMPTY=emptyKonbini(),EMPTY_COLLECTION=emptyCollection();
export function useKonbini():KonbiniState{return useSyncExternalStore(subscribe,readKonbini,()=>EMPTY);}
export function useKonbiniCollection():CollectionState{return useSyncExternalStore(subscribe,readKonbiniCollection,()=>EMPTY_COLLECTION);}
/** Raw snapshot strings for the backpack's memo (stable until a write). */
export const konbiniRaw=()=>`${rawOf(KONBINI_KEY)??''}|${rawOf(KONBINI_COLLECTION_KEY)??''}`;
export const subscribeKonbini=subscribe;
