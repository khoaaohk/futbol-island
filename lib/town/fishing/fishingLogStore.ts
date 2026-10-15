'use client';
/**
 * Browser binding for the fishing content systems (docs/fishing.md "Content systems"): the synced fishing log (fishingLog.ts) in
 * localStorage, the live catch context for the odds (time of day, the lure, legends found), and what the HUD / Fishbook show.
 * Event-driven only: no timers here, nothing per frame. (The derby clock, photo mode, the record boards and the weather were removed
 * on 15 Oct 2026: user decision, "too complicated".)
 */
import {useSyncExternalStore} from 'react';
import {FISHING_LOG_KEY,claimMilestones,emptyLog,ensureDay,legendsDue,logCatch,mergeLogs,sanitizeLog,type CatchEffects,type FishingLog,type FloatSkin} from './fishingLog';
import {catchWeights,type CatchContext} from './fishingOdds';
import {TIME_KEY,dayKey,readTimeOfDay} from './timeOfDay';
import {isLureId,type LureId} from './lures';
import {FISHBOOK_STORAGE_KEY,sanitizeFishbook,speciesCaught} from './fishingCore';
import {FISH_REQUEST_COINS} from '../../economy';
import {islandJobWallet} from '../jobs/islandWallet';
import {count} from '../../analytics/tracker';
import {countLureChosen,wireFishingAnalytics} from '../../analytics/fishingEvents';
import type {TimeOfDayKey} from './nightFish';

const server=emptyLog();
let state:FishingLog=server,loaded=false;
const listeners=new Set<()=>void>();
const emit=()=>listeners.forEach(fn=>fn());
const readSaved=():FishingLog=>{try{return sanitizeLog(JSON.parse(localStorage.getItem(FISHING_LOG_KEY)??'null'));}catch{return emptyLog();}};
export function readFishingLog():FishingLog{if(!loaded&&typeof window!=='undefined'){loaded=true;state=readSaved();}return state;}
function write(next:FishingLog){state=next;try{localStorage.setItem(FISHING_LOG_KEY,JSON.stringify(next));}catch{/* full storage: the log stays in memory this visit */}emit();}
/** Re-read, merge with another tab's save, change, write. */
function update(fn:(log:FishingLog)=>FishingLog){write(fn(mergeLogs(readFishingLog(),readSaved())));}
const onStorage=(e:StorageEvent)=>{if(e.key===FISHING_LOG_KEY||e.key===TIME_KEY||e.key===null){loaded=false;readFishingLog();emit();}};
export function subscribeFishingLog(fn:()=>void){listeners.add(fn);if(listeners.size===1&&typeof window!=='undefined')window.addEventListener('storage',onStorage);return()=>{listeners.delete(fn);if(!listeners.size&&typeof window!=='undefined')window.removeEventListener('storage',onStorage);};}
export const useFishingLog=()=>useSyncExternalStore(subscribeFishingLog,readFishingLog,()=>server);

// ---- The live catch context (read once per bite by fishingOdds.catchWeights) ----
export const timeOfDay=():TimeOfDayKey=>readTimeOfDay();
export function liveContext():CatchContext{const log=readFishingLog();return {time:timeOfDay(),lure:log.lure,legends:legendsDue(log)};}
/** The live catch roll (fishingSession.setCatchRoll): the same weighted pick as fishingCore.rollCatch, through the live context
 *  (night fish, the lure, legends). Read once per bite. */
export function liveCatchRoll(spot:Parameters<typeof catchWeights>[0],rand:number,hot:number):string{
 const weighted=Object.entries(catchWeights(spot,hot,liveContext())),total=weighted.reduce((a,[,w])=>a+w,0);let pick=Math.max(0,Math.min(.999999,rand))*total;
 for(const [id,w] of weighted){if(pick<w)return id;pick-=w;}
 return weighted[weighted.length-1][0];
}

