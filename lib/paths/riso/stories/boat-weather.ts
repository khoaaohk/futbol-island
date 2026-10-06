/** The Boat and the Weather — riso rework (2026-09-21). TWO LINKED PLACES in one side-view world: the PITCH on the shore (where the football
 * moments happen) and the SEA beyond it (where the boat metaphor happens); the player and the sailor are the same navy cut-paper figure.
 * Sky: cream paper with a faint blue screen and purple torn storm fronts · sea: stepped blue halftone bands whose torn tops are travelling
 * waves with paper crests · pitch: cream ground with a faint blue halftone and blue lines · the boat: an ORANGE hull with a paper stripe,
 * a navy mast and tiller, a paper sail with a wobbly cut edge · wind: purple streaks on gust envelopes (onset → peak → recovery) · rain:
 * navy diagonal dashes in a front. Roles: navy = you (player / sailor); orange = opponent + your hull; blue = teammate (figures, hull),
 * water, lines; purple = weather, referee, coach, the feeling. Inks orange → blue → purple → navy on cream.
 * Drawn objects on twos, camera on ones, every random value seeded. */
import type {Sheet} from '../sheet';
import {type RisoStory,type Scene,playChapters} from '../story';
import {apertureDisc} from '../passage';
import {twos,twosIndex,sm,easeOut,easeIO,easeIn,easeOutBack,key,anticipate,settle,clamp,lerp,rng,noise1,blob,polyPath,ribbon,wob,arc,smoothPts,partial,TAU,type Pt,type Key,creepHolds} from '../motion';
import {contour,dust,handCut,footballPanels,speedLines} from '../shapes';

const CH='/stories/narration/11v11/boat-weather/';
const K='navy',P='purple',O='orange',B='blue';
const D=Math.PI/180;

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

// ---------------- motion helpers ----------------
/** gust envelope 0..1: rises (easeIn) onset→peak, relaxes (cubic tail) peak→recovery. */
const gust=(t:number,on:number,peak:number,rec:number)=>t<=on||t>=rec?0:t<peak?easeIn((t-on)/(peak-on)):Math.pow(1-(t-peak)/(rec-peak),3);
/** integral of the gust envelope (drives the extra drift a gust adds to the streaks). */
function gustInt(t:number,on:number,peak:number,rec:number){if(t<=on)return 0;const a=peak-on,b=rec-peak;if(t<peak){const u=(t-on)/a;return a*u*u*u*u/4;}if(t<rec){const u=(t-peak)/b;return a/4+b*(1-Math.pow(1-u,4))/4;}return a/4+b/4;}
/** viewport fit: the desktop art region shows ≈ 793 × 713 world units at zoom 1; phones show up to 1080 wide, so they get a closer view (≤ ×1.32). */
const view=(s:Sheet)=>clamp((s.safe.w/s.fit)/800,1,1.32);
/** camera through [t,x,y,zoom,rot] keys, each segment eased; kick = a force on the camera (gust drag, a shove), rot = an added roll. */
// moving holds: a camera hold creeps toward the next key instead of parking (stutter audit, Oct 4 2026)
function cam(s:Sheet,t:number,K:Key[],kick:Pt=[0,0],rot=0){const v=key(t,creepHolds(K),easeIO,true);s.camera(v[0]+kick[0],v[1]+kick[1],(v[2]??1)*view(s),(v[3]??0)+rot);return v;}
const wrap=(v:number,a:number,b:number)=>{const L=b-a;return a+(((v-a)%L)+L)%L;};

// ---------------- the world: sky, storm fronts, wind, rain, sea, pitch ----------------
const HZ=-60,WL=HZ+145,GY=235;
/** A full-width strip with torn top and bottom edges whose noise slides with `off` (units). */
function bandPath(y0:number,y1:number,off:number,seed:number,amp:number,o:{x0?:number;x1?:number;step?:number}={}){
 const{x0=-1800,x1=1800,step=60}=o,p=new Path2D();
 const yt=(x:number)=>y0+amp*noise1((x-off)/170+seed,seed)+amp*.45*noise1((x-off)/52,seed+3);
 const yb=(x:number)=>y1+amp*noise1((x-off)/190+seed+50,seed+7)+amp*.45*noise1((x-off)/61,seed+9);
 p.moveTo(x0,yt(x0));for(let x=x0+step;x<=x1;x+=step)p.lineTo(x,yt(x));for(let x=x1;x>=x0;x-=step)p.lineTo(x,yb(x));p.closePath();return p;
}
const sky=(s:Sheet)=>s.field(B,.1,.3);
/** a purple storm front: one torn field bounded by a hand-cut leading `edge` (points in order) and closed far away by `side`; dark = a navy screen inside. */
function front(s:Sheet,edge:Pt[],side:Pt[],seed:number,o:{cov?:number;dark?:number;teeth?:number}={}){
 const{cov=.55,dark=0,teeth=50}=o,cut=handCut(edge,seed,teeth,120,false),poly=polyPath([...cut,...side],true);
 s.fill(P,poly,cov);if(dark>0)s.tone(K,poly,dark);
}
/** the wind: purple streak ribbons drifting right; count, length and coverage grow with the gust value g, drift with its integral gi. */
function wind(s:Sheet,t:number,g:number,gi:number,seed:number,o:{cov?:number;n?:number;box?:[number,number,number,number];len?:number;width?:number}={}){
 const{cov=.45,n=7,box=[-1500,-560,3000,600],len=320,width=15}=o,N=Math.round(n*3.2),live=Math.round(n*(1+2.2*g)),rr=rng(seed),p=new Path2D(),[bx,by,bw,bh]=box,tt=twos(t);
 let drawn=0;
 for(let i=0;i<N;i++){const x0=rr()*bw,y0=rr()*bh,L0=len*(.5+rr()),w=width*(.6+rr()*.8),lift=(rr()-.5)*40,ph=rr()*TAU,sp=.7+rr()*.6;if(i>=live)continue;
  const x=bx+wrap(x0+300*sp*(.5*tt+3*gi),0,bw),y=by+y0,L=L0*(.6+1.6*g);
  const pts:Pt[]=[];for(let k=0;k<=4;k++){const u=k/4;pts.push([x+u*L,y+lift*Math.sin(u*Math.PI)*(1-.6*g)+3*Math.sin(ph+u*4)]);}
  p.addPath(ribbon(pts,w*(1+.7*g),{seed:seed+i,taper:.85,pressure:.2,wobble:.8,step:20}));drawn++;}
 if(drawn)s.fill(P,p,Math.min(.9,cov+.35*g));
}
/** rain: navy diagonal dashes blown from the left, scrolling down on twos; `clip` bounds the front. */
function rain(s:Sheet,t:number,cov:number,seed:number,o:{n?:number;box?:[number,number,number,number];clip?:Path2D;len?:number}={}){
 if(cov<=.03)return;const{n=110,box=[-1500,-700,3000,1200],clip,len=90}=o,[bx,by,bw,bh]=box,rr=rng(seed),tt=twos(t),p=new Path2D(),dx=.42,dy=.91;
 for(let i=0;i<n;i++){const x=bx+wrap(rr()*bw+380*tt,0,bw),y=by+wrap(rr()*bh+760*tt,0,bh),L=len*(.5+rr()),w=4+rr()*2.5;p.moveTo(x,y);p.lineTo(x+dx*L,y+dy*L);p.lineTo(x+dx*L+dy*w,y+dy*L-dx*w);p.lineTo(x+dy*w,y-dx*w);p.closePath();}
 if(clip){s.save();s.clip(clip);s.fill(K,p,cov);s.restore();}else s.fill(K,p,cov);
}
const SEA_COV=[.45,.6,.75,.88,1];
/** the top of sea band k at x: a travelling wave whose amplitude grows with `storm` (0..1). */
const waveY=(x:number,k:number,t:number,storm:number,seed:number)=>{const A=(7+44*storm)*(1+.22*k),L=150+30*k,ph=-t*(1.3+.9*storm);return HZ+40+k*80+A*(.68*Math.sin(x/L+ph+k*1.7)+.32*Math.sin(x/(L*.43)+ph*1.5+k*.7))+A*.3*noise1(x/140+k*5,seed+k);};
/** the wave under a boat on band 1: lift (units) and slope (radians). */
function waveAt(x:number,t:number,storm:number,seed:number){const y0=waveY(x,1,t,storm,seed),y1=waveY(x+40,1,t,storm,seed);return{lift:y0-(HZ+120),slope:Math.atan2(y1-y0,40)};}
/** the sea from x0 (the shore when > −1700: a torn vertical edge) to x1: base tone under the horizon, then stepped blue bands whose tops are
 * travelling waves with paper crests. `bands` = which bands this call prints (0 also prints the base); knock = paper beneath bands ≥ 2. */
