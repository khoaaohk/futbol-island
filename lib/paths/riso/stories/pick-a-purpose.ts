/** Pick a Purpose — riso (9v9, practising with a purpose). ONE WORLD, side view at eye level: a daylight TRAINING PITCH — a green
 * pitch (yellow × blue) with paper lines running back to a navy torn HEDGE on the horizon, a far goal, a WALL OF RED PAPER CONES along the
 * far side and a torn band of hand-cut GRASS TUFTS across the near edge; cream sky with red fletch confetti. The metaphor is an ARCHERY
 * TARGET (huge paper rings: yellow centre, red, blue, navy contours) on a navy A-frame stand; the archer is a blue cut-paper figure with a
 * simple bow; the player is a paper cut-out with a yellow shirt (room-to-invent's `figure()` pictogram, bible §1c.4); the coach is a navy
 * figure; the ball is a paper football with a navy hollow-pentagon seam net (no filled pentagons); arrows are navy with red fletching and
 * every landed arrow gets a paper ring. Inks yellow → red → blue → navy on cream. Drawn objects on twos, camera on ones, everything seeded;
 * scenes read only t and the SceneContext. */
import type {Sheet} from '../sheet';
import {type RisoStory,type Scene,playChapters} from '../story';
import {apertureDisc} from '../passage';
import {TAU,twos,twosIndex,sm,easeOut,easeIO,easeIn,easeOutBack,key,anticipate,settle,smearPose,clamp,lerp,rng,hash,blob,polyPath,ribbon,smoothPts,rectPath,arc,type Pt,type Key} from '../motion';
import {dust,speedLines,handCut,crescent,goalFrame,ring,confetti,tornRect} from '../shapes';

const CH='/stories/narration/9v9/pick-a-purpose/';
const K='navy',R='red',B='blue',Y='yellow';
const L2=(a:Pt,b:Pt,u:number):Pt=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)];
/** View factor: landscape safe regions (desktop 793 × 625 u) pull back (.74) so the tall figures clear the band; phones (portrait) come closer (1.2). */
const land=(s:Sheet,landZ=.74)=>s.safe.w/s.safe.h>1.2?landZ:1.2;
/** Camera through [t,x,y,zoom] keys (each segment eased) with the view factor; dx = shake; landDy shifts the world on landscape. */
function cam(s:Sheet,t:number,keys:Key[],dx=0,landDy=-30,landZ=.74){const v=key(t,keys,easeIO,true),L=land(s,landZ),short=s.W>s.H&&L>=1;s.camera(v[0]+dx,v[1]+(L<1?landDy:0)+(short?70:0),(v[2]??1)*L,0);return v;}

// ---------------- abstract riso figure (bible §1c.4) — room-to-invent's pictogram ----------------
type Pose='stand'|'scan'|'run'|'arms'|'up'|'slump'|'step'|'listen'|'crouch'|'kick'|'point'|'aim';
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
 point:{tilt:.05,head:[.02,0],legF:[.14,0],legB:[-.14,0],armF:[.52,-.16],armB:[-.2,.27],hip:0},
 aim:{tilt:0,head:[.02,0],legF:[.16,0],legB:[-.16,0],armF:[.46,-.1],armB:[.1,-.06],hip:0},
};
type FigOpts={ink?:string;line?:string;seed?:number;face?:1|-1;look?:number;k?:number;cov?:number;reach?:Pt;reachB?:Pt;foot?:Pt;shade?:string;knock?:boolean;lift?:number;sx?:number;shirt?:string;boot?:string;rot?:number};
/** A cut-paper player: a big head disc, a torn torso block (filled with `shirt` ink when given), two leg strokes, two arm strokes — 5–8 plate ops.
 * (x,y) = ground point, h = height, face = +1 looks right. ink 'paper' = paper body + navy contour; an ink = that ink knocked out beneath.
 * `boot` paints a boot in that ink on the front foot; `rot` turns the whole figure about the ground point. */
function figure(s:Sheet,x:number,y:number,h:number,pose:Pose,o:FigOpts={}):{head:Pt;hand:Pt;handB:Pt;chest:Pt;foot:Pt;R:number}{
 const{ink='paper',line=K,seed=1,face=1,look=0,k=1,cov=.92,reach,reachB,foot,shade,knock=true,lift=0,sx=1,shirt,boot,rot=0}=o;
 const base=POSES.stand,p=POSES[pose],L=(a:number,b:number)=>lerp(a,b,k),LP=(a:Pt,b:Pt):Pt=>[lerp(a[0],b[0],k),lerp(a[1],b[1],k)];
 const tilt=L(base.tilt,p.tilt),head=LP(base.head,p.head),legF=LP(base.legF,p.legF),legB=LP(base.legB,p.legB),armF=LP(base.armF,p.armF),armB=LP(base.armB,p.armB),hip=L(base.hip,p.hip);
 const R=h*.16,tw=h*.3*sx,th=h*.38,legL=h*.3,hipY=-legL+hip*h,ca=Math.cos(tilt),sa=Math.sin(tilt);
 const cr=Math.cos(rot),sr=Math.sin(rot);
 const W=(lx:number,ly:number):Pt=>{const px=lx*face,py=ly;return[x+px*cr-py*sr,y+px*sr+py*cr];};
 const T=(lx:number,ly:number):Pt=>[lx*ca-ly*sa,hipY+lx*sa+ly*ca];
 const corners=[T(-tw/2,0),T(tw/2,0),T(tw/2,-th),T(-tw/2,-th)].map(q=>W(q[0],q[1]));
 const torsoPts=handCut(corners,seed,h*.02,h*.12),torso=polyPath(torsoPts,true);
 const shF=T(tw*.42,-th+R*.25),shB=T(-tw*.42,-th+R*.25);
 const hc=T(0,-th-R*1.05),headC=W(hc[0]+head[0]*h+look*R*.42,hc[1]+head[1]*h-lift*R),headPts=blob(headC[0],headC[1],R,R*.96,seed+2,{amp:.05,n:30});
 const headPath=polyPath(headPts,true),cc=T(0,-th/2),chest=W(cc[0],cc[1]);
 const hipF=W(tw*.18,hipY),hipB=W(-tw*.18,hipY);
 const fF=foot?foot:W(legF[0]*h,legF[1]*h),fB=W(legB[0]*h,legB[1]*h);
 const aF=reach?reach:W(shF[0]+armF[0]*h,shF[1]+armF[1]*h),aB=reachB?reachB:W(shB[0]+armB[0]*h,shB[1]+armB[1]*h);
 if(h<8)return{head:headC,hand:aF,handB:aB,chest,foot:fF,R};
 const limbs=new Path2D();
 limbs.addPath(ribbon([hipF,fF],h*.08,{seed:seed+3,pressure:.4,taper:.25,wobble:1.4}));limbs.addPath(ribbon([hipB,fB],h*.08,{seed:seed+4,pressure:.4,taper:.25,wobble:1.4}));
 limbs.addPath(ribbon([W(shB[0],shB[1]),aB],h*.062,{seed:seed+5,pressure:.4,taper:.35,wobble:1.4}));limbs.addPath(ribbon([W(shF[0],shF[1]),aF],h*.062,{seed:seed+6,pressure:.4,taper:.35,wobble:1.4}));
 const body=new Path2D();body.addPath(torso);body.addPath(headPath);
 const outline=new Path2D();outline.addPath(ribbon(torsoPts,Math.max(4,h*.02),{seed:seed+7,close:true,pressure:.6,wobble:1.6,gaps:[[.62,.66]]}));outline.addPath(ribbon(headPts,Math.max(4,h*.02),{seed:seed+8,close:true,pressure:.6,wobble:1.4}));
 if(ink==='paper'){if(knock)s.knockout(body,cov);if(shirt)s.fill(shirt,torso,.95);s.fill(line,limbs);s.fill(line,outline);}
 else{const all=new Path2D();all.addPath(body);all.addPath(limbs);if(knock)s.knockout(all);s.fill(ink,all,cov);s.fill(line,outline,.9);}
 if(shade){const sh=new Path2D();sh.addPath(crescent(headC[0],headC[1],R*.98,[-.35*face,-.4]));if(!shirt)sh.addPath(polyPath([corners[0],[lerp(corners[1][0],corners[0][0],.5),lerp(corners[1][1],corners[0][1],.5)],[lerp(corners[2][0],corners[3][0],.5),lerp(corners[2][1],corners[3][1],.5)],corners[3]],true));s.tone(shade,sh,.45);}
 if(boot){const bp=polyPath(blob(fF[0]+face*h*.03,fF[1]-h*.02,h*.085,h*.05,seed+9,{amp:.06,n:16}),true);s.knockout(bp,.95);s.fill(boot,bp,.95);s.fill(line,ribbon(blob(fF[0]+face*h*.03,fF[1]-h*.02,h*.085,h*.05,seed+9,{amp:.06,n:16}),Math.max(3,h*.012),{seed:seed+10,close:true,wobble:1}),.9);}
 return{head:headC,hand:aF,handB:aB,chest,foot:fF,R};
}
const FIG=640;
/** The player: paper head, yellow shirt, navy limbs, a blue shade on the head. */
const kid=(s:Sheet,x:number,y:number,pose:Pose,o:FigOpts={})=>figure(s,x,y,FIG,pose,{seed:41,shirt:Y,shade:B,...o});
/** A kicking figure: swing>0 blends the kick pose with the front foot at `target` (negative swing = the foot winds back). */
function kicker(s:Sheet,x:number,y:number,h:number,swing:number,target:Pt,o:FigOpts={}){const k=clamp(swing),f=o.face??1;return figure(s,x,y,h,'kick',{...o,k:k+.15,foot:[lerp(x+f*h*.12,target[0],k)+(swing<0?swing*h*.25*f:0),lerp(y,target[1],k)]});}
/** walk cycle pose on the twos grid */
const stride=(t:number):Pose=>twosIndex(t)%2?'run':'step';

