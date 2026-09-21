/** Grit — riso, TRACK mode (one narration file, media time is the clock). Lead material: a tree that grows in two directions —
 * a seed, roots (navy threads with paper growing-tips) squeezed by stacked underground strata and stones, a shoot that breaks the
 * crust and reaches the sun's stepped light, leaves (blue × yellow = green), fruit (red with orange highlights), mica flecks in the
 * dark, and in the two "work in the dark" chapters a player practising alone against the strata wall with a worn football (one yellow
 * panel). People are ABSTRACT riso figures (bible §1c.4) — paper cut-outs in the dark, navy in daylight. Inks: yellow → blue → red → navy.
 * Yellow = light; blue = strata (with navy) and the shoot's stem; red = resistance (stones, walls, dirt); navy = roots, seed, trunk, crust.
 * Timing: the 22 caption chapters carry the shipped caption text on media time; the nine VISUAL chapters (`visualChapters`, ENGINE §10)
 * run scenes, passages, headlines and registration through `trackChapters`. Scenes read only their local time t. */
import type {Sheet} from '../sheet';
import {type RisoStory,type Scene,type Chapter,playChapters,trackChapters} from '../story';
import {apertureDisc} from '../passage';
import {twos,twosIndex,sm,easeOut,easeIO,easeIn,easeOutBack,linear,key,anticipate,settle,spring,squash,clamp,lerp,rng,noise1,blob,polyPath,circlePath,ribbon,partial,smoothPts,rotPts,arc,type Pt,type Key} from '../motion';
import {contour,dust,laneArrow,sparkBurst,confetti,handCut,footballPanels,tornRect,ring} from '../shapes';


const Y='yellow',B='blue',R='red',K='navy';
const DURATION=64.731375;
/** Visual chapter starts (media seconds, each a sentence onset in recording-alignment.json). */
const VS=[0,6.3,14.26,21.92,32.8,39.08,43.9,51.82,60.34];
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


// ---------------- the world: strata that give way to sky ----------------
const bandPath=(edge:(x:number)=>number,seed:number,amp=22,x0=-3400,x1=3400,step=90)=>{const p=new Path2D();p.moveTo(x0,4400);for(let x=x0;x<=x1;x+=step)p.lineTo(x,edge(x)+amp*(.7*noise1(x/160+seed*3,seed)+.3*noise1(x/40+5,seed+9)));p.lineTo(x1,4400);p.closePath();return p;};
/** Stacked strata: bands stepping deeper (blue + navy overprint = deep indigo), torn upper edges, mica flecks thinning with depth.
 * close 0..1 darkens every band a step; part = [x,y,w] opens a band edge around a root. */
