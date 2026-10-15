// Summit Isle scenery (Oct 12 2026): the island's ground (one smooth vertex-coloured terrain: beach, grassy foothills and concave
// slopes, a cliff band with rock strata and three trail ledges, winding paths), its slim sandbar to Coral Cay, and the Summit 5s
// pitch on the summit. Built inside buildTown so every piece joins the
// 50 m spatial batches: the ground pieces share ONE vertex-colour material (same shader program as the batched palette paint, no
// shadows cast), and trees, rocks, the fence, goals and nets are baked into a few more vertex-coloured meshes (see "Baked props").
// No animation, no per-frame work; world.ts hides the island's chunks with one frustum-box test when it is out of view.
// Shapes: summitIsle.ts.
import * as T from 'three';
import {trunkCollider,bushCollider,type Obstacle} from './simulation';
import {INTERIOR_GRASS_COLOR} from './shoreline';
import {stripePlan,stripedSlabGeometry} from '../graphics/pitchStripes';
import {untaggedProp,type PropTagger} from '../graphics/propReactions';
import {ORCHARD_OFF,planOrchard,orchardParts,orchardRig,roundTreeRig,palmRig,type TreeRig,type OrchardForm} from './summitOrchard';
import type {FruitKind} from './summitForage';
import {SUMMIT_HUTS,SUMMIT_HUT_RADIUS,SUMMIT_CAVES,CAVE_SIDE,CAVE_BACK,RIDDLE_BOARD,HUT_WALL,HUT_CONE,HUT_CONE_LIFT,hutGroundTop} from './summitBalls';
import {SUMMIT_CENTER,SUMMIT_HEIGHT,SUMMIT_VISUAL_DROP,SUMMIT_PITCH,SUMMIT_FENCE,SUMMIT_OBSTACLES,SUMMIT_PATHS,SUMMIT_PATH_WIDTH,SUMMIT_LANDMARKS,SANDBAR_PATH,SANDBAR_SKIRT,
 SUMMIT_PEAK,TERRACE,PITCH_HEIGHT,coastRadius,peakCoastRadius,beachWidth,summitGround,summitSlope,ridgeShade,terraceWeight,heightPoint,profileU,peakPoint,sandbarHalfWidth,onSummitIsle,summitTrailDistance,SUMMIT_TRAIL_CARVE,
 isleJitter as jitter,type IslePoint} from './summitIsle';

type Mesh=T.Mesh;
export type SummitTools={
 box:(w:number,h:number,d:number,c:string,x:number,y:number,z:number)=>Mesh;
 cylinder:(r:number,h:number,c:string,x:number,y:number,z:number)=>Mesh;
 sign:(text:string,w:number,h:number,x:number,y:number,z:number,bg?:string,ink?:string,rotation?:number)=>Mesh;
 /** The scene group the batching pass collects from (world.ts `town`). */
 town:T.Group;
 obstacles:Obstacle[];
 assets:{kind:string;x:number;z:number;w:number;d:number;visualW?:number;visualD?:number;canopyHeight?:number;baseY?:number}[];
 surfaceAreas:{kind:string;x:number;z:number;w:number;d:number}[];
 prop?:PropTagger;
};
/** Night light pools (world.ts lamp sites): offshore like the cay's, so they share its region tag. */
export type SummitLampSite={x:number;z:number;ground:number;region:'coral-cay';poolWidth?:number;poolDepth?:number};

/** Bearings round the island (1.875° apart) and terrain pieces (angular sectors, each its own 50 m batch and cull bound). */
const BEARINGS=192,SECTORS=8,SKIRT=2.8,FINE=2.5,FINE_ERR=.25;
/** Rings per bearing round the peak: the beach (5) and, from the dune line to the summit, rings at even height steps of the
 *  profile (sparse on the flat foothills, dense on the steep upper slopes and the rounded top where the silhouette is). With 192
 *  bearings that is ~2 m across each spur and gully on the slopes. Heat: detail only where it shows. */
const SLOPE_H=[0,.012,.03,.06,.1,.15,.21,.28,.35,.42,.49,.56,.63,.7,.76,.82,.87,.91,.945,.97,.988,1];
const C=SUMMIT_CENTER,H=SUMMIT_HEIGHT,DROP=SUMMIT_VISUAL_DROP;
const col=(hex:string)=>new T.Color(hex);
const SAND=col('#f1d6a1'),WET=col('#dfc99e'),GRASS=col(INTERIOR_GRASS_COLOR),GRASS_LIGHT=col('#7fa36f'),GRASS_DARK=col('#5f8a68'),SCRUB=col('#4c7550'),ROCK=col('#8e8b80'),ROCK_LIGHT=col('#a8a397'),ROCK_DARK=col('#6f6a60'),LEDGE=col('#8a8763'),CREST=col('#8fae6a'),PATH=col('#c4c39c'),LINE=col('#f5eed5');

/** Trail ribbon: a cross-section every PATH_STEP m with vertices at these fractions of the half-width, PATH_LIFTS m over the drawn
 *  terrain (or over its highest point within PATH_REACH m). */
const PATH_STEP=1,PATH_ACROSS=[-1,-.5,0,.5,1],PATH_REACH=.3;
/** Lift per path: the climb on top where the others run into it (no flicker where two ribbons overlap). */
const PATH_LIFTS=[.045,.06,.035];
/** A polyline resampled every `step` m along its length (its own points kept where they fall; ends exact). */
function resamplePath(path:IslePoint[],step:number):IslePoint[]{
 const out:IslePoint[]=[path[0]];
 for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i],l=Math.hypot(b.x-a.x,b.z-a.z),k=Math.max(1,Math.ceil(l/step));for(let j=1;j<=k;j++)out.push({x:a.x+(b.x-a.x)*j/k,z:a.z+(b.z-a.z)*j/k});}
 return out;
}
/** A growing vertex-coloured triangle list (positions relative to an origin). */
class Piece{
 pos:number[]=[];nor:number[]=[];colr:number[]=[];idx:number[]=[];
 /** The tree each vertex belongs to (SUMMIT_TREE_SITES tid; 0 = not a tree): the shaken tree's sway (SUMMIT_TREE_SWAY). */
 tree:number[]=[];tid=0;
 constructor(public ox:number,public oz:number){}
 vertex(x:number,y:number,z:number,c:T.Color,n:[number,number,number]=[0,1,0]){this.pos.push(x-this.ox,y,z-this.oz);this.nor.push(...n);this.colr.push(c.r,c.g,c.b);this.tree.push(this.tid);return this.pos.length/3-1;}
 tri(a:number,b:number,c:number){this.idx.push(a,b,c);}
 /** A quad strip (a, b) × (c, d) facing up. */
 quad(a:number,b:number,c:number,d:number){this.idx.push(a,c,b,b,c,d);}
 geometry(){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(this.pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(this.nor,3));g.setAttribute('color',new T.Float32BufferAttribute(this.colr,3));
  if(this.tree.some(t=>t>0))g.setAttribute('aTree',new T.Float32BufferAttribute(this.tree,1));g.setIndex(this.idx);g.computeBoundingSphere();return g;}
}

/** Every tree and palm the build bakes (refilled by each build): Summit Isle's fruit trees are picked from these
 *  (lib/town/summitForage.ts; lib/graphics/fruitTrees.ts copies a picked tree's canopy for its shake, so keep the two in step). */
export type SummitTreeSite={kind:'tree'|'palm';x:number;z:number;y:number;size:number;seed:number;top:{x:number;y:number;z:number};
 /** Its id in the baked props' `aTree` attribute (index + 1), the foraging rig (grip, crown, sway) and, for the orchard's plants
  *  (lib/town/summitOrchard.ts), its form and fruit. */
 tid:number;rig:TreeRig;form?:OrchardForm;fruit?:FruitKind};
export const SUMMIT_TREE_SITES:SummitTreeSite[]=[];
/** Every rock and boulder the build bakes (headlands, crests, the terrace banks, the lookout cairn, the caves): centre, horizontal
 *  reach (m) and top. tests/summit-balls.cjs checks each one bigger than a pebble has a collider covering its footprint. */
export type SummitRockSite={x:number;z:number;reach:number;top:number};
export const SUMMIT_ROCK_SITES:SummitRockSite[]=[];
/** Rocks smaller than this (horizontal reach, m) are pebbles you walk over; anything bigger blocks. */
export const SUMMIT_PEBBLE=.5;
const rockSite=(x:number,z:number,reach:number,top:number)=>{SUMMIT_ROCK_SITES.push({x,z,reach,top});};
/**
 * The shake (Oct 14 2026, user: "fix the animation of shaking to actually touch the tree"): ONE tree of the baked props sways in
 * the vertex shader (no shell mesh, no extra draw): every vertex whose `aTree` is `tree` turns about `pivot` (the trunk's base)
 * round the horizontal `axis` by `angle` × (height over the base / `height`)^`bend` (palms and papayas bend more at the top).
 * lib/graphics/fruitTrees.ts drives it while a shake settles and sets `angle` back to 0 (the branch is skipped at rest).
 */
