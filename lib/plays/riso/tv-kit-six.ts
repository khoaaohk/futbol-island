/** TV kit (six) — the shared TV-camera toolkit behind six iconic-play films ONLY: di-maria-maracana-2021, ozil-ludogorets-2016,
 * alba-euro-final-2012, mascherano-robben-2014, tevez-olympic-final-2004, aguero-qpr-2012. (Not the same file as broadcast-kit.ts, which
 * belongs to other films.) It is the Barcola film's 3D broadcast machinery (lib/plays/riso/barcola-signature.ts) generalised:
 * a right-handed pitch in metres (X along the length 0 → 105 = the attacked goal line, Y up, Z across: +34 = the near touchline under
 * the main camera), pinhole cameras (never top-down), a parametric stadium bowl, a floodlit/day pitch with both goals and a bulging net,
 * keyframed player tracks (Hermite, 50 Hz tables), one depth-sorted drawing pass through ONE figure adapter per film, teaching marks
 * drawn on the grass, and full-sheet card-window framing (never sheet.safe).
 * Every function is pure in its inputs (no clock, no Math.random); heat: one crowd pass, batched plates, extras at 'low'. */
import type {Sheet} from '../../paths/riso/sheet';
import {TAU,clamp,lerp,hash,rng,blob,polyPath,ribbon,easeOut,easeOutBack,twos,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow,footballPanels} from '../../paths/riso/shapes';
import type {Chapter} from '../../paths/riso/story';
import type {V3,Pose,DrawResult} from './athlete';

export const Y='yellow',K='navy';

// ---------------------------------------------------------------- narration estimates + cue helpers
/** provisional word onsets (≈ .32 s a word, as calibrated on the approved films' Kokoro timings): pauses after , . ! ? … — only used
 * until timing.json exists (withTiming then swaps in the measured onsets). */
