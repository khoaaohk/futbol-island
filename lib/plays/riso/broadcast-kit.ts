/** Broadcast kit — shared, film-agnostic plumbing for match-moment card films built on the carvajal-header-2024.ts pattern
 * (ljungberg-cup-final-2002, van-persie-header-2014, blanc-golden-goal-1998, james-volley-2014, inzaghi-final-2007 use it).
 * It is NOT a film: it holds the parts every broadcast recreation repeats — the script → chapters/cue plumbing, a right-handed
 * pitch in metres projected through an athlete.ts Camera, a parameterised stadium bowl, the grass and lines, the goal and net, the
 * ball, depth-sorted figures (every body goes through athlete.ts), Hermite player tracks, shot blending and the lesson marks.
 *
 * World (identical to carvajal-header-2024.ts and athlete.ts): metres, right-handed, y up. The goal being attacked has its goal line at
 * x = 0 (attack toward +x), goal centre z = 0, +z = the attackers' RIGHT; touchlines z = ±34, halfway x = −52.5, the far goal line x = −105.
 * Inks are always yellow / red / blue / navy (orange = yellow × red, green = yellow × blue, purple = red × blue overprints).
 * Heat: every function is a pure function of its inputs (seeded, no clock); figures far away print at 'low', ≤ 4 non-hero figures at
 * full detail, every figure inside a passage is capped. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import type {Chapter} from '../../paths/riso/story';
import {TAU,twos,sm,clamp,lerp,hash,blob,polyPath,ribbon,easeInOutSine,type Pt} from '../../paths/riso/motion';
import {footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,runCycle,stand,posed,blendPose,
 type Pose,type Camera,type AthleteStyle,type Place,type V3,type Build,type Skeleton} from './athlete';

export const Y='yellow',R='red',B='blue',K='navy';
export const DEG=Math.PI/180;
export const SPEC={paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45};

// ---------------------------------------------------------------- script → chapters (cue `at` estimated until the Kokoro voice exists)
export type ScriptChapter={label:string;text:string;tail:number;cues:string[]};
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , . ! ? ... ; withTiming swaps in the recorded onsets */
function estimate(tag:string,text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error(tag+': cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** chapters from a script (+ the recorded voice when present), and cue lookups that throw on a typo so a retime never silently desyncs */
export function chaptersFrom(tag:string,script:ScriptChapter[],voice:NarrationTiming|null){
 const CHAPTERS:Chapter[]=withTiming(script.map(c=>{const e=estimate(tag,c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),voice);
 const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error(tag+': no cue '+w);return c.at;};
 const SECS=(i:number)=>CHAPTERS[i].seconds;
 return{CHAPTERS,CUE,SECS};
}
/** key() needs increasing times: push each key at least `gap` after the previous one (real voice timings can crowd authored offsets) */
export function mono(Kk:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of Kk)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}

// ---------------------------------------------------------------- vectors
export const add3=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
export const sub3=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
export const mul3=(a:V3,k:number):V3=>[a[0]*k,a[1]*k,a[2]*k];
export const mix3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
export const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
export const d3=(a:V3,b:V3)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
export const wrap=(a:number)=>{while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;return a;};
export const lerpAng=(a:number,b:number,u:number)=>a+wrap(b-a)*u;
/** yaw (athlete.ts: 0 faces +x, + turns left) facing the ground direction (dx,dz) */
export const yawTo=(dx:number,dz:number)=>Math.atan2(-dz,dx);
export const nrm2=(x:number,z:number):[number,number]=>{const l=Math.hypot(x,z)||1;return[x/l,z/l];};
/** ballistics with a constant acceleration a (gravity + a sideways "curl" pull) */
export const launch=(A:V3,Bp:V3,d:number,a:V3):V3=>[(Bp[0]-A[0]-.5*a[0]*d*d)/d,(Bp[1]-A[1]-.5*a[1]*d*d)/d,(Bp[2]-A[2]-.5*a[2]*d*d)/d];
export const flyA=(A:V3,V:V3,a:V3,t:number):V3=>[A[0]+V[0]*t+.5*a[0]*t*t,A[1]+V[1]*t+.5*a[1]*t*t,A[2]+V[2]*t+.5*a[2]*t*t];
export const GRAV=9.81,BALL_R=.11,G3:V3=[0,-GRAV,0];

// ---------------------------------------------------------------- framing + projection
/** a narrower (square) window gets a slightly wider lens so the action still fits; set by frame(), read by cam3 */
let LENS=1;
/** Frame the FULL sheet: world (0,0) on the canvas centre at 1 unit per sheet unit (the passage arrival scale still multiplies in). */
export function frame(s:Sheet){const S=s.arrival;s.camera((s.cx-s.W/2)/S,(s.cy-s.H/2)/S,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
/** half the visible extents with margin for the .68 passage preview */
export const view=(s:Sheet)=>({hx:s.W/(2*.68)+120,hy:s.H/(2*.68)+120});
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

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
export type Shot={P:V3;T:V3;fov:number};
export const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
/** steps: [start, duration, shot]; each step eases in over the previous result */
export function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}

// ---------------------------------------------------------------- the stadium bowl
/** crowd weights: [paper (white shirts), yellow, navy, red, blue] */
export type Crowd=[number,number,number,number,number];
export type StadiumSpec={
 /** day = open blue sky; dusk = deep blue with a warm glow low down; night = a printed navy night under floodlights */
 sky:'day'|'dusk'|'night';
 /** screens printed on the seat planes (after a knockout), e.g. [[R,.5],[K,.4]] = red seats in shade */
 seats:[string,number][];
 /** crowd colours per stand: 0 far side (+z), 1 behind the goal (+x), 2 near side (−z, usually the camera side), 3 the far end */
 crowd:[Crowd,Crowd,Crowd,Crowd];
 /** tier fascias as [b0,b1] fractions up the rake */
 tiers?:[number,number][];
 /** stand height (m) and roof */
 rake?:number;roof?:boolean;lamps?:boolean;
 /** two great arches over the side stands (Athens' Olympic Stadium) */
 arches?:boolean;
};
const STAND_COLS=[110,76,110,76],STAND_ROWS=18;
function stands(h:number):((a:number,b:number)=>V3)[]{return[
 (a,b)=>[lerp(-122,17,a),1.2+h*b,43+h*b],
 (a,b)=>[9+h*.95*b,1.2+h*b,lerp(62,-62,a)],
 (a,b)=>[lerp(17,-122,a),1.2+h*.9*b,-43-h*.9*b],
 (a,b)=>[-114-h*.95*b,1.2+h*b,lerp(-62,62,a)],
];}
const ARCH_PTS=(side:number):V3[]=>Array.from({length:25},(_,i)=>{const u=i/24,y=78*(1-Math.pow(2*u-1,2));return[-52.5+(u-.5)*300,40+y,side*(62+y*.12)];});
export function stadium(s:Sheet,c:Cam,t:number,sp:StadiumSpec,which:number[],o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t),h=sp.rake??38,S=stands(h),tiers=sp.tiers??[[.34,.4]];
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]));
 const band=(y0:number,y1:number)=>hz?polyPath([[-1e4,hz[1]+y0],[1e4,hz[1]+y0],[1e4,hz[1]+y1],[-1e4,hz[1]+y1]],true):null;
 if(sp.sky==='day'){s.field(B,.42,.5);const b1=band(-900,80),b2=band(-380,80);if(b1)s.knockout(b1,.35);if(b2)s.tone(Y,b2,.12);}
 else if(sp.sky==='dusk'){s.field(K,.72,.5);const b1=band(-1100,60),b2=band(-420,60);if(b1)s.tone(B,b1,.3);if(b2)s.tone(R,b2,.1);}
 else{s.field(K,.88,.5);const b1=band(-700,60);if(b1)s.tone(B,b1,.3);}
 if(sp.arches)for(const side of[1,-1]){const pts:Pt[]=[];let ok=true;for(const p of ARCH_PTS(side)){const q=toCam(c,p);if(q[2]<8){ok=false;break;}pts.push(scr(c,q));}
  if(ok&&pts.length>2){const w=clamp(5*c.F/toCam(c,ARCH_PTS(side)[12])[2],3,50),tube=ribbon(pts,w,{taper:.1,wobble:.4,pressure:0});s.knockout(tube,.9);s.tone(B,tube,.1);s.stroke(K,tube,Math.max(1.5,w*.1),.5);}}
 const planes=new Path2D(),fas=new Path2D(),roof=new Path2D(),edge=new Path2D();
 for(const i of which){const P=S[i];addPoly(planes,polyP(c,[P(0,0),P(1,0),P(1,1),P(0,1)]));for(const[b0,b1] of tiers)addPoly(fas,polyP(c,[P(0,b0),P(1,b0),P(1,b1),P(0,b1)]));
  if(sp.roof!==false){addPoly(roof,polyP(c,[add3(P(0,1),[0,1.5,0]),add3(P(1,1),[0,1.5,0]),add3(P(1,.86),[0,11,0]),add3(P(0,.86),[0,11,0])]));seg3(c,add3(P(0,.86),[0,10.8,0]),add3(P(1,.86),[0,10.8,0]),.45,edge);}}
 s.knockout(planes);for(const[ink,cov] of sp.seats)s.tone(ink,planes,cov);s.knockout(fas);s.fill(K,fas,.85);s.tone(Y,fas,.18);
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const P=S[si],cols=STAND_COLS[si],mx=sp.crowd[si],tot=mx.reduce((a,b)=>a+b,0)||1;for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(tiers.some(([b0,b1])=>b>b0-.02&&b<b1+.02))continue;
  for(let i=0;i<cols;i++){const hh=hash(i*131+j*7919+si*17,6);if(hh<.22)continue;const a=(i+.5+(hash(i+j*31,8)-.5)*.6)/cols,q=toCam(c,P(a,b));if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+hh*TAU)):0;
   let u=(hh-.22)/.78*tot,ink=0;while(ink<4&&u>mx[ink]){u-=mx[ink];ink++;}inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.8);s.knockout(inks[1],.7);s.fill(Y,inks[1],.95);s.fill(K,inks[2],.9);s.knockout(inks[3],.7);s.fill(R,inks[3],.95);s.knockout(inks[4],.7);s.fill(B,inks[4],.9);
 if(sp.roof!==false){s.knockout(roof);s.fill(K,roof,.95);s.knockout(edge,.7);}
 if(sp.lamps){const lamp=new Path2D(),halo=new Path2D();for(const i of which){const P=S[i];for(let k=0;k<7;k++){const u=(k+.5)/7,a=add3(P(u-.025,.86),[0,10,0]),b=add3(P(u+.025,.86),[0,10,0]),m=mix3(a,b,.5);if(toCam(c,m)[2]<NEAR+2)continue;seg3(c,a,b,1.1,lamp);
   const g=pr(c,m);if(g){const r=clamp(kAt(c,m)*4.5,8,140);halo.moveTo(g[0]+r,g[1]);halo.ellipse(g[0],g[1],r,r*.62,0,0,TAU);}}}
  s.knockout(halo,.22);s.tone(Y,halo,.4);s.knockout(lamp);s.fill(Y,lamp,.75);}
 if(flash>0){const p=new Path2D(),n=Math.round(24*flash);for(let i=0;i<n;i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,S[si](r2,.1+.8*hash(i,Math.floor(tt*12))));if(!q)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.6);}
}