function strata(s:Sheet,seed:number,groundY:number,o:{count?:number;spacing?:number;close?:number;mica?:number;blue?:boolean;offset?:number;tilt?:number}={}){
 const{count=4,spacing=260,close=0,mica=1,blue=true,offset=0,tilt=0}=o;
 const navy=[.55,.7,.8,.85,.88,.9],blues=[.3,.45,.55,.6,.6,.6];
 for(let k=0;k<count;k++){const path=bandPath(x=>groundY+offset+k*spacing+tilt*x,seed+k,22+k*4);if(blue)s.tone(B,path,Math.min(.9,blues[k]+close*.15));s.tone(K,path,Math.min(.92,navy[k]+close*.12));}
 if(mica>0){const r=rng(seed+40),p=new Path2D();for(let i=0;i<110;i++){const x=-1700+r()*3400,y=groundY+offset+r()*1900,d=1-(y-groundY-offset)/1900;if(r()>d*mica*.9+.15)continue;const rad=2+r()*3.5;p.moveTo(x+rad,y);p.arc(x,y,rad,0,Math.PI*2);}s.knockout(p,.95);}
}
/** The crust: a torn navy edge with paper chips; lifted chips tumble on the break-through. */
function crust(s:Sheet,groundY:number,seed:number,o:{crack?:number;cx?:number;dent?:number}={}){
 const{crack=0,cx=0,dent=0}=o,pts:Pt[]=[];for(let x=-1800;x<=1800;x+=60)pts.push([x,groundY+18*noise1(x/140,seed)+dent*10*Math.exp(-(((x-cx)/120)**2))]);
 contour(s,K,pts,26,{seed,pressure:.4,taper:0,wobble:3,gaps:crack>0?[[.47,.53]]:[],step:30});
 const r=rng(seed+3),p=new Path2D();for(let i=0;i<28;i++){const x=-1700+r()*3400,y=groundY-14+r()*30,sz=5+r()*8;p.rect(x,y,sz,sz*.6);}s.knockout(p,.8);
 if(crack>0)for(let i=0;i<3;i++){const u=easeOut(clamp(crack)),a=[-1,0,1][i],px=cx+a*(60+60*u),py=groundY-30-160*u*(1-u)*4*(.6+i*.2)+(crack>=1?0:0),rot=a*u*1.4;s.fill(K,polyPath(rotPts(handCut([[-34,-10],[30,-14],[36,8],[-28,12]],seed+10+i,5,40),rot).map(q=>[q[0]+px,q[1]+py] as Pt),true),.95);}
}
/** The sky: three stepped yellow dot bands rising toward the sun and the sun's own stepped rings. */
function skyRamp(s:Sheet,groundY:number,sunX:number,sunY:number,o:{levels?:number[];sun?:number;glow?:number;seed?:number}={}){
 const{levels=[.1,.2,.35],sun=0,glow=1,seed=1}=o;
 levels.forEach((lv,k)=>{const p=new Path2D();p.moveTo(-3400,-4400);for(let x=-3400;x<=3400;x+=120)p.lineTo(x,groundY-k*280+22*noise1(x/300+k,seed+k));p.lineTo(3400,-4400);p.closePath();s.tone(Y,p,lv);});
 if(sun>0){for(let k=2;k>=1;k--)s.tone(Y,polyPath(blob(sunX,sunY,sun*(1+k*.45*glow),sun*(1+k*.45*glow),seed+k,{amp:.04}),true),[.5,.3][k-1]);s.fill(Y,polyPath(blob(sunX,sunY,sun,sun,seed,{amp:.03}),true));s.knockout(polyPath(blob(sunX-sun*.25,sunY-sun*.25,sun*.28,sun*.22,seed+7,{amp:.1}),true),.8);}
}
/** A stone: red torn mass; dirt adds a blue speckle overprint (brown). scrape marks a paper scratch. */
function stone(s:Sheet,x:number,y:number,w:number,h:number,seed:number,o:{dirt?:number;scrape?:number;dx?:number}={}){
 const{dirt=0,scrape=0,dx=0}=o,pts=handCut(blob(x+dx,y,w/2,h/2,seed,{amp:.12,n:22}),seed+1,8,50);
 s.knockout(polyPath(pts,true),.95);s.fill(R,polyPath(pts,true),.7);
 if(dirt>0)dust(s,B,x+dx,y,Math.max(w,h)*.5,Math.round(30*dirt),{seed:seed+2,size:6,cov:.6,spread:1.1});
 if(scrape>0)s.knockout(ribbon([[x+dx-w*.3,y-h*.1],[x+dx-w*.1,y+h*.15*scrape]],6,{seed:seed+3,taper:.5}),.8);
}
/** A root: navy thread with a paper growing-tip; clogs bulge on it; specks are yellow glints along it. */
function root(s:Sheet,pts:Pt[],width:number,seed:number,o:{progress?:number;tip?:boolean;clogs?:number;specks?:number;glow?:number;nodule?:boolean;halo?:number}={}){
 const{progress=1,tip=true,clogs=0,specks=0,glow=0,nodule=false,halo=.55}=o,line=progress>=1?pts:partial(smoothPts(pts,false,6),progress);if(line.length<2)return;
 if(glow>0)s.tone(Y,ribbon(line,width*2.6,{seed:seed+4,pressure:.2,taper:.3,wobble:2}),glow);
 if(halo>0)s.knockout(ribbon(line,width*1.7,{seed:seed+9,pressure:.4,taper:.5,wobble:1.6}),halo);
 s.fill(K,ribbon(line,width,{seed,pressure:.5,taper:.55,wobble:1.6}),.95);
 const e=line[line.length-1];
 if(tip)s.knockout(polyPath(blob(e[0],e[1],width*.7,width*.5,seed+1,{amp:.1}),true),.9);
 if(nodule)s.fill(K,polyPath(blob(e[0],e[1],width*.9,width*.9,seed+2,{amp:.1}),true),.95);
 if(clogs>0){const r=rng(seed+5),q=smoothPts(line,false,20);for(let i=0;i<clogs;i++){const p=q[Math.floor(r()*(q.length-1))];s.fill(K,polyPath(blob(p[0],p[1],width*.9,width*.7,seed+6+i,{amp:.15}),true),.95);}}
 if(specks>0){const r=rng(seed+8),q=smoothPts(line,false,14),p=new Path2D();for(let i=0;i<specks;i++){const c=q[Math.floor(r()*(q.length-1))];p.addPath(circlePath(c[0]+(r()-.5)*width,c[1]+(r()-.5)*width,4+r()*3));}s.fill(Y,p,.9);}
}
/** A leaf: green overprint (blue + yellow on one path) with a paper vein. open 0..1 unfolds it from the base. */
function leaf(s:Sheet,x:number,y:number,size:number,angle:number,seed:number,open=1){
 const k=Math.max(.05,open),pts=rotPts(blob(size*.5*k,0,size*.5*k,size*.24*k,seed,{amp:.08,n:20}),angle).map(p=>[p[0]+x,p[1]+y] as Pt),path=polyPath(pts,true);
 s.fill(B,path,.9);s.fill(Y,path,.9);
 s.knockout(ribbon([[x,y],[x+Math.cos(angle)*size*.8*k,y+Math.sin(angle)*size*.8*k]],Math.max(1.5,size*.05),{seed:seed+1,taper:.8,wobble:.5}),.6);
}
/** The green shoot: blue and yellow ribbons on one path. */
function shoot(s:Sheet,pts:Pt[],width:number,seed:number,progress=1){const line=progress>=1?pts:partial(smoothPts(pts,false,6),progress);if(line.length<2)return;const path=ribbon(line,width,{seed,pressure:.4,taper:.4,wobble:1.4});s.fill(B,path,.9);s.fill(Y,path,.9);}
/** The seed: a navy teardrop with a paper highlight. */
function seedShape(s:Sheet,x:number,y:number,size:number,seed:number,o:{sx?:number;sy?:number;highlight?:number;rot?:number}={}){
 const{sx=1,sy=1,highlight=.9,rot=0}=o,pts:Pt[]=[[0,-size*.55],[size*.3,-size*.2],[size*.36,size*.25],[0,size*.5],[-size*.36,size*.25],[-size*.3,-size*.2]];
 const q=rotPts(pts.map(p=>[p[0]*sx,p[1]*sy] as Pt),rot).map(p=>[p[0]+x,p[1]+y] as Pt);
 s.fill(K,polyPath(smoothPts(q,true,6,1.2),true),.95);s.knockout(polyPath(blob(x-size*.12*sx,y-size*.18*sy,size*.1,size*.14,seed,{amp:.1}),true),highlight);
}
/** This story's football: a worn practice ball — paper sphere, navy panels, ONE yellow panel, scuff marks. */
function gritBall(s:Sheet,x:number,y:number,r:number,seed:number,o:{rot?:number;shadow?:string;dim?:number;sx?:number;sy?:number}={}){const{rot=0,shadow=Y,dim=0,sx=1,sy=1}=o;s.save();s.translate(x,y);s.scale(sx,sy);footballPanels(s,0,0,r,{rot,key:K,shadow,seed});
 const a=rot+Math.PI/5,d=r*.86,pts:Pt[]=[];for(let i=0;i<5;i++){const b=a+Math.PI+i/5*Math.PI*2;pts.push([Math.cos(a)*d+Math.cos(b)*r*.3,Math.sin(a)*d+Math.sin(b)*r*.3]);}
 s.save();s.clip(circlePath(0,0,r*.98));s.fill(Y,polyPath(pts,true),.9);const rr=rng(seed+4),sc=new Path2D();for(let i=0;i<5;i++){const ang=rr()*Math.PI*2,dd=rr()*r*.7,len=r*(.12+rr()*.2);sc.moveTo(Math.cos(ang)*dd,Math.sin(ang)*dd);sc.lineTo(Math.cos(ang)*dd+len,Math.sin(ang)*dd+len*.3);}s.stroke(K,sc,Math.max(2,r*.03),.6);s.restore();
 if(dim>0)s.tone(K,circlePath(0,0,r),dim);s.restore();}
