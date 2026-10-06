/** Messi v Getafe, Copa del Rey semi-final first leg, Camp Nou, 18 April 2007 — an iconic-play riso film (RisoStory, chapters mode).
 * A 1:1 reconstruction of the goal from written accounts (we cannot watch the footage), rendered as a riso print.
 *
 * SOURCES (what the choreography follows):
 *  - SI, "Anatomy of a Goal: 12 years on from Lionel Messi's stunning solo goal against Getafe" (18 Apr 2019)
 *    https://www.si.com/soccer/2019/04/18/anatomy-goal-12-years-lionel-messis-stunning-solo-goat-goal-against-getafe
 *  - FC Barcelona, "10 years since Messi's historic goal against Getafe" and "18 years since Messi's Maradona-like goal"
 *    https://www.fcbarcelona.com/en/news/769781/10-years-since-messis-historic-goal-against-getafe
 *    https://www.fcbarcelona.com/en/news/4250088/18-years-since-messis-maradona-like-goal
 *  - DataFactory, "13th anniversary of Lionel Messi's historic goal against Getafe"
 *    https://www.datafactory.la/en/13-anniversary-of-the-historic-goal-of-lionel-messi-to-getafe/
 *  - Sky Sports, "Lionel Messi's 'work of art' or replica? Remembering the Diego Maradona copy a decade on"
 *    https://www.skysports.com/football/news/11827/10836556/lionel-messis-work-of-art-or-replica-remembering-the-diego-maradona-copy-a-decade-on
 *  - GiveMeSport, "Lionel Messi vs Getafe: when the GOAT scored the greatest goal of all time"; BeSoccer "13 years since…"; Sports Mole video page.
 * CONFIRMED by those accounts: Xavi's pass, controlled a few metres inside his own half on the right touchline; past Paredes; a nutmeg on
 * Nacho (touches 3–4) and past Nacho again; then Alexis and Belenguer; keeper Luis García rushes out and is rounded; a right-footed finish
 * "squeezed home from a tight angle"; Cortés is listed among the players passed; ~55 m in ~12 s; 13 touches; 28th/29th minute, 2–0; the
 * celebration in the same (right) sector as the finish, like Maradona 1986.
 * INFERRED (illustrative): exact positions/timings between beats, the running line's curve, Cortés as the defender racing back to cover the
 * near post, where the other players stand, kit details (Getafe in blue, keeper in yellow, referee in dark kit), the TV camera placement.
 *
 * FRAMING (the TV broadcast): chapter 1 = the high main-stand camera, real time, panning with the ball (a real 3D projection of the pitch,
 * mowing stripes, the Camp Nou bowl, boards); chapter 2 = the slow-motion replay from a low, closer camera (last defender → keeper → finish);
 * chapter 3 = a close, slow replay of the first touches (the lesson: one ring on ball and foot, then the change of pace).
 * Figures: small batched riso figures in the wide shot (light on the phone), jointed detailed figures in the replays. The ball rolls with
 * friction between the 13 touches and never sticks to the foot. Inks: yellow, red, blue, navy. Everything is keyed to the cue times, so the
 * voice's real timings (edit only TIMING) move the action with the words. Scenes read only (t, c); every random value is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import timing from '../../../public/plays/narration/messi-getafe-2007/timing.json';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,curvePath,ribbon,rectPath,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,glowDisc} from '../../paths/riso/shapes';
import {beats,shotAt,reframe,steady,near,type View as DView} from './director';
import {drawAthlete,motionSmear,runCycle,dribble,strike,lunge,backpedal,keeperSet,keeperDive,celebrate,stand,blendPose,touchPhase,STRIKE_CONTACT,type Pose as APose,type AthleteStyle,type InkFill,type Projector} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Narration, cue words and (provisional, 2.6 words/s) timings. `at` = word onset in the chapter's audio (s); `seconds` = clip length incl. the
 * silent tail that carries the .65 s passage. The voice generator replaces `seconds`, `at` and `audio`; the words must stay substrings.
 * Chapter 1 runs the goal in real time from "gets the ball" (the control) to "goal" (the ball crossing the line). */
const TIMING:{label:string;text:string;seconds:number;audio?:string;cues:[number,string][]}[]=[
 {label:'The goal, live',text:"Camp Nou, 2007. Messi gets the ball from Xavi, turns past one player, through another's legs, past him again, and away down the right. Past two more, into the box, round the keeper... goal!",seconds:15.4,
  cues:[[.3,'Camp Nou'],[2.22,'gets the ball'],[4.15,'turns past one'],[5.68,"through another's legs"],[6.84,'past him again'],[8.38,'away down the right'],[9.92,'Past two more'],[11.07,'into the box'],[12.22,'round the keeper'],[13.38,'goal']]},
 {label:'Watch it again',text:'Watch it again, slowly. A last burst of speed takes him past the defender. He goes round the keeper, and scores from a tight angle.',seconds:11,
  cues:[[.15,'Watch it again'],[1.69,'A last burst'],[5.92,'goes round the keeper'],[7.84,'scores'],[9,'tight angle']]},
 {label:'Your turn',text:"Just like Maradona's famous goal in 1986! The secret: small, quick touches keep the ball close, and sudden changes of pace.",seconds:10.4,
  cues:[[.15,"Just like Maradona's"],[4.38,'small, quick touches'],[7.46,'sudden changes of pace']]},
];
// Kokoro (af_bella) narration: withTiming swaps in the recorded clips, chapter lengths and word onsets.
const CHAPTERS:Chapter[]=withTiming(TIMING.map(c=>({label:c.label,narration:c.text,seconds:c.seconds,audio:c.audio,cues:c.cues.map(([at,words])=>({at,words}))})),timing as NarrationTiming);
/** onset of the cue whose words start with w in chapter i */
const CUEW=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('messi: cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;

// ---------------------------------------------------------------- inks, helpers
const Y='yellow',R='red',B='blue',K='navy';
type Ink=[string,number];
/** print a path in a list of inks (cov ≥ .95 solid, else halftone) */
function print(s:Sheet,inks:Ink[],p:Path2D){for(const [n,c] of inks){if(c>=.95)s.fill(n,p);else s.tone(n,p,c);}}
const add=(a:Pt,b:Pt):Pt=>[a[0]+b[0],a[1]+b[1]];
const mul=(a:Pt,k:number):Pt=>[a[0]*k,a[1]*k];
const L2=(a:Pt,b:Pt,u:number):Pt=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)];
/** The film plays inside the player card's picture window (a small ~1.45:1 landscape frame, ~1566 × 1080 units). The engine aims camera()
 * at its safe-region centre and scales by `fit` (both tuned for the full-screen player); this centres world (x,y) on the CANVAS centre at
 * `z` units per world unit instead (the engine's arrival scale is kept, so passages and seams behave exactly as in the stories). */
