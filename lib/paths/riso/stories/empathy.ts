/** Emotional Intelligence — riso. Lead material: feelings as wash HALOS around cut-paper pictogram figures — Green (you) with a green
 * halo, Rose (the teammate) with a pink halo, Flare (frustration) an orange torn burst that grows behind a figure; where halos overlap
 * the multiply overprint makes plum, red, olive and a dark triple centre. A feeling sent is a soft ring travelling between figures.
 * Texture (reference level): halos are three stepped flat prints (.7 / .45 / .2) with speckle in the ink, the olive pitch band has torn
 * edges and paper lines at .8, wash-droplet confetti floats in every frame, and the navy furniture (contours, ball, lines) prints at full ink.
 * Inks pink → orange → green → navy on cream. The ball is a wash-halo football (paper disc, faint pentagon net, lagging navy crescent, pink halo).
 * Scenes read only their local time t; all randomness is seeded, so the passage seams stay pixel-continuous. */
import type {Sheet} from '../sheet';
import {type RisoStory,type Scene,playChapters} from '../story';
import {apertureDisc} from '../passage';
import {twos,twosIndex,sm,easeOut,easeIO,easeIn,easeOutBack,linear,key,camKeys,anticipate,settle,spring,clamp,lerp,rng,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,scalePts,circlePath,rectPath,torn,TAU,type Pt} from '../motion';
import {crescent,speedLines,dust,handCut,confetti,contour} from '../shapes';

const CH='/stories/narration/7v7/empathy/';
const K='navy',P='pink',O='orange',G='green';
const cam=(s:Sheet,t:number,K:number[][])=>camKeys(s,t,K);
const jit=(t:number,seed:number,amp:number)=>(hash(twosIndex(t),seed)-.5)*2*amp;

// ---------------- abstract riso figure (bible §1c.4) ----------------
/** A cut-paper player pictogram: a round head disc, a hand-cut torso block, two leg strokes, two arm strokes — no anatomy, no face.
 * (x,y) = the ground point under the body (the seat point for sitting), h = height, face = +1 looks right. Poses blend from `from` by k.
 * ink = the person's role ink (knocked out beneath, navy contour). look turns the head; lookDown drops it; sight prints a paper wedge. */
