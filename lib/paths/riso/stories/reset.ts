/** Mental Toughness (reset) — riso rebuild. Lead material: a flexible branch in wind.
 * Background world: purple wind STREAMLINES — torn drifting bands that bend around the branch (compressed windward, relaxed leeward),
 * compress on a gust envelope and relax; people are ABSTRACT riso figures (bible §1c.4, `figure()` below); the ball is a yellow disc with a navy hexagon net;
 * yellow grainy ground; leaf fragments blown along the bands. Inks: yellow → blue → purple → navy on cream.
 * Roles: purple = pressure/wind/opponent, blue = teammate branch, navy wood + yellow leaves = the metaphor.
 * Wind blows screen-left → screen-right for the whole story. Drawn objects on twos, camera on ones, randomness seeded. */
import type {Sheet} from '../sheet';
import {type RisoStory,type Scene,playChapters} from '../story';
import {aperture,apertureDisc} from '../passage';
import {twos,twosIndex,sm,easeOut,easeIO,easeIn,easeOutBack,key,settle,spring,squash,clamp,lerp,rng,hash,noise1,blob,polyPath,ribbon,smoothPts,partial,rotPts,circlePath,arc,TAU,type Pt,type Key} from '../motion';
import {laneArrow,sparkBurst,speedLines,ripple,chalkStroke,contour,dust,handCut} from '../shapes';

const CH='/stories/narration/11v11/reset/';
const K='navy',P='purple',B='blue',Y='yellow';

// ---------------- motion helpers ----------------
/** gust envelope 0..1: rises (easeIn) onset→peak, relaxes (slow tail) peak→recovery. */
const gust=(t:number,on:number,peak:number,rec:number)=>t<=on||t>=rec?0:t<peak?easeIn((t-on)/(peak-on)):Math.pow(1-(t-peak)/(rec-peak),3);
/** integral of the gust envelope (drives the extra band drift a gust adds). */
function gustInt(t:number,on:number,peak:number,rec:number){if(t<=on)return 0;const a=peak-on,b=rec-peak;if(t<peak){const u=(t-on)/a;return a*u*u*u*u/4;}if(t<rec){const u=(t-peak)/b;return a/4+b*(1-Math.pow(1-u,4))/4;}return a/4+b/4;}
/** camera through [t,x,y,zoom,rot] keys, each segment eased (a key may carry its own ease as its last element). */
function cam(s:Sheet,t:number,K:Key[],kick:Pt=[0,0]){const v=key(t,K,easeIO,true);s.camera(v[0]+kick[0],v[1]+kick[1],v[2]??1,v[3]??0);return v;}
const wrap=(v:number,a:number,b:number)=>{const L=b-a;return a+(((v-a)%L)+L)%L;};
/** a gaussian bump of half-width w around 0 (edge crumples, local lifts). */
const bell=(d:number,w:number)=>Math.exp(-(d/w)*(d/w));
/** residual sway: the branch never stops dead (a slow two-tone oscillation added to every bend). */
const sway=(t:number,k=1)=>k*(.02*Math.sin(t*2.4)+.012*Math.sin(t*4.1+1));

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


// ---------------- the world: wind bands, ground, fragments ----------------
type Band={y:number;h:number;cov:number;speed:number;seed:number};
/** A full-width strip with torn top and bottom edges whose noise slides with `off` (units) — drift without a seam.
 * top/bottom(x) add a local displacement (crumple toward a push, a lift under a supporting branch). */
function bandPath(y0:number,y1:number,off:number,seed:number,amp:number,o:{top?:(x:number)=>number;bottom?:(x:number)=>number;x0?:number;x1?:number;step?:number}={}){
 const{top,bottom,x0=-1800,x1=1800,step=60}=o,p=new Path2D();
 const yt=(x:number)=>y0+amp*noise1((x-off)/170+seed,seed)+amp*.45*noise1((x-off)/52,seed+3)+(top?top(x):0);
 const yb=(x:number)=>y1+amp*noise1((x-off)/190+seed+50,seed+7)+amp*.45*noise1((x-off)/61,seed+9)+(bottom?bottom(x):0);
 p.moveTo(x0,yt(x0));for(let x=x0+step;x<=x1;x+=step)p.lineTo(x,yt(x));for(let x=x1;x>=x0;x-=step)p.lineTo(x,yb(x));p.closePath();return p;
}
/** Wind bands: each its own torn print at a stepped coverage, drifting right; a gust compresses them (height ×.7, speed ×3, cov +.2). */
type Flow={x:number;y:number;r:number;k:number};
/** Wind streamlines: each band is its own torn print at a stepped coverage, drifting right; `flow` bends every band around an obstacle
 * (the branch): bands above it lift, bands below it dip, most strongly near it, and the windward side is compressed. */
function windBands(s:Sheet,t:number,bands:Band[],g:(b:number)=>number,gi:(b:number)=>number,edges:Partial<Record<number,{top?:(x:number)=>number;bottom?:(x:number)=>number}>>={},ink=P,flow?:Flow){
 bands.forEach((b,i)=>{const gg=g(i),h=b.h*(1-.3*gg),off=b.speed*1.8*(t+2*gi(i)),cov=Math.min(.9,b.cov+.2*gg),e=edges[i]??{};
  const fl=flow?(x:number)=>(b.y<flow.y?-1:1)*flow.k*bell(x-flow.x-(x<flow.x?0:flow.r*.4),flow.r)*bell(b.y-flow.y,flow.r*1.3):()=>0;
  const path=bandPath(b.y-h/2,b.y+h/2,off,b.seed,18+10*gg,{top:x=>(e.top?e.top(x):0)+fl(x),bottom:x=>(e.bottom?e.bottom(x):0)+fl(x)});s.tone(ink,path,cov);});
}
/** Ground: a yellow grainy band below a torn horizon. */
function ground(s:Sheet,y:number,seed:number,cov=.4){s.tone(Y,bandPath(y,y+2400,0,seed,26,{step:80}),cov);s.tone(K,bandPath(y+150,y+230,0,seed+1,22,{step:70}),.12);s.tone(P,bandPath(y+330,y+470,0,seed+2,30,{step:70}),.3);s.tone(K,bandPath(y+560,y+2400,0,seed+3,26,{step:80}),.15);dust(s,null,0,y+300,900,40,{seed:seed+4,size:7,cov:.5,spread:1.6});}
/** Leaf fragments riding the bands (world-index seeding so they wrap), scattering away from a push and settling. */
function fragments(s:Sheet,t:number,bands:Band[],count:number,seed:number,gi:(b:number)=>number,g:(b:number)=>number,push?:{x:number;y:number;age:number;r?:number}){
 const rr=rng(seed),yel=new Path2D(),pap=new Path2D();
 for(let i=0;i<count;i++){const b=bands[i%bands.length],bi=i%bands.length,x0=rr()*3600-1800,ly=b.y+(rr()-.5)*b.h*.6,sz=(16+rr()*16),spin=(rr()-.5)*4,ph=rr()*TAU;
  let x=wrap(x0+b.speed*1.8*(t+2*gi(bi))*1.15,-1800,1800),y=ly+6*Math.sin(twos(t)*2+ph)*(1+3*g(bi));
  if(push){const a=clamp(push.age/1.2),d=Math.hypot(x-push.x,y-push.y),R=push.r??380;if(a>0&&a<1&&d<R){const k=Math.sin(a*Math.PI)*90*(1-d/R);x+=(x-push.x)/(d||1)*k;y+=(y-push.y)/(d||1)*k;}}
  const q=rotPts([[-sz,-sz*.45],[sz*.9,-sz*.6],[sz,sz*.4],[-sz*.8,sz*.55]],ph+twos(t)*spin);const p=i%3===2?pap:yel;p.moveTo(x+q[0][0],y+q[0][1]);for(let k=1;k<4;k++)p.lineTo(x+q[k][0],y+q[k][1]);p.closePath();}
 s.fill(Y,yel,.9);s.knockout(pap,.8);
}

