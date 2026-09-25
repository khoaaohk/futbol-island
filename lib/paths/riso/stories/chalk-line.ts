/** The Chalk Line — riso (futsal). Rework 2, 21 Sep 2026: the camera comes DOWN — a low, close, three-quarter view of the ground.
 * The kid is LARGE (640 u, kneeling over the ground with a chunky 150 u chalk stick) and the CHALK DRAWING is the hero at close range:
 * every mark is a thick (48 u) dusty paper knockout with a soft dotted-paper halo, drawn on a dark court that fills the frame (green under a
 * navy .35 halftone, torn navy edges printed round the safe region, one faint court marking as texture). YELLOW = the idea (the star, the
 * ticks, the right-sized arc, the chalk's end); PINK = pressure only (a torn block, a defender); GREEN figure = the teammate; the ball = a
 * chalk-DRAWN football (thick paper ring, paper pentagons and seams, dust round the rim). Round ground things (puffs, the chalk's ground
 * shadow, dust clouds) are foreshortened ellipses so the ground reads as a tilted plane; the figures stand upright on it. Dust puffs, chalk
 * crumbs and smears react to every mark and every kick. Scenes read only their local time t and the SceneContext, so seams stay pixel-exact. */
import type {Sheet} from '../sheet';
import {type RisoStory,type Scene,playChapters} from '../story';
import {apertureDisc} from '../passage';
import {TAU,twos,twosIndex,sm,easeOut,easeIO,easeIn,easeOutBack,key,camKeys,anticipate,settle,smearPose,clamp,lerp,rng,blob,polyPath,ribbon,smoothPts,partial,rotPts,wob,torn,rectPath,arc,type Pt} from '../motion';
import {dust,chalkStroke,sparkBurst,speedLines,handCut,crescent} from '../shapes';

const CH='/stories/narration/futsal/chalk-line/';
const K='navy',P='pink',G='green',Y='yellow';
const BIG=rectPath(-6000,-6000,12000,12000);
const L2=(a:Pt,b:Pt,u:number):Pt=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)];
/** View factor: landscape safe regions (desktop 793 × 625 u) are much wider than tall — pull the camera back (.74) so the tall groups clear the band;
 * phones show a tall portrait canvas (1080 × ~1770 u visible) — come closer (1.2) so the compositions, staged to extend toward the camera, fill it. */
const land=(s:Sheet)=>s.safe.w/s.safe.h>1.2?.74:1.2;
/** Camera through keys with the landscape factor; dx adds a shake; landDy shifts the world down on landscape safe regions (clear of the centred headline). */
function cam(s:Sheet,t:number,keys:(number)[][],dx=0,landDy=0){const v=camKeys(s,t,keys),L=land(s);s.camera(v[0]+dx,v[1]+(L<1?landDy:0),v[2]*L,0);return v;}

// ---------------- abstract riso figure (bible §1c.4) ----------------
/** A cut-paper player pictogram: a big head disc, a torn torso block, two leg strokes, two arm strokes — 4–6 plate ops, no anatomy, no face.
 * (x,y) = the ground point under the body, h = height, face = +1 looks right. Poses are parameter tables blended from `stand` by k (0..1).
 * ink 'paper' = paper body with navy contour and navy limbs (you / teammates); an ink = that ink knocked out beneath (defenders).
 * reach = world point the front arm ends at (holding a chalk, a thread, a reel); foot = world point the front leg ends at (a kick).
 * look (−1..1) turns the head; sight prints a faint paper wedge from the head in the look direction. shade = halftone ink on the shadow side.
 * lift raises the head off the shoulders (a look up). glow = ink tone inside the head (an idea kept inside). Returns the head centre and the front hand. */
type Pose='stand'|'scan'|'run'|'arms'|'up'|'slump'|'step'|'listen'|'crouch'|'kick'|'kneel';
type PoseParams={tilt:number;head:Pt;legF:Pt;legB:Pt;armF:Pt;armB:Pt;hip:number};
const POSES:Record<Pose,PoseParams>={
 stand:{tilt:0,head:[0,0],legF:[.1,0],legB:[-.1,0],armF:[.2,.27],armB:[-.2,.27],hip:0},
 scan:{tilt:0,head:[0,0],legF:[.12,0],legB:[-.1,0],armF:[.2,.27],armB:[-.2,.27],hip:0},
 run:{tilt:.35,head:[.02,0],legF:[.3,-.14],legB:[-.36,-.05],armF:[.28,-.06],armB:[-.3,.1],hip:0},
 arms:{tilt:.05,head:[0,0],legF:[.15,0],legB:[-.15,0],armF:[.42,-.12],armB:[-.42,-.12],hip:0},
 up:{tilt:-.04,head:[0,0],legF:[.12,0],legB:[-.12,0],armF:[.28,-.36],armB:[-.28,-.36],hip:0},
 slump:{tilt:.4,head:[.05,.07],legF:[.06,0],legB:[-.08,0],armF:[.16,.34],armB:[-.02,.34],hip:.02},
 step:{tilt:.26,head:[.01,0],legF:[.32,0],legB:[-.3,0],armF:[.36,.1],armB:[-.3,.14],hip:.06},
 listen:{tilt:.15,head:[.06,.02],legF:[.12,0],legB:[-.1,0],armF:[.05,-.14],armB:[-.2,.27],hip:0},
 crouch:{tilt:.3,head:[.02,.01],legF:[.24,0],legB:[-.24,0],armF:[.3,.12],armB:[-.28,.16],hip:.12},
 kick:{tilt:-.12,head:[0,0],legF:[.34,-.08],legB:[-.12,0],armF:[.3,0],armB:[-.32,.05],hip:0},
 kneel:{tilt:.55,head:[.02,.02],legF:[.3,0],legB:[-.16,0],armF:[.34,.14],armB:[-.08,.22],hip:.16},
};
type FigOpts={ink?:string;line?:string;seed?:number;face?:1|-1;look?:number;k?:number;cov?:number;reach?:Pt;foot?:Pt;shade?:string;sight?:number;knock?:boolean;lift?:number;glow?:number;sx?:number};
function figure(s:Sheet,x:number,y:number,h:number,pose:Pose,o:FigOpts={}):{head:Pt;hand:Pt;R:number}{
 const{ink='paper',line=K,seed=1,face=1,look=0,k=1,cov=.92,reach,foot,shade,sight=0,knock=true,lift=0,glow=0,sx=1}=o;
 const base=POSES.stand,p=POSES[pose],L=(a:number,b:number)=>lerp(a,b,k),LP=(a:Pt,b:Pt):Pt=>[lerp(a[0],b[0],k),lerp(a[1],b[1],k)];
 const tilt=L(base.tilt,p.tilt),head=LP(base.head,p.head),legF=LP(base.legF,p.legF),legB=LP(base.legB,p.legB),armF=LP(base.armF,p.armF),armB=LP(base.armB,p.armB),hip=L(base.hip,p.hip);
 const R=h*.16,tw=h*.3*sx,th=h*.38,legL=h*.3,hipY=-legL+hip*h,ca=Math.cos(tilt),sa=Math.sin(tilt);
 const W=(lx:number,ly:number):Pt=>[x+lx*face,y+ly];// local → world (face mirrors x)
 const T=(lx:number,ly:number):Pt=>[lx*ca-ly*sa,hipY+lx*sa+ly*ca];// torso frame (about the hip) → local
 const corners=[T(-tw/2,0),T(tw/2,0),T(tw/2,-th),T(-tw/2,-th)].map(q=>W(q[0],q[1]));
 const torso=polyPath(handCut(corners,seed,h*.02,h*.12),true);
 const shF=T(tw*.42,-th+R*.25),shB=T(-tw*.42,-th+R*.25);
 const hc=T(0,-th-R*1.05),headC=W(hc[0]+head[0]*h+look*R*.42,hc[1]+head[1]*h-lift*R),headPts=blob(headC[0],headC[1],R,R*.96,seed+2,{amp:.05,n:30});
 const headPath=polyPath(headPts,true);
 const hipF=W(tw*.18,hipY),hipB=W(-tw*.18,hipY);
 const fF=foot?foot:W(legF[0]*h,legF[1]*h),fB=W(legB[0]*h,legB[1]*h);
 const aF=reach?reach:W(shF[0]+armF[0]*h,shF[1]+armF[1]*h),aB=W(shB[0]+armB[0]*h,shB[1]+armB[1]*h);
 if(h<8)return{head:headC,hand:aF,R};
 const limbs=new Path2D();
 limbs.addPath(ribbon([hipF,fF],h*.08,{seed:seed+3,pressure:.4,taper:.25,wobble:1.4}));limbs.addPath(ribbon([hipB,fB],h*.08,{seed:seed+4,pressure:.4,taper:.25,wobble:1.4}));
 limbs.addPath(ribbon([W(shB[0],shB[1]),aB],h*.062,{seed:seed+5,pressure:.4,taper:.35,wobble:1.4}));limbs.addPath(ribbon([W(shF[0],shF[1]),aF],h*.062,{seed:seed+6,pressure:.4,taper:.35,wobble:1.4}));
 const body=new Path2D();body.addPath(torso);body.addPath(headPath);
 const outline=new Path2D();outline.addPath(ribbon(handCut(corners,seed,h*.02,h*.12),Math.max(4,h*.02),{seed:seed+7,close:true,pressure:.6,wobble:1.6,gaps:[[.62,.66]]}));outline.addPath(ribbon(headPts,Math.max(4,h*.02),{seed:seed+8,close:true,pressure:.6,wobble:1.4}));
 if(sight>0){const d=face*(look>=0?1:-1),sx0=headC[0]+d*R*.6,wedge=polyPath([[headC[0],headC[1]],[sx0+d*h*.55,headC[1]-h*.22],[sx0+d*h*.55,headC[1]+h*.12]],true);s.knockout(wedge,.32*sight);}
 if(ink==='paper'){if(knock)s.knockout(body,cov);s.fill(line,limbs);s.fill(line,outline);}
 else{const all=new Path2D();all.addPath(body);all.addPath(limbs);if(knock)s.knockout(all);s.fill(ink,all,cov);s.fill(line,outline,.9);}
 if(shade){const sh=new Path2D();sh.addPath(crescent(headC[0],headC[1],R*.98,[-.35*face,-.4]));sh.addPath(polyPath([corners[0],[lerp(corners[1][0],corners[0][0],.5),lerp(corners[1][1],corners[0][1],.5)],[lerp(corners[2][0],corners[3][0],.5),lerp(corners[2][1],corners[3][1],.5)],corners[3]],true));s.tone(shade,sh,.45);}
 if(glow>0)s.tone(Y,polyPath(blob(headC[0],headC[1],R*.8,R*.78,seed+2,{amp:.05,n:24}),true),glow);
 return{head:headC,hand:aF,R};
}
/** A kicking figure: swing>0 blends the kick pose with the front foot at `target` (negative swing = the foot winds back). */
function kicker(s:Sheet,x:number,y:number,h:number,swing:number,target:Pt,o:FigOpts={}){const k=clamp(swing),f=o.face??1;return figure(s,x,y,h,'kick',{...o,k:k+.15,foot:[lerp(x+f*h*.12,target[0],k)+(swing<0?swing*h*.25*f:0),lerp(y,target[1],k)]});}

