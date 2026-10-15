/**
 * The fight (Oct 15 2026, docs/fishing-research.md B1): a tension-and-runs reel that replaces tapping Reel N times.
 * Pure (no React, no three.js, no storage) so tests/fishing-fight.cjs can run it directly; fishingCore.ts steps it while
 * a session is `reeling` and `session.fight` is set (the Easy reel option keeps the old tap-to-reel instead).
 *
 * How it plays:
 * - HOLD Reel to wind in: progress fills and the line's tension rises. LET GO and the tension falls while the fish takes a
 *   little line back (never below zero).
 * - Bigger animals make RUNS to the left or right of the screen. Swipe / drag (or the arrow keys) the OTHER way to turn them
 *   ("jockey the winger": show it the other way). An unturned run piles on tension and steals line.
 * - Too much tension and the fish SLIPS: progress drops back one notch, the tension eases, and the fish tires a little. The
 *   line NEVER snaps and nothing is ever lost. Each slip tires the fish, so even a child who only ever holds lands it.
 * - Only the existing long idle (no holding at all for REEL_IDLE_LIMIT seconds) lets it swim away, with a warning first.
 *
 * Every family fights its own way (Stardew / Dredge's lesson against staleness): crabs and shellfish pull steadily with no runs,
 * slim fish zip, sharks make long strong runs, eels wiggle in quick darts, rays and octopuses are heavy and hug the bottom near
 * the end, billfish leap. Commons never run.
 *
 * Economy (tests/fishing-fight.cjs): a typical child lands each rarity no faster than the old tap-to-reel did, so fishing's
 * coins per minute cannot rise (tests/economy.cjs §3, scripts/economy-sim.cjs assume the old cast time).
 */
import type {FishRarity,FishSpecies} from './fishCatalog';
import {fightProfileFor} from './legendary';

/** `legend`: Agent B's Island Legends (legendary.ts fightProfileFor): three long runs, a leap on each, and on a slip it rests longer. */
export type FightStyle='steady'|'classic'|'zippy'|'runner'|'wiggle'|'heavy'|'leaper'|'legend';
/** The family's fighting style, from the catalogue's group and art shape (no catalogue change needed). */
export function fightStyle(f:Pick<FishSpecies,'group'|'shape'>&{id?:string}):FightStyle{
 if(f.id&&fightProfileFor(f.id)==='legend')return 'legend';
 switch(f.group){
  case 'crab':case 'lobster':case 'shellfish':case 'seahorse':return 'steady';
  case 'shark':return 'runner';
  case 'eel':return 'wiggle';
  case 'ray':case 'octopus':case 'squid':return 'heavy';
  default:break;
 }
 if(f.shape==='billfish')return 'leaper';
 if(f.shape==='slim'||f.shape==='shrimp')return 'zippy';
 return 'classic';
}
/** One word for how each style fights (the Fishbook / hints may show it; never odds). */
export const FIGHT_WORD:Record<FightStyle,string>={steady:'Steady puller',classic:'Strong swimmer',zippy:'Zippy',runner:'Long runs',wiggle:'Wiggly',heavy:'Heavy',leaper:'Leaper',legend:'Legendary'};

