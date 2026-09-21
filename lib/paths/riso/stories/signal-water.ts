/** The Signal Across the Water — riso. Lead material: a lake between two torn shores — horizontal water bands (green, stepped
 * coverage = depth) with live wave edges, a yellow near shore and an orange far shore, and signals drawn as water: yellow arcs
 * travelling out from the child's flag, orange arcs returning from a helper, and a rope bridge where the two families meet.
 * Legibility pass (bible §1c): the child is a yellow cut-paper pictogram figure HOLDING the flag (drooping = the figure slumps and
 * the flag drops together; asking = the arm raises the pole), the coach / helpers are orange figures holding orange flags, the silent
 * one is a grey figure turned away; the ball is a buoy-ball (paper disc, navy band, yellow float, two faint pentagons).
 * Inks yellow → orange → green → navy on cream. Navy = fog, tangle, silence, current.
 * Scenes read only their local time t; all randomness is seeded, so the passage seams stay pixel-continuous. */
import type {Sheet} from '../sheet';
import {type RisoStory,type Scene,playChapters} from '../story';
import {apertureDisc} from '../passage';
import {twos,twosIndex,sm,easeOut,easeIO,easeIn,easeOutBack,linear,key,camKeys,anticipate,settle,spring,clamp,lerp,rng,hash,noise1,blob,polyPath,ribbon,smoothPts,partial,rotPts,scalePts,circlePath,rectPath,torn,TAU,type Pt} from '../motion';
import {contour,dust,handCut,confetti,sparkBurst,speedLines,crescent} from '../shapes';

const CH='/stories/narration/7v7/signal-water/';
const K='navy',Y='yellow',O='orange',G='green';
const cam=(s:Sheet,t:number,K:number[][])=>camKeys(s,t,K);
const shake=(t:number,seed:number,amp:number)=>(hash(twosIndex(t),seed)-.5)*2*amp;

// ---------------- abstract riso figure (bible §1c.4) ----------------
/** A cut-paper player pictogram: a tall head disc, a torn torso block, two leg strokes, two arm strokes — no anatomy, no face.
 * (x,y) = the ground point under the body, h = height, face = +1 looks right. Poses are parameter tables blended from `from` (stand) by k.
 * ink = the person's role ink (knocked out beneath, navy contour). dry = compute the geometry without drawing (to place a flag in the hand first).
 * look turns the head; sight prints a paper wedge; tilt adds a whole-body lean (radians). */
type Pose='stand'|'slump'|'wave'|'lean'|'listen'|'step'|'step2'|'kick'|'point'|'crouch'|'sit';
type PoseParams={tilt:number;head:Pt;legF:Pt;legB:Pt;armF:Pt;armB:Pt;hip:number};
const POSES:Record<Pose,PoseParams>={
 stand:{tilt:0,head:[0,0],legF:[.1,0],legB:[-.1,0],armF:[.2,.27],armB:[-.2,.27],hip:0},
 slump:{tilt:.4,head:[.05,.07],legF:[.06,0],legB:[-.08,0],armF:[.16,.34],armB:[-.02,.34],hip:.02},
 wave:{tilt:-.05,head:[0,0],legF:[.14,0],legB:[-.12,0],armF:[.26,-.4],armB:[-.2,.27],hip:0},
 lean:{tilt:.34,head:[.03,.01],legF:[.3,0],legB:[-.34,-.02],armF:[.3,-.3],armB:[-.28,.14],hip:.03},
 listen:{tilt:.15,head:[.06,.02],legF:[.12,0],legB:[-.1,0],armF:[.05,-.14],armB:[-.2,.27],hip:0},
 step:{tilt:.26,head:[.01,0],legF:[.32,0],legB:[-.3,0],armF:[.36,.1],armB:[-.3,.14],hip:.06},
 step2:{tilt:.26,head:[.01,0],legF:[-.3,0],legB:[.32,0],armF:[-.3,.14],armB:[.36,.1],hip:.06},
 kick:{tilt:-.12,head:[0,0],legF:[.34,-.08],legB:[-.12,0],armF:[.3,0],armB:[-.32,.05],hip:0},
 point:{tilt:.02,head:[.02,0],legF:[.14,0],legB:[-.1,0],armF:[.46,-.02],armB:[-.2,.27],hip:0},
 crouch:{tilt:.3,head:[.02,.01],legF:[.24,0],legB:[-.24,0],armF:[.3,.12],armB:[-.28,.16],hip:.12},
 sit:{tilt:-.05,head:[0,0],legF:[.34,0],legB:[.3,.04],armF:[.22,.2],armB:[-.1,.27],hip:.27},
};
type FigOpts={ink?:string;line?:string;seed?:number;face?:1|-1;look?:number;k?:number;from?:Pose;cov?:number;reach?:Pt;shade?:string;sight?:number;dry?:boolean;tilt?:number};
type Fig={head:Pt;R:number;handF:Pt;handB:Pt;footF:Pt};
function figure(s:Sheet,x:number,y:number,h:number,pose:Pose,o:FigOpts={}):Fig|undefined{
 const{ink=Y,line=K,seed=1,face=1,look=0,k=1,from='stand',cov=.92,reach,shade,sight=0,dry=false,tilt:extra=0}=o;if(h<8)return;
 const base=POSES[from],p=POSES[pose],L=(a:number,b:number)=>lerp(a,b,k),LP=(a:Pt,b:Pt):Pt=>[lerp(a[0],b[0],k),lerp(a[1],b[1],k)];
 const tilt=L(base.tilt,p.tilt)+extra,head=LP(base.head,p.head),legF=LP(base.legF,p.legF),legB=LP(base.legB,p.legB),armF=LP(base.armF,p.armF),armB=LP(base.armB,p.armB),hip=L(base.hip,p.hip);
 const R=h*.155,tw=h*.3,th=h*.38,legL=h*.3,hipY=-legL+hip*h,ca=Math.cos(tilt),sa=Math.sin(tilt);
 const W=(lx:number,ly:number):Pt=>[x+lx*face,y+ly];
 const T=(lx:number,ly:number):Pt=>[lx*ca-ly*sa,hipY+lx*sa+ly*ca];
 const corners=[T(-tw/2,0),T(tw/2,0),T(tw/2,-th),T(-tw/2,-th)].map(q=>W(q[0],q[1]));
 const torsoPts=handCut(corners,seed,h*.035,h*.1),torso=polyPath(torsoPts,true);
 const shF=T(tw*.42,-th+R*.25),shB=T(-tw*.42,-th+R*.25);
 const hc=T(0,-th-R*1.1),headC=W(hc[0]+head[0]*h+look*R*.42,hc[1]+head[1]*h),headPts=blob(headC[0],headC[1],R*.92,R*1.08,seed+2,{amp:.06,n:30});
 const headPath=polyPath(headPts,true);
 const hipF=W(tw*.18,hipY),hipB=W(-tw*.18,hipY);
 const fF=W(legF[0]*h,legF[1]*h),fB=W(legB[0]*h,legB[1]*h);
 const aF=reach?reach:W(shF[0]+armF[0]*h,shF[1]+armF[1]*h),aB=W(shB[0]+armB[0]*h,shB[1]+armB[1]*h);
 const out:Fig={head:headC,R,handF:aF,handB:aB,footF:fF};if(dry)return out;
 const limbs=new Path2D();
 limbs.addPath(ribbon([hipF,fF],h*.08,{seed:seed+3,pressure:.4,taper:.25,wobble:1.4}));limbs.addPath(ribbon([hipB,fB],h*.08,{seed:seed+4,pressure:.4,taper:.25,wobble:1.4}));
 limbs.addPath(ribbon([W(shB[0],shB[1]),aB],h*.062,{seed:seed+5,pressure:.4,taper:.35,wobble:1.4}));limbs.addPath(ribbon([W(shF[0],shF[1]),aF],h*.062,{seed:seed+6,pressure:.4,taper:.35,wobble:1.4}));
 const all=new Path2D();all.addPath(torso);all.addPath(headPath);all.addPath(limbs);
 const outl=new Path2D();outl.addPath(ribbon(torsoPts,Math.max(4,h*.022),{seed:seed+7,close:true,pressure:.6,wobble:1.8,gaps:[[.62,.66]]}));outl.addPath(ribbon(headPts,Math.max(4,h*.022),{seed:seed+8,close:true,pressure:.6,wobble:1.4}));
 if(sight>0){const d=face*(look>=0?1:-1),sx=headC[0]+d*R*.6,wedge=polyPath([[headC[0],headC[1]],[sx+d*h*.55,headC[1]-h*.22],[sx+d*h*.55,headC[1]+h*.12]],true);s.knockout(wedge,.3*sight);}
 s.knockout(all);s.fill(ink,all,cov);s.fill(line,outl,.9);
 if(shade){const sh=new Path2D();sh.addPath(crescent(headC[0],headC[1],R*.95,[-.35*face,-.4]));sh.addPath(polyPath([corners[0],[lerp(corners[1][0],corners[0][0],.5),lerp(corners[1][1],corners[0][1],.5)],[lerp(corners[2][0],corners[3][0],.5),lerp(corners[2][1],corners[3][1],.5)],corners[3]],true));s.tone(shade,sh,.45);}
 return out;
}
const walkPose=(t:number,moving:boolean):Pose=>moving?(twosIndex(t)%2?'step2':'step'):'stand';