function cam(s:Sheet,x:number,y:number,z0:number,r=0){const z=z0*Math.min(1,Math.pow(s.W/1566,.75)),k=z*s.arrival;s.camera(x-(s.W/2-s.cx)/k,y-(s.H/2-s.cy)/k,z/s.fit,r);return z;}
/** half the visible world width at zoom z, with margin for the .68 passage preview */
const halfW=(s:Sheet,z:number)=>s.W/(2*z*.68)+160;
// ---------------------------------------------------------------- the ball
/** paper ball, navy pentagon panels, blue shade crescent, navy rim, glint. (x,y) = centre. smear stretches it along dir. */
function ball(s:Sheet,x:number,y:number,r:number,rot:number,o:{smear?:number;dir?:number;squash?:number}={}){
 const{smear=0,dir=0,squash=0}=o;let pts=blob(x,y,r*(1+squash),r*(1-squash),3,{amp:.02,n:32});
 if(smear>0){const dx=Math.cos(dir),dy=Math.sin(dir);pts=pts.map(q=>{const b=-((q[0]-x)*dx+(q[1]-y)*dy);return b>0?[q[0]-dx*smear*Math.min(1,b/r),q[1]-dy*smear*Math.min(1,b/r)] as Pt:q;});}
 const disc=polyPath(pts,true);s.knockout(disc);
 s.save();s.clip(disc);
 s.tone(B,(()=>{const p=new Path2D();p.arc(x,y,r*1.05,0,TAU);p.moveTo(x-r*.28+r*1.2,y-r*.3);p.arc(x-r*.28,y-r*.3,r*1.2,0,TAU,true);return p;})(),.45);
 const pan=new Path2D(),pent=(cx:number,cy:number,pr:number,a0:number)=>{const q:Pt[]=[];for(let i=0;i<5;i++){const a=a0+i/5*TAU;q.push([cx+Math.cos(a)*pr,cy+Math.sin(a)*pr]);}return polyPath(q,true);};
 pan.addPath(pent(x+Math.cos(rot)*r*.2,y+Math.sin(rot)*r*.2,r*.3,rot));
 for(let i=0;i<5;i++){const a=rot+Math.PI/5+i/5*TAU;pan.addPath(pent(x+Math.cos(a)*r*.92,y+Math.sin(a)*r*.92,r*.28,a+Math.PI));}
 s.fill(K,pan,.95);s.restore();
 s.fill(K,ribbon(pts,Math.max(2.5,r*.08),{seed:4,close:true,pressure:.4,wobble:r*.015}),.95);
 if(r>14)s.knockout(polyPath(blob(x-r*.42,y-r*.44,r*.14,r*.09,5,{amp:.05,n:10}),true));
}

// ---------------------------------------------------------------- small effects
/** grass spray (slides, dives, touch) — green bits and paper flecks thrown from a point, ballistic, 0..1 s */
function spray(s:Sheet,x:number,y:number,age:number,seed:number,size=1,dir=-1){
 if(age<0||age>1)return;const r=rng(seed),a=new Path2D(),b=new Path2D(),u=easeOut(clamp(age/.7)),fl=Math.sin(Math.min(1,age/.8)*Math.PI);
 for(let i=0;i<14;i++){const ang=-Math.PI/2+(r()-.5)*2.2+dir*.5,d=(40+r()*170)*u*size,px=x+Math.cos(ang)*d,py=y+Math.sin(ang)*d*.5-fl*(30+r()*70)*size,z=(6+r()*9)*size,q:Pt[]=[[px-z,py-z*.4],[px+z*.6,py-z*.6],[px+z,py+z*.3],[px-z*.4,py+z*.5]];(i%3?a:b).addPath(polyPath(q,true));}
 const fade=1-clamp((age-.6)/.4);s.knockout(b,.9*fade);s.fill(Y,a,.9*fade);s.tone(B,a,.6*fade);
}
/** a small yellow touch spark at the boot, for .3 s after a touch */
function tap(s:Sheet,x:number,y:number,age:number,seed:number,r=46){if(age<0||age>.35)return;sparkBurst(s,Y,x,y,r,{n:7,seed,g:easeOutBack(clamp(age/.15))*(1-clamp((age-.2)/.15)),width:r*.14});}

// ---------------------------------------------------------------- the TV camera: a real 3D projection of the pitch
/** Pitch metres: X along the length (Barça attack +X, goal line at 105), Y up, Z across (0 = the near/right touchline, 68 = far). */
type V3=[number,number,number];
type Cam3={C:V3;F:number;r:V3;u:V3;f:V3};
const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
/** a camera at C looking at T with focal length F (sheet units) */
function look(C:V3,T:V3,F:number):Cam3{const dx=T[0]-C[0],dz=T[2]-C[2],dy=C[1]-T[1],ya=Math.atan2(dx,dz),pi=Math.atan2(dy,Math.hypot(dx,dz)),sy=Math.sin(ya),cy=Math.cos(ya),sp=Math.sin(pi),cp=Math.cos(pi);
 return{C,F,f:[sy*cp,-sp,cy*cp],r:[cy,0,-sy],u:[sy*sp,cp,cy*sp]};}
