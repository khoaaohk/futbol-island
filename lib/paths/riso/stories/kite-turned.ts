/** The Kite That Turned — riso. Lead material: a kite in wind. Yellow = the kite and the reel (your purpose), blue = the wind and the
 * defender who closes a lane, green = trees (the pressure that snags the kite) and the court, navy key = string, spars, routes, contours.
 * Background (unique to this story): wind-streaked horizontal sky bands over a torn green horizon in two stepped tonal bands; the bands
 * ARE the wind — they slide with every gust, their streak tails lengthen at the peak, and the horizon's torn edge lifts as a gust passes.
 * Legibility pass (bible §1c): a paper cut-out child holds the reel in every chapter; the tree has a trunk and a teal-overprinted crown;
 * the breath is the child's body (LET GO); chapters 4–5 split the frame — the kite in the sky over a futsal court where the same child
 * plays a sideways pass past a blue defender to a teammate; seam 3→4 is a gust that blows the yellow sheet off.
 * Scenes read only their local time t; drawn objects pose on twos, cameras on ones; every random value is seeded. */
import type {Sheet} from '../sheet';
import {type RisoStory,type Scene,playChapters} from '../story';
import {aperture,apertureDisc} from '../passage';
import {twos,twosIndex,sm,key,anticipate,settle,clamp,lerp,rng,hash,noise1,blob,polyPath,ribbon,smoothPts,partial,rotPts,circlePath,arc,easeOut,easeIn,easeIO,easeOutBack,TAU,type Pt} from '../motion';
import {dust,speedLines,handCut,ring,lattice,crescent,laneArrow} from '../shapes';

const CH='/stories/narration/futsal/kite-turned/';
const K='navy',Y='yellow',B='blue',G='green';
const pulse=(t:number,t0:number,len=1)=>t<t0?0:Math.min(1,(t-t0)*10)*Math.exp(-(t-t0)*2.4/len);
const add=(a:Pt,b:Pt):Pt=>[a[0]+b[0],a[1]+b[1]];
const lozenge=(x:number,y:number,w:number,h:number,rot=0)=>polyPath(rotPts([[-w/2,0],[-w*.3,-h/2],[w*.3,-h/2],[w/2,0],[w*.3,h/2],[-w*.3,h/2]],rot).map(p=>[p[0]+x,p[1]+y] as Pt),true);

// ---------------- abstract riso figure (bible §1c.4) ----------------
/** A cut-paper player pictogram: a big head disc, a torn torso block, two leg strokes, two arm strokes — 4–6 plate ops, no anatomy, no face.
 * (x,y) = the ground point under the body, h = height, face = +1 looks right. Poses are parameter tables blended from `stand` by k (0..1).
 * ink 'paper' = paper body with navy contour and navy limbs (the child, teammates); an ink = that ink knocked out beneath (the defender).
 * reach = world point the front arm ends at (the reel, a string); foot = world point the front leg ends at (a kick). look turns the head; sight prints a paper wedge. */
type Pose='stand'|'scan'|'run'|'arms'|'up'|'slump'|'step'|'listen'|'crouch'|'kick'|'pull';
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
 pull:{tilt:-.3,head:[-.02,0],legF:[.32,0],legB:[-.18,0],armF:[.4,-.22],armB:[.34,-.14],hip:.03},
};
type FigOpts={ink?:string;line?:string;seed?:number;face?:1|-1;look?:number;k?:number;cov?:number;reach?:Pt;foot?:Pt;shade?:string;sight?:number;knock?:boolean};
function figure(s:Sheet,x:number,y:number,h:number,pose:Pose,o:FigOpts={}){
 const{ink='paper',line=K,seed=1,face=1,look=0,k=1,cov=.92,reach,foot,shade,sight=0,knock=true}=o;if(h<8)return;
 const base=POSES.stand,p=POSES[pose],L=(a:number,b:number)=>lerp(a,b,k),LP=(a:Pt,b:Pt):Pt=>[lerp(a[0],b[0],k),lerp(a[1],b[1],k)];
 const tilt=L(base.tilt,p.tilt),head=LP(base.head,p.head),legF=LP(base.legF,p.legF),legB=LP(base.legB,p.legB),armF=LP(base.armF,p.armF),armB=LP(base.armB,p.armB),hip=L(base.hip,p.hip);
 const R=h*.16,tw=h*.3,th=h*.38,legL=h*.3,hipY=-legL+hip*h,ca=Math.cos(tilt),sa=Math.sin(tilt);
 const W=(lx:number,ly:number):Pt=>[x+lx*face,y+ly];
 const T=(lx:number,ly:number):Pt=>[lx*ca-ly*sa,hipY+lx*sa+ly*ca];
 const corners=[T(-tw/2,0),T(tw/2,0),T(tw/2,-th),T(-tw/2,-th)].map(q=>W(q[0],q[1]));
 const torso=polyPath(handCut(corners,seed,h*.02,h*.12),true);
 const shF=T(tw*.42,-th+R*.25),shB=T(-tw*.42,-th+R*.25);
 const hc=T(0,-th-R*1.05),headC=W(hc[0]+head[0]*h+look*R*.42,hc[1]+head[1]*h),headPts=blob(headC[0],headC[1],R,R*.96,seed+2,{amp:.05,n:30});
 const headPath=polyPath(headPts,true);
 const hipF=W(tw*.18,hipY),hipB=W(-tw*.18,hipY);
 const fF=foot?foot:W(legF[0]*h,legF[1]*h),fB=W(legB[0]*h,legB[1]*h);
 const aF=reach?reach:W(shF[0]+armF[0]*h,shF[1]+armF[1]*h),aB=W(shB[0]+armB[0]*h,shB[1]+armB[1]*h);
 const limbs=new Path2D();
 limbs.addPath(ribbon([hipF,fF],h*.08,{seed:seed+3,pressure:.4,taper:.25,wobble:1.4}));limbs.addPath(ribbon([hipB,fB],h*.08,{seed:seed+4,pressure:.4,taper:.25,wobble:1.4}));
 limbs.addPath(ribbon([W(shB[0],shB[1]),aB],h*.062,{seed:seed+5,pressure:.4,taper:.35,wobble:1.4}));limbs.addPath(ribbon([W(shF[0],shF[1]),aF],h*.062,{seed:seed+6,pressure:.4,taper:.35,wobble:1.4}));
 const body=new Path2D();body.addPath(torso);body.addPath(headPath);
 const outline=new Path2D();outline.addPath(ribbon(handCut(corners,seed,h*.02,h*.12),Math.max(4,h*.02),{seed:seed+7,close:true,pressure:.6,wobble:1.6,gaps:[[.62,.66]]}));outline.addPath(ribbon(headPts,Math.max(4,h*.02),{seed:seed+8,close:true,pressure:.6,wobble:1.4}));
 if(sight>0){const d=face*(look>=0?1:-1),sx=headC[0]+d*R*.6,wedge=polyPath([[headC[0],headC[1]],[sx+d*h*.55,headC[1]-h*.22],[sx+d*h*.55,headC[1]+h*.12]],true);s.knockout(wedge,.3*sight);}
 if(ink==='paper'){if(knock)s.knockout(body,cov);s.fill(line,limbs);s.fill(line,outline);}
 else{const all=new Path2D();all.addPath(body);all.addPath(limbs);if(knock)s.knockout(all);s.fill(ink,all,cov);s.fill(line,outline,.9);}
 if(shade){const sh=new Path2D();sh.addPath(crescent(headC[0],headC[1],R*.98,[-.35*face,-.4]));sh.addPath(polyPath([corners[0],[lerp(corners[1][0],corners[0][0],.5),lerp(corners[1][1],corners[0][1],.5)],[lerp(corners[2][0],corners[3][0],.5),lerp(corners[2][1],corners[3][1],.5)],corners[3]],true));s.tone(shade,sh,.45);}
}

