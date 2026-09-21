/** Different Tides — riso. Lead material: tide lines on a shore. One ocean, two shores: a wide bay where the water
 * lunges and prints its mark at once, a narrow inlet where the same water creeps and marks later.
 * Inks: teal → blue → red → navy on cream. Blue = the fast visible tide; teal = the slow quiet tide, the teammate and the coach;
 * red = the undertow / opponent and sun warmth on dry sand; navy = rock, marks, and "you".
 * People are ABSTRACT riso figures (bible §1c.4): a head disc, a torso block and four limb strokes, toy proportions, no face —
 * `figure()` below. The ball is this story's football: a paper sphere with TEAL panels and a navy rim (`tideBall`).
 * Scenes read only their local time t; every random value is seeded. */
import type {Sheet} from '../sheet';
import {type RisoStory,type Scene,playChapters} from '../story';
import {apertureDisc} from '../passage';
import {twos,twosIndex,sm,easeOut,easeIO,easeIn,easeOutBack,linear,key,anticipate,settle,spring,squash,clamp,lerp,rng,noise1,blob,polyPath,circlePath,ribbon,partial,smoothPts,arc,TAU,type Pt,type Key} from '../motion';
import {contour,dust,laneArrow,sparkBurst,speedLines,ripple,confetti,handCut,crescent,tornRect} from '../shapes';

const CH='/stories/narration/9v9/different-tides/';
const T='teal',B='blue',R='red',K='navy';
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

