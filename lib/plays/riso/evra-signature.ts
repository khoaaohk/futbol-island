/** Patrice Evra — SIGNATURE: "the energetic overlap" (lib/town/iconicPlays.json, template overlap_run, side left: "Keep running up and
 * down the wing: your stamina wins games in the last minutes."), shown through ONE real, well-documented moment: his run down the left
 * and pull-back for Ryan Giggs in the 102nd minute — EXTRA TIME — of Manchester United 1–1 Chelsea (United won 6–5 on penalties), UEFA
 * Champions League final, Luzhniki Stadium, Moscow, Wednesday 21 May 2008 (22:45 local kick-off, rain in extra time). An iconic-play riso
 * film (RisoStory, chapters mode) played by the card's picture window (components/CardFilmPlayer.tsx) or StoryFilmPlayer. A 1:1
 * reconstruction from WRITTEN accounts (the footage itself was not reviewed), rendered as a riso print. The same move is the build-up in
 * lib/plays/riso/terry-signature.ts (Terry's header off the line); this film keeps the same solved play but every composition is Evra's.
 *
 * WHY THIS MOMENT: the signature is the tireless left-back who keeps going up and down the wing. Evra played all 120 minutes of the
 * final (no substitution in the line-ups) and, in the 102nd minute, with legs heavy after extra time had begun, he was still the one who
 * "rampages down the left" (BBC) and "slaloms through the Chelsea penalty area" (Guardian) to make the best chance of extra time — the
 * stamina of the lesson, in the last minutes of the biggest club match, written down minute by minute.
 *
 * SOURCES (read Sept 2026, cached in scratchpad/films/src-cache/ — no new fetches were needed):
 *  - Wikipedia, "2008 UEFA Champions League final" (date, venue, 20:45 CEST, 67,310; line-ups: Evra LB No. 3, full 120 minutes — Brown
 *    off 120+5, Scholes off 87, Rooney off 101, Evra not substituted; Giggs No. 11 on 87'; the kit boxes: United red shirts, white shorts,
 *    white socks; Chelsea all blue; "Giggs stabbed the ball left-footed towards goal … only to see it headed off the line by Terry")
 *    https://en.wikipedia.org/wiki/2008_UEFA_Champions_League_final   [wiki-2008-ucl-final.txt]
 *  - The Guardian, "Man Utd v Chelsea — as it happened", 21 May 2008, extra time 9th minute: "Patrice Evra slaloms through the Chelsea
 *    penalty area and brilliantly pulls the ball back for Giggs, who shoots. With Cech beaten, the wrong-footed John Terry stretches every
 *    sinew to block the ball with his big thick head"   [guardian-mbm-manutd-chelsea-2008.txt]
 *  - The Guardian, "Champions League final: key moments", 22 May 2008: "102min Patrice Evra pulls back from the byline for Ryan Giggs, but
 *    his lofted shot is blocked superbly by John Terry with his head"; the pouring rain later in extra time   [guardian-keymoments-2008.txt]
 *  - BBC Sport live text, 21 May 2008, 21:51 BST: "Patrice Evra rampages down the left and cuts the ball back for Ryan Giggs whose shot is
 *    brilliantly headed behind by John Terry for a corner"   [bbc-7410307.txt]
 * CONFIRMED by those accounts: match, place, date, night kick-off; extra time, the 102nd minute, 1–1; rain in extra time; Evra (United No. 3,
 *  left-back) played the whole match; he went down the LEFT, through ("slaloms through") the Chelsea box and pulled the ball back FROM THE
 *  BYLINE; Giggs (No. 11) hit it left-footed, a lofted stab, over Čech; Terry (No. 26) headed it off the line, behind for a corner; kits.
 * INFERRED (illustrative, not named in the narration): where the run started (drawn from just inside the Chelsea half, ≈ 50 m out) and that he
 *  was already on the ball there; every position and run (the slalom drawn as one cut inside the right-back, Essien — Essien played
 *  right-back that night, but WHO Evra beat is not written down, so the narration says "his man"); Evra's left foot on the pull-back
 *  (his stronger foot — inferred, not named); which end of the stadium and so the camera side (United attack +x, Evra's left wing is the
 *  far touchline); the tired stances at the restart of the clip; hair, keeper kits, crowd, the look of the Luzhniki and the rain.
 *
 * FRAMING (the TV broadcast, never top-down; full-sheet card window 1.45:1 down to square, never sheet.safe): 1 = live, the high
 * main-stand camera following Evra from deep in near real time (tired players in the rain → Evra carries it down the far touchline → the
 * slalom → the pull-back → Giggs's shot → Terry's header); 2 = the slow-motion replay LOW beside Evra on the touchline, running with him
 * (a yellow trail of his sprint, the man he goes past, a ring at the byline), then swinging round behind the byline as he looks back (a
 * dotted sight line to Giggs) and cuts it into space (a yellow pass arrow to a yellow spot); 3 = the lesson, high behind United's left
 * wing looking down the whole touchline: a yellow arrow DOWN the wing and a dashed one back UP it, a match clock filling to 102 of 120
 * minutes, a ring round Evra still sprinting, and a burst on the clock for "the last minutes". Every body goes through ONE adapter,
 * drawPlayer() → athlete.ts (continuous silhouettes, FK skeleton, `prev` secondary motion, motion smears on the fast moves); small figures
 * and every figure inside a passage print at `low` detail. Handedness: the world is right-handed like athlete.ts (x toward the Chelsea goal
 * line at x = 0, y up, +z = the near / main-stand side), so a player facing +x has his right at +z and his LEFT wing at −z: Evra and Giggs
 * strike with foot 'l' with no mirrored projector. Poses on twos, cameras on ones, all randomness seeded, every action keyed to cue times.
 *
 * LEAD: when public/plays/narration/evra-signature/timing.json exists, replace the null in the VOICE constant below with
 *   import timingJson from '../../../public/plays/narration/evra-signature/timing.json';  (and `timingJson as NarrationTiming`). */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,partial,smoothPts,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,runCycle,backpedal,dribble,strike,keeperSet,keeperDive,posed,blendPose,keyPoses,celebrate,
 STRIKE_CONTACT,type Pose,type Camera,type AthleteStyle,type InkFill,type Place,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES (≈2.7 words/s + punctuation pauses) until the Kokoro voice exists. withTiming matches a cue by its FIRST word, in
 * order — so no cue starts with a word that also appears between it and the previous cue, and none starts with a contraction or number. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'Extra time, live',text:'Moscow, 2008, Champions League final. Extra time, and legs are tired. But Patrice Evra still races down the left wing, weaves into the box and pulls it back. Ryan Giggs shoots... John Terry heads it off the line!',tail:2,
  cues:['Moscow','Champions League','Extra time','legs are tired','Patrice Evra','races down','weaves into','pulls it back','Ryan Giggs','shoots','John Terry','off the line']},
 {label:'Watch again',text:'Watch again, slowly. Minute 102, and Evra is still sprinting. He weaves past his man, reaches the byline, then looks back and cuts it into space.',tail:1.8,
  cues:['Watch again','Minute','still sprinting','weaves past','reaches the byline','looks back','cuts it']},
 {label:'Your turn',text:'Your turn. Keep running up and down the wing, all game long. When others get tired, your stamina wins games in the last minutes!',tail:2.2,
  cues:['Your turn','Keep running','up and down','all game','When others','stamina','last minutes']},
];
import timingJson from '../../../public/plays/narration/evra-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (calibrated on the voiced films, ≈2.3 words/s): .2 s + .02 s a letter per word, pauses after , . ! ? : ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.2+.02*w.replace(/[^a-z0-9]/gi,'').length;if(/^\d+,?$/.test(w))t+=.5;if(/[,;:]$/.test(w))t+=.18;if(/[.!?]$/.test(w))t+=.34;if(/\.\.\.$/.test(w))t+=.28;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('evra: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('evra: no cue '+w);return c.at;};
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
/** John Terry: No. 26 (confirmed), 1.87 m */
const TERRY_B={height:1.87,bulk:1.06,thighs:1.06};
const TERRY_ST=chelsea({number:26,build:TERRY_B,hair:[K,.9],seed:26});
/** Petr Čech: No. 1 (confirmed), 1.96 m; the yellow keeper kit and his dark head guard are inferred */
const CECH_ST:AthleteStyle={shirt:[Y,.95],shorts:[Y,.95],socks:[Y,.95],boots:K,skin:SKIN_L,hair:[K,.95],line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',number:1,numberInk:K,build:{height:1.96},seed:17};
/** Patrice Evra: No. 3 (confirmed), 1.73 m, a wiry full-back's build with strong thighs; short dark hair (inferred) */
const EVRA_B={height:1.73,bulk:.97,thighs:1.06},GIGGS_B={height:1.8,bulk:.96};
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
/** Positions are Hermite-interpolated between keys [T, x, z]. Only Evra, Giggs, Čech and Terry have beats in the accounts; everyone else
 * is an illustrative marker (numbers from the line-ups, positions inferred). Evra's run starts ≈ 50 m out on the far (left) touchline. */
const ACTORS:Actor[]=[
 {name:'Terry',role:'terry',style:TERRY_ST,key:true,keys:[[-12,-10,-1],[-9,-9,-1.2],[-6,-7.6,-1.8],[-3.6,-6.2,-3],[-1.8,-4.9,-4.1],[-.95,-4.3,-4.5],[-.55,-3.7,-3.7],[0,-2.5,-2],[.5,-1.25,.25],[.82,-.56,1.1],[T_SAVE,-.46,1.25],[1.5,-.42,1.3],[2.6,-1.3,.8],[4,-2.6,-.6],[9,-4,-1]]},
 {name:'Čech',role:'cech',style:CECH_ST,key:true,keys:[[-12,-1,0],[-9,-.9,-.4],[-4,-.9,-1.4],[-2,-.75,-2.4],[-.95,-.7,-2.85],[-.45,-1.1,-2.5],[-.05,-1.3,-2.25],[9,-1.3,-2.25]]},
 {name:'Evra',role:'evra',style:EVRA_ST,key:true,keys:[[-12,-50,-27.5],[-10.5,-43.2,-27],[-9,-36.6,-25.8],[-7.5,-30.2,-23.8],[-6,-24.6,-21],[-4.5,-19.4,-16.6],[-3.4,-14.6,-12.4],[-2.5,-10.6,-13.4],[-1.7,-6.6,-11.6],[-1.2,-4.4,-10.6],[T_PASS,-3.4,-10.1],[-.4,-2.2,-9.6],[1,-1.6,-9],[3,-2.2,-7.6],[9,-4,-5]]},
 {name:'Giggs',role:'giggs',style:GIGGS_ST,key:true,keys:[[-12,-33,-6],[-9,-27,-5],[-6,-21,-4.4],[-3,-15.2,-3.4],[-1.5,-12.4,-2.6],[-.5,-10.8,-1.9],[0,-10.1,-1.55],[.6,-9.5,-1.3],[2,-8.6,-1],[9,-8,-.5]]},
 {name:'Essien',role:'che',style:chelsea({number:5,skin:SKIN_D,hair:[K,.95],hairStyle:'bald',build:{height:1.78,bulk:1.04},seed:5}),keys:[[-12,-43.5,-24.6],[-10.5,-37.6,-24.4],[-9,-31.8,-23.6],[-7.5,-26.6,-21.8],[-6,-22,-19.2],[-4.5,-17.8,-16],[-3.4,-14.4,-13.8],[-2.5,-12.4,-12.6],[-1.7,-9.2,-11.2],[-1,-6.4,-10],[0,-4.6,-8.9],[3,-3.2,-7],[9,-3,-5]]},
 {name:'Carvalho',role:'che',style:chelsea({number:6,skin:SKIN_M,build:{height:1.83},seed:6}),keys:[[-12,-17,1],[-9,-16,.5],[-4,-11,-1],[-1.5,-7.8,-2.2],[0,-7.4,-2],[2,-6.8,-1.4],[9,-6,-1]]},
 {name:'A. Cole',role:'che',style:chelsea({number:3,skin:SKIN_D,build:{height:1.76,bulk:.96},seed:33}),keys:[[-12,-16,10],[-9,-15,9],[-4,-9,6],[-1.5,-6,4.6],[0,-4.6,3.8],[2,-3.4,2.6],[9,-3,2]]},
 {name:'Makélélé',role:'che',style:chelsea({number:4,skin:SKIN_D,hairStyle:'bald',build:{height:1.74},seed:4}),keys:[[-12,-26,-3],[-9,-24,-2],[-4,-17.5,-2.4],[-1.5,-13.2,-1.4],[0,-12,-.9],[2,-11.2,-.6],[9,-10,0]]},
 {name:'Ballack',role:'che',style:chelsea({number:13,build:{height:1.89},seed:13}),keys:[[-12,-31,-11],[-9,-28,-10],[-4,-21,-8],[-1,-16,-6],[2,-13,-4],[9,-11,-3]]},
 {name:'Rooney',role:'utd',style:united({number:10,hairStyle:'bald',build:{height:1.76,bulk:1.06},seed:10}),keys:[[-12,-20,4.5],[-9,-18,4],[-4,-11,3.4],[-1.5,-7.2,2.6],[0,-5.4,2.4],[2,-4.6,2.2],[9,-6,3]]},
 {name:'Tevez',role:'utd',style:united({number:32,skin:SKIN_M,build:{height:1.73,bulk:1.04},seed:32}),keys:[[-12,-24,9],[-9,-22,8],[-4,-15,7],[-1.5,-11.6,6],[0,-10,5.4],[2,-8.6,4.6],[9,-8,4]]},
];
const TERRY_I=0,CECH_I=1,EVRA_I=2,GIGGS_I=3,ESSIEN_I=4;
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const T0=-12,T1=9,DT=.02;
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
/** extra time: hands on hips between runs (the markers who are not sprinting) — inferred, drawn to show the tired legs */
const TIRED=posed({lShF:-8,rShF:-8,lShA:46,rShA:46,lShR:30,rShR:30,lElb:112,rElb:112,lean:6,neckP:8,lHipF:6,rHipF:4,lKnee:10,rKnee:8});
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
  if(T<-3){const w=clamp((1.6-sp)/1)*(1-sm(-4.5,-3,T));if(w>0)p=blendPose(p,TIRED,w*.85);}
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
type PlayOut={bg:Pt|null;terry?:DrawResult;evra?:DrawResult;giggsBg?:Pt|null};
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
   const detail=passing?(k===EVRA_I?'mid':'low'):px<50||(!a.key&&px<150)?'low':'auto';
   const fast=e.hero&&((k===EVRA_I&&Tp<T_PASS+.35)||(k===ESSIEN_I&&Tp>-3.2&&Tp<-1.2)||(k===TERRY_I&&Tp>T_SAVE-.3&&Tp<T_SAVE+.3)||(k===GIGGS_I&&Tp>-.2&&Tp<.25));
   const prv=big&&!passing?poseOf(k,Tprev):null,[px0,pz0]=posOf(k,Tprev);
   const r=drawPlayer(s,p,c,{...a.style,scale:FIG,shadow:h<380?false:undefined,detail},{x,z,yaw},prv?{prev:prv.p,prevPlace:{x:px0,z:pz0,yaw:prv.yaw},smear:!!fast}:{});
   if(k===TERRY_I)out.terry=r;if(k===EVRA_I)out.evra=r;if(k===GIGGS_I)out.giggsBg=r.joints.head;}});});
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

