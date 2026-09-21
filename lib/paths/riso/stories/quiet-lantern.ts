/** The Quiet Lantern — riso. A NIGHT print: blue × purple indigo field with paper through everywhere;
 * light is never a glow but a cone of stepped yellow halftone wedges that knock the night down so the paper reads.
 * People are ABSTRACT riso figures (bible §1c.4, `figure()` / `person()` below): our players are paper cut-outs that the lantern light
 * tints yellow, opponents are purple cut-outs on a paper knockout. Lanterns are the message (light), never the people.
 * Inks: yellow → blue → purple → navy on cream. Scenes read only their local time t (never the outer frame). */
import type {Sheet} from '../sheet';
import {type RisoStory,type Scene,playChapters} from '../story';
import {apertureDisc} from '../passage';
import {twos,twosIndex,sm,easeOut,easeIO,easeIn,easeOutBack,key,camKeys,anticipate,settle,spring,clamp,lerp,rng,hash,blob,polyPath,ribbon,wob,rotPts,circlePath,rectPath,type Pt} from '../motion';
import {contour,dust,chalkStroke,laneArrow,speedLines,handCut,tornRect,goalFrame,confetti} from '../shapes';

const CH='/stories/narration/11v11/quiet-lantern/';
const K='navy',P='purple',Y='yellow',B='blue';
const D=Math.PI/180;
const COV=[.62,.45,.32,.2,.1];

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

/** person(): our players = paper cut-outs tinted yellow by the light (`paperTone` = how lit); opponents = purple cut-outs on a paper knockout. */
function person(s:Sheet,x:number,y:number,size:number,kind:'us'|'them',seed:number,pose:Pose,o:FigureOpts&{cov?:number}={}){
 if(kind==='us')return figure(s,x,y,size,Y,seed,pose,{...o,mode:'paper',paperTone:o.paperTone??.3,toneInk:Y});
 figure(s,x,y,size,K,seed,pose,{...o,mode:'paper',paperTone:0});return figure(s,x,y,size,P,seed,pose,{...o,mode:'ink',cov:o.cov??.9});
}
/** A paper speech disc with a tail toward (tx,ty) — the one generic shape (their voice). */
function speech(s:Sheet,x:number,y:number,w:number,h:number,tx:number,ty:number,seed:number,g=1){if(g<=0)return;s.knockout(polyPath(blob(x,y,w*g,h*g,seed,{amp:.05,n:24}),true),.95);s.knockout(polyPath([[x+(tx-x)*.25,y+(ty-y)*.2],[x+(tx-x)*.35+14,y+(ty-y)*.3],[x+(tx-x)*.6,y+(ty-y)*.7]],true),.95);}

// ---------------- the world: a dark room / night pitch pierced by stepped light ----------------
/** Indigo night: solid blue with mottle, purple halftone over it, paper through in the speckle. `wall` prints a darker navy block above y=wall (torn edge). */
function night(s:Sheet,o:{purple?:number;mottle?:number;screen?:number}={}){const{purple=.75,mottle=.5,screen=.3}=o;s.field(B,1,mottle);s.field(P,purple,.35);if(screen>0)s.tone(K,rectPath(-4000,-4000,8000,8000),screen);}
function wallBlock(s:Sheet,y:number,seed:number,amp=40,cov=.9){s.fill(K,tornRect(-3400,-3400,6800,3400+y,seed,amp),cov);}
function floorBand(s:Sheet,y:number,seed:number,amp=40,cov=.85){s.fill(K,tornRect(-3400,y,6800,3400,seed,amp),cov);}
/** A wedge polygon from (ox,oy) along angle `ang` (radians), half-angle `half`, length L, hand-wobbled edges. */
function wedgePts(ox:number,oy:number,ang:number,half:number,L:number,seed:number):Pt[]{const pts:Pt[]=[[ox,oy]],n=10;for(let i=0;i<=n;i++){const a=ang-half+2*half*i/n;pts.push([ox+Math.cos(a)*L,oy+Math.sin(a)*L]);}return wob(pts,7,seed,true,{step:26,corner:.5});}
/** The stepped cone: 5 wedges, each one flat print — the night knocked down by the wedge's coverage and yellow printed into the same holes. */
function stepCone(s:Sheet,ox:number,oy:number,ang:number,half:number,lens:number[],covs:number[],seed:number,o:{grow?:number[];yellow?:number}={}){
 const{grow,yellow=1}=o;
 for(let k=lens.length-1;k>=0;k--){const g=grow?grow[k]:1;if(g<=0||covs[k]<=.03)continue;const p=polyPath(wedgePts(ox,oy,ang,half,lens[k]*g,seed+k),true);s.knockout(p,clamp(covs[k]));s.tone(Y,p,clamp(covs[k]*yellow));}
}
/** Point light test: the coverage of the cone at (x,y) (0 when outside), used so marks and lines are revealed by the light, not faded in. */
function coneAt(x:number,y:number,ox:number,oy:number,ang:number,half:number,lens:number[],covs:number[],grow?:number[]){const dx=x-ox,dy=y-oy,d=Math.hypot(dx,dy);let a=Math.atan2(dy,dx)-ang;a=Math.atan2(Math.sin(a),Math.cos(a));if(Math.abs(a)>half)return 0;for(let k=0;k<lens.length;k++){if(d<=lens[k]*(grow?grow[k]:1))return covs[k];}return 0;}
/** Lantern body: navy contour, cap bars, glass (paper + yellow tone when lit, dark navy tone when not), teardrop flame with a stepped halo.
 * (x,y) = the pivot: the hook when hanging, the base when standing. tilt rotates about the pivot. */