// ---------------- the world: stepped tide lines ----------------
/** A tide band: everything below a torn edge y = edge(x). Lower bands print over upper ones, so the water steps darker. */
function bandPath(edge:(x:number)=>number,seed:number,amp=18,x0=-3400,x1=3400,step=90){const p=new Path2D();p.moveTo(x0,4200);for(let x=x0;x<=x1;x+=step){p.lineTo(x,edge(x)+amp*(.7*noise1(x/170+seed*3,seed)+.3*noise1(x/48+7,seed+9)));}p.lineTo(x1,4200);p.closePath();return p;}
const edgePts=(edge:(x:number)=>number,seed:number,x0:number,x1:number,amp=18,step=60):Pt[]=>{const out:Pt[]=[];for(let x=x0;x<=x1;x+=step)out.push([x,edge(x)+amp*(.7*noise1(x/170+seed*3,seed)+.3*noise1(x/48+7,seed+9))]);return out;};
/** Wave-tone lines: paper dashes drifting across a water box (phase in seconds × speed). */
function waveDashes(s:Sheet,seed:number,box:[number,number,number,number],phase:number,count:number,cov=.55){const r=rng(seed),p=new Path2D();for(let i=0;i<count;i++){const y=box[1]+r()*box[3],len=50+r()*90,w=6+r()*5,x=box[0]+(((r()*box[2]+phase*90)%box[2])+box[2])%box[2];p.rect(x,y,len,w);}s.knockout(p,cov);}
/** The tide front between two shores: bayY right of the headland, inletY left, blended across it. */
const front=(x:number,bayY:number,inletY:number,hx:number)=>{const u=clamp((x-hx+150)/300),e=u*u*(3-2*u);return lerp(inletY,bayY,e);};
const OFF=[0,110,225,340,470,640];
const BANDS:[string,number][]=[[T,.15],[T,.32],[B,.45],[B,.6],[B,.75],[K,.2]];
/** The coast: warm sand (paper + red tint + navy speckle), six stepped tide bands, a navy headland cliff, foam lip, wave lines, shell flecks. */
function coast(s:Sheet,seed:number,o:{bayY:number;inletY:number;hx?:number;dusk?:number;phase:number;spread?:number;foam?:number}){
 const{bayY,inletY,hx=-60,dusk=0,phase,spread=1,foam=.8}=o;
 s.field(R,.1,.3);
 dust(s,K,hx+200,-760,1500,60,{seed:seed+1,size:5,cov:.7,spread:1.3});
 const narrow=(x:number)=>{const u=clamp((x-hx+150)/300);return lerp(.62,1,u*u*(3-2*u))*spread;};
 const edge=(k:number)=>(x:number)=>front(x,bayY,inletY,hx)+OFF[k]*narrow(x);
 BANDS.forEach(([ink,cov],k)=>s.tone(ink,bandPath(edge(k),seed+k,16+k*3),cov));
 if(foam>0)s.knockout(ribbon(edgePts(edge(0),seed,-1800,1800,16,60),14,{seed:seed+2,wobble:2,taper:.1,pressure:.5,gaps:[[.18,.22],[.47,.52],[.8,.84]]}),foam);
 waveDashes(s,seed+3,[hx+200,bayY+260,1500,700],phase*2,14);
 waveDashes(s,seed+4,[hx-1200,inletY+200,1000,600],phase,9);
 const head=polyPath(handCut([[hx-300,-1500],[hx-190,-420],[hx,-40],[hx+190,-420],[hx+300,-1500]],seed+20,30,150),true);
 s.fill(T,head,.6);s.fill(K,head,.88);
 confetti(s,[K,B],[hx-1000,-1300,2000,800],10,seed+30,{size:26});
 if(dusk>0)s.field(K,dusk,.5);
}
/** This story's football: a paper sphere with TEAL pentagon panels and a navy rim, one halftone shadow crescent. */
function tideBall(s:Sheet,x:number,y:number,r:number,seed:number,o:{rot?:number;sx?:number;sy?:number;shadow?:string;cov?:number}={}){
 const{rot=0,sx=1,sy=1,shadow=B,cov=1}=o;
 s.save();s.translate(x,y);s.scale(sx,sy);
 const disc=polyPath(blob(0,0,r,r,seed,{amp:.025}),true);s.knockout(disc,.95);
 s.save();s.clip(disc);s.tone(shadow,crescent(0,0,r*1.02,[-.4,-.45]),.45*cov);
 const pent=(cx:number,cy:number,pr:number,a0:number)=>{const pts:Pt[]=[];for(let i=0;i<5;i++){const a=a0+i/5*TAU;pts.push([cx+Math.cos(a)*pr,cy+Math.sin(a)*pr]);}return polyPath(pts,true);};
 s.fill(T,pent(0,0,r*.33,rot),cov);for(let i=0;i<5;i++){const a=rot+Math.PI/5+i/5*TAU,d=r*.86;s.fill(T,pent(Math.cos(a)*d,Math.sin(a)*d,r*.3,a+Math.PI),cov);}
 const seams=new Path2D();for(let i=0;i<5;i++){const a=rot+i/5*TAU,a2=rot+Math.PI/5+i/5*TAU;seams.moveTo(Math.cos(a)*r*.33,Math.sin(a)*r*.33);seams.lineTo(Math.cos(a2)*r*.62,Math.sin(a2)*r*.62);}s.stroke(T,seams,Math.max(2,r*.05),cov);
 s.restore();
 s.fill(K,ribbon(blob(0,0,r,r,seed+1,{amp:.02,n:48}),Math.max(3,r*.075),{seed:seed+2,close:true,pressure:.6,wobble:r*.02}),cov);
 s.restore();
}
/** A boulder / stone: navy over teal, torn, a flat base, a paper highlight chip. */
function boulder(s:Sheet,x:number,y:number,w:number,h:number,seed:number,o:{rot?:number;cov?:number;flat?:boolean}={}){
 const{rot=0,cov=.88,flat=false}=o;let pts=blob(x,y,w/2,h/2,seed,{amp:.1,rot,n:30});if(flat)pts=pts.map(p=>[p[0],Math.min(p[1],y+h*.42)] as Pt);
 const path=polyPath(handCut(pts,seed+1,10,60),true);
 s.fill(T,path,.62);s.fill(K,path,cov);s.knockout(polyPath(blob(x-w*.22,y-h*.24,w*.08,h*.05,seed+3,{amp:.2}),true),.5);
}
/** Foam bubble: a paper blob with a rim in `ink` and a tail — the question. */
function foamBubble(s:Sheet,x:number,y:number,w:number,h:number,tail:Pt,ink:string,seed:number,wobble=0){
 const pts=blob(x,y,w/2,h/2,seed,{amp:.06+wobble*.04}),path=polyPath(pts,true);
 const tx=x+tail[0],ty=y+tail[1],base=Math.atan2(ty-y,tx-x);
 path.moveTo(x+Math.cos(base-.35)*w*.42,y+Math.sin(base-.35)*h*.42);path.lineTo(tx,ty);path.lineTo(x+Math.cos(base+.35)*w*.42,y+Math.sin(base+.35)*h*.42);path.closePath();
 s.knockout(path,.95);contour(s,ink,pts,9,{close:true,seed:seed+1,pressure:.5,wobble:1.6,gaps:[[.6,.66]]});contour(s,ink,[[x+Math.cos(base-.3)*w*.45,y+Math.sin(base-.3)*h*.45],[tx,ty],[x+Math.cos(base+.3)*w*.45,y+Math.sin(base+.3)*h*.45]],7,{seed:seed+2,taper:.4});
}
const spray=(s:Sheet,x:number,y:number,age:number,seed:number,size=1)=>{if(age<0||age>.6)return;const k=easeOut(clamp(age/.5));dust(s,null,x,y-60*k*size,(40+160*k)*size,10,{seed,size:9*size,cov:.8*(1-clamp(age/.6)),spread:1});};
const spark=(s:Sheet,ink:string,x:number,y:number,age:number,seed:number,r=120)=>{if(age<0)return;const g=easeOutBack(clamp(age/.45))*(1-.5*clamp((age-.9)/.6));if(g<=0)return;sparkBurst(s,ink,x,y,r,{n:8,seed,g,width:r*.1});};
/** A dotted sight line (what a figure is looking at), growing tip-first. */
const sightLine=(s:Sheet,ink:string,a:Pt,b:Pt,progress:number,cov=1)=>{const q=partial(smoothPts([a,b],false,6),progress),p=new Path2D();for(let i=0;i<q.length;i+=7)p.addPath(circlePath(q[i][0],q[i][1],11));s.fill(ink,p,cov);};

