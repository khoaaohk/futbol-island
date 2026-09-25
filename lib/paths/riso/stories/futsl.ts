/** Love Futsal — riso, TRACK mode (one narration file, 54.57 s). Rework (21 Sep 2026): ONE overhead world, clean, big, few things per frame.
 * The one idea — a SMALLER COURT makes the game feel BIGGER — is shown as a picture: the small court chalked in a corner of the big pitch
 * (S1), the split of seconds vs moments (S3), the small court at the centre of the pitch growing ring by ring (S6), and the court's lines
 * sliding outward to become the pitch (S7).
 * Palette dominance: the futsal court floor = cream paper with a faint pink halftone (.2) and BLUE court lines; the full-size pitch = green
 * with mow stripes and paper lines; PINK is only pressure (torn walls, defender figures); GREEN figures = teammates; you = paper + navy;
 * the ball = a paper sphere with navy pentagon panels, sized to the figures.
 * The 22 timeline cues are the caption chapters; seven VISUAL chapters (`visualChapters`) drive scenes, passages, registration seed and
 * headlines through `trackChapters` (ENGINE.md §10). Scenes read only their local t; drawn objects on twos, cameras on ones; all seeded. */
import type {Sheet} from '../sheet';
import {type RisoStory,type Scene,type Chapter,playChapters,trackChapters} from '../story';
import {aperture,apertureDisc} from '../passage';
import {twos,sm,key,anticipate,settle,smearPose,pressPts,clamp,lerp,rng,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,circlePath,rectPath,arc,easeOut,easeIn,easeIO,easeOutBack,TAU,type Pt} from '../motion';
import {dust,speedLines,handCut,goalFrame,ripple,crescent,tornRect} from '../shapes';

const K='navy',P='pink',B='blue',G='green';
const COURT_W=380,COURT_H=760,PITCH_W=1300,PITCH_H=2000;// long axis = y (portrait, mobile-first)
const pulse=(t:number,t0:number,len=1)=>t<t0?0:Math.min(1,(t-t0)*10)*Math.exp(-(t-t0)*2.4/len);
const lozenge=(x:number,y:number,w:number,h:number,rot=0):Pt[]=>rotPts([[-w/2,0],[-w*.3,-h/2],[w*.3,-h/2],[w/2,0],[w*.3,h/2],[-w*.3,h/2]],rot).map(p=>[p[0]+x,p[1]+y] as Pt);
const L2=(a:Pt,b:Pt,u:number):Pt=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)];
/** Landscape safe regions (desktop, short landscape) see the tall court a little wider so its ends are not lost above the header. */
const land=(s:Sheet)=>s.safe.w>s.safe.h?.82:1;
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
 if(sight>0){const d=face*(look>=0?1:-1),sx=headC[0]+d*R*.6,wedge=polyPath([[headC[0],headC[1]],[sx+d*h*.55,headC[1]-h*.22],[sx+d*h*.55,headC[1]+h*.12]],true);s.knockout(wedge,.55*sight);}
 if(ink==='paper'){if(knock)s.knockout(body,cov);s.fill(line,limbs);s.fill(line,outline);}
 else{const all=new Path2D();all.addPath(body);all.addPath(limbs);if(knock)s.knockout(all);s.fill(ink,all,cov);s.fill(line,outline,.9);}
 if(shade){const sh=new Path2D();sh.addPath(crescent(headC[0],headC[1],R*.98,[-.35*face,-.4]));sh.addPath(polyPath([corners[0],[lerp(corners[1][0],corners[0][0],.5),lerp(corners[1][1],corners[0][1],.5)],[lerp(corners[2][0],corners[3][0],.5),lerp(corners[2][1],corners[3][1],.5)],corners[3]],true));s.tone(shade,sh,.45);}
}
/** A kicking figure: k>0 blends the kick pose with the front foot at `foot` (anticipation: negative k winds the foot back). */
function kicker(s:Sheet,x:number,y:number,h:number,swing:number,target:Pt,o:FigOpts={}){const k=clamp(swing);figure(s,x,y,h,'kick',{...o,k:k+.15,foot:[lerp(x+(o.face??1)*h*.12,target[0],k)+(swing<0?swing*h*.25*(o.face??1):0),lerp(y,target[1],k)]});}
/** The head centre of a standing figure at ground point (x,y) with height h (for camera targets and rings). */
const headOf=(x:number,y:number,h:number):Pt=>[x,y-h*.3-h*.38-h*.16*1.05];
/** Eleven tiny paper players in one knockout + one navy line (S1's far-apart team): head, torso, legs, arms — 5 ops for all. */
function tinyFigures(s:Sheet,pts:Pt[],h:number,seed:number){
 const body=new Path2D(),line=new Path2D();
 pts.forEach(([x,y],i)=>{const f=i%2?1:-1,R=h*.16,tw=h*.3,th=h*.38,hipY=y-h*.3,top=hipY-th;
  const tp=handCut([[x-tw/2,hipY],[x+tw/2,hipY],[x+tw/2,top],[x-tw/2,top]],seed+i,h*.02,h*.12),head=blob(x,top-R*1.05,R,R*.96,seed+i+2,{amp:.05,n:20});
  body.addPath(polyPath(tp,true));body.addPath(polyPath(head,true));
  const limbs=[ribbon([[x+tw*.18,hipY],[x+h*.12*f,y]],h*.08,{seed:seed+i+3,taper:.25,wobble:1}),ribbon([[x-tw*.18,hipY],[x-h*.1*f,y]],h*.08,{seed:seed+i+4,taper:.25,wobble:1}),
   ribbon([[x+tw*.42*f,top+R*.25],[x+(tw*.42+h*.2)*f,top+R*.25+h*.27]],h*.062,{seed:seed+i+5,taper:.35,wobble:1}),ribbon([[x-tw*.42*f,top+R*.25],[x-(tw*.42+h*.2)*f,top+R*.25+h*.27]],h*.062,{seed:seed+i+6,taper:.35,wobble:1})];
  for(const l of limbs){body.addPath(l);line.addPath(l);}
  line.addPath(ribbon(tp,Math.max(3,h*.025),{seed:seed+i+7,close:true,pressure:.6,wobble:1.2}));line.addPath(ribbon(head,Math.max(3,h*.025),{seed:seed+i+8,close:true,pressure:.6,wobble:1}));});
 s.knockout(body,.92);s.fill(K,line,.9);
}

// ---------------- the world: pitch, court floor, court paint, ball, clock, walls, lanes, rings ----------------
/** The full-size pitch: whole-frame green with mottle, mow stripes along the long axis, paper lines (perimeter, halfway, centre circle,
 * penalty boxes). `lines` = paper line coverage (0 = none); `field` = draw the green (false when the frame already has it). */
