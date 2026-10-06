/** After the Final Whistle (loss) — riso rework (2026-09-21). ONE WORLD, side view: a PITCH at full time with a PUDDLE beside the
 * touchline; the player is a cut-paper pictogram (bible §1c.4, `figure()` below) and the ripples happen in the puddle the player sits beside.
 * Dusk sky: cream paper with soft orange halftone bands low on the horizon · pitch: yellow × blue = green with a paper touchline and a
 * real goal (posts, bar, net) · puddle: a paper-knocked blue pool with paper ripple rings · scoreboard: a navy paper board with DOT pips
 * (one vs two — marks, not digits) on posts · whistle: a paper whistle (barrel + mouthpiece) with burst lines.
 * Inks: yellow → orange → blue → navy on cream. Roles: navy = you, blue = teammates, orange = opponents / the coach / anger, yellow = the
 * useful thing (space, the lesson, the lamp). Drawn objects on twos, camera on ones, randomness seeded. */
import type {Sheet} from '../sheet';
import {type RisoStory,type Scene,playChapters} from '../story';
import {apertureDisc} from '../passage';
import {twos,twosIndex,sm,easeOut,easeIO,easeIn,easeOutBack,linear,key,settle,clamp,lerp,rng,noise1,blob,polyPath,ribbon,smoothPts,partial,wob,arc,TAU,type Pt,type Key,creepHolds} from '../motion';
import {sparkBurst,speedLines,dust,handCut,footballPanels,goalFrame,glowDisc} from '../shapes';

const CH='/stories/narration/11v11/loss/';
const K='navy',O='orange',B='blue',Y='yellow';

/** camera through [t,x,y,zoom,rot] keys, each segment eased (a key may carry its own ease as its last element). */
// moving holds: a camera hold creeps toward the next key instead of parking (stutter audit, Oct 4 2026)
function cam(s:Sheet,t:number,K:Key[],kick:Pt=[0,0],rot=0){const v=key(t,creepHolds(K),easeIO,true);s.camera(v[0]+kick[0],v[1]+kick[1],(v[2]??1)*view(s),(v[3]??0)+rot);return v;}
/** viewport fit: the desktop art region shows 793 × 625 world units at zoom 1; phones show up to 1080 × 1055, so they get a closer view (≤ ×1.32). */
const view=(s:Sheet)=>clamp((s.safe.w/s.fit)/800,1,1.32);

// ---------------- abstract riso figure (bible §1c.4) — copied verbatim into each 11v11 story file ----------------
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

/** walk cycle: the two walk keyframes swapped (k = 0 | 1) — a slower gait than `stride`. */
const wstride=(k:number):{legs:Limb[];arms:Limb[]}=>{const Wp=POSES.walk,sw=(a:Limb,b:Limb):Limb[]=>[[a[0],b[1],b[2]],[b[0],a[1],a[2]]];return k%2?{legs:sw(Wp.legs[0],Wp.legs[1]),arms:sw(Wp.arms[0],Wp.arms[1])}:{legs:Wp.legs,arms:Wp.arms};};
const chestOf=(f:{top:Pt;hip:Pt}):Pt=>[lerp(f.top[0],f.hip[0],.45),lerp(f.top[1],f.hip[1],.45)];
/** the chest point of a standing figure at ground (x,y), size, tilt — the same maths as figure(), for camera targets and apertures. */
const chestAt=(x:number,y:number,size:number,tilt:number,facing=1):Pt=>[x+facing*.55*.34*Math.sin(tilt)*size,y+(-.3-.55*.34*Math.cos(tilt))*size];
/** sticker: a paper halo (hand-cut silhouette knockout) under a coloured figure so blue / orange / yellow print clean on the green. */
function sticker(s:Sheet,x:number,y:number,size:number,ink:string,seed:number,pose:Pose,o:FigureOpts={}){
 const P=POSES[pose],f=o.facing??1,tilt=P.tilt+(o.tilt??0),seated=pose.startsWith('sit'),wide=pose==='run'||pose==='walk'||pose==='kick';
 const head=o.head??P.head,hd=o.headDrop??P.headDrop??[0,0],hx=x+f*(head[0]-(head[1]-P.hip[1])*Math.sin(tilt)+hd[0])*size*(o.scaleX??1),hy=y+(P.hip[1]+(head[1]-P.hip[1])*Math.cos(tilt)+hd[1])*size;
 const top=seated?-.42:-.68,bot=seated?.34:.03,hw=(wide?.4:.3)*(o.scaleX??1);
 const p=new Path2D();
 p.addPath(polyPath(handCut([[x-hw*size,y+top*size],[x+hw*size,y+top*size],[x+hw*size*.85,y+bot*size],[x-hw*size*.85,y+bot*size]],seed+11,size*.02,size*.15),true));
 p.addPath(polyPath(blob(hx,hy,size*.215,size*.215,seed+12,{amp:.05,n:24}),true));
 s.knockout(p,.95);
 return figure(s,x,y,size,ink,seed,pose,{...o,mode:'ink',cov:o.cov??.92});
}

// ---------------- the world: dusk sky, the green pitch, the touchline ----------------
/** A full-width strip with torn top and bottom edges whose noise slides with `off` (units). */
function bandPath(y0:number,y1:number,off:number,seed:number,amp:number,o:{x0?:number;x1?:number;step?:number}={}){
 const{x0=-1800,x1=1800,step=60}=o,p=new Path2D();
 const yt=(x:number)=>y0+amp*noise1((x-off)/170+seed,seed)+amp*.45*noise1((x-off)/52,seed+3);
 const yb=(x:number)=>y1+amp*noise1((x-off)/190+seed+50,seed+7)+amp*.45*noise1((x-off)/61,seed+9);
 p.moveTo(x0,yt(x0));for(let x=x0+step;x<=x1;x+=step)p.lineTo(x,yt(x));for(let x=x1;x>=x0;x-=step)p.lineTo(x,yb(x));p.closePath();return p;
}
const HZ=230;
/** sky (cream paper, faint yellow screen, three soft orange dusk bands low on the horizon, an optional blue evening band high up) and the
 * pitch (torn horizon, yellow × blue = green, a navy mowing stripe, the paper touchline). */
