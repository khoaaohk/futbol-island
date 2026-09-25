/** Gabriel Martinelli — signature: the press and pounce. Arsenal 3–1 Liverpool, Premier League, Emirates Stadium, London, Sunday
 * 4 February 2024, a winter evening under floodlights: the 67th-minute goal that made it 2–1. An iconic-play riso film (RisoStory, chapters
 * mode) played by the card's picture window (components/CardFilmPlayer.tsx) or StoryFilmPlayer: a 1:1 reconstruction from WRITTEN accounts
 * and one match photograph (the footage itself was not reviewed), printed as a riso sheet.
 *
 * WHY THIS MOMENT (the signature is a trait, lib/town/iconicPlays.json: "the press and pounce", lesson "Chase every loose ball: pressing can
 * turn a defender's mistake into a goal"): it is Martinelli's best-documented goal from pressing a defender into a mistake, against the
 * league leaders. Wikipedia's "Gabriel Martinelli" lists it ("scored as Arsenal defeated Liverpool 3–1, taking advantage of an error from
 * Liverpool's defense"), and two match reports describe the play itself — it is the lesson exactly: he chased a routine long ball that Van
 * Dijk should have dealt with, pushed into him, and the mistake that followed gave him an empty net. This is NOT a staged demo: every beat
 * drawn below is described in the written sources; only the spots, timings and feet are inferred.
 *
 * SOURCES (fetched 24 Sep 2026 with a generic UA, cached under the session scratchpad films/src-cache/):
 *  - BBC Sport, Phil McNulty, "Arsenal 3–1 Liverpool: Gunners move within two points of Premier League leaders" (4 Feb 2024): Saka 14',
 *    Gabriel own goal before half-time, then "a calamitous error, this time between Alisson and Virgil van Dijk, that saw them restore their
 *    lead after 67 minutes. Alisson rushed from his goal and kicked fresh air as Van Dijk tried to deal with a long clearance, leaving
 *    Gabriel Martinelli with the simplest of finishes into an empty net"; "Van Dijk was far too casual and seemed barely aware of
 *    Martinelli's presence as he went to deal with a routine long clearance, the situation not helped by Alisson's injudicious dash from
 *    goal and air-kick"; Konaté later sent off, Trossard 3–1 in stoppage time   https://www.bbc.com/sport/football/68120819
 *    (cache: bbc-ars-liv-2024-feb.txt)
 *  - The Guardian, "Arsenal ignite title hopes as Gabriel Martinelli punishes Liverpool error" (4 Feb 2024): "It was midway through the
 *    second half and it was Virgil van Dijk who suffered the breakdown with Alisson. He had wanted his goalkeeper to deal with a high ball
 *    forward under pressure from Gabriel Martinelli. But after Martinelli had barged into Van Dijk, Alisson missed his kick. Martinelli was
 *    able to roll into the empty net"; the lead photo's alt text: "Alisson and Virgil van Dijk collide enabling Gabriel Martinelli to score"
 *    https://www.theguardian.com/football/2024/feb/04/arsenal-liverpool-premier-league-match-report (cache: guardian-ars-liv-2024-feb.txt)
 *  - The Guardian's match photograph (a Martinelli dribble in the same match, floodlit): KITS on the day — Arsenal red shirt, WHITE long
 *    sleeves, white shorts, WHITE socks with a red zig-zag band; Martinelli in black gloves and yellow boots; Liverpool in their PURPLE
 *    change kit (purple shirts with darker purple sleeves/trim, purple shorts, purple socks; Konaté 5, Gakpo 18); the ball the Premier
 *    League's winter HI-VIS ball, yellow with purple graphics   (cache: guardian-ars-liv-2024-collide.jpg)
 *  - Wikipedia, "Gabriel Martinelli" (raw): the goal and the error; left winger who cuts onto "his strong right foot"
 *    (cache: wiki-gabriel-martinelli.txt)
 * CONFIRMED by those accounts: the match, date, ground and competition; the 67th minute ("midway through the second half"), 2–1; a long
 *  clearance / high ball forward from Arsenal; Van Dijk casual, leaving it for his keeper while Martinelli pressed him; Martinelli
 *  barged into Van Dijk; Alisson rushed from his goal and air-kicked; Alisson and Van Dijk collided; Martinelli rolled the ball into the
 *  EMPTY net. The kits and the yellow ball (the photo). Numbers: Martinelli 11, Van Dijk 4, Alisson 1 (their squad numbers that season).
 * INFERRED (illustrative, kept OUT of the narration): who hit the clearance (an unnamed, unnumbered Arsenal defender) and from where; the
 *  ball's flight and bounces (drawn: one long flight, a bounce ≈ 25 m out, a hop over Alisson's swinging boot, a small hop and a roll);
 *  every spot, speed and timing; that Martinelli came from the left (his usual wing) and pushed his right shoulder into Van Dijk's left
 *  side; Alisson meeting it just outside his box, swinging his RIGHT foot, and the shape of the collision (both drawn going down); the
 *  finish with Martinelli's RIGHT foot from ≈ 8 m (the narration never names a foot); Alisson's keeper kit (unknown: a neutral dark grey);
 *  every other player (unnamed extras, no numbers); the celebration; which end Arsenal attacked and that the main camera sat on
 *  Martinelli's side; the Emirates bowl simplified (red seats, a club-level band, a dark roof with lamps) and the crowd colours; the lesson
 *  chapter's pressing fan and chase arrow (teaching marks over the same play, not a claim about the footage).
 *
 * FRAMING (the TV broadcast, never top-down; full-sheet card window 1.45:1 down to square, never sheet.safe): ch1 = live, the high
 * main-stand camera panning with the long ball in near real time: the clearance, the chase, the barge, the keeper's dash and air-kick,
 * the roll into the empty net and the roar; ch2 = the slow-motion replay from a low camera behind Martinelli's left shoulder: Van Dijk
 * jogging (a red ring: he thinks he has time), Martinelli's chase (yellow) and the barge (a spark), Van Dijk's look back to his keeper
 * (purple, dashed); ch3 = a second replay angle, low beside Liverpool's goal: the air-kick, the crash (a red spark), the ball bouncing free
 * (a yellow ring) and the pounce into the empty net toward the camera; ch4 = the lesson from a raised coaching angle behind Martinelli:
 * the whole chase (a yellow arrow), the press (a red fan onto Van Dijk), the mistake (a red ring) and the goal (a yellow lane).
 * All figures are the shared riso athlete (lib/plays/riso/athlete.ts), routed through ONE adapter, drawPlayer() (which also prints
 * Arsenal's white sleeves). Handedness: the world is right-handed (x toward the goal Liverpool defend, y up, +z = the attackers' right),
 * athlete.ts's own convention, so left and right feet need no mirroring. Inks: yellow (floodlight, grass with navy, the ball, teaching
 * marks), red (Arsenal, skin, the mistake), purple (Liverpool, the night sky with navy), navy (key line, stands, sky). Every action keys
 * off cue times, so the recorded voice (withTiming) re-times the film; every random value is seeded. Budget: ~150–300 plate ops per frame,
 * small / passage figures at `low` detail. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,laneArrow} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,runCycle,backpedal,lunge,strike,keeperSet,keeperDive,celebrate,stand,posed,blendPose,
 STRIKE_CONTACT,type Pose,type Camera,type AthleteStyle,type InkFill,type Place,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets (every cue starts with a plain
 * word: Kokoro splits contractions, so "defender's" only appears mid-sentence); their `at` and each chapter's `seconds` are ESTIMATES
 * (≈2.7 words/s + punctuation pauses) until the Kokoro voice exists. Once the lead has generated
 * public/plays/narration/martinelli-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/martinelli-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The chase, live',text:'Arsenal against Liverpool, 2024. A long ball flies forward. Gabriel Martinelli chases it and keeps pushing. The keeper rushes out, swings... and misses! Martinelli rolls it into the empty net!',tail:2,
  cues:['Arsenal against','long ball','Gabriel Martinelli','chases it','keeps pushing','keeper rushes','swings','and misses','rolls it','empty net']},
 {label:'Watch it again',text:'Watch again, slowly. Van Dijk thinks he has time. But Martinelli presses him, so Van Dijk leaves it for his keeper.',tail:1.4,
  cues:['Watch again','thinks he has time','presses','leaves it','keeper']},
 {label:'The pounce',text:'Alisson and Van Dijk crash together. The ball bounces free, and Martinelli pounces!',tail:2,
  cues:['Alisson','crash together','bounces free','Martinelli pounces']},
 {label:'Your turn',text:"Your turn: chase every loose ball. Pressing can turn a defender's mistake into a goal.",tail:1.6,
  cues:['Your turn','chase every','Pressing','mistake','into a goal']},
];
import timingJson from '../../../public/plays/narration/martinelli-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (≈ Kokoro af_bella's pace): .23 s + .022 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.23+.022*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('martinelli: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('martinelli: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
/** key() needs increasing times: push each key at least `gap` after the previous one (real voice timings can crowd authored offsets) */
function mono(K:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of K)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}

