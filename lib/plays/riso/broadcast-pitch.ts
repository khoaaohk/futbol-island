/** Broadcast-pitch kit for iconic-play card films — shared by the films that import it (bale-overhead-2018, park-portugal-2002,
 * tonali-debut-2023, adeyemi-celtic-2024, pepe-signature, elliot-anderson-signature). Not a film (exports no `default`).
 *
 * Generalised from the gary-neville-signature film's 3D TV framework so each film only authors its moment (actors, ball, cameras, kits,
 * its own stadium spec): a pinhole camera through athlete.ts's makeCamera over a real-size pitch in metres (RIGHT-handed, y up — exactly
 * athlete.ts's convention, so strike({foot:'l'}) is the LEFT foot), a spec-driven stadium bowl (stands, tiers, roof, running track, crowd
 * colours, day or floodlit night), the grass/lines/boards, a goal with a net bulge, ONE figure adapter (drawPlayer → drawAthlete) with a
 * heat cap, Hermite actor tracks, shot blending for camera plans, teaching marks (ground arrows/rings/ribbons), and the narration
 * estimate used until the Kokoro timing exists.
 *
 * Pitch convention: the ATTACKED goal line is x = 0 (the attacking team runs toward +x), goal centre z = 0, touchlines z = ±34, halfway
 * x = −52.5; +z is the attacking team's RIGHT. Stand 0 is on the +z side, 1 behind the attacked goal (+x), 2 on the −z side, 3 the far end.
 * Everything is a pure function of its inputs (seeded hashes, no Math.random, no clock). */
import type {Sheet} from '../../paths/riso/sheet';
import {PASSAGE} from '../../paths/riso/passage';
import {TAU,twos,sm,clamp,lerp,hash,polyPath,ribbon,easeInOutSine,type Pt} from '../../paths/riso/motion';
import {footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,runCycle,stand,posed,blendPose,solve,strike,STRIKE_CONTACT,type Build,type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3} from './athlete';

export type {Pose,Camera,AthleteStyle,Place,InkFill,V3};
/** the film's four ink names by role: Y light (floodlights, highlights), R warm, B cool (sky, grass with Y), K key (navy) */
export type Pal={Y:string;R:string;B:string;K:string};

// ---------------------------------------------------------------- vectors
export const add3=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
export const sub3=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
export const mul3=(a:V3,k:number):V3=>[a[0]*k,a[1]*k,a[2]*k];
export const mix3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
export const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
export const len3=(a:V3)=>Math.hypot(a[0],a[1],a[2]);
export const wrap=(a:number)=>{while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;return a;};
export const lerpAng=(a:number,b:number,u:number)=>a+wrap(b-a)*u;
/** yaw (athlete.ts: 0 faces +x, + turns left) facing the ground direction (dx,dz) */
export const yawTo=(dx:number,dz:number)=>Math.atan2(-dz,dx);
export const nrm2=(x:number,z:number):[number,number]=>{const l=Math.hypot(x,z)||1;return[x/l,z/l];};
export const win=(t:number,a:number,b:number,e=.15)=>sm(a,a+e,t)*(1-sm(b-e,b,t));

