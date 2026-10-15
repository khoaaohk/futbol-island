/**
 * Live fishing session: the bridge between the 3D island (lib/town/fishing/fishingWorld.ts, stepped by the island loop)
 * and the small HUD (components/FishingHost.tsx). The HUD sends commands (start / tap / hold / spin / stop); the world steps
 * the pure rules (./fishingCore.ts, the fight in ./fishingFight.ts) each frame while a session is active and publishes a view
 * snapshot ONLY when something the HUD shows changes (phase, hint, a run starting …), so React never re-renders per frame.
 * The fight's continuous values (tension, progress) are read by the world through `fightMeter` and written straight onto the
 * HUD as CSS variables. Sounds reuse the island sound system's document cues (no new audio context).
 *
 * ---- EVENT API (Oct 15 2026; also in docs/fishing.md "Event API") ----
 * For content features (requests, legends, lures, night fish …) that must react to fishing without touching
 * the HUD or the world:
 *
 *   import {fishingSession} from './fishingStore';           // the one live session (or onFishingEvent from fishingStore)
 *   const off=fishingSession.onFishingEvent(e=>{ … });       // returns an unsubscribe
 *
 *   e: FishingEvent = {type, fish, size, spot, at, …}
 *     type  'cast'    a cast starts (fish/size null)
 *           'nibble'  a nibble on the float (fish/size known internally; do not reveal them)
 *           'bite'    the real bite: the reaction window opens
 *           'hook'    the player hooked it (the spin fight starts)
 *           'run'     the fish makes a run during the fight (`dir` -1 left / 1 right on screen): stop spinning and let it tire
 *           'slip'    too much tension: it slipped back a notch (never lost)
 *           'warn'    the line twang before an idle escape
 *           'catch'   landed: also `isNew`, `isBiggest` (a new size record for that species), `inBasket`, and `fight` (the
 *                     spin fight's stats, fishingFight.ts FightStats)
 *           'escape'  it swam off: `how` 'scared' (tapped on a nibble) or 'escaped' (too late / idle); `hooked` says whether
 *                     it had been hooked (an idle escape from the fight: `fight` stats ride along too)
 *     fish  species id (FishId) or null;  size  cm or null;  spot  spot id or null;  at  Date.now() ms
 *     also  rarity, shadow (size class), lure (the options at the time), hot ('calm'|'hot'|'spooked' water)
 *   Listeners run synchronously inside the island loop or a HUD handler: keep them small (no React state per frame; they only
 *   fire on these discrete beats). A throwing listener is caught and ignored.
 *
 *   fishingSession.options                  {lure} (read-only snapshot)
 *   fishingSession.setOptions({lure:'panenka'})   lure id or null
 *   fishingSession.setCatchRoll(fn|null)    replace the internal catch roll: fn(spot, rand 0..1, hot 0..1) => FishId (must
 *                                           live at the spot). Use it for lures / night fish (keep it EV-neutral, see
 *                                           docs/fishing-research.md §4). The world passes options.lure to
 *                                           fishingCore's SessionOptions too.
 *   Shape words for the Fishbook: shadowShapeWord(f) in ./fishingFight.ts; size in football units: sizeCompare(cm) in
 *   ./fishingCard.ts; rarity icons: components/RarityStars.tsx (RARITY_STARS in ./fishingCard.ts); the local best size per
 *   species: bestSize(id) in ./fishingStore.ts (the Fishbook's `biggest`).
 */
import {createSession,tapSession,type Session,type SessionEvent,type SessionPhase} from './fishingCore';
import {KEEPER_LESSONS,fishById,spotById,type FishId,type FishSpot,type FishRarity,type ShadowSize} from './fishCatalog';
import {countSummitFishCatch} from '../../analytics/summitEvents';
import {HOTSPOT_HINT,READ_WATER_HINT,SPOOKED_HINT} from './fishingAim';
import {fightStats,running,setHold,type FightStats,FULL_SPIN_S} from './fishingFight';

