/** Martin Ødegaard — signature: the defence-splitting pass. Arsenal 1–0 Porto (1–1 on aggregate, Arsenal won 4–2 on penalties),
 * Champions League round of 16, second leg, Emirates Stadium, London, Tuesday 12 March 2024 (21:00 CET, a night match under
 * floodlights): the 41st-minute goal. An iconic-play riso film (RisoStory, chapters mode) played by the card's picture window
 * (components/CardFilmPlayer.tsx) or StoryFilmPlayer: a 1:1 reconstruction from WRITTEN accounts and one match photograph (the footage
 * itself was not reviewed), printed as a riso sheet.
 *
 * WHY THIS MOMENT (the signature is a trait, lib/town/iconicPlays.json: "the defence-splitting pass", lesson "Scan the pitch before you
 * receive so you already know your next pass"): it is Ødegaard's best-documented through-pass on a big European night, the assist for
 * the goal that took Arsenal to their first Champions League quarter-final in 14 years (Wikipedia: "providing the assist for Arsenal's
 * equaliser in the tie"). The Guardian describes the pass beat by beat, and it is exactly the lesson: while he was dodging two
 * defenders "he could see Trossard make his move in behind the ball-watching João Mário" — he already knew his next pass.
 *
 * SOURCES (fetched 23 Sep 2026 with a generic UA, cached under the session scratchpad films/src-cache/):
 *  - The Guardian, David Hytner, "David Raya the shootout hero as Arsenal battle past Porto and into quarter-finals" (12 Mar 2024):
 *    "Arsenal creating nothing clearcut until Ødegaard cut away from Francisco Conceição in the 41st minute, then doing the same to
 *    Eduardo Pepê, having faked to shoot. As he did so, he could see Trossard make his move in behind the ball-watching João Mário.
 *    Ødegaard punched it into Trossard, whose first touch was true and the second was even better, a low insertion into the far corner";
 *    photo caption "Leandro Trossard beats Porto goalkeeper Diogo Costa with his shot to give Arsenal a 1-0 lead on the night"
 *    https://www.theguardian.com/football/2024/mar/12/arsenal-porto-champions-league-last-16-second-leg-match-report
 *    (cache: guardian-ars-porto-2024-report.txt; the photo guardian-ars-porto-2024-trossard.jpg)
 *  - The Guardian live blog, "Arsenal beat Porto on penalties to reach Champions League last eight – as it happened" (12 Mar 2024):
 *    "GOAL! Arsenal 1-0 Porto (Trossard 40')"; Kiwior at left-back (cache: guardian-ars-porto-2024-live.txt)
 *  - Wikipedia, "2023–24 UEFA Champions League knockout phase" (raw): 12 March 2024, 21:00, Emirates Stadium, Trossard 41', 1–0 aet,
 *    4–2 on penalties, referee Clément Turpin (cache: wiki-2023-24-ucl-ko.txt)
 *  - Wikipedia, "Martin Ødegaard" (raw): the Porto assist; "a 'modern' playmaker known for his ... vision and range of passing"
 *    (cache: wiki-martin-odegaard.txt)
 * CONFIRMED by those accounts: the match, date, ground, night kick-off, the 41st minute (the live blog says 40'), 1–0 on the night;
 *  Ødegaard cutting away from Francisco Conceição, then from Pepê after faking to shoot; Trossard's run in behind João Mário, who was
 *  ball-watching; Ødegaard "punched" the pass into Trossard; Trossard's first touch, then a LOW finish into the FAR corner past Diogo
 *  Costa. KITS (the Guardian photo of the finish): Arsenal red shirts with WHITE SLEEVES, white shorts, white socks with red; Porto their
 *  blue-and-white STRIPED home shirts, blue shorts, blue socks; Diogo Costa all YELLOW with green gloves; Pepe on the pitch near Trossard
 *  as he shot. Numbers: Ødegaard 8, Trossard 19, Saka 7, Havertz 29, Rice 41 (the squad numbers that season).
 * INFERRED (illustrative, kept OUT of the narration): every exact position, speed and timing; where Ødegaard received the ball (≈ 30 m
 *  out, right of centre, from a short pass by Rice, back to goal) and the shape of his two cuts; his LEFT foot for the touches, the fake
 *  and the pass (his stronger foot); Trossard in the inside-left channel (João Mário being Porto's right-back) and his RIGHT foot for the
 *  touch and the shot; the ball's route through the gap between João Mário and Pepe; Costa edging toward his near post (his right) and
 *  diving late to his left (toward the far post); Pepe's late lunge; the other players' spots (Havertz central, Saka wide right, Porto's
 *  midfield); unnamed players carry no numbers; Costa's number (99, only partly visible in the photo) and his green gloves drawn blue;
 *  which end Arsenal attacked and that the main camera sat on the attackers' right (so Trossard runs on the FAR side of the screen);
 *  the Emirates bowl simplified (red seats, a club-level band, a dark roof with lamps); the crowd colours; the celebration; the lesson
 *  chapter's shoulder checks before the ball arrives (a teaching reenactment of "scan", not a claim about that night).
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = live, the high main-stand camera panning in near real time: Rice to Ødegaard, the
 * turn away from Conceição, the fake and the cut past Pepê, the pass, Trossard's touch and the low shot; ch2 = the slow-motion replay
 * from a raised camera behind Ødegaard's right shoulder: his sight line to Trossard (yellow, dashed), Trossard's run (blue) in behind
 * João Mário, whose eyes are only on the ball (a red ring and his eye line); ch3 = a second replay angle, low beside the goal (as the
 * Guardian photographer saw it): the pass through the gap (a yellow gate), the first touch, the low shot past Costa into the far corner;
 * ch4 = the lesson over Ødegaard's shoulder: shoulder checks (scan arcs) before the ball arrives, the next pass already drawn (a yellow
 * lane to a target), then the pass. All figures are the shared riso athlete (lib/plays/riso/athlete.ts), routed through ONE adapter,
 * drawPlayer() (which also prints Arsenal's white sleeves). Full-sheet card-window framing (1.45:1 to square), never sheet.safe.
 * Handedness: the world is right-handed (x toward the goal Porto defend, y up, +z = the attackers' right), athlete.ts's own convention,
 * so left and right feet need no mirroring. Every action keys off cue times, so the recorded voice (withTiming) re-times the film; every
 * random value is seeded. Budget: ~150–300 plate ops per frame, small / passage figures at `low` detail. */
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
 * word: Kokoro splits contractions); their `at` and each chapter's `seconds` are ESTIMATES (≈2.7 words/s + punctuation pauses) until
 * the Kokoro voice exists. Once the lead has generated public/plays/narration/odegaard-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/odegaard-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The pass, live',text:'Arsenal against Porto, 2024. Martin Ødegaard has the ball. He turns away from one defender, fakes a shot, and beats another. Then the pass, through the gap to Trossard... Goal!',tail:2,
  cues:['Arsenal against','Martin','turns away','fakes a shot','beats another','Then the pass','through the gap','Goal']},
 {label:'Watch it again',text:'Watch again, slowly. As he dodges, Ødegaard already sees Trossard sneaking in behind a defender who only watches the ball.',tail:1.5,
  cues:['Watch again','dodges','already sees','sneaking in','only watches']},
 {label:'Through the gap',text:'He punches it through the gap. First touch, then a low shot into the far corner!',tail:1.7,
  cues:['punches it','through the gap','First touch','low shot','far corner']},
 {label:'Your turn',text:'Your turn: scan the pitch before the ball comes to you. Then you already know your next pass.',tail:1.5,
  cues:['Your turn','scan the pitch','before the ball','already know','next pass']},
];
import timingJson from '../../../public/plays/narration/odegaard-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (≈ Kokoro af_bella's pace): .23 s + .022 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.23+.022*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('odegaard: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('odegaard: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
/** key() needs increasing times: push each key at least `gap` after the previous one (real voice timings can crowd authored offsets) */
function mono(K:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of K)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}

