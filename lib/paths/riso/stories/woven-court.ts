/** The Woven Court — riso. Lead material: thread. Pink = you, blue = teammates, yellow = pressure (snags → defenders), navy key.
 * A connection is literally an overprint: pink × blue prints purple wherever two threads cross.
 * Background (unique to this story): the loom lattice — blue warp bands crossed by pink weft bands at spec coverage (.2/.32) with wobbled
 * edges and a paper rest zone around the ball; the lattice bows with the drawn weave a frame late.
 * Legibility pass (bible §1c): abstract cut-paper player figures (pink = you, blue = teammates, yellow = defenders) replace the shuttles
 * and snags; the knot-ball shows thread winding over a football's centre panel; chapter 2 is a goal net catching the ball;
 * seam 3→4 is a thread pulled across the frame that unravels. Scenes read only their local time t; drawn objects pose on twos. */
import type {Sheet} from '../sheet';
import {type RisoStory,type Scene,playChapters} from '../story';
import {aperture,apertureDisc} from '../passage';
import {twos,sm,key,anticipate,settle,spring,clamp,lerp,rng,hash,noise1,blob,polyPath,ribbon,wob,smoothPts,partial,along,rotPts,circlePath,rectPath,arc,easeOut,easeIn,easeIO,easeOutBack,TAU,type Pt,type Key} from '../motion';
import {dust,laneArrow,speedLines,handCut,ring,crescent} from '../shapes';

const CH='/stories/narration/futsal/woven-court/';
const K='navy',P='pink',B='blue',Y='yellow';
type Field=(x:number,y:number)=>number;
const gauss=(d2:number,r:number)=>Math.exp(-d2/(r*r));
/** a quick rise then a decay after t0 — scatter impulses, shoves */
const pulse=(t:number,t0:number,len=1)=>t<t0?0:Math.min(1,(t-t0)*10)*Math.exp(-(t-t0)*2.4/len);
const add=(a:Pt,b:Pt):Pt=>[a[0]+b[0],a[1]+b[1]];
const towards=(a:Pt,b:Pt,d:number):Pt=>{const dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy)||1;return[dx/L*d,dy/L*d];};

// ---------------- abstract riso figure (bible §1c.4) ----------------
/** A cut-paper player pictogram: a big head disc, a torn torso block, two leg strokes, two arm strokes — 4–6 plate ops, no anatomy, no face.
 * (x,y) = the ground point under the body, h = height, face = +1 looks right. Poses are parameter tables blended from `stand` by k (0..1).
 * ink 'paper' = paper body with navy contour and navy limbs; an ink = that ink knocked out beneath, navy contour.
 * reach = world point the front arm ends at (a thread); foot = world point the front leg ends at (a kick). look turns the head; sight prints a paper wedge. */
type Pose='stand'|'scan'|'run'|'arms'|'up'|'slump'|'step'|'listen'|'crouch'|'kick'|'pull';
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
 pull:{tilt:-.3,head:[-.02,0],legF:[.32,0],legB:[-.18,0],armF:[.4,-.22],armB:[.34,-.14],hip:.03},
};
type FigOpts={ink?:string;line?:string;seed?:number;face?:1|-1;look?:number;k?:number;cov?:number;reach?:Pt;foot?:Pt;shade?:string;sight?:number;knock?:boolean};
function figure(s:Sheet,x:number,y:number,h:number,pose:Pose,o:FigOpts={}){
 const{ink='paper',line=K,seed=1,face=1,look=0,k=1,cov=.92,reach,foot,shade,sight=0,knock=true}=o;if(h<8)return;
 const base=POSES.stand,p=POSES[pose],L=(a:number,b:number)=>lerp(a,b,k),LP=(a:Pt,b:Pt):Pt=>[lerp(a[0],b[0],k),lerp(a[1],b[1],k)];
 const tilt=L(base.tilt,p.tilt),head=LP(base.head,p.head),legF=LP(base.legF,p.legF),legB=LP(base.legB,p.legB),armF=LP(base.armF,p.armF),armB=LP(base.armB,p.armB),hip=L(base.hip,p.hip);
 const R=h*.16,tw=h*.3,th=h*.38,legL=h*.3,hipY=-legL+hip*h,ca=Math.cos(tilt),sa=Math.sin(tilt);
 const W=(lx:number,ly:number):Pt=>[x+lx*face,y+ly];
 const T=(lx:number,ly:number):Pt=>[lx*ca-ly*sa,hipY+lx*sa+ly*ca];
 const corners=[T(-tw/2,0),T(tw/2,0),T(tw/2,-th),T(-tw/2,-th)].map(q=>W(q[0],q[1]));
 const torso=polyPath(handCut(corners,seed,h*.02,h*.12),true);
 const shF=T(tw*.42,-th+R*.25),shB=T(-tw*.42,-th+R*.25);
 const hc=T(0,-th-R*1.05),headC=W(hc[0]+head[0]*h+look*R*.42,hc[1]+head[1]*h),headPts=blob(headC[0],headC[1],R,R*.96,seed+2,{amp:.05,n:30});
 const headPath=polyPath(headPts,true);
 const hipF=W(tw*.18,hipY),hipB=W(-tw*.18,hipY);
 const fF=foot?foot:W(legF[0]*h,legF[1]*h),fB=W(legB[0]*h,legB[1]*h);
 const aF=reach?reach:W(shF[0]+armF[0]*h,shF[1]+armF[1]*h),aB=W(shB[0]+armB[0]*h,shB[1]+armB[1]*h);
 const limbs=new Path2D();
 limbs.addPath(ribbon([hipF,fF],h*.08,{seed:seed+3,pressure:.4,taper:.25,wobble:1.4}));limbs.addPath(ribbon([hipB,fB],h*.08,{seed:seed+4,pressure:.4,taper:.25,wobble:1.4}));
 limbs.addPath(ribbon([W(shB[0],shB[1]),aB],h*.062,{seed:seed+5,pressure:.4,taper:.35,wobble:1.4}));limbs.addPath(ribbon([W(shF[0],shF[1]),aF],h*.062,{seed:seed+6,pressure:.4,taper:.35,wobble:1.4}));
 const body=new Path2D();body.addPath(torso);body.addPath(headPath);
 const outline=new Path2D();outline.addPath(ribbon(handCut(corners,seed,h*.02,h*.12),Math.max(4,h*.02),{seed:seed+7,close:true,pressure:.6,wobble:1.6,gaps:[[.62,.66]]}));outline.addPath(ribbon(headPts,Math.max(4,h*.02),{seed:seed+8,close:true,pressure:.6,wobble:1.4}));
 if(sight>0){const d=face*(look>=0?1:-1),sx=headC[0]+d*R*.6,wedge=polyPath([[headC[0],headC[1]],[sx+d*h*.55,headC[1]-h*.22],[sx+d*h*.55,headC[1]+h*.12]],true);s.knockout(wedge,.3*sight);}
 if(ink==='paper'){if(knock)s.knockout(body,cov);s.fill(line,limbs);s.fill(line,outline);}
 else{const all=new Path2D();all.addPath(body);all.addPath(limbs);if(knock)s.knockout(all);s.fill(ink,all,cov);s.fill(line,outline,.9);}
 if(shade){const sh=new Path2D();sh.addPath(crescent(headC[0],headC[1],R*.98,[-.35*face,-.4]));sh.addPath(polyPath([corners[0],[lerp(corners[1][0],corners[0][0],.5),lerp(corners[1][1],corners[0][1],.5)],[lerp(corners[2][0],corners[3][0],.5),lerp(corners[2][1],corners[3][1],.5)],corners[3]],true));s.tone(shade,sh,.45);}
}
/** The figure's front-hand point (where a held thread ends) for a figure at (x,y,h) facing `face` in the `pull` / `arms` poses. */
const handOf=(x:number,y:number,h:number,face:1|-1,dx=.4,dy=-.9):Pt=>[x+face*h*dx,y+h*dy];

// ---------------- the world: loom lattice ----------------
/** Warp (blue, vertical) and weft (pink, horizontal) grainy bands, two stepped coverages alternating band by band.
 * sagY displaces weft bands vertically, sagX warp bands sideways (the lattice bows with the weave). Four fills however dense. */
