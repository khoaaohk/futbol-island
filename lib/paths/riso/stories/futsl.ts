/** Love Futsl — riso, TRACK mode (one narration file, 54.57 s). Lead material: court paint on a warm wooden floor.
 * Blue = court paint (lines, lanes, the painted panels of the ball, the stopwatch ring); pink = the plank grain of the floor and, at full
 * strength, walls / wedges / defenders (pressure); green = teammates and the full-sized grass pitch of scene 3 only; navy = you, the
 * stopwatch hand, goal frames, contours.
 * The 22 timeline cues are the caption chapters (the tray reads each cue on media time); seven VISUAL chapters (`visualChapters`) drive
 * the scenes, passages, registration seed and headlines through `trackChapters` (ENGINE.md §10).
 * Legibility pass (bible §1c): a paper football with painted blue panels and a drip; abstract cut-paper player figures (paper + navy = you,
 * green = teammates, pink = defenders) replace the sole prints; the clock is a stopwatch; scene 6 shows a real boot; the story ends with
 * the walls dissolving around a player with open arms (no ring).
 * Background (unique to this story): cream paper with pink plank grain and paper hairline gaps (warm wood) that turns to green grass
 * only when the pitch is full-sized. */
import type {Sheet} from '../sheet';
import {type RisoStory,type Scene,type Chapter,playChapters,trackChapters} from '../story';
import {aperture,apertureDisc} from '../passage';
import {twos,sm,key,anticipate,settle,spring,smearPose,clamp,lerp,rng,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,circlePath,rectPath,easeOut,easeIn,easeIO,easeOutBack,TAU,type Pt} from '../motion';
import {dust,speedLines,handCut,goalFrame,ripple,crescent} from '../shapes';
import {pressPts} from '../motion';

const K='navy',P='pink',B='blue',G='green';
type Field=(x:number,y:number)=>number;
const pulse=(t:number,t0:number,len=1)=>t<t0?0:Math.min(1,(t-t0)*10)*Math.exp(-(t-t0)*2.4/len);
const lozenge=(x:number,y:number,w:number,h:number,rot=0):Pt[]=>rotPts([[-w/2,0],[-w*.3,-h/2],[w*.3,-h/2],[w/2,0],[w*.3,h/2],[-w*.3,h/2]],rot).map(p=>[p[0]+x,p[1]+y] as Pt);
const rrect=(x:number,y:number,w:number,h:number,r:number):Pt[]=>smoothPts([[x-w/2+r,y-h/2],[x+w/2-r,y-h/2],[x+w/2,y-h/2+r],[x+w/2,y+h/2-r],[x+w/2-r,y+h/2],[x-w/2+r,y+h/2],[x-w/2,y+h/2-r],[x-w/2,y-h/2+r]],true,8,2.5);
function offsetPts(pts:Pt[],d:number):Pt[]{const n=pts.length;return pts.map((p,i)=>{const a=pts[Math.max(0,i-1)],b=pts[Math.min(n-1,i+1)],nx=a[1]-b[1],ny=b[0]-a[0],l=Math.hypot(nx,ny)||1;return[p[0]+nx/l*d,p[1]+ny/l*d];});}

// ---------------- abstract riso figure (bible §1c.4) ----------------
/** A cut-paper player pictogram: a big head disc, a torn torso block, two leg strokes, two arm strokes — 4–6 plate ops, no anatomy, no face.
 * (x,y) = the ground point under the body, h = height, face = +1 looks right. Poses are parameter tables blended from `stand` by k (0..1).
 * ink 'paper' = paper body with navy contour and navy limbs (you); an ink = that ink knocked out beneath (green teammates, pink defenders).
 * foot = world point the front leg ends at (a touch); look turns the head; sight prints a paper wedge in the look direction (a scan). */
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
/** A kicking figure: k>0 blends the kick pose with the front foot at `foot` (anticipation: negative k winds the foot back). */
function kicker(s:Sheet,x:number,y:number,h:number,swing:number,target:Pt,o:FigOpts={}){const k=clamp(swing);figure(s,x,y,h,'kick',{...o,k:k+.15,foot:[lerp(x+(o.face??1)*h*.12,target[0],k)+(swing<0?swing*h*.25*(o.face??1):0),lerp(y,target[1],k)]});}

// ---------------- the world: planks, paint, ball, boot, walls, stopwatch ----------------
/** Planks: horizontal bands at three stepped coverages in `ink` (pink grain on cream = warm wood; green = grass), staggered plank ends,
 * paper hairline gaps; flex bends the gaps; `dark` prints a navy tone on the plank under a landing. */
function planks(s:Sheet,o:{h:number;covs:[number,number,number];gap:number;seed:number;ink?:string;ext?:number;flex?:Field;ox?:number;oy?:number;dark?:{x:number;y:number;k:number}[]}){
 const{h,covs,gap,seed,ink=P,ext=1900,flex,ox=0,oy=0,dark=[]}=o,paths=[new Path2D(),new Path2D(),new Path2D()],hair=new Path2D(),n=Math.ceil(ext/h)+1,seq=[0,1,2,1,0,2,1];
 for(let j=-n;j<=n;j++){const y0=oy+j*h,level=seq[((j%7)+7)%7],top:Pt[]=[],bot:Pt[]=[];
  for(let x=ox-ext;x<=ox+ext;x+=200){const f1=flex?flex(x,y0):0,f2=flex?flex(x,y0+h):0;top.push([x,y0+f1]);bot.push([x,y0+h-gap+f2]);}
  paths[level].addPath(polyPath([...top,...bot.reverse()],true));
  const hp:Pt[]=bot.map(p=>[p[0],p[1]] as Pt);hair.addPath(polyPath([...hp,...hp.map(p=>[p[0],p[1]+gap] as Pt).reverse()],true));
  for(let k=0;k<3;k++){const xk=ox-ext+hash(j*5+k,seed)*ext*2;hair.addPath(rectPath(xk,y0,gap,h-gap));}
 }
 paths.forEach((p,k)=>{if(covs[k]>.05)s.fill(ink,p,covs[k]);});s.knockout(hair,.95);
 for(const d of dark){if(d.k<=0)continue;const y0=oy+Math.floor((d.y-oy)/h)*h;s.tone(K,rectPath(d.x-260,y0,520,h-gap),.32*d.k);}
}
/** Painted lines: blue bands with a navy roller-drag stripe along one edge. Each line may draw on with its own progress. Two ops for all. */
function paint(s:Sheet,lines:{pts:Pt[];w:number;p?:number;close?:boolean}[],seed:number,o:{cov?:number;drag?:number}={}){
 const{cov=1,drag=.45}=o,blue=new Path2D(),navy=new Path2D();let any=false;
 lines.forEach((l,i)=>{const p=l.p??1;if(p<=0)return;const line=p>=1?l.pts:partial(smoothPts(l.pts,l.close&&p>=1,8),p);if(line.length<2)return;any=true;
  blue.addPath(ribbon(line,l.w,{seed:seed+i,pressure:.25,taper:.1,wobble:1.5,step:10,close:l.close&&p>=1}));navy.addPath(ribbon(offsetPts(line,l.w*.34),l.w*.28,{seed:seed+i+50,pressure:.2,taper:.2,wobble:1,step:10,close:l.close&&p>=1}));});
 if(!any)return;s.fill(B,blue,cov);s.fill(K,navy,cov*drag);
}
/** The painted rectangle that shrinks and grows: perimeter, centre line and circle, optional D's and goal frames. buckle bows the long sides inward. */
function courtRect(s:Sheet,x:number,y:number,w:number,h:number,lineW:number,seed:number,o:{p?:number;centre?:number;buckle?:number;ds?:number;goals?:number;circleR?:number;thin?:number}={}){
 const{p=1,centre=1,buckle=0,ds=0,goals=0,circleR=h*.13,thin=1}=o,lw=lineW*thin;
 const per:Pt[]=[[x-w/2,y-h/2],[x+w/2,y-h/2],[x+w/2,y-h*.25],[x+w/2-buckle,y],[x+w/2,y+h*.25],[x+w/2,y+h/2],[x-w/2,y+h/2],[x-w/2,y+h*.25],[x-w/2+buckle,y],[x-w/2,y-h*.25],[x-w/2,y-h/2]];
 const lines:{pts:Pt[];w:number;p?:number;close?:boolean}[]=[{pts:per,w:lw,p},{pts:[[x,y-h/2],[x,y+h/2]],w:lw,p:centre},{pts:blob(x,y,circleR,circleR,seed,{amp:.02,n:32}).concat([blob(x,y,circleR,circleR,seed,{amp:.02,n:32})[0]]),w:lw*.8,p:centre}];
 if(ds>0){const r=h*.28;for(const side of[-1,1]){const d:Pt[]=[];for(let i=0;i<=10;i++){const ang=Math.PI/2+(i/10)*Math.PI;d.push([x+side*(w/2-r*Math.abs(Math.sin(ang))),y+Math.cos(ang)*r]);}lines.push({pts:d,w:lw*.8,p:ds});}}
 paint(s,lines,seed);
 if(goals>0){const gw=h*.36,gh=h*.1;goalFrame(s,K,x-w/2-gh*goals,y-gw/2,gh*goals,gw,{depth:gh*.6,net:K,seed,bar:Math.max(4,lw*.6)});goalFrame(s,K,x+w/2,y-gw/2,gh*goals,gw,{depth:gh*.6,net:K,seed:seed+1,bar:Math.max(4,lw*.6)});}
}
/** The ball of this story: a paper football whose panels are painted with blue court paint — a centre pentagon and five rim panels, a
 * navy rim, one paper gloss glint, and a drip of paint running off the lowest panel. fill=false leaves paper + navy seams (duotone beat).
 * smear stretches the whole ball for a fast pass. ≈ 7 ops. Tiny balls (r < 24) print as a plain paint spot. */
