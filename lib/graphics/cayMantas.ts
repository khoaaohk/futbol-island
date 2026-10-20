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
//  - Summit Isle (Oct 14 2026) is a fourth island: 3 mantas on desktop, 2 on phones, thinned on hot tiers (summitSeaLifeCounts:
//    2 at tiers 1–2, 1 at tier 3, none at the hottest), one `count` change when the tier changes.
import * as T from 'three';
import {MANTA_ISLANDS,mantaLoopsFor,type RayLoop} from '../town/mantaLoops';
import type {HeatTier} from './heatTier';
import {dynamicResolutionEnabled} from './quality';
import {subscribeHeatTier,effectiveTier} from './heatTier';
import {summitSeaLifeCounts} from '../town/summitSeaLife';
import {RIDE_BACK,RIDE_BANK,RIDE_RISE,type RideFriend} from '../town/water/animalRides';
import {patchSeaVeil} from './seaVeil';
const WATER=-.43,SCALE=1.2,NEAR=140,DRAW=220;
/** Oct 19 2026: how deep the swimming mantas' backs ride (m under the water line): mean ± bob (0.9 to 1.5). */
export const MANTA_DEPTH={mean:1.2,bob:.3,top:.26} as const;
export const MANTA_EVENT={minGap:22,spread:28,breach:2.4,wingtip:3.2,breachChance:.34} as const;
const hash=(i:number)=>{const s=Math.sin(i*12.9898+4.1414)*43758.5453;return s-Math.floor(s);};

/** Low-poly manta, local +x forward, y up, z across the wings (half-span 2.3 m before SCALE). Non-indexed, vertex-coloured. */
export function mantaGeometry(){
 // Oct 20 2026: the slate palette of the sharks / whale shark (caySharks.ts SHARK_COLORS): slate back, soft grey shoulder
 // patches, a pale-slate belly (was cream: seen through the wing from above it read as a pale sliver).
 const TOP='#33485a',PATCH='#5d7383',BELLY='#8798a3',FIN='#2d414f';
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
 // The wing wave is the manta's own; the seen-through-water look (depth trick, veil, light bands, wobble) is the shared seaVeil.ts.
 material.onBeforeCompile=shader=>{shader.uniforms.uMantaTime=uniform;patchSeaVeil(shader,uniform,{vertexHead:'attribute float aPhase;uniform float uMantaTime;',vertexAnim:WING_WAVE});};
 material.customProgramCacheKey=()=>'manta-wing-wave-sea';
}
type Track={loop:RayLoop;/** The drawn size (SCALE × the loop's own scale: open-sea eagle / sting rays are smaller). */scaleV:T.Vector3;lengths:number[];total:number;u:number;k:number;phase:number;/** Held by a rider (water P1b, lib/town/water/animalRides.ts): the ride owns `u`. */ridden:boolean;/** Free (steered ride / swim back, animalRides.ts): the ride owns the pose (fx, fz, fyaw) instead of the loop. */free:boolean;fx:number;fz:number;fyaw:number;/** The drawn (tick-interpolated) pose while free, the ride's bank, and how far it has risen to the rider's seat (0..1, animalRides.ts RIDE_RISE). */dx:number;dz:number;dyaw:number;bank:number;rise:number;/** The dart after a ride (animalRides.ts DART_*): speed multiplier, sideways offset (m, + = right), extra heading. */boost:number;bend:number;bendYaw:number;box:{minX:number;maxX:number;minZ:number;maxZ:number};sphere:T.Sphere};
function track(loop:RayLoop,start:number,phase:number):Track{
 const lengths=[0],n=loop.points.length;for(let i=1;i<=n;i++){const a=loop.points[i-1],b=loop.points[i%n];lengths.push(lengths[i-1]+Math.hypot(b.x-a.x,b.z-a.z));}
 const xs=loop.points.map(p=>p.x),zs=loop.points.map(p=>p.z),box={minX:Math.min(...xs),maxX:Math.max(...xs),minZ:Math.min(...zs),maxZ:Math.max(...zs)};
 const b3=new T.Box3(new T.Vector3(box.minX-4,WATER-3,box.minZ-4),new T.Vector3(box.maxX+4,WATER+3,box.maxZ+4));
 const total=lengths[n],s=SCALE*(loop.scale??1);return {loop,scaleV:new T.Vector3(s,s,s),lengths,total,u:start*total,k:1,phase,ridden:false,free:false,fx:0,fz:0,fyaw:0,dx:0,dz:0,dyaw:0,bank:0,rise:0,boost:1,bend:0,bendYaw:0,box,sphere:b3.getBoundingSphere(new T.Sphere())};
}
const boxDistance=(b:{minX:number;maxX:number;minZ:number;maxZ:number},x:number,z:number)=>Math.hypot(Math.max(b.minX-x,0,x-b.maxX),Math.max(b.minZ-z,0,z-b.maxZ));

