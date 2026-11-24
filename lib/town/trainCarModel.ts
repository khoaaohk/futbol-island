/**
 * The Island Line car model (split out of trainRunning.ts on Nov 24 2026 so the look and the gameplay can be worked on apart).
 * Pure geometry builders in the road traffic's vehicle-material format (lib/graphics/trafficVehicles.ts: vertex colours, aPart =
 * pivot xyz + part id). No scene, no per-frame state: trainRunning.ts builds the meshes and moves them.
 */
import * as T from 'three';
import {PART} from '../graphics/trafficVehicles';
import type {Livery} from './trainLiveries';

/** Track geometry the cars sit on (trainWorld.ts values: rail top above the bed, ballast top). */
export const RAIL_TOP=.34,BALLAST_TOP=.12;
export const WHEEL_R=.43,BOGIE_HALF=4.5,HALF_W=1.4,BODY_Y0=1.05,SPLIT_Y=2.05,SIDE_TOP=3.1,ROOF_TOP=3.75;
export const DOORS=[-3.7,-.2,3.1],DOOR_HALF=.65,DOOR_Y0=1.12,DOOR_Y1=3.02,WIN_Y0=2.18,WIN_Y1=3.0;
/** Phase 3 (riding): the window runs between the doors (car-local z), shared by the panes, the open variant's holes and the seats. */
export const WIN_RUNS:readonly [number,number][]=[[-5.75,DOORS[0]-DOOR_HALF-.25],[DOORS[0]+DOOR_HALF+.25,DOORS[1]-DOOR_HALF-.25],[DOORS[1]+DOOR_HALF+.25,DOORS[2]-DOOR_HALF-.25]];
export const CAR_FLOOR_Y=1.15;
export const BENCH_HALF_D=.325,BENCH_X=HALF_W-.04-BENCH_HALF_D;
export const COL={glass:'#3b424b',screen:'#1b232b',interior:'#2a2b30',dark:'#1f2022',under:'#2f3135',metal:'#8d9297',head:'#fff1c2',tail:'#c93a2c',dest:'#d99a2e',
 gold:'#d9b45a',white:'#f7f4ea',black:'#1d1d1d',shadow:'#34322e',door:'#c9ccd0',yellow:'#f2c230',lamp:'#b8281f',post:'#26231f'} as const;