function pitch(s:Sheet,x:number,y:number,w:number,h:number,seed:number,o:{lines?:number;boxes?:boolean;field?:boolean;lw?:number;stripes?:boolean}={}){
 const{lines=.9,boxes=true,field=true,lw=14,stripes=true}=o;
 if(field){s.field(G,1,.6);
  if(stripes){const p=new Path2D();for(let j=-16;j<=16;j+=2){const y0=y+j*150+30*hash(j,seed);p.addPath(polyPath([[-5000,y0],[5000,y0+12],[5000,y0+150],[-5000,y0+140]],true));}s.tone(K,p,.1);}}
 if(lines<=.03)return;
 const p=new Path2D(),rr=(pts:Pt[],close=false,wd=lw,sd=0)=>p.addPath(ribbon(pts,wd,{seed:seed+sd,pressure:.3,taper:0,wobble:1.6,step:40,close}));
 rr([[x-w/2,y-h/2],[x+w/2,y-h/2],[x+w/2,y+h/2],[x-w/2,y+h/2]],true,lw,1);rr([[x-w/2,y],[x+w/2,y]],false,lw,2);
 const cr=w*.14,c=blob(x,y,cr,cr,seed+3,{amp:.02,n:36});rr(c,true,lw,3);
 if(boxes){const bd=h*.157,bw=w*.59,gd=h*.052,gw=w*.27;for(const side of[-1,1]){const gy=y+side*h/2;rr([[x-bw/2,gy],[x-bw/2,gy-side*bd],[x+bw/2,gy-side*bd],[x+bw/2,gy]],false,lw,4+side);rr([[x-gw/2,gy],[x-gw/2,gy-side*gd],[x+gw/2,gy-side*gd],[x+gw/2,gy]],false,lw*.9,7+side);}}
 s.knockout(p,lines);
}
/** The futsal court floor as a cream sheet: a torn-edged paper knockout with a faint pink halftone (.2) and two lighter worn patches. */
function courtFloor(s:Sheet,x:number,y:number,w:number,h:number,seed:number,o:{cov?:number;tint?:number}={}){
 const{cov=1,tint=.1}=o,path=tornRect(x-w/2,y-h/2,w,h,seed,16);
 s.knockout(path,cov);if(tint>.03)s.tone(P,path,tint*cov);
 s.knockout(polyPath(blob(x-w*.2,y+h*.18,w*.3,h*.14,seed+1,{amp:.12,n:14}),true),.3*cov);s.knockout(polyPath(blob(x+w*.22,y-h*.2,w*.26,h*.12,seed+2,{amp:.12,n:14}),true),.3*cov);
}
/** The whole frame as court floor (we are inside the court): pink halftone .2 with mottle so the sheet breathes. */
const floorFill=(s:Sheet)=>s.field(P,.1,.6);
/** Painted lines: blue bands with a faint navy roller-drag stripe along one edge. Each line may draw on with its own progress. Two ops for all. */
function paint(s:Sheet,lines:{pts:Pt[];w:number;p?:number;close?:boolean}[],seed:number,o:{cov?:number;drag?:number;knock?:boolean}={}){
 const{cov=1,drag=.3,knock=false}=o,blue=new Path2D(),navy=new Path2D();let any=false;
 lines.forEach((l,i)=>{const p=l.p??1;if(p<=0)return;const line=p>=1?l.pts:partial(smoothPts(l.pts,l.close&&p>=1,8),p);if(line.length<2)return;any=true;
  blue.addPath(ribbon(line,l.w,{seed:seed+i,pressure:.25,taper:.1,wobble:1.5,step:10,close:l.close&&p>=1}));if(drag>0)navy.addPath(ribbon(offsetPts(line,l.w*.34),l.w*.28,{seed:seed+i+50,pressure:.2,taper:.2,wobble:1,step:10,close:l.close&&p>=1}));});
 if(!any)return;if(knock)s.knockout(blue);s.fill(B,blue,cov);if(drag>0)s.fill(K,navy,cov*drag);
}
/** The court's blue paint: perimeter (short sides may buckle inward), halfway line, centre circle, two D's. p draws the perimeter on, inner the rest. */
function courtLines(s:Sheet,x:number,y:number,w:number,h:number,seed:number,o:{p?:number;inner?:number;lw?:number;cov?:number;buckle?:number;ds?:boolean;drag?:number;circle?:boolean;knock?:boolean}={}){
 const{p=1,inner=p,lw=16,cov=1,buckle=0,ds=true,drag=.3,circle=true,knock=false}=o;
 const per:Pt[]=[[x-w/2,y-h/2],[x+w/2,y-h/2],[x+w/2,y-h*.25],[x+w/2-buckle,y],[x+w/2,y+h*.25],[x+w/2,y+h/2],[x-w/2,y+h/2],[x-w/2,y+h*.25],[x-w/2+buckle,y],[x-w/2,y-h*.25],[x-w/2,y-h/2]];
 const cr=w*.185,c=blob(x,y,cr,cr,seed,{amp:.02,n:32});
 const lines:{pts:Pt[];w:number;p?:number;close?:boolean}[]=[{pts:per,w:lw,p},{pts:[[x-w/2,y],[x+w/2,y]],w:lw,p:inner}];
 if(circle)lines.push({pts:c.concat([c[0]]),w:lw*.85,p:inner,close:true});
 if(ds){const r=w*.28;for(const side of[-1,1]){const d:Pt[]=[];for(let i=0;i<=14;i++){const ang=(i/14)*Math.PI;d.push([x+Math.cos(ang)*r,y+side*(h/2-r*Math.sin(ang))]);}lines.push({pts:d,w:lw*.85,p:inner});}}
 paint(s,lines,seed,{cov,drag,knock});
}
/** The ball of this story: a paper sphere with NAVY pentagon panels (a real football), a blue shade crescent, navy seams and rim, one glint.
 * smear stretches the whole ball for a fast pass; sx/sy squash it on a landing. Tiny balls (r < 16) print as a paper dot with a navy rim. */
