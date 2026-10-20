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
import {FIREFLY_SIZE,bugVisualSize,WILD_BUG_HINT,WILD_BUG_RANGE,WILD_FLEE,wildBugCount,FIREFLY_MAP_CAP} from './wildBugsCore';
import {bugMapCount,inBugNorthZone,onSummitSand} from '../town/jobs/bugSpecies';
import {onSummitIsle} from '../town/summitIsle';
import {hideBug as hideFor} from './bugFlight';
import {BUG_LOCAL,bugBandAt,type BugBand} from '../town/jobs/bugSpecies';
import {createBugSpotFx,SPOT_FX,type BugSpotFx} from './bugSpotFx';

export type SwarmSet='bugs'|'fireflies';
export type SwarmFrame={dt:number;x:number;z:number;night:boolean;sunset?:boolean;tier:number;reduced:boolean;busy:boolean;
 /** A Bug squad shift is catching from the swarm (catching lane): its set is always out (even at heat tiers 3-4 / reduced motion,
  *  at the tier-2 count) whatever the sky, so a shift can never run out of bugs. */
 job?:SwarmSet|null};
export type SwarmHit={id:string;index:number;kind:'bug'|'firefly';species:BugSpecies|null;call:FireflyCall|null;x:number;y:number;z:number;dist:number;flying:boolean};
export type SwarmCatch={id:string;kind:'bug'|'firefly';species:BugSpecies|null;call:FireflyCall|null;x:number;y:number;z:number};

const FADE_S=.6,TAU=Math.PI*2,CLOCK_WRAP=600;
let hinted=false;// once per visit (page load)

function attr(n:number){const a=new T.InstancedBufferAttribute(new Float32Array(n*4),4);a.setUsage(T.DynamicDrawUsage);return a;}

type Slot={score?:number;bug:FlightBug;sp:BugSpecies|null;call:FireflyCall|null;size:number;color:T.Color;near:boolean;counted:number;
 mesh:T.InstancedMesh|null;flap:T.InstancedBufferAttribute|null;pose:T.InstancedBufferAttribute|null;
 /** Seconds since it turned up near the player (local density; < 0 = not a local spawn) and whether its species is already in
  *  today's jar (shown with a check, not a glint). */
 spawnT:number;dup:boolean};