/** The head centre of a figure without drawing it (camera targets, apertures, the star). */
function headOf(x:number,y:number,h:number,pose:Pose,o:{k?:number;face?:1|-1;look?:number;lift?:number}={}):Pt{
 const{k=1,face=1,look=0,lift=0}=o,base=POSES.stand,p=POSES[pose],tilt=lerp(base.tilt,p.tilt,k),hx=lerp(base.head[0],p.head[0],k),hy=lerp(base.head[1],p.head[1],k),hip=lerp(base.hip,p.hip,k);
 const R=h*.16,th=h*.38,hipY=-h*.3+hip*h,ca=Math.cos(tilt),sa=Math.sin(tilt),d=th+R*1.05;
 return[x+(d*sa+hx*h+look*R*.42)*face,y+hipY-d*ca+hy*h-lift*R];
}

// ---------------- the world: the dark court, close, seen low ----------------
const FIG=640,BR=110,GS=.62;
/** The dark court: green (mottle) under a navy .35 halftone, and torn navy edges printed in SHEET space: the far dark edge of the court above
 * the safe region (a torn horizon under the headline) and torn side channels where the sheet is wider than the safe region (desktop).
 * Call before the scene's camera — the main camera must be set last. */
function court(s:Sheet,seed:number){
 s.field(G,1,.55);
 s.tone(K,BIG,.35);
 s.save();s.camera(s.cx,s.cy,1,0);
 const f=1/s.fit,cx=s.cx,cy=s.cy,X=(x:number)=>cx+(x-cx)*f,Yy=(y:number)=>cy+(y-cy)*f;
 const top=Yy(s.safe.y-130),lef=X(s.safe.x-90),rig=X(s.safe.x+s.safe.w+90);
 const p=new Path2D();
 p.addPath(polyPath(torn(-600,top-3200,s.W+1200,3200,seed,80,64),true));// the far, dark edge of the court (a torn horizon)
 if(lef>60)p.addPath(polyPath(torn(lef-3200,-600,3200,s.H+1200,seed+2,80,64),true));
 if(rig<s.W-60)p.addPath(polyPath(torn(rig,-600,3200,s.H+1200,seed+3,80,64),true));
 s.tone(K,p,.55);
 s.restore();
}
/** One faint court marking as ground texture: a big foreshortened arc and a straight line (16 u paper at .22), kept off the action. */
function markings(s:Sheet,seed:number,ox:number,oy:number,rot=0){
 const p=new Path2D(),c=blob(ox,oy,900,900*GS,seed,{amp:.012,n:48}).map(q=>rotPts([q],rot,ox,oy)[0]);
 p.addPath(ribbon(c,16,{seed,pressure:.2,taper:0,wobble:1,step:40,close:true}));
 p.addPath(ribbon([[ox-1600,oy+1200*GS],[ox+1600,oy+1200*GS]],16,{seed:seed+1,pressure:.2,taper:0,wobble:1,step:60}));
 s.knockout(p,.22);
}
/** A chalk mark: a thick, wobbly paper line with dusty edges and a soft dotted-paper halo. progress draws it on. ≈ 12 ops. */
function chalk(s:Sheet,pts:Pt[],seed:number,o:{progress?:number;w?:number;cov?:number;dust?:number;close?:boolean;halo?:number}={}){
 const{progress=1,w=48,cov=.94,dust:d=1,close=false,halo=.2}=o;if(progress<=0)return;
 const q=wob(pts,5,seed+77,close,{step:18,freq:1.4}),line=progress>=1?q:partial(smoothPts(q,close,7),progress);if(line.length<2)return;
 const closed=close&&progress>=1;
 if(halo>0)s.knockout(ribbon(line,w*2.2,{seed:seed+9,pressure:.3,taper:.6,wobble:3,step:10,close:closed}),halo);
 chalkStroke(s,line,w,{seed,progress:1,cov,dust:d,close:closed,step:8});
}
/** The chalk tip at fraction p of a chalk mark (same wobble seed as chalk()). */
const along=(pts:Pt[],p:number,seed:number):Pt=>partial(smoothPts(wob(pts,5,seed+77,false,{step:18,freq:1.4}),false,7),p).slice(-1)[0];
/** Chalk arrow: a chalk shaft and a chunky chalk head (2.8 × the width). progress draws the shaft, the head pops at the end. cov fades it (a scuffed arrow). */
function chalkArrow(s:Sheet,a:Pt,b:Pt,seed:number,o:{progress?:number;w?:number;cov?:number;head?:number}={}){
 const{progress=1,w=48,cov=.94}=o;if(progress<=0)return;const dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L,head=o.head??w*2.8;
 const shaft=sm(0,.8,progress),hp=sm(.8,1,progress,easeOutBack);
 chalk(s,[a,[b[0]-ux*head*.5,b[1]-uy*head*.5]],seed,{progress:shaft,w,cov});
 if(hp>0){const e:Pt=[b[0],b[1]],hh=head*hp,tip=polyPath(wob([[e[0],e[1]],[e[0]-ux*hh-uy*hh*.62,e[1]-uy*hh+ux*hh*.62],[e[0]-ux*hh*.45,e[1]-uy*hh*.45],[e[0]-ux*hh+uy*hh*.62,e[1]-uy*hh-ux*hh*.62]],2.5,seed+3,true,{step:6,corner:.3}),true);
  s.knockout(polyPath(blob(e[0]-ux*hh*.5,e[1]-uy*hh*.5,hh*.85,hh*.85,seed+4,{amp:.1,n:16}),true),.2);s.knockout(tip,cov);}
}
/** A chalk X (the mark where it went wrong): two thick strokes, foreshortened. */
function chalkX(s:Sheet,x:number,y:number,r:number,seed:number,progress=1){const ry=r*.8;chalk(s,[[x-r,y-ry],[x+r,y+ry]],seed,{progress:clamp(progress*2),w:r*.45});if(progress>.5)chalk(s,[[x+r,y-ry],[x-r,y+ry]],seed+1,{progress:clamp(progress*2-1),w:r*.45});}
const tickPts=(x:number,y:number,r:number):Pt[]=>smoothPts([[x-r,y+r*.05],[x-r*.3,y+r*.75],[x+r,y-r*.8]],false,6);
/** A yellow tick: a chalk tick printed yellow (knocked out beneath so it stays bright) with a paper halo. g 0..1 draws it. */
function tick(s:Sheet,x:number,y:number,r:number,seed:number,g=1){
 if(g<=0)return;const pts=partial(tickPts(x,y,r),g);if(pts.length<2)return;
 const path=ribbon(pts,r*.42,{seed,pressure:.5,taper:.4,wobble:1.6});s.knockout(ribbon(pts,r*.9,{seed:seed+1,taper:.5,wobble:3,step:10}),.2);s.knockout(path,.95);s.fill(Y,path,.95);
}
/** The chalk map: many static chalk marks batched into one paper knockout, one faint knockout, one halo, one dust knockout (+ yellow marks). */
type Mark={pts:Pt[];w?:number;cov?:number;arrow?:boolean;x?:boolean;y?:boolean;lift?:number};
function chalkMap(s:Sheet,marks:Mark[],seed:number){
 const paper=new Path2D(),faint=new Path2D(),halo=new Path2D(),dusty=new Path2D(),yel=new Path2D();let k=0;
 for(const m of marks){const w=m.w??48,rr=rng(seed+k*13);
  const add=(pts:Pt[],width:number,target:Path2D)=>{const q=wob(pts,5,seed+k*7+77,false,{step:18,freq:1.4});target.addPath(ribbon(q,width,{seed:seed+k,pressure:.6,taper:.5,wobble:1.6,step:8}));
   if(target!==faint)halo.addPath(ribbon(q,width*2.2,{seed:seed+k+9,pressure:.3,taper:.6,wobble:3,step:10}));
   const d=smoothPts(q,false,24);for(let i=0;i<d.length;i+=2){const a=rr()*TAU,dd=width*(.6+rr()*1.4),sz=width*(.1+rr()*.22);dusty.rect(d[i][0]+Math.cos(a)*dd,d[i][1]+Math.sin(a)*dd,sz,sz*(.6+rr()));}k++;};
  if(m.y){const pts=m.lift?arcPts(m.pts[0],m.pts[1],m.lift):m.pts;yel.addPath(ribbon(pts,w,{seed:seed+k,pressure:.5,taper:.4,wobble:1.6,step:8}));halo.addPath(ribbon(pts,w*1.9,{seed:seed+k+9,taper:.5,wobble:3,step:10}));k++;continue;}
  const target=(m.cov??1)<.6?faint:paper;
  if(m.x){const [c,r]=[m.pts[0],m.pts[1][0]],ry=r*.8;add([[c[0]-r,c[1]-ry],[c[0]+r,c[1]+ry]],r*.45,target);add([[c[0]+r,c[1]-ry],[c[0]-r,c[1]+ry]],r*.45,target);continue;}
  const pts=m.lift?arcPts(m.pts[0],m.pts[1],m.lift):m.pts,b=pts[pts.length-1];
  if(m.arrow){const pa=pts[pts.length-2],dx=b[0]-pa[0],dy=b[1]-pa[1],Lh=Math.hypot(dx,dy)||1,ux=dx/Lh,uy=dy/Lh,hh=w*2.8;
   add([...pts.slice(0,-1),[b[0]-ux*hh*.5,b[1]-uy*hh*.5]],w,target);
   target.addPath(polyPath(wob([[b[0],b[1]],[b[0]-ux*hh-uy*hh*.62,b[1]-uy*hh+ux*hh*.62],[b[0]-ux*hh*.45,b[1]-uy*hh*.45],[b[0]-ux*hh+uy*hh*.62,b[1]-uy*hh-ux*hh*.62]],2.5,seed+k+3,true,{step:6,corner:.3}),true));
   halo.addPath(polyPath(blob(b[0]-ux*hh*.5,b[1]-uy*hh*.5,hh*.85,hh*.85,seed+k+4,{amp:.1,n:16}),true));}
  else add(pts,w,target);}
 s.knockout(halo,.2);s.knockout(paper,.94);s.knockout(faint,.3);s.knockout(dusty,.7);s.knockout(yel,.95);s.fill(Y,yel,.95);
}
/** The chalk stick: a chunky paper cylinder (150 × 44 u) from the hand to the tip, navy contour, yellow butt. ground = the point under the
 * tip when it hovers: a navy shadow ellipse is printed there, offset by the height, so a hovering chalk reads as hovering. */
