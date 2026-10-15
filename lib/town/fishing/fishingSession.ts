/**
 * Live fishing session: the bridge between the 3D island (lib/town/fishing/fishingWorld.ts, stepped by the island loop)
 * and the small HUD (components/FishingHost.tsx). The HUD sends commands (start / tap / stop); the world steps the pure
 * rules (./fishingCore.ts) each frame while a session is active and publishes a view snapshot ONLY when the phase changes,
 * so React never re-renders per frame. Sounds reuse the island sound system's document cues (no new audio context).
 */
import {createSession,reelDone,tapSession,type Session,type SessionEvent,type SessionPhase} from './fishingCore';
import {KEEPER_LESSONS,fishById,spotById,type FishId} from './fishCatalog';
import {countSummitFishCatch} from '../../analytics/summitEvents';
import {HOTSPOT_HINT,READ_WATER_HINT,SPOOKED_HINT} from './fishingAim';

export type CatchView={id:FishId;size:number;isNew:boolean;isBiggest:boolean;inBasket:boolean};
export type FishingView={active:boolean;spotId:string|null;phase:SessionPhase;hint:string;lesson:{title:string;text:string;key:number}|null;caught:CatchView|null;catches:number;reelProgress:number;
 /** Whole reel taps done / needed (the Reel meter). */
 reelDone:number;reelTarget:number;
 /** A big animal is pulling line back because the player paused. */
 pulling:boolean;
 /** Where the last cast landed (Oct 14 2026, aimed casting): on a hotspot / in spooked water (hint text only, never odds). */
 water:'calm'|'hot'|'spooked'};
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
const IDLE:FishingView={active:false,spotId:null,phase:'ready',hint:'',lesson:null,caught:null,catches:0,reelProgress:0,reelDone:0,reelTarget:0,pulling:false,water:'calm'};
/** The waiting hint for the water the float landed in. */
const floatHint=(w:FishingView['water'])=>w==='spooked'?SPOOKED_HINT:w==='hot'?HOTSPOT_HINT:HINTS.floating;
/** While a big animal pulls back (the keeper link: hold on to the ball after a save so nobody scores the rebound). */
export const PULL_HINT='It is pulling back! Hold on like a keeper: keep tapping Reel!';

type Lander=(id:FishId,size:number)=>Omit<CatchView,'id'|'size'>;
export function createFishingSession(land:Lander,cue:(kind:'tick'|'splash'|'plunge'|'cast'|'fanfare')=>void=()=>{}){
 let view=IDLE,session:Session=createSession(),pending:string|null=null,stopRequested=false,lessonKey=0,tapEvents:SessionEvent[]=[];const shown=new Set<string>();
 let paused=false,aimInput:AimInput|null=null,aimCast:AimInput|null=null,water:FishingView['water']='calm';
 const listeners=new Set<()=>void>();
 const publish=(patch:Partial<FishingView>)=>{view={...view,...patch};listeners.forEach(f=>f());};
 const lesson=(k:keyof typeof KEEPER_LESSONS,always=false)=>{if(!always&&shown.has(k))return view.lesson;shown.add(k);const l=KEEPER_LESSONS[k];return {title:l.title,text:l.text,key:++lessonKey};};
 /** Apply events from a step or a tap: sounds, landing the fish, and the snapshot. */
 function handle(events:(SessionEvent|null)[]){
  let lessonNext=view.lesson,caught=view.caught,catches=view.catches;
  for(const e of events){
   if(e==='cast')cue('cast');
   if(e==='reel')cue('tick');
   if(e==='pull')cue('splash');
   if(e==='splash'){cue('splash');lessonNext=lesson('cast');}
   if(e==='nibble'){cue('tick');if(session.nibbles===1)lessonNext=lesson('nibble');}
   if(e==='bite')cue('plunge');
   if(e==='scared')lessonNext=lesson('scared',true);
   if(e==='escaped')lessonNext=lesson('escaped',true);
   if(e==='hooked'&&session.fish){const f=session.fish;caught={id:f.id,size:f.size,...land(f.id,f.size)};catches++;cue('fanfare');countSummitFishCatch(view.spotId);}
   if(e==='cast')caught=null;
  }
  // The meter moves in whole taps (a pull-back drops it one step at a time), so the HUD never re-renders per frame.
  const done=session.phase==='reeling'||session.phase==='caught'?reelDone(session):0,target=session.reelTarget,reelProgress=target?done/target:0,pulling=session.phase==='reeling'&&session.pulling;
  if(view.reelProgress!==reelProgress||view.reelTarget!==target||view.pulling!==pulling||view.phase!==session.phase||lessonNext!==view.lesson||caught!==view.caught)publish({phase:session.phase,hint:session.phase==='caught'&&caught?`${fishById(caught.id)?.name}! Keep fishing or stop.`:pulling?PULL_HINT:session.phase==='floating'||session.phase==='approach'&&water==='spooked'?floatHint(water):HINTS[session.phase],lesson:lessonNext,caught,catches,reelProgress,reelDone:done,reelTarget:target,pulling,water});
 }
 return {
  getView:()=>view,
  get paused(){return paused;},
  pause(value:boolean){paused=value;},
  subscribe:(fn:()=>void)=>{listeners.add(fn);return()=>{listeners.delete(fn);};},
  /** HUD: start fishing at a spot (the world picks it up on its next frame). */
  start(spotId:string){if(!spotById(spotId))return;pending=spotId;stopRequested=false;},
  /** HUD / Space / tap on the water. */
  tap(){if(!view.active||paused)return;const e=tapSession(session);if(e)tapEvents.push(e);if(e!=='cast')aimCast=null;handle([e]);},
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
  begin(spotId:string){session=createSession();aimInput=null;aimCast=null;water='calm';publish({active:true,spotId,phase:'ready',hint:HINTS.ready,lesson:null,caught:null,reelProgress:0,reelDone:0,reelTarget:0,pulling:false,water});},
  end(){session=createSession();tapEvents=[];aimInput=null;aimCast=null;water='calm';publish({...IDLE,catches:view.catches});},
  get session(){return session;},
  handle,
 };
}
export type FishingSessionApi=ReturnType<typeof createFishingSession>;
