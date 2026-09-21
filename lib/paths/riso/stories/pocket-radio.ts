/** The Pocket Radio — riso. Lead material: a printed pocket radio — a navy body with a round paper speaker grille (dashed navy
 * arcs inside it and dashed sound arcs leaving it across the sheet), a dial window with an orange station and a pink station and a
 * needle, an antenna, two knobs, a volume bar — and a waveform thread whose bump motif is redrawn per state (jagged / rounded / flat).
 * Legibility pass (bible §1c): the people are cut-paper pictogram figures — a pink figure (you) holding the radio to its ear, a yellow
 * figure (the friend / teammate); the harsh voice is orange, the kinder voice is pink; passes are a paper football with a wave seam.
 * Inks yellow → pink → orange → navy on cream. Scenes read only their local time t; all randomness is seeded, so the seams stay exact. */
import type {Sheet} from '../sheet';
import {type RisoStory,type Scene,playChapters} from '../story';
import {apertureDisc} from '../passage';
import {twos,twosIndex,sm,easeOut,easeIO,easeIn,easeOutBack,linear,key,camKeys,anticipate,settle,spring,clamp,lerp,rng,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,scalePts,circlePath,rectPath,torn,TAU,type Pt} from '../motion';
import {contour,dust,handCut,confetti,sparkBurst,glowDisc,crescent} from '../shapes';

const CH='/stories/narration/7v7/pocket-radio/';
const K='navy',P='pink',O='orange',Y='yellow';
const cam=(s:Sheet,t:number,K:number[][])=>camKeys(s,t,K);
const shake=(t:number,seed:number,amp:number)=>(hash(twosIndex(t),seed)-.5)*2*amp;

// ---------------- abstract riso figure (bible §1c.4) ----------------
/** A cut-paper player pictogram: a big squarish head disc, a hand-cut torso block, two leg strokes, two arm strokes — no anatomy, no face.
 * (x,y) = the ground point under the body, h = height, face = +1 looks right. Poses are parameter tables blended from `from` (stand) by k.
 * ink = the person's role ink (knocked out beneath, navy contour). reach/reachB = world points the arms end at; look turns the head (−1..1
 * sideways, lookUp lifts it); sight prints a paper wedge in the look direction; sq squashes the head (a stamp). */
type Pose='stand'|'run'|'arms'|'up'|'slump'|'step'|'step2'|'listen'|'crouch'|'kick'|'hold'|'point'|'pressed';
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
 hold:{tilt:.04,head:[.02,0],legF:[.12,0],legB:[-.1,0],armF:[.22,-.3],armB:[-.18,.27],hip:0},
 point:{tilt:.02,head:[.02,0],legF:[.14,0],legB:[-.1,0],armF:[.46,-.02],armB:[-.2,.27],hip:0},
 pressed:{tilt:.32,head:[.04,.06],legF:[.16,0],legB:[-.04,0],armF:[.1,.3],armB:[-.14,.3],hip:.05},
};
type FigOpts={ink?:string;line?:string;seed?:number;face?:1|-1;look?:number;lookUp?:number;k?:number;from?:Pose;cov?:number;reach?:Pt;reachB?:Pt;shade?:string;sight?:number;sq?:number;scale?:number};
type Fig={head:Pt;R:number;handF:Pt;handB:Pt;footF:Pt;chest:Pt};
function figure(s:Sheet,x:number,y:number,h:number,pose:Pose,o:FigOpts={}):Fig|undefined{
 const{ink=P,line=K,seed=1,face=1,look=0,lookUp=0,k=1,from='stand',cov=.92,reach,reachB,shade,sight=0,sq=0,scale=1}=o;if(h<8)return;
 const base=POSES[from],p=POSES[pose],L=(a:number,b:number)=>lerp(a,b,k),LP=(a:Pt,b:Pt):Pt=>[lerp(a[0],b[0],k),lerp(a[1],b[1],k)];
 const tilt=L(base.tilt,p.tilt),head=LP(base.head,p.head),legF=LP(base.legF,p.legF),legB=LP(base.legB,p.legB),armF=LP(base.armF,p.armF),armB=LP(base.armB,p.armB),hip=L(base.hip,p.hip);
 const R=h*.16,tw=h*.3,th=h*.38,legL=h*.3,hipY=-legL+hip*h,ca=Math.cos(tilt),sa=Math.sin(tilt);
 const W=(lx:number,ly:number):Pt=>[x+lx*face*scale,y+ly*scale];
 const T=(lx:number,ly:number):Pt=>[lx*ca-ly*sa,hipY+lx*sa+ly*ca];
 const corners=[T(-tw/2,0),T(tw/2,0),T(tw/2,-th),T(-tw/2,-th)].map(q=>W(q[0],q[1]));
 const torsoPts=handCut(corners,seed,h*.02,h*.12),torso=polyPath(torsoPts,true);
 const shF=T(tw*.42,-th+R*.25),shB=T(-tw*.42,-th+R*.25);
 const hc=T(0,-th-R*1.05),headC=W(hc[0]+head[0]*h+look*R*.42,hc[1]+head[1]*h-lookUp*R*.3),headPts=scalePts(blob(headC[0],headC[1],R*scale,R*.9*scale,seed+2,{amp:.035,n:30}),1+sq,1-sq,headC[0],headC[1]+R*.9);
 const headPath=polyPath(headPts,true);
 const hipF=W(tw*.18,hipY),hipB=W(-tw*.18,hipY);
 const fF=W(legF[0]*h,legF[1]*h),fB=W(legB[0]*h,legB[1]*h);
 const aF=reach?reach:W(shF[0]+armF[0]*h,shF[1]+armF[1]*h),aB=reachB?reachB:W(shB[0]+armB[0]*h,shB[1]+armB[1]*h);
 const limbs=new Path2D();
 limbs.addPath(ribbon([hipF,fF],h*.08*scale,{seed:seed+3,pressure:.4,taper:.25,wobble:1.4}));limbs.addPath(ribbon([hipB,fB],h*.08*scale,{seed:seed+4,pressure:.4,taper:.25,wobble:1.4}));
 limbs.addPath(ribbon([W(shB[0],shB[1]),aB],h*.062*scale,{seed:seed+5,pressure:.4,taper:.35,wobble:1.4}));limbs.addPath(ribbon([W(shF[0],shF[1]),aF],h*.062*scale,{seed:seed+6,pressure:.4,taper:.35,wobble:1.4}));
 const all=new Path2D();all.addPath(torso);all.addPath(headPath);all.addPath(limbs);
 const outl=new Path2D();outl.addPath(ribbon(torsoPts,Math.max(4,h*.022*scale),{seed:seed+7,close:true,pressure:.6,wobble:1.6,gaps:[[.62,.66]]}));outl.addPath(ribbon(headPts,Math.max(4,h*.022*scale),{seed:seed+8,close:true,pressure:.6,wobble:1.4}));
 if(sight>0){const d=face*(look>=0?1:-1),sx=headC[0]+d*R*.6,wedge=polyPath([[headC[0],headC[1]],[sx+d*h*.55,headC[1]-h*(.22+lookUp*.3)],[sx+d*h*.55,headC[1]+h*(.12-lookUp*.25)]],true);s.knockout(wedge,.3*sight);}
 s.knockout(all);s.fill(ink,all,cov);s.fill(line,outl,.9);
 if(shade){const sh=new Path2D();sh.addPath(crescent(headC[0],headC[1],R*.95,[-.35*face,-.4]));sh.addPath(polyPath([corners[0],[lerp(corners[1][0],corners[0][0],.5),lerp(corners[1][1],corners[0][1],.5)],[lerp(corners[2][0],corners[3][0],.5),lerp(corners[2][1],corners[3][1],.5)],corners[3]],true));s.tone(shade,sh,.45);}
 return{head:headC,R,handF:aF,handB:aB,footF:fF,chest:W(hc[0],hc[1]+R*1.6)};
}
const walkPose=(t:number,moving:boolean):Pose=>moving?(twosIndex(t)%2?'step2':'step'):'stand';

