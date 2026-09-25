/** Room to Invent — riso (futsal, creativity). ONE WORLD seen from INSIDE at eye level: a small indoor futsal court drawn as a WORKSHOP —
 * warm wooden boards (yellow × pink) with paper board gaps foreshortening toward a navy back wall, torn pink side walls that can press in,
 * blue court paint on the boards. Chapter 2 hangs three paper TOOL TAGS (flick / sole roll / turn) on a workbench rail and the kid performs
 * each; chapter 3 shuts a navy DOOR across one lane and opens another; chapter 4 stamps yellow touch rings all over the floor; chapter 5 is a
 * boot close-up (sole roll, outside-of-the-boot pass, fake-and-go); chapter 6 slides the walls away into a green pitch.
 * The kid = cut-paper pictogram (bible §1c.4, chalk-line's `figure()` with a yellow shirt); defender = pink; teammate = blue; the ball =
 * a paper football with navy pentagons. Drawn objects on twos, camera on ones, everything seeded; scenes read only t and the SceneContext. */
import type {Sheet} from '../sheet';
import {type RisoStory,type Scene,playChapters} from '../story';
import {apertureDisc} from '../passage';
import {TAU,twos,twosIndex,sm,easeOut,easeIO,easeIn,easeOutBack,key,anticipate,settle,smearPose,clamp,lerp,rng,hash,blob,polyPath,ribbon,smoothPts,rotPts,rectPath,circlePath,arc,type Pt,type Key} from '../motion';
import {dust,sparkBurst,speedLines,handCut,crescent,goalFrame} from '../shapes';

const CH='/stories/narration/futsal/room-to-invent/';
const K='navy',P='pink',B='blue',Y='yellow';
const L2=(a:Pt,b:Pt,u:number):Pt=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)];
/** View factor: landscape safe regions (desktop 793 × 625 u) pull back (.74) so the tall kid clears the band; phones (portrait, 1080 × ~1230 u) come closer (1.2). */
const land=(s:Sheet,landZ=.74)=>s.safe.w/s.safe.h>1.2?landZ:1.2;
/** Camera through [t,x,y,zoom] keys (each segment eased) with the view factor; dx = shake; landDy shifts the world down on landscape (clear of the headline). */
function cam(s:Sheet,t:number,keys:Key[],dx=0,landDy=-80,landZ=.74){const v=key(t,keys,easeIO,true),L=land(s,landZ);s.camera(v[0]+dx,v[1]+(L<1?landDy:0),(v[2]??1)*L,0);return v;}

// ---------------- abstract riso figure (bible §1c.4) — chalk-line's pictogram with a yellow shirt ----------------
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
type FigOpts={ink?:string;line?:string;seed?:number;face?:1|-1;look?:number;k?:number;cov?:number;reach?:Pt;foot?:Pt;shade?:string;knock?:boolean;lift?:number;sx?:number;shirt?:string};
/** A cut-paper player: a big head disc, a torn torso block (filled with `shirt` ink when given), two leg strokes, two arm strokes — 5–8 plate ops.
 * (x,y) = ground point, h = height, face = +1 looks right. ink 'paper' = paper body + navy contour (the kid); an ink = that ink knocked out beneath. */
function figure(s:Sheet,x:number,y:number,h:number,pose:Pose,o:FigOpts={}):{head:Pt;hand:Pt;chest:Pt;R:number}{
 const{ink='paper',line=K,seed=1,face=1,look=0,k=1,cov=.92,reach,foot,shade,knock=true,lift=0,sx=1,shirt}=o;
 const base=POSES.stand,p=POSES[pose],L=(a:number,b:number)=>lerp(a,b,k),LP=(a:Pt,b:Pt):Pt=>[lerp(a[0],b[0],k),lerp(a[1],b[1],k)];
 const tilt=L(base.tilt,p.tilt),head=LP(base.head,p.head),legF=LP(base.legF,p.legF),legB=LP(base.legB,p.legB),armF=LP(base.armF,p.armF),armB=LP(base.armB,p.armB),hip=L(base.hip,p.hip);
 const R=h*.16,tw=h*.3*sx,th=h*.38,legL=h*.3,hipY=-legL+hip*h,ca=Math.cos(tilt),sa=Math.sin(tilt);
 const W=(lx:number,ly:number):Pt=>[x+lx*face,y+ly];
 const T=(lx:number,ly:number):Pt=>[lx*ca-ly*sa,hipY+lx*sa+ly*ca];
 const corners=[T(-tw/2,0),T(tw/2,0),T(tw/2,-th),T(-tw/2,-th)].map(q=>W(q[0],q[1]));
 const torsoPts=handCut(corners,seed,h*.02,h*.12),torso=polyPath(torsoPts,true);
 const shF=T(tw*.42,-th+R*.25),shB=T(-tw*.42,-th+R*.25);
 const hc=T(0,-th-R*1.05),headC=W(hc[0]+head[0]*h+look*R*.42,hc[1]+head[1]*h-lift*R),headPts=blob(headC[0],headC[1],R,R*.96,seed+2,{amp:.05,n:30});
 const headPath=polyPath(headPts,true),cc=T(0,-th/2),chest=W(cc[0],cc[1]);
 const hipF=W(tw*.18,hipY),hipB=W(-tw*.18,hipY);
 const fF=foot?foot:W(legF[0]*h,legF[1]*h),fB=W(legB[0]*h,legB[1]*h);
 const aF=reach?reach:W(shF[0]+armF[0]*h,shF[1]+armF[1]*h),aB=W(shB[0]+armB[0]*h,shB[1]+armB[1]*h);
 if(h<8)return{head:headC,hand:aF,chest,R};
 const limbs=new Path2D();
 limbs.addPath(ribbon([hipF,fF],h*.08,{seed:seed+3,pressure:.4,taper:.25,wobble:1.4}));limbs.addPath(ribbon([hipB,fB],h*.08,{seed:seed+4,pressure:.4,taper:.25,wobble:1.4}));
 limbs.addPath(ribbon([W(shB[0],shB[1]),aB],h*.062,{seed:seed+5,pressure:.4,taper:.35,wobble:1.4}));limbs.addPath(ribbon([W(shF[0],shF[1]),aF],h*.062,{seed:seed+6,pressure:.4,taper:.35,wobble:1.4}));
 const body=new Path2D();body.addPath(torso);body.addPath(headPath);
 const outline=new Path2D();outline.addPath(ribbon(torsoPts,Math.max(4,h*.02),{seed:seed+7,close:true,pressure:.6,wobble:1.6,gaps:[[.62,.66]]}));outline.addPath(ribbon(headPts,Math.max(4,h*.02),{seed:seed+8,close:true,pressure:.6,wobble:1.4}));
 if(ink==='paper'){if(knock)s.knockout(body,cov);if(shirt)s.fill(shirt,torso,.95);s.fill(line,limbs);s.fill(line,outline);}
 else{const all=new Path2D();all.addPath(body);all.addPath(limbs);if(knock)s.knockout(all);s.fill(ink,all,cov);s.fill(line,outline,.9);}
 if(shade){const sh=new Path2D();sh.addPath(crescent(headC[0],headC[1],R*.98,[-.35*face,-.4]));if(!shirt)sh.addPath(polyPath([corners[0],[lerp(corners[1][0],corners[0][0],.5),lerp(corners[1][1],corners[0][1],.5)],[lerp(corners[2][0],corners[3][0],.5),lerp(corners[2][1],corners[3][1],.5)],corners[3]],true));s.tone(shade,sh,.45);}
 return{head:headC,hand:aF,chest,R};
}
/** The kid: paper head, yellow shirt, navy limbs, a blue shade on the head. */
const kid=(s:Sheet,x:number,y:number,pose:Pose,o:FigOpts={})=>figure(s,x,y,FIG,pose,{seed:41,shirt:Y,shade:B,...o});
/** A kicking figure: swing>0 blends the kick pose with the front foot at `target` (negative swing = the foot winds back). */
function kicker(s:Sheet,x:number,y:number,h:number,swing:number,target:Pt,o:FigOpts={}){const k=clamp(swing),f=o.face??1;return figure(s,x,y,h,'kick',{...o,k:k+.15,foot:[lerp(x+f*h*.12,target[0],k)+(swing<0?swing*h*.25*f:0),lerp(y,target[1],k)]});}
/** Head centre without drawing. */
function headOf(x:number,y:number,h:number,pose:Pose,o:{k?:number;face?:1|-1;look?:number}={}):Pt{
 const{k=1,face=1,look=0}=o,base=POSES.stand,p=POSES[pose],tilt=lerp(base.tilt,p.tilt,k),hx=lerp(base.head[0],p.head[0],k),hy=lerp(base.head[1],p.head[1],k),hip=lerp(base.hip,p.hip,k);
 const R=h*.16,th=h*.38,hipY=-h*.3+hip*h,ca=Math.cos(tilt),sa=Math.sin(tilt),d=th+R*1.05;
 return[x+(d*sa+hx*h+look*R*.42)*face,y+hipY-d*ca+hy*h];
}

