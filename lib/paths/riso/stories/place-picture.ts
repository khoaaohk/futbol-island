/** A Place in the Picture — riso. Lead material: hard, torn pigment plates (Gold, Green, Pink) that only complete the picture
 * together, and the overprints they make where they cross (orange = pink×yellow, lime = yellow×green, plum = pink×green).
 * Legibility pass (bible §1c): the people are cut-paper pictogram figures standing IN the picture — a pink figure (you), a yellow
 * and a green figure (teammates), an orange figure (the newcomer); the plates are the picture they stand in. The ball is a
 * paint-splat football (paper disc, five hand-cut navy pentagons, pink rim crescent); the goal has two posts, a bar and a paper net.
 * Inks yellow → pink → green → navy on cream. Every plate knocks the sheet out beneath itself and prints clean; overlap lenses are
 * re-filled on purpose so the overprint colours appear where they are meant.
 * Scenes read only their local time t; all randomness is seeded, so the passage seams stay pixel-continuous. */
import type {Sheet} from '../sheet';
import {type RisoStory,type Scene,playChapters} from '../story';
import {apertureDisc} from '../passage';
import {twos,twosIndex,sm,easeOut,easeIO,easeIn,easeOutBack,linear,key,camKeys,anticipate,settle,spring,clamp,lerp,rng,blob,polyPath,ribbon,smoothPts,partial,rotPts,scalePts,circlePath,rectPath,torn,arc,TAU,type Pt} from '../motion';
import {contour,handCut,ring,crescent,confetti,sparkBurst,speedLines} from '../shapes';

const CH='/stories/narration/7v7/place-picture/';
const K='navy',P='pink',G='green',Y='yellow';

// ---------------- abstract riso figure (bible §1c.4) ----------------
/** A cut-paper player pictogram: a big head disc, a hand-cut torso block, two leg strokes, two arm strokes — no anatomy, no face.
 * (x,y) = the ground point under the body, h = height, face = +1 looks right. Poses are parameter tables blended from `from` (stand) by k.
 * ink = the person's role ink (knocked out beneath, navy contour); 'paper' = paper body with navy limbs. headInk prints the head in
 * another ink (the "copy"); ghost = navy contour only (an unprinted plate); hole = a figure-shaped paper hole; afterimage = tone only.
 * reach/reachB = world points the arms end at; foot = the front foot (a kick). look turns the head; sight prints a paper wedge. */
type Pose='stand'|'scan'|'run'|'arms'|'up'|'slump'|'step'|'step2'|'listen'|'crouch'|'kick'|'pull'|'sit'|'beckon'|'point'|'pressed';
type PoseParams={tilt:number;head:Pt;legF:Pt;legB:Pt;armF:Pt;armB:Pt;hip:number};
const POSES:Record<Pose,PoseParams>={
 stand:{tilt:0,head:[0,0],legF:[.1,0],legB:[-.1,0],armF:[.2,.27],armB:[-.2,.27],hip:0},
 scan:{tilt:0,head:[0,0],legF:[.12,0],legB:[-.1,0],armF:[.2,.27],armB:[-.2,.27],hip:0},
 run:{tilt:.35,head:[.02,0],legF:[.3,-.14],legB:[-.36,-.05],armF:[.28,-.06],armB:[-.3,.1],hip:0},
 arms:{tilt:.05,head:[0,0],legF:[.15,0],legB:[-.15,0],armF:[.42,-.12],armB:[-.42,-.12],hip:0},
 up:{tilt:-.04,head:[0,0],legF:[.12,0],legB:[-.12,0],armF:[.28,-.36],armB:[-.28,-.36],hip:0},
 slump:{tilt:.4,head:[.05,.07],legF:[.06,0],legB:[-.08,0],armF:[.16,.34],armB:[-.02,.34],hip:.02},
 step:{tilt:.26,head:[.01,0],legF:[.32,0],legB:[-.3,0],armF:[.36,.1],armB:[-.3,.14],hip:.06},
 step2:{tilt:.26,head:[.01,0],legF:[-.3,0],legB:[.32,0],armF:[-.3,.14],armB:[.36,.1],hip:.06},
 listen:{tilt:.15,head:[.06,.02],legF:[.12,0],legB:[-.1,0],armF:[.05,-.14],armB:[-.2,.27],hip:0},
 crouch:{tilt:.3,head:[.02,.01],legF:[.24,0],legB:[-.24,0],armF:[.3,.12],armB:[-.28,.16],hip:.12},
 kick:{tilt:-.12,head:[0,0],legF:[.34,-.08],legB:[-.12,0],armF:[.3,0],armB:[-.32,.05],hip:0},
 pull:{tilt:-.3,head:[-.02,0],legF:[.32,0],legB:[-.18,0],armF:[.4,-.22],armB:[.34,-.14],hip:.03},
 sit:{tilt:-.05,head:[0,0],legF:[.34,0],legB:[.3,.04],armF:[.22,.2],armB:[-.1,.27],hip:.27},
 beckon:{tilt:-.03,head:[0,0],legF:[.12,0],legB:[-.12,0],armF:[.34,-.3],armB:[-.2,.27],hip:0},
 point:{tilt:.02,head:[.02,0],legF:[.14,0],legB:[-.1,0],armF:[.46,-.02],armB:[-.2,.27],hip:0},
 pressed:{tilt:.32,head:[.04,.06],legF:[.16,0],legB:[-.04,0],armF:[.1,.3],armB:[-.14,.3],hip:.05},
};
type FigOpts={ink?:string;line?:string;seed?:number;face?:1|-1;look?:number;k?:number;from?:Pose;cov?:number;reach?:Pt;reachB?:Pt;foot?:Pt;shade?:string;sight?:number;knock?:boolean;headInk?:string;ghost?:boolean;hole?:boolean;afterimage?:number;outline?:boolean};
type Fig={head:Pt;R:number;top:Pt;handF:Pt;handB:Pt;footF:Pt;body:Path2D};
function figure(s:Sheet,x:number,y:number,h:number,pose:Pose,o:FigOpts={}):Fig|undefined{
 const{ink=P,line=K,seed=1,face=1,look=0,k=1,from='stand',cov=.92,reach,reachB,foot,shade,sight=0,knock=true,headInk,ghost=false,hole=false,afterimage=0,outline=true}=o;if(h<8)return;
 const base=POSES[from],p=POSES[pose],L=(a:number,b:number)=>lerp(a,b,k),LP=(a:Pt,b:Pt):Pt=>[lerp(a[0],b[0],k),lerp(a[1],b[1],k)];
 const tilt=L(base.tilt,p.tilt),head=LP(base.head,p.head),legF=LP(base.legF,p.legF),legB=LP(base.legB,p.legB),armF=LP(base.armF,p.armF),armB=LP(base.armB,p.armB),hip=L(base.hip,p.hip);
 const R=h*.16,tw=h*.3,th=h*.38,legL=h*.3,hipY=-legL+hip*h,ca=Math.cos(tilt),sa=Math.sin(tilt);
 const W=(lx:number,ly:number):Pt=>[x+lx*face,y+ly];
 const T=(lx:number,ly:number):Pt=>[lx*ca-ly*sa,hipY+lx*sa+ly*ca];
 const corners=[T(-tw/2,0),T(tw/2,0),T(tw/2,-th),T(-tw/2,-th)].map(q=>W(q[0],q[1]));
 const torsoPts=handCut(corners,seed,h*.03,h*.11),torso=polyPath(torsoPts,true);
 const shF=T(tw*.42,-th+R*.25),shB=T(-tw*.42,-th+R*.25);
 const hc=T(0,-th-R*1.05),headC=W(hc[0]+head[0]*h+look*R*.42,hc[1]+head[1]*h),headPts=blob(headC[0],headC[1],R,R*.96,seed+2,{amp:.05,n:30});
 const headPath=polyPath(headPts,true);
 const hipF=W(tw*.18,hipY),hipB=W(-tw*.18,hipY);
 const fF=foot?foot:W(legF[0]*h,legF[1]*h),fB=W(legB[0]*h,legB[1]*h);
 const aF=reach?reach:W(shF[0]+armF[0]*h,shF[1]+armF[1]*h),aB=reachB?reachB:W(shB[0]+armB[0]*h,shB[1]+armB[1]*h);
 const limbs=new Path2D();
 limbs.addPath(ribbon([hipF,fF],h*.08,{seed:seed+3,pressure:.4,taper:.25,wobble:1.4}));limbs.addPath(ribbon([hipB,fB],h*.08,{seed:seed+4,pressure:.4,taper:.25,wobble:1.4}));
 limbs.addPath(ribbon([W(shB[0],shB[1]),aB],h*.062,{seed:seed+5,pressure:.4,taper:.35,wobble:1.4}));limbs.addPath(ribbon([W(shF[0],shF[1]),aF],h*.062,{seed:seed+6,pressure:.4,taper:.35,wobble:1.4}));
 const body=new Path2D();body.addPath(torso);body.addPath(headPath);
 const all=new Path2D();all.addPath(body);all.addPath(limbs);
 const out:Fig={head:headC,R,top:W(hc[0],hc[1]-R*1.9),handF:aF,handB:aB,footF:fF,body:all};
 if(hole){s.knockout(all,cov);return out;}
 if(afterimage>0){s.tone(line,all,afterimage);return out;}
 const outl=new Path2D();outl.addPath(ribbon(torsoPts,Math.max(4,h*.022),{seed:seed+7,close:true,pressure:.6,wobble:1.6,gaps:[[.62,.66]]}));outl.addPath(ribbon(headPts,Math.max(4,h*.022),{seed:seed+8,close:true,pressure:.6,wobble:1.4}));
 if(ghost){s.fill(line,limbs,cov);s.fill(line,outl,cov);return out;}
 if(sight>0){const d=face*(look>=0?1:-1),sx=headC[0]+d*R*.6,wedge=polyPath([[headC[0],headC[1]],[sx+d*h*.55,headC[1]-h*.22],[sx+d*h*.55,headC[1]+h*.12]],true);s.knockout(wedge,.3*sight);}
 if(ink==='paper'){if(knock)s.knockout(body,cov);s.fill(line,limbs);if(outline)s.fill(line,outl);}
 else{if(knock)s.knockout(all);s.fill(ink,all,cov);if(headInk){s.knockout(headPath);s.fill(headInk,headPath,cov);}if(outline)s.fill(line,outl,.9);}
 if(shade){const sh=new Path2D();sh.addPath(crescent(headC[0],headC[1],R*.98,[-.35*face,-.4]));sh.addPath(polyPath([corners[0],[lerp(corners[1][0],corners[0][0],.5),lerp(corners[1][1],corners[0][1],.5)],[lerp(corners[2][0],corners[3][0],.5),lerp(corners[2][1],corners[3][1],.5)],corners[3]],true));s.tone(shade,sh,.45);}
 return out;
}
/** Walk cycle: alternate the two step poses on the twos grid while moving (u in 0..1 exclusive), else stand. */
const walkPose=(t:number,moving:boolean):Pose=>moving?(twosIndex(t)%2?'step2':'step'):'stand';

