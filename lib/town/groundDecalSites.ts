import type * as T from 'three';
import {buildGroundDecals,DECAL_CAPS,MACRO_CAP,edgePoint,insidePoly,planGroundDecals,ringBandPoint,RectIndex,type DecalPlan,type Pt,type Rect,MACRO_DETAIL_ENABLED,MACRO_KINDS_KEPT} from '../graphics/groundDecals';
import {OPEN_MARGIN,openCoverage,scanOpenSpaces,type OpenKind,type OpenScan} from './openSpaces';
import {planMacroDetail} from './macroDetail';
import {ISLAND_SHORE,INTERIOR_GRASS,onIsland,shoreSandWidth} from './shoreline';
import {VENUES} from './venues';
import {CAY_SAND,CAY_LAWN,CAY_SHORE,CAY_CENTER,BEACH_COURT,ROUNDABOUT,CAY_BOULEVARD} from './coralCay';
import {SUMMIT_SHORE,coastRadius,beachWidth,SUMMIT_BOX,SUMMIT_CENTER,SUMMIT_PATHS,SUMMIT_PITCH,SUMMIT_VISUAL_DROP,beachPoint,onSummitIsle,summitGround,summitSlope,summitTrailDistance} from './summitIsle';

/**
 * Where the ground decals go on the three islands (lib/graphics/groundDecals.ts has the builder): sand near the waterline for
 * pebbles and shells, tufts and flowers a metre or three beside trails, paths, roads and buildings. Every spot skips the existing
 * obstacle, building, road and surface lists (plus the four pitches, the beach court, the roundabout and the boulevard).
 */
export type DecalWorld={obstacles:Rect[];buildings:Rect[];roads:Rect[];surfaceAreas:Rect[]};
const SEEDS={main:20261017,cay:20261018,summit:20261019};
const centroid=(ring:Pt[])=>({x:ring.reduce((a,p)=>a+p.x,0)/ring.length,z:ring.reduce((a,p)=>a+p.z,0)/ring.length});

