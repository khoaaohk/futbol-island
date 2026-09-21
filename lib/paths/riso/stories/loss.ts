/** After the Final Whistle (loss) — riso rebuild. Lead material: a pond seen from above, settling after an impact.
 * People are ABSTRACT riso figures (bible §1c.4, `figure()` below); the score is two stacks of navy stone blocks (never a glyph).
 * Background world: blue grainy water with concentric torn-edge ring bands born at an impact point on drawn frames and
 * travelling outward; torn yellow shores (blue × yellow = a green wet strip); a paper sky-reflection disc on still water.
 * Inks: yellow → orange → blue → navy on cream. Roles: orange = result/pressure (whistle, numerals, bar, the wake);
 * yellow = the useful thing (stones, thread, pebble, shore); blue = water; navy = bed, contours, pebbles.
 * The two score numerals are authored path glyphs (never text). Drawn objects on twos, camera on ones, randomness seeded. */
import type {Sheet} from '../sheet';
import {type RisoStory,type Scene,playChapters} from '../story';
import {apertureDisc} from '../passage';
import {twos,twosIndex,sm,easeOut,easeIO,easeIn,easeOutBack,key,settle,spring,clamp,lerp,rng,hash,noise1,blob,polyPath,circlePath,ribbon,smoothPts,partial,rotPts,arc,TAU,type Pt,type Key} from '../motion';
import {sparkBurst,speedLines,thread,handCut,ring,dust,contour} from '../shapes';
void contour;void spring;void hash;void twosIndex;

const CH='/stories/narration/11v11/loss/';
const K='navy',O='orange',W='blue',Y='yellow';
const q12=(v:number)=>Math.round(v*12)/12;
const bell=(d:number,w:number)=>Math.exp(-(d/w)*(d/w));

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

function cam(s:Sheet,t:number,K:Key[],kick:Pt=[0,0]){const v=key(t,K,easeIO,true);s.camera(v[0]+kick[0],v[1]+kick[1],v[2]??1,v[3]??0);return v;}

// ---------------- water, shores, rings ----------------
/** a half-plane with a torn edge along pos (dir = which side is filled). */
function halfPlane(dir:'up'|'down'|'left'|'right',pos:number,seed:number,amp=30,step=70){const p=new Path2D(),far=3000,e=(v:number)=>pos+amp*noise1(v/210+seed,seed)+amp*.45*noise1(v/64,seed+5);
 if(dir==='up'||dir==='down'){const sg=dir==='up'?-1:1;p.moveTo(-far,e(-far));for(let x=-far+step;x<=far;x+=step)p.lineTo(x,e(x));p.lineTo(far,sg*far);p.lineTo(-far,sg*far);}
 else{const sg=dir==='left'?-1:1;p.moveTo(e(-far),-far);for(let y=-far+step;y<=far;y+=step)p.lineTo(e(y),y);p.lineTo(sg*far,far);p.lineTo(sg*far,-far);}
 p.closePath();return p;}
/** a strip between two torn parallel lines (horizontal: y0..y1, vertical: x0..x1) — the wet strip along a shore. */
function tornStrip(vertical:boolean,p0:number,p1:number,seed:number,amp=26,step=70){const path=new Path2D(),far=3000,e=(v:number,base:number,sd:number)=>base+amp*noise1(v/200+sd,sd)+amp*.45*noise1(v/58,sd+5);
 if(!vertical){path.moveTo(-far,e(-far,p0,seed));for(let x=-far+step;x<=far;x+=step)path.lineTo(x,e(x,p0,seed));for(let x=far;x>=-far;x-=step)path.lineTo(x,e(x,p1,seed+3));}
 else{path.moveTo(e(-far,p0,seed),-far);for(let y=-far+step;y<=far;y+=step)path.lineTo(e(y,p0,seed),y);for(let y=far;y>=-far;y-=step)path.lineTo(e(y,p1,seed+3),y);}
 path.closePath();return path;}