function loom(s:Sheet,o:{pitch:number;cov:[number,number];seed:number;ox?:number;oy?:number;ext?:number;wobble?:number;sagY?:Field;sagX?:Field;inks?:[string,string];dirs?:'both'|'warp'|'weft'}){
 const{pitch,cov,seed,ox=0,oy=0,ext=1700,wobble=Math.min(16,Math.max(8,pitch*.08)),sagY,sagX,inks=[B,P],dirs='both'}=o,w=pitch*.64,step=Math.max(90,pitch*1.4),n=Math.ceil(ext/pitch);
 const warp=[new Path2D(),new Path2D()],weft=[new Path2D(),new Path2D()];
 for(let i=-n;i<=n;i++){
  const x0=ox+i*pitch+(hash(i,seed)-.5)*pitch*.1,left:Pt[]=[],right:Pt[]=[];
  for(let y=oy-ext;y<=oy+ext+step;y+=step){const wv=wobble*noise1(y/300+i*2.7,seed+i),dx=sagX?sagX(x0,y):0;left.push([x0-w/2+wv+dx,y]);right.push([x0+w/2+wv*.7+dx,y]);}
  const p=polyPath([...left,...right.reverse()],true);warp[Math.abs(i)%2].addPath(p);
 }
 for(let j=-n;j<=n;j++){
  const y0=oy+j*pitch+(hash(j+50,seed)-.5)*pitch*.1,top:Pt[]=[],bot:Pt[]=[];
  for(let x=ox-ext;x<=ox+ext+step;x+=step){const wv=wobble*noise1(x/300+j*1.9,seed+40+j),dy=sagY?sagY(x,y0):0;top.push([x,y0-w/2+wv+dy]);bot.push([x,y0+w/2+wv*.7+dy]);}
  const p=polyPath([...top,...bot.reverse()],true);weft[Math.abs(j)%2].addPath(p);
 }
 if(dirs!=='weft'){s.fill(inks[0],warp[0],cov[0]);s.fill(inks[0],warp[1],cov[1]);}if(dirs!=='warp'){s.fill(inks[1],weft[0],cov[0]);s.fill(inks[1],weft[1],cov[1]);}
}
/** The paper rest zone around the ball (cross-story fix 10): a soft knockout so the lattice does not vibrate behind the lead object. */
const rest=(s:Sheet,x:number,y:number,r:number,seed:number,cov=.5)=>s.knockout(polyPath(blob(x,y,r,r*.9,seed,{amp:.08,n:24}),true),cov);
/** Loose fibre flecks (cream knockouts and a few blue) in a disc; scatter pushes them outward, dx/dy drifts them. */
function flecks(s:Sheet,x:number,y:number,r:number,n:number,seed:number,o:{scatter?:number;dx?:number;dy?:number;size?:number}={}){
 const{scatter=0,dx=0,dy=0,size=26}=o,rr=rng(seed),paper=new Path2D(),blue=new Path2D();
 for(let i=0;i<n;i++){const a=rr()*TAU,d=Math.sqrt(rr())*r,sz=size*(.5+rr()),rot=rr()*TAU+scatter*2,px=x+Math.cos(a)*(d+scatter*110)+dx,py=y+Math.sin(a)*(d+scatter*110)+dy;
  const q=rotPts([[-sz*.5,-sz*.35],[sz*.5,-sz*.45],[sz*.4,sz*.4],[-sz*.4,sz*.35]],rot),p=i%3===2?blue:paper;p.moveTo(px+q[0][0],py+q[0][1]);for(let k=1;k<4;k++)p.lineTo(px+q[k][0],py+q[k][1]);p.closePath();}
 s.knockout(paper,.9);s.fill(B,blue,.75);
}
/** A ribbon whose width varies along the line: width(u, point). One path op. */
function ribbonVar(pts:Pt[],width:(u:number,p:Pt)=>number,o:{seed?:number;wobble?:number;step?:number}={}):Path2D{
 const{seed=1,wobble=1.4,step=8}=o,q=wobble?wob(pts,wobble,seed,false,{step}):smoothPts(pts,false,step),n=q.length,path=new Path2D();if(n<2)return path;
 const sl=[0];for(let i=1;i<n;i++)sl.push(sl[i-1]+Math.hypot(q[i][0]-q[i-1][0],q[i][1]-q[i-1][1]));const L=sl[n-1]||1,left:Pt[]=[],right:Pt[]=[];
 for(let i=0;i<n;i++){const a=q[Math.max(0,i-1)],b=q[Math.min(n-1,i+1)],nx=a[1]-b[1],ny=b[0]-a[0],l=Math.hypot(nx,ny)||1,w=Math.max(.6,width(sl[i]/L,q[i]))/2;left.push([q[i][0]+nx/l*w,q[i][1]+ny/l*w]);right.push([q[i][0]-nx/l*w,q[i][1]-ny/l*w]);}
 path.moveTo(left[0][0],left[0][1]);for(let k=1;k<n;k++)path.lineTo(left[k][0],left[k][1]);for(let k=n-1;k>=0;k--)path.lineTo(right[k][0],right[k][1]);path.closePath();return path;
}
/** A thread: pressure-varied ribbon that can draw itself on (progress) and fray (fray 0..1 triples the wobble and lifts navy fluff). */
function strand(s:Sheet,ink:string,pts:Pt[],width:number,o:{seed?:number;progress?:number;cov?:number;fray?:number;wobble?:number;gaps?:[number,number][];widthFn?:(u:number,p:Pt)=>number;rim?:boolean}={}){
 const{seed=1,progress=1,cov=1,fray=0,wobble=1.4,gaps,widthFn,rim=true}=o,line=progress>=1?pts:partial(smoothPts(pts,false,8),clamp(progress));if(line.length<2)return;
 if(rim&&ink!==K)s.fill(K,widthFn?ribbonVar(line,(u,p)=>widthFn(u,p)+9,{seed:seed+3,wobble:wobble*(1+fray*2.2)}):ribbon(line,width+9,{seed:seed+3,pressure:.4,taper:.25,wobble:wobble*(1+fray*2.2),gaps,step:8}),.5);
 if(widthFn)s.fill(ink,ribbonVar(line,widthFn,{seed,wobble:wobble*(1+fray*2.2)}),cov);
 else s.fill(ink,ribbon(line,width,{seed,pressure:.4,taper:.25,wobble:wobble*(1+fray*2.2),gaps,step:8}),cov);
 if(fray>.15){const m=line[Math.floor(line.length/2)];dust(s,K,m[0],m[1],width*2.2,Math.round(3+fray*4),{seed:seed+9,size:width*.16,cov:.9});}
}
/** The knot-ball: a paper football with a navy centre panel, wound with three loops of navy thread (ticks = twist) and knots where the
 * loops cross; a pink halftone shadow; a paper highlight. Reads as a ball first (round, white, dark panel) and as thread second. ≈ 8 ops. */