// ---------------- the material: water, shores, flags, signals ----------------
type Amp=number|((x:number,k:number)=>number);
/** Water bands: n stepped grainy bands whose upper edges are gentle wave lines; each runs to the bottom, far first, so coverage steps toward the viewer.
 * amp = the water's mood (0 = dead flat); sag presses the middle down (fog); bulge(x) lifts edges upstream. */
function water(s:Sheet,o:{ink?:string;y0:number;y1:number;n?:number;cov0?:number;cov1?:number;amp:Amp;sag?:number;seed:number;bulge?:(x:number)=>number;phase?:number;wave?:number;x0?:number;x1?:number}){
 const{ink=G,y0,y1,n=6,cov0=.3,cov1=.7,amp,sag=0,seed,bulge,phase=0,wave=420,x0=-3200,x1=3200}=o;
 for(let k=0;k<n;k++){const top=lerp(y0,y1,k/(n-1)),pts:Pt[]=[[x0,4000]];
  for(let x=x0;x<=x1;x+=52){const A=typeof amp==='function'?amp(x,k):amp,y=top+A*Math.sin(x/wave*TAU+phase+k*1.3)+A*.45*noise1(x/230+k*5,seed+k)+sag*Math.exp(-Math.pow(x/900,2))+(bulge?bulge(x):0);pts.push([x,y]);}
  pts.push([x1,4000]);s.tone(ink,polyPath(pts,true),lerp(cov0,cov1,k/(n-1)));}
}
/** A shore: a torn-edge sand field ('near' fills downward from y, 'far' fills upward) with a green tide-line step overprinted along the shoreline. */
function shore(s:Sheet,ink:string,side:'near'|'far',y:number,seed:number,o:{cov?:number;tide?:boolean;amp?:number;x0?:number;x1?:number}={}){
 const{cov=.8,tide=true,amp=34,x0=-3200,x1=3200}=o,edge:Pt[]=[];
 for(let x=x0;x<=x1;x+=40)edge.push([x,y+amp*noise1(x/170,seed)+amp*.5*noise1(x/60+9,seed+2)]);
 const far=side==='far',pts:Pt[]=[[x0,far?-4000:4000],...edge,[x1,far?-4000:4000]];const path=polyPath(pts,true);
 s.fill(ink,path,cov);s.save();s.clip(path);s.fill(ink,ribbon(edge,120,{seed,wobble:0,taper:0,pressure:.1,step:40}),1);s.restore();
 if(tide)s.tone(G,ribbon(edge.map(p=>[p[0],p[1]+(far?18:-18)] as Pt),70,{seed:seed+1,wobble:0,taper:0,pressure:.1,step:40}),.5);
}
/** Paper glints on the water. */
const glints=(s:Sheet,box:[number,number,number,number],n:number,seed:number,cov=1)=>{if(cov<=0)return;confetti(s,['paper'],box,n,seed,{size:30});};
/** A pennant flag: navy pole, pennant in the person's ink. fly 0 = drooped along the pole … 1 = flying; furl narrows it; rot turns the flag about its base. */
function flag(s:Sheet,x:number,y:number,ink:string|null,fly:number,o:{dir?:number;pole?:number;w?:number;h?:number;seed?:number;flutter?:number;rot?:number;furl?:number;cov?:number;scale?:number;base?:boolean}={}){
 const{dir=1,pole=320,w=220,h=140,seed=1,flutter=0,rot=0,furl=0,cov=1,scale=1,base=true}=o,P=pole*scale,W=w*scale*(1-furl*.8),H=h*scale*(1-furl*.5);
 const A:Pt=[0,-P],B:Pt=[0,-P+H*.85],tipFly:Pt=[dir*W,-P+H*.5+flutter*10],tipDroop:Pt=[dir*W*.18,-P+W*.95];
 const T:Pt=[lerp(tipDroop[0],tipFly[0],fly),lerp(tipDroop[1],tipFly[1],fly)],M:Pt=[lerp(dir*W*.12,dir*W*.5,fly),lerp(-P+W*.45,-P-H*.05+flutter*6,fly)];
 const pen=rotPts([A,M,T,[lerp(B[0],B[0]+dir*W*.08,fly),lerp(B[1],B[1]+H*.1,fly)],B],rot).map(p=>[p[0]+x,p[1]+y] as Pt);
 const poleTop=rotPts([[0,-P-14]],rot)[0];
 if(ink){const pp=polyPath(smoothPts(pen,true,8,1.2),true);s.knockout(pp);s.fill(ink,pp,cov);}
 contour(s,K,smoothPts(pen,true,8,1.2),Math.max(4,7*scale),{close:true,seed,pressure:.5,wobble:1.2});
 s.fill(K,ribbon([[x,y],[x+poleTop[0],y+poleTop[1]]],Math.max(6,12*scale),{seed:seed+1,wobble:.8,taper:.15,pressure:.3,step:30}));
 if(base)s.fill(K,polyPath(blob(x,y,26*scale,12*scale,seed+2,{amp:.06,n:16}),true),.7);
}
/** A figure holding a flag: the pole rises from the front hand (drawn first, so the arm grips it), then the figure prints over it. */
function flagBearer(s:Sheet,x:number,y:number,h:number,pose:Pose,fig:FigOpts&{backing?:boolean},ink:string|null,fly:number,fo:Parameters<typeof flag>[5]={}):Fig|undefined{
 const g=figure(s,x,y,h,pose,{...fig,dry:true});if(!g)return;
 if(fig.backing)s.knockout(polyPath(blob(x,y-h*.5,h*.34,h*.6,(fig.seed??1)+40,{amp:.08,n:24}),true),.7);
 flag(s,g.handF[0],g.handF[1]+h*.1,ink,fly,{scale:h/300,base:false,...fo});
 return figure(s,x,y,h,pose,fig);
}
/** Signal arcs: ribbons on circle arcs around an origin, facing `dir`, one per radius. stretch elongates them along the flow; notch prints a paper tally at each apex; curl adds a small curl and a paper dot (capped at 14 u) on the first arc. */
function arcs(s:Sheet,ink:string,ox:number,oy:number,radii:number[],o:{dir?:number;span?:number;width?:number;seed?:number;stretch?:number;stretchDir?:number;cov?:number;notch?:boolean;curl?:boolean;flat?:number;knock?:boolean}={}){
 const{dir=-Math.PI/2,span=2.2,width=11,seed=1,stretch=1,stretchDir=0,cov=1,notch=false,curl=false,flat=0,knock=true}=o;
 radii.forEach((r,k)=>{if(r<=8)return;const n=Math.max(10,Math.round(r*span/40)),pts:Pt[]=[];
  for(let i=0;i<=n;i++){const a=dir-span/2+span*i/n;let px=Math.cos(a)*r,py=Math.sin(a)*r;
   if(stretch!==1){const c=Math.cos(stretchDir),sn=Math.sin(stretchDir),u=px*c+py*sn,v=-px*sn+py*c;px=(u*stretch)*c-v*sn;py=(u*stretch)*sn+v*c;}
   if(flat>0){const fy=Math.sin(dir)*r;py=lerp(py,fy+flat*60,flat);px=lerp(px,Math.cos(a)*r*1.1,flat*.4);}
   pts.push([ox+px,oy+py]);}
  const cr=Math.min(r,160);
  if(curl&&k===0){const a=dir+span/2,cx=ox+Math.cos(a)*r,cy=oy+Math.sin(a)*r;for(let j=1;j<=4;j++){const b=a+j*.55;pts.push([cx+Math.cos(b)*cr*.28-Math.cos(a)*cr*.28,cy+Math.sin(b)*cr*.28-Math.sin(a)*cr*.28]);}}
  const rb=ribbon(pts,width*(1-k*.06),{seed:seed+k,wobble:1.2,taper:.5,pressure:.35,step:10});if(knock)s.knockout(rb);s.fill(ink,rb,cov);
  if(notch){const ax=ox+Math.cos(dir)*r*stretch,ay=oy+Math.sin(dir)*r;s.knockout(polyPath(rotPts([[-6,-22],[6,-22],[6,22],[-6,22]],dir).map(p=>[p[0]+ax,p[1]+ay] as Pt),true),.95);}
  if(curl&&k===0){const a=dir+span/2;s.knockout(circlePath(ox+Math.cos(a)*r*.82+Math.cos(dir)*r*.05,oy+Math.sin(a)*r*.82+Math.sin(dir)*r*.05+24,Math.min(14,Math.max(8,r*.09))),.95);}});
}
/** An ask-ripple: the first arc lifts into a curl with a paper dot beneath (a question drawn as water). u grows it; bold = one thick arc. */
function askRipple(s:Sheet,ox:number,oy:number,u:number,o:{r?:number;bold?:boolean;seed?:number;dir?:number;count?:number}={}){
 const{r=90,bold=false,seed=1,dir=-Math.PI/2,count=3}=o;if(u<=0)return;const g=easeOutBack(u);
 if(bold){arcs(s,Y,ox,oy,[r*g],{dir,span:2.3,width:34,seed,curl:true});return;}
 const radii:number[]=[];for(let k=0;k<count;k++)radii.push(r*g*(1+k*.55));arcs(s,Y,ox,oy,radii,{dir,span:2.3,width:18,seed,curl:true});
}
/** The rope bridge: two orange rope ribbons along `dir` with yellow plank strips across, growing from its centre (u 0..1) — where the two families of arcs meet. */
function bridge(s:Sheet,cx:number,cy:number,dir:number,len:number,wid:number,u:number,seed:number,o:{gap?:number;width?:number}={}){
 if(u<=0)return;const{gap=72,width=22}=o,g=easeOut(u),half=len*g/2,rr=rng(seed);
 s.save();s.translate(cx,cy);s.rotate(dir);
 const planks=new Path2D();for(let px=-half+gap*.5;px<=half-gap*.3;px+=gap){const j=(rr()-.5)*8;planks.addPath(polyPath(handCut([[px-width*.5,-wid/2+j],[px+width*.5,-wid/2+j],[px+width*.5+4,wid/2+j],[px-width*.5-4,wid/2+j]],seed+Math.round(px),4,60),true));}
 s.knockout(planks);s.fill(Y,planks,.95);
 const rope=(y:number,sd:number)=>{const pts:Pt[]=[];for(let px=-half;px<=half;px+=60)pts.push([px,y+6*noise1(px/120,sd)]);const rb=ribbon(pts,16,{seed:sd,wobble:1.2,taper:.3,pressure:.4,step:20});s.knockout(rb);s.fill(O,rb,.95);};
 rope(-wid/2,seed+3);rope(wid/2,seed+4);
 s.restore();
}
/** Fog: a navy halftone field over the water with torn holes and an optional clearing, drawn as one even-odd path. */
function fog(s:Sheet,box:[number,number,number,number],cov:number,seed:number,o:{holes?:number;clearing?:Pt[];amp?:number}={}){
 if(cov<=.02)return;const{holes=4,clearing,amp=40}=o,[x,y,w,h]=box,p=polyPath(torn(x,y,w,h,seed,amp,60),true),r=rng(seed+3);
 for(let i=0;i<holes;i++){const hx=x+w*(.15+.7*r()),hy=y+h*(.2+.6*r()),hr=40+r()*90;p.addPath(polyPath(blob(hx,hy,hr*1.4,hr,seed+10+i,{amp:.2,n:16}),true));}
 if(clearing&&clearing.length>2)p.addPath(polyPath(clearing,true));
 s.tone(K,p,cov,undefined,'evenodd');
}
/** The buoy-ball: the story's football — a paper disc with a navy band, a small yellow float and two faint pentagons above and below the band; bob lifts it. */
function buoy(s:Sheet,x:number,y:number,bob=0,seed=1,r=50){const yy=y-bob,pts=blob(x,yy,r,r*.92,seed,{amp:.03,n:32}),d=polyPath(pts,true);s.knockout(d);
 s.save();s.clip(d);const pent=(cx:number,cy:number,pr:number,a0:number)=>{const q:Pt[]=[];for(let i=0;i<5;i++){const a=a0+i/5*TAU;q.push([cx+Math.cos(a)*pr,cy+Math.sin(a)*pr]);}return polyPath(q,true);};
 const pp=new Path2D();pp.addPath(pent(x-r*.35,yy-r*.5,r*.24,.3));pp.addPath(pent(x+r*.4,yy+r*.55,r*.24,.9));pp.addPath(pent(x-r*.5,yy+r*.6,r*.2,1.6));s.fill(K,pp,.5);s.restore();
 s.fill(K,ribbon([[x-r*.95,yy+r*.15],[x+r*.95,yy+r*.15]],r*.34,{seed:seed+1,wobble:.6,taper:.1}));s.fill(Y,polyPath(blob(x,yy-r*.35,r*.28,r*.28,seed+2,{amp:.05,n:16}),true));contour(s,K,pts,Math.max(4,r*.1),{close:true,seed:seed+3,pressure:.5});}