// ---------------- the material: torn pigment plates ----------------
/** P1 — a hand-cut pigment blob. rx, ry = half sizes. amp = how blobby (an oval at .02). */
const shapeP=(cx:number,cy:number,rx:number,ry:number,seed=1,amp=.14,cut=22)=>handCut(blob(cx,cy,rx,ry,seed,{amp,n:12}),seed+1,cut,80);
/** A hand-cut slab (pressure mass, sheet strips). */
const slab=(x0:number,y0:number,x1:number,y1:number,seed:number,amp=40)=>polyPath(handCut([[x0,y0],[x1,y0],[x1,y1],[x0,y1]],seed,amp,160),true);
/** A pigment plate: knocks the sheet out beneath, prints a grainy halftone body and a solid rim band inside its torn edge. */
function plate(s:Sheet,ink:string,pts:Pt[],o:{seed:number;body?:number;rim?:number;knock?:boolean}){
 const{seed,body=.6,rim=70,knock=true}=o,path=polyPath(pts,true);
 if(knock)s.knockout(path);
 s.fill(ink,path,body);
 s.save();s.clip(path);s.fill(ink,ribbon(pts,rim*2,{close:true,seed,wobble:0,taper:0,pressure:.15,step:24}));s.restore();
 return path;
}
/** An unprinted plate: only its navy contour on the sheet (u<1 draws it on, tips leading). */
const ghost=(s:Sheet,pts:Pt[],seed:number,cov=1,u=1)=>{if(u<=0)return;if(u>=1)contour(s,K,pts,13,{close:true,seed,wobble:1.6,pressure:.5,gaps:[[.31,.34],[.72,.745]],cov});else contour(s,K,partial(smoothPts(pts,true,8,1.2),u),13,{seed,wobble:1.6,pressure:.5,taper:.5,cov});};
/** The goal: two navy posts, a crossbar, a paper net (knocked-out ribbons) over a halftone depth. */
function goalPosts(s:Sheet,x:number,y:number,w:number,h:number,seed:number,o:{bar?:number;cov?:number}={}){
 const{bar=Math.max(8,h*.09),cov=1}=o;
 s.tone(K,rectPath(x,y,w,h),.28);
 const net=new Path2D();for(let i=1;i<6;i++)net.addPath(ribbon([[x+w*i/6,y+6],[x+w*i/6+4,y+h]],5,{seed:seed+i,wobble:1,taper:0,step:30}));for(let j=1;j<4;j++)net.addPath(ribbon([[x+6,y+h*j/4],[x+w-6,y+h*j/4+3]],5,{seed:seed+9+j,wobble:1,taper:0,step:40}));s.knockout(net,.8);
 s.fill(K,ribbon([[x,y+h],[x,y],[x+w,y],[x+w,y+h]],bar,{seed,pressure:.5,taper:.15,wobble:1.5,step:30}),cov);
}
/** The Green plate = the 7v7 pitch: torn sheet, mown bands as stepped tonal steps, paper centre circle and halfway line, a goal at the right. */
function pitch(s:Sheet,seed:number,o:{ox?:number;oy?:number;w?:number;h?:number;goalDx?:number;bow?:number;bands?:boolean}={}){
 const{ox=0,oy=40,w=1400,h=900,goalDx=0,bow=0,bands=true}=o,pts=torn(ox-w/2,oy-h/2,w,h,seed,22,40),path=polyPath(pts,true);
 s.knockout(path);s.fill(G,path,.6);
 s.save();s.clip(path);
 if(bands)for(let k=0;k<6;k+=2)s.fill(G,polyPath(torn(ox-w/2-60,oy-h/2+k*150+(k<2?-bow:k>3?bow:0),w+120,150,seed+k,9,60),true),.75);
 s.fill(G,ribbon(pts,140,{close:true,seed,wobble:0,taper:0,pressure:.15,step:24}));s.restore();
 s.knockout(ring(ox,oy+20,150,190),.9);s.knockout(ribbon([[ox,oy-h/2],[ox+6,oy+h/2]],14,{seed:seed+9,wobble:1.2,step:40}),.9);
 goalPosts(s,ox+440+goalDx,oy-60,240,110,seed+3);
 return path;
}
/** Overlap lens: re-print the ink the upper plate knocked out, inside a disc that blooms (g 0..1), so the two inks overprint. */
function lens(s:Sheet,under:string,underPath:Path2D,over:Path2D,x:number,y:number,r:number,g:number,cov=.6){if(g<=0)return;s.save();s.clip(over);s.clip(circlePath(x,y,r*3.2*easeOut(clamp(g))));s.fill(under,underPath,cov);s.restore();}
/** Offcut chips torn from a plate edge: seeded triangles that flutter out with gravity and settle (they stay as marks). */
function chips(s:Sheet,ink:string|'paper',x:number,y:number,n:number,seed:number,age:number,o:{spread?:number;up?:number;life?:number;size?:number}={}){
 if(age<0)return;const{spread=1,up=160,life=.7,size=26}=o,r=rng(seed),k=clamp(age/life),e=easeOut(k),p=new Path2D();
 for(let i=0;i<n;i++){const a=r()*TAU,v=(80+r()*200)*spread,vx=Math.cos(a)*v,vy=Math.sin(a)*v-up*(.5+r()),px=x+vx*e,py=y+vy*e+420*k*k,rot=r()*TAU+k*6*(r()-.5),sz=size*(.6+r()*.8);
  const q=rotPts([[-sz*.5,-sz*.4],[sz*.5,-sz*.55],[sz*.45,sz*.4],[-sz*.35,sz*.5]],rot);p.moveTo(px+q[0][0],py+q[0][1]);for(let j=1;j<4;j++)p.lineTo(px+q[j][0],py+q[j][1]);p.closePath();}
 if(ink==='paper')s.knockout(p);else s.fill(ink,p);
}
/** The story's football: a paint-splat ball — paper disc, pink rim crescent, five hand-cut navy pentagon panels in a net, navy contour. */
function paintBall(s:Sheet,x:number,y:number,r:number,o:{rot?:number;sx?:number;sy?:number;seed?:number}={}){
 const{rot=0,sx=1,sy=1,seed=5}=o,pts=scalePts(blob(x,y,r,r,seed,{amp:.03,n:40}),sx,sy,x,y),d=polyPath(pts,true);
 s.knockout(d);s.save();s.clip(d);s.tone(P,crescent(x,y,r*1.05,[-.4,-.45]),.45);
 const pent=(cx:number,cy:number,pr:number,a0:number)=>{const q:Pt[]=[];for(let i=0;i<5;i++){const a=a0+i/5*TAU;q.push([cx+Math.cos(a)*pr,cy+Math.sin(a)*pr]);}return polyPath(handCut(q,seed+3,pr*.12,pr*.6),true);};
 const panels=new Path2D();panels.addPath(pent(x,y,r*.3,rot));for(let i=0;i<5;i++){const a=rot+Math.PI/5+i/5*TAU,dd=r*.86;panels.addPath(pent(x+Math.cos(a)*dd*sx,y+Math.sin(a)*dd*sy,r*.28,a+Math.PI));}
 s.fill(K,panels,.85);
 const seams=new Path2D();for(let i=0;i<5;i++){const a=rot+i/5*TAU,a2=rot+Math.PI/5+i/5*TAU;seams.moveTo(x+Math.cos(a)*r*.3*sx,y+Math.sin(a)*r*.3*sy);seams.lineTo(x+Math.cos(a2)*r*.62*sx,y+Math.sin(a2)*r*.62*sy);}s.stroke(K,seams,Math.max(2,r*.05));
 s.restore();contour(s,K,pts,Math.max(4,r*.08),{close:true,seed:seed+1,pressure:.5,wobble:r*.02});
}
/** A sprout: a fan of strokes grown from a point along curves, tips leading, one per drawn frame, overshooting. */
function sprout(s:Sheet,x:number,y:number,inks:string[],u:number,seed:number,o:{len?:number;n?:number;dir?:number;spread?:number;scale?:number;width?:number;dual?:boolean}={}){
 const{len=260,n=9,dir=-Math.PI/2,spread=1.6,scale=1,width=14,dual=false}=o,r=rng(seed);
 for(let i=0;i<n;i++){const a=dir+(i/(n-1)-.5)*spread,L=len*(.7+r()*.5)*scale,bend=(r()-.5)*.6,ui=clamp((u*(n+2)-i)/2.5);if(ui<=0)continue;
  const g=easeOutBack(ui),pts:Pt[]=[[x,y],[x+Math.cos(a+bend)*L*.5*g,y+Math.sin(a+bend)*L*.5*g],[x+Math.cos(a)*L*g,y+Math.sin(a)*L*g]];
  if(dual)inks.forEach(ink=>contour(s,ink,pts,width*scale,{seed:seed+i,taper:.85,pressure:.4}));else contour(s,inks[i%inks.length],pts,width*scale,{seed:seed+i,taper:.85,pressure:.4});}
}
/** An overprint band: a strip printed by two plates at once (knocked out beneath so the overprint is clean). */
function band(s:Sheet,inks:[string,string],a:Pt,b:Pt,width:number,seed:number,progress=1){
 if(progress<=0)return;const end:Pt=[lerp(a[0],b[0],progress),lerp(a[1],b[1],progress)],rb=ribbon([a,end],width,{seed,wobble:1.2,taper:.2,pressure:.2,step:20});
 s.knockout(rb);s.fill(inks[0],rb,.75);s.fill(inks[1],rb,.75);
}
const cam=(s:Sheet,t:number,K:number[][])=>camKeys(s,t,K);
const GOLD=()=>handCut([[-900,-720],[320,-720],[260,-60],[-900,-300]],21,34,160);
const PINK=()=>shapeP(330,-250,230,160,1);
const shiverOf=(t:number,at:number[],amp=4)=>at.reduce((a,t0)=>a+settle(t,t0,{amp,freq:14,decay:9}),0);

