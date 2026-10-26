// East Jetty lighthouse spiral stair, drawn (Oct 26 2026; physics in lighthouseStairs.ts). Built once inside buildEastPier with
// the island's `put`, before the batching pass: every piece is ONE merged BufferGeometry per colour, put at the tower's axis, so
// it joins the plaza chunk's existing paint batch (vertex colours, one shared material, the one existing shadow caster). No new
// materials, no textures, no per-frame work. The four lamps use the shared '#ffe8ae' lamp lens (it glows with every lamp at night).
// Open stone treads on two iron stringers, an outer and an inner handrail with balusters, brackets back to the tower, a newel
// lamp at the foot and lamps every half turn, window slits on the tower, and the widened gallery: a corbel under a 3.2 m deck,
// railed all round except the opening onto the stair's landing.
import * as T from 'three';
import {LIGHTHOUSE_STAIRS as L,STAIR_SPAN,STAIR_END,STAIR_RAIL_FROM,stairHeight,towerSolidRadius} from './lighthouseStairs';

type Put=(g:T.BufferGeometry,c:string,x:number,y:number,z:number)=>T.Mesh;
const TAU=Math.PI*2;
/** Treads over the climb (~0.17 m rise, ~9° each), rail / stringer segments per radian. */
export const STAIR_TREADS=80;
const SEG_PER_RAD=36/TAU;
const STONE='#e2d5b5',IRON='#384443',LENS='#ffe8ae',DARK='#2f4f4a',WHITE='#f3ecdc';

/** Triangle soup builder: hexahedra (8 corners) with outward faces, no allocation beyond the growing arrays. */
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
 /** An axis-aligned-in-polar block: radii r0..r1, bearings a0..a1, heights y0..y1 (a tread, a bracket, a slit). */
 wedge(r0:number,r1:number,a0:number,a1:number,y0:number,y1:number){
  const P=(r:number,a:number,y:number)=>[Math.cos(a)*r,y,Math.sin(a)*r];
  this.hexa([P(r0,a0,y0),P(r1,a0,y0),P(r1,a1,y0),P(r0,a1,y0),P(r0,a0,y1),P(r1,a0,y1),P(r1,a1,y1),P(r0,a1,y1)]);
 }
 /** A swept rectangular section along a helix (radius r, bearings a0 → a1, centre height y(a)), half sizes hr (radial) × hy. */
 sweep(r:number,a0:number,a1:number,y:(a:number)=>number,hr:number,hy:number){
  const n=Math.max(1,Math.ceil(Math.abs(a1-a0)*SEG_PER_RAD));
  const ring=(a:number)=>{const c=Math.cos(a),s=Math.sin(a),h=y(a);return [[c*(r-hr),h-hy,s*(r-hr)],[c*(r+hr),h-hy,s*(r+hr)],[c*(r+hr),h+hy,s*(r+hr)],[c*(r-hr),h+hy,s*(r-hr)]];};
  let prev=ring(a0);for(let i=1;i<=n;i++){const next=ring(a0+(a1-a0)*i/n);this.hexa([...prev,...next],i>1&&i<n);prev=next;}
 }
 /** A vertical post (square, side w) from y0 to y1 at radius r, bearing a. */
 post(r:number,a:number,y0:number,y1:number,w:number){const x=Math.cos(a)*r,z=Math.sin(a)*r,h=w/2;
  this.hexa([[x-h,y0,z-h],[x+h,y0,z-h],[x+h,y0,z+h],[x-h,y0,z+h],[x-h,y1,z-h],[x+h,y1,z-h],[x+h,y1,z+h],[x-h,y1,z+h]]);}
 geometry(){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(this.pos,3));g.computeVertexNormals();return g;}
}