function world(s:Sheet,t:number,seed:number,o:{dusk?:number;evening?:number}={}){
 const{dusk=1,evening=0}=o,tt=twos(t);
 s.field(Y,.1,.3);
 if(evening>0)s.tone(B,bandPath(-620,-500,8*tt,seed+20,30,{step:90}),.2*evening);
 s.tone(O,bandPath(HZ-215,HZ-150,10*tt,seed,18,{step:90}),.12*dusk);
 s.tone(O,bandPath(HZ-120,HZ-68,6*tt,seed+1,14,{step:90}),.2*dusk);
 s.tone(O,bandPath(HZ-40,HZ-4,3*tt,seed+2,10,{step:90}),.32*dusk);
 const gnd=bandPath(HZ,HZ+2400,0,seed+3,12,{step:80});
 s.tone(Y,gnd,.75);s.tone(B,gnd,.45);
 s.tone(K,bandPath(HZ+90,HZ+150,0,seed+4,8,{step:110}),.1);
 s.tone(K,bandPath(HZ+420,HZ+2400,0,seed+5,10,{step:110}),.12);
 s.knockout(ribbon([[-1600,HZ+296],[1600,HZ+302]],11,{seed:seed+6,pressure:.3,taper:0,wobble:1.6,step:80}),.9);
}

// ---------------- the puddle and its rings ----------------
type Pool={x:number;y:number;rx:number;ry:number};
const poolPath=(P:Pool,seed:number)=>polyPath(blob(P.x,P.y,P.rx,P.ry,seed,{amp:.06,n:48}),true);
/** the puddle: a paper knockout printed blue (a clean pool on the green), a navy depth band along its lower edge, a paper sky reflection when still. */
function puddle(s:Sheet,P:Pool,seed:number,still=0){
 const path=poolPath(P,seed);s.knockout(path,.95);s.tone(B,path,.6);
 s.tone(K,polyPath(blob(P.x,P.y+P.ry*.38,P.rx*.88,P.ry*.55,seed+1,{amp:.08,n:30}),true),.15);
 if(still>.02)s.knockout(polyPath(blob(P.x-P.rx*.12,P.y-P.ry*.1,P.rx*.6*still,P.ry*.5*still,seed+2,{amp:.05,n:30}),true),.45);
}
type Birth={t0:number;x:number;y:number;v:number;w:number;amp:number;maxR:number;seed:number};
type Ring={x:number;y:number;r:number;w:number;amp:number;seed:number};
/** the rings alive at t: each born at t0 travels at v units/s and thins toward maxR. */
function live(t:number,births:Birth[]):Ring[]{const out:Ring[]=[];for(const b of births){if(t<b.t0)continue;const r=b.v*(t-b.t0),w=b.w*(1-r/b.maxR);if(r>6&&w>1.2)out.push({x:b.x,y:b.y,r,w,amp:b.amp,seed:b.seed});}return out;}
/** paper ripple rings (ellipses in the pool's perspective) knocked out in one path, clipped to the pool. flat squashes them vertically (the slap). */
function rings(s:Sheet,P:Pool,list:Ring[],seed:number,flat=1){
 if(!list.length)return;s.save();s.clip(poolPath(P,seed));const p=new Path2D();
 for(const R of list){const pts=blob(R.x,R.y,R.r,R.r*P.ry/P.rx*flat,R.seed,{amp:R.amp,n:Math.max(20,Math.round(R.r/9))});p.addPath(ribbon(pts,R.w,{seed:R.seed,close:true,wobble:1,pressure:.3}));}
 s.knockout(p,.9);
 const q=new Path2D();for(const R of list){const pts=blob(R.x,R.y,R.r*.93,R.r*.93*P.ry/P.rx*flat,R.seed,{amp:R.amp,n:Math.max(20,Math.round(R.r/9))});q.addPath(ribbon(pts,Math.max(1.5,R.w*.22),{seed:R.seed+50,close:true,wobble:.8,pressure:.2}));}
 s.fill(K,q,.55);s.restore();
}
/** splash: a paper crown ellipse and droplets that arc up and fall (age in s). */
function splash(s:Sheet,x:number,y:number,age:number,seed:number,size=1){
 if(age<0||age>.8)return;const g=easeOut(clamp(age/.35)),r=(24+70*g)*size,fade=1-clamp((age-.35)/.45);
 s.knockout(ribbon(blob(x,y,r,r*.42,seed,{amp:.06,n:28}),r*.28,{seed,close:true,wobble:1.2,pressure:.3}),.9*fade);
 const rr=rng(seed),p=new Path2D(),u=clamp(age/.5);for(let i=0;i<6;i++){const a=-Math.PI/2+(rr()-.5)*2.2,d=(50+rr()*80)*size,px=x+Math.cos(a)*d*u,py=y+Math.sin(a)*d*u+150*size*u*u-50*size*u,rd=(6+rr()*6)*size;p.addPath(polyPath(blob(px,py,rd,rd*1.3,seed+i,{amp:.1,n:10}),true));}
 s.knockout(p,.9*fade);
}
/** a tear-sized paper drop with a navy contour. */
function drop(s:Sheet,x:number,y:number,r:number,seed:number){const pts=blob(x,y,r,r*1.3,seed,{amp:.08,n:14});s.knockout(polyPath(pts,true),.95);s.fill(K,ribbon(pts,Math.max(2,r*.3),{seed:seed+1,close:true,wobble:.6,pressure:.3}),.9);}