// ---------------- the world: hedge, pitch, cone wall, grass tufts ----------------
const HZ=-300,KY=250,GS=.42;
type World={seed:number;goalX?:number;goalW?:number;cones?:boolean};
/** A red paper cone: paper knocked out beneath, red body, a paper stripe, navy contour; (x,y) = base centre; lean = rotation about the base. */
function cone(s:Sheet,x:number,y:number,h:number,seed:number,o:{lean?:number;sc?:number}={}){
 const{lean=0,sc=1}=o;if(sc<.03)return;const w=h*.78;
 s.save();s.translate(x,y);s.rotate(lean);s.scale(sc,sc);
 const pts=handCut([[-w/2,0],[w/2,0],[w*.09,-h],[-w*.09,-h]],seed,h*.02,h*.3),body=polyPath(pts,true);
 s.tone(K,polyPath(blob(0,4,w*.62,w*.62*GS,seed+1,{amp:.06,n:16}),true),.3);
 s.knockout(body,.95);s.fill(R,body,.95);
 s.knockout(polyPath([[-w*.33,-h*.45],[w*.33,-h*.45],[w*.27,-h*.6],[-w*.27,-h*.6]],true),.9);
 s.fill(K,ribbon(pts,Math.max(3,h*.03),{seed:seed+2,close:true,pressure:.5,wobble:1.2}),.9);
 s.restore();
}
/** The training ground: cream sky with faint yellow, red fletch confetti, a navy torn hedge on the horizon, the green pitch with mown bands and
 * paper lines, a far goal, the red cone wall along the far side, and a torn hand-cut grass-tuft band across the near edge. */
function world(s:Sheet,o:World){
 const{seed,goalX=-320,goalW=230,cones=true}=o;
 s.field(Y,.1,.3);
 confetti(s,[R],[-1600,-980,3200,560],12,seed+1,{size:30,cov:.7});
 // the pitch: yellow × blue = green, foreshortened navy mown bands, paper lines
 const gnd=rectPath(-1800,HZ-6,3600,2600);s.tone(Y,gnd,.8);s.tone(B,gnd,.45);
 const mow=new Path2D();for(let k=0;k<7;k++){const y0=HZ+24+k*k*9+k*26,y1=y0+10+k*7;mow.rect(-1800,y0,3600,y1-y0);}s.tone(K,mow,.1);
 const lines=new Path2D();lines.addPath(ribbon([[-1700,HZ+74],[1700,HZ+78]],8,{seed:seed+2,pressure:.3,taper:0,wobble:1.4,step:90}));lines.addPath(ribbon([[-1700,KY+30],[1700,KY+34]],12,{seed:seed+3,pressure:.3,taper:0,wobble:1.6,step:90}));s.knockout(lines,.9);
 // the hedge: a navy torn band with a lighter blue top
 const hedge=tornRect(-1800,HZ-84,3600,92,seed+4,14);s.tone(K,hedge,.75);s.tone(B,tornRect(-1800,HZ-88,3600,34,seed+5,10),.5);
 // the far goal on the horizon
 {const gh=goalW*.4,gy=HZ+62-gh,d=goalW*.14;s.knockout(polyPath([[goalX,gy],[goalX+goalW,gy],[goalX+goalW+d*.5,gy+d*.4],[goalX+goalW+d*.5,gy+gh+d*.4],[goalX-d*.5,gy+gh+d*.4],[goalX-d*.5,gy+d*.4]],true),.95);goalFrame(s,K,goalX,gy,goalW,gh,{depth:d,net:B,seed:seed+6,bar:9});}
 // the cone wall along the far side
 if(cones){const rr=rng(seed+7),body=new Path2D(),stripe=new Path2D(),sh=new Path2D();
  for(let i=0;i<7;i++){const x=-720+i*240+(rr()-.5)*30,y=HZ+112+(rr()-.5)*6,h=54,w=h*.8;body.addPath(polyPath(handCut([[x-w/2,y],[x+w/2,y],[x+w*.1,y-h],[x-w*.1,y-h]],seed+8+i,1.5,20),true));stripe.rect(x-w*.32,y-h*.6,w*.64,h*.14);sh.addPath(polyPath(blob(x,y+3,w*.6,w*.25,seed+20+i,{amp:.06,n:12}),true));}
  s.tone(K,sh,.3);s.knockout(body,.95);s.fill(R,body,.95);s.knockout(stripe,.9);}
 // the grass tufts across the near edge: a torn band of hand-cut blades, darker green
 const tufts:Pt[]=[[-1800,KY+140]];const rr=rng(seed+9);for(let x=-1800;x<=1800;x+=44){const j=rr();tufts.push([x,KY+118+j*10]);tufts.push([x+22,KY+60-j*36]);}tufts.push([1800,KY+140]);tufts.push([1800,2600]);tufts.push([-1800,2600]);
 const tuft=polyPath(tufts,true);s.tone(B,tuft,.6);s.tone(K,tuft,.2);
 const deep:Pt[]=[[-1800,KY+330]];const r2=rng(seed+10);for(let x=-1800;x<=1800;x+=52){const j=r2();deep.push([x,KY+318+j*12]);deep.push([x+26,KY+250-j*44]);}deep.push([1800,KY+330]);deep.push([1800,2600]);deep.push([-1800,2600]);
 s.tone(K,polyPath(deep,true),.3);
}
/** The ball: a paper sphere with a navy hollow-pentagon seam net (no filled panels), a warm yellow shade crescent, a navy rim. */
function ball(s:Sheet,x:number,y:number,r:number,seed:number,o:{sx?:number;sy?:number;smear?:{dir:number;amount:number};rot?:number}={}){
 const{sx=1,sy=1,smear,rot=0}=o;let pts=blob(x,y,r*sx,r*sy,seed,{amp:.03,n:36});if(smear&&smear.amount>0)pts=smearPose(pts,smear.dir,smear.amount,[x,y]);
 const disc=polyPath(pts,true);s.knockout(disc);
 s.save();s.clip(disc);
 s.tone(Y,crescent(x,y,r*1.02*Math.max(sx,sy),[-.4,-.45]),.45);
 const seam=new Path2D(),pent:Pt[]=[];for(let i=0;i<5;i++){const a=rot-Math.PI/2+i/5*TAU;pent.push([x+Math.cos(a)*r*.34*sx,y+Math.sin(a)*r*.34*sy]);}
 seam.addPath(ribbon(pent,Math.max(2.5,r*.06),{seed:seed+3,close:true,pressure:.4,wobble:r*.012,step:8}));
 for(let i=0;i<5;i++){const a=rot-Math.PI/2+i/5*TAU;seam.addPath(ribbon([[x+Math.cos(a)*r*.34*sx,y+Math.sin(a)*r*.34*sy],[x+Math.cos(a)*r*1.02*sx,y+Math.sin(a)*r*1.02*sy]],Math.max(2.5,r*.06),{seed:seed+4+i,taper:.2,wobble:1}));}
 s.fill(K,seam,.92);
 s.restore();
 s.fill(K,ribbon(pts,Math.max(3,r*.075),{seed:seed+1,close:true,pressure:.5,wobble:r*.02}),.9);
}
/** Ball flight a→b from t0 over dur: [x, y, squash-settle, smear]. */
function flight(tt:number,t0:number,dur:number,a:Pt,b:Pt,o:{lift?:number;smear?:number;e?:(u:number)=>number}={}):[number,number,number,number]{
 const{lift=0,smear=30,e=easeOut}=o,u=sm(t0,t0+dur,tt,e),p=lift?arc(a,b,u,lift):L2(a,b,u);
 return[p[0],p[1],tt>=t0+dur?.07*settle(tt,t0+dur,{amp:1,freq:5,decay:5,phase:Math.PI/2}):0,u>0&&u<1?smear:0];}
