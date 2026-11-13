import * as T from 'three';
import {PARK_POND,POND_Y,pondQ,pondWade} from './westParkLayout';
import {reefFishModel} from '../graphics/diveFish';
import {createBugModel} from '../graphics/bugModels';
import {bugMaterial} from '../graphics/bugMaterial';
import {BUG_SPECIES} from './jobs/bugSpecies';
import {WATER_UNIFORMS} from '../graphics/waterSurface';
import {pushPondRipple} from '../graphics/pondWater';

/**
 * Stadium Park pond life (Nov 13 2026, owner: "make it lifelike"). Reuses the island's own pieces:
 *  - koi: the dive rooms' 92-triangle reef fish model (diveFish.ts, look 'koi'), ONE InstancedMesh, flattened to swim in the 7 cm
 *    between the pond bed and the surface; they wander, wag, keep inside the water and scatter from a walker or a splash;
 *  - dragonflies: the Bug squad's Midfield Dragonfly model and the bug swarm's flapping material (bugModels.ts, bugMaterial.ts),
 *    ONE InstancedMesh: hover, dart, hover again, and dart off when you come close (decoration: wild bugs, and so the net, are
 *    Summit Isle only; see the report / docs);
 *  - splashes and ripples: the swim ripple and splash-down pools (ballEffects.ts) via the sink, plus the pond shader's own rings
 *    (pondWater.ts pushPondRipple), when a walker wades or a ball lands in or rolls through the water.
 * Heat: nothing runs or draws unless the west region is shown and the player is within POND_LIFE.near m of the pond; then a few
 * dozen ALU per animal per frame, 2 draws (frustum-culled to the pond). Lite mode (heat tier 2+, the slow governor): fewer koi,
 * no dragonflies, sparser ripples. Still mode (reduced motion, static ambience): everything holds still (no ripples, no splashes).
 * No allocation per frame.
 */
export const POND_LIFE={near:90,koi:[7,4] as const,flies:2,scatter:6,flyFlee:3.2,stepEvery:.42,ballDrop:.35} as const;
export type PondMode=0|1|2;
export type PondInput={x:number;z:number;speed:number;onGround:boolean;ballX:number;ballY:number;ballZ:number;ballOn:boolean;shown:boolean;mode:PondMode};
export type PondSink={splash:(x:number,z:number,size:number)=>void;ring:(x:number,z:number,radius:number)=>void};

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
 const D={x:new Float32Array(nf),y:new Float32Array(nf),z:new Float32Array(nf),tx:new Float32Array(nf),ty:new Float32Array(nf),tz:new Float32Array(nf),hold:new Float32Array(nf),yaw:new Float32Array(nf)};
 for(let i=0;i<nf;i++){inside(.8);D.x[i]=D.tx[i]=pick.x;D.z[i]=D.tz[i]=pick.z;D.y[i]=D.ty[i]=.7+rnd()*.5;D.hold[i]=rnd()*2;}
 const m4=new T.Matrix4(),q=new T.Quaternion(),p=new T.Vector3(),s=new T.Vector3(),up=new T.Vector3(0,1,0);
 const writeFish=(n:number,t:number)=>{for(let i=0;i<n;i++){const sp2=Math.hypot(F.vx[i],F.vz[i]),yaw=Math.atan2(F.vz[i],-F.vx[i])+Math.sin(t*(4+sp2*5)+F.ph[i])*(.08+Math.min(.18,sp2*.12));
  q.setFromAxisAngle(up,yaw);p.set(F.x[i],POND_Y-.035,F.z[i]);s.set(F.len[i],F.len[i]*.3,F.len[i]);fish.setMatrixAt(i,m4.compose(p,q,s));}fish.count=n;fish.instanceMatrix.needsUpdate=true;};
 const writeFlies=()=>{for(let i=0;i<nf;i++){q.setFromAxisAngle(up,D.yaw[i]);p.set(D.x[i],D.y[i],D.z[i]);s.setScalar(.7);flies.setMatrixAt(i,m4.compose(p,q,s));}flies.instanceMatrix.needsUpdate=true;};
 writeFish(cap,0);writeFlies();
 let t=0,wet=0,stepT=0,ballY=9,ballT=0,ballPX=0,ballPZ=0,sx=0,sz=0,splashAge=9;
 const splashAt=(x:number,z:number,size:number,strength:number,mode:PondMode)=>{if(mode===2)return;o.sink.splash(x,z,size);o.sink.ring(x,z,1.8);pushPondRipple(x,z,strength);sx=x;sz=z;splashAge=0;};
 return {
  fish,flies,
  /** Metres a walker at (x, z) sinks into the pond (0 on dry land). */
  wade:pondWade,
  get active(){return fish.visible;},
  update(dt:number,i:PondInput){
   const near=i.shown&&Math.hypot(i.x-cx,i.z-cz)<POND_LIFE.near;
   fish.visible=near;flies.visible=near&&i.mode===0;if(!near){wet=0;ballY=9;return;}
   if(i.mode===2||!(dt>0))return;// still: the koi and the dragonflies hold their places
   t+=dt;splashAge+=dt;
   // Wading: a small splash stepping in at a walk or more, then a ring every step or so while moving in the water.
   const w=i.onGround?pondWade(i.x,i.z):0;
   if(w>0&&wet===0&&i.speed>1)splashAt(i.x,i.z,.28,.8,i.mode);
   if(w>0&&i.speed>.5){stepT+=dt;if(stepT>=POND_LIFE.stepEvery*(i.mode?2:1)){stepT=0;o.sink.ring(i.x,i.z,1.3);pushPondRipple(i.x,i.z,.55);}}else stepT=0;
   wet=w;
   // The ball: a splash when it drops onto the water, rings while it rolls through.
   if(i.ballOn&&pondQ(i.ballX,i.ballZ)<1){
    if(ballY>POND_LIFE.ballDrop&&i.ballY<=POND_LIFE.ballDrop)splashAt(i.ballX,i.ballZ,.5,1,i.mode);
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
   for(let k=0;k<nf;k++){const dx=D.tx[k]-D.x[k],dy=D.ty[k]-D.y[k],dz=D.tz[k]-D.z[k],d=Math.hypot(dx,dz,dy);
    const dp=Math.hypot(D.x[k]-i.x,D.z[k]-i.z);
    if(d<.15){D.hold[k]-=dt;if(D.hold[k]<=0||dp<POND_LIFE.flyFlee){inside(.9);D.tx[k]=pick.x;D.tz[k]=pick.z;D.ty[k]=.5+rnd()*.8;D.hold[k]=1+rnd()*2.5;}
     D.y[k]+=Math.sin(t*2.3+k)*.002;}
    else{const v=Math.min(d,dt*(dp<POND_LIFE.flyFlee?6:4.5));D.x[k]+=dx/d*v;D.y[k]+=dy/d*v;D.z[k]+=dz/d*v;const want=Math.atan2(dx,dz),dyaw=Math.atan2(Math.sin(want-D.yaw[k]),Math.cos(want-D.yaw[k]));D.yaw[k]+=dyaw*Math.min(1,dt*10);}}
   writeFlies();
  },
  dispose(){fish.removeFromParent();flies.removeFromParent();fishGeo.dispose();fishMat.dispose();flyGeo.dispose();flyMat.dispose();fish.dispose();flies.dispose();},
 };
}
export type PondLife=ReturnType<typeof createPondLife>;