function lantern(s:Sheet,x:number,y:number,w:number,h:number,seed:number,o:{lit?:number;tilt?:number;flame?:number;hang?:boolean;cov?:number;dent?:number;sag?:number}={}){
 const{lit=0,tilt=0,flame=1,hang=false,cov=1,dent=0,sag=0}=o;
 s.save();s.translate(x,y);s.rotate(tilt);
 const top=hang?h*.2:-h,bot=hang?h*1.2:0;const cx=0,cy=(top+bot)/2;
 if(hang){s.fill(K,ribbon([[0,0],[0,top]],Math.max(4,w*.06),{seed,taper:0,wobble:1}),cov);s.fill(K,ribbon(blob(0,-w*.12,w*.14,w*.14,seed+1,{amp:.05,n:20}),Math.max(4,w*.06),{seed:seed+2,close:true,wobble:.8}),cov);}
 const body:Pt[]=[[cx-w/2,top+h*.14],[cx+w/2,top+h*.14],[cx+w/2*(1-dent*.5),bot-h*.14],[cx-w/2,bot-h*.14]];
 const glass=polyPath(wob([[cx-w*.38,top+h*.2],[cx+w*.38*(1-dent),top+h*.2],[cx+w*.38*(1-dent),bot-h*.2+sag],[cx-w*.38,bot-h*.2+sag]],2.5,seed+3,true,{step:12,corner:.4}),true);
 if(lit>0){s.knockout(glass,clamp(.5+.45*lit));s.tone(Y,glass,.32+.28*lit);}else s.tone(K,glass,.45);
 // cap and base bars
 s.fill(K,polyPath(wob([[cx-w*.46,top],[cx+w*.46,top],[cx+w*.5,top+h*.16],[cx-w*.5,top+h*.16]],2,seed+4,true,{step:12,corner:.4}),true),cov);
 s.fill(K,polyPath(wob([[cx-w*.5,bot-h*.16+sag],[cx+w*.5,bot-h*.16+sag],[cx+w*.46,bot+sag],[cx-w*.46,bot+sag]],2,seed+5,true,{step:12,corner:.4}),true),cov);
 contour(s,K,body,Math.max(5,w*.05),{close:true,seed:seed+6,pressure:.6,wobble:2,gaps:[[.3,.34]],cov});
 if(lit>0&&flame>0){const fx=cx,fy=cy+h*.1,fw=w*.13*flame,fh=h*.16*flame;const tear:Pt[]=[[fx,fy-fh],[fx+fw*.6,fy-fh*.35],[fx+fw,fy+fh*.3],[fx,fy+fh],[fx-fw,fy+fh*.3],[fx-fw*.6,fy-fh*.35]];
  s.tone(Y,polyPath(blob(fx,fy,fw*3.2,fh*2.1,seed+7,{amp:.06,n:24}),true),.75);s.knockout(polyPath(wob(tear,1.5,seed+8,true,{step:6,corner:.6}),true),.95);}
 s.restore();
}
/** A lantern-lit sphere: paper disc, navy panels printed only on the side facing the light, the far side sinks into the night. */
function litBall(s:Sheet,x:number,y:number,r:number,seed:number,lightAng:number,lit:number,o:{rot?:number;sx?:number;sy?:number}={}){
 const{rot=0,sx=1,sy=1}=o;s.save();s.translate(x,y);s.scale(sx,sy);
 const disc=polyPath(blob(0,0,r,r,seed,{amp:.025,n:40}),true);s.knockout(disc,.95);
 s.save();s.clip(disc);
 const la=lightAng+Math.PI;// direction toward the light
 const far=polyPath([[Math.cos(la+Math.PI/2)*r*2,Math.sin(la+Math.PI/2)*r*2],[Math.cos(la-Math.PI/2)*r*2,Math.sin(la-Math.PI/2)*r*2],[Math.cos(la-Math.PI/2)*r*2-Math.cos(la)*r*3,Math.sin(la-Math.PI/2)*r*2-Math.sin(la)*r*3],[Math.cos(la+Math.PI/2)*r*2-Math.cos(la)*r*3,Math.sin(la+Math.PI/2)*r*2-Math.sin(la)*r*3]],true);
 s.tone(K,far,.6-.35*lit);
 const near=polyPath([[Math.cos(la+Math.PI/2)*r*2-Math.cos(la)*r*.15,Math.sin(la+Math.PI/2)*r*2-Math.sin(la)*r*.15],[Math.cos(la-Math.PI/2)*r*2-Math.cos(la)*r*.15,Math.sin(la-Math.PI/2)*r*2-Math.sin(la)*r*.15],[Math.cos(la-Math.PI/2)*r*2+Math.cos(la)*r*3,Math.sin(la-Math.PI/2)*r*2+Math.sin(la)*r*3],[Math.cos(la+Math.PI/2)*r*2+Math.cos(la)*r*3,Math.sin(la+Math.PI/2)*r*2+Math.sin(la)*r*3]],true);
 s.clip(near);
 const pent=(cx:number,cy:number,pr:number,a0:number)=>{const pts:Pt[]=[];for(let i=0;i<5;i++){const a=a0+i/5*Math.PI*2;pts.push([cx+Math.cos(a)*pr,cy+Math.sin(a)*pr]);}return polyPath(wob(pts,r*.02,seed+3,true,{step:8,corner:.5}),true);};
 const panels=new Path2D();panels.addPath(pent(0,0,r*.3,rot));for(let i=0;i<5;i++){const a=rot+Math.PI/5+i/5*Math.PI*2;panels.addPath(pent(Math.cos(a)*r*.82,Math.sin(a)*r*.82,r*.28,a+Math.PI));}s.fill(K,panels,.9*(.4+.6*lit));
 s.restore();
 s.fill(K,ribbon(blob(0,0,r,r,seed+1,{amp:.02,n:40}),Math.max(3,r*.08),{seed:seed+2,close:true,pressure:.6,wobble:r*.02}),.75+.25*lit);
 s.restore();
}
/** Stepping marks: torn paper ovals, batched by light level. mark = [x,y,w,h,cov,contour]. */
function marks(s:Sheet,list:[number,number,number,number,number,number?][],seed:number){
 const bands=new Map<number,Path2D>();const ring=new Path2D();let anyRing=false;
 list.forEach((m,i)=>{const[x,y,w,h,cov,c]=m;if(cov<=.05)return;const lvl=Math.round(clamp(cov)*10)/10;let p=bands.get(lvl);if(!p){p=new Path2D();bands.set(lvl,p);}const pts=wob(blob(x,y,w/2,h/2,seed+i,{amp:.09,n:18}),4,seed+i*3,true,{step:10,corner:.4});p.addPath(polyPath(pts,true));if(c&&c>0){ring.addPath(ribbon(pts,9,{seed:seed+i,close:true,pressure:.5,wobble:1.5}));anyRing=true;}});
 for(const[lvl,p] of bands)s.knockout(p,lvl);
 if(anyRing)s.fill(K,ring,.95);
}
/** Opponent shadow: a purple torn slab lying on the field from (x,y) along `ang`. The night is knocked out beneath so purple prints clean. */
function shadow(s:Sheet,x:number,y:number,len:number,ang:number,seed:number,o:{cov?:number;contour?:number;crumple?:number;w?:number}={}){
 const{cov=.9,contour:c=0,crumple=0,w=90}=o,ca=Math.cos(ang),sa=Math.sin(ang),nx=-sa,ny=ca;
 const raw:Pt[]=[[x+nx*w*.4,y+ny*w*.4],[x+ca*len*.6+nx*w*.7,y+sa*len*.6+ny*w*.7],[x+ca*len,y+sa*len],[x+ca*len*.6-nx*w*.7,y+sa*len*.6-ny*w*.7],[x-nx*w*.4,y-ny*w*.4]];
 const pts=handCut(raw,seed,18+crumple*30,70);const p=polyPath(pts,true);s.knockout(p);s.fill(P,p,cov);
 if(c>0)s.fill(K,ribbon(pts,10,{seed:seed+1,close:true,pressure:.6,wobble:2}),c);
}
/** Dust motes inside the first wedges of a cone. */
function motes(s:Sheet,ox:number,oy:number,ang:number,L:number,seed:number,push=0,t=0){const cx=ox+Math.cos(ang)*L*.45+Math.cos(ang)*push,cy=oy+Math.sin(ang)*L*.45+Math.sin(ang)*push;dust(s,null,cx+Math.sin(t*.6)*10,cy,L*.32,14,{seed,size:7,cov:.85,spread:1});}
/** The floodlight: a heavy navy mast with a lamp head. head = [x,y], ang = the head's tilt. */
function floodMast(s:Sheet,hx:number,hy:number,ang:number,lamps:number,seed:number){
 s.fill(K,ribbon([[hx-300,hy-800],[hx-40,hy+20]],26,{seed,taper:.1,pressure:.3,wobble:1.5}));
 s.save();s.translate(hx,hy);s.rotate(ang);
 const head=polyPath(wob([[-200,-80],[200,-80],[215,80],[-215,80]],3,seed+1,true,{step:14,corner:.4}),true);s.fill(K,head,.95);
 const discs=new Path2D();for(let i=0;i<Math.min(6,lamps);i++)discs.addPath(circlePath(-160+i*64,0,26));if(lamps>0)s.knockout(discs,lamps>=6?.7:.4);
 s.restore();
}
/** Ghost pitch lines (paper .15) — a chapter re-draws them at .85 inside its light with a clip. */
/** lines(): many paper lines as ONE knockout (4 ops): segments = polylines; w = width. */
function lines(s:Sheet,segs:Pt[][],w:number,cov:number,seed:number,closeLast=false){const p=new Path2D();segs.forEach((pts,i)=>p.addPath(ribbon(pts,w,{seed:seed+i,pressure:.6,taper:.4,wobble:1.6,step:30,close:closeLast&&i===segs.length-1})));s.knockout(p,cov);}
function pitch(s:Sheet,cov:number,seed:number,o:{ox?:number;oy?:number;circle?:number;far?:boolean;k?:number}={}){
 const{ox=0,oy=-60,circle=260,far=true,k=1.4}=o;
 const segs:Pt[][]=[[[ox-560*k,oy+440*k],[ox+560*k,oy+440*k]],[[ox-560*k,oy+440*k],[ox-420*k,oy-400*k]],[[ox+560*k,oy+440*k],[ox+420*k,oy-400*k]],[[ox-490*k,oy],[ox+490*k,oy]]];
 if(far){segs.push([[ox-420*k,oy-400*k],[ox+420*k,oy-400*k]],[[ox-130*k,oy-400*k],[ox-130*k,oy-470*k],[ox+130*k,oy-470*k],[ox+130*k,oy-400*k]]);}
 segs.push(blob(ox,oy,circle,circle*.8,seed+4,{amp:.015,n:40}));
 lines(s,segs,16,cov,seed,true);
}
/** A cone laid flat: a lit lane a→b with stepped coverage along its length and a navy dashed centre line. */
function litLane(s:Sheet,a:Pt,b:Pt,width:number,seed:number,progress=1){
 const L=Math.hypot(b[0]-a[0],b[1]-a[1]),ux=(b[0]-a[0])/L,uy=(b[1]-a[1])/L,steps=[.75,.6,.45,.32,.2];
 for(let k=0;k<5;k++){const u0=k/5,u1=Math.min(progress,(k+1)/5);if(u1<=u0)break;const p=ribbon([[a[0]+ux*L*u0,a[1]+uy*L*u0],[a[0]+ux*L*u1,a[1]+uy*L*u1]],width,{seed:seed+k,taper:0,pressure:.2,wobble:2,step:12});s.knockout(p,steps[k]);s.tone(Y,p,steps[k]);}
 if(progress>.3)laneArrow(s,K,a,b,9,{dashed:true,head:26,seed:seed+9,progress,cov:.85});
}
const flare=(s:Sheet,x:number,y:number,ang:number,age:number,seed:number)=>{const g=easeOutBack(clamp(age/.28))*(1-clamp((age-.35)/.45));if(g<=0)return;stepCone(s,x,y,ang,22*D,[130,240,350],[.6,.35,.15],seed,{grow:[g,g,g]});};