export function createBugSwarm(scene:T.Scene,opts:{floor?:(x:number,z:number)=>number;seed?:number}={}){
 const floor=opts.floor??fieldSurfaceHeight;
 const U={uTime:{value:0},uFade:{value:1}};
 const root=new T.Group();root.name='bug-swarm';
 let material:T.MeshStandardMaterial|null=null,glowMat:T.ShaderMaterial|null=null;
 let slots:Slot[]=[],far:T.InstancedMesh|null=null,farFlap:T.InstancedBufferAttribute|null=null,farPose:T.InstancedBufferAttribute|null=null;
 let glow:T.InstancedMesh|null=null,lantern=new T.Vector3(),fx:BugSpotFx|null=null,cam:T.Camera|null=null,spots=0,jobOn=false;
 let built:SwarmSet|null=null,want:SwarmSet='bugs',cap=0,fading=false,lastNight:boolean|null=null,time:'day'|'sunset'='day';
 let recalls=0,seedOverride:number|null=null,pinned:{sl:Slot;at:{x:number;y:number;z:number};t:number}|null=null;
 let clock=0,farAcc=0,farSteps=0,px=0,pz=0,pspeed=0,havePlayer=false,builds=0,updates=0,tris=0;
 const owned:{dispose():void}[]=[];
 const m4=new T.Matrix4(),q=new T.Quaternion(),e=new T.Euler(0,0,0,'YXZ'),p=new T.Vector3(),s=new T.Vector3(),one=new T.Vector3(1,1,1);
 const ctx:StepCtx={px:0,pz:0,pspeed:0,floor};
 const hits:SwarmHit[]=[];const hitPool:SwarmHit[]=[];const ask={tier:0,reduced:false,night:false};

 function drop(){
  pinned=null;if(!built)return;root.removeFromParent();for(const c of [...root.children]){root.remove(c);(c as T.InstancedMesh).dispose?.();}for(const o of owned)o.dispose();owned.length=0;
  slots=[];far=null;farFlap=farPose=null;glow=null;fx=null;material=null;glowMat=null;built=null;cap=0;
 }
 function own<X extends {dispose():void}>(x:X){owned.push(x);return x;}
 function build(set:SwarmSet,n:number,tier:number){
  built=set;cap=n;builds++;U.uFade.value=0;fading=false;
  material=own(bugMaterial(U));tris=0;
  const seed=seedOverride??opts.seed??bugRotationSeed(Math.floor(Date.now()/864e5));
  if(set==='bugs'){
   const list=pickBugsOnMap(seed,tier,time).slice(0,n);
   slots=list.map((sp,i)=>{const h=BUG_HOMES.find(h=>h.id===sp.id)!;
    const bug=createFlightBug({id:sp.id,move:sp.move,x:h.x,z:h.z,wander:h.wander,alert:sp.alert,sneak:sp.sneak,seed:(seed^Math.imul(i+1,0x9e3779b1))>>>0},floor);
    return {bug,sp,call:null,size:bugVisualSize(sp.look.size),color:new T.Color(sp.look.palette[0]),near:false,counted:-99,mesh:null,flap:null,pose:null,spawnT:-1,dup:false};});
   const fg=own(createBugFarGeometry());farFlap=attr(n);farPose=attr(n);fg.setAttribute('iFlap',farFlap);fg.setAttribute('iPose',farPose);
   far=new T.InstancedMesh(fg,material,n);far.name='bug-swarm-far';far.instanceMatrix.setUsage(T.DynamicDrawUsage);far.setColorAt(0,new T.Color('#ffffff'));
   far.instanceColor!.setUsage(T.DynamicDrawUsage);far.boundingSphere=new T.Sphere(new T.Vector3(SUMMIT_CENTER.x,30,SUMMIT_CENTER.z),220);far.count=0;root.add(far);
   fx=own(createBugSpotFx(n));root.add(fx.ground,fx.marks);fx.hide();
   for(const sl of slots){// one full-model mesh per species out today (drawn only while near)
    const g=own(createBugModel(sl.sp));tris+=triangleCount(g);sl.flap=attr(1);sl.pose=attr(1);g.setAttribute('iFlap',sl.flap);g.setAttribute('iPose',sl.pose);
    const mm=new T.InstancedMesh(g,material,1);mm.name='bug-'+sl.bug.id;mm.instanceMatrix.setUsage(T.DynamicDrawUsage);mm.visible=false;
    mm.boundingSphere=new T.Sphere(new T.Vector3(sl.bug.hx,floor(sl.bug.hx,sl.bug.hz)+2,sl.bug.hz),sl.bug.wander+8);sl.mesh=mm;root.add(mm);}
  }else{
   const homes=FIREFLY_HOMES.slice(0,n);
   slots=homes.map((h,i)=>{const call=FIREFLY_SET.find(f=>f.id===h.id)??null;
    const bug=createFlightBug({id:h.id,move:'firefly-drift',x:h.x,z:h.z,wander:h.wander,alert:3,sneak:.3,seed:(seed^Math.imul(i+7,0x85ebca6b))>>>0},floor);
    return {bug,sp:null,call,size:FIREFLY_SIZE,color:new T.Color('#ffffff'),near:true,counted:-99,mesh:null,flap:null,pose:null,spawnT:-1,dup:false};});
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
  if(f.job)want=f.job;
  time=f.sunset?'sunset':'day';
  const dc=Math.hypot(f.x-SUMMIT_CENTER.x,f.z-SUMMIT_CENTER.z);
  ask.tier=f.tier;ask.reduced=f.reduced;ask.night=want==='fireflies';
  const ti=Math.min(2,Math.max(0,Math.floor(f.tier)||0)),jobN=f.job?(f.job==='fireflies'?FIREFLY_MAP_CAP[ti]:bugMapCount(ti)):0;
  const n=f.job?Math.max(jobN,wildBugCount(ask)):dc<(built?WILD_BUG_RANGE.DROP_M:WILD_BUG_RANGE.BUILD_M)?wildBugCount(ask):0;
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
  const live=far!;let fi=0;const isBugs=built==='bugs';jobOn=!!f.job;const spot=fx&&jobOn&&isBugs?fx:null;if(spot)spot.begin(clock);else fx?.hide();
  for(let i=0;i<slots.length;i++){const sl=slots[i],b=sl.bug,d=Math.hypot(b.x-f.x,b.z-f.z);
   if(d>WILD_BUG_RANGE.SIM_M&&b.mode!==Mode.Hidden){if(sl.mesh)sl.mesh.visible=false;continue;}
   const near=d<WILD_BUG_RANGE.NEAR_M,step=near?dt:farStep?fdt:0;
   if(pinned&&pinned.sl===sl){const a=pinned.at;pinned.t+=dt;b.x=a.x;b.y=a.y;b.z=a.z;b.yaw+=Math.sin(pinned.t*14)*.08;b.roll=Math.sin(pinned.t*19)*.35;b.pitch=Math.sin(pinned.t*11)*.25;b.fade=1;}
   else if(step>0&&stepBug(b,step,ctx))flutter(sl);
   if(b.mode===Mode.Hidden){if(sl.mesh)sl.mesh.visible=false;continue;}
   if(sl.spawnT>=0){sl.spawnT+=dt;if(sl.spawnT>SPOT_FX.spawnShow)sl.spawnT=-1;}
   if(spot&&d<SPOT_FX.shadowRange)spotFx(spot,sl,d,i);
   if(isBugs){sl.near=sl.near?d<WILD_BUG_RANGE.FULL_OUT_M:d<WILD_BUG_RANGE.FULL_IN_M;
    if(sl.near&&sl.mesh){sl.mesh.visible=true;sl.mesh.setMatrixAt(0,matrixOf(sl));sl.mesh.instanceMatrix.needsUpdate=true;writeAttrs(sl.flap!,sl.pose!,0,b);sl.flap!.needsUpdate=true;sl.pose!.needsUpdate=true;continue;}
    if(sl.mesh)sl.mesh.visible=false;}
   live.setMatrixAt(fi,matrixOf(sl));if(isBugs)live.setColorAt(fi,sl.color);writeAttrs(farFlap!,farPose!,fi,b);
   if(glow){p.copy(lantern).applyMatrix4(m4);glow.setMatrixAt(fi,m4.compose(p,q.identity(),s.setScalar(2.6*b.fade)));}
   fi++;}
  live.count=fi;live.visible=fi>0;live.instanceMatrix.needsUpdate=true;if(live.instanceColor)live.instanceColor.needsUpdate=true;farFlap!.needsUpdate=true;farPose!.needsUpdate=true;
  if(glow){glow.count=fi;glow.visible=fi>0;glow.instanceMatrix.needsUpdate=true;}
  if(spot)spot.end();
 }
 /** One bug's spotting FX (bug-polish): its contact shadow (flying / hopping), the spawn ring and "!" for a few seconds after it
  *  turned up near the player, and the periodic glint (uncaught) or check (already in the jar) within SPOT_FX.glintRange. */
 function spotFx(fxs:BugSpotFx,sl:Slot,d:number,i:number){const b=sl.bug,g=floor(b.x,b.z),fade=b.fade;if(fade<.05)return;
  const up=Math.max(0,b.y-g),air=b.mode===Mode.Fly||b.mode===Mode.Hover||b.mode===Mode.Hop;
  if(air&&up>.08)fxs.groundAt(b.x,g+.04,b.z,sl.size*(1.15-Math.min(.55,up*.1)),0,fade*(1-Math.min(.6,up*.09)));
  const fresh=sl.spawnT>=0;
  if(fresh)fxs.groundAt(b.x,g+.05,b.z,2.2,1,fade*(1-sl.spawnT/SPOT_FX.spawnShow*.5));
  if(fresh)fxs.markAt(b.x,b.y+sl.size*.5+.45,b.z,.75,2,0,fade);
  else if(d<SPOT_FX.glintRange)fxs.markAt(b.x,b.y+sl.size*(sl.dup?.5:.15)+(sl.dup?.35:0),b.z,sl.dup?.6:sl.size*1.4+.25,sl.dup?1:0,(i*.37)%1,fade);
 }
 function flutter(sl:Slot){
  if(sl.bug.clock-sl.counted>WILD_FLEE.COUNT_EVERY_S){sl.counted=sl.bug.clock;countWildFlutter();}
  if(!hinted){hinted=true;try{window.dispatchEvent(new Event(WILD_BUG_HINT));}catch{}}
 }
 const find=(id:string)=>{for(const sl of slots)if(sl.bug.id===id)return sl;return null;};
 const cand:(Slot&{score?:number})[]=[];const spotOut={x:0,z:0,inView:false};const camPos=new T.Vector3(),camDir=new T.Vector3();
 /** Is a ground spot inside the camera's horizontal view (with a margin)? No camera = treat as out of view. */
 function inView(x:number,z:number){if(!cam)return false;cam.getWorldPosition(camPos);cam.getWorldDirection(camDir);
  const fl=Math.hypot(camDir.x,camDir.z)||1,vx=x-camPos.x,vz=z-camPos.z,vl=Math.hypot(vx,vz)||1;
  const pc=cam as T.PerspectiveCamera,half=pc.isPerspectiveCamera?Math.atan(Math.tan(pc.fov*Math.PI/360)*pc.aspect):.8;
  return (vx*camDir.x+vz*camDir.z)/(vl*fl)>Math.cos(Math.min(Math.PI*.95,half+.16));}
 /** A free spot for a local spawn round (x, z) (spotOut); false when none of the 24 tries is on the island. */
 function localSpot(x:number,z:number,R:number){let fallback=false;const lo=BUG_LOCAL.minR,hi=Math.max(lo+1,R-BUG_LOCAL.edge);
  for(let k=0;k<24;k++){const a=(k*2.399+spots*1.31)%(Math.PI*2),r=lo+(hi-lo)*(((k*7)%6)/5),px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r;
   if(!onSummitIsle(px,pz)||(inBugNorthZone(px,pz)&&!onSummitSand(px,pz)))continue;
   let clash=false;for(const sl of slots){const b=sl.bug,hx=b.mode===Mode.Hidden?b.hx:b.x,hz=b.mode===Mode.Hidden?b.hz:b.z;if(Math.hypot(hx-px,hz-pz)<BUG_LOCAL.spacing){clash=true;break;}}
   if(clash)continue;const v=inView(px,pz);
   if(!v){spotOut.x=px;spotOut.z=pz;spotOut.inView=false;return true;}
   if(!fallback){fallback=true;spotOut.x=px;spotOut.z=pz;spotOut.inView=true;}}
  return fallback;}

 const api={
  update,
  /** Bugs within r metres of (x, y, z), nearest first (a reused array: copy what you keep). Caught (hidden) bugs are left out. */
  query(x:number,y:number,z:number,r:number):readonly SwarmHit[]{
   hits.length=0;
   for(let i=0;i<slots.length;i++){const sl=slots[i],b=sl.bug;if(b.mode===Mode.Hidden||b.fade<.5||pinned?.sl===sl)continue;const d=Math.hypot(b.x-x,b.y-y,b.z-z);if(d>r)continue;
    const h=hitPool[hits.length]??(hitPool[hits.length]={id:'',index:0,kind:'bug',species:null,call:null,x:0,y:0,z:0,dist:0,flying:false});
    h.id=b.id;h.index=i;h.kind=sl.sp?'bug':'firefly';h.species=sl.sp;h.call=sl.call;h.x=b.x;h.y=b.y;h.z=b.z;h.dist=d;h.flying=b.mode===Mode.Fly||b.mode===Mode.Hover||b.mode===Mode.Hop;
    let j=hits.length;hits.push(h);while(j>0&&hits[j-1].dist>h.dist){hits[j]=hits[j-1];hits[j-1]=h;j--;}}
   return hits;},
  /** Scare one bug away from a point (e.g. a missed net swing). */
  startle(id:string,from:{x:number;z:number}){const sl=find(id);if(sl)startleBug(sl.bug,from.x,from.z,floor);return !!sl;},
  /** Catch one: it disappears (a new one turns up at its home later); returns where it was and what it is. */
  catch(id:string):SwarmCatch|null{const sl=find(id);if(!sl||sl.bug.mode===Mode.Hidden)return null;const b=sl.bug;
   const out={id:b.id,kind:sl.sp?'bug' as const:'firefly' as const,species:sl.sp,call:sl.call,x:b.x,y:b.y,z:b.z};if(pinned?.sl===sl)pinned=null;hideBug(b);if(sl.mesh)sl.mesh.visible=false;return out;},
  /** Hold one bug in the net (the catch zoom): it follows `at` (a live point the caller moves) and wiggles; null lets it go. */
  pin(id:string|null,at?:{x:number;y:number;z:number}){if(!id||!at){pinned=null;return true;}const sl=find(id);if(!sl||sl.bug.mode===Mode.Hidden)return false;pinned={sl,at,t:0};return true;},
  /** A new rotation seed for the day bugs (a Bug squad shift's own set, pickBugsOnMap); null = the daily seed. Rebuilds the set. */
  reseed(seed:number|null){if(seed===seedOverride)return;seedOverride=seed;if(built==='bugs')drop();},
  get pinned(){return pinned?.sl.bug.id??null;},
  /** Bug squad (catching lane): when no bug is near the player, call one over. The farthest bug (> `far` m away, not pinned) moves
   *  its home to the free home spot (this set's BUG_HOMES / FIREFLY_HOMES) nearest the player within `within` m, out of sight, and
   *  fades in there. Returns its id, or null. One call = O(slots × homes); the caller throttles it (≤ every 2 s). */
  recall(x:number,z:number,within=90,far=100):string|null{if(!built)return null;const homes=built==='bugs'?BUG_HOMES:FIREFLY_HOMES;
   let best:Slot|null=null,bd=far;for(const sl of slots){if(pinned?.sl===sl)continue;const d=Math.hypot(sl.bug.x-x,sl.bug.z-z);if(d>bd){bd=d;best=sl;}}
   if(!best)return null;let hx=0,hz=0,hd=within;
   const taken=(px:number,pz:number)=>slots.some(sl=>sl!==best&&Math.hypot(sl.bug.hx-px,sl.bug.hz-pz)<10);
   for(const h of homes){const d=Math.hypot(h.x-x,h.z-z);if(d>=hd||d<3)continue;if(taken(h.x,h.z))continue;hd=d;hx=h.x;hz=h.z;}
   // No free home near (homes are 18+ m apart over a big island): a spot on a ring 16-28 m round the player, on Summit Isle ground
   // (north of the summit only on the sand, like the homes), so a shift always has bugs about.
   if(hd>=within)for(let k=0;k<12;k++){const a=(k*2.399+recalls*.7)%(Math.PI*2),r=16+(k%3)*6,px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r;
    if(!onSummitIsle(px,pz)||(inBugNorthZone(px,pz)&&!onSummitSand(px,pz))||taken(px,pz))continue;hd=r;hx=px;hz=pz;break;}
   if(hd>=within)return null;recalls++;best.bug.hx=hx;best.bug.hz=hz;hideFor(best.bug,.05);return best.bug.id;},
  /** Swap between the day bugs and the night fireflies (fades out, rebuilds, fades in). Town drives it from Day / Night. */
  setSet(set:SwarmSet){want=set;},
  /** The follow camera (Town.tsx), so local spawns land outside its view. */
  setCamera(c:T.Camera|null){cam=c;},
  /** Bug squad local density (bug-polish; BUG_LOCAL): keep at least `want` bugs within `radius` m of (x, z). Counts bugs out there
   *  (and ones about to turn up there); when short, sends the best others over: uncaught species first (those whose band matches
   *  the terrain here first), then caught ones (shown with a check), farthest first, never the pinned one. Each lands on a spot
   *  minR..radius-edge m away, on Summit Isle ground, out of the camera's view when there is one, ≥ spacing m from the others, and
   *  fades in with a ground ring and a "!". `caught(id)` = already in today's jar. O(slots × 24) per call; the caller throttles it.
   *  Returns how many were sent. */
  ambient(x:number,z:number,o:{want?:number;radius?:number;caught:(id:string)=>boolean}):number{
   if(!built)return 0;const R=o.radius??BUG_LOCAL.radius,isBugs=built==='bugs';
   const band:BugBand|null=isBugs?bugBandAt(x,z):null;let near=0;
   for(const sl of slots){const b=sl.bug,id=sl.sp?.id??sl.call?.id??'';sl.dup=o.caught(id);
    if(pinned?.sl===sl||(b.mode===Mode.Hidden?b.respawn<=.6&&Math.hypot(b.hx-x,b.hz-z)<R:Math.hypot(b.x-x,b.z-z)<R)){near++;continue;}}
   let need=Math.min(o.want??BUG_LOCAL.want,slots.length)-near;if(need<=0)return 0;
   cand.length=0;
   for(const sl of slots){const b=sl.bug;if(pinned?.sl===sl)continue;
    if(b.mode===Mode.Hidden?b.respawn<=.6&&Math.hypot(b.hx-x,b.hz-z)<R:Math.hypot(b.x-x,b.z-z)<R)continue;
    const waiting=b.mode===Mode.Hidden&&b.respawn>.6;// caught: its 45 s are not up
    sl.score=(sl.dup?100:0)+(waiting?50:0)+(band&&sl.sp&&sl.sp.band!==band?10:0)-Math.min(1000,Math.hypot(b.x-x,b.z-z))/2000;
    let j=cand.length;cand.push(sl);while(j>0&&(cand[j-1].score??0)>(sl.score??0)){cand[j]=cand[j-1];cand[j-1]=sl;j--;}}
   let sent=0;
   for(const sl of cand){if(need<=0)break;if(!localSpot(x,z,R))break;
    sl.bug.hx=spotOut.x;sl.bug.hz=spotOut.z;hideFor(sl.bug,.05+sent*.15);sl.spawnT=0;need--;sent++;spots++;}
   return sent;},
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
  get far(){return far;},get glow(){return glow;},get spotFx(){return fx;},get localSpawns(){return spots;},
  /** Probes and tests: forget the once-a-visit hint. */resetHint(){hinted=false;},
 };
 return api;
}
export type BugSwarm=ReturnType<typeof createBugSwarm>;