function ball(s:Sheet,x:number,y:number,r:number,seed:number,o:{sx?:number;sy?:number;smear?:{dir:number;amount:number};rot?:number;glint?:number;cov?:number}={}){
 const{sx=1,sy=1,smear,rot=0,glint=1,cov=1}=o;let pts=blob(x,y,r*sx,r*sy,seed,{amp:.03,n:40});if(smear&&smear.amount>0)pts=smearPose(pts,smear.dir,smear.amount,[x,y]);
 const disc=polyPath(pts,true);s.knockout(disc,cov);
 if(r<16){s.fill(K,ribbon(pts,Math.max(2.5,r*.12),{seed:seed+1,close:true,pressure:.5,wobble:r*.02}),.9*cov);return;}
 s.save();s.clip(disc);
 s.tone(B,crescent(x,y,r*1.02*Math.max(sx,sy),[-.4,-.45]),.32);
 const pan=new Path2D(),pent=(cx:number,cy:number,pr:number,a0:number)=>{const q:Pt[]=[];for(let i=0;i<5;i++){const a=a0+i/5*TAU;q.push([cx+Math.cos(a)*pr*sx,cy+Math.sin(a)*pr*sy]);}return polyPath(smoothPts(q,true,6,2.5),true);};
 pan.addPath(pent(x,y,r*.32,rot-Math.PI/2));
 for(let i=0;i<5;i++){const a=rot-Math.PI/2+Math.PI/5+i/5*TAU;pan.addPath(pent(x+Math.cos(a)*r*.86*sx,y+Math.sin(a)*r*.86*sy,r*.29,a+Math.PI));const b=rot-Math.PI/2+i/5*TAU;pan.addPath(ribbon([[x+Math.cos(b)*r*.32*sx,y+Math.sin(b)*r*.32*sy],[x+Math.cos(b)*r*.64*sx,y+Math.sin(b)*r*.64*sy]],Math.max(2.5,r*.05),{seed:seed+4+i,taper:.3,wobble:1}));}
 s.fill(K,pan,.92*cov);
 s.restore();
 s.fill(K,ribbon(pts,Math.max(3,r*.07),{seed:seed+1,close:true,pressure:.5,wobble:r*.02}),.9*cov);
 if(glint>0&&r>=30)s.knockout(polyPath(blob(x-r*.4*sx,y-r*.42*sy,r*.13*glint,r*.09*glint,seed+2,{amp:.05,n:14}),true));
}
/** The clock: a paper face, a top button, a blue paint ring, twelve navy ticks, a navy hand with blur ghosts on a fast sweep. g scales it in. */
function clock(s:Sheet,x:number,y:number,r0:number,seed:number,o:{hand?:number;blur?:number;cov?:number;g?:number}={}){
 const{hand=-Math.PI/2,blur=0,cov=1,g=1}=o;if(g<=.02||cov<=.03)return;const r=r0*g;
 const face=polyPath(blob(x,y,r*.96,r*.96,seed,{amp:.02,n:40}),true),btn=polyPath([[x-r*.15,y-r*1.22],[x+r*.15,y-r*1.22],[x+r*.11,y-r*.98],[x-r*.11,y-r*.98]],true);
 const both=new Path2D();both.addPath(face);both.addPath(btn);s.knockout(both,cov);s.fill(K,btn,.9*cov);
 const c=blob(x,y,r,r,seed+1,{amp:.02,n:40});paint(s,[{pts:c.concat([c[0]]),w:Math.max(6,r*.12),close:true}],seed+2,{cov});
 const ticks=new Path2D();for(let k=0;k<12;k++){const a=k/12*TAU,l=k%3===0?r*.2:r*.1;ticks.moveTo(x+Math.cos(a)*r*.8,y+Math.sin(a)*r*.8);ticks.lineTo(x+Math.cos(a)*(r*.8-l),y+Math.sin(a)*(r*.8-l));}s.stroke(K,ticks,Math.max(2,r*.035),.9*cov);
 s.fill(K,ribbon([[x,y],[x+Math.cos(hand)*r*.74,y+Math.sin(hand)*r*.74]],Math.max(5,r*.1),{seed:seed+3,pressure:.4,taper:.3,wobble:1}),cov);
 if(blur>0){const gh=new Path2D();for(let k=1;k<=3;k++){const a=hand-k*.3*blur;gh.addPath(ribbon([[x,y],[x+Math.cos(a)*r*.68,y+Math.sin(a)*r*.68]],Math.max(4,r*.08),{seed:seed+4+k,taper:.4,wobble:1}));}s.fill(K,gh,.32*cov);}
 s.fill(K,circlePath(x,y,Math.max(4,r*.07)),cov);
}
/** A pink wall / block: torn edges; the floor is knocked out beneath except a strip along the inner edge, which prints pink × pink-screen
 * as the wall's shadow (its weight on the floor). crumple pushes the face at `dir` in; cov fades it (a halftone dissolve). */
function wall(s:Sheet,corners:Pt[],inner:number,seed:number,o:{cov?:number;crumple?:number;dir?:number;strip?:number}={}){
 const{cov=1,crumple=0,dir=0,strip=26}=o;if(cov<=.05)return;
 let pts=handCut(corners,seed,strip*.9,90);if(crumple>0){const c:Pt=[corners.reduce((a,p)=>a+p[0],0)/corners.length,corners.reduce((a,p)=>a+p[1],0)/corners.length];pts=pressPts(pts,dir,crumple,120,c);}
 const a=corners[inner],b=corners[(inner+1)%corners.length],nx=-(b[1]-a[1]),ny=b[0]-a[0],l=Math.hypot(nx,ny)||1;
 const knock=corners.map((p,i)=>i===inner||i===(inner+1)%corners.length?[p[0]+nx/l*strip,p[1]+ny/l*strip] as Pt:p);
 s.knockout(polyPath(knock,true));s.fill(P,polyPath(pts,true),cov);
}
/** A pass option: a light-blue screened lane a→b (tip leading) on the cream floor; lit>0 prints solid court paint over it (the chosen lane). */
function lane(s:Sheet,a:Pt,b:Pt,w:number,seed:number,o:{p?:number;lit?:number;cov?:number}={}){
 const{p=1,lit=0,cov=.32}=o;if(p<=0)return;const pts=p>=1?[a,b]:partial(smoothPts([a,b],false,8),p);if(pts.length<2)return;
 s.fill(B,ribbon(pts,w,{seed,pressure:.3,taper:.2,wobble:1.4,step:10}),cov);
 if(lit>0)paint(s,[{pts,w:w*.9}],seed+7,{cov:lit});
}
/** A ring in the court: a blue-screened annulus (knocked out beneath) with a solid blue contour inside — a touch's ripple of court paint that stays. g scales it in. */
function ringMark(s:Sheet,x:number,y:number,rx:number,ry:number,w:number,seed:number,o:{g?:number;cov?:number}={}){
 const{g=1,cov=.9}=o;if(g<=.02)return;const n=Math.max(32,Math.round(rx/8)),band=ribbon(blob(x,y,rx*g,ry*g,seed,{amp:.03,n}),w,{seed:seed+1,close:true,pressure:.3,taper:0,wobble:1.5,step:10});
 s.knockout(band,cov);s.fill(B,band,.45*cov);
 s.fill(B,ribbon(blob(x,y,(rx-w*.5)*g,(ry-w*.5)*g,seed,{amp:.03,n}),Math.max(4,w*.2),{seed:seed+2,close:true,pressure:.4,wobble:1.2,step:10}),.95*cov);
}
/** A blue sight wedge from a head toward dir (a scan on the cream floor, where a paper wedge would vanish). */
function sightWedge(s:Sheet,x:number,y:number,dir:number,h:number,g:number){if(g<=.02||Math.abs(dir)<.05)return;const d=dir>=0?1:-1,L=h*.6*g;s.fill(B,polyPath([[x+d*h*.1,y],[x+d*L,y-h*.24],[x+d*L,y+h*.14]],true),.32);}
/** A paper spotlight ellipse under a figure (the lit one). */
const spot=(s:Sheet,x:number,y:number,r:number,seed:number,g:number)=>{if(g>.02)s.tone(B,polyPath(blob(x,y-r*.55,r*.8*g,r*g,seed,{amp:.05,n:28}),true),.32);};
/** Paint flecks and floor dust that spray from a point (touch reaction). */
function flecks(s:Sheet,x:number,y:number,r:number,n:number,seed:number,scatter:number){if(scatter<=0)return;const rr=rng(seed),bp=new Path2D(),pp=new Path2D(),dp=new Path2D();
 for(let i=0;i<n;i++){const a=rr()*TAU,d=(20+rr()*r)*scatter,sz=8+rr()*14,px=x+Math.cos(a)*d,py=y+Math.sin(a)*d,q=rotPts([[-sz*.5,-sz*.3],[sz*.5,-sz*.4],[sz*.4,sz*.4],[-sz*.4,sz*.3]],rr()*TAU),p=i%3===0?pp:i%3===1?bp:dp;p.moveTo(px+q[0][0],py+q[0][1]);for(let k=1;k<4;k++)p.lineTo(px+q[k][0],py+q[k][1]);p.closePath();}
 s.fill(B,bp);s.fill(P,pp);s.knockout(dp,.9);}
