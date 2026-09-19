'use client';
import {useSyncExternalStore} from 'react';
import {COIN_QUEST,COIN_STORAGE_KEY,applyCoinEvent,emptyCoinProgress,sanitizeCoinProgress,coinRewardEarned,type CoinProgress} from './coinQuest';
export {COIN_STORAGE_KEY,coinRewardEarned,sanitizeCoinProgress} from './coinQuest';
const server=emptyCoinProgress();let state=server,loaded=false;const listeners=new Set<()=>void>();
export function readCoinProgress(){if(!loaded&&typeof window!=='undefined'){loaded=true;try{state=sanitizeCoinProgress(JSON.parse(localStorage.getItem(COIN_STORAGE_KEY)??'null'));}catch{state=emptyCoinProgress();}}return state;}
function emit(){listeners.forEach(fn=>fn());}
function storage(e:StorageEvent){if(e.key===COIN_STORAGE_KEY||e.key===null){loaded=false;readCoinProgress();emit();}}
export function subscribeCoins(fn:()=>void){listeners.add(fn);if(listeners.size===1)window.addEventListener('storage',storage);return()=>{listeners.delete(fn);if(!listeners.size)window.removeEventListener('storage',storage);};}
export const useCoinProgress=()=>useSyncExternalStore(subscribeCoins,readCoinProgress,()=>server);
function merged(){const current=readCoinProgress();try{const saved=sanitizeCoinProgress(JSON.parse(localStorage.getItem(COIN_STORAGE_KEY)??'null'));return{...current,revealed:[...new Set([...saved.revealed,...current.revealed])],collected:[...new Set([...saved.collected,...current.collected])],allCostumesUnlocked:saved.allCostumesUnlocked||current.allCostumesUnlocked,rewardUnlocked:saved.rewardUnlocked||current.rewardUnlocked,celebrated:saved.celebrated||current.celebrated};}catch{return current;}}
function save(next:CoinProgress){state=next;try{localStorage.setItem(COIN_STORAGE_KEY,JSON.stringify(next));}catch{}emit();}
export function recordCoin(id:string,kind:'reveal'|'collect'){const before=merged(),next=applyCoinEvent(before,id,kind);if(next===before)return false;save(next);return true;}
export function setCoinHint(id:string|null){save(sanitizeCoinProgress({...merged(),hint:id}));}
export function dismissCoinCelebration(){const s=merged();if(s.collected.length===COIN_QUEST.length)save({...s,celebrated:true});}