// ---- Lures and cosmetics ----
/** Put a lure on the line (or none). Every lure is free and can be changed at any moment: it takes effect at the next bite. */
export function chooseLure(id:LureId|null){const next=id&&isLureId(id)?id:null;update(l=>({...l,lure:next}));countLureChosen(next);}
export function chooseFloat(skin:FloatSkin){update(l=>({...l,float:l.floats.includes(skin)?skin:l.float}));}
export function chooseRod(rod:'standard'|'golden'){update(l=>({...l,rod:rod==='golden'&&l.goldenRod?'golden':'standard'}));}
/** Cosmetics for the rod and float (fishingVisuals.ts may read these; they never change any odds or values). */
export function fishingCosmetics(){const l=readFishingLog();return {float:l.float,rod:l.rod,lure:l.lure};}

let last:{key:number;id:string;spot:string;effects:CatchEffects}|null=null,lastKey=0;
/** What the last landed catch did (a request finished, a reward, a legend's clue or release), for the HUD's toast. */
export const lastCatchEffects=()=>last;

// ---- A catch (from the event API, see docs/fishing.md "Event API") ----
function fishbookSpecies(){try{return speciesCaught(sanitizeFishbook(JSON.parse(localStorage.getItem(FISHBOOK_STORAGE_KEY)??'null')));}catch{return 0;}}
export function handleCatch(c:{id:string;size:number;spot:string|null},now=Date.now()){
 if(!c.spot)return null;const day=dayKey(now);let effects:CatchEffects|null=null;
 update(l=>{const r=logCatch(l,{id:c.id,size:c.size,spot:c.spot!,now,day,speciesCaught:fishbookSpecies()});effects=r.effects;return r.log;});
 const e=effects as CatchEffects|null;if(!e)return null;
 // Requests pay a little through the JOBS wallet (an `island-job:` run: metered by the Training meter, never learning coins).
 for(const q of e.requestsDone){count('fi:request');void islandJobWallet.credit(`island-job:fish-request:${q.id}`,FISH_REQUEST_COINS,`Fishing request · ${q.who}`).catch(()=>{});}
 if(e.legend)count('fi:legend');if(e.newClues.length)count('fi:clue',e.newClues.length);
 last={key:++lastKey,id:c.id,spot:c.spot,effects:e};emit();return e;
}
/** The Fishbook was opened: claim any milestone already reached (an older save, or a catch logged elsewhere). */
export function refreshMilestones(){const n=fishbookSpecies();const log=readFishingLog(),m=claimMilestones(log,n);if(m.unlocked.length)update(l=>claimMilestones(l,n).log);}
/** Today's request state (rolled over to today). */
export const todaysLog=(now=Date.now())=>ensureDay(readFishingLog(),dayKey(now));

// ---- Wiring to the Event API (docs/fishing.md "Event API"): one listener for the page, kept across hot updates. ----
import {fishingSession} from './fishingStore';
type HotLog={off?:()=>void};
const hotLog:HotLog=typeof globalThis==='undefined'?{}:((globalThis as {__fi2FishingLog?:HotLog}).__fi2FishingLog??={});
if(typeof window!=='undefined'){
 hotLog.off?.();
 hotLog.off=fishingSession.onFishingEvent(e=>{if(e.type==='catch'&&e.fish&&typeof e.size==='number')handleCatch({id:e.fish,size:e.size,spot:e.spot},e.at);});
 // The lure on the line rides along in the session options (the event payload carries it too).
 fishingSession.setOptions({lure:readFishingLog().lure});
 fishingSession.setCatchRoll(liveCatchRoll);
 wireFishingAnalytics(fishingSession);// admin analytics (lib/analytics/fishingEvents.ts): fights, outcomes, runs, slips, spin rate; totals only
}
/** Keep the session's options in step with the chosen lure. */
subscribeFishingLog(()=>{try{const lure=readFishingLog().lure;if(fishingSession.options.lure!==lure)fishingSession.setOptions({lure});}catch{/* no session yet */}});
