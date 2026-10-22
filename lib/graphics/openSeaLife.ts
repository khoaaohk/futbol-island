// The open-sea whale sharks and rays (Oct 20 2026, user: "add more whale in the bigger water areas. also add rays to balance the
// different areas out"). Loops, areas and caps: lib/town/seaLifeAreas.ts. Reuses the existing builds, no new texture:
//  - Whale sharks: whaleShark.ts meshes sharing ONE geometry, ONE material and ONE seabed-silhouette texture (createWhaleSharkShared).
//    At most openSeaCounts().whales are DRAWN at once (the nearest to the player; one being ridden always stays). Each keeps the
//    whale shark's own rules: hidden beyond 260 m, asleep beyond 140 m or off screen, nothing uploaded on frozen frames / static
//    ambience. Beyond FAR_UPDATE m it steps at FAR_HZ instead of every frame.
//  - Rays: a second cayMantas.ts instance whose groups are the sea areas (one instanced mesh per area, 1 draw), the shared manta
//    geometry scaled and tinted per instance for eagle and sting rays, thinned per heat tier (openSeaCounts().raysPerArea).
//    The whole set steps at FAR_HZ while no ray area is within FAR_UPDATE m.
// Ridable friends (animalRides.ts): every whale shark and the open-sea mantas, with the same prompt, ride sound and dismount.
// Called from Town.tsx's frame right after world.updateSharks (it reuses that frustum). No per-frame allocation, no timer.
import * as T from 'three';
import {createWhaleShark,createWhaleSharkShared} from './whaleShark';
import {createCayMantas} from './cayMantas';
import {createZoneLife} from './zoneLife';
import {effectiveTier,subscribeHeatTier} from './heatTier';
import {dynamicResolutionEnabled} from './quality';
import {OPEN_SEA_WHALE_LOOPS,OPEN_SEA_RAY_GROUPS,FAR_UPDATE,FAR_HZ,RAY_SPOT_RANGE,openSeaCounts,type OpenSeaRayLoop,type RaySpecies} from '../town/seaLifeAreas';
import {loopPoint,type RideFriend} from '../town/water/animalRides';

const boxDistance=(b:{minX:number;maxX:number;minZ:number;maxZ:number},x:number,z:number)=>Math.hypot(Math.max(b.minX-x,0,x-b.maxX),Math.max(b.minZ-z,0,z-b.maxZ));