// ---------------- chapters ----------------
// ch1 — the loud floodlight versus the small lantern. Hook at (330,-230); the lantern hangs below it.
const HOOK:Pt=[330,-330],LW=230,LH=320;
function lantern1(t:number){const tt=twos(t);
 const push=key(t,[[2.34,0],[2.62,12,easeOut],[3.84,9],[4.0,15],[4.6,13],[4.76,19],[5.34,15],[6.2,3],[7.4,3],[7.9,0]]);
 const sway=settle(t,.85,{amp:4,freq:.8,decay:.6})+settle(t,5.5,{amp:5,freq:.8,decay:.5})+2.5*Math.sin(t*1.7)*Math.exp(-t*.25)+.8*Math.sin(t*.9);
 const tilt=t<7.34?0:-6*anticipate(7.34,7.8,t,{back:.5,hold:.3});
 const jitter=(t>3.84&&t<5.34&&twosIndex(t)%6===0)?1.5:0;
 const ang=(push+sway+tilt+jitter)*D;const gx=HOOK[0]+Math.sin(-ang)*LH*.7,gy=HOOK[1]+Math.cos(ang)*LH*.7;
 return{ang,gx,gy,tt};}
const CONE1={half:32*D,lens:[260,440,620,800,980]};
const ch1:Scene={
 draw(s,t){
  const {ang,gx,gy}=lantern1(t);
  const v=camKeys(s,t,[[0,-20,-140,1.18],[2.34,0,-120,1.22],[2.75,20,-100,1.25],[3.84,20,-100,1.25],[5.34,170,-10,1.28],[8.8,300,-40,1.46],[9.45,304,-42,1.465]]);
  const kick=settle(t,2.45,{amp:24,freq:5,decay:5})+settle(t,3.9,{amp:10,freq:6,decay:6})+settle(t,4.66,{amp:10,freq:6,decay:6});
  s.camera(v[0]+kick,v[1],v[2],(t>0&&t<2.34?-2*sm(0,2.34,t):-2+2*sm(2.34,3,t))*D);
  night(s);
  const blastLive=t>=2.34&&t<5.34+.17;
  const flat=blastLive?.5:0;
  floorBand(s,300,11,40-flat*30,.85);
  // the floodlight mast: heavy head sags, lamps print one per frame, the head lifts back and stops hard
  const sag=t<.5?6*Math.sin(clamp(t/.5)*Math.PI):0,lift=sm(.5,1.1,t,easeOut),rock=(blastLive?(t<2.54?-4*sm(2.34,2.54,t):-4+4*sm(2.54,2.9,t,easeOutBack)):0)+3*Math.sin(t*3.1)*Math.exp(-t*.5)+.6*Math.sin(t*1.3);
  const lamps=t<.3?0:Math.min(6,1+Math.floor((t-.3)*12));
  floodMast(s,-270,-300+sag*(1-lift),(25+sag*.5*(1-lift)-lift*.4+rock)*D,lamps,21);
  // the blast: a flat yellow wedge, no steps; it flattens what it covers
  if(blastLive){const on=t<2.51?45:lerp(39,35,sm(2.51,2.85,t));const pulse=(t>=3.84&&t<5.34)?(twosIndex(t)%4<2?.95:.85):.85;
   const w=polyPath(wedgePts(-270,-300,40*D,on*D,2600,31),true);s.knockout(w);s.fill(Y,w,pulse);
   s.knockout(polyPath(blob(-270,-300,130,130,32,{amp:.06}),true));
   speedLines(s,K,-270,-300,40*D,{n:12,seed:33+(t>=3.84?twosIndex(t):0),len:900,spread:520,width:9,cov:.5});}
  const cut=sm(5.34,5.5,t);if(cut>0&&cut<1&&twosIndex(t)%2===0){const w=polyPath(wedgePts(-270,-300,40*D,35*D,2600,31),true);s.knockout(w,.5);s.fill(Y,w,.5);}
  // the small lantern lights at 5.74: flicker, then the stepped cone steps out one wedge per drawn frame, sweeping with the sway
  const litRaw=t<5.74?0:t<5.95?(twosIndex(t)%2===0?1:0):1,lit=litRaw*(1-cut*0);
  const coneAng=ang+118*D,coneOx=gx+Math.cos(coneAng)*60,coneOy=gy+Math.sin(coneAng)*60;
  const grow=CONE1.lens.map((_,k)=>easeOut(sm(5.95+k/12,5.95+k/12+.3,t)));
  const covs=[key(t,[[7.34,.62],[7.7,.75]]),.45,.32,.2,.1];
  if(t>=5.95)stepCone(s,coneOx,coneOy,coneAng,CONE1.half,CONE1.lens,covs,41,{grow});
  // what the light reveals: a bench plank and the start of a stepping-mark path
  const benchCov=coneAt(270,260,coneOx,coneOy,coneAng,CONE1.half,CONE1.lens,covs,grow);
  if(benchCov>0)contour(s,K,[[60,262],[260,254],[470,266]],18,{seed:51,pressure:.5,cov:.95});
  const M:[number,number][]=[[190,330],[50,390],[-100,440]];
  const nearRing=sm(7.6,7.9,t);
  marks(s,M.map((m,i)=>{const c=coneAt(m[0],m[1],coneOx,coneOy,coneAng,CONE1.half,CONE1.lens,covs,grow);return[m[0],m[1],170,90,i===0&&nearRing>0?Math.min(1,c+.3*nearRing):c,i===0?nearRing:0] as [number,number,number,number,number,number];}),61);
  if(t>=6.4)motes(s,coneOx,coneOy,coneAng,CONE1.lens[1],71,0,t);
  // the lantern itself: hanging, shoved by the blast, then lit
  lantern(s,HOOK[0],HOOK[1],LW,LH,81,{lit,tilt:ang,hang:true,cov:blastLive?.35:1,flame:lit>0?.9+.1*Math.sin(twos(t)*9):0});
  if(blastLive)s.knockout(polyPath(blob(gx,gy,LW*.36,LH*.26,82,{amp:.03}),true),.6);
 },
 aperture(t){const {gx,gy}=lantern1(t);return apertureDisc(gx,gy,70,12);},
};
// ch2 — the lantern standing on the floor, its cone across the boards; one stepping mark at a time
const L2:Pt=[-300,240];// base of the standing lantern (w 260, h 360)
function lantern2(t:number){const dip=t<.4?4*Math.sin(clamp(t/.4)*Math.PI):0;const rock=settle(t,.4,{amp:2,freq:3,decay:4});const lean=t>=3.68&&t<4.9?-5*sm(3.68,3.9,t)*(1-sm(4.38,4.9,t)):0;const tilt=t<4.66?0:10*anticipate(4.66,5.3,t,{back:.3,hold:.28,e:easeIO})+(t>5.3?settle(t,5.3,{amp:2,freq:4,decay:5}):0);return{dip,ang:(rock+lean+tilt)*D};}
const ch2:Scene={
 draw(s,t){
  const {dip,ang}=lantern2(t);
  camKeys(s,t,[[0,-200,40,1,0],[1.6,-180,40,1.08,0],[3.68,-60,60,1.1,0],[4.05,-40,60,1.16,0],[4.66,-40,60,1.16,0],[6.9,60,100,1.32,3*D],[7.55,62,101,1.325,3*D]]);
  night(s);
  // far wall: shoved up by the burst, drops back with a bounce
  const burst=sm(3.68,3.9,t,easeOut)*(1-sm(4.38,4.9,t,easeOut)),wallY=-220-40*burst+(t>4.9?settle(t,4.9,{amp:12,freq:4,decay:5}):0);
  wallBlock(s,wallY,12,40+burst*30,.9);
  // the cone: origin at the glass's right edge; wedges step out; at 3.68 it bursts open and washes everything flat
  const gx=L2[0]+Math.sin(-ang)*200+95,gy=L2[1]-Math.cos(ang)*200;
  const half=(28+38*burst+(burst>.5&&t<4.0?6:0))*D;
  const grow=[300,520,740,960,1180].map((_,k)=>{const g=easeOut(sm(.3+k/12,.6+k/12,t));return g*(1+.08*(1-sm(.6+k/12,1.0+k/12,t)));});
  const lens=[300+100*sm(4.66,5.3,t),520+80*sm(5.96,6.5,t,easeOut),740,960,1180];
  const covs=COV.map(c=>lerp(c,.6,burst));
  stepCone(s,gx,gy,ang,half,lens,covs,42,{grow});
  // floorboards and stepping marks read only where the light falls
  const inLight=(x:number,y:number)=>coneAt(x,y,gx,gy,ang,half,lens,covs,grow);
  s.save();s.clip(polyPath(wedgePts(gx,gy,ang,half,lens[4]*grow[4],46),true));
  for(let i=0;i<7;i++){const y0=-60+i*90;chalkStroke(s,[[-900,y0+160],[500,-300]],7,{seed:52+i,cov:.4*(1-burst),dust:0,step:60});}
  s.restore();
  const path:[number,number][]=[[-120,120],[20,97],[160,74],[300,50],[440,27],[580,4],[720,-20]];
  const second=sm(4.66,5.1,t,easeOut),third=sm(5.96,6.4,t,easeOut),first=1-.7*sm(4.66,5.1,t);
  marks(s,path.map((m,i)=>{let c=inLight(m[0],m[1])*(1-burst);let ring=0;if(i===0){ring=first*sm(.9,1.2,t);}if(i===1){c=Math.max(c,second);ring=second*1.4;}if(i===2){c=Math.max(c,third*.5);}return[m[0],m[1],150,82,c,ring] as [number,number,number,number,number,number];}),62);
  if(t>.8)motes(s,gx,gy,ang,lens[1],72,40*sm(4.66,5.3,t),t);
  // the lantern: set down (dip), rocks, leans back from its own blast, then tilts toward the path
  const flameH=t<.3?(twosIndex(t)%2===0?1:0):1+.06*Math.sin(twos(t)*5.2)+.9*burst;
  lantern(s,L2[0],L2[1]+dip,260,360,83,{lit:1,tilt:ang,flame:flameH});
 },
 aperture(){return apertureDisc(20,97,60,12);},
};
// ch3 — the night pitch from above: BEYOND — the beam leaves the ball and the camera pans as the look: a slumped teammate pressed by two
// opponents (support), a runner nobody covers, three players in a huddle of light and one standing alone at the edge (left out)
const LAN3:Pt=[-80,120];
function beam3(t:number){
 const half=key(t,[[0,30],[.2,22],[.6,18],[8.6,18],[9.6,30]])*D;
 const len=key(t,[[0,260],[.2,240],[.6,240],[3.5,300],[3.65,280],[4.1,900,easeIn],[8.6,900],[9.6,500]]);
 const angD=key(t,[[.2,10],[.4,12],[3.5,12],[3.65,18],[4.1,-34,easeIO],[4.3,-30],[5.5,-26],[5.7,-30],[6.2,-63,easeIO],[7,-63],[7.15,-58],[7.75,-190,easeIO],[8.0,-190]]);
 return{half,len,ang:angD*D,ox:LAN3[0]+Math.cos(angD*D)*60,oy:LAN3[1]-40+Math.sin(angD*D)*60};}