type Pose='stand'|'run'|'arms'|'up'|'slump'|'step'|'step2'|'listen'|'crouch'|'kick'|'sit'|'sitUp'|'point'|'lean'|'breath';
type PoseParams={tilt:number;head:Pt;legF:Pt;legB:Pt;armF:Pt;armB:Pt;hip:number};
const POSES:Record<Pose,PoseParams>={
 stand:{tilt:0,head:[0,0],legF:[.1,0],legB:[-.1,0],armF:[.2,.27],armB:[-.2,.27],hip:0},
 run:{tilt:.35,head:[.02,0],legF:[.3,-.14],legB:[-.36,-.05],armF:[.28,-.06],armB:[-.3,.1],hip:0},
 arms:{tilt:.05,head:[0,0],legF:[.15,0],legB:[-.15,0],armF:[.42,-.12],armB:[-.42,-.12],hip:0},
 up:{tilt:-.04,head:[0,0],legF:[.12,0],legB:[-.12,0],armF:[.28,-.36],armB:[-.28,-.36],hip:0},
 slump:{tilt:.4,head:[.05,.07],legF:[.06,0],legB:[-.08,0],armF:[.16,.34],armB:[-.02,.34],hip:.02},
 step:{tilt:.26,head:[.01,0],legF:[.32,0],legB:[-.3,0],armF:[.36,.1],armB:[-.3,.14],hip:.06},
 step2:{tilt:.26,head:[.01,0],legF:[-.3,0],legB:[.32,0],armF:[-.3,.14],armB:[.36,.1],hip:.06},
 listen:{tilt:.15,head:[.06,.02],legF:[.12,0],legB:[-.1,0],armF:[.05,-.14],armB:[-.2,.27],hip:0},
 crouch:{tilt:.3,head:[.02,.01],legF:[.24,0],legB:[-.24,0],armF:[.3,.12],armB:[-.28,.16],hip:.12},
 kick:{tilt:-.12,head:[0,0],legF:[.34,-.08],legB:[-.12,0],armF:[.3,0],armB:[-.32,.05],hip:0},
 sit:{tilt:.12,head:[.05,.06],legF:[.34,0],legB:[.3,.04],armF:[.2,.24],armB:[-.06,.27],hip:.27},
 sitUp:{tilt:-.04,head:[0,-.01],legF:[.34,0],legB:[.3,.04],armF:[.3,.08],armB:[-.1,.27],hip:.27},
 point:{tilt:.06,head:[.02,0],legF:[.14,0],legB:[-.1,0],armF:[.46,.04],armB:[-.2,.27],hip:0},
 lean:{tilt:.28,head:[.03,.01],legF:[.26,0],legB:[-.3,-.02],armF:[.3,-.1],armB:[-.28,.14],hip:.03},
 breath:{tilt:-.03,head:[0,-.01],legF:[.12,0],legB:[-.12,0],armF:[.36,-.2],armB:[-.36,-.2],hip:0},
};
type FigOpts={ink?:string;line?:string;seed?:number;face?:1|-1;look?:number;lookDown?:number;k?:number;from?:Pose;cov?:number;shade?:string;sight?:number;dry?:boolean;headBlot?:{ink:string;cov:number;dx?:number;dy?:number}};
type Fig={head:Pt;R:number;handF:Pt;handB:Pt;footF:Pt;chest:Pt};
function figure(s:Sheet,x:number,y:number,h:number,pose:Pose,o:FigOpts={}):Fig|undefined{
 const{ink=G,line=K,seed=1,face=1,look=0,lookDown=0,k=1,from='stand',cov=.92,shade,sight=0,dry=false,headBlot}=o;if(h<8)return;
 const base=POSES[from],p=POSES[pose],L=(a:number,b:number)=>lerp(a,b,k),LP=(a:Pt,b:Pt):Pt=>[lerp(a[0],b[0],k),lerp(a[1],b[1],k)];
 const tilt=L(base.tilt,p.tilt),head=LP(base.head,p.head),legF=LP(base.legF,p.legF),legB=LP(base.legB,p.legB),armF=LP(base.armF,p.armF),armB=LP(base.armB,p.armB),hip=L(base.hip,p.hip);
 const R=h*.165,tw=h*.3,th=h*.38,legL=h*.3,hipY=-legL+hip*h,ca=Math.cos(tilt),sa=Math.sin(tilt);
 const W=(lx:number,ly:number):Pt=>[x+lx*face,y+ly];
 const T=(lx:number,ly:number):Pt=>[lx*ca-ly*sa,hipY+lx*sa+ly*ca];
 const corners=[T(-tw/2,0),T(tw/2,0),T(tw/2,-th),T(-tw/2,-th)].map(q=>W(q[0],q[1]));
 const torsoPts=handCut(corners,seed,h*.025,h*.12),torso=polyPath(torsoPts,true);
 const shF=T(tw*.42,-th+R*.25),shB=T(-tw*.42,-th+R*.25);
 const hc=T(0,-th-R*1.05),headC=W(hc[0]+head[0]*h+look*R*.42,hc[1]+head[1]*h+lookDown*R*.35),headPts=blob(headC[0],headC[1],R,R,seed+2,{amp:.04,n:32});
 const headPath=polyPath(headPts,true);
 const hipF=W(tw*.18,hipY),hipB=W(-tw*.18,hipY);
 const fF=W(legF[0]*h,legF[1]*h),fB=W(legB[0]*h,legB[1]*h);
 const aF=W(shF[0]+armF[0]*h,shF[1]+armF[1]*h),aB=W(shB[0]+armB[0]*h,shB[1]+armB[1]*h);
 const out:Fig={head:headC,R,handF:aF,handB:aB,footF:fF,chest:W(hc[0],hc[1]+R*1.6)};if(dry)return out;
 const limbs=new Path2D();
 limbs.addPath(ribbon([hipF,fF],h*.08,{seed:seed+3,pressure:.4,taper:.25,wobble:1.4}));limbs.addPath(ribbon([hipB,fB],h*.08,{seed:seed+4,pressure:.4,taper:.25,wobble:1.4}));
 limbs.addPath(ribbon([W(shB[0],shB[1]),aB],h*.062,{seed:seed+5,pressure:.4,taper:.35,wobble:1.4}));limbs.addPath(ribbon([W(shF[0],shF[1]),aF],h*.062,{seed:seed+6,pressure:.4,taper:.35,wobble:1.4}));
 const all=new Path2D();all.addPath(torso);all.addPath(headPath);all.addPath(limbs);
 const outl=new Path2D();outl.addPath(ribbon(torsoPts,Math.max(4,h*.022),{seed:seed+7,close:true,pressure:.6,wobble:1.6,gaps:[[.62,.66]]}));outl.addPath(ribbon(headPts,Math.max(4,h*.022),{seed:seed+8,close:true,pressure:.6,wobble:1.4}));
 if(sight>0){const d=face*(look>=0?1:-1),sx=headC[0]+d*R*.6,wedge=polyPath([[headC[0],headC[1]],[sx+d*h*.55,headC[1]-h*.22+lookDown*h*.3],[sx+d*h*.55,headC[1]+h*.12+lookDown*h*.3]],true);s.knockout(wedge,.3*sight);}
 s.knockout(all);s.fill(ink,all,cov);
 if(headBlot){const{ink:bi,cov:bc,dx=0,dy=0}=headBlot;s.save();s.clip(headPath);s.fill(bi,polyPath(blob(headC[0]+dx,headC[1]+dy,R*.55,R*.5,seed+9,{amp:.12,n:16}),true),bc);s.restore();}
 s.fill(line,outl,.9);
 if(shade){const sh=new Path2D();sh.addPath(crescent(headC[0],headC[1],R*.98,[-.35*face,-.4]));sh.addPath(polyPath([corners[0],[lerp(corners[1][0],corners[0][0],.5),lerp(corners[1][1],corners[0][1],.5)],[lerp(corners[2][0],corners[3][0],.5),lerp(corners[2][1],corners[3][1],.5)],corners[3]],true));s.tone(shade,sh,.45);}
 return out;
}
const walkPose=(t:number,moving:boolean):Pose=>moving?(twosIndex(t)%2?'step2':'step'):'stand';
/** The head centre of a standing figure without drawing it (for halos drawn beneath). */
const headOf=(x:number,y:number,h:number,pose:Pose,o:FigOpts={})=>{const hb:Pt=[x,y-h*.68-h*.165*1.05];const p=POSES[pose];return[hb[0]+p.head[0]*h*(o.k??1)*(o.face??1),hb[1]+p.head[1]*h*(o.k??1)] as Pt;};

