/**
 * The Island Line car model (split out of trainRunning.ts on Nov 24 2026 so the look and the gameplay can be worked on apart).
 * Pure geometry builders in the road traffic's vehicle-material format (lib/graphics/trafficVehicles.ts: vertex colours, aPart =
 * pivot xyz + part id). No scene, no per-frame state: trainRunning.ts builds the meshes and moves them.
 */
import * as T from 'three';
import {PART,createVehicleMaterial} from '../graphics/trafficVehicles';
import type {Livery} from './trainLiveries';

/** Track geometry the cars sit on (trainWorld.ts values: rail top above the bed, ballast top). */
export const RAIL_TOP=.34,BALLAST_TOP=.12;
export const WHEEL_R=.43,BOGIE_HALF=4.5,HALF_W=1.4,BODY_Y0=1.05,SPLIT_Y=2.05,SIDE_TOP=3.1,ROOF_TOP=3.75;
/** The cutaway (standing inside, Nov 24 2026): triangles wholly at or above this height are the roof (outer skin, ceiling, cove, light
 *  strips, roof units): hidden on the ridden train while you walk the aisle and the camera looks down from above. */
export const DOORS=[-3.7,-.2,3.1],DOOR_HALF=.65,DOOR_Y0=1.12,DOOR_Y1=3.02,WIN_Y0=2.18,WIN_Y1=3.0;
/** Phase 3 (riding): the window runs between the doors (car-local z), shared by the panes, the open variant's holes and the seats. */
export const WIN_RUNS:readonly [number,number][]=[[-5.75,DOORS[0]-DOOR_HALF-.25],[DOORS[0]+DOOR_HALF+.25,DOORS[1]-DOOR_HALF-.25],[DOORS[1]+DOOR_HALF+.25,DOORS[2]-DOOR_HALF-.25]];
export const CAR_FLOOR_Y=1.15;
export const BENCH_HALF_D=.325,BENCH_X=HALF_W-.04-BENCH_HALF_D;
export const COL={glass:'#3b424b',screen:'#1b232b',interior:'#2a2b30',dark:'#45403a',under:'#5b5751',metal:'#8d9297',head:'#fff1c2',tail:'#c93a2c',dest:'#d99a2e',
 gold:'#d9b45a',white:'#f7f4ea',black:'#1d1d1d',shadow:'#34322e',door:'#c9ccd0',yellow:'#f2c230',lamp:'#b8281f',post:'#26231f'} as const;

// ---------------------------------------------------------------- a vertex-colour builder in the vehicle material's format
export type V=[number,number,number];
export class VGeo{
 p:number[]=[];n:number[]=[];c:number[]=[];a:number[]=[];private col=new T.Color();
 /** Bent normals (0…1): tilt every normal toward +y, so a surface the sun cannot reach (a car's ceiling, its inner walls) is still lit
  *  like a soft interior instead of reading as a dark void. 0: true normals. */
 bend=0;
 /** The part id given to faces built with part 0 (the interior: the night-light channel). */
 defPart=0;
 /** color: one colour, or a function of the vertex position (vertex-colour shading: ambient occlusion, sheens). */
 tri(p:V,q:V,r:V,color:string|((v:V)=>T.Color),inside:V,part=0,ctr:V=[0,0,0]){
  const ux=q[0]-p[0],uy=q[1]-p[1],uz=q[2]-p[2],vx=r[0]-p[0],vy=r[1]-p[1],vz=r[2]-p[2];let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;const l=Math.hypot(nx,ny,nz)||1;nx/=l;ny/=l;nz/=l;
  const flip=nx*(p[0]-inside[0])+ny*(p[1]-inside[1])+nz*(p[2]-inside[2])<0;if(flip){nx=-nx;ny=-ny;nz=-nz;}
  if(this.bend>0){const b=this.bend;nx*=1-b;ny=ny*(1-b)+b;nz*=1-b;const m=Math.hypot(nx,ny,nz)||1;nx/=m;ny/=m;nz/=m;}
  if(typeof color==='string')this.col.set(color);
  for(const v of flip?[p,r,q]:[p,q,r]){const c=typeof color==='string'?this.col:color(v);this.p.push(v[0],v[1],v[2]);this.n.push(nx,ny,nz);this.c.push(c.r,c.g,c.b);this.a.push(ctr[0],ctr[1],ctr[2],part||this.defPart);}}
 quad(p:V,q:V,r:V,s:V,color:string|((v:V)=>T.Color),inside:V,part=0,ctr?:V){this.tri(p,q,r,color,inside,part,ctr);this.tri(p,r,s,color,inside,part,ctr);}
 /** Axis-aligned box (centre, half sizes); the underside only when asked. */
 box(x:number,y:number,z:number,hx:number,hy:number,hz:number,color:string|((v:V)=>T.Color),part=0,ctr?:V,bottom=false){
  const P=(a:number,b:number,c:number):V=>[x+hx*a,y+hy*b,z+hz*c],C:V=[x,y,z],f=(a:V,b:V,c:V,d:V)=>this.quad(a,b,c,d,color,C,part,ctr);
  f(P(-1,1,-1),P(1,1,-1),P(1,1,1),P(-1,1,1));if(bottom)f(P(-1,-1,-1),P(1,-1,-1),P(1,-1,1),P(-1,-1,1));
  f(P(-1,-1,-1),P(1,-1,-1),P(1,1,-1),P(-1,1,-1));f(P(-1,-1,1),P(1,-1,1),P(1,1,1),P(-1,1,1));f(P(-1,-1,-1),P(-1,1,-1),P(-1,1,1),P(-1,-1,1));f(P(1,-1,-1),P(1,1,-1),P(1,1,1),P(1,-1,1));}
 /** A flat panel facing +z / −z (dir) at depth z. */
 panelZ(x:number,y:number,z:number,hw:number,hh:number,dir:number,color:string|((v:V)=>T.Color),part=0){this.quad([x-hw,y-hh,z],[x+hw,y-hh,z],[x+hw,y+hh,z],[x-hw,y+hh,z],color,[x,y,z-dir],part);}
 /** A flat panel facing +x / −x (dir) at x, spanning z0…z1 and y0…y1. */
 panelX(x:number,z0:number,z1:number,y0:number,y1:number,dir:number,color:string|((v:V)=>T.Color),part=0){this.quad([x,y0,z0],[x,y0,z1],[x,y1,z1],[x,y1,z0],color,[x-dir,(y0+y1)/2,(z0+z1)/2],part);}
 /** A disc facing +z at depth z. */
 discZ(x:number,y:number,z:number,r:number,color:string,part=0,sides=8){for(let k=0;k<sides;k++){const a=k/sides*Math.PI*2+Math.PI/2,b=(k+1)/sides*Math.PI*2+Math.PI/2;this.tri([x,y,z],[x+Math.cos(a)*r,y+Math.sin(a)*r,z],[x+Math.cos(b)*r,y+Math.sin(b)*r,z],color,[x,y,z-1],part);}}
 /** A wheel on the x axis (tread + outer cap), spinning about its own centre (PART.rearWheel, pivot in aPart). */
 wheel(x:number,az:number,color:string){const N=8,s=Math.sign(x),xo=x+s*.06,xi=x-s*.06,ctr:V=[x,WHEEL_R,az],R=(k:number,px:number):V=>{const t=(k+.5)/N*Math.PI*2;return [px,WHEEL_R+Math.cos(t)*WHEEL_R,az+Math.sin(t)*WHEEL_R];};
  for(let k=0;k<N;k++){this.quad(R(k,xi),R(k+1,xi),R(k+1,xo),R(k,xo),color,ctr,PART.rearWheel,ctr);if(k>0&&k<N-1)this.tri(R(0,xo),R(k,xo),R(k+1,xo),color,[xi,WHEEL_R,az],PART.rearWheel,ctr);}}
 beam(a:V,b:V,r:number,color:string,part=0,ctr?:V){const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],l=Math.hypot(dx,dy,dz)||1e-6,d=[dx/l,dy/l,dz/l];
  const up=Math.abs(d[1])>.9?[1,0,0]:[0,1,0],s1=[d[1]*up[2]-d[2]*up[1],d[2]*up[0]-d[0]*up[2],d[0]*up[1]-d[1]*up[0]],l1=Math.hypot(s1[0],s1[1],s1[2]);for(let i=0;i<3;i++)s1[i]/=l1;
  const s2=[d[1]*s1[2]-d[2]*s1[1],d[2]*s1[0]-d[0]*s1[2],d[0]*s1[1]-d[1]*s1[0]],c:V=[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2];
  const P=(e:V,i:number,j:number):V=>[e[0]+(s1[0]*i+s2[0]*j)*r,e[1]+(s1[1]*i+s2[1]*j)*r,e[2]+(s1[2]*i+s2[2]*j)*r];
  for(const [i,j,k,m] of [[1,1,1,-1],[1,-1,-1,-1],[-1,-1,-1,1],[-1,1,1,1]])this.quad(P(a,i,j),P(b,i,j),P(b,k,m),P(a,k,m),color,c,part,ctr);}
 build(){
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(this.p,3));g.setAttribute('normal',new T.Float32BufferAttribute(this.n,3));
  g.setAttribute('color',new T.Float32BufferAttribute(this.c,3));g.setAttribute('aPart',new T.Float32BufferAttribute(this.a,4));g.computeBoundingSphere();
  for(let i=3;i<this.a.length;i+=4)if(this.a[i]===PART.strap){g.userData.straps=true;break;}// the vehicle material's strap pendulum runs only for these
  return g;}
 get tris(){return this.p.length/9;}
}
/** 7-segment glyphs for the number plate (segments a…g), plus F and I. */
const SEG:Record<string,string>={'0':'abcdef','1':'bc','2':'abdeg','3':'abcdg','F':'aefg','I':'ef'};
export function plateText(g:VGeo,text:string,cx:number,cy:number,z:number,h:number){
 const w=h*.5,t=h*.12,step=w+h*.25;let x=cx-(text.length*step-h*.25)/2+w/2;
 for(const ch of text){const s=SEG[ch]??'',seg=(k:string,x0:number,y0:number,x1:number,y1:number)=>{if(s.includes(k))g.panelZ((x0+x1)/2,(y0+y1)/2,z,Math.max(t,Math.abs(x1-x0))/2,Math.max(t,Math.abs(y1-y0))/2,1,COL.black);};
  const l=x-w/2,r=x+w/2,top=cy+h/2,bot=cy-h/2;
  seg('a',l,top,r,top);seg('b',r,cy,r,top);seg('c',r,bot,r,cy);seg('d',l,bot,r,bot);seg('e',l,bot,l,cy);seg('f',l,cy,l,top);seg('g',l,cy,r,cy);x+=step;}
}