// ---------------- the branch, leaves, ball, cup, knot ----------------
/** spine: root→tip with a slight natural arc, bent about the root by `bend` radians (more toward the tip, like wood). */
function spine(root:Pt,tip:Pt,bend:number,seed:number,n=22,sag=50):Pt[]{
 const dx=tip[0]-root[0],dy=tip[1]-root[1],L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L,r=rng(seed),k=(r()-.5)*2,out:Pt[]=[];
 for(let i=0;i<=n;i++){const u=i/n,px=root[0]+dx*u+nx*sag*k*Math.sin(u*Math.PI),py=root[1]+dy*u+ny*sag*k*Math.sin(u*Math.PI),a=bend*Math.pow(u,1.5),c=Math.cos(a),sn=Math.sin(a),x=px-root[0],y=py-root[1];out.push([root[0]+x*c-y*sn,root[1]+x*sn+y*c]);}
 return out;
}
const at=(pts:Pt[],u:number)=>{const i=Math.min(pts.length-2,Math.max(0,Math.floor(u*(pts.length-1)))),f=u*(pts.length-1)-i;return{p:[lerp(pts[i][0],pts[i+1][0],f),lerp(pts[i][1],pts[i+1][1],f)] as Pt,a:Math.atan2(pts[i+1][1]-pts[i][1],pts[i+1][0]-pts[i][0])};};
/** tapered wobbly polygon along a spine (w0 at the start, w1 at the end); side +1 = only the lower half (shadow). */
function taper(pts:Pt[],w0:number,w1:number,seed:number,side=0,extra=0){
 const q=smoothPts(pts,false,10),n=q.length,L:Pt[]=[],R:Pt[]=[];
 for(let i=0;i<n;i++){const a=q[Math.max(0,i-1)],b=q[Math.min(n-1,i+1)];let nx=a[1]-b[1],ny=b[0]-a[0];const l=Math.hypot(nx,ny)||1;nx/=l;ny/=l;if(ny<0){nx=-nx;ny=-ny;}const u=i/(n-1),w=lerp(w0,w1,u)*(1+.08*noise1(i*.7+seed,seed))/2;
  L.push(side>0?[q[i][0],q[i][1]]:[q[i][0]-nx*w,q[i][1]-ny*w]);R.push([q[i][0]+nx*(w+extra),q[i][1]+ny*(w+extra)]);}
 const p=new Path2D();p.moveTo(L[0][0],L[0][1]);for(let i=1;i<n;i++)p.lineTo(L[i][0],L[i][1]);for(let i=n-1;i>=0;i--)p.lineTo(R[i][0],R[i][1]);p.closePath();return p;
}
/** leaf outline points: a pointed blade of length len and half-width wid, from (x,y) at angle a. */
function leafPts(x:number,y:number,a:number,len:number,wid:number,seed:number):Pt[]{
 const pts:Pt[]=[];const N=9;for(let i=0;i<=N;i++){const u=i/N;pts.push([u*len,-Math.sin(u*Math.PI)*wid*(1+.15*noise1(u*3+seed,seed))]);}
 for(let i=N-1;i>0;i--){const u=i/N;pts.push([u*len,Math.sin(u*Math.PI)*wid*(1+.15*noise1(u*3+seed+5,seed+1))]);}
 return rotPts(pts,a).map(p=>[p[0]+x,p[1]+y] as Pt);
}
type Leaf={x:number;y:number;a:number;len:number;wid:number;seed:number};
/** draw a batch of leaves: one ink fill and one midrib knockout. */
function leaves(s:Sheet,ink:string,list:Leaf[],cov=.92){
 if(!list.length)return;const body=new Path2D(),rib=new Path2D();
 for(const l of list){if(l.len<4)continue;body.addPath(polyPath(leafPts(l.x,l.y,l.a,l.len,l.wid,l.seed),true));const e:Pt=[l.x+Math.cos(l.a)*l.len*.85,l.y+Math.sin(l.a)*l.len*.85];rib.addPath(ribbon([[l.x,l.y],e],Math.max(2,l.wid*.16),{seed:l.seed,taper:.8,wobble:.8,pressure:0}));}
 s.fill(ink,body,cov);s.knockout(rib,.9);
}
/** the branch: purple shadow tone on the lower side (thicker when bent), navy wood, paper highlight on the light side, leaves. */
function branch(s:Sheet,pts:Pt[],w0:number,w1:number,seed:number,o:{ink?:string;leafInk?:string;leafU?:number[];leafLen?:number;wind?:number;flutter?:number;skip?:number[];shadow?:number;leafScale?:number[];cov?:number}={}){
 const{ink=K,leafInk=Y,leafU=[],leafLen=130,wind=0,flutter=0,skip=[],shadow=0,leafScale,cov=1}=o;
 s.tone(P,taper(pts,w0*1.1,w1*1.4,seed+1,1,6+shadow*14),.5);
 s.fill(ink,taper(pts,w0,w1,seed),cov);
 s.knockout(taper(pts,w0*.28,w1*.3,seed+2,-1),.45);
 const list:Leaf[]=[];leafU.forEach((u,i)=>{if(skip.includes(i))return;const{p,a}=at(pts,u),side=i%2?1:-1,sc=leafScale?.[i]??1;if(sc<=0)return;
  let ang=a+side*(.95+.25*noise1(i+seed,seed));ang=lerp(ang,.35+side*.2,clamp(wind));ang+=flutter*side*.25*Math.sin(twos(u*7)+i);
  list.push({x:p[0],y:p[1],a:ang,len:leafLen*(.8+.35*hash(i,seed))*sc,wid:leafLen*.3*sc*(1+.3*clamp(wind)),seed:seed*7+i});});
 leaves(s,leafInk,list);
}
/** the story's ball: a leaf-yellow disc with a navy HEXAGON net (one central hexagon, six around it) so it reads as a football,
 * a navy rim and a paper highlight. lens>0 widens one seam into a navy lens (ch4 seam). */