// ---------------------------------------------------------------- inks, vectors
const Y='yellow',R='red',PU='purple',K='navy';
const add3=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const mix3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const wrapA=(a:number)=>{a=(a+Math.PI)%TAU;if(a<0)a+=TAU;return a-Math.PI;};
const lerpA=(a:number,b:number,u:number)=>a+wrapA(b-a)*clamp(u);
/** heading of a ground direction as an athlete yaw (yaw 0 faces +x, + turns left toward −z) */
const yawOf=(dx:number,dz:number)=>Math.atan2(-dz,dx);
/** a smooth bump 0 → 1 → 0 over [a, b] */
const bump=(a:number,b:number,t:number)=>t<=a||t>=b?0:Math.sin(Math.PI*(t-a)/(b-a));
/** a narrower (square) window gets a slightly wider lens so the action still fits; set by frame(), read by every camera */
let LENS=1;
/** Frame the FULL sheet: world (0,0) on the canvas centre at 1 unit per sheet unit (the passage arrival scale still multiplies in). */
function frame(s:Sheet){const S=s.arrival;s.camera((s.cx-s.W/2)/S,(s.cy-s.H/2)/S,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
/** half the visible extents with margin for the .68 passage preview */
const view=(s:Sheet)=>({hx:s.W/(2*.68)+120,hy:s.H/(2*.68)+120});

// ---------------------------------------------------------------- 3D: projection through an athlete.ts Camera (right-handed metres, y up)
/** Pitch: the goal line Liverpool defend is x = 0 (Arsenal attack +x, the halfway line at x = −52.5), the goal centre z = 0, +z = the
 * attackers' right. Martinelli comes from the attackers' LEFT (−z), the main camera's side. */
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

// ---------------------------------------------------------------- the Emirates on a February evening: a continuous red bowl, club-level band, dark roof, lamps
/** stand planes (a along, b up the rake 0..1): 0 the z<0 side (the main camera's side), 1 behind Liverpool's goal, 2 the z>0 side, 3 the
 * other end; 4..7 the corners that close the bowl */
const SIDE=(a:number,b:number,s:number):V3=>[lerp(-118,14,s>0?1-a:a),1.4+26*b,s*(41+34*b)];
const END=(a:number,b:number,x0:number,d:number):V3=>[x0+d*30*b,1.4+26*b,lerp(-56,56,d>0?a:1-a)];
const STANDS:((a:number,b:number)=>V3)[]=[(a,b)=>SIDE(a,b,-1),(a,b)=>END(a,b,8,1),(a,b)=>SIDE(a,b,1),(a,b)=>END(a,b,-112,-1)];
const CORNER=(i:number,a:number,b:number):V3=>mix3(STANDS[i](1,b),STANDS[(i+1)%4](0,b),a);
const ALL=(i:number)=>i<4?STANDS[i]:(a:number,b:number)=>CORNER(i-4,a,b);
const STAND_COLS=[100,70,100,70,14,14,14,14],STAND_ROWS=13,BAND=[.44,.52];
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 // a February evening over north London: the navy sky with a purple screen, paper showing through the halftone
 s.field(K,.86,.55);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz)s.tone(PU,polyPath([[-1e4,hz[1]-520],[1e4,hz[1]-520],[1e4,hz[1]+60],[-1e4,hz[1]+60]],true),.35);
 const planes=new Path2D(),band=new Path2D(),roof=new Path2D(),edge=new Path2D();
 const ws=[...which,...which.flatMap(i=>{const n=(i+1)%4,p=(i+3)%4;return[which.includes(n)?4+i:-1,which.includes(p)?4+p:-1];})].filter((x,k,a)=>x>=0&&a.indexOf(x)===k);
 for(const i of ws){const S=ALL(i);addPoly(planes,polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]));addPoly(band,polyP(c,[S(0,BAND[0]),S(1,BAND[0]),S(1,BAND[1]),S(0,BAND[1])]));
  addPoly(roof,polyP(c,[add3(S(0,1),[0,1.5,0]),add3(S(1,1),[0,1.5,0]),add3(S(1,.74),[0,9,0]),add3(S(0,.74),[0,9,0])]));
  seg3(c,add3(S(0,.74),[0,8.8,0]),add3(S(1,.74),[0,8.8,0]),.5,edge);}
 s.knockout(planes);s.tone(R,planes,.62);s.tone(K,planes,.38);s.knockout(band,.8);s.tone(K,band,.22);
 // the crowd in winter coats: seeded dots (paper faces and scarves, Arsenal red, dark coats), sized by distance; roar lifts them
 const inks=[new Path2D(),new Path2D(),new Path2D()];
 for(const si of ws){const S=ALL(si),cols=STAND_COLS[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(b>BAND[0]-.03&&b<BAND[1]+.03)continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,5);if(h<.28)continue;const a=(i+.5+(hash(i+j*31,9)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const ink=h<.58?0:h<.88?1:2;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.75);s.fill(R,inks[1],.95);s.fill(K,inks[2],.8);
 s.knockout(roof);s.fill(K,roof,.92);s.knockout(edge,.8);
 const lamp=new Path2D();for(const i of which){const S=STANDS[i];for(let k=0;k<7;k++){const u=(k+.5)/7,a=add3(S(u-.03,.74),[0,8.2,0]),b=add3(S(u+.03,.74),[0,8.2,0]);if(toCam(c,a)[2]<NEAR+2)continue;seg3(c,a,b,1,lamp);}}
 s.knockout(lamp);s.fill(Y,lamp,.75);
 if(flash>0){const p=new Path2D(),n=Math.round(20*flash);for(let i=0;i<n;i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,STANDS[si](r2,.1+.8*hash(i,Math.floor(tt*12))));if(!q)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
// ---------------------------------------------------------------- floodlit grass, lines, LED boards, corner flags, the goal
const BOARD_Z=37.9,BOARD_H=.95;
type GoalO={bulge?:number;goalLater?:boolean};
function ground(s:Sheet,c:Cam,o:GoalO={}){
 const g=polyP(c,[[-118,0,-46],[14,0,-46],[14,0,46],[-118,0,46]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.72);s.tone(K,gp,.52);
 // mowing stripes across the width, every 5.5 m
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.5,0,-34],[-(k+1)*5.5,0,-34],[-(k+1)*5.5,0,34],[-k*5.5,0,34]]));s.tone(K,st,.12);
 // LED boards: navy with glowing red and yellow panels
 const bd=new Path2D(),pn=new Path2D(),py=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,BOARD_H,0]),add3(a,[0,BOARD_H,0])]));
 board([5,0,-38],[5,0,38]);board([-110,0,-BOARD_Z],[5,0,-BOARD_Z]);board([-110,0,BOARD_Z],[5,0,BOARD_Z]);
 for(let k=0;k<12;k++){const z=-36+k*6.2;addPoly(k%3?pn:py,polyP(c,[[4.9,.2,z],[4.9,.2,z+3.6],[4.9,.75,z+3.6],[4.9,.75,z]]));}
 for(const zz of[-BOARD_Z+.05,BOARD_Z-.05])for(let k=0;k<18;k++){const x=-108+k*6.4;addPoly(k%3?pn:py,polyP(c,[[x,.2,zz],[x+3.8,.2,zz],[x+3.8,.75,zz],[x,.75,zz]]));}
 s.knockout(bd);s.fill(K,bd,.92);s.knockout(pn,.8);s.fill(R,pn,.9);s.knockout(py,.8);s.fill(Y,py,.9);
 // painted lines: touchlines, goal line, halfway line + circle, the box, the six-yard box, the arc and the spot
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
 for(let k=0;k<8;k++){L([-k*13.125,0,-34],[-(k+1)*13.125,0,-34]);L([-k*13.125,0,34],[-(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){L([0,0,-34+k*17],[0,0,-34+(k+1)*17]);L([-52.5,0,-34+k*17],[-52.5,0,-34+(k+1)*17]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(-52.5,0,9.15);
 L([0,0,-20.16],[-16.5,0,-20.16]);L([-16.5,0,-20.16],[-16.5,0,20.16]);L([-16.5,0,20.16],[0,0,20.16]);
 L([0,0,-9.16],[-5.5,0,-9.16]);L([-5.5,0,-9.16],[-5.5,0,9.16]);L([-5.5,0,9.16],[0,0,9.16]);
 {const a=Math.acos(5.5/9.15);circ(-11,0,9.15,Math.PI-a,Math.PI+a,12);}
 seg3(c,[-11.1,0,0],[-10.9,0,0],.22,ln);
 circ(0,-34,1,Math.PI/2,Math.PI,4);circ(0,34,1,Math.PI,Math.PI*1.5,4);
 s.knockout(ln);
 const pole=new Path2D(),flag=new Path2D();for(const z of[-34,34]){seg3(c,[0,0,z],[0,1.55,z],.05,pole);addPoly(flag,polyP(c,[[0,1.55,z],[0,1.2,z],[-.45,1.38,z]]));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(Y,flag,.95);
 if(!o.goalLater)goal3(s,c,o.bulge??0);
}
/** the goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep with a sloping roof; bulge pushes the back out around the shot's spot */
const NET_Z=-1.25,NET_Y=.2;
function goal3(s:Sheet,c:Cam,bulge:number){
 const X=0,z0=-3.66,z1=3.66,H=2.44,back=(z:number,y:number)=>X+2+bulge*.7*Math.exp(-Math.pow((z-NET_Z)/1.5,2)-Math.pow((y-NET_Y)/1.1,2));
 const zs=[z0,-1.8,0,1.8,3,z1],ys=[0,.63,1.27,1.9];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0,1.9),1.9,z0],[back(z0,0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1,1.9),1.9,z1],[back(z1,0),0,z1]],
  [[X,H,z0],[X,H,z1],...zs.slice().reverse().map(z=>[back(z,1.9),1.9,z] as V3)],
  [...zs.map(z=>[back(z,0),0,z] as V3),...zs.slice().reverse().map(z=>[back(z,1.9),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.35);s.tone(K,net,.1);
 const mesh=new Path2D();
 for(let i=0;i<=14;i++){const z=lerp(z0,z1,i/14);seg3(c,[X,H,z],[back(z,1.9),1.9,z],.022,mesh,.7);for(let j=0;j<3;j++)seg3(c,[back(z,ys[3-j]),ys[3-j],z],[back(z,ys[2-j]),ys[2-j],z],.022,mesh,.7);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<zs.length-1;i++)seg3(c,[back(zs[i],y),y,zs[i]],[back(zs[i+1],y),y,zs[i+1]],.022,mesh,.7);seg3(c,[X,y*H/1.9,z0],[back(z0,y),y,z0],.022,mesh,.7);seg3(c,[X,y*H/1.9,z1],[back(z1,y),y,z1],.022,mesh,.7);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+2*u,H-.54*u,z0],[X+2*u,H-.54*u,z1],.022,mesh,.7);}
 s.fill(K,mesh,.7);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.2,fo);seg3(c,[X,0,z1],[X,H,z1],.2,fo);seg3(c,[X,H,z0-.04],[X,H,z1+.04],.2,fo);
 s.fill(K,fo,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- the cast: kits (athlete.ts styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.28],[PU,.06]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.3]];
