/** The House You Build — riso. Lead material: a cut-paper cross-section house that grows floor by floor on a hillside
 * (yellow sky, green turf along a sloping ground profile, warm orange soil strata), and the player who grows with it.
 * Bricks are the material: hand-cut orange blocks with paper mortar that fly into courses and STAMP in with a dust puff;
 * a missing brick cracks and rocks everything above it; the brick stamped back settles it. Rooms are lit yellow; a beam
 * is lifted into the ceiling (strength); a big back-wall window opens onto a mini pitch (reading the game); the roof of
 * rafters and tile rows is placed at night while a disco flashes far off and the Saturday sun rises; the ridge tie holds it.
 * Figures (bible §1c.4) are cut-paper pictograms: you = yellow (kid → teen → older teen → finished), teammate = orange,
 * opponent = navy. The football is the brick-dust ball: paper disc, five hand-cut ORANGE pentagons, navy seams and contour.
 * Inks yellow → orange → green → navy on cream; dominance orange brick + yellow light, green only for turf and the pitch.
 * Scenes read only their local time t; all randomness is seeded, so the passage seams stay pixel-continuous. */
import type {Sheet} from '../sheet';
import {type RisoStory,type Scene,playChapters} from '../story';
import {apertureDisc} from '../passage';
import {twos,twosIndex,sm,easeOut,easeIO,easeIn,easeOutBack,linear,key,camKeys,anticipate,settle,clamp,lerp,rng,hash,noise1,blob,polyPath,ribbon,smoothPts,partial,circlePath,rectPath,torn,arc,scalePts,TAU,type Pt} from '../motion';
import {contour,handCut,confetti,sparkBurst,speedLines,crescent,glowDisc,ring} from '../shapes';

const CH='/stories/narration/7v7/house-player/';
const K='navy',Y='yellow',O='orange',G='green';
// the house world (units): ground line, floors, slabs, roof — shared by every chapter
const HW=484,WT=64,IW=HW-WT,GROUND=320,FTOP=240,F1T=-100,S1=-140,F2T=-460,S2=-500,APEX=-820,BFLOOR=620,BBOT=660,EAVE=524;
const WX=-220,WY=-440,WW=440,WH=250; // the big second-floor window (back wall)
const W1X=300,W1Y=5,DOORX=-250; // the first-floor window and door (back wall)
const doorPath=(x:number,y:number,w:number,h:number)=>{const p=new Path2D();p.moveTo(x-w/2,y);p.lineTo(x-w/2,y-h+w/2);p.arc(x,y-h+w/2,w/2,Math.PI,0);p.lineTo(x+w/2,y);p.closePath();return p;};
/** Camera keys on real chapter time (a Catmull-Rom path through the keys, no whole-chapter time warp) so every move lands on its cue. */
const cam=(s:Sheet,t:number,K:number[][])=>camKeys(s,t,K,linear);
const shake=(t:number,seed:number,amp:number)=>(hash(twosIndex(t),seed)-.5)*2*amp;

// ---------------- abstract riso figure (bible §1c.4) ----------------
/** A cut-paper player pictogram: a head disc, a hand-cut torso block, two leg strokes, two arm strokes — no anatomy, no face.
 * (x,y) = the ground point under the body, h = height, face = +1 looks right. Poses are parameter tables blended from `from` by k.
 * wide broadens the torso (the physical pop); glow prints an orange chest disc (want); afterimage = navy tone only (a smear copy). */
type Pose='stand'|'slump'|'lean'|'listen'|'step'|'step2'|'kick'|'point'|'crouch'|'run'|'up'|'arms'|'lift'|'rest';
type PoseParams={tilt:number;head:Pt;legF:Pt;legB:Pt;armF:Pt;armB:Pt;hip:number};
const POSES:Record<Pose,PoseParams>={
 stand:{tilt:0,head:[0,0],legF:[.1,0],legB:[-.1,0],armF:[.2,.27],armB:[-.2,.27],hip:0},
 slump:{tilt:.4,head:[.05,.07],legF:[.06,0],legB:[-.08,0],armF:[.16,.34],armB:[-.02,.34],hip:.02},
 lean:{tilt:.34,head:[.03,.01],legF:[.3,0],legB:[-.34,-.02],armF:[.3,-.3],armB:[-.28,.14],hip:.03},
 listen:{tilt:.15,head:[.06,.02],legF:[.12,0],legB:[-.1,0],armF:[.05,-.14],armB:[-.2,.27],hip:0},
 step:{tilt:.26,head:[.01,0],legF:[.32,0],legB:[-.3,0],armF:[.36,.1],armB:[-.3,.14],hip:.06},
 step2:{tilt:.26,head:[.01,0],legF:[-.3,0],legB:[.32,0],armF:[-.3,.14],armB:[.36,.1],hip:.06},
 kick:{tilt:-.12,head:[0,0],legF:[.34,-.08],legB:[-.12,0],armF:[.3,0],armB:[-.32,.05],hip:0},
 point:{tilt:.02,head:[.02,0],legF:[.14,0],legB:[-.1,0],armF:[.46,-.02],armB:[-.2,.27],hip:0},
 crouch:{tilt:.3,head:[.02,.01],legF:[.24,0],legB:[-.24,0],armF:[.3,.12],armB:[-.28,.16],hip:.12},
 run:{tilt:.35,head:[.02,0],legF:[.3,-.14],legB:[-.36,-.05],armF:[.28,-.06],armB:[-.3,.1],hip:0},
 up:{tilt:-.04,head:[0,0],legF:[.12,0],legB:[-.12,0],armF:[.28,-.36],armB:[-.28,-.36],hip:0},
 arms:{tilt:.05,head:[0,0],legF:[.15,0],legB:[-.15,0],armF:[.42,-.12],armB:[-.42,-.12],hip:0},
 lift:{tilt:-.02,head:[0,0],legF:[.16,0],legB:[-.16,0],armF:[.14,-.52],armB:[-.14,-.52],hip:0},
 rest:{tilt:.06,head:[.02,0],legF:[.2,-.16],legB:[-.12,0],armF:[.22,.24],armB:[-.2,.27],hip:.02},
};
type FigOpts={ink?:string;line?:string;seed?:number;face?:1|-1;look?:number;k?:number;from?:Pose;cov?:number;reach?:Pt;reachB?:Pt;shade?:string;sight?:number;dry?:boolean;tilt?:number;wide?:number;afterimage?:number;glow?:number};
type Fig={head:Pt;R:number;handF:Pt;handB:Pt;footF:Pt;top:number};
function figure(s:Sheet,x:number,y:number,h:number,pose:Pose,o:FigOpts={}):Fig|undefined{
 const{ink=Y,line=K,seed=1,face=1,look=0,k=1,from='stand',cov=.92,reach,reachB,shade,sight=0,dry=false,tilt:extra=0,wide=1,afterimage=0,glow=0}=o;if(h<8)return;
 const base=POSES[from],p=POSES[pose],L=(a:number,b:number)=>lerp(a,b,k),LP=(a:Pt,b:Pt):Pt=>[lerp(a[0],b[0],k),lerp(a[1],b[1],k)];
 const tilt=L(base.tilt,p.tilt)+extra,head=LP(base.head,p.head),legF=LP(base.legF,p.legF),legB=LP(base.legB,p.legB),armF=LP(base.armF,p.armF),armB=LP(base.armB,p.armB),hip=L(base.hip,p.hip);
 const R=h*.155,tw=h*.3*wide,th=h*.38,legL=h*.3,hipY=-legL+hip*h,ca=Math.cos(tilt),sa=Math.sin(tilt);
 const W=(lx:number,ly:number):Pt=>[x+lx*face,y+ly];
 const T=(lx:number,ly:number):Pt=>[lx*ca-ly*sa,hipY+lx*sa+ly*ca];
 const corners=[T(-tw/2,0),T(tw/2,0),T(tw/2,-th),T(-tw/2,-th)].map(q=>W(q[0],q[1]));
 const torsoPts=handCut(corners,seed,h*.035,h*.1),torso=polyPath(torsoPts,true);
 const shF=T(tw*.42,-th+R*.25),shB=T(-tw*.42,-th+R*.25);
 const hc=T(0,-th-R*1.1),headC=W(hc[0]+head[0]*h+look*R*.42,hc[1]+head[1]*h),headPts=blob(headC[0],headC[1],R*.92,R*1.08,seed+2,{amp:.06,n:30});
 const headPath=polyPath(headPts,true);
 const hipF=W(tw*.18,hipY),hipB=W(-tw*.18,hipY);
 const fF=W(legF[0]*h,legF[1]*h),fB=W(legB[0]*h,legB[1]*h);
 const aF=reach?reach:W(shF[0]+armF[0]*h,shF[1]+armF[1]*h),aB=reachB?reachB:W(shB[0]+armB[0]*h,shB[1]+armB[1]*h);
 const out:Fig={head:headC,R,handF:aF,handB:aB,footF:fF,top:headC[1]-R*1.1};if(dry)return out;
 const limbs=new Path2D();
 limbs.addPath(ribbon([hipF,fF],h*.08,{seed:seed+3,pressure:.4,taper:.25,wobble:1.4}));limbs.addPath(ribbon([hipB,fB],h*.08,{seed:seed+4,pressure:.4,taper:.25,wobble:1.4}));
 limbs.addPath(ribbon([W(shB[0],shB[1]),aB],h*.062,{seed:seed+5,pressure:.4,taper:.35,wobble:1.4}));limbs.addPath(ribbon([W(shF[0],shF[1]),aF],h*.062,{seed:seed+6,pressure:.4,taper:.35,wobble:1.4}));
 const all=new Path2D();all.addPath(torso);all.addPath(headPath);all.addPath(limbs);
 if(afterimage>0){s.tone(line,all,afterimage);return out;}
 const outl=new Path2D();outl.addPath(ribbon(torsoPts,Math.max(4,h*.022),{seed:seed+7,close:true,pressure:.6,wobble:1.8,gaps:[[.62,.66]]}));outl.addPath(ribbon(headPts,Math.max(4,h*.022),{seed:seed+8,close:true,pressure:.6,wobble:1.4}));
 if(sight>0){const d=face*(look>=0?1:-1),sx=headC[0]+d*R*.6,wedge=polyPath([[headC[0],headC[1]],[sx+d*h*.55,headC[1]-h*.22],[sx+d*h*.55,headC[1]+h*.12]],true);s.knockout(wedge,.3*sight);}
 s.knockout(all);s.fill(ink,all,cov);s.fill(line,outl,.9);
 if(glow>0){const g=T(0,-th*.55),gc=W(g[0],g[1]),gr=R*.95*glow;s.fill(O,polyPath(blob(gc[0],gc[1],gr,gr,seed+11,{amp:.08,n:20}),true),.95);}
 if(shade){const sh=new Path2D();sh.addPath(crescent(headC[0],headC[1],R*.95,[-.35*face,-.4]));sh.addPath(polyPath([corners[0],[lerp(corners[1][0],corners[0][0],.5),lerp(corners[1][1],corners[0][1],.5)],[lerp(corners[2][0],corners[3][0],.5),lerp(corners[2][1],corners[3][1],.5)],corners[3]],true));s.tone(shade,sh,.45);}
 return out;
}
const walkPose=(t:number,moving:boolean):Pose=>moving?(twosIndex(t)%2?'step2':'step'):'stand';