function knotBall(s:Sheet,x:number,y:number,r:number,seed:number,o:{rot?:number;sx?:number;sy?:number;hi?:number}={}){
 const{rot=0,sx=1,sy=1,hi=.7}=o,disc=polyPath(blob(x,y,r*sx,r*sy,seed,{amp:.025,n:44}),true);
 s.knockout(disc);
 s.save();s.clip(disc);
 s.tone(P,crescent(x,y,r*1.06*Math.max(sx,sy),[-.4,-.45]),.32);
 const pent:Pt[]=[];for(let i=0;i<5;i++){const a=rot-Math.PI/2+i/5*TAU;pent.push([x+Math.cos(a)*r*.3*sx,y+Math.sin(a)*r*.3*sy]);}
 s.fill(K,polyPath(wob(pent,r*.02,seed+3,true,{step:6,corner:.5}),true),.95);
 const loops=new Path2D(),ticks=new Path2D();
 for(let k=0;k<3;k++){const a=rot+k*Math.PI/3+.3,pts=blob(0,0,r*.98,r*.36,seed+5+k,{amp:.02,n:40,rot:a}).map(p=>[x+p[0]*sx,y+p[1]*sy] as Pt);loops.addPath(ribbon(pts,r*.07,{seed:seed+6+k,close:true,pressure:.4,wobble:r*.012,step:6}));
  for(let i=0;i<40;i+=5){const p=pts[i],q=pts[(i+1)%40],nx=p[1]-q[1],ny=q[0]-p[0],l=Math.hypot(nx,ny)||1,tw=r*.08;ticks.moveTo(p[0]-nx/l*tw,p[1]-ny/l*tw);ticks.lineTo(p[0]+nx/l*tw+(q[0]-p[0])/l*tw*.5,p[1]+ny/l*tw+(q[1]-p[1])/l*tw*.5);}}
 s.fill(K,loops,.92);s.stroke(K,ticks,Math.max(1.5,r*.03),.9);
 s.restore();
 s.fill(K,ribbon(blob(x,y,r*sx,r*sy,seed+1,{amp:.02,n:48}),Math.max(3,r*.075),{seed:seed+2,close:true,pressure:.6,wobble:r*.02}));
 const knots=new Path2D();for(let i=0;i<5;i++){const a=rot-Math.PI/2+i/5*TAU;knots.addPath(circlePath(x+Math.cos(a)*r*.74*sx,y+Math.sin(a)*r*.74*sy,r*.085));}s.fill(K,knots);
 if(hi>0)s.knockout(circlePath(x-r*.42*sx,y-r*.45*sy,r*.11*hi));
}
/** Purple knots: pink disc × blue disc (the overprint is the connection) with a navy loop and a tail. Batched: three ops for any number. */
function knots(s:Sheet,list:{x:number;y:number;r:number;seed:number}[],o:{cov?:number;loop?:boolean}={}){
 const{cov=1,loop=true}=o,d=new Path2D(),l=new Path2D();let any=false;
 for(const k of list){if(k.r<=2)continue;any=true;d.addPath(polyPath(blob(k.x,k.y,k.r,k.r,k.seed,{amp:.06}),true));if(loop){l.addPath(ribbon(blob(k.x,k.y,k.r*1.22,k.r*1.16,k.seed+1,{amp:.05,n:28}),Math.max(3,k.r*.2),{seed:k.seed+2,close:true,pressure:.5,wobble:k.r*.05,gaps:[[.55,.62]]}));l.addPath(ribbon([[k.x+k.r*.9,k.y+k.r*.6],[k.x+k.r*1.6,k.y+k.r*1.5]],Math.max(3,k.r*.18),{seed:k.seed+3,taper:.7,wobble:1}));}}
 if(!any)return;s.fill(P,d,cov);s.fill(B,d,cov);if(loop)s.fill(K,l,cov);
}
/** Paper vibration rings (a call travelling along a thread). One knockout for all. */
function rings(s:Sheet,list:{x:number;y:number;r:number}[],width=10,cov=.9){const p=new Path2D();let any=false;for(const r of list){if(r.r<=4)continue;any=true;p.addPath(ring(r.x,r.y,Math.max(1,r.r-width/2),r.r+width/2));}if(any)s.knockout(p,cov);}
/** A cloth tear: paper rip with hand-cut edges from (x,y0) down to (x,y1); progress opens it, width closes it. */
function tear(s:Sheet,x:number,y0:number,y1:number,seed:number,progress:number,width=22){if(progress<=0||width<=1)return;const y=y0+(y1-y0)*progress,pts=handCut([[x-width/2,y0],[x+width/2,y0],[x+width/2,y],[x-width/2,y]],seed,width*.9,40);s.knockout(polyPath(pts,true));}
/** The goal: navy posts and bar with a fine woven net (blue warp / pink weft), or paper when the night prints it. */
function loomFrame(s:Sheet,x:number,y:number,w:number,h:number,seed:number,o:{paper?:boolean;progress?:number}={}){
 const{paper=false,progress=1}=o,warp=new Path2D(),weft=new Path2D(),pitch=22;
 for(let gx=x-w/2+pitch;gx<x+w/2;gx+=pitch)warp.addPath(rectPath(gx-2,y-h/2,4,h*clamp(progress*2)));
 for(let gy=y-h/2+pitch;gy<y+h/2;gy+=pitch)weft.addPath(rectPath(x-w/2,gy-2,w*clamp(progress*2-1),4));
 const bars=ribbon([[x-w/2,y+h/2],[x-w/2,y-h/2],[x+w/2,y-h/2],[x+w/2,y+h/2]],14,{seed,pressure:.5,taper:.1,wobble:1.6}),hooks=new Path2D();
 for(let gx=x-w/2+pitch*1.5;gx<x+w/2;gx+=pitch*2)hooks.addPath(polyPath([[gx-6,y-h/2-6],[gx+6,y-h/2-6],[gx,y-h/2+10]],true));
 if(paper){const all=new Path2D();all.addPath(warp);all.addPath(weft);all.addPath(bars);all.addPath(hooks);s.knockout(all,.92);}
 else{s.fill(B,warp,.75);s.fill(P,weft,.75);s.fill(K,bars);s.fill(K,hooks);}
}
/** Court lines as navy thread (one fill). lines = polylines; progress draws every line from its first point. */
function courtLines(s:Sheet,lines:Pt[][],width:number,seed:number,progress=1,paper=false){const p=new Path2D();lines.forEach((l,i)=>{const q=progress>=1?l:partial(smoothPts(l,false,10),progress);if(q.length>1)p.addPath(ribbon(q,width,{seed:seed+i,pressure:.35,taper:.15,wobble:1.6,step:12}));});if(paper)s.knockout(p,.92);else s.fill(K,p);}
const circle=(x:number,y:number,r:number,n=40):Pt[]=>{const o:Pt[]=[];for(let i=0;i<=n;i++){const a=i/n*TAU;o.push([x+Math.cos(a)*r,y+Math.sin(a)*r]);}return o;};
const arcPts=(x:number,y:number,r:number,a0:number,a1:number,n=20):Pt[]=>{const o:Pt[]=[];for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n;o.push([x+Math.cos(a)*r,y+Math.sin(a)*r]);}return o;};
/** Plucked thread between a and b: pulled sideways at `at` (0..1) by pull, then a damped standing wave after release. */
function plucked(a:Pt,b:Pt,pull:number,at:number,age:number,n=16):Pt[]{const nx=-(b[1]-a[1]),ny=b[0]-a[0],L=Math.hypot(nx,ny)||1,ux=nx/L,uy=ny/L,out:Pt[]=[];
 for(let i=0;i<=n;i++){const u=i/n;let d=0;if(age<0)d=pull*(u<at?u/at:(1-u)/(1-at));else d=pull*Math.exp(-age*4.5)*(Math.sin(u*Math.PI)*Math.cos(TAU*6*age)+.35*Math.sin(u*TAU)*Math.cos(TAU*9*age));out.push([lerp(a[0],b[0],u)+ux*d,lerp(a[1],b[1],u)+uy*d]);}return out;}
/** The seam material for 3→4: a thick pink thread pulled across the frame, fraying as it goes, that the camera enters and unravels. */
function pulledThread(s:Sheet,y:number,progress:number,seed:number){if(progress<=0)return;const w=40+240*progress,pts:Pt[]=[];for(let x=-1500;x<=1500;x+=150)pts.push([x,y+18*noise1(x/400+seed,seed)]);const line=partial(pts,clamp(progress*1.4));if(line.length<2)return;
 s.fill(K,ribbon(line,w+16,{seed:seed+1,pressure:.3,taper:.1,wobble:6,step:10}),.5);s.fill(P,ribbon(line,w,{seed,pressure:.3,taper:.1,wobble:5,step:10}),.95);
 const f=new Path2D();for(let i=0;i<line.length-1;i+=2){const p=line[i];f.addPath(ribbon([[p[0],p[1]-w*.55],[p[0]+60,p[1]-w*.9-30*progress]],5,{seed:seed+i,taper:.8,wobble:2}));f.addPath(ribbon([[p[0]+70,p[1]+w*.55],[p[0]+130,p[1]+w*.9+30*progress]],5,{seed:seed+i+1,taper:.8,wobble:2}));}s.fill(K,f,.85);}

// ---------------- chapter 1: one strand carries the weight ----------------
const H0:Pt=[-230,140],A0:Pt=[760,-330];
const strandBase=(x:number)=>H0[1]+(x-H0[0])/(A0[0]-H0[0])*(A0[1]-H0[1]);
const SAG:Key[]=[[1.3,0],[1.5,150,easeOut],[1.72,108],[1.95,126],[2.2,120],[2.55,120],[2.7,118],[4.1,118],[4.7,52,easeOut],[7.5,52],[7.95,-12,easeOut],[8.3,16],[8.6,10]];
const strandPt=(x:number,sag:number):Pt=>[x,strandBase(x)+sag*gauss((x-200)*(x-200),300)];
function strandPts(sag:number):Pt[]{const out:Pt[]=[];for(let i=0;i<=14;i++)out.push(strandPt(H0[0]+i*(A0[0]-H0[0])/14,sag));return out;}
const ch1:Scene={
 draw(s,t){
  const tt=twos(t);
  const v=key(t,[[0,0,-40,.85],[1.2,0,-40,1],[3.98,0,-40,1.01],[4.9,-60,20,1.03],[5.8,40,-40,1.03],[7.22,40,-40,1.03],[8.6,140,-140,1.25],[9.4,140,-140,1.25]],easeIO,true);
  s.camera(v[0],v[1]+settle(t,1.3,{amp:22,freq:3,decay:4})+settle(t,2.55,{amp:8,freq:5,decay:5}),v[2],0);
  const sag=key(tt,SAG),sagPrev=key(twos(t-1/12),SAG),squeeze=key(tt,[[2.2,0],[2.55,1],[4.0,1],[4.6,0]]);
  const peak=key(tt,[[1.9,0],[2.1,-24,easeIn],[2.55,280,easeOut],[3.98,280],[4.7,0]])+(tt>2.55&&tt<3.98?8*Math.sin(tt*9):0);
  loom(s,{pitch:260,cov:[.2,.32],seed:11,sagY:(x,y)=>.5*sagPrev*gauss((x-200)*(x-200),340)*gauss((y-60)*(y-60),520)});
  rest(s,200,-80,420,12);
  // the yellow snag field: the weight that pulls; its torn peak pushes up into the ball
  const top:Pt[]=[];for(let x=-1700;x<=1700;x+=90)top.push([x,470-peak*gauss((x-200)*(x-200),230)+20*noise1(x/150+3,5)]);
  s.fill(Y,polyPath([...top,[1700,1900],[-1700,1900]],true));
  flecks(s,0,-120,900,14,21,{scatter:pulse(tt,2.15)+.6*pulse(tt,1.3)+.4*pulse(tt,4.6),dx:-tt*14,dy:-tt*9});
  // you: alone, leaning back, holding the thread that runs off to the weight; shoulders ease as others take hold
  const strain=key(tt,[[0,.5],[1.3,.9,easeOut],[3.98,.9],[4.7,.45,easeOut],[7.22,.45],[7.95,.2,easeOut]]);
  figure(s,-330,560,600,'pull',{ink:P,seed:31,face:1,k:strain,reach:[H0[0],H0[1]+sag*gauss((H0[0]-200)**2,300)],shade:K});
  // the pink strand draws on, then sags under the knot-ball, thins and frays when the snag presses
  const drawOn=anticipate(0,.85,tt,{back:.06,hold:.22,e:easeOut});
  const pts=strandPts(sag);if(tt>.85&&tt<1.15){const whip=30*(1-(tt-.85)/.3);pts[pts.length-1]=add(pts[pts.length-1],[whip*.88,-whip*.48]);}
  strand(s,P,pts,28,{seed:31,progress:drawOn,fray:squeeze,widthFn:(u,p)=>28-11*squeeze*gauss((p[0]-200)**2,220)});
  // teammates arrive and take the thread: each join prints a purple knot; the load spreads
  const joins:[number,number,Pt,number,boolean][]=[[40,3.98,[-80,900],41,true],[460,4.08,[620,160],42,true],[-100,7.22,[-100,-760],43,false],[300,7.3,[300,760],44,false]];
  const list:{x:number;y:number;r:number;seed:number}[]=[];
  for(const [jx,at,origin,seed,fig] of joins){
   const p=anticipate(at,at+.7,tt,{back:.08,hold:.25,e:easeOut}),J=strandPt(jx,sag);
   if(fig){if(tt<at)continue;const u=easeOutBack(sm(at,at+.7,tt)),fx=lerp(origin[0],jx+(jx<200?-40:120),clamp(u)),fy=origin[1];figure(s,fx,fy,520,u>=1?'pull':'run',{ink:B,seed,face:jx<200?1:-1,k:u>=1?.6:1,reach:u>=1?J:undefined,shade:K});}
   else if(p>0){const mid:Pt=[lerp(origin[0],J[0],.5)+(J[1]-origin[1])*.25,lerp(origin[1],J[1],.5)-(J[0]-origin[0])*.25];strand(s,B,[origin,mid,J],30,{seed:seed+1,progress:p});}
   if(p>=1)list.push({x:J[0],y:J[1],r:46*(1+.13*settle(tt,at+.7,{amp:1,freq:5,decay:6})),seed});
  }
  knots(s,list);
  // the knot-ball: heavy, drops onto the strand, squashes under the snag's push
  const by=tt<1.3?lerp(-980,-140,easeIn(clamp((tt-.9)/.4))):strandPt(200,sag)[1]-140;
  knotBall(s,200,by,150,7,{sx:1+.06*squeeze,sy:1-.06*squeeze,rot:.3,hi:.6+.4*sm(7.6,8,tt)});
 },
 aperture(){const c=strandPt(560,10),a=Math.atan2(A0[1]-H0[1],A0[0]-H0[0]);return aperture(rotPts([[-150,0],[-100,-58],[100,-58],[150,0],[100,58],[-100,58]],a).map(p=>add(p,c)));},
 still:5.2,
};

