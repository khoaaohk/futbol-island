'use client';
import {useSyncExternalStore} from 'react';
import {ALL_PLAYERS,CARD_STORAGE_KEY,addToCollection} from '../town/cardCollection';
import {createArcadeWallet,EMPTY_ARCADE_WALLET} from './arcadeWalletCore';
export {arcadeCoinTarget,ARCADE_COIN_CAPS,type ArcadeCoinGame,type ArcadeWalletSnapshot,type LegendPack,type CoinHistory} from './arcadeWalletCore';
export const ARCADE_WALLET_KEY='fi2-arcade-wallet-v1';
let queue:Promise<unknown>=Promise.resolve();
const wallet=createArcadeWallet({
 read:()=>JSON.parse(localStorage.getItem(ARCADE_WALLET_KEY)??'null'),write:value=>localStorage.setItem(ARCADE_WALLET_KEY,JSON.stringify(value)),
 lock:<T,>(fn:()=>T|Promise<T>,purchase:boolean):Promise<T>=>{const work=()=>{if(typeof navigator!=='undefined'&&navigator.locks)return navigator.locks.request(ARCADE_WALLET_KEY,fn);if(purchase)return Promise.reject(new Error('No cross-tab lock'));return Promise.resolve().then(fn);};const result=queue.then(work,work);queue=result.catch(()=>{});return result;},
 valid:new Set(ALL_PLAYERS),now:()=>Date.now(),id:()=>globalThis.crypto?.randomUUID?.()??`arcade-${Date.now()}-${Math.random().toString(36).slice(2)}`,random:()=>Math.random(),
 grant:name=>{try{const before=JSON.parse(localStorage.getItem(CARD_STORAGE_KEY)??'[]');if(!Array.isArray(before)||!before.includes(name))addToCollection(name);const after=JSON.parse(localStorage.getItem(CARD_STORAGE_KEY)??'[]');return Array.isArray(after)&&after.includes(name);}catch{return false;}},
 notify:name=>window.dispatchEvent(new CustomEvent('fi2-card-added',{detail:{name}})),
});
let watching=0,reconcileQueued=false;
function read(){const value=wallet.load();if(typeof window!=='undefined'&&!reconcileQueued){reconcileQueued=true;queueMicrotask(()=>void wallet.reconcilePacks());}return value;}
const storage=(event:StorageEvent)=>{if(event.key===ARCADE_WALLET_KEY||event.key===null){wallet.refresh();void wallet.reconcilePacks();}};
function subscribe(fn:()=>void){const off=wallet.subscribe(fn);if(watching++===0)window.addEventListener('storage',storage);return()=>{off();if(--watching===0)window.removeEventListener('storage',storage);};}
export const useArcadeWallet=()=>useSyncExternalStore(subscribe,read,()=>EMPTY_ARCADE_WALLET);
export const readArcadeWallet=read;
export const beginArcadeRun=wallet.beginArcadeRun;
export const creditRun=wallet.creditRun;
export const recordPuzzleBest=wallet.recordPuzzleBest;
export const purchaseLegendPack=wallet.purchaseLegendPack;

export const purchaseMysteryPack=wallet.purchaseMysteryPack;