function leafBall(s:Sheet,x:number,y:number,r:number,rot:number,o:{sx?:number;sy?:number;cov?:number;lens?:number;seed?:number}={}){
 const{sx=1,sy=1,cov=.92,lens=0,seed=5}=o;s.save();s.translate(x,y);s.scale(sx,sy);
 const disc=polyPath(blob(0,0,r,r,seed,{amp:.03,n:48}),true);s.knockout(disc,.95);s.fill(Y,disc,cov);
 const hex=(cx:number,cy:number,hr:number,a0:number)=>{const pts:Pt[]=[];for(let i=0;i<6;i++){const a=a0+i/6*TAU;pts.push([cx+Math.cos(a)*hr,cy+Math.sin(a)*hr]);}return pts;};
 const net=new Path2D();net.addPath(ribbon(hex(0,0,r*.3,rot),Math.max(3,r*.06),{seed:seed+2,close:true,taper:0,wobble:1,pressure:.3}));
 for(let k=0;k<6;k++){const a=rot+k*TAU/6,d=r*.6;const c=hex(Math.cos(a)*d,Math.sin(a)*d,r*.3,a);net.addPath(ribbon(c,Math.max(3,r*.06),{seed:seed+3+k,close:true,taper:0,wobble:1,pressure:.3}));}
 s.save();s.clip(disc);s.fill(K,net,.6);s.restore();
 s.fill(K,ribbon(blob(0,0,r,r,seed+1,{amp:.02,n:48}),Math.max(3,r*.07),{seed:seed+9,close:true,pressure:.6,wobble:r*.02}));
 if(lens>0){const a=rot+TAU/5*2,L=r*.95,w=r*.55*lens,pts:Pt[]=[];for(let i=0;i<=8;i++){const u=i/8;pts.push([Math.cos(a)*L*u+Math.cos(a+Math.PI/2)*Math.sin(u*Math.PI)*w,Math.sin(a)*L*u+Math.sin(a+Math.PI/2)*Math.sin(u*Math.PI)*w]);}for(let i=7;i>0;i--){const u=i/8;pts.push([Math.cos(a)*L*u-Math.cos(a+Math.PI/2)*Math.sin(u*Math.PI)*w,Math.sin(a)*L*u-Math.sin(a+Math.PI/2)*Math.sin(u*Math.PI)*w]);}s.fill(K,polyPath(pts,true));}
 s.knockout(polyPath(blob(-r*.38,-r*.4,r*.16,r*.13,seed+2,{amp:.05}),true));
 s.restore();
}
/** the lens polygon of leafBall in world space (for the ch4 aperture). */
function ballLens(x:number,y:number,r:number,rot:number,lens:number):Pt[]{const a=rot+TAU/5*2,L=r*.95,w=r*.55*lens,pts:Pt[]=[];for(let i=0;i<=8;i++){const u=i/8;pts.push([x+Math.cos(a)*L*u+Math.cos(a+Math.PI/2)*Math.sin(u*Math.PI)*w,y+Math.sin(a)*L*u+Math.sin(a+Math.PI/2)*Math.sin(u*Math.PI)*w]);}for(let i=7;i>0;i--){const u=i/8;pts.push([x+Math.cos(a)*L*u-Math.cos(a+Math.PI/2)*Math.sin(u*Math.PI)*w,y+Math.sin(a)*L*u-Math.sin(a+Math.PI/2)*Math.sin(u*Math.PI)*w]);}return pts;}
/** a leaf-cup: two leaves opening from a point; open 0 = folded shut, 1 = open. */
function cupLeaves(x:number,y:number,a:number,open:number,len:number,seed:number):Leaf[]{const sp=.12+.55*open;return[{x,y,a:a-sp,len,wid:len*.3,seed},{x,y,a:a+sp,len:len*.9,wid:len*.28,seed:seed+1}];}
/** the knot: the twig looped through itself; yellow highlight in the loop, paper glint. tight 0..1 shrinks it. */
function knot(s:Sheet,x:number,y:number,r:number,progress:number,tight=0,seed=31){
 const rr=r*(1-.15*tight),loop=blob(x,y,rr,rr*.85,seed,{amp:.06,n:36}),line=progress>=1?loop:partial(smoothPts(loop,true,6),progress);
 if(progress>=.6)s.fill(Y,polyPath(blob(x,y,rr*.7,rr*.6,seed+1,{amp:.05}),true),.9);
 if(line.length>1)s.fill(K,ribbon(line,r*.4,{seed,close:progress>=1,pressure:.5,wobble:1.5}));
 if(progress>=1)s.knockout(polyPath(blob(x-rr*.25,y-rr*.3,rr*.14,rr*.1,seed+2),true));
}
/** paper air lens travelling along a path (the breath). */
function airLens(s:Sheet,pts:Pt[],u:number,w:number,h:number,seed:number){const{p,a}=at(pts,clamp(u));s.knockout(polyPath(blob(p[0],p[1],w,h,seed,{amp:.08,rot:a,n:24}),true),.92);}
const spark=(s:Sheet,x:number,y:number,age:number,seed:number,r=120)=>{if(age<0)return;const g=easeOutBack(clamp(age/.45))*(1-.3*clamp((age-1.2)/.8));if(g<=0)return;sparkBurst(s,Y,x,y,r,{n:8,seed,g,width:r*.12});};
const puff=(s:Sheet,x:number,y:number,age:number,seed:number,size=1)=>{if(age<0||age>1)return;const r=(40+200*easeOut(age))*size;dust(s,P,x,y,r,Math.round(14*size),{seed,size:9*size,cov:.7*(1-age)});};

// ---------------- chapter 1: a pass carried off line ----------------
const B1:Band[]=[{y:-340,h:170,cov:.35,speed:20,seed:1},{y:-170,h:210,cov:.5,speed:35,seed:2},{y:130,h:200,cov:.7,speed:55,seed:3},{y:330,h:220,cov:.5,speed:80,seed:4},{y:-560,h:170,cov:.35,speed:15,seed:0},{y:-800,h:200,cov:.4,speed:12,seed:20}];
function ch1Ball(t:number):{x:number;y:number;rot:number;sx:number;sy:number}{
 const u=sm(.3,1.05,t,easeIn),fly=t<1.05;let x:number,y:number;
 if(fly){const p=arc([-120,-40],[180,150],u,110);x=p[0];y=p[1]+70*u*u*u;}
 else{x=180;const b=t-1.05;y=150-24*Math.sin(Math.PI*clamp(b/.25))-8*Math.sin(Math.PI*clamp((b-.25)/.2));}
 const rot=u*5+(t>1.05?easeOut(clamp((t-1.05)/.35))*1.2:0);
 const w=t>1.45?settle(t,1.45,{amp:.12,freq:4.5,decay:4,phase:Math.PI/2}):0;const sq=t>=1.4&&t<6.65?.06*sm(1.4,1.8,t):.06*(1-sm(6.65,7.2,t));
 return{x,y,rot,sx:1+w+sq,sy:1-w-sq};
}
const ch1:Scene={
 draw(s,t){
  const tt=twos(t);
  const g3=gust(t,.3,.7,1),g2=gust(t,8,8.4,8.77),G=(i:number)=>i===2?g3:i===1?g2:0,GI=(i:number)=>i===2?gustInt(t,.3,.7,1):i===1?gustInt(t,8,8.4,8.77):0;
  cam(s,t,[[0,0,0,1],[.45,0,0,1],[1.5,120,90,1.15],[2.2,120,90,1.15],[3.2,20,60,1.15],[5,20,60,1.15],[5.8,60,80,1.2],[6.48,60,80,1.2],[7.6,140,150,1.3],[8,140,150,1.3],[8.77,40,-170,1.42,.035]]);
  s.field(Y,.1,.3);s.tone(Y,polyPath(blob(500,600,900,700,3,{amp:.1}),true),.2);
  ground(s,330,11);
  // band 3 closes over the ball (edges crumple toward it), then opens a torn gap (the room)
  const close=sm(1.4,1.8,t)*(1-sm(6.65,7.4,t)),squeeze=sm(6.48,6.65,t)*(1-sm(6.65,7,t));
  const bump=(sign:number)=>(x:number)=>sign*(30*close+10*squeeze)*bell(x-180,220);
  const loosen=sm(6.65,7.6,t)*20;
  windBands(s,t,B1.map((b,i)=>i===1?{...b,y:b.y-loosen}:i===3?{...b,y:b.y+loosen}:b),G,GI,{2:{top:bump(1),bottom:bump(-1)}},P,{x:-220,y:30,r:380,k:100});
  fragments(s,t,B1,14,21,GI,G,t>1.05?{x:180,y:150,age:t-1.05}:undefined);
  const gap=key(t,[[6.65,0],[7.3,1.15,easeOut],[7.7,1]]);if(gap>0)s.knockout(polyPath(blob(180,150,205*gap,135*gap,7,{amp:.14,n:30}),true),.94);
  // branch A: loads back, flicks, returns; straightens toward the new cup; bends in the closing gust
  let bend=key(t,[[0,0],[.25,-.07,easeIn],[.55,.09,easeOut],[1.05,.02],[1.6,0]])+settle(t,1.05,{amp:.04,freq:2.2,decay:2.5})+g3*.05;
  bend+=sm(4.6,5.2,t)*.12+settle(t,5.2,{amp:.05,freq:2,decay:3})+g2*.16+sway(t);
  const A=spine([-540,120],[-120,-40],bend,41);
  branch(s,A,50,14,41,{leafU:[.4,.7,.9],leafLen:150,wind:g3*.6+g2*.8,flutter:g2});
  // the pass that goes wrong: a navy player winds up and kicks at .3; the blue teammate waits with arms up, then slumps as the ball is lost
  const ku=sm(.05,.3,t),kicked=t>=.3&&t<.6;
  figure(s,-300,70,330,K,61,kicked?'kick':'stand',{facing:1,tilt:t<.3?-.12*Math.sin(ku*Math.PI):0});
  const lost=sm(1.05,1.5,t,easeOut),rL=poseLimbs('reach'),slL=poseLimbs('slump');
  figure(s,430,90,300,B,62,'reach',{facing:-1,arms:mixLimbs(rL.arms,slL.arms,lost),tilt:.22*lost,headDrop:[.02*lost,.08*lost]});
  // the ball: flies, is pushed down into band 3, lands with a bounce, squashes under the band, un-squashes in the gap
  const b=ch1Ball(t);if(t>=.3)leafBall(s,b.x,b.y,150,b.rot,{sx:b.sx,sy:b.sy,cov:.92});
  if(t>=.3&&t<1.05)speedLines(s,K,b.x,b.y,Math.atan2(190,300),{n:4,seed:43,len:90,width:5});
  if(t>=1.05)dust(s,Y,180,150,60+140*clamp(t-1.05),8,{seed:44,size:8,cov:.8*(1-clamp((t-1.05)/1.2))});
  // branch B (teammate): open cup that folds shut when the pass is lost, then a twig grows under the band and opens a new cup
  const Bs=spine([560,-200],[250,-60],-.02+g3*.03,51);branch(s,Bs,42,12,51,{ink:B,leafInk:B,leafU:[.45,.75],leafLen:140});
  const open=key(t,[[0,1],[1.05,1],[1.35,0,easeOut],[4.34,0],[4.5,.1]]);leaves(s,B,cupLeaves(250,-60,-.6,open,135,53));
  const grow=t<4.5?0:easeOutBack(sm(4.5,5.2,t,easeIO));
  if(grow>0){const twig:Pt[]=[[270,-30],[250,60],[190,140],[120,190]];const q=partial(smoothPts(twig,false,8),Math.min(1,grow));if(q.length>1){s.tone(P,taper(q,20,9,55,1,5),.5);s.fill(B,taper(q,20,8,55));}
   const cupOpen=sm(5.2,5.5,t,easeOut);if(cupOpen>0)leaves(s,B,cupLeaves(120,190,2.2,cupOpen,100,57));}
 },
 aperture(){return apertureDisc(40,-170,80,12);},still:5.6,
};