// ---------------- the world: boards, wall, side walls, court paint ----------------
const FIG=640,BR=80,HZ=-330,GS=.42,KY=250;
const BIGR=rectPath(-6000,-6000,12000,12000);
type Room={left?:number;right?:number;wallY?:number;green?:number;sky?:boolean;seed:number;tally?:number;jolt?:Pt;lines?:boolean;far?:boolean;goalX?:number};
/** The board floor: paper gaps closer toward the wall, staggered joints, alternate boards a step darker. */
function boards(s:Sheet,seed:number){
 const gaps=new Path2D(),dark=new Path2D(),rr=rng(seed);let prev=HZ;
 for(let k=1;k<=18;k++){const y=HZ+16*k+2.4*k*k;gaps.addPath(ribbon([[-4000,y],[4000,y]],4+k*.35,{seed:seed+k,pressure:.2,taper:0,wobble:1.2,step:160}));
  if(k>2){const n=1+(rr()*2|0);for(let j=0;j<n;j++){const x=-1500+rr()*3000;gaps.addPath(ribbon([[x,prev+3],[x,y-3]],3+k*.25,{seed:seed+50+k*7+j,taper:.1,wobble:.8,step:60}));}}
  if(k%4===2)dark.rect(-4000,prev,8000,y-prev);prev=y;}
 s.tone(P,dark,.6);s.knockout(gaps,.5);
}
/** The room around the action. green = y of the torn wipe line: wood below it, green (yellow × blue) between the far edge and it. wallY = the wall's foot. */
function room(s:Sheet,o:Room){
 const{left=-470,right=470,wallY=HZ,green=HZ-1,sky=false,seed,tally=0,jolt=[0,0],lines=true,far=false,goalX=-120}=o;
 s.field(Y,.92,.5);
 const wipe=(y:number):Pt[]=>{const pts:Pt[]=[];for(let i=0;i<=24;i++){const u=i/24;pts.push([-4000+u*8000,y+22*Math.sin(u*TAU*3+seed)+18*Math.sin(u*TAU*7.3+seed*2)]);}return pts;};
 if(green<1600){const wood=green<=HZ?polyPath([[-4000,HZ-40],[4000,HZ-40],[4000,4000],[-4000,4000]],true):polyPath([...wipe(green),[4000,4000],[-4000,4000]],true);
  s.tone(P,wood,.45);s.tone(K,wood,.1);s.save();s.clip(wood);boards(s,seed);s.restore();}
 if(green>HZ){const g=polyPath([[-4000,HZ-40],[4000,HZ-40],...wipe(Math.min(green,4000)).reverse()],true);s.tone(B,g,.5);
  const mow=new Path2D();for(let k=0;k<7;k++){const y0=HZ+30+k*k*14+k*30,y1=y0+12+k*8;mow.rect(-4000,y0,8000,y1-y0);}s.save();s.clip(g);s.tone(K,mow,.1);
  if(far){const p=new Path2D();p.addPath(ribbon(blob(0,HZ+250,760,170,seed+3,{amp:.01,n:48}),9,{seed:seed+4,pressure:.2,taper:0,wobble:1,step:50,close:true}));p.addPath(ribbon([[-3000,HZ+70],[3000,HZ+70]],8,{seed:seed+5,pressure:.2,taper:0,wobble:1,step:120}));s.knockout(p,.85);}
  s.restore();}
 if(sky){const skyP=rectPath(-4000,-4400,8000,4400+HZ-40);s.knockout(skyP);s.tone(B,skyP,.15);
  goalFrame(s,K,goalX,HZ-120,240,80,{depth:40,net:K,seed:seed+6,bar:9});}
 if(wallY>-4000){const wall=rectPath(-4000,wallY-4400,8000,4400);s.knockout(wall);s.tone(K,wall,.7);s.tone(K,rectPath(-4000,wallY-4400,8000,4400-720),.3);s.fill(K,rectPath(-4000,wallY-30,8000,34),.95);
  if(tally>0){const p=new Path2D(),x0=40,y0=wallY-128;for(let i=0;i<tally;i++){const g=Math.floor(i/5),j=i%5,gx=x0+g*150,gy=y0;
   if(j<4)p.addPath(ribbon([[gx+j*28,gy],[gx+j*28+4,gy+88]],15,{seed:seed+9+i,pressure:.5,taper:.3,wobble:1.2}));else p.addPath(ribbon([[gx-12,gy+70],[gx+100,gy+12]],15,{seed:seed+9+i,pressure:.5,taper:.3,wobble:1.2}));}s.knockout(p,.92);}}
 if(lines&&green<=HZ+200){const p=new Path2D();p.addPath(ribbon([[left,HZ+56],[right,HZ+56]],13,{seed:seed+20,pressure:.2,taper:0,wobble:1.2,step:80}));
  const d:Pt[]=[];for(let i=0;i<=16;i++){const a=Math.PI+i/16*Math.PI;d.push([Math.cos(a)*520,HZ+56-Math.sin(a)*215]);}p.addPath(ribbon(d,13,{seed:seed+21,pressure:.2,taper:0,wobble:1.2,step:40}));
  p.addPath(polyPath(blob(0,HZ+150,16,8,seed+22,{amp:.1,n:12}),true));s.knockout(p);s.fill(B,p,.92);}
 sideWall(s,left+jolt[0],-1,seed+30);sideWall(s,right+jolt[1],1,seed+31);
}
/** A pink side wall: a tall torn slab from its inner edge outward, paper beneath, a navy shadow strip on the inner edge. */
function sideWall(s:Sheet,inner:number,side:1|-1,seed:number){
 if(Math.abs(inner)>1500)return;const pts=handCut([[inner,-3000],[inner+side*470,-3000],[inner+side*470,3000],[inner,3000]],seed,26,120);
 const beyond=rectPath(side>0?inner+300:inner-3300,-3000,3000,6000);s.knockout(beyond);s.tone(K,beyond,.7);
 const path=polyPath(pts,true);s.knockout(path);s.fill(P,path,.95);
 s.tone(K,polyPath(pts.map(p=>Math.abs(p[0]-inner)<80?p:[inner+side*44,p[1]] as Pt),true),.3);
}
/** The ball: a paper sphere with navy pentagon panels, a blue shade crescent, navy rim, one glint. smear stretches it for a fast pass. */
function ball(s:Sheet,x:number,y:number,r:number,seed:number,o:{sx?:number;sy?:number;smear?:{dir:number;amount:number};rot?:number;glint?:number}={}){
 const{sx=1,sy=1,smear,rot=0,glint=1}=o;let pts=blob(x,y,r*sx,r*sy,seed,{amp:.03,n:40});if(smear&&smear.amount>0)pts=smearPose(pts,smear.dir,smear.amount,[x,y]);
 const disc=polyPath(pts,true);s.knockout(disc);
 s.save();s.clip(disc);
 s.tone(B,crescent(x,y,r*1.02*Math.max(sx,sy),[-.4,-.45]),.32);
 const pan=new Path2D(),pent=(cx:number,cy:number,pr:number,a0:number)=>{const q:Pt[]=[];for(let i=0;i<5;i++){const a=a0+i/5*TAU;q.push([cx+Math.cos(a)*pr*sx,cy+Math.sin(a)*pr*sy]);}return polyPath(smoothPts(q,true,6,2.5),true);};
 pan.addPath(pent(x,y,r*.32,rot-Math.PI/2));
 for(let i=0;i<5;i++){const a=rot-Math.PI/2+Math.PI/5+i/5*TAU;pan.addPath(pent(x+Math.cos(a)*r*.86*sx,y+Math.sin(a)*r*.86*sy,r*.29,a+Math.PI));const b=rot-Math.PI/2+i/5*TAU;pan.addPath(ribbon([[x+Math.cos(b)*r*.32*sx,y+Math.sin(b)*r*.32*sy],[x+Math.cos(b)*r*.64*sx,y+Math.sin(b)*r*.64*sy]],Math.max(2.5,r*.05),{seed:seed+4+i,taper:.3,wobble:1}));}
 s.fill(K,pan,.92);
 s.restore();
 s.fill(K,ribbon(pts,Math.max(3,r*.07),{seed:seed+1,close:true,pressure:.5,wobble:r*.02}),.9);
 if(glint>0&&r>=30)s.knockout(polyPath(blob(x-r*.4*sx,y-r*.42*sy,r*.13*glint,r*.09*glint,seed+2,{amp:.05,n:14}),true));
}
/** Ball flight a→b from t0 over dur: [x, y, squash-settle, smear]. */
function flight(tt:number,t0:number,dur:number,a:Pt,b:Pt,o:{lift?:number;smear?:number}={}):[number,number,number,number]{
 const{lift=0,smear=30}=o,u=sm(t0,t0+dur,tt,easeOut),p=lift?arc(a,b,u,lift):L2(a,b,u);
 return[p[0],p[1],tt>=t0+dur?.07*settle(tt,t0+dur,{amp:1,freq:5,decay:5,phase:Math.PI/2}):0,u>0&&u<1?smear:0];}