// ---------------------------------------------------------------- framing (the FULL sheet, never the path stories' safe region)
/** a narrower (square) window gets a slightly wider lens so the action still fits; set by frame(), read by every camera (also aperture()) */
let LENS=1;
/** Frame the FULL sheet: world (0,0) on the canvas centre at 1 unit per sheet unit (the passage arrival scale still multiplies in). */
export function frame(s:Sheet){const S=s.arrival;s.camera((s.cx-s.W/2)/S,(s.cy-s.H/2)/S,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
/** half the visible extents with margin for the .68 passage preview */
export const view=(s:Sheet)=>({hx:s.W/(2*.68)+120,hy:s.H/(2*.68)+120});

// ---------------------------------------------------------------- projection
export type Cam=Camera;
export const NEAR=.4;
export function toCam(c:Cam,P:V3):V3{const d:V3=[P[0]-c.eye[0],P[1]-c.eye[1],P[2]-c.eye[2]];return[dot3(d,c.r),dot3(d,c.u),dot3(d,c.f)];}
export const scr=(c:Cam,q:V3):Pt=>[c.center[0]+c.F*q[0]/q[2],c.center[1]-c.F*q[1]/q[2]];
export function pr(c:Cam,P:V3):Pt|null{const q=toCam(c,P);return q[2]<NEAR?null:scr(c,q);}
export const kAt=(c:Cam,P:V3)=>c.F/Math.max(NEAR,toCam(c,P)[2]);
export function polyP(c:Cam,pts:V3[]):Pt[]{const q=pts.map(p=>toCam(c,p)),out:V3[]=[];
 for(let i=0;i<q.length;i++){const a=q[i],b=q[(i+1)%q.length],ia=a[2]>=NEAR,ib=b[2]>=NEAR;if(ia)out.push(a);if(ia!==ib){const k=(NEAR-a[2])/(b[2]-a[2]);out.push([a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,NEAR]);}}
 return out.map(p=>scr(c,p));}
export const addPoly=(path:Path2D,q:Pt[])=>{if(q.length>2)path.addPath(polyPath(q,true));};
/** a 3D segment as a projected quad (clipped to the near plane); width in metres */
export function seg3(c:Cam,a:V3,b:V3,wm:number,out:Path2D,minW=1.1){let qa=toCam(c,a),qb=toCam(c,b);if(qa[2]<NEAR&&qb[2]<NEAR)return;
 const cut=(p:V3,q:V3):V3=>{const k=(NEAR-p[2])/(q[2]-p[2]);return[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k,NEAR];};if(qa[2]<NEAR)qa=cut(qa,qb);else if(qb[2]<NEAR)qb=cut(qb,qa);
 const A=scr(c,qa),Bp=scr(c,qb),wa=Math.max(minW,c.F*wm/qa[2]/2),wb=Math.max(minW,c.F*wm/qb[2]/2),dx=Bp[0]-A[0],dy=Bp[1]-A[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 out.moveTo(A[0]+nx*wa,A[1]+ny*wa);out.lineTo(Bp[0]+nx*wb,Bp[1]+ny*wb);out.lineTo(Bp[0]-nx*wb,Bp[1]-ny*wb);out.lineTo(A[0]-nx*wa,A[1]-ny*wa);out.closePath();}
export const cam3=(pos:V3,target:V3,fov:number)=>makeCamera({pos,target,fov,size:1080*LENS});

// ---------------------------------------------------------------- the stadium (spec-driven)
export type StadiumSpec={
 pal:Pal;
 /** distance of the side stands' front from the pitch centre line (touchline is 34); ends: from the goal line */
 side:number;end:number;
 /** how far each stand rakes back and up (m) */
 rake:number;height:number;
 /** tier fascias (fractions up the rake) */
 tiers:number[];
 /** a roof over the stands (a deck sloping in from the rim) */
 roof:boolean;
 /** a running track ring between the pitch and the stands (athletics stadiums) */
 track?:string|null;
 /** evening under floodlights (navy printed sky, lamp halos) or daylight */
 night:boolean;
 /** seat screens under the crowd */
 seats:InkFill[];
 /** crowd inks (index by crowd()) — 'paper' = knocked out */
 crowdInks:InkFill[];
 /** crowd ink index for stand si, position a along it, h/hb seeded hashes */
 crowd:(si:number,a:number,h:number,hb:number)=>number;
 /** advertising-board ink */
 boards:string;
 /** night sky tint over the navy (default the cool ink B; null = navy only) */
 sky?:string|null;
 /** optional: a solid ink block on one end (the Yellow Wall) — stand index + ink + coverage */
 wall?:{stand:number;ink:string;cov:number};
};
export function stands(sp:StadiumSpec):((a:number,b:number)=>V3)[]{
 const{side:S,end:E,rake:R0,height:H}=sp,x0=-105-E,x1=E;
 return[
  (a,b)=>[lerp(x0,x1,a),1.3+H*b,S+R0*b],
  (a,b)=>[x1+R0*.85*b,1.3+H*.92*b,lerp(-S+4,S-4,a)],
  (a,b)=>[lerp(x1,x0,a),1.3+H*b,-S-R0*b],
  (a,b)=>[x0-R0*.85*b,1.3+H*.92*b,lerp(S-4,-S+4,a)],
 ];
}
const CORNERS:[number,number,number,number][]=[[0,1,1,1],[1,0,2,0],[2,1,3,1],[3,0,0,0]];
export function stadium(s:Sheet,c:Cam,sp:StadiumSpec,t:number,which:number[],o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,{Y,R,B,K}=sp.pal,v=view(s),tt=twos(t),ST=stands(sp),cols=[104,72,104,72],rows=15;
 // sky
 if(sp.night){const sky=sp.sky===undefined?B:sp.sky;s.field(K,sky?.72:.82,.5);if(sky)s.field(sky,.3,.6);}else s.field(B,.16,.55);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz){if(sp.night)s.tone(sp.sky===undefined?B:sp.sky??K,polyPath([[-1e4,hz[1]-420],[1e4,hz[1]-420],[1e4,hz[1]+60],[-1e4,hz[1]+60]],true),.3);else s.tone(Y,polyPath([[-1e4,hz[1]-480],[1e4,hz[1]-480],[1e4,hz[1]+60],[-1e4,hz[1]+60]],true),.14);}
 const planes=new Path2D(),tier=new Path2D(),roof=new Path2D(),under=new Path2D(),edge=new Path2D(),lamps=new Path2D();
 const lampAt:V3[]=[];
 for(const i of which){const Sf=ST[i];addPoly(planes,polyP(c,[Sf(0,0),Sf(1,0),Sf(1,1),Sf(0,1)]));for(const b of sp.tiers)seg3(c,Sf(0,b),Sf(1,b),1.1,tier);
  if(sp.roof){addPoly(roof,polyP(c,[add3(Sf(0,1),[0,3,0]),add3(Sf(1,1),[0,3,0]),add3(Sf(1,.62),[0,17,0]),add3(Sf(0,.62),[0,17,0])]));
   addPoly(under,polyP(c,[add3(Sf(0,1),[0,1.2,0]),add3(Sf(1,1),[0,1.2,0]),add3(Sf(1,.62),[0,15.6,0]),add3(Sf(0,.62),[0,15.6,0])]));
   seg3(c,add3(Sf(0,.62),[0,16.8,0]),add3(Sf(1,.62),[0,16.8,0]),.8,edge);
   if(sp.night)for(let k=1;k<10;k++)lampAt.push(add3(Sf(k/10,.62),[0,16.2,0]));}
  else if(sp.night)for(let k=1;k<6;k++)lampAt.push(add3(Sf(k/6,1),[0,6,0]));}
 for(const[i,ai,j,aj] of CORNERS){if(!which.includes(i)&&!which.includes(j))continue;const A=ST[i],Bs=ST[j];
  addPoly(planes,polyP(c,[A(ai,0),Bs(aj,0),Bs(aj,1),A(ai,1)]));
  if(sp.roof)addPoly(roof,polyP(c,[add3(A(ai,1),[0,3,0]),add3(Bs(aj,1),[0,3,0]),add3(Bs(aj,.62),[0,17,0]),add3(A(ai,.62),[0,17,0])]));}
 s.knockout(planes);for(const f of sp.seats){const q=inkOf(f);if(q)s.tone(q[0],planes,q[1]);}s.knockout(tier,.85);
 if(sp.wall&&which.includes(sp.wall.stand)){const Sf=ST[sp.wall.stand],w=new Path2D();addPoly(w,polyP(c,[Sf(.04,.02),Sf(.96,.02),Sf(.96,.98),Sf(.04,.98)]));s.fill(sp.wall.ink,w,sp.wall.cov);}
 // the crowd: seeded dots sized by distance; the roar lifts them
 const inks=sp.crowdInks.map(()=>new Path2D()),used=sp.crowdInks.map(()=>0);
 for(const si of which){const Sf=ST[si],nc=cols[si];for(let j=0;j<rows;j++){const b=(j+.5)/rows;if(sp.tiers.some(w=>Math.abs(b-w)<.04))continue;
  for(let i=0;i<nc;i++){const h=hash(i*131+j*7919+si*17,13);if(h<.22)continue;const a=(i+.5+(hash(i+j*31,9)-.5)*.6)/nc,P=Sf(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const k=clamp(sp.crowd(si,a,h,hash(i*7+j*53+si*3,21)),0,inks.length-1);inks[k].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);used[k]++;}}}
 sp.crowdInks.forEach((f,k)=>{if(!used[k])return;if(f==='paper')s.knockout(inks[k],.75);else{const q=inkOf(f);if(q)s.fill(q[0],inks[k],q[1]);}});
 if(sp.roof){s.knockout(under);s.tone(K,under,.55);s.knockout(roof,.92);s.tone(B,roof,sp.night?.4:.1);s.knockout(edge,.85);s.stroke(K,edge,1.2,.5);}
 if(sp.night&&lampAt.length){const halo=new Path2D();for(const L of lampAt){const q=toCam(c,L);if(q[2]<NEAR+3)continue;const p=scr(c,q),r=clamp(c.F*3.2/q[2],6,90),w=clamp(c.F*1.1/q[2],3,40);
   if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;halo.addPath(polyPath([[p[0]-r,p[1]],[p[0],p[1]-r*.7],[p[0]+r,p[1]],[p[0],p[1]+r*.7]],true));lamps.rect(p[0]-w,p[1]-w*.5,w*2,w);}
  s.knockout(halo,.4);s.tone(Y,halo,.3);s.knockout(lamps);s.fill(Y,lamps,.6);}
 if(flash>0){const p=new Path2D(),n=Math.round(22*flash);for(let i=0;i<n;i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,ST[si](r2,.1+.8*hash(i,Math.floor(tt*12))));if(!q)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
const inkOf=(f:InkFill):[string,number]|null=>f==null||f==='paper'?null:typeof f==='string'?[f,1]:f;

// ---------------------------------------------------------------- grass, track, lines, boards, corner flags
export function ground(s:Sheet,c:Cam,sp:StadiumSpec){
 const{Y,B,K}=sp.pal,S=sp.side-1,E=sp.end-1;
 if(sp.track){const tp=polyP(c,[[-105-E,0,-S],[E,0,-S],[E,0,S],[-105-E,0,S]]);if(tp.length>2){const p=polyPath(tp,true);s.knockout(p);s.fill(sp.track,p,.62);s.tone(K,p,.12);}}
 const gw=sp.track?[-112,7,39]:[-105-E,E,S];
 const g=polyP(c,[[gw[0],0,-gw[2]],[gw[1],0,-gw[2]],[gw[1],0,gw[2]],[gw[0],0,gw[2]]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.93);s.tone(B,gp,.78);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]));s.tone(K,st,.12);
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([5.4,0,-37.5],[5.4,0,37.5]);board([-110.4,0,-37.5],[-110.4,0,37.5]);board([-110,0,-37.5],[5.4,0,-37.5]);board([-110,0,37.5],[5.4,0,37.5]);
 for(let k=0;k<12;k++){const z=-36+k*6.2;addPoly(pn,polyP(c,[[5.3,.25,z],[5.3,.25,z+3.3],[5.3,.68,z+3.3],[5.3,.68,z]]));}
 for(const zz of[-37.4,37.4])for(let k=0;k<18;k++){const x=-108+k*6.4;addPoly(pn,polyP(c,[[x,.25,zz],[x+3.4,.25,zz],[x+3.4,.68,zz],[x,.68,zz]]));}
 s.knockout(bd);s.fill(sp.boards,bd,.85);s.fill(K,bd,.3);s.knockout(pn,.85);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.12,ln);
 for(let k=0;k<8;k++){L([-k*13.125,0,-34],[-(k+1)*13.125,0,-34]);L([-k*13.125,0,34],[-(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){L([0,0,-34+k*17],[0,0,-34+(k+1)*17]);L([-52.5,0,-34+k*17],[-52.5,0,-34+(k+1)*17]);L([-105,0,-34+k*17],[-105,0,-34+(k+1)*17]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(-52.5,0,9.15);
 for(const[gx,d] of [[0,-1],[-105,1]] as [number,number][]){
  L([gx,0,-20.16],[gx+16.5*d,0,-20.16]);L([gx+16.5*d,0,-20.16],[gx+16.5*d,0,20.16]);L([gx+16.5*d,0,20.16],[gx,0,20.16]);
  L([gx,0,-9.16],[gx+5.5*d,0,-9.16]);L([gx+5.5*d,0,-9.16],[gx+5.5*d,0,9.16]);L([gx+5.5*d,0,9.16],[gx,0,9.16]);
  const a=Math.acos(5.5/9.15);if(d<0)circ(-11,0,9.15,Math.PI-a,Math.PI+a,12);else circ(-94,0,9.15,-a,a,12);
  addPoly(ln,polyP(c,Array.from({length:10},(_,i)=>[gx+11*d+Math.cos(i/10*TAU)*.11,0,Math.sin(i/10*TAU)*.11] as V3)));}
 circ(0,-34,1,Math.PI/2,Math.PI,4);circ(0,34,1,Math.PI,Math.PI*1.5,4);
 s.knockout(ln);
 const pole=new Path2D(),flag=new Path2D();for(const z of[-34,34]){seg3(c,[0,0,z],[0,1.55,z],.05,pole);addPoly(flag,polyP(c,[[0,1.55,z],[0,1.2,z],[-.45,1.38,z]]));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(Y,flag,.95);
}
/** the attacked goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back/roof out around (bz, by) */
export function goal3(s:Sheet,c:Cam,K:string,bulge:number,bz:number,by=1){
 const X=0,z0=-3.66,z1=3.66,H=2.44,back=(z:number,y=1)=>X+2+bulge*.75*Math.exp(-Math.pow((z-bz)/1.6,2))*Math.exp(-Math.pow((y-by)/1.4,2));
 const zs=[z0,-2.6,-1.3,0,1.3,2.6,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0,1.9),1.9,z0],[back(z0,0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1,1.9),1.9,z1],[back(z1,0),0,z1]],
  [[X,H,z0],[X,H,z1],...zs.slice().reverse().map(z=>[back(z,1.9),1.9,z] as V3)],
  [...zs.map(z=>[back(z,0),0,z] as V3),...zs.slice().reverse().map(z=>[back(z,1.9),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.3);s.tone(K,net,.1);
 const mesh=new Path2D();
 for(let i=0;i<=14;i++){const z=lerp(z0,z1,i/14);seg3(c,[X,H,z],[back(z,1.9),1.9,z],.022,mesh,.7);for(let j=0;j<5;j++){const y0=1.9*(1-j/5),y1=1.9*(1-(j+1)/5);seg3(c,[back(z,y0),y0,z],[back(z,y1),y1,z],.022,mesh,.7);}}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<zs.length-1;i++)seg3(c,[back(zs[i],y),y,zs[i]],[back(zs[i+1],y),y,zs[i+1]],.022,mesh,.7);seg3(c,[X,y*H/1.9,z0],[back(z0,y),y,z0],.022,mesh,.7);seg3(c,[X,y*H/1.9,z1],[back(z1,y),y,z1],.022,mesh,.7);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+2*u,H-.54*u,z0],[X+2*u,H-.54*u,z1],.022,mesh,.7);}
 s.fill(K,mesh,.7);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.2,fo);seg3(c,[X,0,z1],[X,H,z1],.2,fo);seg3(c,[X,H,z0-.04],[X,H,z1+.04],.2,fo);
 s.fill(K,fo,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- actors: Hermite tracks [τ, x, z] sampled into 50 Hz tables
export type Track={keys:number[][]};
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const still=(a:number[],b:number[])=>Math.abs(a[1]-b[1])+Math.abs(a[2]-b[2])<1e-6;
 const f=(j:number)=>{const m1=still(k1,k2)||still(k0,k1)?0:(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=still(k1,k2)||still(k2,k3)?0:(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
export function tracks(list:Track[],T0:number,T1:number,DT=.02){
 const TABLES=list.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
 const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
 const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
 const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
 const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.06),b=posOf(k,tau+.06);return[(b[0]-a[0])/.12,(b[1]-a[1])/.12];};
 /** the gait from the track: sprint/jog by speed, phase by distance run; a ready stance with a small shuffle when (nearly) still */
 const loco=(k:number,tau:number):Pose=>{
  const v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),q=clamp(sp/7.5),ph=distOf(k,tau)/(2.3+2.1*q)+k*.37;
  const run=runCycle(ph,{speed:q});if(sp>1.4)return run;
  const idle=blendPose(stand(),READY,.5+.5*Math.sin(tau*1.7+k));
  return blendPose(idle,run,clamp((sp-.25)/1.15));};
 /** face along the run when moving, else toward the target (blended, so turns are continuous) */
 const faceYaw=(k:number,tau:number,target:V3):number=>{
  const v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),p=posOf(k,tau),tx=target[0]-p[0],tz=target[2]-p[1],tl=Math.hypot(tx,tz)||1,w=clamp((sp-.6)/1.6);
  return yawTo(lerp(tx/tl,v[0]/(sp||1),w),lerp(tz/tl,v[1]/(sp||1),w));};
 return{posOf,distOf,velOf,loco,faceYaw};
}
/** where a kicker's pelvis stands so his `foot` boot meets the back of the ball at strike()'s contact, striking along (dx,dz) (solved FK) */
export function kickerAt(ball:V3,dir:[number,number],build:Build,foot:'l'|'r'='r'):[number,number]{const sk=solve(strike(STRIKE_CONTACT,{foot}),build,{x:0,z:0,yaw:yawTo(dir[0],dir[1])}),t=foot==='l'?sk.lToe:sk.rToe;return[ball[0]-dir[0]*.12-t[0],ball[2]-dir[1]*.12-t[2]];}
export const READY=posed({lHipF:20,rHipF:16,lKnee:26,rKnee:22,lean:12,pitch:4,neckP:-8,lShA:20,rShA:18,lElb:40,rElb:36,rAnk:-6,lAnk:-6});
export const DEJECT=posed({lHipF:26,rHipF:26,lKnee:30,rKnee:30,lean:30,pitch:6,neckP:34,lShA:14,rShA:14,lShF:20,rShF:20,lElb:24,rElb:24});

// ---------------------------------------------------------------- figures: the ONE adapter onto athlete.ts
export type State={pose:Pose;place:Place};
/** drawPlayer: athlete.ts figure; prev = one drawn frame earlier (hair / hem secondary motion), smear = motionSmear echo on fast limbs;
 * captain = armband on the left upper arm (yellow); sleeves = a sleeve colour printed over the upper arms (athlete.ts has no sleeve ink). */
export function drawPlayer(s:Sheet,K:string,Y:string,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:State,smear=false,captain=false,sleeves:InkFill=null){
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 const r=drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
 if(r.detail==='low'||!(captain||sleeves))return r;
 const sk=r.sk,cc=toCam(camera,sk.chest);
 if(sleeves){const sl=new Path2D();for(const[sh,el] of [[sk.lSh,sk.lEl],[sk.rSh,sk.rEl]] as [V3,V3][]){if(toCam(camera,mix3(sh,el,.3))[2]<cc[2]+.04)seg3(camera,mix3(sh,el,.06),mix3(sh,el,.44),.13,sl);}
  s.knockout(sl);const q=inkOf(sleeves);if(q)s.fill(q[0],sl,q[1]);s.stroke(K,sl,1.6,.8);}
 if(captain){const a=mix3(sk.lSh,sk.lEl,.3),b=mix3(sk.lSh,sk.lEl,.46),ca=toCam(camera,a);
  if(ca[2]<cc[2]+.06){const band=new Path2D();seg3(camera,a,b,.14,band);s.knockout(band);s.fill(Y,band,.95);s.stroke(K,band,2,.85);}}
 return r;
}
export const BALL_R=.11,GRAV=9.81;
export function drawBall(s:Sheet,c:Cam,pal:Pal,P:V3,rot:number,o:{min?:number;prevP?:V3|null;lines?:boolean}={}){
 const q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??12,c.F*BALL_R/q[2]);
 const sh:Pt[]=[];const rad=.16+P[1]*.05;for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*1.3,0,P[2]+Math.sin(a)*rad]);if(p)sh.push(p);}
 if(sh.length>8&&P[0]<.05)s.tone(pal.K,polyPath(sh,true),clamp(.5-P[1]*.1,.08,.5));
 if(o.lines&&o.prevP){const a=pr(c,o.prevP);if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.8)speedLines(s,pal.K,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:4,seed:7,len:Math.min(260,d*1.4),spread:r*.9,width:Math.max(2.5,r*.18),cov:.8});}}
 footballPanels(s,g[0],g[1],r,{rot,key:pal.K,shadow:pal.B,seed:5});
 return{g,r,d:q[2]};
}
export type Fig={st:State;prev?:State;style:AthleteStyle;hero:boolean;smear?:boolean;captain?:boolean;sleeves?:InkFill};
type Item={d:number;draw:()=>void};
/** depth-sorts figures, the ball and the goal (far first). Heat: small figures print 'low'; inside a passage every figure is capped;
 * at most `cap` non-hero figures print at full detail. */
