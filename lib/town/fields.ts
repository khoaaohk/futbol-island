import * as T from 'three';
import {takeSandDrifts,takeSandNormals} from './grounding';
import {SEVEN_PENALTY_DEPTH,sevenBuildOutLocalZ} from './buildOut';
import {createFieldLighting} from './fieldLighting';
import {ISLAND_SHORE,SHORE_SAND,shoreSandWidth,INTERIOR_GRASS,INTERIOR_GRASS_COLOR} from './shoreline';
import {applyGroundTint} from '../graphics/groundTint';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {VENUES,FIELD_SURFACE_Y,type Venue} from './venues';
import {GOAL_DEPTH,goalPostRadius} from './goalCollisions';
import type {PropSpec} from '../graphics/propReactions';
import {westLawnPatch,mergeLawnPatch} from './westTerrain';
import {depthLawn,depthLowTier,depthStats} from './townDepth';
import {surfOn,mainLawnEdges} from './surfaceEdges';
import {stripePlan,stripedSlabGeometry,type StripePlan} from '../graphics/pitchStripes';
/** Mowing pattern per ground: about 5 m bands goal to goal, sized so the penalty-area edge sits as close to a band edge as it can
 * (exactly on Eleven Park, whose 5.5 m and 16.5 m box edges both land on band edges). Eleven Park also gets a fainter cross-mown pass (the stadium chequerboard). Futsal (hard court) has none. */
export function pitchStripePlan(v:Pick<Venue,'id'|'length'|'width'>):StripePlan|null{
 if(v.id==='futsal')return null;
 // Penalty-area depths as drawn below (fields.ts markings).
 const boxDepth=v.id==='11v11'?16.5:v.id==='9v9'?13:SEVEN_PENALTY_DEPTH;
 return stripePlan(v.length,{boxDepth,lanesWidth:v.id==='11v11'?v.width:undefined});
}
/** One goal's frame (round posts, crossbar and the back frame, merged) and net (line pairs), in venue-local metres: the goal line at
z = side × length/2, the frame's foot at `base`. Shared by the island pitches (below) and the DRIP FC Stadium (the west stadium) (stadiumWorld.ts). */
export function goalGeometry(v:Pick<Venue,'goalWidth'|'goalHeight'|'length'>&{id:string},side:number,base:number){
 const l=v.length/2;
 const goalPts:number[]=[];const line=(a:number[],b:number[])=>goalPts.push(...a,...b);
 const gw=v.goalWidth/2,h=base+v.goalHeight,z=side*l,back=z+side*GOAL_DEPTH;
 // Solid round posts and crossbar read independently from the finer netting.
 const tubes:T.BufferGeometry[]=[];
 const tube=(a:number[],b:number[],radius:number)=>{const from=new T.Vector3(...a),to=new T.Vector3(...b),g=new T.CylinderGeometry(radius,radius,from.distanceTo(to),10);g.applyMatrix4(new T.Matrix4().compose(from.clone().add(to).multiplyScalar(.5),new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),to.sub(from).normalize()),new T.Vector3(1,1,1)));tubes.push(g);};
 const radius=goalPostRadius(v.id);
 for(const x of [-gw,gw]){
  tube([x,base,z],[x,h,z],radius);tube([x,base+.035,z],[x,base+.035,back],.035);
  tube([x,base,back],[x,h-.12,back],.035);tube([x,h,z],[x,h-.12,back],.035);
 }
 tube([-gw,h,z],[gw,h,z],radius);tube([-gw,base+.035,back],[gw,base+.035,back],.035);
 tube([-gw,h-.12,back],[gw,h-.12,back],.035);
 const cols=Math.ceil(v.goalWidth/.25),rows=Math.ceil(v.goalHeight/.25);
 for(let i=0;i<=cols;i++){const x=-gw+i*v.goalWidth/cols;line([x,base,back],[x,h-.12,back]);line([x,h,z],[x,h-.12,back]);}
 for(let i=0;i<=rows;i++){const y=base+i*v.goalHeight/rows;line([-gw,Math.min(y,h-.12),back],[gw,Math.min(y,h-.12),back]);for(const x of [-gw,gw])line([x,y,z],[x,Math.min(y,h-.12),back]);}
 for(const x of [-gw,gw])for(let i=1;i<6;i++){const t=i/6,zz=z+(back-z)*t;line([x,base,zz],[x,h-.12*t,zz]);}
 const frame=mergeGeometries(tubes)!;tubes.forEach(g=>g.dispose());
 const net=new T.BufferGeometry();net.setAttribute('position',new T.Float32BufferAttribute(goalPts,3));
 return {frame,net};
}
/** Triangles the west side's raised ground added to the main lawn (0 with elevation off): the heat notes read it. */
export let westLawnTriangles=0;
/** Grounding (lib/town/grounding.ts): sand drifted against the beach's walls and platforms joins the sand ribbon (its own material,
 *  ripples and shadow; 0 draws). aShore 40 = dry sand (no wet band). Nothing to add with ?ground=0 or on the lowest tier. */
