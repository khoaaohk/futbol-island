/** The Chalk Line — riso pilot. Lead material: chalk (paper knockout) on a green futsal court surface.
 * Inks: yellow → pink → green → navy on cream. Pink never overprints green (muddy): pressure masses and pink figures knock the court out beneath them.
 * One world, six different views of it: a dark corner in macro (1), the route from far above (2), close on the touch (3),
 * the squeezed ball (4), the pink feedback print (5), the whole route small and breathing (6).
 * Legibility pass (bible §1c): abstract cut-paper player figures (paper + navy = you / teammates, pink = defenders), a chalk-drawn
 * FOOTBALL with panel lines, the mistake shown as a touch that runs into a defender, chalk-dust seams instead of ring irises.
 * Scenes read only their local time t and the SceneContext (never the outer frame), so the passage seams stay pixel-continuous. */
import type {Sheet} from '../sheet';
import {type RisoStory,type Scene,playChapters} from '../story';
import {apertureDisc} from '../passage';
import {TAU,twos,twosIndex,sm,easeOut,easeIO,easeIn,easeOutBack,key,camKeys,anticipate,settle,spring,breathe,smearPose,squash,clamp,lerp,rng,blob,polyPath,ribbon,smoothPts,partial,rotPts,circlePath,type Pt} from '../motion';
import {contour,dust,chalkStroke,laneArrow,sparkBurst,ring,handCut,ripple,crescent} from '../shapes';

const CH='/stories/narration/futsal/chalk-line/';
const K='navy',P='pink',G='green',Y='yellow';
type Wear=[number,number,number,number,number,number];// x y rx ry rot cov

// ---------------- abstract riso figure (bible §1c.4) ----------------
/** A cut-paper player pictogram: a big head disc, a torn torso block, two leg strokes, two arm strokes — 4–6 plate ops, no anatomy, no face.
 * (x,y) = the ground point under the body, h = height, face = +1 looks right. Poses are parameter tables blended from `stand` by k (0..1).
 * ink 'paper' = paper body with navy contour and navy limbs (you / teammates); an ink = that ink knocked out beneath (defenders).
 * reach = world point the front arm ends at (holding a chalk, a thread, a reel); foot = world point the front leg ends at (a kick).
 * look (−1..1) turns the head; sight prints a faint paper wedge from the head in the look direction. shade = halftone ink on the shadow side. */
type Pose='stand'|'scan'|'run'|'arms'|'up'|'slump'|'step'|'listen'|'crouch'|'kick';
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
};
type FigOpts={ink?:string;line?:string;seed?:number;face?:1|-1;look?:number;k?:number;cov?:number;reach?:Pt;foot?:Pt;shade?:string;sight?:number;knock?:boolean};
function figure(s:Sheet,x:number,y:number,h:number,pose:Pose,o:FigOpts={}){
 const{ink='paper',line=K,seed=1,face=1,look=0,k=1,cov=.92,reach,foot,shade,sight=0,knock=true}=o;if(h<8)return;
 const base=POSES.stand,p=POSES[pose],L=(a:number,b:number)=>lerp(a,b,k),LP=(a:Pt,b:Pt):Pt=>[lerp(a[0],b[0],k),lerp(a[1],b[1],k)];
 const tilt=L(base.tilt,p.tilt),head=LP(base.head,p.head),legF=LP(base.legF,p.legF),legB=LP(base.legB,p.legB),armF=LP(base.armF,p.armF),armB=LP(base.armB,p.armB),hip=L(base.hip,p.hip);
 const R=h*.16,tw=h*.3,th=h*.38,legL=h*.3,hipY=-legL+hip*h,ca=Math.cos(tilt),sa=Math.sin(tilt);
 const W=(lx:number,ly:number):Pt=>[x+lx*face,y+ly];// local → world (face mirrors x)
 const T=(lx:number,ly:number):Pt=>[lx*ca-ly*sa,hipY+lx*sa+ly*ca];// torso frame (about the hip) → local
 const toLocal=(w:Pt):Pt=>[(w[0]-x)*face,w[1]-y];
 // torso block (torn), shoulders, head
 const corners=[T(-tw/2,0),T(tw/2,0),T(tw/2,-th),T(-tw/2,-th)].map(q=>W(q[0],q[1]));
 const torso=polyPath(handCut(corners,seed,h*.02,h*.12),true);
 const S=T(0,-th),shF=T(tw*.42,-th+R*.25),shB=T(-tw*.42,-th+R*.25);
 const hc=T(0,-th-R*1.05),headC=W(hc[0]+head[0]*h+look*R*.42,hc[1]+head[1]*h),headPts=blob(headC[0],headC[1],R,R*.96,seed+2,{amp:.05,n:30});
 const headPath=polyPath(headPts,true);
 // limbs: two legs from the hip, two arms from the shoulders (front arm may reach a world point, front leg may kick to one)
 const hipF=W(tw*.18,hipY),hipB=W(-tw*.18,hipY);
 const fF=foot?foot:W(legF[0]*h,legF[1]*h),fB=W(legB[0]*h,legB[1]*h);
 const aF=reach?reach:W(shF[0]+armF[0]*h,shF[1]+armF[1]*h),aB=W(shB[0]+armB[0]*h,shB[1]+armB[1]*h);
 const limbs=new Path2D();
 limbs.addPath(ribbon([hipF,fF],h*.08,{seed:seed+3,pressure:.4,taper:.25,wobble:1.4}));limbs.addPath(ribbon([hipB,fB],h*.08,{seed:seed+4,pressure:.4,taper:.25,wobble:1.4}));
 limbs.addPath(ribbon([W(shB[0],shB[1]),aB],h*.062,{seed:seed+5,pressure:.4,taper:.35,wobble:1.4}));limbs.addPath(ribbon([W(shF[0],shF[1]),aF],h*.062,{seed:seed+6,pressure:.4,taper:.35,wobble:1.4}));
 const body=new Path2D();body.addPath(torso);body.addPath(headPath);
 const outline=new Path2D();outline.addPath(ribbon(handCut(corners,seed,h*.02,h*.12),Math.max(4,h*.02),{seed:seed+7,close:true,pressure:.6,wobble:1.6,gaps:[[.62,.66]]}));outline.addPath(ribbon(headPts,Math.max(4,h*.02),{seed:seed+8,close:true,pressure:.6,wobble:1.4}));
 if(sight>0){const sx=headC[0]+look*R*.5*face*0+face*R*.6*(look>=0?1:-1),wedge=polyPath([[headC[0],headC[1]],[sx+face*(look>=0?1:-1)*h*.55,headC[1]-h*.22],[sx+face*(look>=0?1:-1)*h*.55,headC[1]+h*.12]],true);s.knockout(wedge,.3*sight);}
 if(ink==='paper'){if(knock)s.knockout(body,cov);s.fill(line,limbs);s.fill(line,outline);}
 else{const all=new Path2D();all.addPath(body);all.addPath(limbs);if(knock)s.knockout(all);s.fill(ink,all,cov);s.fill(line,outline,.9);}
 if(shade){const sh=new Path2D();sh.addPath(crescent(headC[0],headC[1],R*.98,[-.35*face,-.4]));sh.addPath(polyPath([corners[0],corners[1],corners[2],corners[3]].map((c,i)=>i===1||i===2?[lerp(c[0],corners[i===1?0:3][0],.5),lerp(c[1],corners[i===1?0:3][1],.5)] as Pt:c),true));s.tone(shade,sh,.45);}
 void S;
}

