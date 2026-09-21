/** The Boat and the Weather — riso. Weather = orange fronts with ONE moving torn edge + diagonal streak rain;
 * people are ABSTRACT riso figures (bible §1c.4, `figure()` below): the sailor (navy), the opponent (orange), the teammate (purple);
 * the sail = paper cloth with navy seams that the front shows through; the tiller/heading line = the one clear choice.
 * Inks: orange → blue → purple → navy on cream. Water is blue grain with paper crests (never rings, never bands). */
import type {Sheet} from '../sheet';
import {type RisoStory,type Scene,playChapters} from '../story';
import {apertureDisc} from '../passage';
import {twos,twosIndex,sm,easeOut,easeIO,easeIn,easeOutBack,key,camKeys,anticipate,settle,spring,clamp,lerp,rng,hash,noise1,blob,polyPath,ribbon,wob,rotPts,circlePath,rectPath,smoothPts,type Pt} from '../motion';
import {contour,dust,handCut,tornRect,footballPanels,confetti,speedLines} from '../shapes';

const CH='/stories/narration/11v11/boat-weather/';
const K='navy',P='purple',O='orange',B='blue';
const D=Math.PI/180;
const BIG=rectPath(-4000,-4000,8000,8000);
void BIG;

// ---------------- abstract riso figure (bible §1c.4) — copied verbatim into each 11v11 story file ----------------
/** A person as a paper cut-out: one head disc, one torso block, two leg strokes, two arm strokes (3–6 shapes), big head, short legs,
 * torn/wobbly edges, one ink (or a paper knockout for dark prints). (x,y) = the ground point between the feet for standing poses, the seat
 * point for sitting poses; size = the figure's height; facing +1 = toward +x. Emotion lives in the pose only (never a face). */
export type Pose='stand'|'walk'|'run'|'kick'|'reach'|'point'|'lean'|'listen'|'slump'|'curl'|'lookBack'|'sit'|'sitSlump'|'sitKnee'|'sitBack'|'kneel'|'lie';
export type Limb=[Pt,Pt,Pt];
type PoseSpec={hip:Pt;top:Pt;head:Pt;legs:Limb[];arms:Limb[];tilt:number;headDrop?:Pt};
export type FigureOpts={facing?:number;mode?:'ink'|'paper';cov?:number;paperTone?:number;toneInk?:string;rot?:number;tilt?:number;headDrop?:Pt;legs?:Limb[];arms?:Limb[];head?:Pt;scaleX?:number;headScale?:number};
const F_STAND:Limb[]=[[[-.05,-.3],[-.07,-.15],[-.1,0]],[[.05,-.3],[.07,-.15],[.1,0]]];
const F_HANG:Limb[]=[[[-.16,-.6],[-.24,-.46],[-.23,-.3]],[[.16,-.6],[.24,-.46],[.23,-.3]]];
const F_DANGLE:Limb[]=[[[0,0],[.18,.02],[.2,.28]],[[0,0],[.12,.05],[.12,.3]]];
const F_UP:PoseSpec={hip:[0,-.3],top:[0,-.64],head:[0,-.82],legs:F_STAND,arms:F_HANG,tilt:0},F_SEAT:PoseSpec={hip:[0,0],top:[0,-.36],head:[0,-.54],legs:F_DANGLE,arms:F_HANG,tilt:.04};
const POSES:Record<Pose,PoseSpec>={
 stand:F_UP,
 walk:{...F_UP,legs:[[[-.04,-.3],[-.12,-.15],[-.2,0]],[[.04,-.3],[.14,-.16],[.2,0]]],arms:[[[-.13,-.6],[-.2,-.5],[-.24,-.38]],[[.13,-.6],[.22,-.52],[.28,-.42]]],tilt:.06},
 run:{...F_UP,legs:[[[-.04,-.3],[-.2,-.2],[-.34,-.06]],[[.04,-.3],[.2,-.28],[.26,-.1]]],arms:[[[-.13,-.6],[-.28,-.5],[-.3,-.36]],[[.13,-.6],[.26,-.56],[.32,-.68]]],tilt:.22},
 kick:{...F_UP,legs:[[[-.04,-.3],[-.1,-.15],[-.14,0]],[[.05,-.3],[.22,-.24],[.44,-.2]]],arms:[[[-.13,-.6],[-.3,-.62],[-.44,-.7]],[[.13,-.6],[.28,-.5],[.34,-.36]]],tilt:-.08},
 reach:{...F_UP,arms:[[[-.13,-.6],[-.2,-.8],[-.22,-1.02]],[[.13,-.6],[.2,-.8],[.22,-1.02]]]},
 point:{...F_UP,arms:[[[-.16,-.6],[-.24,-.46],[-.23,-.3]],[[.13,-.6],[.3,-.62],[.5,-.66]]]},
 lean:{...F_UP,arms:[[[-.13,-.6],[-.1,-.45],[-.06,-.3]],[[.13,-.6],[.2,-.48],[.22,-.34]]],tilt:.16},
 listen:{...F_UP,head:[.05,-.8],arms:[[[-.13,-.6],[-.1,-.45],[-.06,-.3]],[[.13,-.6],[.26,-.68],[.2,-.8]]],tilt:.14},
 slump:{...F_UP,arms:[[[-.16,-.6],[-.16,-.42],[-.12,-.26]],[[.16,-.6],[.22,-.42],[.22,-.26]]],tilt:.22,headDrop:[.02,.08]},
 curl:{hip:[0,-.2],top:[0,-.5],head:[0,-.66],legs:[[[0,-.2],[-.12,-.08],[-.18,0]],[[0,-.2],[.16,-.1],[.22,0]]],arms:[[[-.12,-.46],[-.02,-.34],[.08,-.26]],[[.14,-.46],[.24,-.36],[.28,-.26]]],tilt:.85,headDrop:[.04,.06]},
 lookBack:{...F_UP,head:[-.08,-.82],arms:[[[-.13,-.6],[-.26,-.52],[-.3,-.4]],[[.16,-.6],[.24,-.46],[.23,-.3]]]},
 sit:{...F_SEAT,arms:[[[-.03,-.32],[.06,-.18],[.12,-.04]],[[.12,-.32],[.2,-.18],[.22,-.04]]]},
 sitSlump:{...F_SEAT,arms:[[[-.04,-.32],[.12,-.2],[.22,-.02]],[[.12,-.32],[.26,-.2],[.3,-.04]]],tilt:.3,headDrop:[.05,.07]},
 sitKnee:{...F_SEAT,legs:[[[0,0],[.2,-.24],[.28,0]],[[0,0],[.12,.05],[.12,.3]]],arms:[[[-.03,-.32],[.04,-.18],[.1,-.06]],[[.12,-.32],[.24,-.26],[.26,-.22]]],tilt:.08},
 sitBack:{...F_SEAT,arms:[[[-.06,-.3],[-.18,-.16],[-.26,0]],[[.02,-.3],[-.12,-.14],[-.18,.02]]],tilt:-.22},
 kneel:{hip:[0,-.16],top:[0,-.5],head:[0,-.68],legs:[[[0,-.16],[-.12,-.04],[-.3,0]],[[0,-.16],[.14,-.1],[.2,0]]],arms:[[[-.16,-.46],[-.24,-.32],[-.23,-.16]],[[.16,-.46],[.24,-.32],[.23,-.16]]],tilt:0},
 lie:{hip:[0,0],top:[0,-.36],head:[0,-.54],legs:[[[0,0],[.2,.01],[.4,.03]],[[0,0],[.18,.06],[.38,.08]]],arms:[[[-.1,-.32],[-.26,-.3],[-.4,-.22]],[[-.06,-.3],[-.18,-.16],[-.3,-.06]]],tilt:-1.35},
};
export function figure(s:Sheet,x:number,y:number,size:number,ink:string,seed:number,pose:Pose,o:FigureOpts={}){
 const{facing=1,mode='ink',cov=1,paperTone=.2,toneInk,rot=0,tilt:extra=0,scaleX=1,headScale=1}=o,P=POSES[pose],tilt=P.tilt+extra,hip=P.hip;
 const ct=Math.cos(tilt),st=Math.sin(tilt),rotP=(p:Pt):Pt=>{const dx=p[0]-hip[0],dy=p[1]-hip[1];return[hip[0]+dx*ct-dy*st,hip[1]+dx*st+dy*ct];};
 const hd=o.headDrop??P.headDrop??[0,0],headC=rotP(o.head??P.head),head:Pt=[headC[0]+hd[0],headC[1]+hd[1]],top=rotP(P.top);
 const arms=(o.arms??P.arms).map(l=>l.map(rotP) as Limb),legs=o.legs??P.legs;
 const cr=Math.cos(rot),sr=Math.sin(rot),W=(p:Pt):Pt=>{const px=p[0]*size*facing*scaleX,py=p[1]*size;return[x+px*cr-py*sr,y+px*sr+py*cr];};
 const torso=[[-.19,P.top[1]],[.19,P.top[1]],[.14,hip[1]+.03],[-.14,hip[1]+.03]].map(p=>W(rotP(p as Pt)));
 const part=(path:Path2D)=>{if(mode==='paper'){s.knockout(path,.95);if(paperTone>0)s.tone(toneInk??ink,path,paperTone);}else s.fill(ink,path,cov);};
 const limb=(l:Limb,width:number,sd:number)=>ribbon(l.map(W),width,{seed:sd,pressure:.3,taper:.12,wobble:size*.006,step:Math.max(4,size*.03)});
 part(limb(legs[0],size*.11,seed+1));part(limb(arms[0],size*.085,seed+2));
 part(polyPath(handCut(torso,seed+3,size*.012,size*.12),true));
 part(limb(legs[1],size*.11,seed+4));part(limb(arms[1],size*.085,seed+5));
 const hw=W(head);part(polyPath(blob(hw[0],hw[1],size*.16*headScale,size*.16*headScale,seed+6,{amp:.05,n:28}),true));
 return{head:hw,top:W(top),hip:W(hip),hands:[W(arms[0][2]),W(arms[1][2])] as [Pt,Pt],feet:[W(legs[0][2]),W(legs[1][2])] as [Pt,Pt]};
}
/** Run cycle: the two leg/arm keyframes swapped on the twos grid (k = 0 | 1). */
export const stride=(k:number):{legs:Limb[];arms:Limb[]}=>{const R=POSES.run,sw=(a:Limb,b:Limb):Limb[]=>[[a[0],b[1],b[2]],[b[0],a[1],a[2]]];return k%2?{legs:sw(R.legs[0],R.legs[1]),arms:sw(R.arms[0],R.arms[1])}:{legs:R.legs,arms:R.arms};};
/** mixLimbs(a,b,u): interpolate two limb sets (arms lowering, a straightening) — pass the result as opts.arms / opts.legs. */
export const mixLimbs=(a:Limb[],b:Limb[],u:number):Limb[]=>a.map((l,i)=>l.map((p,j)=>[lerp(p[0],b[i][j][0],u),lerp(p[1],b[i][j][1],u)] as Pt) as Limb);
export const poseLimbs=(p:Pose)=>({arms:POSES[p].arms,legs:POSES[p].legs});

