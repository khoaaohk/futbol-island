'use client';
import {useSyncExternalStore} from 'react';
import {ALL_PLAYERS,CARD_ENTRIES,CARD_STORAGE_KEY,addToCollection,cardDevEarn,readCollection} from './cardCollection';
import {isLearningPreview} from './learningProgress';
import {CARD_REWARDS_ENABLED,MAX_OFFERS_PER_SESSION,OFFERS_STORAGE_KEY,dayKey,drawThemedOffer,emptyOfferState,mergeOfferState,npcPickState,refreshOffer,sanitizeOfferState,sourceKey,type CardOffer,type OfferState,type RewardKind,type Theme} from './cardRewards';

/**
 * Card-reward offers on this device: pending "choose 1 of 3" offers, which sources already paid, and today's NPC picks.
 * Same pattern as coinProgress/quizProgress: localStorage (versioned key), merge-before-write for other tabs, an in-memory
 * copy when storage is blocked, and useSyncExternalStore for the UI. No timers, polling or background work.
 */
export const CARD_OFFER_OPEN='fi2-card-offer-open';
export const CARD_ADDED='fi2-card-added';
export const CARD_COMPLETE='fi2-card-complete';
/** Opens Paths → Collect cards (IslandSettings listens); the binder then turns to the chosen card (takeCardSpot). */
export const OPEN_CARDS_EVENT='fi2-open-cards';
const SESSION_KEY='fi2-card-offers-session-v1';
const VALID=new Set(ALL_PLAYERS);
const CARDS=CARD_ENTRIES.map(({name,role})=>({name,role}));

let state:OfferState=emptyOfferState(),loaded=false,memorySession=0;
const resolved=new Set<string>(),listeners=new Set<()=>void>();
const server=emptyOfferState();

/** Rewards run when the shipped flag is on, or in a dev build opened with ?cards=earn. */
export const cardRewardsActive=()=>CARD_REWARDS_ENABLED||cardDevEarn();

function readSaved():OfferState{try{return sanitizeOfferState(JSON.parse(localStorage.getItem(OFFERS_STORAGE_KEY)??'null'),VALID);}catch{return emptyOfferState();}}
function read(){if(!loaded&&typeof window!=='undefined'){loaded=true;state=readSaved();}return state;}
function emit(){listeners.forEach(fn=>fn());}
function save(next:OfferState){state=mergeOfferState(next,readSaved(),resolved);try{localStorage.setItem(OFFERS_STORAGE_KEY,JSON.stringify(state));}catch{state=next;}emit();}
function storage(e:StorageEvent){if(e.key===OFFERS_STORAGE_KEY||e.key===CARD_STORAGE_KEY||e.key===null){loaded=false;read();emit();}}
function subscribe(fn:()=>void){listeners.add(fn);if(listeners.size===1)window.addEventListener('storage',storage);return()=>{listeners.delete(fn);if(!listeners.size)window.removeEventListener('storage',storage);};}
/** Pending offers (newest last). Empty while rewards are off. */
export function useCardOffers():CardOffer[]{return useSyncExternalStore(subscribe,()=>cardRewardsActive()?read().offers:server.offers,()=>server.offers);}
export const readCardOffers=()=>cardRewardsActive()?read().offers:[];

function sessionCount(){try{return Number(sessionStorage.getItem(SESSION_KEY)??0)||0;}catch{return memorySession;}}
function bumpSession(){memorySession=sessionCount()+1;try{sessionStorage.setItem(SESSION_KEY,String(memorySession));}catch{}}

export type EarnResult='offered'|'complete'|'off'|'paid'|'capped'|'npc-today'|'day-cap';
export type EarnRequest={kind:RewardKind;id:string;reason:string;theme?:Theme};
/**
 * Called by a trigger (ball found, NPC chat finished, quiz passed). Creates one pending offer of up to three missing cards, or
 * reports why not: rewards off, this source already paid, the session cap, the NPC daily limits, or the collection complete
 * (which dispatches CARD_COMPLETE so the host can show the friendly message).
 */
export function earnCardOffer({kind,id,reason,theme}:EarnRequest,now=new Date()):EarnResult{
 if(typeof window==='undefined'||!cardRewardsActive()||isLearningPreview())return 'off';
 const current=mergeOfferState(read(),readSaved(),resolved),day=dayKey(now),key=sourceKey(kind,id,day);
 if(current.paid.includes(key))return 'paid';
 if(kind==='npc'){const npc=npcPickState(current,id,day);if(npc!=='ok')return npc;}
 const owned=new Set(readCollection());
 if(CARDS.every(card=>owned.has(card.name))){window.dispatchEvent(new CustomEvent(CARD_COMPLETE));return 'complete';}
 if(sessionCount()>=MAX_OFFERS_PER_SESSION)return 'capped';
 const avoid=new Set(current.offers.flatMap(o=>o.cards));
 const {cards,match}=drawThemedOffer(CARDS,owned,Math.random,{avoid,theme});
 const offer:CardOffer={id:`${key}:${now.getTime()}`,kind,source:key,reason,cards,at:now.getTime(),seen:false,...(theme?{theme}:{}),...(match?{match}:{})};
 const npcDay=kind==='npc'?{day,ids:[...(current.npcDay.day===day?current.npcDay.ids:[]),id]}:current.npcDay;
 bumpSession();save({...current,offers:[...current.offers,offer],paid:[...current.paid,key],npcDay});
 return 'offered';
}

/** Whether finishing a chat with this NPC can still offer a card today (for the chat's gentle "lots of players today" line). */
export function npcCardsToday(npcId:string,now=new Date()):'ok'|'npc-today'|'day-cap'|'off'{
 if(!cardRewardsActive())return 'off';return npcPickState(mergeOfferState(read(),readSaved(),resolved),npcId,dayKey(now));
}

/** The offer as it should be shown now: cards collected since it was made are replaced, so it never shows an owned card. */
export function liveOffer(id:string):CardOffer|null{
 const offer=read().offers.find(o=>o.id===id);if(!offer)return null;
 const owned=new Set(readCollection()),avoid=new Set(read().offers.filter(o=>o.id!==id).flatMap(o=>o.cards));
 const next=refreshOffer(offer,CARDS,owned,Math.random,avoid);
 if(next!==offer){if(!next.cards.length){resolveOffer(id);return null;}save({...read(),offers:read().offers.map(o=>o.id===id?next:o)});}
 return next;
}
export function markOfferSeen(id:string){const s=read();if(!s.offers.some(o=>o.id===id&&!o.seen))return;save({...s,offers:s.offers.map(o=>o.id===id?{...o,seen:true}:o)});}
function resolveOffer(id:string){resolved.add(id);save({...read(),offers:read().offers.filter(o=>o.id!==id)});}

/** A card the binder should turn to and light up the next time it opens (set when the child chooses a card). */
let spotRequest:string|null=null;
export const takeCardSpot=()=>{const name=spotRequest;spotRequest=null;return name;};
/** The child picks `name` from offer `id`: the card joins the collection, the offer is resolved, and the binder is told. */
export function chooseOfferCard(id:string,name:string):boolean{
 const offer=read().offers.find(o=>o.id===id);if(!offer||!offer.cards.includes(name))return false;
 addToCollection(name);resolveOffer(id);spotRequest=name;
 window.dispatchEvent(new CustomEvent(CARD_ADDED,{detail:{name}}));
 return true;
}
/** Opens the first pending offer (the binder pill and the tile badge). */
export const openCardOffer=()=>window.dispatchEvent(new CustomEvent(CARD_OFFER_OPEN));