/** A ball flight helper: position between a and b with a squash settle on arrival; returns [x,y,squash,smear]. */
function flight(tt:number,t0:number,dur:number,a:Pt,b:Pt,o:{lift?:number;smear?:number}={}):[number,number,number,number]{
 const{lift=0,smear=30}=o,u=sm(t0,t0+dur,tt,easeOut),p=lift?arc(a,b,u,lift):L2(a,b,u);
 return[p[0],p[1],tt>=t0+dur?.06*settle(tt,t0+dur,{amp:1,freq:5,decay:5,phase:Math.PI/2}):0,u>0&&u<1?smear:0];}

// ---------------- scene 1 (0–5.36): the big pitch from above; dive to the small court in a corner; it pops; a bigger outline grows out of it ----------------
const COURT1:Pt=[430,560];
const FIG11:Pt[]=[[-420,-820],[0,-820],[420,-820],[-520,-420],[-120,-420],[300,-420],[0,0],[-480,420],[-60,420],[440,60],[100,860]];
const sc1:Scene={
 draw(s,t){
  const tt=twos(t),[cx,cy]=COURT1;
  const v=key(t,[[0,0,0,.37],[.9,0,0,.39],[2.6,cx,cy,1.15],[3.85,cx,cy,1.15],[4.25,cx,cy+12,1.2],[5.5,cx,cy+12,1.2]],easeIO,true);
  s.camera(v[0],v[1],v[2],0);
  pitch(s,0,0,PITCH_W,PITCH_H,11,{boxes:false});
  tinyFigures(s,FIG11,170,12);
  // the small court in the corner: a cream sheet; its blue lines roll on as we arrive ("a smaller court"); it pops on "bigger"
  const pop=tt>=3.05?.08*settle(tt,3.05,{amp:1,freq:4,decay:5,phase:Math.PI/2}):0;
  s.save();s.translate(cx,cy);s.scale(1+pop,1-pop);s.translate(-cx,-cy);
  courtFloor(s,cx,cy,COURT_W+100,COURT_H+140,13);
  courtLines(s,cx,cy,COURT_W,COURT_H,14,{p:sm(1.6,2.1,tt,easeOut),inner:sm(2.1,2.4,tt,easeOut)});
  s.restore();
  // "bigger": a big court outline grows out of the small one and settles back into it (the ending, anticipated)
  const grow=key(tt,[[3.1,0,easeOutBack],[3.55,1],[3.75,1],[4.25,0]]);
  if(grow>.02){const sc=1+.7*grow;courtLines(s,cx,cy,COURT_W*sc,COURT_H*sc,15,{lw:18,cov:.95,drag:0,ds:false,circle:false,knock:true});}
  if(tt>=1.6&&tt<2.3)flecks(s,cx-COURT_W/2,cy-COURT_H/2,50,6,16,pulse(tt,1.6,.4));
  // "That's the secret of futsal": the ball drops onto the centre spot and bounces; a paint ripple spreads
  const land=sm(3.85,4.25,tt,easeIn),hit=tt>=4.25;
  if(tt>=3.85){const by=lerp(cy-900,cy,land),sq=hit?.08*settle(tt,4.25,{amp:1,freq:4,decay:5,phase:Math.PI/2}):0;
   if(hit)ripple(s,B,cx,cy,90,1,{width:7,seed:17,progress:sm(4.25,4.65,tt),cov:.7});
   ball(s,cx,by,60,18,{sx:1+sq,sy:1-sq,rot:land*3});}
 },
 aperture(){return apertureDisc(COURT1[0],COURT1[1],50,12);},
 still:4.6,
};

// ---------------- scene 2 (5.36–16.56): inside the court — walls squeeze, the ring closes, faster passes, the clock, hiding fails, three lanes ----------------
const ringPos=(i:number,k:number):Pt=>{const a=(-90+40*i)*Math.PI/180;return[Math.cos(a)*230*k,Math.sin(a)*300*k];};
const YOU2:Pt=[-60,60],YOU2B:Pt=[40,-150];
const sc2:Scene={
 draw(s,t){
  const tt=twos(t);
  const v=key(t,[[0,0,0,1.55],[1.1,0,20,1.57],[5.2,0,20,1.57],[5.9,0,-10,1.75],[7.1,0,-10,1.75],[7.7,140,-80,1.75],[8.3,140,-80,1.75],[9.0,-60,-40,1.75],[11.3,-60,-40,1.75]],easeIO,true);
  s.camera(v[0]+10*pulse(t,1.1),v[1],v[2]*land(s),0);
  floorFill(s);
  // the walls: heavy push from off-frame to the court's touchlines; the touchlines buckle inward; dust at each wall's foot
  const push=key(tt,[[0,1500],[.2,1540,easeIn],[1.1,262,easeOut]])+10*settle(tt,1.1,{amp:1,freq:6,decay:6}),buckle=26*sm(.95,1.15,tt,easeOut)+6*settle(tt,1.15,{amp:1,freq:5,decay:5});
  const clockCov=key(tt,[[5.34,0],[5.5,1],[6.9,1],[7.4,0]]);
  courtLines(s,0,0,COURT_W,COURT_H,21,{buckle,circle:clockCov<=0});
  wall(s,[[-push-250,-1300],[-push,-1300],[-push,1300],[-push-250,1300]],1,22);wall(s,[[push,-1300],[push+250,-1300],[push+250,1300],[push,1300]],3,23);
  dust(s,null,-push+40,160,140,10,{seed:24,size:10,cov:.8*pulse(tt,1.1)+.01});dust(s,null,push-40,-120,140,10,{seed:25,size:10,cov:.8*pulse(tt,1.1)+.01});
  // the ring: four green + five pink close from far to a tight ring round the ball ("closer to the action")
  const rk=key(tt,[[1.4,1.9],[2.8,1,easeOut]])+.03*settle(tt,2.8,{amp:1,freq:4,decay:5});
  const hide=sm(7.12,7.52,tt,easeOut),around=sm(7.3,7.8,tt,easeOut);
  const pos=(i:number):Pt=>{const p=ringPos(i,rk);if(i===4)return L2(p,[210,-10],hide);if(i===3)return L2(p,[236,-120],around);return p;};
  const you:Pt=L2(YOU2,YOU2B,sm(2.0,2.6,tt,easeOut));
  // passes: you → top (0.55 s) → right (0.4 s) → bottom-right (0.28 s) → bottom-left (0.25 s); then the chosen lane back to you (0.5 s)
  const PASS:[number,number,number,number][]=[[1.6,.55,-1,0],[2.6,.4,0,2],[3.4,.28,2,4],[4.1,.25,4,6],[9.64,.5,6,-1]];
  const at=(i:number):Pt=>{const p=i<0?you:pos(i);return[p[0],p[1]+14];};
  let sp:Pt=at(-1),sq=0,smear=0,dir=0,holder=-1;
  for(const [t0,dur,a,b] of PASS){if(tt<t0)break;const u=sm(t0,t0+dur,tt,easeOut);sp=L2(at(a),at(b),u);dir=Math.atan2(at(b)[1]-at(a)[1],at(b)[0]-at(a)[0]);smear=u<1?40:0;sq=tt>=t0+dur?.06*settle(tt,t0+dur,{amp:1,freq:5,decay:5,phase:Math.PI/2}):0;holder=u>=1?b:-2;}
  // "less time to wait": the centre circle becomes a clock; the hand jerks back then sweeps a full turn in 0.45 s
  const sweep=sm(5.5,5.95,tt,easeIn),hand=-Math.PI/2-.17*sm(5.34,5.5,tt)+TAU*sweep+(tt>=5.95?.35*settle(tt,5.95,{amp:1,freq:4,decay:5}):0);
  clock(s,0,0,110,26,{hand,blur:sweep>0&&sweep<1?1:0,cov:clockCov,g:easeOutBack(sm(5.34,5.56,tt))});
  // "more decisions": three paper lanes fan from the carrier; the one to you lights blue and the pass goes
  if(tt>=8.34){const from=at(6),ends:Pt[]=[[-236,-60],at(-1),[-40,360]];ends.forEach((e,i)=>lane(s,from,e,36,27+i,{p:sm(8.34+i*.12,8.64+i*.12,tt,easeOut),lit:i===1?sm(9.4,9.64,tt):0}));}
  // figures: the ring (green teammates, pink defenders), the hider and the one who steps round, you inside
  const kickAt=(i:number)=>PASS.some(([t0,,a])=>a===i&&tt>=t0-.15&&tt<t0+.25);
  for(const i of [4,2,0,1,3,5,6,7,8]){const p=pos(i),green=i%2===0&&i<=6,face:1|-1=i===3?-1:p[0]<=0?1:-1;
   const pose:Pose=kickAt(i)?'kick':rk>1.04?'run':green?'arms':'step';
   figure(s,p[0],p[1],170,pose,{ink:green?G:P,seed:30+i,face,k:rk>1.04?1:.7,shade:K});}
  {const swing=anticipate(1.35,1.6,tt,{back:.5,hold:.6,e:easeIn});
   if(tt>=1.35&&tt<2.0)kicker(s,you[0],you[1],190,swing,at(0),{seed:40,face:1,shade:B});
   else figure(s,you[0],you[1],190,tt>=2.0&&tt<2.6?'run':holder===-1&&tt>=10.14?'arms':'stand',{seed:40,face:1,k:.8,shade:B});}
  ball(s,sp[0],sp[1],44,41,{sx:1+sq,sy:1-sq,smear:{dir,amount:smear},rot:tt*1.5});
  if(smear>0)speedLines(s,K,sp[0],sp[1],dir,{n:4,seed:42,len:90,width:5,cov:.7});
 },
 aperture(t){const tt=twos(t),a=ringPos(6,1),b=L2(YOU2,YOU2B,sm(2.0,2.6,tt,easeOut));const m:Pt=[(a[0]+b[0])/2,(a[1]+b[1])/2+14];return aperture(lozenge(m[0],m[1],150,40,Math.atan2(b[1]-a[1],b[0]-a[0])));},
 still:3.0,
};