// ---------------------------------------------------------------- inks, vectors
const Y='yellow',R='red',B='blue',K='navy';
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
/** Pitch: the goal line Porto defend is x = 0 (Arsenal attack +x, the halfway line at x = −52.5), the goal centre z = 0, +z = the
 * attackers' right (the main-camera side). */
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

// ---------------------------------------------------------------- the Emirates at night: a continuous red bowl, club-level band, dark roof, lamps
/** stand planes (a along, b up the rake 0..1): 0 the far side (z<0), 1 behind the goal, 2 the near side (z>0, the camera side), 3 the
 * other end; 4..7 the corners that close the bowl */
const SIDE=(a:number,b:number,s:number):V3=>[lerp(-118,14,s>0?1-a:a),1.4+26*b,s*(41+34*b)];
const END=(a:number,b:number,x0:number,d:number):V3=>[x0+d*30*b,1.4+26*b,lerp(-56,56,d>0?a:1-a)];
const STANDS:((a:number,b:number)=>V3)[]=[(a,b)=>SIDE(a,b,-1),(a,b)=>END(a,b,8,1),(a,b)=>SIDE(a,b,1),(a,b)=>END(a,b,-112,-1)];
const CORNER=(i:number,a:number,b:number):V3=>mix3(STANDS[i](1,b),STANDS[(i+1)%4](0,b),a);
const ALL=(i:number)=>i<4?STANDS[i]:(a:number,b:number)=>CORNER(i-4,a,b);
const STAND_COLS=[100,70,100,70,14,14,14,14],STAND_ROWS=13,BAND=[.44,.52];
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 // a March night over north London: the navy sky, a faint blue glow above the roof
 s.field(K,.86,.55);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz)s.tone(B,polyPath([[-1e4,hz[1]-520],[1e4,hz[1]-520],[1e4,hz[1]+60],[-1e4,hz[1]+60]],true),.3);
 const planes=new Path2D(),band=new Path2D(),roof=new Path2D(),edge=new Path2D();
 const ws=[...which,...which.flatMap(i=>{const n=(i+1)%4,p=(i+3)%4;return[which.includes(n)?4+i:-1,which.includes(p)?4+p:-1];})].filter((x,k,a)=>x>=0&&a.indexOf(x)===k);
 for(const i of ws){const S=ALL(i);addPoly(planes,polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]));addPoly(band,polyP(c,[S(0,BAND[0]),S(1,BAND[0]),S(1,BAND[1]),S(0,BAND[1])]));
  addPoly(roof,polyP(c,[add3(S(0,1),[0,1.5,0]),add3(S(1,1),[0,1.5,0]),add3(S(1,.74),[0,9,0]),add3(S(0,.74),[0,9,0])]));
  seg3(c,add3(S(0,.74),[0,8.8,0]),add3(S(1,.74),[0,8.8,0]),.5,edge);}
 s.knockout(planes);s.tone(R,planes,.62);s.tone(K,planes,.38);s.knockout(band,.8);s.tone(K,band,.22);
 // the crowd: seeded dots (Arsenal red and white, a few Porto blue), sized by distance; roar lifts them
 const inks=[new Path2D(),new Path2D(),new Path2D()];
 for(const si of ws){const S=ALL(si),cols=STAND_COLS[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(b>BAND[0]-.03&&b<BAND[1]+.03)continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,5);if(h<.28)continue;const a=(i+.5+(hash(i+j*31,9)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const ink=h<.62?0:h<.93?1:2;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.75);s.fill(R,inks[1],.95);s.fill(B,inks[2],.85);
 s.knockout(roof);s.fill(K,roof,.92);s.knockout(edge,.8);
 const lamp=new Path2D();for(const i of which){const S=STANDS[i];for(let k=0;k<7;k++){const u=(k+.5)/7,a=add3(S(u-.03,.74),[0,8.2,0]),b=add3(S(u+.03,.74),[0,8.2,0]);if(toCam(c,a)[2]<NEAR+2)continue;seg3(c,a,b,1,lamp);}}
 s.knockout(lamp);s.fill(Y,lamp,.75);
 if(flash>0){const p=new Path2D(),n=Math.round(20*flash);for(let i=0;i<n;i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,STANDS[si](r2,.1+.8*hash(i,Math.floor(tt*12))));if(!q)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
// ---------------------------------------------------------------- floodlit grass, lines, LED boards, corner flags, the goal
const BOARD_Z=37.9,BOARD_H=.95;
type GoalO={bulge?:number;post?:number;goalLater?:boolean};
function ground(s:Sheet,c:Cam,o:GoalO={}){
 const g=polyP(c,[[-118,0,-46],[14,0,-46],[14,0,46],[-118,0,46]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.95);s.tone(B,gp,.8);s.tone(K,gp,.14);
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
 if(!o.goalLater)goal3(s,c,o.bulge??0,o.post??0);
}
/** the goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep with a sloping roof; bulge pushes the back out around the shot's spot
 * (low, at the far post, +z); post = a yellow flash on that post */
const NET_Z=3.05,NET_Y=.32;
function goal3(s:Sheet,c:Cam,bulge:number,post:number){
 const X=0,z0=-3.66,z1=3.66,H=2.44,back=(z:number,y:number)=>X+2+bulge*.8*Math.exp(-Math.pow((z-NET_Z)/1.5,2)-Math.pow((y-NET_Y)/1.1,2));
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
 if(post>0){const p=new Path2D();seg3(c,[X,0,z1],[X,H,z1],.13,p);s.fill(Y,p,.95*post);}
}

// ---------------------------------------------------------------- the cast: kits (athlete.ts styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.28],[B,.08]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.3]];
/** Arsenal: red shirts (white sleeves over-printed by drawPlayer), white shorts, white socks with red trim, white numbers */
const ARS=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[R,.95],shorts:'paper',socks:'paper',boots:K,skin:SKIN_L,hair:K,line:K,trim:[R,.9],numberInk:'paper',hairStyle:'short',...o});
/** Arsenal's kit is recognised by its ink recipe (styles are copied per frame, so no identity set) */
const isArsenal=(st:AthleteStyle)=>st.shorts==='paper'&&Array.isArray(st.shirt)&&st.shirt[0]===R;
/** Porto: blue-and-white vertical stripes, blue shorts, blue socks (the Guardian photo); numbers left off (not in the sources) */
const POR=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[B,.92],pattern:'stripes',patternInk:'paper',shorts:[B,.92],socks:[B,.92],boots:K,skin:SKIN_L,hair:K,line:K,trim:'paper',hairStyle:'short',number:null,...o});
const ODE_ST=ARS({number:8,hair:[Y,.72],build:{height:1.78,bulk:.96},seed:8});
const TRO_ST=ARS({number:19,hair:[K,.9],build:{height:1.72,bulk:.97},seed:19});
/** Diogo Costa: all yellow (the photo), navy number, gloves drawn blue (green in the photo) */
const COSTA:AthleteStyle={shirt:[Y,.95],shorts:[Y,.95],socks:[Y,.95],boots:K,skin:SKIN_L,hair:[K,.95],hairStyle:'short',line:K,trim:[K,.6],shade:[K,.3],gloves:[B,.85],sleeves:'long',number:99,numberInk:[K,.9],build:{height:1.86},seed:99};

