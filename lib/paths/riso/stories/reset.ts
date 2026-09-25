/** Mental Toughness (reset) — riso rework (2026-09-21). ONE WORLD, side view: a young TREE beside a pitch and the player on the pitch;
 * the wind is a visible force (purple streaks on gust envelopes) that bends the tree AND leans the player.
 * Sky: cream paper with two soft purple halftone bands high up · pitch: yellow × blue = green band with paper lines below a torn horizon ·
 * tree: navy trunk with a hand-cut edge, a big yellow × blue crown of overlapping cut-paper leaves · player: abstract cut-paper pictogram
 * (bible §1c.4, `figure()` below) · ball: a paper football with navy pentagons · feeling: a purple knot on a paper knockout.
 * Inks: yellow → blue → purple → navy on cream. Roles: purple = wind/pressure/feeling, blue = teammate, navy = you / wood.
 * Wind blows screen-left → screen-right for the whole story. Drawn objects on twos, camera on ones, randomness seeded. */
import type {Sheet} from '../sheet';
import {type RisoStory,type Scene,playChapters} from '../story';
import {aperture,apertureDisc} from '../passage';
import {twos,twosIndex,sm,easeOut,easeIO,easeIn,easeOutBack,key,settle,clamp,lerp,rng,hash,noise1,blob,polyPath,ribbon,smoothPts,partial,rotPts,wob,arc,TAU,type Pt,type Key} from '../motion';
import {laneArrow,speedLines,dust,handCut,footballPanels} from '../shapes';

const CH='/stories/narration/11v11/reset/';
const K='navy',P='purple',B='blue',Y='yellow';

// ---------------- motion helpers ----------------
/** gust envelope 0..1: rises (easeIn) onset→peak, relaxes (slow tail) peak→recovery. */
const gust=(t:number,on:number,peak:number,rec:number)=>t<=on||t>=rec?0:t<peak?easeIn((t-on)/(peak-on)):Math.pow(1-(t-peak)/(rec-peak),3);
/** integral of the gust envelope (drives the extra drift a gust adds to the streaks). */
function gustInt(t:number,on:number,peak:number,rec:number){if(t<=on)return 0;const a=peak-on,b=rec-peak;if(t<peak){const u=(t-on)/a;return a*u*u*u*u/4;}if(t<rec){const u=(t-peak)/b;return a/4+b*(1-Math.pow(1-u,4))/4;}return a/4+b/4;}
/** camera through [t,x,y,zoom,rot] keys, each segment eased (a key may carry its own ease as its last element). */
function cam(s:Sheet,t:number,K:Key[],kick:Pt=[0,0],rot=0){const v=key(t,K,easeIO,true);s.camera(v[0]+kick[0],v[1]+kick[1],(v[2]??1)*view(s),(v[3]??0)+rot);return v;}
/** viewport fit: the desktop art region shows 793 × 625 world units at zoom 1; phones show up to 1080 × 1055, so they get a closer view (≤ ×1.32) and the same composition. */
const view=(s:Sheet)=>clamp((s.safe.w/s.fit)/800,1,1.32);
const wrap=(v:number,a:number,b:number)=>{const L=b-a;return a+(((v-a)%L)+L)%L;};
/** residual sway: the tree never stops dead (a slow two-tone oscillation added to every bend). */
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


/** person: navy prints straight onto the print; any other ink (the blue teammate) prints on a paper knockout so it stays clean over the green. */
function person(s:Sheet,x:number,y:number,size:number,ink:string,seed:number,pose:Pose,o:FigureOpts={}){
 if(ink===K)return figure(s,x,y,size,K,seed,pose,o);
 figure(s,x,y,size,K,seed,pose,{...o,mode:'paper',paperTone:0});return figure(s,x,y,size,ink,seed,pose,{...o,mode:'ink',cov:o.cov??.92});
}
/** ∫ sm(a,b,·) dv from a to t (easeIO), for gust integrals of envelopes written as c·(1 − sm). */
function smInt(a:number,b:number,t:number){if(t<=a)return 0;const d=b-a,u=clamp((t-a)/d),F=u<.5?u*u*u*u:u-.5+Math.pow(2-2*u,4)/16;return d*F+Math.max(0,t-b);}
const at=(pts:Pt[],u:number)=>{const i=Math.min(pts.length-2,Math.max(0,Math.floor(u*(pts.length-1)))),f=u*(pts.length-1)-i;return{p:[lerp(pts[i][0],pts[i+1][0],f),lerp(pts[i][1],pts[i+1][1],f)] as Pt,a:Math.atan2(pts[i+1][1]-pts[i][1],pts[i+1][0]-pts[i][0])};};
/** shortest-way angle blend. */
const turn=(a:number,target:number,k:number)=>a+Math.atan2(Math.sin(target-a),Math.cos(target-a))*clamp(k);

// ---------------- the world: cream sky, soft purple bands, the green pitch ----------------
/** A full-width strip with torn top and bottom edges whose noise slides with `off` (units). */
function bandPath(y0:number,y1:number,off:number,seed:number,amp:number,o:{x0?:number;x1?:number;step?:number}={}){
 const{x0=-1800,x1=1800,step=60}=o,p=new Path2D();
 const yt=(x:number)=>y0+amp*noise1((x-off)/170+seed,seed)+amp*.45*noise1((x-off)/52,seed+3);
 const yb=(x:number)=>y1+amp*noise1((x-off)/190+seed+50,seed+7)+amp*.45*noise1((x-off)/61,seed+9);
 p.moveTo(x0,yt(x0));for(let x=x0+step;x<=x1;x+=step)p.lineTo(x,yt(x));for(let x=x1;x>=x0;x-=step)p.lineTo(x,yb(x));p.closePath();return p;
}
const HZ=230;
/** sky (cream paper, faint yellow screen, two soft purple halftone bands high up) and the pitch (torn horizon, yellow × blue = green,
 * a navy mowing stripe, paper touchline + box line). */
function world(s:Sheet,t:number,seed:number,o:{bands?:number}={}){
 const{bands=1}=o,tt=twos(t);
 s.field(Y,.1,.3);
 s.tone(P,bandPath(-600,-520,20*tt,seed,26,{step:90}),.18*bands);
 s.tone(P,bandPath(-430,-380,14*tt,seed+1,20,{step:90}),.12*bands);
 const gnd=bandPath(HZ,HZ+2400,0,seed+2,12,{step:80});
 s.tone(Y,gnd,.75);s.tone(B,gnd,.45);
 s.tone(K,bandPath(HZ+120,HZ+190,0,seed+3,8,{step:110}),.1);
 s.tone(K,bandPath(HZ+300,HZ+2400,0,seed+4,10,{step:110}),.12);
 const lines=new Path2D();lines.addPath(ribbon([[-1600,HZ+44],[1600,HZ+48]],10,{seed:seed+5,pressure:.3,taper:0,wobble:1.6,step:80}));lines.addPath(ribbon([[-1600,HZ+168],[1600,HZ+172]],7,{seed:seed+6,pressure:.3,taper:0,wobble:1.6,step:80}));
 s.knockout(lines,.9);
}
/** the wind: purple streak ribbons drifting right; count, length and coverage grow with the gust value g, drift with its integral gi.
 * ink null = paper knockout streaks (grass flattened by a gust). */