/** Fruit: a red disc with an orange highlight (yellow over red) and a navy stem. */
function fruit(s:Sheet,x:number,y:number,r:number,seed:number,o:{highlight?:number;pop?:number;swing?:number}={}){
 const{highlight=0,pop=1,swing=0}=o,rr=r*pop;if(rr<=0)return;const fx=x+swing*r*.3;
 const body=polyPath(blob(fx,y,rr,rr,seed,{amp:.05}),true);s.knockout(body,.95);s.fill(R,body,.9);s.tone(Y,body,.3);
 if(highlight>0)s.tone(Y,polyPath(blob(fx-rr*.3,y-rr*.3,rr*.45*highlight,rr*.34*highlight,seed+1,{amp:.1}),true),.7);
 s.knockout(polyPath(blob(fx-rr*.36,y-rr*.4,rr*.2,rr*.12,seed+3,{amp:.15,rot:-.6}),true),.85);
 contour(s,K,[[fx-4,y-rr-rr*.7],[fx+2,y-rr+4]],Math.max(4,rr*.12),{seed:seed+2,taper:.3});
 leaf(s,fx-2,y-rr-rr*.45,rr*.9,-.4,seed+4,1);
}
/** The whole tree as one print: green crown lobes, navy trunk, mirrored roots with nodules. */
function treePrint(s:Sheet,x:number,y:number,scale:number,seed:number,o:{fruit?:number;fruitPop?:(i:number)=>number;rootWeight?:number;crownFlip?:number;extend?:number;highlight?:number}={}){
 const{fruit:fruitN=0,fruitPop,rootWeight=1,crownFlip=0,extend=0,highlight=0}=o;
 s.save();s.translate(x,y);s.scale(scale);
 const trunk=polyPath(handCut([[-40,60],[40,60],[30,-260],[-30,-260]],seed,6,60),true);s.fill(K,trunk,.95);
 const lobes:[number,number,number,number][]=[[0,-400,230,150],[-200,-300,180,120],[200,-310,180,120],[-80,-520,150,100],[100,-530,140,100]];
 lobes.forEach(([lx,ly,rx,ry],i)=>{const path=polyPath(blob(lx*(1-crownFlip*.2),ly,rx,ry,seed+i+1,{amp:.1}),true);s.fill(B,path,.85);s.fill(Y,path,.85);if(highlight>0)s.knockout(polyPath(blob(lx-rx*.3,ly-ry*.3,rx*.25*highlight,ry*.2*highlight,seed+i+20,{amp:.1}),true),.8);});
 const rootsPts:Pt[][]=[[[0,40],[-60,180],[-200,270],[-330,320]],[[0,40],[-30,200],[-90,330]],[[0,40],[10,220],[20,340]],[[0,40],[60,190],[180,290],[300,330]],[[0,40],[130,140],[290,190]]];
 rootsPts.forEach((pts,i)=>{const q=extend>0&&i===2?[...pts,[26,340+60*extend] as Pt]:pts;root(s,q,18*rootWeight,seed+30+i,{tip:false,nodule:true});});
 const slots:Pt[]=[[-160,-330],[40,-440],[190,-280],[-40,-560],[130,-500]];
 for(let i=0;i<fruitN;i++){const pop=fruitPop?fruitPop(i):1;fruit(s,slots[i][0],slots[i][1],44,seed+50+i,{pop,highlight,swing:0});}
 if(extend>0)shoot(s,[[210,-330],[260,-360],[300,-400+0*extend]],10,seed+60,extend);
 s.restore();
}
const grains=(s:Sheet,x:number,y:number,age:number,seed:number,n=8,size=1)=>{if(age<0||age>.8)return;const k=easeOut(clamp(age/.6));dust(s,K,x,y+60*k*k*size,(20+90*k)*size,n,{seed,size:5*size,cov:.9*(1-clamp(age/.8)),spread:1});};
const mica=(s:Sheet,x:number,y:number,r:number,n:number,seed:number,cov=.9)=>{const rr=rng(seed),p=new Path2D();for(let i=0;i<n;i++){const a=rr()*Math.PI*2,d=rr()*r;p.addPath(circlePath(x+Math.cos(a)*d,y+Math.sin(a)*d,2+rr()*3));}s.knockout(p,cov);};

// ---------------- visual chapters (local t = media time − VS[i]) ----------------
/** 1. The seed lands on the crust and sends one thread down and one up; each lengthens as the camera tilts with it. */
const ch1:Scene={
 draw(s,t){
  const tt=twos(t);
  cam(s,t,[[0,0,-140,1.45,0],[.5,0,40,1.65,0],[3.68,0,40,1.65,0],[4.5,0,150,1.7,0],[4.66,0,150,1.7,0],[5.6,0,-40,1.78,0],[5.65,0,-40,1.78,0,linear],[6.3,30,-300,2.5,0]]);
  const landed=t>=.4,dent=landed?8:0;
  skyRamp(s,0,700,-900,{levels:[.1,t>=4.66?.2:.1,.35],sun:0,seed:11});
  if(t>=4.66)s.tone(Y,polyPath(blob(30,-250,260,200,12,{amp:.1}),true),.2);
  strata(s,13,0,{count:4,spacing:280});crust(s,0,14,{dent,cx:0});
  stone(s,-220,260,140,100,15,{});
  // the root hair and the shoot: ease-in growth from the seed, tips leading; each forks; then each lengthens with the camera
  const down=sm(.52,1.32,tt,easeIn),down2=sm(3.68,4.58,tt,easeIn),up=sm(.52,1.32,tt,easeIn),up2=sm(4.66,5.6,tt,easeIn);
  const rootPts:Pt[]=[[0,110],[-10,180],[6,230],[-14,300],[10,380],[-6,440]];
  root(s,rootPts,14,16,{progress:down*.42+down2*.58,tip:true});
  if(t>=1.32)root(s,[[-6,200],[-70,250],[-120,300]],9,17,{progress:sm(1.32,1.72,tt,easeOut)});
  if(t>=3.68)root(s,[[-2,330],[60,380],[90,430]],9,18,{progress:sm(3.9,4.4,tt,easeOut)});
  const shootPts:Pt[]=[[0,10],[8,-60],[-6,-120],[10,-200],[-4,-280],[8,-340]];
  shoot(s,shootPts,14,19,up*.45+up2*.55);
  if(t>=1.9)shoot(s,[[4,-90],[60,-130],[110,-150]],9,20,sm(1.9,2.3,tt,easeOut));
  if(t>=4.9){leaf(s,-4,-250,120,-2.5,21,easeOutBack(sm(4.9,5.2,tt)));leaf(s,4,-300,120,-.6,22,easeOutBack(sm(5.1,5.4,tt)));}
  // the seed: drops in, lands with a squash, rebounds, settles; grains puff and trickle
  const fall=sm(0,.4,tt,easeIn),bounce=t>=.4?settle(t,.4,{amp:.12,freq:5,decay:6,phase:Math.PI/2}):0;
  const [sx,sy]=squash(landed?-bounce:.08);
  seedShape(s,0,lerp(-700,60,fall),160,23,{sx,sy});
  grains(s,0,90,t-.4,24,8,1.2);
  if(t>=1.32)mica(s,-40,200,80,4,25,.95);if(t>=1.9)mica(s,30,120,60,3,26,.95);
  confetti(s,[K],[-900,-1200,1800,600],6,27,{size:10,cov:.5});
 },
 aperture(){return apertureDisc(50,-300,70,12);},
};

/** 2. The young tree whole; the camera turns a full circle so the roots read as a crown; fruit pop where nodules were. */
const ch2:Scene={
 draw(s,t){
  const tt=twos(t);
  const rot=key(t,[[1.97,0],[2.1,-.09,easeIn],[2.9,Math.PI,easeIO],[5.16,Math.PI],[6.1,Math.PI*2,easeIO]])+(t>=2.9&&t<5.16?settle(t,2.9,{amp:.03,freq:2,decay:3}):0);
  const v=key(t,[[0,0,0,1],[.9,0,0,1.08],[5.94,0,0,1.08],[6.8,0,20,1.3],[7.31,0,20,1.3,linear],[7.96,0,10,1.7]],easeIO,true);
  s.camera(v[0],v[1],v[2],rot);
  skyRamp(s,0,500,-700,{levels:[.12,.22,.35],sun:120,glow:.8,seed:31});
  strata(s,32,0,{count:6,spacing:170,tilt:0});crust(s,0,33,{});
  // the mirror axis flashes at the ground line; the roots redraw thicker with nodules; the trunk base swells into a buttress
  s.knockout(ribbon([[-1800,0],[1800,2]],t<.25?9:4,{seed:34,wobble:1,step:80}),t<.25?.95:.5);
  const thick=key(tt,[[1.36,1],[1.66,1.4,easeOut]]),swell=t>=5.94?easeOutBack(sm(5.94,6.34,tt)):0;
  const fruitN=t>=2.93?5:3,fruitPop=(i:number)=>t<2.93?1:easeOutBack(sm(2.93+i*.15,3.23+i*.15,tt))*(1+.06*settle(t,3.23+i*.15,{amp:1,freq:2.5,decay:3}));
  treePrint(s,0,40,1.25,35,{fruit:fruitN,fruitPop,rootWeight:thick,crownFlip:sm(2.1,2.9,tt)});
  if(swell>0){s.fill(K,polyPath(handCut([[-50-25*swell,80],[50+25*swell,80],[45,20],[-45,20]],36,4,30),true),.95);grains(s,30,50,t-6.2,37,3,.6);}
  if(t>=1.36)for(const [x,y] of [[-330,360],[-90,370],[20,380],[300,370],[290,230]] as const)mica(s,x,y,26,3,38+x,.95);
  grains(s,0,20,t-.25,39,6,.8);
 },
 aperture(){return apertureDisc(0,-60,34,10);},
};

