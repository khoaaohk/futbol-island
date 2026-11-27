// The west side's raised ground, the drawn side (heights: westElevation.ts; the system: elevation.ts). Build-time only: no
// per-frame work, no new material, texture, program or draw.
//  - westLawnPatch(): the natural ground (the embankments, the pond's hollow, the long hillside up from the town) as an adaptive
//    grid on the walked height's own 2 m lattice, and the terrace's level top as a fan. fields.ts MERGES it into the main lawn's
//    geometry (same mesh, same material: 0 draws); the flat lawn stays underneath.
//  - buildWestWalls(): the retaining wall round the terrace wherever it stands above the natural ground (stone face, darker
//    plinth, coursed blocks, coping, buttresses, a clipped hedge on top), the two flights of stairs through it and their colliders.
//    Pieces go through world.ts `put`, so they merge into the chunk's paint batch and take its baked light (walls darken to the foot).
import * as T from 'three';
import {elevationOn} from './elevation';
import {broadleafTreesOn,hedgeClump} from './broadleafTrees';
import {WEST,WEST_BOX,WEST_TERRACE,WEST_STAIRS,westNatural,westGround,onWestTerrace,terraceOutline,stairLocal,type Stair} from './westElevation';
import {STADIUM_PLAZA} from './westParkLayout';
import {INTERIOR_GRASS} from './shoreline';
import {insidePolygon} from './elevation';
import type {Obstacle} from './simulation';

/** The lawn's normals lean this much further than the ground does (Nov 26 2026, audit): an 8% hillside and a 30% bank lit as
 *  the level lawn read as a flat ramp; leaned, the sunward banks are lighter and the ones turned away darker. Eased to 0 with the
 *  slope at every join (the grade itself is eased), so no seam; normals only: no colour attribute, no shader change. */
export const LAWN_TILT=2.4;
/** A patch vertex OFF the lawn (on the beach) drops this far under the mesh (lawn at -0.112, so ~0.7 m under the sand). Leftovers A
 *  (owner shot 142, Nov 26 night): the patch's 2 m cells straddle the coast; a vertex just inside the lawn sits a few cm up the bank
 *  and the one on the sand sat at -0.03, so the cell's triangles crossed the sand's level half way out: a row of cells laid a hard
 *  straight lawn edge and sharp grass points onto the beach at (-233, -187), over the lawn's own torn fringe. Dropped steeply, the
 *  patch dives under the sand within ~7 % of the cell and the main lawn's soft edge is what shows (tests/path-on-road.cjs part 4). */
