// Manta rays gliding round Coral Cay and both sandbars (Sep 30 2026, user: "Add manta rays swimming around the smaller
// islands"). Paths: lib/town/mantaLoops.ts. Taught by Nia, the Starfish Sandbar lifeguard (coralCayNpcs.ts).
//
// Look: low-poly, flat-shaded, island palette: a dark top with pale shoulder patches, a pale belly, curled cephalic fins
// and a thin tail. Under the (opaque) sea each manta reads as a soft dark silhouette on the surface, like the sharks'
// bodies; the full 3D manta only appears for a rare, bounded surfacing (a wingtip breaking the water, or a gentle breach),
// where the opaque sea itself hides whatever is still under water.
//
// Heat (AGENTS.md, docs/performance-guide.md "Manta rays"):
//  - ONE shared geometry and two shared materials. Per island: one instanced silhouette mesh (1 draw) plus one 1-instance
//    surfacing mesh that is visible only during a surfacing (≤ 1 per island at a time, ≤ 3.2 s, ~every 22–50 s awake).
//  - The wing wave is a vertex-shader term (one shared time uniform + a per-instance phase); the CPU only moves ≤ 3
//    instance matrices per awake island. No shadows (cast or received).
//  - Moves only inside the island's frame update (world.updateSharks → updateCoralCay), only for an island within 140 m of
//    the player with a loop on screen; beyond 220 m the island's mantas are hidden entirely (no draws). Frozen frames
//    (dt 0: map, lessons, overlays) and reduced motion / static ambience upload nothing; the island loop itself parks
//    behind overlays, so nothing runs there at all. No per-frame allocations, no loop, timer or audio of its own.
//  - Phones draw 2 mantas round the cay (desktop 3); both sandbars keep 2.
import * as T from 'three';
import {MANTA_ISLANDS,mantaLoopsFor,type MantaIsland,type MantaLoop} from '../town/mantaLoops';
import {dynamicResolutionEnabled} from './quality';
const WATER=-.43,SCALE=1.2,NEAR=140,DRAW=220;
export const MANTA_EVENT={minGap:22,spread:28,breach:2.4,wingtip:3.2,breachChance:.34} as const;
const hash=(i:number)=>{const s=Math.sin(i*12.9898+4.1414)*43758.5453;return s-Math.floor(s);};

