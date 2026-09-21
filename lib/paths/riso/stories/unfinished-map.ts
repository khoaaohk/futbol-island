/** The Unfinished Map — riso. Lead material: a pencilled map that is still being drawn. Cream paper stays the ground; the ink is a
 * pencil's line: a faint wobbly grid, elongated contour loops stepping up hills (uneven spacing, never a target), a torn teal river with
 * a bridge, a coastline with the sea beyond, the pencil itself (paper body, navy line, red eraser), eraser crumbs, X-mark landmarks and
 * pins, a yellow route, a red verdict stamp that lands on the map and never on a person, and the ball as a PENCIL-SKETCHED football
 * (paper disc, pencil seams, one filled panel, a map pin). People are ABSTRACT riso figures (bible §1c.4): navy = the player ("you"),
 * teal = the coach and the teammate, red = the opponent/defender. Inks: yellow → teal → red → navy on cream. Scenes read only their local t. */
import type {Sheet} from '../sheet';
import {type RisoStory,type Scene,playChapters} from '../story';
import {aperture,apertureDisc} from '../passage';
import {twos,twosIndex,sm,easeOut,easeIO,easeIn,easeOutBack,linear,key,anticipate,settle,clamp,lerp,rng,hash,noise1,blob,polyPath,circlePath,ribbon,partial,smoothPts,rotPts,TAU,type Pt,type Key} from '../motion';
import {contour,dust,laneArrow,speedLines,confetti,handCut,sparkBurst} from '../shapes';

const CH='/stories/narration/9v9/unfinished-map/';
const Y='yellow',T='teal',R='red',K='navy';
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


