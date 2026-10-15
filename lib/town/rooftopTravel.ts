import {recordExploreActivity} from './exploreActivity';
import {createObstacleGrid} from './obstacleGrid';
import {fieldSurfaceHeight} from './venues';
import {goalBarriersAt} from './goalCollisions';
import {distanceToLand} from './landmass';
import {landableDeckHeight} from './landableDecks';
import {insideObstacle,blocked,stepPlayer,pushOutOf,FLIGHT_WATER_MARGIN,type Obstacle} from './simulation';
import {TRAVEL_MODES,type TravelMode} from './travelModes';
import {createRoofJump,planRoofJump,planRoofLaunch} from './rooftopJump';
import {nearSummit,createHillAssist,climbCoast} from './rideSlope';
import {createSlopeHop} from './slopeHop';
import {SUMMIT_HUTS,HUT_CONE_RADIUS,HUT_LAND_RADIUS,hutRoofSteps} from './summitBalls';
/** Landing search bounds (findLanding): the arc aimed at the nearest land is ±LANDING_ARC m wide and LANDING_AIM_DEPTH rings
 *  deep; no ring ever does more than LANDING_RING_CAP canLand checks. */
export const LANDING_ARC=48,LANDING_AIM_DEPTH=40,LANDING_RING_CAP=64;
export const ROOF_HANG_TIME=1, ROOF_RECOVERY_TIME=4.2;
/** A ride's collision radius on and next to narrow stairs (stepAccess surfaces ≤ NARROW_STAIR wide); 0.8 m everywhere else. */
export const RIDE_STAIR_RADIUS=.4;
/** Stairs and landings this wide or less (m) narrow a ride (a wider one keeps its full 0.8 m radius). */
export const NARROW_STAIR=2.4;
/** overhead: a canopy over open ground (canopySurfaces.ts): a floor only from above (CANOPY_STEP), never a wall; steep: a pitched
 *  roof over open ground, never a floor: a landing from above is refused there (moved beside it), walking under is untouched. */
export type Roof=Obstacle&{height:number;overhead?:boolean;steep?:boolean;/** a Summit Isle hut's roof step: the hut's centre */hut?:{x:number;z:number}};
/** Summit Isle's hut roofs (summitBalls.ts hutRoofSteps, Oct 15 2026): stepped discs down each straw cone, built once. The outer
 *  step shares the drum collider's footprint, so the drum is that roof's building. */