/** Arsenal (the photo): red shirts (white sleeves over-printed by drawPlayer), white shorts, white socks with a red band, white numbers */
const ARS=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[R,.95],shorts:'paper',socks:'paper',boots:K,skin:SKIN_L,hair:K,line:K,trim:[R,.9],numberInk:'paper',hairStyle:'short',...o});
/** Arsenal's kit is recognised by its ink recipe (styles are copied per frame, so no identity set) */
const isArsenal=(st:AthleteStyle)=>st.shorts==='paper'&&Array.isArray(st.shirt)&&st.shirt[0]===R;
/** Liverpool's purple change kit (the photo): purple shirts, shorts and socks, darker trim, paper numbers */
const LIV=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[PU,.9],shorts:[PU,.9],socks:[PU,.9],boots:K,skin:SKIN_L,hair:K,line:K,trim:[K,.75],numberInk:'paper',hairStyle:'short',number:null,...o});
/** Martinelli 11: long white sleeves, black gloves and yellow boots (all in the photo) */
const MAR_ST=ARS({number:11,hair:[K,.92],sleeves:'long',gloves:[K,.9],boots:[Y,.95],build:{height:1.78,bulk:.95},seed:11});
const VVD_ST=LIV({number:4,skin:SKIN_D,hair:[K,.95],build:{height:1.95,bulk:1.08},seed:4});
/** Alisson 1: keeper kit not in the sources — a neutral dark grey; paper gloves */
const ALI_ST:AthleteStyle={shirt:[K,.55],shorts:[K,.72],socks:[K,.55],boots:K,skin:SKIN_M,hair:[K,.95],hairStyle:'short',line:K,trim:[K,.8],shade:[K,.3],gloves:'paper',sleeves:'long',number:1,numberInk:'paper',build:{height:1.93,bulk:1.04},seed:1};

// ---------------------------------------------------------------- the players: keyframed tracks (τ = seconds after Alisson's air-kick ≈ 0)
type Role='mar'|'ars'|'liv'|'gk';
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];moves?:{kind:'lunge';at:number;dur:number;side:'l'|'r'}[];key?:boolean};
/** Positions are Hermite-interpolated between keys [τ, x, z]. The beats the sources give (the long clearance, Martinelli's chase and
 * barge, Van Dijk leaving it, Alisson's dash and air-kick, the collision, the roll into the empty net) are kept; every spot is inferred. */