/** Seconds of holding (at full reel rate, no runs) to land, by rarity; sharks fight like legendary animals. Size adds up to +30 %. */
export const FIGHT_NEED:Record<FishRarity,number>={common:2.2,uncommon:2.8,rare:3.6,legendary:4.6};
/** Runs per fight by rarity (commons never run). */
export const FIGHT_RUNS:Record<FishRarity,[number,number]>={common:[0,0],uncommon:[0,1],rare:[1,2],legendary:[3,4]};
/** Tension added per second of holding, by rarity (commons stay under the red if simply held). */
export const FIGHT_RISE:Record<FishRarity,number>={common:.2,uncommon:.28,rare:.34,legendary:.38};
/** Per-style tuning: run length (s), the tension an unturned run adds per second, multipliers on need / rise / runs. */
type StyleTune={runLen:[number,number];runPull:number;need:number;rise:number;runs:number;takeBack:number;endSpike:number};
export const STYLE_TUNE:Record<FightStyle,StyleTune>={
 steady:{runLen:[0,0],runPull:0,need:1.15,rise:1,runs:0,takeBack:0,endSpike:1},
 classic:{runLen:[1,1.4],runPull:.55,need:1,rise:1,runs:1,takeBack:1,endSpike:1},
 zippy:{runLen:[.7,1],runPull:.45,need:.95,rise:1,runs:1,takeBack:1,endSpike:1},
 runner:{runLen:[1.7,2.3],runPull:.7,need:1.05,rise:1,runs:1,takeBack:1.2,endSpike:1},
 wiggle:{runLen:[.5,.7],runPull:.5,need:1,rise:1,runs:2,takeBack:1,endSpike:1},
 heavy:{runLen:[1.1,1.5],runPull:.5,need:1.1,rise:1.2,runs:1,takeBack:.8,endSpike:1.6},
 leaper:{runLen:[1,1.3],runPull:.6,need:1,rise:1,runs:1,takeBack:1,endSpike:1},
 legend:{runLen:[1.5,2],runPull:.65,need:1.25,rise:1,runs:1,takeBack:.6,endSpike:1.2},
};
/** Tension lost per second when not holding; tension after a slip; the share of progress a slip takes back (one notch). */
export const FIGHT_FALL=1,SLIP_TENSION=.35,FIGHT_NOTCHES=4;
/** After a slip the fish shakes its head for a moment: holding winds nothing in until it settles (so riding the red never pays). */
export const SLIP_STUN=.9;
/** A legend rests longer after a slip (it never breaks away; B's design: it rests, you continue). */
export const LEGEND_REST=1.5;
/** A legend always makes exactly this many runs, each with a leap. */
export const LEGEND_RUNS=3;
/** Each slip tires the fish: its rise and run pull are multiplied by this (so holding alone always lands it in the end). */
export const SLIP_TIRE=.85;
/** Progress lost per second while the line is slack (the fish takes a little line), by rarity; never below zero. */
export const TAKE_BACK:Record<FishRarity,number>={common:0,uncommon:.025,rare:.04,legendary:.05};
/** Hint thresholds: the arc turns red over STRAIN and calms under EASE (hysteresis, so the HUD updates rarely). */
export const STRAIN=.8,EASE=.6;

export type Run={dir:-1|1;t:number;len:number;turned:boolean};
export type Fight={
 style:FightStyle;rarity:FishRarity;
 /** 0..1 reeled in. */progress:number;
 /** 0..1 line tension (1 = slip). */tension:number;
 holding:boolean;
 /** The player's counter-steer: -1 = swiping left, 1 = right, 0 = none. */steer:-1|0|1;
 run:Run|null;
 /** Progress marks where the next runs start (sorted). */runAt:number[];
 /** Where the fish is pulling, in screen terms (-1 left … 1 right): eases toward a run, back to 0 once turned. Visual only. */side:number;
 need:number;rise:number;runPull:number;takeBack:number;endSpike:number;
 tire:number;slips:number;strained:boolean;runs:number;
 /** Seconds left of a slip's head-shake (no winding). */stun:number;
 /** Seconds spent so far (for tests and the economy check). */time:number;
};
export type FightEvent='run'|'turned'|'slip'|'landed'|'strain'|'ease'|'leap';

const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
export function createFight(f:Pick<FishSpecies,'group'|'shape'|'rarity'|'size'>&{id?:string},sizeCm:number,rand:()=>number):Fight{
 const style=fightStyle(f),tune=STYLE_TUNE[style],rarity:FishRarity=f.group==='shark'?'legendary':f.rarity;
 const k=Math.max(0,Math.min(1,(sizeCm-f.size[0])/Math.max(1e-6,f.size[1]-f.size[0])));
 const [lo,hi]=FIGHT_RUNS[rarity],count=style==='legend'?LEGEND_RUNS:Math.round((lo+Math.floor(rand()*(hi-lo+1)))*tune.runs);
 // Runs are spread through the middle of the fight (never right at the start or the very end).
 const runAt:number[]=[];for(let i=0;i<count;i++)runAt.push(Math.min(.88,.14+(i+.25+rand()*.5)/Math.max(1,count)*.72));
 return {style,rarity,progress:0,tension:.15,holding:false,steer:0,run:null,runAt,side:0,
  need:FIGHT_NEED[rarity]*tune.need*(1+.3*k),rise:FIGHT_RISE[rarity]*tune.rise,runPull:tune.runPull,takeBack:TAKE_BACK[rarity]*tune.takeBack,endSpike:tune.endSpike,
  tire:1,slips:0,strained:false,runs:0,stun:0,time:0};
}
export const setHold=(f:Fight,on:boolean)=>{f.holding=on;};
export const setSteer=(f:Fight,dir:-1|0|1)=>{f.steer=dir;};
/** The way to swipe to turn the current run (opposite to it), or 0. */
export const counterDir=(f:Fight):-1|0|1=>f.run&&!f.run.turned?(-f.run.dir as -1|1):0;

