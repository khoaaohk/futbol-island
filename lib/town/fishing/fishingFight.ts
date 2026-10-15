/**
 * The fight (Oct 15 2026, docs/fishing-research.md B1): a tension-and-runs reel that replaces tapping Reel N times.
 * Pure (no React, no three.js, no storage) so tests/fishing-fight.cjs can run it directly; fishingCore.ts steps it while
 * a session is `reeling` and `session.fight` is set (the Easy reel option keeps the old tap-to-reel instead).
 *
 * How it plays (the spin reel, 15 Oct 2026, user: "make it like Pokémon GO where they have to spin"):
 * - SPIN the big reel (a finger going round its centre; Space / Enter is a steady full-rate spin) to wind in: progress fills and the
 *   line's tension rises, both scaled by the spin RATE (0..1 of a "full" spin, about one revolution per FULL_SPIN_S; faster than
 *   full gives nothing extra). STOP and the tension falls while the fish takes a little line back (never below zero).
 * - Bigger animals make RUNS (the shadow darts off to one side). A run means STOP SPINNING AND LET IT TIRE: it ends by time
 *   (sooner while the reel is still, RUN_TIRE), spinning through it piles on tension and steals most of the winding, so it ends in
 *   a slip. The teaching moment: ease off, like the weight of a pass.
 * - Too much tension and the fish SLIPS: progress drops back one notch, the tension eases, and the fish tires a little. The
 *   line NEVER snaps and nothing is ever lost. Each slip tires the fish, so even a child who only ever spins lands it.
 * - Only the existing long idle (no spinning at all for REEL_IDLE_LIMIT seconds) lets it swim away, with a warning first.
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

/** A "full" spin: one revolution of the reel every FULL_SPIN_S seconds is rate 1 (tuned so a 6-year-old reaches it; faster is capped). */
export const FULL_SPIN_S=.7;
/** A run burns out this much faster while the reel is still (stop spinning and let it tire). */
export const RUN_TIRE=1.6;
/** Seconds of spinning at full rate (no runs) to land, by rarity; sharks fight like legendary animals. Size adds up to +30 %. */
export const FIGHT_NEED:Record<FishRarity,number>={common:2.2,uncommon:2.8,rare:3.6,legendary:4.6};
/** Runs per fight by rarity (commons never run). */
export const FIGHT_RUNS:Record<FishRarity,[number,number]>={common:[0,0],uncommon:[0,1],rare:[1,2],legendary:[3,4]};
/** Tension added per second of holding, by rarity (commons stay under the red if simply held). */
export const FIGHT_RISE:Record<FishRarity,number>={common:.2,uncommon:.28,rare:.34,legendary:.38};
/** Per-style tuning: run length (s), the tension a run adds per second while you keep spinning, multipliers on need / rise / runs. */
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
/** Each slip tires the fish: its rise and run pull are multiplied by this (so spinning alone always lands it in the end). */
export const SLIP_TIRE=.85;
/** Progress lost per second while the line is slack (the fish takes a little line), by rarity; never below zero. */
export const TAKE_BACK:Record<FishRarity,number>={common:0,uncommon:.025,rare:.04,legendary:.05};
/** Hint thresholds: the arc turns red over STRAIN and calms under EASE (hysteresis, so the HUD updates rarely). */
export const STRAIN=.8,EASE=.6;

/** `still`: seconds of this run with the reel still (the run tires faster then); it decides "stopped in time" vs "spun through". */
export type Run={dir:-1|1;t:number;len:number;still:number};
export type Fight={
 style:FightStyle;rarity:FishRarity;
 /** 0..1 reeled in. */progress:number;
 /** 0..1 line tension (1 = slip). */tension:number;
 /** The reel is being spun (rate > 0). */holding:boolean;
 /** The spin rate, 0..1 of a full spin (setHold caps it at 1). */rate:number;
 run:Run|null;
 /** Progress marks where the next runs start (sorted). */runAt:number[];
 /** Where the fish is pulling, in screen terms (-1 left … 1 right): eases toward a run, back to 0 after it. Visual only. */side:number;
 need:number;rise:number;runPull:number;takeBack:number;endSpike:number;
 tire:number;slips:number;strained:boolean;runs:number;
 /** Analytics (lib/analytics/fishingEvents.ts, totals only): runs the player stopped spinning for (≥ half the run still) vs spun
  *  through (a slip during a run counts as spun through); the spin rate summed over spinning seconds (rateSum / spinTime = the
  *  average rate while spinning). */
 runsStopped:number;runsSpun:number;rateSum:number;spinTime:number;
 /** Seconds left of a slip's head-shake (no winding). */stun:number;
 /** Seconds spent so far (for tests and the economy check). */time:number;
};
export type FightEvent='run'|'slip'|'landed'|'strain'|'ease'|'leap';