export function drawScene(s:Sheet,c:Cam,pal:Pal,figs:Fig[],ball:{P:V3;rot:number;min?:number;prevP?:V3|null;lines?:boolean}|null,goal:{bulge:number;bz:number;by?:number}|null,cap=3,extra:Item[]=[]):{ball:{g:Pt;r:number}|null}{
 const v=view(s),items:Item[]=[...extra],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,preview=s.arrival<PASSAGE.seam-1e-3,scr0=s._passage.screen,passing=!!s._passage.pending||preview;
 const near=figs.filter(f=>!f.hero).map(f=>toCam(c,[f.st.place.x??0,.9,f.st.place.z??0])[2]).filter(d=>d>=1).sort((a,b)=>a-b),dCap=near.length>cap?near[cap-1]:1e9;
 for(const f of figs){const q=toCam(c,[f.st.place.x??0,.9,f.st.place.z??0]);if(q[2]<1)continue;const g=scr(c,q),k=c.F/q[2]*1.8;if(Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k)continue;
  {const d=m.transformPoint(new DOMPoint(g[0],g[1])),rr=k*ppu*s.dpr;let x0=0,y0=0,x1=s.width*s.dpr,y1=s.height*s.dpr;
   if(preview&&scr0){x0=Math.max(x0,Math.min(...scr0.map(p=>p[0])));x1=Math.min(x1,Math.max(...scr0.map(p=>p[0])));y0=Math.max(y0,Math.min(...scr0.map(p=>p[1])));y1=Math.min(y1,Math.max(...scr0.map(p=>p[1])));}
   if(d.x<x0-rr||d.x>x1+rr||d.y<y0-rr||d.y>y1+rr)continue;}
  const px=k*ppu,style:AthleteStyle=passing?{...f.style,detail:'low'}:(!f.hero&&(px<120||q[2]>dCap))||px<44?{...f.style,detail:'low'}:f.style;
  items.push({d:q[2],draw:()=>{drawPlayer(s,pal.K,pal.Y,f.st.pose,c,style,f.st.place,f.prev,!!f.smear&&!passing,!!f.captain,f.sleeves??null);}});}
 let out:{g:Pt;r:number}|null=null;
 if(ball){const bq=toCam(c,ball.P);if(bq[2]>=NEAR)items.push({d:bq[2],draw:()=>{const r=drawBall(s,c,pal,ball.P,ball.rot,ball);if(r)out={g:r.g,r:r.r};}});}
 if(goal){const gq=toCam(c,[1,1.2,0]);items.push({d:Math.max(NEAR,gq[2]),draw:()=>goal3(s,c,pal.K,goal.bulge,goal.bz,goal.by??1)});}
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
 return{ball:out};
}