/** water: blue grainy field with a dot-size ramp (deeper = heavier toward the bottom) and a faint navy bed mottle. */
function water(s:Sheet,cov=.5,seed=1){s.field(W,cov,.4);s.tone(W,polyPath(blob(0,900,1500,700,seed,{amp:.12}),true),Math.min(.75,cov+.15));s.tone(K,polyPath(blob(-300,-200,900,600,seed+20,{amp:.2,n:30,rot:.5}),true),.1);}
/** shore: paper under a torn yellow mud region, with the green wet strip where blue overprints the edge. */
function shore(s:Sheet,region:Path2D,wet:Path2D,cov=.55,wetCov=.5){s.knockout(region);s.tone(Y,region,cov);s.tone(W,wet,wetCov);}
type RingStyle='solid'|'smooth'|'sag'|'jagged'|'dashed';
/** one ring band: a torn-edge annulus of radius r and width w in the given style. */
function ringBand(cx:number,cy:number,r:number,w:number,seed:number,style:RingStyle,amp?:number):Path2D{
 const n=Math.min(96,Math.max(28,Math.round(r/11))),a=amp??(style==='smooth'?.012:style==='jagged'?.14:style==='sag'?.035:.03);
 if(style==='dashed'){const p=new Path2D(),dashes=Math.max(6,Math.round(TAU*r/70));for(let i=0;i<dashes;i++){const a0=i/dashes*TAU,a1=a0+TAU/dashes*.6,j=(hash(i,seed)-.5)*w*.4;const R=r+j,ri=R-w;p.moveTo(cx+Math.cos(a0)*R,cy+Math.sin(a0)*R);p.lineTo(cx+Math.cos(a1)*R,cy+Math.sin(a1)*R);p.lineTo(cx+Math.cos(a1)*ri,cy+Math.sin(a1)*ri);p.lineTo(cx+Math.cos(a0)*ri,cy+Math.sin(a0)*ri);p.closePath();}return p;}
 const outer=blob(cx,cy,r,r,seed,{amp:a,n}),inner=blob(cx,cy,r-w,r-w,seed,{amp:a,n});
 const shape=(pts:Pt[],rr:number)=>pts.map((p,i)=>{let x=p[0],y=p[1];if(style==='jagged'){const k=(i%2?1:-1)*w*.35;const ang=Math.atan2(y-cy,x-cx);x+=Math.cos(ang)*k;y+=Math.sin(ang)*k;}if(style==='sag'&&y>cy){y=cy+(y-cy)*1.22;x=cx+(x-cx)*.94;}return[x,y] as Pt;});
 const o=shape(outer,r),iN=shape(inner,r-w),p=new Path2D();p.moveTo(o[0][0],o[0][1]);for(let i=1;i<o.length;i++)p.lineTo(o[i][0],o[i][1]);p.closePath();p.moveTo(iN[iN.length-1][0],iN[iN.length-1][1]);for(let i=iN.length-2;i>=0;i--)p.lineTo(iN[i][0],iN[i][1]);p.closePath();return p;
}
type RingSys={cx:number;cy:number;t0:number;every:(birth:number)=>number;speed:(birth:number)=>number;width:number;covs:number[];style:(birth:number)=>RingStyle;ink:string;fadeR:number;maxR:number;max?:number;seed:number;amp?:(birth:number)=>number;overprint?:(birth:number,t:number)=>number;covScale?:(birth:number,t:number)=>number;paperUnder?:boolean};
/** the rings alive at t: born on drawn frames from t0, each travelling at the speed of its birth. */
function alive(t:number,R:RingSys){const out:{birth:number;k:number;r:number}[]=[];let birth=q12(R.t0),k=0;while(birth<=t+1e-9&&k<(R.max??80)){const r=R.speed(birth)*(t-birth);if(r<=R.maxR)out.push({birth,k,r});k++;const e=R.every(birth);if(e>50)break;birth=q12(birth+e);}return out;}
/** ring system: concentric torn-edge bands from an impact, stepped coverage (a negative step = a paper crest), fading with radius. */
function rings(s:Sheet,t:number,R:RingSys){
 for(const {birth,k,r} of alive(t,R)){if(r<R.width*.6)continue;const step=R.covs[k%R.covs.length],cov=Math.abs(step)*(1-clamp((r-R.fadeR)/(R.maxR-R.fadeR)))*(R.covScale?.(birth,t)??1);if(cov<.04)continue;
  const path=ringBand(R.cx,R.cy,r,R.width*(1-.25*r/R.maxR),R.seed+k,R.style(birth),R.amp?.(birth));
  if(step<0){s.knockout(path,cov);continue;}
  if(R.paperUnder)s.knockout(path,.6);s.tone(R.ink,path,cov);const op=R.overprint?.(birth,t);if(op&&op>.04)s.tone(O,path,op);}
}
/** circle × circle intersections. */
function xsect(c1:Pt,r1:number,c2:Pt,r2:number):Pt[]{const dx=c2[0]-c1[0],dy=c2[1]-c1[1],d=Math.hypot(dx,dy);if(d<1e-6||d>r1+r2||d<Math.abs(r1-r2))return[];const a=(r1*r1-r2*r2+d*d)/(2*d),h=Math.sqrt(Math.max(0,r1*r1-a*a)),mx=c1[0]+a*dx/d,my=c1[1]+a*dy/d;return[[mx+h*dy/d,my-h*dx/d],[mx-h*dy/d,my+h*dx/d]];}
/** paper sky-reflection: a knockout ellipse whose edge steadies as the water stills. */
function reflection(s:Sheet,x:number,y:number,rx:number,ry:number,cov:number,seed:number,wob=.04){if(cov<.04)return;s.knockout(polyPath(blob(x,y,rx,ry,seed,{amp:wob,n:48}),true),cov);}
/** splash: a paper crown ring and droplets that arc up and fall (age in s). */
function splash(s:Sheet,x:number,y:number,age:number,seed:number,size=1,ink:string|null=null){
 if(age<0||age>.7)return;const g=easeOut(clamp(age/.35)),r=(20+70*g)*size;s.knockout(ring(x,y,r*.7,r),.9*(1-clamp((age-.3)/.4)));
 const rr=rng(seed),p=new Path2D();for(let i=0;i<6;i++){const a=-Math.PI/2+(rr()-.5)*2.2,d=(40+rr()*70)*size,u=clamp(age/.45),px=x+Math.cos(a)*d*u,py=y+Math.sin(a)*d*u+120*size*u*u-40*size*u,rd=(5+rr()*5)*size;p.moveTo(px+rd,py);p.arc(px,py,rd,0,TAU);}
 if(ink)s.fill(ink,p,.9);else s.knockout(p,.9);
}

// ---------------- the whistle, the numerals, the bar, stones ----------------
/** the referee's whistle: a huge cropped orange barrel, a mouthpiece running up-left, a paper pea, navy contour thick on the shadow side. */
function whistle(s:Sheet,x:number,y:number,r:number,angle:number,o:{inflate?:number;cov?:number;pea?:Pt;seed?:number}={}){
 const{inflate=0,cov=.9,pea=[0,0],seed=7}=o;s.save();s.translate(x,y);s.rotate(angle);s.scale(1+inflate,1+inflate);
 const barrel=blob(0,0,r,r*.92,seed,{amp:.03,n:44}),mouth:Pt[]=[[-r*.5,-r*.55],[-r*2.2,-r*1.35],[-r*2.35,-r*1.0],[-r*.7,-r*.15]];
 const mouthP=polyPath(handCut(mouth,seed+1,4,60),true),barrelP=polyPath(barrel,true);s.knockout(barrelP);s.knockout(mouthP);s.fill(O,barrelP,cov);s.fill(O,mouthP,cov);
 s.tone(K,polyPath(blob(r*.15,r*.3,r*.8,r*.62,seed+2,{amp:.04}),true),.3);
 s.fill(K,ribbon(barrel,Math.max(4,r*.09),{seed:seed+3,close:true,pressure:.7,wobble:r*.02}));s.fill(K,ribbon(mouth,Math.max(3,r*.06),{seed:seed+4,close:true,pressure:.5,wobble:2}));
 s.fill(K,polyPath(handCut([[r*.15,-r*.98],[r*.55,-r*.9],[r*.5,-r*.72],[r*.12,-r*.8]],seed+5,2,30),true));
 s.knockout(polyPath(blob(-r*.1+pea[0],r*.05+pea[1],r*.26,r*.26,seed+6,{amp:.05}),true));
 s.restore();
}
/** the score as tally blocks: two stacks of navy stone blocks (1 and 2 high) standing on the shore — a print object, never a glyph. */
function tally(s:Sheet,x:number,y:number,w:number,h:number,seed:number,o:{cov?:number;scale?:number;lift?:number;sink?:number}={}){
 const{cov=.9,scale=1,lift=0,sink=0}=o;s.save();s.translate(x,y);s.scale(scale);
 const block=(bx:number,by:number,sd:number)=>{const pts=handCut([[bx-w/2,by-h],[bx+w/2,by-h],[bx+w/2,by],[bx-w/2,by]],sd,Math.max(3,h*.08),h*.5);const p=polyPath(pts,true);s.knockout(p);s.fill(K,p,cov);s.knockout(polyPath(blob(bx-w*.2,by-h*.7,w*.1,h*.08,sd+1,{amp:.2}),true),.8);};
 block(-w*.8,-lift+sink*60,seed);block(w*.8,-lift+sink*60,seed+3);block(w*.8,-h-6-lift+sink*90,seed+6);
 s.restore();
}
/** the stone-ball: a round river stone with five navy seam lines and a paper highlight; `over` overprints it orange (carried by the wake). */
function stoneBall(s:Sheet,x:number,y:number,r:number,rot:number,o:{over?:number;cov?:number;seed?:number}={}){
 const{over=0,cov=1,seed=17}=o,disc=polyPath(blob(x,y,r,r,seed,{amp:.03,n:44}),true);s.knockout(disc,cov);
 if(over>0)s.tone(O,disc,.8*over);
 if(over<.9){const seams=new Path2D();for(let k=0;k<5;k++){const a=rot+k*TAU/5;seams.addPath(ribbon([[x+Math.cos(a)*r*.2,y+Math.sin(a)*r*.2],[x+Math.cos(a+.3)*r*.6,y+Math.sin(a+.3)*r*.6],[x+Math.cos(a)*r*.96,y+Math.sin(a)*r*.96]],Math.max(3,r*.07),{seed:seed+k,taper:.5,wobble:1}));}s.fill(K,seams,cov*(1-over));}
 s.fill(K,ribbon(blob(x,y,r,r,seed+1,{amp:.02,n:44}),Math.max(3,r*.08),{seed:seed+9,close:true,pressure:.6,wobble:r*.02}),cov);
 s.knockout(polyPath(blob(x-r*.4,y-r*.42,r*.16,r*.12,seed+2,{amp:.05}),true),cov);
}
/** pebble P: a single yellow pebble with a paper crescent as its front. */
function pebble(s:Sheet,x:number,y:number,r:number,face:number,o:{cov?:number;seed?:number;shadow?:number;scale?:number}={}){const{cov=.95,seed=19,shadow=0,scale=1}=o;s.save();s.translate(x,y);s.scale(scale);
 if(shadow>0)s.tone(K,polyPath(blob(shadow*.8,shadow,r,r*.9,seed,{amp:.08}),true),.4);
 const b=blob(0,0,r,r*.9,seed,{amp:.08,n:30});s.knockout(polyPath(b,true));s.tone(Y,polyPath(b,true),cov);s.fill(K,ribbon(b,Math.max(3,r*.12),{seed:seed+1,close:true,pressure:.6,wobble:1.5}));
 s.knockout(polyPath(blob(Math.cos(face)*r*.42,Math.sin(face)*r*.42,r*.3,r*.22,seed+2,{amp:.06,rot:face}),true),.9);s.restore();}