// ---------------- chapter 2: inside the fibre — a goal net catches the ball ----------------
const WARP=[-420,-280,-140,0,140,280,420],WEFT=[-440,-260,-80,100,280];
const STRETCH:Key[]=[[7.2,0],[7.75,160,easeIn],[8.3,160],[8.75,-25,easeOut],[9.1,14],[9.4,10]];
const ch2:Scene={
 draw(s,t){
  const tt=twos(t);
  const v=key(t,[[0,-200,-300,1,0],[1.6,0,-60,.95,0],[3.02,0,-60,.95,0],[4.2,0,-120,1.15,0],[5,0,-120,1.15,0],[6.4,0,0,1.15,-.07],[7.08,0,0,1.15,-.07],[8,0,80,1.15,-.07],[8.3,0,80,1.15,-.07],[8.8,0,40,1.15,-.07],[10.2,0,40,1.15,-.07]],easeIO,true);
  s.camera(v[0],v[1]+settle(t,5.4,{amp:14,freq:4,decay:4}),v[2],v[3]);
  const S=key(tt,STRETCH),stretch=clamp(S/160),spread=sm(8.3,8.7,tt,easeOut);
  // the ball flies in on "connect" and lands in the net at 5.4: the net gives (a dip that springs) and holds
  const flight=sm(4.9,5.4,tt,easeIn),landed=tt>=5.4,bowl=landed?90*spring(tt-5.4,2.4,.5)*(1-.5*sm(6.2,7.2,tt)):0;
  const dipAt=(time:number):Field=>(x,y)=>{if(time<5.4)return 0;const b=90*spring(time-5.4,2.4,.5)*(1-.5*sm(6.2,7.2,time));return b*gauss(x*x+(y-100)*(y-100),260)+(S*gauss(x*x,340)*gauss((y-100)*(y-100),120));};
  const dip=dipAt(tt),dipPrev=dipAt(twos(t-1/12));
  s.field(P,.32,.5);
  loom(s,{pitch:200,cov:[.2,.32],seed:12,sagY:(x,y)=>.5*dipPrev(x,y)});
  rest(s,0,100,520,13,.35);
  flecks(s,0,0,900,8,22,{scatter:.8*pulse(tt,5.4)+.5*pulse(tt,7.75),dx:-tt*6,dy:-tt*8,size:22});
  // the goal: two posts and a bar (navy), the net woven inside it — warp draws down, weft draws across, both from the first second
  {const post=new Path2D();post.addPath(ribbon([[-540,560],[-540,-560],[540,-560],[540,560]],26,{seed:60,pressure:.5,taper:.05,wobble:2,step:14}));s.fill(K,post,.95);}
  const cov=tt<3.02?.7:lerp(.7,1,sm(3.02,3.5,tt)),faded=lerp(cov,.3,sm(7.08,7.5,tt))*(1-sm(8.3,8.8,tt))+cov*sm(8.3,8.8,tt);
  const warp=new Path2D(),weft=new Path2D();
  WARP.forEach((x0,i)=>{const p=sm(i*.05,.4+i*.05,tt,easeOut);if(p<=0)return;const pts:Pt[]=[];for(let y=-560;y<=560;y+=80)pts.push([x0+(x0>0?-1:1)*dip(x0,y)*.25,y]);const line=p>=1?pts:partial(smoothPts(pts,false,10),p);if(line.length>1)warp.addPath(ribbon(line,30,{seed:60+i,pressure:.35,taper:.1,wobble:1.6,step:10}));});
  WEFT.forEach((y0,j)=>{if(y0===100)return;const p=sm(.3+j*.1,.9+j*.1,tt,easeOut);if(p<=0)return;const pts:Pt[]=[];for(let x=-540;x<=540;x+=60)pts.push([x,y0+dip(x,y0)]);const line=p>=1?pts:partial(smoothPts(pts,false,10),p);if(line.length>1)weft.addPath(ribbon(line,30,{seed:70+j,pressure:.35,taper:.1,wobble:1.6,step:10}));});
  s.fill(B,warp,faded);s.fill(P,weft,faded);
  // the one strand: weft y=100 under the ball stays solid, stretches thin when the ball's weight is left to it alone, frays, then relaxes as the load spreads
  {const p=sm(.5,1.1,tt,easeOut);if(p>0){const pts:Pt[]=[];for(let x=-540;x<=540;x+=60)pts.push([x,100+dip(x,100)]);strand(s,P,pts,32,{seed:75,progress:p,fray:stretch,widthFn:(u,q)=>32-19*stretch*gauss(q[0]*q[0],300)});
   if(stretch>.85)s.fill(K,ribbon([[-14,100+S+6],[-4,100+S+22],[6,100+S+8],[16,100+S+26]],3,{seed:76,taper:.6,wobble:.5}));}}
  // knots cinch outward from the centre on "places they connect"; knots on faded threads fade with them
  const hold:{x:number;y:number;r:number;seed:number}[]=[],restK:{x:number;y:number;r:number;seed:number}[]=[];
  WARP.forEach((x,i)=>WEFT.forEach((y,j)=>{const d=Math.hypot(x,y-100),at=3.02+d/700*.45,kp=easeOutBack(sm(at,at+.32,tt)),r=40*kp;if(r<=2)return;const yy=y+dip(x,y),item={x,y:yy,r,seed:80+i*7+j};(y===100?hold:restK).push(item);}));
  knots(s,restK,{cov:faded});knots(s,hold,{cov:cov});
  void spread;
  // the ball: flies in from the upper left, lands in the pocket, rides the stretched strand
  if(tt>=4.9){const p=arc([-1300,-1000],[0,100],clamp(flight),200);const bx=landed?0:p[0],by=landed?100+dip(0,100)-110:p[1]-110;const sq=landed?.08*settle(tt,5.4,{amp:1,freq:4,decay:4,phase:Math.PI/2}):.04;knotBall(s,bx,by,112,90,{rot:flight*5,sx:1+sq,sy:1-sq});if(!landed)speedLines(s,K,bx,by,Math.atan2(1100,1300),{n:5,seed:91,len:160,width:6,cov:.7});}
 },
 aperture(t){const tt=twos(t),S=key(tt,STRETCH),b=tt<5.4?0:90*spring(tt-5.4,2.4,.5)*(1-.5*sm(6.2,7.2,tt));return apertureDisc(0,100+S+b-110,82,12);},
 still:5.9,
};