// ---------------- chapters ----------------
/** 1. Two players on one beach: the teal teammate runs the bay line with the ball; navy "you" stands still, shoulders down, the inlet creeping to your feet. */
const ch1:Scene={
 draw(s,t){
  const tt=twos(t);
  cam(s,t,[[0,700,-440,.95,0],[1.2,700,-440,.95,0],[2.5,860,-440,.95,0],[3.14,860,-440,.95,0],[4.1,-360,-80,.95,0],[6.2,-360,-80,.95,0],[7.1,160,-200,.82,0],[8.6,160,-200,.82,0,linear],[10,-220,300,1.4,0]]);
  const bayY=key(tt,[[0,60],[.2,92,easeIn],[.9,-290,easeOut],[1.3,-250],[6.2,-250],[6.42,-228,easeIn],[6.65,-312,easeOut],[7.05,-300],[10,-300]]);
  const inletY=key(tt,[[3.14,252],[3.64,228,easeIn],[6.2,228],[7.2,188,easeOut]]);
  coast(s,11,{bayY,inletY,phase:t});
  if(t>=1.6){const p=sm(1.6,2.2,t,easeOut);contour(s,K,partial(edgePts(x=>front(x,-250,-250,-60),51,120,1700,12,70),p),6,{seed:52,pressure:.4,taper:.3,wobble:1});}
  if(t>=7)s.tone(T,ribbon(edgePts(x=>228,53,-1500,-260,14,70),8,{seed:54,pressure:.2,taper:.2}),.6);
  if(t>.2&&t<1.3)spray(s,300,bayY+40,t-.25,57,1.6);
  if(t>=.9){const g=easeOutBack(clamp((t-.9)/.45))*(1-.4*clamp((t-1.6)/.6));if(g>0)sparkBurst(s,B,150,-330,150,{n:9,seed:58,g,width:14});}
  // the teammate: runs right along the bay line (0.3–2.6), kicks the ball ahead at 1.0, turns and runs back across the top on "different speeds"
  const gy=-330,run1=sm(.3,2.6,tt,easeIO),run2=sm(6.2,8.4,tt,easeIO);
  const mx=t<6.2?lerp(440,1300,run1):lerp(1300,380,run2),facing=t<6.2?1:-1,moving=(run1>0&&run1<1)||(run2>0&&run2<1);
  const kickA=t>=.85&&t<1.15,kickB=t>=6.6&&t<6.9;
  const pose:Pose=kickA||kickB?'kick':moving?'run':'stand',cyc=moving?stride(twosIndex(t)):undefined;
  figure(s,mx,gy,520,T,21,pose,{facing,legs:cyc?.legs,arms:cyc?.arms});
  // the ball the teammate plays: kicked ahead (0.85→1.7), collected on the run, kicked again on the way back
  const b1=sm(.95,1.75,tt,easeOut),b2=sm(6.7,7.5,tt,easeOut);
  const bx=t<6.2?lerp(560,1120,b1):lerp(1120,520,b2),by=gy-90-(t<6.2?Math.sin(b1*Math.PI)*60:Math.sin(b2*Math.PI)*60);
  if((b1>0&&b1<1)||(b2>0&&b2<1))speedLines(s,B,bx,by,facing>0?0:Math.PI,{n:5,seed:59,len:170,spread:40,width:8});
  tideBall(s,bx,by,110,22,{rot:bx*.006});
  if(t>=1.6&&t<2.3)spray(s,bx,by+70,t-1.7,60,.9);
  // "you": navy, still, shoulders down; the head drops a little more on "you feel stuck" and holds; the inlet water reaches your feet
  const stuck=sm(3.14,3.6,tt,easeOut);
  const me=figure(s,-430,196,600,K,23,'slump',{facing:1,tilt:.06*stuck,headDrop:[.02+.03*stuck,.08+.05*stuck]});
  tideBall(s,me.feet[1][0]+150,196-100,120,24,{rot:.4});
  if(t>=3.64&&t<4.6)spray(s,-430,228,t-3.64,61,.9);
  if(t>=7.2)s.tone(T,polyPath(blob(-430,230,240,44,62,{amp:.1}),true),.32);
 },
 aperture(){return apertureDisc(-220,420,150,12);},
};