/** the many pebbles on the shore (navy and blue, two batched fills). aside(x,y) → displacement for roll-aside. */
function pebbleField(s:Sheet,seed:number,count:number,box:[number,number,number,number],cov:number,aside?:(x:number,y:number,i:number)=>Pt){const rr=rng(seed),navy=new Path2D(),blue=new Path2D();
 for(let i=0;i<count;i++){let x=box[0]+rr()*box[2],y=box[1]+rr()*box[3];const r=14+rr()*16,sd=seed+i;if(aside){const d=aside(x,y,i);x+=d[0];y+=d[1];}const b=blob(x,y,r,r*.8,sd,{amp:.1,n:14,rot:rr()*3});const p=i%3===0?blue:navy;p.moveTo(b[0][0],b[0][1]);for(let k=1;k<b.length;k++)p.lineTo(b[k][0],b[k][1]);p.closePath();}
 s.fill(K,navy,cov);s.fill(W,blue,cov);}
/** the effort track: stud marks pressed into the mud, each a stamp with a little spray. */
function studTrack(s:Sheet,a:Pt,b:Pt,t:number,t0:number,t1:number,seed:number,cov=1){const n=12,p=new Path2D(),spray=new Path2D(),rr=rng(seed);const dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy),ux=dx/L,uy=dy/L;
 for(let i=0;i<n;i++){const u=(i+.5)/n,at=t0+(t1-t0)*i/n;if(t<at)break;const side=i%2?1:-1,x=a[0]+dx*u-uy*side*22,y=a[1]+dy*u+ux*side*22;const q=rotPts([[-9,-14],[9,-14],[9,14],[-9,14]],Math.atan2(dy,dx)+(rr()-.5)*.3);p.moveTo(x+q[0][0],y+q[0][1]);for(let k=1;k<4;k++)p.lineTo(x+q[k][0],y+q[k][1]);p.closePath();
  const age=t-at;if(age<.8)for(let k=0;k<3;k++){const ang=rr()*TAU,d=10+30*easeOut(clamp(age/.5));spray.rect(x+Math.cos(ang)*d,y+Math.sin(ang)*d,4,4);}}
 s.fill(K,p,cov);s.fill(K,spray,cov*.8);}
const numBounce=(t:number,t0:number)=>t>t0?settle(t,t0,{amp:1,freq:4,decay:5}):0;

// ---------------- chapter 1: when the whistle goes ----------------
const IMPACT:Pt=[200,80];
const R1:RingSys={cx:IMPACT[0],cy:IMPACT[1],t0:1.5,every:()=>1/3,speed:b=>b<2.92?260:b<4.3?170:b<5.5?330:250,width:64,covs:[.65,.85,-.55],ink:W,fadeR:800,maxR:1300,seed:100,
 style:b=>b<2.92?'solid':b<4.3?'sag':b<5.5?'jagged':b<7.96?'solid':'smooth',
 overprint:(b,t)=>b>=4.3&&b<5.5?.7*(1-sm(7.96,9.2,t)):0,
 covScale:b=>b>=2.92&&b<4.3?.7:1};