// ---------------- chapters ----------------
/** 1 — the picture: a pink figure walks onto the pitch beside a yellow one; sameness presses it into a yellow-headed copy; the plates print and it springs back pink. */
const ch1:Scene={
 draw(s,t){
  const tt=twos(t),shiver=shiverOf(t,[3.76,5.12,5.9]);
  const v=cam(s,t,[[0,-40,40,1],[1.62,-40,40,1],[2.4,-120,60,1.15],[3.76,-120,60,1.15],[5.1,80,-20,1.2],[7.3,140,-100,1.35,-.05],[8.7,240,-190,1.55,-.05]]);
  s.camera(v[0]+shiver,v[1]+2*sm(1.9,2.4,t),v[2],v[3]);
  s.field(Y,.45,.5);confetti(s,[K,'paper'],[-1400,-1000,2800,2000],22,54,{size:36});
  const green=pitch(s,11);
  const goldPts=GOLD(),gold=polyPath(goldPts,true),drawOn=sm(0,1.4,t,easeOut);
  if(t>=3.76){plate(s,Y,goldPts,{seed:21,body:tt<3.76+1/12?1:.6});s.knockout(circlePath(-380,-300,150));}else ghost(s,goldPts,21,1,drawOn);
  const pinkPts=PINK(),pink=polyPath(pinkPts,true);
  if(t>=5.12)plate(s,P,pinkPts,{seed:31,body:tt<5.12+1/12?1:.6});else ghost(s,pinkPts,31,1,sm(.3,1.5,t,easeOut));
  if(t>=5.12){lens(s,Y,gold,pink,190,-250,100,sm(5.12,5.7,t));lens(s,G,green,pink,440,-200,100,sm(6.2,6.8,t));}
  if(t>=5.9)lens(s,G,green,gold,-450,-300,80,sm(5.9,6.4,t));
  // sameness: a navy mass slides in from the left and presses the pink figure toward the yellow one; it retreats on "Think of a picture"
  const massX=key(t,[[1.62,-1400],[1.82,-1340,easeIn],[2.4,-250,easeOut],[3.76,-250],[3.96,-200,easeIn],[4.5,-1500]])+settle(t,2.4,{amp:8,freq:5,decay:5});
  const sq=t<3.96?sm(1.9,2.4,t,easeIn):clamp(1-spring(t-3.96,2.4,.45),-.25,1);
  if(massX>-1400)s.tone(K,slab(massX-1300,-1000,massX,1100,41),.7);
  // the yellow teammate stands on the pitch; the pink figure walks in, is pressed (leans, head prints yellow), springs back, head prints pink again on the plate slap
  figure(s,300,330,380,'stand',{ink:Y,seed:61,face:-1,shade:G});
  const walk=sm(0,1,t,easeIO),wx=lerp(-560,-160,walk)+60*clamp(sq)+settle(t,1,{amp:6,freq:5,decay:6});
  const copy=t>=2.4&&t<5.12;
  figure(s,wx,330,380,walk<1?walkPose(t,true):sq>0?'pressed':'stand',{ink:P,seed:62,face:1,k:walk<1?1:clamp(sq,0,1),headInk:copy?Y:undefined,shade:G});
  chips(s,K,-300,120,3,51,tt-2.4);chips(s,Y,-500,-120,6,52,tt-3.76,{spread:1.2});chips(s,P,330,-250,5,53,tt-5.12);chips(s,K,-300,700,5,55,tt-2.4,{up:260});
 },
 aperture(){return apertureDisc(330,-250,95,12);},
};
/** 2 — three plate sheets pressed into one colour; a figure-shaped hole falls out; the sheets fan back into their own inks, a figure on each. */
const ch2:Scene={
 draw(s,t){
  const tt=twos(t),duo=t<3.98,shiver=shiverOf(t,[.85,3.98,8.9,9.15,9.4]);
  const drop=40*sm(2.5,2.8,t,easeIn)*(1-sm(2.9,3.5,t));
  const v=cam(s,t,[[0,0,0,1.15],[2.3,0,0,1.25],[3.5,0,-20,1.5],[3.98,0,-20,1.5],[5.5,0,60,1.5],[6.9,0,60,1.5],[8.5,30,80,1.6,.05],[8.9,30,80,1.6,.05],[10.35,0,40,1.9,.05],[11,0,40,1.95,.05]]);
  s.camera(v[0]+shiver,v[1]+drop,v[2],v[3]+.03*sm(.2,.5,t)*(1-sm(.85,1.4,t)));
  s.field(Y,.45,.6);
  const dune=(y:number,cov:number,seed:number)=>s.tone(K,polyPath(torn(-1700,y,3400,1400,seed,40,60),true),cov);dune(560,.2,12);dune(760,.32,13);
  confetti(s,[K,'paper'],[-1400,-1000,2800,1500],16,14,{size:34});
  // sheets: outer ones pressed behind the front, then fanned apart with a slap
  const press=anticipate(0,.85,t,{back:.08,hold:.25,e:easeIn}),fan=t<3.98?0:easeOut(sm(3.98,4.9,t,linear));
  const spread=lerp(lerp(300,30,clamp(press,0,1)),300,fan),rotOut=key(t,[[0,0],[.25,.07],[.85,0]])+(t>=4.9?settle(t,4.9,{amp:.09,freq:3,decay:4}):0);
  const sx=1-.03*sm(.5,.85,t)*(1-sm(.85,1.3,t)),rimW=(k:number)=>tt>=k&&tt<k+1/12?220:140;
  const sheet=(ink:string,x:number,rot:number,seed:number,front:boolean,rw:number)=>{const pts=rotPts(scalePts(torn(x-260,-450,520,900,seed,18,40),front?sx:1,1,x,0),rot,x,0),path=polyPath(pts,true),use=duo?Y:ink;s.knockout(path);s.fill(use,path,front?.6:.45);s.save();s.clip(path);s.fill(use,ribbon(pts,rw,{close:true,seed,wobble:0,taper:0,pressure:.15,step:24}));s.restore();return path;};
  const yel=sheet(Y,-spread,-rotOut,61,false,rimW(8.9)),gre=sheet(G,spread,rotOut,62,false,rimW(9.4)),pinkRot=-.1*fan;
  const pnk=sheet(P,0,pinkRot,63,true,rimW(9.15));
  if(fan>0){s.save();s.clip(pnk);s.fill(Y,yel,.6);s.fill(G,gre,.45);s.restore();}
  // a figure on each side sheet: ghosts while every colour is the same, printed in their own ink once the sheets fan apart
  const side=(x:number,rot:number,ink:string,seed:number,pose:Pose)=>{s.save();s.translate(x,0);s.rotate(rot);figure(s,0,300,340,pose,{ink,seed,face:x<0?1:-1,ghost:duo,cov:duo?.8:.92,shade:duo?undefined:K});s.restore();};
  side(-spread,-rotOut,Y,64,'arms');side(spread,rotOut,G,65,'point');
  // the front figure: a yellow-toned copy of the yellow figure's pose; the hole tears out in its exact shape and the cut-out falls; it refills pink; then it stops copying (own pose)
  const open=sm(2.34,2.74,t,easeOut),refill=sm(3.98,4.4,t,easeOut),redraw=key(t,[[6.9,0],[6.9+1/12,.33],[6.9+2/12,.66],[6.9+3/12,1]]);
  s.save();s.translate(0,0);s.rotate(pinkRot);
  if(open<=0)figure(s,0,300,340,'arms',{ink:Y,seed:66,cov:.4,outline:true});
  else{s.save();s.translate(0,130);s.scale(open,open);s.translate(0,-130);figure(s,0,300,340,'arms',{seed:66,hole:true});s.restore();
   const fall=t-2.5;if(fall>0&&fall<1.3){const fy=900*fall*fall;s.save();s.translate(0,130+fy);s.rotate(fall*1.4);s.translate(0,-130);figure(s,0,300,340,'arms',{ink:Y,seed:66,cov:1,knock:true});s.restore();}}
  if(refill>0){s.save();s.translate(0,130);s.scale(refill,refill);s.translate(0,-130);figure(s,0,300,340,tt>=6.9?'up':'arms',{ink:P,seed:66,from:'arms',k:tt>=6.9?redraw:1,shade:K});s.restore();}
  s.restore();
  chips(s,'paper',-40,120,5,68,tt-.85,{spread:1.6,up:60});chips(s,'paper',40,-200,4,69,tt-.85,{spread:1.6,up:60});
  chips(s,K,-300,-420,3,70,tt-4.9);chips(s,K,300,420,3,71,tt-4.9);chips(s,K,120,300,3,72,tt-7.2);
 },
 aperture(){return apertureDisc(0,200,60,12);},
};
/** 3 — inside the Pink plate: four poses of the pink figure (quiet, ideas, quick, noticing), then the four line up as one plate's contents. */
const ch3:Scene={
 draw(s,t){
  const tt=twos(t),shiver=shiverOf(t,[7.2])+settle(t,3,{amp:3,freq:10,decay:8});
  const v=cam(s,t,[[0,0,-80,1.2],[1.1,0,-80,1.24],[2.1,-300,-300,1.4],[2.55,-300,-300,1.4],[3.45,340,80,1.4],[3.82,340,80,1.4],[4.4,-40,-460,1.4],[4.9,-160,-460,1.4],[5.38,0,-40,1.3],[6.7,0,0,1.3],[7.2,0,0,1.3],[8.55,420,80,2.1],[9.2,420,80,2.15]]);
  s.camera(v[0]+shiver,v[1],v[2],.02*sm(1.87,2.1,t)*(1-sm(2.4,3.2,t)));
  s.field(P,.6,.5);
  s.fill(P,polyPath(handCut([[100,1400],[500,1400],[1800,-500],[1400,-500]],31,40,160),true),1);
  s.fill(Y,polyPath(handCut([[-1800,-1800],[-60,-1800],[-330,-280],[-1800,-520]],32,40,160),true),.6);
  const gc=polyPath(handCut([[260,1800],[1800,1800],[1800,180],[470,400]],33,40,160),true);s.knockout(gc);s.fill(G,gc,.6);
  confetti(s,[K,'paper',Y],[-1300,-1200,2600,2400],20,34,{size:34});
  // the row everything slides into on "These are things"
  const row=sm(5.38,6.28,t),liftUp=key(t,[[5.38,0],[5.58,-10],[5.62,-10],[6.28,0]]);
  const at=(x0:number,y0:number,x1:number,i:number)=>({x:lerp(x0,x1,row),y:lerp(y0,180,row)+liftUp+settle(t,6.28+i*.1,{amp:6,freq:6,decay:6}),h:lerp(380,270,row)});
  if(t>=5.4)s.tone(K,polyPath(torn(-640,190,1280,90,35,8,30),true),sm(5.4,5.9,t)>.5?.5:.32);
  // Quiet: the figure stands dead still, arms down; a navy ring draws around it, then motion stops dead
  const q=at(0,140,-420,0),nudge=settle(t,3,{amp:8,freq:4,decay:4});
  figure(s,q.x+nudge,q.y,q.h,'stand',{seed:41,face:1,shade:K});
  const ringU=sm(0,.5,t,easeOut);if(ringU>0&&row<1)contour(s,K,partial(smoothPts(blob(q.x+nudge,q.y-q.h*.5,q.h*.62,q.h*.62,42,{amp:.03,n:40}),true,6),ringU),14,{seed:43,taper:.4,pressure:.5,cov:1-row});
  // Ideas: arms up, a sprout of strokes grows from the head
  const id=at(-320,-40,-140,1),ideaK=sm(1.12,1.4,t,easeOutBack);
  const fi=figure(s,id.x,id.y,id.h,'up',{seed:44,face:1,k:ideaK,shade:K});
  if(fi)sprout(s,fi.head[0],fi.head[1]-fi.R,[Y,K],sm(1.12,1.87,t,linear),45,{len:300,n:9,scale:id.h/380,dir:-Math.PI/2,spread:1.9,width:16});
  if(t<1.12&&fi)s.fill(K,polyPath(blob(fi.head[0],fi.head[1]-fi.R*1.6,26,26,46),true),.3);
  // Quick: the figure rushes with a smear and leaves stamped afterimages
  const rush=t<2.4?0:anticipate(2.4,3,t,{back:.28,hold:.33,e:easeIn}),over=settle(t,3,{amp:-30,freq:3,decay:5});
  const r=at(380-160*rush+over,300,140,2),smear=tt>=2.85&&tt<3;
  if(t>=3&&row<1)for(let k=1;k<=3;k++)figure(s,r.x+(24*k+40)*(1-row),r.y,r.h,'run',{seed:47,face:-1,afterimage:[.4,.3,.2][k-1]*(1-row)});
  if(smear){for(let k=1;k<=2;k++)figure(s,r.x+60*k,r.y,r.h,'run',{seed:47,face:-1,afterimage:.35});speedLines(s,K,r.x+40,r.y-r.h*.5,Math.PI,{n:5,seed:48,len:220,spread:70,width:8});}
  figure(s,r.x,r.y,r.h,t<2.4?'stand':'run',{seed:47,face:-1,k:t<2.4?1:clamp(rush)+.2,shade:K});
  // Noticing: the head turns toward the others (the camera pans as the look) with a torn paper eye blot inside the head disc
  const n=at(-60,-260,420,3),look=key(t,[[3.82,0],[4.4,-.6],[4.9,.6],[5.38,0]]),sight=sm(3.82,3.95,t);
  const fn=figure(s,n.x,n.y,n.h,'listen',{seed:49,face:1,look,k:sm(3.82,4.1,t),sight,shade:K});
  if(fn&&t>=3.9){const er=fn.R*.42,ex=fn.head[0]+look*fn.R*.3+fn.R*.15,ey=fn.head[1]-fn.R*.1,blot=handCut(blob(ex,ey,er*1.3,er,50,{amp:.12,n:10}),51,er*.25,er*.5);s.knockout(polyPath(blot,true),.95);s.fill(K,polyPath(blob(ex+look*er*.35,ey,er*.42,er*.42,52,{amp:.06}),true));}
  // the plate prints its rim band around the row
  if(t>=7.2)s.fill(P,ribbon(torn(-620,-190,1240,420,36,14,50),tt<7.2+1/12?110:70,{close:true,seed:36,wobble:0,taper:0,pressure:.1,step:20}),1);
  chips(s,'paper',-420,180,3,52,tt-6.3,{size:18});chips(s,'paper',140,180,3,53,tt-6.5,{size:18});chips(s,K,240,240,4,54,tt-3,{up:120});
 },
 aperture(){return apertureDisc(420,80,34,12);},
};
/** 4 — the goal corner: a green figure welcomes the pink one into its spot; a shot wide and an overhit pass change nothing about the welcome. */
const ch4:Scene={
 draw(s,t){
  const tt=twos(t),drop=30*sm(5.5,5.7,t,easeIn)*(1-sm(5.9,6.4,t));
  const v=cam(s,t,[[0,-220,60,1],[.2,-220,60,1],[.9,-220,60,.98],[2.14,-220,60,1],[3.9,-120,40,1.15],[4.82,-120,40,1.15],[5.7,140,0,1.2],[7.12,140,0,1.2],[8.3,-320,80,1.3],[9,-320,80,1.3],[10.05,-330,-360,1.9],[10.7,-330,-360,1.95]]);
  s.camera(v[0],v[1]+drop,v[2],0);
  s.field(G,.6,.45);
  const bow=10*sm(.2,.9,t,easeOut)*(1-.5*sm(.9,1.6,t));
  for(let k=-4;k<=4;k+=2)s.fill(G,polyPath(torn(-1700,k*150-75+(k<0?-bow:bow),3400,150,41+k,9,60),true),.75);
  plate(s,Y,handCut([[-1600,-1500],[100,-1500],[-60,-240],[-1600,-160]],42,20,160),{seed:42,knock:false});
  confetti(s,[K,'paper',P],[-1300,-900,2600,1800],16,43,{size:32});
  // the goal: posts, bar, paper net
  goalPosts(s,80,-230,440,190,44,{bar:16});
  // the spot: a paper slot on the pitch that opens wider (the composition expands), re-cut on "respect", holds through both mistakes
  const open=key(t,[[0,1],[.2,.95,easeIn],[.9,1.3,easeOut],[2.14,1.3],[2.4,1.15]]),cut=sm(2.14,2.3,t);
  const halo=sm(2.4,2.9,t,easeOut);if(halo>0)s.tone(Y,polyPath(blob(-200,240,300*halo,140*halo,45,{amp:.05}),true),.45);
  const slotPts=shapeP(-200,250,170*open,70*open,1,lerp(.02,.14,cut),lerp(3,22,cut));s.knockout(polyPath(slotPts,true));
  if(t>=7.5)contour(s,K,slotPts,18,{close:true,seed:46,pressure:.4,wobble:1.5,cov:sm(7.5,7.9,t)>.5?1:.6});
  // the green teammate beckons (arm waving on twos) until the pink figure stands in the spot, then opens its arms
  const wave=(twosIndex(t)%2?1:.8),welcomed=sm(2.14,2.5,t,easeOut);
  const gf=figure(s,-500,250,380,welcomed>0?'arms':'beckon',{ink:G,seed:47,face:1,k:welcomed>0?.6+.4*welcomed:sm(0,.3,t)*wave,from:welcomed>0?'beckon':'stand',shade:K});
  // the pink figure walks in from the right, stops short, then steps into the spot on "treated with respect"
  const walk=sm(.2,1.1,t,easeIO),into=t<2.14?0:anticipate(2.14,2.6,t,{back:.1,hold:.25}),px=t<2.14?lerp(200,-60,walk):lerp(-60,-200,clamp(into))+settle(t,2.6,{amp:6,freq:5,decay:6});
  const moving=(walk>0&&walk<1)||(into>0&&into<1);
  // the pink figure kicks: a shot that slips wide (4.82), a pass that is overhit past the green figure (7.12)
  const kick1=t>=4.62&&t<5.2?sm(4.62,4.82,t,easeIn)*(1-sm(5,5.2,t)):0,kick2=t>=6.95&&t<7.5?sm(6.95,7.12,t,easeIn)*(1-sm(7.3,7.5,t)):0,kickK=Math.max(kick1,kick2);
  const pose:Pose=moving?walkPose(t,true):kickK>0?'kick':'stand';
  figure(s,px,250,380,pose,{ink:P,seed:48,face:kick2>0?-1:1,k:kickK>0?kickK:1,shade:K,look:t>=7.12&&t<9?-.5:0});
  if(gf&&t>=7.97)figure(s,-500,250,380,'listen',{ink:G,seed:47,face:-1,look:-.6,k:sm(7.97,8.3,t),shade:K});
  // the ball: struck, slips wide of the goal, drops; rolled back, overhit past the teammate; rolls home to the pink figure's feet
  if(t>=4.62){let bx=-120,by=300;
   if(t<4.82)bx=-120-20*sm(4.62,4.82,t);
   else if(t<5.52){const p=arc([-140,300],[620,-120],sm(4.82,5.52,t,easeOut),40);bx=p[0];by=p[1];}
   else if(t<7.12){const u=t-5.52;bx=620+40*clamp(u/.8);by=u<.35?-120+180*Math.pow(u/.35,2):u<.75?60-240*((u-.35)/.4)*(1-(u-.35)/.4):u<1?60-80*((u-.75)/.25)*(1-(u-.75)/.25):60;}
   else if(t<9){const rock=sm(7.12,7.27,t),skid=sm(7.27,7.97,t,easeOut);bx=lerp(660+12*rock,-820,skid)+settle(t,7.97,{amp:10,freq:5,decay:5});by=lerp(60,290,skid);}
   else{const home=sm(9,9.75,t);bx=lerp(-820,-120,home);by=lerp(290,300,home);}
   const bump=t>=9.75?settle(t,9.75,{amp:.08,freq:4,decay:5,phase:Math.PI/2}):0;
   paintBall(s,bx,by,64,{rot:bx*.01,sx:1+bump,sy:1-bump,seed:49});
   if(t>=5.52)sparkBurst(s,K,620,-120,90,{n:7,seed:50,g:sm(5.52,5.9,t,easeOut)});}
  else paintBall(s,-120,300,64,{seed:49});
  chips(s,'paper',-200,250,4,51,tt-2.3,{size:16});chips(s,K,620,-120,5,52,tt-5.52,{up:200});chips(s,Y,-300,-250,3,53,tt-1,{size:20});chips(s,'paper',-820,290,3,54,tt-7.97,{size:16,up:80});
 },
 aperture(){return apertureDisc(-330,-360,90,12);},
};
/** 5 — the centre circle: pressure crumples the pink figure; it passes to the yellow figure, shares an idea, waves the green figure in, listens. */
const ch5:Scene={
 draw(s,t){
  const tt=twos(t);
  const v=cam(s,t,[[0,-60,40,1],[2.66,-60,40,1],[3.55,60,-20,1.15],[3.92,60,-20,1.15],[4.9,60,-60,1.2],[5.02,60,-60,1.2],[6,170,80,1.15],[7.26,170,80,1.15],[8.66,80,80,1.25,-.06],[9.2,80,80,1.25,-.06],[10.45,-200,220,2,-.06],[11.1,-200,220,2.05,-.06]]);
  s.camera(v[0],v[1],v[2],v[3]+.03*sm(.2,.7,t)*(1-sm(.7,1.4,t)));
  s.field(G,.6,.45);for(let k=-4;k<=4;k+=2)s.fill(G,polyPath(torn(-1700,k*150-75,3400,150,51+k,9,60),true),.75);
  const dent=8*sm(.2,.7,t);s.knockout(ring(0,80+dent*.3,350,395),.9);s.knockout(ribbon([[0,-1400],[4,1400]],14,{seed:52,wobble:1.2,step:60}),.9);
  confetti(s,[K,'paper',Y],[-1300,-900,2600,1800],16,53,{size:32});
  // pressure: the navy mass pushes into the pink figure in pulses until the pass releases it, then shrinks once the play moves on
  const pulses=t<2.66?8*(sm(1.2,1.4,t)*(1-sm(1.4,1.7,t))+sm(1.9,2.1,t)*(1-sm(2.1,2.4,t))):0;
  const massX=key(t,[[0,-480],[.2,-500,easeIn],[.7,-350,easeOut],[2.66,-350],[3.2,-400,easeOut]])+settle(t,.7,{amp:8,freq:5,decay:5})+pulses;
  const amount=t<2.66?key(t,[[.2,0],[.7,.8,easeIn]])+pulses/40:clamp(.8*(1-spring(t-2.66,2.4,.45)),-.2,.8);
  const massCov=t<5.02?.7:lerp(.7,.4,sm(5.02,5.6,t));
  s.tone(K,slab(massX-800,-500,massX,700,54,44),massCov);
  // the figures: pink (you) pressed against the mass, yellow teammate up-right, green teammate walking in on "Invite"
  const inv=t<5.22?0:anticipate(5.22,5.92,t,{back:.06,hold:.2,e:easeIn}),gx=lerp(760,460,inv)+settle(t,5.92,{amp:10,freq:5,decay:6});
  const P0:Pt=[-280+40*clamp(amount),320],Yp:Pt=[260,60],Gp:Pt=[gx,360];
  const dipG=12*settle(t,3.56,{amp:1,freq:4,decay:5});
  const kickY=t>=5.02&&t<5.6?sm(5.02,5.22,t,easeIn)*(1-sm(5.4,5.6,t)):0;
  figure(s,Yp[0],Yp[1]+dipG,340,kickY>0?'kick':t>=3.56&&t<3.9?'crouch':'stand',{ink:Y,seed:61,face:1,k:kickY>0?kickY:t>=3.56&&t<3.9?.5:1,shade:K});
  if(t>=5.02){const kickG=t>=9&&t<9.5?sm(9,9.2,t,easeIn)*(1-sm(9.3,9.5,t)):0,talk=t>=7.5?(twosIndex(t)%2?.9:.7):0;
   figure(s,Gp[0],Gp[1],360,inv>0&&inv<1?walkPose(t,true):kickG>0?'kick':talk>0?'point':'stand',{ink:G,seed:62,face:-1,k:kickG>0?kickG:talk>0?talk:1,shade:K});}
  // pink: pressed (slump), kicks the pass (2.66), shares an idea (arm up + sprout from the head), listens (head tilted to green, ear crescent)
  const kick1=t>=2.66&&t<3.2?sm(2.66,2.86,t,easeIn)*(1-sm(3,3.2,t)):0,idea=sm(3.92,4.3,t,easeOutBack)*(1-sm(6.6,7,t)),listen=sm(7.26,7.76,t,easeOutBack);
  const pose:Pose=amount>.05&&t<2.66?'pressed':kick1>0?'kick':idea>0?'up':listen>0?'listen':'stand';
  const pk=pose==='pressed'?clamp(amount):pose==='kick'?kick1:pose==='up'?idea:pose==='listen'?listen:1;
  const fp=figure(s,P0[0],P0[1],380,pose,{ink:P,seed:63,face:1,k:pk,look:listen*.7,shade:K});
  if(fp&&t>=3.92&&t<7)sprout(s,fp.head[0]+fp.R*.4,fp.head[1]-fp.R,[Y,G],sm(3.92,4.42,t,linear),70,{len:260,n:7,dir:-1.1,spread:1.6,dual:true,width:12,scale:1-sm(6.6,7,t)});
  // the ear crescent (once): a pink offcut opening from the head toward Green; the green figure's plum ripples travel into it
  if(fp&&listen>0){const er=fp.R*.75*listen,ep=crescent(fp.head[0]+fp.R*.95,fp.head[1],er,[.55,0],1.05);s.knockout(ep);s.fill(P,ep,1);contour(s,K,blob(fp.head[0]+fp.R*.95,fp.head[1],er,er,64,{amp:.03,n:24}),5,{close:true,seed:64,gaps:[[.3,.7]]});}
  if(t>=7.6&&fp){const u=sm(7.6,8.4,t,easeOut);s.save();s.clip(rectPath(-100,-400,800,900));for(let k=0;k<3;k++){const g=clamp(u*3-k);if(g<=0)continue;const rr=40+k*50+150*g,rp=ribbon(blob(gx-40,55,rr,rr*.8,73+k,{amp:.04,n:40}),9,{seed:74+k,close:true,wobble:1.4});s.fill(P,rp,g);s.fill(G,rp,g);}s.restore();}
  // bands and the ball: pass (orange), invite (lime), listen/return (plum) between the figures' feet
  const pass1=sm(2.86,3.56,t,easeOut),pass2=sm(5.22,5.92,t,easeOut),pass3=sm(9.2,9.95,t);
  const B0:Pt=[P0[0]+70,300],B1:Pt=[Yp[0]+50,Yp[1]-10],B2:Pt=[Gp[0]-80,Gp[1]-10];
  band(s,[P,Y],B0,B1,60,67,sm(2.66,2.96,t,easeOut));
  if(t>=5.02)band(s,[Y,G],B1,B2,60,68,sm(5.02,5.4,t,easeOut));
  if(t>=9)band(s,[G,P],B2,B0,60,69,sm(9,9.3,t,easeOut));
  let bx=B0[0],by=B0[1];
  if(t<2.86)bx=B0[0]-15*sm(2.66,2.86,t);
  else if(t<5.22){bx=lerp(B0[0],B1[0],pass1);by=lerp(B0[1],B1[1],pass1)-30*Math.sin(pass1*Math.PI);}
  else if(t<9.2){bx=lerp(B1[0],B2[0],pass2);by=lerp(B1[1],B2[1],pass2)-24*Math.sin(pass2*Math.PI);}
  else{bx=lerp(B2[0],B0[0],pass3);by=lerp(B2[1],B0[1],pass3)-30*Math.sin(pass3*Math.PI);}
  const bump=t>=9.95?settle(t,9.95,{amp:.07,freq:4,decay:5,phase:Math.PI/2}):0;
  paintBall(s,bx,by,66,{rot:(t<9.95?bx*.012:B0[0]*.012),sx:1+bump,sy:1-bump,seed:75});
  chips(s,'paper',-260,200,4,76,tt-.7,{size:16,up:100});chips(s,Y,Yp[0],Yp[1]-60,3,77,tt-3.56,{size:16});chips(s,K,gx,300,3,78,tt-5.92,{size:18});
 },
 aperture(){return apertureDisc(-230,300,22,10);},
};
/** 6 — the whole Picture on plum: the pink figure raises an arm (learns) and stays pink; the sheet tears wider; an orange figure walks in. */
const ch6:Scene={
 draw(s,t){
  const tt=twos(t),shiver=shiverOf(t,[1.66,6.9],3);
  const v=cam(s,t,[[0,0,0,.75],[1.66,0,0,.75],[3,-100,-40,1.05],[3.54,-100,-40,1.05],[4.8,340,20,1.01],[4.86,340,20,1.01],[6.4,300,20,1.1,.035],[6.9,300,20,1.1,.035],[8.9,200,40,1.2,.035],[9.3,200,40,1.2,.035]]);
  s.camera(v[0]+shiver,v[1],v[2],v[3]);
  s.field(P,.6,.6);s.tone(K,rectPath(-4000,-4000,8000,8000),.32);confetti(s,['paper',Y],[-1500,-1100,3000,2200],22,81,{size:34});
  const tear=key(t,[[3.54,0],[3.74,-20,easeIn],[4.24,220,easeOut]])+settle(t,4.24,{amp:10,freq:5,decay:5}),loosen=1+.03*sm(3.54,4.4,t,easeOut);
  const sheetPts=torn(-740,-520,1480+Math.max(0,tear),1040,82,26,50),sheet=polyPath(sheetPts,true);s.knockout(sheet);s.fill(Y,sheet,.32);
  s.save();s.scale(loosen);
  const green=pitch(s,83,{goalDx:120*sm(3.54,4.24,t,easeOut)});
  if(tear>0){const ext=torn(690,-300,tear+40,760,84,18,40),ep=polyPath(ext,true);s.knockout(ep);s.fill(G,ep,.6);s.fill(G,polyPath(torn(690,-100,tear+40,150,85,9,40),true),.75);}
  const goldPts=GOLD(),gold=polyPath(goldPts,true);plate(s,Y,goldPts,{seed:86});s.knockout(circlePath(-380,-300,150));
  const pinkPts=PINK(),pink=plate(s,P,pinkPts,{seed:87});
  lens(s,Y,gold,pink,190,-250,100,1);lens(s,G,green,pink,440,-200,100,1);lens(s,G,green,gold,-450,-300,80,1);
  // the figures in the picture: pink (you) raises an arm to learn — over three drawn frames, overshooting, settling on "still be yourself" — and stays pink
  const lg=key(t,[[0,0],[.15,-.1],[.15+1/12,.4],[.15+2/12,.8],[.15+3/12,1.15],[.7,1]])+settle(t,1.66,{amp:.08,freq:4,decay:5});
  figure(s,300,330,380,'stand',{ink:Y,seed:88,face:-1,shade:G});
  figure(s,-160,330,380,'beckon',{ink:P,seed:89,face:1,k:clamp(lg,0,1.2),shade:G});
  figure(s,-520,330,340,'stand',{ink:G,seed:90,face:1,shade:K});
  // the triangle of bands (ch 5) in the circle
  const tri:Pt[]=[[-110,120],[90,-40],[130,140]];band(s,[P,Y],tri[0],tri[1],34,90);band(s,[Y,G],tri[1],tri[2],34,91);band(s,[G,P],tri[2],tri[0],34,92);
  paintBall(s,60,300,44,{seed:99});
  // New: an orange figure no single plate owns — pink and yellow print it in the same place — walks in from the right into the torn gap
  const come=t<4.86?0:anticipate(4.86,5.66,t,{back:.08,hold:.2,e:easeIn}),nx=lerp(1100,640,clamp(come))+settle(t,5.66,{amp:10,freq:5,decay:6});
  if(t<4.86)figure(s,nx,330,360,'stand',{seed:93,ghost:true,cov:.6,face:-1});
  else{const moving=come>0&&come<1;const p=walkPose(t,moving);const fo=figure(s,nx,330,360,p,{ink:P,seed:93,face:-1,cov:.6,outline:false});if(fo)s.fill(Y,fo.body,.6);figure(s,nx,330,360,p,{ink:P,seed:93,face:-1,ghost:true,cov:.9});
   band(s,[P,Y],[nx-100,320],[140,140],34,95,sm(5.66,6.1,t,easeOut));}
  s.restore();
  chips(s,'paper',920,-200,6,96,tt-3.74,{up:200});chips(s,K,-160,-60,3,97,tt-.5,{size:18});chips(s,Y,640,330,3,98,tt-5.66,{size:18});
 },
 still:7.4,
};