// ---------------- the world: wind bands, horizon, leaves ----------------
/** One streaked wind band: a grainy blue slab with wobbly edges and dashed streak tails trailing right (the wind combed through it). */
function bandPath(yc:number,h:number,off:number,tails:number,seed:number,lead=false){
 const rr=rng(seed),p=new Path2D(),top:Pt[]=[],bot:Pt[]=[];
 for(let x=-2400;x<=2400;x+=100){const wv=(1+.35*noise1(x/900+seed*.3,seed+21));top.push([x+off,yc-h/2*wv+26*noise1(x/420+seed,seed)+8*noise1(x/90,seed+5)]);bot.push([x+off,yc+h/2*wv+26*noise1(x/420+seed*3+7,seed+9)+8*noise1(x/90+3,seed+6)]);}
 p.addPath(polyPath([...top,...bot.reverse()],true));
 for(let k=0;k<16;k++){const x0=-2300+rr()*4600+off,side=rr()<.5?-1:1,y0=yc+side*(h/2+2+(rr()-.5)*12),L=tails*(.6+rr()*1.1),w=10+rr()*12,d=lead?-1:1;p.addPath(polyPath([[x0,y0-w],[x0+d*L*.7,y0-w*.5],[x0+d*(L+40),y0],[x0+d*L*.7,y0+w*.5],[x0,y0+w]],true));}
 return p;
}
/** The sky: `count` bands stacked above the horizon, coverage stepping up toward the top; gust slides them (units), tails = streak length. */
function sky(s:Sheet,o:{horizon:number;seed:number;gust?:number;gustY?:number;tails?:number;count?:number;covs?:number[];pitch?:number;h?:number}){
 const{horizon,seed,gust=0,gustY=0,tails=110,count=7,covs=[.32,.45,.6],pitch=260,h=165}=o,paths=covs.map(()=>new Path2D());
 let y=horizon-140;for(let i=0;i<count;i++){const level=Math.min(covs.length-1,Math.floor((i+.5)/count*covs.length)),hh=h*(.7+.6*hash(i,seed));paths[level].addPath(bandPath(y+gustY*(1-i/count),hh,gust*(1+.25*i/count),tails,seed+i*3));y-=pitch*(.75+.5*hash(i+9,seed));}
 paths.forEach((p,k)=>s.fill(B,p,covs[k]));
}
/** The ground: a torn green field in two stepped tonal bands (a darker torn band along the horizon, a lighter wear band lower) with navy
 * court lines; lift raises its torn edge (grass in a gust). */
function ground(s:Sheet,y:number,seed:number,o:{lift?:number;lines?:number[];cov?:number}={}){
 const{lift=0,lines=[y+40],cov=1}=o,top:Pt[]=[];
 for(let x=-2400;x<=2400;x+=100)top.push([x,y-lift*(.5+.5*Math.sin(x/400))+24*noise1(x/220+seed,seed)+8*noise1(x/60,seed+3)]);
 s.fill(G,polyPath([...top,[2400,2800],[-2400,2800]],true),cov);
 const band:Pt[]=[];for(let x=-2400;x<=2400;x+=120)band.push([x,y+200+30*noise1(x/300+seed*2,seed+11)]);
 s.tone(K,polyPath([...top,...band.reverse()],true),.2);
 const wear:Pt[]=[];for(let x=-2400;x<=2400;x+=120)wear.push([x,y+420+40*noise1(x/260+seed*3,seed+13)]);const wear2:Pt[]=[];for(let x=-2400;x<=2400;x+=120)wear2.push([x,y+760+40*noise1(x/260+seed*5,seed+17)]);
 s.tone(Y,polyPath([...wear,...wear2.reverse()],true),.32);
 const p=new Path2D();for(const ly of lines)p.addPath(ribbon([[-2400,ly],[2400,ly]],9,{seed:seed+1,pressure:.3,taper:0,wobble:2,step:80}));s.fill(K,p,.9);
}
/** Leaf confetti: green torn flecks and cream bits blown along the wind; scatter pushes them outward from (x,y). */
function leaves(s:Sheet,x:number,y:number,r:number,n:number,seed:number,o:{scatter?:number;dx?:number;dy?:number;size?:number}={}){
 const{scatter=0,dx=0,dy=0,size=28}=o,rr=rng(seed),green=new Path2D(),paper=new Path2D();
 for(let i=0;i<n;i++){const a=rr()*TAU,d=Math.sqrt(rr())*r,sz=size*(.5+rr()),rot=rr()*TAU+scatter*3,px=x+Math.cos(a)*(d+scatter*100)+dx,py=y+Math.sin(a)*(d+scatter*100)+dy;
  const q=rotPts([[-sz*.5,0],[-sz*.1,-sz*.4],[sz*.5,-sz*.1],[sz*.1,sz*.4]],rot),p=i%3===0?paper:green;p.moveTo(px+q[0][0],py+q[0][1]);for(let k=1;k<4;k++)p.lineTo(px+q[k][0],py+q[k][1]);p.closePath();}
 s.fill(G,green);s.knockout(paper,.9);
}
/** A reel (winder disc): paper knocked out, the player's ink, navy contour, rim string ticks that turn with `spin`, a paper hub. */
function reel(s:Sheet,x:number,y:number,ink:string,seed:number,o:{r?:number;spin?:number;sx?:number;sy?:number;cov?:number}={}){
 const{r=90,spin=0,sx=1,sy=1,cov=.6}=o,disc=polyPath(blob(x,y,r*sx,r*sy,seed,{amp:.03,n:40}),true);
 s.knockout(disc);s.fill(ink,disc,cov);
 s.fill(K,ribbon(blob(x,y,r*sx,r*sy,seed+1,{amp:.02,n:44}),Math.max(4,r*.09),{seed:seed+2,close:true,pressure:.5,wobble:r*.02}));
 const ticks=new Path2D();for(let k=0;k<16;k++){const a=spin+k/16*TAU;ticks.moveTo(x+Math.cos(a)*r*.62*sx,y+Math.sin(a)*r*.62*sy);ticks.lineTo(x+Math.cos(a+.12)*r*.88*sx,y+Math.sin(a+.12)*r*.88*sy);}s.stroke(K,ticks,Math.max(2,r*.05));
 s.fill(K,ribbon(blob(x,y,r*.6*sx,r*.6*sy,seed+3,{amp:.03,n:32}),Math.max(3,r*.06),{seed:seed+4,close:true,pressure:.4,wobble:r*.02}));
 s.knockout(circlePath(x,y,r*.16));
}
/** The kite: an opaque diamond sail (paper knocked out, then the ink), navy spars and contour, a swaying tail with bows.
 * dent 0..1 pushes the windward edge (`side`) in; fill 0..1 scales the sail on; spars 0..1 draws the spars; glint prints a paper highlight. */
