/**
 * The Summit Isle bug swarm (Oct 20 2026, docs/island-jobs.md §15 "Bug flight"): the island's real bugs, shared by the wild bugs
 * (wildBugs.ts) and the bug jobs' catching. Rules and caps: wildBugsCore.ts; models: bugModels.ts; motion: bugFlight.ts.
 *
 * Rendering: one shared MeshStandardMaterial (vertex colours, no textures) whose vertex shader flaps wings, lifts wing cases and
 * walks legs per instance (iFlap = rate, amplitude, mid angle, phase offset; iPose = case opening, leg phase offset, stride, leg
 * rate) and whose fragment adds the morpho / dragonfly sheen and the firefly lantern. Per species near the player: one
 * InstancedMesh with that species' full model; every other bug: one shared far-silhouette InstancedMesh tinted per instance. At
 * Night: firefly bodies + one additive glow-sprite draw. Draw calls: day 1 + (species within FULL_IN_M, usually 0–2); night 2.
 *
 * API for the catching lane: query(x, y, z, r) → nearby bugs (a reused array), startle(id, from), catch(id) → where + what,
 * setSet('bugs' | 'fireflies') with a fade, position(id, out) for the zoom camera. No per-frame allocation in update().
 */
import * as T from 'three';
import {BUG_HOMES,FIREFLY_HOMES,FIREFLY_SET,bugRotationSeed,pickBugsOnMap,type BugSpecies,type FireflyCall} from '../town/jobs/bugSpecies';
import {SUMMIT_CENTER} from '../town/summitIsle';
import {fieldSurfaceHeight} from '../town/venues';
import {countWildFlutter} from '../analytics/summitEvents';
import {createBugFarGeometry,createBugModel,triangleCount} from './bugModels';
import {bugMaterial,glowMaterial} from './bugMaterial';
import {Mode,createFlightBug,hideBug,startle as startleBug,stepBug,type FlightBug,type StepCtx} from './bugFlight';
import {FIREFLY_SIZE,bugVisualSize,WILD_BUG_HINT,WILD_BUG_RANGE,WILD_FLEE,wildBugCount} from './wildBugsCore';

export type SwarmSet='bugs'|'fireflies';
export type SwarmFrame={dt:number;x:number;z:number;night:boolean;sunset?:boolean;tier:number;reduced:boolean;busy:boolean};
export type SwarmHit={id:string;index:number;kind:'bug'|'firefly';species:BugSpecies|null;call:FireflyCall|null;x:number;y:number;z:number;dist:number;flying:boolean};
export type SwarmCatch={id:string;kind:'bug'|'firefly';species:BugSpecies|null;call:FireflyCall|null;x:number;y:number;z:number};

const FADE_S=.6,TAU=Math.PI*2,CLOCK_WRAP=600;
let hinted=false;// once per visit (page load)

function attr(n:number){const a=new T.InstancedBufferAttribute(new Float32Array(n*4),4);a.setUsage(T.DynamicDrawUsage);return a;}

type Slot={bug:FlightBug;sp:BugSpecies|null;call:FireflyCall|null;size:number;color:T.Color;near:boolean;counted:number;
 mesh:T.InstancedMesh|null;flap:T.InstancedBufferAttribute|null;pose:T.InstancedBufferAttribute|null};

