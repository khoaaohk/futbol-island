import {recordExploreActivity} from './exploreActivity';
import {createObstacleGrid} from './obstacleGrid';
import {fieldSurfaceHeight} from './venues';
import {goalBarriersAt} from './goalCollisions';
import {onIsland,distanceToShore} from './shoreline';
import {insideObstacle,blocked,stepPlayer,FLIGHT_WATER_MARGIN,type Obstacle} from './simulation';
import {TRAVEL_MODES,type TravelMode} from './travelModes';
export const ROOF_HANG_TIME=1, ROOF_RECOVERY_TIME=4.2;
export type Roof=Obstacle&{height:number};
export function createRooftopTravel(roofs:Roof[],obstacles:Obstacle[],start:{x:number;z:number},roofProps:(Obstacle&{floor:number;top:number;noLanding?:boolean})[]=[],extraSurface:(x:number,z:number)=>number=()=>0){
 const state={height:fieldSurfaceHeight(start.x,start.z),verticalSpeed:0,falling:false,hangTime:0,dropStart:0,recovery:0,impact:false};
 let driftX=0,driftZ=0,collisionRadius=.32;
 const landingSurfaces:Roof[]=[...roofs,...roofProps.filter(p=>p.w>=.9&&p.d>=.9).map(p=>({get x(){return p.x;},get z(){return p.z;},get w(){return p.w;},get d(){return p.d;},get height(){return p.top;}}))];
 const groundGrid=createObstacleGrid(obstacles),roofGrid=createObstacleGrid(roofs),propGrid=createObstacleGrid(roofProps),surfaceGrid=createObstacleGrid(landingSurfaces);
 const footprint=(o:Obstacle)=>[o.x,o.z,o.w,o.d].join(':');const buildingByFootprint=new Map(roofs.map(r=>[footprint(r),r]));
 const buildingFor=(o:Obstacle)=>buildingByFootprint.get(footprint(o));
 const roofAt=(x:number,z:number)=>{let highest:Roof|undefined;for(const r of surfaceGrid.query(x,z,0))if(insideObstacle(x,z,r,r.stepAccess?1e-6:0)&&(!highest||r.height>highest.height))highest=r;return highest;};
 const surface=(x:number,z:number)=>Math.max(fieldSurfaceHeight(x,z),roofAt(x,z)?.height??0,extraSurface(x,z));
 function reset(x:number,z:number,height=surface(x,z)){collisionRadius=.32;Object.assign(state,{height,verticalSpeed:0,falling:false,hangTime:0,dropStart:height,recovery:0,impact:false});}
 function canLand(x:number,z:number){
  const roof=roofAt(x,z);
  if(blocked(x,z,propGrid.query(x,z,1).filter(p=>p.noLanding&&p.w>0&&p.d>0),1))return false;
  if(blocked(x,z,goalBarriersAt(surface(x,z)),.8))return false;
  const clearance=roof?Math.min(.8,roof.w/4,roof.d/4):.8;
  if(!roof)return !blocked(x,z,groundGrid.query(x,z,1.2),1.2);
  // A lower roof or stair tread does not make an overlapping taller wall safe.
  // Check the full rider footprint against barriers, even on narrow supports.
  const barriers=[...roofGrid.query(x,z,.8).filter(r=>r.height>roof.height+.35),...propGrid.query(x,z,.8).filter(p=>p.floor<=roof.height+.2&&p.top>roof.height+.2)];
  return insideObstacle(x,z,roof,-clearance)&&!blocked(x,z,barriers,.8);
 }
 function update(dt:number,p:{x:number;z:number},v:{x:number;z:number},input:{x:number;z:number;sprint:boolean},mode:TravelMode){
  state.impact=false;
  if(state.recovery>0){state.recovery=Math.max(0,state.recovery-dt);v.x=v.z=0;return;}
  if(state.falling){
   v.x=v.z=0;
   if(state.hangTime>0){state.hangTime=Math.max(0,state.hangTime-dt);return;}
   stepPlayer(p,{x:driftX,z:driftZ},{x:driftX/3,z:driftZ/3,sprint:false},dt,groundGrid.query(p.x,p.z,Math.hypot(driftX,driftZ)*dt+1).filter(o=>!buildingFor(o)).concat(goalBarriersAt(state.height)),mode);
   const floor=surface(p.x,p.z);
   state.verticalSpeed-=65*dt;state.height+=state.verticalSpeed*dt;
   if(state.height<=floor){if(state.dropStart-floor>2)recordExploreActivity('roofDrop');state.height=floor;state.falling=false;state.verticalSpeed=0;
    if(state.dropStart-floor>1.5){state.recovery=ROOF_RECOVERY_TIME;state.impact=true;}
   }
   return;
  }
  const elevated=state.height>fieldSurfaceHeight(p.x,p.z)+1;
  const radius=Math.max(8,Math.max(Math.hypot(v.x,v.z),TRAVEL_MODES[mode].maxSpeed)*dt+2);
  const solids=groundGrid.query(p.x,p.z,radius).filter(o=>{
   const building=buildingFor(o);
   const stepHeight=building?.stepAccess&&mode!=='walk'?1:.35;
   return building?building.height>state.height+stepHeight:!elevated;
  }).concat(propGrid.query(p.x,p.z,radius).filter(p=>state.height>=p.floor-.2&&state.height<p.top));
  const barriers=solids.concat(goalBarriersAt(state.height));
  // Mounting beside a stair rail must not expand the rider into the barrier.
  // Retain walking clearance until the full riding footprint fits safely.
  if(mode==='walk')collisionRadius=.32;
  else if(collisionRadius<.8&&!blocked(p.x,p.z,barriers,.8))collisionRadius=.8;
  stepPlayer(p,v,input,dt,barriers,mode,collisionRadius);
  const floor=surface(p.x,p.z);
  if(state.height-floor>1){state.falling=true;state.hangTime=ROOF_HANG_TIME;state.dropStart=state.height;state.verticalSpeed=0;const speed=Math.hypot(v.x,v.z);driftX=speed?v.x/speed*3:0;driftZ=speed?v.z/speed*3:0;v.x=v.z=0;}
  else state.height=floor;
 }
 function findLanding(x:number,z:number){
  const startRadius=onIsland(x,z)?0:Math.max(0,Math.floor(distanceToShore(x,z))-1);
  for(let r=startRadius;r<=Math.max(50,FLIGHT_WATER_MARGIN+20);r++)for(let i=0;i<(r?32:1);i++){const a=i/32*Math.PI*2,nx=x+Math.cos(a)*r,nz=z+Math.sin(a)*r;if(canLand(nx,nz))return {x:nx,z:nz};}
  return null;
 }
 return {state,spatialStats:groundGrid.stats,surface,canLand,findLanding,reset,update};
}