/** the match ball: held at the player's side, dropped at 1.1, splashes at 1.5 and sinks. */
function ch1Ball(t:number){const fall=t<1.1?0:easeIn(clamp((t-1.1)/.4)),sink=sm(1.5,2.9,t,easeOut);return{x:lerp(40,IMPACT[0],fall),y:lerp(-250,IMPACT[1],fall),fall,sc:lerp(1,.7,sink),cov:lerp(1,.35,sink),sink};}
const ch1:Scene={
 draw(s,t){
  const tt=twos(t);
  const kick=settle(t,.3,{amp:5,freq:8,decay:6})+settle(t,1.6,{amp:6,freq:5,decay:5})+settle(t,4.3,{amp:6,freq:9,decay:6});
  cam(s,t,[[0,0,-60,1],[.9,0,-60,1],[1.6,120,0,1.08,0,easeIn],[2.92,120,0,1.08,0],[3.5,60,-60,1.12,-.04],[4.8,60,-40,1.12,.03],[5.5,60,-40,1.12,.03],[7.96,80,0,1.14,.03],[9,200,60,1.3,0],[9.87,200,80,1.72,0]],[0,kick]);
  water(s,.4,1);
  shore(s,halfPlane('up',-150,21,32),tornStrip(false,-220,-120,22),.55,.5);
  // still water reflects the sky until the rings break it up
  reflection(s,120,200,330,180,.3,23,.05);
  const b=ch1Ball(t);
  if(b.fall>=1){const refr=b.sink<1?6*Math.sin(tt*9):0;stoneBall(s,b.x+refr,b.y,60*b.sc,tt*2,{cov:b.cov});}
  rings(s,t,R1);
  // anger: orange ink splatters burst from the impact and stick, then wash out
  if(t>=4.3){const rr=rng(31),p=new Path2D(),g=easeOut(clamp((t-4.3)/.4));for(let i=0;i<7;i++){const a=rr()*TAU,d=(90+rr()*220)*g,r=5+rr()*9;p.addPath(polyPath(blob(IMPACT[0]+Math.cos(a)*d,IMPACT[1]+Math.sin(a)*d,r,r*.7,40+i,{amp:.2,n:10}),true));}s.tone(O,p,lerp(.9,.3,sm(7.96,9.2,t)));}
  // jagged rings break on the shore into fragments that settle on the mud
  if(t>=5.5){const rr=rng(33),p=new Path2D(),g=easeOut(clamp((t-5.5)/.6));for(let i=0;i<9;i++){const x=-200+rr()*700,y=-150-rr()*60-30*g,sz=8+rr()*8,q=rotPts([[-sz,-sz*.5],[sz,-sz*.6],[sz*.8,sz*.5],[-sz*.7,sz*.4]],rr()*TAU);p.moveTo(x+q[0][0],y+q[0][1]);for(let k=1;k<4;k++)p.lineTo(x+q[k][0],y+q[k][1]);p.closePath();}s.fill(K,p,.7);}
  splash(s,IMPACT[0],IMPACT[1],t-1.5,35,1.4);
  // the player at the whistle: standing tall on the shore; on "Disappointment or anger" the shoulders drop and the head sinks (stand → slump); a residual sway after
  const drop=sm(2.92,3.45,t,easeOut),stL=poseLimbs('stand'),slL=poseLimbs('slump');
  const heave=t>=3.45?.02*Math.sin((t-3.45)*2.2)*Math.exp(-(t-3.45)*.15):0;
  figure(s,110,-160,380,K,201,'stand',{facing:-1,arms:mixLimbs(stL.arms,slL.arms,drop),tilt:.24*drop+heave+(t<1.1?.03*Math.sin(t*3):0),headDrop:[.02*drop,.08*drop]});
  if(b.fall<1)stoneBall(s,b.x,b.y,60,.3,{});
  // the whistle: inflates, blasts (three navy sound rings and fragments), recoils and settles, recedes once its part is done
  const inflate=.06*sm(0,.2,t)*(1-sm(.2,.5,t)),recoil=-12*sm(.2,.35,t)+12*sm(.35,.5,t)+8*settle(t,.5,{amp:1,freq:4,decay:5});
  const wcov=key(t,[[0,.9],[5.5,.9],[6.3,.6]]),wy=-330+4*sm(5.5,6.3,t);
  whistle(s,-300+recoil,wy,150,-.25,{inflate,cov:wcov,pea:t>.2&&t<.5?[4*Math.sin(tt*40),3*Math.cos(tt*37)]:[0,0]});
  if(t>=.2){const p=sm(.2,.85,t,easeOut);for(let k=0;k<3;k++){const g=clamp(p*3-k);if(g<=0)continue;const r=40+280*g;s.fill(K,ribbon(blob(-140,-440,r,r*.8,50+k,{amp:.04,n:36}),10*(1-k*.2),{seed:50+k,close:true,pressure:.4,wobble:1.5}),.9*(1-g*.7));}}
  if(t>=.25){const rr=rng(37),cream=new Path2D(),navy=new Path2D();for(let i=0;i<8;i++){const a=-1.3+(rr()-.5)*2.4,d=120+rr()*260,u=easeOut(clamp((t-.25)/.5)),x0=-140+Math.cos(a)*d*u,y0=-440+Math.sin(a)*d*u,fl=clamp((t-.75)/1.2);const x=x0,y=y0+180*fl*fl;const sz=10+rr()*10,q=rotPts([[-sz,-sz*.5],[sz,-sz*.6],[sz*.8,sz*.5],[-sz*.7,sz*.4]],rr()*TAU+tt*2*(1-fl));const p=i%2?cream:navy;p.moveTo(x+q[0][0],y+q[0][1]);for(let k=1;k<4;k++)p.lineTo(x+q[k][0],y+q[k][1]);p.closePath();}s.knockout(cream,.9);s.fill(K,navy,.8);}
  // the last bubble: a paper dot rises at the impact centre and holds — the seam material
  if(t>=9){const g=easeOutBack(clamp((t-9)/.2));s.knockout(polyPath(blob(IMPACT[0],IMPACT[1],26*g,26*g,39,{amp:.05}),true));}
  else if(t>=7.96){const r=key(t,[[7.96,8],[8.2,14],[8.5,10]]);s.knockout(polyPath(blob(IMPACT[0],IMPACT[1],r,r,39,{amp:.05}),true));}
 },
 aperture(){return apertureDisc(IMPACT[0],IMPACT[1],90,12);},still:8.6,
};

// ---------------- chapter 2: let the ripples settle ----------------
const C2:Pt=[-220,-140];
const every2=(b:number)=>b<4.9?1/3:b<7.5?lerp(1/3,.9,easeOut((b-4.9)/2.6)):1.3;
const R2:RingSys={cx:C2[0],cy:C2[1],t0:-2,every:every2,speed:b=>b<4.9?260:lerp(260,160,easeOut(clamp((b-4.9)/3))),width:70,covs:[.65,.85,-.55],ink:W,fadeR:1100,maxR:1800,seed:200,
 style:()=>'solid',amp:b=>b<4.9?.045:lerp(.045,.012,easeOut(clamp((b-4.9)/3))),covScale:(b,t)=>1-.25*sm(4.9,7.9,t)*(b<4.9?0:1)};
