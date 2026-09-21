/** The Harbour at Night — riso. A NIGHT PRINT: every chapter but the dawn duotone is a navy-over-blue overprint field with the paper
 * showing through as stars, moonlight and halftone; never a flat dark fill. Lead material: the harbour wall of paper stones, moored
 * hulls with the sail furled on the boom, a mooring rope that goes taut and slack, the moon's soft halftone ramp, a string of paper
 * quay lights, and the rope-lashed football. People are ABSTRACT riso figures (bible §1c.4) printed as paper cut-outs lit by the moon.
 * Inks: yellow → teal → blue → navy on cream. Yellow = light (moon, quay lights, the adult's warmth); teal = rest (water, the player);
 * blue = the night field and open swell; navy = hulls, wall, rope, mast, the heavy mass of tiredness. Scenes read only their local time t. */
import type {Sheet} from '../sheet';
import {type RisoStory,type Scene,playChapters} from '../story';
import {apertureDisc} from '../passage';
import {twos,twosIndex,sm,easeOut,easeIO,easeIn,easeOutBack,linear,key,anticipate,settle,clamp,lerp,rng,noise1,blob,polyPath,circlePath,ribbon,partial,smoothPts,rotPts,type Pt,type Key} from '../motion';
import {contour,dust,thread,sparkBurst,ripple,confetti,handCut,footballPanels,crescent} from '../shapes';

const CH='/stories/narration/9v9/harbour-night/';
const Y='yellow',T='teal',B='blue',K='navy';
const cam=(s:Sheet,t:number,K_:Key[])=>{const v=key(t,K_,easeIO,true);s.camera(v[0],v[1],v[2],v[3]??0);return v;};

// ---------------- abstract riso figure (bible §1c.4) ----------------
/** A person as a paper cut-out: one head disc, one torso block, two leg strokes, two arm strokes (3–6 shapes), big head, short legs,
 * torn/wobbly edges, one ink (or paper knockout for dark prints). (x,y) = the ground point between the feet for standing poses,
 * the seat point for sitting poses; size = the figure's height; facing +1 = toward +x. Emotion lives in the pose only. */
export type Pose='stand'|'walk'|'run'|'kick'|'reach'|'point'|'lean'|'slump'|'lookBack'|'sit'|'sitSlump'|'sitKnee'|'sitBack'|'kneel';
export type Limb=[Pt,Pt,Pt];
type PoseSpec={hip:Pt;top:Pt;head:Pt;legs:Limb[];arms:Limb[];tilt:number;headDrop?:Pt};
export type FigureOpts={facing?:number;mode?:'ink'|'paper';cov?:number;paperTone?:number;rot?:number;tilt?:number;headDrop?:Pt;legs?:Limb[];arms?:Limb[];head?:Pt;scaleX?:number};
const STAND:Limb[]=[[[-.05,-.3],[-.07,-.15],[-.1,0]],[[.05,-.3],[.07,-.15],[.1,0]]];
const HANG:Limb[]=[[[-.16,-.6],[-.24,-.46],[-.23,-.3]],[[.16,-.6],[.24,-.46],[.23,-.3]]];
const DANGLE:Limb[]=[[[0,0],[.18,.02],[.2,.28]],[[0,0],[.12,.05],[.12,.3]]];
const UP:PoseSpec={hip:[0,-.3],top:[0,-.64],head:[0,-.82],legs:STAND,arms:HANG,tilt:0},SEAT:PoseSpec={hip:[0,0],top:[0,-.36],head:[0,-.54],legs:DANGLE,arms:HANG,tilt:.04};
const POSES:Record<Pose,PoseSpec>={
 stand:UP,
 walk:{...UP,legs:[[[-.04,-.3],[-.12,-.15],[-.2,0]],[[.04,-.3],[.14,-.16],[.2,0]]],arms:[[[-.13,-.6],[-.2,-.5],[-.24,-.38]],[[.13,-.6],[.22,-.52],[.28,-.42]]],tilt:.06},
 run:{...UP,legs:[[[-.04,-.3],[-.2,-.2],[-.34,-.06]],[[.04,-.3],[.2,-.28],[.26,-.1]]],arms:[[[-.13,-.6],[-.28,-.5],[-.3,-.36]],[[.13,-.6],[.26,-.56],[.32,-.68]]],tilt:.22},
 kick:{...UP,legs:[[[-.04,-.3],[-.1,-.15],[-.14,0]],[[.05,-.3],[.22,-.24],[.44,-.2]]],arms:[[[-.13,-.6],[-.3,-.62],[-.44,-.7]],[[.13,-.6],[.28,-.5],[.34,-.36]]],tilt:-.08},
 reach:{...UP,arms:[[[-.13,-.6],[-.2,-.8],[-.22,-1.02]],[[.13,-.6],[.2,-.8],[.22,-1.02]]]},
 point:{...UP,arms:[[[-.16,-.6],[-.24,-.46],[-.23,-.3]],[[.13,-.6],[.3,-.62],[.5,-.66]]]},
 lean:{...UP,arms:[[[-.13,-.6],[-.1,-.45],[-.06,-.3]],[[.13,-.6],[.2,-.48],[.22,-.34]]],tilt:.16},
 slump:{...UP,arms:[[[-.16,-.6],[-.16,-.42],[-.12,-.26]],[[.16,-.6],[.22,-.42],[.22,-.26]]],tilt:.22,headDrop:[.02,.08]},
 lookBack:{...UP,head:[-.08,-.82],arms:[[[-.13,-.6],[-.26,-.52],[-.3,-.4]],[[.16,-.6],[.24,-.46],[.23,-.3]]]},
 sit:{...SEAT,arms:[[[-.03,-.32],[.06,-.18],[.12,-.04]],[[.12,-.32],[.2,-.18],[.22,-.04]]]},
 sitSlump:{...SEAT,arms:[[[-.04,-.32],[.12,-.2],[.22,-.02]],[[.12,-.32],[.26,-.2],[.3,-.04]]],tilt:.3,headDrop:[.05,.07]},
 sitKnee:{...SEAT,legs:[[[0,0],[.2,-.24],[.28,0]],[[0,0],[.12,.05],[.12,.3]]],arms:[[[-.03,-.32],[.04,-.18],[.1,-.06]],[[.12,-.32],[.24,-.26],[.26,-.22]]],tilt:.08},
 sitBack:{...SEAT,arms:[[[-.06,-.3],[-.18,-.16],[-.26,0]],[[.02,-.3],[-.12,-.14],[-.18,.02]]],tilt:-.22},
 kneel:{hip:[0,-.16],top:[0,-.5],head:[0,-.68],legs:[[[0,-.16],[-.12,-.04],[-.3,0]],[[0,-.16],[.14,-.1],[.2,0]]],arms:[[[-.16,-.46],[-.24,-.32],[-.23,-.16]],[[.16,-.46],[.24,-.32],[.23,-.16]]],tilt:0},
};
export function figure(s:Sheet,x:number,y:number,size:number,ink:string,seed:number,pose:Pose,o:FigureOpts={}){
 const{facing=1,mode='ink',cov=1,paperTone=.2,rot=0,tilt:extra=0,scaleX=1}=o,P=POSES[pose],tilt=P.tilt+extra,hip=P.hip;
 const ct=Math.cos(tilt),st=Math.sin(tilt),rotP=(p:Pt):Pt=>{const dx=p[0]-hip[0],dy=p[1]-hip[1];return[hip[0]+dx*ct-dy*st,hip[1]+dx*st+dy*ct];};
 const hd=o.headDrop??P.headDrop??[0,0],headC=rotP(o.head??P.head),head:Pt=[headC[0]+hd[0],headC[1]+hd[1]],top=rotP(P.top);
 const arms=(o.arms??P.arms).map(l=>l.map(rotP) as Limb),legs=o.legs??P.legs;
 const cr=Math.cos(rot),sr=Math.sin(rot),W=(p:Pt):Pt=>{const px=p[0]*size*facing*scaleX,py=p[1]*size;return[x+px*cr-py*sr,y+px*sr+py*cr];};
 const torso=[[-.19,P.top[1]],[.19,P.top[1]],[.14,hip[1]+.03],[-.14,hip[1]+.03]].map(p=>W(rotP(p as Pt)));
 const part=(path:Path2D)=>{if(mode==='paper'){s.knockout(path,.95);if(paperTone>0)s.tone(ink,path,paperTone);}else s.fill(ink,path,cov);};
 const limb=(l:Limb,width:number,sd:number)=>ribbon(l.map(W),width,{seed:sd,pressure:.3,taper:.12,wobble:size*.006,step:Math.max(4,size*.03)});
 part(limb(legs[0],size*.11,seed+1));part(limb(arms[0],size*.085,seed+2));
 part(polyPath(handCut(torso,seed+3,size*.012,size*.12),true));
 part(limb(legs[1],size*.11,seed+4));part(limb(arms[1],size*.085,seed+5));
 const hw=W(head);part(polyPath(blob(hw[0],hw[1],size*.16,size*.16,seed+6,{amp:.05,n:28}),true));
 return{head:hw,top:W(top),hip:W(hip),hands:[W(arms[0][2]),W(arms[1][2])] as [Pt,Pt],feet:[W(legs[0][2]),W(legs[1][2])] as [Pt,Pt]};
}
/** Run cycle: two leg/arm keyframes swapped on the twos grid (k = 0 | 1). */
const RUN=POSES.run;
export const stride=(k:number):{legs:Limb[];arms:Limb[]}=>{const sw=(a:Limb,b:Limb):Limb[]=>[[a[0],b[1],b[2]],[b[0],a[1],a[2]]];return k%2?{legs:sw(RUN.legs[0],RUN.legs[1]),arms:sw(RUN.arms[0],RUN.arms[1])}:{legs:RUN.legs,arms:RUN.arms};};