// ---------------------------------------------------------------- the players: keyframed tracks (τ = seconds after Ødegaard's first touch)
type Role='ode'|'ars'|'por'|'gk';
type Move={kind:'lunge'|'dive';at:number;dur:number;side:'l'|'r'};
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];moves?:Move[];key?:boolean};
/** Positions are Hermite-interpolated between keys [τ, x, z]. The beats the Guardian gives (the cut away from Conceição, the fake and the
 * cut past Pepê, Trossard's run in behind the ball-watching João Mário, the pass, the touch, the low shot into the far corner) are kept;
 * every exact spot is inferred. */
const ACTORS:Actor[]=[
 {name:'Ødegaard',role:'ode',style:ODE_ST,key:true,keys:[[-4.6,-28.4,1.6],[-2.2,-29,2.2],[-1,-29.7,2.7],[0,-30.4,3.1],[.45,-30.3,3.6],[.85,-29.7,4.4],[1.5,-28.2,4.7],[2.1,-26.7,4.3],[2.45,-26,3.8],[2.85,-25.4,2.7],[3.4,-24.6,1.7],[4.2,-23.2,1.2],[5.5,-21,.4],[7.5,-18.6,-.8],[9,-17.5,-1.5]]},
 {name:'Trossard',role:'ars',style:TRO_ST,key:true,keys:[[-4.6,-20.2,-15.6],[0,-19.8,-15],[1.6,-19.3,-14],[2.4,-18.7,-13],[3,-17.2,-11.8],[3.6,-14.8,-10.2],[4.2,-12.4,-8.8],[4.6,-11.2,-8.1],[4.9,-10.6,-7.8],[5.6,-9.4,-7.4],[6.6,-9.2,-10],[9,-10.5,-15.5]]},
 {name:'Rice',role:'ars',style:ARS({number:41,hair:[K,.85],build:{height:1.85,bulk:1.04},seed:41}),key:true,keys:[[-4.6,-42,8.4],[-2.5,-39.8,7.6],[-1,-38.5,6.9],[0,-37.9,6.5],[3,-34.5,5],[9,-28,3]]},
 {name:'Havertz',role:'ars',style:ARS({number:29,hair:[Y,.6],build:{height:1.93},seed:29}),keys:[[-4.6,-17,1.6],[3,-15.5,.9],[4.5,-11.5,.6],[5.8,-8.6,1],[9,-7.5,-2]]},
 {name:'Saka',role:'ars',style:ARS({number:7,skin:SKIN_D,build:{height:1.78},seed:7}),keys:[[-4.6,-24,24.5],[3,-20.5,22],[5.5,-15,17],[9,-11,10]]},
 {name:'Arsenal midfielder',role:'ars',style:ARS({skin:SKIN_M,seed:20}),keys:[[-4.6,-45,-4],[9,-37,-3]]},
 {name:'Arsenal right-back',role:'ars',style:ARS({skin:SKIN_D,seed:4}),keys:[[-4.6,-39,22],[9,-31,20]]},
 {name:'Arsenal left-back',role:'ars',style:ARS({seed:15}),keys:[[-4.6,-37,-24],[9,-27,-22]]},
 {name:'Conceição',role:'por',style:POR({build:{height:1.7},seed:10}),key:true,moves:[{kind:'lunge',at:.62,dur:.8,side:'r'}],keys:[[-4.6,-24.5,-1.5],[-2,-26.4,.2],[-1,-27.6,1.4],[0,-28.9,2.1],[.6,-29.1,2.6],[1.3,-30.3,2.2],[2.4,-30.6,1.8],[9,-27,.5]]},
 {name:'Pepê',role:'por',style:POR({skin:SKIN_D,build:{height:1.75},seed:11}),key:true,moves:[{kind:'lunge',at:2.5,dur:.8,side:'l'}],keys:[[-4.6,-20.5,9.5],[0,-21.8,8.2],[1.2,-22.6,7.2],[2,-24.1,5.6],[2.45,-24.7,4.8],[3,-25,4.3],[4,-24.6,3.4],[9,-21.5,1.5]]},
 {name:'João Mário',role:'por',style:POR({skin:SKIN_M,build:{height:1.79},seed:23}),key:true,keys:[[-4.6,-18.2,-11.6],[1,-18.5,-11.4],[2.6,-18.8,-11],[3.3,-18.4,-10.8],[3.9,-16.6,-10.2],[4.6,-14,-9.2],[5.4,-12,-8.3],[9,-11,-8]]},
 {name:'Pepe',role:'por',style:POR({skin:SKIN_M,hair:[K,.5],build:{height:1.88,bulk:1.05},seed:3}),key:true,moves:[{kind:'lunge',at:4.98,dur:.8,side:'l'}],keys:[[-4.6,-15.6,-3],[1,-16,-3.4],[3,-16.5,-4],[3.8,-14.8,-5.3],[4.5,-12.6,-6.5],[4.9,-11.9,-6.9],[5.4,-11.3,-7],[9,-10.6,-6.4]]},
 {name:'Porto centre-back',role:'por',style:POR({build:{height:1.82},seed:4}),keys:[[-4.6,-15.8,3.2],[3,-17,2],[4.5,-12.5,-.2],[5.6,-9.6,-.8],[9,-8.6,-1]]},
 {name:'Porto left-back',role:'por',style:POR({skin:SKIN_D,seed:18}),keys:[[-4.6,-19,13],[3,-21,11],[9,-16,8]]},
 {name:'Porto midfielder',role:'por',style:POR({seed:22}),keys:[[-4.6,-25.5,-5.5],[2,-27.6,-2.4],[4,-24.6,-3.4],[9,-19.5,-4]]},
 {name:'Porto midfielder 2',role:'por',style:POR({skin:SKIN_M,seed:16}),keys:[[-4.6,-31,-9.5],[3,-31,-6.5],[9,-26,-5]]},
 {name:'Costa',role:'gk',style:COSTA,key:true,moves:[{kind:'dive',at:5.3,dur:.95,side:'l'}],keys:[[-4.6,-3.6,-.4],[2,-3.4,-.9],[3.4,-3.2,-1.5],[4.3,-2.6,-2.3],[4.9,-2.4,-2.2],[9,-2.4,-2.2]]},
];
const IX=(n:string)=>ACTORS.findIndex(a=>a.name===n);
const ODE=IX('Ødegaard'),TRO=IX('Trossard'),RICE=IX('Rice'),CON=IX('Conceição'),PEP=IX('Pepê'),JM=IX('João Mário'),PEPE=IX('Pepe'),GK=IX('Costa');
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const T0=-4.6,T1=9,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const smooth=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau),b=posOf(k,tau-.3),d=posOf(k,tau-.6);return[(a[0]+b[0]+d[0])/3,(a[1]+b[1]+d[1])/3];};
const headingOf=(k:number,tau:number)=>{const v=velOf(k,tau);return yawOf(v[0],v[1]);};
/** a foot spot: ahead of the body and to the side of the given foot, along a given heading */
function footSpotY(k:number,tau:number,y:number,foot:'l'|'r',ahead=.5,side=.13):[number,number]{const p=posOf(k,tau),f:Pt=[Math.cos(y),-Math.sin(y)],r:Pt=[Math.sin(y),Math.cos(y)],sd=foot==='r'?side:-side;return[p[0]+f[0]*ahead+r[0]*sd,p[1]+f[1]*ahead+r[1]*sd];}
const footSpot=(k:number,tau:number,foot:'l'|'r',ahead=.5,side=.13)=>footSpotY(k,tau,headingOf(k,tau),foot,ahead,side);