/** A dust puff on the grass (a foreshortened ellipse of paper speckle) growing and fading over 1.2 s. size 1 ≈ 320 u wide. */
const puff=(s:Sheet,x:number,y:number,age:number,seed:number,size=1)=>{if(age<0||age>1.2)return;const r=(60+260*easeOut(clamp(age/.9)))*size,cov=.85*(1-clamp(age/1.2));s.save();s.translate(x,y);s.scale(1,GS);dust(s,null,0,0,r,Math.round(22*size),{seed,size:14*size,cov:Math.max(.1,cov),spread:1});s.restore();};
/** A yellow spark burst (paper beneath so yellow prints clean on the green), popping then fading. */
const spark=(s:Sheet,x:number,y:number,age:number,seed:number,r=120)=>{if(age<0)return;const g=easeOutBack(clamp(age/.4))*(1-clamp((age-.9)/.6));if(g<=0)return;const rr=rng(seed),p=new Path2D();for(let i=0;i<8;i++){const a=i/8*TAU+(rr()-.5)*.3,r0=r*.45,r1=r*(.8+rr()*.5)*g;p.addPath(ribbon([[x+Math.cos(a)*r0,y+Math.sin(a)*r0],[x+Math.cos(a)*r1,y+Math.sin(a)*r1]],r*.12*(.7+rr()*.6),{seed:seed+i,taper:.8,pressure:.4,wobble:.8}));}s.knockout(p,.95);s.fill(Y,p,.95);};
/** Ground shadow ellipse under something standing. */
const shadow=(s:Sheet,x:number,y:number,rx:number,seed:number,cov=.3)=>s.tone(K,polyPath(blob(x,y,rx,rx*GS,seed,{amp:.06,n:16}),true),cov);

// ---------------- the target, arrows, the bow, the sight line ----------------
/** The archery target: paper disc, blue outer ring, red ring, yellow centre (centre = its radius fraction), navy contour rings, on a navy
 * A-frame stand down to `stand` (ground y). sc scales it about its foot (rising), sq squashes it (an impact). */
function target(s:Sheet,x:number,y:number,r:number,seed:number,o:{sc?:number;centre?:number;stand?:number;sq?:number}={}){
 const{sc=1,centre=.38,stand,sq=0}=o;if(sc<.03)return;const foot=stand??y+r*1.2;
 s.save();s.translate(x,foot);s.scale(sc*(1+sq),sc*(1-sq));s.translate(-x,-foot);
 if(stand!==undefined){shadow(s,x,stand+6,r*.8,seed+9,.3);
  const legs=new Path2D();legs.addPath(ribbon([[x-r*.3,y+r*.55],[x-r*.62,stand]],r*.07,{seed,pressure:.3,taper:.1,wobble:1.2,step:30}));legs.addPath(ribbon([[x+r*.3,y+r*.55],[x+r*.62,stand]],r*.07,{seed:seed+1,pressure:.3,taper:.1,wobble:1.2,step:30}));
  const by=lerp(y+r*.55,stand,.55);legs.addPath(ribbon([[x-r*.5,by],[x+r*.5,by]],r*.05,{seed:seed+2,taper:.1,wobble:1,step:30}));s.fill(K,legs,.95);}
 const disc=polyPath(blob(x,y,r,r,seed+3,{amp:.02,n:48}),true);s.knockout(disc);
 s.fill(B,ring(x,y,r*.68,r*.985),.95);
 s.fill(R,ring(x,y,r*centre,r*.68),.95);
 s.fill(Y,polyPath(blob(x,y,r*centre,r*centre,seed+4,{amp:.02,n:32}),true),.95);
 const lines=new Path2D();for(const rr of[r*.985,r*.68,r*centre])lines.addPath(ribbon(blob(x,y,rr,rr,seed+5,{amp:.01,n:48}),Math.max(3,r*.028),{seed:seed+6,close:true,pressure:.4,wobble:r*.006,step:10}));
 s.fill(K,lines,.9);
 s.restore();
}
type Arrow={x:number;y:number;a:number;len?:number;ring?:number};
/** Arrows: (x,y) = the tip, a = the direction it points (radians); navy shaft + head, red fletching, a paper ring of `ring` 0..1 around the tip. */
function arrows(s:Sheet,list:Arrow[]){
 const navy=new Path2D(),red=new Path2D(),rings=new Path2D();let anyRing=false;
 for(const ar of list){const L=ar.len??220,ux=Math.cos(ar.a),uy=Math.sin(ar.a),nx=-uy,ny=ux,tip:Pt=[ar.x,ar.y],tail:Pt=[ar.x-ux*L,ar.y-uy*L];
  const P=(d:number,n:number):Pt=>[tail[0]+ux*d+nx*n,tail[1]+uy*d+ny*n];
  navy.addPath(ribbon([tail,P(L*.88,0)],L*.07,{seed:Math.round(ar.x+ar.y),taper:.15,pressure:.3,wobble:1,step:20}));
  navy.addPath(polyPath([tip,P(L*.82,L*.075),P(L*.87,0),P(L*.82,-L*.075)],true));
  red.addPath(polyPath([P(0,0),P(L*.03,L*.13),P(L*.24,L*.035),P(L*.24,0)],true));red.addPath(polyPath([P(0,0),P(L*.03,-L*.13),P(L*.24,-L*.035),P(L*.24,0)],true));
  if(ar.ring&&ar.ring>.02){const rr=L*.24*ar.ring,w=Math.min(L*.05,rr*.6);if(rr>2){anyRing=true;rings.addPath(ring(tip[0],tip[1],rr-w,rr));}}}
 if(anyRing)s.knockout(rings,.95);s.fill(K,navy,.95);s.fill(R,red,.95);
}
/** Fletch centre of an arrow (for the seam aperture). */
const fletchOf=(ar:Arrow):Pt=>{const L=ar.len??220;return[ar.x-Math.cos(ar.a)*L*.89,ar.y-Math.sin(ar.a)*L*.89];};
/** The bow at grip (gx,gy) pointing along ang (0 = right, −π/2 = up): a navy limb bowing forward, a string pulled back by draw 0..1, an arrow on the string. */
function bow(s:Sheet,gx:number,gy:number,ang:number,draw:number,seed:number,o:{arrow?:boolean}={}){
 const{arrow=true}=o;s.save();s.translate(gx,gy);s.rotate(ang);
 const limb=smoothPts([[-30,-210],[14,-110],[36,0],[14,110],[-30,210]],false,8);
 s.fill(K,ribbon(limb,17,{seed,pressure:.5,taper:.35,wobble:1.2,step:12}),.95);
 const nock:Pt=[-36-draw*150,0],str=new Path2D();str.moveTo(-30,-210);str.lineTo(nock[0],nock[1]);str.lineTo(-30,210);s.stroke(K,str,4,.9);
 if(arrow)arrows(s,[{x:nock[0]+250,y:0,a:0,len:250}]);
 s.restore();
}
/** A paper-dotted sight line with yellow inside, from a to b, drawing on with progress. */
function sight(s:Sheet,a:Pt,b:Pt,progress:number,seed:number){
 if(progress<=0)return;const L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(2,Math.round(L/46)),p=new Path2D();
 for(let i=0;i<=n;i++){const u=i/n;if(u>progress)break;const q=L2(a,b,u);p.addPath(polyPath(blob(q[0],q[1],11,11,seed+i,{amp:.08,n:10}),true));}
 s.knockout(p,.95);s.fill(Y,p,.95);
}