// ---------------------------------------------------------------- camera plans keyed on cue times
export type Shot={P:V3;T:V3;fov:number};
export const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
/** steps: [start, duration, shot]; each step eases in over the previous result */
export function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
export const gnd=(P:V3,y=0):V3=>[P[0],y,P[2]];

// ---------------------------------------------------------------- teaching marks (lesson chapters / replay graphics)
/** a projected arrow (shaft + head) along 3D points, in one ink */
export function arrow3(s:Sheet,c:Cam,K:string,pts:V3[],w:number,ink:string,cov=1){
 const q=pts.map(p=>pr(c,p)).filter((p):p is Pt=>!!p);if(q.length<2)return;
 const e=q[q.length-1],f=q[q.length-2],ang=Math.atan2(e[1]-f[1],e[0]-f[0]),ca=Math.cos(ang),sa=Math.sin(ang),hd=w*2.6;
 const shaft=q.slice(0,-1).concat([[e[0]-ca*hd*.7,e[1]-sa*hd*.7]]);
 const p=ribbon(shaft,w,{taper:.2,pressure:.2,wobble:.8});p.addPath(polyPath([[e[0]+ca*hd*.3,e[1]+sa*hd*.3],[e[0]-ca*hd-sa*hd*.62,e[1]-sa*hd+ca*hd*.62],[e[0]-ca*hd+sa*hd*.62,e[1]-sa*hd-ca*hd*.62]],true));
 s.knockout(p);s.fill(ink,p,cov);s.stroke(K,p,Math.max(2,w*.12),.85);
}
/** a flat dashed ring on the grass */
export function groundRing(s:Sheet,c:Cam,P:V3,rad:number,ink:string,a:number){
 const X=pr(c,[P[0],.01,P[2]]);if(!X||a<=0)return;const pts:Pt[]=[];for(let i=0;i<24;i++){const u=i/24*TAU,p=pr(c,[P[0]+Math.cos(u)*rad,.01,P[2]+Math.sin(u)*rad]);if(p)pts.push(p);}
 if(pts.length<8)return;const gaps:[number,number][]=[];for(let i=0;i<12;i++)gaps.push([(i+.66)/12,(i+.96)/12]);
 const d=ribbon(pts.concat([pts[0]]),Math.max(7,kAt(c,P)*.11),{seed:31,taper:0,wobble:.6,gaps});s.knockout(d,.8*a);s.fill(ink,d,.95*a);
}
/** a ribbon along 3D points (a run on the grass, a ball's flight) that fades with `fade` */
export function pathRibbon(s:Sheet,c:Cam,pts3:V3[],ink:string,fade:number,wm=.9){
 if(fade<=0)return;const pts:Pt[]=[];for(const P of pts3){const p=pr(c,P);if(p)pts.push(p);}
 if(pts.length<3)return;const ww=Math.max(6,kAt(c,pts3[pts3.length-1])*wm*.5);s.knockout(ribbon(pts,ww*1.4,{taper:.8,pressure:.2,wobble:0}),.5*fade);s.fill(ink,ribbon(pts,ww,{taper:.8,pressure:.2,wobble:0}),.9*fade);
}

// ---------------------------------------------------------------- narration timing (estimates until the Kokoro voice exists)
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , . ! ? ... */
export function estimate(text:string,cues:string[],tail:number,tag='film'){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error(tag+': cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** key() needs increasing times: push each key at least `gap` after the previous one (real voice timings can crowd authored offsets) */
export function mono(K:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of K)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}
