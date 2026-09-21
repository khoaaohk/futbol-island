/** Regulating Emotions ("Two games") — riso, TRACK mode. Captions are the 19 timeline cues on media time; the picture is nine
 * visual chapters (`visualChapters`) driven by the same clock through `trackChapters`. Paper is the space between inks: the torn
 * channel (frustration), the nested arches (fear), the layered star (anger), the ribbons with the scribble disc (control), the paper
 * gap (breath) — the three reference frames re-drawn. People are ABSTRACT riso figures (bible §1c.4): head disc + torso block +
 * limb strokes, toy proportions, no face — `figure()` below. The visible game is a GREEN pitch (yellow × blue overprint).
 * Inks: yellow → orange → blue → navy on cream. blue × yellow = green (pitch, ribbon); orange × blue = brown (once, at anger's core). */
import type {Sheet} from '../sheet';
import {type RisoStory,type Scene,type Chapter,playChapters,trackChapters} from '../story';
import {apertureDisc} from '../passage';
import {twos,twosIndex,sm,easeOut,easeIO,easeIn,easeOutBack,key,camKeys,anticipate,settle,clamp,lerp,rng,blob,polyPath,ribbon,wob,rotPts,circlePath,rectPath,smoothPts,partial,pressPts,smearPose,arc,type Pt} from '../motion';
import {contour,handCut,ribbons,footballPanels,sparkBurst,speedLines,laneArrow} from '../shapes';

const K='navy',O='orange',B='blue',Y='yellow';
const D=Math.PI/180;
void twos;void rectPath;void circlePath;

// ---------------- abstract riso figure (bible §1c.4) — copied verbatim into each 11v11 story file ----------------
/** A person as a paper cut-out: one head disc, one torso block, two leg strokes, two arm strokes (3–6 shapes), big head, short legs,
 * torn/wobbly edges, one ink (or a paper knockout for dark prints). (x,y) = the ground point between the feet for standing poses, the seat
 * point for sitting poses; size = the figure's height; facing +1 = toward +x. Emotion lives in the pose only (never a face). */
export type Pose='stand'|'walk'|'run'|'kick'|'reach'|'point'|'lean'|'listen'|'slump'|'curl'|'lookBack'|'sit'|'sitSlump'|'sitKnee'|'sitBack'|'kneel'|'lie';
export type Limb=[Pt,Pt,Pt];
type PoseSpec={hip:Pt;top:Pt;head:Pt;legs:Limb[];arms:Limb[];tilt:number;headDrop?:Pt};
export type FigureOpts={facing?:number;mode?:'ink'|'paper';cov?:number;paperTone?:number;toneInk?:string;rot?:number;tilt?:number;headDrop?:Pt;legs?:Limb[];arms?:Limb[];head?:Pt;scaleX?:number;headScale?:number};
const F_STAND:Limb[]=[[[-.05,-.3],[-.07,-.15],[-.1,0]],[[.05,-.3],[.07,-.15],[.1,0]]];
const F_HANG:Limb[]=[[[-.16,-.6],[-.24,-.46],[-.23,-.3]],[[.16,-.6],[.24,-.46],[.23,-.3]]];
const F_DANGLE:Limb[]=[[[0,0],[.18,.02],[.2,.28]],[[0,0],[.12,.05],[.12,.3]]];
const F_UP:PoseSpec={hip:[0,-.3],top:[0,-.64],head:[0,-.82],legs:F_STAND,arms:F_HANG,tilt:0},F_SEAT:PoseSpec={hip:[0,0],top:[0,-.36],head:[0,-.54],legs:F_DANGLE,arms:F_HANG,tilt:.04};
const POSES:Record<Pose,PoseSpec>={
 stand:F_UP,
 walk:{...F_UP,legs:[[[-.04,-.3],[-.12,-.15],[-.2,0]],[[.04,-.3],[.14,-.16],[.2,0]]],arms:[[[-.13,-.6],[-.2,-.5],[-.24,-.38]],[[.13,-.6],[.22,-.52],[.28,-.42]]],tilt:.06},
 run:{...F_UP,legs:[[[-.04,-.3],[-.2,-.2],[-.34,-.06]],[[.04,-.3],[.2,-.28],[.26,-.1]]],arms:[[[-.13,-.6],[-.28,-.5],[-.3,-.36]],[[.13,-.6],[.26,-.56],[.32,-.68]]],tilt:.22},
 kick:{...F_UP,legs:[[[-.04,-.3],[-.1,-.15],[-.14,0]],[[.05,-.3],[.22,-.24],[.44,-.2]]],arms:[[[-.13,-.6],[-.3,-.62],[-.44,-.7]],[[.13,-.6],[.28,-.5],[.34,-.36]]],tilt:-.08},
 reach:{...F_UP,arms:[[[-.13,-.6],[-.2,-.8],[-.22,-1.02]],[[.13,-.6],[.2,-.8],[.22,-1.02]]]},
 point:{...F_UP,arms:[[[-.16,-.6],[-.24,-.46],[-.23,-.3]],[[.13,-.6],[.3,-.62],[.5,-.66]]]},
 lean:{...F_UP,arms:[[[-.13,-.6],[-.1,-.45],[-.06,-.3]],[[.13,-.6],[.2,-.48],[.22,-.34]]],tilt:.16},
 listen:{...F_UP,head:[.05,-.8],arms:[[[-.13,-.6],[-.1,-.45],[-.06,-.3]],[[.13,-.6],[.26,-.68],[.2,-.8]]],tilt:.14},
 slump:{...F_UP,arms:[[[-.16,-.6],[-.16,-.42],[-.12,-.26]],[[.16,-.6],[.22,-.42],[.22,-.26]]],tilt:.22,headDrop:[.02,.08]},
 curl:{hip:[0,-.2],top:[0,-.5],head:[0,-.66],legs:[[[0,-.2],[-.12,-.08],[-.18,0]],[[0,-.2],[.16,-.1],[.22,0]]],arms:[[[-.12,-.46],[-.02,-.34],[.08,-.26]],[[.14,-.46],[.24,-.36],[.28,-.26]]],tilt:.85,headDrop:[.04,.06]},
 lookBack:{...F_UP,head:[-.08,-.82],arms:[[[-.13,-.6],[-.26,-.52],[-.3,-.4]],[[.16,-.6],[.24,-.46],[.23,-.3]]]},
 sit:{...F_SEAT,arms:[[[-.03,-.32],[.06,-.18],[.12,-.04]],[[.12,-.32],[.2,-.18],[.22,-.04]]]},
 sitSlump:{...F_SEAT,arms:[[[-.04,-.32],[.12,-.2],[.22,-.02]],[[.12,-.32],[.26,-.2],[.3,-.04]]],tilt:.3,headDrop:[.05,.07]},
 sitKnee:{...F_SEAT,legs:[[[0,0],[.2,-.24],[.28,0]],[[0,0],[.12,.05],[.12,.3]]],arms:[[[-.03,-.32],[.04,-.18],[.1,-.06]],[[.12,-.32],[.24,-.26],[.26,-.22]]],tilt:.08},
 sitBack:{...F_SEAT,arms:[[[-.06,-.3],[-.18,-.16],[-.26,0]],[[.02,-.3],[-.12,-.14],[-.18,.02]]],tilt:-.22},
 kneel:{hip:[0,-.16],top:[0,-.5],head:[0,-.68],legs:[[[0,-.16],[-.12,-.04],[-.3,0]],[[0,-.16],[.14,-.1],[.2,0]]],arms:[[[-.16,-.46],[-.24,-.32],[-.23,-.16]],[[.16,-.46],[.24,-.32],[.23,-.16]]],tilt:0},
 lie:{hip:[0,0],top:[0,-.36],head:[0,-.54],legs:[[[0,0],[.2,.01],[.4,.03]],[[0,0],[.18,.06],[.38,.08]]],arms:[[[-.1,-.32],[-.26,-.3],[-.4,-.22]],[[-.06,-.3],[-.18,-.16],[-.3,-.06]]],tilt:-1.35},
};
export function figure(s:Sheet,x:number,y:number,size:number,ink:string,seed:number,pose:Pose,o:FigureOpts={}){
 const{facing=1,mode='ink',cov=1,paperTone=.2,toneInk,rot=0,tilt:extra=0,scaleX=1,headScale=1}=o,P=POSES[pose],tilt=P.tilt+extra,hip=P.hip;
 const ct=Math.cos(tilt),st=Math.sin(tilt),rotP=(p:Pt):Pt=>{const dx=p[0]-hip[0],dy=p[1]-hip[1];return[hip[0]+dx*ct-dy*st,hip[1]+dx*st+dy*ct];};
 const hd=o.headDrop??P.headDrop??[0,0],headC=rotP(o.head??P.head),head:Pt=[headC[0]+hd[0],headC[1]+hd[1]],top=rotP(P.top);
 const arms=(o.arms??P.arms).map(l=>l.map(rotP) as Limb),legs=o.legs??P.legs;
 const cr=Math.cos(rot),sr=Math.sin(rot),W=(p:Pt):Pt=>{const px=p[0]*size*facing*scaleX,py=p[1]*size;return[x+px*cr-py*sr,y+px*sr+py*cr];};
 const torso=[[-.19,P.top[1]],[.19,P.top[1]],[.14,hip[1]+.03],[-.14,hip[1]+.03]].map(p=>W(rotP(p as Pt)));
 const part=(path:Path2D)=>{if(mode==='paper'){s.knockout(path,.95);if(paperTone>0)s.tone(toneInk??ink,path,paperTone);}else s.fill(ink,path,cov);};
 const limb=(l:Limb,width:number,sd:number)=>ribbon(l.map(W),width,{seed:sd,pressure:.3,taper:.12,wobble:size*.006,step:Math.max(4,size*.03)});
 part(limb(legs[0],size*.11,seed+1));part(limb(arms[0],size*.085,seed+2));
 part(polyPath(handCut(torso,seed+3,size*.012,size*.12),true));
 part(limb(legs[1],size*.11,seed+4));part(limb(arms[1],size*.085,seed+5));
 const hw=W(head);part(polyPath(blob(hw[0],hw[1],size*.16*headScale,size*.16*headScale,seed+6,{amp:.05,n:28}),true));
 return{head:hw,top:W(top),hip:W(hip),hands:[W(arms[0][2]),W(arms[1][2])] as [Pt,Pt],feet:[W(legs[0][2]),W(legs[1][2])] as [Pt,Pt]};
}
/** Run cycle: the two leg/arm keyframes swapped on the twos grid (k = 0 | 1). */
export const stride=(k:number):{legs:Limb[];arms:Limb[]}=>{const R=POSES.run,sw=(a:Limb,b:Limb):Limb[]=>[[a[0],b[1],b[2]],[b[0],a[1],a[2]]];return k%2?{legs:sw(R.legs[0],R.legs[1]),arms:sw(R.arms[0],R.arms[1])}:{legs:R.legs,arms:R.arms};};
/** mixLimbs(a,b,u): interpolate two limb sets (arms lowering, a straightening) — pass the result as opts.arms / opts.legs. */
export const mixLimbs=(a:Limb[],b:Limb[],u:number):Limb[]=>a.map((l,i)=>l.map((p,j)=>[lerp(p[0],b[i][j][0],u),lerp(p[1],b[i][j][1],u)] as Pt) as Limb);
export const poseLimbs=(p:Pose)=>({arms:POSES[p].arms,legs:POSES[p].legs});

