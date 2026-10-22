// Explore zone neighbourhoods (Oct 21 2026, user: "sea-life loops near zones"): turtles that come up to breathe beside Turtle Pool,
// fish schools off Kelp Forest Wreck and Ball Crate Reef, jellies drifting by Moon Arch. The loops are data (seaLifeAreas.ts
// ZONE_LIFE_LOOPS, placed from each zone's own outline); the shapes are the clear-water window's low-poly creatures
// (clearCreatures.ts: the realistic turtle of seaTurtle.ts, LOD bands 442 / 160 / 31 triangles, stroking in the shader; fish ~44, jelly ~50), no texture, seen through the water with the shared seaVeil.ts.
// Heat: ONE InstancedMesh per kind (at most 3 draws, only while a zone is within ZONE_LIFE_DRAW m), capped per heat tier
// (zoneLifeCounts: 0 at tier 4 / Battery saver, nothing drawn or moved), beyond FAR_UPDATE m stepping at FAR_HZ, nothing uploaded
// on frozen frames or static ambience. Matrices are composed into preallocated objects: no per-frame allocation.
// Updated from openSeaLife.update (Town.tsx needs no hook of its own).
import * as T from 'three';
import {creatureGeometry} from '../town/water/clearCreatures';
import {patchSeaTurtle,seaTurtleControls} from './seaTurtle';
import {patchSeaVeil,SEA_LEVEL} from './seaVeil';
import {effectiveTier,subscribeHeatTier} from './heatTier';
import {ZONE_LIFE_LOOPS,ZONE_LIFE_DRAW,FAR_UPDATE,FAR_HZ,zoneLifeCounts,type ZoneCreature,type ZoneLifeLoop} from '../town/seaLifeAreas';
import {loopPoint} from '../town/water/animalRides';

const KINDS:readonly ZoneCreature[]=['turtle','fish','jelly'];
/** Drawn size (the shapes are ~1 m long), resting depth below the sea line (m), and tint. */
const LOOK:Record<ZoneCreature,{size:number;depth:number;tint:string}>={
 turtle:{size:1.35,depth:.55,tint:'#ffffff'},
 fish:{size:.55,depth:.3,tint:'#f6cf5a'},
 jelly:{size:.75,depth:.35,tint:'#f3c9e6'},
};
/** A turtle surfaces to breathe every BREATH.period s (offset per turtle): up over `rise` s, a `hold` s breath with its head out, down again. */
export const BREATH={period:20,rise:2,hold:3};
const hash=(n:number)=>{const s=Math.sin(n*127.1+311.7)*43758.5453;return s-Math.floor(s);};
const boxDistance=(b:{minX:number;maxX:number;minZ:number;maxZ:number},x:number,z:number)=>Math.hypot(Math.max(b.minX-x,0,x-b.maxX),Math.max(b.minZ-z,0,z-b.maxZ));

/** 0 resting .. 1 at the surface: the turtle's breathing cycle at time t (s). */
export function breathLift(t:number,offset:number){
 const c=((t+offset)%BREATH.period+BREATH.period)%BREATH.period,{rise,hold}=BREATH;
 if(c<rise)return .5-.5*Math.cos(Math.PI*c/rise);if(c<rise+hold)return 1;if(c<2*rise+hold)return .5+.5*Math.cos(Math.PI*(c-rise-hold)/rise);return 0;
}