// ---------------- scene 3 (16.56–23.30): split — the big pitch (seconds) on the left, the court (a moment) pushes in from the right ----------------
const sc3:Scene={
 draw(s,t){
  const tt=twos(t);
  const v=key(t,[[0,-120,-40,1],[4.3,-160,-60,1],[4.54,-160,-60,1],[4.9,0,-60,1.02],[6.8,20,-60,1.02]],easeIO,true);
  s.camera(v[0],v[1]+8*pulse(t,4.89),v[2],0);
  pitch(s,-210,200,PITCH_W,PITCH_H,31);
  // left: you alone with the ball; a slow high pass arrives; the clock ticks three times while you look left and right
  const fl=flight(tt,.2,1.1,[-1100,-260],[-244,170],{lift:240,smear:0}),u=sm(.2,1.3,tt,easeOut);
  const ticks=Math.floor(sm(2.0,2.06,tt))+Math.floor(sm(2.8,2.86,tt))+Math.floor(sm(3.6,3.66,tt)),tickS=.09*(settle(tt,2.0,{amp:1,freq:5,decay:6})+settle(tt,2.8,{amp:1,freq:5,decay:6})+settle(tt,3.6,{amp:1,freq:5,decay:6}));
  const lift=10*sm(4.3,4.54,tt)*(1-sm(4.54,4.8,tt));
  clock(s,-210,-330-lift,96,32,{hand:-Math.PI/2+ticks*.7+tickS});
  let lk=0;for(const [a0,d] of [[2.0,-.8],[2.8,.8],[3.6,0]] as [number,number][])lk=lerp(lk,d,sm(a0,a0+.25,tt,easeOut));
  if(u>0&&u<1)s.knockout(polyPath(blob(fl[0],190,60,24,33,{amp:.04}),true),.5);
  {const cushK=tt>=1.3&&tt<1.9?.6*(1-sm(1.3,1.9,tt)):0;
   if(cushK>0)figure(s,-210,150,320,'kick',{seed:34,face:-1,k:cushK,foot:[fl[0]+20,fl[1]+10],shade:B});
   else figure(s,-210,150,320,'scan',{seed:34,face:-1,look:lk,sight:Math.abs(lk),k:1,shade:B});}
  const sq=Math.abs(fl[2]);ball(s,fl[0],fl[1],52,35,{sx:1+sq,sy:1-sq,rot:u*6});
  // right: the court sheet shoves in from the right with the same figure, a fast clock and a pink defender already there
  const push=key(tt,[[4.3,1200],[4.42,1240,easeIn],[4.77,0,easeOut]])+14*settle(tt,4.77,{amp:1,freq:6,decay:6});
  if(push<1150){
   const sheet=polyPath(handCut([[push,-3000],[3000,-3000],[3000,3000],[push,3000]],36,30,140),true);s.knockout(sheet);s.tone(P,sheet,.1);
   courtLines(s,push+230,120,COURT_W,COURT_H,37);
   const snap=sm(4.8,5.02,tt,easeIn),hand2=-Math.PI/2+TAU*snap+(tt>=5.02?.4*settle(tt,5.02,{amp:1,freq:4,decay:5})+.14*Math.floor(((tt-5.02)*4)%2):0);
   clock(s,push+210,-330,96,38,{hand:hand2,blur:snap>0&&snap<1?1:0});
   const press=sm(5.2,5.6,tt,easeIn),dx=lerp(390,345,press),lean=key(tt,[[4.77,.5],[5.1,.9],[5.6,1]]);
   const pr=.05*press*(1-.5*settle(tt,5.6,{amp:1,freq:4,decay:5}));
   s.save();s.translate(push+200,150);s.scale(1+pr,1-pr);s.translate(-push-200,-150);
   figure(s,push+200,150,320,'stand',{seed:39,face:1,k:1,shade:B});s.restore();
   ball(s,push+236,164,52,40,{rot:.5});
   figure(s,push+dx,140,340,'step',{ink:P,seed:41,face:-1,k:lean,shade:K});
   if(push>0&&push<1200)dust(s,null,push-30,0,220,12,{seed:42,size:10,cov:.8});
  }
 },
 aperture(){return apertureDisc(210,-330,70,12);},
 still:5.6,
};