// ---------------------------------------------------------------- one car (local: +z toward its cab, +x left of travel, y up from the rail top)
// Train visuals (Nov 24 2026, owner: "needs to look better", windows "more see-through"): real openings in the body with depth
// (reveals, frames, a sill), see-through glass in ONE shared transparent instanced mesh (createTrainGlass, below), a lit cream
// interior on every train (walls, coved ceiling with light strips on the lamp channel, moquette benches, grab poles, strap rails),
// a richer close-up interior for the car you ride in or stand next to (closeUp), and no near-black surfaces (dark grey-brown).
const IW=HALF_W-.06;// the inner wall face
const CEIL_Y=3.4,COVE_X=.95;// the interior ceiling (flat between ±COVE_X) and its cove down to the wall top (SIDE_TOP)
const Z0=-5.9,Z1=5.62;// the straight body sides (the ends narrow a little past these: rounded corners from above)
const ZI0=-5.94,ZI1=5.96;// the interior's ends (gangway end wall, cab front)
const CAB_K=(HALF_W*.86-.04)/IW;// the interior's width factor at the cab front (the body narrows past Z1)
/** The cab partition (passenger side face) and the gangway opening (half width, top) at the car's −z end. */
export const CAB_Z=4.7,GANGWAY_HALF=.45,GANGWAY_TOP=2.95;
/** Bench geometry for the ride / passenger code (car-local, the same on both sides, mirrored in x): the bench runs along z, the
 *  seat top height, the seat front edge |x| and the backrest face |x|. Interior parts never enter the seat volume (from the seat
 *  front to the backrest, BENCH_TOP to BENCH_TOP + 0.95) except the dividers at the bench ends and between seat slots. */
export const BENCHES:readonly [number,number][]=[[-5.82,-4.45],[-2.95,-.95],[.55,2.35],[3.85,4.6]];
export const BENCH_TOP=CAR_FLOOR_Y+.64,BENCH_FRONT=BENCH_X-BENCH_HALF_D,BENCH_BACK=1.2;
/** Seat slots (car-local z centres, the same on both sides at x = ±BENCH_X): 2 + 2 + 2 + 1 per side, 14 a car. */
export const SEAT_SLOTS_Z:readonly number[]=[-5.48,-4.79,-2.45,-1.45,.95,1.95,4.22];
/** Standing riders: the clear aisle |x| < AISLE_HALF (bench fronts at ±0.71), the strap rails at ±STRAP_X, STRAP_RAIL_Y high, the
 *  handles down to STRAP_GRIP_Y; the ceiling is CEIL_Y (CAR_FLOOR_Y + 2.25). */
export const AISLE_HALF=.7,STRAP_X=.62,STRAP_RAIL_Y=3.04,STRAP_GRIP_Y=2.64,INNER_CEIL_Y=CEIL_Y;
/** Within this 3-D distance (m) of a train's middle it draws the close-up variant (Town also asks for it while anyone rides it). */
export const CLOSE_RANGE=30;
/** A door leaf's pane (y range, car-local), shared by the leaf's hole and its glass instance. */
const DOOR_PANE=[2.2,2.92] as const,DOOR_EDGE=.07;
type Hole={z0:number;z1:number;y0:number;y1:number};
/** Window panes per side (z, y): one per short run, two per long run, the small one before the cab and the cab's side window. */
const WINDOWS:readonly Hole[]=(()=>{const w:Hole[]=[],run=(a:number,b:number,n:number)=>{const m=.1,len=(b-a-m*(n-1))/n;for(let k=0;k<n;k++)w.push({z0:a+k*(len+m),z1:a+k*(len+m)+len,y0:WIN_Y0,y1:WIN_Y1});};
 run(WIN_RUNS[0][0]+.03,WIN_RUNS[0][1]-.03,1);run(WIN_RUNS[1][0]+.02,WIN_RUNS[1][1]-.02,2);run(WIN_RUNS[2][0]+.02,WIN_RUNS[2][1]-.02,2);run(3.98,4.52,1);
 w.push({z0:4.86,z1:5.44,y0:2.25,y1:2.98});return w;})();
const DOOR_HOLES:readonly Hole[]=DOORS.map(zc=>({z0:zc-DOOR_HALF,z1:zc+DOOR_HALF,y0:CAR_FLOOR_Y,y1:DOOR_Y1}));
const SCREEN:readonly Hole[]=[{z0:-1.0,z1:-.07,y0:2.3,y1:3.04},{z0:.07,z1:1.0,y0:2.3,y1:3.04}];// windscreen panes (x as z)
/** AAA 2 (owner shot 53, Nov 24 2026: "make the space where the conductor is see-through so you can see what's ahead"): the cab
 *  partition is mostly glass, like a Japanese commuter car: two big panes from waist height (desk top) to just under the wall top,
 *  nearly the full width, a slim frame and a narrow centre pillar (x as z). Through them, past Kenji at his desk, the windscreen. */
const PART_WINS:readonly Hole[]=[{z0:-1.22,z1:-.05,y0:2.12,y1:3.02},{z0:.05,z1:1.22,y0:2.12,y1:3.02}];
/** Light palette (owner: nothing reads as a void in warm evening light). */
const K={frame:'#d5d2ca',rubber:'#5b5853',step:'#b4b6b6',yellow:'#f2c230',under:'#605b55',under2:'#76716a',bogie:'#5a554f',wheel:'#6c6760',
 hub:'#8f8a83',spring:'#4e4943',roofUnit:'#cfd0cc',roofTop:'#bfc1bd',grille:'#7b7e80',panto:'#8f969c',insul:'#e3dccb',surround:'#45423f',
 wall:'#ecd9b2',ceil:'#f0ddb6',ceilMid:'#f7d8a3',light:'#fff1cc',floor:'#a49886',floor2:'#b8ad99',kick:'#b9bcbf',pole:'#d3d6d8',cab:'#9a9f9c',desk:'#6b7472',
 bellows:'#5f5a54',bellowsIn:'#77716a',chime:'#f3a73a',blind:'#ebe1c8',rack:'#c8cbcd',vent:'#dcd8ce',slot:'#b9b4a8'} as const;
