// Coral Cay's drawn lawn under elevation (Nov 26 2026). Replaces the polar star mesh of stage 1 (224 x 36, up to ~6 cm away
// from the walked height at the dune's foot; at the new heights it would have been twice that: feet sinking into the grass).
//
// The walked height IS the region's 2 m grid read bilinearly (elevation.ts). This mesh is that same grid:
//  - every grid cell that lies wholly on the lawn is drawn at the grid's own heights, so the drawn lawn and the walked height
//    agree to the twist of one cell (millimetres), on every tier that draws the full mesh;
//  - blocks of 2 x 2 … 8 x 8 cells that are one plane within `tolerance` (terraces, the plaza, the flat verge, the pinned court
//    side) are drawn as one quad. Where a merged block meets finer ones it is drawn as a fan through every shared grid point,
//    so there is no T-junction and no crack (the sand-coloured foundation lies under the lawn: a crack would sparkle);
//  - the verge between the grid and the lawn's outline (flat: the rise starts EDGE_CLEAR metres in) is ear-cut, its outer edge
//    the outline itself at the datum, so it still meets the beach ring edge to edge.
// Tiers: `coarse` (the world was built on the LOWEST heat tier: Battery saver) merges with a 6 cm tolerance instead of 4 mm.
// Depth cues, free (no colour attribute, no shader, no program): the vertex NORMALS carry them. The sun never moves
// (islandLighting.ts), so (1) the slope part of each normal is exaggerated (SLOPE_GAIN: an 18 degree bank is lit like the track
// bed's 30 degree shoulder) and (2) concave ground (a bank's foot) leans away from the sun and convex ground (its crest) toward
// it: a darker foot and a lighter crest all the way round the island, whichever way the bank faces. Day and night agree (the
// moon is the same light).
import * as T from 'three';
import type {Pt} from './elevation';