// ---------------------------------------------------------------- the ball: Rice's pass in, Ødegaard's touches, THE PASS, the touch, the shot
const RICE_PASS=-1,PASS=3.4,MEET=4.2,SHOT=4.9,IN_NET=5.46;
/** Ødegaard's touches (left foot): the first touch facing Rice, the turn away from Conceição, two carrying touches, the cut past Pepê */
const TOUCHES=[0,.85,1.5,2.1,2.9,PASS];
const TP:[number,number][]=TOUCHES.map((t,i)=>i===0?footSpotY(ODE,t,yawOf(posOf(RICE,RICE_PASS)[0]-posOf(ODE,0)[0],posOf(RICE,RICE_PASS)[1]-posOf(ODE,0)[1]),'l',.45):footSpot(ODE,t,'l',.5));
const RICE_PT=footSpot(RICE,RICE_PASS,'r',.5);
const MEET_PT=footSpot(TRO,MEET,'r',.42);
const SHOT_PT=footSpot(TRO,SHOT,'r',.45);
const GOAL_PT:V3=[0,NET_Y,NET_Z],NET_PT:V3=[1.5,.34,NET_Z+.1],REST:V3=[1.2,.11,NET_Z-.5];
const lerp3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
/** a rolling ball: fast off the foot, slowing (dec = how much) */
const roll=(a:V3,b:V3,u:number,dec=.3):V3=>{const e=u*(1+dec-dec*u);return lerp3(a,b,e);};
const g3=(p:[number,number]):V3=>[p[0],.11,p[1]];
function ballAt(tau:number):V3{
 if(tau<RICE_PASS){const p=footSpot(RICE,tau,'r',.55);return[p[0],.11,p[1]];}
 if(tau<0)return roll(g3(RICE_PT),g3(TP[0]),(tau-RICE_PASS)/-RICE_PASS,.25);
 if(tau<PASS){let k=0;while(k+1<TOUCHES.length&&tau>=TOUCHES[k+1])k++;const u=(tau-TOUCHES[k])/(TOUCHES[k+1]-TOUCHES[k]),e=1-(1-u)*(1-u);return[lerp(TP[k][0],TP[k+1][0],e),.11,lerp(TP[k][1],TP[k+1][1],e)];}
 if(tau<MEET)return roll(g3(TP[TP.length-1]),g3(MEET_PT),(tau-PASS)/(MEET-PASS),.22);
 if(tau<SHOT)return roll(g3(MEET_PT),g3(SHOT_PT),(tau-MEET)/(SHOT-MEET),.5);
 if(tau<IN_NET){const u=(tau-SHOT)/(IN_NET-SHOT),b=lerp3(g3(SHOT_PT),GOAL_PT,u);return[b[0],.11+(NET_Y-.11)*u+.12*Math.sin(Math.PI*u),b[2]];}
 const u=clamp((tau-IN_NET)/.2);if(u<1)return lerp3(GOAL_PT,NET_PT,easeOut(u));
 const v=clamp((tau-IN_NET-.2)/.5);return[lerp(NET_PT[0],REST[0],v),Math.max(.11,NET_PT[1]*(1-v*v)+.11*v*v),lerp(NET_PT[2],REST[2],v)];
}
const bulgeAt=(tau:number)=>tau<IN_NET-.02?0:Math.exp(-(tau-IN_NET+.02)*2.4)*(1+.3*Math.sin((tau-IN_NET)*14));
const spinAt=(tau:number)=>tau<PASS?tau*6:tau<SHOT?PASS*6+(tau-PASS)*18:PASS*6+(SHOT-PASS)*18+(Math.min(tau,IN_NET)-SHOT)*40;