/** A wake: two paper lines trailing a moving thing. */
const wake=(s:Sheet,from:Pt,to:Pt,seed:number,cov=.85)=>{const dx=to[0]-from[0],dy=to[1]-from[1],L=Math.hypot(dx,dy)||1,nx=-dy/L*16,ny=dx/L*16;s.knockout(ribbon([[from[0]+nx,from[1]+ny],[to[0]+nx*1.6,to[1]+ny*1.6]],7,{seed,wobble:1,taper:.6}),cov);s.knockout(ribbon([[from[0]-nx,from[1]-ny],[to[0]-nx*1.6,to[1]-ny*1.6]],7,{seed:seed+1,wobble:1,taper:.6}),cov);};
/** A raft: a small navy-contoured float with plank lines; rock tilts it. */
function raft(s:Sheet,x:number,y:number,w:number,rock=0,seed=1){const pts=rotPts(torn(-w/2,-34,w,68,seed,6,24),rock,0,0).map(p=>[p[0]+x,p[1]+y] as Pt),path=polyPath(pts,true);s.knockout(path);s.fill(Y,path,.45);contour(s,K,pts,8,{close:true,seed:seed+1,pressure:.5});const pl=new Path2D();for(let i=1;i<4;i++){const q=rotPts([[-w/2+w*i/4,-30],[-w/2+w*i/4,30]],rock);pl.moveTo(x+q[0][0],y+q[0][1]);pl.lineTo(x+q[1][0],y+q[1][1]);}s.stroke(K,pl,4,.8);}
/** Sand puff / splatter: specks flung with gravity, settling. */
function specks(s:Sheet,ink:string,x:number,y:number,n:number,seed:number,age:number,o:{life?:number;size?:number;up?:number}={}){
 if(age<0)return;const{life=.5,size=10,up=180}=o,r=rng(seed),k=clamp(age/life),e=easeOut(k),p=new Path2D();
 for(let i=0;i<n;i++){const a=r()*TAU,v=100+r()*200,px=x+Math.cos(a)*v*e,py=y+(Math.sin(a)*v-up*r())*e+480*k*k,sz=size*(.5+r());p.rect(px,py,sz,sz*(.7+r()*.6));}
 s.fill(ink,p);
}
/** The ear curl (the once-only ear): returning orange arcs curled into a small crescent at a listener's head, opening toward the speaker. */
function earCurl(s:Sheet,x:number,y:number,u:number,seed:number,dir=1,recurl=0){
 if(u<=0)return;const g=easeOutBack(u),r=70*g,path=crescent(x,y,r,[.55*dir,-.1+recurl*.2],1.05);s.knockout(path);s.fill(O,path,.85);
 for(let k=0;k<2;k++){const rr=r*(.5+k*.3);arcs(s,O,x+dir*r*.2,y,[rr],{dir:dir>0?0:Math.PI,span:2.2,width:6,seed:seed+k,cov:.9});}
 contour(s,K,blob(x,y,r,r,seed,{amp:.03,n:30}),5,{close:true,seed:seed+7,pressure:.4,gaps:[[.05,.32]]});
}