// ---------------- the world: a chalk court surface ----------------
/** Green court with speckle + mottle, yellow halftone wear patches, stepped navy vignette bands, huge chalk markings, drifting dust.
 * `ink` swaps the surface for the story's duotone beat (chapter 5, pink). (ox,oy) places the centre circle; `dim` darkens the print (a court corner at dusk). */
function court(s:Sheet,seed:number,o:{ink?:string;ox?:number;oy?:number;dim?:number;wear?:Wear[];lines?:boolean}={}){
 const{ink=G,ox=0,oy=0,dim=0,wear=[],lines=true}=o;
 s.field(ink,1,.35);
 for(let i=0;i<wear.length;i++){const w=wear[i];s.tone(Y,polyPath(blob(w[0],w[1],w[2],w[3],seed+50+i,{amp:.14,rot:w[4],n:48}),true),w[5]);}
 const radii=[820,1120,1480,1950,9000],levels=[.12,.22,.34,.5];
 for(let k=0;k<4;k++)s.tone(K,ring(ox,oy,radii[k],radii[k+1]),Math.min(.9,levels[k]+dim));
 if(dim>0)s.tone(K,circlePath(ox,oy,radii[0]),dim);
 if(!lines)return;
 s.knockout(circlePath(ox,oy,520),.12);s.knockout(circlePath(ox,oy,300),.1);
 chalkStroke(s,blob(ox,oy,520,520,seed,{amp:.012,n:64}),24,{seed:seed+1,close:true,dust:.4,step:14});
 chalkStroke(s,[[ox,oy-2400],[ox+8,oy+2400]],20,{seed:seed+2,dust:.15,step:40});
 chalkStroke(s,[[ox-1700,oy-1000],[ox-1700,oy+1000]],18,{seed:seed+3,dust:.1,step:40});
 chalkStroke(s,[[ox+1700,oy-1000],[ox+1700,oy+1000]],18,{seed:seed+4,dust:.1,step:40});
 chalkStroke(s,blob(ox-1700,oy,380,380,seed+5,{amp:.02,n:40}),18,{seed:seed+5,close:true,dust:.2,step:16});
 chalkStroke(s,blob(ox+1700,oy,380,380,seed+6,{amp:.02,n:40}),18,{seed:seed+6,close:true,dust:.2,step:16});
 dust(s,null,ox,oy,1600,70,{seed:seed+7,size:6,cov:.6,spread:1});
}
/** Chalk flakes: hand-cut paper and yellow fragments lying on the court; a push (contact point + age) scatters the near ones outward. */
function flakes(s:Sheet,x:number,y:number,r:number,count:number,seed:number,push?:{x:number;y:number;age:number;strength?:number}){
 const rr=rng(seed),paper=new Path2D(),yel=new Path2D();
 for(let i=0;i<count;i++){const a=rr()*TAU,d=Math.pow(rr(),.7)*r;let px=x+Math.cos(a)*d,py=y+Math.sin(a)*d,rot=rr()*TAU;const sz=16+rr()*26;
  if(push&&push.age>=0){const dx=px-push.x,dy=py-push.y,dist=Math.hypot(dx,dy)||1,k=easeOut(clamp(push.age/.7))*(push.strength??260)*Math.max(0,1-dist/(r*1.3));px+=dx/dist*k;py+=dy/dist*k;rot+=k*.012;}
  const q=rotPts([[-sz*.5,-sz*.4],[sz*.5,-sz*.55],[sz*.45,sz*.4],[-sz*.35,sz*.5]],rot),target=i%3===0?yel:paper;target.moveTo(px+q[0][0],py+q[0][1]);for(let j=1;j<4;j++)target.lineTo(px+q[j][0],py+q[j][1]);target.closePath();}
 s.knockout(paper,.95);s.fill(Y,yel,.9);
}
/** A stick of chalk: paper body, navy contour, pink halftone shadow. (x,y) = the writing tip, angle = direction from tip to butt. */
function chalkStick(s:Sheet,x:number,y:number,angle:number,seed:number,o:{len?:number;r?:number}={}){
 const{len=430,r=58}=o,ca=Math.cos(angle),sa=Math.sin(angle);
 const local:Pt[]=[[0,-r*.35],[r*.9,-r],[len,-r],[len+r*.3,0],[len,r],[r*.9,r],[0,r*.35]];
 const outline=rotPts(local,angle).map(p=>[p[0]+x,p[1]+y] as Pt),body=polyPath(outline,true);
 s.knockout(body);
 s.save();s.clip(body);
 const shade=ribbon([[x+ca*r,y+sa*r+r*.55],[x+ca*len,y+sa*len+r*.55]],r*.8,{seed,pressure:0,taper:0,wobble:.5});s.tone(P,shade,.5);
 s.restore();
 contour(s,K,outline,Math.max(5,r*.16),{close:true,seed:seed+1,pressure:.6,wobble:1.8,gaps:[[.52,.58]]});
 const band=polyPath(rotPts([[len*.62,-r],[len*.7,-r],[len*.7,r],[len*.62,r]],angle).map(p=>[p[0]+x,p[1]+y] as Pt),true);s.fill(K,band,.6);
}
/** Where the hand holds the stick: 70 % of the way from the tip to the butt. */
const stickHand=(x:number,y:number,angle:number,len=430):Pt=>[x+Math.cos(angle)*len*.7,y+Math.sin(angle)*len*.7];
/** The ball of this story: a chalk-drawn FOOTBALL — a chalk circle, a chalk centre pentagon with five chalk seams to the rim, a paper highlight
 * and a dust halo. progress draws it on (circle → pentagon → seams); sx/sy squash it; rot turns the panels. Batched: ≈ 7 plate ops. */