export const SUMMIT_TREE_SWAY={tree:{value:0},pivot:{value:new T.Vector3()},axis:{value:new T.Vector3(1,0,0)},angle:{value:0},height:{value:5},bend:{value:1}};
/** The sway's weight at height `dy` over the trunk's base (the shader's formula, for the hanging fruit on the CPU). */
export const swayWeight=(dy:number,height:number,bend:number)=>Math.pow(Math.max(0,Math.min(1,dy/Math.max(.1,height))),bend);
function swayShader(mat:T.MeshStandardMaterial){
 mat.customProgramCacheKey=()=>'summit-tree-sway';
 mat.onBeforeCompile=sh=>{const U=SUMMIT_TREE_SWAY;Object.assign(sh.uniforms,{uSwayTree:U.tree,uSwayPivot:U.pivot,uSwayAxis:U.axis,uSwayAngle:U.angle,uSwayHeight:U.height,uSwayBend:U.bend});
  sh.vertexShader=sh.vertexShader.replace('#include <common>',`#include <common>
attribute float aTree;uniform float uSwayTree;uniform vec3 uSwayPivot;uniform vec3 uSwayAxis;uniform float uSwayAngle;uniform float uSwayHeight;uniform float uSwayBend;`)
   .replace('#include <begin_vertex>',`#include <begin_vertex>
if(uSwayAngle!=0.0&&abs(aTree-uSwayTree)<.5){vec3 off=modelMatrix[3].xyz,p=transformed+off-uSwayPivot;
 float a=uSwayAngle*pow(clamp(p.y/max(.1,uSwayHeight),0.,1.),uSwayBend),c=cos(a),s=sin(a);
 p=p*c+cross(uSwayAxis,p)*s+uSwayAxis*dot(uSwayAxis,p)*(1.-c);transformed=p+uSwayPivot-off;}`);};
}
export function buildSummitIsle(t:SummitTools){
 const {box,cylinder,sign,town,obstacles,assets,surfaceAreas}=t,prop=t.prop??untaggedProp;
 SUMMIT_TREE_SITES.length=0;SUMMIT_ROCK_SITES.length=0;
 const lampSites:SummitLampSite[]=[];
 // ONE material for every ground piece (terrain, plateau, pitch, lines, paths, sandbar): vertex colours, no texture, no emissive,
 // so it compiles to the same program as the island's batched palette paint. Ground casts no shadows (it only receives them).
 const groundMat=new T.MeshStandardMaterial({color:'#ffffff',vertexColors:true,roughness:.95});groundMat.name='summit-isle-ground';
 const ground=(piece:Piece,name:string)=>{if(!piece.idx.length)return;const m=new T.Mesh(piece.geometry(),groundMat);m.name=name;m.position.set(piece.ox,0,piece.oz);m.castShadow=false;m.receiveShadow=true;town.add(m);};
 const V=(x:number,y:number,z:number)=>new T.Vector3(x,y,z);
 const yAt=(x:number,z:number)=>summitGround(x,z)-DROP;

 // ---- Terrain grid: bearings round the peak × rings, from the skirt under the sea, over the beach and up the slopes to the summit.
 // Heights come straight from summitGround (ridges, the terrace, the carved trails), so the walked height matches the mesh.
 // Built once as a whole (positions, colours, smooth normals across sector seams), then cut into angular sectors.
 const R=5+SLOPE_H.length;
 const P:number[][]=[],Y:number[][]=[],CL:T.Color[][]=[];
 const PK=SUMMIT_PEAK;
 for(let i=0;i<BEARINGS;i++){const a=i/BEARINGS*Math.PI*2,rc=peakCoastRadius(a),bw=beachWidth(a),dx=Math.cos(a),dz=Math.sin(a);
  const pr:number[]=[],yr:number[]=[],cr:T.Color[]=[];
  const push=(r:number,y:number,c:T.Color)=>{pr.push(PK.x+dx*r,PK.z+dz*r);yr.push(y);cr.push(c);};
  // Beach: wet skirt under the water, sand towards the dune line.
  [-SKIRT,0,bw*.4,bw*.8,bw*.93].forEach((sd,k)=>{const r=rc-sd,x=PK.x+dx*r,z=PK.z+dz*r;push(r,sd<0?-.47:summitGround(x,z)-DROP,sd<0?WET.clone():sd<.01?WET.clone().lerp(SAND,.35):SAND.clone().multiplyScalar(.97+.05*jitter(i,k)));});
  // Slopes: rings at even height steps of the smooth profile, from the dune line (f 0) to the summit (f 1).
  for(const f of SLOPE_H){const u=f>=1?0:f<=0?1:profileU(.32+(SUMMIT_HEIGHT-.32)*f),r=f>=1?0:u*(rc-bw),x=PK.x+dx*r,z=PK.z+dz*r,h=summitGround(x,z);
   // Mostly green: lighter meadow on gentle ground, darker in the gullies (a cheap ambient occlusion from the ridge noise),
   // a deeper green higher up, and bare rock only on the steepest crests near the top and on the terrace's cut banks.
   const slope=summitSlope(x,z),shade=ridgeShade(x,z),patch=.5+.5*Math.sin(3*a+f*5+.8)*Math.sin(2*a-f*4),onTerrace=terraceWeight(x,z);
   const c=GRASS.clone().lerp(GRASS_LIGHT,.55*(1-smoothstep(.15,.45,slope))*(.6+.4*patch)).lerp(SCRUB,.4*smoothstep(18,42,h));
   // Gullies darker, crests a touch yellow-green; the terrace's cut banks a deeper green (never bare earth).
   c.multiplyScalar(.74+.36*shade).lerp(CREST,.35*smoothstep(.62,.9,shade));
   if(onTerrace>0&&onTerrace<.999)c.lerp(SCRUB,.5*smoothstep(.5,1.1,slope));
   // Only tiny grey accents on the very steepest high crests.
   const rock=smoothstep(1.05,1.4,slope)*smoothstep(42,52,h)*smoothstep(.6,.8,shade);
   if(rock>0)c.lerp(ROCK_LIGHT,Math.min(.6,rock));
   if(onTerrace>=1)c.copy(GRASS);
   push(r,h-DROP,c);}
  P.push(pr);Y.push(yr);CL.push(cr);}
 const pos=(i:number,k:number)=>{const ii=(i+BEARINGS)%BEARINGS;return [P[ii][k*2],Y[ii][k],P[ii][k*2+1]] as const;};
 // Smooth normals from the grid's neighbours (wrapping round the bearings), so sector seams never show a lighting line. (ring
 // direction × bearing direction): up on flat ground, outward on the walls; a zero vector (a landing's merged points) falls back.
 const normal=(i:number,k:number):[number,number,number]=>{
  const a=pos(i-1,k),b=pos(i+1,k),c=pos(i,Math.max(0,k-1)),d=pos(i,Math.min(R-1,k+1));
  const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=d[0]-c[0],vy=d[1]-c[1],vz=d[2]-c[2];
  const nx=vy*uz-vz*uy,ny=vz*ux-vx*uz,nz=vx*uy-vy*ux,l=Math.hypot(nx,ny,nz);return l>1e-6?[nx/l,ny/l,nz/l]:[0,1,0];};
 // The trail corridor drawn finer (Oct 13 2026): the trails are carved into the walked ground (a level 3.4 m tread, banks out to
 // SUMMIT_TRAIL_CARVE m), which the coarse grid above cannot show: there the drawn slope stood up to ~1.6 m off the walked height,
 // burying the path and the rider in it. Every grid quad the carve reaches is split into ~FINE m cells at the walked height
 // (summitGround), with true-ground normals; along an edge shared with an unsplit quad its points sit on that quad's straight edge
 // (no cracks). Colours interpolate the quad's corners, so the look is unchanged. ~9k triangles, built once.
 const fine:boolean[][]=Array.from({length:BEARINGS},(_,i)=>Array.from({length:R-1},(_,k)=>{if(k<1)return false;
  // Only where the carve is and the coarse quad misses it by more than FINE_ERR m (sampled 5 × 5 over its two triangles).
  const a=pos(i,k),b=pos(i+1,k),c=pos(i,k+1),d=pos(i+1,k+1);
  for(let u=0;u<=4;u++)for(let v=0;v<=4;v++){const fu=u/4,fv=v/4,x=(a[0]*(1-fu)+b[0]*fu)*(1-fv)+(c[0]*(1-fu)+d[0]*fu)*fv,z=(a[2]*(1-fu)+b[2]*fu)*(1-fv)+(c[2]*(1-fu)+d[2]*fu)*fv;
   if(summitTrailDistance(x,z)>=SUMMIT_TRAIL_CARVE+.5)continue;
   // The drawn height there: triangle (a, c, b) when fu + fv ≤ 1, else (b, c, d).
   const y=fu+fv<=1?a[1]+(b[1]-a[1])*fu+(c[1]-a[1])*fv:d[1]+(c[1]-d[1])*(1-fu)+(b[1]-d[1])*(1-fv);
   if(Math.abs(y-(summitGround(x,z)-DROP))>FINE_ERR)return true;}
  return false;}));
 // Subdivisions: across bearings one count for all (the widest gap), along each ring band its own (so shared edges match).
 let fineU=1;const fineV:number[]=[];
 for(let k=0;k<R-1;k++){let gap=0;for(let i=0;i<BEARINGS;i++){if(!fine[i][k])continue;const a=pos(i,k),b=pos(i+1,k),c=pos(i,k+1);fineU=Math.max(fineU,Math.ceil(Math.hypot(b[0]-a[0],b[2]-a[2])/FINE));gap=Math.max(gap,Math.hypot(c[0]-a[0],c[2]-a[2]));}fineV.push(Math.max(1,Math.ceil(gap/FINE)));}
 const isFine=(i:number,k:number)=>k>=0&&k<R-1&&fine[(i+BEARINGS)%BEARINGS][k];
 const groundNormal=(x:number,z:number):[number,number,number]=>{const e=.7,gx=(summitGround(x+e,z)-summitGround(x-e,z))/(2*e),gz=(summitGround(x,z+e)-summitGround(x,z-e))/(2*e),l=Math.hypot(gx,1,gz);return [-gx/l,1/l,-gz/l];};
 function fineQuad(piece:Piece,i:number,k:number){const mu=fineU,mv=fineV[k],ii=i%BEARINGS;
  const a=pos(i,k),b=pos(i+1,k),c=pos(i,k+1),d=pos(i+1,k+1),ca=CL[ii][k],cb=CL[(ii+1)%BEARINGS][k],cc=CL[ii][k+1],cd=CL[(ii+1)%BEARINGS][k+1];
  const na=normal(i,k),nb=normal(i+1,k),nc=normal(i,k+1),nd=normal(i+1,k+1);
  // Edges shared with an unsplit neighbour (or the grid's end) follow the coarse straight edge.
  const coarseU0=!isFine(i-1,k),coarseU1=!isFine(i+1,k),coarseV0=!isFine(i,k-1),coarseV1=!isFine(i,k+1);
  const ids:number[][]=[];const C2=new T.Color();
  for(let u=0;u<=mu;u++){const row:number[]=[],fu=u/mu;
   for(let v=0;v<=mv;v++){const fv=v/mv,w00=(1-fu)*(1-fv),w10=fu*(1-fv),w01=(1-fu)*fv,w11=fu*fv;
    const x=a[0]*w00+b[0]*w10+c[0]*w01+d[0]*w11,z=a[2]*w00+b[2]*w10+c[2]*w01+d[2]*w11;
    C2.setRGB(ca.r*w00+cb.r*w10+cc.r*w01+cd.r*w11,ca.g*w00+cb.g*w10+cc.g*w01+cd.g*w11,ca.b*w00+cb.b*w10+cc.b*w01+cd.b*w11);
    const corner=(u===0||u===mu)&&(v===0||v===mv),edge=u===0&&coarseU0||u===mu&&coarseU1||v===0&&coarseV0||v===mv&&coarseV1;
    let y:number,n:[number,number,number];
    if(corner||edge){y=a[1]*w00+b[1]*w10+c[1]*w01+d[1]*w11;const nx=na[0]*w00+nb[0]*w10+nc[0]*w01+nd[0]*w11,ny=na[1]*w00+nb[1]*w10+nc[1]*w01+nd[1]*w11,nz=na[2]*w00+nb[2]*w10+nc[2]*w01+nd[2]*w11,l=Math.hypot(nx,ny,nz)||1;n=[nx/l,ny/l,nz/l];
}
    else{y=summitGround(x,z)-DROP;n=groundNormal(x,z);}
    row.push(piece.vertex(x,y,z,C2,n));}
   ids.push(row);}
  for(let u=0;u<mu;u++)for(let v=0;v<mv;v++){const p0=ids[u][v],p1=ids[u+1][v],p2=ids[u][v+1],p3=ids[u+1][v+1];piece.idx.push(p0,p2,p1,p1,p2,p3);}
 }
 const per=BEARINGS/SECTORS;
 const sectors:Piece[]=[];
 for(let s=0;s<SECTORS;s++){
  // Origin: the sector's middle bearing, halfway up the slope (so it lands in the chunk it mostly covers).
  const mid=Math.round((s+.5)*per)%BEARINGS,o=pos(mid,5+9);const piece=new Piece(Math.round(o[0]),Math.round(o[2]));sectors.push(piece);
  const ids:number[][]=[];
  for(let i=s*per;i<=(s+1)*per;i++){const row:number[]=[];for(let k=0;k<R;k++){const [x,y,z]=pos(i,k);row.push(piece.vertex(x,y,z,CL[i%BEARINGS][k],normal(i,k)));}ids.push(row);}
  // Bearings run anticlockwise seen from above (+x → +z), rings from the sea inward: wind each quad so it faces up.
  for(let j=0;j<ids.length-1;j++)for(let k=0;k<R-1;k++){if(fine[(s*per+j)%BEARINGS][k])fineQuad(piece,s*per+j,k);else{const a=ids[j][k],b=ids[j+1][k],c=ids[j][k+1],d=ids[j+1][k+1];piece.idx.push(a,c,b,b,c,d);}}
 }
 const sectorOf=(x:number,z:number)=>{let a=Math.atan2(z-PK.z,x-PK.x);if(a<0)a+=Math.PI*2;return sectors[Math.min(SECTORS-1,Math.floor(a/(Math.PI*2)*SECTORS))];};
 // ---- Paths (Oct 13 2026, user: "the path is not all connected", then a screenshot of it drawn as separate wedge-shaped strips):
 // one continuous ribbon per path, SUMMIT_PATH_WIDTH wide everywhere, draped on the terrain AS DRAWN. The old ribbon had one
 // cross-section per path point (up to 32 m apart) at the walked height, and the coarser terrain mesh (192 bearings × 27 rings)
 // poked through it between them, cutting it into wedges. Now: a cross-section every PATH_STEP m (5 vertices across), each vertex
 // at the drawn terrain's own height (meshHeight: the very triangle under it, or the fine corridor) or a little above where the terrain rises within
 // PATH_REACH m of it (so a fold between samples never pokes through), plus a few cm (PATH_LIFTS). Same pieces and material as the terrain (no
 // extra draw call); ~5k triangles in all. The centre line is SUMMIT_PATHS itself, so the maps' path lines match it exactly.
 const meshHeight=(x:number,z:number)=>{let a=Math.atan2(z-PK.z,x-PK.x);if(a<0)a+=Math.PI*2;const f=a/(Math.PI*2)*BEARINGS,i0=Math.floor(f)%BEARINGS,i1=(i0+1)%BEARINGS;
  for(let k=0;k<R-1;k++){const p00=pos(i0,k),p10=pos(i1,k),p01=pos(i0,k+1),p11=pos(i1,k+1);
   for(const [A,B,Cc] of [[p00,p01,p10],[p10,p01,p11]]){const d=(B[2]-Cc[2])*(A[0]-Cc[0])+(Cc[0]-B[0])*(A[2]-Cc[2]);if(Math.abs(d)<1e-9)continue;
    const l1=((B[2]-Cc[2])*(x-Cc[0])+(Cc[0]-B[0])*(z-Cc[2]))/d,l2=((Cc[2]-A[2])*(x-Cc[0])+(A[0]-Cc[0])*(z-Cc[2]))/d,l3=1-l1-l2;
    if(l1>=-1e-6&&l2>=-1e-6&&l3>=-1e-6)return fine[i0][k]?summitGround(x,z)-DROP:l1*A[1]+l2*B[1]+l3*Cc[1];}}
  return yAt(x,z);};
 // The drawn height for a ribbon point: the terrain under it, or its highest point within PATH_REACH m.
 const drape=(x:number,z:number,tx:number,tz:number)=>{let h=meshHeight(x,z);for(const [ox,oz] of [[tx,tz],[-tx,-tz],[-tz,tx],[tz,-tx]])h=Math.max(h,meshHeight(x+ox*PATH_REACH,z+oz*PATH_REACH));return h;};
 SUMMIT_PATHS.forEach((path,pathIndex)=>{const half=SUMMIT_PATH_WIDTH/2,line=resamplePath(path,PATH_STEP),n=line.length,lift=PATH_LIFTS[pathIndex]??PATH_LIFTS[2];
  let prev:number[]|null=null,prevPiece:Piece|null=null;
  // A cross-section at line[i] (its direction from two points either side), as vertices in `piece`.
  const section=(piece:Piece,i:number)=>{const p=line[i],a=line[Math.max(0,i-2)],b=line[Math.min(n-1,i+2)],ex=b.x-a.x,ez=b.z-a.z,el=Math.hypot(ex,ez)||1,tx=ex/el,tz=ez/el;
   const tone=PATH.clone().multiplyScalar(.95+.07*jitter(Math.floor(i/6),7));
   // The two edge rows a shade darker (a worn verge), so the strip reads as a path, not a decal.
   return PATH_ACROSS.map(f=>{const x=p.x-tz*half*f,z=p.z+tx*half*f;return piece.vertex(x,drape(x,z,tx,tz)+lift,z,tone.clone().multiplyScalar(Math.abs(f)>.99?.9:1));});};
  for(let i=0;i<n;i++){const piece=sectorOf(line[i].x,line[i].z);
   // Rows join within one sector piece; at a sector seam the previous row is made again in the new piece (no gap).
   if(prev&&prevPiece!==piece)prev=section(piece,i-1);
   const ids=section(piece,i);
   if(prev)for(let j=0;j<ids.length-1;j++){const a0=prev[j],a1=prev[j+1],b0=ids[j],b1=ids[j+1];piece.idx.push(a1,b1,a0,a0,b1,b0);}
   prev=ids;prevPiece=piece;}
  // Round ends (a half disc), so a path never stops in a square edge or a point.
  for(const [i,dir] of [[0,-1],[n-1,1]] as [number,number][]){const p=line[i],q=line[i-dir]??p,ex=(p.x-q.x)*dir,ez=(p.z-q.z)*dir,el=Math.hypot(ex,ez)||1,tx=ex/el*dir,tz=ez/el*dir,piece=sectorOf(p.x,p.z);
   const c=piece.vertex(p.x,drape(p.x,p.z,tx,tz)+lift,p.z,PATH.clone().multiplyScalar(.97)),rim:number[]=[];
   for(let k=0;k<=8;k++){const ang=k/8*Math.PI,ox=Math.cos(ang)*-tz+Math.sin(ang)*tx,oz=Math.cos(ang)*tx+Math.sin(ang)*tz,x=p.x+ox*half,z=p.z+oz*half;rim.push(piece.vertex(x,drape(x,z,tx,tz)+lift,z,PATH.clone().multiplyScalar(.9)));}
   for(let k=0;k<8;k++)piece.idx.push(c,rim[k+1],rim[k]);}
 });
 sectors.forEach((p,i)=>ground(p,'summit-isle-ground-'+i));

 // ---- Pitch and lines: one piece on the terrace (the terrace's flat itself is part of the terrain mesh). The pitch's long axis
 // runs east–west, so the striped slab (built along z) is turned a quarter turn.
 {const top=new Piece(SUMMIT_PITCH.x,SUMMIT_PITCH.z),H=PITCH_HEIGHT;
  const PI=SUMMIT_PITCH,plan=stripePlan(PI.length),slab=stripedSlabGeometry(PI.width+PI.runoff*2,.14,PI.length+PI.runoff*2,plan,PI.width,PI.length);
  const sp=slab.getAttribute('position'),sn=slab.getAttribute('normal'),sc=slab.getAttribute('color'),base=top.pos.length/3,turf=col('#6e9678');
  for(let i=0;i<sp.count;i++)top.vertex(PI.x+sp.getZ(i),H-DROP+.055+sp.getY(i),PI.z-sp.getX(i),turf.clone().multiplyScalar(sc.getX(i)),[sn.getZ(i),sn.getY(i),-sn.getX(i)]);
  const si=slab.index!;for(let i=0;i<si.count;i++)top.idx.push(base+si.getX(i));slab.dispose();
  // White lines (10 cm), 6 mm over the turf: touchlines, goal lines, halfway, centre circle and spot, small-sided areas.
  const ly=H-DROP+.055+.07+.006,w=.1;
  const seg=(x0:number,z0:number,x1:number,z1:number)=>{const dx=x1-x0,dz=z1-z0,l=Math.hypot(dx,dz)||1,nx=-dz/l*w/2,nz=dx/l*w/2;const a=top.vertex(x0+nx,ly,z0+nz,LINE),b=top.vertex(x0-nx,ly,z0-nz,LINE),c=top.vertex(x1+nx,ly,z1+nz,LINE),d=top.vertex(x1-nx,ly,z1-nz,LINE);
   top.idx.push(a,c,b,b,c,d);};
  const arc=(cx:number,cz:number,r:number,a0:number,a1:number,n:number)=>{for(let i=0;i<n;i++){const p=a0+(a1-a0)*i/n,q=a0+(a1-a0)*(i+1)/n;seg(cx+Math.cos(p)*r,cz+Math.sin(p)*r,cx+Math.cos(q)*r,cz+Math.sin(q)*r);}};
  const hl=PI.length/2,hw=PI.width/2;
  seg(PI.x-hl,PI.z-hw,PI.x+hl,PI.z-hw);seg(PI.x+hl,PI.z-hw,PI.x+hl,PI.z+hw);seg(PI.x+hl,PI.z+hw,PI.x-hl,PI.z+hw);seg(PI.x-hl,PI.z+hw,PI.x-hl,PI.z-hw);seg(PI.x,PI.z-hw,PI.x,PI.z+hw);
  arc(PI.x,PI.z,3,0,Math.PI*2,28);arc(PI.x,PI.z,.12,0,Math.PI*2,6);
  for(const side of [-1,1]){const gx=PI.x+side*hl,r=PI.box,gw=PI.goalWidth/2;
   // Futsal-style area: two quarter circles from the posts toward the field, joined by a straight line (small-sided Law 1).
   if(side>0){arc(gx,PI.z-gw,r,Math.PI,Math.PI*1.5,10);arc(gx,PI.z+gw,r,Math.PI*.5,Math.PI,10);}
   else{arc(gx,PI.z-gw,r,Math.PI*1.5,Math.PI*2,10);arc(gx,PI.z+gw,r,0,Math.PI*.5,10);}
   seg(gx-side*r,PI.z-gw,gx-side*r,PI.z+gw);
   arc(gx-side*6,PI.z,.12,0,Math.PI*2,6);}
  ground(top,'summit-isle-pitch');
  surfaceAreas.push({kind:'pitch',x:PI.x,z:PI.z,w:PI.length+PI.runoff*2,d:PI.width+PI.runoff*2});}

 // ---- Baked props (heat): trees, palms, rocks, the fence, goals, nets, masts and the lookout are baked into ONE vertex-coloured
 // mesh per terrain sector plus one for the summit, instead of palette meshes, which the batching pass would spread over ~30
 // separate 50 m chunk draws (and as many shadow draws) on an island this size. They cast shadows; the ground does not.
 const propMat=new T.MeshStandardMaterial({color:'#ffffff',vertexColors:true,roughness:.85});propMat.name='summit-isle-props';swayShader(propMat);
 const sectorProps=sectors.map(p=>new Piece(p.ox,p.oz)),summitProps=new Piece(C.x,C.z);
 const M=new T.Matrix4(),NM=new T.Matrix3(),Q=new T.Quaternion(),E=new T.Euler(),VP=new T.Vector3(),VS=new T.Vector3(),UP=new T.Vector3(0,1,0),A=new T.Vector3(),B=new T.Vector3();
 function bake(piece:Piece,g:T.BufferGeometry,hex:string,m:T.Matrix4){const c=col(hex),p=g.getAttribute('position'),n=g.getAttribute('normal'),base=piece.pos.length/3;NM.getNormalMatrix(m);
  for(let i=0;i<p.count;i++){A.fromBufferAttribute(p,i).applyMatrix4(m);B.fromBufferAttribute(n,i).applyMatrix3(NM).normalize();piece.vertex(A.x,A.y,A.z,c,[B.x,B.y,B.z]);}
  if(g.index)for(let i=0;i<g.index.count;i++)piece.idx.push(base+g.index.getX(i));else for(let i=0;i<p.count;i++)piece.idx.push(base+i);g.dispose();}
 const at=(x:number,y:number,z:number,rx=0,ry=0,rz=0,sx=1,sy=1,sz=1)=>M.compose(VP.set(x,y,z),Q.setFromEuler(E.set(rx,ry,rz)),VS.set(sx,sy,sz));
 const bakeBox=(piece:Piece,w:number,h:number,d:number,hex:string,x:number,y:number,z:number,rx=0,ry=0,rz=0)=>bake(piece,new T.BoxGeometry(w,h,d),hex,at(x,y,z,rx,ry,rz));
 /** A round rod from a to b (open ends: thin cords never show them). */
 const bakeRod=(piece:Piece,a:T.Vector3,b:T.Vector3,r:number,hex:string,seg=6)=>{const l=a.distanceTo(b);Q.setFromUnitVectors(UP,VS.copy(b).sub(a).normalize());M.compose(VP.copy(a).add(b).multiplyScalar(.5),Q,VS.set(1,1,1));bake(piece,new T.CylinderGeometry(r,r,l,seg,1,seg>4),hex,M);};
 const propsAt=(x:number,z:number)=>sectorProps[sectors.indexOf(sectorOf(x,z))];
 const props=(piece:Piece,name:string)=>{if(!piece.idx.length)return;const m=new T.Mesh(piece.geometry(),propMat);m.name=name;m.position.set(piece.ox,0,piece.oz);m.castShadow=true;m.receiveShadow=true;town.add(m);};

 // ---- The sandbar: sand top with a slight crown and a wet skirt sloping into the sea either side. 4 cm under the beaches it runs
 // onto, so where it meets Coral Cay's sand and the island's beach the beach wins (no coplanar flicker). Pebbles along its tide
 // lines are baked into the same pieces (no shadows, no collision: the slim bar's sand is all walking line).
 {const S=SANDBAR_PATH,pieces=3,per=Math.ceil((S.length-1)/pieces);
  for(let k=0;k<pieces;k++){const a=k*per,b=Math.min(S.length-1,(k+1)*per),mid=S[(a+b)>>1],piece=new Piece(Math.round(mid.x),Math.round(mid.z));
   let prev:number[]|null=null;
   for(let i=a;i<=b;i++){const p=S[i],q=S[Math.min(S.length-1,i+1)],o=S[Math.max(0,i-1)],tx=q.x-o.x,tz=q.z-o.z,tl=Math.hypot(tx,tz)||1,nx=tz/tl,nz=-tx/tl,w=sandbarHalfWidth(p.s);
    const offs=[[-(w+SANDBAR_SKIRT),-.47,WET],[-w,-.145,WET.clone().lerp(SAND,.6)],[-w*.55,-.13,SAND],[0,-.12,SAND],[w*.55,-.13,SAND],[w,-.145,WET.clone().lerp(SAND,.6)],[w+SANDBAR_SKIRT,-.47,WET]] as [number,number,T.Color][];
    const row=offs.map(([d,y,c])=>piece.vertex(p.x+nx*d,y,p.z+nz*d,c.clone().multiplyScalar(.98+.04*jitter(i,d)),[0,1,0]));
    if(prev)for(let j=0;j<row.length-1;j++){const a0=prev[j],a1=prev[j+1],b0=row[j],b1=row[j+1];piece.idx.push(a0,b0,a1,a1,b0,b1);}
    prev=row;}
   // Rows run west → east and the bar north → south, so (prev, row, prev+1) faces up; smooth normals over the crown and skirts.
   {const g=piece.geometry();g.computeVertexNormals();piece.nor=Array.from(g.getAttribute('normal').array as Float32Array);g.dispose();}
   for(let i=Math.max(4,a);i<=Math.min(b,S.length-5);i++){if(i%3)continue;const p=S[i],q=S[i+1],tl=Math.hypot(q.x-p.x,q.z-p.z)||1,nx=(q.z-p.z)/tl,nz=-(q.x-p.x)/tl,d=(i%2?1:-1)*(sandbarHalfWidth(p.s)-.4-jitter(i,2)*1.4),r=.12+jitter(i,5)*.16;
    bake(piece,new T.IcosahedronGeometry(r,0),jitter(i,9)>.5?'#d2bc94':'#c8b9a6',at(p.x+nx*d,-.12,p.z+nz*d,0,i,0,1,.55,1));}
   ground(piece,'summit-sandbar-'+k);}
  surfaceAreas.push({kind:'sand',x:611,z:-28,w:22,d:104});
 }

 // ---- Trees, palms and rocks (baked per sector).
 const pathNear=(x:number,z:number,r:number)=>SUMMIT_PATHS.some(path=>path.some(p=>Math.hypot(p.x-x,p.z-z)<r));
 const F=SUMMIT_FENCE,PI=SUMMIT_PITCH;
 const nearPitch=(x:number,z:number,r:number)=>Math.abs(x-PI.x)<F.halfX+r&&Math.abs(z-PI.z)<F.halfZ+r;
 function palm(x:number,z:number,h:number,i:number){const y=yAt(x,z),lean=.12+jitter(i,4)*.12,yaw=jitter(i,6)*Math.PI*2,piece=propsAt(x,z),tid=SUMMIT_TREE_SITES.length+1;piece.tid=tid;
  bake(piece,new T.CylinderGeometry(.11,.21,h,6),'#9d805b',at(x+Math.cos(yaw)*lean*h/2,y+h/2,z+Math.sin(yaw)*lean*h/2,Math.sin(yaw)*lean,0,-Math.cos(yaw)*lean));
  const tx=x+Math.cos(yaw)*lean*h,tz=z+Math.sin(yaw)*lean*h,ty=y+h;
  for(let k=0;k<6;k++){const a=k/6*Math.PI*2+i;bakeBox(piece,2.6,.06,.5,k%2?'#5b895e':'#3f7a4f',tx+Math.cos(a)*1.15,ty-.25,tz+Math.sin(a)*1.15,0,-a,-.42);}
  bake(piece,new T.IcosahedronGeometry(.28,0),'#7a5a3a',at(tx,ty-.35,tz));
  piece.tid=0;
  obstacles.push(trunkCollider(x,z,.21));assets.push({kind:'palm',x,z,w:.45,d:.45,visualW:5.5,visualD:5.5,canopyHeight:ty,baseY:y});SUMMIT_TREE_SITES.push({kind:'palm',x,z,y,size:h,seed:i,top:{x:tx,y:ty,z:tz},tid,rig:palmRig(x,z,y,{x:tx,y:ty,z:tz})});}
 function tree(x:number,z:number,s:number,i:number){const y=yAt(x,z),piece=propsAt(x,z),tid=SUMMIT_TREE_SITES.length+1;piece.tid=tid;
  bake(piece,new T.CylinderGeometry(.2*s,.2*s,2.2*s,6),'#8a6a48',at(x,y+1.1*s,z));
  bake(piece,new T.IcosahedronGeometry(1.7*s,0),i%3?'#5b895e':'#4f7f55',at(x,y+2.9*s,z,0,i));
  bake(piece,new T.IcosahedronGeometry(1.15*s,0),i%2?'#6f9a62':'#5b895e',at(x+.6*s,y+3.9*s,z-.3*s,0,i*2));
  piece.tid=0;
  obstacles.push(trunkCollider(x,z,.2*s));assets.push({kind:'tree',x,z,w:.5*s,d:.5*s,visualW:3.6*s,visualD:3.6*s,canopyHeight:y+5*s,baseY:y});SUMMIT_TREE_SITES.push({kind:'tree',x,z,y,size:s,seed:i,top:{x,y:y+5*s,z},tid,rig:roundTreeRig(x,z,y,s)});}
 function rock(x:number,z:number,r:number,i:number,piece=propsAt(x,z)){const y=yAt(x,z),sx=1+jitter(i,3)*.4,sy=.55+jitter(i,8)*.3,sz=1+jitter(i,4)*.3;
  bake(piece,new T.IcosahedronGeometry(r,0),['#9b9e90','#878b7e','#b1b3a6'][i%3],at(x,y+r*.25,z,0,jitter(i,5)*6,0,sx,sy,sz));
  // Solid to the size it shows (Oct 15 2026, user: "fix running through rocks"): a round collider out to the rock's widest reach
  // (its radius × its larger stretch, whatever way it is turned). It used to be 0.75 × the radius and none at all under 0.7 m,
  // so you walked into the outer half of every boulder. Only pebbles (reach < SUMMIT_PEBBLE) stay walk-through.
  const reach=r*Math.max(sx,sz);rockSite(x,z,reach,y+r*.25+r*sy);if(reach>=SUMMIT_PEBBLE)obstacles.push({x,z,w:reach*2,d:reach*2,cornerRadius:reach});}
 // Palms along the dune line on every side but the sandbar landing.
 let n=0;
 for(let k=0;k<28;k++){const a=k/28*Math.PI*2+jitter(k,1)*.12,rc=coastRadius(a),bw=beachWidth(a),r=rc-bw*(.55+jitter(k,2)*.3),x=C.x+Math.cos(a)*r,z=C.z+Math.sin(a)*r;
  if(k%2&&k%5)continue;if(pathNear(x,z,5)||Math.hypot(x-SUMMIT_LANDMARKS.sandbarLanding.x,z-SUMMIT_LANDMARKS.sandbarLanding.z)<16||!onSummitIsle(x,z))continue;palm(x,z,5.2+jitter(k,3)*1.6,n++);}
 // Trees: groves thickest in the gullies (low ridge shade) and on the lower slopes, thinning out higher up, clear of the paths,
 // the terrace and anything too steep to root on. Palms stay on the dune line (above).
 for(let k=0;k<150;k++){const a=jitter(k,11)*Math.PI*2,h=1.2+jitter(k,12)*30,p=heightPoint(a,h),x=p.x+(jitter(k,14)-.5)*6,z=p.z+(jitter(k,15)-.5)*6;
  if(pathNear(x,z,4.5)||terraceWeight(x,z)>0||!onSummitIsle(x,z))continue;const shade=ridgeShade(x,z),gully=1-shade;
  // Keep about a third on open slopes, nearly all in the gullies and low down.
  if(jitter(k,16)>.25+gully*1.1+(1-h/32)*.35)continue;if(summitSlope(x,z)>.55)continue;tree(x,z,(.75+jitter(k,13)*.5)*(h>18?.8:1),k);}
 // Bushes (small, low) along the gullies higher up, where trees thin out.
 for(let k=0;k<90;k++){const a=jitter(k,41)*Math.PI*2,h=16+jitter(k,42)*26,p=heightPoint(a,h),x=p.x,z=p.z;
  if(pathNear(x,z,3.5)||terraceWeight(x,z)>0||ridgeShade(x,z)>.48||summitSlope(x,z)>1.1)continue;const y=yAt(x,z),pc=propsAt(x,z),r=.7+jitter(k,43)*.5;
  bake(pc,new T.IcosahedronGeometry(r,0),k%2?'#4c7550':'#5b895e',at(x,y+.35,z,0,k,0,1,.62,1));
  // Solid too (user: "don't allow going into trees and bushes"): a round collider at 70% of the bush, fair to brush past.
  obstacles.push(bushCollider(x,z,r));}
 // Rock: a few outcrops on the steepest crests near the top and on the terrace's cut banks; boulders on three headlands.
 for(let k=0;k<40;k++){const a=k/40*Math.PI*2+jitter(k,21)*.1,h=30+jitter(k,22)*22,p=heightPoint(a,h),x=p.x,z=p.z;
  if(pathNear(x,z,4)||terraceWeight(x,z)>=1||summitSlope(x,z)<.75||ridgeShade(x,z)<.5)continue;rock(x,z,.8+jitter(k,23)*1.2,k);}
 for(let k=0;k<24;k++){const t=k/24*Math.PI*2,T2=TERRACE,x=T2.x+Math.cos(t)*(T2.a+3),z=T2.z+Math.sin(t)*(T2.b+3);if(pathNear(x,z,5)||summitSlope(x,z)<.8)continue;rock(x,z,.7+jitter(k,25)*.8,k+60);}
 for(const [a0,count] of [[-.5,5],[2.3,4],[3.9,4]] as [number,number][])for(let k=0;k<count;k++){const a=a0+k*.035,rc=coastRadius(a),r=rc-1.5-jitter(k,a0)*3,x=C.x+Math.cos(a)*r,z=C.z+Math.sin(a)*r;rock(x,z,.7+jitter(k,a0+1)*.9,k+40);}
 // A rope rail along the terrace's downhill edge wherever the fill drops away (open where the trail arrives).
 const rope=(piece:Piece,pts:{x:number;y:number;z:number}[])=>{for(let i=0;i<pts.length;i++){const p=pts[i];bakeRod(piece,V(p.x,p.y,p.z),V(p.x,p.y+1.05,p.z),.06,'#9d805b',5);
   if(i)bakeRod(piece,V(pts[i-1].x,pts[i-1].y+.85,pts[i-1].z),V(p.x,p.y+.85,p.z),.025,'#d9c49a',3);}};
 {let run:{x:number;y:number;z:number}[]=[];const flushRail=()=>{if(run.length>1)rope(summitProps,run);run=[];},T2=TERRACE;
  for(let k=0;k<=72;k++){const t=k/72*Math.PI*2,c=Math.cos(t),sn=Math.sin(t),e=4,ex=Math.sign(c)*Math.pow(Math.abs(c),2/e),ez=Math.sign(sn)*Math.pow(Math.abs(sn),2/e);
   const x=T2.x+ex*(T2.a-.6),z=T2.z+ez*(T2.b-.6),out=summitGround(T2.x+ex*(T2.a+4),T2.z+ez*(T2.b+4));
   if(PITCH_HEIGHT-out<1.2||pathNear(x,z,3)){flushRail();continue;}run.push({x,y:PITCH_HEIGHT-DROP,z});}
  flushRail();}

 // ---- The Summit 5s: fence with a south gate, two goals with nets, ball-stop netting behind both ends, floodlights, bench, signs.
 const y0=PITCH_HEIGHT-DROP,SP=summitProps;
 {const x0=PI.x-F.halfX,x1=PI.x+F.halfX,z0=PI.z-F.halfZ,z1=PI.z+F.halfZ;
  // Timber rail fence (posts every ~2.4 m, two rails), leaving the gate open.
  const run=(ax:number,az:number,bx:number,bz:number)=>{const l=Math.hypot(bx-ax,bz-az),n2=Math.max(1,Math.round(l/2.4));
   for(let i=0;i<=n2;i++)bakeBox(SP,.12,F.height,.12,'#9d805b',ax+(bx-ax)*i/n2,y0+F.height/2,az+(bz-az)*i/n2);
   for(const y of [.45,1.0])bakeBox(SP,Math.abs(bx-ax)+.06||.07,.07,Math.abs(bz-az)+.06||.07,'#eddfbb',(ax+bx)/2,y0+y,(az+bz)/2);};
  run(x0,z0,x1,z0);run(x0,z0,x0,z1);run(x1,z0,x1,z1);run(x0,z1,F.gate.x0,z1);run(F.gate.x1,z1,x1,z1);
  // Ball-stop netting behind each end (4 m): two tall posts, a top wire and a light mesh of thin cords.
  for(const side of [-1,1]){const x=PI.x+side*F.halfX,hw=7,nh=4;
   for(const s2 of [-1,1])bakeRod(SP,V(x,y0,PI.z+s2*hw),V(x,y0+nh,PI.z+s2*hw),.07,'#384443',8);
   bakeBox(SP,.05,.05,hw*2,'#384443',x,y0+nh,PI.z);
   for(let z=-hw+.5;z<hw;z+=.5)bakeRod(SP,V(x,y0+F.height,PI.z+z),V(x,y0+nh,PI.z+z),.012,'#c6d4cc',3);
   for(let y=F.height+.5;y<nh;y+=.5)bakeRod(SP,V(x,y0+y,PI.z-hw),V(x,y0+y,PI.z+hw),.012,'#c6d4cc',3);}
  // Goals: round posts and bar, a sloping back frame and net cords (12 × 6 ft five-a-side goals).
  for(const side of [-1,1]){const gx=PI.x+side*PI.length/2,back=gx+side*PI.goalDepth,gw=PI.goalWidth/2,gh=PI.goalHeight,g0=y0+.125,white='#fff6df';
   for(const s2 of [-1,1]){const z=PI.z+s2*gw;bakeRod(SP,V(gx,g0,z),V(gx,g0+gh,z),.05,white,8);bakeRod(SP,V(gx,g0+gh,z),V(back,g0+.2,z),.03,white,6);bakeRod(SP,V(gx,g0+.03,z),V(back,g0+.03,z),.03,white,6);}
   bakeRod(SP,V(gx,g0+gh,PI.z-gw),V(gx,g0+gh,PI.z+gw),.05,white,8);bakeRod(SP,V(back,g0+.03,PI.z-gw),V(back,g0+.03,PI.z+gw),.03,white,6);
   for(let z=-gw+.3;z<gw;z+=.3)bakeRod(SP,V(gx,g0+gh,PI.z+z),V(back,g0+.05,PI.z+z),.012,'#c6d4cc',3);
   for(let k=1;k<5;k++){const f=k/5,x=gx+(back-gx)*f,y=g0+gh-(gh-.05)*f;bakeRod(SP,V(x,y,PI.z-gw),V(x,y,PI.z+gw),.012,'#c6d4cc',3);}}
  for(const o of SUMMIT_OBSTACLES)obstacles.push({...o});
  // Floodlights on opposite touchlines: masts baked in; the lens is the island's lamp-lens paint (it glows at night) and a night
  // light pool lights each half of the pitch.
  // North-east and south-west of the centre line, clear of the south gate and the bench.
  // The masts stand on the shoulder just below the summit's edge, clear of the walkway (a little taller to make up the drop).
  for(const [sx,sz] of [[1,-1],[-1,1]] as [number,number][]){const x=PI.x+sx*6,z=PI.z+sz*(TERRACE.b+1.4),mb=yAt(x,z),top=y0+9;
   bakeRod(SP,V(x,mb,z),V(x,top,z),.13,'#384443',8);bakeBox(SP,2.2,.6,.5,'#384443',x,top+.1,z-sz*.15);
   const lens=box(1.9,.42,.06,'#ffe8ae',x,top+.05,z-sz*.42);lens.castShadow=false;lens.rotation.x=-sz*.35;
   obstacles.push({x,z,w:.4,d:.4});assets.push({kind:'field-light',x,z,w:.4,d:.4,baseY:mb});
   lampSites.push({x:PI.x+sx*6,z:PI.z+sz*4,ground:y0+.2,region:'coral-cay',poolWidth:24,poolDepth:20});}
  // Name board beside the south gate, a teaching board (small-sided football) and a bench facing the pitch (palette props: they keep
  // their kick reactions). All face south, toward the trail's arrival.
  // On the shoulder just below the summit's south edge, clear of the walkway.
  const edgeZ=TERRACE.z+TERRACE.b+1.6;
  {const gx=F.gate.x0-4.2,gz=edgeZ,gy=yAt(gx,gz);prop('sign',()=>{box(5.2,.8,.14,'#294f43',gx,gy+2.1,gz);for(const dx of [-2.4,2.4])cylinder(.07,2.4,'#9d805b',gx+dx,gy+1.2,gz);sign('SUMMIT 5s',5,.62,gx,gy+2.1,gz+.08,'#294f43','#f4cc7c');});
   for(const dx of [-2.4,2.4])obstacles.push({x:gx+dx,z:gz,w:.2,d:.2});}
  {const tx=F.gate.x1+5.2,tz=edgeZ,ty=yAt(tx,tz);prop('sign',()=>{box(7,.8,.14,'#9d805b',tx,ty+1.8,tz);for(const dx of [-3.2,3.2])cylinder(.075,2.15,'#9d805b',tx+dx,ty+1.075,tz);sign('SMALL-SIDED = MORE TOUCHES',6.8,.62,tx,ty+1.8,tz+.08,'#477c6a','#fff0cf');});
   for(const dx of [-3.2,3.2])obstacles.push({x:tx+dx,z:tz,w:.2,d:.2});}
  {const bx=PI.x-14,bz=edgeZ,by=yAt(bx,bz);prop('bench',()=>{box(2.2,.1,.55,'#a67d55',bx,by+.48,bz);box(2.2,.45,.08,'#a67d55',bx,by+.78,bz+.25);for(const dx of [-.9,.9])box(.1,.45,.5,'#385a4e',bx+dx,by+.23,bz);});obstacles.push({x:bx,z:bz,w:2.2,d:.7});}
 }
 // ---- The lookout on the summit's north-west walkway: a flag and a cairn, looking out over Coral Cay and the main island.
 {const L=SUMMIT_LANDMARKS.lookout,ys=SUMMIT_HEIGHT-DROP;
  bakeRod(SP,V(L.x,ys,L.z),V(L.x,ys+6.5,L.z),.06,'#eddfbb',6);bakeBox(SP,.04,1.1,1.8,'#d9534a',L.x,ys+5.9,L.z+.92);bakeBox(SP,.045,.34,1.8,'#f4cc7c',L.x,ys+5.9,L.z+.92);
  obstacles.push({x:L.x,z:L.z,w:.3,d:.3});
  for(let k=0;k<5;k++)bake(SP,new T.IcosahedronGeometry(.5-k*.08,0),k%2?'#9b9e90':'#878b7e',at(L.x+3.6,ys+.22+k*.38,L.z,0,k));obstacles.push({x:L.x+3.6,z:L.z,w:1,d:1});rockSite(L.x+3.6,L.z,.5,ys+2);}
 // ---- The orchard (Oct 14 2026, lib/town/summitOrchard.ts): fruit trees and plants of seven forms along both sides of the trails,
 // round the summit's edge, on the open slopes and the beaches' grass edge, clear of every trail, the pitch, the lookout and the
 // telescope, the kiosk, the fishing spots and the hikers. Baked into the same sector pieces as the trees above (no new draw call)
 // with their own trunk colliders (rides and balls bounce off them like any trunk).
 {const isle=obstacles.filter(o=>o.x>C.x-260&&o.x<C.x+260&&o.z>C.z-260&&o.z<C.z+260);
  const blockedNear=(x:number,z:number,r:number)=>isle.some(o=>Math.abs(o.x-x)<o.w/2+r&&Math.abs(o.z-z)<o.d/2+r);
  for(const o of ORCHARD_OFF?[]:planOrchard(blockedNear,SUMMIT_TREE_SITES.map(t=>({x:t.x,z:t.z})))){const piece=propsAt(o.x,o.z),tid=SUMMIT_TREE_SITES.length+1,rig=orchardRig(o);piece.tid=tid;
   for(const part of orchardParts(o))bake(piece,part.geo(),part.color,part.matrix);piece.tid=0;
   const plant=o.form==='banana'||o.form==='papaya',top=rig.sway.h;
   obstacles.push(trunkCollider(o.x,o.z,rig.baseR));assets.push({kind:plant?'palm':'tree',x:o.x,z:o.z,w:rig.baseR*2.5,d:rig.baseR*2.5,visualW:plant?4.5:3.6*o.s,visualD:plant?4.5:3.6*o.s,canopyHeight:o.y+top,baseY:o.y});
   SUMMIT_TREE_SITES.push({kind:'tree',x:o.x,z:o.z,y:o.y,size:o.s,seed:o.seed,top:{x:rig.crown.x,y:o.y+top,z:rig.crown.z},tid,rig,form:o.form,fruit:o.fruit});}}

 // ---- Huts, caves and the riddle board (Oct 15 2026, lib/town/summitBalls.ts: the hidden balls' hiding places). Baked into the
 // same sector prop pieces as the trees (no new draw call), AFTER the orchard is planned (so no fruit tree moves), each wall and
 // rock with its own collider. The caves are boulders built onto the ground (the terrain is untouched: no holes, no seams).
 {const R=SUMMIT_HUT_RADIUS,yaw=(d:{x:number;z:number})=>Math.atan2(d.x,d.z);
  for(const h of SUMMIT_HUTS){const piece=propsAt(h.x,h.z);let lo=Infinity,hi=-Infinity;
   for(let a=0;a<16;a++){const y=yAt(h.x+Math.cos(a/16*Math.PI*2)*R,h.z+Math.sin(a/16*Math.PI*2)*R);lo=Math.min(lo,y);hi=Math.max(hi,y);}hi=Math.max(hi,hutGroundTop(h));
   // A stucco drum sunk into the slope, an eave ring and a straw cone (Coral Cay's thatched huts, a little smaller).
   const base=lo-.35,top=hi+HUT_WALL;
   bake(piece,new T.CylinderGeometry(R,R,top-base,16),h.id==='beach'?'#e7cfa4':h.id==='rest'?'#d6b58a':h.id==='sunset'?'#e2c69a':'#cdb48c',at(h.x,(base+top)/2,h.z));
   bake(piece,new T.CylinderGeometry(R+.5,R+.5,.2,16),'#b9955a',at(h.x,top+.05,h.z));
   bake(piece,new T.ConeGeometry(R+.75,HUT_CONE,12),h.id==='fisher'?'#c99a5b':h.id==='sunset'?'#d69b61':'#d7ad62',at(h.x,top+HUT_CONE_LIFT,h.z));
   // The doorway: a dark opening proud of the wall under a timber lintel.
   const dg=yAt(h.x+h.door.x*R,h.z+h.door.z*R);
   bakeBox(piece,1.05,1.9,.16,'#2c302e',h.x+h.door.x*(R-.02),dg+.95,h.z+h.door.z*(R-.02),0,yaw(h.door),0);
   bakeBox(piece,1.3,.13,.22,'#8a6a48',h.x+h.door.x*(R+.03),dg+1.95,h.z+h.door.z*(R+.03),0,yaw(h.door),0);
   obstacles.push({x:h.x,z:h.z,w:R*2-.4,d:R*2-.4,cornerRadius:R-.2});
   const side={x:-h.door.z,z:h.door.x},out=(k:number,s2=0)=>({x:h.x+h.door.x*k+side.x*s2,z:h.z+h.door.z*k+side.z*s2});
   if(h.window){// The beach hut: a window on the sea side with a shelf below it (the ball sits on the shelf).
    const wg=yAt(h.x+h.window.x*R,h.z+h.window.z*R);
    bakeBox(piece,.85,.7,.16,'#2c302e',h.x+h.window.x*(R-.02),wg+1.6,h.z+h.window.z*(R-.02),0,yaw(h.window),0);
    bakeBox(piece,1.05,.07,.42,'#9d805b',h.x+h.window.x*(R+.14),wg+1.02,h.z+h.window.z*(R+.14),0,yaw(h.window),0);
    for(const s2 of [-.42,.42])bakeBox(piece,.06,.3,.06,'#8a6a48',h.x+h.window.x*(R+.2)-h.window.z*s2,wg+.85,h.z+h.window.z*(R+.2)+h.window.x*s2,0,yaw(h.window),0);}
   if(h.porch){// The rest hut: a thatched porch on two posts and a bench (the ball rolled under it).
    for(const s2 of [-1.25,1.25]){const p=out(R+1.55,s2),y=yAt(p.x,p.z);bakeRod(piece,V(p.x,y-.2,p.z),V(p.x,dg+2.3,p.z),.08,'#8a6a48',6);obstacles.push({x:p.x,z:p.z,w:.26,d:.26});}
    {const p=out(R+.8);bakeBox(piece,3.1,.16,1.9,'#d7ad62',p.x,dg+2.38,p.z,0,yaw(h.door),0);}
    {const p=out(R+.75),y=yAt(p.x,p.z);bakeBox(piece,1.7,.08,.44,'#a67d55',p.x,y+.96,p.z,0,yaw(h.door),0);
     for(const s2 of [-.72,.72]){const q=out(R+.75,s2);bakeBox(piece,.08,.96,.4,'#6b5238',q.x,yAt(q.x,q.z)+.46,q.z,0,yaw(h.door),0);}}}
   if(h.id==='fisher'){// A drying rack with a net and a crate beside the door.
    const a=out(.6,R+1.3),b=out(-.9,R+1.6);for(const p of [a,b]){bakeRod(piece,V(p.x,yAt(p.x,p.z)-.2,p.z),V(p.x,yAt(p.x,p.z)+1.7,p.z),.06,'#8a6a48',6);obstacles.push({x:p.x,z:p.z,w:.22,d:.22});}
    const ay=yAt(a.x,a.z)+1.6,by=yAt(b.x,b.z)+1.6;bakeRod(piece,V(a.x,ay,a.z),V(b.x,by,b.z),.04,'#9d805b',5);
    bake(piece,new T.BoxGeometry(1.5,.9,.04),'#5f7f86',at((a.x+b.x)/2,(ay+by)/2-.48,(a.z+b.z)/2,0,Math.atan2(b.x-a.x,b.z-a.z)+Math.PI/2,0));
    const c=out(R+.5,-1.35);bakeBox(piece,.7,.55,.6,'#9d805b',c.x,yAt(c.x,c.z)+.27,c.z,0,yaw(h.door)+.3,0);obstacles.push({x:c.x,z:c.z,w:.8,d:.8});}}
  // Caves: two boulders frame the mouth, two more and a big back boulder close the sides and the back, a dark rock fills the
  // recess and a flat capstone overhangs the back half only, so the follow camera (from the south-east) sees in.
  for(const c of SUMMIT_CAVES){const piece=propsAt(c.x,c.z),f=c.mouth,r={x:-f.z,z:f.x},ry=yaw(f);
   const P=(along:number,s2:number)=>({x:c.x+f.x*along+r.x*s2,z:c.z+f.z*along+r.z*s2});
   const tone=c.id==='sea'?['#a39c8c','#8e887a','#b4ad9e']:['#9b9e90','#878b7e','#b1b3a6'];
   const boulder=(p:{x:number;z:number},rad:number,sy:number,k:number)=>{const y=yAt(p.x,p.z);bake(piece,new T.IcosahedronGeometry(rad,0),tone[k%3],at(p.x,y+rad*sy*.5,p.z,0,jitter(k,c.x)*6,0,1,sy,1));
    rockSite(p.x,p.z,rad,y+rad*sy*1.5);obstacles.push({x:p.x,z:p.z,w:rad*2,d:rad*2,cornerRadius:rad});};
   let gTop=-Infinity;for(const [a2,s2] of [[0,0],[-CAVE_BACK,0],[-1.5,-CAVE_SIDE],[-1.5,CAVE_SIDE],[0,-CAVE_SIDE],[0,CAVE_SIDE]]){const p=P(a2,s2);gTop=Math.max(gTop,yAt(p.x,p.z));}
   let k=0;for(const s2 of [-1,1]){boulder(P(-.2,s2*CAVE_SIDE),1.45,1.3,k++);boulder(P(-1.8,s2*(CAVE_SIDE-.25)),1.35,1.45,k++);boulder(P(.9,s2*(CAVE_SIDE+.9)),.75,1,k++);}
   boulder(P(-CAVE_BACK,0),1.7,1.25,k++);boulder(P(-CAVE_BACK+1.1,-1.4),1.1,1.2,k++);
   {const p=P(-2.3,0);bake(piece,new T.IcosahedronGeometry(1.2,1),'#272420',at(p.x,yAt(p.x,p.z)+.95,p.z,0,ry,0,1.25,.85,.7));obstacles.push({x:p.x,z:p.z,w:1.5,d:1.5,cornerRadius:.75});}
   {const p=P(-2.6,0);bake(piece,new T.IcosahedronGeometry(2.6,0),tone[1],at(p.x,gTop+3.15,p.z,0,ry,0,1.25,.42,.75));}
   for(let j=0;j<4;j++){const p=P(-1.2-j*.6,(j%2?1:-1)*(CAVE_SIDE+.6));bake(piece,new T.IcosahedronGeometry(.45+jitter(j,c.z)*.3,0),tone[j%3],at(p.x,gTop+2.2+j*.12,p.z,0,j,0));}}
  // The riddle board at the sandbar landing: two posts, a little roof and three paper notes (the riddles show in the hunt hint).
  {const B=RIDDLE_BOARD,y=yAt(B.x,B.z),ax={x:Math.cos(B.yaw),z:-Math.sin(B.yaw)},n={x:Math.sin(B.yaw),z:Math.cos(B.yaw)},piece=propsAt(B.x,B.z);
   for(const s2 of [-1.05,1.05]){const p={x:B.x+ax.x*s2,z:B.z+ax.z*s2};bakeRod(piece,V(p.x,yAt(p.x,p.z)-.2,p.z),V(p.x,y+2.45,p.z),.07,'#8a6a48',6);obstacles.push({x:p.x,z:p.z,w:.22,d:.22});}
   bakeBox(piece,2.3,1.25,.1,'#7a5a3a',B.x,y+1.65,B.z,0,B.yaw,0);bakeBox(piece,2.6,.1,.6,'#b9955a',B.x,y+2.45,B.z,0,B.yaw,0);
   for(const [s2,dy,tilt] of [[-.68,.1,.06],[0,-.08,-.04],[.68,.12,.05]] as [number,number,number][])bakeBox(piece,.55,.7,.02,'#f6ecd2',B.x+ax.x*s2+n.x*.06,y+1.65+dy,B.z+ax.z*s2+n.z*.06,0,B.yaw,tilt);
   bake(piece,new T.IcosahedronGeometry(.13,0),'#f4f1e6',at(B.x+n.x*.12,y+2.1,B.z+n.z*.12));}}
 sectorProps.forEach((p,i)=>props(p,'summit-isle-props-'+i));props(SP,'summit-isle-summit-props');
 // ---- A welcome board where the sandbar lands (the path starts here) and one at the Coral Cay end.
 {const s=SUMMIT_LANDMARKS.sandbarLanding,y=yAt(s.x+5,s.z+3);prop('sign',()=>{box(5.6,.7,.12,'#294f43',s.x+5,y+2.1,s.z+3);for(const dx of [-2.6,2.6])cylinder(.07,2.4,'#9d805b',s.x+5+dx,y+1.2,s.z+3);sign('SUMMIT ISLE',5.3,.55,s.x+5,y+2.1,s.z+2.92,'#294f43','#f4cc7c',Math.PI);});
  for(const dx of [-2.6,2.6])obstacles.push({x:s.x+5+dx,z:s.z+3,w:.2,d:.2});}
 {const p=SANDBAR_PATH[3];prop('sign',()=>{box(3.4,.6,.12,'#294f43',p.x+6.5,1.5,p.z);cylinder(.07,1.8,'#9d805b',p.x+6.5,.8,p.z+.1);sign('TO SUMMIT ISLE',3.2,.5,p.x+6.5,1.5,p.z-.07,'#294f43','#f4cc7c',Math.PI);});obstacles.push({x:p.x+6.5,z:p.z,w:.2,d:.2});}
 return {lampSites,materials:[groundMat,propMat]};
}
function smoothstep(a:number,b:number,x:number){const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);}
export type {IslePoint};