function wind(s:Sheet,t:number,g:number,gi:number,seed:number,o:{cov?:number;n?:number;box?:[number,number,number,number];ink?:string|null;len?:number;width?:number}={}){
 const{cov=.5,n=7,box=[-1500,-560,3000,760],len=320,ink=P,width=15}=o,N=Math.round(n*3.2),live=Math.round(n*(1+2.2*g)),rr=rng(seed),p=new Path2D(),[bx,by,bw,bh]=box,tt=twos(t);
 let drawn=0;
 for(let i=0;i<N;i++){const x0=rr()*bw,y0=rr()*bh,L0=len*(.5+rr()),w=width*(.6+rr()*.8),lift=(rr()-.5)*40,ph=rr()*TAU,sp=.7+rr()*.6;if(i>=live)continue;
  const x=bx+wrap(x0+300*sp*(.5*tt+3*gi),0,bw),y=by+y0,L=L0*(.6+1.6*g);
  const pts:Pt[]=[];for(let k=0;k<=4;k++){const u=k/4;pts.push([x+u*L,y+lift*Math.sin(u*Math.PI)*(1-.6*g)+3*Math.sin(ph+u*4)]);}
  p.addPath(ribbon(pts,w*(1+.7*g),{seed:seed+i,taper:.85,pressure:.2,wobble:.8,step:20}));drawn++;}
 if(!drawn)return;if(ink)s.fill(ink,p,Math.min(.9,cov+.35*g));else s.knockout(p,cov);
}

// ---------------- the tree ----------------
/** trunk spine root→tip bent about the root by `bend` radians (more toward the tip, like a young trunk). */
function spine(root:Pt,tip:Pt,bend:number,n=14):Pt[]{const dx=tip[0]-root[0],dy=tip[1]-root[1],out:Pt[]=[];
 for(let i=0;i<=n;i++){const u=i/n,a=bend*Math.pow(u,1.5),c=Math.cos(a),sn=Math.sin(a),x=dx*u,y=dy*u;out.push([root[0]+x*c-y*sn,root[1]+x*sn+y*c]);}return out;}
type Geom={sp:Pt[];C:Pt;sx:number;sy:number;tip:Pt};
/** tree geometry as a pure function: spine, crown centre (above the bent tip, shifted downwind by g), crown flattening. */
function treeGeom(x:number,y:number,h:number,bend:number,crown:number,g:number):Geom{
 const sp=spine([x,y],[x,y-h],bend),tip=sp[sp.length-1],a=bend*.9;
 const C:Pt=[tip[0]+Math.sin(a)*crown*.45+crown*.3*g,tip[1]-Math.cos(a)*crown*.45];
 return{sp,C,sx:1+.35*g,sy:1-.22*g,tip};
}
/** leaf outline points: a pointed blade of length len and half-width wid, from (x,y) at angle a. */
function leafPts(x:number,y:number,a:number,len:number,wid:number,seed:number):Pt[]{
 const pts:Pt[]=[];const N=9;for(let i=0;i<=N;i++){const u=i/N;pts.push([u*len,-Math.sin(u*Math.PI)*wid*(1+.15*noise1(u*3+seed,seed))]);}
 for(let i=N-1;i>0;i--){const u=i/N;pts.push([u*len,Math.sin(u*Math.PI)*wid*(1+.15*noise1(u*3+seed+5,seed+1))]);}
 return rotPts(pts,a).map(p=>[p[0]+x,p[1]+y] as Pt);
}
type Leaf={x:number;y:number;a:number;len:number;wid:number;seed:number};
/** draw a batch of leaves: optional paper knockout beneath (bright on green), one ink fill, one midrib knockout. */
function leaves(s:Sheet,ink:string,list:Leaf[],cov=.92,o:{knock?:boolean;rib?:boolean}={}){
 const{knock=false,rib=true}=o;if(!list.length)return;const body=new Path2D(),ribs=new Path2D();let any=false;
 for(const l of list){if(l.len<4)continue;any=true;body.addPath(polyPath(leafPts(l.x,l.y,l.a,l.len,l.wid,l.seed),true));const e:Pt=[l.x+Math.cos(l.a)*l.len*.85,l.y+Math.sin(l.a)*l.len*.85];ribs.addPath(ribbon([[l.x,l.y],e],Math.max(2,l.wid*.14),{seed:l.seed,taper:.8,wobble:.8,pressure:0}));}
 if(!any)return;if(knock)s.knockout(body,.95);s.fill(ink,body,cov);if(rib)s.knockout(ribs,.9);
}
/** the crown's leaves around C: outward-pointing cut-paper blades that turn downwind, stretch and flutter with g. */
function crownLeaves(G:Geom,crown:number,g:number,tt:number,seed:number,o:{skip?:number[];scale?:(i:number)=>number}={}){
 const{skip=[],scale}=o,rr=rng(seed),yel:Leaf[]=[],blu:Leaf[]=[];
 for(let i=0;i<14;i++){const a0=i/14*TAU+(rr()-.5)*.5,d=crown*(.3+.45*rr()),L=crown*(.55+.3*rr()),j=rr();if(skip.includes(i))continue;const sc=scale?scale(i):1;if(sc<=0)continue;
  const px=G.C[0]+Math.cos(a0)*d*G.sx,py=G.C[1]+Math.sin(a0)*d*G.sy;
  let ang=turn(a0,0,g*.8);ang+=.15*Math.sin(tt*9+i)*g+.05*Math.sin(tt*3+i*1.3+j*6)*(.3+g);
  const len=L*(1+.35*g)*sc,wid=len*.42;
  (i%3===0?blu:yel).push({x:px-Math.cos(ang)*len*.35,y:py-Math.sin(ang)*len*.35,a:ang,len,wid,seed:seed*7+i});}
 return{yel,blu};
}
type TreeOpts={crown?:number;skip?:number[];scale?:(i:number)=>number;extra?:Leaf[];shadow?:number};
/** the tree: navy root flare, hand-cut navy trunk with a paper highlight, two branch ribbons, a green under-crown (yellow × blue),
 * blue leaves overprinting to deep green, yellow leaves knocked out so they print bright. Returns the geometry. */