/** Low-poly manta, local +x forward, y up, z across the wings (half-span 2.3 m before SCALE). Non-indexed, vertex-coloured. */
export function mantaGeometry(){
 const TOP='#27313d',PATCH='#8d99a4',BELLY='#ece5d3',FIN='#1f2832';
 // Span stations: leading edge x, trailing edge x, top and belly height at mid-chord.
 const z=[0,.35,.8,1.4,1.9,2.3],le=[1.05,1,.72,.22,-.22,-.62],te=[-1,-.95,-.72,-.5,-.52,-.62],top=[.22,.19,.11,.05,.02,0],bot=[-.12,-.1,-.05,-.02,-.01,0];
 const pos:number[]=[],col:number[]=[],c=new T.Color();
 const tri=(a:number[],b:number[],d:number[],color:string)=>{pos.push(...a,...b,...d);c.set(color);for(let k=0;k<3;k++)col.push(c.r,c.g,c.b);};
 for(const side of [1,-1]){
  // Winding so the top faces +y and the belly -y on both sides.
  const T3=(a:number[],b:number[],d:number[],color:string)=>side>0?tri(a,d,b,color):tri(a,b,d,color);
  for(let i=0;i<z.length-1;i++){
   const z0=z[i]*side,z1=z[i+1]*side,m0=(le[i]+te[i])/2,m1=(le[i+1]+te[i+1])/2;
   const L0=[le[i],0,z0],L1=[le[i+1],0,z1],E0=[te[i],0,z0],E1=[te[i+1],0,z1],U0=[m0,top[i],z0],U1=[m1,top[i+1],z1],B0=[m0,bot[i],z0],B1=[m1,bot[i+1],z1];
   const patch=i===1||i===2?PATCH:TOP;
   // Top: leading half (shoulder patch near the head), trailing half.
   T3(L0,L1,U1,patch);T3(L0,U1,U0,patch);T3(U0,U1,E1,TOP);T3(U0,E1,E0,TOP);
   // Belly.
   T3(L0,B1,L1,BELLY);T3(L0,B0,B1,BELLY);T3(B0,E1,B1,BELLY);T3(B0,E0,E1,BELLY);
  }
  // Cephalic fins: two curled lobes either side of the mouth, pointing forward (top and bottom face).
  const f0=[1.0,.04,.22*side],f1=[1.0,.04,.5*side],f2=[1.42,-.02,.4*side],f3=[1.3,-.08,.3*side];
  T3(f0,f2,f1,FIN);T3(f0,f1,f2,FIN);T3(f0,f3,f2,FIN);T3(f0,f2,f3,FIN);
  // Tail: a thin whip behind the body.
  T3([-.95,.06,.07*side],[-2.5,.02,0],[-.95,.06,0],FIN);T3([-.95,.06,.07*side],[-.95,.06,0],[-2.5,.02,0],FIN);
 }
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('color',new T.Float32BufferAttribute(col,3));g.computeVertexNormals();g.computeBoundingSphere();
 return g;
}
/** Wing wave in the vertex shader: a slow flap travelling from the leading edge to the wingtip, plus a slight span tuck on
 *  the upstroke (so the silhouette breathes when seen from above). One shared time uniform; per-instance phase. */