// ---------------- chapter 3: the court — pass, move into view, a plucked call ----------------
const HALF:Pt[][]=[circle(0,300,170),[[-540,520],[-540,-80],[-540,-700]],[[540,520],[540,-80],[540,-700]],[[0,520],[-540,520]],[[0,520],[540,520]],arcPts(0,-520,240,.25,Math.PI-.25)];
const PINK_PATH:Pt[]=[[-180,160],[-140,-40],[-60,-240]];
const ch3:Scene={
 draw(s,t){
  const tt=twos(t);
  const snag1Push=sm(1.6,2.2,tt,easeIn),lunge=sm(7.3,7.8,tt,easeIn);
  const v=key(t,[[0,0,40,1],[1.2,-100,-150,1.05],[3.46,-100,-150,1.05],[3.7,-100,-150,1.05],[4.5,80,-220,1.05],[6.24,80,-220,1.05],[7.24,-20,-300,1.25],[9,-20,-300,1.25]],easeIO,true);
  s.camera(v[0]+30*snag1Push*(1-sm(3.46,4,t))+settle(t,6.39,{amp:10,freq:8,decay:6}),v[1]+settle(t,.5,{amp:10,freq:4,decay:5}),v[2],0);
  loom(s,{pitch:340,cov:[.2,.32],seed:13,sagY:(x,y)=>-10*pulse(tt,.5)*gauss((x+180)*(x+180)+(y-160)*(y-160),260)});
  s.knockout(polyPath(handCut([[-540,-900],[540,-900],[540,520],[-540,520]],103,10,300),true),.45);
  courtLines(s,HALF,16,101,sm(.1,.7,tt,easeOut));
  loomFrame(s,0,-520,300,90,102,{progress:sm(.4,.9,tt)});
  flecks(s,0,0,900,10,23,{scatter:.7*pulse(tt,2.2)+.7*pulse(tt,7.8),dx:tt*8,dy:-tt*6});
  // defenders (yellow): the near one steps toward the ball on "clear actions"; later lunges to where the ball was
  const s1:Pt=add([300,-260],[-50*snag1Push-35*lunge+6*settle(tt,2.2,{amp:1,freq:6,decay:6}),60*snag1Push+70*lunge]);
  figure(s,s1[0],s1[1]+150,400,'step',{ink:Y,seed:201,face:-1,k:.4+.6*Math.max(snag1Push,lunge),shade:K});figure(s,-360,90,380,'step',{ink:Y,seed:202,face:1,k:.5,shade:K});
  // you (pink) and your teammate (blue) slide in; blue checks toward the ball; pink passes then runs into view, arm up for the call
  const slideIn=easeOutBack(sm(.2,.8,tt)),check=60*(sm(1.4,1.7,tt,easeOut)-sm(1.7,2.0,tt,easeOut));
  const bluePos:Pt=[220+check*-.96+8*settle(tt,4.36,{amp:1,freq:4,decay:5}),40+check*.29+lerp(700,0,slideIn)];
  const run=sm(4.2,5.0,tt,easeOut),pa=along(PINK_PATH,run),pinkPos:Pt=tt<4.2?[-180,160+lerp(700,0,slideIn)]:[pa.x+Math.cos(pa.a)*20*settle(tt,5,{amp:1,freq:3,decay:5}),pa.y+Math.sin(pa.a)*20*settle(tt,5,{amp:1,freq:3,decay:5})];
  const trail:Pt[]=[[-600,700],[-400,420],pinkPos];if(run>0)trail.splice(2,0,...(partial(smoothPts(PINK_PATH,false,8),run).slice(0,-1)));
  strand(s,P,trail,22,{seed:111});strand(s,B,[[720,90],[480,60],bluePos],22,{seed:112});
  // the lane thread pink→blue: taut from "After passing", plucked on "a call"
  if(tt>=3.46){const pullAge=tt-6.39,pull=tt<6.24?0:30;const lane=plucked(pinkPos,bluePos,pull,.3,pullAge);strand(s,P,lane,22,{seed:113,progress:sm(3.46,3.66,tt,easeOut)});}
  if(run>0&&run<1)speedLines(s,P,pinkPos[0],pinkPos[1],pa.a,{n:5,seed:114,len:120,width:6});
  // the receiver's sightline opens toward the moving passer (paper wedge)
  {const w=sm(4.9,5.3,tt,easeOut);if(w>0){const a=Math.atan2(pinkPos[1]-bluePos[1],pinkPos[0]-bluePos[0]),L=Math.hypot(pinkPos[1]-bluePos[1],pinkPos[0]-bluePos[0])*1.15*w;s.knockout(polyPath([bluePos,[bluePos[0]+Math.cos(a-.26)*L,bluePos[1]+Math.sin(a-.26)*L],[bluePos[0]+Math.cos(a+.26)*L,bluePos[1]+Math.sin(a+.26)*L]],true),.3);}}
  const kickK=anticipate(3.3,3.66,tt,{back:.4,hold:.5,e:easeIn}),call=sm(6.24,6.5,tt,easeOut);
  const pinkPose:Pose=run>0&&run<1?'run':tt>=6.24?'up':tt>=3.3&&tt<3.9?'kick':'stand';
  figure(s,pinkPos[0],pinkPos[1]+130,440,pinkPose,{ink:P,seed:121,face:1,k:pinkPose==='kick'?clamp(kickK)+.2:pinkPose==='up'?call:1,foot:pinkPose==='kick'?[pinkPos[0]+lerp(40,130,clamp(kickK))+(kickK<0?kickK*120:0),pinkPos[1]+lerp(120,80,clamp(kickK))]:undefined,shade:K});
  figure(s,bluePos[0],bluePos[1]+130,440,'arms',{ink:B,seed:122,face:-1,k:.5+.5*sm(3.46,3.9,tt),look:-.6*sm(4.9,5.3,tt),shade:K});
  // vibration rings travel from you to the teammate
  const rl:{x:number;y:number;r:number}[]=[];for(let k=0;k<3;k++){const u=sm(6.4+k*.15,7.0+k*.15,tt);if(u<=0||u>=1)continue;rl.push({x:lerp(pinkPos[0],bluePos[0],u),y:lerp(pinkPos[1],bluePos[1],u),r:30+90*u});}
  if(tt>=7.8)rl.push({x:pinkPos[0],y:pinkPos[1],r:150+40*sm(7.8,8.4,tt)});rings(s,rl,10,.85);
  // the knot-ball: drops in at your feet, flies the taut thread (0.7 s), is cushioned, returns
  let ball:Pt,sq=0,rot=0;
  if(tt<3.66){ball=[-180,lerp(-700,160,easeIn(clamp(tt/.5)))];sq=.06*settle(tt,.5,{amp:1,freq:4,decay:5,phase:Math.PI/2});}
  else if(tt<7.1){const u=easeOutBack(sm(3.66,4.36,tt));ball=[lerp(-180,bluePos[0]-10,u),lerp(160,bluePos[1],u)];rot=u*4;sq=.07*settle(tt,4.36,{amp:1,freq:4,decay:5,phase:Math.PI/2});}
  else{const u=easeOutBack(sm(7.1,7.8,tt));ball=[lerp(bluePos[0]-10,pinkPos[0],u),lerp(bluePos[1],pinkPos[1],u)];rot=4+u*4;sq=.07*settle(tt,7.8,{amp:1,freq:4,decay:5,phase:Math.PI/2});}
  knotBall(s,ball[0],ball[1],110,8,{rot,sx:1+sq,sy:1-sq});
  // the seam material: a thick pink thread pulled across the frame from 7.9, fraying as it unravels the print
  pulledThread(s,-240,sm(7.9,8.7,t,easeOut),130);
 },
 aperture(){return apertureDisc(-60,-240,112,12);},
 still:5.6,
};

