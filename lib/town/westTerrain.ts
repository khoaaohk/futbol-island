// The west side's raised ground, the drawn side (heights: westElevation.ts; the system: elevation.ts). Build-time only: no
// per-frame work, no new material, texture, program or draw.
//  - westLawnPatch(): the natural ground (the embankments, the pond's hollow, the long hillside up from the town) as an adaptive
//    grid on the walked height's own 2 m lattice, and the terrace's level top as a fan. fields.ts MERGES it into the main lawn's
//    geometry (same mesh, same material: 0 draws); the flat lawn stays underneath.
//  - buildWestWalls(): the retaining wall round the terrace wherever it stands above the natural ground (stone face, darker
//    plinth, course lines, coping, buttresses, a clipped hedge on top), the two flights of stairs through it and their colliders.
//    Pieces go through world.ts `put`, so they merge into the chunk's paint batch and take its baked light (walls darken to the foot).
import * as T from 'three';
import {elevationOn} from './elevation';
import {WEST,WEST_BOX,WEST_TERRACE,WEST_STAIRS,westNatural,onWestTerrace,terraceOutline,type Stair} from './westElevation';
import type {Obstacle} from './simulation';

export type LawnPatch={position:number[];normal:number[];uv:number[];index:number[];triangles:number};
/** `fine`: the smallest cell (2 m = the walked lattice; 4 m on the lowest tier: a coarser slope, ≤ ~6 cm off the walked height). */
export function westLawnPatch(fine:2|4=2):LawnPatch|null{
 if(!elevationOn())return null;
 const position:number[]=[],normal:number[]=[],uv:number[]=[],index:number[]=[],ids=new Map<number,number>(),B=WEST_BOX,H=WEST.terrace,nx=Math.round((B.maxX-B.minX)/2)+1;
 const vert=(x:number,z:number)=>{const key=Math.round((z-B.minZ)/2)*nx+Math.round((x-B.minX)/2);let i=ids.get(key);if(i!==undefined)return i;
  const h=westNatural(x,z),gx=(westNatural(x+1,z)-westNatural(x-1,z))/2,gz=(westNatural(x,z+1)-westNatural(x,z-1))/2,l=Math.hypot(gx,1,gz);
  i=position.length/3;position.push(x,h>.02?h:-.03,z);normal.push(-gx/l,1/l,-gz/l);uv.push(x,-z);ids.set(key,i);return i;};
 const quad=(x:number,z:number,s:number)=>{const a=vert(x,z),b=vert(x+s,z),c=vert(x,z+s),d=vert(x+s,z+s);index.push(a,c,b,b,c,d);};
 /** Is the s-metre block at (x, z) a plane (its 2 m samples within 1.2 cm of its corners' bilinear patch)? */
 const planar=(x:number,z:number,s:number)=>{const a=westNatural(x,z),b=westNatural(x+s,z),c=westNatural(x,z+s),d=westNatural(x+s,z+s);
  for(let i=0;i<=s;i+=2)for(let j=0;j<=s;j+=2){const u=i/s,v=j/s;if(Math.abs(westNatural(x+i,z+j)-((a+(b-a)*u)*(1-v)+(c+(d-c)*u)*v))>.012)return false;}return true;};
 const skip=(x:number,z:number,s:number)=>{let flat=true,inside=true;for(let i=0;i<=s;i+=2)for(let j=0;j<=s;j+=2){if(westNatural(x+i,z+j)>.005)flat=false;if(!onWestTerrace(x+i,z+j))inside=false;}return flat||inside;};
 for(let x=B.minX;x<B.maxX;x+=8)for(let z=B.minZ;z<B.maxZ;z+=8){
  if(skip(x,z,8))continue;if(planar(x,z,8)){quad(x,z,8);continue;}
  for(const ox of [0,4])for(const oz of [0,4]){const qx=x+ox,qz=z+oz;if(skip(qx,qz,4))continue;if(fine===4||planar(qx,qz,4)){quad(qx,qz,4);continue;}
   for(const px of [0,2])for(const pz of [0,2])if(!skip(qx+px,qz+pz,2))quad(qx+px,qz+pz,2);}}
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
export const WALL={stone:'#cdbb93',plinth:'#a8956f',course:'#b3a07a',coping:'#e9dfc4',hedge:'#5d8a4f',tread:'#e2d6b6',
 /** Below this the terrace's edge is a kerb you step over (no hedge, no collider). */
 low:.32,hedgeH:.85,hedgeW:.7,copingH:.2,piece:12,buttress:9} as const;
type WallPt={x:number;z:number;top:number;foot:number};
type Tools={put:(g:T.BufferGeometry,color:string,x:number,y:number,z:number)=>T.Mesh;obstacles:Obstacle[]};
/** A strip swept along `pts` (≤ WALL.piece m per mesh): `profile` = [offset outward, height above/below (`from`: the wall's top
 *  or foot), min clearance over the foot] points, listed bottom-outer → up → inward so every face looks out or up. */
function sweep(t:Tools,pts:readonly WallPt[],color:string,profile:readonly (readonly [number,'top'|'foot',number,number?])[],caps=false){
 let tris=0;
 for(let s=0;s<pts.length-1;){let e=s,len=0;while(e<pts.length-1&&len<WALL.piece){len+=Math.hypot(pts[e+1].x-pts[e].x,pts[e+1].z-pts[e].z);e++;}
  const cx=(pts[s].x+pts[e].x)/2,cz=(pts[s].z+pts[e].z)/2,pos:number[]=[],idx:number[]=[],m=profile.length;
  for(let i=s;i<=e;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],tx=b.x-a.x,tz=b.z-a.z,l=Math.hypot(tx,tz)||1,nx=tz/l,nz=-tx/l,p=pts[i];
   for(const [off,from,dy,floor] of profile){let y=(from==='top'?p.top:p.foot)+dy;if(floor!==undefined&&y<p.foot+floor)y=p.foot+floor;pos.push(p.x+nx*off-cx,y,p.z+nz*off-cz);}}
  for(let i=0;i<e-s;i++)for(let j=0;j<m-1;j++){const a=i*m+j,b=a+1,c=a+m,d=c+1;idx.push(a,b,c,b,d,c);}
  if(caps&&m>2){for(const [row,flip] of [[0,false],[e-s,true]] as const)for(let j=1;j<m-1;j++){const a=row*m,b=row*m+j,c=row*m+j+1;if(flip)idx.push(a,b,c);else idx.push(a,c,b);}}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setIndex(idx);const flat=g.toNonIndexed();g.dispose();flat.computeVertexNormals();
  t.put(flat,color,cx,0,cz);tris+=idx.length/3;s=e;}
 return tris;
}
/** One wall along `pts` (its face on the right of the direction of travel): face, plinth, course lines, coping, hedge. */
function wall(t:Tools,pts:readonly WallPt[],o:{hedge:boolean;buttress:boolean}){
 let tris=sweep(t,pts,WALL.stone,[[0,'foot',-.5],[0,'top',0]]);
 tris+=sweep(t,pts,WALL.plinth,[[.09,'foot',-.5],[.09,'foot',.42],[0,'foot',.42]]);
 const tall=Math.max(...pts.map(p=>p.top-p.foot));
 for(let k=1;k*.62<tall-.5;k++)tris+=sweep(t,pts,WALL.course,[[.014,'top',-k*.62-.035,.42],[.014,'top',-k*.62+.035,.42]]);
 tris+=sweep(t,pts,WALL.coping,[[.1,'top',-.03],[.1,'top',WALL.copingH],[-.75,'top',WALL.copingH],[-.75,'top',-.03]],true);
 if(o.hedge)tris+=sweep(t,pts,WALL.hedge,[[-.1,'top',WALL.copingH],[-.1,'top',WALL.copingH+WALL.hedgeH],[-.1-WALL.hedgeW,'top',WALL.copingH+WALL.hedgeH],[-.1-WALL.hedgeW,'top',WALL.copingH]],true);
 if(o.buttress){let run=WALL.buttress/2;for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],l=Math.hypot(b.x-a.x,b.z-a.z);run+=l;if(run<WALL.buttress||b.top-b.foot<1.4)continue;run=0;
   const h=b.top-b.foot+.5+WALL.copingH+.06,nx=(b.z-a.z)/l,nz=-(b.x-a.x)/l,m=t.put(new T.BoxGeometry(.3,h,.95),WALL.stone,b.x+nx*.13,b.foot-.5+h/2,b.z+nz*.13);m.rotation.y=Math.atan2(-nz,nx);
   const cap=t.put(new T.BoxGeometry(.46,.14,1.11),WALL.coping,b.x+nx*.13,b.foot-.5+h+.07,b.z+nz*.13);cap.rotation.y=m.rotation.y;tris+=24;}}
 return tris;
}
/** A pier (the end of a wall, the sides of a stair's mouth): a square post with a cap, from below the ground at its spot. */
function pier(t:Tools,x:number,z:number,top:number){const foot=Math.min(westNatural(x,z),top)-.5,h=top-foot;t.put(new T.BoxGeometry(1,h,1),WALL.stone,x,foot+h/2,z);t.put(new T.BoxGeometry(1.2,.16,1.2),WALL.coping,x,top+.08,z);t.obstacles.push({x,z,w:1,d:1});return 24;}
const stairLength=(s:Stair)=>{for(let d=.25;d<s.len;d+=.25)if(WEST.terrace-s.slope*d<=westNatural(s.x+s.dx*d,s.z+s.dz*d)+.02)return d;return s.len;};
function stairs(t:Tools,s:Stair){
 const L=stairLength(s),rise=.14,run=rise/s.slope,n=Math.ceil(L/run),px=-s.dz,pz=s.dx;let tris=0;
 // Treads: each a block from under the ground to its tread (the walked ramp passes through every nosing).
 for(let k=0;k<n;k++){const d0=k*run,top=WEST.terrace-s.slope*(d0+run*.5)+.01,mx=s.x+s.dx*(d0+run/2),mz=s.z+s.dz*(d0+run/2),foot=Math.min(westNatural(mx,mz),top)-.3,h=top-foot;
  t.put(new T.BoxGeometry(s.dx?run+.03:s.w,h,s.dx?s.w:run+.03),WALL.tread,mx,foot+h/2,mz);tris+=12;}
 // Cheek walls with a low parapet either side, and piers at the mouth (on the terrace's edge) and the foot.
 for(const side of [-1,1]){const pts:WallPt[]=[];for(let d=0;d<=L+.001;d+=Math.min(1,L)){const x=s.x+s.dx*d+px*side*(s.w/2+.25),z=s.z+s.dz*d+pz*side*(s.w/2+.25);pts.push({x,z,top:WEST.terrace-s.slope*d+.75,foot:westNatural(x,z)});}
  const out=pts;// a closed prism: both faces and the top are wound right whichever way it runs
  tris+=sweep(t,out,WALL.stone,[[.25,'foot',-.5],[.25,'top',0],[-.25,'top',0],[-.25,'foot',-.5]]);tris+=sweep(t,out,WALL.coping,[[.31,'top',-.03],[.31,'top',.12],[-.31,'top',.12],[-.31,'top',-.03]],true);
  const mx=s.x+s.dx*L/2+px*side*(s.w/2+.25),mz=s.z+s.dz*L/2+pz*side*(s.w/2+.25);t.obstacles.push({x:mx,z:mz,w:s.dx?L:.5,d:s.dx?.5:L});
  tris+=pier(t,s.x+px*side*(s.w/2+.5)-s.dx*.5,s.z+pz*side*(s.w/2+.5)-s.dz*.5,WEST.terrace+WALL.copingH+WALL.hedgeH+.12);
  tris+=pier(t,s.x+s.dx*(L+.3)+px*side*(s.w/2+.25),s.z+s.dz*(L+.3)+pz*side*(s.w/2+.25),westNatural(s.x+s.dx*L,s.z+s.dz*L)+1);}
 return tris;
}
export type WestWallStats={triangles:number;length:number;tallest:number;colliders:number;stairs:number};
/** Call inside elevation.ts `unlifted(...)`: every piece here carries its own heights. */
export function buildWestWalls(t:Tools):WestWallStats{
 const stats:WestWallStats={triangles:0,length:0,tallest:0,colliders:0,stairs:WEST_STAIRS.length};if(!elevationOn())return stats;
 const H=WEST.terrace,C=WEST_TERRACE,o=terraceOutline(1.5),ring:WallPt[]=[];
 // The outline, resampled every ≤ 1.5 m on the straights too; the foot is the natural ground 0.3 m outside.
 for(let i=0;i<o.length;i++){const a=o[i],b=o[(i+1)%o.length],l=Math.hypot(b.x-a.x,b.z-a.z),n=Math.max(1,Math.ceil(l/1.5));
  for(let k=0;k<n;k++){const x=a.x+(b.x-a.x)*k/n,z=a.z+(b.z-a.z)*k/n,d=Math.hypot(x-C.x,z-C.z)||1;ring.push({x,z,top:H,foot:Math.min(H,westNatural(x+(x-C.x)/d*.3,z+(z-C.z)/d*.3))});}}
 const inStair=(p:WallPt)=>WEST_STAIRS.some(s=>{const ax=p.x-s.x,az=p.z-s.z;return Math.abs(ax*s.dx+az*s.dz)<1.2&&Math.abs(-ax*s.dz+az*s.dx)<s.w/2+.5;});
 // Runs: `tall` (hedge, buttresses, a collider) and `kerb` (a low wall you step over), broken at the stairs' mouths.
 const kind=(p:WallPt)=>inStair(p)?0:H-p.foot>WALL.low?2:H-p.foot>.012?1:0,n=ring.length;
 let start=0;while(start<n&&kind(ring[start])===kind(ring[(start+n-1)%n]))start++;
 for(let i=0;i<n;){const k=kind(ring[(start+i)%n]);let j=i;while(j<n&&kind(ring[(start+j)%n])===k)j++;
  if(k){const pts:WallPt[]=[];for(let q=Math.max(0,i-1);q<=Math.min(n,j);q++)pts.push(ring[(start+q)%n]);
   stats.triangles+=k===2?wall(t,pts,{hedge:true,buttress:true}):sweep(t,pts,WALL.stone,[[0,'foot',-.3],[0,'top',0]])+sweep(t,pts,WALL.coping,[[.06,'top',-.03],[.06,'top',.06],[-.5,'top',.06],[-.5,'top',-.03]],true);
   if(k===2)for(let q=0;q<pts.length-1;q++){const a=pts[q],b=pts[q+1],l=Math.hypot(b.x-a.x,b.z-a.z);stats.length+=l;stats.tallest=Math.max(stats.tallest,H-a.foot);}
   // Colliders (tall runs): one long box on a straight (axis-aligned) stretch, 1.6 m rounded boxes round the corners.
   if(k===2){let q=0;while(q<pts.length-1){let e=q+1;const ax=Math.abs(pts[e].x-pts[q].x)<1e-6,az=Math.abs(pts[e].z-pts[q].z)<1e-6;
     if(ax||az){while(e<pts.length-1&&(ax?Math.abs(pts[e+1].x-pts[q].x)<1e-6:Math.abs(pts[e+1].z-pts[q].z)<1e-6))e++;const a=pts[q],b=pts[e],inx=Math.sign(C.x-a.x),inz=Math.sign(C.z-a.z);
      t.obstacles.push(ax?{x:a.x+inx*.4,z:(a.z+b.z)/2,w:.9,d:Math.abs(b.z-a.z)}:{x:(a.x+b.x)/2,z:a.z+inz*.4,w:Math.abs(b.x-a.x),d:.9});}
     else{const a=pts[q],d=Math.hypot(a.x-C.x,a.z-C.z)||1;t.obstacles.push({x:a.x-(a.x-C.x)/d*.4,z:a.z-(a.z-C.z)/d*.4,w:1.7,d:1.7,cornerRadius:.85});}
     stats.colliders++;q=e;}}}
  i=j;}
 for(const s of WEST_STAIRS)stats.triangles+=stairs(t,s);
 return stats;
}