/** 2. Two stones on the shore: one wave rushes in and knocks the small stone over; the tide creeps up the big stone, which never moves. */
const ch2:Scene={
 draw(s,t){
  const tt=twos(t);
  cam(s,t,[[0,-40,-80,1,0],[1,-40,-80,1,0],[3.3,120,-40,1.08,0],[3.9,180,0,1.08,0],[5.6,180,0,1.08,0],[6.46,-200,-60,1.12,0],[9.4,-200,-60,1.12,0,linear],[10.8,-130,330,1.6,0]]);
  s.field(R,.1,.3);dust(s,K,200,-500,1200,40,{seed:71,size:5,cov:.7,spread:1.3});
  // the rocky shore up top; the sand bands; the outer blue band surges on "Some changes arrive"
  // the cliff along the top of the shore
  s.fill(T,polyPath(handCut([[-1800,-1600],[1800,-1600],[1800,-560],[-1800,-620]],95,30,160),true),.6);s.fill(K,polyPath(handCut([[-1800,-1600],[1800,-1600],[1800,-560],[-1800,-620]],95,30,160),true),.88);
  const surge=key(tt,[[3.9,0],[4.1,20,easeIn],[4.55,-380,easeOut],[5,-330],[5.8,-330],[6.2,-120,easeOut]]);
  const edges=[0,100,200,300].map(off=>(x:number)=>140+off+50*Math.sin(x/420+1)+(off===300?surge:off===200?surge*.5:0));
  [[T,.15],[T,.32],[B,.45],[B,.6]].forEach(([ink,cov],k)=>s.tone(ink as string,bandPath(edges[k],72+k,18),cov as number));
  s.tone(B,bandPath(x=>510+40*Math.sin(x/300)+surge*.6,77,22),.75);
  waveDashes(s,78,[-900,560,2400,500],t*(t<6.46?1:.5),14);
  if(surge<-100)s.knockout(ribbon(edgePts(edges[3],75,-300,1200,18,60),16,{seed:79,wobble:2,taper:.2,gaps:[[.3,.34],[.7,.73]]}),.8);
  // the breaking wave: a blue crest bulges up the front and throws a paper foam cap as it rushes in
  if(t>3.9&&t<5.8){const k=sm(3.9,4.55,tt,easeOut)*(1-sm(5,5.8,tt));if(k>0){const cy=edges[3](300)+20-60*k;s.tone(B,polyPath(blob(300,cy,300,110*k+10,80,{amp:.12}),true),.75);s.knockout(polyPath(blob(260,cy-90*k,200*k+20,40*k+6,81,{amp:.2}),true),.85);}}
  // the slow tide on the left: a quiet teal band creeps up the big stone from "Others build quietly" and never hurries
  const creepY=key(tt,[[6.46,560],[10.8,-40,linear]]);
  if(t>=6.46){s.tone(T,bandPath(x=>lerp(creepY,900,clamp((x+40)/220)),84,10),.5);s.knockout(ribbon(edgePts(x=>creepY,85,-1500,-120,8,60),8,{seed:86,wobble:1.5,taper:.2,pressure:.3}),.6);}
  // the big stone (never moves): a wet line prints on it as the water passes
  boulder(s,-300,-60,420,340,83,{flat:true});
  if(creepY<100)contour(s,K,[[-500,creepY+4],[-100,creepY-2]],5,{seed:87,cov:.8});
  // the small stone: sits on the sand; the wave hits it at 4.55 — it tips over with an overshoot, rolls a little, and lands upside down
  const hitK=t>=4.45?anticipate(4.45,4.95,tt,{back:.08,hold:.2,e:easeOut}):0,tip=Math.max(0,hitK)*1.9+(t>=4.95?settle(t,4.95,{amp:.25,freq:3,decay:3}):0);
  const sx=280+(t>=4.45?-60*Math.max(0,hitK):0)+(hitK<0?hitK*40:0),sy=40-90*Math.sin(clamp(Math.max(0,hitK))*Math.PI);
  s.save();s.translate(sx,sy);s.rotate(-tip);boulder(s,0,0,240,190,88,{flat:true});s.restore();
  if(t>=4.45&&t<5.4){spray(s,sx,sy+60,t-4.5,89,1.4);const g=easeOutBack(clamp((t-4.5)/.4))*(1-.5*clamp((t-5.2)/.6));if(g>0)sparkBurst(s,B,sx-40,sy+40,150,{n:7,seed:91,g,width:12});}
  if(t>4.4&&t<5)spray(s,600,edges[3](600)+30,t-4.45,92,1.4);
  confetti(s,[K],[-500,400,1200,300],8,93,{size:22});
 },
 aperture(){return apertureDisc(-130,330,150,12);},
};

