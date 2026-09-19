import {onFerryBoarding} from './ferryBoarding';
import {onIsland,ISLAND_SHORE} from './shoreline';
import { TRAVEL_MODES, type TravelMode } from './travelModes';
export const ISLAND_BOUNDS={minX:-102,maxX:250,minZ:-253,maxZ:226} as const;
/** Offshore room for flight; walking still follows the actual coastline. */
export const FLIGHT_WATER_MARGIN=35;
export const FLIGHT_BOUNDS={minX:ISLAND_BOUNDS.minX-FLIGHT_WATER_MARGIN,maxX:ISLAND_BOUNDS.maxX+FLIGHT_WATER_MARGIN,minZ:ISLAND_BOUNDS.minZ-FLIGHT_WATER_MARGIN,maxZ:ISLAND_BOUNDS.maxZ+FLIGHT_WATER_MARGIN};
export function flightBlocked(x:number,z:number){
 if(x<FLIGHT_BOUNDS.minX||x>FLIGHT_BOUNDS.maxX||z<FLIGHT_BOUNDS.minZ||z>FLIGHT_BOUNDS.maxZ)return true;
 if(onIsland(x,z))return false;
 for(let i=0;i<ISLAND_SHORE.length;i++){
  const a=ISLAND_SHORE[i],b=ISLAND_SHORE[(i+1)%ISLAND_SHORE.length],dx=b.x-a.x,dz=b.z-a.z;
  const t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz)));
  if((x-a.x-t*dx)**2+(z-a.z-t*dz)**2<=FLIGHT_WATER_MARGIN**2)return false;
 }
 return true;
}
export type District = 'coast' | 'oldtown' | 'lights';
export type Obstacle = { x: number; z: number; w: number; d: number; cornerRadius?:number; stepAccess?:boolean; dynamic?:boolean };
export const DISTRICTS = {
  coast: { name: 'Palm Coast', subtitle: 'SALT IN THE AIR. BALL AT YOUR FEET.', x: -7, z: 14 },
  oldtown: { name: 'Old Town', subtitle: 'EVERY WALL HAS A STORY.', x: -6, z: -10 },
  lights: { name: 'After Hours', subtitle: 'THE SUN SETS. THE GAME DOESN’T.', x: -6, z: -37 },
};
export function districtAt(z: number): District { return z < -24 ? 'lights' : z < 1 ? 'oldtown' : 'coast'; }
export function insideObstacle(x:number,z:number,o:Obstacle,padding=0){
  if(o.w<=0||o.d<=0)return false;
  const dx=Math.abs(x-o.x),dz=Math.abs(z-o.z),r=o.cornerRadius??0;
  if(!r)return dx<o.w/2+padding&&dz<o.d/2+padding;
  const qx=Math.max(0,dx-(o.w/2-r)),qz=Math.max(0,dz-(o.d/2-r));
  return Math.hypot(qx,qz)<Math.max(0,r+padding);
}
export function blocked(x: number, z: number, obstacles: Obstacle[], radius = .32) {
  return (!onIsland(x,z)&&!onFerryBoarding(x,z)) || x < ISLAND_BOUNDS.minX || x > ISLAND_BOUNDS.maxX || z < ISLAND_BOUNDS.minZ || z > ISLAND_BOUNDS.maxZ || obstacles.some(o => insideObstacle(x,z,o,radius));
}
export function stepPlayer(position: {x: number; z: number}, velocity: {x: number; z: number}, input: {x: number; z: number; sprint: boolean}, dt: number, obstacles: Obstacle[], mode: TravelMode = 'walk', collisionRadius = mode==='walk'?.32:.8) {
  dt = Math.max(0, Math.min(dt, .25));
  const settings = TRAVEL_MODES[mode];
  const length = Math.hypot(input.x, input.z), speed = mode === 'walk' && input.sprint ? 6 : settings.maxSpeed;
  const blend = 1-Math.exp(-dt*(length ? settings.acceleration : settings.braking));
  velocity.x += ((length ? input.x/Math.max(1,length)*speed : 0)-velocity.x)*blend;
  velocity.z += ((length ? input.z/Math.max(1,length)*speed : 0)-velocity.z)*blend;
  // Sample the swept movement in steps smaller than the collision diameter.
  // Even a thin fence cannot be skipped at moped speed after a long frame.
  const steps = Math.max(1, Math.ceil(Math.hypot(velocity.x,velocity.z)*dt/.15));
  for (let i=0; i<steps; i++) {
    const nx = position.x+velocity.x*dt/steps, nz = position.z+velocity.z*dt/steps;
    if (!(mode==='jetpack'?flightBlocked(nx,position.z):blocked(nx,position.z,obstacles,collisionRadius))) position.x=nx; else velocity.x=0;
    if (!(mode==='jetpack'?flightBlocked(position.x,nz):blocked(position.x,nz,obstacles,collisionRadius))) position.z=nz; else velocity.z=0;
  }
}

export function crossedGoal(previous: {x:number;z:number}, current: {x:number;z:number}): boolean {
  for (const center of [15,-38]) for (const end of [-1,1]) {
    const plane=center+end*11.6;
    if ((previous.z-plane)*end >= 0 || (current.z-plane)*end < 0) continue;
    const t=(plane-previous.z)/(current.z-previous.z);
    const x=previous.x+(current.x-previous.x)*t;
    if(Math.abs(x-11)<1.91) return true;
  }
  return false;
}
