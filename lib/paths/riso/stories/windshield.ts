/** The Windshield — riso. A NIGHT-BLUE print seen through a car windshield: a dark cabin frame (hand-cut A-pillars, torn header
 * with a mirror, dashboard with a paper lip) around a wide pane; through it a perspective road that IS the pitch (paper touchlines,
 * far goal), lit by a stepped yellow headlight fan (yellow × blue = the green of the grass), rain streaks on the glass and two wiper
 * blades that clear arcs. People are ABSTRACT riso figures (bible §1c.4, `figure()` below): me = paper, teammates = light-blue paper,
 * pressure = orange on a paper knockout. The ball is the "headlight ball": paper sphere, yellow lit crescent, one centre pentagon and
 * five tread seams. Inks: yellow → orange → blue → navy on cream. Scenes read only their local time t. */
import type {Sheet} from '../sheet';
import {type RisoStory,type Scene,playChapters} from '../story';
import {apertureDisc} from '../passage';
import {twos,twosIndex,sm,easeOut,easeIO,easeIn,easeOutBack,key,anticipate,settle,clamp,lerp,rng,noise1,blob,polyPath,ribbon,wob,rectPath,TAU,type Pt,type Key,linear,creepHolds} from '../motion';
import {contour,dust,handCut,tornRect,confetti,speedLines,crescent,ring} from '../shapes';

const CH='/stories/narration/11v11/windshield/';
const K='navy',Y='yellow',O='orange',B='blue';
const D=Math.PI/180;
const BIG=rectPath(-4000,-4000,8000,8000);

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

/** person(): me = paper with a faint blue screen; teammates = paper printed light blue; opponents = orange ink on a paper knockout. */
type Kind='me'|'us'|'them';
function person(s:Sheet,x:number,y:number,size:number,kind:Kind,seed:number,pose:Pose,o:FigureOpts={}){
 if(kind==='me')return figure(s,x,y,size,B,seed,pose,{...o,mode:'paper',paperTone:o.paperTone??.1,toneInk:B});
 if(kind==='us')return figure(s,x,y,size,B,seed,pose,{...o,mode:'paper',paperTone:o.paperTone??.5,toneInk:B});
 figure(s,x,y,size,K,seed,pose,{...o,mode:'paper',paperTone:0});return figure(s,x,y,size,O,seed,pose,{...o,mode:'ink',cov:o.cov??.92});
}

// ---------------- the world: a perspective road-pitch under a night sky ----------------
const VP:Pt=[0,-170],NEAR=620;
/** G(px, d): pitch coords → world. px −1..1 across the near width, d 0 (near) .. 1 (the vanishing point). k = 1 near → 0 far. */
function G(px:number,d:number,vp:Pt=VP){const k=Math.pow(1-clamp(d),1.25),y=vp[1]+(NEAR-vp[1])*k,hw=240+1050*k;return{x:vp[0]+px*hw,y,k,hw,sz:.28+.72*k};}
/** Night: blue field with mottle; a heavier navy screen above a wobbly horizon, a lighter one on the ground. */
function night(s:Sheet,vp:Pt=VP,o:{sky?:number;ground?:number;seed?:number}={}){
 const{sky=.6,ground=.32,seed=3}=o;s.field(B,1,.5);
 const hz:Pt[]=[];for(let i=0;i<=16;i++){const x=-4000+i*500;hz.push([x,vp[1]+12*noise1(i*.8+seed,seed)]);}
 s.tone(K,polyPath([[-4000,-4000],[4000,-4000],...hz.slice().reverse()],true),sky);
 s.tone(K,polyPath([...hz,[4000,4000],[-4000,4000]],true),ground);
}
/** Headlight fan: stepped torn yellow bands down the road (yellow × blue = green grass). spread = lateral half-width as a fraction of the road. */
function fan(s:Sheet,vp:Pt,spread:number,covs:number[],seed:number,o:{d0?:number;d1?:number;flare?:number}={}){
 const{d0=0,d1=.92,flare=.18}=o,n=covs.length;if(spread<=0)return;
 for(let i=0;i<n;i++){const c=covs[i];if(c<=.03)continue;const a=d0+(d1-d0)*i/n,b=d0+(d1-d0)*(i+1)/n,w0=spread*(1+flare*i),w1=spread*(1+flare*(i+1));
  const A0=G(-w0,a,vp),A1=G(w0,a,vp),B1=G(w1,b,vp),B0=G(-w1,b,vp);
  s.tone(Y,polyPath(handCut([[A0.x,A0.y],[A1.x,A1.y],[B1.x,B1.y],[B0.x,B0.y]],seed+i,14,90),true),c);}
}
/** A perspective line as a hand-wobbled quad (wide near, thin far). */
function pline(p:Path2D,a:{x:number;y:number},b:{x:number;y:number},wa:number,wb:number,seed:number){
 const dx=b.x-a.x,dy=b.y-a.y,L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L;
 const q=wob([[a.x+nx*wa/2,a.y+ny*wa/2],[b.x+nx*wb/2,b.y+ny*wb/2],[b.x-nx*wb/2,b.y-ny*wb/2],[a.x-nx*wa/2,a.y-ny*wa/2]],1.6,seed,true,{step:36,corner:.3});
 p.addPath(polyPath(q,true));
}
/** Pitch lines: touchlines, far goal line, halfway line, centre circle — one paper knockout; then the far goal (paper posts + bar, screen net). */
function pitchLines(s:Sheet,vp:Pt,cov:number,seed:number,o:{goal?:boolean;circle?:boolean;half?:boolean;dFar?:number}={}){
 const{goal=true,circle=true,half=true,dFar=.88}=o;if(cov<=.03)return;const p=new Path2D();
 pline(p,G(-.8,0,vp),G(-.8,dFar,vp),18,5,seed);pline(p,G(.8,0,vp),G(.8,dFar,vp),18,5,seed+1);
 pline(p,G(-.8,dFar,vp),G(.8,dFar,vp),5,5,seed+2);
 if(half){pline(p,G(-.8,.55,vp),G(.8,.55,vp),9,9,seed+3);}
 if(circle){const C=G(0,.55,vp);p.addPath(ribbon(blob(C.x,C.y,C.hw*.2,C.hw*.2*.3,seed+4,{amp:.02,n:32}),8,{seed:seed+5,close:true,pressure:.4,wobble:1.2,step:12}));}
 s.knockout(p,cov);
 if(goal)goalPaper(s,vp,dFar,seed+6,cov);
}
function goalPaper(s:Sheet,vp:Pt,d:number,seed:number,cov=.95){
 const C=G(0,d,vp),w=C.hw*.56,h=w*.38,x=C.x-w/2,y=C.y-h,dp=w*.14;
 s.knockout(polyPath([[x+3,y+3],[x+w-3,y+3],[x+w-3+dp,y+h*.3],[x+w-3+dp,C.y],[x+3+dp,C.y],[x+3+dp,y+h*.3]],true),.3*cov);
 s.knockout(ribbon([[x,C.y],[x,y],[x+w,y],[x+w,C.y]],Math.max(4,h*.1),{seed,pressure:.4,taper:.1,wobble:1.2,step:14}),cov);
}
/** Marker ring: "found early" — a yellow foreshortened ring on the ground, knocked out beneath so it prints bright. g 0..1.2 (overshoot ok). */
function marker(s:Sheet,x:number,y:number,r:number,g:number,seed:number,o:{ry?:number;pulse?:number}={}){
 if(g<=0)return;const{ry=.55,pulse=0}=o,rr=r*g*(1+pulse);const p=ribbon(blob(x,y,rr,rr*ry,seed,{amp:.05,n:28}),Math.max(4,rr*.13),{seed:seed+1,close:true,pressure:.4,wobble:1.5});
 s.knockout(p,.95);s.fill(Y,p,.95);
}
/** A paper dashed lane a→b (the chosen pass line); progress draws it tip-leading. */
function lane(s:Sheet,a:Pt,b:Pt,w:number,seed:number,progress=1,o:{dashes?:number;cov?:number;lift?:number}={}){
 const{dashes=9,cov=.9,lift=0}=o;if(progress<=0)return;const p=new Path2D();
 const pt=(u:number):Pt=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)-lift*Math.sin(u*Math.PI)];
 for(let i=0;i<dashes;i++){const u0=i/dashes+.02,u1=(i+.62)/dashes;if(u0>progress)break;const q0=pt(u0),q1=pt(Math.min(u1,progress)),dx=q1[0]-q0[0],dy=q1[1]-q0[1],l=Math.hypot(dx,dy)||1,nx=-dy/l*w/2,ny=dx/l*w/2;p.moveTo(q0[0]+nx,q0[1]+ny);p.lineTo(q1[0]+nx,q1[1]+ny);p.lineTo(q1[0]-nx,q1[1]-ny);p.lineTo(q0[0]-nx,q0[1]-ny);p.closePath();}
 s.knockout(p,cov);
}
/** The headlight ball: paper sphere, yellow lit crescent on its near side, one centre pentagon + five tread seams, navy contour, glint,
 * and a yellow pool on the ground under it. */