function paintBall(s:Sheet,x:number,y:number,r:number,seed:number,o:{sx?:number;sy?:number;smear?:{dir:number;amount:number};fill?:boolean;glint?:number;rim?:boolean;rot?:number;drip?:number}={}){
 const{sx=1,sy=1,smear,fill=true,glint=1,rim=true,rot=0,drip=1}=o;let pts=blob(x,y,r*sx,r*sy,seed,{amp:.03,n:40});if(smear&&smear.amount>0)pts=smearPose(pts,smear.dir,smear.amount,[x,y]);
 const path=polyPath(pts,true);s.knockout(path);
 if(r<24){if(fill)s.fill(B,path,.95);if(rim)s.fill(K,ribbon(pts,Math.max(2.5,r*.1),{seed:seed+1,close:true,pressure:.5,wobble:r*.02}),.85);return;}
 s.save();s.clip(path);
 const pan=new Path2D(),seams=new Path2D();const pent=(cx:number,cy:number,pr:number,a0:number)=>{const q:Pt[]=[];for(let i=0;i<5;i++){const a=a0+i/5*TAU;q.push([cx+Math.cos(a)*pr*sx,cy+Math.sin(a)*pr*sy]);}return polyPath(smoothPts(q,true,6,2.5),true);};
 pan.addPath(pent(x,y,r*.34,rot-Math.PI/2));
 for(let i=0;i<5;i++){const a=rot-Math.PI/2+Math.PI/5+i/5*TAU;pan.addPath(pent(x+Math.cos(a)*r*.86*sx,y+Math.sin(a)*r*.86*sy,r*.3,a+Math.PI));const b=rot-Math.PI/2+i/5*TAU;seams.addPath(ribbon([[x+Math.cos(b)*r*.34*sx,y+Math.sin(b)*r*.34*sy],[x+Math.cos(b)*r*.66*sx,y+Math.sin(b)*r*.66*sy]],Math.max(2.5,r*.05),{seed:seed+4+i,taper:.3,wobble:1}));}
 if(fill)s.fill(B,pan,.95);s.fill(K,seams,.9);
 if(fill&&drip>0){const a=rot-Math.PI/2+Math.PI/5+2/5*TAU,dx=x+Math.cos(a)*r*.86*sx,dy=y+Math.sin(a)*r*.86*sy;s.fill(B,ribbon([[dx,dy],[dx+r*.04,dy+r*.34*drip]],r*.12,{seed:seed+9,taper:.5,wobble:.6}),.95);}
 s.restore();
 if(rim)s.fill(K,ribbon(pts,Math.max(3,r*.07),{seed:seed+1,close:true,pressure:.5,wobble:r*.02}),.85);
 if(glint>0&&fill)s.knockout(polyPath(blob(x-r*.4*sx,y-r*.42*sy,r*.14*glint,r*.1*glint,seed+2,{amp:.05,n:16}),true));
}
/** A boot seen from the side (toe to the right when face=+1): navy body knocked out beneath, a paper tongue stripe, laces, four studs. tilt rolls it on the toe. */
function boot(s:Sheet,x:number,y:number,len:number,seed:number,o:{face?:1|-1;tilt?:number;cov?:number}={}){
 const{face=1,tilt=0,cov=.9}=o,h=len*.46,m=face;
 const local:Pt[]=[[-len*.5,0],[-len*.5,-h*.5],[-len*.42,-h*.95],[-len*.18,-h*.98],[-len*.05,-h*.55],[len*.2,-h*.42],[len*.45,-h*.3],[len*.5,-h*.08],[len*.42,0]];
 const pts=rotPts(local.map(p=>[p[0]*m,p[1]] as Pt),tilt*m,-len*.5*m*0+len*.45*m,0).map(p=>[p[0]+x,p[1]+y] as Pt),body=polyPath(smoothPts(handCut(pts,seed,len*.015,len*.2),true,6,1.2),true);
 s.knockout(body);s.fill(K,body,cov);
 const studs=new Path2D();for(let i=0;i<4;i++){const u=-.42+i*.26;const q=rotPts([[u*len*m-len*.035,0],[u*len*m+len*.035,0],[u*len*m+len*.025,h*.16],[u*len*m-len*.025,h*.16]],tilt*m,len*.45*m,0).map(p=>[p[0]+x,p[1]+y] as Pt);studs.addPath(polyPath(q,true));}s.fill(K,studs,cov);
 const tongue=rotPts([[-len*.3*m,-h*.92],[-len*.12*m,-h*.96],[len*.05*m,-h*.5],[-len*.1*m,-h*.5]],tilt*m,len*.45*m,0).map(p=>[p[0]+x,p[1]+y] as Pt);s.knockout(polyPath(tongue,true),.9);
 const laces=new Path2D();for(let i=0;i<3;i++){const q=rotPts([[(-len*.28+i*len*.09)*m,-h*(.86-i*.1)],[(-len*.2+i*len*.09)*m,-h*(.8-i*.1)]],tilt*m,len*.45*m,0).map(p=>[p[0]+x,p[1]+y] as Pt);laces.moveTo(q[0][0],q[0][1]);laces.lineTo(q[1][0],q[1][1]);}s.stroke(K,laces,Math.max(2,len*.02),.9);
 s.fill(K,ribbon(pts,Math.max(3,len*.025),{seed:seed+1,close:true,pressure:.5,wobble:1.5,step:8}));
}
/** A pink wall / wedge / maze block: torn edges; the planks are knocked out beneath except a strip along the inner edge, which prints
 * pink × pink-grain as the wall's shadow (its weight on the floor). crumple pushes the face at `dir` in; cov fades it. */
function wall(s:Sheet,corners:Pt[],inner:number,seed:number,o:{cov?:number;crumple?:number;dir?:number;strip?:number}={}){
 const{cov=1,crumple=0,dir=0,strip=26}=o;if(cov<=.05)return;
 let pts=handCut(corners,seed,strip*.9,90);if(crumple>0){const c:Pt=[corners.reduce((a,p)=>a+p[0],0)/corners.length,corners.reduce((a,p)=>a+p[1],0)/corners.length];pts=pressPts(pts,dir,crumple,120,c);}
 const a=corners[inner],b=corners[(inner+1)%corners.length],nx=-(b[1]-a[1]),ny=b[0]-a[0],l=Math.hypot(nx,ny)||1;
 const knock=corners.map((p,i)=>i===inner||i===(inner+1)%corners.length?[p[0]+nx/l*strip,p[1]+ny/l*strip] as Pt:p);
 s.knockout(polyPath(knock,true));s.fill(P,polyPath(pts,true),cov);
}
/** The stopwatch: a blue paint ring, a top button and two lugs, a pink halftone face (the pressure of time), tick marks, a navy hand with blur ghosts. */
function stopwatch(s:Sheet,x:number,y:number,r:number,seed:number,o:{hand?:number;face?:number;blur?:number;lineW?:number}={}){
 const{hand=-Math.PI/2,face=0,blur=0,lineW=r*.12}=o;
 const cap=new Path2D();cap.addPath(polyPath(rrect(x,y-r*1.12,r*.3,r*.22,r*.05),true));cap.addPath(polyPath(rrect(x,y-r*1.3,r*.42,r*.16,r*.05),true));cap.addPath(polyPath(rotPts(rrect(x,y-r*1.06,r*.22,r*.18,r*.04),-.7,x,y).map(p=>[p[0],p[1]] as Pt),true));
 s.knockout(cap);s.fill(K,cap,.9);
 s.knockout(polyPath(blob(x,y,r*.95,r*.95,seed,{amp:.02}),true),.9);
 if(face>.05)s.fill(P,polyPath(blob(x,y,r*.9,r*.9,seed,{amp:.03}),true),face);
 paint(s,[{pts:blob(x,y,r,r,seed+1,{amp:.02,n:40}).concat([blob(x,y,r,r,seed+1,{amp:.02,n:40})[0]]),w:lineW,close:true}],seed+2);
 const ticks=new Path2D();for(let k=0;k<12;k++){const a=k/12*TAU,l=k%3===0?r*.2:r*.1;ticks.moveTo(x+Math.cos(a)*r*.82,y+Math.sin(a)*r*.82);ticks.lineTo(x+Math.cos(a)*(r*.82-l),y+Math.sin(a)*(r*.82-l));}s.stroke(K,ticks,Math.max(2,r*.035),.9);
 const h=new Path2D();h.addPath(ribbon([[x,y],[x+Math.cos(hand)*r*.78,y+Math.sin(hand)*r*.78]],Math.max(5,r*.1),{seed:seed+3,pressure:.4,taper:.3,wobble:1}));s.fill(K,h);
 if(blur>0){const g=new Path2D();for(let k=1;k<=3;k++){const a=hand-k*.28*blur;g.addPath(ribbon([[x,y],[x+Math.cos(a)*r*.72,y+Math.sin(a)*r*.72]],Math.max(4,r*.08),{seed:seed+4+k,taper:.4,wobble:1}));}s.fill(K,g,.32);}
 s.fill(K,circlePath(x,y,Math.max(4,r*.07)));
}
/** Paint flecks and floor dust that spray from a point. */
function flecks(s:Sheet,x:number,y:number,r:number,n:number,seed:number,scatter:number){if(scatter<=0)return;const rr=rng(seed),bp=new Path2D(),pp=new Path2D(),dp=new Path2D();
 for(let i=0;i<n;i++){const a=rr()*TAU,d=(20+rr()*r)*scatter,sz=8+rr()*14,px=x+Math.cos(a)*d,py=y+Math.sin(a)*d,q=rotPts([[-sz*.5,-sz*.3],[sz*.5,-sz*.4],[sz*.4,sz*.4],[-sz*.4,sz*.3]],rr()*TAU),p=i%3===0?pp:i%3===1?bp:dp;p.moveTo(px+q[0][0],py+q[0][1]);for(let k=1;k<4;k++)p.lineTo(px+q[k][0],py+q[k][1]);p.closePath();}
 s.fill(B,bp);s.fill(P,pp);s.knockout(dp,.9);}