// ---------------- chapter 4: the next job — two players swap jobs ----------------
const ch4:Scene={
 draw(s,t){
  const tt=twos(t);
  const pushIn=key(tt,[[0,-600],[.2,-630,easeIn],[.8,0]]),shove=settle(tt,.8,{amp:14,freq:6,decay:6});
  const collapse=sm(6.1,6.6,tt,easeIn)*(1-sm(10.2,10.8,tt,easeOut)),widen=20*sm(2.5,2.8,tt);
  const v=key(t,[[0,0,-150,1,0],[1,0,-230,1.1,0],[4.24,0,-230,1.1,0],[4.5,0,-230,1.1,0],[5.5,40,-410,1.1,0],[8.64,40,-410,1.1,0],[10.04,-60,-210,1.15,.14],[11.9,-60,-210,1.15,.14]],easeIO,true);
  s.camera(v[0]+shove*.6,v[1]+15*(pulse(t,.2)-pulse(t,6.1)),v[2]*(1+.01*sm(2,4.2,t)),v[3]);
  const crumple=1+1.2*sm(.6,.75,tt)*(1-sm(.95,1.3,tt));
  loom(s,{pitch:340,cov:[.2,.32],seed:14,wobble:16*crumple,sagX:(x,y)=>y>-400&&y<-120?-40*(1-clamp(Math.abs(x)/250))*Math.sign(x||1)*sm(.5,.8,tt)*(1-sm(1,1.5,tt)):0});
  s.knockout(polyPath(handCut([[-460,-620],[460,-620],[460,-100],[-460,-100]],133,10,300),true),.45);
  courtLines(s,[[[-900,-420],[900,-420]],arcPts(0,-420,300,.3,Math.PI-.3),[[-460,-620],[-460,-100],[460,-100],[460,-620]]],16,131);
  loomFrame(s,0,-480,390,120,132);
  flecks(s,0,-100,900,8,24,{scatter:pulse(tt,.8)+.6*pulse(tt,6.6)+.4*pulse(tt,9.4),dx:tt*5,dy:tt*7});
  // pressure: two yellow defenders push in and leave a gap; later they collapse toward the ball
  const target:Pt=[60,-420];
  const dl=towards([-110,-260],target,90*collapse),dr=towards([110,-260],target,90*collapse);
  figure(s,-250-widen+pushIn+shove+dl[0],-100+dl[1],460,'step',{ink:Y,seed:211,face:1,k:.5+.5*collapse,shade:K});figure(s,250+widen-pushIn-shove+dr[0],-100+dr[1],460,'step',{ink:Y,seed:212,face:-1,k:.5+.5*collapse,shade:K});
  // the players and their threads; the ball runs the taut threads; the jobs (lanes) travel, the colours never change
  const blueRun=anticipate(4.24,5.24,tt,{back:.06,hold:.2,e:easeOut}),blueBack=sm(9.5,10.1,tt,easeOut);
  const pinkBack=sm(4.3,4.9,tt,easeOut),pinkFwd=sm(9.4,10.2,tt,easeOut);
  const bluePath:Pt[]=[[140,140],[100,-150],[60,-420]],blueP=along(bluePath,clamp(blueRun));
  let bluePos:Pt=blueRun<=0?[140,140+blueRun*-25]:[blueP.x,blueP.y];if(blueRun>=1)bluePos=[60+30*settle(tt,5.24,{amp:1,freq:3,decay:5}),-420];
  if(blueBack>0)bluePos=[lerp(60,160,blueBack),lerp(-420,200,blueBack)];
  const pinkPathF:Pt[]=[[-200,220],[-230,40],[-40,-120]],pp=along(pinkPathF,pinkFwd);
  let pinkPos:Pt=[lerp(-120,-200,pinkBack),lerp(120,220,pinkBack)];if(pinkFwd>0)pinkPos=[pp.x+20*settle(tt,10.2,{amp:1,freq:3,decay:5}),pp.y];
  const blueTrail:Pt[]=[[300,760],[200,420],[140,140]];if(blueRun>0)blueTrail.push(...partial(smoothPts(bluePath,false,8),clamp(blueRun)).slice(1));if(blueBack>0)blueTrail.push(bluePos);
  const pinkTrail:Pt[]=[[-260,760],[-160,420],[-120,120]];if(pinkBack>0)pinkTrail.push(pinkPos);if(pinkFwd>0){pinkTrail.push(...partial(smoothPts(pinkPathF,false,8),pinkFwd).slice(1));}
  const pulseW=30+10*Math.sin(Math.PI*clamp((tt-1)/.5));
  strand(s,B,blueTrail,pulseW*.9,{seed:141});strand(s,P,pinkTrail,pulseW*.9,{seed:142});
  // taut lane threads for the passes
  if(tt>=5.2&&tt<8.8)strand(s,P,[[-200,220],[-40,-120],bluePos],20,{seed:143,progress:sm(5.2,5.35,tt)});
  if(tt>=8.7&&tt<9.6)strand(s,B,[bluePos,[-40,-120],[-200,220]],20,{seed:144,progress:sm(8.7,8.85,tt)});
  // dashed lanes = the jobs: they grow, then travel from one player to the other
  const laneF=sm(2.0,2.5,tt,easeOut)*(1-sm(9.0,9.3,tt)),laneB=sm(2.1,2.6,tt,easeOut)*(1-sm(9.0,9.3,tt));
  if(laneF>0)laneArrow(s,K,[140,140],[60,-420],16,{dashed:true,seed:151,progress:laneF,cov:.9});
  if(laneB>0)laneArrow(s,K,[-120,120],[-200,220],16,{dashed:true,seed:152,progress:laneB,cov:.9});
  {const f2=sm(9.0,9.4,tt,easeOut);if(f2>0)laneArrow(s,K,[-200,220],[-40,-120],16,{dashed:true,seed:153,progress:f2,cov:.9});const b2=sm(9.1,9.5,tt,easeOut);if(b2>0)laneArrow(s,K,[60,-420],[160,200],16,{dashed:true,seed:154,progress:b2,cov:.9});}
  if(blueRun>0&&blueRun<1)speedLines(s,B,bluePos[0],bluePos[1],blueP.a,{n:5,seed:155,len:130,width:6});
  // blue sprints forward (run lean) then drops back; pink offers support behind (arms out, facing the play) then runs forward: the jobs swap
  const blueMoving=(blueRun>0&&blueRun<1)||(blueBack>0&&blueBack<1),pinkMoving=pinkFwd>0&&pinkFwd<1;
  figure(s,bluePos[0],bluePos[1]+130,440,blueMoving?'run':blueBack>=1?'arms':'stand',{ink:B,seed:161,face:blueBack>0?-1:1,k:1,shade:K});
  figure(s,pinkPos[0],pinkPos[1]+130,440,pinkMoving?'run':pinkFwd>=1?'stand':'arms',{ink:P,seed:162,face:1,k:pinkMoving?1:pinkBack,shade:K});
  // the ball: with pink, runs through the gap to blue, back to pink's thread, then along it to the front of the gap
  let ball:Pt,sq=0,rot=0;
  if(tt<5.3)ball=[pinkPos[0]+60,pinkPos[1]+40];
  else if(tt<8.8){const u=easeOutBack(sm(5.3,6.05,tt));ball=[lerp(-140,60,u),lerp(260,-420,u)];rot=u*5;sq=.07*settle(tt,6.05,{amp:1,freq:4,decay:5,phase:Math.PI/2});}
  else if(tt<10.3){const u=easeOutBack(sm(8.8,9.5,tt));ball=[lerp(60,-140,u),lerp(-420,260,u)];rot=5+u*5;sq=.07*settle(tt,9.5,{amp:1,freq:4,decay:5,phase:Math.PI/2});}
  else{const u=easeOutBack(sm(10.3,10.9,tt)),q=along(pinkPathF,u);ball=[q.x+40,q.y+30];rot=10+u*4;sq=.07*settle(tt,10.9,{amp:1,freq:4,decay:5,phase:Math.PI/2});}
  knotBall(s,ball[0],ball[1],100,9,{rot,sx:1+sq,sy:1-sq});
 },
 aperture(){return apertureDisc(0,-90,62,12);},
 still:6.4,
};