// ---------------------------------------------------------------- poses (angles in degrees via posed; the athlete clamps to real range of motion)
const RAD=Math.PI/180;
const LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const READY=posed({lHipF:30,rHipF:26,lKnee:40,rKnee:36,lHipA:10,rHipA:10,lean:14,pitch:4,lShA:24,rShA:24,lShF:12,rShF:12,lElb:44,rElb:44,neckP:-6});
/** the left-foot touch (the ball is caressed on, toe down) */
const TOUCH_L:Partial<Pose>={lHipF:34,lKnee:26,lAnk:34,lHipR:12,lean:18,neckP:24};
/** the turn away from Conceição: a low drag across the body with the left sole, shoulders dipping */
const DRAG:Partial<Pose>={lean:26,bend:-14,twist:20,lHipF:14,lHipA:-22,lKnee:46,lAnk:18,rKnee:54,rHipF:30,lShA:52,rShA:30,lElb:40,neckP:30,squash:-.06};
/** the cut inside past Pepê: pushed off the right leg, the left foot rolling the ball across */
const CUT:Partial<Pose>={lean:22,bend:12,twist:-18,lHipF:20,lHipA:-16,lKnee:34,rHipF:10,rKnee:58,rHipA:18,rShA:56,lShA:26,neckP:26,squash:-.05};
/** Trossard's first touch: the right foot cushions it forward */
const FIRST_TOUCH:Partial<Pose>={rHipF:30,rKnee:30,rAnk:-4,rHipR:16,lKnee:32,lean:20,neckP:32,lShA:40,rShA:30};
const inWin=(u:number)=>Math.min(sm(0,.12,u),1-sm(1,1.35,u));
/** the whole pose of actor k at τ, with its yaw; scan = the lesson's shoulder checks (ch4 only) */
function poseOf(k:number,tau:number,scan=0):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(Math.min(tau,IN_NET-.01));
 const toBall=yawOf(b[0]-x,b[2]-z),velY=yawOf(v[0],v[1]);
 let yaw=sp>.6?velY:toBall;
 // Porto's defenders and the keeper keep their eyes on the ball while they shuffle; they only turn their backs on it to sprint
 if(a.role==='por'||a.role==='gk')yaw=lerpA(toBall,velY,sm(3.4,5,sp));
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='por'?READY:stand();
 let p:Pose;
 if(sp>.6&&along<-.35*sp)p=blendPose(idle,backpedal(distOf(k,tau)/1.25),clamp((sp-.6)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(distOf(k,tau)/(2.4+1.5*s),{speed:s}),clamp((sp-.5)/.9));}
 for(const mv of a.moves??[]){const t0=mv.at-(mv.kind==='dive'?.35:.6)*mv.dur,u=(tau-t0)/mv.dur;
  if(mv.kind==='lunge'&&u>0&&u<1.5)p=blendPose(p,lunge(Math.min(1,u),{side:mv.side}),inWin(u));
  if(mv.kind==='dive'&&u>0){p=blendPose(p,keeperDive(Math.min(1,u),{side:mv.side,height:.12}),sm(0,.1,u));yaw=yawOf(SHOT_PT[0]-x,SHOT_PT[1]-z);}}
 if(k===GK&&tau<SHOT)yaw=toBall;
 if(k===ODE){
  // receiving: half-turned to Rice's pass, then the turn away (the velocity swings the body round)
  if(tau<.45)yaw=lerpA(toBall,velY,sm(.2,.5,tau));
  if(scan>0&&tau<-.15){// the lesson: two quick shoulder checks while the ball travels (left toward Trossard, then right), eyes back on the ball
   const n=(24+44*bump(-2.3,-1.55,tau)-58*bump(-1.4,-.7,tau))*scan;p=over(p,{neckY:n,twist:n*.3,neckP:-10},1);}
  for(let i=0;i<TOUCHES.length-1;i++)if(i!==1&&i!==4)p=over(p,TOUCH_L,bump(TOUCHES[i]-.16,TOUCHES[i]+.1,tau));
  p=over(p,DRAG,bump(.5,1.15,tau));
  // the fake shot: the left leg winds up as if to shoot (strike to its backswing), then checks instead of striking
  const fk=bump(2,2.8,tau);if(fk>0){const u=key(tau,[[2,0],[2.42,.44],[2.8,.26]],easeInOutSine);p=blendPose(p,strike(u,{foot:'l',power:.85}),fk);}
  p=over(p,CUT,bump(2.62,3.1,tau));
  // THE PASS: left foot, punched (firm, flat along the grass), body opened toward Trossard's run
  const D=.72,u=(tau-(PASS-STRIKE_CONTACT*D))/D;if(u>0&&u<1.4){p=blendPose(p,strike(Math.min(1,u),{foot:'l',power:.62}),inWin(u));yaw=lerpA(yaw,yawOf(MEET_PT[0]-x,MEET_PT[1]-z),.7*inWin(u));}
  if(tau>IN_NET+.45)p=blendPose(p,celebrate(tau*.9,{kind:'arms'}),sm(IN_NET+.45,IN_NET+.95,tau));}
 if(k===RICE){const D=.8,u=(tau-(RICE_PASS-STRIKE_CONTACT*D))/D;if(u>0&&u<1.4){p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.4}),inWin(u));yaw=lerpA(yaw,yawOf(TP[0][0]-x,TP[0][1]-z),.8*inWin(u));}
  if(tau<RICE_PASS-.3)yaw=headingOf(RICE,tau);
  if(tau>IN_NET+.4)p=over(p,{lShA:150,rShA:150,lShF:20,rShF:20,lElb:14,rElb:14,neckP:-20,lHand:1,rHand:1},sm(IN_NET+.4,IN_NET+.9,tau));}
 if(k===TRO){if(tau<2.3)yaw=lerpA(velY,toBall,.7);// lurking on the shoulder of João Mário, watching the ball
  p=over(p,FIRST_TOUCH,bump(MEET-.2,MEET+.16,tau));
  const D=.78,u=(tau-(SHOT-STRIKE_CONTACT*D))/D;if(u>0&&u<1.4){p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.72}),inWin(u));yaw=lerpA(yaw,yawOf(GOAL_PT[0]-x,GOAL_PT[2]-z),.85*inWin(u));}
  if(tau>IN_NET+.35)p=blendPose(p,celebrate(tau*.85,{kind:'run'}),sm(IN_NET+.35,IN_NET+.9,tau));}
 if(k===JM&&tau<3.5)p=over(p,{neckP:-4,lean:10},.6);// upright, eyes on Ødegaard and the ball
 if(a.role==='ars'&&k!==TRO&&k!==RICE&&tau>IN_NET+.6)p=over(p,{lShA:150,rShA:150,lShF:20,rShF:20,lElb:14,rElb:14,neckP:-20,lHand:1,rHand:1},sm(IN_NET+.6,IN_NET+1.1,tau));
 if(a.role==='por'&&tau>IN_NET+.7)p=over(p,{lean:38,neckP:40,lShF:-10,rShF:-10,lShA:14,rShA:14},sm(IN_NET+.7,IN_NET+1.5,tau)*.8);
 return{p,yaw};
}

// ---------------------------------------------------------------- THE ADAPTER: every figure in this film is drawn here
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): the shared riso athlete (fluid FK body, kit inks, halftone shade, key
 * line); prev = the pose one drawing earlier (secondary motion: hair and hem trail); smear = a halftone echo + speed lines on fast limbs.
 * Arsenal shirts get their WHITE SLEEVES here: athlete.ts prints one shirt ink, so at mid/high detail the upper sleeve of each arm in
 * front of the chest is knocked back to paper and re-outlined. */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:{pose:Pose;place:Place},smear=false):DrawResult{
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 const res=drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
 if(isArsenal(style)&&res.detail!=='low'){const sk=res.sk,dc=toCam(camera,sk.chest)[2],p=new Path2D();let n=0;
  for(const side of['l','r'] as const){const sh=sk[`${side}Sh`],el=sk[`${side}El`];if(toCam(camera,sh)[2]>dc+.1)continue;
   const d:V3=[el[0]-sh[0],el[1]-sh[1],el[2]-sh[2]],a=add3(sh,[d[0]*.1,d[1]*.1,d[2]*.1]),b=add3(sh,[d[0]*.46,d[1]*.46,d[2]*.46]),A=pr(camera,a),Bq=pr(camera,b);if(!A||!Bq)continue;
   p.addPath(ribbon([A,Bq],Math.max(3,kAt(camera,sh)*.13*sk.s*(style.build?.bulk??1)),{taper:0,wobble:0,seed:3}));n++;}
  if(n){s.knockout(p,.95);s.stroke(K,p,Math.max(1.2,res.heightPx*.012),.8);}}
 return res;
}