const NEAR=.4;
function toCam(c:Cam3,P:V3):V3{const d:V3=[P[0]-c.C[0],P[1]-c.C[1],P[2]-c.C[2]];return[dot3(d,c.r),dot3(d,c.u),dot3(d,c.f)];}
const scr=(c:Cam3,q:V3):Pt=>[c.F*q[0]/q[2],-c.F*q[1]/q[2]];
/** project a point (null behind the camera) */
function pr(c:Cam3,P:V3):Pt|null{const q=toCam(c,P);return q[2]<NEAR?null:scr(c,q);}
/** project a polygon, clipped against the near plane */
function polyP(c:Cam3,pts:V3[]):Pt[]{const q=pts.map(p=>toCam(c,p)),out:V3[]=[];
 for(let i=0;i<q.length;i++){const a=q[i],b=q[(i+1)%q.length],ia=a[2]>=NEAR,ib=b[2]>=NEAR;if(ia)out.push(a);if(ia!==ib){const k=(NEAR-a[2])/(b[2]-a[2]);out.push([a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,NEAR]);}}
 return out.map(p=>scr(c,p));}
/** a 3D segment as a projected quad (clipped to the near plane); width in metres at the segment's mean depth. Plain quads, no smoothing:
 * dozens of pitch lines and net strands cost almost nothing to build. */