/** Options. Default: the islands' mantas (mantaLoops.ts). Oct 20 2026 (seaLifeAreas.ts): a second instance draws the open-sea
 *  rays with its own `groups` (one instanced mesh per area), `name`, and `groupCount` (rays kept per group at a heat tier). */
export type RayGroupsOptions={phone?:boolean;groups?:{island:string;loops:RayLoop[]}[];name?:string;groupCount?:(tier:HeatTier,phone:boolean)=>number};
export function createCayMantas(scene:T.Scene,options:RayGroupsOptions={}){
 // Same phone rule as graphicsQuality().phone (coarse pointer or DPR > 2).
 const phone=options.phone??(typeof window!=='undefined'&&typeof window.matchMedia==='function'&&dynamicResolutionEnabled(window.devicePixelRatio||1,window.matchMedia('(pointer: coarse)').matches));
 const root=new T.Group();root.name=options.name??'island-mantas';scene.add(root);
 const geometry=mantaGeometry(),time={value:0};
 // Oct 20 2026 (user: "disappearing at some angles", "glitchy"): FrontSide. The model is closed (top faces +y, belly -y, fins and
 // tail have both windings), and seaVeil.ts squeezes a submerged body's depth into a few cm, so double-sided top and belly z-fought.
 const underMat=new T.MeshBasicMaterial({side:T.FrontSide,vertexColors:true/* Oct 19 2026: a real manta swimming 0.9-1.5 m UNDER the surface (MANTA_DEPTH), solid so coral never shows through, veiled by seaVeil.ts */});
 const surfaceMat=new T.MeshLambertMaterial({vertexColors:true,flatShading:true,side:T.FrontSide});// also veiled below the line (a wingtip rising from the depths)
 addWingWave(underMat,time);addWingWave(surfaceMat,time);
 // Per-mesh geometries share the one set of vertex buffers (same attribute objects, uploaded once) and add a phase.
 const withPhase=(phases:number[])=>{const g=new T.BufferGeometry();for(const name of ['position','color','normal'])g.setAttribute(name,geometry.getAttribute(name));g.boundingSphere=geometry.boundingSphere;g.setAttribute('aPhase',new T.InstancedBufferAttribute(new Float32Array(phases),1));return g;};
 const groups=options.groups??MANTA_ISLANDS.map(island=>({island:island as string,loops:mantaLoopsFor(island,phone) as RayLoop[]}));
 const white=new T.Color(1,1,1),tintC=new T.Color();
 const islands=groups.map(({island,loops},ii)=>{
  const tracks=loops.map((l,i)=>track(l,hash(ii*7+i),ii*1.7+i*2.3));
  const under=new T.InstancedMesh(withPhase(tracks.map(t=>t.phase)),underMat,tracks.length),surface=new T.InstancedMesh(withPhase([0]),surfaceMat,1);
  under.name=`manta-shadows-${island}`;surface.name=`manta-surfacing-${island}`;under.renderOrder=1;surface.visible=false;
  for(const m of [under,surface]){m.castShadow=false;m.receiveShadow=false;m.frustumCulled=true;}
  // Eagle / sting rays: a per-instance multiply tint on the shared palette (no texture); white for a manta in the same group.
  if(loops.some(l=>l.tint)){tracks.forEach((t,i)=>under.setColorAt(i,t.loop.tint?tintC.set(t.loop.tint):white));surface.setColorAt(0,white);}
  // A fixed bound over every loop (plus breach height): culling needs no per-frame bounds work.
  const box=new T.Box3();for(const l of loops)for(const p of l.points)box.expandByPoint(new T.Vector3(p.x,WATER,p.z));box.expandByScalar(4);box.max.y+=3;
  const sphere=box.getBoundingSphere(new T.Sphere());under.boundingSphere=sphere.clone();surface.boundingSphere=sphere.clone();
  const group=new T.Group();group.name=`mantas-${island}`;group.add(under,surface);root.add(group);
  const flat={minX:box.min.x,maxX:box.max.x,minZ:box.min.z,maxZ:box.max.z};
  return {island,tracks,under,surface,group,box:flat,sphere,time:0,placed:false,placedReduced:false,ridden:false,
   event:{active:false,manta:0,kind:'wingtip' as 'wingtip'|'breach',t:0,duration:0,side:1},next:MANTA_EVENT.minGap*.5+hash(ii+3)*MANTA_EVENT.spread,events:0,active:tracks.length};
 });
 type Island=typeof islands[number];
 // Heat tiers: Summit Isle's mantas thin out on a hot phone (the cay's and sandbars' stay as before). Only on a tier change.
 const applyTier=()=>{const tier=effectiveTier();for(const r of islands){if(!options.groupCount&&r.island!=='summit')continue;r.active=Math.min(r.tracks.length,options.groupCount?options.groupCount(tier,phone):summitSeaLifeCounts(tier,phone).mantas);r.under.count=r.active;if(r.event.active)endEvent(r);r.placed=false;}};
 const m=new T.Matrix4(),q=new T.Quaternion(),e=new T.Euler(),pos=new T.Vector3(),zero=new T.Vector3(0,0,0);
 const stats={awake:0,updated:0,surfacing:0,events:0,visibleIslands:0};
 function startEvent(r:Island){
  const ev=r.event,n=r.active,h=hash(r.events*3.1+r.tracks[0].phase);
  ev.active=true;ev.manta=r.events%n;ev.kind=h<MANTA_EVENT.breachChance?'breach':'wingtip';ev.t=0;ev.duration=ev.kind==='breach'?MANTA_EVENT.breach:MANTA_EVENT.wingtip;ev.side=r.events%2?1:-1;
  const phase=r.surface.geometry.getAttribute('aPhase') as T.InstancedBufferAttribute;phase.setX(0,r.tracks[ev.manta].phase);phase.needsUpdate=true;
  const tm=r.tracks[ev.manta];if(r.surface.instanceColor){r.surface.setColorAt(0,tm.loop.tint?tintC.set(tm.loop.tint):white);r.surface.instanceColor.needsUpdate=true;}
  r.events++;stats.events++;r.surface.visible=true;
 }
 function endEvent(r:Island){r.event.active=false;r.surface.visible=false;r.next=MANTA_EVENT.minGap+hash(r.events*5.7+r.tracks[0].phase)*MANTA_EVENT.spread;}
 function place(r:Island,dt:number,reduced:boolean){
  r.time+=dt;
  if(reduced){if(r.event.active)endEvent(r);}
  else if(r.event.active){r.event.t+=dt;if(r.event.t>=r.event.duration)endEvent(r);}
  else if(dt>0&&!r.ridden&&(r.next-=dt)<=0)startEvent(r);
  for(let i=0;i<r.active;i++){
   const t=r.tracks[i],pts=t.loop.points,n=pts.length;
   if(!t.ridden&&!t.free){const before=t.u;t.u=(t.u+dt*t.loop.speed*t.boost)%t.total;if(t.u<before)t.k=1;}else if(t.u<t.lengths[t.k-1])t.k=1;// ridden: the ride moved u
   while(t.k<n&&t.lengths[t.k]<t.u)t.k++;
   const a=pts[t.k-1],b=pts[t.k%n],f=(t.u-t.lengths[t.k-1])/((t.lengths[t.k]-t.lengths[t.k-1])||1);
   const dx=b.x-a.x,dz=b.z-a.z;let yaw=Math.atan2(-dz,dx)+t.bendYaw;
   // Ridden (Oct 20 2026, user: "same with ray"): it rises (rise 0 → 1 at RIDE_RISE) until its back is RIDE_BACK.manta under the
   // water line, right under the rider's seat (animalRides.ts RIDE_GRIP), banks with the steered turns, and sinks back after.
   if(dt>0)t.rise+=((t.ridden?1:0)-t.rise)*(1-Math.exp(-dt*RIDE_RISE));
   const swimDepth=MANTA_DEPTH.mean+MANTA_DEPTH.bob*Math.sin(r.time*.5+t.phase),deep=WATER-MANTA_DEPTH.top-(swimDepth+(RIDE_BACK.manta-swimDepth)*t.rise);
   pos.set(a.x+dx*f,deep,a.z+dz*f);
   if(t.free){pos.x=t.dx;pos.z=t.dz;yaw=t.dyaw-Math.PI/2;}// steered (animalRides.ts): the drawn (tick-interpolated) pose
   else if(t.bend!==0){const l=Math.hypot(dx,dz)||1;pos.x+=dz/l*t.bend;pos.z-=dx/l*t.bend;}// the dart's sideways bend (right of the heading)
   const ev=r.event,surfacing=ev.active&&ev.manta===i;let airborne=false;
   // Ridden (water P1b): Oct 15 2026 (user: "make the manta ray riding look like the whales", "no black"): it stays its soft
   // silhouette just under the surface, like the whale shark (the shared shadow material, its own instance): no surfacing mesh.
   if(surfacing){
    const s=Math.min(1,ev.t/ev.duration),arc=Math.sin(Math.PI*s);let pitch=0,roll=0;
    if(ev.kind==='breach'){const h=-.9+3.3*arc;airborne=h>.1;pos.y=WATER+h;pitch=Math.atan2(3.3*Math.PI/ev.duration*Math.cos(Math.PI*s),t.loop.speed*2)*.75;roll=.25*arc*ev.side;}
    else{pos.y=WATER-.32;roll=.38*arc*ev.side;}
    e.set(roll,yaw,pitch,'YZX');q.setFromEuler(e);m.compose(pos,q,t.scaleV);r.surface.setMatrixAt(0,m);r.surface.instanceMatrix.needsUpdate=true;
    pos.y=deep;
   }
   // The ride's bank: a roll about the long axis through the BACK (MANTA_DEPTH.top above the centre), so the rider's seat stays put.
   const bank=t.free?t.bank*RIDE_BANK.manta:0;if(bank!==0){const h=MANTA_DEPTH.top,zl=-h*Math.sin(bank);pos.y+=h*(1-Math.cos(bank));pos.x+=zl*Math.sin(yaw);pos.z+=zl*Math.cos(yaw);}
   e.set(bank,yaw,0,'YZX');q.setFromEuler(e);m.compose(pos,q,airborne||surfacing?zero:t.scaleV);r.under.setMatrixAt(i,m);
  }
  r.under.instanceMatrix.needsUpdate=true;
 }
 let clock=0;
 /** Called from the island's frame update with the frustum the sharks just built. */
 function update(dt:number,reduced:boolean,frustum:T.Frustum,player:{x:number;z:number}){
  stats.awake=stats.updated=stats.surfacing=stats.visibleIslands=0;let moved=false;
  for(const r of islands){
   // Ridden or steered (animalRides.ts) a manta can leave its loop's fixed bound: never hidden or culled while held.
   r.group.visible=r.active>0&&(r.ridden||boxDistance(r.box,player.x,player.z)<DRAW);r.under.frustumCulled=!r.ridden;if(!r.group.visible)continue;stats.visibleIslands++;
   if(!r.placed||r.placedReduced!==reduced){place(r,0,reduced);r.placed=true;r.placedReduced=reduced;}
   let awake=r.ridden;if(!awake)for(let i=0;i<r.active;i++){const t=r.tracks[i];if(boxDistance(t.box,player.x,player.z)<NEAR&&frustum.intersectsSphere(t.sphere)){awake=true;break;}}
   if(!awake)continue;
   // Frozen (dt 0: map, lessons) or static ambience / reduced motion: already placed, so no matrix upload.
   stats.awake++;if(dt===0||reduced&&!r.ridden)continue;// a ride is the player's own travel: it moves with reduced motion too
   place(r,Math.min(dt,.1),false);stats.updated+=r.active;if(r.event.active)stats.surfacing++;moved=true;
  }
  // Wrap on a whole number of flap periods (2π/1.9 s), so the wave never jumps.
  if(moved){clock=(clock+Math.min(dt,.1))%(2*Math.PI/1.9*500);time.value=clock;}
 }
 /** Water P1b (lib/town/water/animalRides.ts): every manta as a ridable "island friend". `ridden` holds it on its
  *  silhouette instance, like the whale shark (any wingtip / breach on its island ends first, none start while it is held). */
 const friends:RideFriend[]=[];
 for(const r of islands)r.tracks.forEach((t,i)=>t.loop.ridable!==false&&friends.push({kind:'manta',id:t.loop.id,points:t.loop.points,lengths:t.lengths,total:t.total,
  get u(){return t.u;},set u(v:number){t.u=v;},get available(){return i<r.active&&r.group.visible;},get free(){return t.free;},set free(v:boolean){if(v===t.free)return;t.free=v;r.ridden=r.tracks.some(x=>x.ridden||x.free);r.placed=false;},get fx(){return t.fx;},set fx(v:number){t.fx=v;},get fz(){return t.fz;},set fz(v:number){t.fz=v;},get fyaw(){return t.fyaw;},set fyaw(v:number){t.fyaw=v;},get dx(){return t.dx;},set dx(v:number){t.dx=v;},get dz(){return t.dz;},set dz(v:number){t.dz=v;},get dyaw(){return t.dyaw;},set dyaw(v:number){t.dyaw=v;},get bank(){return t.bank;},set bank(v:number){t.bank=v;},get ridden(){return t.ridden;},speed:t.loop.speed,
  get boost(){return t.boost;},set boost(v:number){t.boost=v;},get bend(){return t.bend;},set bend(v:number){t.bend=v;},get bendYaw(){return t.bendYaw;},set bendYaw(v:number){t.bendYaw=v;},
  set ridden(v:boolean){if(v===t.ridden)return;t.ridden=v;r.ridden=r.tracks.some(x=>x.ridden||x.free);if(r.event.active)endEvent(r);
   r.placed=false;}}));
 applyTier();const offTier=subscribeHeatTier(applyTier);
 return {root,stats,update,islands,time,applyTier,friends,dispose(){offTier();root.removeFromParent();for(const r of islands){r.under.geometry.dispose();r.surface.geometry.dispose();r.under.dispose();r.surface.dispose();}geometry.dispose();underMat.dispose();surfaceMat.dispose();}};
}