// ---------------- scene 4 (23.30–31.04): four beats — scan, control between two pinks, one-two, the maze with one gap ----------------
const YOU4A:Pt=[0,140],YOU4B:Pt=[120,-60],G4A:Pt=[330,-110],G4B:Pt=[200,-480];
const BLOCKS:[Pt,Pt,number,number][]=[[[-160,-330],[-160,-330],2,51],[[140,-390],[400,-390],2,52],[[-200,-20],[-200,-20],1,53],[[-120,240],[-120,240],0,54],[[260,230],[260,230],0,55],[[330,-80],[330,-80],3,56]];
const sc4:Scene={
 draw(s,t){
  const tt=twos(t);
  const v=key(t,[[0,0,40,1],[.5,0,40,1],[1.4,-40,20,1],[1.9,-40,20,1],[2.4,0,20,1.02],[3.54,0,20,1.03],[4.0,120,-40,1.04],[4.5,120,-40,1.04],[5.2,80,-120,1.04],[6.3,80,-120,1.05],[6.9,140,-210,1.06],[7.8,140,-210,1.07]],easeIO,true);
  s.camera(v[0]+12*sm(1.9,2.4,t)*(1-sm(2.6,3.0,t)),v[1],v[2]*land(s),0);
  floorFill(s);courtLines(s,0,60,COURT_W*2.2,COURT_H*2.2,50,{lw:30});
  const move=sm(3.6,4.0,tt,easeOut),you=L2(YOU4A,YOU4B,move),face:1|-1=tt<3.3?-1:1;
  const gRun=sm(4.3,5.0,tt,easeOut),g=L2(G4A,G4B,gRun);
  // the ball: arrives after the scan, is cushioned, goes to the teammate and back, then threads the gap
  const foot=(p:Pt,f:1|-1):Pt=>[p[0]+f*34,p[1]+20];
  let sp:Pt=[-900,-120],sq=0,smear=0,dir=0;
  const upd=(t0:number,dur:number,a:Pt,b:Pt,lift=0)=>{if(tt<t0)return;const f=flight(tt,t0,dur,a,b,{lift});sp=[f[0],f[1]];sq=f[2];smear=f[3];dir=Math.atan2(b[1]-a[1],b[0]-a[0]);};
  upd(1.1,.75,[-900,-120],foot(YOU4A,-1),60);
  if(tt>=1.85)sp=[foot(YOU4A,-1)[0]-30*sm(1.85,2.2,tt,easeOut),sp[1]];
  upd(3.54,.3,[foot(YOU4A,-1)[0]-30,foot(YOU4A,-1)[1]],foot(G4A,-1));upd(3.95,.3,foot(G4A,-1),foot(YOU4B,1));upd(6.35,.55,foot(YOU4B,1),foot(G4B,-1));
  if(tt>=1.85&&tt<2.3)sq=.08*(1-sm(1.85,2.3,tt));
  // beat 2: two pink figures step in from both sides and lean at you; beat 3 they lean the wrong way; beat 4 they run off as the blocks arrive
  const stepIn=key(tt,[[1.9,760],[2.02,790,easeIn],[2.4,330,easeOut]])+10*settle(tt,2.4,{amp:1,freq:5,decay:5}),wrong=60*sm(3.7,4.0,tt,easeOut),exit=sm(4.4,4.9,tt,easeIn);
  if(exit<1)for(const side of[-1,1]){const x=side*stepIn+wrong+side*900*exit;figure(s,x,150,380,exit>0?'run':'step',{ink:P,seed:56+side,face:side<0?1:-1,k:exit>0?1:.5+.5*sm(2.0,2.4,tt),shade:K});}
  // beat 4: five pink blocks slide in and lock round you; three paper lanes end against them; one block slides aside; the lit lane threads through
  const mazeIn=sm(4.5,5.1,tt,easeIn);
  if(tt>=5.2){const from=foot(YOU4B,1),ends:Pt[]=[[-120,-300],[140,-340],[-100,200]];ends.forEach((e,i)=>lane(s,from,e,44,60+i,{p:sm(5.2+i*.12,5.5+i*.12,tt,easeOut)}));
   lane(s,from,foot(G4B,-1),44,63,{p:sm(6.05,6.3,tt,easeOut),lit:sm(6.2,6.4,tt)});}
  if(mazeIn>0)BLOCKS.forEach(([a,b,inner,seed],i)=>{const u=sm(4.5+i*.07,5.1+i*.07,tt,easeIn),slide=i===1?sm(6.0,6.3,tt,easeOut):0;const c=L2(a,b,slide),from:Pt=[YOU4B[0]+(a[0]-YOU4B[0])*4,YOU4B[1]+(a[1]-YOU4B[1])*4],p=L2(from,c,u);
   wall(s,[[p[0]-150,p[1]-110],[p[0]+150,p[1]-110],[p[0]+150,p[1]+110],[p[0]-150,p[1]+110]],inner,seed,{strip:18,crumple:.3*pulse(tt,5.1+i*.07,.6)});});
  if(tt>=5.1&&tt<5.6)dust(s,null,120,-60,320,16,{seed:65,size:10,cov:.8});
  // the green teammate: waits, returns the one-two first time, then runs beyond the maze
  {const swing=anticipate(3.75,3.95,tt,{back:.5,hold:.6,e:easeIn});
   if(tt>=3.75&&tt<4.3)kicker(s,g[0],g[1],380,swing,foot(G4A,-1),{ink:G,seed:66,face:-1,shade:K});
   else figure(s,g[0],g[1],380,gRun>0&&gRun<1?'run':'arms',{ink:G,seed:66,face:-1,k:gRun>0&&gRun<1?1:.6+.4*sm(3.3,3.54,tt),shade:K});}
  // you: the head turns before the ball arrives (sight wedge), cushion, kick the one-two, move, receive, thread the pass
  {const look=key(tt,[[.2,-.9],[.55,.9],[.9,.9],[1.25,0]]),scan=sm(.15,.3,tt)*(1-sm(1.2,1.4,tt)),cushK=tt>=1.85&&tt<2.5?.6*(1-sm(1.85,2.5,tt)):0;
   const swing=anticipate(3.3,3.54,tt,{back:.5,hold:.6,e:easeIn}),thru=anticipate(6.1,6.35,tt,{back:.5,hold:.6,e:easeIn});
   if(tt>=3.3&&tt<3.9)kicker(s,you[0],you[1],420,swing,foot(G4A,-1),{seed:67,face:1,shade:B});
   else if(tt>=6.1&&tt<6.7)kicker(s,you[0],you[1],420,thru,foot(G4B,-1),{seed:67,face:1,shade:B});
   else if(move>0&&move<1)figure(s,you[0],you[1],420,'run',{seed:67,face:1,k:1,shade:B});
   else if(cushK>0)figure(s,you[0],you[1],420,'kick',{seed:67,face:-1,k:cushK,foot:[sp[0]+16,sp[1]+16],shade:B});
   else{figure(s,you[0],you[1],420,scan>0?'scan':'stand',{seed:67,face,look:face<0?-look:look,k:1,shade:B});const hd=headOf(you[0],you[1],420);sightWedge(s,hd[0],hd[1],look,420,scan);}}
  ball(s,sp[0],sp[1],58,68,{sx:1+sq,sy:1-sq,smear:{dir,amount:smear},rot:tt*2});
  if(smear>0)speedLines(s,K,sp[0],sp[1],dir,{n:4,seed:69,len:100,width:5,cov:.7});
 },
 aperture(){return aperture(lozenge(340,-380,150,90));},
 still:6.6,
};