function seg3(c:Cam3,a:V3,b:V3,wm:number,out:Path2D){let qa=toCam(c,a),qb=toCam(c,b);if(qa[2]<NEAR&&qb[2]<NEAR)return;
 const cut=(p:V3,q:V3):V3=>{const k=(NEAR-p[2])/(q[2]-p[2]);return[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k,NEAR];};if(qa[2]<NEAR)qa=cut(qa,qb);else if(qb[2]<NEAR)qb=cut(qb,qa);
 const A=scr(c,qa),Bp=scr(c,qb),wa=Math.max(1.1,c.F*wm/qa[2]/2),wb=Math.max(1.1,c.F*wm/qb[2]/2),dx=Bp[0]-A[0],dy=Bp[1]-A[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 out.moveTo(A[0]+nx*wa,A[1]+ny*wa);out.lineTo(Bp[0]+nx*wb,Bp[1]+ny*wb);out.lineTo(Bp[0]-nx*wb,Bp[1]-ny*wb);out.lineTo(A[0]-nx*wa,A[1]-ny*wa);out.closePath();}

// ---------------------------------------------------------------- the Camp Nou bowl, boards, grass, lines, goals
/** stand planes (a along, b up the rake 0..1) — far side, right end (behind the goal Messi attacks), left end */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-30,135,a),1.5+27*b,74+46*b],
 (a,b)=>[113+40*b,1.5+27*b,lerp(92,-24,a)],
 (a,b)=>[-8-40*b,1.5+27*b,lerp(-24,92,a)],
];
const STAND_COLS=[84,60,60],STAND_ROWS=14;
type View={hx:number;hy:number};
const view=(s:Sheet,z:number):View=>({hx:s.W/(2*z*.68)+60,hy:s.H/(2*z*.68)+60});
/** sky/roof shadow, tiered stands with a speckled crowd (dots in every ink, sized by distance), walkways, floodlight glow, camera flashes */
function stadium(s:Sheet,c:Cam3,v:View,t:number,o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o;
 s.tone(K,rectPath(-1e4,-1e4,2e4,2e4),.88);
 const planes=new Path2D(),walk=new Path2D();
 for(const S of STANDS){const q=polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]);if(q.length>2)planes.addPath(polyPath(q,true));for(const b of[.48,1])seg3(c,S(0,b),S(1,b),.9,walk);}
 s.tone(B,planes,.32);s.knockout(walk,.85);
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 STANDS.forEach((S,si)=>{const cols=STAND_COLS[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(Math.abs(b-.48)<.03)continue;
  for(let i=0;i<cols;i++){const hsh=hash(i*131+j*7919+si*17,5);if(hsh<.38)continue;const a=(i+.5+(hash(i+j*31,9)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.62/q[2],2.5,17),lift=roar>0&&si===1?roar*z*1.4*Math.max(0,Math.sin(t*10+hsh*TAU)):0;
   const ink=hsh<.62?0:hsh<.84?1:hsh<.94?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}});
 s.knockout(inks[0],.6);s.fill(R,inks[1],.95);s.fill(B,inks[2]);s.fill(Y,inks[3],.95);
 for(const L of [[10,31,112],[95,31,112],[128,31,70]] as V3[]){const q=toCam(c,L);if(q[2]<NEAR)continue;const p=scr(c,q);if(Math.abs(p[0])>v.hx+200||Math.abs(p[1])>v.hy+200)continue;glowDisc(s,Y,p[0],p[1],Math.max(8,c.F*2.4/q[2]),{steps:3,glow:1,seed:Math.round(L[0])});}
 if(flash>0){const p=new Path2D();for(let i=0;i<10;i++){const r1=hash(i*17+Math.floor(t*12)*101,3),r2=hash(i*29+Math.floor(t*12)*7,4),q=pr(c,STANDS[r1<.6?1:0](r1<.6?r2:r2*.9+.1,.1+.8*hash(i,Math.floor(t*12))));if(!q)continue;const z=10+14*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
/** grass (yellow × blue), mowing stripes across the length, boards, paper lines, both goals */
function ground(s:Sheet,c:Cam3,o:{bulge?:number;ballZ?:number}={}){
 const g=polyP(c,[[-9,0,-60],[111,0,-60],[111,0,72],[-9,0,72]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.95);s.tone(B,gp,.88);
 const st=new Path2D();for(let k=0;k<20;k+=2){const q=polyP(c,[[k*5.25,0,-4],[(k+1)*5.25,0,-4],[(k+1)*5.25,0,72],[k*5.25,0,72]]);if(q.length>2)st.addPath(polyPath(q,true));}s.tone(K,st,.1);
 // boards along the far touchline and behind the right goal: red with paper panels
 const bd=new Path2D(),pn=new Path2D();for(const q of [polyP(c,[[-4,0,71],[109,0,71],[109,.9,71],[-4,.9,71]]),polyP(c,[[110,0,-4],[110,0,71],[110,.9,71],[110,.9,-4]])])if(q.length>2)bd.addPath(polyPath(q,true));
 for(let k=0;k<18;k++){const x=-2+k*6.2,q=polyP(c,[[x,.25,70.9],[x+3.2,.25,70.9],[x+3.2,.65,70.9],[x,.65,70.9]]);if(q.length>2)pn.addPath(polyPath(q,true));}
 for(let k=0;k<12;k++){const z=-2+k*6.2,q=polyP(c,[[109.9,.25,z],[109.9,.25,z+3.2],[109.9,.65,z+3.2],[109.9,.65,z]]);if(q.length>2)pn.addPath(polyPath(q,true));}
 s.knockout(bd);s.fill(R,bd,.95);s.knockout(pn,.85);
 // lines
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
 for(let k=0;k<8;k++){L([k*13.125,0,0],[(k+1)*13.125,0,0]);L([k*13.125,0,68],[(k+1)*13.125,0,68]);}
 for(let k=0;k<4;k++){L([105,0,k*17],[105,0,(k+1)*17]);L([0,0,k*17],[0,0,(k+1)*17]);L([52.5,0,k*17],[52.5,0,(k+1)*17]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(52.5,34,9.15);
 for(const [gx,d] of [[105,-1],[0,1]] as [number,number][]){const bx=gx+d*16.5,sx=gx+d*5.5;L([gx,0,13.84],[bx,0,13.84]);L([bx,0,13.84],[bx,0,54.16]);L([bx,0,54.16],[gx,0,54.16]);L([gx,0,24.84],[sx,0,24.84]);L([sx,0,24.84],[sx,0,43.16]);L([sx,0,43.16],[gx,0,43.16]);
  const a=Math.acos(5.5/9.15);circ(gx+d*11,34,9.15,d<0?Math.PI-a:-a,d<0?Math.PI+a:a,10);}
 s.knockout(ln);
 goal3(s,c,105,1,o.bulge??0,o.ballZ??31);
}
/** a goal: posts at z 30.34 / 37.66, bar 2.44, net 2 m deep with a sloping roof. bulge pushes the back out around ballZ. */
function goal3(s:Sheet,c:Cam3,X:number,d:number,bulge:number,bz:number){
 const z0=30.34,z1=37.66,H=2.44,back=(z:number)=>X+d*(2+bulge*.7*Math.exp(-Math.pow((z-bz)/1.8,2)));
 const zs=[z0,(z0+z1)/2-1.8,(z0+z1)/2,(z0+z1)/2+1.8,z1].sort((a,b)=>a-b);
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0),1.9,z0],[back(z0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1),1.9,z1],[back(z1),0,z1]],
  [[X,H,z0],[X,H,z1],[back(z1),1.9,z1],...zs.slice(1,-1).reverse().map(z=>[back(z),1.9,z] as V3),[back(z0),1.9,z0]],
  [...zs.map(z=>[back(z),0,z] as V3),...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes){const q=polyP(c,P);if(q.length>2)net.addPath(polyPath(q,true));}
 s.knockout(net,.32);
 const mesh=new Path2D();
 for(let i=0;i<=10;i++){const z=lerp(z0,z1,i/10);seg3(c,[X,H,z],[back(z),1.9,z],.025,mesh);seg3(c,[back(z),1.9,z],[back(z),0,z],.025,mesh);}
 for(let j=1;j<=4;j++){const y=1.9*j/5;for(let i=0;i<4;i++){const za=zs[i],zb=zs[i+1];seg3(c,[back(za),y,za],[back(zb),y,zb],.025,mesh);}seg3(c,[X,y*H/1.9,z0],[back(z0),y,z0],.025,mesh);seg3(c,[X,y*H/1.9,z1],[back(z1),y,z1],.025,mesh);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+d*2*u,H-.54*u,z0],[X+d*2*u,H-.54*u,z1],.025,mesh);}
 s.fill(K,mesh,.75);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.14,fr);seg3(c,[X,0,z1],[X,H,z1],.14,fr);seg3(c,[X,H,z0-.07],[X,H,z1+.07],.14,fr);
 s.knockout(fr);const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.2,fo);seg3(c,[X,0,z1],[X,H,z1],.2,fo);seg3(c,[X,H,z0],[X,H,z1],.2,fo);s.stroke(K,fo,2.5,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- the players: keyframed tracks (τ = seconds after Messi's control)
/** Kits for the shared athlete library (lib/plays/riso/athlete.ts). Skin: one flat screen + one light screen (no checkerboard at card size). */
const SKIN:InkFill[]=[[R,.75],[Y,.2]];
const barca=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,pattern:'stripes',patternInk:B,shorts:B,socks:B,boots:K,skin:SKIN,hair:K,line:K,numberInk:Y,hairStyle:'short',...o});
const getafe=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:B,shorts:B,socks:B,boots:K,skin:SKIN,hair:K,line:K,numberInk:'paper',hairStyle:'short',...o});
const MESSI_ST=barca({number:19,hairStyle:'long',build:{height:1.69,bulk:.92},seed:19});
const KEEPER_ST:AthleteStyle={shirt:Y,shorts:K,socks:Y,boots:K,skin:SKIN,hair:K,line:K,gloves:R,sleeves:'long',hairStyle:'short',number:1,numberInk:K,build:{height:1.86},seed:51};
const REF_ST:AthleteStyle={shirt:[K,.88],shorts:[K,.88],socks:[K,.88],boots:K,skin:SKIN,hair:K,line:K,hairStyle:'short',build:{height:1.8},seed:12};
type Role='messi'|'def'|'gk'|'mate'|'ref';
type Actor={name:string;st:AthleteStyle;role:Role;keys:number[][];beats?:number[];dive?:[number,number]};
/** Positions are Hermite-interpolated between keys [τ, X, Z]. beats = when a defender lunges at the ball and is beaten. */
const ACTORS:Actor[]=[
 {name:'Messi',st:MESSI_ST,role:'messi',keys:[[-4,45.6,5.4],[-1.2,46.9,5.7],[0,48,6],[.6,48.6,5.7],[1.3,51,6.6],[2.5,55.5,9.5],[3.6,59.8,11],[4.8,65.5,12.2],[6,71.5,13.8],[7,77,15.5],[7.9,82.5,17.5],[8.9,88.5,19.5],[9.8,94,21.5],[10.4,97.8,22.8],[10.9,100.4,21.8],[11.4,101.8,22.6],[11.6,102.3,23.1],[12.3,103,22],[13.3,103.6,16],[15,104.3,8],[17,104.6,4.5]]},
 {name:'Xavi',st:barca({number:6,build:{height:1.7},seed:6}),role:'mate',keys:[[-4,40,16],[-1.2,42.4,14.6],[0,43,14.6],[4,49,17],[12,62,22],[17,68,24]]},
 {name:'Paredes',st:getafe({number:2,build:{height:1.8},seed:31}),role:'def',beats:[.5],keys:[[-4,51.5,9.5],[-1,50.2,8.2],[0,49.4,7.4],[.45,49,6.9],[1.2,50,7.4],[3,54,9],[6,60,11.5],[17,66,14]]},
 {name:'Nacho',st:getafe({number:3,build:{height:1.8},seed:32}),role:'def',beats:[2.45,3.6],keys:[[-4,60,14],[0,57.8,11.6],[2.2,56.5,10.4],[2.6,56.4,10.3],[3.3,58.7,11.9],[3.7,59.8,12.2],[5,63,13.5],[8,70,15],[17,76,18]]},
 {name:'Alexis',st:getafe({number:4,build:{height:1.85,bulk:1.05},seed:33}),role:'def',beats:[6],keys:[[-4,80,20],[3,75,17],[5.7,71.9,14.8],[6.1,72,14.6],[6.7,73.4,15.3],[8.5,79,17.5],[17,88,22]]},
 {name:'Belenguer',st:getafe({number:5,build:{height:1.83,bulk:1.04},seed:34}),role:'def',beats:[7.9],keys:[[-4,90,28],[4,87,24],[7.6,82.9,18.7],[8,82.8,18.4],[8.5,84.3,18.9],[10,90,21],[17,97,24]]},
 {name:'Cortés',st:getafe({number:15,build:{height:1.8},seed:35}),role:'def',beats:[11.62],keys:[[-4,85,40],[4,91,37],[8,98,33],[11.2,103.5,29.3],[11.7,104.1,28.6],[17,104.2,28.4]]},
 {name:'Luis García',st:KEEPER_ST,role:'gk',dive:[10.05,11.2],keys:[[-4,104.3,34],[6,103.5,31.5],[8.9,102.2,28],[9.9,99.7,25.4],[10.1,99.3,25],[17,99.3,25]]},
 {name:'Getafe 7',st:getafe({number:8,seed:36}),role:'def',keys:[[-4,70,34],[17,92,36]]},
 {name:'Getafe 8',st:getafe({number:10,seed:37}),role:'def',keys:[[-4,64,50],[17,90,46]]},
 {name:'Getafe 9',st:getafe({number:11,seed:38}),role:'def',keys:[[-4,78,58],[17,96,50]]},
 {name:'Getafe 10',st:getafe({number:6,seed:39}),role:'def',keys:[[-4,58,27],[17,80,31]]},
 {name:'Getafe 11',st:getafe({number:9,seed:40}),role:'def',keys:[[-4,52,21],[17,69,25]]},
 {name:'Barça 9',st:barca({number:9,seed:7}),role:'mate',keys:[[-4,70,30],[6,84,36],[11,99,38],[13,102.5,24],[17,103.8,9]]},
 {name:'Barça 10',st:barca({number:10,hairStyle:'curly',seed:8}),role:'mate',keys:[[-4,66,52],[11,93,47],[17,101,14]]},
 {name:'Barça 8',st:barca({number:8,build:{height:1.75},seed:9}),role:'mate',keys:[[-4,56,40],[11,80,40],[17,96,20]]},
 {name:'Barça 5',st:barca({number:5,hairStyle:'long',seed:10}),role:'mate',keys:[[-4,38,30],[17,55,32]]},
 {name:'Barça 2',st:barca({number:2,seed:11}),role:'mate',keys:[[-4,34,8],[17,52,9]]},
 {name:'referee',st:REF_ST,role:'ref',keys:[[-4,56,30],[6,72,32],[12,90,36],[17,95,32]]},
];
const MESSI=ACTORS[0];
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and run phase (stride length grows with speed: jog ≈ 2.4 m per cycle, sprint ≈ 3.3 m) — once at load */
const T0=-4,T1=17,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],P:number[]=[];let ph=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i){const dd=Math.hypot(x-px,z-pz),sp=dd/DT;ph+=dd/(1.9+.18*Math.min(8,sp));}X.push(x);Z.push(z);P.push(ph);px=x;pz=z;}return{X,Z,P};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.05),b=posOf(k,tau+.05);return[(b[0]-a[0])*10,(b[1]-a[1])*10];};