function kite(s:Sheet,x:number,y:number,a:number,w:number,h:number,ink:string,seed:number,o:{dent?:number;side?:'left'|'right'|'top';fill?:number;spars?:number;bows?:number;tail?:number;wind?:number;glint?:number;tailLen?:number}={}){
 const{dent=0,side='left',fill=1,spars=1,bows=5,tail=0,wind=40,glint=0,tailLen=1}=o;
 const T:Pt=[0,-h/2],R:Pt=[w/2,-h*.08],Bm:Pt=[0,h/2],L:Pt=[-w/2,-h*.08],mid=(p:Pt,q:Pt,out:number):Pt=>{const mx=(p[0]+q[0])/2,my=(p[1]+q[1])/2,nx=q[1]-p[1],ny=-(q[0]-p[0]),l=Math.hypot(nx,ny)||1;return[mx+nx/l*out,my+ny/l*out];};
 const d=dent*w*.09,local:Pt[]=[T,mid(T,R,side==='right'||side==='top'?w*.04-d:w*.04),R,mid(R,Bm,side==='right'?w*.04-d:w*.04),Bm,mid(Bm,L,side==='left'?w*.04-d:w*.04),L,mid(L,T,side==='left'||side==='top'?w*.04-d:w*.04)];
 const sail=local.map(p=>[p[0]*fill,p[1]*fill] as Pt),world=(pts:Pt[])=>rotPts(pts,a).map(p=>[p[0]+x,p[1]+y] as Pt);
 // the tail hangs from the bottom corner, swept by the wind
 const bw=world([Bm])[0],tp:Pt[]=[];for(let i=0;i<=8;i++){const u=i/8*tailLen;tp.push([bw[0]+u*wind*4+18*Math.sin(u*7+tail)*u*4,bw[1]+u*300+10*Math.cos(u*5+tail*1.3)*u*3]);}
 s.fill(K,ribbon(tp,5,{seed:seed+5,pressure:.3,taper:.4,wobble:1}),.95);
 if(bows>0){const bp=new Path2D(),q=smoothPts(tp,false,10);for(let k=1;k<=bows;k++){const i=Math.min(q.length-1,Math.round(k/bows*(q.length-1)*.98));const c=q[i],prev=q[Math.max(0,i-2)],ang=Math.atan2(c[1]-prev[1],c[0]-prev[0]);bp.addPath(polyPath(rotPts([[-34,0],[0,-16],[34,0],[0,16]],ang).map(p=>[p[0]+c[0],p[1]+c[1]] as Pt),true));}s.knockout(bp);s.fill(ink,bp,.9);}
 if(fill>0){const sp=polyPath(smoothPts(world(sail),true,6,1.1),true);s.knockout(sp);s.fill(ink,sp,.9);s.fill(K,ribbon(world(sail),Math.max(5,w*.02),{seed,close:true,pressure:.5,wobble:1.6,step:6}));}
 if(spars>0){const v=partial(world([T,Bm]),spars),hz=partial(world([L,R]),spars);const p=new Path2D();p.addPath(ribbon(v,Math.max(6,w*.03),{seed:seed+1,pressure:.4,taper:.1,wobble:1}));if(hz.length>1)p.addPath(ribbon(hz,Math.max(6,w*.03),{seed:seed+2,pressure:.4,taper:.1,wobble:1}));s.fill(K,p);}
 if(glint>0){const g=world([[-w*.36,-h*.36],[-w*.2,-h*.44],[-w*.12,-h*.3],[-w*.3,-h*.22]]);s.knockout(polyPath(g,true),.9*glint);}
}
/** The kite's bridle point (where the string ties on) for a kite at (x,y) turned by a. */
const bridleOf=(x:number,y:number,a:number,h=410):Pt=>add([x,y],rotPts([[0,h*.3]],a)[0]);
/** A tree: a navy trunk and a torn green crown with a teal (blue × green) overprint and a navy torn contour; lean rotates the crown about its base. */
function tree(s:Sheet,x:number,y:number,w:number,h:number,seed:number,o:{lean?:number;deflate?:number;cov?:number;trunk?:number}={}){
 const{trunk=260}=o;if(trunk>0)s.fill(K,ribbon([[x,y+h/2+trunk],[x+8,y+h/2-40]],Math.max(30,w*.13),{seed:seed+20,pressure:.3,taper:.1,wobble:3}),.9);
 crown(s,x,y,w,h,seed,o);
}
/** A tree crown (pressure): a torn green mass leaning about its base; deflate shrinks it; teal overprint and a navy torn contour. */
function crown(s:Sheet,x:number,y:number,w:number,h:number,seed:number,o:{lean?:number;deflate?:number;cov?:number}={}){
 const{lean=0,deflate=0,cov=1}=o,sc=1-deflate*.1,base:Pt=[0,h/2],place=(q:Pt[])=>rotPts(q,lean,base[0],base[1]).map(p=>[base[0]+(p[0]-base[0])*sc,base[1]+(p[1]-base[1])*sc] as Pt).map(p=>[p[0]+x,p[1]+y] as Pt);
 const pts=place(handCut(blob(0,0,w/2,h/2,seed,{amp:.16,n:14}),seed+1,Math.min(w,h)*.11,52)),path=polyPath(pts,true);
 s.fill(G,path,cov);
 s.save();s.clip(path);s.tone(B,polyPath(place(blob(w*.12,h*.1,w*.42,h*.4,seed+30,{amp:.14})),true),.45);const rr=rng(seed+7),inner=new Path2D();for(let k=0;k<3;k++)inner.addPath(polyPath(place(blob((rr()-.5)*w*.7,(rr()-.5)*h*.6,w*(.12+rr()*.14),h*(.1+rr()*.12),seed+10+k,{amp:.12})),true));s.tone(K,inner,.32);s.restore();
 s.fill(K,ribbon(pts,8,{seed:seed+2,close:true,pressure:.5,wobble:2.4,gaps:[[.3,.35],[.7,.74]],step:8}),.9);
}
/** The ball of this story: a paper sphere patched with yellow kite-cloth diamonds and navy seams — round, panelled, a football. ≈ 6 ops. */
function clothBall(s:Sheet,x:number,y:number,r:number,seed:number,o:{rot?:number;sx?:number;sy?:number}={}){
 const{rot=0,sx=1,sy=1}=o,disc=polyPath(blob(x,y,r*sx,r*sy,seed,{amp:.025,n:40}),true);
 s.knockout(disc);s.save();s.clip(disc);
 s.tone(B,crescent(x,y,r*1.04*Math.max(sx,sy),[-.4,-.45]),.32);
 const patches=new Path2D(),seams=new Path2D();patches.addPath(lozenge(x,y,r*.7*sx,r*.6*sy,rot));
 for(let i=0;i<5;i++){const a=rot+i/5*TAU,cx=x+Math.cos(a)*r*.88*sx,cy=y+Math.sin(a)*r*.88*sy;patches.addPath(lozenge(cx,cy,r*.62*sx,r*.5*sy,a+Math.PI/2));seams.addPath(ribbon([[x+Math.cos(a)*r*.32*sx,y+Math.sin(a)*r*.32*sy],[x+Math.cos(a)*r*.62*sx,y+Math.sin(a)*r*.62*sy]],Math.max(2.5,r*.06),{seed:seed+3+i,taper:.3,wobble:1}));}
 s.fill(Y,patches,.9);s.fill(K,seams,.9);
 s.restore();
 s.fill(K,ribbon(blob(x,y,r*sx,r*sy,seed+1,{amp:.02,n:44}),Math.max(3,r*.075),{seed:seed+2,close:true,pressure:.6,wobble:r*.02}));
 s.knockout(circlePath(x-r*.42*sx,y-r*.45*sy,r*.1));
}
/** String between a and b with slack (0 = taut, 1 = a deep sag); crumple zigzags it (a jam). */
function stringPts(a:Pt,b:Pt,slack:number,n=12,crumple=0,seed=1):Pt[]{const L=Math.hypot(b[0]-a[0],b[1]-a[1]),out:Pt[]=[];for(let i=0;i<=n;i++){const u=i/n,sag=slack*L*.35*Math.sin(u*Math.PI);const z=crumple&&i>0&&i<n?crumple*(hash(i,seed)>.5?1:-1):0;out.push([lerp(a[0],b[0],u)+z,lerp(a[1],b[1],u)+sag+z*.6]);}return out;}
function string(s:Sheet,pts:Pt[],width=11,o:{seed?:number;progress?:number;cov?:number}={}){const{seed=1,progress=1,cov=.95}=o,line=progress>=1?pts:partial(smoothPts(pts,false,8),clamp(progress));if(line.length>1)s.fill(K,ribbon(line,width,{seed,pressure:.3,taper:.15,wobble:1.2,step:8}),cov);}
/** A dashed navy route (the string's path in the sky / a pass lane on the court). progress draws it, tip leading; crumple kinks it. */
function route(s:Sheet,pts:Pt[],progress:number,seed:number,o:{width?:number;crumple?:number;cov?:number}={}){const{width=11,crumple=0,cov=.95}=o;if(progress<=0)return;let q=smoothPts(pts,false,8);if(crumple>0)q=q.map((p,i)=>i%2?[p[0]+crumple*(hash(i,seed)-.5)*2,p[1]+crumple*(hash(i+3,seed)-.5)*2] as Pt:p);const line=partial(q,progress);if(line.length<2)return;
 const gaps:[number,number][]=[];for(let g=.08;g<1;g+=.16)gaps.push([g,g+.07]);s.fill(K,ribbon(line,width,{seed,pressure:.3,taper:.1,wobble:1.2,gaps,step:8}),cov);}