const ch3:Scene={
 draw(s,t){
  const b=beam3(t),tt=twos(t),ti=twosIndex(t);
  camKeys(s,t,[[0,-40,60,1.08,-4*D],[3.7,-40,60,1.1,-4*D],[4.4,150,-30,1.16,0],[5.65,200,-140,1.2,2*D],[6.9,200,-140,1.2,2*D],[7.7,-240,70,1.26,0],[10.1,-400,160,1.46,0],[10.75,-401,161,1.46,0]]);
  night(s);
  // the pitch: a dark green tint inside the lines (yellow × blue) and a green touchline band, ghost paper lines
  s.tone(Y,polyPath([[-590,560],[590,560],[450,-620],[-450,-620]],true),.3);
  s.tone(Y,tornRect(-900,540,1800,110,17,14),.6);
  pitch(s,.18,13);
  // the teammate who needs support: slumped, pressed by two opponents whose shoulders crumple into it; the beam lands at 4.1 and it straightens a little
  const press=sm(3.8,4.3,t,easeOut),flinch=sm(2.9,3.3,t)*20,lit1=sm(4.1,4.4,t,easeOutBack);
  const slL=poseLimbs('slump'),stL=poseLimbs('stand');
  person(s,300,-10,260,'us',101,'slump',{facing:-1,paperTone:.12+.35*clamp(lit1),tilt:.22*(1-.5*clamp(lit1)),arms:mixLimbs(slL.arms,stL.arms,.5*clamp(lit1))});
  person(s,170-flinch*.5+20*press,-10,240,'them',102,'lean',{facing:1,tilt:.16+.1*press});
  person(s,430+flinch*.5-20*press,-40,240,'them',103,'lean',{facing:-1,tilt:.16+.1*press});
  // the uncovered runner: an opponent running up toward the far goal, revealed by the pan; a paper strip lights its run
  const runX=120+t*20,runY=-280-t*60,runRev=sm(5.9,6.3,t,easeOut),st=stride(ti);
  if(runRev>0){const strip=ribbon([[runX+40,runY-60],[runX+170+40*(1-runRev),runY-320-60*(1-runRev)]],70,{seed:94,taper:.3,wobble:2});s.knockout(strip,.8*runRev);}
  person(s,runX,runY+60,230,'them',104,'run',{facing:1,legs:st.legs,arms:st.arms,tilt:.1});
  // the huddle: three players in one lantern's light, and the one left out at the edge, lit when the beam finds it
  const outRing=sm(7.6,8.2,t,easeOut),leftOut=sm(7.7,8.0,t,easeOutBack),rockOut=settle(t,8.0,{amp:.04,freq:1.2,decay:1.2});
  const clusterLit=[[-360,40],[-230,110],[-330,190]] as const;
  for(const[cx,cy] of clusterLit)stepCone(s,cx+20,cy-30,(cy-110)*D,34*D,[170,290],[.32,.15],91+cx);
  if(outRing>0)contour(s,K,blob(-280,110,330,270,92,{amp:.08,n:36}),14,{close:true,seed:93,pressure:.6,gaps:[[.05,.08]],cov:outRing});
  person(s,-390,110,220,'us',105,'lean',{facing:1,paperTone:.4});person(s,-250,150,220,'us',106,'listen',{facing:-1,paperTone:.4});person(s,-320,240,220,'us',107,'stand',{facing:1,paperTone:.4});
  lantern(s,-300,150,80,115,108,{lit:1,flame:.8});
  person(s,-470,330,240,'us',109,'slump',{facing:1,paperTone:.12+.35*clamp(leftOut),tilt:.22*(1-.6*clamp(leftOut))+rockOut});
  // my beam
  const lit=1-sm(.2,1.1,t);
  stepCone(s,b.ox,b.oy,b.ang,b.half,[b.len*.2,b.len*.4,b.len*.6,b.len*.8,b.len],[.62,.45,.32,.2,.1],43);
  s.save();s.clip(polyPath(wedgePts(b.ox,b.oy,b.ang,b.half,b.len,47),true));pitch(s,.75,13);s.restore();
  // the ball, lit only while the beam sits on it; me holding the lantern
  litBall(s,50,150,86,111,b.ang+Math.PI,lit,{rot:.4});
  person(s,-170,200,280,'us',112,'stand',{facing:1,paperTone:.45,tilt:.02*Math.sin(t*1.6)});
  lantern(s,LAN3[0],LAN3[1]+80,150,215,113,{lit:1,flame:1+.05*Math.sin(tt*6)});
  confetti(s,['paper'],[-600,-500,1200,900],10,114,{size:26});
 },
 aperture(){return apertureDisc(-470,220,60,12);},
};
// ch4 — USEFUL: the beam becomes a message: a name (a teammate turns its head to the light), a danger (I point at the opponent), a passing option
// (a lane laid flat and the ball travelling 0.75 s to a teammate); three cones join
const LAN4:Pt=[-260,300];// base
function beam4(t:number){
 const half=key(t,[[0,60],[.15,66],[1.0,8,easeIO],[5.84,8],[6.0,12]])*D;
 const cov=key(t,[[0,.2],[.4,.2],[1.0,.6]]);
 const angD=key(t,[[0,-60],[2.24,-60],[2.32,-63],[2.55,-30,easeOut],[2.65,-34],[2.8,-32],[4.04,-32],[4.34,-95,easeIO],[5.84,-95],[6.0,-100],[6.6,-40,easeOut]]);
 const len=key(t,[[0,700],[.85,700],[1.0,900],[1.05,860],[5.84,860],[6.6,1]]);
 return{half,cov,ang:angD*D,len,ox:LAN4[0]+60,oy:LAN4[1]-150};}