export const PATCH_UNDER=-.6;
export type LawnPatch={position:number[];normal:number[];uv:number[];index:number[];triangles:number};
/** `fine`: the smallest cell (2 m = the walked lattice; 4 m on the lowest tier: a coarser slope, ≤ ~6 cm off the walked height). */
export function westLawnPatch(fine:2|4=2):LawnPatch|null{
 if(!elevationOn())return null;
 const position:number[]=[],normal:number[]=[],uv:number[]=[],index:number[]=[],ids=new Map<number,number>(),B=WEST_BOX,H=WEST.terrace,nx=Math.round((B.maxX-B.minX)/2)+1;
 const vert=(x:number,z:number)=>{const key=Math.round((z-B.minZ)/2)*nx+Math.round((x-B.minX)/2);let i=ids.get(key);if(i!==undefined)return i;
  const h=westNatural(x,z),gx=(westNatural(x+1,z)-westNatural(x-1,z))/2*LAWN_TILT,gz=(westNatural(x,z+1)-westNatural(x,z-1))/2*LAWN_TILT,l=Math.hypot(gx,1,gz);
  i=position.length/3;position.push(x,h>.02?h:insidePolygon(INTERIOR_GRASS,x,z)?-.03:PATCH_UNDER,z);normal.push(-gx/l,1/l,-gz/l);uv.push(x,-z);ids.set(key,i);return i;};
 const coarse:[number,number,number][]=[];
 const quad=(x:number,z:number,s:number)=>{const a=vert(x,z),b=vert(x+s,z),c=vert(x,z+s),d=vert(x+s,z+s);index.push(a,c,b,b,c,d);if(s>2)coarse.push([x,z,s]);};
 /** Is the s-metre block at (x, z) a plane (its 2 m samples within 1.2 cm of its corners' bilinear patch)? */
 const planar=(x:number,z:number,s:number)=>{const a=westNatural(x,z),b=westNatural(x+s,z),c=westNatural(x,z+s),d=westNatural(x+s,z+s);
  for(let i=0;i<=s;i+=2)for(let j=0;j<=s;j+=2){const u=i/s,v=j/s;if(Math.abs(westNatural(x+i,z+j)-((a+(b-a)*u)*(1-v)+(c+(d-c)*u)*v))>.012)return false;}return true;};
 const skip=(x:number,z:number,s:number)=>{let flat=true,inside=true;for(let i=0;i<=s;i+=2)for(let j=0;j<=s;j+=2){if(westNatural(x+i,z+j)>.005)flat=false;if(!onWestTerrace(x+i,z+j))inside=false;}return flat||inside;};
 for(let x=B.minX;x<B.maxX;x+=8)for(let z=B.minZ;z<B.maxZ;z+=8){
  if(skip(x,z,8))continue;if(planar(x,z,8)){quad(x,z,8);continue;}
  for(const ox of [0,4])for(const oz of [0,4]){const qx=x+ox,qz=z+oz;if(skip(qx,qz,4))continue;if(fine===4||planar(qx,qz,4)){quad(qx,qz,4);continue;}
   for(const px of [0,2])for(const pz of [0,2])if(!skip(qx+px,qz+pz,2))quad(qx+px,qz+pz,2);}}
 // No T-junctions (audit, Nov 26 2026): where an 8 m or 4 m cell meets finer ones, the finer cells' vertices ON its edge take the
 // edge's own height and normal (≤ 1.2 cm, the `planar` tolerance), so no hairline opens onto the flat lawn underneath and the
 // light does not step along the edge. 8 m cells first: a 4 m cell's corner may itself sit on an 8 m edge.
 {const at=(x:number,z:number)=>ids.get(Math.round((z-B.minZ)/2)*nx+Math.round((x-B.minX)/2));
  for(const size of [8,4])for(const [x,z,s] of coarse){if(s!==size)continue;
   for(const [ax,az,bx,bz] of [[x,z,x+s,z],[x,z+s,x+s,z+s],[x,z,x,z+s],[x+s,z,x+s,z+s]]){const a=at(ax,az)!,b=at(bx,bz)!;
    for(let d=2;d<s;d+=2){const u=d/s,i=at(ax+(bx-ax)*u,az+(bz-az)*u);if(i===undefined)continue;
     position[i*3+1]=position[a*3+1]*(1-u)+position[b*3+1]*u;
     const n0=normal[a*3]*(1-u)+normal[b*3]*u,n1=normal[a*3+1]*(1-u)+normal[b*3+1]*u,n2=normal[a*3+2]*(1-u)+normal[b*3+2]*u,l=Math.hypot(n0,n1,n2)||1;normal[i*3]=n0/l;normal[i*3+1]=n1/l;normal[i*3+2]=n2/l;}}}}
 // The terrace's top: a fan (the outline is convex).
 {const o=terraceOutline(2),c=position.length/3;position.push(WEST_TERRACE.x,H,WEST_TERRACE.z);normal.push(0,1,0);uv.push(WEST_TERRACE.x,-WEST_TERRACE.z);
  for(const p of o){position.push(p.x,H,p.z);normal.push(0,1,0);uv.push(p.x,-p.z);}
  for(let i=0;i<o.length;i++)index.push(c,c+1+(i+1)%o.length,c+1+i);}
 return {position,normal,uv,index,triangles:index.length/3};
}
/** Merge the patch into a lawn geometry (position / normal / uv, indexed, world x and z, y relative to the mesh). */
export function mergeLawnPatch(lawn:T.BufferGeometry,patch:LawnPatch){
 const cat=(name:string,add:number[],size:number)=>{const a=lawn.getAttribute(name),out=new Float32Array(a.count*size+add.length);out.set(a.array as Float32Array);out.set(add,a.count*size);return new T.BufferAttribute(out,size);};
 const base=lawn.getAttribute('position').count,old=lawn.index?Array.from(lawn.index.array):Array.from({length:base},(_,i)=>i);
 const g=new T.BufferGeometry();g.setAttribute('position',cat('position',patch.position,3));g.setAttribute('normal',cat('normal',patch.normal,3));g.setAttribute('uv',cat('uv',patch.uv,2));
 g.setIndex([...old,...patch.index.map(i=>i+base)]);g.computeBoundingBox();g.computeBoundingSphere();return g;
}