function chalkBall(s:Sheet,x:number,y:number,r:number,seed:number,o:{progress?:number;sx?:number;sy?:number;rot?:number;cov?:number;width?:number;halo?:number}={}){
 const{progress=1,sx=1,sy=1,rot=0,cov=.92,width=r*.13,halo=1}=o;
 if(halo>0)dust(s,null,x,y,r*1.45,Math.round(14*halo),{seed:seed+9,size:r*.06,cov:.55,spread:1});
 chalkStroke(s,blob(x,y,r*sx,r*sy,seed,{amp:.03,n:56}),width,{seed:seed+1,close:true,progress:clamp(progress/.55),cov,dust:.8,step:9});
 const pk=clamp((progress-.5)/.3),sk=clamp((progress-.75)/.25);
 if(pk>0){const pent:Pt[]=[];for(let i=0;i<5;i++){const a=rot-Math.PI/2+i/5*TAU;pent.push([x+Math.cos(a)*r*.34*sx,y+Math.sin(a)*r*.34*sy]);}
  const pp=polyPath(smoothPts(pent,true,6,2.5),true);s.knockout(pp,cov*pk);
  if(sk>0){const seams=new Path2D();for(let i=0;i<5;i++){const a=rot-Math.PI/2+i/5*TAU,a2=a;const from:Pt=[x+Math.cos(a)*r*.34*sx,y+Math.sin(a)*r*.34*sy],to:Pt=[x+Math.cos(a2)*r*.98*sx,y+Math.sin(a2)*r*.98*sy];const line=partial([from,to],sk);if(line.length>1)seams.addPath(ribbon(line,width*.62,{seed:seed+10+i,pressure:.5,taper:.4,wobble:1.6}));
   const b=(i+.5)/5*TAU+rot-Math.PI/2,c:Pt=[x+Math.cos(b)*r*.72*sx,y+Math.sin(b)*r*.72*sy];seams.addPath(ribbon([[c[0]-Math.sin(b)*r*.16,c[1]+Math.cos(b)*r*.16],[c[0]+Math.sin(b)*r*.16,c[1]-Math.cos(b)*r*.16]],width*.5*sk,{seed:seed+20+i,taper:.5,wobble:1.2}));}
   s.knockout(seams,cov*.95);}}
 if(progress>=1)s.knockout(polyPath(blob(x-r*.5*sx,y-r*.52*sy,r*.13,r*.09,seed+3,{amp:.05,n:14}),true),cov);
}
/** Chalk arrow: a chalk shaft with a chalk head. */
function chalkArrow(s:Sheet,a:Pt,b:Pt,width:number,seed:number,progress=1){
 const dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L,head=width*2.2,end:Pt=[a[0]+ux*L*progress,a[1]+uy*L*progress];
 chalkStroke(s,[a,[end[0]-ux*head*.6,end[1]-uy*head*.6]],width,{seed,progress:1,dust:.6});
 if(progress>.35){const tip=[[end[0],end[1]],[end[0]-ux*head-uy*head*.6,end[1]-uy*head+ux*head*.6],[end[0]-ux*head+uy*head*.6,end[1]-uy*head-ux*head*.6]] as Pt[];s.knockout(polyPath(tip,true),.92);}
}
/** A chalk cross (the mark where a mistake went). */
function chalkCross(s:Sheet,x:number,y:number,r:number,seed:number,progress=1){chalkStroke(s,[[x-r,y-r],[x+r,y+r]],r*.22,{seed,progress:clamp(progress*2),dust:.5});if(progress>.5)chalkStroke(s,[[x+r,y-r],[x-r,y+r]],r*.22,{seed:seed+1,progress:clamp(progress*2-1),dust:.5});}
/** One chalk-sketched eye: almond in chalk, a paper iris ring, navy pupil, a yellow halftone lid. blink 0 open … 1 closed; look = pupil offset −1..1. */
function chalkEye(s:Sheet,x:number,y:number,size:number,seed:number,o:{blink?:number;look?:Pt;progress?:number}={}){
 const{blink=0,look=[0,0],progress=1}=o,h=size*.42*(1-blink*.92);
 const top:Pt[]=[[x-size,y],[x-size*.5,y-h],[x,y-h*1.15],[x+size*.5,y-h],[x+size,y]],bottom:Pt[]=[[x+size,y],[x+size*.5,y+h*.9],[x,y+h],[x-size*.5,y+h*.9],[x-size,y]];
 const almond=polyPath(smoothPts([...top,...bottom.slice(1,-1)],true,6),true);
 if(progress>=1)s.tone(Y,almond,.45);
 chalkStroke(s,[...top,...bottom.slice(1)],size*.075,{seed,progress,dust:.6});
 if(blink<.85&&progress>=1){const px=x+look[0]*size*.3,py=y+look[1]*h*.45;s.save();s.clip(almond);
  s.knockout(ring(px,py,size*.2,size*.31),.9);s.fill(K,polyPath(blob(px,py,size*.17,size*.17*(1-blink*.5),seed+2,{amp:.04}),true));s.knockout(circlePath(px-size*.06,py-size*.06,size*.05));s.restore();}
}
/** Pressure mass: a hand-cut slab whose inner edge is at x=edge (side −1 left, +1 right), leaning by `lean`. Pink knocks the court out first so it prints clean. */
function mass(s:Sheet,ink:string,edge:number,side:number,seed:number,o:{lean?:number;height?:number;thick?:number;cov?:number;y?:number}={}){
 const{lean=0,height=1600,thick=1800,cov=1,y=0}=o,far=edge+side*thick;
 const pts:Pt[]=side<0?[[far,y-height/2],[edge-lean*height/2,y-height/2],[edge+lean*height/2,y+height/2],[far,y+height/2]]:[[edge+lean*height/2,y-height/2],[far,y-height/2],[far,y+height/2],[edge-lean*height/2,y+height/2]];
 const path=polyPath(handCut(pts,seed,40,160),true);if(ink===P)s.knockout(path);s.fill(ink,path,cov);
}
/** A pink block: any hand-cut rectangle of pressure ink (knocked out beneath). */
function block(s:Sheet,x:number,y:number,w:number,h:number,seed:number,cov=1){const path=polyPath(handCut([[x,y],[x+w,y],[x+w,y+h],[x,y+h]],seed,40,170),true);s.knockout(path);s.fill(P,path,cov);}
const puff=(s:Sheet,x:number,y:number,age:number,seed:number,size=1)=>{if(age<0||age>1.4)return;const r=(50+280*easeOut(clamp(age/1.1)))*size,cov=.8*(1-clamp(age/1.4));dust(s,null,x,y,r,Math.round(22*size),{seed,size:12*size,cov:Math.max(.1,cov),spread:1});};
const spark=(s:Sheet,x:number,y:number,age:number,seed:number,r=120)=>{if(age<0)return;const g=easeOutBack(clamp(age/.45))*(1-.3*clamp((age-1.4)/.8));if(g<=0)return;sparkBurst(s,Y,x,y,r,{n:8,seed,g,width:r*.12});};
/** Seam material: a dense chalk-dust cloud that grows around the aperture point (the camera dives into dust, not into a ring). */
const dustCloud=(s:Sheet,x:number,y:number,age:number,seed:number,o:{r?:number;n?:number;size?:number;cov?:number}={})=>{if(age<0)return;const{r=420,n=70,size=22,cov=.9}=o,g=easeOut(clamp(age/.9));dust(s,null,x,y,r*g,Math.round(n*g)+4,{seed,size,cov,spread:1});dust(s,null,x,y,r*.5*g,Math.round(n*.6*g)+3,{seed:seed+1,size:size*.7,cov,spread:1});};

