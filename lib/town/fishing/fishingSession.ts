/**
 * Live fishing session: the bridge between the 3D island (lib/town/fishing/fishingWorld.ts, stepped by the island loop)
 * and the small HUD (components/FishingHost.tsx). The HUD sends commands (start / tap / hold / steer / stop); the world steps
 * the pure rules (./fishingCore.ts, the fight in ./fishingFight.ts) each frame while a session is active and publishes a view
 * snapshot ONLY when something the HUD shows changes (phase, hint, a run starting …), so React never re-renders per frame.
 * The fight's continuous values (tension, progress) are read by the world through `fightMeter` and written straight onto the
 * HUD as CSS variables. Sounds reuse the island sound system's document cues (no new audio context).
 *
 * ---- EVENT API (Oct 15 2026; also in docs/fishing.md "Event API") ----
 * For content features (records, requests, the derby, lures, night fish …) that must react to fishing without touching
 * the HUD or the world:
 *
 *   import {fishingSession} from './fishingStore';           // the one live session (or onFishingEvent from fishingStore)
 *   const off=fishingSession.onFishingEvent(e=>{ … });       // returns an unsubscribe
 *
 *   e: FishingEvent = {type, fish, size, spot, at, …}
 *     type  'cast'    a cast starts (fish/size null)
 *           'nibble'  a nibble on the float (fish/size known internally; do not reveal them)
 *           'bite'    the real bite: the reaction window opens
 *           'hook'    the player hooked it (the fight / Easy reel starts)
 *           'run'     the fish makes a run during the fight (`dir` -1 left / 1 right on screen)
 *           'slip'    too much tension: it slipped back a notch (never lost)
 *           'warn'    the line twang before an idle escape
 *           'catch'   landed: also `isNew`, `isBiggest` (a new size record for that species), `inBasket`
 *           'escape'  it swam off: `how` 'scared' (tapped on a nibble) or 'escaped' (too late / idle)
 *     fish  species id (FishId) or null;  size  cm or null;  spot  spot id or null;  at  Date.now() ms
 *     also  rarity, shadow (size class), easyReel, lure, derby (the options at the time), hot ('calm'|'hot'|'spooked' water)
 *   Listeners run synchronously inside the island loop or a HUD handler: keep them small (no React state per frame; they only
 *   fire on these discrete beats). A throwing listener is caught and ignored.
 *
 *   fishingSession.options                  {lure, derby, easyReel} (read-only snapshot)
 *   fishingSession.setOptions({lure:'panenka', derby:true})   lure id or null; derby flag; easyReel (the HUD's toggle)
 *   fishingSession.setCatchRoll(fn|null)    replace the internal catch roll: fn(spot, rand 0..1, hot 0..1) => FishId (must
 *                                           live at the spot). Use it for lures / night fish (keep it EV-neutral, see
 *                                           docs/fishing-research.md §4). The world passes options.lure / options.derby to
 *                                           fishingCore's SessionOptions too.
 *   Shape words for the Fishbook: shadowShapeWord(f) in ./fishingFight.ts; size in football units: sizeCompare(cm) in
 *   ./fishingCard.ts; rarity icons: components/RarityStars.tsx (RARITY_STARS in ./fishingCard.ts); the local best size per
 *   species: bestSize(id) in ./fishingStore.ts (the Fishbook's `biggest`).
 */
import {createSession,reelDone,tapSession,type Session,type SessionEvent,type SessionPhase} from './fishingCore';
import {KEEPER_LESSONS,fishById,spotById,type FishId,type FishSpot,type FishRarity,type ShadowSize} from './fishCatalog';
import {countSummitFishCatch} from '../../analytics/summitEvents';
import {HOTSPOT_HINT,READ_WATER_HINT,SPOOKED_HINT} from './fishingAim';
import {counterDir,setHold,setSteer} from './fishingFight';