/** Evra's run so far as a ribbon on the grass (play times a..b), knocked out under */
function runTrail(s:Sheet,c:Cam,a:number,b:number,w:number,ink=Y,wm=.22){if(w<=.02||b<=a+.05)return;const pts:Pt[]=[];let d=10;
 for(let i=0;i<=24;i++){const[x,z]=posOf(EVRA_I,lerp(a,b,i/24)),q=toCam(c,[x,.02,z]);if(q[2]<1)continue;pts.push(scr(c,q));d=q[2];}
 if(pts.length<4)return;const line=smoothPts(pts,false,4,2),wd=Math.max(5,c.F*wm/d);
 s.knockout(ribbon(line,wd*1.8,{seed:41,taper:.6,wobble:.6}),.6*w);s.fill(ink,ribbon(line,wd,{seed:41,taper:.6,wobble:.6}),.9*w);}
/** a long lane on the grass from a to b drawn to progress u — sampled so the part behind the lens is dropped (the wing is longer than
 * the view); solid or dashed, with an arrowhead at the tip */
function wingLane(s:Sheet,c:Cam,a:V3,b:V3,u:number,ink:string,wm=.3,seed=140,dashed=false){if(u<=.02)return;const pts:{p:Pt;d:number}[]=[];
 for(let i=0;i<=30;i++){const q=toCam(c,mix3(a,b,u*i/30));if(q[2]<2)continue;pts.push({p:scr(c,q),d:q[2]});}
 if(pts.length<3)return;const path=new Path2D(),back=new Path2D();
 for(let i=0;i+1<pts.length;i++){if(dashed&&i%2)continue;const w=Math.max(4,c.F*wm/((pts[i].d+pts[i+1].d)/2));path.addPath(ribbon([pts[i].p,pts[i+1].p],w,{seed:seed+i,taper:0,wobble:.4}));back.addPath(ribbon([pts[i].p,pts[i+1].p],w*1.9,{seed:seed+i,taper:0,wobble:.4}));}
 s.knockout(back,.8);s.fill(ink,path,.95);
 const e=pts[pts.length-1],p0=pts[pts.length-2],w=Math.max(4,c.F*wm/e.d);if(Math.hypot(e.p[0]-p0.p[0],e.p[1]-p0.p[1])>1)laneArrow(s,ink,p0.p,e.p,w,{seed:seed+50,head:w*3});}