// ---------------- lead objects ----------------
/** the referee's whistle: a paper barrel disc and a tube mouthpiece knocked out in one path, a navy contour and a navy hole. (x,y) = the barrel. */
function whistle(s:Sheet,x:number,y:number,r:number,ang:number,seed:number){
 s.save();s.translate(x,y);s.rotate(ang);
 const barrel=blob(0,0,r,r*.92,seed,{amp:.03,n:28}),tube:Pt[]=[[-r*.4,-r*.7],[-r*2.2,-r*1.15],[-r*2.2,-r*.55],[-r*.6,0]];
 const p=new Path2D();p.addPath(polyPath(barrel,true));p.addPath(polyPath(handCut(tube,seed+1,2,40),true));s.knockout(p,.95);
 s.fill(K,ribbon(barrel,Math.max(3,r*.15),{seed:seed+2,close:true,pressure:.6,wobble:1}));
 s.fill(K,ribbon(tube,Math.max(3,r*.11),{seed:seed+3,close:true,pressure:.4,wobble:1}));
 s.fill(K,polyPath(blob(r*.25,-r*.12,r*.2,r*.18,seed+4,{amp:.08,n:12}),true));
 s.restore();
}
/** the feeling: a navy knot (boiling blob) on a paper knockout; anger = orange spikes; warm 0..1 rounds it into an orange ring with a paper centre. */
function knot(s:Sheet,x:number,y:number,r:number,seed:number,o:{boil?:number;cov?:number;spikes?:[number,number][];warm?:number}={}){
 const{boil=0,cov=.85,spikes=[],warm=0}=o;if(r<=1)return;
 const body=polyPath(blob(x,y,r*1.1,r*.9,seed+boil,{amp:.2*(1-warm),n:22,rot:-.4}),true);s.knockout(body,.95);
 if(warm<1)s.fill(K,body,cov*(1-warm));
 if(spikes.length){const q=new Path2D();spikes.forEach(([a,len],i)=>{if(len<=2)return;q.addPath(ribbon([[x,y],[x+Math.cos(a)*len,y+Math.sin(a)*len]],r*.5,{seed:seed+i,taper:.9,wobble:2.5,pressure:.4}));});s.knockout(q,.9);s.fill(O,q,.95);}
 if(warm>0){const outer=blob(x,y,r*1.15,r*1.02,seed+40,{amp:.04,n:28}),inner=blob(x,y,r*.62*warm,r*.56*warm,seed+41,{amp:.04,n:24});
  const rp=polyPath(outer,true);rp.moveTo(inner[inner.length-1][0],inner[inner.length-1][1]);for(let i=inner.length-2;i>=0;i--)rp.lineTo(inner[i][0],inner[i][1]);rp.closePath();
  s.fill(O,rp,.8*warm);s.knockout(polyPath(inner,true),.95*warm);}
}
/** the scoreboard: a navy paper board (paper margin) on two posts, a paper divider, row 1 = blue swatch + ONE paper pip, row 2 = orange swatch + TWO pips. */
function board(s:Sheet,x:number,y:number,w:number,h:number,seed:number,o:{cov?:number;pips?:number;post?:boolean}={}){
 const{cov=.92,pips=1,post=true}=o,m=w*.035;
 s.knockout(polyPath(handCut([[x,y],[x+w,y],[x+w,y+h],[x,y+h]],seed,4,60),true),.95);
 s.fill(K,polyPath(handCut([[x+m,y+m],[x+w-m,y+m],[x+w-m,y+h-m],[x+m,y+h-m]],seed+1,3,60),true),cov);
 if(post){const q=new Path2D();q.addPath(ribbon([[x+w*.2,y+h],[x+w*.2,HZ+36]],w*.045,{seed:seed+2,taper:0,wobble:1,step:30}));q.addPath(ribbon([[x+w*.8,y+h],[x+w*.8,HZ+36]],w*.045,{seed:seed+3,taper:0,wobble:1,step:30}));s.fill(K,q,cov);}
 const pp=new Path2D();pp.addPath(ribbon([[x+m*2.5,y+h/2],[x+w-m*2.5,y+h/2]],h*.025,{seed:seed+4,taper:0,wobble:.8,step:30}));
 const r1=y+h*.28,r2=y+h*.72,pr=h*.11,g1=easeOutBack(clamp(pips*2)),g2=easeOutBack(clamp(pips*2-.7));
 if(g1>0)pp.addPath(polyPath(blob(x+w*.72,r1,pr*g1,pr*g1,seed+5,{amp:.06,n:16}),true));
 if(g2>0){pp.addPath(polyPath(blob(x+w*.62,r2,pr*g2,pr*g2,seed+6,{amp:.06,n:16}),true));pp.addPath(polyPath(blob(x+w*.82,r2,pr*g2,pr*g2,seed+7,{amp:.06,n:16}),true));}
 const sw=(cx:number,cy:number,sd:number)=>polyPath(handCut([[cx-pr,cy-pr],[cx+pr,cy-pr],[cx+pr,cy+pr],[cx-pr,cy+pr]],sd,2,20),true);
 pp.addPath(sw(x+w*.22,r1,seed+8));pp.addPath(sw(x+w*.22,r2,seed+9));
 s.knockout(pp,cov>=.9?.95:cov);
 s.fill(B,sw(x+w*.22,r1,seed+8),cov);s.fill(O,sw(x+w*.22,r2,seed+9),cov);
}
/** the bench: a navy slab seat with a paper highlight and two legs. (x,y) = the seat's top centre. */
function bench(s:Sheet,x:number,y:number,w:number,seed:number){
 s.fill(K,polyPath(handCut([[x-w/2,y],[x+w/2,y],[x+w/2,y+24],[x-w/2,y+24]],seed,3,60),true));
 s.knockout(ribbon([[x-w/2+24,y+7],[x+w/2-24,y+7]],4,{seed:seed+1,taper:.2,wobble:.8,step:30}),.5);
 const legs=new Path2D();legs.addPath(ribbon([[x-w*.38,y+24],[x-w*.4,y+80]],14,{seed:seed+2,taper:0,wobble:.8}));legs.addPath(ribbon([[x+w*.38,y+24],[x+w*.4,y+80]],14,{seed:seed+3,taper:0,wobble:.8}));s.fill(K,legs);
}
/** a paper thought bubble (with two thought dots toward the head) and a navy contour; g scales it in. */
function bubble(s:Sheet,x:number,y:number,rx:number,ry:number,head:Pt,seed:number,g:number){
 if(g<=.02)return;const pts=blob(x,y,rx*g,ry*g,seed,{amp:.06,n:28}),p=new Path2D();p.addPath(polyPath(pts,true));
 p.addPath(polyPath(blob(lerp(x,head[0],.45),lerp(y,head[1],.5),16*g,14*g,seed+1,{amp:.08,n:12}),true));p.addPath(polyPath(blob(lerp(x,head[0],.68),lerp(y,head[1],.72),9*g,8*g,seed+2,{amp:.08,n:10}),true));
 s.knockout(p,.95);s.fill(K,ribbon(pts,3.5,{seed:seed+3,close:true,wobble:.8,pressure:.3}),.7);
}
/** the lamp post: a navy post, a paper lamp head with a yellow glass, a navy cap and a stepped yellow glow. */
function lamp(s:Sheet,x:number,y:number,h:number,seed:number,glow=1){
 const hx=x,hy=y-h;glowDisc(s,Y,hx,hy,40*glow,{steps:2,glow:1.3,seed:seed+1,core:false});
 s.fill(K,ribbon([[x,y],[x,hy+20]],15,{seed,taper:0,wobble:1,step:40}));
 const head:Pt[]=[[hx-32,hy-36],[hx+32,hy-36],[hx+23,hy+26],[hx-23,hy+26]];s.knockout(polyPath(handCut(head,seed+2,2,20),true),.95);s.fill(Y,polyPath(head,true),.9);
 s.fill(K,ribbon(head,4,{seed:seed+3,close:true,wobble:.6}),.9);s.fill(K,polyPath([[hx-40,hy-36],[hx+40,hy-36],[hx,hy-56]],true));
}
/** the story's ball: a paper football with navy pentagons (orange shade crescent) and a navy ground shadow. */
function ball(s:Sheet,x:number,y:number,r:number,rot:number,o:{sx?:number;sy?:number;shadow?:number}={}){
 const{sx=1,sy=1,shadow=1}=o;if(shadow>0)s.tone(K,polyPath(blob(x,y+r*.98,r*1.1*shadow,r*.28*shadow,9,{amp:.06,n:18}),true),.25);
 s.save();s.translate(x,y);s.scale(sx,sy);footballPanels(s,0,0,r,{rot,key:K,shadow:O,seed:5,light:[-.4,-.5]});s.restore();
}
/** a yellow sight wedge from the head toward `ang` (the shoulder check), knocked out beneath so it prints bright. */
function sight(s:Sheet,x:number,y:number,ang:number,half:number,L:number,seed:number,g=1){
 if(g<=0)return;const pts:Pt[]=[[x,y]];for(let i=0;i<=8;i++){const a=ang-half+2*half*i/8;pts.push([x+Math.cos(a)*L*g,y+Math.sin(a)*L*g]);}
 const p=polyPath(wob(pts,6,seed,true,{step:26,corner:.5}),true);s.knockout(p,.5);s.tone(Y,p,.75);
}
/** a paper-and-yellow spark on arrival. */
function spark(s:Sheet,x:number,y:number,age:number,seed:number,r=90){
 if(age<0||age>1.1)return;const g=easeOutBack(clamp(age/.4))*(1-.4*clamp((age-.6)/.5));if(g<=0)return;const rr=rng(seed),p=new Path2D();
 for(let i=0;i<8;i++){const a=i/8*TAU+(rr()-.5)*.4,r0=r*.35,r1=r*(.8+rr()*.5)*g;p.addPath(ribbon([[x+Math.cos(a)*r0,y+Math.sin(a)*r0],[x+Math.cos(a)*r1,y+Math.sin(a)*r1]],r*.13*(.7+rr()*.6),{seed:seed+i,taper:.8,pressure:.4,wobble:.8}));}
 s.knockout(p,.95);s.fill(Y,p,.95);
}
/** a small coloured mitt (a hand that presses, pats or holds) on a paper knockout. */
function mitt(s:Sheet,ink:string,x:number,y:number,r:number,seed:number,cov=.92){const p=polyPath(blob(x,y,r,r*.9,seed,{amp:.08,n:18}),true);s.knockout(p,.95);s.fill(ink,p,cov);}
/** an open hand: a paper palm with three finger strokes and a navy contour. */
function openHand(s:Sheet,x:number,y:number,r:number,ang:number,seed:number,g:number){
 if(g<=.02)return;const p=new Path2D();p.addPath(polyPath(blob(x,y,r*g,r*.9*g,seed,{amp:.08,n:16}),true));
 for(let i=-1;i<=1;i++){const a=ang+i*.42;p.addPath(ribbon([[x+Math.cos(a)*r*.5*g,y+Math.sin(a)*r*.5*g],[x+Math.cos(a)*r*1.7*g,y+Math.sin(a)*r*1.7*g]],r*.42*g,{seed:seed+i+2,taper:.5,wobble:.6,pressure:.2}));}
 s.knockout(p,.95);s.fill(K,ribbon(blob(x,y,r*g,r*.9*g,seed,{amp:.08,n:16}),Math.max(2,r*.12),{seed:seed+5,close:true,wobble:.6}),.8);
}