// ---------------- chapter 2: bend and return ----------------
const B2:Band[]=[{y:-380,h:150,cov:.35,speed:20,seed:5},{y:-190,h:170,cov:.5,speed:35,seed:6},{y:0,h:200,cov:.7,speed:50,seed:7},{y:190,h:170,cov:.5,speed:65,seed:8},{y:380,h:150,cov:.35,speed:80,seed:9},{y:-570,h:160,cov:.35,speed:15,seed:10},{y:-780,h:200,cov:.4,speed:12,seed:11}];
function ch2Bend(t:number){
 let b=settle(t,-.4,{amp:.05,freq:1.1,decay:.7})+sway(t,.8);
 if(t<3.04)return b;
 if(t<3.16)return b+lerp(0,-.06,easeIn((t-3.04)/.12));
 if(t<3.55)return lerp(-.06,.6,easeIO((t-3.16)/.39));
 b=settle(t,3.55,{amp:.6,freq:1.1,decay:1.5,phase:Math.PI/2})+sway(t,.8);
 if(t<7.78)return b;
 if(t<7.95)return b+lerp(0,-.04,easeIn((t-7.78)/.17));
 if(t<8.3)return b+lerp(-.04,.3,easeIO((t-7.95)/.35));
 return b+settle(t,8.3,{amp:.3,freq:1.1,decay:1.6,phase:Math.PI/2});
}
const ch2Tip=(t:number)=>at(spine([-520,420],[380,-300],ch2Bend(t),61),1);
const ch2:Scene={
 draw(s,t){
  const tt=twos(t);
  const g1=gust(t,3.04,3.4,3.9),g2=gust(t,7.78,8.1,8.5),g=g1+g2*.6,gi=gustInt(t,3.04,3.5,3.9)+gustInt(t,7.78,8.1,8.5)*.6;
  const kick=settle(t,8.15,{amp:6,freq:9,decay:6});
  cam(s,t,[[0,0,40,.9],[3.04,-10,40,.9],[3.7,-60,60,1.2,-.07],[3.9,-60,60,1.2,-.07],[4.6,-60,60,1.2,.02],[5.5,-60,60,1.2,0],[7.78,-60,60,1.2,0],[8.6,230,80,1.2,0],[9.2,230,80,1.2,0],[9.97,300,-230,1.42,0]],[kick,kick*.5]);
  s.field(Y,.1,.3);s.tone(Y,polyPath(blob(-500,-500,900,600,4,{amp:.1}),true),.2);
  ground(s,400,12);
  windBands(s,t,B2,()=>g,()=>gi,{},P,{x:-40,y:60,r:520,k:130*(1+g)});
  fragments(s,t,B2,18,22,()=>gi,()=>g,t>8.15?{x:440,y:180,age:t-8.15,r:300}:undefined);
  // the rigid post: loads, cracks at 8.15, tilts 8° and stays
  const tilt=t<8.15?0:.14*spring(t-8.15,4,.4)+settle(t,8.15,{amp:.01,freq:14,decay:8});
  s.save();s.translate(440,450);s.rotate(tilt);
  const load=sm(7.95,8.15,t)*(1-sm(8.15,8.4,t));s.tone(P,polyPath(blob(0,-60,90+30*sm(8.15,9,t),160,13,{amp:.1}),true),.4+.3*sm(8.15,9,t));
  s.fill(K,taper([[0,0],[2,-300],[0,-570]],36+10*load,30+8*load,63));
  if(t>=8.15){const zig:Pt[]=[[-26,-274],[-4,-262],[-16,-250],[8,-242],[-8,-232],[26,-224]];s.knockout(ribbon(zig,10,{seed:64,wobble:.5,taper:.2}),.95);}
  s.restore();
  // branch A whole: bends about its root, returns with two overshoots; leaf at u .6 tears off at 3.5
  const bend=ch2Bend(t);const A=spine([-520,420],[380,-300],bend,61);
  const torn=t>=3.5;const tipLeaf=t>=9.2?lerp(1,1.6,sm(9.2,9.6,t,easeOut)):1;
  branch(s,A,54,10,61,{leafU:[.35,.48,.6,.7,.8,.9,1],leafLen:175,wind:clamp(g*1.2),flutter:g1+g2,skip:torn?[2,6]:[6],shadow:Math.abs(bend)});
  // the tip leaf, drawn on top so it can turn to the camera for the seam
  const tip=at(A,1);const turn=sm(9.2,9.6,t,easeOut);const ta=lerp(tip.a-.8+.3*Math.sin(tt*3)*(g1+g2),-.45,turn)+(turn>0?settle(t,9.6,{amp:.1,freq:4,decay:5}):0);
  leaves(s,Y,[{x:tip.p[0],y:tip.p[1],a:ta,len:170*tipLeaf,wid:54*tipLeaf,seed:77}],.92+.06*turn);
  if(torn){const u=clamp((t-3.5)/3);const p=arc([at(A,.6).p[0],at(A,.6).p[1]],[330,410],u,-60);const yy=u>=1?410+settle(t,6.5,{amp:8,freq:5,decay:6}):p[1]+40*Math.sin(u*TAU*2);leaves(s,Y,[{x:p[0],y:yy,a:u*TAU*2+.5,len:130,wid:40,seed:79}]);}
 },
 aperture(t){const tip=ch2Tip(t);return apertureDisc(tip.p[0]+Math.cos(-.45)*80,tip.p[1]+Math.sin(-.45)*80,62,12);},still:3.6,
};

