// West Stadium, phase 1 (Nov 12 2026, docs/stadium/PLAN.md): Stadium Park on the new west land (shoreline.ts), Stadium Plaza in
// place of two west houses, and the stadium's reserved footprint with a placeholder bowl of low stands (phase 2 rebuilds the
// stands with a walkable concourse, stairs and seats).
// Everything here is static and built once inside buildTownSteps, so it is merged into the island's 50 m chunk batches with
// the shared vertex-colour paint (one draw call per chunk and paint, wind sway on the trees and palms for free), and the whole
// west region is hidden by one frustum-box test when it is out of view (world.ts, westRegion). No per-frame work, no new texture.
import * as T from 'three';
import {onIsland,distanceToShore} from './shoreline';
import {trunkCollider,type Obstacle} from './simulation';
import {tintGroundMesh} from '../graphics/groundTint';
import {untaggedProp,type PropTagger} from '../graphics/propReactions';

/** The stadium bowl: centre, outer size (x × z) and the full-size pitch inside (long axis north–south). */
export const STADIUM={x:-205,z:-30,bowlW:124,bowlL:164,pitchW:63,pitchL:100} as const;
/** The gate on the bowl's east side, facing the plaza. */
export const STADIUM_GATE={x:STADIUM.x+STADIUM.bowlW/2,z:STADIUM.z,halfWidth:7} as const;
/** Stadium Plaza: the fan walk from Old Town's west street (x -45) to the gate. */
export const STADIUM_PLAZA={minX:-140,maxX:-52,minZ:STADIUM.z-22,maxZ:STADIUM.z+22} as const;
/** The park pond (an ellipse, radii in m). */
export const PARK_POND={x:-150,z:72,rx:24,rz:13} as const;
/** Mown lawns (ellipses). */
export const PARK_LAWNS=[{x:-262,z:-150,rx:20,rz:12},{x:-150,z:-120,rx:22,rz:12},{x:-270,z:60,rx:18,rz:12}] as const;
type P=readonly [number,number];
/** Winding gravel paths: cubic Béziers [start, control 1, control 2, end] (the concept page's paths). */
export const PARK_PATHS:readonly (readonly [P,P,P,P])[]=[
 [[-205,-118],[-215,-150],[-165,-170],[-120,-195]],
 [[-205,58],[-185,80],[-245,95],[-262,100]],
 [[-273,-30],[-285,-40],[-295,20],[-300,30]],
 [[-140,-52],[-120,-110],[-100,-140],[-80,-160]],
 [[-140,-8],[-120,50],[-100,70],[-80,90]],
 [[-128,62],[-140,52],[-165,52],[-178,64]],
];
/** The ring path round the bowl (a rounded rectangle, 8 m out from the stands). */
export const BOWL_RING={x:STADIUM.x,z:STADIUM.z,w:STADIUM.bowlW+16,d:STADIUM.bowlL+16,r:40,width:5} as const;
/** Groves: where the park's trees cluster (centre, radius); a few more trees stand alone between them. */
const GROVES:readonly [number,number,number][]=[[-255,-185,30],[-160,-175,28],[-110,-120,22],[-290,-110,24],[-295,10,22],[-250,95,26],[-190,100,22],[-110,100,20],[-120,40,18],[-150,-80,16],[-280,-60,16]];
export const westParkMapData=()=>({stadium:STADIUM,gate:STADIUM_GATE,plaza:STADIUM_PLAZA,pond:PARK_POND,lawns:PARK_LAWNS,paths:PARK_PATHS,ring:BOWL_RING});

const bezier=([a,b,c,d]:readonly [P,P,P,P],t:number):P=>{const u=1-t;return [u*u*u*a[0]+3*u*u*t*b[0]+3*u*t*t*c[0]+t*t*t*d[0],u*u*u*a[1]+3*u*u*t*b[1]+3*u*t*t*c[1]+t*t*t*d[1]];};
const pathPoints=(curve:readonly [P,P,P,P],n=24)=>Array.from({length:n+1},(_,i)=>bezier(curve,i/n));
const ringPoints=()=>{const {x,z,w,d,r}=BOWL_RING,a=w/2-r,b=d/2-r,pts:P[]=[];
 for(const [cx,cz,a0] of [[a,b,0],[-a,b,Math.PI/2],[-a,-b,Math.PI],[a,-b,Math.PI*1.5]] as const)for(let i=0;i<=8;i++){const t=a0+i/8*Math.PI/2;pts.push([x+cx+Math.cos(t)*r,z+cz+Math.sin(t)*r]);}
 pts.push(pts[0]);return pts;};
const segDistance=(x:number,z:number,pts:readonly P[])=>{let best=Infinity;for(let i=0;i<pts.length-1;i++){const [ax,az]=pts[i],[bx,bz]=pts[i+1],dx=bx-ax,dz=bz-az,t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/(dx*dx+dz*dz||1)));best=Math.min(best,Math.hypot(x-ax-t*dx,z-az-t*dz));}return best;};
const ALL_PATHS=()=>[...PARK_PATHS.map(c=>pathPoints(c)),ringPoints()];
/** Inside the bowl's footprint (+ margin)? */
export const inStadiumFootprint=(x:number,z:number,margin=0)=>Math.abs(x-STADIUM.x)<STADIUM.bowlW/2+margin&&Math.abs(z-STADIUM.z)<STADIUM.bowlL/2+margin;

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
  const m=tintGroundMesh(put(g,color,0,y,0),kind);m.castShadow=false;return m;
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
 const paths=ALL_PATHS(),placed:P[]=[],local=obstacles.filter(o=>o.x<-90);
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
  const inGrove=GROVES.some(([gx,gz,gr])=>Math.hypot(x-gx,z-gz)<gr);
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