// ---- The retaining wall ---------------------------------------------------------------------------------------------------
// Nov 26 2026 (audit): the face read as pale timber boards (sandy, full-length course lines). It is now BUILT STONE: level
// courses of staggered blocks (blockFace), a cool grey-buff with a tint of its own per block, a shaded bed under every course, a
// baked shadow under the coping and a darker, slightly green damp band over the foot. All in the chunk's paint batch (vertex
// colour through `userData.vertexTint`, world.ts): no texture, material, program or draw.
export const WALL={stone:'#98a0a9',plinth:'#6b737a',coping:'#ccd2d5',hedge:'#5d8a4f',tread:'#c2c8cb',pilaster:'#8a939c',
 /** Below this the terrace's edge is a kerb you step over (no hedge, no collider). */
 low:.32,hedgeH:.85,hedgeW:.7,copingH:.2,piece:12,buttress:9,course:.44,block:1.1} as const;
type WallPt={x:number;z:number;top:number;foot:number};
type Tools={put:(g:T.BufferGeometry,color:string,x:number,y:number,z:number)=>T.Mesh;obstacles:Obstacle[]};
/** A strip swept along `pts` (≤ WALL.piece m per mesh): `profile` = [offset outward, height above/below (`from`: the wall's top
 *  or foot), min clearance over the foot] points, listed bottom-outer → up → inward so every face looks out or up. */
function sweep(t:Tools,pts:readonly WallPt[],color:string,profile:readonly (readonly [number,'top'|'foot',number,number?,number?])[],caps=false){
 let tris=0;
 for(let s=0;s<pts.length-1;){let e=s,len=0;while(e<pts.length-1&&len<WALL.piece){len+=Math.hypot(pts[e+1].x-pts[e].x,pts[e+1].z-pts[e].z);e++;}
  const cx=(pts[s].x+pts[e].x)/2,cz=(pts[s].z+pts[e].z)/2,pos:number[]=[],idx:number[]=[],m=profile.length;
  for(let i=s;i<=e;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],tx=b.x-a.x,tz=b.z-a.z,l=Math.hypot(tx,tz)||1,nx=tz/l,nz=-tx/l,p=pts[i];
   for(const [off,from,dy,floor,wob] of profile){let y=(from==='top'?p.top:p.foot)+dy+(wob?wob*hedgeWobble(p.x,p.z):0);if(floor!==undefined&&y<p.foot+floor)y=p.foot+floor;pos.push(p.x+nx*off-cx,y,p.z+nz*off-cz);}}
  for(let i=0;i<e-s;i++)for(let j=0;j<m-1;j++){const a=i*m+j,b=a+1,c=a+m,d=c+1;idx.push(a,b,c,b,d,c);}
  if(caps&&m>2){for(const [row,flip] of [[0,false],[e-s,true]] as const)for(let j=1;j<m-1;j++){const a=row*m,b=row*m+j,c=row*m+j+1;if(flip)idx.push(a,b,c);else idx.push(a,c,b);}}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setIndex(idx);const flat=g.toNonIndexed();g.dispose();flat.computeVertexNormals();
  t.put(flat,color,cx,0,cz);tris+=idx.length/3;s=e;}
 return tris;
}
/** A clipped hedge's uneven top (Leftovers B): a smooth -1..1 wobble along the run (no per-point noise: the points are ~1 m apart). */
const hedgeWobble=(x:number,z:number)=>.55*Math.sin(x*1.37+z*.71)+.45*Math.sin(x*.53-z*1.19+2.1);
const hash=(a:number,b:number)=>{const v=Math.sin(a*127.1+b*311.7+74.7)*43758.5453;return v-Math.floor(v);};
/** The wall's face as coursed stone: level courses WALL.course tall counted down from the top, blocks WALL.block long with the
 *  joints of alternate courses half a block apart (and a joint at every corner), one quad per block. Each block's linear tint goes
 *  to `userData.vertexTint`. `out`: metres proud of the line; `below`: how far under the ground the face carries on. */