// ---------------------------------------------------------------- a vertex-colour builder in the vehicle material's format
export type V=[number,number,number];
export class VGeo{
 p:number[]=[];n:number[]=[];c:number[]=[];a:number[]=[];private col=new T.Color();
 tri(p:V,q:V,r:V,color:string,inside:V,part=0,ctr:V=[0,0,0]){
  const ux=q[0]-p[0],uy=q[1]-p[1],uz=q[2]-p[2],vx=r[0]-p[0],vy=r[1]-p[1],vz=r[2]-p[2];let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;const l=Math.hypot(nx,ny,nz)||1;nx/=l;ny/=l;nz/=l;
  const flip=nx*(p[0]-inside[0])+ny*(p[1]-inside[1])+nz*(p[2]-inside[2])<0;if(flip){nx=-nx;ny=-ny;nz=-nz;}
  this.col.set(color);for(const v of flip?[p,r,q]:[p,q,r]){this.p.push(v[0],v[1],v[2]);this.n.push(nx,ny,nz);this.c.push(this.col.r,this.col.g,this.col.b);this.a.push(ctr[0],ctr[1],ctr[2],part);}}
 quad(p:V,q:V,r:V,s:V,color:string,inside:V,part=0,ctr?:V){this.tri(p,q,r,color,inside,part,ctr);this.tri(p,r,s,color,inside,part,ctr);}
 /** Axis-aligned box (centre, half sizes); the underside only when asked. */
 box(x:number,y:number,z:number,hx:number,hy:number,hz:number,color:string,part=0,ctr?:V,bottom=false){
  const P=(a:number,b:number,c:number):V=>[x+hx*a,y+hy*b,z+hz*c],C:V=[x,y,z],f=(a:V,b:V,c:V,d:V)=>this.quad(a,b,c,d,color,C,part,ctr);
  f(P(-1,1,-1),P(1,1,-1),P(1,1,1),P(-1,1,1));if(bottom)f(P(-1,-1,-1),P(1,-1,-1),P(1,-1,1),P(-1,-1,1));
  f(P(-1,-1,-1),P(1,-1,-1),P(1,1,-1),P(-1,1,-1));f(P(-1,-1,1),P(1,-1,1),P(1,1,1),P(-1,1,1));f(P(-1,-1,-1),P(-1,1,-1),P(-1,1,1),P(-1,-1,1));f(P(1,-1,-1),P(1,1,-1),P(1,1,1),P(1,-1,1));}
 /** A flat panel facing +z / −z (dir) at depth z. */
 panelZ(x:number,y:number,z:number,hw:number,hh:number,dir:number,color:string,part=0){this.quad([x-hw,y-hh,z],[x+hw,y-hh,z],[x+hw,y+hh,z],[x-hw,y+hh,z],color,[x,y,z-dir],part);}
 /** A flat panel facing +x / −x (dir) at x, spanning z0…z1 and y0…y1. */
 panelX(x:number,z0:number,z1:number,y0:number,y1:number,dir:number,color:string,part=0){this.quad([x,y0,z0],[x,y0,z1],[x,y1,z1],[x,y1,z0],color,[x-dir,(y0+y1)/2,(z0+z1)/2],part);}
 /** A disc facing +z at depth z. */
 discZ(x:number,y:number,z:number,r:number,color:string,part=0,sides=8){for(let k=0;k<sides;k++){const a=k/sides*Math.PI*2+Math.PI/2,b=(k+1)/sides*Math.PI*2+Math.PI/2;this.tri([x,y,z],[x+Math.cos(a)*r,y+Math.sin(a)*r,z],[x+Math.cos(b)*r,y+Math.sin(b)*r,z],color,[x,y,z-1],part);}}
 /** A wheel on the x axis (tread + outer cap), spinning about its own centre (PART.rearWheel, pivot in aPart). */
 wheel(x:number,az:number,color:string){const N=8,s=Math.sign(x),xo=x+s*.06,xi=x-s*.06,ctr:V=[x,WHEEL_R,az],R=(k:number,px:number):V=>{const t=(k+.5)/N*Math.PI*2;return [px,WHEEL_R+Math.cos(t)*WHEEL_R,az+Math.sin(t)*WHEEL_R];};
  for(let k=0;k<N;k++){this.quad(R(k,xi),R(k+1,xi),R(k+1,xo),R(k,xo),color,ctr,PART.rearWheel,ctr);if(k>0&&k<N-1)this.tri(R(0,xo),R(k,xo),R(k+1,xo),color,[xi,WHEEL_R,az],PART.rearWheel,ctr);}}
 beam(a:V,b:V,r:number,color:string){const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],l=Math.hypot(dx,dy,dz)||1e-6,d=[dx/l,dy/l,dz/l];
  const up=Math.abs(d[1])>.9?[1,0,0]:[0,1,0],s1=[d[1]*up[2]-d[2]*up[1],d[2]*up[0]-d[0]*up[2],d[0]*up[1]-d[1]*up[0]],l1=Math.hypot(s1[0],s1[1],s1[2]);for(let i=0;i<3;i++)s1[i]/=l1;
  const s2=[d[1]*s1[2]-d[2]*s1[1],d[2]*s1[0]-d[0]*s1[2],d[0]*s1[1]-d[1]*s1[0]],c:V=[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2];
  const P=(e:V,i:number,j:number):V=>[e[0]+(s1[0]*i+s2[0]*j)*r,e[1]+(s1[1]*i+s2[1]*j)*r,e[2]+(s1[2]*i+s2[2]*j)*r];
  for(const [i,j,k,m] of [[1,1,1,-1],[1,-1,-1,-1],[-1,-1,-1,1],[-1,1,1,1]])this.quad(P(a,i,j),P(b,i,j),P(b,k,m),P(a,k,m),color,c);}
 build(){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(this.p,3));g.setAttribute('normal',new T.Float32BufferAttribute(this.n,3));
  g.setAttribute('color',new T.Float32BufferAttribute(this.c,3));g.setAttribute('aPart',new T.Float32BufferAttribute(this.a,4));g.computeBoundingSphere();return g;}
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
/** open (Phase 3): the variant drawn while someone rides the train: the window runs are holes (no glass), with a cream inside
 *  (inner walls, ceiling, floor, ends) and blue bench seats, so riders are seen through the windows. Same material and program. */
