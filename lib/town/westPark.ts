// West Stadium, phase 1 (Nov 12 2026, docs/stadium/PLAN.md): Stadium Park on the new west land (shoreline.ts), Stadium Plaza in
// place of two west houses, round the stadium's footprint (the stadium itself: stadiumWorld.ts, phase 2).
// Everything here is static and built once inside buildTownSteps, so it is merged into the island's 50 m chunk batches with
// the shared vertex-colour paint (one draw call per chunk and paint, wind sway on the trees and palms for free), and the whole
// west region is hidden by one frustum-box test when it is out of view (world.ts, westRegion). No per-frame work, no new texture.
import * as T from 'three';
import {onIsland,distanceToShore} from './shoreline';
import {trunkCollider,type Obstacle} from './simulation';
import {tintGroundMesh} from '../graphics/groundTint';
import {untaggedProp,type PropTagger} from '../graphics/propReactions';

import {STADIUM,STADIUM_GATE,STADIUM_PLAZA,PARK_POND,PARK_LAWNS,PARK_PATHS,PARK_GROVES,BOWL_RING,inStadiumFootprint,parkPathLines,pathPoints,ringPoints,segDistance,type P} from './westParkLayout';
export {STADIUM,STADIUM_GATE,STADIUM_PLAZA,PARK_POND,PARK_LAWNS,PARK_PATHS,PARK_GROVES,BOWL_RING,inStadiumFootprint,parkPathLines};
type Tools={
 box:(w:number,h:number,d:number,c:string,x:number,y:number,z:number)=>T.Mesh;
 put:(g:T.BufferGeometry,c:string,x:number,y:number,z:number)=>T.Mesh;
 cylinder:(r:number,h:number,c:string,x:number,y:number,z:number)=>T.Mesh;
 sign:(text:string,w:number,h:number,x:number,y:number,z:number,bg?:string,ink?:string,rotation?:number)=>T.Mesh;
 palm:(x:number,z:number,height?:number)=>void;bench:(x:number,z:number)=>void;planter:(x:number,z:number)=>void;
 path:(x:number,z:number,w:number,d:number)=>void;districtSign:(text:string,x:number,z:number)=>void;
 obstacles:Obstacle[];assets:{kind:string;x:number;z:number;w:number;d:number;visualW?:number;visualD?:number;canopyHeight?:number}[];
 surfaceAreas:{kind:string;x:number;z:number;w:number;d:number}[];materials:T.Material[];add:(o:T.Object3D)=>void;prop?:PropTagger;
};
export type WestParkStats={trees:number;palms:number;flags:number;hedges:number;beds:number};