function sea(s:Sheet,t:number,storm:number,seed:number,bands:number[],o:{x0?:number;x1?:number;knock?:boolean}={}){
 const{x0=-1800,x1=1800,knock=false}=o,shore=x0>-1700,edge=(y:number)=>x0+26*noise1(y/70,seed+30)+.06*(y-HZ);
 const poly=(top:(x:number)=>number)=>{const p:Pt[]=[];p.push([shore?edge(top(x0)):x0,top(x0)]);for(let x=x0+40;x<=x1;x+=40)p.push([x,top(x)]);p.push([x1,HZ+2400]);if(shore){for(let y=HZ+2400;y>top(x0);y-=60)p.push([edge(y),y]);}else p.push([x0,HZ+2400]);return polyPath(p,true);};
 if(bands.includes(0))s.tone(B,poly(x=>HZ+8*noise1(x/200,seed)),.32);
 const crests=new Path2D();let any=false;
 for(const k of bands){const top=(x:number)=>waveY(x,k,t,storm,seed),p=poly(top);if(knock&&k===2)s.knockout(p,.95);if(k>=4)s.fill(B,p);else s.tone(B,p,SEA_COV[k]);
  const rr=rng(seed+k*11);for(let i=0;i<3;i++){const L0=x0+rr()*(x1-x0),len=50+rr()*70,xc=wrap(L0+t*(60+120*storm)*(1+.2*k),x0,x1);const pts:Pt[]=[];for(let u=-1;u<=1.01;u+=.25)pts.push([xc+u*len/2,top(xc+u*len/2)-3-4*(1-u*u)]);crests.addPath(ribbon(pts,7+6*storm,{seed:seed+k*7+i,taper:.85,pressure:.2,wobble:.6,step:12}));any=true;}}
 if(any)s.knockout(crests,.95);
}
/** the pitch: cream ground with a faint blue halftone under the torn horizon, two mow bands, blue lines (a box corner; `side` = a touchline x). */
function pitch(s:Sheet,seed:number,o:{x1?:number;box?:boolean;side?:number}={}){
 const{x1=1800,box=true,side}=o,xe=Math.min(x1,1800);
 s.tone(B,bandPath(HZ,HZ+2400,0,seed,10,{x0:-1800,x1:xe,step:80}),.3);
 s.tone(B,bandPath(HZ+120,HZ+175,0,seed+1,8,{x0:-1800,x1:xe,step:100}),.42);
 s.tone(B,bandPath(HZ+300,HZ+370,0,seed+2,8,{x0:-1800,x1:xe,step:100}),.42);
 const lines=new Path2D();lines.addPath(ribbon([[-1800,290],[xe,294]],11,{seed:seed+3,pressure:.3,taper:0,wobble:1.5,step:80}));
 if(box&&xe>420){lines.addPath(ribbon([[400,292],[404,HZ+34]],9,{seed:seed+4,taper:0,wobble:1.5,step:60}));lines.addPath(ribbon([[400,HZ+34],[xe,HZ+36]],7,{seed:seed+5,taper:0,wobble:1.5,step:80}));}
 else lines.addPath(ribbon([[-1800,HZ+34],[xe,HZ+36]],7,{seed:seed+5,taper:0,wobble:1.5,step:80}));
 if(side!==undefined)lines.addPath(ribbon([[side,300],[side+4,HZ+30]],9,{seed:seed+6,taper:0,wobble:1.5,step:60}));
 s.fill(B,lines,.85);
}

// ---------------- the boat, the ball, the feeling, sparks ----------------
/** the sailor's default arms: back hand on the tiller, front hand on the mainsheet. */
const SAIL_ARMS:Limb[]=[[[-.16,-.6],[-.36,-.5],[-.52,-.33]],[[.16,-.6],[.3,-.5],[.4,-.36]]];
const ARMS_OUT:Limb[]=[[[-.13,-.6],[-.34,-.63],[-.54,-.68]],[[.13,-.6],[.34,-.63],[.54,-.68]]];
const ARM_BACK_UP:Limb=[[-.16,-.6],[-.22,-.86],[-.24,-1.1]];
const ARM_FRONT_UP:Limb=[[.16,-.6],[.24,-.86],[.28,-1.1]];
const ARM_FRONT_POINT:Limb=[[.16,-.6],[.34,-.7],[.52,-.82]];
type BoatOpts={hull:string;crew:string;seed:number;scale?:number;heel?:number;trim?:number;belly?:number;flutter?:number;tint?:number;pose?:Pose;arms?:Limb[];tilt?:number;scaleX?:number;headDrop?:Pt;facing?:number;flag?:number;flagWave?:number;wake?:number;spray?:number};
const SEAT:Pt=[-80,-30],CREW=262;
/** the rig in boat-local units: head, tack, clew (foot 236 eased → 137 trimmed), the leech normal (leeward) and the cloth centre. */
function rig(trim:number,belly:number){const head:Pt=[30,-432],tack:Pt=[36,-122],clew:Pt=[36+236*(1-.42*trim),-118+26*trim],ex=clew[0]-head[0],ey=clew[1]-head[1],el=Math.hypot(ex,ey)||1,nx=ey/el,ny=-ex/el;
 return{head,tack,clew,ex,ey,nx,ny,centre:[(head[0]+tack[0]+clew[0])/3+nx*belly*.3,(head[1]+tack[1]+clew[1])/3+ny*belly*.3] as Pt};}
/** the crew's chest in boat-local units for a pose and tilt (30 % down from the shoulders). */
function chestLocal(pose:Pose,extra:number):Pt{const Q=POSES[pose],tilt=Q.tilt+extra,hip=Q.hip,ct=Math.cos(tilt),st=Math.sin(tilt),dx=Q.top[0]-hip[0],dy=Q.top[1]-hip[1],top:Pt=[hip[0]+dx*ct-dy*st,hip[1]+dx*st+dy*ct];
 return[SEAT[0]+lerp(top[0],hip[0],.3)*CREW,SEAT[1]+lerp(top[1],hip[1],.3)*CREW];}