function withSandDrifts(g:T.BufferGeometry){const d=takeSandDrifts();if(!d.length)return g;const base=g.getAttribute('position').count,n=d.length/3;
 const pos=new Float32Array((base+n)*3),shore=new Float32Array(base+n),idx:number[]=Array.from(g.index!.array as ArrayLike<number>);
 pos.set(g.getAttribute('position').array as Float32Array);pos.set(d,base*3);shore.set(g.getAttribute('aShore').array as Float32Array);shore.fill(40,base);for(let i=0;i<n;i++)idx.push(base+i);
 const out=new T.BufferGeometry();out.setAttribute('position',new T.BufferAttribute(pos,3));out.setAttribute('aShore',new T.BufferAttribute(shore,1));out.setIndex(idx);out.computeVertexNormals();
 // drift normals lean only a little off vertical: the shadow map's normal offset (2 texels, ~0.5-1 m here) pushed a sloped drift's
 // lookup out of the eave / wall shadow and the drift glowed as a pale apron (shots/north-close-a3); near-up normals keep the shadow
 {const nr=out.getAttribute('normal') as T.BufferAttribute,own=takeSandNormals();for(let i=base;i<base+n;i++){const j=(i-base)*3;if(own.length>j+2&&(own[j]||own[j+1]||own[j+2])){nr.setXYZ(i,own[j],own[j+1],own[j+2]);continue;}/* palm / post mounds: their own smooth normals (grounding.ts sandMound) */const x=nr.getX(i)*.3,y=nr.getY(i)*.3+.7,z=nr.getZ(i)*.3,l=Math.hypot(x,y,z);nr.setXYZ(i,x/l,y/l,z/l);}}
 g.dispose();return out;}