/** A bright opening in the sky (the expected option): paper knocked out of the bands. */
const skyGap=(s:Sheet,x:number,y:number,w:number,h:number,cov=.85)=>s.knockout(lozenge(x,y,w,h),cov);
const bowShape=(x:number,y:number,ang:number,w=70,h=34)=>rotPts([[-w/2,0],[0,-h/2],[w/2,0],[0,h/2]],ang).map(p=>[p[0]+x,p[1]+y] as Pt);
/** The child's hand (front arm end) — where the reel sits and the string starts. */
const HAND=(x:number,y:number,h:number,face:1|-1):Pt=>[x+face*h*.36,y-h*.86];

// ---------------- chapter 1: the kite flies, a gust snags it in the tree; stuck; look again ----------------
const ch1:Scene={
 draw(s,t){
  const tt=twos(t);
  const gustK=key(tt,[[1.6,0],[1.8,-.1,easeIn],[2.3,1,easeOut],[3.2,1],[4,0]]),shove=key(tt,[[1.6,0],[1.75,-.06,easeIn],[2.3,1,easeOut]]),snag=tt>=2.3,jam=sm(4.0,4.2,tt),shaking=tt>=4&&tt<4.35;
  const v=key(t,[[0,40,-140,.95],[1.2,80,-180,1],[4,80,-180,1],[4.9,-20,-100,1.12],[7.68,-20,-100,1.12],[7.9,-20,-110,1.12],[9,-260,-360,1.12],[9.9,-260,-360,1.12]],easeIO,true);
  s.camera(v[0]+20*gustK*(1-sm(3.2,4,t)),v[1],v[2],0);
  const gust=gustK*90;
  sky(s,{horizon:200,seed:11,tails:130+120*gustK,gust});
  skyGap(s,300,-640,320,170,.85*(1-.6*shove));
  ground(s,200,12,{lines:[240],lift:6*pulse(tt,2.3)});
  leaves(s,60,-100,800,10,13,{scatter:.9*pulse(tt,2.3)+pulse(tt,4.0),dx:tt*20+gust,dy:0});
  // the tree: trunk on the ground, crown at the right; it catches the kite
  tree(s,430,-300,480,420,14,{lean:.04*gustK});
  // the child: holds the reel; shoulders drop on "frustrated or stuck"; on "look again" straightens and turns the head to the open sky at the left
  const slump=sm(4.0,4.7,tt,easeOut)*(1-sm(7.68,8.1,tt,easeOut)),lookK=sm(7.68,8.1,tt,easeOut);
  const cx=-280,cy=200,ch=540,hand=HAND(cx,cy,ch,1);const reelP:Pt=[hand[0]+20-lerp(0,.05*ch,slump),hand[1]+lerp(0,.3*ch,slump)];
  figure(s,cx,cy,ch,slump>0?'slump':lookK>0?'scan':'pull',{seed:41,face:1,k:slump>0?slump:lookK>0?1:.7,reach:reelP,look:-lookK,sight:lookK,shade:B});
  // the kite: flying in the sky gap; the gust shoves it into the crown, where it sticks and twitches
  const kx=lerp(300,430,easeOutBack(clamp(shove))),ky=lerp(-620,-380,clamp(shove)),ang=lerp(-.1,.55,clamp(shove))+(shaking?.06*Math.sin(tt*60):0)+.04*settle(tt,2.3,{amp:1,freq:5,decay:4});
  const bridle=bridleOf(kx,ky,ang);
  const slack=snag?.02:.12+.08*Math.sin(tt*1.5);
  let pts=stringPts(reelP,bridle,slack,12,shaking?18:0,twosIndex(t));
  if(shaking){pts=pts.map((p,i)=>i?[p[0]+24*(hash(i+twosIndex(t),3)-.5)*2,p[1]+24*(hash(i*7+twosIndex(t),5)-.5)*2] as Pt:p);}
  string(s,pts,snag?9:11,{seed:15});
  kite(s,kx,ky,ang,320,430,Y,16,{dent:.8*clamp(shove)*(1-.3*jam),side:'right',tail:tt*3,wind:40+60*gustK,bows:4,tailLen:.8});
  if(jam>0&&tt<4.6)dust(s,K,kx-60,ky+40,120,10,{seed:19,size:8,cov:.8});
  skyGap(s,-420,-600,280,160,.8);
  reel(s,reelP[0],reelP[1],Y,18,{r:64,spin:-tt*.5*(snag?0:1)-jam*.4});
 },
 aperture(){const a=.55;return aperture(rotPts([[0,-140],[110,-30],[0,140],[-110,-30]],a).map(p=>[p[0]+430,p[1]-380] as Pt));},
 still:5.6,
};

