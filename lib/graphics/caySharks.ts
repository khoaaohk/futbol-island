// Friendly low-poly sharks off Coral Cay (Sep 29 2026): a dorsal fin and tail tip cutting the water (the user asked for
// the wake streaks and bow box to be removed — the fin alone reads cleaner), and now and then the shallow body showing as a soft dark shape just under the surface. Paths: coralCay.ts SHARK_LOOPS.
// Summit Isle (Oct 14 2026): a second region, 'summit' (summitSeaLife.ts SUMMIT_SHARK_LOOPS), same meshes per region, its count
// thinned on hot phones (summitSeaLifeCounts: 3 → 2 → 1, one `count` change when the heat tier changes, no per-frame cost).
// Oct 20 2026: one solid slate shark under the surface (body, pectorals, attached dorsal and tail on ONE matrix and ONE veiled
// material); the fin mesh is no longer a separate waterline cut-out.
// Heat: ONE instanced fin mesh + ONE instanced body mesh per region (causeway, summit), shared geometry and ONE material,
// no shadows. Positions advance only inside the island's existing frame update, and only while the region is near the
// player and on screen; far away the region is hidden entirely (no draws). No loop, timer or audio of its own.
import * as T from 'three';
import {SHARK_LOOPS,type SharkLoop} from '../town/coralCay';
import {SUMMIT_SHARK_LOOPS,summitSeaLifeCounts} from '../town/summitSeaLife';
import {subscribeHeatTier,effectiveTier} from './heatTier';
import {dynamicResolutionEnabled} from './quality';
import type {SharkCircle,SharkSchools} from '../town/water/sharks';
import {patchSeaVeil} from './seaVeil';
const WATER=-.43;
/**
 * Oct 19 2026 ("floating on top of the water"), Oct 20 2026 ("doesn't look right": a pale paper cut-out with dark fins floating
 * apart from it): the WHOLE shark swims under the surface as one solid body, its centre ~1.4-1.6 m down (mean ± bob), the dorsal
 * tip (1.35 m above the centre at scale) just under the line; in shallows the seabed lifts it (sharks.ts SHARK_BED_CLEAR), every part seen through the same sea veil (seaVeil.ts).
 */
export const SHARK_DEPTH={mean:1.5,bob:.08} as const;
/** The slate palette (Oct 20 2026: like the whale shark's back and the mantas, no pale pastel): back, flank, belly, fins. */
export const SHARK_COLORS={back:'#33485a',flank:'#566d7e',belly:'#8798a3',fin:'#3b5061',tail:'#364b5c'} as const;
function paint(g:T.BufferGeometry,color:string){const c=new T.Color(color),n=g.getAttribute('position').count,a=new Float32Array(n*3);for(let i=0;i<n;i++)a.set([c.r,c.g,c.b],i*3);g.setAttribute('color',new T.BufferAttribute(a,3));return g.index?g.toNonIndexed():g;}
/**
 * The upright fins: the dorsal fin standing on the back's centreline and the tail's upper lobe at the rear, thin double-sided
 * plates in the body's own frame (local +x forward, y 0 on the spine). Drawn with the body's material and matrix: attached.
 * Exported for tests.
 */
export function finGeometry(){
 const fin=new T.Shape();fin.moveTo(.36,0);fin.quadraticCurveTo(.02,.22,-.27,.56);fin.quadraticCurveTo(-.25,.27,-.34,0);fin.closePath();
 const finG=new T.ExtrudeGeometry(fin,{depth:.07,bevelEnabled:false,steps:1,curveSegments:5});finG.translate(0,.235,-.035);
 const tail=new T.Shape();tail.moveTo(-1.56,0);tail.lineTo(-1.62,.09);tail.quadraticCurveTo(-1.82,.3,-2.04,.6);tail.quadraticCurveTo(-1.86,.3,-1.84,0);tail.closePath();
 const tailG=new T.ExtrudeGeometry(tail,{depth:.05,bevelEnabled:false,steps:1,curveSegments:4});tailG.translate(0,0,-.025);
 const parts=[paint(finG,SHARK_COLORS.fin),paint(tailG,SHARK_COLORS.tail)];
 const merged=mergeAll(parts);parts.forEach(p=>p.dispose());return merged;
}
/** Body stations along the spine: x, half-width, half-height, centre y (a torpedo, ~3.4 m nose to tail fork before scale). */
const STATIONS=[[1.25,.1,.08,-.01],[1.05,.19,.16,0],[.7,.28,.25,0],[.25,.33,.29,0],[-.25,.3,.27,0],[-.75,.22,.2,0],[-1.2,.13,.12,.01],[-1.55,.07,.075,.02],[-1.7,.045,.05,.02]] as const;
/**
 * The solid body (Oct 20 2026): a lofted low-poly torpedo, countershaded (slate back, grey flanks, a lighter belly), with the two
 * pectoral fins swept back from under the gills and the tail's lower lobe. Exported for tests.
 */