/** A dust puff on the boards (a foreshortened ellipse of paper speckle) growing and fading over 1.2 s. size 1 ≈ 320 u wide. */
const puff=(s:Sheet,x:number,y:number,age:number,seed:number,size=1)=>{if(age<0||age>1.2)return;const r=(60+260*easeOut(clamp(age/.9)))*size,cov=.85*(1-clamp(age/1.2));s.save();s.translate(x,y);s.scale(1,GS);dust(s,null,0,0,r,Math.round(22*size),{seed,size:14*size,cov:Math.max(.1,cov),spread:1});s.restore();};
/** A yellow spark burst (paper beneath so yellow prints clean on the wood), popping then fading. */
const spark=(s:Sheet,x:number,y:number,age:number,seed:number,r=120)=>{if(age<0)return;const g=easeOutBack(clamp(age/.4))*(1-clamp((age-.9)/.6));if(g<=0)return;const rr=rng(seed),p=new Path2D();for(let i=0;i<8;i++){const a=i/8*TAU+(rr()-.5)*.3,r0=r*.45,r1=r*(.8+rr()*.5)*g;p.addPath(ribbon([[x+Math.cos(a)*r0,y+Math.sin(a)*r0],[x+Math.cos(a)*r1,y+Math.sin(a)*r1]],r*.12*(.7+rr()*.6),{seed:seed+i,taper:.8,pressure:.4,wobble:.8}));}s.knockout(p,.95);s.fill(Y,p,.95);};
/** A touch ring on the boards: a paper band, yellow, a navy inner line; spot fills the inside with yellow. g scales it in. Batched via paths. */
type Ring={x:number;y:number;rx:number;g:number;spot?:boolean;seed:number};
function rings(s:Sheet,list:Ring[]){
 const band=new Path2D(),inner=new Path2D(),spot=new Path2D();let any=false;
 for(const r of list){if(r.g<=.02)continue;any=true;const rx=r.rx*r.g,ry=rx*GS,w=Math.max(12,rx*.26),n=Math.max(24,Math.round(rx/6));
  band.addPath(ribbon(blob(r.x,r.y,rx,ry,r.seed,{amp:.03,n}),w,{seed:r.seed+1,close:true,pressure:.3,taper:0,wobble:1.4,step:10}));
  inner.addPath(ribbon(blob(r.x,r.y,rx-w*.5,ry-w*.5*GS,r.seed,{amp:.03,n}),Math.max(4,w*.26),{seed:r.seed+2,close:true,pressure:.4,wobble:1.2,step:10}));
  if(r.spot)spot.addPath(polyPath(blob(r.x,r.y,rx-w*.7,ry-w*.7*GS,r.seed+3,{amp:.04,n}),true));}
 if(!any)return;s.knockout(band,.95);s.fill(Y,band,.95);if(list.some(r=>r.spot&&r.g>.02)){s.knockout(spot,.6);s.tone(Y,spot,.6);}s.fill(K,inner,.9);
}
/** A yellow tick (paper beneath) with a paper halo. g draws it. */
function tick(s:Sheet,x:number,y:number,r:number,seed:number,g=1){
 if(g<=0)return;const pts=smoothPts([[x-r,y+r*.05],[x-r*.3,y+r*.75],[x+r,y-r*.8]],false,6),line=g>=1?pts:pts.slice(0,Math.max(2,Math.round(pts.length*g)));
 const path=ribbon(line,r*.42,{seed,pressure:.5,taper:.4,wobble:1.6});s.knockout(ribbon(line,r*.9,{seed:seed+1,taper:.5,wobble:3,step:10}),.2);s.knockout(path,.95);s.fill(Y,path,.95);
}
/** A pink X stamped on the boards (paper beneath), foreshortened. */
function pinkX(s:Sheet,x:number,y:number,r:number,seed:number,g=1){
 if(g<=0)return;const ry=r*.7,p=new Path2D();p.addPath(ribbon([[x-r,y-ry],[x+r,y+ry]],r*.4,{seed,pressure:.5,taper:.3,wobble:1.6}));
 if(g>.5)p.addPath(ribbon([[x+r,y-ry],[x-r,y+ry]],r*.4,{seed:seed+1,pressure:.5,taper:.3,wobble:1.6}));s.knockout(p,.95);s.fill(P,p,.95);
}
/** Ground shadow ellipse under something standing/hovering. */
const shadow=(s:Sheet,x:number,y:number,rx:number,seed:number,cov=.3)=>s.tone(K,polyPath(blob(x,y,rx,rx*GS,seed,{amp:.06,n:16}),true),cov);

// ---------------- the workshop: bench, rail, tool tags ----------------
type Tool='flick'|'sole'|'turn';
const HOOKS:Pt[]=[[-60,HZ-200],[110,HZ-200],[280,HZ-200]];
const TAGS=1.2;
const TOOLS:Tool[]=['flick','sole','turn'];
/** The bench along the wall: a lighter top, a solid front with paper drawer lines, the tool rail with three hooks. */
function bench(s:Sheet,seed:number){
 s.tone(K,polyPath([[-1400,HZ-100],[1400,HZ-100],[1360,HZ-165],[-1360,HZ-165]],true),.45);
 s.fill(K,polyPath(handCut([[-1400,HZ-100],[1400,HZ-100],[1400,HZ+30],[-1400,HZ+30]],seed,4,300),true),.95);
 const dr=new Path2D();for(const x of[-1100,-700,-300,100,500,900])dr.addPath(ribbon([[x-150,HZ-70],[x+150,HZ-70]],7,{seed:seed+1,taper:.3,wobble:1,step:40}));s.knockout(dr,.7);
 const rail=new Path2D();rail.addPath(ribbon([[-1400,HZ-240],[1400,HZ-240]],14,{seed:seed+2,pressure:.3,taper:0,wobble:1,step:120}));
 for(const [hx,hy] of HOOKS)rail.addPath(ribbon([[hx,HZ-240],[hx,hy-30],[hx+16,hy-20]],11,{seed:seed+3,taper:.2,wobble:1}));s.fill(K,rail,.95);
}
/** The mark on a tag (navy on paper), in tag-local units (tag 140 × 170 about its centre). */
function toolMark(kind:Tool,seed:number):Path2D{
 const p=new Path2D();
 const head=(e:Pt,ux:number,uy:number,h:number)=>p.addPath(polyPath([[e[0],e[1]],[e[0]-ux*h-uy*h*.6,e[1]-uy*h+ux*h*.6],[e[0]-ux*h*.5,e[1]-uy*h*.5],[e[0]-ux*h+uy*h*.6,e[1]-uy*h-ux*h*.6]],true));
 if(kind==='flick'){const pts:Pt[]=[[-46,52],[-30,0],[8,-36],[44,-46]];p.addPath(ribbon(smoothPts(pts,false,6),14,{seed,pressure:.3,taper:.2,wobble:.8}));head([52,-49],.94,-.34,34);
  p.addPath(polyPath(blob(-44,60,13,13,seed+1,{amp:.05,n:14}),true));}
 else if(kind==='sole'){p.addPath(ribbon(blob(0,30,24,24,seed,{amp:.03,n:20}),8,{seed:seed+1,close:true,pressure:.4,wobble:.8}));const q:Pt[]=[];for(let i=0;i<5;i++){const a=-Math.PI/2+i/5*TAU;q.push([Math.cos(a)*9,30+Math.sin(a)*9]);}p.addPath(polyPath(q,true));
  p.addPath(polyPath([[-42,-8],[40,-14],[46,-2],[40,8],[-36,10],[-46,2]],true));p.addPath(ribbon([[-40,-30],[44,-38]],9,{seed:seed+2,taper:.3,wobble:.8}));head([56,-40],.99,-.1,24);}
 else{const pts:Pt[]=[];for(let i=0;i<=12;i++){const a=Math.PI/2+i/12*Math.PI;pts.push([Math.cos(a)*30,-10+Math.sin(a)*38]);}p.addPath(ribbon([[-30,50],...pts.slice(1)],14,{seed,pressure:.3,taper:.2,wobble:.8}));head([30,-6],0,1,34);
  p.addPath(polyPath(blob(-30,58,12,12,seed+1,{amp:.05,n:14}),true));}
 return p;
}
/** A paper tool tag: hand-cut rectangle, navy contour, hole + string to `hook`, the navy mark. sc scales it, rot swings it about the hole. */
function tag(s:Sheet,x:number,y:number,kind:Tool,seed:number,o:{sc?:number;rot?:number;hook?:Pt;cov?:number}={}){
 const{sc=1,rot=0,hook,cov=.95}=o;if(sc<.03)return;
 s.save();s.translate(x,y);s.rotate(rot);s.scale(sc,sc);
 const pts=handCut([[-70,-85],[70,-85],[70,85],[-70,85]],seed,3,60),path=polyPath(pts,true);
 s.knockout(path,cov);
 const line=new Path2D();line.addPath(ribbon(pts,5,{seed:seed+1,close:true,pressure:.5,wobble:1.2}));line.addPath(ribbon(blob(0,-64,11,11,seed+2,{amp:.05,n:12}),4,{seed:seed+3,close:true,wobble:.6}));
 if(hook){const inv=1/sc,hx=((hook[0]-x)*Math.cos(-rot)-(hook[1]-y)*Math.sin(-rot))*inv,hy=((hook[0]-x)*Math.sin(-rot)+(hook[1]-y)*Math.cos(-rot))*inv;line.addPath(ribbon([[0,-74],[hx,hy]],4,{seed:seed+4,taper:.1,wobble:.8}));}
 line.addPath(toolMark(kind,seed+5));s.fill(K,line,.92);
 s.restore();
}
/** A tag in flight from a to b (an arc), scaling from sa to sb; returns [x,y,scale,rot]. */
function tagFly(u:number,a:Pt,b:Pt,sa:number,sb:number,lift=120):[number,number,number,number]{const p=arc(a,b,easeIO(u),lift);return[p[0],p[1],lerp(sa,sb,u),(1-u)*u*2];}