/** boat-local → world for a boat at (x,y) heeled by `heel` and scaled. */
const boatW=(x:number,y:number,heel:number,scale=1)=>{const c=Math.cos(heel),sn=Math.sin(heel);return(p:Pt):Pt=>[x+(p[0]*c-p[1]*sn)*scale,y+(p[0]*sn+p[1]*c)*scale];};
/** the boat from the side: paper sail with a wobbly cut edge (belly to leeward, flutter when flogging), navy mast + boom, the crew seated
 * (legs hidden by the hull), the mainsheet from the clew to the front hand, an ORANGE (or blue) hull with a paper stripe and a navy contour,
 * the tiller at the stern, an optional flag on a pole from the back hand, wake streaks and bow spray. Heel rotates the whole boat about
 * its waterline centre (x,y). Returns world points (sail centre, chest, head, back hand, clew). */
function boat(s:Sheet,x:number,y:number,o:BoatOpts){
 const{hull,crew,seed,scale=1,heel=0,trim=0,belly=0,flutter=0,tint=0,pose='sit',arms=SAIL_ARMS,tilt=0,scaleX=1,headDrop,facing=1,flag=0,flagWave=0,wake=0,spray=0}=o;
 const W=boatW(x,y,heel,scale),{head,tack,clew,ex,ey,nx,ny,centre}=rig(trim,belly);
 s.save();s.translate(x,y);s.rotate(heel);s.scale(scale);
 const leech:Pt[]=[];for(let i=0;i<=8;i++){const u=i/8,off=belly*Math.sin(u*Math.PI)+flutter*Math.sin(u*7+seed)*u;leech.push([head[0]+ex*u+nx*off,head[1]+ey*u+ny*off]);}
 const cloth=wob([...leech,tack],3,seed,true,{step:14,corner:.5}),cp=polyPath(cloth,true);
 s.knockout(cp,.95);if(tint>0)s.tone(P,cp,tint);
 const seams=new Path2D();for(const u of[.38,.68]){const a:Pt=[lerp(head[0],tack[0],u),lerp(head[1],tack[1],u)],b:Pt=[lerp(head[0],clew[0],u)+nx*belly*Math.sin(u*Math.PI)*.8,lerp(head[1],clew[1],u)+ny*belly*Math.sin(u*Math.PI)*.8];seams.addPath(ribbon([a,b],4,{seed:seed+Math.round(u*10),taper:.4,wobble:1.2,step:16}));}s.fill(K,seams,.5);
 contour(s,K,cloth,7,{close:true,seed:seed+1,pressure:.5,wobble:2.5});
 s.fill(K,ribbon([[30,-58],[30,-446]],13,{seed:seed+2,taper:.15,pressure:.2,wobble:1,step:30}));
 s.fill(K,ribbon([[34,-118],clew],9,{seed:seed+3,taper:.1,wobble:1,step:30}));
 const f=figure(s,SEAT[0],SEAT[1],CREW,crew,seed+10,pose,{facing,arms,tilt,scaleX,headDrop});
 const h=f.hands[1];s.fill(K,ribbon([clew,[lerp(clew[0],h[0],.5),lerp(clew[1],h[1],.5)+22],h],5,{seed:seed+4,taper:.2,wobble:1.2,step:20}),.9);
 const HULL=wob([[-192,-44],[-70,-58],[110,-62],[206,-76],[196,-14],[150,30],[60,54],[-70,50],[-160,28],[-190,-4]],3,seed+5,true,{step:14,corner:.6}),hp=polyPath(HULL,true);
 s.knockout(hp,.95);s.fill(hull,hp,.95);
 s.knockout(ribbon([[-172,-18],[196,-40]],13,{seed:seed+6,taper:.1,wobble:1.5,step:24}),.95);
 contour(s,K,HULL,9,{close:true,seed:seed+7,pressure:.6,wobble:1.5});
 s.fill(K,ribbon([[-168,-46],[-216,-102]],12,{seed:seed+8,taper:.15,wobble:1}));
 if(flag>0){const hd=f.hands[0],top:Pt=[hd[0],hd[1]-120*flag];s.fill(K,ribbon([hd,top],6,{seed:seed+9,taper:0,wobble:.6}));const fl=wob([[top[0],top[1]],[top[0]+72*flag,top[1]+20*flag+flagWave],[top[0],top[1]+42*flag]],1.5,seed+11,true,{step:8,corner:.5});s.fill(O,polyPath(fl,true),.95);}
 if(wake>0){const wk=new Path2D();for(let i=0;i<3;i++){const y0=6+i*16,L=(90+i*40)*wake;wk.addPath(ribbon([[-196,y0],[-196-L,y0+4+i*3]],7-i,{seed:seed+12+i,taper:.8,wobble:.8,step:20}));}s.knockout(wk,.9);}
 if(spray>0)dust(s,null,214,-10,60*spray,7,{seed:seed+15,size:7,cov:.9});
 s.restore();
 return{sail:W(centre),chest:W(chestLocal(pose,tilt)),head:W(f.head),hands:[W(f.hands[0]),W(f.hands[1])] as [Pt,Pt],clew:W(clew)};
}
/** the story's ball: a paper football with navy pentagons (blue shadow crescent) and a navy ground shadow. */
function ball(s:Sheet,x:number,y:number,r:number,rot:number,o:{sx?:number;sy?:number;shadow?:number}={}){
 const{sx=1,sy=1,shadow=1}=o;if(shadow>0)s.tone(K,polyPath(blob(x,GY-r*.02,r*1.1*shadow,r*.26*shadow,9,{amp:.06,n:18}),true),.25);
 s.save();s.translate(x,y);s.scale(sx,sy);footballPanels(s,0,0,r,{rot,key:K,shadow:B,seed:5,light:[-.4,-.5]});s.restore();
}
/** the feeling: a purple knot (boiling blob) on a paper knockout so it reads on the navy torso. */
function knot(s:Sheet,x:number,y:number,r:number,seed:number,o:{boil?:number;cov?:number}={}){
 const{boil=0,cov=.85}=o;if(r<=1)return;const p=polyPath(blob(x,y,r*1.1,r*.9,seed+boil,{amp:.2,n:22,rot:-.4}),true);s.knockout(p,.95);s.fill(P,p,cov);
}
/** a paper-and-ink spark (a whistle, a call, a landing). */
function spark(s:Sheet,x:number,y:number,age:number,seed:number,r=90,ink=P){
 if(age<0||age>1)return;const g=easeOutBack(clamp(age/.35))*(1-.5*clamp((age-.5)/.5));if(g<=0)return;const rr=rng(seed),p=new Path2D();
 for(let i=0;i<8;i++){const a=i/8*TAU+(rr()-.5)*.4,r0=r*.35,r1=r*(.8+rr()*.5)*g;p.addPath(ribbon([[x+Math.cos(a)*r0,y+Math.sin(a)*r0],[x+Math.cos(a)*r1,y+Math.sin(a)*r1]],r*.13*(.7+rr()*.6),{seed:seed+i,taper:.8,pressure:.4,wobble:.8}));}
 s.knockout(p,.95);s.fill(ink,p,.95);
}
/** a sight wedge from the head toward `ang` (the look): paper knocked out, blue screen. */
function sight(s:Sheet,x:number,y:number,ang:number,half:number,L:number,seed:number,g=1){
 if(g<=0)return;const pts:Pt[]=[[x,y]];for(let i=0;i<=8;i++){const a=ang-half+2*half*i/8;pts.push([x+Math.cos(a)*L*g,y+Math.sin(a)*L*g]);}
 const p=polyPath(wob(pts,6,seed,true,{step:26,corner:.5}),true);s.knockout(p,.5);s.tone(B,p,.45);
}
/** an open-space pool on the pitch: a paper ellipse. */
function pool(s:Sheet,x:number,y:number,g:number,seed:number){if(g<=0)return;const p=polyPath(blob(x,y,210*g,46*g,seed,{amp:.08,n:28}),true);s.knockout(p,.9);}
/** a position marker on the pitch: a blue dashed (or solid) ellipse. */
function spot(s:Sheet,x:number,y:number,g:number,solid:number,seed:number){if(g<=0)return;s.fill(B,ribbon(blob(x,y,96*g,30*g,seed,{amp:.03,n:32}),9,{seed,close:true,wobble:1.2,gaps:solid>=1?[]:[[.08,.18],[.33,.43],[.58,.68],[.83,.93]]}),.9);}