// ---------------- the material: halos, bursts, the pitch, the ball ----------------
/** A feeling halo: three stepped flat prints (.7 core / .45 / .2 rim) of one ink, hand-cut rims so it reads as a wash printed in steps. sx/sy deform it. */
function halo(s:Sheet,ink:string,cx:number,cy:number,r:number,cov:number,o:{sx?:number;sy?:number;seed?:number;steps?:number[]}={}){
 const{sx=1,sy=1,seed=1,steps=[1,.78,.52]}=o;if(r<=4||cov<=.03)return;
 const covs=[cov*.3,cov*.64,cov];
 steps.forEach((k,i)=>{const pts=scalePts(handCut(blob(cx,cy,r*k,r*k,seed+i,{amp:.06,n:20}),seed+i+5,r*.03,r*.35),sx,sy,cx,cy),path=polyPath(pts,true);s.knockout(path,Math.min(.9,covs[i]*1.1));s.tone(ink,path,covs[i]);});
}
/** A wash ring: a soft annulus (two stepped bands). */
function washRing(s:Sheet,ink:string,cx:number,cy:number,r:number,w:number,cov:number){
 if(r<=2||cov<=.03)return;const ann=(r0:number,r1:number,c:number)=>{const p=new Path2D();p.addPath(polyPath(blob(cx,cy,r1,r1,7,{amp:.03,n:36}),true));const q=[...blob(cx,cy,r0,r0,8,{amp:.03,n:36})].reverse();p.moveTo(q[0][0],q[0][1]);for(let i=1;i<q.length;i++)p.lineTo(q[i][0],q[i][1]);p.closePath();s.tone(ink,p,c);};
 ann(r-w*.4,r+w*.4,cov);ann(r-w,r+w,cov*.5);
}
/** Flare: the orange torn burst — a jagged 8-point star that grows (g 0..1) behind a figure, with speed streaks toward dir. */
function burst(s:Sheet,x:number,y:number,r:number,g:number,o:{seed?:number;dir?:number;streaks?:number;cov?:number;n?:number}={}){
 const{seed=1,dir=0,streaks=0,cov=.8,n=8}=o;if(g<=0)return;const rr=rng(seed),pts:Pt[]=[];
 for(let i=0;i<n*2;i++){const a=i/(n*2)*TAU+(rr()-.5)*.2,rad=(i%2?.48:1)*r*g*(.85+rr()*.3);pts.push([x+Math.cos(a)*rad,y+Math.sin(a)*rad]);}
 const p=polyPath(handCut(pts,seed+1,r*.03,60),true);s.knockout(p,.6);s.fill(O,p,cov);
 if(streaks>0)speedLines(s,O,x+Math.cos(dir)*r*.6,y+Math.sin(dir)*r*.6,dir,{n:5,seed:seed+2,len:r*1.1,spread:r*.6,width:22,cov:Math.min(.7,cov)*streaks});
}
/** The olive pitch band: a torn green .55 band across the whole width with paper lines at .8 (a halfway line, a box, the touchlines). loosen spreads the lines. */
function pitchBand(s:Sheet,cx:number,cy:number,w:number,h:number,o:{loosen?:number;lines?:number;seed?:number;bright?:number;cov?:number}={}){
 const{loosen=1,lines=1,seed=1,bright=0,cov=.55}=o,pts=torn(cx-w/2,cy-h/2,w,h,seed,26,60),path=polyPath(pts,true);
 s.tone(G,path,cov+bright);s.tone(O,polyPath(torn(cx-w/2,cy-h/2,w,h,seed+1,26,60),true),.12);
 if(lines<=0)return;const L=(q:Pt[],sd:number)=>s.knockout(ribbon(partial(smoothPts(q,false,20),lines),12,{seed:sd,wobble:1.4,taper:.2,step:30}),.8);
 L([[cx,cy-h*.4*loosen],[cx,cy+h*.4*loosen]],seed+2);L([[cx+w*.5,cy-h*.2*loosen],[cx+w*.32*loosen,cy-h*.2*loosen],[cx+w*.32*loosen,cy+h*.2*loosen],[cx+w*.5,cy+h*.2*loosen]],seed+3);
 L([[cx-w*.5,cy-h*.4*loosen],[cx+w*.5,cy-h*.4*loosen]],seed+4);L([[cx-w*.5,cy+h*.4*loosen],[cx+w*.5,cy+h*.4*loosen]],seed+5);
}
/** The wash-halo football: a paper disc with a faint pentagon net, a navy crescent shadow that lags behind (lagX, lagY), a navy contour and a soft pink halo. */
function haloBall(s:Sheet,x:number,y:number,r:number,o:{lagX?:number;lagY?:number;seed?:number;sx?:number;sy?:number;rot?:number;haloInk?:string}={}){
 const{lagX=0,lagY=0,seed=1,sx=1,sy=1,rot=0,haloInk=P}=o,pts=scalePts(blob(x,y,r,r,seed,{amp:.03,n:32}),sx,sy,x,y),d=polyPath(pts,true);
 s.tone(haloInk,polyPath(blob(x,y,r*1.7,r*1.7,seed+4,{amp:.05,n:24}),true),.2);
 s.knockout(d,.95);s.save();s.clip(d);
 const pent=(cx:number,cy:number,pr:number,a0:number)=>{const q:Pt[]=[];for(let i=0;i<5;i++){const a=a0+i/5*TAU;q.push([cx+Math.cos(a)*pr,cy+Math.sin(a)*pr]);}return polyPath(q,true);};
 const pp=new Path2D();pp.addPath(pent(x,y,r*.3,rot));for(let i=0;i<5;i++){const a=rot+Math.PI/5+i/5*TAU;pp.addPath(pent(x+Math.cos(a)*r*.86,y+Math.sin(a)*r*.86,r*.26,a+Math.PI));}s.fill(K,pp,.45);
 s.tone(K,crescent(x+lagX,y+lagY,r*1.05,[-.4,-.45]),.45);s.restore();
 s.fill(K,ribbon(pts,Math.max(3,r*.08),{close:true,seed:seed+1,wobble:.8,taper:0,pressure:.3}),1);
}
/** Wash droplets: small soft dots scattered around a centre; `push` drives them outward (squeezed, breathing), settling by seed. */
function droplets(s:Sheet,ink:string,cx:number,cy:number,r0:number,n:number,seed:number,push:number,o:{size?:number;cov?:number}={}){
 const{size=22,cov=.6}=o,rr=rng(seed),p=new Path2D();
 for(let i=0;i<n;i++){const a=rr()*TAU,d=r0*(.6+rr()*.8)+push*(80+rr()*160),sz=size*(.5+rr()),x=cx+Math.cos(a)*d,y=cy+Math.sin(a)*d;p.moveTo(x+sz,y);p.arc(x,y,sz,0,TAU);}
 s.tone(ink,p,cov);
}
/** The once-only speech balloon: a torn paper balloon with a tail from a head, one wash ring inside. */
function balloon(s:Sheet,x:number,y:number,w:number,h:number,u:number,rise:number,seed:number,from:Pt){
 if(u<=0)return;const g=easeOutBack(u);s.save();s.translate(x,y);s.scale(g,g);
 const pts=torn(-w/2,-h/2,w,h,seed,10,30),p=polyPath(pts,true);s.knockout(p,.95);
 const tail=polyPath([[ -w*.2,h*.4],[(from[0]-x)/g,(from[1]-y)/g],[-w*.05,h*.45]],true);s.knockout(tail,.95);
 contour(s,K,pts,7,{close:true,seed:seed+1,pressure:.5,wobble:1.4});
 washRing(s,G,0,h*.25-rise*h*.5,h*.22,h*.12,.7);s.restore();
}

