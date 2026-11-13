// West Stadium, phase 1 (Nov 12 2026, docs/stadium/PLAN.md): Stadium Park on the new west land (shoreline.ts), Stadium Plaza in
// place of two west houses, round the stadium's footprint (the stadium itself: stadiumWorld.ts, phase 2).
// Everything here is static and built once inside buildTownSteps, so it is merged into the island's 50 m chunk batches with
// the shared vertex-colour paint (one draw call per chunk and paint, wind sway on the trees and palms for free), and the whole
// west region is hidden by one frustum-box test when it is out of view (world.ts, westRegion). No per-frame work, no new texture.
import * as T from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {onIsland,distanceToShore} from './shoreline';
import {trunkCollider,type Obstacle} from './simulation';
import {tintGroundMesh,SAND_COLOR} from '../graphics/groundTint';
import {untaggedProp,type PropTagger} from '../graphics/propReactions';
import {createPondWaterMaterial,createPondPadMaterial,createPondBedMaterial,createTrailMaterial} from '../graphics/pondWater';

import {STADIUM,STADIUM_GATE,STADIUM_PLAZA,PARK_POND,PARK_LAWNS,PARK_PATHS,PARK_TRAILS,PARK_GROVES,BOWL_RING,BOWL_APRON,POND_RIM,POND_Y,POND_SIGN,POND_BENCHES,PLAZA_LABEL,TRAIL_WIDTH,
 inStadiumFootprint,parkPathLines,pathPoints,ringPoints,segDistance,trailBeachRun,onApron,inPond,onGrass,grassEdgeDistance,type P} from './westParkLayout';
export {STADIUM,STADIUM_GATE,STADIUM_PLAZA,PARK_POND,PARK_LAWNS,PARK_PATHS,PARK_GROVES,BOWL_RING,inStadiumFootprint,parkPathLines};
type Tools={
 box:(w:number,h:number,d:number,c:string,x:number,y:number,z:number)=>T.Mesh;
 put:(g:T.BufferGeometry,c:string,x:number,y:number,z:number)=>T.Mesh;
 cylinder:(r:number,h:number,c:string,x:number,y:number,z:number)=>T.Mesh;
 sign:(text:string,w:number,h:number,x:number,y:number,z:number,bg?:string,ink?:string,rotation?:number)=>T.Mesh;
 palm:(x:number,z:number,height?:number,yaw?:number,ribs?:boolean)=>void;bench:(x:number,z:number)=>void;planter:(x:number,z:number)=>void;
 path:(x:number,z:number,w:number,d:number)=>void;districtSign:(text:string,x:number,z:number)=>void;
 obstacles:Obstacle[];assets:{kind:string;x:number;z:number;w:number;d:number;visualW?:number;visualD?:number;canopyHeight?:number}[];
 surfaceAreas:{kind:string;x:number;z:number;w:number;d:number}[];materials:T.Material[];add:(o:T.Object3D)=>void;prop?:PropTagger;
};
export type WestParkStats={trees:number;palms:number;flags:number;hedges:number;beds:number;lilyPads:number};
/** A park tree on the sand, or within this distance inland of the grass / sand line, is a palm (Nov 13 2026, owner: the sand and
 *  the row along the grass edge; the West Beach's grass edge is ~17 m in from the waterline, the north shore's up to ~40 m). */
export const PALM_EDGE_M=9;
/** The plaza paving's east end: tucked 0.3 m under the street's west sidewalk (road x -45, 12 m wide). */
export const PLAZA_PAVING_EAST=-50.7;
const PATH_C='#eddfbb',RIM_C='#cdbb93';
/** Trail paving that runs onto the beach: from the lawn's edge it eases to the sand's colour over BLEND m, narrows a little and
 *  settles toward the sand's height, so it fades into the beach (no squared-off end, no pale rectangle on the sand). */
export const TRAIL_BEACH={blend:7,narrow:.3,y:-.09} as const;
const smooth=(a:number,b:number,v:number)=>{const k=Math.min(1,Math.max(0,(v-a)/(b-a)));return k*k*(3-2*k);};