const lens=(s:Sheet,x:number,y:number,r:number,seed:number,cov=.35)=>{if(r>4)s.knockout(polyPath(blob(x,y,r,r,seed,{amp:.05}),true),cov);};
/** Plank coverages: WOOD = pink grain on cream (the court), GRASS = green (the full pitch only). */
const WOOD:[number,number,number]=[.1,.2,.1],GRASS:[number,number,number]=[.2,.32,.26];

// ---------------- scene 1 (0–5.36): the small rectangle on a wide floor, pink walls at its sides; the game inside pings; we push in ----------------
const sc1:Scene={
 draw(s,t){
  const tt=twos(t);
  const v=key(t,[[0,0,0,1],[.9,0,0,1.01],[2.0,-30,10,1.6],[2.4,-30,10,1.6],[3.8,0,0,2.8],[4.3,0,20,3.0],[5.5,0,20,3.0]],easeIO,true);
  s.camera(v[0],v[1],v[2],0);
  const land=sm(3.8,4.25,tt,easeIn),hit=tt>=4.25;
  // pings inside the rectangle: three legs, each hit bulges the struck band and darkens the plank under it
  const legs:[number,number,number][]=[[.9,-120,120],[1.2,120,-120],[1.5,-120,120]];let px=0,bulgeL=0,bulgeR=0;
  for(const [at,from,to] of legs){const u=sm(at,at+.3,tt,easeIO);if(tt>=at)px=lerp(from,to,u);if(to>0)bulgeR=Math.max(bulgeR,6*pulse(tt,at+.3,.5));else bulgeL=Math.max(bulgeL,6*pulse(tt,at+.3,.5));}
  if(tt>=1.8)px=lerp(120,0,sm(1.8,2.0,tt,easeOut));
  planks(s,{h:110,covs:WOOD,gap:4,seed:11,flex:(x,y)=>hit?-6*Math.exp(-(x*x+y*y)/(260*260))*(1-sm(4.25,5,tt)):0,dark:[{x:px,y:0,k:pulse(tt,1.2,.3)+pulse(tt,1.5,.3)},{x:0,y:0,k:pulse(tt,4.25,.4)}]});
  // the pink walls of the small court stand at its sides from the first frame
  wall(s,[[-290,-260],[-215,-260],[-215,260],[-290,260]],1,10,{strip:12});wall(s,[[215,-260],[290,-260],[290,260],[215,260]],3,12,{strip:12});
  // the rectangle rolls on: a first dab, the perimeter tip leading, then the centre line and circle; D's and goal frames arrive as we push in
  const rollOn=anticipate(0,.6,tt,{back:.02,hold:.15,e:easeOut});if(tt<.15)s.fill(B,polyPath(blob(-150,-90,14,14,12,{amp:.1}),true));
  const centre=sm(.6,.9,tt,easeOut),thick=1+(sm(2.4,3.2,tt)*1.2);
  courtRect(s,0,0,300,180,14,13,{p:clamp(rollOn),centre,buckle:-(bulgeL+bulgeR)*.5,ds:sm(2.4,2.7,tt,easeOut),goals:easeOutBack(sm(2.8,3.1,tt)),circleR:24*thick*.6+10});
  flecks(s,-150,-90,60,6,14,pulse(tt,.6,.4));flecks(s,150,90,60,6,15,pulse(tt,.62,.4));flecks(s,0,0,120,10,16,pulse(tt,4.25,.6));
  // the ball: small and lively, then the big painted ball drops onto the centre circle
  if(tt<3.8||land<1)paintBall(s,px,0,16,17,{smear:{dir:0,amount:tt>.9&&tt<1.8?30:0},glint:.6});
  const by=lerp(-700,0,land),sq=hit?.08*settle(tt,4.25,{amp:1,freq:4,decay:5,phase:Math.PI/2}):0;
  if(tt>=3.8)paintBall(s,0,by,140,18,{sx:1+sq,sy:1-sq,rot:land*2});
  if(hit)ripple(s,K,0,0,170,1,{width:6,seed:19,progress:sm(4.25,4.7,tt),cov:.6});
 },
 aperture(){return apertureDisc(0,0,132,12);},
 still:4.6,
};

