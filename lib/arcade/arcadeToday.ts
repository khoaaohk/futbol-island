'use client';
/**
 * "Today in the arcade" in the browser (Nov 10 2026): the device save (ARCADE_TODAY_KEY, in the save-code sync list
 * lib/saves/snapshot.ts), the once-a-day learning coins, the card's hook, the launch request a card row leaves for its cabinet,
 * and the arcade trophies' facts for the Backpack. Rules live in arcadeTodayCore.ts.
 */
import {useSyncExternalStore} from 'react';
import {localPlayDay} from '../town/dailyPlay';
import {createLearnCoins,LEARN_COINS_EARNED} from '../town/learnCoins';
import {creditOnce} from './arcadeWallet';
import {arcadeCabinets} from './arcadeCatalog';
import {EXPERT_SCENARIOS} from '../passPuzzle/expert';
import {readArcadeRecord} from './arcadeRecords';
import {ARCADE_TODAY_KEY,ARCADE_TROPHIES,arcadeTrophiesFrom,emptyToday,markTodayDone,sanitizeToday,todayMet,
 type ArcadeTodaySave,type ArcadeTrophyFacts,type TodayCabinet,type TodayFacts} from './arcadeTodayCore';
export {ARCADE_TODAY_KEY} from './arcadeTodayCore';

export const ARCADE_TODAY_CHANGED='fi2-arcade-today-changed';
const learnCoins=createLearnCoins({creditOnce:(id,game,amount,reason)=>creditOnce(id,game,amount,reason),notify:detail=>{if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent(LEARN_COINS_EARNED,{detail}));}});

export function readArcadeToday():ArcadeTodaySave{try{return sanitizeToday(JSON.parse(localStorage.getItem(ARCADE_TODAY_KEY)??'null'));}catch{return emptyToday();}}
function write(s:ArcadeTodaySave){try{localStorage.setItem(ARCADE_TODAY_KEY,JSON.stringify(s));}catch{/* storage optional */}
 if(typeof window!=='undefined')window.dispatchEvent(new Event(ARCADE_TODAY_CHANGED));}

/**
 * A finished game's facts. When they meet today's challenge for that cabinet: mark it done (lighting the pennant on a third
 * day) and pay LEARN_COINS.arcade through creditOnce (`learn:arcade:<day>:<cabinet>`; a replay or a reload pays 0).
 * Resolves to the coins paid now. Never throws.
 */
export async function noteArcadeToday(f:TodayFacts|null|undefined,now=Date.now()):Promise<number>{
 try{
  noteArcadeTrophies(now);
  if(!f)return 0;const day=localPlayDay(now),cabinet=todayMet(day,f);if(!cabinet)return 0;
  const r=markTodayDone(readArcadeToday(),day,cabinet);if(r.fresh)write(r.save);
  noteArcadeTrophies(now);
  const name=arcadeCabinets.find(c=>c.id===cabinet)?.name??'Arcade';
  return await learnCoins.pay('arcade',`${day}:${cabinet}`,`Today in the arcade: ${name}`);
 }catch{return 0;}
}

/* ---- the card's live view ---- */
let snap='';
function subscribe(fn:()=>void){const on=(e:Event)=>{if(e.type!=='storage'||(e as StorageEvent).key===ARCADE_TODAY_KEY||(e as StorageEvent).key===null)fn();};
 window.addEventListener(ARCADE_TODAY_CHANGED,on);window.addEventListener('storage',on);return()=>{window.removeEventListener(ARCADE_TODAY_CHANGED,on);window.removeEventListener('storage',on);};}
const rawToday=()=>{try{snap=localStorage.getItem(ARCADE_TODAY_KEY)??'';}catch{snap='';}return snap;};
export function useArcadeToday():ArcadeTodaySave{const raw=useSyncExternalStore(subscribe,rawToday,()=>'');try{return sanitizeToday(raw?JSON.parse(raw):null);}catch{return emptyToday();}}

/* ---- launch request: a card row opens its cabinet in the right mode (read once by the game on mount) ---- */
let launch:TodayCabinet|null=null;
export function requestTodayLaunch(c:TodayCabinet){launch=c;}
export function takeTodayLaunch(c:TodayCabinet){if(launch!==c)return false;launch=null;return true;}

/* ---- arcade trophies: facts from the cabinets' own saves (plain reads: no game code is loaded) ---- */
const json=(k:string)=>{try{return JSON.parse(localStorage.getItem(k)??'null');}catch{return null;}};
const n=(v:unknown)=>typeof v==='number'&&Number.isFinite(v)?Math.max(0,v):0;
export const ARCADE_TROPHY_SOURCE_KEYS={runner:'fi2-runner-routes-v1',pinball:'fi2-pinball-tiers-v1',tennis:'fi2-tennis-stars-v1',strikers:'fi2-strikers-tiers-v1',puzzles:'fi2-pass-puzzles-v1'} as const;
const RUNNER_ROUTES=['warmup','classic','night','storm','cup','legend'] as const,LEGEND_CUP_COURT=9;
export function readArcadeTrophyFacts(s=readArcadeToday()):ArcadeTrophyFacts{
 const k=ARCADE_TROPHY_SOURCE_KEYS,runner=json(k.runner),pin=json(k.pinball),tennis=json(k.tennis),str=json(k.strikers),pz=json(k.puzzles);
 const expert=EXPERT_SCENARIOS.map(x=>x.id);
 return {runnerStars:RUNNER_ROUTES.map(id=>n(runner?.v===1?runner.stars?.[id]:0)),pinballFinalGoals:n(pin?.final?.goals),
  tennisLegendCup:Array.isArray(tennis)&&n(tennis[LEGEND_CUP_COURT-1])>=1,strikerLegendWins:n(str?.legend?.wins),
  expertSolved:expert.filter(id=>n(pz?.stars?.[id])>=1).length,expertTotal:expert.length,pennants:s.pennants.length};
}
/** Stamps the first time each trophy's bar is seen met (its shelf date). */
export function noteArcadeTrophies(now=Date.now()){const s=readArcadeToday(),f=readArcadeTrophyFacts(s),fresh=ARCADE_TROPHIES.filter(t=>t.met(f)&&!(t.id in s.trophies));
 if(fresh.length)write({...s,trophies:{...s.trophies,...Object.fromEntries(fresh.map(t=>[t.id,now]))}});}
/** Trophy-shelf sources (backpackStore.ts). */
export function arcadeTrophySources(){if(typeof localStorage==='undefined')return [];const s=readArcadeToday();return arcadeTrophiesFrom(readArcadeTrophyFacts(s),s.trophies);}
/** Whether the Daily Run is open yet (runnerModes.ts isRunnerModeOpen('daily'), read without loading the runner). */
export function dailyRunOpen(){const r=json(ARCADE_TROPHY_SOURCE_KEYS.runner),st=r?.v===1?r.stars:null;return n(st?.warmup)>=1||n(st?.classic)>=1||readArcadeRecord('runner').unlocked>=2;}