function stick(s:Sheet,hand:Pt,tip:Pt,seed:number,ground?:Pt){
 const dx=tip[0]-hand[0],dy=tip[1]-hand[1],ang=Math.atan2(dy,dx),len=150,r=22;
 if(ground){const h=ground[1]-tip[1];if(h>6)s.tone(K,polyPath(blob(ground[0]+h*.3,ground[1]+4,54,30,seed+4,{amp:.06,n:14}),true),.88);}
 const local:Pt[]=[[-len,-r*.9],[-len+r*.6,-r],[-r*.7,-r],[0,-r*.55],[0,r*.55],[-r*.7,r],[-len+r*.6,r],[-len,r*.9]];
 const outline=rotPts(local,ang).map(p=>[p[0]+tip[0],p[1]+tip[1]] as Pt);
 const body=polyPath(wob(outline,1.4,seed,true,{step:8,corner:.5}),true);s.knockout(body,.95);
 const cap=polyPath(rotPts([[-len,-r*.9],[-len+r*.6,-r],[-len+r*2,-r],[-len+r*2,r],[-len+r*.6,r],[-len,r*.9]],ang).map(p=>[p[0]+tip[0],p[1]+tip[1]] as Pt),true);s.fill(Y,cap,.95);
 s.fill(K,ribbon(outline,5,{seed:seed+1,close:true,pressure:.5,wobble:1.4,step:8}),.9);
}
/** The idea star: a chunky yellow five-point star (knocked out beneath so it prints pure yellow) with a spark halo. g grows it, pulse breathes it. */
function star(s:Sheet,x:number,y:number,r:number,seed:number,o:{g?:number;pulse?:number;spin?:number}={}){
 const{g=1,pulse=0,spin=0}=o;if(g<=.02)return;const R=r*g*(1+.07*pulse),pts:Pt[]=[];
 for(let i=0;i<10;i++){const a=-Math.PI/2+i/10*TAU+spin,rr=i%2?R*.46:R;pts.push([x+Math.cos(a)*rr,y+Math.sin(a)*rr]);}
 const path=polyPath(wob(pts,R*.03,seed,true,{step:8,corner:.4}),true);s.knockout(path,.95);s.fill(Y,path,.95);
 sparkBurst(s,Y,x,y,R*1.5,{n:8,seed:seed+1,g:.6+.4*pulse,width:R*.09,cov:.9});
}
/** The ball of this story: a chalk-DRAWN football — a thick paper ring, a paper centre pentagon, five rim pentagons and five seams, dust round
 * the rim, a soft halo. rot rolls the pentagons; sx/sy squash it; smear stretches the ring for a fast touch. ≈ 16 ops. */