// ---------------- chapter 2: the kite in changing wind — gusts push, the angle turns, the reel stays in the child's hand ----------------
const ch2:Scene={
 draw(s,t){
  const tt=twos(t);
  const g1=key(tt,[[2.9,0],[3.0,-.15,easeIn],[3.3,1,easeOut],[3.7,1],[4.3,0]]),g2=key(tt,[[5.0,0],[5.2,-.1,easeIn],[5.5,1,easeOut],[5.9,1],[6.5,0]]);
  const shove1=key(tt,[[3.0,0],[3.4,1,easeOut],[3.8,1],[4.6,0,easeIO]]),shove2=key(tt,[[5.2,0],[5.6,1,easeOut],[6.0,1],[6.8,0,easeIO]]);
  const rot1=key(tt,[[3.3,0],[3.45,-.1,easeIn],[3.8,.31,easeOut],[4.4,.05],[5,0]]),rot2=-.17*shove2;
  const turn=key(tt,[[6.52,0],[6.67,.09,easeIn],[7.27,-.45,easeOut],[7.55,-.38]]),climb=sm(7.2,8.0,tt,easeOut);
  const v=key(t,[[0,0,0,.9,0],[1.2,40,-100,1,0],[2.9,40,-100,1,0],[3.2,40,-100,1,0],[4.1,160,-40,1,.07],[6.52,160,-40,1,.07],[7.5,-60,300,1,0],[8.6,40,-220,1.05,0],[10.3,40,-220,1.05,0]],easeIO,true);
  s.camera(v[0],v[1]+20*pulse(t,5.5),v[2],v[3]);
  sky(s,{horizon:520,seed:21,gust:80*Math.max(g1,g2),gustY:60*g2,tails:60+160*Math.max(g1,g2)});
  ground(s,520,22,{lines:[560],lift:10*Math.max(g1,g2)});
  leaves(s,0,-100,900,14,23,{scatter:.6*pulse(tt,3.3)+.6*pulse(tt,5.5),dx:tt*30+200*Math.max(g1,g2),dy:0});
  // the kite draws itself, then is shoved, drops, turns to recover, turns to a new angle and climbs
  const drawOn=sm(.3,.7,tt,easeOut),spars=sm(0,.3,tt,easeOut),bows=Math.max(0,Math.min(5,Math.floor((tt-.7)/.08)+1));
  const kx=60+140*shove1+84*shove2-20*climb,ky=-160+100*shove1+84*shove2-160*climb+30*settle(tt,.9,{amp:1,freq:3,decay:3})-40*settle(tt,4.6,{amp:1,freq:2.5,decay:3});
  const ang=rot1+rot2+turn,dent=Math.max(g1,g2*.8),side=g2>g1?'top':'left';
  // the child on the ground holds the reel; the string draws down to it, bows under gust 1, slackens then snaps taut after gust 2
  const cx=-280,cy=520,ch=460,hand=HAND(cx,cy,ch,1),reelP:Pt=[hand[0]+16+8*Math.sin(TAU*3*g1)*g1,hand[1]];
  const slack=.06+.2*g1+.25*(sm(5.3,5.6,tt)-sm(5.6,5.75,tt)),twang=tt>=5.75&&tt<5.92?10:0;
  const bridle:Pt=add([kx,ky],rotPts([[0,120]],ang)[0]);
  figure(s,cx,cy,ch,'pull',{seed:26,face:1,k:.6+.3*Math.max(g1,g2),reach:reelP,shade:B});
  string(s,stringPts(bridle,reelP,slack,12,twang,twosIndex(t)),8,{seed:24,progress:sm(.5,1.0,tt,easeOut)});
  kite(s,kx,ky,ang,380,520,Y,25,{dent,side,fill:drawOn,spars,bows,tail:tt*3,wind:40+60*Math.max(g1,g2),glint:sm(6.9,7.3,tt)*(1-.5*sm(8,9,tt))});
  reel(s,reelP[0],reelP[1],Y,27,{r:64,spin:-sm(.5,1.0,tt)*1.6-climb*.5});
 },
 aperture(t){const tt=twos(t),climb=sm(7.2,8.0,tt,easeOut),kx=40-20*(climb-1),ky=-320+160*(1-climb);return aperture(rotPts([[0,-220],[160,-40],[0,220],[-160,-40]],-.38).map(p=>[p[0]+kx,p[1]+ky] as Pt));},
 still:4.0,
};

// ---------------- chapter 3: inside the sail — the child breathes and lets go of the string ----------------
const ch3:Scene={
 draw(s,t){
  const tt=twos(t);
  const press=sm(.2,.7,tt,easeIn),breath=sm(3.65,4.85,tt,easeOut),contract=sm(3.4,3.65,tt)*(1-sm(3.65,3.9,tt)),blow=sm(7.9,8.68,t,easeOut);
  const v=key(t,[[0,-60,0,1,0],[1,0,0,1,0],[3.4,0,0,1,0],[3.65,0,0,.98,0],[4.85,0,-20,.88,0],[5.0,0,-20,.88,0],[5.4,20,20,.9,0],[6.24,20,20,.9,0],[6.44,20,20,.9,0],[7.14,-160,0,.92,-.06],[8.9,-160,0,.92,-.06]],easeIO,true);
  s.camera(v[0],v[1],v[2],v[3]);
  // the fabric: a yellow halftone field with a diagonal weave; the gust of the seam blows the whole sheet to the right
  s.save();s.translate(420*blow,0);
  s.field(Y,lerp(.6,.45,breath),.5);
  {const p=new Path2D();for(const [a,b] of lattice([-2400,-2000,4800,4000],90,Math.PI/4,31))p.addPath(polyPath([[a[0],a[1]-3],[b[0],b[1]-3],[b[0],b[1]+3],[a[0],a[1]+3]],true));s.fill(Y,p,.88);}
  // the crown presses on the fabric at the upper right (the tree still holds the kite); it eases back with the breath
  const crx=560-40*press*(1-breath)+30*contract,cry=-420-30*press*(1-breath)+20*contract;
  s.tone(Y,polyPath(blob(crx-40,cry+40,240*(press*(1-breath)+.3),220*(press*(1-breath)+.3),32,{amp:.08}),true),.88);
  crown(s,crx,cry,300,260,35,{lean:.1*press});
  // wind arrives with the breath: blue streaks across the fabric (green where they overprint the yellow)
  if(breath>0){const p=new Path2D();for(let i=0;i<5;i++){const y=-760+i*360,pr=clamp(breath*1.6-i*.15);if(pr<=0)continue;p.addPath(bandPath(y,56,-2600*(1-pr)+40*Math.sin(tt+i),320,33+i));}s.fill(B,p,.32);}
  // the child fills the frame: strained (leaning back, string taut to the crown) → the breath: chest lifts, arms open → lets the string go → looks left
  const drop=sm(5.0,5.4,tt,easeIn),bounce=drop>=1?Math.abs(30*settle(tt,5.4,{amp:1,freq:3,decay:4})):0,notice=sm(6.24,6.6,tt,easeOut);
  const cx=-40,cy=560,ch=880*(1+.06*breath),hand=HAND(cx,cy,ch,1),pinned:Pt=[crx-60,cry+60];
  const pose:Pose=tt<3.65?'pull':tt<5.0?'up':notice>0?'scan':'arms';
  const k=tt<3.65?.9-.2*contract:tt<5.0?breath:notice>0?1:.8;
  figure(s,cx,cy,ch,pose,{seed:36,face:1,k,reach:tt<5.0?hand:undefined,look:-notice,sight:notice,shade:B});
  // breath rings: paper rings grow from the chest with the exhale
  {const p=new Path2D();let any=false;const chest:Pt=[cx,cy-ch*.5];for(let k2=0;k2<3;k2++){const r=380*sm(3.65+k2*.33,4.85+k2*.33,tt,easeOut);if(r<8)continue;any=true;p.addPath(ring(chest[0],chest[1],r-8,r+8));}if(any)s.knockout(p,.8);}
  // the string: strained straight from the hand to the crown, humming; slackens with the breath; released, it falls
  const end:Pt=drop>0?[lerp(pinned[0],hand[0]+380,drop),lerp(pinned[1],cy-40,drop)-bounce]:pinned;
  const start:Pt=drop>0?[hand[0]+40*drop,hand[1]+120*drop]:hand;
  const slack=(drop>0?.35:0)+.22*sm(3.9,4.5,tt,easeOut),hum=tt>=.6&&tt<.8?6:0;
  string(s,stringPts(start,end,slack,14,hum,twosIndex(t)),lerp(8,11,breath),{seed:37});
  reel(s,hand[0]-10,hand[1]+10,Y,39,{r:60,spin:-press});
  // another answer: a dashed route on the left toward a second kite already flying there; it draws solid once noticed
  route(s,[[-720,-560],[-520,-460],[-360,-380]],1,38,{cov:.8});
  string(s,[[-720,-560],[-520,-460],[-360,-380]],9,{seed:40,progress:sm(6.9,7.4,tt,easeOut)});
  kite(s,-780,-680,-.3,200,270,B,41,{tail:tt*3,wind:30,bows:3,tailLen:.6});
  leaves(s,0,0,700,6,42,{scatter:.5*pulse(tt,3.65),dx:tt*8,dy:0,size:22});
  s.restore();
  // the seam material: a gust — one huge blue wind band sweeps in from the left across the centre and blows the sheet off
  if(blow>0)s.fill(B,bandPath(20,340,-3000*(1-blow),420,43),.6);
 },
 aperture(){return apertureDisc(0,20,150,12);},
 still:4.6,
};