const R2s:RingSys={cx:160,cy:60,t0:3.45,every:()=>1/6,speed:()=>230,width:34,covs:[.8,-.6],ink:W,fadeR:300,maxR:520,max:5,seed:220,style:()=>'jagged'};
const ch2:Scene={
 draw(s,t){
  const tt=twos(t);
  const kick=settle(t,3.4,{amp:8,freq:7,decay:6});
  cam(s,t,[[0,-120,-60,1],[2.92,-110,-50,1],[3.5,60,40,1.02,-.05],[3.9,60,40,1.02,-.05],[4.9,60,40,1.02,0],[8,-100,-60,1.15,0],[8.57,-220,-140,1.45,0]],[kick*.5,kick]);
  water(s,.4,2);
  // the sky reflection reassembles as the water stills
  const rcov=key(t,[[6.5,0],[8,.3],[8.57,.45]]);reflection(s,C2[0],C2[1],360,215,rcov,41,lerp(.06,.02,sm(8,8.57,t)));
  // the slap flattens the water for two drawn frames, then it rebounds
  const flat=t>=3.4&&t<3.57?.55:1+.12*settle(t,3.57,{amp:1,freq:5,decay:6});
  s.save();s.translate(160,60);s.scale(1,flat);s.translate(-160,-60);
  rings(s,t,R2);
  if(t>=3.45)rings(s,t,R2s);
  s.restore();
  // interference: paper dots pop where the slap rings cross the main rings
  if(t>=3.6&&t<6.2){const p=new Path2D();let n=0;for(const a of alive(t,R2))for(const b of alive(t,R2s)){for(const x of xsect(C2,a.r-35,[160,60],b.r-17)){if(n++>40)break;p.moveTo(x[0]+8,x[1]);p.arc(x[0],x[1],8,0,TAU);}}s.knockout(p,.9);}
  // four cream fragments ride the rings: they bob as a ring passes under them, are thrown by the slap, then drift apart
  {const rr=rng(45),p=new Path2D(),spread=sm(4.9,7.9,t,easeOut);for(let i=0;i<4;i++){const a=rr()*TAU,d0=260+rr()*300;const d=d0+spread*120;let x=C2[0]+Math.cos(a)*d,y=C2[1]+Math.sin(a)*d;let bob=0;for(const r of alive(t,R2))bob=Math.max(bob,bell(Math.hypot(x-C2[0],y-C2[1])-r.r+35,30));const thrown=sm(3.4,3.8,t)*(1-sm(3.8,4.6,t));const dx=x-160,dy=y-60,dd=Math.hypot(dx,dy)||1;x+=dx/dd*90*thrown;y+=dy/dd*90*thrown-6*bob*(1-spread);const sz=14+rr()*10,q=rotPts([[-sz,-sz*.5],[sz,-sz*.6],[sz*.8,sz*.5],[-sz*.7,sz*.4]],rr()*TAU+tt*.3);p.moveTo(x+q[0][0],y+q[0][1]);for(let k=1;k<4;k++)p.lineTo(x+q[k][0],y+q[k][1]);p.closePath();}s.knockout(p,.9);}
  // the centre bubble contracts on every ring birth
  {const born=alive(t,R2);const last=born.length?born[born.length-1].birth:-9;const pulse=1-clamp((t-last)/.15);const r=20-6*pulse;s.knockout(polyPath(blob(C2[0],C2[1],r,r,47,{amp:.06}),true),.92);}
  // "flatten them immediately": the whistle is thrown flat onto the water (a slap), tilts edge-on and sinks with a paper bubble trail
  if(t>=2.92&&t<3.4)s.tone(K,polyPath(blob(160,60,200,60,49,{amp:.1,n:24}),true),.3*sm(2.92,3.05,t));
  if(t>=3.05&&t<6.4){const drop=sm(3.05,3.4,t,easeIn),tilt=-.25+sm(3.9,4.4,t,easeIn)*1.2,sinkY=sm(4.4,6.2,t,easeIn)*140,cov=key(t,[[3.4,.9],[3.9,.9],[4.9,.5],[6.2,.1]]);
   whistle(s,160,lerp(-260,60,drop)+sinkY,74*lerp(1.2,1,drop)*(1-.3*sm(4.9,6.2,t)),tilt,{cov,seed:9});
   if(t>=4.4){const rr=rng(57),p=new Path2D();for(let i=0;i<6;i++){const u=((t-4.4)*.6+rr())%1;p.addPath(circlePath(160+(rr()-.5)*60,60+sinkY*.6-u*220,5+rr()*6));}s.knockout(p,.85*(1-sm(6,6.4,t)));}}
  splash(s,160,60,t-3.4,51,1.6,K);
  if(t>=6&&t<6.5){const g=easeOutBack(clamp((t-6)/.2));s.knockout(polyPath(blob(160,60,12*g,12*g,53,{amp:.06}),true),.9*(1-clamp((t-6.25)/.25)));}
 },
 aperture(){return apertureDisc(C2[0],C2[1],150,14);},still:8.2,
};

// ---------------- chapter 3: a result, not your worth ----------------
const C3:Pt=[-80,-60];
const R3:RingSys={cx:C3[0],cy:C3[1],t0:-1,every:()=>1.6,speed:()=>110,width:70,covs:[.35,-.3],ink:W,fadeR:500,maxR:900,seed:300,style:()=>'smooth',amp:()=>.012};
const TALLY:Pt=[-300,330];
const ch3:Scene={
 draw(s,t){
  cam(s,t,[[0,-260,140,1.1],[1.2,-260,180,1.15],[2.52,-260,180,1.15],[3.6,220,160,1.1,.03],[5,220,160,1.1,0],[6.94,220,160,1.1,0],[7.8,100,100,1.14,0],[8.6,20,20,1.2,0],[9.97,20,20,1.62,0]]);
  water(s,.4,3);
  // the pond bed through still water: navy mottle, slow wide rings that keep travelling from the old impact
  s.tone(K,polyPath(blob(300,-200,1300,900,61,{amp:.15,n:40}),true),.15);s.tone(K,polyPath(blob(-500,-400,700,500,62,{amp:.2,n:24}),true),.25);
  rings(s,t,R3);
  const shoreCov=key(t,[[0,.4],[6.94,.4],[7.8,.7]]);shore(s,halfPlane('down',190,63,34),tornStrip(false,140,240,64),shoreCov,.5);
  // value: the sky-reflection disc settles onto the still surface and dwarfs the score
  if(t>=5){const sc=lerp(1.08,1,sm(5,5.6,t,easeOut)),cov=key(t,[[5,.4],[8.6,.4],[9.5,.55]]);reflection(s,20,-40,320*sc,300*sc,cov,65,lerp(.06,.02,sm(8.6,9.5,t)));}
  // the score: two stacks of navy stone blocks on the shore; a navy ring is drawn round them and relaxes; they recede under the picture
  const sharp=sm(.15,.5,t,easeOut)*(1-sm(.9,1.5,t)),tcov=key(t,[[0,.6],[.5,.9],[1.5,.7],[6.94,.7],[7.8,.45]]),down=2*sm(0,.15,t);
  tally(s,TALLY[0],TALLY[1]+down,110,70,66,{cov:tcov,scale:1+.08*sharp});
  if(sharp>0){const pts=blob(TALLY[0],TALLY[1]-40,230,150,67,{amp:.05,n:36});const line=partial(smoothPts(pts,true,6),Math.min(1,sharp*1.05));if(line.length>1)s.fill(K,ribbon(line,8,{seed:68,close:sharp>=.95,pressure:.5,wobble:1.5}),.9);}
  // the team: revealed by the pan on "cannot describe your team" — three navy players standing shoulder to shoulder on the shore; on "respect" they lift their heads together
  const respect=sm(6.94,7.5,t,easeOutBack),up=.06*respect,sw=(k:number)=>.02*Math.sin(t*1.8+k);
  const rL=poseLimbs('reach'),stL=poseLimbs('stand');
  figure(s,130,380,320,K,71,'stand',{facing:1,tilt:sw(0),arms:mixLimbs(stL.arms,rL.arms,respect*.35),headDrop:[0,-up]});
  figure(s,290,360,340,K,72,'stand',{facing:1,tilt:sw(1),arms:mixLimbs(stL.arms,rL.arms,respect*.5),headDrop:[0,-up]});
  figure(s,450,380,320,K,73,'stand',{facing:-1,tilt:sw(2),arms:mixLimbs(stL.arms,rL.arms,respect*.35),headDrop:[0,-up]});
  // the effort: a stud track pressed into the shore mud toward the water's edge
  if(t>=3.8)studTrack(s,[-640,470],[-500,230],t,3.8,4.6,74);
 },
 aperture(){return apertureDisc(20,-40,200,14);},still:7.9,
};