// ---------------- doors (chapter 3) and the big boot (chapter 5) ----------------
/** A navy door standing on the boards: frame (pop 0..1), a leaf across the opening (leaf 0 = edge-on, 1 = shut) hinged at hx opening toward dir, yellow light behind when lit. */
function door(s:Sheet,hx:number,base:number,w:number,h:number,dir:1|-1,seed:number,o:{frame?:number;leaf?:number;light?:number}={}){
 const{frame=1,leaf=1,light=0}=o;if(frame<=.02)return;const cx=hx+dir*w/2;
 s.save();s.translate(cx,base);s.scale(frame,frame);s.translate(-cx,-base);
 shadow(s,cx,base+8,w*.7,seed+9,.35);
 if(light>0){const op=rectPath(hx-dir*(dir<0?w:0),base-h,w,h);s.knockout(op);s.tone(Y,op,.95*light);s.knockout(polyPath(blob(cx,base-h*.5,w*.36,h*.3,seed+4,{amp:.12,n:18}),true),.55*light);}
 const fr=new Path2D();fr.addPath(ribbon([[hx,base],[hx,base-h],[hx+dir*w,base-h],[hx+dir*w,base]],26,{seed,pressure:.3,taper:0,wobble:1.4,step:30}));s.fill(K,fr,.95);
 if(leaf>.03){const lw=w*leaf,x0=dir>0?hx:hx-lw,pts=handCut([[x0,base-h+10],[x0+lw,base-h+10],[x0+lw,base],[x0,base]],seed+1,5,120),lp=polyPath(pts,true);
  s.knockout(lp);s.fill(K,lp,.95);
  const pan=new Path2D();pan.addPath(ribbon([[x0+lw*.2,base-h*.85],[x0+lw*.8,base-h*.85],[x0+lw*.8,base-h*.55],[x0+lw*.2,base-h*.55]],5,{seed:seed+2,close:true,wobble:1}));pan.addPath(ribbon([[x0+lw*.2,base-h*.42],[x0+lw*.8,base-h*.42],[x0+lw*.8,base-h*.12],[x0+lw*.2,base-h*.12]],5,{seed:seed+3,close:true,wobble:1}));
  pan.addPath(polyPath(blob(dir>0?x0+lw-w*.12:x0+w*.12,base-h*.48,Math.min(16,lw*.1),Math.min(16,lw*.1),seed+4,{amp:.05,n:12}),true));s.knockout(pan,.6);}
 s.restore();
}
/** A big cut-paper boot: navy sole with a heel, navy upper, paper laces, a yellow stripe; the leg goes up out of frame. (cx,cy) = the boot's centre, ang tilts it (toe up = negative), face = +1 toe right. */
function boot(s:Sheet,cx:number,cy:number,L:number,ang:number,face:1|-1,seed:number,o:{leg?:boolean;sm?:{dir:number;amount:number}}={}){
 const{leg=true,sm:smr}=o,H=L*.46,W=(pts:Pt[]):Pt[]=>{let q=rotPts(pts.map(p=>[p[0]*face,p[1]] as Pt),ang).map(p=>[p[0]+cx,p[1]+cy] as Pt);if(smr&&smr.amount>0)q=smearPose(q,smr.dir,smr.amount,[cx,cy]);return q;};
 const sole=W(handCut([[-L/2,H/2-30],[L/2,H/2-32],[L/2-8,H/2],[-L/2+20,H/2+4],[-L/2-6,H/2-4]],seed,3,80));
 const upper=W(handCut([[-L/2+4,H/2-30],[-L/2+6,-H/2+40],[-L/2+60,-H/2],[-L*.05,-H/2+8],[L*.3,H*.02],[L/2-6,H/2-40],[L/2,H/2-30]],seed+1,4,70));
 const heel=W([[-L/2+6,H/2-30],[-L/2+70,H/2-30],[-L/2+70,-H/2+60],[-L/2+6,-H/2+50]]);
 const all=new Path2D();all.addPath(polyPath(sole,true));all.addPath(polyPath(upper,true));
 if(leg){const ankle=W([[-L*.18,-H/2+30]])[0],top=W([[-L*.22,-2200]])[0];all.addPath(ribbon([ankle,top],L*.2,{seed:seed+2,pressure:.3,taper:0,wobble:1.6,step:80}));}
 s.knockout(all);s.fill(K,all,.95);
 s.tone(K,polyPath(heel,true),.3);
 const stripe=polyPath(W([[-L*.08,-H/2+18],[L*.02,-H/2+14],[L*.3,H*.06],[L*.22,H*.1]]),true);s.knockout(stripe,.95);s.fill(Y,stripe,.95);
 const lace=new Path2D();for(let i=0;i<3;i++){const x0=-L*.3+i*L*.11;lace.addPath(ribbon(W([[x0,-H/2+34+i*6],[x0+L*.08,-H/2+22+i*6]]),L*.026,{seed:seed+3+i,taper:.3,wobble:.6}));}s.knockout(lace,.9);
}

// ---------------- chapter 1 (9.5 s): the huge pitch shut away; the small court; taps foot to foot; a tally on the wall ----------------
const KX1=-200;
const ch1:Scene={
 draw(s,t){
  const tt=twos(t);
  const shake=settle(t,4.7,{amp:12,freq:6,decay:5});
  const wallY=key(t,[[3.84,-2500],[4.05,-2620,easeIn],[4.7,HZ,easeOut]])+(t>=4.7?26*settle(t,4.7,{amp:1,freq:4,decay:5}):0);
  const walls=key(t,[[3.84,1700],[4.0,1760,easeIn],[4.6,400,easeOut]])+(t>=4.6?14*settle(t,4.6,{amp:1,freq:5,decay:5}):0);
  const green=key(tt,[[4.15,1700],[5.1,HZ-1,easeIO]]);
  const taps=tt>=6.77&&tt<8.7?Math.floor((tt-6.77)/.1667):tt>=8.7?12:0;
  cam(s,t,[[0,0,-150,.8],[2.2,0,-140,.82],[3.84,0,-120,.86],[5.31,0,-40,.98],[9.5,0,-50,1.02]],shake);
  room(s,{seed:11,left:-walls,right:walls,wallY:Math.min(wallY,HZ),green,sky:wallY>HZ-4000,tally:taps,far:true,lines:green<=HZ+1});
  if(t>=4.6&&t<5.8){puff(s,-walls+60,KY+60,tt-4.6,12,1.2);puff(s,walls-60,KY+40,tt-4.62,13,1.2);}
  if(t>=4.7&&t<5.9){for(let i=0;i<3;i++)puff(s,-500+i*500,HZ+40,tt-4.7-i*.05,14+i,.9);}
  // the kid: one touch forward at 2.2 then a step after it; from 5.31 taps between the feet
  const step=sm(2.6,3.2,tt,easeIO),kx=KX1+100*step;
  const footF:Pt=[kx+80,KY+8],footB:Pt=[kx-84,KY+8];
  let bp:Pt=[KX1+80,KY+8],sq=0,smear=0,dir=0,rot=0,look=0;
  if(tt>=2.25){const f=flight(tt,2.25,.4,[KX1+80,KY+8],[KX1+200,KY+8]);bp=[f[0],f[1]];sq=f[2];smear=f[3];rot=(bp[0]-KX1-80)/BR;}
  if(tt>=3.2)bp=footF;
  if(tt>=5.31&&tt<6.77){const f=flight(tt,5.35,.28,footF,footB);bp=[f[0],f[1]];sq=f[2];smear=f[3];dir=Math.PI;rot=1.5-(bp[0]-footB[0])/BR;look=-.6;}
  if(tt>=6.77){const i=Math.min(11,Math.floor((tt-6.77)/.1667)),from=i%2?footB:footF,to=i%2?footF:footB,u=tt<8.7?sm(0,.1667,tt-6.77-i*.1667,easeOut):1;
   bp=L2(from,to,u);dir=i%2?0:Math.PI;smear=u<1?24:0;rot=1.5+(bp[0]-footB[0])/BR;look=(u<.5?from[0]:to[0])>kx?.6:-.6;
   if(u<.15&&tt<8.7)puff(s,from[0],KY+16,.02,20+i,.45);}
  if(tt>=8.7)look=.6;
  const swing=anticipate(2.0,2.25,tt,{back:.5,hold:.6,e:easeIn});
  if(tt>=2.0&&tt<2.6)kicker(s,kx,KY,FIG,swing,[bp[0]-20,bp[1]],{seed:41,face:1,shirt:Y,shade:B});
  else if(step>0&&step<1)kid(s,kx,KY,'step',{face:1,k:step});
  else if(tt>=6.77&&tt<8.7){const hop=-6*Math.abs(Math.sin((tt-6.77)*TAU*3));kid(s,kx,KY+hop,'step',{face:1,k:.9,look});}
  else if(tt>=5.31)kid(s,kx,KY,'step',{face:1,k:.7,look});
  else kid(s,kx,KY,'stand',{face:1,k:1});
  if(smear>0)speedLines(s,K,bp[0],bp[1],dir,{n:4,seed:31,len:80,width:5,cov:.7});
  ball(s,bp[0],bp[1],BR,7,{sx:1+sq,sy:1-sq,rot});
  puff(s,KX1+200,KY+16,tt-2.65,32,.7);puff(s,footB[0],KY+16,tt-5.63,33,.6);
 },
 aperture(){const kx=KX1+100;return apertureDisc(kx+80,KY+8,26,12);},
 still:7.6,
};