function blockFace(t:Tools,pts:readonly WallPt[],color:string,out=0,below=.5,seed=0){
 const S=[0];for(let i=1;i<pts.length;i++)S.push(S[i-1]+Math.hypot(pts[i].x-pts[i-1].x,pts[i].z-pts[i-1].z));
 const dir=(i:number)=>Math.atan2(pts[i+1].z-pts[i].z,pts[i+1].x-pts[i].x),corner=(i:number)=>{if(i<=0||i>=pts.length-1)return true;let d=Math.abs(dir(i)-dir(i-1));if(d>Math.PI)d=2*Math.PI-d;return d>.14;};
 const at=(s:number,i:number)=>{const l=S[i+1]-S[i]||1,u=(s-S[i])/l,a=pts[i],b=pts[i+1],nx=(b.z-a.z)/l,nz=-(b.x-a.x)/l;return {x:a.x+(b.x-a.x)*u+nx*out,z:a.z+(b.z-a.z)*u+nz*out,foot:a.foot+(b.foot-a.foot)*u};};
 let tris=0;
 // Straight (or gently curved) stretches between corners, each cut into ≤ WALL.piece m meshes.
 for(let c0=0;c0<pts.length-1;){let c1=c0+1;while(!corner(c1))c1++;
  for(let s=c0;s<c1;){let e=s;while(e<c1&&S[e]-S[s]<WALL.piece)e++;
   const cx=(pts[s].x+pts[e].x)/2,cz=(pts[s].z+pts[e].z)/2,pos:number[]=[],tint:number[]=[],top=pts[s].top;let low=Infinity;for(let i=s;i<=e;i++)low=Math.min(low,pts[i].foot);
   for(let k=0;top-k*WALL.course>low-below+.01;k++){const y1=top-k*WALL.course,y0=y1-WALL.course,off=k%2?WALL.block/2:0;
    // joints: the piece's ends, every block length (staggered), and the polyline's own vertices only where a block would span them on a curve
    const joints=[S[s]];for(let j=Math.ceil((S[s]-off)/WALL.block+.25);j*WALL.block+off<S[e]-WALL.block*.25;j++)joints.push(j*WALL.block+off);joints.push(S[e]);
    let seg=s;for(let j=0;j<joints.length-1;j++){const sa=joints[j],sb=joints[j+1];while(seg<e-1&&S[seg+1]<=sa+1e-6)seg++;let sg=seg;while(sg<e-1&&S[sg+1]<sb-1e-6)sg++;
     const A=at(sa,seg),B=at(sb,sg),foot=Math.min(A.foot,B.foot),yb=Math.max(y0,foot-below);if(y1-yb<.02)continue;
     pos.push(A.x-cx,yb,A.z-cz,A.x-cx,y1,A.z-cz,B.x-cx,yb,B.z-cz,A.x-cx,y1,A.z-cz,B.x-cx,y1,B.z-cz,B.x-cx,yb,B.z-cz);
     // The block's own tint: value ± 8% (one in nine a darker stone), a little warmer or cooler; damp and green toward the foot.
     const id=Math.round(sa*8)+seed*977,h1=hash(id,k),h2=hash(id+.5,k+7),v=(hash(id+.25,k+3)<.11?.84:.93+.15*h1),w=(h2-.5)*.07,hh=(y0+y1)/2-Math.max(A.foot,B.foot),damp=hh<.55?1:hh<1.5?1-(hh-.55)/.95:0;
     const r=v*(1+w)*(1-.2*damp),g=v*(1-.13*damp),b=v*(1-w)*(1-.24*damp),hi=k===0?.68:1,lo=k===0?.98:.8;// k 0: the coping's shadow; below: each course shades its own bed
     for(const f of [lo,hi,lo,hi,hi,lo])tint.push(r*f,g*f,b*f);tris+=2;}}
   if(pos.length){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.computeVertexNormals();t.put(g,color,cx,0,cz).userData.vertexTint=new Float32Array(tint);}
   s=e;}
  c0=c1;}
 return tris;
}
/** One wall along `pts` (its face on the right of the direction of travel): coursed face, plinth, coping, buttresses, hedge. */
function wall(t:Tools,pts:readonly WallPt[],o:{hedge:boolean;buttress:boolean},seed=0){
 let tris=blockFace(t,pts,WALL.stone,0,.5,seed);
 // The plinth: two heavier courses standing 9 cm proud, with a weathered (sloped) top.
 tris+=sweep(t,pts,WALL.plinth,[[.09,'foot',-.5],[.09,'foot',.46],[0,'foot',.56]]);
 tris+=sweep(t,pts,WALL.coping,[[.12,'top',-.04],[.12,'top',WALL.copingH],[-.75,'top',WALL.copingH],[-.75,'top',-.04]],true);
 if(o.hedge&&broadleafTreesOn()){// Leftovers B (Nov 26 2026 night): a rounded, uneven top (shoulders and crown wobble along the run) and
  // soft low swells standing proud, so the hedge's top edge is no longer one ruled line.
  const H=WALL.copingH+WALL.hedgeH,Wd=WALL.hedgeW;
  tris+=sweep(t,pts,WALL.hedge,[[-.1,'top',WALL.copingH],[-.1,'top',H-.1,undefined,.04],[-.1-Wd/2,'top',H+.04,undefined,.09],[-.1-Wd,'top',H-.1,undefined,.04],[-.1-Wd,'top',WALL.copingH]],true);// 5 points (2 more tris a step than the box): the west stadium's triangle budget
  // long, low swells along the run (aligned with it, half sunk into the top) at an uneven 1.6-3.4 m spacing: growth, not a row of pebbles
  let run=1.1,next=2;for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],l=Math.hypot(b.x-a.x,b.z-a.z);if(l<1e-6)continue;run+=l;if(run<next)continue;run=0;next=1.6+1.8*hash(b.x*.7+seed,b.z*1.3);
   const nx=(b.z-a.z)/l,nz=-(b.x-a.x)/l,k=hash(b.x+seed,b.z),r=.36+.24*k,off=-.1-Wd*(.38+.24*hash(b.z,b.x+seed));
   tris+=8;const c=t.put(hedgeClump(b.x*3.1+b.z),WALL.hedge,b.x+nx*off,b.top+H-.03+hedgeWobble(b.x,b.z)*.05,b.z+nz*off);c.scale.set(r*2.1,r*.42,r*.95);c.rotation.y=Math.atan2(-(b.z-a.z),b.x-a.x);}}
 else if(o.hedge)tris+=sweep(t,pts,WALL.hedge,[[-.1,'top',WALL.copingH],[-.1,'top',WALL.copingH+WALL.hedgeH],[-.1-WALL.hedgeW,'top',WALL.copingH+WALL.hedgeH],[-.1-WALL.hedgeW,'top',WALL.copingH]],true);
 // Buttresses (where the wall stands 1.4 m or more): a pilaster on its own darker base, a capstone over the coping.
 if(o.buttress){let run=WALL.buttress/2;for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],l=Math.hypot(b.x-a.x,b.z-a.z);run+=l;if(run<WALL.buttress||b.top-b.foot<1.4)continue;run=0;
   const h=b.top-b.foot+.5+WALL.copingH+.06,nx=(b.z-a.z)/l,nz=-(b.x-a.x)/l,ry=Math.atan2(-nz,nx),m=t.put(new T.BoxGeometry(.34,h,1),WALL.pilaster,b.x+nx*.15,b.foot-.5+h/2,b.z+nz*.15);m.rotation.y=ry;
   const base=t.put(new T.BoxGeometry(.5,1.2,1.16),WALL.plinth,b.x+nx*.17,b.foot+.1,b.z+nz*.17);base.rotation.y=ry;
   const cap=t.put(new T.BoxGeometry(.52,.16,1.18),WALL.coping,b.x+nx*.15,b.foot-.5+h+.08,b.z+nz*.15);cap.rotation.y=ry;tris+=36;}}
 return tris;
}
/** A pier (the end of a wall, the sides of a stair's mouth): a square post with a cap, from below the ground at its spot. */
function pier(t:Tools,x:number,z:number,top:number){const foot=Math.min(westNatural(x,z),top)-.5,h=top-foot;t.put(new T.BoxGeometry(1,h,1),WALL.stone,x,foot+h/2,z);t.put(new T.BoxGeometry(1.2,.16,1.2),WALL.coping,x,top+.08,z);t.obstacles.push({x,z,w:1,d:1});return 24;}
const stairLength=(s:Stair)=>{for(let d=s.inset+.25;d<s.len;d+=.25)if(WEST.terrace-s.slope*d<=westNatural(s.x+s.dx*d,s.z+s.dz*d)+.02)return d;return s.len;};
function stairs(t:Tools,s:Stair){
 const L=stairLength(s),rise=.14,run=rise/s.slope,n=Math.ceil(L/run),px=-s.dz,pz=s.dx;let tris=0;
 // Treads: each a block from under the ground to its tread (the walked ramp passes through every nosing).
 for(let k=0;k<n;k++){const d0=k*run,top=WEST.terrace-s.slope*(d0+run*.5)+.01,mx=s.x+s.dx*(d0+run/2),mz=s.z+s.dz*(d0+run/2),foot=Math.min(westNatural(mx,mz),top)-.3,h=top-foot;
  t.put(new T.BoxGeometry(s.dx?run+.03:s.w,h,s.dx?s.w:run+.03),WALL.tread,mx,foot+h/2,mz);tris+=12;}
 // Cheek walls with a low parapet either side, and piers at the mouth (on the terrace's edge) and the foot.
 for(const side of [-1,1]){const pts:WallPt[]=[];for(let d=s.inset;d<=L+.001;d+=(L-s.inset)/Math.ceil(L-s.inset)){const x=s.x+s.dx*d+px*side*(s.w/2+.25),z=s.z+s.dz*d+pz*side*(s.w/2+.25);pts.push({x,z,top:WEST.terrace-s.slope*d+.75,foot:westNatural(x,z)});}
  const out=pts;// a closed prism: both faces and the top are wound right whichever way it runs
  tris+=sweep(t,out,WALL.stone,[[.25,'foot',-.5],[.25,'top',0],[-.25,'top',0],[-.25,'foot',-.5]]);tris+=sweep(t,out,WALL.coping,[[.31,'top',-.03],[.31,'top',.12],[-.31,'top',.12],[-.31,'top',-.03]],true);
  const mx=s.x+s.dx*(L+s.inset)/2+px*side*(s.w/2+.25),mz=s.z+s.dz*(L+s.inset)/2+pz*side*(s.w/2+.25);t.obstacles.push({x:mx,z:mz,w:s.dx?L-s.inset:.5,d:s.dx?.5:L-s.inset});
  tris+=pier(t,s.x+s.dx*(s.inset-.5)+px*side*(s.w/2+.5),s.z+s.dz*(s.inset-.5)+pz*side*(s.w/2+.5),WEST.terrace+WALL.copingH+WALL.hedgeH+.12);
  tris+=pier(t,s.x+s.dx*(L+.3)+px*side*(s.w/2+.25),s.z+s.dz*(L+.3)+pz*side*(s.w/2+.25),westNatural(s.x+s.dx*L,s.z+s.dz*L)+1);}
 return tris;
}
/** Stadium Plaza's garden walls (audit, Nov 26 2026): from the play camera the 7.6% plaza read as flat ground. A low coursed wall
 *  along each side of the paving, in level lengths that STEP down the hill between square piers, shows the grade the way a
 *  hillside street does (a level coping against sloping paving). Open at the trail mouths (x -106) and on the level top and foot. */