// ---------------- the material: bricks ----------------
type Brick={x:number;y:number;w:number;h:number;i:number;row:number;cx:number;cy:number};
/** Staggered courses inside a box, bottom row first, left to right. */
function brickLayout(x:number,y:number,w:number,h:number,bw=92,bh=40,gap=7):Brick[]{
 const rows=Math.max(1,Math.round(h/bh)),out:Brick[]=[];let i=0;
 for(let r=0;r<rows;r++){const by=y+h-(r+1)*bh,off=r%2?bw/2:0;
  for(let bx=x-off;bx<x+w;bx+=bw){const x0=Math.max(x,bx),x1=Math.min(x+w,bx+bw);if(x1-x0<bw*.3)continue;const b={x:x0+gap/2,y:by+gap/2,w:x1-x0-gap,h:bh-gap,i:i++,row:r,cx:0,cy:0};b.cx=b.x+b.w/2;b.cy=b.y+b.h/2;out.push(b);}}
 return out;
}
/** Per-brick modifier: [dx, dy, scale] or null (not drawn). */
type Mod=(b:Brick)=>[number,number,number]|null;
function brickPath(bs:Brick[],seed:number,jitter=3,mod?:Mod){
 const p=new Path2D();
 for(const b of bs){let dx=0,dy=0,sc=1;if(mod){const m=mod(b);if(!m)continue;[dx,dy,sc]=m;}
  const cx=b.cx+dx,cy=b.cy+dy,hw=b.w/2*sc,hh=b.h/2*sc,j=(k:number)=>(hash(b.i*8+k,seed)-.5)*2*jitter;
  p.moveTo(cx-hw+j(0),cy-hh+j(1));p.lineTo(cx+hw+j(2),cy-hh+j(3));p.lineTo(cx+hw+j(4),cy+hh+j(5));p.lineTo(cx-hw+j(6),cy+hh+j(7));p.closePath();}
 return p;
}
/** A brick wall: two flat orange prints alternating brick by brick (paper mortar shows where the sheet was knocked out beneath). */
function wall(s:Sheet,x:number,y:number,w:number,h:number,seed:number,o:{mod?:Mod;cov?:number;alt?:number;jitter?:number;bw?:number;bh?:number}={}):Brick[]{
 const{mod,cov=.96,alt=.75,jitter=3,bw=92,bh=40}=o,bs=brickLayout(x,y,w,h,bw,bh);
 s.fill(O,brickPath(bs.filter(b=>b.i%2===0),seed,jitter,mod),cov);s.fill(O,brickPath(bs.filter(b=>b.i%2===1),seed+1,jitter,mod),alt);return bs;
}
/** A brick that lands at `at`: flies in on an arc from `from` for `fly` s, then stamps 1.32 → 1 with a back-ease. */
function stampMod(t:number,land:(b:Brick)=>number,from:Pt,fly=.3):Mod{
 return b=>{const at=land(b);if(!Number.isFinite(at)||t<at-fly)return null;
  if(t<at){const u=easeIn(clamp((t-(at-fly))/fly)),p=arc(from,[b.cx,b.cy],u,140);return[p[0]-b.cx,p[1]-b.cy,1];}
  return[0,0,lerp(1.32,1,easeOutBack(clamp((t-at)/.22)))];};
}
/** A stamped part (whole): scale about its centre from 1.25 → 1 after `at`; nothing before. */
function stamped(s:Sheet,t:number,at:number,cx:number,cy:number,draw:()=>void){
 if(t<at)return;const sc=lerp(1.25,1,easeOutBack(clamp((t-at)/.24)));s.save();s.translate(cx,cy);s.scale(sc,sc);s.translate(-cx,-cy);draw();s.restore();
}
/** A single brick block (the touch, the fallen brick). */
function brick(s:Sheet,x:number,y:number,w:number,h:number,rot:number,seed:number,cov=.96){
 const pts=[[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[-w/2,h/2]].map((p,i)=>{const j=(k:number)=>(hash(i*2+k,seed)-.5)*5;return[p[0]+j(0),p[1]+j(1)] as Pt;}),c=Math.cos(rot),sn=Math.sin(rot),q=pts.map(p=>[x+p[0]*c-p[1]*sn,y+p[0]*sn+p[1]*c] as Pt),path=polyPath(q,true);
 s.knockout(path);s.fill(O,path,cov);contour(s,K,q,Math.max(3,h*.09),{close:true,seed,pressure:.5,wobble:1.2});
}
/** Dust puff: specks flung with gravity (ink) and an optional paper cloud that expands and thins. */
function puff(s:Sheet,x:number,y:number,age:number,seed:number,o:{n?:number;size?:number;up?:number;life?:number;ink?:string;cloud?:number;spread?:number}={}){
 if(age<0)return;const{n=7,size=9,up=140,life=.5,ink=Y,cloud=0,spread=1}=o,k=clamp(age/life);if(age>life*1.4)return;
 if(cloud>0&&k<1){const e=easeOut(k);s.knockout(polyPath(blob(x,y-20*e,cloud*(.35+.9*e),cloud*.55*(.35+.9*e),seed+9,{amp:.16,n:14}),true),.75*(1-k));}
 const r=rng(seed),e=easeOut(k),p=new Path2D();
 for(let i=0;i<n;i++){const a=r()*TAU,v=(90+r()*200)*spread,px=x+Math.cos(a)*v*e,py=y+(Math.sin(a)*v-up*r())*e+460*k*k,sz=size*(.5+r());p.rect(px,py,sz,sz*(.7+r()*.6));}
 s.fill(ink,p);
}
/** The brick-dust ball: paper disc, orange shadow crescent, five hand-cut ORANGE pentagons in a net, navy seams and contour. */
function ball(s:Sheet,x:number,y:number,r:number,o:{rot?:number;sx?:number;sy?:number;seed?:number}={}){
 const{rot=0,sx=1,sy=1,seed=5}=o,pts=scalePts(blob(x,y,r,r,seed,{amp:.03,n:36}),sx,sy,x,y),d=polyPath(pts,true);
 s.knockout(d);s.save();s.clip(d);s.tone(O,crescent(x,y,r*1.05,[-.4,-.45]),.32);
 const pent=(cx:number,cy:number,pr:number,a0:number)=>{const q:Pt[]=[];for(let i=0;i<5;i++){const a=a0+i/5*TAU;q.push([cx+Math.cos(a)*pr,cy+Math.sin(a)*pr]);}return polyPath(handCut(q,seed+3,pr*.1,pr*.6),true);};
 const panels=new Path2D();panels.addPath(pent(x,y,r*.3,rot));for(let i=0;i<5;i++){const a=rot+Math.PI/5+i/5*TAU,dd=r*.86;panels.addPath(pent(x+Math.cos(a)*dd*sx,y+Math.sin(a)*dd*sy,r*.28,a+Math.PI));}
 s.fill(O,panels,.96);
 const seams=new Path2D();for(let i=0;i<5;i++){const a=rot+i/5*TAU,a2=rot+Math.PI/5+i/5*TAU;seams.moveTo(x+Math.cos(a)*r*.3*sx,y+Math.sin(a)*r*.3*sy);seams.lineTo(x+Math.cos(a2)*r*.62*sx,y+Math.sin(a2)*r*.62*sy);}s.stroke(K,seams,Math.max(2,r*.055));
 s.restore();contour(s,K,pts,Math.max(4,r*.09),{close:true,seed:seed+1,pressure:.5,wobble:r*.02});
}
/** Dashed line (a plan, a lane): dashes along a polyline drawn up to u of its length. ink 'paper' = knockout. */
function dashed(s:Sheet,ink:string|'paper',pts:Pt[],width:number,seed:number,o:{u?:number;dash?:number;gap?:number;cov?:number;close?:boolean}={}){
 const{u=1,dash=44,gap=26,cov=1,close=false}=o;if(u<=0)return;const q=smoothPts(pts,close,10,1.2),cum=[0];for(let i=1;i<q.length;i++)cum.push(cum[i-1]+Math.hypot(q[i][0]-q[i-1][0],q[i][1]-q[i-1][1]));
 const L=cum[cum.length-1],lim=L*clamp(u),at=(d:number):Pt=>{let i=1;while(i<cum.length-1&&cum[i]<d)i++;const f=(d-cum[i-1])/((cum[i]-cum[i-1])||1);return[lerp(q[i-1][0],q[i][0],f),lerp(q[i-1][1],q[i][1],f)];};
 const p=new Path2D();for(let d0=0,k=0;d0<lim;d0+=dash+gap,k++){const d1=Math.min(lim,d0+dash);if(d1-d0<6)break;p.addPath(ribbon([at(d0),at(d1)],width,{seed:seed+k,wobble:.8,taper:.2,pressure:.3}));}
 if(ink==='paper')s.knockout(p,cov);else s.fill(ink,p,cov);
}
/** Cracks: zigzag navy lines shooting from a point, drawn on by u. */
function cracks(s:Sheet,x:number,y:number,u:number,seed:number,cov=1){
 if(u<=0||cov<=0)return;const dirs=[-.55,Math.PI+.4,-2.3,.45];
 dirs.forEach((a,k)=>{const r=rng(seed+k),pts:Pt[]=[[x,y]];let px=x,py=y;for(let i=1;i<=6;i++){const len=34+r()*30,lat=(r()-.5)*40;px+=Math.cos(a)*len-Math.sin(a)*lat;py+=Math.sin(a)*len+Math.cos(a)*lat;pts.push([px,py]);}
  const line=partial(pts,clamp(u*(1.3-k*.1)));if(line.length>1)contour(s,K,line,7,{seed:seed+k,taper:.6,pressure:.4,wobble:.4,cov});});
}

// ---------------- the material: house parts ----------------
/** Ground profile: a hill rising to the left, falling to the right, flat where the house sits. */
const gy=(x:number,seed:number)=>GROUND+(x<-HW-60?-(-(HW+60)-x)*.32:x>HW+60?(x-HW-60)*.22:0)+8*noise1(x/300,seed);
/** The hillside cross-section: yellow sky with two brighter torn bands toward the top, green turf ribbon along the profile,
 * four warm orange soil strata stepping deeper, sparse darker pebble chips. bulge lifts the turf (anticipation of the dig). */
function terrain(s:Sheet,seed:number,o:{bulge?:number;bulgeX?:number;soil?:boolean}={}){
 const{bulge=0,bulgeX=0,soil=true}=o;
 s.field(Y,.12,.4);
 s.tone(Y,polyPath(torn(-3400,-1300,6800,700,seed+1,40,120),true),.2);
 s.tone(Y,polyPath(torn(-3400,-3600,6800,2340,seed+2,40,120),true),.32);
 const prof=(x:number)=>gy(x,seed)-bulge*Math.exp(-Math.pow((x-bulgeX)/170,2));
 if(soil)for(let k=0;k<4;k++){const pts:Pt[]=[[-3400,4200]];for(let x=-3400;x<=3400;x+=85)pts.push([x,prof(x)+k*150+18*noise1(x/220+k*7,seed+k)]);pts.push([3400,4200]);s.tone(O,polyPath(pts,true),[.35,.5,.65,.8][k]);}
 const turf:Pt[]=[];for(let x=-3400;x<=3400;x+=85)turf.push([x,prof(x)]);s.fill(G,ribbon(turf,44,{seed:seed+5,wobble:2,taper:0,pressure:.2,step:85}),.9);
 if(soil)confetti(s,[O],[-1700,GROUND+130,3400,760],14,seed+6,{size:22});
}
/** Knock the house silhouette out of the background so bricks, rooms and light print clean on paper. */
function houseKnock(s:Sheet,top:number,bottom:number,seed:number,o:{roof?:number;left?:number;right?:number}={}){
 const{roof=0,left=-HW,right=HW}=o,p=polyPath(torn(left-6,top,right-left+12,bottom-top,seed,5,80),true);
 if(roof>0)p.addPath(polyPath([[-EAVE-8,S2+10],[0,lerp(S2+10,APEX-10,roof)],[EAVE+8,S2+10]],true));
 s.knockout(p);
}
const room=(s:Sheet,x:number,y:number,w:number,h:number,light:number,seed:number)=>{if(light>.03)s.tone(Y,polyPath(torn(x,y,w,h,seed,5,80),true),light);};
const slab=(s:Sheet,x:number,y:number,w:number,h:number,seed:number,cov=.96)=>{s.fill(O,polyPath(torn(x,y,w,h,seed,4,60),true),cov);contour(s,K,[[x,y],[x+w,y]],Math.max(5,h*.2),{seed,wobble:1,taper:.15,step:60});};
/** A small window: yellow pane, navy frame and cross. */
function win(s:Sheet,x:number,y:number,w:number,h:number,seed:number,light=.45){
 s.tone(Y,polyPath(torn(x,y,w,h,seed,3,40),true),light);
 contour(s,K,[[x,y],[x+w,y],[x+w,y+h],[x,y+h]],10,{close:true,seed,pressure:.4,wobble:1});
 const cr=new Path2D();cr.moveTo(x+w/2,y+4);cr.lineTo(x+w/2+2,y+h-4);cr.moveTo(x+4,y+h/2);cr.lineTo(x+w-4,y+h/2+2);s.stroke(K,cr,6,.9);
}
/** The door: a navy arch with a yellow knob. */
function door(s:Sheet,x:number,y:number,w:number,h:number,seed:number){
 s.fill(K,doorPath(x,y,w,h),.88);s.fill(Y,circlePath(x+w*.28,y-h*.45,7+hash(seed,3)*2),1);
}
/** The big window: contents are drawn by the caller (clipped to the rect); this prints the shutters (closing by 1−open) and the navy frame. */
function bigWindow(s:Sheet,seed:number,open:number,light=.5){
 const sh=clamp(1-open);
 if(sh>.01){const l=polyPath(torn(WX,WY,WW/2*sh,WH,seed+1,3,40),true),r=polyPath(torn(WX+WW-WW/2*sh,WY,WW/2*sh,WH,seed+2,3,40),true);s.knockout(l);s.knockout(r);s.tone(Y,l,light);s.tone(Y,r,light);
  const cr=new Path2D();for(const [x0,x1] of [[WX,WX+WW/2*sh],[WX+WW-WW/2*sh,WX+WW]]){if(x1-x0<20)continue;cr.moveTo(lerp(x0,x1,.5),WY+10);cr.lineTo(lerp(x0,x1,.5)+2,WY+WH-10);}s.stroke(K,cr,5,.7);}
 contour(s,K,[[WX,WY],[WX+WW,WY],[WX+WW,WY+WH],[WX,WY+WH]],14,{close:true,seed,pressure:.4,wobble:1.2,step:30});
 const m=new Path2D();m.moveTo(WX+WW/2,WY+6);m.lineTo(WX+WW/2+2,WY+WH-6);m.moveTo(WX+6,WY+WH*.5);m.lineTo(WX+WW-6,WY+WH*.5+2);s.stroke(K,m,8,.9);
}
/** The mini 7v7 pitch inside the window: green field with a darker mown band, paper touchline, halfway line and centre circle. */
function pitch(s:Sheet,seed:number){
 s.fill(G,rectPath(WX-40,WY-40,WW+80,WH+80),.65);
 s.fill(G,polyPath(torn(WX-40,WY+WH*.45,WW+80,WH*.28,seed,6,40),true),.8);
 const lines=new Path2D();lines.addPath(ribbon([[WX+24,WY+18],[WX+WW-24,WY+18],[WX+WW-24,WY+WH-14],[WX+24,WY+WH-14]],7,{seed,close:true,wobble:1,taper:0,step:40}));
 lines.addPath(ribbon([[WX+WW/2,WY+18],[WX+WW/2+2,WY+WH-14]],7,{seed:seed+1,wobble:1,taper:0,step:40}));lines.addPath(ring(WX+WW/2,WY+WH*.55,34,41));s.knockout(lines,.9);
}
/** The roof as a cutaway: a light attic interior (yellow glow = desire), rafters that swing up from the eaves (rafters 0..1, dip = resting angle),
 * a thick tile band along each slope that grows from the eaves (tiles 0..1) with tile ticks, and a tie beam across the base (tie 0..1). */
function roof(s:Sheet,seed:number,o:{rafters?:number;tiles?:number;glow?:number;tie?:number;dip?:number}={}){
 const{rafters=1,tiles=1,glow=0,tie=0,dip=0}=o,rise=S2-APEX,tp=clamp(tiles),len=Math.hypot(EAVE,rise);
 if(tp>0){const h=rise*tp,yTop=S2-h,xw=EAVE*(1-tp),field=polyPath(handCut([[-EAVE,S2],[-xw,yTop],[xw,yTop],[EAVE,S2]],seed,5,120),true);
  s.fill(O,field,.45);if(glow>0)s.tone(Y,field,glow);}
 const aim=Math.atan2(-rise,EAVE),a=lerp(dip,aim,clamp(rafters));
 for(const side of [-1,1]){const px=side*EAVE,ang=side<0?a:Math.PI-a,end:Pt=[px+Math.cos(ang)*len,S2+Math.sin(ang)*len];
  const rb=ribbon([[px,S2],end],34,{seed:seed+side+3,wobble:1,taper:.1,pressure:.3,step:60});s.knockout(rb);s.fill(O,rb,.96);contour(s,K,[[px,S2],end],7,{seed:seed+side+5,wobble:1,taper:.2,step:60});}
 if(tp>0){const band=new Path2D(),ticks=new Path2D(),bw=76;
  for(const side of [-1,1]){const ex=side*EAVE,dx=-ex/len,dy=-rise/len,nx=side<0?-dy:dy,ny=side<0?dx:-dx,L=len*tp;
   const P=(u:number,v:number):Pt=>[ex+dx*u+nx*v,S2+dy*u+ny*v];
   band.addPath(polyPath(handCut([P(0,0),P(L,0),P(L,bw),P(0,bw)],seed+side+11,4,80),true));
   for(let u=0;u<L;u+=62){const q0=P(u,4),q1=P(u,bw-4);ticks.moveTo(q0[0],q0[1]);ticks.lineTo(q1[0],q1[1]);const m0=P(u+(u/62%2?0:31),bw/2),m1=P(Math.min(L,u+31+(u/62%2?0:31)),bw/2);ticks.moveTo(m0[0],m0[1]);ticks.lineTo(m1[0],m1[1]);}}
  s.fill(O,band,.96);s.stroke(K,ticks,5,.75);}
 if(tie>0){const x0=lerp(-EAVE-900,-EAVE+10,easeOut(clamp(tie))),rb=ribbon([[x0,S2-28],[x0+2*EAVE-20,S2-28]],30,{seed:seed+9,wobble:.8,taper:.05,pressure:.3,step:60});s.knockout(rb);s.fill(O,rb,.96);contour(s,K,[[x0,S2-28],[x0+2*EAVE-20,S2-28]],7,{seed:seed+10,wobble:1,taper:.1,step:60});
  const bolts=new Path2D();for(let x=x0+40;x<x0+2*EAVE-40;x+=120)bolts.addPath(circlePath(x,S2-28,7));s.fill(K,bolts,.9);}
}
/** A height mark on the wall. */
const heightMark=(s:Sheet,x:number,y:number,seed:number)=>{contour(s,K,[[x,y],[x+46,y+2]],7,{seed,taper:.3,wobble:.6});};
/** The disco far off: a navy box with three windows that flash orange/yellow on twos when on, and a sweeping yellow beam. */
function disco(s:Sheet,x:number,y:number,t:number,on:number,seed:number){
 const box=polyPath(torn(x-90,y-56,180,112,seed,5,40),true);s.knockout(box);s.fill(K,box,.9);
 if(on<=0)return;const f=twosIndex(t);
 for(let i=0;i<3;i++){const wx=x-62+i*44,lit=(f+i)%2===0,p=polyPath(torn(wx,y-30,30,44,seed+i,2,20),true);s.knockout(p);s.fill(lit?Y:O,p,on>.5?1:.6);}
 const a=-Math.PI/2+.5*Math.sin(t*3.1),beam=polyPath([[x,y-56],[x+Math.cos(a-.22)*420,y-56+Math.sin(a-.22)*420],[x+Math.cos(a+.22)*420,y-56+Math.sin(a+.22)*420]],true);s.knockout(beam,.4*on);s.tone(Y,beam,on>.5?.32:.2);
}
/** The first floor as built (shared by ch4, ch5, ch6). */
function firstFloor(s:Sheet,light:number){room(s,-IW,F1T,2*IW,FTOP-F1T,light,83);wall(s,-HW,F1T,WT,FTOP-F1T,54);wall(s,HW-WT,F1T,WT,FTOP-F1T,55);door(s,DOORX,FTOP,100,190,57);win(s,W1X,W1Y,110,110,58,light);slab(s,-HW+20,S1,2*HW-40,40,61);}

// ---------------- chapters ----------------
/** 1 — the site: the kid and the ball arrive on the hill; a plan draws itself; the ground opens; the basement stamps in; the kid taps the ball and the basement lights. */
const ch1:Scene={
 draw(s,t){
  const tt=twos(t),nudge=t>=6.51&&t<7.5?shake(t,11,3)*(1-sm(6.51,7.5,t)):0;
  const v=cam(s,t,[[0,-60,-20,.76],[2.39,-60,-20,.76],[3.3,0,-40,.78],[4.56,0,-40,.78],[5.6,0,420,1],[6.51,0,440,1.05],[7.4,0,470,1.25],[8.25,0,470,1.25],[9.4,-20,480,1.42],[10.55,-20,480,1.45],[11.2,-20,480,1.46]]);
  s.camera(v[0]+nudge,v[1],v[2],v[3]);
  // the hillside; the turf bulges, then the cut opens on "below the surface"
  const bulge=12*sm(4.56,4.8,t)*(1-sm(4.8,5.1,t)),open=sm(4.8,5.4,t,easeOut),shiver=t>=6.3&&t<6.51?shake(t,12,4):0;
  terrain(s,11,{bulge,bulgeX:-60});
  if(open>0){const w=HW*open;s.knockout(polyPath(torn(-w+shiver,GROUND,2*w,BBOT-GROUND,13,8,50),true));
   const light=key(t,[[8.25,.05],[8.5,.15],[8.8,.3],[9.2,.45]]);room(s,-IW,GROUND,2*IW,BFLOOR-GROUND,light,14);}
  // the basement stamps in: left wall, floor, right wall
  stamped(s,t,6.51,-HW+WT/2,(GROUND+BBOT)/2,()=>wall(s,-HW,GROUND,WT,BBOT-GROUND,15));
  stamped(s,t,6.75,0,BFLOOR+20,()=>wall(s,-IW,BFLOOR,2*IW,40,16));
  stamped(s,t,6.99,HW-WT/2,(GROUND+BBOT)/2,()=>wall(s,HW-WT,GROUND,WT,BBOT-GROUND,17));
  puff(s,-IW,BFLOOR,tt-6.51,18,{n:8,cloud:70,up:120});puff(s,0,BFLOOR,tt-6.75,19,{n:8,cloud:90,up:120,spread:1.4});puff(s,IW,BFLOOR,tt-6.99,20,{n:8,cloud:70,up:120});
  // the plan of the house draws itself on "building a house", overshoots and settles
  const planU=sm(2.39,3.3,t,easeOut),plan:Pt[]=[[-HW,GROUND],[-HW,S2],[-EAVE,S2],[0,APEX],[EAVE,S2],[HW,S2],[HW,GROUND]];
  if(planU>0){const sc=1+.03*sm(2.39,3.3,t)+settle(t,3.3,{amp:.03,freq:4,decay:5});s.save();s.translate(0,GROUND);s.scale(sc,sc);s.translate(0,-GROUND);dashed(s,K,plan,12,21,{u:planU,cov:.85});
   if(planU<1){const line=partial(smoothPts(plan,false,10,1.2),planU),tip=line[line.length-1];sparkBurst(s,Y,tip[0],tip[1],70,{n:7,seed:22,g:.6+.4*hash(twosIndex(t),23)});}s.restore();}
  // the kid walks in with the ball, hops down into the cut, lands with a squash, then taps the ball foot to foot
  const walk=sm(.1,1.1,t,easeIO),fx=lerp(-560,-60,walk)+settle(t,1.1,{amp:8,freq:5,decay:6});
  const hop=t<4.9?0:sm(4.9,5.4,t,easeIn),fy=hop>0?arc([-60,GROUND],[-60,BFLOOR],hop,70)[1]:GROUND;
  const land=t>=5.4?settle(t,5.4,{amp:.14,freq:5,decay:6,phase:Math.PI/2}):0;
  const tapN=t<8.25?-1:Math.floor((t-8.25)/.5),phase=t<8.25?0:(t-8.25)%.5;
  const tapFace:1|-1=tapN%2===0?1:-1,kickK=tapN>=0&&phase<.18?1-phase/.18:0;
  const pose:Pose=walk<1?walkPose(t,true):t>=4.7&&t<4.9?'crouch':hop>0&&hop<1?'step':t>=5.4&&t<5.9?'crouch':kickK>0?'kick':'stand';
  const pk=pose==='crouch'?(t<4.9?sm(4.7,4.9,t):clamp(Math.abs(land)*4)):pose==='kick'?kickK:1;
  s.save();if(land!==0){s.translate(-60,fy);s.scale(1+land*.5,1-land*.5);s.translate(60,-fy);}
  figure(s,fx,fy,240,pose,{ink:Y,seed:24,face:tapN>=0?tapFace:1,k:pk,shade:O});s.restore();
  if(t>=5.4)puff(s,-60,BFLOOR,tt-5.4,25,{n:6,cloud:60,up:100});
  // the ball: rolls in ahead, drops after the kid and bounces twice, then is tapped between the feet with sparks
  let bx=lerp(-600,20,sm(0,1,t,easeOut))+settle(t,1,{amp:6,freq:5,decay:6}),by=GROUND-44,sq=0;
  if(t>=5.1){by=lerp(GROUND-44,BFLOOR-44,sm(5.1,5.5,t,easeIn));
   if(t>=5.5&&t<5.8)by=arc([20,BFLOOR-44],[20,BFLOOR-44],sm(5.5,5.8,t,linear),90)[1];else if(t>=5.8&&t<6)by=arc([20,BFLOOR-44],[20,BFLOOR-44],sm(5.8,6,t,linear),36)[1];
   if(t>=5.5&&t<5.6)sq=.12*(1-(t-5.5)/.1);}
  if(tapN>=0){const from=tapN%2===0?-130:10,to=tapN%2===0?10:-130;bx=lerp(from,to,sm(0,.26,phase,easeOut));if(phase<.1)sq=.16*(1-phase/.1);
   sparkBurst(s,Y,from,BFLOOR-44,50,{n:6,seed:26+tapN,g:sm(0,.2,phase,easeOut)*(1-sm(.2,.45,phase))});}
  ball(s,bx,by+sq*44,44,{rot:bx*.014,sx:1+sq,sy:1-sq,seed:27});
 },
 aperture(){return apertureDisc(0,720,60,12);},
};
/** 2 — inside the soil at the foundation line: bricks fly from a pile and stamp into the courses; every football action lays a brick;
 * a brick pulled out cracks and rocks the ghost floor above; stamped back, everything settles. */
const foundationGap=()=>{const lay=brickLayout(-HW,FTOP,2*HW,80);let g=lay[0];for(const b of lay)if(b.row===1&&Math.abs(b.cx-150)<Math.abs(g.cx-150))g=b;return{lay,gap:g};};
const ch2:Scene={
 draw(s,t){
  const tt=twos(t),quake=t>=13.22&&t<14.5?shake(t,31,4)*(1-sm(13.22,14.5,t)):0;
  const v=cam(s,t,[[0,0,470,1],[3.3,0,470,1],[4,0,420,1.02],[5.08,0,420,1.02],[5.6,60,450,1.06],[7.1,80,450,1.08],[8.9,0,440,1.1],[10.93,0,330,1.1],[11.6,0,280,1.12],[13.22,0,280,1.12],[14.95,0,280,1.14],[15.6,0,280,1.14]]);
  s.camera(v[0]+quake,v[1]+quake*.5,v[2],v[3]);
  terrain(s,11);
  houseKnock(s,FTOP-10,BBOT,32);
  const light=key(t,[[0,.2],[8.9,.2],[9.1,.32],[9.4,.45]]);room(s,-IW,GROUND,2*IW,BFLOOR-GROUND,light,33);
  wall(s,-HW,GROUND,WT,BBOT-GROUND,15);wall(s,HW-WT,GROUND,WT,BBOT-GROUND,17);wall(s,-IW,BFLOOR,2*IW,40,16);
  // the foundation: two courses; bottom course 3.3 → 4.5, second course laid by the football actions
  const {lay,gap}=foundationGap(),n0=lay.filter(b=>b.row===0).length,second=[5.75,7.2,7.9,8.3,8.7,9.1,9.3,9.5,9.7,9.9,10.1,10.3];
  const landAt=(b:Brick)=>b.row===0?3.3+b.i*.12:second[Math.min(second.length-1,b.i-n0)]+Math.max(0,b.i-n0-second.length+1)*.15;
  const unstable=sm(13.22,13.3,t)*(1-sm(14.4,14.6,t)),pile:Pt=[-210,BFLOOR-90],base=stampMod(t,landAt,pile,.3);
  wall(s,-HW,FTOP,2*HW,80,34,{mod:b=>{if(b.i===gap.i&&t>=11.6&&t<14.5)return null;const m=base(b);if(!m)return null;if(unstable>0&&Math.abs(b.cx-gap.cx)<300){m[0]+=(hash(twosIndex(t)*7+b.i,35)-.5)*12*unstable;m[1]+=(hash(twosIndex(t)*3+b.i,36)-.5)*8*unstable;}if(b.i===gap.i&&t>=14.5)m[2]*=lerp(1.32,1,easeOutBack(clamp((t-14.5)/.22)));return m;}});
  for(const b of lay){const at=landAt(b);if(t>=at&&t<at+.6&&!(b.i===gap.i&&t>=11.6))puff(s,b.cx,b.cy+12,tt-at,40+b.i,{n:5,size:7,up:90,life:.4,spread:.8});}
  if(t>=14.5)puff(s,gap.cx,gap.cy,tt-14.5,37,{n:9,cloud:80,up:130,spread:1.2});
  // the pile shrinks as bricks leave it
  const launched=lay.filter(b=>t>=landAt(b)-.3).length,left=Math.max(0,lay.length-launched);
  if(left>0){const pp=new Path2D();for(let i=0;i<left;i++){const r=Math.floor(i/5),c=i%5,px=-400+c*76+(r%2?38:0)+(hash(i,38)-.5)*4,py=BFLOOR-14-r*32;pp.rect(px,py-28,70,28);}s.fill(O,pp,.96);}
  // the fallen brick: pops out at 11.6, drops, bounces; jumps back at 14.2 and stamps at 14.5
  if(t>=11.6&&t<14.5){let bx=gap.cx,by=gap.cy,rot=0,sc=1,sqz=0;
   if(t<11.8){const u=sm(11.6,11.8,t,easeOut);sc=1+.15*u;by-=14*u;}
   else if(t<12.3){const u=(t-11.8)/.5;by=lerp(gap.cy-14,BFLOOR-20,u*u);rot=u*2.2;}
   else if(t<12.6){const u=sm(12.3,12.6,t,linear);by=arc([gap.cx,BFLOOR-20],[gap.cx+30,BFLOOR-20],u,50)[1];bx=gap.cx+30*u;rot=2.2+(t-12.3)*1.5;}
   else if(t<14.2){bx=gap.cx+30;by=BFLOOR-20;rot=2.65;sqz=t>=14.05?sm(14.05,14.2,t):0;}
   else{const u=sm(14.2,14.5,t,easeIO),p=arc([gap.cx+30,BFLOOR-20],[gap.cx,gap.cy],u,60);bx=p[0];by=p[1];rot=lerp(2.65,TAU,u);}
   s.save();if(sqz>0){s.translate(bx,BFLOOR);s.scale(1+sqz*.25,1-sqz*.25);s.translate(-bx,-BFLOOR);}brick(s,bx,by,gap.w*sc,gap.h*sc,rot,39);s.restore();
   if(t>=12.3)puff(s,gap.cx,BFLOOR-4,tt-12.3,41,{n:6,size:7,up:90,life:.4});}
  // the ghost first floor above: draws on, rocks when unstable, settles when the brick is back
  const ghostU=sm(10.93,11.5,t,easeOut);
  if(ghostU>0){const rock=t<13.22?0:t<14.5?.06*Math.sin(TAU*1.8*(t-13.22))*Math.exp(-.9*(t-13.22)):settle(t,14.5,{amp:.03,freq:3,decay:4});
   s.save();s.translate(0,FTOP);s.rotate(rock);s.translate(0,-FTOP);dashed(s,K,[[-HW,FTOP],[-HW,F1T],[HW,F1T],[HW,FTOP]],11,42,{u:ghostU,cov:.8});s.restore();}
  cracks(s,gap.cx,gap.cy,sm(13.22,13.7,t,easeOut),43,1-sm(14.5,14.95,t));
  if(t>=13.22)puff(s,gap.cx-40,FTOP+60,tt-13.22,44,{n:8,size:6,up:20,life:.9,ink:O,spread:.6});
  // the kid grows (two pops), flicks the ball up and cushions it, passes against the wall, dribbles, rests a foot on the ball
  const h=key(t,[[1.2,240],[1.2+2/12,230,easeOutBack],[1.55,254],[2.4,254],[2.4+2/12,245,easeOutBack],[2.75,266],[8.9,266],[9.1,258,easeOutBack],[9.45,278]]);
  const dribble=sm(7.4,8.5,t,easeIO),fx=lerp(170,-40,dribble),moving=dribble>0&&dribble<1,face:1|-1=t<7.4?1:-1;
  const flick=t>=5.08&&t<5.3?sm(5.08,5.14,t)*(1-sm(5.2,5.3,t)):0,cushion=t>=5.4&&t<5.8?sm(5.4,5.5,t)*(1-sm(5.65,5.8,t)):0;
  const kick=t>=6.2&&t<6.55?(t<6.32?-.3*sm(6.2,6.32,t):1-sm(6.4,6.55,t)):0,restK=sm(8.9,9.2,t,easeOutBack);
  const pose:Pose=moving?walkPose(t,true):flick>0||cushion>0||kick!==0?'kick':restK>0?'rest':'stand';
  const pk=pose==='kick'?(flick>0?flick*.5:cushion>0?cushion*.7:Math.max(0,kick)):pose==='rest'?restK:1;
  figure(s,fx,BFLOOR,h,pose,{ink:Y,seed:45,face,k:pk,shade:O,tilt:kick<0?.08:0});
  // the ball
  let bx=fx+70,by=BFLOOR-44,sq=0;
  if(t>=5.08&&t<5.5)by=arc([bx,BFLOOR-44],[bx,BFLOOR-44],sm(5.08,5.5,t,linear),150)[1];
  else if(t>=5.5&&t<5.7)sq=.14*(1-sm(5.5,5.7,t));
  else if(t>=6.32&&t<7.1){const out=sm(6.32,6.7,t,easeOut),back=sm(6.7,7.1,t,easeOut);bx=t<6.7?lerp(fx+70,IW-44,out):lerp(IW-44,fx+70,back);if(t>=6.7&&t<6.85)sq=.16*(1-(t-6.7)/.15);}
  else if(t>=7.1&&t<7.4)bx=fx+70+settle(t,7.1,{amp:12,freq:5,decay:6});
  else if(t>=7.4&&t<8.9){bx=fx-70;sq=moving?.06*(twosIndex(t)%2):0;}
  else if(t>=8.9){bx=fx-60;by=BFLOOR-40;}
  if(t>=6.7&&t<7.2)puff(s,IW,BFLOOR-60,tt-6.7,46,{n:6,size:7,up:80,life:.4});
  if(t>=6.32&&t<6.72)speedLines(s,K,bx,by,0,{n:4,seed:47,len:120,spread:20,width:5,cov:.7});
  ball(s,bx,by+sq*44,44,{rot:bx*.014,sx:1+sq,sy:1-sq,seed:27});
 },
 aperture(){const {gap}=foundationGap();return apertureDisc(gap.cx,gap.cy,15,8);},
};
/** 3 — the first floor at ground level: walls rise; the teen walks in and broadens; grows twice with height marks; sprints, lifts the beam into the ceiling; kicks the ball into the wall. */
const ch3:Scene={
 draw(s,t){
  const tt=twos(t),thump=t>=10&&t<10.3?shake(t,51,4):0;
  const v=cam(s,t,[[0,0,200,1],[1.6,0,120,1.05],[2.21,0,120,1.05],[3.2,-40,100,1.15],[4.2,-40,100,1.15],[6,-40,80,1.25],[6.85,-40,80,1.25],[7.5,120,80,1.3],[7.9,60,80,1.3],[8.9,60,60,1.35],[9.28,60,60,1.35],[9.9,220,60,1.45],[11,200,60,1.5],[11.85,200,60,1.55],[12.5,200,60,1.56]]);
  s.camera(v[0]+thump,v[1],v[2],v[3]);
  terrain(s,11);
  houseKnock(s,S1-10,BBOT,52);
  room(s,-IW,GROUND,2*IW,BFLOOR-GROUND,.2,33);wall(s,-HW,GROUND,WT,BBOT-GROUND,15);wall(s,HW-WT,GROUND,WT,BBOT-GROUND,17);wall(s,-IW,BFLOOR,2*IW,40,16);
  wall(s,-HW,FTOP,2*HW,80,34);
  // the first floor: courses stamp upward; the plaster back wall grows with them
  const riseU=sm(.15,1.55,t,linear),wallTop=lerp(FTOP,F1T,riseU);
  if(riseU>0)s.tone(Y,polyPath(torn(-IW,wallTop,2*IW,FTOP-wallTop,53,4,60),true),.35);
  const courseMod:Mod=b=>{const at=.15+b.row*.17;if(t<at)return null;return[0,0,lerp(1.3,1,easeOutBack(clamp((t-at)/.22)))];};
  wall(s,-HW,F1T,WT,FTOP-F1T,54,{mod:courseMod});wall(s,HW-WT,F1T,WT,FTOP-F1T,55,{mod:courseMod});
  for(let r=0;r<9;r++){const at=.15+r*.17;if(t>=at&&t<at+.5){puff(s,-HW+WT/2,FTOP-r*40-20,tt-at,56+r,{n:4,size:6,up:60,life:.35});puff(s,HW-WT/2,FTOP-r*40-20,tt-at,66+r,{n:4,size:6,up:60,life:.35});}}
  if(riseU>=1){door(s,DOORX,FTOP,100,190,57);win(s,W1X,W1Y,110,110,58,.45);}
  // height marks on the left wall after each growth pop
  const h=key(t,[[4.4,290],[4.4+2/12,282,easeOutBack],[4.75,305],[5.3,305],[5.3+2/12,297,easeOutBack],[5.65,320]]);
  if(t>=4.75)heightMark(s,-IW+4,FTOP-311,59);if(t>=5.65)heightMark(s,-IW+4,FTOP-326,60);
  // the beam: lies on the floor, is lifted overhead, pushed into the ceiling, locks with a stamp
  const beamY=key(t,[[7.95,FTOP-16,easeOut],[8.6,F1T+110,easeOut],[8.9,S1+20]]),locked=t>=8.9,beamX=locked?0:lerp(60,0,sm(7.95,8.9,t)),lifting=t>=7.95&&!locked;
  const beamW=2*HW-40,bsc=locked?lerp(1.12,1,easeOutBack(clamp((t-8.9)/.22))):1;
  const drawBeam=()=>{s.fill(O,polyPath(torn(beamX-beamW/2,beamY-20,beamW,40,61,4,60),true),.96);contour(s,K,[[beamX-beamW/2,beamY-20],[beamX+beamW/2,beamY-20]],7,{seed:61,wobble:1,taper:.1,step:60});};
  if(!locked&&!lifting)drawBeam();
  // the teen: steps out of the doorway (clipped to the arch, growing as it comes forward), walks in, broadens, grows, sprints, lifts, kicks
  const emerge=sm(2.21,2.55,t,easeOut),enter=sm(2.55,3.1,t,easeIO),run=t<6.85?0:anticipate(6.85,7.4,t,{back:.15,hold:.3,e:easeOut}),over=settle(t,7.4,{amp:34,freq:3,decay:5});
  if(t<2.21)return;
  const fx=t<6.85?lerp(DOORX,-40,enter):lerp(-40,200,clamp(run))+over,inDoor=emerge<1;
  const hScale=inDoor?lerp(.72,1,emerge):1;
  const wide=key(t,[[3.1,1],[3.2,.95,easeOutBack],[3.52,1.35]])+settle(t,3.52,{amp:.06,freq:4,decay:5});
  const moving=enter>0&&enter<1,sprint=run>0&&run<1;
  if(inDoor){s.save();s.clip(doorPath(DOORX,FTOP,100,190));}
  const liftK=t>=7.7&&t<7.95?sm(7.7,7.95,t):0,kick=t>=9.6&&t<9.95?(t<9.72?-.3*sm(9.6,9.72,t):1-sm(9.8,9.95,t)):0;
  const face:1|-1=t>=9.28&&t<9.66?-1:1;
  const pose:Pose=moving?walkPose(t,true):sprint?'run':liftK>0?'crouch':lifting?'lift':kick!==0?'kick':t>=8.9&&t<9.2?'up':'stand';
  const pk=pose==='crouch'?liftK*.8:pose==='kick'?Math.max(0,kick):pose==='up'?1-sm(8.9,9.2,t):pose==='run'?clamp(run)+.2:1;
  if(lifting)drawBeam();
  if(sprint&&tt>=7.1&&tt<7.4){for(let k=1;k<=2;k++)figure(s,fx-70*k,FTOP,h,'run',{seed:62,afterimage:.35});speedLines(s,K,fx-40,FTOP-h*.5,0,{n:5,seed:63,len:220,spread:70,width:8});}
  figure(s,fx,FTOP,h*hScale,pose,{ink:Y,seed:62,face,k:pk,shade:O,wide,reach:lifting?[fx+60,beamY+22]:undefined,reachB:lifting?[fx-60,beamY+22]:undefined,tilt:kick<0?.08:0});
  if(inDoor)s.restore();
  if(locked){s.save();s.translate(0,S1);s.scale(bsc,bsc);s.translate(0,-S1);drawBeam();s.restore();puff(s,-HW+40,S1+30,tt-8.9,64,{n:7,cloud:70,up:100});puff(s,HW-40,S1+30,tt-8.9,65,{n:7,cloud:70,up:100});}
  // the ball: rolls in from the left, is struck into the right wall (thump, rebound), rolls back to the feet
  if(t>=9.28){let bx=fx-70,by=FTOP-44,sq=0;
   if(t<9.72)bx=lerp(-560,fx-70,sm(9.28,9.62,t,easeOut));
   else if(t<10){bx=lerp(fx-70,IW-44,sm(9.72,10,t,easeOut));speedLines(s,K,bx,by,0,{n:5,seed:75,len:200,spread:30,width:6,cov:.8});}
   else if(t<10.9){bx=lerp(IW-44,fx+70,sm(10,10.9,t,easeOut));if(t<10.15)sq=.2*(1-(t-10)/.15);}
   else bx=fx+70+settle(t,10.9,{amp:10,freq:5,decay:6});
   ball(s,bx,by+sq*44,44,{rot:bx*.014,sx:1+sq,sy:1-sq,seed:27});
   if(t>=10)puff(s,IW,FTOP-70,tt-10,76,{n:9,cloud:60,up:120,spread:1.2});}
 },
 aperture(){return apertureDisc(W1X+55,W1Y+55,42,10);},
};
/** 4 — inside the second floor: the room rises; the window frame stamps; the shutters open on a pitch; the opponent presses the teammate;
 * the player steps through the window into space and the pass connects with an orange × yellow band. */
const ch4:Scene={
 draw(s,t){
  const tt=twos(t),nudge=t>=2.5&&t<2.8?shake(t,81,3):0;
  const v=cam(s,t,[[0,0,-230,1],[1.6,0,-300,1.05],[2.28,0,-300,1.05],[3,0,-310,1.1],[3.94,0,-310,1.1],[4.8,0,-315,1.3],[5.6,0,-315,1.3],[6.3,20,-320,1.6],[7.47,20,-320,1.6],[8.3,60,-330,1.7],[10.38,40,-330,1.7],[11.2,20,-325,1.8],[12.15,20,-325,1.85],[12.8,20,-325,1.86]]);
  s.camera(v[0]+nudge,v[1],v[2],v[3]);
  terrain(s,11,{soil:false});
  const riseU=sm(.2,1.3,t,linear),top=lerp(S1,F2T,riseU);
  houseKnock(s,S2-10,BBOT,82);
  firstFloor(s,.32);
  // the second floor: plaster back wall grows, courses stamp, the ceiling slab lands
  if(riseU>0)s.tone(Y,polyPath(torn(-IW,top,2*IW,S1-top,84,4,60),true),.38);
  const courseMod:Mod=b=>{const at=.2+b.row*.14;if(t<at)return null;return[0,0,lerp(1.3,1,easeOutBack(clamp((t-at)/.22)))];};
  wall(s,-HW,F2T,WT,S1-F2T,85,{mod:courseMod});wall(s,HW-WT,F2T,WT,S1-F2T,86,{mod:courseMod});
  stamped(s,t,1.5,0,S2+20,()=>slab(s,-HW,S2,2*HW,40,87));
  if(t>=1.5)for(const x of [-HW+40,HW-40])puff(s,x,S2+40,tt-1.5,88+(x>0?1:0),{n:6,cloud:60,up:90});
  // you: turn to the wall, look through the window with a paper sight wedge, then step through it onto the pitch (shrinking as you go far)
  const go=t<7.47?0:anticipate(7.47,8.4,t,{back:.06,hold:.18,e:easeIO}),g=clamp(go),youX=lerp(-260,120,g)+settle(t,8.4,{amp:14,freq:4,decay:5}),youY=lerp(S1,WY+WH*.85,g),youH=lerp(300,130,g);
  const inside=youY<=WY+WH-2,cushion=t>=11.05&&t<11.5?sm(11.05,11.2,t)*(1-sm(11.35,11.5,t)):0;
  const drawYou=()=>{if(g<=0){const turn=t<2.28?0:anticipate(2.28,2.6,t,{back:.2,hold:.3}),sight=sm(3.94,4.2,t)*(1-sm(7.47,7.6,t)),lean=t>=7.47?.12*sm(7.47,7.6,t):0;
    figure(s,-260,S1,300,turn>0?'listen':'stand',{ink:Y,seed:95,face:1,look:.5*clamp(turn),k:clamp(turn),sight,shade:O,tilt:lean-.2*Math.max(0,-turn)});}
   else figure(s,youX,youY,youH,go>0&&go<1?walkPose(t,true):cushion>0?'crouch':'stand',{ink:Y,seed:95,face:1,k:cushion>0?cushion*.7:1,shade:O});};
  // the window: frame stamps at 2.5; shutters twitch then open on "read the game"; the pitch behind
  const frameAt=2.5,open=t<3.94?0:t<4.1?-.04*sm(3.94,4.1,t):sm(4.1,4.7,t,easeIO),breathe=1+.03*sm(8.92,9.6,t,easeOut);
  if(t>=frameAt){const fsc=lerp(1.2,1,easeOutBack(clamp((t-frameAt)/.24)))*breathe;s.save();s.translate(WX+WW/2,WY+WH/2);s.scale(fsc,fsc);s.translate(-WX-WW/2,-WY-WH/2);
   s.save();s.clip(rectPath(WX,WY,WW,WH));
   if(open>.02){pitch(s,90);
    const tmX=-130,tmY=WY+WH*.78,tapK=t>=5.6&&t<5.9?sm(5.6,5.7,t)*(1-sm(5.8,5.9,t)):0,passK=t>=10.3&&t<10.7?(t<10.45?-.3*sm(10.3,10.45,t):1-sm(10.5,10.7,t)):0;
    const closeU=sm(5.7,6.3,t,easeOut),awayU=sm(9,9.5,t,easeOut),oppX=lerp(lerp(60,-40,closeU),-100,awayU),oppY=lerp(lerp(WY+WH*.45,WY+WH*.62,closeU),WY+WH*.4,awayU)+settle(t,6.3,{amp:4,freq:5,decay:5});
    dashed(s,'paper',[[-190,WY+WH*.92],[-40,WY+WH*.9],[120,WY+WH*.85]],9,91,{u:sm(7.5,8.2,t,easeOut),dash:30,gap:18,cov:.9});
    const spaceU=sm(8.92,9.4,t,easeOutBack);if(spaceU>0)s.knockout(ring(youX,youY-30,60*spaceU,86*spaceU),.7);
    const flight=sm(10.45,11.15,t,easeOut),bandU=sm(10.45,11.15,t,linear);
    if(bandU>0){const a:Pt=[tmX+40,tmY-14],b:Pt=[youX-24,youY-14],e:Pt=[lerp(a[0],b[0],bandU),lerp(a[1],b[1],bandU)],rb=ribbon([a,e],46,{seed:92,wobble:1.2,taper:.2,pressure:.2,step:20});s.knockout(rb);s.fill(Y,rb,.75);s.fill(O,rb,.75);}
    figure(s,oppX,oppY,130,closeU>0&&closeU<1?walkPose(t,true):'stand',{ink:K,seed:93,face:-1,cov:.85});
    figure(s,tmX,tmY,120,tapK>0||passK!==0?'kick':'stand',{ink:O,seed:94,face:1,k:tapK>0?tapK:Math.max(0,passK),shade:K,tilt:passK<0?.08:0});
    if(g>0&&inside)drawYou();
    let bx=tmX+40,by=tmY-22,sq=0;if(tapK>0){bx+=18*tapK;sq=.12*tapK;}
    if(t>=10.45){const p=arc([tmX+40,tmY-22],[youX-24,youY-22],flight,26);bx=p[0];by=p[1];if(t>=11.15&&t<11.3)sq=.16*(1-(t-11.15)/.15);}
    ball(s,bx,by+sq*22,22,{rot:bx*.03,sx:1+sq,sy:1-sq,seed:96});
    if(t>=11.15)sparkBurst(s,Y,youX-24,youY-30,60,{n:7,seed:97,g:sm(11.15,11.45,t,easeOut)*(1-sm(11.5,11.9,t))});}
   s.restore();
   bigWindow(s,98,clamp(open),.5);s.restore();
   if(t<frameAt+.5)for(const x of [WX,WX+WW])puff(s,x,WY+WH/2,tt-frameAt,99+(x>WX?1:0),{n:6,cloud:50,up:80});}
  if(g<=0||!inside)drawYou();
 },
 aperture(){return apertureDisc(0,WY+WH*.8-14,17,8);},
};
/** 5 — the roof at night: the older teen's last growth under the open sky; rafters swing up and tiles stamp; the roof glows (desire); the chest glow pulses;
 * the disco flashes far left and the figure looks, then turns away; the Saturday sun rises on the right and the night thins. */
const ch5:Scene={
 draw(s,t){
  const tt=twos(t),ridge=t>=3.7&&t<4?shake(t,101,4)*(1-sm(3.7,4,t)):0;
  const v=cam(s,t,[[0,0,-470,1],[2.91,0,-470,1],[3.6,0,-560,1.05],[4.7,0,-580,1.1],[6.72,0,-580,1.1],[7.6,0,-590,1.2],[9.18,0,-590,1.2],[10,-420,-590,1.2],[10.9,-420,-590,1.2],[11.7,60,-590,1.25],[12.09,60,-590,1.25],[13.2,200,-620,1.3],[14.25,200,-620,1.32],[14.9,200,-620,1.33]]);
  s.camera(v[0]+ridge,v[1],v[2],v[3]);
  // night: the yellow sky under a navy field that thins in steps as the sun rises; paper stars; a distant hill left
  const night=key(t,[[12.09,.88],[12.6,.6],[13.1,.45],[13.7,.32]]);
  s.field(Y,.12,.4);s.field(K,night,.4);
  if(t<12.8)confetti(s,['paper'],[-1500,-1700,3000,1100],26,102,{size:14});
  s.fill(G,polyPath([[-3000,-410],[-1600,-490],[-900,-640],[-500,-550],[-200,-420],[-200,900],[-3000,900]],true),.88);
  // the disco far off on the hill: flashes on "miss the disco", dims once the player turns away
  const discoOn=t<9.18?0:t<10.9?1:1-sm(10.9,11.7,t);s.save();s.translate(-720,-640);s.scale(1.35,1.35);disco(s,0,0,t,discoOn,103);s.restore();
  // the Saturday sun rises behind the right slope
  const sunU=sm(12.09,13.3,t,easeOut);if(sunU>0){const sy=lerp(-470,-800,sunU);s.knockout(circlePath(470,sy,150));glowDisc(s,Y,470,sy,105,{steps:3,glow:.7,seed:104});}
  // the house top: foundation, first and second floors, the lit window, the ceiling slab, then the roof
  const tiles=sm(3.8,4.6,t,linear);
  houseKnock(s,S2-10,GROUND,105,{roof:tiles});
  wall(s,-HW,FTOP,2*HW,80,34);firstFloor(s,.32);
  s.tone(Y,polyPath(torn(-IW,F2T,2*IW,S1-F2T,84,4,60),true),.38);wall(s,-HW,F2T,WT,S1-F2T,85);wall(s,HW-WT,F2T,WT,S1-F2T,86);
  bigWindow(s,98,0,key(t,[[4.7,.45],[5,.6]]));
  slab(s,-HW,S2,2*HW,40,87);
  // the figure under the open sky: broadens (the last growth), arms up on desire, chest glow pulses, looks at the disco and turns away, faces the sun
  const wide=key(t,[[.4,1],[.4+2/12,.95,easeOutBack],[.75,1.18]]);
  const upK=sm(4.9,5.3,t,easeOutBack)*(1-sm(6.4,6.72,t)),pulse=[6.72,7.3,7.9].reduce((a,at)=>Math.max(a,t<at?0:easeOutBack(sm(at,at+.25,t,linear))*(1-.35*sm(at+.25,at+.55,t))),0);
  const lean=[6.72,7.3,7.9].reduce((a,at)=>a+.05*sm(at,at+.25,t),0),chest=t<6.72?0:.5+.5*pulse;
  const look=t<9.18?0:t<10.9?-.7*sm(9.18,9.5,t):-.7*(1-anticipate(10.9,11.4,t,{back:.15,hold:.3}));
  const sunUp=sm(13,13.4,t,easeOutBack);
  const pose:Pose=upK>0?'up':sunUp>0?'up':t>=6.72?'lean':'stand';
  const pk=pose==='up'?(upK>0?upK:sunUp):pose==='lean'?lean/.15*.4:1;
  figure(s,0,S2,284,pose,{ink:Y,seed:108,face:1,k:pk,look,shade:O,wide,glow:chest>0?chest*1.1:0});
  // rafters: dip then swing up to meet at the apex with a stamp; tile rows stamp up the slopes; the roof glows on "desire"
  const raft=t<3.1?0:easeOutBack(sm(3.1,3.7,t,linear)),dip=t<2.91?-.02:.1*sm(2.91,3.1,t);
  const glow=key(t,[[4.7,0],[4.9,.2],[5.1,.32],[5.4,.45]]);
  roof(s,106,{rafters:clamp(raft,0,1.04),tiles,glow,dip});
  if(t>=3.7)puff(s,0,APEX+20,tt-3.7,107,{n:9,cloud:80,up:140,spread:1.3});
  for(let k=1;k<=7;k++){const at=3.8+.8*(k-.5)/7;if(t>=at&&t<at+.4){const y=S2-(S2-APEX)*k/7+20,w=EAVE*(1-k/7);puff(s,-w-10,y,tt-at,110+k,{n:3,size:6,up:50,life:.3});puff(s,w+10,y,tt-at,120+k,{n:3,size:6,up:50,life:.3});}}
 },
 aperture(){return apertureDisc(262,-618,34,10);},
};
/** 6 — the whole house on the hill: the finished player at the door; the facade swings open to the cutaway; the camera climbs floor by floor
 * as each sentence names it; the ridge tie locks the roof and every level lights. */
const ch6:Scene={
 draw(s,t){
  const tt=twos(t),lock=t>=13.8&&t<14.1?shake(t,131,3)*(1-sm(13.8,14.1,t)):0;
  const v=cam(s,t,[[0,0,-80,.55],[2.77,0,-80,.55],[3.8,0,0,.58],[6,0,330,.62],[8.31,0,330,.62],[8.9,0,70,.66],[10.61,0,70,.66],[11.2,0,-300,.7],[13.15,0,-300,.7],[13.8,0,-520,.74],[15.2,0,-380,.76],[16.5,0,-380,.76]]);
  s.camera(v[0]+lock,v[1],v[2],v[3]);
  terrain(s,11);
  // the whole house squash-settles as one when the tie locks
  const sq=t>=13.8?settle(t,13.8,{amp:.03,freq:4,decay:4,phase:Math.PI/2}):0;
  s.save();s.translate(0,BBOT);s.scale(1+sq*.6,1-sq);s.translate(0,-BBOT);
  const cascade=(at:number)=>key(t,[[at,0],[at+.15,.32],[at+.3,.45],[at+.45,.6]]);
  const lB=Math.max(key(t,[[6,.15],[6.2,.32],[6.5,.45]]),cascade(14.8)),l1=Math.max(.3,cascade(14.5)),l2=Math.max(.32,cascade(14.2)),lR=Math.max(.2,cascade(13.9));
  houseKnock(s,S2-10,BBOT,132,{roof:1});
  // basement + foundation (technique): the light steps up, the courses pulse, the kid's ball still there taps between the walls
  room(s,-IW,GROUND,2*IW,BFLOOR-GROUND,lB,33);wall(s,-HW,GROUND,WT,BBOT-GROUND,15);wall(s,HW-WT,GROUND,WT,BBOT-GROUND,17);wall(s,-IW,BFLOOR,2*IW,40,16);
  const pulseF=t>=6.3&&t<6.9?twosIndex(t)%2:0;wall(s,-HW,FTOP,2*HW,80,34,{cov:pulseF?.75:.96,alt:pulseF?.96:.75});
  {let bx=-60,sqb=0;if(t>=6.2&&t<7.6){const n=Math.floor((t-6.2)/.35),ph=(t-6.2)%.35,from=n%2?60:-180,to=n%2?-180:60;bx=lerp(from,to,sm(0,.22,ph,easeOut));if(ph<.08)sqb=.14*(1-ph/.08);}else if(t>=7.6)bx=-180;
   if(t>=15.6&&t<16)sqb=.1*(1-sm(15.6,16,t));ball(s,bx,BFLOOR-40+sqb*40,40,{rot:bx*.014,sx:1+sqb,sy:1-sqb,seed:27});}
  // first floor (structure): beam pops and a run streak flashes across the room
  room(s,-IW,F1T,2*IW,FTOP-F1T,l1,83);wall(s,-HW,F1T,WT,FTOP-F1T,54);wall(s,HW-WT,F1T,WT,FTOP-F1T,55);door(s,DOORX,FTOP,100,190,57);win(s,W1X,W1Y,110,110,58,l1);
  const bsc=t>=8.31?lerp(1.15,1,easeOutBack(clamp((t-8.31)/.25))):1;s.save();s.translate(0,S1+20);s.scale(bsc,bsc);s.translate(0,-S1-20);slab(s,-HW+20,S1,2*HW-40,40,61);s.restore();
  if(t>=8.5&&t<9.2){const u=sm(8.5,9.2,t,linear);speedLines(s,K,lerp(-300,380,u),FTOP-150,0,{n:6,seed:133,len:260,spread:70,width:9,cov:1-sm(9,9.2,t)});}
  if(t>=8.31)for(const x of [-HW+40,HW-40])puff(s,x,S1+30,tt-8.31,134+(x>0?1:0),{n:5,cloud:50,up:80,life:.4});
  // second floor (purpose): the shutters open and the pass band draws inside the window
  s.tone(Y,polyPath(torn(-IW,F2T,2*IW,S1-F2T,84,4,60),true),l2);wall(s,-HW,F2T,WT,S1-F2T,85);wall(s,HW-WT,F2T,WT,S1-F2T,86);
  const open=sm(10.61,11,t,easeIO);
  s.save();s.clip(rectPath(WX,WY,WW,WH));
  if(open>.02){pitch(s,90);const bandU=sm(10.9,11.5,t,easeOut),a:Pt=[-90,WY+WH*.78-14],b:Pt=[96,WY+WH*.85-14];
   if(bandU>0){const e:Pt=[lerp(a[0],b[0],bandU),lerp(a[1],b[1],bandU)],rb=ribbon([a,e],46,{seed:92,wobble:1.2,taper:.2,pressure:.2,step:20});s.knockout(rb);s.fill(Y,rb,.75);s.fill(O,rb,.75);}
   figure(s,-130,WY+WH*.78,120,'kick',{ink:O,seed:94,face:1,k:.6,shade:K});figure(s,120,WY+WH*.85,130,'stand',{ink:Y,seed:95,face:1,shade:O});
   ball(s,lerp(-90,72,bandU),lerp(a[1],b[1],bandU)-8,22,{rot:bandU*6,seed:96});
   if(bandU>=1)sparkBurst(s,Y,96,WY+WH*.85-30,60,{n:7,seed:97,g:sm(11.5,11.8,t,easeOut)*(1-sm(11.9,12.4,t))});}
  s.restore();
  bigWindow(s,98,open,l2);
  slab(s,-HW,S2,2*HW,40,87);
  // the roof and the ridge tie (commitment)
  roof(s,106,{rafters:1,tiles:1,glow:lR,tie:sm(13.15,13.8,t,easeOut)});
  if(t>=13.8)for(const x of [-EAVE+20,EAVE-20])puff(s,x,S2-28,tt-13.8,136+(x>0?1:0),{n:8,cloud:70,up:110,spread:1.2});
  // the facade: the finished front wall with windows and a door, swinging away on "every level depends on what was built beneath"
  const swing=t<2.9?1:1-sm(2.9,3.6,t,easeIn);
  if(swing>.01){s.save();s.translate(-HW,0);s.scale(swing,1);s.translate(HW,0);
   s.knockout(polyPath(torn(-HW,S2+30,2*HW,GROUND-S2-30,137,5,80),true));wall(s,-HW,S2+30,2*HW,GROUND-S2-30,138);
   win(s,-300,F2T+50,120,120,139,.45);win(s,180,F2T+50,120,120,140,.45);win(s,180,F1T+60,120,120,141,.45);door(s,-240,GROUND,110,210,142);
   s.restore();}
  if(t>=3.6)for(let k=0;k<2;k++)puff(s,-HW+60,lerp(F2T,FTOP,k*.7),tt-3.6,143+k,{n:8,size:16,up:120,life:.6,ink:O,spread:1.2});
  s.restore();
  // the finished player: at the door with a foot on the ball, then steps aside to the right so the cutaway is clear
  const aside=t<2.8?0:anticipate(2.8,3.6,t,{back:.05,hold:.2}),fx=lerp(-120,620,clamp(aside))+settle(t,3.6,{amp:10,freq:5,decay:6}),fy=gy(fx,11)+4;
  const arrive=settle(t,.3,{amp:.05,freq:5,decay:5,phase:Math.PI/2}),restK=t<2.8?sm(.9,1.2,t,easeOutBack):t>=4?sm(4,4.4,t,easeOutBack):0;
  const moving=aside>0&&aside<1,pose:Pose=moving?walkPose(t,true):restK>0?'rest':'stand';
  const tapEnd=t>=15.8?settle(t,15.8,{amp:.06,freq:4,decay:5,phase:Math.PI/2}):0;
  s.save();s.translate(fx,fy);s.scale(1+arrive*.5,1-arrive);s.translate(-fx,-fy);
  figure(s,fx,fy,420,pose,{ink:Y,seed:144,face:1,k:pose==='rest'?restK:1,shade:O,wide:1.15});s.restore();
  const bxo=moving?fx+90:fx+70;ball(s,bxo,fy-46+tapEnd*46,46,{rot:bxo*.012,sx:1+tapEnd,sy:1-tapEnd,seed:145});
 },
 still:12,
};

export const story:RisoStory={
 id:'house-player',format:'7v7',title:'The House You Build',theme:'Building a player floor by floor',ageNote:'An explanation of how a player is built over years: technique first, then the body, the mind, and the will.',
 spec:{paper:'#f0ece2',inks:{orange:'#ff6c2f',yellow:'#ffe800',green:'#00a95c',navy:'#22366b'},order:['yellow','orange','green','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:[
  {label:'The basement',narration:'Building a football player is a lot like building a house. And every strong house begins below the surface—with the basement. For a player, that basement is technique.',seconds:11.2,audio:CH+'1.m4a',cues:[{at:0.0,words:'Building a football player'},{at:2.39,words:'building a house'},{at:4.56,words:'below the surface'},{at:6.51,words:'the basement'},{at:8.25,words:'that basement is technique'}]},
  {label:'Lay the foundation',headline:{text:'TECHNIQUE',at:3.3},narration:'Between the ages of seven and fourteen, the foundation is laid: controlling the ball, passing, dribbling, and becoming comfortable with it. Without that technical foundation by fourteen, everything built above it becomes unstable.',seconds:15.6,audio:CH+'2.m4a',cues:[{at:0.0,words:'Between the ages of seven and fourteen'},{at:3.3,words:'the foundation is laid'},{at:5.08,words:'controlling the ball, passing, dribbling'},{at:8.9,words:'comfortable with it'},{at:10.93,words:'Without that technical foundation'},{at:13.22,words:'becomes unstable'}]},
  {label:'The first floor',headline:{text:'PHYSICAL',at:2.21},narration:'Then comes the first floor: the physical side of the player. Between fourteen and seventeen, you begin to see whether the player has the speed, strength, and physical ability needed for the game.',seconds:12.5,audio:CH+'3.m4a',cues:[{at:0.0,words:'Then comes the first floor'},{at:2.21,words:'the physical side'},{at:4.2,words:'Between fourteen and seventeen'},{at:6.85,words:'speed, strength'},{at:9.28,words:'physical ability needed'}]},
  {label:'The second floor',headline:{text:'READ IT',at:3.94},narration:'Above that is the second floor: tactical understanding. Can the player read the game? When a teammate has the ball, do they understand where to move, how to create space, and how to connect with others?',seconds:12.8,audio:CH+'4.m4a',cues:[{at:0.0,words:'Above that is the second floor'},{at:2.28,words:'tactical understanding'},{at:3.94,words:'read the game'},{at:5.6,words:'When a teammate has the ball'},{at:7.47,words:'where to move'},{at:8.92,words:'create space'},{at:10.38,words:'connect with others'}]},
  {label:'The roof',headline:{text:'DESIRE',at:4.7},narration:'Finally, around eighteen or nineteen, the roof is added. And the roof is desire. How badly does the player want to succeed? Are they willing to miss the parties on Friday night because they want to perform well on Saturday?',seconds:14.9,audio:CH+'5.m4a',cues:[{at:0.0,words:'Finally, around eighteen or nineteen'},{at:2.91,words:'the roof is added'},{at:4.7,words:'the roof is desire'},{at:6.72,words:'How badly does the player want'},{at:9.18,words:'miss the parties on Friday night'},{at:12.09,words:'perform well on Saturday'}]},
  {label:'The whole house',narration:'Everyone sees the finished player. But every level depends on what was built beneath it. Technique creates the foundation. Physical ability adds structure. Tactical intelligence gives it purpose. And commitment holds the entire house together.',seconds:16.5,audio:CH+'6.m4a',cues:[{at:0.0,words:'Everyone sees the finished player'},{at:2.77,words:'every level depends on what was built beneath'},{at:6.0,words:'Technique creates the foundation'},{at:8.31,words:'Physical ability adds structure'},{at:10.61,words:'Tactical intelligence gives it purpose'},{at:13.15,words:'commitment holds the entire house together'}]},
 ],
 draw(f){playChapters(story,f,[ch1,ch2,ch3,ch4,ch5,ch6]);},
 touch(s,x,y,age,seed){
  // a brick stamps into the print: scales 1.35 → 1 with a back-ease, a paper dust cloud shrinks away, yellow and orange specks fly with gravity
  const g=age>0?easeOutBack(clamp(age/.25)):1,fade=age>0?1-clamp((age-.5)/.3):1;if(fade<=0)return;
  const sc=lerp(1.35,1,g)*(fade>.5?1:lerp(.9,1,fade*2));
  brick(s,x,y,130*sc,64*sc,(hash(seed,7)-.5)*.5,seed,fade>.5?.96:.7);
  puff(s,x,y+28,age-.03,seed+2,{n:9,size:11,up:160,life:.55,cloud:110,spread:1.2});
  if(age>.05&&age<.6)puff(s,x,y+20,age-.05,seed+5,{n:5,size:8,up:120,life:.5,ink:O,spread:.8});
 },
};
