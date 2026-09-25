/** Francesco Totti's chipped penalty — the "cucchiaio" ("the spoon") — Italy 0–0 Netherlands (Italy won 3–1 on penalties), UEFA Euro 2000
 * semi-final, Amsterdam ArenA, 29 June 2000 — an iconic-play riso film (RisoStory, chapters mode) played by the card's picture window
 * (components/CardFilmPlayer.tsx) or StoryFilmPlayer. A 1:1 reconstruction of the kick from WRITTEN accounts (the footage itself was not
 * reviewed), rendered as a riso print. Deliberately unlike the Pirlo Panenka film (pirlo-panenka-2012.ts): a daylight, roofed Dutch bowl
 * with the orange ink, the live camera on the OTHER touchline (the goal on the left of frame), a high behind-the-goal replay, a pitch-level
 * side-on replay and a different lesson print.
 *
 * SOURCES (read Sept 2026, cached in scratchpad/films/src-cache/):
 *  - Wikipedia, "UEFA Euro 2000 knockout stage" (Italy vs Netherlands box: 29 June 2000, 18:00, Amsterdam Arena, 50,000, referee Markus
 *    Merk (Germany), line-ups + numbers — Totti 20, on 83', Toldo 12, van der Sar 1 — the shoot-out order, the kit boxes)
 *    https://en.wikipedia.org/wiki/UEFA_Euro_2000_knockout_stage   (wiki-euro2000-ko.txt)
 *  - Wikimedia Commons kit pattern Kit_body_nether00h.png (the Dutch shirt that day: orange with a black V-neck; the box adds black
 *    shorts and orange socks with a black band)   (Kit_body_nether00h.png, scratchpad/films/totti/kitcheck-ned.png)
 *  - Wikipedia, "Francesco Totti" (right-footed; the chipped "cucchiaio" penalty in the Euro 2000 semi-final shoot-out; "Mo je faccio er
 *    cucchiaio" whispered to Luigi Di Biagio just before) https://en.wikipedia.org/wiki/Francesco_Totti   (wiki-francesco-totti.txt)
 *  - SPORTbible, "Francesco Totti Once Took An Outrageous Penalty In A Euro Semi Final Against Netherlands", 29 June 2022, quoting Totti's
 *    autobiography: he "strolled up, in front of the Dutch fans", "chipped the ball down the middle"; "The goalkeeper, who had tried to
 *    screw with me by feinting left and diving to his right, saw a mocking ball fly over him: it must have seemed so close to him, yet it
 *    was unreachable"; Maldini's "no, no" in a low voice   (sportbible-totti-euro2000.txt)
 *  - Wikipedia, "Johan Cruyff Arena" (the Amsterdam ArenA: a retractable roof, all-seated, no running track) (wiki-johan-cruyff-arena.txt)
 *  - Wikipedia, "Panenka (penalty kick)" (Totti's Euro 2000 kick listed as a famous Panenka)   (wiki-panenka.txt)
 * CONFIRMED by those accounts: 29 June 2000, 18:00 kick-off in Amsterdam (so the shoot-out was in evening daylight); 0–0 after extra time;
 *  the shoot-out Di Biagio ✓, F. de Boer ✗, Pessotto ✓, Stam ✗, TOTTI ✓ (so Italy led 2–0 when he stepped up), Kluivert ✓, Maldini ✗,
 *  Bosvelt ✗ — Italy won 3–1 and went to the final; Totti wore 20 and is right-footed; Edwin van der Sar (1) in goal for the Netherlands,
 *  Francesco Toldo (12) for Italy; Italy in blue shirts, white shorts, blue socks; the Netherlands in orange shirts (black V-neck), black
 *  shorts, orange socks; the kick was a chip down the middle, taken at the end with the Dutch fans behind the goal; van der Sar feinted to
 *  his LEFT and dived to his RIGHT; the ball passed close over him; Totti told team-mates beforehand he would chip it; referee Markus Merk.
 * INFERRED (illustrative): every position and time in metres/seconds (the unhurried run-up ≈ 5.4 m from his left at ≈ 24°; the flight
 *  ≈ 1.05 s, peak ≈ 1.95 m, crossing the line ≈ 1.5 m high); where the players, Toldo, the referee and the assistant stood; the line-up of
 *  players in the centre circle and who stood beside Totti; Totti's short hair; both keepers' kit colours (van der Sar dark, Toldo yellow);
 *  the referee's navy kit; whether the roof was open (drawn open, the two big roof arches over the opening); the seat colours, the tiers, the
 *  crowd's colours and flags; the camera placements; the Italians celebrating in the centre circle as the narration says Italy go through
 *  (they won two kicks later). The narration names no foot, no side and no keeper-kit colour.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera on the −z touchline in REAL TIME (the ArenA in daylight under
 * its open roof → the two lines in the centre circle → Totti tells his team-mates (a speech bubble with a little chip in it) → cut to Totti
 * at his mark → the stroll → van der Sar dives → the scoop → the net); ch2 = the slow-motion replay from HIGH BEHIND THE GOAL (over the
 * keeper's back: he leans one way, dives the other, and the ball floats over him; a yellow trail); ch3 = the pitch-level side-on replay from
 * the +z touchline by the goal line (the ball floats just over the falling keeper), then the lens swings to the Italians in the centre circle;
 * ch4 = the lesson: brave (the plan, a dashed chip arc) → calm (the loud stadium fades to paper) → watch the keeper commit (sight line, a
 * grey feint arrow, a red dive arrow) → choose the empty space (a yellow window in the middle of the goal, the ball floats in).
 * Composed on the FULL sheet (world units = sheet units centred on the canvas; never sheet.safe) inside the central ~1000 units, so it
 * frames from the 1.45:1 card window down to square (a narrower window widens the lens a little). Figures: every body goes through ONE
 * adapter, drawPlayer() → athlete.ts (continuous silhouettes, FK skeleton, `prev` secondary motion, a motion smear on the run, the strike
 * and the dive); small figures in the wide shots and every figure inside a passage print at `low` detail. Handedness: the world is
 * right-handed (x toward the Dutch goal, y up, +z = Totti's right), exactly athlete.ts's convention, so his RIGHT foot strikes with no
 * mirrored projector; van der Sar faces −x, so his right is −z (he feints to +z, dives to −z).
 * Inks: yellow, orange, blue, navy. Everything is keyed to cue times (withTiming swaps in the recorded word onsets), poses on twos, cameras
 * on ones; all randomness seeded. Budget: ~150–320 plate ops per frame. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,polyPath,ribbon,partial,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,stand,keeperSet,keeperDive,celebrate,posed,blendPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES (≈2.7 words/s + punctuation pauses) until the Kokoro voice exists. Once the lead has generated
 * public/plays/narration/totti-cucchiaio-2000/timing.json, add
 *   import timingJson from '../../../public/plays/narration/totti-cucchiaio-2000/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues).
 * NB withTiming matches a cue by its FIRST word, in order — so no cue starts with a word that also appears between it and the previous cue. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'Semi-final, live',text:"Amsterdam, 2000. Italy and the Netherlands go to penalties. Francesco Totti tells his teammates: I'm going to chip it! He strolls up... the keeper dives... and Totti scoops it down the middle. Goal!",tail:2.2,
  cues:['Amsterdam','go to penalties','Francesco Totti','tells his teammates','strolls up','the keeper dives','scoops it','Goal']},
 {label:'Watch it again',text:'Watch it again. Van der Sar leans one way, then dives the other. Totti lifts it softly over him.',tail:1.7,
  cues:['Watch it again','Van der Sar','leans one way','then dives','Totti lifts','softly','over him']},
 {label:'From the side',text:'From the side: the ball floats just over the falling keeper. Italy go through to the final!',tail:1.9,
  cues:['From the side','ball floats','falling keeper','Italy go through','the final']},
 {label:'The secret',text:'The secret? Be brave, but stay calm. Watch the keeper commit, then choose the empty space.',tail:2,
  cues:['The secret','Be brave','stay calm','Watch the keeper','commit','then choose','empty space']},
];
import timingJson from '../../../public/plays/narration/totti-cucchiaio-2000/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , . ! ? : ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('totti: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('totti: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
/** key() needs increasing times: push each key at least `gap` after the previous one (real voice timings can crowd authored offsets) */
function mono(K:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of K)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}