// ---------------- the world: a night harbour ----------------
/** Night field: blue then navy overprint (deep indigo, paper through the screen), paper stars thinning toward the horizon. */
function nightField(s:Sheet,seed:number,o:{horizon?:number;stars?:number;navy?:number;blue?:number}={}){
 const{horizon=-150,stars=1,navy=.7,blue=.5}=o;
 if(blue>0)s.field(B,blue,.6);if(navy>0)s.field(K,navy,.55);
 if(stars<=0)return;const r=rng(seed),p=new Path2D();
 for(let i=0;i<150;i++){const x=-1800+r()*3600,y=-2200+r()*(2200+horizon),d=clamp((horizon-y)/900),keep=r()<d*stars;const rad=2.5+r()*5;if(!keep)continue;p.moveTo(x+rad,y);p.arc(x,y,rad,0,Math.PI*2);}
 s.knockout(p,.95);
}
/** Water: stacked teal bands from the horizon down (lifted to .45+ so the night is never black), a torn waterline and paper crest dashes. */
function water(s:Sheet,seed:number,horizon:number,o:{phase:number;amp?:number;covs?:number[];offs?:number[];x0?:number;x1?:number}){
 const{phase,amp=1,covs=[.45,.55,.7],offs=[0,150,340],x0=-1800,x1=1800}=o;
 covs.forEach((cov,k)=>{const p=new Path2D();p.moveTo(x0,4200);for(let x=x0;x<=x1;x+=90)p.lineTo(x,horizon+offs[k]+(k===0?10:22)*noise1(x/200+k*7,seed+k));p.lineTo(x1,4200);p.closePath();if(k===0)s.knockout(p,.6);s.tone(T,p,cov);});
 const r=rng(seed+9),d=new Path2D();for(let i=0;i<18;i++){const y=horizon+30+r()*700,len=(50+r()*100)*(.4+amp*.6),w=6+r()*4,x=x0+(((r()*(x1-x0)+phase*70*amp)%(x1-x0))+(x1-x0))%(x1-x0);d.rect(x,y+6*amp*Math.sin(phase*3+i),len,w);}s.knockout(d,.6);
}
/** The moon: a paper disc with ONE soft dot-size ramp of yellow around it (no stepped rings) and a column of paper dashes on the water. */
function moon(s:Sheet,x:number,y:number,r:number,seed:number,o:{glow?:number;reflect?:number;horizon?:number;phase?:number}={}){
 const{glow=1,reflect=0,horizon=0,phase=0}=o,R=r*(1.6+1.6*glow);
 s.tone(Y,circlePath(x,y,R),(px,py)=>{const d=Math.hypot(px-x,py-y);return clamp(1-(d-r*.9)/(R-r*.9))*.55*glow;},[x-R,y-R,R*2,R*2]);
 s.knockout(polyPath(blob(x,y,r,r,seed,{amp:.02,n:48}),true),.95);s.tone(Y,circlePath(x,y,r),.1);
 if(reflect>0){const p=new Path2D(),n=Math.round(reflect/56);for(let i=1;i<=n;i++){const yy=horizon+20+i*56+6*Math.sin(phase*3+i),w=r*(1.2-i/(n+2)),dx=10*Math.sin(phase*2+i*1.7);p.rect(x-w/2+dx,yy,w,11);}s.knockout(p,.7);}
}
/** The harbour wall / mole: a navy block of paper stones with navy joints. box = [x,y,w,h]. */
function wall(s:Sheet,box:[number,number,number,number],seed:number,o:{cov?:number;stone?:number}={}){
 const{cov=.92,stone=.4}=o,[x,y,w,h]=box;
 s.fill(K,polyPath(handCut([[x,y],[x+w,y],[x+w,y+h],[x,y+h]],seed,10,140),true),cov);
 if(stone<=0)return;const r=rng(seed+1),p=new Path2D();const rowH=70;
 for(let row=0,yy=y+14;yy<y+h-30;row++,yy+=rowH){for(let xx=x+(row%2?60:10);xx<x+w-40;xx+=140){const sw=100+r()*26,sh=rowH-16;p.moveTo(xx+8,yy);p.lineTo(xx+sw,yy+2);p.lineTo(xx+sw-4,yy+sh);p.lineTo(xx+4,yy+sh-2);p.closePath();}}
 s.knockout(p,stone);
}
/** Quay lights: a string of small paper lamps with soft yellow halos on a navy cable along y. lit 0..1 = how many are on (left to right). */
function quayLights(s:Sheet,x0:number,x1:number,y:number,seed:number,lit=1,o:{gap?:number;r?:number}={}){
 const{gap=170,r=16}=o,n=Math.floor((x1-x0)/gap),on=Math.round(n*lit);
 s.stroke(K,polyPath([[x0,y-r*2],[x1,y-r*2]],false),5,.9);
 const halo=new Path2D(),lamp=new Path2D(),post=new Path2D();
 for(let i=0;i<=n;i++){const x=x0+i*gap+8*Math.sin(i*2.3+seed);post.rect(x-3,y-r*2,6,r*1.2);if(i<on){halo.addPath(polyPath(blob(x,y,r*3.2,r*2.6,seed+i,{amp:.08}),true));lamp.addPath(circlePath(x,y,r));}else lamp.addPath(circlePath(x,y,r*.7));}
 s.stroke(K,post,4,.9);s.tone(Y,halo,.35);s.knockout(lamp,.95);s.tone(Y,lamp,.15);
}
/** A hull seen from the side: navy body over teal, torn waterline, a paper rim along the gunwale. */
function hull(s:Sheet,x:number,y:number,w:number,angle:number,seed:number,o:{weight?:number;h?:number}={}){
 const{weight=8,h=110}=o,local:Pt[]=[[-w/2,-h*.45],[-w/2+40,h*.5],[w/2-60,h*.5],[w/2+30,-h*.55]];
 const pts=rotPts(handCut(local,seed,10,80),angle).map(p=>[p[0]+x,p[1]+y] as Pt),path=polyPath(pts,true);
 s.fill(T,path,.6);s.fill(K,path,.95);
 const top=rotPts([local[0],local[3]],angle).map(p=>[p[0]+x,p[1]+y] as Pt);s.knockout(ribbon(top,weight,{seed:seed+1,pressure:.5,taper:.2,wobble:1.5}),.85);
}
/** The furled sail: a loose paper bundle lying along the boom with teal tone and three navy ties; drop 0..1 = how far the cloth has come down onto the boom. */
function furledSail(s:Sheet,mx:number,my:number,H:number,W:number,seed:number,drop=1){
 const h=H*(1-drop*.85),bundleH=26+drop*22;
 if(drop<1){const head:Pt=[mx,my+H-h],tack:Pt=[mx,my+H],clew:Pt=[mx+W*(1-drop*.5),my+H];const leech:Pt[]=[];for(let i=0;i<=6;i++){const u=i/6;leech.push([lerp(head[0],clew[0],u)+18*Math.sin(u*Math.PI)*(1-drop)+10*noise1(u*4+seed,seed),lerp(head[1],clew[1],u)]);}
  const path=polyPath(smoothPts([head,...leech.slice(1,-1),clew,tack],true,8,.9),true);s.knockout(path,.95);s.tone(T,path,.2);contour(s,K,[head,clew,tack],5,{close:true,seed:seed+2,pressure:.4,wobble:1.4});}
 const bar=polyPath(handCut([[mx-6,my+H-bundleH],[mx+W*.8,my+H-bundleH*.8],[mx+W*.8,my+H+4],[mx-6,my+H+6]],seed+3,8,50),true);s.knockout(bar,.95);s.tone(T,bar,.3);
 const ties=new Path2D();for(let i=1;i<=3;i++){const x=mx+W*.8*i/4;ties.moveTo(x,my+H-bundleH-2);ties.lineTo(x+2,my+H+6);}s.stroke(K,ties,6,.9);
 contour(s,K,[[mx,my+H+2],[mx+W*.85,my+H]],6,{seed:seed+1,pressure:.4});
}
/** Mooring rope: a catenary thread. slack 0 = taut and thick, 1 = deep sag; coil>0 draws it coiled at b. */
function rope(s:Sheet,a:Pt,b:Pt,slack:number,seed:number,o:{coil?:number;width?:number}={}){
 const{coil=0,width=18}=o;
 if(coil>0){const pts:Pt[]=[];for(let i=0;i<=24;i++){const u=i/24*Math.PI*4;pts.push([b[0]+Math.cos(u)*(30+u*4)*coil,b[1]+Math.sin(u)*(12+u*1.5)*coil]);}thread(s,K,pts,width*.7,{seed,ticks:false});return;}
 const mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2,L=Math.hypot(b[0]-a[0],b[1]-a[1]);
 thread(s,K,[a,[mx,my+slack*L*.28],b],width*(1.3-slack*.4),{seed,ticks:slack<.3});
}
/** A mooring ring on the wall: a paper ring with a navy rim. */
const mooringRing=(s:Sheet,x:number,y:number,r:number,seed:number)=>{s.knockout(circlePath(x,y,r),.9);s.fill(K,circlePath(x,y,r*.5));s.fill(K,ribbon(blob(x,y,r,r,seed,{amp:.03,n:32}),Math.max(4,r*.3),{seed:seed+1,close:true,pressure:.4}),.95);};
/** This story's football: paper sphere, navy panels, lashed with two rope loops (cargo left on the quay). */
function ballLashed(s:Sheet,x:number,y:number,r:number,seed:number,o:{rot?:number;sx?:number;sy?:number;dim?:number;loops?:number}={}){
 const{rot=0,sx=1,sy=1,dim=0,loops=1}=o;
 s.save();s.translate(x,y);s.scale(sx,sy);footballPanels(s,0,0,r,{rot,key:K,shadow:T,seed});
 if(dim>0)s.tone(K,circlePath(0,0,r),dim);
 if(loops>0){const lp=new Path2D();for(const a of [-.5,.4]){lp.moveTo(Math.cos(a)*r,-r*.95);lp.quadraticCurveTo(Math.cos(a)*r*1.35,0,Math.cos(a)*r,r*.95);}s.stroke(K,lp,Math.max(3,r*.07),loops);}
 s.restore();
}
const mast=(s:Sheet,x:number,top:number,bottom:number,seed:number,w=22)=>contour(s,K,[[x,top],[x+2,bottom]],w,{seed,pressure:.3,taper:.1});
const spray=(s:Sheet,x:number,y:number,age:number,seed:number,size=1)=>{if(age<0||age>.5)return;const k=easeOut(clamp(age/.45));dust(s,null,x,y-70*k*size,(30+120*k)*size,8,{seed,size:8*size,cov:.9*(1-clamp(age/.5)),spread:1});};
/** A speech bubble in paper with a navy rim; the tail points at `tail` (relative). */
function bubble(s:Sheet,x:number,y:number,w:number,h:number,tail:Pt,seed:number,k=1){
 const pts=blob(x,y,w/2*k,h/2*k,seed,{amp:.05}),path=polyPath(pts,true),tx=x+tail[0]*k,ty=y+tail[1]*k,base=Math.atan2(ty-y,tx-x);
 path.moveTo(x+Math.cos(base-.3)*w*.42*k,y+Math.sin(base-.3)*h*.42*k);path.lineTo(tx,ty);path.lineTo(x+Math.cos(base+.3)*w*.42*k,y+Math.sin(base+.3)*h*.42*k);path.closePath();
 s.knockout(path,.95);contour(s,K,pts,8,{close:true,seed:seed+1,pressure:.5,wobble:1.4,gaps:[[.62,.67]]});contour(s,K,[[x+Math.cos(base-.25)*w*.45*k,y+Math.sin(base-.25)*h*.45*k],[tx,ty],[x+Math.cos(base+.25)*w*.45*k,y+Math.sin(base+.25)*h*.45*k]],6,{seed:seed+2,taper:.4});
}
/** Inside the bubble: a crescent moon and a small bed (rest, nameable, no words). */
function moonAndBed(s:Sheet,x:number,y:number,size:number,seed:number){
 s.fill(K,crescent(x-size*.32,y-size*.02,size*.22,[.62,-.28],1.15),.9);
 const bx=x+size*.02,by=y+size*.08,bw=size*.4,bh=size*.05;
 s.fill(K,polyPath(handCut([[bx,by],[bx+bw,by],[bx+bw,by+bh*2],[bx,by+bh*2]],seed,2,40),true),.9);
 s.fill(K,polyPath([[bx,by-bh*3],[bx+bw*.06,by-bh*3],[bx+bw*.06,by+bh*3.5],[bx,by+bh*3.5]],true),.9);
 s.fill(K,polyPath([[bx+bw*.94,by-bh*1.2],[bx+bw,by-bh*1.2],[bx+bw,by+bh*3.5],[bx+bw*.94,by+bh*3.5]],true),.9);
 s.fill(K,polyPath(blob(bx+bw*.2,by-bh*.6,bw*.13,bh*.9,seed+1,{amp:.1}),true),.9);
 s.fill(K,polyPath(blob(bx+bw*.6,by-bh*.7,bw*.3,bh*.9,seed+2,{amp:.08}),true),.9);
}
/** A cut-paper house with one lit window: navy block, roof, yellow window. grow 0..1 pops it up from the ground line. */
function house(s:Sheet,x:number,y:number,w:number,seed:number,grow=1){
 const k=easeOutBack(clamp(grow)),h=w*.8*k;if(k<=0)return;
 const body=polyPath(handCut([[x-w/2,y],[x+w/2,y],[x+w/2,y-h],[x-w/2,y-h]],seed,6,90),true);s.knockout(body,.95);s.tone(T,body,.32);
 s.fill(K,polyPath(handCut([[x-w*.6,y-h],[x+w*.6,y-h],[x,y-h-w*.5*k]],seed+1,6,90),true),.95);
 contour(s,K,[[x-w/2,y],[x-w/2,y-h],[x+w/2,y-h],[x+w/2,y]],6,{seed:seed+3,pressure:.4});
 const win=polyPath([[x+w*.08,y-h*.72],[x+w*.36,y-h*.72],[x+w*.36,y-h*.4],[x+w*.08,y-h*.4]],true);s.knockout(win,.95);s.fill(Y,win,.85);
 s.tone(Y,polyPath(blob(x+w*.22,y-h*.56,w*.3,w*.26,seed+2,{amp:.1}),true),.3);
 s.knockout(polyPath([[x-w*.34,y],[x-w*.12,y],[x-w*.12,y-h*.5],[x-w*.34,y-h*.5]],true),.5);
}
/** A cut-paper bicycle on the quay: two paper wheels, a navy frame, seat and handlebar. */
function bike(s:Sheet,x:number,y:number,r:number,seed:number,grow=1){
 const k=easeOutBack(clamp(grow));if(k<=0)return;const rr=r*k,x1=x-rr*1.35,x2=x+rr*1.35,cy=y-rr;
 for(const [wx,sd] of [[x1,0],[x2,1]] as const){s.knockout(circlePath(wx,cy,rr),.9);s.fill(K,ribbon(blob(wx,cy,rr,rr,seed+sd,{amp:.03,n:32}),Math.max(4,rr*.16),{seed:seed+sd+2,close:true,pressure:.3}),.95);s.fill(K,circlePath(wx,cy,rr*.14));}
 const frame=new Path2D();frame.moveTo(x1,cy);frame.lineTo(x-rr*.3,cy-rr*1.1);frame.lineTo(x2-rr*.2,cy-rr*1.1);frame.lineTo(x2,cy);frame.moveTo(x-rr*.3,cy-rr*1.1);frame.lineTo(x+rr*.2,cy+rr*.1);frame.lineTo(x2-rr*.2,cy-rr*1.1);frame.moveTo(x+rr*.2,cy+rr*.1);frame.lineTo(x1,cy);
 s.stroke(K,frame,Math.max(4,rr*.13),.95);
 s.fill(K,polyPath(blob(x-rr*.35,cy-rr*1.3,rr*.28,rr*.1,seed+5,{amp:.1}),true),.95);
 s.stroke(K,polyPath([[x2-rr*.2,cy-rr*1.1],[x2-rr*.05,cy-rr*1.5],[x2+rr*.25,cy-rr*1.55]],false),Math.max(4,rr*.12),.95);
}