// ---------------- chapter 4: the defender closes the forward pass; keep it close; scan; sideways — the kite turns with the ball ----------------
const ch4:Scene={
 draw(s,t){
  const tt=twos(t);
  const stepIn=key(tt,[[.2,1200],[.35,1240,easeIn],[.9,300,easeOut]])+10*settle(tt,.9,{amp:1,freq:6,decay:6}),closed=clamp((1200-stepIn)/900);
  const gust=-80*key(tt,[[6.58,0],[6.78,1,easeOut],[7.2,1],[7.8,0]]);
  const v=key(t,[[0,0,-40,1],[1,40,-60,1.1],[3.4,40,-60,1.1],[4.3,-40,-20,1.15],[5,-40,-20,1.15],[5.2,-40,-10,1.15],[5.9,-280,-20,1.15],[6.58,-280,-20,1.15],[7.4,-400,-100,1.15],[10.5,-400,-100,1.15]],easeIO,true);
  s.camera(v[0]+20*sm(.5,.9,t)*(1-sm(1.5,2,t)),v[1],v[2],0);
  sky(s,{horizon:300,seed:41,gust,tails:110+120*Math.abs(gust)/80});
  skyGap(s,360,-420,300,160,.85*(1-closed));
  ground(s,300,42,{lines:[340,600],lift:8*pulse(tt,6.8)});
  leaves(s,-100,-100,900,12,43,{scatter:.9*pulse(tt,.9)+.5*pulse(tt,7.0),dx:tt*12+gust*1.5,dy:0});
  // you: on the court with the ball, holding the kite string; the kite is reeled in short and kept close on "Keep the ball close"
  const yx=-100,yy=560,yh=440,hand=HAND(yx,yy,yh,1);
  const L=key(tt,[[3.5,320],[4.1,150,easeIO]]),tight=sm(4.1,4.3,tt);
  const scan=sm(4.6,5.0,tt,easeOut),swing=sm(6.8,7.5,tt,easeIO),ov=easeOutBack(swing);
  const home:Pt=[hand[0]+40-40*sm(.5,.9,tt),hand[1]-L-140],circ:Pt=[home[0]+30*Math.cos(tt*8)*tight,home[1]+30*Math.sin(tt*8)*tight];
  let kp:Pt=circ,ang=-.1*sm(.5,.9,tt);
  if(swing>0){const p=arc(circ,[-520,-200],clamp(ov),120);kp=[p[0],p[1]+20*settle(tt,7.5,{amp:1,freq:3,decay:5})];ang=-.3*Math.sin(swing*Math.PI)-.15*clamp(swing);}
  // the forward lane on the court: dashed to the right, crumpled and faded where the defender closes it
  route(s,[[-20,540],[240,540],[520,540]],1,44,{crumple:24*closed*(1-sm(3.4,3.8,tt)),cov:.95*(1-sm(3.4,3.9,tt))});
  // the defender (blue) steps into the lane from the right, leaning at the ball
  figure(s,stepIn,560,460,'step',{ink:B,seed:45,face:-1,k:.5+.5*closed,shade:K});
  // the teammate to the side: arms out, revealed by the scan (the camera pans to them)
  figure(s,-560,540,420,'arms',{seed:46,face:1,k:.6+.4*scan,shade:B});
  // the ball: in front of you, pulled close on "Keep the ball close", then the sideways pass (0.7 s) to the teammate's feet
  const close=sm(3.4,3.9,tt,easeIO),passK=anticipate(6.58,6.78,tt,{back:.5,hold:.6,e:easeIn}),pass=sm(6.78,7.48,tt,easeOut);
  let bx=lerp(-10,-150,close),by=550;let sq=0;
  if(pass>0){bx=lerp(-150,-500,pass);by=550-60*Math.sin(pass*Math.PI);sq=pass>=1?.07*settle(tt,7.48,{amp:1,freq:4,decay:5,phase:Math.PI/2}):0;}
  // your pose: stand with the string; scan = head turns left with a sight wedge; the pass = the front foot swings to the ball
  const kicking=tt>=6.58&&tt<7.3;
  figure(s,yx,yy,yh,kicking?'kick':scan>0?'scan':'stand',{seed:47,face:kicking?-1:1,k:kicking?clamp(passK)+.2:1,reach:kicking?undefined:hand,look:-scan,sight:scan*(1-sm(6.4,6.6,tt)),foot:kicking?[yx-lerp(60,150,clamp(passK))+(passK<0?-passK*100:0),yy-lerp(30,20,clamp(passK))]:undefined,shade:B});
  if(pass>0&&pass<1)speedLines(s,K,bx,by,Math.PI,{n:4,seed:48,len:110,width:5,cov:.8});
  clothBall(s,bx,by,72,49,{rot:pass*5+close*2,sx:1+sq,sy:1-sq});
  if(tight>0&&swing<=0)s.knockout(ribbon([[bx+120,by-140],[bx+170,by],[bx+120,by+120]],14,{seed:50,taper:.5,wobble:2}),.9*tight);
  // the string from your hand (or, once kicked, from the hand's place) to the kite; shield arc while it is kept close
  const from:Pt=kicking?[yx+yh*.36,yy-yh*.86]:hand;
  string(s,stringPts(from,bridleOf(kp[0],kp[1],ang),.05+.15*(1-sm(.5,.9,tt))*(tt<3.5?1:0)+.1*swing),tt>=.9&&tt<3.5?8:11,{seed:51});
  if(swing>0&&swing<1)speedLines(s,B,kp[0],kp[1],Math.PI,{n:5,seed:52,len:120,width:6});
  kite(s,kp[0],kp[1],ang,300,410,Y,53,{dent:.9*closed*(1-sm(3.4,3.9,tt)),side:'right',tail:tt*3,wind:40+gust*.5,glint:.5*swing});
  // time opens: the bands part around the kite's new position
  const lens=sm(7.3,7.9,tt,easeOut);if(lens>0)s.knockout(polyPath(blob(-520,-200,260*lens,260*lens,54,{amp:.05}),true),.35);
  reel(s,from[0]-8,from[1]+8,Y,55,{r:44,spin:-sm(3.5,4.1,tt)*5});
 },
 aperture(){return aperture(rotPts([[0,-140],[110,-30],[0,140],[-110,-30]],-.15).map(p=>[p[0]-520,p[1]-200] as Pt));},
 still:4.6,
};

