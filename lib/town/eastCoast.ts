import * as T from 'three';
import {puffGeo,puffBall,puffLevel,puffRun,tintFromTo,type RunPt} from '../graphics/softBox';
import {ISLAND_SHORE,onIsland} from './shoreline';
import {CAUSEWAY} from './coralCay';
import {EAST_PIER} from './eastPier';
import {trackNearest,inTunnelS} from './trainTrack';
import type {Obstacle} from './simulation';
import {untaggedProp,type PropTagger} from '../graphics/propReactions';
type Tools={box:(w:number,h:number,d:number,c:string,x:number,y:number,z:number)=>T.Mesh;put:(g:T.BufferGeometry,c:string,x:number,y:number,z:number)=>T.Mesh;obstacles:Obstacle[];prop?:PropTagger};
/** Half width (m) of the cut in the seawall where the Island Line crosses it (the line's centre to each gate pier's face). */
export const TRAIN_GAP=3.4;
/** The seawall's centre line x at z (the wall stands 2.6 m inland of the shore), or null off its run. Gate piers at the wall's cut
 *  ends stand ON this line (owner shot 178, Nov 27 2026: a pier set 0.5 m off the wall line stood beside the wall end with a gap). */
export function seawallX(z:number):number|null{
 for(let i=0;i<ISLAND_SHORE.length;i++){const a=ISLAND_SHORE[i],b=ISLAND_SHORE[(i+1)%ISLAND_SHORE.length];
  if(Math.min(a.x,b.x)<220||(a.z+b.z)/2>=189||a.z===b.z)continue;const t=(z-a.z)/(b.z-a.z);if(t<0||t>1)continue;return a.x+(b.x-a.x)*t-2.6;}
 return null;
}
export function buildEastCoast({box,put,obstacles,prop=untaggedProp}:Tools){
 const pbox=(w:number,h:number,d:number,c:string,x:number,y:number,z:number,o:Parameters<typeof puffGeo>[3]={})=>{const g=puffGeo(w,h,d,o);return g?put(g,c,x,y,z):box(w,h,d,c,x,y,z);};
 // Continue the south pier north beneath the existing market stalls.
 // Same wood, plank spacing and ground level as the ferry dock; no new collisions.
 box(28,.2,160,'#b98f62',224,-.1,110);
 for(let x=210.4;x<238;x+=.6)box(.025,.008,160,'#91704d',x,.004,110);
 // Retain the planted tubs beside the open promenade.

 for(let z=19;z<190;z+=22){
  if(obstacles.some(o=>Math.abs(215-o.x)<o.w/2+1.7&&Math.abs(z-o.z)<o.d/2+2))continue;
  // inflate pass (owner shot 180): a rounded tub and soft round shrub clumps
  prop('planter',()=>{pbox(2.3,.25,4,'#d2bc94',215,.125,z,{openBottom:true});
  for(const dz of [-1.2,0,1.2]){const ball=puffLevel()>0;put(ball?puffBall(.6).scale(1,.82,1):new T.IcosahedronGeometry(.6,0),'#739568',215,.65,z+dz);}});
  obstacles.push({x:215,z,w:2.3,d:4});
 }
 // Short joined segments trace the rounded coast, rather than a straight barrier.
 const runs2:RunPt[][]=[];
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
  // Nov 23 2026 (Island Line, owner: "track blocked by the wall"): where the line leaves the north-east corner onto its trestle the
  // wall is cut TRAIN_GAP m either side of the centre line, and each cut end gets a gate pier like the causeway's (collider too).
  const runs:[number,number][]=[],at=(t:number)=>({x:shoreA.x+(shoreB.x-shoreA.x)*t-2.6,z:shoreA.z+(shoreB.z-shoreA.z)*t});
  const gate=(t:number)=>{const p=at(t);pbox(1,1.5,1,'#bca987',p.x,.55,p.z,{openBottom:true});pbox(1.25,.24,1.25,'#eddfbb',p.x,1.4,p.z,{openBottom:true,dome:.06});obstacles.push({x:p.x,z:p.z,w:1,d:1});};
  for(const [t0,t1] of pieces){const steps=Math.max(1,Math.ceil(Math.hypot(shoreB.x-shoreA.x,shoreB.z-shoreA.z)*(t1-t0)/.3));let start=-1,last=t0;
   for(let k=0;k<=steps;k++){const t=t0+(t1-t0)*k/steps,p=at(t),hit=trackNearest(p.x,p.z,TRAIN_GAP+1),clear=!hit||hit.d>TRAIN_GAP||inTunnelS(hit.s);
    if(clear){if(start<0){start=t;if(k>0)gate(t);}last=t;}
    else if(start>=0){if(last>start)runs.push([start,last]);gate(last);start=-1;}}
   if(start>=0&&t1>start)runs.push([start,t1]);}
  pieces.length=0;pieces.push(...runs);
  for(const [t0,t1] of pieces){
  const a={x:shoreA.x+(shoreB.x-shoreA.x)*t0,z:shoreA.z+(shoreB.z-shoreA.z)*t0},b={x:shoreA.x+(shoreB.x-shoreA.x)*t1,z:shoreA.z+(shoreB.z-shoreA.z)*t1};
  const x=(a.x+b.x)/2-2.6,z=(a.z+b.z)/2;
  const length=Math.hypot(b.x-a.x,b.z-a.z)+.08,yaw=Math.atan2(b.x-a.x,b.z-a.z);
  if(puffLevel()>0){// inflate pass 2 (owner shots 175 / 178: "make it seamless"): the run joins the previous one into ONE swept pillowy wall
   const A={x:a.x-2.6,z:a.z,top:1.16,foot:-.3},B={x:b.x-2.6,z:b.z,top:1.16,foot:-.3},last=runs2[runs2.length-1];
   if(Math.hypot(B.x-A.x,B.z-A.z)<.02){/* a sliver: nothing to draw */}else if(last&&Math.hypot(last[last.length-1].x-A.x,last[last.length-1].z-A.z)<.05)last.push(B);else runs2.push([A,B]);}
  else{const wall=box(.65,1.05,length,'#bca987',x,.475,z);wall.rotation.y=yaw;const cap=box(.9,.2,length+.06,'#eddfbb',x,1.08,z);cap.rotation.y=yaw;}
  // Axis-aligned collision segments tightly follow the same visible wall.
  const count=Math.ceil(length/.6);
  for(let j=0;j<count;j++){
   const t=(j+.5)/count;
   obstacles.push({x:a.x+(b.x-a.x)*t-2.6,z:a.z+(b.z-a.z)*t,w:.75,d:.75});
  }
  }
 }
 for(const run of runs2)for(const p of puffRun(run,{half:.33,lip:.12,capH:.22,dome:.05,belly:.03,capTint:tintFromTo('#bca987','#eddfbb')}))put(p.geo,'#bca987',p.cx,0,p.cz).userData.vertexTint=p.tint;
}