// ---------------------------------------------------------------- grass, the full set of lines, boards, corner flags
export function ground(s:Sheet,c:Cam,o:{wet?:boolean}={}){
 const g=polyP(c,[[-118,0,-46],[13,0,-46],[13,0,46],[-118,0,46]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.88);s.tone(B,gp,o.wet?.78:.7);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]));s.tone(B,st,.2);
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([5.5,0,-38],[5.5,0,38]);board([-110,0,-38],[5.5,0,-38]);board([-110,0,38],[5.5,0,38]);
 for(let k=0;k<12;k++){const z=-36+k*6.2;addPoly(pn,polyP(c,[[5.4,.25,z],[5.4,.25,z+3.3],[5.4,.68,z+3.3],[5.4,.68,z]]));}
 for(const zz of[-37.9,37.9])for(let k=0;k<18;k++){const x=-108+k*6.4;addPoly(pn,polyP(c,[[x,.25,zz],[x+3.4,.25,zz],[x+3.4,.68,zz],[x,.68,zz]]));}
 s.knockout(bd);s.fill(K,bd,.9);s.knockout(pn,.85);s.fill(B,pn,.35);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
 for(let k=0;k<8;k++){L([-k*13.125,0,-34],[-(k+1)*13.125,0,-34]);L([-k*13.125,0,34],[-(k+1)*13.125,0,34]);}
 const CX=-52.5;
 for(let k=0;k<4;k++){L([0,0,-34+k*17],[0,0,-34+(k+1)*17]);L([CX,0,-34+k*17],[CX,0,-34+(k+1)*17]);L([-105,0,-34+k*17],[-105,0,-34+(k+1)*17]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(CX,0,9.15);
 for(const[gx,sg] of [[0,-1],[-105,1]] as [number,number][]){
  L([gx,0,-20.16],[gx+sg*16.5,0,-20.16]);L([gx+sg*16.5,0,-20.16],[gx+sg*16.5,0,20.16]);L([gx+sg*16.5,0,20.16],[gx,0,20.16]);
  L([gx,0,-9.16],[gx+sg*5.5,0,-9.16]);L([gx+sg*5.5,0,-9.16],[gx+sg*5.5,0,9.16]);L([gx+sg*5.5,0,9.16],[gx,0,9.16]);
  const a=Math.acos(5.5/9.15);if(sg<0)circ(gx-11,0,9.15,Math.PI-a,Math.PI+a,12);else circ(gx+11,0,9.15,-a,a,12);}
 for(const cx of[-11,CX,-94]){const d:V3[]=[];for(let i=0;i<12;i++){const a=i/12*TAU;d.push([cx+Math.cos(a)*.15,0,Math.sin(a)*.15]);}addPoly(ln,polyP(c,d));}
 circ(0,-34,1,Math.PI/2,Math.PI,4);circ(0,34,1,Math.PI,Math.PI*1.5,4);
 s.knockout(ln);
 const pole=new Path2D(),flag=new Path2D();for(const z of[-34,34]){seg3(c,[0,0,z],[0,1.55,z],.05,pole);addPoly(flag,polyP(c,[[0,1.55,z],[0,1.2,z],[-.45,1.38,z]]));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(Y,flag,.95);
}
/** the goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep with a sloping roof; bulge pushes the back out around (by, bz) */
export function goal3(s:Sheet,c:Cam,bulge:number,bz:number,by=1){
 const X=0,z0=-3.66,z1=3.66,H=2.44,back=(z:number,y:number)=>X+2+bulge*.75*Math.exp(-Math.pow((z-bz)/1.6,2)-Math.pow((y-by)/1.4,2));
 const zs=[z0,-2.4,-1.2,0,1.2,2.4,z1],ys=[0,.95,1.9];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0,1.9),1.9,z0],[back(z0,0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1,1.9),1.9,z1],[back(z1,0),0,z1]],
  [[X,H,z0],[X,H,z1],...zs.slice().reverse().map(z=>[back(z,1.9),1.9,z] as V3)],
  [...zs.map(z=>[back(z,0),0,z] as V3),...zs.slice().reverse().map(z=>[back(z,1.9),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.3);s.tone(K,net,.12);
 const mesh=new Path2D();
 for(let i=0;i<=14;i++){const z=lerp(z0,z1,i/14);seg3(c,[X,H,z],[back(z,1.9),1.9,z],.022,mesh,.7);for(let j=0;j<2;j++)seg3(c,[back(z,ys[j+1]),ys[j+1],z],[back(z,ys[j]),ys[j],z],.022,mesh,.7);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<zs.length-1;i++)seg3(c,[back(zs[i],y),y,zs[i]],[back(zs[i+1],y),y,zs[i+1]],.022,mesh,.7);seg3(c,[X,y*H/1.9,z0],[back(z0,y),y,z0],.022,mesh,.7);seg3(c,[X,y*H/1.9,z1],[back(z1,y),y,z1],.022,mesh,.7);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+2*u,H-.54*u,z0],[X+2*u,H-.54*u,z1],.022,mesh,.7);}
 s.knockout(mesh,.8);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.2,fo);seg3(c,[X,0,z1],[X,H,z1],.2,fo);seg3(c,[X,H,z0-.04],[X,H,z1+.04],.2,fo);
 s.fill(K,fo,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- tracks: [τ, x, z] Hermite-interpolated, tabulated once at 50 Hz
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const still=(a:number[],b:number[])=>Math.abs(a[1]-b[1])+Math.abs(a[2]-b[2])<1e-6;
 const f=(j:number)=>{const m1=still(k1,k2)||still(k0,k1)?0:(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=still(k1,k2)||still(k2,k3)?0:(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
export type Tracks={pos:(k:number,tau:number)=>[number,number];dist:(k:number,tau:number)=>number;vel:(k:number,tau:number)=>[number,number]};
export function makeTracks(all:number[][][],T0:number,T1:number,DT=.02):Tracks{
 const TAB=all.map(keys=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
 const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
 const pos=(k:number,tau:number):[number,number]=>[samp(TAB[k].X,tau),samp(TAB[k].Z,tau)];
 return{pos,dist:(k,tau)=>samp(TAB[k].D,tau),vel:(k,tau)=>{const a=pos(k,tau-.06),b=pos(k,tau+.06);return[(b[0]-a[0])/.12,(b[1]-a[1])/.12];}};
}
/** a run cycle driven by the distance run, blended into a jostling idle when slow */
export function loco(tr:Tracks,k:number,tau:number):Pose{
 const v=tr.vel(k,tau),sp=Math.hypot(v[0],v[1]),q=clamp(sp/7.5),ph=tr.dist(k,tau)/(2.3+2.1*q)+k*.37;
 const run=runCycle(ph,{speed:q});if(sp>1.4)return run;
 const idle=blendPose(stand(),posed({lHipF:24,rHipF:18,lKnee:30,rKnee:26,lean:14,pitch:4,neckP:-10,lShA:26,rShA:22,lElb:40,rElb:36,rAnk:-6,lAnk:-6}),.5+.5*Math.sin(tau*1.7+k));
 return blendPose(idle,run,clamp((sp-.25)/1.15));
}
/** face along the run when moving, else toward the target (blended, so turns are continuous) */
export function faceYaw(tr:Tracks,k:number,tau:number,target:V3):number{
 const v=tr.vel(k,tau),sp=Math.hypot(v[0],v[1]),p=tr.pos(k,tau),tx=target[0]-p[0],tz=target[2]-p[1],tl=Math.hypot(tx,tz)||1,w=clamp((sp-.6)/1.6);
 return yawTo(lerp(tx/tl,v[0]/(sp||1),w),lerp(tz/tl,v[1]/(sp||1),w));
}
export const win=(t:number,a:number,b:number,e=.15)=>sm(a,a+e,t)*(1-sm(b-e,b,t));
export const DEJECT=posed({lHipF:26,rHipF:26,lKnee:30,rKnee:30,lean:30,pitch:6,neckP:34,lShA:14,rShA:14,lShF:20,rShF:20,lElb:24,rElb:24});
export const at3=(tr:Tracks,k:number,tau:number,y=1):V3=>{const[x,z]=tr.pos(k,tau);return[x,y,z];};

// ---------------------------------------------------------------- figures, the ball, depth sorting
export type State={pose:Pose;place:Place};
/** paint contrasting sleeves (e.g. Arsenal's white sleeves on a red shirt) over the near arm(s) of a drawn figure: athlete.ts prints
 * sleeves in the shirt ink, so this prints the upper sleeve band on top, only for arms nearer the camera than the chest */
export function sleeves(s:Sheet,c:Cam,sk:Skeleton,ink:string|'paper'){
 const ch=toCam(c,sk.chest)[2];
 for(const side of['l','r'] as const){const sh=sk[`${side}Sh`],el=sk[`${side}El`];if(toCam(c,sh)[2]>ch+.02)continue;
  const a=pr(c,mix3(sh,el,-.05)),b=pr(c,mix3(sh,el,.42));if(!a||!b)continue;const w=Math.max(3,kAt(c,sh)*.13*sk.s);
  const p=ribbon([a,b],w,{taper:0,wobble:.2,pressure:0});s.knockout(p);if(ink!=='paper')s.fill(ink,p,.95);s.stroke(K,p,Math.max(1.2,w*.1),.85);}
}
export type Fig={st:State;prev?:State;style:AthleteStyle;hero:boolean;smear?:boolean;build?:Build;sleeve?:string|'paper'};
export type BallDraw={P:V3;rot:number;min?:number;prevP?:V3|null;lines?:boolean};
export function drawBall(s:Sheet,c:Cam,P:V3,rot:number,o:{min?:number;prevP?:V3|null;lines?:boolean}={}){
 const q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??12,c.F*BALL_R/q[2]);
 const sh:Pt[]=[];const rad=.16+P[1]*.05;for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*1.3,0,P[2]+Math.sin(a)*rad]);if(p)sh.push(p);}
 if(sh.length>8&&P[0]<.05)s.tone(K,polyPath(sh,true),clamp(.5-P[1]*.1,.08,.5));
 if(o.lines&&o.prevP){const a=pr(c,o.prevP);if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.8)speedLines(s,K,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:4,seed:7,len:Math.min(260,d*1.4),spread:r*.9,width:Math.max(2.5,r*.18),cov:.8});}}
 footballPanels(s,g[0],g[1],r,{rot,key:K,shadow:B,seed:5});
 return{g,r,d:q[2]};
}
const FULL_CAP=4;
/** depth-sorts figures, the ball and the goal (far first). Heat: small figures print at `low`; inside a passage every figure is capped. */
export function drawScene(s:Sheet,c:Cam,figs:Fig[],ball:BallDraw|null,goal:{bulge:number;bz:number;by?:number}|null):{ball:{g:Pt;r:number}|null}{
 const v=view(s),items:{d:number;draw:()=>void}[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending;
 const near=figs.filter(f=>!f.hero).map(f=>toCam(c,[f.st.place.x??0,.9,f.st.place.z??0])[2]).filter(d=>d>=1).sort((a,b)=>a-b),dCap=near.length>FULL_CAP?near[FULL_CAP-1]:1e9;
 for(const f of figs){const q=toCam(c,[f.st.place.x??0,.9,f.st.place.z??0]);if(q[2]<1)continue;const g=scr(c,q),k=c.F/q[2]*1.8;if(Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k)continue;
  const px=k*ppu,low=passing?!f.hero:(!f.hero&&(px<120||q[2]>dCap))||px<44,style:AthleteStyle=passing?{...f.style,detail:f.hero?'mid':'low'}:low?{...f.style,detail:'low'}:f.style;
  items.push({d:q[2],draw:()=>{if(f.smear&&f.prev&&!passing)motionSmear(s,f.prev.pose,f.st.pose,c,style,f.st.place,{prevPlace:f.prev.place,ink:[K,.3],threshold:9});
   drawAthlete(s,f.st.pose,c,style,f.st.place,f.prev?{prev:f.prev.pose,prevPlace:f.prev.place}:{});
   if(f.sleeve&&!low&&px>70)sleeves(s,c,solve(f.st.pose,f.style.build??{},f.st.place),f.sleeve);}});}
 let out:{g:Pt;r:number}|null=null;
 if(ball){const bq=toCam(c,ball.P);if(bq[2]>=NEAR)items.push({d:bq[2],draw:()=>{const r=drawBall(s,c,ball.P,ball.rot,ball);if(r)out={g:r.g,r:r.r};}});}
 if(goal){const gq=toCam(c,[1,1.2,0]);items.push({d:Math.max(NEAR,gq[2]),draw:()=>goal3(s,c,goal.bulge,goal.bz,goal.by)});}
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
 return{ball:out};
}

// ---------------------------------------------------------------- lesson marks
/** a projected arrow (shaft + head) along 3D points, in one ink */
export function arrow3(s:Sheet,c:Cam,pts:V3[],w:number,ink:string,cov=1){
 const q=pts.map(p=>pr(c,p)).filter((p):p is Pt=>!!p);if(q.length<2)return;
 const e=q[q.length-1],f=q[q.length-2],ang=Math.atan2(e[1]-f[1],e[0]-f[0]),ca=Math.cos(ang),sa=Math.sin(ang),hd=w*2.6;
 const shaft=q.slice(0,-1).concat([[e[0]-ca*hd*.7,e[1]-sa*hd*.7]]);
 const p=ribbon(shaft,w,{taper:.2,pressure:.2,wobble:.8});p.addPath(polyPath([[e[0]+ca*hd*.3,e[1]+sa*hd*.3],[e[0]-ca*hd-sa*hd*.62,e[1]-sa*hd+ca*hd*.62],[e[0]-ca*hd+sa*hd*.62,e[1]-sa*hd-ca*hd*.62]],true));
 s.knockout(p);s.fill(ink,p,cov);s.stroke(K,p,Math.max(2,w*.12),.85);
}
/** a flat dashed ring on the grass */
export function groundRing(s:Sheet,c:Cam,P:V3,rad:number,ink:string,a:number,w=.07){
 const X=pr(c,[P[0],.01,P[2]]);if(!X||a<=0)return;const pts:Pt[]=[];for(let i=0;i<28;i++){const u=i/28*TAU,p=pr(c,[P[0]+Math.cos(u)*rad,.01,P[2]+Math.sin(u)*rad]);if(p)pts.push(p);}
 if(pts.length<8)return;const gaps:[number,number][]=[];for(let i=0;i<14;i++)gaps.push([(i+.66)/14,(i+.96)/14]);
 const d=ribbon(pts,Math.max(5,kAt(c,P)*w),{seed:31,close:true,taper:0,wobble:.6,gaps});s.knockout(d,.8*a);s.fill(ink,d,.95*a);
}
/** a replay trail: the ball's path over [a,b] as a fading ribbon (printed under the players) */
export function trail(s:Sheet,c:Cam,ballAt:(tau:number)=>V3,a:number,b:number,fade:number,ink=Y,n=22){
 if(fade<=0||b<=a)return;const pts:Pt[]=[];for(let i=0;i<=n;i++){const p=pr(c,ballAt(lerp(a,b,i/n)));if(p)pts.push(p);}
 if(pts.length<3)return;const w=Math.max(8,kAt(c,ballAt(b))*.16);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45*fade);s.fill(ink,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*fade);
}
/** a flat zone on the grass (a lit area) */
export function zone(s:Sheet,c:Cam,pts:V3[],ink:string,a:number){if(a<=0)return;const z=polyP(c,pts);if(z.length<3)return;const zp=polyPath(z,true);s.knockout(zp,.3*a);s.tone(ink,zp,.35*a);}
/** a navy ring round a ground point (who to watch) */
export function markRing(s:Sheet,c:Cam,P:V3,a:number){if(a<=0)return;const X=pr(c,[P[0],0,P[2]]);if(!X)return;const rr=kAt(c,P)*.55,ring=polyPath(blob(X[0],X[1],rr,rr*.34,7,{n:20}),true);s.stroke(K,ring,Math.max(4,rr*.1),.85*a);}
