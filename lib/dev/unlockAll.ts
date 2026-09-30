'use client';
/**
 * Developer-only "unlock everything" for local testing (user, Sep 30 2026: "Unlock all items on localhost so I can test").
 * Loaded ONLY by components/DevUnlock.tsx through a dynamic import behind devUnlockGate.ts; every entry point here re-checks
 * the gate, so even a stray call is a no-op on a production build or on any host other than localhost / 127.0.0.1.
 *
 *   http://localhost:8092/?unlock=all              vending items (balls, special balls, rides, island animals, every ready
 *                                                  pop-up book), ride grants, every costume earned, every player card, the
 *                                                  Konbini Collection (food + drink machines), a full Snacks pouch, 50,000 coins
 *        &balls=1                                  also mark all 100 hidden balls found (costume / fox milestones)
 *        &paths=1                                  also finish every path (lesson steps watched + quiz answers correct)
 *        &fish=1                                   also fill the Fishbook with every species
 *        &resetDaily=1                             also clear today's food / drink / job limits
 *   http://localhost:8092/?unlock=reset            confirm, then clear the local save (fresh player)
 *
 * Ownership goes through each system's own store/ledger or its documented save format (never a render-time bypass), so the
 * game behaves exactly as if the player owned everything. Every step is a set union: running it twice changes nothing more.
 * Card packs are consumables (not owned); instead every card they could give is put in the binder.
 */
import {DEV_UNLOCK_TOAST_KEY,devUnlockHostAllowed,devUnlockRequest,showDevToast,stripDevUnlockParams,type DevUnlockRequest} from './devUnlockGate';
import {readVending,VENDING_KEY} from '../town/vendingWallet';
import {sanitizeVending,VENDING_STARTERS} from '../town/vendingLedger';
import {VENDING_ITEMS,VENDING_SPECIALS} from '../town/vendingCatalog';
import {PLAYER_BOOKS,readableBook,type PlayerBookId} from '../books/catalog';
import {READY_BOOKS} from '../books/registry.ids.generated';
import {RIDE_CATEGORIES,RIDE_ORDER,RIDE_GRANTS_KEY,readRideGrants} from '../town/rideUnlocks';
import {COIN_QUEST,COIN_STORAGE_KEY,sanitizeCoinProgress} from '../town/coinQuest';
import {recordCoin} from '../town/coinProgress';
import {ALL_PLAYERS,addToCollection,readCollection,CARD_STORAGE_KEY} from '../town/cardCollection';
import {grantTestingCoins,readArcadeWallet} from '../arcade/arcadeWallet';
import {FORMAT_PATHS} from '../paths/formatPaths';
import {recordQuestStep} from '../town/questProgress';
import {recordCorrectQuizAnswer} from '../town/quizProgress';
import {FOOD_MENU,POUCH_SIZE,pouch,sanitizeKonbini,type FoodPurchase} from '../konbini/food';
import {KONBINI_KEY,markCollected} from '../konbini/foodStore';
import {DRINKS} from '../town/drinkMachines';
import {localPlayDay} from '../town/dailyPlay';
import {FISH} from '../town/fishing/fishCatalog';
import {FISHBOOK_STORAGE_KEY,recordCatch,sanitizeFishbook} from '../town/fishing/fishingCore';
import {JOBS_STORAGE_KEY,localDay,sanitizeJobLedger} from '../town/jobs/jobEconomy';

export const DEV_UNLOCK_TOAST='Dev: everything unlocked';
/** Every save this game keeps in localStorage / sessionStorage starts with one of these (checked against all key constants). */
export const SAVE_KEY_PATTERN=/^(fi2-|fi-|fi\.|futbol-island)/;
/** Stable ids for the dev snacks, so a re-run tops the pouch up instead of adding more. */
const DEV_SNACK_PREFIX='dev-unlock-snack-';
const DEV_SNACKS=['onigiri-salmon','sando-tamago','drink-water'];
const DAY_MS=86_400_000;

export type DevUnlockSummary={ran:boolean;reason?:string;owned:number;books:number;rides:number;cards:number;costumesEarned:boolean;
 coinsGranted:number;balance:number;konbiniCollected:number;pouch:number;balls:number;paths:number;fish:number;resetDaily:boolean};

function allowed():boolean{
 try{return typeof window!=='undefined'&&devUnlockHostAllowed({nodeEnv:process.env.NODE_ENV,hostname:window.location.hostname});}catch{return false;}
}
const json=(key:string)=>{try{return JSON.parse(localStorage.getItem(key)??'null');}catch{return null;}};
const put=(key:string,value:unknown)=>localStorage.setItem(key,JSON.stringify(value));

/** Book item ids that can really be read: the catalog's shelf entries plus every ready PLAYER_BOOKS id (whichever id scheme the
 *  vending ledger uses right now, per machine or per book, the catalog is the source of truth). */
