'use client';
import {useMemo,useSyncExternalStore} from 'react';
import {readArcadeWallet,useArcadeWallet} from '../arcade/arcadeWallet';
import {CARD_STORAGE_KEY,addToCollection,readCollection} from './cardCollection';
import {CARD_ADDED} from './cardRewardStore';
import {CARD_REMOVED} from './market/cardSellingStore';
import {readVending,useVending} from './vendingWallet';
import {isVendingPreview} from './vendingPreview';
import {readKonbini,readKonbiniCollection,konbiniRaw,subscribeKonbini} from '../konbini/foodStore';
import {pouch} from '../konbini/food';
// Lane 2 (Sep 30 2026): the Trophy shelf (graduation certificates) registers its category on import.
import {trophiesFrom} from '../endgame/backpackTrophies';
import {GRADUATION_KEY,GRADUATIONS_CHANGED,readGraduations} from '../endgame/graduationStore';
import {buildBackpack,markSeen,planStarterKit,sanitizeBackpack,type BackpackGroup,type BackpackSources,type BackpackState} from './backpack';

/**
 * Browser wiring for the backpack (pure model: backpack.ts). Reads the existing ownership stores (vending ledger, arcade wallet
 * packs, card collection) and its own small receipt (BACKPACK_KEY). Subscriptions only: the vending/wallet stores' own
 * listeners, the card events (CARD_ADDED / CARD_REMOVED) and cross-tab `storage`. No polling, nothing runs while it's closed.
 */
export const BACKPACK_KEY='fi2-backpack-v1';
export const BACKPACK_CHANGED='fi2-backpack-changed';
function storage():Storage|null{try{return typeof localStorage==='undefined'?null:localStorage;}catch{return null;}}
let memory:string|null=null;
const rawState=()=>{const s=storage();try{return s?s.getItem(BACKPACK_KEY):memory;}catch{return memory;}};
function readState():BackpackState{try{return sanitizeBackpack(JSON.parse(rawState()??'null'));}catch{return sanitizeBackpack(null);}}
function writeState(state:BackpackState){const raw=JSON.stringify(state);memory=raw;try{storage()?.setItem(BACKPACK_KEY,raw);}catch{/* this visit still knows */}
 if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent(BACKPACK_CHANGED));}
const rawCards=()=>{try{return storage()?.getItem(CARD_STORAGE_KEY)??'[]';}catch{return '[]';}};

function currentSources(state=readState()):BackpackSources{
 const v=readVending(),w=readArcadeWallet();
 return {owned:v.owned,history:v.history,cards:readCollection(),packs:w.packs,starter:state.starter,...konbiniSources(),...trophySources()};
}
/**
 * Grants the starter kit once per save: the island intro book, three player cards (into the real card collection) and the base
 * ride of every category (already the vending ledger's free starters). Idempotent: the receipt is re-read right before the write,
 * and addToCollection never duplicates. Never runs in the `?preview=all` testing session. No coins.
 */
export function ensureStarterKit(now=Date.now()):boolean{
 if(typeof window==='undefined'||isVendingPreview())return false;
 const state=readState(),plan=planStarterKit(state,currentSources(state),now);if(!plan)return false;
 if(readState().starter)return false;
 writeState(plan.state);
 let last:string|null=null;for(const name of plan.addCards)if(addToCollection(name))last=name;
 if(last)window.dispatchEvent(new CustomEvent(CARD_ADDED,{detail:{name:last,starter:true}}));
 return true;
}
/** Remember these items as seen (drops their New badge next time). */
export function markBackpackSeen(ids:Iterable<string>){const state=readState(),next=markSeen(state,ids);if(next!==state)writeState(next);}

const EVENTS=[CARD_ADDED,CARD_REMOVED,BACKPACK_CHANGED,GRADUATIONS_CHANGED];
const trophySources=()=>({trophies:trophiesFrom(readGraduations())});
const rawGraduations=()=>{try{return storage()?.getItem(GRADUATION_KEY)??'';}catch{return '';}};
const konbiniSources=()=>({snacks:pouch(readKonbini()),konbini:readKonbiniCollection()});
function subscribeLocal(fn:()=>void){
 const onStorage=(e:StorageEvent)=>{if(e.key===null||e.key===BACKPACK_KEY||e.key===CARD_STORAGE_KEY||e.key===GRADUATION_KEY)fn();};
 for(const e of EVENTS)window.addEventListener(e,fn);window.addEventListener('storage',onStorage);
 return()=>{for(const e of EVENTS)window.removeEventListener(e,fn);window.removeEventListener('storage',onStorage);};
}
/** Live backpack sections + the ids already seen. */
export function useBackpack():{ready:boolean;groups:BackpackGroup[];seen:ReadonlySet<string>}{
 const vending=useVending(),wallet=useArcadeWallet();
 // Raw strings are stable snapshots: they only change when the stored value does.
 const cards=useSyncExternalStore(subscribeLocal,rawCards,()=>'[]');
 const raw=useSyncExternalStore(subscribeLocal,()=>rawState()??'',()=>'');
 const konbini=useSyncExternalStore(subscribeKonbini,konbiniRaw,()=>'');
 const grads=useSyncExternalStore(subscribeLocal,rawGraduations,()=>'');
 return useMemo(()=>{
  const state=readState();
  const sources:BackpackSources={owned:vending.owned,history:vending.history,cards:readCollection(),packs:wallet.packs,starter:state.starter,...konbiniSources(),...trophySources()};
  return {ready:vending.ready,groups:buildBackpack(sources),seen:new Set(state.seen)};
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[vending.owned,vending.history,vending.ready,wallet.packs,cards,raw,konbini,grads]);
}