export type CatchView={id:FishId;size:number;isNew:boolean;isBiggest:boolean;inBasket:boolean};
export type FishingView={active:boolean;spotId:string|null;phase:SessionPhase;hint:string;lesson:{title:string;text:string;key:number}|null;caught:CatchView|null;catches:number;
 /** Where the last cast landed (Oct 14 2026, aimed casting): on a hotspot / in spooked water (hint text only, never odds). */
 water:'calm'|'hot'|'spooked';
 /** Oct 15 2026: the tension fight is on (spin the reel); `run` the fish is making a run (stop spinning and let it tire);
  *  `strain` the arc is in the red; `slips` how many times it slipped back; `warn` the idle warning is showing. */
 fight:boolean;run:boolean;strain:boolean;slips:number;warn:boolean};
/** Aim input from the HUD (Oct 14 2026): a screen point on the water (normalised device coordinates, the world turns it into a
 *  landing), or a polar aim (u −1..1 across, v 0..1 near→far) from the Cast-button drag and the arrow keys. */
export type AimInput={kind:'screen';x:number;y:number}|{kind:'polar';u:number;v:number;
 /** Keyboard power: `performance.now()` when Space went down; the world grows the distance while it is held (aimCharge). */
 charge?:number};
/** How far a held Space throws (0..1 of the aim area) after `heldMs`: a short tap is short, about 1.2 s is the full cast. */
export const aimCharge=(heldMs:number)=>Math.max(.15,Math.min(1,.15+Math.max(0,heldMs)/1200*.85));
const HINTS:Record<SessionPhase,string>={
 ready:'Drag on the water to aim, or tap Cast. '+READ_WATER_HINT,
 casting:'Casting…',
 floating:'Watch the water for a fish shadow…',
 approach:'A fish is coming. Stay still…',
 nibble:'Nibbles… wait for the big splash!',
 bite:'Now! Reel it in!',
 reeling:'Keep tapping Reel! Bigger animals need more pulls.',
 scared:'Too early! It swam off. Another fish will come.',
 escaped:'Too late, it got away. Stay ready.',
 caught:'Nice catch! Keep fishing or stop.',
};
const IDLE:FishingView={active:false,spotId:null,phase:'ready',hint:'',lesson:null,caught:null,catches:0,water:'calm',fight:false,run:false,strain:false,slips:0,warn:false};
/** The waiting hint for the water the float landed in. */
const floatHint=(w:FishingView['water'])=>w==='spooked'?SPOOKED_HINT:w==='hot'?HOTSPOT_HINT:HINTS.floating;
/** While a big animal pulls back (the keeper link: hold on to the ball after a save so nobody scores the rebound). */
/** The fight's one-line hints (the spin reel, 15 Oct 2026), with the football link: the weight of a pass. */
export const FIGHT_HINT='Spin the reel to wind it in. Ease off in the red!';
export const STRAIN_HINT='Too tight! Ease off, like the weight of a pass.';
export const RUN_HINT='It runs! Stop spinning and let it tire.';
export const SLIP_HINT='It slipped back a bit. Ease off, then spin again.';
/** An Island Legend (Agent B, legendary.ts) rests after a slip instead. */
export const LEGEND_REST_HINT='The legend is resting. Ease off, then spin again.';
/** A5: the warning before an idle escape. */
export const WARN_HINT='It\'s getting away, keep reeling!';

export type FishCue='tick'|'splash'|'plunge'|'cast'|'fanfare'|'reel'|'twang'|'slip'|'run';
export type FishingEventType='cast'|'nibble'|'bite'|'hook'|'run'|'slip'|'warn'|'catch'|'escape';
export type FishingEvent={type:FishingEventType;fish:FishId|null;size:number|null;spot:string|null;at:number;
 rarity:FishRarity|null;shadow:ShadowSize|null;lure:string|null;hot:FishingView['water'];
 dir?:-1|1;isNew?:boolean;isBiggest?:boolean;inBasket?:boolean;how?:'scared'|'escaped';hooked?:boolean;fight?:FightStats};
