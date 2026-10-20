/**
 * The dive's runtime (water phase P2, Oct 16 2026; docs/swimming-research.md "P2 implemented: one spot"): glues the pure session
 * (diveSession.ts) to the sealed room (lib/graphics/diveRoom.ts), the island's renderer and the player's rig. components/Town.tsx
 * owns the island side (the splash, the sound, the HUD store, analytics); this owns the room's lifetime and the dive frame.
 *
 * Heat (AGENTS.md): at rest (not diving) it is the session's 10 Hz patch test while swimming, and the Dive prompt's projection
 * while it shows. Diving, the island is neither stepped nor rendered: one room render per frame (≈ 21 draws + the rig), the
 * idle 20 fps cap after 4 s without input (Town's idleRide rule), and nothing of the room survives surfacing (dispose).
 */
import * as T from 'three';
import {createDiveRoom,type DiveRoom} from '../../graphics/diveRoom';
import type {SwimRigPose} from '../../graphics/swimPose';
import {createDiveSession,parseDiveFinds,addDiveFind,diveRunId,DIVE_FINDS_KEY,BREATH_LOW,type DiveFindsSave,type DiveInput,type SurfaceReason} from './diveSession';
import {DIVE_PROMPT,DIVE_PROMPT_LABEL,DIVE_REST_PROMPT,DIVE_SPOTS,nearestDiveSpots,type DiveFind,type DiveSpot} from './diveSpots';
import {setDiveSpots} from '../../graphics/waterSurface';
import {WATER_LEVEL} from './waterDepth';

/** The find card and the calm notes (components/DiveHud.tsx); written only when one changes. */
export type DiveCard={title:string;text:string;label:string;credit?:string;story?:string;coins:number;id:string};
export type DiveView={diving:boolean;card:DiveCard|null;note:string;spot:string};
const IDLE:DiveView={diving:false,card:null,note:'',spot:''};
/** The phone's ▲ / ▼ (components/DiveHud.tsx, held: pointer down / up) and Q / Z on desktop feed this; the dive frame reads it. */
export const diveLift={up:false,down:false};
let view=IDLE;const listeners=new Set<()=>void>();
export const diveStore={get:()=>view,server:()=>IDLE,
 set(patch:Partial<DiveView>){let changed=false;for(const k in patch)if(!Object.is((view as Record<string,unknown>)[k],(patch as Record<string,unknown>)[k])){changed=true;break;}if(!changed)return;view={...view,...patch};listeners.forEach(f=>f());},
 reset(){if(view===IDLE)return;view=IDLE;listeners.forEach(f=>f());},
 subscribe(f:()=>void){listeners.add(f);return ()=>{listeners.delete(f);};}};

export function readDiveFinds():DiveFindsSave{try{return parseDiveFinds(JSON.parse(localStorage.getItem(DIVE_FINDS_KEY)??'null'));}catch{return parseDiveFinds(null);}}
function writeDiveFinds(s:DiveFindsSave){try{localStorage.setItem(DIVE_FINDS_KEY,JSON.stringify(s));}catch{/* private mode: the find still shows this visit */}}

export type DiveRuntimePorts={
 /** The island scene (the rig goes back there), the renderer and the island camera (its aspect). */
 scene:T.Scene;renderer:T.WebGLRenderer;camera:T.PerspectiveCamera;
 player:{root:T.Object3D;update:(x:number,z:number,dt:number,time:number,reduced:boolean,motion?:{facing?:number;swim?:SwimRigPose;turnSmoothing?:number})=>void};
 phone:boolean;reduced:()=>boolean;
 /** Heat tier 2+ / Battery saver: the room is built lite (diveRoom.ts DIVE_LITE). */
 lite?:()=>boolean;
 /** DOM helpers (Town's cached query, the entry-prompt placement and hide). */
 ui:<E extends HTMLElement>(selector:string)=>E|null|undefined;place:(el:HTMLElement,left:number,top:number)=>void;hide:(el:HTMLElement,hidden:boolean)=>void;
 /** The island side of going under / coming up (splash, tint, sound, HUD, analytics), and a find's coins (the wallet). */
 entered:(spot:DiveSpot)=>void;surfaced:(spot:DiveSpot,reason:SurfaceReason)=>void;
 found:(find:DiveFind,first:boolean)=>void;credit:(runId:string,coins:number,reason:string)=>void;
 low:()=>void;out:()=>void;
 /** First time down at the deep level this dive (analytics), and R / the switcher's jetpack take-off from under the water. */
 deep?:(spot:DiveSpot)=>void;fly:()=>boolean;
};