/** 3. One trunk, two pulls: a navy arrow down, a yellow arrow to the sun; the roots turn from the light and drop toward gravity. */
const ch3:Scene={
 draw(s,t){
  const tt=twos(t);
  cam(s,t,[[0,0,0,1,0],[.74,0,200,1.1,0],[1.72,0,200,1.1,0],[2.64,200,-200,1.1,0],[3.52,200,-200,1.1,0],[4.54,0,100,1.1,-.17],[5.48,0,100,1.1,-.17],[6.34,-60,280,1.25,-.17],[7.01,-60,300,1.25,-.17,linear],[7.66,-60,380,1.7,-.17]]);
  const glow=key(tt,[[3.52,.8],[4.3,1.15,easeOut]]);
  skyRamp(s,0,380,-360,{levels:[.12,.22,.35],sun:220,glow,seed:41});
  if(t>=1.72)s.tone(Y,ring(380,-360,320,420),.15);
  strata(s,42,0,{count:4,spacing:260});crust(s,0,43,{});
  const drop=sm(5.48,6.1,tt,easeIn),rootW=lerp(14,22,drop),sway=key(tt,[[3.52,0],[4.3,20,easeOut]]);
  stone(s,-200,260,300,220,44,{});
  // the trunk (leans a touch toward the shadow side as the roots drop), two leaves that turn to face the sun
  const leanK=drop*.035;
  s.save();s.rotate(-leanK);
  s.fill(K,polyPath(handCut([[-70-20*drop,420],[70+20*drop,420],[62,-420],[-62,-420]],45,8,80),true),.95);
  s.restore();
  const face=sm(1.72,2.12,tt,easeOutBack);
  leaf(s,-60,-300,150,-2.6+face*.9,46);leaf(s,60,-340,150,-.5-face*.4,47);
  // roots: one straight down, one left, one right; tips bend toward gravity, then turn away from the sun side; a branch deflects round the stone
  const bend=sm(0,.5,tt,easeOut)*(1-.15*Math.sin(sm(0,.2,tt)*Math.PI)),away=sm(3.52,4.5,tt,easeOut),fall=120*drop;
  root(s,[[0,380],[-6,480],[8,560+40*bend],[-4,640+40*bend+fall]],rootW,48,{tip:true});
  root(s,[[-30,400],[-120,470-away*30],[-200,520-away*40],[-240,560-away*40]],rootW*.8,49,{tip:true});
  root(s,[[30,400],[130,470],[220,540+away*40],[300,600+away*80+fall*.5]],rootW*.8,50,{tip:true});
  if(t>=6.79)root(s,[[-90,470],[-140,400],[-190,330],[-240,360]],10,51,{progress:sm(6.79,7.29,tt,easeOut),tip:true});
  if(t>=5.7)grains(s,-4,680,t-5.7,52,8,1);if(t>=.9)grains(s,0,520,t-.9,53,5,.6);
  // the two pulls: the navy arrow down (doubles in width on "toward gravity"), the yellow arrow to the sun
  {const w=lerp(40,80,drop),p=sm(0,.5,tt,easeOut),y1=560+(200+fall)*p;s.knockout(ribbon([[60,560],[60,y1-w*1.2]],w,{seed:54,pressure:.3,taper:.2}),.9);s.knockout(polyPath([[60,y1+w*.6],[60-w*1.2,y1-w*1.4],[60+w*1.2,y1-w*1.4]],true),.9);}
  if(t>=1.72){laneArrow(s,K,[90,-420],[300,-330],52,{seed:55,progress:sm(1.72,2.22,tt,easeOut)});laneArrow(s,Y,[90,-420],[300,-330],36,{seed:55,progress:sm(1.72,2.22,tt,easeOut)});}
  mica(s,-80,700,120,5,56,.95);
  s.fill(K,polyPath(blob(-60,760,90,50,57,{amp:.15}),true),.95);
 },
 aperture(){return apertureDisc(-60,760,74,12);},
};