// ---------------------------------------------------------------- the ball: 13 touches, friction between them
/** Messi's 13 touches (τ): the control, the turn past Paredes, two carries, the nutmeg through Nacho, past Nacho again, the carry, Alexis,
 * a carry, Belenguer, into the box, round Luis García, the right-footed finish. */
const TOUCHES=[0,.55,1.3,2.0,2.5,3.6,4.8,6.0,7.2,7.9,9.0,10.3,11.6];
const SHOT=11.6,IN_NET=12.0,PASS=-1.15;
const footAt=(tau:number):[number,number]=>{const p=posOf(0,tau),v=velOf(0,tau),l=Math.hypot(v[0],v[1])||1;return tau<=0?[p[0]-.35,p[1]+.25]:[p[0]+v[0]/l*.42,p[1]+v[1]/l*.42];};
const TP=TOUCHES.map(footAt);
const NET:V3=[105.25,.3,31.1],REST:V3=[106.4,.11,31.6];
/** ball position [X, Y, Z] */
function ballAt(tau:number):V3{
 if(tau<PASS){const x=posOf(1,tau);return[x[0]+.45,.11,x[1]-.1];}
 if(tau<0){const x=posOf(1,PASS),a:Pt=[x[0]+.45,x[1]-.1],u=(tau-PASS)/-PASS,e=1-Math.pow(1-u,1.6);return[lerp(a[0],TP[0][0],e),.11,lerp(a[1],TP[0][1],e)];}
 if(tau<SHOT){let k=0;while(k+1<TOUCHES.length&&tau>=TOUCHES[k+1])k++;const u=(tau-TOUCHES[k])/(TOUCHES[k+1]-TOUCHES[k]),e=1-(1-u)*(1-u);return[lerp(TP[k][0],TP[k+1][0],e),.11,lerp(TP[k][1],TP[k+1][1],e)];}
 const s0=TP[TP.length-1];
 if(tau<IN_NET){const u=(tau-SHOT)/(IN_NET-SHOT);return[lerp(s0[0],NET[0],u),.11+.35*Math.sin(Math.PI*u*.9),lerp(s0[1],NET[2],u)];}
 const u=clamp((tau-IN_NET)/.45),e=1-(1-u)*(1-u);return[lerp(NET[0],REST[0],e),lerp(NET[1],REST[1],e),lerp(NET[2],REST[2],e)];
}
const bulgeAt=(tau:number)=>tau<IN_NET+.1?0:Math.exp(-(tau-IN_NET-.1)*2.2)*(1+.3*Math.sin((tau-IN_NET)*14));