function ball(s:Sheet,x:number,y:number,r:number,rot:number,seed:number,o:{sx?:number;sy?:number;pool?:number;lit?:number}={}){
 const{sx=1,sy=1,pool=1,lit=1}=o;
 if(pool>0)s.tone(Y,polyPath(blob(x,y+r*.95,r*1.5*pool,r*.5*pool,seed+9,{amp:.06,n:20}),true),.5);
 s.save();s.translate(x,y);s.scale(sx,sy);
 const disc=polyPath(blob(0,0,r,r,seed,{amp:.025,n:36}),true);s.knockout(disc);
 s.save();s.clip(disc);
 if(lit>0)s.tone(Y,crescent(0,0,r*1.02,[0,-.5]),.6*lit);
 // one filled centre pentagon; the five outer panels are OUTLINES (seam lines), joined to the centre by short seams
 const pent=(cx:number,cy:number,pr:number,a0:number):Pt[]=>{const pts:Pt[]=[];for(let i=0;i<5;i++){const a=a0+i/5*TAU;pts.push([cx+Math.cos(a)*pr,cy+Math.sin(a)*pr]);}return wob(pts,r*.015,seed+3,true,{step:8,corner:.5});};
 s.fill(K,polyPath(pent(0,0,r*.3,rot),true));
 const outl=new Path2D();for(let i=0;i<5;i++){const a=rot+Math.PI/5+i/5*TAU,d=r*.84;outl.addPath(polyPath(pent(Math.cos(a)*d,Math.sin(a)*d,r*.3,a+Math.PI),true));}
 for(let i=0;i<5;i++){const a=rot+i/5*TAU;outl.moveTo(Math.cos(a)*r*.3,Math.sin(a)*r*.3);outl.lineTo(Math.cos(a)*r*.58,Math.sin(a)*r*.58);}
 s.stroke(K,outl,Math.max(2,r*.06));
 s.restore();
 s.fill(K,ribbon(blob(0,0,r,r,seed+1,{amp:.02,n:36}),Math.max(3,r*.07),{seed:seed+2,close:true,pressure:.6,wobble:r*.02}));
 s.knockout(polyPath(blob(-r*.35,-r*.42,r*.16,r*.1,seed+8,{amp:.1,n:12}),true));
 s.restore();
}
/** A boot from the side: (x,y) = the toe tip, the boot runs back along −x by L; navy leather, orange sole stripe, paper lace ticks. */
function boot(s:Sheet,x:number,y:number,L:number,ang:number,seed:number,o:{mirror?:boolean;laces?:boolean}={}){
 const{mirror=false,laces=true}=o;s.save();s.translate(x,y);s.rotate(ang);if(mirror)s.scale(-1,1);
 const h=L*.42;
 const pts=wob([[0,0],[-L*.06,-h*.5],[-L*.3,-h*.66],[-L*.58,-h*.86],[-L*.76,-h*1.0],[-L*.96,-h*.96],[-L,-h*.2],[-L*.94,h*.1],[-L*.3,h*.1]],3,seed,true,{step:14,corner:.5}),p=polyPath(pts,true);
 s.knockout(p,.95);s.fill(K,p,.95);
 const sole=polyPath(wob([[-L*.02,h*.0],[-L*.3,h*.1],[-L*.94,h*.1],[-L*.96,h*.22],[-L*.3,h*.22],[0,h*.1]],2,seed+1,true,{step:12,corner:.5}),true);s.knockout(sole,.95);s.fill(O,sole,.95);
 if(laces){const q=new Path2D();for(let i=0;i<4;i++){const u=-L*(.36+i*.09),v=-h*(.62+i*.06);q.addPath(ribbon([[u,v],[u-L*.07,v+h*.16]],L*.028,{seed:seed+2+i,taper:.3,wobble:1}));}s.knockout(q,.95);}
 s.restore();
}
/** Tunnel vision: a stepped navy vignette closing to one spot. amount 1 = closed to radius r, 0 = open. */
function tunnel(s:Sheet,x:number,y:number,r:number,amount:number,seed:number,shake=0){
 if(amount<=.03)return;const R=r+(1-amount)*1500;
 s.tone(K,ring(x,y,R*1.6,4000),.9*amount);s.tone(K,ring(x,y,R*1.25,R*1.6),.7*amount);s.tone(K,ring(x,y,R,R*1.25),.45*amount);
 contour(s,K,blob(x,y,R,R,seed,{amp:.05+shake*.08,n:36}),12,{close:true,seed:seed+(shake>0?1:0),pressure:.5,wobble:2+shake*6,cov:.9*amount});
}
/** Speed streaks streaming from the vanishing point (the rush): paper quads, reseeded per drawn frame while moving. */
function rush(s:Sheet,vp:Pt,amount:number,seed:number,ti:number,box:[number,number,number,number]){
 if(amount<=.02)return;const rr=rng(seed+ti%4),p=new Path2D();
 for(let i=0;i<26;i++){const a=(rr()*TAU),r0=140+rr()*260,L=(80+rr()*260)*amount,w=3+rr()*5,ca=Math.cos(a),sa=Math.sin(a);const x0=vp[0]+ca*r0,y0=vp[1]+sa*r0;
  if(x0<box[0]||x0>box[0]+box[2]||y0<box[1]||y0>box[1]+box[3])continue;p.moveTo(x0,y0);p.lineTo(x0+ca*L,y0+sa*L);p.lineTo(x0+ca*L-sa*w,y0+sa*L+ca*w);p.lineTo(x0-sa*w,y0+ca*w);p.closePath();}
 s.knockout(p,.7*Math.min(1,amount));
}
/** A yellow sight wedge from a head/eye toward `ang` (looking = a beam that reveals). */
function sight(s:Sheet,x:number,y:number,ang:number,half:number,L:number,seed:number,g=1){
 if(g<=0)return;const pts:Pt[]=[[x,y]];for(let i=0;i<=8;i++){const a=ang-half+2*half*i/8;pts.push([x+Math.cos(a)*L*g,y+Math.sin(a)*L*g]);}
 const p=polyPath(wob(pts,6,seed,true,{step:26,corner:.5}),true);s.knockout(p,.3);s.tone(Y,p,.45);
}

// ---------------- the windshield: cabin frame, rain, wipers ----------------
type Pane={half:number;top:number;dash:number;lean?:number};
const PANE:Pane={half:540,top:-440,dash:360,lean:50};
function openingPts(p:Pane,seed:number){const{half,top,dash,lean=50}=p;return handCut([[-half+lean,top],[half-lean,top],[half,dash],[-half,dash]],seed,9,150);}
function opening(p:Pane,seed:number){return polyPath(openingPts(p,seed),true);}
/** The cabin: everything outside the opening in deep navy over a blue screen (evenodd fills, paper speckle through), a paper bevel along
 * the opening's cut edge, the dashboard's paper-and-blue lip, the rear-view mirror. */
function cabin(s:Sheet,p:Pane,open:Path2D,seed:number,o:{mirror?:boolean}={}){
 const{mirror=true}=o,cab=new Path2D();cab.addPath(BIG);cab.addPath(open);s.knockout(cab,1,'evenodd');s.tone(B,cab,.75,undefined,'evenodd');s.fill(K,cab,.88,'evenodd');
 s.knockout(ribbon(openingPts(p,seed),9,{seed:seed+4,close:true,pressure:.3,taper:0,wobble:1,step:40}),.4);
 const lip=polyPath(wob([[-p.half-60,p.dash],[p.half+60,p.dash],[p.half+60,p.dash+24],[-p.half-60,p.dash+24]],3,seed+1,true,{step:60,corner:.3}),true);s.knockout(lip,.95);s.tone(B,lip,.6);
 if(mirror){s.fill(K,ribbon([[0,p.top-20],[0,p.top+66]],12,{seed:seed+2,taper:0,wobble:1}));s.fill(K,polyPath(wob([[-80,p.top+60],[80,p.top+60],[86,p.top+108],[-86,p.top+108]],2,seed+3,true,{step:20,corner:.4}),true));}
}
/** A wiper: pivot (px,py), arm along ang, rubber blade over the outer 55 %. */
function wiper(s:Sheet,px:number,py:number,len:number,ang:number,seed:number){
 const tx=px+Math.cos(ang)*len,ty=py+Math.sin(ang)*len;
 const nx=-Math.sin(ang),ny=Math.cos(ang),bx=px+Math.cos(ang)*len*.42,by=py+Math.sin(ang)*len*.42;
 s.fill(K,ribbon([[px,py],[tx,ty]],16,{seed,taper:.1,pressure:.2,wobble:1}));
 s.fill(K,ribbon([[bx,by],[tx+Math.cos(ang)*10,ty+Math.sin(ang)*10]],38,{seed:seed+1,taper:.05,pressure:.2,wobble:1.2}));
 // the rubber lip: a paper line along the blade's leading edge
 s.knockout(ribbon([[bx+nx*14,by+ny*14],[tx+nx*14+Math.cos(ang)*6,ty+ny*14+Math.sin(ang)*6]],5,{seed:seed+3,taper:.2,wobble:.8}),.9);
 s.fill(K,polyPath(blob(px,py,24,24,seed+2,{amp:.05,n:16}),true));
}
const sector=(px:number,py:number,r:number,a0:number,a1:number)=>{const p=new Path2D();p.moveTo(px,py);p.arc(px,py,r,a0,a1,false);p.closePath();return p;};
const W_A0=190*D,W_A1=305*D;
/** Wiper sweep state from a list of [start, duration] sweeps: u = blade position 0..1, reach = the cleared extent, clean = 1 while sweeping then decays. */
function wipes(t:number,sweeps:[number,number][]){let u=0,reach=0,clean=0;
 for(const[t0,dur] of sweeps){if(t<t0)continue;const p=(t-t0)/dur;
  if(p<=1){const up=p<.5?easeIO(p*2):1-easeIO((p-.5)*2);u=Math.max(u,up);reach=1;clean=1;}
  else{const c=1-clamp((t-t0-dur)/1.6);if(c>clean){clean=c;reach=Math.max(reach,c>0?1:0);}}}
 return{u,reach,clean};}