// ---------------------------------------------------------------- drawing the match through a camera
type PlayOut={joints:Map<number,DrawResult>;bg:Pt|null;br:number};
type PlayO={minBall?:number;hero?:number;scan?:number;smear?:boolean;under?:()=>void;after?:(r:PlayOut)=>void};
/** everything on the pitch at τ (positions on ones, poses on twos at τp; τprev = the drawing before, for secondary motion), depth-sorted.
 * Heat: small figures and extras print at `low` detail; inside a passage only the hero keeps `mid`. */
function play(s:Sheet,c:Cam,tau:number,tauP:number,tauPrev:number,o:PlayO={}):PlayOut{
 const{minBall=8,hero=-1,scan=0}=o,v=view(s);
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!s._passage.pending;
 type E={k:number;x:number;z:number;g:Pt;h:number;d:number};
 const list:E[]=[];
 ACTORS.forEach((_,k)=>{const[x,z]=posOf(k,tau),q=toCam(c,[x,.9,z]);if(q[2]<1.2)return;const g=scr(c,toCam(c,[x,0,z])),h=c.F*1.85/q[2];
  if(Math.abs(g[0])>v.hx+h||g[1]<-v.hy||g[1]-h>v.hy+h)return;list.push({k,x,z,g,h,d:q[2]});});
 const b=ballAt(tau),bq=toCam(c,b),bg=bq[2]>=NEAR?scr(c,bq):null,br=bg?Math.max(minBall,c.F*.11/bq[2]):0,bground=pr(c,[b[0],0,b[2]]);
 // ground shadows batched in one op (floodlights: short and soft); the ball's shadow too
 const sh=new Path2D();for(const e of list)sh.addPath(polyPath(blob(e.g[0],e.g[1],e.h*.13,e.h*.035,ACTORS[e.k].style.seed??1,{amp:.05,n:14}),true));
 if(bground&&bg&&b[0]<.05)sh.addPath(polyPath(blob(bground[0],bground[1],br*.8,br*.25,2,{amp:.05,n:12}),true));s.tone(K,sh,.42);
 o.under?.();
 list.sort((p,q)=>q.d-p.d);
 const drawBall=()=>{if(bg)footballPanels(s,bg[0],bg[1],br,{rot:spinAt(tau),key:K,shadow:B,seed:5});};
 const joints=new Map<number,DrawResult>();
 let ballDone=!list.length||bq[2]>=list[0].d;if(ballDone)drawBall();
 for(const e of list){if(!ballDone&&bq[2]>=e.d){drawBall();ballDone=true;}
  const a=ACTORS[e.k],isHero=e.k===hero,{p,yaw}=poseOf(e.k,tauP,e.k===ODE?scan:0),px=e.h*ppu;
  const detail=passing?(isHero?'mid':'low'):px<50||(!a.key&&px<110)?'low':'auto';
  const pl:Place={x:e.x,z:e.z,yaw},big=px>=70&&!passing;
  const prev=big&&(isHero||a.key)?{pose:poseOf(e.k,tauPrev,e.k===ODE?scan:0).p,place:pl}:undefined;
  const r=drawPlayer(s,p,c,{...a.style,shadow:false,detail},pl,prev,!!o.smear&&isHero&&big);
  if(a.key)joints.set(e.k,r);}
 if(!ballDone)drawBall();
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
/** the pass lane: from Ødegaard's boot to Trossard's meeting spot */
const passPts=(n=12):[number,number][]=>{const a=TP[TP.length-1],o:[number,number][]=[];for(let i=0;i<=n;i++){const u=i/n;o.push([lerp(a[0],MEET_PT[0],u),lerp(a[1],MEET_PT[1],u)]);}return o;};
/** a dashed sight line from a head to a point, in an ink */
function sightLine(s:Sheet,r:DrawResult|undefined,to:Pt|null,w:number,ink=Y,seed=91){if(!r||!to||w<=.02)return;const h=r.joints.head,u=Math.max(4,Math.hypot(h[0]-r.joints.neck[0],h[1]-r.joints.neck[1])*.35);
 const end:Pt=[lerp(h[0],to[0],w),lerp(h[1],to[1],w)];s.knockout(ribbon([h,end],u*1.8,{seed,taper:.2,wobble:.6}),.7);laneArrow(s,ink,h,end,u,{dashed:true,seed:seed+1,head:u*3});}
/** "the gap": two short red posts on the grass between João Mário and Pepe as the pass goes through, and a yellow gate line between them */
function gapGate(s:Sheet,c:Cam,tau:number,w:number){if(w<=.02)return;
 const a=posOf(JM,Math.min(tau,3.7)),b=posOf(PEPE,Math.min(tau,3.7)),p=new Path2D();
 for(const q of[a,b]){const lo=pr(c,[q[0]+.9,0,q[1]+(q===a?.8:-.8)]),hi=pr(c,[q[0]+.9,2.1*w,q[1]+(q===a?.8:-.8)]);if(lo&&hi)p.addPath(ribbon([lo,hi],Math.max(5,kAt(c,[q[0],0,q[1]])*.12),{seed:77,taper:.1,wobble:.5}));}
 s.knockout(p,.9);s.fill(R,p,.95*w);
 const A=pr(c,[a[0]+.9,.05,a[1]+.8]),Bq=pr(c,[b[0]+.9,.05,b[1]-.8]);if(A&&Bq){const g=ribbon([A,Bq],Math.max(5,kAt(c,[a[0],0,a[1]])*.1),{seed:78,taper:0,wobble:.8});s.knockout(g,.7*w);s.fill(Y,g,.9*w);}}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, panning in near real time
/** τ from chapter-1 time, keyed to the cue words */
const tau1=(t:number)=>{const S=SECS(0),G=CUE(0,'Goal');return key(t,mono([[0,-4.3],[CUE(0,'Martin')+.5,-.05],[CUE(0,'turns away')+.35,.95],[CUE(0,'fakes a shot')+.25,2.42],[CUE(0,'beats another')+.2,2.95],[CUE(0,'Then the pass')+.1,PASS],[CUE(0,'through the gap')+.2,3.95],[G,IN_NET-.02],[S+1,IN_NET-.02+(S+1-G)*.85]]),linear);};
const P1:V3=[-36,17,55];
function cam1(t:number):Cam{
 const S=SECS(0),G=CUE(0,'Goal'),tau=tau1(t);
 const bs=(u:number):V3=>{const b=ballAt(Math.min(u,IN_NET));return[b[0],0,b[2]];},b0=bs(tau),b1=bs(tau-.35),b2=bs(tau-.7),bt:V3=[(b0[0]+b1[0]+b2[0])/3,0,(b0[2]+b1[2]+b2[2])/3];
 // the pre-roll frames Rice and Ødegaard wide; then it rides the ball, a little ahead of it toward the goal once Trossard runs
 const lead=sm(1.5,3.2,tau)*(1-sm(4.6,5.4,tau))*5,tr=posOf(TRO,tau),toT=sm(G+.6,G+1.6,t,easeInOutSine);
 const T0:V3=[bt[0]+lead,.5,bt[2]*.75-2.2*sm(1.5,3.2,tau)],T=mix3(T0,[tr[0]+2,1,tr[1]+2],toT);
 const fov=key(t,[[0,19],[CUE(0,'Martin'),9.5],[CUE(0,'fakes'),8.5],[CUE(0,'beats'),10.5],[CUE(0,'Then the pass'),13],[G,11.5],[G+1.4,8.5],[S,8]],easeInOutSine);
 return cam3(P1,T,fov);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tau=tau1(t),tt=twos(t),G=CUE(0,'Goal');
  stadium(s,c,t,[0,1,3],{roar:sm(G,G+.4,t),flash:sm(G,G+.25,t)*(1-sm(G+2.4,G+3.4,t))});
  ground(s,c,{bulge:bulgeAt(tau)});
  play(s,c,tau,tau1(tt),tau1(tt-1/12),{minBall:10,hero:ODE,smear:true});
 },
 aperture(t){const c=cam1(t),P=ballAt(Math.min(tau1(t),IN_NET)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:9,
};

// ---------------------------------------------------------------- 2 · slow replay, raised behind Ødegaard's right shoulder: he sees the run
const tau2=(t:number)=>key(t,mono([[0,.35],[CUE(1,'dodges'),2.05],[CUE(1,'already sees'),2.55],[CUE(1,'sneaking in'),2.95],[CUE(1,'only watches'),3.28],[SECS(1),3.62]]),linear);
function cam2(t:number):Cam{
 const tau=tau2(t),m=smooth(ODE,tau),tr=smooth(TRO,tau),open=1-sm(0,1.2,t,easeInOutSine),wide=sm(CUE(1,'already sees')-.4,CUE(1,'sneaking in')+.4,t,easeInOutSine);
 const C:V3=[m[0]-6.2-2*wide+2.5*open,3.1+1.2*wide,m[1]+3.8+1.2*wide],T:V3=[lerp(m[0],tr[0],.3+.18*wide)+1.5,.7,lerp(m[1],tr[1],.3+.18*wide)];
 return cam3(C,T,30+8*wide+4*open);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tau=tau2(t),tt=twos(t),as=CUE(1,'already sees'),sn=CUE(1,'sneaking in'),ow=CUE(1,'only watches'),E=SECS(1);
  stadium(s,c,t,[0,1]);
  ground(s,c);
  play(s,c,tau,tau2(tt),tau2(tt-1/12),{minBall:7,hero:ODE,smear:true,
   under:()=>{
    // "sneaking in": Trossard's run in behind (blue), from where he is to where the ball will meet him
    groundArrow(s,c,runPts(TRO,Math.min(tau,2.6),MEET),sm(sn-.2,sn+.6,t,easeOut)*(1-sm(E-.8,E-.4,t)),B,63);
    // "only watching": a red ring under João Mário
    const[jx,jz]=posOf(JM,tau);ring(s,c,jx,jz,1.1,sm(ow-.15,ow+.25,t,easeOutBack)*(1-sm(E-.7,E-.35,t)),R,44);},
   after:({joints,bg})=>{
    // "already sees": his sight line to Trossard (yellow, dashed)
    const[tx,tz]=posOf(TRO,tau);sightLine(s,joints.get(ODE),pr(c,[tx,1.6,tz]),sm(as-.1,as+.5,t,easeOut)*(1-sm(E-.8,E-.4,t)),Y,91);
    // "only watching the ball": João Mário's eye line goes to the ball, not to the runner behind him (red, dashed)
    sightLine(s,joints.get(JM),bg,sm(ow+.1,ow+.6,t,easeOut)*(1-sm(E-.7,E-.35,t)),R,95);}});
  streaks(s,1-sm(0,.5,t),21);
 },
 aperture(t){const c=cam2(t),b=ballAt(tau2(t)),q=toCam(c,b),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.12/q[2]),12);},
 still:4.4,
};

