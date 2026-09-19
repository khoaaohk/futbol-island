import * as T from 'three';
import {ISLAND_SHORE,onIsland} from './shoreline';
import type {Obstacle} from './simulation';
type Tools={box:(w:number,h:number,d:number,c:string,x:number,y:number,z:number)=>T.Mesh;put:(g:T.BufferGeometry,c:string,x:number,y:number,z:number)=>T.Mesh;obstacles:Obstacle[]};
export function buildEastCoast({box,put,obstacles}:Tools){
 // Continue the south pier north beneath the existing market stalls.
 // Same wood, plank spacing and ground level as the ferry dock; no new collisions.
 box(28,.2,160,'#b98f62',224,-.1,110);
 for(let x=210.4;x<238;x+=.6)box(.025,.008,160,'#91704d',x,.004,110);
 // Retain the planted tubs beside the open promenade.

 for(let z=19;z<190;z+=22){
  if(obstacles.some(o=>Math.abs(215-o.x)<o.w/2+1.7&&Math.abs(z-o.z)<o.d/2+2))continue;
  box(2.3,.25,4,'#d2bc94',215,.125,z);
  for(const dz of [-1.2,0,1.2])put(new T.IcosahedronGeometry(.6,0),'#739568',215,.65,z+dz);
  obstacles.push({x:215,z,w:2.3,d:4});
 }
 // Short joined segments trace the rounded coast, rather than a straight barrier.
 for(let i=0;i<ISLAND_SHORE.length;i++){
  const a=ISLAND_SHORE[i],b=ISLAND_SHORE[(i+1)%ISLAND_SHORE.length];
  if(Math.min(a.x,b.x)<220)continue;
  const x=(a.x+b.x)/2-2.6,z=(a.z+b.z)/2;
  // The southern pier retains its waterfront entrance.
  if(z>=189)continue; // The ferry dock supplies its own perimeter railing.
  if(!onIsland(x,z))continue;
  const length=Math.hypot(b.x-a.x,b.z-a.z)+.08,yaw=Math.atan2(b.x-a.x,b.z-a.z);
  const wall=box(.65,1.05,length,'#bca987',x,.475,z);wall.rotation.y=yaw;
  const cap=box(.9,.16,length+.06,'#eddfbb',x,1.08,z);cap.rotation.y=yaw;
  // Axis-aligned collision segments tightly follow the same visible wall.
  const count=Math.ceil(length/.6);
  for(let j=0;j<count;j++){
   const t=(j+.5)/count;
   obstacles.push({x:a.x+(b.x-a.x)*t-2.6,z:a.z+(b.z-a.z)*t,w:.75,d:.75});
  }
 }
}