const _c=new T.Color();
const col=(hex:string,k=1)=>new T.Color(hex).multiplyScalar(k);
/** A vertical ambient-occlusion ramp: k0 at y0, 1 at y1 and above. */
const ramp=(hex:string,y0:number,y1:number,k0:number)=>{const b=new T.Color(hex);return (v:V)=>{const t=Math.min(1,Math.max(0,(v[1]-y0)/(y1-y0)));return _c.copy(b).multiplyScalar(k0+(1-k0)*t);};};
/** The cells of a wall from a0…a1 × the y breaks with rectangular holes, merged along a into runs. */
function wallCells(a0:number,a1:number,ys:readonly number[],holes:readonly Hole[],emit:(a:number,b:number,y0:number,y1:number)=>void,extra:readonly number[]=[]){
 const zb=[...new Set([a0,a1,...extra,...holes.flatMap(h=>[h.z0,h.z1])])].filter(z=>z>=a0&&z<=a1).sort((a,b)=>a-b);
 const lo=Math.min(...ys),hi=Math.max(...ys),yb=[...new Set([...ys,...holes.flatMap(h=>[h.y0,h.y1])])].filter(y=>y>=lo&&y<=hi).sort((a,b)=>a-b);
 for(let j=0;j<yb.length-1;j++){const y0=yb[j],y1=yb[j+1],yc=(y0+y1)/2;let run=-1;
  for(let i=0;i<zb.length;i++){const zc=i<zb.length-1?(zb[i]+zb[i+1])/2:0,solid=i<zb.length-1&&!holes.some(h=>zc>h.z0&&zc<h.z1&&yc>h.y0&&yc<h.y1);
   if(solid&&run<0)run=i;else if(!solid&&run>=0){emit(zb[run],zb[i],y0,y1);run=-1;}}}}
/** The four faces round a hole in a wall between x = xa and xb (side walls; `onX` false: an end wall, a/b are x, xa/xb are z). */
function reveal(g:VGeo,h:Hole,xa:number,xb:number,color:string|((v:V)=>T.Color),onX=true,skipSill=false){
 const P=(w:number,y:number,a:number):V=>onX?[w,y,a]:[a,y,w],am=(h.z0+h.z1)/2,ym=(h.y0+h.y1)/2,wm=(xa+xb)/2;
 if(!skipSill)g.quad(P(xa,h.y0,h.z0),P(xb,h.y0,h.z0),P(xb,h.y0,h.z1),P(xa,h.y0,h.z1),color,P(wm,h.y0-1,am));
 g.quad(P(xa,h.y1,h.z0),P(xb,h.y1,h.z0),P(xb,h.y1,h.z1),P(xa,h.y1,h.z1),color,P(wm,h.y1+1,am));
 g.quad(P(xa,h.y0,h.z0),P(xb,h.y0,h.z0),P(xb,h.y1,h.z0),P(xa,h.y1,h.z0),color,P(wm,ym,h.z0-1));
 g.quad(P(xa,h.y0,h.z1),P(xb,h.y0,h.z1),P(xb,h.y1,h.z1),P(xa,h.y1,h.z1),color,P(wm,ym,h.z1+1));}
/** A flat frame (four strips of width w) round a hole on a side wall at x (facing dir). */
function frameX(g:VGeo,x:number,dir:number,h:Hole,w:number,color:string,bottom=true){
 g.panelX(x,h.z0-w,h.z1+w,h.y1,h.y1+w,dir,color);if(bottom)g.panelX(x,h.z0-w,h.z1+w,h.y0-w,h.y0,dir,color);
 g.panelX(x,h.z0-w,h.z0,h.y0,h.y1,dir,color);g.panelX(x,h.z1,h.z1+w,h.y0,h.y1,dir,color);}
/** A quad on an end wall at z facing dir (x0…x1, y0…y1). */
const endQuad=(g:VGeo,z:number,dir:number,x0:number,x1:number,y0:number,y1:number,color:string|((v:V)=>T.Color),part=0)=>g.quad([x0,y0,z],[x1,y0,z],[x1,y1,z],[x0,y1,z],color,[(x0+x1)/2,(y0+y1)/2,z-dir],part);
/** A spinning wheel (Looks 2, Nov 24 2026; owner shot 49: the 8-sided wheels read as octagons with an off-centre hub): a round
 *  tread of WHEEL_SIDES (WHEEL_SIDES_FAR in the far tier), a flange lip on the inner (gauge) side that reaches just under the rail
 *  top, a light wheel disc, a dark hub and an axle boss, all PART.rearWheel about the wheel's centre (so they turn together). The
 *  polygon's flats sit ON the rail top (the radius is grown by 1 / cos(π / N)). Full: 7N + 2 tris with the flange; far: 3N + 2. */
export const WHEEL_SIDES=16,WHEEL_SIDES_FAR=9,FLANGE_R=.035,FLANGE_W=.028;
function wheel(g:VGeo,x:number,az:number,full:boolean){const N=full?WHEEL_SIDES:WHEEL_SIDES_FAR,s=Math.sign(x),xo=x+s*.06,xi=x-s*.06,ctr:V=[x,WHEEL_R,az],k0=1/Math.cos(Math.PI/N);
 const R=(k:number,px:number,r=WHEEL_R):V=>{const t=k/N*Math.PI*2;return [px,WHEEL_R-Math.cos(t)*r*k0,az+Math.sin(t)*r*k0];};// k = 0: straight down
 const rot=(k:number,px:number,r=WHEEL_R)=>R(k+.5,px,r);// a flat (not a corner) at the bottom
 for(let k=0;k<N;k++){g.quad(rot(k,xi),rot(k+1,xi),rot(k+1,xo),rot(k,xo),K.wheel,ctr,PART.rearWheel,ctr);
  if(k>0&&k<N-1)g.tri(rot(0,xo),rot(k,xo),rot(k+1,xo),K.hub,[xi,WHEEL_R,az],PART.rearWheel,ctr);}
 if(full){const xf=xi-s*FLANGE_W,rf=WHEEL_R+FLANGE_R;// the flange: its rim and the step out to it (seen as a thin dark lip round the tread)
  for(let k=0;k<N;k++){g.quad(rot(k,xf,rf),rot(k+1,xf,rf),rot(k+1,xi,rf),rot(k,xi,rf),K.spring,ctr,PART.rearWheel,ctr);
   g.quad(rot(k,xi,WHEEL_R),rot(k+1,xi,WHEEL_R),rot(k+1,xi,rf),rot(k,xi,rf),K.spring,[xi-s,WHEEL_R,az],PART.rearWheel,ctr);}}
 // the hub: a dark square boss centred on the axle (4 tris; its corners show the spin like the old off-centre plate did)
 const xh=xo+s*.004,hb=.12;for(let k=0;k<4;k++){const a=k/4*Math.PI*2,b=(k+1)/4*Math.PI*2;g.tri([xh+s*.03,WHEEL_R,az],[xh,WHEEL_R+Math.cos(a)*hb,az+Math.sin(a)*hb],[xh,WHEEL_R+Math.cos(b)*hb,az+Math.sin(b)*hb],K.spring,[xi,WHEEL_R,az],PART.rearWheel,ctr);}}
function coveQuad(g:VGeo,s:number,u0:number,u1:number,z0:number,z1:number,off:number,color:string){
 const dx=(COVE_X-IW)*s,dy=CEIL_Y-SIDE_TOP,l=Math.hypot(dx,dy),nx=-s*dy/l,ny=-Math.abs(dx)/l;// the cove's normal: toward the aisle and down
 const P=(u:number,z:number):V=>[s*IW+dx*u+nx*off,SIDE_TOP+dy*u+ny*off,z];
 g.quad(P(u0,z0),P(u1,z0),P(u1,z1),P(u0,z1),color,[s*(IW+1),SIDE_TOP+1,(z0+z1)/2]);}