export function buildWestPark(t:Tools):WestParkStats{
 const {box,put,cylinder,sign,palm,bench,planter,path,districtSign,obstacles,assets,surfaceAreas,materials}=t,prop=t.prop??untaggedProp;
 const stats:WestParkStats={trees:0,palms:0,flags:0,hedges:0,beds:0};
 // Flat ground pieces (paths, lawns, plaza) sit between the lawn (-0.112) and a path box's top (-0.0375), clear of depth fighting.
 const ribbon=(pts:readonly P[],width:number,y:number,color:string,kind:'path'|'grass')=>{
  const pos:number[]=[],idx:number[]=[];
  pts.forEach(([x,z],i)=>{const [px,pz]=pts[Math.max(0,i-1)],[nx,nz]=pts[Math.min(pts.length-1,i+1)],dx=nx-px,dz=nz-pz,l=Math.hypot(dx,dz)||1,ox=-dz/l*width/2,oz=dx/l*width/2;
   pos.push(x+ox,0,z+oz,x-ox,0,z-oz);if(i)idx.push((i-1)*2,i*2,(i-1)*2+1,(i-1)*2+1,i*2,i*2+1);// counter-clockwise from above: faces up
   if(i){surfaceAreas.push({kind,x:(x+px)/2,z:(z+pz)/2,w:Math.abs(x-px)+width,d:Math.abs(z-pz)+width});}});
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
  // Placed at its own centre (not the origin): the batching pass files a mesh under the 50 m chunk of its position, so this keeps
  // each path in its west chunk (frustum-culled and behind the west region gate) instead of the island centre's chunk.
  g.computeBoundingBox();const c=g.boundingBox!.getCenter(new T.Vector3());g.translate(-c.x,0,-c.z);
  const m=tintGroundMesh(put(g,color,c.x,y,c.z),kind);m.castShadow=false;return m;
 };
 const disc=(x:number,z:number,rx:number,rz:number,y:number,color:string,kind:'path'|'grass')=>{
  const g=new T.CircleGeometry(1,36);g.rotateX(-Math.PI/2);g.scale(rx,1,rz);surfaceAreas.push({kind,x,z,w:rx*2,d:rz*2});
  const m=tintGroundMesh(put(g,color,x,y,z),kind);m.castShadow=false;return m;
 };

 // --- Stadium Plaza: paved fan walk, flag poles both sides, benches, planters and flower beds -------------------------------
 const P_=STADIUM_PLAZA,pcx=(P_.minX+P_.maxX)/2,pcz=(P_.minZ+P_.maxZ)/2;
 path(pcx,pcz,P_.maxX-P_.minX,P_.maxZ-P_.minZ);
 // A darker centre band leads the eye to the gate.
 box(P_.maxX-P_.minX-4,.012,6,'#d9c8a2',pcx,-.032,pcz).castShadow=false;
 const flagColours=['#e5533d','#f2b134','#2f7fbf','#3f9b6a'];
 for(const side of [-1,1])for(let i=0;i<7;i++){
  const x=P_.minX+6+i*12,z=pcz+side*(P_.maxZ-P_.minZ)/2+side*.8;
  prop('pole',()=>{cylinder(.08,7.2,'#e9e4d6',x,3.6,z);box(1.9,1.15,.04,flagColours[(i+(side>0?2:0))%4],x+1.02,6.4,z);cylinder(.12,.12,'#c9a227',x,7.26,z);});
  obstacles.push({x,z,w:.3,d:.3});stats.flags++;
 }
 for(const [x,z] of [[-118,-60],[-96,-60],[-74,-60],[-118,0],[-96,0],[-74,0]] as P[]){
  // Flower beds (sponsor-free): a low kerb and a row of blossoms.
  prop('planter',()=>{box(12,.32,3,'#d2bc94',x,.16,z);box(11.4,.12,2.4,'#6b5640',x,.34,z);
   for(let k=0;k<9;k++)put(new T.IcosahedronGeometry(.42,0),['#e9a3a0','#f4d35e','#f6f1e7'][k%3],x-5+k*1.25,.62,z+(k%2?.45:-.45));});
  obstacles.push({x,z,w:12,d:3});stats.beds++;
 }
 for(const x of [-130,-108,-86,-64]){bench(x,P_.minZ+3.2);bench(x,P_.maxZ-3.2);}
 for(const x of [-124,-80])for(const z of [P_.minZ+7,P_.maxZ-7])planter(x,z);
 districtSign('STADIUM PLAZA',-58,P_.maxZ+3.5);

 // --- Park paths, lawns and the pond --------------------------------------------------------------------------------------
 for(const curve of PARK_PATHS)ribbon(pathPoints(curve),4.5,-.045,'#eddfbb','path');
 ribbon(ringPoints(),BOWL_RING.width,-.045,'#eddfbb','path');
 for(const l of PARK_LAWNS)disc(l.x,l.z,l.rx,l.rz,-.075,'#86ad79','grass');
 {const {x,z,rx,rz}=PARK_POND;
  disc(x,z,rx+2.2,rz+2.2,-.06,'#cdbb93','path');// stone rim
  const water=new T.MeshStandardMaterial({color:'#3f93b8',roughness:.22,metalness:.05});materials.push(water);
  const g=new T.CircleGeometry(1,40);g.rotateX(-Math.PI/2);g.scale(rx,1,rz);const pond=new T.Mesh(g,water);pond.position.set(x,-.05,z);pond.castShadow=false;pond.receiveShadow=true;pond.name='park-pond';
  t.add(pond);
  // Not walkable: a rounded box the shape of the pond's long axis (stadium-shaped), so walkers slide round its rim.
  obstacles.push({x,z,w:rx*2,d:rz*2,cornerRadius:rz});
  for(const [dx,dz] of [[-rx-4,0],[rx+4,0]] as P[])bench(x+dx,z+dz);
  sign('LILY POND',3.2,.6,x,1.5,z-rz-3.4,'#477c6a');for(const dx of [-1.3,1.3])cylinder(.05,1.5,'#9d805b',x+dx,.75,z-rz-3.4);
  obstacles.push({x,z:z-rz-3.4,w:3,d:.2});
  // Lily pads: flat green discs on the water.
  for(let k=0;k<7;k++){const a=k*2.1,r=.35+(k%3)*.18;const pad=put(new T.CircleGeometry(.9,8).rotateX(-Math.PI/2),'#5e9a5c',x+Math.cos(a)*rx*r,-.035,z+Math.sin(a)*rz*r);pad.castShadow=false;}
 }
 districtSign('STADIUM PARK',-150,-58);

 // --- Hedges round the bowl's corners ------------------------------------------------------------------------------------
 const S=STADIUM,hx=S.bowlW/2+15,hz=S.bowlL/2+15;
 for(const sx of [-1,1])for(const sz of [-1,1]){
  const x=S.x+sx*(hx-14),z=S.z+sz*hz;
  prop('bush',()=>{box(24,1.3,1.6,'#5c8a5f',x,.65,z);for(let k=0;k<6;k++)put(new T.IcosahedronGeometry(.9,0),'#679a66',x-10+k*4,1.35,z);});
  obstacles.push({x,z,w:24,d:1.6});stats.hedges++;
 }

 // --- Trees in groves (deterministic) -------------------------------------------------------------------------------------
 let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
 // Only the park's own colliders can be near (x < -100): a short list, not the island's thousands (build-time budget).
 const paths=parkPathLines(),placed:P[]=[],local=obstacles.filter(o=>o.x<-90);
 const clear=(x:number,z:number,r:number)=>{
  if(!onIsland(x,z)||distanceToShore(x,z)<20)return false;
  if(inStadiumFootprint(x,z,BOWL_RING.width+6))return false;
  if(x>P_.minX-8&&x<P_.maxX+6&&z>P_.minZ-8&&z<P_.maxZ+8)return false;
  if(x>-100)return false;// the old island (houses and streets) keeps its own planting
  if(Math.hypot((x-PARK_POND.x)/(PARK_POND.rx+7),(z-PARK_POND.z)/(PARK_POND.rz+7))<1)return false;
  if(PARK_LAWNS.some(l=>Math.hypot((x-l.x)/(l.rx+2),(z-l.z)/(l.rz+2))<1))return false;
  for(const p of paths)if(segDistance(x,z,p)<4+r)return false;
  if(local.some(o=>Math.abs(x-o.x)<o.w/2+r+1&&Math.abs(z-o.z)<o.d/2+r+1))return false;
  return !placed.some(([px,pz])=>(px-x)**2+(pz-z)**2<(r*2.3)**2);
 };
 const greens=['#4f7a57','#5e8c62','#6f9d6c','#739568'];
 for(let n=0;n<5000&&stats.trees<340;n++){
  const x=-335+rnd()*240,z=-230+rnd()*360,s=.85+rnd()*.6;
  const inGrove=PARK_GROVES.some(([gx,gz,gr])=>Math.hypot(x-gx,z-gz)<gr);
  if(!inGrove&&rnd()>.12)continue;
  if(!clear(x,z,1.8*s))continue;
  placed.push([x,z]);stats.trees++;
  const conifer=rnd()<.22,colour=greens[Math.floor(rnd()*greens.length)];
  prop('tree',()=>{
   assets.push({kind:'tree',x,z,w:.45*s,d:.45*s,visualW:3.6*s,visualD:3.6*s,canopyHeight:4.4*s});
   put(new T.CylinderGeometry(.13*s,.2*s,2.4*s,6),'#9d805b',x,1.2*s,z);
   if(conifer)put(new T.ConeGeometry(1.6*s,4.2*s,8),'#4a7552',x,2.4*s+1.6*s,z);
   else put(new T.IcosahedronGeometry(1.8*s,1),colour,x,3.3*s,z);
  });
  obstacles.push(trunkCollider(x,z,.2*s));
 }

 // --- Palms along the new West Beach ---------------------------------------------------------------------------------------
 for(let z=-150;z<=80;z+=26){
  let x=-345;while(x<-250&&!(onIsland(x,z)&&distanceToShore(x,z)>=13))x+=.5;
  if(x>=-250)continue;palm(x,z,5.5+((z+150)/26%3)*.5);stats.palms++;
 }
 return stats;
}