// ---------------- chapter 5: move after the pass; a different route; backward, then forward through the gap — the kite mirrors the ball ----------------
const ch5:Scene={
 draw(s,t){
  const tt=twos(t);
  const v=key(t,[[0,-260,60,1,-.06],[1.1,-160,80,1,-.06],[4.1,-160,80,1,-.06],[5,-100,60,1.05,0],[5.54,-100,60,1.05,0],[6.44,-140,80,1.05,0],[7,-140,80,1.05,0],[8,220,-40,1.05,0],[9.8,220,-40,1.05,0]],easeIO,true);
  s.camera(v[0]+15*sm(2.2,2.9,t)*(1-sm(3.5,4,t)),v[1],v[2],v[3]);
  sky(s,{horizon:300,seed:61,tails:120,gust:20*Math.sin(t*.7)});
  ground(s,300,62,{lines:[340,600],lift:6*pulse(tt,7.4)});
  leaves(s,200,-100,900,10,63,{scatter:.6*pulse(tt,1.1)+.8*pulse(tt,8),dx:tt*14,dy:0});
  // two trees in the sky-ground; the gap between them opens when the kite goes back
  const deflate=sm(7.8,8.4,tt),leanA=key(tt,[[.9,0],[1.3,.17],[2.4,.17],[2.9,.24],[6.2,.24],[6.8,-.25],[7.8,-.25],[8.4,-.1]]),leanB=key(tt,[[2.4,0],[2.9,-.2],[6.2,-.2],[6.8,-.3],[7.8,-.3],[8.4,-.15]]);
  tree(s,-40,-260,360,320,65,{lean:leanA,deflate,trunk:200});tree(s,560,-300,340,300,66,{lean:leanB,deflate,trunk:220});
  // the players: the teammate (with the ball) at the left, you run to a new angle, the defender shifts, then lunges the wrong way
  const T:Pt=[-520,540],run=sm(.2,1.1,tt,easeOut),Yp:Pt=[lerp(-100,60,run),lerp(560,700,run)];
  const dx=key(tt,[[1.2,300],[1.6,140,easeIO],[6.4,140],[6.9,-60,easeIn],[7.6,-60],[8.2,20]]),D:Pt=[dx,560];
  const fwd=sm(6.5,7.8,tt,easeOut),T2:Pt=[lerp(T[0],460,fwd),lerp(T[1],420,fwd)];
  // routes: the new angle from the teammate back to you; a different route forward through the gap
  route(s,[[T[0]+60,T[1]-10],[Yp[0]-60,Yp[1]-30]],sm(1.1,1.5,tt,easeOut)*(1-sm(5.74,6.0,tt)),67);
  route(s,[[Yp[0]+40,Yp[1]-40],[220,540],[440,430]],sm(4.3,5.0,tt,easeOut)*(1-sm(7.0,7.3,tt)),68);
  // the ball: with the teammate; back to you on "Going backward" (0.7 s); forward past the defender through the gap on "move forward later"
  const back=sm(5.74,6.44,tt,easeOut),through=sm(7.0,7.8,tt,easeIO);
  let bx=T[0]+70,by=T[1]-20,sq=0;
  if(back>0&&through<=0){bx=lerp(T[0]+70,Yp[0]+50,back);by=lerp(T[1]-20,Yp[1]-20,back)-50*Math.sin(back*Math.PI);sq=back>=1?.07*settle(tt,6.44,{amp:1,freq:4,decay:5,phase:Math.PI/2}):0;}
  else if(through>0){bx=lerp(Yp[0]+50,T2[0]-60,through);by=lerp(Yp[1]-20,T2[1]-10,through)-40*Math.sin(through*Math.PI);sq=through>=1?.07*settle(tt,7.8,{amp:1,freq:4,decay:5,phase:Math.PI/2}):0;}
  const tKick=anticipate(5.5,5.74,tt,{back:.5,hold:.6,e:easeIn}),yKick=anticipate(6.8,7.0,tt,{back:.5,hold:.6,e:easeIn});
  figure(s,T2[0],T2[1],420,fwd>0&&fwd<1?'run':tt>=5.5&&tt<6.2?'kick':'arms',{seed:71,face:1,k:tt>=5.5&&tt<6.2?clamp(tKick)+.2:fwd>0&&fwd<1?1:.7,foot:tt>=5.5&&tt<6.2?[T2[0]+lerp(50,140,clamp(tKick))+(tKick<0?tKick*100:0),T2[1]-lerp(30,10,clamp(tKick))]:undefined,shade:B});
  figure(s,D[0],D[1],460,'step',{ink:B,seed:72,face:-1,k:.6+.4*sm(6.9,7.2,tt),shade:K});
  const yKicking=tt>=6.8&&tt<7.5;
  figure(s,Yp[0],Yp[1],440,run>0&&run<1?'run':yKicking?'kick':'stand',{seed:73,face:1,k:yKicking?clamp(yKick)+.2:1,foot:yKicking?[Yp[0]+lerp(50,140,clamp(yKick))+(yKick<0?yKick*100:0),Yp[1]-lerp(30,10,clamp(yKick))]:undefined,shade:B});
  if(run>0&&run<1)speedLines(s,K,Yp[0],Yp[1]-200,Math.atan2(140,160),{n:4,seed:74,len:110,width:5,cov:.8});
  if((back>0&&back<1)||(through>0&&through<1))speedLines(s,K,bx,by,through>0?Math.atan2(-80,400):Math.PI,{n:4,seed:75,len:100,width:5,cov:.8});
  clothBall(s,bx,by,72,76,{rot:(back+through)*5,sx:1+sq,sy:1-sq});
  // the kite mirrors the ball: above the holder, back, then forward and high through the gap between the trees; its string from the holder's hand
  const holder:Pt=through>=1?T2:back>=1?Yp:T;const hand=HAND(holder[0],holder[1],420,1);
  const kx=bx+40,ky=through>0?lerp(-120,-420,through)+40*Math.sin(through*Math.PI):-120-60*Math.sin(back*Math.PI),ang=through>0?-.3*Math.sin(clamp(through)*Math.PI)-.2*(through>=1?1:0)+.03*settle(tt,7.8,{amp:1,freq:2,decay:2}):.2*Math.sin(back*Math.PI);
  string(s,stringPts(hand,bridleOf(kx,ky,ang,410),(back>0&&back<1)||(through>0&&through<1)?.12:.05),8,{seed:69});
  kite(s,kx,ky,ang,300,410,Y,77,{tail:tt*3,wind:40,glint:.6*sm(7.6,8,tt)});
  reel(s,hand[0]-8,hand[1]+8,Y,78,{r:40,spin:(back+through)*3});
 },
 aperture(){return apertureDisc(440,-420,88,12);},
 still:4.8,
};