const ACTORS:Actor[]=[
 {name:'Martinelli',role:'mar',style:MAR_ST,key:true,keys:[[-7,-53,-9.5],[-5,-51.5,-8.6],[-3.4,-46.5,-7],[-2.2,-36.4,-4.4],[-1.2,-27.6,-2.2],[-.7,-22.9,-1.25],[-.45,-20.7,-1.5],[-.2,-18.5,-2],[.3,-14.3,-1.95],[.7,-10.7,-1.2],[1,-8.35,-.75],[1.4,-5.9,-.7],[2.3,-3.2,-3.2],[3.4,-2.6,-8],[6,-2.4,-15]]},
 {name:'Van Dijk',role:'liv',style:VVD_ST,key:true,keys:[[-7,-45.5,3],[-5,-43.5,2.8],[-3.4,-39.5,2.2],[-2.2,-31.8,1.2],[-1.2,-25.4,.5],[-.7,-22.1,.12],[-.45,-20.4,-.05],[-.2,-18.75,-.2],[.15,-18.3,-.4],[6,-18.3,-.4]]},
 {name:'Alisson',role:'gk',style:ALI_ST,key:true,keys:[[-7,-8.6,.2],[-3.4,-8.3,.3],[-2.2,-9,.3],[-1.6,-11.2,.2],[-.9,-15,.15],[-.5,-17.1,.08],[-.2,-17.85,0],[.3,-18,0],[6,-18,0]]},
 {name:'Arsenal defender',role:'ars',style:ARS({skin:SKIN_M,build:{height:1.88},seed:6}),key:true,keys:[[-7,-70.5,-9],[-5.4,-68.6,-7.8],[-4,-67.1,-6.8],[-3.4,-66.6,-6.4],[-2,-64.5,-5.4],[6,-58,-4]]},
 {name:'Havertz',role:'ars',style:ARS({number:29,hair:[Y,.6],build:{height:1.93},seed:29}),keys:[[-7,-66,4],[-3.4,-62,3],[0,-45,1],[2,-37,0],[6,-27,-2]]},
 {name:'Saka',role:'ars',style:ARS({number:7,skin:SKIN_D,build:{height:1.78},seed:7}),keys:[[-7,-60,22],[-3.4,-58,21],[0,-44,17],[6,-29,12]]},
 {name:'Arsenal midfielder',role:'ars',style:ARS({skin:SKIN_D,seed:20}),keys:[[-7,-75,-2],[6,-58,-3]]},
 {name:'Liverpool midfielder',role:'liv',style:LIV({seed:10}),key:true,keys:[[-7,-83.5,1.6],[-5.9,-82.2,1.6],[-5.4,-81.6,1.5],[-3.4,-79,1],[0,-71,1],[6,-60,1]]},
 {name:'Liverpool centre-back',role:'liv',style:LIV({skin:SKIN_D,build:{height:1.92,bulk:1.05},seed:5}),keys:[[-7,-44,-14],[-3.4,-40.5,-12.5],[-1,-29.5,-10.5],[.5,-21.5,-9],[2,-15,-7],[6,-12.5,-6]]},
 {name:'Liverpool full-back',role:'liv',style:LIV({seed:26}),keys:[[-7,-51,18],[-3.4,-48,17],[0,-33,13],[6,-25,10]]},
 {name:'Liverpool midfielder 2',role:'liv',style:LIV({skin:SKIN_M,seed:18}),keys:[[-7,-70,10],[0,-58,7],[6,-47,5]]},
 {name:'Liverpool forward',role:'liv',style:LIV({skin:SKIN_M,seed:9}),keys:[[-7,-77,-12],[6,-69,-10]]},
];
const IX=(n:string)=>ACTORS.findIndex(a=>a.name===n);
const MAR=IX('Martinelli'),VVD=IX('Van Dijk'),GK=IX('Alisson'),CLR=IX('Arsenal defender'),LM=IX('Liverpool midfielder');
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const T0=-7,T1=6,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const smooth=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau),b=posOf(k,tau-.3),d=posOf(k,tau-.6);return[(a[0]+b[0]+d[0])/3,(a[1]+b[1]+d[1])/3];};
const headingOf=(k:number,tau:number)=>{const v=velOf(k,tau);return yawOf(v[0],v[1]);};
/** a foot spot: ahead of the body and to the side of the given foot, along its heading */
function footSpot(k:number,tau:number,foot:'l'|'r',ahead=.5,side=.13):[number,number]{const y=headingOf(k,tau),p=posOf(k,tau),f:Pt=[Math.cos(y),-Math.sin(y)],r:Pt=[Math.sin(y),Math.cos(y)],sd=foot==='r'?side:-side;return[p[0]+f[0]*ahead+r[0]*sd,p[1]+f[1]*ahead+r[1]*sd];}

// ---------------------------------------------------------------- the ball: the loose pass, THE LONG CLEARANCE, the bounces, the air-kick, the roll into the empty net
/** LPASS = the Liverpool pass that is cut out; CLEAR = the long clearance; LAND1 = its first bounce ≈ 25 m out; SWING = Alisson's
 * air-kick (the ball hops over his boot); LAND2 / LAND3 = the hops that carry it free; SHOT = Martinelli's roll; IN_NET */
const LPASS=-5.4,CLEAR=-3.4,LAND1=-1.2,SWING=-.5,CRASH=-.2,LAND2=-.1,LAND3=.42,SHOT=1,IN_NET=1.9;
const LM_PT=footSpot(LM,LPASS,'r',.5),CLR_PT=footSpot(CLR,CLEAR,'r',.45);
const B1:[number,number]=[-24.6,-.6],B2:[number,number]=[-13.8,.1],B3:[number,number]=[-10.3,.3];
const SHOT_PT=footSpot(MAR,SHOT,'r',.45);
const GOAL_PT:V3=[0,NET_Y,NET_Z],NET_PT:V3=[1.6,.3,NET_Z-.1],REST:V3=[1.3,.11,NET_Z+.5];
const lerp3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
/** a rolling ball: fast off the foot, slowing (dec = how much) */
const roll=(a:V3,b:V3,u:number,dec=.3):V3=>{const e=u*(1+dec-dec*u);return lerp3(a,b,e);};
const g3=(p:[number,number]):V3=>[p[0],.11,p[1]];
/** a hop from a to b between t0 and t1 with an apex h metres high */
const hop=(a:[number,number],b:[number,number],t0:number,t1:number,h:number,tau:number):V3=>{const u=(tau-t0)/(t1-t0);return[lerp(a[0],b[0],u),.11+4*h*u*(1-u),lerp(a[1],b[1],u)];};
function ballAt(tau:number):V3{
 if(tau<LPASS){const p=footSpot(LM,tau,'r',.55);return[p[0],.11,p[1]];}
 if(tau<CLEAR)return roll(g3(LM_PT),g3(CLR_PT),(tau-LPASS)/(CLEAR-LPASS),.3);
 if(tau<LAND1)return hop(CLR_PT,B1,CLEAR,LAND1,5.9,tau);
 if(tau<LAND2)return hop(B1,B2,LAND1,LAND2,1.48,tau);
 if(tau<LAND3)return hop(B2,B3,LAND2,LAND3,.33,tau);
 if(tau<SHOT)return roll(g3(B3),g3(SHOT_PT),(tau-LAND3)/(SHOT-LAND3),.35);
 if(tau<IN_NET){const b=roll(g3(SHOT_PT),GOAL_PT,(tau-SHOT)/(IN_NET-SHOT),.15);return[b[0],.11+(NET_Y-.11)*clamp((tau-SHOT)/(IN_NET-SHOT)),b[2]];}
 const u=clamp((tau-IN_NET)/.2);if(u<1)return lerp3(GOAL_PT,NET_PT,easeOut(u));
 const v=clamp((tau-IN_NET-.2)/.5);return[lerp(NET_PT[0],REST[0],v),Math.max(.11,NET_PT[1]*(1-v*v)+.11*v*v),lerp(NET_PT[2],REST[2],v)];
}
const bulgeAt=(tau:number)=>tau<IN_NET-.02?0:Math.exp(-(tau-IN_NET+.02)*2.4)*(1+.3*Math.sin((tau-IN_NET)*14))*.8;
const spinAt=(tau:number)=>tau<CLEAR?tau*5:tau<LAND2?CLEAR*5+(tau-CLEAR)*14:CLEAR*5+(LAND2-CLEAR)*14+(Math.min(tau,IN_NET)-LAND2)*10;
/** where the collision happens (between Van Dijk and Alisson at CRASH) */
const crashPt=():[number,number]=>{const a=posOf(VVD,CRASH),b=posOf(GK,CRASH);return[(a[0]+b[0])/2,(a[1]+b[1])/2];};