/** Placeholder bowl (phase 1): four low stepped stands with open corners and a gate gap in the east stand, a striped pitch with
 *  its markings and a gate arch. Phase 2 replaces the stands (walkable concourse, aisles, seats). Not walkable: one obstacle per
 *  stand block, so the pitch is reached through the gate or the corners. */
export function buildStadiumPlaceholder(t:Pick<Tools,'box'|'put'|'cylinder'|'sign'|'obstacles'|'surfaceAreas'>){
 const {box,put,cylinder,sign,obstacles,surfaceAreas}=t,S=STADIUM;
 const RISE=1.1,STEPS=4,seat=['#2f6f8f','#3b84a6'];
 // A stepped block: tiers climb away from the pitch along `out` (+1/-1 on the given axis).
 const stand=(cx:number,cz:number,along:number,depth:number,axis:'x'|'z',out:1|-1)=>{
  const step=depth/STEPS;
  for(let i=0;i<STEPS;i++){
   const h=(i+1)*RISE,offset=-depth/2+(i+.5)*step,ox=axis==='x'?offset*out:0,oz=axis==='z'?offset*out:0;
   const w=axis==='x'?step:along,d=axis==='x'?along:step;
   box(w,h,d,'#d8cfbd',cx+ox,h/2,cz+oz);
   box(axis==='x'?step*.55:along-1,.12,axis==='x'?along-1:step*.55,seat[i%2],cx+ox+(axis==='x'?-step*.15*out:0),h+.06,cz+oz+(axis==='z'?-step*.15*out:0));
  }
  // Back wall
  const bx=axis==='x'?cx+out*(depth/2+.3):cx,bz=axis==='z'?cz+out*(depth/2+.3):cz;
  box(axis==='x'?.6:along,STEPS*RISE+1.4,axis==='x'?along:.6,'#bfb39b',bx,(STEPS*RISE+1.4)/2,bz);
  obstacles.push({x:axis==='x'?cx+out*.3:cx,z:axis==='z'?cz+out*.3:cz,w:axis==='x'?depth+.6:along,d:axis==='x'?along:depth+.6});
 };
 const inner=40,longDepth=S.bowlW/2-inner,endInner=56,endDepth=S.bowlL/2-endInner,longAlong=104,endAlong=70;
 stand(S.x-inner-longDepth/2,S.z,longAlong,longDepth,'x',-1);
 // East stand in two halves round the gate.
 const gap=STADIUM_GATE.halfWidth,half=(longAlong/2-gap);
 for(const sz of [-1,1])stand(S.x+inner+longDepth/2,S.z+sz*(gap+half/2),half,longDepth,'x',1);
 stand(S.x,S.z-endInner-endDepth/2,endAlong,endDepth,'z',-1);
 stand(S.x,S.z+endInner+endDepth/2,endAlong,endDepth,'z',1);

 // Pitch: runoff, mown stripes, white markings (0.12 m lines).
 const W=S.pitchW,L=S.pitchL;
 surfaceAreas.push({kind:'pitch',x:S.x,z:S.z,w:W+8,d:L+8});
 tintGroundMesh(box(W+8,.05,L+8,'#6e9678',S.x,-.07,S.z),'grass');
 for(let i=0;i<10;i+=2)box(W,.008,L/10,'#78a083',S.x,-.04,S.z-L/2+(i+.5)*L/10).castShadow=false;
 const white='#f4f1e6',ln=.12,ly=-.034;
 const lineBox=(w:number,d:number,x:number,z:number)=>{box(w,.008,d,white,x,ly,z).castShadow=false;};
 for(const sx of [-1,1])lineBox(ln,L,S.x+sx*W/2,S.z);
 for(const sz of [-1,1])lineBox(W,ln,S.x,S.z+sz*L/2);
 lineBox(W,ln,S.x,S.z);
 {const g=new T.RingGeometry(8.6,8.72,48);g.rotateX(-Math.PI/2);put(g,white,S.x,ly+.004,S.z).castShadow=false;}
 for(const sz of [-1,1]){
  const goalZ=S.z+sz*L/2,box16=15.4,width16=38;
  lineBox(width16,ln,S.x,goalZ-sz*box16);for(const sx of [-1,1])lineBox(ln,box16,S.x+sx*width16/2,goalZ-sz*box16/2);
  lineBox(17,ln,S.x,goalZ-sz*5.2);for(const sx of [-1,1])lineBox(ln,5.2,S.x+sx*8.5,goalZ-sz*2.6);
  // Simple goal frames (placeholder; phase 3 hands the pitch to the match venue's own goals).
  for(const sx of [-1,1])cylinder(.07,2.3,white,S.x+sx*3.6,1.15,goalZ+sz*.1);
  box(7.3,.14,.14,white,S.x,2.3,goalZ+sz*.1);
 }

 // Gate arch on the east side, facing the plaza.
 const G=STADIUM_GATE,gx=G.x+1;
 for(const sz of [-1,1]){box(1.6,9,1.6,'#e2c766',gx,4.5,G.z+sz*(G.halfWidth+.4));obstacles.push({x:gx,z:G.z+sz*(G.halfWidth+.4),w:1.6,d:1.6});}
 box(1.4,1.6,G.halfWidth*2+3.2,'#e2c766',gx,9.6,G.z);
 sign('STADIUM',G.halfWidth*2-1,1.3,gx+.72,9.6,G.z,'#244d49','#fff0cf',Math.PI/2);
}