// ---------------- chapters ----------------
const HZ=-150,WALL=200;
/** The shared harbour: night field, moon with its reflection, water, the wall with quay lights. */
function harbour(s:Sheet,seed:number,t:number,o:{moonX?:number;moonY?:number;glow?:number;lit?:number;stars?:number;amp?:number;lights?:boolean}={}){
 const{moonX=-420,moonY=-560,glow=1,lit=1,stars=1,amp=.8,lights=true}=o;
 nightField(s,seed,{horizon:HZ,stars});
 moon(s,moonX,moonY,130,seed+1,{glow,reflect:420,horizon:HZ,phase:t});
 water(s,seed+2,HZ,{phase:t,amp});
 wall(s,[-1800,WALL,3600,1200],seed+3,{});
 if(lights)quayLights(s,120,1800,WALL-28,seed+4,lit);
}
/** 1. Night at the harbour: the boat's sail comes down onto the boom, the rope goes taut on the effort; a tired player sits on the wall by the ball. */
const ch1:Scene={
 draw(s,t){
  const tt=twos(t);
  cam(s,t,[[0,320,-200,.95,0],[1.4,320,-200,.95,0],[1.62,320,-200,.95,0],[2.6,-160,-20,1,0],[3.62,-160,-20,1,0],[6.1,-160,-20,1,0],[7.2,80,-80,1,0],[9.7,80,-90,1,0,linear],[10.35,-420,-560,1.6,0]]);
  harbour(s,11,t,{});
  // the boat: heels once as the sail luffs, the sail drops onto the boom on "need a break", the rope pulls taut on "alongside the effort"
  const heel=key(tt,[[0,0],[.2,-.01,easeIn],[.7,.08,easeOut],[1.62,.08],[2.4,0,easeOut]])+(t>=1.62?settle(t,1.62,{amp:.03,freq:2.5,decay:2.5}):0);
  const drop=key(tt,[[0,.78],[1.62,.78],[1.85,.72,easeIn],[2.6,1,easeOut]]);
  const slackRope=key(tt,[[0,.7],[6.1,.7],[6.3,.85,easeIn],[6.6,0,easeOut],[7.3,.15]]);
  mooringRing(s,-40,WALL+70,30,12);
  s.save();s.translate(420,-30);s.rotate(heel);s.scale(1.35);
  hull(s,0,0,480,0,18,{weight:8});mast(s,-60,-520,-40,19);furledSail(s,-60,-520,470,300,20,drop);
  s.restore();
  rope(s,[420-60*1.35,-30-60*1.35],[-40,WALL+70],slackRope,21,{width:16});
  if(t>=1.62&&t<2.6)spray(s,420+260,220,t-1.62,22,1);
  if(t>=6.6)sparkBurst(s,Y,-40,WALL+40,70,{n:6,seed:23,g:easeOut(sm(6.6,6.95,t))*(1-.5*sm(7,7.6,t)),width:6});
  // the player: sits on the wall, legs over the water; shoulders round on "need a break"; leans back to rest on "alongside the effort"
  const tired=sm(1.62,2.1,tt,easeOut),restK=sm(6.1,6.7,tt,easeIO);
  const pose:Pose=restK>=1?'sitBack':tired>0?'sitSlump':'sit';
  figure(s,-300,WALL,560,T,24,pose,{facing:1,mode:'paper',paperTone:.25,tilt:pose==='sitSlump'?-.3*(1-tired):pose==='sitBack'?.22*(1-restK):0,headDrop:pose==='sitSlump'?[.05*tired,.07*tired]:undefined});
  ballLashed(s,40,WALL-150,160,25,{rot:.3});
  confetti(s,['paper'],[-900,-1000,1800,600],8,26,{size:12});
 },
 aperture(){return apertureDisc(-420,-560,110,12);},
};

