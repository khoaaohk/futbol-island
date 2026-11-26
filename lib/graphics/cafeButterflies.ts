/**
 * The Café by the Sea garden's butterflies (Nov 24 2026, owner add; lib/town/seasideCafe.ts). Reuses the island's bug pieces, like the
 * Stadium Park pond's dragonflies (parkPond.ts): the Bug book's Captain Monarch model (bugModels.ts createBugModel, species `monarch`)
 * and the bug swarm's flapping material (bugMaterial.ts: wings flap in the vertex shader from per-instance iFlap = rate, amplitude,
 * mid angle, phase), ONE InstancedMesh = one draw. They wander in zigzag loops over the beds, settle on the flowers (slow, closed-up
 * wings) and take off again, scatter up and away from a player rushing through and drift back. A still player gets a curious visit
 * now and then (CAFE_BUTTERFLIES.curious): the netting moment (pondBugs.ts netCafeButterfly, the Bug book's normal catch).
 * Heat: simulated only within CAFE_BUTTERFLIES.near m of the garden AND with the garden on screen (one sphere-frustum test); drawn
 * only within 60 m. Reduced motion, night (monarchs roost) and lite mode (heat tier 2+): every one rests on a flower with still wings,
 * written once. A few dozen ALU per butterfly per frame while awake; no allocation per frame.
 */
import * as T from 'three';
import {createBugModel} from './bugModels';
import {bugMaterial} from './bugMaterial';
import {BUG_SPECIES} from '../town/jobs/bugSpecies';
import {WATER_UNIFORMS} from './waterSurface';
import {CAFE_BUTTERFLIES as B,CAFE_BUTTERFLY_ID,CAFE_GARDEN,CAFE_GARDEN_AREA as A} from '../town/seasideCafe';