/** 3. Side-on at the water's edge under the setting sun: "you" shoots hard; then looks up; the teammate passes and the ball travels the lane. */
const ch3:Scene={
 draw(s,t){
  const tt=twos(t);
  cam(s,t,[[0,-60,80,1.12,0],[.15,-60,80,1.12,0],[1.2,120,80,1.12,0],[2.78,120,80,1.12,0],[3.8,220,-20,1.12,0],[4.48,220,-20,1.12,0],[5.2,200,20,1.12,0],[6.9,200,20,1.12,0],[7.8,200,40,1.12,0],[9.15,200,40,1.12,0,linear],[9.8,-20,150,1.5,0]]);
  s.field(B,t>=3.3?.2:.1,.4);
  const lineY=-150;
  s.tone(R,bandPath(x=>-560+30*Math.sin(x/700),99,20),.12);s.tone(R,bandPath(x=>-360+24*Math.sin(x/500+2),100,16),.2);
  // the sun: a red halftone disc half-set on the horizon (its lower half hidden by the water), a warm reflection band on the wet sand
  s.tone(R,polyPath(blob(60,lineY+30,210,210,120,{amp:.02,n:48}),true),.5);s.fill(R,ribbon(blob(60,lineY+30,210,210,120,{amp:.02,n:48}),16,{close:true,seed:121,pressure:0,wobble:.5}),.7);
  // the sea: one strip of teal + blue between the horizon and the shoreline; below it wet sand (paper + red warmth) carrying the sun's reflection
  const sea=(top:number,bottom:number,seed:number)=>{const p=new Path2D();p.moveTo(-3400,bottom);for(let x=-3400;x<=3400;x+=90)p.lineTo(x,top+18*noise1(x/170+seed,seed));p.lineTo(3400,bottom);p.closePath();return p;};
  s.tone(T,sea(lineY,70,101),.32);s.tone(B,sea(lineY,60,102),.45);
  s.knockout(ribbon(edgePts(x=>lineY,102,-1800,1800,26,60),14,{seed:103,wobble:2,taper:.1,gaps:[[.2,.24],[.6,.63]]}),.85);
  s.knockout(ribbon(edgePts(x=>64,104,-1800,1800,14,60),12,{seed:105,wobble:2,taper:.1,gaps:[[.3,.34],[.7,.74]]}),.8);
  s.tone(R,bandPath(x=>70,123,14),.15);s.tone(B,bandPath(x=>520,106,10),.15);
  s.tone(R,polyPath(blob(60,240,300,200,108,{amp:.03,n:48}),true),.3);
  waveDashes(s,110,[-1200,lineY+20,2400,220],t*1.2,12);
  // the shot: wind-up, leg through, the ball skips three times across the reflection, big and fast
  const go=anticipate(0,.85,tt,{back:.08,hold:.24,e:easeOut});
  const shotEnd:Pt=[470,110];let bx=lerp(-100,shotEnd[0],Math.max(0,go)),by=130-Math.abs(Math.sin(Math.max(0,go)*Math.PI*3))*90*(1-Math.max(0,go)*.6)-30*Math.max(0,go);
  let [sx,sy]=squash(go<0?-.12:0);
  if(t>=.85&&t<6.2){const w=settle(t,.85,{amp:.1,freq:4.5,decay:4,phase:Math.PI/2});sx=1+w;sy=1-w;by=110;}
  for(const [at,x] of [[.28,-20],[.5,200],[.72,400]] as const){spray(s,x,130,t-at,111+x,1.2);if(t>=at){const g=easeOutBack(clamp((t-at)/.35))*(1-.6*clamp((t-at-.5)/.5));if(g>0)sparkBurst(s,B,x,120,110,{n:7,seed:112+x,g,width:11});}}
  if(go>0&&go<1)speedLines(s,B,bx,by,0,{n:6,seed:115,len:220,spread:50,width:8});
  // "you": kicks (0–.85), then stands; on "Looking up sooner" the head lifts and a sight line goes to the teammate; cushions the return pass
  const lookUp=sm(2.78,3.2,tt,easeOut),cushion=t>=6.95?settle(t,6.95,{amp:.08,freq:4,decay:5,phase:Math.PI/2}):0;
  const mePose:Pose=go<0?'walk':go<1?'kick':'stand';
  const me=figure(s,-200,190,560,K,131,mePose,{facing:1,head:[.04*lookUp,-.82-.06*lookUp],tilt:-.05*lookUp+(cushion?.02:0)});
  if(lookUp>0)sightLine(s,K,[me.head[0]+100,me.head[1]-40],[520,-140],sm(2.78,3.4,tt,easeOut));
  // the teammate: walks in from the right (1.4–2.4), stands over the ball, kicks it back on "understanding a pass"
  const walkIn=sm(1.4,2.5,tt,easeIO),tx=lerp(1100,660,walkIn),kick2=t>=6.05&&t<6.35;
  if(t>=1.4){const cyc=walkIn<1?stride(twosIndex(t)):undefined;figure(s,tx,180,460,T,132,kick2?'kick':walkIn<1?'run':'stand',{facing:-1,legs:cyc?.legs,arms:cyc?.arms});}
  // "finding space": a teal lane opens from the teammate's ball back to you
  if(t>=4.48)laneArrow(s,T,[400,120],[-20,150],50,{seed:116,progress:sm(4.48,5.3,t,easeOut)});
  // the pass: ball travels the lane 6.2→6.95, cushioned at your foot
  const pass=sm(6.2,6.95,tt,easeOut);
  if(t>=6.2){bx=lerp(shotEnd[0],me.feet[1][0]+120,pass);by=lerp(110,150,pass)-40*Math.sin(pass*Math.PI);sx=1+cushion;sy=1-cushion;if(pass<1)speedLines(s,B,bx,by,Math.PI,{n:5,seed:117,len:200,spread:40,width:8});}
  if(t>=7.3)ripple(s,B,bx+40,by+40,40,2,{width:6,seed:119,spacing:60,progress:sm(7.3,8.2,t,easeOut)});
  tideBall(s,bx,by,150,22,{rot:go*5+pass*3,sx,sy});
 },
 aperture(){return apertureDisc(-20,150,60,10);},
};