function chalkBall(s:Sheet,x:number,y:number,r:number,seed:number,o:{sx?:number;sy?:number;rot?:number;smear?:{dir:number;amount:number};cov?:number}={}){
 const{sx=1,sy=1,rot=0,smear,cov=.94}=o;let ring=blob(x,y,r*sx,r*sy,seed,{amp:.03,n:40});if(smear&&smear.amount>0)ring=smearPose(ring,smear.dir,smear.amount,[x,y]);
 const disc=polyPath(ring,true);
 s.knockout(ribbon(ring,r*.7,{seed:seed+2,close:true,pressure:.3,taper:0,wobble:3,step:10}),.2);
 const pent=(cx:number,cy:number,pr:number,a0:number)=>{const q:Pt[]=[];for(let i=0;i<5;i++){const a=a0+i/5*TAU;q.push([cx+Math.cos(a)*pr*sx,cy+Math.sin(a)*pr*sy]);}return polyPath(wob(q,pr*.06,seed+3,true,{step:6,corner:.3}),true);};
 const inner=new Path2D();inner.addPath(pent(x,y,r*.34,rot-Math.PI/2));
 for(let i=0;i<5;i++){const a=rot-Math.PI/2+Math.PI/5+i/5*TAU;inner.addPath(pent(x+Math.cos(a)*r*.9*sx,y+Math.sin(a)*r*.9*sy,r*.3,a+Math.PI));const b=rot-Math.PI/2+i/5*TAU;inner.addPath(ribbon([[x+Math.cos(b)*r*.34*sx,y+Math.sin(b)*r*.34*sy],[x+Math.cos(b)*r*.72*sx,y+Math.sin(b)*r*.72*sy]],r*.11,{seed:seed+4+i,taper:.3,wobble:1.4}));}
 s.save();s.clip(disc);s.knockout(inner,cov);s.restore();
 s.knockout(ribbon(ring,r*.32,{seed:seed+1,close:true,pressure:.5,taper:0,wobble:2.4,step:9}),cov);
 const rr=rng(seed+5),dp=new Path2D();for(let i=0;i<16;i++){const a=rr()*TAU,d=r*(1.05+rr()*.35),sz=r*.05*(.5+rr());dp.rect(x+Math.cos(a)*d*sx,y+Math.sin(a)*d*sy,sz,sz*(.6+rr()));}s.knockout(dp,.75);
}
/** A torn pink pressure block (the court knocked out beneath so pink prints clean). crumple pushes its inner face in. */
function block(s:Sheet,x:number,y:number,w:number,h:number,seed:number,o:{cov?:number;crumple?:number}={}){
 const{cov=1,crumple=0}=o;let pts=torn(x,y,w,h,seed,30,54);
 if(crumple>0)pts=pts.map(p=>{const k=clamp(1-(p[0]-x)/(w*.3));return[p[0]+k*crumple*50*(.5+.5*Math.sin(p[1]*.02+seed)),p[1]] as Pt;});
 const path=polyPath(pts,true);s.knockout(path);s.fill(P,path,cov);
 s.tone(K,polyPath(pts.map(p=>[p[0]+(p[0]<x+w*.3?60:0),p[1]] as Pt),true),.3);
}
/** A dust puff on the ground (a foreshortened ellipse of paper speckle) growing and fading over 1.2 s. size 1 ≈ 320 u wide. */
const puff=(s:Sheet,x:number,y:number,age:number,seed:number,size=1)=>{if(age<0||age>1.2)return;const r=(60+260*easeOut(clamp(age/.9)))*size,cov=.85*(1-clamp(age/1.2));s.save();s.translate(x,y);s.scale(1,GS);dust(s,null,0,0,r,Math.round(22*size),{seed,size:14*size,cov:Math.max(.1,cov),spread:1});s.restore();};
/** Chalk crumbs: a few paper fragments thrown from a point, ballistic, settling on the ground and staying for 1.6 s. */
function crumbs(s:Sheet,x:number,y:number,age:number,seed:number,o:{n?:number;r?:number;size?:number}={}){
 if(age<0||age>1.6)return;const{n=8,r=220,size=16}=o,rr=rng(seed),p=new Path2D(),u=easeOut(clamp(age/.8)),fl=Math.sin(Math.min(1,age/.7)*Math.PI);
 for(let i=0;i<n;i++){const a=rr()*TAU,d=(50+rr()*r)*u,lift=(40+rr()*90)*fl,px=x+Math.cos(a)*d,py=y+Math.sin(a)*d*GS-lift,sz=size*(.5+rr()),q=rotPts([[-sz*.5,-sz*.35],[sz*.5,-sz*.4],[sz*.4,sz*.4],[-sz*.4,sz*.3]],rr()*TAU+age*(rr()-.5)*8);p.moveTo(px+q[0][0],py+q[0][1]);for(let k=1;k<4;k++)p.lineTo(px+q[k][0],py+q[k][1]);p.closePath();}
 s.knockout(p,.9*(1-clamp((age-1.1)/.5)));
}
const spark=(s:Sheet,x:number,y:number,age:number,seed:number,r=120)=>{if(age<0)return;const g=easeOutBack(clamp(age/.4))*(1-clamp((age-.9)/.6));if(g<=0)return;sparkBurst(s,Y,x,y,r,{n:8,seed,g,width:r*.11});};
/** Seam material: a dense chalk-dust cloud (foreshortened) growing around the aperture point. */
const dustCloud=(s:Sheet,x:number,y:number,age:number,seed:number,o:{r?:number;n?:number;size?:number}={})=>{if(age<0)return;const{r=420,n=70,size=20}=o,g=easeOut(clamp(age/.9));s.save();s.translate(x,y);s.scale(1,GS+.2);dust(s,null,0,0,r*g,Math.round(n*g)+4,{seed,size,cov:.9,spread:1});dust(s,null,0,0,r*.5*g,Math.round(n*.6*g)+3,{seed:seed+1,size:size*.7,cov:.9,spread:1});s.restore();};
/** Ball flight a→b from t0 over dur: [x, y, squash-settle, smear]. */
function flight(tt:number,t0:number,dur:number,a:Pt,b:Pt,o:{lift?:number;smear?:number}={}):[number,number,number,number]{
 const{lift=0,smear=30}=o,u=sm(t0,t0+dur,tt,easeOut),p=lift?arc(a,b,u,lift):L2(a,b,u);
 return[p[0],p[1],tt>=t0+dur?.07*settle(tt,t0+dur,{amp:1,freq:5,decay:5,phase:Math.PI/2}):0,u>0&&u<1?smear:0];}
const arcPts=(a:Pt,b:Pt,lift:number,n=12):Pt[]=>{const out:Pt[]=[];for(let i=0;i<=n;i++)out.push(arc(a,b,i/n,lift));return out;};
const norm=(a:Pt,b:Pt):Pt=>{const dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy)||1;return[dx/L,dy/L];};
/** The hand that holds the chalk whose tip is at `tip`: 150 u back from the tip toward the kid's chest. */
const handFor=(ground:Pt,face:1|-1,tip:Pt):Pt=>{const chest:Pt=[ground[0]+face*70,ground[1]-320],d=norm(chest,tip);return[tip[0]-d[0]*150,tip[1]-d[1]*150];};