/** a cut-out person on the water: a paper knockout beneath so the ink prints clean over the blue sea. */
function person(s:Sheet,x:number,y:number,size:number,ink:string|'paper',seed:number,pose:Pose,o:FigureOpts={}){
 if(ink==='paper')return figure(s,x,y,size,B,seed,pose,{...o,mode:'paper',paperTone:o.paperTone??.12});
 figure(s,x,y,size,K,seed,pose,{...o,mode:'paper',paperTone:0});return figure(s,x,y,size,ink,seed,pose,{...o,mode:'ink',cov:o.cov??.92});
}
/** the referee's decision: a paper disc with a navy whistle silhouette (barrel + mouthpiece), popping in with an overshoot. */
function whistleDisc(s:Sheet,x:number,y:number,r:number,seed:number,g=1){if(g<=0)return;s.save();s.translate(x,y);s.scale(g);
 s.knockout(polyPath(blob(0,0,r,r,seed,{amp:.04,n:32}),true),.95);contour(s,K,blob(0,0,r,r,seed,{amp:.04,n:32}),8,{close:true,seed:seed+1,pressure:.5,wobble:1.5});
 s.fill(K,polyPath(blob(r*.15,r*.15,r*.36,r*.33,seed+2,{amp:.04,n:24}),true),.95);s.fill(K,ribbon([[-r*.05,-r*.05],[-r*.55,-r*.42]],r*.22,{seed:seed+3,taper:.1,wobble:1}),.95);
 s.knockout(polyPath(blob(r*.1,r*.18,r*.1,r*.1,seed+4),true),.95);s.restore();}