/** 4. Fully underground: the light leaves, a stone stops the root and it shoves round, strata squeeze it thin, dirt clogs it, and it fights down in three pulses. */
const ch4:Scene={
 draw(s,t){
  const tt=twos(t);
  const closeK=sm(3.58,4.3,tt,linear),dark=Math.floor(closeK*5)/5;
  cam(s,t,[[0,0,0,1,0],[.9,0,-120,1,0],[1.88,0,-120,1,0],[2.98,0,280,1.1,0],[3.58,0,280,1.1,0],[5.04,0,300,1.14,0],[5.5,-120,80,1.3,0],[5.9,-120,80,1.3,0],[6.3,-120,80,1.4,.05],[6.94,-120,80,1.4,.05],[9.9,-100,440,1.4,.1],[10.23,-100,440,1.4,.1,linear],[10.88,-90,520,1.9,.1]]);
  strata(s,61,-520,{count:6,spacing:260,close:dark,mica:1-dark*.7,offset:0});
  if(closeK<1){s.tone(Y,polyPath([[-1800,-540],[1800,-540],[1800,-516],[-1800,-516]],true),.35*(1-closeK));shoot(s,[[10,-520],[14,-560],[6,-600]],8,62,1);}
  // stones; the walls squeeze on "pressure" (heavy, hard stop) and yield a little on each fight pulse
  const gap=key(tt,[[5.9,900],[6.3,380,easeIn],[7.9,380],[8.1,420,easeOut],[9.74,420],[9.95,460,easeOut]]);
  if(gap<900){const L=polyPath(handCut([[-60-gap/2-900,-150],[-60-gap/2-22,-150],[-60-gap/2+22,750],[-60-gap/2-900,750]],63,34,160),true),Rw=polyPath(handCut([[-60+gap/2+22,-150],[-60+gap/2+900,-150],[-60+gap/2+900,750],[-60+gap/2-22,750]],72,34,160),true);s.knockout(L,.95);s.knockout(Rw,.95);s.fill(R,L,.7);s.fill(R,Rw,.7);}
  const hit=sm(5.04,5.19,tt,easeOut),shove=sm(5.3,5.9,tt,easeOut);
  stone(s,-240,60,300,220,64,{dirt:t>=6.14?1:0,scrape:shove});stone(s,260,140,240,200,65,{dirt:t>=6.14?1:0});stone(s,40,420,260,240,66,{dirt:t>=6.14?1:0});
  // the seed and its root: extends, hits the stone (tip flattens, root buckles), shoves round, thins in the squeeze, clogs, then pulses down past the last stone and splits
  seedShape(s,0,-300,300,67,{highlight:key(tt,[[3.58,.9],[4.3,.5]])});
  const ext=sm(1.88,2.88,tt,easeIn),squeeze=clamp((900-gap)/520),width=lerp(24,12,squeeze);
  const pulses=[6.94,7.9,8.86].map(at=>t>=at?anticipate(at,at+.4,tt,{back:.16,hold:.3,e:easeOut}):0),push=pulses.reduce((a,b)=>a+Math.max(0,b)*60-Math.min(0,b)*10,0);
  const rootPts:Pt[]=[[0,-150],[-10,-40],[8,60],[-70+shove*30,130],[-120+shove*20,180+push*.2],[-100,260+push*.5],[-90,340+push]];
  if(ext<1)root(s,[[0,-150],[-10,-40],[8,60],[-14,110]],24,68,{progress:ext,tip:true});
  else{const q=hit>0&&shove<1?rootPts.map(p=>[p[0],p[1]] as Pt):rootPts;if(hit>0&&shove<1)q[3]=[-70,120+20*hit];root(s,q,width,68,{tip:true,clogs:t>=6.14?4:0});}
  if(hit>0&&shove<.3)s.knockout(polyPath(blob(-80,132,30,10,69,{amp:.1}),true),.9);
  if(t>=9.74){const sp=sm(9.74,10.3,tt,easeOut);root(s,[[-90,340+push],[-150,400+push],[-190,470+push]],width*.7,70,{progress:sp,tip:true});root(s,[[-90,340+push],[-30,400+push],[10,480+push]],width*.7,71,{progress:sp,tip:true});}
  for(const at of [6.94,7.9,8.86]){if(t>=at+.25){const g=easeOutBack(clamp((t-at-.25)/.3))*(1-sm(at+.7,at+1.1,t));if(g>0){s.knockout(polyPath(sparkPts(-90,330+push,80*g,7,at*10),true),.9);grains(s,-90,340+push,t-at-.25,72+at,6,.8);}}}
  if(t>=6.3)grains(s,-300,740,t-6.3,73,8,1.2);if(t>=6.3)grains(s,180,740,t-6.3,74,8,1.2);
  if(t>=9.9)mica(s,-120,460+push,80,5,75,.95);
  if(t>=5.04&&t<5.6)grains(s,-120,120,t-5.04,76,6,.8);
 },
 aperture(){return apertureDisc(-90,340+180,40,10);},
};
const sparkPts=(x:number,y:number,r:number,n:number,seed:number):Pt[]=>{const out:Pt[]=[];for(let i=0;i<n*2;i++){const a=i/(n*2)*Math.PI*2,d=i%2?r:r*.45;out.push([x+Math.cos(a)*d,y+Math.sin(a)*d]);}return out;};

/** 5. Just below the surface: the shoot presses down, breaks the crust, reaches for the sun; the red walls dissolve and the line goes clean. */
const ch5:Scene={
 draw(s,t){
  const tt=twos(t);
  const jolt=t>=1&&t<1.25?(twosIndex(t)%2?10:-10):0;
  const v=key(t,[[0,0,180,1],[.6,0,180,1.2],[1.86,0,180,1.2],[2.9,0,-120,1.2],[4.5,0,-120,1.2],[5.2,0,-220,1.22],[5.63,0,-220,1.22,linear],[6.28,380,-360,1.7]],easeIO,true);
  const open=sm(4.5,5.2,tt,easeOut);
  s.camera(v[0],v[1]+jolt,v[2],-.09*open);
  skyRamp(s,200,380,-360,{levels:[.12,key(tt,[[1.86,.2],[2.6,.35]]),.35],sun:220,glow:1,seed:81});
  strata(s,82,200,{count:3,spacing:260});
  // the red walls from chapter 4 dissolve outward on "less resistance"
  const wallCov=lerp(.7,.1,open),wallX=100*open;
  s.fill(R,polyPath(handCut([[-1800,240],[-560-wallX,240],[-520-wallX,1200],[-1800,1200]],83,30,160),true),wallCov);
  s.fill(R,polyPath(handCut([[560+wallX,240],[1800,240],[1800,1200],[520+wallX,1200]],84,30,160),true),wallCov);
  // the crust cracks: chips lift, tumble and land
  const crack=t>=1?sm(1,1.5,tt,linear):0;
  crust(s,200,85,{crack,cx:0});
  // the shoot: presses down (the hook tightens), straightens and drives up, overshoots, then grows toward the sun in a gentle S; leaves unfold and turn to the light
  const press=sm(0,.2,tt,easeIn)*20,drive=t>=1?anticipate(1,1.3,tt,{back:.05,hold:.15,e:easeOut}):0,reach=sm(1.86,3.06,tt,easeIn),sway=t>=4.98?settle(t,4.98,{amp:18,freq:1.3,decay:1.2}):0;
  const top=220+press-Math.max(0,drive)*135-reach*300,over=t>=1.3?settle(t,1.3,{amp:15,freq:4,decay:5}):0;
  const strain=lerp(1.8,.6,open),w=lerp(80,52,open);
  const pts:Pt[]=[[0,420],[6,320],[-8+sway*.2,240],[0,top+40+over],[drive>0?30:-40,top+(drive>0?-10:20)+over]];
  const line=smoothPts(pts,false,6),path=ribbon(line,w,{seed:86,pressure:.4,taper:.3,wobble:strain*2});s.fill(B,path,.9);s.fill(Y,path,.9);
  if(drive>0){const e=line[line.length-1];leaf(s,e[0]+sway*.4,e[1]+30,120,-2.4+.6*reach,87,easeOutBack(sm(1.3,1.6,tt)));leaf(s,e[0]+sway*.4,e[1]+60,120,-.7-.5*reach,88,easeOutBack(sm(1.5,1.8,tt)));
   if(t>=2.93){leaf(s,e[0],e[1]+150,110,-2.6,89,easeOutBack(sm(2.93,3.2,tt)));leaf(s,e[0],e[1]+180,110,-.5,90,easeOutBack(sm(3.05,3.35,tt)));}}
  if(t>=1&&t<1.8)dust(s,null,0,200,60+160*sm(1,1.6,t),12,{seed:91,size:8,cov:.9*(1-sm(1.2,1.8,t))});
  if(t>=3&&t<3.6)grains(s,20,215,t-3,92,2,.5);
  mica(s,-200,500,140,6,93,.9);mica(s,220,600,140,6,94,.9);
 },
 aperture(){return apertureDisc(380,-360,200,12);},
};

