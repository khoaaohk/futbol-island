import {useMemo} from 'react';
import {FORMAT_PATHS} from '../paths/formatPaths';
import {pathProgressFrom} from './cardTiers';
import {sanitizeQuestEvidence} from './questModel';
import {QUEST_STORAGE_KEY,useQuestEvidence} from './questProgress';
import {QUIZ_STORAGE_KEY,useQuizCompletions} from './quizProgress';
import {devUnlockHostAllowed} from '../dev/devUnlockGate';

/**
 * Ride unlocks (user, Sep 25 2026): finishing a path unlocks the next ride in every ride category (scooters, bikes, mopeds,
 * flight), whichever path it was; finishing every path opens each category's final ride. Island animals stay on the ball rule
 * (coinQuest.ts) and balls stay free. The one place the rule lives: the store and the customizer ask it for lock state, and
 * Town runs every saved or changed look through enforceRideUnlocks, so the ride button only ever rides an unlocked variant.
 *
 * Mapping, with P paths and n rides in a category: the first ride is the free starter; after N finished paths (N < P) the first
 * N+1 rides are open (never the final one); all P paths open every ride. Today P = 4 and n = 6, so paths 1–3 open rides 2–4 and
 * the fourth path opens rides 5 and 6 (the final).
 *
 * Nothing re-locks: every ride granted is remembered in RIDE_GRANTS_KEY, and the first run also grants whatever ride the save
 * already had equipped in each category (all gear was free before this rule).
 */
export type RideCategory='scooter'|'bike'|'moped'|'jetpack';
export const RIDE_CATEGORIES:RideCategory[]=['scooter','bike','moped','jetpack'];
export const RIDE_CATEGORY_LABELS:Record<RideCategory,string>={scooter:'Scooter',bike:'Bike',moped:'Moped',jetpack:'Flight'};
/** Unlock order per category, starter first, showpiece last. Ids match CUSTOMIZATION_OPTIONS (tests/ride-unlocks.cjs checks). */
export const RIDE_ORDER:Record<RideCategory,string[]>={
 scooter:['classic','coast','sunset','mint','stunt','comet'],          // Street → Coast cruiser → Sunset sport → Mint → Stunt → Comet
 bike:['classic','coast','sunset','bmx','road','mountain'],            // City → Basket cruiser → Trail bike → BMX → Road → Mountain
 moped:['classic','coast','sunset','retro','delivery','sport'],        // Classic → Coast tourer → Sunset racer → Retro → Delivery → Sport
 jetpack:['classic','helicopter','rocketboard','mini-plane','flying-car','ironman'], // Twin jet → Helicopter → Rocket surfboard → Mini airplane → Flying car → Iron Man suit
};
export const PATH_COUNT=FORMAT_PATHS.length;
export const isRideCategory=(key:string):key is RideCategory=>(RIDE_CATEGORIES as string[]).includes(key);
const rideKey=(category:RideCategory,id:string)=>`${category}:${id}`;

/** Paths needed for a ride: its position in the order, except the final ride, which needs every path. -1 = not a ride. */
export function pathsNeeded(category:RideCategory,id:string,total=PATH_COUNT):number{
 const order=RIDE_ORDER[category],index=order.indexOf(id);if(index<0)return -1;
 return index===order.length-1&&index>0?total:Math.min(index,total);
}
/** Pure rule: the ride ids open after `finished` paths (grants excluded), in unlock order. */
export function ridesOpenAt(category:RideCategory,finished:number,total=PATH_COUNT):string[]{
 return RIDE_ORDER[category].filter(id=>pathsNeeded(category,id,total)<=finished);
}
/** Rides newly opened by the `finished`-th path, per category (the unlock toast's list). */
export function ridesOpenedBy(finished:number,total=PATH_COUNT):Record<RideCategory,string[]>{
 return Object.fromEntries(RIDE_CATEGORIES.map(c=>[c,RIDE_ORDER[c].filter(id=>pathsNeeded(c,id,total)===finished&&finished>0)])) as Record<RideCategory,string[]>;
}
/** "2/4 paths finished · next ride unlocks with your next path" */
export function rideProgressLine(finished:number,total=PATH_COUNT):string{
 const done=Math.min(finished,total);
 if(done>=total)return `${total}/${total} paths finished · every ride unlocked`;
 return `${done}/${total} paths finished · ${done===total-1?'final rides unlock with your last path':'next ride unlocks with your next path'}`;
}
/** Locked-ride button copy. */
export const rideLockedLabel=(category:string,id:string)=>{const order=isRideCategory(category)?RIDE_ORDER[category]:[];return order.length>1&&order.indexOf(id)===order.length-1?'Finish every path to unlock':'Finish a path to unlock';};