export function buildWestPark(t:Tools):WestParkStats{
 const {box,put,cylinder,sign,palm,bench,planter,path,districtSign,obstacles,assets,surfaceAreas,materials}=t,prop=t.prop??untaggedProp;
 const stats:WestParkStats={trees:0,palms:0,flags:0,hedges:0,beds:0,lilyPads:0};
 const trailMat=createTrailMaterial();materials.push(trailMat);
 const pathC=new T.Color(PATH_C),sandC=new T.Color(SAND_COLOR),tmpC=new T.Color();
 /** A flat mesh in the trail paving (vertex colours), placed at its own centre so the batching pass files it under its own
  *  50 m chunk (frustum-culled and behind the west region gate) instead of the island centre's. */
 const flat=(g:T.BufferGeometry,material:T.Material,y:number,name?:string)=>{g.computeBoundingBox();const c=g.boundingBox!.getCenter(new T.Vector3());g.translate(-c.x,0,-c.z);
  const m=new T.Mesh(g,material);m.position.set(c.x,y,c.z);m.castShadow=false;m.receiveShadow=true;if(name)m.name=name;t.add(m);return m;};
 const paint=(g:T.BufferGeometry,c:T.Color)=>{const n=g.getAttribute('position').count,a=new Float32Array(n*3);for(let i=0;i<n;i++)a.set([c.r,c.g,c.b],i*3);g.setAttribute('color',new T.BufferAttribute(a,3));return g;};
 // Flat ground pieces (paths, lawns, plaza) sit between the lawn (-0.112) and a path box's top (-0.0375), clear of depth fighting.
 /** A smooth ribbon down a polyline: miter-free (each point offset along the averaged tangent), closed loops wrap, round caps at
  *  open ends (the joins: a cap sits inside the paving it meets), and a beach end fades into the sand (TRAIL_BEACH). */
 const ribbon=(pts:readonly P[],width:number,y:number,o:{beach?:boolean}={})=>{
  const closed=pts.length>2&&pts[0][0]===pts[pts.length-1][0]&&pts[0][1]===pts[pts.length-1][1],n=pts.length;
  const run=o.beach?trailBeachRun(pts):null,pos:number[]=[],col:number[]=[],idx:number[]=[];
  pts.forEach(([x,z],i)=>{const [px,pz]=closed&&i===0?pts[n-2]:pts[Math.max(0,i-1)],[nx,nz]=closed&&i===n-1?pts[1]:pts[Math.min(n-1,i+1)],dx=nx-px,dz=nz-pz,l=Math.hypot(dx,dz)||1;
   const r=run?run[i]:0,k=run?smooth(-1.5,TRAIL_BEACH.blend,r):0,w=width*(1-TRAIL_BEACH.narrow*smooth(1,TRAIL_BEACH.blend+2,r)),ox=-dz/l*w/2,oz=dx/l*w/2,yy=run?TRAIL_BEACH.y*smooth(-1,3,r)+y*(1-smooth(-1,3,r))-y:0;
   pos.push(x+ox,yy,z+oz,x-ox,yy,z-oz);tmpC.copy(pathC).lerp(sandC,k);col.push(tmpC.r,tmpC.g,tmpC.b,tmpC.r,tmpC.g,tmpC.b);
   if(i)idx.push((i-1)*2,i*2,(i-1)*2+1,(i-1)*2+1,i*2,i*2+1);// counter-clockwise from above: faces up
   if(i){const [qx,qz]=pts[i-1];surfaceAreas.push({kind:k>.5?'sand':'path',x:(x+qx)/2,z:(z+qz)/2,w:Math.abs(x-qx)+w,d:Math.abs(z-qz)+w});}});
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('color',new T.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();
  flat(g,trailMat,y);
  if(!closed)for(const [i,keep] of [[0,true],[n-1,!o.beach]] as const)if(keep){const cap=new T.CircleGeometry(width/2,20).rotateX(-Math.PI/2);cap.translate(pts[i][0],0,pts[i][1]);flat(paint(cap,pathC),trailMat,y-.001);}
 };
 /** An elliptical disc / annulus in rings: s = radius fractions (0 = the centre point), each ring with its own colour (and an
  *  optional per-ring attribute). Faces up. */
 const ellipse=(rx:number,rz:number,rings:readonly {s:number;c:T.Color;a?:number}[],seg=56,attr?:string)=>{
  const pos:number[]=[],col:number[]=[],extra:number[]=[],idx:number[]=[];
  for(const r of rings)for(let k=0;k<seg;k++){const a=k/seg*Math.PI*2;pos.push(Math.cos(a)*rx*r.s,0,Math.sin(a)*rz*r.s);col.push(r.c.r,r.c.g,r.c.b);extra.push(r.a??0);}
  for(let j=0;j<rings.length-1;j++)for(let k=0;k<seg;k++){const a=j*seg+k,b=j*seg+(k+1)%seg,c=a+seg,d=b+seg;idx.push(a,b,c,b,d,c);}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('color',new T.Float32BufferAttribute(col,3));if(attr)g.setAttribute(attr,new T.Float32BufferAttribute(extra,1));
  g.setIndex(idx);g.computeVertexNormals();return g;};
 const disc=(x:number,z:number,rx:number,rz:number,y:number,color:string,kind:'path'|'grass')=>{
  const g=new T.CircleGeometry(1,36);g.rotateX(-Math.PI/2);g.scale(rx,1,rz);surfaceAreas.push({kind,x,z,w:rx*2,d:rz*2});
  const m=tintGroundMesh(put(g,color,x,y,z),kind);m.castShadow=false;return m;
 };

 // --- Stadium Plaza: paved fan walk, flag poles both sides, benches, planters and flower beds -------------------------------
 const P_=STADIUM_PLAZA,pcx=(P_.minX+P_.maxX)/2,pcz=(P_.minZ+P_.maxZ)/2;
 // The paving runs on east under the x -45 street's west sidewalk (its outer edge x -51, 1.75 cm higher, the same cream and tint),
 // so no grass strip shows between them (Nov 13 2026, owner); STADIUM_PLAZA itself (flags, sponsors, analytics) is unchanged.
 // One even surface: the darker centre band (it stopped short of the street with a square end) is gone.
 {const east=PLAZA_PAVING_EAST;path((P_.minX+east)/2,pcz,east-P_.minX,P_.maxZ-P_.minZ);}
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
 // The benches keep clear of the two trail mouths at x -106 (Nov 13 2026).
 for(const x of [-130,-118,-86,-64]){bench(x,P_.minZ+3.2);bench(x,P_.maxZ-3.2);}
 for(const x of [-124,-80])for(const z of [P_.minZ+7,P_.maxZ-7])planter(x,z);
 districtSign(PLAZA_LABEL,-58,P_.maxZ+3.5);

 // --- The bowl's apron: paving from the stands out to the ring path (the gate, the back stairs and the corners land on it) ----
 {const {w,d,r}=BOWL_APRON,a=w/2-r,b=d/2-r,shape=new T.Shape();
  shape.moveTo(-a,-d/2);shape.lineTo(a,-d/2);shape.absarc(a,-b,r,-Math.PI/2,0,false);shape.lineTo(w/2,b);shape.absarc(a,b,r,0,Math.PI/2,false);
  shape.lineTo(-a,d/2);shape.absarc(-a,b,r,Math.PI/2,Math.PI,false);shape.lineTo(-w/2,-b);shape.absarc(-a,-b,r,Math.PI,Math.PI*1.5,false);
  const g=new T.ShapeGeometry(shape,16);g.rotateX(-Math.PI/2);// faces up (the shape is symmetric, so its y → -z mirror is harmless)
  g.translate(BOWL_APRON.x,0,BOWL_APRON.z);const m=flat(paint(g,pathC),trailMat,-.08,'stadium-apron');m.receiveShadow=true;
  surfaceAreas.push({kind:'path',x:BOWL_APRON.x,z:BOWL_APRON.z,w,d});}

 // --- Park trails, lawns and the pond --------------------------------------------------------------------------------------
 for(const tr of PARK_TRAILS)ribbon(pathPoints(tr.curve),TRAIL_WIDTH,-.045,{beach:tr.to==='beach'});
 ribbon(ringPoints(),BOWL_RING.width,-.045);
 for(const l of PARK_LAWNS)disc(l.x,l.z,l.rx,l.rz,-.075,'#86ad79','grass');
 {const {x,z,rx,rz}=PARK_POND,c=(h:string)=>new T.Color(h);
  // The stone rim (an annulus, so the bed shows through the water), the bed (sandy shallows to a deep middle), the water.
  {const g=ellipse(rx,rz,[{s:.97,c:c(RIM_C)},{s:1,c:c(RIM_C)}]);// the outer ring is moved out to rx + rim, rz + rim
   const p=g.getAttribute('position');for(let i=56;i<112;i++){const a=(i-56)/56*Math.PI*2;p.setXYZ(i,Math.cos(a)*(rx+POND_RIM),0,Math.sin(a)*(rz+POND_RIM));}
   g.translate(x,0,z);flat(g,trailMat,-.06);surfaceAreas.push({kind:'path',x,z,w:(rx+POND_RIM)*2,d:(rz+POND_RIM)*2});}
  {const bedMat=createPondBedMaterial();materials.push(bedMat);
   const g=ellipse(rx,rz,[{s:0,c:c('#2c4638')},{s:.45,c:c('#34503d')},{s:.75,c:c('#55684a')},{s:.92,c:c('#8e8a63')},{s:1.01,c:c('#b3a57a')}]);g.translate(x,0,z);flat(g,bedMat,-.085,'park-pond-bed');}
  {const water=createPondWaterMaterial();materials.push(water);
   const g=ellipse(rx,rz,[{s:0,c:c('#ffffff'),a:1},{s:.7,c:c('#ffffff'),a:1},{s:.88,c:c('#ffffff'),a:.75},{s:.96,c:c('#ffffff'),a:.35},{s:1,c:c('#ffffff'),a:0}],64,'aEdge');
   g.deleteAttribute('color');g.setAttribute('uv',new T.Float32BufferAttribute(new Float32Array(g.getAttribute('position').count*2),2));g.translate(x,0,z);
   const pond=flat(g,water,POND_Y,'park-pond');pond.receiveShadow=true;}
  // Wadeable (Nov 13 2026, owner: walking in the water splashes): no collider; parkPond.ts sinks a walker and splashes.
  for(const [bx,bz] of POND_BENCHES)bench(bx,bz);
  {const {x:sx,z:sz,rotation}=POND_SIGN;sign('LILY POND',3.2,.6,sx,1.5,sz,'#477c6a',undefined,rotation);for(const d of [-1.3,1.3])cylinder(.05,1.5,'#9d805b',sx,.75,sz+d);
   obstacles.push({x:sx,z:sz,w:.2,d:3});}
  // Lily pads: notched discs (a few in flower), drifting on their own slow loops (pondWater.ts), one merged mesh.
  {let sd=11;const r=()=>{sd=(sd*16807)%2147483647;return sd/2147483647;};const parts:T.BufferGeometry[]=[],greens=['#5e9a5c','#6aa564','#4f8a52'];
   for(let k=0;k<18;k++){const a=r()*Math.PI*2,q=.25+r()*.5,px=x+Math.cos(a)*rx*q,pz=z+Math.sin(a)*rz*q,size=.55+r()*.5,ph=r()*6.283;
    const pad=new T.CircleGeometry(size,10,r()*6.283,Math.PI*1.82).rotateX(-Math.PI/2).translate(px,0,pz).toNonIndexed();paint(pad,c(greens[k%3]));
    const add=(g:T.BufferGeometry)=>{g.deleteAttribute('uv');g.setAttribute('aPad',new T.Float32BufferAttribute(new Float32Array(g.getAttribute('position').count).fill(ph),1));parts.push(g);};add(pad);
    if(k%5===0){const f=new T.ConeGeometry(.2,.22,6).translate(px+.1,.1,pz-.05).toNonIndexed();paint(f,c(k%2?'#f2a7c3':'#f6f1e7'));f.deleteAttribute('normal');f.computeVertexNormals();add(f);}
    stats.lilyPads++;}
   for(const g of parts)if(!g.getAttribute('normal'))g.computeVertexNormals();
   const merged=mergeGeometries(parts)!;parts.forEach(g=>g.dispose());const padMat=createPondPadMaterial();materials.push(padMat);flat(merged,padMat,POND_Y+.012,'park-pond-pads');}
 }
 districtSign('STADIUM PARK',-114,30);

 // --- Trees in groves, palms by the beach (deterministic) ------------------------------------------------------------------
 // Nov 13 2026 (owner): the four straight hedge rows round the bowl's corners are gone (one lay in the pond, two across lawns).
 let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
 // Only the park's own colliders can be near (x < -100): a short list, not the island's thousands (build-time budget).
 const paths=parkPathLines(),placed:P[]=[],local=obstacles.filter(o=>o.x<-90);
 const clearOfPaving=(x:number,z:number,r:number)=>{
  if(onApron(x,z,r+2)||inStadiumFootprint(x,z,BOWL_RING.width+6))return false;
  if(x>P_.minX-8&&x<P_.maxX+6&&z>P_.minZ-8&&z<P_.maxZ+8)return false;
  if(inPond(x,z,POND_RIM+4+r))return false;
  if(PARK_LAWNS.some(l=>Math.hypot((x-l.x)/(l.rx+2),(z-l.z)/(l.rz+2))<1))return false;
  for(const p of paths)if(segDistance(x,z,p)<TRAIL_WIDTH/2+1.8+r)return false;
  if(local.some(o=>Math.abs(x-o.x)<o.w/2+r+1&&Math.abs(z-o.z)<o.d/2+r+1))return false;
  return !placed.some(([px,pz])=>(px-x)**2+(pz-z)**2<(r*2.3)**2);
 };
 const clear=(x:number,z:number,r:number)=>onIsland(x,z)&&distanceToShore(x,z)>=14&&x<=-100&&clearOfPaving(x,z,r);
 const beachPalm=(x:number,z:number,h:number)=>{placed.push([x,z]);stats.palms++;palm(x,z,h,rnd()*Math.PI*2,false);};// no midribs: ~150 triangles a palm, not ~2.4k
 const greens=['#4f7a57','#5e8c62','#6f9d6c','#739568'];
 for(let n=0;n<5000&&stats.trees+stats.palms<340;n++){
  const x=-335+rnd()*240,z=-230+rnd()*360,s=.85+rnd()*.6;
  const inGrove=PARK_GROVES.some(([gx,gz,gr])=>Math.hypot(x-gx,z-gz)<gr);
  if(!inGrove&&rnd()>.12)continue;
  if(!clear(x,z,1.8*s))continue;
  // The sand and the row along the grass edge are palms, leaning their own way, 5–7.4 m tall.
  if(!onGrass(x,z)||grassEdgeDistance(x,z)<PALM_EDGE_M){beachPalm(x,z,5+s*1.6);continue;}
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

 // --- A row of palms along the West Beach sand (clear of the trails' runs onto the beach) ----------------------------------
 for(let z=-150;z<=80;z+=26){
  let x=-345;while(x<-250&&!(onIsland(x,z)&&distanceToShore(x,z)>=13))x+=.5;
  if(x>=-250||!clearOfPaving(x,z,1.2))continue;beachPalm(x,z,5.5+((z+150)/26%3)*.5);
 }
 return stats;
}