// ---------------- the material: a radio, sound printed as dashed arcs, threads and a dial ----------------
/** Dashed speaker arcs: stepped grainy navy bands from an origin, each ring broken into hand-cut segments (80–140 u with ~30 u gaps that
 * rotate slowly) so no frame shows solid concentric bands. jag = jagged edges, shake = print noise, push = outward pulse, loosen = breathe. */
function arcsOut(s:Sheet,cx:number,cy:number,bands:[number,number][],covs:number[],o:{seed:number;jag?:number;shake?:number;push?:number;loosen?:number;jagOnly?:number;t?:number;solid?:number}){
 const{seed,jag=0,push=0,loosen=1,jagOnly=99,t=0,solid=0}=o,sh=o.shake?shake(t,seed,o.shake):0,sh2=o.shake?shake(t,seed+3,o.shake):0,rr=rng(seed);
 bands.forEach(([r0,r1x],k)=>{const r1=r1x-r0>60?r0+44:r1x,jk=k<jagOnly?jag:0,pk=push*(1-k*.12),R0=(r0+pk)*loosen,R1=(r1+pk)*loosen,p=new Path2D();
  if(R1<=solid){p.arc(cx+sh,cy+sh2,R1,0,TAU);if(R0>0){p.moveTo(cx+sh+R0,cy+sh2);p.arc(cx+sh,cy+sh2,R0,0,TAU,true);}s.tone(K,p,covs[k]);return;}
  const seg=(70+rr()*50)/R1,gap=42/R1,rot=rr()*TAU+t*.06*(k%2?1:-1);let a=rot;
  while(a<rot+TAU){const a1=Math.min(rot+TAU,a+seg),j0=jk*(rr()-.5)*2,j1=jk*(rr()-.5)*2,o0=R1+j0,i0=R0+j1;
   const n=Math.max(3,Math.round((a1-a)*R1/40));p.moveTo(cx+sh+Math.cos(a)*o0,cy+sh2+Math.sin(a)*o0);
   for(let i=1;i<=n;i++){const b=lerp(a,a1,i/n),w=jk?jk*(hash(Math.round(b*100)+k*7,seed)-.5)*2:0;p.lineTo(cx+sh+Math.cos(b)*(o0+w),cy+sh2+Math.sin(b)*(o0+w));}
   for(let i=n;i>=0;i--){const b=lerp(a,a1,i/n),w=jk?jk*(hash(Math.round(b*100)+k*13,seed+1)-.5)*2:0;p.lineTo(cx+sh+Math.cos(b)*(i0+w),cy+sh2+Math.sin(b)*(i0+w));}
   p.closePath();a=a1+gap;}
  s.tone(K,p,covs[k]);});
}
/** The dust cap: a solid navy disc with a paper highlight (the centre of a grille). */
function dustCap(s:Sheet,x:number,y:number,r:number,seed:number){s.fill(K,polyPath(blob(x,y,r,r,seed,{amp:.03}),true));s.knockout(polyPath(blob(x-r*.32,y-r*.32,r*.22,r*.16,seed+1,{amp:.1}),true),.9);}
/** A speaker grille: a paper disc cut in the body with dashed navy arcs and a dust cap inside. */
function grille(s:Sheet,x:number,y:number,r:number,seed:number,o:{jag?:number;shake?:number;t?:number;push?:number}={}){
 const{jag=0,t=0,push=0}=o;s.knockout(polyPath(blob(x,y,r,r,seed,{amp:.02,n:40}),true),.95);
 arcsOut(s,x,y,[[r*.3,r*.42],[r*.55,r*.66],[r*.8,r*.9]],[.85,.75,.6],{seed:seed+1,jag:jag*.4,shake:o.shake,t,push});
 dustCap(s,x,y,r*.16,seed+2);contour(s,K,blob(x,y,r,r,seed,{amp:.02,n:40}),Math.max(4,r*.05),{close:true,seed:seed+3,pressure:.5});
}
/** The pocket radio: a torn navy body (knocked out beneath), the grille on the left, a paper dial window on the right with an orange and
 * a pink station band and a needle, an antenna up-left, two paper knobs, a volume bar. (x,y) = centre, w×h = body. */