/** the match clock: a dial whose yellow wedge fills to `min` of 120 minutes (the red arc = extra time, 90–120); world-anchored */
function matchClock(s:Sheet,c:Cam,P:V3,rm:number,min:number,w:number,flash=0){if(w<=.02)return;const q=pr(c,P);if(!q)return;const g=easeOutBack(clamp(w)),r=kAt(c,P)*rm*g;if(r<6)return;
 const[x,y]=q,circ=(rr:number,a0=-Math.PI/2,a1=1.5*Math.PI,n=40)=>{const o:Pt[]=[];for(let i=0;i<=n;i++){const a=lerp(a0,a1,i/n);o.push([x+Math.cos(a)*rr,y+Math.sin(a)*rr]);}return o;};
 const face=polyPath(circ(r*1.08),true);s.knockout(face,.95*w);s.tone(K,face,.1*w);
 const f=clamp(min/120),a1=-Math.PI/2+f*TAU;
 if(f>.005){const wedge=polyPath([[x,y],...circ(r*.9,-Math.PI/2,a1,Math.max(3,Math.round(40*f)))],true);s.fill(Y,wedge,.9*w);}
 const et=ribbon(circ(r*1.0,Math.PI,1.5*Math.PI,14),Math.max(3,r*.1),{seed:161,taper:0,wobble:.4});s.fill(R,et,(.85+.15*flash)*w);
 s.fill(K,ribbon(circ(r*1.1),Math.max(2.5,r*.07),{close:true,seed:162,taper:0,wobble:.5}),.9*w);
 const tk=new Path2D();for(let i=0;i<4;i++){const a=-Math.PI/2+i*Math.PI/2;tk.addPath(ribbon([[x+Math.cos(a)*r*.78,y+Math.sin(a)*r*.78],[x+Math.cos(a)*r*.98,y+Math.sin(a)*r*.98]],Math.max(2,r*.06),{seed:163+i,taper:0,wobble:.2}));}s.fill(K,tk,.9*w);
 s.fill(K,ribbon([[x,y],[x+Math.cos(a1)*r*.86,y+Math.sin(a1)*r*.86]],Math.max(3,r*.09),{seed:167,taper:.5,wobble:.3}),.95*w);
 if(flash>0)sparkBurst(s,Y,x,y,r*1.9,{n:12,seed:171,g:flash,width:Math.max(5,r*.08)});}
