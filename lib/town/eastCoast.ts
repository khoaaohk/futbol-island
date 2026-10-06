import * as T from 'three';
import {ISLAND_SHORE,onIsland} from './shoreline';
import {CAUSEWAY} from './coralCay';
import {EAST_PIER} from './eastPier';
import type {Obstacle} from './simulation';
import {untaggedProp,type PropTagger} from '../graphics/propReactions';
type Tools={box:(w:number,h:number,d:number,c:string,x:number,y:number,z:number)=>T.Mesh;put:(g:T.BufferGeometry,c:string,x:number,y:number,z:number)=>T.Mesh;obstacles:Obstacle[];prop?:PropTagger};
export function buildEastCoast({box,put,obstacles,prop=untaggedProp}:Tools){
 // Continue the south pier north beneath the existing market stalls.
 // Same wood, plank spacing and ground level as the ferry dock; no new collisions.
 box(28,.2,160,'#b98f62',224,-.1,110);
 for(let x=210.4;x<238;x+=.6)box(.025,.008,160,'#91704d',x,.004,110);
 // Retain the planted tubs beside the open promenade.

 for(let z=19;z<190;z+=22){
  if(obstacles.some(o=>Math.abs(215-o.x)<o.w/2+1.7&&Math.abs(z-o.z)<o.d/2+2))continue;
  prop('planter',()=>{box(2.3,.25,4,'#d2bc94',215,.125,z);
  for(const dz of [-1.2,0,1.2])put(new T.IcosahedronGeometry(.6,0),'#739568',215,.65,z+dz);});
  obstacles.push({x:215,z,w:2.3,d:4});
 }
 // Short joined segments trace the rounded coast, rather than a straight barrier.
 for(let i=0;i<ISLAND_SHORE.length;i++){
  const shoreA=ISLAND_SHORE[i],shoreB=ISLAND_SHORE[(i+1)%ISLAND_SHORE.length];
  if(Math.min(shoreA.x,shoreB.x)<220)continue;
  // The southern pier retains its waterfront entrance.
  if((shoreA.z+shoreB.z)/2>=189)continue; // The ferry dock supplies its own perimeter railing.
  if(!onIsland((shoreA.x+shoreB.x)/2-2.6,(shoreA.z+shoreB.z)/2))continue;
  // The Coral Cay causeway leaves through a gap (coralCay.ts): clip the wall to the parts outside the deck band.
  // Its own gate piers (coralCayWorld.ts) close the two cut ends.
  // The East Pier (eastPier.ts) opens a second gap the same way, closed by its own gate piers (eastPierWorld.ts).
  const openings=[{z:CAUSEWAY.z,gap:CAUSEWAY.deckHalf+.6},{z:EAST_PIER.z,gap:EAST_PIER.railHalf+.6}];
  const opening=openings.find(o=>Math.max(shoreA.z,shoreB.z)>o.z-o.gap&&Math.min(shoreA.z,shoreB.z)<o.z+o.gap)??openings[0],gap=opening.gap,gapZ=opening.z,pieces:[number,number][]=[];
  const tAt=(z:number)=>(z-shoreA.z)/(shoreB.z-shoreA.z);
  if(Math.max(shoreA.z,shoreB.z)<=gapZ-gap||Math.min(shoreA.z,shoreB.z)>=gapZ+gap||shoreA.z===shoreB.z)pieces.push([0,1]);
  else{const lo=Math.min(tAt(gapZ-gap),tAt(gapZ+gap)),hi=Math.max(tAt(gapZ-gap),tAt(gapZ+gap));if(lo>0)pieces.push([0,Math.min(1,lo)]);if(hi<1)pieces.push([Math.max(0,hi),1]);}
  for(const [t0,t1] of pieces){
  const a={x:shoreA.x+(shoreB.x-shoreA.x)*t0,z:shoreA.z+(shoreB.z-shoreA.z)*t0},b={x:shoreA.x+(shoreB.x-shoreA.x)*t1,z:shoreA.z+(shoreB.z-shoreA.z)*t1};
  const x=(a.x+b.x)/2-2.6,z=(a.z+b.z)/2;
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
}