/** 4. The shoulder check: the red opponent closes behind you; you look over your shoulder, the lane opens away, the pass is cushioned; the coach points at what to look for. */
const ch4:Scene={
 draw(s,t){
  const tt=twos(t);
  cam(s,t,[[0,80,-40,1,0],[1,80,-40,1.04,0],[2.6,80,-40,1.04,0],[3.4,200,-40,1.06,.3],[4.2,200,-40,1.06,.3],[5,140,20,1.06,.3],[5.84,140,20,1.06,.3],[6.8,-80,-20,1.06,.3],[8.25,-80,-30,1.06,.3,linear],[8.9,-240,-20,1.6,.3]]);
  s.field(R,.1,.3);dust(s,K,-500,-500,1000,40,{seed:121,size:5,cov:.7});
  s.tone(T,bandPath(x=>-520-.32*x+40*Math.sin(x/400),146,22),.15);confetti(s,[K,T],[-900,-900,1800,600],10,147,{size:24});
  const rise=key(tt,[[0,0],[.15,15,easeIn],[.75,-78,easeOut],[1,-70],[6.74,-70],[6.9,-80,easeIn],[7.3,-70]]);
  [[T,.15,0],[T,.32,90],[B,.45,180],[B,.6,270],[B,.75,380]].forEach(([ink,cov,off],k)=>s.tone(ink as string,bandPath(x=>300+(off as number)-.32*x+(k===0?rise:rise*.5),122+k,14),cov as number));
  s.knockout(ribbon(edgePts(x=>300-.32*x+rise,122,-900,900,14,60),12,{seed:127,wobble:2,taper:.1,gaps:[[.4,.44]]}),.8);
  waveDashes(s,128,[-300,400,1200,500],t*.8,10);
  // the red opponent (pressure) closes in from behind; stops dead when the shoulder is checked, then hangs back
  const closeK=sm(0,2.6,tt,linear),stop=sm(2.6,2.9,tt,easeOut);
  const ox=lerp(760,430,closeK)+20*stop,oy=lerp(-360,-190,closeK),oMoving=closeK<1;
  const oc=oMoving?stride(twosIndex(t)):undefined;
  figure(s,ox,oy,470,R,141,oMoving?'run':'slump',{facing:-1,legs:oc?.legs,arms:oc?.arms,tilt:oMoving?0:-.1});
  if(stop>0&&stop<1)dust(s,R,ox-60,oy-200,60,8,{seed:138,size:8,cov:.7});
  // "you": a counter-turn, then the head turns back over the shoulder as one motion; a navy sight line finds the opponent
  const turn=anticipate(2.6,3.1,tt,{back:.06,hold:.3}),look=clamp(turn);
  const cushion=t>=4.9?settle(t,4.9,{amp:.08,freq:4,decay:5,phase:Math.PI/2}):0;
  const me=figure(s,60,90,520,K,142,'lookBack',{facing:1,head:[lerp(0,-.09,look)+(turn<0?-turn*.3:0),-.82],scaleX:lerp(1,.86,look),tilt:cushion*.04});
  if(look>0)sightLine(s,K,[me.head[0]-40,me.head[1]-60],[ox-40,oy-260],sm(2.7,3.2,tt,easeOut));
  if(t>=2.9)laneArrow(s,T,[110,130],[-160,80],46,{seed:143,progress:sm(2.9,3.6,t,easeOut)});
  // the pass: the ball travels from the bottom-left, is cushioned at your foot, rolls along the lane and settles
  const fly=sm(4.2,4.9,tt,easeOut),roll=sm(4.95,5.6,tt,easeOut);
  let bx=lerp(-430,140,fly),by=lerp(360,150,fly),sx=1,sy=1;
  if(t>=4.9){sx=1-cushion;sy=1+cushion;bx=lerp(140,-20,roll);by=lerp(150,120,roll);}
  if(fly>0&&fly<1)speedLines(s,B,bx,by,Math.atan2(-210,570),{n:5,seed:144,len:170,spread:40,width:8});
  tideBall(s,bx,by,126,23,{rot:fly*4+roll*2,sx,sy});
  if(roll>0&&roll<1)spray(s,bx+30,by+40,t-4.95,145,.8);
  // "Ask your coach what to look for": the coach (taller, teal) walks in at the left and points at the opponent; a dotted line from the hand
  if(t>=5.6){const walkIn=sm(5.6,6.2,tt,easeIO),cx=lerp(-900,-520,walkIn),cc=walkIn<1?stride(twosIndex(t)):undefined;
   const coach=figure(s,cx,110,640,T,148,walkIn<1?'run':'point',{facing:1,legs:cc?.legs,arms:cc?.arms??[[[-.16,-.6],[-.24,-.46],[-.23,-.3]],[[.13,-.6],[.32,-.72],[.52,-.84]]]});
   if(walkIn>=1)sightLine(s,K,[coach.hands[1][0]+30,coach.hands[1][1]-6],[ox-60,oy-330],sm(6.3,6.9,tt,easeOut),.7);
   if(t>=6.9)s.tone(R,polyPath(blob(ox,oy-240,150,260,149,{amp:.08}),true),.15);}
 },
 aperture(){return apertureDisc(-520,-150,80,12);},
};

/** 5. Duotone (teal + navy): the same player twice — "earlier" as a faint teal print losing the ball, "now" solid navy with the ball under the foot. */
const ch5:Scene={
 draw(s,t){
  const tt=twos(t);
  cam(s,t,[[0,-120,20,1.08,0],[1.5,-120,20,1.1,0],[2,-120,20,1.1,0],[3,-120,20,1.1,0],[4.42,-120,20,1.1,0],[5.2,300,-20,1.2,0],[7.12,300,-20,1.2,0],[8.4,-100,40,1.2,0],[9.75,-100,40,1.2,0,linear],[10.4,-200,220,1.7,0]]);
  s.field(T,.15,.4);
  const still=1-sm(4.42,6,t,easeOut);waveDashes(s,151,[-1200,320,2400,700],t*.8*still+6*(1-still)*.8,12);
  // a ledge of paper sand, weed flecks; the water rises to it on "After practice", prints today's line, settles back
  s.knockout(tornRect(-1600,-40,3200,120,153,10),.6);dust(s,K,-300,20,700,30,{seed:154,size:4,cov:.6});
  const waterTop=key(tt,[[0,330],[.2,342,easeIn],[1,150,easeOut],[1.5,160],[2.2,300,easeIO],[7.12,300],[7.3,288,easeIn],[7.7,300]]);
  if(t>=1){const p=sm(1,1.6,t,easeOut);const line=edgePts(x=>160,157,-700,600,6,60);s.knockout(ribbon(partial(line,p),12,{seed:158,pressure:.3,taper:.1}),.9);s.tone(T,ribbon(partial(line,p),12,{seed:158,pressure:.3,taper:.1}),.45);}
  [[.32,0],[.45,110],[.6,230],[.75,380]].forEach(([cov,off],k)=>s.tone(k<3?T:K,bandPath(x=>waterTop+off,159+k,12),k<3?cov:.25));
  s.knockout(ribbon(edgePts(x=>waterTop,159,-1500,1500,12,60),10,{seed:163,wobble:2,taper:.1,gaps:[[.3,.33],[.7,.74]]}),.8);
  // "earlier": a faint teal print of you, the ball running away from the foot with speed lines
  const oldWob=t>=4.42?6*Math.sin(tt*9)*(1-sm(5.2,6,tt)):0;
  const old=figure(s,-560,120,560,T,161,'walk',{facing:1,cov:.32});
  const oldBall:Pt=[old.feet[1][0]+280+oldWob,60];
  speedLines(s,T,oldBall[0],oldBall[1],0,{n:4,seed:162,len:160,spread:40,width:7,cov:.32});
  tideBall(s,oldBall[0],oldBall[1],105,163,{shadow:T,cov:.32,rot:.8});
  // "now": solid navy, the ball trapped under the front foot; on "What felt clearer" a spark ring on that ball
  const today=sm(2.5,3,t,easeOut);
  if(today>0){const now=figure(s,300,120,560,K,165,'stand',{facing:1,cov:Math.max(.32,today),legs:[[[-.05,-.3],[-.07,-.15],[-.1,0]],[[.05,-.3],[.14,-.16],[.24,-.1]]]});
   tideBall(s,now.feet[1][0]+40,60,105,166,{shadow:T,cov:Math.max(.32,today),rot:.2});
   if(t>=4.42)spark(s,T,now.feet[1][0]+40,60,t-4.42,167,190);}
  if(t>=6.1)contour(s,K,partial(smoothPts([[-130,-90],[-30,-120],[90,-90]],false,6),sm(6.1,6.6,t,easeOut)),6,{seed:164,taper:.5});
  // "A small change counts": a paper underline runs beneath both prints, from earlier to now
  if(t>=7.12){const p=sm(7.12,7.9,tt,easeOut),under=edgePts(x=>200,168,-700,400,5,40);s.knockout(ribbon(partial(under,p),14,{seed:169,pressure:.4,taper:.4}),.92);s.tone(T,ribbon(partial(under,p),14,{seed:169,pressure:.4,taper:.4}),.6);if(p>=1)laneArrow(s,T,[380,200],[500,200],30,{seed:171});}
  if(t>0&&t<1.3)spray(s,-200,140,t-.6,170,1);
  confetti(s,[K],[-900,-500,1000,300],8,172,{size:20});
 },
 aperture(){return apertureDisc(-200,380,120,12);},
};