/** the ground spot under Evra at play time T */
const evraAt=(T:number):V3=>{const[x,z]=posOf(EVRA_I,T);return[x,0,z];};

// ---------------------------------------------------------------- 1 · live: the high main-stand camera following Evra from deep, near real time
/** T keyed to the words: tired players in the rain on "legs are tired", the carry down the wing from the start, the pull-back on
 * "pulls it back", the stab on "shoots", the header just after "John Terry" — close to real time (≈ 1.25×) */
const tau1=(t:number)=>key(t,mono([[0,-12.2],[CUE(0,'Patrice Evra'),-7.4],[CUE(0,'weaves into')+.1,-3],[CUE(0,'pulls it back')+.25,T_PASS],[CUE(0,'shoots')+.1,0],[CUE(0,'John Terry')-.05,T_SAVE],[SECS(0),T_SAVE+(SECS(0)-CUE(0,'John Terry'))*.95]]),linear);
const P1:V3=[-30,24,64];
function cam1(t:number):Cam{
 const e=()=>{const T=tau1(t),E=evraAt(T),b=ballAt(T);return mix3(E,b,.3);};
 return plan(t,[
  [0,0,()=>({P:P1,T:add3(e(),[7,1,7]),fov:13.5})],
  [CUE(0,'legs are tired')-.2,1.2,()=>({P:P1,T:add3(e(),[5,1,5]),fov:12})],
  [CUE(0,'Patrice Evra')-.4,1,()=>({P:P1,T:add3(e(),[3.5,1,3]),fov:11})],
  [CUE(0,'weaves into')-.4,1,()=>({P:P1,T:add3(e(),[2.5,1,3.5]),fov:10.5})],
  [CUE(0,'pulls it back')-.3,.9,()=>({P:P1,T:[-5.4,1.1,-5.6],fov:11})],
  [CUE(0,'shoots')-.3,.8,()=>({P:P1,T:[-4.4,1.3,-2.4],fov:10})],
  [CUE(0,'off the line')+.5,1.4,()=>({P:P1,T:[-3.6,1.2,-5],fov:12.5})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),T=tau1(t),tt=twos(t),tp=tau1(tt),tpp=tau1(tt-1/12),jt=CUE(0,'John Terry');
  stadium(s,c,t,[0,1,3],{roar:sm(jt-.2,jt+.4,t)*(1-.4*sm(SECS(0)-.8,SECS(0),t)),flash:sm(jt-.1,jt+.3,t)*(1-sm(jt+2.2,jt+3,t))});
  ground(s,c);
  play(s,c,T,tp,tpp,{minBall:8,lines:true,near:6});
  rain(s,t,{n:120,len:52,speed:1600,cov:.5,seed:3});
 },
 aperture(t){const c=cam1(t),E=evraAt(tau1(t)),q=toCam(c,[E[0],1,E[2]]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(10,c.F*.4/q[2]),12);},
 still:4.2,
};

// ---------------------------------------------------------------- 2 · slow-motion replay: LOW beside Evra on the touchline, then behind the byline
const tau2=(t:number)=>key(t,mono([[0,-5.6],[CUE(1,'Minute'),-4.9],[CUE(1,'still sprinting'),-4.2],[CUE(1,'weaves past'),-3.1],[CUE(1,'reaches the byline'),-1.55],[CUE(1,'looks back'),-1.15],[CUE(1,'cuts it'),T_PASS+.02],[SECS(1),.2]]),linear);
function cam2(t:number):Cam{
 const T=tau2(t),E=evraAt(T);
 return plan(t,[
  [0,0,()=>({P:add3(E,[-6,1.45,-4.6]),T:add3(E,[5,.85,3.2]),fov:34})],
  [CUE(1,'weaves past')-.4,1.2,()=>({P:add3(E,[-4.6,1.35,-5.2]),T:add3(E,[4.5,.8,3.8]),fov:36})],
  [CUE(1,'reaches the byline')-.2,1.1,()=>({P:[1.7,1.75,-16.2],T:[-5.6,.9,-7.4],fov:34})],
  [CUE(1,'cuts it')+.1,1.2,()=>({P:[1.9,1.9,-16.8],T:[-6.6,.9,-5.4],fov:40})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),T=tau2(t),tt=twos(t),tp=tau2(tt),tpp=tau2(tt-1/12),E=SECS(1);
  const ss=CUE(1,'still sprinting'),wp=CUE(1,'weaves past'),rb=CUE(1,'reaches the byline'),lb=CUE(1,'looks back'),ci=CUE(1,'cuts it');
  stadium(s,c,t,[0,1,2,3],{roar:.3*sm(ci,ci+.5,t)});
  ground(s,c);
  // "still sprinting": the trail of his run down the wing, printed behind him
  runTrail(s,c,-9,T,sm(ss-.1,ss+.5,t)*(1-sm(rb+.3,rb+.9,t)),Y,.2);
  // "reaches the byline": the goal line lit up next to him and a ring where he stops
  {const w=sm(rb-.05,rb+.4,t)*(1-sm(E-1,E-.6,t));if(w>.02){const ln=new Path2D();seg3(c,[0,.01,-19],[0,.01,-5.6],.26,ln);s.knockout(ln,.8*w);s.fill(Y,ln,.9*w);}
   groundRing(s,c,EVRA_PT[0],EVRA_PT[2],.7,w);}
  // "cuts it into space": the pull-back along the wet grass to a yellow spot
  grassArrow(s,c,[EVRA_PT[0],.01,EVRA_PT[2]],[GIGGS_PT[0]+.4,.01,GIGGS_PT[2]-.3],sm(ci-.05,ci+.6,t,easeOut)*(1-sm(E-.5,E-.2,t)),Y,.14,74);
  groundRing(s,c,GIGGS_PT[0],GIGGS_PT[2],1.1,sm(ci+.1,ci+.5,t)*(1-sm(E-.5,E-.2,t)));
  play(s,c,T,tp,tpp,{minBall:7,hero:true,lines:true,near:1.2,after:({evra,giggsBg})=>{
   // "his man": a red ring round the defender he goes past, gone once he is by
   const ep=posOf(ESSIEN_I,tp);groundRing(s,c,ep[0],ep[1],.85,sm(wp-.1,wp+.3,t)*(1-sm(wp+1.1,wp+1.6,t)),R);
   // "looks back": a dotted sight line from his eyes to Giggs arriving
   sightline(s,evra,giggsBg??null,sm(lb-.1,lb+.4,t)*(1-sm(ci+.3,ci+.7,t)));}});
  rain(s,t,{n:100,len:16,speed:260,cov:.5,seed:5,w:2.6});
 },
 aperture(t){const c=cam2(t),P=add3(GIGGS_PT,[0,1,0]),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(30,c.F*.6/q[2]),12);},
 still:7.4,
};

// ---------------------------------------------------------------- 3 · the lesson: high behind United's left wing, looking down the whole touchline
const tau3=(t:number)=>key(t,mono([[0,-12.2],[CUE(2,'stamina'),-3],[CUE(2,'last minutes')+.3,T_PASS+.2],[SECS(2),T_PASS+.9]]),linear);
const E3:V3=[-60,9.5,-39];
function cam3v(t:number):Cam{
 const E=()=>evraAt(tau3(t));
 return plan(t,[
  [0,0,()=>({P:E3,T:[-34,0,-22],fov:36})],
  [CUE(2,'Keep running')-.3,1.6,()=>({P:add3(E(),[-17,7,-3.5]),T:add3(E(),[8,.2,.5]),fov:40})],
  [CUE(2,'last minutes')-.5,1.2,()=>({P:[-26,8,-31],T:[-8,.5,-10],fov:36})],
 ]);
}
/** the clock hangs in the air, upper left of the lens (anchored to the camera, drawn in perspective) */
const clockAt=(c:Cam):V3=>add3(c.eye,[c.f[0]*40-c.r[0]*9+c.u[0]*7,c.f[1]*40-c.r[1]*9+c.u[1]*7,c.f[2]*40-c.r[2]*9+c.u[2]*7]);
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),T=tau3(t),tt=twos(t),tp=tau3(tt),tpp=tau3(tt-1/12),E=SECS(2);
  const kr=CUE(2,'Keep running'),ud=CUE(2,'up and down'),ag=CUE(2,'all game'),wo=CUE(2,'When others'),st=CUE(2,'stamina'),lm=CUE(2,'last minutes');
  stadium(s,c,t,[0,1,2,3],{roar:sm(lm,lm+.4,t),flash:.5*sm(lm,lm+.3,t)});
  ground(s,c);
  const fade=1-sm(E-.9,E-.5,t);
  // "keep running up and down the wing": a yellow arrow DOWN the touchline to the byline, a dashed one back UP to defend
  wingLane(s,c,[-62,.01,-31.8],[-4,.01,-31.8],sm(ud-.1,ud+.8,t,easeOut)*fade,Y,.34,140);
  wingLane(s,c,[-6,.01,-29.2],[-64,.01,-29.2],sm(ud+.5,ud+1.3,t,easeOut)*fade,B,.3,150,true);
  // his real run, printed as he goes
  runTrail(s,c,-12,T,sm(kr-.1,kr+.4,t)*fade,Y,.3);
  // "all game long": the match clock fills to minute 102 of 120; it flashes on "the last minutes"
  matchClock(s,c,clockAt(c),3.2,102*easeOut(clamp((t-ag)/1.4)),sm(ag-.1,ag+.35,t)*fade,sm(lm,lm+.2,t)*(1-sm(lm+.5,lm+.9,t)));
  play(s,c,T,tp,tpp,{minBall:8,hero:true,lines:true,near:4,after:({evra})=>{
   // "when others get tired": a yellow ring round Evra, still sprinting; speed lines on "stamina"
   const Ep=posOf(EVRA_I,tp);groundRing(s,c,Ep[0],Ep[1],1.3,sm(wo-.1,wo+.35,t)*fade);
   const sw=sm(st-.1,st+.2,t)*(1-sm(lm+.6,lm+1,t));if(sw>.02&&evra){const v=velOf(EVRA_I,tp),a=pr(c,[Ep[0],1,Ep[1]]),b=pr(c,[Ep[0]-v[0]*.2,1,Ep[1]-v[1]*.2]);
    if(a&&b)speedLines(s,Y,a[0],a[1],Math.atan2(a[1]-b[1],a[0]-b[0])+Math.PI,{n:4,seed:31,len:kAt(c,[Ep[0],1,Ep[1]])*2.4,spread:kAt(c,[Ep[0],1,Ep[1]])*.7,width:Math.max(3,kAt(c,[Ep[0],1,Ep[1]])*.07),cov:.9*sw});}}});
  rain(s,t,{n:90,len:44,speed:1500,cov:.42,seed:11});
 },
 still:5.2,
};