// ---------------- chapter 3: inside a leaf (yellow + purple duotone) ----------------
const RIB:Pt[]=[[-470,200],[-250,110],[0,0],[250,-100],[470,-200]];
const ch3:Scene={
 draw(s,t){
  const tt=twos(t),ti=twosIndex(t);
  const inhale=sm(6.42,8,t,easeOut),exhale=sm(8,9.77,t,easeOut);
  const kick=(t>=0&&t<.3?4:0)+(t>=1.1&&t<1.4?4:0)+(t>=2.2&&t<2.5?4:0);
  const rot=key(t,[[0,0],[2.6,-.035],[5.02,-.035],[5.7,0],[6.42,0],[8,.05],[9.4,-.035]]);
  const v=key(t,[[0,0,0,1],[2.6,-40,30,1.05],[5.02,-40,30,1.05],[5.7,0,10,1.25],[6.42,10,8,1.26],[8,260,-120,1.28],[9.77,330,-145,1.36]],easeIO,true);
  s.camera(v[0]+kick*.5+6*Math.sin(t*.7)*sm(2.6,5,t)*(1-sm(5,5.3,t))+3*Math.sin(t*1.9),v[1]+kick+2*Math.sin(t*1.3),v[2]*(1+.16*inhale-.05*exhale),rot+.01*Math.sin(t*1.1));
  // the world seen through the leaf: faint wind stripes over paper, then the leaf as a huge mottled yellow field
  const stripeCov=key(t,[[0,.12],[6.42,.12],[8,.08]]),sp=1+sm(2.6,3,t)*(1-sm(6.42,8,t)*.5);
  for(let i=0;i<3;i++)s.tone(P,bandPath(-330+i*300,-330+i*300+150,25*sp*t,31+i,20,{step:90}),stripeCov);
  const leafScale=1+.06*inhale-.02*exhale;s.save();s.translate(-470,200);s.scale(leafScale);s.translate(470,-200);
  const leaf=polyPath(leafPts(-560,240,Math.atan2(-440,1040),1180,330,33),true);
  s.save();s.clip(leaf);s.field(Y,1,.6);s.restore();
  // midrib and veins in paper; the two veins nearest the bruise grow a ring around it on "Name that feeling"
  const rib=new Path2D();rib.addPath(ribbon(RIB,22,{seed:35,taper:.6,wobble:2,pressure:.4}));
  const shove=(i:number)=>{const k=t>=.15&&i===2?6*sm(.15,.4,t):t>=1.25&&i===5?6*sm(1.25,1.5,t):0;return k*(1-sm(5.7,6.2,t));};
  for(let i=0;i<11;i++){const u=.08+i*.085,{p,a}=at(RIB,u),side=i%2?1:-1,len=150+40*hash(i,3),ang=a+side*.95,sh=shove(i);const e:Pt=[p[0]+Math.cos(ang)*len,p[1]+Math.sin(ang)*len+sh*side];rib.addPath(ribbon([p,e],8,{seed:36+i,taper:.7,wobble:1.5,pressure:.3}));}
  s.knockout(rib,.9);
  // the bruise: a purple blot that boils until it is named, pulses between spikes, opens to halftone on the exhale
  const named=sm(5.2,5.7,t),boil=t<5.7?ti%3:0,pulse=t<5.02?7*Math.sin(tt*TAU/1.2):0;
  const r0=150+pulse-11*(sm(0,.15,t)*(1-sm(.15,.4,t))+sm(1.1,1.25,t)*(1-sm(1.25,1.5,t))+sm(2.2,2.35,t)*(1-sm(2.35,2.6,t)));
  const cov=key(t,[[0,.8],[2.6,.8],[3.4,.95],[6.42,.95],[8,.6],[9.6,.45]]),shrink=1-.22*inhale;
  s.tone(P,polyPath(blob(-110,40,r0*1.1*shrink,r0*.8*shrink,3+boil,{amp:.22,n:22,rot:-.4}),true),cov);
  // three named feelings: three spikes shoot out, overshoot, then round into lobes once the ring closes
  const spikes:[number,number,number][]=[[0,-2.3,230],[1.1,.7,180],[2.2,-.42,280]];
  spikes.forEach(([t0,a,len],i)=>{const g=t<t0?0:easeOut(clamp((t-t0-.15)/.25))*(1+.12*settle(t,t0+.4,{amp:1,freq:3,decay:5}));if(g<=0)return;const round=named;const L=len*g*(1-.35*round);const shake=i===2&&t<5.7?4*Math.sin(tt*30):0;
   const tipP:Pt=[-110+Math.cos(a)*L,40+Math.sin(a)*L+shake];const w=lerp(60,96,round);s.tone(P,ribbon([[-110,40],tipP],w,{seed:40+i,taper:lerp(.9,.3,round),wobble:lerp(3,1,round),pressure:.4}),cov);});
  // the vein ring: two contours travel to meet, overshoot, snap closed
  const ringP=t<5.02?0:sm(5.2,5.7,t,easeIO),bow=sm(5.02,5.2,t)*10;
  if(ringP>0||bow>0){const L=blob(-110,40,260+bow,185+bow,44,{amp:.16,n:18,rot:-.3}),half=Math.round(L.length/2),left=L.slice(half).concat([L[0]]),right=L.slice(0,half+1);
   const over=ringP>=1?1+.06*settle(t,5.7,{amp:1,freq:4,decay:6}):ringP*1.02;const w=key(t,[[5.2,14],[6.42,14],[8,10]]);
   const a1=partial(smoothPts(left,false,6),Math.min(1,over)),a2=partial(smoothPts(right,false,6),Math.min(1,over));if(a1.length>1)s.fill(P,ribbon(a1,w,{seed:45,taper:.5,wobble:1.2}),.9);if(a2.length>1)s.fill(P,ribbon(a2,w,{seed:46,taper:.5,wobble:1.2}),.9);}
  // the player inside the leaf: names the feeling (points at the blot at 5.02), then takes the slow breath (chest expands on the inhale, eases on the exhale)
  const name=sm(5.02,5.4,t,easeOut),stL=poseLimbs('stand'),pL=poseLimbs('point');
  const chest=1+.18*inhale-.1*exhale*inhale;
  figure(s,250,-30,300,K,151,'stand',{facing:-1,arms:mixLimbs(stL.arms,pL.arms,name*(1-sm(6.42,7.2,t))),scaleX:chest,tilt:.03*Math.sin(t*2.2)-.05*inhale+.03*exhale});
  // the breath: a paper lens of air travels the midrib on the inhale, a smaller one returns on the exhale
  if(t>=6.42)airLens(s,RIB,.05+.8*sm(6.42,8,t,easeIO),140,60,47);
  if(t>=8)airLens(s,RIB,.85-.75*sm(8,9.7,t,easeIO),90,40,48);
  s.restore();
 },
 aperture(t){const {p,a}=at(RIB,.85);const sc=1+.06*sm(6.42,8,t,easeOut)-.02*sm(8,9.77,t,easeOut);const x=-470+(p[0]+470)*sc,y=200+(p[1]-200)*sc;return apertureDisc(x,y,58,12,a);},still:5.7,
};

