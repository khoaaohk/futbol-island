/**
 * The Island Line's static scenery (train Phase 1, Nov 23 2026; plan: .claude/worktrees/_recovery-nov20/train/PLAN.md §9.1).
 * Built inside buildTown (world.ts) before the batching pass, so every solid piece is a plain palette paint and folds into the
 * island's existing 50 m paint batches (vertex colours, one shared material): on land that is NO new draw call.
 *
 *  - Track: rails, sleepers and ballast as ~100 m chunks of merged geometry along the line (one mesh per paint per chunk, each
 *    placed at its chunk's centre so it lands in, and is culled with, that chunk's batch). Over the sea the chunk also carries
 *    the trestle (deck girders, cap beams and the piers' columns) or the south sea wall; ~3 new sea cells, culled per chunk.
 *  - Catenary: wooden poles every ~30 m (in the chunks); the arms and ONE continuous contact wire are their own mesh with a
 *    near-camera fade (buildCatenary, Looks 2).
 *  - Summit Isle tunnel: two stone portals (headwall with an arched mouth, dark inside, a hood over the carve behind it) and ONE
 *    tube mesh (walls, track and baked lamp light in vertex colours, unlit material) shown only while the camera is within
 *    TUBE_SHOW m of a portal or inside (update(), one distance test per frame).
 *  - Five static stations: platform (yellow edge strip), a small wooden Japanese-style station house (tiled hip roof, cream walls,
 *    dark timber, warm panes that glow at night through machineNightGlow, four paper lanterns), a bench and two boards (station
 *    name board, line board) cut from ONE canvas atlas: one textured material for all five stations (one draw where one is seen).
 *  - Island stamp book stands (Nov 24 2026): a wooden desk on each platform with an ink pad, the station's stamp on a little chain
 *    and a roofed sign; solid parts in the station's paint batches (the pad and the rubber in the stamp's own ink), the five signs'
 *    faces (cut from the same board atlas) merged into ONE mesh for the whole line: +1 draw at most.
 *  - Five level crossing decks; poles, lamps, barriers and bells are Phase 2's crossing machines (trainRunning.ts).
 * Colliders: house footprints, board posts, catenary poles and crossing poles on land; platforms are walk surfaces (one step up);
 * the South platform over the water is a landable deck. Swimmers meet the piers and the sea wall (trainLayout.trainSwimBlocked).
 * Nothing here animates and nothing runs per frame except the tube's visibility test.
 */
import * as T from 'three';
import type {Obstacle} from './simulation';
import {summitGround} from './summitIsle';
import {skyOn,tunnelOn} from '../graphics/skySwitch';
import {WATER_UNIFORMS} from '../graphics/waterSurface';
import {TRACK,TRACK_DS,TrackKind,onSummitTrackS,SOUTH_BRIDGE,bedAt,TRAIN_STATIONS,TRAIN_CROSSINGS,TUNNEL,TUNNEL_BED,TUNNEL_HALF_WIDTH,STATION_HALF,STATION_PLATFORM_Y,trackAt,leftNormal,wrapS,type TrainStation} from './trainTrack';
import {trainLayout,STAMP_STAND_U,STAMP_STAND_BACK,stationHouseFront,PIER_COLUMN_OFFSET,PIER_COLUMN_HALF,MAIN_COLUMN_HALF,SEA_WALL_HALF,XING_FOOT} from './trainLayout';
import {onWalkPath} from './westParkLayout';
import {onLand} from './landmass';
import {effectiveTier,LOWEST_TIER} from '../graphics/heatTier';
import {TUNNEL_LAMPS,LAMP_R2} from './tunnelWalk';
import {stampById} from './islandStamps';
import {groundingOn} from './grounding';
import {softOn,SoftBoxGeometry} from '../graphics/softBox';

type Surface=Obstacle&{height:number};
export type TrainTools={
 put:(g:T.BufferGeometry,c:string,x:number,y:number,z:number)=>T.Mesh;
 lit:(m:T.Mesh,w:number,warm?:boolean)=>T.Mesh;
 /** A textured board material registered with the island's sign list (disposal, night emissive). */
 boardMaterial:(canvas:HTMLCanvasElement)=>T.Material;
 town:T.Group;obstacles:Obstacle[];walkSurfaces:Surface[];
 /** Lighter line (Nov 23 2026, efficiency): default = the heat tier when the world is built is the lowest one (Battery saver). */
 lite?:boolean;
};
const C={rail:'#5d6166',railTop:'#a7abae',sleeper:'#6f5843',sleeperBed:'#897c6e',ballast:'#9a948a',girder:'#6d5640',pier:'#cbc4b5',wall:'#b8b0a1',wallTop:'#cfc8ba',pole:'#7a5c3e',wire:'#33393a',
 platform:'#d3cbbb',platformSide:'#a8a091',footing:'#6f675b',edge:'#f2c230',plaster:'#f0e6cc',timber:'#5e4630',deck:'#a57f57',roof:'#566270',ridge:'#3d4650',pane:'#a9c9d2',lantern:'#d9483a',cap:'#2c2a28',
 bench:'#b48a5e',crossDeck:'#55524d',stone:'#aaa395',stoneDark:'#8d8679',mouth:'#121110'} as const;
/** Spots a catenary pole must not stand on (it slides to the next row): the Starfish sandbar's hidden ball (coralCayBalls.ts cay-barefoot). */
const POLE_KEEP_CLEAR:readonly (readonly [number,number])[]=[[340.3,-214.85]];
/** Summit portals: headwall half width, its batter (m back per m up) and the wing walls' run out along the banks. */
/** Nov 27 2026: the coming train's headlight in the bore (x, z of its front, gap m, intensity 0 … 1), set by Town; the lit tube's shader. */
export const TUNNEL_TRAIN_LAMP={value:new T.Vector4(0,0,0,0)};
export const POLE_PORTAL_CLEAR=8;
/** Nov 27 2026: the station boards' solid footprint cells (x, z pairs; headless checks: tests/station-sign-landing.cjs). */
export const STATION_SIGN_FEET:number[]=[];
export const PORTAL_HALF=6.6,PORTAL_LEAN=.16,WING_LENGTH=0;// wing walls removed Nov 27 2026 (owner 155)
export const TUBE_SHOW=110,CHUNK_LENGTH=100,POLE_STEP=30,RAIL_HALF_GAUGE=.68,BALLAST_TOP=.12,SLEEPER_TOP=.2,RAIL_TOP=.34,WIRE_Y=5.15;
/** The contact wire's half section (m: a 3.6 cm diamond) and the catenary's near-camera fade: gone within CAT_FADE_NEAR m, dithered in by CAT_FADE_FAR m. */
export const WIRE_R=.014,CAT_FADE_NEAR=4.5,CAT_FADE_FAR=8;// POLISH 3 (owner: the wire read thick from a roof camera 3-6 m off): thinner (2.8 cm), faded out to 4.5 m and dithered in by 8 m

/** A tiny triangle soup builder (positions + flat normals, indexed later by the batching pass). */
class Geo{
 p:number[]=[];n:number[]=[];
 /** Triangle; with `inside`, wound to face away from it (owner shot 90, Nov 25 2026: on a mirrored station, sg -1, the hip
  *  ends were wound inward and back-face culled, so the house showed its open top from a high angle at Coral Cay). */
 tri(a:number[],b:number[],c:number[],inside?:number[]):void{const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;
  if(inside&&nx*((a[0]+b[0]+c[0])/3-inside[0])+ny*((a[1]+b[1]+c[1])/3-inside[1])+nz*((a[2]+b[2]+c[2])/3-inside[2])<0){this.tri(a,c,b);return;}
  const l=Math.hypot(nx,ny,nz)||1;nx/=l;ny/=l;nz/=l;
  this.p.push(...a,...b,...c);for(let i=0;i<3;i++)this.n.push(nx,ny,nz);}
 /** Quad facing away from `inside` (a point the face should not face). */
 quad(a:number[],b:number[],c:number[],d:number[],inside?:number[]){
  if(inside){const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2],nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx,mx=(a[0]+c[0])/2-inside[0],my=(a[1]+c[1])/2-inside[1],mz=(a[2]+c[2])/2-inside[2];
   if(nx*mx+ny*my+nz*mz<0){this.tri(a,c,b);this.tri(a,d,c);return;}}
  this.tri(a,b,c);this.tri(a,c,d);}
 /** Box round centre c with half sizes hl along (tx,tz), hw across, hh up. */
 box(cx:number,cy:number,cz:number,tx:number,tz:number,hl:number,hw:number,hh:number,skipBottom=true,ends=true){
  const nx=tz,nz=-tx,P=(a:number,b:number,h:number)=>[cx+tx*hl*a+nx*hw*b,cy+hh*h,cz+tz*hl*a+nz*hw*b],c=[cx,cy,cz];
  this.quad(P(-1,-1,1),P(1,-1,1),P(1,1,1),P(-1,1,1),c);if(!skipBottom)this.quad(P(-1,-1,-1),P(1,-1,-1),P(1,1,-1),P(-1,1,-1),c);
  if(ends){this.quad(P(-1,-1,-1),P(1,-1,-1),P(1,-1,1),P(-1,-1,1),c);this.quad(P(-1,1,-1),P(1,1,-1),P(1,1,1),P(-1,1,1),c);}
  this.quad(P(-1,-1,-1),P(-1,1,-1),P(-1,1,1),P(-1,-1,1),c);this.quad(P(1,-1,-1),P(1,1,-1),P(1,1,1),P(1,-1,1),c);}
 /** Triangle with its own vertex normals (smooth-shaded rounds). */
 triN(a:number[],b:number[],c:number[],na:number[],nb:number[],nc:number[]){this.p.push(...a,...b,...c);this.n.push(...na,...nb,...nc);}
 /** Soft sweep 2 (Nov 27 2026): a rounded box in the same frame as box() (a smooth-shaded chamfer, lib/graphics/softBox.ts seg 0). */
 sbox(cx:number,cy:number,cz:number,tx:number,tz:number,hl:number,hw:number,hh:number,r:number){
  const g=new SoftBoxGeometry(hl*2,hh*2,hw*2,{radius:r,seg:0}),P=g.getAttribute('position'),N=g.getAttribute('normal'),I=g.index!.array,nx=tz,nz=-tx;
  const w=(i:number,a:T.BufferAttribute|T.InterleavedBufferAttribute,o:number[])=>{const x=a.getX(i),y=a.getY(i),z=a.getZ(i);return [o[0]+tx*x+nx*z,o[1]+y,o[2]+tz*x+nz*z];};
  const c=[cx,cy,cz],z0=[0,0,0];for(let k=0;k<I.length;k+=3)this.triN(w(I[k],P,c),w(I[k+1],P,c),w(I[k+2],P,c),w(I[k],N,z0),w(I[k+1],N,z0),w(I[k+2],N,z0));g.dispose();}
 /** A quarter-round nosing along (tx,tz), half length hl: centre c (at the edge's inner top corner), radius r, from `out` (unit,
  *  level) up to straight up, in `steps`; both ends capped. Smooth normals. */
 nose(c:number[],tx:number,tz:number,hl:number,out:number[],r:number,steps=3){
  const at=(k:number,a:number)=>{const t=k/steps*Math.PI/2,co=Math.cos(t),si=Math.sin(t);return {p:[c[0]+tx*hl*a+out[0]*r*co,c[1]+r*si,c[2]+tz*hl*a+out[2]*r*co],n:[out[0]*co,si,out[2]*co]};};
  for(let k=0;k<steps;k++){const a0=at(k,-1),a1=at(k,1),b0=at(k+1,-1),b1=at(k+1,1);
   // wind outward: (a0,a1,b1) faces away from the round's axis when out × up is along -t; test with the axis point
   const m=[(a0.p[0]+b1.p[0])/2-c[0],0,(a0.p[2]+b1.p[2])/2-c[2]],e1=[a1.p[0]-a0.p[0],a1.p[1]-a0.p[1],a1.p[2]-a0.p[2]],e2=[b1.p[0]-a0.p[0],b1.p[1]-a0.p[1],b1.p[2]-a0.p[2]];
   const fn=[e1[1]*e2[2]-e1[2]*e2[1],e1[2]*e2[0]-e1[0]*e2[2],e1[0]*e2[1]-e1[1]*e2[0]],my=(a0.p[1]+b1.p[1])/2-c[1];
   if(fn[0]*m[0]+fn[1]*my+fn[2]*m[2]>=0){this.triN(a0.p,a1.p,b1.p,a0.n,a1.n,b1.n);this.triN(a0.p,b1.p,b0.p,a0.n,b1.n,b0.n);}
   else{this.triN(a0.p,b1.p,a1.p,a0.n,b1.n,a1.n);this.triN(a0.p,b0.p,b1.p,a0.n,b0.n,b1.n);}}
  for(const a of [-1,1]){const ax=[c[0]+tx*hl*a,c[1],c[2]+tz*hl*a],en=[tx*a,0,tz*a];for(let k=0;k<steps;k++){const p0=at(k,a).p,p1=at(k+1,a).p;
   const e1=[p0[0]-ax[0],p0[1]-ax[1],p0[2]-ax[2]],e2=[p1[0]-ax[0],p1[1]-ax[1],p1[2]-ax[2]],f=[e1[1]*e2[2]-e1[2]*e2[1],e1[2]*e2[0]-e1[0]*e2[2],e1[0]*e2[1]-e1[1]*e2[0]];
   if(f[0]*en[0]+f[2]*en[2]>=0)this.triN(ax,p0,p1,en,en,en);else this.triN(ax,p1,p0,en,en,en);}}}
 /** Box between two points (a thin beam / post / wire piece), square section r. */
 beam(a:number[],b:number[],r:number,diamond=false){const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],l=Math.hypot(dx,dy,dz)||1e-6,d=[dx/l,dy/l,dz/l];
  const up=Math.abs(d[1])>.9?[1,0,0]:[0,1,0],s1=[d[1]*up[2]-d[2]*up[1],d[2]*up[0]-d[0]*up[2],d[0]*up[1]-d[1]*up[0]],l1=Math.hypot(...s1);for(let i=0;i<3;i++)s1[i]/=l1;
  const s2=[d[1]*s1[2]-d[2]*s1[1],d[2]*s1[0]-d[0]*s1[2],d[0]*s1[1]-d[1]*s1[0]],c=[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2];
  const P=(e:number[],i:number,j:number)=>[e[0]+(s1[0]*i+s2[0]*j)*r,e[1]+(s1[1]*i+s2[1]*j)*r,e[2]+(s1[2]*i+s2[2]*j)*r];
  // diamond: corners on the axes, so no face is level (wires, arms, ridges: nothing to land on from the air).
  for(const [i,j,k,m] of diamond?[[1,0,0,-1],[0,-1,-1,0],[-1,0,0,1],[0,1,1,0]]:[[1,1,1,-1],[1,-1,-1,-1],[-1,-1,-1,1],[-1,1,1,1]])this.quad(P(a,i,j),P(b,i,j),P(b,k,m),P(a,k,m),c);}
 /** Triangle with its own vertex normals, wound to face along them (Rail + beach props, Nov 27). */
 triO(a:number[],b:number[],c:number[],na:number[],nb:number[],nc:number[]){const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];
  if((uy*vz-uz*vy)*(na[0]+nb[0]+nc[0])+(uz*vx-ux*vz)*(na[1]+nb[1]+nc[1])+(ux*vy-uy*vx)*(na[2]+nb[2]+nc[2])<0)this.triN(a,c,b,na,nc,nb);else this.triN(a,b,c,na,nb,nc);}
 /** Rail + beach props (Nov 27, owner 184): a solid of revolution round the vertical axis at (cx, cz): profile [radius, y] from the
  *  foot up (radius 0 at the end = a closed round cap); smooth normals. 2·sides per profile step. */
 lathe(cx:number,cz:number,prof:[number,number][],sides:number){const n=prof.length,N:number[][]=[];
  for(let i=0;i<n;i++){const a=prof[Math.max(0,i-1)],b=prof[Math.min(n-1,i+1)],dr=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dr,dy)||1;N.push([dy/l,-dr/l]);}
  const P=(i:number,k:number)=>{const t=k/sides*Math.PI*2;return [cx+Math.cos(t)*prof[i][0],prof[i][1],cz+Math.sin(t)*prof[i][0]];},Q=(i:number,k:number)=>{const t=k/sides*Math.PI*2;return [Math.cos(t)*N[i][0],N[i][1],Math.sin(t)*N[i][0]];};
  for(let i=0;i<n-1;i++)for(let k=0;k<sides;k++){if(prof[i+1][0]>1e-5)this.triO(P(i,k),P(i+1,k),P(i+1,k+1),Q(i,k),Q(i+1,k),Q(i+1,k+1));if(prof[i][0]>1e-5)this.triO(P(i,k),P(i+1,k+1),P(i,k+1),Q(i,k),Q(i+1,k+1),Q(i,k+1));}}
 /** A round tube along a path (parallel-transported frame, shared sections: no seams), radius r0 at the start to r1 at the end; open ends. */
 tube(pts:number[][],rad:number[],sides:number){const n=pts.length,nrm=(v:number[])=>{const l=Math.hypot(v[0],v[1],v[2])||1e-9;return [v[0]/l,v[1]/l,v[2]/l];};
  const T_=pts.map((_,i)=>{const a=pts[Math.max(0,i-1)],b=pts[Math.min(n-1,i+1)];return nrm([b[0]-a[0],b[1]-a[1],b[2]-a[2]]);});
  const cr=(a:number[],b:number[])=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];let A=nrm(cr(T_[0],Math.abs(T_[0][1])>.9?[1,0,0]:[0,1,0]));
  const R:{p:number[];n:number[]}[][]=[];for(let i=0;i<n;i++){const t=T_[i],d=A[0]*t[0]+A[1]*t[1]+A[2]*t[2];A=nrm([A[0]-t[0]*d,A[1]-t[1]*d,A[2]-t[2]*d]);const B=cr(t,A),r=rad[i]??rad[rad.length-1],o=[];
   for(let k=0;k<=sides;k++){const th=k/sides*Math.PI*2,c=Math.cos(th),sn=Math.sin(th),q=[A[0]*c+B[0]*sn,A[1]*c+B[1]*sn,A[2]*c+B[2]*sn];o.push({p:[pts[i][0]+q[0]*r,pts[i][1]+q[1]*r,pts[i][2]+q[2]*r],n:q});}R.push(o);}
  for(let i=0;i<n-1;i++)for(let k=0;k<sides;k++){const a=R[i][k],b=R[i+1][k],c=R[i+1][k+1],d=R[i][k+1];this.triO(a.p,b.p,c.p,a.n,b.n,c.n);this.triO(a.p,c.p,d.p,a.n,c.n,d.n);}}
 get empty(){return this.p.length===0;}
 build(ox:number,oz:number){const g=new T.BufferGeometry(),p=new Float32Array(this.p);for(let i=0;i<p.length;i+=3){p[i]-=ox;p[i+2]-=oz;}
  g.setAttribute('position',new T.BufferAttribute(p,3));g.setAttribute('normal',new T.BufferAttribute(new Float32Array(this.n),3));return g;}
}

