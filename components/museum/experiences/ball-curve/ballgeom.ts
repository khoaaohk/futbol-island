import {depthOf,iso,pathOf,type Flat,type Point3,type Projection} from '../anatomy/iso-kit';
/**
 * ball-curve · the classic 32-panel ball (12 pentagons, 20 hexagons: a truncated icosahedron blown up onto a sphere), for the
 * drawings. Pure: the seams are great-circle arcs between the truncated icosahedron's corners, sampled and projected with the kit's
 * camera; only the part of each arc that faces the viewer is drawn, and the pentagons are filled where they face the viewer whole.
 * A ball can be spun about the vertical axis (sidespin) or a horizontal one, and cut into a top cap and a bottom bowl (the
 * exploded ball). Every path is in the SVG's own pixels.
 */
const PHI=(1+Math.sqrt(5))/2;
type V=[number,number,number];
const norm=(v:V):V=>{const l=Math.hypot(...v);return [v[0]/l,v[1]/l,v[2]/l];};
const dot=(a:V,b:V)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
/** Even permutations (cyclic) of each base point with every sign. */
function cyc(base:V[]):V[]{const out:V[]=[];for(const [a,b,c] of base)for(const p of [[a,b,c],[b,c,a],[c,a,b]] as V[])
 for(const sx of [1,-1])for(const sy of [1,-1])for(const sz of [1,-1]){const q:V=[p[0]*sx,p[1]*sy,p[2]*sz];if(!out.some(o=>Math.abs(o[0]-q[0])+Math.abs(o[1]-q[1])+Math.abs(o[2]-q[2])<1e-9))out.push(q);}return out;}
const RAW=cyc([[0,1,3*PHI],[1,2+PHI,2*PHI],[PHI,2,2*PHI+1]]);// 60 corners, edge length 2
export const CORNERS:V[]=RAW.map(norm);
export const EDGES:[number,number][]=[];for(let i=0;i<RAW.length;i++)for(let j=i+1;j<RAW.length;j++){const d=Math.hypot(RAW[i][0]-RAW[j][0],RAW[i][1]-RAW[j][1],RAW[i][2]-RAW[j][2]);if(Math.abs(d-2)<1e-6)EDGES.push([i,j]);}
/** The 12 pentagons: the five corners nearest each icosahedron vertex, in order round it. */
export const PENTAGONS:number[][]=cyc([[0,1,PHI]]).map(c=>{const d=norm(c),near=CORNERS.map((p,i)=>({i,s:dot(p,d)})).sort((a,b)=>b.s-a.s).slice(0,5).map(q=>q.i);
 const u=norm(Math.abs(d[2])<.9?[d[1],-d[0],0]:[0,d[2],-d[1]]),w:V=[d[1]*u[2]-d[2]*u[1],d[2]*u[0]-d[0]*u[2],d[0]*u[1]-d[1]*u[0]];
 return near.sort((a,b)=>Math.atan2(dot(CORNERS[a],w),dot(CORNERS[a],u))-Math.atan2(dot(CORNERS[b],w),dot(CORNERS[b],u)));});

export type Spin={yaw:number;pitch?:number;tilt?:number};
/** Turn a unit point: tilt (about x, fixed, for a nicer pattern), then pitch (about y, backspin), then yaw (about z, sidespin). */
export function turn([x,y,z]:V,{yaw,pitch=0,tilt=.42}:Spin):V{
 let c=Math.cos(tilt),s=Math.sin(tilt);[y,z]=[y*c-z*s,y*s+z*c];
 c=Math.cos(pitch);s=Math.sin(pitch);[x,z]=[x*c+z*s,-x*s+z*c];
 c=Math.cos(yaw);s=Math.sin(yaw);[x,y]=[x*c-y*s,x*s+y*c];return [x,y,z];
}
const slerp=(a:V,b:V,t:number):V=>norm([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t]);
/** Which way is "towards the viewer" for a unit normal (depth grows towards the viewer). */
const facing=(n:V,P:Projection)=>depthOf(n as Point3,P)-depthOf([0,0,0],P);
export type Keep=(n:V)=>boolean;
/**
 * The seams and filled pentagons of a ball of radius r at centre c. `keep` limits it to part of the sphere (the top cap, the bowl).
 * `inside` draws the far, inner face (for a bowl seen from above) instead of the near outside.
 */
export function ballLines(c:Point3,r:number,P:Projection,spin:Spin,{keep=()=>true,steps=6}:{keep?:Keep;steps?:number}={}){
 const at=(n:V):Flat=>iso([c[0]+n[0]*r,c[1]+n[1]*r,c[2]+n[2]*r],P),pts=CORNERS.map(p=>turn(p,spin));
 const seams:string[]=[];
 for(const [i,j] of EDGES){let run:Flat[]=[];
  for(let k=0;k<=steps;k++){const n=slerp(pts[i],pts[j],k/steps),ok=facing(n,P)>.02&&keep(n);
   if(ok)run.push(at(n));else{if(run.length>1)seams.push(pathOf(run));run=[];}}
  if(run.length>1)seams.push(pathOf(run));}
 const pent:string[]=[];
 for(const f of PENTAGONS){const ring:Flat[]=[];let all=true;
  for(let e=0;e<5&&all;e++){const a=pts[f[e]],b=pts[f[(e+1)%5]];for(let k=0;k<steps;k++){const n=slerp(a,b,k/steps);if(facing(n,P)<=.08||!keep(n)){all=false;break;}ring.push(at(n));}}
  if(all)pent.push(pathOf(ring,true));}
 return {seams:seams.join(''),pentagons:pent.join('')};
}
/** The outline of a hemisphere shell (the top cap `up`, or the bowl `down`) of radius r centred at c, cut at its equator. */
export function shellOutline(c:Point3,r:number,P:Projection,up:boolean,n=48){
 // the silhouette is a circle of the sphere's screen radius; the rim (the equator) is an ellipse rx = Rs, ry = Rs·sin(e)
 const [cx,cy]=iso(c,P),Rs=sphereRadius(r,P),ry=Rs*Math.sin((P.elevation??30)*Math.PI/180);
 const pts:Flat[]=[];
 if(up){for(let i=0;i<=n;i++){const a=Math.PI+Math.PI*i/n;pts.push([cx+Math.cos(a)*Rs,cy+Math.sin(a)*Rs]);}// over the top
  for(let i=0;i<=n;i++){const a=Math.PI*i/n;pts.push([cx+Math.cos(a)*Rs,cy+Math.sin(a)*ry]);}}// back along the near rim (screen-down half)
 else{for(let i=0;i<=n;i++){const a=Math.PI*i/n;pts.push([cx+Math.cos(a)*Rs,cy+Math.sin(a)*Rs]);}// under the bottom (right to left)
  for(let i=0;i<=n;i++){const a=Math.PI+Math.PI*i/n;pts.push([cx+Math.cos(a)*Rs,cy+Math.sin(a)*ry]);}}// back along the far rim
 return {d:pathOf(pts,true),rim:{cx,cy,rx:Rs,ry}};
}
/** A sphere of world radius r is a circle of this many pixels (orthographic camera). */
export function sphereRadius(r:number,P:Projection){return r*P.scale*Math.sqrt(1.6);}
