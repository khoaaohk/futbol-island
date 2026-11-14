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
import {orchardParts,orchardRig} from './summitOrchard';
import {stadiumOrchardTrees,orchardPlanOf,ORCHARD_LEGACY,type StadiumOrchardTree} from './stadiumOrchard';
import {createPondWaterMaterial,createPondPadMaterial,createPondBedMaterial,createTrailMaterial,pondSeaDistance} from '../graphics/pondWater';

import {STADIUM,STADIUM_GATE,STADIUM_PLAZA,PLAZA_FLAG_X,PARK_POND,PARK_LAWNS,PARK_PATHS,PARK_TRAILS,PARK_GROVES,BOWL_RING,BOWL_APRON,POND_RIM,POND_Y,POND_SIGN,POND_BENCHES,POND_BENCH_BEARINGS,POND_DEPTH,POND_JETTY,POND_JETTY_AT,POND_STALL_BEARING,POND_SAND,POND_LOBE_MAX,POND_REED_BEARINGS,POND_WALK_BEARING,PLAZA_LABEL,PARK_SIGNS,TRAIL_WIDTH,
 inStadiumFootprint,parkPathLines,pathPoints,ringPoints,segDistance,trailBeachRun,onApron,inPond,onGrass,grassEdgeDistance,pondEdge,pondShape,pondInset,pondDepthForInset,onPondJetty,type P} from './westParkLayout';
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
 /** The sea's ripple tile (world.ts waterRipples): the pond's water samples the same texture as the ocean (no new texture). */
 seaRipples?:T.Texture;
};
export type WestParkStats={trees:number;palms:number;flags:number;hedges:number;beds:number;lilyPads:number;pondFlowers:number;pondRocks:number;pondReeds:number;
 /** The fruit orchards' trees (stadiumOrchard.ts), baked here; the fruit runtime (stadiumOrchardFruit.ts) reads this list. */
 orchard:StadiumOrchardTree[];orchardTriangles:number};
/** A park tree on the sand, or within this distance inland of the grass / sand line, is a palm (Nov 13 2026, owner: the sand and
 *  the row along the grass edge; the West Beach's grass edge is ~17 m in from the waterline, the north shore's up to ~40 m). */
export const PALM_EDGE_M=9;
/** The plaza paving's east end: tucked 0.3 m under the street's west sidewalk (road x -45, 12 m wide). */
export const PLAZA_PAVING_EAST=-50.7;
const PATH_C='#eddfbb',RIM_C='#cdbb93';
/** Lily pads on the pond (Nov 13 2026: 18 → 26 with the bigger pond, a flower on every 4th). */
const POND_PADS=26;
/** Trail paving that runs onto the beach: from the lawn's edge it eases to the sand's colour over BLEND m, narrows a little and
 *  settles toward the sand's height, so it fades into the beach (no squared-off end, no pale rectangle on the sand). */
export const TRAIL_BEACH={blend:7,narrow:.3,y:-.09} as const;
const smooth=(a:number,b:number,v:number)=>{const k=Math.min(1,Math.max(0,(v-a)/(b-a)));return k*k*(3-2*k);};