const PLAZA_WALL={out:.42,thick:.44,rise:.4,runs:[[-124,-110,2],[-102,-74,4]]} as const;
function plazaWalls(t:Tools){
 let tris=0;
 for(const side of [-1,1]){const z=(side<0?STADIUM_PLAZA.minZ:STADIUM_PLAZA.maxZ)+side*PLAZA_WALL.out,h=PLAZA_WALL.thick/2;
  for(const [x0,x1,n] of PLAZA_WALL.runs){const len=(x1-x0)/n;
   for(let k=0;k<n;k++){const a=x0+k*len,b=a+len,top=westGround(a,z)+PLAZA_WALL.rise,fa=westGround(a,z),fb=westGround(b,z);
    tris+=blockFace(t,[{x:a,z:z-h,top,foot:fa},{x:b,z:z-h,top,foot:fb}],WALL.stone,0,.3,k+side*5+x0);tris+=blockFace(t,[{x:b,z:z+h,top,foot:fb},{x:a,z:z+h,top,foot:fa}],WALL.stone,0,.3,k+side*7+x0+1);
    t.put(new T.BoxGeometry(len,.12,PLAZA_WALL.thick+.14),WALL.coping,(a+b)/2,top+.06,z);tris+=12;
    // the pier at the segment's lower end (and one at the run's top): the step happens behind it
    for(const px of k?[b]:[a,b]){const g=westGround(px,z),ph=top+.22-g+.3;t.put(new T.BoxGeometry(.66,ph,.66),WALL.pilaster,px,g-.3+ph/2,z);t.put(new T.BoxGeometry(.8,.12,.8),WALL.coping,px,top+.28,z);tris+=24;}}
   t.obstacles.push({x:(x0+x1)/2,z,w:x1-x0+.6,d:.6});}}
 return tris;
}
export type WestWallStats={triangles:number;length:number;tallest:number;colliders:number;stairs:number};
/** Call inside elevation.ts `unlifted(...)`: every piece here carries its own heights. */
export function buildWestWalls(t:Tools):WestWallStats{
 const stats:WestWallStats={triangles:0,length:0,tallest:0,colliders:0,stairs:WEST_STAIRS.length};if(!elevationOn())return stats;
 const H=WEST.terrace,C=WEST_TERRACE,o=terraceOutline(1.5),ring:WallPt[]=[];
 // The outline, resampled every ≤ 1.5 m on the straights too; the foot is the natural ground 0.3 m outside.
 for(let i=0;i<o.length;i++){const a=o[i],b=o[(i+1)%o.length],l=Math.hypot(b.x-a.x,b.z-a.z),n=Math.max(1,Math.ceil(l/1.5));
  for(let k=0;k<n;k++){const x=a.x+(b.x-a.x)*k/n,z=a.z+(b.z-a.z)*k/n,d=Math.hypot(x-C.x,z-C.z)||1;ring.push({x,z,top:H,foot:Math.min(H,westNatural(x+(x-C.x)/d*.3,z+(z-C.z)/d*.3),westNatural(x,z))});}}
 // The top of a flight (the notch's back edge, or the mouth on the terrace's edge) is open.
 const inStair=(p:WallPt)=>WEST_STAIRS.some(s=>{const {t,a}=stairLocal(s,p.x,p.z);return Math.abs(t)<.4&&Math.abs(a)<s.w/2-.05;});
 // Runs: `tall` (hedge, buttresses, a collider) and `kerb` (a low wall you step over), broken at the stairs' mouths.
 const kind=(p:WallPt)=>inStair(p)?0:H-p.foot>WALL.low?2:H-p.foot>.012?1:0,n=ring.length;
 let start=0;while(start<n&&kind(ring[start])===kind(ring[(start+n-1)%n]))start++;
 for(let i=0;i<n;){const k=kind(ring[(start+i)%n]);let j=i;while(j<n&&kind(ring[(start+j)%n])===k)j++;
  if(k){const pts:WallPt[]=[],K=(q:number)=>kind(ring[(start+q+n)%n]);// one point on into a neighbouring run (a kerb tapering out of a wall), never into a stair's mouth
   for(let q=i-(K(i-1)?1:0);q<=j-(K(j)?0:1);q++)pts.push(ring[(start+q+n)%n]);
   stats.triangles+=k===2?wall(t,pts,{hedge:true,buttress:true},i):sweep(t,pts,WALL.stone,[[0,'foot',-.3],[0,'top',0]])+sweep(t,pts,WALL.coping,[[.06,'top',-.03],[.06,'top',.06],[-.5,'top',.06],[-.5,'top',-.03]],true);
   if(k===2)for(let q=0;q<pts.length-1;q++){const a=pts[q],b=pts[q+1],l=Math.hypot(b.x-a.x,b.z-a.z);stats.length+=l;stats.tallest=Math.max(stats.tallest,H-a.foot);}
   // Colliders (tall runs): one long box on a straight (axis-aligned) stretch, 1.6 m rounded boxes round the corners.
   if(k===2){let q=0;while(q<pts.length-1){let e=q+1;const ax=Math.abs(pts[e].x-pts[q].x)<1e-6,az=Math.abs(pts[e].z-pts[q].z)<1e-6;
     if(ax||az){while(e<pts.length-1&&(ax?Math.abs(pts[e+1].x-pts[q].x)<1e-6:Math.abs(pts[e+1].z-pts[q].z)<1e-6))e++;const a=pts[q],b=pts[e],inx=Math.sign(C.x-a.x),inz=Math.sign(C.z-a.z);
      t.obstacles.push(ax?{x:a.x+inx*.4,z:(a.z+b.z)/2,w:.9,d:Math.abs(b.z-a.z)}:{x:(a.x+b.x)/2,z:a.z+inz*.4,w:Math.abs(b.x-a.x),d:.9});}
     else{const a=pts[q],d=Math.hypot(a.x-C.x,a.z-C.z)||1;t.obstacles.push({x:a.x-(a.x-C.x)/d*.4,z:a.z-(a.z-C.z)/d*.4,w:1.7,d:1.7,cornerRadius:.85});}
     stats.colliders++;q=e;}}}
  i=j;}
 for(const s of WEST_STAIRS)stats.triangles+=stairs(t,s);
 stats.triangles+=plazaWalls(t);
 return stats;
}
