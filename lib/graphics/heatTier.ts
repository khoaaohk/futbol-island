/**
 * Heat passes 4–5 + quality pass: quality tiers, an automatic thermal fallback and the Battery saver setting (docs/performance-guide.md).
 *
 * A throttling iPhone GPU slows down gradually at the same scene load (the Sep 26 recordings: frame medians 51 → 99 ms over ~70 s).
 * The governor therefore reacts to a RISING frame-time trend, not to absolute slowness: the iPhone's normal frame time while flying
 * was ~50 ms even when cool, and stepping down for that only cost quality (the user saw it). It learns a baseline median per tier and
 * scene load and steps down ONE tier when frames stay ≥ 1.3 × that baseline (or become severely slow, p90 ≥ 100 ms), and back up after
 * 75 s of calm (doubling after each relapse, up to 20 min). Battery saver forces the lowest tier.
 *
 * Only phones and tablets are governed; desktop reaches a lower tier only through Battery saver (or a test's forced tier).
 *   tier 0  cool     phones: resolution 1.75 (quality.ts; user decision Sep 26 2026: adaptive 1.75 while cool), 1024² shadows, MSAA,
 *                    30 fps; desktop: uncapped, DPR ≤ 2, 2048². Card film DPR 2.
 *   tier 1  warm     resolution ≤ 1.5 (the previous phone default), shadow map ≤ 1024² (phones start at 1536²), 30 fps on every device
 *   tier 2  hot      resolution ≤ 1.25, card film DPR 1.5
 *   tier 3  hotter   + static water, waves and ferry
 *   tier 4  hottest / Battery saver  + a uniform 24 fps cap
 * No tier may change what is drawn per frame (deploy-4 flashing hotfix): shadows every frame, no distance hiding, resolution ≥ 1.25.
 */
export type HeatTier=0|1|2|3|4;
export type TierSettings={cap30Everywhere:boolean;maxPixelRatio:number;shadowEvery:number;shadowSize:number;npcDrawDistance:number|null;trafficDrawDistance:number|null;staticAmbience:boolean;filmDpr:number;frameMs:number};
const tier=(o:Partial<TierSettings>):TierSettings=>({cap30Everywhere:true,maxPixelRatio:Infinity,shadowEvery:1,shadowSize:2048,npcDrawDistance:null,trafficDrawDistance:null,staticAmbience:false,filmDpr:2,frameMs:1000/30,...o});
export const TIERS:Record<HeatTier,TierSettings>={
 0:tier({cap30Everywhere:false}),
 1:tier({maxPixelRatio:1.5,shadowSize:1024}),
 2:tier({maxPixelRatio:1.25,filmDpr:1.5,shadowSize:1024}),
 3:tier({maxPixelRatio:1.25,filmDpr:1.5,staticAmbience:true,shadowSize:1024}),
 4:tier({maxPixelRatio:1.25,filmDpr:1.5,staticAmbience:true,frameMs:1000/24,shadowSize:1024}),
};
export const LOWEST_TIER:HeatTier=4;

export type GovernorOptions={
 /** Frame budget at 30 fps (ms); samples arrive normalised to it (islandHeat). */budgetMs:number;
 /** Sustained slow windows needed before stepping down (ms). */slowMs:number;
 /** Calm needed before stepping back up (ms); doubles after each flap (a step-down soon after a step-up), up to maxCalmMs. */calmMs:number;maxCalmMs:number;
 /** A step-down within this long after a step-up counts as a flap. */flapMs:number;
 /** Evaluation window (ms). */windowMs:number;
 /** After any change, wait this long before judging again. */dwellMs:number;
 /** Time at a tier + load before its baseline is trusted (ms). */learnMs:number;
 /** Slow when the window median reaches creep × baseline; calm at or below calmRatio × baseline. */creep:number;calmRatio:number;
 /** Severe: p90 interval at or above this is slow regardless of the trend (ms). */severeMs:number;
 /** A baseline older than this is re-learned (ms). */baselineMemoryMs:number;
};
export const DEFAULT_GOVERNOR:GovernorOptions={budgetMs:1000/30,slowMs:12000,calmMs:75000,maxCalmMs:1200000,flapMs:120000,windowMs:2000,dwellMs:10000,learnMs:14000,creep:1.3,calmRatio:1.12,severeMs:100,baselineMemoryMs:300000};

/**
 * Feed one sample per rendered island frame: `interval` = ms since the previous rendered frame, `load` = a scene-load figure (draw
 * calls), `view` = the isolated field id or ''. Gaps over 250 ms (sleep, background, menus) are ignored and restart the window. The
 * scene load is bucketed (~26 % steps); a bucket or view change restarts the slow/calm clocks, and each tier + bucket keeps its own
 * baseline (the lowest window median seen there in the last 5 minutes), so a heavier scene is never mistaken for a hot phone.
 */