export function devBookIds():string[]{
 const ids=new Set<string>();
 for(const item of VENDING_SPECIALS)if(item.kind==='display'&&readableBook(item))ids.add(item.id);
 for(const id of READY_BOOKS)if(Object.prototype.hasOwnProperty.call(PLAYER_BOOKS,id)){const itemId=PLAYER_BOOKS[id as PlayerBookId].itemId;if(!itemId.startsWith('starter:'))ids.add(itemId);}
 return [...ids];
}
/** Everything the vending ledger can own: gear (balls, special balls, rides), island animals and readable books. Packs are
 *  consumables, and books still being written can't be opened, so neither is granted. */
export function devOwnableIds():string[]{
 const ids=new Set<string>();
 for(const item of [...VENDING_ITEMS,...VENDING_SPECIALS]){
  if(item.kind==='gear'||(item.kind==='costume'&&item.costume&&item.costume!=='none'))ids.add(item.id);
 }
 for(const id of devBookIds())ids.add(id);
 for(const s of VENDING_STARTERS)ids.delete(s);
 return [...ids];
}

function grantVending():{owned:number;books:number}{
 readVending(); // let the ledger run its own first-load migration (and write its save) before we add to it
 const raw=json(VENDING_KEY),parsed=sanitizeVending(raw);
 // A save this code can't read (e.g. a newer ledger version) is left alone rather than overwritten.
 if(raw!==null&&!parsed){console.warn('[dev-unlock] vending save format changed; vending items not granted');return {owned:0,books:0};}
 const saved=parsed??{version:1 as const,owned:[],spend:[],found:[]};
 const want=devOwnableIds(),owned=new Set(saved.owned);let added=0;for(const id of want)if(!owned.has(id)){owned.add(id);added++;}
 if(added)put(VENDING_KEY,{...saved,owned:[...owned]});
 return {owned:want.length,books:devBookIds().length};
}
function grantRides():number{
 const grants=readRideGrants(),before=grants.size;
 for(const c of RIDE_CATEGORIES)for(const id of RIDE_ORDER[c])grants.add(`${c}:${id}`);
 if(grants.size!==before)put(RIDE_GRANTS_KEY,[...grants]);
 return RIDE_CATEGORIES.reduce((n,c)=>n+RIDE_ORDER[c].length,0);
}
/** Every island animal earned (and the Matchday Fox) through the save's own flags, without marking any ball found. */
function earnCostumes(){
 const saved=sanitizeCoinProgress(json(COIN_STORAGE_KEY));
 if(saved.allCostumesUnlocked&&saved.rewardUnlocked)return;
 put(COIN_STORAGE_KEY,{...saved,allCostumesUnlocked:true,rewardUnlocked:true});
}
function findAllBalls():number{
 for(const spot of COIN_QUEST){recordCoin(spot.id,'reveal');recordCoin(spot.id,'collect');}
 return sanitizeCoinProgress(json(COIN_STORAGE_KEY)).collected.length;
}
function grantCards():number{
 for(const name of ALL_PLAYERS)addToCollection(name);
 const saved=json(CARD_STORAGE_KEY);return Array.isArray(saved)?saved.length:readCollection().length;
}
function finishPaths():number{
 for(const path of FORMAT_PATHS)for(const chapter of path.chapters)for(const lesson of chapter.lessons){
  for(let i=0;i<lesson.steps;i++)recordQuestStep(path.format,lesson.id,i);
  for(let i=0;i<lesson.questions;i++)recordCorrectQuizAnswer(path.format,lesson.id,i);
 }
 return FORMAT_PATHS.length;
}
function konbini(now:number):{collected:number;pouch:number}{
 let collected=0;
 for(const id of [...FOOD_MENU.map(f=>f.id),...DRINKS.map(d=>d.id)]){markCollected(id,now);collected++;}
 // Snacks pouch: paid dev snacks dated yesterday, so they never count toward today's "tummy full" limit.
 const s=sanitizeKonbini(json(KONBINI_KEY)),room=POUCH_SIZE-pouch(s).length,added:FoodPurchase[]=[];
 const taken=new Set(s.purchases.map(p=>p.id));let k=0;
 for(let i=0;i<room;i++){while(taken.has(DEV_SNACK_PREFIX+k))k++;const id=DEV_SNACK_PREFIX+k;taken.add(id);
  const item=FOOD_MENU.find(f=>f.id===DEV_SNACKS[i%DEV_SNACKS.length])??FOOD_MENU[i];
  added.push({id,item:item.id,price:item.price,at:now-DAY_MS,paid:true,fate:'pouch'});}
 const next={...s,purchases:[...s.purchases,...added]};if(added.length)put(KONBINI_KEY,next);
 return {collected,pouch:pouch(next).length};
}
function fillFishbook(now:number):number{
 let book=sanitizeFishbook(json(FISHBOOK_STORAGE_KEY));const before=JSON.stringify(book);
 for(const f of FISH)if(!book.species[f.id]?.count)book=recordCatch(book,f.id,(f.size[0]+f.size[1])/2,now).book;
 if(JSON.stringify(book)!==before)put(FISHBOOK_STORAGE_KEY,book);
 return Object.keys(book.species).length;
}
/** Today's Konbini food + drink-machine limits (today's purchases are re-dated to yesterday; the pouch keeps them) and today's
 *  job shift counts (the full/half/tip pay tiers). Lifetime job counts, bests and coins are kept. */