// ---------------------------------------------------------------- inks, vectors
const Y='yellow',O='orange',B='blue',K='navy';
const add3=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const mix3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const wrap=(a:number)=>{while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;return a;};
const lerpAng=(a:number,b:number,u:number)=>a+wrap(b-a)*u;
/** yaw (athlete.ts convention: 0 faces +x, + turns left) that faces from (x,z) toward (x2,z2) */
const yawTo=(x:number,z:number,x2:number,z2:number)=>Math.atan2(-(z2-z),x2-x);
/** a narrower (square) window gets a slightly wider lens so the action still fits; set by frame(), read by every camera */
let LENS=1;
/** Frame the FULL sheet: world (0,0) on the canvas centre at 1 unit per sheet unit (the passage arrival scale still multiplies in). */
function frame(s:Sheet){const S=s.arrival;s.camera((s.cx-s.W/2)/S,(s.cy-s.H/2)/S,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
/** half the visible extents with margin for the .68 passage preview */
const view=(s:Sheet)=>({hx:s.W/(2*.68)+120,hy:s.H/(2*.68)+120});

// ---------------------------------------------------------------- 3D: projection through an athlete.ts Camera (right-handed metres, y up)
/** Pitch: the Dutch goal line is x = 0 (the kick goes +x), the goal centre z = 0, +z = Totti's right; the live camera sits at −z. */
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

// ---------------------------------------------------------------- the Amsterdam ArenA on a June evening: open roof, two tiers, the roof arches
/** stand planes (a along, b up the rake 0..1; b < 0 runs out over the pitch for the roof), right against the pitch (no running track):
 * 0 the −z side (the live camera's stand), 1 behind the Dutch goal (x > 0: the Dutch fans), 2 the +z side, 3 the far end (Italian fans) */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-116,11,a),1+31*b,-40-28*b],
 (a,b)=>[8+28*b,1+31*b,lerp(-57,57,a)],
 (a,b)=>[lerp(11,-116,a),1+31*b,40+28*b],
 (a,b)=>[-113-28*b,1+31*b,lerp(57,-57,a)],
];
const STAND_COLS=[104,70,104,70],STAND_ROWS=15,BOX0=.43,BOX1=.52;
/** crowd share per stand: [orange, paper, blue, yellow] cumulative thresholds (orange = the Dutch hosts, blue = Italy's fans) */
const MIX:[number,number,number][]=[[.62,.8,.92],[.8,.93,.97],[.6,.78,.9],[.3,.5,.93]];
/** flags on the stand fronts: [stand, a, kind] kind 0 = Dutch tricolour (orange-red | paper | blue), 1 = Italian (green | paper | orange-red) */
const FLAGS:[number,number,number][]=[[1,.2,0],[1,.36,0],[1,.55,0],[1,.72,0],[2,.18,0],[2,.33,0],[2,.52,0],[2,.7,1],[3,.3,1],[3,.44,1],[3,.58,0],[3,.72,1],[0,.25,0],[0,.6,0]];
/** yellow ink stepped under full coverage, a blue screen over it: a riso green */
const green=(s:Sheet,p:Path2D)=>{s.fill(Y,p,.92);s.tone(B,p,.72);};
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number;flash?:number;hush?:number}={}){
 const{roar=0,flash=0,hush=0}=o,v=view(s),tt=twos(t),Bnd=Math.max(s.W,s.H)*2;
 // an evening sky through the open roof: paper with a pale blue screen, a warmer band low down
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]))?.[1]??0;
 s.tone(B,polyPath([[-Bnd,-Bnd],[Bnd,-Bnd],[Bnd,Bnd],[-Bnd,Bnd]],true),.3);
 s.tone(Y,polyPath([[-Bnd,hz-420],[Bnd,hz-420],[Bnd,Bnd],[-Bnd,Bnd]],true),.22);
 const planes=new Path2D(),boxes=new Path2D(),win=new Path2D(),roof=new Path2D(),edge=new Path2D();
 for(const i of which){const S=STANDS[i],q=polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]);addPoly(planes,q);
  // the band of boxes between the tiers, with a row of lit windows
  addPoly(boxes,polyP(c,[S(0,BOX0),S(1,BOX0),S(1,BOX1),S(0,BOX1)]));
  for(let k=0;k<22;k++){const a0=(k+.2)/22,a1=(k+.75)/22;addPoly(win,polyP(c,[S(a0,BOX0+.025),S(a1,BOX0+.025),S(a1,BOX1-.03),S(a0,BOX1-.03)]));}
  // the roof: a deep flat canopy out over the front of the stand, its steel edge a paper line
  addPoly(roof,polyP(c,[add3(S(0,1),[0,2.5,0]),add3(S(1,1),[0,2.5,0]),add3(S(1,-.28),[0,41,0]),add3(S(0,-.28),[0,41,0])]));
  seg3(c,add3(S(0,-.28),[0,40.6,0]),add3(S(1,-.28),[0,40.6,0]),.6,edge);}
 s.knockout(planes);s.tone(B,planes,.62);s.tone(K,planes,.28);s.fill(K,boxes,.85);s.knockout(win,.6);s.fill(Y,win,.55);
 // the crowd: seeded dots, sized by distance; roar lifts them
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si],mx=MIX[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(b>BOX0-.02&&b<BOX1+.02)continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,5);if(h<.22)continue;const a=(i+.5+(hash(i+j*31,9)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const u=hash(i*7+j*13+si*101,11),ink=u<mx[0]?0:u<mx[1]?1:u<mx[2]?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.fill(O,inks[0],.95);s.knockout(inks[1],.72);s.fill(B,inks[2],.95);s.fill(Y,inks[3],.95);
 s.knockout(roof);s.tone(K,roof,.55);s.tone(B,roof,.35);s.knockout(edge,.85);
 // flags on the stand fronts
 const fl=new Path2D(),rd=new Path2D(),bl=new Path2D(),gr=new Path2D();
 for(const[si,a,kind] of FLAGS){if(!which.includes(si))continue;const S=STANDS[si],w=.035,P=(u:number,b:number)=>S(a+u*w,b);
  const q=polyP(c,[P(0,.005),P(1,.005),P(1,.09),P(0,.09)]);if(q.length<3)continue;fl.addPath(polyPath(q,true));
  if(kind===0){addPoly(rd,polyP(c,[P(0,.062),P(1,.062),P(1,.09),P(0,.09)]));addPoly(bl,polyP(c,[P(0,.005),P(1,.005),P(1,.033),P(0,.033)]));}
  else{addPoly(gr,polyP(c,[P(0,.005),P(.333,.005),P(.333,.09),P(0,.09)]));addPoly(rd,polyP(c,[P(.667,.005),P(1,.005),P(1,.09),P(.667,.09)]));}}
 s.knockout(fl);s.fill(O,rd,.95);s.fill(B,bl,.95);green(s,gr);
 // the two great roof arches that carry the sliding roof, running the length of the stadium over the opening
 const arc=new Path2D(),lat=new Path2D();
 for(const z of[-21,21]){const A=(u:number):V3=>[lerp(-128,23,u),42+34*Math.sin(Math.PI*u),z];let prev=A(0);
  for(let k=1;k<=16;k++){const cur=A(k/16);seg3(c,prev,cur,2.2,arc,1.4);const lo=add3(cur,[0,-4.5,0]);seg3(c,add3(prev,[0,-4.5,0]),lo,1,lat,1);seg3(c,prev,lo,.6,lat,1);prev=cur;}}
 s.fill(K,arc,.9);s.fill(K,lat,.7);
 if(hush>0){const p=polyPath([[-Bnd,-Bnd],[Bnd,-Bnd],[Bnd,Bnd],[-Bnd,Bnd]],true);s.knockout(p,.82*hush);}
 if(flash>0){const p=new Path2D(),n=Math.round(22*flash);for(let i=0;i<n;i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,STANDS[si](r2,.08+.8*hash(i,Math.floor(tt*12))));if(!q)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
// ---------------------------------------------------------------- grass, lines, boards, the goal
function ground(s:Sheet,c:Cam,o:{bulge?:number;goal?:boolean;hush?:number}={}){
 const g=polyP(c,[[-113,0,-40],[8,0,-40],[8,0,40],[-113,0,40]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.85);s.tone(B,gp,.72);s.tone(K,gp,.1);
 // mowing stripes along the length, every 6.8 m (a tired, much-relaid ArenA pitch: soft stripes)
 const st=new Path2D();for(let k=0;k<10;k+=2){const z0=-34+k*6.8;addPoly(st,polyP(c,[[0,0,z0],[-105,0,z0],[-105,0,z0+6.8],[0,0,z0+6.8]]));}s.tone(K,st,.12);
 // advertising boards behind the goal and along both touchlines: paper with blue and orange panels
 const bd=new Path2D(),pb=new Path2D(),po=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.9,0]),add3(a,[0,.9,0])]));
 board([4.5,0,-36],[4.5,0,36]);board([-109,0,-37.5],[4.5,0,-37.5]);board([-109,0,37.5],[4.5,0,37.5]);
 for(let k=0;k<12;k++){const z=-34+k*5.8;addPoly(k%2?po:pb,polyP(c,[[4.4,.22,z],[4.4,.22,z+3.6],[4.4,.68,z+3.6],[4.4,.68,z]]));}
 for(const zz of[-37.4,37.4])for(let k=0;k<18;k++){const x=-107+k*6.1;addPoly(k%2?po:pb,polyP(c,[[x,.22,zz],[x+3.6,.22,zz],[x+3.6,.68,zz],[x,.68,zz]]));}
 s.knockout(bd,.9);s.fill(B,pb,.9);s.fill(O,po,.9);
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
 s.knockout(ln);
 if(o.hush)s.knockout(gp,.35*o.hush);
 if(o.goal!==false)goal3(s,c,o.bulge??0);
}
/** the goal at x = 0: posts z ±3.66, bar 2.44, a box net 2 m deep; bulge pushes the back out round the middle */
function goal3(s:Sheet,c:Cam,bulge:number,op=1){
 const X=0,z0=-3.66,z1=3.66,H=2.44,bz=.1,back=(z:number)=>X+2+bulge*.55*Math.exp(-Math.pow((z-bz)/1.6,2));
 const zs=[z0,-2.4,-1.2,0,1.2,2.4,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0),H,z0],[back(z0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1),H,z1],[back(z1),0,z1]],
  [[X,H,z0],[X,H,z1],...zs.slice().reverse().map(z=>[back(z),H,z] as V3)],
  [...zs.map(z=>[back(z),0,z] as V3),...zs.slice().reverse().map(z=>[back(z),H,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.3*op);s.tone(K,net,.1*op);
 const mesh=new Path2D();
 for(let i=0;i<=14;i++){const z=lerp(z0,z1,i/14);seg3(c,[X,H,z],[back(z),H,z],.022,mesh,.7);seg3(c,[back(z),H,z],[back(z),0,z],.022,mesh,.7);}
 for(let j=1;j<=5;j++){const y=H*j/6;for(let i=0;i<zs.length-1;i++)seg3(c,[back(zs[i]),y,zs[i]],[back(zs[i+1]),y,zs[i+1]],.022,mesh,.7);seg3(c,[X,y,z0],[back(z0),y,z0],.022,mesh,.7);seg3(c,[X,y,z1],[back(z1),y,z1],.022,mesh,.7);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+2*u,H,z0],[X+2*u,H,z1],.022,mesh,.7);}
 s.fill(K,mesh,.7*op);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.2,fo);seg3(c,[X,0,z1],[X,H,z1],.2,fo);seg3(c,[X,H,z0-.04],[X,H,z1+.04],.2,fo);
 s.fill(K,fo,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- the kick on one clock τ (seconds; τ = 0 is the contact)
const B0:V3=[-11,.11,0];
const DXG=-B0[0];
/** the cucchiaio: a soft loop down the middle — peak ≈ 1.95 m at 6.6 m, crossing the line ≈ 1.5 m high, a touch to the keeper's left (+z) */
const [HA,HB]=(()=>{const dp=6.6,yl=1.5-.11;const b=yl/(2*dp*DXG-DXG*DXG);return[2*dp*b,b];})();
const ZL=.12;
const flight=(d:number):V3=>[B0[0]+d,.11+HA*d-HB*d*d,B0[2]+ZL*d/DXG];
const FLY=1.05;
const dAt=(tau:number)=>{const u=clamp(tau/FLY);return DXG*u*(1.25-.25*u);};
const GOAL_PT=flight(DXG),NET_HIT:V3=[1.75,1.05,.16],REST:V3=[1.3,.11,.2],IN_NET=FLY+.2;
function ballAt(tau:number):V3{
 if(tau<=0)return B0;
 if(tau<FLY)return flight(dAt(tau));
 if(tau<IN_NET)return mix3(GOAL_PT,NET_HIT,easeOut((tau-FLY)/(IN_NET-FLY)));
 const u=clamp((tau-IN_NET)/.5),h=NET_HIT[1]*(1-u*u)+.11*u*u,b=u>=1?.1*Math.abs(Math.sin((tau-IN_NET-.5)*9))*Math.exp(-(tau-IN_NET-.5)*3.5):0;
 return[lerp(NET_HIT[0],REST[0],u),Math.max(.11,h)+b,lerp(NET_HIT[2],REST[2],u)];
}
const spinAt=(tau:number)=>tau<=0?0:-TAU*2.6*Math.min(tau,IN_NET)-TAU*1.2*Math.max(0,tau-IN_NET);
const bulgeAt=(tau:number)=>tau<IN_NET-.03?0:.7*Math.exp(-(tau-IN_NET+.03)*2.6)*(1+.3*Math.sin((tau-IN_NET)*12));

// ---------------------------------------------------------------- the cast: kits (athlete.ts styles)
const SKIN_L:InkFill[]=[[Y,.36],[O,.2]],SKIN_M:InkFill[]=[[Y,.42],[O,.3],[B,.06]],SKIN_D:InkFill[]=[[O,.55],[K,.45]];
const italy=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[B,.95],shorts:'paper',socks:[B,.95],boots:K,skin:SKIN_M,hair:K,line:K,trim:'paper',numberInk:'paper',hairStyle:'short',...o});
const holland=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[O,.95],shorts:[K,.92],socks:[O,.95],boots:K,skin:SKIN_L,hair:K,line:K,trim:K,numberInk:K,hairStyle:'short',...o});
const TOTTI_B={height:1.8,bulk:1.02};
const TOTTI_ST=italy({number:20,hair:[K,.95],build:TOTTI_B,seed:20});
const VDS_ST:AthleteStyle={shirt:[K,.62],shorts:[K,.8],socks:[K,.62],boots:K,skin:SKIN_L,hair:[Y,.7],line:K,trim:O,gloves:'paper',sleeves:'long',hairStyle:'short',number:1,numberInk:'paper',build:{height:1.97,bulk:1.02},seed:16};
const TOLDO_ST:AthleteStyle={shirt:[Y,.95],shorts:[Y,.95],socks:[Y,.95],boots:K,skin:SKIN_M,hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',number:12,numberInk:K,build:{height:1.96},seed:17};
const REF_ST:AthleteStyle={shirt:[K,.88],shorts:[K,.88],socks:[K,.88],boots:K,skin:SKIN_L,hair:K,line:K,trim:Y,hairStyle:'balding',build:{height:1.82},seed:30};

// ---------------------------------------------------------------- Totti: set at his mark, the stroll, the scoop
/** approach from the LEFT of the ball (≈ 24°), so the right foot comes through straight behind it */
const DIRN=Math.hypot(1,.45),DIR:[number,number]=[1/DIRN,.45/DIRN];
const YAW_P=yawTo(0,0,DIR[0],DIR[1]);
const SD=1.0,RUN_END=-STRIKE_CONTACT*SD,T_RUN0=-2.0,RUN_L=4.0,STRIKE_L=1.4,G_MARK=-(RUN_L+STRIKE_L);
const CHIP=.28;// a short backswing, the toe slid under the ball, a checked follow-through
const PC:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{power:CHIP}),TOTTI_B,{x:0,z:0,yaw:YAW_P}),toe:[number,number]=[B0[0]-DIR[0]*.1,B0[2]-DIR[1]*.1];return[toe[0]-sk.rToe[0],toe[1]-sk.rToe[2]];})();
const gPos=(g:number):[number,number]=>[PC[0]+DIR[0]*g,PC[1]+DIR[1]*g];
/** at his mark: hands on hips, weight back, chin up (unhurried) */
const P_WAIT=posed({lHipF:-6,rHipF:12,lKnee:8,rKnee:14,lAnk:0,rAnk:-4,lean:2,pitch:0,neckP:-4,lShA:34,rShA:34,lShF:-14,rShF:-14,lElb:95,rElb:95,lShR:30,rShR:30});
const P_GO=posed({lHipF:-16,rHipF:20,lKnee:22,rKnee:28,lAnk:14,rAnk:-6,lean:12,pitch:3,neckP:8,lShA:20,rShA:18,lShF:-10,rShF:12,lElb:40,rElb:44,twist:-6});
const walkPose=(ph:number)=>{const p=blendPose(runCycle(ph,{speed:0,stride:.55}),P_WAIT,.3);p.air=0;return p;};
/** after the kick he turns and walks back toward the centre circle */
const T_TURN=1.7,T_WALKAWAY=2.2,AWAY:[number,number]=[-52,6];
const runU=(tau:number)=>clamp((tau-T_RUN0)/(RUN_END-T_RUN0));
function runG(tau:number){const u=runU(tau);return G_MARK+RUN_L*(1.15*u-.15*u*u);}
function tottiPose(tau:number,it=0):Pose{
 if(tau<=T_RUN0){const br=.5+.5*Math.sin(it*1.8),p=blendPose(P_WAIT,P_GO,sm(T_RUN0-.4,T_RUN0,tau));p.lean+=.02*br;p.neckP+=.03*br;return p;}
 if(tau<RUN_END){const u=runU(tau);return blendPose(P_GO,runCycle(2.6*u,{speed:.3}),sm(0,.18,u));}
 const us=STRIKE_CONTACT+tau/SD,run=runCycle(2.6+(tau-RUN_END)*1.3,{speed:.3});
 let p=blendPose(run,strike(Math.min(1,us),{power:CHIP}),sm(RUN_END,RUN_END+.14,tau));
 // the scoop: toe under the ball, body upright, a short follow-through that stops
 const lo=sm(RUN_END,-.02,tau)*(1-sm(.1,.4,tau));p.lean-=.1*lo;p.neckP+=.1*lo;p.rAnk-=.38*sm(-.2,0,tau)*(1-sm(.15,.4,tau));
 if(tau>0)p.rHipF*=1-.35*sm(0,.25,tau);
 if(tau>.55)p=blendPose(p,P_WAIT,sm(.55,1.2,tau)*.6);
 if(tau>T_TURN){const d=Math.max(0,tau-T_WALKAWAY)*1.3;p=blendPose(p,walkPose(d*.72+(tau-T_TURN)*.9),sm(T_TURN,T_TURN+.4,tau)*.8+.2*sm(T_WALKAWAY,T_WALKAWAY+.3,tau));}
 return p;
}
function tottiPlace(tau:number):Place{
 if(tau<=T_RUN0){const[x,z]=gPos(G_MARK);return{x,z,yaw:YAW_P};}
 let g:number;
 if(tau<RUN_END)g=runG(tau);
 else if(tau<0){const v=(tau-RUN_END)/-RUN_END;g=-STRIKE_L+STRIKE_L*(.6*v+.4*(1-(1-v)*(1-v)));}
 else g=.4*(1-Math.pow(1-clamp(tau/.6),2));
 let[x,z]=gPos(g);
 if(tau>T_WALKAWAY){const d=(tau-T_WALKAWAY)*1.3,L=Math.hypot(AWAY[0]-x,AWAY[1]-z);x+=(AWAY[0]-x)*d/L;z+=(AWAY[1]-z)*d/L;}
 const[x0,z0]=gPos(.4);
 return{x,z,yaw:lerpAng(YAW_P,yawTo(x0,z0,AWAY[0],AWAY[1]),sm(T_TURN,T_TURN+.6,tau,easeInOutSine))};
}

