/** John Terry — SIGNATURE: "the brave block" (lib/town/iconicPlays.json: "Stay on your feet and put your body between the ball and the
 * goal."), shown through ONE real, well-documented moment: his header off the line from Ryan Giggs's shot, Manchester United 1–1 Chelsea
 * (United won 6–5 on penalties), UEFA Champions League final, Luzhniki Stadium, Moscow, Wednesday 21 May 2008 (22:45 local kick-off, a wet
 * night), extra time — about the 102nd minute. An iconic-play riso film (RisoStory, chapters mode) played by the card's picture window
 * (components/CardFilmPlayer.tsx) or StoryFilmPlayer. A 1:1 reconstruction from WRITTEN accounts (the footage itself was not reviewed),
 * rendered as a riso print.
 *
 * WHY THIS MOMENT: the signature is the brave block — the defender who gets his body between the ball and the goal. With Petr Čech beaten,
 * Terry, "wrong-footed", recovered to the goal line and "stretched every sinew to block the ball with his big thick head" (Guardian), in the
 * biggest club match of his career; the BBC's radio summariser called it "top class defending from John Terry". It is the block most
 * written about in the match reports, in a final (not a highlight reel), and every beat of it is on paper.
 *
 * SOURCES (read Sept 2026, cached in scratchpad/films/src-cache/ — no new fetches were needed):
 *  - Wikipedia, "2008 UEFA Champions League final" (date, 20:45 CEST = 22:45 Moscow, Luzhniki, 67,310, referee Ľuboš Micheľ; line-ups
 *    with numbers; the kit boxes; "then Giggs stabbed the ball left-footed towards goal instead of sweeping it with his weaker right foot,
 *    only to see it headed off the line by Terry") https://en.wikipedia.org/wiki/2008_UEFA_Champions_League_final   [wiki-2008-ucl-final.txt]
 *  - The Guardian, Barry Glendenning, "Man Utd v Chelsea — as it happened", 21 May 2008, extra time, 9th minute: "Patrice Evra slaloms
 *    through the Chelsea penalty area and brilliantly pulls the ball back for Giggs, who shoots. With Cech beaten, the wrong-footed John
 *    Terry stretches every sinew to block the ball with his big thick head. Marvellous defending"   [guardian-mbm-manutd-chelsea-2008.txt]
 *  - The Guardian, "Champions League final: key moments", 22 May 2008: "102min Patrice Evra pulls back from the byline for Ryan Giggs, but
 *    his lofted shot is blocked superbly by John Terry with his head"; Drogba "leaves the pitch ... in the pouring rain" (115')
 *    [guardian-keymoments-2008.txt]
 *  - BBC Sport live text, 21 May 2008, 21:51 BST: "Patrice Evra rampages down the left and cuts the ball back for Ryan Giggs whose shot is
 *    brilliantly headed behind by John Terry for a corner. As Terry receives congratulations from some relieved team-mates, Wayne Rooney comes
 *    off ... and Nani is on"; 21:55 "Top class defending from John Terry" (Stan Collymore, 5 Live); 22:00 Ferguson's tracksuit top "to
 *    protect his fancy suit from the rain"   [bbc-7410307.txt]
 * CONFIRMED by those accounts: the match, place, date and night kick-off; extra time (ET 9' / 102'), 1–1; rain in extra time; Evra (United
 *  No. 3, left-back) went down the LEFT and through the box, pulled the ball back from the byline; Giggs (No. 11, on as a substitute) hit it
 *  LEFT-footed, a stabbed, LOFTED shot; Čech (No. 1) was beaten; Terry (No. 26, captain) had been wrong-footed, recovered and blocked /
 *  headed it off the line with his HEAD, behind for a CORNER; team-mates congratulated him; Rooney (No. 10) was still on and was replaced by
 *  Nani straight after; kits: United red shirts, white shorts, white socks; Chelsea all blue (white trim); the other numbers used here
 *  (Chelsea: Essien 5, Carvalho 6, A. Cole 3, Makélélé 4, Ballack 13; United: Tevez 32).
 * INFERRED (illustrative, not named in the narration): which end of the stadium and so the camera side (United attack +x, Evra's left
 *  wing is the far touchline); every position and run (Evra's exact slalom, where Terry was when he was wrong-footed — here drawn toward the
 *  near post and Evra — and his recovery path); Evra's pull-back with his left foot; Čech covering his near post and diving back across;
 *  the exact height and spot of the header (≈ 2 m, in the far half of the goal, ≈ 1.2 m from the middle) and the ball's flight over the bar; that Terry
 *  heads it standing with a small spring rather than a dive (the mechanics of heading on the line: the film's "stays on his feet"); the
 *  keeper kits (Čech yellow with his dark head guard), where the other players stood (extras are drawn small and mostly unnumbered);
 *  hair; the Luzhniki as drawn (running track, bowl, roof ring, floodlights), crowd colours and flags, the look of the rain.
 *
 * FRAMING (the TV broadcast, never top-down; full-sheet card window 1.45:1 down to square, never sheet.safe): 1 = live, the high
 * main-stand camera in near real time (Moscow in the rain → Evra down the left and into the box → the pull-back → Giggs's lofted shot over
 * Čech → Terry's header off the line → the relieved team-mates); 2 = the slow-motion replay LOW along the goal line from the near post side:
 * a red arrow the wrong way (wrong-footed), a yellow arrow back to the line, rings under his planted boots (on his feet), the sight line to
 * the ball, the burst on his forehead and the ball's flight behind for a corner; 3 = the lesson from behind the shooter: the keeper
 * beaten, the recovery run, a yellow SHOOTING LANE from the ball to the goal with Terry stepping into it, the boot rings, the brave header
 * and a big tick. Every body goes through ONE adapter, drawPlayer() → athlete.ts (continuous silhouettes, FK skeleton, `prev` secondary
 * motion, motion smears on the fast moves); small figures and every figure inside a passage print at `low` detail. Handedness: the world is
 * right-handed like athlete.ts (x toward the Chelsea goal line at x = 0, y up, +z = the near / main-stand side), so a player facing +x has his
 * right at +z: Evra and Giggs strike with foot 'l' with no mirrored projector; Čech and Terry face −x, so their left is +z. Poses on twos,
 * cameras on ones, all randomness seeded, every action keyed to cue times (withTiming swaps in the recorded word onsets).
 *
 * LEAD: when public/plays/narration/terry-signature/timing.json exists, replace the null in the VOICE constant below with
 *   import timingJson from '../../../public/plays/narration/terry-signature/timing.json';  (and `timingJson as NarrationTiming`). */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,partial,smoothPts,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,runCycle,backpedal,dribble,strike,keeperSet,keeperDive,stand,posed,blendPose,keyPoses,celebrate,
 STRIKE_CONTACT,type Pose,type Camera,type AthleteStyle,type InkFill,type Place,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES (≈2.7 words/s + punctuation pauses) until the Kokoro voice exists. withTiming matches a cue by its FIRST word, in
 * order — so no cue starts with a word that also appears between it and the previous cue. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'Extra time, live',text:'Moscow, 2008, in the rain. Champions League final, extra time. Patrice Evra dances down the left and pulls it back. Ryan Giggs shoots over the keeper... John Terry heads it off the line!',tail:2.2,
  cues:['Moscow','in the rain','Champions League','extra time','Patrice Evra','dances','pulls it back','Ryan Giggs','shoots','over the keeper','John Terry','off the line']},
 {label:'Watch again',text:'Watch again, slowly. Terry was caught on the wrong foot, but he never gives up. He races back to the line, stays on his feet and stretches up. Header, behind for a corner!',tail:1.8,
  cues:['Watch again','wrong foot','never gives up','races back','stays on','stretches up','Header','behind for a corner']},
 {label:'Your turn',text:'Your turn. When your keeper is beaten, get back between the ball and the goal. Stay on your feet and be brave!',tail:2.2,
  cues:['Your turn','keeper is beaten','get back','between the ball','Stay on your feet','be brave']},
];
import timingJson from '../../../public/plays/narration/terry-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (calibrated on the voiced films, ≈2.3 words/s): .2 s + .02 s a letter per word, pauses after , . ! ? : ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.2+.02*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.18;if(/[.!?]$/.test(w))t+=.34;if(/\.\.\.$/.test(w))t+=.28;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('terry: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('terry: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
/** key() needs increasing times: push each key at least `gap` after the previous one (real voice timings can crowd authored offsets) */
function mono(K:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of K)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}