// ---------------- chapter 1: the pitch — a strange bounce, an opponent, a decision ----------------
function ch1Ball(t:number){
 let x:number,y=189,rot:number,fly=false,c=0;const r0=590/46;
 if(t<2.8){x=lerp(-920,-330,clamp(t/2.8));rot=(x+920)/46;}
 else if(t<3.65){const u=(t-2.8)/.85,p=arc([-330,189],[30,189],u,390);x=p[0];y=p[1];rot=r0+u*7;fly=true;}
 else if(t<3.95){const u=(t-3.65)/.3,p=arc([30,189],[70,189],u,40);x=p[0];y=p[1];rot=r0+7+u;fly=true;}
 else{const u=sm(3.95,4.3,t,easeOut),nudge=sm(4.9,5.1,t,easeOut);x=lerp(70,92,u)-14*nudge;rot=r0+8+u*.5-nudge*.3;c=t<4.5?settle(t,3.95,{amp:.1,freq:4,decay:5,phase:Math.PI/2}):t>=4.9&&t<5.3?.06*(1-sm(5.1,5.3,t)):0;}
 return{x,y,rot,fly,sx:1+c,sy:1-c};
}
const ch1:Scene={
 draw(s,t){
  const ti=twosIndex(t),b=ch1Ball(t),st=stride(ti);
  cam(s,t,[[0,-220,30,1],[2.6,-220,30,1.02],[2.95,-140,-10,1.04],[3.7,-20,-20,1.06],[4.2,-20,-20,1.06],[4.9,60,10,1.08],[5.3,60,10,1.08],[5.7,180,0,1.08],[6.7,180,0,1.08],[7.4,120,40,1.15],[9.233,b.x,b.y,2.1]]);
  sky(s);front(s,[[-1800,-330],[-1200,-300],[-700,-360],[-200,-320],[300,-400],[900,-340],[1800,-380]],[[1800,-4000],[-1800,-4000]],11,{cov:.32,teeth:40});
  pitch(s,12);
  // the divot the ball hits
  const bump=polyPath(blob(-330,246,62,15,13,{amp:.12,n:18}),true);s.knockout(bump,.9);s.tone(B,bump,.6);
  if(t>=2.8&&t<3.3)dust(s,null,-330,222,60,8,{seed:14,size:7,cov:.9*(1-sm(2.9,3.3,t))});
  // the opponent runs in and steps onto the ball
  const run=t<4.2?0:anticipate(4.2,4.85,t,{back:.03,hold:.15,e:easeIO}),moving=t>=4.2&&run<1;
  if(t>=4.2){const ox=lerp(860,150,clamp(run))+(t>4.85?14*settle(t,4.85,{amp:1,freq:4,decay:5}):0),take=sm(4.9,5.1,t,easeOut)*(1-.6*sm(5.4,5.9,t));
   figure(s,ox,GY,330,O,21,moving?'run':'stand',{facing:-1,legs:moving?st.legs:undefined,arms:moving?st.arms:undefined,tilt:moving?.12:.1*take});
   if(moving&&run<.8)speedLines(s,K,ox+50,GY-140,Math.PI,{n:4,seed:22+ti,len:120,spread:50,width:6,cov:.85});}
  // the referee walks in and raises an arm (the decision)
  if(t>=5.3){const walk=sm(5.3,5.55,t,easeOut),rx=lerp(760,520,walk),up=t<5.5?0:clamp(easeOutBack(sm(5.5,5.85,t)),0,1.15),mv=walk<1;
   const arms:Limb[]=[[[-.16,-.6],[lerp(-.24,-.2,up),lerp(-.46,-.86,up)],[lerp(-.23,-.22,up),lerp(-.3,-1.1,up)]],[[.16,-.6],[.24,-.46],[.23,-.3]]];
   const rf=figure(s,rx,GY,320,P,31,mv?'walk':'stand',{facing:-1,legs:mv?st.legs:undefined,arms:mv?st.arms:arms});
   spark(s,rf.hands[0][0],rf.hands[0][1]-12,t-5.85,32,80,P);}
  // the player: watches the ball go over, turns after it, throws both arms up at the decision, lowers them and looks at the ball
  const look=sm(2.9,3.2,t)*(1-sm(3.6,4.0,t)),face=t<3.25?-1:1,up=t<5.75?0:clamp(easeOutBack(sm(5.75,6.05,t)),0,1.1)*(1-sm(6.7,7.4,t)),stL=poseLimbs('stand'),rL=poseLimbs('reach'),toBall=sm(7.0,7.5,t);
  figure(s,-120,GY,350,K,41,'stand',{facing:face,arms:mixLimbs(stL.arms,rL.arms,clamp(up)),tilt:.06*(1-sm(2.8,3.2,t))-.06*clamp(up),head:look>0?[0,-.82-.1*look]:toBall>0?[.1*toBall,-.82]:undefined});
  ball(s,b.x,b.y,46,b.rot,{sx:b.sx,sy:b.sy,shadow:b.fly?.45:1});
  if(b.fly)speedLines(s,K,b.x-20,b.y+10,0,{n:4,seed:51+ti,len:90,width:5,cov:.8});
 },
 aperture(t){const b=ch1Ball(t);return apertureDisc(b.x,b.y,14,5,b.rot);},still:5.9,
};