// ---------------------------------------------------------------- van der Sar: set, the feint to his LEFT (+z), the dive to his RIGHT (−z)
const T_FEINT0=-.8,T_FEINT1=-.34,T_DIVE=-.2,DIVE_S=1.15,VDS_X=-.1;
function vdsAt(tau:number,it:number):{pose:Pose;place:Place}{
 let p=keeperSet(it*1.1);
 // the feint: a shuffle and a lean to his left, then back over his feet
 const f=sm(T_FEINT0,T_FEINT1,tau,easeInOutSine)*(1-sm(T_FEINT1,T_DIVE+.02,tau));
 p.bend-=.3*f;p.lShA+=.25*f;p.neckY+=.12*f;
 if(tau>T_DIVE)p=blendPose(p,keeperDive(clamp((tau-T_DIVE)/DIVE_S),{side:'r',height:.35}),sm(T_DIVE,T_DIVE+.06,tau));
 if(tau>1.15)p.neckP-=.5*sm(1.15,1.7,tau);
 const shift=.32*sm(T_FEINT0,T_FEINT1,tau,easeInOutSine)*(1-.6*sm(T_FEINT1,T_DIVE,tau));
 return{pose:p,place:{x:VDS_X,z:shift,yaw:Math.PI}};
}

// ---------------------------------------------------------------- everyone else
type Role='toldo'|'ref'|'ar'|'ita'|'ned';
type Actor={name:string;role:Role;st:AthleteStyle;x:number;z:number;phase:number};
/** the two lines arm in arm in the centre circle (Italy nearer the camera side, the Netherlands beyond); Totti's gap is beside Di Biagio (14) */
const LINE:Actor[]=[];
const CIRCLE_TOTTI:[number,number]=[-52.3,-3.4];
{const ita=[[13,'long'],[14,'short'],[3,'long'],[10,'short'],[21,'short']] as [number,string][],ned=[[9,'short',1],[6,'short',1],[8,'long',1],[12,'short',0]] as [number,string,number][];
 ita.forEach(([n,h],i)=>LINE.push({name:'Italy '+n,role:'ita',st:italy({number:n,hairStyle:h as AthleteStyle['hairStyle'],build:{height:1.8+.02*(i%2)},seed:40+i,detail:'low'}),x:-52.4+.2*(i%2),z:-6.2+i*.7+(i>=2?.7:0),phase:i*.23}));
 ned.forEach(([n,h,d],i)=>LINE.push({name:'Netherlands '+n,role:'ned',st:holland({number:n,hairStyle:h as AthleteStyle['hairStyle'],skin:d?SKIN_D:SKIN_L,build:{height:1.82+.03*(i%2)},seed:50+i,detail:'low'}),x:-52.6-.2*(i%2),z:1.6+i*.7,phase:i*.31}));}