// ---------------- weather kit ----------------
/** Gust envelope 0..1: onset rise, held peak, eased recovery. */
const gust=(t:number,t0:number,onset:number,peak:number,rec:number)=>{const u=t-t0;if(u<=0)return 0;if(u<onset)return easeIO(u/onset);if(u<onset+peak)return 1;return 1-easeOut(clamp((u-onset-peak)/rec));};
/** Water below a wobbly horizon: blue field with mottle over the whole sheet, the sky knocked back to paper and given a light blue screen. */
function sea(s:Sheet,horizonY:number,seed:number,o:{skyTone?:number;amp?:number;tilt?:number}={}){
 const{skyTone=.12,amp=14,tilt=0}=o;s.field(B,1,.5);
 const pts:Pt[]=[[-4000,-4000],[4000,-4000]];for(let i=20;i>=0;i--){const x=-4000+i*400;pts.push([x,horizonY+x*tilt+amp*noise1(i*.7+seed,seed)]);}
 const sky=polyPath(pts,true);s.knockout(sky);if(skyTone>0)s.tone(B,sky,skyTone);
}
/** A weather front: one grainy orange field bounded by ONE hand-torn leading edge (edge points ordered along the edge; `side` closes the polygon far away on the covered side). */
function front(s:Sheet,edge:Pt[],side:Pt[],seed:number,o:{cov?:number;teeth?:number;contour?:number;ink?:string}={}){
 const{cov=.75,teeth=60,contour:c=0,ink=O}=o,cut=handCut(edge,seed,teeth,140,false);
 s.fill(ink,polyPath([...cut,...side],true),cov);
 if(c>0)s.fill(K,ribbon(cut,11,{seed:seed+1,pressure:.7,taper:.3,wobble:2,step:14,gaps:c<1?[[c,1]]:[]}),.95);
 return cut;
}
/** Streaks: n thin slanted quads in a box (rain = blue, wind = orange, spray/crests = paper). drift scrolls them (seeded, wrapped). */
function streaks(s:Sheet,ink:string|null,box:[number,number,number,number],n:number,len:number,angle:number,width:number,cov:number,seed:number,drift:Pt=[0,0],curve=0){
 const rr=rng(seed),p=new Path2D(),ca=Math.cos(angle),sa=Math.sin(angle),[bx,by,bw,bh]=box;
 for(let i=0;i<n;i++){const x=bx+(((rr()*bw+drift[0])%bw)+bw)%bw,y=by+(((rr()*bh+drift[1])%bh)+bh)%bh,L=len*(.5+rr()),w=width*(.6+rr()*.8);
  if(curve>0){const q:Pt[]=[];for(let k=0;k<=4;k++){const u=k/4;q.push([x+ca*L*u-sa*curve*Math.sin(u*Math.PI),y+sa*L*u+ca*curve*Math.sin(u*Math.PI)]);}for(let k=0;k<=4;k++){p.lineTo(q[k][0],q[k][1]);}for(let k=4;k>=0;k--)p.lineTo(q[k][0]-sa*w,q[k][1]+ca*w);p.closePath();}
  else{p.moveTo(x,y);p.lineTo(x+ca*L,y+sa*L);p.lineTo(x+ca*L-sa*w,y+sa*L+ca*w);p.lineTo(x-sa*w,y+ca*w);p.closePath();}}
 if(ink)s.fill(ink,p,cov);else s.knockout(p,cov);
}
/** A dashed (or solid) navy heading line a→b; progress draws it tip-leading. */
function heading(s:Sheet,a:Pt,b:Pt,w:number,seed:number,o:{dashes?:number;progress?:number;solid?:number;cov?:number;sag?:number}={}){
 const{dashes=12,progress=1,solid=0,cov=.92,sag=0}=o;if(progress<=0)return;const L=Math.hypot(b[0]-a[0],b[1]-a[1]);
 const pt=(u:number):Pt=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)+sag*Math.sin(u*Math.PI)];
 if(solid>=1){s.fill(K,ribbon([pt(0),pt(.5),pt(progress)],w,{seed,pressure:.5,taper:.2,wobble:1.5,step:12}),cov);return;}
 const p=new Path2D();for(let i=0;i<dashes;i++){const u0=i/dashes+.02,u1=(i+.6+solid*.4)/dashes;if(u0>progress)break;const q0=pt(u0),q1=pt(Math.min(u1,progress)),dx=q1[0]-q0[0],dy=q1[1]-q0[1],l=Math.hypot(dx,dy)||1,nx=-dy/l*w/2,ny=dx/l*w/2;p.moveTo(q0[0]+nx,q0[1]+ny);p.lineTo(q1[0]+nx,q1[1]+ny);p.lineTo(q1[0]-nx,q1[1]-ny);p.lineTo(q0[0]-nx,q0[1]-ny);p.closePath();}
 s.fill(K,p,cov);
}
/** The sail seen from the side: apex A, tack T (at the mast foot), clew C. belly bulges the leech away from the mast; flutter shakes the leech on twos; tint lets the front show through. */
function sail(s:Sheet,A:Pt,T:Pt,C:Pt,seed:number,o:{belly?:number;flutter?:number;tint?:number;cov?:number;ink?:string;seamCov?:number}={}){
 const{belly=0,flutter=0,tint=0,cov=.95,ink,seamCov=.9}=o;
 const ex=C[0]-A[0],ey=C[1]-A[1],el=Math.hypot(ex,ey)||1;let nx=-ey/el,ny=ex/el;const tx=T[0]-A[0],ty=T[1]-A[1];if(nx*tx+ny*ty>0){nx=-nx;ny=-ny;}
 const leech:Pt[]=[];for(let i=0;i<=8;i++){const u=i/8,off=belly*Math.sin(u*Math.PI)+flutter*Math.sin(u*9+seed)*u;leech.push([A[0]+ex*u+nx*off,A[1]+ey*u+ny*off]);}
 const pts=wob([...leech,T],2,seed,true,{step:12,corner:.5}),path=polyPath(pts,true);
 if(ink)s.fill(ink,path,cov);else{s.knockout(path,cov);if(tint>0)s.tone(O,path,tint);}
 const seams=new Path2D();for(const u of[.18,.34,.5,.66,.82]){const p1:Pt=[lerp(A[0],T[0],u),lerp(A[1],T[1],u)],p2:Pt=[lerp(C[0],T[0],u),lerp(C[1],T[1],u)],m:Pt=[(p1[0]+p2[0])/2+nx*belly*.55*(1-u),(p1[1]+p2[1])/2+ny*belly*.55*(1-u)];seams.addPath(ribbon([p1,m,p2],6,{seed:seed+u*10,pressure:.4,taper:.4,wobble:1.5,step:16}));}
 s.fill(K,seams,seamCov);
 contour(s,K,pts,7,{close:true,seed:seed+3,pressure:.5,wobble:1.5,cov:.9});
}
/** A hull from the side: paper body with a navy contour, heeled about its keel point. */
function hullSide(s:Sheet,x:number,y:number,w:number,h:number,heel:number,seed:number,o:{ink?:string;cov?:number}={}){
 s.save();s.translate(x,y+h);s.rotate(heel);
 const pts=wob([[-w/2,-h],[w/2,-h],[w*.44,0],[-w*.36,0]],3,seed,true,{step:16,corner:.5}),p=polyPath(pts,true);
 if(o.ink){s.knockout(p);s.fill(o.ink,p,o.cov??.9);}else s.knockout(p,.95);
 contour(s,K,pts,10,{close:true,seed:seed+1,pressure:.6,wobble:2});
 s.restore();
}
/** The buoy-ball: paper sphere with navy panels and a navy waterline ring. */
function buoy(s:Sheet,x:number,y:number,r:number,rot:number,seed:number,o:{sx?:number;sy?:number;lit?:number}={}){
 const{sx=1,sy=1}=o;s.save();s.translate(x,y);s.scale(sx,sy);footballPanels(s,0,0,r,{rot,key:K,shadow:P,seed,light:[-.3,-.5]});
 s.fill(K,ribbon(blob(0,r*.15,r*.96,r*.3,seed+5,{amp:.03,n:32}),Math.max(3,r*.06),{seed:seed+6,close:true,pressure:.4,wobble:1}),.9);s.restore();
}
/** Tiller: a navy bar from the pivot, swung by `angle` (0 = pointing down the deck toward the viewer). */
function tiller(s:Sheet,px:number,py:number,angle:number,len:number,seed:number){const a=Math.PI/2+angle;s.fill(K,ribbon([[px,py],[px+Math.cos(a)*len,py+Math.sin(a)*len]],22,{seed,pressure:.3,taper:.15,wobble:1.2}));s.fill(K,polyPath(blob(px,py,20,20,seed+1,{amp:.05,n:16}),true));}
/** Pennant/flag: a triangle at a masthead pointing along `angle`, drooping by `droop`. */
function pennant(s:Sheet,x:number,y:number,angle:number,size:number,seed:number,o:{ink?:string;droop?:number;flutter?:number}={}){const{ink=P,droop=0,flutter=0}=o,a=angle+droop;const tip:Pt=[x+Math.cos(a)*size*2.2,y+Math.sin(a)*size*2.2+flutter];const pts=wob([[x,y-size*.45],[tip[0],tip[1]],[x,y+size*.45]],1.5,seed,true,{step:8,corner:.5});s.fill(ink,polyPath(pts,true),.92);}
/** Signal flag: a rectangle split diagonally in two inks, unfurling from a furled bar (open 0..1). */
function flag(s:Sheet,x:number,y:number,w:number,h:number,open:number,seed:number,inks:[string,string]){const ww=w*Math.max(.12,open),hh=h*(.5+.5*open);const q=wob([[x,y-hh/2],[x+ww,y-hh/2+8*open],[x+ww,y+hh/2],[x,y+hh/2]],2,seed,true,{step:10,corner:.4});s.knockout(polyPath(q,true));s.fill(inks[0],polyPath([q[0],q[1],q[2]],true),.9);s.fill(inks[1],polyPath([q[0],q[2],q[3]],true),.95);}
/** A hull seen from above: a paper lens (or an ink lens) pointing along `heading`. */
function hullTop(s:Sheet,x:number,y:number,heading:number,len:number,wid:number,seed:number,o:{ink?:string;cov?:number;contour?:number}={}){
 const{ink,cov=.9,contour:c=1}=o,pts:Pt[]=[];for(let i=0;i<24;i++){const a=i/24*Math.PI*2,px=Math.cos(a)*len/2,py=Math.sin(a)*wid/2*(1-.35*Math.max(0,Math.cos(a)));pts.push([x+px*Math.cos(heading)-py*Math.sin(heading),y+px*Math.sin(heading)+py*Math.cos(heading)]);}
 const q=wob(pts,2,seed,true,{step:10,corner:.6}),p=polyPath(q,true);s.knockout(p);if(ink)s.fill(ink,p,cov);if(c>0)contour(s,K,q,8,{close:true,seed:seed+1,pressure:.5,wobble:1.5,cov:c});
}
/** An opponent hull from the side: an orange bow wedge with a paper bow-wave. */
function orangeHull(s:Sheet,x:number,y:number,w:number,h:number,seed:number,wave=1){
 const pts=wob([[x-w/2,y],[x+w/2,y-h*.2],[x+w/2,y+h*.7],[x-w*.4,y+h*.8]],3,seed,true,{step:16,corner:.5}),p=polyPath(pts,true);
 s.knockout(p);s.fill(O,p,.88);contour(s,K,pts,9,{close:true,seed:seed+1,pressure:.6,wobble:2});
 if(wave>0)s.knockout(polyPath(blob(x+w/2+30,y+h*.55,60*wave,26*wave,seed+2,{amp:.1,n:16}),true),.9);
}
const spray=(s:Sheet,x:number,y:number,age:number,seed:number,n=8,r=140)=>{if(age<0||age>1.2)return;const rr=rng(seed),p=new Path2D();for(let i=0;i<n;i++){const a=-Math.PI/2+(rr()-.5)*1.6,v=r*(.5+rr()),px=x+Math.cos(a)*v*age,py=y+Math.sin(a)*v*age+380*age*age,sz=7+rr()*8;p.addPath(circlePath(px,py,sz*(1-age*.5)));}s.knockout(p,.9);};