// ---------------- chapter 2 (14.2 s): the workshop — bench, tags; walls press in; the kid performs a flick, a sole roll, a turn ----------------
const KX2=-265;
/** Where each tag is at time tt: hanging (with a swing), flying to the hand, held, or flying back. */
type TagState={x:number;y:number;sc:number;rot:number;hook?:Pt;held:boolean};
const GRAB:[number,number][]=[[10.45,11.4],[11.65,12.55],[12.8,13.2]];// [leave hook, back on hook]
function tagAt(i:number,tt:number,hand:Pt):TagState{
 const [hx,hy]=HOOKS[i],hang:Pt=[hx,hy+96*TAGS],drop=key(tt,[[.1+i*.3,-1500],[.55+i*.3,hang[1],easeIn]])+(tt>=.55+i*.3?40*settle(tt,.55+i*.3,{amp:1,freq:4,decay:5}):0);
  const swing=.25*settle(tt,.55+i*.3,{amp:1,freq:1.6,decay:1.2})+.16*(settle(tt,2.4,{amp:1,freq:1.8,decay:1.4})+settle(tt,7.7,{amp:1,freq:2.2,decay:1.6}))+.1*settle(tt,3.62+i*.33,{amp:1,freq:2,decay:1.5});
  const [g0,g1]=GRAB[i];
  if(tt<g0)return{x:hx,y:Math.min(drop,hang[1]),sc:1,rot:swing,hook:HOOKS[i],held:false};
  if(tt<g0+.3){const f=tagFly(sm(g0,g0+.3,tt,easeIO),hang,hand,1,.7,140);return{x:f[0],y:f[1],sc:f[2],rot:-.5*f[3],held:true};}
  if(tt<g1){return{x:hand[0],y:hand[1],sc:.7,rot:-.35,held:true};}
  if(tt<g1+.3){const f=tagFly(sm(g1,g1+.3,tt,easeIO),hand,hang,.7,1,140);return{x:f[0],y:f[1],sc:f[2],rot:.4*f[3],held:false};}
  return{x:hx,y:hang[1],sc:1,rot:.2*settle(tt,g1+.3,{amp:1,freq:1.8,decay:1.4}),hook:HOOKS[i],held:false};
}
const ch2:Scene={
 draw(s,t){
  const tt=twos(t);
  const walls=key(t,[[2.13,400],[2.25,412,easeIn],[2.6,370,easeOut],[7.46,370],[7.56,380,easeIn],[7.9,350,easeOut]])+(t>=2.6?6*settle(t,2.6,{amp:1,freq:5,decay:5}):0)+(t>=7.9?6*settle(t,7.9,{amp:1,freq:5,decay:5}):0);
  const jolt=tt>=6.3?10*settle(tt,6.3,{amp:1,freq:6,decay:6}):0;
  cam(s,t,[[0,30,-170,.95],[2.13,30,-170,.95],[2.6,40,-165,1],[3.62,70,-160,1],[5.97,50,-150,1.02],[7.46,50,-150,1.02],[7.9,20,-140,1.06],[9.16,-20,-130,1.08],[10.65,-40,-120,1.1],[14.2,-40,-120,1.12]],0,-50,.70);
  room(s,{seed:12,left:-walls,right:walls,jolt:[0,jolt]});
  bench(s,13);
  if(t>=2.6&&t<3.8){puff(s,-walls+50,KY+70,tt-2.6,21,1);puff(s,walls-50,KY+50,tt-2.6,22,1);}
  if(t>=7.9&&t<9.1){puff(s,-walls+50,KY+70,tt-7.9,23,1);puff(s,walls-50,KY+50,tt-7.9,24,1);}
  // the kid, the ball and the three moves
  const sqz=1-.1*sm(2.3,2.6,tt,easeIn)*(1-sm(2.6,3.6,tt,easeOut))-.14*sm(7.6,7.9,tt,easeIn)*(1-sm(7.9,8.9,tt,easeOut));
  const footF:Pt=[KX2+80,KY+8];
  let bp:Pt=footF,sq=0,smear=0,dir=0,rot=0,face:1|-1=1,pose:Pose='stand',k=1,foot:Pt|undefined,reach:Pt|undefined,look=0;
  // wall pass with yourself at 5.97
  if(tt>=5.97&&tt<7.4){const out=flight(tt,5.97,.35,footF,[walls-BR-6,KY+8],{smear:40});let p:Pt=[out[0],out[1]];smear=out[3];dir=0;
   if(tt>=6.32){const back=flight(tt,6.32,.45,[walls-BR-6,KY+8],footF,{smear:36});p=[back[0],back[1]];sq=back[2];smear=back[3];dir=Math.PI;}
   bp=p;rot=(bp[0]-footF[0])/BR;}
  // flick 10.75–11.35: the ball pops up and lands
  if(tt>=10.75&&tt<11.4){const u=sm(10.75,11.35,tt,easeOut);bp=[footF[0]+30*Math.sin(u*Math.PI),footF[1]-300*Math.sin(u*Math.PI)];rot=u*4;sq=tt>=11.35?.08:0;}
  // sole roll 11.95–12.5: the front foot on the ball drags it right
  const roll=sm(11.95,12.5,tt,easeIO);
  if(tt>=11.85&&tt<12.8){bp=[footF[0]+180*roll,footF[1]];rot=-180*roll/BR;foot=[bp[0]-10,bp[1]-BR-6];pose='kick';k=.5;}
  // turn 13.1–13.5: the body squashes to a sliver and re-opens facing left; the ball is dragged to the new front foot
  const turnU=sm(13.1,13.5,tt,easeIO),spin=tt>=13.1?Math.max(.12,Math.abs(Math.cos(turnU*Math.PI))):1;
  if(tt>=13.3)face=-1;
  if(tt>=12.8&&tt<13.1){bp=[footF[0]+180,footF[1]];}
  if(tt>=13.1){const u=sm(13.2,13.6,tt,easeIO);bp=L2([footF[0]+180,footF[1]],[KX2-90,KY+8],u);rot=-180/BR-(bp[0]-footF[0]-180)/BR;smear=u>0&&u<1?36:0;dir=Math.PI;}
  // pose choices
  const swing=anticipate(5.8,5.97,tt,{back:.5,hold:.6,e:easeIn}),flickSwing=anticipate(10.55,10.78,tt,{back:.4,hold:.6,e:easeIn});
  const hand:Pt=[KX2+140,KY-330];
  if(tt>=3.62&&tt<5.6){pose='arms';k=.5;reach=L2([KX2+170,KY-250],[HOOKS[0][0]-40,HOOKS[0][1]+190],sm(3.62,4.0,tt,easeOut));look=.6;}
  if(tt>=9.16&&tt<10.4){pose='up';k=sm(9.16,9.5,tt,easeOutBack);}
  if(tt>=9.5&&tt<10.4)look=.3;
  s.save();
  if(spin<1){s.translate(KX2,KY);s.scale(spin,1);s.translate(-KX2,-KY);}
  if(sqz<1){s.translate(KX2,KY);s.scale(sqz,1);s.translate(-KX2,-KY);}
  let fig;
  if(tt>=5.8&&tt<6.3)fig=kicker(s,KX2,KY,FIG,swing,[footF[0]-16,footF[1]],{seed:41,face:1,shirt:Y,shade:B});
  else if(tt>=10.55&&tt<11.1)fig=kicker(s,KX2,KY,FIG,flickSwing,[footF[0]-14,footF[1]-40],{seed:41,face:1,shirt:Y,shade:B,reach:hand});
  else if(tt>=13.1&&tt<13.5)fig=kid(s,KX2,KY,'run',{face,k:.6,reach:face>0?hand:undefined});
  else fig=kid(s,KX2,KY,pose,{face,k,foot,reach:reach??((tt>=10.45&&tt<13.6)?(face>0?hand:[KX2-140,KY-330]):undefined),look});
  s.restore();
  // tags: hanging, swinging, grabbed
  const heldHand:Pt=face>0?hand:[KX2-140,KY-330];
  for(let i=0;i<3;i++){const st=tagAt(i,tt,heldHand);tag(s,st.x,st.y,TOOLS[i],60+i*10,{sc:st.sc*TAGS,rot:st.rot,hook:st.hook});}
  for(let i=0;i<3;i++)spark(s,HOOKS[i][0],HOOKS[i][1]+96*TAGS,t-(3.62+i*.33),70+i,150);
  spark(s,fig.head[0],fig.head[1]-fig.R-110,t-9.16,73,170);
  if(tt>=13.1&&tt<13.6)speedLines(s,K,KX2,KY-300,face>0?0:Math.PI,{n:5,seed:74,len:140,width:6,cov:.7});
  if(smear>0)speedLines(s,K,bp[0],bp[1],dir,{n:4,seed:75,len:90,width:5,cov:.7});
  ball(s,bp[0],bp[1],BR,8,{sx:1+sq,sy:1-sq,rot,smear:{dir,amount:smear}});
  puff(s,walls-30,KY+30,tt-6.32,76,.8);puff(s,footF[0],KY+16,tt-11.35,77,.8);puff(s,KX2,KY+20,tt-13.3,78,1.1);
 },
 aperture(){return apertureDisc(HOOKS[2][0],HOOKS[2][1]+96*TAGS+24,36,12);},
 still:11.2,
};

