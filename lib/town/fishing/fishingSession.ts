/**
 * Live fishing session: the bridge between the 3D island (lib/town/fishing/fishingWorld.ts, stepped by the island loop)
 * and the small HUD (components/FishingHost.tsx). The HUD sends commands (start / tap / stop); the world steps the pure
 * rules (./fishingCore.ts) each frame while a session is active and publishes a view snapshot ONLY when the phase changes,
 * so React never re-renders per frame. Sounds reuse the island sound system's document cues (no new audio context).
 */
import {createSession,tapSession,type Session,type SessionEvent,type SessionPhase} from './fishingCore';
import {KEEPER_LESSONS,fishById,spotById,type FishId} from './fishCatalog';

export type CatchView={id:FishId;size:number;isNew:boolean;isBiggest:boolean;inBasket:boolean};
export type FishingView={active:boolean;spotId:string|null;phase:SessionPhase;hint:string;lesson:{title:string;text:string;key:number}|null;caught:CatchView|null;catches:number;reelProgress:number};
const HINTS:Record<SessionPhase,string>={
 ready:'Line in. Tap Cast to throw it out again.',
 casting:'Casting…',
 floating:'Watch the water for a fish shadow…',
 approach:'A fish is coming. Stay still…',
 nibble:'Nibbles… wait for the big splash!',
 bite:'Now! Reel it in!',
 reeling:'Keep tapping Reel to bring it closer!',
 scared:'Too early! It swam off. Another fish will come.',
 escaped:'Too late, it got away. Stay ready.',
 caught:'Nice catch! Keep fishing or stop.',
};
const IDLE:FishingView={active:false,spotId:null,phase:'ready',hint:'',lesson:null,caught:null,catches:0,reelProgress:0};

type Lander=(id:FishId,size:number)=>Omit<CatchView,'id'|'size'>;
export function createFishingSession(land:Lander,cue:(kind:'tick'|'splash'|'plunge'|'cast'|'fanfare')=>void=()=>{}){
 let view=IDLE,session:Session=createSession(),pending:string|null=null,stopRequested=false,lessonKey=0,tapEvents:SessionEvent[]=[];const shown=new Set<string>();
 let paused=false;
 const listeners=new Set<()=>void>();
 const publish=(patch:Partial<FishingView>)=>{view={...view,...patch};listeners.forEach(f=>f());};
 const lesson=(k:keyof typeof KEEPER_LESSONS,always=false)=>{if(!always&&shown.has(k))return view.lesson;shown.add(k);const l=KEEPER_LESSONS[k];return {title:l.title,text:l.text,key:++lessonKey};};
 /** Apply events from a step or a tap: sounds, landing the fish, and the snapshot. */
 function handle(events:(SessionEvent|null)[]){
  let lessonNext=view.lesson,caught=view.caught,catches=view.catches;
  for(const e of events){
   if(e==='cast')cue('cast');
   if(e==='reel')cue('tick');
   if(e==='splash'){cue('splash');lessonNext=lesson('cast');}
   if(e==='nibble'){cue('tick');if(session.nibbles===1)lessonNext=lesson('nibble');}
   if(e==='bite')cue('plunge');
   if(e==='scared')lessonNext=lesson('scared',true);
   if(e==='escaped')lessonNext=lesson('escaped',true);
   if(e==='hooked'&&session.fish){const f=session.fish;caught={id:f.id,size:f.size,...land(f.id,f.size)};catches++;cue('fanfare');}
   if(e==='cast')caught=null;
  }
  const reelProgress=session.reelTarget?session.reelTaps/session.reelTarget:0;
  if(view.reelProgress!==reelProgress||view.phase!==session.phase||lessonNext!==view.lesson||caught!==view.caught)publish({phase:session.phase,hint:session.phase==='caught'&&caught?`${fishById(caught.id)?.name}! Keep fishing or stop.`:HINTS[session.phase],lesson:lessonNext,caught,catches,reelProgress});
 }
 return {
  getView:()=>view,
  get paused(){return paused;},
  pause(value:boolean){paused=value;},
  subscribe:(fn:()=>void)=>{listeners.add(fn);return()=>{listeners.delete(fn);};},
  /** HUD: start fishing at a spot (the world picks it up on its next frame). */
  start(spotId:string){if(!spotById(spotId))return;pending=spotId;stopRequested=false;},
  /** HUD / Space / tap on the water. */
  tap(){if(!view.active||paused)return;const e=tapSession(session);if(e)tapEvents.push(e);handle([e]);},
  /** World: taps since the last frame (for splash rings on hook / scare). */
  drainTapEvents(){const e=tapEvents;tapEvents=[];return e;},
  stop(){if(view.active||pending)stopRequested=true;pending=null;},
  // ---- world side ----
  takePending(){const p=pending;pending=null;return p;},
  takeStop(){const s=stopRequested;stopRequested=false;return s;},
  begin(spotId:string){session=createSession();publish({active:true,spotId,phase:'ready',hint:HINTS.ready,lesson:null,caught:null,reelProgress:0});},
  end(){session=createSession();tapEvents=[];publish({...IDLE,catches:view.catches});},
  get session(){return session;},
  handle,
 };
}
export type FishingSessionApi=ReturnType<typeof createFishingSession>;