export type OpenSummary={openCells:number;openArea:number;regions:number;largestCells:number;largestKind:string;largestAt:number[];grassLargest:number[];sandCells:number;grassCells:number;coverageBefore:number;coverageAfter:number;macro:number};
/** The three islands' ground, bounds and shore, shared by the decal plan and the open-space scan (tests call `scanIslands`). */
function setups(w:DecalWorld){
 const venues:Rect[]=VENUES.map(v=>({x:v.x,z:v.z,w:v.width+6,d:v.length+6}));
 const fixed:Rect[]=[...venues,{x:BEACH_COURT.x,z:BEACH_COURT.z,w:BEACH_COURT.length+6,d:BEACH_COURT.width+6},
  {x:ROUNDABOUT.x,z:ROUNDABOUT.z,w:(ROUNDABOUT.roadOuter+2)*2,d:(ROUNDABOUT.roadOuter+2)*2},{x:(CAY_BOULEVARD.x0+CAY_BOULEVARD.x1)/2,z:CAY_BOULEVARD.z,w:CAY_BOULEVARD.x1-CAY_BOULEVARD.x0+4,d:CAY_BOULEVARD.half*2+4},
  {x:SUMMIT_PITCH.x,z:SUMMIT_PITCH.z,w:SUMMIT_PITCH.length+16,d:SUMMIT_PITCH.width+16}];
 const rects=[...w.obstacles,...w.buildings,...w.roads,...w.surfaceAreas,...fixed];
 const wide=new RectIndex(rects,OPEN_MARGIN),macroBlocked=new RectIndex(rects,.9);
 const bbox=(ring:Pt[])=>({minX:Math.min(...ring.map(p=>p.x)),maxX:Math.max(...ring.map(p=>p.x)),minZ:Math.min(...ring.map(p=>p.z)),maxZ:Math.max(...ring.map(p=>p.z))});
 const trees=w.obstacles.filter(o=>o.w<=4&&o.d<=4);
 const main={bounds:bbox(ISLAND_SHORE),ground:(x:number,z:number):OpenKind|null=>!onIsland(x,z)?null:insidePoly(INTERIOR_GRASS,x,z)?'grass':'sand',ring:ISLAND_SHORE,inside:centroid(ISLAND_SHORE),y:(_x:number,_z:number,k:OpenKind)=>k==='sand'?-.105:-.112,
  trees:trees.filter(t=>onIsland(t.x,t.z)&&insidePoly(INTERIOR_GRASS,t.x,t.z))};
 const cay={bounds:bbox(CAY_SHORE),ground:(x:number,z:number):OpenKind|null=>insidePoly(CAY_LAWN,x,z)?'grass':insidePoly(CAY_SHORE,x,z)&&Math.hypot(x-CAY_CENTER.x,z-CAY_CENTER.z)<120?'sand':null,ring:CAY_SHORE,inside:CAY_CENTER,y:main.y,
  trees:trees.filter(t=>insidePoly(CAY_LAWN,t.x,t.z))};
 const summit={bounds:SUMMIT_BOX,ground:(x:number,z:number):OpenKind|null=>{
   if(!(x>SUMMIT_BOX.minX&&x<SUMMIT_BOX.maxX&&z>SUMMIT_BOX.minZ&&z<SUMMIT_BOX.maxZ)||!onSummitIsle(x,z))return null;
   const dx=x-SUMMIT_CENTER.x,dz=z-SUMMIT_CENTER.z,a=Math.atan2(dz,dx),r=Math.hypot(dx,dz),rc=coastRadius(a),bw=beachWidth(a);
   if(r>rc)return null;if(r>rc-bw*.9)return summitSlope(x,z)<.12?'sand':null;
   return r<=rc-bw&&summitGround(x,z)>.9&&summitSlope(x,z)<.3&&summitTrailDistance(x,z)>1.7?'grass':null;},
  ring:SUMMIT_SHORE,inside:SUMMIT_CENTER,y:(x:number,z:number)=>summitGround(x,z)-SUMMIT_VISUAL_DROP,trees:[] as Rect[]};
 return {rects,wide,macroBlocked,main,cay,summit};
}
export function scanIslands(w:DecalWorld,setup=setups(w)):{main:OpenScan;cay:OpenScan;summit:OpenScan}{
 const s=setup,scan=(i:{bounds:ReturnType<typeof setups>['main']['bounds'];ground:(x:number,z:number)=>OpenKind|null})=>scanOpenSpaces({bounds:i.bounds,groundAt:i.ground,blocked:(x,z)=>s.wide.blocked(x,z)});
 return {main:scan(s.main),cay:scan(s.cay),summit:scan(s.summit)};
}
const WIND=.35;
export function planIslandDecals(w:DecalWorld):{main:DecalPlan;cay:DecalPlan;summit:DecalPlan}{
 const plans=planSmallDecals(w),s=setups(w),scans=scanIslands(w,s);
 for(const name of ['main','cay','summit'] as const){const i=s[name],scan=scans[name],plan=plans[name];
  const at=(x:number,z:number,k:OpenKind)=>i.ground(x,z)===k&&!s.macroBlocked.blocked(x,z);
  const ok=(x:number,z:number,k:OpenKind,r:number)=>at(x,z,k)&&(r<=.9||(at(x+r,z,k)&&at(x-r,z,k)&&at(x,z+r,k)&&at(x,z-r,k)));
  plan.macro=(!MACRO_DETAIL_ENABLED?[]:planMacroDetail({seed:SEEDS[name]^0x5bd1e995,cap:MACRO_CAP,scan,ok,y:i.y,shore:{ring:i.ring,inside:i.inside},trees:i.trees,wind:WIND})).filter(m=>MACRO_KINDS_KEPT.includes(m.k));
  const small=[...plan.stones,...plan.tufts,...plan.flowers];
  const before=openCoverage(scan,small),after=openCoverage(scan,[...small,...plan.macro]),big=scan.largest;
  plan.open={openCells:scan.openCells,openArea:scan.openArea,regions:scan.regions.length,largestCells:big?big.cells:0,largestKind:big?big.kind:'',largestAt:big?[Math.round(big.cx),Math.round(big.cz)]:[],grassLargest:(g=>g?[g.cells,Math.round(g.cx),Math.round(g.cz)]:[])(scan.regions.filter(r=>r.kind==='grass').sort((a,b)=>b.cells-a.cells)[0]),sandCells:scan.cells.filter(c=>c.kind==='sand').length,grassCells:scan.cells.filter(c=>c.kind==='grass').length,
   coverageBefore:+before.ratio.toFixed(3),coverageAfter:+after.ratio.toFixed(3),macro:plan.macro.length} as OpenSummary;}
 return plans;
}
function planSmallDecals(w:DecalWorld):{main:DecalPlan;cay:DecalPlan;summit:DecalPlan}{
 const venues:Rect[]=VENUES.map(v=>({x:v.x,z:v.z,w:v.width+6,d:v.length+6}));
 const fixed:Rect[]=[...venues,{x:BEACH_COURT.x,z:BEACH_COURT.z,w:BEACH_COURT.length+6,d:BEACH_COURT.width+6},
  {x:ROUNDABOUT.x,z:ROUNDABOUT.z,w:(ROUNDABOUT.roadOuter+2)*2,d:(ROUNDABOUT.roadOuter+2)*2},{x:(CAY_BOULEVARD.x0+CAY_BOULEVARD.x1)/2,z:CAY_BOULEVARD.z,w:CAY_BOULEVARD.x1-CAY_BOULEVARD.x0+4,d:CAY_BOULEVARD.half*2+4},
  {x:SUMMIT_PITCH.x,z:SUMMIT_PITCH.z,w:SUMMIT_PITCH.length+16,d:SUMMIT_PITCH.width+16}];
 const blocked=new RectIndex([...w.obstacles,...w.buildings,...w.roads,...w.surfaceAreas,...fixed],.45);
 const near=[...w.roads,...w.buildings,...w.surfaceAreas.filter(s=>s.w>=1&&s.d>=1)];
 // ---- main island: the coast ring's sand band; the lawn beside paths, roads and buildings
 const mainNear=near.filter(r=>onIsland(r.x,r.z)&&insidePoly(INTERIOR_GRASS,r.x,r.z)),shoreMid=centroid(ISLAND_SHORE);
 const main=planGroundDecals({seed:SEEDS.main,caps:DECAL_CAPS.main,
  sandAt:rng=>ringBandPoint(ISLAND_SHORE,shoreSandWidth,shoreMid,rng,.8,true),grassAt:rng=>edgePoint(mainNear,rng),
  ok:(x,z,k)=>onIsland(x,z)&&(k==='grass'?insidePoly(INTERIOR_GRASS,x,z):!insidePoly(INTERIOR_GRASS,x,z))&&!blocked.blocked(x,z),
  y:(_x,_z,k)=>k==='sand'?-.105:-.112});
 // ---- Coral Cay: the sand ring (outer edge to inner edge), the lawn beside its buildings and paths
 const cayNear=near.filter(r=>insidePoly(CAY_LAWN,r.x,r.z));
 const cay=planGroundDecals({seed:SEEDS.cay,caps:DECAL_CAPS.cay,
  sandAt:rng=>{const s=CAY_SAND[Math.floor(rng()*CAY_SAND.length)%CAY_SAND.length],t=.2+rng()*.6;return {x:s.outer.x+(s.inner.x-s.outer.x)*t,z:s.outer.z+(s.inner.z-s.outer.z)*t};},
  grassAt:rng=>edgePoint(cayNear,rng),
  ok:(x,z,k)=>(k==='grass'?insidePoly(CAY_LAWN,x,z):!insidePoly(CAY_LAWN,x,z)&&Math.hypot(x-CAY_CENTER.x,z-CAY_CENTER.z)<120)&&!blocked.blocked(x,z),
  y:(_x,_z,k)=>k==='sand'?-.105:-.112});
 // ---- Summit Isle: the beach (between the waterline and the dune line); grass a couple of metres off the trails
 const trailPts=SUMMIT_PATHS.flat();
 const summit=planGroundDecals({seed:SEEDS.summit,caps:DECAL_CAPS.summit,
  sandAt:rng=>beachPoint(rng()*Math.PI*2,.15+rng()*.75),
  grassAt:rng=>{const p=trailPts[Math.floor(rng()*trailPts.length)%trailPts.length],a=rng()*Math.PI*2,d=1.9+rng()*2.4;return {x:p.x+Math.cos(a)*d,z:p.z+Math.sin(a)*d};},
  ok:(x,z,k)=>x>SUMMIT_BOX.minX&&x<SUMMIT_BOX.maxX&&z>SUMMIT_BOX.minZ&&z<SUMMIT_BOX.maxZ&&onSummitIsle(x,z)&&!blocked.blocked(x,z)&&summitSlope(x,z)<(k==='grass'?.3:.12)
   &&(k==='sand'||(summitTrailDistance(x,z)>1.7&&summitGround(x,z)>.9&&Math.hypot(x-SUMMIT_CENTER.x,z-SUMMIT_CENTER.z)>0)),
  y:(x,z)=>summitGround(x,z)-SUMMIT_VISUAL_DROP});
 return {main,cay,summit};
}
/** World.ts calls this once after the static batching pass. */
export function buildIslandDecals(parent:T.Object3D,world:DecalWorld){
 const plans=planIslandDecals(world),all=[buildGroundDecals(parent,plans.main,'decals-main-island'),buildGroundDecals(parent,plans.cay,'decals-coral-cay'),buildGroundDecals(parent,plans.summit,'decals-summit-isle')];
 const open={main:plans.main.open,cay:plans.cay.open,summit:plans.summit.open};parent.userData.groundDetail=open; // read by the screenshot driver / tests
 return {count:all.reduce((a,b)=>a+b.count,0),macroCount:all.reduce((a,b)=>a+b.macroCount,0),triangles:all.reduce((a,b)=>a+b.triangles,0),macroTriangles:all.reduce((a,b)=>a+b.macroTriangles,0),open,dispose(){for(const a of all)a.dispose();}};
}