const ch4:Scene={
 draw(s,t){
  const b=beam4(t),ti=twosIndex(t);
  camKeys(s,t,[[0,-160,120,1.06,0],[2.24,-100,80,1.14,0],[4.14,120,-20,1.17,0],[5.94,-40,-200,1.2,0],[8.46,100,-20,1.25,-6*D],[10.7,300,-200,1.44,-3*D],[11.35,302,-201,1.442,-3*D]]);
  night(s);
  // the penalty box in ghost paper, a green tint inside (yellow × blue)
  s.tone(Y,polyPath([[-400,-560],[400,-560],[400,-40],[-400,-40]],true),.25);
  const box=(cov:number)=>lines(s,[[[-700,-560],[700,-560]],[[-400,-560],[-400,-40],[400,-40],[400,-560]],[[-160,-560],[-160,-420],[160,-420],[160,-560]],blob(0,-40,190,140,16,{amp:.02,n:30})],16,cov,14,true);
  box(.16);
  // the lane laid flat (5.84): from the ball toward open space; the ball is passed along it at 8.46
  const laneP=sm(6.0,6.7,t,easeOut),laneEnd:Pt=[380+50*(laneP<1?0:settle(t,6.7,{amp:1,freq:3,decay:5})),-240];
  const ballA:Pt=[-150,190];
  if(laneP>0)litLane(s,[ballA[0]+40,ballA[1]-30],laneEnd,46,48,laneP);
  // opponents: two converge on the threatened teammate, one lurks by the lane; the beam shoves them back, the lane cuts the lurker
  const shove=sm(4.34,4.7,t,easeOut),shared=sm(9.86,10.5,t),st=stride(ti);
  person(s,-150-40*shove,-120+20*shove,240,'them',121,shove>0&&shove<1?'run':'lean',{facing:shove>0?-1:1,legs:shove>0&&shove<1?st.legs:undefined,arms:shove>0&&shove<1?st.arms:undefined,cov:.9-.4*shared});
  person(s,40-20*shove,-330-25*shove,240,'them',122,shove>0&&shove<1?'run':'lean',{facing:shove>0?1:-1,legs:shove>0&&shove<1?st.legs:undefined,arms:shove>0&&shove<1?st.arms:undefined,cov:.9-.4*shared});
  person(s,300+40*laneP,160+20*laneP,240,'them',123,'stand',{facing:-1,cov:.9-.4*shared});
  // the beam (squeezes from a wide dim cone to an 8° message beam)
  if(b.len>2){const L=b.len;stepCone(s,b.ox,b.oy,b.ang,b.half,[L*.2,L*.4,L*.6,L*.8,L],[b.cov,b.cov*.72,b.cov*.5,b.cov*.32,b.cov*.16],44);
   s.save();s.clip(polyPath(wedgePts(b.ox,b.oy,b.ang,b.half,L,49),true));box(.7);s.restore();}
  // named / warned / offered teammates light in turn (paper lit yellow); the named one turns its head to the beam; their cones travel to the lane's end and join (8.46 →)
  const named=sm(2.55,2.8,t,easeOutBack),warned=sm(4.6,4.9,t,easeOut),offered=sm(6.5,6.8,t,easeOutBack);
  const jump=named<1?0:settle(t,2.8,{amp:8,freq:5,decay:6});
  const join=sm(8.46,9.86,t,easeIO);
  const aim=(x:number,y:number,a0:number)=>lerp(a0,Math.atan2(laneEnd[1]-y,laneEnd[0]-x),join);
  if(named>0)stepCone(s,240,-120,aim(240,-120,-150*D),(30+10*join)*D,[160,280,400],[.45+.2*join,.3+.15*join,.15],131,{grow:[named,named,named]});
  if(warned>0)stepCone(s,-60,-320,aim(-60,-320,-40*D),(30+10*join)*D,[160,280,400+120*join],[.45+.2*join,.3+.15*join,.15],132,{grow:[warned,warned,warned]});
  if(offered>0)stepCone(s,380,-300,aim(380,-300,120*D)+Math.PI,(30+10*join)*D,[140,240,340],[.45+.2*join,.3+.15*join,.15],133,{grow:[offered,offered,offered]});
  if(join>0)stepCone(s,b.ox,b.oy,Math.atan2(laneEnd[1]-b.oy,laneEnd[0]-b.ox),30*D,[400,600,800],[.4*join,.28*join,.15*join],134);
  if(warned>0){const strip=ribbon([[-100,-260],[-50,-240]],26,{seed:135,taper:.4,wobble:1.5});s.knockout(strip,.85*warned);}
  const turn=sm(2.3,2.7,t,easeOut);
  person(s,240,-40+jump,250,'us',124,'stand',{facing:-1,paperTone:.12+.35*clamp(named),head:[.12*(1-turn),-.82],tilt:-.03*Math.sin(turn*Math.PI)});
  person(s,-60,-260,250,'us',125,warned>0?'lookBack':'stand',{facing:1,paperTone:.12+.35*clamp(warned)});
  const cushion=t>=9.21&&t<9.38?.06:0;
  person(s,400,-200,250,'us',126,offered>0&&t<9.21?'reach':'stand',{facing:-1,paperTone:.12+.35*clamp(offered),scaleX:1+cushion});
  // the pass (8.46): 0.75 s low flight along the lit lane, the receiver cushions
  const pass=sm(8.46,9.21,t,easeOut),pre=t>=8.26&&t<8.46?-10*Math.sin(sm(8.26,8.46,t)*Math.PI):0;
  const bx=lerp(ballA[0]+pre*.7,laneEnd[0]-60,pass),by=lerp(ballA[1]+pre*.5,laneEnd[1]+40,pass)-30*Math.sin(pass*Math.PI);
  const cush=t>=9.21&&t<9.38?.92:1,roll=t>9.21?30*sm(9.21,9.6,t,easeOut):0;
  litBall(s,bx+roll*.5,by-roll*.3,76,127,Math.atan2(by-b.oy,bx-b.ox)+Math.PI,pass<1?1:.7,{rot:pass*5,sx:cush,sy:2-cush});
  // me: holding the lantern; I point at the danger on 4.34 and kick the pass on 8.46
  const pL=poseLimbs('point'),stL=poseLimbs('stand'),pointU=sm(4.34,4.6,t,easeOut)*(1-sm(5.6,6.0,t)),kicking=t>=8.36&&t<8.66;
  person(s,-340,300,300,'us',128,kicking?'kick':'stand',{facing:1,paperTone:.45,arms:kicking?undefined:mixLimbs(stL.arms,pL.arms,pointU),tilt:kicking?0:-.06*pointU,rot:0});
  lantern(s,LAN4[0],LAN4[1],230,320,129,{lit:1,flame:1+.05*Math.sin(twos(t)*6)});
  confetti(s,['paper',Y],[-600,-520,1200,900],12,130,{size:24,cov:.8});
 },
 aperture(){return apertureDisc(330,-200,90,12);},
};
// ch5 — THEIR VOICE: two players on the touchline with their lanterns: mine dims and I lean in to listen; a speech disc from them; the mistake
// (the ball rolls into the dark, they slump); I send a speech disc back and they straighten; both lights meet, room for both
const ch5:Scene={
 draw(s,t){
  const v=camKeys(s,t,[[0,0,60,1,0],[1.8,60,60,1.08,0],[4.52,0,-40,1.12,0],[7.92,160,80,1.2,3*D],[10.6,0,-40,1.4,0],[11.25,0,-41,1.401,0]]);
  const dip=30*sm(4.52,4.9,t,easeIn)*(1-sm(4.9,5.6,t,easeOut));s.camera(v[0],v[1]+dip,v[2],v[3]);
  night(s);
  wallBlock(s,-330,15,46,.9);
  chalkStroke(s,[[-900,330],[900,330]],14,{seed:151,cov:.35,dust:0,step:60});
  // the path of stepping marks between the lanterns; two are revealed by their sweep, all knock out in the shared lens
  const sweep=t<1.8?0:key(t,[[1.8,0],[2.2,-20,easeIO],[2.75,20,easeIO],[2.95,-3],[3.1,0]]);
  const lens=sm(7.92,8.6,t,easeOut);
  const path:[number,number][]=[[0,110],[0,20],[0,-70],[0,-160],[0,-250]];
  marks(s,path.map((m,i)=>{const seen=i===1?sm(2.15,2.4,t):i===3?sm(2.6,2.85,t):0;return[m[0],m[1],130,70,Math.max(.25,seen*.7,lens*.9),seen] as [number,number,number,number,number,number];}),152);
  // my cone: retracts and dims on "listening", reaches over on the mistake, evens out at the end
  const mine={len:key(t,[[0,520],[.15,560],[.9,260,easeOut],[5.0,260],[5.4,520,easeIn],[7.92,520],[8.6,480]]),cov:key(t,[[0,.6],[.9,.35],[5.0,.35],[5.4,.6],[7.92,.6],[8.6,.5]]),ang:key(t,[[0,0],[5.0,0],[5.4,-4],[7.92,-4],[8.6,-45,easeIO]])*D};
  const theirs={len:key(t,[[0,200],[.3,200],[1.2,480,easeOutBack],[4.52,480],[4.85,300],[5.4,300],[6.0,480,easeOut],[7.92,480]]),cov:key(t,[[0,.15],[.3,.15],[1.2,.45],[4.52,.45],[4.85,.1],[5.4,.1],[6.0,.45],[7.92,.45],[8.6,.5]]),ang:Math.PI+(sweep+key(t,[[7.92,0],[8.6,45,easeIO]]))*D};
  const myFlame=key(t,[[0,1],[.15,1.15],[.9,.55],[5.0,.55],[5.4,.9],[7.92,.9],[8.6,1]]),theirFlame=t>=4.52&&t<5.4?(twosIndex(t)%3===0?.2:.6):key(t,[[0,.7],[1.2,1],[5.4,.3],[6.0,1]]);
  const theirSag=key(t,[[4.52,0],[4.85,6],[5.4,6],[6.0,0]]);
  const myGx=-260+130,myGy=100-170,thGx=240-130,thGy=120-170;
  stepCone(s,thGx,thGy,theirs.ang,28*D,[theirs.len*.25,theirs.len*.45,theirs.len*.65,theirs.len*.85,theirs.len],[theirs.cov,theirs.cov*.72,theirs.cov*.5,theirs.cov*.32,theirs.cov*.16],45);
  stepCone(s,myGx,myGy,mine.ang,28*D,[mine.len*.25,mine.len*.45,mine.len*.65,mine.len*.85,mine.len],[mine.cov,mine.cov*.72,mine.cov*.5,mine.cov*.32,mine.cov*.16],46);
  if(lens>0){const l=polyPath(blob(0,-60,150*lens,80*lens,153,{amp:.05}),true);s.knockout(l,.88);s.tone(Y,l,.75);}
  // the base line joins the two feet (9.32)
  const base=sm(9.32,9.9,t,easeOut);if(base>0)contour(s,K,[[-260,290],[-120,296],[100,300],[240,292]] as Pt[],16,{seed:154,pressure:.5,cov:1,gaps:base<1?[[base,1]]:[]});
  // the mistake: the ball rolls off the lit marks into the dark and the camera drops with it
  const roll=sm(4.52,5.12,t,easeIn),wob=t>=4.3&&t<4.52?4*Math.sin((t-4.3)*40):0;
  if(t>=4.3){const bx=lerp(60+wob,360,roll),by=lerp(60,340,roll)+(roll>=1?settle(t,5.12,{amp:5,freq:5,decay:5}):0);litBall(s,bx,by,58,155,Math.PI,1-roll,{rot:roll*6});}
  // the two players: I lean in and listen (head tilted, hand to ear) from .9; they speak (a paper speech disc, 1.8); after the mistake they slump;
  // my speech disc travels to them (5.4 → 6.0) and they straighten; at the end both stand equal
  const listen=sm(.9,1.4,t,easeOut)*(1-sm(7.92,8.6,t)),theirSlump=sm(4.52,4.9,t,easeOut)*(1-sm(5.9,6.4,t,easeOutBack));
  const stL=poseLimbs('stand'),liL=poseLimbs('listen'),slL=poseLimbs('slump');
  person(s,-330,300,300,'us',156,'stand',{facing:1,paperTone:.45,arms:mixLimbs(stL.arms,liL.arms,listen),head:[.05*listen,-.8],tilt:.14*listen+(t<8.6?0:.03*settle(t,8.6,{amp:1,freq:2,decay:3}))});
  person(s,320,300,300,'us',157,'stand',{facing:-1,paperTone:.2+.25*key(t,[[0,.6],[1.2,1],[4.85,.3],[5.4,.3],[5.9,1]]),arms:mixLimbs(stL.arms,slL.arms,theirSlump),tilt:.22*theirSlump,headDrop:[.02*theirSlump,.08*theirSlump]});
  const said=sm(1.8,2.1,t,easeOutBack)*(1-sm(3.4,3.8,t));if(said>0)speech(s,250,-90,90,52,300,50,158,Math.min(1,said));
  const enc=sm(5.4,6.0,t,easeIO),encFade=1-sm(7.0,7.5,t);if(enc>0&&encFade>0)speech(s,lerp(-250,220,enc),-110-40*Math.sin(enc*Math.PI),90,52,lerp(-300,300,enc),50,159,Math.min(1,enc*2)*encFade);
  lantern(s,-260,300,240,340,160,{lit:1,tilt:(t<8.6?0:settle(t,8.6,{amp:1.5,freq:2,decay:3}))*D,flame:myFlame});
  lantern(s,240,300,240,340,161,{lit:key(t,[[0,.6],[1.2,1],[4.85,.3],[5.4,.3],[5.9,1]]),flame:theirFlame,sag:theirSag});
  confetti(s,['paper'],[-600,-460,1200,760],8,162,{size:22});
 },
 aperture(){return apertureDisc(0,-40,90,12);},
};
// ch6 — the whole pitch: eleven players; the keeper holds a lantern high and the light links player to player up to the far goal
const TEAM:Pt[]=[[0,420],[-260,260],[-90,240],[90,240],[260,260],[-170,60],[0,20],[170,60],[-230,-200],[0,-260],[230,-200]];
const CHAIN=[0,1,2,6,7,10,9];
const ch6:Scene={
 draw(s,t){
  camKeys(s,t,[[0,0,320,1.15,0],[1.4,-80,260,1.22,0],[3.56,-200,180,1.25,0],[6.26,40,100,1.28,0],[9,60,-180,1.4,2*D],[9.65,60,-180,1.4,2*D]]);
  night(s);
  s.tone(Y,polyPath([[-380,-560],[380,-560],[380,560],[-380,560]],true),.25);
  const pitchLines=(cov:number)=>lines(s,[[[-380,-560],[380,-560],[380,560],[-380,560],[-380,-560]],[[-380,0],[380,0]],[[-220,-560],[-220,-390],[220,-390],[220,-560]],[[-220,560],[-220,390],[220,390],[220,560]],blob(0,0,120,120,163,{amp:.02,n:30})],14,cov,161,true);
  pitchLines(.16);
  goalFrame(s,K,-90,-600,180,50,{depth:30,seed:166,bar:8});
  // link timing: the chain travels 6.26 → 8.36, one link per .3 s
  const link=(i:number)=>sm(6.26+i*.3,6.26+i*.3+.3,t,easeOut);
  const lit=TEAM.map(()=>0);lit[0]=sm(0,.3,t,easeOutBack);lit[1]=sm(1.4,1.7,t,easeOutBack);
  for(let i=1;i<CHAIN.length;i++)lit[CHAIN[i]]=Math.max(lit[CHAIN[i]],link(i-1));
  // opponents: the wide threat is noticed, pushed and backs off; two lurkers flinch from the keeper's cone
  const notice=sm(2.4,2.9,t,easeOut),retreat=sm(3.56,4.4,t,easeOut),st=stride(twosIndex(t));
  person(s,-330+20*notice+80*retreat,240,200,'them',171,retreat>0&&retreat<1?'run':'lean',{facing:-1,legs:retreat>0&&retreat<1?st.legs:undefined,arms:retreat>0&&retreat<1?st.arms:undefined,cov:.9-.3*retreat});
  person(s,60,-20-20*sm(.5,.9,t),190,'them',172,'lean',{facing:-1});person(s,300,20,190,'them',173,'lean',{facing:-1});
  // cones: the GK up the pitch; the left-back onto the opponent, squeezing to a beam; then the chain of cones joining player to player
  const gkGrow=easeOut(sm(0,.5,t));if(gkGrow>0)stepCone(s,TEAM[0][0]+30,TEAM[0][1]-150,-90*D,20*D,[120,220,320,420,520+40*(1-sm(.5,.9,t))],COV,47,{grow:COV.map(()=>gkGrow)});
  const lbGrow=easeOut(sm(1.4,1.9,t)),lbHalf=key(t,[[1.4,20],[2.4,20],[2.55,24],[2.9,8,easeIO]])*D;
  if(lbGrow>0)stepCone(s,TEAM[1][0]-40,TEAM[1][1]-60,Math.atan2(180-TEAM[1][1],-330+40*retreat-TEAM[1][0]),lbHalf,[120,200,280],[.62,.4,.2],48,{grow:[lbGrow,lbGrow,lbGrow]});
  for(let i=0;i<CHAIN.length-1;i++){const g=link(i);if(g<=0)continue;const a=TEAM[CHAIN[i]],b=TEAM[CHAIN[i+1]],dx=b[0]-a[0],dy=b[1]-a[1],Ln=Math.hypot(dx,dy)+60,ang=Math.atan2(dy,dx);const fade=1-.4*sm(8.26,9,t);stepCone(s,a[0],a[1]-60,ang,16*D,[Ln*.4,Ln*.7,Ln*(1+.08*(1-g))],[.55*fade,.38*fade,.2*fade],49+i,{grow:[g,g,g]});}
  const last=link(CHAIN.length-2);if(last>0){const a=TEAM[9];stepCone(s,a[0],a[1]-70,-90*D,14*D,[160,260,360],[.5,.35,.2],59,{grow:[last,last,last]});}
  // the lit path prints along the route one mark per link
  const route:[number,number][]=[[-140,360],[-230,310],[-170,250],[-100,150],[-50,80],[80,40],[170,-40],[200,-120],[110,-200],[40,-240]];
  marks(s,route.map((m,i)=>[m[0],m[1],90,50,link(Math.floor(i*.7))*.8,0] as [number,number,number,number,number,number]),181);
  // helpful action: the centre-back covers along a lit strip; the ball is passed to the free mid
  const cover=anticipate(3.56,4.4,t,{back:.06,hold:.25}),cbx=TEAM[2][0]-90*cover;
  if(t>=3.56){const strip=ribbon([[TEAM[2][0],TEAM[2][1]+50],[TEAM[2][0]-100,TEAM[2][1]+50]],40,{seed:182,taper:.2,wobble:2});s.knockout(strip,.6*sm(3.56,3.9,t));}
  const pass=sm(4.4,5.1,t,easeOut),bx=lerp(-60,150,pass),by=lerp(140,70,pass)-24*Math.sin(pass*Math.PI),cush=t>=5.1&&t<5.27?.92:1;
  if(t>=4.2)laneArrow(s,K,[-30,125],[130,80],8,{dashed:true,head:22,seed:183,progress:sm(4.2,4.5,t),cov:.8});
  litBall(s,bx,by,56,184,-90*D,1,{rot:pass*5,sx:cush,sy:2-cush});
  // eleven players: paper figures that light up as the chain reaches them and turn their heads toward the light; the keeper holds the lantern high
  const endFlick=t>=9.1&&t<9.35?(twosIndex(t)%2===0?.7:1):1;
  TEAM.forEach((p,i)=>{const x=i===2?cbx:p[0];const jump=lit[i]>0&&lit[i]<1?-6*Math.sin(lit[i]*Math.PI):0;const prev=CHAIN.indexOf(i)>0?TEAM[CHAIN[CHAIN.indexOf(i)-1]]:null;const face=prev?(prev[0]<x?-1:1):(x<0?1:-1);
   const kicking=i===5&&t>=4.3&&t<4.6,covering=i===2&&cover>0&&cover<1;
   person(s,x,p[1]+jump,i===0?190:150,'us',190+i,i===0?'reach':kicking?'kick':covering?'run':'stand',{facing:face,paperTone:.12+.32*clamp(lit[i])*endFlick,legs:covering?st.legs:undefined,arms:covering?st.arms:undefined,head:lit[i]>0&&i!==0?[.06*clamp(lit[i]),-.82]:undefined});});
  lantern(s,TEAM[0][0]+36,TEAM[0][1]-150,70,100,199,{lit:1,flame:endFlick});
  confetti(s,['paper'],[-600,-600,1200,1100],10,200,{size:20});
 },
 still:8.4,
};