export function createDiveRuntime(ports:DiveRuntimePorts){
 let save=readDiveFinds();
 const session=createDiveSession(DIVE_SPOTS,id=>save.spots[id]??[]);
 const near:DiveSpot[]=[];let slotKey='';
 let room:DiveRoom|null=null,clock=0,promptShown=false,promptLabel='',findPrompt='',lastBreath=-1,breathShown=false;
 const pose:SwimRigPose={w:1,kind:'tread',phase:0,effort:0,fast:0,entry:'feet',shake:0};
 const v=new T.Vector3(),motion={facing:0,swim:pose,turnSmoothing:5};
 const breathEl=()=>ports.ui<HTMLElement>('[data-dive-breath]');
 /** The breath ring (a CSS variable, at most BREATH_UI_HZ a second) and whether it shows (diving, or refilling after a dive). */
 let swimmingNow=false;
 function drawBreath(force=false){
  const b=session.state.breath,show=session.diving||(b<.999&&swimmingNow),el=breathEl();/* Oct 20 2026 (user: the Breath pill showed while walking on land): the refill pill only shows while swimming */if(!el)return;
  if(show!==breathShown||force){breathShown=show;ports.hide(el,!show);}
  if(!show)return;const q=Math.round(b*100)/100;if(q===lastBreath&&!force)return;lastBreath=q;
  el.style.setProperty('--breath',String(q));el.dataset.low=b<=BREATH_LOW?'1':'';el.setAttribute('aria-valuenow',String(Math.round(b*100)));
 }
 function hidePrompt(){const el=ports.ui<HTMLButtonElement>('[data-dive-go]');if(el&&!el.hidden)ports.hide(el,true);promptShown=false;promptLabel='';findPrompt='';}
 function enter(){
  const s=session.state.spot!;room=createDiveRoom(s,{phone:ports.phone,reduced:ports.reduced(),lite:ports.lite?.()??false,found:save.spots[s.id]??[]});clock=0;
  room.scene.add(ports.player.root);pose.phase=0;hidePrompt();findPrompt='';
  diveLift.up=diveLift.down=false;diveStore.set({diving:true,card:null,note:`${s.name}: ${s.theme.tagline}`,spot:s.id});ports.entered(s);drawBreath(true);
 }
 function leave(reason:SurfaceReason,spot:DiveSpot){
  if(room){ports.scene.add(ports.player.root);ports.player.root.rotation.x=0;ports.player.root.rotation.z=0;room.dispose();room=null;}
  diveLift.up=diveLift.down=false;hidePrompt();diveStore.set({diving:false,card:null,note:'',spot:''});ports.surfaced(spot,reason);drawBreath(true);
 }
 function use(){
  const ev=session.use(),s=session.state.spot;if(!ev.find||!s||!room)return false;const f=s.finds.find(q=>q.id===ev.find)!;
  room.use(f,clock*(ports.reduced()?.4:1));
  if(ev.firstFind){save=addDiveFind(save,s.id,f.id);writeDiveFinds(save);if(ev.coins>0)ports.credit(diveRunId(s.id,f.id),ev.coins,`Dive treasure · ${s.name}`);}
  diveStore.set({card:{id:f.id,title:f.title,text:f.text,label:f.label,credit:f.credit,story:f.story,coins:ev.coins}});
  ports.found(f,ev.firstFind);return true;
 }
 return {session,
  get diving(){return session.diving;},get room(){return room;},
  /** The patch test at the surface (the island step, at the probe's 10 Hz), plus the breath refill there. */
  /** The ocean's patch slots: the DIVE_SLOTS nearest zones (Town's HUD tick; a write only when the set changes). */
  slots(x:number,z:number){nearestDiveSpots(x,z,near);let k='';for(const s of near)k+=s.id+'|';if(k!==slotKey){slotKey=k;setDiveSpots(near);}},
  scan(dt:number,x:number,z:number,swimming:boolean){const s=session.scan(dt,x,z,swimming);if(swimming!==swimmingNow){swimmingNow=swimming;drawBreath(true);}else if(session.events.breathUi)drawBreath();return s;},
  /** The arbiter candidate (Town's HUD tick): the Dive prompt wants the focus slot while in a patch. */
  want(){const s=session.state.near;return s&&!session.diving?{key:'dive',distance:0}:null;},
  /** The floating Dive prompt over the buoy (each island frame while in a patch; `allowed` = the arbiter gave it the slot). */
  prompt(camera:T.Camera,width:number,height:number,allowed:boolean){
   const el=ports.ui<HTMLButtonElement>('[data-dive-go]');if(!el)return;const s=session.state.near;let hidden=!(s&&allowed&&!session.diving);
   if(!hidden&&s){v.set(s.x,WATER_LEVEL+3.2,s.z).project(camera);hidden=v.z< -1||v.z>1;
    if(!hidden){ports.place(el,Math.max(90,Math.min(width-90,(v.x+1)*width/2)),Math.max(90,Math.min(height-160,(1-v.y)*height/2)));
     const label=session.ready?DIVE_PROMPT:DIVE_REST_PROMPT;if(label!==promptLabel){promptLabel=label;el.textContent=label;el.setAttribute('aria-label',session.ready?DIVE_PROMPT_LABEL:'Catch your breath first: float here a moment');el.dataset.diveGo=session.ready?'dive':'rest';}}}
   if(el.hidden!==hidden)ports.hide(el,hidden);promptShown=!hidden;
  },
  get promptShown(){return promptShown;},
  /** "Dive" (the prompt's tap or E): go under. False when not in a patch or out of breath. */
  start(){if(!session.start())return false;enter();return true;},
  /** One dive frame instead of the island's: the swim, the breath, the room, the rig, the find prompt, one render. */
  frame(dt:number,input:DiveInput,width:number,height:number){
   if(!room)return;const s=session.state.spot;
   input.lift=Math.max(-1,Math.min(1,input.lift+(diveLift.up?1:0)-(diveLift.down?1:0)));
   const ev=session.step(dt,input);if(ev.breathUi)drawBreath();if(ev.deep&&s)ports.deep?.(s);
   if(ev.low)ports.low();if(ev.out)ports.out();
   if(ev.surfaced){leave(ev.surfaced as SurfaceReason,s!);return;}
   const st=session.state,reduced=ports.reduced();clock+=dt;
   // The rig: the crawl while swimming, treading water at rest; tipped with the climb and the turn.
   const moving=st.effort>.12;pose.kind=moving?'crawl':'tread';pose.effort=st.effort;pose.fast=0;
   pose.phase=(pose.phase+dt*(reduced?0:moving?5.5*(.5+.5*st.effort):2.2))%(Math.PI*12);
   motion.facing=st.yaw;ports.player.update(st.x,st.z,dt,clock,reduced,motion);
   const root=ports.player.root;root.position.y=st.y-1.15;root.rotation.order='YXZ';root.rotation.x=st.pitch*.6;root.rotation.z=st.roll;
   room.setViewport(width,height,ports.camera.aspect);room.frame(clock*(reduced?.4:1),dt,st);
   // The find prompt (the floating button, the island's style) over the find in reach.
   const el=ports.ui<HTMLButtonElement>('[data-dive-go]');
   if(el){const f=st.phase==='diving'?st.find:null;let hidden=!f;
    if(f){room.anchor(f,v).project(room.camera);hidden=v.z< -1||v.z>1;
     if(!hidden){ports.place(el,Math.max(90,Math.min(width-90,(v.x+1)*width/2)),Math.max(90,Math.min(height-160,(1-v.y)*height/2)));
      if(findPrompt!==f.id){findPrompt=f.id;el.textContent=f.prompt;el.setAttribute('aria-label',f.aria);el.dataset.diveGo=f.id;}}}
    if(el.hidden!==hidden)ports.hide(el,hidden);promptShown=!hidden;}
   ports.renderer.render(room.scene,room.camera);
  },
  /** The prompt's tap / E: use the find in reach underwater. */
  use,
  /** Surface (the button, Space, Escape): drift up, then the island. */
  surface(){session.surface('tap');return session.state.phase==='rising';},
  /** The dive keys (before the water keys): Escape / Space / 1 surface, E uses the find, Q / Z rise and sink (held, into `held`). */
  key(e:KeyboardEvent,down:boolean,held:Set<string>){
   if(!session.diving)return false;const k=e.key.toLowerCase();
   if(k==='q'||k==='z'){if(down)held.add(k);else held.delete(k);e.preventDefault();return true;}
   if(!down)return ['escape',' ','e','1','j','2','3'].includes(k)||e.code==='Space';
   if(e.repeat)return true;
   if(k==='escape'||e.code==='Space'||e.code==='Digit1'||e.code==='Numpad1'){e.preventDefault();session.surface('tap');return true;}
   if(k==='e'||e.code==='Digit3'||e.code==='Numpad3'){e.preventDefault();use();return true;}
   // R (Oct 20 2026, user): the jetpack still takes off from inside the dive zone (fuel allowing; else the swim switcher's hint).
   if(k==='r'){e.preventDefault();ports.fly();return true;}
   if(k==='j'||e.code==='Digit2')return true;
   return false;
  },
  /** Leave the room at once for a jetpack take-off: the island is back at the zone's buoy, no rising fade (Town then flies up). */
  exitForFlight(){const s=session.state.spot;if(!session.diving||!s)return false;session.surface('leave');leave('fly',s);return true;},
  /** Close the card (its tap). */
  closeCard(){diveStore.set({card:null});},
  /** The island is going away (unmount) or a map trip: come up at once, no splash. */
  dispose(){const s=session.state.spot;if(session.diving){session.surface('leave');if(s)leave('leave',s);}hidePrompt();room?.dispose();room=null;diveStore.reset();},
 };
}
export type DiveRuntime=ReturnType<typeof createDiveRuntime>;