export function estimate(text:string,cues:string[],tail:number,tag:string):{seconds:number;cues:{at:number;words:string}[]}{
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.2+.02*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.2;if(/[.!?]$/.test(w))t+=.36;if(/\.\.\.$/.test(w))t+=.3;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error(tag+': cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** cue lookup by the start of its words (throws on a typo, so a retime can never silently desync) */
export const cueFn=(CH:Chapter[],tag:string)=>(i:number,w:string)=>{const c=CH[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error(tag+': cue '+w);return c.at;};
/** key() needs increasing times: push each key at least `gap` after the previous one (real voice timings can crowd authored offsets) */
export function mono(K0:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of K0)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}

// ---------------------------------------------------------------- small helpers
export const lerp3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const wrapA=(a:number)=>{a=(a+Math.PI)%TAU;if(a<0)a+=TAU;return a-Math.PI;};
export const lerpA=(a:number,b:number,u:number)=>a+wrapA(b-a)*clamp(u);
/** heading of a ground direction as an athlete yaw (yaw 0 faces +X, + turns left toward −Z) */
export const yawOf=(dx:number,dz:number)=>Math.atan2(-dz,dx);
/** a smooth bump 0 → 1 → 0 over [a, b] */
export const bump=(a:number,b:number,t:number)=>t<=a||t>=b?0:Math.sin(Math.PI*(t-a)/(b-a));
const RAD=Math.PI/180,LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
/** push some channels of a pose toward authored values (degrees; linear channels in metres) by weight w */
export function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}

// ---------------------------------------------------------------- framing: the card window (full sheet, never the safe region)
export type View={hx:number;hy:number};
/** world (x,y) on the CANVAS centre at zoom z0 (scaled down on narrow sheets) */
export function cam(s:Sheet,x:number,y:number,z0:number,r=0){const z=z0*Math.min(1,Math.pow(s.W/1566,.75)),k=z*s.arrival;s.camera(x-(s.W/2-s.cx)/k,y-(s.H/2-s.cy)/k,z/s.fit,r);return z;}
export const view=(s:Sheet,z:number):View=>({hx:s.W/(2*z*.68)+60,hy:s.H/(2*z*.68)+60});
export const frame=(s:Sheet,shake:Pt=[0,0])=>view(s,cam(s,shake[0],shake[1],1));

// ---------------------------------------------------------------- the TV camera (right-handed, like athlete.ts)
export type Cam={C:V3;F:number;f:V3;r:V3;u:V3;eye:V3;project(p:V3):[number,number,number];scale(p:V3):number};
const NEAR=.4;
export const sub3=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
export const add3=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
export const mul3=(a:V3,k:number):V3=>[a[0]*k,a[1]*k,a[2]*k];
export const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
export const nrm3=(a:V3):V3=>{const l=Math.hypot(a[0],a[1],a[2])||1;return[a[0]/l,a[1]/l,a[2]/l];};
export const cross3=(a:V3,b:V3):V3=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
/** a camera at C looking at T with focal length F (sheet units); +screen x = cross(forward, up) */
export function look(C:V3,T:V3,F:number):Cam{const f=nrm3(sub3(T,C)),r=nrm3(cross3(f,[0,1,0])),u=cross3(r,f);
 return{C,F,f,r,u,eye:C,
  project(p:V3):[number,number,number]{const d=sub3(p,C),z=Math.max(NEAR,dot3(d,f));return[F*dot3(d,r)/z,-F*dot3(d,u)/z,z];},
  scale(p:V3){return F/Math.max(NEAR,dot3(sub3(p,C),f));}};}
export function toCam(c:Cam,P:V3):V3{const d=sub3(P,c.C);return[dot3(d,c.r),dot3(d,c.u),dot3(d,c.f)];}
export const scr=(c:Cam,q:V3):Pt=>[c.F*q[0]/q[2],-c.F*q[1]/q[2]];
export function pr(c:Cam,P:V3):Pt|null{const q=toCam(c,P);return q[2]<NEAR?null:scr(c,q);}
export const kAt=(c:Cam,P:V3)=>c.F/Math.max(NEAR,toCam(c,P)[2]);
/** project a polygon, clipped against the near plane */
export function polyP(c:Cam,pts:V3[]):Pt[]{const q=pts.map(p=>toCam(c,p)),out:V3[]=[];
 for(let i=0;i<q.length;i++){const a=q[i],b=q[(i+1)%q.length],ia=a[2]>=NEAR,ib=b[2]>=NEAR;if(ia)out.push(a);if(ia!==ib){const k=(NEAR-a[2])/(b[2]-a[2]);out.push([a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,NEAR]);}}
 return out.map(p=>scr(c,p));}
export const addPoly=(path:Path2D,q:Pt[])=>{if(q.length>2)path.addPath(polyPath(q,true));};
/** a 3D segment as a projected quad (near-clipped); width in metres */
export function seg3(c:Cam,a:V3,b:V3,wm:number,out:Path2D,minW=1.1){let qa=toCam(c,a),qb=toCam(c,b);if(qa[2]<NEAR&&qb[2]<NEAR)return;
 const cut=(p:V3,q:V3):V3=>{const k=(NEAR-p[2])/(q[2]-p[2]);return[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k,NEAR];};if(qa[2]<NEAR)qa=cut(qa,qb);else if(qb[2]<NEAR)qb=cut(qb,qa);
 const A=scr(c,qa),Bp=scr(c,qb),wa=Math.max(minW,c.F*wm/qa[2]/2),wb=Math.max(minW,c.F*wm/qb[2]/2),dx=Bp[0]-A[0],dy=Bp[1]-A[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 out.moveTo(A[0]+nx*wa,A[1]+ny*wa);out.lineTo(Bp[0]+nx*wb,Bp[1]+ny*wb);out.lineTo(Bp[0]-nx*wb,Bp[1]-ny*wb);out.lineTo(A[0]-nx*wa,A[1]-ny*wa);out.closePath();}
export const inView=(v:View,p:Pt,m=0)=>Math.abs(p[0])<v.hx+m&&Math.abs(p[1])<v.hy+m;
export function ringPts(c:Cam,x:number,z:number,rx:number,rz:number,n=32):Pt[]{const o:Pt[]=[];for(let i=0;i<n;i++){const a=i/n*TAU,q=pr(c,[x+Math.cos(a)*rx,0,z+Math.sin(a)*rz]);if(q)o.push(q);}return o;}

// ---------------------------------------------------------------- the stadium bowl
/** Venue look. sky: 'night' (printed navy, floodlit haze), 'dusk' (blue over navy), 'day' (a pale blue field with paper haze).
 * crowd: weighted fills for the spectators (ink name, or 'paper'); gap: metres from the touchline to the first row (a running track
 * pushes the stands out); tiers: height fraction of the dark band of boxes between two tiers (0 = one tier); fill: crowd density. */
export type Venue={sky:'night'|'dusk'|'day';crowd:[string,number][];gap?:number;tiers?:number;roof?:boolean;fill?:number;seed?:number;/** the sky/stand screen ink (default 'blue'; a film whose sheet has no blue passes another) */alt?:string};
function standsOf(g:number):((a:number,b:number)=>V3)[]{return[
 (a,b)=>[lerp(-9-g,114+g,a),1.2+27*b,-34-g-4.5-27*b],
 (a,b)=>[lerp(114+g,-9-g,a),1.2+25*b,34+g+4.5+26*b],
 (a,b)=>[110+g+26*b,1.2+25*b,lerp(-54-g,54+g,a)],
 (a,b)=>[-5-g-26*b,1.2+25*b,lerp(54+g,-54-g,a)],
];}
const STAND_COLS=[96,96,64,64],STAND_ROWS=14;
/** which: stand planes to print (0 far side z<0, 1 near/main side z>0, 2 behind the attacked goal x>105, 3 behind the other goal) */
export function stadium(s:Sheet,c:Cam,v:View,t:number,V:Venue,which:number[],o:{roar?:number;flash?:number;lamps?:number}={}){
 const{roar=0,flash=0,lamps=0}=o,tt=twos(t),S4=standsOf(V.gap??0),tier=V.tiers??.46,fill=V.fill??.8,A=V.alt??'blue';
 if(V.sky==='night')s.field(K,.86,.5);else if(V.sky==='dusk')s.field(A,.62,.6);else s.field(A,.3,.5);
 const hz=pr(c,add3(c.C,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz){if(V.sky==='day')s.knockout(polyPath([[-1e4,hz[1]-420],[1e4,hz[1]-420],[1e4,hz[1]+80],[-1e4,hz[1]+80]],true),.5);
  else if(V.sky==='dusk')s.tone(K,polyPath([[-1e4,-1e4],[1e4,-1e4],[1e4,hz[1]-900],[-1e4,hz[1]-760]],true),.3);
  else s.tone(Y,polyPath([[-1e4,hz[1]-700],[1e4,hz[1]-700],[1e4,hz[1]+80],[-1e4,hz[1]+80]],true),.12);}
 const planes=new Path2D(),band=new Path2D(),roof=new Path2D(),edge=new Path2D();
 for(const i of which){const S=S4[i];addPoly(planes,polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]));
  if(tier>0)addPoly(band,polyP(c,[S(0,tier-.035),S(1,tier-.035),S(1,tier+.035),S(0,tier+.035)]));
  if(V.roof!==false){addPoly(roof,polyP(c,[add3(S(0,1),[0,1.5,0]),add3(S(1,1),[0,1.5,0]),add3(S(1,.82),[0,9.5,0]),add3(S(0,.82),[0,9.5,0])]));
   seg3(c,add3(S(0,.82),[0,9.3,0]),add3(S(1,.82),[0,9.3,0]),.5,edge);}}
 s.knockout(planes);s.tone(K,planes,V.sky==='day'?.42:.55);s.tone(A,planes,.24);
 // the crowd: weighted fills, a seeded speckle of heads; the roar lifts them
 const W=V.crowd,tot=W.reduce((a,w)=>a+w[1],0),paths=W.map(()=>new Path2D()),seed=V.seed??0;
 for(const si of which){const S=S4[si],cols=STAND_COLS[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(tier>0&&Math.abs(b-tier)<.05)continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17+seed,6);if(h>fill)continue;const a=(i+.5+(hash(i+j*31,8)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<2)continue;
   const p=scr(c,q);if(!inView(v,p))continue;const z=clamp(c.F*.55/q[2],2.4,16),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   let pick=hash(i*57+j*13+si*3+seed,9)*tot,k=0;while(k<W.length-1&&pick>W[k][1]){pick-=W[k][1];k++;}paths[k].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 W.forEach(([ink],k)=>{if(ink==='paper')s.knockout(paths[k],.85);else{s.knockout(paths[k],.8);s.fill(ink,paths[k],.92);}});
 if(tier>0){s.knockout(band);s.fill(K,band,.9);}
 if(V.roof!==false){s.knockout(roof);s.fill(K,roof,.95);s.knockout(edge,.6);}
 // floodlights along the roof lip with yellow haloes; by day they are unlit frames
 const lamp=new Path2D(),halo=new Path2D();for(const i of which){const S=S4[i],n=i<2?9:6;for(let k=0;k<n;k++){const u=(k+.5)/n,a=add3(S(u-.02,.82),[0,8.8,0]),b=add3(S(u+.02,.82),[0,8.8,0]),m=lerp3(a,b,.5);if(toCam(c,m)[2]<NEAR+2)continue;seg3(c,a,b,1,lamp);
  const g=pr(c,m);if(g&&V.sky!=='day'){const r=clamp(kAt(c,m)*(4.2+2.5*lamps),8,160);halo.moveTo(g[0]+r,g[1]);halo.ellipse(g[0],g[1],r,r*.62,0,0,TAU);}}}
 if(V.sky!=='day'){s.knockout(halo,.22+.2*lamps);s.tone(Y,halo,.4+.25*lamps);s.knockout(lamp);s.fill(Y,lamp,.8);}else s.fill(K,lamp,.7);
 if(flash>0){const p=new Path2D(),n=Math.round(24*flash),T12=Math.floor(tt*12);for(let i=0;i<n;i++){const r1=hash(i*17+T12*101,3),r2=hash(i*29+T12*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,S4[si](r2,.1+.8*hash(i,T12)));if(!q)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.6);}
}

// ---------------------------------------------------------------- the pitch and goals
/** grass: the first fill solid, the rest halftone (e.g. [[yellow,.88],[blue,.55]] = floodlit green); mowing stripes; boards; a running
 * track (ink) round the pitch when `track` is set (gap = its width, metres); paper lines; both goals (the attacked goal at X = 105 can be
 * drawn later, in front of the players, when the camera is behind it) */
export type Pitch={grass:[string,number][];stripe:[string,number];boards?:[string,number];track?:string|null;gap?:number};
export function ground(s:Sheet,c:Cam,P:Pitch,o:{bulge?:number;ballZ?:number;ballY?:number;goalLater?:boolean}={}){
 const g0=P.gap??0;
 if(P.track&&g0>0){const tr=polyP(c,[[-g0-4,0,-34-g0-2],[109+g0,0,-34-g0-2],[109+g0,0,34+g0+2],[-g0-4,0,34+g0+2]]);if(tr.length>2){const tp=polyPath(tr,true);s.knockout(tp);s.fill(P.track,tp,.55);s.tone(K,tp,.12);}
  const lanes=new Path2D();for(let k=1;k<6;k++){const d=4+k*1.3;for(const[a,b] of [[[-d,-34-d],[105+d,-34-d]],[[-d,34+d],[105+d,34+d]]] as [[number,number],[number,number]][])seg3(c,[a[0],0,a[1]],[b[0],0,b[1]],.05,lanes,.7);}s.knockout(lanes,.8);}
 const g=polyP(c,[[-6,0,-38],[111,0,-38],[111,0,38],[-6,0,38]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);P.grass.forEach(([ink,cov],i)=>{if(i===0)s.fill(ink,gp,cov);else s.tone(ink,gp,cov);});
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[k*5.25,0,-34],[(k+1)*5.25,0,-34],[(k+1)*5.25,0,34],[k*5.25,0,34]]));s.tone(P.stripe[0],st,P.stripe[1]);
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.9,0]),add3(a,[0,.9,0])]));
 board([-4,0,-36.5],[109,0,-36.5]);board([109,0,-36],[109,0,36]);board([-4,0,36],[-4,0,-36]);
 for(let k=0;k<18;k+=3){const x=-2+k*6.2;addPoly(pn,polyP(c,[[x,.25,-36.45],[x+3.4,.25,-36.45],[x+3.4,.65,-36.45],[x,.65,-36.45]]));}
 const bdi=P.boards??[K,.9];s.knockout(bd);s.fill(bdi[0],bd,bdi[1]);s.knockout(pn,.85);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
 for(let k=0;k<8;k++){L([k*13.125,0,-34],[(k+1)*13.125,0,-34]);L([k*13.125,0,34],[(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){const z0=-34+k*17,z1=z0+17;L([105,0,z0],[105,0,z1]);L([0,0,z0],[0,0,z1]);L([52.5,0,z0],[52.5,0,z1]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(52.5,0,9.15);circ(52.5,0,.1,0,TAU,6);
 for(const [gx,d] of [[105,-1],[0,1]] as [number,number][]){const bx=gx+d*16.5,sx=gx+d*5.5;L([gx,0,-20.16],[bx,0,-20.16]);L([bx,0,-20.16],[bx,0,20.16]);L([bx,0,20.16],[gx,0,20.16]);L([gx,0,-9.16],[sx,0,-9.16]);L([sx,0,-9.16],[sx,0,9.16]);L([sx,0,9.16],[gx,0,9.16]);
  const a=Math.acos(5.5/9.15);circ(gx+d*11,0,9.15,d<0?Math.PI-a:-a,d<0?Math.PI+a:a,10);circ(gx+d*11,0,.08,0,TAU,6);}
 s.knockout(ln);
 goal3(s,c,0,-1,0,0);
 if(!o.goalLater)goal3(s,c,105,1,o.bulge??0,o.ballZ??0,o.ballY);
}
/** a goal at X (d = +1 net toward +X): posts at z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out around (ballZ, ballY) */
export function goal3(s:Sheet,c:Cam,X:number,d:number,bulge:number,bz:number,by=.6){
 const z0=-3.66,z1=3.66,H=2.44,back=(z:number,y=0)=>X+d*(2+bulge*.8*Math.exp(-Math.pow((z-bz)/1.6,2))*Math.exp(-Math.pow((y-by)/1.4,2)));
 const zs=[z0,-1.8,0,1.8,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0,1.9),1.9,z0],[back(z0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1,1.9),1.9,z1],[back(z1),0,z1]],
  [[X,H,z0],[X,H,z1],[back(z1,1.9),1.9,z1],...zs.slice(1,-1).reverse().map(z=>[back(z,1.9),1.9,z] as V3),[back(z0,1.9),1.9,z0]],
  [...zs.map(z=>[back(z),0,z] as V3),...zs.slice().reverse().map(z=>[back(z,1.9),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.3);s.tone(K,net,.12);
 const mesh=new Path2D();
 for(let i=0;i<=12;i++){const z=lerp(z0,z1,i/12);seg3(c,[X,H,z],[back(z,1.9),1.9,z],.025,mesh,.7);seg3(c,[back(z,1.9),1.9,z],[back(z),0,z],.025,mesh,.7);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<4;i++){const za=zs[i],zb=zs[i+1];seg3(c,[back(za,y),y,za],[back(zb,y),y,zb],.025,mesh,.7);}seg3(c,[X,y*H/1.9,z0],[back(z0,y),y,z0],.025,mesh,.7);seg3(c,[X,y*H/1.9,z1],[back(z1,y),y,z1],.025,mesh,.7);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+d*2*u,H-.54*u,z0],[X+d*2*u,H-.54*u,z1],.025,mesh,.7);}
 s.knockout(mesh,.8);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.19,fo);seg3(c,[X,0,z1],[X,H,z1],.19,fo);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.19,fo);s.fill(K,fo,.9);s.knockout(fr);
}
/** the net's bulge after the ball hits it (0 before), a damped wobble */
export const bulgeAt=(tau:number,hit:number)=>tau<hit?0:Math.exp(-(tau-hit)*2.2)*(1+.3*Math.sin((tau-hit)*14));