// ---------------- the kit ----------------
/** The ball (paper, navy panels) with its navy ghost twin behind it — the inside game. */
function ball(s:Sheet,x:number,y:number,r:number,seed:number,o:{rot?:number;sx?:number;sy?:number;ghost?:[number,number,number]}={}){
 const{rot=0,sx=1,sy=1,ghost}=o;
 if(ghost&&ghost[2]>.03){const g=polyPath(blob(x+ghost[0],y+ghost[1],r,r,seed+9,{amp:.025}),true);s.tone(K,g,ghost[2]);s.fill(K,ribbon(blob(x+ghost[0],y+ghost[1],r,r,seed+9,{amp:.025}),Math.max(3,r*.07),{seed:seed+10,close:true,wobble:1.5}),Math.min(.9,ghost[2]*1.6));}
 s.save();s.translate(x,y);s.scale(sx,sy);footballPanels(s,0,0,r,{rot,key:K,shadow:O,seed,light:[-.35,-.45]});s.restore();
}
/** A flat navy boot cut-out with a paper stud row. (x,y) = heel, len along `ang`, sole down. */
function boot(s:Sheet,x:number,y:number,len:number,ang:number,seed:number,o:{cov?:number;paper?:boolean}={}){
 const{cov=.95,paper=false}=o;s.save();s.translate(x,y);s.rotate(ang);const h=len*.42;
 const raw:Pt[]=[[0,0],[len*.15,-h*.55],[len*.3,-h],[len*.62,-h*.95],[len*.78,-h*.6],[len,-h*.2],[len*1.02,0],[len*.9,h*.12],[0,h*.12]];
 const pts=wob(raw,3,seed,true,{step:14,corner:.5}),p=polyPath(pts,true);
 if(paper){s.knockout(p,.95);contour(s,K,pts,9,{close:true,seed:seed+1,pressure:.6,wobble:2});}else{s.knockout(p);s.fill(K,p,cov);}
 const studs=new Path2D();for(let i=0;i<5;i++)studs.rect(len*.1+i*len*.18,h*.02,len*.07,h*.1);if(paper)s.fill(K,studs,.9);else s.knockout(studs,.9);
 s.restore();
}
/** Star polygon: n points, outer r, inner r*.5. */
function starPts(cx:number,cy:number,r:number,n:number,rot=-Math.PI/2,inner=.5):Pt[]{const pts:Pt[]=[];for(let i=0;i<n*2;i++){const a=rot+i/(n*2)*Math.PI*2,rr=i%2?r*inner:r;pts.push([cx+Math.cos(a)*rr,cy+Math.sin(a)*rr]);}return pts;}
/** The yellow star OUTLINE (reference 02): paper knocked out under a thick yellow ribbon so it prints clean on navy; a thin navy keyline. */
function starOutline(s:Sheet,pts:Pt[],w:number,seed:number,o:{cov?:number;key?:boolean;thicken?:number}={}){
 const{cov=.95,key:kl=true,thicken=0}=o;
 if(kl)s.fill(K,ribbon(pts,w+8+thicken,{seed,pressure:.4,taper:0,close:true,wobble:2,step:10}),.95);
 const yp=ribbon(pts,w+thicken,{seed:seed+1,pressure:.4,taper:0,close:true,wobble:2,step:10});s.knockout(yp);s.fill(Y,yp,cov);
}
/** Three solid star layers misregistered from one another: orange, yellow, navy (anger). */
function layeredStar(s:Sheet,x:number,y:number,r:number,off:number,seed:number,o:{shake?:number;scale?:number;rot?:number;relax?:number[]}={}){
 const{shake=0,scale=1,rot=-Math.PI/2,relax=[0,0,0]}=o,rr=rng(seed+twosIndex(shake*1000));
 const layers:[string,number,number][]=[[O,-off,-off*.6],[Y,0,0],[K,off,off*.7]];
 layers.forEach(([ink,dx,dy],i)=>{const j=shake>0?(rr()-.5)*shake*2:0,k=shake>0?(rr()-.5)*shake*2:0;let pts=starPts(x+dx+j,y+dy+k,r*scale,8,rot);
  if(relax[i]>0){const ring=blob(x+dx+j,y+dy+k,r*.75*scale,r*.75*scale,seed+i,{amp:.03,n:16});pts=pts.map((p,q)=>[lerp(p[0],ring[q][0],relax[i]),lerp(p[1],ring[q][1],relax[i])]);}
  const p=polyPath(wob(pts,2,seed+i,true,{step:12,corner:.4}),true);if(i===0)s.knockout(p,.6);s.fill(ink,p,.92);});
}
/** Nested arch bands (reference 01): widest first; each band = paper knocked out of the navy at a stepped coverage and BLUE printed solid
 * into it, so every band is one hard flat print and the steps read as steps (no ramp). legs run down past the frame. */