// ---------------- chapter 1: the whistle goes; what happens inside you ----------------
const REF:Pt=[-255,250],P1:Pt=[40,250];
const KNOT1=chestAt(P1[0],P1[1],300,.24);
const ch1Ball=(t:number)=>{const u=sm(0,1.2,t,easeOut);return{x:lerp(330,110,u),y:214,rot:-u*4};};
const ch1:Scene={
 draw(s,t){
  const ti=twosIndex(t),kick=settle(t,.3,{amp:7,freq:8,decay:6});
  cam(s,t,[[0,-40,50,1.1],[.3,-40,50,1.1],[1.4,-30,50,1.14],[2.92,20,30,1.16],[3.6,60,-10,1.26],[7.96,60,-10,1.26],[8.6,60,10,1.32],[10.517,KNOT1[0],KNOT1[1],2.6]],[kick*.4,kick]);
  world(s,t,11);
  goalFrame(s,K,230,HZ+20-170,250,170,{depth:56,net:B,seed:12});
  // far off, two orange figures jump with their arms up (from 1.0, every .5 s)
  const stL=poseLimbs('stand'),rL=poseLimbs('reach');
  for(let i=0;i<2;i++){const t0=1.0+i*.25;let dy=0;if(t>=t0&&t<3.3){const u=((t-t0)/.5)%1;dy=-42*4*u*(1-u);}const up=sm(t0-.3,t0,t,easeOut);
   sticker(s,275+i*88,238+dy,210,O,21+i*3,'stand',{facing:-1,arms:mixLimbs(stL.arms,rL.arms,up),tilt:.02*Math.sin(t*3+i)});}
  // the referee raises the paper whistle to the mouth and blasts it: burst lines, three sound arcs, everyone stops
  const raise=sm(0,.3,t,easeOut),upArm:Limb[]=[stL.arms[0],[[.13,-.6],[.3,-.72],[.15,-.83]]];
  const rf=sticker(s,REF[0],REF[1],340,K,31,'stand',{facing:1,cov:.45,arms:mixLimbs(stL.arms,upArm,raise),tilt:.01*Math.sin(t*2)});
  const hand=rf.hands[1];whistle(s,hand[0]+80,hand[1]+30,38,-.1,41);
  if(t>=.3){const g=easeOut(clamp((t-.3)/.35)),fade=1-sm(.9,1.4,t);if(fade>0){sparkBurst(s,K,hand[0]+126,hand[1]-8,170,{n:9,seed:43,g,width:12,cov:.9*fade});
   const p=new Path2D();for(let k=0;k<3;k++){const gk=clamp(g*3-k);if(gk<=0)continue;const r=70+95*k+40*gk,pts:Pt[]=[];for(let i=0;i<=8;i++){const a=-.7+1.4*i/8;pts.push([hand[0]+70+Math.cos(a)*r,hand[1]+Math.sin(a)*r]);}p.addPath(ribbon(pts,9-k*1.5,{seed:44+k,taper:.6,wobble:1.2}));}s.fill(K,p,.85*fade);}}
  // the player: standing tall, then on "Disappointment or anger" the shoulders drop; the ball rolls to a stop at the front foot
  const drop=sm(2.92,3.45,t,easeOut),slL=poseLimbs('slump'),warm=sm(7.96,8.6,t,easeOut),heave=t>=3.45?.02*Math.sin((t-3.45)*2.2)*(1-warm):0;
  const f=figure(s,P1[0],P1[1],300,K,51,'stand',{facing:1,arms:mixLimbs(stL.arms,slL.arms,drop),tilt:.24*drop+heave+(t<2.92?.015*Math.sin(t*2.3):0),headDrop:[.02*drop,.08*drop]});
  const b=ch1Ball(t);ball(s,b.x,b.y,50,b.rot);
  // the feeling: a navy knot grows at the chest (3.5), orange spikes flicker through it (4.6–7.2), it softens to a warm ring (7.96)
  const grow=t<3.5?0:easeOutBack(sm(3.5,3.8,t));
  if(grow>0){const c=chestOf(f),sp:[number,number][]=[];if(t>=4.6&&t<7.2){const rr=rng(60+ti),k=1-sm(6.8,7.2,t);for(let i=0;i<3;i++)sp.push([rr()*TAU,(46+rr()*50)*k*(ti%3===2?.55:1)]);}
   knot(s,c[0],c[1],34*grow,61,{boil:t<7.96?ti%3:0,cov:.85,spikes:sp,warm});}
 },
 aperture(){return apertureDisc(KNOT1[0],KNOT1[1],19,12);},still:6.0,
};

