/**
 * The Matchday Ferry's rounded body (Nov 26 2026, owner shot 149: "we need to round this boat more"; `?vehicles=0` = the old boxes in
 * world.ts). ONE merged, vertex-coloured, non-indexed geometry in the ferry group's local frame (origin = the old box centre 246, 199;
 * bow -z, stern +z where the name board is), drawn with the deep-sea boats' material (deepSeaBoat.ts hullMaterial: vertex colours plus
 * the waterline foam collar pinned to the sea). It replaces 16 separate box meshes (hull, deck slab, cabin, roof, eight windows, the
 * front window and four floating rail bars): 16 draws -> 1 (and 16 shadow-pass draws -> 1).
 *
 * Nothing that plays changes: the deck floor (FERRY_DECK, 1.5 m), the cabin and rail colliders (ferryBoarding.ts), the gangway and its
 * opening on the port side aft (local z 4.9..8.5) are where they were. The hull CONTAINS the old 8.3 x 17.3 deck rectangle (the walkable
 * floor) and adds a rounded bow point forward of the bow rail and rounded stern quarters behind the stern rail.
 */
import * as T from 'three';
type V3=[number,number,number];
/** Plan outline: half-beam at local z (bow -z). Max HB; stern quarters round off to the transom; the bow curves to a rounded point. */
export const FERRY_SHAPE={hb:4.15,transomZ:9.1,transomHB:3.4,quarterFrom:8.0,bowFrom:-7,noseZ:-11.6,deckY:1.5,keelY:-.9} as const;
export function ferryHalfBeam(z:number){
 const S=FERRY_SHAPE;
 if(z>S.quarterFrom){const u=Math.min(1,(z-S.quarterFrom)/(S.transomZ-S.quarterFrom));return S.transomHB+(S.hb-S.transomHB)*Math.sqrt(Math.max(0,1-u*u));}
 if(z>=S.bowFrom)return S.hb;
 const t=Math.min(1,(S.bowFrom-z)/(S.bowFrom-S.noseZ));return S.hb*Math.pow(Math.max(0,1-Math.pow(t,2.5)),.5);
}
const STATIONS=(()=>{const S=FERRY_SHAPE,zs:number[]=[];
 for(let i=0;i<=8;i++){const u=i/8;zs.push(S.noseZ+(S.bowFrom-S.noseZ)*(1-Math.pow(1-u,1.7)));}// dense at the nose
 for(const z of [-3,1,5])zs.push(z);
 for(let i=0;i<=4;i++)zs.push(S.quarterFrom+(S.transomZ-S.quarterFrom)*i/4);
 return zs;})();
const HULL='#477c6a',BOOT='#2f5a4d',STRIPE='#eddfbb',CAP='#eddfbb',DECK='#e6d6ae',CABIN='#fff0cf',BAND='#477c6a',ROOF='#bd7657',ROOF_EDGE='#a9654a',
 GLASS='#365b56',RAIL='#eddfbb',POST='#9d805b',FENDER='#e0513f',DOOR='#8a5a3c';