// ---------------- chapter 3 (10.1 s): keep-ups that gain nothing; a defender; one door slams; another opens; the kid goes through ----------------
const KX3=-80,DEF3:Pt=[330,KY-30];
const ch3:Scene={
 draw(s,t){
  const tt=twos(t);
  const shake=settle(t,5.05,{amp:14,freq:7,decay:5});
  cam(s,t,[[0,-60,-20,1.05],[2.34,-20,-20,1.06],[4.68,0,-10,1.08],[7.02,-160,-10,1.1],[10.1,-300,0,1.16]],shake);
  room(s,{seed:13,left:-560,right:560});
  // keep-ups 0.1–1.7 with sparks at each apex; the ball lands at the foot
  const footF:Pt=[KX3+80,KY+8];
  let bp:Pt=footF,sq=0,smear=0,dir=0,rot=0;
  if(tt<1.75){const u1=sm(.1,1.0,tt,easeIO),u2=sm(1.0,1.75,tt,easeIO);const u=tt<1.0?u1:u2,lift=tt<1.0?300:220;bp=[footF[0]+10*Math.sin(u*Math.PI),footF[1]-lift*Math.sin(u*Math.PI)];rot=tt*3;if(tt>=1.75-.1)sq=.08;}
  spark(s,footF[0],footF[1]-300,t-.5,80,130);spark(s,footF[0],footF[1]-220,t-1.32,81,110);
  // the sole roll back at 6.4 and the run to the left door
  const roll=sm(6.5,6.95,tt,easeIO),run=sm(7.6,8.9,tt,easeIO),kx=lerp(KX3,-320,run);
  if(tt>=6.4)bp=[footF[0]-200*roll,footF[1]];if(tt>=7.6)bp=[lerp(footF[0]-200,-420,run),footF[1]+lerp(0,20,run)];
  if(tt>=6.4)rot=-(footF[0]-bp[0])/BR;smear=run>0&&run<1?30:0;dir=Math.PI;
  // the defender steps in from the right at 2.34 and leans at the kid
  const stepIn=key(t,[[2.34,1200],[2.5,1240,easeIn],[3.0,DEF3[0],easeOut]])+8*settle(t,3.0,{amp:1,freq:5,decay:5});
  if(t>=2.34){figure(s,stepIn,DEF3[1],600,'step',{ink:P,seed:23,face:-1,k:.6+.4*sm(2.8,3.0,t),shade:K});if(t>=3.0&&t<4.2)puff(s,stepIn-40,DEF3[1]+16,tt-3.0,82,1);}
  // the right door: frame pops at 4.55, the leaf slams 4.68–5.05
  const frame=easeOutBack(sm(4.5,4.72,tt)),leaf=key(t,[[4.68,0],[4.8,.06,easeIn],[5.05,1,easeOutBack]]);
  door(s,150,KY+30,300,560,1,90,{frame,leaf:Math.max(0,leaf)});
  if(t>=5.05&&t<6.3){puff(s,300,KY+40,tt-5.05,83,1.4);dust(s,null,300,KY-250,180,10,{seed:84,size:9,cov:.7*(1-sm(5.05,5.6,tt))});}
  // the left door: frame pops at 6.9, the leaf opens 7.02–7.5 revealing yellow light
  const frame2=easeOutBack(sm(6.9,7.15,tt)),open=sm(7.02,7.5,tt,easeOut);
  door(s,-580,KY+35,270,580,1,91,{frame:frame2,leaf:lerp(1,.08,open),light:sm(7.02,7.4,tt)});
  if(open>0&&open<1)dust(s,null,-330,KY-200,120,8,{seed:85,size:9,cov:.6});
  // the kid: keep-ups (kick pose), watches the defender, sole-rolls, runs left, stops at the door
  const upK=tt<1.8?.5*Math.abs(Math.sin(tt*TAU*.9)):0;
  if(tt<1.8)kid(s,KX3,KY,'kick',{face:1,k:.3+upK,foot:[footF[0]-20,footF[1]-40*upK]});
  else if(tt>=6.3&&tt<7.6)kid(s,KX3,KY,'kick',{face:1,k:.5,foot:[bp[0]-8,bp[1]-BR-6]});
  else if(run>0&&run<1)kid(s,kx,KY,twosIndex(t)%2?'run':'step',{face:-1,k:.95});
  else if(run>=1)kid(s,kx,KY,'stand',{face:-1,k:1,look:-.4});
  else kid(s,KX3,KY,tt>=2.34?'scan':'stand',{face:1,k:1,look:tt>=2.6&&tt<6.3?.7:0});
  if(smear>0)speedLines(s,K,bp[0],bp[1],dir,{n:4,seed:86,len:110,width:6,cov:.7});
  if(run>0&&run<1)speedLines(s,K,kx+60,KY-300,Math.PI,{n:4,seed:87,len:130,width:6,cov:.6});
  ball(s,bp[0],bp[1],BR,9,{sx:1+sq,sy:1-sq,rot,smear:{dir,amount:smear}});
  puff(s,footF[0],KY+16,tt-1.7,88,.8);
 },
 aperture(){return apertureDisc(-500,-60,52,12);},
 still:8.3,
};

// ---------------- chapter 4 (9.1 s): a loop of touches stamps rings; one big ring; a mistake off the wall (pink X); the softer next touch ----------------
const LOOP=(u:number):Pt=>{const a=-Math.PI/2+u*TAU*1.5;return[Math.cos(a)*230,180+Math.sin(a)*90];};
const START4=LOOP(0),END4=LOOP(1),BIG4:Pt=[60,290],X4:Pt=[330,250],SOFT4:Pt=[-60,300];
const ch4:Scene={
 draw(s,t){
  const tt=twos(t);
  const shake=settle(t,5.6,{amp:12,freq:7,decay:5});
  cam(s,t,[[0,0,-10,1],[1.4,0,0,1.02],[3.15,-40,20,1.06],[5.25,40,20,1.08],[7.0,-20,30,1.12],[9.1,-40,40,1.16]],shake);
  const jolt=tt>=5.6?16*settle(tt,5.6,{amp:1,freq:6,decay:6}):0;
  room(s,{seed:14,left:-440,right:440,jolt:[0,jolt]});
  // rings: two taps, the loop (one ring per twos frame), the big ring, the soft touch ring
  const list:Ring[]=[{x:START4[0]-40,y:START4[1]+12,rx:100,g:easeOutBack(sm(.3,.55,tt)),seed:100},{x:START4[0]+50,y:START4[1]+8,rx:100,g:easeOutBack(sm(.8,1.05,tt)),seed:101}];
  const loopU=sm(1.4,3.15,tt,easeIO);
  const i0=twosIndex(1.4),i1=twosIndex(3.15);
  for(let i=i0;i<=i1;i++){const ti=i/12;if(tt<ti)break;const p=LOOP(sm(1.4,3.15,ti,easeIO));list.push({x:p[0],y:p[1]+10,rx:100,g:easeOutBack(sm(ti,ti+.25,tt)),seed:110+i});}
  list.push({x:BIG4[0],y:BIG4[1]+10,rx:170,g:easeOutBack(sm(3.3,3.65,tt)),seed:140});
  list.push({x:SOFT4[0],y:SOFT4[1]+10,rx:120,g:easeOutBack(sm(7.5,7.85,tt)),seed:141,spot:true});
  rings(s,list);
  pinkX(s,X4[0],X4[1],120,142,sm(5.6,5.95,tt,easeOut));
  tick(s,-230,340,100,143,sm(7.7,8.0,tt,easeOut));spark(s,-230,340,t-7.95,144,170);spark(s,BIG4[0],BIG4[1]-40,t-3.3,145,180);
  // the kid and the ball
  let kx=START4[0],ky=START4[1],face:1|-1=1,bp:Pt=[START4[0]+40,START4[1]+8],sq=0,smear=0,dir=0,rot=0,pose:Pose='stand',k=1,foot:Pt|undefined;
  if(tt<1.4){const tap=(t0:number,a:Pt,b:Pt)=>{if(tt>=t0){const f=flight(tt,t0,.25,a,b);bp=[f[0],f[1]];sq=f[2];smear=f[3];}};
   bp=[START4[0]+50,START4[1]+8];tap(.3,[START4[0]+50,START4[1]+8],[START4[0]-40,START4[1]+12]);tap(.8,[START4[0]-40,START4[1]+12],[START4[0]+50,START4[1]+8]);
   if((tt>=.2&&tt<.5)||(tt>=.7&&tt<1.0)){pose='kick';k=.5;foot=[bp[0]-16,bp[1]];}}
  else if(tt<3.3){const p=LOOP(loopU),q=LOOP(Math.min(1,loopU+.02));kx=p[0];ky=p[1];face=q[0]>=p[0]?1:-1;bp=[p[0]+face*40,p[1]+10];rot=loopU*30;pose=loopU<1?(twosIndex(t)%2?'run':'step'):'stand';k=loopU<1?1:1;smear=loopU<1?30:0;dir=Math.atan2(q[1]-p[1],q[0]-p[0]);}
  else{kx=END4[0];ky=END4[1];face=1;bp=[END4[0]+40,END4[1]+10];
   // the deliberate touch at 3.3, the hard kick at 5.3 into the wall, the rebound, the soft touch at 7.1
   const big=flight(tt,3.3,.35,[END4[0]+40,END4[1]+10],BIG4);if(tt>=3.3){bp=[big[0],big[1]];sq=big[2];smear=big[3];dir=0;}
   const hard=flight(tt,5.3,.3,BIG4,[440-BR-4,200],{smear:70});if(tt>=5.3){bp=[hard[0],hard[1]];smear=hard[3];dir=Math.atan2(200-BIG4[1],440-BIG4[0]);}
   const back=flight(tt,5.6,.6,[440-BR-4,200],[200,300],{smear:40});if(tt>=5.6){bp=[back[0],back[1]];sq=back[2];smear=back[3];dir=Math.atan2(100,-240);}
   const soft=flight(tt,7.1,.45,[200,300],SOFT4,{smear:20});if(tt>=7.1){bp=[soft[0],soft[1]];sq=soft[2];smear=soft[3];dir=Math.PI;}
   rot=30+(bp[0]-END4[0])/BR;
   const move=sm(6.4,6.9,tt,easeIO);kx=lerp(END4[0],110,move);ky=lerp(END4[1],280,move);
   if(tt>=3.05&&tt<3.6){const sw=anticipate(3.05,3.3,tt,{back:.5,hold:.6,e:easeIn});kicker(s,kx,ky,FIG,sw,[BIG4[0]-30,BIG4[1]],{seed:41,face:1,shirt:Y,shade:B});pose='kick';k=-1;}
   else if(tt>=5.0&&tt<5.6){const sw=anticipate(5.0,5.3,tt,{back:.7,hold:.6,e:easeIn});kicker(s,kx,ky,FIG,sw,[BIG4[0]+10,BIG4[1]-10],{seed:41,face:1,shirt:Y,shade:B});pose='kick';k=-1;}
   else if(move>0&&move<1){pose='step';k=move;}
   else if(tt>=6.9&&tt<7.5){const sw=anticipate(6.9,7.1,tt,{back:.3,hold:.6,e:easeIn});kicker(s,kx,ky,FIG,sw,[200+20,300],{seed:41,face:1,shirt:Y,shade:B});pose='kick';k=-1;}
   else if(tt>=7.5){pose='stand';k=1;face=-1;}
   else{pose='stand';k=1;}}
  if(k>=0)kid(s,kx,ky,pose,{face,k,foot,look:tt>=5.6&&tt<6.4?.7:0});
  if(tt>=5.6&&tt<6.2)puff(s,400,220,tt-5.6,146,1.2);
  if(smear>0)speedLines(s,K,bp[0],bp[1],dir,{n:4,seed:147,len:110,width:6,cov:.7});
  ball(s,bp[0],bp[1],BR,10,{sx:1+sq,sy:1-sq,rot,smear:{dir,amount:smear}});
  puff(s,BIG4[0],BIG4[1]+10,tt-3.65,148,1);puff(s,SOFT4[0],SOFT4[1]+10,tt-7.55,149,.8);
 },
 aperture(){return apertureDisc(SOFT4[0],SOFT4[1]+10,46,12);},
 still:4.0,
};