export const WING_WAVE=`
float mSpan=abs(transformed.z);
float mWing=smoothstep(.35,2.3,mSpan);
float mWave=sin(uMantaTime*1.9+aPhase-transformed.x*.8-mSpan*.55);
transformed.y+=mWing*mWing*.62*mWave;
transformed.z*=1.-.1*mWing*(.5+.5*mWave);`;
function addWingWave(material:T.Material,uniform:{value:number}){
 material.onBeforeCompile=shader=>{shader.uniforms.uMantaTime=uniform;
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nattribute float aPhase;\nuniform float uMantaTime;').replace('#include <begin_vertex>','#include <begin_vertex>'+WING_WAVE);};
 material.customProgramCacheKey=()=>'manta-wing-wave';
}
type Track={loop:MantaLoop;lengths:number[];total:number;u:number;k:number;phase:number;box:{minX:number;maxX:number;minZ:number;maxZ:number};sphere:T.Sphere};
function track(loop:MantaLoop,start:number,phase:number):Track{
 const lengths=[0],n=loop.points.length;for(let i=1;i<=n;i++){const a=loop.points[i-1],b=loop.points[i%n];lengths.push(lengths[i-1]+Math.hypot(b.x-a.x,b.z-a.z));}
 const xs=loop.points.map(p=>p.x),zs=loop.points.map(p=>p.z),box={minX:Math.min(...xs),maxX:Math.max(...xs),minZ:Math.min(...zs),maxZ:Math.max(...zs)};
 const b3=new T.Box3(new T.Vector3(box.minX-4,WATER-1,box.minZ-4),new T.Vector3(box.maxX+4,WATER+3,box.maxZ+4));
 const total=lengths[n];return {loop,lengths,total,u:start*total,k:1,phase,box,sphere:b3.getBoundingSphere(new T.Sphere())};
}
const boxDistance=(b:{minX:number;maxX:number;minZ:number;maxZ:number},x:number,z:number)=>Math.hypot(Math.max(b.minX-x,0,x-b.maxX),Math.max(b.minZ-z,0,z-b.maxZ));

export function createCayMantas(scene:T.Scene,options:{phone?:boolean}={}){
 // Same phone rule as graphicsQuality().phone (coarse pointer or DPR > 2).
 const phone=options.phone??(typeof window!=='undefined'&&typeof window.matchMedia==='function'&&dynamicResolutionEnabled(window.devicePixelRatio||1,window.matchMedia('(pointer: coarse)').matches));
 const root=new T.Group();root.name='island-mantas';scene.add(root);
 const geometry=mantaGeometry(),time={value:0};
 const underMat=new T.MeshBasicMaterial({color:'#12384b',transparent:true,opacity:.42,depthWrite:false});
 const surfaceMat=new T.MeshLambertMaterial({vertexColors:true,flatShading:true});
 addWingWave(underMat,time);addWingWave(surfaceMat,time);
 // Per-mesh geometries share the one set of vertex buffers (same attribute objects, uploaded once) and add a phase.
 const withPhase=(phases:number[])=>{const g=new T.BufferGeometry();for(const name of ['position','color','normal'])g.setAttribute(name,geometry.getAttribute(name));g.boundingSphere=geometry.boundingSphere;g.setAttribute('aPhase',new T.InstancedBufferAttribute(new Float32Array(phases),1));return g;};
 const islands=MANTA_ISLANDS.map((island,ii)=>{
  const loops=mantaLoopsFor(island,phone),tracks=loops.map((l,i)=>track(l,hash(ii*7+i),ii*1.7+i*2.3));
  const under=new T.InstancedMesh(withPhase(tracks.map(t=>t.phase)),underMat,tracks.length),surface=new T.InstancedMesh(withPhase([0]),surfaceMat,1);
  under.name=`manta-shadows-${island}`;surface.name=`manta-surfacing-${island}`;under.renderOrder=1;surface.visible=false;
  for(const m of [under,surface]){m.castShadow=false;m.receiveShadow=false;m.frustumCulled=true;}
  // A fixed bound over every loop (plus breach height): culling needs no per-frame bounds work.
  const box=new T.Box3();for(const l of loops)for(const p of l.points)box.expandByPoint(new T.Vector3(p.x,WATER,p.z));box.expandByScalar(4);box.max.y+=3;
  const sphere=box.getBoundingSphere(new T.Sphere());under.boundingSphere=sphere.clone();surface.boundingSphere=sphere.clone();
  const group=new T.Group();group.name=`mantas-${island}`;group.add(under,surface);root.add(group);
  const flat={minX:box.min.x,maxX:box.max.x,minZ:box.min.z,maxZ:box.max.z};
  return {island,tracks,under,surface,group,box:flat,sphere,time:0,placed:false,placedReduced:false,
   event:{active:false,manta:0,kind:'wingtip' as 'wingtip'|'breach',t:0,duration:0,side:1},next:MANTA_EVENT.minGap*.5+hash(ii+3)*MANTA_EVENT.spread,events:0};
 });
 type Island=typeof islands[number];
 const m=new T.Matrix4(),q=new T.Quaternion(),e=new T.Euler(),pos=new T.Vector3(),flat=new T.Vector3(SCALE,.02,SCALE),full=new T.Vector3(SCALE,SCALE,SCALE),zero=new T.Vector3(0,0,0);
 const stats={awake:0,updated:0,surfacing:0,events:0,visibleIslands:0};
 function startEvent(r:Island){
  const ev=r.event,n=r.tracks.length,h=hash(r.events*3.1+r.tracks[0].phase);
  ev.active=true;ev.manta=r.events%n;ev.kind=h<MANTA_EVENT.breachChance?'breach':'wingtip';ev.t=0;ev.duration=ev.kind==='breach'?MANTA_EVENT.breach:MANTA_EVENT.wingtip;ev.side=r.events%2?1:-1;
  const phase=r.surface.geometry.getAttribute('aPhase') as T.InstancedBufferAttribute;phase.setX(0,r.tracks[ev.manta].phase);phase.needsUpdate=true;
  r.events++;stats.events++;r.surface.visible=true;
 }
 function endEvent(r:Island){r.event.active=false;r.surface.visible=false;r.next=MANTA_EVENT.minGap+hash(r.events*5.7+r.tracks[0].phase)*MANTA_EVENT.spread;}
 function place(r:Island,dt:number,reduced:boolean){
  r.time+=dt;
  if(reduced){if(r.event.active)endEvent(r);}
  else if(r.event.active){r.event.t+=dt;if(r.event.t>=r.event.duration)endEvent(r);}
  else if(dt>0&&(r.next-=dt)<=0)startEvent(r);
  for(let i=0;i<r.tracks.length;i++){
   const t=r.tracks[i],pts=t.loop.points,n=pts.length;
   const before=t.u;t.u=(t.u+dt*t.loop.speed)%t.total;if(t.u<before)t.k=1;
   while(t.k<n&&t.lengths[t.k]<t.u)t.k++;
   const a=pts[t.k-1],b=pts[t.k%n],f=(t.u-t.lengths[t.k-1])/((t.lengths[t.k]-t.lengths[t.k-1])||1);
   const dx=b.x-a.x,dz=b.z-a.z,yaw=Math.atan2(-dz,dx);
   pos.set(a.x+dx*f,WATER+.015,a.z+dz*f);
   const ev=r.event,surfacing=ev.active&&ev.manta===i;let airborne=false;
   if(surfacing){
    const s=Math.min(1,ev.t/ev.duration),arc=Math.sin(Math.PI*s);let pitch=0,roll=0;
    if(ev.kind==='breach'){const h=-.9+3.3*arc;airborne=h>.1;pos.y=WATER+h;pitch=Math.atan2(3.3*Math.PI/ev.duration*Math.cos(Math.PI*s),t.loop.speed*2)*.75;roll=.25*arc*ev.side;}
    else{pos.y=WATER-.32;roll=.38*arc*ev.side;}
    e.set(roll,yaw,pitch,'YZX');q.setFromEuler(e);m.compose(pos,q,full);r.surface.setMatrixAt(0,m);r.surface.instanceMatrix.needsUpdate=true;
    pos.y=WATER+.015;
   }
   e.set(0,yaw,0,'YZX');q.setFromEuler(e);m.compose(pos,q,airborne?zero:flat);r.under.setMatrixAt(i,m);
  }
  r.under.instanceMatrix.needsUpdate=true;
 }
 let clock=0;
 /** Called from the island's frame update with the frustum the sharks just built. */
 function update(dt:number,reduced:boolean,frustum:T.Frustum,player:{x:number;z:number}){
  stats.awake=stats.updated=stats.surfacing=stats.visibleIslands=0;let moved=false;
  for(const r of islands){
   r.group.visible=boxDistance(r.box,player.x,player.z)<DRAW;if(!r.group.visible)continue;stats.visibleIslands++;
   if(!r.placed||r.placedReduced!==reduced){place(r,0,reduced);r.placed=true;r.placedReduced=reduced;}
   let awake=false;for(const t of r.tracks)if(boxDistance(t.box,player.x,player.z)<NEAR&&frustum.intersectsSphere(t.sphere)){awake=true;break;}
   if(!awake)continue;
   // Frozen (dt 0: map, lessons) or static ambience / reduced motion: already placed, so no matrix upload.
   stats.awake++;if(dt===0||reduced)continue;
   place(r,Math.min(dt,.1),false);stats.updated+=r.tracks.length;if(r.event.active)stats.surfacing++;moved=true;
  }
  // Wrap on a whole number of flap periods (2π/1.9 s), so the wave never jumps.
  if(moved){clock=(clock+Math.min(dt,.1))%(2*Math.PI/1.9*500);time.value=clock;}
 }
 return {root,stats,update,islands,time,dispose(){root.removeFromParent();for(const r of islands){r.under.geometry.dispose();r.surface.geometry.dispose();r.under.dispose();r.surface.dispose();}geometry.dispose();underMat.dispose();surfaceMat.dispose();}};
}