/** 6. The coast at evening: the teammate runs on along the bay; you rest on the rock, stand for one small step, ask, then rest as the water stills. */
const ch6:Scene={
 draw(s,t){
  const tt=twos(t);
  const breath=sm(6.78,8.8,tt,easeOut);
  cam(s,t,[[0,880,-440,.95,0],[.9,900,-440,.95,0],[2.2,-300,-80,.95,0],[3.36,-300,-80,.95,0],[4.2,-260,-60,1.02,0],[5.78,-260,-60,1.02,0],[7.2,-240,-100,1.02,0],[8.6,-240,-100,1.02,0],[10.1,-240,-140,1.04,0,easeOut]]);
  const bayY=key(tt,[[0,-200],[.25,-180,easeIn],[.55,-270,easeOut],[.9,-260]]);
  coast(s,16,{bayY,inletY:40,hx:300,dusk:.2,phase:t*(1-breath*.9),spread:1+.15*breath});
  contour(s,K,edgePts(x=>front(x,-250,-250,300),181,500,1900,10,80),5,{seed:182,cov:.8});
  // the teammate runs the far bay line with the ball and keeps going (their pace, not yours)
  const gy=-340,run=sm(0,3.6,tt,easeIO),mx=lerp(760,1900,run),cyc=run<1?stride(twosIndex(t)):undefined,kickA=t>=.7&&t<1;
  figure(s,mx,gy,440,T,191,kickA?'kick':run<1?'run':'stand',{facing:1,legs:cyc?.legs,arms:cyc?.arms});
  const kb=sm(.8,1.6,tt,easeOut),tbx=lerp(900,2000,Math.max(kb,run*.95)),tby=gy-80-Math.sin(kb*Math.PI)*60;
  if(kb>0&&kb<1)speedLines(s,B,tbx,tby,0,{n:5,seed:192,len:170,spread:40,width:8});
  tideBall(s,tbx,tby,95,193,{rot:tbx*.006});
  // you: resting on the rock with one knee up; on "your next useful step" you stand and take one step with the ball; then "questions" and "rest"
  boulder(s,-380,-20,400,210,194,{rot:.1,flat:true});
  const up=t>=3.36?anticipate(3.36,3.9,tt,{back:.1,hold:.3,e:easeOut}):0,stepK=sm(3.95,4.5,tt,easeOut),rest=t>=8.18?sm(8.18,8.9,tt,easeIO):0;
  const sway=t>=8.9?settle(t,8.9,{amp:.03,freq:1.2,decay:.8}):0;
  let me;
  if(up<=0||rest>=1){const drop=rest>=1?-.02*sway:0;me=figure(s,-380,-122,540,K,195,rest>=1?'sitBack':'sitKnee',{facing:1,tilt:up<0?-up*.4:0,headDrop:[0,drop]});}
  else if(rest>0){const gx=lerp(-180,-380,rest),gyy=lerp(30,-122,rest);me=figure(s,gx,gyy,540,K,195,rest<.5?'walk':'sit',{facing:-1,tilt:-.1*rest});}
  else{const gx=lerp(-380,-180,Math.min(1,up))+60*stepK,gyy=lerp(-122,30,Math.min(1,up));const tap=t>=5.78&&t<6.1;me=figure(s,gx,gyy,540,K,195,tap?'kick':stepK>0&&stepK<1?'walk':'stand',{facing:1});}
  const ballX=key(tt,[[0,-140],[3.95,-140],[4.5,-30,easeOut],[5.78,-30],[6.1,90,easeOut],[8.18,90],[8.9,-140,easeIO]]),ballY=key(tt,[[0,-30],[3.95,-30],[4.5,-40,easeOut],[8.18,-40],[8.9,-30,easeIO]]);
  if(t>=4.2&&t<4.7)spray(s,-90,30,t-4.2,196,.6);
  if(t>=6.78)ripple(s,T,ballX,ballY+40,50,2,{width:8,seed:199,spacing:70,progress:sm(6.78,8,t,easeOut)});
  tideBall(s,ballX,ballY,105,197,{rot:ballX*.01});
  if(t>=3.5)laneArrow(s,T,[-260,60],[-120,60],40,{seed:198,progress:sm(3.5,4,t,easeOut),cov:.8});
  // questions: a foam bubble lifts from your head with three paper dots; the answer drifts back from the bay and the two touch
  const q=sm(6.28,6.9,tt,easeOut);if(q>0&&me){const w=6*Math.sin(tt*7)*(1-clamp((t-7.5)/1.2));const bxq=me.head[0]+120+w,byq=me.head[1]-190*q;foamBubble(s,bxq,byq,280*Math.min(1,q*1.5),160*Math.min(1,q*1.5),[-80,110],K,200,1-q);
   if(q>=1){const d=new Path2D();for(let i=-1;i<=1;i++)d.addPath(circlePath(bxq+i*50,byq,14));s.fill(K,d,.9);}}
  const back=sm(8.18,9.1,tt,easeIO);if(back>0){const bx=lerp(300,-20,back),by=lerp(-180,-120,back);foamBubble(s,bx,by,200,120,[-70,60],B,201,1-back);if(back>=1){const ok=new Path2D();ok.addPath(ribbon([[bx-40,by],[bx-10,by+30],[bx+50,by-30]],10,{seed:202,taper:.4}));s.fill(T,ok,.9);}}
 },
 still:5.2,
};