// ---------------- chapters ----------------
// ch1 — deck-level sea: the buoy thrown, an opponent hull, a decision flag, the tiller swinging free then centring
const ch1:Scene={
 draw(s,t){
  const tt=twos(t),g1=gust(t,0,.3,.6,1.2);
  const swell=Math.sin(t*2.1)*g1;
  const v=camKeys(s,t,[[0,-60,90,1.0,0],[2.8,-100,60,1.08,0],[3.0,-260,-100,1.12,0],[4.2,-260,-100,1.12,0],[6.7,60,60,1.16,3*D],[9.23,20,260,1.36,-6*D],[9.883,21,261,1.362,-6*D]]);
  const yank=settle(t,3.0,{amp:26,freq:4,decay:5});s.camera(v[0]+yank,v[1],v[2],v[3]+(2*swell+3*settle(t,4.9,{amp:1,freq:2,decay:2}))*D);
  sea(s,-60,11,{skyTone:.25});
  // the front: one torn edge advancing from the top-right; brown where it crosses the water
  const adv=30*Math.min(t,9)+60*sm(5.4,5.7,t,easeOut);
  front(s,[[560-adv,-900],[540-adv,-400],[200-adv,-60],[120-adv,320]],[[4000,320],[4000,-900]],12,{cov:.72,teeth:70});
  // crests drifting left; the hull's wake shoves two aside
  const drift=t<6.7?-40*t:-40*6.7;
  streaks(s,null,[-700,-40,1400,400],16,140,0,10,.9,13,[drift,0],14);
  // the buoy: riding the swell, thrown by the rogue crest at 2.8, landing with a squash and droplets
  const crest=sm(2.6,2.8,t),throwU=sm(2.8,3.3,t,easeOut),land=t-3.3;
  let bx=-140,by=40-14*swell*Math.sin(t*2.1),sx=1,sy=1,rot=.3;
  if(t>=2.6&&t<2.8)by+=10*crest;
  if(t>=2.8){bx=lerp(-140,-320,throwU);by=lerp(50,-160,throwU)-140*Math.sin(throwU*Math.PI);rot=.3+throwU*Math.PI/2;}
  if(land>=0){const w=settle(t,3.3,{amp:.12,freq:4,decay:5,phase:Math.PI/2});sx=1+w;sy=1-w;by=-160+6*Math.sin(t*2)+(1-sm(3.3,3.6,t))*0;}
  if(t>=2.5&&t<3.4){const rise=sm(2.5,2.8,t,easeOut)*(1-sm(2.8,3.4,t));s.knockout(polyPath(blob(-140,90,110,26*rise+4,14,{amp:.1,n:20}),true),.9);}
  if(throwU>0&&throwU<.5){const pts=blob(bx,by,90,90,15,{amp:.02,n:32}).map(p=>[p[0]+(1-throwU*2)*40,p[1]+(1-throwU*2)*30] as Pt);s.knockout(polyPath(pts,true),.4);}
  // the strange bounce: an orange opponent steps in from the right (stride, smear) and the buoy deflects off it at 2.8
  const stepIn=sm(2.1,2.8,t,easeOut),st=stride(twosIndex(t)),oppX=lerp(720,60,stepIn)+(stepIn>=1?20*settle(t,2.8,{amp:1,freq:4,decay:5}):0);
  if(t>=2.1)person(s,oppX,150,320,O,18,stepIn<1?'run':t<3.4?'kick':'stand',{facing:-1,legs:stepIn<1?st.legs:undefined,arms:stepIn<1?st.arms:undefined,tilt:stepIn<1?.12:0});
  if(stepIn>0&&stepIn<.8)speedLines(s,K,oppX+80,-40,Math.PI,{n:4,seed:19,len:120,spread:50,width:6,cov:.8});
  buoy(s,bx,by,108,rot,16,{sx,sy});spray(s,-320,-120,land,17,8,180);
  // the opponent hull cuts in behind (4.2): brown water under it, crests shoved
  const hullIn=t<4.2?-1:anticipate(4.2,4.9,t,{back:.05,hold:.2,e:easeOut});
  if(hullIn>=0){const hx=lerp(760,300,hullIn)-40*settle(t,4.9,{amp:1,freq:3,decay:4});s.tone(O,polyPath(blob(hx,40,260,60,20,{amp:.08,n:24}),true),.5);orangeHull(s,hx,-70,340,150,21,1);}
  // the decision you disagree with (5.4): the referee's whistle disc pops in over the water with an overshoot
  const open=t<5.4?0:easeOutBack(sm(5.4,5.7,t))*(1+.06*settle(t,5.7,{amp:1,freq:6,decay:5}));whistleDisc(s,-380,-300,90,22,clamp(open,0,1.15));
  // the deck: gunwale, planks, the tiller
  const deck=polyPath([[-4000,400],[-600,400],[-300,386],[0,382],[300,386],[600,400],[4000,400],[4000,4000],[-4000,4000]],true);s.knockout(deck,.95);s.tone(P,deck,.32);s.tone(K,tornRect(-900,560,1800,900,29,20),.15);
  const planks=new Path2D();for(let i=0;i<5;i++){planks.addPath(ribbon([[-700,450+i*70],[700,440+i*70]],7,{seed:22+i,pressure:.3,taper:0,wobble:1.5,step:40}));}s.fill(K,planks,.7);
  s.fill(K,ribbon([[-600,400],[-300,386],[0,382],[300,386],[600,400]],16,{seed:27,pressure:.6,taper:.1,wobble:1.5,step:30}));
  const swing=t<5.4?20*Math.sin(t*2.1-.6)*(.4+.6*g1)+30*settle(t,3.3,{amp:1,freq:2.5,decay:3}):t<7.3?20*Math.sin(5.4*2.1-.6)*(.4+.6*g1)*1:lerp(20*Math.sin(5.4*2.1-.6),0,sm(7.3,7.9,t,easeIO));
  // the sailor at the tiller (me): a hand on the bar, leaning with each swing
  person(s,-40,400,260,K,23,'point',{facing:1,tilt:-.004*swing,arms:mixLimbs(poseLimbs('stand').arms,poseLimbs('point').arms,.8)});
  tiller(s,60,400,swing*D,300,28);
  // the first hint: a faint dashed heading line ahead-left (7.9)
  heading(s,[60,400],[-320,0],12,29,{dashes:12,progress:sm(7.9,8.5,t,easeOut),cov:.75});
  spray(s,-450,-30,t-8.2,30,5,120);
  streaks(s,O,[-700,-700,1400,660],20,140,-8*D,5,.35+.15*g1,31,[-260*t,0]);
 },
 aperture(){return apertureDisc(-140,190,60,12);},
};
// ch2 — looking up the mast: the shifting wind backwinds the untrimmed sail, the sheet is hauled, a pennant asks and is answered
const A2:Pt=[40,-480],T2:Pt=[-300,320];
function rig2(t:number){
 const heel=key(t,[[2.74,0],[2.9,-1],[3.5,9,easeIn],[3.7,11],[3.94,9],[4.86,9],[5.06,11],[5.6,-2,easeIO],[5.85,1],[6.1,0]]);
 const boom=key(t,[[4.86,0],[5.06,-9,easeIn],[5.4,31,easeIO],[5.55,26],[5.75,28]]);
 const belly=key(t,[[0,0],[2.74,0],[2.9,-40],[3.94,-46],[4.86,-46],[5.0,-52],[5.5,60,easeIO],[5.7,66],[6.0,62]]);
 return{heel:heel*D,boom:boom*D,belly};}