function tree(s:Sheet,t:number,x:number,y:number,h:number,bend:number,g:number,seed:number,o:TreeOpts={}):Geom{
 const{crown=170,skip=[],scale,extra=[],shadow=0}=o,tt=twos(t),G=treeGeom(x,y,h,bend,crown,g),q=G.sp,n=q.length;
 s.fill(K,polyPath(blob(x,y+2,crown*.42,14,seed+1,{amp:.2,n:20}),true));
 const L:Pt[]=[],R:Pt[]=[],w=(i:number)=>lerp(crown*.36,crown*.16,i/(n-1))/2;
 for(let i=0;i<n;i++){const a=q[Math.max(0,i-1)],b=q[Math.min(n-1,i+1)];let nx=a[1]-b[1],ny=b[0]-a[0];const l=Math.hypot(nx,ny)||1;nx/=l;ny/=l;const ww=w(i);L.push([q[i][0]+nx*ww,q[i][1]+ny*ww]);R.push([q[i][0]-nx*ww,q[i][1]-ny*ww]);}
 const poly=handCut([...L,[G.tip[0],G.tip[1]-6],...R.reverse()],seed+2,5,12);
 if(shadow>0)s.tone(P,polyPath(poly.map(p=>[p[0]+8,p[1]+4] as Pt),true),.4*shadow);
 s.fill(K,polyPath(poly,true));
 s.knockout(ribbon(L.slice(1,n-2).map((p,i)=>[p[0]+w(i+1)*.5,p[1]] as Pt),Math.max(3,crown*.03),{seed:seed+3,taper:.3,wobble:1,pressure:.2,step:14}),.35);
 const br=new Path2D();const b1=at(q,.78).p,b2=at(q,.9).p;
 br.addPath(ribbon([b1,[G.C[0]-crown*.55*G.sx,G.C[1]+crown*.15]],crown*.09,{seed:seed+4,taper:.5,wobble:1.2,pressure:.3,step:16}));
 br.addPath(ribbon([b2,[G.C[0]+crown*.5*G.sx,G.C[1]+crown*.05]],crown*.08,{seed:seed+5,taper:.5,wobble:1.2,pressure:.3,step:16}));
 s.fill(K,br);
 const uc=polyPath(blob(G.C[0],G.C[1],crown*.95*G.sx,crown*.8*G.sy,seed+6,{amp:.12,n:32}),true);s.fill(Y,uc,.95);s.tone(B,uc,.6);
 const{yel,blu}=crownLeaves(G,crown,g,tt,seed+7,{skip,scale});
 leaves(s,B,blu,.85,{rib:false});leaves(s,Y,yel.concat(extra),.95,{knock:true});
 return G;
}
/** a loose leaf in flight: from a to b over dur seconds from t0, spinning and wobbling, resting on the ground after. */
function flyingLeaf(t:number,t0:number,a:Pt,b:Pt,dur:number,seed:number,size=1):Leaf|null{
 if(t<t0)return null;const u=clamp((t-t0)/dur),e=u<1?u:1,p=arc(a,b,easeOut(e),-60);
 const y=u<1?p[1]+30*Math.sin(u*TAU*2.2+seed):b[1]+4*settle(t,t0+dur,{amp:1,freq:5,decay:6});
 return{x:p[0],y,a:u<1?u*TAU*2.5+seed:.2+.3*Math.sin(seed),len:120*size,wid:44*size,seed:seed+70};
}

// ---------------- the post, the ball, the feeling, sight, spark ----------------
/** the rigid post: a navy hand-cut slab on a purple base tone; loads (thickens) before the crack, snaps at hc above the ground and the top falls right. */
function post(s:Sheet,t:number,x:number,y:number,h:number,w:number,seed:number,o:{crackAt:number;load:number;hc:number}){
 const{crackAt,load,hc}=o,cracked=t>=crackAt,ww=w*(1+.25*load),spread=sm(crackAt,crackAt+.9,t,easeOut);
 s.tone(P,polyPath(blob(x,y+6,w*2.2+w*2*spread,w*.7+w*.5*spread,seed,{amp:.15,n:20}),true),.4+.3*spread);
 const slab=(y0:number,y1:number)=>polyPath(handCut([[x-ww/2,y0],[x+ww/2,y0],[x+ww/2,y1],[x-ww/2,y1]],seed+1,4,18),true);
 if(!cracked){s.fill(K,slab(y-h,y));return;}
 s.fill(K,slab(y-hc,y));
 const fall=clamp((t-crackAt)/.42),th=.47*fall*fall+Math.min(0,settle(t,crackAt+.42,{amp:.05,freq:5,decay:6}));
 s.save();s.translate(x+ww/2,y-hc);s.rotate(th);s.translate(-(x+ww/2),-(y-hc));
 s.fill(K,slab(y-h,y-hc+4));
 const zig:Pt[]=[[x-ww/2-4,y-hc-2],[x-ww*.2,y-hc+8],[x,y-hc-6],[x+ww*.25,y-hc+6],[x+ww/2+4,y-hc-2]];s.knockout(ribbon(zig,7,{seed:seed+2,wobble:.5,taper:.2}),.95);
 s.restore();
 if(t>=crackAt+.42&&t<crackAt+1.3)dust(s,null,x+ww/2+(h-hc)*Math.cos(.47),y-hc+(h-hc)*Math.sin(.47),70,9,{seed:seed+3,size:8,cov:.9*(1-(t-crackAt-.42)/.9)});
}
/** the story's ball: a paper football with navy pentagons (purple shadow crescent) and a navy ground shadow. */
function ball(s:Sheet,x:number,y:number,r:number,rot:number,o:{sx?:number;sy?:number;shadow?:number}={}){
 const{sx=1,sy=1,shadow=1}=o;if(shadow>0)s.tone(K,polyPath(blob(x,y+r*.98,r*1.1*shadow,r*.28*shadow,9,{amp:.06,n:18}),true),.25);
 s.save();s.translate(x,y);s.scale(sx,sy);footballPanels(s,0,0,r,{rot,key:K,shadow:P,seed:5,light:[-.4,-.5]});s.restore();
}
/** the feeling: a purple knot (boiling blob, optional spikes) on a paper knockout so it reads on the navy torso. */
function knot(s:Sheet,x:number,y:number,r:number,seed:number,o:{boil?:number;cov?:number;spikes?:[number,number][];round?:number}={}){
 const{boil=0,cov=.85,spikes=[],round=0}=o;if(r<=1)return;const p=new Path2D();
 p.addPath(polyPath(blob(x,y,r*1.1,r*.9,seed+boil,{amp:.2,n:22,rot:-.4}),true));
 spikes.forEach(([a,len],i)=>{if(len<=2)return;const w=lerp(r*.55,r*.9,round);p.addPath(ribbon([[x,y],[x+Math.cos(a)*len,y+Math.sin(a)*len]],w,{seed:seed+i,taper:lerp(.9,.3,round),wobble:lerp(2.5,1,round),pressure:.4}));});
 s.knockout(p,.95);s.fill(P,p,cov);
}
/** A yellow sight wedge from the head toward `ang` (the look), knocked out beneath so it prints bright. */
function sight(s:Sheet,x:number,y:number,ang:number,half:number,L:number,seed:number,g=1){
 if(g<=0)return;const pts:Pt[]=[[x,y]];for(let i=0;i<=8;i++){const a=ang-half+2*half*i/8;pts.push([x+Math.cos(a)*L*g,y+Math.sin(a)*L*g]);}
 const p=polyPath(wob(pts,6,seed,true,{step:26,corner:.5}),true);s.knockout(p,.5);s.tone(Y,p,.6);
}
/** a paper-and-yellow spark on arrival. */
function spark(s:Sheet,x:number,y:number,age:number,seed:number,r=90){
 if(age<0||age>1.1)return;const g=easeOutBack(clamp(age/.4))*(1-.4*clamp((age-.6)/.5));if(g<=0)return;const rr=rng(seed),p=new Path2D();
 for(let i=0;i<8;i++){const a=i/8*TAU+(rr()-.5)*.4,r0=r*.35,r1=r*(.8+rr()*.5)*g;p.addPath(ribbon([[x+Math.cos(a)*r0,y+Math.sin(a)*r0],[x+Math.cos(a)*r1,y+Math.sin(a)*r1]],r*.13*(.7+rr()*.6),{seed:seed+i,taper:.8,pressure:.4,wobble:.8}));}
 s.knockout(p,.95);s.fill(Y,p,.95);
}
const chestOf=(f:{top:Pt;hip:Pt}):Pt=>[lerp(f.top[0],f.hip[0],.45),lerp(f.top[1],f.hip[1],.45)];

