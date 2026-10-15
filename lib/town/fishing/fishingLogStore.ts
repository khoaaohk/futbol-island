'use client';
/**
 * Browser binding for the fishing content systems (docs/fishing.md "Content systems"): the synced fishing log (fishingLog.ts) in
 * localStorage, the live catch context for the odds (time of day, the day's weather, the lure, legends found), the Fishing Derby
 * clock, and what the HUD / Fishbook show. Event-driven only: no timers here (the derby clock's 1 s tick lives in the HUD and runs
 * only while a derby is on), nothing per frame.
 */
import {useSyncExternalStore} from 'react';
import {FISHING_LOG_KEY,claimMilestones,emptyLog,ensureDay,legendsDue,logCatch,mergeLogs,sanitizeLog,type CatchEffects,type FishingLog,type FloatSkin} from './fishingLog';
import {catchWeights,type CatchContext} from './fishingOdds';
import {WEATHER_PREF_KEY,dayKey,readTimeOfDay,readWeatherOn,weatherForDay,type Weather} from './weather';
import {isLureId,type LureId} from './lures';
import {wouldSetRecord} from './records';
import {DERBY_SECONDS,derbyCatch,derbyTick,startDerby,type DerbyRun} from './derby';
import {FISHBOOK_STORAGE_KEY,sanitizeFishbook,speciesCaught} from './fishingCore';
import {FISH_REQUEST_COINS} from '../../economy';
import {islandJobWallet} from '../jobs/islandWallet';
import {count} from '../../analytics/tracker';
import type {TimeOfDayKey} from './nightFish';

export {WEATHER_PREF_KEY};
const TIME_KEY='fi2-time-of-day';
const server=emptyLog();
let state:FishingLog=server,loaded=false;
const listeners=new Set<()=>void>();
const emit=()=>listeners.forEach(fn=>fn());
const readSaved=():FishingLog=>{try{return sanitizeLog(JSON.parse(localStorage.getItem(FISHING_LOG_KEY)??'null'));}catch{return emptyLog();}};
export function readFishingLog():FishingLog{if(!loaded&&typeof window!=='undefined'){loaded=true;state=readSaved();}return state;}
function write(next:FishingLog){state=next;try{localStorage.setItem(FISHING_LOG_KEY,JSON.stringify(next));}catch{/* full storage: the log stays in memory this visit */}emit();}
/** Re-read, merge with another tab's save, change, write. */
function update(fn:(log:FishingLog)=>FishingLog){write(fn(mergeLogs(readFishingLog(),readSaved())));}
const onStorage=(e:StorageEvent)=>{if(e.key===FISHING_LOG_KEY||e.key===WEATHER_PREF_KEY||e.key===TIME_KEY||e.key===null){loaded=false;readFishingLog();emit();}};
export function subscribeFishingLog(fn:()=>void){listeners.add(fn);if(listeners.size===1&&typeof window!=='undefined')window.addEventListener('storage',onStorage);return()=>{listeners.delete(fn);if(!listeners.size&&typeof window!=='undefined')window.removeEventListener('storage',onStorage);};}
export const useFishingLog=()=>useSyncExternalStore(subscribeFishingLog,readFishingLog,()=>server);

// ---- The live catch context (read once per bite by fishingOdds.catchWeights) ----
export const timeOfDay=():TimeOfDayKey=>readTimeOfDay();
export const weatherOn=()=>readWeatherOn();
export function setWeatherOn(on:boolean){try{localStorage.setItem(WEATHER_PREF_KEY,on?'on':'off');}catch{}weatherKey='';emit();}
let weatherKey='',weatherNow:Weather='clear';
/** Today's weather (clear when switched off). Cheap: recomputed only when the day or the switch changes. */
export function todaysWeather(now=Date.now()):Weather{const k=dayKey(now)+(weatherOn()?'':'-off');if(k!==weatherKey){weatherKey=k;weatherNow=weatherOn()?weatherForDay(dayKey(now)):'clear';}return weatherNow;}
export function liveContext():CatchContext{const log=readFishingLog();return {time:timeOfDay(),weather:todaysWeather(),lure:log.lure,legends:legendsDue(log)};}
/** The live catch roll (Agent A's fishingSession.setCatchRoll): the same weighted pick as fishingCore.rollCatch, through the live
 *  context (night fish, weather, lure, legends). Read once per bite. */
export function liveCatchRoll(spot:Parameters<typeof catchWeights>[0],rand:number,hot:number):string{
 const weighted=Object.entries(catchWeights(spot,hot,liveContext())),total=weighted.reduce((a,[,w])=>a+w,0);let pick=Math.max(0,Math.min(.999999,rand))*total;
 for(const [id,w] of weighted){if(pick<w)return id;pick-=w;}
 return weighted[weighted.length-1][0];
}

// ---- Lures and cosmetics ----
export function chooseLure(id:LureId|null){update(l=>({...l,lure:id&&isLureId(id)&&l.lures.includes(id)?id:null}));if(id)count('fi:lure');}
export function chooseFloat(skin:FloatSkin){update(l=>({...l,float:l.floats.includes(skin)?skin:l.float}));}
export function chooseRod(rod:'standard'|'golden'){update(l=>({...l,rod:rod==='golden'&&l.goldenRod?'golden':'standard'}));}
/** Cosmetics for Agent A's rod and float (fishingVisuals.ts may read these; they never change any odds or values). */
export function fishingCosmetics(){const l=readFishingLog();return {float:l.float,rod:l.rod,lure:l.lure};}