const ch2:Scene={
 draw(s,t){
  const {heel,boom,belly}=rig2(t),g2=gust(t,0,.3,.6,1.2),g3=gust(t,2.74,.4,.8,1.2);
  const v=camKeys(s,t,[[0,-20,-150,.92,0],[1.2,0,-170,1.0,0],[2.74,0,-170,1.0,0],[3.94,0,-170,1.06,-4*D],[4.86,60,-100,1.1,-4*D],[8.03,40,-160,1.35,0],[8.683,41,-161,1.352,0]]);
  s.camera(v[0]-20*g2-30*g3,v[1],v[2],v[3]);
  // sky: paper with a blue screen, the front's torn edge diagonal, wind streaks, the water band below
  s.field(B,.12,0);
  const adv=60*Math.min(t,1.2)*g2+40*sm(2.74,3.2,t);
  front(s,[[-900,-560+adv*.2],[-540,-300-adv*.3],[0,-120-adv*.4],[540,60-adv*.5],[900,180-adv*.5]],[[4000,-4000],[-4000,-4000]],32,{cov:.72,teeth:80});
  const wAng=key(t,[[2.74,-15],[3.14,-40]])*D;
  streaks(s,O,[-900,-700,1800,1000],34,160,wAng,6,.3+.2*g2+.15*g3,33,[-260*t,0]);
  s.save();s.translate(-40,340);s.rotate(heel*.5);s.translate(40,-340);
  s.fill(B,polyPath(wob([[-4000,300],[4000,300],[4000,4000],[-4000,4000]],10,34,true,{step:60,corner:.4}),true),.95);streaks(s,null,[-800,310,1600,300],10,110,0,6,.9,35,[-40*t,0],18);
  heading(s,[-40,330],[300,300],12,36,{dashes:10,progress:sm(5.4,6.0,t,easeOut)});
  s.restore();
  // the rig rotates about the mast foot (-40,340) as one heavy mass
  s.save();s.translate(-40,340);s.rotate(heel);s.translate(40,-340);
  const clew:Pt=[240+ (Math.cos(boom)-1)*540,320-Math.sin(boom)*380];
  const flutter=(g2*14+(g3>0&&t<4.86?8:0))*(twosIndex(t)%2?1:-1)*(1-sm(5.35,5.6,t));
  sail(s,A2,T2,clew,37,{belly:belly,flutter,tint:.25});
  s.fill(K,ribbon([[-40,-520],[-40,340]],18,{seed:38,taper:0,pressure:.3,wobble:1}));
  s.fill(K,ribbon([T2,clew],14,{seed:39,taper:0,pressure:.3,wobble:1}));
  // the sheet rope: sag straightens on the haul
  const sag=lerp(60,6,sm(4.86,5.16,t,easeIO));s.fill(K,ribbon([clew,[lerp(clew[0],200,.5),lerp(clew[1],340,.5)+sag],[200,340]],6,{seed:40,taper:.2,pressure:.4,wobble:1.5}),.9);
  s.fill(K,polyPath(blob(200,340,16,10,41,{amp:.1}),true));
  // the sailor hauls the sheet: arms up on the rope, pulled down through the haul (4.86 → 5.16)
  const haul=sm(4.86,5.16,t,easeIO),rL=poseLimbs('reach'),sL=poseLimbs('stand');
  person(s,250,340,240,K,42,'stand',{facing:-1,arms:mixLimbs(rL.arms,sL.arms,haul),tilt:-.1*haul+.02*Math.sin(t*2.1)});
  // the pennant runs up the mast (6.66)
  const up=easeOut(sm(6.66,7.16,t)),py=lerp(-200,-520,up)-10*settle(t,7.16,{amp:1,freq:4,decay:5});
  if(t>=6.66)pennant(s,-40,py,0,44,43,{flutter:4*Math.sin(twos(t)*10)});
  s.restore();
  // help answers: a purple sail tip rises on the horizon with its own pennant
  const ans=easeOut(sm(7.06,7.5,t));if(ans>0){const top=310-140*ans;sail(s,[430,top],[400,318],[470,318],43,{ink:P,cov:.85,seamCov:.6});pennant(s,430,top-8,Math.PI,22,44,{flutter:2*Math.sin(twos(t)*9)});}
  spray(s,-120,320,t-3.3,45,7,120);
 },
 aperture(){return apertureDisc(-20,20,110,12);},
};
// ch3 — the squall slams in; the feeling gets a contour; the cloth breathes; a clear patch with a fork opens on the water
const ch3:Scene={
 draw(s,t){
  const slam=sm(0,.5,t,easeIn),hit=t-.5,br=sm(4.76,5.36,t,easeIO),inh=sm(5.36,6.36,t,easeOut);
  const v=camKeys(s,t,[[0,0,0,1,0],[.5,20,-10,1.08,4*D],[.8,40,-10,1.08,4*D],[3.5,-120,-120,1.12,0],[3.7,-100,-110,1.13,3*D],[4.76,-20,-60,1.15,3*D],[6.2,-10,0,1.32,0],[7.16,20,80,1.34,3*D],[9.23,60,220,1.44,0],[9.883,61,221,1.442,0]]);
  s.camera(v[0]+8*Math.sin(br*Math.PI)*(1-inh)+40*settle(t,.5,{amp:1,freq:3,decay:5}),v[1],v[2],v[3]);
  sea(s,220,51,{skyTone:.12,amp:18});
  s.tone(O,polyPath([[-4000,230],[4000,230],[4000,4000],[-4000,4000]],true),.45);// brown water
  streaks(s,null,[-800,240,1600,500],12,110,0,6,.9,52,[-30*t,0],18);
  // the squall: one torn edge sweeps left→right in .5 s (smeared on twos), then rests as an arc across the top-left
  const edgeX=lerp(-900,900,slam);
  if(slam<1){const smear=twosIndex(t)%2?60:0;front(s,[[edgeX+smear,-4000],[edgeX-40,-200],[edgeX+30,200],[edgeX,900]],[[-4000,900],[-4000,-4000]],53,{cov:.8,teeth:90});}
  else{const soften=1-.3*inh,shove=sm(3.5,3.75,t,easeOut)*(1-sm(3.9,4.6,t,easeOut)),retreat=-200*inh;const arc:Pt[]=([[-900,120],[-540,-100],[-300,-260],[-100,-370],[100,-420],[400,-470],[900,-500]] as Pt[]).map(p=>[p[0],p[1]+140*shove+retreat] as Pt);front(s,arc,[[4000,-500],[4000,4000],[-4000,4000],[-4000,120]],54,{cov:.8,teeth:90*soften,contour:sm(3.5,4.1,t,easeOut)});}
  // rain begins where the edge has passed; it thins with the breath and stops inside the clear patch
  const rainCov=key(t,[[0,.35],[4.76,.35],[6.4,.22]]);
  s.save();if(slam<1)s.clip(rectPath(-4000,-4000,edgeX+4000,8000));
  streaks(s,B,[-900,-900,1800,1500],150,150,-30*D,4,rainCov,55,[0,600*t]);s.restore();
  // the lower sail: tint through the cloth, exhale / inhale
  const belly=key(t,[[0,30],[3.5,30],[3.75,-40,easeOut],[4.3,30,easeIO],[4.76,30],[4.9,34],[5.36,0,easeIO],[6.36,70,easeOut]]),flut=(t>=4.9&&t<5.5?10:0)*(twosIndex(t)%2?1:-1)+(hit>=0&&hit<.6?8:0)*(twosIndex(t)%2?1:-1)+(t>=3.5&&t<4.3?10:0)*(twosIndex(t)%2?1:-1);
  const tint=key(t,[[0,0],[.5,.3],[4.76,.3],[6.4,.15]]);
  const heelD=key(t,[[.5,0],[.8,6,easeOut],[3.5,6],[3.75,11,easeOut],[4.3,6],[4.76,6],[6.4,0,easeOut]]);
  s.save();s.translate(0,300);s.rotate(heelD*D);s.translate(0,-300);
  sail(s,[-30,-900],[-320,200],[260,200],56,{belly,flutter:flut,tint});
  s.fill(K,ribbon([[-320,-900],[-320,260]],18,{seed:57,taper:0,pressure:.3,wobble:1}));
  s.fill(K,ribbon([[-320,200],[260,200]],14,{seed:58,taper:0,wobble:1}));
  const deck=polyPath([[-4000,300],[-600,300],[0,284],[600,300],[4000,300],[4000,4000],[-4000,4000]],true);s.knockout(deck,.95);s.tone(P,deck,.12);
  s.fill(K,ribbon([[-600,300],[0,284],[600,300]],14,{seed:59,pressure:.6,taper:.1,wobble:1.5,step:30}));
  const kick=key(t,[[.5,0],[.62,-35,easeOut],[3.5,-35],[4.1,-28],[7.16,-28],[7.8,0,easeIO]])+(hit>=0&&hit<3?6*settle(t,.62,{amp:1,freq:2.5,decay:1}):0);
  // the sailor at the tiller: shoved by the squall, then the breath — the chest expands on the inhale and the shoulders drop on the exhale
  const chest=1+.2*br*(1-inh)+.06*inh,shoved=sm(.5,.62,t)*(1-sm(.62,1.2,t))+sm(3.5,3.75,t)*(1-sm(3.9,4.6,t));
  person(s,-40,290,260,K,61,'stand',{facing:1,scaleX:chest,tilt:.15*shoved-.05*br*(1-inh)+.02*Math.sin(t*1.8),headDrop:[0,.03*shoved]});
  tiller(s,60,290,kick*D,280,60);
  s.restore();
  // room to choose: a paper clear patch on the water with a two-way fork
  const patch=easeOutBack(sm(7.16,7.7,t));
  if(patch>0){const p=polyPath(blob(60,220,270*patch,105*patch,65,{amp:.06,n:36}),true);s.knockout(p,.95);
   heading(s,[60,300],[-160,120],10,62,{dashes:6,progress:sm(7.6,8.1,t,easeOut),cov:.8});heading(s,[60,300],[240,110],10,63,{dashes:6,progress:sm(7.7,8.2,t,easeOut),cov:.8});
   const ringAge=t-8.36;if(ringAge>=0&&ringAge<.9){const rr=40+120*easeOut(ringAge/.9);s.fill(B,ribbon(blob(0,200,rr,rr*.4,64,{amp:.04,n:28}),5,{seed:64,close:true,wobble:1}),.7*(1-ringAge/.9));}}
 },
 aperture(){return apertureDisc(60,220,80,12);},
};
// ch4 — the sea from above as shipping lanes: I recover to the ring, check my shoulder (the orange opponent behind), show for the pass along one solid lane
function me4(t:number){const move=anticipate(1.9,2.8,t,{back:.04,hold:.15,e:easeIO})*(t<1.9?0:1),over=t>2.8?settle(t,2.8,{amp:12,freq:3,decay:4}):0,show=anticipate(7.6,8.3,t,{back:.05,hold:.2,e:easeIO})*(t<7.6?0:1);
 const x=t<7.6?lerp(-220,-40,clamp(move))+over*.3:lerp(-40,80,clamp(show)),y=t<7.6?lerp(180,80,clamp(move))+over:lerp(80,-20,clamp(show));
 return{x,y,moving:(move>0&&move<1)||(show>0&&show<1),showing:show>0};}