export function bodyGeometry(){
 const RING=10,pos:number[]=[],col:number[]=[];const back=new T.Color(SHARK_COLORS.back),flank=new T.Color(SHARK_COLORS.flank),belly=new T.Color(SHARK_COLORS.belly),c=new T.Color();
 const shade=(s:number)=>{s=Math.max(-1,Math.min(1,s));return s>0?c.copy(flank).lerp(back,Math.min(1,s*1.4)):c.copy(flank).lerp(belly,Math.min(1,-s*1.6));};
 const ring=(k:number,j:number):[number,number,number,number]=>{const [x,w,h,y]=STATIONS[k],a=j/RING*Math.PI*2;return [x,y+Math.sin(a)*h,Math.cos(a)*w,Math.sin(a)];};
 const vert=(p:[number,number,number,number])=>{pos.push(p[0],p[1],p[2]);shade(p[3]);col.push(c.r,c.g,c.b);};
 const tip=(x:number,y:number,s:number):[number,number,number,number]=>[x,y,0,s];
 for(let j=0;j<RING;j++){const j2=(j+1)%RING;
  vert(tip(1.38,-.02,0));vert(ring(0,j2));vert(ring(0,j));// the snout
  for(let k=0;k<STATIONS.length-1;k++){const a=ring(k,j),b=ring(k,j2),d=ring(k+1,j),e=ring(k+1,j2);vert(a);vert(b);vert(d);vert(b);vert(e);vert(d);}
  const n=STATIONS.length-1;vert(tip(-1.78,.02,0));vert(ring(n,j));vert(ring(n,j2));}// the tail stock
 const fin=new T.Color(SHARK_COLORS.fin);
 const tri2=(a:number[],b:number[],d:number[])=>{for(const p of [a,b,d,a,d,b]){pos.push(p[0],p[1],p[2]);col.push(fin.r,fin.g,fin.b);}};
 for(const z of [-1,1]){tri2([.5,-.13,.25*z],[.12,-.15,.27*z],[-.12,-.3,.86*z]);tri2([.5,-.13,.25*z],[-.12,-.3,.86*z],[.3,-.2,.5*z]);}// pectorals, swept back and a little down
 tri2([-1.6,-.01,0],[-1.84,-.02,0],[-1.97,-.36,0]);// the tail's lower lobe
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('color',new T.Float32BufferAttribute(col,3));g.computeVertexNormals();return g;
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
 // ONE material for every part (Oct 20 2026): the fins and the body share the sea veil, so they read as one animal at one depth.
 const bodyMat=new T.MeshBasicMaterial({vertexColors:true,side:T.DoubleSide,transparent:false,depthWrite:true})/* solid from every angle: double sided, depth-writing, slate countershaded vertex colours */;
 const time={value:0};bodyMat.onBeforeCompile=sh=>patchSeaVeil(sh,time);bodyMat.customProgramCacheKey=()=>'shark-body-sea';
 const regions=[...new Set(all.map(l=>l.region))].map((region:Region)=>{
  const loops=all.filter(l=>l.region===region),tracks=loops.map((l,i)=>track(l,(i*.37)%1));
  const fins=new T.InstancedMesh(finGeo,bodyMat,tracks.length),bodies=new T.InstancedMesh(bodyGeo,bodyMat,tracks.length);
  fins.name=`shark-fins-${region}`;bodies.name=`shark-bodies-${region}`;bodies.renderOrder=fins.renderOrder=1;
  for(const m of [fins,bodies]){m.castShadow=false;m.receiveShadow=false;m.frustumCulled=true;}
  // A fixed bound over every loop in the region: culling needs no per-frame bounds work.
  const box=new T.Box3();for(const l of loops)for(const p of l.points)box.expandByPoint(new T.Vector3(p.x,WATER,p.z));box.expandByScalar(4);box.min.y=WATER-3;
  const sphere=box.getBoundingSphere(new T.Sphere());fins.boundingSphere=sphere.clone();bodies.boundingSphere=sphere.clone();
  const group=new T.Group();group.name=`sharks-${region}`;group.add(bodies,fins);root.add(group);
  return {region,index:0,tracks,fins,bodies,group,box,sphere,time:0,placed:false,placedReduced:false,active:tracks.length};
 });
 regions.forEach((r,i)=>{r.index=i;});
 // Heat tiers: Summit Isle's sharks thin out on a hot phone (the causeway's six stay, as before). Only on a tier change.
 const applyTier=()=>{const tier=effectiveTier();for(const r of regions){r.active=r.region==='summit'?Math.min(r.tracks.length,summitSeaLifeCounts(tier,phone).sharks):r.tracks.length;r.fins.count=r.bodies.count=r.active;r.placed=false;}};
 applyTier();const offTier=subscribeHeatTier(applyTier);
 const m=new T.Matrix4(),q=new T.Quaternion(),qr=new T.Quaternion(),fwd=new T.Vector3(1,0,0),pos=new T.Vector3(),scale=new T.Vector3(1.7,1.7,1.7)/* kid-readable from the follow camera */,up=new T.Vector3(0,1,0),frustum=new T.Frustum(),view=new T.Matrix4();
 const stats={awake:0,updated:0};
 // Water P1a (lib/town/water/sharks.ts): the circle a swimmer can attract. It moves the same instances inside this same pass.
 let circle:SharkCircle|null=null;const at={x:0,z:0,yaw:0,roll:0,cap:Infinity};
 function place(r:typeof regions[number],dt:number,reduced:boolean){
  r.time+=reduced?0:dt;
  for(let i=0;i<r.active;i++){const t=r.tracks[i];
   t.u=(t.u+(reduced?0:dt*t.loop.speed))%t.total;
   const pts=t.loop.points;let k=1;while(k<t.lengths.length-1&&t.lengths[k]<t.u)k++;
   const a=pts[(k-1)%pts.length],b=pts[k%pts.length],f=(t.u-t.lengths[k-1])/((t.lengths[k]-t.lengths[k-1])||1);
   const dx=b.x-a.x,dz=b.z-a.z,l=Math.hypot(dx,dz)||1,sway=Math.sin(r.time*.9+t.phase*6)*.5;
   let depth=SHARK_DEPTH.mean+SHARK_DEPTH.bob*Math.sin(r.time*.4+t.phase*5);
   pos.set(a.x+dx*f-dz/l*sway,0,a.z+dz*f+dx/l*sway);
   let yaw=Math.atan2(-dz,dx)+Math.cos(r.time*.9+t.phase*6)*.12,roll=0;
   if(circle?.busy){at.x=pos.x;at.z=pos.z;at.yaw=yaw;at.roll=0;at.cap=Infinity;if(circle.place(r.index,i,at)){pos.x=at.x;pos.z=at.z;yaw=at.yaw;roll=at.roll;depth=Math.min(depth,Math.max(.75,at.cap));}}
   // One matrix for the body and its fins (attached), the whole shark under the line (a slow swell), banking into a turn.
   pos.y=WATER-depth;q.setFromAxisAngle(up,yaw);if(roll!==0)q.multiply(qr.setFromAxisAngle(fwd,roll));
   m.compose(pos,q,scale);r.fins.setMatrixAt(i,m);r.bodies.setMatrixAt(i,m);
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
   stats.awake++;if(dt===0||(reduced&&!(circle?.busy&&circle.state.region===r.index)))continue;time.value=(time.value+Math.min(dt,.1))%3600;place(r,Math.min(dt,.1),reduced);stats.updated+=r.active;
  }
 }
 /** The fin positions the circle's proximity test reads (straight from the instance matrices: no copy, no allocation). */
 const view1={active:0,awake:false},schools:SharkSchools={count:regions.length,region:(r)=>{const g=regions[r];view1.active=g.active;view1.awake=g.group.visible&&g.placed;return view1;},
  at:(r,i,out)=>{const a=regions[r].fins.instanceMatrix.array;out.x=a[i*16+12];out.z=a[i*16+14];}};
 return {root,stats,update,regions,frustum,applyTier,schools,attend(c:SharkCircle|null){circle=c;},dispose(){offTier();root.removeFromParent();for(const r of regions){r.fins.dispose();r.bodies.dispose();}finGeo.dispose();bodyGeo.dispose();bodyMat.dispose();}};
}