/** Rain on the glass: paper streaks running down, absent where the wipers have cleared. */
function rain(s:Sheet,open:Path2D,p:Pane,cov:number,seed:number,drift:number,sectors:Path2D[],clean:number){
 if(cov<=.02)return;const rr=rng(seed),path=new Path2D(),bx=-p.half-40,by=p.top-40,bw=p.half*2+80,bh=p.dash-p.top+80,ca=Math.cos(82*D),sa=Math.sin(82*D);
 for(let i=0;i<44;i++){const x=bx+rr()*bw,y=by+((rr()*bh+drift)%bh+bh)%bh,L=50+rr()*170,w=3+rr()*5;path.moveTo(x,y);path.lineTo(x+ca*L,y+sa*L);path.lineTo(x+ca*L-sa*w,y+sa*L+ca*w);path.lineTo(x-sa*w,y+ca*w);path.closePath();}
 s.save();s.clip(open);for(const sec of sectors){const m=new Path2D();m.addPath(BIG);m.addPath(sec);s.clip(m,'evenodd');}s.knockout(path,cov);s.restore();
 if(clean<1&&sectors.length){const u=new Path2D();for(const sec of sectors)u.addPath(sec);s.save();s.clip(open);s.clip(u);s.knockout(path,cov*(1-clean));s.restore();}
}
/** Both tandem wipers + the rain, given the sweep state; returns nothing. reach/clean from wipes(). */
function glass(s:Sheet,open:Path2D,p:Pane,st:{u:number;reach:number;clean:number},rainCov:number,seed:number,drift:number){
 const len=p.half*1.18,py=p.dash+40,pivots=[-p.half*.48,p.half*.48],ang=W_A0+(W_A1-W_A0)*st.u,reachA=W_A0+(W_A1-W_A0)*Math.max(st.u,st.reach);
 const sectors=st.reach>0?pivots.map(px=>sector(px,py,len*1.06,W_A0,reachA)):[];
 rain(s,open,p,rainCov,seed,drift,sectors,st.clean);
 pivots.forEach((px,i)=>wiper(s,px,py,len,ang,seed+10+i));
}
/** A paper road post with an orange face, at pitch coords. */
function post(s:Sheet,px:number,d:number,vp:Pt,seed:number){const g=G(px,d,vp),h=90*g.sz,w=16*g.sz;if(h<6)return;const p=polyPath(wob([[g.x-w/2,g.y],[g.x+w/2,g.y],[g.x+w/2,g.y-h],[g.x-w/2,g.y-h]],1.5,seed,true,{step:12,corner:.3}),true);s.knockout(p,.95);s.fill(O,polyPath([[g.x-w/2,g.y-h*.55],[g.x+w/2,g.y-h*.55],[g.x+w/2,g.y-h],[g.x-w/2,g.y-h]],true),.95);}
/** Camera through segment-eased keys [t,x,y,zoom,rot?] (exact at cue times). */
// moving holds: a camera hold creeps toward the next key instead of parking (stutter audit, Oct 4 2026)
function cam(s:Sheet,t:number,keys:Key[],dx=0,dy=0,rot=0){const v=key(t,creepHolds(keys),easeIO,true);s.camera(v[0]+dx,v[1]+dy,v[2],(v[3]??0)+rot);return v;}

// ---------------- chapters ----------------
// ch1 — a night stadium from behind a player: two players, a riser lifts one; technique and speed do not move it, the decision does
function b1(t:number){const rise=90*(t<2.35?0:anticipate(2.35,2.95,t,{back:.09,hold:.25,e:easeOut}))+10*settle(t,2.95,{amp:1,freq:3,decay:4})+60*sm(9.2,9.8,t,easeOut)+8*settle(t,9.8,{amp:1,freq:3,decay:4});
 const look=key(t,[[8.62,0],[8.72,-.15],[9.1,1,easeOut]]);const size=250;const x=278,y=247-rise;return{x,y,size,rise,look,head:[x+.12*look*size,y-.82*size] as Pt};}