const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
export function createFight(f:Pick<FishSpecies,'group'|'shape'|'rarity'|'size'>&{id?:string},sizeCm:number,rand:()=>number):Fight{
 const style=fightStyle(f),tune=STYLE_TUNE[style],rarity:FishRarity=f.group==='shark'?'legendary':f.rarity;
 const k=Math.max(0,Math.min(1,(sizeCm-f.size[0])/Math.max(1e-6,f.size[1]-f.size[0])));
 const [lo,hi]=FIGHT_RUNS[rarity],count=style==='legend'?LEGEND_RUNS:Math.round((lo+Math.floor(rand()*(hi-lo+1)))*tune.runs);
 // Runs are spread through the middle of the fight (never right at the start or the very end).
 const runAt:number[]=[];for(let i=0;i<count;i++)runAt.push(Math.min(.88,.14+(i+.25+rand()*.5)/Math.max(1,count)*.72));
 return {style,rarity,progress:0,tension:.15,holding:false,rate:0,run:null,runAt,side:0,
  need:FIGHT_NEED[rarity]*tune.need*(1+.3*k),rise:FIGHT_RISE[rarity]*tune.rise,runPull:tune.runPull,takeBack:TAKE_BACK[rarity]*tune.takeBack,endSpike:tune.endSpike,
  tire:1,slips:0,strained:false,runs:0,runsStopped:0,runsSpun:0,rateSum:0,spinTime:0,stun:0,time:0};
}
/** The reel is spun at `rate` (0..1 of a full spin; capped at 1, so spinning faster than full gives nothing extra) or let go. */
export const setHold=(f:Fight,on:boolean,rate=1)=>{const r=on?Math.max(0,Math.min(1,Number.isFinite(rate)?rate:0)):0;f.rate=r;f.holding=r>0;};
/** A run is on (the moment to stop spinning). */
export const running=(f:Fight)=>!!f.run;

/** Advance the fight by dt seconds. Events: a run starts, a slip, landed, the arc enters / leaves the red. */
export function stepFight(f:Fight,dt:number,rand:()=>number):FightEvent[]{
 const ev:FightEvent[]=[],step=Math.max(0,Math.min(dt,.1));f.time+=step;
 // A run starts when the progress passes its mark (the fish feels the hook coming in).
 if(!f.run&&f.runAt.length&&f.progress>=f.runAt[0]){f.runAt.shift();const [a,b]=STYLE_TUNE[f.style].runLen;f.run={dir:rand()<.5?-1:1,t:0,len:lerp(a,b,rand()),still:0};f.runs++;ev.push('run');if(f.style==='leaper'||f.style==='legend')ev.push('leap');}
 const rate=f.holding?f.rate:0;
 if(f.run){
  // A run ends by time: sooner while the reel is still (let it tire), at its own pace while you keep spinning.
  if(rate>0)f.run.t+=step;else{f.run.t+=step*RUN_TIRE;f.run.still+=step*RUN_TIRE;}
  if(f.run.t>=f.run.len){if(f.run.still>=f.run.t*.5)f.runsStopped++;else f.runsSpun++;f.run=null;}
 }
 if(rate>0){f.rateSum+=rate*step;f.spinTime+=step;}
 const live=f.run,pull=live?f.runPull*f.tire:0;
 const spike=f.progress>.7?f.endSpike:1;
 f.stun=Math.max(0,f.stun-step);
 if(f.stun>0){
  // Shaking its head after a slip: the line eases, nothing winds in, and it takes a little line.
  f.tension-=FIGHT_FALL*.5*step;f.progress-=f.takeBack*step;
 }else if(rate>0){
  // Winding and the tension both scale with the spin rate; a run's pull piles on while you keep spinning through it.
  f.tension+=(f.rise*f.tire*spike*rate+pull)*step;
  // A run steals most of the winding.
  f.progress+=step/f.need*rate*(live?.3:1);
 }else{
  f.tension-=FIGHT_FALL*step;f.tension+=pull*.5*step;
  f.progress-=(f.takeBack+(live?.05:0))*step;
 }
 f.progress=Math.max(0,f.progress);f.tension=Math.max(0,f.tension);
 // Where the fish pulls (visual): out toward a run, back to the middle otherwise.
 const want=live?live.dir:0;f.side+=(want-f.side)*Math.min(1,step*(want?2.2:3));
 if(f.tension>=1){
  // A slip: back one notch (never below zero), the line eases, the fish tires. Never a snap.
  f.progress=Math.max(0,f.progress-1/FIGHT_NOTCHES);f.tension=SLIP_TENSION;f.slips++;f.tire*=SLIP_TIRE;f.stun=f.style==='legend'?LEGEND_REST:SLIP_STUN;ev.push('slip');
  if(f.run){f.runsSpun++;f.run=null;}
 }
 if(!f.strained&&f.tension>=STRAIN){f.strained=true;ev.push('strain');}
 else if(f.strained&&f.tension<EASE){f.strained=false;ev.push('ease');}
 if(f.progress>=1){f.progress=1;ev.push('landed');}
 return ev;
}

/** What a finished fight looked like, for analytics (totals only, lib/analytics/fishingEvents.ts): slips, runs stopped vs spun
 *  through, the average spin rate while spinning (0..1) and the seconds it took. */
export type FightStats={slips:number;runsStopped:number;runsSpun:number;spinAvg:number;time:number};
export const fightStats=(f:Fight):FightStats=>({slips:f.slips,runsStopped:f.runsStopped,runsSpun:f.runsSpun,spinAvg:f.spinTime>0?f.rateSum/f.spinTime:0,time:f.time});

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