// ---------------- the clock, the cards, the tally ----------------
/** A paper training clock on a navy post: disc, 12 ticks, a long minute hand and a short hour hand (turns 0..1), a red centre pin. */
function clock(s:Sheet,x:number,y:number,r:number,seed:number,minute:number,hour:number){
 const post=new Path2D();post.addPath(ribbon([[x,y+r*.9],[x,KY]],r*.12,{seed,pressure:.2,taper:0,wobble:1,step:60}));post.addPath(polyPath([[x-r*.36,KY],[x+r*.36,KY],[x+r*.3,KY+16],[x-r*.3,KY+16]],true));
 shadow(s,x,KY+10,r*.5,seed+1,.3);s.fill(K,post,.95);
 const pts=blob(x,y,r,r,seed+2,{amp:.02,n:44}),disc=polyPath(pts,true);s.knockout(disc,.95);
 const marks=new Path2D();marks.addPath(ribbon(pts,Math.max(4,r*.05),{seed:seed+3,close:true,pressure:.5,wobble:1.4,step:10}));
 for(let i=0;i<12;i++){const a=i/12*TAU,big=i%3===0,r0=r*(big?.72:.82),r1=r*.9;marks.addPath(ribbon([[x+Math.cos(a)*r0,y+Math.sin(a)*r0],[x+Math.cos(a)*r1,y+Math.sin(a)*r1]],r*(big?.05:.035),{seed:seed+4+i,taper:.2,wobble:.8}));}
 const am=-Math.PI/2+minute*TAU,ah=-Math.PI/2+hour*TAU;
 marks.addPath(ribbon([[x-Math.cos(am)*r*.12,y-Math.sin(am)*r*.12],[x+Math.cos(am)*r*.78,y+Math.sin(am)*r*.78]],r*.06,{seed:seed+20,pressure:.4,taper:.5,wobble:1}));
 marks.addPath(ribbon([[x-Math.cos(ah)*r*.1,y-Math.sin(ah)*r*.1],[x+Math.cos(ah)*r*.5,y+Math.sin(ah)*r*.5]],r*.075,{seed:seed+21,pressure:.4,taper:.5,wobble:1}));
 s.fill(K,marks,.92);
 s.fill(R,polyPath(blob(x,y,r*.07,r*.07,seed+22,{amp:.05,n:12}),true),.95);
}
type CardKind='touch'|'foot'|'shoot';
/** A small paper boot (toe toward `face`), as a path about (x,y). */
const bootPts=(x:number,y:number,L:number,face:1|-1,seed:number):Pt[]=>handCut([[x-L*.5*face,y-L*.32],[x-L*.5*face,y+L*.1],[x-L*.3*face,y+L*.22],[x+L*.5*face,y+L*.2],[x+L*.5*face,y+L*.02],[x+L*.05*face,y-L*.1],[x-L*.18*face,y-L*.32]],seed,L*.02,L*.3);
/** A paper card (150 × 190 about its centre) with a navy contour and the mark: first touch (a ball and a boot), weaker foot (a yellow LEFT boot), shooting (a goal and a ball). */
function card(s:Sheet,x:number,y:number,kind:CardKind,seed:number,o:{sc?:number;sx?:number;rot?:number;cov?:number;glow?:number}={}){
 const{sc=1,sx=1,rot=0,cov=.95,glow=0}=o;if(sc<.03||sx<.03)return;
 s.save();s.translate(x,y);s.rotate(rot);s.scale(sc*sx,sc);
 const pts=handCut([[-92,-118],[92,-118],[92,118],[-92,118]],seed,3,70),path=polyPath(pts,true);
 s.knockout(path,cov);if(glow>0)s.tone(Y,path,.45*glow);
 s.fill(K,ribbon(pts,6,{seed:seed+1,close:true,pressure:.5,wobble:1.2}),.92);
 s.save();s.scale(1.24,1.24);
 const line=new Path2D();
 if(kind==='touch'){line.addPath(ribbon(blob(14,-28,26,26,seed+2,{amp:.03,n:20}),5,{seed:seed+3,close:true,wobble:.8}));const q:Pt[]=[];for(let i=0;i<5;i++){const a=-Math.PI/2+i/5*TAU;q.push([14+Math.cos(a)*9,-28+Math.sin(a)*9]);}line.addPath(ribbon(q,3,{seed:seed+4,close:true,wobble:.5}));
  line.addPath(polyPath(bootPts(-6,44,92,1,seed+5),true));line.addPath(ribbon([[-40,-56],[-52,-24],[-32,4]],5,{seed:seed+6,taper:.4,wobble:.8}));}
 else if(kind==='foot'){const bp=polyPath(bootPts(0,8,120,-1,seed+2),true);s.fill(Y,bp,.95);line.addPath(ribbon(bootPts(0,8,120,-1,seed+2),5,{seed:seed+3,close:true,pressure:.5,wobble:1}));line.addPath(ribbon([[-22,-8],[-6,-22],[10,-8]],4,{seed:seed+4,taper:.3,wobble:.6}));}
 else{line.addPath(ribbon([[-52,10],[-52,-50],[52,-50],[52,10]],6,{seed:seed+2,pressure:.3,wobble:1}));const net=new Path2D();for(let i=-2;i<=2;i++)net.addPath(ribbon([[i*20,-46],[i*20,6]],2,{seed:seed+8+i,wobble:.4}));line.addPath(net);
  line.addPath(ribbon(blob(6,46,22,22,seed+3,{amp:.03,n:18}),5,{seed:seed+4,close:true,wobble:.8}));line.addPath(ribbon([[6,26],[6,-8]],4,{seed:seed+5,taper:.5,wobble:.6}));}
 s.fill(K,line,.92);
 s.restore();
 s.restore();
}
/** The tally card: a paper card with n tally marks (4 sticks + a slash per five). g 0..1 pops the card; the last mark scales in with `last`. */
function tally(s:Sheet,x:number,y:number,n:number,seed:number,g=1,last=1){
 if(g<=.03)return;s.save();s.translate(x,y);s.scale(g,g);
 const pts=handCut([[-150,-85],[150,-85],[150,85],[-150,85]],seed,3,80),path=polyPath(pts,true);s.knockout(path,.95);
 const line=new Path2D();line.addPath(ribbon(pts,6,{seed:seed+1,close:true,pressure:.5,wobble:1.2}));
 for(let i=0;i<n;i++){const grp=Math.floor(i/5),j=i%5,gx=-112+grp*140,sc=i===n-1?last:1;if(sc<=.03)continue;
  const m=j<4?ribbon([[gx+j*26,-48],[gx+j*26+4,48]],13,{seed:seed+9+i,pressure:.5,taper:.3,wobble:1.2}):ribbon([[gx-14,36],[gx+96,-40]],13,{seed:seed+9+i,pressure:.5,taper:.3,wobble:1.2});
  if(sc<1){s.save();const cx=gx+(j<4?j*26:40);s.translate(cx,0);s.scale(sc,sc);s.translate(-cx,0);s.fill(K,m,.92);s.restore();}else line.addPath(m);}
 s.fill(K,line,.92);
 s.restore();
}
/** The card rail: a navy bar on two posts. */
function rail(s:Sheet,x0:number,x1:number,y:number,seed:number){
 const p=new Path2D();p.addPath(ribbon([[x0,y],[x1,y]],14,{seed,pressure:.3,taper:0,wobble:1.2,step:60}));
 for(const x of[x0+30,x1-30]){p.addPath(ribbon([[x,y],[x,KY+6]],12,{seed:seed+1,taper:0,wobble:1,step:50}));}
 shadow(s,x0+30,KY+10,40,seed+2,.25);shadow(s,x1-30,KY+10,40,seed+3,.25);s.fill(K,p,.95);
}

// ---------------- chapter 1 (8.8 s): kicking the ball around; the clock sweeps an hour; back where they started ----------------
const PX1=-150,CLK:Pt=[330,-60];
const BR=70;
const ch1:Scene={
 draw(s,t){
  const tt=twos(t);
  cam(s,t,[[0,0,-120,.92],[2.03,60,-110,.95],[3.72,20,-100,1.0],[5.07,120,-140,1.02],[6.59,-60,-90,1.06],[8.8,-80,-80,1.08]]);
  world(s,{seed:11,goalX:-30,goalW:160});
  const minute=sm(5.1,6.5,t,easeIO)+.02*settle(t,6.5,{amp:1,freq:3,decay:4}),hour=sm(5.1,6.5,t,easeIO)/12;
  clock(s,CLK[0],CLK[1],150,12,minute,hour);
  // the player's wander: kicks at .9, 2.15, 3.85, 5.5; walks after the ball between them; back at the start by 6.5
  const kx=key(tt,[[1.3,PX1],[2.0,140,easeIO],[2.7,140],[3.5,-200,easeIO],[4.3,-200],[4.9,-40,easeIO],[5.9,-40],[6.5,PX1,easeIO]]);
  const walking=(tt>1.3&&tt<2.0)||(tt>2.7&&tt<3.5)||(tt>4.3&&tt<4.9)||(tt>5.9&&tt<6.5);
  const facing:1|-1=(tt>=2.15&&tt<3.85)||(tt>=5.5)?-1:1;
  // the ball
  let bp:Pt=[PX1+80,KY+8],sq=0,smear=0,dir=0,rot=0;
  const k1=flight(tt,.9,.55,[PX1+80,KY+8],[220,KY+8],{smear:26});if(tt>=.9){bp=[k1[0],k1[1]];sq=k1[2];smear=k1[3];dir=0;}
  const k2=flight(tt,2.15,.6,[220,KY+8],[-120,KY+30],{lift:120,smear:20});if(tt>=2.15){bp=[k2[0],k2[1]];sq=k2[2];smear=k2[3];dir=Math.PI;}
  const k3=flight(tt,3.85,.8,[-120,KY+30],[40,KY+8],{lift:260,smear:0});if(tt>=3.85){bp=[k3[0],k3[1]];sq=k3[2];smear=k3[3];dir=0;if(tt>=4.65&&tt<5.1){const u=sm(4.65,5.1,tt,easeOut);bp=[40+30*u,KY+8-70*Math.sin(u*Math.PI)];}}
  const k4=flight(tt,5.5,.55,[70,KY+8],[PX1+80,KY+8],{smear:24});if(tt>=5.5){bp=[k4[0],k4[1]];sq=k4[2];smear=k4[3];dir=Math.PI;}
  rot=(bp[0]-PX1-80)/BR;
  // the figure
  const kicks:[number,Pt][]=[[.9,[220,KY+8]],[2.15,[-120,KY+30]],[3.85,[40,KY+8]],[5.5,[PX1+80,KY+8]]];
  let drawn=false;
  for(const [t0,tg] of kicks){if(tt>=t0-.25&&tt<t0+.3){const sw=anticipate(t0-.25,t0,tt,{back:.5,hold:.6,e:easeIn}),f:1|-1=tg[0]>=kx?1:-1;kicker(s,kx,KY,FIG,sw,[bp[0]-f*20,bp[1]],{seed:41,face:f,shirt:Y,shade:B});drawn=true;break;}}
  if(!drawn){
   if(walking)kid(s,kx,KY,stride(t),{face:facing,k:.9});
   else if(tt>=6.59){const shrug=.35*easeOutBack(sm(6.65,6.95,tt))+.06*settle(tt,6.95,{amp:1,freq:2.5,decay:1.2});kid(s,kx,KY,'arms',{face:1,k:Math.max(0,shrug),lift:.3*sm(6.65,6.95,tt)});}
   else kid(s,kx,KY,tt>=5.07?'scan':'stand',{face:facing,k:1,look:tt>=5.07&&tt<6.5?.6:0});
  }
  if(smear>0)speedLines(s,K,bp[0],bp[1],dir,{n:4,seed:31,len:80,width:5,cov:.7});
  ball(s,bp[0],bp[1],BR,7,{sx:1+sq,sy:1-sq,rot});
  puff(s,220,KY+16,tt-1.45,32,.7);puff(s,-120,KY+40,tt-2.75,33,.7);puff(s,40,KY+16,tt-4.65,34,.9);puff(s,PX1+80,KY+16,tt-6.05,35,.6);
 },
 aperture(){return apertureDisc(PX1+80,KY+8,26,12);},
 still:7.4,
};