/** Four football posters for the ad frames over the windows (vertex colour blocks, no texture). */
function poster(g:VGeo,s:number,z0:number,z1:number,kind:number){
 const q=(u0:number,u1:number,a:number,b:number,c:string,o=.008)=>coveQuad(g,s,u0,u1,z0+(z1-z0)*a,z0+(z1-z0)*b,o,c);
 q(.08,.92,0,1,'#f4f1e8',.004);// the frame
 if(kind===0){q(.14,.86,.03,.97,'#2f7d4f');q(.68,.82,.08,.92,'#f6e9b8',.012);// Island League fixtures: green, a header, three fixture rows
  for(let r=0;r<3;r++){const u=.2+r*.15;q(u,u+.09,.1,.24,['#d6343a','#f5c21b','#5aa8de'][r],.012);q(u,u+.09,.3,.7,'#f4f1e8',.012);q(u,u+.09,.76,.9,['#1f5c9c','#8c2a2f','#f2e9d2'][r],.012);}}
 else if(kind===1){q(.14,.86,.03,.97,'#efe3c4');q(.68,.82,.08,.92,'#7a4b2f',.012);// Visit the History Museum: a columned front
  q(.52,.62,.2,.8,'#a0714b',.012);for(const a of [.24,.44,.64])q(.22,.52,a,a+.12,'#c79a6b',.012);q(.16,.22,.18,.82,'#a0714b',.012);}
 else if(kind===2){q(.14,.86,.03,.97,'#e2683c');q(.68,.82,.08,.92,'#fff3df',.012);// Kit Shop: new boots
  q(.22,.5,.3,.5,'#2c2a28',.012);q(.22,.34,.5,.78,'#2c2a28',.012);q(.38,.42,.32,.48,'#f5c21b',.016);q(.25,.29,.52,.74,'#f4f1e8',.016);}
 else{q(.14,.86,.03,.97,'#f8f5ee');q(.68,.82,.08,.92,'#1f5c9c',.012);// the Island Line route map: the line and its five stops
  q(.4,.44,.08,.92,'#1f5c9c',.012);['#d6343a','#f5c21b','#3f9a5f','#e2683c','#5aa8de'].forEach((c,k)=>{const a=.1+k*.19;q(.36,.48,a,a+.06,c,.016);});}}
/** The four posters a side (z0 … z1 on the cove over the windows) and which design (0 Island League fixtures, 1 History Museum,
 *  2 Kit Shop boots, 3 the Island Line route map). Gameplay 3: their readable titles (and the route map's stops) are quads of the
 *  trains' plate mesh (trainRunning.ts, the boards canvas), placed with coveCorner. */
export const POSTERS:readonly {s:number;z0:number;z1:number;kind:number}[]=[1,-1].flatMap(s=>[
 {s,z0:WIN_RUNS[1][0],z1:WIN_RUNS[1][0]+.8,kind:s>0?0:2},{s,z0:WIN_RUNS[1][1]-.8,z1:WIN_RUNS[1][1],kind:s>0?3:1},
 {s,z0:WIN_RUNS[2][0],z1:WIN_RUNS[2][0]+.8,kind:s>0?1:3},{s,z0:WIN_RUNS[2][1]-.75,z1:WIN_RUNS[2][1],kind:s>0?2:0}]);
/** A point on the ceiling cove of side s (coveQuad's frame: u 0 the wall top … 1 the ceiling edge, z along the car), `off` m out
 *  toward the aisle; and the cove's normal (toward the aisle and down). */
export function coveCorner(s:number,u:number,z:number,off:number):V{const dx=(COVE_X-IW)*s,dy=CEIL_Y-SIDE_TOP,l=Math.hypot(dx,dy),nx=-s*dy/l,ny=-Math.abs(dx)/l;return [s*IW+dx*u+nx*off,SIDE_TOP+dy*u+ny*off,z];}
export function coveNormal(s:number):V{const dx=(COVE_X-IW)*s,dy=CEIL_Y-SIDE_TOP,l=Math.hypot(dx,dy);return [-s*dy/l,-Math.abs(dx)/l,0];}
/** The door chime lamp box (one over each doorway, both sides): its aisle face at |x| CHIME.x, centre y, half height / length. */
export const CHIME={x:IW-.056,y:DOOR_Y1+.04,hy:.026,hz:.092} as const;
/** Seat moquette per livery (A green, B / C blue). */
const moquette=(lv:Livery)=>lv.emblem?'#3f7d5c':'#3f68ad';

/** closeUp (Phase 3's "open" flag): the variant for the train someone rides or stands next to (CLOSE_RANGE): the full interior
 *  (dividers, luggage racks, straps, posters, vents, the cab, blinds, door chime lamps, the aisle line). Same material, same program. */
