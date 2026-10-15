// Drawn-ground heights (Oct 15 2026, user: "riding on the mountain, the bike is in the island", with a screenshot of the bike's
// wheels sunk into Summit Isle's grass). The walked height (summitGround) is a smooth function; the drawn terrain is a coarser
// triangulation of it (192 bearings × ~27 rings, refined only where it strays more than 0.25 m), so on the open slopes the drawn
// grass can stand well above the walked height minus SUMMIT_VISUAL_DROP, and a ride placed on the walked height sinks into it.
// createDrawnGround indexes the drawn triangles once (lazily, on the first query) in a 2 m grid, so the ride can rest on what
// is drawn: a query reads the few triangles in one cell, no allocation. Built only when a ride first reaches the island.
import type * as T from 'three';

export type DrawnGround={height(x:number,z:number):number};
/** Topmost drawn height at (x, z) among `meshes()` (-Infinity off them). `meshes` is called once, on the first query. */
export function createDrawnGround(meshes:()=>T.Mesh[],cell=2):DrawnGround{
 let built=false,x0=0,z0=0,nx=0,nz=0,start=new Uint32Array(0),items=new Uint32Array(0),tri=new Float32Array(0);
 const build=()=>{built=true;const list=meshes();let count=0;
  for(const m of list){const g=m.geometry;count+=(g.index?g.index.count:g.attributes.position.count)/3|0;}
  tri=new Float32Array(count*9);let t=0,minX=Infinity,minZ=Infinity,maxX=-Infinity,maxZ=-Infinity;
  for(const m of list){m.updateWorldMatrix(true,false);const e=m.matrixWorld.elements,p=m.geometry.attributes.position,idx=m.geometry.index,n=idx?idx.count:p.count;
   for(let i=0;i+2<n;i+=3)for(let k=0;k<3;k++){const v=idx?idx.getX(i+k):i+k,x=p.getX(v),y=p.getY(v),z=p.getZ(v);
    const wx=e[0]*x+e[4]*y+e[8]*z+e[12],wy=e[1]*x+e[5]*y+e[9]*z+e[13],wz=e[2]*x+e[6]*y+e[10]*z+e[14];
    tri[t++]=wx;tri[t++]=wy;tri[t++]=wz;if(wx<minX)minX=wx;if(wx>maxX)maxX=wx;if(wz<minZ)minZ=wz;if(wz>maxZ)maxZ=wz;}}
  if(!count)return;x0=minX;z0=minZ;nx=Math.max(1,Math.ceil((maxX-minX)/cell)+1);nz=Math.max(1,Math.ceil((maxZ-minZ)/cell)+1);
  const range=(i:number,f:(c:number)=>void)=>{const o=i*9,a=Math.floor((Math.min(tri[o],tri[o+3],tri[o+6])-x0)/cell),b=Math.floor((Math.max(tri[o],tri[o+3],tri[o+6])-x0)/cell),
   c=Math.floor((Math.min(tri[o+2],tri[o+5],tri[o+8])-z0)/cell),d=Math.floor((Math.max(tri[o+2],tri[o+5],tri[o+8])-z0)/cell);for(let j=c;j<=d;j++)for(let q=a;q<=b;q++)f(j*nx+q);};
  start=new Uint32Array(nx*nz+1);for(let i=0;i<count;i++)range(i,c=>{start[c+1]++;});for(let c=0;c<nx*nz;c++)start[c+1]+=start[c];
  items=new Uint32Array(start[nx*nz]);const fill=start.slice(0,nx*nz);for(let i=0;i<count;i++)range(i,c=>{items[fill[c]++]=i;});};
 return {height(x:number,z:number){if(!built)build();const q=Math.floor((x-x0)/cell),j=Math.floor((z-z0)/cell);if(q<0||j<0||q>=nx||j>=nz)return -Infinity;
  let best=-Infinity;const c=j*nx+q;
  for(let k=start[c];k<start[c+1];k++){const o=items[k]*9,ax=tri[o],az=tri[o+2],bx=tri[o+3],bz=tri[o+5],cx=tri[o+6],cz=tri[o+8];
   const d=(bz-cz)*(ax-cx)+(cx-bx)*(az-cz);if(Math.abs(d)<1e-12)continue;
   const l1=((bz-cz)*(x-cx)+(cx-bx)*(z-cz))/d,l2=((cz-az)*(x-cx)+(ax-cx)*(z-cz))/d,l3=1-l1-l2;
   if(l1>=-1e-6&&l2>=-1e-6&&l3>=-1e-6){const y=l1*tri[o+1]+l2*tri[o+4]+l3*tri[o+7];if(y>best)best=y;}}
  return best;}};
}