/** 6. The whole tree as one settled print: plates slide into register, fruit print in sequence, the sun lights orange highlights, the roots re-ink to match. */
const ch6:Scene={
 draw(s,t){
  const tt=twos(t);
  cam(s,t,[[0,0,0,1,0],[.62,0,0,1.08,0],[1.04,0,0,1.08,0],[2.32,160,-100,1.08,0],[2.87,160,-100,1.08,0],[3.82,0,220,1.08,0],[4.17,0,220,1.08,0,linear],[4.82,-120,300,1.75,0]]);
  const settleK=Math.min(4,twosIndex(t)),shiftX=[6,-4,2,-1,0][settleK]??0,shiftY=[-5,3,-2,1,0][settleK]??0;
  skyRamp(s,0,400,-540,{levels:[.12,.22,.35],sun:150,glow:1,seed:101});
  s.save();s.translate(shiftX,shiftY);
  strata(s,102,0,{count:4,spacing:220});crust(s,0,103,{});
  // the torn paper edge frames the print (a print pinned up)
  const frame=new Path2D();frame.addPath(polyPath([[-3000,-3000],[3000,-3000],[3000,3000],[-3000,3000]],true));frame.addPath(polyPath(handCut([[-1500,-1500],[1500,-1500],[1500,1500],[-1500,1500]],105,40,180).reverse(),true));
  if(t>=.4)s.tone(K,frame,.25);
  const highlight=sm(2.43,2.83,tt,easeOut),rootWeight=key(tt,[[2.87,1],[3.27,1.35,easeOut]]);
  const fruitN=Math.min(5,Math.max(0,Math.floor((t-1.04)/.12)+1)),fruitPop=(i:number)=>easeOutBack(sm(1.04+i*.12,1.34+i*.12,tt))*(1+.08*settle(t,1.34+i*.12,{amp:1,freq:2.5,decay:3}));
  if(t>=2.87)s.knockout(ribbon([[-1800,0],[1800,3]],5,{seed:106,wobble:1,step:80}),.8);
  treePrint(s,0,40,1.15,107,{fruit:t>=1.04?fruitN:0,fruitPop,rootWeight,highlight,extend:sm(3.82,4.4,tt,easeIn)});
  s.restore();
  if(t>=3.82)grains(s,30,400,t-3.82,108,3,.6);
  if(t>=4)leaf(s,240,-300+60*sm(4,4.8,t),70,.4+.3*Math.sin(tt*5),109);
  s.fill(B,polyPath(blob(-120,300,110,70,110,{amp:.1}),true),.6);s.fill(K,polyPath(blob(-120,300,110,70,110,{amp:.1}),true),.9);
 },
 aperture(){return apertureDisc(-120,300,68,12);},
};

/** 7. Duotone (navy + yellow): an underground room; a player practises alone against the strata wall — kick to the wall, control the return — a mass presses, yellow specks gather on the roots above. */
const WALLX=560;
const ch7:Scene={
 draw(s,t){
  const tt=twos(t);
  cam(s,t,[[0,80,60,1,0],[.7,80,60,1.08,0],[1.78,80,60,1.08,0],[2.4,140,40,1.12,0],[3.1,140,60,1.12,.06],[3.2,140,60,1.12,.06],[4,160,80,1.16,.06],[5.4,160,80,1.16,.06],[6.9,100,40,1.26,.06],[7.27,100,40,1.26,.06,linear],[7.92,0,-220,2,.06]]);
  const dark=key(tt,[[1.44,.8],[1.7,.85]]);
  s.field(K,dark,.55);
  strata(s,121,300,{count:3,spacing:240,blue:false,mica:.4});
  // the strata wall the ball is played against: a navy slab with mica and a paper edge
  s.fill(K,polyPath(handCut([[WALLX,-1200],[1800,-1200],[1800,1200],[WALLX,1200]],133,26,140),true),1);s.knockout(ribbon([[WALLX+4,-1200],[WALLX,1200]],8,{seed:134,wobble:3,step:30}),.5);mica(s,WALLX+300,0,500,10,135,.9);
  // the touches: kick → the ball flies to the wall, squashes, comes back → controlled at the foot; slower under the mass
  const KICKS=[0,2.34,3.64,6.03],RET=[.65,3,4.09,6.75];
  const bk:Key[]=[[0,60]];KICKS.forEach((k,i)=>{bk.push([k,60],[k+.3,WALLX-150,easeOut],[RET[i],WALLX-150],[RET[i]+.35,60,easeOut]);});
  const bx=key(tt,bk),hit=KICKS.map(k=>t>=k+.3?settle(t,k+.3,{amp:.12,freq:5,decay:6,phase:Math.PI/2}):0).reduce((a,b)=>a+b,0),ctl=RET.map(k=>t>=k+.35?settle(t,k+.35,{amp:.06,freq:4,decay:5,phase:Math.PI/2}):0).reduce((a,b)=>a+b,0);
  const specks=RET.filter(k=>k>=5.4&&t>=k+.2).length;
  const heavy=t>=3.2?anticipate(3.2,3.7,tt,{back:.05,hold:.2,e:easeIn}):0,massY=-560+220*Math.max(0,heavy)-10*specks,sag=20*Math.max(0,heavy);
  // roots crossing the top of the frame: sag under the mass, thicken and glow with the specks
  const glow=key(tt,[[7.5,0],[7.9,.3]]);
  root(s,[[-700,-300],[-300,-280+sag],[100,-300+sag],[500,-260]],40+specks*8,122,{tip:false,specks:specks,glow:glow});
  root(s,[[-600,-200],[-200,-220+sag*.6],[200,-200+sag*.6],[600,-240]],32+specks*5,123,{tip:false,specks:Math.max(0,specks-2),glow:glow*.7});
  if(heavy>0){const path=tornRect(-420,-2600,560,2600+massY,125,26);s.fill(K,path,1);s.knockout(ribbon([[-420,massY-4],[140,massY+4]],6,{seed:126,wobble:2.5,step:20}),.6);}
  // the player: a paper cut-out in the dark, alone; winds up and kicks on each kick event, stands and controls on each return
  const kicking=KICKS.some(k=>t>=k&&t<k+.3),windup=KICKS.some(k=>t>=k-.2&&t<k),pose:Pose=kicking?'kick':windup?'walk':'stand';
  figure(s,-140,300,560,Y,127,pose,{facing:1,mode:'paper',paperTone:.15,tilt:ctl*.3});
  gritBall(s,bx,300-150,150,128,{rot:bx*.006,shadow:Y,dim:key(tt,[[1.44,0],[1.7,.2],[7.5,.2],[7.9,0]]),sx:1-hit+ctl,sy:1+hit-ctl});
  KICKS.forEach((k,i)=>{grains(s,WALLX-20,300-150,t-k-.3,129+i*7,4,.6);if(t>=k+.3&&t<k+.7)dust(s,null,WALLX-10,150,60+120*(t-k-.3),6,{seed:140+i,size:7,cov:.9*(1-(t-k-.3)/.4)});});
  if(t>=1.44)mica(s,bx,150,300,6,130,.95*(1-sm(1.44,1.7,tt)));mica(s,-500,300,200,4,132,.9);
 },
 aperture(){return apertureDisc(0,-290,50,12);},
};

