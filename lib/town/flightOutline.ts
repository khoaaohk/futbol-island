// The flight boundary the maps draw is traced from flightBlocked itself (Sep 29 2026), so the drawing and the rule
// can never disagree: the main island's margin, the winding Coral Cay corridor, the sandbar halos and the cay margin
// come out as one continuous outline. Tracing is offline (scripts/generate-flight-outline.cjs writes
// flightOutline.data.ts) so the client never samples the rule and SSR/hydration see identical strings;
// tests/coral-cay.cjs re-traces and fails if the data is stale.
export type Bounds={minX:number;maxX:number;minZ:number;maxZ:number};
type P={x:number;z:number};
/** Marching squares over an allowed(x,z) field on a `step` grid, each crossing refined by bisection on the real rule,
 *  loops stitched and simplified (Douglas–Peucker, `tolerance` m). Returns closed loops in world x/z. */
export function traceAllowedRegion(allowed:(x:number,z:number)=>boolean,bounds:Bounds,step=2,tolerance=.35):P[][]{
 const x0=bounds.minX-2*step,z0=bounds.minZ-2*step,nx=Math.ceil((bounds.maxX-x0)/step)+3,nz=Math.ceil((bounds.maxZ-z0)/step)+3;
 const inside=new Uint8Array(nx*nz);
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=x0+i*step,z=z0+j*step;inside[j*nx+i]=i>0&&j>0&&i<nx-1&&j<nz-1&&allowed(x,z)?1:0;}
 const at=(i:number,j:number)=>inside[j*nx+i];
 const points=new Map<string,P>();
 // A crossing on a grid edge, found by bisection between its inside and outside corner.
 const crossing=(key:string,ax:number,az:number,bx:number,bz:number)=>{
  let p=points.get(key);if(p)return key;
  let inX=ax,inZ=az,outX=bx,outZ=bz;if(!allowed(ax,az)){inX=bx;inZ=bz;outX=ax;outZ=az;}
  for(let k=0;k<8;k++){const mx=(inX+outX)/2,mz=(inZ+outZ)/2;if(allowed(mx,mz)){inX=mx;inZ=mz;}else{outX=mx;outZ=mz;}}
  p={x:(inX+outX)/2,z:(inZ+outZ)/2};points.set(key,p);return key;
 };
 const links=new Map<string,string[]>();
 const link=(a:string,b:string)=>{(links.get(a)??links.set(a,[]).get(a)!).push(b);(links.get(b)??links.set(b,[]).get(b)!).push(a);};
 for(let j=0;j<nz-1;j++)for(let i=0;i<nx-1;i++){
  const a=at(i,j),b=at(i+1,j),c=at(i+1,j+1),d=at(i,j+1),code=a*8+b*4+c*2+d;if(code===0||code===15)continue;
  const X=x0+i*step,Z=z0+j*step;
  const top=()=>crossing(`h${i},${j}`,X,Z,X+step,Z),right=()=>crossing(`v${i+1},${j}`,X+step,Z,X+step,Z+step);
  const bottom=()=>crossing(`h${i},${j+1}`,X,Z+step,X+step,Z+step),left=()=>crossing(`v${i},${j}`,X,Z,X,Z+step);
  const edges:string[]=[];if(a!==b)edges.push(top());if(b!==c)edges.push(right());if(d!==c)edges.push(bottom());if(a!==d)edges.push(left());
  if(edges.length===2)link(edges[0],edges[1]);
  else if(edges.length===4){if(a){link(edges[0],edges[3]);link(edges[1],edges[2]);}else{link(edges[0],edges[1]);link(edges[2],edges[3]);}}
 }
 const seen=new Set<string>(),loops:P[][]=[];
 for(const start of links.keys()){
  if(seen.has(start))continue;const loop:P[]=[];let previous='',current=start;
  while(!seen.has(current)){seen.add(current);loop.push(points.get(current)!);const next=links.get(current)!.find(n=>n!==previous&&!seen.has(n));if(!next)break;previous=current;current=next;}
  if(loop.length>2)loops.push(simplifyLoop(loop,tolerance));
 }
 return loops;
}
function simplify(points:P[],tolerance:number):P[]{
 if(points.length<3)return points;
 const a=points[0],b=points[points.length-1],dx=b.x-a.x,dz=b.z-a.z,len=Math.hypot(dx,dz)||1;let worst=0,index=0;
 for(let i=1;i<points.length-1;i++){const d=Math.abs((points[i].x-a.x)*dz-(points[i].z-a.z)*dx)/len;if(d>worst){worst=d;index=i;}}
 if(worst<=tolerance)return [a,b];
 return [...simplify(points.slice(0,index+1),tolerance).slice(0,-1),...simplify(points.slice(index),tolerance)];
}
const simplifyLoop=(loop:P[],tolerance:number)=>{const half=loop.length>>1;return [...simplify(loop.slice(0,half+1),tolerance).slice(0,-1),...simplify([...loop.slice(half),loop[0]],tolerance).slice(0,-1)];};
/** SVG path data with 0.1 m precision (well under a pixel; fixed digits keep SSR and the client identical). */
export const loopsToPath=(loops:P[][])=>loops.map(loop=>'M'+loop.map(p=>`${Math.round(p.x*10)/10} ${Math.round(p.z*10)/10}`).join('L')+'Z').join('');