// ---------------- chapter 2: the sea — a gust knocks the boat over; ADJUST the sail; ask for help ----------------
function ch2Rig(t:number){
 const g1=gust(t,.3,.9,2.9),g2=gust(t,2.74,3.3,5.2),g=clamp(g1+g2),gi=gustInt(t,.3,.9,2.9)+gustInt(t,2.74,3.3,5.2);
 const heel=key(t,[[0,2],[.3,-2],[.9,26],[2.74,24],[3.3,29],[4.86,26],[5.05,30],[5.55,3],[5.8,9],[6.2,6]])*D;
 const trim=key(t,[[0,0],[4.86,0],[5.05,-.08],[5.45,1]]),belly=key(t,[[0,0],[5.1,0],[5.5,62],[5.7,70],[6.0,64]]);
 const flutter=(5*(1-sm(0,.3,t))+24*g)*(1-sm(5.1,5.4,t)),x=150*sm(5.5,7.6,t,easeOut),wake=sm(5.5,6,t)*(1-.3*sm(7,7.6,t));
 return{g,gi,heel,trim,belly,flutter,x,wake};
}
function ch2Sailor(t:number,ti:number):{arms:Limb[];tilt:number;flag:number}{
 const k=ti%2?1:-1,wave=sm(2.9,3.1,t)*(1-sm(4.4,4.6,t)),waveArm:Limb=[[-.16,-.6],[-.24+.05*k,-.8],[-.28+.12*k,-.98]];
 const haul=key(t,[[4.55,0],[4.86,1],[5.35,0]]),rL=poseLimbs('reach').arms,flagUp=sm(6.5,6.7,t),flag=t<6.66?0:clamp(easeOutBack(sm(6.66,7.0,t)),0,1.1);
 let arms=mixLimbs(SAIL_ARMS,[waveArm,SAIL_ARMS[1]],wave);arms=mixLimbs(arms,rL,haul);arms=mixLimbs(arms,[ARM_BACK_UP,SAIL_ARMS[1]],flagUp);
 return{arms,tilt:-.14*haul+.03*Math.sin(t*2.1),flag};
}
function ch2Boat(s:Sheet,t:number){
 const R=ch2Rig(t),ti=twosIndex(t),S=ch2Sailor(t,ti),w=waveAt(R.x,t,.15,21);
 return boat(s,R.x,WL+.55*w.lift,{hull:O,crew:K,seed:20,heel:R.heel+w.slope*.4,trim:R.trim,belly:R.belly+(R.flutter>8?18*(ti%2?1:-1):0),flutter:R.flutter*(ti%2?1:-1),arms:S.arms,tilt:S.tilt,flag:S.flag,flagWave:6*(ti%2?1:-1)*S.flag,wake:R.wake,spray:sm(.9,1.1,t)*(1-sm(1.5,2.2,t))});
}
const ch2:Scene={
 draw(s,t){
  const R=ch2Rig(t),sailC=ch2SailAt(t);
  cam(s,t,[[0,-40,-110,1],[.9,10,-120,1.02],[2.74,10,-120,1.02],[3.3,50,-110,1.04],[4.86,50,-110,1.04],[5.3,30,-120,1.06],[6.66,120,-130,1.1],[7.3,200,-140,1.14],[8.033,sailC[0],sailC[1],1.7]],[22*R.g,0],.1*R.heel);
  sky(s);
  const dy=key(t,[[0,-260],[1.0,0]]);front(s,[[-1800,-300+dy],[-1100,-250+dy],[-400,-330+dy],[200,-290+dy],[800,-380+dy],[1300,-320+dy],[1800,-360+dy]],[[1800,-4000],[-1800,-4000]],23,{cov:.5,teeth:50});
  sea(s,t,.15,21,[0]);
  // help answers: a small blue boat pops up on the horizon and its crew waves
  const ans=t<7.0?0:clamp(easeOutBack(sm(7.0,7.5,t)),0,1.1);
  if(ans>0)boat(s,450,HZ+45,{hull:B,crew:B,seed:60,scale:.55*ans,heel:4*D,trim:1,belly:50,arms:[ARM_BACK_UP,SAIL_ARMS[1]]});
  sea(s,t,.15,21,[1]);
  ch2Boat(s,t);
  sea(s,t,.15,21,[2,3,4],{knock:true});
  wind(s,t,R.g,R.gi,24,{n:9,cov:.55,box:[-1500,-520,3000,640]});
  },
 aperture(t){const c=ch2SailAt(t);return apertureDisc(c[0],c[1],46,12);},still:6.0,
};
/** the sail centre in world space (pure: the same rig at t). */
function ch2SailAt(t:number):Pt{const R=ch2Rig(t),w=waveAt(R.x,t,.15,21);return boatW(R.x,WL+.55*w.lift,R.heel+w.slope*.4)(rig(R.trim,R.belly).centre);}

// ---------------- chapter 3: the sea — the storm slams in; notice the feeling; BREATHE ----------------
function ch3State(t:number){
 const storm=sm(0,.8,t,easeIn)*(1-.7*sm(4.76,7.5,t,easeOut)),g=gust(t,0,.55,2.2),edgeX=lerp(-1300,420,sm(0,.55,t,easeIn))-260*sm(4.76,7.5,t,easeOut);
 const slump=sm(.5,1.0,t)*(1-sm(4.76,6.2,t,easeOut)),inh=sm(4.76,6.2,t,easeOut),exh=sm(6.4,7.6,t,easeOut);
 return{storm,g,edgeX,slump,inh,exh};
}
function ch3Boat(s:Sheet,t:number){
 const S=ch3State(t),ti=twosIndex(t),w=waveAt(0,t,S.storm,31),sl=poseLimbs('sitSlump').arms;
 return boat(s,0,WL+.55*w.lift,{hull:O,crew:K,seed:30,heel:(8+10*S.g)*D+w.slope*.7,trim:1,belly:60-10*S.g,flutter:(2+7*S.storm)*(ti%2?1:-1),tint:.12*S.storm,arms:mixLimbs(SAIL_ARMS,sl,S.slump),tilt:.28*S.slump-.03*S.inh,scaleX:1+.2*S.inh*(1-.5*S.exh),headDrop:[.03*S.slump,.08*S.slump-.03*S.inh]});
}
const ch3RingR=(t:number)=>key(t,[[3.9,76],[4.76,80],[6.2,120],[7.16,124],[7.6,172],[7.9,164],[9.3,170]]);
const ch3:Scene={
 draw(s,t){
  const S=ch3State(t),ti=twosIndex(t),w=waveAt(0,t,S.storm,31),chest=ch3ChestAt(t);
  const shove=40*settle(t,.55,{amp:1,freq:3,decay:5});
  cam(s,t,[[0,-30,-100,1],[.55,40,-100,1.06,.04],[1.1,20,-100,1.06,.02],[3.5,20,-100,1.06,.02],[4.2,-40,-40,1.3,0],[4.76,-40,-40,1.3,0],[7.16,-50,-30,1.42,0],[9.233,chest[0],chest[1],1.6,0]],[shove+80*w.slope*S.storm,.3*w.lift*S.storm],.06*w.slope*S.storm);
  sky(s);
  const smear=S.edgeX<420&&t<.6?(ti%2?70:0):0,ex=S.edgeX;
  front(s,[[ex+90+smear,-4000],[ex+30,-500],[ex+70,-250],[ex-30,-40],[ex+20,HZ+40]],[[-4000,HZ+40],[-4000,-4000]],33,{cov:.85,dark:.3,teeth:70});
  sea(s,t,S.storm,31,[0,1]);
  ch3Boat(s,t);
  sea(s,t,S.storm,31,[2,3,4],{knock:true});
  wind(s,t,S.g*.7,gustInt(t,0,.55,2.2)*.7,34,{n:7,cov:.5,box:[-1500,-520,3000,640]});
  const rainCov=key(t,[[0,0],[.5,.42],[4.76,.42],[7.2,.14]]);
  rain(s,t,rainCov,35,{n:230,clip:polyPath([[-4000,-4000],[ex+40,-4000],[ex+40,4000],[-4000,4000]],true)});
  // the feeling: a knot pops on the chest at 3.5 and boils until the breath; the ring draws round it and grows with the breath
  const pop=t<3.5?0:clamp(easeOutBack(sm(3.5,3.8,t)),0,1.1),kr=38*pop*(1-.5*S.exh);
  knot(s,chest[0],chest[1],kr,36,{boil:t<4.76?ti%3:0,cov:.85});
  if(t>=3.9){const R=ch3RingR(t),prog=sm(3.9,4.6,t,easeOut),pts=blob(chest[0],chest[1],R,R*.96,37,{amp:.05,n:36}),q=prog>=1?pts:partial(smoothPts(pts,true,6),prog);
   if(q.length>1){s.fill(K,ribbon(q,20,{seed:38,taper:prog>=1?0:.4,wobble:1.2,pressure:.3,close:prog>=1}),.95);s.knockout(ribbon(q,10,{seed:39,taper:prog>=1?0:.5,wobble:1,pressure:.2,close:prog>=1}),.95);}}
  // the breath out: a paper puff drifts from the head
  if(t>=7.6){const u=sm(7.6,8.6,t,easeOut);s.knockout(polyPath(blob(chest[0]+90+150*u,chest[1]-120-40*u,26+50*u,20+36*u,40,{amp:.1,n:20}),true),.9*(1-u));}
 },
 aperture(t){const c=ch3ChestAt(t);return apertureDisc(c[0],c[1],ch3RingR(t)*.5,12);},still:6.8,
};
/** the sailor's chest in world space (pure). */
function ch3ChestAt(t:number):Pt{const S=ch3State(t),w=waveAt(0,t,S.storm,31);return boatW(0,WL+.55*w.lift,(8+10*S.g)*D+w.slope*.7)(chestLocal('sit',.28*S.slump-.03*S.inh));}