// ---------------- chapter 1: a pass goes wrong; the wind hits the player and the tree ----------------
const T1={x:300,y:240,h:290,crown:145};
const ch1Wind=(t:number)=>({g:gust(t,2.0,2.6,3.8),gi:gustInt(t,2.0,2.6,3.8)});
function ch1Bend(t:number){const{g}=ch1Wind(t);return .5*g+sway(t)+(t>3.8?settle(t,3.8,{amp:-.1,freq:1,decay:1.5}):0);}
const ch1Geom=(t:number)=>treeGeom(T1.x,T1.y,T1.h,ch1Bend(t),T1.crown,ch1Wind(t).g);
function ch1Ball(t:number){if(t<.3)return{x:20,y:214,rot:0,on:true};const u=clamp((t-.3)/.75),p=arc([20,214],[-520,236],u,60),roll=sm(1.05,1.9,t,easeOut);return{x:p[0]-260*roll,y:t<1.05?p[1]:236,rot:-u*5-roll*3,on:t<2.2};}
const ch1:Scene={
 draw(s,t){
  const tt=twos(t),ti=twosIndex(t),{g,gi}=ch1Wind(t);
  cam(s,t,[[0,0,30,1],[.3,0,30,1],[.5,-40,30,1.04],[1.4,-60,30,1.06],[2.0,-60,30,1.06],[2.6,160,-10,1.08,-.03],[3.8,160,-10,1.08,0],[4.34,160,-10,1.08,0],[5,100,0,1.1,0],[6.48,100,0,1.1,0],[7.4,160,-40,1.16,0],[8.0,220,-80,1.25,0],[8.77,T1.x,-115,1.45,0]]);
  world(s,t,11);
  wind(s,t,g,gi,21);if(g>0)wind(s,t,g,gi,22,{ink:null,box:[-1500,HZ+10,3000,190],n:4,cov:.6*g,len:200,width:6});
  const G=tree(s,t,T1.x,T1.y,T1.h,ch1Bend(t),g,31,{crown:T1.crown,shadow:g});
  // the teammate (blue, left): arms up for the pass, turns after the ball, slumps, then stands and lifts an arm at 5.0
  const lost=sm(1.5,2.0,t,easeOut),offer=sm(5.0,5.4,t,easeOut),rL=poseLimbs('reach'),slL=poseLimbs('slump'),stL=poseLimbs('stand'),ptL=poseLimbs('point');
  const tmArms=t<5?mixLimbs(rL.arms,slL.arms,lost):mixLimbs(slL.arms,ptL.arms,offer);
  const tmFace=t>=1.0&&t<5.0?-1:1;
  person(s,-340,250,290,B,41,'stand',{facing:tmFace,arms:tmArms,tilt:.22*lost*(1-offer)+.2*g*tmFace,headDrop:[.02*lost*(1-offer),.08*lost*(1-offer)]});
  // the player (navy, right, facing the teammate): wind-up, kick, shoulders drop, leans in the gust, straightens and points on 4.34
  const wu=sm(.08,.3,t),kicked=t>=.3&&t<.6,drop=sm(1.3,1.8,t,easeOut),up=t<4.4?0:easeOutBack(sm(4.4,4.9,t)),slump=drop*(1-clamp(up)),pt=sm(4.9,5.3,t,easeOut);
  const arms=up>0?mixLimbs(stL.arms,ptL.arms,pt):mixLimbs(stL.arms,slL.arms,slump);
  const f=person(s,60+24*g,250,300,K,51,kicked?'kick':'stand',{facing:-1,arms:kicked?undefined:arms,tilt:(t<.3?-.12*Math.sin(wu*Math.PI):0)+.22*slump-.3*g+.02*Math.sin(t*2.1),headDrop:[.02*slump,.08*slump]});
  // the ball: kicked at .3, flies low past the teammate and rolls out of the picture (the miss)
  const b=ch1Ball(t);if(b.on)ball(s,b.x,b.y,54,b.rot,{shadow:t<.3||t>1.05?1:.4});
  if(t>=.3&&t<1.05)speedLines(s,K,b.x+30,b.y,Math.PI,{n:4,seed:43+ti,len:90,width:5,cov:.8});
  // the feeling: a purple knot grows on the chest at 6.5, lifts off at 7.2 and floats with the wind up into the crown
  const grow=t<6.5?0:easeOutBack(sm(6.5,6.8,t)),fl=sm(7.2,8.6,t,easeIO);
  if(grow>0){const c=chestOf(f),p=arc(c,G.C,fl,-120),x=p[0]+16*Math.sin(t*5)*fl*(1-fl),y=p[1]+10*Math.sin(t*7);knot(s,x,y,40*grow*(1-.7*fl),61,{boil:t<8.6?ti%3:0,cov:.85});}
  void tt;
 },
 aperture(t){const G=ch1Geom(t);return apertureDisc(G.C[0],G.C[1],80,12);},still:2.7,
};