/** 2. Tied up: the boat comes alongside, the rope is thrown to the ring and holds, the sail lies furled; the hull is redrawn stronger; the player rests back on both hands. */
const ch2:Scene={
 draw(s,t){
  const tt=twos(t);
  cam(s,t,[[0,260,-100,1,0],[1.2,120,-60,1,0],[3.22,120,-60,1,0],[4,0,-20,1.08,0],[6.44,0,-20,1.08,0],[7.6,-220,-20,1.08,0],[9.2,-220,-20,1.08,0,linear],[9.85,-540,90,1.7,0]]);
  harbour(s,31,t,{amp:.5});
  // the hull glides in through the swell and stops alongside; the rope is thrown on "Pausing does not" and holds; the gunwale thickens on "does not make you weak"
  const glide=anticipate(0,1.1,tt,{back:.05,hold:.2,e:easeIO}),over=t>=1.1?settle(t,1.1,{amp:16,freq:2.2,decay:3}):0;
  const hx=lerp(900,340,Math.max(0,glide))+over,hy=-20,weight=key(tt,[[6.44,8],[6.9,26,easeOut]]);
  if(glide>0&&glide<1){const wake=new Path2D();for(let i=1;i<=5;i++)wake.rect(hx+330+i*40,hy+20+i*3,26*(1-glide),6);s.knockout(wake,.8);}
  mooringRing(s,-120,WALL+70,30,32);
  s.save();s.translate(hx,hy);s.scale(1.35);hull(s,0,0,480,0,33,{weight:weight/1.35});mast(s,-60,-520,-40,34);furledSail(s,-60,-520,470,300,35,1);s.restore();
  const thrown=t>=3.22?anticipate(3.22,3.8,tt,{back:.2,hold:.3,e:easeOut}):0,bow:Pt=[hx-300,hy-70];
  if(t>=3.22){const tip:Pt=thrown<1?[lerp(bow[0]-40,-120,Math.max(0,thrown)),lerp(bow[1],WALL+70,Math.max(0,thrown))-160*Math.sin(Math.max(0,thrown)*Math.PI)]:[-120,WALL+70];
   const slack=key(tt,[[3.22,.9],[3.8,.05,easeOut],[7.44,.05],[7.9,.3,easeOut]]);rope(s,bow,tip,thrown<1?.5:slack,37,{width:14});}
  else rope(s,bow,[bow[0]+60,bow[1]+140],.2,37,{coil:1,width:14});
  if(t>=3.8&&t<4.4)sparkBurst(s,Y,-120,WALL+40,60,{n:6,seed:38,g:easeOut(sm(3.8,4.1,t))*(1-sm(4.1,4.4,t)),width:6});
  // the player rests back on both hands on the wall; a glint on the ball when the boat is called useful
  figure(s,-540,WALL,560,T,39,'sitBack',{facing:1,mode:'paper',paperTone:.25});
  ballLashed(s,-260,WALL-150,150,40,{rot:.6});
  if(t>=6.9)s.knockout(polyPath(blob(-310,WALL-200,30,18,41,{amp:.15}),true),.9);
  confetti(s,['paper'],[-900,-1000,1800,600],6,42,{size:12});
 },
 aperture(){return apertureDisc(-540,88,70,12);},
};