// ---------------- scene 2 (5.36–16.56): the tight court — walls, the fast arrival, defenders close, the stopwatch, the spotlight, the lanes ----------------
const sc2:Scene={
 draw(s,t){
  const tt=twos(t);
  const push=key(tt,[[0,700],[.2,730,easeIn],[.9,330,easeOut],[7.12,330],[7.6,290]])+8*settle(tt,.9,{amp:1,freq:6,decay:6})+6*settle(tt,7.6,{amp:1,freq:6,decay:6});
  const v=key(t,[[0,0,0,1],[1,0,40,1.15],[5.34,0,40,1.15],[5.84,0,-300,1.15],[6.64,-160,-80,1.15],[7.12,-160,-80,1.15],[7.92,-200,-120,1.3],[8.34,-200,-120,1.3],[9.54,-200,-220,1.3],[11.3,-200,-220,1.3]],easeIO,true);
  s.camera(v[0]+12*pulse(t,.84),v[1],v[2],0);
  const buckle=30*(pulse(tt,.9,1.2)+pulse(tt,7.6,1)),wallFlex=(x:number,y:number)=>6*Math.exp(-((Math.abs(x)-push)**2)/(120*120))*(pulse(tt,.9)+pulse(tt,7.6));
  // the fast arrival (0.45 s) from off-frame, the defenders pressing in, the first-time pass to the teammate, the chosen lane
  const arrive=sm(.84,1.29,tt,easeOut),cush=tt>=1.29?settle(tt,1.29,{amp:1,freq:5,decay:5,phase:Math.PI/2}):0;
  const pressIn=sm(1.64,2.14,tt,easeOut),first=sm(5.84,6.34,tt,easeOut),chosen=sm(9.64,10.24,tt,easeOut);
  const you:Pt=[-40,120],g1:Pt=[lerp(-250,-170,pressIn),lerp(-260,-170,pressIn)],d2:Pt=[lerp(300,190,pressIn),lerp(-200,-40,pressIn)],d3:Pt=[lerp(-230,-150,pressIn),lerp(360,280,pressIn)],from:Pt=[900,-420];
  let sp:Pt=from,sq=0,smear=0;
  if(tt>=.84){sp=[lerp(from[0],you[0],arrive),lerp(from[1],you[1],arrive)];smear=arrive<1?60:0;sq=.06*cush;}
  if(tt>=5.84){sp=[lerp(you[0],g1[0],first),lerp(you[1],g1[1],first)];smear=first<1?40:0;sq=.06*settle(tt,6.34,{amp:1,freq:5,decay:5,phase:Math.PI/2});}
  const laneEnd:Pt=[-180,-40];if(tt>=9.64){sp=[lerp(g1[0],laneEnd[0],chosen),lerp(g1[1],laneEnd[1],chosen)];smear=chosen<1?30:0;sq=.06*settle(tt,10.24,{amp:1,freq:5,decay:5,phase:Math.PI/2});}
  planks(s,{h:110,covs:WOOD,gap:4,seed:21,flex:wallFlex,dark:[{x:you[0],y:you[1],k:pulse(tt,1.29,.3)},{x:g1[0],y:g1[1],k:pulse(tt,6.34,.3)}]});
  // court paint: touchlines that buckle under the walls, the D under the stopwatch
  paint(s,[{pts:[[-300,-900],[-300,-300],[-300+buckle,0],[-300,300],[-300,900]],w:16},{pts:[[300,-900],[300,-300],[300-buckle,0],[300,300],[300,900]],w:16},{pts:(()=>{const d:Pt[]=[];for(let i=0;i<=12;i++){const a=.15+(i/12)*(Math.PI-.3);d.push([Math.cos(a)*200,-560+Math.sin(a)*200]);}return d;})(),w:14}],22);
  // lanes: the arrival lane, the first-time lane, then three options (one cut by the wedge, one chosen)
  paint(s,[{pts:[from,you],w:36,p:sm(.84,1.1,tt)*(1-sm(3,3.6,tt))},{pts:[you,g1],w:36,p:sm(5.84,6.1,tt)*(1-sm(7.5,8,tt))},
   {pts:[g1,laneEnd],w:40,p:sm(8.34,8.74,tt,easeOut)},{pts:[g1,[-100,-520]],w:40,p:sm(8.49,8.89,tt,easeOut)*(1-sm(9.14,9.44,tt)*.55)},{pts:[g1,[-120,180]],w:40,p:sm(8.64,9.04,tt,easeOut)}],23,{cov:tt>=9.64?.9:1});
  if(tt>=9.14){const cut=sm(9.14,9.44,tt,easeOut);const wedge=[[push,-470],[push-320*cut-60,-430],[push-320*cut-60,-390],[push,-350]] as Pt[];s.knockout(polyPath(wedge,true));s.fill(P,polyPath(handCut(wedge,25,10,60),true));dust(s,null,push-320*cut-60,-410,60,8,{seed:26,size:8,cov:.8});}
  // the stopwatch: hand sweeps a full turn on "less time", the face fills pink, then keeps twitching
  const sweep=sm(5.34,5.94,tt,easeIn),hand=-Math.PI/2-.17*sm(5.2,5.34,tt)+TAU*sweep+(tt>=5.94?.35*settle(tt,5.94,{amp:1,freq:4,decay:5})+.12*Math.floor(((tt-5.94)*4)%2):0);
  stopwatch(s,0,-420,110,27,{hand,face:.6*sm(5.34,6.2,tt),blur:sweep>0&&sweep<1?1:0});
  // walls press in (heavy), buckling the paint and kicking dust at their feet
  wall(s,[[-push-800,-1100],[-push,-1100],[-push,1100],[-push-800,1100]],1,28);wall(s,[[push,-1100],[push+800,-1100],[push+800,1100],[push,1100]],3,29);
  dust(s,null,-push+40,200,140,10,{seed:30,size:10,cov:.8*(pulse(tt,.9)+pulse(tt,7.6))+.01});dust(s,null,push-40,-100,140,10,{seed:31,size:10,cov:.8*(pulse(tt,.9)+pulse(tt,7.6))+.01});
  // the free space around the ball narrows as the defenders close (a paper lens)
  lens(s,sp[0],sp[1],lerp(320,200,pressIn),32,.3);
  // the players: you (paper) receive and pass first time; the green teammate offers; two pink defenders step in
  figure(s,g1[0],g1[1]+70,340,'arms',{ink:G,seed:33,face:1,k:.5+.5*sm(5.5,5.84,tt),shade:K});
  figure(s,d2[0],d2[1]+70,360,'step',{ink:P,seed:34,face:-1,k:.5+.5*pressIn,shade:K});figure(s,d3[0],d3[1]+70,360,'step',{ink:P,seed:35,face:1,k:.5+.5*pressIn,shade:K});
  {const swing=anticipate(5.6,5.84,tt,{back:.5,hold:.6,e:easeIn});if(tt>=5.6&&tt<6.3)kicker(s,you[0]-70,you[1]+70,380,swing,[you[0]+20,you[1]+10],{seed:36,face:-1,shade:B});else figure(s,you[0]-70,you[1]+70,380,tt<1.29?'scan':'stand',{seed:36,face:1,look:.7*(1-sm(1.29,1.6,tt)),sight:(1-sm(1.29,1.5,tt))*sm(.3,.6,tt),k:1,shade:B});}
  paintBall(s,sp[0],sp[1],100,37,{sx:1+sq,sy:1-sq,smear:{dir:Math.atan2(you[1]-from[1],you[0]-from[0]),amount:smear},rot:arrive*4+first*3+chosen*3});
  // less room to hide: a navy field with paper spotlights on everyone
  if(tt>=7.12){const iris=sm(7.12,7.62,tt,easeOut),f=new Path2D();f.rect(-3000,-3000,6000,6000);f.addPath(polyPath(blob(sp[0],sp[1],300*iris,300*iris,38,{amp:.03}).reverse(),true));
   ([[you,7.22],[d2,7.32],[d3,7.42]] as [Pt,number][]).forEach(([p,at],i)=>{const r=200*sm(at,at+.4,tt,easeOut);if(r>2)f.addPath(polyPath(blob(p[0]-30,p[1]-100,r,r,39+i,{amp:.04}).reverse(),true));});
   s.fill(K,f,.6,'evenodd');}
  flecks(s,-push,300,120,8,40,pulse(tt,.9,.5));flecks(s,push,-200,120,8,41,pulse(tt,.9,.5));
 },
 aperture(){return apertureDisc(0,-420,104,12);},
 still:3.0,
};

// ---------------- scene 3 (16.56–23.30): the full grass pitch — seconds of room for a lone player; then the lines fold into the court ----------------
const sc3:Scene={
 draw(s,t){
  const tt=twos(t);
  const fold=sm(4.54,5.44,tt,easeIn),foldO=fold>=1?30*settle(tt,5.44,{amp:1,freq:4,decay:5}):0;
  const v=key(t,[[0,-200,100,1,0],[1.2,250,-50,1,0],[2.0,-150,60,1,0],[2.44,-150,75,1,0],[2.94,-420,-260,1,.07],[3.24,-420,-260,1,.07],[3.74,300,-200,1,-.05],[4.04,300,-200,1,-.05],[4.54,-150,60,1,0],[5.64,0,0,1.35,0],[6.74,300,0,1.35,0],[7,300,0,1.35,0]],easeIO,true);
  s.camera(v[0]+15*pulse(t,6.04),v[1],v[2],v[3]);
  // grass planks fold into the pink wood of the small court
  const bandH=lerp(260,110,fold);
  if(fold<1)planks(s,{h:bandH,covs:[GRASS[0]*(1-fold),GRASS[1]*(1-fold),GRASS[2]*(1-fold)],gap:lerp(8,4,fold),seed:51,ink:G,dark:[{x:-200,y:100,k:pulse(tt,1.34,.4)}]});
  if(fold>0)planks(s,{h:bandH,covs:[WOOD[0]*fold,WOOD[1]*fold,WOOD[2]*fold],gap:lerp(8,4,fold),seed:51,dark:[{x:300,y:-120,k:pulse(tt,6.44,.3)}]});
  // the pitch lines roll out from the centre circle, then slide inward and fold the floor with them
  const tx=lerp(1300,540,fold)+foldO,gy=lerp(-900,-520,fold)-foldO,out=sm(0,.8,tt,easeOut);
  paint(s,[{pts:[[-tx,1200],[-tx,gy]],w:16,p:out},{pts:[[tx,1200],[tx,gy]],w:16,p:out},{pts:[[-tx,gy],[tx,gy]],w:16,p:out},{pts:blob(0,200,lerp(260,150,fold),lerp(260,150,fold),52,{amp:.02,n:40}).concat([blob(0,200,lerp(260,150,fold),lerp(260,150,fold),52,{amp:.02,n:40})[0]]),w:16,p:out,close:true}],53);
  if(fold>0&&fold<1){speedLines(s,B,-tx,0,Math.PI,{n:5,seed:54,len:200,width:8,cov:.6});speedLines(s,B,tx,0,0,{n:5,seed:55,len:200,width:8,cov:.6});}
  // the stopwatch: three slow ticks with three looks, then it shrinks and its ticks quicken
  const ticks=Math.floor(sm(2.44,2.5,tt))+Math.floor(sm(3.24,3.3,tt))+Math.floor(sm(4.04,4.1,tt)),fast=Math.floor(clamp((tt-5.2)/.2))*Math.min(1,Math.max(0,tt-5.2)>0?1:0);
  const hand=-Math.PI/2+ticks*.52+.09*(settle(tt,2.44,{amp:1,freq:5,decay:6})+settle(tt,3.24,{amp:1,freq:5,decay:6})+settle(tt,4.04,{amp:1,freq:5,decay:6}))+(tt>=5.2?Math.min(4,fast)*.52:0);
  stopwatch(s,lerp(-500,-330,fold),lerp(-380,-300,fold),lerp(160,70,fold),56,{hand,blur:tt>=5.2&&tt<6.2?.8:0});
  // walls and two pink defenders rush in once the court is small again ("moments")
  const wp=sm(5.74,6.14,tt,easeIn);if(wp>0){const wx=lerp(1400,540,wp);wall(s,[[-wx-800,-1100],[-wx,-1100],[-wx,1100],[-wx-800,1100]],1,57);wall(s,[[wx,-1100],[wx+800,-1100],[wx+800,1100],[wx,1100]],3,58);
   figure(s,lerp(-1300,-420,wp),240,360,'run',{ink:P,seed:64,face:1,k:1,shade:K});figure(s,lerp(1300,520,wp),300,360,'run',{ink:P,seed:65,face:-1,k:1,shade:K});}
  // the far teammate, carried in by the folding; the slow high pass; the quick pass at the end
  const g:Pt=[lerp(900,300,fold),lerp(-400,-120,fold)];figure(s,g[0],g[1]+60,320,'arms',{ink:G,seed:59,face:-1,k:.6+.4*sm(5.8,6.04,tt),shade:K});
  const flight=sm(.24,1.34,tt,easeIO),bounce=tt>=1.34?Math.abs(40*settle(tt,1.34,{amp:1,freq:3,decay:3})):0,pass2=sm(6.04,6.44,tt,easeOut);
  let sp:Pt=[lerp(-1400,-200,flight),lerp(200,100,flight)-bounce],r=60+12*Math.sin(flight*Math.PI),sq=tt>=1.34?.06*settle(tt,1.34,{amp:1,freq:4,decay:5,phase:Math.PI/2}):0;
  const look=[[2.44,.8],[3.24,-.8],[4.04,.8]] as [number,number][];let lk=0;for(const [at,d] of look)lk=lerp(lk,d,sm(at,at+.2,tt,easeOut));sp[0]+=lk*20;
  if(tt>=6.04){sp=[lerp(-200+lk*20,g[0],pass2),lerp(100,g[1],pass2)];sq=.06*settle(tt,6.44,{amp:1,freq:5,decay:5,phase:Math.PI/2});}
  if(flight>0&&flight<1)s.knockout(polyPath(blob(sp[0],200+40,r*1.1,r*.45,60,{amp:.04}),true),.5);
  // you: alone on the grass, cushion the high ball, then look left and right (scan) while the stopwatch ticks, then pass quickly
  {const cushK=tt>=1.2&&tt<1.9?.5*(1-sm(1.34,1.9,tt)):0,swing=anticipate(5.8,6.04,tt,{back:.5,hold:.6,e:easeIn});
   if(tt>=5.8&&tt<6.5)kicker(s,-280,180,440,swing,[-200,110],{seed:61,face:1,shade:B});
   else if(cushK>0)figure(s,-280,180,440,'kick',{seed:61,face:1,k:cushK,foot:[-200,120],shade:B});
   else figure(s,-280,180,440,'scan',{seed:61,face:1,look:lk,sight:Math.abs(lk)*(1-sm(5.2,5.5,tt)),k:1,shade:B});}
  paintBall(s,sp[0],sp[1],r,62,{sx:1+sq,sy:1-sq,smear:{dir:Math.atan2(g[1]-100,g[0]+200),amount:pass2>0&&pass2<1?40:0},rot:flight*6+pass2*3});
  flecks(s,300,-120,100,8,63,pulse(tt,6.44,.4));
 },
 aperture(){return aperture(lozenge(540,0,90,320,Math.PI/2));},
 still:1.5,
};