export type FishingOptions={lure:string|null};
/** The angler's cosmetics and the night glow (Agent B: fishingLogStore.fishingCosmetics, waterMood.moodParams): looks only. */
export type FishingLook={floatColor:string|null;goldenRod:boolean;floatGlow:number};
export type CatchRoll=(spot:FishSpot,rand:number,hot:number)=>FishId;
const SHADOW_STEP:Record<ShadowSize,number>={small:0,medium:1,large:2,huge:3,giant:4};
/** The spin rate holds for SPIN_HOLD_MS after the last pointer move (touch events are ~16 ms apart), then fades out over SPIN_FADE_MS. */
export const SPIN_HOLD_MS=140,SPIN_FADE_MS=220;
/** The reel's ratchet (Oct 15 2026, user: "when spinning the cast, add a sound for the turning it"): one click every 1/SPIN_CLICKS_PER_REV of a
 *  revolution at the current spin rate (a held Space counts as a full spin), through the existing `reel` cue. Nothing while still. */
export const SPIN_CLICKS_PER_REV=4;

type Lander=(id:FishId,size:number)=>Omit<CatchView,'id'|'size'>;
export function createFishingSession(land:Lander,cue:(kind:FishCue,strength?:number)=>void=()=>{}){
 let view=IDLE,session:Session=createSession(),pending:string|null=null,stopRequested=false,lessonKey=0,tapEvents:SessionEvent[]=[];const shown=new Set<string>();
 let paused=false,aimInput:AimInput|null=null,aimCast:AimInput|null=null,water:FishingView['water']='calm';
 let options:FishingOptions={lure:null},roll:CatchRoll|null=null,fightHint:string|null=null;
 // The spin input (the HUD's pointer circles): the last rate and when it came; a steady hold (Space / Enter) is rate 1.
 let spinRate=0,spinAt=0,held=false,hooked=false;
 let clickAt=0,clickAcc=0;
 /** The ratchet: advance the virtual spool by rate × dt and click on each 1/SPIN_CLICKS_PER_REV turn (bounded: dt is capped). */
 function ratchet(now:number){const r=held?1:spinRate;if(r<=0||!session.fight){clickAt=0;clickAcc=0;return;}if(!clickAt){clickAt=now;return;}
  const dt=Math.min(.1,Math.max(0,(now-clickAt)/1000));clickAt=now;clickAcc+=r*dt/FULL_SPIN_S*SPIN_CLICKS_PER_REV;let n=0;while(clickAcc>=1&&n<2){clickAcc-=1;n++;cue('reel',r);}if(clickAcc>=1)clickAcc=0;}
 let lookRev=0,look:FishingLook={floatColor:null,goldenRod:false,floatGlow:0};
 const listeners=new Set<()=>void>(),eventListeners=new Set<(e:FishingEvent)=>void>();
 const publish=(patch:Partial<FishingView>)=>{view={...view,...patch};listeners.forEach(f=>f());};
 const lesson=(k:keyof typeof KEEPER_LESSONS,always=false)=>{if(!always&&shown.has(k))return view.lesson;shown.add(k);const l=KEEPER_LESSONS[k];return {title:l.title,text:l.text,key:++lessonKey};};
 /** Tell the content listeners (requests, legends, lures …). Never throws into the loop. */
 function emit(type:FishingEventType,extra:Partial<FishingEvent>={}){
  if(!eventListeners.size)return;
  const f=session.fish,sp=f?fishById(f.id):undefined;
  const e:FishingEvent={type,fish:f?.id??null,size:f?.size??null,spot:view.spotId,at:Date.now(),rarity:sp?.rarity??null,shadow:sp?.shadow??null,lure:options.lure,hot:water,...extra};
  for(const fn of [...eventListeners]){try{fn(e);}catch{/* a listener never breaks fishing */}}
 }
 /** The hint for the current moment. */
 const hintFor=(caught:CatchView|null)=>{const ph=session.phase;
  if(ph==='caught'&&caught)return `${fishById(caught.id)?.name}! Keep fishing or stop.`;
  if(ph==='reeling'&&session.warned)return WARN_HINT;
  if(ph==='reeling'&&session.fight){if(running(session.fight))return RUN_HINT;if(session.fight.strained)return STRAIN_HINT;return fightHint??FIGHT_HINT;}
  if(ph==='floating'||ph==='approach'&&water==='spooked')return floatHint(water);
  return HINTS[ph];};
 /** Apply events from a step or a tap: sounds, landing the fish, the content events and the snapshot. */
 function handle(events:(SessionEvent|null)[]){
  let lessonNext=view.lesson,caught=view.caught,catches=view.catches;
  for(const e of events){
   if(e==='cast'){cue('cast');fightHint=null;emit('cast');}
   if(e==='reel')cue('reel');
   if(e==='splash'){cue('splash');lessonNext=lesson('cast');}
   if(e==='nibble'){cue('tick');if(session.nibbles===1)lessonNext=lesson('nibble');emit('nibble');}
   // A1: the bite's pulse grows with the shadow (small 14 ms … giant 30 ms).
   if(e==='bite'){const f=session.fish?fishById(session.fish.id):undefined;cue('plunge',f?SHADOW_STEP[f.shadow]:0);emit('bite');}
   if(e==='scared'){lessonNext=lesson('scared',true);emit('escape',{how:'scared',hooked:false});}
   if(e==='escaped'){lessonNext=lesson('escaped',true);emit('escape',{how:'escaped',hooked,...(hooked&&session.lastFight?{fight:fightStats(session.lastFight)}:{})});hooked=false;}
   if(e==='warn'){cue('twang');emit('warn');}
   if(e==='run'){cue('run');fightHint=null;const r=session.fight?.run;emit('run',r?{dir:r.dir}:{});}
   if(e==='slip'){cue('slip');fightHint=session.fight?.style==='legend'?LEGEND_REST_HINT:SLIP_HINT;emit('slip');}
   if(e==='hooked'&&session.fish){const f=session.fish;caught={id:f.id,size:f.size,...land(f.id,f.size)};catches++;cue('fanfare');countSummitFishCatch(view.spotId);
    emit('catch',{isNew:caught.isNew,isBiggest:caught.isBiggest,inBasket:caught.inBasket,...(session.lastFight?{fight:fightStats(session.lastFight)}:{})});hooked=false;}
   if(e==='cast')caught=null;
  }
  // The fight's arc is CSS written by the
  // world (fightMeter), so the HUD never re-renders per frame: only these discrete fields are compared.
  const ph=session.phase,fight=ph==='reeling'&&!!session.fight;
  const run=fight&&running(session.fight!),strain=fight&&session.fight!.strained,slips=fight?session.fight!.slips:0,warn=ph==='reeling'&&session.warned,hint=hintFor(caught);
  if(view.phase!==ph||lessonNext!==view.lesson||caught!==view.caught||view.fight!==fight||view.run!==run||view.strain!==strain||view.slips!==slips||view.warn!==warn||view.hint!==hint)
   publish({phase:ph,hint,lesson:lessonNext,caught,catches,water,fight,run,strain,slips,warn});
 }
 /** Push the effective rate (a held key is a full spin; else the finger's fading rate) into the fight; spinning resets the idle clock. */
 function applySpin(){if(!view.active||paused||!session.fight)return;const rate=held?1:spinRate;setHold(session.fight,rate>0,rate);if(rate>0){session.reelIdle=0;if(session.warned){session.warned=false;handle([]);}}}
 return {
  getView:()=>view,
  get paused(){return paused;},
  pause(value:boolean){paused=value;if(value){held=false;spinRate=0;if(session.fight)setHold(session.fight,false);}},
  subscribe:(fn:()=>void)=>{listeners.add(fn);return()=>{listeners.delete(fn);};},
  // ---- the event API (see the top of this file) ----
  onFishingEvent(fn:(e:FishingEvent)=>void){eventListeners.add(fn);return()=>{eventListeners.delete(fn);};},
  get options():Readonly<FishingOptions>{return options;},
  setOptions(patch:Partial<FishingOptions>){options={...options,...patch};},
  setCatchRoll(fn:CatchRoll|null){roll=fn;},
  /** HUD: the chosen float / rod and the night float glow (the world hands them to the visuals). */
  setLook(patch:Partial<FishingLook>){look={...look,...patch};lookRev++;},
  /** Bumped by every setLook: the world re-applies the look (float colour) in its next frame when this changes. */
  get lookRev(){return lookRev;},
  get look():Readonly<FishingLook>{return look;},
  /** World: the catch roll override (null = fishingCore's rollCatch). */
  get catchRoll(){return roll;},
  /** HUD: start fishing at a spot (the world picks it up on its next frame). */
  start(spotId:string){if(!spotById(spotId))return;pending=spotId;stopRequested=false;},
  /** HUD / Space / tap on the water. Hooking always starts the spin fight. */
  tap(){if(!view.active||paused)return;const hooking=session.phase==='bite';
   const e=tapSession(session);if(e)tapEvents.push(e);if(e!=='cast')aimCast=null;
   if(hooking&&session.phase==='reeling'){fightHint=null;hooked=true;emit('hook');}
   handle([e]);},
  /** HUD: Space / Enter  is held down (true) or let go (false): a steady full-rate spin. */
  hold(on:boolean){held=on;applySpin();},
  /** HUD: the reel is being spun by a finger at `rate` (0..1 of a full spin; the pointer handler calls this on each move). The rate
   *  fades on its own once the finger stops (tickSpin), so a still finger is not a spinning reel. */
  spin(rate:number,now=performance.now()){spinRate=Math.max(0,Math.min(1,rate||0));spinAt=now;applySpin();},
  /** HUD: the finger left the reel. */
  spinEnd(){spinRate=0;applySpin();},
  /** World, once per frame while reeling: the spin rate fades SPIN_HOLD_MS after the last move (then over SPIN_FADE_MS). */
  tickSpin(now:number){ratchet(now);if(!spinRate||held)return;const idle=now-spinAt-SPIN_HOLD_MS;if(idle<=0)return;spinRate=Math.max(0,spinRate-idle/SPIN_FADE_MS);spinAt=now-SPIN_HOLD_MS;applySpin();},
  /** The effective spin rate right now (0..1; the HUD never polls it, tests and tools may). */
  get spinRate(){return held?1:spinRate;},
  /** World: the fight's live values for the HUD arc (CSS variables) and the visuals; null when not fighting. */
  get fightMeter(){const f=session.phase==='reeling'?session.fight:null;return f?{tension:f.tension,progress:f.progress,side:f.side,holding:f.holding,running:!!f.run,stun:f.stun}:null;},
  // ---- aimed casting (Oct 14 2026) ----
  /** HUD: the player is aiming (a drag on the water, the Cast-button drag, arrow keys); null when they let go without casting. */
  aim(input:AimInput|null){aimInput=input;},
  /** HUD: cast at the current aim (a quick cast if there is none). */
  castAimed(){aimCast=aimInput;this.tap();aimInput=null;},
  /** World: the live aim input, and the aim the cast that just started was thrown at (null = a quick cast; read once). */
  get aimInput(){return aimInput;},
  takeAimedCast(){const a=aimCast;aimCast=null;return a;},
  /** World: what the water the float landed in is like (the waiting hint only). */
  setWater(w:FishingView['water']){if(water===w)return;water=w;if(view.active&&(session.phase==='floating'||session.phase==='casting'))publish({water,hint:session.phase==='floating'?floatHint(w):view.hint});else publish({water});},
  /** World: taps since the last frame (for splash rings on hook / scare). */
  drainTapEvents(){const e=tapEvents;tapEvents=[];return e;},
  stop(){if(view.active||pending)stopRequested=true;pending=null;},
  // ---- world side ----
  takePending(){const p=pending;pending=null;return p;},
  takeStop(){const s=stopRequested;stopRequested=false;return s;},
  begin(spotId:string){session=createSession();aimInput=null;aimCast=null;water='calm';fightHint=null;held=false;spinRate=0;hooked=false;publish({active:true,spotId,phase:'ready',hint:HINTS.ready,lesson:null,caught:null,water,fight:false,run:false,strain:false,slips:0,warn:false});},
  end(){session=createSession();tapEvents=[];aimInput=null;aimCast=null;water='calm';fightHint=null;held=false;spinRate=0;publish({...IDLE,catches:view.catches});},
  get session(){return session;},
  handle,
 };
}
export type FishingSessionApi=ReturnType<typeof createFishingSession>;