// ---------------- chapter 5: night — possession lost, blame tears the cloth, recovery re-knots it ----------------
const ch5:Scene={
 draw(s,t){
  const tt=twos(t);
  const v=key(t,[[0,0,0,1,0],[.6,120,-40,1,0],[1.7,120,-40,1,0],[2.7,0,0,1,.122],[5.98,0,0,1,.122],[7.18,0,240,1.2,0],[8.8,0,240,1.2,0],[9.3,20,220,1.2,0],[11.3,20,220,1.2,0]],easeIO,true);
  s.camera(v[0],v[1]+15*pulse(t,.7)+20*pulse(t,2.55)+10*pulse(t,7.2),v[2],v[3]);
  const colour=sm(5.98,6.12,tt);
  // night: a heavy navy halftone field; the lattice shows as a lighter plaid knocked out of it
  s.field(K,.88,.55);
  {const p=new Path2D(),pitch=300;for(let i=-6;i<=6;i++){p.addPath(rectPath(i*pitch-32,-1900,64,3800));p.addPath(rectPath(-1900,i*pitch-32,3800,64));}s.knockout(p,.45);}
  const lines:Pt[][]=[circle(0,-300,170),[[-540,-900],[-540,760]],[[540,-900],[540,760]],arcPts(0,460,240,Math.PI+.25,TAU-.25)];courtLines(s,lines,14,171,1,true);
  loomFrame(s,0,460,390,120,172,{paper:true});
  flecks(s,0,0,900,6,25,{scatter:pulse(tt,.7)+.6*pulse(tt,2.7)+.6*pulse(tt,7.2),dx:-tt*5,dy:tt*4,size:20});
  // the yellow defender lunges and takes the ball, advances unchallenged, then is blocked by the V
  const sx=key(tt,[[0,520],[.2,550,easeIn],[.7,300,easeOut],[3,300],[3.6,200,easeIn],[6.4,200],[7.2,60,easeIn],[9.5,60],[10,90]]),sy=key(tt,[[0,-80],[.7,-70],[3,-70],[3.6,60],[6.4,60],[7.2,150],[9.5,150],[10,170]]);
  const blocked=sm(7.05,7.2,tt)*(1-.6*sm(7.2,7.6,tt)),sag=sm(9.5,10,tt);
  const dMoving=(tt>.2&&tt<.7)||(tt>3.6&&tt<4)||(tt>7.2&&tt<7.6);
  figure(s,sx+6*settle(tt,.7,{amp:1,freq:6,decay:6}),sy+150+20*sag,460,dMoving?'run':blocked>0?'slump':'step',{ink:Y,seed:221,face:-1,k:blocked>0?blocked:1,cov:.92,shade:K});
  // you and your teammate: pull apart on "blame" and turn away (heads turned, shoulders down), turn and sprint to the goal on "recover"
  const apart=sm(1.9,2.7,tt,easeIn),jerk=20*(sm(1.7,1.85,tt)-sm(1.85,2.0,tt));
  const recover=easeOut(sm(6.2,7.0,tt)),over=25*settle(tt,7,{amp:1,freq:3,decay:5});
  const pinkPath:Pt[]=[[-330,40],[-140,150],[120,300]],bluePath:Pt[]=[[330,-60],[140,140],[-120,300]];
  const pk=along(pinkPath,recover),bl=along(bluePath,recover);
  let pinkPos:Pt=[lerp(-130,-330,apart)+jerk,lerp(-40,40,apart)],bluePos:Pt=[lerp(130,330,apart)-jerk,lerp(-20,-60,apart)];
  if(recover>0){pinkPos=[pk.x+Math.cos(pk.a)*over,pk.y+Math.sin(pk.a)*over];bluePos=[bl.x+Math.cos(bl.a)*over,bl.y+Math.sin(bl.a)*over];}
  const step=sm(9.5,10,tt,easeOut);if(step>0){pinkPos=[lerp(pinkPos[0],60,step),lerp(pinkPos[1],230,step)];bluePos=[lerp(bluePos[0],-180,step),lerp(bluePos[1],320,step)];}
  // trailing threads droop when the ball is lost, stretch and fray as the players pull apart
  const droop=40*sm(.7,1.2,tt);
  const pinkTrail:Pt[]=[[-700,600],[-420,360+droop],pinkPos],blueTrail:Pt[]=[[700,520],[420,300+droop],bluePos];
  if(recover>0){pinkTrail.splice(2,0,...partial(smoothPts(pinkPath,false,8),recover).slice(0,-1));blueTrail.splice(2,0,...partial(smoothPts(bluePath,false,8),recover).slice(0,-1));}
  strand(s,P,pinkTrail,26,{seed:181,fray:apart*.6*(1-recover)});strand(s,B,blueTrail,26,{seed:182,fray:apart*.6*(1-recover)});
  // the strand between them stretches and snaps on "blame adds distance"
  if(tt<5.98){const snapped=tt>=2.55,widthK=(u:number)=>18-10*apart*Math.sin(u*Math.PI);
   if(!snapped)strand(s,K,[pinkPos,[lerp(pinkPos[0],bluePos[0],.5),lerp(pinkPos[1],bluePos[1],.5)+30*apart],bluePos],18,{seed:183,cov:.9,fray:apart,widthFn:widthK});
   else{const rec=1-.7*clamp((tt-2.55)*4);const a1=towards(pinkPos,bluePos,120*rec),a2=towards(bluePos,pinkPos,120*rec);strand(s,K,[pinkPos,add(pinkPos,[a1[0],a1[1]-25*settle(tt,2.55,{amp:1,freq:6,decay:5})])],14,{seed:184,cov:.9});strand(s,K,[bluePos,add(bluePos,[a2[0],a2[1]+25*settle(tt,2.55,{amp:1,freq:6,decay:5})])],14,{seed:185,cov:.9});}}
  // the cloth tears between them; the crossing closes it and prints a new purple knot
  tear(s,0,-200,200,186,sm(2.6,3.2,tt,easeOut),22*(1-sm(6.6,7.2,tt)));
  if(tt>=7.0)knots(s,[{x:0,y:240,r:44*easeOutBack(sm(7.0,7.3,tt)),seed:187}]);
  // a plucked call and a lane on "communicate the next job"
  if(tt>=8.8&&tt<9.6){const lane=plucked(bluePos,pinkPos,30,.3,tt-8.95);strand(s,B,lane,18,{seed:188});}
  const rl:{x:number;y:number;r:number}[]=[];for(let k=0;k<2;k++){const u=sm(8.95+k*.15,9.45+k*.15,tt);if(u<=0||u>=1)continue;rl.push({x:lerp(bluePos[0],pinkPos[0],u),y:lerp(bluePos[1],pinkPos[1],u),r:30+80*u});}rings(s,rl,10,.85);
  const ballSnag:Pt=[sx-100,sy+70+20*sag];
  if(tt>=8.9)laneArrow(s,K,pinkPos,ballSnag,14,{seed:189,progress:sm(8.9,9.3,tt,easeOut),cov:.95});
  const running=recover>0&&recover<1,awayK=apart*(1-recover);
  const pinkInk=colour>=.5?P:'paper',blueInk=colour>=.5?B:'paper';
  figure(s,pinkPos[0],pinkPos[1]+130,440,running?'run':step>0?'arms':awayK>0?'slump':'stand',{ink:pinkInk,seed:191,face:running||step>0?1:awayK>.1?-1:1,k:running?1:step>0?step:awayK,look:awayK>.1?-.8:0,shade:K});
  figure(s,bluePos[0],bluePos[1]+130,440,running?'run':step>0?'arms':awayK>0?'slump':'stand',{ink:blueInk,seed:192,face:running||step>0?-1:awayK>.1?1:-1,k:running?1:step>0?step:awayK,look:awayK>.1?.8:0,shade:K});
  // the knot-ball: dragged to the defender's feet, rattles, rolls out onto the pink thread when the call is answered
  let ball:Pt,sq=0;
  if(tt<.7){const u=easeIn(sm(.2,.7,tt));ball=[lerp(0,ballSnag[0],u),lerp(90,ballSnag[1],u)];}
  else if(tt<9.6){ball=[ballSnag[0]+(tt<1?6*Math.sin(tt*40):0),ballSnag[1]];sq=.08*(1-sm(1,1.5,tt));}
  else{const u=easeOut(sm(9.6,10.1,tt));ball=[lerp(ballSnag[0],pinkPos[0]-60,u),lerp(ballSnag[1],pinkPos[1]+30,u)];sq=.06*settle(tt,10.1,{amp:1,freq:4,decay:5,phase:Math.PI/2});}
  knotBall(s,ball[0],ball[1],100,10,{rot:tt*.3,sx:1+sq,sy:1-sq,hi:.5+.5*colour});
 },
 aperture(){return apertureDisc(0,470,86,12);},
 still:7.8,
};