// ---------------- chapters ----------------
/** 1 — the pitch: Green and Rose with their halos; Flare bursts behind Green and it rushes the ball off the pitch; Rose's ring brings it back. */
const ch1:Scene={
 draw(s,t){
  const tt=twos(t);
  const v=cam(s,t,[[0,0,60,1],[2.62,0,60,1],[3.2,80,60,1.1],[3.75,80,60,1.1],[4.45,400,60,1.15],[4.7,360,60,1.15],[5.04,360,60,1.15],[6.04,200,60,1.2],[6.4,200,60,1.2],[7.6,40,60,1.3],[8.717,20,60,1.9],[9.367,20,60,1.95]]);
  s.camera(v[0],v[1],v[2],v[3]+.03*sm(2.62,3.1,t)*(1-sm(3.2,3.8,t)));
  s.field(O,.16,.5);s.tone(P,polyPath(torn(-2000,560,4000,1400,10,40,80),true),.3);
  pitchBand(s,0,120,1800,1000,{seed:11});
  confetti(s,['paper',P,G],[-1000,-700,2000,1400],16,12,{size:26});
  // halos breathe once; Green's is squashed by Flare, springs back when the ring arrives
  const br=sm(0,.4,t,easeIn)*(1-sm(.4,.8,t,easeOut))*25-10*sm(0,.2,t)*(1-sm(.2,.4,t)),press=t<5.04?sm(2.82,3.42,t,easeIn):clamp(1-spring(t-5.04,2.2,.5),-.15,1);
  const surge=t<2.62?0:anticipate(2.62,3.22,t,{back:.05,hold:.2,e:easeIn}),bounce=t>=3.22?settle(t,3.22,{amp:20,freq:4,decay:5}):0,recede=sm(5.04,5.84,t,easeOut);
  const gx=-280+40*press,gh=400,rx=320;
  const leanK=t<2.62?0:clamp(press),kickA=t>=1&&t<1.5?sm(1,1.12,t,easeIn)*(1-sm(1.3,1.5,t)):t>=1.8&&t<2.3?sm(1.8,1.92,t,easeIn)*(1-sm(2.1,2.3,t)):0;
  const gPose:Pose=leanK>0?'lean':kickA>0?'kick':'stand',gHead=headOf(gx,300,gh,gPose,{k:leanK>0?leanK:kickA>0?kickA:1});
  halo(s,G,gHead[0],gHead[1]+40,260+br,.7,{sx:1-.18*press,sy:1+.1*press,seed:13});
  const rHead=headOf(rx,300,380,'stand');halo(s,P,rHead[0],rHead[1]+40,250+br,.7,{seed:14,sx:1-.04*sm(5.04,5.24,t)*(1-sm(5.24,5.6,t))});
  // Flare: the orange burst grows behind Green on "Frustration", streaks toward the ball, recedes after encouragement
  if(t>=2.62)burst(s,gx-120+bounce,gHead[1]+60,360,clamp(surge)*(1-recede*.8),{seed:15,dir:0,streaks:1-recede,cov:lerp(.85,.3,recede)});
  figure(s,gx,300,gh,gPose,{ink:G,seed:16,face:1,k:leanK>0?leanK:kickA>0?kickA:1,shade:K});
  figure(s,rx,300,380,t>=5.04&&t<5.8?'point':'stand',{ink:P,seed:17,face:-1,k:t>=5.04&&t<5.8?sm(5.04,5.24,t,easeOutBack):1,shade:K});
  // the ball: dribbled, squeezed out, rushes with a smear and a lagging shadow, ring arrives, rolls back calmly
  let dx=-200,dy=300,lagX=0,sx=1;
  const out=sm(3.1,3.42,t,easeOut),rush=t<3.6?0:anticipate(3.6,3.9,t,{back:.1,hold:.3,e:easeIn}),skid=t>=3.9?settle(t,3.9,{amp:30,freq:3,decay:5}):0,back=sm(6.5,7.4,t);
  if(t<3.6){dx=-200+40*(kickA>0?1:0)*sm(1.12,1.3,t)+40*sm(1.92,2.1,t)+80*out;}
  else if(t<6.5){dx=lerp(-80,560,clamp(rush,-.2,1))+skid;dy=lerp(300,320,clamp(rush));lagX=-40*sm(3.75,3.95,t)*(1-sm(3.95,4.3,t,easeIn));if(tt>=3.75&&tt<3.9)sx=1.6;}
  else{dx=lerp(560,-200,back);dy=lerp(320,300,back);}
  const bump=t>=7.4?settle(t,7.4,{amp:.06,freq:4,decay:5,phase:Math.PI/2}):0;
  if(t>=3.75&&t<4.2)speedLines(s,K,dx-60,dy,0,{n:4,seed:18,len:260,spread:40,width:10,cov:.5*(1-sm(3.9,4.2,t))});
  haloBall(s,dx,dy,52,{lagX,seed:19,sx:sx*(1+bump),sy:1-bump,rot:dx*.01});
  // Rose sends a ring to Green and it closes around it
  const ringU=sm(5.24,5.94,t,easeOut);if(ringU>0){const rxx=lerp(rHead[0],gHead[0],ringU),ryy=lerp(rHead[1],gHead[1],ringU),rr=lerp(280,150,ringU);washRing(s,P,rxx,ryy,rr,60,.75);}
  droplets(s,P,rx,200,300,8,20,br/25*.6+press*.4-back*.3,{size:20});droplets(s,G,gx,200,260,8,21,br/25*.5,{size:18});
 },
 aperture(){return apertureDisc(-200,300,40,12);},
};
/** 2 — two big figures face to face, halos overlapping to plum: Green notices its own feeling (head down), then the other's (head turns); guesses bloom and fade. */
const ch2:Scene={
 draw(s,t){
  const tt=twos(t);
  const v=cam(s,t,[[0,0,-60,1],[3.26,0,-60,1],[3.76,-240,-40,1.15],[4.4,-240,-40,1.15],[4.9,260,-40,1.15],[5.6,260,-40,1.15],[6.6,200,-20,1.25],[7.6,200,-20,1.25],[8.8,0,0,1.3],[9.6,0,0,1.3],[10.517,0,-180,2],[11.167,0,-180,2.05]]);
  s.camera(v[0],v[1],v[2],v[3]);
  s.field(O,.14,.5);
  s.tone(G,polyPath(torn(-2000,300,4000,1400,22,40,80),true),.3);
  confetti(s,['paper',P,O],[-1100,-900,2200,1800],18,23,{size:28});
  // the two figures travel together until their halos overlap (plum); the one being looked at brightens
  const joinU=anticipate(0,.8,t,{back:.05,hold:.25}),ov=t>=.8?settle(t,.8,{amp:8,freq:4,decay:5}):0;
  const gx=lerp(-620,-330,clamp(joinU))-ov,rx=lerp(620,330,clamp(joinU))+ov,gh=600,rh=560;
  const lookSelf=sm(1.2,1.6,t,easeOut)*(1-sm(2.6,3.0,t)),lookL=sm(3.26,3.76,t),lookR=sm(4.4,4.9,t),look=key(t,[[3.1,0],[3.26,-.1],[3.76,-.6],[4.4,-.6],[4.9,.7],[9.6,.7],[10.2,0]]);
  const selfPulse=t>=1.6?.1*Math.max(0,settle(t,1.6,{amp:1,freq:2,decay:2})):0;
  const gHead=headOf(gx,420,gh,'stand'),rHead=headOf(rx,420,rh,'stand');
  halo(s,G,gHead[0],gHead[1]+60,460,.7+.12*lookL-.05*lookR+selfPulse,{seed:24});
  halo(s,P,rHead[0],rHead[1]+60,440,.7+.12*lookR-.05*lookL,{seed:25});
  figure(s,gx,420,gh,'listen',{ink:G,seed:26,face:1,k:clamp(lookR),look:look,lookDown:lookSelf,sight:Math.max(lookSelf,lookR)*(1-sm(9.6,10.2,t)),shade:K});
  figure(s,rx,420,rh,t>=7.6?'arms':'stand',{ink:P,seed:27,face:-1,k:t>=7.6?sm(7.6,8,t,easeOutBack):1,shade:K});
  // the overlap prints a dark plum centre once they have joined
    droplets(s,K,0,-100,340,10,29,clamp(joinU)*.6,{size:16,cov:.4});
  // three orange guess bursts bloom over Rose's head, jitter, and fade on "do not have to guess"; a plum path grows Green → Rose
  const bloom=sm(5.6,6.2,t,easeOut),fade=1-sm(7.6,8.2,t,easeIn),jitter=t>=6.2?(t<7.6?4:8*(1-sm(7.6,7.75,t))):0;
  if(bloom>0&&fade>0)[[rHead[0]-60,rHead[1]-260],[rHead[0]+180,rHead[1]-180],[rHead[0]+60,rHead[1]-360]].forEach(([bx,by],i)=>burst(s,bx+jit(t,30+i,jitter),by+jit(t,33+i,jitter),130,bloom,{seed:36+i,cov:.8*fade,n:6}));
  const route=sm(7.8,8.6,t,easeOut);if(route>0){const pts=partial(smoothPts([[gHead[0]+80,gHead[1]+120],[-80,-40],[80,-90],[rHead[0]-80,rHead[1]+120]],false,10),route),rb=ribbon(pts,60,{seed:38,wobble:1.5,taper:.4,pressure:.3});s.knockout(rb,.8);s.tone(P,rb,.5);s.tone(G,rb,.5);}
 },
 aperture(){return apertureDisc(0,-180,60,12);},
};
/** 3 — three halos with a small figure in each: Green and Rose travel into overlap; Flare rises and changes every colour; Green moves aside to make space. */
const ch3:Scene={
 draw(s,t){
  const v=cam(s,t,[[0,0,0,1],[2.5,0,0,1.05],[3.7,0,80,1.15,-.05],[5.52,0,80,1.15,-.05],[6.52,60,60,1.1,0],[8,60,60,1.1,0],[9.617,300,20,1.8,0],[10.267,300,20,1.85,0]]);
  s.camera(v[0],v[1],v[2],v[3]+.03*sm(2.7,3.1,t)*(1-sm(3.1,3.6,t)));
  s.field(O,.12,.5);
  s.tone(P,polyPath(torn(-2200,-1500,4400,700,31,50,80),true),.35);
  confetti(s,['paper',G,P],[-1100,-900,2200,1800],20,32,{size:30});
  const join=anticipate(0,.9,t,{back:.04,hold:.2}),ov=t>=.9?settle(t,.9,{amp:20,freq:3.5,decay:4}):0,flareU=t<2.5?0:anticipate(2.5,3.3,t,{back:.03,hold:.25,e:easeOut}),fov=t>=3.3?settle(t,3.3,{amp:30,freq:3,decay:4}):0;
  const nudge=20*sm(3,3.5,t),room=t<5.52?0:anticipate(5.52,6.32,t,{back:.05,hold:.25,e:easeOut}),rov=t>=6.32?settle(t,6.32,{amp:15,freq:3,decay:4}):0;
  const gx=lerp(-560,-300,clamp(join))-ov-nudge-220*clamp(room)-rov,rx=lerp(560,300,clamp(join))+ov+nudge,fy=lerp(760,320,clamp(flareU))+fov;
  halo(s,G,gx,0,460,.7,{seed:33});halo(s,P,rx,0,460,.7,{seed:34});
  if(t>=2.5)halo(s,O,0,fy,420,.7,{seed:35});
  const gMoving=(join>0&&join<1)||(room>0&&room<1);
  figure(s,gx,110,230,gMoving?walkPose(t,true):'stand',{ink:G,seed:36,face:join<1?1:-1,shade:K});
  figure(s,rx,110,230,join>0&&join<1?walkPose(t,true):'stand',{ink:P,seed:37,face:-1,shade:K});
  if(t>=2.5)figure(s,0,fy+110,230,flareU>0&&flareU<1?'run':'stand',{ink:O,seed:38,face:1,k:flareU>0&&flareU<1?1:.2,shade:K});
  droplets(s,K,0,0,200,10,39,clamp(join)*.8,{size:16,cov:.4});
  droplets(s,P,60,40,120,4,40,clamp(room)*.7,{size:24,cov:.6});
 },
 aperture(){return apertureDisc(300,20,90,12);},
};
/** 4 — duotone pink + navy: Rose sits on the pitch, head down; Green walks up, kneels, asks with a paper balloon, then listens before the advice. */
const ch4:Scene={
 draw(s,t){
  const tt=twos(t),duo=t<5.44;
  const v=cam(s,t,[[0,60,80,1],[1.5,60,80,1.04],[1.6,60,80,1.04],[3.2,160,100,1.15],[5.44,160,100,1.15],[6.24,100,80,1.2],[6.92,100,80,1.2],[7.62,300,120,1.25],[8.8,300,120,1.25],[9.517,-40,80,1.9],[10.167,-40,80,1.95]]);
  s.camera(v[0],v[1],v[2],v[3]);
  s.field(P,.14,.4);
  const gInk=duo?K:G;
  // the pitch (navy in the duotone): lines wash in, tips leading
  const lines=sm(0,.6,t,easeOut);
  const pts=torn(-900,-360,1800,900,41,26,60),path=polyPath(pts,true);s.tone(gInk,path,duo?.3:.45);
  if(lines>0){const L=(q:Pt[],sd:number)=>s.knockout(ribbon(partial(smoothPts(q,false,20),lines),12,{seed:sd,wobble:1.4,taper:.2,step:30}),.8);L([[0,-170],[0,330]],42);L([[790,-60],[500,-60],[500,220],[790,220]],43);L([[-800,-170],[800,-170]],44);L([[-800,330],[800,330]],45);}
  if(t<.8)dust(s,null,0,80,700,16,{seed:46,size:8,cov:.6*(1-sm(.3,.8,t))});
  confetti(s,['paper',K],[-1000,-800,2000,1600],14,47,{size:24});
  // Rose sits at the right, head down, halo dim; a navy shadow spreads beneath her; her tone lifts as she is asked and listened to
  const roseCov=key(t,[[0,.45],[.6,.35],[5.44,.35],[6.2,.45],[6.92,.45],[7.6,.5],[8.8,.5],[9.4,.6]]),shadow=sm(1.6,2.2,t,easeOut),lift=sm(8.8,9.4,t,easeOutBack);
  const rHead=headOf(430,300,320,'sit');
  if(shadow>0)halo(s,K,430,280,260*shadow,.35,{seed:48,sx:1.2,sy:.5});
  halo(s,P,rHead[0],rHead[1]+30,230,roseCov,{seed:49});
  figure(s,430,300,320,lift>0?'sitUp':'sit',{ink:P,seed:50,face:-1,from:'sit',k:lift,shade:K});
  // Green walks up, stops 120 u short, kneels to Rose's level, contracts before asking
  const walk=sm(.2,1.5,t,easeIO),gx=lerp(-520,150,walk),kneel=sm(3.2,3.7,t,easeOut),con=.04*sm(5.24,5.44,t)*(1-sm(5.44,5.9,t));
  const listen=sm(6.92,7.3,t,easeOutBack);
  const gPose:Pose=walk<1?walkPose(t,true):listen>0?'listen':kneel>0?'crouch':'stand';
  const gHead=headOf(gx,300,380,gPose,{k:listen>0?listen:kneel>0?kneel:1});
  halo(s,gInk,gHead[0],gHead[1]+40,260*(1-con),duo?.45:.7,{seed:51});
  const fg=figure(s,gx,300,380,gPose,{ink:gInk,seed:52,face:1,k:listen>0?listen:kneel>0?kneel:1,look:listen*.7,from:kneel>0&&listen>0?'crouch':'stand',shade:K});
  // the balloon (once): a torn paper speech balloon from Green's head toward Rose, stopping 120 u short
  const bub=sm(5.44,6.04,t,easeOut)*(1-sm(6.92,7.3,t,easeIn)),bob=t>=6.04?6*settle(t,6.04,{amp:1,freq:3,decay:3}):0;
  if(bub>0&&fg)balloon(s,lerp(gx+60,290,bub),lerp(gHead[1]-140,gHead[1]-200,bub)+bob,300,180,bub,sm(5.6,6.6,t),53,[fg.head[0]+fg.R*.6,fg.head[1]-fg.R*.4]);
  // the advice (orange burst) starts out from Green's chest and is pulled back while Green listens
  const adv=t<6.92?0:sm(6.92,7.12,t,easeOut)*(1-sm(7.12,7.62,t,easeIn));if(adv>0&&fg)burst(s,fg.chest[0]+200*adv,fg.chest[1],90,adv,{seed:54,cov:.6,n:6});
  // Rose answers: a faint pink ring travels to Green's head
  const ans=sm(8.8,9.4,t,easeOut);if(ans>0)washRing(s,P,lerp(rHead[0],gHead[0],ans),lerp(rHead[1],gHead[1],ans),lerp(200,120,ans),50,.5);
  droplets(s,P,430,200,300,8,55,0,{size:16,cov:.4});
 },
 aperture(){return apertureDisc(-40,80,60,12);},
};
/** 5 — the pitch centre: Green kneels and rolls the ball to a spot beside Rose (an offer); a plum ring encourages; Green steps back and a gap opens. */
const ch5:Scene={
 draw(s,t){
  const tt=twos(t);
  const v=cam(s,t,[[0,0,100,1],[2.2,0,100,1.1],[3.24,0,100,1.1],[4.04,160,80,1.2],[5.38,160,80,1.2],[6.38,100,100,1.15],[7.2,100,100,1.15],[8.317,140,220,2],[8.967,140,220,2.05]]);
  s.camera(v[0],v[1],v[2],v[3]);
  s.field(O,.16,.5);s.tone(P,polyPath(torn(-2000,600,4000,1400,60,40,80),true),.3);
  const room=sm(5.53,6.33,t,easeOut);
  pitchBand(s,0,120,2400,1000,{seed:61,loosen:1+.04*room});
  confetti(s,['paper',P,O],[-1100,-800,2200,1600],16,62,{size:26});
  const swell=.04*sm(0,.2,t)*(1-sm(.2,.6,t)),roseCov=key(t,[[0,.55],[.8,.6],[3.84,.65]]),roseX=320+40*sm(7.2,7.8,t);
  // Green: kneels and rolls the ball (arm extended = the offer), stands up, then steps back two strides on "Respect their space"
  const kneel=sm(.2,.6,t,easeOut)*(1-sm(1.6,2.1,t)),offer=sm(.9,1.2,t,easeOutBack)*(1-sm(2.1,2.5,t)),reach=10*sm(5.38,5.53,t)*(1-sm(5.53,6,t));
  const backU=t<5.53?0:anticipate(5.53,6.33,t,{back:.06,hold:.2}),gx=-300+reach-180*clamp(backU),moving=backU>0&&backU<1;
  const gPose:Pose=moving?walkPose(t,true):offer>0?'point':kneel>0?'crouch':'stand',gk=offer>0?offer:kneel>0?kneel:1;
  const gHead=headOf(gx,300,400,gPose,{k:gk});
  halo(s,G,gHead[0],gHead[1]+40,270*(1+swell),.7,{seed:63});
  const rHead=headOf(roseX,300,380,'stand');halo(s,P,rHead[0],rHead[1]+40,250,roseCov,{seed:64});
  const fg=figure(s,gx,300,400,gPose,{ink:G,seed:65,face:moving?-1:1,k:gk,shade:K});
  if(fg&&offer>0)s.knockout(polyPath(blob(fg.handF[0]+18*offer,fg.handF[1],22*offer,16*offer,66,{amp:.08,n:14}),true),.95);
  figure(s,roseX,300,380,t>=4.04&&t<4.8?'arms':'stand',{ink:P,seed:67,face:-1,k:t>=4.04&&t<4.8?.5*sm(4.04,4.3,t,easeOutBack):1,shade:K});
  // the gap: a paper band opens between them on "Respect their space"
  if(room>0)s.knockout(polyPath(handCut(blob(60,120,60*room,220*room,68,{amp:.06,n:16}),69,8,40),true),.7*room);
  // the lane and the ball: rolled slowly to a spot beside Rose, offered, not forced
  const lane=sm(.6,.9,t,easeOut),roll=sm(.9,1.6,t,easeOut),dx=lerp(-200,170,roll),dy=lerp(310,290,roll)-14*Math.sin(roll*Math.PI),bob=t>=1.6?settle(t,1.6,{amp:.05,freq:4,decay:4,phase:Math.PI/2}):0;
  if(lane>0)s.knockout(ribbon([[-200,310],[lerp(-200,170,lane),lerp(310,290,lane)]],36,{seed:70,wobble:1.6,taper:.3}),.5);
  haloBall(s,dx,dy,52,{seed:71,lagX:-18*(roll>0&&roll<1?1:0),sx:1+bob,sy:1-bob,rot:dx*.01});
  // the encouraging word: a plum ring pulses from the hand and closes around Rose
  const ringU=sm(3.44,4.04,t,easeOut);if(ringU>0&&fg){const rx=lerp(fg.handF[0],rHead[0],ringU),ry=lerp(fg.handF[1],rHead[1],ringU),rr=lerp(120,300,ringU);washRing(s,P,rx,ry,rr,50,.7);washRing(s,G,rx,ry,rr,50,.7);}
  droplets(s,P,roseX,120,200,6,72,room*.5,{size:16,cov:.4});
 },
 aperture(t){const roll=sm(.9,1.6,t,easeOut);return apertureDisc(lerp(-200,170,roll)-10,lerp(310,290,roll)-14*Math.sin(roll*Math.PI)-8,22,10);},
};
/** 6 — Green alone at 1.4× breathes; the Flare blot in its head settles on the exhale; Rose walks in, the halos join; the ball rolls to the centre. */
const ch6:Scene={
 draw(s,t){
  const v=cam(s,t,[[0,0,60,.8],[.15,10,60,.8],[.75,-200,80,1],[2.38,-200,80,1],[4.78,-160,80,.96],[5.2,-160,80,.96],[6.2,40,60,1.1],[7.38,40,60,1.1],[8.78,40,60,1.3,.035],[9,40,60,1.3,.035],[10.065,40,60,1.4,.035]]);
  s.camera(v[0],v[1],v[2],v[3]);
  s.field(O,.16,.5);s.tone(P,polyPath(torn(-2000,620,4000,1400,70,40,80),true),.3);
  const inh=sm(2.38,2.63,t),exh=sm(2.63,3.83,t,easeIO),rel=sm(3.83,5.03,t,easeOut),breath=lerp(lerp(1,.96,inh),lerp(1.19,1.05,rel),exh);
  const join=t<7.38?0:anticipate(7.38,8.18,t,{back:.04,hold:.25}),ov=t>=8.18?settle(t,8.18,{amp:20,freq:3.5,decay:4}):0;
  pitchBand(s,0,140,2400,1000,{seed:71,loosen:1+.06*(breath-1)/.19,bright:.1*sm(8,8.6,t)});
  confetti(s,['paper',G,P],[-1100,-800,2200,1600],16,72,{size:26});
  const gx=lerp(-220,-140,clamp(join))-ov,gh=520,lookG=sm(.15,.75,t);
  const walkIn=sm(5.95,6.75,t,easeIO),rx=lerp(900,260,walkIn)+ov+40*(breath-1)*5*(1-walkIn),rMoving=walkIn>0&&walkIn<1;
  // Green breathes: arms rise on the inhale and sink on the long exhale; the halo swells and settles
  const armK=t<2.38?0:inh*(1-exh)+.3*exh*(1-rel);
  const gPose:Pose=armK>0?'breath':'stand',gHead=headOf(gx,340,gh,gPose,{k:armK});
  halo(s,G,gHead[0],gHead[1]+60,330*breath,.55+.15*lookG,{seed:74});
  if(walkIn>0){const rHead=headOf(rx,340,440,'stand');halo(s,P,rHead[0],rHead[1]+50,280*(1+.3*(breath-1)),.7,{seed:75});}
  // the Flare blot inside Green's head disc, revealed by the pan, jittering until the exhale settles it
  const blotCov=lerp(.75,.15,exh),jitter=t<2.63?5:0;
  figure(s,gx,340,gh,gPose,{ink:G,seed:76,face:1,k:armK,shade:K,headBlot:lookG>.5?{ink:O,cov:blotCov,dx:jit(t,77,jitter),dy:jit(t,78,jitter)}:undefined});
  // a green ring to Rose (asking for help); Rose walks in and reaches; the plum deepens as they join; the ball rolls into the centre
  const ringU=sm(5.35,5.95,t,easeOut);if(ringU>0&&t<7.38){washRing(s,G,lerp(gHead[0],700,ringU),lerp(gHead[1],80,ringU),lerp(300,200,ringU),60,.7);}
  if(walkIn>0)figure(s,rx,340,440,rMoving?walkPose(t,true):join>0?'arms':'stand',{ink:P,seed:79,face:-1,k:join>0?.6:1,shade:K});
  if(join>.5){const deep=sm(8,8.8,t,easeOut),cx=(gx+rx)/2;s.tone(P,polyPath(blob(cx,80,200*deep,240*deep,80,{amp:.05,n:24}),true),.5);s.tone(G,polyPath(blob(cx,80,200*deep,240*deep,80,{amp:.05,n:24}),true),.5);}
  const roll1=sm(6.1,6.6,t,easeOut),roll2=sm(7.6,8.3,t),dx=t<7.6?lerp(160,120,roll1):lerp(120,40,roll2),dy=t<7.6?320:lerp(320,300,roll2),bump=t>=8.3?settle(t,8.3,{amp:.06,freq:4,decay:5,phase:Math.PI/2}):0;
  haloBall(s,dx,dy,52,{seed:81,sx:1+bump,sy:1-bump,rot:dx*.01});
  droplets(s,P,20,60,340,10,82,(breath-1)*3+clamp(join)*.5,{size:20});droplets(s,G,-200,100,260,8,83,(breath-1)*3,{size:18});
 },
 still:8.9,
};