const ACTORS:Actor[]=[
 {name:'Toldo',role:'toldo',st:TOLDO_ST,x:.4,z:20.6,phase:.2},
 {name:'Merk',role:'ref',st:REF_ST,x:-7.5,z:-9.6,phase:.6},
 {name:'assistant',role:'ar',st:{...REF_ST,hairStyle:'short',seed:31},x:.6,z:9.4,phase:.1},
 ...LINE,
];
const LINKED=posed({lShA:26,rShA:26,lShF:-6,rShF:-6,lElb:12,rElb:12,lHipF:6,rHipF:6,lKnee:10,rKnee:10,lean:6,neckP:4});
const SLUMP=posed({lHipF:30,rHipF:30,lKnee:36,rKnee:36,lean:34,pitch:6,neckP:30,lShA:14,rShA:14,lShF:24,rShF:24,lElb:20,rElb:20});
/** one actor's pose + place at τ (it = idle clock, win = the "Italy go through" celebration) */
function actorAt(a:Actor,tau:number,it:number,win=0):{pose:Pose;place:Place}{
 const toBall=yawTo(a.x,a.z,B0[0],B0[2]),br=Math.sin(it*2.1+a.phase*TAU),goal=Math.max(sm(IN_NET-.1,IN_NET+.3,tau)*.6,win);
 switch(a.role){
  case 'toldo':{let p=blendPose(stand(),LINKED,.3+.1*br);if(goal>0)p=blendPose(p,celebrate(it*.8,{kind:'arms'}),.6*goal);return{pose:p,place:{x:a.x,z:a.z,yaw:yawTo(a.x,a.z,0,0)}};}
  case 'ref':{const p=blendPose(stand(),LINKED,.2+.1*br);return{pose:p,place:{x:a.x,z:a.z,yaw:yawTo(a.x,a.z,0,-.5)}};}
  case 'ar':{const p=blendPose(stand(),LINKED,.2);return{pose:p,place:{x:a.x,z:a.z,yaw:yawTo(a.x,a.z,0,0)}};}
  case 'ita':{let p=blendPose(LINKED,stand(),.2+.1*br);if(goal>0)p=blendPose(p,celebrate(it*.9+a.phase,{kind:'arms'}),goal);return{pose:p,place:{x:a.x,z:a.z,yaw:toBall}};}
  default:{let p=blendPose(LINKED,stand(),.2+.1*br);if(goal>0)p=blendPose(p,SLUMP,goal*.8);return{pose:p,place:{x:a.x,z:a.z,yaw:toBall}};}
 }
}
/** Totti in the line before his kick: arm in arm, turning to whisper to Di Biagio beside him (talk 0..1) */
function circleTotti(it:number,talk:number):{pose:Pose;place:Place}{
 const p=blendPose(LINKED,stand(),.2+.1*Math.sin(it*2.1));p.neckY+=.7*talk;p.bend-=.14*talk;p.neckP+=.15*talk;p.twist+=.2*talk;
 return{pose:p,place:{x:CIRCLE_TOTTI[0],z:CIRCLE_TOTTI[1],yaw:yawTo(CIRCLE_TOTTI[0],CIRCLE_TOTTI[1],B0[0],B0[2])}};
}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the pose one drawn frame earlier (secondary
 * motion: hair/hem trail), smear = halftone echo + speed lines on fast limbs (the run, the strike, the dive). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:{pose:Pose;place:Place},smear=false){
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
}

