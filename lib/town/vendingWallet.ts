'use client';
import {useSyncExternalStore} from 'react';
import {readArcadeWallet,useArcadeWallet,purchaseMysteryPack,buyVendingWithCoins} from '../arcade/arcadeWallet';
import {ALL_PLAYERS,CARD_STORAGE_KEY} from './cardCollection';
import {cardTier,readPathProgress} from './cardTiers';
import {tierGate} from './cardRewards';
import {localPlayDay} from './dailyPlay';
import {createVendingLedger,type VendingLedgerSnapshot,EMPTY_VENDING} from './vendingLedger';
import type {VendingItem} from './vendingCatalog';
import {RIDE_CATEGORIES,RIDE_ORDER,readRideUnlocks,rideUnlocksFor,readFinishedPaths,readRideGrants,type RideCategory} from './rideUnlocks';
import {CLUB_COSTUMES} from './costumes';
import {COIN_REWARD_ID,costumeEarned} from './coinQuest';
import {readCoinProgress} from './coinProgress';

/** Browser wiring for the vending ownership/history projection. The arcade wallet is the sole coin balance.
 * Gear debits carry durable ownership receipts; a failed secondary history write repairs from those receipts on read.
 * The vending lock protects its history while the wallet's separate lock serializes all coin spends. */
export const VENDING_KEY='fi2-vending-v1';
const CUSTOMIZATION_KEY='futbol-island-customization-v1';
function storage():Storage|null{try{return typeof localStorage==='undefined'?null:localStorage;}catch{return null;}}
const ledger=createVendingLedger({
 read:()=>{const s=storage();return s?JSON.parse(s.getItem(VENDING_KEY)??'null'):null;},
 write:value=>{const s=storage();if(!s)throw new Error('no storage');s.setItem(VENDING_KEY,JSON.stringify(value));},
 readSavedLook:()=>{const s=storage();try{return s?JSON.parse(s.getItem(CUSTOMIZATION_KEY)??'null'):null;}catch{return null;}},
 readCollection:()=>{const s=storage();try{const v=s?JSON.parse(s.getItem(CARD_STORAGE_KEY)??'[]'):[];return Array.isArray(v)?v.filter((n:unknown):n is string=>typeof n==='string'):[];}catch{return [];}},
 arcadeBalance:()=>readArcadeWallet().balance,
 receipts:()=>readArcadeWallet().vendingPurchases,
 payItem:item=>buyVendingWithCoins(item.id,item.price,item.label),
 lock:<T,>(fn:()=>T|Promise<T>)=>typeof navigator!=='undefined'&&navigator.locks?navigator.locks.request(VENDING_KEY,fn) as Promise<T>:Promise.resolve().then(fn),
 buyPack:(pack)=>purchaseMysteryPack(pack.size,pack.legends,pack.regular,pack.extra),
 // Economy pass (28 Sep 2026): light Icon gate in pack slots, top-up cards, and the 3-packs-a-day restock.
 iconsOpen:()=>tierGate(readPathProgress(),'quiz').icon,tierOf:cardTier,allCards:()=>ALL_PLAYERS,
 packsToday:()=>{const today=localPlayDay(Date.now());return readArcadeWallet().packs.filter(p=>p.packSize&&localPlayDay(p.at)===today).length;},
 now:()=>Date.now(),
 rideUnlocked:(category,id)=>(RIDE_CATEGORIES as string[]).includes(category)?readRideUnlocks().isUnlocked(category as RideCategory,id):true,
 costumeEarned:id=>costumeEarned(readCoinProgress(),id),
 allRides:()=>RIDE_CATEGORIES.flatMap(category=>RIDE_ORDER[category].map(id=>({category,id}))),
 allCostumes:()=>[...CLUB_COSTUMES.map(c=>c.id),COIN_REWARD_ID],
 // The one-time "already yours" snapshot uses real progress only, never the dev `?ridepaths` preview.
 snapshotRideUnlocked:(()=>{let u:ReturnType<typeof rideUnlocksFor>|null=null;return (category:string,id:string)=>{u??=rideUnlocksFor(readFinishedPaths(),readRideGrants(),false);return u.isUnlocked(category as RideCategory,id);};})(),
});
export const readVending=ledger.read;
export const isVendingOwned=(id:string)=>ledger.isOwned(id);
export const enforceVendingOwnership=ledger.enforce;
export const markMachineFound=ledger.markFound;
export const buyVendingItem=(item:VendingItem)=>ledger.buy(item);
export const packFreshness=ledger.packFreshness;
const onStorage=(event:StorageEvent)=>{if(event.key===VENDING_KEY||event.key===null)ledger.reload();};
let watchers=0;
function subscribe(fn:()=>void){const off=ledger.subscribe(fn);if(watchers++===0&&typeof window!=='undefined')window.addEventListener('storage',onStorage);return()=>{off();if(--watchers===0)window.removeEventListener('storage',onStorage);};}
/** Ledger + live arcade balance → what the machine shows. */
export function useVending():VendingLedgerSnapshot&{balance:number}{
 const wallet=useArcadeWallet(),snap=useSyncExternalStore(subscribe,ledger.read,()=>EMPTY_VENDING);
 return {...snap,balance:wallet.balance};
}