// ---------------------------------------------------------------- inks, vectors
const Y='yellow',R='red',B='blue',K='navy';
const add3=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const mix3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const arc3=(a:V3,b:V3,u:number,lift:number):V3=>{const p=mix3(a,b,u);p[1]+=lift*4*u*(1-u);return p;};
const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const wrap=(a:number)=>{while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;return a;};
const lerpAng=(a:number,b:number,u:number)=>a+wrap(b-a)*clamp(u);
/** yaw (athlete.ts convention: 0 faces +x, + turns left) that faces along the ground direction (dx,dz) */
const yawOf=(dx:number,dz:number)=>Math.atan2(-dz,dx);
/** a narrower (square) window gets a slightly wider lens so the action still fits; set by frame(), read by every camera */
let LENS=1;
/** Frame the FULL sheet: world (0,0) on the canvas centre at 1 unit per sheet unit (the passage arrival scale still multiplies in). */
function frame(s:Sheet){const S=s.arrival;s.camera((s.cx-s.W/2)/S,(s.cy-s.H/2)/S,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
/** half the visible extents with margin for the .68 passage preview */
const view=(s:Sheet)=>({hx:s.W/(2*.68)+120,hy:s.H/(2*.68)+120});

// ---------------------------------------------------------------- 3D: projection through an athlete.ts Camera (right-handed metres, y up)
type Cam=Camera;
const NEAR=.4;
function toCam(c:Cam,P:V3):V3{const d:V3=[P[0]-c.eye[0],P[1]-c.eye[1],P[2]-c.eye[2]];return[dot3(d,c.r),dot3(d,c.u),dot3(d,c.f)];}
const scr=(c:Cam,q:V3):Pt=>[c.center[0]+c.F*q[0]/q[2],c.center[1]-c.F*q[1]/q[2]];
function pr(c:Cam,P:V3):Pt|null{const q=toCam(c,P);return q[2]<NEAR?null:scr(c,q);}
const kAt=(c:Cam,P:V3)=>c.F/Math.max(NEAR,toCam(c,P)[2]);
function polyP(c:Cam,pts:V3[]):Pt[]{const q=pts.map(p=>toCam(c,p)),out:V3[]=[];
 for(let i=0;i<q.length;i++){const a=q[i],b=q[(i+1)%q.length],ia=a[2]>=NEAR,ib=b[2]>=NEAR;if(ia)out.push(a);if(ia!==ib){const k=(NEAR-a[2])/(b[2]-a[2]);out.push([a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,NEAR]);}}
 return out.map(p=>scr(c,p));}
const addPoly=(path:Path2D,q:Pt[])=>{if(q.length>2)path.addPath(polyPath(q,true));};
/** a 3D segment as a projected quad (clipped to the near plane); width in metres */
function seg3(c:Cam,a:V3,b:V3,wm:number,out:Path2D,minW=1.1){let qa=toCam(c,a),qb=toCam(c,b);if(qa[2]<NEAR&&qb[2]<NEAR)return;
 const cut=(p:V3,q:V3):V3=>{const k=(NEAR-p[2])/(q[2]-p[2]);return[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k,NEAR];};if(qa[2]<NEAR)qa=cut(qa,qb);else if(qb[2]<NEAR)qb=cut(qb,qa);
 const A=scr(c,qa),Bp=scr(c,qb),wa=Math.max(minW,c.F*wm/qa[2]/2),wb=Math.max(minW,c.F*wm/qb[2]/2),dx=Bp[0]-A[0],dy=Bp[1]-A[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 out.moveTo(A[0]+nx*wa,A[1]+ny*wa);out.lineTo(Bp[0]+nx*wb,Bp[1]+ny*wb);out.lineTo(Bp[0]-nx*wb,Bp[1]-ny*wb);out.lineTo(A[0]-nx*wa,A[1]-ny*wa);out.closePath();}
const cam3=(pos:V3,target:V3,fov:number)=>makeCamera({pos,target,fov,size:1080*LENS});

// ---------------------------------------------------------------- the Luzhniki at night, in the rain: a soaked navy sky, the bowl, roof ring, floodlights
/** stand planes (a along, b up the rake 0..1), set back past the running track: 0 the far side (z<0), 1 behind the Chelsea goal (x>0),
 * 2 the main stand (z>0, the camera side), 3 the far end */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-120,15,a),1.2+28*b,-46-34*b],
 (a,b)=>[14+31*b,1.2+28*b,lerp(-62,62,a)],
 (a,b)=>[lerp(15,-120,a),1.2+24*b,46+30*b],
 (a,b)=>[-119-31*b,1.2+28*b,lerp(62,-62,a)],
];
const STAND_COLS=[110,74,110,74],STAND_ROWS=14,WALK=.47;
/** crowd colour mix per stand: [paper, red, blue, yellow] cumulative thresholds (both sets of fans: red and white, blue) */
const CROWD:[number,number,number][]=[[.42,.66,.97],[.36,.6,.97],[.42,.66,.97],[.36,.6,.97]];
/** flags on the stand fronts: [stand, a, kind] kind 0 = United (red, a paper band), 1 = Chelsea (blue, a paper band) */
const FLAGS:[number,number,number][]=[[0,.5,1],[0,.62,0],[0,.76,1],[1,.2,1],[1,.36,0],[1,.52,1],[1,.68,1],[1,.84,0],[2,.14,1],[2,.3,0],[3,.3,0],[3,.46,1],[3,.62,0],[3,.76,0]];
/** floodlight lamps along the roof lip (world points), for the lamps and their glints on the wet grass */
function lampPts(which:number[]):V3[]{const o:V3[]=[];for(const i of which){const S=STANDS[i];for(let k=0;k<7;k++)o.push(add3(S((k+.5)/7,.3),[0,23.6,0]));}return o;}
const LAMPS_ALL=lampPts([0,1,2,3]);
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t),Bnd=Math.max(s.W,s.H)*2;
 s.field(B,.5,.6);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]))?.[1]??0;
 s.tone(K,polyPath([[-Bnd,-Bnd],[Bnd,-Bnd],[Bnd,Bnd],[-Bnd,Bnd]],true),.5);
 s.tone(K,polyPath([[-Bnd,-Bnd],[Bnd,-Bnd],[Bnd,hz-560],[-Bnd,hz-460]],true),.34);
 const planes=new Path2D(),walk=new Path2D(),roof=new Path2D(),edge=new Path2D();
 for(const i of which){const S=STANDS[i],q=polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]);addPoly(planes,q);
  seg3(c,S(0,WALK),S(1,WALK),.45,walk);
  addPoly(roof,polyP(c,[add3(S(0,1),[0,2,0]),add3(S(1,1),[0,2,0]),add3(S(1,.3),[0,24.5,0]),add3(S(0,.3),[0,24.5,0])]));
  seg3(c,add3(S(0,.3),[0,24.3,0]),add3(S(1,.3),[0,24.3,0]),.45,edge);}
 s.knockout(planes);s.tone(K,planes,.56);s.tone(R,planes,.16);s.knockout(walk,.4);
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si],mix=CROWD[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(Math.abs(b-WALK)<.045)continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,5);if(h<.3)continue;const a=(i+.5+(hash(i+j*31,9)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const u=(h-.3)/.7,ink=u<mix[0]?0:u<mix[1]?1:u<mix[2]?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.62);s.fill(R,inks[1],.95);s.fill(B,inks[2],.95);s.fill(Y,inks[3],.9);
 s.knockout(roof);s.tone(K,roof,.66);s.tone(B,roof,.3);s.knockout(edge,.8);
 const fl=new Path2D(),rd=new Path2D(),bl=new Path2D(),band=new Path2D();
 for(const[si,a,kind] of FLAGS){if(!which.includes(si))continue;const S=STANDS[si],w=.03,P=(u:number,b:number)=>S(a+u*w,b);
  const q=polyP(c,[P(0,.005),P(1,.005),P(1,.08),P(0,.08)]);if(q.length<3)continue;(kind===0?rd:bl).addPath(polyPath(q,true));fl.addPath(polyPath(q,true));
  addPoly(band,polyP(c,[P(0,.034),P(1,.034),P(1,.05),P(0,.05)]));}
 s.knockout(fl);s.fill(R,rd,.95);s.fill(B,bl,.95);s.knockout(band,.9);
 const lamp=new Path2D(),halo=new Path2D();for(const i of which){const S=STANDS[i];for(let k=0;k<7;k++){const u=(k+.5)/7,a=add3(S(u-.03,.3),[0,23.6,0]),b=add3(S(u+.03,.3),[0,23.6,0]);if(toCam(c,a)[2]<NEAR+2)continue;seg3(c,a,b,1.1,lamp);seg3(c,a,b,5.5,halo);}}
 s.tone(Y,halo,.3);s.knockout(lamp);s.fill(Y,lamp,.85);
 if(flash>0){const p=new Path2D(),n=Math.round(22*flash);for(let i=0;i<n;i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,STANDS[si](r2,.1+.8*hash(i,Math.floor(tt*12))));if(!q)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
// ---------------------------------------------------------------- the running track, the soaked grass (lamp glints), lines, boards, the goal
function ground(s:Sheet,c:Cam,o:{goal?:boolean}={}){
 const tr=polyP(c,[[-119,0,-46],[14,0,-46],[14,0,46],[-119,0,46]]);if(tr.length<3)return;const tp=polyPath(tr,true);
 s.knockout(tp);s.tone(R,tp,.5);s.tone(K,tp,.3);
 const g=polyP(c,[[-110,0,-39],[5,0,-39],[5,0,39],[-110,0,39]]),gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.85);s.tone(B,gp,.84);s.tone(K,gp,.22);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]));s.tone(K,st,.13);
 // the wet sheen: every lamp mirrored in the soaked turf — a long glint stretched toward the lens
 {const gl=new Path2D(),e=c.eye;
  for(const L of LAMPS_ALL){const Lm:V3=[L[0],-L[1],L[2]],k=e[1]/(e[1]-Lm[1]),Q:V3=[e[0]+(Lm[0]-e[0])*k,0,e[2]+(Lm[2]-e[2])*k];
   if(Q[0]<-108||Q[0]>4||Math.abs(Q[2])>37)continue;const toward:V3=[e[0]-Q[0],0,e[2]-Q[2]],tl=Math.hypot(toward[0],toward[2])||1,len=Math.min(9,tl*.25);
   const a=pr(c,add3(Q,[-toward[0]/tl*len*.4,0,-toward[2]/tl*len*.4])),b=pr(c,add3(Q,[toward[0]/tl*len,0,toward[2]/tl*len]));if(!a||!b)continue;
   const w=clamp(kAt(c,Q)*.35,2.4,9);gl.addPath(ribbon([a,b],w,{taper:.9,pressure:.4,wobble:0}));}
  s.knockout(gl,.5);s.tone(Y,gl,.35);}
 // puddles in the goalmouth and round the six-yard box
 const pd=new Path2D();for(let i=0;i<9;i++){const cx=-2.5-hash(i,71)*9,cz=(hash(i,72)-.5)*12,rx=.5+hash(i,73)*1.1,rz=.3+hash(i,74)*.7,pts:V3[]=[];
  for(let k=0;k<12;k++){const a=k/12*TAU;pts.push([cx+Math.cos(a)*rx,0,cz+Math.sin(a)*rz]);}addPoly(pd,polyP(c,pts));}
 s.knockout(pd,.22);s.tone(B,pd,.3);
 // LED boards behind the goal and along both touchlines
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([5.5,0,-36],[5.5,0,36]);board([-108,0,-38],[5.5,0,-38]);board([-108,0,38],[5.5,0,38]);
 for(let k=0;k<11;k++){const z=-34+k*6.3;addPoly(pn,polyP(c,[[5.4,.25,z],[5.4,.25,z+3.4],[5.4,.7,z+3.4],[5.4,.7,z]]));}
 for(const zz of[-37.9,37.9])for(let k=0;k<17;k++){const x=-106+k*6.4;addPoly(pn,polyP(c,[[x,.25,zz],[x+3.4,.25,zz],[x+3.4,.7,zz],[x,.7,zz]]));}
 s.knockout(bd);s.fill(K,bd,.9);s.knockout(pn,.8);s.fill(R,pn,.8);s.fill(Y,pn,.5);
 // painted lines
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
 for(let k=0;k<8;k++){L([-k*13.125,0,-34],[-(k+1)*13.125,0,-34]);L([-k*13.125,0,34],[-(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){L([0,0,-34+k*17],[0,0,-34+(k+1)*17]);L([-52.5,0,-34+k*17],[-52.5,0,-34+(k+1)*17]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(-52.5,0,9.15);
 L([0,0,-20.16],[-16.5,0,-20.16]);L([-16.5,0,-20.16],[-16.5,0,20.16]);L([-16.5,0,20.16],[0,0,20.16]);
 L([0,0,-9.16],[-5.5,0,-9.16]);L([-5.5,0,-9.16],[-5.5,0,9.16]);L([-5.5,0,9.16],[0,0,9.16]);
 {const a=Math.acos(5.5/9.15);circ(-11,0,9.15,Math.PI-a,Math.PI+a,12);}
 {const d:V3[]=[];for(let i=0;i<12;i++){const a=i/12*TAU;d.push([-11+Math.cos(a)*.15,0,Math.sin(a)*.15]);}addPoly(ln,polyP(c,d));}
 circ(0,34,1,Math.PI/2,Math.PI,5);circ(0,-34,1,Math.PI,1.5*Math.PI,5);
 s.knockout(ln,.9);
 // corner flags (navy poles, blue flags) at the Chelsea end
 const pole=new Path2D(),flag=new Path2D();
 for(const z of [34,-34]){seg3(c,[0,0,z],[0,1.55,z],.05,pole);const a=pr(c,[0,1.55,z]),b=pr(c,[-.45,1.4,z]),e=pr(c,[0,1.2,z]);if(a&&b&&e)flag.addPath(polyPath([a,b,e],true));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(B,flag,.95);
 if(o.goal!==false)goal3(s,c);
}
/** the Chelsea goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep with a sloping roof */
const GOAL={x:0,z0:-3.66,z1:3.66,h:2.44};
function goal3(s:Sheet,c:Cam,veil=.28){
 const X=0,z0=-3.66,z1=3.66,H=2.44,bx=2;
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[bx,1.9,z0],[bx,0,z0]],[[X,0,z1],[X,H,z1],[bx,1.9,z1],[bx,0,z1]],[[X,H,z0],[X,H,z1],[bx,1.9,z1],[bx,1.9,z0]],[[bx,0,z0],[bx,0,z1],[bx,1.9,z1],[bx,1.9,z0]]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,veil);s.tone(K,net,.12*veil/.28);
 const mesh=new Path2D();
 for(let i=0;i<=14;i++){const z=lerp(z0,z1,i/14);seg3(c,[X,H,z],[bx,1.9,z],.022,mesh,.7);seg3(c,[bx,1.9,z],[bx,0,z],.022,mesh,.7);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;seg3(c,[bx,y,z0],[bx,y,z1],.022,mesh,.7);seg3(c,[X,y*H/1.9,z0],[bx,y,z0],.022,mesh,.7);seg3(c,[X,y*H/1.9,z1],[bx,y,z1],.022,mesh,.7);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+2*u,H-.54*u,z0],[X+2*u,H-.54*u,z1],.022,mesh,.7);}
 s.fill(K,mesh,.7);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.2,fo);seg3(c,[X,0,z1],[X,H,z1],.2,fo);seg3(c,[X,H,z0-.04],[X,H,z1+.04],.2,fo);
 s.fill(K,fo,.9);s.knockout(fr);
}
// ---------------------------------------------------------------- rain + spray
/** screen-space rain: seeded streaks falling on the slant (slow motion shortens them into drops); drawn over everything as paper */
function rain(s:Sheet,t:number,o:{n?:number;len?:number;speed?:number;cov?:number;seed?:number;w?:number}={}){
 const{n=110,len=48,speed=1500,cov=.5,seed=3,w=2.2}=o,v=view(s),H=2*v.hy,W=2*v.hx,sl=.22,p=new Path2D(),tt=twos(t);
 for(let i=0;i<n;i++){const sp=speed*(.8+.4*hash(i,seed+2)),y=((hash(i,seed+1)*H+tt*sp)%H+H)%H-v.hy,x=(hash(i,seed)-.5)*W+(y+v.hy)*sl*.4,l=len*(.6+.8*hash(i,seed+3));
  p.moveTo(x-w/2,y);p.lineTo(x+w/2,y);p.lineTo(x+w/2+sl*l,y+l);p.lineTo(x-w/2+sl*l,y+l);p.closePath();}
 s.knockout(p,cov);
}
/** water flung off a point (the ball off his forehead, a plant): droplets on ballistic arcs, age in seconds */
function spray(s:Sheet,c:Cam,P:V3,age:number,o:{n?:number;v?:number;up?:number;dir?:V3;seed?:number;size?:number}={}){
 if(age<0||age>.7)return;const{n=12,v=3,up=1.6,dir=[0,0,0],seed=1,size=.035}=o,p=new Path2D(),fade=1-clamp((age-.35)/.35);
 for(let i=0;i<n;i++){const a=hash(i,seed)*TAU,sp=v*(.5+.7*hash(i,seed+1)),vy=up*(.4+hash(i,seed+2)),Q:V3=[P[0]+(Math.cos(a)*sp+dir[0])*age,Math.max(.01,P[1]+vy*age-4.9*age*age),P[2]+(Math.sin(a)*sp+dir[2])*age],q=pr(c,Q);if(!q)continue;
  const r=Math.max(1.6,kAt(c,Q)*size*(1-.4*age));p.moveTo(q[0]+r,q[1]);p.arc(q[0],q[1],r,0,TAU);}
 s.knockout(p,.9*fade);s.tone(B,p,.3*fade);
}