/** 3. Close on the wall: the player sits forward, head down; the ball rolls away untouched; the moonlight pans across and finds the player's back; a hand goes to the head under the weight. */
const ch3:Scene={
 draw(s,t){
  const tt=twos(t);
  cam(s,t,[[0,40,40,1.05,0],[1,80,40,1.1,0],[3.72,80,40,1.1,0],[4.6,-360,20,1.1,0],[5.6,-40,40,1.1,0],[6.6,-40,40,1.1,0],[7.4,-40,80,1.2,0],[8.6,-40,80,1.2,0],[9.9,-40,80,1.2,0,linear],[10.55,-100,60,1.7,0]]);
  const breath=sm(8.6,9.6,tt,easeOut);
  harbour(s,51,t,{lights:false,amp:.4});
  // the wall top as a teal plank walkway with paper seams (never black)
  const deck=polyPath(handCut([[-1800,WALL],[1800,WALL],[1800,WALL+150],[-1800,WALL+150]],52,6,200),true);s.tone(T,deck,.5);
  {const seams=new Path2D();for(let x=-1700;x<1800;x+=180)seams.rect(x,WALL+4,4,140);seams.rect(-1800,WALL+2,3600,5);s.knockout(seams,.7);}
  quayLights(s,600,1800,WALL-28,53,1);
  // the moonlight: a soft yellow ramp that slides in from the left on "How do you feel" and settles on the player's back
  const lightX=key(tt,[[3.72,-1300],[4.6,-700,easeIO],[5.6,-260,easeOut]]);
  if(t>=3.72){const R=420;s.tone(Y,circlePath(lightX,60,R),(px,py)=>{const d=Math.hypot(px-lightX,py-60);return clamp(1-d/R)*.45;},[lightX-R,60-R,R*2,R*2]);}
  // the heavy mass lowers toward the head on "tired or overwhelmed", lifts a little with the breath
  // the player: sits forward with elbows on knees and head down; on "tired" the hand goes to the forehead and the head drops more
  const hand=sm(6.6,7,tt,easeOut),tiredK=sm(6.6,7.2,tt,easeOut);
  const arms:Limb[]=[[[-.04,-.32],[.12,-.2],[.22,-.02]],[[.12,-.32],[lerp(.26,.34,hand),lerp(-.2,-.3,hand)],[lerp(.3,.22,hand),lerp(-.04,-.5,hand)]]];
  figure(s,-100,WALL,640,T,55,'sitSlump',{facing:1,mode:'paper',paperTone:.25,arms,tilt:.06*tiredK-.03*breath,headDrop:[.05+.02*tiredK,.07+.05*tiredK-.04*breath]});
  // the ball: rolls a few units away on "More practice is not always" and stops (the choice not taken); the light touches its rim
  const roll=sm(.2,.9,tt,easeOut),rs=t>=.9?settle(t,.9,{amp:.05,freq:4,decay:5,phase:Math.PI/2}):0;
  const bx=lerp(240,360,roll);ballLashed(s,bx,WALL-160,170,56,{rot:roll*1.2,sx:1+rs,sy:1-rs,dim:key(tt,[[3.72,.15],[5.6,0]])});
  if(t>=5.6)s.knockout(polyPath(blob(bx-120,WALL-260,36,20,57,{amp:.15,rot:-.6}),true),.9);
  if(t>=8.6)ripple(s,T,-40,WALL+420,60,3,{width:10,seed:58,spacing:110,progress:sm(8.6,9.4,t,easeOut)});
  confetti(s,['paper'],[-900,-1000,1800,500],6,59,{size:12});
 },
 aperture(){return apertureDisc(-100,60,90,12);},
};