// ---------------- chapter 4: look with curiosity (navy + yellow night) ----------------
const S1:Pt=[-200,120],S2:Pt=[240,150];
const R4a:RingSys={cx:S1[0],cy:S1[1],t0:2.88,every:()=>.5,speed:()=>240,width:30,covs:[.5,.75],ink:Y,fadeR:320,maxR:720,seed:400,style:()=>'solid',amp:()=>.02,paperUnder:true,max:4};
const R4b:RingSys={cx:S2[0],cy:S2[1],t0:5.0,every:()=>.5,speed:()=>240,width:28,covs:[.6,.85],ink:Y,fadeR:320,maxR:720,seed:430,style:()=>'dashed',paperUnder:true,max:4};
/** a paper speech disc with a tail toward (tx,ty) — the one generic shape in this story (the two questions). */
function speech(s:Sheet,x:number,y:number,w:number,h:number,tx:number,ty:number,seed:number,g=1){if(g<=0)return;s.knockout(polyPath(blob(x,y,w*g,h*g,seed,{amp:.05,n:24}),true),.95);s.knockout(polyPath([[x+(tx-x)*.25,y+(ty-y)*.2],[x+(tx-x)*.35+14,y+(ty-y)*.3],[x+(tx-x)*.6,y+(ty-y)*.7]],true),.95);}
const ch4:Scene={
 draw(s,t){
  const kick=settle(t,2.88,{amp:4,freq:6,decay:6})+settle(t,5.0,{amp:4,freq:6,decay:6});
  cam(s,t,[[0,0,0,1],[2,0,20,1.08],[2.88,-60,0,1.1,0],[4.9,-60,0,1.1,0],[5.4,60,20,1.1,0],[6.98,60,20,1.1,0],[7.6,20,20,1.15,-.05],[8.2,20,20,1.15,0],[8.67,240,120,1.5,0]],[0,kick]);
  // night: navy field with a blue screen and paper speckle through it, a torn horizon band, a torn yellow shore arc at the top-left
  s.field(K,.8,.5);s.tone(W,polyPath([[-4000,-4000],[4000,-4000],[4000,4000],[-4000,4000]],true),.3);
  s.tone(K,polyPath(handCut([[-4000,-260],[4000,-300],[4000,-4000],[-4000,-4000]],80,40,200),true),.88);
  {const arcP=polyPath(blob(-720,-720,700,660,82,{amp:.1,n:40}),true);s.knockout(arcP);s.tone(Y,arcP,.5);}
  // readiness: a slow sheen of light passes across the water once, then keeps a faint drift
  const u=easeIO(clamp(t/2));s.tone(Y,polyPath(blob(-900+1800*u+40*Math.sin(t*.9),80,450,170,83,{amp:.1,rot:-.3}),true),t<2.4?.12:.06);
  rings(s,t,R4a);rings(s,t,R4b);
  // two people talking: the player (paper, lantern-lit) and the taller coach face each other; the speech disc alternates sides on each question
  const lean1=sm(6.98,7.4,t,easeOut),lean2=sm(6.98,7.4,t,easeOut),ask1=sm(2.88,3.2,t,easeOutBack)*(1-sm(4.7,5.0,t)),ask2=sm(5.0,5.3,t,easeOutBack)*(1-sm(6.8,7.0,t));
  const nod=(t0:number)=>t>=t0&&t<t0+.4?.05*Math.sin((t-t0)/.4*Math.PI*2):0;
  const stL=poseLimbs('stand'),liL=poseLimbs('listen'),pL=poseLimbs('point');
  figure(s,S1[0]+40*lean1,S1[1],320,K,84,'stand',{mode:'paper',paperTone:.25,toneInk:Y,facing:1,tilt:.1*lean1+nod(2.88)+.02*Math.sin(t*1.7),arms:mixLimbs(stL.arms,pL.arms,ask1*.7)});
  figure(s,S2[0]-40*lean2,S2[1],400,K,85,'stand',{mode:'paper',paperTone:.25,toneInk:Y,facing:-1,tilt:.1*lean2+nod(5.0)+.02*Math.sin(t*1.5+1),arms:mixLimbs(stL.arms,liL.arms,ask1),headDrop:[0,.02*ask2]});
  if(ask1>0)speech(s,S1[0]+60,S1[1]-360,90,54,S1[0]+20,S1[1]-262,86,Math.min(1,ask1));
  if(ask2>0)speech(s,S2[0]-70,S2[1]-450,100,58,S2[0]-20,S2[1]-330,87,Math.min(1,ask2));
  // without blame: the two step closer; a yellow thread joins them, overshoots and settles
  if(t>=7.15){const p=sm(7.15,7.85,t,easeIO),over=p>=1?1+.05*settle(t,7.85,{amp:1,freq:3,decay:5}):p*1.06;const cov=key(t,[[7.15,.7],[8.2,.7],[8.6,.95]]);
   const pts:Pt[]=[[S1[0]+120,S1[1]-150],[-40,-40],[60,-70],[S2[0]-150,S2[1]-190]];const line=partial(smoothPts(pts,false,6),Math.min(1,over*.83));if(line.length>1)s.knockout(ribbon(line,13,{seed:93,pressure:.35,taper:.3,wobble:1.2}),.92);thread(s,Y,pts,11,{seed:93,progress:Math.min(1,over*.83),cov});}
 },
 aperture(){return apertureDisc(S2[0]-40,S2[1]-160,70,12);},still:7.9,
};

// ---------------- chapter 5: choose one detail (the shore, close) ----------------
function ch5F(t:number){const slide=sm(6.9,7.6,t,easeIO),over=slide>=1?10*settle(t,7.6,{amp:1,freq:3,decay:5}):0;
 const x=lerp(-200,-300,slide)-over*.5,y=lerp(150,330,slide)+over;
 const look=key(t,[[0,0],[3.18,0],[3.3,-.15],[3.65,1,easeOut],[4.3,1],[4.6,0]]);
 return{x,y,look,slide,moving:slide>0&&slide<1};}
function ch5Ball(t:number){const roll=sm(4.45,5.2,t,easeIO),p:Pt=[lerp(420,-90,roll),lerp(160,120,roll)];const touch=sm(5.2,5.6,t,easeOut),after=t>5.6?6*settle(t,5.6,{amp:1,freq:4,decay:5}):0;
 const x=touch>0?lerp(-90,-40,touch):p[0],y=touch>0?lerp(120,170,touch)+after:p[1];const carry=sm(6.9,7.6,t,easeIn);
 return{x:x-120*carry*.8,y:y-120*carry*.6,rot:roll*7+touch*1.2,over:sm(6.55,6.9,t)};}