const ch1:Scene={
 draw(s,t){
  const b=b1(t),tt=twos(t),ti=twosIndex(t);
  cam(s,t,[[0,0,120,1.0],[2.35,40,100,1.05],[4.9,0,80,1.1],[6.66,-120,60,1.12],[8.62,-60,60,1.14],[10.4,200,30,1.22],[11.45,b.head[0],b.head[1],1.45],[12.1,b.head[0]+1,b.head[1],1.452]]);
  night(s,VP,{sky:.6,ground:.32,seed:11});
  // the stand: a torn navy band on the horizon with paper crowd dots printing row by row
  s.fill(K,tornRect(-4000,-262,8000,100,12,16),.9);
  const rows=Math.min(3,1+Math.floor(t*2.5));for(let r=0;r<rows;r++)confetti(s,['paper'],[-1200,-250+r*28,2400,22],26,13+r,{size:12,cov:.9});
  // the floodlight: three stepped yellow wedges from the top-left, one per drawn frame
  const steps=t<.1?0:t<.2?1:t<.3?2:3;
  for(let i=0;i<steps;i++){const half=(9+i*8)*D,L=1500;const pts:Pt[]=[[-760,-560]];for(let k=0;k<=6;k++){const a=52*D-half+2*half*k/6;pts.push([-760+Math.cos(a)*L,-560+Math.sin(a)*L]);}const p=polyPath(wob(pts,8,21+i,true,{step:40,corner:.5}),true);s.knockout(p,[.3,.2,.12][i]);s.tone(Y,p,[.45,.32,.2][i]);}
  const lit=sm(.1,.6,t,easeOut);fan(s,VP,1,[.6*lit,.45*lit,.3*lit],31,{d0:.02,d1:.9,flare:0});
  pitchLines(s,VP,.85,41);
  // the riser under B: a navy step with a paper top edge
  if(b.rise>0){const top=247-b.rise+6,pts=handCut([[b.x-150,top],[b.x+150,top],[b.x+160,247+40],[b.x-160,247+40]],51,6,80),blk=polyPath(pts,true);s.knockout(blk,.95);s.fill(B,blk,.95);s.tone(K,blk,.45);s.knockout(ribbon([[b.x-150,top],[b.x+150,top]],12,{seed:52,pressure:.5,taper:.2,wobble:1.5,step:30}),.95);}
  // the sight wedge from B's head (8.62) → the ring in open space → the lane
  const ringAt:Pt=[-234,-30],ringG=easeOutBack(sm(9.25,9.6,t)),wedge=sm(8.72,9.3,t,easeIO);
  if(wedge>0&&t<10.4){const a=lerp(215*D,Math.atan2(ringAt[1]-b.head[1],ringAt[0]-b.head[0]),wedge);sight(s,b.head[0],b.head[1],a,9*D,640,61,Math.min(1,wedge*3)*(1-sm(10.0,10.4,t)));}
  marker(s,ringAt[0],ringAt[1],78,Math.min(1.15,ringG),62);
  lane(s,[b.x-40,b.y],ringAt,10,63,sm(9.5,10.0,t,easeOut));
  // A: juggles at 4.9, sprints at 6.66; B: stands on the riser, turns its head at 8.62
  const jug=t>=4.9&&t<6.1,pop1=sm(4.9,5.5,t,linear),pop2=sm(5.5,6.1,t,linear),sprint=t<6.66?0:anticipate(6.66,7.3,t,{back:.06,hold:.2,e:easeIO}),back=sm(7.5,8.1,t,easeIO);
  const ax=-278+(-160*clamp(sprint)+160*back)+(t>7.3&&t<7.5?20*settle(t,7.3,{amp:1,freq:4,decay:5}):0),moving=(sprint>0&&sprint<1)||(back>0&&back<1),st=stride(ti);
  person(s,ax,247,250,'us',71,moving?'run':jug?'kick':'stand',{facing:moving?(back>0?1:-1):1,legs:moving?st.legs:undefined,arms:moving?st.arms:undefined,tilt:moving?.12:t>=6.66&&t<6.8?.1:0});
  if(moving)speedLines(s,K,ax+(back>0?-30:30),150,back>0?0:Math.PI,{n:4,seed:72+ti,len:110,spread:40,width:6,cov:.85});
  person(s,b.x,b.y,b.size,'us',73,t>=10.9&&t<11.2?'kick':'stand',{facing:-1,head:[-.12*b.look,-.82]});
  // the ball: at A's foot, juggled twice, passed to B at 10.4, played first-time along the lane at 11.15
  let bx=ax+40,by=225,r=40,rot=tt*2;
  if(t>=4.9&&t<6.1){const u=t<5.5?pop1:pop2,lift=t<5.5?140:100;by=225-lift*Math.sin(u*Math.PI);if(u>.96)by+=0;}
  if(t>=6.1)bx=-238;
  const pass=sm(10.4,11.1,t,easeOut),play=sm(11.15,11.85,t,easeOut);
  if(t>=10.4&&t<11.15){bx=lerp(-238,b.x-30,pass);by=lerp(225,b.y-20,pass)-60*Math.sin(pass*Math.PI);rot=pass*5;}
  if(t>=11.15){bx=lerp(b.x-30,ringAt[0],play);by=lerp(b.y-20,ringAt[1],play)-40*Math.sin(play*Math.PI);r=lerp(40,28,play);rot=5+play*5;}
  const sq=(t>=5.48&&t<5.6)||(t>=6.08&&t<6.2)||(t>=11.1&&t<11.2)?.86:1;
  ball(s,bx,by,r,rot,74,{sx:2-sq,sy:sq,pool:t<10.4?.8:0});
  if((t>=5.48&&t<5.9)||(t>=6.08&&t<6.5))dust(s,null,bx,by+r,50,7,{seed:75+ti,size:6,cov:.8});
  // me, from behind, at the bottom
  person(s,0,475,330,'me',76,'stand',{facing:1,tilt:.02*Math.sin(t*1.4)});
 },
 aperture(t){const b=b1(t);return apertureDisc(b.head[0],b.head[1],34,12);},
 still:9.6,
};
// ch2 — ground level: the ball rolls to my feet; a presser arrives at the same instant; rewind; lift the head; the pane assembles and widens
function pane2(t:number):Pane{const inn=clamp(easeOutBack(sm(7.16,7.66,t)),0,1.1),wide=sm(8.33,9.13,t,easeOut);const half=lerp(lerp(1400,250,inn),540,wide);return{half,top:lerp(-1400,-440,inn),dash:lerp(1400,360,inn),lean:lerp(0,50,inn)};}
const ch2:Scene={
 draw(s,t){
  const ti=twosIndex(t),tt=twos(t);
  const jolt=settle(t,2.45,{amp:24,freq:4,decay:5}),dip=t>=5.81&&t<6.0?10*Math.sin(sm(5.81,6.0,t)*Math.PI):0;
  cam(s,t,[[0,0,380,1.2],[2.13,0,380,1.21],[3.68,0,380,1.21],[5.81,0,380,1.22],[6.81,0,-40,1.24],[7.16,0,-40,1.24],[8.33,0,-60,1.25],[10.35,0,-90,1.36],[11,0,-90.5,1.362]],jolt,dip,3*D*settle(t,2.45,{amp:1,freq:3,decay:4}));
  const p=pane2(t),open=opening(p,81);
  s.save();if(t>=7.16)s.clip(open);
  night(s,VP,{sky:.6,ground:.32,seed:82});
  fan(s,VP,1,[.65,.48,.3],83,{d0:.02,d1:.9,flare:0});
  pitchLines(s,VP,.85,84);
  // players revealed by the pane widening (8.33): two teammates on the left wing, a defender on the right
  const wide=sm(8.33,9.13,t,easeOut);
  if(wide>0){const u1=G(-.5,.45),u2=G(-.5,.62),d1=G(.52,.5);person(s,u1.x,u1.y,250*u1.sz,'us',85,'stand',{facing:1});person(s,u2.x,u2.y,250*u2.sz,'us',86,'lean',{facing:1,tilt:.05});person(s,d1.x,d1.y,250*d1.sz,'them',87,'lean',{facing:-1});}
  // the presser: in at 2.13 (smear), out at 3.68 (smear)
  const inU=sm(2.13,2.45,t,easeOut),outU=sm(3.68,4.05,t,easeIn),st=stride(ti);
  if(t>=2.13&&t<4.1){const px=t<3.68?lerp(760,110,inU):lerp(110,820,outU),mv=(inU>0&&inU<1)||(outU>0&&outU<1);person(s,px,470,380,'them',88,mv?'run':'lean',{facing:-1,legs:mv?st.legs:undefined,arms:mv?st.arms:undefined,tilt:mv?.15:.2});if(mv)speedLines(s,K,px+60,300,Math.PI,{n:5,seed:89+ti,len:140,spread:60,width:7,cov:.85});}
  // me: from behind; the head lifts at 5.81; the ball comes to my feet
  const lift=sm(5.81,6.81,t,easeIO);
  person(s,0,520,420,'me',90,'stand',{facing:1,headDrop:[0,lerp(.09,-.03,lift)],tilt:.02*Math.sin(t*1.3)});
  boot(s,-40,522,120,0,91,{mirror:true,laces:false});boot(s,60,526,120,0,92,{mirror:true,laces:false});
  // the ball: rolls in (0 → 2.13), squashes on the toe, rewinds (3.68), rolls in slowly for the rest, arrives at 10.2
  let bx:number;const r=62;
  if(t<2.13)bx=lerp(-820,-150,sm(0,2.13,t,easeOut));
  else if(t<3.68)bx=-150;
  else if(t<4.05)bx=lerp(-150,-780,outU);
  else bx=lerp(-780,-150,sm(4.05,10.2,t,linear));
  const sq=t>=2.13&&t<2.3?.86:t>=10.2&&t<10.35?.94:1;
  ball(s,bx,522-r,r,bx/r,93,{sx:2-sq,sy:sq,pool:.8});
  if(t>=2.13&&t<2.6)dust(s,null,-110,522,60,8,{seed:94+ti,size:7,cov:.85});
  if(t>=3.68&&t<4.05)speedLines(s,K,bx+40,522-r,Math.PI,{n:4,seed:97+ti,len:150,spread:40,width:6,cov:.85});
  s.restore();
  // the pane frame arrives (7.16) with rain; a sweep clears an arc; a second sweep with the widening
  if(t>=7.0){const rainIn=sm(7.3,7.8,t);cabin(s,p,open,95,{mirror:t>=7.4});glass(s,open,p,wipes(t,[[7.5,1.0],[8.5,1.1]]),.75*rainIn,96,40*t);}
  void tt;
 },
 aperture(){return apertureDisc(0,-130,80,12);},
 still:9.3,
};
// ch3 — the full windshield: a night road; the view tunnels to one spot; a defender arrives as a surprise; the road opens as a pitch
function tun3(t:number){return sm(2.48,3.3,t,easeIn)*(1-sm(7.66,8.46,t,easeOut));}
const ch3:Scene={
 draw(s,t){
  const ti=twosIndex(t),tt=twos(t),tun=tun3(t),jolt=settle(t,5.63,{amp:30,freq:4,decay:5});
  cam(s,t,[[0,0,0,1.0],[2.48,0,-20,1.04],[3.3,0,-40,1.1],[5.38,0,-40,1.1],[7.66,0,-40,1.12],[10.05,-180,110,1.32],[10.7,-181,110.5,1.322]],jolt,0,3*D*settle(t,5.63,{amp:1,freq:3,decay:4}));
  const p=PANE,open=opening(p,101),scroll=t*.22;
  s.save();s.clip(open);
  night(s,VP,{sky:.62,ground:.34,seed:102});
  const spread=key(t,[[2.48,1],[2.6,1.1],[3.3,.34,easeIn],[7.66,.34],[8.46,1,easeOut]]);
  fan(s,VP,spread,[.7,.5,.32],103,{d0:.02,d1:.9,flare:.15});
  // the road: yellow centre dashes and orange posts scrolling toward us (we drive)
  const dashes=new Path2D();for(let i=0;i<12;i++){const d=((i/12-scroll)%1+1)%1;if(d>.92)continue;const a=G(0,d),b=G(0,Math.min(.95,d+.035)),w=26*a.sz;dashes.addPath(polyPath([[a.x-w/2,a.y],[a.x+w/2,a.y],[b.x+w/2*b.sz/a.sz,b.y],[b.x-w/2*b.sz/a.sz,b.y]],true));}
  s.knockout(dashes,.95);s.tone(Y,dashes,.75);
  for(let i=0;i<6;i++){const d=((i/6-scroll*.9)%1+1)%1;if(d>.9)continue;post(s,-.92,d,VP,111+i);post(s,.92,d,VP,121+i);}
  // the pitch appears when the tunnel opens (7.66): the road was a pitch all along
  const pitch=sm(7.66,8.3,t,easeOut);pitchLines(s,VP,.85*pitch,104);
  // the ball on the centre line; knocked away by the surprise (5.5)
  const knock=sm(5.5,5.8,t,easeOut);const bx=lerp(0,-430,knock),by=lerp(140,175,knock);
  ball(s,bx,by,56,-scroll*14+knock*6,105,{pool:.9,sx:t>=5.5&&t<5.62?1.15:1,sy:t>=5.5&&t<5.62?.86:1});
  // the surprise: an orange defender smears in from behind the right pillar into the spot
  const arr=sm(5.38,5.63,t,easeOut),st=stride(ti);
  if(t>=5.38){const px=lerp(760,90,arr)+(arr>=1?14*settle(t,5.63,{amp:1,freq:4,decay:5}):0),mv=arr<1;person(s,px,330,380,'them',106,mv?'run':'lean',{facing:-1,legs:mv?st.legs:undefined,arms:mv?st.arms:undefined,tilt:mv?.15:.18});if(mv)speedLines(s,K,px+70,160,Math.PI,{n:6,seed:107+ti,len:180,spread:70,width:8,cov:.9});}
  // revealed by the opening: three more orange players and two teammates were there all along
  if(pitch>0){const o1=G(.6,.55),o2=G(-.2,.7),u1=G(-.7,.45),u2=G(-.45,.65);person(s,o1.x,o1.y,250*o1.sz,'them',108,'lean',{facing:-1});person(s,o2.x,o2.y,250*o2.sz,'them',109,'stand',{facing:1});person(s,u1.x,u1.y,250*u1.sz,'us',110,'stand',{facing:1});person(s,u2.x,u2.y,250*u2.sz,'us',112,'lean',{facing:1,tilt:.04});}
  // the tunnel
  tunnel(s,0,60,190,tun,113,t>=5.63&&t<6.05?1:0);
  s.restore();
  cabin(s,p,open,114);
  // wipers: two sweeps, then stuck mid-pane from 2.6 until the view opens (7.9), then they resume
  const tw=t<2.6?t:t<7.9?2.6:t-5.3;
  glass(s,open,p,wipes(tw,[[.3,1.0],[1.5,1.0],[2.2,1.0],[3.6,1.8]]),.75,115,40*t);
  void tt;
 },
 aperture(){return apertureDisc(-230,215,84,12);},
 still:8.9,
};
// ch4 — only the ball; the rush; the scan (the world pans inside the pane); pressure and teammates marked early; the world slows; the ball hangs
function look4(t:number){return key(t,[[3.78,0],[3.93,.1],[4.2,-1,easeIO],[5.5,1,easeIO],[5.9,1],[6.4,0,easeIO],[6.57,0],[7.0,-.5,easeIO],[8.37,-.5],[9.5,0,easeIO]]);}
function flight4(t:number){if(t<8.0)return 0;return t<8.37?(t-8.0)/.8:.46+.5*(1-Math.exp(-(t-8.37)/1.2));}
function ball4(t:number):{x:number;y:number;r:number}{const u=flight4(t),shift=-240*look4(t);if(t<8.0)return{x:0+shift,y:60,r:120};
 const a:Pt=[-300+shift,80],b:Pt=[60,420];return{x:lerp(a[0],b[0],u),y:lerp(a[1],b[1],u)-260*4*u*(1-u),r:lerp(70,110,u)};}