// ---------------------------------------------------------------- player tracks
/** Hermite through time-spaced keys [τ, x, z] (tangents scaled by segment length so speed stays continuous) */
export function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
export type Tracks={pos(k:number,tau:number):[number,number];dist(k:number,tau:number):number;vel(k:number,tau:number):[number,number];smooth(k:number,tau:number):[number,number];path(k:number,t0:number,t1:number,n?:number):[number,number][]};
/** per-actor tables at 50 Hz (position + distance run = the gait phase), built once at module load */
export function tracks(keys:number[][][],T0:number,T1:number):Tracks{const DT=.02;
 const TB=keys.map(ks=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(ks,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
 const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
 const pos=(k:number,tau:number):[number,number]=>[samp(TB[k].X,tau),samp(TB[k].Z,tau)];
 return{pos,dist:(k,tau)=>samp(TB[k].D,tau),
  vel(k,tau){const a=pos(k,tau-.08),b=pos(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];},
  smooth(k,tau){const a=pos(k,tau),b=pos(k,tau-.3),d=pos(k,tau-.6);return[(a[0]+b[0]+d[0])/3,(a[1]+b[1]+d[1])/3];},
  path(k,t0,t1,n=16){const o:[number,number][]=[];for(let i=0;i<=n;i++)o.push(pos(k,lerp(t0,t1,i/n)));return o;}};}
/** the ball spot a stride ahead of a runner on track k at τ, a touch to the side (side +1 = his right, −1 = his left) */
export function footOn(T:Tracks,k:number,tau:number,side=1,ahead=.45):[number,number]{const p=T.pos(k,tau),a=T.pos(k,tau-.08),b=T.pos(k,tau+.08),dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,fx=dx/l,fz=dz/l;
 return[p[0]+fx*ahead-fz*.12*side,p[1]+fz*ahead+fx*.12*side];}

// ---------------------------------------------------------------- one drawing pass: figures depth-sorted with the ball
export type CastE={k:number;x:number;z:number;g:Pt;h:number;d:number};
export type PlaySpec={n:number;pos:(k:number,tau:number)=>[number,number];ball:(tau:number)=>V3;
 /** draw actor k (the film's ONE adapter lives behind this) */
 draw:(k:number,e:CastE,o:{passing:boolean;px:number})=>DrawResult|undefined;ballInk?:string};
export function play(s:Sheet,c:Cam,v:View,tau:number,P:PlaySpec,o:{minBall?:number;trail?:number;trailFrom?:number;trailInk?:string;before?:()=>void}={}){
 const{minBall=6,trail=0}=o;
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!s._passage.pending;
 const list:CastE[]=[];
 for(let k=0;k<P.n;k++){const[x,z]=P.pos(k,tau),q=toCam(c,[x,.9,z]);if(q[2]<1.2)continue;const g=scr(c,toCam(c,[x,0,z])),h=c.F*1.85/q[2];if(!inView(v,g,h*1.2)&&!inView(v,[g[0],g[1]-h],h))continue;list.push({k,x,z,g,h,d:q[2]});}
 const b=P.ball(tau),bq=toCam(c,b),bg=bq[2]>=NEAR?scr(c,bq):null,br=bg?Math.max(minBall,c.F*.11/bq[2]):0,bground=pr(c,[b[0],0,b[2]]);
 const sh=new Path2D();for(const e of list)if(e.h<420)sh.addPath(polyPath(blob(e.g[0],e.g[1],e.h*.13,e.h*.035,e.k+3,{amp:.05,n:14}),true));
 if(bground&&bg)sh.addPath(polyPath(blob(bground[0],bground[1],br*.8,br*.25,2,{amp:.05,n:12}),true));s.tone(K,sh,.42);
 if(trail>0){const pts:Pt[]=[],t0=Math.max(o.trailFrom??-1e9,tau-.45);for(let i=0;i<=12;i++){const q=pr(c,P.ball(lerp(t0,tau,i/12)));if(q)pts.push(q);}if(pts.length>4){s.knockout(ribbon(pts,br*1.2,{seed:44,taper:.9,wobble:.6}),.6*trail);s.fill(o.trailInk??Y,ribbon(pts,br*.8,{seed:44,taper:.9,wobble:.6}),.9*trail);}}
 o.before?.();
 list.sort((p,q)=>q.d-p.d);
 const drawBall=()=>{if(bg)footballPanels(s,bg[0],bg[1],br,{rot:Math.hypot(b[0],b[2])/.11,key:K,shadow:P.ballInk??'blue',seed:5});};
 let ballDone=!list.length||bq[2]>=list[0].d;if(ballDone)drawBall();
 const res:(DrawResult|undefined)[]=[];
 for(const e of list){if(!ballDone&&bq[2]>=e.d){drawBall();ballDone=true;}res[e.k]=P.draw(e.k,e,{passing,px:e.h*ppu});}
 if(!ballDone)drawBall();
 return{list,bg,br,res};
}

// ---------------------------------------------------------------- teaching marks and effects
/** a broadcast speed streak (the replay wipe) */
export function streaks(s:Sheet,v:View,amt:number,seed:number,dir=0){if(amt<=.02)return;const p=new Path2D(),r=rng(seed);
 for(let i=0;i<16;i++){const y=(r()-.5)*2*v.hy,x0=(r()-.5)*2*v.hx,L=v.hx*(.6+r()*.9);p.addPath(ribbon([[x0-L*Math.cos(dir),y-L*Math.sin(dir)],[x0+L*Math.cos(dir),y+L*Math.sin(dir)]],12+r()*30,{seed:seed+i,taper:.8,wobble:1.5}));}
 s.tone(K,p,.55*amt);s.knockout(p,.35*amt);}
/** a ground arrow along world points (x, z), drawn progressively with w */
export function groundArrow(s:Sheet,c:Cam,P:[number,number][],ink:string,w:number,seed:number,wm=.12,y=.02){if(w<=0)return;
 const pts:Pt[]=[];let d=1;for(const[x,z] of P){const q=toCam(c,[x,y,z]);if(q[2]<1)continue;pts.push(scr(c,q));d=q[2];}
 if(pts.length<3)return;const n=Math.max(2,Math.round(pts.length*clamp(w))),seg=pts.slice(0,n),wd=Math.min(60,c.F*wm/d);
 s.knockout(ribbon(seg,wd*1.7,{seed,taper:.1,wobble:.8}),.8);s.fill(ink,ribbon(seg,wd,{seed,taper:.1,wobble:.8}),.95);
 const a=seg[seg.length-2],b=seg[seg.length-1];laneArrow(s,ink,a,[b[0]+(b[0]-a[0])*.01,b[1]+(b[1]-a[1])*.01],wd,{seed:seed+1,head:wd*3});}
/** a dashed arrow through the air along 3D points (a pass or shot line), drawn progressively with w */
export function airArrow(s:Sheet,c:Cam,P:V3[],ink:string,w:number,seed:number,wm=.1){if(w<=0)return;const pts:Pt[]=[];let d=1;for(const p of P){const q=toCam(c,p);if(q[2]<1)continue;pts.push(scr(c,q));d=q[2];}
 if(pts.length<3)return;const n=Math.max(2,Math.round(pts.length*clamp(w))),seg=pts.slice(0,n),wd=Math.min(50,c.F*wm/d);
 const gaps:[number,number][]=[];for(let x=.06;x<1;x+=.12)gaps.push([x,x+.05]);
 s.knockout(ribbon(seg,wd*1.6,{seed,taper:.1,wobble:.6}),.7);s.fill(ink,ribbon(seg,wd,{seed,taper:.1,wobble:.6,gaps}),.95);
 const a=seg[seg.length-2],b=seg[seg.length-1];laneArrow(s,ink,a,[b[0]+(b[0]-a[0])*.01,b[1]+(b[1]-a[1])*.01],wd,{seed:seed+1,head:wd*3});}
/** a flat ring on the grass */
export function groundRing(s:Sheet,c:Cam,x:number,z:number,rx:number,rz:number,ink:string,w:number,seed:number,fill=0){if(w<=0)return;const pts=ringPts(c,x,z,rx*(.6+.4*w),rz*(.6+.4*w),36);if(pts.length<30)return;
 if(fill>0)s.tone(ink,polyPath(pts,true),fill*w);
 const rr=ribbon(pts,Math.max(4,Math.min(40,kAt(c,[x,0,z])*.07)),{close:true,seed,taper:0,wobble:1});s.knockout(rr,.9*w);s.fill(ink,rr,.95*w);}
/** a ring round one boot (foot 'l' | 'r') of a drawn figure */
export function bootRing(s:Sheet,r:DrawResult|undefined,foot:'l'|'r',ink:string,w:number,seed=82){if(!r||w<=0)return;const toe=foot==='l'?r.joints.lToe:r.joints.rToe,an=foot==='l'?r.joints.lAn:r.joints.rAn,rad=Math.hypot(toe[0]-an[0],toe[1]-an[1])*1.25*w+2,cx=(toe[0]+an[0])/2,cy=(toe[1]+an[1])/2,pts:Pt[]=[];
 for(let i=0;i<26;i++){const a=i/26*TAU;pts.push([cx+Math.cos(a)*rad*1.2,cy+Math.sin(a)*rad*.8]);}s.knockout(ribbon(pts,Math.max(5,rad*.32),{seed,close:true,taper:0,wobble:.8}),.9*w);s.fill(ink,ribbon(pts,Math.max(3,rad*.2),{seed,close:true,taper:0,wobble:.8}),.95*w);}
/** a spark at a world point, alive for age ∈ (−.2, .6) */
export function spark(s:Sheet,c:Cam,P:V3,age:number,r:number,seed:number,ink=Y){if(age<=-.2||age>=.6)return;const q=pr(c,P);if(!q)return;
 sparkBurst(s,ink,q[0],q[1],Math.min(220,kAt(c,P)*r),{n:9,seed,g:easeOutBack(clamp((age+.2)/.2))*(1-clamp((age-.35)/.25)),width:Math.max(5,Math.min(20,kAt(c,P)*.05)),cov:.95});}
/** an X struck through a point (the option NOT taken), sized in sheet units */
export function strikeOut(s:Sheet,p:Pt|null,w:number,ink:string,cov:number){if(!p||cov<=0)return;const x=polyPath([[p[0]-w,p[1]-w],[p[0]+w,p[1]+w]],false);x.addPath(polyPath([[p[0]+w,p[1]-w],[p[0]-w,p[1]+w]],false));s.stroke(ink,x,Math.max(6,w*.22),.95*cov);}
/** turf spray (the touch micro-interaction): grass bits thrown from a point, 0..1 s */
export function spray(s:Sheet,x:number,y:number,age:number,seed:number,inkA:string,inkB:string,size=1){
 if(age<0||age>1)return;const r=rng(seed),a=new Path2D(),b=new Path2D(),u=easeOut(clamp(age/.7)),fl=Math.sin(Math.min(1,age/.8)*Math.PI);
 for(let i=0;i<14;i++){const ang=-Math.PI/2+(r()-.5)*2.2,d=(40+r()*170)*u*size,px=x+Math.cos(ang)*d,py=y+Math.sin(ang)*d*.5-fl*(30+r()*70)*size,z=(6+r()*9)*size,q:Pt[]=[[px-z,py-z*.4],[px+z*.6,py-z*.6],[px+z,py+z*.3],[px-z*.4,py+z*.5]];(i%3?a:b).addPath(polyPath(q,true));}
 const fade=1-clamp((age-.6)/.4);s.fill(inkB,b,.6*fade);s.fill(inkA,a,.9*fade);
}
/** the standard touch reaction: turf spray + a spark (reduced motion: the static spark) */
export function touchTurf(s:Sheet,x:number,y:number,age:number,seed:number,inkA:string,inkB:string){if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}spray(s,x,y,age,seed,inkA,inkB,2.2);if(age<.35)sparkBurst(s,Y,x,y-20,110,{n:7,seed:seed+1,g:easeOutBack(clamp(age/.15))*(1-clamp((age-.2)/.15)),width:15});}