/** 4. On the mole: the adult walks over and leans in; the player says it with a bubble — a moon and a bed; the adult nods and answers; the weight lifts. */
const ch4:Scene={
 draw(s,t){
  const tt=twos(t);
  cam(s,t,[[0,300,-160,1,0],[1.6,80,-140,1,0],[3.5,80,-140,1,0],[4.3,-40,-200,1.06,0],[5.26,-40,-200,1.06,0],[6.2,120,-160,1.06,0],[7.2,120,-160,1.06,0],[8.5,120,-160,1.06,0,linear],[9.15,-300,-360,1.6,0]]);
  const relief=sm(6.26,7.1,tt,easeOut);
  harbour(s,71,t,{amp:.5,moonX:-560,moonY:-620});
  // the boat at the wall with its furled sail, out at the right; the mast rises behind the adult
  s.save();s.translate(760,-20);s.scale(1.2);hull(s,0,0,480,0,72,{weight:10});mast(s,-60,-520,-40,73);furledSail(s,-60,-520,470,300,74,1);s.restore();
  // the heavy mass over the player: shakes when the feeling is named, lifts and dissolves with relief
  // the adult (taller, warm paper): walks in from the right, stops, leans in to listen; nods twice on "plan a break"
  const walk=sm(0,1.6,tt,easeIO),ax=lerp(1000,300,walk),cyc=walk<1?stride(twosIndex(t)):undefined;
  const nod=t>=5.26&&t<6.1?.05*Math.sin((tt-5.26)*15):0;
  const adult=figure(s,ax,WALL,720,Y,76,walk<1?'run':'lean',{facing:-1,mode:'paper',paperTone:.3,legs:cyc?.legs,arms:cyc?.arms,head:walk<1?undefined:[.04,-.82+nod]});
  // the player: stands facing the adult; the bubble pops from the head on "I feel worn out" with a moon and a bed inside
  const me=figure(s,-200,WALL,520,T,77,'stand',{facing:1,mode:'paper',paperTone:.25,tilt:.12*sm(3.5,3.9,tt)-.14*relief,headDrop:[0,.05*sm(3.5,3.9,tt)-.05*relief]});
  const pop=t>=3.5?easeOutBack(sm(3.5,3.85,tt)):0;
  if(pop>0){const bx=me.head[0]+40,by=me.head[1]-330;bubble(s,bx,by,520,300,[-40,150],78,pop);if(pop>=1)moonAndBed(s,bx,by,300,79);}
  // the answer: the adult's bubble on "plan a break" — a moon, then a small football (the break, then the game)
  const ans=t>=5.26?easeOutBack(sm(5.26,5.6,tt)):0;
  if(ans>0){const bx=adult.head[0]-40,by=adult.head[1]-360;bubble(s,bx,by,440,260,[40,140],80,ans);if(ans>=1){s.fill(K,crescent(bx-90,by,70,[.62,-.28],1.15),.9);footballPanels(s,bx+90,by,60,{key:K,shadow:T,seed:81});}}
  if(t>=3.5&&t<4.5)sparkBurst(s,Y,me.head[0],me.head[1]-120,110,{n:7,seed:82,g:easeOut(sm(3.5,3.9,t))*(1-sm(4,4.5,t)),width:7});
  ballLashed(s,-520,WALL-150,150,83,{rot:.2});
  confetti(s,['paper'],[-900,-1000,1800,500],6,84,{size:12});
 },
 aperture(){return apertureDisc(-160,-460,90,12);},
};