// ---------------- scene 5 (31.04–38.20): five on the court; the ball goes round everyone; attack, defend, move, think — each lit in turn ----------------
const FIVE:Pt[]=[[0,40],[-110,-230],[-120,240],[110,-230],[120,240]];
const sc5:Scene={
 draw(s,t){
  const tt=twos(t);
  const v=key(t,[[0,0,0,1.65],[1.5,0,0,1.72],[3.6,0,0,1.72],[4.1,60,-120,1.72],[4.46,60,-120,1.72],[4.9,-40,120,1.72],[5.38,-40,120,1.72],[5.9,-100,-40,1.72],[6.2,-100,-40,1.72],[7.2,0,-160,2.3]],easeIO,true);
  s.camera(v[0],v[1],v[2]*land(s),0);
  floorFill(s);courtLines(s,0,0,COURT_W,COURT_H,70);
  goalFrame(s,K,-70,-COURT_H/2-40,140,40,{depth:24,net:K,seed:71,bar:8});goalFrame(s,K,-70,COURT_H/2,140,40,{depth:24,net:K,seed:72,bar:8});
  const printed=FIVE.map((_,i)=>easeOutBack(sm(.2+i*.22,.45+i*.22,tt)));
  // movers: attack (3) drives toward the top goal, defend (2) steps goal-side, move (1) runs into space
  const attack=sm(3.6,4.1,tt,easeOut),defend=sm(4.46,4.9,tt,easeOut),moveK=sm(5.38,5.98,tt,easeOut),think=sm(6.2,6.45,tt,easeOutBack);
  const pos:Pt[]=[FIVE[0],L2(FIVE[1],[-150,-20],moveK),L2(FIVE[2],[-40,330],defend),L2(FIVE[3],[130,-300],attack),FIVE[4]];
  const foot=(i:number):Pt=>[pos[i][0]+(pos[i][0]<=0?1:-1)*30,pos[i][1]+16];
  // the ball goes round everyone, then to the attacker who drives with it
  const PASS:[number,number,number,number][]=[[1.5,.4,0,1],[2.1,.4,1,3],[2.7,.4,3,4],[3.2,.35,4,0],[3.6,.3,0,3]];
  let sp:Pt=foot(0),sq=0,smear=0,dir=0;
  for(const [t0,dur,a,b] of PASS){if(tt<t0)break;const u=sm(t0,t0+dur,tt,easeOut);sp=L2(foot(a),foot(b),u);dir=Math.atan2(foot(b)[1]-foot(a)[1],foot(b)[0]-foot(a)[0]);smear=u<1?36:0;sq=tt>=t0+dur?.06*settle(tt,t0+dur,{amp:1,freq:5,decay:5,phase:Math.PI/2}):0;}
  // the lit one: a paper spotlight under the figure of the current caption
  const lit=[[3.6,3],[4.46,2],[5.38,1],[6.2,0]] as [number,number][];
  lit.forEach(([t0,i],k)=>{const next=lit[k+1]?.[0]??99;const g=easeOutBack(sm(t0,t0+.25,tt))*(1-sm(next,next+.3,tt));spot(s,pos[i][0],pos[i][1],200,74+i,g);});
  // "think": a paper thought ring around your head
  if(think>0){const h=headOf(pos[0][0],pos[0][1],240);ringMark(s,h[0],h[1],92,92,22,80,{g:think});}
  FIVE.forEach((_,i)=>{if(printed[i]<=0)return;const p=pos[i],h=240*Math.min(1.08,printed[i]),face:1|-1=i===3?1:p[0]<=0?1:-1,kicking=PASS.some(([t0,,a])=>a===i&&tt>=t0-.15&&tt<t0+.25);
   let pose:Pose='stand',k=1;
   if(kicking)pose='kick';else if(i===3&&attack>0&&attack<1)pose='run';else if(i===3&&attack>=1)pose='step';else if(i===2&&defend>0){pose='crouch';k=defend;}else if(i===1&&moveK>0&&moveK<1)pose='run';else if(i===1&&moveK>=1)pose='arms';else if(i===0&&think>0){pose='scan';}
   figure(s,p[0],p[1],h,pose,i===0?{seed:76,face,k,look:.6*think,shade:B}:{ink:G,seed:76+i,face,k,shade:K});});
  if(moveK>0&&moveK<1)speedLines(s,K,pos[1][0],pos[1][1]-120,Math.atan2(210,-40),{n:4,seed:82,len:110,width:5,cov:.7});
  if(attack>0&&attack<1)speedLines(s,K,pos[3][0],pos[3][1]-120,-Math.PI/2,{n:4,seed:83,len:110,width:5,cov:.7});
  ball(s,sp[0],sp[1],40,84,{sx:1+sq,sy:1-sq,smear:{dir,amount:smear},rot:tt*2});
 },
 aperture(){const h=headOf(FIVE[0][0],FIVE[0][1],240);return apertureDisc(h[0],h[1],52,12);},
 still:6.4,
};

// ---------------- scene 6 (38.20–46.26): the small court inside the big pitch; every touch prints a bigger ring and the court outline grows ----------------
const TOUCH6=[2.74,4.6,5.2,5.8,6.4];
const YOU6:Pt=[-70,90],G6:Pt=[80,-110];
const sc6:Scene={
 draw(s,t){
  const tt=twos(t);
  const v=key(t,[[0,0,0,.6],[2.74,0,0,.63],[3.6,0,0,.85],[4.58,0,0,.85],[6.6,0,0,.95],[8.1,0,0,.95]],easeIO,true);
  s.camera(v[0],v[1],v[2],0);
  pitch(s,0,0,PITCH_W,PITCH_H,90,{lines:lerp(.9,.6,sm(1.8,2.6,tt))});
  // the court: its outline grows a step with every touch (overshoot), and so does its cream floor
  let grow=0;TOUCH6.forEach((t0,i)=>{grow+=key(tt,[[t0,0,easeOutBack],[t0+.4,1]])*(i===0?60:50);});
  courtFloor(s,0,0,COURT_W+100+grow*1.2,COURT_H+140+grow*2.3,91);
  courtLines(s,0,0,COURT_W+grow,COURT_H+grow*2,92);
  // the rings: one per touch, each bigger, all stay
  TOUCH6.forEach((t0,i)=>{const g=easeOutBack(sm(t0,t0+.35,tt));const rx=[90,150,210,260,300][i];ringMark(s,0,0,rx,rx*1.95,28+3*i,95+i,{g});});
  // touches: you ↔ the green teammate, a short pass each time
  const foot=(p:Pt,f:1|-1):Pt=>[p[0]+f*26,p[1]+14];
  const tap=34*(sm(.8,1.05,tt,easeOut)*(1-sm(1.5,1.8,tt,easeIO)))+34*(sm(1.9,2.15,tt,easeOut)*(1-sm(2.5,2.7,tt,easeIO)));
  let sp:Pt=[foot(YOU6,1)[0]+tap,foot(YOU6,1)[1]-tap*.3],sq=0,smear=0,dir=0;
  TOUCH6.forEach((t0,i)=>{if(tt<t0)return;const a=i%2===0?foot(YOU6,1):foot(G6,-1),b=i%2===0?foot(G6,-1):foot(YOU6,1),f=flight(tt,t0,.3,a,b);sp=[f[0],f[1]];sq=f[2];smear=f[3];dir=Math.atan2(b[1]-a[1],b[0]-a[0]);});
  const kicking=(who:number)=>TOUCH6.some((t0,i)=>i%2===who&&tt>=t0-.2&&tt<t0+.2);
  {const t0=TOUCH6.find((x,i)=>i%2===0&&tt>=x-.2&&tt<x+.2);const swing=t0!==undefined?anticipate(t0-.2,t0,tt,{back:.5,hold:.6,e:easeIn}):0;
   const tapK=(tt>=.7&&tt<1.1)||(tt>=1.8&&tt<2.2)?.5:0;
   if(kicking(0))kicker(s,YOU6[0],YOU6[1],260,swing,foot(G6,-1),{seed:100,face:1,shade:B});else figure(s,YOU6[0],YOU6[1],260,tapK>0?'kick':'stand',{seed:100,face:1,k:tapK>0?tapK:1,foot:tapK>0?[sp[0]-14,sp[1]+12]:undefined,shade:B});}
  {const t0=TOUCH6.find((x,i)=>i%2===1&&tt>=x-.2&&tt<x+.2);const swing=t0!==undefined?anticipate(t0-.2,t0,tt,{back:.5,hold:.6,e:easeIn}):0;
   if(kicking(1))kicker(s,G6[0],G6[1],260,swing,foot(YOU6,1),{ink:G,seed:101,face:-1,shade:K});else figure(s,G6[0],G6[1],260,'arms',{ink:G,seed:101,face:-1,k:.6,shade:K});}
  ball(s,sp[0],sp[1],40,102,{sx:1+sq,sy:1-sq,smear:{dir,amount:smear},rot:tt*2});
 },
 aperture(){return aperture(lozenge(300,0,150,36,Math.PI/2));},
 still:6.6,
};