// ---------------------------------------------------------------- poses (angles in degrees via posed; the athlete clamps to real range of motion)
const RAD=Math.PI/180;
const LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const READY=posed({lHipF:30,rHipF:26,lKnee:40,rKnee:36,lHipA:10,rHipA:10,lean:14,pitch:4,lShA:24,rShA:24,lShF:12,rShF:12,lElb:44,rElb:44,neckP:-6});
/** Martinelli's barge: his RIGHT shoulder dropped into Van Dijk's left side, elbow tucked, body leaning in */
const BARGE:Partial<Pose>={bend:18,twist:-10,lean:20,rShA:18,rShF:6,rElb:88,lShA:44,lElb:60,neckY:8,squash:-.05};
/** Van Dijk rocked by it: bent away to his right, arms out for balance */
const ROCKED:Partial<Pose>={bend:16,lShA:52,rShA:40,lElb:30,rElb:36,lean:6,neckY:-24};
/** after the collision: Van Dijk down on his knees, head bowed */
const DOWN=posed({lHipF:70,lKnee:112,rHipF:-8,rKnee:118,lean:36,pitch:4,neckP:26,lShA:30,rShA:34,lShF:30,rShF:24,lElb:40,rElb:46});
const inWin=(u:number)=>Math.min(sm(0,.12,u),1-sm(1,1.35,u));
/** the whole pose of actor k at τ, with its yaw */
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(Math.min(tau,IN_NET-.01));
 const toBall=yawOf(b[0]-x,b[2]-z),velY=yawOf(v[0],v[1]);
 let yaw=sp>.6?velY:toBall;
 // defenders and the keeper keep their eyes on the ball while they shuffle; they only turn their backs on it to sprint
 if(a.role==='liv'||a.role==='gk')yaw=lerpA(toBall,velY,sm(3.4,5,sp));
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='liv'?READY:stand();
 let p:Pose;
 if(sp>.6&&along<-.35*sp)p=blendPose(idle,backpedal(distOf(k,tau)/1.25),clamp((sp-.6)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(distOf(k,tau)/(2.4+1.5*s),{speed:s}),clamp((sp-.5)/.9));}
 for(const mv of a.moves??[]){const u=(tau-(mv.at-.6*mv.dur))/mv.dur;if(u>0&&u<1.5)p=blendPose(p,lunge(Math.min(1,u),{side:mv.side}),inWin(u));}
 if(k===MAR){
  // the chase: head up on the ball in the air, then the barge, then the roll into the empty net (right foot, a gentle side-foot)
  if(tau<LAND1)p=over(p,{neckP:-18},.7);
  p=over(p,BARGE,bump(-1,-.4,tau));
  const D=.75,u=(tau-(SHOT-STRIKE_CONTACT*D))/D;if(u>0&&u<1.4){p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.35}),inWin(u));yaw=lerpA(yaw,yawOf(GOAL_PT[0]-x,GOAL_PT[2]-z),.8*inWin(u));}
  if(tau>IN_NET+.3)p=blendPose(p,celebrate(tau*.85,{kind:'run'}),sm(IN_NET+.3,IN_NET+.8,tau));}
 if(k===VVD){
  // jogging back, eyes on the ball: casual (he thinks his keeper has it)
  if(tau<-1)p=over(p,{neckY:22,neckP:-14},.8);
  p=over(p,ROCKED,bump(-.8,-.25,tau));
  if(tau>CRASH-.05){const u=clamp((tau-CRASH+.05)/.6);p=blendPose(p,DOWN,easeOut(u));yaw=lerpA(yaw,headingOf(VVD,CRASH-.3),1);}}
 if(k===GK){
  // the dash from his goal, facing out, the swing at the bouncing ball (fresh air), then the collision: down on the grass
  if(tau<CRASH)yaw=lerpA(toBall,Math.PI,sm(-2.2,-1.6,tau));
  const D=.85,u=(tau-(SWING-STRIKE_CONTACT*D))/D;if(u>0&&u<1.4&&tau<CRASH+.1){p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.95}),inWin(u));yaw=Math.PI;}
  if(tau>=CRASH){const u=clamp((tau-CRASH)/.9);p=blendPose(p,keeperDive(.55+.4*u,{side:'l',height:0}),sm(0,.15,u));yaw=Math.PI;}}
 if(k===CLR){const D=.8,u=(tau-(CLEAR-STRIKE_CONTACT*D))/D;if(u>0&&u<1.4){p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:1}),inWin(u));yaw=lerpA(yaw,yawOf(B1[0]-x,B1[1]-z),.9*inWin(u));}
  if(tau>IN_NET+.5)p=over(p,{lShA:150,rShA:150,lShF:20,rShF:20,lElb:14,rElb:14,neckP:-20,lHand:1,rHand:1},sm(IN_NET+.5,IN_NET+1,tau));}
 if(k===LM){const D=.8,u=(tau-(LPASS-STRIKE_CONTACT*D))/D;if(u>0&&u<1.4){p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.55}),inWin(u));yaw=lerpA(yaw,yawOf(CLR_PT[0]-x,CLR_PT[1]-z),.9*inWin(u));}
  if(tau<LPASS-.3)yaw=headingOf(LM,tau);}
 if(a.role==='ars'&&k!==CLR&&tau>IN_NET+.6)p=over(p,{lShA:150,rShA:150,lShF:20,rShF:20,lElb:14,rElb:14,neckP:-20,lHand:1,rHand:1},sm(IN_NET+.6,IN_NET+1.1,tau));
 if(a.role==='liv'&&k!==VVD&&tau>IN_NET+.7)p=over(p,{lean:38,neckP:40,lShF:-10,rShF:-10,lShA:14,rShA:14},sm(IN_NET+.7,IN_NET+1.5,tau)*.8);
 return{p,yaw};
}

// ---------------------------------------------------------------- THE ADAPTER: every figure in this film is drawn here
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): the shared riso athlete (fluid FK body, kit inks, halftone shade, key
 * line); prev = the pose one drawing earlier (secondary motion: hair and hem trail); smear = a halftone echo + speed lines on fast limbs.
 * Arsenal shirts get their WHITE SLEEVES here: athlete.ts prints one shirt ink, so at mid/high detail the sleeve of each arm in front of
 * the chest is knocked back to paper and re-outlined (the upper arm; the whole arm down to the cuff for Martinelli's long sleeves). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:{pose:Pose;place:Place},smear=false):DrawResult{
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 const res=drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
 if(isArsenal(style)&&res.detail!=='low'){const sk=res.sk,dc=toCam(camera,sk.chest)[2],p=new Path2D(),long=style.sleeves==='long';let n=0;
  for(const side of['l','r'] as const){const sh=sk[`${side}Sh`],el=sk[`${side}El`],ha=sk[`${side}Ha`];if(toCam(camera,sh)[2]>dc+.1)continue;
   const d:V3=[el[0]-sh[0],el[1]-sh[1],el[2]-sh[2]],a=add3(sh,[d[0]*.1,d[1]*.1,d[2]*.1]),b=long?el:add3(sh,[d[0]*.46,d[1]*.46,d[2]*.46]),A=pr(camera,a),Bq=pr(camera,b);if(!A||!Bq)continue;
   const w=Math.max(3,kAt(camera,sh)*.13*sk.s*(style.build?.bulk??1));
   p.addPath(ribbon([A,Bq],w,{taper:0,wobble:0,seed:3}));n++;
   if(long){const e=[ha[0]-el[0],ha[1]-el[1],ha[2]-el[2]],c2=pr(camera,add3(el,[e[0]*.78,e[1]*.78,e[2]*.78]));if(c2)p.addPath(ribbon([Bq,c2],w*.82,{taper:.15,wobble:0,seed:4}));}}
  if(n){s.knockout(p,.95);s.stroke(K,p,Math.max(1.2,res.heightPx*.012),.8);}}
 return res;
}