// ---------------- the marks of the story ----------------
const M1:Pt[]=[[-300,140],[20,120]],M1B:Pt[]=[[20,120],[300,90]],M2:Pt[]=[[300,90],[400,-120],[430,-340]],M3:Pt[]=[[20,120],[90,320],[310,400]],M4:Pt[]=[[400,-120],[180,-250],[-60,-290]],M5:Pt[]=[[430,-340],[480,-480]];
const B3:Pt=[-440,330],USUAL:[Pt,Pt]=[[-500,470],[-660,700]],DIFF:[Pt,Pt]=[[-540,220],[-800,-140]],DIFFBALL:Pt=[-683,22],TICK3:Pt=[-720,-300];
const BALL4:Pt=[50,300],LANE4:[Pt,Pt]=[[-40,420],[-300,540]],MATE4:Pt=[-360,480];
const YOU5:Pt=[-300,560],FOOT5:Pt=[-240,580],MATE5:Pt=[-20,160],X5:Pt=[120,-170],BALL5:Pt=[260,-260],YARC5:Pt=[-70,190],TICK5:Pt=[-360,20];

// ---------------- chapters ----------------
/** 1 · the kid kneels large with the chalk raised; a big yellow star pulses over the head; the chalk lowers and hovers, dips twice, never marks; the star goes into the head. */
const G1:Pt=[-140,300];
const ch1:Scene={
 draw(s,t){
  const tt=twos(t);
  court(s,11);
  cam(s,t,[[0,100,-90,1.2],[3.2,110,-70,1.22],[6,120,-60,1.27],[8,100,-80,1.33],[10,80,-120,1.4]],0,-70);
  markings(s,11,-760,-420);
  // ghost scuffs: old faint chalk as ground texture
  chalk(s,[[-560,540],[-220,600],[80,560]],13,{w:34,cov:.16,dust:.3,halo:0});chalk(s,[[380,600],[700,520]],14,{w:34,cov:.16,dust:.3,halo:0});
  // the chalk: raised until "Waiting until" (a small rise first), then lowered to hover over the ground; two dips that stop short
  const lk=clamp(anticipate(3.2,3.9,tt,{back:.15,hold:.3}));
  const dip=(t0:number)=>sm(t0,t0+.3,tt,easeIn)*(1-sm(t0+.35,t0+.8,tt,easeOut));
  const ground:Pt=[330,440],liftH=70-(dip(5)+dip(8))*48+(lk>.9?4*Math.sin(tt*5):0);
  const raised:Pt=[300-8*Math.sin(tt*1.6),-120+6*Math.cos(tt*1.3)],hoverAir:Pt=[ground[0],ground[1]-liftH];
  const tipAir=L2(raised,hoverAir,lk),hand=handFor(G1,1,tipAir);
  // the star: pops above the head at .3, pulses, then shrinks into the head on "a useful idea"
  const inward=sm(6.3,7.2,t,easeIn),glow=sm(7.1,7.6,t)*.45+(t>7.6?.03*Math.sin(tt*3):0);
  const fig=figure(s,G1[0],G1[1],FIG,'kneel',{seed:41,face:1,reach:hand,shade:G,glow:Math.min(.6,glow)});
  stick(s,hand,tipAir,41,lk>.3?ground:undefined);
  if(lk>.3){puff(s,ground[0],ground[1],tt-5.3,44,.35);puff(s,ground[0],ground[1],tt-8.3,45,.35);}
  const g=easeOutBack(sm(.3,.9,t)),above:Pt=[fig.head[0],fig.head[1]-fig.R-190],sp=L2(above,fig.head,inward);
  if(inward<1)star(s,sp[0],sp[1],160*(1-.75*inward),21,{g,pulse:.5+.5*Math.sin(tt*4),spin:tt*.3});
  else if(t<7.6)spark(s,fig.head[0],fig.head[1],t-7.2,22,120);
 },
 aperture(){const hd=headOf(G1[0],G1[1],FIG,'kneel');return apertureDisc(hd[0],hd[1],60,12);},
 still:5.2,
};
/** 2 · macro on the ground: the chalk touches down (big puff) and draws ONE thick mark; it extends into a line with an arrowhead; a second mark bends it hard; branches spread until the ground is a chalk drawing; the kid's hand and chalk are always in frame. */
type Seg={t0:number;t1:number;pts:Pt[];seed:number;off:Pt;face:1|-1};
const SEGS:Seg[]=[{t0:1.94,t1:2.5,pts:M1,seed:61,off:[-250,-40],face:1},{t0:2.7,t1:3.4,pts:M1B,seed:62,off:[-250,-40],face:1},{t0:4.5,t1:5.3,pts:M2,seed:65,off:[-300,230],face:1},{t0:6.4,t1:7.1,pts:M3,seed:67,off:[-250,-40],face:1},{t0:7.5,t1:8.2,pts:M4,seed:68,off:[250,-40],face:-1},{t0:8.5,t1:9.1,pts:M5,seed:69,off:[-300,230],face:1}];
function tipAt(t:number):{tip:Pt;lift:number;off:Pt;face:1|-1}{
 if(t<1.94){const lift=key(t,[[0,50],[1.5,50],[1.7,88,easeIn],[1.92,0]]);return{tip:M1[0],lift,off:[-250,-40],face:1};}
 for(let i=0;i<SEGS.length;i++){const sg=SEGS[i],nx=SEGS[i+1];
  if(t<sg.t1)return{tip:along(sg.pts,sm(sg.t0,sg.t1,t,easeIO),sg.seed),lift:0,off:sg.off,face:sg.face};
  if(!nx)return{tip:sg.pts[sg.pts.length-1],lift:key(t,[[sg.t1,0],[sg.t1+.4,44]]),off:sg.off,face:sg.face};
  if(t<nx.t0){const end=sg.pts[sg.pts.length-1],start=nx.pts[0],u=sm(nx.t0-.3,nx.t0,t,easeIO),far=Math.hypot(start[0]-end[0],start[1]-end[1])>150;
   return{tip:L2(end,start,u),lift:Math.sin(u*Math.PI)*(far?96:52),off:L2(sg.off,nx.off,u),face:u<.5?sg.face:nx.face};}
 }
 const last=SEGS[SEGS.length-1];return{tip:last.pts[last.pts.length-1],lift:44,off:last.off,face:last.face};
}
const ch2:Scene={
 draw(s,t){
  const tt=twos(t);
  court(s,12);
  cam(s,t,[[0,-200,-80,1.3],[1.94,-200,-80,1.3],[3.4,-60,-100,1.25],[4.5,40,-120,1.2],[5.4,120,-180,1.12],[6.4,140,-120,1.05],[7.5,150,-80,1],[8.5,160,-110,.95],[10,160,-120,.92]],0,-90);
  markings(s,12,700,900);
  // the strokes, each self-drawing on its cue
  const p1=sm(1.94,2.5,tt,easeIO),p1b=sm(2.7,3.4,tt,easeIO),ah1=sm(3.3,3.6,tt,easeOutBack)*(1-sm(4.55,4.85,tt));
  const p2=sm(4.5,5.3,tt,easeIO),ah2=sm(5.3,5.6,tt,easeOutBack),p3=sm(6.4,7.1,tt,easeIO),p4=sm(7.5,8.2,tt,easeIO),p5=sm(8.5,9.1,tt,easeIO);
  chalk(s,M1,61,{progress:p1});chalk(s,M1B,62,{progress:p1b});
  if(ah1>0)chalkArrow(s,[200,100],[330,86],63,{progress:.8+.2*ah1,cov:.94*Math.max(.15,ah1)});
  if(tt>=4.55)puff(s,300,90,tt-4.55,64,.8);
  chalk(s,M2,65,{progress:p2});if(ah2>0)chalkArrow(s,[425,-300],[436,-380],66,{progress:.8+.2*ah2});
  chalk(s,M3,67,{progress:p3});chalk(s,M4,68,{progress:p4});chalk(s,M5,69,{progress:p5*.9});
  if(p5>.8)dust(s,null,480,-465,100+90*p5,12,{seed:70,size:16,cov:.7});
  // the chalk tip follows the stroke being drawn; it lifts (anticipation) before every new stroke; the kid kneels beside it and hops between marks
  const {tip,lift,off,face}=tipAt(tt);
  const wobble:Pt=lift>0?[4*Math.sin(tt*2.5),3*Math.cos(tt*2.1)]:[0,0];
  const tipAir:Pt=[tip[0]+wobble[0],tip[1]-lift+wobble[1]],ground:Pt=[tip[0]+off[0],tip[1]+off[1]],hand=handFor(ground,face,tipAir);
  figure(s,ground[0],ground[1],FIG,'kneel',{seed:42,face,reach:hand,shade:G,glow:.45});
  stick(s,hand,tipAir,42,lift>0?tip:undefined);
  // contact: a big puff, crumbs and a yellow spark on the first touch; a puff at every new stroke
  SEGS.forEach((sg,i)=>puff(s,sg.pts[0][0],sg.pts[0][1],tt-sg.t0+.02,70+i,i===0?1.1:.8));
  crumbs(s,M1[0][0],M1[0][1],tt-1.92,72);crumbs(s,300,90,tt-4.5,73,{n:6});
  spark(s,M1[0][0],M1[0][1],t-1.92,71,110);
  dustCloud(s,480,-480,t-9.2,33,{r:340,n:56,size:18});
 },
 aperture(){return apertureDisc(480,-480,100,12);},
 still:5.6,
};
/** 3 · the chalk-drawn football rolls in big; a chalk arrow shows the usual touch; the foot smears it to dust; the kid kneels and chalks a bolder arrow; the first touch follows it; a yellow tick. */
const ch3:Scene={
 draw(s,t){
  const tt=twos(t);
  court(s,13);
  cam(s,t,[[0,-400,110,1.1],[2.5,-420,140,1.12],[4.6,-440,160,1.14],[7.1,-460,90,1.16],[9.9,-480,40,1.22]],0,-90);
  markings(s,13,-1200,-700,.2);
  const X=-200,Yg=300;
  // the usual touch: chalked straight ahead (down-left, toward the camera), then scuffed out by the foot
  const usual=sm(2.5,3.1,tt,easeOut),scuff=sm(3.85,4.3,tt,easeIO);
  if(usual>0)chalkArrow(s,USUAL[0],USUAL[1],73,{progress:usual,cov:.94*(1-.74*scuff),w:44});
  if(scuff>0&&scuff<1){puff(s,USUAL[0][0]-140*scuff,USUAL[0][1]+200*scuff,tt-3.85,74,.8);crumbs(s,USUAL[0][0]-40,USUAL[0][1]+80,tt-3.9,75,{n:6});}
  // the different touch: chalked up-left by the kneeling kid
  const diff=sm(4.85,5.55,tt,easeIO);
  if(diff>0)chalkArrow(s,DIFF[0],DIFF[1],76,{progress:diff,w:52});
  // the ball: rolls in from the left, waits, then is touched onto the new line
  const rollIn=flight(tt,.2,1.1,[-1150,B3[1]-10],B3,{smear:40}),touch=flight(tt,7.12,.53,B3,DIFFBALL,{smear:44});
  let bx=rollIn[0],by=rollIn[1],sq=rollIn[2],smear=rollIn[3],dir=0,rot=(bx+1150)/BR;
  if(tt>=7.12){bx=touch[0];by=touch[1];sq=touch[2];smear=touch[3];dir=Math.atan2(DIFF[1][1]-B3[1],DIFF[1][0]-B3[0]);rot=rollIn[0]>-1e9?(B3[0]+1150)/BR+Math.hypot(bx-B3[0],by-B3[1])/BR:0;}
  // the kid: watches the ball, steps and smears with the foot, kneels to chalk, stands, winds up and touches
  const stepL=sm(3.5,3.8,tt,easeOut)*(1-sm(4.4,4.7,tt,easeIO)),kx=X-200*stepL,ky=Yg+120*stepL;
  const kneel=sm(4.5,4.85,tt,easeOut)*(1-sm(5.6,6.1,tt,easeIO));
  if(scuff>0&&tt<4.45)figure(s,kx,ky,FIG,'kick',{seed:77,face:-1,k:.8,foot:[USUAL[0][0]+10-150*scuff,USUAL[0][1]+180*scuff],shade:G,glow:.45});
  else if(stepL>0&&tt<4.5)figure(s,kx,ky,FIG,'step',{seed:77,face:-1,k:stepL,shade:G,glow:.45});
  else if(kneel>0){const tipD:Pt=diff>0&&diff<1?along(DIFF,diff,76):diff>=1?DIFF[1]:DIFF[0],lift=diff<=0||diff>=1?40:0;
   const ground:Pt=[lerp(X,-240,kneel),lerp(Yg,330,kneel)],tipAir:Pt=[tipD[0],tipD[1]-lift],hand=handFor(ground,-1,tipAir);
   figure(s,ground[0],ground[1],FIG,'kneel',{seed:77,face:-1,k:kneel,reach:hand,shade:G,glow:.45});stick(s,hand,tipAir,77,lift>0?tipD:undefined);
   if(tt>=4.85)puff(s,DIFF[0][0],DIFF[0][1],tt-4.85,78,.8);}
  else if(tt>=6.8&&tt<7.7){const swing=anticipate(6.8,7.12,tt,{back:.5,hold:.6,e:easeIn});kicker(s,X,Yg,FIG,swing,[B3[0]+40,B3[1]+14],{seed:77,face:-1,shade:G,glow:.45});}
  else figure(s,X,Yg,FIG,tt<1.4?'scan':'stand',{seed:77,face:-1,k:1,look:tt<1.4?-.5:0,sight:tt<1.4?.8:0,shade:G,glow:.45});
  if(smear>0)speedLines(s,K,bx,by,tt>=7.12?dir:0,{n:5,seed:79,len:150,width:7,cov:.7});
  chalkBall(s,bx,by,BR,7,{sx:1+sq,sy:1-sq,rot,smear:{dir:tt>=7.12?dir:0,amount:smear}});
  puff(s,B3[0],B3[1],tt-1.3,80,.7);
  puff(s,B3[0],B3[1],tt-7.12,81,1);crumbs(s,B3[0],B3[1],tt-7.12,82);
  tick(s,TICK3[0],TICK3[1],90,83,sm(8,8.35,tt,easeOut));spark(s,TICK3[0],TICK3[1],t-8.3,84,150);
 },
 aperture(t){const tt=twos(t),f=flight(tt,7.12,.53,B3,DIFFBALL);return apertureDisc(f[0],f[1],50,12);},
 still:5.3,
};
/** 4 · look up: a torn pink block and a pink defender shove in from the right (shake, squash); a green teammate opens on the left; the kid chalks a short thick lane and plays the pass. */
const ch4:Scene={
 draw(s,t){
  const tt=twos(t);
  const shake=settle(t,1.6,{amp:14,freq:7,decay:5});
  court(s,14);
  cam(s,t,[[0,0,60,1.05],[.8,20,60,1.05],[1.6,80,50,1.05],[2.9,60,60,1.05],[3.5,-20,90,1.06],[5,-30,110,1.07],[7,-20,100,1.09],[9.5,40,60,1.12]],shake,-90);
  markings(s,14,-1100,-500,-.15);
  const X=-60,Yg=260;
  // pressure: the block and the defender slide in from the right (anticipate, push, settle), creep, then ease back after the pass
  const push=key(t,[[.82,1300],[1.05,1350,easeIn],[1.6,330,easeOut],[5,300],[7.2,300],[8,370]])+8*settle(t,1.6,{amp:1,freq:5,decay:5});
  const crumple=t>=1.6?.6*Math.exp(-(t-1.6)*1.2):0;
  if(push<1290){block(s,push,-760,900,920,27,{crumple});figure(s,push-20,140,520,'step',{ink:P,seed:23,face:-1,k:.6+.4*sm(1.3,1.6,t),shade:K});
   if(t>=1.6){puff(s,push-20,-260,tt-1.6,86,1.3);crumbs(s,push-40,120,tt-1.6,87,{n:9,r:300});}}
  // support: the green teammate runs in from the left and opens their arms
  const run=sm(2.9,3.5,tt,easeOut),mate:Pt=[lerp(-1200,MATE4[0],run),MATE4[1]];
  const mateFoot:Pt=[MATE4[0]+60,MATE4[1]+16];
  if(tt>=2.9){const cush=tt>=7.1&&tt<7.6?.6*(1-sm(7.1,7.6,tt)):0;
   if(cush>0)figure(s,mate[0],mate[1],600,'kick',{ink:G,seed:89,face:1,k:cush,foot:[mateFoot[0]-10,mateFoot[1]+6],shade:K});
   else figure(s,mate[0],mate[1],600,run<1?'run':'arms',{ink:G,seed:89,face:1,k:run<1?1:.7,shade:K});}
  // the short lane chalked on "Choose one small action", then the pass
  const lane=sm(5.2,5.7,tt,easeIO);if(lane>0)chalkArrow(s,LANE4[0],LANE4[1],88,{progress:lane,w:56,head:150});
  const pass=flight(tt,6.5,.65,BALL4,mateFoot,{smear:40});
  const bx=tt>=6.5?pass[0]:BALL4[0],by=tt>=6.5?pass[1]:BALL4[1],sq=tt>=6.5?pass[2]:0,smear=tt>=6.5?pass[3]:0,dir=Math.atan2(mateFoot[1]-BALL4[1],mateFoot[0]-BALL4[0]);
  // the kid: head lifts and scans right (pressure) then left (support); squashed by the push; kneels to chalk; kicks
  const lift=sm(0,.5,tt,easeOut),look=key(tt,[[.3,1],[2.6,1],[3.2,-1],[9.5,-1]]),sight=sm(.3,.6,tt)*(1-sm(4.9,5.2,tt));
  const sqz=1-.1*sm(1.4,1.6,tt,easeIn)*(1-sm(1.6,2.6,tt,easeOut));
  const kneel=sm(5,5.3,tt,easeOut)*(1-sm(5.8,6.1,tt,easeIO));
  if(kneel>0){const tipL:Pt=lane>0&&lane<1?along(LANE4,lane,88):lane>=1?LANE4[1]:LANE4[0],liftL=lane<=0||lane>=1?40:0;
   const ground:Pt=[lerp(X,150,kneel),lerp(Yg,470,kneel)],tipAir:Pt=[tipL[0],tipL[1]-liftL],hand=handFor(ground,-1,tipAir);
   figure(s,ground[0],ground[1],FIG,'kneel',{seed:77,face:-1,k:kneel,reach:hand,shade:G,glow:.45});stick(s,hand,tipAir,77,liftL>0?tipL:undefined);
   if(tt>=5.2)puff(s,LANE4[0][0],LANE4[0][1],tt-5.2,90,.8);}
  else if(tt>=6.2&&tt<7){const swing=anticipate(6.2,6.5,tt,{back:.5,hold:.6,e:easeIn});kicker(s,X,Yg,FIG,swing,[BALL4[0]+10,BALL4[1]+10],{seed:77,face:-1,shade:G,glow:.45});}
  else figure(s,X,Yg,FIG,'scan',{seed:77,face:tt>=5.8?-1:1,k:1,look:tt>=5.8?0:look,sight,lift:lift*.5,sx:sqz,shade:G,glow:.45});
  if(smear>0)speedLines(s,K,bx,by,dir,{n:4,seed:91,len:120,width:6,cov:.7});
  chalkBall(s,bx,by,BR,8,{sx:1+sq,sy:1-sq,rot:tt>=6.5?(Math.hypot(bx-BALL4[0],by-BALL4[1])/BR):0,smear:{dir,amount:smear}});
  puff(s,BALL4[0],BALL4[1],tt-6.5,92,.9);crumbs(s,BALL4[0],BALL4[1],tt-6.5,93,{n:6});
 },
 aperture(){return apertureDisc(400,-300,90,12);},
 still:4.2,
};
/** 5 · the pass goes long; a big chalk X where it went wrong; the look (camera pan) finds the closing space; the too-big touch as a long arc; the kid rubs it and chalks the right size in yellow. */
const ch5:Scene={
 draw(s,t){
  const tt=twos(t);
  court(s,15);
  cam(s,t,[[0,-60,120,1],[1,-20,100,1],[2.7,-20,100,1],[3.6,20,60,1.02],[5.9,10,80,1.02],[7.5,-20,100,1.04],[9.5,20,80,1.06]],0,-90);
  markings(s,15,-900,1100,.1);
  // the long pass: past the teammate to the X spot
  const fl=flight(tt,0,.95,[-200,590],BALL5,{smear:64});
  const bx=fl[0],by=fl[1],sq=fl[2],smear=fl[3],dir=Math.atan2(BALL5[1]-590,BALL5[0]+200);
  // the X where it went wrong, the long arc (too big) and the short yellow arc (the right size) beside it
  chalkX(s,X5[0],X5[1],110,99,sm(1.2,1.8,tt,easeOut));
  puff(s,X5[0]-90,X5[1]-70,tt-1.2,100,.8);puff(s,X5[0]+90,X5[1]-70,tt-1.5,101,.8);
  const rub=sm(6,6.4,tt,easeIO);
  const big=sm(4.4,5.3,tt,easeIO);if(big>0)chalk(s,arcPts(FOOT5,X5,-140),104,{progress:big,w:44,cov:.94*(1-.62*rub)});
  const small=sm(6.4,6.8,tt,easeIO);if(small>0){const pts=partial(smoothPts(arcPts(FOOT5,YARC5,-60),false,6),small);if(pts.length>1){const path=ribbon(pts,44,{seed:109,pressure:.5,taper:.4,wobble:1.6});s.knockout(ribbon(pts,84,{seed:110,taper:.5,wobble:3,step:10}),.2);s.knockout(path,.95);s.fill(Y,path,.95);}}
  tick(s,TICK5[0],TICK5[1],90,111,sm(6.8,7.1,tt,easeOut));spark(s,TICK5[0],TICK5[1],t-7.05,112,150);
  // the space closing: a pink defender steps into the gap by the teammate as the look arrives
  const stepIn=key(t,[[2.9,900],[3.02,940,easeIn],[3.6,300,easeOut]])+8*settle(t,3.6,{amp:1,freq:5,decay:5});
  if(t>=2.9)figure(s,stepIn,420,500,'step',{ink:P,seed:24,face:-1,k:.6+.4*sm(3.3,3.6,t),shade:K});
  if(t>=3.6){puff(s,stepIn-60,420,tt-3.6,113,.9);crumbs(s,stepIn-60,410,tt-3.6,114,{n:6});}
  // the teammate reaches for the ball as it flies past
  const reach=sm(.3,.6,tt,easeOut)*(1-sm(1.6,2.2,tt));
  figure(s,MATE5[0],MATE5[1],520,reach>0?'up':'arms',{ink:G,seed:89,face:-1,k:reach>0?reach:.7,shade:K});
  // the kid: follows through the kick, slumps as it fails, looks to the X (sight wedge), kneels to rub the arc and chalk the yellow one, straightens
  const slump=sm(1,1.6,tt,easeOut)*(1-sm(5.6,6,tt,easeOut)),look=sm(2.6,2.9,tt,easeOut),sight=look*(1-sm(4.4,4.8,tt));
  const kneel=sm(5.98,6.3,tt,easeOut)*(1-sm(7.4,7.8,tt,easeIO));
  if(tt<.6)kicker(s,YOU5[0],YOU5[1],FIG,1-sm(.3,.6,tt)*.5,[FOOT5[0]+40,FOOT5[1]-20],{seed:28,face:1,shade:G,glow:.45});
  else if(kneel>0){const rubP:Pt=[lerp(FOOT5[0],FOOT5[0]+160,.5+.5*Math.sin(tt*14)*(rub>0&&rub<1?1:0)),FOOT5[1]-lerp(0,220,.5+.5*Math.sin(tt*14)*(rub>0&&rub<1?1:0))];
   const tipS:Pt=small>0&&small<1?partial(smoothPts(arcPts(FOOT5,YARC5,-60),false,6),small).slice(-1)[0]:small>=1?YARC5:rubP,lift=tt>=6.4&&small>=1?40:0;
   const ground:Pt=[lerp(YOU5[0],FOOT5[0]-200,kneel),lerp(YOU5[1],FOOT5[1]+40,kneel)],tipAir:Pt=[tipS[0],tipS[1]-lift],hand=handFor(ground,1,tipAir);
   figure(s,ground[0],ground[1],FIG,'kneel',{seed:28,face:1,k:kneel,reach:hand,shade:G,glow:.45});stick(s,hand,tipAir,28,lift>0?tipS:undefined);
   if(rub>0&&rub<1)puff(s,FOOT5[0]+80,FOOT5[1]-110,tt-6,115,1);}
  else figure(s,YOU5[0],YOU5[1],FIG,'slump',{seed:28,face:1,k:slump*.7,look,sight,shade:G,glow:.45});
  if(smear>0)speedLines(s,K,bx,by,dir,{n:6,seed:116,len:180,width:7,cov:.7});
  chalkBall(s,bx,by,BR,9,{sx:1+sq,sy:1-sq,rot:Math.hypot(bx+200,by-590)/BR,smear:{dir,amount:smear}});
  puff(s,BALL5[0],BALL5[1],tt-.95,102,1.2);crumbs(s,BALL5[0],BALL5[1],tt-.95,103,{n:8,r:260});
  dustCloud(s,X5[0],X5[1],t-8.5,117,{r:260,n:50,size:14});
 },
 aperture(){return apertureDisc(X5[0],X5[1],90,12);},
 still:5.6,
};
/** 6 · the whole chalk drawing fills the ground; the kid walks the drawn line with the ball, head up; two ticks; the star returns bigger. */
const PATH6:Pt[]=[[-300,140],[20,120],[300,90]];
const MAP:Mark[]=[{pts:M1},{pts:[...M1B.slice(0,-1),[330,86]],arrow:true},{pts:M2,arrow:true},{pts:M3},{pts:M4},{pts:M5},
 {pts:[[-380,560],[-380,780]],cov:.3,w:44},{pts:[[-460,480],[-680,220]],arrow:true,w:52},{pts:tickPts(-620,130,80),w:34,y:true},
 {pts:[[-100,720],[-380,860]],arrow:true,w:56},{pts:[[460,620],[100,0]],x:true},{pts:[[-60,920],[460,620]],w:44,lift:160},{pts:[[-60,920],[240,780]],w:44,y:true,lift:70},{pts:tickPts(330,930,80),w:34,y:true}];