// ---------------- chapter 6: the whole field — the child small below with the reel; notice, choose, adjust; open sky ----------------
const ch6:Scene={
 draw(s,t){
  const tt=twos(t);
  const v=key(t,[[0,0,500,1,0],[1.4,0,-160,1,0],[5.12,0,-160,1,0],[5.57,-160,-300,1,-.07],[5.62,-160,-300,1,-.07],[6.02,-40,-220,1.05,0],[6.12,-40,-220,1.05,0],[6.52,20,-260,1.05,.05],[7.5,20,-260,1.05,.05],[8.3,-20,420,1.05,0],[9.14,-20,420,1.05,0],[10.04,40,-300,1.05,0],[11.6,40,-300,1.06,0]],easeIO,true);
  s.camera(v[0],v[1]+15*pulse(t,5.12)+15*pulse(t,9.14),v[2],v[3]);
  const band1=sm(5.12,6.2,tt,easeOut),band2=sm(9.14,10.0,tt,easeOut),open=sm(9.4,10.2,tt,easeOut);
  sky(s,{horizon:560,seed:81,count:4,pitch:330,h:190,tails:100+120*open,gust:10*Math.sin(t*.8)});
  if(band1>0)s.fill(B,bandPath(-560,180,-2600*(1-band1),260,82,true),.45);
  if(band2>0)s.fill(B,bandPath(-330,170,2600*(1-band2),220,83),.45);
  ground(s,560,84,{lines:[600]});
  // the small court far below: navy lines; the child stands on it holding the reel, looking up at the kite
  {const p=new Path2D();p.addPath(ribbon([[-260,600],[260,600],[260,760],[-260,760],[-260,600]],6,{seed:85,close:true,wobble:1,step:30}));p.addPath(ribbon([[0,600],[0,760]],5,{seed:86,wobble:1}));s.fill(K,p,.9);}
  const cx=-60,cy=740,ch=300,hand=HAND(cx,cy,ch,1);
  figure(s,cx,cy,ch,'pull',{seed:87,face:1,k:.7+.2*open,reach:hand,shade:B});
  leaves(s,0,-100,900,16,89,{scatter:.5*pulse(tt,6.3)+.5*pulse(tt,9.6),dx:tt*16,dy:0,size:24});
  // the crumpled route unfolds from the reel outward and feeds up into the string
  const unfold=sm(.2,1.0,tt,easeOut);
  if(unfold<1){const pts:Pt[]=[];const len=260*(1-unfold);for(let i=0;i<=8;i++){const u=i/8,amp=30*(1-sm(.2+i*.08,.5+i*.08,tt));pts.push([hand[0]+u*len,hand[1]+(i%2?amp:-amp)]);}s.fill(K,ribbon(pts,9,{seed:90,pressure:.3,taper:.2,wobble:.5}),.95);}
  // the kite: rises as the string goes taut; notice / choose / adjust as three turns; climbs into open sky
  const rise=sm(2.6,3.2,tt,easeOut),slack=key(tt,[[0,.55],[2.6,.55],[3.1,.04]]);
  const rot=key(tt,[[0,-.38],[5.62,-.38],[5.72,-.29,easeIn],[6.02,-.31,easeOut],[6.06,-.26],[6.12,-.26],[6.2,-.33,easeIn],[6.52,.21,easeOut],[6.8,.17]])+.03*settle(tt,10.2,{amp:1,freq:1.5,decay:1.5})+.06*settle(tt,6.52,{amp:1,freq:3,decay:4});
  const dent=key(tt,[[6.3,0],[6.45,1],[6.7,0]]);
  const kx=key(tt,[[0,0],[5.62,0],[6.02,-30],[6.52,10],[9.4,10],[10.2,40]]),ky=-200-80*rise-60*sm(6.5,7.1,tt,easeOut)-120*sm(9.4,10.2,tt,easeOut)+6*Math.sin(tt*2)*open;
  const lens=200+220*open;if(open>0)s.knockout(polyPath(blob(kx,ky,lens*1.1,lens*.8,91,{amp:.05}),true),.35*open);
  string(s,stringPts(hand,add([kx,ky],rotPts([[0,180]],rot)[0]),slack,14),8,{seed:92});
  kite(s,kx,ky,rot,360,480,Y,93,{dent,side:'left',tail:tt*3,wind:40+30*open,glint:sm(2.6,3.2,tt)*(1-.5*sm(4,5,tt))+.6*open});
  reel(s,hand[0]-6,hand[1]+6,Y,88,{r:30,spin:sm(.2,1.2,tt)*4});
 },
 still:6.6,
};

export const story:RisoStory={
 id:'kite-turned',format:'futsal',title:'The Kite That Turned',theme:'Adapting when plans change',ageNote:'For futsal players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',blue:'#0078bf',green:'#00a95c',navy:'#22366b'},order:['yellow','blue','green','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:[
  {label:'When the plan changes',headline:{text:'Look again',at:7.68},narration:'What happens when the option you expected disappears? You might feel frustrated or stuck. That feeling signals a need to look again.',seconds:9.883,audio:CH+'01.m4a',cues:[{at:0,words:'What happens'},{at:4.0,words:'frustrated or stuck'},{at:7.68,words:'look again'}]},
  {label:'Adjust your angle',narration:'Think of a kite in changing wind. Staying aloft takes adjustment. You can keep your purpose while changing the angle you use.',seconds:9.983,audio:CH+'02.m4a',cues:[{at:0,words:'Think of a kite'},{at:2.9,words:'Staying aloft'},{at:6.52,words:'changing the angle'}]},
  {label:'Make room to notice',headline:{text:'Let go',at:3.4},narration:'Adapting means responding to what is happening now. Take a breath. Let go of the first answer to notice another.',seconds:8.683,audio:CH+'03.m4a',cues:[{at:0,words:'Adapting means'},{at:3.4,words:'Take a breath'},{at:6.24,words:'notice another'}]},
  {label:'Keep more options open',headline:'Sideways',narration:'In futsal, a defender may close your forward pass. Keep the ball close. Scan for support. A sideways pass can create time.',seconds:10.283,audio:CH+'04.m4a',cues:[{at:0,words:'In futsal'},{at:3.4,words:'Keep the ball close'},{at:6.58,words:'A sideways pass'}]},
  {label:'Move after the pass',narration:'Then move to offer a new angle. Together, your team can find a different route. Going backward can help you move forward later.',seconds:9.683,audio:CH+'05.m4a',cues:[{at:0,words:'Then move'},{at:4.1,words:'a different route'},{at:5.54,words:'Going backward'}]},
  {label:'Notice. Choose. Adjust.',narration:'Changing your plan does not erase your effort. It puts that effort to use. Notice, choose, adjust. Keep your purpose. Stay open to another way.',seconds:11.485,audio:CH+'06.m4a',cues:[{at:0,words:'Changing your plan'},{at:5.12,words:'Notice, choose, adjust'},{at:9.14,words:'another way'}]},
 ],
 draw(f){playChapters(story,f,[ch1,ch2,ch3,ch4,ch5,ch6]);},
 /** Touch: a gust at the point — a small yellow kite appears there, rocks ±8° and its tail bows as three blue streak tails blow right; leaves scatter. */
 touch(s,x,y,age,seed){
  const rr=rng(seed);
  if(age<=0){kite(s,x,y-60,.1,120,160,Y,seed,{bows:2,tailLen:.5,wind:30});return;}
  const g=easeOut(clamp(age/.4)),fade=1-clamp((age-.35)/.45),p=new Path2D();
  for(let k=0;k<3;k++){const y0=y+(k-1)*50+(rr()-.5)*10,L=(160+rr()*120)*g,x0=x-60+rr()*20+age*140;p.addPath(polyPath([[x0,y0-12],[x0+L,y0-5],[x0+L+34,y0],[x0+L,y0+5],[x0,y0+12]],true));}
  if(fade>.05)s.fill(B,p,.45*fade+.3);
  if(fade>.05)leaves(s,x+90*g,y,90+90*g,6,seed,{scatter:g*.6,size:24});
  const rock=.14*Math.sin(age*TAU*2.2)*Math.exp(-age*2);
  if(fade>.05)kite(s,x+60*g,y-70-20*g,.1+rock,120,160,Y,seed,{bows:2,tailLen:.5,wind:30+120*g*fade,dent:.6*g*fade,side:'left'});
 },
};