// ---------------------------------------------------------------- drawing the match through a camera
type PlayOut={joints:Map<number,DrawResult>;bg:Pt|null;br:number};
type PlayO={minBall?:number;hero?:number;smear?:boolean;under?:()=>void;after?:(r:PlayOut)=>void};
/** the Premier League's winter ball: yellow with purple graphics (the photo) */
function drawBall(s:Sheet,x:number,y:number,r:number,rot:number){footballPanels(s,x,y,r,{rot,key:PU,shadow:K,seed:5});s.fill(Y,polyPath(blob(x,y,r*.97,r*.97,5,{amp:.025}),true),.9);}
/** everything on the pitch at τ (positions on ones, poses on twos at τp; τprev = the drawing before, for secondary motion), depth-sorted.
 * Heat: small figures and extras print at `low` detail; inside a passage only the hero keeps `mid`. */
function play(s:Sheet,c:Cam,tau:number,tauP:number,tauPrev:number,o:PlayO={}):PlayOut{
 const{minBall=8,hero=-1}=o,v=view(s);
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!s._passage.pending;
 type E={k:number;x:number;z:number;g:Pt;h:number;d:number};
 const list:E[]=[];
 ACTORS.forEach((_,k)=>{const[x,z]=posOf(k,tau),q=toCam(c,[x,.9,z]);if(q[2]<1.2)return;const g=scr(c,toCam(c,[x,0,z])),h=c.F*1.85/q[2];
  if(Math.abs(g[0])>v.hx+h||g[1]<-v.hy||g[1]-h>v.hy+h)return;list.push({k,x,z,g,h,d:q[2]});});
 const b=ballAt(tau),bq=toCam(c,b),bg=bq[2]>=NEAR?scr(c,bq):null,br=bg?Math.max(minBall,c.F*.11/bq[2]):0,bground=pr(c,[b[0],0,b[2]]);
 // ground shadows batched in one op (floodlights: short and soft); the ball's shadow shrinks as it climbs
 const sh=new Path2D();for(const e of list)sh.addPath(polyPath(blob(e.g[0],e.g[1],e.h*.13,e.h*.035,ACTORS[e.k].style.seed??1,{amp:.05,n:14}),true));
 if(bground&&bg&&b[0]<.05){const f=1/(1+b[1]*.25);sh.addPath(polyPath(blob(bground[0],bground[1],br*.8*f,br*.25*f,2,{amp:.05,n:12}),true));}s.tone(K,sh,.42);
 o.under?.();
 list.sort((p,q)=>q.d-p.d);
 const ball=()=>{if(bg)drawBall(s,bg[0],bg[1],br,spinAt(tau));};
 const joints=new Map<number,DrawResult>();
 let ballDone=!list.length||bq[2]>=list[0].d;if(ballDone)ball();
 for(const e of list){if(!ballDone&&bq[2]>=e.d){ball();ballDone=true;}
  const a=ACTORS[e.k],isHero=e.k===hero,{p,yaw}=poseOf(e.k,tauP),px=e.h*ppu;
  const detail=passing?(isHero?'mid':'low'):px<50||(!a.key&&px<110)?'low':'auto';
  const pl:Place={x:e.x,z:e.z,yaw},big=px>=70&&!passing;
  const prev=big&&(isHero||a.key)?{pose:poseOf(e.k,tauPrev).p,place:pl}:undefined;
  const r=drawPlayer(s,p,c,{...a.style,shadow:false,detail},pl,prev,!!o.smear&&isHero&&big);
  if(a.key)joints.set(e.k,r);}
 if(!ballDone)ball();
 const out={joints,bg,br};o.after?.(out);return out;
}
/** a broadcast replay wipe: long halftone strokes across the frame */
function streaks(s:Sheet,amt:number,seed:number){if(amt<=.02)return;const v=view(s),p=new Path2D(),r=rng(seed);
 for(let i=0;i<16;i++){const y=(r()-.5)*2*v.hy,x0=(r()-.5)*2*v.hx,L=v.hx*(.6+r()*.9);p.addPath(ribbon([[x0-L,y],[x0+L,y]],12+r()*30,{seed:seed+i,taper:.8,wobble:1.5}));}
 s.tone(K,p,.55*amt);s.knockout(p,.35*amt);}

// ---------------------------------------------------------------- teaching marks, shared by the replays and the lesson
/** a ring painted on the grass (x, z), radius in metres; grows in with w */
function ring(s:Sheet,c:Cam,x:number,z:number,rad:number,w:number,ink=Y,seed=43){if(w<=.02)return;const pts:Pt[]=[];for(let i=0;i<40;i++){const a=i/40*TAU,q=pr(c,[x+Math.cos(a)*rad*(.7+.3*w),0,z+Math.sin(a)*rad*(.7+.3*w)]);if(q)pts.push(q);}
 if(pts.length<30)return;const rr=ribbon(pts,Math.max(5,kAt(c,[x,0,z])*.16),{close:true,seed,taper:0,wobble:1.2});s.knockout(rr,.9*w);s.fill(ink,rr,.95*w);}
/** an arrow painted along a ground path (x, z points), drawn in with w */
function groundArrow(s:Sheet,c:Cam,pts:[number,number][],w:number,ink:string,seed=61){if(w<=.02)return;
 const sp:Pt[]=[];let d=1;for(const[x,z] of pts){const q=toCam(c,[x,.02,z]);if(q[2]<1)continue;sp.push(scr(c,q));d=q[2];}
 if(sp.length<3)return;const n=Math.max(2,Math.round(sp.length*w)),seg=sp.slice(0,n),wd=Math.max(6,c.F*.16/d);
 s.knockout(ribbon(seg,wd*1.7,{seed,taper:.1,wobble:.8}),.8);s.fill(ink,ribbon(seg,wd,{seed,taper:.1,wobble:.8}),.95);
 const a=seg[seg.length-2],b=seg[seg.length-1];laneArrow(s,ink,a,[b[0]+(b[0]-a[0])*.01,b[1]+(b[1]-a[1])*.01],wd,{seed:seed+1,head:wd*3});}
/** actor k's run from τa to τb as ground points */
const runPts=(k:number,ta:number,tb:number,n=14):[number,number][]=>{const o:[number,number][]=[];for(let i=0;i<=n;i++)o.push(posOf(k,lerp(ta,tb,i/n)));return o;};
/** the roll into the empty net as ground points */
const shotPts=(n=10):[number,number][]=>{const o:[number,number][]=[];for(let i=0;i<=n;i++){const u=i/n;o.push([lerp(SHOT_PT[0],GOAL_PT[0],u),lerp(SHOT_PT[1],GOAL_PT[2],u)]);}return o;};
/** a dashed sight line from a head to a point, in an ink */
function sightLine(s:Sheet,r:DrawResult|undefined,to:Pt|null,w:number,ink=Y,seed=91){if(!r||!to||w<=.02)return;const h=r.joints.head,u=Math.max(4,Math.hypot(h[0]-r.joints.neck[0],h[1]-r.joints.neck[1])*.35);
 const end:Pt=[lerp(h[0],to[0],w),lerp(h[1],to[1],w)];s.knockout(ribbon([h,end],u*1.8,{seed,taper:.2,wobble:.6}),.7);laneArrow(s,ink,h,end,u,{dashed:true,seed:seed+1,head:u*3});}