/** The South Bridge's main-span trusses (Nov 24 2026): two Pratt pony trusses (bottom chord at the cross girders, top chord
 *  TRUSS_H above the bed, verticals, diagonals falling to mid-span, inclined end posts) outside the cars (half width 1.4) and
 *  inside the catenary poles (2.7 m out), plus a cross girder under the deck at every panel point. ~400 tris. */
export const TRUSS_OFFSET=2.05,TRUSS_H=2.5,TRUSS_PANELS=6;
function bridgeTruss(profile:ReturnType<typeof trainLayout>['profile']):Geo{
 const g=new Geo(),A=SOUTH_BRIDGE.spanA,B=SOUTH_BRIDGE.spanB,N=TRUSS_PANELS;
 const at=(k:number,v:number,dy:number)=>{const s=A+(B-A)*k/N,t=trackAt(s);return [t.x+t.tz*v,bedAt(profile,s)+dy,t.z-t.tx*v];};
 const BOT=-.32,TOP=TRUSS_H;
 for(let k=0;k<=N;k++)g.beam(at(k,-TRUSS_OFFSET,BOT-.08),at(k,TRUSS_OFFSET,BOT-.08),.13);// cross girders (under the sleepers and girders)
 for(const side of [-1,1]){const v=side*TRUSS_OFFSET,b=(k:number)=>at(k,v,BOT),t=(k:number)=>at(k,v,TOP);
  for(let k=0;k<N;k++)g.beam(b(k),b(k+1),.14);
  for(let k=1;k<N-1;k++)g.beam(t(k),t(k+1),.14);
  g.beam(b(0),t(1),.14);g.beam(b(N),t(N-1),.14);
  for(let k=1;k<N;k++)g.beam(b(k),t(k),.08);
  for(let k=1;k<N-1;k++)k<N/2?g.beam(t(k),b(k+1),.08):g.beam(b(k),t(k+1),.08);}
 return g;}

/** A lathe round a vertical axis at (cx, cy, cz): profile [radius, y offset] bottom to top, n sides, every face turned out (open ends). */
function lathe(g:Geo,cx:number,cy:number,cz:number,prof:readonly (readonly [number,number])[],n:number,turn=0){
 for(let i=0;i+1<prof.length;i++){const [r0,y0]=prof[i],[r1,y1]=prof[i+1],mid=[cx,cy+(y0+y1)/2,cz];
  for(let k=0;k<n;k++){const a=turn+k/n*Math.PI*2,b=turn+(k+1)/n*Math.PI*2,P=(r:number,y:number,t:number)=>[cx+Math.cos(t)*r,cy+y,cz+Math.sin(t)*r];
   g.quad(P(r0,y0,a),P(r0,y0,b),P(r1,y1,b),P(r1,y1,a),mid);}}
}
/** A disc (top / bottom of a rim) at height cy, facing up (dir 1) or down (-1). */
function disc(g:Geo,cx:number,cy:number,cz:number,r:number,n:number,dir:number){for(let k=0;k<n;k++){const a=k/n*Math.PI*2,b=(k+1)/n*Math.PI*2;g.tri([cx,cy,cz],[cx+Math.cos(a)*r,cy,cz+Math.sin(a)*r],[cx+Math.cos(b)*r,cy,cz+Math.sin(b)*r],[cx,cy-dir,cz]);}}
/** Paper lantern (owner shot 146, Nov 26 2026: "more rounded and less blocky"): an 8-sided barrel with a gentle bulge whose
 *  facet steps read as the paper's ribs, two thin dark rib bands, round black rims top and bottom, a short cord tassel. ~180 tris. */
const LANTERN_PROFILE=[[.1,-.27],[.165,-.21],[.2,-.12],[.212,-.04],[.212,.04],[.2,.12],[.165,.21],[.1,.27]] as const;
function paperLantern(body:Geo,dark:Geo,x:number,y:number,z:number){
 lathe(body,x,y,z,LANTERN_PROFILE,8,.39);
 for(const ry of [-.12,.12])lathe(dark,x,y+ry,z,[[.204,-.009],[.204,.009]],8,.39);
 for(const [ry,d] of [[.27,1],[-.27,-1]] as const){lathe(dark,x,y+ry,z,[[.11,-.03],[.11,.03]],8,.39);disc(dark,x,y+ry+.03*d,z,.11,8,d);}
 dark.beam([x,y-.3,z],[x,y-.44,z],.014);dark.beam([x,y-.44,z],[x,y-.47,z],.028);
}
/** Grounding 2 (grounding.ts): every catenary pole on land (x, z, the plinth's half width); the island's contact shade and the beach's
 *  sand mounds read this after the line is built. Refilled on every build. */