// ---------------------------------------------------------------- 3 · second replay angle, low beside the goal: through the gap, the touch, the far corner
const tau3=(t:number)=>{const f=CUE(2,'far corner');return key(t,mono([[0,2.9],[CUE(2,'punches it')+.15,PASS],[CUE(2,'through the gap')+.2,3.85],[CUE(2,'First touch'),MEET+.02],[CUE(2,'low shot'),SHOT+.02],[f+.1,IN_NET],[SECS(2),IN_NET+(SECS(2)-f-.1)*.8]]),linear);};
const C3:V3=[4.2,1.9,9.5];
function cam3v(t:number):Cam{
 const tau=tau3(t),od=smooth(ODE,Math.min(tau,PASS)),tr=smooth(TRO,tau),f=CUE(2,'far corner');
 const early:V3=[lerp(od[0],tr[0],.55),1,lerp(od[1],tr[1],.55)],mid:V3=[tr[0]+2,1,tr[1]+3],late:V3=[-3.5,.9,-.5];
 const T=mix3(mix3(early,mid,sm(PASS+.2,MEET+.1,tau,easeInOutSine)),late,sm(SHOT-.1,IN_NET+.1,tau,easeInOutSine));
 return cam3(mix3(C3,add3(C3,[1.2,.2,1.5]),sm(0,SECS(2),t)),T,lerp(15,24,sm(PASS+.3,IN_NET,tau))+3*sm(f+.3,SECS(2),t));
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tau=tau3(t),tt=twos(t),pi=CUE(2,'punches it'),tg=CUE(2,'through the gap'),ft=CUE(2,'First touch'),fc=CUE(2,'far corner'),E=SECS(2);
  stadium(s,c,t,[0,2,3],{roar:sm(IN_NET,IN_NET+.3,tau),flash:sm(fc,fc+.3,t)*(1-sm(E-1.2,E-.6,t))});
  ground(s,c,{goalLater:true});
  play(s,c,tau,tau3(tt),tau3(tt-1/12),{minBall:6,hero:tau<MEET-.3?ODE:TRO,smear:true,
   under:()=>{
    // "punches it … through the gap": the red gate between João Mário and Pepe, the yellow lane through it
    gapGate(s,c,tau,sm(tg-.25,tg+.2,t,easeOutBack)*(1-sm(ft+.3,ft+.8,t)));
    groundArrow(s,c,passPts(),sm(pi-.1,tg+.3,t,easeOut)*(1-sm(ft+.4,ft+.9,t)),Y,65);
    // "First touch": a yellow ring where the ball meets his boot
    ring(s,c,MEET_PT[0],MEET_PT[1],.9,sm(ft-.15,ft+.2,t,easeOutBack)*(1-sm(ft+.9,ft+1.3,t)),Y,46);}});
  // the goal is between this camera and the pitch: printed over the players, the far post flashing on "far corner"
  goal3(s,c,bulgeAt(tau),sm(fc-.1,fc+.3,t)*(1-sm(E-1,E-.5,t)));
  const age=t-fc;if(age>-.1&&age<.9){const q=pr(c,[NET_PT[0]-.8,.5,NET_PT[2]]);if(q)sparkBurst(s,Y,q[0],q[1],kAt(c,NET_PT)*1.1,{n:9,seed:97,g:easeOutBack(clamp((age+.1)/.25))*(1-clamp((age-.55)/.35)),width:12});}
  streaks(s,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3v(t),[x,z]=posOf(TRO,tau3(t)),q=toCam(c,[x,1.1,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.16/q[2]),12);},
 still:4.6,
};