export function buildCarGeometry(lv:Livery,closeUp=false){
 const g=new VGeo();
 const prof:[number,number][]=[[-HALF_W,BODY_Y0],[-HALF_W,SPLIT_Y],[-HALF_W,SIDE_TOP],[-1.36,3.36],[-1.24,3.54],[-1.02,3.66],[-.55,3.73],[0,ROOF_TOP],[.55,3.73],[1.02,3.66],[1.24,3.54],[1.36,3.36],[HALF_W,SIDE_TOP],[HALF_W,SPLIT_Y],[HALF_W,BODY_Y0]];
 const segColor=(ya:number,yb:number)=>Math.max(ya,yb)<=SPLIT_Y+.01?lv.lower:Math.min(ya,yb)>=3.35?lv.roof:lv.upper;// the shoulder in the body colour, the roof grey
 const rings:[number,number][]=[[-6,.985],[Z0,1],[Z1,1],[5.88,.95],[6,.86]];
 const SIDE0=2,SIDE1=prof.length-3;// segments < SIDE0 or ≥ SIDE1 are the body sides (built with holes on the straight part)
 for(let r=0;r<rings.length-1;r++){const [z0,k0]=rings[r],[z1,k1]=rings[r+1];
  for(let k=0;k<prof.length-1;k++){if(r===1&&(k<SIDE0||k>=SIDE1))continue;const [xa,ya]=prof[k],[xb,yb]=prof[k+1];
   g.quad([xa*k0,ya,z0],[xb*k0,yb,z0],[xb*k1,yb,z1],[xa*k1,ya,z1],segColor(ya,yb),[0,2.4,(z0+z1)/2]);}}
 g.quad([-HALF_W,BODY_Y0,-6],[HALF_W,BODY_Y0,-6],[HALF_W*.86,BODY_Y0,6],[-HALF_W*.86,BODY_Y0,6],K.under,[0,3,0]);
 const wallRamp=ramp(K.wall,CAR_FLOOR_Y,CAR_FLOOR_Y+1.1,.74);
 // ---- the sides: outer skin with real openings, the inner wall, reveals, frames, stripes, seams, door frames and steps
 const holes=[...DOOR_HOLES,...WINDOWS];
 for(const s of [-1,1]){const x=s*HALF_W,xi=s*IW;
  wallCells(Z0,Z1,[BODY_Y0,SPLIT_Y,SIDE_TOP],holes,(a,b,y0,y1)=>g.panelX(x,a,b,y0,y1,s,(y0+y1)/2<SPLIT_Y?lv.lower:lv.upper));
  g.bend=INNER_BEND;g.defPart=PART.left;wallCells(ZI0,Z1,[CAR_FLOOR_Y,SIDE_TOP],holes,(a,b,y0,y1)=>g.panelX(xi,a,b,y0,y1,-s,wallRamp),[CAB_Z]);
  g.quad([xi,CAR_FLOOR_Y,Z1],[xi*CAB_K,CAR_FLOOR_Y,ZI1],[xi*CAB_K,SIDE_TOP,ZI1],[xi,SIDE_TOP,Z1],K.cab,[0,2,Z1]);g.bend=0;g.defPart=0;// the cab's narrowing corner
  for(const w of WINDOWS){reveal(g,w,x,xi,K.frame);frameX(g,s*(HALF_W+.004),s,w,.045,K.frame);}
  for(const d of DOOR_HOLES){reveal(g,d,x,xi,K.yellow,true,true);// the door-edge strip: yellow jambs, a silver head
   g.panelX(s*(HALF_W+.003),d.z0-.06,d.z1+.06,d.y1,d.y1+.06,s,K.frame);g.panelX(s*(HALF_W+.003),d.z0-.06,d.z0,BODY_Y0,d.y1,s,K.frame);g.panelX(s*(HALF_W+.003),d.z1,d.z1+.06,BODY_Y0,d.y1,s,K.frame);
   g.quad([s*(HALF_W+.09),CAR_FLOOR_Y,d.z0],[xi,CAR_FLOOR_Y,d.z0],[xi,CAR_FLOOR_Y,d.z1],[s*(HALF_W+.09),CAR_FLOOR_Y,d.z1],K.step,[s*HALF_W,0,(d.z0+d.z1)/2]);// threshold
   g.box(s*(HALF_W+.05),BODY_Y0-.04,(d.z0+d.z1)/2,.05,.03,DOOR_HALF+.04,K.step);}// the step plate under the doorway
  // stripes, broken at the doorways
  for(const [y,h,c] of lv.stripes){const y0=y-h/2,y1=y+h/2;let z=Z0;for(const d of DOOR_HOLES){if(y1>d.y0&&y0<d.y1){g.panelX(s*(HALF_W+.006),z,d.z0-.06,y0,y1,s,c);z=d.z1+.06;}}g.panelX(s*(HALF_W+.006),z,Z1,y0,y1,s,c);}
  // panel seams (thin, a shade darker) and the rain gutter along the roof edge
  for(const zs of [-4.95,-1.98,1.45,4.65])for(const [y0,y1,c] of [[BODY_Y0+.04,SPLIT_Y,lv.lower],[SPLIT_Y,WIN_Y0-.06,lv.upper]] as const)g.panelX(s*(HALF_W+.005),zs-.008,zs+.008,y0,y1,s,col(c,.8).getStyle());
  g.beam([s*(HALF_W+.01),SIDE_TOP+.03,Z0],[s*(HALF_W+.01),SIDE_TOP+.03,Z1],.025,col(lv.roof,.85).getStyle());}
 // ---- ends: the cab front (+z) with a two-pane windscreen in a dark surround, and the gangway end (−z) with its opening
 {const z=6,w=HALF_W*.86,inC=ramp(K.cab,CAR_FLOOR_Y,CAR_FLOOR_Y+1.2,.8);
  wallCells(-w,w,[BODY_Y0,SPLIT_Y,2.22,SIDE_TOP],SCREEN,(a,b,y0,y1)=>{const yc=(y0+y1)/2,xc=(a+b)/2;endQuad(g,z,1,a,b,y0,y1,yc>2.22&&Math.abs(xc)<1.1?K.surround:yc<SPLIT_Y?lv.lower:lv.upper);},[-1.1,1.1]);
  g.bend=INNER_BEND;g.defPart=PART.left;wallCells(-IW*CAB_K,IW*CAB_K,[CAR_FLOOR_Y,SIDE_TOP],SCREEN,(a,b,y0,y1)=>endQuad(g,ZI1,-1,a,b,y0,y1,inC));
  g.bend=0;g.defPart=0;for(const h of SCREEN)reveal(g,h,ZI1,z,K.surround,false);
  for(const s of [-1,1])g.quad([s*IW*CAB_K,SIDE_TOP,ZI1],[s*COVE_X*CAB_K,CEIL_Y,ZI1],[0,CEIL_Y,ZI1],[0,SIDE_TOP,ZI1],K.cab,[0,3.2,ZI1+1]);
  for(let i=SIDE0;i<SIDE1;i++)g.tri([0,SIDE_TOP,z],[prof[i][0]*.86,prof[i][1],z],[prof[i+1][0]*.86,prof[i+1][1],z],lv.upper,[0,2.4,z-1]);}
 {const z=-6,w=HALF_W*.985,gw:Hole={z0:-GANGWAY_HALF,z1:GANGWAY_HALF,y0:CAR_FLOOR_Y,y1:GANGWAY_TOP};
  wallCells(-w,w,[BODY_Y0,SPLIT_Y,SIDE_TOP],[gw],(a,b,y0,y1)=>endQuad(g,z,-1,a,b,y0,y1,(y0+y1)/2<SPLIT_Y?lv.lower:lv.upper));
  g.bend=INNER_BEND;g.defPart=PART.left;wallCells(-IW,IW,[CAR_FLOOR_Y,SIDE_TOP],[gw],(a,b,y0,y1)=>endQuad(g,ZI0,1,a,b,y0,y1,wallRamp));
  for(const s of [-1,1])g.quad([s*IW,SIDE_TOP,ZI0],[s*COVE_X,CEIL_Y,ZI0],[0,CEIL_Y,ZI0],[0,SIDE_TOP,ZI0],K.wall,[0,3.2,ZI0-1]);
  g.bend=0;g.defPart=0;reveal(g,gw,z,ZI0,K.frame,false,true);
  for(let i=SIDE0;i<SIDE1;i++)g.tri([0,SIDE_TOP,z],[prof[i][0]*.985,prof[i][1],z],[prof[i+1][0]*.985,prof[i+1][1],z],lv.roof,[0,2.4,z+1]);
  // the gangway bellows to the next car (half of the 0.4 m gap; the coupled car draws the other half), ribbed, both faces
  const bz0=-6,bz1=-6-CAR_GAP_HALF,bx=GANGWAY_HALF+.17,by0=CAR_FLOOR_Y-.05,by1=GANGWAY_TOP+.12;
  for(let k=0;k<2;k++){const za=bz0+(bz1-bz0)*k/2,zb=bz0+(bz1-bz0)*(k+1)/2,o=k%2?K.bellows:col(K.bellows,1.12).getStyle(),i=k%2?K.bellowsIn:col(K.bellowsIn,.9).getStyle();
   for(const s of [-1,1]){g.quad([s*bx,by0,za],[s*bx,by1,za],[s*bx,by1,zb],[s*bx,by0,zb],o,[0,2,za]);g.quad([s*GANGWAY_HALF,by0,za],[s*GANGWAY_HALF,by1,za],[s*GANGWAY_HALF,by1,zb],[s*GANGWAY_HALF,by0,zb],i,[s*2,2,za]);}
   g.quad([-bx,by1,za],[bx,by1,za],[bx,by1,zb],[-bx,by1,zb],o,[0,0,za]);g.quad([-GANGWAY_HALF,GANGWAY_TOP,za],[GANGWAY_HALF,GANGWAY_TOP,za],[GANGWAY_HALF,GANGWAY_TOP,zb],[-GANGWAY_HALF,GANGWAY_TOP,zb],i,[0,9,za]);}
  g.quad([-GANGWAY_HALF,CAR_FLOOR_Y,bz0],[GANGWAY_HALF,CAR_FLOOR_Y,bz0],[GANGWAY_HALF,CAR_FLOOR_Y,bz1],[-GANGWAY_HALF,CAR_FLOOR_Y,bz1],K.step,[0,0,bz0]);}
 // ---- the interior every train shows: floor, ceiling + cove + light strips, benches, poles, strap rails, the cab partition, the desk
 g.bend=INNER_BEND;g.defPart=PART.left;interior(g,lv,closeUp);g.bend=0;g.defPart=0;
 // ---- cab front: destination board frame, round headlamps in bezels, tail + marker lamps, stripes, headmark, number plate,
 // wipers, grab rail, skirt, anti-climber and coupler
 {const z=6.004;
  g.panelZ(0,3.43,z,.64,.16,1,K.surround);g.panelZ(0,3.43,z+.003,.58,.11,1,COL.dest,PART.head);
  for(const [y,h,c] of lv.stripes)if(y+h/2<2.2)g.panelZ(0,y,z,1.2,h/2,1,c);
  for(const x of [-.86,.86]){g.discZ(x,3.42,z+.002,.15,K.surround);g.discZ(x,3.42,z+.006,.11,COL.head,PART.head);
   g.panelZ(x*1.18,1.45,z+.003,.1,.065,1,K.surround);g.panelZ(x*1.18-.045,1.45,z+.006,.04,.045,1,COL.tail,PART.brake);g.panelZ(x*1.18+.045,1.45,z+.006,.04,.045,1,'#fff3d2',PART.head);}
  if(lv.emblem){g.discZ(0,1.66,z+.004,.24,COL.gold);g.discZ(0,1.66,z+.007,.2,COL.white);g.discZ(0,1.66,z+.01,.075,'#2c2a28',0,5);}
  else{g.discZ(0,1.66,z+.004,.22,COL.gold);g.discZ(0,1.66,z+.007,.18,lv.upper);g.discZ(0,1.66,z+.01,.07,COL.white,0,5);}
  g.panelZ(0,1.3,z+.004,.3,.085,1,COL.white,PART.left);/* POLISH 3: the number plate glows at night (the night channel) */plateText(g,lv.plate,0,1.3,z+.008,.11);
  for(const x0 of [-.95,.12])g.beam([x0,2.34,z+.02],[x0+.42,2.62,z+.02],.012,'#3b3a38');// wipers resting on each pane
  g.beam([-.5,2.12,6.06],[.5,2.12,6.06],.025,K.frame);
  g.quad([-1.15,BODY_Y0,6.0],[1.15,BODY_Y0,6.0],[1.0,.42,6.2],[-1.0,.42,6.2],K.under,[0,.7,5]);
  for(let k=0;k<3;k++)g.box(0,.9+k*.055,6.08,.55,.018,.06,K.step);// anti-climber ribs
  g.box(0,.72,6.25,.12,.1,.25,K.spring);g.box(0,.72,6.5,.2,.14,.06,K.frame);g.box(0,.72,-6.2,.12,.1,.2,K.spring);}
 // ---- underfloor: two-tone equipment boxes between the bogies
 for(const [z,hz,s] of [[-2.2,.75,1],[-.2,.6,-1],[1.6,.8,1],[-1.6,.55,-1],[1.5,.5,-1]] as const){g.box(s*.72,.82,z,.42,.2,hz,K.under,0,undefined,true);g.panelX(s*1.145,z-hz+.05,z+hz-.05,.68,.96,s,K.under2);}
 // ---- bogies: frames, bolster, axle boxes, air springs and four spinning wheels each (dark grey, never black)
 for(const bz of [-BOGIE_HALF,BOGIE_HALF]){
  for(const s of [-1,1]){g.box(s*.84,.62,bz,.06,.11,1.35,K.bogie);for(const az of [bz-1.05,bz+1.05])g.box(s*.86,WHEEL_R,az,.07,.09,.12,K.spring);
   g.box(s*.8,.9,bz,.13,.11,.2,K.spring);for(const az of [bz-.55,bz+.55])g.box(s*.86,.62,az,.05,.15,.06,K.under2);}
  g.box(0,.72,bz,.8,.08,.25,K.bogie);for(const az of [bz-1.05,bz+1.05])for(const x of [-.68,.68])wheel(g,x,az,closeUp);}
 // ---- roof: two air-conditioner units (a raised chamfered lid, side grilles, a fan) and a single-arm pantograph on insulators
 for(const z of [-2.7,1.7]){const y=ROOF_TOP-.02;g.box(0,y+.11,z,.6,.11,.82,K.roofUnit);
  const t=y+.3,P=(x:number,yy:number,zz:number):V=>[x,yy,z+zz];
  g.quad(P(-.45,t,-.65),P(.45,t,-.65),P(.45,t,.65),P(-.45,t,.65),K.roofTop,[0,0,z]);
  g.quad(P(-.6,y+.22,-.82),P(.6,y+.22,-.82),P(.45,t,-.65),P(-.45,t,-.65),K.roofTop,[0,0,z]);g.quad(P(-.6,y+.22,.82),P(.6,y+.22,.82),P(.45,t,.65),P(-.45,t,.65),K.roofTop,[0,0,z]);
  for(const s of [-1,1]){g.quad(P(s*.6,y+.22,-.82),P(s*.6,y+.22,.82),P(s*.45,t,.65),P(s*.45,t,-.65),K.roofTop,[0,0,z]);g.panelX(s*.605,z-.6,z+.6,y+.05,y+.18,s,K.grille);}
  for(let k=0;k<6;k++){const a=k/6*Math.PI*2,b=(k+1)/6*Math.PI*2;g.tri([0,t+.005,z],[Math.cos(a)*.22,t+.005,z+Math.sin(a)*.22],[Math.cos(b)*.22,t+.005,z+Math.sin(b)*.22],K.grille,[0,0,z]);}}
 {const pz=-.5,y=ROOF_TOP-.01;for(const x of [-.42,.42])for(const dz of [-.4,.4])g.box(x,y+.06,pz+dz,.05,.06,.05,K.insul);
  g.box(0,y+.14,pz,.48,.025,.48,K.panto);const knee:V=[0,4.22,pz+.95],head:V=[0,4.74,pz-.2];
  for(const x of [-.14,.14])g.beam([x,y+.17,pz-.3],[x*.4,knee[1],knee[2]],.03,K.panto);g.beam([0,y+.17,pz-.1],[0,y+.5,pz+.4],.02,K.panto);
  g.beam(knee,head,.022,K.panto);for(const dz of [-.07,.07])g.beam([-.62,4.77,head[2]+dz],[.62,4.77,head[2]+dz],.022,K.panto);
  for(const s of [-1,1])g.beam([s*.62,4.77,head[2]],[s*.86,4.66,head[2]],.018,K.panto);}
 return {geometry:g.build(),triangles:g.tris};
}
const CAR_GAP_HALF=.2,INNER_BEND=.65;
/** Night: the interior glows by this × the night factor (the train's indicator channel: lamp.z), so a lit car reads warm from outside;
 *  the ceiling light strips are on the head-lamp channel (always on, brighter at night and in the tunnel, like a real car's lights). */