const ch4:Scene={
 draw(s,t){
  camKeys(s,t,[[0,-80,60,1.05,0],[1.6,-100,80,1.12,0],[4.36,-40,60,1.16,0],[7.6,-160,20,1.2,-10*D],[10.13,120,-30,1.38,0],[10.783,121,-31,1.382,0]]);
  s.field(B,1,.5);
  streaks(s,null,[-900,-900,1800,1800],40,50,0,6,.85,71,[-20*t,0],10);
  // sea-lane lines: dashed paper lanes (no box), brighter near me on "attention"
  const near=sm(.2,.7,t,easeOutBack);
  const lanes=(cov:number)=>{const p=new Path2D();const segs:Pt[][]=[[[-900,-380],[900,-380]],[[-470,-900],[-470,900]],[[-900,300],[900,300]]];segs.forEach((q,i)=>p.addPath(ribbon(q,14,{seed:72+i,pressure:.5,taper:.2,wobble:2,step:40,gaps:[[.08,.14],[.3,.36],[.52,.58],[.74,.8]]})));s.knockout(p,cov);};
  lanes(.35);if(near>0){const p=ribbon([[-330,120],[-330,420],[0,420]],14,{seed:75,pressure:.5,taper:.2,wobble:2,step:40});s.knockout(p,Math.min(.95,.35+.6*near));}
  streaks(s,B,[-900,-900,1800,1800],60,90,-35*D,3,.18,73,[0,400*t]);
  // recovery: a dashed line to the ring, I run it (stride, smear), the ring goes solid
  const m=me4(t),st=stride(twosIndex(t));
  heading(s,[-220,120],[-40,80],10,74,{dashes:6,progress:sm(1.6,1.9,t,easeOut),cov:.85});
  const ringSolid=sm(2.8,3.2,t,easeOut);s.knockout(ribbon(blob(-40,80,70,70,75,{amp:.03,n:32}),10,{seed:75,close:true,wobble:1.5,gaps:ringSolid>=1?[]:[[.1,.2],[.35,.45],[.6,.7],[.85,.95]]}),.9);
  // the orange opponent behind me, seen on the shoulder check; it turns away at 9.4
  const seen=sm(4.6,4.9,t,easeOut),turn=sm(9.4,10.2,t,easeIO);
  s.tone(O,polyPath(blob(-360,20,120,60,76,{amp:.08,n:20}),true),.4*(1-turn));
  person(s,-360,20,260,O,77,turn>0&&turn<1?'run':'lean',{facing:turn>0?-1:1,legs:turn>0&&turn<1?st.legs:undefined,arms:turn>0&&turn<1?st.arms:undefined,cov:.5+.45*seen});
  // the purple teammate with the buoy; the pass at 7.6 along one solid line
  const lineP=sm(8.2,8.6,t,easeOut),solid=sm(8.6,8.9,t);
  heading(s,[250,-60],[m.x,m.y],solid>0?14:10,79,{dashes:7,progress:lineP,solid});
  const kickT=t>=8.85&&t<9.1;
  person(s,270,-40,260,P,78,kickT?'kick':'stand',{facing:-1});
  // me: running back (stride), the head turn with an anticipation counter-turn at 4.36, arms up to show for the pass, a cushion on receipt
  const look=key(t,[[4.36,0],[4.46,-.15],[4.76,1,easeOut],[5.1,1],[7.6,1],[8.0,0,easeIO]]),cush=t>=9.65&&t<9.82?.06:0;
  const rL=poseLimbs('reach'),sL=poseLimbs('stand');
  person(s,m.x,m.y+90,280,'paper',81,m.moving?'run':look>.5&&!m.showing?'lookBack':'stand',{facing:m.moving&&t<7.6?1:-1,legs:m.moving?st.legs:undefined,arms:m.moving?st.arms:m.showing?mixLimbs(sL.arms,rL.arms,sm(8.3,8.6,t)*(1-sm(9.65,9.9,t))):undefined,head:!m.moving&&look>0&&!m.showing?[-.12*look,-.82]:undefined,tilt:m.moving?.12:cush,scaleX:1+cush});
  if(m.moving)speedLines(s,K,m.x-40,m.y+20,t<7.6?0:Math.PI*.8,{n:4,seed:82,len:110,spread:50,width:6,cov:.85});
  if(seen>0)heading(s,[m.x,m.y],[-360,-40],8,83,{dashes:6,progress:seen,cov:.8});
  const pass=sm(8.9,9.65,t,easeOut),bx=lerp(300,m.x+70,pass),by=lerp(-30,m.y+40,pass)-40*Math.sin(pass*Math.PI);
  buoy(s,bx,by,62,pass*4,84,{});
 },
 aperture(){return apertureDisc(165,-40,42,12);},
};
// ch5 — two sails at sea level: influence not control, flags talk, shadows overlap into indigo, the shore mast answers
const ch5:Scene={
 draw(s,t){
  const g5=gust(t,1.2,.3,.4,1.0);
  const v=camKeys(s,t,[[0,0,0,1,0],[2.4,-60,-20,1.08,0],[5.56,0,-100,1.12,3*D],[8.24,0,120,1.2,0],[10.33,320,-120,1.38,0],[10.983,321,-121,1.382,0]]);
  s.camera(v[0]+20*g5,v[1],v[2],v[3]);
  sea(s,40,91,{skyTone:.12,amp:16});
  front(s,[[-900,-260],[-500,-300],[-100,-200],[300,-280],[900,-220]],[[4000,-4000],[-4000,-4000]],92,{cov:.6,teeth:60});
  streaks(s,B,[-900,-900,1800,1000],70,120,-30*D,3,.15,93,[0,400*t]);
  streaks(s,null,[-800,50,1600,700],14,120,0,7,.9,94,[-40*t,0],20);
  // the shore and the signal mast; the flag unfurls at 8.24
  s.fill(K,polyPath(handCut([[280,-20],[900,-40],[900,60],[280,40]],95,10,90),true),.9);
  s.fill(K,ribbon([[440,40],[440,-250]],12,{seed:96,taper:.1,wobble:1}));
  const unfurl=t<8.24?0:easeOutBack(sm(8.24,8.64,t));flag(s,446,-228,130,80,clamp(unfurl,0,1.12),97,[P,P]);
  // hulls: my crest shove at 1.2 sets me 60 u sideways off my line; at 5.56 the hulls slide apart
  const shove=anticipate(1.2,1.8,t,{back:.05,hold:.2,e:easeIO})*(t<1.2?0:1),apart=sm(5.56,6.36,t,easeIO),over=t>6.36?settle(t,6.36,{amp:10,freq:3,decay:4}):0;
  const myX=-200-60*clamp(shove)-20*apart-over,thX=200+80*apart+over;
  // the sails' shadows reach toward each other and overlap: purple × blue = indigo covered water
  const reach=sm(5.9,6.7,t,easeOut);
  if(reach>0){s.tone(K,polyPath(blob(myX+140*reach,190,140+80*reach,50,98,{amp:.06,n:24}),true),.3);s.fill(P,polyPath(blob(thX-140*reach,190,140+80*reach,50,99,{amp:.06,n:24}),true),.55);}
  const bow=t<6.4?0:sm(6.4,7.0,t,easeOut),bowTurn=sm(7.0,7.6,t,easeIO);
  if(t>=6.2){const bxh=0+60*bowTurn,byh=lerp(420,250,bow)+40*bowTurn;s.save();s.translate(bxh,byh);s.rotate(-bowTurn*.6);orangeHull(s,0,0,240,110,100,1-bowTurn);s.restore();}
  // heading lines: mine, then re-drawn from the new position; both converge on the coach's line
  const conv=sm(8.9,9.5,t,easeIO);
  heading(s,[myX-20,120],[lerp(myX-360,myX-300,conv),lerp(200,60,conv)],10,101,{dashes:8,progress:sm(.4,.9,t,easeOut),cov:.85});
  if(t>=2.0)heading(s,[myX-20,120],[lerp(myX-340,myX-300,conv),lerp(120,60,conv)],10,102,{dashes:8,progress:sm(2.0,2.4,t,easeOut),cov:.6});
  if(t>=9.0)heading(s,[thX-20,120],[thX-300,60],10,103,{dashes:8,progress:conv,cov:.7});
  // the boats
  const trim=sm(0,.4,t,easeOut),rock=Math.sin(t*1.7)*2*(1-.7*sm(9.84,10.4,t));
  const draw=(x:number,ink:string|undefined,seed:number,tr:number,rk:number)=>{s.save();s.translate(x,180);s.rotate(rk*D);s.translate(-x,-180);sail(s,[x+20,-260],[x-110,90],[x+120+(1-tr)*40,90],seed,ink?{ink,cov:.85,seamCov:.6}:{belly:50*tr,tint:.2});s.fill(K,ribbon([[x-20,-280],[x-20,120]],14,{seed:seed+1,taper:0,wobble:1}));hullSide(s,x,110,300,70,0,seed+2,{});s.restore();};
  draw(myX,undefined,104,trim,rock);draw(thX,P,108,1,rock*(1-.5*sm(9.84,10.4,t))+Math.sin(t*1.7+1.2)*2*sm(9.84,10.4,t)*.0);
  // talk: three signal flags run up my mast, two answer on theirs, a line joins the mastheads
  const up=easeOut(sm(2.4,2.9,t)),ans=easeOut(sm(2.8,3.3,t));
  for(let i=0;i<3;i++){const y=lerp(0,-250+i*46,up);if(up>0)pennant(s,myX-20,y,0,20,112+i,{ink:[P,K,P][i],flutter:2*Math.sin(twos(t)*9+i)});}
  for(let i=0;i<2;i++){const y=lerp(0,-250+i*46,ans);if(ans>0)pennant(s,thX-20,y,Math.PI,20,116+i,{ink:[K,P][i],flutter:2*Math.sin(twos(t)*9+i)});}
  heading(s,[myX-20,-280],[thX-20,-280],8,120,{dashes:9,progress:sm(3.2,3.5,t,easeOut),cov:.85});
  // the coach's line to my masthead; my pennant dips to acknowledge
  heading(s,[440,-250],[myX-20,-280],8,121,{dashes:8,progress:sm(8.64,9.04,t,easeOut),cov:.85});
  pennant(s,myX-20,-290,0,26,122,{droop:.4*sm(9.04,9.3,t)*(1-sm(9.5,9.9,t)),flutter:3*Math.sin(twos(t)*9)});
  pennant(s,thX-20,-290,Math.PI,26,123,{flutter:3*Math.sin(twos(t)*9+2)});
 },
 aperture(){return apertureDisc(510,-228,40,12);},
};
// ch6 — heavier rain; the cloth shows the front through it; a tack toward the harbour posts; a tow-line to the purple sail
const ch6:Scene={
 draw(s,t){
  const g6=gust(t,0,1,.5,1.5),tack=anticipate(4.98,5.6,t,{back:.15,hold:.25,e:easeIO})*(t<4.98?0:1);
  const v=camKeys(s,t,[[0,0,0,1,0],[2.98,0,-40,1.08,0],[4.98,20,-100,1.12,0],[6.78,-60,0,1.15,-5*D],[9.13,160,-120,1.3,0],[9.785,161,-121,1.302,0]]);
  s.camera(v[0]+20*g6,v[1],v[2],v[3]);
  sea(s,60,131,{skyTone:.12,amp:16});
  s.tone(O,polyPath([[-4000,70],[4000,70],[4000,4000],[-4000,4000]],true),.45);
  const scroll=t<6.78?0:120*(t-6.78);
  streaks(s,null,[-800,80,1600,700],16,130,0,7,.9,132,[-40*t-scroll,0],20);
  front(s,[[-900,200],[-560,-60],[-280,-260],[-40,-400],[300,-520],[900,-620]],[[4000,-4000],[-4000,-4000]],133,{cov:.7,teeth:80,contour:key(t,[[0,.6],[2.98,.6],[3.5,1]])});
  // the harbour mouth: two navy posts that grow as the boats close on them
  const grow=1+.4*sm(6.78,9.13,t);
  for(const px of[380,560]){s.fill(K,ribbon([[px,-260+150*grow],[px,-260-150*grow]],26,{seed:134+px,taper:.05,wobble:1.5}),.95);}
  heading(s,[60,200],[470,-200],12,135,{dashes:1,progress:sm(5.4,5.9,t,easeOut),solid:1,cov:.95});
  // rain: heavier through the whole chapter, crossing the sail
  streaks(s,B,[-900,-900,1800,1600],190,170,-35*D,4,key(t,[[0,.25],[1,.4]]),136,[0,650*t]);
  // my boat: bends leeward in the gust, tacks at 4.98 as one heavy mass, the tint shows the front through the cloth
  const heelD=key(t,[[0,0],[1,5],[2.5,2],[4.98,2],[5.3,-3],[5.9,4,easeIO],[6.4,0]]);
  const turn=20*clamp(tack)+(t>5.6?2*settle(t,5.6,{amp:1,freq:2.5,decay:3}):0);
  const belly=t<5.25?60-20*g6:t<5.35?-30:lerp(-30,70,sm(5.35,5.7,t,easeOut));
  const clewX=lerp(230,120,clamp(tack));
  s.save();s.translate(0,200);s.rotate((heelD+turn*.3)*D);s.translate(0,-200);
  sail(s,[20,-520],[-120,180],[clewX,180],137,{belly,flutter:(g6>.8?8:0)*(twosIndex(t)%2?1:-1),tint:key(t,[[0,.15],[2.98,.3]])});
  s.fill(K,ribbon([[-20,-540],[-20,220]],16,{seed:138,taper:0,wobble:1}));
  hullSide(s,10,170,360,80,0,139,{});
  const wet=sm(3.2,3.9,t,easeIn)*.7-.3*sm(6.78,7.4,t);
  pennant(s,-20,-550,0,30,140,{droop:wet,flutter:(1-wet)*3*Math.sin(twos(t)*9)});
  s.restore();
  const deck=polyPath([[-4000,320],[-600,320],[0,300],[600,320],[4000,320],[4000,4000],[-4000,4000]],true);s.knockout(deck,.95);s.tone(P,deck,.12);
  s.fill(K,ribbon([[-600,320],[0,300],[600,320]],14,{seed:141,pressure:.6,taper:.1,wobble:1.5,step:30}));
  const tk=key(t,[[0,0],[4.98,0],[5.13,-5],[5.5,25,easeIO],[5.65,23]]);
  person(s,-50,310,250,K,149,'point',{facing:1,arms:mixLimbs(poseLimbs('stand').arms,poseLimbs('point').arms,.8),tilt:-.006*tk+.02*Math.sin(t*1.9)});
  tiller(s,60,310,tk*D,280,142);
  // support: the purple sail comes alongside, a tow-line sags between mastheads
  const along=anticipate(6.78,7.58,t,{back:.04,hold:.15,e:easeIO})*(t<6.78?0:1),px=lerp(330,190,clamp(along))+(t>7.58?10*settle(t,7.58,{amp:1,freq:3,decay:4}):0);
  sail(s,[px+20,-330],[px-90,120],[px+100,120],143,{ink:P,cov:.85,seamCov:.6});s.fill(K,ribbon([[px-10,-350],[px-10,150]],12,{seed:144,taper:0,wobble:1}));hullSide(s,px,110,240,60,0,145,{});
  pennant(s,px-10,-360,Math.PI,22,146,{flutter:3*Math.sin(twos(t)*9+1)});
  heading(s,[-20,-550],[px-10,-360],8,147,{dashes:1,solid:1,progress:sm(7.6,8.0,t,easeOut),sag:40*sm(8.0,8.4,t,easeOut),cov:.9});
  spray(s,-60,260,t-1.2,148,7,120);
 },
 still:8.6,
};