/** 5. Make room: a house with one lit window (bedtime), two friends come and sit on the wall (friends), a bicycle on the quay (things you enjoy); the ball stays lashed at its post. */
const ch5:Scene={
 draw(s,t){
  const tt=twos(t);
  cam(s,t,[[0,-300,-180,1,0],[1.5,-420,-140,1,0],[2.4,-420,-140,1,0],[3.4,120,-80,1,0],[4.62,120,-80,1,0],[5.8,520,-80,1,0],[7,520,-80,1,0],[8.2,-160,-100,.96,0],[9.7,-160,-100,.96,0,linear],[10.35,-300,-600,1.7,0]]);
  const room=sm(0,1.5,tt,easeOut);
  harbour(s,101,t,{moonX:-300,moonY:-600,glow:.8+.3*room,amp:.9*(1-room*.9)+.1,stars:1.1,lights:false});
  quayLights(s,-1800,1800,WALL-28,102,key(tt,[[0,.3],[1.2,1,easeOut]]));
  // bedtime: a house on the quay pops up under the moon with one lit window
  house(s,-780,WALL,400,103,sm(.4,.9,tt));
  // the player sits on the wall; two friends walk in from the right and sit down next to the player
  figure(s,-140,WALL,540,T,104,'sit',{facing:1,mode:'paper',paperTone:.25});
  for(const [i,x0,x1,sd,ink] of [[0,1300,140,105,Y],[1,1500,400,106,T]] as const){const at=2.4+i*.25,walk=sm(at,at+1,tt,easeIO),sitK=sm(at+1,at+1.3,tt,easeOut),x=lerp(x0,x1,walk),cyc=walk<1?stride(twosIndex(t)):undefined;
   if(t<at)continue;
   if(sitK<1)figure(s,x,WALL,540,ink,sd,walk<1?'run':'stand',{facing:-1,mode:'paper',paperTone:.3,legs:cyc?.legs,arms:cyc?.arms,tilt:-.1*sitK});
   else figure(s,x,WALL,540,ink,sd,'sit',{facing:1,mode:'paper',paperTone:.3,tilt:-.06*(1-sm(at+1.3,at+1.6,tt,easeOut))});}
  // things you enjoy: a bicycle pops up on the quay
  bike(s,900,WALL,110,107,sm(4.62,5.1,tt));
  // the ball lashed at the mooring post: left for the night, not lost; its tether tugs once and a moon dash lands on it
  const tug=t>=7.02?anticipate(7.02,7.5,tt,{back:.5,hold:.35,e:easeOut}):0,tugSettle=t>=7.5?settle(t,7.5,{amp:8,freq:4,decay:4}):0;
  s.fill(K,polyPath(handCut([[-560,WALL-60],[-530,WALL-60],[-526,WALL+120],[-564,WALL+120]],108,4,60),true),.95);
  const ballY=WALL-130-20*Math.max(0,tug)+tug*(tug<0?-20:0)+tugSettle;
  rope(s,[-544,WALL-40],[-420,ballY-30],tug>0?.1:.5,109,{width:10});
  ballLashed(s,-400,ballY,120,110,{dim:key(tt,[[4.62,0],[5.4,.2],[7.6,.2],[8,0]]),loops:t>=8.02?1:.7});
  if(t>=7.6)s.knockout(polyPath(blob(-400,ballY-80,40,10,111,{amp:.2}),true),.8);
  if(t>=8.02)ripple(s,T,-400,ballY+140,80,1,{width:8,seed:112,progress:sm(8.02,9.5,t,easeOut),cov:.7});
  confetti(s,['paper'],[-900,-1000,1800,500],8,113,{size:12});
 },
 aperture(){return apertureDisc(-300,-600,110,12);},
};

/** 6. Dawn duotone (yellow + navy): the player walks to the boat with the ball and steps aboard; the adult waves and casts the rope off; the hull turns out of the harbour with the sail still furled. */
const ch6:Scene={
 draw(s,t){
  const tt=twos(t);
  cam(s,t,[[0,-320,-40,1,0],[1.2,-120,-40,1,0],[2.8,-60,-60,1.05,0],[5,-60,-60,1.05,0],[5.8,60,-80,1.05,0],[6.52,60,-80,1.05,0],[9.1,240,-80,1.05,0,easeOut],[9.75,250,-80,1.05,0]]);
  const out=sm(6.52,8.4,tt,easeOut),horizon=HZ;
  // dawn: three stepped yellow bands rising from the horizon (up one step on "effort and rest"); stars fading; water in navy tone bands
  const steps=[[.1,-1300],[.2,-700],[.35,-330]] as const;
  steps.forEach(([cov,y],k)=>{const p=new Path2D();p.moveTo(-1800,horizon);for(let x=-1800;x<=1800;x+=90)p.lineTo(x,y-(k===2?60*out:0)+24*noise1(x/300+k*5,131+k));p.lineTo(1800,horizon);p.closePath();s.tone(Y,p,out>.3&&k===2?.5:cov);});
  s.tone(Y,polyPath([[-1800,horizon-30],[1800,horizon-30],[1800,4000],[-1800,4000]],true),.1);
  nightField(s,132,{horizon:-500,stars:.35,navy:0,blue:0});
  [[.3,10],[.45,150],[.6,320]].forEach(([cov,off],k)=>{const p=new Path2D();p.moveTo(-1800,4200);for(let x=-1800;x<=1800;x+=90)p.lineTo(x,horizon+off*(1+.12*out)+14*noise1(x/220+k*3,135+k));p.lineTo(1800,4200);p.closePath();s.tone(K,p,cov);});
  s.knockout(ribbon([[-1800,horizon],[1800,horizon+4]],6,{seed:138,pressure:.2,taper:0,wobble:.5,step:60}),.9);
  // the wall in daylight: navy with paper stones; the ring; the unlit quay lights
  wall(s,[-1800,WALL,3600,1200],139,{cov:.85,stone:.6});quayLights(s,-1800,1800,WALL-28,140,0);
  mooringRing(s,-200,WALL+70,30,141);
  // the hull: alongside, then turns 12° and moves out on "effort and rest"; the sail stays furled on the boom
  const heel=key(tt,[[6.52,0],[6.75,-.02,easeIn],[7.4,.12,easeOut],[8,.1]]),hx=300+360*out,hy=-20+40*out;
  if(t>=6.52){const p=new Path2D(),n=Math.round(9*sm(6.52,7.3,tt,easeOut));for(let i=0;i<n;i++){const y=horizon+20+i*44,w=250-i*22;p.rect(hx-300+i*6+10*Math.sin(i*1.3),y,w,12);}s.tone(K,p,.5);}
  s.save();s.translate(hx,hy);s.rotate(heel);s.scale(1.3);hull(s,0,0,480,0,144,{weight:10});mast(s,-60,-520,-40,145);furledSail(s,-60,-520,470,300,146,1);
  // the player: walks along the wall with the ball under an arm, steps aboard, stands on the deck (with the ball)
  const aboard=sm(2.2,3,tt,easeIO);
  if(aboard>=1){const me=figure(s,60/1.3,-52/1.3,400,K,147,'stand',{facing:1,arms:[[[-.16,-.6],[-.24,-.46],[-.23,-.3]],[[.16,-.6],[.3,-.5],[.26,-.34]]]});footballPanels(s,me.hands[1][0]+30,me.hands[1][1]+10,64,{key:K,shadow:Y,seed:148});}
  s.restore();
  if(aboard<1){const walk=sm(0,2.2,tt,easeIO),wx=lerp(-330,-40,walk),wy=lerp(WALL,-80,aboard)-60*Math.sin(aboard*Math.PI),cyc=walk<1?stride(twosIndex(t)):undefined;
   const me=figure(s,lerp(wx,300,aboard),wy,520,K,147,walk<1?'run':'stand',{facing:1,legs:cyc?.legs,arms:cyc?.arms??[[[-.16,-.6],[-.24,-.46],[-.23,-.3]],[[.16,-.6],[.3,-.5],[.26,-.34]]]});
   footballPanels(s,me.hands[1][0]+30,me.hands[1][1]+10,84,{key:K,shadow:Y,seed:148});}
  // the rope: from the bow to the ring; the adult casts it off on "effort and rest" — the end lifts from the ring and goes slack
  const cast=sm(6.52,7.1,tt,easeOut);
  rope(s,[hx-300*1.3,hy-70*1.3],cast<1?[-200,WALL+70-60*cast]:[hx-440,hy+60],cast<1?.2:.9,149,{width:14});
  // the adult on the wall: waves on "Talk about" (arm up twice), then bends to the ring and stands back
  const wave=t>=2.8&&t<4?Math.sin((tt-2.8)*12):0,bend=t>=6.2?sm(6.2,6.6,tt,easeOut)*(1-sm(7.1,7.6,tt,easeOut)):0,toRing=sm(5.6,6.2,tt,easeIO),ac=toRing>0&&toRing<1?stride(twosIndex(t)):undefined;
  figure(s,lerp(-780,-330,toRing),WALL,720,K,150,ac?'run':'stand',{facing:1,tilt:.3*bend,legs:ac?.legs,arms:ac?ac.arms:[[[-.16,-.6],[-.24,-.46],[-.23,-.3]],t>=2.8&&t<4?[[.16,-.6],[.34,-.8],[.3+.1*wave,-1.02]]:bend>0?[[.16,-.6],[.3,-.4],[.34,-.18]]:[[.16,-.6],[.24,-.46],[.23,-.3]]]});
  if(t>=1.2)ripple(s,K,hx+40,150,120,2,{width:6,seed:151,spacing:60,progress:sm(1.2,2.2,t,easeOut),cov:.6});
  if(t>=3&&t<3.6)spray(s,300,-60,t-3,152,.8);
  confetti(s,[Y],[-900,-1000,1800,500],8,153,{size:14,cov:.6});
 },
 still:5.6,
};