export const catenaryFeet:{x:number;z:number;r:number}[]=[];
export function buildTrainWorld(tools:TrainTools){catenaryFeet.length=0;
 const {put,lit,town,obstacles,walkSurfaces}=tools;
 // Lowest heat tier at build (the world builds once; Battery saver forces tier 4 from the first frame): no contact wire (poles keep
 // the post and arm, and their colliders), sleepers as ONE flat strip per row in a sleeper-over-ballast colour (on land it is the
 // ballast's own top, lifted to the sleeper top: 4 fewer tris a row; on the trestle 2 tris instead of 4), and the stations without
 // lanterns, tile courses, ridge ends or the bench. Same paints, same batches: no new draw or program. Higher tiers unchanged.
 const lite=tools.lite??effectiveTier()===LOWEST_TIER;
 const L=trainLayout(),K=L.profile.kind,BED=L.profile.bed,n=TRACK.n;
 const solid=(...os:Obstacle[])=>{for(const o of os){(o as Obstacle&{train?:boolean}).train=true;obstacles.push(o);}};
 const skip=(m:T.Mesh)=>{m.userData.skipRoofObstacle=true;m.userData.train=true;return m;};
 const emit=(g:Geo,color:string,ox:number,oz:number,y=0)=>{if(g.empty)return null;return skip(put(g.build(ox,oz),color,ox,y,oz));};
 const stationAt=(s:number)=>TRAIN_STATIONS.find(st=>Math.abs(wrapS(s-st.s+TRACK.length/2)-TRACK.length/2)<STATION_HALF+1);
 const crossingAt=(s:number,pad=0)=>TRAIN_CROSSINGS.find(c=>Math.abs(wrapS(s-c.s+TRACK.length/2)-TRACK.length/2)<c.width/2+pad);
 /** A track row (from point a, TRACK_DS long) cut at a crossing deck's two ends: [from, to, the deck's ends or null] parts. */
 const xingParts=(a:ReturnType<typeof pt>,b:ReturnType<typeof pt>)=>{type P=ReturnType<typeof pt>;type X={s0:number;s1:number}|null;const aE=a.s+TRACK_DS;
  const at=(s:number):P=>{const f=(s-a.s)/TRACK_DS;return {...a,x:a.x+(b.x-a.x)*f,z:a.z+(b.z-a.z)*f,bed:a.bed+(b.bed-a.bed)*f,s};};
  for(const c of TRAIN_CROSSINGS){const m=a.s+wrapS(c.s-a.s+TRACK.length/2)-TRACK.length/2,s0=m-c.width/2,s1=m+c.width/2;if(s1<=a.s+1e-4||s0>=aE-1e-4)continue;
   const p0=s0>a.s+1e-4?at(s0):a,p1=s1<aE-1e-4?at(s1):b,out:[P,P,X][]=[];
   if(p0!==a)out.push([a,p0,null]);out.push([p0,p1,{s0,s1:p1===b?s1+b.s-aE:s1}/* b.s wraps to 0 on the loop's last row */]);if(p1!==b)out.push([p1,b,null]);return out;}
  return [[a,b,null]] as [P,P,X][];};
 const isTunnel=(i:number)=>K[i]===TrackKind.Tunnel;
 const pt=(i:number)=>({x:TRACK.x[i%n],z:TRACK.z[i%n],tx:TRACK.tx[i%n],tz:TRACK.tz[i%n],bed:BED[i%n],kind:K[i%n],s:(i%n)*TRACK_DS});
 const off=(p:{x:number;z:number;tx:number;tz:number},v:number,y:number)=>[p.x+p.tz*v,y,p.z-p.tx*v];
 let poleNext=POLE_STEP/2,moved=0;
 const pierRows=new Set(L.piers.map(p=>Math.round(p.s/TRACK_DS)%n));

 // ------------------------------------------------------------------ bridge heads
 // Nov 24 2026 rebuild (owner shot 36: "not blending in nicely, there are gaps"): one continuous head at every land/trestle joint.
 // A stone abutment with a slight batter (faces lean out 8 cm per metre down), its back wall at the ballast's level with a coping
 // curb each side, and a bearing seat 0.42 m under the bed that the deck's two girders sit ON (they start at the seat, so the
 // sleepers over the joint rest on girders, never in mid-air). Where the line comes off a raised embankment, return wing walls
 // close the embankment's end along its own slope (top following the ballast slope, foot sunk into the sand / sea: no open end, no
 // floating slab). Rip-rap stones (the island's low-poly rock, merged into the chunk's paint batch) round the foot in the water.
 // Same paints, same batches: no new draw or program. Geometry goes into the head row's chunk Geos (set per chunk below).
 let G:{wall:Geo;wallTop:Geo;girders:Geo;ballast:Geo;rocks:Geo}|null=null;
 const ROCK=new T.IcosahedronGeometry(1,0),rockP=ROCK.getAttribute('position');
 function bridgeHead(a:ReturnType<typeof pt>,b:ReturnType<typeof pt>){
  if(!G)return;const {wall,wallTop,girders,ballast,rocks}=G;
  const land=a.kind!==TrackKind.Sea?a:b,sea=land===a?b:a,dir=land===a?1:-1,b0=land.bed,g=onSummitTrackS(land.s)?land.bed:0;
  const P=(u:number,v:number,y:number)=>[land.x+land.tx*u*dir+land.tz*v,y,land.z+land.tz*u*dir-land.tx*v];
  const foot=Math.min(g,0)-1.7,back=-1.1,seat=.35,front=1.25,bat=.08,hw=2.3,yTop=b0+.09,ySeat=b0-.42,inside=P((back+front)/2,0,ySeat-.6);
  const vAt=(y:number)=>hw+(yTop-y)*bat,uFoot=front+(ySeat-foot)*bat;
  // seat, back wall riser and top, front face, sides, back
  wallTop.quad(P(seat,-vAt(ySeat),ySeat),P(front,-vAt(ySeat),ySeat),P(front,vAt(ySeat),ySeat),P(seat,vAt(ySeat),ySeat),inside);
  wall.quad(P(seat,-hw,yTop),P(seat,hw,yTop),P(seat,vAt(ySeat),ySeat),P(seat,-vAt(ySeat),ySeat),P(seat-1,0,ySeat));
  wallTop.quad(P(back,-hw,yTop),P(seat,-hw,yTop),P(seat,hw,yTop),P(back,hw,yTop),inside);
  wall.quad(P(front,-vAt(ySeat),ySeat),P(front,vAt(ySeat),ySeat),P(uFoot,vAt(foot),foot),P(uFoot,-vAt(foot),foot),inside);
  for(const sg of [-1,1]){wall.quad(P(back,sg*hw,yTop),P(seat,sg*hw,yTop),P(seat,sg*vAt(foot),foot),P(back,sg*vAt(foot),foot),inside);
   wall.quad(P(seat,sg*vAt(ySeat),ySeat),P(front,sg*vAt(ySeat),ySeat),P(uFoot,sg*vAt(foot),foot),P(seat,sg*vAt(foot),foot),inside);
   // coping curb on the back wall, outside the ballast
   if(!crossingAt(land.s,4)){const c=P((back+seat)/2,sg*(1.5+hw+.12)/2,yTop+.04);wallTop.box(c[0],c[1],c[2],land.tx,land.tz,(seat-back)/2+.05,(hw+.12-1.5)/2,.04);}}
  wall.quad(P(back,-hw,yTop),P(back,hw,yTop),P(back,hw,foot),P(back,-hw,foot),inside);
  // ballast over the back wall up to the seat (the land rows' ballast top ends at the land point)
  if(land.kind===TrackKind.Land){const t=b0+(lite?SLEEPER_TOP:BALLAST_TOP);ballast.quad(P(-.02,-1.45,t),P(seat,-1.45,t),P(seat,1.45,t),P(-.02,1.45,t),inside);
   ballast.quad(P(seat,-1.45,t),P(seat,1.45,t),P(seat,1.45,yTop-.01),P(seat,-1.45,yTop-.01),P(seat-1,0,yTop));}
  // the joint's girders: from the seat out to the first sea row
  for(const side of [-1,1]){const v=side*RAIL_HALF_GAUGE,w=.2,A=(vv:number,y:number)=>P(seat+.05,vv,y),B=(vv:number,y:number)=>off(sea,vv,y),top=b0+SLEEPER_TOP-.1,bot=b0-.4,topB=sea.bed+SLEEPER_TOP-.1,botB=sea.bed-.4,ins=P(1,v,b0-.15);
   girders.quad(A(v-w,bot),B(v-w,botB),B(v-w,topB),A(v-w,top),ins);girders.quad(A(v+w,bot),B(v+w,botB),B(v+w,topB),A(v+w,top),ins);girders.quad(A(v-w,bot),B(v-w,botB),B(v+w,botB),A(v+w,bot),ins);
   girders.quad(A(v-w,bot),A(v+w,bot),A(v+w,top),A(v-w,top),P(2,v,b0-.15));}
  // return wing walls: close the embankment's end (its side slope runs from the ballast shoulder at 1.45 m to fa at the ground)
  const fa=land.kind===TrackKind.Land?1.9+(b0-g)*1.4:0,yS=(v:number)=>Math.max(g+.04,b0+.12-(v-1.45)/Math.max(.1,fa-1.45)*(b0+.12-(g-.06)))+.08;
  if(fa+.25>hw+.05)for(const sg of [-1,1]){const v0=hw-.15,v1=fa+.3,u0=-.05,u1=.3,y0=yS(v0),y1=yS(v1);
   wall.quad(P(u1,sg*v0,y0),P(u1,sg*v1,y1),P(u1,sg*v1,foot),P(u1,sg*v0,foot),P(u0-1,sg*(v0+v1)/2,foot));
   wallTop.quad(P(u0,sg*v0,y0),P(u1,sg*v0,y0),P(u1,sg*v1,y1),P(u0,sg*v1,y1),P((u0+u1)/2,sg*(v0+v1)/2,foot));
   wall.quad(P(u0,sg*v1,y1),P(u1,sg*v1,y1),P(u1,sg*v1,foot),P(u0,sg*v1,foot),P((u0+u1)/2,sg*v0,foot));}
  // rip-rap: stones round the foot where it stands in the sea
  if(!lite){let k=0;const put1=(u0:number,v:number)=>{const j=Math.sin(land.s*12.9898+v*78.233)*43758.5453,f=j-Math.floor(j),u=u0+(f-.5)*.6,q=P(u,v+(f-.5)*.3,0);if(onLand(q[0],q[2]))return;k++;const r=.26+f*.36,yaw=k*2.17+f*3,cy=Math.cos(yaw),sy=Math.sin(yaw);
    for(let t=0;t<rockP.count;t+=3){const tri:number[][]=[];for(let j=0;j<3;j++){const x=rockP.getX(t+j)*r,y=rockP.getY(t+j)*r*.55,z=rockP.getZ(t+j)*r;tri.push([q[0]+x*cy-z*sy,-.3-f*.12+y,q[2]+x*sy+z*cy]);}rocks.tri(tri[0],tri[1],tri[2]);}};
   for(let v=-hw-.5;v<=hw+.5;v+=.7){put1(uFoot+.3,v);if(Math.round(v*10)%3===0)put1(uFoot+.95,v+.35);}
   for(const sg of [-1,1]){put1(uFoot+.1,sg*(hw+.9));if(fa+.25>hw+.05)for(let v=hw+.9;v<=fa+.5;v+=.85)put1(.75,sg*v);}}
 }

 // ------------------------------------------------------------------ catenary (Looks 2, Nov 24 2026; owner shots 43, 46)
 // The contact wire is ONE continuous diamond tube round the whole loop (through the tunnel too, under the tube's crown): one ring
 // of 4 corners per track row, shared by the two rows either side, so there is no gap or step at a chunk, pole, bridge head or
 // station. With the poles' thin arms, braces and droppers it is one mesh with its own material that discards every fragment
 // within CAT_FADE_NEAR m of the camera (dithered out to CAT_FADE_FAR m): seen from a roof or a close ride view the wire no
 // longer fills the screen as a dark slab. One draw for the whole catenary (it was a paint per 50 m cell), no per-frame work.
 const catArm=new Geo(),catWire=new Geo();
 if(!lite){const r=WIRE_R,ring=(i:number)=>{const p=pt(i),y=p.bed+WIRE_Y,nx=p.tz,nz=-p.tx;return [[p.x+nx*r,y,p.z+nz*r],[p.x,y+r,p.z],[p.x-nx*r,y,p.z-nz*r],[p.x,y-r,p.z]];};
  let A=ring(0);for(let i=0;i<n;i++){const B=ring(i+1),c=[(A[0][0]+A[2][0])/2,A[0][1],(A[0][2]+A[2][2])/2];for(let k=0;k<4;k++)catWire.quad(A[k],B[k],B[(k+1)%4],A[(k+1)%4],c);A=B;}}

 // ------------------------------------------------------------------ track chunks
 const perChunk=Math.round(CHUNK_LENGTH/TRACK_DS);
 for(let c0=0;c0<n;c0+=perChunk){
  const c1=Math.min(n,c0+perChunk),mid=pt((c0+c1)>>1),ox=Math.round(mid.x),oz=Math.round(mid.z);
  const footings=new Geo(),rails=new Geo(),railTops=new Geo(),sleepers=new Geo(),ballast=new Geo(),girders=new Geo(),piers=new Geo(),wall=new Geo(),wallTop=new Geo(),poles=new Geo(),xdeck=new Geo(),bedTop=new Geo();
  const rocks=new Geo();G={wall,wallTop,girders,ballast,rocks};
  for(let i=c0;i<c1;i++){
   const a=pt(i),b=pt(i+1);if(isTunnel(i)||isTunnel(i+1))continue;
   // Rails: a top and two sides per rail per row (no ends, no bottom).
   for(const side of [-1,1]){const v=side*RAIL_HALF_GAUGE,w=.055;
    const A0=off(a,v-w,a.bed+RAIL_TOP),A1=off(a,v+w,a.bed+RAIL_TOP),B0=off(b,v-w,b.bed+RAIL_TOP),B1=off(b,v+w,b.bed+RAIL_TOP);
    railTops.quad(A0,B0,B1,A1,[A0[0],A0[1]-1,A0[2]]);
    const a0=off(a,v-w,a.bed+SLEEPER_TOP),a1=off(a,v+w,a.bed+SLEEPER_TOP),b0=off(b,v-w,b.bed+SLEEPER_TOP),b1=off(b,v+w,b.bed+SLEEPER_TOP),mid=off(a,v,a.bed+.27);
    rails.quad(a0,b0,B0,A0,mid);rails.quad(a1,b1,B1,A1,mid);}
   // Rail fixes (Nov 26 2026, owner 151: "this brown part on the track needs to be shifted ... to match with the path"): a crossing deck
   // covers exactly [c.s - width/2, c.s + width/2] (c.s is the path's centreline: trainTrack.ts). It used to cover the whole 2 m rows
   // whose START lay in that range: every deck sat ~1 m forward of its path and a 3 m beach path got a 2 m deck. A row the deck edge
   // falls in is split: ballast and sleepers on its open part, the deck on the rest.
   {const ra=a,rb=b;for(const [a,b,xing] of xingParts(ra,rb)){
   if(xing){// The crossing deck (Nov 23 2026, owner: flush): a dark top just under the rail heads between and beside the rails, then
    // sloping down to the ground on both sides (to XING_FOOT, just past the ballast), so it reads as part of the road, not a slab.
    const yt=RAIL_TOP-.03,inside=off(a,0,a.bed-1),gy=(p:typeof a)=>onSummitTrackS(p.s)?p.bed:0;
    xdeck.quad(off(a,-1,a.bed+yt),off(b,-1,b.bed+yt),off(b,1,b.bed+yt),off(a,1,a.bed+yt),inside);
    for(const side of [-1,1])xdeck.quad(off(a,side,a.bed+yt),off(b,side,b.bed+yt),off(b,side*XING_FOOT,gy(b)+.01),off(a,side*XING_FOOT,gy(a)+.01),inside);
    // Nov 24 2026 (owner 13.png, "skewed slab" at West Beach): the deck's two ends are closed down to the ground (it was a thin
    // sheet with open ends over the cut ballast, reading as a plank lying askew); the end faces also cap the ballast's section.
    for(const [p,q,first] of [[a,b,Math.abs(a.s-xing.s0)<1e-4],[b,a,Math.abs(b.s-xing.s1)<1e-4]] as const){if(!first)continue;
     const g=gy(p)-.06,inn=[p.x+(q.x-p.x)*.5,p.bed,p.z+(q.z-p.z)*.5];
     xdeck.quad(off(p,-1,p.bed+yt),off(p,1,p.bed+yt),off(p,1,g),off(p,-1,g),inn);
     for(const side of [-1,1])xdeck.quad(off(p,side,p.bed+yt),off(p,side*XING_FOOT,gy(p)+.01),off(p,side*XING_FOOT,g),off(p,side,g),inn);}}
   // Sleepers every 1 m (two per row) on ballast; the sea wall and the trestle carry them too.
   if(lite&&!xing){if(a.kind===TrackKind.Sea||b.kind===TrackKind.Sea)sleepers.quad(off(a,-1.15,a.bed+SLEEPER_TOP),off(b,-1.15,b.bed+SLEEPER_TOP),off(b,1.15,b.bed+SLEEPER_TOP),off(a,1.15,a.bed+SLEEPER_TOP),off(a,0,a.bed-1));}
   else for(const f of [.25,.75]){const sf=ra.s+TRACK_DS*f;if(sf<a.s||sf>=(b===rb?ra.s+TRACK_DS:b.s))continue;/* this part of the row only */const x=ra.x+(rb.x-ra.x)*f,z=ra.z+(rb.z-ra.z)*f,y=ra.bed+(rb.bed-ra.bed)*f;if(!xing){/* Nov 23 2026 (heat): the top face only (2 tris, was 6): the 0.1 m sides never read from the game's camera. */const T0=[x-a.tx*.13+a.tz*1.15,y+SLEEPER_TOP,z-a.tz*.13-a.tx*1.15],T1=[x+a.tx*.13+a.tz*1.15,y+SLEEPER_TOP,z+a.tz*.13-a.tx*1.15],T2=[x+a.tx*.13-a.tz*1.15,y+SLEEPER_TOP,z+a.tz*.13+a.tx*1.15],T3=[x-a.tx*.13-a.tz*1.15,y+SLEEPER_TOP,z-a.tz*.13+a.tx*1.15];sleepers.quad(T0,T1,T2,T3,[x,y,z]);}}
   if(a.kind!==TrackKind.Sea&&b.kind!==TrackKind.Sea&&!xing){// Ballast: one continuous trapezoid strip on every land row (Nov 23 2026: was broken into
    // slabs round the crossings); it stops only under a crossing deck. On the bridge-head embankment (bed above the ground, trackProfile
    // RAMP_LAND) its sides run on down to the ground, widening as they go.
    const gy=(p:typeof a)=>onSummitTrackS(p.s)?p.bed:0,fa=1.9+(a.bed-gy(a))*1.4,fb=1.9+(b.bed-gy(b))*1.4;
    const bt=lite?SLEEPER_TOP:BALLAST_TOP,t0=off(a,-1.45,a.bed+bt),t1=off(a,1.45,a.bed+bt),u0=off(b,-1.45,b.bed+bt),u1=off(b,1.45,b.bed+bt),
     f0=off(a,-fa,gy(a)-.06),f1=off(a,fa,gy(a)-.06),g0=off(b,-fb,gy(b)-.06),g1=off(b,fb,gy(b)-.06),inside=off(a,0,a.bed-1);
    (lite?bedTop:ballast).quad(t0,u0,u1,t1,inside);ballast.quad(f0,g0,u0,t0,inside);ballast.quad(t1,u1,g1,f1,inside);}
   }}
   if(a.kind!==TrackKind.Sea&&b.kind===TrackKind.Sea||a.kind===TrackKind.Sea&&b.kind!==TrackKind.Sea)bridgeHead(a,b);
   if(a.kind===TrackKind.Wall){// The sea wall: a stone top and two faces down into the water (Enoden-style).
    const h=SEA_WALL_HALF,top=-.02,foot=-2.6,inside=off(a,0,-1);
    wallTop.quad(off(a,-h,top),off(b,-h,top),off(b,h,top),off(a,h,top),inside);
    wall.quad(off(a,-h,foot),off(b,-h,foot),off(b,-h,top),off(a,-h,top),inside);wall.quad(off(a,h,foot),off(b,h,foot),off(b,h,top),off(a,h,top),inside);}
   if(a.kind===TrackKind.Sea&&b.kind===TrackKind.Sea){// Trestle deck: two girders under the rails (a bridge-head row: bridgeHead).
    for(const side of [-1,1]){const v=side*RAIL_HALF_GAUGE,w=.2,top=a.bed+SLEEPER_TOP-.1,bot=a.bed-.4,topB=b.bed+SLEEPER_TOP-.1,botB=b.bed-.4,inside=off(a,v,a.bed-.15);
     girders.quad(off(a,v-w,bot),off(b,v-w,botB),off(b,v-w,topB),off(a,v-w,top),inside);girders.quad(off(a,v+w,bot),off(b,v+w,botB),off(b,v+w,topB),off(a,v+w,top),inside);girders.quad(off(a,v-w,bot),off(b,v-w,botB),off(b,v+w,botB),off(a,v+w,bot),inside);}}
   // Catenary: a pole with its cantilever arm every ~POLE_STEP m (right side; platforms are all on the left), not at crossings.
   // (and never on a west-park trail: the pole slides along to the next row clear of it)
   // Nov 27 2026 (owner 155: a mast stood in the tunnel mouth): none within POLE_PORTAL_CLEAR m of a portal (or inside)
   if(a.s>=poleNext&&!(a.s>TUNNEL.west.s-POLE_PORTAL_CLEAR&&a.s<TUNNEL.east.s+POLE_PORTAL_CLEAR)&&(a.kind!==TrackKind.Sea||pierRows.has(i%n))&&!crossingAt(a.s,2)&&!(a.x<-100&&onWalkPath(off(a,-2.7,0)[0],off(a,-2.7,0)[2],.4))&&!POLE_KEEP_CLEAR.some(([kx,kz])=>Math.hypot(off(a,-2.7,0)[0]-kx,off(a,-2.7,0)[2]-kz)<3)){poleNext=a.s+POLE_STEP;
    // (Nov 24 2026: over the sea a pole stands only on a pier, on a bracket off the cap beam's end: it floated beside the deck)
    // Grounding 2 (owner shot 141, Nov 26: the square post ended in a clean cut on top of the sand): on land the pole runs on 0.9 m
    // into the ground and stands in a stepped concrete footing (0.34 m, then a 0.27 m cap, ~20 tris, in the wall paint: 0 draws).
    const sea=a.kind===TrackKind.Sea,ground2=groundingOn()&&!sea,base=sea?a.bed-.8:ground2?a.bed-.9:a.bed,top=a.bed+WIRE_Y+.55,P=off(a,-2.7,0),r=.11;
    // Rail + beach props (Nov 27, owner 184: "more rounded and less blocky"): a tapered ROUND pole with a domed top in a round,
    // shoulder-rounded plinth sunk into the ground (lathes, smooth normals; 8 sides, 6 on the lowest tier); the arm a gently bowed
    // round tube to the same wire point, the brace a curved round strut. Same spots, colliders and wire attach. `?soft=0`: the boxes.
    const SOFTP=softOn(),WEST=P[0]<-100,PS=lite||WEST?5:8;// west of x -100 (the stadium budget: tests/west-stadium.cjs, ~80 tris spare): 5 sides, 2-step profiles = ~+5 tris a mast
    if(ground2){if(SOFTP)footings.lathe(P[0],P[2],WEST?[[.24,a.bed-.6],[.13,a.bed+.15]]:[[.2,a.bed-.6],[.2,a.bed+.03],[.19,a.bed+.09],[.165,a.bed+.135],[.13,a.bed+.15]],PS);
     else{footings.box(P[0],a.bed-.5,P[2],a.tx,a.tz,.17,.17,.56);footings.box(P[0],a.bed+.1,P[2],a.tx,a.tz,.135,.135,.05);}catenaryFeet.push({x:P[0],z:P[2],r:.17});}
    if(sea){const q=off(a,-2.25,a.bed-.63);piers.box(q[0],q[1],q[2],a.tx,a.tz,.28,.7,.16,false);}// (top 5 cm under the cap's: never coplanar)
    if(SOFTP)poles.lathe(P[0],P[2],WEST?[[.125,base],[.08,top-.02],[0,top+.04]]:[[.125,base],[.115,a.bed+1.5],[.09,top-.1],[.075,top-.03],[.045,top+.01],[0,top+.03]],PS);
    else poles.box(P[0],(base+top)/2,P[2],a.tx,a.tz,r,r,(top-base)/2);
    // Looks 2 (Nov 24 2026): the thin arm, brace and dropper go in the catenary mesh (near-camera fade); lite keeps the arm here.
    if(lite)poles.beam([P[0],a.bed+WIRE_Y+.4,P[2]],off(a,.25,a.bed+WIRE_Y+.4),.05,true);
    else if(SOFTP){const Y=a.bed+WIRE_Y,arm:number[][]=[],br:number[][]=[];
     for(let k=0;k<=6;k++){const u=k/6;arm.push(off(a,-2.75+3.0*u,Y+.4+.1*Math.sin(Math.PI*Math.min(1,u*1.1))));}// bowed up mid-span, back to Y+.4 by the dropper
     const e=arm[6],e2=off(a,.29,Y+.4),e3=off(a,.305,Y+.4);catArm.tube([...arm,e2,e3],[.05,.05,.05,.05,.05,.048,.045,.032,0],6);
     for(let k=0;k<=6;k++){const u=k/6,v=-2.66+2.42*u,h=Y-.3+.68*u-.22*Math.sin(Math.PI*u);br.push(off(a,v,h));}catArm.tube(br,[.04,.035,.035,.035,.035,.035,.03],5);void e;
     catArm.beam(off(a,0,a.bed+WIRE_Y+.4),off(a,0,a.bed+WIRE_Y),.025,true);}
    else{catArm.beam([P[0],a.bed+WIRE_Y+.4,P[2]],off(a,.25,a.bed+WIRE_Y+.4),.05,true);catArm.beam(off(a,-2.6,a.bed+WIRE_Y-.3),off(a,-.2,a.bed+WIRE_Y+.38),.035,true);
     catArm.beam(off(a,0,a.bed+WIRE_Y+.4),off(a,0,a.bed+WIRE_Y),.025,true);}
    if(a.kind!==TrackKind.Sea)solid({x:P[0],z:P[2],w:.4,d:.4});}
  }
  // Trestle piers in this chunk: a cap beam across and two columns down into the sea. Nov 24 2026 (South Bridge): a pier taller
  // than 2.6 m gets a tie beam and X braces between its columns (a trestle bent); the main span's two piers are heavier.
  for(const p of L.piers){const i=Math.round(p.s/TRACK_DS);if(i<c0||i>=c1)continue;
   const capY=p.bed-.6,half=p.main?MAIN_COLUMN_HALF:PIER_COLUMN_HALF,top=capY-.2,foot=-3.2;piers.box(p.x,capY,p.z,p.tx,p.tz,p.main?.6:.35,p.main?1.75:1.55,.2,false);
   const col=(side:number,y:number)=>[p.x+p.tz*PIER_COLUMN_OFFSET*side,y,p.z-p.tx*PIER_COLUMN_OFFSET*side];
   for(const side of [-1,1]){const c=col(side,0);piers.box(c[0],(top+foot)/2,c[2],p.tx,p.tz,half,half,(top-foot)/2);}
   if(top>2.6){const lo=.6,mid=(lo+top)/2,r=.07;// braces stop short of the water (the bents' own feet stand in it)
    for(const y of [lo,mid])piers.beam(col(-1,y),col(1,y),r+.02);
    for(const [y0,y1] of [[lo,mid],[mid,top-.05]] as const){piers.beam(col(-1,y0),col(1,y1),r,true);piers.beam(col(1,y0),col(-1,y1),r,true);}}}
  // The main span over the channel: a steel pony truss each side (Pratt panels, inclined end posts) on cross girders under the deck,
  // merged into the rails' paint (same grey steel, no new paint or draw). Built once, in the chunk that holds the span's middle.
  {const mi=Math.round(SOUTH_BRIDGE.mid/TRACK_DS);if(mi>=c0&&mi<c1){const t=bridgeTruss(L.profile);rails.p.push(...t.p);rails.n.push(...t.n);}}
  emit(rails,C.rail,ox,oz);emit(railTops,C.railTop,ox,oz);emit(sleepers,C.sleeper,ox,oz);emit(ballast,C.ballast,ox,oz);emit(girders,C.girder,ox,oz);emit(piers,C.pier,ox,oz);
  emit(wall,C.wall,ox,oz);emit(wallTop,C.wallTop,ox,oz);emit(poles,C.pole,ox,oz);emit(xdeck,C.crossDeck,ox,oz);emit(bedTop,C.sleeperBed,ox,oz);emit(rocks,C.wall,ox,oz);emit(footings,C.wall,ox,oz);/* the abutments' own stone paint: same batch, no new draw */
 }

 // Level crossings: the deck is in the row loop above; poles, crossbuck, lamps, arms, bell and colliders are Phase 2's crossing
 // machines (trainRunning.ts buildCrossing), so Phase 1's static unlit poles/lamps were removed at the Phase 3 merge.

 // ------------------------------------------------------------------ stations
 const atlas=stationAtlas();const boardMat=tools.boardMaterial(atlas);
 const signPos:number[]=[],signNor:number[]=[],signUv:number[]=[];
 for(const st of TRAIN_STATIONS)buildStation(st);
 // The five stamp-stand signs: ONE textured mesh (both faces of every sign, ~20 triangles), the line's only added draw.
 {const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(signPos,3));g.setAttribute('normal',new T.Float32BufferAttribute(signNor,3));g.setAttribute('uv',new T.Float32BufferAttribute(signUv,2));g.computeBoundingSphere();
  const m=new T.Mesh(g,boardMat);m.name='station-stamp-signs';m.userData.train=true;m.userData.skipRoofObstacle=true;town.add(m);}
 function buildStation(st:TrainStation){
  const c=trackAt(st.s),i0=Math.round(st.s/TRACK_DS)%n,bed=BED[i0],south=st.id==='south',top=bed+STATION_PLATFORM_Y,sg=st.side;
  const nrm=leftNormal(c.tx,c.tz),P=(u:number,v:number,y:number)=>[c.x+c.tx*u+nrm.x*sg*v,y,c.z+c.tz*u+nrm.z*sg*v];
  const ox=Math.round(c.x),oz=Math.round(c.z);
  const plat=new Geo(),footing=new Geo(),platSide=new Geo(),edge=new Geo(),plaster=new Geo(),timber=new Geo(),deck=new Geo(),roof=new Geo(),ridge=new Geo(),pane=new Geo(),lantern=new Geo(),cap=new Geo(),bench=new Geo(),ink=new Geo();
  const v0=1.45,v1=south?8.1:5.45,depth=v1-v0;
  // Platform in 5 m pieces along the curve (each on its own frame), with the yellow edge strip.
  for(let u=-STATION_HALF;u<STATION_HALF;u+=5){const f=trackAt(st.s+u+2.5),fn=leftNormal(f.tx,f.tz),Q=(v:number,y:number)=>[f.x+fn.x*sg*v,y,f.z+fn.z*sg*v];
   const m=Q(v0+depth/2,0),foot=bed-.05;
   // Soft sweep 2 (Nov 27 2026, owner: "less blocky"): the platform's track-side edge is a rounded nosing (a 6 cm quarter round,
   // smooth-shaded, flush with the old edge: no clearance change); the slab starts behind it. ?soft=0: the square edge.
   if(softOn()){const R=.06,mm=Q(v0+depth/2+R/2,0),o=[-fn.x*sg,0,-fn.z*sg],nc=Q(v0+R,top-R),lo=Q(v0,0);
    plat.box(mm[0],top-.04,mm[2],f.tx,f.tz,2.53,depth/2-R/2,.04);plat.nose(nc,f.tx,f.tz,2.53,o,R);
    plat.quad([lo[0]-f.tx*2.53,top-.08,lo[2]-f.tz*2.53],[lo[0]+f.tx*2.53,top-.08,lo[2]+f.tz*2.53],[lo[0]+f.tx*2.53,top-R,lo[2]+f.tz*2.53],[lo[0]-f.tx*2.53,top-R,lo[2]-f.tz*2.53],[mm[0],top-.04,mm[2]]);}
   else plat.box(m[0],top-.04,m[2],f.tx,f.tz,2.53,depth/2,.04);platSide.box(m[0],(top-.08+foot)/2,m[2],f.tx,f.tz,2.5,depth/2-.02,(top-.08-foot)/2);
   // AAA 2 (owner image 58: "it shouldn't be light near the platform"): the island's shadow map keeps a 2-texel normal offset (no
   // acne on parapets), which leaves a light strip between a wall's foot and its shadow on the sand. A dark concrete footing slopes
   // from the platform's back wall 0.4 m out and into the ground (and round the two ends): the base reads grounded, in the same
   // vertex-colour batch (no new draw), no global bias change.
   {const a=Q(v1-.02,bed+.12),b=Q(v1+.42,bed-.45),wl=2.5;footing.quad([a[0]-f.tx*wl,a[1],a[2]-f.tz*wl],[a[0]+f.tx*wl,a[1],a[2]+f.tz*wl],[b[0]+f.tx*wl,b[1],b[2]+f.tz*wl],[b[0]-f.tx*wl,b[1],b[2]-f.tz*wl],[m[0],bed-3,m[2]]);
    for(const end of [-1,1])if(end<0?u===-STATION_HALF:u+5>=STATION_HALF){const ea=Q(v0,bed+.12),eb=Q(v1,bed+.12),d=end*2.5,o=end*2.92;
     footing.quad([ea[0]+f.tx*d,ea[1],ea[2]+f.tz*d],[eb[0]+f.tx*d,eb[1],eb[2]+f.tz*d],[eb[0]+f.tx*o,bed-.45,eb[2]+f.tz*o],[ea[0]+f.tx*o,bed-.45,ea[2]+f.tz*o],[m[0],bed-3,m[2]]);}}
   const e=Q(v0+.28,0);edge.box(e[0],top+.012,e[2],f.tx,f.tz,2.53,.18,.008);// 2 cm proud of the platform top (was 1 cm: flickered at range)
   // Walk surfaces: one box when the piece is near square to the axes, else overlapping 2.3 m tiles (no gaps at any yaw).
   const square=Math.min(Math.abs(f.tx),Math.abs(f.tz))<.2;
   {if(square){const ax=Math.abs(f.tx),az=Math.abs(f.tz);walkSurfaces.push({x:m[0],z:m[2],w:5*ax+depth*az,d:5*az+depth*ax,height:top,stepUp:.6});}
    else for(let a=.8;a<5;a+=1.6)for(let b=v0+1.1;b<v1-.6;b+=1.6){const q=trackAt(st.s+u+a),qn=leftNormal(q.tx,q.tz);walkSurfaces.push({x:q.x+qn.x*sg*b,z:q.z+qn.z*sg*b,w:2.3,d:2.3,height:top,stepUp:.6});}}}
  if(south){// The beach strip between the boardwalk rail and the line: a step down to the boardwalk along the rail's openings.
   const s=P(0,v1+.35,0);walkSurfaces.push({x:s[0],z:s[2],w:STATION_HALF*2,d:.7,height:top/2,stepUp:.6});
   deck.box(s[0],top/2-.04,s[2],c.tx,c.tz,STATION_HALF,.35,.04);platSide.box(s[0],(top/2-.08-.1)/2,s[2],c.tx,c.tz,STATION_HALF,.33,(top/2-.08+.1)/2);}
  // The station house behind the platform (South: on it, back to the boardwalk): 8 m along the line, cream walls, dark timber.
  const hd=south?3.8:4.6,hv0=south?v1-hd:v1,hv1=hv0+hd,hm=(hv0+hv1)/2,H=2.9,y0=top;
  const hc=P(0,hm,0);deck.box(hc[0],y0+.05,hc[2],c.tx,c.tz,4.3,hd/2+.3,.05);
  // Walls: back and two ends solid; the platform side open in the middle (ticket window and doorway) with posts and a lintel.
  const wall=(u0:number,u1:number,v:number,y1:number,y2:number,thick=.09)=>{const m=P((u0+u1)/2,v,0);plaster.box(m[0],(y1+y2)/2,m[2],c.tx,c.tz,(u1-u0)/2,thick,(y2-y1)/2);};
  wall(-4,4,hv1-.09,y0+.1,y0+H);
  {const e=(u:number)=>{const a=P(u,hm,0);plaster.box(a[0],y0+.1+(H-.1)/2,a[2],c.tx,c.tz,.09,hd/2-.1,(H-.1)/2);};e(-3.91);e(3.91);}
  wall(-4,-2.4,hv0+.09,y0+.1,y0+H);wall(2.4,4,hv0+.09,y0+.1,y0+H);wall(-2.4,2.4,hv0+.09,y0+2.25,y0+H);
  // Ticket-window panes on the front and both ends: warm at night (machineNightGlow).
  // Nov 23 2026 (owner: the house ends flickered): the panes stand 3 cm proud of the wall faces (their outer faces were coplanar with the plaster).
  for(const u of [-3.2,3.2]){const a=P(u,hv0,0);pane.box(a[0],y0+1.55,a[2],c.tx,c.tz,.5,.03,.42);}
  for(const u of [-4,4]){const a=P(u,hm,0);pane.box(a[0],y0+1.55,a[2],c.tx,c.tz,.03,.8,.42);}
  {const a=P(0,hv0+.6,0);pane.box(a[0],y0+1.3,a[2],c.tx,c.tz,1.6,.03,.75);}
  // Dark timber: corner and door posts, a sill band and the eave beam.
  for(const [u,v] of [[-4,hv0],[4,hv0],[-4,hv1],[4,hv1],[-2.4,hv0],[2.4,hv0]]){const a=P(u,v,0);timber.box(a[0],y0+H/2+.05,a[2],c.tx,c.tz,.11,.11,H/2+.05);}
  {const a=P(0,hv0,0);timber.box(a[0],y0+2.3,a[2],c.tx,c.tz,2.4,.12,.07);timber.box(a[0],y0+.45,a[2],c.tx,c.tz,4,.1,.05);const b=P(0,hm,0);timber.box(b[0],y0+H+.07,b[2],c.tx,c.tz,4.15,hd/2+.12,.07);}
  // Tiled hip roof (kawara grey-blue), its eaves well out over the platform, a dark ridge and two ridge ends.
  {const ew=4.8,ed=hd/2+1.25,rh=1.9,ry=y0+H+.14,ridgeL=ew-ed*.75,R=(u:number,v:number,y:number)=>P(u,hm+v,y),inside=R(0,0,ry);
   const e1=R(-ew,-ed,ry),e2=R(ew,-ed,ry),e3=R(ew,ed,ry),e4=R(-ew,ed,ry),r1=R(-ridgeL,0,ry+rh),r2=R(ridgeL,0,ry+rh);
   roof.quad(e1,e2,r2,r1,inside);roof.quad(e3,e4,r1,r2,inside);roof.tri(e2,e3,r2,inside);roof.tri(e4,e1,r1,inside);/* facing out on every station, mirrored or not */roof.quad(e1,e4,e3,e2,R(0,0,ry+1));
   ridge.beam(R(-ridgeL-.1,0,ry+rh+.05),R(ridgeL+.1,0,ry+rh+.05),.12,true);
   if(!lite)for(const s of [-1,1])for(const t of [-1,1])ridge.beam(R(s*ridgeL,0,ry+rh+.03),R(s*ew,t*ed,ry+.05),.06,true);
   // Tile courses: three thin darker bands across each long slope.
   if(!lite)for(const k of [.3,.55,.8])for(const t of [-1,1]){const y=ry+rh*k,v=t*ed*(1-k),u=ew-(ew-ridgeL)*k;ridge.beam(R(-u,v,y+.02),R(u,v,y+.02),.025,true);}
   // Four paper lanterns under the front eave.
   if(!lite)for(const u of [-3.3,-1.1,1.1,3.3]){const a=R(u,-ed+.55,0);if(groundingOn())paperLantern(lantern,cap,a[0],ry-.75,a[2]);else{lantern.box(a[0],ry-.75,a[2],c.tx,c.tz,.21,.21,.24);cap.box(a[0],ry-.48,a[2],c.tx,c.tz,.14,.14,.03);cap.box(a[0],ry-1.02,a[2],c.tx,c.tz,.14,.14,.03);}cap.beam([a[0],ry-.45,a[2]],[a[0],ry,a[2]],.012);}}
  // A bench on the platform, by the house's down-line end.
  // Phase 4 (Nov 23 2026): the island bench's own sizes (lib/graphics/npcSeatPose.ts BENCH: seat top .64, half depth .325, back face
  // .205 behind the centre, back .685…1.135), so a station islander sits on it exactly like on every other island bench.
  {/* every tier (a station islander sits here; 3 boxes in the existing bench batch) */const sb=softOn(),a=P(-9,v0+2.2,0);if(sb)bench.sbox(a[0],top+.6,a[2],c.tx,c.tz,1,.325,.04,.035);else bench.box(a[0],top+.6,a[2],c.tx,c.tz,1,.325,.04);const b=P(-9,v0+2.2+.25,0);if(sb)bench.sbox(b[0],top+.91,b[2],c.tx,c.tz,1,.045,.225,.035);else bench.box(b[0],top+.91,b[2],c.tx,c.tz,1,.045,.225);/* soft sweep 2: rounded seat + back */
   for(const u of [-9.8,-8.2]){const l=P(u,v0+2.2,0);timber.box(l[0],top+.28,l[2],c.tx,c.tz,.04,.26,.28);}}
  // The Island stamp book's stamp stand (trainLayout.ts STAMP_STAND_U): desk, shelf and apron, two posts carrying a roofed sign
  // (its face is in the shared sign mesh above), an ink pad and the rubber stamp on a short chain. ~30 boxes in existing batches.
  {const SU=STAMP_STAND_U,SV=stationHouseFront(st)-STAMP_STAND_BACK,B=(g:Geo,u:number,v:number,y:number,hl:number,hw:number,hh:number)=>{const a=P(u,v,0);g.box(a[0],top+y,a[2],c.tx,c.tz,hl,hw,hh);};
   for(const du of [-.44,.44])for(const dv of [-.2,.2])B(timber,SU+du,SV+dv,.42,.035,.035,.42);
   B(deck,SU,SV,.865,.52,.27,.025);B(deck,SU,SV,.24,.46,.2,.015);B(timber,SU,SV-.255,.78,.5,.015,.06);
   for(const du of [-.29,.29])B(timber,SU+du,SV+.22,.97,.035,.035,.97);
   B(timber,SU,SV+.24,1.52,.27,.02,.33);B(timber,SU,SV+.24,1.17,.31,.04,.025);
   {const ry=top+2.05,ey=top+1.86,R=(u:number,v:number,y:number)=>P(SU+u,SV+.24+v,y),inside=R(0,0,ry-.3);
    roof.quad(R(-.4,-.26,ey),R(.4,-.26,ey),R(.4,0,ry),R(-.4,0,ry),inside);roof.quad(R(-.4,.26,ey),R(.4,.26,ey),R(.4,0,ry),R(-.4,0,ry),inside);
    ridge.beam(R(-.43,0,ry+.02),R(.43,0,ry+.02),.035,true);}
   // the pad (a dark tin, its felt in the stamp's ink) and the stamp (ink rubber, dark block, a timber handle with a red knob)
   const inkHex=stampById(st.id)?.ink??C.lantern;
   B(cap,SU+.2,SV-.02,.9,.1,.07,.012);B(ink,SU+.2,SV-.02,.914,.082,.055,.004);
   B(ink,SU-.14,SV-.05,.897,.055,.055,.007);B(cap,SU-.14,SV-.05,.93,.06,.06,.026);B(timber,SU-.14,SV-.05,1,.022,.022,.05);B(lantern,SU-.14,SV-.05,1.07,.038,.038,.03);
   {const a=P(SU-.14,SV-.05,top+.98),m=P(SU-.24,SV+.1,top+.9),b=P(SU-.29,SV+.18,top+1.05);cap.beam(a,m,.007,true);cap.beam(m,b,.007,true);}
   emit(ink,inkHex,ox,oz);
   // the sign's two faces (front toward the line, back toward the house: North and West Beach are seen from behind)
   const atU=(TRAIN_STATIONS.indexOf(st)*SIGN_CELL)/1024,u1=atU+SIGN_CELL/1024,v0=1-1024/1024,v1=1-(LINE_ROW0)/1024;
   for(const face of [1,-1]){const nx=-nrm.x*sg*face,nz=-nrm.z*sg*face,rx=nz,rz=-nx,ctr=P(SU,SV+.24-face*.025,0),w=.21,hh=.28,cy=top+1.52;
    const q=[[-w,-hh,atU+.5,v0],[w,-hh,u1+.5,v0],[w,hh,u1+.5,v1],[-w,hh,atU+.5,v1]],idx=[0,1,2,0,2,3];
    for(const k of idx){const [a,b,uu,vv]=q[k];signPos.push(ctr[0]+rx*a,cy+b,ctr[2]+rz*a);signNor.push(nx,0,nz);signUv.push(uu,vv);}}
   const sq0=Math.min(Math.abs(c.tx),Math.abs(c.tz))<.2,ax=Math.abs(c.tx),az=Math.abs(c.tz),sc=P(SU,SV+.03,0);
   solid(sq0?{x:sc[0],z:sc[2],w:1.08*ax+.62*az,d:1.08*az+.62*ax}:{x:sc[0],z:sc[2],w:.95,d:.95});}
  emit(plat,C.platform,ox,oz);emit(footing,C.footing,ox,oz);emit(platSide,C.platformSide,ox,oz);emit(edge,C.edge,ox,oz);emit(plaster,C.plaster,ox,oz);emit(timber,C.timber,ox,oz);emit(deck,C.deck,ox,oz);
  emit(roof,C.roof,ox,oz);emit(ridge,C.ridge,ox,oz);emit(cap,C.cap,ox,oz);emit(bench,lite?C.timber:C.bench,ox,oz);/* lite: in the timber batch (no new paint on the lowest tier) */
  {const m=emit(pane,C.pane,ox,oz);if(m)lit(m,.9,true);}{const m=emit(lantern,C.lantern,ox,oz);if(m)lit(m,1);}
  // Colliders: the house (axis-aligned stations one box; the diagonal Summit one a ring of 1.2 m tiles round its walls).
  // Within ~12° of the axes the house's own bounding box (a few cm larger than the house).
  const sq=Math.min(Math.abs(c.tx),Math.abs(c.tz))<.2;
  if(sq){const ax=Math.abs(c.tx),az=Math.abs(c.tz);solid({x:hc[0],z:hc[2],w:8.2*ax+(hd+.2)*az,d:8.2*az+(hd+.2)*ax});}
  else{for(let u=-4;u<=4.01;u+=1.2)for(const v of [hv0,hv1]){const a=P(u,v,0);solid({x:a[0],z:a[2],w:1.2,d:1.2});}
   for(let v=hv0;v<=hv1+.01;v+=1.2)for(const u of [-4,4]){const a=P(u,v,0);solid({x:a[0],z:a[2],w:1.2,d:1.2});}}
  // The boards: station name board (two faces, the far side's arrows mirrored) on two posts at the up-line end, and the line board
  // (two faces) on two posts at its ends.
  const board=(u:number,v:number,y:number,w:number,h:number,face:number,uv:[number,number,number,number])=>{
   const g=new T.PlaneGeometry(w,h),a=g.getAttribute('uv') as T.BufferAttribute;for(let k=0;k<a.count;k++)a.setXY(k,uv[0]+a.getX(k)*(uv[2]-uv[0]),1-uv[3]+a.getY(k)*(uv[3]-uv[1]));
   const m=new T.Mesh(g,boardMat),p=P(u,v,y),fx=-nrm.x*sg*face,fz=-nrm.z*sg*face;m.position.set(p[0],p[1],p[2]);m.rotation.y=Math.atan2(fx,fz);m.userData.train=true;m.userData.skipRoofObstacle=true;town.add(m);};
  const row=TRAIN_STATIONS.indexOf(st),rv=(r:number)=>[r*ATLAS_ROW/1024,(r+1)*ATLAS_ROW/1024] as const,[r0,r1]=rv(row);
  board(9.5,v0+2.1,top+1.95,2.9,1,1,[0,r0,.5,r1]);board(9.5,v0+2.14,top+1.95,2.9,1,-1,[.5,r0,1,r1]);
  // Signs audit (Nov 25 2026, owner shots 78/79: the line board's one post ran up through "ISLAND LINE", the name board's posts
  // crossed its words and arrows): both boards stand on two posts just past their END edges (1 cm clear), between the faces'
  // planes, so no post crosses either face (scripts/sign-posts-scan.cjs).
  {const posts=new Geo();for(const u of [9.5-1.52,9.5+1.52]){const a=P(u,v0+2.12,0);posts.box(a[0],top+1.2,a[2],c.tx,c.tz,.06,.06,1.2);}
   for(const u of [-12.5-1.01,-12.5+1.01]){const a=P(u,v0+2.12,0);posts.box(a[0],top+.9,a[2],c.tx,c.tz,.05,.05,.9);}
   // Nov 27 2026 (owner 164: a bike landed inside the line board, stuck between its posts): each board is ONE solid footprint from post to
   // post (its bottom edge, ~1.45 m, is too low to pass under), 0.4 m deep, in 0.5 m cells (no hollow to land or get trapped in).
   for(const [u0,u1] of [[9.5-1.52,9.5+1.52],[-12.5-1.01,-12.5+1.01]]){const nCell=Math.ceil((u1-u0)/.5);for(let k=0;k<=nCell;k++){const a=P(u0+(u1-u0)*k/nCell,v0+2.12,0);solid({x:a[0],z:a[2],w:.45,d:.45});STATION_SIGN_FEET.push(a[0],a[2]);}}
   emit(posts,C.timber,ox,oz);}
  board(-12.5,v0+2.08,top+1.75,1.9,.54,1,[0,LINE_ROW0/1024,.5,1]);board(-12.5,v0+2.16,top+1.75,1.9,.54,-1,[0,LINE_ROW0/1024,.5,1]);
 }

 // ------------------------------------------------------------------ Summit tunnel: portals (paint) and the tube (own mesh)
 const portalArch=()=>{const s=new T.Shape(),r=TUNNEL_HALF_WIDTH,spring=2.4;s.moveTo(-r,-.3);s.lineTo(-r,spring);s.absarc(0,spring,r,Math.PI,0,true);s.lineTo(r,-.3);s.lineTo(-r,-.3);return s;};
 // Nov 23 2026 (owner: the portals were upright 21 m slabs poking out of the hill, with a stray block on top): each portal is now a
 // battered stone headwall PORTAL_HALF m either side, leaning back into the slope (PORTAL_LEAN per metre up), its top edge laid
 // along the carved ground at its face (never above the hill), an arch ring round the mouth, and two wing walls running out along
 // the cutting's banks with their tops on the bank. No coping slab, no hood box. Same two paints as before (stone, stoneDark).
 for(const p of [TUNNEL.west,TUNNEL.east]){const west=p===TUNNEL.west,t=trackAt(p.s),o={x:west?-t.tx:t.tx,z:west?-t.tz:t.tz},a={x:o.z,z:-o.x};
  const R=TUNNEL_HALF_WIDTH,ringR=R+.85,depth=1.5,lean=PORTAL_LEAN,half=PORTAL_HALF;
  const groundAt=(v:number,u:number)=>summitGround(p.x+a.x*v+o.x*u,p.z+a.z*v+o.z*u)-TUNNEL_BED;
  // Nov 24 2026 (owner: a wing slab stood proud of the hillside by the west portal, fins at the headwall ends): the drawn hill is a
  // 2.5 m mesh, so in a crease it lies under the true ground at one point. The headwall top and the wing tops take the LOWEST ground
  // round the spot (± 0.8 m across, out to 2.5 m in front): a little buried in the hill, never standing out of it.
  const lowAt=(v:number,u:number)=>{let m=Infinity;for(const dv of [-.8,0,.8])for(const du of [-.6,0,.8,1.8])m=Math.min(m,groundAt(v+dv,u+du));return m;};
  const archTop=(v:number)=>Math.abs(v)<ringR?2.4+Math.sqrt(ringR*ringR-v*v):0;
  const shape=new T.Shape();shape.moveTo(-half,-.6);shape.lineTo(half,-.6);
  for(let v=half;v>=-half-1e-6;v-=.7){const top=Math.max(archTop(v)+.25,lowAt(v,depth*.5)+.25,Math.abs(v)<ringR+.6?1.1:-.35);/* past the ring the ends follow the ground down (no block where the bank falls away) */shape.lineTo(v,Math.min(top,2.4+ringR+.6));}
  shape.lineTo(-half,-.6);shape.holes.push(portalArch());
  const basis=new T.Matrix4().makeBasis(new T.Vector3(a.x,0,a.z),new T.Vector3(0,1,0),new T.Vector3(o.x,0,o.z));
  const wallG=new T.ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:10});
  {const q=wallG.getAttribute('position') as T.BufferAttribute;for(let k=0;k<q.count;k++)q.setZ(k,q.getZ(k)-Math.max(0,q.getY(k))*lean);q.needsUpdate=true;wallG.computeVertexNormals();}
  wallG.applyMatrix4(basis);
  skip(put(wallG,C.stone,p.x,TUNNEL_BED,p.z));// its top lies on the hill now, so no roof floor (a diagonal wall's bounding-box roof blocked rides)
  // Arch ring (voussoirs) on the leaning face, and the wing walls along the banks.
  const g=new Geo(),gd=new Geo(),B=TUNNEL_BED,P=(v:number,u:number,y:number)=>[p.x+a.x*v+o.x*u,B+y,p.z+a.z*v+o.z*u];
  for(let k=0;k<=10;k++){const ang=Math.PI*k/10,x0=Math.cos(ang)*(R+.25),y0=2.4+Math.sin(ang)*(R+.25),u=depth-y0*lean+.02;gd.box(p.x+a.x*x0+o.x*u,B+y0,p.z+a.z*x0+o.z*u,a.x,a.z,.32,.04,.32);}
  // Nov 27 2026 (owner 155: "a dark brown wedge / flap poking out of the hillside left of the portal"): the wing walls are gone. Their
  // top took the bank's lowest ground, so on the drawn (coarser) hill they lay as a dark blade along the cutting from the play camera's
  // angle (picked: the stoneDark wing, 5 m out of the west mouth). The 13 m headwall alone meets the carved banks.
  if(WING_LENGTH>0)for(const sg of [-1,1]){const v0=sg*(R+.6),v1=sg*(R+1.4),inside=P(sg*(R+1),3,-2);let prev:number[][]|null=null;
   for(let u=depth-.1;u<=depth+WING_LENGTH+1e-6;u+=.75){const top=Math.max(.3,Math.min(lowAt(v1+sg*.3,u)-.05,1.5));/* low, on the bank behind it (no fins) */const cur=[P(v0,u,-.4),P(v0,u,top),P(v1,u,top),P(v1,u,-.4)];
    if(prev){g.quad(prev[0],cur[0],cur[1],prev[1],inside);g.quad(prev[1],cur[1],cur[2],prev[2],inside);g.quad(prev[2],cur[2],cur[3],prev[3],inside);}prev=cur;}
   if(prev)g.quad(prev[0],prev[1],prev[2],prev[3],P(sg*(R+1),0,-2));}
  const ox=Math.round(p.x),oz=Math.round(p.z);emit(g,C.stoneDark,ox,oz);emit(gd,C.stoneDark,ox,oz);
  if(!tunnelOn()){const mouth=new T.ShapeGeometry(portalArch(),10);mouth.applyMatrix4(basis);skip(put(mouth,C.mouth,p.x+o.x*.12,TUNNEL_BED,p.z+o.z*.12));}/* Nov 26 2026: with the lit tunnel the mouth is open (no black cap): the tube shows through it */// POLISH 4 (owner shot 70): 0.12 m out from the headwall's back, inside its arched hole, so it is in front of the drawn hill's cliff at the plane (the summit grid snaps it to ±0.03 m; on the curved west portal a cliff triangle at +0.03 stood in front of the old cap at +0.05 in and showed as a green band inside the arch)
  // POLISH 4: a dark floor through the headwall's arched hole (the summit terrain is cut out of the opening: summitIsleWorld)
  {const fl=new Geo(),R2=TUNNEL_HALF_WIDTH;fl.quad(P(-R2,-.15,-.02),P(R2,-.15,-.02),P(R2,depth+.4,-.02),P(-R2,depth+.4,-.02),P(0,1,-2));emit(fl,tunnelOn()?'#4f4840':C.mouth,ox,oz);}/* Nov 27 2026 (owner 155: a pale grey slab at the mouth): the sunlit paint read pale; now the bore floor's dark ballast */
  solid(...portalColliders(p.x,p.z,o,a,half));
 }
 const W=TUNNEL.west,E=TUNNEL.east,cam=new T.Vector3(),tW=trackAt(W.s),tE=trackAt(E.s);
 const litTube=tunnelOn(),tubeRoot=new T.Group();tubeRoot.name='train-tunnel';const tube=litTube?buildLitTube():buildTube();tubeRoot.add(tube);const plug=litTube?buildPlug():null;if(plug)tubeRoot.add(plug);const tubeIn=(tube.material as T.Material).userData.tubeIn as {value:number}|undefined;
 const cat=catArm.empty&&catWire.empty?null:buildCatenary();if(cat)tubeRoot.add(cat);// starts visible so the load-time compileAsync (islandWarm.ts) builds its program; update() hides it on the first frame
 return {
  /** Added to the scene after the batching pass (its own mesh, never merged). */
  tubeRoot,
  movedProps:()=>moved,addMoved:(k:number)=>{moved+=k;},
  /** POLISH 4 (owner shot 70, a dark wedge beside the west arch): the tube shows only while the camera is INSIDE it, past both mouth
   *  planes and under its crown. From outside, each portal's opaque arch-shaped mouth already fills the opening, so the tube added
   *  nothing there but its crown showing dark through the hill's 2.5 m grid right behind the headwall. A few multiplies a frame. */
  update(camera:T.Camera){camera.getWorldPosition(cam);let inside=false;
   if(Math.hypot(cam.x-W.x,cam.z-W.z)<TUBE_SHOW||Math.hypot(cam.x-E.x,cam.z-E.z)<TUBE_SHOW||insideTunnel(cam.x,cam.z)){
    const inW=(cam.x-W.x)*tW.tx+(cam.z-W.z)*tW.tz,inE=-((cam.x-E.x)*tE.tx+(cam.z-E.z)*tE.tz);
    inside=inW>-.3&&inE>-.3&&insideTunnel(cam.x,cam.z)&&cam.y<TUNNEL_BED+2.4+TUNNEL_HALF_WIDTH+1.5;}
   // Nov 26 2026 (lit tunnel, owner: "make the tunnel see through to the other side"): the lit tube shows from outside too, within
   // TUBE_SHOW m of a portal; its shader keeps only what is seen THROUGH a mouth from outside (buildLitTube), so the crown never
   // shows through the hill's grid (the POLISH 4 wedge).
   const show=litTube?inside||Math.hypot(cam.x-W.x,cam.z-W.z)<TUBE_SHOW||Math.hypot(cam.x-E.x,cam.z-E.z)<TUBE_SHOW:inside;
   if(tubeIn){tubeIn.value=inside?1:0;// night: the baked interior dims (it is unlit), so the bore glows warm instead of glaring beige
    const nk=Math.min(1,Math.max(0,((1-WATER_UNIFORMS.uWaterNight.value.y)/.45-.35)/.65));(tube.material as T.MeshBasicMaterial).color.setScalar(1-.45*nk);}
   if(show!==tube.visible)tube.visible=show;if(plug&&plug.visible===show)plug.visible=!show;},
  dispose(){if(plug){plug.geometry.dispose();(plug.material as T.Material).dispose();}tube.geometry.dispose();(tube.material as T.Material).dispose();if(cat){cat.geometry.dispose();(cat.material as T.Material).dispose();}tubeRoot.removeFromParent();},
 };
 /** The catenary mesh (wire + thin arms) in vertex colours, with the near-camera fade (see the catenary section above). */
 function buildCatenary(){
  const pos:number[]=[],nor:number[]=[],col:number[]=[],wire:number[]=[],tmp=new T.Color(),up=skyOn();
  for(const [g,c] of [[catWire,C.wire],[catArm,C.pole]] as const){tmp.set(c);pos.push(...g.p);nor.push(...g.n);for(let k=0;k<g.p.length;k+=3){col.push(tmp.r,tmp.g,tmp.b);wire.push(g===catWire?1:0);}}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('normal',new T.Float32BufferAttribute(nor,3));geo.setAttribute('color',new T.Float32BufferAttribute(col,3));
  if(up)geo.setAttribute('catWire',new T.Float32BufferAttribute(wire,1));geo.computeBoundingSphere();
  const mat=new T.MeshStandardMaterial({vertexColors:true,roughness:.85});
  // Nov 26 2026 (owner shots 129 / 132 / 133: "a black line shoots up into the sky"): it was the contact wire itself, seen from the
  // cab right under it: a wire 2 m over the camera runs from the vanishing point straight up off the top of the screen. The wire
  // (not the arms) now also fades out where it is seen steeply ABOVE the camera (elevation over ~6 deg, gone by ~11 deg), so from a
  // ride view it leads into the distance and stops a few degrees over the track; from above (the play camera) nothing changes.
  mat.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vCatW;'+(up?'attribute float catWire;varying float vCatWire;':'')).replace('#include <project_vertex>','#include <project_vertex>\nvCatW=(modelMatrix*vec4(transformed,1.0)).xyz;'+(up?'vCatWire=catWire;':''));
   sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vCatW;'+(up?'varying float vCatWire;':'')).replace('#include <clipping_planes_fragment>',
    `#include <clipping_planes_fragment>\n{float cd=distance(vCatW,cameraPosition),ck=clamp((cd-${CAT_FADE_NEAR.toFixed(2)})/${(CAT_FADE_FAR-CAT_FADE_NEAR).toFixed(2)},0.,1.);${up?'if(vCatWire>.5)ck*=smoothstep(.19,.1,(vCatW.y-cameraPosition.y)/max(cd,.01));':''}if(ck<1.&&fract(sin(dot(floor(gl_FragCoord.xy),vec2(12.9898,78.233)))*43758.5453)>=ck)discard;}`);};
  mat.customProgramCacheKey=()=>'train-catenary-fade'+(up?'-sky':'');
  const m=new T.Mesh(geo,mat);m.name='train-catenary';m.matrixAutoUpdate=false;m.castShadow=false;m.receiveShadow=false;m.userData.train=true;m.userData.ownDraw=true;return m;}
 /** Nov 27 2026 (owner 159: "from far away the tunnel is white"): past TUBE_SHOW the bore is not drawn and the open arch showed the
  *  sky through the hill's cut. A dark plug instead (one arch-shaped fan per portal, 2.6 m in, warm-dark centre to the lining's shade
  *  at the rim, ~40 tris, one draw only while the tube is NOT drawn: they swap at TUBE_SHOW, so the far view costs no more). */
 function buildPlug(){const pos:number[]=[],col:number[]=[],c0=new T.Color('#241d17'),c1=new T.Color('#5d4b37'),R=TUNNEL_HALF_WIDTH-.02,SP=2.4;
  const rim:[number,number][]=[[-R,-.1],[-R,SP]];for(let k=1;k<12;k++){const a=Math.PI-Math.PI*k/12;rim.push([Math.cos(a)*R,SP+Math.sin(a)*R]);}rim.push([R,SP],[R,-.1]);
  for(const p of [W,E]){const t=trackAt(p.s),w=p===W?1:-1,ix=t.tx*w,iz=t.tz*w,ax=t.tz,az=-t.tx,u=2.6,P=(v:number,y:number)=>[p.x+ax*v+ix*u,TUNNEL_BED+y,p.z+az*v+iz*u];
   const c=P(0,1.7);for(let k=0;k<rim.length;k++){const a=rim[k],b=rim[(k+1)%rim.length];pos.push(...c,...P(a[0],a[1]),...P(b[0],b[1]));col.push(c0.r,c0.g,c0.b,c1.r,c1.g,c1.b,c1.r,c1.g,c1.b);}}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('color',new T.Float32BufferAttribute(col,3));g.computeBoundingSphere();
  const m=new T.Mesh(g,new T.MeshBasicMaterial({vertexColors:true,side:T.DoubleSide}));m.name='train-tunnel-plug';m.matrixAutoUpdate=false;m.userData.ownDraw=true;m.visible=false;return m;}
 function insideTunnel(x:number,z:number){const t=trackAt(W.s),dx=E.x-W.x,dz=E.z-W.z,l2=dx*dx+dz*dz,f=((x-W.x)*dx+(z-W.z)*dz)/l2;void t;if(f<0||f>1)return false;return Math.abs((x-W.x)*dz-(z-W.z)*dx)/Math.sqrt(l2)<TUNNEL_HALF_WIDTH+2;}
 function buildTube(){
  const pos:number[]=[],col:number[]=[],idx:number[]=[],prof:[number,number][]=[[-TUNNEL_HALF_WIDTH,0],[-TUNNEL_HALF_WIDTH,2.4]];for(let k=1;k<10;k++){const a=Math.PI-Math.PI*k/10;prof.push([Math.cos(a)*TUNNEL_HALF_WIDTH,2.4+Math.sin(a)*TUNNEL_HALF_WIDTH]);}prof.push([TUNNEL_HALF_WIDTH,2.4],[TUNNEL_HALF_WIDTH,0]);
  const len=E.s-W.s,step=3,rings=Math.ceil(len/step)+1,wallC=new T.Color('#4a4642'),lampC=new T.Color('#ffd99a'),tmp=new T.Color();
  for(let r=0;r<rings;r++){const s=W.s-.3+Math.min(len+.6,r*step),q=trackAt(s),lamp=Math.exp(-((((s-W.s)%15)-7.5)**2)/5);
   for(const [v,y] of prof){pos.push(q.x+q.tz*v,TUNNEL_BED+y,q.z-q.tx*v);const up=y/(2.4+TUNNEL_HALF_WIDTH);tmp.copy(wallC).multiplyScalar(.35+.4*up).lerp(lampC,.75*lamp*Math.max(0,1-Math.abs(up-.55)*2.2));col.push(tmp.r,tmp.g,tmp.b);}}
  const per=prof.length;for(let r=0;r<rings-1;r++)for(let k=0;k<per-1;k++){const a=r*per+k,b=a+1,c=a+per,d=c+1;idx.push(a,b,c,b,d,c);}// wound to face the axis: single-sided, the tube's outside never draws (Nov 23 2026: it showed through the hill)
  // The track inside: ballast floor, sleepers and rails in dim baked colours.
  const add=(g:Geo,color:string,shade:number)=>{const base=pos.length/3;tmp.set(color).multiplyScalar(shade);for(let k=0;k<g.p.length;k+=3){pos.push(g.p[k],g.p[k+1],g.p[k+2]);col.push(tmp.r,tmp.g,tmp.b);}for(let k=0;k<g.p.length/3;k++)idx.push(base+k);};
  const floor=new Geo(),sl=new Geo(),rl=new Geo();
  for(let s=W.s-.3;s<E.s+.3;s+=TRACK_DS){const a=trackAt(s),b=trackAt(s+TRACK_DS),A=(q:typeof a,v:number,y:number)=>[q.x+q.tz*v,y,q.z-q.tx*v];
   floor.quad(A(a,-TUNNEL_HALF_WIDTH,TUNNEL_BED+.02),A(b,-TUNNEL_HALF_WIDTH,TUNNEL_BED+.02),A(b,TUNNEL_HALF_WIDTH,TUNNEL_BED+.02),A(a,TUNNEL_HALF_WIDTH,TUNNEL_BED+.02),A(a,0,TUNNEL_BED-1));
   for(const f of [.25,.75])sl.box(a.x+(b.x-a.x)*f,TUNNEL_BED+SLEEPER_TOP-.05,a.z+(b.z-a.z)*f,a.tx,a.tz,.13,1.15,.05);
   for(const v of [-RAIL_HALF_GAUGE,RAIL_HALF_GAUGE])rl.quad(A(a,v-.055,TUNNEL_BED+RAIL_TOP),A(b,v-.055,TUNNEL_BED+RAIL_TOP),A(b,v+.055,TUNNEL_BED+RAIL_TOP),A(a,v+.055,TUNNEL_BED+RAIL_TOP),A(a,v,0));}
  add(floor,C.ballast,.3);add(sl,C.sleeper,.35);add(rl,C.railTop,.55);
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('color',new T.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeBoundingSphere();
  const m=new T.Mesh(g,new T.MeshBasicMaterial({vertexColors:true}));m.name='train-tunnel-tube';m.matrixAutoUpdate=false;m.userData.ownDraw=true;return m;
 }
 /** The lit, see-through tunnel (Nov 26 2026, owner shots 132 / 133: "make the tunnel see through to the other side and if not,
  *  make it light and not dark"; "fix the ground inside the tunnel and give more details"). ONE mesh, ONE draw, unlit vertex colours
  *  (no lights, no textures, no passes), ~5k triangles, built once:
  *  - a lined bore: stone courses on the walls, the arch in voussoir bands, a dark ring joint every 3 m, a clean springing line;
  *    even light that falls a little toward the crown and toward the middle of the bore, daylight-warm over the last ~8 m at each end;
  *  - the track bed: a ballast shoulder under the sleepers, a dark drain gutter each side, a kerbed walkway up to the wall;
  *  - wall lamps every 12 m (alternate sides) with a soft glow patch, a cable conduit on brackets, distance plates every 25 m.
  *  From outside the shader keeps only fragments seen THROUGH a portal's arch (two plane tests, ~30 ALU, tunnel pixels only), so the
  *  bore shows through the open mouth and never through the hill; inside (uTubeIn, set per frame by update) everything draws. */
 function buildLitTube(){
  const HW=TUNNEL_HALF_WIDTH,B=TUNNEL_BED,SPR=2.4,len=E.s-W.s,pos:number[]=[],col:number[]=[],tmp=new T.Color(),c2=new T.Color();
  const A=(s:number,v:number,y:number)=>{const q=trackAt(s);return [q.x+q.tz*v,B+y,q.z-q.tx*v];};
  const put3=(p:number[],c:T.Color)=>{pos.push(p[0],p[1],p[2]);col.push(c.r,c.g,c.b);};
  const quad=(a:number[],b:number[],c:number[],d:number[],ca:T.Color,cb=ca,cc=ca,cd=ca)=>{put3(a,ca);put3(b,cb);put3(c,cc);put3(a,ca);put3(c,cc);put3(d,cd);};
  const hash=(a:number,b:number)=>{const h=Math.sin(a*12.9898+b*78.233)*43758.5453;return h-Math.floor(h);};
  // Rail fixes (Nov 26 2026, owner 150: "this white doesn't look right for the tunnel"): from outside the bore read as one flat pale
  // sheet (the daylight end ran ~8 m in at 0.8-1.0 light). Now the light falls off from the mouth (DEEP: the mid-bore level, the
  // daylight end 5 m) so the bore reads as depth, the lamps' warm pools carry the middle and the far mouth is a small bright disc.
  const STONE=new T.Color('#977650'),DAY=new T.Color('#c9b089'),DEEP=.36,endK=(s:number)=>Math.max(Math.exp(-Math.max(0,s-W.s)/5),Math.exp(-Math.max(0,E.s-s)/5));
  /** The wall's colour at (s, height y): even light, a touch darker at the crown and mid-bore, daylight at the ends. */
  const wallAt=(s:number,y:number,shade:number,out:T.Color)=>{const e=endK(s);return out.copy(STONE).multiplyScalar(shade*(DEEP+(1-DEEP)*e)*(1-.25*Math.min(1,Math.max(0,(y-2.6)/3.4)))).lerp(DAY,.3*e);};
  // Profile (lateral v, height y): walkway top, three wall courses, then the arch in 10 voussoir bands.
  const prof:[number,number][]=[[-HW,.3],[-HW,1],[-HW,1.7],[-HW,SPR]];for(let k=1;k<10;k++){const a=Math.PI-Math.PI*k/10;prof.push([Math.cos(a)*HW,SPR+Math.sin(a)*HW]);}
  prof.push([HW,SPR],[HW,1.7],[HW,1],[HW,.3]);
  const RING=3,JOINT=.16,ca=new T.Color(),cb=new T.Color(),cc=new T.Color(),cd=new T.Color();
  for(let s0=W.s-.3;s0<E.s+.3;s0+=RING){const s1=Math.min(E.s+.3,s0+RING),sj=Math.max(s0,s1-JOINT),ri=Math.round(s0/RING);
   for(let k=0;k<prof.length-1;k++){const [v0,y0]=prof[k],[v1,y1]=prof[k+1],sh=(k%2?.95:1.04)*(.96+.08*hash(ri,k)),spring=k===2||k===prof.length-4?.9:1;
    quad(A(s0,v0,y0),A(sj,v0,y0),A(sj,v1,y1),A(s0,v1,y1),wallAt(s0,y0,sh*spring,ca),wallAt(sj,y0,sh*spring,cb),wallAt(sj,y1,sh,cc),wallAt(s0,y1,sh,cd));
    if(sj<s1)quad(A(sj,v0,y0),A(s1,v0,y0),A(s1,v1,y1),A(sj,v1,y1),wallAt(sj,y0,.62,ca),wallAt(s1,y0,.62,cb),wallAt(s1,y1,.62,cc),wallAt(s1,y1,.62,cd));}}
  // The track bed, in 3 m strips: ballast top and shoulders, gutters, kerbs and walkways (all lit like the wall foot).
  const BAL=new T.Color('#7d776d'),GUT=new T.Color('#4d4740'),WALK=new T.Color('#877e6e'),flat=(c:T.Color,s:number,shade:number,out:T.Color)=>{const e=endK(s);return out.copy(c).multiplyScalar(shade*(DEEP+(1-DEEP)*e)).lerp(DAY,.15*e);};
  for(let s0=W.s-.3;s0<E.s+.3;s0+=3){const s1=Math.min(E.s+.3,s0+3),j=.9+.14*hash(s0,3);
   quad(A(s0,-1.45,.12),A(s1,-1.45,.12),A(s1,1.45,.12),A(s0,1.45,.12),flat(BAL,s0,.85*j,ca),flat(BAL,s1,.85*j,cb),flat(BAL,s1,.85*j,cc),flat(BAL,s0,.85*j,cd));
   for(const sg of [-1,1]){
    quad(A(s0,sg*1.45,.12),A(s1,sg*1.45,.12),A(s1,sg*2.05,-.04),A(s0,sg*2.05,-.04),flat(BAL,s0,.7*j,ca),flat(BAL,s1,.7*j,cb),flat(BAL,s1,.62*j,cc),flat(BAL,s0,.62*j,cd));
    quad(A(s0,sg*2.05,-.04),A(s1,sg*2.05,-.04),A(s1,sg*2.45,-.06),A(s0,sg*2.45,-.06),flat(GUT,s0,1,ca),flat(GUT,s1,1,cb),flat(GUT,s1,1,cc),flat(GUT,s0,1,cd));
    quad(A(s0,sg*2.45,-.06),A(s1,sg*2.45,-.06),A(s1,sg*2.45,.3),A(s0,sg*2.45,.3),flat(WALK,s0,.72,ca),flat(WALK,s1,.72,cb),flat(WALK,s1,.8,cc),flat(WALK,s0,.8,cd));
    quad(A(s0,sg*2.45,.3),A(s1,sg*2.45,.3),A(s1,sg*HW,.3),A(s0,sg*HW,.3),flat(WALK,s0,.9,ca),flat(WALK,s1,.9,cb),flat(WALK,s1,.82,cc),flat(WALK,s0,.82,cd));}}
  // End caps: the bed's cross-section closed down to 0.3 m under the floor at both mouths (an open walkway end showed a white hole).
  {const sec:[number,number][]=[[-HW,.3],[-2.45,.3],[-2.45,-.06],[-2.05,-.04],[-1.45,.12],[1.45,.12],[2.05,-.04],[2.45,-.06],[2.45,.3],[HW,.3]],cap=new T.Color('#6f6a62').multiplyScalar(.85);
   for(const se of [W.s-.3,E.s+.3])for(let k=0;k<sec.length-1;k++)quad(A(se,sec[k][0],sec[k][1]),A(se,sec[k+1][0],sec[k+1][1]),A(se,sec[k+1][0],-.3),A(se,sec[k][0],-.3),cap);}
  // Rail fixes (Nov 26 2026, owner 153: "sky is leaking through" between the portal's ring and the lining): a stone sleeve at each
  // mouth, straight along the portal's own frame (the west portal stands on a curve, so the lining that follows the line drifted off
  // the headwall's arched hole), 3 cm inside the lining's radius, from 1 m inside the mouth plane out to the headwall's leaning
  // face. It lines the whole hole, so no gap shows at any angle; its walkways run on to the face too (the walk out is one step down).
  for(const p of [W,E]){const t=trackAt(p.s),w=p===W?1:-1,ox=-t.tx*w,oz=-t.tz*w,ax=oz,az=-ox,k=(HW-.03)/HW;
   const S=(u:number,v:number,y:number)=>[p.x+ax*v+ox*u,B+y,p.z+az*v+oz*u],uEnd=(y:number)=>1.5-Math.max(0,y)*PORTAL_LEAN-.03;// the headwall: 1.5 m deep, PORTAL_LEAN back per m up
   const sv=prof.map(([v,y])=>[v*k,y<=SPR?y:SPR+(y-SPR)*k] as [number,number]),lit=(y:number,u:number,out:T.Color)=>out.copy(STONE).multiplyScalar((.78+.1*Math.min(1,Math.max(0,u)/1.5))*(1-.15*Math.min(1,Math.max(0,(y-2.6)/3.4)))).lerp(DAY,.35);
   for(let j=0;j<sv.length-1;j++){const [v0,y0]=sv[j],[v1,y1]=sv[j+1],u0=-1;/* TUNNEL.*.s is snapped to the 2 m table: the lining can start up to 1 m in from the true mouth */quad(S(u0,v0,y0),S(uEnd(y0),v0,y0),S(uEnd(y1),v1,y1),S(u0,v1,y1),lit(y0,u0,ca),lit(y0,1.5,cb),lit(y1,1.5,cc),lit(y1,u0,cd));}
   for(const sg of [-1,1]){const u0=.28,u1=uEnd(.3);/* from the lining walkway's end (it stops 0.3 m out) */
    quad(S(u0,sg*2.45,.3),S(u1,sg*2.45,.3),S(u1,sg*HW*k,.3),S(u0,sg*HW*k,.3),flat(WALK,p.s,.9,ca),flat(WALK,p.s,.9,cb),flat(WALK,p.s,.82,cc),flat(WALK,p.s,.82,cd));
    quad(S(u0,sg*2.45,-.06),S(u1,sg*2.45,-.06),S(u1,sg*2.45,.3),S(u0,sg*2.45,.3),flat(WALK,p.s,.72,ca),flat(WALK,p.s,.72,cb),flat(WALK,p.s,.8,cc),flat(WALK,p.s,.8,cd));
    quad(S(u1,sg*2.45,.3),S(u1,sg*HW*k,.3),S(u1,sg*HW*k,-.06),S(u1,sg*2.45,-.06),flat(WALK,p.s,.7,ca));}}// the walkway's end at the face
  // Sleepers and rails on the ballast (as outside), and the small parts, in Geo soups coloured per part.
  const add=(g:Geo,color:string,shade:number,glow=false)=>{for(let k=0;k<g.p.length;k+=3){const s=nearS(g.p[k],g.p[k+2]);if(glow)tmp.set(color).multiplyScalar(shade);else flat(c2.set(color),s,shade,tmp);put3([g.p[k],g.p[k+1],g.p[k+2]],tmp);}};
  const nearS=(x:number,z:number)=>{const dx=E.x-W.x,dz=E.z-W.z,f=((x-W.x)*dx+(z-W.z)*dz)/(dx*dx+dz*dz);return W.s+f*len;};
  const sl=new Geo(),rl=new Geo(),rs=new Geo(),cable=new Geo(),lamp=new Geo(),plate=new Geo(),plateMark=new Geo(),Q=(s:number,v:number,y:number)=>A(s,v,y);
  for(let s=W.s-.3;s<E.s+.3;s+=TRACK_DS){const a=trackAt(s),b=trackAt(s+TRACK_DS);
   for(const f of [.25,.75]){const u=s+TRACK_DS*f;sl.quad(Q(u-.13,-1.15,SLEEPER_TOP),Q(u+.13,-1.15,SLEEPER_TOP),Q(u+.13,1.15,SLEEPER_TOP),Q(u-.13,1.15,SLEEPER_TOP));}// top face only (as outside: Nov 23 heat rule)
   for(const v of [-RAIL_HALF_GAUGE,RAIL_HALF_GAUGE]){rl.quad(Q(s,v-.055,RAIL_TOP),Q(s+TRACK_DS,v-.055,RAIL_TOP),Q(s+TRACK_DS,v+.055,RAIL_TOP),Q(s,v+.055,RAIL_TOP),Q(s,v,-1));
    for(const w of [-.055,.055])rs.quad(Q(s,v+w,SLEEPER_TOP),Q(s+TRACK_DS,v+w,SLEEPER_TOP),Q(s+TRACK_DS,v+w,RAIL_TOP),Q(s,v+w,RAIL_TOP));}}
  // Cable conduit on the left wall (two faces) on a bracket every 3 m.
  for(let s=W.s+1;s<E.s-1;s+=3){const e=Math.min(E.s-1,s+3),v=-(HW-.09);cable.quad(Q(s,v,1.62),Q(e,v,1.62),Q(e,v,1.54),Q(s,v,1.54),Q(s,0,1.58));cable.quad(Q(s,v,1.62),Q(e,v,1.62),Q(e,-HW+.01,1.62),Q(s,-HW+.01,1.62),Q(s,-HW,1));
   const p=Q(s+.2,-(HW-.06),1.5),q=trackAt(s+.2);cable.box(p[0],p[1],p[2],q.tx,q.tz,.04,.06,.09,false,true);}
  // Distance plates every 25 m on the right wall (white plate, a dark bar).
  for(let s=W.s+12.5;s<E.s-6;s+=25){const v=HW-.015;plate.quad(Q(s-.18,v,1.25),Q(s+.18,v,1.25),Q(s+.18,v,1.01),Q(s-.18,v,1.01),Q(s,0,1.1));plateMark.quad(Q(s-.12,v-.005,1.16),Q(s+.12,v-.005,1.16),Q(s+.12,v-.005,1.1),Q(s-.12,v-.005,1.1),Q(s,0,1.1));}
  add(sl,C.sleeper,.62);add(rl,C.railTop,.95);add(rs,C.rail,.7);add(cable,'#3e3b37',1);add(plate,'#efe9dc',1);add(plateMark,'#2f3a46',1);
  // Wall lamps (Nov 27 2026, owner 157: "the lighting is not complete": a flat white square on a faceted glow patch). Now a fixture
  // per lamp (a bracket, a dark cage hood, a warm bulb: 3 small boxes, in this one mesh: no new draw) at TUNNEL_LAMPS (tunnelWalk.ts);
  // the light itself is the shader's (below): a soft round pool on the wall, the walkway, the track and the far wall, from the same list.
  const bracket=new Geo(),hood=new Geo();
  for(const l of TUNNEL_LAMPS){const q=trackAt(l.s),sd=l.side,P2=(v:number,y:number)=>A(l.s,sd*v,y);
   {const c=P2(HW-.1,2.2);bracket.box(c[0],c[1],c[2],q.tx,q.tz,.035,.1,.03);}
   {const c=P2(HW-.2,2.13);hood.box(c[0],c[1],c[2],q.tx,q.tz,.15,.11,.04,false);}
   {const c=P2(HW-.2,2.03);lamp.box(c[0],c[1],c[2],q.tx,q.tz,.11,.075,.06,false);}}
  add(bracket,'#2e2a26',1,true);add(hood,'#3a342d',1,true);add(lamp,'#fff0c8',1,true);
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('color',new T.Float32BufferAttribute(col,3));g.computeBoundingSphere();
  const mat=new T.MeshBasicMaterial({vertexColors:true,side:T.DoubleSide}),tubeIn={value:0};mat.userData.tubeIn=tubeIn;
  const mouthGl=(p:{x:number;z:number;s:number},inward:number)=>{const t=trackAt(p.s),nx=t.tx*inward,nz=t.tz*inward;return `vec3(${(p.x-nx*.12).toFixed(3)},${B.toFixed(3)},${(p.z-nz*.12).toFixed(3)}),vec2(${nx.toFixed(5)},${nz.toFixed(5)})`;};
  // Nov 27 2026: the lamps' light, per fragment from a fixed list (TUNNEL_LAMPS: ~15 vec4; the 3 nearest by the fragment's place
  // along the bore's chord): exp(-d²/LAMP_R2), warm, over a gentle dimming between lamps (none in the last 8 m: the daylight ends
  // stay), and the coming train's headlight (TUNNEL_TRAIN_LAMP). ~3 exp + a dozen ALU per tube pixel; no lights, no passes.
  const lampU={value:TUNNEL_LAMPS.map(l=>new T.Vector4(l.x,l.y,l.z,l.side))},chordL=Math.hypot(E.x-W.x,E.z-W.z),NL=TUNNEL_LAMPS.length;
  mat.onBeforeCompile=sh=>{sh.uniforms.uTubeIn=tubeIn;sh.uniforms.uLamp=lampU;sh.uniforms.uTrainLamp=TUNNEL_TRAIN_LAMP;
   sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vTubeW;').replace('#include <project_vertex>','#include <project_vertex>\nvTubeW=(modelMatrix*vec4(transformed,1.)).xyz;');
   sh.fragmentShader=sh.fragmentShader.replace('#include <common>',`#include <common>
uniform float uTubeIn;varying vec3 vTubeW;float tubeNear=0.;uniform vec4 uLamp[${NL}];uniform vec4 uTrainLamp;
// Rail fixes (Nov 26 2026): no depth pull any more (it was 1.2 m toward the camera so a hill triangle crossing the bore by the off-centre
// west portal never covered it; the portals now stand on the line, so none does). With the pull the bore drew OVER whatever was in it
// (a walker, a train) seen from the cutting; and without gl_FragDepth the tube keeps early depth testing.
bool tubeThru(vec3 P,vec2 n){float dc=dot((cameraPosition-P).xz,n),df=dot((vTubeW-P).xz,n);if(df<.4)return true;if(dc>0.)return false;tubeNear=max(tubeNear,step(df,2.9));
 vec3 X=cameraPosition+(vTubeW-cameraPosition)*(-dc/(df-dc));float lat=abs(dot((X-P).xz,vec2(n.y,-n.x)));
// the arch and a 0.6 m band round it (the headwall hides the band where it stands: it only closes any sliver at the ring)
float R2=${HW.toFixed(2)}+.6;return lat<R2&&X.y-P.y<${SPR.toFixed(2)}+sqrt(max(R2*R2-lat*lat,0.));}`)
    .replace('#include <clipping_planes_fragment>',`#include <clipping_planes_fragment>\nfloat tubeOut=0.;if(uTubeIn<.5&&!tubeThru(${mouthGl(W,1)})&&!tubeThru(${mouthGl(E,-1)})){if(tubeNear<.5)discard;tubeOut=1.;}`)
    // Rail fixes (owner 150): the hill is cut out of the first ~2.6 m behind each portal (summitIsleWorld), so from above that hole
    // showed the sky (the vault there was discarded: not seen through the arch). The vault's first 2.9 m now draws there, in shade.
    .replace('#include <dithering_fragment>',`#include <dithering_fragment>
{vec2 D=vec2(${((E.x-W.x)/chordL).toFixed(5)},${((E.z-W.z)/chordL).toFixed(5)});float a=dot(vTubeW.xz-vec2(${W.x.toFixed(3)},${W.z.toFixed(3)}),D);
 int k=int(floor((a-${(TUNNEL_LAMPS[0].s-W.s).toFixed(2)})/${(TUNNEL_LAMPS.length>1?TUNNEL_LAMPS[1].s-TUNNEL_LAMPS[0].s:12).toFixed(2)}+.5));float L=0.;
 for(int j=-1;j<=1;j++){vec3 d=vTubeW-uLamp[clamp(k+j,0,${NL-1})].xyz;L+=exp(-dot(d,d)/${LAMP_R2.toFixed(1)});}
 float m=clamp(min(a,${chordL.toFixed(2)}-a)/8.,0.,1.);
 vec2 td=vTubeW.xz-uTrainLamp.xy;float tl=uTrainLamp.w*exp(-dot(td,td)/45.);
 gl_FragColor.rgb=gl_FragColor.rgb*(mix(1.,.74,m)+L*1.35*vec3(1.,.8,.55))+vec3(1.,.93,.74)*tl*.55;}
gl_FragColor.rgb*=1.-.45*tubeOut;`);};
  mat.customProgramCacheKey=()=>'train-tunnel-lit';
  const m=new T.Mesh(g,mat);m.name='train-tunnel-tube';m.matrixAutoUpdate=false;m.userData.ownDraw=true;return m;
 }
 function portalColliders(x:number,z:number,o:{x:number;z:number},a:{x:number;z:number},half:number){const out:Obstacle[]=[];
  // The headwall either side of the arch (the arch itself stays open; the hill behind it is too steep to walk).
  for(let v=TUNNEL_HALF_WIDTH+.6;v<=half;v+=1.2)for(const sgn of [-1,1])out.push({x:x+a.x*v*sgn+o.x*.75,z:z+a.z*v*sgn+o.z*.75,w:1.3,d:1.3});
  // The wing walls along the banks (their outer, bank side is ground level near the top; the inner face is the cutting's wall).
  if(WING_LENGTH>0)for(let u=2;u<=1.5+WING_LENGTH;u+=1.2)for(const sgn of [-1,1]){const v=(TUNNEL_HALF_WIDTH+1)*sgn;out.push({x:x+a.x*v+o.x*u,z:z+a.z*v+o.z*u,w:1.1,d:1.1});}return out;}
}