// ---------------- chapter 2 (8.5 s): the archer — a shot into the sky, the target rises, aim, release, look ----------------
const AX=-250,TX=330,TR=230,TY=KY-290;
const IMP:Arrow={x:TX-100,y:TY-40,a:.12};
const ch2:Scene={
 draw(s,t){
  const tt=twos(t);
  const shake=settle(t,6.2,{amp:10,freq:7,decay:5});
  cam(s,t,[[0,-100,-120,.95],[1.47,-60,-160,.97],[3.75,60,-120,1.0],[5.05,80,-110,1.02],[5.87,140,-110,1.05],[8.5,200,-110,1.1]],shake);
  world(s,{seed:12,goalX:-110,goalW:160});
  // the target rises at 3.8
  const rise=easeOutBack(sm(3.8,4.35,tt)),sq=tt>=6.2?.05*settle(tt,6.2,{amp:1,freq:5,decay:5,phase:Math.PI/2}):0;
  target(s,TX,TY,TR,50,{sc:rise,stand:KY+10,sq});
  if(tt>=4.3&&tt<5.5){puff(s,TX-120,KY+16,tt-4.3,51,.9);puff(s,TX+120,KY+16,tt-4.32,52,.9);}
  // the archer: stand → sky shot (arms up) → hope (head up) → aim level → release → walk → look
  const walk=sm(6.5,7.4,tt,easeIO),ax=lerp(AX,TX-330,walk);
  const upK=sm(1.4,1.6,tt,easeOut)*(1-sm(2.7,3.3,tt,easeIO)),aimK=sm(4.9,5.1,tt,easeOut)*(1-sm(6.35,6.6,tt,easeIO));
  const drawSky=key(tt,[[1.5,0],[1.85,1,easeIn],[1.86,0]])-.15*settle(tt,1.86,{amp:1,freq:6,decay:6});
  const drawAim=key(tt,[[5.05,0],[5.18,-.1,easeIn],[5.55,1,easeOut],[5.9,1],[5.91,0]])-.15*settle(tt,5.91,{amp:1,freq:6,decay:6});
  const shoulder=KY-435;
  let fig;
  if(upK>0){const g:Pt=[ax+150*upK,shoulder-250*upK+40],d:Pt=[ax+10-Math.max(0,drawSky)*40,shoulder-90*upK+40];fig=figure(s,ax,KY,FIG,'aim',{ink:B,seed:23,face:1,shade:K,k:upK,reach:g,reachB:d,lift:.5*sm(1.9,2.4,tt)*(1-sm(3.6,4.2,tt)),look:.3});
   bow(s,g[0],g[1],-1.15,Math.max(0,drawSky),24,{arrow:tt<1.86});}
  else if(aimK>0){const g:Pt=[ax+300*aimK,shoulder+40-40*aimK],d:Pt=[ax+70-Math.max(0,drawAim)*60,shoulder+40-30*aimK];fig=figure(s,ax,KY,FIG,'aim',{ink:B,seed:23,face:1,shade:K,k:aimK,reach:g,reachB:d,look:.5});
   bow(s,g[0],g[1],.02+Math.min(0,drawAim)*.6,Math.max(0,drawAim),25,{arrow:tt<5.91});
   sight(s,[g[0]+40,g[1]],[TX,TY],sm(5.1,5.5,tt,easeOut)*(1-sm(5.95,6.2,tt)),26);}
  else if(walk>0&&walk<1)fig=figure(s,ax,KY,FIG,stride(t),{ink:B,seed:23,face:1,shade:K,k:.9});
  else if(tt>=7.4)fig=figure(s,ax,KY,FIG,'listen',{ink:B,seed:23,face:1,shade:K,k:sm(7.4,7.8,tt,easeOut),look:.6,lift:.5*sm(7.4,7.8,tt)});
  else fig=figure(s,ax,KY,FIG,tt>=3.75?'scan':'stand',{ink:B,seed:23,face:1,shade:K,k:1,look:tt>=3.75?.6:tt>=.3?.2:0,lift:tt>=.3&&tt<1.4?.4:tt>=2.2?.5*(1-sm(3.6,4.2,tt)):0});
  if(!(upK>0)&&!(aimK>0)){const h=fig.hand;bow(s,h[0]+10,h[1]+20,.15,0,27,{arrow:false});}
  // the sky arrow: up and out at 1.86, back down at the right at 2.6–3.1, stuck in the grass
  if(tt>=1.86&&tt<2.3){const d=(tt-1.86)*3200;arrows(s,[{x:ax+150+Math.cos(-1.15)*d+80,y:shoulder-210+Math.sin(-1.15)*d,a:-1.15,len:250}]);}
  if(tt>=2.6){const u=sm(2.6,3.1,tt,easeIn),y=lerp(-1100,KY+6,u),wob=tt>=3.1?.2*settle(tt,3.1,{amp:1,freq:4,decay:4}):0;arrows(s,[{x:390+60*(1-u),y,a:Math.PI/2+.35+wob,len:250}]);if(tt>=3.1)puff(s,390,KY+16,tt-3.1,53,.8);}
  // the aimed arrow: flies 5.9–6.2 and thuds; the paper ring blooms at 7.45
  if(tt>=5.91){const u=sm(5.91,6.2,tt,easeIn),from:Pt=[ax+300+40,shoulder],tip=L2(from,[IMP.x,IMP.y],u);arrows(s,[{x:tip[0],y:tip[1],a:IMP.a,len:250,ring:easeOutBack(sm(7.45,7.8,tt))}]);
   if(u>0&&u<1)speedLines(s,K,tip[0]-120,tip[1],IMP.a,{n:4,seed:54,len:120,width:5,cov:.7});}
  spark(s,IMP.x,IMP.y-60,t-6.2,55,150);
 },
 aperture(){return apertureDisc(TX,TY,TR*.3,12);},
 still:6.9,
};

// ---------------- chapter 3 (9.3 s): the card rail — three cards, one is chosen and becomes a small target on the pitch ----------------
const PX3=-200,CX3=[100,310,520],RY=KY-280,CY3=RY-120,KINDS:CardKind[]=['touch','foot','shoot'],PIN:Pt=[200,KY-100];
const ch3:Scene={
 draw(s,t){
  const tt=twos(t);
  cam(s,t,[[0,140,-100,.98],[2.33,160,-110,1.0],[3.4,190,-120,1.02],[5.37,200,-130,1.05],[6.98,190,-120,1.07],[8.4,140,-60,1.1],[9.3,140,-50,1.12]]);
  world(s,{seed:13,goalX:-560});
  rail(s,CX3[0]-110,CX3[2]+110,RY,60);
  // the player walks to the rail, reaches, holds the chosen card
  const walk=sm(2.4,3.2,tt,easeIO),px=lerp(PX3,-60,walk),reachU=sm(3.45,3.85,tt,easeOut)*(1-sm(8.0,8.4,tt)),hand:Pt=[40,-150];
  let fig;
  if(walk>0&&walk<1)fig=kid(s,px,KY,stride(t),{face:1,k:.9});
  else if(reachU>0)fig=kid(s,px,KY,'point',{face:1,k:reachU*.8,reach:L2([px+130,KY-260],hand,reachU),look:.6*reachU,lift:.2*reachU});
  else fig=kid(s,px,KY,'stand',{face:1,k:1,look:tt>=8.0?.6:0});
  ball(s,px+80,KY+8,BR,8,{rot:(px-PX3)/BR});
  // the cards drop, hop, lift, fade, flip into the small target
  for(let i=0;i<3;i++){const t0=.2+i*.3,y=key(tt,[[t0,-1000],[t0+.4,CY3,easeIn]])+(tt>=t0+.4?30*settle(tt,t0+.4,{amp:1,freq:4,decay:5}):0);
   let cx=CX3[i],cy=Math.min(y,CY3+40),sc=1,sx=1,rot=0,cov=.95,glow=0;
   if(i===0){cy-=50*Math.sin(Math.PI*sm(5.4,5.75,tt))+10*settle(tt,5.75,{amp:1,freq:4,decay:5});}
   if(i!==1)cov=lerp(.95,.35,sm(7.2,7.7,tt));
   if(i===1&&tt>=7.0){const u=sm(7.0,7.4,tt,easeIO),p=arc([CX3[1],CY3],[hand[0]+20,hand[1]-40],u,120);cx=p[0];cy=p[1];sc=lerp(1,.85,u);rot=-.25*u;glow=sm(7.1,7.5,tt);
    if(tt>=8.0){const f=sm(8.0,8.25,tt,easeIn);sx=Math.max(0,Math.cos(f*Math.PI/2));const q=L2([cx,cy],[PIN[0],PIN[1]-40],f);cx=q[0];cy=q[1];}}
   if(i===1&&tt>=8.25)continue;
   card(s,cx,cy,KINDS[i],60+i*10,{sc,sx,rot,cov,glow});}
  spark(s,CX3[0],CY3-140,t-5.4,70,140);spark(s,hand[0]+20,hand[1]-40,t-7.4,71,170);
  // the small target pins at 8.25–8.6
  const pin=easeOutBack(sm(8.25,8.6,tt));
  target(s,PIN[0],PIN[1],90,72,{sc:pin,stand:KY+8});
  puff(s,PIN[0],KY+16,tt-8.55,73,.8);spark(s,PIN[0],PIN[1]-120,t-8.6,74,130);
  void fig;
 },
 aperture(){return apertureDisc(PIN[0],PIN[1],28,12);},
 still:7.6,
};