export function createZoneLife(scene:T.Scene,options:{phone?:boolean}={}){
 const phone=!!options.phone;
 const root=new T.Group();root.name='zone-life';scene.add(root);
 const time={value:0};
 // Smooth shading: the turtle (seaTurtle.ts) carries its own normals; the fish / jelly shapes have per-face normals (flat as before).
 const turtleCtl={value:new T.Vector2(1,0)};
 const material=new T.MeshLambertMaterial({vertexColors:true,side:T.FrontSide});
 material.onBeforeCompile=shader=>{patchSeaVeil(shader,time,{});patchSeaTurtle(shader,time,turtleCtl);};material.customProgramCacheKey=()=>'zone-life-sea-turtle';
 const tracks=ZONE_LIFE_LOOPS.map((loop,i)=>{const n=loop.points.length,lengths=new Float64Array(n+1);
  for(let k=1;k<=n;k++){const a=loop.points[k-1],b=loop.points[k%n];lengths[k]=lengths[k-1]+Math.hypot(b.x-a.x,b.z-a.z);}
  let minX=Infinity,maxX=-Infinity,minZ=Infinity,maxZ=-Infinity;for(const p of loop.points){minX=Math.min(minX,p.x);maxX=Math.max(maxX,p.x);minZ=Math.min(minZ,p.z);maxZ=Math.max(maxZ,p.z);}
  return {loop,lengths,total:lengths[n],u:hash(i+1)*lengths[n],box:{minX,maxX,minZ,maxZ},acc:0,near:false};});
 const color=new T.Color();
 const meshes={} as Record<ZoneCreature,T.InstancedMesh>;
 for(const kind of KINDS){const max=ZONE_LIFE_LOOPS.filter(l=>l.kind===kind).reduce((s,l)=>s+l.count,0);if(!max)continue;
  const mesh=new T.InstancedMesh(creatureGeometry(kind),material,max);mesh.name='zone-life-'+kind;mesh.count=0;mesh.visible=false;
  mesh.frustumCulled=false;/* instances span several far-apart zones; only zones within ZONE_LIFE_DRAW m are written at all */
  mesh.castShadow=mesh.receiveShadow=false;mesh.renderOrder=1;mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);
  for(let i=0;i<max;i++)mesh.setColorAt(i,color.set(LOOK[kind].tint).offsetHSL(0,0,(hash(i*3.1)-.5)*.12));
  meshes[kind]=mesh;root.add(mesh);}
 let tier=effectiveTier(),caps=zoneLifeCounts(tier,phone);
 const offTier=subscribeHeatTier(()=>{tier=effectiveTier();caps=zoneLifeCounts(tier,phone);});
 const pt={x:0,z:0,yaw:0},pos=new T.Vector3(),quat=new T.Quaternion(),euler=new T.Euler(0,0,0,'YXZ'),scl=new T.Vector3(),mat=new T.Matrix4();
 const used:Record<ZoneCreature,number>={turtle:0,fish:0,jelly:0};
 const stats={drawn:0,zones:0,updated:0};
 let clock=0,placed=false;
 function place(kind:ZoneCreature,t:typeof tracks[number],k:number,clockT:number){
  const loop=t.loop,look=LOOK[kind],mesh=meshes[kind];
  // Turtles and jellies spread round the loop; a fish school keeps formation (1.3 m apart, staggered sideways).
  const along=kind==='fish'?t.u-k*1.3:t.u+k*t.total/loop.count;
  loopPoint(loop.points,t.lengths,t.total,along,pt);
  const yaw=Math.atan2(Math.cos(pt.yaw),-Math.sin(pt.yaw));// the shapes face -X; loopPoint's yaw is atan2(dx, dz)
  let x=pt.x,z=pt.z,y=SEA_LEVEL-look.depth,pitch=0,s=look.size,sy=s;
  if(kind==='fish'){const side=(k%2?1:-1)*(.35+.25*(k%3));x+=Math.cos(pt.yaw)*side;z-=Math.sin(pt.yaw)*side;y-=.12*(k%3);euler.set(0,yaw+.18*Math.sin(clockT*3+k),0);}
  else if(kind==="turtle"){const lift=breathLift(clockT,hash(k+loop.id.length)*BREATH.period);y+=lift*(look.depth+.06);pitch=-.2*lift;euler.set(0,yaw,pitch);}
  else{const pulse=Math.sin(clockT*1.6+k*2.1);y+=.08*pulse;sy=s*(1+.1*pulse);euler.set(0,k*1.3,0);}
  pos.set(x,y,z);quat.setFromEuler(euler);scl.set(s,sy,s);mat.compose(pos,quat,scl);mesh.setMatrixAt(used[kind]++,mat);
 }
 function update(dt:number,reduced:boolean,player:{x:number;z:number}){
  stats.updated=0;{const c=seaTurtleControls(tier,reduced);turtleCtl.value.set(c.anim,c.minLod);}
  if(dt<=0&&placed)return;// frozen frame: nothing moves, nothing uploads
  let any=false;for(const t of tracks){t.near=caps[t.loop.kind]>0&&boxDistance(t.box,player.x,player.z)<ZONE_LIFE_DRAW;if(t.near)any=true;}
  if(!any){if(stats.drawn){for(const kind of KINDS){const m=meshes[kind];if(m){m.count=0;m.visible=false;}}stats.drawn=stats.zones=0;}placed=true;return;}
  // Near zones step every frame; far ones (beyond FAR_UPDATE) gather time and step at FAR_HZ. Static ambience keeps them still.
  let step=reduced?0:dt,moved=!placed;
  if(step>0){let close=false;for(const t of tracks)if(t.near&&boxDistance(t.box,player.x,player.z)<FAR_UPDATE)close=true;
   if(!close){tracks[0].acc+=step;if(tracks[0].acc<1/FAR_HZ)step=0;else{step=Math.min(tracks[0].acc,.1);tracks[0].acc=0;}}}
  if(step>0){clock+=step;time.value=clock%1000;for(const t of tracks)if(t.near)t.u=(t.u+t.loop.speed*step)%t.total;moved=true;}
  if(!moved)return;
  used.turtle=used.fish=used.jelly=0;let zones=0;
  for(const t of tracks){if(!t.near)continue;zones++;const kind=t.loop.kind,n=Math.min(t.loop.count,caps[kind]);for(let k=0;k<n;k++)place(kind,t,k,clock);}
  stats.drawn=0;
  for(const kind of KINDS){const m=meshes[kind];if(!m)continue;m.count=used[kind];m.visible=used[kind]>0;if(used[kind]){m.instanceMatrix.needsUpdate=true;stats.drawn+=used[kind];}}
  stats.zones=zones;stats.updated=1;placed=true;
 }
 return {root,meshes,tracks,stats,update,
  dispose(){offTier();for(const kind of KINDS){const m=meshes[kind];if(m){m.geometry.dispose();m.dispose();}}material.dispose();root.removeFromParent();}};
}
export type ZoneLife=ReturnType<typeof createZoneLife>;
export type {ZoneLifeLoop};