// ---------------- scene 4 (23.30–31.04): the tightest space — scan early, cushion, one-two, the maze of defenders and the one lane through ----------------
const sc4:Scene={
 draw(s,t){
  const tt=twos(t);
  const v=key(t,[[0,0,0,1,0],[.1,0,15,1,0],[.25,-160,0,1,0],[.45,-160,0,1,0],[.6,180,-60,1,0],[.8,180,-60,1,0],[.95,120,-200,1,0],[1.88,120,-200,1,0],[2.68,-100,180,1.2,0],[3.54,-100,180,1.2,0],[4.04,160,60,1.2,0],[4.54,40,-60,1.2,0],[5.88,140,-140,1.35,.17],[6.4,180,-120,1.35,.17],[7.9,180,-120,1.35,.17]],easeIO,true);
  s.camera(v[0]+20*sm(2.1,2.6,t)*(1-sm(2.8,3.2,t)),v[1],v[2],v[3]);
  const duo=tt>=4.48&&tt<5.6,paintBack=sm(5.6,5.9,tt);
  const squeeze=sm(2.1,2.6,tt,easeIn),wallL=lerp(-380,-130,squeeze),wallRlunge=80*sm(3.6,3.9,tt,easeOut)*(1-.6*sm(4.1,4.5,tt)),wallR=lerp(360,130,squeeze)-wallRlunge,sag=30*sm(4.1,4.5,tt);
  if(!duo)planks(s,{h:220,covs:WOOD,gap:6,seed:71,flex:(x,y)=>-6*(pulse(tt,2.6)+pulse(tt,5.08))*Math.exp(-((Math.abs(x)-130)**2)/(140*140)),dark:[{x:-140,y:160,k:pulse(tt,1.0,.3)}]});
  // walls: very close, they squeeze on "tight spaces"; the right one lunges at the first pass and sags when beaten
  const mazeIn=sm(4.48,5.08,tt,easeIn);
  if(mazeIn<=0){wall(s,[[wallL-800,-1200],[wallL,-1200],[wallL,1200],[wallL-800,1200]],1,72);wall(s,[[wallR,-1200],[wallR+800,-1200],[wallR+800,1200+sag],[wallR,1200]],3,73,{crumple:.3*sm(4.1,4.5,tt),dir:Math.PI});wall(s,[[-1200,420],[1200,420],[1200,1300],[-1200,1300]],0,74);}
  dust(s,null,wallL+30,100,160,12,{seed:75,size:10,cov:.8*pulse(tt,2.6)+.01});dust(s,null,wallR-30,-60,160,12,{seed:76,size:10,cov:.8*pulse(tt,2.6)+.01});
  // your position, the teammate, the far teammate beyond the maze
  const cush=tt>=1.0?settle(tt,1.0,{amp:1,freq:4,decay:4,phase:Math.PI/2}):0,rollA=sm(2.2,2.45,tt,easeIO),rollB=sm(2.5,2.75,tt,easeIO);
  const move=sm(3.7,4.3,tt,easeOut),you:Pt=[lerp(-120,40,move)+40*Math.sin(rollA*Math.PI)-40*Math.sin(rollB*Math.PI),lerp(200,40,move)];
  const g:Pt=[330,-120],far:Pt=[420,-300];
  const p1=sm(3.54,4.04,tt,easeOut),p2=sm(4.04,4.54,tt,easeOut),through=sm(6.1,6.8,tt,easeIO);
  // the maze: five pink defenders run in from three sides and lock around you, leaving one gap at the upper right
  if(mazeIn>0){const spots:[number,number][]=[[-220,-160],[-10,-190],[-240,40],[-200,220],[60,230]];
   spots.forEach(([gx,gy],i)=>{const from:Pt=[gx*4,gy*4],u=sm(4.48+i*.06,5.08+i*.06,tt,easeIn),x=lerp(from[0],gx,u),y=lerp(from[1],gy,u);figure(s,x,y+70,320,u<1?'run':'step',{ink:P,seed:77+i,face:gx<you[0]?1:-1,k:1,shade:K});});
   if(tt>=5.08&&tt<5.5)dust(s,null,0,0,300,20,{seed:90,size:10,cov:.8});}
  let sp:Pt,sq=0,smearA=0;
  if(tt<1.0){const u=sm(.35,1.0,tt,easeOut);sp=[lerp(-1000,-140,u),lerp(60,160,u)-60*Math.sin(u*Math.PI)];}
  else if(tt<3.54)sp=[-140-20*sm(1.88,2.05,tt)+20*sm(2.05,2.3,tt),160];
  else if(tt<4.04)sp=[lerp(-140,g[0],p1),lerp(160,g[1],p1)];
  else if(tt<6.1)sp=[lerp(g[0],you[0],p2),lerp(g[1],you[1],p2)];
  else sp=[lerp(you[0],far[0],through),lerp(you[1],far[1],through)];
  if(tt>=1.0&&tt<1.88)sq=.08*cush;if(tt>=1.88)sq=.08*sm(1.88,2.0,tt)*(1-sm(2.0,2.4,tt));if(p1>0&&p1<1)smearA=40;if(p2>0&&p2<1)smearA=40;if(through>0&&through<1){sq=.1*Math.sin(through*Math.PI);smearA=20;}
  if(!duo)paint(s,[{pts:[[-1000,60],[-140,160]],w:36,p:sm(.35,.6,tt)*(1-sm(1.5,2,tt))},{pts:[[-140,160],g],w:36,p:sm(3.54,3.74,tt)*(1-sm(4.6,5,tt))},{pts:[g,you],w:36,p:sm(4.04,4.24,tt)*(1-sm(4.6,5,tt))}],91);
  // the solution lane rolls through the one gap, narrowing as it squeezes between the defenders
  if(tt>=5.6){const pts:Pt[]=[you,[100,-70],[far[0],far[1]]];paint(s,[{pts,w:30,p:sm(5.6,6.1,tt,easeOut)}],92,{cov:.95});}
  if(!duo)figure(s,g[0],g[1]+70,340,tt>=3.9&&tt<4.3?'kick':'arms',{ink:G,seed:93,face:-1,k:tt>=3.9&&tt<4.3?.8:.6+.4*sm(3.3,3.54,tt),foot:tt>=3.9&&tt<4.3?[g[0]-60,g[1]+40]:undefined,shade:K});
  if(paintBack>0)figure(s,far[0],far[1]+70,340,'arms',{ink:G,seed:94,face:-1,k:paintBack,shade:K});
  // you: head turned toward the incoming ball before it arrives (scan early), cushion with the front foot, roll it, pass, move, receive, play through
  {const scan=1-sm(.9,1.1,tt),cushK=tt>=.9&&tt<1.9?clamp(.6*sm(.9,1.0,tt)*(1-sm(1.2,1.9,tt))+.2):0,swing=anticipate(3.3,3.54,tt,{back:.5,hold:.6,e:easeIn}),thru=anticipate(5.9,6.1,tt,{back:.5,hold:.6,e:easeIn});
   const fx=you[0]-60,fy=you[1]+70;
   if(tt>=3.3&&tt<3.9)kicker(s,fx,fy,380,swing,[-120,150],{seed:95,face:1,shade:B});
   else if(tt>=5.9&&tt<6.5)kicker(s,fx,fy,380,thru,[you[0]+40,you[1]+20],{seed:95,face:1,shade:B});
   else if(move>0&&move<1)figure(s,fx,fy,380,'run',{seed:95,face:1,k:1,shade:B});
   else if(cushK>0||(tt>=2.1&&tt<2.9))figure(s,fx,fy,380,'kick',{seed:95,face:1,k:cushK>0?cushK:.5,foot:[sp[0]-30,sp[1]+20],shade:B});
   else figure(s,fx,fy,380,scan>0?'scan':'stand',{seed:95,face:1,look:-.8*scan,sight:scan,k:1,shade:B});}
  paintBall(s,sp[0],sp[1],110,96,{sx:1+sq,sy:1-sq,fill:!duo,smear:{dir:Math.atan2(sp[1]-you[1],sp[0]-you[0]),amount:smearA},rot:p1*3+p2*3+through*4});
  if(through>0&&through<1)speedLines(s,B,sp[0],sp[1],Math.atan2(far[1]-you[1],far[0]-you[0]),{n:4,seed:97,len:100,width:6});
  flecks(s,wallL,0,120,8,98,pulse(tt,2.6,.5));flecks(s,wallR,0,120,8,99,pulse(tt,2.6,.5));flecks(s,0,0,200,12,100,pulse(tt,5.08,.6));
 },
 aperture(){return aperture(lozenge(150,-100,300,80,Math.atan2(-230,380)));},
 still:2.3,
};