export const INTERIOR_GLOW=.48;
/** The cream interior (all trains) and, closeUp, its detail. Faces face the aisle: they are seen through the glass and doorways. */
function interior(g:VGeo,lv:Livery,closeUp:boolean){
 const F=CAR_FLOOR_Y,seat=moquette(lv),seatDark=col(seat,.78).getStyle(),seatLite=col(seat,1.12).getStyle();
 // floor: lighter in the aisle, darker by the walls; a darker patch under each bench (occlusion)
 const SEGS=[[ZI0,Z1,1,1],[Z1,ZI1,1,CAB_K]] as const;// the straight part, then the cab end (narrowing with the body)
 for(const [za,zb,ka,kb] of SEGS)for(const [x0,x1,c] of [[-IW,-.5,col(K.floor,.86).getStyle()],[-.5,.5,K.floor],[.5,IW,col(K.floor,.86).getStyle()]] as const){
  const A=(x:number)=>Math.abs(x)>.6?x*ka:x,B=(x:number)=>Math.abs(x)>.6?x*kb:x;g.quad([A(x0),F,za],[A(x1),F,za],[B(x1),F,zb],[B(x0),F,zb],c,[0,F-1,0]);}
 for(const s of [-1,1])for(const [a,b] of BENCHES)g.quad([s*.7,F+.003,a],[s*IW,F+.003,a],[s*IW,F+.003,b],[s*.7,F+.003,b],col(K.floor,.66).getStyle(),[0,F-1,0]);
 // ceiling and cove, two light strips (the indicator channel: lit by the night factor, like the old window band)
 // Nov 24 2026 (night ceiling): the flat between the light strips is a warmer cream (K.ceilMid), so under the blue night light plus
 // the interior glow it reads warm instead of light grey; the outer flats and the cove keep K.ceil.
 for(const [za,zb,ka,kb] of SEGS){for(const [x0,x1,c] of [[-COVE_X,-.46,K.ceil],[-.46,.46,K.ceilMid],[.46,COVE_X,K.ceil]] as const){const A=(x:number)=>Math.abs(x)>.6?x*ka:x,B=(x:number)=>Math.abs(x)>.6?x*kb:x;
   g.quad([A(x0),CEIL_Y,za],[A(x1),CEIL_Y,za],[B(x1),CEIL_Y,zb],[B(x0),CEIL_Y,zb],c,[0,CEIL_Y+1,0]);}
  for(const s of [-1,1])g.quad([s*IW*ka,SIDE_TOP,za],[s*COVE_X*ka,CEIL_Y,za],[s*COVE_X*kb,CEIL_Y,zb],[s*IW*kb,SIDE_TOP,zb],ramp(K.ceil,SIDE_TOP,CEIL_Y,.9),[s*3,5,(za+zb)/2]);}
 for(const s of [-1,1]){
  g.quad([s*.46,CEIL_Y-.006,-5.6],[s*.7,CEIL_Y-.006,-5.6],[s*.7,CEIL_Y-.006,CAB_Z-.2],[s*.46,CEIL_Y-.006,CAB_Z-.2],K.light,[0,CEIL_Y+1,0],PART.head);}
 // the cab partition (cream on the passenger side, grey in the cab) with its window, the cab desk
 {const hs=PART_WINS;wallCells(-IW,IW,[F,SIDE_TOP],hs,(a,b,y0,y1)=>{endQuad(g,CAB_Z,-1,a,b,y0,y1,ramp(K.wall,F,F+1.1,.74));endQuad(g,CAB_Z+.05,1,a,b,y0,y1,K.cab);});
  for(const s of [-1,1]){g.quad([s*IW,SIDE_TOP,CAB_Z],[s*COVE_X,CEIL_Y,CAB_Z],[0,CEIL_Y,CAB_Z],[0,SIDE_TOP,CAB_Z],K.wall,[0,3.2,CAB_Z+1]);}
  for(const h of PART_WINS)reveal(g,h,CAB_Z,CAB_Z+.05,K.frame,false);
  g.box(0,F+.42,5.62,1.02,.42,.3,K.desk);g.quad([-1.02,F+.84,5.32],[1.02,F+.84,5.32],[1.02,F+1.0,5.9],[-1.02,F+1.0,5.9],col(K.desk,1.15).getStyle(),[0,0,6]);}
 for(const s of [-1,1]){
  // benches: stainless kick panel, a moquette cushion (lighter top, darker sides) and a two-tone backrest
  for(const [a,b] of BENCHES){const zc=(a+b)/2,hz=(b-a)/2;
   g.box(s*1.06,F+.26,zc,.28,.26,hz,ramp(K.kick,F,F+.5,.7));
   g.box(s*(BENCH_FRONT+.31),F+.575,zc,.31,.065,hz,seatDark);g.quad([s*(BENCH_FRONT+.03),F+.642,a+.02],[s*(IW-.02),F+.642,a+.02],[s*(IW-.02),F+.642,b-.02],[s*(BENCH_FRONT+.03),F+.642,b-.02],seat,[0,F,zc]);
   g.box(s*(BENCH_BACK+.07),F+.74,zc,.07,.1,hz,seatDark);g.box(s*(BENCH_BACK+.07),F+.94,zc,.07,.1,hz,seat);
   if(closeUp){g.quad([s*BENCH_FRONT,F+.6,a],[s*(BENCH_FRONT+.04),F+.642,a],[s*(BENCH_FRONT+.04),F+.642,b],[s*BENCH_FRONT,F+.6,b],seatLite,[0,F+.3,zc]);// a bevel on the cushion's front edge
    for(const ze of [a,b])g.box(s*(BENCH_FRONT+.32),F+.52,ze,.3,.44,.012,K.pole);// stainless end screens
    for(let i=0;i<SEAT_SLOTS_Z.length-1;i++){const m=(SEAT_SLOTS_Z[i]+SEAT_SLOTS_Z[i+1])/2;if(m>a+.1&&m<b-.1)g.beam([s*(BENCH_FRONT+.05),F+.66,m],[s*(BENCH_FRONT+.05),F+.9,m],.016,K.pole);}// dividers between slots
    g.box(s*1.17,3.06,zc,.17,.008,hz,K.rack);g.beam([s*1.0,3.04,a],[s*1.0,3.04,b],.012,K.pole);}}// luggage rack over the bench
  // grab poles at the door bays (bench ends), the strap rail
  for(const zc of DOORS)for(const d of [-1,1])g.beam([s*.78,F,zc+d*(DOOR_HALF+.12)],[s*.78,CEIL_Y,zc+d*(DOOR_HALF+.12)],.022,K.pole);
  g.beam([s*STRAP_X,STRAP_RAIL_Y,-5.7],[s*STRAP_X,STRAP_RAIL_Y,CAB_Z-.15],.018,K.pole);
  if(closeUp){
   // hangers and strap handles (a strap and a triangular grip), over the bench fronts
   for(const z of [-5.5,-2.5,0,2.5,4.4])g.beam([s*STRAP_X,STRAP_RAIL_Y,z],[s*STRAP_X,CEIL_Y,z],.01,K.pole);
   // the straps swing about the rail in the vehicle shader (PART.strap, pivot in aPart): with the car's curve lean and a soft pendulum
   // after starts / stops (trafficVehicles.ts uSway). No per-strap CPU work; rigid with prefers-reduced-motion.
   for(const [a,b] of BENCHES){const n=Math.max(1,Math.round((b-a)/.6));for(let k=0;k<n;k++){const z=a+(k+.5)*(b-a)/n,x=s*STRAP_X,yb=STRAP_GRIP_Y+.1,P:V=[x,STRAP_RAIL_Y,z],S=PART.strap;
    g.beam(P,[x,yb,z],.012,'#e9e4d6',S,P);g.beam([x,yb,z-.06],[x,yb,z+.06],.01,'#f2efe6',S,P);g.beam([x,yb,z-.06],[x,STRAP_GRIP_Y,z],.01,'#f2efe6',S,P);g.beam([x,yb,z+.06],[x,STRAP_GRIP_Y,z],.01,'#f2efe6',S,P);}}
   // posters on the cove over the windows, door chime lamps (amber), the floor's yellow door edge and the aisle line, blinds
   for(const ps of POSTERS)if(ps.s===s)poster(g,s,ps.z0,ps.z1,ps.kind);
   for(const zc of DOORS){g.box(s*(IW-.025),DOOR_Y1+.04,zc,.025,.025,.09,K.chime);
    g.quad([s*(IW-.16),F+.004,zc-DOOR_HALF],[s*IW,F+.004,zc-DOOR_HALF],[s*IW,F+.004,zc+DOOR_HALF],[s*(IW-.16),F+.004,zc+DOOR_HALF],K.yellow,[0,F-1,zc]);}
   for(const k of [0,3]){const w=WINDOWS[k];for(const d of [1,-1])g.panelX(s*(IW+.012),w.z0,w.z1,w.y1-.2,w.y1,d*s,K.blind);}}}
 if(closeUp){for(const x of [-.47,.43])g.quad([x,F+.002,ZI0+.05],[x+.04,F+.002,ZI0+.05],[x+.04,F+.002,CAB_Z-.05],[x,F+.002,CAB_Z-.05],K.floor2,[0,F-1,0]);
  // ceiling vents (a pale strip with dark slots) and the driver's seat
  g.quad([-.2,CEIL_Y-.004,-5.6],[.2,CEIL_Y-.004,-5.6],[.2,CEIL_Y-.004,CAB_Z-.2],[-.2,CEIL_Y-.004,CAB_Z-.2],K.vent,[0,CEIL_Y+1,0]);
  for(let z=-5.2;z<CAB_Z-.4;z+=1.3)g.quad([-.1,CEIL_Y-.008,z],[.1,CEIL_Y-.008,z],[.1,CEIL_Y-.008,z+.36],[-.1,CEIL_Y-.008,z+.36],K.slot,[0,CEIL_Y+1,0]);
  g.box(-.45,F+.3,5.05,.24,.3,.22,K.desk);g.box(-.45,F+.75,4.86,.24,.25,.04,K.desk);}
}
/** The far tier: one box per car (12 triangles): the lower livery colour low, the upper high, the roof colour on top. */
export function buildCarBox(lv:Livery){
 const g=new VGeo(),lo=new T.Color(lv.lower),hi=new T.Color(lv.upper),rf=new T.Color(lv.roof);g.box(0,(BODY_Y0+ROOF_TOP)/2,0,HALF_W,(ROOF_TOP-BODY_Y0)/2,6,lv.upper,0,undefined,true);
 const pos=g.p,c=g.c,n=g.n;for(let i=0;i<pos.length/3;i++){const k=n[i*3+1]>.5?rf:n[i*3+1]<-.5?new T.Color(K.under):pos[i*3+1]<2?lo:hi;c[i*3]=k.r;c[i*3+1]=k.g;c[i*3+2]=k.b;}
 return g.build();
}
/** One door leaf (stainless, both faces, a real hole for its glass pane and rubber edges), facing +x, centred on its closed spot. */
export function buildDoorLeaf(){const g=new VGeo(),h=(DOOR_Y1-DOOR_Y0)/2,w=DOOR_HALF/2,yc=(DOOR_Y0+DOOR_Y1)/2,p0=DOOR_PANE[0]-yc,p1=DOOR_PANE[1]-yc,e=DOOR_EDGE,t=.015,st=ramp(COL.door,-h,0,.86);
 for(const d of [1,-1]){const x=d*t;g.bend=d<0?INNER_BEND:0;g.panelX(x,-w,w,-h,p0,d,st);g.panelX(x,-w,w,p1,h,d,st);g.panelX(x,-w,-w+e,p0,p1,d,st);g.panelX(x,w-e,w,p0,p1,d,st);
  g.panelX(d*(t+.002),-w,-w+.02,-h,h,d,K.rubber);g.panelX(d*(t+.002),w-.02,w,-h,h,d,K.rubber);}
 g.bend=0;g.defPart=0;reveal(g,{z0:-w+e,z1:w-e,y0:p0,y1:p1},-t,t,COL.door);for(const z of [-w,w])g.quad([-t,-h,z],[t,-h,z],[t,h,z],[-t,h,z],K.rubber,[0,0,0]);
 return g.build();}