const ch6:Scene={
 draw(s,t){
  const tt=twos(t);
  court(s,16);
  cam(s,t,[[0,-40,80,.8],[3,-30,30,.8],[4.94,0,-30,.79],[8,20,-120,.78],[11.1,40,-170,.78]],0,-50);
  markings(s,16,-100,-900);
  // the map (static, batched) with the yellow marks drawn as yellow-on-paper
  chalkMap(s,MAP,121);
  // the kid walks the drawn line with the ball, head up; stops to look on "Look, try, learn"; walks on
  const walk=key(t,[[.6,0],[4.6,.5,easeIO],[5.2,.5],[10,1,easeIO]]);
  const P=(u:number):Pt=>{const n=PATH6.length-1,i=Math.min(n-1,Math.floor(u*n)),f=u*n-i;return L2(PATH6[i],PATH6[i+1],f);};
  const pos=P(walk),moving=walk>0&&walk<1&&!(t>=4.6&&t<5.2),face:1|-1=1;
  const stride=twosIndex(t)%2;
  // look (sight wedge), try (a tick), learn (a second tick + spark)
  const look=sm(4.94,5.2,tt,easeOut)*(1-sm(6.6,6.9,tt));
  tick(s,240,-60,80,136,sm(5.5,5.85,tt,easeOut));tick(s,-60,-120,80,137,sm(6.1,6.45,tt,easeOut));spark(s,-60,-120,t-6.4,138,150);
  const fig=figure(s,pos[0],pos[1],FIG,moving?(stride?'run':'step'):'stand',{seed:143,face,k:moving?.9:1,look:look>0?1:0,sight:look,lift:.3,shade:G,glow:.45});
  const bpos:Pt=[pos[0]+face*150,pos[1]+20];
  chalkBall(s,bpos[0],bpos[1],BR,12,{rot:walk*12});
  if(moving)dust(s,null,pos[0]-face*40,pos[1]+10,70,5,{seed:144+stride,size:10,cov:.6});
  // the star returns, bigger, on "Confidence can grow"
  const g=easeOutBack(sm(6.9,7.5,t));
  star(s,fig.head[0],fig.head[1]-fig.R-190,160,21,{g,pulse:.5+.5*Math.sin(tt*3),spin:tt*.25});
 },
 still:8.4,
};