// ---------------- chapter 4 (10.5 s): the coach points; a cone gate; ten left-foot passes with a tally; first touch away from pressure, again and again ----------------
const PX4=-240,CX4=390,ST:Pt=[130,KY-100],TC:Pt=[-160,-400],FOOT4:Pt=[PX4+80,KY+8],COACHF:Pt=[CX4-70,KY+8];
const PASS0=4.1,PASSD=.19;
/** the ball heap at the small target: ten resting spots. */
const HEAP:Pt[]=[];for(let i=0;i<10;i++){const row=i<5?0:i<9?1:2,j=i<5?i:i<9?i-5:0;HEAP.push([ST[0]-95+j*48+row*24+(row===2?48:0),KY+2-row*40]);}
const ch4:Scene={
 draw(s,t){
  const tt=twos(t);
  cam(s,t,[[0,80,-120,.96],[1.86,60,-120,.98],[4.06,20,-120,1.0],[6.09,-60,-120,1.02],[8.12,-90,-120,1.04],[10.5,-110,-120,1.06]]);
  world(s,{seed:14,goalX:-720});
  target(s,ST[0],ST[1],90,80,{stand:KY+8});
  // the cone gate (1.9, 2.1) and the cone-defender (from 6.15)
  for(const [i,cy,t0] of[[0,KY+44,1.9],[1,KY-52,2.1]] as [number,number,number][]){const y=key(tt,[[t0,-900],[t0+.35,cy,easeIn]]);if(tt>=t0){const sq=tt>=t0+.35?.06*settle(tt,t0+.35,{amp:1,freq:5,decay:5,phase:Math.PI/2}):0;s.save();s.translate(-20,cy);s.scale(1+sq,1-sq);s.translate(20,-cy);cone(s,-20,Math.min(y,cy),140,81+i);s.restore();puff(s,-20,cy+10,tt-t0-.35,82+i,.7);}}
  // the coach steps in and points
  const enter=key(t,[[.2,900],[.32,940,easeIn],[.8,CX4,easeOut]])+8*settle(t,.8,{amp:1,freq:5,decay:5}),pointK=sm(1.0,1.35,tt,easeOutBack);
  const coachPass=(t0:number)=>tt>=t0-.2&&tt<t0+.3;
  const passes=[6.3,8.2,9.75];
  let coachDrawn=false;
  for(const t0 of passes)if(coachPass(t0)){const sw=anticipate(t0-.2,t0,tt,{back:.5,hold:.6,e:easeIn});kicker(s,enter,KY,700,sw,[COACHF[0]+16,COACHF[1]],{ink:K,seed:26,face:-1,shade:B});coachDrawn=true;break;}
  if(!coachDrawn)figure(s,enter,KY,700,enter<CX4+10&&tt<6.0?'point':'stand',{ink:K,seed:26,face:-1,shade:B,k:tt<6.0?Math.min(1,pointK):1,reach:tt<6.0&&pointK>0?L2([CX4-150,KY-450],[ST[0]+80,ST[1]-100],Math.min(1,pointK)):undefined,look:-.4});
  if(t>=.8&&t<2.0)puff(s,CX4-40,KY+16,tt-.8,84,.9);
  spark(s,ST[0],ST[1]-130,t-1.35,85,150);
  // the tally card
  const passIdx=tt<PASS0?-1:Math.min(9,Math.floor((tt-PASS0)/PASSD));
  const marks=tt<PASS0?0:Math.min(10,Math.floor((tt-PASS0-.16)/PASSD)+1),lastT=PASS0+.16+(marks-1)*PASSD;
  tally(s,TC[0],TC[1],Math.max(0,marks),86,easeOutBack(sm(2.4,2.7,tt)),marks>0?easeOutBack(sm(lastT,lastT+.15,tt)):1);
  // the ten passes: each ball rolls from the foot through the gate to the heap; the heap clears at 6.1
  const heapSc=1-sm(6.1,6.4,tt,easeIn);
  const flying:Pt[]=[];let smearB:{p:Pt;dir:number}|undefined;
  if(passIdx>=0&&heapSc>0){for(let i=0;i<=passIdx;i++){const t0=PASS0+i*PASSD,f=flight(tt,t0,.17,FOOT4,HEAP[i],{smear:34,e:easeOut});const p:Pt=[f[0],f[1]];
    if(f[3]>0)smearB={p,dir:0};flying.push(p);}}
  // the coach's passes and the first touches away from the cone
  const walkBack=(t0:number,t1:number)=>sm(t0,t1,tt,easeIO);
  const px=PX4-170*sm(6.9,7.4,tt,easeIO)+170*walkBack(7.6,8.1)-170*sm(8.85,9.25,tt,easeIO)+170*walkBack(9.3,9.7)-170*sm(10.3,10.5,tt,easeIO);
  let bp:Pt|undefined,sq=0,smear=0,dir=0;
  if(tt<PASS0||(passIdx<9&&tt<6.0))bp=FOOT4;
  const drills:[number,number,number][]=[[6.3,6.85,6.9],[8.2,8.7,8.75],[9.75,10.2,10.25]];
  for(const [t0,t1,t2] of drills){if(tt<t0)break;const f=flight(tt,t0,t1-t0,COACHF,FOOT4,{smear:36});bp=[f[0],f[1]];sq=f[2];smear=f[3];dir=Math.PI;
   if(tt>=t2){const g=flight(tt,t2,.3,FOOT4,[FOOT4[0]-170,KY+8],{smear:30});bp=[g[0],g[1]];sq=g[2];smear=g[3];dir=Math.PI;}}
  // the cone-defender: slides in at 6.15, lunges at each touch, tips and settles
  if(tt>=6.15){const cx=key(tt,[[6.15,700],[6.6,-20,easeOut],[6.85,-20],[7.15,-120,easeOut],[7.6,-120],[8.1,-20,easeIO],[8.7,-20],[9.0,-120,easeOut],[9.3,-120],[9.7,-20,easeIO],[10.2,-20],[10.5,-120,easeOut]]);
   let leanV=-.22*sm(6.4,6.7,tt,easeOut);for(const t0 of[6.85,8.75,10.25])if(tt>=t0){leanV=-.42*sm(t0,t0+.25,tt,easeOut)*(1-sm(t0+.3,t0+.8,tt))+ .06*settle(tt,t0+.8,{amp:1,freq:3,decay:3})-.1;}
   cone(s,cx,KY+70,300,90,{lean:leanV});
   for(const t0 of[6.6,7.15,9.0])puff(s,cx,KY+76,tt-t0,91+Math.round(t0),.9);}
  // the player: kick pose per pass on twos (yellow left boot), the first touches, walks back
  let fig;
  if(passIdx>=0&&passIdx<=9&&tt<PASS0+10*PASSD){const ph=(tt-PASS0-passIdx*PASSD)/PASSD;fig=kid(s,PX4,KY,'kick',{face:1,k:ph<.5?.9:.3,foot:[FOOT4[0]-20+40*ph,FOOT4[1]-8],boot:Y});}
  else{let done=false;
   for(const [,t1,t2] of drills){if(tt>=t2-.15&&tt<t2+.3){const sw=anticipate(t2-.15,t2,tt,{back:.4,hold:.5,e:easeIn});fig=kicker(s,PX4,KY,FIG,sw,[FOOT4[0]+10,FOOT4[1]],{seed:41,face:1,shirt:Y,shade:B,boot:Y});done=true;break;}
    if(tt>=t1-.3&&tt<t2-.15){fig=kid(s,PX4,KY,'crouch',{face:1,k:.5,look:.5,boot:Y});done=true;break;}}
   if(!done){const moving=(tt>6.9&&tt<7.4)||(tt>7.6&&tt<8.1)||(tt>8.85&&tt<9.25)||(tt>9.3&&tt<9.7)||(tt>10.3);
    if(moving)fig=kid(s,px,KY,stride(t),{face:px<PX4-10&&!(tt>7.6&&tt<8.1)&&!(tt>9.3&&tt<9.7)?-1:1,k:.9,boot:Y});
    else fig=kid(s,px,KY,tt<1.86?'scan':'stand',{face:1,k:1,look:tt<1.86?.6:tt>=6.0?.4:0,boot:tt>=4.0?Y:undefined});}}
  void fig;
  // balls
  if(heapSc>0)for(let i=0;i<flying.length;i++){const p=flying[i];const landed=tt>=PASS0+i*PASSD+.17;const scl=landed?heapSc:1;if(scl<=0)continue;s.save();s.translate(p[0],p[1]);s.scale(scl,scl);s.translate(-p[0],-p[1]);ball(s,p[0],p[1],46,100+i,{rot:(p[0]-FOOT4[0])/46,smear:smearB&&smearB.p===p?{dir:0,amount:34}:undefined});s.restore();}
  if(smearB)speedLines(s,K,smearB.p[0],smearB.p[1],0,{n:3,seed:95,len:70,width:4,cov:.7});
  if(bp){if(smear>0)speedLines(s,K,bp[0],bp[1],dir,{n:4,seed:96,len:90,width:5,cov:.7});ball(s,bp[0],bp[1],BR,9,{sx:1+sq,sy:1-sq,rot:(bp[0]-FOOT4[0])/BR});}
  for(const [,,t2] of drills)puff(s,FOOT4[0]-170,KY+16,tt-t2-.3,97,.7);
 },
 aperture(){return apertureDisc(TC[0],TC[1],40,12);},
 still:5.3,
};