// ---------------- chapter 2: BEND — the whole tree bends and springs back; the rigid post snaps ----------------
const T2={x:0,y:240,h:320,crown:175};
const ch2G=(t:number)=>gust(t,3.04,3.55,4.6)+.6*gust(t,7.78,8.1,8.9),ch2GI=(t:number)=>gustInt(t,3.04,3.55,4.6)+.6*gustInt(t,7.78,8.1,8.9);
function ch2Bend(t:number){
 let b=sway(t,.8)+.06*Math.exp(-t*1.2)*Math.cos(t*4);
 if(t>=3.04&&t<3.16)b+=lerp(0,-.05,easeIn((t-3.04)/.12));else if(t>=3.16&&t<3.6)b+=lerp(-.05,.62,easeIO((t-3.16)/.44));else if(t>=3.6)b+=settle(t,3.6,{amp:.62,freq:1.0,decay:1.5,phase:Math.PI/2});
 if(t>=7.78&&t<7.9)b+=lerp(0,-.04,easeIn((t-7.78)/.12));else if(t>=7.9&&t<8.25)b+=lerp(-.04,.36,easeIO((t-7.9)/.35));else if(t>=8.25)b+=settle(t,8.25,{amp:.36,freq:1.0,decay:1.6,phase:Math.PI/2});
 return b;
}
const ch2Geom=(t:number)=>treeGeom(T2.x,T2.y,T2.h,ch2Bend(t),T2.crown,ch2G(t));
/** the seam leaf: the crown's front-right leaf that turns to the camera and grows from 9.2. */
function seamLeaf(t:number){const G=ch2Geom(t),turnU=sm(9.2,9.6,t,easeOut),len=lerp(200,300,turnU),wid=lerp(80,120,turnU),a=lerp(-.2,-.45,turnU);
 const x=G.C[0]+T2.crown*.5*G.sx,y=G.C[1]+T2.crown*.12*G.sy;return{leaf:{x,y,a,len,wid,seed:99} as Leaf,c:[x+Math.cos(a)*len*.5,y+Math.sin(a)*len*.5] as Pt};}
const ch2:Scene={
 draw(s,t){
  const g=ch2G(t),gi=ch2GI(t),kick=settle(t,8.15,{amp:6,freq:9,decay:6}),L=seamLeaf(t);
  cam(s,t,[[0,0,-20,.9],[3.04,0,-20,.9],[3.7,60,-10,1.05,-.05],[4.3,60,-10,1.05,-.05],[5.5,40,-20,1.08,0],[7.78,40,-20,1.08,0],[8.4,150,10,1.12,0],[9.2,150,10,1.12,0],[9.97,L.c[0],L.c[1],1.55,0]],[kick,kick*.5]);
  world(s,t,12);
  wind(s,t,g,gi,23,{n:8});if(g>0)wind(s,t,g,gi,24,{ink:null,box:[-1500,HZ+10,3000,190],n:5,cov:.6*g,len:220,width:6});
  const bend=ch2Bend(t);
  tree(s,t,T2.x,T2.y,T2.h,bend,g,32,{crown:T2.crown,skip:[...(t>=3.5?[4]:[]),...(t>=3.65?[9]:[])],shadow:Math.abs(bend)});
  // two leaves torn off in the first gust fly right and land on the pitch
  const fl:Leaf[]=[];const l1=flyingLeaf(t,3.5,[110,-280],[560,232],1.6,5),l2=flyingLeaf(t,3.65,[50,-320],[700,240],1.8,6);if(l1)fl.push(l1);if(l2)fl.push(l2);leaves(s,Y,fl,.95,{knock:true});
  // the rigid post beside the tree: loads on the second gust, cracks at 8.15, its top falls
  post(s,t,330,240,300,34,71,{crackAt:8.15,load:sm(7.95,8.15,t)*(1-sm(8.15,8.4,t)),hc:100});
  // the seam leaf, drawn last: turns to the camera and grows from 9.2
  leaves(s,Y,[L.leaf],.95,{knock:true});
 },
 aperture(t){const L=seamLeaf(t);return apertureDisc(L.c[0],L.c[1],62,12);},still:3.6,
};

// ---------------- chapter 3: BREATHE — name the feeling, take a slow breath ----------------
const KNOT:Pt=[14,8];
const ch3G=(t:number)=>.35*(1-sm(6.42,8,t)),ch3GI=(t:number)=>.35*(t-smInt(6.42,8,t));
const ch3:Scene={
 draw(s,t){
  const tt=twos(t),ti=twosIndex(t),g=ch3G(t),gi=ch3GI(t);
  const inhale=sm(6.42,8,t,easeOut),exhale=sm(8,9.77,t,easeOut),named=sm(5.2,5.7,t);
  const kick=(t>=0&&t<.3?4:0)+(t>=1.1&&t<1.4?4:0)+(t>=2.2&&t<2.5?4:0);
  cam(s,t,[[0,0,20,1],[2.6,-30,30,1.03,-.02],[5.02,-30,30,1.03,-.02],[5.7,0,20,1.06,0],[6.42,0,20,1.06,0],[8,0,10,1.14,0],[9.1,0,10,1.14,0],[9.77,KNOT[0],KNOT[1],1.5,0]],[kick*.5+3*Math.sin(t*1.9)*(1-inhale),kick+2*Math.sin(t*1.3)*(1-inhale)]);
  world(s,t,13);
  wind(s,t,g,gi,25,{n:6,cov:.35});
  tree(s,t,430,240,330,sway(t)+.3*g,g,33,{crown:150});
  // the player, big and centred: chest heaves with each feeling, hunched; on the breath the whole pose opens
  const heave=.08*Math.pow(Math.abs(Math.sin(t*TAU/.9)),.7)*(1-sm(5.02,5.5,t));
  const chest=1+heave+.22*inhale-.14*exhale*inhale,tilt=.1*(1-inhale)-.04*inhale,stL=poseLimbs('stand'),rL=poseLimbs('reach');
  person(s,0,250,500,K,151,'stand',{facing:1,scaleX:chest,tilt,headDrop:[.02*(1-inhale),.06*(1-inhale)-.02*inhale],arms:mixLimbs(stL.arms,rL.arms,.25*inhale*(1-.5*exhale))});
  // the knot: grows in three pops with three spikes, boils until named, rounds into lobes, shrinks and opens on the exhale
  const pop=(t0:number)=>t<t0?0:easeOutBack(sm(t0,t0+.3,t));
  const r=(44+16*pop(0)+16*pop(1.1)+16*pop(2.2))*(1-.3*exhale)*(1-.06*named);
  const sp=(t0:number,len:number)=>t<t0?0:len*easeOut(clamp((t-t0-.1)/.25))*(1+.12*settle(t,t0+.35,{amp:1,freq:3,decay:5}))*(1-.35*named);
  const shake=t<5.4&&t>=2.2?.08*Math.sin(tt*30):0;
  knot(s,KNOT[0],KNOT[1],r,161,{boil:t<5.4?ti%3:0,cov:key(t,[[0,.85],[8,.85],[9.6,.5]]),round:named,spikes:[[-2.3,sp(0,110)],[.7,sp(1.1,90)],[-.2+shake,sp(2.2,130)]]});
  // naming: a navy-edged paper ring draws itself round the knot as two halves that meet; it expands with the chest on the breath
  if(t>=5.02){const bow=sm(5.02,5.2,t)*8,rr=(106+bow)*(1+.12*inhale)*(1-.03*exhale),Lp=blob(KNOT[0],KNOT[1],rr,rr*.95,44,{amp:.05,n:24}),half=12,A=Lp.slice(0,half+1),Bh=Lp.slice(half).concat([Lp[0]]);
   const prog=t<5.2?.04:Math.min(1,named*1.02+(named>=1?.04*settle(t,5.7,{amp:1,freq:4,decay:6}):0));
   for(const [pts,sd] of [[A,45],[Bh,46]] as [Pt[],number][]){const q=partial(smoothPts(pts,false,6),prog);if(q.length>1){s.fill(K,ribbon(q,22,{seed:sd,taper:.4,wobble:1.2,pressure:.3}),.95);s.knockout(ribbon(q,11,{seed:sd+2,taper:.5,wobble:1,pressure:.2}),.95);}}}
  // the breath out: a paper puff drifts forward from the head
  if(t>=8){const u=sm(8,9.3,t,easeOut);s.knockout(polyPath(blob(120+150*u,-180-40*u,30+50*u,22+36*u,47,{amp:.1,n:20}),true),.9*(1-u));}
 },
 aperture(){return apertureDisc(KNOT[0],KNOT[1],60,12);},still:5.8,
};