export const story:RisoStory={
 id:'harbour-night',format:'9v9',title:'The Harbour at Night',theme:'Making room for rest',ageNote:'A direct mental-skills explainer for developing players; playing format does not define age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',teal:'#00838a',blue:'#0078bf',navy:'#22366b'},order:['yellow','teal','blue','navy'],registration:2,alpha:.9,grain:.6,mottle:.55},
 audio:{mode:'chapters'},
 chapters:[
  {label:'ROOM TO PAUSE',narration:'Can you care about football and still need a break? Yes. Rest belongs in your routine, alongside the effort you give to learning.',seconds:10.35,audio:CH+'1.m4a',cues:[{at:0,words:'Can you care'},{at:1.62,words:'need a break'},{at:6.1,words:'alongside the effort'}]},
  {label:'REST IS NOT WEAKNESS',headline:'Not weakness',narration:'Think of a harbour: a space between journeys. Pausing does not make a boat less useful. Needing rest does not make you weak.',seconds:9.85,audio:CH+'2.m4a',cues:[{at:0,words:'Think of a harbour'},{at:3.22,words:'Pausing does not'},{at:6.44,words:'does not make you weak'}]},
  {label:'CHECK IN',headline:'Check in',narration:'More practice is not always the next helpful choice. How do you feel after training? Notice when you feel tired or overwhelmed.',seconds:10.55,audio:CH+'3.m4a',cues:[{at:0,words:'More practice'},{at:3.72,words:'How do you feel'},{at:6.6,words:'tired or overwhelmed'}]},
  {label:'SAY WHAT YOU NEED',narration:'Tell a trusted adult or your coach. You can say, I feel worn out. Can we plan a break before another drill?',seconds:9.15,audio:CH+'4.m4a',cues:[{at:0,words:'Tell a trusted'},{at:3.5,words:'I feel worn out'},{at:5.26,words:'plan a break'}]},
  {label:'LET THE SAIL SETTLE',headline:'Make room',narration:'Make room for a regular bedtime, time with friends, and things you enjoy away from football. Your interest in the game can stay.',seconds:10.35,audio:CH+'5.m4a',cues:[{at:0,words:'Make room'},{at:2.4,words:'time with friends'},{at:4.62,words:'away from football'}]},
  {label:'EFFORT AND REST',narration:'Before your next session, check in again. Talk about what you need. A useful football routine has space for effort and rest.',seconds:9.75,audio:CH+'6.m4a',cues:[{at:0,words:'Before your next'},{at:2.8,words:'Talk about'},{at:6.52,words:'effort and rest'}]},
 ],
 draw(f){playChapters(story,f,[ch1,ch2,ch3,ch4,ch5,ch6]);},
 /** Touch: one paper star wakes at the touch point (a knockout that swells and settles) and a yellow glint dash bobs beneath it on the water. No rings (cross-story). */
 touch(s,x,y,age,seed){
  const a=age<=0?.15:age,k=clamp(a/.8),r=rng(seed),pop=easeOutBack(clamp(a/.25))*(1-.5*sm(.5,.8,a));
  s.tone(Y,polyPath(blob(x,y,190*pop,170*pop,seed+2,{amp:.08}),true),.35*(1-.6*k));
  const star=new Path2D();for(let i=0;i<8;i++){const ang=i/8*Math.PI*2-Math.PI/2,d=i%2?42:118;const px=x+Math.cos(ang)*d*pop,py=y+Math.sin(ang)*d*pop;if(i)star.lineTo(px,py);else star.moveTo(px,py);}star.closePath();
  s.knockout(star,.95);s.tone(Y,star,.2);
  s.fill(Y,polyPath(blob(x+(r()-.5)*60,y+170+16*k,70,9,seed,{amp:.2}),true),.85*(1-k));
  if(a<.4)dust(s,null,x,y,120,8,{seed:seed+1,size:8,cov:.8*(1-a/.4)});
 },
};