/** a spark at a 3D point that pops at `at` (chapter time) */
function pop(s:Sheet,c:Cam,P:V3,t:number,at:number,ink:string,seed:number,size=1){const age=t-at;if(age<=-.12||age>=.9)return;const q=pr(c,P);if(!q)return;
 sparkBurst(s,ink,q[0],q[1],kAt(c,P)*size,{n:9,seed,g:easeOutBack(clamp((age+.12)/.25))*(1-clamp((age-.55)/.35)),width:12});}
/** a fan painted on the grass from (x, z) toward a heading (the lesson's pressing arc) */
function fan(s:Sheet,c:Cam,x:number,z:number,dir:number,len:number,w:number,ink:string){if(w<=.02)return;const pts:Pt[]=[];const o=pr(c,[x,.05,z]);if(!o)return;pts.push(o);
 for(let i=0;i<=10;i++){const a=dir-.4+.8*i/10,q=pr(c,[x+Math.cos(a)*len*w,.05,z-Math.sin(a)*len*w]);if(q)pts.push(q);}
 if(pts.length<5)return;const f=polyPath(pts,true);s.knockout(f,.35*w);s.tone(ink,f,.55*w);s.stroke(K,f,2,.6*w);}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, panning with the long ball in near real time
/** τ from chapter-1 time, keyed to the cue words */
const tau1=(t:number)=>{const S=SECS(0),RI=CUE(0,'rolls it');return key(t,mono([[0,-6.6],[CUE(0,'long ball'),CLEAR-.15],[CUE(0,'Gabriel Martinelli'),-2.3],[CUE(0,'chases it'),-1.55],[CUE(0,'keeps pushing'),-.95],[CUE(0,'keeper rushes'),-.78],[CUE(0,'swings'),-.62],[CUE(0,'and misses')+.1,SWING+.08],[RI,SHOT-.12],[CUE(0,'empty net')+.2,IN_NET],[S+1,IN_NET+(S+1-CUE(0,'empty net')-.2)*.85]]),linear);};
const P1:V3=[-40,17,-56];
function cam1(t:number):Cam{
 const S=SECS(0),EN=CUE(0,'empty net'),tau=tau1(t);
 // ride the ball (smoothed; a little of its height so the long ball stays in frame), leaning toward the goal once the chase is on
 const bs=(u:number):V3=>{const b=ballAt(Math.min(u,IN_NET));return[b[0],b[1]*.45,b[2]];},b0=bs(tau),b1=bs(tau-.35),b2=bs(tau-.7),bt:V3=[(b0[0]+b1[0]+b2[0])/3,(b0[1]+b1[1]+b2[1])/3,(b0[2]+b1[2]+b2[2])/3];
 const m=posOf(MAR,tau),chase=sm(-2.6,-1.4,tau)*(1-sm(.6,1.4,tau)),toM=sm(EN+.6,EN+1.6,t,easeInOutSine);
 const T0:V3=[lerp(bt[0],m[0],.3*chase)+1.5*chase,.5+bt[1],lerp(bt[2],m[1],.3*chase)],T=mix3(T0,[m[0]+1,1,m[1]-1],toM);
 const fov=key(t,[[0,11],[CUE(0,'long ball')+.3,15],[CUE(0,'Gabriel'),11],[CUE(0,'keeps pushing'),8],[CUE(0,'and misses'),7.5],[EN,8.5],[EN+1.4,6.5],[S,6.2]],easeInOutSine);
 return cam3(P1,T,fov);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tau=tau1(t),tt=twos(t),EN=CUE(0,'empty net');
  stadium(s,c,t,[2,1,3],{roar:sm(EN,EN+.4,t),flash:sm(EN,EN+.25,t)*(1-sm(EN+2.4,EN+3.4,t))});
  ground(s,c,{bulge:bulgeAt(tau)});
  play(s,c,tau,tau1(tt),tau1(tt-1/12),{minBall:10,hero:MAR,smear:true});
 },
 aperture(t){const c=cam1(t),P=ballAt(Math.min(tau1(t),IN_NET)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:CUE(0,'and misses')+.3,
};

// ---------------------------------------------------------------- 2 · slow replay, low behind Martinelli's left shoulder: the press
const tau2=(t:number)=>key(t,mono([[0,-2.3],[CUE(1,'thinks he has time'),-1.75],[CUE(1,'presses'),-.98],[CUE(1,'leaves it'),-.72],[SECS(1),-.5]]),linear);
function cam2(t:number):Cam{
 const tau=tau2(t),m=smooth(MAR,tau),vd=smooth(VVD,tau),gk=posOf(GK,tau),open=1-sm(0,1.2,t,easeInOutSine),wide=sm(CUE(1,'leaves it')-.4,CUE(1,'leaves it')+.5,t,easeInOutSine);
 const C:V3=[m[0]-5.6-.6*wide+2*open,2.4+.8*wide,m[1]-3.2-.6*wide],T:V3=[lerp(lerp(m[0],vd[0],.5)+2,gk[0],.3*wide),.9,lerp(lerp(m[1],vd[1],.5),gk[1],.3*wide)];
 return cam3(C,T,28+6*wide+4*open);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tau=tau2(t),tt=twos(t),th=CUE(1,'thinks he has time'),ps=CUE(1,'presses'),li=CUE(1,'leaves it'),E=SECS(1);
  stadium(s,c,t,[1,2]);
  ground(s,c);
  const[bx,bz]=posOf(MAR,-.62);
  play(s,c,tau,tau2(tt),tau2(tt-1/12),{minBall:7,hero:MAR,smear:true,
   under:()=>{
    // "thinks he has time": a red ring under Van Dijk, jogging
    const[vx,vz]=posOf(VVD,tau);ring(s,c,vx,vz,1.2,sm(th-.15,th+.25,t,easeOutBack)*(1-sm(E-.7,E-.35,t)),R,44);
    // "presses": Martinelli's chase painted up to Van Dijk's shoulder (yellow)
    groundArrow(s,c,runPts(MAR,-2.3,-.7),sm(ps-.3,ps+.4,t,easeOut)*(1-sm(E-.8,E-.4,t)),Y,63);
    // "leaves it for his keeper": a purple ring under Alisson, rushing out
    const[gx,gz]=posOf(GK,tau);ring(s,c,gx,gz,1.3,sm(li-.1,li+.3,t,easeOutBack)*(1-sm(E-.6,E-.3,t)),PU,45);},
   after:({joints})=>{
    // the barge: a spark where the shoulders meet
    const[vx,vz]=posOf(VVD,-.62);pop(s,c,[(bx+vx)/2,1.45,(bz+vz)/2],t,ps+.15,Y,97,.9);
    // "leaves it": Van Dijk's look back to his keeper (purple, dashed)
    const[gx,gz]=posOf(GK,tau);sightLine(s,joints.get(VVD),pr(c,[gx,1.6,gz]),sm(li,li+.45,t,easeOut)*(1-sm(E-.5,E-.2,t)),PU,95);}});
  streaks(s,1-sm(0,.5,t),21);
 },
 aperture(t){const c=cam2(t),[x,z]=posOf(MAR,tau2(t)),q=toCam(c,[x,1.1,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.16/q[2]),12);},
 still:4.2,
};