// ---------------------------------------------------------------- kits (athlete styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.28],[B,.08]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.2]];
/** Manchester United: red shirts, white shorts, white socks (confirmed kit box); paper numbers */
const united=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,shorts:'paper',socks:'paper',boots:K,skin:SKIN_L,hair:[K,.85],line:K,trim:K,numberInk:'paper',hairStyle:'short',sleeves:'short',...o});
/** Chelsea: all blue with white trim (confirmed kit box); paper numbers */
const chelsea=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[B,.95],shorts:[B,.95],socks:[B,.95],boots:K,skin:SKIN_L,hair:[K,.85],line:K,trim:'paper',numberInk:'paper',hairStyle:'short',sleeves:'short',...o});
/** John Terry: No. 26 (confirmed), 1.87 m, a centre-back's build; short dark hair (inferred) */
const TERRY_B={height:1.87,bulk:1.06,thighs:1.06};
const TERRY_ST=chelsea({number:26,build:TERRY_B,hair:[K,.9],seed:26});
/** Petr Čech: No. 1 (confirmed), 1.96 m; the yellow keeper kit and his dark head guard are inferred (drawn as a close navy cap) */
const CECH_ST:AthleteStyle={shirt:[Y,.95],shorts:[Y,.95],socks:[Y,.95],boots:K,skin:SKIN_L,hair:[K,.95],line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',number:1,numberInk:K,build:{height:1.96},seed:17};
const EVRA_B={height:1.75,bulk:.98},GIGGS_B={height:1.8,bulk:.96};
const EVRA_ST=united({number:3,skin:SKIN_D,hair:[K,.95],build:EVRA_B,seed:3});
const GIGGS_ST=united({number:11,hair:[K,.8],hairStyle:'curly',build:GIGGS_B,seed:11});

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete: fluid FK body, kit inks, halftone shade, key line).
 * prev = the pose one drawing earlier (secondary motion: the hem trails); smear = a halftone echo + speed lines for fast moves. */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,o:{prev?:Pose;prevPlace?:Place;smear?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{prevPlace:o.prevPlace,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev,prevPlace:o.prevPlace}:{});
}