export const story:RisoStory={
 id:'empathy',format:'7v7',title:'Emotional Intelligence',theme:'Noticing feelings and responding with care',ageNote:'A direct mental-skills explainer; playing format does not define age.',
 spec:{paper:'#f0ece2',inks:{pink:'#ff48b0',orange:'#ff6c2f',green:'#00a95c',navy:'#22366b'},order:['pink','orange','green','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:[
  {label:'WHAT DO YOU NOTICE?',narration:'How can feelings change a football game? Frustration can make you rush. Encouragement can make it easier to try again.',seconds:9.367,audio:CH+'01.m4a',cues:[{at:0,words:'How can feelings'},{at:2.62,words:'Frustration can'},{at:5.04,words:'Encouragement can'}]},
  {label:'UNDERSTAND THE FEELING',headline:'Yours. Theirs.',narration:'Emotional intelligence means noticing feelings in yourself and others, then choosing a thoughtful response. You do not have to guess what everyone thinks.',seconds:11.167,audio:CH+'02.m4a',cues:[{at:0,words:'Emotional intelligence'},{at:3.26,words:'yourself and others'},{at:7.6,words:'do not have to guess'}]},
  {label:'MAKE ROOM TO LISTEN',narration:'Think of overlapping colours. Each changes the picture. Making space to notice another colour helps you understand what is happening.',seconds:10.267,audio:CH+'03.m4a',cues:[{at:0,words:'Think of overlapping'},{at:2.5,words:'Each changes'},{at:5.52,words:'another colour'}]},
  {label:'ASK, THEN LISTEN',headline:{text:'Listen first',at:5.44},narration:'On the pitch, a quiet teammate might feel disappointed, or need a moment. Ask, How are you feeling? Listen before offering advice.',seconds:10.167,audio:CH+'04.m4a',cues:[{at:0,words:'On the pitch'},{at:5.44,words:'How are you feeling'},{at:6.92,words:'Listen before'}]},
  {label:'OFFER SOMETHING USEFUL',headline:{text:'Space',at:5.38},narration:'If they want support, offer a passing option or an encouraging word. Respect their space if they want quiet.',seconds:8.967,audio:CH+'05.m4a',cues:[{at:0,words:'If they want support'},{at:3.24,words:'an encouraging word'},{at:5.38,words:'Respect their space'}]},
  {label:'CARE GOES BOTH WAYS',headline:{text:'You too',at:2.38},narration:'Notice your own feelings too. Take a breath, and ask for help when you need it. Listening and useful actions can strengthen your team.',seconds:10.065,audio:CH+'06.m4a',cues:[{at:0,words:'Notice your own'},{at:2.38,words:'Take a breath'},{at:7.38,words:'strengthen your team'}]},
 ],
 draw(f){playChapters(story,f,[ch1,ch2,ch3,ch4,ch5,ch6]);},
 touch(s,x,y,age,seed){
  // a feeling bloom: a paper halo knocks out first, then the nearest feeling's ink prints inside it with a navy ring; two droplets drift off its rim
  const u=age>0?easeOutBack(clamp(age/.5)):1,fade=age>0?1-clamp((age-.5)/.3):1;if(fade<=0)return;
  const ink=[G,P,O][Math.floor(hash(seed,9)*3)],r=150*u;
  s.knockout(polyPath(blob(x,y,r*1.1,r*1.1,seed+3,{amp:.06,n:24}),true),.9*fade);
  halo(s,ink,x,y,r,.8*fade,{seed});
  contour(s,K,blob(x,y,r*.95,r*.95,seed+1,{amp:.04,n:30}),6,{close:true,seed:seed+1,cov:.8*fade,gaps:[[.3,.4]]});
  const rr=rng(seed+1);for(let i=0;i<3;i++){const a=rr()*TAU,d=r*.9+70*clamp(age/.8);s.fill(ink,circlePath(x+Math.cos(a)*d,y+Math.sin(a)*d,16),.7*fade);}
 },
};