export const story:RisoStory={
 id:'place-picture',format:'7v7',title:'A Place in the Picture',theme:'Belonging as yourself',ageNote:'An explanation of belonging, being yourself and welcoming teammates.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',pink:'#ff48b0',green:'#00a95c',navy:'#22366b'},order:['yellow','pink','green','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:[
  {label:'A place for you',narration:'Do you ever feel you need to be like everyone else to belong? Think of a picture made from many different colours.',seconds:8.7,audio:CH+'1.m4a',cues:[{at:0,words:'Do you ever'},{at:1.62,words:'like everyone else'},{at:3.76,words:'Think of a picture'},{at:5.12,words:'many different colours'}]},
  {label:'Different, together',headline:'Different',narration:'If every colour became the same, something would be missing. Your team needs different people too. You can belong without copying someone else.',seconds:11,audio:CH+'2.m4a',cues:[{at:0,words:'If every colour'},{at:2.34,words:'something would be missing'},{at:3.98,words:'Your team needs'},{at:6.9,words:'without copying'}]},
  {label:'Bring yourself',narration:'You might be quiet, full of ideas, quick to move, or good at noticing others. These are things you can bring.',seconds:9.2,audio:CH+'3.m4a',cues:[{at:0,words:'You might be quiet'},{at:1.12,words:'full of ideas'},{at:2.4,words:'quick to move'},{at:3.82,words:'noticing others'},{at:5.38,words:'These are things'}]},
  {label:'Room to learn',headline:'Welcome',narration:'Belonging means being welcomed and treated with respect. You do not have to earn that by scoring goals or getting every pass right.',seconds:10.7,audio:CH+'4.m4a',cues:[{at:0,words:'Belonging means'},{at:2.14,words:'treated with respect'},{at:4.82,words:'earn that by scoring'},{at:7.12,words:'every pass right'}]},
  {label:'Make room for others',headline:'Offer',narration:'In football, bring one strength today. Offer a pass. Share an idea. Invite a teammate into the game. Listen to their ideas too.',seconds:11.1,audio:CH+'5.m4a',cues:[{at:0,words:'In football'},{at:2.66,words:'Offer a pass'},{at:3.92,words:'Share an idea'},{at:5.02,words:'Invite a teammate'},{at:7.26,words:'Listen to their ideas'}]},
  {label:'Still yourself',headline:'Still you',narration:'You can learn new things and still be yourself. A team grows when there is room for each person in the picture.',seconds:9.3,audio:CH+'6.m4a',cues:[{at:0,words:'You can learn'},{at:1.66,words:'still be yourself'},{at:3.54,words:'A team grows'},{at:4.86,words:'room for each person'}]},
 ],
 draw(f){playChapters(story,f,[ch1,ch2,ch3,ch4,ch5,ch6]);},
 touch(s,x,y,age,seed){
  // a pigment blot that overprints with whatever it lands on: pink, with a yellow echo that drifts off-register as it leaves
  const g=age>0?easeOutBack(clamp(age/.25)):1,fade=age>0?1-clamp((age-.5)/.3):1;if(fade<=0)return;
  const pts=handCut(blob(x,y,62*g,58*g,seed,{amp:.12,n:10}),seed+1,10,40);
  s.fill(P,polyPath(pts,true),.6+.3*fade);s.fill(Y,polyPath(pts.map(p=>[p[0]+8+26*(1-fade),p[1]+6+14*(1-fade)] as Pt),true),.45+.3*fade);
  chips(s,'paper',x,y,3,seed+2,age-.15,{life:.5,size:16,up:120});
 },
};