// ---------------------------------------------------------------- the play (T = play seconds; T = 0 = Giggs's left foot meets the ball)
const T_PASS=-.95,T_SAVE=.95,T_OVER=T_SAVE+.34,T_DOWN=T_SAVE+1.2;
type Role='terry'|'cech'|'evra'|'giggs'|'che'|'utd';
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];key?:boolean};
/** Positions are Hermite-interpolated between keys [T, x, z]. Only Evra, Giggs, Čech and Terry have beats in the accounts; everyone else
 * is an illustrative marker (numbers from the line-ups, positions inferred). */
const ACTORS:Actor[]=[
 {name:'Terry',role:'terry',style:TERRY_ST,key:true,keys:[[-9,-9,-1.2],[-6,-7.6,-1.8],[-3.6,-6.2,-3],[-1.8,-4.9,-4.1],[-.95,-4.3,-4.5],[-.55,-3.7,-3.7],[0,-2.5,-2],[.5,-1.25,.25],[.82,-.56,1.1],[T_SAVE,-.46,1.25],[1.5,-.42,1.3],[2.6,-1.3,.8],[4,-2.6,-.6],[9,-4,-1]]},
 {name:'Čech',role:'cech',style:CECH_ST,key:true,keys:[[-9,-.9,-.4],[-4,-.9,-1.4],[-2,-.75,-2.4],[-.95,-.7,-2.85],[-.45,-1.1,-2.5],[-.05,-1.3,-2.25],[9,-1.3,-2.25]]},
 {name:'Evra',role:'evra',style:EVRA_ST,key:true,keys:[[-9,-31,-19],[-6,-24.5,-17.2],[-4.5,-19.2,-15],[-3.4,-14.6,-11.8],[-2.5,-10.6,-13.4],[-1.7,-6.6,-11.6],[-1.2,-4.4,-10.6],[T_PASS,-3.4,-10.1],[-.4,-2.2,-9.6],[1,-1.6,-9],[3,-2.2,-7.6],[9,-4,-5]]},
 {name:'Giggs',role:'giggs',style:GIGGS_ST,key:true,keys:[[-9,-27,-5],[-6,-21,-4.4],[-3,-15.2,-3.4],[-1.5,-12.4,-2.6],[-.5,-10.8,-1.9],[0,-10.1,-1.55],[.6,-9.5,-1.3],[2,-8.6,-1],[9,-8,-.5]]},
 {name:'Essien',role:'che',style:chelsea({number:5,skin:SKIN_D,hair:[K,.95],hairStyle:'bald',build:{height:1.78,bulk:1.04},seed:5}),keys:[[-9,-32,-16.5],[-6,-26,-15.6],[-4.5,-20.6,-13.8],[-3.4,-16.2,-11.2],[-2.5,-12.4,-12],[-1.7,-8.6,-10.8],[-1,-6,-9.8],[0,-4.4,-8.8],[3,-3.2,-7],[9,-3,-5]]},
 {name:'Carvalho',role:'che',style:chelsea({number:6,skin:SKIN_M,build:{height:1.83},seed:6}),keys:[[-9,-16,.5],[-4,-11,-1],[-1.5,-7.8,-2.2],[0,-7.4,-2],[2,-6.8,-1.4],[9,-6,-1]]},
 {name:'A. Cole',role:'che',style:chelsea({number:3,skin:SKIN_D,build:{height:1.76,bulk:.96},seed:33}),keys:[[-9,-15,9],[-4,-9,6],[-1.5,-6,4.6],[0,-4.6,3.8],[2,-3.4,2.6],[9,-3,2]]},
 {name:'Makélélé',role:'che',style:chelsea({number:4,skin:SKIN_D,hairStyle:'bald',build:{height:1.74},seed:4}),keys:[[-9,-24,-2],[-4,-17.5,-2.4],[-1.5,-13.2,-1.4],[0,-12,-.9],[2,-11.2,-.6],[9,-10,0]]},
 {name:'Ballack',role:'che',style:chelsea({number:13,build:{height:1.89},seed:13}),keys:[[-9,-28,-10],[-4,-21,-8],[-1,-16,-6],[2,-13,-4],[9,-11,-3]]},
 {name:'Rooney',role:'utd',style:united({number:10,hairStyle:'bald',build:{height:1.76,bulk:1.06},seed:10}),keys:[[-9,-18,4],[-4,-11,3.4],[-1.5,-7.2,2.6],[0,-5.4,2.4],[2,-4.6,2.2],[9,-6,3]]},
 {name:'Tevez',role:'utd',style:united({number:32,skin:SKIN_M,build:{height:1.73,bulk:1.04},seed:32}),keys:[[-9,-22,8],[-4,-15,7],[-1.5,-11.6,6],[0,-10,5.4],[2,-8.6,4.6],[9,-8,4]]},
];
const TERRY_I=0,CECH_I=1,EVRA_I=2,GIGGS_I=3;
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const T0=-9,T1=9,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],T:number)=>{const u=clamp((T-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,T:number):[number,number]=>[samp(TABLES[k].X,T),samp(TABLES[k].Z,T)];
const distOf=(k:number,T:number)=>samp(TABLES[k].D,T);
const velOf=(k:number,T:number):[number,number]=>{const a=posOf(k,T-.08),b=posOf(k,T+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};

// ---------------------------------------------------------------- poses
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:12,rHipA:12,lAnk:-8,rAnk:-8,lean:18,pitch:5,lShA:28,rShA:28,lShF:16,rShF:16,lElb:52,rElb:52,neckP:-10});
/** Terry's header on the line: load (a short dip, arms back), a small spring off BOTH feet — he stays on his feet, no dive — the long
 * stretch up with the neck back so the forehead sends the ball UP and over (contact), then down onto both feet, arms out for balance */
const TH_LOAD=posed({lHipF:48,rHipF:44,lKnee:70,rKnee:66,lAnk:-14,rAnk:-14,lean:20,pitch:6,lShF:-46,rShF:-40,lShA:18,rShA:18,lElb:30,rElb:34,neckP:-18});
const TH_UP=posed({lHipF:4,rHipF:10,lKnee:12,rKnee:18,lAnk:44,rAnk:40,lean:-4,pitch:0,lShF:70,rShF:62,lShA:38,rShA:42,lElb:70,rElb:64,neckP:-30,air:.1});
const TH_HIT=posed({lHipF:-4,rHipF:12,lKnee:10,rKnee:30,lAnk:48,rAnk:44,lean:-14,pitch:-6,lShF:40,rShF:28,lShA:62,rShA:66,lElb:54,rElb:48,neckP:-40,air:.2,squash:.08});
const TH_LAND=posed({lHipF:30,rHipF:36,lKnee:44,rKnee:50,lAnk:-4,rAnk:-2,lean:16,pitch:4,lShF:10,rShF:14,lShA:48,rShA:52,lElb:40,rElb:40,neckP:6,squash:-.08});
const terryHead=(T:number)=>{const u=(T-T_SAVE);return keyPoses(u,[[-.42,READY],[-.24,TH_LOAD],[-.1,TH_UP],[0,TH_HIT],[.32,TH_LAND],[.8,READY]]);};
/** "caught on the wrong foot": weight thrown toward the near post, then a hard plant and push back the other way */
const WRONG=posed({lHipF:30,rHipF:8,lKnee:48,rKnee:22,lHipA:26,rHipA:4,lAnk:-10,rAnk:10,lean:18,pitch:4,bend:-14,roll:-8,lShA:44,rShA:20,lShF:10,rShF:24,lElb:40,rElb:70,neckP:-8,neckY:-20,squash:-.06});
const P_RELIEF=posed({lShA:40,rShA:40,lShF:24,rShF:24,lElb:70,rElb:70,lHipF:10,rHipF:12,lKnee:14,rKnee:16,lean:6,neckP:-8,lHand:1,rHand:1});
/** Čech's dive back across, to HIS left (+z, he faces −x), reaching up: beaten by the loft */
const CECH_DIVE=(T:number)=>keeperDive(clamp((T+.12)/.95),{side:'l',height:.62});

/** Evra's dribble: the touch foot is his left; the pull-back is a left-footed pass (strike, low power) */
const evraStrike=(T:number)=>strike(clamp(STRIKE_CONTACT+(T-T_PASS)/.9),{foot:'l',power:.42});
/** Giggs's stab: a short left-footed swing (low power), contact at T = 0 */
const giggsStrike=(T:number)=>strike(clamp(STRIKE_CONTACT+T/.85),{foot:'l',power:.5});
const EVRA_YAW=yawOf(-9.5+3.4,-1.6+10.1),GIGGS_YAW=yawOf(-.45+10.1,1.25+1.55);
/** the whole pose of actor k at T, with its yaw */
function poseOf(k:number,T:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,T),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,T),b=ballAt(T);
 let yaw=sp>.9?yawOf(v[0],v[1]):yawOf(b[0]-x,b[2]-z);
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 const idle=a.role==='cech'?keeperSet(T*1.3):READY;
 let p:Pose;
 if(sp>.5&&along<-.35*sp)p=blendPose(idle,backpedal(distOf(k,T)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5);p=blendPose(idle,runCycle(distOf(k,T)/3.3,{speed:s}),clamp((sp-.5)/.9));}
 if(a.role==='che'||a.role==='utd'){// markers watch the ball when they are not running hard
  if(sp<3)yaw=lerpAng(yaw,yawOf(b[0]-x,b[2]-z),.6);
  if(a.role==='che'&&T>T_SAVE+.3){const w=sm(T_SAVE+.3,T_SAVE+.8,T)*(1-sm(3.6,4.4,T));if(w>0)p=blendPose(p,P_RELIEF,w*.8);}}
 if(a.role==='evra'){
  if(T<T_PASS-.45)p=blendPose(p,dribble(distOf(k,T)/2.2,{foot:'l',speed:clamp(sp/7)}),clamp((sp-.5)/.9));
  const u=(T-T_PASS)/.9+STRIKE_CONTACT;if(u>0&&u<1.3){p=blendPose(p,evraStrike(T),Math.min(sm(0,.18,u),1-sm(1,1.3,u)));yaw=lerpAng(yaw,EVRA_YAW,sm(T_PASS-.5,T_PASS-.15,T)*(1-sm(T_PASS+.6,T_PASS+1.2,T)));}}
 if(a.role==='giggs'){
  const u=T/.85+STRIKE_CONTACT;if(u>0&&u<1.3){p=blendPose(p,giggsStrike(T),Math.min(sm(0,.16,u),1-sm(1,1.3,u)));yaw=lerpAng(yaw,GIGGS_YAW,sm(-.6,-.2,T));}
  if(T>T_SAVE+.2){const w=sm(T_SAVE+.2,T_SAVE+.7,T);p=blendPose(p,posed({lShA:110,rShA:110,lShF:40,rShF:40,lElb:130,rElb:130,lHand:1,rHand:1,lHipF:8,rHipF:10,lKnee:12,rKnee:14,neckP:-10}),w*(1-sm(2.8,3.4,T)));}}
 if(a.role==='cech'){yaw=lerpAng(Math.PI,yawOf(b[0]-x,b[2]-z),.5);
  if(T>-.12){p=blendPose(p,CECH_DIVE(T),sm(-.12,-.02,T));yaw=Math.PI;}}
 if(a.role==='terry'){
  // before the pull-back he steps across toward Evra and the near post; then the plant (wrong-footed) and the run back to the line
  if(T<-.35)yaw=lerpAng(yawOf(b[0]-x,b[2]-z),yaw,sp>1.2?.35:0);
  const wf=sm(-1.2,-.85,T)*(1-sm(-.55,-.2,T));if(wf>0)p=blendPose(p,WRONG,wf);
  // the recovery: running for the line, he turns his body to face the shot before he gets there
  if(T>-.35&&T<T_SAVE+.3){const face=yawOf(-10-x,-1.5-z);yaw=lerpAng(yaw,face,sm(.3,.72,T));}
  if(T>=T_SAVE+.3)yaw=lerpAng(yawOf(-10-x,-1.5-z),yawOf(-6-x,-3-z),sm(T_SAVE+.8,2.2,T));
  const w=sm(T_SAVE-.5,T_SAVE-.36,T)*(1-sm(T_SAVE+.9,T_SAVE+1.3,T));if(w>0)p=blendPose(p,terryHead(T),w);
  if(T>T_SAVE+1.3){const w2=sm(T_SAVE+1.3,T_SAVE+1.8,T)*(1-sm(3.8,4.6,T));if(w2>0)p=blendPose(p,celebrate(T*.9,{kind:'arms'}),w2*.35);}}
 return{p,yaw};
}