export const story:RisoStory={
 id:'chalk-line',format:'futsal',title:'The Chalk Line',theme:'Creative confidence',ageNote:'For futsal players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',pink:'#ff48b0',green:'#00a95c',navy:'#22366b'},order:['yellow','pink','green','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:[
  {label:'Before you feel ready',narration:'What if confidence comes after you begin? Waiting until you feel completely ready can keep a useful idea inside your head.',seconds:10,audio:CH+'01.m4a',cues:[{at:0,words:'What if'},{at:3.18,words:'Waiting until'},{at:6,words:'a useful idea'}]},
  {label:'Room to explore',headline:{text:'One mark',at:1.94},narration:'Think of a chalk line. One small mark opens a direction. Another changes it. You can explore without knowing the whole picture.',seconds:10,audio:CH+'02.m4a',cues:[{at:0,words:'Think of'},{at:1.94,words:'One small mark'},{at:4.48,words:'Another changes'}]},
  {label:'Try something useful',headline:'Try it',narration:'Creative confidence means being willing to test an idea and learn. In futsal, that might mean trying a different first touch.',seconds:9.9,audio:CH+'03.m4a',cues:[{at:0,words:'Creative confidence'},{at:2.5,words:'test an idea'},{at:6.8,words:'a different first touch'}]},
  {label:'Notice your options',headline:{text:'Pressure',at:.82},narration:'Look up before the ball arrives. Where is the pressure? Where is your support? Choose one small action that fits what you see.',seconds:9.5,audio:CH+'04.m4a',cues:[{at:0,words:'Look up'},{at:.82,words:'Where is the pressure'},{at:4.96,words:'Choose one small action'}]},
  {label:'A mistake gives information',headline:'Information',narration:'If it fails, ask what you noticed. Was the space closing? Was the touch too big? Feedback helps shape the next attempt.',seconds:9.5,audio:CH+'05.m4a',cues:[{at:0,words:'If it fails'},{at:2.7,words:'Was the space closing'},{at:5.98,words:'Feedback helps'}]},
  {label:'Look. Try. Learn.',narration:'You do not need every idea to work. Give yourself permission to explore. Look, try, learn. Confidence can grow through useful practice.',seconds:11.1,audio:CH+'06.m4a',cues:[{at:0,words:'You do not need'},{at:4.94,words:'Look, try, learn'},{at:6.82,words:'Confidence can grow'}]},
 ],
 draw(f){playChapters(story,f,[ch1,ch2,ch3,ch4,ch5,ch6]);},
 /** Touch: a chalk puff (~400 u), a fresh 200 u chalk tick, crumbs and a yellow spark. Reduced motion: the static tick. */
 touch(s,x,y,age,seed){
  const r=rng(seed);const a=r()*Math.PI*2;
  puff(s,x,y,age,seed,1.4);
  chalk(s,[[x-100,y+20],[x-30,y+90],[x+110,y-100]],seed,{progress:age>0?sm(0,.3,age,easeOut):1,w:40});
  if(age>0){crumbs(s,x,y,age,seed+2,{n:7,r:240});spark(s,x+Math.cos(a)*70,y+Math.sin(a)*70,age-.15,seed+1,150);}
 },
};