// ---------------- chapter 5 (10 s): the boot close-up — sole roll, outside-of-the-boot pass, fake and go ----------------
const BR5=100,BL=360,BY=280,DEF5:Pt=[250,205],REST=BY-BL*.23;
/** The active boot and the ball through the chapter. */
function bootState(tt:number):{bx:number;by:number;ang:number;px:number;py:number;rot:number;smear:number;dir:number;sq:number;smr:number}{
 let px=180,py=BY,rot=0,smear=0,dir=0,sq=0,smr=0;
 let bx=30,by=REST,ang=-.08+.05*Math.sin(tt*2.2);
 // sole roll 1.58–2.6: the sole lands on the ball, the ball glides left under it
 const up=sm(1.58,1.9,tt,easeIO),drag=sm(1.9,2.6,tt,easeIO);
 if(tt>=1.58){px=180-160*drag;rot=-160*drag/BR5;bx=lerp(30,px-30,up);by=lerp(REST,py-BR5-BL*.2,up);ang=lerp(-.08,-.5,up);}
 // back to the floor 2.7–3.2; wind-up 3.51–3.8; swing; the ball curves away 3.95–4.55, hits the wall, returns 4.6–5.25
 const down=sm(2.7,3.2,tt,easeIO);
 if(tt>=2.7){bx=lerp(px-30,px-140,down);by=lerp(py-BR5-BL*.2,REST,down);ang=lerp(-.5,-.05,down);}
 const wind=anticipate(3.51,3.95,tt,{back:.6,hold:.65,e:easeIn});
 if(tt>=3.51&&tt<4.2){bx=px-140-90*Math.max(0,-wind)+110*Math.max(0,wind)*(1-sm(3.95,4.2,tt));ang=-.05+.35*Math.max(0,-wind)-.25*Math.max(0,wind);}
 if(tt>=3.95){const u=sm(3.95,4.55,tt,easeOut),a:Pt=[20,BY],c:Pt=[262,150];const q:Pt=[lerp(a[0],c[0],u),lerp(a[1],c[1],u)-120*Math.sin(u*Math.PI)*.5];px=q[0];py=q[1];rot=-2+u*6;smear=u<1?46:0;dir=Math.atan2(c[1]-a[1],c[0]-a[0]);bx=-120;by=REST;ang=-.05;}
 if(tt>=4.55){const u=sm(4.6,5.25,tt,easeOut);px=lerp(262,120,u);py=lerp(150,BY,u);rot=2+u*3;smear=u>0&&u<1?34:0;dir=Math.atan2(130,-142);if(u>=1)sq=.07*settle(tt,5.25,{amp:1,freq:5,decay:5,phase:Math.PI/2});
  bx=lerp(-120,-40,sm(4.7,5.3,tt,easeIO));}
 // fake 5.44–5.65 (a smear left over the ball), go 5.9–6.4 (push the ball right and follow)
 const fake=sm(5.44,5.65,tt,easeOut)*(1-sm(5.7,5.9,tt,easeIn)),go=sm(5.9,6.4,tt,easeIO);
 if(tt>=5.44){bx=-40-130*fake+150*go;by=REST-60*fake;ang=-.05-.3*fake;smr=fake>0&&fake<1?40:0;
  px=120+140*go;rot=5+140*go/BR5;smear=go>0&&go<1?36:0;dir=0;if(go>=1)sq=.06*settle(tt,6.4,{amp:1,freq:5,decay:5,phase:Math.PI/2});}
 return{bx,by,ang,px,py,rot,smear,dir,sq,smr};
}
const ch5:Scene={
 draw(s,t){
  const tt=twos(t);
  const shake=settle(t,4.55,{amp:8,freq:7,decay:5});
  cam(s,t,[[0,60,250,1.2],[1.58,50,250,1.21],[2.6,20,250,1.22],[3.51,20,250,1.23],[4.55,60,250,1.24],[5.44,60,250,1.25],[6.4,120,250,1.27],[10,130,250,1.28]],shake,-120);
  const walls=key(t,[[7.02,380],[7.12,388,easeIn],[7.45,356,easeOut]])+(t>=7.45?5*settle(t,7.45,{amp:1,freq:5,decay:5}):0);
  const jolt=tt>=4.55?12*settle(tt,4.55,{amp:1,freq:6,decay:6}):0;
  room(s,{seed:15,left:-walls,right:walls,jolt:[0,jolt]});
  const st=bootState(tt);
  // the defender (pink, mid-ground): steps in, lunges the wrong way three times, slumps
  const enter=key(t,[[.3,1000],[.42,1040,easeIn],[.9,DEF5[0],easeOut]])+8*settle(t,.9,{amp:1,freq:5,decay:5});
  const lunge1=sm(2.0,2.4,tt,easeOut)*(1-sm(2.9,3.4,tt,easeIO)),slump1=sm(2.5,3.0,tt,easeOut)*(1-sm(3.2,3.5,tt));
  const wrong2=sm(4.0,4.4,tt,easeOut)*(1-sm(4.9,5.3,tt,easeIO));
  const lurch=sm(5.6,5.9,tt,easeOut)*(1-sm(6.9,7.4,tt,easeIO)),slump3=sm(6.4,7.0,tt,easeOut);
  const dx=enter+90*lunge1-90*wrong2-120*lurch,dpose:Pose=slump3>0?'slump':slump1>0?'slump':(lunge1>0||wrong2>0||lurch>0)?'step':'crouch';
  const dk=slump3>0?slump3*.8:slump1>0?slump1*.8:Math.max(lunge1,wrong2,lurch,.5);
  if(t>=.3)figure(s,dx,DEF5[1],330,dpose,{ink:P,seed:24,face:-1,k:dk,shade:K});
  if(t>=.9&&t<2.0)puff(s,DEF5[0]-30,DEF5[1]+12,tt-.9,150,.7);
  if(tt>=2.4&&tt<3.4)puff(s,dx-30,DEF5[1]+12,tt-2.4,151,.6);if(tt>=5.9&&tt<6.9)puff(s,dx+30,DEF5[1]+12,tt-5.9,152,.6);
  // the standing boot (left, behind), the active boot, the ball
  boot(s,-230,REST+6,BL,.02,1,160);
  shadow(s,st.px,st.py+BR5*.7,BR5*1.1,161,.3);
  if(st.by<REST-20)shadow(s,st.bx+40,BY+BL*.18,BL*.45,162,.3);
  if(st.smear>0)speedLines(s,K,st.px,st.py,st.dir,{n:5,seed:163,len:150,width:7,cov:.7});
  if(st.smr>0)speedLines(s,K,st.bx,st.by,Math.PI,{n:4,seed:164,len:140,width:7,cov:.6});
  ball(s,st.px,st.py,BR5,11,{sx:1+st.sq,sy:1-st.sq,rot:st.rot,smear:{dir:st.dir,amount:st.smear}});
  boot(s,st.bx,st.by,BL,st.ang,1,165,{sm:st.smr>0?{dir:Math.PI,amount:st.smr}:undefined});
  // sparks: the surprise beat at 7.02, the wall hit
  spark(s,st.px,st.py-BR5-50,t-7.02,166,230);spark(s,st.px+90,st.py-70,t-7.4,167,150);
  if(tt>=4.55&&tt<5.4)puff(s,walls-60,170,tt-4.55,168,.9);
  puff(s,st.px,st.py+BR5*.7,tt-6.4,169,.9);puff(s,20,BY+BR5*.7,tt-2.6,170,.8);
 },
 aperture(t){const st=bootState(twos(t));return apertureDisc(st.bx+BL*.06,st.by-BL*.01,46,12);},
 still:6.6,
};