// ---------------- chapter 5 (8.4 s): the big target — arrows land in the outer ring, off the side, then closer after an adjustment ----------------
const PX5=-300,TX5=310,TY5=KY-290,TR5=230;
const A5:Arrow[]=[{x:TX5-190,y:TY5-60,a:.42},{x:TX5-40,y:TY5-205,a:.5},{x:TX5+250,y:TY5+150,a:.3},{x:TX5-95,y:TY5+10,a:.38}];
const A5T=[1.2,3.55,5.15,7.15],A5R=[1.35,3.7,5.3,7.3];
const ch5:Scene={
 draw(s,t){
  const tt=twos(t);
  let shake=0;for(const t0 of A5T)shake+=settle(t,t0,{amp:9,freq:7,decay:5});
  cam(s,t,[[0,-80,-110,1.0],[1.13,100,-120,1.03],[2.9,40,-115,1.04],[4.35,120,-120,1.06],[5.8,20,-110,1.07],[6.9,140,-120,1.1],[8.4,170,-120,1.12]],shake);
  world(s,{seed:15,goalX:-160,goalW:160});
  let sq=0;for(const t0 of A5T)sq+=.05*settle(tt,t0,{amp:1,freq:5,decay:5,phase:Math.PI/2});
  target(s,TX5,TY5,TR5,110,{stand:KY+10,sq});
  // arrows: each flies in from the left over .25 s and thuds; a paper ring blooms
  const list:Arrow[]=[];
  for(let i=0;i<4;i++){const t0=A5T[i]-.25;if(tt<t0)continue;const u=sm(t0,A5T[i],tt,easeIn),ar=A5[i],from:Pt=[ar.x-Math.cos(ar.a)*900,ar.y-Math.sin(ar.a)*900],tip=L2(from,[ar.x,ar.y],u);list.push({x:tip[0],y:tip[1],a:ar.a,len:220,ring:easeOutBack(sm(A5R[i],A5R[i]+.35,tt))});
   if(u>0&&u<1)speedLines(s,K,tip[0]-Math.cos(ar.a)*110,tip[1]-Math.sin(ar.a)*110,ar.a,{n:4,seed:111+i,len:110,width:5,cov:.7});}
  arrows(s,list);
  spark(s,A5[3].x,A5[3].y-70,t-7.2,115,170);
  // the player: kick settle → look → heavy touch → run to the ball → pass behind → adjust (counter-turn) → a ball returns → try once more
  const run=sm(3.6,4.2,tt,easeIO),px=lerp(PX5,-170,run),foot:Pt=[px+80,KY+8];
  let bp:Pt|undefined=[PX5+80,KY+8],bsq=0,smear=0,dir=0;
  const heavy=flight(tt,2.95,.35,[PX5+80,KY+8],[-90,KY+8],{smear:44});if(tt>=2.95){bp=[heavy[0],heavy[1]];bsq=heavy[2];smear=heavy[3];dir=0;}
  const behind=flight(tt,4.45,.5,[-90,KY+8],[900,KY+40],{smear:40});if(tt>=4.45){bp=[behind[0],behind[1]];bsq=behind[2];smear=behind[3];dir=.04;if(tt>=4.95)bp=undefined;}
  const back=flight(tt,6.0,.45,[900,KY+30],[foot[0],KY+8],{smear:26});if(tt>=6.0){bp=[back[0],back[1]];bsq=back[2];smear=back[3];dir=Math.PI;}
  const again=flight(tt,6.65,.4,[foot[0],KY+8],[foot[0]+120,KY+8],{smear:24});if(tt>=6.65){bp=[again[0],again[1]];bsq=again[2];smear=again[3];dir=0;}
  const rotF=-.08*sm(5.85,6.0,tt,easeOut)*(1-sm(6.0,6.3,tt,easeIO))+.02*settle(tt,6.3,{amp:1,freq:4,decay:5});
  const look=(tt>=1.13&&tt<2.9)||(tt>=3.4&&tt<3.6)||(tt>=5.15&&tt<5.8)||tt>=7.15?.7:0;
  if(tt<.6)kid(s,px,KY,'kick',{face:1,k:.5*(1-sm(0,.6,tt,easeOut)),foot:[px+100,KY-10]});
  else if(tt>=2.7&&tt<3.2){const sw=anticipate(2.7,2.95,tt,{back:.6,hold:.6,e:easeIn});kicker(s,px,KY,FIG,sw,[PX5+70,KY+8],{seed:41,face:1,shirt:Y,shade:B});}
  else if(run>0&&run<1)kid(s,px,KY,stride(t),{face:1,k:.9});
  else if(tt>=4.2&&tt<4.7){const sw=anticipate(4.2,4.45,tt,{back:.6,hold:.6,e:easeIn});kicker(s,px,KY,FIG,sw,[-100,KY+8],{seed:41,face:1,shirt:Y,shade:B});}
  else if(tt>=5.85&&tt<6.4)kid(s,px,KY,'step',{face:1,k:.35*sm(6.0,6.3,tt,easeOut),rot:rotF,look:.3});
  else if(tt>=6.4&&tt<6.9){const sw=anticipate(6.4,6.65,tt,{back:.4,hold:.6,e:easeIn});kicker(s,px,KY,FIG,sw,[foot[0]-10,foot[1]],{seed:41,face:1,shirt:Y,shade:B});}
  else kid(s,px,KY,look>0?'scan':'stand',{face:1,k:1,look,lift:look>0?.25:0});
  if(bp){if(smear>0)speedLines(s,K,bp[0],bp[1],dir,{n:4,seed:116,len:100,width:5,cov:.7});ball(s,bp[0],bp[1],BR,10,{sx:1+bsq,sy:1-bsq,rot:(bp[0]-PX5-80)/BR});}
  puff(s,-90,KY+16,tt-3.3,117,.9);puff(s,foot[0],KY+16,tt-6.45,118,.7);puff(s,foot[0]+120,KY+16,tt-7.05,119,.6);
 },
 aperture(){const f=fletchOf({...A5[3],len:220});return apertureDisc(f[0],f[1],22,12);},
 still:7.6,
};