export function createBugSwarm(scene:T.Scene,opts:{floor?:(x:number,z:number)=>number;seed?:number}={}){
 const floor=opts.floor??fieldSurfaceHeight;
 const U={uTime:{value:0},uFade:{value:1}};
 const root=new T.Group();root.name='bug-swarm';
 let material:T.MeshStandardMaterial|null=null,glowMat:T.ShaderMaterial|null=null;
 let slots:Slot[]=[],far:T.InstancedMesh|null=null,farFlap:T.InstancedBufferAttribute|null=null,farPose:T.InstancedBufferAttribute|null=null;
 let glow:T.InstancedMesh|null=null,lantern=new T.Vector3();
 let built:SwarmSet|null=null,want:SwarmSet='bugs',cap=0,fading=false,lastNight:boolean|null=null,time:'day'|'sunset'='day';
 let clock=0,farAcc=0,farSteps=0,px=0,pz=0,pspeed=0,havePlayer=false,builds=0,updates=0,tris=0;
 const owned:{dispose():void}[]=[];
 const m4=new T.Matrix4(),q=new T.Quaternion(),e=new T.Euler(0,0,0,'YXZ'),p=new T.Vector3(),s=new T.Vector3(),one=new T.Vector3(1,1,1);
 const ctx:StepCtx={px:0,pz:0,pspeed:0,floor};
 const hits:SwarmHit[]=[];const hitPool:SwarmHit[]=[];const ask={tier:0,reduced:false,night:false};

 function drop(){
  if(!built)return;root.removeFromParent();for(const c of [...root.children]){root.remove(c);(c as T.InstancedMesh).dispose?.();}for(const o of owned)o.dispose();owned.length=0;
  slots=[];far=null;farFlap=farPose=null;glow=null;material=null;glowMat=null;built=null;cap=0;
 }
 function own<X extends {dispose():void}>(x:X){owned.push(x);return x;}
 function build(set:SwarmSet,n:number,tier:number){
  built=set;cap=n;builds++;U.uFade.value=0;fading=false;
  material=own(bugMaterial(U));tris=0;
  const seed=opts.seed??bugRotationSeed(Math.floor(Date.now()/864e5));
  if(set==='bugs'){
   const list=pickBugsOnMap(seed,tier,time).slice(0,n);
   slots=list.map((sp,i)=>{const h=BUG_HOMES.find(h=>h.id===sp.id)!;
    const bug=createFlightBug({id:sp.id,move:sp.move,x:h.x,z:h.z,wander:h.wander,alert:sp.alert,sneak:sp.sneak,seed:(seed^Math.imul(i+1,0x9e3779b1))>>>0},floor);
    return {bug,sp,call:null,size:bugVisualSize(sp.look.size),color:new T.Color(sp.look.palette[0]),near:false,counted:-99,mesh:null,flap:null,pose:null};});
   const fg=own(createBugFarGeometry());farFlap=attr(n);farPose=attr(n);fg.setAttribute('iFlap',farFlap);fg.setAttribute('iPose',farPose);
   far=new T.InstancedMesh(fg,material,n);far.name='bug-swarm-far';far.instanceMatrix.setUsage(T.DynamicDrawUsage);far.setColorAt(0,new T.Color('#ffffff'));
   far.instanceColor!.setUsage(T.DynamicDrawUsage);far.boundingSphere=new T.Sphere(new T.Vector3(SUMMIT_CENTER.x,30,SUMMIT_CENTER.z),220);far.count=0;root.add(far);
   for(const sl of slots){// one full-model mesh per species out today (drawn only while near)
    const g=own(createBugModel(sl.sp));tris+=triangleCount(g);sl.flap=attr(1);sl.pose=attr(1);g.setAttribute('iFlap',sl.flap);g.setAttribute('iPose',sl.pose);
    const mm=new T.InstancedMesh(g,material,1);mm.name='bug-'+sl.bug.id;mm.instanceMatrix.setUsage(T.DynamicDrawUsage);mm.visible=false;
    mm.boundingSphere=new T.Sphere(new T.Vector3(sl.bug.hx,floor(sl.bug.hx,sl.bug.hz)+2,sl.bug.hz),sl.bug.wander+8);sl.mesh=mm;root.add(mm);}
  }else{
   const homes=FIREFLY_HOMES.slice(0,n);
   slots=homes.map((h,i)=>{const call=FIREFLY_SET.find(f=>f.id===h.id)??null;
    const bug=createFlightBug({id:h.id,move:'firefly-drift',x:h.x,z:h.z,wander:h.wander,alert:3,sneak:.3,seed:(seed^Math.imul(i+7,0x85ebca6b))>>>0},floor);
    return {bug,sp:null,call,size:FIREFLY_SIZE,color:new T.Color('#ffffff'),near:true,counted:-99,mesh:null,flap:null,pose:null};});
   const g=own(createBugModel(null));tris=triangleCount(g);farFlap=attr(n);farPose=attr(n);g.setAttribute('iFlap',farFlap);g.setAttribute('iPose',farPose);
   // The lantern's middle in model space (the glow-flagged vertices), where each glow sprite sits.
   const pa=g.getAttribute('position'),ma=g.getAttribute('aMisc');let k=0;lantern.set(0,0,0);for(let i=0;i<pa.count;i++)if(ma.getW(i)>0){lantern.x+=pa.getX(i);lantern.y+=pa.getY(i);lantern.z+=pa.getZ(i);k++;}if(k)lantern.multiplyScalar(1/k);
   far=new T.InstancedMesh(g,material,n);far.name='firefly-bodies';far.instanceMatrix.setUsage(T.DynamicDrawUsage);far.count=0;
   far.boundingSphere=new T.Sphere(new T.Vector3(SUMMIT_CENTER.x,30,SUMMIT_CENTER.z),220);root.add(far);
   glowMat=own(glowMaterial(U));const gg=own(new T.PlaneGeometry(1,1));gg.setAttribute('iPose',farPose);
   glow=new T.InstancedMesh(gg,glowMat,n);glow.name='firefly-glow';glow.instanceMatrix.setUsage(T.DynamicDrawUsage);glow.count=0;glow.boundingSphere=far.boundingSphere;glow.renderOrder=2;root.add(glow);
  }
  scene.add(root);
 }

 function writeAttrs(a:T.InstancedBufferAttribute,pa:T.InstancedBufferAttribute,i:number,b:FlightBug){
  const t=U.uTime.value;
  a.setXYZW(i,b.fhz,b.famp,b.fbase,(b.flap-t*b.fhz*TAU)%(TAU*1000));
  pa.setXYZW(i,b.open,(b.leg-t*b.legHz)%(TAU*1000),b.legAmp,b.legHz);
 }
 function matrixOf(sl:Slot){const b=sl.bug;
  const bob=b.mode===Mode.Fly||b.mode===Mode.Hover?-Math.sin(b.flap)*.035*b.famp*sl.size:0;
  e.set(b.pitch,b.yaw,b.roll);q.setFromEuler(e);s.setScalar(sl.size*b.fade);return m4.compose(p.set(b.x,b.y+bob,b.z),q,s);}

 /** Per frame (components/Town.tsx). */
 function update(f:SwarmFrame){
  const night=f.night;if(night!==lastNight){lastNight=night;want=night?'fireflies':'bugs';}
  time=f.sunset?'sunset':'day';
  const dc=Math.hypot(f.x-SUMMIT_CENTER.x,f.z-SUMMIT_CENTER.z);
  ask.tier=f.tier;ask.reduced=f.reduced;ask.night=want==='fireflies';
  const n=dc<(built?WILD_BUG_RANGE.DROP_M:WILD_BUG_RANGE.BUILD_M)?wildBugCount(ask):0;
  if(built&&(!n||(n!==cap&&!fading&&built===want)))drop();
  if(!n){havePlayer=false;return;}
  if(built&&built!==want)fading=true;// fade out, then swap sets
  if(!built)build(want,n,Math.min(2,Math.max(0,Math.floor(f.tier)||0)));
  root.visible=!f.busy;
  if(f.dt<=0)return;
  const dt=Math.min(f.dt,.25);
  if(fading){U.uFade.value=Math.max(0,U.uFade.value-dt/FADE_S);if(U.uFade.value<=0){drop();return;}}
  else U.uFade.value=Math.min(1,U.uFade.value+dt/FADE_S);
  if(f.busy)return;
  // Player speed (m/s), eased: running scares bugs, walking slowly or standing still lets you sneak up.
  if(havePlayer){const v=Math.min(10,Math.hypot(f.x-px,f.z-pz)/dt);pspeed+=(v-pspeed)*(1-Math.exp(-10*dt));}else pspeed=0;
  px=f.x;pz=f.z;havePlayer=true;
  clock=(clock+dt)%CLOCK_WRAP;U.uTime.value=clock;
  farAcc+=dt;const farStep=farAcc>=1/WILD_BUG_RANGE.FAR_HZ;const fdt=Math.min(farAcc,.25);if(farStep){farAcc=0;farSteps++;}
  ctx.px=f.x;ctx.pz=f.z;ctx.pspeed=pspeed;updates++;
  const live=far!;let fi=0;const isBugs=built==='bugs';
  for(let i=0;i<slots.length;i++){const sl=slots[i],b=sl.bug,d=Math.hypot(b.x-f.x,b.z-f.z);
   if(d>WILD_BUG_RANGE.SIM_M&&b.mode!==Mode.Hidden){if(sl.mesh)sl.mesh.visible=false;continue;}
   const near=d<WILD_BUG_RANGE.NEAR_M,step=near?dt:farStep?fdt:0;
   if(step>0&&stepBug(b,step,ctx))flutter(sl);
   if(b.mode===Mode.Hidden){if(sl.mesh)sl.mesh.visible=false;continue;}
   if(isBugs){sl.near=sl.near?d<WILD_BUG_RANGE.FULL_OUT_M:d<WILD_BUG_RANGE.FULL_IN_M;
    if(sl.near&&sl.mesh){sl.mesh.visible=true;sl.mesh.setMatrixAt(0,matrixOf(sl));sl.mesh.instanceMatrix.needsUpdate=true;writeAttrs(sl.flap!,sl.pose!,0,b);sl.flap!.needsUpdate=true;sl.pose!.needsUpdate=true;continue;}
    if(sl.mesh)sl.mesh.visible=false;}
   live.setMatrixAt(fi,matrixOf(sl));if(isBugs)live.setColorAt(fi,sl.color);writeAttrs(farFlap!,farPose!,fi,b);
   if(glow){p.copy(lantern).applyMatrix4(m4);glow.setMatrixAt(fi,m4.compose(p,q.identity(),s.setScalar(2.6*b.fade)));}
   fi++;}
  live.count=fi;live.visible=fi>0;live.instanceMatrix.needsUpdate=true;if(live.instanceColor)live.instanceColor.needsUpdate=true;farFlap!.needsUpdate=true;farPose!.needsUpdate=true;
  if(glow){glow.count=fi;glow.visible=fi>0;glow.instanceMatrix.needsUpdate=true;}
 }
 function flutter(sl:Slot){
  if(sl.bug.clock-sl.counted>WILD_FLEE.COUNT_EVERY_S){sl.counted=sl.bug.clock;countWildFlutter();}
  if(!hinted){hinted=true;try{window.dispatchEvent(new Event(WILD_BUG_HINT));}catch{}}
 }
 const find=(id:string)=>{for(const sl of slots)if(sl.bug.id===id)return sl;return null;};

 const api={
  update,
  /** Bugs within r metres of (x, y, z), nearest first (a reused array: copy what you keep). Caught (hidden) bugs are left out. */
  query(x:number,y:number,z:number,r:number):readonly SwarmHit[]{
   hits.length=0;
   for(let i=0;i<slots.length;i++){const sl=slots[i],b=sl.bug;if(b.mode===Mode.Hidden||b.fade<.5)continue;const d=Math.hypot(b.x-x,b.y-y,b.z-z);if(d>r)continue;
    const h=hitPool[hits.length]??(hitPool[hits.length]={id:'',index:0,kind:'bug',species:null,call:null,x:0,y:0,z:0,dist:0,flying:false});
    h.id=b.id;h.index=i;h.kind=sl.sp?'bug':'firefly';h.species=sl.sp;h.call=sl.call;h.x=b.x;h.y=b.y;h.z=b.z;h.dist=d;h.flying=b.mode===Mode.Fly||b.mode===Mode.Hover||b.mode===Mode.Hop;
    let j=hits.length;hits.push(h);while(j>0&&hits[j-1].dist>h.dist){hits[j]=hits[j-1];hits[j-1]=h;j--;}}
   return hits;},
  /** Scare one bug away from a point (e.g. a missed net swing). */
  startle(id:string,from:{x:number;z:number}){const sl=find(id);if(sl)startleBug(sl.bug,from.x,from.z,floor);return !!sl;},
  /** Catch one: it disappears (a new one turns up at its home later); returns where it was and what it is. */
  catch(id:string):SwarmCatch|null{const sl=find(id);if(!sl||sl.bug.mode===Mode.Hidden)return null;const b=sl.bug;
   const out={id:b.id,kind:sl.sp?'bug' as const:'firefly' as const,species:sl.sp,call:sl.call,x:b.x,y:b.y,z:b.z};hideBug(b);if(sl.mesh)sl.mesh.visible=false;return out;},
  /** Swap between the day bugs and the night fireflies (fades out, rebuilds, fades in). Town drives it from Day / Night. */
  setSet(set:SwarmSet){want=set;},
  /** World position of a bug for the zoom camera (null when caught or not out). */
  position(id:string,out:{x:number;y:number;z:number}){const sl=find(id);if(!sl||sl.bug.mode===Mode.Hidden)return null;out.x=sl.bug.x;out.y=sl.bug.y;out.z=sl.bug.z;return out;},
  /** Heading (rad, 0 = +z) of a bug, for framing a close-up. */
  heading(id:string){return find(id)?.bug.yaw??0;},
  dispose(){drop();},
  get set(){return built;},get count(){return slots.length;},get ids(){return slots.map(sl=>sl.bug.id);},
  get bugs(){return slots.map(sl=>sl.bug) as readonly FlightBug[];},
  get playerSpeed(){return pspeed;},get builds(){return builds;},get updates(){return updates;},get farSteps(){return farSteps;},get root(){return built?root:null;},
  /** Visible draws this frame. */
  get drawCalls(){if(!built||!root.visible)return 0;let n=0;root.traverse(o=>{if((o as T.InstancedMesh).isInstancedMesh&&o.visible&&(o as T.InstancedMesh).count>0)n++;});return n;},
  /** Triangles of all full models built (each drawn only while near). */
  get triangles(){return tris;},
  get far(){return far;},get glow(){return glow;},
  /** Probes and tests: forget the once-a-visit hint. */resetHint(){hinted=false;},
 };
 return api;
}
export type BugSwarm=ReturnType<typeof createBugSwarm>;