// ---------------------------------------------------------------- the ball
function drawBall(s:Sheet,c:Cam,tau:number,o:{min?:number;lines?:boolean;prev?:number}={}){
 const P=ballAt(tau),q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??18,c.F*.11/q[2]);
 const sh:Pt[]=[];const rad=.16+P[1]*.05;for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*1.3,0,P[2]+Math.sin(a)*rad]);if(p)sh.push(p);}
 if(sh.length>8)s.tone(K,polyPath(sh,true),clamp(.5-P[1]*.15,.1,.5));
 if(o.lines&&o.prev!==undefined&&tau>0&&tau<IN_NET){const a=pr(c,ballAt(o.prev));if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.8)speedLines(s,K,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:3,seed:7,len:Math.min(200,d*1.2),spread:r*.8,width:Math.max(2.5,r*.16),cov:.75});}}
 footballPanels(s,g[0],g[1],r,{rot:spinAt(tau),key:K,shadow:B,seed:5});
 return{g,r,d:q[2]};
}
function pathPts(c:Cam,ta:number,tb:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<=n;i++){const p=pr(c,ballAt(lerp(ta,tb,i/n)));if(p)out.push(p);}return out;}

// ---------------------------------------------------------------- one frame of the world through a camera
type Env={it:number;smear?:boolean;minBall?:number;lines?:boolean;prevT?:number;hero?:'high'|'mid';line?:boolean;circle?:number;talk?:number;win?:number;noTotti?:boolean};
/** everything on the pitch, depth-sorted (far first): the players at τp (poses on twos), their previous drawn pose, the ball at τ.
 * circle > 0: Totti is still in the centre-circle line (before the cut to his mark). Heat: small figures print at `low` detail; inside a
 * passage every figure is capped. */