// ---------------- chapter 2: ripples — the player sits by the puddle ----------------
const POOL:Pool={x:60,y:330,rx:300,ry:105};
const P2:Pt=[-200,300],SLAP:Pt=[-62,310];
const DROPS:[number,number,number][]=[[.85,-190,322],[1.9,-186,324]];
function ch2Births():Birth[]{const out:Birth[]=[];
 for(const [d,x,y] of DROPS)for(let k=0;k<4;k++)out.push({t0:d+k*.4,x,y,v:95,w:13,amp:.03,maxR:280,seed:200+k+Math.round(d*10)});
 for(let k=0;k<3;k++)out.push({t0:3.3+k*.15,x:SLAP[0],y:SLAP[1],v:200,w:16,amp:.12,maxR:520,seed:230+k});
 return out;}
const BIRTHS2=ch2Births();
const PRESS_ARMS:Limb[]=[[[-.03,-.32],[.04,-.18],[.1,-.06]],[[.12,-.32],[.32,-.22],[.46,.02]]];
const RAISE_ARMS:Limb[]=[[[-.03,-.32],[.04,-.18],[.1,-.06]],[[.12,-.32],[.3,-.5],[.4,-.62]]];
const ch2:Scene={
 draw(s,t){
  const kick=settle(t,3.25,{amp:8,freq:7,decay:6});
  cam(s,t,[[0,-120,190,1.3],[2.92,-100,220,1.27],[4.9,-80,230,1.22],[7.6,0,200,1.0],[9.217,0,200,1.0]],[kick*.5,kick]);
  world(s,t,12);
  goalFrame(s,K,-430,HZ+16-130,200,130,{depth:44,net:B,seed:14});
  const still=sm(6.5,8.2,t,easeOut);
  puddle(s,POOL,15,still);
  const flat=t>=3.25&&t<3.42?.5:1+.1*settle(t,3.42,{amp:1,freq:5,decay:6});
  rings(s,POOL,live(t,BIRTHS2),15,flat);
  splash(s,SLAP[0],SLAP[1],t-3.25,17,1.3);
  // the player sits by the water: a tear-sized drop falls (0.4, 1.45); the hand presses the water on "flatten" (2.92 → 3.25); it lifts on "space" (4.9)
  const sL=poseLimbs('sitKnee');
  const raise=sm(2.92,3.08,t,easeOut)*(1-sm(3.08,3.25,t,easeIn)),press=sm(3.08,3.25,t,easeIn)*(1-sm(4.9,5.4,t,easeOut));
  const arms=press>0?mixLimbs(sL.arms,PRESS_ARMS,press):mixLimbs(sL.arms,RAISE_ARMS,raise);
  const f=figure(s,P2[0],P2[1],300,K,52,'sitKnee',{facing:1,arms,tilt:.06*press-.03*raise+.05*sm(0,1,t)-.05*sm(4.9,6.5,t)+.01*Math.sin(t*1.6),headDrop:[.02,.04*(1-sm(4.9,6,t))]});
  if(press>.3)mitt(s,K,f.hands[1][0],f.hands[1][1]+4,17,53);
  for(const [d,x,y] of DROPS){const t0=d-.45;if(t>=t0&&t<d){const u=easeIn(clamp((t-t0)/.45));drop(s,lerp(f.head[0]+8,x,u),lerp(f.head[1]+20,y,u),9,54+Math.round(d*10));}}
 },
 aperture(){return apertureDisc(POOL.x,POOL.y,80,14);},still:3.9,
};

// ---------------- chapter 3: ONE RESULT — the score cannot describe the team ----------------
const BD={x:-300,y:-200,w:320,h:190},BC:Pt=[BD.x+BD.w/2,BD.y+BD.h/2];
const TEAM=[-190,-10,170,350];
const SHOULDER:Limb=[[.13,-.6],[.4,-.7],[.66,-.62]];
const ch3:Scene={
 draw(s,t){
  const ti=twosIndex(t);
  cam(s,t,[[0,BC[0],BC[1],1.85],[2.52,BC[0],BC[1],1.85],[4.0,10,40,1.0],[9.2,10,40,1.0],[10.617,BC[0],BC[1],1.7]]);
  world(s,t,13);
  board(s,BD.x,BD.y,BD.w,BD.h,71,{pips:sm(0,.6,t),post:true});
  // "your effort": a faint replay ghost of the player sprinting crosses behind the team
  if(t>=4.0&&t<5.8){const u=sm(4.0,5.7,t,easeIO),gx=lerp(-640,720,u),st=stride(ti);figure(s,gx,240,240,K,81,'run',{facing:1,legs:st.legs,arms:st.arms,tilt:.12,cov:.3});speedLines(s,K,gx-40,140,0,{n:4,seed:82+ti,len:120,width:6,cov:.3});}
  // the team standing together, each right arm across the next one's shoulders; the player slumped until "respect"
  const stL=poseLimbs('stand'),slL=poseLimbs('slump'),lift=t<6.94?0:easeOutBack(sm(6.94,7.5,t)),slump=.6*(1-clamp(lift)),leanIn=.05*sm(6.94,7.5,t,easeOut);
  for(let i=0;i<4;i++){const x=TEAM[i],arms:Limb[]=[stL.arms[0],i<3?SHOULDER:stL.arms[1]],tilt=(i<1?leanIn:i>1?-leanIn:0)+.012*Math.sin(t*1.7+i);
   if(i===1)figure(s,x,250,300,K,91,'stand',{facing:1,arms:mixLimbs(arms,[slL.arms[0],SHOULDER],slump),tilt:.2*slump+tilt,headDrop:[.02*slump,.08*slump]});
   else sticker(s,x,250,300,B,93+i*3,'stand',{facing:1,arms,tilt});}
  // "respect": the neighbour's blue mitt pats the player's shoulder twice
  const pat=t>=6.94?settle(t,6.94,{amp:9,freq:3,decay:2.5}):0;mitt(s,B,TEAM[0]+.66*300,250-.62*300+pat,24,99);
 },
 aperture(){return apertureDisc(BC[0],BC[1],46,12);},still:5.2,
};

