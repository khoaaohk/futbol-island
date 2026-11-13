import * as T from 'three';
import {PARK_POND,POND_Y,pondQ,pondWade} from './westParkLayout';
import {reefFishModel} from '../graphics/diveFish';
import {createBugModel} from '../graphics/bugModels';
import {bugMaterial} from '../graphics/bugMaterial';
import {BUG_SPECIES} from './jobs/bugSpecies';
import {WATER_UNIFORMS} from '../graphics/waterSurface';
import {pushPondRipple} from '../graphics/pondWater';
import {POND_NET} from './pondBugs';

/**
 * Stadium Park pond life (Nov 13 2026, owner: "make it lifelike"). Reuses the island's own pieces:
 *  - koi: the dive rooms' 92-triangle reef fish model (diveFish.ts, look 'koi'), ONE InstancedMesh, flattened to swim in the 7 cm
 *    between the pond bed and the surface; they wander, wag, keep inside the water and scatter from a walker or a splash;
 *  - dragonflies: the Bug squad's Midfield Dragonfly model and the bug swarm's flapping material (bugModels.ts, bugMaterial.ts),
 *    ONE InstancedMesh: hover, dart, hover again, and dart off when you rush close. Nov 13 2026: they are the Bug book's
 *    Midfield Dragonfly and can be netted (pondBugs.ts): a calm player is not fled from and now and then gets a curious visit;
 *    nearFly / flyAt / netFly serve the "Net it" prompt, a netted one is let go and comes back after POND_NET.away s;
 *  - splashes and ripples: the swim ripple and splash-down pools (ballEffects.ts) via the sink, plus the pond shader's own rings
 *    (pondWater.ts pushPondRipple), when a walker wades or a ball lands in or rolls through the water.
 * Heat: nothing runs or draws unless the west region is shown and the player is within POND_LIFE.near m of the pond; then a few
 * dozen ALU per animal per frame, 2 draws (frustum-culled to the pond). Lite mode (heat tier 2+, the slow governor): fewer koi,
 * no dragonflies, sparser ripples. Still mode (reduced motion, static ambience): everything holds still (no ripples, no splashes).
 * No allocation per frame.
 */
export const POND_LIFE={near:90,koi:[7,4] as const,flies:2,scatter:6,flyFlee:3.2,stepEvery:.42,ballDrop:.35} as const;
/**
 * The player in the water (Nov 13 2026, owner N5): landing in the pond, footsteps through it and riding through it.
 *  - Landing (a jump, the jetpack's or the parachute's touchdown, a fall): the shared splash-down crown (ballEffects.splashDown via
 *    the sink), a burst of pooled droplets and a pond ripple ring, all scaled by the landing speed (m/s, landMin..landMax).
 *  - Walking: a small splash at each footstep (a speed-scaled interval: the rig's stride timing is not exposed), alternating feet,
 *    and a trailing wake ripple behind the walker every wakeEvery s.
 *  - Riding (any ground ride): a continuous spray from the wheels (more and faster drops with speed) and a V-shaped bow wake
 *    (two stretched ripples angled back either side of the heading) every rideWakeEvery s.
 * Heat: ONE pooled droplet InstancedMesh (DROPS × 20 triangles, 1 draw, hidden when no drop is alive); rings are the shared ripple
 * and splash pools. Runs only while the player is in the water near the pond. Lite mode (heat tier 2+): half the droplets.
 * Reduced motion: half-size effects and fewer drops. Still mode (static ambience): none. Other players: pondRemote.ts reads their
 * interpolated poses (a few Hz on the wire, so no real stride timing) and calls remoteFx() at speed-scaled intervals.
 */