export const story:RisoStory={
 id:'quiet-lantern',format:'11v11',title:'The Quiet Lantern',theme:'Quiet leadership',ageNote:'Direct reflections for older youth, roughly 12 and up; playing format does not define age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',blue:'#0078bf',purple:'#765ba7',navy:'#22366b'},order:['yellow','blue','purple','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:[
  {label:'Quiet leadership',narration:'What makes someone a leader? You might picture a loud voice. But leadership begins with noticing what the people around you need.',seconds:9.45,audio:CH+'01.m4a',cues:[{at:0,words:'What makes'},{at:2.34,words:'a loud voice'},{at:5.34,words:'noticing what'}]},
  {label:'A little light',headline:'Enough',narration:'Think of a small light in a dark space. It does not need to fill the room to show the next step.',seconds:7.55,audio:CH+'02.m4a',cues:[{at:0,words:'Think of a small light'},{at:3.68,words:'fill the room'},{at:4.66,words:'the next step'}]},
  {label:'Notice the need',headline:'Beyond',narration:'On the pitch, look beyond the ball. Notice the teammate who needs support, the uncovered runner, or the player left out of a conversation.',seconds:10.75,audio:CH+'03.m4a',cues:[{at:0,words:'On the pitch'},{at:3.8,words:'needs support'},{at:7,words:'left out'}]},
  {label:'Make it useful',headline:{text:'Useful',at:2.2},narration:'Then make your message useful. Call a name, point out danger, or offer a passing option. Clear information helps your team choose together.',seconds:11.35,audio:CH+'04.m4a',cues:[{at:0,words:'Then make'},{at:2.24,words:'Call a name'},{at:8.46,words:'choose together'}]},
  {label:'Listen as well',headline:'Their voice',narration:'Leadership also means listening. Ask what a teammate saw. Encourage them after a mistake. Leave room for their voice alongside your own.',seconds:11.25,audio:CH+'05.m4a',cues:[{at:0,words:'Leadership also'},{at:4.52,words:'Encourage them'},{at:7.92,words:'alongside your own'}]},
  {label:'Share the light',narration:'You can lead from any position. Notice a need. Take helpful action. A small light can help someone else find their way.',seconds:9.65,audio:CH+'06.m4a',cues:[{at:0,words:'You can lead'},{at:3.56,words:'helpful action'},{at:6.26,words:'someone else'}]},
 ],
 draw(f){playChapters(story,f,[ch1,ch2,ch3,ch4,ch5,ch6]);},
 touch(s,x,y,age,seed){
  const r=rng(seed),a=r()*Math.PI*2;
  const star=(rad:number,cov:number)=>{const pts:Pt[]=[];for(let i=0;i<16;i++){const q=a+i/16*Math.PI*2,rr=i%2?rad*.42:rad;pts.push([x+Math.cos(q)*rr,y+Math.sin(q)*rr]);}s.knockout(polyPath(wob(pts,3,seed+3,true,{step:10,corner:.4}),true),cov);};
  if(age<=0){star(150,.9);stepCone(s,x,y,a,20*D,[120,220,320],[.6,.35,.15],seed);return;}
  const g=easeOutBack(clamp(age/.3))*(1-clamp((age-.45)/.35));
  if(g>0)star(90+120*g,.92);
  flare(s,x,y,a,age,seed);
  const d=easeOut(clamp(age/.5));dust(s,null,x+Math.cos(a)*50*d,y+Math.sin(a)*50*d,40+180*d,10,{seed:seed+1,size:12,cov:.9*(1-clamp((age-.4)/.4))});
 },
};