// ---------------- chapter 4: the pitch — recover, check the shoulder, show, ONE ACTION ----------------
function ch4Player(t:number){const run=t<1.8?0:anticipate(1.8,2.6,t,{back:.04,hold:.15,e:easeIO}),step=sm(6.0,6.7,t,easeIO);
 const x=t<6.0?lerp(-40,-300,clamp(run))+(t>2.6?12*settle(t,2.6,{amp:1,freq:4,decay:5}):0):lerp(-300,-120,step);
 return{x,running:t>=1.8&&run<1,stepping:step>0&&step<1,face:t<1.8?1:t<3.0?-1:1};}
function ch4Ball(t:number){const u=sm(7.7,8.45,t,easeIO),p=arc([320,189],[-60,189],u,50),c=t>8.45?settle(t,8.45,{amp:.08,freq:4,decay:5,phase:Math.PI/2}):0;return{x:p[0],y:p[1],rot:-u*6,sx:1+c,sy:1-c,flying:u>0&&u<1};}
const ch4:Scene={
 draw(s,t){
  const ti=twosIndex(t),st=stride(ti),m=ch4Player(t),b=ch4Ball(t);
  cam(s,t,[[0,-40,20,1],[1.6,-40,20,1.02],[2.7,-200,10,1.06],[4.36,-200,10,1.06],[4.9,-260,0,1.1,-.05],[5.8,-260,0,1.1,-.05],[6.4,-80,10,1.1,0],[7.6,100,20,1.12,0],[8.5,-20,60,1.2,0],[10.133,b.x,b.y,2.1,0]]);
  sky(s);front(s,[[-1800,-380],[-1200,-330],[-600,-400],[0,-360],[600,-420],[1200,-350],[1800,-400]],[[1800,-4000],[-1800,-4000]],41,{cov:.3,teeth:40});
  pitch(s,42);
  spot(s,-300,252,t<1.4?0:clamp(easeOutBack(sm(1.4,1.7,t)),0,1.1),sm(2.6,2.8,t),43);
  pool(s,-110,254,t<5.9?0:clamp(easeOutBack(sm(5.9,6.2,t)),0,1.1),44);
  // the opponent behind the shoulder: leaning in, revealed by the look; steps back when the player opens up
  const back=sm(6.0,6.6,t,easeOut);figure(s,-560-30*back,GY,320,O,45,'lean',{facing:1,tilt:-.1*back});
  // the player: attention (head lifts), sprint back to the spot, shoulder check with a sight wedge, arms out and a step, cushion
  const lk=key(t,[[4.36,0],[4.5,-.15],[4.9,1],[5.6,1],[6.0,0]]),out=sm(5.95,6.3,t,easeOut)*(1-sm(8.6,9.2,t)),cush=t>=8.45&&t<8.65?.06:0,stL=poseLimbs('stand'),att=sm(.3,.7,t)*(1-sm(1.4,1.8,t));
  const moving=m.running||m.stepping;
  const f=figure(s,m.x,GY,350,K,46,moving?'run':'stand',{facing:m.face,legs:moving?st.legs:undefined,arms:moving?st.arms:mixLimbs(stL.arms,ARMS_OUT,out),head:!moving&&lk>0?[-.12*lk,-.82]:!moving&&att>0?[0,-.82-.05*att]:undefined,tilt:moving?.12*(m.running?1:.5):-.04*lk+cush,scaleX:1+cush});
  sight(s,f.head[0],f.head[1],Math.PI,.16,300,47,sm(4.9,5.2,t)*(1-sm(5.6,6.0,t)));
  if(m.running)speedLines(s,K,m.x+40,GY-130,Math.PI,{n:4,seed:48+ti,len:120,spread:50,width:6,cov:.85});
  if(t>=2.6&&t<3.2)dust(s,null,m.x,GY,50,7,{seed:49,size:6,cov:.9*(1-sm(2.6,3.2,t))});
  // the teammate loads and kicks the pass on "one clear action"
  const load=sm(7.5,7.7,t)*(1-sm(7.7,7.95,t)),kicked=t>=7.7&&t<7.95;
  figure(s,380,GY,330,B,50,kicked?'kick':'stand',{facing:-1,tilt:-.1*load});
  ball(s,b.x,b.y,46,b.rot,{sx:b.sx,sy:b.sy,shadow:b.flying?.5:1});
  if(b.flying)speedLines(s,K,b.x+50,b.y,Math.PI,{n:4,seed:51+ti,len:80,width:4,cov:.8});
  spark(s,-60,189,t-8.45,52,90,B);
 },
 aperture(t){const b=ch4Ball(t);return apertureDisc(b.x,b.y,14,5,b.rot);},still:8.6,
};