/** The stair and gallery geometry around the tower's axis (y 0 = the plaza), one geometry per colour. Pure (no scene). */
export function buildLighthouseStairGeometry(){
 const stone=new Soup(),iron=new Soup(),lens=new Soup(),dark=new Soup(),white=new Soup();
 const th=(phi:number)=>L.theta0+phi,yAt=(a:number)=>stairHeight(a-L.theta0);
 const step=STAIR_SPAN/STAIR_TREADS,rMid=(L.rIn+L.rOut)/2;
 // Treads: open stone slabs, top at the walking ramp's height at the tread's middle (feet within half a riser), each a little
 // longer than its share so the plan view reads as a continuous band.
 for(let i=0;i<STAIR_TREADS;i++){const a=th(i*step),b=th((i+1)*step+.012),top=stairHeight((i+.5)*step);stone.wedge(L.rIn,L.rOut,a,b,Math.max(.02,top-.09),Math.max(.06,top));}
 // Landing: a flat slab at the gallery height over the band, and a threshold across the opening to the gallery's edge.
 stone.wedge(L.rIn,L.rOut,th(STAIR_SPAN),th(STAIR_END),L.top-.2,L.top);
 stone.wedge(L.galleryR-.05,L.rIn,th(STAIR_SPAN-L.openBefore),th(STAIR_END),L.top-.2,L.top);
 // Stringers (iron), just under the treads' ends, from the foot to the landing.
 for(const r of [L.rIn+.04,L.rOut-.04])iron.sweep(r,th(0),th(STAIR_END),a=>Math.max(.12,yAt(a)-.2),.035,.14);
 // Handrails: outer from the first rail to the landing's end, inner to the gallery's opening; balusters every second tread.
 const railY=(a:number)=>yAt(a)+L.railH-.04;
 iron.sweep(L.rOut-.05,th(STAIR_RAIL_FROM),th(STAIR_END),railY,.035,.035);
 iron.sweep(L.rIn+.05,th(STAIR_RAIL_FROM),th(STAIR_SPAN-L.openBefore),railY,.035,.035);
 for(let phi=STAIR_RAIL_FROM;phi<=STAIR_END+1e-6;phi+=step*2){const h=stairHeight(phi);iron.post(L.rOut-.05,th(phi),h,h+L.railH-.04,.045);if(phi<=STAIR_SPAN-L.openBefore)iron.post(L.rIn+.05,th(phi),h,h+L.railH-.04,.045);}
 // The landing's end rail (radial) with two posts.
 {const a=th(STAIR_END),c=Math.cos(a),s=Math.sin(a);for(const r of [L.rIn+.05,L.rOut-.05])iron.post(r,a,L.top,L.top+L.railH,.06);
  for(const y of [L.top+L.railH-.04,L.top+.5])iron.hexa([[c*(L.rIn),y-.035,s*(L.rIn)],[c*L.rOut,y-.035,s*L.rOut],[c*L.rOut,y+.035,s*L.rOut],[c*L.rIn,y+.035,s*L.rIn],
   [c*L.rIn-s*.07,y-.035,s*L.rIn+c*.07],[c*L.rOut-s*.07,y-.035,s*L.rOut+c*.07],[c*L.rOut-s*.07,y+.035,s*L.rOut+c*.07],[c*L.rIn-s*.07,y+.035,s*L.rIn+c*.07]]);}
 // Brackets: an iron arm from the tower to the inner stringer every 30°.
 for(let phi=Math.PI/6;phi<STAIR_SPAN-.3;phi+=Math.PI/6){const h=stairHeight(phi)-.32,inner=towerSolidRadius(h)-.05;if(h<1.2)continue;
  iron.wedge(inner,L.rIn+.1,th(phi)-.02,th(phi)+.02,h-.07,h+.05);}
 // Newel post with a lamp at the foot (outer side), and a lamp on the outer rail every half turn.
 {const a=th(.05);iron.post(L.rOut-.05,a,0,1.25,.12);lens.post(L.rOut-.05,a,1.25,1.5,.2);iron.post(L.rOut-.05,a,1.5,1.56,.26);}
 for(let phi=Math.PI;phi<STAIR_SPAN;phi+=Math.PI){const h=stairHeight(phi)+L.railH;lens.post(L.rOut-.05,th(phi),h,h+.2,.16);iron.post(L.rOut-.05,th(phi),h+.2,h+.25,.22);}
 // Window slits on the tower where the stair passes, lit lens colour (a warm glow at night through the slits).
 for(let k=1;k<6;k++){const phi=k*STAIR_SPAN/6+.6,y=stairHeight(phi)+1.4;if(y>11)continue;const r=towerSolidRadius(y);dark.wedge(r-.04,r+.03,th(phi)-.09,th(phi)+.09,y-.5,y+.5);lens.wedge(r+.03,r+.045,th(phi)-.05,th(phi)+.05,y-.36,y+.36);}
 // The gallery: corbel (a flared skirt under the deck), the 3.2 m deck, and the railing (posts + two rails) except the opening.
 {const open0=L.openBefore+.05,open1=L.landing;// bearings (from theta0) the railing leaves open
  const g0=th(STAIR_SPAN+open1),g1=th(STAIR_SPAN-open0)+TAU;// the railed arc, going round the long way
  white.sweep(L.galleryR-.04,g0,g1,()=>L.top+L.railH-.04,.035,.035);
  iron.sweep(L.galleryR-.04,g0,g1,()=>L.top+L.railH-.04,.045,.02);
  iron.sweep(L.galleryR-.04,g0,g1,()=>L.top+.5,.025,.025);
  const n=Math.ceil((g1-g0)*L.galleryR/.9);for(let i=0;i<=n;i++)iron.post(L.galleryR-.04,g0+(g1-g0)*i/n,L.top,L.top+L.railH-.04,.05);}
 return {stone:stone.geometry(),iron:iron.geometry(),lens:lens.geometry(),dark:dark.geometry(),white:white.geometry()};
}

/** Puts the stair and gallery into the town (merged per colour, at the tower's axis). Returns the meshes for tests. */
export function buildLighthouseStairs(put:Put){
 const g=buildLighthouseStairGeometry(),{cx,cz}=L;
 // The gallery deck and its corbel: two lathe pieces.
 const deck=new T.CylinderGeometry(L.galleryR,L.galleryR,.24,32);
 const corbel=new T.CylinderGeometry(L.galleryR-.05,1.5,1.9,24,1,true);
 return [put(g.stone,STONE,cx,0,cz),put(g.iron,IRON,cx,0,cz),put(g.lens,LENS,cx,0,cz),put(g.dark,DARK,cx,0,cz),put(g.white,WHITE,cx,0,cz),
  put(deck,WHITE,cx,L.top-.12,cz),put(corbel,WHITE,cx,13.36-.95,cz)];
}