// ---------------- the world: a pencilled map ----------------
/** A faint pencil grid: wobbly navy lines every `gap` units, one stroke op. bow(x,y) returns a local displacement (paper dents). */
function paperGrid(s:Sheet,seed:number,gap:number,cov:number,o:{loosen?:number;bow?:(x:number,y:number)=>number}={}){
 const{loosen=0,bow}=o,p=new Path2D(),g=gap+loosen,lim=2200;
 for(let x=-lim;x<=lim;x+=g){p.moveTo(x,-lim);for(let y=-lim;y<=lim;y+=120)p.lineTo(x+4*noise1(y/300+x,seed)+(bow?bow(x,y):0),y);}
 for(let y=-lim;y<=lim;y+=g){p.moveTo(-lim,y);for(let x=-lim;x<=lim;x+=120)p.lineTo(x,y+4*noise1(x/300+y,seed+1)+(bow?bow(x,y):0));}
 s.stroke(K,p,3,cov);
}
/** pencil: a pressure-varied graphite line (navy ribbon with wobble); progress draws it on. */
function pencil(s:Sheet,pts:Pt[],width:number,o:{seed?:number;progress?:number;cov?:number;close?:boolean;ink?:string}={}){
 const{seed=1,progress=1,cov=1,close=false,ink=K}=o,line=progress>=1?pts:partial(smoothPts(pts,close,6),progress);if(line.length<2)return;
 contour(s,ink,line,width,{seed,pressure:.6,taper:.5,wobble:1.6,close:close&&progress>=1,cov});
}
/** Contour hill: `count` ELONGATED pencil loops (aspect 1.6–2.2, rotated 20–40°) with uneven spacing, teal tone inside the inner three. */
function hill(s:Sheet,cx:number,cy:number,count:number,spacing:number,seed:number,o:{cov?:number;tones?:number[];toneInk?:string;squeeze?:number}={}){
 const{cov=.85,tones=[.32,.22,.12],toneInk=T,squeeze=1}=o,asp=1.6+.6*hash(1,seed),rot=(.35+.35*hash(2,seed))*(hash(3,seed)>.5?1:-1);
 let r=spacing*.8;const rings:Pt[][]=[];for(let k=0;k<count;k++){rings.push(blob(cx,cy,r*asp*squeeze,r*squeeze,seed+k,{amp:.07,rot,n:Math.max(28,Math.round(r/10))}));r+=spacing*(.65+.7*hash(k+7,seed));}
 for(let k=Math.min(2,count-1);k>=0;k--)s.tone(toneInk,polyPath(rings[k],true),tones[k]);
 rings.forEach((pts,k)=>pencil(s,pts,5+k*.4,{seed:seed+k,cov,close:true}));
}
/** The river: a torn teal band along `pts`; a paper gap opens under a bridge at gapAt (progress 0..1). */
function river(s:Sheet,pts:Pt[],width:number,seed:number,o:{gapAt?:Pt;gap?:number;cov?:number;ink?:string}={}){
 const{gapAt,gap=0,cov=.35,ink=T}=o;
 s.fill(ink,ribbon(pts,width,{seed,pressure:.2,taper:.15,wobble:9,step:24}),cov);
 pencil(s,pts.map(p=>[p[0],p[1]-width*.5] as Pt),3,{seed:seed+2,cov:.5});
 if(gapAt&&gap>0)s.knockout(polyPath(blob(gapAt[0],gapAt[1],120*gap,70*gap,seed+3,{amp:.08}),true),.95);
}
/** The coastline: a pencil line with the sea (teal .18) beyond it on `side` (+1 = right of the line), construction ticks at the unfinished end, ext extends it in teal. */
function coast(s:Sheet,pts:Pt[],seed:number,o:{ticks?:boolean;ext?:number;side?:number;cov?:number}={}){
 const{ticks=true,ext=0,side=1,cov=.18}=o,e=pts[pts.length-1],full=ext>0?[...pts,[e[0]+120*ext,e[1]-60*ext] as Pt,[e[0]+200*ext,e[1]-160*ext] as Pt]:pts,last=full[full.length-1];
 const sea=polyPath([...full,[last[0]+side*2500,last[1]],[full[0][0]+side*2500,full[0][1]]],true);s.tone(T,sea,cov);
 {const r=rng(seed+8),d=new Path2D();for(let i=0;i<10;i++){const k=Math.floor(r()*(full.length-1)),x=full[k][0]+side*(120+r()*500),y=full[k][1]+(r()-.5)*200;d.rect(x,y,50+r()*60,5);}s.fill(T,d,.5);}
 pencil(s,pts,6,{seed});if(ext>0)pencil(s,[e,full[full.length-2],last],6,{seed:seed+5,ink:T});
 if(ticks)for(let i=0;i<3;i++)pencil(s,[[e[0]+20+i*22,e[1]-24],[e[0]+30+i*22,e[1]+10]],3,{seed:seed+i+1,cov:.7});
}
/** The pencil: paper body with a navy line, a cone tip, a red eraser band. (x,y) = the working tip; angle = tip → butt. flip puts the eraser at the tip. */
function thePencil(s:Sheet,x:number,y:number,angle:number,seed:number,o:{flip?:number;len?:number;r?:number}={}){
 const{flip=0,len=400,r=34}=o,a=angle+flip*Math.PI;
 const place=(pts:Pt[])=>rotPts(pts,a).map(p=>[p[0]+x,p[1]+y] as Pt);
 const body=place([[70,-r],[len-40,-r],[len,-r*.7],[len,r*.7],[len-40,r],[70,r]]),tip=place([[0,0],[70,-r],[70,r]]),eraser=place([[len-40,-r],[len,-r*.7],[len,r*.7],[len-40,r]]),band=place([[len-46,-r],[len-40,-r],[len-40,r],[len-46,r]]);
 s.knockout(polyPath(body,true),.95);s.tone(T,polyPath(body,true),.12);
 s.knockout(polyPath(tip,true),.95);s.fill(K,polyPath(place([[0,0],[22,-r*.3],[22,r*.3]]),true));
 s.fill(R,polyPath(eraser,true),.75);s.fill(K,polyPath(band,true),.9);
 contour(s,K,[...tip.slice(1,2),...body.slice(0,3),...body.slice(3,6),tip[2],tip[0],tip[1]],5,{close:true,seed,pressure:.5,wobble:1.2,gaps:[[.3,.34]]});
 s.stroke(K,polyPath([place([[75,0]])[0],place([[len-50,0]])[0]],false),3,.5);
}
/** Eraser crumbs: paper flecks with navy (or red) specks that scatter and settle. */
function crumbs(s:Sheet,x:number,y:number,n:number,seed:number,age:number,o:{ink?:string;spread?:number}={}){
 const{ink=K,spread=60}=o;if(age<0)return;const r=rng(seed),k=easeOut(clamp(age/.5)),p=new Path2D(),q=new Path2D();
 for(let i=0;i<n;i++){const a=r()*Math.PI*2,d=(20+r()*spread)*k,px=x+Math.cos(a)*d,py=y+Math.sin(a)*d*.6+30*k*k*(r()>.5?1:0),sz=5+r()*6;p.rect(px-sz,py-sz*.5,sz*2,sz);q.rect(px-2,py-2,4,4);}
 s.knockout(p,.95);s.fill(ink,q,.9);
}
/** Bridge: two piers then an arch (three strokes, each with a small overshoot). */
function bridge(s:Sheet,x:number,y:number,w:number,seed:number,p1:number,p2:number,p3:number){
 const over=(p:number)=>p>=1?1:p*(1+.12*Math.sin(p*Math.PI));
 if(p1>0)pencil(s,[[x-w/2,y+40],[x-w/2+6,y-30]],8,{seed,progress:over(p1)});
 if(p2>0)pencil(s,[[x+w/2,y+40],[x+w/2-6,y-30]],8,{seed:seed+1,progress:over(p2)});
 if(p3>0)pencil(s,[[x-w/2-20,y-20],[x-w/4,y-70],[x,y-84],[x+w/4,y-70],[x+w/2+20,y-20]],9,{seed:seed+2,progress:over(p3)});
}
/** A map pin: navy needle and head with a paper glint (a landmark you can name). */
const pin=(s:Sheet,x:number,y:number,seed:number,size=1,cov=1)=>{pencil(s,[[x,y],[x+3,y-90*size]],7,{seed,cov});s.fill(K,polyPath(blob(x+4,y-108*size,26*size,26*size,seed+1,{amp:.08}),true),cov);s.knockout(circlePath(x-4*size,y-116*size,7*size),.9*cov);};
/** The red verdict stamp: a torn red mass. */
function stamp(s:Sheet,x:number,y:number,w:number,h:number,seed:number,o:{cov?:number;rot?:number}={}){const{cov=.7,rot=0}=o;const pts=rotPts(handCut([[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[-w/2,h/2]],seed,14,70),rot).map(p=>[p[0]+x,p[1]+y] as Pt);s.fill(R,polyPath(pts,true),cov);s.fill(R,polyPath(rotPts(handCut([[-w/2+30,-h/2+30],[w/2-30,-h/2+30],[w/2-30,h/2-30],[-w/2+30,h/2-30]],seed+1,10,60),rot).map(p=>[p[0]+x,p[1]+y] as Pt),true),Math.min(.94,cov+.2));}
/** This story's football: a pencil sketch — paper disc, pencil rim, one filled pentagon and pencilled seams to five outlined panels; an optional map pin above. */
function sketchBall(s:Sheet,x:number,y:number,r:number,seed:number,o:{rot?:number;pin?:number;bright?:number;sx?:number;sy?:number;cov?:number}={}){
 const{rot=0,pin:pinK=0,bright=0,sx=1,sy=1,cov=1}=o;
 s.save();s.translate(x,y);s.scale(sx,sy);
 const disc=polyPath(blob(0,0,r,r,seed,{amp:.025,n:48}),true);s.knockout(disc,.95);
 s.save();s.clip(disc);
 const pent=(cx:number,cy:number,pr:number,a0:number):Pt[]=>{const pts:Pt[]=[];for(let i=0;i<5;i++){const a=a0+i/5*TAU;pts.push([cx+Math.cos(a)*pr,cy+Math.sin(a)*pr]);}return pts;};
 s.fill(K,polyPath(pent(0,0,r*.33,rot),true),.9*cov);
 for(let i=0;i<5;i++){const a=rot+Math.PI/5+i/5*TAU,d=r*.86;pencil(s,pent(Math.cos(a)*d,Math.sin(a)*d,r*.3,a+Math.PI),Math.max(2,r*.045),{seed:seed+2+i,close:true,cov});}
 const seams=new Path2D();for(let i=0;i<5;i++){const a=rot+i/5*TAU,a2=rot+Math.PI/5+i/5*TAU;seams.moveTo(Math.cos(a)*r*.33,Math.sin(a)*r*.33);seams.lineTo(Math.cos(a2)*r*.6,Math.sin(a2)*r*.6);}s.stroke(K,seams,Math.max(2,r*.045),.85*cov);
 s.tone(T,polyPath(blob(r*.3,r*.35,r*.9,r*.9,seed+9,{amp:.03}),true),.12*cov);
 s.restore();
 contour(s,K,blob(0,0,r,r,seed+1,{amp:.02,n:48}),Math.max(3,r*.07),{close:true,seed:seed+1,pressure:.6,wobble:r*.02,cov});
 if(bright>0)s.knockout(polyPath(blob(-r*.35,-r*.35,r*.22*bright,r*.14*bright,seed+9,{amp:.15,rot:-.6}),true),.9);
 s.restore();
 if(pinK>0)pin(s,x,y-r-6,seed+20,pinK*.8,cov);
}
const shavings=(s:Sheet,box:[number,number,number,number],n:number,seed:number)=>confetti(s,[T,K],box,n,seed,{size:16,cov:.6});
const xMark=(s:Sheet,x:number,y:number,r:number,seed:number,o:{ink?:string;cov?:number;progress?:number}={})=>{const{ink=K,cov=1,progress=1}=o;pencil(s,[[x-r,y-r],[x+r,y+r]],7,{seed,cov,ink,progress:clamp(progress*2)});if(progress>.5)pencil(s,[[x+r,y-r],[x-r,y+r]],7,{seed:seed+1,cov,ink,progress:clamp(progress*2-1)});};
/** A pencilled speech bubble: paper with a pencil rim, tail toward `tail` (relative). */
function bubble(s:Sheet,x:number,y:number,w:number,h:number,tail:Pt,seed:number,k=1){
 if(k<=0)return;const pts=blob(x,y,w/2*k,h/2*k,seed,{amp:.05}),path=polyPath(pts,true),tx=x+tail[0]*k,ty=y+tail[1]*k,base=Math.atan2(ty-y,tx-x);
 path.moveTo(x+Math.cos(base-.3)*w*.42*k,y+Math.sin(base-.3)*h*.42*k);path.lineTo(tx,ty);path.lineTo(x+Math.cos(base+.3)*w*.42*k,y+Math.sin(base+.3)*h*.42*k);path.closePath();
 s.knockout(path,.95);s.tone(Y,path,.12);pencil(s,pts,6,{seed:seed+1,close:true});pencil(s,[[x+Math.cos(base-.25)*w*.45*k,y+Math.sin(base-.25)*h*.45*k],[tx,ty],[x+Math.cos(base+.25)*w*.45*k,y+Math.sin(base+.25)*h*.45*k]],5,{seed:seed+2});
}
/** A dotted pencil sight line, growing tip-first. */
const sightLine=(s:Sheet,a:Pt,b:Pt,progress:number,cov=1)=>{const q=partial(smoothPts([a,b],false,6),progress),p=new Path2D();for(let i=0;i<q.length;i+=7)p.addPath(circlePath(q[i][0],q[i][1],10));s.fill(K,p,cov);};

// ---------------- chapters ----------------
/** 1. The map's corner: the coach points out a mistake (a red X in a bubble); the X flies onto the player, who shrinks and slumps (the verdict reading); the ball at the feet is held close. */
const ch1:Scene={
 draw(s,t){
  const tt=twos(t);
  cam(s,t,[[0,-40,-80,1.05,0],[1,-40,-80,1.1,0],[3.26,-40,-80,1.1,0],[4,-100,-40,1.16,-.04],[6.82,-100,-40,1.16,-.04],[7.8,-220,0,1.16,-.04],[9.55,-220,0,1.16,-.04,linear],[10.23,-190,160,1.8,-.04]]);
  s.field(Y,.1,.2);
  const land=sm(3.26,3.7,tt,easeIn),dent=land>=1?1-.3*sm(6.82,8,tt):0;
  paperGrid(s,11,120,.12,{bow:(x,y)=>dent*16*Math.exp(-(((x+300)/300)**2+((y-60)/220)**2))});
  hill(s,-620,-420,5,60,13,{});
  coast(s,[[640,-700],[560,-520],[500,-380],[470,-260]],12,{ticks:true,side:1});
  river(s,[[-900,520],[-500,480],[-100,500],[300,470],[900,440]],90,14,{});
  shavings(s,[100,-600,500,260],6,20);
  // the coach: points at the player; a bubble pops from the head and the pencil draws a red X inside it
  const coach=figure(s,320,240,640,T,15,'point',{facing:-1});
  const pop=easeOutBack(sm(.3,.65,tt)),bx=coach.head[0]-300,by=coach.head[1]-150;
  bubble(s,bx,by,380,240,[150,90],16,pop);
  const xp=sm(.8,1.5,tt,easeOut);
  // the X: drawn in the bubble, then flies onto the player's chest on "a verdict about you"
  const fly=land,xx=lerp(bx,-300+30,fly),xy=lerp(by,240-.47*540,fly)-120*Math.sin(fly*Math.PI);
  if(xp>0&&fly<=0)xMark(s,bx,by,64,17,{ink:R,progress:xp});
  // the player: stands, then shrinks 12 % and slumps as the X lands; on "especially when you care" the head drops to the ball and it is held close
  const shrink=sm(3.5,4,tt,easeOut),care=sm(6.82,7.4,tt,easeOut),size=lerp(540,475,shrink);
  const me=figure(s,-300,240,size,K,18,shrink>0?'slump':'stand',{facing:1,tilt:.22*shrink*(shrink>0?1:0)-.22*(shrink>0?1-shrink:0)+.06*care,headDrop:shrink>0?[.02,.08+.06*care]:undefined});
  if(fly>0)xMark(s,xx,xy,70*lerp(1,.8,fly),17,{ink:R});
  if(land>=1&&t<4.4)dust(s,R,-270,0,120,10,{seed:19,size:6,cov:.8});
  const ballX=lerp(-150,-190,care);sketchBall(s,ballX,160,100,21,{rot:.3,bright:care});
  if(care>0)pencil(s,blob(ballX,160,130,130,22,{amp:.06}),5,{seed:22,progress:sm(6.82,7.3,tt,easeOut),close:true,cov:.8});
  // the pencil: draws the X in the bubble, carries it down to the player, then rests by the ball
  let px=bx+40,py=by-20;
  if(xp<1){const l=partial(smoothPts([[bx-70,by-70],[bx+70,by+70]],false,6),clamp(xp*2)),e=l[l.length-1];px=e[0];py=e[1];}
  else if(t<3.26){px=bx+80;py=by+40;}
  else if(fly<1){px=xx+60;py=xy-30;}
  else if(t<6.82){px=-120;py=-80;}
  else{const c=blob(ballX,160,130,130,22,{amp:.06}),p=c[Math.floor(sm(6.82,7.3,tt,easeOut)*(c.length-1))];px=p[0];py=p[1];}
  thePencil(s,px,py,-.6,23);
  if(t>=1.5&&t<3.26)crumbs(s,bx,by+90,3,24,t-1.5);
 },
 aperture(){return apertureDisc(-190,160,90,12);},
};

/** 2. The map spread: the route redrawn to the X, the residue erased, a bridge added, a yellow route chosen to a pin, the ball rolls. */
const ch2:Scene={
 draw(s,t){
  const tt=twos(t);
  cam(s,t,[[0,-150,150,1,0],[1.2,20,20,1,0],[4.14,20,20,1,0],[5,220,-20,1.25,0],[7,220,-20,1.25,0],[8,300,-140,1.25,0],[8.6,330,-150,1.25,0],[9.3,330,-150,1.25,0,linear],[9.93,220,-10,1.75,0]]);
  const rub=t>=2.6&&t<3.6?twosIndex(t)%3:0;
  s.field(Y,.1,.2);
  paperGrid(s,31,120,.12,{bow:(x,y)=>rub?6*Math.exp(-(((x-140)/200)**2+((y-180)/120)**2)):0});
  hill(s,-420,-200,5,60,32,{});hill(s,440,240,5,56,33,{});
  coast(s,[[700,-620],[600,-440],[560,-300],[540,-200]],34,{ticks:true,side:1});
  const b1=sm(4.14,4.5,tt,easeOut),b2=sm(4.45,4.8,tt,easeOut),b3=sm(4.75,5.1,tt,easeOut);
  river(s,[[-700,120],[-400,70],[-100,50],[60,20],[240,0],[400,-40],[700,-60]],90,35,{gapAt:[220,-16],gap:sm(4.9,5.3,tt,easeOut)});
  const residue=key(tt,[[2.6,.3],[3.6,.1]]);if(residue>.05)s.tone(R,polyPath(handCut([[-10,100],[290,90],[300,260],[0,270]],36,12,70),true),residue);
  crumbs(s,140,180,8,37,t-2.9,{ink:R,spread:80});crumbs(s,60,60,6,38,t-7.4);
  const draw=sm(0,.8,tt,easeIO),erase=sm(7,7.4,tt);
  const route:Pt[]=[[-380,300],[-260,200],[-120,110],[0,50],[60,20]];
  if(erase<1){const line=partial(smoothPts(route,false,6),draw),p=new Path2D();for(let i=0;i<line.length-3;i+=6){p.moveTo(line[i][0],line[i][1]);p.lineTo(line[i+3][0],line[i+3][1]);}s.stroke(K,p,7,.85*(1-erase));}
  if(t>=.8)pencil(s,blob(60,20,50,44,39,{amp:.08}),6,{seed:39,progress:sm(.8,1.1,tt,easeOut),close:true});
  if(t>=1.1&&erase<1)pencil(s,[[-10,55],[10,40],[-8,28]],6,{seed:40,cov:1-erase});
  bridge(s,220,-16,220,41,b1,b2,b3);
  if(t>=5.54)xMark(s,330,-60,36,42,{ink:K,progress:sm(5.54,5.9,tt)});
  pin(s,380,-300,43);
  const lane=sm(7,7.9,tt,easeOut),laneOver=lane>=1?1+.03*settle(t,7.9,{amp:1,freq:3,decay:4}):lane;
  if(lane>0){const L:Pt[]=[[-360,320],[-200,200],[0,80],[220,-30],[380,-280]];laneArrow(s,Y,L[0],L[1],56,{seed:44,progress:clamp(laneOver*4)});if(laneOver>.25)laneArrow(s,Y,L[1],L[2],56,{seed:45,progress:clamp((laneOver-.25)*4),head:1});if(laneOver>.5)laneArrow(s,Y,L[2],L[3],56,{seed:46,progress:clamp((laneOver-.5)*4),head:1});if(laneOver>.75)laneArrow(s,Y,L[3],L[4],56,{seed:47,progress:clamp((laneOver-.75)*4)});}
  const roll=anticipate(8,8.7,tt,{back:.1,hold:.25,e:easeOut}),rs=t>=8.7?settle(t,8.7,{amp:.05,freq:4,decay:5,phase:Math.PI/2}):0;
  const mx=lerp(-380,-200,Math.max(0,roll)),my=lerp(340,200,Math.max(0,roll));
  if(roll>0&&roll<1)speedLines(s,K,mx,my,Math.atan2(-140,180),{n:3,seed:48,len:120,spread:40,width:6,cov:.6});
  sketchBall(s,mx,my,92,49,{rot:roll*3+(roll<0?roll*.5:0),sx:1+rs,sy:1-rs,pin:1});
  shavings(s,[-600,-500,400,300],6,50);
  const flip=key(tt,[[2.2,0],[2.35,-.08,easeIn],[2.65,1,easeOut],[3.7,1],[4,0,easeOut]]);
  let px=240,py=300;if(draw<1){const l=partial(smoothPts(route,false,6),draw),e=l[l.length-1];px=e[0];py=e[1];}else if(t<2.2){px=60;py=20;}
  else if(t<4.14){px=140+rub*30-40;py=180-30*Math.abs(flip-.5)*2*(flip<1?1:0)-8*rub;}
  else if(t<7){px=b3>0?lerp(120,320,b3):b2>0?330:120;py=b3>0?-70:lerp(40,-30,Math.max(b1,b2));}
  else if(lane<1){const L=partial(smoothPts([[-360,320],[-200,200],[0,80],[220,-30],[380,-280]],false,6),lane),e=L[L.length-1];px=e[0];py=e[1];}else{px=400;py=-250;}
  thePencil(s,px,py,-.7,51,{flip:Math.max(0,flip)});
 },
 aperture(){return apertureDisc(220,-10,96,12);},
};

/** 3. Ask for a landmark: the coach says "look up" (an up-arrow bubble); the player asks (a hook bubble); the pencil circles the red opponent, then the teal teammate; an X landmark and a yellow lane, and the pass goes to the teammate. */
const ch3:Scene={
 draw(s,t){
  const tt=twos(t);
  cam(s,t,[[0,-100,-80,1.05,0],[.9,-100,-80,1.05,0],[2.12,-100,-80,1.05,0],[3.02,-100,-80,1.05,0],[3.6,360,-440,1.05,0],[3.92,360,-440,1.05,0],[4.5,620,60,1.05,0],[5.62,620,60,1.05,0],[6.8,420,60,1.05,0],[7.6,460,80,1.05,0],[9.5,460,80,1.05,0,linear],[10.13,650,340,1.9,0]]);
  s.field(Y,.1,.2);
  paperGrid(s,61,120,.15);
  hill(s,-900,560,5,60,62,{});
  river(s,[[-800,560],[-300,520],[200,540],[800,500]],90,63,{});
  coast(s,[[-500,-900],[-360,-760],[-260,-660],[-180,-560]],64,{ticks:true,side:-1});
  shavings(s,[-700,-300,300,200],6,65);
  // the coach: arm up, "Look up" as a bubble with a pencilled up-arrow; the player looks up
  const coach=figure(s,-420,300,700,T,66,'point',{facing:1,arms:[[[-.16,-.6],[-.24,-.46],[-.23,-.3]],[[.13,-.6],[.32,-.78],[.42,-1]]]});
  const pop=easeOutBack(sm(0,.35,tt)),bx=coach.head[0]+330,by=coach.head[1]-30;
  bubble(s,bx,by,360,230,[-150,40],67,pop);
  if(pop>=1){const a=sm(.35,.8,tt,easeOut);pencil(s,[[bx,by+70],[bx,by-70]],8,{seed:68,progress:a});if(a>.6)pencil(s,[[bx-60,by-20],[bx,by-80],[bx+60,by-20]],8,{seed:69,progress:clamp((a-.6)*2.5)});}
  const lookUp=sm(.5,.9,tt,easeOut);
  const me=figure(s,60,300,540,K,70,'stand',{facing:1,head:[.03*lookUp,-.82-.06*lookUp],tilt:-.04*lookUp});
  // the question: an empty bubble from the player with a pencilled hook (the pencil hovers between the two players it lists)
  const q=easeOutBack(sm(2.12,2.5,tt));
  if(q>0){const qx=me.head[0]+250,qy=me.head[1]-60;bubble(s,qx,qy,300,200,[-120,40],71,q);if(q>=1)pencil(s,[[qx-40,qy-40],[qx+10,qy-60],[qx+40,qy-20],[qx+6,qy+16],[qx+6,qy+50]],7,{seed:72,progress:sm(2.4,2.9,tt)});}
  // the two candidates: the red opponent top-right (jolts when circled), the teal teammate right (bobs when circled)
  const jolt=t>=3.4&&t<3.6?(twosIndex(t)%2?8:-8):0,bob=t>=4.3?settle(t,4.3,{amp:8,freq:4,decay:4}):0;
  figure(s,560+jolt,-360,460,R,73,'stand',{facing:-1,arms:[[[-.13,-.6],[-.3,-.62],[-.44,-.7]],[[.13,-.6],[.3,-.62],[.44,-.7]]]});
  if(t>=3.1)pencil(s,blob(560,-580,200,280,74,{amp:.06}),t>=8.02?4:7,{seed:74,progress:sm(3.1,3.5,tt,easeOut),close:true});
  const cushion=t>=7.55?settle(t,7.55,{amp:.1,freq:4,decay:5,phase:Math.PI/2}):0;
  figure(s,880,330+bob,460,T,75,'reach',{facing:-1,tilt:cushion*.3,arms:[[[-.16,-.6],[-.24,-.46],[-.23,-.3]],[[.13,-.6],[.2,-.8],[.22,-1.02]]]});
  if(t>=4)pencil(s,blob(880,110,200,290,76,{amp:.06}),7,{seed:76,progress:sm(4,4.4,tt,easeOut),close:true});
  // "Clear questions": an X landmark next to the teammate, then a yellow lane from the ball to the teammate's feet; the pass travels it and is cushioned
  if(t>=5.62)xMark(s,1000,60,50,77,{ink:K,progress:sm(5.62,5.95,tt)});
  if(t>=5.62)s.tone(Y,polyPath(blob(1000,60,90,90,78,{amp:.08}),true),.4*sm(5.62,5.95,tt));
  const lane=sm(5.9,6.6,tt,easeOut),L:Pt[]=[[220,320],[500,380],[800,350]];
  if(lane>0){laneArrow(s,Y,L[0],L[1],80,{seed:79,progress:clamp(lane*2),head:1});if(lane>.5)laneArrow(s,Y,L[1],L[2],80,{seed:80,progress:clamp((lane-.5)*2)});}
  const pass=sm(6.82,7.57,tt,easeOut),qq=partial(smoothPts(L,false,6),pass),e=qq[qq.length-1];
  if(pass>0&&pass<1)speedLines(s,K,e[0],e[1],Math.atan2(0,1),{n:3,seed:81,len:110,spread:30,width:5,cov:.6});
  sketchBall(s,pass>0?e[0]:160,pass>0?e[1]-40:250,95,82,{rot:pass*4,sx:1+cushion*.5,sy:1-cushion*.5});
  // the pencil: the arrow, hovers over the question, circles, marks the X, draws the lane
  let px=bx+40,py=by+60,lift=0;
  if(t<.8){px=bx+8;py=lerp(by+70,by-70,sm(.35,.8,tt,easeOut));}
  else if(t<2.12){px=bx+60;py=by+60;lift=10;}else if(t<3.02){px=me.head[0]+256;py=me.head[1]-60;lift=sm(2.7,2.9,tt)*20;}
  else if(t<3.92){const c=blob(560,-580,200,280,74,{amp:.06}),p=c[Math.floor(sm(3.1,3.5,tt)*(c.length-1))];px=p[0];py=p[1];}
  else if(t<5.62){const c=blob(880,110,200,290,76,{amp:.06}),p=c[Math.floor(sm(4,4.4,tt)*(c.length-1))];px=p[0];py=p[1];lift=sm(4.5,4.7,tt)*20;}
  else if(t<5.95){px=lerp(950,1050,sm(5.62,5.95,tt));py=lerp(10,110,sm(5.62,5.95,tt));}
  else if(lane<1){const l=partial(smoothPts(L,false,6),lane),p=l[l.length-1];px=p[0];py=p[1];}else{px=840;py=280;lift=10;}
  thePencil(s,px,py-lift,-.7,83);
 },
 aperture(){return apertureDisc(650,352,36,10);},
};

/** 4. Close on the lane: the red defender slides in and blocks it; the teammate offers a new angle; the ball travels the new lane from player to teammate. */
const ch4:Scene={
 draw(s,t){
  const tt=twos(t);
  cam(s,t,[[0,-40,40,1,0],[.8,-40,40,1.06,0],[2.6,-40,40,1.06,0],[3.3,80,0,1.06,.05],[4.22,80,0,1.06,.05],[5.6,160,-40,1.06,.12],[8.4,160,-40,1.06,.12,linear],[9.03,600,-250,1.8,.12]]);
  s.field(Y,.1,.2);
  paperGrid(s,91,160,.15);
  s.tone(T,ribbon([[-900,500],[-300,100],[300,-300],[900,-700]],220,{seed:92,pressure:0,taper:0,wobble:8,step:40}),.2);
  river(s,[[-900,-620],[-300,-580],[300,-600],[900,-560]],90,93,{});
  crumbs(s,-420,460,6,94,1);
  // the defender: twitches, then lunges into the lane with arms out (anticipation back, lunge, hard stop)
  const lunge=t>=2.6?anticipate(2.6,3.05,tt,{back:.25,hold:.35,e:easeIn}):0,twitch=t>=1.2&&t<1.4?8:0;
  const dx=140+lunge*80+twitch,dy=-160+Math.max(0,lunge)*200+(lunge<0?lunge*40:0);
  // the lanes: the first is blocked (a paper gap where the defender stands) and erased on "a different angle"; the second goes under the defender at a new angle
  const buckle=clamp(lunge),erase=sm(4.22,4.6,tt);
  const shift=anticipate(4.22,4.9,tt,{back:.08,hold:.25,e:easeOut}),tx=lerp(480,600,Math.max(0,shift)),ty=lerp(-150,-30,Math.max(0,shift))+(shift<0?shift*40:0);
  if(erase<1)laneArrow(s,Y,[-160,300],[440,-110],70,{seed:96,progress:1,cov:.9*(1-erase)*(1-.5*buckle)});
  const sight=sm(0,1.2,tt,easeOut);if(buckle<.5)sightLine(s,[-330,-120],[440,-320],sight,.9);else{const p=new Path2D();for(let i=0;i<5;i++)p.addPath(circlePath(-330+i*50,-120-i*22+(i%2?12:-12),8));s.fill(K,p,.6);}
  if(t>=4.22)pencil(s,[[480,-150],[560,-120],[600,-30]],3,{seed:101,progress:sm(4.22,4.8,tt),cov:.5});
  const lane2=sm(4.5,5.1,tt,easeOut);if(lane2>0)laneArrow(s,Y,[-160,330],[tx-120,ty+20],70,{seed:102,progress:lane2});
  crumbs(s,dx-40,dy+40,8,103,t-4.22);
  // the player with the ball; the teammate (arm raised) shifts to the new angle; the defender in the lane
  figure(s,-380,380,540,K,104,'stand',{facing:1});
  const cushion=t>=5.42?settle(t,5.42,{amp:.12,freq:4,decay:5,phase:Math.PI/2}):0;
  figure(s,tx,ty,470,T,105,'reach',{facing:-1,tilt:cushion*.3,arms:[[[-.16,-.6],[-.24,-.46],[-.23,-.3]],[[.13,-.6],[.2,-.8],[.22,-1.02]]]});
  figure(s,dx,dy,520,R,106,'stand',{facing:-1,tilt:-.06*buckle,arms:[[[-.13,-.6],[-.34,-.62],[-.54,-.6]],[[.13,-.6],[.34,-.62],[.54,-.6]]],legs:buckle>0?[[[-.06,-.3],[-.16,-.14],[-.24,0]],[[.06,-.3],[.16,-.14],[.24,0]]]:undefined});
  if(t>=6.9)pencil(s,blob(dx,dy-260,200,320,99,{amp:.06}),6,{seed:99,progress:sm(6.9,7.3,tt,easeOut),close:true});
  if(lunge>=1&&t<3.4)dust(s,R,dx+40,dy-20,60,8,{seed:100,size:6,cov:.8});
  // the pass along the new lane: .7 s roll, cushioned at the teammate's feet
  const pass=sm(4.72,5.42,tt,easeOut),rock=t<2.6?-.14*sm(0,.4,tt,easeOut):0,mx=lerp(-200,tx-120,pass),my=lerp(330,ty+10,pass)-50*Math.sin(pass*Math.PI);
  if(pass>0&&pass<1)speedLines(s,K,mx,my,Math.atan2(ty+10-330,tx-120+200),{n:4,seed:107,len:150,spread:40,width:6,cov:.6});
  sketchBall(s,mx,my,120,108,{rot:rock+pass*3,bright:sm(7.62,8,tt),sx:1+cushion*.5,sy:1-cushion*.5});
  // the margin note: the old and new angle as two strokes with an arc between them
  if(t>=6.42){const p=sm(6.42,6.92,tt,easeOut);pencil(s,[[80,340],[260,260]],6,{seed:109,progress:clamp(p*2)});pencil(s,[[80,340],[260,320]],6,{seed:110,progress:clamp(p*2-.6)});if(p>.6)pencil(s,[[150,310],[160,320],[150,330]],5,{seed:111,progress:clamp((p-.6)*2.5)});}
  let px=-330,py=-120;
  if(sight<1){const l=partial(smoothPts([[-330,-120],[440,-320]],false,6),sight),p=l[l.length-1];px=p[0];py=p[1];}
  else if(t<4.5){px=440;py=-320;}
  else if(lane2<1){px=lerp(-160,tx-120,lane2);py=lerp(330,ty+20,lane2);}
  else if(t>=6.42&&t<6.92){px=lerp(80,260,clamp(sm(6.42,6.92,tt)*2));py=lerp(340,260,clamp(sm(6.42,6.92,tt)*2));}
  else{px=280;py=270;}
  thePencil(s,px,py,-.75,112);
 },
 aperture(){return apertureDisc(600,-250,70,12);},
};

/** 5. Duotone (navy + red): the player stands big and does not change; the pass's information is written on the map beside them; the stamp lands on the map, never on the player, and slides off. */
const ch5:Scene={
 draw(s,t){
  const tt=twos(t);
  cam(s,t,[[0,0,-60,1,0],[1,0,-60,1.06,0],[3.28,0,-60,1.06,0],[4.2,80,-20,1.12,-.04],[6.44,80,-20,1.12,-.04],[7.6,-20,0,1.12,-.04],[9.4,-20,0,1.12,-.04,linear],[10.03,440,300,1.8,-.04]]);
  const drop=key(tt,[[3.28,0],[3.42,-.06,easeIn],[3.78,1,easeIn]]),slide=sm(3.9,4.5,tt,easeIn),loosen=12*sm(6.44,7.6,tt,easeOut);
  const dent=drop>=1?1-slide:0;
  paperGrid(s,121,120,.1,{loosen,bow:(x,y)=>dent*10*Math.exp(-(((x-380)/300)**2+((y-140)/300)**2))});
  hill(s,-620,-380,5,60,122,{cov:.3,tones:[.12,.08,.05],toneInk:K});hill(s,700,520,5,60,123,{cov:.3,tones:[.12,.08,.05],toneInk:K});
  river(s,[[-900,560],[-500,600],[-100,620],[500,660],[900,680]],90,124,{cov:.15,ink:K});
  confetti(s,[K],[-500,-700,900,300],6,125,{size:14,cov:.5});
  // the note beside the player: the angle diagram, a short lane with a dot, three date ticks
  const note=sm(0,.6,tt,easeOut);
  pencil(s,[[260,-340],[340,-380]],5,{seed:127,progress:clamp(note*3)});pencil(s,[[260,-340],[350,-350]],5,{seed:128,progress:clamp(note*3-1)});if(note>.66)pencil(s,[[300,-360],[305,-355],[300,-350]],4,{seed:129,progress:clamp((note-.66)*3)});
  if(note>.5){pencil(s,[[380,-360],[460,-390]],5,{seed:130,progress:clamp((note-.5)*2)});s.fill(K,circlePath(464,-392,7));}
  if(t>=1.8)for(let i=0;i<3;i++)if(t>=1.8+i*.2)pencil(s,[[230+i*26,-460],[232+i*26,-430]],4,{seed:133+i});
  // the stamp: drops onto the map beside the player (not on them), dents the paper, slides off and rests as a faint smear
  if(drop>0){const sy=lerp(-800,140,Math.max(0,drop))+(drop<0?drop*60:0)+slide*160,sx=380+slide*60;const cov=slide>=1?key(tt,[[4.5,.25],[7.44,.25],[8,.2]]):.7;stamp(s,sx,sy,360,200,134,{cov,rot:-.1+slide*.5});}
  if(t>=3.78&&t<4.3)dust(s,K,380,220,240,12,{seed:136,size:7,cov:.7});
  crumbs(s,430,300,3,137,t-4.68,{ink:R});
  // the player: big, centred, unchanged; the ball at the feet; "respect while you learn" draws a gentle loop around the whole player, then rings ripple outward
  const me=figure(s,-60,330,700,K,135,'stand',{facing:1});
  sketchBall(s,140,280,110,138,{rot:.4,bright:key(tt,[[7.44,0],[7.9,1,easeOut]])});
  if(t>=6.44){const ringPts=blob(-40,-30,430,520,139,{amp:.04,n:64});pencil(s,ringPts,6,{seed:139,progress:sm(6.44,7.34,tt,easeOut),close:true});
   for(let k=1;k<=3;k++)if(t>=6.9+k*.15)pencil(s,blob(-40,-30,430+k*60,520+k*60,140+k,{amp:.05,n:64}),4-k*.5,{seed:140+k,progress:sm(6.9+k*.15,7.5+k*.15,tt,easeOut),close:true,cov:.7});}
  void me;
  let px=440,py=-200;
  if(note<1){px=lerp(260,350,clamp(note*3-1));py=lerp(-340,-350,clamp(note*3-1));if(note<1/3){px=lerp(260,340,note*3);py=lerp(-340,-380,note*3);}}
  else if(t<6.44){px=t<2.4?230+Math.min(2,Math.floor((t-1.8)/.2))*26:490;py=t<2.4?-430:-100;}
  else{const rp=blob(-40,-30,430,520,139,{amp:.04,n:64}),p=rp[Math.floor(sm(6.44,7.34,tt,easeOut)*(rp.length-1))];px=p[0];py=p[1];}
  thePencil(s,px,py,-.7,141);
 },
 aperture(){return apertureDisc(440,300,70,12);},
};

/** 6. The map later: the player walks the yellow route with the ball; at the confusing, unfinished coast the coach waits and the player's hand goes up; the coast is extended; the player goes on. */
const ch6:Scene={
 draw(s,t){
  const tt=twos(t);
  cam(s,t,[[0,-260,160,1,0],[1,-260,160,1.08,0],[2.96,40,20,1.08,0],[4,300,-200,1.08,0],[4.96,300,-200,1.08,0],[6.4,300,-160,1.08,0],[7.82,300,-160,1.08,0],[9.4,400,-320,1.1,-.06,easeOut],[10.63,420,-340,1.1,-.06]]);
  s.field(Y,.1,.2);
  paperGrid(s,151,120,.12);
  s.tone(K,polyPath(handCut([[620,-900],[900,-900],[900,-300]],152,30,120),true),.18);
  hill(s,-520,-300,5,60,153,{});hill(s,560,420,5,56,154,{});
  river(s,[[-700,180],[-400,130],[-200,110],[0,60],[240,20],[500,-30],[700,-60]],90,155,{gapAt:[-200,110],gap:1});
  bridge(s,-200,110,220,156,1,1,1);pin(s,-90,60,157,.8);
  xMark(s,60,20,30,159,{cov:.1});
  // the unfinished coast: extended by the coach's answering teal stroke; its construction ticks erased
  const ext=sm(3.86,4.46,tt,easeOut);coast(s,[[440,-560],[380,-420],[330,-300],[300,-200]],160,{ticks:ext<.3,ext,side:1});
  crumbs(s,330,-220,5,161,t-3.9);
  // the route: re-inked on "keep the useful detail", the onward route drawn on "whole self"
  const L:Pt[]=[[-460,380],[-200,220],[0,100],[250,-40]];
  const reink=sm(.5,1.1,tt,easeOut);laneArrow(s,Y,L[0],L[1],50,{seed:165,progress:clamp(reink*3),head:1});if(reink>1/3)laneArrow(s,Y,L[1],L[2],50,{seed:166,progress:clamp((reink-1/3)*3),head:1});if(reink>2/3)laneArrow(s,Y,L[2],L[3],50,{seed:167,progress:clamp((reink-2/3)*3)});
  const L2:Pt[]=[[260,-150],[340,-260],[400,-370],[440,-470]];
  if(t>=7.82)pencil(s,L2,6,{seed:168,progress:sm(7.82,8.62,tt,easeOut)});
  // the coach waits at the confusing coast; points at the extension; waves the player on
  const point=sm(3.6,3.9,tt,easeOut),wave=t>=8.6&&t<9.6?Math.sin((tt-8.6)*12):0;
  figure(s,840,-360,660,T,162,'stand',{facing:-1,arms:[[[-.16,-.6],[-.24,-.46],[-.23,-.3]],t>=8.6&&t<9.6?[[.16,-.6],[.34,-.8],[.3+.1*wave,-1.02]]:point>0?[[.13,-.6],[.32,-.62],[.5,-.64]]:[[.16,-.6],[.24,-.46],[.23,-.3]]]});
  // the player: walks the route with the ball (1.1–2.9), stops at the hill with a hand up (asking), taps the ball on at 4.96, walks on along the onward route on "whole self"
  const walk1=sm(1.1,2.9,tt,easeIO),walk2=sm(5.2,6.1,tt,easeIO),walk3=sm(7.9,9.5,tt,easeIO);
  let pos:Pt,facing=1,moving=false;
  if(t<5.2){const q=partial(smoothPts(L,false,6),walk1),e=q[q.length-1];pos=[e[0],e[1]+30];moving=walk1>0&&walk1<1;}
  else if(t<7.9){pos=[lerp(250,330,walk2),lerp(-10,-120,walk2)];moving=walk2<1;}
  else{const q=partial(smoothPts(L2,false,6),walk3),e=q[q.length-1];pos=[e[0],e[1]+40];moving=walk3<1;}
  const ask=sm(2.96,3.3,tt,easeOut)*(1-sm(4.4,4.8,tt)),tap=t>=4.96&&t<5.2,cyc=moving?stride(twosIndex(t)):undefined;
  const me=figure(s,pos[0],pos[1],500,K,169,tap?'kick':moving?'run':'stand',{facing,legs:cyc?.legs,arms:cyc?cyc.arms:ask>0?[[[-.16,-.6],[-.24,-.46],[-.23,-.3]],[[.16,-.6],[.3,-.8*ask-.46*(1-ask)],[.34,-1.02*ask-.3*(1-ask)]]]:undefined});
  if(ask>0){const qx=me.head[0]+40,qy=me.head[1]-240;bubble(s,qx,qy,260,180,[-30,90],170,ask);if(ask>=1)pencil(s,[[qx-34,qy-34],[qx+8,qy-52],[qx+34,qy-18],[qx+6,qy+12],[qx+6,qy+40]],6,{seed:171});}
  // the ball: ahead of the player's front foot; tapped on at 4.96 to the top of the route; rolls along the onward route
  const ballAhead:Pt=t<4.96?[me.feet[1][0]+90,pos[1]-70]:t<7.9?[lerp(me.feet[1][0]+90,420,sm(4.96,5.4,tt,easeOut)),lerp(pos[1]-70,-190,sm(4.96,5.4,tt,easeOut))]:[me.feet[1][0]+90,pos[1]-70];
  const rs=t>=5.4&&t<7?settle(t,5.4,{amp:.06,freq:4,decay:4,phase:Math.PI/2}):0;
  if(t>=4.96&&t<5.4)speedLines(s,K,ballAhead[0],ballAhead[1],Math.atan2(-120,170),{n:4,seed:172,len:140,spread:40,width:6,cov:.6});
  sketchBall(s,ballAhead[0],ballAhead[1],92,173,{rot:ballAhead[0]*.01,sx:1+rs,sy:1-rs,bright:t>=7.82?1:0});
  if(t>=2.96&&t<3.5)sparkBurst(s,Y,me.head[0],me.head[1]-100,110,{n:7,seed:174,g:easeOut(sm(2.96,3.3,t))*(1-sm(3.3,3.5,t)),width:7});
  shavings(s,[-600,-600,400,300],6,175);
  // the pencil
  let px=420,py=-60;
  if(t<1.1){const l=partial(smoothPts(L,false,6),reink),p=l[l.length-1];px=p[0];py=p[1];}
  else if(t<3.86){px=300;py=-240;}
  else if(t<4.46){px=300+200*ext;py=-200-160*ext;}
  else if(t<7.82){px=560;py=-400;}
  else{px=lerp(260,560,sm(7.82,8.62,tt,easeOut));py=lerp(-150,-440,sm(7.82,8.62,tt,easeOut))-4*Math.abs(settle(t,8.62,{amp:1,freq:6,decay:3}));}
  thePencil(s,px,py,-.7,176);
 },
 still:6,
};

export const story:RisoStory={
 id:'unfinished-map',format:'9v9',title:'The Unfinished Map',theme:'Learning from feedback',ageNote:'A direct mental-skills explainer for developing players; playing format does not define age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',teal:'#00838a',red:'#ff665e',navy:'#22366b'},order:['yellow','teal','red','navy'],registration:1.6,alpha:.9,grain:.55,mottle:.4},
 audio:{mode:'chapters'},
 chapters:[
  {label:'WHAT DID YOU HEAR?',narration:'When someone points out a mistake, do you hear advice, or a verdict about you? Feedback can feel personal, especially when you care.',seconds:10.233,audio:CH+'1.m4a',cues:[{at:0,words:'When someone'},{at:3.26,words:'a verdict about you'},{at:6.82,words:'especially when you care'}]},
  {label:'INFORMATION TO USE',narration:'Useful feedback describes an action you can change. Think of a pencilled map: a new detail can help you choose another route.',seconds:9.933,audio:CH+'2.m4a',cues:[{at:0,words:'Useful feedback'},{at:4.14,words:'a pencilled map'},{at:7,words:'another route'}]},
  {label:'ASK FOR A LANDMARK',headline:'Landmark',narration:'If a coach says, Look up, ask, What should I look for? An opponent? A teammate? Clear questions make advice easier to use.',seconds:10.133,audio:CH+'3.m4a',cues:[{at:0,words:'If a coach says'},{at:2.12,words:'What should I look'},{at:5.62,words:'Clear questions'}]},
  {label:'TRY ONE CHANGE',headline:'New angle',narration:'Before your next pass, check whether a defender is blocking the lane. Try a different angle. Then ask what changed.',seconds:9.033,audio:CH+'4.m4a',cues:[{at:0,words:'Before your next pass'},{at:2.6,words:'blocking the lane'},{at:4.22,words:'a different angle'}]},
  {label:'YOUR WORTH STAYS',headline:'Worth stays',narration:'A pass gives information about that moment. It cannot measure your value as a person. You deserve respect while you learn.',seconds:10.033,audio:CH+'5.m4a',cues:[{at:0,words:'A pass gives information'},{at:3.28,words:'cannot measure your value'},{at:6.44,words:'respect while you learn'}]},
  {label:'KEEP LEARNING',narration:'Keep the useful detail. Ask for help with the confusing part. Then try again. You can adjust your play without judging your whole self.',seconds:10.635,audio:CH+'6.m4a',cues:[{at:0,words:'Keep the useful detail'},{at:2.96,words:'confusing part'},{at:7.82,words:'whole self'}]},
 ],
 draw(f){playChapters(story,f,[ch1,ch2,ch3,ch4,ch5,ch6]);},
 /** Touch: the pencil itself jumps to the touch point and draws a 90 u hook-tick while eraser crumbs scatter and settle. No contour ring (cross-story). */
 touch(s,x,y,age,seed){
  const a=age<=0?.2:age;
  pencil(s,[[x-60,y+20],[x-16,y+60],[x+68,y-52]],9,{seed,progress:age>0?sm(0,.2,a,easeOut):1});
  crumbs(s,x,y,6,seed+1,a-.05,{spread:70});
  const lift=age>0?20*(1-sm(0,.2,a,easeOut))+60*sm(.5,.8,a,easeIn):0;
  thePencil(s,x+68,y-52-lift,-.7,seed+2,{len:300,r:26});
 },
};