// ---------------- chapter 6 (8.8 s): the walls slide away, the green opens, the tags stick to the shirt, the kid runs; play, invent, enjoy ----------------
const KX6=-140,MATE6:Pt=[470,190];
const ch6:Scene={
 draw(s,t){
  const tt=twos(t);
  cam(s,t,[[0,0,-20,1.08],[1.86,0,-60,1],[3.38,-40,-40,.96],[5.07,0,-30,.92],[6.42,60,-30,.88],[8.8,80,-40,.84]]);
  const walls=key(t,[[.2,440],[.32,428,easeIn],[1.5,1700,easeIn]]),wallY=key(t,[[.6,HZ],[.75,HZ+14,easeIn],[1.86,-2500,easeIn]]);
  const green=key(tt,[[1.86,HZ-1],[3.0,1700,easeOut]]);
  room(s,{seed:16,left:-walls,right:walls,wallY:wallY<-2400?-5000:wallY,green,sky:wallY<HZ-40,far:true,lines:false,goalX:300});
  if(green>HZ&&green<1600)dust(s,null,0,green,700,14,{seed:171,size:12,cov:.7,spread:1});
  // the little court printed small on the horizon
  if(tt>=2.4){const g=easeOutBack(sm(2.4,2.8,tt)),cx=-400,cy=HZ+2;s.save();s.translate(cx,cy);s.scale(g,g);s.translate(-cx,-cy);
   const fl=polyPath([[cx-220,cy],[cx+220,cy],[cx+280,cy+100],[cx-280,cy+100]],true);s.knockout(fl);s.tone(Y,fl,.88);s.tone(P,fl,.45);s.knockout(ribbon([[cx-200,cy+30],[cx+200,cy+30],[cx+240,cy+70],[cx-240,cy+70]],5,{seed:173,close:true,wobble:.6,step:40}),.5);
   s.knockout(rectPath(cx-220,cy-130,440,132));s.tone(K,rectPath(cx-220,cy-130,440,132),.7);s.fill(K,rectPath(cx-220,cy-8,440,10),.95);
   for(const side of[-1,1] as const){const p=polyPath(handCut([[cx+side*220,cy-180],[cx+side*276,cy-180],[cx+side*276,cy+100],[cx+side*220,cy+100]],172,5,50),true);s.knockout(p);s.fill(P,p,.95);}
   s.restore();}
  // the run, the pass, the flick back, arms up
  const run=sm(5.07,6.2,tt,easeIO),kx=lerp(KX6,140,run),footF:Pt=[kx+80,KY+8],mateFoot:Pt=[MATE6[0]-40,MATE6[1]+12];
  let bp:Pt=[lerp(KX6,140,run)+90,KY+8],sq=0,smear=0,dir=0,rot=run*12;
  if(tt>=6.42){const f=flight(tt,6.45,.6,footF,mateFoot,{smear:40});bp=[f[0],f[1]];sq=f[2];smear=f[3];dir=Math.atan2(mateFoot[1]-footF[1],mateFoot[0]-footF[0]);rot=12+(bp[0]-footF[0])/BR;}
  if(tt>=7.2){const f=flight(tt,7.2,.65,mateFoot,footF,{lift:280,smear:0});bp=[f[0],f[1]];sq=f[2];rot=20+tt*3;}
  const mateIn=sm(4.9,5.8,tt,easeOut),mx=lerp(900,MATE6[0],mateIn);
  {const sw=anticipate(7.05,7.2,tt,{back:.5,hold:.6,e:easeIn});
   if(tt>=7.05&&tt<7.6)kicker(s,mx,MATE6[1],560,sw,[mateFoot[0]+10,mateFoot[1]-30],{ink:B,seed:25,face:-1,shade:K});
   else if(tt>=4.9)figure(s,mx,MATE6[1],560,mateIn<1?'run':tt>=7.85?'up':'arms',{ink:B,seed:25,face:-1,k:mateIn<1?1:.7,shade:K});}
  const swing=anticipate(6.25,6.45,tt,{back:.5,hold:.6,e:easeIn}),upK=sm(7.85,8.2,tt,easeOutBack);
  let fig;
  if(tt>=6.25&&tt<6.8)fig=kicker(s,kx,KY,FIG,swing,[footF[0]-16,footF[1]],{seed:41,face:1,shirt:Y,shade:B});
  else if(run>0&&run<1)fig=kid(s,kx,KY,twosIndex(t)%2?'run':'step',{face:1,k:1});
  else if(upK>0)fig=kid(s,kx,KY,'up',{face:1,k:Math.min(1,upK)});
  else fig=kid(s,kx,KY,tt<1.86?'scan':'stand',{face:1,k:1,look:tt<1.86?.6:0,lift:tt<1.86?.4:0});
  if(run>0&&run<1)speedLines(s,K,kx-40,KY-300,0,{n:5,seed:173,len:150,width:6,cov:.7});
  // the tags fly from the little court to the chest and stick as stickers
  for(let i=0;i<3;i++){const t0=3.38+i*.35,u=sm(t0,t0+.45,tt,easeIO);if(tt<t0)continue;const from:Pt=[-400,HZ-50],to:Pt=[fig.chest[0]+(i-1)*60,fig.chest[1]+8];
   const f=tagFly(u,from,to,.25,.42,220),st=u>=1?.42+.06*settle(tt,t0+.45,{amp:1,freq:4,decay:5}):f[2];tag(s,u>=1?to[0]:f[0],u>=1?to[1]:f[1],TOOLS[i],60+i*10,{sc:st,rot:u>=1?(i-1)*.12:-.6*f[3]});}
  if(smear>0)speedLines(s,K,bp[0],bp[1],dir,{n:4,seed:174,len:110,width:6,cov:.7});
  ball(s,bp[0],bp[1],BR,12,{sx:1+sq,sy:1-sq,rot,smear:{dir,amount:smear}});
  spark(s,fig.head[0],fig.head[1]-fig.R-120,t-7.9,175,190);spark(s,footF[0],footF[1]-40,t-7.85,176,130);
  puff(s,mateFoot[0],mateFoot[1]+8,tt-7.05,177,.8);puff(s,footF[0],footF[1]+8,tt-7.85,178,.9);
 },
 still:8.2,
};

export const story:RisoStory={
 id:'room-to-invent',format:'futsal',title:'Room to Invent',theme:'Creativity in futsal',ageNote:'For futsal players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',pink:'#ff48b0',blue:'#0078bf',navy:'#22366b'},order:['yellow','pink','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:[
  {label:'Where the best began',narration:'Many of the best players in the world grew up playing futsal. Not on a huge pitch, but on a small court, with the ball at their feet again and again.',seconds:9.5,audio:CH+'01.m4a',cues:[{at:0.0,words:'Many of the best players'},{at:2.2,words:'grew up playing futsal'},{at:3.84,words:'Not on a huge pitch'},{at:5.31,words:'on a small court'},{at:6.77,words:'again and again'}]},
  {label:'A small workshop',headline:{text:'Invent',at:9.16},narration:'Think of a small workshop. There is not much room, but every tool is close at hand. Futsal is like that. Less space and less time, so players invent: a flick, a sole roll, a turn nobody expected.',seconds:14.2,audio:CH+'02.m4a',cues:[{at:0.0,words:'Think of a small workshop'},{at:2.13,words:'not much room'},{at:3.62,words:'every tool is close at hand'},{at:5.97,words:'Futsal is like that'},{at:7.46,words:'Less space and less time'},{at:9.16,words:'so players invent'},{at:10.65,words:'a flick, a sole roll, a turn'}]},
  {label:'Solving a problem',headline:{text:'Another door',at:7.02},narration:'Creativity is not a trick to show off. It is a way of solving a problem. When a defender closes one door, a creative player finds another one.',seconds:10.1,audio:CH+'03.m4a',cues:[{at:0.0,words:'Creativity is not a trick'},{at:2.34,words:'a way of solving a problem'},{at:4.68,words:'a defender closes one door'},{at:7.02,words:'finds another one'}]},
  {label:'Hundreds of touches',headline:{text:'Each touch',at:3.15},narration:'On a small court you touch the ball hundreds of times. Each touch is a chance to try something. Each mistake tells you what to try next.',seconds:9.1,audio:CH+'04.m4a',cues:[{at:0.0,words:'On a small court'},{at:1.4,words:'hundreds of times'},{at:3.15,words:'Each touch is a chance'},{at:5.25,words:'Each mistake tells you'},{at:7.0,words:'what to try next'}]},
  {label:'Look for the surprise',headline:'Surprise',narration:'Look for the surprise. Roll the ball under your sole. Pass with the outside of your boot. Fake, then go. Every tight space is a place to invent.',seconds:10.0,audio:CH+'05.m4a',cues:[{at:0.0,words:'Look for the surprise'},{at:1.58,words:'Roll the ball under your sole'},{at:3.51,words:'outside of your boot'},{at:5.44,words:'Fake, then go'},{at:7.02,words:'a place to invent'}]},
  {label:'The space opens up',narration:'Later, on the big pitch, the space opens up. The ideas you found on the small court travel with you. Play. Invent. Enjoy.',seconds:8.8,audio:CH+'06.m4a',cues:[{at:0.0,words:'Later, on the big pitch'},{at:1.86,words:'the space opens up'},{at:3.38,words:'The ideas you found'},{at:5.07,words:'travel with you'},{at:6.42,words:'Play. Invent. Enjoy.'}]},
 ],
 draw(f){playChapters(story,f,[ch1,ch2,ch3,ch4,ch5,ch6]);},
 /** Touch: a ball tap — a small paper football hops and lands at the point, a yellow touch ring stamps on the boards with a paper puff. Reduced motion: the static ring + ball. */
 touch(s,x,y,age,seed){
  const g=age<=0?1:easeOutBack(clamp(age/.3)),hop=age<=0?0:Math.sin(clamp(age/.38)*Math.PI)*130;
  rings(s,[{x,y,rx:130,g,seed}]);
  if(age>0)puff(s,x,y,age,seed+1,1.2);
  ball(s,x+(hash(seed,3)-.5)*40,y-8-hop,44,seed+2,{rot:age*6,sx:age>0&&age<.05?1.1:1});
 },
};