export type CayTerrainStats={triangles:number;blocks:number;merged:number;fringe:number};
export const TERRAIN_SHADE={slopeGain:1.8,foot:.5,crest:.3,curve:.08} as const;
export function buildGridTerrain(o:{outline:readonly Pt[];centre:Pt;ground:(x:number,z:number)=>number;box:{minX:number;maxX:number;minZ:number;maxZ:number};step?:number;coarse?:boolean;sun:readonly [number,number,number];inset?:number}){
 const {outline,centre:C,ground,box}=o,step=o.step??2,tol=o.coarse?.06:.004,inset=o.inset??.6,MAX=8;
 const x0=Math.floor(box.minX)-step,z0=Math.floor(box.minZ)-step,nx=Math.ceil((box.maxX-x0)/step)+2,nz=Math.ceil((box.maxZ-z0)/step)+2;
 const inside=(x:number,z:number)=>{let c=false,near=Infinity;for(let i=0,j=outline.length-1;i<outline.length;j=i++){const a=outline[i],b=outline[j];if((a.z>z)!==(b.z>z)&&x<(b.x-a.x)*(z-a.z)/(b.z-a.z)+a.x)c=!c;
   const dx=b.x-a.x,dz=b.z-a.z,t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz||1))),d=Math.hypot(x-a.x-t*dx,z-a.z-t*dz);if(d<near)near=d;}return c&&near>=inset;};
 const H=new Float32Array(nx*nz),nodeIn=new Uint8Array(nx*nz);
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=x0+i*step,z=z0+j*step;if(inside(x,z)){nodeIn[j*nx+i]=1;H[j*nx+i]=ground(x,z);}}
 const cellOk=(i:number,j:number)=>i>=0&&j>=0&&i<nx-1&&j<nz-1&&nodeIn[j*nx+i]&&nodeIn[j*nx+i+1]&&nodeIn[(j+1)*nx+i]&&nodeIn[(j+1)*nx+i+1]?1:0;
 // ---- Blocks: the largest aligned squares that are whole and one plane.
 const blocks:[number,number,number][]=[],used=new Uint8Array(nx*nz);
 const plane=(i:number,j:number,s:number)=>{const a=H[j*nx+i],b=H[j*nx+i+s],c=H[(j+s)*nx+i],d=H[(j+s)*nx+i+s];
  for(let v=0;v<=s;v++)for(let u=0;u<=s;u++){if(!cellOk(Math.min(i+u,i+s-1),Math.min(j+v,j+s-1)))return false;const tu=u/s,tv=v/s;if(Math.abs((a+(b-a)*tu)*(1-tv)+(c+(d-c)*tu)*tv-H[(j+v)*nx+i+u])>tol)return false;}
  return Math.abs(a+d-b-c)<=tol*2;};
 const take=(i:number,j:number,s:number)=>{
  if(s===1){if(cellOk(i,j))blocks.push([i,j,1]);return;}
  if(i+s<nx&&j+s<nz&&plane(i,j,s)){blocks.push([i,j,s]);return;}
  const h=s>>1;take(i,j,h);take(i+h,j,h);take(i,j+h,h);take(i+h,j+h,h);};
 for(let j=0;j<nz-1;j+=MAX)for(let i=0;i<nx-1;i+=MAX)take(i,j,MAX);
 for(const [i,j,s] of blocks){used[j*nx+i]=used[j*nx+i+s]=used[(j+s)*nx+i]=used[(j+s)*nx+i+s]=1;}
 // ---- Vertices (grid nodes shared by every block and the verge).
 const pos:number[]=[],idx:number[]=[],lap:number[]=[],vertexOf=new Int32Array(nx*nz).fill(-1);
 const node=(i:number,j:number)=>{const k=j*nx+i;let v=vertexOf[k];if(v<0){v=vertexOf[k]=pos.length/3;pos.push(x0+i*step-C.x,H[k],z0+j*step-C.z);
   // Curvature (per metre): positive = concave (a foot), negative = convex (a crest). 0 at the mesh's rim.
   const ok=i>0&&j>0&&i<nx-1&&j<nz-1&&nodeIn[k-1]&&nodeIn[k+1]&&nodeIn[k-nx]&&nodeIn[k+nx];lap.push(ok?(H[k-1]+H[k+1]+H[k-nx]+H[k+nx]-4*H[k])/(step*step):0);}return v;};
 const tri=(a:number,b:number,c:number)=>{// wound to face up
  const ux=pos[b*3]-pos[a*3],uz=pos[b*3+2]-pos[a*3+2],vx=pos[c*3]-pos[a*3],vz=pos[c*3+2]-pos[a*3+2];if(uz*vx-ux*vz>=0)idx.push(a,b,c);else idx.push(a,c,b);};
 // ---- The verge: outline (datum) to the grid's rim. Rim edges: a whole cell on one side only.
 const next=new Map<number,number[]>(),edge=(a:number,b:number)=>{used[a]=used[b]=1;const l=next.get(a);if(l)l.push(b);else next.set(a,[b]);};
 for(let j=0;j<nz-1;j++)for(let i=0;i<nx-1;i++){if(!cellOk(i,j))continue;const a=j*nx+i,b=a+1,c=a+nx,d=c+1;
  if(!cellOk(i,j-1))edge(a,b);if(!cellOk(i+1,j))edge(b,d);if(!cellOk(i,j+1))edge(d,c);if(!cellOk(i-1,j))edge(c,a);}
 const loops:number[][]=[];
 for(const start of [...next.keys()]){while(next.get(start)?.length){const loop=[start];let at=next.get(start)!.pop()!;while(at!==start){loop.push(at);const l=next.get(at);if(!l?.length)break;at=l.pop()!;}if(at===start&&loop.length>=3)loops.push(loop);}}
 let merged=0;
 for(const [i,j,s] of blocks){
  const ring:number[]=[];
  for(let u=0;u<s;u++)ring.push(j*nx+i+u);for(let v=0;v<s;v++)ring.push((j+v)*nx+i+s);for(let u=s;u>0;u--)ring.push((j+s)*nx+i+u);for(let v=s;v>0;v--)ring.push((j+v)*nx+i);
  const keep=ring.filter(k=>used[k]).map(k=>node(k%nx,(k/nx)|0));if(s>1)merged++;
  // A twisted cell (a bank's corner) is drawn as four triangles through its bilinear centre: either diagonal alone would stand a
  // quarter of the twist off the walked height.
  const twist=Math.abs(H[j*nx+i]+H[(j+s)*nx+i+s]-H[j*nx+i+s]-H[(j+s)*nx+i]);
  if(keep.length===4&&twist<=(o.coarse?.12:.03)){tri(keep[0],keep[1],keep[2]);tri(keep[0],keep[2],keep[3]);continue;}
  const mid=pos.length/3,a=H[j*nx+i],b=H[j*nx+i+s],c=H[(j+s)*nx+i],d=H[(j+s)*nx+i+s];pos.push(x0+(i+s/2)*step-C.x,(a+b+c+d)/4,z0+(j+s/2)*step-C.z);
  // The centre takes the mean curvature of its ring: at 0 it stayed unleaned among leaned corners, a bright diamond in every twisted
  // cell (a lattice of dark grid lines over each bank's foot and crest from the play camera).
  {let sum=0;for(const v of keep)sum+=lap[v];lap.push(sum/keep.length);}
  for(let k=0;k<keep.length;k++)tri(mid,keep[k],keep[(k+1)%keep.length]);
 }
 const gridTris=idx.length/3;
 {const contour=outline.map(p=>new T.Vector2(p.x-C.x,p.z-C.z)),holes=loops.map(l=>l.map(k=>new T.Vector2(x0+(k%nx)*step-C.x,z0+((k/nx)|0)*step-C.z)));
  const first=pos.length/3;for(const p of contour){pos.push(p.x,0,p.y);lap.push(0);}
  const ids:number[]=[];for(let i=0;i<contour.length;i++)ids.push(first+i);for(const l of loops)for(const k of l)ids.push(node(k%nx,(k/nx)|0));
  for(const f of T.ShapeUtils.triangulateShape(contour,holes))tri(ids[f[0]],ids[f[1]],ids[f[2]]);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
 // ---- Depth cues in the normals (header).
 {const n=g.getAttribute('normal') as T.BufferAttribute,S=TERRAIN_SHADE,sl=Math.hypot(o.sun[0],o.sun[1],o.sun[2]),sx=o.sun[0]/sl,sy=o.sun[1]/sl,sz=o.sun[2]/sl;
  for(let i=0;i<n.count;i++){let x=n.getX(i)*S.slopeGain,y=n.getY(i),z=n.getZ(i)*S.slopeGain,l=Math.hypot(x,y,z)||1;x/=l;y/=l;z/=l;
   const k=Math.max(-1,Math.min(1,lap[i]/S.curve)),lean=k>0?-S.foot*k:-S.crest*k;x+=sx*lean;y+=sy*lean;z+=sz*lean;l=Math.hypot(x,y,z)||1;n.setXYZ(i,x/l,Math.max(.2,y/l),z/l);}
  n.needsUpdate=true;}
 const stats:CayTerrainStats={triangles:idx.length/3,blocks:blocks.length,merged,fringe:idx.length/3-gridTris};
 return {geometry:g,stats};
}