// ---------------- chapters ----------------
/** 1 — the child on the near shore slumps and the flag droops; a question raises the flag and sends arcs; the coach on the far shore waves back. */
const ch1:Scene={
 draw(s,t){
  const tt=twos(t),dead=sm(1.36,1.96,t),fogIn=sm(1.5,2.3,t,easeIn),fogLift=10*sm(2.84,3.1,t),fogPush=sm(3.9,5.7,t);
  const v=cam(s,t,[[0,0,60,1],[1.36,0,60,1],[2.76,-200,320,1.25],[3.9,-200,320,1.25],[5.7,0,-200,1.25],[6.6,200,-460,1.4],[7.6,200,-460,1.4],[8.95,-60,-100,1.6,-.05],[9.617,-60,-100,1.62,-.05]]);
  s.camera(v[0],v[1],v[2],v[3]);
  s.field(G,.12,.4);
  const wakeK=(k:number)=>sm(3.9+(5-k)*.3,4.3+(5-k)*.3,t,easeOut);
  water(s,{y0:-560,y1:440,amp:(x,k)=>18*Math.max(1-dead,wakeK(k)*(1+.3*Math.sin(Math.min(1,wakeK(k))*Math.PI))),sag:20*fogIn-fogLift,seed:11});
  shore(s,Y,'near',520,12);shore(s,O,'far',-620,13);
  glints(s,[-900,-300,1800,500],18,14,dead<.5||fogPush>.3?1:0);
  // the fog band: settles onto the middle water, presses it, lifts where the question is born, thins as the arcs cross it
  const fogCov=fogIn*lerp(.5,.3,fogPush),fogY=lerp(-700,-260,fogIn)-fogLift-40*fogPush;
  fog(s,[-1500,fogY,3000,320],fogCov,15,{holes:3});
  // the child (yellow figure) holds the flag: slumps and the flag droops together, snaps up on the question; the coach (orange figure) unfurls when the arcs arrive
  const droop=1-sm(.2,.6,t,easeIn)+.1*sm(0,.2,t)*(1-sm(.2,.4,t)),snap=t<2.84?0:easeOut(sm(2.84,3.14,t,linear));
  const youFly=t<2.84?droop:snap*(1+.12*Math.sin(Math.min(1,snap)*Math.PI))+settle(t,3.14,{amp:.06,freq:5,decay:5})+(t>=7.6?.05*sm(7.6,7.9,t):0);
  const fl1=t>=3.14?settle(t,3.14,{amp:1,freq:6,decay:3}):0,fl2=t>=6.12?settle(t,6.12,{amp:1,freq:6,decay:3}):0;
  const youK=t<2.84?1-droop:1-snap;
  flagBearer(s,-300,560,380,t<2.84?'slump':'wave',{ink:Y,seed:16,face:1,k:t<2.84?youK:clamp(snap*1.1),shade:G},Y,clamp(youFly,0,1.1),{seed:16,flutter:fl1,pole:300});
  const coachUp=t<5.72?0:easeOutBack(sm(5.72,6.12,t));
  flagBearer(s,300,-560,280,'wave',{ink:O,seed:17,face:-1,k:coachUp,shade:K,cov:lerp(.6,.92,coachUp),backing:true},O,coachUp,{dir:-1,seed:17,furl:1-coachUp,flutter:fl2,cov:lerp(.5,1,coachUp),pole:260});
  // the ask-ripple, its arcs crossing the lake, the returning arc
  askRipple(s,-200,500,sm(2.84,3.3,t),{r:60,seed:18});
  const born=[3.9,4.23,4.57,4.9],radii=born.map(b=>t<b?0:Math.min(1150,(t-b)*640*(1+.15*Math.sin(Math.min(1,(t-b)/.5)*Math.PI))));
  arcs(s,Y,-200,500,radii,{dir:-1.35,span:1.6,width:22,seed:19});
  const ret=t<5.9?0:Math.min(1130,(t-5.9)*680);if(ret>0)arcs(s,O,300,-600,[ret,Math.max(0,ret-160)],{dir:Math.PI/2+.35,span:1.5,width:22,seed:20});
  if(t>=2.84)specks(s,Y,-200,520,5,21,tt-2.84,{size:8,up:100});
 },
 aperture(){return apertureDisc(-60,-100,110,12);},
};
/** 2 — duotone navy + yellow: inside the fog, lanes tangle; "not sure" clears a ripple-shaped channel; the coach is revealed by the look. */
const ch2:Scene={
 draw(s,t){
  const tt=twos(t),press=sm(0,.8,t,easeIn),camShake=t>=1.5&&t<1.8?shake(t,22,2):0;
  const v=cam(s,t,[[0,0,60,1],[1.5,0,60,1],[2.7,-60,120,1.25],[3.44,-60,120,1.25],[4.84,40,-80,1.2],[5.26,40,-80,1.2],[6.26,200,-240,1.4],[7.34,200,-240,1.4],[8.44,80,0,1.45],[9.2,80,0,1.45],[9.867,490,-450,2.2],[10.517,490,-450,2.25]]);
  s.camera(v[0]+camShake,v[1],v[2],v[3]+.02*press*(1-sm(3.44,4,t)));
  s.field(K,.1,.4);
  const clearU=sm(3.44,4.64,t,easeOut),widen=120*sm(9.2,9.8,t,easeOut),spring2=sm(3.44,3.9,t,easeOut);
  const sag=30*press*(1-spring2)+(t>=3.9?6*settle(t,3.9,{amp:1,freq:4,decay:4}):0);
  water(s,{ink:K,y0:-520,y1:520,n:5,cov0:.12,cov1:.3,amp:12,sag,seed:23,wave:380});
  s.tone(K,polyPath(torn(-1600,640,3200,1400,24,30,60),true),.2);
  // the clearing: a fan the arcs push open through the fog, from the ask-ripple upward
  const clearing:Pt[]=[];if(clearU>0){const R=980*clearU,cx=0,cy=300;clearing.push([cx-90-widen*.3,cy+40]);for(let i=0;i<=10;i++){const a=-Math.PI/2-1.05+2.1*i/10;const rr=R*(1+.08*noise1(i*1.3,25));clearing.push([cx+Math.cos(a)*rr*(1+widen/900),cy+Math.sin(a)*rr]);}clearing.push([cx+90+widen*.3,cy+40]);}
  const fogCov=lerp(.6,.75,press)-.1*clearU;fog(s,[-1700,-1100,3400,1800],fogCov,26,{holes:5,clearing,amp:50});
  // the coach revealed through the clearing, rising with the flag (yellow tone in the duotone)
  const reveal=t<5.4?0:easeOutBack(sm(5.4,5.8,t));if(clearU>.5)flagBearer(s,400,-160,280,'wave',{ink:Y,seed:27,face:-1,k:reveal,cov:lerp(.4,.9,reveal)},Y,reveal,{dir:-1,seed:27,pole:260,furl:1-reveal,cov:lerp(.4,.9,reveal),flutter:t>=7.34?settle(t,7.34,{amp:1,freq:6,decay:3}):0});
  // lanes: three dashed navy lanes leaving the child's feet; tangled with a loop and crossings on "confusing"; replaced by one lane behind the returning arc
  const tangle=t<1.5?0:sm(1.5,1.5+2/12,t,linear),lsh=t>=1.5&&t<1.9?shake(t,28,6):0,replaced=sm(7.5,8.14,t);
  const laneSeg=(pts:Pt[],seed:number,cov:number)=>{const q=smoothPts(pts,false,10);const n=q.length,dash=new Path2D();for(let i=0;i<n-4;i+=8){const a=q[i],b=q[Math.min(n-1,i+5)];dash.addPath(ribbon([a,b],9,{seed:seed+i,wobble:.5,taper:.3}));}s.fill(K,dash,cov);};
  if(replaced<1){const c=1-replaced;
   laneSeg([[-200,420],[-40,240+lsh],[140,120],[300,-60]],29,c);
   laneSeg([[-200,420],[-120,200+lsh],[lerp(-160,-20,tangle),lerp(0,120,tangle)],[lerp(-100,-220,tangle),lerp(-200,-40,tangle)],[-60,-260]],30,c);
   laneSeg([[-200,420],[60+lsh,360],[lerp(220,120,tangle),lerp(260,180,tangle)],[lerp(360,260,tangle),lerp(120,300,tangle)],[440,60]],31,c);
   if(tangle>0)laneSeg([[-40,120],[40,60+lsh],[20,160],[-60,100]],32,c*tangle);}
  if(replaced>0)laneSeg([[-200,420],[0,220],[200,20],[400,-190]],33,replaced);
  if(t>=1.5)specks(s,K,-40,120,8,34,tt-1.5,{size:8,up:120});
  // the child: pushed to half-mast (slumps), folds, snaps up on the question with the flag; the ask-ripple and the returning arc
  const halfMast=1-.5*press,fold=t<1.5?halfMast:lerp(halfMast,.05,sm(1.5,1.9,t,easeIn)),up=t<3.44?fold:easeOutBack(sm(3.44,3.74,t))*(t>=7.34?1:.9)+(t>=7.34?.1*sm(7.34,7.6,t):0);
  flagBearer(s,-200,460,340,t<3.44?'slump':'wave',{ink:Y,seed:35,face:1,k:t<3.44?1-fold:clamp(up),shade:K},Y,clamp(up,0,1.1),{seed:35,pole:320,flutter:t>=3.74?settle(t,3.74,{amp:1,freq:6,decay:3}):0});
  askRipple(s,-200,440,sm(0,.3,t),{r:40,seed:36,count:2});
  askRipple(s,0,300,sm(3.44,3.94,t),{r:140,seed:37});
  const ret=t<7.34?0:Math.min(760,(t-7.34)*900);if(ret>0)arcs(s,Y,400,-220,[ret,Math.max(0,ret-140)],{dir:Math.PI/2+.5,span:1.4,width:20,seed:38});
 },
 aperture(){return apertureDisc(490,-450,45,12);},
};
/** 3 — the water tilted by a current: the child leans into it and pushes arcs against the flow; the coach sends support arcs down; a rope bridge joins them. */
const ch3:Scene={
 draw(s,t){
  const tt=twos(t),tilt=-.21;
  const rotU=t<1.12?0:anticipate(1.12,2.42,t,{back:.15,hold:.2}),camRot=lerp(0,.21,rotU)+(t>=2.42?settle(t,2.42,{amp:.02,freq:3,decay:4}):0),rotEnd=lerp(.21,.14,sm(5.8,7.2,t));
  const v=cam(s,t,[[0,0,60,1],[1.12,0,60,1],[2.42,0,60,1.15],[2.6,0,60,1.15],[3.5,120,-40,1.25],[4.5,220,-120,1.3],[5.8,220,-120,1.3],[7.2,120,0,1.5],[7.4,120,0,1.5],[8.467,140,20,2],[9.117,140,20,2.05]]);
  s.camera(v[0],v[1],v[2],(t<5.8?camRot:rotEnd)+.03*sm(2.6,3,t)*(1-sm(3,3.6,t)));
  s.field(G,.12,.4);
  s.save();s.rotate(tilt);
  const push=sm(2.6,3.5,t);
  water(s,{y0:-560,y1:440,amp:14,seed:41,bulge:x=>-20*push*Math.exp(-Math.pow((x-100)/500,2))});
  shore(s,Y,'near',560,42);shore(s,O,'far',-640,43);
  const lat=sm(5.8,6.6,t,easeOut);
  for(let i=0;i<7;i++){const x0=-900+i*300+(twosIndex(t)%3)*20,y0=-300+(i%3)*200;speedLines(s,K,x0,y0,-2.6,{n:3,seed:44+i,len:260,spread:40,width:5,cov:lerp(.6,.2,lat)});}
  glints(s,[-1000,-400,2000,700],16,45);
  s.restore();
  // the child leans into the current (torso tilted, one leg back), the flag in the raised hand; the coach on the far side waves the support in
  const leanK=sm(2.6,3.2,t,easeOut)*(1-.3*lat),cf=t<3.5?0:easeOutBack(sm(3.5,3.9,t));
  flagBearer(s,-260,560,380,'lean',{ink:Y,seed:46,face:1,k:leanK,from:'wave',shade:G,tilt:tilt*.3},Y,1,{seed:46,pole:300,rot:tilt*.4,flutter:t>=5.8?settle(t,5.8,{amp:1,freq:6,decay:3}):0});
  flagBearer(s,440,-380,290,'wave',{ink:O,seed:47,face:-1,k:lerp(.5,1,cf),shade:K,backing:true},O,lerp(.6,1,cf),{dir:-1,seed:47,pole:260,rot:tilt*.4,flutter:t>=3.9?settle(t,3.9,{amp:1,freq:6,decay:3}):0});
  // the ask-ripple and its arcs: born with paper notches, elongated as they push against the current, stalling and recoiling
  askRipple(s,-200,420,sm(0,.4,t),{r:70,seed:48,dir:-.9});
  const born=[1.3,1.75,2.2],against=sm(2.6,3.2,t),stretch=lerp(1,1.35,against*(1-.5*lat));
  const radii=born.map((b,k)=>{if(t<b)return 0;const fast=Math.min(1,(t-b)/.6)*220,slow=Math.max(0,t-2.6)*150;return Math.min(1000,fast+slow-(t>=3.4?8*settle(t,3.4+k*.2,{amp:1,freq:4,decay:4}):0));});
  arcs(s,Y,-200,420,radii,{dir:-.9,span:1.5,width:20,seed:49,stretch,stretchDir:-.9,notch:true});
  const ret=t<3.5?0:Math.min(1100,(t-3.5)*340);const rr=[ret,Math.max(0,ret-140),Math.max(0,ret-280)];if(ret>0)arcs(s,O,440,-360,rr,{dir:Math.PI-.9,span:1.5,width:20,seed:50});
  // the rope bridge: where the two families travel into each other, planks and ropes print across the middle band, shore to shore
  bridge(s,140,-40,-.9,900,200,lat,51);
 },
 aperture(){return apertureDisc(140,-40,40,12);},
};
/** 4 — from above with a pitch on the water: the two figures on rafts; one clear question; pass then move up the lane; shown again slower. */
const ch4:Scene={
 draw(s,t){
  const tt=twos(t);
  const v=cam(s,t,[[0,0,120,1],[1.82,0,120,1],[2.82,0,100,1.2],[3.22,0,100,1.2],[4.42,60,-40,1.3],[5.76,60,-40,1.3],[7.16,0,-60,1.4,-.05],[7.6,0,-60,1.4,-.05],[8.367,60,-340,2.1,-.05],[9.017,60,-340,2.15,-.05]]);
  s.camera(v[0],v[1],v[2],v[3]);
  s.field(G,.12,.4);
  water(s,{y0:-700,y1:420,n:6,amp:8,seed:61,wave:520});shore(s,Y,'near',560,62);
  glints(s,[-900,-500,1800,900],20,63);
  // the water pitch: paper lines growing across the surface, tips leading
  const pl=sm(1.82,2.42,t,easeOut);
  if(pl>0){const line=(pts:Pt[],seed:number)=>s.knockout(ribbon(partial(smoothPts(pts,false,20),pl),12,{seed,wobble:1.2,taper:.2,step:30}),.92);
   line([[-760,300],[760,300]],64);line([[400,300],[400,-100],[760,-100]],65);line([[0,-420],[0,300]],66);}
  // the rafts carry the figures; pass then move, then shown again slower
  const push1=sm(3.42,4.12,t,easeOut),laneU=sm(4.12,4.42,t,easeOut),move=t<4.42?0:anticipate(4.42,5.22,t,{back:.05,hold:.15}),over=t>=5.22?settle(t,5.22,{amp:20,freq:4,decay:5}):0;
  const youX=lerp(-260,60,clamp(move))+over*.7,youY=lerp(300,-200,clamp(move))-over;
  const mateDip=t>=4.12?12*settle(t,4.12,{amp:1,freq:4,decay:5}):0,rock1=t>=5.22?settle(t,5.22,{amp:.08,freq:5,decay:4}):(t>=2.42?settle(t,2.42,{amp:.04,freq:5,decay:5}):0);
  if(laneU>0){const dash=new Path2D();const a:Pt=[-260,300],b:Pt=[60,-200];for(let i=0;i<8;i++){const u0=i/8*laneU,u1=Math.min(laneU,(i+.55)/8);if(u1<=u0)continue;dash.addPath(ribbon([[lerp(a[0],b[0],u0),lerp(a[1],b[1],u0)],[lerp(a[0],b[0],u1),lerp(a[1],b[1],u1)]],10,{seed:67+i,wobble:.5,taper:.3}));}s.knockout(dash,.9);}
  const replay=sm(5.9,7.3,t,linear);
  if(replay>0){const dash=new Path2D();const a:Pt=[-260,300],b:Pt=[60,-200];for(let i=0;i<8;i++){const on=replay*9-i;if(on<=0)continue;const u0=i/8,u1=(i+.55)/8;dash.addPath(ribbon([[lerp(a[0],b[0],u0),lerp(a[1],b[1],u0)],[lerp(a[0],b[0],u1),lerp(a[1],b[1],u1)]],on>=1?14:8,{seed:75+i,wobble:.5,taper:.3}));}s.fill(K,dash,.7);}
  raft(s,youX,youY+40,220,rock1,68);raft(s,280,-20+mateDip,220,t>=4.12?settle(t,4.12,{amp:.06,freq:5,decay:4}):0,69);
  const kick=t>=3.22&&t<3.8?sm(3.22,3.42,t,easeIn)*(1-sm(3.6,3.8,t)):0,moving=move>0&&move<1,replayKick=t>=6.5&&t<7.1?sm(6.5,6.7,t,easeIn)*(1-sm(6.9,7.1,t)):0;
  flagBearer(s,youX,youY+20,280,kick>0||replayKick>0?'kick':moving?walkPose(t,true):'wave',{ink:Y,seed:70,face:1,k:kick>0?kick:replayKick>0?replayKick:1,shade:G},Y,1,{seed:70,pole:240,flutter:t>=5.22?settle(t,5.22,{amp:1,freq:6,decay:3}):0});
  flagBearer(s,280,-40+mateDip,280,t>=4.12&&t<4.6?'crouch':'wave',{ink:O,seed:71,face:-1,k:t>=4.12&&t<4.6?.5:1,shade:K},O,1,{dir:-1,seed:71,pole:240});
  // arcs: three thin ones merge into one bold arc; the second ask at the new spot
  const merge=sm(0,.4,t,easeOut);
  if(merge<1){arcs(s,Y,-200,340,[100,130,160].map(r=>lerp(r,140,merge)),{dir:-Math.PI/2,span:2.3,width:lerp(7,20,merge),seed:72,curl:true});}
  else askRipple(s,-200,340,1,{r:140,bold:true,seed:72});
  askRipple(s,60,-200,sm(5.76,6.2,t),{r:140,bold:true,seed:73});
  // the buoy-ball: bobbed back, pushed to the teammate (wake), pushed back to the new spot, bobbing to rest
  let bx=-200,by=340;const back=sm(5.96,6.66,t,easeOut);
  if(t<3.42)bx=-200-15*sm(3.22,3.42,t);else if(t<5.96){bx=lerp(-200,300,push1);by=lerp(340,40,push1);}else{bx=lerp(300,120,back);by=lerp(40,-150,back);}
  if(push1>0&&push1<1)wake(s,[-200,340],[bx,by],74);if(back>0&&back<1)wake(s,[300,40],[bx,by],76);
  const bob=t>=6.66?8*settle(t,6.66,{amp:1,freq:4,decay:4}):(t>=4.12&&t<5.96?6*settle(t,4.12,{amp:1,freq:4,decay:4}):0);
  buoy(s,bx,by,bob,77,62);
 },
 aperture(){return apertureDisc(60,-340,18,10);},
};
/** 5 — the far shore close: the coach answers; the child listens (head tilted, hand to the ear curl); try slowly together; a pennant slips; ask again; two rafts join. */
const ch5:Scene={
 draw(s,t){
  const tt=twos(t),dip=15*sm(3.46,3.7,t,easeIn)*(1-sm(3.9,4.5,t));
  const v=cam(s,t,[[0,60,-200,1],[.8,0,0,1],[1.74,0,0,1],[2.84,80,120,1.2],[3.46,80,120,1.2],[4.46,-100,215,1.35],[5,-100,215,1.35],[6,-60,40,1.4],[6.64,-60,40,1.4],[8.04,-80,160,1.5,.05],[8.6,-80,160,1.5,.05],[10.167,-120,120,2.2,.05],[10.817,-120,120,2.25,.05]]);
  s.camera(v[0],v[1]+dip,v[2],v[3]);
  s.field(G,.12,.4);
  const halfAmp=lerp(1,.5,sm(3.46,3.8,t)),ampBack=t<5?halfAmp:lerp(.5,1,sm(5,5.6,t));
  const between=sm(1.9,3,t)*(1-sm(6.64,7.44,t))+sm(6.64,7.44,t);
  water(s,{y0:-200,y1:440,n:4,cov0:.35,cov1:.7,amp:(x,k)=>18*(t<5?halfAmp:ampBack)*(k===2?1-.7*between:1),seed:81});
  shore(s,O,'far',-260,82);glints(s,[-900,-150,1800,600],14,83);
  // the coach on the far shore speaks (points) while the answer arcs return; re-sends on the second question
  const speak=sm(0,.4,t,easeOutBack)*(1-sm(1.2,1.6,t))+sm(5.2,5.5,t,easeOutBack)*(1-sm(6.4,6.8,t));
  flagBearer(s,300,-280,320,'point',{ink:O,seed:84,face:-1,k:speak,shade:K,backing:true},O,1,{dir:-1,seed:84,pole:300,flutter:t>=5.8?settle(t,5.8,{amp:1,freq:6,decay:3}):0});
  const ret1=t<.1?0:Math.min(560,t*700),ret2=t<5.2?0:Math.min(600,(t-5.2)*760);
  if(ret1>0&&t<1.2)arcs(s,O,300,-300,[ret1,Math.max(0,ret1-120)],{dir:Math.PI/2+.7,span:1.4,width:18,seed:86});
  if(ret2>0)arcs(s,O,300,-300,[ret2,Math.max(0,ret2-140)],{dir:Math.PI/2+.5,span:1.4,width:18,seed:87});
  // rafts converge slowly, then join into one; the child listens (head tilted, hand to the ear curl), then tries; the pennant slips and snaps back up
  const slow=sm(2.84,4.04,t),join=t<6.64?0:anticipate(6.64,7.44,t,{back:.06,hold:.2,e:easeIn});
  const youX=lerp(lerp(-260,-180,slow),-190,clamp(join)),youY=lerp(lerp(260,240,slow),220,clamp(join)),mateX=lerp(lerp(320,240,slow),-50,clamp(join)),mateY=lerp(lerp(120,180,slow),220,clamp(join));
  const bob=t>=7.44?settle(t,7.44,{amp:.06,freq:4,decay:3}):0;
  if(join>=1){raft(s,-120,240,360,bob,88);}else{raft(s,youX,youY+20,220,t>=4.04?settle(t,4.04,{amp:.05,freq:5,decay:4}):0,88);raft(s,mateX,mateY+20,220,t>=4.04?settle(t,4.04,{amp:.05,freq:5,decay:4,phase:1}):0,89);}
  const slip=t<3.46?1:lerp(1,.5,sm(3.46,3.76,t,easeIn)),snap=t<5?slip:easeOutBack(sm(5,5.3,t));
  const listenK=sm(0,.5,t,easeOutBack)*(1-sm(1.74,2.1,t))+sm(5.4,5.8,t,easeOutBack)*(1-sm(6.64,7,t)),kick=t>=1.94&&t<2.6?sm(1.94,2.1,t,easeIn)*(1-sm(2.4,2.6,t)):0,unsure=sm(3.46,3.76,t,easeIn)*(1-sm(5,5.3,t));
  const pose:Pose=listenK>0?'listen':kick>0?'kick':unsure>0?'slump':'wave';
  const fy=flagBearer(s,youX,youY,290,pose,{ink:Y,seed:90,face:1,k:listenK>0?listenK:kick>0?kick:unsure>0?unsure:1,look:listenK*.7,shade:G},Y,clamp(snap,0,1.1),{seed:90,pole:250,flutter:t>=8.6?settle(t,8.6,{amp:1,freq:6,decay:3}):(t>=3.76?settle(t,3.76,{amp:1,freq:5,decay:3}):0)});
  if(fy&&listenK>0)earCurl(s,fy.head[0]+fy.R*1.15,fy.head[1],listenK,85,1,sm(5,5+2/12,t,linear));
  flagBearer(s,mateX,mateY,290,t>=3.04&&t<3.5?'crouch':'wave',{ink:O,seed:91,face:-1,k:t>=3.04&&t<3.5?.5:1,shade:K},O,1,{dir:-1,seed:91,pole:250,flutter:t>=8.6?settle(t,8.6,{amp:1,freq:6,decay:3}):0});
  if(t>=3.46)specks(s,K,youX,youY,6,92,tt-3.5,{size:8,up:120});
  askRipple(s,youX+40,youY+30,sm(5,5.4,t),{r:110,seed:93});
  // the buoy-ball: pushed slowly to the teammate, then rolls to rest between the two
  const pushU=sm(2.1,3.04,t,easeOut);let bx=lerp(youX+70,mateX-60,pushU),by=lerp(youY+30,mateY+40,pushU);
  if(t>=6.64){const roll=sm(6.9,7.6,t);bx=lerp(mateX-60,-120,roll);by=lerp(mateY+40,250,roll);}
  if(pushU>0&&pushU<1)wake(s,[youX+70,youY+30],[bx,by],94);
  buoy(s,bx,by,t>=3.04?6*settle(t,3.04,{amp:1,freq:4,decay:4}):0,95,58);
 },
 aperture(){return apertureDisc(-120,100,100,12);},
};
/** 6 — the wide lake, further forward: a silent figure turned away gives nothing; another answers; a rope bridge; one step out onto it. */
const ch6:Scene={
 draw(s,t){
  const tt=twos(t),drop=20*sm(1.1,1.3,t,easeIn)*(1-sm(1.5,2.2,t));
  const v=cam(s,t,[[0,0,0,.8],[1.4,-300,-200,.9],[1.58,-300,-200,.9],[3.2,400,-200,1],[3.96,400,-200,1],[4.86,600,-300,1.15],[6,400,0,1.2],[6.62,400,0,1.2],[7.8,-75,367,1.6],[10.915,-40,340,1.7]]);
  s.camera(v[0],v[1]+drop,v[2],v[3]);
  s.field(G,.12,.4);
  const dieU=sm(1.1,1.4,t),wakeR=sm(1.9,3.1,t);
  water(s,{y0:-560,y1:440,amp:(x,k)=>18*(x<-400&&k<3?1-dieU:1)*(x>-200?1+.4*wakeR*Math.sin(Math.min(1,wakeR)*Math.PI):1),seed:101});
  shore(s,Y,'near',520,102);shore(s,O,'far',-620,103);
  const faint=(pts:Pt[],seed:number)=>s.knockout(ribbon(pts,10,{seed,wobble:1,taper:.2,step:40}),.35);faint([[-600,300],[600,300]],104);faint([[0,-420],[0,300]],105);
  glints(s,[-1000,-300,2000,600],18,106);
  // three far-shore people: the silent one (grey, turned away, flag furled) never answers; the coach; the second trusted person rises on "connection"
  flagBearer(s,-700,-580,300,'slump',{ink:K,seed:108,face:-1,k:.7,cov:.3,backing:true},null,.3,{dir:-1,seed:108,furl:.6,pole:260});
  flagBearer(s,300,-600,300,'wave',{ink:O,seed:109,face:-1,shade:K,backing:true},O,1,{dir:-1,seed:109,pole:280,flutter:t>=8.5?settle(t,8.5,{amp:1,freq:6,decay:3}):0});
  const second=t<4.7?0:easeOutBack(sm(4.7,5.1,t));flagBearer(s,1100,-560,300,'wave',{ink:O,seed:110,face:-1,k:second,cov:lerp(.6,.92,second),shade:K,backing:true},O,lerp(.3,1,second),{dir:-1,seed:110,pole:280,furl:(1-second)*.6,flutter:t>=8.5?settle(t,8.5,{amp:1,freq:6,decay:3,phase:1}):0});
  // the signal to the silent one: arcs flatten, slip and die at the shore
  const r1=t<.15?0:Math.min(1150,t*760),flat=sm(1.1,1.1+2/12,t,linear);
  if(t>=.15&&t<2.4)arcs(s,Y,-260,500,[r1,Math.max(0,r1-150),Math.max(0,r1-300)],{dir:-2.1,span:1.4,width:20,seed:111,flat,cov:1-.6*sm(1.4,2.4,t)});
  if(t>=1.1)specks(s,K,-640,-540,6,112,tt-1.1,{size:7,up:90});
  // the child re-aims (counter-turn then turns to face right), sends a new ask-ripple up-right; the arcs merge into one bold arc; one step out onto the bridge
  const turn=t<1.58?0:anticipate(1.58,1.98,t,{back:.2,hold:.3}),rot=lerp(0,.35,turn)+(t>=1.98?settle(t,1.98,{amp:.05,freq:4,decay:5}):0);
  const stepU=t<6.62?0:anticipate(6.62,7.22,t,{back:.08,hold:.3}),over=t>=7.22?settle(t,7.22,{amp:20,freq:4,decay:5}):0;
  const bx=-260+(240*clamp(stepU)+over)*Math.cos(-.69),by=520+(240*clamp(stepU)+over)*Math.sin(-.69);
  if(stepU>0){raft(s,bx,by+20,220,t>=7.22?settle(t,7.22,{amp:.07,freq:5,decay:4}):0,113);wake(s,[-260,520],[bx,by+20],114,.6);}
  const moving=stepU>0&&stepU<1;
  flagBearer(s,bx,by,380,moving?walkPose(t,true):'wave',{ink:Y,seed:115,face:turn>.5?1:-1,k:1,shade:G},Y,1,{seed:115,pole:300,rot:turn>.5?rot-.35:-rot,flutter:t>=1.98?settle(t,1.98,{amp:1,freq:6,decay:3}):0});
  const r2=t<1.98?0:Math.min(1500,(t-1.98)*700),merge=sm(3.96,4.36,t,easeOut);
  if(t>=1.98&&merge<1)arcs(s,Y,-260,500,[r2,Math.max(0,r2-150),Math.max(0,r2-300)].map((r,k)=>lerp(r,r2-150,merge)),{dir:-.69,span:1.3,width:lerp(20,34,merge),seed:116,curl:true});
  else if(t>=1.98)arcs(s,Y,-260,500,[r2-150],{dir:-.69,span:1.3,width:36,seed:116,curl:true});
  askRipple(s,-260,500,sm(1.98,2.4,t),{r:80,seed:117,dir:-.69});
  // the bridge: orange returning arcs meet the outgoing ones and the rope bridge prints shore to shore
  const r3=t<5.1?0:Math.min(1500,(t-5.1)*900);if(r3>0)arcs(s,O,1100,-580,[r3,Math.max(0,r3-140)],{dir:Math.PI-.69,span:1.3,width:20,seed:118});
  bridge(s,420,-40,-.69,1500,220,sm(5.3,6.2,t),119,{gap:80,width:22});
  if(t>=7.22)contour(s,K,[[bx-30,by+70],[bx-10,by+96]],10,{seed:120,taper:.4,cov:sm(7.22,7.5,t)>.5?1:.5});
 },
 still:6,
};