function radio(s:Sheet,x:number,y:number,w:number,h:number,seed:number,o:{needle?:number;volume?:number;jag?:number;shake?:number;t?:number;light?:number;push?:number;cov?:number;volInk?:string;noGrille?:boolean}={}){
 const{needle=.35,volume=.4,jag=0,t=0,light=1,push=0,cov=.85,volInk=K,noGrille=false}=o;
 const body=torn(x-w/2,y-h/2,w,h,seed,w*.03,Math.max(20,w*.08));const bp=polyPath(body,true);s.knockout(bp);s.fill(K,bp,cov);
 s.save();s.clip(bp);s.fill(K,ribbon(body,w*.08,{close:true,seed,wobble:0,taper:0,pressure:.15,step:24}));s.restore();
 // antenna and knobs
 s.fill(K,ribbon([[x-w*.42,y-h/2],[x-w*.62,y-h/2-h*.42]],Math.max(5,w*.035),{seed:seed+4,wobble:.8,taper:.2,step:30}));s.knockout(circlePath(x-w*.62,y-h/2-h*.42,Math.max(6,w*.035)),.95);
 for(let i=0;i<2;i++){const kx=x+w*(.18+i*.2),ky=y-h*.4;s.knockout(polyPath(blob(kx,ky,w*.05,w*.05,seed+5+i,{amp:.05,n:16}),true),.95);s.fill(K,polyPath(rotPts([[-w*.008,-w*.04],[w*.008,-w*.04],[w*.008,w*.04],[-w*.008,w*.04]],hash(seed+i,3)*1.2-.6).map(p=>[p[0]+kx,p[1]+ky] as Pt),true));}
 // grille
 if(!noGrille)grille(s,x-w*.18,y-h*.02,w*.3,seed+10,{jag,shake:o.shake,t,push});
 // dial window: paper rect, orange band left, pink band right, ticks, needle, yellow light
 const dx=x+w*.28,dy=y+h*.14,dw=w*.3,dh=h*.24,win=polyPath(torn(dx-dw/2,dy-dh/2,dw,dh,seed+20,3,10),true);s.knockout(win,.95);
 s.fill(O,rectPath(dx-dw*.42,dy-dh*.3,dw*.26,dh*.6),.7);s.fill(P,rectPath(dx+dw*.12,dy-dh*.3,dw*.3,dh*.6),.8);
 const tk=new Path2D();for(let i=0;i<7;i++){const tx=dx-dw*.42+i*dw*.14;tk.moveTo(tx,dy+dh*.32);tk.lineTo(tx,dy+dh*.42);}s.stroke(K,tk,Math.max(1.5,w*.008));
 const nx=dx-dw*.42+needle*dw*.84;if(light>0)glowDisc(s,Y,nx,dy,dh*.16*light,{steps:2,glow:1,seed:seed+21,core:false});
 s.fill(K,ribbon([[nx,dy-dh*.44],[nx,dy+dh*.44]],Math.max(3,w*.014),{seed:seed+22,wobble:.6,taper:.2}));
 contour(s,K,torn(dx-dw/2,dy-dh/2,dw,dh,seed+20,3,10),Math.max(3,w*.012),{close:true,seed:seed+23,pressure:.4});
 // volume bar: a paper slot with the level printed inside
 const vx=x+w*.42,vy0=y-h*.3,vh=h*.5;s.knockout(rectPath(vx-w*.02,vy0,w*.04,vh),.95);if(volume>0)s.fill(volInk,rectPath(vx-w*.02,vy0+vh*(1-volume),w*.04,vh*volume),1);
}
/** Distance-parametrised point on a polyline. */
function atDist(pts:Pt[],d:number):{x:number;y:number;a:number}{let acc=0;for(let i=1;i<pts.length;i++){const L=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);if(acc+L>=d||i===pts.length-1){const f=clamp((d-acc)/(L||1));return{x:lerp(pts[i-1][0],pts[i][0],f),y:lerp(pts[i-1][1],pts[i][1],f),a:Math.atan2(pts[i][1]-pts[i-1][1],pts[i][0]-pts[i-1][0])};}acc+=L;}return{x:pts[0][0],y:pts[0][1],a:0};}
const pathLen=(pts:Pt[])=>{let L=0;for(let i=1;i<pts.length;i++)L+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);return L;};
/** The waveform: the same bump motif along a baseline, redrawn per state. jag(d) 0..1 = how spiky at distance d; amp(d) = height. */
function waveform(s:Sheet,ink:string,base:Pt[],o:{amp:number|((d:number)=>number);jag?:number|((d:number)=>number);wave?:number;width?:number;seed?:number;shake?:number;progress?:number;cov?:number;t?:number;phase?:number}){
 const{wave=160,width=12,seed=1,progress=1,cov=1,t=0,phase=0}=o,L=pathLen(base)*clamp(progress),sh=o.shake?shake(t,seed,o.shake):0,pts:Pt[]=[];
 for(let d=0;d<=L;d+=wave/8){const p=atDist(base,d),A=typeof o.amp==='function'?o.amp(d):o.amp,J=typeof o.jag==='function'?o.jag(d):(o.jag??0),u=(d/wave+phase)%1;
  const tri=u<.25?u*4:u<.75?2-u*4:u*4-4,off=A*((1-J)*Math.sin(u*TAU)+J*tri)+sh*(J>0?1:.2);pts.push([p.x-Math.sin(p.a)*off,p.y+Math.cos(p.a)*off]);}
 if(pts.length>1)s.fill(ink,ribbon(pts,width,{seed,wobble:0,taper:.15,pressure:.25,step:8}),cov);
}
/** A wave-packet: three rounded bumps of waveform travelling along a thread (u 0..1 of its length). */
function packet(s:Sheet,ink:string,base:Pt[],u:number,o:{len?:number;amp?:number;width?:number;seed?:number}={}){
 const{len=260,amp=40,width=12,seed=1}=o,L=pathLen(base),D=u*L,pts:Pt[]=[];
 for(let d=D-len/2;d<=D+len/2;d+=10){const p=atDist(base,clamp(d,0,L)),k=(d-(D-len/2))/len,off=-amp*Math.abs(Math.sin(k*Math.PI*3))*Math.sin(k*Math.PI);pts.push([p.x-Math.sin(p.a)*off,p.y+Math.cos(p.a)*off]);}
 s.fill(ink,ribbon(pts,width,{seed,wobble:0,taper:.5,pressure:.3,step:6}));
}
/** The story's football: a paper ball whose one seam is the waveform bump (a rounded pulse across the disc) with two faint pentagons beside it. */
function paperBall(s:Sheet,x:number,y:number,r:number,o:{seed?:number;rot?:number;sq?:number;dip?:number}={}){
 const{seed=1,rot=0,sq=0,dip=0}=o,pts=scalePts(blob(x,y,r,r,seed,{amp:.03,n:36}),1+sq,1-sq,x,y+r),d=polyPath(pts,true);
 s.knockout(d,.95);s.save();s.clip(d);
 const seam:Pt[]=[];for(let i=0;i<=12;i++){const u=i/12,lx=-r*1.1+u*r*2.2,ly=-(r*.34-dip)*Math.sin(u*Math.PI);const q=rotPts([[lx,ly]],rot)[0];seam.push([x+q[0],y+q[1]+r*.05]);}
 s.fill(K,ribbon(seam,Math.max(3,r*.11),{seed:seed+1,wobble:.6,taper:.2,pressure:.3,step:6}));
 const pent=(cx:number,cy:number,pr:number,a0:number)=>{const q:Pt[]=[];for(let i=0;i<5;i++){const a=a0+i/5*TAU;q.push([cx+Math.cos(a)*pr,cy+Math.sin(a)*pr]);}return polyPath(q,true);};
 const pp=new Path2D();const up=rotPts([[0,-r*.62]],rot)[0],dn=rotPts([[r*.1,r*.6]],rot)[0];pp.addPath(pent(x+up[0],y+up[1],r*.24,rot));pp.addPath(pent(x+dn[0],y+dn[1],r*.24,rot+.6));s.fill(K,pp,.6);
 s.tone(O,crescent(x,y,r*1.02,[-.4,-.45]),.32);s.restore();
 contour(s,K,pts,Math.max(3,r*.09),{close:true,seed:seed+2,pressure:.5,wobble:r*.02});
}
/** The dial: a navy arc from a hub with station bands, paper ticks, a needle and a yellow dial light. Angles in radians (canvas). */
function dial(s:Sheet,hx:number,hy:number,r:number,needle:number,o:{a0?:number;a1?:number;bands?:[number,number,string,number][];seed?:number;width?:number;len?:number;light?:number;ticks?:number}={}){
 const{a0=-2.75,a1=-.4,bands=[],seed=1,width=18,len=r*.82,light=1,ticks=12}=o;
 const arcPts=(b0:number,b1:number,rr:number)=>{const pts:Pt[]=[];const n=Math.max(8,Math.round((b1-b0)*rr/40));for(let i=0;i<=n;i++){const a=lerp(b0,b1,i/n);pts.push([hx+Math.cos(a)*rr,hy+Math.sin(a)*rr]);}return pts;};
 for(const [b0,b1,ink,cov] of bands)s.fill(ink,ribbon(arcPts(b0,b1,r),width*5.5,{seed:seed+2,wobble:0,taper:.1,pressure:.1,step:20}),cov);
 s.fill(K,ribbon(arcPts(a0,a1,r),width,{seed,wobble:1.2,taper:.2,pressure:.4,step:16}));
 const tk=new Path2D();for(let i=0;i<=ticks;i++){const a=lerp(a0,a1,i/ticks),c=Math.cos(a),sn=Math.sin(a),big=i%3===0?1:.55;tk.moveTo(hx+c*(r-width*3.4),hy+sn*(r-width*3.4));tk.lineTo(hx+c*(r-width*(3.4-1.6*big)),hy+sn*(r-width*(3.4-1.6*big)));}s.stroke(K,tk,width*.45);
 const tx=hx+Math.cos(needle)*len,ty=hy+Math.sin(needle)*len;if(light>0)glowDisc(s,Y,tx,ty,60*light,{steps:3,glow:1.1,seed:seed+4,core:false});
 s.fill(K,ribbon([[hx-Math.cos(needle)*r*.1,hy-Math.sin(needle)*r*.1],[tx,ty]],width*.9,{seed:seed+3,wobble:.8,taper:.6,pressure:.3,step:20}));
 s.fill(K,polyPath(blob(hx,hy,width*1.6,width*1.6,seed+5,{amp:.04,n:20}),true));
}
/** Orange static: speckle inside a torn region, with a soft orange tone beneath so it carries weight. */
function staticField(s:Sheet,box:[number,number,number,number],cov:number,seed:number,o:{count?:number;size?:number}={}){
 if(cov<=.02)return;const{count=140,size=9}=o,[x,y,w,h]=box,region=polyPath(torn(x,y,w,h,seed,44,60),true);
 s.save();s.clip(region);s.tone(O,region,Math.min(.45,cov*.7));dust(s,O,x+w/2,y+h/2,Math.hypot(w,h)*.55,Math.round(count*Math.min(1,cov*2.2)),{seed:seed+1,size,cov:.95,spread:1});s.restore();
}
/** Splatter: specks flung from a point with gravity, settling as marks. */
function splatter(s:Sheet,ink:string,x:number,y:number,n:number,seed:number,age:number,o:{life?:number;size?:number;up?:number;spread?:number}={}){
 if(age<0)return;const{life=.6,size=14,up=220,spread=1}=o,r=rng(seed),k=clamp(age/life),e=easeOut(k),p=new Path2D();
 for(let i=0;i<n;i++){const a=r()*TAU,v=(120+r()*260)*spread,px=x+Math.cos(a)*v*e,py=y+(Math.sin(a)*v-up*r())*e+520*k*k,sz=size*(.5+r()),rot=r()*TAU;const q=rotPts([[-sz*.5,-sz*.3],[sz*.5,-sz*.5],[sz*.4,sz*.5],[-sz*.4,sz*.4]],rot);p.moveTo(px+q[0][0],py+q[0][1]);for(let j=1;j<4;j++)p.lineTo(px+q[j][0],py+q[j][1]);p.closePath();}
 s.fill(ink,p);
}
/** A cross-mark: two navy strokes where the ball left the lane. */
const crossMark=(s:Sheet,x:number,y:number,r:number,seed:number,cov=1)=>{contour(s,K,[[x-r,y-r],[x+r,y+r]],12,{seed,taper:.5,cov});contour(s,K,[[x+r,y-r],[x-r,y+r]],12,{seed:seed+1,taper:.5,cov});};
/** A dashed lane between two points (u draws it on). */
function dashedLane(s:Sheet,ink:string,a:Pt,b:Pt,u:number,seed:number,width=10,cov=1){if(u<=0)return;const p=new Path2D();for(let i=0;i<6;i++){const u0=.06+i*.16,u1=u0+.09,on=u*7-i;if(on<=0)continue;p.addPath(ribbon([[lerp(a[0],b[0],u0),lerp(a[1],b[1],u0)],[lerp(a[0],b[0],u1),lerp(a[1],b[1],u1)]],on>=1?width:width*.6,{seed:seed+i,wobble:.6,taper:.4}));}s.fill(ink,p,cov);}