// ---------------- chapter 4: ONE ACTION — shoulder, space, option, pass ----------------
const ch4Run=(t:number)=>sm(2.8,3.5,t,easeIO);
function ch4Ball(t:number){const u=sm(6.55,7.3,t,easeIO),p=arc([370,214],[80,214],u,40);const c=t>7.3?settle(t,7.3,{amp:.08,freq:4,decay:5,phase:Math.PI/2}):0;return{x:p[0],y:p[1],rot:-u*6+key(t,[[8.2,0],[8.35,.15],[8.7,-1.1,easeOut]]),sx:1+c,sy:1-c};}
const ch4:Scene={
 draw(s,t){
  const ti=twosIndex(t),g=.12,gi=.12*t;
  cam(s,t,[[0,-40,40,.95],[.15,-40,40,.95],[.7,-120,0,.98,-.04],[1.3,-120,0,.98,-.04],[1.9,-40,40,1.0,0],[2.75,-40,40,1.0,0],[3.6,60,30,1.05,0],[4.3,60,30,1.05,0],[6.4,120,40,1.08,0],[7.4,80,60,1.15,0],[8.2,80,90,1.2,0],[9.07,80,214,2.6,0]]);
  world(s,t,14);
  wind(s,t,g,gi,26,{n:6,cov:.3});
  tree(s,t,-520,240,320,sway(t),g,34,{crown:150});
  // the open space: a pool of yellow on the grass that appears on "Move into space" and brightens when the player arrives
  const pool=t<2.3?0:easeOutBack(sm(2.3,2.7,t)),runU=ch4Run(t);
  if(pool>0){const pp=polyPath(blob(40,250,190*pool,60*pool,17,{amp:.08,n:28}),true);s.knockout(pp,.9);s.tone(Y,pp,.6+.15*sm(3.4,3.6,t));}
  // the player: checks the shoulder (head back + sight wedge, camera turns), runs into the space, offers (pointing arm), receives
  const lk=key(t,[[0,0],[.15,-.15],[.55,1,easeOut],[1.3,1],[1.7,0]]),st=stride(ti),moving=runU>0&&runU<1,px=lerp(-260,40,runU)+(runU>=1?12*settle(t,3.5,{amp:1,freq:4,decay:5}):0);
  const pt=key(t,[[4.3,0],[4.45,-.15],[4.8,1,easeOut]]),cushion=t>=7.3&&t<7.5?.06:0,stL=poseLimbs('stand'),ptL=poseLimbs('point');
  const f=person(s,px,250,300,K,161,moving?'run':'stand',{facing:1,legs:moving?st.legs:undefined,arms:moving?st.arms:t>=4.3?mixLimbs(stL.arms,ptL.arms,pt):undefined,head:!moving&&lk>0?[-.12*lk,-.82]:undefined,tilt:moving?.12:-.04*lk+cushion,scaleX:1+cushion});
  sight(s,f.head[0],f.head[1],Math.PI,.16,300,162,sm(.4,.8,t)*(1-sm(1.3,1.7,t)));
  if(moving&&runU<.75)speedLines(s,K,px-40,120,0,{n:4,seed:163+ti,len:120,spread:50,width:6,cov:.85});
  if(runU>=1&&t<4)dust(s,null,px,250,50,7,{seed:164,size:6,cov:.9*(1-sm(3.5,4,t))});
  // the teammate with the ball: loads and kicks on "one action"
  const load=sm(6.36,6.55,t)*(1-sm(6.55,6.8,t)),kicked=t>=6.55&&t<6.85;
  person(s,400,250,290,B,171,kicked?'kick':'stand',{facing:-1,tilt:-.1*load});
  // the option: a navy dashed lane from the ball to the player's feet; dashes vanish behind the ball as it passes
  const lineP=sm(4.6,5.2,t,easeOut),passU=sm(6.55,7.3,t,easeIO);
  if(lineP>0&&passU<1){const a:Pt=[lerp(340,80,passU),214+10*passU];laneArrow(s,K,a,[110,222],16,{dashed:true,seed:78,progress:lineP,head:34});}
  const b=ch4Ball(t);ball(s,b.x,b.y,64,b.rot,{sx:b.sx,sy:b.sy,shadow:passU>0&&passU<1?.5:1});
  if(passU>0&&passU<1)speedLines(s,K,b.x+50,b.y,Math.PI,{n:4,seed:85+ti,len:80,width:4,cov:.8});
  spark(s,80,214,t-7.3,84,100);
 },
 aperture(t){const b=ch4Ball(t);return apertureDisc(b.x,b.y,15.5,5,b.rot);},still:7.4,
};