export function buildWestPark(t:Tools):WestParkStats{
 const {box,put,cylinder,sign,palm,bench,planter,path,districtSign,obstacles,assets,surfaceAreas,materials}=t,prop=t.prop??untaggedProp;
 const stats:WestParkStats={trees:0,palms:0,flags:0,hedges:0,beds:0,lilyPads:0,pondFlowers:0,pondRocks:0,pondReeds:0,orchard:[],orchardTriangles:0};
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
 for(const side of [-1,1])for(const x of PLAZA_FLAG_X){
  const z=pcz+side*(P_.maxZ-P_.minZ)/2+side*.8;
  // Nov 13 2026 (owner): national flags. The pole, finial and waving cloth are plazaFlags.ts's one mesh (world.ts builds it from
  // plazaFlagPoles(), the same rule as here); only the collider is here.
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
 {const {x,z,rx,rz}=PARK_POND,c=(h:string)=>new T.Color(h),SEG=96,tmpE={x:0,z:0},sandK=(a:number)=>{const d=Math.atan2(Math.sin(a-POND_SAND.bearing),Math.cos(a-POND_SAND.bearing));return 1-smooth(POND_SAND.half*.55,POND_SAND.half,Math.abs(d));};
  /** A ring mesh round the pond's own outline (westParkLayout.ts pondEdge, Nov 13 2026: no longer an ellipse): each ring is the edge
   *  scaled by `f` (0 = the centre) and pushed `out` m along the radius; per-vertex colour (and an optional attribute) from `paint`. */
  const rings=(def:readonly {f?:number;out?:number}[],paintAt:(px:number,pz:number,a:number,ring:number)=>{c:T.Color;v?:number},attr?:string)=>{
   const pos:number[]=[],col:number[]=[],extra:number[]=[],idx:number[]=[];
   def.forEach((r,ri)=>{for(let k=0;k<SEG;k++){const a=k/SEG*Math.PI*2,e=pondEdge(a,0,tmpE),f=r.f??1,ex=e.x-x,ez=e.z-z,l=Math.hypot(ex,ez)||1,o=r.out??0,px=x+ex*f+ex/l*o,pz=z+ez*f+ez/l*o,q=paintAt(px,pz,a,ri);
    pos.push(px-x,0,pz-z);col.push(q.c.r,q.c.g,q.c.b);extra.push(q.v??0);}});
   for(let j=0;j<def.length-1;j++)for(let k=0;k<SEG;k++){const a=j*SEG+k,b=j*SEG+(k+1)%SEG,cc=a+SEG,d=b+SEG;idx.push(a,cc,b,b,cc,d);}
   // Faces up whichever way the rings run (in → out or out → in): flip the winding if the first triangle faces down.
   {const [i0,i1,i2]=idx,ux=pos[i1*3]-pos[i0*3],uz=pos[i1*3+2]-pos[i0*3+2],vx=pos[i2*3]-pos[i0*3],vz=pos[i2*3+2]-pos[i0*3+2];if(uz*vx-ux*vz<0)for(let k=0;k<idx.length;k+=3){const t0=idx[k+1];idx[k+1]=idx[k+2];idx[k+2]=t0;}}
   const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('color',new T.Float32BufferAttribute(col,3));if(attr)g.setAttribute(attr,new T.Float32BufferAttribute(extra,1));
   g.setIndex(idx);g.computeVertexNormals();g.translate(x,0,z);return g;};
  const rimC=c(RIM_C),sandRimC=c(SAND_COLOR),tc=new T.Color();
  // The stone rim (an annulus round the outline, so the bed shows through the water); on the coast side (POND_SAND) a sandy shore.
  {const g=rings([{out:-.6},{out:POND_RIM}],(_px,_pz,a)=>({c:tc.copy(rimC).lerp(sandRimC,sandK(a)).clone()}));flat(g,trailMat,-.06,'park-pond-rim');
   surfaceAreas.push({kind:'path',x,z,w:(rx+POND_RIM)*2*(1+POND_LOBE_MAX),d:(rz+POND_RIM)*2*(1+POND_LOBE_MAX)});}
  // The bed: sandy at the edge, the shelf's olive, then the drop-off down to a dark deep middle (its colour follows the depth profile).
  {const bedMat=createPondBedMaterial();materials.push(bedMat);
   const ramp=[[0,c('#b3a57a')],[.35,c('#8e8a63')],[POND_DEPTH.shelf,c('#5f6f4c')],[1.4,c('#3a5440')],[2.4,c('#29412f')],[POND_DEPTH.deep,c('#1d3127')]] as const;
   const bedAt=(d:number,a:number)=>{let k=0;while(k<ramp.length-2&&d>ramp[k+1][0])k++;const [d0,c0]=ramp[k],[d1,c1]=ramp[k+1];tc.copy(c0).lerp(c1,Math.min(1,Math.max(0,(d-d0)/(d1-d0))));
    return tc.lerp(sandRimC,sandK(a)*.7*(1-smooth(.2,1.2,d))).clone();};
   const g=rings([{out:.05},{out:-.8},{out:-2},{out:-3.2},{out:-5},{out:-7},{out:-9},{out:-12},{f:.35},{f:0}],(px,pz,a)=>({c:bedAt(pondDepthForInset(Math.max(0,pondInset(px,pz))),a)}));flat(g,bedMat,-.085,'park-pond-bed');}
  // The water: the sea's own look (pondWater.ts, Nov 13 2026 owner: "tie it to the ocean so the water is the same colour"): aEdge fades
  // it into the bank, aSea is the depth as the sea's shore distance (the shelf reads as the sea's pale shallows, the middle its teal).
  {const water=createPondWaterMaterial(t.seaRipples);materials.push(water);
   const g=rings([{out:0},{out:-.5},{out:-1.5},{out:-3},{out:-5},{out:-8},{out:-12},{f:.35},{f:0}],(px,pz,_a,ri)=>({c:tc.set('#ffffff'),v:[0,.35,.75,1,1,1,1,1,1][ri]}),'aEdge');
   const pos=g.getAttribute('position'),sea=new Float32Array(pos.count);for(let k=0;k<pos.count;k++)sea[k]=pondSeaDistance(pondDepthForInset(Math.max(0,pondInset(pos.getX(k),pos.getZ(k)))));
   g.setAttribute('aSea',new T.BufferAttribute(sea,1));g.deleteAttribute('color');g.setAttribute('uv',new T.Float32BufferAttribute(new Float32Array(pos.count*2),2));
   const pond=flat(g,water,POND_Y,'park-pond');pond.receiveShadow=true;}
  // Swimmable (Nov 13 2026): no collider; the water model (waterDepth.ts PARK_POND_WATER) wades and swims a walker in.
  for(const [bx,bz] of POND_BENCHES)bench(bx,bz);
  {const {x:sx,z:sz,rotation}=POND_SIGN;prop('sign',()=>{sign('LILY POND',3.2,.6,sx,1.5,sz,'#477c6a',undefined,rotation);for(const d of [-1.3,1.3])cylinder(.05,1.5,'#9d805b',sx,.75,sz+d);});// kick audit: it wobbles
   obstacles.push({x:sx,z:sz,w:.2,d:3});}
  // Where the edge detail keeps clear: the pond walk's end, the jetty, the fishing stall's cast line, the benches, the sandy shore.
  const busy=(a:number,pad=0)=>{const near=(b:number,w:number)=>Math.abs(Math.atan2(Math.sin(a-b),Math.cos(a-b)))<w+pad;
   return near(POND_WALK_BEARING,.2)||near(POND_JETTY.bearing,.16)||near(POND_STALL_BEARING,.22)||POND_BENCH_BEARINGS.some(b=>near(b*Math.PI/180,.12));};
  // Rocks and pebbles on the rim (two greys, merged: 2 paints in the chunk batches), fewer on the sandy shore.
  {let sd=29;const r=()=>{sd=(sd*16807)%2147483647;return sd/2147483647;};const greys:T.BufferGeometry[][]=[[],[]];
   for(let k=0;k<64;k++){const a=k/64*Math.PI*2+(r()-.5)*.08;if(busy(a)||sandK(a)>.5&&r()<.75)continue;const big=r()<.35,rad=big?.32+r()*.22:.12+r()*.12,inner=r()<.3;
    const e=pondEdge(a,inner?-.25:POND_RIM+.15+r()*.35),g=new T.IcosahedronGeometry(rad,0);g.scale(1,.55+r()*.25,.8+r()*.4);g.rotateY(r()*6.283);g.translate(e.x,rad*.25-.04,e.z);greys[k%2].push(g);stats.pondRocks++;}
   greys.forEach((list,i)=>{if(!list.length)return;const m=mergeGeometries(list)!;list.forEach(g=>g.dispose());m.computeBoundingBox();const cc=m.boundingBox!.getCenter(new T.Vector3());m.translate(-cc.x,0,-cc.z);put(m,i?'#9a968c':'#7f7b72',cc.x,0,cc.z);});}
  // Reeds and cattails in clumps in the shallows (stems: one merged mesh per clump colour; the brown heads on a few).
  {let sd=53;const r=()=>{sd=(sd*16807)%2147483647;return sd/2147483647;};const stems:T.BufferGeometry[]=[],heads:T.BufferGeometry[]=[];
   for(const deg of POND_REED_BEARINGS){const a=deg*Math.PI/180;if(busy(a,.05))continue;const e=pondEdge(a,-(.9+r()*1.1));stats.pondReeds++;
    for(let n=0;n<8;n++){const h=.8+r()*.7,ox=(r()-.5)*1.6,oz=(r()-.5)*1.6,g=new T.CylinderGeometry(.018,.03,h,4,1,true);g.rotateZ((r()-.5)*.18);g.rotateX((r()-.5)*.18);g.translate(e.x+ox,h/2-.08,e.z+oz);stems.push(g);
     if(n%3===0){const hd=new T.CylinderGeometry(.05,.05,.22,5);hd.translate(e.x+ox,h-.02,e.z+oz);heads.push(hd);}}}
   for(const [list,col] of [[stems,'#6f8f4a'],[heads,'#6b4a2b']] as const){if(!list.length)continue;const m=mergeGeometries(list.map(g=>g.toNonIndexed()))!;list.forEach(g=>g.dispose());m.computeVertexNormals();m.computeBoundingBox();const cc=m.boundingBox!.getCenter(new T.Vector3());m.translate(-cc.x,0,-cc.z);put(m,col,cc.x,0,cc.z);}}
  // The jetty (POND_JETTY): a low plank dock from the rim out over the water beside the fishing stall, flush with the bank (walkable:
  // its planks are dry land to the water model, westParkLayout.ts onPondJetty). A deck, cross planks, and posts into the water.
  {const J=POND_JETTY_AT,yaw=Math.atan2(J.ux,J.uz),wood='#9d805b',dark='#7a6142',cx=J.x+J.ux*POND_JETTY.len/2,cz=J.z+J.uz*POND_JETTY.len/2;
   put(new T.BoxGeometry(POND_JETTY.w,.08,POND_JETTY.len).rotateY(yaw),wood,cx,POND_JETTY.y-.05,cz);
   for(let k=0;k<6;k++){const d=.6+k*(POND_JETTY.len-1.2)/5;put(new T.BoxGeometry(POND_JETTY.w+.12,.03,.14).rotateY(yaw),dark,J.x+J.ux*d,POND_JETTY.y,J.z+J.uz*d);}
   for(const d of [2.5,POND_JETTY.len-.3])for(const side of [-1,1])cylinder(.08,1.1,dark,J.x+J.ux*d-J.uz*side*(POND_JETTY.w/2-.05),-.48,J.z+J.uz*d+J.ux*side*(POND_JETTY.w/2-.05));
   surfaceAreas.push({kind:'path',x:cx,z:cz,w:Math.abs(J.ux)*POND_JETTY.len+POND_JETTY.w,d:Math.abs(J.uz)*POND_JETTY.len+POND_JETTY.w});}
  // Lily pads: notched discs (a few in flower), drifting on their own slow loops (pondWater.ts), one merged mesh; clear of the jetty.
  {let sd=11;const r=()=>{sd=(sd*16807)%2147483647;return sd/2147483647;};const parts:T.BufferGeometry[]=[],greens=['#5e9a5c','#6aa564','#4f8a52'];
   for(let k=0;k<POND_PADS;k++){const a=r()*Math.PI*2,q=(.25+r()*.5)*pondShape(a),px=x+Math.cos(a)*rx*q,pz=z+Math.sin(a)*rz*q,size=.55+r()*.5,ph=r()*6.283;if(onPondJetty(px,pz,1.6))continue;
    const pad=new T.CircleGeometry(size,10,r()*6.283,Math.PI*1.82).rotateX(-Math.PI/2).translate(px,0,pz).toNonIndexed();paint(pad,c(greens[k%3]));
    const add=(g:T.BufferGeometry)=>{g.deleteAttribute('uv');g.setAttribute('aPad',new T.Float32BufferAttribute(new Float32Array(g.getAttribute('position').count).fill(ph),1));parts.push(g);};add(pad);
    if(k%4===0){const f=new T.ConeGeometry(.2,.22,6).translate(px+.1,.1,pz-.05).toNonIndexed();paint(f,c(k%8?'#f2a7c3':'#f6f1e7'));f.deleteAttribute('normal');f.computeVertexNormals();add(f);stats.pondFlowers++;}
    stats.lilyPads++;}
   for(const g of parts)if(!g.getAttribute('normal'))g.computeVertexNormals();
   const merged=mergeGeometries(parts)!;parts.forEach(g=>g.dispose());const padMat=createPondPadMaterial();materials.push(padMat);flat(merged,padMat,POND_Y+.012,'park-pond-pads');}
 }
 districtSign('STADIUM PARK',PARK_SIGNS[0][0],PARK_SIGNS[0][1]);

 // --- Trees in groves, palms by the beach (deterministic) ------------------------------------------------------------------
 // Nov 13 2026 (owner): the four straight hedge rows round the bowl's corners are gone (one lay in the pond, two across lawns).
 let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
 // Only the park's own colliders can be near (x < -100): a short list, not the island's thousands (build-time budget).
 const paths=parkPathLines(),placed:P[]=[],local=obstacles.filter(o=>o.x<-90);
 const clearOfPaving=(x:number,z:number,r:number)=>{
  if(onApron(x,z,r+2)||inStadiumFootprint(x,z,BOWL_RING.width+6))return false;
  if(x>P_.minX-8&&x<P_.maxX+6&&z>P_.minZ-8&&z<P_.maxZ+8)return false;
  if(inPond(x,z,POND_RIM+4+r))return false;
  // Signs stay readable (owner, Nov 13 2026: a tree stood in front of STADIUM PARK): nothing within 6 m, nor in the camera's view of
  // them (the follow camera looks from the south-east, so a wider strip on that side).
  for(const [sx,sz] of PARK_SIGNS)if(Math.hypot(x-sx,z-sz)<6+r||(x>sx-4&&x<sx+14&&z>sz-3&&z<sz+18))return false;
  if(PARK_LAWNS.some(l=>Math.hypot((x-l.x)/(l.rx+2),(z-l.z)/(l.rz+2))<1))return false;
  for(const p of paths)if(segDistance(x,z,p)<TRAIL_WIDTH/2+1.8+r)return false;
  if(local.some(o=>Math.abs(x-o.x)<o.w/2+r+1&&Math.abs(z-o.z)<o.d/2+r+1))return false;
  return !placed.some(([px,pz])=>(px-x)**2+(pz-z)**2<(r*2.3)**2);
 };
 const clear=(x:number,z:number,r:number)=>onIsland(x,z)&&distanceToShore(x,z)>=14&&x<=-100&&clearOfPaving(x,z,r);
 const beachPalm=(x:number,z:number,h:number)=>{placed.push([x,z]);stats.palms++;palm(x,z,h,rnd()*Math.PI*2,false);};// no midribs: ~150 triangles a palm, not ~2.4k
 const greens=['#4f7a57','#5e8c62','#6f9d6c','#739568'];
 // --- Fruit orchards (Nov 13 2026, owner; stadiumOrchard.ts): Summit Isle's orchard forms, baked into the chunks like any park tree
 // ('tree' prop: a kicked ball rustles them), each with its trunk collider; planted first so the park's own trees keep clear.
 for(const o of stadiumOrchardTrees()){if(local.some(b=>Math.abs(o.x-b.x)<b.w/2+2.5&&Math.abs(o.z-b.z)<b.d/2+2.5))continue;
  const plan=orchardPlanOf(o);placed.push([o.x,o.z]);stats.orchard.push(o);
  prop('tree',()=>{assets.push({kind:'tree',x:o.x,z:o.z,w:.4,d:.4,visualW:3.4*o.s,visualD:3.4*o.s,canopyHeight:4.2*o.s});
   for(const part of orchardParts(plan)){const g=part.geo();g.applyMatrix4(part.matrix);g.translate(-o.x,0,-o.z);stats.orchardTriangles+=(g.index?g.index.count:g.getAttribute('position').count)/3;put(g,part.color,o.x,0,o.z);}});
  obstacles.push(trunkCollider(o.x,o.z,orchardRig(plan).baseR));}
 // Nov 13 2026 (owner: more fruit trees): every orchard tree past the first 14 takes the place of a plain park tree (every 8th
 // broadleaf spot is left to the orchards until they are paid for), so the park's tree triangles stay about flat.
 let convert=Math.max(0,stats.orchard.length-ORCHARD_LEGACY.length),plainSeen=0;
 for(let n=0;n<5000&&stats.trees+stats.palms<340;n++){
  const x=-335+rnd()*240,z=-230+rnd()*360,s=.85+rnd()*.6;
  const inGrove=PARK_GROVES.some(([gx,gz,gr])=>Math.hypot(x-gx,z-gz)<gr);
  if(!inGrove&&rnd()>.12)continue;
  if(!clear(x,z,1.8*s))continue;
  // The sand and the row along the grass edge are palms, leaning their own way, 5–7.4 m tall.
  if(!onGrass(x,z)||grassEdgeDistance(x,z)<PALM_EDGE_M){beachPalm(x,z,5+s*1.6);continue;}
  if(convert>0&&++plainSeen%8===0){convert--;placed.push([x,z]);continue;}// its spot stays open lawn
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