export const POND_FX={drops:32,landMin:2.5,landMax:14,stepMin:.24,stepMax:.5,stepStride:1.15,wakeEvery:.5,rideWakeEvery:.18,sprayEvery:.07,rideMin:1.2,gravity:9.8} as const;
export type PondMode=0|1|2;
export type PondInput={x:number;z:number;speed:number;onGround:boolean;ballX:number;ballY:number;ballZ:number;ballOn:boolean;shown:boolean;mode:PondMode;
 /** The player's feet height (m) for the landing speed; heading (rad, forward = (sin, cos)); riding a ground ride; reduced motion;
  *  the ball's own splashes come from the skip rules (pondSkip.ts), so the drop splash here is skipped while `ballWet`. */
 y?:number;heading?:number;riding?:boolean;reduced?:boolean;ballWet?:boolean;
 /** Nov 13 2026: on foot and still or slow (pondBugs.ts POND_NET.calmSpeed): the dragonflies stay, and come to look. */
 calm?:boolean};
export type PondSink={splash:(x:number,z:number,size:number)=>void;ring:(x:number,z:number,radius:number)=>void;
 /** A stretched ripple (the bow wake's arms): radius, stretch along `angle` (rad). Falls back to ring() when absent. */
 wake?:(x:number,z:number,radius:number,stretch:number,angle:number)=>void};