// ---------------- chapter 5: NEXT — stuck, a hand on the shoulder, the reset ----------------
const STUCK_ARMS:Limb[]=[[[-.13,-.6],[-.26,-.5],[-.3,-.62]],[[.13,-.6],[.28,-.52],[.34,-.64]]];
const HAND_ARMS:Limb[]=[[[-.16,-.6],[-.24,-.46],[-.23,-.3]],[[.13,-.6],[.34,-.63],[.52,-.6]]];
const ch5Arrive=(t:number)=>sm(1.3,2.3,t,easeIO);
const ch5TmX=(t:number)=>lerp(620,190,ch5Arrive(t))+(t>2.3?12*settle(t,2.3,{amp:1,freq:3,decay:5}):0);
/** the teammate's mitt on the player's shoulder (arms[1] end of HAND_ARMS at facing −1, size 360). */
const ch5Mitt=(t:number):Pt=>[ch5TmX(t)-.52*360,250-.6*360];
const ch5:Scene={
 draw(s,t){
  const ti=twosIndex(t),g=.15,gi=.15*t,M=ch5Mitt(t);
  const kick=settle(t,2.7,{amp:3,freq:8,decay:6})+settle(t,7.0,{amp:4,freq:8,decay:6});
  cam(s,t,[[0,0,20,1.1],[1.22,10,18,1.12],[2.3,80,20,1.15],[4.5,80,20,1.15],[6.5,60,0,1.18],[7.2,40,-10,1.2],[8.1,40,-10,1.2],[8.77,M[0],M[1],2.0]],[0,kick]);
  world(s,t,15);
  wind(s,t,g,gi,27,{n:6,cov:.3});
  tree(s,t,-420,240,300,sway(t)+.06,g,35,{crown:140});
  // the player: frozen mid-step with the knot back on the chest; on NEXT (6.5) straightens in one ease-out-back
  const up=t<6.5?0:easeOutBack(sm(6.5,7.0,t)),u=clamp(up),wL=poseLimbs('walk'),stL=poseLimbs('stand');
  const f=person(s,0,250,380,K,131,'stand',{facing:1,legs:mixLimbs(wL.legs,stL.legs,u),arms:mixLimbs(STUCK_ARMS,stL.arms,u),tilt:.12*(1-up)-.02*up+(t>2.7?.01*settle(t,2.7,{amp:1,freq:4,decay:4}):0),headDrop:[.02*(1-u),.07*(1-u)-.01*u]});
  const c=chestOf(f),popU=sm(6.5,6.65,t);
  knot(s,c[0],c[1],46*(1-popU),132,{boil:t<6.5?Math.floor(ti/2)%3:0,cov:.85});
  // the teammate walks in from the right, stops beside and puts a blue paper mitt on the shoulder
  const arrive=ch5Arrive(t),moving=arrive>0&&arrive<1,st=stride(ti),hand=sm(2.3,2.7,t,easeOut);
  if(t>=1.3){person(s,ch5TmX(t),250,360,B,133,moving?'walk':'stand',{facing:-1,legs:moving?st.legs:undefined,arms:moving?st.arms:mixLimbs(stL.arms,HAND_ARMS,hand),tilt:moving?.06:.04*hand});
   if(hand>0){const mp=polyPath(blob(M[0],M[1],36*hand,32*hand,134,{amp:.08,n:20}),true);s.knockout(mp,.95);s.fill(B,mp,.92);}}
  // the knot pops into five leaves that blow away with the wind
  if(t>=6.55){const fl:Leaf[]=[];for(let i=0;i<5;i++){const age=t-6.55-i*.06;if(age<0||age>1.8)continue;const k=easeOut(clamp(age/1.8));fl.push({x:c[0]+k*(160+50*i)+30*Math.sin(age*3+i),y:c[1]-k*(80+40*i)+25*Math.sin(age*5+i),a:age*4+i,len:70*(1-.4*k),wid:28*(1-.4*k),seed:140+i});}leaves(s,Y,fl,.95,{knock:true});}
  spark(s,c[0],c[1]-20,t-6.6,135,110);
 },
 aperture(t){const M=ch5Mitt(t);return apertureDisc(M[0],M[1],27,12);},still:7.3,
};

// ---------------- chapter 6: back in the game, one moment at a time ----------------
const PA:Pt=[-20,214],PB:Pt=[290,214];
/** where the ball is: five short passes between A and B. */
function ch6Ball(t:number){const legs:[number,number,Pt,Pt][]=[[.8,1.5,PA,PB],[2.2,2.9,PB,PA],[5.7,6.4,PA,PB],[7.7,8.4,PB,PA],[8.8,9.5,PA,PB]];let p:Pt=PA,rot=0,c=0,flying=false;
 for(const[t0,t1,a,b] of legs){if(t<t0)break;const u=sm(t0,t1,t,easeIO);p=arc(a,b,u,40);rot+=u*5*(b[0]>a[0]?1:-1);flying=u<1;if(u>=1)c=settle(t,t1,{amp:.08,freq:4,decay:5,phase:Math.PI/2});}
 return{p,rot,c,flying};}