// ---------------- chapter 4: TWO QUESTIONS — on the bench with the coach ----------------
const P4:Pt=[-110,172],C4:Pt=[130,172],BUB1:Pt=[-150,-100],BUB2:Pt=[200,-128];
const POINT_ARMS:Limb[]=[[[-.03,-.32],[.06,-.18],[.12,-.04]],[[.12,-.32],[.32,-.36],[.5,-.4]]];
const OPEN_ARMS:Limb[]=[[[-.03,-.32],[.06,-.18],[.12,-.04]],[[.12,-.32],[.3,-.3],[.42,-.2]]];
const ch4:Scene={
 draw(s,t){
  cam(s,t,[[0,0,90,1.35],[2.88,0,30,1.35],[4.7,30,25,1.36],[6.98,20,30,1.38],[8.3,20,30,1.38],[9.317,BUB2[0],BUB2[1],2.4]]);
  world(s,t,14);
  bench(s,0,170,540,72);
  // the player: turns to the coach (.3–.8); points on "without blame" (6.2 → 6.5), lowers it (6.98 → 7.4), then opens the hand (7.4 → 7.9)
  const sL=poseLimbs('sit'),turn=sm(.3,.8,t,easeOut),pt=sm(6.2,6.5,t,easeOut)*(1-sm(6.98,7.4,t,easeIO)),open=t<7.4?0:easeOutBack(sm(7.4,7.9,t));
  const arms=open>0?mixLimbs(sL.arms,OPEN_ARMS,clamp(open)):mixLimbs(sL.arms,POINT_ARMS,pt);
  const f=figure(s,P4[0],P4[1],300,K,55,'sit',{facing:1,arms,tilt:.04*turn+.03*pt+.01*Math.sin(t*1.5),headDrop:[.03*turn,.01*Math.sin(t*1.5)]});
  if(open>0)openHand(s,f.hands[1][0]+12,f.hands[1][1]-8,21,-.5,56,open);
  // the coach: taller, orange, a paper cap; nods at 1.4 and 5.2; opens an arm after the player does (7.9 → 8.3)
  const nod=(t0:number)=>t>=t0&&t<t0+.5?.04*Math.sin((t-t0)/.5*TAU):0,cOpen=t<7.9?0:easeOutBack(sm(7.9,8.3,t));
  const cf=sticker(s,C4[0],C4[1],340,O,57,'sit',{facing:-1,arms:mixLimbs(sL.arms,OPEN_ARMS,clamp(cOpen)),tilt:.02*Math.sin(t*1.3+1),headDrop:[0,nod(1.4)+nod(5.2)]});
  {const r=.19*340,hx=cf.head[0],hy=cf.head[1],capPts:Pt[]=[];for(let i=0;i<=8;i++){const a=Math.PI+i/8*Math.PI;capPts.push([hx+Math.cos(a)*r,hy+Math.sin(a)*r*.9-4]);}
   const cap=new Path2D();cap.addPath(polyPath(capPts,true));cap.addPath(polyPath([[hx-r*.9,hy-8],[hx-r*1.7,hy-6],[hx-r*1.6,hy+8],[hx-r*.8,hy+4]],true));s.knockout(cap,.95);s.fill(K,ribbon([[hx-r*1.7,hy-2],[hx+r*.95,hy-4]],4,{seed:58,taper:.3,wobble:.6}),.8);}
  if(cOpen>0)openHand(s,cf.hands[1][0]-12,cf.hands[1][1]-8,22,Math.PI+.5,59,cOpen);
  // the two questions: a bubble with a tick above the player (2.88), a bubble with a curved arrow above the coach (4.7)
  const g1=t<2.88?0:easeOutBack(sm(2.88,3.18,t))*(1-sm(6.8,7.1,t)),g2=t<4.7?0:easeOutBack(sm(4.7,5.0,t));
  bubble(s,BUB1[0],BUB1[1],92,64,f.head,61,g1);
  if(g1>.9){const tick=partial(smoothPts([[BUB1[0]-34,BUB1[1]+2],[BUB1[0]-8,BUB1[1]+26],[BUB1[0]+38,BUB1[1]-28]],false,6),sm(3.1,3.5,t,easeOut));if(tick.length>1)s.fill(K,ribbon(tick,11,{seed:62,taper:.3,wobble:.8,pressure:.4}),.95);}
  bubble(s,BUB2[0],BUB2[1],102,70,cf.head,63,g2);
  if(g2>.9){const acov=.95*(1-sm(8.1,8.4,t));if(acov>.04){const pts:Pt[]=[];for(let i=0;i<=10;i++){const a=3.4-2.9*i/10;pts.push([BUB2[0]+Math.cos(a)*36,BUB2[1]+Math.sin(a)*32]);}const u=sm(4.9,5.4,t,easeOut),line=partial(smoothPts(pts,false,5),u);
    if(line.length>1)s.fill(K,ribbon(line,10,{seed:64,taper:.2,wobble:.8,pressure:.3}),acov);
    if(u>=1){const e=pts[pts.length-1],d=pts[pts.length-2],ang=Math.atan2(e[1]-d[1],e[0]-d[0]);s.fill(K,polyPath([[e[0]+Math.cos(ang)*16,e[1]+Math.sin(ang)*16],[e[0]+Math.cos(ang+2.4)*16,e[1]+Math.sin(ang+2.4)*16],[e[0]+Math.cos(ang-2.4)*16,e[1]+Math.sin(ang-2.4)*16]],true),acov);}}}
 },
 aperture(){return apertureDisc(BUB2[0],BUB2[1],40,12);},still:5.6,
};