// ---------------- chapter 5: the shore — two boats share the wind; a pair covers space; the coach points; TOGETHER ----------------
function ch5Boats(t:number){
 const g=gust(t,.3,.9,2.6),gi=gustInt(t,.3,.9,2.6);
 const my={heel:key(t,[[0,4],[.3,0],[.9,22],[1.2,22],[1.4,25],[1.8,5],[2.1,9],[2.5,6]])*D,trim:key(t,[[0,0],[1.2,0],[1.4,-.1],[1.8,1]]),belly:key(t,[[0,0],[1.45,0],[1.8,60],[2,66],[2.3,62]]),flutter:14*(1-sm(1.5,1.75,t)),x:560+90*sm(1.8,3.6,t,easeOut),wake:sm(1.8,2.3,t)};
 const tm={heel:key(t,[[0,3],[.4,0],[1.0,18],[1.9,18],[2.1,21],[2.5,4],[2.8,8],[3.2,5]])*D,trim:key(t,[[0,0],[1.9,0],[2.1,-.1],[2.5,1]]),belly:key(t,[[0,0],[2.15,0],[2.5,55],[2.7,60]]),flutter:12*(1-sm(2.2,2.45,t)),x:830+60*sm(2.5,4.3,t,easeOut),wake:sm(2.5,3,t)};
 return{g,gi,my,tm};
}
const ch5TmX=(t:number)=>lerp(-140,-440,t<5.9?0:anticipate(5.9,6.7,t,{back:.04,hold:.15,e:easeIO}))+(t>6.7?10*settle(t,6.7,{amp:1,freq:4,decay:5}):0);
const ch5:Scene={
 draw(s,t){
  const ti=twosIndex(t),st=stride(ti),Bt=ch5Boats(t),tmx=ch5TmX(t);
  cam(s,t,[[0,600,-80,1],[.9,620,-90,1.02],[2.4,620,-90,1.02],[3.4,660,-110,1.04],[5.0,660,-110,1.04],[6.2,-300,20,1.06],[8.24,-360,20,1.06],[9.4,-740,20,1.08],[10.333,tmx,GY-155,1.9]],[22*Bt.g,0]);
  sky(s);front(s,[[-1800,-380],[-1100,-330],[-400,-400],[300,-300],[1000,-360],[1800,-300]],[[1800,-4000],[-1800,-4000]],61,{cov:.42,teeth:50});
  pitch(s,63,{x1:60,box:false,side:-980});
  sea(s,t,.2,64,[0,1],{x0:0});
  // the boats: the blue one further off; both heel in the gust, trim, right and move — sharing the wind
  const call=sm(2.4,2.8,t,easeOut)*(1-sm(4.6,5.0,t)),answer=sm(3.0,3.4,t,easeOut)*(1-sm(4.8,5.2,t));
  const wt=waveAt(Bt.tm.x,t,.2,64),wm=waveAt(Bt.my.x,t,.2,64);
  const tb=boat(s,Bt.tm.x,WL-30+.4*wt.lift,{hull:B,crew:B,seed:70,scale:.85,heel:Bt.tm.heel+wt.slope*.4,trim:Bt.tm.trim,belly:Bt.tm.belly,flutter:Bt.tm.flutter*(ti%2?1:-1),arms:mixLimbs(SAIL_ARMS,[ARM_BACK_UP,SAIL_ARMS[1]],answer),wake:Bt.tm.wake});
  const haul=key(t,[[1.0,0],[1.2,1],[1.7,0]]),rL=poseLimbs('reach').arms;
  const mb=boat(s,Bt.my.x,WL+.55*wm.lift,{hull:O,crew:K,seed:80,heel:Bt.my.heel+wm.slope*.4,trim:Bt.my.trim,belly:Bt.my.belly,flutter:Bt.my.flutter*(ti%2?1:-1),arms:mixLimbs(mixLimbs(SAIL_ARMS,rL,haul),[SAIL_ARMS[0],ARM_FRONT_POINT],call),tilt:-.14*haul,wake:Bt.my.wake,spray:sm(.9,1.1,t)*(1-sm(1.5,2.2,t))});
  spark(s,mb.hands[1][0]+20,mb.hands[1][1]-10,t-2.8,81,70,K);
  spark(s,tb.hands[0][0],tb.hands[0][1]-10,t-3.4,82,60,B);
  sea(s,t,.2,64,[2,3,4],{x0:0,knock:true});
  wind(s,t,Bt.g,Bt.gi,62,{n:9,cov:.5,box:[-200,-520,2000,640]});
  // the pitch: a pool of open space; the player and the teammate shift left as a pair; the opponent, met, leans back and turns away
  pool(s,-620,254,t<5.56?0:clamp(easeOutBack(sm(5.56,5.9,t)),0,1.1),65);
  const shift=t<5.9?0:anticipate(5.9,6.7,t,{back:.04,hold:.15,e:easeIO}),moving=t>=5.9&&shift<1;
  const px=lerp(-300,-600,clamp(shift))+(t>6.7?10*settle(t,6.7,{amp:1,freq:4,decay:5}):0);
  const met=sm(6.8,7.3,t,easeOut),away=sm(7.3,7.7,t);
  figure(s,-800-20*met,GY,320,O,66,'lean',{facing:away>=.5?-1:1,tilt:-.3*met*(1-away)+.05*away});
  const lk=key(t,[[8.4,0],[8.55,-.15],[8.9,1],[9.6,1],[10.0,0]]),nod=t>=9.0&&t<9.4?.03*Math.sin((t-9)/.4*TAU):0;
  figure(s,tmx,GY,330,B,67,moving?'run':'stand',{facing:-1,legs:moving?st.legs:undefined,arms:moving?st.arms:undefined,tilt:moving?.12:0});
  figure(s,px,GY,350,K,68,moving?'run':'stand',{facing:-1,legs:moving?st.legs:undefined,arms:moving?st.arms:undefined,head:!moving&&lk>0?[-.12*lk,-.82]:undefined,tilt:moving?.12:nod});
  if(moving&&shift<.8){speedLines(s,K,px+40,GY-130,Math.PI,{n:4,seed:69+ti,len:120,spread:50,width:6,cov:.85});speedLines(s,K,tmx+40,GY-130,Math.PI,{n:3,seed:71+ti,len:100,spread:40,width:5,cov:.8});}
  // the coach beyond the touchline points the way
  const pt=t<8.24?0:clamp(easeOutBack(sm(8.24,8.6,t)),0,1.1),stL=poseLimbs('stand'),ptL=poseLimbs('point');
  const cf=figure(s,-1080,GY,320,P,72,'stand',{facing:1,arms:mixLimbs(stL.arms,ptL.arms,clamp(pt))});
  spark(s,cf.hands[1][0]+20,cf.hands[1][1],t-8.6,73,70,P);
 },
 aperture(t){return apertureDisc(ch5TmX(t),GY-155,28,12);},still:7.0,
};