// ---------------- chapter 4: the twig at the fork ----------------
const B4:Band[]=[{y:-325,h:250,cov:.6,speed:55,seed:14},{y:310,h:280,cov:.55,speed:80,seed:15},{y:-620,h:160,cov:.35,speed:30,seed:16},{y:620,h:180,cov:.35,speed:40,seed:17}];
function ch4Ball(t:number){const u=sm(6.55,7.3,t,easeIO),p=arc([250,-120],[60,-20],u,30);const c=t>7.3?settle(t,7.3,{amp:.08,freq:4,decay:5,phase:Math.PI/2}):0;return{x:p[0],y:p[1],rot:u*6+key(t,[[8.2,0],[8.35,-.15],[8.7,1.1,easeOut]]),sx:1+c,sy:1-c};}
const ch4:Scene={
 draw(s,t){
  const tt=twos(t);
  cam(s,t,[[0,-60,-60,1],[.15,-60,-60,1],[.7,-150,-180,1.05,-.14],[1.3,-150,-180,1.05,-.14],[1.9,-60,-60,1.05,0],[2.75,-60,-60,1.05,0],[3.6,100,-40,1.1,0],[6.7,100,-40,1.1,0],[7.4,60,-20,1.2,0],[8.2,60,-20,1.2,0],[9.07,60,-20,1.62,0]]);
  s.field(Y,.15,.4);
  // the blob: hidden inside the upper band, uncovered by the look, shoves, creeps down, stops dead on the pass
  const win=sm(.15,.65,t,easeOut),shove=sm(.7,1,t,easeOut)*20,creep=sm(1.3,6.55,t,easeIn)*100;
  const bx=-150+shove*.7,by=-300+shove*.6+creep;
  const press=sm(1.3,2.8,t)*15,vac=sm(3,3.6,t,easeOut);
  windBands(s,t,B4,()=>0,()=>0,{0:{bottom:x=>shove*.8*bell(x-bx,160)},1:{top:x=>-press*bell(x+80,220)-vac*40*bell(x+60,200)*(1-.3*Math.abs(Math.sin(x/40)))}},P,{x:-80,y:60,r:360,k:60});
  fragments(s,t,B4,10,24,()=>0,()=>0,t>3.4?{x:-80,y:200,age:t-3.4,r:260}:undefined);
  if(win>0)s.knockout(polyPath(blob(-150,-300,200*win,150*win,16,{amp:.08}),true),.5);
  s.fill(P,polyPath(blob(bx,by,120,105,17+(t>=.15&&t<6.55?twosIndex(t)%2:0),{amp:.12,n:30}),true),.95);
  // twig A: enters from the left, forks at the shoulder, tip sags under the lower band, then grows into the calm gap
  const sag=sm(1.3,2.8,t)*12+sm(2.62,2.8,t)*10+4*Math.sin(t*2.3),grow=t<2.8?0:easeOutBack(sm(2.8,3.5,t,easeIO)),dip=t>7.3?20*settle(t,7.3,{amp:1,freq:3,decay:3}):0;
  const R4=110;const base:Pt[]=[[-540,260],[-400,235],[-240,200]];const oldTip:Pt[]=[[-240,200],[-160,215],[-80,230+sag]];
  const newCurve:Pt[]=[[-240,200],[-140,120],[-20,30],[60,-20+dip]];
  s.tone(P,taper(base.concat(oldTip.slice(1)),30,12,71,1,6),.5);s.fill(K,taper(base.concat(oldTip.slice(1)),26,11,71));
  s.fill(K,taper([[-240,200],[-290,120],[-330,90]],14,6,72));
  leaves(s,Y,[{x:-330,y:90,a:-2.4,len:90,wid:28,seed:73}]);
  const look=key(t,[[0,0],[.15,.1],[.55,-2.7,easeOut],[.75,-2.9],[1.3,-2.6],[1.6,0]]);
  leaves(s,Y,[{x:-80,y:230+sag,a:.3+look,len:100,wid:32,seed:74}]);
  if(grow>0){const q=partial(smoothPts(newCurve,false,8),Math.min(1,grow));if(q.length>1){s.tone(P,taper(q,24,10,75,1,5),.5);s.fill(K,taper(q,22,9,75));}
   if(grow<1&&grow>.3)speedLines(s,K,q[q.length-1][0],q[q.length-1][1],Math.atan2(-50,80),{n:4,seed:76,len:80,width:4});}
  // the offer: the tip unfolds into a cup facing the ball, a dashed navy line self-draws ball → cup
  const open=t<3.6?0:easeOutBack(sm(3.6,4.1,t))*(1+.1*Math.sin(tt*6)*sm(5.4,5.6,t)*(1-sm(5.6,5.9,t)));
  if(open>0)leaves(s,Y,cupLeaves(60,-20+dip,-1.1,open,110,77));
  const lineP=sm(3.7,4.3,t,easeOut),passU=sm(6.55,7.3,t,easeIO);
  if(lineP>0&&passU<1){const a:Pt=[lerp(230,60,passU)-20*passU,lerp(-110,-20,passU)];laneArrow(s,K,a,[75,-32],20,{dashed:true,seed:78,progress:lineP,head:40});}
  // branch B (teammate) holds the leaf-ball, loads back and passes on "one action"; the cup cushions
  const load=sm(6.36,6.55,t)*(1-sm(6.55,6.8,t)),turn=sm(3.6,3.9,t,easeOut)*.25-sm(3.5,3.6,t)*.05;
  const Bs=spine([560,-460],[320,-150],-load*.12+turn,81);branch(s,Bs,40,12,81,{ink:B,leafInk:B,leafU:[.4,.7],leafLen:130});
  leaves(s,B,cupLeaves(320,-150,2.6,.9,120,83));
  // the player: checks the shoulder (head turns back with an anticipation nod), runs into open paper on "Move into space" (stride, smear), receives
  const lk=key(t,[[0,0],[.15,-.15],[.55,1,easeOut],[1.3,1],[1.6,0]]),runU=sm(2.62,3.5,t,easeIO),st=stride(twosIndex(t));
  const px=lerp(-330,200,runU),py=lerp(330,100,runU),moving=runU>0&&runU<1;
  const cushion=t>=7.3&&t<7.5?.06:0;
  figure(s,px,py,300,K,161,moving?'run':lk>.5?'lookBack':'stand',{facing:moving?1:-1,legs:moving?st.legs:undefined,arms:moving?st.arms:undefined,head:!moving&&lk>0?[-.1*lk,-.82]:undefined,tilt:moving?.1:-.04*lk+cushion,scaleX:1+cushion});
  if(moving&&runU<.7)speedLines(s,K,px-40,py-140,Math.atan2(-250,440),{n:4,seed:162,len:110,width:5});
  const b=ch4Ball(t);leafBall(s,b.x,b.y,R4,b.rot,{sx:b.sx,sy:b.sy,lens:sm(8.35,8.8,t,easeOut)});
  spark(s,60,-20,t-7.3,84,120);
  if(passU>0&&passU<1)speedLines(s,K,b.x,b.y,Math.atan2(100,-190),{n:4,seed:85,len:70,width:4});
 },
 aperture(t){const b=ch4Ball(t);return aperture(ballLens(b.x,b.y,110,b.rot,Math.max(.4,sm(8.35,8.8,t,easeOut))));},still:7.4,
};