// ---------------- scene 7 (46.26–54.57): lanes travel out; a last tight solve; the court's lines slide out and become the pitch — wide open ----------------
const sc7:Scene={
 draw(s,t){
  const tt=twos(t);
  const v=key(t,[[0,0,0,.6],[3.0,-24,14,.6],[3.5,-20,10,.6],[5.14,-20,10,.6],[6.6,0,0,.6],[8.5,24,-12,.6]],easeIO,true);
  s.camera(v[0],v[1],v[2],0);
  const open=sm(5.14,6.4,tt,easeOut),ovs=open>=1?30*settle(tt,6.4,{amp:1,freq:3,decay:4}):0;
  const W=lerp(COURT_W,PITCH_W,open)+ovs,H=lerp(COURT_H,PITCH_H,open)+ovs*2;
  pitch(s,0,0,W,H,110,{lines:.92*open,lw:14});
  // the court floor: cream on the green, fading to a faint screen as the pitch opens; a faint printed copy of the small court stays
  courtFloor(s,0,0,COURT_W+100,COURT_H+140,111,{cov:lerp(1,.5,open),tint:lerp(.1,0,open)});
  if(open>0)courtLines(s,0,0,COURT_W,COURT_H,112,{cov:.6*open,drag:0,lw:14,knock:true});
  // "the lessons travel everywhere": four blue lanes roll out from the court's sides to the frame edges
  if(open<1){const cov=1-open,L=[[[0,-COURT_H/2],[0,-1200]],[[0,COURT_H/2],[0,1200]],[[-COURT_W/2,0],[-900,0]],[[COURT_W/2,0],[900,0]]] as [Pt,Pt][];
   paint(s,L.map(([a,b],i)=>({pts:[a,b],w:34,p:sm(.3+i*.18,1.2+i*.18,tt,easeOut)})),113,{cov,knock:true});}
  // the court's blue lines slide outward and become the pitch's paper lines
  courtLines(s,0,0,W,H,114,{cov:1-open,ds:open<.5,circle:open<.5,knock:open>0});
  // "solve problems in tight spaces": two pink defenders close in; you pass sideways past them; then they dissolve
  const closeIn=key(tt,[[3.0,520],[3.12,550,easeIn],[3.5,185,easeOut]])+8*settle(tt,3.5,{amp:1,freq:5,decay:5}),wrong=40*sm(4.0,4.3,tt,easeOut),fade=1-sm(5.14,5.64,tt);
  if(fade>.05)for(const side of[-1,1])figure(s,side*closeIn+wrong,50,320,'step',{ink:P,seed:115+side,face:side<0?1:-1,k:.5+.5*sm(3.2,3.5,tt),cov:.92*fade,shade:K});
  const gRun=sm(5.14,6.4,tt,easeOut),g=L2([60,-300],[380,-760],gRun);
  const pass=flight(tt,3.9,.4,[10,66],[86,-286]);
  let sp:Pt=[10,66],sq=0,smear=0;if(tt>=3.9){sp=[pass[0],pass[1]];sq=pass[2];smear=pass[3];}
  if(tt>=5.14){const back=sm(5.14,5.6,tt,easeOut);sp=L2(sp,[10,66],back);}
  {const swing=anticipate(3.7,3.9,tt,{back:.5,hold:.6,e:easeIn}),up=sm(6.0,6.5,tt,easeOutBack);
   if(tt>=3.7&&tt<4.3)kicker(s,-20,50,300,swing,[60,-286],{seed:118,face:1,shade:B});
   else if(up>0)figure(s,-20,50,300,'up',{seed:118,face:1,k:Math.min(1,up),shade:B});
   else figure(s,-20,50,300,'stand',{seed:118,face:1,k:1,shade:B});}
  figure(s,g[0],g[1],300,gRun>0&&gRun<1?'run':'arms',{ink:G,seed:119,face:-1,k:gRun>0&&gRun<1?1:.7,shade:K});
  ball(s,sp[0],sp[1],44,120,{sx:1+sq,sy:1-sq,smear:{dir:Math.atan2(-352,76),amount:smear},glint:1+.4*sm(7.6,8.0,tt),rot:tt*1.2});
  if(open>0&&open<1){speedLines(s,B,-W/2,0,Math.PI,{n:4,seed:121,len:200,width:8,cov:.6});speedLines(s,B,W/2,0,0,{n:4,seed:122,len:200,width:8,cov:.6});}
 },
 still:7.0,
};

const SCENES=[sc1,sc2,sc3,sc4,sc5,sc6,sc7];
const cue=(start:number,text:string,title:string):Chapter=>({label:title,narration:text,seconds:1,start,cues:[{at:0,words:text}]});

export const story:RisoStory={
 id:'futsl',format:'futsal',title:'Love Futsal',theme:'Smaller court. Bigger game.',ageNote:'For futsal players of every age.',
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
 // headlines (≤ 2 words, key points only): none / TIGHTER / MOMENTS / none / EVERYONE / EVERY TOUCH / WIDE OPEN
 visualChapters:[
  {start:0,label:'The small court'},
  {start:5.36,label:'Tighter',headline:'Tighter',cues:[{at:0,words:'The space is tighter',headline:'Tighter'},{at:5.34,words:'less time',headline:''}]},
  {start:16.56,label:'Moments',headline:{text:'Moments',at:4.54}},
  {start:23.3,label:'Scan, control, combine, solve'},
  {start:31.04,label:'Everyone',headline:'Everyone'},
  {start:38.2,label:'Every touch',headline:{text:'Every touch',at:4.58}},
  {start:46.26,label:'Wide open',headline:{text:'Wide open',at:5.14}},
 ],
 draw(f){const v=trackChapters(story,f);playChapters(v.story,v.frame,SCENES);},
 /** Touch: a fresh court-paint tick — a 200 u blue roller stroke with a navy drag edge at the point, a gloss glint, two drips running off it,
  * paint flecks spray and settle, the floor squeaks (a navy tone). Reduced motion: the static stroke. */
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
