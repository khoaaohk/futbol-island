import {VENUES} from './venues';
import {blocked} from './simulation';
import {GOAL_DEPTH} from './goalCollisions';
// Trucks cannot fit through the mouth/crossbar; treat each ground-level goal as solid.
export const TRUCK_GOALS=VENUES.filter(v=>(v.elevation??0)<1).flatMap(v=>[-1,1].map(side=>({x:v.x,z:v.z+side*(v.length/2+GOAL_DEPTH/2),w:v.goalWidth+.13,d:GOAL_DEPTH+.13})));
export function truckGoalClear(x:number,z:number,yaw:number){
 for(const offset of [-1.15,0,1.15])if(blocked(x+Math.sin(yaw)*offset,z+Math.cos(yaw)*offset,TRUCK_GOALS,1.05))return false;
 return true;
}
/** Swept oriented truck body: catches boosted/reversing impacts between 10 Hz checks. */
export function truckHitsCharacter(from:{x:number;z:number},to:{x:number;z:number},yaw:number,target:{x:number;y:number;z:number}){
 if(target.y>1.5||target.y<-.5)return false;
 if(Math.abs(target.x-to.x)>7||Math.abs(target.z-to.z)>7)return false;
 const dx=to.x-from.x,dz=to.z-from.z,steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.45)),sin=Math.sin(yaw),cos=Math.cos(yaw);
 for(let i=0;i<=steps;i++){const x=target.x-from.x-dx*i/steps,z=target.z-from.z-dz*i/steps;if(Math.abs(x*cos-z*sin)<1.55&&Math.abs(x*sin+z*cos)<2.8)return true;}
 return false;
}

/** Narrow swept footprint for rideable two-wheel vehicles, including rooftop height. */
export function rideHitsCharacter(from:{x:number;z:number},to:{x:number;y:number;z:number},yaw:number,target:{x:number;y:number;z:number},kind:'scooter'|'bike'|'moped'){
 if(Math.abs(target.y-to.y)>.7)return false;
 const dx=to.x-from.x,dz=to.z-from.z,length=Math.hypot(dx,dz);
 // A warp or spawn is not a collision sweep.
 if(length>12)return false;
 const radius=kind==='moped'?.72:.58,reach=kind==='scooter'?.95:1.2;
 if(Math.abs(target.x-to.x)>length+2||Math.abs(target.z-to.z)>length+2)return false;
 const steps=Math.max(1,Math.ceil(length/.35)),sin=Math.sin(yaw),cos=Math.cos(yaw);
 for(let i=0;i<=steps;i++){const x=target.x-from.x-dx*i/steps,z=target.z-from.z-dz*i/steps;if(Math.abs(x*cos-z*sin)<radius&&Math.abs(x*sin+z*cos)<reach)return true;}
 return false;
}