export function buildFormatFields(scene:T.Scene,lawnCell:2|4=2){
 const roots=new Map<string,T.Group>(),goalSpecs:PropSpec[]=[];const surfaces=new Map<string,T.MeshStandardMaterial>();const owned:(T.Material|T.BufferGeometry)[]=[];
 const cream=new T.LineBasicMaterial({color:'#f5eed5'});owned.push(cream);
 const frameMaterial=new T.MeshStandardMaterial({color:'#fff6df',roughness:.48});
 const netMaterial=new T.LineBasicMaterial({color:'#c6d4cc',transparent:true,opacity:.68});owned.push(frameMaterial,netMaterial);
 for(const v of VENUES){const root=new T.Group();root.name='venue-'+v.id;root.position.set(v.x,v.elevation??0,v.z);scene.add(root);roots.set(v.id,root);
 // Grass grounds carry mowing stripes in vertex colours (pitchStripes.ts): same one draw, and the vertex-colour program the
 // batched island paint already compiled. The rooftop futsal court is hard court: no stripes, unchanged material.
 const plan=pitchStripePlan(v);
 const material=new T.MeshStandardMaterial({color:v.surface,roughness:.94,vertexColors:Boolean(plan)});const geom=plan?stripedSlabGeometry(v.width+6,.14,v.length+6,plan,v.width,v.length):new T.BoxGeometry(v.width+6,.14,v.length+6);owned.push(material,geom);surfaces.set(v.id,material);const surface=new T.Mesh(geom,material);surface.name='pitch-surface';surface.position.y=FIELD_SURFACE_Y-.07;surface.receiveShadow=true;root.add(surface);
 const pts:number[]=[];const seg=(a:number,b:number,c:number,d:number)=>pts.push(a,.115,b,c,.115,d);const w=v.width/2,l=v.length/2;
 const rect=(x:number,z:number,width:number,length:number)=>{seg(x-width/2,z-length/2,x+width/2,z-length/2);seg(x+width/2,z-length/2,x+width/2,z+length/2);seg(x+width/2,z+length/2,x-width/2,z+length/2);seg(x-width/2,z+length/2,x-width/2,z-length/2);};
 const arc=(x:number,z:number,r:number,start=0,end=Math.PI*2)=>{for(let i=0;i<48;i++){const a=start+(end-start)*i/48,b=start+(end-start)*(i+1)/48;seg(x+Math.cos(a)*r,z+Math.sin(a)*r,x+Math.cos(b)*r,z+Math.sin(b)*r);}};
 rect(0,0,v.width,v.length);seg(-w,0,w,0);arc(0,0,v.id==='futsal'?3:v.id==='11v11'?9.15:Math.min(7,v.width*.15));
 if(v.id==='7v7')for(const side of [-1,1] as const){
  const z=sevenBuildOutLocalZ(side);
  // Physical dash segments join the existing one-draw-call pitch markings.
  for(let x=-w;x<w;x+=1.5)seg(x,z,Math.min(x+.9,w),z);
 }
 for(const side of [-1,1]){
 if(v.id==='futsal'){const end=side*l;for(const hand of [-1,1]){const center=hand*1.5;const start=side<0?(hand<0?Math.PI/2:0):(hand<0?Math.PI:Math.PI*1.5);arc(center,end,6,start,start+Math.PI/2);}seg(-1.5,end-side*6,1.5,end-side*6);}
 else{const depth=v.id==='11v11'?16.5:v.id==='9v9'?13:SEVEN_PENALTY_DEPTH,width=v.id==='11v11'?40.32:v.id==='9v9'?29:23;rect(0,side*(l-depth/2),width,depth);rect(0,side*(l-2.5),v.goalWidth+8,5);}
 const goal=new T.Group();goal.name='goal-'+v.id+'-'+side;root.add(goal);
 const {frame:frameGeo,net:netGeo}=goalGeometry(v,side,FIELD_SURFACE_Y);owned.push(frameGeo,netGeo);
 const frame=new T.Mesh(frameGeo,frameMaterial);frame.name='solid-goal-frame';frame.castShadow=true;frame.receiveShadow=true;goal.add(frame);
 const net=new T.LineSegments(netGeo,netMaterial);net.name='goal-net';goal.add(net);
 // Kick reaction (lib/graphics/propReactions.ts): a shot off the frame billows the nearby net; the frame only shivers.
 {frameGeo.computeBoundingBox();netGeo.computeBoundingBox();const b=frameGeo.boundingBox!.clone().union(netGeo.boundingBox!),o=root.position,frameAttr=frameGeo.getAttribute('position') as T.BufferAttribute,netAttr=netGeo.getAttribute('position') as T.BufferAttribute;
  goalSpecs.push({kind:'goal',offset:{x:o.x,y:o.y,z:o.z},min:{x:b.min.x+o.x,y:b.min.y+o.y,z:b.min.z+o.z},max:{x:b.max.x+o.x,y:b.max.y+o.y,z:b.max.z+o.z},parts:[{attribute:frameAttr,start:0,count:frameAttr.count,gain:.12},{attribute:netAttr,start:0,count:netAttr.count}]});}}

 const lineGeo=new T.BufferGeometry();lineGeo.setAttribute('position',new T.Float32BufferAttribute(pts,3));owned.push(lineGeo);root.add(new T.LineSegments(lineGeo,cream));
 }
 const outline=new T.Shape();ISLAND_SHORE.forEach((p,i)=>i?outline.lineTo(p.x,-p.z):outline.moveTo(p.x,-p.z));outline.closePath();
 const landMat=applyGroundTint(new T.MeshStandardMaterial({color:'#f1d6a1',roughness:1}/* the sand colour: the land base is the inner beach band (user Oct 17 2026) */),'land'),landGeo=new T.ExtrudeGeometry(outline,{depth:.64,bevelEnabled:false,steps:1});owned.push(landMat,landGeo);const land=new T.Mesh(landGeo,landMat);land.name='curved-island-foundation';land.rotation.x=-Math.PI/2;land.position.y=-.82;land.receiveShadow=true;scene.add(land);

 // Keep 6.8 cm between the lawn and foundation top: the former 8 mm gap
 // was vulnerable to depth fighting at shallow flight angles. Roads/sand stay in place.
 const lawnShape=new T.Shape();INTERIOR_GRASS.forEach((p,i)=>i?lawnShape.lineTo(p.x,-p.z):lawnShape.moveTo(p.x,-p.z));lawnShape.closePath();
 // Town kerb depth (?depth=1, townDepth.ts; null with the flag off): the sunk carriageway lies BELOW this lawn, so the lawn is cut
 // out under it (the street network is one hole, each city block inside it its own shape), and the raised verge beside every
 // pavement joins the same geometry (0 draws).
 let softRim:number[]=[],softMid:number[]=[],softIn:number[]=[];
 const depth=depthLawn(null,depthLowTier(),surfOn()),ring=(pts:{x:number;z:number}[],into:T.Path)=>{pts.forEach((p,i)=>i?into.lineTo(p.x,-p.z):into.moveTo(p.x,-p.z));into.closePath();return into;};
 if(depth)for(const h of depth.holes)lawnShape.holes.push(ring(h,new T.Path()));
 let lawnGeo:T.BufferGeometry=new T.ShapeGeometry(depth&&depth.blocks.length?[lawnShape,...depth.blocks.map(b=>ring(b,new T.Shape()) as T.Shape)]:lawnShape);lawnGeo.rotateX(-Math.PI/2);
 if(depth&&depth.patch.triangles){const p=depth.patch,g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p.position,3));g.setIndex(p.index);g.computeVertexNormals();
  const merged=mergeLawnPatch(lawnGeo,{position:p.position,normal:Array.from(g.getAttribute('normal').array),uv:new Array(p.position.length/3*2).fill(0),index:p.index,triangles:p.triangles} as Parameters<typeof mergeLawnPatch>[1]);g.dispose();lawnGeo.dispose();lawnGeo=merged;
  if(depthStats.value)depthStats.value.verge=p.triangles;
  if(surfOn()){const base=merged.getAttribute('position').count-p.position.length/3;softRim=depth.rim.map(i=>i+base);softMid=depth.rimMid.map(i=>i+base);softIn=depth.rimIn.map(i=>i+base);}}
 // Elevation (?elev=1, westTerrain.ts): the west side's raised ground joins this same geometry (0 draws); the flat lawn stays under it.
 {const patch=westLawnPatch(lawnCell);if(patch){const merged=mergeLawnPatch(lawnGeo,patch);lawnGeo.dispose();lawnGeo=merged;westLawnTriangles=patch.triangles;}}
 // Surface craft (?surf=1, surfaceEdges.ts): the soft lawn rim (sand side), the lips along the paths and the verge's rim over the
 // town's paving join this same geometry with a per-vertex edge value (0 everywhere else); 0 draws, same material and program.
 {const e=mainLawnEdges(depthLowTier());if(e){let g=lawnGeo;const base=g.getAttribute('position').count;
  if(e.triangles){const count=e.position.length/3,up=new Array(count*3).fill(0);for(let i=1;i<up.length;i+=3)up[i]=1;g=mergeLawnPatch(lawnGeo,{position:e.position,normal:up,uv:new Array(count*2).fill(0),index:e.index,triangles:e.triangles} as Parameters<typeof mergeLawnPatch>[1]);lawnGeo.dispose();lawnGeo=g;}
  const a=new Float32Array(g.getAttribute('position').count*2);a.set(e.edge,base*2);for(const i of softRim){a[i*2]=1;a[i*2+1]=1;}/* the fade runs on into the lawn (paving beyond: the soft blend) */for(const i of softMid){a[i*2]=.24;a[i*2+1]=1;}for(const i of softIn)a[i*2+1]=1;g.setAttribute('aEdge',new T.Float32BufferAttribute(a,2));}}
 const lawnMat=applyGroundTint(new T.MeshStandardMaterial({color:INTERIOR_GRASS_COLOR,roughness:.94}),'grass');owned.push(lawnGeo,lawnMat);
 const lawn=new T.Mesh(lawnGeo,lawnMat);lawn.name='interior-island-grass';lawn.position.y=-.112;lawn.receiveShadow=true;scene.add(lawn);

 // A continuous sand ribbon follows the coast, including the sheltered inlet. Its outer edge rounds over and slopes into the
 // sea (Oct 12 2026, "some of the edges are not looking great. there's gaps"): one continuous surface from the beach down past
 // the waterline, like the cay's skirt, instead of the vertical foundation step under a row of separate pale cylinders, so the
 // moving shoreline (lib/graphics/islandShore.ts) has a real slope to wash up and the waterline is one smooth curve.
 // Rows per coast point, sea to land: below the water, the rounded edge on the outline, 0.5 m in, then the inner edge.
 const sandPositions:number[]=[],sandShore:number[]=[],sandIndices:number[]=[],SAND_ROWS=4,SKIRT=1.4,n=ISLAND_SHORE.length;
 ISLAND_SHORE.forEach((p,i)=>{const prev=ISLAND_SHORE[(i+n-1)%n],next=ISLAND_SHORE[(i+1)%n],dx=next.x-prev.x,dz=next.z-prev.z,length=Math.hypot(dx,dz),ox=dz/length,oz=-dx/length;const width=shoreSandWidth(p);
 for(const [o,y] of [[SKIRT,-.5],[0,-.125],[-.5,-.105]]){sandPositions.push(p.x+ox*o,y,p.z+oz*o);sandShore.push(-o);}
 {const q=SHORE_SAND[i].inner;sandPositions.push(q.x,-.105,q.z);sandShore.push(Math.min(width,Math.hypot(q.x-p.x,q.z-p.z)));}// the untangled inner edge (shoreline.ts): no fold, no coplanar layers// aShore: metres inland of the outline, for the wet band (groundTint.ts 'beach')
 const a=i*SAND_ROWS,b=((i+1)%n)*SAND_ROWS;for(let r=0;r<SAND_ROWS-1;r++)sandIndices.push(a+r,b+r,a+r+1,b+r,b+r+1,a+r+1);
 });
 const sandGeo=new T.BufferGeometry();sandGeo.setAttribute('position',new T.Float32BufferAttribute(sandPositions,3));sandGeo.setAttribute('aShore',new T.Float32BufferAttribute(sandShore,1));sandGeo.setIndex(sandIndices);sandGeo.computeVertexNormals();const sandMat=applyGroundTint(new T.MeshStandardMaterial({color:'#f1d6a1',roughness:1,side:T.DoubleSide}),'beach');owned.push(sandGeo,sandMat);const sand=new T.Mesh(withSandDrifts(sandGeo),sandMat);sand.name='continuous-sandy-shore';sand.receiveShadow=true;scene.add(sand);
 const floodlights=createFieldLighting(scene,roots,surfaces,frameMaterial,cream);
 return {roots,propSpecs:[...goalSpecs,...floodlights.propSpecs],updateLighting:floodlights.update,setIsolated(isolated:boolean){land.receiveShadow=!isolated;sand.receiveShadow=!isolated;lawn.receiveShadow=!isolated;},dispose(){floodlights.dispose();for(const root of roots.values())root.removeFromParent();land.removeFromParent();sand.removeFromParent();lawn.removeFromParent();for(const item of owned)item.dispose();}};
}