// ---------------------------------------------------------------- the contacts, solved from the bodies; the ball
const FIG=1.04;// figures 4 % over life size so they read in a small card window
function toe(k:number,T:number,foot:'l'|'r'):V3{const{p,yaw}=poseOf(k,T),[x,z]=posOf(k,T),sk=solve(p,ACTORS[k].style.build,{x,z,yaw},FIG),q=foot==='l'?sk.lToe:sk.rToe;return[q[0],.11,q[2]];}
/** Terry's forehead at the header, a ball radius in front of the face */
function forehead(k:number,T:number):V3{const{p,yaw}=poseOf(k,T),[x,z]=posOf(k,T),sk=solve(p,ACTORS[k].style.build,{x,z,yaw},FIG),d:V3=[sk.face[0]-sk.head[0],sk.face[1]-sk.head[1],sk.face[2]-sk.head[2]],l=Math.hypot(d[0],d[1],d[2])||1;return[sk.face[0]+d[0]/l*.11,sk.face[1]+d[1]/l*.11+.03,sk.face[2]+d[2]/l*.11];}
// ballAt is read by poseOf (yaws) before the contacts are solved: until then the ball sits at the defaults
let EVRA_PT:V3=[-3,.11,-9.9],GIGGS_PT:V3=[-9.7,.11,-1.45],HEAD_PT:V3=[-.45,2.1,.36],SOLVED=false;
const OVER=():V3=>[1.35,3.35,HEAD_PT[2]+.3],DOWN=():V3=>[4.3,.11,HEAD_PT[2]+.7];
/** the ball at play time T: at Evra's feet on the dribble, the pull-back along the wet grass, Giggs's lofted stab over Čech, Terry's
 * header up and over the bar, down behind the goal (a corner) */