// ---- The board atlas: 1024 × 1024. Rows 0-4: one station each, its name board's two faces (x 0-512 front, 512-1024 back, the
// back's arrows swapped so they point the right way from that side). LINE_ROW0 down: the line board (same on every station).
export const ATLAS_ROW=176,LINE_ROW0=5*ATLAS_ROW+8;
/** The stamp-stand sign cells: five cells SIGN_CELL px wide from x 512, rows LINE_ROW0…1024 (the line board's free right half). */
export const SIGN_CELL=102;
function stationAtlas(){
 const cv=document.createElement('canvas');cv.width=1024;cv.height=1024;const g=cv.getContext('2d');if(!g)return cv;
 const sans='system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',LINE='#2f7d5b';
 TRAIN_STATIONS.forEach((st,r)=>{const prev=TRAIN_STATIONS[(r+4)%5],next=TRAIN_STATIONS[(r+1)%5];
  for(const face of [0,1]){const x0=face*512,y0=r*ATLAS_ROW,W=512,H=ATLAS_ROW;
   g.fillStyle='#fbfaf4';g.fillRect(x0,y0,W,H);g.fillStyle='#2b2b2b';g.fillRect(x0,y0,W,5);g.fillRect(x0,y0+H-5,W,5);
   // Number badge and name.
   g.fillStyle=LINE;g.beginPath();g.arc(x0+62,y0+56,30,0,Math.PI*2);g.fill();g.fillStyle='#fff';g.textAlign='center';g.textBaseline='middle';g.font=`800 36px ${sans}`;g.fillText(String(st.number),x0+62,y0+58);
   g.fillStyle='#1f1f1f';g.font=`800 ${st.name.length>9?50:60}px ${sans}`;g.fillText(st.name,x0+W/2+22,y0+52);
   g.fillStyle='#555';g.font=`600 21px ${sans}`;g.fillText(st.sub,x0+W/2+22,y0+94);
   // The football line: the station number read as a shirt number.
   g.fillStyle='#7a5c3e';g.font=`italic 600 17px ${sans}`;g.fillText(`${st.number} · ${st.shirt}`,x0+W/2,y0+119);
   // Line band: previous ← · → next (mirrored on the back face).
   g.fillStyle=LINE;g.fillRect(x0+5,y0+132,W-10,36);g.fillStyle='#fff';g.font=`700 20px ${sans}`;
   const left=face===0?prev:next,right=face===0?next:prev;g.textAlign='left';g.fillText(`◀ ${left.name}`,x0+16,y0+151);g.textAlign='right';g.fillText(`${right.name} ▶`,x0+W-16,y0+151);}});
 {const y0=LINE_ROW0,W=512,H=1024-LINE_ROW0;g.fillStyle='#244d49';g.fillRect(0,y0,W,H);g.fillStyle='#fff0cf';g.textAlign='center';g.textBaseline='middle';
  g.font=`800 34px ${sans}`;g.fillText('ISLAND LINE',W/2,y0+30);g.font=`600 19px ${sans}`;g.fillText('North · West Beach · South · Summit Isle · Coral Cay',W/2,y0+68);
  g.font=`700 19px ${sans}`;g.fillStyle='#f2c230';g.fillText('Trains every 2 minutes · Free ride',W/2,y0+102);}
 // Stamp-stand signs (Nov 24 2026): "STAMP" on an ink band, a little round stamp with the station number, the station's name.
 TRAIN_STATIONS.forEach((st,r)=>{const x0=512+r*SIGN_CELL,y0=LINE_ROW0,W=SIGN_CELL,H=1024-LINE_ROW0,ink=stampById(st.id)?.ink??'#2f7d5b',cx=x0+W/2;
  g.fillStyle='#fbf4e2';g.fillRect(x0,y0,W,H);g.strokeStyle='#5e4630';g.lineWidth=5;g.strokeRect(x0+2.5,y0+2.5,W-5,H-5);
  g.fillStyle=ink;g.fillRect(x0+5,y0+5,W-10,26);g.fillStyle='#fff';g.textAlign='center';g.textBaseline='middle';g.font=`800 19px ${sans}`;g.fillText('STAMP',cx,y0+19);
  g.strokeStyle=ink;g.lineWidth=4;g.beginPath();g.arc(cx,y0+70,29,0,Math.PI*2);g.stroke();g.lineWidth=1.5;g.beginPath();g.arc(cx,y0+70,23,0,Math.PI*2);g.stroke();
  g.fillStyle=ink;g.font=`800 28px ${sans}`;g.fillText(String(st.number),cx,y0+72);
  for(let k=0;k<12;k++){const a=k*Math.PI/6;g.beginPath();g.arc(cx+Math.cos(a)*26,y0+70+Math.sin(a)*26,1.2,0,Math.PI*2);g.fill();}
  g.font=`800 ${st.name.length>9?13:15}px ${sans}`;g.fillText(st.name,cx,y0+117);});
 return cv;
}