export const story:RisoStory={
 id:'boat-weather',format:'11v11',title:'The Boat and the Weather',theme:'Finding what you can control',ageNote:'Direct reflections for older youth, roughly 12 and up; playing format does not define age.',
 spec:{paper:'#f0ece2',inks:{orange:'#ff6c2f',blue:'#0078bf',purple:'#765ba7',navy:'#22366b'},order:['orange','blue','purple','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:[
  {label:'Weather and response',narration:'Football brings moments you cannot choose: a strange bounce, an opponent, a decision you disagree with. What can you do next?',seconds:9.883,audio:CH+'01.m4a',cues:[{at:0,words:'Football brings'},{at:2.8,words:'a strange bounce'},{at:6.7,words:'What can you do'}]},
  {label:'Find your sail',headline:'Adjust',narration:'Think of the game as changing weather. You cannot command the wind, but you can adjust your sail and ask for help.',seconds:8.683,audio:CH+'02.m4a',cues:[{at:0,words:'Think of the game'},{at:2.74,words:'cannot command'},{at:4.86,words:'adjust your sail'}]},
  {label:'Make some room',headline:{text:'Choose',at:7.16},narration:'Frustration may arrive before you can stop it. Notice the feeling. Take a breath. Give yourself room to choose your response.',seconds:9.883,audio:CH+'03.m4a',cues:[{at:0,words:'Frustration may'},{at:3.5,words:'Notice the feeling'},{at:4.76,words:'Take a breath'}]},
  {label:'Choose an action',headline:'One action',narration:'Bring your attention to something available now: recover into position, check your shoulder, or show for a pass. Choose one clear action.',seconds:10.783,audio:CH+'04.m4a',cues:[{at:0,words:'Bring your attention'},{at:4.36,words:'check your shoulder'},{at:7.6,words:'one clear action'}]},
  {label:'Work together',headline:'Together',narration:'You can influence the next moment without controlling the result. Talk to a teammate, cover space together, and ask your coach when you need guidance.',seconds:10.983,audio:CH+'05.m4a',cues:[{at:0,words:'You can influence'},{at:5.56,words:'cover space together'},{at:8.24,words:'need guidance'}]},
  {label:'Your next response',headline:'With support',narration:'Difficult weather may continue. You do not have to pretend it feels good. Find your next useful action, and take it with support.',seconds:9.785,audio:CH+'06.m4a',cues:[{at:0,words:'Difficult weather'},{at:2.98,words:'pretend it feels good'},{at:6.78,words:'take it with support'}]},
 ],
 draw(f){playChapters(story,f,[ch1,ch2,ch3,ch4,ch5,ch6]);},
 touch(s,x,y,age,seed){
  const g=age<=0?1:gust(age,0,.15,.25,.4);if(g<=0)return;
  const rr=rng(seed),p=new Path2D(),L=170*g,ca=Math.cos(-55*D),sa=Math.sin(-55*D);
  for(let i=0;i<6;i++){const ox=x-90+rr()*180,oy=y-70+rr()*140,w=8+rr()*6,l=L*(.6+rr()*.7);p.moveTo(ox,oy);p.lineTo(ox+ca*l,oy+sa*l);p.lineTo(ox+ca*l-sa*w,oy+sa*l+ca*w);p.lineTo(ox-sa*w,oy+ca*w);p.closePath();}
  s.fill(K,p,.92);
  const crest=age<=0?1:easeOutBack(clamp(age/.3))*(1-clamp((age-.5)/.3));if(crest>0)s.knockout(polyPath(blob(x,y+40,150*crest,34*crest,seed+3,{amp:.1,n:24}),true),.95);
  if(age>0){const r2=rng(seed+7),q=new Path2D();for(let i=0;i<6;i++){const aa=-Math.PI/2+(r2()-.5)*1.4,v=160*(.5+r2());q.addPath(circlePath(x+Math.cos(aa)*v*age,y+Math.sin(aa)*v*age+420*age*age,7+r2()*7));}s.knockout(q,.9*(1-clamp((age-.5)/.3)));}
 },
};