function ballAt(T:number):V3{
 if(!SOLVED)return GIGGS_PT;
 if(T<T_PASS){const[x,z]=posOf(EVRA_I,T),v=velOf(EVRA_I,T),s=Math.hypot(v[0],v[1])||1,lead=.55+.25*Math.abs(Math.sin(distOf(EVRA_I,T)/2.2*Math.PI)),ahead:V3=[x+v[0]/s*lead,.11,z+v[1]/s*lead];
  return mix3(ahead,EVRA_PT,sm(T_PASS-.3,T_PASS,T));}
 if(T<0)return mix3(EVRA_PT,GIGGS_PT,(T-T_PASS)/-T_PASS);
 if(T<T_SAVE)return arc3(GIGGS_PT,HEAD_PT,T/T_SAVE,1.55);
 if(T<T_OVER)return arc3(HEAD_PT,OVER(),easeOut((T-T_SAVE)/(T_OVER-T_SAVE)),.25);
 if(T<T_DOWN){const u=(T-T_OVER)/(T_DOWN-T_OVER);return arc3(OVER(),DOWN(),u,.9);}
 const u=clamp((T-T_DOWN)/1.4);return arc3(DOWN(),add3(DOWN(),[.9,0,.8]),easeOut(u),.35*(1-u));
}
const spinAt=(T:number)=>T<T_PASS?distOf(EVRA_I,T)/.11:T<T_SAVE?-TAU*3*T:-TAU*3*T_SAVE+TAU*4*(T-T_SAVE);
EVRA_PT=toe(EVRA_I,T_PASS,'l');GIGGS_PT=toe(GIGGS_I,0,'l');SOLVED=true;HEAD_PT=forehead(TERRY_I,T_SAVE);

// ---------------------------------------------------------------- the ball print
function drawBall(s:Sheet,c:Cam,T:number,o:{min?:number;lines?:boolean;prevT?:number}={}){
 const P=ballAt(T),q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??10,c.F*.11/q[2]);
 const sh:Pt[]=[];const rad=.16+P[1]*.05;for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*1.3,0,P[2]+Math.sin(a)*rad]);if(p)sh.push(p);}
 if(sh.length>8)s.tone(K,polyPath(sh,true),clamp(.5-P[1]*.15,.1,.5));
 if(o.lines&&o.prevT!==undefined&&T>T_PASS&&T<T_DOWN){const a=pr(c,ballAt(o.prevT));if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.8)speedLines(s,K,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:3,seed:7,len:Math.min(200,d*1.2),spread:r*.8,width:Math.max(2.5,r*.16),cov:.75});}}
 footballPanels(s,g[0],g[1],r,{rot:spinAt(T),key:K,shadow:B,seed:5});
 return{g,r,d:q[2]};
}

// ---------------------------------------------------------------- one frame of the match through a camera
type PlayOut={bg:Pt|null;terry?:DrawResult};
type Env={minBall?:number;lines?:boolean;hero?:boolean;near?:number;after?:(r:PlayOut)=>void;ghost?:()=>void};
/** everything on the pitch at T (the ball on ones, poses on twos at Tp; Tprev = the drawing before, for secondary motion), in depth order
 * with the goal (through its net when the camera is behind the line) */
function play(s:Sheet,c:Cam,T:number,Tp:number,Tprev:number,e:Env={}):PlayOut{
 const v=view(s),m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending;
 const items:{d:number;draw:()=>void}[]=[],out:PlayOut={bg:null};
 const behind=c.eye[0]>.5;
 items.push({d:behind?-1:toCam(c,[1,1.2,0])[2],draw:()=>goal3(s,c,behind?.16:.28)});
 // small ground shadows batched in one op; big figures cast their own through the athlete
 const sh=new Path2D();let nsh=0;
 ACTORS.forEach((a,k)=>{const[x,z]=posOf(k,T),q=toCam(c,[x,.9,z]);if(q[2]<(e.near??2.5))return;const g=scr(c,q),h=c.F*1.85/q[2];
  if(Math.abs(g[0])>v.hx+h||g[1]<-v.hy-h||g[1]>v.hy+h)return;
  const gg=pr(c,[x,0,z]);if(gg&&h<380){sh.addPath(polyPath(blob(gg[0],gg[1],h*.14,h*.04,a.style.seed??1,{amp:.05,n:14}),true));nsh++;}
  items.push({d:q[2],draw:()=>{const{p,yaw}=poseOf(k,Tp),px=h*ppu,big=h>=240;
   const detail=passing?(k===TERRY_I?'mid':'low'):px<50||(!a.key&&px<150)?'low':'auto';
   const fast=e.hero&&((k===TERRY_I&&Tp>T_SAVE-.3&&Tp<T_SAVE+.3)||(k===TERRY_I&&Tp>-.6&&Tp<.5)||(k===CECH_I&&Tp>-.1&&Tp<.6)||(k===GIGGS_I&&Tp>-.2&&Tp<.25));
   const prv=big&&!passing?poseOf(k,Tprev):null,[px0,pz0]=posOf(k,Tprev);
   const r=drawPlayer(s,p,c,{...a.style,scale:FIG,shadow:h<380?false:undefined,detail},{x,z,yaw},prv?{prev:prv.p,prevPlace:{x:px0,z:pz0,yaw:prv.yaw},smear:!!fast}:{});
   if(k===TERRY_I)out.terry=r;}});});
 if(nsh)s.tone(K,sh,.4);
 const bq=toCam(c,ballAt(T));if(bq[2]>=NEAR)items.push({d:bq[2],draw:()=>{const r=drawBall(s,c,T,{min:e.minBall,lines:e.lines,prevT:T-.06});out.bg=r?r.g:null;}});
 e.ghost?.();
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
 e.after?.(out);
 // the wet splashes: the pull-back off the grass, the stab, water off the ball at the header
 spray(s,c,EVRA_PT,T-T_PASS,{n:8,v:1.2,up:1,seed:3,size:.03});
 spray(s,c,GIGGS_PT,T,{n:8,v:1.3,up:1.2,seed:5,size:.03});
 spray(s,c,HEAD_PT,T-T_SAVE,{n:14,v:2.2,up:1.6,dir:[.6,0,0],seed:9,size:.04});
 return out;
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}

// ---------------------------------------------------------------- teaching marks
/** a ring on the grass round a point (a stamped spot), knocked out under */
function groundRing(s:Sheet,c:Cam,x:number,z:number,r:number,w:number,ink=Y){if(w<=.02)return;const pts:Pt[]=[];for(let i=0;i<36;i++){const q=pr(c,[x+Math.cos(i/36*TAU)*r,.01,z+Math.sin(i/36*TAU)*r]);if(q)pts.push(q);}
 if(pts.length<30)return;const rr=ribbon(pts,Math.max(5,kAt(c,[x,0,z])*.06),{close:true,seed:7,taper:0,wobble:1});s.knockout(rr,.9*w);s.fill(ink,rr,.95*w);}
/** an arrow on the grass from a to b (world, y≈0), drawn to progress u */
function grassArrow(s:Sheet,c:Cam,a:V3,b:V3,u:number,ink:string,wm=.14,seed=70){if(u<=.02)return;const A=pr(c,a),Bp=pr(c,b);if(!A||!Bp)return;const wd=Math.max(6,kAt(c,mix3(a,b,.5))*wm);
 const e:Pt=[lerp(A[0],Bp[0],u),lerp(A[1],Bp[1],u)];s.knockout(ribbon([A,e],wd*2.1,{seed,taper:0,wobble:.6}),.85);laneArrow(s,ink,A,Bp,wd,{progress:u,seed:seed+1,head:wd*2.6});}