// ---------------------------------------------------------------- 3 · second replay angle, low beside Liverpool's goal: the crash, the ball free, the pounce
const tau3=(t:number)=>{const P=CUE(2,'Martinelli pounces');return key(t,mono([[0,-.95],[CUE(2,'Alisson')+.2,SWING-.08],[CUE(2,'crash together')+.1,CRASH+.02],[CUE(2,'bounces free')+.1,LAND3-.1],[P+.25,SHOT],[P+1.25,IN_NET],[SECS(2),IN_NET+(SECS(2)-P-1.25)*.8]]),linear);};
const C3:V3=[4.2,2.1,-8.8];
function cam3v(t:number):Cam{
 const tau=tau3(t),m=smooth(MAR,tau),cp=crashPt(),b=ballAt(Math.min(tau,IN_NET));
 const early:V3=[cp[0]+1,1,cp[1]],mid:V3=[lerp(m[0],b[0],.5),.9,lerp(m[1],b[2],.5)],late:V3=[-3.6,.9,-1.2];
 const T=mix3(mix3(early,mid,sm(LAND2,LAND3+.3,tau,easeInOutSine)),late,sm(SHOT-.1,IN_NET+.1,tau,easeInOutSine));
 return cam3(mix3(C3,add3(C3,[1,.2,-1.2]),sm(0,SECS(2),t)),T,lerp(8.5,22,sm(LAND3,IN_NET,tau))+3*sm(IN_NET,IN_NET+1,tau));
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tau=tau3(t),tt=twos(t),ct=CUE(2,'crash together'),bf=CUE(2,'bounces free'),po=CUE(2,'Martinelli pounces'),E=SECS(2);
  stadium(s,c,t,[0,2,3],{roar:sm(IN_NET,IN_NET+.3,tau),flash:sm(IN_NET,IN_NET+.3,tau)*(1-sm(E-1.2,E-.6,t))});
  ground(s,c,{goalLater:true});
  const cp=crashPt();
  play(s,c,tau,tau3(tt),tau3(tt-1/12),{minBall:6,hero:MAR,smear:true,
   under:()=>{
    // "crash together": a red ring where the keeper and his defender meet
    ring(s,c,cp[0],cp[1],1.5,sm(ct-.1,ct+.3,t,easeOutBack)*(1-sm(po,po+.5,t)),R,46);
    // "there to pounce": Martinelli's path to the loose ball and on into the empty net (yellow)
    groundArrow(s,c,[...runPts(MAR,Math.min(Math.max(tau,-.2),.6),SHOT-.05,8),...shotPts(8).slice(1)],sm(po-.35,po+.5,t,easeOut)*(1-sm(E-.8,E-.4,t)),Y,65);},
   after:({bg,br})=>{
    // the crash: a red spark
    pop(s,c,[cp[0],1.3,cp[1]],t,ct+.1,R,98,1.1);
    // "bounces free": a yellow ring on the loose ball
    const w=sm(bf-.15,bf+.2,t)*(1-sm(po+.2,po+.6,t));if(bg&&w>.02){const rr:Pt[]=[];for(let i=0;i<24;i++){const a=i/24*TAU;rr.push([bg[0]+Math.cos(a)*br*2.3,bg[1]+Math.sin(a)*br*2.3]);}
     const r=ribbon(rr,Math.max(4,br*.5),{close:true,seed:5,taper:0,wobble:1});s.knockout(r,.8*w);s.fill(Y,r,.95*w);}}});
  // the goal stands between this camera and the pitch: printed over the players; the net bulges toward us
  goal3(s,c,bulgeAt(tau));
  pop(s,c,[NET_PT[0]-.8,.5,NET_PT[2]],tau,IN_NET,Y,99,1.1);
  streaks(s,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3v(t),[x,z]=posOf(MAR,tau3(t)),q=toCam(c,[x,1.1,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.16/q[2]),12);},
 still:3.2,
};

// ---------------------------------------------------------------- 4 · the lesson, raised behind Martinelli: chase, press, the mistake, the goal
const tau4=(t:number)=>key(t,mono([[0,-3.2],[CUE(3,'chase every'),-2.7],[CUE(3,'Pressing'),-1.05],[CUE(3,'mistake'),CRASH],[CUE(3,'into a goal'),SHOT-.05],[SECS(3),IN_NET+.4]]),linear);
function cam4(t:number):Cam{
 const tau=tau4(t),m=smooth(MAR,Math.min(tau,CRASH-.3)),push=sm(0,1.4,t,easeInOutSine),follow=sm(CUE(3,'mistake')-.3,SECS(3)-.4,t,easeInOutSine);
 const C:V3=[m[0]-5.6-1.5*(1-push)-1.5*follow,3+1*follow,m[1]-3.4-1*(1-push)],T:V3=[lerp(m[0]+6,-9,follow),.7,lerp(m[1]+1.5,-.5,follow)];
 return cam3(C,T,30+4*(1-push)+6*follow);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4(t),tau=tau4(t),tt=twos(t),ce=CUE(3,'chase every'),pp=CUE(3,'Pressing'),mi=CUE(3,'mistake'),ig=CUE(3,'into a goal'),E=SECS(3);
  stadium(s,c,t,[1,2]);
  ground(s,c,{bulge:bulgeAt(tau)});
  const cp=crashPt();
  play(s,c,tau,tau4(tt),tau4(tt-1/12),{minBall:7,hero:MAR,smear:true,
   under:()=>{
    // "chase every loose ball": his whole chase painted ahead of him, to where the ball will drop free
    groundArrow(s,c,runPts(MAR,Math.max(-3.2,Math.min(tau,-1.2)),SHOT-.1,16),sm(ce-.2,ce+.7,t,easeOut)*(1-sm(E-.8,E-.4,t)),Y,67);
    // "Pressing": a red fan from Martinelli onto Van Dijk while he closes him down
    const[mx,mz]=posOf(MAR,tau),[vx,vz]=posOf(VVD,tau);fan(s,c,mx,mz,yawOf(vx-mx,vz-mz),Math.max(1.5,Math.hypot(vx-mx,vz-mz)+.6),sm(pp-.2,pp+.3,t)*(1-sm(mi-.1,mi+.3,t)),R);
    // "mistake": a red ring where the keeper and Van Dijk crash
    ring(s,c,cp[0],cp[1],1.6,sm(mi-.1,mi+.3,t,easeOutBack)*(1-sm(E-.8,E-.4,t)),R,48);
    // "into a goal": the yellow lane into the empty net
    groundArrow(s,c,shotPts(),sm(ig-.1,ig+.5,t,easeOut)*(1-sm(E-.5,E-.2,t)),Y,69);},
   after:()=>{pop(s,c,[cp[0],1.3,cp[1]],t,mi+.05,R,93,1);pop(s,c,[NET_PT[0]-.8,.5,NET_PT[2]],tau,IN_NET,Y,94,.9);}});
 },
 still:4.4,
};

const film:RisoStory={
 id:'martinelli-signature',format:'11v11',title:"Martinelli's Press and Pounce",
 theme:"Chase every loose ball: pressing can turn a defender's mistake into a goal",
 ageNote:'Arsenal 3–1 Liverpool, Premier League, Emirates Stadium, London, 4 February 2024 (the 67th minute). For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',purple:'#765ba7',navy:'#22366b'},order:['yellow','red','purple','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a pounce — a yellow chase arrow darts from the touch to a bouncing yellow ball. Reduced motion: the still arrow. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.45)),fade=age<=0?1:1-clamp((age-.55)/.25),r=rng(seed),dir=-.5+(r()-.5)*.6;
  const e:Pt=[x+Math.cos(dir)*220*u,y+Math.sin(dir)*220*u],hopY=age<=0?0:-60*Math.abs(Math.sin(age*7))*(1-clamp(age/1.2));
  if(u>.05)laneArrow(s,Y,[x,y],e,14,{seed,head:40,cov:.95*fade});
  if(age>0&&age<.3)sparkBurst(s,R,x,y,80,{n:8,seed,g:1-clamp(age/.3),width:10});
  drawBall(s,e[0]+30,e[1]+hopY,28,age*12);
 },
};
export default film;