/** Advance the fight by dt seconds. Events: a run starts, a run is turned, a slip, landed, the arc enters / leaves the red. */
export function stepFight(f:Fight,dt:number,rand:()=>number):FightEvent[]{
 const ev:FightEvent[]=[],step=Math.max(0,Math.min(dt,.1));f.time+=step;
 // A run starts when the progress passes its mark (the fish feels the hook coming in).
 if(!f.run&&f.runAt.length&&f.progress>=f.runAt[0]){f.runAt.shift();const [a,b]=STYLE_TUNE[f.style].runLen;f.run={dir:rand()<.5?-1:1,t:0,len:lerp(a,b,rand()),turned:false};f.runs++;ev.push('run');if(f.style==='leaper'||f.style==='legend')ev.push('leap');}
 const run=f.run,countered=!!run&&!run.turned&&f.steer===-run.dir;
 if(run){
  // Countering burns the run out twice as fast; once it is turned, the rest of the run is gentle.
  run.t+=step*(countered?2.2:1);
  if(countered&&!run.turned&&run.t>=run.len*.45){run.turned=true;ev.push('turned');}
  if(run.t>=run.len){if(!run.turned)run.turned=true;f.run=null;}
 }
 const live=f.run&&!f.run.turned?f.run:null,pull=live?f.runPull*f.tire*(countered?.25:1):0;
 const spike=f.progress>.7?f.endSpike:1;
 f.stun=Math.max(0,f.stun-step);
 if(f.stun>0){
  // Shaking its head after a slip: the line eases, nothing winds in, and it takes a little line.
  f.tension-=FIGHT_FALL*.5*step;f.progress-=f.takeBack*step;
 }else if(f.holding){
  f.tension+=(f.rise*f.tire*spike+pull)*step;
  // An unturned run steals most of the winding; a countered one only a little.
  f.progress+=step/f.need*(live?(countered?.75:.3):1);
 }else{
  f.tension-=FIGHT_FALL*step;f.tension+=pull*.5*step;
  f.progress-=(f.takeBack+(live&&!countered?.05:0))*step;
 }
 f.progress=Math.max(0,f.progress);f.tension=Math.max(0,f.tension);
 // Where the fish pulls (visual): out toward an unturned run, back to the middle otherwise.
 const want=live&&!countered?live.dir:0;f.side+=(want-f.side)*Math.min(1,step*(want?2.2:3));
 if(f.tension>=1){
  // A slip: back one notch (never below zero), the line eases, the fish tires. Never a snap.
  f.progress=Math.max(0,f.progress-1/FIGHT_NOTCHES);f.tension=SLIP_TENSION;f.slips++;f.tire*=SLIP_TIRE;f.stun=f.style==='legend'?LEGEND_REST:SLIP_STUN;ev.push('slip');
  if(f.run){f.run.turned=true;f.run=null;}
 }
 if(!f.strained&&f.tension>=STRAIN){f.strained=true;ev.push('strain');}
 else if(f.strained&&f.tension<EASE){f.strained=false;ev.push('ease');}
 if(f.progress>=1){f.progress=1;ev.push('landed');}
 return ev;
}

/** Shape words for the approach silhouette (A2: "read the play"), exported for the Fishbook. */
export type ShadowShape='fish'|'shark'|'ray'|'eel'|'octopus'|'crab';
export function shadowShape(f:Pick<FishSpecies,'shape'|'group'>):ShadowShape{
 const s=f.shape;
 if(s==='shark'||s==='hammerhead')return 'shark';
 if(s==='ray')return 'ray';
 if(s==='eel')return 'eel';
 if(s==='octopus'||s==='squid')return 'octopus';
 if(s==='crab'||s==='lobster'||s==='shell')return 'crab';
 return 'fish';
}
export const SHAPE_WORD:Record<ShadowShape,string>={fish:'Fish-shaped',shark:'Finned',ray:'Wide',eel:'Long and thin',octopus:'Many arms',crab:'Round'};
/** "Finned", "Wide", "Long and thin" … for a species (the Fishbook's not-yet-caught card shows it next to the shadow size). */
export const shadowShapeWord=(f:Pick<FishSpecies,'shape'|'group'>)=>SHAPE_WORD[shadowShape(f)];
