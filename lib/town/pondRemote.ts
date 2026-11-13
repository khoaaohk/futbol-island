// Other players' pond splashes (Nov 13 2026, owner): the park pond's landing, footstep and ride spray (parkPond.ts) for the visible
// remote set. Their poses arrive at a few Hz, so this reads the INTERPOLATED pose (lib/multiplayer/interp.ts) each frame and:
//  - on foot (Walk / Run / Idle) in the water and moving: a footstep splash (alternating feet; every other one leaves the trailing
//    wake) at the same speed-scaled interval as mine (POND_FX.stepStride / speed, clamped stepMin..stepMax, x1.4 in lite mode);
//  - on a ground ride (scooter / bike / moped / animal) in the water above POND_FX.rideMin: the wheel spray and bow wake every
//    REMOTE_POND.rideEvery s (coarser than mine: one call does both);
//  - arriving from the air (Jetpack / Parachute -> on foot or a ride) inside the pond: a landing splash scaled by the fall speed
//    measured from the interpolated height while they flew (at least REMOTE_POND.landFloor m/s: a jetpack hover still splashes).
// Gating: parkPond.remoteFx does nothing unless the pond is awake (I am within POND_LIFE.near of it) and not in still mode; members
// further than REMOTE_POND.track from the pond are skipped with one test; at most REMOTE_POND.slots players are tracked.
// Reduced motion and the heat tier pass straight through (the same mode / reduced as the local splashes).
// No allocation per frame: fixed slot arrays, a linear scan of `slots` ids.
import {POND_FX} from './parkPond';
import {pondQ} from './westParkLayout';

export const REMOTE_POND={slots:8,track:2.2,rideEvery:.14,landFloor:4,fade:.5} as const;
/** The wire modes this reads (multiplayer/protocol Mode; numbers so this stays free of the protocol import). */
const WALK=0,RUN=1,SCOOTER=2,BIKE=3,MOPED=4,JETPACK=5,PARACHUTE=6,ANIMAL=10,IDLE=13;
const onFoot=(m:number)=>m===WALK||m===RUN||m===IDLE;
const riding=(m:number)=>m===SCOOTER||m===BIKE||m===MOPED||m===ANIMAL;
const flying=(m:number)=>m===JETPACK||m===PARACHUTE;
export type RemotePondPose={x:number;y:number;z:number;yaw:number;speed:number;mode:number;fade:number;seated?:boolean};
export type RemotePondFx={remoteFx(kind:0|1|2,x:number,z:number,heading:number,speed:number,mode:0|1|2,reduced:boolean,foot?:number):void;readonly active:boolean};

export function createRemotePond(fx:RemotePondFx){
 const N=REMOTE_POND.slots,id=new Int32Array(N).fill(-1),seen=new Uint8Array(N),mode=new Int16Array(N),y=new Float32Array(N),fall=new Float32Array(N),
  stepT=new Float32Array(N),rideT=new Float32Array(N),foot=new Int8Array(N).fill(1);
 const stats={steps:0,sprays:0,landings:0,tracked:0};
 let dt=0,fxMode:0|1|2=0,reduced=false,on=false;
 const slotOf=(m:number)=>{let free=-1;for(let k=0;k<N;k++){if(id[k]===m)return k;if(free<0&&id[k]<0)free=k;}
  if(free>=0){id[free]=m;mode[free]=-1;fall[free]=0;stepT[free]=rideT[free]=0;foot[free]=1;}return free;};
 return {
  stats,
  /** Start of a frame: dt (s), the pond's effect mode (0 full, 1 lite, 2 still) and reduced motion (the local splashes' values). */
  begin(d:number,m:0|1|2,r:boolean){dt=d>0?Math.min(d,.1):0;fxMode=m;reduced=r;on=fx.active&&dt>0;seen.fill(0);},
  /** One visible remote player (their interpolated pose). Stable function: pass it straight to a forEach. */
  member:(m:number,p:RemotePondPose)=>{
   if(!on||p.seated||p.fade<REMOTE_POND.fade)return;
   const q=pondQ(p.x,p.z);if(q>REMOTE_POND.track)return;
   const k=slotOf(m);if(k<0)return;seen[k]=1;
   const prev=mode[k],inWater=q<1;
   if(flying(p.mode)){if(prev>=0&&dt>0){const v=(y[k]-p.y)/dt;if(v>fall[k])fall[k]=v;}}
   else{
    if(prev>=0&&flying(prev)&&inWater){fx.remoteFx(2,p.x,p.z,p.yaw,Math.max(REMOTE_POND.landFloor,fall[k]),fxMode,reduced);stats.landings++;stepT[k]=0;}
    fall[k]=0;
    if(inWater&&riding(p.mode)&&p.speed>POND_FX.rideMin){rideT[k]+=dt;if(rideT[k]>=REMOTE_POND.rideEvery){rideT[k]=0;fx.remoteFx(1,p.x,p.z,p.yaw,p.speed,fxMode,reduced);stats.sprays++;}}
    else rideT[k]=0;
    if(inWater&&onFoot(p.mode)&&p.speed>.5){
     const every=Math.max(POND_FX.stepMin,Math.min(POND_FX.stepMax,POND_FX.stepStride/Math.max(.1,p.speed)))*(fxMode?1.4:1);
     stepT[k]+=dt;if(stepT[k]>=every){stepT[k]=0;foot[k]=-foot[k];fx.remoteFx(0,p.x,p.z,p.yaw,p.speed,fxMode,reduced,foot[k]);stats.steps++;}}
    else stepT[k]=0;
   }
   mode[k]=p.mode;y[k]=p.y;
  },
  /** End of a frame: forget players not seen (left the pond, hidden, gone). */
  end(){let n=0;for(let k=0;k<N;k++){if(!seen[k])id[k]=-1;else n++;}stats.tracked=n;},
  reset(){id.fill(-1);seen.fill(0);stats.tracked=0;},
 };
}
export type RemotePond=ReturnType<typeof createRemotePond>;