export function buildCarGeometry(lv:Livery,open=false){
 const g=new VGeo();
 const prof:[number,number][]=[[-HALF_W,BODY_Y0],[-HALF_W,SPLIT_Y],[-HALF_W,SIDE_TOP],[-1.33,3.4],[-1.08,3.6],[-.58,3.72],[0,ROOF_TOP],[.58,3.72],[1.08,3.6],[1.33,3.4],[HALF_W,SIDE_TOP],[HALF_W,SPLIT_Y],[HALF_W,BODY_Y0]];
 const segColor=(ya:number,yb:number)=>Math.max(ya,yb)<=SPLIT_Y+.01?lv.lower:Math.min(ya,yb)>=3.39?lv.roof:lv.upper;
 const rings:[number,number][]=[[-6,.985],[-5.9,1],[5.62,1],[5.88,.95],[6,.86]];// z, width (the cab end narrows: rounded corners from above)
 for(let r=0;r<rings.length-1;r++){const [z0,k0]=rings[r],[z1,k1]=rings[r+1];
  for(let k=0;k<prof.length-1;k++){const [xa,ya]=prof[k],[xb,yb]=prof[k+1];if(open&&r===1&&(k===1||k===prof.length-3))continue;// the window band: holes, below
   g.quad([xa*k0,ya,z0],[xb*k0,yb,z0],[xb*k1,yb,z1],[xa*k1,ya,z1],segColor(ya,yb),[0,2.4,(z0+z1)/2]);}}
 // ends: two colour bands and the roof cap (cab +z narrowed; gangway end −z)
 for(const [z,k] of [[6,.86],[-6,.985]] as const){const w=HALF_W*k,inside:V=[0,2.4,z-Math.sign(z)];
  g.quad([-w,BODY_Y0,z],[w,BODY_Y0,z],[w,SPLIT_Y,z],[-w,SPLIT_Y,z],lv.lower,inside);g.quad([-w,SPLIT_Y,z],[w,SPLIT_Y,z],[w,SIDE_TOP,z],[-w,SIDE_TOP,z],lv.upper,inside);
  for(let i=2;i<prof.length-3;i++)g.tri([0,SIDE_TOP,z],[prof[i][0]*k,prof[i][1],z],[prof[i+1][0]*k,prof[i+1][1],z],z>0?lv.upper:lv.roof,inside);}
 g.quad([-HALF_W,BODY_Y0,-6],[HALF_W,BODY_Y0,-6],[HALF_W*.86,BODY_Y0,6],[-HALF_W*.86,BODY_Y0,6],COL.under,[0,3,0]);
 if(true){const z=-6.004;g.panelZ(0,2.05,z,.45,.98,-1,'#3b3c40');g.panelZ(0,2.62,z-.003,.3,.33,-1,COL.glass,PART.left);}// gangway door
 // sides: stripes, window band (glows at night: the indicator channel), dark doorways under the door leaves, the cab's side window
 for(const s of [-1,1]){const x=s*(HALF_W+.006);
  for(const [y,h,c] of lv.stripes)g.panelX(x,-5.9,5.62,y-h/2,y+h/2,s,c);
  const runs:[number,number][]=[[-5.75,DOORS[0]-DOOR_HALF-.25],[DOORS[0]+DOOR_HALF+.25,DOORS[1]-DOOR_HALF-.25],[DOORS[1]+DOOR_HALF+.25,DOORS[2]-DOOR_HALF-.25]];
  if(!open)for(const [a,b] of runs){const n=Math.max(1,Math.round((b-a)/1.15)),w=(b-a)/n;for(let k=0;k<n;k++)g.panelX(s*(HALF_W+.01),a+k*w+.07,a+(k+1)*w-.07,WIN_Y0,WIN_Y1,s,COL.glass,PART.left);}
  g.panelX(s*(HALF_W+.01),4.95,5.57,2.25,2.95,s,COL.screen);
  for(const zc of DOORS)g.panelX(s*(HALF_W+.004),zc-DOOR_HALF,zc+DOOR_HALF,DOOR_Y0,DOOR_Y1,s,COL.interior);}
 if(open)openInside(g,lv);
 // cab front: windscreen (two panes in a dark frame), lit destination plate, headlamps (high), tail lamps (low), stripes,
 // headmark (A: our ball emblem in a gold ring; B/C a plain round plate) and the number plate, grab rail, skirt, couplers
 {const z=6.004;g.panelZ(0,2.74,z,1.06,.46,1,COL.dark);g.panelZ(-.525,2.74,z+.003,.475,.4,1,COL.screen);g.panelZ(.525,2.74,z+.003,.475,.4,1,COL.screen);
  g.panelZ(0,3.43,z,.62,.15,1,COL.dark);g.panelZ(0,3.43,z+.003,.58,.11,1,COL.dest,PART.head);
  for(const [y,h,c] of lv.stripes)g.panelZ(0,y,z,1.2,h/2,1,c);
  for(const x of [-.86,.86]){g.discZ(x,3.42,z+.004,.12,COL.head,PART.head);g.panelZ(x*1.18,1.42,z+.003,.09,.06,1,COL.tail,PART.brake);}
  if(lv.emblem){g.discZ(0,1.66,z+.004,.24,COL.gold);g.discZ(0,1.66,z+.007,.2,COL.white);g.discZ(0,1.66,z+.01,.075,COL.black,0,5);}
  else g.discZ(0,1.66,z+.004,.2,lv.upper);
  g.panelZ(0,1.3,z+.004,.3,.085,1,COL.white);plateText(g,lv.plate,0,1.3,z+.008,.11);
  g.beam([-.5,2.12,6.06],[.5,2.12,6.06],.025,COL.metal);
  g.quad([-1.15,BODY_Y0,6.0],[1.15,BODY_Y0,6.0],[1.0,.42,6.2],[-1.0,.42,6.2],COL.dark,[0,.7,5]);
  g.box(0,.72,6.25,.14,.12,.25,COL.dark);g.box(0,.72,-6.2,.14,.12,.22,COL.dark);g.box(0,.86,0,1.15,.2,2.6,COL.under);}
 // bogies (frame + four spinning wheels each)
 for(const bz of [-BOGIE_HALF,BOGIE_HALF]){g.box(0,.62,bz,1.0,.16,1.35,COL.under);for(const az of [bz-1.05,bz+1.05])for(const x of [-.68,.68])g.wheel(x,az,COL.dark);}
 // roof: two cooler boxes and a single-arm pantograph
 {for(const z of [-2.6,1.4])g.box(0,ROOF_TOP+.12,z,.55,.14,.8,COL.metal);const pz=-.6,y=ROOF_TOP+.05,m=COL.metal;g.box(0,y+.04,pz,.55,.05,.45,m);
  g.beam([0,y+.1,pz-.3],[0,4.3,pz+1.0],.04,m);g.beam([0,4.3,pz+1.0],[0,4.78,pz-.1],.03,m);g.beam([-.8,4.8,pz-.1],[.8,4.8,pz-.1],.035,m);}
 // a dark contact strip on the ballast under the car (the fake shadow: no shadow pass)
 {const y=BALLAST_TOP-RAIL_TOP+.015;g.quad([-1.62,y,-6.1],[1.62,y,-6.1],[1.62,y,6.1],[-1.62,y,6.1],COL.shadow,[0,y-1,0]);}
 return {geometry:g.build(),triangles:g.tris};
}
/** The open variant's wall band with window holes, the inside faces (they face inward: seen through the holes) and the benches. */
function openInside(g:VGeo,lv:Livery){
 const z0=-5.9,z1=5.62,iw=HALF_W-.04,wall='#ece5d3',ceil='#f6f2e8',floor='#7d8188',seat='#3d6db3',out:V=[0,2.4,0];
 // The solid pieces of the window band between z0 and z1 (outside: the livery's upper colour; inside: cream).
 const solid:[number,number][]=[];let z=z0;for(const [a,b] of WIN_RUNS){if(a>z)solid.push([z,a]);z=b;}solid.push([z,z1]);
 for(const s of [-1,1]){const x=s*HALF_W,xi=s*iw,inn:V=[s*(HALF_W+2),2.4,0];// "inside" points beyond the wall: inner faces face the aisle
  g.quad([x,SPLIT_Y,z0],[x,WIN_Y0,z0],[x,WIN_Y0,z1],[x,SPLIT_Y,z1],lv.upper,out);g.quad([x,WIN_Y1,z0],[x,SIDE_TOP,z0],[x,SIDE_TOP,z1],[x,WIN_Y1,z1],lv.upper,out);
  for(const [a,b] of solid)g.quad([x,WIN_Y0,a],[x,WIN_Y1,a],[x,WIN_Y1,b],[x,WIN_Y0,b],lv.upper,out);
  g.quad([xi,CAR_FLOOR_Y,z0],[xi,WIN_Y0,z0],[xi,WIN_Y0,z1],[xi,CAR_FLOOR_Y,z1],wall,inn);g.quad([xi,WIN_Y1,z0],[xi,SIDE_TOP,z0],[xi,SIDE_TOP,z1],[xi,WIN_Y1,z1],wall,inn);
  for(const [a,b] of solid)g.quad([xi,WIN_Y0,a],[xi,WIN_Y1,a],[xi,WIN_Y1,b],[xi,WIN_Y0,b],wall,inn);
  // window reveals (the wall's thickness round each hole): sills and heads
  for(const [a,b] of WIN_RUNS){g.quad([x,WIN_Y0,a],[xi,WIN_Y0,a],[xi,WIN_Y0,b],[x,WIN_Y0,b],wall,[s*1.2,WIN_Y0-1,(a+b)/2]);g.quad([x,WIN_Y1,a],[xi,WIN_Y1,a],[xi,WIN_Y1,b],[x,WIN_Y1,b],wall,[s*1.2,WIN_Y1+1,(a+b)/2]);}
  // the benches (seat, front and ends; the long side runs 1 and 2 carry riders, run 0 is a short end bench)
  for(const [a,b] of WIN_RUNS)g.box(s*BENCH_X,CAR_FLOOR_Y+.32,(a+b)/2,BENCH_HALF_D,.32,(b-a)/2,seat);}
 g.quad([-iw,SIDE_TOP,z0],[iw,SIDE_TOP,z0],[iw,SIDE_TOP,z1],[-iw,SIDE_TOP,z1],ceil,[0,SIDE_TOP+1,0]);
 g.quad([-iw,CAR_FLOOR_Y,z0],[iw,CAR_FLOOR_Y,z0],[iw,CAR_FLOOR_Y,z1],[-iw,CAR_FLOOR_Y,z1],floor,[0,CAR_FLOOR_Y-1,0]);
 for(const [ze,dir] of [[z0+.04,1],[z1-.04,-1]] as const)g.quad([-iw,CAR_FLOOR_Y,ze],[iw,CAR_FLOOR_Y,ze],[iw,SIDE_TOP,ze],[-iw,SIDE_TOP,ze],wall,[0,2.2,ze-dir]);
}
/** The far tier: one box per car (12 triangles), two-tone from its vertex colours. */
export function buildCarBox(lv:Livery){
 const g=new VGeo(),lo=new T.Color(lv.lower),hi=new T.Color(lv.upper);g.box(0,(BODY_Y0+ROOF_TOP)/2,0,HALF_W,(ROOF_TOP-BODY_Y0)/2,6,lv.upper,0,undefined,true);
 const pos=g.p,col=g.c;for(let i=0;i<pos.length/3;i++){const c=pos[i*3+1]<2?lo:hi;col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;}
 return g.build();
}
/** One door leaf (silver, with a window that glows at night), facing +x, centred on its closed spot. */
export function buildDoorLeaf(){const g=new VGeo(),h=(DOOR_Y1-DOOR_Y0)/2,w=DOOR_HALF/2,yc=(DOOR_Y0+DOOR_Y1)/2;g.panelX(0,-w,w,-h,h,1,COL.door);g.panelX(.004,-w+.07,w-.07,2.25-yc,2.95-yc,1,COL.glass,PART.left);return g.build();}