// ---------------- scene 5 (31.04–38.20): the web — five players; everyone attacks, defends, moves, thinks ----------------
const sc5:Scene={
 draw(s,t){
  const tt=twos(t);
  const v=key(t,[[0,0,0,1,.105],[1.2,0,0,1,0],[3.6,0,0,1,0],[4.2,0,-180,1,0],[4.46,0,-180,1,0],[5.06,0,140,1,0],[5.38,0,140,1,0],[6.08,0,60,1,-.21],[6.2,0,60,1,-.21],[6.7,0,40,1.15,-.14],[7.3,0,40,1.16,-.14]],easeIO,true);
  s.camera(v[0],v[1]+10*pulse(t,5.06),v[2],v[3]);
  const up=200*sm(3.6,4.2,tt,easeOut)*(1-sm(4.46,5.06,tt,easeIO)),back=320*sm(4.46,5.06,tt,easeIn),oy=-up+back,compact=sm(4.6,5.06,tt),rot=(TAU/5)*easeOutBack(sm(5.38,6.08,tt));
  planks(s,{h:110,covs:WOOD,gap:4,seed:111,flex:(x,y)=>-6*pulse(tt,5.06)*Math.exp(-((y-back)*(y-back))/(200*200))});
  paint(s,[{pts:[[-540,-700],[-540,700]],w:16},{pts:[[540,-700],[540,700]],w:16},{pts:(()=>{const d:Pt[]=[];for(let i=0;i<=12;i++){const a=.15+(i/12)*(Math.PI-.3);d.push([Math.cos(a)*220,-560+Math.sin(a)*220]);}return d;})(),w:14},{pts:(()=>{const d:Pt[]=[];for(let i=0;i<=12;i++){const a=Math.PI+.15+(i/12)*(Math.PI-.3);d.push([Math.cos(a)*220,560+Math.sin(a)*220]);}return d;})(),w:14}],112);
  goalFrame(s,K,-130,-620,260,60,{depth:40,net:K,seed:113,bar:10});goalFrame(s,K,-130,560,260,60,{depth:40,net:K,seed:114,bar:10});
  // the five players arrive one by one, then join into a web of lanes; the web slides up, drops back and compacts, then rotates as one ring
  const base:Pt[]=[[0,60],[-360,240],[-120,-300],[300,-220],[360,300]],ctr:Pt=[0,60];
  const pos=base.map((p)=>{const c=[p[0]*(1-.35*compact),ctr[1]+(p[1]-ctr[1])*(1-.35*compact)] as Pt;const r=rotPts([[c[0]-ctr[0],c[1]-ctr[1]]],rot)[0];return[ctr[0]+r[0],ctr[1]+r[1]+oy] as Pt;});
  const printed=pos.map((_,i)=>sm(i*.2,i*.2+.2,tt,easeOut)),laneW=lerp(40,30,compact)+12*Math.sin(Math.PI*clamp((tt-1.96)/.4)),lanes:{pts:Pt[];w:number;p?:number}[]=[];
  let k=0;for(let i=0;i<5;i++)for(let j=i+1;j<5;j++){lanes.push({pts:[pos[i],pos[j]],w:laneW,p:sm(1.0+k*.08,1.5+k*.08,tt,easeOut)});k++;}
  paint(s,lanes,115,{cov:.95});
  // the ball: to a teammate on "everyone", to the top player on "attack", ridden by the wedge on "defend", back to you on "move", then held still
  const toG=sm(1.96,2.46,tt,easeOut),toTop=sm(3.6,4.1,tt,easeOut),wedgeY=key(tt,[[4.46,-1150],[5.06,-420,easeIn],[5.38,-420],[6.2,-420],[6.5,-390]]);
  let sp:Pt=pos[0],sq=0;
  if(tt>=1.96&&tt<3.6)sp=[lerp(pos[0][0],pos[2][0],toG),lerp(pos[0][1],pos[2][1],toG)];
  else if(tt>=3.6&&tt<4.46)sp=[lerp(pos[2][0],pos[3][0],toTop),lerp(pos[2][1],pos[3][1],toTop)];
  else if(tt>=4.46&&tt<5.38)sp=[30,wedgeY+150];
  else if(tt>=5.38&&tt<6.2){const u=sm(5.38,5.9,tt,easeOut);sp=[lerp(30,pos[0][0],u),lerp(wedgeY+150,pos[0][1],u)];}
  if(tt>=6.2)sq=.06*(1-sm(6.2,6.35,tt));
  // the pink wedge: pushes down with the ball, crumples against the compact block, is left on empty floor, shifts toward the forward lane
  {const shift=30*sm(6.2,6.6,tt),wy=wedgeY;const w:Pt[]=[[-140+shift,wy-260],[140+shift,wy-260],[70+shift,wy+40],[-70+shift,wy+40]];wall(s,w,2,116,{crumple:.5*sm(5.0,5.1,tt)*(1-sm(5.38,5.8,tt))+.2*sm(5.9,6.2,tt),dir:Math.PI/2,strip:20});}
  // the players: ATTACK = every body leans forward toward the top goal; DEFEND = every body crouches back; MOVE = they run round as the web turns; THINK = heads turn
  const attack=sm(3.6,4.0,tt,easeOut)*(1-sm(4.46,4.8,tt)),defend=sm(4.46,4.9,tt,easeOut)*(1-sm(5.38,5.7,tt)),moving=rot>0&&rot<TAU/5,think=sm(6.2,6.6,tt,easeOut);
  pos.forEach((p,i)=>{if(printed[i]<=0)return;const ink=i===0?'paper':G,face:1|-1=p[0]<=0?1:-1,h=300*easeOutBack(printed[i]);
   const pose:Pose=moving?'run':attack>0?'run':defend>0?'crouch':think>0?'scan':'stand';const kk=moving?1:attack>0?attack:defend>0?defend:think>0?1:1;
   figure(s,p[0],p[1]+50,h,pose,{ink,seed:117+i,face,k:kk,look:think>0?(i%2?.8:-.8)*think:0,sight:think,shade:i===0?B:K});});
  if(tt>=6.2){const stubs:{pts:Pt[];w:number;p?:number}[]=[{pts:[sp,[sp[0]-200,sp[1]+40]],w:34,p:sm(6.2,6.5,tt,easeOut)},{pts:[sp,[sp[0]+20,sp[1]-220]],w:34,p:sm(6.35,6.65,tt,easeOut)},{pts:[sp,[sp[0]+60,sp[1]+200]],w:34,p:sm(6.5,6.8,tt,easeOut)}];paint(s,stubs,125,{cov:.9});}
  paintBall(s,sp[0],sp[1],76,126,{sx:1+sq,sy:1-sq,smear:{dir:Math.atan2(-1,0),amount:(toTop>0&&toTop<1)?30:0},rot:toG*3+toTop*3});
  if(moving)dust(s,null,0,60+oy,360,14,{seed:127,size:9,cov:.7});
  flecks(s,0,-420,200,10,128,pulse(tt,5.06,.5));
 },
 aperture(){return aperture(lozenge(0,180,340,110));},
 still:2.6,
};

