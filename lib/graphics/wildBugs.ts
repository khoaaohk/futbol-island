/**
 * Wild meadow bugs on Summit Isle (Oct 20 2026; rules and caps: lib/graphics/wildBugsCore.ts). One InstancedMesh, built when the
 * player comes near the meadow and disposed when they leave, the cap changes, or Day turns to Night (bugs ↔ fireflies). By Day /
 * Sunset: the Bug squad's own shape (lib/town/jobs/bugShape.ts, vertex colours, wing tints as instance colours). At Night: a few
 * tiny unlit firefly dots that blink by scale. Hidden while a bug job runs (the shift draws its own bugs). Walk up to one and it
 * flutters away, then drifts back home; the first time in a visit IslandJobs shows where bugs are caught.
 * Per frame (≤ 12 matrices, 15 Hz unless within NEAR_M): only reused scratch objects, no allocation.
 */
import * as T from 'three';
import {createBugGeometry} from '../town/jobs/bugShape';
import {fieldSurfaceHeight} from '../town/venues';
import {countWildFlutter} from '../analytics/summitEvents';
import {MEADOW,WILD_BUG_HINT,WILD_BUG_RANGE,WILD_COLORS,WILD_FLEE,WILD_HOMES,distToMeadow,wildBugCount} from './wildBugsCore';

type Bug={hx:number;hz:number;gy:number;ph:number;ox:number;oz:number;oy:number;dx:number;dz:number;flee:number;counted:number};
export type WildBugFrame={dt:number;x:number;z:number;night:boolean;tier:number;reduced:boolean;busy:boolean};
let hinted=false;// once per visit (page load)

export function createWildBugs(scene:T.Scene,floor:(x:number,z:number)=>number=fieldSurfaceHeight){
 let mesh:T.InstancedMesh|null=null,geometry:T.BufferGeometry|null=null,material:T.Material|null=null,night=false,count=0,acc=0,clock=0,builds=0,updates=0;
 const bugs:Bug[]=WILD_HOMES.map((h,i)=>({hx:h.x,hz:h.z,gy:0,ph:i*1.37,ox:0,oz:0,oy:0,dx:0,dz:0,flee:0,counted:-99}));
 const ask={tier:0,reduced:false,night:false};
 const m=new T.Matrix4(),q=new T.Quaternion(),e=new T.Euler(0,0,0,'YXZ'),p=new T.Vector3(),s=new T.Vector3(),c=new T.Color();
 function drop(){if(!mesh)return;mesh.removeFromParent();mesh.dispose();geometry?.dispose();material?.dispose();mesh=null;geometry=null;material=null;count=0;}
 function build(n:number,atNight:boolean){
  night=atNight;count=n;builds++;
  geometry=atNight?new T.IcosahedronGeometry(.18,0):createBugGeometry();
  material=atNight?new T.MeshBasicMaterial({color:'#e9ff6b',toneMapped:false}):new T.MeshStandardMaterial({color:'#ffffff',roughness:.7,vertexColors:true,side:T.DoubleSide});
  mesh=new T.InstancedMesh(geometry,material,n);mesh.name='wild-bugs';mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);
  // A fixed bound round the meadow: no per-frame bounding-sphere recompute, and culled when the camera looks away.
  mesh.boundingSphere=new T.Sphere(new T.Vector3(MEADOW.x,floor(MEADOW.x,MEADOW.z)+2,MEADOW.z),60);
  for(let i=0;i<n;i++){const b=bugs[i];b.gy=floor(b.hx,b.hz);b.ox=b.oz=b.oy=0;b.flee=0;if(!atNight)mesh.setColorAt(i,c.set(WILD_COLORS[i%WILD_COLORS.length]));}
  if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;
  scene.add(mesh);
 }
 function update(f:WildBugFrame){
  ask.tier=f.tier;ask.reduced=f.reduced;ask.night=f.night;
  const d=distToMeadow(f.x,f.z),want=d<(mesh?WILD_BUG_RANGE.DROP_M:WILD_BUG_RANGE.BUILD_M)?wildBugCount(ask):0;
  if(mesh&&(want!==count||f.night!==night))drop();
  if(!want)return;
  if(!mesh)build(want,f.night);
  const live=mesh!;live.visible=!f.busy;if(f.busy)return;
  acc+=f.dt;if(d>WILD_BUG_RANGE.NEAR_M&&acc<1/WILD_BUG_RANGE.FAR_HZ)return;
  const dt=Math.min(acc,.25);acc=0;clock+=dt;updates++;const t=clock;
  for(let i=0;i<count;i++){const b=bugs[i];
   // Wander: a lazy figure-of-eight round home, higher and wider for fireflies.
   const wx=Math.sin(t*(night?.3:.6)+b.ph)*(night?1.6:1.1),wz=Math.cos(t*(night?.23:.47)+b.ph*1.3)*(night?1.6:1.1);
   let x=b.hx+wx+b.ox,z=b.hz+wz+b.oz;
   // The player walks up: flutter away from them and up a little, then drift back home.
   if(b.flee<=0&&Math.hypot(f.x-x,f.z-z)<WILD_FLEE.NEAR_M){const ax=x-f.x,az=z-f.z,l=Math.hypot(ax,az)||1;b.dx=ax/l;b.dz=az/l;b.flee=WILD_FLEE.SECONDS;
    if(t-b.counted>WILD_FLEE.COUNT_EVERY_S){b.counted=t;countWildFlutter();}
    if(!hinted){hinted=true;try{window.dispatchEvent(new Event(WILD_BUG_HINT));}catch{}}}
   if(b.flee>0){b.flee-=dt;const k=WILD_FLEE.SPEED*dt;b.ox+=b.dx*k;b.oz+=b.dz*k;b.oy=Math.min(2.2,b.oy+1.4*dt);}
   else{const r=Math.max(0,1-.45*dt);b.ox*=r;b.oz*=r;b.oy*=r;}
   x=b.hx+wx+b.ox;z=b.hz+wz+b.oz;
   const y=b.gy+(night?1.3:.9)+b.oy+Math.sin(t*(night?1.1:2.1)+b.ph)*.25;
   if(night){const blink=Math.max(.15,Math.pow(Math.max(0,Math.sin(t*1.9+b.ph*2.3)),3));s.setScalar(blink);e.set(0,0,0);}
   else{const flap=1-.55*Math.abs(Math.sin(t*(b.flee>0?20:12)+b.ph)),k=1.7;s.set(k*flap,k,k);e.set(0,b.flee>0?Math.atan2(b.dx,b.dz):t*.6+b.ph,0);}
   live.setMatrixAt(i,m.compose(p.set(x,y,z),q.setFromEuler(e),s));}
  live.instanceMatrix.needsUpdate=true;
 }
 return {update,dispose:drop,get mesh(){return mesh;},get count(){return count;},get night(){return night;},get builds(){return builds;},get updates(){return updates;},
  /** Probes and tests: forget the once-a-visit hint. */resetHint(){hinted=false;}};
}
export type WildBugs=ReturnType<typeof createWildBugs>;