export class ThermalGovernor{
 tier:HeatTier=0;changes=0;readonly log:{at:number;tier:HeatTier;reason:string}[]=[];
 private o:GovernorOptions;private intervals:number[]=[];private windowStart=-1;private bucket='';
 private slowFor=0;private calmFor=0;private lastChange=-Infinity;private lastUp=-Infinity;private calmNeeded:number;
 private base=new Map<string,{median:number;at:number;learned:number}>();
 /** Last evaluated window (debug readout). */last={median:0,p90:0,baseline:0,state:'learning' as 'learning'|'calm'|'slow'|'steady'};
 constructor(options:Partial<GovernorOptions>={}){this.o={...DEFAULT_GOVERNOR,...options};this.calmNeeded=this.o.calmMs;}
 get calmRequiredMs(){return this.calmNeeded;}
 /** Returns the new tier when it changed, else -1. `work` is accepted for API compatibility and not judged (the GPU wait is not in it). */
 sample(now:number,interval:number,work:number,load:number,view=''):HeatTier|-1{
  void work;
  if(!(interval>0)||interval>250){this.restart();return -1;}
  const bucket=view+'|'+Math.round(Math.log2(Math.max(0,load)+1)*3);
  if(bucket!==this.bucket){this.bucket=bucket;this.slowFor=this.calmFor=0;this.restart();}
  if(this.windowStart<0)this.windowStart=now;
  this.intervals.push(interval);
  if(now-this.windowStart<this.o.windowMs)return -1;
  const span=now-this.windowStart,sorted=[...this.intervals].sort((x,y)=>x-y),mid=sorted[sorted.length>>1],p90=sorted[Math.floor(sorted.length*.9)];
  this.restart();this.windowStart=now;
  const key=this.tier+'|'+bucket;let entry=this.base.get(key);
  if(!entry||now-entry.at>this.o.baselineMemoryMs){entry={median:mid,at:now,learned:0};this.base.set(key,entry);}
  else if(mid<entry.median){entry.median=mid;entry.at=now;}
  entry.learned+=span;
  const established=entry.learned>=this.o.learnMs,severe=p90>=this.o.severeMs;
  const slow=severe||established&&mid>=entry.median*this.o.creep,calm=established&&!severe&&mid<=entry.median*this.o.calmRatio;
  this.last={median:mid,p90,baseline:entry.median,state:slow?'slow':!established?'learning':calm?'calm':'steady'};
  if(now-this.lastChange<this.o.dwellMs)return -1;
  this.slowFor=slow?this.slowFor+span:0;this.calmFor=calm?this.calmFor+span:0;
  if(this.slowFor>=this.o.slowMs&&this.tier<LOWEST_TIER){
   if(now-this.lastUp<this.o.flapMs)this.calmNeeded=Math.min(this.o.maxCalmMs,this.calmNeeded*2);
   return this.set(now,(this.tier+1) as HeatTier,severe?`severe: p90 ${p90.toFixed(0)} ms`:`throttling: median ${mid.toFixed(0)} ms vs baseline ${entry.median.toFixed(0)} ms`);
  }
  if(this.calmFor>=this.calmNeeded&&this.tier>0){this.lastUp=now;return this.set(now,(this.tier-1) as HeatTier,`calm for ${Math.round(this.calmFor/1000)} s`);}
  return -1;
 }
 private restart(){this.intervals.length=0;this.windowStart=-1;}
 private set(now:number,tier:HeatTier,reason:string){this.tier=tier;this.changes++;this.lastChange=now;this.slowFor=this.calmFor=0;this.log.push({at:now,tier,reason});if(this.log.length>20)this.log.shift();return tier;}
}

/** Shared state: the governor's tier, the Battery saver setting (localStorage, per viewer) and a forced tier for tests. */
const SAVER_KEY='fi2-battery-saver';
type Listener=(tier:HeatTier)=>void;
let governorTier:HeatTier=0,forced:HeatTier|null=null,saver:boolean|null=null;const listeners=new Set<Listener>();
function readSaver(){if(saver===null){try{saver=typeof localStorage!=='undefined'&&localStorage.getItem(SAVER_KEY)==='on';}catch{saver=false;}}return saver;}
export function effectiveTier():HeatTier{return forced??(readSaver()?LOWEST_TIER:governorTier);}
export function tierSettings(){return TIERS[effectiveTier()];}
function emit(){const t=effectiveTier();for(const l of listeners)l(t);}
export function subscribeHeatTier(listener:Listener){listeners.add(listener);return ()=>{listeners.delete(listener);};}
export function setGovernorTier(tier:HeatTier){if(tier===governorTier)return;governorTier=tier;emit();}
export function batterySaverOn(){return readSaver();}
export function setBatterySaver(on:boolean){saver=on;try{if(on)localStorage.setItem(SAVER_KEY,'on');else localStorage.removeItem(SAVER_KEY);}catch{}emit();}
/** Testing hook (window.__fi2.heat.force): null returns control to the governor / saver. */
export function forceHeatTier(tier:HeatTier|null){forced=tier;emit();}
/** Card film canvas DPR cap for the current tier. */
export function filmDprCap(){return tierSettings().filmDpr;}

/** Heat pass 5: VISIBLE levers, prepared but OFF (awaiting the user's decision; before/after sheets in the performance guide).
 *  spectate24     — 24 fps while spectating on phones (watch view, or standing still with live players on screen)
 *  spectateDpr125 — pixel ratio 1.25 while spectating on phones (the camera is static)
 *  fewerAmbient   — 40% fewer ambient townsfolk and ordinary cars drawn on phones (NB: hidden townsfolk also lose their conversations)
 *  lambertScenery — MeshLambert instead of MeshStandard for static buildings/terrain on phones
 * Production reads HEAT_OPTIONS only; development builds may override per page with window.__fiHeatOptions (A/B captures). */
export type HeatOptions={spectate24:boolean;spectateDpr125:boolean;fewerAmbient:boolean;lambertScenery:boolean};
export const HEAT_OPTIONS:HeatOptions={spectate24:false,spectateDpr125:false,fewerAmbient:false,lambertScenery:false};
export function heatOptions():HeatOptions{
 if(typeof process!=='undefined'&&process.env.NODE_ENV!=='production'&&typeof window!=='undefined'){const o=(window as Window&{__fiHeatOptions?:Partial<HeatOptions>}).__fiHeatOptions;if(o)return {...HEAT_OPTIONS,...o};}
 return HEAT_OPTIONS;
}