// ---- Records API (Agent A's "RECORD" stamp) ----
/** Ask BEFORE landing: would this catch be the spot's new biggest? */
export const isSpotRecord=(spot:string,size:number)=>wouldSetRecord(readFishingLog().records,spot,size);
let last:{key:number;id:string;spot:string;effects:CatchEffects}|null=null,lastKey=0;
/** What the last landed catch did (rank 1 = new spot record), for the catch card and toasts. */
export const lastCatchEffects=()=>last;

// ---- Derby (C2): in memory while it runs; the best and the points are saved ----
let derby:DerbyRun|null=null;let derbyResult:{score:number;best:boolean;key:number}|null=null;
export const derbyRun=()=>derby;
export const lastDerbyResult=()=>derbyResult;
export function clearDerbyResult(){if(derbyResult){derbyResult=null;emit();}}
export function beginDerby(now=Date.now()){if(derby&&!derby.done)return;derby=startDerby(now);derbyResult=null;count('fi:derby_start');emit();}
export function tickDerby(dt:number){if(!derby||derby.done)return;derby=derbyTick(derby,dt);if(derby.done)finishDerby();else emit();}
export function stopDerby(){if(derby&&!derby.done){derby={...derby,done:true};finishDerby();}}
function finishDerby(){const run=derby!;const prevBest=readFishingLog().derby.best;
 update(l=>({...l,derby:{best:Math.max(l.derby.best,run.score),points:l.derby.points+run.score,played:l.derby.played+1}}));
 derbyResult={score:run.score,best:run.score>prevBest,key:++lastKey};derby=null;count('fi:derby_done');emit();}
export const DERBY_LENGTH=DERBY_SECONDS;

// ---- A catch (from Agent A's event API, see docs/fishing.md "Event API") ----
function fishbookSpecies(){try{return speciesCaught(sanitizeFishbook(JSON.parse(localStorage.getItem(FISHBOOK_STORAGE_KEY)??'null')));}catch{return 0;}}
export function handleCatch(c:{id:string;size:number;spot:string|null},now=Date.now()){
 if(!c.spot)return null;const day=dayKey(now);let effects:CatchEffects|null=null;
 update(l=>{const r=logCatch(l,{id:c.id,size:c.size,spot:c.spot!,now,day,speciesCaught:fishbookSpecies()});effects=r.effects;return r.log;});
 const e=effects as CatchEffects|null;if(!e)return null;
 if(derby&&!derby.done){derby=derbyCatch(derby,c.id);}
 // Requests pay a little through the JOBS wallet (an `island-job:` run: metered by the Training meter, never learning coins).
 for(const q of e.requestsDone){count('fi:request');void islandJobWallet.credit(`island-job:fish-request:${q.id}`,FISH_REQUEST_COINS,`Fishing request · ${q.who}`).catch(()=>{});}
 if(e.legend)count('fi:legend');if(e.rank===1)count('fi:record');if(e.newClues.length)count('fi:clue',e.newClues.length);
 last={key:++lastKey,id:c.id,spot:c.spot,effects:e};emit();return e;
}
/** The Fishbook was opened: claim any milestone already reached (an older save, or a catch logged elsewhere). */
export function refreshMilestones(){const n=fishbookSpecies();const log=readFishingLog(),m=claimMilestones(log,n);if(m.unlocked.length)update(l=>claimMilestones(l,n).log);}
/** Today's request state (rolled over to today). */
export const todaysLog=(now=Date.now())=>ensureDay(readFishingLog(),dayKey(now));

// ---- Wiring to Agent A's Event API (docs/fishing.md "Event API"): one listener for the page, kept across hot updates. ----
import {fishingSession} from './fishingStore';
type HotLog={off?:()=>void};
const hotLog:HotLog=typeof globalThis==='undefined'?{}:((globalThis as {__fi2FishingLog?:HotLog}).__fi2FishingLog??={});
if(typeof window!=='undefined'){
 hotLog.off?.();
 hotLog.off=fishingSession.onFishingEvent(e=>{if(e.type==='catch'&&e.fish&&typeof e.size==='number')handleCatch({id:e.fish,size:e.size,spot:e.spot},e.at);});
 // The lure on the line and the derby flag ride along in the session options (A's event payload carries them too).
 fishingSession.setOptions({lure:readFishingLog().lure});
 fishingSession.setCatchRoll(liveCatchRoll);
 // Leaving the spot ends a running derby (its score still counts). Fires only when the session publishes a new view.
 const offView=fishingSession.subscribe(()=>{if(derby&&!fishingSession.getView().active)stopDerby();});
 const prevOff=hotLog.off;hotLog.off=()=>{prevOff?.();offView();};
}
/** Keep the session's options in step with the chosen lure and the derby. */
subscribeFishingLog(()=>{try{const lure=readFishingLog().lure,derbyOn=!!derby&&!derby.done;const o=fishingSession.options;if(o.lure!==lure||o.derby!==derbyOn)fishingSession.setOptions({lure,derby:derbyOn});}catch{/* no session yet */}});