const ch5:Scene={
 draw(s,t){
  const tt=twos(t);
  cam(s,t,[[0,0,40,1],[.8,-60,40,1.1],[3.3,-60,40,1.1],[3.8,-180,-100,1.1,-.14],[4,-180,-100,1.1,-.14],[4.4,-60,40,1.1,0],[4.6,-60,40,1.1,0],[5.3,-40,80,1.15,0],[6.9,-40,80,1.15,0],[7.7,-200,220,1.15,0],[9.04,-200,220,1.15,0],[10,-260,240,1.4,0],[10.57,-260,240,2.0,0]]);
  const fade=1-.7*sm(9.2,9.9,t,easeOut);
  // the shore: yellow mud filling the frame, torn against blue shallows on the right, a green wet strip between; the shallows' rings drift
  s.field(Y,.55,.5);
  const waterR=halfPlane('right',220,101,34);s.knockout(waterR);s.tone(W,waterR,.45);s.tone(W,halfPlane('right',160,102,28),.5);
  for(let k=0;k<3;k++)s.tone(W,ringBand(520,60,170+k*140+((t*40)%140),60,120+k,'smooth'),.2*(1-((t*40)%140)/140*.5));
  s.tone(O,polyPath(blob(520,60,40,30,103,{amp:.1}),true),.3);
  // the many pebbles drift a little; two roll aside when the player steps
  const F=ch5F(t);
  const aside=(x:number,y:number):Pt=>{const d=Math.hypot(x-F.x,y-F.y);let k=0;if(d<110&&F.moving)k=12*Math.sin(F.slide*Math.PI);if(!k)return[3*Math.sin(t*.7+x),2*Math.sin(t*.9+y)];const ang=Math.atan2(y-F.y,x-F.x);return[Math.cos(ang)*k,Math.sin(ang)*k];};
  pebbleField(s,107,30,[-560,-380,760,760],.6*fade,aside);
  // the opponent: an orange player runs in from the top-left, revealed by the look, overruns the ball and carries it off
  {const dir=Math.atan2(150+330,-140+380);const adv=key(t,[[0,0],[3.3,60],[4.3,220,easeOut],[6.4,240],[6.9,460,easeIn]]);
   const ox=-420+Math.cos(dir)*adv,oy=-330+Math.sin(dir)*adv,st=stride(twosIndex(t)),running=(t>=3.3&&t<4.3)||(t>=6.4&&t<6.9);
   const ocov=key(t,[[0,.5],[3.3,.6],[3.65,.95]])*fade;
   figure(s,ox,oy+100,300,O,109,running?'run':'stand',{facing:1,legs:running?st.legs:undefined,arms:running?st.arms:undefined,tilt:running?.12:0,cov:ocov});
   if(running)speedLines(s,O,ox-40,oy-60,dir,{n:4,seed:111,len:100,width:6,cov:.7*ocov});}
  // the stone-ball: rocks in the shallows, rolls in along the wet strip, is touched away from the opponent, then overrun and carried
  const B=ch5Ball(t);const rock=t>=1.3&&t<1.9?.05*Math.sin((tt-1.3)*TAU*1.6):0;
  stoneBall(s,B.x,B.y,90,B.rot+rock,{over:B.over,cov:fade});
  if(t>=4.45&&t<5.2)speedLines(s,W,B.x,B.y,Math.atan2(-90,-500),{n:4,seed:115,len:90,width:6});
  if(t>=4.6&&t<5.6){const rr=rng(117),p=new Path2D();for(let i=0;i<4;i++){const u=clamp((t-4.6-i*.15)/.4);const x=B.x+60+rr()*80*u,y=B.y-20-40*u+90*u*u;p.moveTo(x+6,y);p.arc(x,y,6,0,TAU);}s.fill(W,p,.8);}
  if(t>=5.2&&t<5.7)sparkBurst(s,K,-90,120,90,{n:7,seed:119,g:easeOutBack(clamp((t-5.2)/.3)),width:8});
  // the recovery track: navy dashes left behind as the player runs back goal-side
  if(t>=6.9){const p=new Path2D(),u=sm(6.9,7.6,t,easeIO);for(let i=0;i<9;i++){const k=(i+.5)/9;if(k>u)break;const x=lerp(-200,-300,k),y=lerp(150,330,k);const q=rotPts([[-14,-5],[14,-5],[14,5],[-14,5]],Math.atan2(180,-100));p.moveTo(x+q[0][0],y+q[0][1]);for(let j=1;j<4;j++)p.lineTo(x+q[j][0],y+q[j][1]);p.closePath();}s.fill(K,p,.85*fade);}
  // the player: checks the shoulder (head turns back with a small counter-nod), touches the ball, then runs back into space (stride, smear); the only solid thing left
  const st=stride(twosIndex(t)),kicking=t>=5.15&&t<5.5;
  figure(s,F.x,F.y,320,K,121,F.moving?'run':kicking?'kick':F.look>.5?'lookBack':'stand',{facing:F.moving?-1:1,legs:F.moving?st.legs:undefined,arms:F.moving?st.arms:undefined,head:!F.moving&&F.look>0?[-.12*F.look,-.82]:undefined,tilt:F.moving?.12:-.04*F.look+.02*Math.sin(t*1.6),cov:t>=9.2?1:.95});
  if(F.moving&&F.slide<.6)speedLines(s,K,F.x+60,F.y-150,Math.atan2(180,-100),{n:4,seed:123,len:110,width:5});
  if(t>=9.9)s.fill(K,ribbon([[F.x+92,F.y-200],[F.x+102,F.y-182],[F.x+124,F.y-212]],7,{seed:125,taper:.4,wobble:.6}));
 },
 aperture(t){const F=ch5F(t);return apertureDisc(F.x+(F.moving?-30:0),F.y-262,40,12);},still:10,
};

// ---------------- chapter 6: room for another day ----------------
const HOPS:[number,number,Pt,Pt,number][]=[[4.3,4.62,[-420,240],[-200,120],60],[4.62,4.92,[-200,120],[40,10],40],[4.92,5.18,[40,10],[260,-80],25],[5.18,5.4,[260,-80],[440,-140],15]];
function ch6P(t:number){let p:Pt=[-420,240],sq=1,rest=0;const back=8*sm(4.14,4.3,t);p=[p[0]-back,p[1]];
 for(const [t0,t1,a,b,lift] of HOPS){if(t<t0)break;const u=clamp((t-t0)/(t1-t0));p=arc(a,b,u,lift);if(u>=1){sq=1-.25*(t<t1+.09?1:0);rest=t1;}}
 if(t>=5.4){p=[440,-140];sq=1+.06*settle(t,5.4,{amp:1,freq:4,decay:5,phase:Math.PI/2});}
 return{p,sq,rest};}