export function createOpenSeaLife(scene:T.Scene,options:{phone?:boolean}={}){
 const phone=options.phone??(typeof window!=='undefined'&&typeof window.matchMedia==='function'&&dynamicResolutionEnabled(window.devicePixelRatio||1,window.matchMedia('(pointer: coarse)').matches));
 const shared=createWhaleSharkShared(),humpShared=createWhaleSharkShared('humpback');
 // Oct 20 2026: the humpbacks (humpback.ts) are the same kit with their own ONE geometry/material, drawn under the same cap.
 const whales=OPEN_SEA_WHALE_LOOPS.map(l=>createWhaleShark(scene,{loop:l,id:l.id,name:'open-sea-'+l.id,start:l.start,shared:l.kind==='humpback'?humpShared:shared}));
 const rays=createCayMantas(scene,{phone,groups:OPEN_SEA_RAY_GROUPS,name:'open-sea-rays',groupCount:(tier,ph)=>openSeaCounts(tier,ph).raysPerArea});
 // Oct 21 2026: the Explore zones' turtles, fish schools and jellies (zoneLife.ts), stepped with the rest of the open sea.
 const zoneLife=createZoneLife(scene,{phone});
 let cap=openSeaCounts(effectiveTier(),phone).whales;
 const offTier=subscribeHeatTier(()=>{cap=openSeaCounts(effectiveTier(),phone).whales;});
 const friends:RideFriend[]=[...whales.map(w=>w.friend),...rays.friends];
 const ownIds=new Set(friends.map(f=>f.id));
 const dist=new Float64Array(whales.length),acc=new Float64Array(whales.length),order=whales.map((_,i)=>i),byDist=(a:number,b:number)=>dist[a]-dist[b];
 let rayAcc=0,clock=0,spotAcc=0;
 const spotted=new Set<string>(),pt={x:0,z:0,yaw:0};let lastSpecies:RaySpecies|null=null;
 const stats={whalesDrawn:0,whalesAwake:0,whaleUpdates:0,raysAwake:0,rayUpdates:0,cap:0};
 function update(dt:number,reduced:boolean,frustum:T.Frustum,player:{x:number;z:number}){
  // The drawn cap: the nearest `cap` whale sharks (by their loop's box), plus any one held by a ride or swimming back.
  for(let i=0;i<whales.length;i++)dist[i]=boxDistance(whales[i].box,player.x,player.z);
  order.sort(byDist);
  stats.whalesDrawn=stats.whalesAwake=stats.whaleUpdates=0;stats.cap=cap;let moved=false;
  for(let k=0;k<order.length;k++){const i=order[k],w=whales[i],held=w.state.ridden||w.state.free;
   w.setEnabled(k<cap||held);
   // Far (beyond FAR_UPDATE) and not held: step at FAR_HZ with the gathered time (the frozen dt 0 passes straight through).
   let step=dt;if(dt>0&&!held&&dist[i]>FAR_UPDATE){acc[i]+=dt;if(acc[i]<1/FAR_HZ)step=0;else{step=Math.min(acc[i],.1);acc[i]=0;}}else acc[i]=0;
   w.update(step,reduced,frustum,player);
   if(w.stats.visible)stats.whalesDrawn++;if(w.stats.awake)stats.whalesAwake++;if(w.stats.updated){stats.whaleUpdates++;moved=true;}
  }
  // ONE tail-sweep clock for the shared material (each whale's own clock still drives its bob).
  if(moved){clock=(clock+Math.min(dt,.1))%(2*Math.PI/1.15*400);shared.time.value=humpShared.time.value=clock;}
  // Rays: every frame while an area with rays is near (or one is held), else at FAR_HZ.
  let near=false;for(const r of rays.islands)if(r.ridden||r.active>0&&boxDistance(r.box,player.x,player.z)<FAR_UPDATE){near=true;break;}
  let rstep=dt;if(dt>0&&!near){rayAcc+=dt;if(rayAcc<1/FAR_HZ)rstep=-1;else{rstep=Math.min(rayAcc,.1);rayAcc=0;}}else rayAcc=0;
  if(rstep>=0){rays.update(rstep,reduced,frustum,player);stats.raysAwake=rays.stats.awake;stats.rayUpdates=rays.stats.updated;}else stats.rayUpdates=0;
  zoneLife.update(dt,reduced,player);
 }
 /** Analytics (Town.tsx, wa:ray_spot): true once per ray per visit when a swimmer comes within RAY_SPOT_RANGE of a drawn ray.
  *  Checked twice a second, only while in the water; a few distance tests. */
 function spot(dt:number,x:number,z:number,inWater:boolean){
  if(!inWater){spotAcc=0;return false;}spotAcc+=dt;if(spotAcc<.5)return false;spotAcc=0;
  for(const r of rays.islands){if(!r.group.visible||r.active===0||boxDistance(r.box,x,z)>RAY_SPOT_RANGE)continue;
   for(let i=0;i<r.active;i++){const t=r.tracks[i];if(spotted.has(t.loop.id))continue;loopPoint(t.loop.points,t.lengths,t.total,t.u,pt);
    if(Math.hypot(pt.x-x,pt.z-z)<RAY_SPOT_RANGE){spotted.add(t.loop.id);lastSpecies=(t.loop as OpenSeaRayLoop).species??null;return true;}}}
  return false;
 }
 return {whales,rays,zoneLife,friends,stats,update,spot,
  /** The kind of the ray the last true spot() found (the ray lesson toast, Town.tsx). */
  lastSpotted:()=>lastSpecies,
  /** True for a ride friend drawn here (Town.tsx: the open-sea whale ride counter). */
  owns(f:RideFriend|null){return !!f&&ownIds.has(f.id);},
  setClearBed(b:Parameters<typeof whales[number]['setClearBed']>[0]){for(const w of whales)w.setClearBed(b);},
  setFx(f:Parameters<typeof whales[number]['setFx']>[0]){for(const w of whales)w.setFx(f);},
  dispose(){offTier();for(const w of whales)w.dispose();shared.dispose();humpShared.dispose();rays.dispose();zoneLife.dispose();}};
}
export type OpenSeaLife=ReturnType<typeof createOpenSeaLife>;