function play(s:Sheet,c:Cam,tau:number,tp:number,tpPrev:number,e:Env){
 const v=view(s),items:{d:number;draw:()=>void}[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending;
 const visible=(pl:Place,h=1.8)=>{const q=toCam(c,[pl.x??0,.9,pl.z??0]);if(q[2]<1)return -1;const g=scr(c,q),k=c.F/q[2]*h;return Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k?-1:q[2];};
 const detailFor=(st:AthleteStyle,d:number,hero:boolean):AthleteStyle=>{const px=c.F*1.8/d*ppu;if(passing)return{...st,detail:hero?'mid':'low'};if(!hero&&px<120)return{...st,detail:'low'};if(px<60)return{...st,detail:'low'};if(hero&&e.hero==='mid'&&px>170)return{...st,detail:'mid'};return st;};
 const win=e.win??0;
 if(e.circle){const cur=circleTotti(e.it,e.talk??0),d=visible(cur.place);if(d>0)items.push({d,draw:()=>{const prev=circleTotti(e.it-1/12,e.talk??0);drawPlayer(s,cur.pose,c,detailFor(TOTTI_ST,d,true),cur.place,prev);}});}
 else if(!e.noTotti){const pl=tottiPlace(tp),d=visible(pl);if(d>0)items.push({d,draw:()=>{const pose=tottiPose(tp,e.it),prev={pose:tottiPose(tpPrev,e.it-1/12),place:tottiPlace(tpPrev)};
  drawPlayer(s,pose,c,detailFor(TOTTI_ST,d,true),pl,prev,!!e.smear&&tp>T_RUN0+.2&&tp<.4);}});}
 {const cur=vdsAt(tp,e.it),d=visible(cur.place);if(d>0)items.push({d,draw:()=>{const prev=vdsAt(tpPrev,e.it-1/12);drawPlayer(s,cur.pose,c,detailFor(VDS_ST,d,true),cur.place,prev,!!e.smear&&tp>T_DIVE&&tp<.7);}});}
 for(const a of ACTORS){if(!e.line&&(a.role==='ita'||a.role==='ned'))continue;const cur=actorAt(a,tp,e.it,win),d=visible(cur.place);if(d<0)continue;
  items.push({d,draw:()=>{const prev=actorAt(a,tpPrev,e.it-1/12,win);drawPlayer(s,cur.pose,c,detailFor(a.st,d,false),cur.place,prev);}});}
 const bq=toCam(c,ballAt(tau));if(bq[2]>=NEAR)items.push({d:bq[2],draw:()=>{drawBall(s,c,tau,{min:e.minBall,lines:e.lines,prev:e.prevT});}});
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
const pxz=(tau:number):V3=>{const p=tottiPlace(tau);return[p.x??0,0,p.z??0];};

/** a riso speech bubble on the sheet at p (the tail pointing down-left to the speaker) with a little chip loop and ball inside */
function chipBubble(s:Sheet,p:Pt,r:number,u:number,t:number){
 if(u<=.02)return;const k=easeOutBack(clamp(u)),R=r*k,cx=p[0]+R*.9,cy=p[1]-R*1.25;
 const body:Pt[]=[];for(let i=0;i<28;i++){const a=i/28*TAU;body.push([cx+Math.cos(a)*R*1.25,cy+Math.sin(a)*R*.85]);}
 const bub=polyPath(body,true);bub.addPath(polyPath([[cx-R*.55,cy+R*.62],[p[0],p[1]],[cx-R*.1,cy+R*.78]],true));
 s.knockout(bub);s.stroke(K,bub,Math.max(2,R*.07),.9);
 const arc:Pt[]=[];for(let i=0;i<=12;i++){const q=i/12;arc.push([cx-R*.8+R*1.5*q,cy+R*.4-R*1.1*4*q*(1-q)]);}
 s.fill(Y,ribbon(arc,Math.max(3,R*.14),{seed:3,taper:.6,pressure:.3,wobble:.6}),.95);
 const e=arc[arc.length-1];footballPanels(s,e[0],e[1]-R*.08,R*.2,{rot:t*2,key:K,shadow:B,seed:5});
}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera (the −z side), real time
/** contact lands just after "the keeper dives" (van der Sar goes a beat before the scoop) — never before a full, unhurried run */
const tS1=()=>Math.max(CUE(0,'scoops')-.2,CUE(0,'the keeper')+.4,CUE(0,'strolls')+.2-T_RUN0);
const tau1=(t:number)=>Math.max(T_RUN0-4,t-tS1());
/** the cut from the centre circle to Totti at his mark */
const tCut=()=>Math.max(CUE(0,'tells')+1.3,Math.min(CUE(0,'strolls')-.7,tS1()+T_RUN0-.9));
const P1:V3=[-44,21,-58],P1L:V3=[-43,1.9,-24];
function cam1(t:number):Cam{
 const tau=tau1(t),tRun=tS1()+T_RUN0,tc=tCut();
 const ct:V3=[CIRCLE_TOTTI[0],1.2,CIRCLE_TOTTI[1]];
 return plan(t,[
  [0,0,()=>({P:P1,T:[-40,14,20],fov:58})],
  [CUE(0,'go to penalties')-.3,1.2,()=>({P:P1,T:[-52.5,1,-.8],fov:10})],
  // cut to the low touchline camera for the huddle: Totti turns to Di Biagio
  [CUE(0,'Francesco')-.1,.01,()=>({P:P1L,T:add3(ct,[0,.2,1.2]),fov:15})],
  [CUE(0,'tells')-.1,1,()=>({P:add3(P1L,[1,0,1.5]),T:add3(ct,[0,.7,-.1]),fov:9})],
  // the cut: straight to Totti at his mark, the keeper beyond
  [tc,.01,()=>({P:P1,T:add3(pxz(T_RUN0),[2.2,1.1,.4]),fov:5.5})],
  [Math.max(tc+.3,Math.min(tRun-.1,CUE(0,'the keeper')-.2)),1.4,()=>({P:P1,T:add3(mix3(pxz(Math.min(tau,0)),[VDS_X,0,0],.55),[0,1.1,0]),fov:13.5})],
  [tS1()+IN_NET-.2,.9,()=>({P:P1,T:[.3,1.2,.2],fov:8.5})],
  [tS1()+IN_NET+1.1,1.6,()=>({P:P1,T:mix3([.3,1.1,0],add3(pxz(tau),[0,1,0]),.55),fov:16})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tau=tau1(t),tt=twos(t),tp=tau1(tt),tpp=tau1(tt-1/12),tN=tS1()+IN_NET,tc=tCut(),tT=CUE(0,'tells');
  const inCircle=t<tc?1:0,talk=sm(tT-.1,tT+.3,t)*(1-sm(tc-.3,tc,t));
  stadium(s,c,t,[1,2,3],{roar:sm(tN-.1,tN+.4,t),flash:sm(tN,tN+.25,t)*(1-sm(tN+2.5,tN+3.5,t))});
  ground(s,c,{bulge:bulgeAt(tau)});
  play(s,c,tau,tp,tpp,{it:tt,minBall:14,lines:true,prevT:tau1(t-.06),hero:'mid',line:true,circle:inCircle,talk});
  // "I'm going to chip it!" — a bubble from Totti's head to Di Biagio, with a little chip inside
  if(inCircle&&talk>.02){const ct=circleTotti(tt,talk),sk=solve(ct.pose,TOTTI_B,ct.place),h=pr(c,sk.head);if(h)chipBubble(s,[h[0]+kAt(c,sk.head)*.12,h[1]-kAt(c,sk.head)*.12],Math.max(34,kAt(c,sk.head)*.34),talk,tt);}
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:14,
};

// ---------------------------------------------------------------- 2 · the slow-motion replay from HIGH BEHIND THE GOAL: the feint, the dive, the float
const tau2=(t:number)=>key(t,mono([[0,T_RUN0+.1],[CUE(1,'Van der Sar'),-1.05],[CUE(1,'leans'),T_FEINT1-.05],[CUE(1,'then dives'),T_DIVE+.06],[CUE(1,'Totti lifts'),.06],[CUE(1,'softly'),.45],[CUE(1,'over him'),FLY-.1],[SECS(1),IN_NET+.9]]),linear);
const E2:V3=[15,9.5,4];
function cam2(t:number):Cam{
 const tau=tau2(t),b=ballAt(Math.min(tau,FLY));
 return plan(t,[
  [0,0,()=>({P:E2,T:add3(mix3(pxz(tau),[VDS_X,0,0],.5),[0,.6,0]),fov:17})],
  [CUE(1,'leans')-.3,.9,()=>({P:add3(E2,[-.8,-.4,-.5]),T:[-4.4,.5,.2],fov:14})],
  [CUE(1,'Totti lifts')-.2,.9,()=>({P:add3(E2,[-1.2,-.6,-.8]),T:mix3(b,[-2,.8,0],.5),fov:13})],
  [CUE(1,'over him')-.2,1.2,()=>({P:add3(E2,[-1.6,-.8,-1]),T:[-1.2,.7,-.3],fov:12})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tau=tau2(t),tt=twos(t),tp=tau2(tt),tpp=tau2(tt-1/12);
  stadium(s,c,t,[3,0,2],{roar:sm(IN_NET,IN_NET+.4,tau),flash:sm(IN_NET+.1,IN_NET+.3,tau)});
  ground(s,c,{goal:false});
  // the replay trail: the soft loop so far, fading at the tail (under the players)
  if(tau>.02&&tau<IN_NET+.7){const pts=pathPts(c,Math.max(0,tau-.9),Math.min(tau,FLY+.001),20),fade=1-sm(FLY+.1,IN_NET+.7,tau);if(pts.length>2){const w=Math.max(7,kAt(c,ballAt(Math.min(tau,FLY)))*.15);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*fade);}}
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:11});
  // from behind and above, the net hangs between the lens and the keeper
  goal3(s,c,bulgeAt(tau),.55);
 },
 aperture(t){const c=cam2(t),P=ballAt(tau2(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:5.8,
};

// ---------------------------------------------------------------- 3 · pitch level, side-on from the +z touchline: the ball floats just over the falling keeper
const tau3=(t:number)=>key(t,mono([[0,T_DIVE-.25],[CUE(2,'ball floats'),.2],[CUE(2,'falling keeper'),.62],[CUE(2,'Italy go'),IN_NET+.7],[SECS(2),IN_NET+.7+(SECS(2)-CUE(2,'Italy go'))]]),linear);
const E3:V3=[-3.2,.95,12.5];
function cam3v(t:number):Cam{
 const tau=tau3(t),b=ballAt(Math.min(tau,FLY)),tI=CUE(2,'Italy go');
 return plan(t,[
  [0,0,()=>({P:E3,T:[-9,1,-.6],fov:21})],
  [CUE(2,'ball floats')-.3,1.2,()=>({P:add3(E3,[.6,.1,-.5]),T:mix3(b,[-1.4,.9,-.8],.5),fov:17})],
  [CUE(2,'falling')-.2,1,()=>({P:add3(E3,[.9,.1,-.8]),T:[-.9,.9,-.9],fov:14})],
  [tI-.2,1.3,()=>({P:add3(E3,[.9,1.2,-.8]),T:[-52.5,1.1,-3.2],fov:7.5})],
  [CUE(2,'the final')+.3,1.4,()=>({P:add3(E3,[.9,1.2,-.8]),T:[-52.5,1.8,-2.8],fov:6.2})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tau=tau3(t),tt=twos(t),tp=tau3(tt),tpp=tau3(tt-1/12),tI=CUE(2,'Italy go'),tF=CUE(2,'the final');
  const win=sm(tI-.1,tI+.5,t);
  stadium(s,c,t,[0,3,1],{roar:.3+.7*Math.max(sm(IN_NET,IN_NET+.4,tau),win),flash:.3*sm(IN_NET,IN_NET+.3,tau)+.7*sm(tF-.1,tF+.3,t)});
  ground(s,c,{bulge:bulgeAt(tau)});
  // the gap: a paper bracket between the ball and the falling keeper's reach ("so close, yet unreachable")
  const gap=sm(.72,.84,tau)*(1-sm(.98,1.12,tau));
  if(gap>.02){const vs=vdsAt(tau,tt),sk=solve(vs.pose,VDS_ST.build,vs.place),hand=sk.rHa[1]>sk.lHa[1]?sk.rHa:sk.lHa,bb=ballAt(Math.min(tau,FLY)),a=pr(c,[bb[0],bb[1]-.14,bb[2]]),h=pr(c,hand);
   if(a&&h&&a[1]<h[1]){const w=Math.max(5,kAt(c,bb)*.035),rb=new Path2D();for(let i=0;i<6;i++){const u0=i/6,u1=(i+.55)/6;rb.addPath(ribbon([[lerp(a[0],h[0],u0),lerp(a[1],h[1],u0)],[lerp(a[0],h[0],u1),lerp(a[1],h[1],u1)]],w,{seed:5+i,taper:.2,wobble:0}));}s.knockout(rb,.9*gap);s.fill(Y,rb,.95*gap);s.stroke(K,rb,1.6,.8*gap);}}
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:12,line:true,win,noTotti:tau>2.6});
  const wc=sm(tF-.05,tF+.4,t);if(wc>0){const q=pr(c,[-52.5,3.2,-2.2]);if(q)sparkBurst(s,Y,q[0],q[1],90+130*wc,{n:11,seed:9,g:easeOutBack(wc),width:12});}
 },
 aperture(t){const c=cam3v(t),q=pr(c,[-52.5,1.5,-2.8])??[0,0];return apertureDisc(q[0],q[1],80,12);},
 still:2.6,
};

// ---------------------------------------------------------------- 4 · the lesson: brave → calm → watch the keeper commit → choose the empty space
const tau4=(t:number)=>key(t,mono([[0,T_RUN0-.9],[CUE(3,'Watch the keeper'),T_RUN0-.1],[CUE(3,'commit'),T_FEINT1],[CUE(3,'then choose'),-.02],[CUE(3,'empty space'),.5],[SECS(3),IN_NET+.6]]),linear);
function cam4v(t:number):Cam{
 const tau=tau4(t),pm=pxz(T_RUN0);
 return plan(t,[
  [0,0,()=>({P:[-22,2.7,-7.5],T:[-7.5,1.1,0],fov:30})],
  [CUE(3,'stay calm')-.2,1.1,()=>({P:add3(pm,[1.2,1.8,-4.4]),T:add3(pm,[0,1.05,0]),fov:28})],
  [CUE(3,'Watch the keeper')-.25,1.2,()=>({P:add3(pm,[-4,3.1,2.8]),T:[-2.2,1.1,.2],fov:30})],
  [CUE(3,'then choose')-.2,1.2,()=>({P:add3(pm,[-3,2.8,2.4]),T:mix3([-2,1.2,.1],ballAt(Math.min(tau,FLY)),.25),fov:32})],
 ]);
}
function arrow3(s:Sheet,c:Cam,pts:V3[],w:number,ink:string,cov=1){
 const q=pts.map(p=>pr(c,p)).filter((p):p is Pt=>!!p);if(q.length<2)return;
 const e=q[q.length-1],f=q[q.length-2],ang=Math.atan2(e[1]-f[1],e[0]-f[0]),ca=Math.cos(ang),sa=Math.sin(ang),hd=w*2.6;
 const shaft=q.slice(0,-1).concat([[e[0]-ca*hd*.7,e[1]-sa*hd*.7]]);
 const p=ribbon(shaft,w,{taper:.2,pressure:.2,wobble:.8});p.addPath(polyPath([[e[0]+ca*hd*.3,e[1]+sa*hd*.3],[e[0]-ca*hd-sa*hd*.62,e[1]-sa*hd+ca*hd*.62],[e[0]-ca*hd+sa*hd*.62,e[1]-sa*hd-ca*hd*.62]],true));
 s.knockout(p);s.fill(ink,p,cov);s.stroke(K,p,Math.max(2,w*.12),.85);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tau=tau4(t),tt=twos(t),tp=tau4(tt),tpp=tau4(tt-1/12);
  const tBr=CUE(3,'Be brave'),tC=CUE(3,'stay calm'),tW=CUE(3,'Watch the keeper'),tK=CUE(3,'commit'),tCh=CUE(3,'then choose'),tE=CUE(3,'empty space');
  // stay calm: the loud stadium fades toward paper and stays quiet
  const hush=sm(tC-.1,tC+.7,t)*(1-.45*sm(tE,tE+.6,t));
  stadium(s,c,t,[1,2,3],{roar:.5*(1-sm(tC-.1,tC+.4,t)),flash:.6*(1-sm(tC-.3,tC+.2,t)),hush});
  ground(s,c,{bulge:bulgeAt(tau),hush:hush*.4});
  // be brave: the plan, a dashed yellow chip arc from the spot to the middle of the goal
  const br=sm(tBr-.1,tBr+.6,t)*(1-sm(tW-.2,tW+.4,t));
  if(br>.02){const pts=partial(pathPts(c,.001,FLY,60),clamp(br));if(pts.length>3){const w=Math.max(7,kAt(c,[-5.5,1.8,0])*.11),rb=new Path2D();const n=10;for(let i=0;i<n;i++){const a=Math.floor(i/n*(pts.length-1)),b=Math.min(pts.length-1,Math.floor((i+.6)/n*(pts.length-1)));if(b>a)rb.addPath(ribbon(pts.slice(a,b+1),w,{seed:21+i,taper:.3,wobble:.4}));}s.knockout(rb,.9*br);s.fill(Y,rb,.95*br);s.stroke(K,rb,1.6,.7*br);}}
  // choose the empty space: a yellow window in the middle of the goal, where the keeper just was
  const ch=sm(tCh-.15,tCh+.4,t);
  if(ch>.02){const zc=.1,yc=1.45,hw=.85*easeOutBack(ch),hh=.62*easeOutBack(ch),q=polyP(c,[[.02,yc-hh,zc-hw],[.02,yc-hh,zc+hw],[.02,yc+hh,zc+hw],[.02,yc+hh,zc-hw]]);
   if(q.length>2){const win=polyPath(q,true);s.knockout(win,.55*ch);s.tone(Y,win,.6*ch);const fr=ribbon(q.concat([q[0]]),Math.max(5,kAt(c,[0,1.4,0])*.05),{seed:31,taper:0,wobble:.8});s.knockout(fr,.9*ch);s.fill(Y,fr,.95*ch);s.stroke(K,fr,1.6,.8*ch);}
   const pts=partial(pathPts(c,0,FLY,30),Math.max(.04,clamp(tau/FLY))),w=Math.max(8,kAt(c,[-5,1.6,0])*.1);if(pts.length>2&&tau>0){s.knockout(ribbon(pts,w*1.6,{taper:.4,pressure:.2,wobble:0}),.5*ch);s.fill(Y,ribbon(pts,w,{taper:.4,pressure:.2,wobble:0}),.95*ch);}}
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:13});
  // watch the keeper: a dashed yellow sight line from Totti's eyes to van der Sar, held until he commits
  const sl=sm(tW-.15,tW+.5,t,easeOutBack)*(1-sm(tCh+.1,tCh+.6,t));
  if(sl>.02){const sk=solve(tottiPose(tp,tt),TOTTI_B,tottiPlace(tp)),vs=vdsAt(tp,tt),vk=solve(vs.pose,VDS_ST.build,vs.place),a=pr(c,sk.face),b=pr(c,vk.head);
   if(a&&b){const rb=new Path2D(),n=9,w=Math.max(8,kAt(c,pxz(T_RUN0))*.04),u1=clamp(sl);for(let i=0;i<n;i++){const u0=i/n*u1,ue=(i+.62)/n*u1,p0:Pt=[lerp(a[0],b[0],u0),lerp(a[1],b[1],u0)],p1:Pt=[lerp(a[0],b[0],ue),lerp(a[1],b[1],ue)];rb.addPath(ribbon([p0,p1],w,{seed:13+i,taper:.2,wobble:0}));}
    s.knockout(rb,.95);s.fill(Y,rb,.95);s.stroke(K,rb,1.8,.8);}}
  // commit: the feint (a pale navy arrow to his left) is crossed by the real move (an orange arrow along his dive to his right)
  const fa=sm(T_FEINT0,T_FEINT1,tau)*(1-sm(tE,tE+.5,t));
  if(fa>.02){const a:V3=[VDS_X-.3,1.5,.2],b:V3=[VDS_X-.3,1.55,.2+1.3*fa];arrow3(s,c,[a,mix3(a,b,.5),b],Math.max(6,kAt(c,a)*.045),K,.45);}
  const dv=sm(T_DIVE,T_DIVE+.3,tau,easeOutBack)*(1-sm(tE+.4,tE+1,t));
  if(dv>.02){const a:V3=[VDS_X-.3,.9,0],b:V3=[VDS_X-.3,.5,-2.4*dv];arrow3(s,c,[a,mix3(a,b,.5),b],Math.max(8,kAt(c,a)*.06),O,.95);}
  // the empty space: it drops in — a yellow burst in the net
  const gd=sm(tE+.2,tE+.6,t);if(gd>0&&tau>FLY){const q=pr(c,[.6,1.3,.15]);if(q)sparkBurst(s,Y,q[0],q[1],Math.max(60,kAt(c,[0,1.3,0])*1.1)*easeOutBack(gd),{n:10,seed:61,width:Math.max(6,kAt(c,[0,1.3,0])*.05)});}
 },
 still:9,
};

const film:RisoStory={
 id:'totti-cucchiaio-2000',format:'11v11',title:"Totti's 'spoon' penalty v the Netherlands",
 theme:'Penalties: be brave but stay calm — watch the keeper commit, then choose the empty space',
 ageNote:'Italy 0–0 Netherlands (Italy won 3–1 on penalties), Euro 2000 semi-final, Amsterdam ArenA, 29 June 2000. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',orange:'#ff6c2f',blue:'#0078bf',navy:'#22366b'},order:['yellow','orange','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a little spoon — a soft yellow scoop line that curls up and over, with a gently turning ball on its tip. Reduced motion: the still loop. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.6)),fade=age<=0?1:1-clamp((age-.65)/.25),r=rng(seed);
  const pts:Pt[]=[];for(let i=0;i<=16;i++){const k=i/16*u;pts.push([x-30*Math.sin(k*2)+60*k,y-240*k+200*k*k]);}
  if(pts.length>2)s.fill(Y,ribbon(pts,13,{seed,taper:.8,pressure:.3,wobble:1}),.95*fade);
  const e=pts[pts.length-1];if(age>0&&age<.3)sparkBurst(s,O,x,y,70,{n:7,seed,g:1-clamp(age/.3),width:9});
  footballPanels(s,e[0],e[1],32,{rot:-age*6+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
