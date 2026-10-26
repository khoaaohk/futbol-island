// East Jetty lighthouse gallery, drawn (Oct 26 2026; physics in lighthouseGallery.ts). The spiral stair that first came with it
// was removed (owner: too busy); this keeps the widened top: a flared corbel under a 3.2 m deck and a WHITE railing (posts, a top
// rail and a mid rail) all round except a gate where the straight white ladder (lighthouseLadder.ts) arrives. Built once inside
// buildEastPier with the island's `put`, before the batching pass, in the tower's own off-white ('#f3ecdc'): no new colour or material, it joins the plaza chunk's existing
// paint batch (vertex colours, one shared material, the one existing shadow caster). No per-frame work.
import * as T from 'three';
import {LIGHTHOUSE as L,towerSolidRadius} from './lighthouseGallery';

type Put=(g:T.BufferGeometry,c:string,x:number,y:number,z:number)=>T.Mesh;
const TAU=Math.PI*2;
/** Rail segments per radian. */
const SEG_PER_RAD=36/TAU;
/** The tower's off-white (eastPierWorld.ts tiers): the railing reads clean in sun and shade, and shares the tower's batch. */
export const RAIL_WHITE='#f3ecdc';

/** Triangle soup builder: hexahedra (8 corners) with outward faces. */
class Soup{
 pos:number[]=[];
 /** Corners: 0–3 one end ring, 4–7 the matching other ring. Faces wind outward (checked against the centroid). */
 hexa(c:number[][],skipEnds=false){
  let mx=0,my=0,mz=0;for(const p of c){mx+=p[0]/8;my+=p[1]/8;mz+=p[2]/8;}
  const faces=skipEnds?[[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7]]:[[0,1,2,3],[7,6,5,4],[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7]];
  for(const f of faces){const a=c[f[0]],b=c[f[1]],d=c[f[2]],e=c[f[3]];
   const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=d[0]-a[0],vy=d[1]-a[1],vz=d[2]-a[2],nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;
   const fx=(a[0]+b[0]+d[0]+e[0])/4-mx,fy=(a[1]+b[1]+d[1]+e[1])/4-my,fz=(a[2]+b[2]+d[2]+e[2])/4-mz;
   const q=nx*fx+ny*fy+nz*fz>=0?[a,b,d,e]:[a,e,d,b];
   this.pos.push(...q[0],...q[1],...q[2],...q[0],...q[2],...q[3]);}
 }
 /** A flat rail along an arc (radius r, bearings a0 → a1, at height y), half sizes hr (radial) × hy. */
 arc(r:number,a0:number,a1:number,y:number,hr:number,hy:number){
  const n=Math.max(1,Math.ceil(Math.abs(a1-a0)*SEG_PER_RAD));
  const ring=(a:number)=>{const c=Math.cos(a),s=Math.sin(a);return [[c*(r-hr),y-hy,s*(r-hr)],[c*(r+hr),y-hy,s*(r+hr)],[c*(r+hr),y+hy,s*(r+hr)],[c*(r-hr),y+hy,s*(r-hr)]];};
  let prev=ring(a0);for(let i=1;i<=n;i++){const next=ring(a0+(a1-a0)*i/n);this.hexa([...prev,...next],i>1&&i<n);prev=next;}
 }
 /** A vertical post (square, side w) from y0 to y1 at radius r, bearing a. */
 post(r:number,a:number,y0:number,y1:number,w:number){const x=Math.cos(a)*r,z=Math.sin(a)*r,h=w/2;
  this.hexa([[x-h,y0,z-h],[x+h,y0,z-h],[x+h,y0,z+h],[x-h,y0,z+h],[x-h,y1,z-h],[x+h,y1,z-h],[x+h,y1,z+h],[x-h,y1,z+h]]);}
 geometry(){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(this.pos,3));g.computeVertexNormals();return g;}
}

/** The gallery railing around the tower's axis (y 0 = the plaza): one white geometry. Pure (no scene). */
export function buildLighthouseRailingGeometry(){
 const rail=new Soup(),R=L.galleryR-.04;
 const g0=L.openAt+L.openHalf,g1=L.openAt-L.openHalf+TAU;// the railed arc, the long way round from the opening's one edge to the other
 rail.arc(R,g0,g1,L.top+L.railH-.04,.05,.035);// top rail
 rail.arc(R,g0,g1,L.top+.5,.025,.025);// mid rail
 const n=Math.ceil((g1-g0)*R/.9);for(let i=0;i<=n;i++)rail.post(R,g0+(g1-g0)*i/n,L.top,L.top+L.railH-.04,i===0||i===n?.09:.05);
 return rail.geometry();
}

/** The ladder's rungs (m above the plaza): every LADDER rung step from 0.3 m to just under the deck. */
export const LADDER_RUNGS=Array.from({length:Math.floor((L.top-.15)/.3)},(_,i)=>.3*(i+1));
/** Heights of the stand-off brackets from the rails back to the tower. */
export const LADDER_BRACKETS=[1.6,4.6,7.6,10.6,12.9] as const;
/** The ladder (two side rails up to grab handles above the deck, round-ish rungs, stand-off brackets to the tower): one white
 *  geometry around the tower's axis. Local frame: `out` along the gate's bearing, `side` across it. */
export function buildLadderGeometry(){
 const g=new Soup(),ux=Math.cos(L.openAt),uz=Math.sin(L.openAt);
 const P=(o:number,s:number,y:number)=>[o*ux-s*uz,y,o*uz+s*ux];
 const box=(o0:number,o1:number,s0:number,s1:number,y0:number,y1:number)=>g.hexa([P(o0,s0,y0),P(o1,s0,y0),P(o1,s1,y0),P(o0,s1,y0),P(o0,s0,y1),P(o1,s0,y1),P(o1,s1,y1),P(o0,s1,y1)]);
 const R=L.ladderR,H=L.ladderHalf,top=L.top+L.ladderAbove;
 for(const s of [-H,H])box(R-.03,R+.03,s-.03,s+.03,0,top);// side rails
 for(const y of LADDER_RUNGS)box(R-.02,R+.02,-H,H,y-.02,y+.02);// rungs
 for(const y of LADDER_BRACKETS){const inner=towerSolidRadius(y)-.04;for(const s of [-H,H])box(inner,R-.03,s-.018,s+.018,y-.025,y+.025);}// stand-offs
 return g.geometry();
}

/** Puts the gallery (corbel, deck, railing) and the ladder into the town at the tower's axis. Returns the meshes for tests. */
export function buildLighthouseGallery(put:Put){
 const {cx,cz}=L;
 const deck=new T.CylinderGeometry(L.galleryR,L.galleryR,.24,32);
 const corbel=new T.CylinderGeometry(L.galleryR-.05,1.5,1.9,24,1,true);
 return [put(buildLighthouseRailingGeometry(),RAIL_WHITE,cx,0,cz),put(buildLadderGeometry(),RAIL_WHITE,cx,0,cz),put(deck,RAIL_WHITE,cx,L.top-.12,cz),put(corbel,RAIL_WHITE,cx,13.36-.95,cz)];
}