export type CatchView={id:FishId;size:number;isNew:boolean;isBiggest:boolean;inBasket:boolean};
export type FishingView={active:boolean;spotId:string|null;phase:SessionPhase;hint:string;lesson:{title:string;text:string;key:number}|null;caught:CatchView|null;catches:number;reelProgress:number;
 /** Whole reel taps done / needed (the Easy reel meter). */
 reelDone:number;reelTarget:number;
 /** A big animal is pulling line back because the player paused (Easy reel). */
 pulling:boolean;
 /** Where the last cast landed (Oct 14 2026, aimed casting): on a hotspot / in spooked water (hint text only, never odds). */
 water:'calm'|'hot'|'spooked';
 /** Oct 15 2026 (B1): the tension fight is on (hold Reel); `run` is the way to swipe to turn a run (-1 left, 1 right, 0 none);
  *  `strain` the arc is in the red; `slips` how many times it slipped back; `warn` the idle warning is showing. */
 fight:boolean;run:-1|0|1;strain:boolean;slips:number;warn:boolean;
 /** The Easy reel option (tap Reel instead of the fight). */
 easyReel:boolean};
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
const IDLE:FishingView={active:false,spotId:null,phase:'ready',hint:'',lesson:null,caught:null,catches:0,reelProgress:0,reelDone:0,reelTarget:0,pulling:false,water:'calm',fight:false,run:0,strain:false,slips:0,warn:false,easyReel:false};
/** The waiting hint for the water the float landed in. */
const floatHint=(w:FishingView['water'])=>w==='spooked'?SPOOKED_HINT:w==='hot'?HOTSPOT_HINT:HINTS.floating;
/** While a big animal pulls back (the keeper link: hold on to the ball after a save so nobody scores the rebound). */
export const PULL_HINT='It is pulling back! Hold on like a keeper: keep tapping Reel!';
/** The fight's one-line hints (B1), with the football links: the weight of a pass, jockeying a winger. */
export const FIGHT_HINT='Hold Reel to wind it in. Ease off in the red!';
export const STRAIN_HINT='Too tight! Ease off, like the weight of a pass.';
export const runHint=(swipe:-1|1)=>swipe>0?'It runs! Swipe right →, jockey the winger!':'It runs! ← Swipe left, jockey the winger!';
export const TURNED_HINT='Turned it! Keep reeling.';
export const SLIP_HINT='It slipped back a bit. Ease off, then reel again.';
/** An Island Legend (Agent B, legendary.ts) rests after a slip instead. */
export const LEGEND_REST_HINT='The legend is resting. Ease off, then reel again.';
/** A5: the warning before an idle escape. */
export const WARN_HINT='It\'s getting away, keep reeling!';

export type FishCue='tick'|'splash'|'plunge'|'cast'|'fanfare'|'reel'|'twang'|'slip'|'run';
export type FishingEventType='cast'|'nibble'|'bite'|'hook'|'run'|'slip'|'warn'|'catch'|'escape';
export type FishingEvent={type:FishingEventType;fish:FishId|null;size:number|null;spot:string|null;at:number;
 rarity:FishRarity|null;shadow:ShadowSize|null;easyReel:boolean;lure:string|null;derby:boolean;hot:FishingView['water'];
 dir?:-1|1;isNew?:boolean;isBiggest?:boolean;inBasket?:boolean;how?:'scared'|'escaped'};
export type FishingOptions={lure:string|null;derby:boolean;easyReel:boolean};
/** The angler's cosmetics and the night glow (Agent B: fishingLogStore.fishingCosmetics, waterMood.moodParams): looks only. */
export type FishingLook={floatColor:string|null;goldenRod:boolean;floatGlow:number};
export type CatchRoll=(spot:FishSpot,rand:number,hot:number)=>FishId;
const SHADOW_STEP:Record<ShadowSize,number>={small:0,medium:1,large:2,huge:3,giant:4};