const ch6:Scene={
 draw(s,t){
  const ti=twosIndex(t),g=.12*(1-.6*sm(4.4,5.6,t)),gi=.12*(t-.6*smInt(4.4,5.6,t));
  cam(s,t,[[0,80,40,1.2],[3.34,60,40,1.2],[3.9,-20,20,1.18,-.02],[4.4,-20,20,1.18,0],[5.6,0,20,1.12,0],[7.6,60,30,1.1,0],[8.8,120,30,1.05,0],[9.8,-20,-10,.95,0]]);
  world(s,t,16);
  wind(s,t,g,gi,28,{n:6,cov:.3});
  // the tree, upright, with three new leaves unfurling
  const G=treeGeom(-400,240,300,sway(t,.7),160,g),nl=(t0:number)=>t<t0?0:easeOutBack(sm(t0,t0+.4,t));
  const extra:Leaf[]=[[.3,-.55,-.9,.4],[.58,-.2,-.3,.9],[.1,-.95,-1.6,1.4]].map(([dx,dy,a,t0],i)=>({x:G.C[0]+dx*160*G.sx,y:G.C[1]+dy*160*G.sy,a,len:120*nl(t0),wid:50*nl(t0),seed:180+i}));
  tree(s,t,-400,240,300,sway(t,.7),g,36,{crown:160,extra});
  // the players: A (navy) and B (blue) pass in rhythm; A notices (head), breathes (chest), chooses (pointing arm), passes
  const bl=ch6Ball(t);
  const kickA=(t>=.7&&t<.95)||(t>=5.6&&t<5.85)||(t>=8.7&&t<8.95),kickB=(t>=2.1&&t<2.35)||(t>=7.6&&t<7.85);
  const loadA=sm(.55,.7,t)*(1-sm(.7,.9,t))+sm(5.45,5.6,t)*(1-sm(5.6,5.8,t))+sm(8.55,8.7,t)*(1-sm(8.7,8.9,t)),loadB=sm(1.95,2.1,t)*(1-sm(2.1,2.3,t))+sm(7.45,7.6,t)*(1-sm(7.6,7.8,t));
  const cushA=(t>=2.9&&t<3.1)||(t>=8.4&&t<8.6)?.06:0,cushB=(t>=1.5&&t<1.7)||(t>=6.4&&t<6.6)||(t>=9.5&&t<9.7)?.06:0;
  const lk=key(t,[[3.34,0],[3.5,-.15],[3.9,1,easeOut],[4.2,1],[4.5,0]]),breath=sm(4.4,5.3,t,easeOut)*(1-.6*sm(5.3,6.5,t)),pt=key(t,[[5.5,0],[5.6,-.15],[5.8,1,easeOut]])*(1-sm(5.85,6.2,t));
  const stL=poseLimbs('stand'),ptL=poseLimbs('point');
  const f=person(s,-60,250,300,K,171,kickA?'kick':'stand',{facing:1,tilt:-.1*loadA+cushA-.03*breath+.015*Math.sin(t*2.1),scaleX:(1+cushA)*(1+.18*breath),head:lk>0?[-.12*lk,-.82]:undefined,arms:kickA?undefined:pt>0?mixLimbs(stL.arms,ptL.arms,pt):undefined});
  sight(s,f.head[0],f.head[1],Math.PI,.14,220,172,sm(3.6,3.9,t)*(1-sm(4.2,4.5,t)));
  const c=chestOf(f),fade=1-sm(4.4,5.0,t);if(fade>0)knot(s,c[0],c[1],22*fade,173,{cov:.45});
  person(s,330,250,290,B,174,kickB?'kick':'stand',{facing:-1,tilt:-.1*loadB+cushB,scaleX:1+cushB});
  ball(s,bl.p[0],bl.p[1],46,bl.rot,{sx:1+bl.c,sy:1-bl.c,shadow:bl.flying?.5:1});
  if(bl.flying)speedLines(s,K,bl.p[0]+(bl.rot>0?-40:40),bl.p[1],bl.rot>0?0:Math.PI,{n:3,seed:175+ti,len:60,width:4,cov:.8});
  for(const[t1,p] of [[1.5,PB],[2.9,PA],[6.4,PB],[8.4,PA],[9.5,PB]] as [number,Pt][])spark(s,p[0],p[1]-10,t-t1,176+Math.round(t1*10),80);
 },
 still:9.9,
};

export const story:RisoStory={
 id:'reset',format:'11v11',title:'Mental Toughness',theme:'Finding your next useful action',ageNote:'A direct mental-skills explainer; playing format does not define age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',blue:'#0078bf',purple:'#765ba7',navy:'#22366b'},order:['yellow','blue','purple','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:[
  {label:'WHAT IS TOUGHNESS?',narration:'What does mental toughness mean when a pass goes wrong? It means finding a useful response while making room for your feelings.',seconds:9.417,audio:CH+'01.m4a',cues:[{at:0,words:'What does mental'},{at:4.34,words:'a useful response'},{at:6.48,words:'room for your feelings'}]},
  {label:'BEND AND RETURN',headline:'Bend',narration:'Imagine a flexible branch in the wind. It bends under pressure, then finds balance. Staying rigid is not the only kind of strength.',seconds:10.617,audio:CH+'02.m4a',cues:[{at:0,words:'Imagine a flexible branch'},{at:3.04,words:'bends under pressure'},{at:7.78,words:'only kind of strength'}]},
  {label:'NOTICE THE MOMENT',headline:'Breathe',narration:'You might feel frustrated, embarrassed, or worried about another mistake. Name that feeling. Take a slow breath before choosing an action.',seconds:10.417,audio:CH+'03.m4a',cues:[{at:0,words:'You might feel'},{at:5.02,words:'Name that feeling'},{at:6.42,words:'Take a slow breath'}]},
  {label:'ONE USEFUL ACTION',headline:'One action',narration:'What can you do now? Check your shoulder. Move into space. Offer a simple passing option. Choose one action you can try.',seconds:9.717,audio:CH+'04.m4a',cues:[{at:0,words:'What can you do'},{at:2.62,words:'Move into space'},{at:6.36,words:'one action'}]},
  {label:'SUPPORT IS STRENGTH',headline:{text:'Next',at:6.5},narration:'If you feel stuck, ask a teammate or coach for help. A reset word, like Next, can remind you where to put your attention.',seconds:9.417,audio:CH+'05.m4a',cues:[{at:0,words:'If you feel stuck'},{at:1.22,words:'ask a teammate'},{at:6.5,words:'where to put your attention'}]},
  {label:'RESET AND RETURN',narration:'You can feel disappointed and still contribute. Notice. Breathe. Choose. Practise returning to the game, one moment at a time.',seconds:10.415,audio:CH+'06.m4a',cues:[{at:0,words:'You can feel disappointed'},{at:3.34,words:'Notice. Breathe. Choose'},{at:7.6,words:'one moment at a time'}]},
 ],
 draw(f){playChapters(story,f,[ch1,ch2,ch3,ch4,ch5,ch6]);},
 /** a tap shakes a leaf loose: it spirals down and right with the wind, a small paper gust puff marks the tap. */
 touch(s,x,y,age,seed){
  const u=easeOut(clamp(age/.8));const lx=x+130*u,ly=y+170*u+18*Math.sin(u*TAU*2),a=u*TAU*2+.4;
  dust(s,null,x,y,50+160*u,12,{seed:seed+3,size:16,cov:.9*(1-clamp(age/.7))});
  const fade=.95*(1-clamp((age-.6)/.2));
  s.fill(K,ribbon([[lx,ly],[lx-Math.cos(a)*70,ly-Math.sin(a)*70]],9,{seed:seed+4,taper:.6,wobble:1}),fade);
  leaves(s,B,[{x:lx,y:ly,a,len:150,wid:50,seed}],fade,{knock:true});
  if(age>0&&age<.35){const p=new Path2D();for(let i=0;i<4;i++){const yy=y-24+i*16;p.addPath(ribbon([[x-10+age*80,yy],[x+60+age*220,yy+3]],4,{seed:seed+i,taper:.8,wobble:.5}));}s.knockout(p,.9*(1-age/.35));}
 },
};