// ---------------------------------------------------------------- 4 · the lesson, over Ødegaard's shoulder: scan, already know, the next pass
const tau4=(t:number)=>key(t,mono([[0,-2.4],[CUE(3,'scan the pitch'),-2.2],[CUE(3,'before the ball'),-.55],[CUE(3,'already know'),1.6],[CUE(3,'next pass')+.2,PASS],[SECS(3),PASS+.85]]),linear);
function cam4(t:number):Cam{
 const tau=tau4(t),m=smooth(ODE,Math.min(tau,PASS+.3)),push=sm(0,1.4,t,easeInOutSine),follow=sm(CUE(3,'next pass')-.2,SECS(3)-.2,t,easeInOutSine),tr=smooth(TRO,tau);
 const C:V3=[m[0]-5.4-1.5*(1-push),2.9+.7*follow,m[1]+2.8+1.2*(1-push)],T0:V3=[lerp(m[0],MEET_PT[0],.38),.6,lerp(m[1],MEET_PT[1],.38)],T1:V3=[lerp(m[0],tr[0],.62),.6,lerp(m[1],tr[1],.62)];
 return cam3(C,mix3(T0,T1,follow),36+4*(1-push)-2*follow);
}
/** the scan arcs: two fans on the grass, left (toward Trossard) and right, lit while his head turns that way */
function scanFan(s:Sheet,c:Cam,x:number,z:number,dir:number,w:number,ink:string,seed:number){if(w<=.02)return;const pts:Pt[]=[];const o=pr(c,[x,.05,z]);if(!o)return;pts.push(o);
 for(let i=0;i<=10;i++){const a=dir-.42+.84*i/10,q=pr(c,[x+Math.cos(a)*9*w,.05,z-Math.sin(a)*9*w]);if(q)pts.push(q);}
 if(pts.length<5)return;const f=polyPath(pts,true);s.knockout(f,.35*w);s.tone(ink,f,.5*w);s.stroke(K,f,2,.6*w);void seed;}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4(t),tau=tau4(t),tt=twos(t),sp=CUE(3,'scan the pitch'),bb=CUE(3,'before the ball'),ak=CUE(3,'already know'),np=CUE(3,'next pass'),E=SECS(3);
  stadium(s,c,t,[0,1]);
  ground(s,c);
  const[ox,oz]=posOf(ODE,tau),hy=poseOf(ODE,tau,1).yaw;
  play(s,c,tau,tau4(tt),tau4(tt-1/12),{minBall:7,hero:ODE,scan:1,smear:true,
   under:()=>{
    // "scan the pitch": a fan on the grass where his eyes go — over his left shoulder toward Trossard, then to his right
    const L=bump(-2.35,-1.5,tau),Rr=bump(-1.45,-.65,tau),on=sm(sp-.2,sp+.2,t);
    scanFan(s,c,ox,oz,hy+.9,on*L,Y,1);scanFan(s,c,ox,oz,hy-.9,on*Rr,Y,2);
    // "already know your next pass": the lane and the target, drawn BEFORE the pass is played
    const kw=sm(ak-.2,ak+.5,t,easeOut)*(1-sm(E-.8,E-.4,t));
    ring(s,c,MEET_PT[0],MEET_PT[1],1.4,sm(ak-.1,ak+.35,t,easeOutBack)*(1-sm(E-.8,E-.4,t)),Y,48);
    groundArrow(s,c,passPts(),kw,Y,69);
    groundArrow(s,c,runPts(TRO,Math.max(1.4,Math.min(tau,2.6)),MEET),sm(ak,ak+.8,t,easeOut)*(1-sm(E-.8,E-.4,t)),B,67);},
   after:({joints})=>{
    // "before the ball comes to you": the ball on its way, a yellow ring on it until he touches it
    const age=t-bb;if(age>-.2&&tau<0){const b=ballAt(tau),q=pr(c,b);if(q){const rr:Pt[]=[];for(let i=0;i<24;i++){const a=i/24*TAU;rr.push([q[0]+Math.cos(a)*kAt(c,b)*.32,q[1]+Math.sin(a)*kAt(c,b)*.32]);}const r=ribbon(rr,Math.max(4,kAt(c,b)*.05),{close:true,seed:5,taper:0,wobble:1});s.knockout(r,.8);s.fill(Y,r,.95*sm(-.2,.2,age));}}
    // "already know": his sight line to Trossard while he is still dribbling
    const[tx,tz]=posOf(TRO,tau);sightLine(s,joints.get(ODE),pr(c,[tx,1.6,tz]),sm(ak,ak+.5,t,easeOut)*(1-sm(np-.1,np+.3,t)),Y,99);
    // "next pass": the pass leaves the boot — a spark at the ball
    const pa=t-np-.2;if(pa>-.15&&pa<.6){const P=g3(TP[TP.length-1]),q=pr(c,P);if(q)sparkBurst(s,Y,q[0],q[1],kAt(c,P)*.7,{n:8,seed:93,g:easeOutBack(clamp((pa+.15)/.2))*(1-clamp((pa-.35)/.25)),width:9});}}});
 },
 still:4.4,
};

const film:RisoStory={
 id:'odegaard-signature',format:'11v11',title:"Ødegaard's Defence-Splitting Pass",
 theme:'Scan the pitch before you receive, so you already know your next pass',
 ageNote:'Arsenal 1–0 Porto (4–2 on penalties), Champions League round of 16, Emirates Stadium, London, 12 March 2024 (the 41st minute). For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a through ball — a yellow lane darting forward from the touch with a ball on its tip. Reduced motion: the still lane. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.45)),fade=age<=0?1:1-clamp((age-.55)/.25),r=rng(seed),dir=-.6+(r()-.5)*.5;
  const e:Pt=[x+Math.cos(dir)*230*u,y+Math.sin(dir)*230*u];
  if(u>.05)laneArrow(s,Y,[x,y],e,14,{seed,head:40,cov:.95*fade});
  if(age>0&&age<.3)sparkBurst(s,Y,x,y,80,{n:8,seed,g:1-clamp(age/.3),width:10});
  footballPanels(s,e[0],e[1],30,{rot:age*18,key:K,shadow:B,seed:5});
 },
};
export default film;