// ---------------------------------------------------------------- poses from the tracks (athlete generators)
/** Messi's dribble phase: the touch foot meets the ball (touchPhase) exactly at each of the 13 touches; between touches he takes whole
 * strides at his cadence, so long knocks in space get more strides and the close touches are one quick stride each. */
function messiPhase(tau:number){
 if(tau<0)return samp(TABLES[0].P,tau)+touchPhase-samp(TABLES[0].P,0);
 let k=0;while(k+1<TOUCHES.length&&tau>=TOUCHES[k+1])k++;if(k>=TOUCHES.length-1)return touchPhase+TOUCHES.length*2;
 let base=touchPhase;for(let j=0;j<k;j++)base+=Math.max(1,Math.round((TOUCHES[j+1]-TOUCHES[j])*2.1));
 const n=Math.max(1,Math.round((TOUCHES[k+1]-TOUCHES[k])*2.1));return base+n*(tau-TOUCHES[k])/(TOUCHES[k+1]-TOUCHES[k]);}
const angTo=(a:number,b:number,u:number)=>{let d=b-a;while(d>Math.PI)d-=TAU;while(d<-Math.PI)d+=TAU;return a+d*u;};
/** the athlete pose and heading (yaw in pitch coordinates: atan2(ΔZ, ΔX)) of actor k at τ */
function poseOf(k:number,tau:number):{p:APose;yaw:number}{
 const a=ACTORS[k],[x,z]=posOf(k,tau),v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),m=posOf(0,tau),b=ballAt(tau);
 const to=(X:number,Z:number)=>Math.atan2(Z-z,X-x);
 let yaw=sp>.6?Math.atan2(v[1],v[0]):to(b[0],b[2]);
 const run=()=>runCycle(samp(TABLES[k].P,tau),{speed:clamp((sp-2.2)/5.5)});
 let p:APose=sp<.6?stand():run();
 if(a.role==='messi'){
  const q=Math.max(.3,clamp(sp/7.5));p=dribble(messiPhase(tau),{foot:'l',speed:q});
  if(tau<.6){const xv=posOf(1,tau),yx=to(xv[0],xv[1]);yaw=tau<.25?yx:angTo(yx,Math.atan2(v[1],v[0]),easeInOutSine((tau-.25)/.35));}
  if(tau>SHOT-.5){const u=clamp(STRIKE_CONTACT+(tau-SHOT)/.9);p=blendPose(p,strike(u,{foot:'r',power:.55}),sm(SHOT-.5,SHOT-.3,tau));yaw=Math.atan2(NET[2]-TP[TP.length-1][1],NET[0]-TP[TP.length-1][0]);}
  if(tau>IN_NET+.25){p=blendPose(p,celebrate(samp(TABLES[0].P,tau),{kind:'run'}),sm(IN_NET+.25,IN_NET+.7,tau));yaw=sp>.6?Math.atan2(v[1],v[0]):yaw;}
 }else if(a.role==='def'){
  const last=a.beats?.[a.beats.length-1]??-99,engaged=Math.hypot(m[0]-x,m[1]-z)<9&&tau<last+.3;
  if(engaged){yaw=to(m[0],m[1]);if(sp<3.2)p=backpedal(tau*2.2);}
  for(const bt of a.beats??[]){const w=sm(bt-.45,bt-.25,tau)*(1-sm(bt+.35,bt+.7,tau));if(w>0){p=blendPose(p,lunge(clamp(.6+(tau-bt)/.75),{side:'r'}),w);yaw=to(b[0],b[2]);}}
 }else if(a.role==='gk'){
  yaw=to(m[0],m[1]);if(tau>7.6&&sp<3.5)p=keeperSet(tau*1.6);
  if(a.dive&&tau>a.dive[0]){p=keeperDive(clamp((tau-a.dive[0])/(a.dive[1]-a.dive[0])),{side:'l',height:0});yaw=to(...(posOf(0,a.dive[0]+.35)));}
 }
 return{p,yaw};
}

