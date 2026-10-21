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
import {DIVE_REEF_KEY,REEF_RESTORE_CARD,REEF_RESTORE_COINS,addPickup,journeyPickups,markRestored,nextTarget,parseDiveReef,reach,reefColour,reefHealth,reefRunId,type DivePickup,type DiveReefSave} from './diveJourney';
import {DIVE_ROOM_R,DIVE_SURFACE_Y,diveFloor} from './diveSpots';

/** The find card and the calm notes (components/DiveHud.tsx); written only when one changes. */
export type DiveCard={title:string;text:string;label:string;credit?:string;story?:string;coins:number;id:string};
/** `reef`: the zone's journey progress ("5/12"), `restored`: the zone is fully restored (Explore v2). */
export type DiveView={diving:boolean;card:DiveCard|null;note:string;spot:string;reef:string;restored:boolean};
const IDLE:DiveView={diving:false,card:null,note:'',spot:'',reef:'',restored:false};
/** The phone's ▲ / ▼ (components/DiveHud.tsx, held: pointer down / up) and Q / Z on desktop feed this; the dive frame reads it. */
export const diveLift={up:false,down:false,
 /** Explore v2: the Dart button / F / Shift asked for a dart (an edge: the next dive frame takes it and clears it). */
 dart:false};
export function readDiveReef():DiveReefSave{try{return parseDiveReef(JSON.parse(localStorage.getItem(DIVE_REEF_KEY)??'null'),DIVE_SPOTS);}catch{return parseDiveReef(null,DIVE_SPOTS);}}
function writeDiveReef(s:DiveReefSave){try{localStorage.setItem(DIVE_REEF_KEY,JSON.stringify(s));}catch{/* private mode */}}
/** Explore v2 tuning: the buddy fish's follow / lead (it leads after the diver has hovered DIVE_BUDDY_LEAD_S), the ball's water drag and
 *  sink, the restored reef's football formation (s), the delight wiggle after a find or a pickup (s). */
export const DIVE_BUDDY_LEAD_S=2,DIVE_BALL={drag:1.1,sink:.7,r:.3,push:1.1},DIVE_FORM_S=8,DIVE_JOY_S=.7;
export const DIVE_GOAL_CARD={title:'Goal under the sea!',label:'Coaching idea' as const,text:'Water slows the ball, like a soaked pitch. On a rainy day pass a little firmer, so the ball still reaches your teammate.'};
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
 /** First time over the reef crest this dive (analytics wa:dive_crest), and R / the switcher's jetpack take-off from under the water. */
 crest?:(spot:DiveSpot)=>void;fly:()=>boolean;
 /** Explore v2: a dart (sound, the first per dive counted), a pickup collected, the zone restored, a goal with the underwater ball. */
 dart?:(first:boolean)=>void;picked?:(kind:DivePickup['kind'],first:boolean)=>void;restored?:(spot:DiveSpot)=>void;goal?:()=>void;
};