// ---------------------------------------------------------------- glass + the soft contact shadow: ONE transparent instanced mesh
/** Every pane of every near car (the side windows, the windscreen, the partition glass), every door leaf's pane and each car's
 *  contact shadow are instances of ONE small geometry in ONE draw: a unit pane (x = 0 plane, both faces, a blue-grey sheen in
 *  vertex colour + alpha) and a unit feathered shadow (y = −0.5 plane, alpha fading to 0 at its edges). A pane instance squashes x
 *  (the shadow part collapses to an invisible sliver on the pane's bottom edge), a shadow instance squashes y (the pane collapses
 *  into the shadow's plane). Material: the vehicle material's program with transparency (a clone: blending, no depth write). */
const SQUASH=1e-4;
/** The shadow lies 12 mm over the sleeper tops (a continuous deck on the sea trestle, the sleepers on land), no wider than the deck. */
const SHADOW_Y=.2-RAIL_TOP+.012,SHADOW_HALF=1.15,SHADOW_CORE=.78,SHADOW_LEN=12.3;
function glassGeometry(){
 const p:number[]=[],n:number[]=[],c:number[]=[],a:number[]=[],cl=new T.Color();
 const vtx=(x:number,y:number,z:number,nx:number,ny:number,nz:number,hex:string,al:number)=>{cl.set(hex);p.push(x,y,z);n.push(nx,ny,nz);c.push(cl.r,cl.g,cl.b,al);a.push(0,0,0,0);};
 // the pane: top edge lighter (the sky), a diagonal sheen; front (+x) and back (−x) faces
 const corner=[[.5,-.5,'#d6e8f0',.5],[.5,.5,'#a8c0cd',.44],[-.5,.5,'#738c9b',.36],[-.5,-.5,'#88a2b1',.4]] as const;// [y, z, colour, alpha]
 for(const d of [1,-1]){const ord=d>0?[0,3,2,0,2,1]:[0,1,2,0,2,3];for(const k of ord){const [y,z,h,al]=corner[k];vtx(0,y,z,d,d>0?0:.6,0,h,d>0?al:al*.55);}}// inside: clearer, lit
 // the shadow: a 4×4 grid, alpha .32 in the core, 0 at the edges
 const xs=[-.5,-SHADOW_CORE/SHADOW_HALF/2,SHADOW_CORE/SHADOW_HALF/2,.5],zs=[-.5,-.5+.35/SHADOW_LEN,.5-.35/SHADOW_LEN,.5];
 const al=(i:number,j:number)=>i===0||i===3||j===0||j===3?0:.32;
 for(let i=0;i<3;i++)for(let j=0;j<3;j++){const q=[[i,j],[i,j+1],[i+1,j+1],[i,j],[i+1,j+1],[i+1,j]] as const;for(const [u,v] of q)vtx(xs[u],-.5,zs[v],0,1,0,'#3b3129',al(u,v));}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('normal',new T.Float32BufferAttribute(n,3));
 g.setAttribute('color',new T.Float32BufferAttribute(c,4));g.setAttribute('aPart',new T.Float32BufferAttribute(a,4));g.computeBoundingSphere();return g;}