// ---------------------------------------------------------------- drawing the scene through a camera (athlete library figures)
/** my pitch is left-handed (Z away from the camera); the athlete world is right-handed: negate z both ways */
function projector(c:Cam3):Projector{const m=(p:V3):V3=>[p[0],p[1],-p[2]];
 return{eye:m(c.C),project(p){const q=toCam(c,m(p)),z=Math.max(.05,q[2]);return[c.F*q[0]/z,-c.F*q[1]/z,z];},scale(p){return c.F/Math.max(.05,toCam(c,m(p))[2]);}};}
/** everything on the pitch: players far → near (low detail in the wide shot, auto mid/high in the replays), the ball in depth order */
function play(s:Sheet,c:Cam3,v:View,tau:number,tauPose:number,o:{low?:boolean;minBall?:number;ring?:number;smear?:boolean;dtau?:number}={}){
 const{low=false,minBall=6,ring=0,smear=false,dtau=.08}=o,P=projector(c);
 const list=ACTORS.map((a,k)=>{const[x,z]=posOf(k,tau),q=toCam(c,[x,0,z]);if(q[2]<1)return null;const g=scr(c,q),h=c.F*(a.st.build?.height??1.8)/q[2];
  if(Math.abs(g[0])>v.hx+h||g[1]<-v.hy||g[1]-h>v.hy)return null;return{k,a,x,z,d:q[2],h};}).filter((e):e is NonNullable<typeof e>=>e!==null).sort((p,q)=>q.d-p.d);
 const b=ballAt(tau),bq=toCam(c,b),bg=bq[2]>=NEAR?scr(c,bq):null,br=bg?Math.max(minBall,c.F*.11/bq[2]):0;
 // the one highlight (lesson chapter): a ring on the grass round ball and foot
 if(ring>0){const m=posOf(0,tau),cx=(m[0]+b[0])/2,cz=(m[1]+b[2])/2,r=.35+Math.hypot(m[0]-b[0],m[1]-b[2])/2+.25*(1-ring);const pts:Pt[]=[];for(let i=0;i<40;i++){const q=pr(c,[cx+Math.cos(i/40*TAU)*r*1.15,0,cz+Math.sin(i/40*TAU)*r]);if(q)pts.push(q);}
  if(pts.length>30){const rr=ribbon(pts,Math.max(6,c.F*.1/toCam(c,[cx,0,cz])[2]),{close:true,seed:43,taper:0,wobble:1.2});s.knockout(rr,.9*ring);s.fill(Y,rr,.95*ring);}}
 const drawBall=()=>{if(!bg)return;const g=pr(c,[b[0],0,b[2]]);if(g)s.tone(K,polyPath(blob(g[0],g[1],br*.95,br*.3,2,{amp:.05,n:12}),true),.45);ball(s,bg[0],bg[1],br,Math.hypot(b[0],b[2])/.11);};
 let ballDone=false;
 for(const e of list){
  if(!ballDone&&bq[2]>=e.d){drawBall();ballDone=true;}
  const cur=poseOf(e.k,tauPose),prev=poseOf(e.k,tauPose-dtau),[px,pz]=posOf(e.k,tauPose-dtau);
  const st:AthleteStyle=(low&&e.a.role!=='messi')||e.h<240?{...e.a.st,detail:'low'}:e.a.st,place={x:e.x,z:-e.z,yaw:cur.yaw},prevPlace={x:px,z:-pz,yaw:prev.yaw};
  if(smear&&e.a.role==='messi')motionSmear(s,prev.p,cur.p,P,st,place,{prevPlace});
  drawAthlete(s,cur.p,P,st,place,{prev:prev.p,prevPlace});
 }
 if(!ballDone)drawBall();
}
/** the camera with the card-window framing (world = screen units, centred on the canvas) */
const frame=(s:Sheet)=>{const z=cam(s,0,0,1);DV={w:s.W/z,h:s.H/z};return view(s,z);};
/** the window in camera units (set by frame(); read by the director's reframing, aperture() included) */
let DV:DView={w:1566,h:1080};
/** smoothed track point (a replay camera eases after Messi) */
const smooth=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau),b=posOf(k,tau-.3),d=posOf(k,tau-.6);return[(a[0]+b[0]+d[0])/3,(a[1]+b[1]+d[1])/3];};

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time
/** τ from chapter-1 time: real time between "gets the ball" (the control, τ 0) and "goal" (the ball in, τ 12) */
const tau1=(t:number)=>{const tR=CUEW(0,'gets the ball'),tG=CUEW(0,'goal');return(t-tR)*(IN_NET/(tG-tR));};
const CAM1:V3=[52.5,22,-38];
/** Director beats (lib/plays/riso/director.ts, Oct 4 2026): a short establishing wide of the bowl, then follow Messi at the control, push
 * in low for the turn and the nutmeg (the touches being taught), pull back out for the run down the right (the space he runs into), push in
 * again round the keeper, and hold on the celebration. */