// ---------------- chapter 6: three players in a triangle — offer, listen, support; the passes knit a patch that catches the ball ----------------
const TRI:Pt[]=[[-320,300],[320,300],[0,-330]];
const ch6:Scene={
 draw(s,t){
  const tt=twos(t);
  const dropL=sm(7.1,7.5,tt,easeIn),bowl=(x:number,y:number)=>tt<7.5?0:80*gauss(x*x+y*y,300)*(spring(tt-7.5,2.2,.5)*(1-.62*sm(7.5,8.6,tt)));
  const v=key(t,[[0,0,0,.9,-.21],[1.2,0,0,1,-.07],[3.76,0,0,1,-.07],[4.16,-120,-60,1.05,-.07],[4.61,120,-40,1.05,-.07],[5.16,0,0,1.05,-.035],[6.94,0,0,1.05,-.035],[8.04,0,0,1.15,0],[9.4,0,0,1.15,0]],easeIO,true);
  s.camera(v[0],v[1]+20*pulse(t,7.5),v[2],v[3]);
  const bowlPrev=(x:number,y:number)=>{const tp=twos(t-1/12);return tp<7.5?0:80*gauss(x*x+y*y,300)*(spring(tp-7.5,2.2,.5)*(1-.62*sm(7.5,8.6,tp)));};
  loom(s,{pitch:96,cov:[.2,.32],seed:16,ext:1500,wobble:8,sagY:(x,y)=>.5*bowlPrev(x,y)});
  s.knockout(polyPath(handCut([[-560,-440],[560,-440],[560,440],[-560,440]],263,12,300),true),.4);
  flecks(s,0,0,800,14,26,{scatter:.5*pulse(tt,.9)+pulse(tt,7.5),dx:tt*4,dy:-tt*5,size:20});
  // the loom bars: left slides in and hooks the left edge; right arrives on "support" and the cloth tightens
  const barL=key(tt,[[0,-700],[.15,-715,easeIn],[.65,-560,easeOut]]),barR=key(tt,[[4.66,700],[4.8,715,easeIn],[5.16,560,easeOut]]);
  const tight=sm(4.66,5.1,tt);
  const bar=(x:number,seed:number)=>{s.fill(K,polyPath(handCut([[x-32,-400],[x+32,-400],[x+32,400],[x-32,400]],seed,8,120),true),.95);const h=new Path2D();for(let y=-360;y<=360;y+=120)h.addPath(polyPath([[x,y-14],[x+(x<0?70:-70),y],[x,y+14]],true));s.fill(K,h);s.knockout(circlePath(x,-420,14));s.knockout(circlePath(x,420,14));};
  bar(barL,231);if(tt>=4.66)bar(barR,232);
  const court:Pt[][]=[[[-420,-300],[420,-300],[420,300],[-420,300],[-420,-300]],circle(0,0,110)].map(l=>l.map(p=>[p[0],p[1]+bowl(p[0],p[1])] as Pt));courtLines(s,court,12,261);
  // three passes (0.7 s each) around the triangle; each knits a thread between the two players; the patch tightens on "rely on each other"
  const p1=sm(1.4,2.1,tt,easeOut),p2=sm(3.9,4.6,tt,easeOut),p3=sm(5.6,6.3,tt,easeOut);
  const pinkP=TRI[0],blueA=TRI[1],blueB=TRI[2];
  const feet=(p:Pt):Pt=>[p[0],p[1]+120];
  if(p1>0)strand(s,P,[feet(pinkP),[0,360+bowl(0,360)],feet(blueA)],20+6*tight,{seed:271,progress:p1});
  if(p2>0)strand(s,B,[feet(blueA),[200,0],feet(blueB)],20+6*tight,{seed:272,progress:p2});
  if(p3>0)strand(s,B,[feet(blueB),[-200,0],feet(pinkP)],20+6*tight,{seed:273,progress:p3});
  const kn:{x:number;y:number;r:number;seed:number}[]=[];if(p1>=1)kn.push({x:feet(blueA)[0]-60,y:feet(blueA)[1],r:34*easeOutBack(sm(2.1,2.4,tt)),seed:281});if(p2>=1)kn.push({x:feet(blueB)[0]+50,y:feet(blueB)[1]+10,r:34*easeOutBack(sm(4.6,4.9,tt)),seed:282});if(p3>=1)kn.push({x:feet(pinkP)[0]+60,y:feet(pinkP)[1],r:34*easeOutBack(sm(6.3,6.6,tt)),seed:283});
  if(tt>=6.94)kn.push({x:0,y:40+bowl(0,40),r:44*easeOutBack(sm(6.94,7.3,tt)),seed:284});
  knots(s,kn);
  // listening rings run along the offered thread on "listen"
  const rl:{x:number;y:number;r:number}[]=[];for(let k=0;k<2;k++){const u=sm(4.35+k*.12,4.85+k*.12,tt);if(u<=0||u>=1)continue;rl.push({x:lerp(blueA[0],blueB[0],u),y:lerp(blueA[1]+120,blueB[1]+120,u),r:24+60*u});}rings(s,rl,8,.85);
  // the players: you (pink) ask and pass; teammate A offers (arms out) and passes on; teammate B listens (head turns to the caller) and supports
  const k1=anticipate(1.1,1.4,tt,{back:.4,hold:.5,e:easeIn}),listen=sm(4.35,4.7,tt,easeOut);
  figure(s,pinkP[0],pinkP[1]+120,440,tt<1.6?'kick':tt>=6.94?'up':'arms',{ink:P,seed:291,face:1,k:tt<1.6?clamp(k1)+.2:tt>=6.94?sm(6.94,7.3,tt):.7,foot:tt<1.6?[pinkP[0]+lerp(40,140,clamp(k1))+(k1<0?k1*120:0),pinkP[1]+lerp(120,70,clamp(k1))]:undefined,look:tt>=4.35&&tt<6.94?-.7:0,sight:listen*(1-sm(5.6,5.9,tt)),shade:K});
  figure(s,blueA[0],blueA[1]+120,440,tt>=6.94?'up':'arms',{ink:B,seed:292,face:-1,k:tt>=6.94?sm(6.94,7.3,tt):.4+.6*sm(3.76,4.0,tt),shade:K});
  figure(s,blueB[0],blueB[1]+120,440,tt>=6.94?'up':'listen',{ink:B,seed:293,face:-1,k:tt>=6.94?sm(6.94,7.3,tt):listen,look:-.5*listen,shade:K});
  // the knot-ball: round the triangle, then lifts and drops into the centre where the woven patch catches it
  let bx=pinkP[0]+70,by=pinkP[1]+90,sq=0,rot=tt*.4;
  if(tt>=1.4&&tt<3.9){const u=easeOutBack(p1);bx=lerp(pinkP[0]+70,blueA[0]-70,u);by=lerp(pinkP[1]+90,blueA[1]+90,u);sq=.07*settle(tt,2.1,{amp:1,freq:4,decay:5,phase:Math.PI/2});}
  else if(tt>=3.9&&tt<5.6){const u=easeOutBack(p2);bx=lerp(blueA[0]-70,blueB[0]+60,u);by=lerp(blueA[1]+90,blueB[1]+100,u);sq=.07*settle(tt,4.6,{amp:1,freq:4,decay:5,phase:Math.PI/2});}
  else if(tt>=5.6&&tt<6.94){const u=easeOutBack(p3);bx=lerp(blueB[0]+60,pinkP[0]+70,u);by=lerp(blueB[1]+100,pinkP[1]+90,u);sq=.07*settle(tt,6.3,{amp:1,freq:4,decay:5,phase:Math.PI/2});}
  else if(tt>=6.94){const lift=easeOut(sm(6.94,7.1,tt));bx=lerp(pinkP[0]+70,0,lift);by=tt<7.1?lerp(pinkP[1]+90,-520,lift):lerp(-520,-60,dropL)+bowl(0,0)*.9;sq=tt>=7.5?.1*settle(tt,7.5,{amp:1,freq:4,decay:4,phase:Math.PI/2}):-.04*dropL;}
  knotBall(s,bx,by,100,11,{rot,sx:1+sq,sy:1-sq,hi:.6+.4*tight});
 },
 still:5.2,
};

export const story:RisoStory={
 id:'woven-court',format:'futsal',title:'The Woven Court',theme:'Trust and shared responsibility',ageNote:'For futsal players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',blue:'#0078bf',pink:'#ff48b0',navy:'#22366b'},order:['yellow','blue','pink','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:[
  {label:'Share the weight',headline:'Share',narration:'Do you feel you have to fix everything yourself? On a team, responsibility can be shared. You still matter. So does everyone else.',seconds:9.267,audio:CH+'01.m4a',cues:[{at:0,words:'Do you feel'},{at:3.98,words:'responsibility can be shared'},{at:7.22,words:'So does everyone'}]},
  {label:'Strength through connection',narration:'Think of woven threads. Their strength comes from the places they connect. Support spreads the load instead of leaving one strand stretched tight.',seconds:10.067,audio:CH+'02.m4a',cues:[{at:0,words:'Think of woven'},{at:3.02,words:'places they connect'},{at:7.08,words:'one strand stretched'}]},
  {label:'Make help visible',headline:'Move',narration:'In futsal, trust grows through clear actions. After passing, move into view. Give your teammate an angle and a call.',seconds:8.767,audio:CH+'03.m4a',cues:[{at:0,words:'In futsal'},{at:3.46,words:'After passing'},{at:6.24,words:'an angle and a call'}]},
  {label:'Notice the next job',headline:'Next job',narration:'Shared responsibility means noticing what the moment needs. One player moves forward. Another offers support behind. Your jobs can change with the play.',seconds:11.667,audio:CH+'04.m4a',cues:[{at:0,words:'Shared responsibility'},{at:4.24,words:'One player moves'},{at:8.64,words:'Your jobs can change'}]},
  {label:'Respond together',headline:'Recover',narration:'When possession is lost, blame adds distance. A helpful response brings you together: recover, protect space near goal, and communicate the next job.',seconds:11.067,audio:CH+'05.m4a',cues:[{at:0,words:'When possession is lost'},{at:1.7,words:'blame adds distance'},{at:5.98,words:'recover, protect'}]},
  {label:'Offer. Listen. Support.',narration:'Ask yourself: what can I do to help someone else play? Offer, listen, support. Trust grows when you can rely on each other.',seconds:9.165,audio:CH+'06.m4a',cues:[{at:0,words:'Ask yourself'},{at:3.76,words:'Offer, listen, support'},{at:6.94,words:'rely on each other'}]},
 ],
 draw(f){playChapters(story,f,[ch1,ch2,ch3,ch4,ch5,ch6]);},
 /** Touch: a 700 u thread at the touch point is plucked — it bows 90 u toward the pointer, is released and twangs on twos (a blurred double
  * line for the first frames); two big paper rings run along it. Reduced motion: the bowed thread as one static mark. */
 touch(s,x,y,age,seed){
  const ink=hash(seed,3)<.5?P:B,a=(hash(seed,5)-.5)*.9,ca=Math.cos(a),sa=Math.sin(a),A:Pt=[x-350*ca,y-350*sa],Bp:Pt=[x+350*ca,y+350*sa];
  if(age<=0){const st=plucked(A,Bp,90,.5,-1);s.fill(K,ribbon(st,34,{seed:seed+2,pressure:.4,wobble:1.2}),.6);s.fill(ink,ribbon(st,22,{seed,pressure:.4,wobble:1.2}));s.knockout(ring(x,y,70,90),.9);return;}
  const pull=90*Math.min(1,age/.1),pts=plucked(A,Bp,pull,.5,age-.1),fade=1-.3*clamp((age-.5)/.3);
  if(age>.1&&age<.4){const ghost=plucked(A,Bp,-pull*.6,.5,age-.1);s.fill(ink,ribbon(ghost,16,{seed:seed+1,pressure:.4,wobble:1.2}),.45);}
  s.fill(K,ribbon(pts,34,{seed:seed+2,pressure:.4,wobble:1.2}),.6*fade);s.fill(ink,ribbon(pts,22,{seed,pressure:.4,wobble:1.2}),fade);
  const u=clamp(age/.5),r=40+150*u,cov=.9*(1-clamp((age-.4)/.4));if(cov>.05)rings(s,[{x:x-360*u*ca,y:y-360*u*sa,r},{x:x+360*u*ca,y:y+360*u*sa,r}],12,cov);
 },
};