// ---------------- chapter 6: the sea — rain continues; shoulders set; one more trim and a surge; WITH SUPPORT ----------------
function ch6State(t:number){
 const g=gust(t,.3,.9,2.6)+.7*gust(t,2.98,3.4,4.6),gi=gustInt(t,.3,.9,2.6)+.7*gustInt(t,2.98,3.4,4.6),storm=.5-.1*sm(6.78,8,t);
 const heel=key(t,[[0,10],[.3,8],[.9,18],[2.6,10],[2.98,10],[3.4,15],[4.98,13],[5.15,16],[5.5,7],[5.8,10],[6.3,8]])*D;
 const trim=key(t,[[0,.7],[4.98,.7],[5.15,.62],[5.4,1]]),belly=key(t,[[0,58],[4.98,58],[5.2,44],[5.45,78],[5.7,72]]);
 const x=200*sm(5.3,6.6,t,easeOut),tmx=lerp(820,600,t<6.78?0:anticipate(6.78,7.7,t,{back:.05,hold:.15,e:easeIO}))+(t>7.7?12*settle(t,7.7,{amp:1,freq:3,decay:4}):0);
 const tw=t+.9*Math.max(0,t-7.7);
 return{g,gi,storm,heel,trim,belly,x,tmx,tw};
}
const ch6:Scene={
 draw(s,t){
  const S=ch6State(t),ti=twosIndex(t);
  cam(s,t,[[0,0,-110,1],[.9,20,-115,1.02],[2.98,20,-115,1.02],[3.5,0,-110,1.04],[4.98,0,-110,1.04],[5.5,120,-110,1.06,-.02],[6.6,240,-110,1.08,0],[6.78,240,-110,1.08,0],[7.7,380,-120,1.12,0],[9.13,400,-120,1.14,0],[9.785,400,-120,1.14,0]],[22*S.g,0]);
  sky(s);front(s,[[-1800,-240],[-1100,-290],[-400,-230],[300,-300],[1000,-250],[1800,-310]],[[1800,-4000],[-1800,-4000]],91,{cov:.7,dark:.15,teeth:60});
  sea(s,S.tw,S.storm,93,[0,1]);
  // the blue boat ahead, then alongside; both sails trimmed
  const wt=waveAt(S.tmx,S.tw,S.storm,93),wm=waveAt(S.x,S.tw,S.storm,93);
  boat(s,S.tmx,WL-30+.4*wt.lift,{hull:B,crew:B,seed:100,scale:.85,heel:(6+8*S.g)*D+wt.slope*.5,trim:1,belly:58,flutter:(4+5*S.g)*(ti%2?1:-1),facing:1,wake:.5+.5*sm(7.7,8.2,t)});
  // my boat: shoulders set at 2.98, one more haul at 4.98 and a surge, then together
  const set=sm(2.98,3.5,t,easeOut),haul=key(t,[[4.8,0],[4.98,1],[5.4,0]]),rL=poseLimbs('reach').arms,hunch=1-set;
  boat(s,S.x,WL+.55*wm.lift,{hull:O,crew:K,seed:110,heel:S.heel+wm.slope*.6,trim:S.trim,belly:S.belly,flutter:(5+4*S.g)*(ti%2?1:-1)+(t>=5.2&&t<5.45?12*(ti%2?1:-1):0),tint:.1,arms:mixLimbs(SAIL_ARMS,rL,haul),tilt:.16*hunch-.06*set-.14*haul,scaleX:1+.1*set,headDrop:[.02*hunch,.06*hunch-.02*set],wake:sm(5.3,5.8,t)*(1-.4*sm(6.6,7.2,t))+.5*sm(7.7,8.2,t),spray:sm(5.4,5.6,t)*(1-sm(6.0,6.4,t))});
  sea(s,S.tw,S.storm,93,[2,3,4],{knock:true});
  wind(s,t,S.g,S.gi,92,{n:8,cov:.5,box:[-1500,-520,3000,640]});
  rain(s,t,key(t,[[0,.36],[2.98,.36],[3.5,.58],[4.6,.38]]),94,{n:220});
 },
 still:8.6,
};

export const story:RisoStory={
 id:'boat-weather',format:'11v11',title:'The Boat and the Weather',theme:'Finding what you can control',ageNote:'Direct reflections for older youth, roughly 12 and up; playing format does not define age.',
 spec:{paper:'#f0ece2',inks:{orange:'#ff6c2f',blue:'#0078bf',purple:'#765ba7',navy:'#22366b'},order:['orange','blue','purple','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:[
  {label:'Weather and response',narration:'Football brings moments you cannot choose: a strange bounce, an opponent, a decision you disagree with. What can you do next?',seconds:9.883,audio:CH+'01.m4a',cues:[{at:0,words:'Football brings'},{at:2.8,words:'a strange bounce'},{at:6.7,words:'What can you do'}]},
  {label:'Find your sail',headline:{text:'Adjust',at:4.86},narration:'Think of the game as changing weather. You cannot command the wind, but you can adjust your sail and ask for help.',seconds:8.683,audio:CH+'02.m4a',cues:[{at:0,words:'Think of the game'},{at:2.74,words:'cannot command'},{at:4.86,words:'adjust your sail'}]},
  {label:'Make some room',headline:{text:'Breathe',at:4.76},narration:'Frustration may arrive before you can stop it. Notice the feeling. Take a breath. Give yourself room to choose your response.',seconds:9.883,audio:CH+'03.m4a',cues:[{at:0,words:'Frustration may'},{at:3.5,words:'Notice the feeling'},{at:4.76,words:'Take a breath'}]},
  {label:'Choose an action',headline:{text:'One action',at:7.6},narration:'Bring your attention to something available now: recover into position, check your shoulder, or show for a pass. Choose one clear action.',seconds:10.783,audio:CH+'04.m4a',cues:[{at:0,words:'Bring your attention'},{at:4.36,words:'check your shoulder'},{at:7.6,words:'one clear action'}]},
  {label:'Work together',headline:{text:'Together',at:5.56},narration:'You can influence the next moment without controlling the result. Talk to a teammate, cover space together, and ask your coach when you need guidance.',seconds:10.983,audio:CH+'05.m4a',cues:[{at:0,words:'You can influence'},{at:5.56,words:'cover space together'},{at:8.24,words:'need guidance'}]},
  {label:'Your next response',headline:{text:'With support',at:6.78},narration:'Difficult weather may continue. You do not have to pretend it feels good. Find your next useful action, and take it with support.',seconds:9.785,audio:CH+'06.m4a',cues:[{at:0,words:'Difficult weather'},{at:2.98,words:'pretend it feels good'},{at:6.78,words:'take it with support'}]},
 ],
 draw(f){playChapters(story,f,[ch1,ch2,ch3,ch4,ch5,ch6]);},
 /** touch: a rain burst — six navy diagonal dashes, one paper wave crest that slaps up, and paper droplets falling with gravity. */
 touch(s,x,y,age,seed){
  const g=age<=0?1:gust(age,0,.15,.55);if(g<=0)return;
  const rr=rng(seed),p=new Path2D(),L=170*g,dx=.42,dy=.91;
  for(let i=0;i<6;i++){const ox=x-90+rr()*180,oy=y-110+rr()*140,w=8+rr()*6,l=L*(.6+rr()*.7);p.moveTo(ox,oy);p.lineTo(ox+dx*l,oy+dy*l);p.lineTo(ox+dx*l+dy*w,oy+dy*l-dx*w);p.lineTo(ox+dy*w,oy-dx*w);p.closePath();}
  s.fill(K,p,.92);
  const crest=age<=0?1:easeOutBack(clamp(age/.3))*(1-clamp((age-.5)/.3));if(crest>0){const pts:Pt[]=[];for(let u=-1;u<=1.01;u+=.2)pts.push([x+u*150*crest,y+40-30*crest*(1-u*u)]);s.knockout(ribbon(pts,12*crest+2,{seed:seed+3,taper:.8,pressure:.2,wobble:1,step:12}),.95);}
  if(age>0){const r2=rng(seed+7),q=new Path2D();for(let i=0;i<6;i++){const aa=-Math.PI/2+(r2()-.5)*1.4,v=160*(.5+r2()),px=x+Math.cos(aa)*v*age,py=y+Math.sin(aa)*v*age+420*age*age,r=7+r2()*7;q.moveTo(px+r,py);q.arc(px,py,r,0,TAU);}s.knockout(q,.9*(1-clamp((age-.5)/.3)));}
 },
};