/** 8. The crown in daylight: light arrives across the leaves; three figures rise below with arms up (everybody wants the fruit); a fruit drops into one pair of hands, the big fruit falls into the middle one's, flecks blink, more fruit pop. */
const ch8:Scene={
 draw(s,t){
  const tt=twos(t);
  cam(s,t,[[0,0,-120,1,0],[.9,0,-120,1.1,0],[2.04,0,-120,1.1,0],[2.8,80,440,1,0],[4.16,80,440,1,0],[5.1,0,500,1,.04],[6.14,0,500,1,.04],[7,0,300,1,.04],[7.87,0,300,1,.04,linear],[8.52,200,-240,1.8,.04]]);
  const light=sm(0,.6,tt,easeOut);
  skyRamp(s,900,420,-520,{levels:[.2,.35,light>.5?.5:.35],sun:200,glow:1,seed:141});
  // leaf masses crossing the crown, branches, the trunk descending below
  const lobes:[number,number,number,number,number][]=[[-360,-360,260,160,.3],[-80,-140,300,180,-.2],[300,-420,260,150,.1],[420,60,240,150,-.3],[-420,160,220,140,.2],[60,320,280,150,0]];
  lobes.forEach(([x,y,rx,ry,r],i)=>{const path=polyPath(blob(x,y,rx,ry,142+i,{amp:.12,rot:r}),true);s.fill(B,path,.85);s.fill(Y,path,.85);const k=sm(i*.1,i*.1+.3,tt,easeOut);if(k>0)s.knockout(polyPath(blob(x-rx*.3,y-ry*.3,rx*.22*k,ry*.18*k,150+i,{amp:.12}),true),.8);});
  const swayB=t>=6.14?settle(t,6.14,{amp:12,freq:1.5,decay:1.5}):0,dip=t>=4.16&&t<4.4?12:0,spring1=t>=2.44?12*(1-spring(t-2.44,3,.5)):0;
  root(s,[[-700,-200],[-300,-220+swayB],[100,-180+swayB],[500,-240]],30,160,{tip:false});
  root(s,[[-600,120],[-200,60+dip+swayB],[200,80+dip],[600,20]],26,161,{tip:false});
  root(s,[[-300,-520],[-100,-400-spring1],[200,-320-spring1],[500,-380]],24,162,{tip:false});
  s.fill(K,polyPath(handCut([[-230,1200],[-130,1200],[-140,300],[-220,300]],163,6,60),true),.95);
  // fruit hanging; the first drops into the hand; two more pop on "results"
  const drop1=t>=2.04?sm(2.24,2.64,tt,easeIn):0,land1=t>=2.64?settle(t,2.64,{amp:.1,freq:4,decay:5,phase:Math.PI/2}):0;
  const hl=sm(.3,.9,tt,easeOut);
  fruit(s,-260,-200,80,164,{highlight:hl});fruit(s,-40,-300,80,165,{highlight:hl});fruit(s,200,-240,80,166,{highlight:hl});
  {const fx=440,fy=lerp(-80,110,drop1);s.save();s.translate(fx,fy);s.scale(1+land1,1-land1);fruit(s,0,0,80,167,{highlight:hl});s.restore();}
  if(t>=6.88){fruit(s,-160,-420,60,168,{highlight:1,pop:easeOutBack(sm(6.88,7.18,tt))});fruit(s,60,-460,60,169,{highlight:1,pop:easeOutBack(sm(7.03,7.33,tt))});}
  // everybody wants the fruit: three navy figures rise from below with arms up (anticipation, rise, overshoot); the big fruit drops into the middle one's hands
  const fall=sm(4.16,4.86,tt,easeIn),land=t>=4.86?settle(t,4.86,{amp:.12,freq:4,decay:5,phase:Math.PI/2}):0;
  const people:[number,number,number,number][]=[[-440,1000,520,2.04],[140,1040,580,2.24],[560,1000,500,2.44]];
  let midHands:Pt=[140,1040-1.02*580];
  people.forEach(([x,y,size,at],i)=>{if(t<at)return;const k=anticipate(at,at+.6,tt,{back:.08,hold:.3,e:easeOutBack}),yy=y+900*(1-Math.max(0,k))+(k<0?-k*200:0),me=figure(s,x,yy,size,K,172+i,'reach',{facing:i===2?-1:1});if(i===1)midHands=[(me.hands[0][0]+me.hands[1][0])/2,me.hands[1][1]];});
  const fruitX=lerp(40,midHands[0],fall),fruitY=lerp(40,midHands[1]+30,fall)-60*Math.sin(fall*Math.PI);
  s.save();s.translate(fruitX,fruitY);s.scale(1+land,1-land);fruit(s,0,0,120,170,{highlight:hl});s.restore();
  if(t>=4.86)sparkBurst(s,Y,midHands[0],midHands[1],200,{n:9,seed:171,g:easeOutBack(sm(4.86,5.2,t))*(1-.6*sm(5.4,6,t)),width:14});
  // recognition: the crowd's flecks blink to paper along the top edge
  if(t>=6.14)for(let i=0;i<5;i++){const at=6.14+i*.2,k=t>=at?1-.5*sm(at+.5,at+1,t):0;if(k>0)s.knockout(polyPath(blob(-480+i*240,-560,26*k,18*k,180+i,{amp:.2}),true),.95);}
  confetti(s,[B,Y],[-800,-700,1600,1200],10,185,{size:18,cov:.8});
  if(t>=2.54)for(let i=0;i<3;i++){const u=clamp((t-2.54-i*.2)/.9);leaf(s,-100+i*90+30*Math.sin(u*6),-200+u*400,60,.6+u*2,190+i);}
 },
 aperture(){return apertureDisc(200,-240,80,12);},
};