// ---------------- scene 6 (38.20–46.26): a smaller version? the ball swells through; a boot makes every touch, movement, decision ----------------
const sc6:Scene={
 draw(s,t){
  const tt=twos(t);
  const v=key(t,[[0,-300,0,1.3],[1,60,0,1.35],[2.74,60,0,1.4],[3.84,-300,0,2.2],[4.58,-300,0,2.2],[4.88,-340,80,2.2],[5.03,-340,80,2.2],[5.53,-140,0,2.2],[5.88,-240,-40,2.2],[8.2,-250,-40,2.2]],easeIO,true);
  s.camera(v[0],v[1],v[2],0);
  const swell=sm(2.74,3.74,tt,easeOut),r=lerp(16,260,swell)+20*settle(tt,3.74,{amp:1,freq:3,decay:4}),burst=clamp((r-90)/170);
  planks(s,{h:110,covs:WOOD,gap:4,seed:131,flex:(x,y)=>-6*burst*Math.exp(-((x+300)*(x+300)+y*y)/(400*400)),dark:[{x:-300,y:0,k:pulse(tt,3.3,.4)+pulse(tt,4.58,.3)},{x:-140,y:80,k:pulse(tt,5.53,.3)}]});
  // the doubt: a pink tint under the small rectangle (knocked out wherever the ball covers it)
  const tint=sm(.5,.9,tt,easeOut);if(tint>0)s.fill(P,polyPath(handCut(blob(-300,0,240*tint,160*tint,132,{amp:.14,n:12}),133,20,60),true),.35);
  // the big rectangle slides off; dashed guide lines join the corners then snap; the small rectangle thins, is pushed and buckled by the ball
  const slide=600*sm(2.9,3.5,tt,easeIn);
  courtRect(s,300+slide,0,640,390,14,134,{circleR:48});
  const guides=sm(.2,.7,tt,easeOut),snap=sm(2.9,3.1,tt);
  if(guides>0){const gp=new Path2D();([[[-150,-90],[-20,-195]],[[-150,90],[-20,195]],[[-450,-90],[-20,-195]],[[-450,90],[-20,195]]] as [Pt,Pt][]).forEach(([a,b],i)=>{const bb:Pt=[b[0]+slide,b[1]];const line=partial([a,bb],guides*(1-snap*.4));if(line.length>1)gp.addPath(ribbon(line,8,{seed:135+i,taper:.3,wobble:1,gaps:[[.12,.2],[.32,.4],[.52,.6],[.72,.8]]}));});s.fill(K,gp,.9);}
  const pushOut=30*burst,buck=20*burst;
  courtRect(s,-300,0,300+pushOut*2,180+pushOut*2,14,136,{thin:lerp(1,.7,sm(.7,1.1,tt))+.3*burst,buckle:-buck,circleR:24});
  // the boot: enters, touches the ball (a roll on the toe), sweeps across leaving its track, and the lanes fork; one is chosen
  const enter=sm(4.3,4.58,tt,easeOut),rollT=sm(4.58,4.85,tt,easeIO),sweep=sm(5.03,5.53,tt,easeOut),fork=sm(5.48,5.78,tt,easeOut),choose=sm(6.1,6.6,tt,easeOut);
  const bx0=lerp(-560,-480,enter),tx=lerp(bx0,bx0+500,sweep)+30*settle(tt,5.53,{amp:1,freq:4,decay:5}),ty=lerp(420,120,enter);
  const spx=-300+60*rollT+120*choose-20*settle(tt,4.85,{amp:1,freq:4,decay:4}),spy=-40*choose;
  if(sweep>0)s.fill(K,ribbon([[bx0,120],[tx,120]],90,{seed:137,pressure:.2,taper:0,wobble:2}),.4*(1-.4*sm(6.8,7.4,tt)));
  if(fork>0)paint(s,[{pts:[[-240,0],[-100,-50]],w:30,p:fork},{pts:[[-240,0],[-150,150]],w:30,p:fork}],138,{cov:tt>=6.1?.5:.95});
  if(choose>0)paint(s,[{pts:[[-240,0],[-100,-50]],w:34,p:1}],139);
  const sq=.06*Math.sin(rollT*Math.PI)+.06*settle(tt,6.6,{amp:1,freq:4,decay:5,phase:Math.PI/2});
  paintBall(s,spx,spy,r,142,{sx:1+sq,sy:1-sq,smear:{dir:0,amount:rollT>0&&rollT<1?40:0},rot:rollT*2+choose*2});
  if(sweep>0)boot(s,bx0,120,300,141,{cov:.45});
  if(tt>=4.3)boot(s,tx,ty,300,140,{tilt:-.5*Math.sin(rollT*Math.PI)-.25*(sweep>0&&sweep<1?1:0)});
  if(rollT>0&&rollT<1)speedLines(s,B,spx-r,spy,0,{n:4,seed:143,len:120,width:8});
  flecks(s,-300,0,240,14,144,burst*pulse(tt,3.3,.8));
 },
 aperture(){return aperture(rrect(-340,120,240,110,50).filter((_,i)=>i%4===0));},
 still:4.0,
};

// ---------------- scene 7 (46.26–54.57): the lessons travel; tight again, solved; the walls dissolve and the pitch opens wide ----------------
const FAR:Pt[]=[[-900,-300],[-820,420],[0,-920],[880,-340],[840,400],[0,900]];
const sc7:Scene={
 draw(s,t){
  const tt=twos(t);
  const v=key(t,[[0,0,0,1,0],[1.2,-500,-200,1,.14],[2.2,0,0,1,0],[3.0,0,0,1,0],[3.9,40,-20,1.25,0],[5.14,40,-20,1.25,0],[6.64,20,-10,1.25,0],[6.74,20,5,1.25,0],[7.34,-160,-20,1.25,0],[7.94,160,-20,1.25,0],[8.44,0,0,1.25,0]],easeIO,true);
  s.camera(v[0],v[1],v[2],v[3]);
  const open=sm(5.14,6.34,tt,easeOut),ovs=open>=1?40*settle(tt,6.34,{amp:1,freq:3,decay:4}):0;
  const bandH=lerp(110,260,open);
  const wallsIn=sm(3.0,3.5,tt,easeIn),wallX=lerp(1500,150,wallsIn),wallFade=1-sm(5.14,5.64,tt);
  if(open<1)planks(s,{h:bandH,covs:[WOOD[0]*(1-open),WOOD[1]*(1-open),WOOD[2]*(1-open)],gap:lerp(4,8,open),seed:151,flex:(x,y)=>-6*pulse(tt,3.5)*Math.exp(-((Math.abs(x)-150)**2)/(100*100))});
  if(open>0)planks(s,{h:bandH,covs:[GRASS[0]*open,GRASS[1]*open,GRASS[2]*open],gap:lerp(4,8,open),seed:151,ink:G});
  // far courts with their lessons, reached by lanes; all overtaken by the opening lines
  const fade=1-open;
  if(fade>0){const lanes:{pts:Pt[];w:number;p?:number}[]=FAR.map((f,i)=>({pts:[[Math.sign(f[0])*Math.min(150,Math.abs(f[0]))*(f[1]===0?1:.6),Math.sign(f[1])*Math.min(90,Math.abs(f[1]))*(f[0]===0?1:.6)] as Pt,f],w:40,p:sm(.2+i*.12,.9+i*.12,tt,easeOut)}));paint(s,lanes,152,{cov:fade});
   FAR.forEach((f,i)=>{const arrive=sm(.9+i*.12,1.9+i*.12,tt,easeOut),bul=8*pulse(tt,1.9+i*.12,.5);courtRect(s,f[0],f[1],120+bul,72+bul,8,153+i,{circleR:10});
    if(arrive>0&&arrive<1){const from:Pt=lanes[i].pts[0];paintBall(s,lerp(from[0],f[0],arrive),lerp(from[1],f[1],arrive),20,160+i,{glint:0,rim:false});}
    const les=sm(1.74+i*.15,1.9+i*.15,tt,easeOut);if(les<=0)return;
    if(i===0){figure(s,f[0]-16,f[1]+22,44,'kick',{seed:170,face:1,k:.6,foot:[f[0]+10,f[1]+18]});paintBall(s,f[0]+22,f[1]+8,9,171,{glint:0,rim:false});}
    else if(i===1)paint(s,[{pts:[[f[0]-40,f[1]+10],[f[0],f[1]-14]],w:8},{pts:[[f[0],f[1]-14],[f[0]+40,f[1]+12]],w:8}],172);
    else if(i===2)paint(s,[{pts:[[f[0]-30,f[1]+16],[f[0],f[1]-4]],w:8},{pts:[[f[0],f[1]-4],[f[0]+30,f[1]-20]],w:8},{pts:[[f[0],f[1]-4],[f[0]+34,f[1]+14]],w:8}],173);
    else if(i===3)stopwatch(s,f[0],f[1],22,174,{hand:-.5,lineW:5});
    else if(i===4){figure(s,f[0]-26,f[1]+20,44,'arms',{ink:G,seed:175,face:1,k:.7});figure(s,f[0]+14,f[1]+22,44,'arms',{ink:G,seed:176,face:-1,k:.7});}
    else{s.fill(B,ribbon([[f[0]-36,f[1]],[f[0]+30,f[1]-6]],16,{seed:178,taper:.6,wobble:1}),.6);paintBall(s,f[0]+30,f[1]-6,9,179,{glint:0,rim:false});}});}
  // the small rectangle grows into the whole pitch: its lines slide outward with paint smearing behind them
  const tx=lerp(150,1300,open)+ovs,ty=lerp(90,900,open)+ovs;
  courtRect(s,0,0,tx*2,ty*2,lerp(14,18,open),180,{circleR:lerp(24,260,open),ds:open,goals:open});
  if(open>0&&open<1){speedLines(s,B,-tx,0,0,{n:4,seed:181,len:220,width:8,cov:.6});speedLines(s,B,tx,0,Math.PI,{n:4,seed:182,len:220,width:8,cov:.6});}
  // pressure once more: walls press to the touchlines, a wedge cuts the forward lane; solved sideways through the gap; then the walls dissolve
  if(wallFade>0){const wx=wallX+(1-wallFade)*300;wall(s,[[-wx-800,-1100],[-wx,-1100],[-wx,1100],[-wx-800,1100]],1,183,{cov:wallFade});wall(s,[[wx,-1100],[wx+800,-1100],[wx+800,1100],[wx,1100]],3,184,{cov:wallFade});
   const cut=sm(3.3,3.6,tt,easeOut),sagW=20*sm(4.4,4.8,tt);if(cut>0){const w:Pt[]=[[wx,-60],[wx-140*cut,-40+sagW],[wx-140*cut,10+sagW],[wx,30]];s.knockout(polyPath(w,true));s.fill(P,polyPath(handCut(w,185,8,40),true),wallFade);}}
  dust(s,null,-wallX+30,60,120,10,{seed:186,size:9,cov:.8*pulse(tt,3.5)+.01});
  // you, the ball and the sideways solution; then the calm: you stand at the centre spot with open arms as the walls dissolve and the pitch opens
  const roll=sm(3.6,4.0,tt,easeIO),passS=sm(4.0,4.5,tt,easeOut),g:Pt=[lerp(200,700,open),lerp(-60,-300,open)];
  let sp:Pt=[-20+40*roll,10-20*roll],sq=0;if(passS>0){sp=[lerp(20,g[0],passS),lerp(-10,g[1],passS)];sq=.06*settle(tt,4.5,{amp:1,freq:5,decay:5,phase:Math.PI/2});}
  if(open>0){sp=[lerp(sp[0],60,open),lerp(sp[1],90,open)];}
  if(passS>0)paint(s,[{pts:[[20,-10],g],w:30,p:sm(4.0,4.2,tt)*(1-open)}],188);
  {const yx=lerp(-80,-40,open),yy=lerp(70,110,open),yh=lerp(180,300,open),swing=anticipate(3.8,4.0,tt,{back:.5,hold:.6,e:easeIn});
   if(tt>=3.8&&tt<4.4)kicker(s,yx,yy,yh,swing,[10,10],{seed:189,face:1,shade:B});
   else if(open>0)figure(s,yx,yy,yh,'up',{seed:189,face:1,k:open,shade:B});
   else figure(s,yx,yy,yh,'stand',{seed:189,face:1,k:1,shade:B});}
  if(passS>0)figure(s,g[0],g[1]+lerp(40,60,open),lerp(180,300,open),'arms',{ink:G,seed:190,face:-1,k:.7,shade:K});
  paintBall(s,sp[0],sp[1],lerp(44,90,open),191,{sx:1+sq,sy:1-sq,smear:{dir:Math.atan2(g[1]+10,g[0]-20),amount:passS>0&&passS<1?30:0},glint:1+.3*sm(7.8,8.2,tt),rot:roll*2+passS*3});
  flecks(s,-150,0,120,8,192,pulse(tt,3.5,.5));flecks(s,150,0,120,8,193,pulse(tt,3.5,.5));
 },
 still:6.9,
};