export function buildFerryGeometry(){
 const pos:number[]=[],col:number[]=[],foam:number[]=[],c=new T.Color();
 const tri=(a:V3,b:V3,d:V3,color:string,f=0)=>{c.set(color);for(const v of [a,b,d]){pos.push(v[0],v[1],v[2]);col.push(c.r,c.g,c.b);foam.push(f);}};
 /** A quad wound so its normal points away from `inside`. */
 const quad=(a:V3,b:V3,d:V3,e:V3,color:string,inside:V3,f=0)=>{
  const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=d[0]-a[0],vy=d[1]-a[1],vz=d[2]-a[2],nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;
  const out=nx*(a[0]-inside[0])+ny*(a[1]-inside[1])+nz*(a[2]-inside[2])>=0;
  if(out){tri(a,b,d,color,f);tri(a,d,e,color,f);}else{tri(a,d,b,color,f);tri(a,e,d,color,f);}};
 /** One triangle wound away from `inside`. */
 const triOut=(a:V3,b:V3,d:V3,color:string,inside:V3)=>{const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=d[0]-a[0],vy=d[1]-a[1],vz=d[2]-a[2];
  const out=(uy*vz-uz*vy)*(a[0]-inside[0])+(uz*vx-ux*vz)*(a[1]-inside[1])+(ux*vy-uy*vx)*(a[2]-inside[2])>=0;if(out)tri(a,b,d,color);else tri(a,d,b,color);};
 /** The outline ring at height y, half-beam x k (+ an offset), starboard (+x) side bow to stern then port back to the bow. */
 const ring=(y:number,k:number,off=0):V3[]=>{const r:V3[]=[];for(const z of STATIONS)r.push([ferryHalfBeam(z)*k+off,y,z]);for(let i=STATIONS.length-1;i>=0;i--)r.push([-(ferryHalfBeam(STATIONS[i])*k+off),y,STATIONS[i]]);return r;};
 /** Sides between two rings; colour picked per band. Inside point: the centre line at that station's height. */
 const band=(a:V3[],b:V3[],color:string,f=0)=>{for(let i=0;i<a.length;i++){const j=(i+1)%a.length;const zc=(a[i][2]+a[j][2])/2,yc=(a[i][1]+b[i][1])/2;
  // the nose and transom: the inside point moves along the axis so those faces wind outward too
  const inside:V3=[0,yc,Math.max(FERRY_SHAPE.noseZ+1.2,Math.min(FERRY_SHAPE.transomZ-1.2,zc))];if(Math.abs(a[i][0])<.01&&Math.abs(a[j][0])<.01)continue;quad(a[i],a[j],b[j],b[i],color,inside,f);}};
 /** A flat cap over a ring (fan from the centre line, stern to nose). */
 const cap=(r:V3[],color:string,up=1)=>{const n=STATIONS.length;for(let i=0;i+1<n;i++){const a=r[i],b=r[i+1],pa=r[2*n-1-i],pb=r[2*n-2-i];quad(pa,a,b,pb,color,[0,a[1]-up,(a[2]+b[2])/2]);}};
 /** A box (min / max corners), all six faces unless `skip` names them (u = under). */
 const box=(x0:number,x1:number,y0:number,y1:number,z0:number,z1:number,color:string,skip='')=>{const m:V3=[(x0+x1)/2,(y0+y1)/2,(z0+z1)/2];
  if(!skip.includes('t'))quad([x0,y1,z0],[x1,y1,z0],[x1,y1,z1],[x0,y1,z1],color,m);if(!skip.includes('u'))quad([x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1],color,m);
  quad([x0,y0,z0],[x1,y0,z0],[x1,y1,z0],[x0,y1,z0],color,m);quad([x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1],color,m);
  quad([x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0],color,m);quad([x1,y0,z0],[x1,y0,z1],[x1,y1,z1],[x1,y1,z0],color,m);};
 /** A rounded-rectangle prism (plan half sizes hx, hz, corner radius r, 3 segments a corner) from y0 to y1; `camber` lifts the top
  *  toward the centre line (a curved roof); `top` paints the cap. */
 const rrect=(hx:number,hz:number,r:number,y0:number,y1:number,color:string,o:{camber?:number;top?:string;under?:boolean;cz?:number}={})=>{
  const pts:[number,number][]=[],cz=o.cz??0;
  for(const [sx,sz,a0] of [[1,-1,-Math.PI/2],[1,1,0],[-1,1,Math.PI/2],[-1,-1,Math.PI]] as const)for(let k=0;k<=3;k++){const a=a0+k/3*Math.PI/2;pts.push([sx*(hx-r)+Math.cos(a)*r,cz+sz*(hz-r)+Math.sin(a)*r]);}
  const yt=(x:number)=>y1+(o.camber??0)*(1-(x/hx)*(x/hx)),m:V3=[0,(y0+y1)/2,cz];
  for(let i=0;i<pts.length;i++){const [ax,az]=pts[i],[bx,bz]=pts[(i+1)%pts.length];quad([ax,y0,az],[bx,y0,bz],[bx,yt(bx),bz],[ax,yt(ax),az],color,m);}
  // top: a fan from the centre (domed by the camber)
  const ctr:V3=[0,yt(0),cz];for(let i=0;i<pts.length;i++){const [ax,az]=pts[i],[bx,bz]=pts[(i+1)%pts.length];triOut(ctr,[ax,yt(ax),az],[bx,yt(bx),bz],o.top??color,[0,y0-5,cz]);}
  if(o.under)for(let i=0;i<pts.length;i++){const [ax,az]=pts[i],[bx,bz]=pts[(i+1)%pts.length];triOut([0,y0,cz],[ax,y0,az],[bx,y0,bz],o.top??color,[0,y0+5,cz]);}
 };
 const S=FERRY_SHAPE,D=S.deckY;
 // ---- Hull: a slight V keel, rounded bilge, near-vertical topsides with a cream sheer stripe; deck flush at 1.5.
 const rings:[number,number,string][]=[[S.keelY,.32,BOOT],[-.65,.66,BOOT],[-.38,.86,BOOT],[-.1,.95,HULL],[.35,1,HULL],[1.05,1,STRIPE],[1.22,1,HULL],[D-.08,1,CAP],[D,1,CAP]];
 for(let i=0;i+1<rings.length;i++)band(ring(rings[i][0],rings[i][1]),ring(rings[i+1][0],rings[i+1][1]),rings[i][2]);
 cap(ring(S.keelY,.32),BOOT,-1);
 cap(ring(D,.985),DECK);
 // Waterline foam collar (pinned to the sea by the material; a thin flat band just outside the hull at the waterline).
 {const a=ring(-.43,.88,.06),b=ring(-.43,.88,.42);for(let i=0;i<a.length;i++){const j=(i+1)%a.length;if(Math.abs(a[i][0])<.01&&Math.abs(a[j][0])<.01)continue;quad(a[i],a[j],b[j],b[i],'#e8f7f2',[a[i][0],-5,a[i][2]],1);}}
 // ---- The foredeck forward of the bow rail: a bulwark that follows the outline and rises toward the stem (the sheer), cream cap.
 {const zs=STATIONS.filter(z=>z<=-8.4);for(const s of [-1,1])for(let i=0;i+1<zs.length;i++){const za=zs[i],zb=zs[i+1],xa=s*(ferryHalfBeam(za)-.08),xb=s*(ferryHalfBeam(zb)-.08);
   const ha=D+.35+.75*Math.pow(Math.max(0,(-8.4-za)/(-8.4-S.noseZ)),1.4),hb=D+.35+.75*Math.pow(Math.max(0,(-8.4-zb)/(-8.4-S.noseZ)),1.4);
   const out=(x:number)=>x+s*.08;
   quad([out(xa),D,za],[out(xb),D,zb],[out(xb),hb,zb],[out(xa),ha,za],HULL,[0,D,za]);quad([xa,D,za],[xb,D,zb],[xb,hb,zb],[xa,ha,za],HULL,[s*9,D,za]);
   quad([xa,ha,za],[xb,hb,zb],[out(xb),hb+.04,zb],[out(xa),ha+.04,za],CAP,[s*0,ha-3,za]);}
  // a coiled line and a bollard on the foredeck
  box(-.2,.2,D,D+.35,-9.6,-9.2,POST);box(-.28,.28,D+.35,D+.42,-9.68,-9.12,POST);}
 // ---- Stern quarters behind the stern rail: a low transom bulwark (the name board stays on the transom face below the deck).
 {const zs=STATIONS.filter(z=>z>=8.4);for(const s of [-1,1])for(let i=0;i+1<zs.length;i++){const za=zs[i],zb=zs[i+1],xa=s*(ferryHalfBeam(za)-.06),xb=s*(ferryHalfBeam(zb)-.06);
   quad([xa,D,za],[xb,D,zb],[xb,D+.3,zb],[xa,D+.3,za],HULL,[0,D,8]);quad([xa,D+.3,za],[xb,D+.3,zb],[xb*1.015,D+.34,zb],[xa*1.015,D+.34,za],CAP,[0,D-3,8.6]);}
  const tz=S.transomZ-.06,tx=S.transomHB-.06;quad([-tx,D,tz],[tx,D,tz],[tx,D+.3,tz],[-tx,D+.3,tz],HULL,[0,D,0]);quad([-tx,D+.3,tz],[tx,D+.3,tz],[tx,D+.34,tz+.06],[-tx,D+.34,tz+.06],CAP,[0,D-3,0]);}
 // ---- Rails on the old collider lines (x ±4 from the bow rail to the stern rail; the port rail stops at z 4.9 for the gangway):
 // a top bar at 2.55 (as before), a mid bar, and posts every ~1.6 m, so the bars no longer float.
 const rail=(x0:number,z0:number,x1:number,z1:number)=>{const n=Math.max(1,Math.round(Math.hypot(x1-x0,z1-z0)/1.6)),t=.035;
  for(const [y,h] of [[2.55,.07],[2.05,.05]] as const){const dx=Math.abs(x1-x0)>.01?0:t,dz=Math.abs(z1-z0)>.01?0:t;box(Math.min(x0,x1)-dx-.035,Math.max(x0,x1)+dx+.035,y-h/2,y+h/2,Math.min(z0,z1)-dz-.035,Math.max(z0,z1)+dz+.035,RAIL);}
  for(let i=0;i<=n;i++){const x=x0+(x1-x0)*i/n,z=z0+(z1-z0)*i/n;box(x-.04,x+.04,D,2.52,z-.04,z+.04,POST,'tu');}};
 rail(-4,-8.5,4,-8.5);rail(-4,8.5,4,8.5);rail(4,-8.5,4,8.5);rail(-4,-8.5,-4,4.9);
 // ---- Cabin: rounded corners, a green band round its foot, windows on the flats, a door and windows aft, a cambered roof that
 // overhangs on all sides with a darker rounded edge.
 rrect(3,5,.8,D,4.45,CABIN,{});
 rrect(3.02,5.02,.81,D,2.05,BAND,{});
 for(const s of [-1,1])for(const z of [-3.5,-1,1.5,4])box(s*3.0-.03,s*3.0+.03,2.8,3.8,z-.8,z+.8,GLASS,'tu');
 box(-2.1,2.1,2.8,3.8,-5.03,-4.97,GLASS,'tu');
 box(-.55,.55,D,3.6,4.97,5.03,DOOR,'tu');for(const x of [-1.6,1.6])box(x-.55,x+.55,2.8,3.6,4.97,5.03,GLASS,'tu');
 rrect(3.25,5.25,1,4.45,4.62,ROOF_EDGE,{camber:.3,under:true});
 rrect(3.15,5.15,.95,4.62,4.68,ROOF,{camber:.3});
 // ---- Fenders along both sides (rounded: an 8-sided barrel with tapered ends), clear of the gangway's opening.
 const fender=(x:number,z:number)=>{const r=.17,h=.34,N=8;for(let k=0;k<N;k++){const a0=k/N*Math.PI*2,a1=(k+1)/N*Math.PI*2;
  const P=(a:number,y:number,rr:number):V3=>[x+Math.cos(a)*rr,y,z+Math.sin(a)*rr];
  quad(P(a0,.7-h,r),P(a1,.7-h,r),P(a1,.7+h,r),P(a0,.7+h,r),FENDER,[x,.7,z]);
  quad(P(a0,.7+h,r),P(a1,.7+h,r),P(a1,.7+h+.1,r*.5),P(a0,.7+h+.1,r*.5),FENDER,[x,.7,z]);
  quad(P(a0,.7-h,r),P(a1,.7-h,r),P(a1,.7-h-.1,r*.5),P(a0,.7-h-.1,r*.5),FENDER,[x,.7,z]);}};
 for(const z of [-5.5,-2,1.5])for(const s of [-1,1])fender(s*(S.hb+.17),z);fender(S.hb+.17,5);
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('color',new T.Float32BufferAttribute(col,3));
 g.setAttribute('foam',new T.Float32BufferAttribute(foam,1));g.computeVertexNormals();g.computeBoundingSphere();g.computeBoundingBox();return g;
}