export function createPondLife(scene:T.Scene,o:{phone:boolean;sink:PondSink}){
 const {x:cx,z:cz,rx,rz}=PARK_POND,cap=POND_LIFE.koi[0];
 let seed=97;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
 /** A random point in the water within q of the edge, written into `pick` (no allocation). */
 const pick={x:0,z:0},inside=(q:number)=>{const a=rnd()*Math.PI*2,r=Math.sqrt(rnd())*q;pick.x=cx+Math.cos(a)*rx*r;pick.z=cz+Math.sin(a)*rz*r;return pick;};
 // --- koi -------------------------------------------------------------------------------------------------------------------
 const {geometry:fishGeo}=reefFishModel('koi'),fishMat=new T.MeshStandardMaterial({vertexColors:true,roughness:.5});
 const fish=new T.InstancedMesh(fishGeo,fishMat,cap);fish.name='park-pond-koi';fish.castShadow=false;fish.receiveShadow=false;
 fish.boundingSphere=new T.Sphere(new T.Vector3(cx,0,cz),Math.max(rx,rz)+2);fish.visible=false;scene.add(fish);
 const F={x:new Float32Array(cap),z:new Float32Array(cap),vx:new Float32Array(cap),vz:new Float32Array(cap),tx:new Float32Array(cap),tz:new Float32Array(cap),flee:new Float32Array(cap),ph:new Float32Array(cap),len:new Float32Array(cap)};
 for(let i=0;i<cap;i++){inside(.7);F.x[i]=pick.x;F.z[i]=pick.z;inside(.75);F.tx[i]=pick.x;F.tz[i]=pick.z;F.ph[i]=rnd()*6.28;F.len[i]=.5+rnd()*.3;}
 // --- dragonflies -----------------------------------------------------------------------------------------------------------
 const sp=BUG_SPECIES.find(s=>s.id==='dragonfly')??null,flyGeo=createBugModel(sp),nf=POND_LIFE.flies;
 const flap=new T.InstancedBufferAttribute(new Float32Array(nf*4),4),pose=new T.InstancedBufferAttribute(new Float32Array(nf*4),4);
 for(let i=0;i<nf;i++)flap.setXYZW(i,17,.28,.04,i*1.7);flyGeo.setAttribute('iFlap',flap);flyGeo.setAttribute('iPose',pose);
 const flyMat=bugMaterial({uTime:WATER_UNIFORMS.uWaterTime,uFade:{value:1}}),flies=new T.InstancedMesh(flyGeo,flyMat,nf);flies.name='park-pond-dragonflies';
 flies.castShadow=false;flies.boundingSphere=new T.Sphere(new T.Vector3(cx,1,cz),Math.max(rx,rz)+4);flies.visible=false;scene.add(flies);
 const D={x:new Float32Array(nf),y:new Float32Array(nf),z:new Float32Array(nf),tx:new Float32Array(nf),ty:new Float32Array(nf),tz:new Float32Array(nf),hold:new Float32Array(nf),yaw:new Float32Array(nf),away:new Float32Array(nf)};
 for(let i=0;i<nf;i++){inside(.8);D.x[i]=D.tx[i]=pick.x;D.z[i]=D.tz[i]=pick.z;D.y[i]=D.ty[i]=.7+rnd()*.5;D.hold[i]=rnd()*2;}
 const m4=new T.Matrix4(),q=new T.Quaternion(),p=new T.Vector3(),s=new T.Vector3(),up=new T.Vector3(0,1,0);
 const writeFish=(n:number,t:number)=>{for(let i=0;i<n;i++){const sp2=Math.hypot(F.vx[i],F.vz[i]),yaw=Math.atan2(F.vz[i],-F.vx[i])+Math.sin(t*(4+sp2*5)+F.ph[i])*(.08+Math.min(.18,sp2*.12));
  q.setFromAxisAngle(up,yaw);p.set(F.x[i],POND_Y-.035,F.z[i]);s.set(F.len[i],F.len[i]*.3,F.len[i]);fish.setMatrixAt(i,m4.compose(p,q,s));}fish.count=n;fish.instanceMatrix.needsUpdate=true;};
 const writeFlies=()=>{for(let i=0;i<nf;i++){q.setFromAxisAngle(up,D.yaw[i]);p.set(D.x[i],D.y[i],D.z[i]);s.setScalar(D.away[i]>0?0:.7);flies.setMatrixAt(i,m4.compose(p,q,s));}flies.instanceMatrix.needsUpdate=true;};
 writeFish(cap,0);writeFlies();
 // --- droplets (N5): one pooled instanced mesh, gravity arcs, gone at the water line ------------------------------------------
 const ND=POND_FX.drops,dropGeo=new T.IcosahedronGeometry(.045,0),dropMat=new T.MeshBasicMaterial({color:'#e9fbff',transparent:true,opacity:.85,depthWrite:false});
 const drops=new T.InstancedMesh(dropGeo,dropMat,ND);drops.name='park-pond-droplets';drops.castShadow=false;drops.receiveShadow=false;drops.frustumCulled=false;drops.visible=false;scene.add(drops);
 const DP={x:new Float32Array(ND),y:new Float32Array(ND),z:new Float32Array(ND),vx:new Float32Array(ND),vy:new Float32Array(ND),vz:new Float32Array(ND),life:new Float32Array(ND)};
 let dropCursor=0,dropsAlive=0;
 const fxStats={landings:0,steps:0,sprays:0,wakes:0,drops:0,lastLand:0};
 /** `n` drops from (x, z) on arcs: up m/s, out m/s, biased along (bx, bz) by `bias` m/s (a wheel's throw). */
 const spawnDrops=(x:number,z:number,n:number,up:number,out:number,bx=0,bz=0,bias=0)=>{for(let k=0;k<n;k++){const i=dropCursor++%ND,a=rnd()*Math.PI*2,r=.4+rnd()*.6;
  DP.x[i]=x;DP.y[i]=POND_Y+.04;DP.z[i]=z;DP.vx[i]=Math.cos(a)*out*r+bx*bias;DP.vz[i]=Math.sin(a)*out*r+bz*bias;DP.vy[i]=up*(.6+rnd()*.5);DP.life[i]=1.2;fxStats.drops++;}
  if(n>0)drops.visible=true;};
 const stepDrops=(dt:number)=>{let alive=0;
  for(let i=0;i<ND;i++){if(DP.life[i]<=0)continue;DP.life[i]-=dt;DP.vy[i]-=POND_FX.gravity*dt;DP.x[i]+=DP.vx[i]*dt;DP.y[i]+=DP.vy[i]*dt;DP.z[i]+=DP.vz[i]*dt;
   if(DP.y[i]<POND_Y||DP.life[i]<=0){DP.life[i]=0;m4.makeScale(0,0,0);drops.setMatrixAt(i,m4);continue;}
   alive++;const sc=.6+.4*Math.min(1,DP.life[i]);m4.makeScale(sc,sc*1.4,sc).setPosition(DP.x[i],DP.y[i],DP.z[i]);drops.setMatrixAt(i,m4);}
  drops.instanceMatrix.needsUpdate=true;dropsAlive=alive;if(!alive)drops.visible=false;};
 for(let i=0;i<ND;i++){m4.makeScale(0,0,0);drops.setMatrixAt(i,m4);}
 let t=0,wet=0,stepT=0,wakeT=0,sprayT=0,foot=1,airMaxFall=0,prevY=0,wasGround=true,ballY=9,ballT=0,ballPX=0,ballPZ=0,sx=0,sz=0,splashAge=9;
 const fxOff=(i:PondInput)=>i.mode===2&&!i.reduced;
 /** remoteFx's reused input (mode and reduced only). */
 const rin:PondInput={x:0,z:0,speed:0,onGround:true,ballX:0,ballY:9,ballZ:0,ballOn:false,shown:true,mode:0,reduced:false};
 const dropScale=(i:PondInput)=>(i.mode>=1?.5:1)*(i.reduced?.5:1);
 const splashAt=(x:number,z:number,size:number,strength:number,mode:PondMode)=>{if(mode===2)return;o.sink.splash(x,z,size);o.sink.ring(x,z,1.8);pushPondRipple(x,z,strength);sx=x;sz=z;splashAge=0;};
 const wakeAt=(x:number,z:number,r:number,stretch:number,angle:number)=>{if(o.sink.wake)o.sink.wake(x,z,r,stretch,angle);else o.sink.ring(x,z,r);fxStats.wakes++;};
 /** Landing in the water at `fall` m/s: crown, droplets and a ripple ring scaled by it. */
 function landSplash(x:number,z:number,fall:number,i:PondInput){
  const k=Math.max(0,Math.min(1,(fall-POND_FX.landMin)/(POND_FX.landMax-POND_FX.landMin))),red=i.reduced?.5:1;
  o.sink.splash(x,z,(.55+k*1.05)*red);o.sink.ring(x,z,(1.6+k*2.4)*red);pushPondRipple(x,z,.6+k*.4);sx=x;sz=z;splashAge=0;
  spawnDrops(x,z,Math.round((10+k*14)*dropScale(i)),(2.6+k*3.2)*red,(1.1+k*1.6)*red);fxStats.landings++;fxStats.lastLand=k;
 }
 /** The player's own splashes (N5): landing, footsteps and wake, the ride's spray and V wake. Only while in the water. */
 function playerFx(dt:number,i:PondInput,inWater:boolean){
  const y=i.y??0;
  if(!i.onGround){const fall=(prevY-y)/Math.max(dt,1e-3);if(fall>airMaxFall)airMaxFall=fall;}
  if(i.onGround&&!wasGround){if(inWater&&!fxOff(i)&&airMaxFall>=POND_FX.landMin)landSplash(i.x,i.z,airMaxFall,i);airMaxFall=0;wet=1;}
  wasGround=i.onGround;prevY=y;
  if(!inWater||!i.onGround||fxOff(i)){stepT=wakeT=sprayT=0;return;}
  const h=i.heading??0,fx=Math.sin(h),fz=Math.cos(h),red=i.reduced?.5:1,ds=dropScale(i);
  if(i.riding&&i.speed>POND_FX.rideMin){
   // Wheels: a continuous spray thrown out sideways and back, growing with speed.
   sprayT+=dt;if(sprayT>=POND_FX.sprayEvery){sprayT=0;const sp=Math.min(1,i.speed/14),n=Math.max(1,Math.round((1+sp*3)*ds));
    for(const side of [-1,1])spawnDrops(i.x-fx*.5+fz*side*.25,i.z-fz*.5-fx*side*.25,n,(1.2+sp*2.2)*red,.5*red,(fz*side-fx*.6),(-fx*side-fz*.6),(.8+sp*2)*red);fxStats.sprays++;}
   // The bow wake: two stretched ripples angled back from the heading, a V behind the rider.
   wakeT+=dt;if(wakeT>=POND_FX.rideWakeEvery){wakeT=0;const sp=Math.min(1,i.speed/14),r=(1.2+sp*2)*red;
    for(const side of [-1,1]){const a=h+Math.PI+side*.42;wakeAt(i.x-fx*.8+Math.sin(a)*.4,i.z-fz*.8+Math.cos(a)*.4,r,1.6+sp*1.4,a);}pushPondRipple(i.x,i.z,.35+sp*.4);}
   return;}
  if(i.speed<=.5){stepT=wakeT=0;return;}
  // Footsteps: a small splash at each step (alternating feet), the interval shortening with speed.
  const every=Math.max(POND_FX.stepMin,Math.min(POND_FX.stepMax,POND_FX.stepStride/Math.max(.1,i.speed)))*(i.mode?1.4:1);
  stepT+=dt;if(stepT>=every){stepT=0;foot=-foot;const px=i.x+fz*foot*.14+fx*.2,pz=i.z-fx*foot*.14+fz*.2;
   o.sink.ring(px,pz,1.1*red);pushPondRipple(px,pz,.5);spawnDrops(px,pz,Math.max(1,Math.round(3*ds)),1.6*red,.6*red);fxStats.steps++;}
  // The trailing wake: a ripple stretched along the walk, left behind.
  wakeT+=dt;if(wakeT>=POND_FX.wakeEvery){wakeT=0;wakeAt(i.x-fx*.6,i.z-fz*.6,1.5*red,1.5,h);}
 }
 return {
  fish,flies,drops,fxStats,
  /** A splash ring at (x, z) of strength 0..1 (the skipping ball's touches, pondSkip.ts): crown, a few drops, a pond ring. */
  splash(x:number,z:number,strength:number,mode:PondMode=0,reduced=false){if(mode===2&&!reduced)return;const red=reduced?.5:1;o.sink.splash(x,z,(.5+strength*.4)*red);o.sink.ring(x,z,(1+strength*1.2)*red);pushPondRipple(x,z,strength);sx=x;sz=z;splashAge=0;
   spawnDrops(x,z,Math.round((4+strength*6)*(mode>=1?.5:1)*red),(1.4+strength*2)*red,(.6+strength*.8)*red);},
  /** Nov 13 2026 (pondBugs.ts): the nearest drawn dragonfly within `range` m (flat) of (x, z), or -1. */
  nearFly(x:number,z:number,range:number){if(!flies.visible)return -1;let best=-1,bd=range;for(let k=0;k<nf;k++){if(D.away[k]>0)continue;const d=Math.hypot(D.x[k]-x,D.z[k]-z);if(d<=bd){bd=d;best=k;}}return best;},
  /** Dragonfly k's position, written into `out`. */
  flyAt(k:number,out:{x:number;y:number;z:number}){out.x=D.x[k]??0;out.y=D.y[k]??0;out.z=D.z[k]??0;return out;},
  /** Net dragonfly k: it is let go out of sight and back over the water after POND_NET.away s. False if it is not there. */
  netFly(k:number){if(!(k>=0&&k<nf)||D.away[k]>0)return false;D.away[k]=POND_NET.away;inside(.9);D.x[k]=D.tx[k]=pick.x;D.z[k]=D.tz[k]=pick.z;D.hold[k]=1;writeFlies();return true;},
  /** Other players in the water (pondRemote.ts drives it from their interpolated poses): one effect from the same pools and the same
   *  rules as mine. kind 0 = a footstep (foot = ±1) and its trailing wake, 1 = the ride's wheel spray and bow wake, 2 = a landing at
   *  `speed` m/s of fall. mode / reduced as update()'s; nothing while the pond is asleep (I am not near it) or in still mode. */
  remoteFx(kind:0|1|2,x:number,z:number,heading:number,speed:number,mode:PondMode,reduced:boolean,foot=1){
   if(!fish.visible||mode===2&&!reduced)return;
   rin.mode=mode;rin.reduced=reduced;const fx=Math.sin(heading),fz=Math.cos(heading),red=reduced?.5:1,ds=dropScale(rin);
   if(kind===2){landSplash(x,z,speed,rin);return;}
   if(kind===1){const sp=Math.min(1,speed/14),n=Math.max(1,Math.round((1+sp*3)*ds));
    for(let side=-1;side<=1;side+=2){spawnDrops(x-fx*.5+fz*side*.25,z-fz*.5-fx*side*.25,n,(1.2+sp*2.2)*red,.5*red,(fz*side-fx*.6),(-fx*side-fz*.6),(.8+sp*2)*red);
     const a=heading+Math.PI+side*.42;wakeAt(x-fx*.8+Math.sin(a)*.4,z-fz*.8+Math.cos(a)*.4,(1.2+sp*2)*red,1.6+sp*1.4,a);}
    pushPondRipple(x,z,.35+sp*.4);fxStats.sprays++;return;}
   const px=x+fz*foot*.14+fx*.2,pz=z-fx*foot*.14+fz*.2;
   o.sink.ring(px,pz,1.1*red);pushPondRipple(px,pz,.5);spawnDrops(px,pz,Math.max(1,Math.round(3*ds)),1.6*red,.6*red);fxStats.steps++;
   if(foot>0)wakeAt(x-fx*.6,z-fz*.6,1.5*red,1.5,heading);
  },
  /** Metres a walker at (x, z) sinks into the pond (0 on dry land). */
  wade:pondWade,
  get active(){return fish.visible;},
  update(dt:number,i:PondInput){
   const near=i.shown&&Math.hypot(i.x-cx,i.z-cz)<POND_LIFE.near;
   fish.visible=near;flies.visible=near&&i.mode===0;if(!near){wet=0;ballY=9;airMaxFall=0;wasGround=true;if(dropsAlive){for(let k=0;k<ND;k++)DP.life[k]=0;stepDrops(0);}return;}
   if(!(dt>0))return;
   // The player's splashes (N5): landing, footsteps, the ride's spray and wake (in the water only; still mode: none).
   const inWater=pondQ(i.x,i.z)<1;
   const landed0=fxStats.landings;playerFx(dt,i,inWater);if(dropsAlive||drops.visible)stepDrops(dt);
   if(i.mode===2){wet=inWater&&i.onGround?1:0;return;}// still: the koi and the dragonflies hold their places
   t+=dt;splashAge+=dt;
   // Wading in: a small splash stepping in at a walk or more (the footsteps above take it from there).
   const w=i.onGround?pondWade(i.x,i.z):0;
   if(w>0&&wet===0&&i.speed>1&&fxStats.landings===landed0)splashAt(i.x,i.z,.28,.8,i.mode);
   wet=w>0||inWater&&i.onGround?Math.max(w,1e-3):0;
   // The ball: a splash when it drops onto the water (unless it is skipping: pondSkip.ts reports those), rings while it rolls through.
   if(i.ballOn&&pondQ(i.ballX,i.ballZ)<1){
    if(!i.ballWet&&ballY>POND_LIFE.ballDrop&&i.ballY<=POND_LIFE.ballDrop)splashAt(i.ballX,i.ballZ,.5,1,i.mode);
    else if(i.ballY<POND_LIFE.ballDrop&&Math.hypot(i.ballX-ballPX,i.ballZ-ballPZ)>dt*1.5){ballT+=dt;if(ballT>.35){ballT=0;o.sink.ring(i.ballX,i.ballZ,1);pushPondRipple(i.ballX,i.ballZ,.45);}}
   }
   ballY=i.ballOn?i.ballY:9;ballPX=i.ballX;ballPZ=i.ballZ;
   // Koi: cruise to a wander point, keep inside the water, bolt from a walker or a fresh splash.
   const n=i.mode===1||o.phone?POND_LIFE.koi[1]:cap;
   for(let k=0;k<n;k++){let ax=F.tx[k]-F.x[k],az=F.tz[k]-F.z[k];const d=Math.hypot(ax,az);
    if(d<1.2){inside(.75);F.tx[k]=pick.x;F.tz[k]=pick.z;}
    const dp=Math.hypot(F.x[k]-i.x,F.z[k]-i.z),ds=splashAge<1?Math.hypot(F.x[k]-sx,F.z[k]-sz):99;
    if(dp<POND_LIFE.scatter&&(i.onGround||dp<2)||ds<POND_LIFE.scatter+1){const fx=dp<ds?i.x:sx,fz=dp<ds?i.z:sz,l=Math.hypot(F.x[k]-fx,F.z[k]-fz)||1;F.flee[k]=1.2;
     const ex=cx+(F.x[k]-fx)/l*rx*.7,ez=cz+(F.z[k]-fz)/l*rz*.7;F.tx[k]=ex;F.tz[k]=ez;ax=ex-F.x[k];az=ez-F.z[k];}
    F.flee[k]=Math.max(0,F.flee[k]-dt);const want=F.flee[k]>0?3:.55,l=Math.hypot(ax,az)||1,turn=1-Math.exp(-dt*(F.flee[k]>0?6:1.4));
    F.vx[k]+=(ax/l*want-F.vx[k])*turn;F.vz[k]+=(az/l*want-F.vz[k])*turn;
    let nx=F.x[k]+F.vx[k]*dt,nz=F.z[k]+F.vz[k]*dt;const qq=pondQ(nx,nz);if(qq>.86){nx=cx+(nx-cx)*.86/qq;nz=cz+(nz-cz)*.86/qq;}F.x[k]=nx;F.z[k]=nz;}
   writeFish(n,t);
   if(!flies.visible)return;
   // Dragonflies: hover (a little bob), dart to a new spot over the water; dart off when the player comes close.
   // Nov 13 2026: a calm player (pondBugs.ts) is not fled from, and a dragonfly's next spot is sometimes beside them (over the water).
   const nearWater=pondQ(i.x,i.z,POND_NET.range)<1;
   for(let k=0;k<nf;k++){if(D.away[k]>0){D.away[k]=Math.max(0,D.away[k]-dt);continue;}
    const dx=D.tx[k]-D.x[k],dy=D.ty[k]-D.y[k],dz=D.tz[k]-D.z[k],d=Math.hypot(dx,dz,dy);
    const dp=Math.hypot(D.x[k]-i.x,D.z[k]-i.z),flee=dp<POND_LIFE.flyFlee&&!i.calm;
    if(d<.15){D.hold[k]-=dt;if(D.hold[k]<=0||flee){inside(.9);
      if(!flee&&i.calm&&nearWater&&rnd()<POND_NET.curious){const a=rnd()*Math.PI*2,r=POND_NET.curiousRadius*(.6+rnd()*.4),ex=i.x+Math.cos(a)*r,ez=i.z+Math.sin(a)*r;if(pondQ(ex,ez)<.95){pick.x=ex;pick.z=ez;}}
      D.tx[k]=pick.x;D.tz[k]=pick.z;D.ty[k]=.5+rnd()*.8;D.hold[k]=1+rnd()*2.5;}
     D.y[k]+=Math.sin(t*2.3+k)*.002;}
    else{const v=Math.min(d,dt*(flee?6:4.5));D.x[k]+=dx/d*v;D.y[k]+=dy/d*v;D.z[k]+=dz/d*v;const want=Math.atan2(dx,dz),dyaw=Math.atan2(Math.sin(want-D.yaw[k]),Math.cos(want-D.yaw[k]));D.yaw[k]+=dyaw*Math.min(1,dt*10);}}
   writeFlies();
  },
  dispose(){drops.removeFromParent();drops.dispose();dropGeo.dispose();dropMat.dispose();fish.removeFromParent();flies.removeFromParent();fishGeo.dispose();fishMat.dispose();flyGeo.dispose();flyMat.dispose();fish.dispose();flies.dispose();},
 };
}
export type PondLife=ReturnType<typeof createPondLife>;