type Lander=(id:FishId,size:number)=>Omit<CatchView,'id'|'size'>;
export function createFishingSession(land:Lander,cue:(kind:FishCue,strength?:number)=>void=()=>{}){
 let view=IDLE,session:Session=createSession(),pending:string|null=null,stopRequested=false,lessonKey=0,tapEvents:SessionEvent[]=[];const shown=new Set<string>();
 let paused=false,aimInput:AimInput|null=null,aimCast:AimInput|null=null,water:FishingView['water']='calm';
 let options:FishingOptions={lure:null,derby:false,easyReel:false},roll:CatchRoll|null=null,fightHint:string|null=null;
 let look:FishingLook={floatColor:null,goldenRod:false,floatGlow:0};
 const listeners=new Set<()=>void>(),eventListeners=new Set<(e:FishingEvent)=>void>();
 const publish=(patch:Partial<FishingView>)=>{view={...view,...patch};listeners.forEach(f=>f());};
 const lesson=(k:keyof typeof KEEPER_LESSONS,always=false)=>{if(!always&&shown.has(k))return view.lesson;shown.add(k);const l=KEEPER_LESSONS[k];return {title:l.title,text:l.text,key:++lessonKey};};
 /** Tell the content listeners (B's records / requests / derby …). Never throws into the loop. */
 function emit(type:FishingEventType,extra:Partial<FishingEvent>={}){
  if(!eventListeners.size)return;
  const f=session.fish,sp=f?fishById(f.id):undefined;
  const e:FishingEvent={type,fish:f?.id??null,size:f?.size??null,spot:view.spotId,at:Date.now(),rarity:sp?.rarity??null,shadow:sp?.shadow??null,easyReel:options.easyReel,lure:options.lure,derby:options.derby,hot:water,...extra};
  for(const fn of [...eventListeners]){try{fn(e);}catch{/* a listener never breaks fishing */}}
 }
 /** The hint for the current moment. */
 const hintFor=(caught:CatchView|null,pulling:boolean)=>{const ph=session.phase;
  if(ph==='caught'&&caught)return `${fishById(caught.id)?.name}! Keep fishing or stop.`;
  if(ph==='reeling'&&session.warned)return WARN_HINT;
  if(ph==='reeling'&&session.fight){const c=counterDir(session.fight);if(c)return runHint(c);if(session.fight.strained)return STRAIN_HINT;return fightHint??FIGHT_HINT;}
  if(pulling)return PULL_HINT;
  if(ph==='floating'||ph==='approach'&&water==='spooked')return floatHint(water);
  return HINTS[ph];};
 /** Apply events from a step or a tap: sounds, landing the fish, the content events and the snapshot. */
 function handle(events:(SessionEvent|null)[]){
  let lessonNext=view.lesson,caught=view.caught,catches=view.catches;
  for(const e of events){
   if(e==='cast'){cue('cast');fightHint=null;emit('cast');}
   if(e==='reel')cue('reel');
   if(e==='pull')cue('splash');
   if(e==='splash'){cue('splash');lessonNext=lesson('cast');}
   if(e==='nibble'){cue('tick');if(session.nibbles===1)lessonNext=lesson('nibble');emit('nibble');}
   // A1: the bite's pulse grows with the shadow (small 14 ms … giant 30 ms).
   if(e==='bite'){const f=session.fish?fishById(session.fish.id):undefined;cue('plunge',f?SHADOW_STEP[f.shadow]:0);emit('bite');}
   if(e==='scared'){lessonNext=lesson('scared',true);emit('escape',{how:'scared'});}
   if(e==='escaped'){lessonNext=lesson('escaped',true);emit('escape',{how:'escaped'});}
   if(e==='warn'){cue('twang');emit('warn');}
   if(e==='run'){cue('run');fightHint=null;const r=session.fight?.run;emit('run',r?{dir:r.dir}:{});}
   if(e==='turned'){cue('tick');fightHint=TURNED_HINT;}
   if(e==='slip'){cue('slip');fightHint=session.fight?.style==='legend'?LEGEND_REST_HINT:SLIP_HINT;emit('slip');}
   if(e==='hooked'&&session.fish){const f=session.fish;caught={id:f.id,size:f.size,...land(f.id,f.size)};catches++;cue('fanfare');countSummitFishCatch(view.spotId);
    emit('catch',{isNew:caught.isNew,isBiggest:caught.isBiggest,inBasket:caught.inBasket});}
   if(e==='cast')caught=null;
  }
  // The Easy reel meter moves in whole taps (a pull-back drops it one step at a time), and the fight's arc is CSS written by the
  // world (fightMeter), so the HUD never re-renders per frame: only these discrete fields are compared.
  const ph=session.phase,fight=ph==='reeling'&&!!session.fight;
  const done=!fight&&(ph==='reeling'||ph==='caught')?reelDone(session):0,target=fight?0:session.reelTarget,reelProgress=target?done/target:0,pulling=ph==='reeling'&&session.pulling;
  const run=fight?counterDir(session.fight!):0,strain=fight&&session.fight!.strained,slips=fight?session.fight!.slips:0,warn=ph==='reeling'&&session.warned,hint=hintFor(caught,pulling);
  if(view.reelProgress!==reelProgress||view.reelTarget!==target||view.pulling!==pulling||view.phase!==ph||lessonNext!==view.lesson||caught!==view.caught||view.fight!==fight||view.run!==run||view.strain!==strain||view.slips!==slips||view.warn!==warn||view.hint!==hint)
   publish({phase:ph,hint,lesson:lessonNext,caught,catches,reelProgress,reelDone:done,reelTarget:target,pulling,water,fight,run,strain,slips,warn});
 }
 return {
  getView:()=>view,
  get paused(){return paused;},
  pause(value:boolean){paused=value;if(value&&session.fight){setHold(session.fight,false);setSteer(session.fight,0);}},
  subscribe:(fn:()=>void)=>{listeners.add(fn);return()=>{listeners.delete(fn);};},
  // ---- the event API (see the top of this file) ----
  onFishingEvent(fn:(e:FishingEvent)=>void){eventListeners.add(fn);return()=>{eventListeners.delete(fn);};},
  get options():Readonly<FishingOptions>{return options;},
  setOptions(patch:Partial<FishingOptions>){options={...options,...patch};if(patch.easyReel!==undefined&&view.easyReel!==options.easyReel)publish({easyReel:options.easyReel});},
  setCatchRoll(fn:CatchRoll|null){roll=fn;},
  /** HUD: the chosen float / rod and the night float glow (the world hands them to the visuals). */
  setLook(patch:Partial<FishingLook>){look={...look,...patch};},
  get look():Readonly<FishingLook>{return look;},
  /** World: the catch roll override (null = fishingCore's rollCatch). */
  get catchRoll(){return roll;},
  /** HUD: start fishing at a spot (the world picks it up on its next frame). */
  start(spotId:string){if(!spotById(spotId))return;pending=spotId;stopRequested=false;},
  /** HUD / Space / tap on the water. Hooking starts the fight unless Easy reel is on. */
  tap(){if(!view.active||paused)return;const hooking=session.phase==='bite';
   const e=tapSession(session,{fight:!options.easyReel});if(e)tapEvents.push(e);if(e!=='cast')aimCast=null;
   if(hooking&&session.phase==='reeling'){fightHint=null;emit('hook');}
   handle([e]);},
  /** HUD (B1): the Reel button / Space is held down (true) or let go (false). Only matters during the fight. */
  hold(on:boolean){if(!view.active||paused||!session.fight)return;setHold(session.fight,on);if(on){session.reelIdle=0;if(session.warned){session.warned=false;handle([]);}}},
  /** HUD (B1): the counter-steer (a swipe / drag or ←/→): -1 left, 1 right, 0 none. */
  steer(dir:-1|0|1){if(!view.active||paused||!session.fight)return;setSteer(session.fight,dir);},
  /** World: the fight's live values for the HUD arc (CSS variables) and the visuals; null when not fighting. */
  get fightMeter(){const f=session.phase==='reeling'?session.fight:null;return f?{tension:f.tension,progress:f.progress,side:f.side,holding:f.holding,running:!!f.run&&!f.run.turned,stun:f.stun}:null;},
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
  begin(spotId:string){session=createSession();aimInput=null;aimCast=null;water='calm';fightHint=null;publish({active:true,spotId,phase:'ready',hint:HINTS.ready,lesson:null,caught:null,reelProgress:0,reelDone:0,reelTarget:0,pulling:false,water,fight:false,run:0,strain:false,slips:0,warn:false,easyReel:options.easyReel});},
  end(){session=createSession();tapEvents=[];aimInput=null;aimCast=null;water='calm';fightHint=null;publish({...IDLE,catches:view.catches,easyReel:options.easyReel});},
  get session(){return session;},
  handle,
 };
}
export type FishingSessionApi=ReturnType<typeof createFishingSession>;