function nestedArches(s:Sheet,cx:number,cy:number,spans:number[],covs:number[],o:{ratio?:number;legs?:number;gaps?:[number,number][];bow?:number[]}={}){
 const{ratio=.6,legs=3000,gaps=[],bow}=o;
 spans.forEach((span,k)=>{const rx=span/2*(1+(bow?bow[k]:0)),ry=span*ratio;const p=new Path2D();p.moveTo(cx-rx,cy+legs);p.lineTo(cx-rx,cy);p.ellipse(cx,cy,rx,ry,0,Math.PI,0);p.lineTo(cx+rx,cy+legs);p.closePath();s.knockout(p,covs[k]);s.fill(B,p,.95);});
 if(gaps.length){const g=new Path2D();for(const[gy,gw] of gaps)g.rect(cx-gw/2,gy,gw,60);s.knockout(g,.9);}
}
/** Five diagonal ribbons edge to edge: navy, blue, orange, green (blue × yellow), yellow. */
function ribbonBg(s:Sheet,cx:number,cy:number,angle:number,seed:number,o:{width?:number;dim?:number}={}){
 const{width=230,dim=0}=o,paths=ribbons(cx,cy,angle,[3000,width,width,width,width,width,3000],{seed,wobble:6});
 const inks:[string,number][][]=[[[K,.9]],[[K,.9]],[[B,.72]],[[O,.8]],[[Y,.85],[B,.5]],[[Y,.85]],[[Y,.85]]];
 paths.forEach((p,i)=>{for(const[ink,cov] of inks[i])s.fill(ink,p,cov*(1-dim));});
}
/** Scribble threads inside a disc: three inks looping and converging to the tail. Returns the smoothed polylines. */
function threads(cx:number,cy:number,r:number,tail:Pt,seed:number,loops:number,boil=0):Pt[][]{
 return[0,1,2].map(k=>{const rr=rng(seed+k*31),pts:Pt[]=[tail];for(let i=0;i<loops;i++){const la=rr()*Math.PI*2,ld=r*(.15+rr()*.45),lx=cx+Math.cos(la)*ld,ly=cy+Math.sin(la)*ld,lr=r*(.16+rr()*.24),a0=rr()*Math.PI*2,dir=rr()<.5?1:-1;for(let j=0;j<=9;j++){const a=a0+dir*j/9*Math.PI*1.9;pts.push([lx+Math.cos(a)*lr,ly+Math.sin(a)*lr*(.8+rr()*.3)]);}}pts.push([tail[0]+6,tail[1]-6]);
  const sp=smoothPts(pts,false,8,1.4);return boil>0?wob(sp,boil,seed+k+twosIndex(boil*77),false,{smooth:false}):sp;});
}
function drawThreads(s:Sheet,lines:Pt[][],w:number,seed:number,o:{progress?:number[];traced?:number[];cov?:number;keyW?:number}={}){
 const{progress=[1,1,1],traced=[0,0,0],cov=.95,keyW=6}=o,inks=[O,Y,B];
 lines.forEach((ln,k)=>{const q=progress[k]>=1?ln:partial(ln,progress[k]);if(q.length<2)return;
  if(traced[k]>0)s.fill(K,ribbon(partial(ln,traced[k]),w+keyW,{seed:seed+k+7,pressure:.3,taper:.2,wobble:1,step:10}),.95);
  s.fill(inks[k],ribbon(q,w,{seed:seed+k,pressure:.5,taper:.4,wobble:1.5,step:10}),cov);});
}
/** Confetti quads that react: jolt (rotate on twos), burst outward from a centre, fall with gravity, settle on a floor. */
function confetti(s:Sheet,box:[number,number,number,number],n:number,seed:number,o:{inks?:(string|'paper')[];size?:number;jolt?:number;burst?:[number,number,number];fall?:number;floor?:number;push?:[number,number,number]}={}){
 const{inks=['paper',B],size=60,jolt=0,burst,fall=0,floor,push}=o,rr=rng(seed),paths=inks.map(()=>new Path2D());
 for(let i=0;i<n;i++){let x=box[0]+rr()*box[2],y=box[1]+rr()*box[3];const sz=size*(.5+rr()),rot0=rr()*Math.PI*2,spin=rr()*4;
  if(burst){const dx=x-burst[0],dy=y-burst[1],d=Math.hypot(dx,dy)||1;x+=dx/d*burst[2]*(.5+rr());y+=dy/d*burst[2]*(.5+rr());}
  if(push){const dx=x-push[0],dy=y-push[1],d=Math.hypot(dx,dy)||1;if(d<600){x+=dx/d*push[2]*(1-d/600);y+=dy/d*push[2]*(1-d/600);}}
  y+=fall*fall*220*(.6+rr()*.8);if(floor!==undefined&&y>floor)y=floor-sz*.3;
  const rot=rot0+(jolt>0?jolt*(rr()-.5)*1.2:0)+fall*spin;
  const q=rotPts([[-sz*.5,-sz*.4],[sz*.5,-sz*.55],[sz*.45,sz*.4],[-sz*.35,sz*.5]],rot),p=paths[i%inks.length];p.moveTo(x+q[0][0],y+q[0][1]);for(let j=1;j<4;j++)p.lineTo(x+q[j][0],y+q[j][1]);p.closePath();}
 inks.forEach((ink,k)=>{if(ink==='paper')s.knockout(paths[k],.95);else{s.knockout(paths[k]);s.fill(ink,paths[k],.9);}});
}
/** Hand-cut paper pitch lines in slight perspective, as ONE knockout (or a navy ghost plate). */
function fieldLines(s:Sheet,ox:number,oy:number,seed:number,o:{ink?:string;cov?:number;w?:number}={}){
 const{ink,cov=.95,w=14}=o;const p=new Path2D();
 const segs:Pt[][]=[[[ox-560,oy+360],[ox+560,oy+360]],[[ox-560,oy+360],[ox-340,oy-340]],[[ox+560,oy+360],[ox+340,oy-340]],[[ox-340,oy-340],[ox+340,oy-340]],[[ox-200,oy-340],[ox-180,oy-250],[ox+180,oy-250],[ox+200,oy-340]],[[ox-380,oy+360],[ox-320,oy+160],[ox+320,oy+160],[ox+380,oy+360]],blob(ox,oy+30,150,110,seed,{amp:.02,n:32})];
 segs.forEach((q,i)=>p.addPath(ribbon(q,w,{seed:seed+i,pressure:.5,taper:.2,wobble:2,step:30,close:i===segs.length-1})));
 if(ink)s.fill(ink,p,cov);else s.knockout(p,cov);
}
/** Goal: paper posts and a blue lattice net that can bulge. */
function goal(s:Sheet,x:number,y:number,w:number,h:number,seed:number,o:{bulge?:number;post?:number;netCov?:number;bulgeAt?:Pt}={}){
 const{bulge=0,post=Math.max(8,w*.028),netCov=.3,bulgeAt=[x,y+h*.6]}=o;
 const net=new Path2D();net.rect(x-w/2,y,w,h);
 s.save();s.clip(net);const lat=new Path2D();const cell=Math.max(22,w*.036);
 for(let k=-w;k<w*2;k+=cell){lat.addPath(ribbon([[x-w/2+k,y],[x-w/2+k-h*.6,y+h]],3,{seed:seed+k,wobble:.5,taper:0,pressure:0,step:60}));lat.addPath(ribbon([[x-w/2+k,y],[x-w/2+k+h*.6,y+h]],3,{seed:seed+k+1,wobble:.5,taper:0,pressure:0,step:60}));}
 s.fill(B,lat,netCov);
 if(bulge>0)s.tone(B,polyPath(blob(bulgeAt[0],bulgeAt[1],w*.16*bulge+40,h*.22*bulge+30,seed+3,{amp:.08,n:24}),true),.55);
 s.restore();
 s.knockout(ribbon([[x-w/2,y+h],[x-w/2,y],[x+w/2,y],[x+w/2,y+h]],post,{seed:seed+5,pressure:.4,taper:0,wobble:2,step:40}),.95);
}
/** Splatter: droplets flown out ballistically from a point and landed as dots. */
function splatter(s:Sheet,x:number,y:number,age:number,seed:number,n=14){if(age<0)return;const rr=rng(seed),p=new Path2D(),u=clamp(age/.5);for(let i=0;i<n;i++){const a=rr()*Math.PI*2,v=220+rr()*420,px=x+Math.cos(a)*v*u,py=y+Math.sin(a)*v*u+260*u*u,r=6+rr()*9;p.addPath(circlePath(px,py,r*(1-.3*u)));}s.fill(O,p,.95);}
/** A paper speech disc with a small tail toward (tx,ty) — the one generic shape (supportive words). */
function speech(s:Sheet,x:number,y:number,w:number,h:number,tx:number,ty:number,seed:number,g=1){if(g<=0)return;const p=polyPath(blob(x,y,w*g,h*g,seed,{amp:.05,n:24}),true);s.knockout(p,.95);s.knockout(polyPath([[x+(tx-x)*.25,y+(ty-y)*.2],[x+(tx-x)*.35+14,y+(ty-y)*.3],[x+(tx-x)*.6,y+(ty-y)*.7]],true),.95);}