export function createDiveRuntime(ports:DiveRuntimePorts){
 let save=readDiveFinds();
 const session=createDiveSession(DIVE_SPOTS,id=>save.spots[id]??[]);
 const near:DiveSpot[]=[];let slotKey='';
 let room:DiveRoom|null=null,clock=0,promptShown=false,promptLabel='',findPrompt='',lastBreath=-1,breathShown=false;
 const pose:SwimRigPose={w:1,kind:'tread',phase:0,effort:0,fast:0,entry:'feet',shake:0};
 const v=new T.Vector3(),motion={facing:0,swim:pose,turnSmoothing:5};
 // Explore v2: the journey (pickups collected, progress, restore), the buddy fish, the ball, the formation and the delight wiggle.
 let reefSave=readDiveReef(),picks:DivePickup[]=[],got:boolean[]=[],formT=-1,joy=0,pickedThisDive=0,still=0,ballGoalT=-1;
 const form={x:0,y:0,z:0},bud={x:0,y:0,z:0,vx:0,vy:0,vz:0},tgt={x:0,z:0},ball={x:0,y:0,z:0,vx:0,vy:0,vz:0,lz:0};
 const ax=new T.Vector3();
 function progress(spot:DiveSpot){const found=save.spots[spot.id]??[];const n=got.filter(Boolean).length+found.length,total=picks.length+spot.finds.length;return {n,total,found};}
 function drawProgress(spot:DiveSpot,celebrate:boolean){
  const {n,total}=progress(spot),done=reefSave.restored.includes(spot.id);room?.setReef(reefColour(done?1:reefHealth(n,0,total)));diveStore.set({reef:`${n}/${total}`,restored:done});
  if(n>=total&&!done&&celebrate){reefSave=markRestored(reefSave,spot.id);writeDiveReef(reefSave);ports.credit(reefRunId(spot.id),REEF_RESTORE_COINS,`Reef restored · ${spot.name}`);
   diveStore.set({restored:true,card:{id:'reef',title:REEF_RESTORE_CARD.title,text:REEF_RESTORE_CARD.text,label:REEF_RESTORE_CARD.label,credit:REEF_RESTORE_CARD.credit,story:REEF_RESTORE_CARD.story,coins:REEF_RESTORE_COINS}});
   room?.setReef(1);formT=0;const st=session.state;form.x=st.x+Math.sin(st.yaw)*3.2;form.y=Math.min(st.y+.4,DIVE_SURFACE_Y-1.6);form.z=st.z+Math.cos(st.yaw)*3.2;joy=DIVE_JOY_S;ports.restored?.(spot);}
 }
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
  const s=session.state.spot!;picks=journeyPickups(s);const have=reefSave.zones[s.id]??[];got=picks.map(p=>have.includes(p.i));
  room=createDiveRoom(s,{phone:ports.phone,reduced:ports.reduced(),lite:ports.lite?.()??false,found:save.spots[s.id]??[],pickups:picks,got});clock=0;
  formT=-1;joy=0;pickedThisDive=0;still=0;ballGoalT=-1;bud.x=session.state.x+.8;bud.y=session.state.y+.3;bud.z=session.state.z-1;bud.vx=bud.vy=bud.vz=0;
  if(room.goal){ball.x=room.goal.cx;ball.z=room.goal.cz;ball.y=diveFloor(ball.x,ball.z,s.floor)+DIVE_BALL.r;ball.vx=ball.vy=ball.vz=0;ball.lz=0;}
  room.scene.add(ports.player.root);pose.phase=0;hidePrompt();findPrompt='';
  diveLift.up=diveLift.down=false;diveStore.set({diving:true,card:null,note:`${s.name}: ${s.theme.tagline} Dot the little fish will show you around.`,spot:s.id});drawProgress(s,false);ports.entered(s);drawBreath(true);
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
  ports.found(f,ev.firstFind);joy=DIVE_JOY_S;drawProgress(s,true);return true;
 }
 return {session,
  get diving(){return session.diving;},get room(){return room;},
  /** Explore v2 (the room's rest cap, Town): nothing is moving that the player made move: no stick, no lift, no dart, no ball rolling,
   *  no pickup or formation playing (the fish and plants are shader time only: they keep swimming at the capped rate). */
  get resting(){const st=session.state;return st.phase==='diving'&&st.effort<.05&&st.lift===0&&st.dartT<=0&&joy<=0&&formT<0&&ballGoalT<0&&Math.hypot(ball.vx,ball.vy,ball.vz)<.05&&Math.hypot(st.vx,st.vz)<.05;},
  /** Explore v2: the journey's pickups this dive and which are collected (tests). */
  get pickups(){return picks;},get got(){return got;},
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
  /** The near-shore duck-dive shares the reef's breath (diveSession.ts DUCK_DRAIN): drain while under, the ring redrawn ≤ 10 Hz.
   *  Returns the session's events (low / out) for the host's note and the pop-up. */
  duck(dt:number,under:boolean){const ev=session.duck(dt,under);if(ev.breathUi)drawBreath();return ev;},
  /** "Dive" (the prompt's tap or E): go under. False when not in a patch or out of breath. */
  start(){if(!session.start())return false;enter();return true;},
  /** One dive frame instead of the island's: the swim, the breath, the room, the rig, the find prompt, one render. */
  frame(dt:number,input:DiveInput,width:number,height:number){
   if(!room)return;const s=session.state.spot;
   input.lift=Math.max(-1,Math.min(1,input.lift+(diveLift.up?1:0)-(diveLift.down?1:0)));
   if(diveLift.dart){input.dart=true;diveLift.dart=false;}
   const ev=session.step(dt,input);if(ev.breathUi)drawBreath();if(ev.dart)ports.dart?.(session.state.darts===1);if(ev.crest&&s)ports.crest?.(s);
   if(ev.low)ports.low();if(ev.out)ports.out();
   if(ev.surfaced){leave(ev.surfaced as SurfaceReason,s!);return;}
   const st=session.state,reduced=ports.reduced();clock+=dt;
   // The rig: the crawl while swimming, treading water at rest; tipped with the climb and the turn.
   // Explore v2: the body lies along the swim (the crawl's under-water shape, under 1): a flutter-kick crawl while swimming, a slow
   // glide flutter when the stick is let go, quicker and flatter on a dart; a gentle hover bob at rest; a happy wiggle after a find.
   const moving=st.effort>.12,dartK=st.dartT>0?1:0;joy=Math.max(0,joy-dt);still=moving||Math.abs(input.lift)>0?0:still+dt;
   pose.kind='crawl';pose.under=1;pose.tilt=st.pitch*.7;pose.effort=Math.max(st.effort,joy>0?.8:0);pose.fast=Math.max(dartK,joy>0?1:0);
   pose.phase=(pose.phase+dt*(reduced?0:moving||joy>0?5.5*(.5+.5*pose.effort)*(1+.6*pose.fast):1.1))%(Math.PI*12);
   motion.facing=st.yaw;ports.player.update(st.x,st.z,dt,clock,reduced,motion);
   const bob=reduced?0:Math.sin(clock*1.7)*.06*Math.min(1,still),wig=reduced?0:Math.sin(joy*28)*.3*joy/DIVE_JOY_S;
   const root=ports.player.root;root.position.y=st.y-1.15+bob;root.rotation.order='YXZ';root.rotation.x=0;root.rotation.z=st.roll+wig;
   // The journey: a pickup in reach is collected (swim through it), the progress chip, the restore.
   {const i=reach(picks,got,st.x,st.y-.2,st.z);if(i>=0&&st.phase==='diving'&&s){got[i]=true;room.collect(i,clock*(reduced?.4:1));reefSave=addPickup(reefSave,s.id,i);writeDiveReef(reefSave);
    const p=picks[i];pickedThisDive++;joy=DIVE_JOY_S*.6;diveStore.set({note:p.kind==='litter'?`You cleared ${p.name}: the reef says thank you!`:`You found ${p.name}!`});
    ports.picked?.(p.kind,pickedThisDive===1);drawProgress(s,true);}}
   if(formT>=0){formT+=dt;const k=formT<1?formT:formT>DIVE_FORM_S-1.2?Math.max(0,(DIVE_FORM_S-formT)/1.2):1;room.form(k*k*(3-2*k),form.x,form.y,form.z);if(formT>=DIVE_FORM_S){formT=-1;room.form(0,0,0,0);}}
   // The buddy fish: beside the diver, a little ahead; after a hover it swims toward the next thing to visit and back (it leads).
   if(s){const fx=Math.sin(st.yaw),fz=Math.cos(st.yaw);let gx=st.x+fx*.9+fz*.8,gy=st.y+.25+Math.sin(clock*1.3)*.15,gz=st.z+fz*.9-fx*.8;
    if(still>DIVE_BUDDY_LEAD_S&&nextTarget(s,picks,got,progress(s).found,st.x,st.z,tgt)){const dx=tgt.x-st.x,dz=tgt.z-st.z,d=Math.hypot(dx,dz)||1,u=Math.min(d,1.5+2.5*(.5+.5*Math.sin((still-DIVE_BUDDY_LEAD_S)*1.4-1.57)));gx=st.x+dx/d*u;gz=st.z+dz/d*u;}
    const kb=1-Math.exp(-dt*3);bud.vx+=((gx-bud.x)*4-bud.vx)*kb;bud.vy+=((gy-bud.y)*4-bud.vy)*kb;bud.vz+=((gz-bud.z)*4-bud.vz)*kb;
    bud.x+=bud.vx*dt;bud.y+=bud.vy*dt;bud.z+=bud.vz*dt;const sp=Math.hypot(bud.vx,bud.vz);
    room.setBuddy(bud.x,bud.y,bud.z,sp>.15?bud.vx:fx,sp>.15?bud.vy*.5:0,sp>.15?bud.vz:fz,true);}
   // The underwater football (the pitch zone): drag, a slow sink to the sand, a nudge from the diver's body, the goal line.
   if(room.ball&&room.goal&&s){const g=room.goal,b=ball,R=DIVE_BALL.r,fl=s.floor;
    b.vx*=Math.exp(-dt*DIVE_BALL.drag);b.vz*=Math.exp(-dt*DIVE_BALL.drag);b.vy=b.vy*Math.exp(-dt*DIVE_BALL.drag)-DIVE_BALL.sink*dt;
    const dx=b.x-st.x,dy=b.y-(st.y-.15),dz=b.z-st.z,d=Math.hypot(dx,dy,dz);
    if(d<.85&&d>1e-3&&st.phase==='diving'){const nx=dx/d,ny=dy/d,nz=dz/d,rel=Math.max(0,st.vx*nx+st.vy*ny+st.vz*nz);b.vx+=nx*(rel*DIVE_BALL.push+.4)+st.vx*.25;b.vy+=Math.max(0,ny)*(rel+.3)+.25;b.vz+=nz*(rel*DIVE_BALL.push+.4)+st.vz*.25;
     b.x=st.x+nx*.85;b.z=st.z+nz*.85;}
    b.x+=b.vx*dt;b.y+=b.vy*dt;b.z+=b.vz*dt;const r=Math.hypot(b.x,b.z),lim=DIVE_ROOM_R-1;if(r>lim){b.x*=lim/r;b.z*=lim/r;b.vx*=-.4;b.vz*=-.4;}
    const sand=diveFloor(b.x,b.z,fl)+R;if(b.y<sand){if(b.vy<-.6)room.puff(b.x,sand-R,b.z,clock*(reduced?.4:1));b.y=sand;b.vy=Math.abs(b.vy)*.25;}
    b.y=Math.min(b.y,DIVE_SURFACE_Y-R);
    const c=Math.cos(g.yaw),sn=Math.sin(g.yaw),lx=(b.x-g.x)*c-(b.z-g.z)*sn,lz=(b.x-g.x)*sn+(b.z-g.z)*c;
    if(ballGoalT<0&&b.lz!==0&&Math.sign(lz)!==Math.sign(b.lz)&&Math.abs(lx)<g.w/2-.1&&b.y-g.y<g.h){ballGoalT=0;joy=DIVE_JOY_S;room.puff(b.x,b.y-.2,b.z,clock*(reduced?.4:1));
     diveStore.set({note:'GOAL! Paul the Octopus would have picked that one.',card:{id:'goal',title:DIVE_GOAL_CARD.title,text:DIVE_GOAL_CARD.text,label:DIVE_GOAL_CARD.label,coins:0}});ports.goal?.();}
    b.lz=lz;if(ballGoalT>=0){ballGoalT+=dt;if(ballGoalT>3){ballGoalT=-1;b.x=g.cx;b.z=g.cz;b.y=diveFloor(b.x,b.z,fl)+R+.6;b.vx=b.vy=b.vz=0;b.lz=0;}}
    const bs=Math.hypot(b.vx,b.vz);room.ball.position.set(b.x,b.y,b.z);if(bs>.02&&!reduced){ax.set(b.vz,0,-b.vx).normalize();room.ball.rotateOnWorldAxis(ax,bs*dt/R);}}
   if(dartK&&st.dartT>.6&&s&&st.y-diveFloor(st.x,st.z,s.floor)<1.3)room.puff(st.x,diveFloor(st.x,st.z,s.floor),st.z,clock*(reduced?.4:1));
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
   if(k==='f'||k==='shift'){if(down&&!e.repeat)diveLift.dart=true;e.preventDefault();return true;}// Explore v2: the dart (a quick burst)
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