function resetDailyLimits(now:number){
 const today=localPlayDay(now),s=sanitizeKonbini(json(KONBINI_KEY));
 if(s.purchases.some(p=>localPlayDay(p.at)===today))put(KONBINI_KEY,{...s,purchases:s.purchases.map(p=>localPlayDay(p.at)===today?{...p,at:p.at-DAY_MS}:p)});
 const raw=json(JOBS_STORAGE_KEY);if(raw){const day=localDay(now),jobs=sanitizeJobLedger(raw,day);put(JOBS_STORAGE_KEY,{...jobs,day,today:{}});}
}

const EMPTY_SUMMARY:DevUnlockSummary={ran:false,owned:0,books:0,rides:0,cards:0,costumesEarned:false,coinsGranted:0,balance:0,konbiniCollected:0,pouch:0,balls:0,paths:0,fish:0,resetDaily:false};

/** Grants everything (see the header). Idempotent. A no-op off localhost or in a production build. */
export async function runDevUnlockAll(opts:{balls?:boolean;paths?:boolean;fish?:boolean;resetDaily?:boolean}={},now=Date.now()):Promise<DevUnlockSummary>{
 if(!allowed())return {...EMPTY_SUMMARY,reason:'Dev unlock only runs on localhost in a development build.'};
 const out:DevUnlockSummary={...EMPTY_SUMMARY,ran:true};
 if(opts.paths)out.paths=finishPaths();
 const v=grantVending();out.owned=v.owned;out.books=v.books;
 out.rides=grantRides();
 earnCostumes();out.costumesEarned=true;
 if(opts.balls)out.balls=findAllBalls();
 out.cards=grantCards();
 const k=konbini(now);out.konbiniCollected=k.collected;out.pouch=k.pouch;
 if(opts.fish)out.fish=fillFishbook(now);
 if(opts.resetDaily){resetDailyLimits(now);out.resetDaily=true;}
 out.coinsGranted=await grantTestingCoins();
 out.balance=readArcadeWallet().balance;
 return out;
}

/** Clears every save key (localStorage + sessionStorage) and any IndexedDB database on this origin. No-op off localhost. */
export async function devResetSave():Promise<{ran:boolean;removed:string[];databases:string[]}>{
 if(!allowed())return {ran:false,removed:[],databases:[]};
 const removed:string[]=[];
 for(const store of [localStorage,sessionStorage]){
  const keys:string[]=[];for(let i=0;i<store.length;i++){const k=store.key(i);if(k&&SAVE_KEY_PATTERN.test(k))keys.push(k);}
  for(const k of keys){store.removeItem(k);removed.push(k);}
 }
 // The game keeps no IndexedDB today; clear any database on this (localhost-only) origin anyway, so a future one resets too.
 const databases:string[]=[];
 try{const list=typeof indexedDB!=='undefined'&&typeof indexedDB.databases==='function'?await indexedDB.databases():[];
  for(const db of list)if(db.name){indexedDB.deleteDatabase(db.name);databases.push(db.name);}}catch{/* nothing to clear */}
 return {ran:true,removed,databases};
}

/** Entry point from components/DevUnlock.tsx: run the request, then reload without the flags (fresh stores everywhere). */
export async function handleDevUnlock(request?:DevUnlockRequest|null){
 if(!allowed())return;
 const req=request??devUnlockRequest({nodeEnv:process.env.NODE_ENV,hostname:location.hostname,search:location.search});if(!req)return;
 const clean=stripDevUnlockParams(location.href);
 if(req.mode==='reset'){
  if(!window.confirm('Dev reset: clear this browser’s Futbol Island save and start as a fresh player?')){history.replaceState(null,'',clean);return;}
  const r=await devResetSave();console.info('[dev-unlock] reset',r);
  try{sessionStorage.setItem(DEV_UNLOCK_TOAST_KEY,'Dev: save cleared (fresh player)');}catch{}
  location.replace(clean);return;
 }
 showDevToast('Dev: unlocking everything…');
 const summary=await runDevUnlockAll(req);console.info('[dev-unlock]',summary);
 try{sessionStorage.setItem(DEV_UNLOCK_TOAST_KEY,DEV_UNLOCK_TOAST);}catch{}
 location.replace(clean);
}