// ---------------- chapters ----------------
/** 1 — a pink figure holds the radio to its ear; the ball slips off its lane; the radio gets noisy; the harsh orange thread stamps the head. */
const RADIO1={x:190,y:20,w:210,h:270};
const ch1:Scene={
 draw(s,t){
  const tt=twos(t),drop=30*sm(.9,1.1,t,easeIn)*(1-sm(1.3,2.2,t)),camShake=t>=4.82&&t<5.3?shake(t,5,3):0,stampShiver=[6.82,7.4,8].reduce((a,t0)=>a+settle(t,t0,{amp:4,freq:14,decay:10}),0);
  const v=cam(s,t,[[0,60,60,1.15],[2.7,60,60,1.15],[4,90,20,1.45],[4.82,90,20,1.45],[5.8,110,0,1.75,-.03],[6.82,110,0,1.75,-.03],[8.6,100,10,1.85,-.03],[9.45,150,15,2.2,-.03],[10.1,150,15,2.25,-.03]]);
  s.camera(v[0]+camShake,v[1]+drop+stampShiver,v[2],v[3]+.03*sm(6.82,7,t)*(1-sm(7,7.4,t)));
  s.field(Y,.45,.55);
  // sound leaving the grille: dashed arcs across the sheet, pulsing on "inner voice", jagged and shaking on "noisy"
  const gx=RADIO1.x-RADIO1.w*.18,gy=RADIO1.y-RADIO1.h*.02,pushU=sm(2.9,3.4,t,easeOut)*(1-sm(3.4,4,t)),jag=t>=4.82?lerp(30,8,sm(5.4,6,t)):0,rsh=t>=4.82?lerp(9,1,sm(5.1,5.9,t)):0;
  arcsOut(s,gx,gy,[[150,230],[300,380],[460,540],[630,710],[810,890],[1000,1080],[1200,1280]],[.6,.5,.42,.32,.22,.12,.1],{seed:11,push:14*pushU,jag,shake:rsh,t});
  if(t>=5.1)staticField(s,[-300,-700,1300,700],.3*sm(5.1,5.6,t),13,{count:110});
  // the play thread at the feet and the ball slipping off it (the mistake)
  const recoil=t>=.9&&t<1.05?1:0;const base:Pt[]=[[-1000,380],[-300,380],[360,380],[1000,380]];
  waveform(s,K,base,{amp:recoil?10:0,jag:0,wave:220,width:12,seed:14});
  let px=-120,py=330,rot=0,dip=0;
  if(t<.2)dip=10*sm(0,.2,t);
  else if(t<.9){px=lerp(-120,500,sm(.2,.9,t,easeOut));rot=px*.01;}
  else{const u=t-.9;px=500+120*clamp(u/.4);const g=u*u*900;py=u<.4?Math.min(470,330+g):u<.7?470-70*4*((u-.4)/.3)*(1-(u-.4)/.3):u<.9?470-24*4*((u-.7)/.2)*(1-(u-.7)/.2):470;rot=5+u*2;}
  paperBall(s,px,py,46,{seed:17,rot,dip});
  if(t>=.9)splatter(s,K,500,380,7,18,tt-.9,{size:10,up:140});
  // the pink figure holds the radio to its ear; the harsh thread stamps its head three times (the head squashes per stamp)
  const stamps=t<6.82?0:t<7.4?1:t<8?2:3,sq=.1*stamps*(t<8.4?1:1)*(1-.5*sm(8.3,8.7,t));
  const fig=figure(s,0,380,420,'hold',{ink:P,seed:15,face:1,reach:[RADIO1.x-RADIO1.w*.45,RADIO1.y+RADIO1.h*.2],sq:sq*.6,shade:O});
  radio(s,RADIO1.x,RADIO1.y,RADIO1.w,RADIO1.h,12,{needle:t<4.82?.7:.85,volume:t<2.7?.3:t<4.82?.5:.95,jag:jag*.3,shake:rsh*.4,t,push:6*pushU,volInk:t>=4.82?O:K});
  // the orange thread: grows from the grille with rounded bumps, turns jagged and shakes, then stamps down over the head disc
  const orangeBase:Pt[]=[[gx-20,gy+60],[gx-40,gy+150],[fig?fig.head[0]+40:40,fig?fig.head[1]-30:-60]];
  if(t>=2.7){const jg=t<4.82?0:sm(4.82,4.82+2/12,t,linear);waveform(s,O,orangeBase,{amp:t<4.82?24:lerp(24,44,jg),jag:jg,wave:110,width:t<4.82?12:16,seed:19,progress:sm(2.7,3.5,t,easeOut),shake:t>=4.82&&t<5.5?8*(1-sm(4.82,5.5,t)):0,t});}
  if(t>=4.82)splatter(s,O,gx-40,gy+80,12,20,tt-4.82,{size:12,up:260,spread:1.1});
  if(fig)for(let k=0;k<3;k++){const t0=[6.82,7.4,8][k];if(t<t0-.2)continue;const y0=fig.head[1]-fig.R*.9-k*24,rear=sm(t0-.2,t0,t)*-20,down=sm(t0,t0+.3,t,easeIn),yy=lerp(y0-260,y0,down)+rear*(1-down)+settle(t,t0+.3,{amp:6,freq:8,decay:8});
   waveform(s,O,[[fig.head[0]-fig.R*1.6,yy],[fig.head[0]+fig.R*1.6,yy]],{amp:26,jag:1,wave:90,width:14,seed:21+k});}
 },
 aperture(){return apertureDisc(RADIO1.x-RADIO1.w*.18,RADIO1.y-RADIO1.h*.02,26,12);},
};
/** 2 — duotone orange + navy: the radio's volume spikes over the pink figure; the spike shrinks to one bump among many; one pass, one moment. */
const ch2:Scene={
 draw(s,t){
  const tt=twos(t),camShake=(t>=.2&&t<.9?shake(t,22,3):0)+[.3,.6].reduce((a,t0)=>a+settle(t,t0,{amp:3,freq:14,decay:10}),0);
  const v=cam(s,t,[[0,-60,-160,1],[2.4,-60,-160,1],[3.6,80,60,1.05],[5.08,80,60,1.05],[6.3,100,100,1.5],[6.9,100,100,1.5],[8.05,250,150,2.4],[8.7,250,150,2.45]]);
  s.camera(v[0]+camShake,v[1],v[2],0);
  s.field(K,.1,.3);
  // the radio at the top, its grille pouring sound down; the volume bar jumps to full and shrinks with the spike
  const shrink=sm(2.4,3.2,t,easeIn),vol=t<.3?.4:lerp(1,.3,shrink);
  arcsOut(s,-40,-820,[[0,360],[520,640],[800,900],[1060,1160]],[.85,.6,.45,.3],{seed:23,solid:220});
  radio(s,0,-640,560,400,24,{needle:.7,volume:vol,volInk:O,light:.6,jag:t<2.4?6:0,shake:t>=.3&&t<.9?4:0,t});
  staticField(s,[-1500,-1000,3000,2200],t<.3?.3:.4,25,{count:260,size:8});
  // the baseline of many moments: sags under the spike, springs flat, grows eleven bumps
  const sag=t<2.4?20*sm(.2,.6,t):20*(1-sm(2.4,2.5,t))*(t<2.5?1:0),base:Pt[]=[[-1200,240],[-60,240+sag],[1200,240]];
  waveform(s,K,base,{amp:0,wave:200,width:12,seed:26});
  const grow=sm(3.4,4.9,t,linear);
  for(let i=0;i<11;i++){const x=-600+i*130;if(x>-200&&x<380)continue;const ui=clamp((grow*13-i)/2);if(ui<=0)continue;const spike=i%3===1,g=easeOutBack(ui)*70;
   const pts:Pt[]=spike?[[x-30,240],[x,240-g*1.3],[x+30,240]]:[[x-42,240],[x-22,240-g*.8],[x,240-g],[x+22,240-g*.8],[x+42,240]];contour(s,spike?O:K,pts,12,{seed:27+i,taper:.3,pressure:.3,cov:t>=5.08?.32:1});}
  // the loud spike: stamps twice more misregistered, shakes, then shrinks heavily; its echoes tear off and fall
  const sw=lerp(300,80,shrink),sh=lerp(780,120,shrink)*(1+.05*settle(t,3.2,{amp:1,freq:5,decay:6})),lean=-.07*sm(0,.2,t)*(1-sm(.2,.5,t));
  const apexY=240-sh-20*sm(2.2,2.4,t)*(1-shrink),spk=(dx:number,cov:number)=>{const pts=handCut([[-60-sw+dx,240],[-60+dx+lean*sh,apexY],[-60+sw+dx,240]],28,14,60);s.tone(O,polyPath(pts,true),cov);contour(s,K,pts,10,{close:true,seed:29,pressure:.5,wobble:1.6});};
  const sshake=t>=.3&&t<.9?shake(t,30,10):0;
  if(t>=.3&&t<2.4)spk(-20+sshake,.4);if(t>=.6&&t<2.4)spk(20-sshake,.3);
  if(t>=2.4&&t<3.6){const f=t-2.4;const fy=900*f*f;[[-20,.4],[20,.3]].forEach(([dx,cov],k)=>{const pts=rotPts(handCut([[-60-300+dx,240+fy],[-60+dx,240-780+fy],[-60+300+dx,240+fy]],28,14,60),(k?-1:1)*f*.8,-60+dx,240+fy);s.tone(O,polyPath(pts,true),cov);});}
  const rounded=sm(6.9,6.9+2/12,t,linear);
  if(rounded>0){const w=80,h=120;const pts:Pt[]=[[-60-w,240],[-60-w*.55,240-h*.8],[-60,240-h],[-60+w*.55,240-h*.8],[-60+w,240]];s.tone(O,polyPath(pts,true),.4);contour(s,K,pts,10,{seed:29,pressure:.5});}
  else spk(sshake,.7);
  if(t>=.2)splatter(s,O,-60,apexY,10,31,tt-.3,{size:14,up:300,spread:1.2});
  // the pink figure under the spike (pressed by the noise, straightening as it shrinks); the yellow teammate; the bracket isolates one pass
  const press=t<2.4?sm(.2,.6,t,easeIn):clamp(1-spring(t-2.4,2.2,.5),-.15,1);
  figure(s,-60,240,360,'pressed',{ink:P,seed:32,face:1,k:clamp(press),shade:O});
  const kickU=t>=5.5&&t<6.15?sm(5.5,5.62,t,easeIn)*(1-sm(5.9,6.15,t)):0;
  if(kickU>0)figure(s,-60,240,360,'kick',{ink:P,seed:32,face:1,k:kickU,shade:O});
  const cushion=t>=6.15?settle(t,6.15,{amp:.08,freq:5,decay:6}):0;
  figure(s,300,240,340,t>=6.15?'crouch':'stand',{ink:Y,seed:33,face:-1,k:t>=6.15?.5+cushion:1,shade:O,cov:t>=5.08?.92:.6});
  if(t>=5.08){const b=sm(5.08,5.48,t,easeOut),L=-260-40*(1-b),R=440+40*(1-b),h=560;const br=(x:number,d:number)=>{contour(s,K,[[x+d*40,240-h],[x,240-h],[x,240+70],[x+d*40,240+70]],14,{seed:34,pressure:.4,taper:.2});};br(L,1);br(R,-1);}
  const hop=sm(5.5,6.15,t,easeOut),bx=lerp(-10,250,hop),by=240-40*Math.sin(hop*Math.PI),bsq=t>=6.15?settle(t,6.15,{amp:.06,freq:5,decay:6,phase:Math.PI/2}):0;
  paperBall(s,bx,by,44,{seed:35,rot:bx*.012,sq:bsq});
 },
 aperture(t){const hop=sm(5.5,6.15,t,easeOut);return apertureDisc(lerp(-10,250,hop),240-40*Math.sin(hop*Math.PI),22,10);},
};
/** 3 — the dial: the needle counter-turns then sweeps from orange to pink; kind words go out to a friend who was trying, and come back. */
const ch3:Scene={
 draw(s,t){
  const tt=twos(t);
  const v=cam(s,t,[[0,0,80,1,0],[1.36,0,80,1,.1],[2.4,220,-40,1.4,.1],[3.28,220,-40,1.4,.1],[4.3,380,140,1.4,.05],[5.7,380,140,1.4,.05],[7.2,-60,200,1.4,0],[7.9,-60,200,1.4,0],[9.45,450,64,1.9,0],[10.1,450,64,1.95,0]]);
  s.camera(v[0],v[1],v[2],v[3]);
  s.field(Y,.45,.55);
  const smooth=sm(1.36,1.9,t);
  arcsOut(s,0,600,[[240,280],[420,460],[860,900],[1060,1100],[1260,1300]],[.55,.45,.35,.25,.15],{seed:41,jag:lerp(10,0,smooth),shake:lerp(3,0,smooth),t});
  staticField(s,[-1500,-1200,3000,1000],lerp(.3,.1,sm(0,8,t)),42,{count:120});
  // the needle: counter-turn, sweep 60°, overshoot, settle on pink
  const A0=-130*Math.PI/180,A1=-50*Math.PI/180,turn=anticipate(0,1.36,t,{back:.07,hold:.15,e:easeIO}),needle=lerp(A0,A1,turn)+(t>=1.36?settle(t,1.36,{amp:.05,freq:3,decay:5}):0);
  const pinkCov=t<1.36?.4:tt<1.36+1/12?1:.9,orangeCov=lerp(.8,.3,sm(1.36,1.8,t));
  dial(s,0,600,700,needle,{bands:[[-150*Math.PI/180,-112*Math.PI/180,O,orangeCov],[-68*Math.PI/180,-30*Math.PI/180,P,pinkCov]],seed:43,len:620,light:1,ticks:14});
  // the two figures: you (pink, left, slumped until the words come back) and the friend who was trying (yellow, right, slumped until the words arrive)
  const friendUp=t<4.28?0:easeOutBack(sm(4.28,4.7,t)),youUp=t<6.7?0:easeOutBack(sm(6.7,7.1,t)),youLift=t>=7.9?sm(7.9,8.3,t,easeOut):0;
  const fy=figure(s,560,320,340,friendUp>=1?'up':'slump',{ink:Y,seed:46,face:-1,k:friendUp>=1?1:1-friendUp,from:friendUp>=1?'stand':'up',shade:O,cov:t>=4.28?.92:.6});
  const fp=figure(s,-420,320,360,youUp>=1?'up':'slump',{ink:P,seed:47,face:1,k:youUp>=1?clamp(youLift+.6):1-youUp,from:youUp>=1?'stand':'up',shade:O,cov:t>=6.7?.92:.6});
  // the thread between their hands: jagged orange leaning with the turn, rounding to pink after the needle lands
  const base:Pt[]=[[-900,220],[fp?fp.handF[0]:-360,fp?fp.handF[1]:180],[0,60],[fy?fy.handF[0]:500,fy?fy.handF[1]:160],[900,240]],round=sm(1.36,1.36+3/12,t,linear);
  waveform(s,round>=1?P:O,base,{amp:lerp(50,28,round),jag:1-round,wave:170,width:12,seed:44,phase:.1*turn});
  // packet out to the friend, then the identical packet back to you
  const out=sm(3.48,4.28,t,easeOut),back=sm(5.9,6.7,t,easeOut);
  if(t>=3.48&&t<5.9)packet(s,P,base,lerp(.3,.78,out),{seed:45,amp:56,width:16,len:300});
  if(t>=5.9)packet(s,P,base,lerp(.78,.3,back),{seed:45,amp:56,width:16,len:300});
  if(t>=4.28&&t<4.45&&fy)contour(s,K,blob(fy.head[0],fy.head[1],fy.R*1.3,fy.R*1.3,48,{amp:.03,n:30}),4,{close:true,seed:48});
 },
 aperture(){return apertureDisc(450,64,40,12);},
};
/** 4 — kind and honest: the pass went past the teammate; a sticker over the miss slips off; the figure looks at what happened; the walls leave; the ball comes back. */
const ch4:Scene={
 draw(s,t){
  const tt=twos(t),drop=20*sm(2.6,2.8,t,easeIn)*(1-sm(3,3.6,t));
  const v=cam(s,t,[[0,60,20,1],[1.38,60,20,1],[2.9,160,-20,1.25],[4.06,160,-20,1.25],[4.86,400,-120,1.25],[5.3,100,-80,1.25],[5.34,100,-80,1.25],[6.7,0,80,1.2,-.05],[8.08,0,80,1.2,-.05],[9.3,-160,180,1.5,-.05],[9.7,-160,180,1.5,-.05],[10.55,-100,140,2,-.05],[11.2,-100,140,2.05,-.05]]);
  s.camera(v[0],v[1]+drop,v[2],v[3]+.02*sm(0,.5,t)*(1-sm(5.34,6,t)));
  s.field(Y,.45,.55);
  const room=sm(5.34,6.04,t,easeOut);
  arcsOut(s,-600,-700,[[500,640],[760,900],[1020,1160],[1280,1420],[1540,1680]],[.7,.55,.42,.3,.18],{seed:51,loosen:1+.03*room});
  // the orange walls (calling yourself names): press inward, straighten, then tear away outward and fade
  const wallX=lerp(520,900,room),wallCov=lerp(.7,.2,room),leanW=lerp(.08,0,sm(4.06,4.6,t)),wallIn=10*sm(5.14,5.34,t);
  const wall=(sign:number,seed:number)=>{const x=sign*(wallX-wallIn),pts=handCut([[x-140*sign+leanW*600*sign,-700],[x+140*sign+sign*900,-700],[x+140*sign+sign*900,900],[x-140*sign-leanW*600*sign,900]],seed,40,150);s.tone(O,polyPath(pts,true),wallCov);};
  wall(-1,52);wall(1,53);
  // the pink waveform above (the kind voice) brightens and sends one bump down to the cross-mark
  waveform(s,P,[[-1200,-300],[1200,-300]],{amp:28,wave:180,width:12,seed:54,cov:t<.2?.5:.9});
  const drip=sm(.2,.9,t,easeOut);if(drip>0)packet(s,P,[[260,-300],[260,-70]],drip,{len:120,amp:24,width:10,seed:55});
  // the evidence: the pass lane that went past the teammate, the cross-mark where the ball left it, the ball lying dead
  const bold=lerp(10,14,sm(4.06,4.86,t)),path:Pt[]=[[-240,240],[140,60],[260,-70],[520,-160]];
  waveform(s,K,path,{amp:0,wave:200,width:bold,seed:56});
  crossMark(s,260,-70,60,57);
  // the sticker: hovers, slides over the cross, slips and falls off tumbling
  if(t>=1.38&&t<3.6){let px=260,py=-70,rot=0;const hover=sm(1.38,1.58,t),slide=sm(1.58,2.08,t,easeIn);py=lerp(-300,-70,slide)+(1-slide)*(-20*Math.sin(hover*Math.PI));
   if(t>=2.4){const f=t-2.4;py=-70+900*f*f;px=260+80*f;rot=f*2;}
   const pts=rotPts(torn(px-110,py-100,220,200,59,12,30),rot,px,py);s.knockout(polyPath(pts,true),.95);contour(s,K,pts,6,{close:true,seed:60,pressure:.3,cov:.6});}
  // figures: you (squeezed by the walls, springs back; head turns to the miss on "noticing"), the teammate stepping closer on "allowed to learn"
  const squeeze=t<5.34?sm(0,.5,t):1-spring(t-5.34,2.6,.5),look=key(t,[[3.9,0],[4.06,-.1],[4.4,.9],[7.9,.9],[8.3,.3]]),sight=sm(4.06,4.3,t)*(1-sm(7.9,8.3,t));
  const mateX=lerp(140,80,sm(8.08,8.48,t,easeOut)),mateY=lerp(60,100,sm(8.08,8.48,t,easeOut)),mateMoving=t>=8.08&&t<8.48;
  figure(s,-300,240,360,squeeze>.05&&t<7?'pressed':'stand',{ink:P,seed:61,face:1,k:clamp(squeeze*.7),look,sight,lookUp:.3*sight,shade:O});
  figure(s,mateX,mateY,320,mateMoving?walkPose(t,true):t>=9.2?'crouch':'stand',{ink:Y,seed:62,face:-1,k:t>=9.2?.4:1,shade:O});
  const seg=sm(8.08,8.48,t,easeOut);
  if(seg>0){const a:Pt=[-240,240],b:Pt=[mateX-60,mateY];s.fill(Y,ribbon([a,[lerp(a[0],b[0],seg),lerp(a[1],b[1],seg)]],60,{seed:63,wobble:1,taper:.15,pressure:.2,step:20}),1);dashedLane(s,K,a,b,sm(9.7,10.5,t,linear),64);}
  // the ball: lies dead past the teammate, rolls back to your foot on "allowed to learn"
  const glide=sm(8.3,9.2,t);
  if(t<8.3)paperBall(s,520,-160,44,{seed:65,rot:.4});
  else{const gp=[[520,-160],[300,60],[-220,240]] as Pt[],q=atDist(gp,glide*pathLen(gp)),cushion=t>=9.2?settle(t,9.2,{amp:.06,freq:5,decay:6,phase:Math.PI/2}):0;const dots=new Path2D();for(let i=1;i<9;i++){const d=atDist(gp,i/9*pathLen(gp));dots.addPath(circlePath(d.x,d.y,6));}s.fill(K,dots,.6);paperBall(s,q.x,q.y,44,{seed:65,rot:.4-glide*6,sq:cushion});}
  if(t>=2.4)splatter(s,K,260,-70,5,67,tt-2.45,{size:8,up:60});
 },
 aperture(){return apertureDisc(-90,180,24,10);},
};
/** 5 — breathe out: the pink figure exhales (arms sink), the frame expands; one cue: look up, find a teammate, short pass; attention moves on. */
const ch5:Scene={
 draw(s,t){
  const tt=twos(t),breath=sm(0,1.88,t,easeOut),inhale=10*sm(0,.25,t)*(1-sm(.25,.6,t));
  const v=cam(s,t,[[0,-120,-60,1],[1.88,-100,-20,.96],[2.9,-100,120,1.2],[4.2,-100,120,1.2],[5,120,40,1.25,-.07],[5.62,120,40,1.25,-.07],[6.3,200,60,1.3,-.07],[7.26,200,60,1.3,-.07],[8.6,400,160,1.3,-.035],[9,400,160,1.3,-.035],[10.45,620,300,2.2,-.035],[11.1,620,300,2.25,-.035]]);
  s.camera(v[0],v[1],v[2],v[3]);
  s.field(Y,.45,.55);
  const rx=-560,ry=-420;
  arcsOut(s,rx-40,ry,[[420,540],[660,780],[900,1020],[1140,1260],[1380,1500],[1620,1740]],[.7,.5,.35,.2,.1,.1],{seed:71,loosen:1+.04*breath});
  // the small radio up-left, the kind voice's breath line leaving its grille: one hump exhaling flat; later one soft bump over the second figure
  radio(s,rx,ry,220,280,72,{needle:.85,volume:.3,light:.8});
  const hump=lerp(120,12,breath)+inhale,bump2=t>=7.4?30*sm(7.4,7.8,t,easeOut)*(1-sm(8.2,9,t)):0;
  waveform(s,P,[[rx+120,ry+60],[1400,-320]],{amp:d=>hump*Math.exp(-Math.pow((d-560)/420,2))+bump2*Math.exp(-Math.pow((d-1560)/160,2)),wave:2800,width:12,seed:73,phase:.25});
  // the spike field between the figures: slackens with the breath in three visible steps, droops when the pass leaves it nothing to press, shrinks at the end
  const slackStep=t<2.6?0:t<3.2?1:t<3.8?2:3,slack=lerp(.7,.45,breath)-.05*slackStep,droop=sm(6.27,6.9,t,easeOut),shrink=sm(9,9.6,t,easeOut),fw=lerp(240,160,shrink),fcov=lerp(slack,.3,shrink),jagTop=lerp(50,14,breath)*(1-slackStep*.15)*(1-droop*.6);
  const top=[];for(let i=0;i<=8;i++)top.push([120-fw/2+i*fw/8,140-260+(i%2?jagTop:-jagTop)*.5+droop*80*(i/8)] as Pt);
  s.tone(O,polyPath(handCut([[120-fw/2,140+300],...top,[120+fw/2,140+300]],74,20,80),true),fcov);
  // figures: you (arms sink as you breathe out; the ring chooses you; head lifts on "look up"), the teammate (revealed by the look, rises into an open angle), the second teammate
  const spread=20*breath,youX=-200-spread,mateX=lerp(340,360,sm(4.5,4.9,t,easeOut)),mateY=lerp(60,-60,sm(4.2,4.9,t,easeOut)),mateDip=t>=6.27?12*settle(t,6.27,{amp:1,freq:4,decay:5}):0;
  const lookUp=key(t,[[4.05,0],[4.2,-.1],[4.5,1],[5.62,1],[6,.3]]),sight=sm(4.2,4.4,t)*(1-sm(5.62,5.9,t));
  const kick=t>=5.42&&t<6?sm(5.42,5.62,t,easeIn)*(1-sm(5.8,6,t)):0;
  figure(s,youX,320,380,kick>0?'kick':'up',{ink:P,seed:75,face:1,k:kick>0?kick:1-breath,lookUp:Math.max(0,lookUp),look:.4*Math.max(0,lookUp),sight,shade:O});
  figure(s,mateX,mateY+120+mateDip,340,t>=6.27&&t<7.26?'crouch':t>=7.1&&t<7.8?'kick':'stand',{ink:Y,seed:76,face:-1,k:t>=6.27&&t<7.26?.5:t>=7.1&&t<7.8?sm(7.1,7.26,t)*(1-sm(7.6,7.8,t)):1,shade:O,cov:lerp(.6,.92,sm(4.5,4.9,t))});
  const n2Dip=t>=9.7?12*settle(t,9.7,{amp:1,freq:4,decay:5}):0;figure(s,640+spread,380+n2Dip,340,t>=9.7?'crouch':'stand',{ink:Y,seed:77,face:-1,k:t>=9.7?.5:1,shade:O,cov:t>=7.76?.92:.6});
  const ringU=sm(1.88,2.38,t,easeOut);if(ringU>0)contour(s,K,partial(smoothPts(blob(youX,120,240,240,78,{amp:.03,n:36}),true,6),ringU),12,{seed:78,taper:.3,pressure:.4});
  // lane, dashes and the ball: a short pass to the teammate, cushioned; a dashed lane to the second teammate; the ball moves on
  const pass=sm(5.62,6.27,t,easeOut),segU=sm(5.42,5.62,t,easeOut),dash=sm(7.26,7.76,t,easeOut),pass2=sm(9,9.7,t,easeOut);
  const B0:Pt=[youX+60,300],B1:Pt=[mateX-50,mateY+100],B2:Pt=[580+spread,360];
  if(segU>0)s.fill(Y,ribbon([B0,[lerp(B0[0],B1[0],segU),lerp(B0[1],B1[1],segU)]],40,{seed:79,wobble:1,taper:.1,pressure:.2,step:20}),1);
  dashedLane(s,Y,B1,B2,dash,80,26);
  let px=B0[0],py=B0[1],dip=0;if(t<5.62)dip=10*sm(5.42,5.62,t);else if(t<9){px=lerp(B0[0],B1[0],pass);py=lerp(B0[1],B1[1],pass)-30*Math.sin(pass*Math.PI)+(pass>=1?mateDip:0);}else{px=lerp(B1[0],B2[0],pass2);py=lerp(B1[1],B2[1],pass2)-30*Math.sin(pass2*Math.PI)+(pass2>=1?n2Dip:0);}
  paperBall(s,px,py,46,{seed:81,rot:px*.01,dip,sq:t>=6.27&&t<6.6?settle(t,6.27,{amp:.06,freq:5,decay:6,phase:Math.PI/2}):0});
 },
 aperture(){return apertureDisc(580,360,36,12);},
};
/** 6 — the whole radio: noise returns at the edge; the figure notices it; the needle tunes back to pink; the kind packet arrives; one step on. */
const ch6:Scene={
 draw(s,t){
  const tt=twos(t),camShake=t<.3?shake(t,82,2):0;
  const v=cam(s,t,[[0,60,40,.8],[1.9,60,40,.8],[2.8,-100,-60,1.02],[2.84,-100,-60,1.02],[3.84,340,60,1.12,.05],[4.38,340,60,1.12,.05],[5.76,-40,240,1.15,-.05],[6.96,-80,360,1.5,-.05],[7.4,-80,360,1.5,-.05],[8.8,-40,340,1.6,-.05]]);
  s.camera(v[0]+camShake,v[1],v[2],v[3]);
  s.field(Y,.45,.55);
  const kink=t<2.84?sm(0,2/12,t,linear):1-sm(2.84,2.84+3/12,t,linear),noise=t<.4?shake(t,83,6):0;
  const RX=140,RY=-60,RW=1020,RH=760,gxx=RX-RW*.18,gyy=RY-RH*.02;
  arcsOut(s,gxx,gyy,[[560,640],[760,840],[960,1040],[1160,1240],[1360,1440]],[.5,.42,.32,.2,.1],{seed:84,jag:kink*22,jagOnly:2,shake:kink*4,t});
  // the radio, big: grille kinks with the noise, the needle drifts to orange, counter-turns, and rotates back to pink
  const AP=.86,driftN=.14*sm(0,.5,t,easeOut),back=t<2.84?0:anticipate(2.84,3.44,t,{back:.25,hold:.25}),needle=AP-driftN*(1-back)+(t>=3.44?settle(t,3.44,{amp:.03,freq:3,decay:5}):0)+(t>=8.15?settle(t,8.15,{amp:.015,freq:2,decay:3}):0);
  radio(s,RX,RY,RW,RH,85,{needle,volume:.5,jag:kink*20,shake:kink*4+noise*.3,t,light:.9,volInk:kink>.3?O:K});
  // static prints in from the left with a splatter, is outlined under the look, then falls back but stays
  const edge=lerp(-1100,-380,sm(0,.8,t,easeOut)),scov=t<2.84?.35*sm(0,.8,t):lerp(.35,.15,sm(2.84,3.4,t));
  staticField(s,[-2000,-1400,edge+2000,2800],scov,86,{count:200,size:9});
  if(t>=.1)splatter(s,O,edge-60,-100,14,87,tt-.1,{size:14,up:240,spread:1.4});
  const outline=sm(2.2,2.6,t,easeOut);if(outline>0)contour(s,K,partial(smoothPts(handCut([[edge+20,-1300],[edge-30,-500],[edge+40,200],[edge-10,1300]],88,44,120,false),false,8),outline),12,{seed:88,taper:.3,pressure:.4});
  // the play thread below the radio with the ch-5 lane; the figures: you (notices the noise: head turns to it; steps on at the end), the teammate
  const play:Pt[]=[[-900,620],[-260,600],[300,420],[900,380]];
  waveform(s,K,play,{amp:0,wave:200,width:12,seed:91});
  s.fill(Y,ribbon([[-200,600],[240,440]],40,{seed:92,wobble:1,taper:.1,pressure:.2,step:20}),.9);
  const look=key(t,[[1.8,0],[1.9,.1],[2.2,-.9],[2.84,-.9],[3.4,0]]),sight=sm(1.9,2.1,t)*(1-sm(2.84,3.2,t));
  const nodeSq=t<2.84?.04*sm(0,.5,t):.04*(1-spring(t-2.84,2.6,.5)),lift=t>=5.18?sm(5.18,5.5,t,easeOut)*(1-sm(5.6,5.9,t)):0;
  const step=t<5.96?0:anticipate(5.96,6.46,t,{back:.06,hold:.2,e:easeOut}),over=t>=6.46?settle(t,6.46,{amp:15,freq:4,decay:5}):0;
  const along=atDist(play,pathLen([[-900,620],[-260,600]])+step*170+over),moving=step>0&&step<1;
  const fp=figure(s,along.x-70,along.y+10,380,moving?walkPose(t,true):lift>0?'up':'stand',{ink:P,seed:94,face:1,k:lift>0?lift:1,look,sight,lookUp:.4*sight,sq:nodeSq,shade:O});
  figure(s,320,430,340,t>=5.18&&t<5.6?'arms':'stand',{ink:Y,seed:95,face:-1,k:t>=5.18&&t<5.6?.6:1,shade:O});
  // the kind packet: from the needle tip down to the figure's head
  const pk=sm(4.38,5.18,t,easeOut);if(t>=4.23&&pk<1&&fp){const dx=RX+RW*.28,dy=RY+RH*.14;const pp:Pt[]=[[dx-RW*.3*.42+needle*RW*.3*.84,dy+RH*.1],[dx-100,RY+RH*.55],[fp.head[0]+60,fp.head[1]-fp.R*1.4],[fp.head[0],fp.head[1]-fp.R]];packet(s,P,pp,lerp(.02,.96,pk),{seed:93,amp:50,width:15});}
  // the ball at the foot advances with the step
  paperBall(s,along.x+40,along.y-4,44,{seed:96,rot:step*3,dip:t<5.96?10*sm(5.76,5.96,t):0});
  if(t>=6.46)contour(s,K,[[along.x-8,along.y+40],[along.x+6,along.y+62]],10,{seed:97,taper:.4,cov:sm(6.46,6.7,t)>.5?1:.5});
 },
 still:5.4,
};