const ch4:Scene={
 draw(s,t){
  const ti=twosIndex(t),tt=twos(t),look=look4(t),shift=-240*look,bl=ball4(t);
  const shake=(t>=1.99?settle(t,1.99,{amp:14,freq:7,decay:1.4}):0);
  cam(s,t,[[0,0,40,1.0],[1.99,0,40,1.04],[3.78,0,40,1.06],[5.18,0,20,1.08],[6.57,20,20,1.1],[8.37,0,0,1.12],[9.76,0,-20,1.15],[11.65,bl.x,bl.y,1.38],[12.3,bl.x+1,bl.y,1.382]],shake,shake*.6,2*D*look);
  const p:Pane={...PANE,half:540+40*sm(8.37,9.76,t,easeOut)},open=opening(p,131);
  s.save();s.clip(open);
  s.save();s.translate(shift,0);
  night(s,VP,{sky:.6,ground:.32,seed:132});
  fan(s,VP,1,[.65,.48,.3],133,{d0:.02,d1:.9,flare:.12});
  pitchLines(s,VP,.85,134);
  // the rush: streaks from the vanishing point, two orange figures whipping across the spot's edges
  const rushA=key(t,[[1.99,0],[2.3,1,easeOut],[3.78,1],[5.0,.3,easeOut],[8.37,.3],[9.5,0,easeOut]]);
  rush(s,VP,rushA,135,ti,[-900,-500,1800,900]);
  const st=stride(ti);
  for(const[t0,x0,x1,sd] of [[2.2,-700,700,136],[2.9,700,-700,137]] as [number,number,number,number][]){const u=sm(t0,t0+.32,t,linear);if(u>0&&u<1){const x=lerp(x0,x1,u);person(s,x,300,300,'them',sd,'run',{facing:x1>x0?1:-1,legs:st.legs,arms:st.arms,tilt:.2});speedLines(s,K,x,160,x1>x0?0:Math.PI,{n:5,seed:sd+ti,len:220,spread:60,width:8,cov:.9});}}
  // the presser on the right (found at 5.18), teammates on the left (found at 6.57); rings pop on them; a lane to the nearer one
  const pr=G(.7,.35),prU=sm(5.18,5.5,t,easeOutBack),crawl=lerp(1,.12,sm(8.37,9.76,t,easeOut)),run=t<7.6?0:Math.min(1,(t<8.37?(t-7.6)*.5:.385+(t-8.37)*.5*crawl));
  const prX=pr.x-260*run,prY=pr.y+60*run,prMv=run>0&&run<1;
  person(s,prX,prY,250*pr.sz,'them',138,prMv?'run':'lean',{facing:-1,legs:prMv?st.legs:undefined,arms:prMv?st.arms:undefined,tilt:prMv?.15:.16});
  marker(s,prX,prY+8,90*pr.sz+20,Math.min(1.15,prU),139);
  const u1=G(-.6,.5),u2=G(-.8,.65),r1=sm(6.57,6.9,t,easeOutBack),r2=sm(6.77,7.1,t,easeOutBack);
  person(s,u1.x,u1.y,250*u1.sz,'us',140,t>=7.85&&t<8.15?'kick':'stand',{facing:1});person(s,u2.x,u2.y,250*u2.sz,'us',141,'lean',{facing:1,tilt:.04});
  marker(s,u1.x,u1.y+8,90*u1.sz+20,Math.min(1.15,r1),142);marker(s,u2.x,u2.y+8,90*u2.sz+20,Math.min(1.15,r2),143);
  lane(s,[0-shift,400],[u1.x+30,u1.y-10],10,144,sm(6.9,7.4,t,easeOut));
  // the ball: alone in the spot (rolling, then spinning in the rush), lobbed toward me at 8.0, its flight slowing until it hangs
  const spin=t<1.99?tt*1.5:t<3.78?tt*14:t<8.0?tt*1.5+30:30+flight4(t)*8;
  ball(s,bl.x-shift,bl.y,bl.r,spin,145,{pool:t<8.0?1:0,lit:1});
  if(t>=8.0&&t<8.4)speedLines(s,K,bl.x-shift,bl.y,Math.atan2(340,360),{n:4,seed:146+ti,len:120,spread:40,width:6,cov:.8});
  // the tunnel spot on the ball: tightens, jitters in the rush, opens with the scan
  const tunA=key(t,[[0,1],[3.78,1],[4.6,0,easeOut]]),tunR=key(t,[[0,260],[.8,190,easeOut]])+(t>=1.99&&t<3.78?6*(ti%2?1:-1):0);
  tunnel(s,bl.x-shift,bl.y,tunR,tunA,147,t>=1.99&&t<3.5?.5:0);
  s.restore();
  // droplets on the pane that hold still once time is created
  const drops=new Path2D(),rr=rng(148);for(let i=0;i<9;i++){const x=-420+rr()*840,y0=-380+rr()*600,fall=Math.min(t,9.76)*(20+rr()*30);drops.addPath(polyPath(blob(x,((y0+fall+400)%760)-400,6+rr()*6,9+rr()*8,149+i,{amp:.1,n:12}),true));}
  s.knockout(drops,.85);
  s.restore();
  cabin(s,p,open,150);
  // wipers: three fast flicks in the rush, one normal sweep at 6.57, then the sweep that decelerates from 8.37 (the clock hand slows)
  let st4=wipes(t,[[1.99,.45],[2.5,.45],[3.0,.45],[6.57,1.0]]);
  if(t>=8.37){const q=easeOut(clamp((t-8.37)/3.4)),u=q<.5?easeIO(q*2):1-easeIO((q-.5)*2);st4={u:Math.max(st4.u,u),reach:1,clean:1};}
  glass(s,open,p,st4,.7,151,40*Math.min(t,9.76));
 },
 aperture(t){const b=ball4(t);return apertureDisc(b.x,b.y,b.r*.8,12);},
 still:10.6,
};
// ch5 — the pre-receive picture: pressure (orange mass) from the right, teammates moving, the open space pooling on the left, then the pass into it
const P5:Pane={half:600,top:-440,dash:470,lean:50};
const ME5:Pt=[0,385];
function ballIn5(t:number){const u=Math.pow(clamp(t/8.1),1.6);return{x:lerp(330,40,u),y:lerp(-300,375,u),r:lerp(40,70,u),u};}
function kick5(t:number){return t>=8.3;}
function boot5():Pt{return[ME5[0]+.44*320-10,ME5[1]-.2*320];}
const ch5:Scene={
 draw(s,t){
  const ti=twosIndex(t),tt=twos(t),shove=settle(t,2.7,{amp:20,freq:3.5,decay:4}),bt=boot5();
  cam(s,t,[[0,0,60,1.0],[1.93,0,60,1.04],[2.7,-20,60,1.05],[4.04,0,60,1.06],[5.98,-60,40,1.08],[8.09,-80,40,1.1],[10.25,bt[0],bt[1],1.42],[10.9,bt[0]+1,bt[1],1.422]],-shove,0,-3*D*settle(t,2.7,{amp:1,freq:3,decay:3}));
  const p=P5,open=opening(p,161);
  s.save();s.clip(open);
  night(s,VP,{sky:.6,ground:.32,seed:162});
  const poolG=easeOutBack(sm(5.98,6.5,t))*(1+.15*sm(6.5,9.0,t));
  fan(s,VP,1,[.65,.48+.12*clamp(poolG),.3],163,{d0:.02,d1:.9,flare:.12});
  pitchLines(s,VP,.85,164);
  // the open space: a yellow pool with a paper rim on the left-forward pitch
  const POOL:Pt=[-194,90];
  if(poolG>0){const rim=polyPath(blob(POOL[0],POOL[1],270*poolG,110*poolG,165,{amp:.06,n:32}),true);s.knockout(rim,.95);s.fill(Y,polyPath(blob(POOL[0],POOL[1],250*poolG,96*poolG,166,{amp:.06,n:32}),true),.85);}
  // the pressing mass: one huge torn orange wedge from the right with two orange figures at its front; brown shadow ahead of the edge
  const edgeX=key(t,[[1.93,1500],[2.08,1560],[2.7,540,easeIn],[2.9,510],[8.4,510],[9.3,230,easeIn],[9.5,200],[10.2,270,easeOut]]);
  if(t>=1.93){const edge:Pt[]=[[edgeX+40,-460],[edgeX-30,-200],[edgeX+20,80],[edgeX-20,300],[edgeX+30,560]];const cut=handCut(edge,167,50,120,false);
   s.tone(O,polyPath([[edgeX-140,-460],...cut.map(q=>[q[0]-100,q[1]] as Pt),[edgeX-140,560]],true),.45);
   const body=polyPath([...cut,[4000,560],[4000,-460]],true);s.knockout(body,.95);s.fill(O,body,.85);
   const st=stride(ti),mv=(t>2.08&&t<2.9)||(t>8.4&&t<9.5);
   person(s,edgeX-90,300,300,'them',168,mv?'run':'lean',{facing:-1,legs:mv?st.legs:undefined,arms:mv?st.arms:undefined,tilt:mv?.15:.2});
   person(s,edgeX-60,80,220,'them',169,mv?'run':'lean',{facing:-1,legs:mv?st.legs:undefined,arms:mv?st.arms:undefined,tilt:mv?.15:.2});
   marker(s,edgeX-90,310,110,Math.min(1.15,easeOutBack(sm(2.9,3.25,t))),170);}
  // teammates: the near one is shoved by the mass (2.7) then escapes forward-left into the space; the other runs up the left wing
  const st=stride(ti),crumple=sm(2.6,2.8,t,easeOut)*(1-sm(3.4,4.0,t,easeOut));
  const r1=t<4.04?0:anticipate(4.04,6.2,t,{back:.04,hold:.12,e:easeIO}),r2=t<4.3?0:anticipate(4.3,6.0,t,{back:.04,hold:.12,e:easeIO});
  const A1=G(.45,.5),B1:Pt=[POOL[0]+10,POOL[1]+20],A2=G(-.45,.35),B2=G(-.7,.6);
  const t1x=lerp(A1.x-40*crumple,B1[0],clamp(r1)),t1y=lerp(A1.y,B1[1],clamp(r1)),m1=r1>0&&r1<1;
  const t2x=lerp(A2.x,B2.x,clamp(r2)),t2y=lerp(A2.y,B2.y,clamp(r2)),m2=r2>0&&r2<1;
  lane(s,[A1.x,A1.y-20],B1,8,171,sm(4.04,4.6,t,easeOut),{dashes:7,cov:.7});lane(s,[A2.x,A2.y-20],[B2.x,B2.y],8,172,sm(4.3,4.9,t,easeOut),{dashes:7,cov:.7});
  const cush=t>=9.05&&t<9.25?.06:0;
  person(s,t1x,t1y,250*lerp(A1.sz,.6,clamp(r1)),'us',173,m1?'run':'stand',{facing:-1,legs:m1?st.legs:undefined,arms:m1?st.arms:undefined,tilt:m1?.14:.3*crumple,scaleX:(1-.18*crumple)*(1+cush),headDrop:[0,.06*crumple]});
  person(s,t2x,t2y,250*lerp(A2.sz,B2.sz,clamp(r2)),'us',174,m2?'run':'stand',{facing:-1,legs:m2?st.legs:undefined,arms:m2?st.arms:undefined,tilt:m2?.14:0});
  if(m1)speedLines(s,K,t1x+30,t1y-100,Math.PI*.9,{n:3,seed:175+ti,len:90,spread:30,width:5,cov:.8});
  // me: scanning (head turns), then the first-time pass into the pool at 8.3
  const hl=key(t,[[0,0],[.4,.5,easeIO],[2.0,-.6,easeIO],[3.2,-.2],[5.98,-.6,easeIO],[7.6,0,easeIO]]),kk=kick5(t),wind=t>=8.1&&t<8.3;
  const kL=poseLimbs('kick'),sL=poseLimbs('stand');
  const me=person(s,ME5[0],ME5[1],320,'me',176,kk?'kick':'stand',{facing:1,head:kk?undefined:[.12*hl,-.82],legs:wind?mixLimbs(sL.legs,[[[-.04,-.3],[-.1,-.15],[-.14,0]],[[.05,-.3],[-.12,-.2],[-.26,-.12]]] as Limb[],sm(8.1,8.3,t)):undefined,arms:wind?mixLimbs(sL.arms,kL.arms,sm(8.1,8.3,t)):undefined,tilt:kk?0:.02*Math.sin(t*1.5)});
  boot(s,me.feet[0][0]+18,me.feet[0][1]+2,80,0,177,{laces:false});boot(s,me.feet[1][0]+(kk?24:18),me.feet[1][1]+2,80,kk?-.3:0,178,{laces:false});
  // the ball: descending slowly (created time) to my feet, landing at 8.1; the pass at 8.3 → 9.05 into the pool
  const bi=ballIn5(t),pass=sm(8.3,9.05,t,easeOut);
  let bx=bi.x,by=bi.y,br=bi.r,rot=tt*.8;
  if(t>=8.1&&t<8.3){bx=40;by=375-70;}
  if(t>=8.3){bx=lerp(40,POOL[0],pass);by=lerp(375-70,POOL[1]-40,pass)-70*Math.sin(pass*Math.PI);br=lerp(70,44,pass);rot=pass*7;}
  const sq=(t>=8.1&&t<8.25)||(t>=9.05&&t<9.2)?.86:1;
  ball(s,bx,by,br,rot,179,{sx:2-sq,sy:sq,pool:t<8.1?.4:.9});
  if(t>=8.1&&t<8.5)dust(s,null,40,375,50,7,{seed:180+ti,size:6,cov:.8});
  if(pass>0&&pass<.5)speedLines(s,K,bx,by,Math.atan2(POOL[1]-305,POOL[0]-40),{n:4,seed:181+ti,len:110,spread:30,width:6,cov:.8});
  s.restore();
  cabin(s,p,open,182);
  glass(s,open,p,wipes(t,[[.6,1.4],[6.6,1.4]]),.55,183,30*t);
 },
 aperture(){const b=boot5();return apertureDisc(b[0]-22,b[1]-2,20,12);},
 still:7.4,
};
// ch6 — a huge boot and a huge eye: the boot performs, the eye finds; then LOOK FIRST / DECIDE EARLY / THEN PLAY as three enacted actions
const VP6:Pt=[0,-200];
const EYE:Pt=[230,-300],TOE:Pt=[-60,330],HEEL:Pt=[-580,330];
function eye(s:Sheet,x:number,y:number,rx:number,open:number,look:Pt,seed:number,o:{wiper?:number;glint?:number}={}){
 const{wiper:wu=0,glint=0}=o,ry=rx*.58*open;if(ry<3){s.fill(K,ribbon([[x-rx,y],[x,y+4],[x+rx,y]],10,{seed,pressure:.4,wobble:1.5}));return;}
 const top:Pt[]=[],bot:Pt[]=[];for(let i=0;i<=20;i++){const u=i/20;top.push([x-rx+2*rx*u,y-ry*Math.sin(u*Math.PI)]);bot.push([x+rx-2*rx*u,y+ry*Math.sin(u*Math.PI)*.85]);}
 const alm=wob([...top,...bot.slice(1,-1)],3,seed,true,{step:14,corner:.4}),ap=polyPath(alm,true);
 s.knockout(ap,.95);
 s.save();s.clip(ap);
 const ir=ry*.9,ix=x+look[0]*rx*.42,iy=y+look[1]*ry*.35,iris=polyPath(blob(ix,iy,ir,ir,seed+1,{amp:.03,n:32}),true);
 s.fill(B,iris,.95);s.tone(K,iris,.45);
 // the iris is a small windshield: a headlight fan up from its bottom and a tiny wiper
 const fanP=polyPath(wob([[ix-ir*.25,iy+ir*.95],[ix+ir*.25,iy+ir*.95],[ix+ir*.7,iy-ir*.3],[ix-ir*.7,iy-ir*.3]],3,seed+2,true,{step:12,corner:.4}),true);s.knockout(fanP,.4);s.tone(Y,fanP,.6);
 const pu=polyPath(blob(ix,iy,ir*.42,ir*.42,seed+3,{amp:.04,n:24}),true);s.fill(K,pu,.95);
 if(glint>0)s.knockout(polyPath(blob(ix-ir*.3,iy-ir*.3,ir*.16*glint,ir*.1*glint,seed+4,{amp:.1,n:12}),true),.95);
 const wa=(200+130*wu)*D,wl=ir*.95,wx=ix-ir*.15,wy=iy+ir*.9;s.fill(K,ribbon([[wx,wy],[wx+Math.cos(wa)*wl,wy+Math.sin(wa)*wl]],Math.max(4,ir*.07),{seed:seed+5,taper:.1,wobble:1}),.95);
 s.restore();
 contour(s,K,alm,12,{close:true,seed:seed+6,pressure:.6,wobble:2});
}
function ballBack6(t:number){const u=sm(10.0,13.5,t,linear);const A=G(.4,.75,VP6);return{x:lerp(A.x,TOE[0]+70,u),y:lerp(A.y,TOE[1]-40,u),r:lerp(30,70,u),u};}
const ch6:Scene={
 draw(s,t){
  const ti=twosIndex(t),tt=twos(t);
  const look=key(t,[[10.5,0],[10.62,.1],[10.85,-1,easeIO],[11.5,1,easeIO],[11.97,1],[12.5,0,easeIO]]),shift=-160*look;
  cam(s,t,[[0,-160,160,1.0],[3.0,-120,120,1.03],[3.9,140,-160,1.06],[5.9,140,-160,1.06],[6.5,-100,120,1.08],[7.9,-100,120,1.08],[8.5,100,-120,1.1],[10.0,100,-120,1.1],[10.9,0,0,1.12],[11.97,0,0,1.12],[13.44,-40,40,1.14],[16.1,-20,20,1.18]],0,0,1.5*D*look);
  const p:Pane={half:620,top:-470,dash:480,lean:50},open=opening(p,191);
  s.save();s.clip(open);
  s.save();s.translate(shift,0);
  night(s,VP6,{sky:.6,ground:.32,seed:192});
  fan(s,VP6,1,[.65,.48,.3],193,{d0:.02,d1:.9,flare:.12});
  pitchLines(s,VP6,.85,194);
  // far players: the teammate the eye finds (ring), two orange players who turn late; the free teammate on the left and the presser on the right (revealed by the look-pan)
  const FAR=G(.4,.75,VP6),o1=G(.15,.72,VP6),o2=G(.6,.68,VP6),FREE=G(-.55,.5,VP6),PR=G(.55,.3,VP6);
  const found=sm(4.8,5.15,t,easeOutBack),late=sm(5.3,5.7,t,easeOut),pulse=t>=8.19&&t<9.0?.1*Math.abs(Math.sin((t-8.19)*8)):0;
  const st=stride(ti);
  const cushFar=t>=7.35&&t<7.55?.06:0;
  person(s,FAR.x,FAR.y,250*FAR.sz,'us',195,t>=9.9&&t<10.2?'kick':'stand',{facing:-1,scaleX:1+cushFar});
  marker(s,FAR.x,FAR.y+6,90*FAR.sz+16,Math.min(1.15,found)*(1-sm(10.0,10.4,t)),196,{pulse});
  const chase=sm(7.4,8.3,t,easeIO);
  person(s,lerp(o1.x,FAR.x-60,chase),lerp(o1.y,FAR.y+10,chase),250*o1.sz,'them',197,chase>0&&chase<1?'run':'lean',{facing:1,legs:chase>0&&chase<1?st.legs:undefined,arms:chase>0&&chase<1?st.arms:undefined,head:[.1*late,-.82]});
  person(s,lerp(o2.x,FAR.x+70,chase),lerp(o2.y,FAR.y+16,chase),250*o2.sz,'them',198,chase>0&&chase<1?'run':'lean',{facing:-1,legs:chase>0&&chase<1?st.legs:undefined,arms:chase>0&&chase<1?st.arms:undefined,head:[-.1*late,-.82]});
  // the second picture (10.5 →): the free teammate on the left, the presser closing from the right, arriving late at the toe
  if(t>=10.3){const prRun=t<12.5?0:anticipate(12.5,14.4,t,{back:.03,hold:.1,e:easeIO}),mv=prRun>0&&prRun<1,over=t>14.4?18*settle(t,14.4,{amp:1,freq:3,decay:4}):0;
   const px=lerp(PR.x,TOE[0]+140,clamp(prRun))-over,py=lerp(PR.y,TOE[1]+10,clamp(prRun));
   person(s,px,py,250*lerp(PR.sz,1,clamp(prRun)),'them',199,mv?'run':'lean',{facing:-1,legs:mv?st.legs:undefined,arms:mv?st.arms:undefined,tilt:mv?.16:.18});
   if(mv)speedLines(s,K,px+60,py-120,Math.PI,{n:4,seed:200+ti,len:120,spread:40,width:6,cov:.85});
   const cushF=t>=14.2&&t<14.4?.06:0;person(s,FREE.x,FREE.y,250*FREE.sz,'us',201,'stand',{facing:1,scaleX:1+cushF});
   marker(s,FREE.x,FREE.y+6,90*FREE.sz+16,Math.min(1.15,easeOutBack(sm(11.97,12.3,t))),202,{pulse:t>=13.44&&t<14.2?.08:0});}
  // the sight wedge from the eye (3.9 → 4.8) sweeping the pitch to the far teammate
  const sw=sm(3.9,4.8,t,easeIO);
  if(sw>0&&t<6.3){const a=lerp(150*D,Math.atan2(FAR.y-(EYE[1]),FAR.x-(EYE[0]+40)),sw);sight(s,EYE[0]+40-shift,EYE[1]+20,a,8*D,560,204,Math.min(1,sw*3)*(1-sm(5.9,6.3,t)));}
  s.restore();
  // the boot: taps (0.3), stamps (1.6), kicks (6.5) and plays first-time (13.5); it pivots about the heel
  const tap=t>=.3&&t<.5?-.12*Math.sin(sm(.3,.5,t)*Math.PI):0,stamp=t>=1.6&&t<1.85?.1*Math.sin(sm(1.6,1.85,t)*Math.PI):0;
  const kickA=(t0:number)=>t<t0?0:t<t0+.2?.15*sm(t0,t0+.2,t,easeOut):t<t0+.36?lerp(.15,-.45,sm(t0+.2,t0+.36,t,easeOut)):-.45*(1-sm(t0+.36,t0+1.0,t,easeIO))+.06*settle(t,t0+.36,{amp:1,freq:4,decay:5});
  const ang=tap+stamp+kickA(6.3)+kickA(13.3);
  s.save();s.translate(HEEL[0],HEEL[1]);s.rotate(ang);s.translate(-HEEL[0],-HEEL[1]);boot(s,TOE[0],TOE[1],520,0,205);s.restore();
  if(t>=1.75&&t<2.2)dust(s,null,TOE[0]-200,TOE[1]+40,90,10,{seed:206+ti,size:9,cov:.85});
  // DECIDE EARLY: the lane from the ball to the free teammate, drawn over the boot (camera coords) while the ball is still 1.5 s away
  if(t>=12.1){const FREE=G(-.55,.5,VP6);lane(s,[TOE[0]+70,TOE[1]-70],[FREE.x+shift+20,FREE.y-10],10,203,sm(12.1,12.6,t,easeOut),{dashes:8});}
  // the ball: at the toe; popped by the tap; kicked at 6.55 to the far teammate (0.8 s); played back 10 → 13.5; played first-time at 13.5 (0.7 s) to the free teammate
  let bx=TOE[0]+70,by=TOE[1]-40,br=70,rot=tt*.5,sq=1;
  if(t>=.42&&t<.95){const u=sm(.42,.95,t,linear);by-=60*Math.sin(u*Math.PI);if(u>.94)sq=.86;}
  const k1=sm(6.55,7.35,t,easeOut),bk=ballBack6(t),k2=sm(13.5,14.2,t,easeOut);
  const FARp:Pt=[G(.4,.75,VP6).x+shift,G(.4,.75,VP6).y-12],FREEp:Pt=[G(-.55,.5,VP6).x+shift,G(-.55,.5,VP6).y-20];
  if(t>=6.55&&t<10.0){bx=lerp(TOE[0]+70,FARp[0],k1);by=lerp(TOE[1]-40,FARp[1],k1)-140*Math.sin(k1*Math.PI);br=lerp(70,30,k1);rot=k1*9;}
  else if(t>=10.0&&t<13.5){bx=bk.x+shift;by=bk.y;br=bk.r;rot=bk.u*12;}
  else if(t>=13.5){bx=lerp(TOE[0]+70,FREEp[0],k2);by=lerp(TOE[1]-40,FREEp[1],k2)-100*Math.sin(k2*Math.PI);br=lerp(70,42,k2);rot=12+k2*8;}
  if((t>=7.35&&t<7.5)||(t>=14.2&&t<14.35)||(t>=13.5&&t<13.6))sq=.86;
  if((k1>0&&k1<.4)||(k2>0&&k2<.4))speedLines(s,K,bx,by,k2>0?Math.atan2(FREEp[1]-by,FREEp[0]-bx):Math.atan2(FARp[1]-by,FARp[0]-bx),{n:4,seed:207+ti,len:120,spread:36,width:6,cov:.85});
  ball(s,bx,by,br,rot,208,{sx:2-sq,sy:sq,pool:t<6.55?.9:.5});
  // the eye: closed until 3.36, opens, looks, locks, blinks at 15.2; its iris wiper sweeps at 8.3 and slowly at 14.5
  const openE=t<3.36?.05:easeOutBack(sm(3.36,3.71,t))*(1-sm(15.2,15.32,t))+sm(15.32,15.5,t,easeOut)*(t>=15.32?1:0);
  const lk=key(t,[[3.71,-.6],[3.9,-.6],[4.2,-.55],[4.8,-.1,easeIO],[6.3,-.1],[6.6,-.5,easeIO],[7.35,-.05,easeOut],[8.19,-.05],[8.3,-.12,easeOut],[10.5,-.12],[10.85,-1,easeIO],[11.5,1,easeIO],[11.97,1],[12.5,-.6,easeIO],[13.0,.2,easeIO],[13.5,-.6,easeIO],[14.2,-.6]]);
  const ly=key(t,[[3.71,.2],[4.8,.6,easeIO],[8.19,.6],[8.3,.5],[10.5,.5],[13.5,.5],[14.2,.6]]);
  const wu=wipes(t,[[8.3,.7],[14.5,1.6]]).u,glint=easeOutBack(sm(8.19,8.45,t))*(1-sm(9.6,10.0,t));
  eye(s,EYE[0],EYE[1],300,clamp(openE,0,1.08),[lk,ly],209,{wiper:wu,glint:Math.max(0,glint)});
  s.restore();
  cabin(s,p,open,210,{mirror:false});
  glass(s,open,p,wipes(t,[[2.4,1.4],[9.2,1.4]]),.4,211,24*t);
 },
 still:14.6,
};