// ---------------- chapter 5: ONE DETAIL — shoulder check, then recover into space ----------------
const TM5:Pt=[-430,250],OP5X=260,POOL5:Pt=[-250,250],BALL5_END:Pt=[-210,214];
function ch5Ball(t:number){let p:Pt=[-390,214],rot=0,c=0,fly=false;
 if(t>=3.9){const u=sm(3.9,4.65,t,easeIO);p=arc([-390,214],[-90,214],u,40);rot+=u*5;fly=u<1;if(u>=1)c=settle(t,4.65,{amp:.08,freq:4,decay:5,phase:Math.PI/2});}
 if(t>=6.2){const u=sm(6.2,7.0,t,easeIO);p=[lerp(-90,300,u),214];rot+=u*8;fly=false;c=0;}
 if(t>=8.2){const u=sm(8.2,8.9,t,easeIO);p=arc([300,214],BALL5_END,u,60);rot-=u*7;fly=u<1;if(u>=1)c=settle(t,8.9,{amp:.08,freq:4,decay:5,phase:Math.PI/2});}
 return{p,rot,c,fly};}
const ch5Rot=(t:number)=>ch5Ball(t).rot;
const ch5:Scene={
 draw(s,t){
  const ti=twosIndex(t);
  cam(s,t,[[0,-90,40,1.0],[3.18,-90,40,1.0],[3.5,-50,20,1.04,-.03],[4.3,-50,20,1.04,-.03],[4.65,-90,30,1.06],[5.6,-90,30,1.06],[6.4,40,30,1.06],[7.5,-140,30,1.1],[8.9,-190,40,1.15],[9.9,-190,40,1.15],[11.217,BALL5_END[0],BALL5_END[1],2.4]]);
  world(s,t,15);
  goalFrame(s,K,520,HZ+14-120,220,120,{depth:44,net:B,seed:16});
  // the open space: a pool of yellow on the grass on "recover into space"
  const pool=t<6.5?0:easeOutBack(sm(6.5,6.9,t));
  if(pool>0){const pp=polyPath(blob(POOL5[0],POOL5[1],200*pool,62*pool,18,{amp:.08,n:28}),true);s.knockout(pp,.9);s.tone(Y,pp,.6+.15*sm(7.4,7.6,t));}
  // the teammate with the ball loads and passes on 3.9
  const load=sm(3.75,3.9,t)*(1-sm(3.9,4.15,t)),kicked=t>=3.9&&t<4.2;
  sticker(s,TM5[0],TM5[1],300,B,171,kicked?'kick':'stand',{facing:1,tilt:-.1*load});
  // the opponent: waits behind, runs in at 5.6, takes the ball, runs back with it, then kicks at 8.2
  const inU=sm(5.6,6.2,t,easeIO),outU=sm(6.2,7.0,t,easeIO),ox=t<6.2?lerp(OP5X,0,inU):lerp(0,340,outU),oMoving=(inU>0&&inU<1)||(outU>0&&outU<1),oFace=t<6.2?-1:1,st=stride(ti);
  const oload=sm(8.05,8.2,t)*(1-sm(8.2,8.45,t)),okick=t>=8.2&&t<8.5;
  sticker(s,ox,250,300,O,181,oMoving?'run':okick?'kick':'stand',{facing:t>=7.0?-1:oFace,legs:oMoving?st.legs:undefined,arms:oMoving?st.arms:undefined,tilt:oMoving?.12:-.1*oload});
  if(oMoving)speedLines(s,O,ox-oFace*40,120,oFace>0?0:Math.PI,{n:4,seed:183+ti,len:110,spread:50,width:6,cov:.85});
  // the player: checks the shoulder (3.18), receives (4.65), loses the ball (6.2), runs back into the space (6.7 → 7.5), intercepts (8.9)
  const lk=key(t,[[3.18,0],[3.3,-.15],[3.65,1,easeOut],[4.0,1],[4.3,0]]),runU=sm(6.7,7.5,t,easeIO),moving=runU>0&&runU<1,px=lerp(-40,POOL5[0],runU)+(runU>=1?10*settle(t,7.5,{amp:1,freq:4,decay:5}):0);
  const lost=sm(6.2,6.6,t,easeOut)*(1-sm(6.6,6.9,t)),cushion=(t>=4.65&&t<4.85)||(t>=8.9&&t<9.1)?.06:0,face=t<7.5?-1:1,stL=poseLimbs('stand'),slL=poseLimbs('slump');
  const f=figure(s,px,250,300,K,161,moving?'run':'stand',{facing:face,legs:moving?st.legs:undefined,arms:moving?st.arms:mixLimbs(stL.arms,slL.arms,lost),head:!moving&&lk>0?[-.12*lk,-.82]:undefined,tilt:moving?.12:-.04*lk+cushion+.2*lost+.012*Math.sin(t*1.9),headDrop:[.02*lost,.08*lost],scaleX:1+cushion});
  sight(s,f.head[0],f.head[1],0,.16,300,162,sm(3.3,3.7,t)*(1-sm(4.0,4.3,t)));
  if(moving&&runU<.75)speedLines(s,K,px+40,120,Math.PI,{n:4,seed:163+ti,len:120,spread:50,width:6,cov:.85});
  if(runU>=1&&t<8.1)dust(s,null,px,250,50,7,{seed:164,size:6,cov:.9*(1-sm(7.5,8.1,t))});
  const b=ch5Ball(t);ball(s,b.p[0],b.p[1],56,b.rot,{sx:1+b.c,sy:1-b.c,shadow:b.fly?.5:1});
  if(b.fly)speedLines(s,K,b.p[0]+(t<8?-40:40),b.p[1],t<8?0:Math.PI,{n:4,seed:185+ti,len:80,width:4,cov:.8});
  spark(s,-90,214,t-4.65,84,100);spark(s,BALL5_END[0],BALL5_END[1],t-8.9,85,100);
  // "Keep it small": a small yellow ring draws itself around just the player and the ball in the space
  if(t>=9.04){const u=sm(9.04,9.6,t,easeOut),pts=blob(POOL5[0]+30,182,158,142,19,{amp:.04,n:36}),line=partial(smoothPts(pts,true,6),Math.min(1,u*1.02));
   if(line.length>1){const rb=ribbon(line,16,{seed:20,close:u>=.98,wobble:1.2,pressure:.3});s.knockout(rb,.95);s.fill(Y,rb,.95);}}
 },
 aperture(t){return apertureDisc(BALL5_END[0],BALL5_END[1],17,5,ch5Rot(t));},still:9.3,
};