const SCENES=[sc1,sc2,sc3,sc4,sc5,sc6,sc7];
const cue=(start:number,text:string,title:string):Chapter=>({label:title,narration:text,seconds:1,start,cues:[{at:0,words:text}]});

export const story:RisoStory={
 id:'futsl',format:'futsal',title:'Love Futsl',theme:'Smaller court. Bigger game.',ageNote:'For futsal players of every age.',
 spec:{paper:'#f0ece2',inks:{green:'#00a95c',blue:'#0078bf',pink:'#ff48b0',navy:'#22366b'},order:['green','blue','pink','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'track',src:'/stories/films/futsl/narration.mp3',duration:54.56975},
 // captions (the tray reads each cue on media time)
 chapters:[
  cue(0,'Did you know that a smaller court can make the game of football feel bigger?','SMALLER COURT. BIGGER GAME.'),
  cue(3.8,'That’s the secret of futsal.','THAT’S FUTSAL'),
  cue(5.36,'The space is tighter, the ball arrives faster, and every player is closer to the action.','TIGHTER. FASTER. CLOSER.'),
  cue(10.7,'There’s less time to wait.','LESS TIME TO WAIT'),
  cue(12.48,'Less room to hide.','LESS ROOM TO HIDE'),
  cue(13.7,'And more opportunities to make a decision.','MORE DECISIONS'),
  cue(16.56,'On a full-sized pitch, a young player might have several seconds to control the ball and look around.','ON A FULL PITCH'),
  cue(21.1,'In futsal, those seconds become moments.','SECONDS BECOME MOMENTS'),
  cue(23.3,'You learn to scan before the ball arrives,','SCAN EARLY'),
  cue(25.18,'control it in tight spaces,','CONTROL IN TIGHT SPACES'),
  cue(26.84,'combine quickly with teammates,','COMBINE QUICKLY'),
  cue(27.78,'and create solutions when every path seems closed.','FIND SOLUTIONS'),
  cue(31.04,'And because there are fewer players, everyone becomes part of the game.','EVERYONE IS IN IT'),
  cue(34.64,'You attack.','ATTACK'),
  cue(35.5,'You defend.','DEFEND'),
  cue(36.42,'You move.','MOVE'),
  cue(37.24,'You think.','THINK'),
  cue(38.2,'People often see futsal as a smaller version of football.','A SMALLER GAME?'),
  cue(40.94,'But it doesn’t make the game smaller.','BIGGER POSSIBILITIES'),
  cue(42.78,'It makes every touch, movement, and decision more important.','EVERY TOUCH MATTERS'),
  cue(46.26,'The court may be small, but the lessons travel everywhere.','LESSONS TRAVEL EVERYWHERE'),
  cue(49.26,'Because when players learn to solve problems in tight spaces, the full-sized pitch begins to feel wide open.','WIDE OPEN'),
 ],
 // the seven visual chapters (media seconds): scenes, passages, registration seed and headlines run on these (ENGINE.md §10);
 // a cue with headline '' ends a headline early (TIGHTER leaves at 10.70, SCAN EARLY at 25.18)
 visualChapters:[
  {start:0,label:'The small court'},
  {start:5.36,label:'Tighter',headline:'Tighter',cues:[{at:0,words:'The space is tighter',headline:'Tighter'},{at:5.34,words:'less time',headline:''}]},
  {start:16.56,label:'The full pitch'},
  {start:23.3,label:'Scan early',headline:'Scan early',cues:[{at:0,words:'scan before the ball arrives',headline:'Scan early'},{at:1.88,words:'control it',headline:''}]},
  {start:31.04,label:'Everyone'},
  {start:38.2,label:'Every touch',headline:{text:'Every touch',at:4.58}},
  {start:46.26,label:'Wide open',headline:{text:'Wide open',at:5.14}},
 ],
 draw(f){const v=trackChapters(story,f);playChapters(v.story,v.frame,SCENES);},
 /** Touch: a fresh paint stroke — a 200 u blue roller stroke with a navy drag edge at the point, a gloss glint, two drips running off it,
  * paint flecks spray and settle, the plank squeaks (a navy tone). Reduced motion: the static stroke. */
 touch(s,x,y,age,seed){
  const a=(hash(seed,7)-.5)*.6,ca=Math.cos(a),sa=Math.sin(a),stroke=(L:number)=>rotPts([[-L/2,-26],[L/2,-26],[L/2,26],[-L/2,26]],a).map(p=>[p[0]+x,p[1]+y] as Pt);
  const drips=(L:number,d:number)=>{const p=new Path2D();for(const u of[-.25,.3]){const px=x+u*L*ca,py=y+u*L*sa+26;p.addPath(ribbon([[px,py],[px+4,py+d]],14,{seed:seed+3,taper:.5,wobble:.6}));}return p;};
  if(age<=0){s.fill(B,polyPath(stroke(200),true),.95);s.fill(B,drips(200,40),.95);s.knockout(circlePath(x-40,y-10,7));return;}
  const g=easeOut(clamp(age/.18)),fade=1-clamp((age-.45)/.35);
  if(fade>.05){s.tone(K,rectPath(x-160,y-60,320,120),.32*Math.max(0,1-age*4));const pts=stroke(200*g);s.fill(B,polyPath(pts,true),.95*Math.max(.85,fade));s.fill(K,ribbon(offsetPts([pts[0],pts[1]],-8),12,{seed:seed+1,taper:.2,wobble:1}),.5*fade);
   const d=60*easeOut(clamp((age-.15)/.5));if(d>2)s.fill(B,drips(200*g,d),.95*Math.max(.85,fade));s.knockout(circlePath(x-40*g,y-10,7*g));}
  const sc=easeOut(clamp(age/.5));flecks(s,x,y,110,8,seed,sc*(1-clamp((age-.5)/.3)));
 },
};