const B1=beats([[0,'wide'],[.8,{from:'follow',dur:2}],[CUEW(0,'turns past one')-.35,'tight'],[CUEW(0,'past him again')+.4,'follow'],
 [CUEW(0,'away down the right')-.2,{from:'space',size:.26}],[CUEW(0,'into the box')-.2,'follow'],[CUEW(0,'round the keeper')-.45,'tight'],[CUEW(0,'goal')+.35,'reaction']]);
function cam1Pin(t:number){const c=cam1Authored(t),tau=tau1(t),[x,z]=posOf(0,tau),sh=shotAt(t,B1);
 const foes:V3[]=[];ACTORS.forEach((a,k)=>{if(a.role==='def'||a.role==='gk'){const[fx,fz]=posOf(k,tau);foes.push([fx,0,fz]);}});
 return reframe({eye:c.C,target:c.T,F:c.F},{hero:[x,0,z],ball:ballAt(tau),keep:near([x,0,z],foes,3.5,7)},sh,DV);}
/** steady(): averaged over ±.35 s (3 samples), so a defender coming into range never snaps the frame */
function cam1(t:number):Cam3{const r=steady(t,cam1Pin,.35,3);return look(r.eye,r.target,r.F);}
function cam1Authored(t:number):Cam3&{T:V3}{
 const tR=CUEW(0,'gets the ball'),tG=CUEW(0,'goal'),S=SECS(0),tau=tau1(t);
 const bs=(u:number):V3=>{const b=ballAt(u);return[b[0],0,b[2]];},b0=bs(tau),b1=bs(tau-.35),b2=bs(tau-.7),bt:V3=[(b0[0]+b1[0]+b2[0])/3,0,(b0[2]+b1[2]+b2[2])/3];
 const open:V3=[58,0,34],m=posOf(0,tau),cel:V3=[m[0]-2,0,m[1]];
 const toBall=sm(0,tR-.3,t,easeInOutSine),toMessi=sm(tG+.4,tG+1.4,t,easeInOutSine);
 const tb:V3=[lerp(open[0],bt[0],toBall),0,lerp(open[2],lerp(bt[2],25,.2),toBall)],T:V3=[lerp(tb[0],cel[0],toMessi),lerp(9,4.4,toBall)*(1-toMessi)+1.2*toMessi,lerp(tb[2],cel[2],toMessi)];
 const F=key(t,[[0,1700],[tR-.4,4300],[tR+4,4500],[tG-2.6,5300],[tG,5500],[tG+1.4,7200],[S,7600]],easeInOutSine);
 return{...look(CAM1,T,F),T};
}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),tau=tau1(t),tp=tau1(twos(t)),tG=CUEW(0,'goal');
  stadium(s,c,v,t,{roar:sm(tG+.2,tG+.7,t),flash:sm(tG+.3,tG+.5,t)});
  ground(s,c,{bulge:bulgeAt(tau),ballZ:NET[2]});
  play(s,c,v,tau,tp,{low:true,minBall:9,dtau:.1});
 },
 aperture(t){const c=cam1(t),tau=tau1(t),[x,z]=posOf(0,tau),q=toCam(c,[x,0,z]),g=scr(c,q),h=c.F*(MESSI.st.build?.height??1.8)/q[2];return apertureDisc(g[0],g[1]-h*.6,Math.max(6,h*.08),12);},
 still:9,
};

// ---------------------------------------------------------------- 2 · replay: low and close, slow motion (Belenguer → Luis García → the finish)
const tau2=(t:number)=>key(t,[[0,7.05],[CUEW(1,'A last burst')+.6,7.9],[CUEW(1,'goes round'),10.35],[CUEW(1,'scores')+.3,SHOT+.05],[SECS(1),IN_NET+.4]],linear);
function cam2(t:number):Cam3{const m=smooth(0,tau2(t)),e=sm(10.8,IN_NET,tau2(t),easeInOutSine),C:V3=[m[0]-6.5+2.5*e,1.7,m[1]-10.5+1.5*e],T:V3=[m[0]+3+e*2,1.05,m[1]+2+e*4];return look(C,T,3000);}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),tau=tau2(t),tp=tau2(twos(t));
  stadium(s,c,v,t,{roar:sm(IN_NET,IN_NET+.3,tau)});
  ground(s,c,{bulge:bulgeAt(tau),ballZ:NET[2]});
  play(s,c,v,tau,tp,{minBall:5,smear:true,dtau:.04});
 },
 aperture(t){const c=cam2(t),b=ballAt(tau2(t)),q=toCam(c,b),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.1/q[2]),12);},
 still:6,
};

// ---------------------------------------------------------------- 3 · the lesson: close, slow replay of the first touches, then the change of pace
const tau3=(t:number)=>key(t,[[0,.15],[CUEW(2,'small'),1.95],[CUEW(2,'sudden'),3.75],[SECS(2),5.3]],linear);
function cam3(t:number):Cam3{const m=smooth(0,tau3(t)),C:V3=[m[0]-2.6,1.25,m[1]-7.2],T:V3=[m[0]+1.8,.8,m[1]+.6];return look(C,T,2500);}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),tau=tau3(t),tp=tau3(twos(t)),a=CUEW(2,'small'),b=CUEW(2,'sudden');
  stadium(s,c,v,t);
  ground(s,c);
  play(s,c,v,tau,tp,{minBall:5,smear:true,dtau:.04,ring:sm(a-.1,a+.35,t,easeOutBack)*(1-sm(b,b+.5,t))});
 },
 still:5,
};

const film:RisoStory={
 id:'messi-getafe-2007',format:'11v11',title:"Messi's solo goal v Getafe",theme:'Dribbling: small quick touches and changes of pace',
 ageNote:'Copa del Rey semi-final, Camp Nou, 18 April 2007. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3]);},
 /** Touch: a turf kick — grass bits and paper flecks thrown up, a yellow touch spark. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}spray(s,x,y,age,seed,2.2);tap(s,x,y-20,age*.8,seed+1,110);},
};
export default film;