const film:RisoStory={
 id:'evra-signature',format:'11v11',title:"Evra's energetic overlap",
 theme:'Keep running up and down the wing — your stamina wins games in the last minutes',
 ageNote:'Manchester United 1–1 Chelsea (United won 6–5 on penalties), Champions League final, Luzhniki Stadium, Moscow, 21 May 2008, extra time (102nd minute). For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3]);},
 /** Touch: a boot-stud splash on the wet wing — ripples, droplets flung up, a yellow burst. Reduced motion: the still loop. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.6)),fade=age<=0?1:1-clamp((age-.6)/.3),r=rng(seed);
  const rp=new Path2D();for(let k=0;k<3;k++){const rr=(20+40*k)*u+6,pts:Pt[]=[];for(let i=0;i<=28;i++){const a=i/28*TAU;pts.push([x+Math.cos(a)*rr,y+Math.sin(a)*rr*.38]);}rp.addPath(ribbon(pts,5,{close:true,seed:seed+k,taper:0,wobble:.6}));}
  s.fill(R,rp,.8*fade);
  const dp=new Path2D();for(let i=0;i<9;i++){const a=-Math.PI*(.15+.7*r()),sp=60+90*r(),px=x+Math.cos(a)*sp*u,py=y+Math.sin(a)*sp*u+120*u*u;dp.moveTo(px+6,py);dp.arc(px,py,6,0,TAU);}
  s.knockout(dp,.95*fade);s.fill(B,dp,.5*fade);
  if(age>0&&age<.35)sparkBurst(s,Y,x,y-20,70,{n:7,seed,g:1-clamp(age/.35),width:9});
 },
};
export default film;
/** Solved contact points (pitch metres; x to the Chelsea goal line at 0, z across; +z = the main-stand side) — checked by the test. */
export const FACTS={EVRA_PT,GIGGS_PT,HEAD_PT,GOAL,ballAt,T_PASS,T_SAVE,T0,evraAt:(T:number)=>posOf(EVRA_I,T),essienAt:(T:number)=>posOf(ESSIEN_I,T),evraRun:(a:number,b:number)=>distOf(EVRA_I,b)-distOf(EVRA_I,a)};