const _q=new T.Quaternion(),_s=new T.Vector3(),_p=new T.Vector3(),FACE_Z=new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),-Math.PI/2),FACE_NX=new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),Math.PI);
/** A pane's matrix: its +x face (the outside sheen) toward +x, +z (faceZ) or −x (faceNX: the left side's windows). */
const paneM=(x:number,yc:number,zc:number,h:number,w:number,faceZ=false,faceNX=false)=>new T.Matrix4().compose(_p.set(x,yc,zc),faceZ?FACE_Z:faceNX?FACE_NX:_q.identity(),_s.set(SQUASH,h,w));
/** The fixed panes of one car (car-local matrices). */
const CAR_PANES:readonly T.Matrix4[]=[
 ...[-1,1].flatMap(s=>WINDOWS.map(w=>paneM(s*(HALF_W-.025),(w.y0+w.y1)/2,(w.z0+w.z1)/2,w.y1-w.y0,w.z1-w.z0,false,s<0))),
 ...SCREEN.map(h=>paneM((h.z0+h.z1)/2,(h.y0+h.y1)/2,5.985,h.y1-h.y0,h.z1-h.z0,true)),
 ...PART_WINS.map(h=>paneM((h.z0+h.z1)/2,(h.y0+h.y1)/2,CAB_Z+.025,h.y1-h.y0,h.z1-h.z0,true))];
const SHADOW_M=new T.Matrix4().compose(new T.Vector3(0,SHADOW_Y,0),new T.Quaternion(),new T.Vector3(SHADOW_HALF*2,SQUASH,SHADOW_LEN));
const DOOR_PANE_M=(()=>{const yc=(DOOR_Y0+DOOR_Y1)/2;return paneM(0,(DOOR_PANE[0]+DOOR_PANE[1])/2-yc,0,DOOR_PANE[1]-DOOR_PANE[0],DOOR_HALF-2*DOOR_EDGE);})();
/** The shared glass + shadow mesh. Per frame: begin(); shadow(car matrix) for every drawn car; car(car matrix) for the near tier;
 *  door(leaf matrix) for every drawn leaf; end(). Allocation-free. */
export function createTrainGlass(cars:number,doorLeaves:number){
 const look=createVehicleMaterial(),mat=look.material;mat.transparent=true;mat.depthWrite=false;mat.roughness=.18;mat.metalness=.05;mat.name='train-glass';
 const geo=glassGeometry(),mesh=new T.InstancedMesh(geo,mat,cars*(CAR_PANES.length+1)+doorLeaves);
 mesh.name='train-glass';mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);mesh.castShadow=false;mesh.receiveShadow=false;mesh.frustumCulled=false;mesh.visible=false;mesh.count=0;mesh.renderOrder=2;
 const tmp=new T.Matrix4();let n=0;
 const put=(m:T.Matrix4,l:T.Matrix4)=>{if(n<mesh.instanceMatrix.count){tmp.multiplyMatrices(m,l);mesh.setMatrixAt(n++,tmp);}};
 return {mesh,look,
  begin(){n=0;},
  shadow(m:T.Matrix4){put(m,SHADOW_M);},
  /** skip: −1 / +1 leaves out that side's window panes (the Inside view's lowered wall), 0 none. */
  car(m:T.Matrix4){for(let i=0;i<CAR_PANES.length;i++)put(m,CAR_PANES[i]);},
  door(m:T.Matrix4){put(m,DOOR_PANE_M);},
  end(){if(mesh.count!==n)mesh.count=n;const v=n>0;if(mesh.visible!==v)mesh.visible=v;if(v)mesh.instanceMatrix.needsUpdate=true;},
  warm(on:boolean){mesh.visible=on;mesh.count=on?1:0;},
  prime(m:T.Matrix4){mesh.visible=true;mesh.count=1;mesh.setMatrixAt(0,m);mesh.instanceMatrix.needsUpdate=true;},
  dispose(){geo.dispose();mat.dispose();mesh.dispose();},
 };
}
export type TrainGlass=ReturnType<typeof createTrainGlass>;