// ---------------- chapters ----------------
/** 1 · macro on a dark court corner: a player stands with the ball at their feet, chalk in hand, head down — not drawing yet. */
const ch1:Scene={
 draw(s,t){
  const tt=twos(t);
  camKeys(s,t,[[0,-120,40,1.12],[2.6,-120,20,1.16],[5.5,-150,10,1.2],[8.2,-190,10,1.22],[10,-150,50,1.4]]);
  court(s,11,{ox:1500,oy:1100,dim:.2,lines:false,wear:[[-40,150,560,380,.3,.45],[340,-360,380,260,-.5,.3],[-520,-200,300,200,.9,.35]]});
  // the corner: two touchlines meet, a chalk corner arc, a pink corner block beyond the line
  block(s,-2400,-2400,1900,1700,27,1);
  chalkStroke(s,[[-500,-2000],[-500,-330],[-490,1800]],24,{seed:12,dust:.2,step:30});chalkStroke(s,[[-2000,-330],[-500,-330],[1800,-345]],24,{seed:13,dust:.2,step:30});
  chalkStroke(s,[[-500,-110],[-440,-200],[-360,-270],[-280,-330]],20,{seed:14,dust:.5});
  // pressure masses: enter on "Waiting until", creep, then ease back once the chalk begins
  const gap=key(t,[[3.1,1500],[3.45,1600,easeIn],[4.6,620],[6,560],[8.3,560],[9.4,660]]);
  if(gap<1500){mass(s,P,-gap,-1,21,{lean:.06,height:1200,y:80});mass(s,P,gap,1,22,{lean:-.06,height:1200,y:80});}
  flakes(s,-80,80,470,30,15,{x:-80,y:60,age:t-8.3,strength:220});
  // the chalk stick: anticipate up, descend, hover, retreat, tremble, commit
  const down=anticipate(0,1.2,t,{back:.18,hold:.3});
  let tipX=lerp(20,-40,down),tipY=lerp(-330,-110,down),ang=-1.1;
  if(t>1.2){tipY+=8*Math.sin(tt*2.2);}
  const up=sm(3.18,4.2,t);tipX=lerp(tipX,-10,up);tipY=lerp(tipY,-240,up);ang=lerp(ang,-1.4,up);
  tipX+=settle(t,6,{amp:16,freq:9,decay:3});
  const commit=sm(7.6,8.3,t,easeIn);tipX=lerp(tipX,-80,commit);tipY=lerp(tipY,60,commit);ang=lerp(ang,-1.15,commit);
  if(t>=8.3){tipY=60+settle(t,8.3,{amp:12,freq:6,decay:5});}
  const contactAge=t-8.3;
  // the player: shoulders down (not ready) holding the chalk above the ground; the idea pulses inside the head; straightens as the chalk commits
  const slump=1-sm(7.4,8.2,t,easeOut),hand=stickHand(tipX,tipY,ang,340);
  figure(s,-260,360,660,'slump',{seed:41,face:1,k:slump,reach:hand,shade:P});
  {const hx=-260+lerp(0,.05*660,slump)+lerp(0,.03*660,slump),hy=360-660*.3-660*.38-660*.16*1.05+lerp(0,.07*660,slump);const pulse=t>6?.2+.14*(.5+.5*Math.sin((tt-6)*4)):.14;s.knockout(polyPath(blob(hx+10,hy,54,54,3,{amp:.04}),true),pulse);}
  chalkBall(s,-70,270,110,7,{rot:.4});
  if(contactAge>=0){s.knockout(polyPath(blob(-80,60,30+12*clamp(contactAge*3),30+12*clamp(contactAge*3),5,{amp:.05}),true),.92);puff(s,-80,60,contactAge,31,1.2);spark(s,-80,60,contactAge-.1,52,90);}
  chalkStick(s,tipX,tipY,ang,41,{len:340,r:48});
  if(t>=6&&t<8.3)spark(s,tipX,tipY,t-6,51,110);
  dustCloud(s,-80,60,t-9.2,33,{r:380,n:60,size:20});
 },
 aperture(){return apertureDisc(-80,60,110,12);},
 still:5.2,
};
/** 2 · the mark grows into a branching route, seen from far above the whole court; the player draws it, walking with the chalk. */
const ch2:Scene={
 draw(s,t){
  const tt=twos(t);
  camKeys(s,t,[[0,0,0,.5],[1.9,0,0,.5],[3.2,180,-20,.52],[4.5,300,-70,.53],[6.2,520,-220,.55],[8,760,-360,.57],[10,900,-420,.58]]);
  court(s,12,{ox:-300,oy:420,wear:[[500,-300,900,520,.2,.4],[-900,700,700,420,-.4,.35],[1500,300,600,500,1.1,.3]]});
  // the boundary of the known: pink blocks along the far touchline and at the near corner
  block(s,-1200,-1350,3200,520,28,1);block(s,-2300,900,900,1500,29,1);
  // the dot from chapter 1 and its settling dust
  s.knockout(polyPath(blob(0,0,60,60,5,{amp:.05}),true),.92);puff(s,0,0,t+1.2,31,1.6);
  // strokes: each self-draws on its cue; seg1's arrowhead is erased when seg2 changes the direction
  const seg1:Pt[]=[[0,0],[250,-30],[510,-45]],seg2:Pt[]=[[510,-45],[700,-130],[900,-400]],seg3:Pt[]=[[640,-150],[850,-50],[1020,130]],seg4:Pt[]=[[900,-400],[1120,-530],[1330,-640]];
  const p1=sm(1.94,2.5,t,easeOut),p2=sm(4.48,5.3,t,easeIO),p3=sm(6.4,7.2,t,easeIO),p4=sm(7.6,8.4,t,easeIO);
  if(p1>0){chalkStroke(s,seg1,42,{seed:61,progress:p1,step:12});const erase=sm(4.55,4.9,t);if(t>2.7&&erase<1)chalkArrow(s,[400,-38],[560,-48],42,62,1);if(erase>0)puff(s,530,-45,t-4.55,63,1.2);}
  if(p2>0)chalkStroke(s,seg2,42,{seed:64,progress:p2,step:12});
  if(p3>0)chalkStroke(s,seg3,38,{seed:65,progress:p3,step:12});
  if(p4>0){chalkStroke(s,seg4,38,{seed:66,progress:p4*.85,step:12});dust(s,null,1290,-620,140+240*p4,16,{seed:67,size:20,cov:.7});}
  // tried options branch off in yellow (over green: a lime lane), the route in chalk
  if(t>=3.1)laneArrow(s,Y,[300,-40],[420,-330],40,{seed:68,progress:sm(3.1,3.6,t,easeOut),dashed:true});
  if(t>=5.6)laneArrow(s,Y,[700,-130],[560,-420],40,{seed:69,progress:sm(5.6,6.1,t,easeOut),dashed:true});
  flakes(s,650,-250,900,34,16,{x:900,y:-400,age:t-7.6,strength:200});
  // the stick follows the pen tip; it lifts (anticipation) before each new stroke
  let tip:Pt=[0,0],lift=0;
  if(t<1.94){lift=1;}else if(p1<1)tip=partial(smoothPts(seg1,false,6),p1).slice(-1)[0];
  else if(t<4.48){tip=[510,-45];lift=sm(4.3,4.48,t);}else if(p2<1)tip=partial(smoothPts(seg2,false,6),p2).slice(-1)[0];
  else if(t<6.4){tip=[640,-150];lift=sm(6.2,6.4,t);}else if(p3<1)tip=partial(smoothPts(seg3,false,6),p3).slice(-1)[0];
  else if(t<7.6){tip=[900,-400];lift=sm(7.4,7.6,t);}else if(p4<1)tip=partial(smoothPts(seg4,false,6),p4).slice(-1)[0];else{tip=[1330,-640];lift=sm(8.4,9,t);}
  const hover=lift*200+(lift>0?10*Math.sin(tt*2.5):0),ang=-1.15+lift*.15,tipY=tip[1]-hover;
  // the player walks the line, chalk in hand (a large cut-out seen on the map): drawing = kneeling reach, lifting = standing
  const hand=stickHand(tip[0],tipY,ang,760);
  figure(s,tip[0]-360,tip[1]+520,900,'crouch',{seed:42,face:1,k:1-lift*.7,reach:hand,shade:P});
  chalkStick(s,tip[0],tipY,ang,42,{len:760,r:100});
  for(const [at,x,y] of [[1.94,0,0],[4.48,510,-45],[6.4,640,-150],[7.6,900,-400]] as const)puff(s,x,y,t-at,70+at*10,1.1);
 },
 aperture(){return apertureDisc(1330,-640,170,12);},
};
/** 3 · close on the player and the chalk football; a pink defender leans in and forces a different first touch, away from them. */
const ch3:Scene={
 draw(s,t){
  const tt=twos(t);
  camKeys(s,t,[[0,60,-40,1.2],[2.4,60,-40,1.2],[3.4,140,-40,1.22],[4.2,200,-40,1.24],[6.8,220,-30,1.24],[7.1,220,-30,1.24],[7.6,150,80,1.3],[8.4,130,120,1.34],[9.9,120,140,1.38]]);
  court(s,13,{ox:900,oy:-700,wear:[[180,60,460,320,.25,.5],[-380,-300,300,220,-.6,.35]]});
  chalkStroke(s,[[-800,420],[-500,240],[-220,80],[-60,10]],28,{seed:71,dust:.4,step:12});
  // the defender enters from the right on "a different first touch" and leans on the ball's first idea
  const dx0=key(t,[[6.3,1500],[6.55,1600,easeIn],[7.05,640,easeOut],[9.9,600]]);
  flakes(s,120,80,520,26,17,{x:300,y:-15,age:t-7.05,strength:260});
  // the ball draws itself, rolls to the first idea, then is touched to a new angle
  const drawOn=sm(0,.9,t,easeOut);
  const roll=t<3.4?0:anticipate(3.4,4.1,t,{back:.1,hold:.25});
  let bx=lerp(0,300,roll),by=lerp(0,-15,roll),rot=roll*4.2,sx=1,sy=1;
  if(t>=4.1&&t<6.8){bx+=settle(t,4.1,{amp:14,freq:5,decay:4});}
  const touch=sm(7.05,7.3,t,easeOut),after=t-7.3;
  if(t>=7.05){bx=lerp(300,120,touch);by=lerp(-15,200,touch);rot=4.2+touch*3;}
  if(after>=0){const w=settle(t,7.3,{amp:.13,freq:4.5,decay:4,phase:Math.PI/2});sx=1+w;sy=1-w;}
  if(t>=2.5){chalkArrow(s,[190,-6],[430,-22],24,73,sm(2.5,3.1,t,easeOut));spark(s,440,-24,t-3.1,74,110);}
  if(t>=7.4)laneArrow(s,Y,[70,300],[-90,420],34,{seed:75,progress:sm(7.4,7.9,t,easeOut)});
  if(dx0<1500)figure(s,dx0,200,620,'step',{ink:P,seed:77,face:-1,shade:K,k:1});
  // the player: stands over the ball, winds the front foot back (anticipation), snaps it to the ball; the ball darts away from the defender
  {const wind=t<6.8?0:anticipate(6.8,7.12,t,{back:.5,hold:.6,e:easeIn});const kx=lerp(-60,-30,clamp(roll));const footX=lerp(kx+60,300,clamp(wind))+(wind<0?wind*140:0),footY=lerp(150,60,clamp(wind));const rest=t>7.12?settle(t,7.12,{amp:22,freq:5,decay:5}):0;
   figure(s,kx,160,640,'kick',{seed:76,face:1,k:t<6.8?0:clamp(wind)+.2,foot:[footX+rest,footY+(tt-5.8>0?4*Math.sin(tt*3):0)],shade:P});}
  if(touch>0&&touch<1){const pts=smearPose(blob(bx,by,150,150,7,{amp:.03,n:56}),Math.atan2(215,-180),100*(1-touch),[bx,by]);chalkStroke(s,pts,22,{seed:72,close:true,cov:.92,dust:.9,step:9});}
  else chalkBall(s,bx,by,150,7,{progress:drawOn,sx,sy,rot});
  if(t>=7.05)s.tone(Y,polyPath(blob(560,-10,150+120*clamp((t-7.05)*2),150+120*clamp((t-7.05)*2),19,{amp:.1}),true),.6*(1-clamp((t-7.5)/1.4)));
  puff(s,300,-10,t-7.05,77,1.3);spark(s,300,-10,t-7.05,79,130);
  puff(s,0,0,t-.9,78,.8);
  // the seam material: the touch kicks up a chalk-dust cloud down the yellow lane
  dustCloud(s,-140,420,t-8.9,80,{r:440,n:80,size:24});
 },
 aperture(){return apertureDisc(-140,420,120,12);},
};
/** 4 · the squeezed ball: two pink defenders close shoulder-first on the chalk football; the player looks up; a teammate offers below. */
const ch4:Scene={
 draw(s,t){
  const shake=settle(t,2.4,{amp:10,freq:7,decay:5});
  const v=camKeys(s,t,[[0,0,0,.95],[.4,0,0,.95],[1.6,0,-150,.95],[4.9,0,-150,.95],[5.6,-100,180,1],[6.6,-220,420,1.05],[9.5,-240,460,1.12]]);
  s.camera(v[0],v[1]+shake,v[2],0);
  court(s,14,{ox:-1100,oy:900,wear:[[-40,-180,640,420,.1,.4],[-300,760,420,300,.7,.45]]});
  chalkStroke(s,[[-620,-760],[-380,-460],[-150,-200],[-30,-40]],24,{seed:81,dust:.4,step:12});
  // pressure: two defenders lean back, push in shoulder-first, creep; the chalk ball squashes between them; flakes fly from the contacts
  const gap=key(t,[[.82,1700],[1.1,1820,easeIn],[2.4,400,easeOut],[4.9,300],[6.2,300],[7.2,420]]);
  const lean=key(t,[[.82,0],[1.1,-.12],[2.4,.08],[3.2,0]]);
  if(t>=.82){figure(s,-gap/2-120,300,700,'step',{ink:P,seed:23,face:1,k:1+lean*2,shade:K});figure(s,gap/2+120,300,700,'step',{ink:P,seed:24,face:-1,k:1+lean*2,shade:K});}
  flakes(s,0,120,560,30,18,{x:-gap/2,y:0,age:t-2.4,strength:240});flakes(s,60,-60,420,14,19,{x:gap/2,y:0,age:t-2.4,strength:240});
  const sq=clamp((340-gap)/50)*(t<4.96?1:1-spring(t-4.96,3,.5));
  const [sxq,syq]=squash(sq*.42);
  // the pass on "Choose one small action": short, along the yellow lane, cushioned by the teammate
  const pass=sm(5.3,6,t,easeOut);const bx=lerp(0,-240,pass),by=lerp(0,700,pass)-50*Math.sin(pass*Math.PI)*.3;
  const cushion=t>6?settle(t,6,{amp:.08,freq:4,decay:5,phase:Math.PI/2}):0;
  // support: a yellow lane below the defenders and a teammate with arms out at its end
  if(t>=3){laneArrow(s,Y,[-60,190],[-200,620],36,{seed:88,progress:sm(3,3.7,t,easeOut)});const pulse=sm(3.7,4.4,t,easeOut);figure(s,-330,880,560*easeOutBack(sm(3.5,3.9,t)),'arms',{seed:89,face:1,shade:Y});if(pulse>0&&pulse<1)ripple(s,Y,-260,760,105,2,{width:12,seed:89,spacing:60,progress:pulse});}
  chalkBall(s,bx,by,170,8,{sx:sxq*(1+cushion),sy:syq*(1-cushion),rot:pass*5});
  if(pass>0&&pass<1)dust(s,null,bx+50*(1-pass),by-50*(1-pass),80,10,{seed:85,size:10,cov:.6});
  if(gap<=350){puff(s,-gap/2,-10,t-2.4,86,1.1);puff(s,gap/2,10,t-2.4,87,1.1);spark(s,-gap/2,-10,t-2.4,92,90);spark(s,gap/2,10,t-2.4,93,90);}
  // the chalk eye above the ball is the "look up": it opens, looks toward the pressure, then toward support (the camera pans as the look)
  const blink=1-sm(0,.5,t,easeOut),eyeLook:Pt=[key(t,[[.9,0],[1.3,.7],[3,.7],[3.5,-.6],[9.5,-.6]]),key(t,[[.9,0],[1.3,.1],[3,.1],[3.5,.7]])];
  chalkEye(s,0,-520,320,91,{blink:Math.max(blink,t>7.8&&t<8.05?1-Math.abs((t-7.92)/.13):0),look:eyeLook});
 },
 aperture(){return apertureDisc(-450,250,100,12);},
};
/** 5 · the feedback print: inside the pressure ink — pink court, a navy defender in a closing gap; the touch is too big and runs into them. */
const ch5:Scene={
 draw(s,t){
  camKeys(s,t,[[0,0,0,1.02],[2.6,40,0,1.02],[3.4,40,0,1.05],[6,-60,30,1.08],[8,-90,40,1.14],[9.5,-100,50,1.22]]);
  court(s,15,{ink:P,ox:140,oy:-300,dim:.08});
  s.tone(Y,polyPath(blob(-260,420,700,380,55,{amp:.14,rot:.3}),true),.35);
  // navy masses close the space around a navy defender; the pass is too big and smudges against the defender's legs
  const gap=key(t,[[0,1300],[.3,1300],[1,560,easeIO],[6.4,560],[7.2,1000,easeOut]]);
  mass(s,K,300-gap/2,-1,25,{height:1800,thick:1700,cov:.82,y:-40,lean:.05});mass(s,K,300+gap/2,1,26,{height:1800,thick:1700,cov:.82,y:-40,lean:-.05});
  // the defender stands in the gap; when the space re-opens on "Feedback helps" they step back out of the lane
  const back=sm(6.4,7.2,t,easeOut);figure(s,330+260*back,240,620,'step',{ink:K,seed:27,face:-1,k:1-.5*back,cov:.9,shade:P});
  flakes(s,-40,120,560,24,20,{x:240,y:20,age:t-.9,strength:280});
  const travel=sm(.2,.9,t,easeIn),hit=t-.9;
  // the player at the left plays the touch: foot swings to the ball at .2, then stands; at 5.98 the redrawn ball is at their feet
  {const swing=anticipate(0,.3,t,{back:.4,hold:.5,e:easeIn});figure(s,-440,220,620,'kick',{seed:28,face:1,k:t<.6?clamp(swing)+.15:1-sm(.6,1.2,t),foot:t<.6?[lerp(-400,-280,clamp(swing))+(swing<0?swing*120:0),lerp(150,80,clamp(swing))]:undefined,shade:Y});}
  if(hit<0){const bx=lerp(-380,240,travel),by=lerp(60,20,travel);const pts=travel>.2?smearPose(blob(bx,by,150,150,10,{amp:.03,n:56}),0,200*travel,[bx,by]):blob(bx,by,150,150,10,{amp:.03,n:56});chalkStroke(s,pts,22,{seed:101,close:true,dust:1,step:9});}
  else{const fade=1-clamp(hit/.5);if(fade>0)chalkStroke(s,blob(240,20,150,150,10,{amp:.03,n:56}),22,{seed:101,close:true,cov:.3+.6*fade,dust:1.5,step:9});puff(s,260,20,hit,102,1.8);dust(s,null,230,20,80+200*clamp(hit),30,{seed:103,size:11,cov:.5*(1-clamp(hit/2))});}
  // information: a chalk cross where the ball went, chalk traces where the space closed, ticks bracket the gap
  if(t>=1.4)chalkCross(s,240,20,70,99,sm(1.4,1.9,t,easeOut));
  if(t>=2.7){const p=sm(2.7,3.6,t,easeOut);chalkStroke(s,[[300-gap/2,-700],[302-gap/2,-250],[298-gap/2,300],[300-gap/2,800]],16,{seed:104,progress:p,dust:.5,step:12});chalkStroke(s,[[300+gap/2,-700],[298+gap/2,-250],[302+gap/2,300],[300+gap/2,800]],16,{seed:105,progress:p,dust:.5,step:12});}
  if(t>=3.6){const p=sm(3.6,4,t,easeOut);chalkStroke(s,[[220-gap/2,-420],[380+gap/2,-420]],14,{seed:106,progress:p,dust:.3});if(p>.5){chalkStroke(s,[[220-gap/2,-480],[220-gap/2,-360]],14,{seed:107,dust:.2});chalkStroke(s,[[380+gap/2,-480],[380+gap/2,-360]],14,{seed:108,dust:.2});}}
  // the touch redrawn: the whole travel dotted, then the right-sized touch in yellow (orange on pink)
  if(t>=4.4){const p=sm(4.4,5,t),line:Pt[]=[[-380,180],[-180,176],[40,170],[240,164]];const q=partial(smoothPts(line,false,6),p),dots=new Path2D();for(let i=0;i<q.length;i+=6)dots.addPath(circlePath(q[i][0],q[i][1],10));s.knockout(dots,.92);}
  if(t>=5.2)laneArrow(s,Y,[-380,180],[-180,178],32,{seed:109,progress:sm(5.2,5.6,t,easeOut)});
  // feedback: the ball is redrawn cleanly at the player's feet, a spark ring, and an arrow into the opened lane
  if(t>=5.98){chalkBall(s,-220,90,150,11,{progress:sm(5.98,6.8,t,easeOut)});spark(s,-220,90,t-6.8,110,170);}
  if(t>=7)laneArrow(s,Y,[-40,70],[300,0],36,{seed:111,progress:sm(7,7.6,t,easeOut)});
  // the seam material: a sparse, coarse chalk-dust cloud at the end of the opened lane
  dustCloud(s,300,0,t-8.5,112,{r:520,n:40,size:34,cov:.85});
 },
 aperture(){return apertureDisc(300,0,130,12);},
};
/** 6 · the whole branching route seen small on the full court; the player plays the shorter touch, the tick draws over the ball, the composition breathes. */
const ch6:Scene={
 draw(s,t){
  const tt=twos(t);
  const breath=1+.05*easeOut(sm(2.5,3.6,t))-.03*sm(3.6,5.2,t)+.01*breathe(t,3.2)*sm(5.2,6.5,t);
  const v=camKeys(s,t,[[0,0,0,.5],[1.2,0,0,.5],[2.8,60,-140,.51],[4.94,60,-140,.51],[5.3,60,-180,.52],[6.8,80,-260,.53],[9,100,-420,.55],[11.1,100,-460,.56]]);
  s.camera(v[0],v[1],v[2]*breath,0);
  court(s,16,{ox:-500,oy:600,wear:[[-700,-200,900,600,.3,.4],[900,500,800,500,-.5,.35],[300,-900,700,400,.8,.3]]});
  // pressure at the edges recedes as the composition breathes out
  const recede=easeOut(sm(2.5,4.2,t))*700;
  block(s,-2600-recede,-1500,1100,3000,30,1);block(s,1900+recede,-1600,1200,3200,31,1);
  // the route so far, arriving from the corner where it began
  chalkStroke(s,[[-1500,900],[-1100,560],[-700,300],[-350,110],[-80,20]],30,{seed:121,dust:.3,step:16});
  chalkStroke(s,[[-700,300],[-560,-40],[-380,-260]],26,{seed:139,dust:.3,step:14});dust(s,null,-380,-270,120,10,{seed:140,size:16,cov:.6});
  // branches: two fizzle (marked, kept), one continues
  chalkStroke(s,[[110,-90],[330,-260],[520,-380]],26,{seed:122,dust:.5,step:12});dust(s,null,540,-390,120,12,{seed:123,size:16,cov:.6});
  chalkStroke(s,[[160,10],[430,60],[640,40]],26,{seed:124,dust:.5,step:12});dust(s,null,660,36,120,12,{seed:125,size:16,cov:.6});
  if(t>=.8)chalkStroke(s,[[480,-450],[600,-330]],18,{seed:126,progress:sm(.8,1.1,t)});if(t>=.95)chalkStroke(s,[[600,-450],[480,-330]],18,{seed:127,progress:sm(.95,1.25,t)});
  if(t>=1.6)chalkStroke(s,[[600,-20],[720,100]],18,{seed:128,progress:sm(1.6,1.9,t)});if(t>=1.75)chalkStroke(s,[[720,-20],[600,100]],18,{seed:129,progress:sm(1.75,2.05,t)});
  laneArrow(s,Y,[-560,-40],[-760,-300],40,{seed:141,dashed:true});laneArrow(s,Y,[330,-260],[360,-560],40,{seed:142,dashed:true});
  // the main branch grows on "Confidence can grow" and splits into two yellow lanes
  const main:Pt[]=[[0,-175],[30,-500],[70,-850],[120,-1300]];
  chalkStroke(s,main,28,{seed:130,progress:.2+.8*sm(6.82,8.2,t,easeIO),dust:.6,step:14});
  if(t>=8){laneArrow(s,Y,[100,-1100],[-260,-1560],44,{seed:131,progress:sm(8,8.6,t,easeOut)});laneArrow(s,Y,[110,-1160],[480,-1600],44,{seed:132,progress:sm(8.2,8.8,t,easeOut)});}
  spark(s,120,-1300,t-8.3,133,200);spark(s,-280,-1580,t-8.9,134,160);spark(s,500,-1620,t-9.1,135,160);
  // the ball: a tick on "try", a spark ring on "learn", then the player plays it up the branch and it settles
  const up=sm(8.4,9.2,t,easeOut),bx=lerp(0,60,up),by=lerp(0,-800,up);
  const wob=t>9.2?settle(t,9.2,{amp:.06,freq:4,decay:4,phase:Math.PI/2}):0;
  {const sw=t<5.4?0:anticipate(5.4,5.7,t,{back:.4,hold:.5,e:easeIn}),sw2=t<8.1?0:anticipate(8.1,8.4,t,{back:.4,hold:.5,e:easeIn});const k=Math.max(clamp(sw)*(1-sm(6.2,6.8,t)),clamp(sw2)*(1-sm(9,9.6,t)));const swing=t<8.1?sw:sw2;
   const foot:Pt|undefined=k>0.05?[lerp(-150,-40,clamp(swing))+(swing<0?swing*160:0),lerp(130,60,clamp(swing))]:undefined;
   figure(s,-260,220,760,'kick',{seed:143,face:1,k:k+.1,foot,shade:P});}
  chalkBall(s,bx,by,190,12,{sx:1+wob,sy:1-wob,rot:up*6});
  if(t>=5.5)chalkStroke(s,[[bx-90,by+15],[bx-30,by+80],[bx+105,by-80]],20,{seed:136,progress:sm(5.5,5.9,t,easeOut)});
  spark(s,bx,by,t-6.1,137,260);
  // flakes lift with the breath
  const lift=easeOut(sm(2.5,4,t))*260;flakes(s,100,-100-lift,1100,40,138+(tt>2.5&&tt<4?twosIndex(t)%2:0));
 },
 still:5.2,
};