// ---------------- chapter 6 (10.1 s): two players — one wandering, one with a target; the arrows cluster, the yellow grows ----------------
const LX=-360,RX=60,T6:Pt=[330,KY-300],TR6=170;
const A6:Pt[]=[[-70,-40],[50,60],[-30,50],[40,-50],[-10,20],[12,-10],[-18,14]];
const A6T=[5.4,5.7,6.0,6.3,6.6,7.0,7.3];
const ch6:Scene={
 draw(s,t){
  const tt=twos(t);
  let shake=0;for(const t0 of A6T)shake+=settle(t,t0,{amp:5,freq:7,decay:5});
  cam(s,t,[[0,-80,-120,.95],[1.46,-20,-120,.97],[3.41,40,-120,1.0],[4.39,80,-125,1.02],[5.36,120,-130,1.04],[6.99,160,-135,1.08],[10.1,170,-135,1.1]],shake);
  world(s,{seed:16,goalX:-170,goalW:160});
  // the target rises at 1.5; the yellow centre grows with each arrow
  const rise=easeOutBack(sm(1.5,2.0,tt));let centre=.38,sq=0;
  for(let i=0;i<7;i++){centre+=(i<5?.04:.06)*easeOutBack(sm(A6T[i],A6T[i]+.3,tt));sq+=.03*settle(tt,A6T[i],{amp:1,freq:5,decay:5,phase:Math.PI/2});}
  target(s,T6[0],T6[1],TR6,120,{sc:rise,stand:KY+8,centre:Math.min(.72,centre),sq});
  if(tt>=1.95&&tt<3.1){puff(s,T6[0]-90,KY+16,tt-1.95,121,.8);puff(s,T6[0]+90,KY+16,tt-1.97,122,.8);}
  spark(s,T6[0],T6[1]-TR6-60,t-2.0,123,150);
  // the walk-in (0.2–1.3)
  const inU=sm(.2,1.3,tt,easeIO),lxIn=lerp(-850,LX,inU),rxIn=lerp(-380,RX,inU);
  // the wanderer: lazy kicks at 1.8, 3.6, 5.4, 7.2; walks after the ball; shrug at 8.0
  const wk:[number,Pt,Pt][]=[[1.8,[LX+80,KY+8],[LX+170,KY+30]],[3.6,[LX+170,KY+30],[LX-60,KY+8]],[5.4,[LX-60,KY+8],[LX+150,KY+36]],[7.2,[LX+150,KY+36],[LX+10,KY+8]]];
  let lb:Pt=[lxIn+80,KY+8],lsq=0,lsm=0,ldir=0;let lx=lxIn;
  for(const [t0,a,b] of wk){if(tt<t0)break;const f=flight(tt,t0,.55,a,b,{lift:60,smear:20});lb=[f[0],f[1]];lsq=f[2];lsm=f[3];ldir=b[0]>a[0]?0:Math.PI;
   const w=sm(t0+.5,t0+1.2,tt,easeIO);lx=lerp(lx,b[0]-(b[0]>a[0]?80:-80),w);}
  const lFace:1|-1=lb[0]>=lx?1:-1;
  let ldrawn=false;
  for(const [t0,,b] of wk){if(tt>=t0-.25&&tt<t0+.3){const sw=anticipate(t0-.25,t0,tt,{back:.5,hold:.6,e:easeIn});const f:1|-1=b[0]>=lx?1:-1;figure(s,lx,KY,FIG,'kick',{seed:45,face:f,shade:B,k:clamp(sw)+.15,foot:[lb[0]-f*20,lb[1]]});ldrawn=true;break;}}
  if(!ldrawn){const walking=(inU>0&&inU<1)||wk.some(([t0])=>tt>t0+.5&&tt<t0+1.2);
   if(walking)figure(s,lx,KY,FIG,stride(t),{seed:45,face:lFace,shade:B,k:.9});
   else if(tt>=8.0){const shrug=.35*easeOutBack(sm(8.0,8.3,tt))+.06*settle(tt,8.3,{amp:1,freq:2.5,decay:1.2});figure(s,lx,KY,FIG,'arms',{seed:45,face:1,shade:B,k:Math.max(0,shrug),lift:.3*sm(8.0,8.3,tt)});}
   else figure(s,lx,KY,FIG,'stand',{seed:45,face:lFace,shade:B,k:1});}
  if(lsm>0)speedLines(s,K,lb[0],lb[1],ldir,{n:3,seed:124,len:70,width:4,cov:.7});
  ball(s,lb[0],lb[1],BR,11,{sx:1+lsq,sy:1-lsq,rot:(lb[0]-LX)/BR});
  // the target player: walks in, stands with the ball, the yellow boot at 3.45, aims, arms up at 7.4
  const upK=sm(7.4,7.75,tt,easeOutBack)-.05*settle(tt,7.75,{amp:1,freq:3,decay:2});
  let fig;
  if(inU>0&&inU<1)fig=kid(s,rxIn,KY,stride(t),{face:1,k:.9});
  else if(tt>=7.4)fig=kid(s,RX,KY,'up',{face:1,k:Math.max(0,upK),boot:Y,lift:.3*Math.max(0,upK)});
  else fig=kid(s,RX,KY,tt>=1.46?'scan':'stand',{face:1,k:1,look:tt>=1.46?.6:0,boot:tt>=3.45?Y:undefined,lift:tt>=5.36?.3:0});
  spark(s,fig.foot[0],fig.foot[1]-20,t-3.45,125,120);
  sight(s,[RX+140,KY-30],[T6[0],T6[1]],sm(4.45,4.85,tt,easeOut)*(1-sm(5.3,5.5,tt)),126);
  ball(s,RX+80,KY+8,BR,12,{rot:(rxIn-RX)/BR});
  // the arrows cluster into the yellow
  const list:Arrow[]=[];
  for(let i=0;i<7;i++){const t0=A6T[i]-.25;if(tt<t0)continue;const u=sm(t0,A6T[i],tt,easeIn),tx=T6[0]+A6[i][0],ty=T6[1]+A6[i][1],a=.42+(hash(i,9)-.5)*.2,tip=L2([tx-Math.cos(a)*800,ty-Math.sin(a)*800],[tx,ty],u);
   list.push({x:tip[0],y:tip[1],a,len:170,ring:easeOutBack(sm(A6T[i]+.1,A6T[i]+.4,tt))*(1-sm(A6T[i]+.9,A6T[i]+1.4,tt))});}
  arrows(s,list);
  spark(s,T6[0],T6[1]-TR6-70,t-7.3,127,180);
  if(smearOf(list.length,tt))speedLines(s,K,T6[0]-280,T6[1]-130,.42,{n:3,seed:129,len:100,width:5,cov:.6});
 },
 still:7.9,
};
/** speed lines while an arrow is in flight (any of the seven). */
function smearOf(n:number,tt:number){for(let i=0;i<n;i++){if(tt>=A6T[i]-.25&&tt<A6T[i])return true;}return false;}

export const story:RisoStory={
 id:'pick-a-purpose',format:'9v9',title:'Pick a Purpose',theme:'Practising with a purpose',ageNote:'A direct mental-skills explainer for developing players; playing format does not define age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:[
  {label:'Just kicking a ball',narration:'Have you ever turned up to practice and just kicked the ball around? It feels like football. But an hour can pass without anything getting better.',seconds:8.8,audio:CH+'1.m4a',cues:[{at:0.0,words:'Have you ever turned up to practice'},{at:2.03,words:'just kicked the ball around'},{at:3.72,words:'It feels like football'},{at:5.07,words:'an hour can pass'},{at:6.59,words:'without anything getting better'}]},
  {label:'The archer',headline:{text:'Aim',at:5.05},narration:'Think of an archer. She does not fire arrows into the sky and hope. She chooses her mark, aims with purpose, and looks where each arrow lands.',seconds:9.7,audio:CH+'2.m4a',cues:[{at:0.0,words:'Think of an archer'},{at:1.69,words:'fire arrows into the sky and hope'},{at:4.3,words:'She chooses her mark'},{at:5.79,words:'aims'},{at:6.73,words:'looks where each arrow lands'}]},
  {label:'Choose one thing',headline:{text:'Pick one',at:3.4},narration:'Practising with a purpose works the same way. Before you start, choose one thing to work on. Maybe your first touch. Maybe your weaker foot.',seconds:9.3,audio:CH+'3.m4a',cues:[{at:0.0,words:'Practising with a purpose'},{at:2.33,words:'Before you start'},{at:3.4,words:'choose one thing to work on'},{at:5.37,words:'Maybe your first touch'},{at:6.98,words:'Maybe your weaker foot'}]},
  {label:'Match your purpose',headline:{text:'Match it',at:1.86},narration:'Ask your coach what you need most. Then make the practice match your purpose: ten passes with your left foot, a first touch away from pressure, again and again.',seconds:10.5,audio:CH+'4.m4a',cues:[{at:0.0,words:'Ask your coach'},{at:1.86,words:'make the practice match your purpose'},{at:4.06,words:'ten passes with your left foot'},{at:6.09,words:'a first touch away from pressure'},{at:8.12,words:'again and again'}]},
  {label:'Look where it landed',headline:{text:'Once more',at:5.8},narration:'After each try, look where the arrow landed. Was the touch too heavy? Did the pass go behind? Adjust, and try once more.',seconds:8.4,audio:CH+'5.m4a',cues:[{at:0.0,words:'After each try'},{at:1.13,words:'look where the arrow landed'},{at:2.9,words:'Was the touch too heavy'},{at:4.35,words:'Did the pass go behind'},{at:5.8,words:'Adjust, and try once more'}]},
  {label:'Showing up with a purpose',narration:'Showing up matters. Showing up with a purpose matters more. Pick one thing, aim at it, and check your progress. That is how practice becomes improvement.',seconds:10.3,audio:CH+'6.m4a',cues:[{at:0.0,words:'Showing up matters'},{at:1.49,words:'with a purpose matters more'},{at:3.48,words:'Pick one thing'},{at:4.48,words:'aim at it'},{at:5.47,words:'check your progress'},{at:7.13,words:'practice becomes improvement'}]},
 ],
 draw(f){playChapters(story,f,[ch1,ch2,ch3,ch4,ch5,ch6]);},
 /** Touch: an arrow thuds into the print at the tap — it flies in from the upper-left along its own line (.12 s), sticks at a downward angle
  * with a wobble settle, a paper ring blooms around the point and fades, a dust puff. Reduced motion (age 0): the stuck arrow with its ring. */
 touch(s,x,y,age,seed){
  const a0=1.15+(hash(seed,5)-.5)*.4,L=240;
  const fl=age<=0?1:clamp(age/.12),wob=age>.12?.14*settle(age,.12,{amp:1,freq:6,decay:6}):0;
  const tip:Pt=[x-Math.cos(a0)*700*(1-fl),y-Math.sin(a0)*700*(1-fl)];
  const g=age<=0?1:easeOutBack(sm(.12,.45,age))*(1-sm(.6,.8,age));
  if(age>.12)puff(s,x,y+6,age-.12,seed+1,.8);
  if(fl<1)speedLines(s,K,tip[0]-Math.cos(a0)*100,tip[1]-Math.sin(a0)*100,a0,{n:3,seed:seed+2,len:120,width:5,cov:.7});
  arrows(s,[{x:tip[0],y:tip[1],a:a0+wob,len:L,ring:g}]);
  if(age>0&&age<.6)spark(s,x,y-30,age-.12,seed+3,110);
 },
};