const TAU=Math.PI*2,DRAW_R=60;
/** Flower tops a butterfly settles on (deterministic): hibiscus blooms, daisy heads and the trellis climbers. */
export function cafeRestPoints(){
 const out:{x:number;y:number;z:number}[]=[];
 CAFE_GARDEN.forEach((b,i)=>{const n=b.kind==='climber'?5:4;for(let k=0;k<n;k++){const u=(k+.5)/n,j=Math.sin((i*7+k)*12.9898)*.5;
  if(b.kind==='climber')out.push({x:b.x+.18,y:.6+((k*.37)%1)*.9,z:b.z-b.d/2+.6+u*(b.d-1.2)});
  else out.push({x:b.x-b.w/2+.5+u*(b.w-1),y:b.kind==='hibiscus'?.72:.4,z:b.z+j*(b.d-.8)});}});
 return out;
}
export type CafeButterflyFrame={x:number;z:number;speed:number;camera:T.Camera;reduced:boolean;night:boolean;tier:number;phone:boolean};
export function createCafeButterflies(scene:T.Object3D,phone=false){
 const sp=BUG_SPECIES.find(s=>s.id===CAFE_BUTTERFLY_ID)??null,geo=createBugModel(sp),n=B.count[phone?1:0];
 const flap=new T.InstancedBufferAttribute(new Float32Array(n*4),4),pose=new T.InstancedBufferAttribute(new Float32Array(n*4),4);
 flap.setUsage(T.DynamicDrawUsage);geo.setAttribute('iFlap',flap);geo.setAttribute('iPose',pose);
 const mat=bugMaterial({uTime:WATER_UNIFORMS.uWaterTime,uFade:{value:1}}),mesh=new T.InstancedMesh(geo,mat,n);mesh.name='cafe-garden-butterflies';
 mesh.castShadow=false;mesh.receiveShadow=false;mesh.boundingSphere=new T.Sphere(new T.Vector3(A.cx,1.2,A.cz),9);mesh.visible=false;scene.add(mesh);
 const rest=cafeRestPoints(),sphere=new T.Sphere(new T.Vector3(A.cx,1,A.cz),8),frustum=new T.Frustum(),pm=new T.Matrix4();
 // state: mode 0 fly, 1 rest, 2 flee
 const S={x:new Float32Array(n),y:new Float32Array(n),z:new Float32Array(n),tx:new Float32Array(n),ty:new Float32Array(n),tz:new Float32Array(n),
  mode:new Uint8Array(n),timer:new Float32Array(n),yaw:new Float32Array(n),away:new Float32Array(n),ph:new Float32Array(n),perch:new Int16Array(n)};
 let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646;};
 const settle=(k:number)=>{let r=(k*3+Math.floor(rnd()*rest.length))%rest.length;for(let g=0;g<rest.length;g++){let used=false;for(let j=0;j<n;j++)if(j!==k&&S.mode[j]===1&&S.perch[j]===r)used=true;if(!used)break;r=(r+1)%rest.length;}
  S.perch[k]=r;S.tx[k]=rest[r].x;S.ty[k]=rest[r].y+.06;S.tz[k]=rest[r].z;};
 const wander=(k:number)=>{S.tx[k]=A.x0+.5+rnd()*(A.x1-A.x0-1);S.tz[k]=A.z0+.5+rnd()*(A.z1-A.z0-1);S.ty[k]=.55+rnd()*1.2;};
 for(let k=0;k<n;k++){settle(k);S.x[k]=S.tx[k];S.y[k]=S.ty[k];S.z[k]=S.tz[k];S.mode[k]=k%3===0?0:1;S.timer[k]=1+rnd()*5;S.ph[k]=k*1.37;S.yaw[k]=rnd()*TAU;if(S.mode[k]===0)wander(k);}
 const m4=new T.Matrix4(),q=new T.Quaternion(),p=new T.Vector3(),s=new T.Vector3(),e=new T.Euler();
 let still=-1,t=0;// still: the state last written by the static (rest-only) path, -1 = animated
 const setFlap=(k:number,flying:boolean,frozen:boolean)=>{if(frozen)flap.setXYZW(k,0,0,1.2,0);else if(flying)flap.setXYZW(k,2.4,.95,.4,S.ph[k]);else flap.setXYZW(k,.35,.28,1.22,S.ph[k]);};
 const write=()=>{for(let k=0;k<n;k++){const fly=S.mode[k]!==1;e.set(fly?Math.sin(t*3+k)*.12:0,S.yaw[k],fly?Math.sin(t*5.3+k*2)*.25:0,'YXZ');q.setFromEuler(e);
   p.set(S.x[k],S.y[k],S.z[k]);s.setScalar(S.away[k]>0?0:B.size);mesh.setMatrixAt(k,m4.compose(p,q,s));}
  mesh.instanceMatrix.needsUpdate=true;flap.needsUpdate=true;};
 const restAll=(frozen:boolean)=>{for(let k=0;k<n;k++){if(S.mode[k]!==1){settle(k);S.mode[k]=1;}S.x[k]=S.tx[k];S.y[k]=S.ty[k];S.z[k]=S.tz[k];setFlap(k,false,frozen);}write();};
 write();
 return {
  mesh,
  get active(){return mesh.visible;},
  /** The nearest drawn butterfly within `range` m (flat) of (x, z), or -1. */
  nearFly(x:number,z:number,range:number){if(!mesh.visible)return -1;let best=-1,bd=range;for(let k=0;k<n;k++){if(S.away[k]>0)continue;const d=Math.hypot(S.x[k]-x,S.z[k]-z);if(d<=bd){bd=d;best=k;}}return best;},
  flyAt(k:number,out:{x:number;y:number;z:number}){out.x=S.x[k]??0;out.y=S.y[k]??0;out.z=S.z[k]??0;return out;},
  /** Net butterfly k: let go out of sight, back on a flower after CAFE_BUTTERFLIES.away s. False if it is not there. */
  netFly(k:number){if(!(k>=0&&k<n)||S.away[k]>0)return false;S.away[k]=B.away;settle(k);S.mode[k]=1;S.x[k]=S.tx[k];S.y[k]=S.ty[k];S.z[k]=S.tz[k];write();return true;},
  update(dt:number,f:CafeButterflyFrame){
   const dg=Math.hypot(f.x-A.cx,f.z-A.cz);mesh.visible=dg<DRAW_R;if(!mesh.visible)return;
   for(let k=0;k<n;k++)if(S.away[k]>0)S.away[k]=Math.max(0,S.away[k]-dt);
   const frozen=f.reduced,calmRest=f.night||f.tier>=2;
   if(frozen||calmRest){const want=frozen?1:0;if(still!==want){still=want;restAll(frozen);}return;}
   if(dg>B.near)return;
   pm.multiplyMatrices(f.camera.projectionMatrix,f.camera.matrixWorldInverse);frustum.setFromProjectionMatrix(pm);if(!frustum.intersectsSphere(sphere))return;
   if(still!==-1){still=-1;for(let k=0;k<n;k++)setFlap(k,S.mode[k]!==1,false);}
   t=(t+dt)%600;const calm=f.speed<B.calmSpeed,inGarden=f.x>A.x0-1&&f.x<A.x1+1&&f.z>A.z0-1&&f.z<A.z1+1;
   for(let k=0;k<n;k++){if(S.away[k]>0)continue;
    const dp=Math.hypot(S.x[k]-f.x,S.z[k]-f.z);
    if(!calm&&dp<B.flee&&S.mode[k]!==2){// scatter: up and away from the runner, then drift back
     const ax=(S.x[k]-f.x)/(dp||1),az=(S.z[k]-f.z)/(dp||1);S.tx[k]=S.x[k]+ax*3.5;S.tz[k]=S.z[k]+az*3.5;S.ty[k]=2+rnd()*.8;S.mode[k]=2;S.timer[k]=2.5+rnd();setFlap(k,true,false);}
    const dx=S.tx[k]-S.x[k],dy=S.ty[k]-S.y[k],dz=S.tz[k]-S.z[k],d=Math.hypot(dx,dz);
    if(S.mode[k]===1){S.timer[k]-=dt;if(S.timer[k]<=0){S.mode[k]=0;wander(k);setFlap(k,true,false);}continue;}
    if(S.mode[k]===2){S.timer[k]-=dt;if(S.timer[k]<=0){S.mode[k]=0;wander(k);}}
    if(d<.12&&Math.abs(dy)<.12){if(S.mode[k]===2)continue;
     if(calm&&inGarden&&rnd()<B.curious){const a=rnd()*TAU;S.tx[k]=f.x+Math.cos(a)*1.1;S.tz[k]=f.z+Math.sin(a)*1.1;S.ty[k]=1+rnd()*.3;}
     else if(rnd()<.45){settle(k);S.mode[k]=1;S.timer[k]=2.5+rnd()*4;S.x[k]=S.tx[k];S.y[k]=S.ty[k];S.z[k]=S.tz[k];setFlap(k,false,false);}
     else wander(k);continue;}
    // zigzag: steer to the target with a sideways weave and a bob (like a winger's change of direction)
    const v=Math.min(d,dt*(S.mode[k]===2?3.2:1.15)),ux=d>1e-4?dx/d:0,uz=d>1e-4?dz/d:0,w=Math.sin(t*2.6+S.ph[k]*3)*.9*dt;
    S.x[k]+=ux*v-uz*w;S.z[k]+=uz*v+ux*w;S.y[k]+=Math.sign(dy)*Math.min(Math.abs(dy),dt*.9)+Math.sin(t*6+S.ph[k])*.25*dt;
    const want=Math.atan2(ux-uz*w*3,uz+ux*w*3),dyaw=Math.atan2(Math.sin(want-S.yaw[k]),Math.cos(want-S.yaw[k]));S.yaw[k]+=dyaw*Math.min(1,dt*6);}
   write();
  },
  dispose(){mesh.removeFromParent();mesh.dispose();geo.dispose();mat.dispose();},
 };
}
export type CafeButterflies=ReturnType<typeof createCafeButterflies>;