/** 9. The lonely seasons: the dark room again, lighter than ch7 — the player sits against the wall with the ball between the feet, the sun crosses above and leaves fall, then stands and keeps practising alone. */
const ch9:Scene={
 draw(s,t){
  const tt=twos(t);
  cam(s,t,[[0,60,80,1,0],[.66,60,20,1,0],[1.99,60,20,1,0],[2.66,120,0,1.08,0],[3.96,140,20,1.16,0],[4.4,140,20,1.16,0]]);
  s.field(B,.5,.5);s.field(K,.72,.55);
  strata(s,201,-420,{count:4,spacing:260,mica:.4,blue:true});
  // the crust at the very top; the sun crosses it left→right (a season) and its glow lets paper through; leaves fall through the frame
  const cross=sm(1.99,2.99,tt,easeIO),sunX=lerp(-500,500,cross),bright=key(tt,[[0,.15],[1.99,.2],[3,.45,easeOut]]);
  s.knockout(polyPath(blob(sunX,-400,360,170,202,{amp:.1}),true),bright);s.tone(Y,polyPath(blob(sunX,-400,300,140,216,{amp:.1}),true),.3);
  crust(s,-420,203,{});s.fill(Y,polyPath(blob(sunX,-440,70,70,204,{amp:.04}),true),.95);
  if(t>=1.99)for(let i=0;i<3;i++){const u=clamp((t-1.99-i*.15)/.8);leaf(s,-200+i*220+40*Math.sin(u*7+i),-380+u*640,70,.5+u*3+i,205+i,1);}
  // roots crossing with many yellow specks; the speck glow brightens through the chapter so the story ends lighter than it went in
  const glow=key(tt,[[0,.3],[4.4,.6]]);
  root(s,[[-700,-260],[-300,-230],[100,-250],[500,-220]],36,206,{tip:false,specks:9,glow});
  root(s,[[-600,-140],[-200,-160],[200,-120],[600,-150]],28,207,{tip:false,specks:6,glow:glow*.7});
  // the strata wall at the right
  s.fill(K,polyPath(handCut([[WALLX,-1200],[1800,-1200],[1800,1200],[WALLX,1200]],208,26,140),true),.95);s.knockout(ribbon([[WALLX+4,-1200],[WALLX,1200]],8,{seed:209,wobble:3,step:30}),.5);mica(s,WALLX+300,0,500,8,210,.9);
  // the player: sits against the wall with the ball between the feet; stands on 1.56; taps at 2.33 and 2.66 (the ball to the wall and back)
  const up=t>=1.56?anticipate(1.56,2,tt,{back:.1,hold:.3,e:easeOut}):0;
  const KICKS=[2.33,3.3],RET=[2.7,3.7];
  const bk:Key[]=[[0,-60]];KICKS.forEach((k,i)=>{bk.push([k,-60],[k+.28,WALLX-130,easeOut],[RET[i],WALLX-130],[RET[i]+.3,-60,easeOut]);});
  const bx=key(tt,bk),hit=KICKS.map(k=>t>=k+.28?settle(t,k+.28,{amp:.12,freq:5,decay:6,phase:Math.PI/2}):0).reduce((a,b)=>a+b,0);
  if(up<=0){const me=figure(s,-100,300,520,Y,211,'sit',{facing:1,mode:'paper',paperTone:.15,legs:[[[0,0],[.22,-.12],[.42,0]],[[0,0],[.2,-.02],[.4,.02]]],arms:[[[-.03,-.32],[.08,-.2],[.2,-.06]],[[.12,-.32],[.22,-.2],[.3,-.08]]],tilt:up<0?-up*.5:0});gritBall(s,me.feet[1][0]+40,300-90,105,212,{rot:.3,shadow:B});}
  else{const kicking=KICKS.some(k=>t>=k&&t<k+.28),windup=KICKS.some(k=>t>=k-.2&&t<k);const gy=lerp(300,300,1),size=520;figure(s,-200+60*Math.min(1,up),gy,size,Y,211,kicking?'kick':windup?'walk':'stand',{facing:1,mode:'paper',paperTone:.15,tilt:-.2*(1-Math.min(1,up))});
   gritBall(s,bx,300-115,115,212,{rot:bx*.006,shadow:B,sx:1-hit,sy:1+hit});KICKS.forEach((k,i)=>grains(s,WALLX-20,190,t-k-.28,214+i*5,3,.5));}
  mica(s,0,140,360,5,215,.9);
 },
 still:3.4,
};
const SCENES:Scene[]=[ch1,ch2,ch3,ch4,ch5,ch6,ch7,ch8,ch9];

/** Caption chapters: the shipped captions (gritScript.json) at their media times (gritNarrationTiming.json, piecewise linear); headlines per visual chapter. */
const CAPS:[number,string][]=[
 [0,'Did you know… that a tree grows in two directions at the same time?'],[3.68,'It’s always growing down… and growing up.'],
 [6.3,'And what’s interesting is—the root system mirrors the fruit system.'],[11.46,'Now, here’s what’s fascinating about a tree.'],
 [14.26,'Its nature is both gravitropic… and phototropic.'],[17.78,'That means its roots grow away from the light—and toward gravity.'],
 [21.92,'Before the tree can ever grow upward… the seed must first grow downward.'],[25.5,'Into darkness.'],[26.96,'Resistance.'],[27.82,'Pressure.'],[28.06,'And dirt.'],[28.86,'The roots literally have to fight their way deeper underground.'],
 [32.8,'But once the tree breaks through the surface…'],[34.66,'and begins reaching toward the light… there is less resistance.'],
 [39.08,'And honestly…'],[40.12,'That is one of the most beautiful pictures of how life works.'],
 [43.9,'Because the work you do in the dark—when nobody sees you…'],[47.1,'when life feels difficult and heavy—is what creates the success people admire later…'],
 [51.82,'in the light.'],[53.86,'Everybody wants the fruit.'],[55.98,'Everybody wants the visible success… the recognition… and the results.'],
 [60.34,'But very few people are willing to endure the lonely seasons… that create them.'],
];
const chapters:Chapter[]=CAPS.map(([start,narration],i)=>({label:narration.split(/[—…,.]/)[0].trim(),narration,start,seconds:+(((CAPS[i+1]?.[0]??DURATION)-start).toFixed(3)),cues:[{at:0,words:narration.split(' ').slice(0,3).join(' ')}]}));
/** Visual chapters (ENGINE §10): scenes, passages, registration seed and the 1–2 word headlines run on these; captions keep `chapters`. */
const HEADLINES:(string|undefined)[]=[undefined,undefined,undefined,'Downward','Break through',undefined,'Nobody sees','Everybody wants',undefined];
const visualChapters=VS.map((start,i)=>({start,headline:HEADLINES[i],label:['Seed','Mirror','Two pulls','Downward','Break through','The picture','Nobody sees','Everybody wants','Lonely seasons'][i]}));

export const story:RisoStory={
 id:'grit',format:'9v9',title:'Grit',theme:'Roots before fruit',ageNote:'For every developing player: the unseen work that creates what people admire.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',blue:'#0078bf',red:'#ff665e',navy:'#22366b'},order:['yellow','blue','red','navy'],registration:2.2,alpha:.9,grain:.65,mottle:.55},
 audio:{mode:'track',src:'/stories/films/grit/narration.mp3',duration:DURATION},
 chapters,visualChapters,
 draw(f){const v=trackChapters(story,f);playChapters(v.story,v.frame,SCENES);},
 /** Touch: a stratum cracks — a navy-and-paper zigzag opens from the point with mica flecks glinting, then heals to halftone while a grain trickles;
  * above ground the same point throws a spray of five green leaves that flutter down. */
 touch(s,x,y,age,seed){
  const a=age<=0?.1:age,k=clamp(a/.8),r=rng(seed),below=y>0;
  // at the point itself (so the reaction reads inside a fingertip's reach at every viewport): a paper puff that fades as a navy ring and yellow sparks open
  const flash=1-sm(0,.5,a,easeOut);if(flash>0){const rr=34+70*(1-flash);s.knockout(circlePath(x,y,rr),.2+.7*flash);s.fill(K,ring(x,y,rr,rr+7),.9*flash);sparkBurst(s,Y,x,y,rr+50,{n:8,seed:seed+9,g:.6+.4*(1-flash),cov:.9*flash+.1});}
  if(below){const open=sm(0,.15,a,easeOut),heal=sm(.3,.8,a,easeOut);const pts:Pt[]=[];for(let i=0;i<=6;i++)pts.push([x-60+i*20*open*(1+.2*r()),y+(i%2?14:-14)*open+(r()-.5)*8]);
   s.knockout(ribbon(pts,7,{seed,wobble:1,step:8}),Math.max(.15,.9-heal*.8));s.fill(K,ribbon(pts,3,{seed:seed+1,wobble:1,step:8}),.9);
   mica(s,x,y,50*open,4,seed+2,Math.max(.1,.95-heal));grains(s,x,y+10,a-.2,seed+3,3,.6);}
  else{for(let i=0;i<5;i++){const ang=-Math.PI/2+(i-2)*.5,d=60+220*easeOut(k),lx=x+Math.cos(ang)*d+20*Math.sin(a*9+i),ly=y+Math.sin(ang)*d+300*k*k;leaf(s,lx,ly,60,ang+k*4+i,seed+i,1);}}
 },
};