export const story:RisoStory={
 id:'pocket-radio',format:'7v7',title:'The Pocket Radio',theme:'A kinder inner voice',ageNote:'An explanation of kind, useful self-talk after mistakes.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',pink:'#ff48b0',orange:'#ff6c2f',navy:'#22366b'},order:['yellow','pink','orange','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:[
  {label:'What do you hear?',narration:'What do you say to yourself after a mistake? Sometimes your inner voice sounds like a noisy radio, playing the same harsh words.',seconds:10.1,audio:CH+'1.m4a',cues:[{at:0,words:'What do you say'},{at:2.7,words:'Sometimes your inner voice'},{at:4.82,words:'noisy radio'},{at:6.82,words:'same harsh words'}]},
  {label:'Noise is not truth',headline:'Just noise',narration:'You might hear, I always get it wrong. But a loud thought is not the whole truth. One pass is one moment.',seconds:8.7,audio:CH+'2.m4a',cues:[{at:0,words:'You might hear'},{at:2.4,words:'But a loud thought'},{at:3.4,words:'not the whole truth'},{at:5.08,words:'One pass is one moment'}]},
  {label:'A kinder station',headline:'Kinder',narration:'Imagine turning towards a kinder station. What would you say to a friend who was trying? Try offering yourself those same words.',seconds:10.1,audio:CH+'3.m4a',cues:[{at:0,words:'Imagine turning'},{at:1.36,words:'a kinder station'},{at:3.28,words:'What would you say to a friend'},{at:5.7,words:'Try offering yourself'}]},
  {label:'Kind and honest',narration:'Being kind does not mean pretending everything went well. It means noticing what happened without calling yourself names. You are allowed to learn.',seconds:11.2,audio:CH+'4.m4a',cues:[{at:0,words:'Being kind'},{at:1.38,words:'pretending everything went well'},{at:4.06,words:'noticing what happened'},{at:5.34,words:'without calling yourself names'},{at:8.08,words:'allowed to learn'}]},
  {label:'One useful cue',narration:'Breathe out slowly. Then choose one useful football cue: look up, find a teammate, make a short pass. Give your attention somewhere helpful.',seconds:11.1,audio:CH+'5.m4a',cues:[{at:0,words:'Breathe out slowly'},{at:1.88,words:'Then choose one useful football cue'},{at:4.2,words:'Look up find a teammate'},{at:5.62,words:'make a short pass'},{at:7.26,words:'Give your attention somewhere helpful'}]},
  {label:'Tune in again',headline:'Tune in',narration:'The noise may return. You can notice it and tune in again. A kinder voice helps you take the next step.',seconds:8.8,audio:CH+'6.m4a',cues:[{at:0,words:'The noise may return'},{at:1.9,words:'You can notice it'},{at:2.84,words:'tune in again'},{at:4.38,words:'A kinder voice'},{at:5.76,words:'the next step'}]},
 ],
 draw(f){playChapters(story,f,[ch1,ch2,ch3,ch4,ch5,ch6]);},
 touch(s,x,y,age,seed){
  // a dial click and a waveform blip: a paper flash that shrinks, two navy ring steps (the speaker), a rounded pink bump born at the touch that travels right, a paper tick, orange static specks
  const u=age>0?easeOut(clamp(age/.6)):.4,fade=age>0?1-clamp((age-.5)/.3):1;if(fade<=0)return;
  s.knockout(polyPath(blob(x,y,84*(1-.6*u),84*(1-.6*u),seed+4,{amp:.06,n:24}),true),.85*fade);
  const rr=70+90*u;contour(s,K,blob(x,y,rr,rr,seed+1,{amp:.04,n:30}),10,{close:true,seed:seed+1,cov:fade});
  contour(s,K,blob(x,y,rr*.62,rr*.62,seed+2,{amp:.04,n:30}),7,{close:true,seed:seed+2,gaps:[[.2,.35],[.7,.85]],cov:.8*fade});
  const bx=x+120*u,pts:Pt[]=[[bx-46,y+20],[bx-26,y-14],[bx,y-30],[bx+26,y-14],[bx+46,y+20]];
  s.fill(P,ribbon(pts,14,{seed,wobble:.6,taper:.5,pressure:.3}),fade>.5?1:.6);
  s.knockout(polyPath(rotPts([[-5,-26],[5,-26],[5,26],[-5,26]],hash(seed,3)*.6-.3).map(p=>[p[0]+x-40,p[1]+y-50] as Pt),true),.95);
  dust(s,O,x,y,60+90*u,9,{seed:seed+3,size:7,cov:fade});
 },
};