export const story:RisoStory={
 id:'different-tides',format:'9v9',title:'Different Tides',theme:'Growing at your own pace',ageNote:'A direct mental-skills explainer for developing players; playing format does not define age.',
 spec:{paper:'#f0ece2',inks:{teal:'#00838a',blue:'#0078bf',red:'#ff665e',navy:'#22366b'},order:['teal','blue','red','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:[
  {label:'YOUR OWN PACE',narration:'Have you ever watched a teammate improve and wondered why you feel stuck? Learning football can move at different speeds for different people.',seconds:10,audio:CH+'1.m4a',cues:[{at:0,words:'Have you ever'},{at:3.14,words:'you feel stuck'},{at:6.2,words:'different speeds'}]},
  {label:'DIFFERENT TIDES',narration:'Think of water finding its way along different shores. Some changes arrive quickly. Others build quietly, before you can see them.',seconds:10.8,audio:CH+'2.m4a',cues:[{at:0,words:'Think of water'},{at:3.9,words:'Some changes arrive'},{at:6.46,words:'Others build quietly'}]},
  {label:'LOOK CLOSER',headline:'Progress too',narration:'A stronger shot is easy to notice. Looking up sooner, finding space, or understanding a pass can be progress too.',seconds:9.8,audio:CH+'3.m4a',cues:[{at:0,words:'A stronger shot'},{at:2.78,words:'Looking up sooner'},{at:6.9,words:'progress too'}]},
  {label:'ONE SMALL TARGET',headline:'One thing',narration:'What is one thing you can practise today? Try checking your shoulder before receiving. Ask your coach what to look for.',seconds:8.9,audio:CH+'4.m4a',cues:[{at:0,words:'What is one thing'},{at:2.6,words:'checking your shoulder'},{at:5.84,words:'what to look for'}]},
  {label:'NOTICE YOUR CHANGE',headline:'Small change',narration:'After practice, compare that action with your own earlier attempts. What felt clearer? What still needs help? A small change counts.',seconds:10.4,audio:CH+'5.m4a',cues:[{at:0,words:'After practice'},{at:4.42,words:'What felt clearer'},{at:7.12,words:'A small change counts'}]},
  {label:'KEEP YOUR RHYTHM',narration:'You can learn from teammates without matching their pace. Choose your next useful step. Leave room for practice, questions, and rest.',seconds:10.1,audio:CH+'6.m4a',cues:[{at:0,words:'You can learn'},{at:3.36,words:'your next useful step'},{at:5.78,words:'practice, questions, and rest'}]},
 ],
 draw(f){playChapters(story,f,[ch1,ch2,ch3,ch4,ch5,ch6]);},
 /** Touch: a wet tide mark — a big teal crescent (220 u) with a torn upper edge flashes a foam lip, darkens to navy-over-teal, then dries back into the sand. No ring, no tick (cross-story). */
 touch(s,x,y,age,seed){
  const a=age<=0?.2:age,wet=a<.35?1:1-clamp((a-.35)/.45);
  const crescentP=polyPath(handCut(blob(x,y+24,110,48,seed,{amp:.12,n:24}),seed+1,8,36),true);
  if(wet>0)s.tone(T,crescentP,.8*wet);
  if(a>.08&&a<.6)s.tone(K,crescentP,.3*(1-clamp((a-.35)/.25)));
  if(a<.2)s.knockout(ribbon([[x-104,y-6],[x-30,y-20],[x+40,y-14],[x+106,y]],14,{seed:seed+2,wobble:2.5,taper:.3}),.85);
  if(a<.5)dust(s,null,x,y-30,90,8,{seed:seed+3,size:8,cov:.7*(1-a/.5)});
 },
};