export const story:RisoStory={
 id:'chalk-line',format:'futsal',title:'The Chalk Line',theme:'Creative confidence',ageNote:'For futsal players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',pink:'#ff48b0',green:'#00a95c',navy:'#22366b'},order:['yellow','pink','green','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:[
  {label:'Before you feel ready',narration:'What if confidence comes after you begin? Waiting until you feel completely ready can keep a useful idea inside your head.',seconds:10,audio:CH+'01.m4a',cues:[{at:0,words:'What if'},{at:3.18,words:'Waiting until'},{at:6,words:'a useful idea'}]},
  {label:'Room to explore',narration:'Think of a chalk line. One small mark opens a direction. Another changes it. You can explore without knowing the whole picture.',seconds:10,audio:CH+'02.m4a',cues:[{at:0,words:'Think of'},{at:1.94,words:'One small mark'},{at:4.48,words:'Another changes'}]},
  {label:'Try something useful',headline:'Try',narration:'Creative confidence means being willing to test an idea and learn. In futsal, that might mean trying a different first touch.',seconds:9.9,audio:CH+'03.m4a',cues:[{at:0,words:'Creative confidence'},{at:2.5,words:'test an idea'},{at:6.8,words:'a different first touch'}]},
  {label:'Notice your options',headline:'Pressure',narration:'Look up before the ball arrives. Where is the pressure? Where is your support? Choose one small action that fits what you see.',seconds:9.5,audio:CH+'04.m4a',cues:[{at:0,words:'Look up'},{at:.82,words:'Where is the pressure'},{at:4.96,words:'Choose one small action'}]},
  {label:'A mistake gives information',headline:'Information',narration:'If it fails, ask what you noticed. Was the space closing? Was the touch too big? Feedback helps shape the next attempt.',seconds:9.5,audio:CH+'05.m4a',cues:[{at:0,words:'If it fails'},{at:2.7,words:'Was the space closing'},{at:5.98,words:'Feedback helps'}]},
  {label:'Look. Try. Learn.',narration:'You do not need every idea to work. Give yourself permission to explore. Look, try, learn. Confidence can grow through useful practice.',seconds:11.1,audio:CH+'06.m4a',cues:[{at:0,words:'You do not need'},{at:4.94,words:'Look, try, learn'},{at:6.82,words:'Confidence can grow'}]},
 ],
 draw(f){playChapters(story,f,[ch1,ch2,ch3,ch4,ch5,ch6]);},
 /** Touch: a chalk puff (~120 u), a fresh chalk tick the size of the ball, a yellow spark. Reduced motion: the static tick. */
 touch(s,x,y,age,seed){
  const r=rng(seed);const a=r()*Math.PI*2;
  puff(s,x,y,age,seed,1.7);
  chalkStroke(s,[[x-150,y+40],[x-40,y+150],[x+190,y-150]],34,{seed,progress:age>0?sm(0,.3,age,easeOut):1,dust:.6});
  if(age>0)spark(s,x+Math.cos(a)*80,y+Math.sin(a)*80,age-.15,seed+1,190);
 },
};