const summitHutRoofs=():Roof[]=>SUMMIT_HUTS.flatMap(h=>hutRoofSteps(h).map(s=>({...s,hut:{x:h.x,z:h.z}})));
/** A canopy counts as the floor for a rider no more than this far below it (stepping onto one from a roof beside it). */
export const CANOPY_STEP=.4;
export function createRooftopTravel(roofs:Roof[],obstacles:Obstacle[],start:{x:number;z:number},roofProps:(Obstacle&{floor:number;top:number;noLanding?:boolean})[]=[],extraSurface:(x:number,z:number)=>number=()=>0,landingExclusions:Obstacle[]=[],canopies:Roof[]=[]){
 roofs=[...roofs,...summitHutRoofs()];
 // air / landImpact: a hop off one of Summit Isle's crests (slopeHop.ts): airborne now; the touchdown's closing speed (m/s, on that
 // tick only); lastAir: how long the last hop lasted (s).
 const state={height:fieldSurfaceHeight(start.x,start.z),verticalSpeed:0,falling:false,hangTime:0,dropStart:0,recovery:0,impact:false,air:false,landImpact:0,lastAir:0};
 let driftX=0,driftZ=0,collisionRadius=.32;
 // Water (Oct 15 2026, lib/town/water): `canSplash` lets a ride launch end over water that is deep enough to splash into
 // (rooftopJump.ts planRoofLaunch); Town installs it with setSplashTest. Walking into the shallows is the `water` argument of update().
 let canSplash:((x:number,z:number)=>boolean)|null=null;
 const hill=createHillAssist(),steerInput={x:0,z:0,sprint:false},hop=createSlopeHop();
 // Roof-to-roof gap jumps (lib/town/rooftopJump.ts): planned only on the frame an edge fall would start.
 const jump=createRoofJump();
 // Buildings the rider was touching when the fall began (the roof just left) never block the drift; any other building
 // taller than the falling rider does, so a fall (or the end of an edge launch) cannot slide into a wall and pop onto it.
 let fallIgnore=new Set<Obstacle>();
 // Only dynamic props (ball-hunt boxes that open) need live getters; the obstacle grid scans every getter-backed entry on
 // every query, so static props are copied once and indexed (heat audit pass 2: roofAt was the largest NPC-walkability cost).
 const landingSurfaces:Roof[]=[...roofs,...canopies.filter(c=>!c.steep).map(c=>({...c,overhead:true})),...roofProps.filter(p=>p.w>=.9&&p.d>=.9).map(p=>p.dynamic||['x','z','w','d','top'].some(k=>Object.getOwnPropertyDescriptor(p,k)?.get)?{get x(){return p.x;},get z(){return p.z;},get w(){return p.w;},get d(){return p.d;},get height(){return p.top;}}:{x:p.x,z:p.z,w:p.w,d:p.d,height:p.top})];
 const steepGrid=createObstacleGrid(canopies.filter(c=>c.steep)),groundGrid=createObstacleGrid(obstacles),roofGrid=createObstacleGrid(roofs),propGrid=createObstacleGrid(roofProps),surfaceGrid=createObstacleGrid(landingSurfaces);
 const footprint=(o:Obstacle)=>[o.x,o.z,o.w,o.d].join(':');const buildingByFootprint=new Map(roofs.map(r=>[footprint(r),r]));
 const buildingFor=(o:Obstacle)=>buildingByFootprint.get(footprint(o));
 // `from`: the height a rider stands or falls at (Infinity: landing from the sky). Canopies (overhead) count only from at most
 // CANOPY_STEP below them; the default (-Infinity) is the ground's view (NPCs, balls, jobs: the porch under the canopy).
 const roofAt=(x:number,z:number,from=-Infinity)=>{let highest:Roof|undefined;for(const r of surfaceGrid.query(x,z,0))if((!r.overhead||r.height<=from+CANOPY_STEP)&&insideObstacle(x,z,r,r.stepAccess||r.overhead?1e-4:0)&&(!highest||r.height>highest.height))highest=r;return highest;};
 // A narrow stair (its treads no wider than NARROW_STAIR m: the hostel's outside stair) within a ride's radius.
 const nearSteps=(x:number,z:number)=>{for(const r of surfaceGrid.query(x,z,.8))if(r.stepAccess&&Math.max(r.w,r.d)<=NARROW_STAIR&&insideObstacle(x,z,r,.8))return true;return false;};
 // Registered floating decks (landableDecks.ts, e.g. a moored boat) are floors too; 0 when none are registered.
 const surface=(x:number,z:number,from=-Infinity)=>Math.max(fieldSurfaceHeight(x,z),roofAt(x,z,from)?.height??0,extraSurface(x,z),landableDeckHeight(x,z));
 function reset(x:number,z:number,height=surface(x,z)){collisionRadius=.32;jump.reset();hop.reset();Object.assign(state,{height,verticalSpeed:0,falling:false,hangTime:0,dropStart:height,recovery:0,impact:false,air:false,landImpact:0});}
 function canLand(x:number,z:number,from=-Infinity){
  // Glazed interiors remain walkable through doors, but are never aerial destinations.
  if(landingExclusions.some(area=>insideObstacle(x,z,area,.8)))return false;
  // A pitched roof over open ground at or below `from` (from the sky: any): the rider would slide off, so not here.
  if(from>-Infinity)for(const r of steepGrid.query(x,z,0))if(r.height<=from+CANOPY_STEP&&insideObstacle(x,z,r,.3))return false;
  const roof=roofAt(x,z,from);
  // A hut's straw cone: the apex disc (where its roof ball sits) is the landing; the steps lower down are walked, not landed on.
  if(roof?.hut)return Math.hypot(x-roof.hut.x,z-roof.hut.z)<=HUT_LAND_RADIUS;
  if(blocked(x,z,propGrid.query(x,z,1).filter(p=>p.noLanding&&p.w>0&&p.d>0),1))return false;
  if(blocked(x,z,goalBarriersAt(surface(x,z,from)),.8))return false;
  const clearance=roof?Math.min(.8,roof.w/4,roof.d/4):.8;
  if(!roof)return !blocked(x,z,groundGrid.query(x,z,1.2),1.2);
  // A canopy may be several level strips (a sloped one): the rider's whole footprint must be on canopy within a step of this one.
  if(roof.overhead){for(const [dx,dz] of [[-.4,-.4],[.4,-.4],[-.4,.4],[.4,.4]]){const r=roofAt(x+dx,z+dz,from);if(!r||!r.overhead||Math.abs(r.height-roof.height)>.35)return false;}
   return !blocked(x,z,roofGrid.query(x,z,.8).filter(r=>r.height>roof.height+.35),.8);}
  // A lower roof or stair tread does not make an overlapping taller wall safe.
  // Check the full rider footprint against barriers, even on narrow supports.
  const barriers=[...roofGrid.query(x,z,.8).filter(r=>r.height>roof.height+.35),...propGrid.query(x,z,.8).filter(p=>p.floor<=roof.height+.2&&p.top>roof.height+.2)];
  return insideObstacle(x,z,roof,-clearance)&&!blocked(x,z,barriers,.8);
 }
 /** `water` (wading, Oct 15 2026): which water the walker may step into, and the wade speed scale (waterDepth.ts). */
 function update(dt:number,p:{x:number;z:number},v:{x:number;z:number},input:{x:number;z:number;sprint:boolean},mode:TravelMode,water?:{allow:(x:number,z:number)=>boolean;speed:number}){
  state.impact=false;state.landImpact=0;
  const jumpHeight=jump.step(dt,p,v);if(jumpHeight!==null){state.height=jumpHeight;if(jump.state.fall)startFall(p,v);return;}
  if(state.recovery>0){state.recovery=Math.max(0,state.recovery-dt);v.x=v.z=0;return;}
  if(state.falling){
   v.x=v.z=0;
   if(state.hangTime>0){state.hangTime=Math.max(0,state.hangTime-dt);return;}
   stepPlayer(p,{x:driftX,z:driftZ},{x:driftX/3,z:driftZ/3,sprint:false},dt,groundGrid.query(p.x,p.z,Math.hypot(driftX,driftZ)*dt+1).filter(o=>{const b=buildingFor(o);return !b||b.height>state.height&&!fallIgnore.has(o);}).concat(goalBarriersAt(state.height)),mode);
   const floor=surface(p.x,p.z,state.height);
   state.verticalSpeed-=65*dt;state.height+=state.verticalSpeed*dt;
   if(state.height<=floor){if(state.dropStart-floor>2)recordExploreActivity('roofDrop');state.height=floor;state.falling=false;state.verticalSpeed=0;
    if(state.dropStart-floor>1.5){state.recovery=ROOF_RECOVERY_TIME;state.impact=true;}
   }
   return;
  }
  // A hop's rider is not up on a roof: the trees and props it flies at still stop it.
  const elevated=!state.air&&state.height>fieldSurfaceHeight(p.x,p.z)+1;
  const radius=Math.max(8,Math.max(Math.hypot(v.x,v.z),TRAVEL_MODES[mode].maxSpeed)*dt+2);
  const solids=groundGrid.query(p.x,p.z,radius).filter(o=>{
   const building=buildingFor(o);
   const stepHeight=building?.stepAccess&&mode!=='walk'?1:.35;
   return building?building.height>state.height+stepHeight:!elevated;
  }).concat(propGrid.query(p.x,p.z,radius).filter(p=>state.height>=p.floor-.2&&state.height<p.top));
  const barriers=solids.concat(goalBarriersAt(state.height));
  // Mounting beside a stair rail must not expand the rider into the barrier.
  // Retain walking clearance until the full riding footprint fits safely.
  // On a stair or step surface (stepAccess: the zipline's hostel stair, the school's and the arena's steps, the ferry ramp) a ride
  // narrows to RIDE_STAIR_RADIUS (Oct 14 2026, user: "riding gets stuck going down here": the hostel's outside stair is 1.6 m
  // wide between the wall and its handrail, exactly a ride's 0.8 m radius each side, so the ride wedged at the top, and its foot
  // beside the wall turned a ride away at the bottom). On the steps or within a ride's radius of them (now or two ticks on).
  if(mode==='walk')collisionRadius=.32;
  else if(nearSteps(p.x,p.z)||nearSteps(p.x+v.x*dt*2,p.z+v.z*dt*2))collisionRadius=Math.min(collisionRadius,RIDE_STAIR_RADIUS);
  else if(collisionRadius<.8&&!blocked(p.x,p.z,barriers,.8))collisionRadius=.8;
  // A wall that turned solid under the rider (a building beside a stair, once a few treads below its roof) pushes it clear first.
  if(mode!=='jetpack')pushOutOf(p,barriers,collisionRadius);
  const fromX=p.x,fromZ=p.z;
  // Summit Isle's slopes (rideSlope.ts createHillAssist): slower uphill but never stopped, a capped and braked roll downhill, and
  // a climb steeper than the limit taken across the slope. 1 and four comparisons anywhere else.
  // Arriving fast at a climb, the ride's momentum carries it up and it eases down to its climbing speed (RIDE_CLIMB_COAST).
  let slope=1,coast=0,steer=input;if(mode!=='jetpack'&&nearSummit(p.x,p.z)){const a=hill.steer(mode,p.x,p.z,input.x,input.z);slope=a.scale;coast=climbCoast(p.x,p.z,a.grade,a.x,a.z);steerInput.x=a.x;steerInput.z=a.z;steerInput.sprint=input.sprint;steer=steerInput;}
  stepPlayer(p,v,steer,dt,barriers,mode,collisionRadius,water?slope*water.speed:slope,coast,mode==='walk'&&water?water.allow:undefined);
  const floor=surface(p.x,p.z,state.height);
  // Hops off Summit Isle's crests (slopeHop.ts; a few comparisons anywhere else).
  if(mode!=='jetpack'&&(state.air||nearSummit(p.x,p.z))){const h=hop.step(dt,mode,p.x,p.z,v.x,v.z,state.height,floor);state.air=hop.state.air;
   if(state.air){state.height=Math.max(floor,h);return;}
   if(hop.state.landImpact>0){state.landImpact=hop.state.landImpact;state.lastAir=hop.state.lastAir;state.height=floor;return;}}
  if(state.height-floor>1){
   const from=state.height;
   const query={x:p.x,z:p.z,vx:v.x,vz:v.z,height:state.height,mode,source:roofAt(fromX,fromZ,state.height),surface:(x:number,z:number)=>surface(x,z,from),ground:fieldSurfaceHeight,canLand:(x:number,z:number)=>canLand(x,z,from),blockedAt:(x:number,z:number)=>blocked(x,z,groundGrid.query(x,z,1).filter(o=>!buildingFor(o)),.8),canSplash:canSplash??undefined};
   const plan=planRoofJump(query)??planRoofLaunch(query,TRAVEL_MODES[mode].maxSpeed);
   if(plan){jump.start(plan);return;}
   startFall(p,v);
  }
  else state.height=floor;
 }
 function startFall(p:{x:number;z:number},v:{x:number;z:number}){
  fallIgnore=new Set(groundGrid.query(p.x,p.z,1.2).filter(o=>buildingFor(o)&&insideObstacle(p.x,p.z,o,1.2)));
  state.falling=true;state.hangTime=ROOF_HANG_TIME;state.dropStart=state.height;state.verticalSpeed=0;const speed=Math.hypot(v.x,v.z);driftX=speed?v.x/speed*3:0;driftZ=speed?v.z/speed*3:0;v.x=v.z=0;
 }
 /** Bearing from (x, z) toward the nearest land: minus the gradient of the distance field (4 distanceToLand calls, ~30 µs
  *  each on a desktop: the cay's shore test dominates). null where the gradient is ambiguous (about equally far from two
  *  shores), and the caller searches whole rings instead. */
 function nearestLandBearing(x:number,z:number){
  const gx=distanceToLand(x+1,z)-distanceToLand(x-1,z),gz=distanceToLand(x,z+1)-distanceToLand(x,z-1);
  return Math.hypot(gx,gz)<1.9?null:Math.atan2(-gz,-gx);
 }
 function findLanding(x:number,z:number,from=Infinity){
  // A landable point is its own landing. Off-island decks and piers skip the inner rings below (they start near the
  // shore distance), which made a parachute over a pier retarget in a loop instead of settling where it already was.
  if(canLand(x,z,from))return {x,z};
  // Over a Summit hut's roof: its apex (a steep straw cone, so the ring search below would only find the grass beside it).
  for(const h of SUMMIT_HUTS)if(Math.abs(x-h.x)<=HUT_CONE_RADIUS&&Math.abs(z-h.z)<=HUT_CONE_RADIUS&&Math.hypot(x-h.x,z-h.z)<=HUT_CONE_RADIUS&&canLand(h.x,h.z,from))return {x:h.x,z:h.z};
  // distanceToLand covers both islands, the causeway, the sandbars and the registered decks (0 on land).
  const d=distanceToLand(x,z),startRadius=Math.max(0,Math.floor(d)-1),maxRadius=Math.max(360,FLIGHT_WATER_MARGIN+20);
  // Heat (code review Sep 29 2026, finding 2): full rings ≤3 m apart cost ~630 canLand checks per ring at 300 m. Far from land,
  // first search an arc aimed at the nearest land (±LANDING_ARC m wide, centre first, for LANDING_AIM_DEPTH rings); that is
  // where the nearest landable point almost always is (a small deck or the far water ~336 m out included).
  const aim=d>LANDING_ARC?nearestLandBearing(x,z):null;
  if(aim!==null){
   for(let r=Math.max(1,startRadius);r<=Math.min(maxRadius,startRadius+LANDING_AIM_DEPTH);r++){const half=Math.min(Math.PI,LANDING_ARC/r),n=Math.min(LANDING_RING_CAP,Math.max(8,Math.ceil(2*half*r/1.5)));
    for(let i=0;i<=n;i++){const k=i&1?(i+1)/2:-i/2,a=aim+k*2*half/n,nx=x+Math.cos(a)*r,nz=z+Math.sin(a)*r;if(canLand(nx,nz,from))return {x:nx,z:nz};}}}
  // Otherwise (near land, or the nearest land has no landable spot): whole rings, capped at LANDING_RING_CAP checks each
  // (3 m apart up to r ≈ 30 m, sparser beyond).
  for(let r=startRadius;r<=maxRadius;r++){const n=r?Math.min(LANDING_RING_CAP,Math.max(32,Math.ceil(r*2*Math.PI/3))):1;for(let i=0;i<n;i++){const a=i/n*Math.PI*2,nx=x+Math.cos(a)*r,nz=z+Math.sin(a)*r;if(canLand(nx,nz,from))return {x:nx,z:nz};}}
  return null;
 }
 return {state,jump:jump.state,hop:hop.state,spatialStats:groundGrid.stats,surface,canLand,findLanding,reset,update,setSplashTest(test:((x:number,z:number)=>boolean)|null){canSplash=test;}};
}
