// Friendly low-poly sharks off Coral Cay (Sep 29 2026): a dorsal fin and tail tip cutting the water (the user asked for
// the wake streaks and bow box to be removed — the fin alone reads cleaner), and now and then the shallow body showing as a soft dark shape just under the surface. Paths: coralCay.ts SHARK_LOOPS.
// Summit Isle (Oct 14 2026): a second region, 'summit' (summitSeaLife.ts SUMMIT_SHARK_LOOPS), same meshes per region, its count
// thinned on hot phones (summitSeaLifeCounts: 3 → 2 → 1, one `count` change when the heat tier changes, no per-frame cost).
// Heat: ONE instanced fin mesh + ONE instanced body mesh per region (causeway, summit), shared geometry/materials,
// no shadows. Positions advance only inside the island's existing frame update, and only while the region is near the
// player and on screen; far away the region is hidden entirely (no draws). No loop, timer or audio of its own.
import * as T from 'three';
import {SHARK_LOOPS,type SharkLoop} from '../town/coralCay';
import {SUMMIT_SHARK_LOOPS,summitSeaLifeCounts} from '../town/summitSeaLife';
import {subscribeHeatTier,effectiveTier} from './heatTier';
import {dynamicResolutionEnabled} from './quality';
import type {SharkCircle,SharkSchools} from '../town/water/sharks';
const WATER=-.43;
function paint(g:T.BufferGeometry,color:string){const c=new T.Color(color),n=g.getAttribute('position').count,a=new Float32Array(n*3);for(let i=0;i<n;i++)a.set([c.r,c.g,c.b],i*3);g.setAttribute('color',new T.BufferAttribute(a,3));return g.index?g.toNonIndexed():g;}
/** Fin (swept back) and tail tip only, local +x forward, y 0 at the waterline. Exported for tests. */
export function finGeometry(){
 const fin=new T.Shape();fin.moveTo(.55,0);fin.quadraticCurveTo(.05,.25,-.3,.78);fin.quadraticCurveTo(-.32,.4,-.45,0);fin.closePath();
 const finG=new T.ExtrudeGeometry(fin,{depth:.09,bevelEnabled:false,steps:1,curveSegments:5});finG.translate(0,0,-.045);
 const tail=new T.Shape();tail.moveTo(-1.75,0);tail.lineTo(-2.05,.42);tail.lineTo(-1.95,0);tail.closePath();
 const tailG=new T.ExtrudeGeometry(tail,{depth:.06,bevelEnabled:false,steps:1});tailG.translate(0,0,-.03);
 const parts=[paint(finG,'#6f8a99'),paint(tailG,'#5e7888')];
 const merged=mergeAll(parts);parts.forEach(p=>p.dispose());return merged;
}
/** Top-view body silhouette ~3.2 m long, flat, drawn just under/at the surface. */
function bodyGeometry(){
 const s=new T.Shape();s.moveTo(1.35,0);s.quadraticCurveTo(1.2,.28,.5,.34);s.lineTo(.15,.9);s.lineTo(-.15,.36);s.quadraticCurveTo(-1.1,.26,-1.6,.08);s.lineTo(-2.05,.45);s.lineTo(-1.9,0);
 s.lineTo(-2.05,-.45);s.lineTo(-1.6,-.08);s.quadraticCurveTo(-1.1,-.26,-.15,-.36);s.lineTo(.15,-.9);s.lineTo(.5,-.34);s.quadraticCurveTo(1.2,-.28,1.35,0);
 const g=new T.ShapeGeometry(s,4);g.rotateX(-Math.PI/2);return g;
}
function mergeAll(parts:T.BufferGeometry[]){
 let count=0;for(const p of parts)count+=p.getAttribute('position').count;
 const pos=new Float32Array(count*3),col=new Float32Array(count*3);let o=0;
 for(const p of parts){pos.set(p.getAttribute('position').array as Float32Array,o*3);col.set(p.getAttribute('color').array as Float32Array,o*3);o+=p.getAttribute('position').count;}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));g.setAttribute('color',new T.BufferAttribute(col,3));g.computeVertexNormals();return g;
}
type Track={loop:SharkLoop;lengths:number[];total:number;u:number;phase:number};
function track(loop:SharkLoop,phase:number):Track{
 const lengths=[0];for(let i=1;i<=loop.points.length;i++){const a=loop.points[i-1],b=loop.points[i%loop.points.length];lengths.push(lengths[i-1]+Math.hypot(b.x-a.x,b.z-a.z));}
 return {loop,lengths,total:lengths[lengths.length-1],u:phase*lengths[lengths.length-1],phase};
}
type Region=SharkLoop['region'];
/** Every patrol by default (Coral Cay's causeway and Summit Isle); `loops` narrows it (tests). */
export function createCaySharks(scene:T.Scene,options:{loops?:SharkLoop[];phone?:boolean}={}){
 const all=options.loops??[...SHARK_LOOPS,...SUMMIT_SHARK_LOOPS];
 const phone=options.phone??(typeof window!=='undefined'&&typeof window.matchMedia==='function'&&dynamicResolutionEnabled(window.devicePixelRatio||1,window.matchMedia('(pointer: coarse)').matches));
 const root=new T.Group();root.name='coral-cay-sharks';scene.add(root);
 const finGeo=finGeometry(),bodyGeo=bodyGeometry();
 const finMat=new T.MeshStandardMaterial({vertexColors:true,roughness:.7,flatShading:true});
 const bodyMat=new T.MeshBasicMaterial({color:'#1f4f66',transparent:true,opacity:.4,depthWrite:false});
 const regions=[...new Set(all.map(l=>l.region))].map((region:Region)=>{
  const loops=all.filter(l=>l.region===region),tracks=loops.map((l,i)=>track(l,(i*.37)%1));
  const fins=new T.InstancedMesh(finGeo,finMat,tracks.length),bodies=new T.InstancedMesh(bodyGeo,bodyMat,tracks.length);
  fins.name=`shark-fins-${region}`;bodies.name=`shark-bodies-${region}`;bodies.renderOrder=1;
  for(const m of [fins,bodies]){m.castShadow=false;m.receiveShadow=false;m.frustumCulled=true;}
  // A fixed bound over every loop in the region: culling needs no per-frame bounds work.
  const box=new T.Box3();for(const l of loops)for(const p of l.points)box.expandByPoint(new T.Vector3(p.x,WATER,p.z));box.expandByScalar(3);
  const sphere=box.getBoundingSphere(new T.Sphere());fins.boundingSphere=sphere.clone();bodies.boundingSphere=sphere.clone();
  const group=new T.Group();group.name=`sharks-${region}`;group.add(bodies,fins);root.add(group);
  return {region,index:0,tracks,fins,bodies,group,box,sphere,time:0,placed:false,placedReduced:false,active:tracks.length};
 });
 regions.forEach((r,i)=>{r.index=i;});
 // Heat tiers: Summit Isle's sharks thin out on a hot phone (the causeway's six stay, as before). Only on a tier change.
 const applyTier=()=>{const tier=effectiveTier();for(const r of regions){r.active=r.region==='summit'?Math.min(r.tracks.length,summitSeaLifeCounts(tier,phone).sharks):r.tracks.length;r.fins.count=r.bodies.count=r.active;r.placed=false;}};
 applyTier();const offTier=subscribeHeatTier(applyTier);
 const m=new T.Matrix4(),q=new T.Quaternion(),pos=new T.Vector3(),scale=new T.Vector3(1.7,1.7,1.7)/* kid-readable from the follow camera */,up=new T.Vector3(0,1,0),frustum=new T.Frustum(),view=new T.Matrix4();
 const stats={awake:0,updated:0};
 // Water P1a (lib/town/water/sharks.ts): the circle a swimmer can attract. It moves the same instances inside this same pass.
 let circle:SharkCircle|null=null;const at={x:0,z:0,yaw:0};
 function place(r:typeof regions[number],dt:number,reduced:boolean){
  r.time+=reduced?0:dt;
  for(let i=0;i<r.active;i++){const t=r.tracks[i];
   t.u=(t.u+(reduced?0:dt*t.loop.speed))%t.total;
   const pts=t.loop.points;let k=1;while(k<t.lengths.length-1&&t.lengths[k]<t.u)k++;
   const a=pts[(k-1)%pts.length],b=pts[k%pts.length],f=(t.u-t.lengths[k-1])/((t.lengths[k]-t.lengths[k-1])||1);
   const dx=b.x-a.x,dz=b.z-a.z,l=Math.hypot(dx,dz)||1,sway=Math.sin(r.time*.9+t.phase*6)*.5;
   pos.set(a.x+dx*f-dz/l*sway,WATER-.02,a.z+dz*f+dx/l*sway);
   let yaw=Math.atan2(-dz,dx)+Math.cos(r.time*.9+t.phase*6)*.12;
   if(circle?.busy){at.x=pos.x;at.z=pos.z;at.yaw=yaw;if(circle.place(r.index,i,at)){pos.x=at.x;pos.z=at.z;yaw=at.yaw;}}
   q.setFromAxisAngle(up,yaw);
   m.compose(pos,q,scale);r.fins.setMatrixAt(i,m);
   // Now and then the whole shark swims shallow enough to see; otherwise its body sits under the opaque sea.
   const shallow=!reduced&&Math.sin(r.time*.33+t.phase*9)>.45;pos.y=shallow?WATER+.012:WATER-.08;m.compose(pos,q,scale);r.bodies.setMatrixAt(i,m);
  }
  r.fins.instanceMatrix.needsUpdate=true;r.bodies.instanceMatrix.needsUpdate=true;
 }
 /** Called from the island's frame update. Regions within 220 m draw; only a near, on-screen region moves. */
 function update(dt:number,reduced:boolean,camera:T.Camera,player:{x:number;z:number}){
  stats.awake=stats.updated=0;if(circle?.busy)circle.frame(dt);view.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);frustum.setFromProjectionMatrix(view);
  for(const r of regions){
   const dx=Math.max(r.box.min.x-player.x,0,player.x-r.box.max.x),dz=Math.max(r.box.min.z-player.z,0,player.z-r.box.max.z),distance=Math.hypot(dx,dz);
   r.group.visible=distance<220&&r.active>0;if(!r.group.visible)continue;
   if(!r.placed||r.placedReduced!==reduced){place(r,0,reduced);r.placed=true;r.placedReduced=reduced;}
   if(distance>140||!frustum.intersectsSphere(r.sphere))continue;
   // Frozen (map open, a lesson: dt 0) or static ambience: already placed, so no matrix upload (code review finding 12).
   // A circling region still moves with reduced motion (the loops hold still; only the ring turns), ≤ SHARK_HOLD + the peel-off.
   stats.awake++;if(dt===0||(reduced&&!(circle?.busy&&circle.state.region===r.index)))continue;place(r,Math.min(dt,.1),reduced);stats.updated+=r.active;
  }
 }
 /** The fin positions the circle's proximity test reads (straight from the instance matrices: no copy, no allocation). */
 const view1={active:0,awake:false},schools:SharkSchools={count:regions.length,region:(r)=>{const g=regions[r];view1.active=g.active;view1.awake=g.group.visible&&g.placed;return view1;},
  at:(r,i,out)=>{const a=regions[r].fins.instanceMatrix.array;out.x=a[i*16+12];out.z=a[i*16+14];}};
 return {root,stats,update,regions,frustum,applyTier,schools,attend(c:SharkCircle|null){circle=c;},dispose(){offTier();root.removeFromParent();for(const r of regions){r.fins.dispose();r.bodies.dispose();}finGeo.dispose();bodyGeo.dispose();finMat.dispose();bodyMat.dispose();}};
}