// ---------------- chapter 6: room for rest — walking off with a friend at dusk ----------------
const BD6={x:-360,y:-220,w:240,h:160},FRIEND0=330,LAMP:Pt=[430,250];
const WAVE_L:Limb=[[.13,-.6],[.3,-.78],[.36,-.98]],WAVE_R:Limb=[[.13,-.6],[.1,-.8],[-.02,-.98]];
const ch6:Scene={
 draw(s,t){
  const ti=twosIndex(t),tt=twos(t);
  cam(s,t,[[0,-70,30,1.12],[4.14,-20,30,1.12],[6.54,10,30,1.12],[8.4,170,30,1.08],[9.115,200,30,1.08]]);
  world(s,t,16,{dusk:1.4,evening:1});
  // the scoreboard, left behind: on "the whole score" it fades to paper and stays on the pitch
  const bcov=key(t,[[6.54,.92],[8.0,.08]]);board(s,BD6.x,BD6.y,BD6.w,BD6.h,73,{cov:bcov,pips:1,post:true});
  lamp(s,LAMP[0],LAMP[1],400,74,1+.06*Math.sin(tt*2.1));
  // the player walks off the pitch toward the friend; from 7.4 the two walk on together
  const px=key(t,[[.6,-260,linear],[5.4,170],[7.4,170,linear],[9.115,290]]),walking=(t>=.6&&t<5.4)||t>=7.4,ws=wstride(Math.floor(ti/3)),stL=poseLimbs('stand');
  const f=figure(s,px,250,300,K,175,walking?'walk':'stand',{facing:1,legs:walking?ws.legs:undefined,arms:walking?ws.arms:undefined,tilt:walking?.06:0+.01*Math.sin(t*1.6)});
  // "a useful lesson forward": a small yellow token pops into the front hand and is carried
  const tok=t<4.14?0:easeOutBack(sm(4.14,4.5,t));if(tok>0){const h=f.hands[1],p=polyPath(blob(h[0]+6,h[1]+2,22*tok,22*tok,176,{amp:.06,n:14}),true);s.knockout(p,.95);s.fill(Y,p,.95);s.fill(K,ribbon(blob(h[0]+6,h[1]+2,22*tok,22*tok,176,{amp:.06,n:14}),3,{seed:177,close:true,wobble:.5}),.8);}
  // the friend by the lamp waves, then turns and walks with the player
  const turn=t>=7.4,fx=turn?key(t,[[7.4,FRIEND0,linear],[9.115,FRIEND0+120]]):FRIEND0,wave=.5+.5*Math.sin(tt*4.4);
  sticker(s,fx,250,300,Y,178,turn?'walk':'stand',{facing:turn?1:-1,legs:turn?ws.legs:undefined,arms:turn?ws.arms:[stL.arms[0],mixLimbs([WAVE_L],[WAVE_R],wave)[0]],tilt:turn?.06:.02*Math.sin(t*2)});
 },
 still:5.6,
};

export const story:RisoStory={
 id:'loss',format:'11v11',title:'After the Final Whistle',theme:'Handling a loss',ageNote:'A direct mental-skills explainer; playing format does not define age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',orange:'#ff6c2f',blue:'#0078bf',navy:'#22366b'},order:['yellow','orange','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:[
  {label:'WHEN THE WHISTLE GOES',narration:'What happens inside you after a loss? Disappointment or anger may follow. Caring about the result makes those feelings understandable.',seconds:10.517,audio:CH+'01.m4a',cues:[{at:0,words:'What happens inside'},{at:2.92,words:'Disappointment or anger'},{at:7.96,words:'understandable'}]},
  {label:'LET THE RIPPLES SETTLE',narration:'Think of ripples across water. You do not have to flatten them immediately. Give yourself space before deciding what the match means.',seconds:9.217,audio:CH+'02.m4a',cues:[{at:0,words:'Think of ripples'},{at:2.92,words:'flatten them immediately'},{at:4.9,words:'Give yourself space'}]},
  {label:'A RESULT, NOT YOUR WORTH',headline:'One result',narration:'The score describes one result. It cannot describe your team, your effort, or your value. You still deserve respect after a difficult game.',seconds:10.617,audio:CH+'03.m4a',cues:[{at:0,words:'The score'},{at:2.52,words:'cannot describe'},{at:6.94,words:'deserve respect'}]},
  {label:'LOOK WITH CURIOSITY',headline:'Two questions',narration:'When you feel ready, ask two questions. What helped us? What could we try differently? Talk with a teammate or coach, without blame.',seconds:9.317,audio:CH+'04.m4a',cues:[{at:0,words:'When you feel ready'},{at:2.88,words:'What helped us'},{at:6.98,words:'without blame'}]},
  {label:'CHOOSE ONE DETAIL',headline:'One detail',narration:'Choose one football detail for practice. Perhaps check your shoulder before receiving, or recover into space after losing possession. Keep it small.',seconds:11.217,audio:CH+'05.m4a',cues:[{at:0,words:'Choose one football'},{at:3.18,words:'check your shoulder'},{at:9.04,words:'Keep it small'}]},
  {label:'ROOM FOR ANOTHER DAY',narration:'Then make room for rest and life beyond football. You can carry a useful lesson forward without carrying the whole score with you.',seconds:9.115,audio:CH+'06.m4a',cues:[{at:0,words:'Then make room'},{at:4.14,words:'a useful lesson forward'},{at:6.54,words:'the whole score'}]},
 ],
 draw(f){playChapters(story,f,[ch1,ch2,ch3,ch4,ch5,ch6]);},
 /** a tap drops a pebble into the print: the pebble lands, a paper ripple ring and a blue wet ring spread, a few droplets hop. */
 touch(s,x,y,age,seed){
  const landed=clamp(age/.12),py=y-46*(1-easeIn(landed));
  if(age>=.08){const g=easeOut(clamp((age-.08)/.6)),r=22+130*g,fade=1-clamp((age-.45)/.35);
   s.tone(B,polyPath(blob(x,y,r*1.15,r*.5,seed+1,{amp:.05,n:24}),true),.45*fade);
   s.knockout(ribbon(blob(x,y,r,r*.44,seed,{amp:.05,n:28}),13*(1-.55*g),{seed,close:true,wobble:1,pressure:.3}),.92*fade);}
  if(age>=.1&&age<.6){const rr=rng(seed+3),p=new Path2D(),u=clamp((age-.1)/.5);for(let i=0;i<4;i++){const a=-Math.PI/2+(rr()-.5)*1.8,d=40+rr()*50,dx=x+Math.cos(a)*d*u,dy=y+Math.sin(a)*d*u+120*u*u-40*u;p.addPath(polyPath(blob(dx,dy,6,8,seed+i,{amp:.1,n:10}),true));}s.knockout(p,.9*(1-u));}
  s.fill(K,polyPath(blob(x,py,15,12,seed+7,{amp:.1,n:12}),true),.95);
 },
};