export const story:RisoStory={
 id:'windshield',format:'11v11',title:'The Windshield',theme:'Look first, decide early',ageNote:'Direct reflections for older youth, roughly 12 and up; playing format does not define age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',orange:'#ff6c2f',blue:'#0078bf',navy:'#22366b'},order:['yellow','orange','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:[
  {label:'What separates players',headline:{text:'Decisions',at:8.62},narration:'If you really understand futbol, you begin to see what separates players at different levels. It isn’t always technique. It isn’t always physical ability. It’s the decisions they make.',seconds:12.2,audio:CH+'01.m4a',cues:[{at:0.0,words:'If you really understand futbol'},{at:2.37,words:'what separates players'},{at:4.94,words:'not always technique'},{at:6.72,words:'not always physical ability'},{at:8.69,words:'the decisions they make'}]},
  {label:'Before the ball arrives',headline:{text:'Look ahead',at:7.16},narration:'But a good decision doesn’t begin when the ball reaches your feet. It begins before the ball arrives. You have to lift your head, look ahead, and see the entire field.',seconds:11.0,audio:CH+'02.m4a',cues:[{at:0.0,words:'a good decision doesn’t begin'},{at:2.13,words:'when the ball reaches your feet'},{at:3.68,words:'It begins before the ball arrives'},{at:5.81,words:'lift your head'},{at:7.16,words:'look ahead'},{at:8.33,words:'see the entire field'}]},
  {label:'The windshield',narration:'Think about looking through a windshield. If you only focus on what is directly in front of you, everything else arrives as a surprise. Futbol works the same way.',seconds:10.9,audio:CH+'03.m4a',cues:[{at:0.0,words:'looking through a windshield'},{at:2.53,words:'only focus on what is directly in front'},{at:5.48,words:'arrives as a surprise'},{at:7.81,words:'Futbol works the same way'}]},
  {label:'Create time',headline:{text:'Create time',at:9.76},narration:'When players only watch the ball, the game moves too quickly. But when they scan the field, check their surroundings, and collect information early, something changes. They create time.',seconds:12.3,audio:CH+'04.m4a',cues:[{at:0.0,words:'only watch the ball'},{at:1.99,words:'the game moves too quickly'},{at:3.78,words:'scan the field'},{at:5.18,words:'check their surroundings'},{at:6.57,words:'collect information early'},{at:8.37,words:'something changes'},{at:9.76,words:'They create time'}]},
  {label:'Know before receiving',narration:'Before receiving the ball, they already know where the pressure is coming from, where their teammates are moving, and where the open space will appear. Then they can make the decision.',seconds:10.9,audio:CH+'05.m4a',cues:[{at:0.0,words:'Before receiving the ball'},{at:1.93,words:'where the pressure is coming from'},{at:4.04,words:'where their teammates are moving'},{at:5.98,words:'where the open space will appear'},{at:8.09,words:'make the decision'}]},
  {label:'Look. Decide. Play.',headline:{text:'Look first',at:10.5},narration:'At the highest level, many players have great technique and physical ability. The difference is what they see before everyone else. The feet perform the action. But the eyes find the answer. Look first. Decide early. Then play.',seconds:16.1,audio:CH+'06.m4a',cues:[{at:0.0,words:'At the highest level'},{at:3.36,words:'what they see before everyone else'},{at:6.3,words:'The feet perform the action'},{at:8.19,words:'the eyes find the answer'},{at:10.5,words:'Look first'},{at:11.97,words:'Decide early'},{at:13.44,words:'Then play'}]},
 ],
 draw(f){playChapters(story,f,[ch1,ch2,ch3,ch4,ch5,ch6]);},
 touch(s,x,y,age,seed){
  // a small wiper pivots at the touch point, sweeps 140°, clears a paper streak and flings droplets in the story's inks
  const a0=200*D,a1=340*D,L=150,px=x,py=y+80;
  const u=age<=0?.6:easeIO(clamp(age/.45))*(1-.3*clamp((age-.5)/.3));
  const ang=a0+(a1-a0)*u;
  s.knockout(sector(px,py,L*1.06,a0,ang),.6);
  const tx=px+Math.cos(ang)*L,ty=py+Math.sin(ang)*L;
  s.fill(K,ribbon([[px,py],[tx,ty]],10,{seed,taper:.1,wobble:1}),.95);s.fill(K,ribbon([[px+Math.cos(ang)*L*.45,py+Math.sin(ang)*L*.45],[tx+Math.cos(ang)*6,ty+Math.sin(ang)*6]],20,{seed:seed+1,taper:.05,wobble:1.2}),.95);
  s.fill(K,polyPath(blob(px,py,12,12,seed+2,{amp:.05,n:12}),true),.95);
  if(age>0){const rr=rng(seed+3),paths=[new Path2D(),new Path2D(),new Path2D()],fade=1-clamp((age-.45)/.35);
   for(let i=0;i<9;i++){const aa=ang-Math.PI/2+(rr()-.5)*1.2,v=140*(.5+rr()),sx=tx+Math.cos(aa)*v*age,sy=ty+Math.sin(aa)*v*age+520*age*age,sz=(8+rr()*8)*(1-age*.4);paths[i%3].addPath(polyPath(blob(sx,sy,sz,sz*1.3,seed+4+i,{amp:.1,n:10}),true));}
   if(fade>0){s.knockout(paths[0],.95);s.fill(Y,paths[0],.95*fade);s.knockout(paths[1],.95);s.fill(O,paths[1],.95*fade);s.knockout(paths[2],.95);s.fill(B,paths[2],.95*fade);}}
 },
};