// ---------------- chapter 5: pinned in a slot; the knot ----------------
function ch5Edges(t:number){
 const topBase=key(t,[[0,-100],[.15,-110,easeIn],[.65,-40,easeOut],[1.9,-40],[2.7,-170,easeOut],[3,-158],[3.3,-164]]);
 const lift=t>2.7?settle(t,2.7,{amp:12,freq:3,decay:4}):0;
 const bot=key(t,[[0,180],[.15,190,easeIn],[.65,120,easeOut]]);
 return{top:(x:number)=>topBase-lift-(t>1.9?sm(1.9,2.7,t,easeOut)*60*bell(x-300,320):0),bot};
}
const ch5:Scene={
 draw(s,t){
  const tt=twos(t);
  const kick=settle(t,2.3,{amp:5,freq:8,decay:6})+settle(t,7.2,{amp:4,freq:10,decay:7});
  cam(s,t,[[0,-100,40,1.25],[.6,-100,40,1.4],[1.4,-100,40,1.4],[2.3,40,40,1.4],[4.5,40,40,1.4],[6.5,80,10,1.42,.035],[7.4,130,20,1.5,0],[8.1,130,20,1.5,0],[8.77,180,30,2.05,0]],[0,kick]);
  s.field(Y,.15,.4);
  const e=ch5Edges(t),cov=key(t,[[0,.8],[.65,.95],[1.9,.95],[2.7,.55]]);
  s.tone(P,bandPath(-1400,0,40*t,18,26,{bottom:x=>e.top(x)}),cov);
  s.tone(P,bandPath(0,1400,60*t,19,26,{top:x=>e.bot}),cov);
  // stepped pressure inside the masses: darker navy strata the further from the slot (the reference's nested tonal bands)
  for(let k=0;k<3;k++){const d=140+k*170;s.tone(K,bandPath(-1400,-d,40*t+k*90,40+k,22,{bottom:x=>e.top(x)-d+40*k}),.1+.08*k);s.tone(K,bandPath(d+e.bot-40*k,1400,60*t+k*70,50+k,22,{top:()=>0}),.1+.08*k);}
  // fragments jammed in the slot: squeezed toward the tip, spilled out when the band lifts, gathered on the knot
  {const rr=rng(25),p=new Path2D(),sq=sm(.15,.65,t),spill=sm(2.3,3,t,easeOut),gather=sm(6.7,7.6,t,easeIO);
   for(let i=0;i<12;i++){let x=-520+rr()*820,y=40+(rr()-.5)*120;const sz=14+rr()*12,ph=rr()*TAU;x+=sq*(300-x)*.35;y=lerp(y,y*.3+40,sq*(1-spill));y+=spill*(rr()-.5)*160;x=lerp(x,180+(rr()-.5)*70,gather);y=lerp(y,30+(rr()-.5)*60,gather);
    const q=rotPts([[-sz,-sz*.5],[sz*.9,-sz*.6],[sz,sz*.4],[-sz*.8,sz*.5]],ph+tt*.5*(1-gather));p.moveTo(x+q[0][0],y+q[0][1]);for(let k=1;k<4;k++)p.lineTo(x+q[k][0],y+q[k][1]);p.closePath();}
   s.fill(Y,p,.9);}
  // twig A through the slot: flattens under the press, springs round, ties a knot, straightens and grows past it
  const flat=sm(.15,.65,t)*(1-sm(2.9,3.3,t))-.5*settle(t,3.3,{amp:1,freq:4,decay:5});
  const wig=3*Math.sin(t*2.1);
  const spineA:Pt[]=[[-540,40+wig],[-300,44],[-120,42-wig],[60,36],[340,30+wig]];
  s.save();s.translate(0,40);s.scale(1,1-.06*flat);s.translate(0,-40);
  s.tone(P,taper(spineA,34,15,91,1,6),.5);s.fill(K,taper(spineA,30,14,91));
  branch(s,spineA,0,0,91,{leafU:[.25,.55,.8],leafLen:130,wind:-.2*(1-flat),flutter:sm(2.9,3.3,t)*(1-sm(3.5,4,t))});
  s.restore();
  // the stuck player: bent forward in the slot, head down; on "ask a teammate" the blue teammate arrives and its hand lands on the shoulder;
  // on "where to put your attention" (NEXT) the player straightens in one ease-out-back and turns its head toward the ball
  const arrive=sm(1.22,1.9,t,easeOut),hand=sm(1.9,2.3,t,easeOut),up=t<6.5?0:easeOutBack(sm(6.5,7.0,t)),nod=t>=1.22&&t<1.9?.06*Math.sin(sm(1.22,1.9,t)*Math.PI*3):0;
  const sL=poseLimbs('slump'),stL=poseLimbs('stand'),lL=poseLimbs('lean');
  figure(s,190,140,270,K,131,'slump',{facing:1,tilt:.28*(1-up)+nod,headDrop:[.02*(1-up),.1*(1-up)],arms:mixLimbs(sL.arms,stL.arms,up),head:[-.14*Math.min(1,up),-.82]});
  if(arrive>0)figure(s,lerp(760,410,arrive),140,260,B,132,'stand',{facing:-1,arms:mixLimbs(stL.arms,lL.arms,hand),tilt:.16*hand});
  if(t>=7.0&&t<7.6)sparkBurst(s,Y,190,-90,90,{n:7,seed:133,g:easeOutBack(sm(7.0,7.3,t)),width:8});
  // the leaf-ball: squashed by the press, rolls free when the slot opens
  const sq=sm(.15,.65,t)*(1-sm(2.9,3.2,t)),roll=sm(2.9,3.5,t,easeIO),bx=lerp(-120,-60,roll)+3*settle(t,3.5,{amp:1,freq:5,decay:6});
  const [sx,sy]=squash(-sq*.08);leafBall(s,bx,40,120,roll*1.2,{sx,sy});
  // the ask: the tip leaf flicks three times and sends three rings along the slot to B
  if(t>=1.22){const p=sm(1.3,1.9,t,easeOut);ripple(s,K,300,-50,60,3,{width:11,seed:95,spacing:70,progress:p,cov:.9*(1-sm(2.1,2.6,t))});}
  // branch B: bends in from its root, wedges under the upper band and lifts it, withdraws a little, holds
  const bendIn=t<1.5?0:easeOutBack(sm(1.5,2.1,t,easeIO)),liftB=sm(1.9,2.7,t,easeOut),back=sm(4.5,5.3,t,easeIO)*40;
  const Bs=spine([560,-20],[380-bendIn*60+back,10-liftB*150-bendIn*30],-.15*bendIn,97,22,30);
  branch(s,Bs,42,13,97,{ink:B,leafInk:B,leafU:[.4,.7],leafLen:115,shadow:bendIn*.3});
  leaves(s,B,cupLeaves(Bs[Bs.length-1][0],Bs[Bs.length-1][1],-2.6,.6,90,98));
 },
 aperture(){return apertureDisc(190,-85,34,12);},still:7.4,
};