export const story:RisoStory={
 id:'signal-water',format:'7v7',title:'The Signal Across the Water',theme:'Asking for help',ageNote:'An explanation of asking clear questions and learning with support.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',orange:'#ff6c2f',green:'#00a95c',navy:'#22366b'},order:['yellow','orange','green','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:[
  {label:'Send a signal',narration:'Have you ever needed help but stayed quiet? A question is like a signal across water. It lets someone know where you are.',seconds:9.617,audio:CH+'1.m4a',cues:[{at:0,words:'Have you ever needed help'},{at:1.36,words:'stayed quiet'},{at:2.84,words:'A question'},{at:3.9,words:'signal across water'},{at:5.72,words:'It lets someone know'}]},
  {label:'Make it clear',headline:'Not sure',narration:'People cannot always see what feels confusing. Saying, I am not sure, gives a teammate or coach somewhere to begin helping you.',seconds:10.517,audio:CH+'2.m4a',cues:[{at:0,words:'People cannot always see'},{at:1.5,words:'what feels confusing'},{at:3.44,words:'Saying I am not sure'},{at:5.26,words:'gives a teammate or coach'},{at:7.34,words:'begin helping'}]},
  {label:'Asking is a skill',headline:'Both',narration:'Asking for help is part of learning. You can try hard and need support at the same time. Both can be true.',seconds:9.117,audio:CH+'3.m4a',cues:[{at:0,words:'Asking for help'},{at:1.12,words:'part of learning'},{at:2.6,words:'try hard'},{at:3.5,words:'need support'},{at:5.8,words:'Both can be true'}]},
  {label:'Name what you need',headline:'Ask',narration:'Make your signal clear. In football, you could ask, Where should I move after I pass? Or, Can you show me again?',seconds:9.017,audio:CH+'4.m4a',cues:[{at:0,words:'Make your signal clear'},{at:1.82,words:'In football'},{at:3.22,words:'Where should I move after I pass'},{at:5.76,words:'Can you show me again'}]},
  {label:'Listen, then try',narration:'Listen to the answer. Try it slowly together. If you still feel unsure, ask another question. Learning does not have to happen alone.',seconds:10.817,audio:CH+'5.m4a',cues:[{at:0,words:'Listen to the answer'},{at:1.74,words:'Try it slowly together'},{at:3.46,words:'If you still feel unsure'},{at:5,words:'ask another question'},{at:6.64,words:'Learning does not have to happen alone'}]},
  {label:'Keep reaching out',headline:'Keep asking',narration:'If someone cannot help, ask another trusted person. A clear question opens a connection. Then you can take your next step with support.',seconds:10.915,audio:CH+'6.m4a',cues:[{at:0,words:'If someone cannot help'},{at:1.58,words:'ask another trusted person'},{at:3.96,words:'A clear question'},{at:4.7,words:'opens a connection'},{at:6.62,words:'Then you can take your next step'}]},
 ],
 draw(f){playChapters(story,f,[ch1,ch2,ch3,ch4,ch5,ch6]);},
 touch(s,x,y,age,seed){
  // a ripple ring on the water: a paper splash that shrinks, a yellow arc ring with a navy contour that grows and fades; sand grains fly where it lands
  const u=age>0?easeOut(clamp(age/.7)):.5,fade=age>0?1-clamp((age-.45)/.35):1;if(fade<=0)return;
  s.knockout(polyPath(blob(x,y,90*(1-.7*u),50*(1-.7*u),seed+3,{amp:.08,n:24}),true),.9*fade);
  const r=30+150*u,rp=ribbon(blob(x,y,r,r*.55,seed,{amp:.05,n:36}),Math.max(6,16*(1-u*.4)),{seed,close:true,wobble:1.4,pressure:.4});s.knockout(rp,.9);s.fill(Y,rp,fade>.5?1:.6);
  contour(s,K,blob(x,y,r*1.08,r*.6,seed+1,{amp:.05,n:36}),5,{close:true,seed:seed+1,cov:.8*fade,gaps:[[.1,.2],[.6,.7]]});
  if(u<.6)s.fill(Y,ribbon(blob(x,y,r*.5,r*.28,seed+1,{amp:.05,n:24}),6,{seed:seed+1,close:true,wobble:1.2}),.9);
  specks(s,Y,x,y,8,seed+2,age-.05,{size:9,up:140,life:.5});
 },
};