// ---- Storage -------------------------------------------------------------------------------------------------------------
export const RIDE_GRANTS_KEY='fi2-ride-unlocks-v1';
/** The saved look (customization.ts STORAGE_KEY); read raw on first run so an equipped ride is never taken away. */
const CUSTOMIZATION_KEY='futbol-island-customization-v1';
/** Dev-only preview: `?ridepaths=2` pretends two paths are finished (`?ridepaths=off` goes back). Never granted, never in prod. */
export const RIDE_DEV_KEY='fi2-ride-dev-paths-v1';
function store():Storage|null{try{return typeof localStorage==='undefined'?null:localStorage;}catch{return null;}}
function devPaths():number|null{
 if(process.env.NODE_ENV==='production'||typeof window==='undefined'||!devUnlockHostAllowed({nodeEnv:process.env.NODE_ENV,hostname:window.location?.hostname??''}))return/* QA11: dev flags need localhost too (lib/dev/devUnlockGate.ts) */ null;
 const s=store();if(!s)return null;
 try{
  const value=new URLSearchParams(location.search).get('ridepaths');
  if(value==='off')s.removeItem(RIDE_DEV_KEY);else if(value!==null&&Number.isFinite(Number(value)))s.setItem(RIDE_DEV_KEY,String(Math.max(0,Math.min(PATH_COUNT,Math.round(Number(value))))));
  const saved=s.getItem(RIDE_DEV_KEY);return saved===null?null:Number(saved);
 }catch{return null;}
}
/** Paths fully finished on this device, straight from storage (same "complete" rule as the Paths screen and card tiers). */
export function readFinishedPaths():number{
 const s=store();if(!s)return 0;
 try{
  const steps=new Set(sanitizeQuestEvidence(JSON.parse(s.getItem(QUEST_STORAGE_KEY)??'null')).steps);
  const saved=JSON.parse(s.getItem(QUIZ_STORAGE_KEY)??'[]'),answers=new Set<string>(Array.isArray(saved)?saved.filter((key:unknown):key is string=>typeof key==='string'):[]);
  return pathProgressFrom(steps,answers).finished.length;
 }catch{return 0;}
}
/** Remembered grants. First run seeds them from the rides the save already had equipped (generous migration). */
export function readRideGrants():Set<string>{
 const s=store();if(!s)return new Set();
 try{
  const raw=s.getItem(RIDE_GRANTS_KEY);
  if(raw!==null){const list=JSON.parse(raw);return new Set(Array.isArray(list)?list.filter((v:unknown):v is string=>typeof v==='string'):[]);}
  const saved=JSON.parse(s.getItem(CUSTOMIZATION_KEY)??'null') as Record<string,unknown>|null,grants=new Set<string>();
  if(saved&&typeof saved==='object')for(const c of RIDE_CATEGORIES){const id=saved[c]==='hovercraft'&&c==='jetpack'?'helicopter':saved[c];if(typeof id==='string'&&RIDE_ORDER[c].includes(id))grants.add(rideKey(c,id));}
  s.setItem(RIDE_GRANTS_KEY,JSON.stringify([...grants]));return grants;
 }catch{return new Set();}
}
function remember(grants:Set<string>,finished:number){
 const s=store();if(!s)return;let changed=false;
 for(const c of RIDE_CATEGORIES)for(const id of ridesOpenAt(c,finished)){const k=rideKey(c,id);if(!grants.has(k)){grants.add(k);changed=true;}}
 if(changed)try{s.setItem(RIDE_GRANTS_KEY,JSON.stringify([...grants]));}catch{/* this visit still knows */}
}
export type RideUnlocks={finished:number;total:number;isUnlocked:(category:RideCategory,id:string)=>boolean};
/** Unlock state from a finished-path count plus remembered grants; real progress is written back so it can never re-lock. */
export function rideUnlocksFor(finished:number,grants=readRideGrants(),persist=true):RideUnlocks{
 if(persist)remember(grants,finished);
 return {finished,total:PATH_COUNT,isUnlocked:(c,id)=>pathsNeeded(c,id)===0||grants.has(rideKey(c,id))||(pathsNeeded(c,id)>=0&&pathsNeeded(c,id)<=finished)};
}
/** Current unlocks, read synchronously from storage (saved-look sanitising). */
export function readRideUnlocks():RideUnlocks{const dev=devPaths();return dev!==null?rideUnlocksFor(dev,readRideGrants(),false):rideUnlocksFor(readFinishedPaths());}
export const isRideUnlocked=(category:RideCategory,id:string)=>readRideUnlocks().isUnlocked(category,id);
/** Swaps any locked ride in a look for its category's starter (after sanitizeCustomization; also seeds old-save grants). */
export function enforceRideUnlocks<T extends Record<RideCategory,string>>(value:T,unlocks=readRideUnlocks()):T{
 let next=value;
 for(const c of RIDE_CATEGORIES)if(!unlocks.isUnlocked(c,value[c]))next={...next,[c]:RIDE_ORDER[c][0]};
 return next;
}
/** Reactive finished-path count (the same stores the Paths screen reads). */
export function useFinishedPaths():number{
 const evidence=useQuestEvidence(),answers=useQuizCompletions();
 return useMemo(()=>{const dev=devPaths();return dev??pathProgressFrom(new Set(evidence.steps),answers).finished.length;},[evidence,answers]);
}
/** Reactive unlocks for the store and customizer. */
export function useRideUnlocks():RideUnlocks{
 const finished=useFinishedPaths();
 return useMemo(()=>{const dev=devPaths();return rideUnlocksFor(finished,readRideGrants(),dev===null);},[finished]);
}