const R6:RingSys={cx:700,cy:500,t0:2.6,every:()=>2.2,speed:()=>120,width:50,covs:[.2,-.15],ink:W,fadeR:500,maxR:900,seed:610,style:()=>'smooth',amp:()=>.012};
const ch6:Scene={
 draw(s,t){
  const tt=twos(t);
  cam(s,t,[[0,0,0,1],[2.5,-60,20,1.08],[4.3,-60,20,1.08],[5.5,220,-60,1.1,0],[6.54,220,-60,1.1,0],[7,160,0,1.1,.035],[7.6,140,40,1.1,0],[9.1,140,40,1.1,0]]);
  water(s,.4,4);dust(s,null,0,0,1200,40,{seed:129,size:6,cov:.5,spread:1.5});
  // the last faint bands dissolve; slow rings from the far shore keep passing
  const dis=1-sm(0,2,t);if(dis>.2)for(let k=0;k<5;k++)s.tone(W,ringBand(-100,-60,250+k*200+t*30,80,600+k,'smooth'),.1*dis);
  rings(s,t,R6);
  // the far shore rim along the bottom and right
  shore(s,halfPlane('down',300,131,32),tornStrip(false,260,340,132),.5,.5);shore(s,halfPlane('right',430,133,32),tornStrip(true,390,490,134),.5,.5);
  // the sun's reflection: lowers, its glow ring widens, its edge softens
  const sunY=-140+40*sm(0,2.5,t,easeOut),glowR=lerp(280,340,sm(0,2.5,t,easeOut)),wob=lerp(.08,.03,sm(0,2.6,t));
  s.knockout(ring(-220,sunY,270,glowR+8*Math.sin(tt*.8)),lerp(.5,.25,sm(0,2.5,t)));reflection(s,-220,sunY,270,250,.5,135,wob);
  // the score blocks under the sun disc: they lift once as if to follow, then sink out of the picture with a last bubble
  const nlift=sm(6.54,6.85,t,easeOut),nsink=sm(6.85,8,t,easeIn),ncov=key(t,[[0,.25],[6.54,.25],[6.85,.6],[8,.03]]);
  if(ncov>.04)tally(s,-230,-20,70,44,137,{cov:ncov,scale:lerp(1,.7,nsink),lift:24*nlift,sink:nsink});
  if(t>=7.6&&t<8){const g=easeOutBack(clamp((t-7.6)/.2));s.knockout(polyPath(blob(-200,-20,10*g,10*g,138,{amp:.06}),true),.9*(1-clamp((t-7.8)/.2)));}
  // rest: a player lying back on the shore, head on a yellow pillow disc, chest rising slowly
  const breathe=.03*Math.sin(t*1.4);
  s.knockout(polyPath(blob(-190,318,54,30,139,{amp:.06,n:20}),true));s.tone(Y,polyPath(blob(-190,318,54,30,139,{amp:.06,n:20}),true),.95);
  figure(s,-60,330,300,K,140,'lie',{facing:1,scaleX:1+breathe,tilt:.03*Math.sin(t*1.4)});
  // four cream fragments drift to the shore and stop
  {const rr=rng(141),p=new Path2D(),u=sm(0,2.5,t,easeOut);for(let i=0;i<4;i++){const x0=-300+rr()*500,y0=-200+rr()*400;const x=lerp(x0,x0+120,u),y=lerp(y0,280,u);const sz=14+rr()*10,q=rotPts([[-sz,-sz*.5],[sz,-sz*.6],[sz*.8,sz*.5],[-sz*.7,sz*.4]],rr()*TAU);p.moveTo(x+q[0][0],y+q[0][1]);for(let k=1;k<4;k++)p.lineTo(x+q[k][0],y+q[k][1]);p.closePath();}s.knockout(p,.9);}
  // the lesson: the pebble skipped forward across the still pond in small hops, each contact a splash and two small forward rings
  for(const [,t1,,b] of HOPS){if(t<t1)continue;splash(s,b[0],b[1],t-t1,142+Math.round(t1*10),.7,W);for(let k=0;k<2;k++){const r=40+(t-t1-k*.12)*200;if(r>40&&r<320)s.tone(Y,ringBand(b[0],b[1],r,18,150+k,'smooth'),.4*(1-r/320));}}
  const P=ch6P(t);s.save();s.translate(P.p[0],P.p[1]);s.scale(1/P.sq,P.sq);pebble(s,0,0,40,.3,{seed:19});s.restore();
  if(t>=5.6&&t<5.8)s.knockout(polyPath(blob(520,-110,60,10,151,{amp:.3,n:8}),true),.9);
 },
 still:8,
};

export const story:RisoStory={
 id:'loss',format:'11v11',title:'After the Final Whistle',theme:'Handling a loss',ageNote:'A direct mental-skills explainer; playing format does not define age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',orange:'#ff6c2f',blue:'#0078bf',navy:'#22366b'},order:['yellow','orange','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:[
  {label:'WHEN THE WHISTLE GOES',narration:'What happens inside you after a loss? Disappointment or anger may follow. Caring about the result makes those feelings understandable.',seconds:10.517,audio:CH+'01.m4a',cues:[{at:0,words:'What happens inside'},{at:2.92,words:'Disappointment or anger'},{at:7.96,words:'understandable'}]},
  {label:'LET THE RIPPLES SETTLE',narration:'Think of ripples across water. You do not have to flatten them immediately. Give yourself space before deciding what the match means.',seconds:9.217,audio:CH+'02.m4a',cues:[{at:0,words:'Think of ripples'},{at:2.92,words:'flatten them immediately'},{at:4.9,words:'Give yourself space'}]},
  {label:'A RESULT, NOT YOUR WORTH',headline:'One result',narration:'The score describes one result. It cannot describe your team, your effort, or your value. You still deserve respect after a difficult game.',seconds:10.617,audio:CH+'03.m4a',cues:[{at:0,words:'The score'},{at:2.52,words:'cannot describe'},{at:6.94,words:'deserve respect'}]},
  {label:'LOOK WITH CURIOSITY',narration:'When you feel ready, ask two questions. What helped us? What could we try differently? Talk with a teammate or coach, without blame.',seconds:9.317,audio:CH+'04.m4a',cues:[{at:0,words:'When you feel ready'},{at:2.88,words:'What helped us'},{at:6.98,words:'without blame'}]},
  {label:'CHOOSE ONE DETAIL',headline:'One detail',narration:'Choose one football detail for practice. Perhaps check your shoulder before receiving, or recover into space after losing possession. Keep it small.',seconds:11.217,audio:CH+'05.m4a',cues:[{at:0,words:'Choose one football'},{at:3.18,words:'check your shoulder'},{at:9.04,words:'Keep it small'}]},
  {label:'ROOM FOR ANOTHER DAY',narration:'Then make room for rest and life beyond football. You can carry a useful lesson forward without carrying the whole score with you.',seconds:9.115,audio:CH+'06.m4a',cues:[{at:0,words:'Then make room'},{at:4.14,words:'a useful lesson forward'},{at:6.54,words:'the whole score'}]},
 ],
 draw(f){playChapters(story,f,[ch1,ch2,ch3,ch4,ch5,ch6]);},
 /** a tap drops a pebble: a paper splash, one droplet, and two blue rings that expand and fade. */
 touch(s,x,y,age,seed){
  const u=easeOut(clamp(age/.8));
  for(let k=0;k<2;k++){const r=24+300*clamp(u-k*.15);if(r>28)s.tone(W,ringBand(x,y,r,24,seed+k,'solid',.05),.6*(1-clamp(u-k*.1)));}
  if(age<.5)s.knockout(ring(x,y,16+60*clamp(age/.2),30+80*clamp(age/.2)),.9*(1-age/.5));
  const sc=lerp(1.3,1,clamp(age/.15));s.fill(K,polyPath(blob(x,y,12*sc,10*sc,seed+7,{amp:.1,n:12}),true),.9);
  if(age>0&&age<.4){const d=arc([x,y],[x+24,y+6],age/.4,30);s.knockout(polyPath(blob(d[0],d[1],5,5,seed+9),true),.9);}
 },
};