// ---------------- visual chapters (media time, chapter-relative t) ----------------
// ch1 — the visible game on a GREEN pitch: two navy players pass, the orange tackler slides in, a shot bulges the net, the glove saves
function ball1(t:number){
 let x=-100,y=150,rot=0,sx=1,sy=1;
 const p1=sm(2.0,2.7,t,easeOut);if(t>=2.0){const q=arc([-100,150],[250,-50],p1,90);x=q[0];y=q[1];rot=p1*4;if(t>=2.7&&t<2.87){sx=.92;sy=1.08;}}
 const p2=sm(7.54,8.24,t,easeOut);if(t>=7.54){const q=arc([250,-50],[-100,150],p2,80);x=q[0];y=q[1];rot=4+p2*4;if(t>=8.24&&t<8.41){sx=.92;sy=1.08;}}
 const pop=t-8.5;if(pop>=0&&t<9.04){const u=clamp(pop/.5);x=lerp(-100,-40,u);y=150-110*Math.sin(u*Math.PI)-90*u;if(pop>.42&&pop<.55){sx=1.1;sy=.9;}}
 const shot=sm(9.09,9.54,t,easeIn);if(t>=9.04){x=lerp(-40,0,shot);y=lerp(60,-330,shot);rot=7+shot*5;}
 const shot2=sm(9.58,9.98,t,easeIn),back=sm(9.98,10.5,t,easeOut);if(t>=9.54){x=lerp(200,40,shot2);y=lerp(-60,-320,shot2);if(t>=9.98){x=lerp(40,0,back);y=lerp(-320,-140,back)-90*Math.sin(back*Math.PI)*(1-back)+(back>=1?12*Math.abs(settle(t,10.5,{amp:1,freq:4,decay:4})):0);}if(t>=9.98&&t<10.15){sx=.85;sy=1.15;}}
 return{x,y,rot,sx,sy};
}
const ch1:Scene={
 draw(s,t){
  const v=camKeys(s,t,[[0,60,40,1.05,0],[1.74,60,60,1.12,0],[4.8,100,20,1.14,0],[7.54,-60,-40,1.18,0],[9.04,140,-140,1.22,0],[9.54,0,-280,1.3,0],[10.15,0,-240,1.4,0],[10.8,0,-241,1.402,0]]);
  const jolt=settle(t,8.5,{amp:20,freq:6,decay:6})+settle(t,9.1,{amp:12,freq:5,decay:6});s.camera(v[0]+jolt,v[1],v[2],v[3]);
  const printed=sm(.2,.5,t,easeOut),ghostOn=sm(.5,.8,t,easeOut);
  // the pitch prints green: a yellow field with a blue field over it (blue × yellow = green); the crowd band is a navy screen
  if(printed>0){s.field(Y,.9,.35);s.field(B,lerp(.6,.75,sm(4.8,5.6,t)),.45);s.tone(K,polyPath([[-4000,-4000],[4000,-4000],[4000,-380],[-4000,-380]],true),key(t,[[0,.45],[9.04,.45],[9.2,.6],[9.64,.45]]));}
  // the second game under the first: a navy ghost plate that slams down misregistered and later sinks
  const gOff=ghostOn<1?lerp(56,50,ghostOn):key(t,[[4.8,50],[5.6,20]]),gCov=key(t,[[.5,0],[.8,.3],[4.8,.3],[5.6,.12]]);
  if(ghostOn>0)fieldLines(s,gOff,gOff*.8,12,{ink:K,cov:gCov,w:16});
  if(printed>0)fieldLines(s,0,0,11,{cov:.95*printed,w:14+2*(t>4.8&&t<5.2?1:0)});
  goal(s,0,-340,220,80,13,{bulge:sm(9.49,9.6,t)*(1-sm(9.7,10.2,t))+sm(9.94,10.05,t)*(1-sm(10.1,10.6,t))*.6,netCov:.3});
  // the players: A near (passer, gets tackled, shoots), B far (receiver, passes back, second shot), the orange tackler
  const A:Pt=[-170,180],Bp:Pt=[320,-20];
  const kickA=(t>=1.74&&t<2.25)||(t>=9.0&&t<9.3),kickB=(t>=7.3&&t<7.75)||(t>=9.5&&t<9.8);
  const wind=t>=1.74&&t<2.0?-.1*Math.sin(sm(1.74,2.0,t)*Math.PI):0;
  const hit=sm(8.5,8.7,t,easeOut),knock=t>=8.5?.3*hit*(1-sm(8.9,9.0,t)):0;
  const ti=twosIndex(t);
  if(t>=.5){
   const shootA=t>=9.0&&t<9.4;
   figure(s,shootA?-110:A[0]+30*hit,shootA?110:A[1],340,K,21,kickA?'kick':knock>0?'lean':'stand',{facing:1,tilt:wind+knock,cov:.95});
   // the inside game: a small orange star printed in A's chest from 4.8 (the emotion under the visible player)
   const star=sm(4.8,5.2,t,easeOutBack);if(star>0){const sp=polyPath(starPts(shootA?-110:A[0]+30*hit,(shootA?110:A[1])-170,28*star,5),true);s.knockout(sp,.9);s.fill(O,sp,.95);}
   figure(s,Bp[0],Bp[1],270,K,22,kickB?'kick':'stand',{facing:-1,cov:.95});
  }
  if(t>=6.8&&t<7.3)laneArrow(s,K,[Bp[0]-40,Bp[1]-60],[A[0]+60,A[1]-90],10,{dashed:true,head:30,seed:23,progress:sm(6.8,7.2,t),cov:.6});
  // the tackle: the orange figure rushes in from the left (run cycle on twos, smear), pops the ball loose, sparks
  const tk=sm(8.22,8.57,t,easeOut),tkx=lerp(-620,-300,tk)+40*(tk>=1?settle(t,8.57,{amp:1,freq:4,decay:5}):0);
  if(t>=8.22){s.knockout(ribbon([[-600,240],[tkx-20,220]],40,{seed:24,taper:.4,wobble:2}),.7);const st=stride(ti);figure(s,tkx,230,330,O,25,'run',{facing:1,legs:tk<1?st.legs:undefined,arms:tk<1?st.arms:undefined,tilt:tk<1?.1:0,cov:.95});if(t>=8.5&&t<8.7)sparkBurst(s,Y,-80,60,120,{n:6,seed:26,g:sm(8.5,8.6,t)});}
  if(t>=9.04&&t<9.7)sparkBurst(s,Y,0,-320,170,{n:10,seed:28,g:sm(9.49,9.7,t,easeOut)});
  // the ball through the actions (drawn over the players so the pass reads as the ball travelling between them)
  const b=ball1(t);let gdx=gOff*.7,gdy=gOff*.6;if(t>=9.54&&t<9.6||t>=9.04&&t<9.09){gdx=8;gdy=6;}
  if(t>=.5)ball(s,b.x,b.y,60,14,{rot:b.rot,sx:b.sx,sy:b.sy,ghost:[gdx,gdy,gCov]});
  if(t>=2.0&&t<2.7)speedLines(s,K,b.x,b.y,Math.atan2(-200,350),{n:3,seed:27,len:80,spread:30,width:5,cov:.8});
  // the glove sweeps across the goal mouth
  if(t>=9.4){const sw=sm(9.7,10.0,t,easeIO),gx=lerp(200,40,sw)+40*(sw>=1?settle(t,10,{amp:1,freq:4,decay:5}):0);const gp:Pt[]=[[gx-90,-300],[gx-80,-360],[gx-30,-390],[gx+20,-395],[gx+70,-380],[gx+95,-340],[gx+80,-290],[gx,-270]];const glove=polyPath(wob(gp,3,29,true,{step:14,corner:.6}),true);s.knockout(glove);s.fill(B,glove,.88);contour(s,K,wob(gp,3,29,true,{step:14,corner:.6}),7,{close:true,seed:30,pressure:.5,wobble:1.5});}
 },
 aperture(){return apertureDisc(0,-140,32,12);},
};
// ch2 — FRUSTRATION (reference 02): the torn navy channel pinches a keylined yellow star outline between an orange and a yellow field;
// a slumped paper figure inside the star; confetti; the ball drops out over the torn edge
function channelWidth(t:number){return key(t,[[0,440],[.15,460],[.5,340,easeIn],[.62,356],[.8,340],[2.6,340],[2.7,352],[2.85,290,easeIn],[2.95,300],[3.15,290],[4.2,290],[4.5,320]]);}
const ch2:Scene={
 draw(s,t){
  const w=channelWidth(t),pinch=clamp((440-w)/220)*.6,dip=20*sm(.4,.7,t,easeIn)*(1-sm(.9,1.6,t,easeOut));
  const v=camKeys(s,t,[[0,0,40,1.0,0],[.5,0,60,1.1,3*D],[1.0,0,60,1.1,0],[2.6,0,60,1.1,0],[4.83,0,400,1.14,0],[5.48,0,401,1.142,0]]);
  s.camera(v[0]+8*settle(t,.5,{amp:1,freq:5,decay:6}),v[1]+dip,v[2],v[3]);
  // the two fields: orange left, yellow (with an orange screen) right
  s.field(O,.85,.4);const right=polyPath([[0,-4000],[4000,-4000],[4000,4000],[0,4000]],true);s.knockout(right);s.fill(Y,right,.9);s.tone(O,right,.2);
  // the navy channel: paper knocked out beneath it so navy never prints mud over the yellow; torn edges; it opens at the bottom
  const crumple=(t>=2.85&&t<3.25)?2:1;
  const chan=handCut([[-w/2,-4000],[w/2,-4000],[w/2,520],[4000,900],[4000,4000],[-4000,4000],[-4000,900],[-w/2,520]],31,45*crumple,170);
  const chanP=polyPath(chan,true);s.knockout(chanP);s.fill(K,chanP,1);
  // the star outline: pressed by both edges; its points cross into the fields
  let pts=starPts(0,40,400,8,-Math.PI/2+.2);
  pts=pressPts(pts,0,pinch,w/2+140,[0,40]);pts=pressPts(pts,Math.PI,pinch,w/2+140,[0,40]);
  const sag=30*sm(.4,.9,t,easeIn);pts=pts.map(p=>p[1]>300?[p[0],p[1]+sag]:p);
  starOutline(s,pts,30,32,{thicken:8*pinch*(t<.15?0:1)*(1+.2*(1-sm(0,.15,t)))});
  // the frustrated player inside the star: a paper figure whose shoulders drop further with every pinch
  figure(s,0,215,270,K,33,'slump',{mode:'paper',paperTone:.1,toneInk:O,facing:1,tilt:.15*pinch,headDrop:[.02+.02*pinch,.08+.06*pinch]});
  // confetti jolts on each pinch and drifts away from it
  const j=(t>=.5&&t<.9?1:0)+(t>=2.85&&t<3.3?1:0);
  confetti(s,[-700,-700,1400,1500],14,34,{inks:['paper',B],size:70,jolt:j,push:[0,40,60*pinch]});
  // the mistake: a small ball rolls down the channel, crosses the torn edge into the orange field and drops out
  const roll=sm(0,.4,t),drop=sm(.4,.8,t,easeIn);
  if(t<1.4){const bx=lerp(0,-w/2-120,drop),by=lerp(-300,-60,roll)+drop*drop*420;ball(s,bx,by,44,35,{rot:t*5,ghost:[16,12,.3*(1-sm(.5,.9,t))]});}
  // the arches come into view through the opening as the camera pans down (inside the navy only)
  s.save();s.clip(chanP);nestedArches(s,0,760,[1500,1260,1020,780,560,340],[.15,.2,.32,.45,.6,.75],{ratio:.6,legs:3000});s.restore();
  const glow2=polyPath(blob(0,760,110,110,36,{amp:.04}),true);s.knockout(glow2,.88);s.tone(B,glow2,.6);figure(s,0,790,120,K,37,'curl',{facing:1});
 },
 aperture(){return apertureDisc(0,600,90,12);},
};
// ch3 — FEAR (reference 01): six hard-stepped full-width blue bands close inward on a small light where a curled figure sits;
// ANGER: the yellow card and the three-layer star stab in with a shake, splatter and confetti
const ch3:Scene={
 draw(s,t){
  const stab=anticipate(2.0,2.55,t,{back:.12,hold:.35,e:easeIn})*(t<2.0?0:1),hit=t-2.55;
  const v=camKeys(s,t,[[0,0,0,1.1,0],[2.0,0,60,1.2,0],[2.55,60,100,1.26,-8*D],[3.4,60,100,1.26,-8*D],[4.9,60,120,1.42,0],[5.56,60,121,1.422,0]]);
  const punch=hit>=0?30*settle(t,2.55,{amp:1,freq:6,decay:5}):0;s.camera(v[0]+punch,v[1]+punch*.5,v[2],v[3]);
  s.field(K,1,.4);
  // bands step inward one per .25 s, each landing with a small overshoot; the light shrinks
  const spans=[1500,1260,1020,780,560,340],covs=[.15,.2,.32,.45,.6,.75];
  const stepped=spans.map((sp,k)=>{const u=sm(k*.25,k*.25+.25,t,easeIn),next=k<5?spans[k+1]:250;return lerp(sp,next,u)*(1-.012*settle(t,k*.25+.25,{amp:1,freq:5,decay:6}));});
  const dent=hit>=0?[0,0,0,0,-.05*clamp(hit/.2),-.08*clamp(hit/.2)]:undefined;
  nestedArches(s,0,0,stepped,covs.map((c,k)=>k===5?lerp(c,.88,sm(1.25,1.6,t)):c),{ratio:.62,legs:3000,bow:dent});
  // the small light and the frightened player curled inside it; the light flinches on twos
  const glowR=key(t,[[0,150],[1.5,100],[3.4,80]])*(t>=.72&&t<1.12?(twosIndex(t)%2?.85:1):1);
  const glow=polyPath(blob(0,10,glowR,glowR*1.15,41,{amp:.04}),true);s.knockout(glow,.88);s.tone(B,glow,.6);
  const shiver=t>=.72&&t<1.12?(twosIndex(t)%2?3:-3):0;
  figure(s,shiver,60,key(t,[[0,170],[1.5,130],[3.4,110]]),K,42,'curl',{facing:1,tilt:.1*sm(1.25,1.6,t)});
  // two teammates look on from the outer bands' shadows (paper, small), leaning toward the centre
  figure(s,-440,-40,150,K,44,'lean',{mode:'paper',paperTone:.3,toneInk:B,facing:1,tilt:.1*sm(0,1.5,t)});
  figure(s,430,-80,150,K,45,'lean',{mode:'paper',paperTone:.3,toneInk:B,facing:-1,tilt:.1*sm(0,1.5,t)});
  // anger: the card jerks up and prints; the star stabs in, shakes, splatters, bursts confetti; brown where orange crosses the bands
  if(t>=2.0){const cy=-300-20*(1-sm(2.0,2.15,t,easeOut));const cp=wob([[330,cy-100],[430,cy-100],[430,cy+100],[330,cy+100]],2,46,true,{step:14,corner:.4});const card=polyPath(cp,true);s.knockout(card);s.fill(Y,card,.95);contour(s,K,cp,8,{close:true,seed:47,pressure:.4,wobble:1.5});}
  if(t>=2.0){const sx=lerp(600,120,clamp(stab)),sy=lerp(500,140,clamp(stab));const shake=hit>=0&&hit<.5?8*(1-hit/.5):0;const pulse=t>=3.4?(twosIndex(t)%4<2&&t<4.2?1.12:1):1;
   if(stab>0&&stab<.8){const dir=Math.atan2(140-500,120-600);const pts=smearPose(starPts(sx,sy,420,8,-Math.PI/2),dir,120,[sx,sy]);s.fill(Y,polyPath(pts,true),.6);}
   else layeredStar(s,sx,sy,420,12,48,{shake,scale:pulse});
   splatter(s,120,140,hit,49,14);
   if(hit>=0)confetti(s,[-200,-200,600,600],10,50,{inks:['paper',Y],size:60,burst:[120,140,300*clamp(hit/.5)],fall:clamp(hit/.8)});}
 },
 aperture(){return apertureDisc(0,0,28,10);},
};
// ch4 — CONTROL (reference 03): the boot rolls and stops the ball on the ribbons; the cream disc of threads prints over the pitch; a calm shielding step
function ball4(t:number){const roll=sm(.2,.6,t,easeOut),stop=t>=1.1&&t<1.3,third=sm(2.0,2.3,t,easeOut),shield=sm(6.6,6.75,t,easeOut);return{x:-160+100*roll+60*third-40*shield,y:190+6*(roll>0&&roll<1?1:0),rot:roll*1.2+third*.7,sq:stop?.94:1};}
const ch4:Scene={
 draw(s,t){
  const b=ball4(t),disc=easeOutBack(sm(4.82,5.12,t));
  camKeys(s,t,[[0,-200,120,1,0],[2.0,-140,120,1.12,0],[4.82,-40,40,1.15,-4*D],[6.42,60,-60,1.2,-4*D],[6.93,20,0,1.32,0],[7.58,21,1,1.322,0]]);
  ribbonBg(s,0,0,-22*D,51,{dim:.1*sm(4.62,4.82,t)*(1-disc)});
  // the ribbon puckers under each touch (a dark tone dent)
  for(const t0 of[.2,1.1,2.0]){const u=sm(t0,t0+.15,t)*(1-sm(t0+.15,t0+.6,t));if(u>0)s.tone(K,polyPath(blob(b.x,b.y+90,90,18*u+4,52,{amp:.1,n:16}),true),.4);}
  // the mind: the cream disc with three threads converging to a tail that touches the ball's ghost
  const tail:Pt=[-140,80];
  if(disc>0){s.knockout(polyPath(blob(80,-160,300*disc,300*disc,53,{amp:.02,n:48}),true),.95);const prog=[sm(5.12,6.0,t),sm(5.3,6.2,t),sm(5.5,6.32,t)];const boil=t<6.75&&t>=6.0?3:0;
   drawThreads(s,threads(80,-160,280,tail,54,5,boil),11,55,{progress:prog});}
  // the opponent rushes in along the orange ribbon (run cycle, smear); the boot steps between; the ball is nudged away
  const rush=sm(6.42,6.72,t,easeOut),ox=lerp(760,260,rush)+50*(rush>=1?settle(t,6.72,{amp:1,freq:4,decay:5}):0);
  if(t>=6.42){const st=stride(twosIndex(t));figure(s,ox,290,300,O,56,rush<1?'run':'lean',{facing:-1,legs:rush<1?st.legs:undefined,arms:rush<1?st.arms:undefined,tilt:rush<1?.1:.1*sm(6.72,6.9,t)});if(rush>0&&rush<.7)speedLines(s,O,ox+60,120,Math.PI,{n:4,seed:57,len:120,spread:60,width:8,cov:.8});}
  ball(s,b.x,b.y,100,58,{rot:b.rot,sx:b.sq,sy:2-b.sq,ghost:[20+20*(t>=1.3&&t<1.6?1:0),14,.3]});
  // the boot: toe lifts, rolls, comes down, steps
  const lift=t<.2?0:sm(.2,.4,t,easeOut)*(1-sm(.5,.7,t)),down=sm(1.0,1.1,t,easeIn),step=sm(6.6,6.7,t);
  boot(s,-360+100*sm(.25,.6,t)+60*sm(2.0,2.3,t)+140*step,150-40*lift+8*down,260,-10*D*lift+8*D*down,59,{});
  if(t>=.3&&t<.8)speedLines(s,K,b.x-60,b.y,0,{n:3,seed:60,len:90,spread:30,width:6,cov:.9});
 },
 aperture(){return apertureDisc(190,-260,40,12);},
};
// ch5 — NOTICE: the disc huge on its ribbons; the light threads print back through an eraser swipe; a navy tracing names them;
// one navy loop tries to leave the disc and is caught at the rim; a thread that yanks the boot goes slack
const TAIL5:Pt=[-330,340],DISC5:Pt=[0,-40],R5=560;
const ch5:Scene={
 draw(s,t){
  camKeys(s,t,[[0,-140,0,1,0],[2.0,140,0,1,0],[4.48,0,0,1.06,0],[5.3,-90,-70,1.08,-3*D],[6.1,90,-30,1.1,3*D],[6.88,-30,90,1.12,0],[7.35,200,300,1.3,0],[8.0,201,301,1.302,0]]);
  ribbonBg(s,0,0,22*D,61,{});
  const discP=polyPath(blob(DISC5[0],DISC5[1],R5,R5,62,{amp:.02,n:64}),true);s.knockout(discP,.95);
  const swipeX=lerp(-700,700,sm(.2,.7,t,easeIO)),erased=t>=.2&&t<.9;
  const boil=(t>=2.0&&t<2.1)?6:(t<3.0&&t>=.9?2:0);
  const lines=threads(DISC5[0],DISC5[1]-20,400,TAIL5,63,4,boil);
  const traced=[sm(4.48,4.98,t),sm(4.98,5.48,t),sm(5.48,5.98,t)];
  s.save();s.clip(discP);
  if(erased)s.clip(polyPath([[-4000,-4000],[swipeX-200,-4000],[swipeX-200,4000],[-4000,4000]],true));
  const jit=t>=.7&&t<1.1?3:0;s.translate(jit*(twosIndex(t)%2?1:-1),0);
  drawThreads(s,lines,12,64,{traced,keyW:4});
  s.restore();
  if(erased){const brush=polyPath(handCut([[swipeX-200,-900],[swipeX+200,-900],[swipeX+200,900],[swipeX-200,900]],65,30,120),true);s.knockout(brush,.95);}
  const knot=sm(5.98,6.28,t,easeOut);if(knot>0)s.fill(K,ribbon(blob(TAIL5[0],TAIL5[1],22*knot,22*knot,66,{amp:.05,n:16}),7,{seed:66,close:true,wobble:1}),.95);
  // the loop that tries to decide for you: a navy loop grows out of the tangle toward the rim, is caught at the disc's hand-cut edge and recoils
  const esc=sm(4.48,5.2,t,easeIn),recoil=t>=5.2?settle(t,5.2,{amp:1,freq:3,decay:4}):0;
  if(esc>0){const reach=lerp(0,1,esc)*(1-.12*Math.max(0,recoil));const path=smoothPts([[120,-120],[280,-260],[420,-380],[560,-470]],false,10);s.save();s.clip(discP);s.fill(K,ribbon(partial(path,Math.min(1,reach)),18,{seed:67,pressure:.4,taper:.3,wobble:1.5,step:10}),.95);s.restore();
   if(esc>=1){const rim:Pt[]=blob(DISC5[0],DISC5[1],R5,R5,62,{amp:.02,n:64}).slice(52,58);s.fill(K,ribbon(rim,10,{seed:68,pressure:.5,taper:.5,wobble:1}),.9*(1-sm(5.6,6.2,t)));}}
  // the boot and ball at the bottom right; an orange thread yanks the boot until it is traced and goes slack
  const yank=sm(6.88,7.13,t,easeIn),trace=sm(7.13,7.43,t),slack=sm(7.43,7.9,t,easeOut),lift=40*yank*(1-slack);
  const heel:Pt=[340,340];
  const sagV=60*slack+12*settle(t,7.9,{amp:1,freq:3,decay:4});
  const th:Pt[]=smoothPts([TAIL5,[lerp(TAIL5[0],heel[0],.35),lerp(TAIL5[1],heel[1],.35)-80+sagV],[lerp(TAIL5[0],heel[0],.7),lerp(TAIL5[1],heel[1],.7)+40+sagV],heel],false,10);
  if(t>=6.88){s.fill(O,ribbon(th,14,{seed:69,pressure:.5,taper:.3,wobble:1.5,step:10}),.95);if(trace>0)s.fill(K,ribbon(partial(th,trace),22,{seed:70,pressure:.3,taper:.2,wobble:1,step:10}),.95);if(trace>0)s.fill(O,ribbon(partial(th,trace),14,{seed:69,pressure:.5,taper:.3,wobble:1.5,step:10}),.95);}
  ball(s,300,340,60,71,{ghost:[0,0,0]});
  boot(s,340,340-lift,200,-20*D*yank*(1-slack),72,{});
 },
 aperture(){return apertureDisc(250,250,40,12);},
};
// ch6 — BREATHE: an orange field and a navy field with a paper gap between them; a paper player mid-kick on the navy side lowers the foot and
// stands as the breath widens the gap; a fork; a choice
function gap6(t:number){return{w:key(t,[[0,12],[.15,4],[.3,12],[1.6,12],[2.2,66,easeOut],[2.4,60],[4.22,60],[4.37,56],[4.87,200,easeOut]]),cx:-54};}
const ch6:Scene={
 draw(s,t){
  const {w,cx}=gap6(t),br=sm(4.22,4.87,t,easeOut);
  const v=camKeys(s,t,[[0,-54,0,1,0],[1.6,-54,0,1.2,0],[4.22,0,0,1.22,3*D],[4.74,0,40,1.3,3*D],[5.31,0,200,1.42,0],[5.96,0,201,1.422,0]]);
  s.camera(v[0]+12*Math.sin(br*Math.PI),v[1],v[2],v[3]);
  const lean=t<.15?6*Math.sin(t/.15*Math.PI):0;
  const soft=1-.5*br;
  const left=handCut([[-4000,-4000],[cx-w/2+lean,-4000],[cx-w/2+lean,4000],[-4000,4000]],71,40*soft,150),right=handCut([[cx+w/2-lean,-4000],[4000,-4000],[4000,4000],[cx+w/2-lean,4000]],72,40*soft,150);
  s.fill(O,polyPath(left,true),lerp(.85,.55,br));s.fill(K,polyPath(right,true),lerp(.92,.75,br));
  // the gap's edges get a navy contour, top to bottom
  const c=sm(0,.5,t,easeOut);if(c>0){const le=left.filter(p=>p[0]>-3000),re=right.filter(p=>p[0]<3000);s.fill(K,ribbon(partial(le,c),10,{seed:73,pressure:.6,taper:.3,wobble:1.5,step:16}),.95);s.fill(K,ribbon(partial(re.reverse(),c),10,{seed:74,pressure:.6,taper:.3,wobble:1.5,step:16}),.95);}
  // the reaction: a paper player mid-kick on the navy field; with the breath the foot lowers and the player stands, chest expanding
  const lower=sm(4.4,4.7,t,easeOut),inhale=sm(4.22,4.87,t,easeOut);
  const kL=poseLimbs('kick'),sL=poseLimbs('stand');
  figure(s,330,330,460,K,75,'kick',{mode:'paper',paperTone:.12,toneInk:O,facing:-1,legs:mixLimbs(kL.legs,sL.legs,lower),arms:mixLimbs(kL.arms,sL.arms,lower),tilt:.08*lower,scaleX:1+.14*inhale});
  if(t<2.2)speedLines(s,Y,150,220,-.5,{n:3,seed:76,len:120,spread:40,width:8,cov:.9*(1-sm(1.6,2.2,t))});
  if(lower>0)s.knockout(ribbon([[120,330],[600,330]],10,{seed:77,pressure:.3,taper:.2,wobble:1.5,step:30}),.95*lower);
  // a choice: a heavier blue ribbon rises up-right, a thin orange one runs to the toe; the ball rocks toward the blue
  const fork=sm(4.74,5.14,t,easeOut),thin=sm(4.84,5.14,t,easeOut);
  if(fork>0){s.fill(B,ribbon(partial(smoothPts([[-20,260],[40,60],[160,-300]],false,10),fork),30,{seed:78,pressure:.5,taper:.4,wobble:2,step:12}),.9);}
  if(thin>0)s.fill(O,ribbon(partial([[-20,260],[300,262]],thin),14,{seed:79,pressure:.4,taper:.3,wobble:1.5,step:16}),.9);
  if(t>=4.74)ball(s,-20,260,50,80,{rot:-.2*sm(5.14,5.4,t)*(1-sm(5.4,5.8,t)),ghost:[14,10,.25]});
 },
 aperture(){return apertureDisc(-54,-150,40,12);},
};
// ch7 — three turnings on a paper band: the walls become a lane and the star becomes the ball (focus); the curled figure climbs the arches and
// stands tall (courage); the pointing figure lowers its arm onto the teammate's shoulder and the star becomes a blue ring (encouragement)
const ch7:Scene={
 draw(s,t){
  camKeys(s,t,[[0,-560,130,1.12,0],[3.42,0,140,1.12,0],[5.16,560,180,1.15,-3*D],[7.37,620,240,1.36,0],[8.02,621,241,1.362,0]]);
  s.field(O,.6,.4);s.fill(B,polyPath([[-4000,300],[4000,300],[4000,4000],[-4000,4000]],true),.6);
  const band=polyPath(handCut([[-4000,-40],[4000,-40],[4000,300],[-4000,300]],81,26,150),true);s.knockout(band,.95);
  const pulse=t>=6.96&&t<7.2&&twosIndex(t)%2===0?1.06:1;
  // A: the walls pinch, rotate into bars, stretch and join into one blue lane; the star relaxes into the ball, which rolls along the lane
  const pin=sm(0,.2,t)*(1-sm(.2,.35,t)),rot=sm(.2,.7,t,easeIO)*(1+.05*settle(t,.7,{amp:1,freq:4,decay:5})),stretch=sm(.7,1.3,t,easeOut);
  const gap=80-20*pin;
  s.save();s.translate(-560,130);
  for(const side of[-1,1]){s.save();s.rotate(rot*Math.PI/2);const wx=side*(gap/2+60);const pts=handCut([[wx-60,-150],[wx+60,-150],[wx+60,150],[wx-60,150]],82+side,14,60);const p=polyPath(pts,true);if(stretch<1){s.knockout(p);s.fill(O,p,.85*(1-stretch));}s.restore();}
  if(stretch>0){const L=380*stretch;s.fill(B,ribbon([[-40,0],[-40+L,0]],30,{seed:84,pressure:.4,taper:.3,wobble:2,step:14}),.9*pulse);}
  const unb=sm(.5,1.0,t,easeOut);
  if(unb<1){let sp=starPts(0,0,90,8,-Math.PI/2);const ring=blob(0,0,72,72,85,{amp:.03,n:16});sp=sp.map((p,i)=>[lerp(p[0],ring[i][0],unb),lerp(p[1],ring[i][1],unb)]);sp=pressPts(sp,0,pin*.6,gap/2+10,[0,0]);starOutline(s,sp,14,86,{});}
  s.restore();
  if(unb>=1)ball(s,-560+240*sm(1.0,1.7,t,easeOut),130,64,87,{rot:sm(1.0,1.7,t)*3,ghost:[0,0,0]});
  // B: a blue arrow rises through the arches; each band gets a paper gap and bows outward; the curled figure climbs and straightens
  const arrow=sm(3.42,4.02,t,easeOut),climb=sm(4.02,4.72,t,easeIO);
  const gaps:[number,number][]=[];const bow=[0,0,0];[[360,-160],[260,-60],[160,40]].forEach(([sp2,gy],k)=>{void sp2;const u=sm(3.42+k*.15,3.5+k*.15,t);if(u>0){gaps.push([gy,40]);bow[k]=.06*u;}});
  s.save();s.clip(polyPath([[-300,-400],[300,-400],[300,300],[-300,300]],true));s.fill(K,polyPath([[-190,-400],[190,-400],[190,300],[-190,300]],true),1);
  nestedArches(s,0,300,[360,260,160],[.3,.45,.6],{ratio:.75,legs:600,gaps,bow});s.restore();
  if(arrow>0)laneArrow(s,B,[0,250],[0,-300],26,{head:60,seed:88,progress:arrow,cov:.9*pulse});
  const cy=lerp(280,40,climb)+10*(climb>=1?settle(t,4.72,{amp:1,freq:4,decay:5}):0);
  figure(s,0,cy,200,B,89,climb<.6?'curl':'reach',{facing:1,tilt:climb<.6?-.85*climb/.6:0,headDrop:climb<.6?[.04*(1-climb/.6),.06*(1-climb/.6)]:undefined});
  // C: the pointing figure jabs at a teammate, its arm lowers onto the shoulder; the star relaxes into a ring that re-inks blue; a yellow thread ties it to the band
  const jab=sm(5.16,5.31,t)*(1-sm(5.31,5.45,t)),relax=[sm(5.45,5.7,t,easeIn),sm(5.7,5.95,t,easeIn),sm(5.95,6.2,t,easeIn)],relaxU=sm(5.45,6.2,t,easeIO),slide=sm(6.2,6.5,t,easeOut),blue=sm(6.5,6.8,t);
  const buoy=-10*sm(6.9,7.2,t,easeOutBack);
  const pL=poseLimbs('point'),lL=poseLimbs('lean');
  if(blue<1)layeredStar(s,lerp(700,640,slide),lerp(80,200,slide),110,10,90,{relax,scale:pulse});
  if(blue>0)s.fill(B,ribbon(blob(640,205+buoy,120,120,91,{amp:.03,n:32}),22,{seed:91,close:true,pressure:.4,wobble:2}),.7*blue*pulse);
  const tie=sm(6.6,7.0,t,easeOut);if(tie>0){s.fill(Y,ribbon(partial([[640,325],[640,400],[600,460]],tie),8,{seed:92,pressure:.4,taper:.3,wobble:1.5}),.95);if(tie>=1)s.fill(K,ribbon(blob(600,460,12,12,93,{amp:.05,n:12}),5,{seed:93,close:true,wobble:1}),.95);}
  figure(s,640,300+buoy,220,B,94,'stand',{facing:-1});
  figure(s,lerp(470,545,slide)+10*jab,300,220,K,95,'point',{facing:1,arms:mixLimbs(pL.arms,lL.arms,relaxU),tilt:.16*relaxU});
 },
 aperture(){return apertureDisc(640,200,26,12);},
};
// ch8 — the goal everyone sees; the small calm response at the edge (a figure lowering its arms, a teammate's hand on the shoulder, a speech
// disc); the recovery: a figure on the ground gets up and runs back after a miss
function fig8(t:number){const run=sm(9.1,9.7,t,easeIO)*(t<9.1?0:1);const dx=180-300,dy=-60-300,L=Math.hypot(dx,dy);return{x:300+dx/L*140*run+(run>=1?dx/L*10*settle(t,9.7,{amp:1,freq:4,decay:5}):0),y:330+dy/L*140*run,run};}
const ch8:Scene={
 draw(s,t){
  const dip=20*sm(7.98,8.3,t,easeIn)*(1-sm(8.3,8.9,t,easeOut));
  const v=camKeys(s,t,[[0,0,-40,1,0],[.3,-60,0,1.08,0],[2.86,-60,0,1.08,0],[5.06,-380,280,1.28,0],[7.98,-360,320,1.3,3*D],[10.57,300,260,1.4,0],[11.22,301,261,1.402,0]]);
  s.camera(v[0]+30*settle(t,.1,{amp:1,freq:7,decay:5}),v[1]+dip,v[2],v[3]);
  s.field(K,.85,.4);
  // the celebration: rays burst behind the net, pulse, then fade when the camera looks away
  const rays=key(t,[[0,0],[.3,740,easeOut],[.5,700]]),rayCov=key(t,[[0,.8],[1.4,.8],[1.5,.95],[1.65,.8],[1.8,.95],[1.95,.8],[2.86,.8],[3.66,.15]]);
  if(rays>0){const rr=rng(101),rp=new Path2D();for(let i=0;i<24;i++){const a=i/24*Math.PI*2+(rr()-.5)*.3,r0=rays*.3,r1=rays*(.8+rr()*.5);rp.addPath(ribbon([[-120+Math.cos(a)*r0,40+Math.sin(a)*r0],[-120+Math.cos(a)*r1,40+Math.sin(a)*r1]],34*(.7+rr()*.6),{seed:101+i,taper:.8,pressure:.4,wobble:.8}));}s.knockout(rp,Math.min(.95,rayCov+.1));s.fill(Y,rp,rayCov);}
  goal(s,0,-300,1000,520,102,{bulge:sm(0,.17,t)*(1-sm(.4,1.2,t)),post:28,netCov:.3,bulgeAt:[-120,40]});
  s.knockout(ribbon([[-600,220],[600,220]],10,{seed:103,taper:0,wobble:1.5,step:40}),.9);
  // the ball hits the net (smear on entry), squashes, springs
  const sq=t<.17?.85:1;const entry=t<.08;
  ball(s,-120+(entry?-80:0),40+(entry?60:0),160,104,{sx:entry?1.3:sq,sy:entry?.8:2-sq,ghost:[30,24,.3]});
  // confetti explodes, falls, settles on the ground line on "few people notice"
  confetti(s,[-700,-500,1400,700],40,105,{inks:['paper',B,Y],size:80,burst:[-120,40,320*sm(0,.4,t,easeOut)],fall:Math.min(1,t/1.2),floor:t>=2.86?220:undefined});
  // the calm response: in a paper pocket at the frame's edge, revealed by the pan, a player lowers raised arms (arms up → down)
  const rev=sm(3.66,4.0,t,easeOut),calm=sm(4.0,4.6,t,easeOut),lift=6*sm(5.56,5.86,t,easeOutBack);
  s.knockout(polyPath(blob(-400,300,300*(1+.05*settle(t,4.0,{amp:1,freq:4,decay:5})),180,106,{amp:.05,n:32}),true),.95);
  const rL=poseLimbs('reach'),sL=poseLimbs('stand'),lL=poseLimbs('lean');
  if(rev>0)figure(s,-470,400-lift,220,K,107,'reach',{facing:1,arms:mixLimbs(rL.arms,sL.arms,calm),tilt:.05*(1-calm)});
  // supportive words: a teammate steps in, its arm lands on the shoulder, a paper speech disc between them
  const join=sm(5.06,5.56,t,easeOut),words=sm(5.56,5.86,t,easeOutBack);
  if(t>=5.06)figure(s,lerp(-250,-350,join),400-lift,220,K,108,'stand',{facing:-1,arms:mixLimbs(sL.arms,lL.arms,join),tilt:.16*join});
  if(words>0)speech(s,-330,60-lift,86,50,-360,210,109,Math.min(1,words));
  // keep going: the ball rolls out over the line and drops; a player on the ground gets up (lie → kneel → run) and runs back up the field along a blue arrow
  if(t>=7.98){const out=sm(8.0,8.5,t,easeIn),wob8=t<8.0?4*Math.sin(t*40):0;const bx=360+wob8+80*out,by=240+40*out+300*out*out;
   if(out<1)ball(s,bx,by,50,112,{ghost:[0,0,0]});s.tone(K,polyPath(blob(380,236,50,50,113,{amp:.03}),true),.3);
   const f=fig8(t);if(t>=8.68)laneArrow(s,B,[300,280],[180,-40],26,{head:60,seed:114,progress:sm(8.68,9.28,t,easeOut),cov:.9});
   const up=sm(8.3,8.9,t);const st=stride(twosIndex(t));
   if(up<.45)figure(s,240,330,220,B,115,'lie',{facing:1});
   else if(up<1)figure(s,270,330,220,B,115,'kneel',{facing:-1});
   else figure(s,f.x,f.y,220,B,115,f.run>0&&f.run<1?'run':'stand',{facing:-1,legs:f.run>0&&f.run<1?st.legs:undefined,arms:f.run>0&&f.run<1?st.arms:undefined});}
 },
 aperture(t){const f=fig8(t);return apertureDisc(f.x,f.y-100,24,12);},
};
// ch9 — play through it: the player carries the ball inside its paper disc through the orange front toward the far goal
const ch9:Scene={
 draw(s,t){
  const strike=sm(2.24,3.14,t,easeOut),back=sm(.98,1.38,t,easeIn);
  camKeys(s,t,[[0,-220,60,1,0],[.98,-200,60,1.1,0],[2.24,-140,40,1.12,-3*D],[3.68,340,-20,1.26,0],[4.02,341,-21,1.262,0]]);
  ribbonBg(s,0,0,-22*D,121,{});
  // the far goal beyond the front
  goal(s,520,-160,200,80,122,{post:10,netCov:.3});
  // the front: the orange wall with a torn left edge; it pulses in and advances, and closes again behind the disc
  const adv=key(t,[[0,0],[.2,-20],[.7,40,easeIO]]),pulse=t>=.2&&t<.9&&twosIndex(t)%2?.9:.8,flap=strike>.3&&strike<.5?2:1;
  const edge=handCut([[140+adv,-4000],[140+adv,4000]],123,60*flap,170,false);s.fill(O,polyPath([...edge,[4000,4000],[4000,-4000]],true),pulse);
  // the ball with its travelling disc; the disc knocks the front out as it passes, the orange closes behind it
  const bx=lerp(-220,380,strike),by=lerp(60,-20,strike),rim=1-.04*sm(0,.5,t)*(1-sm(.5,1.0,t));
  const discP=polyPath(blob(bx,by,250*rim,250,124,{amp:.03,n:40}),true);s.knockout(discP,.95);
  const bright=key(t,[[0,.3],[2.74,.3],[3.1,.6]]);drawThreads(s,threads(bx,by,200,[bx-160,by+150],125,2,0),7,126,{cov:bright});
  // the player inside the disc: winds up, strikes (contact frame smeared), then runs after the ball with it
  const contact=t>=2.24&&t<2.32,st=stride(twosIndex(t));
  const px=bx-130-40*back*(1-strike)+(contact?30:0),py=by+130;
  figure(s,px,py,300,K,127,t<2.24?'stand':strike<.3?'kick':'run',{facing:1,legs:strike>=.3&&strike<1?st.legs:undefined,arms:strike>=.3&&strike<1?st.arms:undefined,tilt:t<2.24?-.1*back:0});
  ball(s,bx+(strike<.3&&t>=2.24?20:0),by,110,128,{rot:strike*6,ghost:[30,22,.3*sm(.3,.7,t)]});
  if(contact)speedLines(s,K,-220,60,0,{n:3,seed:129,len:100,spread:30,width:7,cov:.9});
 },
 still:3.3,
};
const SCENES=[ch1,ch2,ch3,ch4,ch5,ch6,ch7,ch8,ch9];
const DURATION=66.638313;
const T=(start:number,text:string,seconds=0):Chapter=>({label:'',narration:text,seconds,start,cues:[{at:0,words:text.split(' ').slice(0,3).join(' ')}]});
const CAPTIONS:Chapter[]=[
 T(0,'Did you know that every young footballer plays two games at the same time?'),
 T(4.8,'There’s the game everyone can see—the passes, tackles, goals, and saves.'),
 T(10.8,'And then there’s the game happening inside—the frustration after a mistake,'),
 T(16.28,'the fear of letting the team down, and the anger when a decision feels unfair.'),
 T(21.84,'Here’s what’s fascinating: a player can control the ball with their feet,'),
 T(26.66,'but they control the moment with their mind.'),
 T(29.419999999999998,'Emotional intelligence doesn’t mean ignoring those feelings.'),
 T(33.9,'It means noticing them before they make the next decision for you.'),
 T(37.42,'Because between the emotion and the reaction, there is a small space.'),
 T(41.64,'A breath.'),
 T(42.16,'A choice.'),
 T(43.38,'In that space, frustration can become focus.'),
 T(46.8,'Fear can become courage.'),
 T(48.54,'And blame can become encouragement.'),
 T(51.4,'Everyone celebrates the goal that wins the match.'),
 T(54.26,'But few people notice the calm response, the supportive words,'),
 T(59.38,'or the decision to keep going after a mistake.'),
 T(62.62,'Great players don’t play without emotion.'),
 T(64.86,'They learn how to play through it.'),
].map((c,i,all)=>({...c,seconds:Math.round(((all[i+1]?.start??DURATION)-(c.start??0))*1000)/1000}));