/** the ball's flight between play times a..b as a bold ribbon with an arrowhead (progress u) */
function flightArrow(s:Sheet,c:Cam,a:number,b:number,u:number,ink:string,wm=.12){if(u<=.02)return;const pts:Pt[]=[];let d=10;
 for(let i=0;i<=18;i++){const P=ballAt(lerp(a,b,i/18)),q=toCam(c,P);if(q[2]<1)continue;pts.push(scr(c,q));d=q[2];}
 if(pts.length<4)return;const line=partial(smoothPts(pts,false,6,2),u),wd=Math.max(7,c.F*wm/d);if(line.length<2)return;
 s.knockout(ribbon(line,wd*1.7,{seed:61,taper:.1,wobble:.8}),.8);s.fill(ink,ribbon(line,wd,{seed:61,taper:.1,wobble:.8}),.95);
 const e=line[line.length-1],p0=line[Math.max(0,line.length-3)];if(Math.hypot(e[0]-p0[0],e[1]-p0[1])>1)laneArrow(s,ink,p0,[e[0]+(e[0]-p0[0])*.02,e[1]+(e[1]-p0[1])*.02],wd,{seed:62,head:wd*3});}
/** "eyes on the ball": a dotted yellow sightline from his eyes to the ball */
function sightline(s:Sheet,r:DrawResult|undefined,bg:Pt|null,w:number){if(!r||!bg||w<=.02)return;const h=r.joints.face,n=r.joints.head,hs=Math.hypot(h[0]-n[0],h[1]-n[1])*2.2+6;
 const L=Math.hypot(bg[0]-h[0],bg[1]-h[1]);if(L<hs)return;const dots=new Path2D(),N=Math.max(3,Math.min(14,Math.floor(L/(hs*1.1))));
 for(let i=1;i<N;i++){const u=i/N;if(u>w)break;const x=lerp(h[0],bg[0],u),y=lerp(h[1],bg[1],u),rr=hs*.28;dots.addPath(polyPath(blob(x,y,rr,rr,i+5,{amp:.1,n:10}),true));}
 s.knockout(dots,.8);s.fill(Y,dots,.95);}
/** "stays on his feet": a small yellow ring under each boot (solved from the body) */
function bootRings(s:Sheet,c:Cam,T:number,w:number){if(w<=.02)return;const{p,yaw}=poseOf(TERRY_I,T),[x,z]=posOf(TERRY_I,T),sk=solve(p,TERRY_B,{x,z,yaw},FIG);
 for(const f of [sk.lAn,sk.rAn])groundRing(s,c,f[0],f[2],.26,w*easeOutBack(clamp(w*1.2)));}
/** the contact: a yellow burst off his forehead */
function contactBurst(s:Sheet,c:Cam,T:number,seed:number,scale=.55){const age=T-T_SAVE;if(age<=-.03||age>=.4)return;const q=pr(c,HEAD_PT);if(!q)return;
 sparkBurst(s,Y,q[0],q[1],kAt(c,HEAD_PT)*scale,{n:10,seed,g:easeOutBack(clamp((age+.03)/.08))*(1-clamp((age-.22)/.18)),width:Math.max(6,kAt(c,HEAD_PT)*.04)});}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, near real time
/** T keyed to the words: the run starts on "Patrice Evra", the pull-back lands on "pulls it back", the stab on "shoots", the header just
 * after "over the keeper" — the commentary a beat behind the play, as on the night */