// ---------------- chapter 6: reset and return ----------------
const B6:Band[]=[{y:-380,h:150,cov:.3,speed:10,seed:26},{y:-190,h:170,cov:.4,speed:18,seed:27},{y:0,h:200,cov:.5,speed:25,seed:28},{y:190,h:170,cov:.4,speed:32,seed:29},{y:380,h:150,cov:.3,speed:40,seed:30}];
const ROOT6:Pt=[-520,420],TIP6:Pt=[330,-230];
function ch6Bend(t:number){let b=.05*Math.exp(-t*1.2)*Math.cos(t*4)*(1-sm(4.1,5.7,t))+sway(t,.6);const g=gust(t,3.34,3.6,3.9);b+=g*.2;if(t>3.6)b+=settle(t,3.6,{amp:.2,freq:1.2,decay:1.8,phase:Math.PI/2})*(1-sm(4.1,5.7,t))*.7;if(t>9.6)b+=settle(t,9.6,{amp:.03,freq:1.5,decay:3});return b;}
/** where the ball is: at A's tip cup, in flight, or in B's cup — three passes. */
function ch6Ball(t:number,tipA:Pt,tipB:Pt):{p:Pt;rot:number;c:number}{
 const legs:[number,number,Pt,Pt][]=[[7.6,8.1,tipA,tipB],[8.3,8.8,tipB,tipA],[9,9.5,tipA,tipB]];
 let p:Pt=tipA,rot=0,c=0;
 for(const [t0,t1,a,b] of legs){if(t<t0)break;const u=sm(t0,t1,t,easeIO);p=arc(a,b,u,45);rot+=u*4;if(u>=1)c=settle(t,t1,{amp:.08,freq:4,decay:5,phase:Math.PI/2});}
 return{p,rot,c};
}
const ch6:Scene={
 draw(s,t){
  const tt=twos(t);
  const rot=key(t,[[3.9,0],[4.1,-.035],[4.9,.035],[5.7,0]]);
  const v=key(t,[[0,-160,80,1.1],[3.34,-150,80,1.1],[3.9,-60,20,1.2],[4.9,-60,20,1.2],[5.6,20,30,1.2],[7.7,20,30,1.2],[9.6,150,60,1.22],[10.4,152,60,1.22]],easeIO,true);
  s.camera(v[0],v[1],v[2],rot);
  const g=gust(t,3.34,3.6,3.9),calm=sm(4.1,5.7,t);
  s.field(Y,.1,.3);s.tone(Y,polyPath(blob(400,500,900,700,6,{amp:.1}),true),.2);
  ground(s,330,32,.4);chalkStroke(s,[[-1400,380],[-400,384],[600,378],[1500,382]],16,{seed:33,dust:.2,step:60});
  windBands(s,t,B6.map(b=>({...b,cov:Math.max(.15,b.cov-.1*calm),speed:b.speed*(1-.4*calm)})),()=>g,()=>gustInt(t,3.34,3.6,3.9),{},P,{x:-60,y:60,r:460,k:70*(1-.5*calm)});
  fragments(s,t,B6,6,34,()=>0,()=>g);
  // branch A with the knot, the bruise, and three new leaves that unfurl with each pass
  const bend=ch6Bend(t),A=spine(ROOT6,TIP6,bend,101);
  const newLeaf=(t0:number)=>t<t0?0:easeOutBack(sm(t0,t0+.35,t));
  branch(s,A,54,10,101,{leafU:[.3,.42,.62,.85,.5,.75,.95],leafLen:160,wind:g,flutter:g+sm(6.6,6.7,t)*(1-sm(6.9,7.1,t)),shadow:Math.abs(bend)*.6,leafScale:[1,1,1,1,newLeaf(8.1),newLeaf(8.8),newLeaf(9.5)]});
  const br=at(A,.7);const pulse=t<.6?6*Math.sin(clamp(t/.6)*Math.PI):0,brCov=key(t,[[0,.6],[5.8,.6],[6.6,.4]]);
  s.tone(P,polyPath(blob(br.p[0]+30,br.p[1]-40,72+pulse,60+pulse,3+(t<5.8?twosIndex(t)%3:0),{amp:.18,n:22}),true),brCov);
  s.fill(P,ribbon(blob(br.p[0]+30,br.p[1]-40,110,92,44,{amp:.14,n:18}),8+4*sm(3.34,3.9,t),{seed:45,close:true,wobble:1,taper:0}),.8);
  // breathe: a paper lens travels the wood root → tip as the bands retreat
  if(t>=4.1&&t<5.8)airLens(s,A,sm(4.1,5.7,t,easeIO),90,40,47);
  // the tip leaf turns to look at the bruise on "Notice"
  const tip=at(A,1),tipB:Pt=[420,-110];
  const look=key(t,[[3.34,0],[3.5,.1],[3.9,-2.2,easeOut],[4.9,-2.2],[5.2,0]]),cupTurn=sm(4.9,5.2,t,easeOut)*.25-sm(4.8,4.9,t)*.05;
  leaves(s,Y,[{x:tip.p[0],y:tip.p[1],a:tip.a-.9+look,len:130,wid:40,seed:103}]);
  // branch B reaches in from the right; on the ground the player (upright now) and the blue teammate: the dashed choice line, then three cushioned passes
  const Bs=spine([600,-300],[tipB[0],tipB[1]],-.02,105,22,30);branch(s,Bs,40,12,105,{ink:B,leafInk:B,leafU:[.45,.75],leafLen:130});
  void cupTurn;
  const PA:Pt=[-30,300],PB:Pt=[400,290];
  const ball=ch6Ball(t,PA,PB);
  const loadA=sm(7.45,7.6,t)*(1-sm(7.6,7.8,t))+sm(8.85,9,t)*(1-sm(9,9.2,t)),loadB=sm(8.15,8.3,t)*(1-sm(8.3,8.5,t));
  const kickA=(t>=7.55&&t<7.75)||(t>=8.95&&t<9.15),kickB=t>=8.25&&t<8.45;
  const cushA=t>=8.8&&t<8.95?.06:0,cushB=(t>=8.1&&t<8.25)||(t>=9.5&&t<9.65)?.06:0;
  const rolled=sm(.3,.9,t,easeIO);
  figure(s,-110,330,320,K,171,kickA?'kick':'stand',{facing:1,tilt:-.1*loadA+cushA+.02*Math.sin(t*2.1),scaleX:1+cushA,head:t>=3.34&&t<5.2?[-.1*sm(3.34,3.9,t)*(1-sm(4.9,5.2,t)),-.82]:undefined});
  figure(s,480,320,300,B,172,kickB?'kick':'stand',{facing:-1,tilt:-.1*loadB+cushB,scaleX:1+cushB});
  const lineP=sm(4.9,5.5,t,easeOut);if(lineP>0&&t<7.6)laneArrow(s,K,[PA[0]+60,PA[1]-40],[PB[0]-60,PB[1]-30],18,{dashed:true,seed:111,progress:lineP,head:36});
  if(t<7.6)leafBall(s,PA[0]+rolled*30,PA[1]-rolled*6,100,rolled*1.5+settle(t,.9,{amp:.2,freq:4,decay:4}),{});
  else leafBall(s,ball.p[0],ball.p[1],100,ball.rot,{sx:1+ball.c,sy:1-ball.c});
  spark(s,PB[0],PB[1]-40,t-8.1,113,100);spark(s,PA[0],PA[1]-40,t-8.8,114,100);spark(s,PB[0],PB[1]-40,t-9.5,115,110);
 },
 still:9.6,
};

export const story:RisoStory={
 id:'reset',format:'11v11',title:'Mental Toughness',theme:'Finding your next useful action',ageNote:'A direct mental-skills explainer; playing format does not define age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',blue:'#0078bf',purple:'#765ba7',navy:'#22366b'},order:['yellow','blue','purple','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:[
  {label:'WHAT IS TOUGHNESS?',narration:'What does mental toughness mean when a pass goes wrong? It means finding a useful response while making room for your feelings.',seconds:9.417,audio:CH+'01.m4a',cues:[{at:0,words:'What does mental'},{at:4.34,words:'a useful response'},{at:6.48,words:'room for your feelings'}]},
  {label:'BEND AND RETURN',headline:'Bend',narration:'Imagine a flexible branch in the wind. It bends under pressure, then finds balance. Staying rigid is not the only kind of strength.',seconds:10.617,audio:CH+'02.m4a',cues:[{at:0,words:'Imagine a flexible branch'},{at:3.04,words:'bends under pressure'},{at:7.78,words:'only kind of strength'}]},
  {label:'NOTICE THE MOMENT',headline:'Breathe',narration:'You might feel frustrated, embarrassed, or worried about another mistake. Name that feeling. Take a slow breath before choosing an action.',seconds:10.417,audio:CH+'03.m4a',cues:[{at:0,words:'You might feel'},{at:5.02,words:'Name that feeling'},{at:6.42,words:'Take a slow breath'}]},
  {label:'ONE USEFUL ACTION',narration:'What can you do now? Check your shoulder. Move into space. Offer a simple passing option. Choose one action you can try.',seconds:9.717,audio:CH+'04.m4a',cues:[{at:0,words:'What can you do'},{at:2.62,words:'Move into space'},{at:6.36,words:'one action'}]},
  {label:'SUPPORT IS STRENGTH',headline:{text:'Next',at:6.5},narration:'If you feel stuck, ask a teammate or coach for help. A reset word, like Next, can remind you where to put your attention.',seconds:9.417,audio:CH+'05.m4a',cues:[{at:0,words:'If you feel stuck'},{at:1.22,words:'ask a teammate'},{at:6.5,words:'where to put your attention'}]},
  {label:'RESET AND RETURN',narration:'You can feel disappointed and still contribute. Notice. Breathe. Choose. Practise returning to the game, one moment at a time.',seconds:10.415,audio:CH+'06.m4a',cues:[{at:0,words:'You can feel disappointed'},{at:3.34,words:'Notice. Breathe. Choose'},{at:7.6,words:'one moment at a time'}]},
 ],
 draw(f){playChapters(story,f,[ch1,ch2,ch3,ch4,ch5,ch6]);},
 /** a tap shakes a leaf loose: it spirals down and right with the wind, a small purple gust puff marks the tap. */
 touch(s,x,y,age,seed){
  const u=easeOut(clamp(age/.8));const lx=x+130*u,ly=y+170*u+18*Math.sin(u*TAU*2),a=u*TAU*2+.4;
  dust(s,null,x,y,50+160*u,12,{seed:seed+3,size:16,cov:.9*(1-clamp(age/.7))});
  const fade=.95*(1-clamp((age-.6)/.2));
  s.fill(K,ribbon([[lx,ly],[lx-Math.cos(a)*70,ly-Math.sin(a)*70]],9,{seed:seed+4,taper:.6,wobble:1}),fade);
  leaves(s,B,[{x:lx,y:ly,a,len:150,wid:50,seed}],fade);
  if(age>0&&age<.35){const p=new Path2D();for(let i=0;i<4;i++){const yy=y-24+i*16;p.addPath(ribbon([[x-10+age*80,yy],[x+60+age*220,yy+3]],4,{seed:seed+i,taper:.8,wobble:.5}));}s.knockout(p,.9*(1-age/.35));}
 },
};