export const story:RisoStory={
 id:'regulate',format:'11v11',title:'Regulating emotions',theme:'When the game feels unfair.',ageNote:'Direct reflections for older youth, roughly 12 and up; playing format does not define age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',orange:'#ff6c2f',blue:'#0078bf',navy:'#22366b'},order:['yellow','orange','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'track',src:'/stories/films/regulate/narration.mp3',duration:DURATION},
 chapters:CAPTIONS,
 /** The picture's own chapter map (nine compositions on the caption story's clock). Headlines: none on the title chapter or the turnings. */
 visualChapters:[
  {start:0,label:'Two games'},
  {start:10.8,label:'Frustration',headline:'Frustration'},
  {start:16.28,label:'Fear',headline:'Fear'},
  {start:21.84,label:'Control',headline:{text:'Control',at:4.82}},
  {start:29.42,label:'Notice',headline:{text:'Notice',at:4.48}},
  {start:37.42,label:'Breathe',headline:{text:'Breathe',at:4.22}},
  {start:43.38,label:'Three turnings'},
  {start:51.4,label:'The goal everyone sees'},
  {start:62.62,label:'Play through',headline:'Play through'},
 ],
 draw(f){const v=trackChapters(story,f);playChapters(v.story,v.frame,SCENES);},
 touch(s,x,y,age,seed){
  const g=age<=0?.5:easeOut(clamp(age/.3)),fade=age<=0?1:1-clamp((age-.4)/.4);
  s.knockout(ribbon(blob(x,y,90*g,90*g,seed,{amp:.04,n:24}),12,{seed,close:true,pressure:.3,wobble:1.5}),.95*fade);
  const push=age<=0?0:20*Math.sin(clamp(age/.5)*Math.PI);if(push>0)s.knockout(polyPath(blob(x,y,90*g+push,90*g+push,seed+1,{amp:.04,n:24}),true),.3*fade);
  confetti(s,[x-40,y-40,80,80],6,seed+2,{inks:['paper',Y,B],size:34,burst:[x,y,age<=0?30:120*easeOut(clamp(age/.4))],fall:age<=0?0:clamp(age/.8)});
 },
};