const tau1=(t:number)=>key(t,mono([[0,-9],[CUE(0,'Patrice Evra')-.1,-5.2],[CUE(0,'pulls it back')+.25,T_PASS],[CUE(0,'shoots')+.1,0],[CUE(0,'John Terry')-.05,T_SAVE],[SECS(0),T_SAVE+(SECS(0)-CUE(0,'John Terry'))*.95]]),linear);
const P1:V3=[-44,21,60];
function cam1(t:number):Cam{
 const b=()=>ballAt(tau1(t));
 return plan(t,[
  [0,0,()=>({P:P1,T:[-26,4,-8],fov:40})],
  [CUE(0,'in the rain')-.2,1.2,()=>({P:P1,T:[-24,2,-10],fov:28})],
  [CUE(0,'Champions League')-.2,1.3,()=>({P:P1,T:[-20,1,-7],fov:20})],
  [CUE(0,'Patrice Evra')-.3,1.1,()=>({P:P1,T:mix3(b(),[-8,1,-6],.35),fov:12.5})],
  [CUE(0,'pulls it back')-.4,.9,()=>({P:P1,T:mix3(b(),[-5,1,-4],.5),fov:11})],
  [CUE(0,'shoots')-.3,.8,()=>({P:P1,T:[-4.2,1.3,-1.3],fov:9.4})],
  [CUE(0,'John Terry')+.4,1.2,()=>({P:P1,T:[-2,1.3,-.8],fov:8.2})],
  [CUE(0,'off the line')+.6,1.4,()=>({P:P1,T:[-3.6,1.3,-1.6],fov:11})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),T=tau1(t),tt=twos(t),tp=tau1(tt),tpp=tau1(tt-1/12),jt=CUE(0,'John Terry');
  stadium(s,c,t,[0,1,3],{roar:sm(jt-.2,jt+.4,t)*(1-.4*sm(SECS(0)-.8,SECS(0),t)),flash:sm(jt-.1,jt+.3,t)*(1-sm(jt+2.2,jt+3,t))});
  ground(s,c);
  play(s,c,T,tp,tpp,{minBall:8,lines:true});
  rain(s,t,{n:120,len:52,speed:1600,cov:.5,seed:3});
 },
 aperture(t){const c=cam1(t),[x,z]=posOf(TERRY_I,tau1(t)),q=toCam(c,[x,1.3,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(10,c.F*.35/q[2]),12);},
 still:9.6,
};

// ---------------------------------------------------------------- 2 · slow-motion replay, low along the goal line from the near-post side
const tau2=(t:number)=>key(t,mono([[0,-1.75],[CUE(1,'wrong foot'),-1.05],[CUE(1,'never gives'),-.6],[CUE(1,'races back'),-.25],[CUE(1,'stays on'),.45],[CUE(1,'stretches up'),.72],[CUE(1,'Header'),T_SAVE+.02],[CUE(1,'behind for'),T_SAVE+.5],[SECS(1),T_DOWN+.3]]),linear);
const E2:V3=[-2.7,1.2,8.6];
function cam2(t:number):Cam{
 const T=tau2(t),[tx,tz]=posOf(TERRY_I,T);
 return plan(t,[
  [0,0,()=>({P:E2,T:[-4.5,1,-3.4],fov:36})],
  [CUE(1,'wrong foot')-.3,.9,()=>({P:add3(E2,[-.2,0,-.6]),T:[tx,1.1,tz],fov:30})],
  [CUE(1,'races back')-.3,1,()=>({P:add3(E2,[-.1,0,-1.2]),T:[lerp(tx,-.8,.4),1.2,lerp(tz,.2,.4)],fov:27})],
  [CUE(1,'stretches up')-.4,.9,()=>({P:add3(E2,[.5,-.05,-2.2]),T:[-.6,1.7,1.2],fov:22})],
  [CUE(1,'behind for')-.2,1.1,()=>({P:add3(E2,[.3,.2,-1.6]),T:[.5,2.1,1.3],fov:30})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),T=tau2(t),tt=twos(t),tp=tau2(tt),tpp=tau2(tt-1/12),E=SECS(1);
  const wf=CUE(1,'wrong foot'),rb=CUE(1,'races back'),so=CUE(1,'stays on'),su=CUE(1,'stretches up'),hd=CUE(1,'Header'),bf=CUE(1,'behind for');
  stadium(s,c,t,[0,1,3],{roar:sm(hd,hd+.5,t),flash:sm(hd+.1,hd+.5,t)});
  ground(s,c);
  // "caught on the wrong foot": a red arrow the way his weight was going — toward the near post and Evra
  const[wx,wz]=posOf(TERRY_I,-1.05);grassArrow(s,c,[wx+.4,.01,wz+.9],[wx-.2,.01,wz-1.4],sm(wf-.1,wf+.45,t,easeOut)*(1-sm(rb,rb+.4,t)),R,.12,70);
  // "races back to the line": a yellow arrow from where he planted to his spot on the line
  grassArrow(s,c,[wx+.3,.01,wz+.6],[HEAD_PT[0]-.1,.01,HEAD_PT[2]],sm(rb-.1,rb+.8,t,easeOut)*(1-sm(E-1.1,E-.7,t)),Y,.13,74);
  play(s,c,T,tp,tpp,{minBall:7,hero:true,lines:true,after:({terry,bg})=>{
   bootRings(s,c,tp,sm(so-.1,so+.4,t)*(1-sm(hd+.4,hd+.9,t)));
   sightline(s,terry,bg,sm(su-.15,su+.4,t)*(1-sm(hd-.05,hd+.2,t)));
   contactBurst(s,c,T,91);
   // "behind for a corner": the header's flight up and over the bar, printed as it flies
   flightArrow(s,c,T_SAVE,Math.max(T_SAVE+.01,Math.min(T,T_DOWN)),sm(hd,hd+.3,t)*(1-sm(E-.9,E-.6,t)),Y,.1);}});
  rain(s,t,{n:100,len:16,speed:260,cov:.5,seed:5,w:2.6});
 },
 aperture(t){const c=cam2(t),P=add3(HEAD_PT,[0,-.6,0]),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(30,c.F*.5/q[2]),12);},
 still:7.4,
};

// ---------------------------------------------------------------- 3 · the lesson: behind the shooter, the goal at the top of the frame
const tau3=(t:number)=>key(t,mono([[0,-1.9],[CUE(2,'keeper is'),-1.1],[CUE(2,'get back')-.1,-.5],[CUE(2,'between the'),.35],[CUE(2,'Stay on'),.7],[CUE(2,'be brave'),T_SAVE+.02],[SECS(2),T_SAVE+.9]]),linear);
const E3:V3=[-17.5,5,-5.6];
function cam3v(t:number):Cam{
 return plan(t,[
  [0,0,()=>({P:E3,T:[-3,1.1,-3],fov:30})],
  [CUE(2,'keeper is')-.3,.9,()=>({P:add3(E3,[1.5,-.2,.6]),T:[-1.6,1.2,-2],fov:25})],
  [CUE(2,'between the')-.3,1,()=>({P:add3(E3,[2.5,-.4,1.4]),T:[-1.4,1.1,-.2],fov:22})],
  [CUE(2,'be brave')-.4,.9,()=>({P:add3(E3,[4.5,-.6,1.8]),T:[-.6,1.6,.2],fov:17})],
 ]);
}
/** the shooting lane: a yellow wedge on the grass from the ball to the two posts (where a shot can go in) */
function shootingLane(s:Sheet,c:Cam,from:V3,w:number){if(w<=.02)return;const a=pr(c,[from[0],.01,from[2]]),p0=pr(c,[0,.01,-3.66]),p1=pr(c,[0,.01,3.66]);if(!a||!p0||!p1)return;
 const e0:Pt=[lerp(a[0],p0[0],w),lerp(a[1],p0[1],w)],e1:Pt=[lerp(a[0],p1[0],w),lerp(a[1],p1[1],w)],wedge=polyPath([a,e0,e1],true);
 s.knockout(wedge,.35*w);s.tone(Y,wedge,.55*w);
 const edge=new Path2D();edge.addPath(ribbon([a,e0],Math.max(4,kAt(c,from)*.05),{seed:81,taper:.3,wobble:.6}));edge.addPath(ribbon([a,e1],Math.max(4,kAt(c,from)*.05),{seed:82,taper:.3,wobble:.6}));s.fill(Y,edge,.9*w);}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),T=tau3(t),tt=twos(t),tp=tau3(tt),tpp=tau3(tt-1/12),E=SECS(2);
  const kb=CUE(2,'keeper is'),gb=CUE(2,'get back'),bt=CUE(2,'between the'),sf=CUE(2,'Stay on'),br=CUE(2,'be brave');
  stadium(s,c,t,[0,1,2],{roar:sm(br,br+.4,t),flash:.5*sm(br,br+.3,t)});
  ground(s,c);
  // "between the ball and the goal": the shooting lane from Giggs's ball to the posts, Terry stepping into it
  shootingLane(s,c,GIGGS_PT,sm(bt-.1,bt+.6,t,easeOut)*(1-sm(E-1,E-.6,t)));
  // "get back": the recovery run to the line
  const[wx,wz]=posOf(TERRY_I,-.9);grassArrow(s,c,[wx+.3,.01,wz+.5],[HEAD_PT[0]-.15,.01,HEAD_PT[2]],sm(gb-.1,gb+.7,t,easeOut)*(1-sm(E-1,E-.6,t)),Y,.16,76);
  play(s,c,T,tp,tpp,{minBall:8,hero:true,lines:true,near:6,after:({terry,bg})=>{
   // "your keeper is beaten": a red ring round Čech as the ball goes over him
   const cp=posOf(CECH_I,Math.min(tp,.2));groundRing(s,c,cp[0],cp[1],1.1,sm(kb-.1,kb+.4,t)*(1-sm(gb+.6,gb+1.1,t)),R);
   bootRings(s,c,tp,sm(sf-.1,sf+.4,t)*(1-sm(E-.9,E-.5,t)));
   sightline(s,terry,bg,sm(sf+.2,sf+.6,t)*(1-sm(br-.05,br+.2,t)));
   contactBurst(s,c,T,93,.7);
   flightArrow(s,c,T_SAVE,Math.max(T_SAVE+.01,Math.min(T,T_DOWN)),sm(br,br+.3,t)*(1-sm(E-.8,E-.5,t)),Y,.12);
   // "be brave": a big yellow tick of relief over the goal
   const sw=sm(br+.4,br+1,t,easeOutBack);if(sw>0){const a=pr(c,[.2,3.3,-1.4]),m=pr(c,[.2,2.8,-.5]),z=pr(c,[.2,4.3,1.3]);if(a&&m&&z){const tk=partial([a,m,z],clamp(sw)),wd=Math.max(10,kAt(c,[0,3,0])*.16);s.knockout(ribbon(tk,wd*1.6,{seed:95,taper:.2,wobble:1}),.9);s.fill(Y,ribbon(tk,wd,{seed:95,taper:.2,wobble:1}),.95);}}}});
  rain(s,t,{n:90,len:44,speed:1500,cov:.42,seed:11});
 },
 still:7.2,
};

const film:RisoStory={
 id:'terry-signature',format:'11v11',title:"Terry's brave block",
 theme:'When your keeper is beaten, get back between the ball and the goal — stay on your feet and be brave',
 ageNote:'Manchester United 1–1 Chelsea (United won 6–5 on penalties), Champions League final, Luzhniki Stadium, Moscow, 21 May 2008, extra time. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3]);},
 /** Touch: a raindrop splash — ripples on a puddle, droplets flung up, a yellow header burst. Reduced motion: the still loop. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.6)),fade=age<=0?1:1-clamp((age-.6)/.3),r=rng(seed);
  const rp=new Path2D();for(let k=0;k<3;k++){const rr=(20+40*k)*u+6,pts:Pt[]=[];for(let i=0;i<=28;i++){const a=i/28*TAU;pts.push([x+Math.cos(a)*rr,y+Math.sin(a)*rr*.38]);}rp.addPath(ribbon(pts,5,{close:true,seed:seed+k,taper:0,wobble:.6}));}
  s.fill(B,rp,.8*fade);
  const dp=new Path2D();for(let i=0;i<9;i++){const a=-Math.PI*(.15+.7*r()),sp=60+90*r(),px=x+Math.cos(a)*sp*u,py=y+Math.sin(a)*sp*u+120*u*u;dp.moveTo(px+6,py);dp.arc(px,py,6,0,TAU);}
  s.knockout(dp,.95*fade);s.fill(B,dp,.5*fade);
  if(age>0&&age<.35)sparkBurst(s,Y,x,y-20,70,{n:7,seed,g:1-clamp(age/.35),width:9});
 },
};
export default film;
/** Solved contact points (pitch metres; x to the Chelsea goal line at 0, z across; +z = the main-stand side) — checked by the test. */
export const FACTS={EVRA_PT,GIGGS_PT,HEAD_PT,GOAL,ballAt,T_PASS,T_SAVE,cechAt:(T:number)=>posOf(CECH_I,T),terryAt:(T:number)=>posOf(TERRY_I,T)};
