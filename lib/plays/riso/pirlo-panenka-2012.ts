/** Andrea Pirlo's chipped ("Panenka") penalty — England 0–0 Italy (Italy won 4–2 on penalties), UEFA Euro 2012 quarter-final, Olympic
 * Stadium (NSC Olimpiyskiy), Kyiv, 24 June 2012 — an iconic-play riso film (RisoStory, chapters mode) played by the card's picture window
 * (components/CardFilmPlayer.tsx) or StoryFilmPlayer. A 1:1 reconstruction of the kick from WRITTEN accounts (the footage itself was not
 * reviewed), rendered as a riso print.
 *
 * SOURCES (read Sept 2026, cached in scratchpad/films/src-cache/):
 *  - Wikipedia, "UEFA Euro 2012 knockout stage" (England vs Italy box: date, 21:45 EEST kick-off, Olympic Stadium Kyiv, 64,340, referee
 *    Pedro Proença (Portugal), line-ups + numbers, the shoot-out order, the kit boxes from UEFA's line-up sheet)
 *    https://en.wikipedia.org/wiki/UEFA_Euro_2012_knockout_stage
 *  - Wikipedia, "Andrea Pirlo" (Man of the Match; "an audacious chipped penalty down the centre of the goal"; his quote "I saw the goalkeeper
 *    making strange movements, so I waited for him to move and hit it like that") https://en.wikipedia.org/wiki/Andrea_Pirlo
 *  - BBC Sport, Phil McNulty, "England 0-0 Italy (2-4 on pens)", 24 June 2012 https://www.bbc.com/sport/football/18355305
 *  - BBC Sport, "Euro 2012 analysis: Peerless Pirlo exposes England", 24 June 2012 ("lift the ball over Joe Hart")
 *    https://www.bbc.co.uk/sport/football/18574269
 *  - Mirror, "Andrea Pirlo Panenka penalty: Pirlo explains that spot kick that bamboozled Joe Hart", 15 April 2014 (from his autobiography
 *    I Think Therefore I Play: "I made my decision right at the last second, when I saw Joe Hart ... doing all sorts on his line"; "As I
 *    began my run up, I still hadn't decided ... then he moved and my mind was made up"; Italy trailing 2–1 after Montolivo's miss;
 *    "scooped his shot down the middle ... past the despairing dive of Joe Hart")
 *    https://www.mirror.co.uk/sport/football/news/andrea-pirlo-panenka-penalty-andrea-3416154
 *  - Wikipedia, "Panenka (penalty kick)" (the technique; Pirlo's in this shoot-out) https://en.wikipedia.org/wiki/Panenka_(penalty_kick)
 * CONFIRMED by those accounts: 24 June 2012, a night kick-off (21:45 local) in Kyiv; 0–0 after extra time; the shoot-out order Balotelli ✓,
 *  Gerrard ✓, Montolivo ✗ (wide), Rooney ✓ — so ENGLAND LED 2–1 when Pirlo stepped up (Italy's third kick) — then Pirlo ✓ (2–2), Young ✗,
 *  Nocerino ✓, Cole ✗ (saved by Buffon), Diamanti ✓: Italy won 4–2; Pirlo wore 21 and was Man of the Match; Joe Hart (1) in England's goal,
 *  Buffon (1) Italy's keeper and captain; the kick was a soft chip DOWN THE MIDDLE while Hart dived to one side; Hart had been moving about
 *  on his line ("doing all sorts", "strange movements") and Pirlo waited for him to move, deciding at the last second; England all in white
 *  and Italy all in blue (the Wikipedia kit boxes from UEFA's line-up sheet); referee Pedro Proença; Pirlo is right-footed.
 * INFERRED (illustrative): WHICH WAY Hart dived (drawn to his right; the narration only says "to one side"), every position and time in
 *  metres/seconds (the run-up ≈ 4.6 m from his left at ≈ 20°, slowing on the last steps; the flight ≈ 1 s, peak ≈ 1.8 m, crossing the line
 *  ≈ 1.45 m high just right of centre); Hart's antics as drawn (bouncing, arms up, shuffling); the keeper kit colours (Hart yellow, Buffon
 *  grey), the referee's and assistant's navy kit, where the referee, the assistant and Buffon stood (Buffon at the penalty-area corner of the
 *  goal line, as the Laws require), the players arm in arm in the centre circle, which end the shoot-out used, Pirlo walking back calmly with
 *  no celebration, his long hair (beard not drawn), Hart's short hair, the camera placements, the stadium as drawn (two tiers, blue and
 *  yellow seats, a running track, a membrane roof ring with floodlights), the crowd's colours and the flags.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in REAL TIME (Kyiv at night → the players linked in the
 * centre circle → England's group (they lead) → Pirlo walks back to his mark → Hart jumping about on his line → Pirlo, calm → the run and
 * the chip → the net); ch2 = the slow-motion replay from LOW BEHIND Pirlo (he slows, Hart goes, the ball floats into the middle, a riso
 * trail marks it); ch3 = the reverse angle from behind the net (the ball drops in toward the camera over the keeper on the ground, then
 * the lens finds the fans' flags: Italy go on to win); ch4 = the lesson: pressure (a jagged red ring) → calm (a smooth yellow ring) →
 * watch the keeper (a sight line; he commits, a red arrow) → the decision (the soft yellow path into the empty middle).
 * Composed on the FULL sheet (world units = sheet units centred on the canvas; never sheet.safe) and kept inside the central ~1000 units, so
 * it frames from the 1.45:1 card window down to square (a narrower window widens the lens a little). Figures: every body goes through ONE
 * adapter, drawPlayer() → athlete.ts (continuous silhouettes, FK skeleton, `prev` secondary motion — Pirlo's long hair trails — and a motion
 * smear on the run and the strike); small figures in the wide shots and every figure inside a passage print at `low` detail. Handedness:
 * the world is right-handed (x toward England's goal, y up, +z = Pirlo's right, the main-stand side), exactly athlete.ts's convention, so
 * his RIGHT foot strikes with no mirrored projector; Hart faces −x, so his right is −z.
 * Inks: yellow, red, blue, navy. Everything is keyed to cue times (withTiming swaps in the recorded word onsets), poses on twos, cameras on
 * ones; all randomness seeded. Budget: ~150–320 plate ops per frame. */
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
 * public/plays/narration/pirlo-panenka-2012/timing.json, add
 *   import timingJson from '../../../public/plays/narration/pirlo-panenka-2012/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues).
 * NB withTiming matches a cue by its FIRST word, in order — so no cue starts with a word that also appears between it and the previous cue
 * ("stays calm", not "Pirlo stays calm", which would catch the "Pirlo" of "Andrea Pirlo"). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'Penalties, live',text:'Kyiv, 2012. Italy and England go to penalties, and England lead. Andrea Pirlo steps up. The keeper jumps around on his line. Pirlo stays calm... and chips it down the middle. Goal!',tail:2.2,
  cues:['Kyiv','go to penalties','England lead','Andrea Pirlo','The keeper jumps','stays calm','chips it','Goal']},
 {label:'Watch it again',text:'Watch it again, slowly. Pirlo waits for the keeper to move. The keeper dives, and the ball floats gently into the middle.',tail:1.6,
  cues:['Watch it again','Pirlo waits','keeper to move','The keeper dives','the ball floats','into the middle']},
 {label:'From behind the net',text:'From behind the net: the keeper is already on the ground. Italy go on to win the shootout!',tail:1.8,
  cues:['From behind','already on the ground','Italy go on','win the shootout']},
 {label:'The secret',text:'The secret? Under pressure, stay calm and watch the keeper. A calm mind makes good decisions.',tail:1.9,
  cues:['The secret','Under pressure','stay calm','watch the keeper','A calm mind','good decisions']},
];
import timingJson from '../../../public/plays/narration/pirlo-panenka-2012/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , . ! ? : ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('pirlo: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('pirlo: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
/** key() needs increasing times: push each key at least `gap` after the previous one (real voice timings can crowd authored offsets) */
function mono(K:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of K)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}

// ---------------------------------------------------------------- inks, vectors
const Y='yellow',R='red',B='blue',K='navy';
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
/** Pitch: England's goal line is x = 0 (the kick goes +x), the goal centre z = 0, +z = Pirlo's right (the main-stand side). */
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

// ---------------------------------------------------------------- the Olympic Stadium, Kyiv, at night: navy sky, two-tier bowl, roof ring, floodlights
/** stand planes (a along, b up the rake 0..1), set back past the running track: 0 the far side (z<0), 1 behind England's goal (x>0),
 * 2 the main stand (z>0, the camera side), 3 the far end */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-120,15,a),1.2+28*b,-46-34*b],
 (a,b)=>[14+31*b,1.2+28*b,lerp(-62,62,a)],
 (a,b)=>[lerp(15,-120,a),1.2+24*b,46+30*b],
 (a,b)=>[-119-31*b,1.2+28*b,lerp(62,-62,a)],
];
const STAND_COLS=[110,74,110,74],STAND_ROWS=14,WALK=.47;
/** flags on the stand fronts: [stand, a, kind] kind 0 = St George (paper, red cross), 1 = Italian tricolour (green | paper | red) */
const FLAGS:[number,number,number][]=[[0,.5,0],[0,.62,1],[0,.72,0],[0,.84,1],[1,.24,1],[1,.42,0],[1,.66,1],[1,.8,0],[2,.14,0],[2,.3,1],[3,.3,1],[3,.46,1],[3,.6,0],[3,.74,1]];
/** yellow ink, but stepped a little under full coverage (a riso green when a blue screen overprints it) */
const green=(s:Sheet,p:Path2D)=>{s.fill(Y,p,.92);s.tone(B,p,.72);};
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t),Bnd=Math.max(s.W,s.H)*2;
 // a summer night: a deep blue screen, navy over it, darker high up
 s.field(B,.55,.6);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]))?.[1]??0;
 s.tone(K,polyPath([[-Bnd,-Bnd],[Bnd,-Bnd],[Bnd,Bnd],[-Bnd,Bnd]],true),.42);
 s.tone(K,polyPath([[-Bnd,-Bnd],[Bnd,-Bnd],[Bnd,hz-560],[-Bnd,hz-460]],true),.3);
 const planes=new Path2D(),bands=new Path2D(),walk=new Path2D(),roof=new Path2D(),edge=new Path2D();
 for(const i of which){const S=STANDS[i],q=polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]);addPoly(planes,q);
  // blue and yellow seats: the yellow blocks of the lower tier
  for(let k=0;k<6;k++){const a0=k/6+.02,a1=k/6+.1;addPoly(bands,polyP(c,[S(a0,.06),S(a1,.06),S(a1,.4),S(a0,.4)]));}
  seg3(c,S(0,WALK),S(1,WALK),.45,walk);
  // the roof ring: a membrane cantilevered out over the stands, a paper fascia along its inner lip
  addPoly(roof,polyP(c,[add3(S(0,1),[0,2,0]),add3(S(1,1),[0,2,0]),add3(S(1,.3),[0,24.5,0]),add3(S(0,.3),[0,24.5,0])]));
  seg3(c,add3(S(0,.3),[0,24.3,0]),add3(S(1,.3),[0,24.3,0]),.45,edge);}
 s.knockout(planes);s.tone(K,planes,.5);s.tone(B,planes,.32);s.tone(Y,bands,.5);s.knockout(walk,.45);
 // the crowd: seeded dots (England white and red, Italy blue, Kyiv's yellow), sized by distance; roar lifts them
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(Math.abs(b-WALK)<.045)continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,5);if(h<.3)continue;const a=(i+.5+(hash(i+j*31,9)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const ink=h<.55?0:h<.7?1:h<.93?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.72);s.fill(R,inks[1],.95);s.fill(B,inks[2],.95);s.fill(Y,inks[3],.95);
 s.knockout(roof);s.tone(K,roof,.62);s.tone(B,roof,.3);s.knockout(edge,.85);
 // flags on the stand fronts
 const fl=new Path2D(),cr=new Path2D(),gr=new Path2D();
 for(const[si,a,kind] of FLAGS){if(!which.includes(si))continue;const S=STANDS[si],w=.03,P=(u:number,b:number)=>S(a+u*w,b);
  const q=polyP(c,[P(0,.005),P(1,.005),P(1,.08),P(0,.08)]);if(q.length<3)continue;fl.addPath(polyPath(q,true));
  if(kind===0){addPoly(cr,polyP(c,[P(.43,.005),P(.57,.005),P(.57,.08),P(.43,.08)]));addPoly(cr,polyP(c,[P(0,.036),P(1,.036),P(1,.049),P(0,.049)]));}
  else{addPoly(gr,polyP(c,[P(0,.005),P(.333,.005),P(.333,.08),P(0,.08)]));addPoly(cr,polyP(c,[P(.667,.005),P(1,.005),P(1,.08),P(.667,.08)]));}}
 s.knockout(fl);s.fill(R,cr,.95);green(s,gr);
 // floodlights: lamp strips along the roof lip, a soft yellow wash under them
 const lamp=new Path2D();for(const i of which){const S=STANDS[i];for(let k=0;k<7;k++){const u=(k+.5)/7,a=add3(S(u-.03,.3),[0,23.6,0]),b=add3(S(u+.03,.3),[0,23.6,0]);if(toCam(c,a)[2]<NEAR+2)continue;seg3(c,a,b,1.1,lamp);}}
 s.knockout(lamp);s.fill(Y,lamp,.8);
 if(flash>0){const p=new Path2D(),n=Math.round(22*flash);for(let i=0;i<n;i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,STANDS[si](r2,.1+.8*hash(i,Math.floor(tt*12))));if(!q)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
// ---------------------------------------------------------------- the running track, grass, lines, boards, the goal
function ground(s:Sheet,c:Cam,o:{bulge?:number;goal?:boolean}={}){
 // the running track round the pitch (a terracotta screen), then the grass inside it
 const tr=polyP(c,[[-119,0,-46],[14,0,-46],[14,0,46],[-119,0,46]]);if(tr.length<3)return;const tp=polyPath(tr,true);
 s.knockout(tp);s.tone(R,tp,.55);s.tone(K,tp,.2);
 const g=polyP(c,[[-110,0,-39],[5,0,-39],[5,0,39],[-110,0,39]]),gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.9);s.tone(B,gp,.8);s.tone(K,gp,.12);
 // mowing stripes across the width, every 5.25 m
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]));s.tone(K,st,.14);
 // LED advertising boards behind the goal and along both touchlines: navy with yellow panels
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([5.5,0,-36],[5.5,0,36]);board([-108,0,-38],[5.5,0,-38]);board([-108,0,38],[5.5,0,38]);
 for(let k=0;k<11;k++){const z=-34+k*6.3;addPoly(pn,polyP(c,[[5.4,.25,z],[5.4,.25,z+3.4],[5.4,.7,z+3.4],[5.4,.7,z]]));}
 for(const zz of[-37.9,37.9])for(let k=0;k<17;k++){const x=-106+k*6.4;addPoly(pn,polyP(c,[[x,.25,zz],[x+3.4,.25,zz],[x+3.4,.7,zz],[x,.7,zz]]));}
 s.knockout(bd);s.fill(K,bd,.9);s.knockout(pn,.85);s.fill(Y,pn,.9);
 // painted lines
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
 for(let k=0;k<8;k++){L([-k*13.125,0,-34],[-(k+1)*13.125,0,-34]);L([-k*13.125,0,34],[-(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){L([0,0,-34+k*17],[0,0,-34+(k+1)*17]);L([-52.5,0,-34+k*17],[-52.5,0,-34+(k+1)*17]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(-52.5,0,9.15);
 L([0,0,-20.16],[-16.5,0,-20.16]);L([-16.5,0,-20.16],[-16.5,0,20.16]);L([-16.5,0,20.16],[0,0,20.16]);
 L([0,0,-9.16],[-5.5,0,-9.16]);L([-5.5,0,-9.16],[-5.5,0,9.16]);L([-5.5,0,9.16],[0,0,9.16]);
 {const a=Math.acos(5.5/9.15);circ(-11,0,9.15,Math.PI-a,Math.PI+a,12);}
 // the penalty spot: a round white disc
 {const d:V3[]=[];for(let i=0;i<12;i++){const a=i/12*TAU;d.push([-11+Math.cos(a)*.15,0,Math.sin(a)*.15]);}addPoly(ln,polyP(c,d));}
 s.knockout(ln);
 if(o.goal!==false)goal3(s,c,o.bulge??0);
}
/** the goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep with a sloping roof; bulge pushes the back out round the middle (z .2) */
function goal3(s:Sheet,c:Cam,bulge:number){
 const X=0,z0=-3.66,z1=3.66,H=2.44,bz=.2,back=(z:number)=>X+2+bulge*.55*Math.exp(-Math.pow((z-bz)/1.6,2));
 const zs=[z0,-2.4,-1.2,0,1.2,2.4,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0),1.9,z0],[back(z0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1),1.9,z1],[back(z1),0,z1]],
  [[X,H,z0],[X,H,z1],...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)],
  [...zs.map(z=>[back(z),0,z] as V3),...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.32);s.tone(K,net,.1);
 const mesh=new Path2D();
 for(let i=0;i<=14;i++){const z=lerp(z0,z1,i/14);seg3(c,[X,H,z],[back(z),1.9,z],.022,mesh,.7);seg3(c,[back(z),1.9,z],[back(z),0,z],.022,mesh,.7);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<zs.length-1;i++)seg3(c,[back(zs[i]),y,zs[i]],[back(zs[i+1]),y,zs[i+1]],.022,mesh,.7);seg3(c,[X,y*H/1.9,z0],[back(z0),y,z0],.022,mesh,.7);seg3(c,[X,y*H/1.9,z1],[back(z1),y,z1],.022,mesh,.7);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+2*u,H-.54*u,z0],[X+2*u,H-.54*u,z1],.022,mesh,.7);}
 s.fill(K,mesh,.7);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.2,fo);seg3(c,[X,0,z1],[X,H,z1],.2,fo);seg3(c,[X,H,z0-.04],[X,H,z1+.04],.2,fo);
 s.fill(K,fo,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- the kick on one clock τ (seconds; τ = 0 is the contact)
/** the ball on the spot, 11 m out */
const B0:V3=[-11,.11,0];
const DXG=-B0[0];
/** the chip: a soft loop down the middle — peak ≈ 1.8 m at 7.5 m, crossing the line ≈ 1.45 m high, drifting a touch right (+z) */
const [HA,HB]=(()=>{const dp=7.5,yl=1.45-.11;const b=yl/(2*dp*DXG-DXG*DXG);return[2*dp*b,b];})();
const ZL=.18;
const flight=(d:number):V3=>[B0[0]+d,.11+HA*d-HB*d*d,B0[2]+ZL*d/DXG];
const FLY=1.0;// 11 m in ≈ 1 s (≈ 40 km/h off the boot, easing a little): a Panenka is slow
const dAt=(tau:number)=>{const u=clamp(tau/FLY);return DXG*u*(1.25-.25*u);};
const GOAL_PT=flight(DXG),NET_HIT:V3=[1.72,1.15,.24],REST:V3=[1.35,.11,.28],IN_NET=FLY+.2;
function ballAt(tau:number):V3{
 if(tau<=0)return B0;
 if(tau<FLY)return flight(dAt(tau));
 if(tau<IN_NET)return mix3(GOAL_PT,NET_HIT,easeOut((tau-FLY)/(IN_NET-FLY)));
 const u=clamp((tau-IN_NET)/.5),h=NET_HIT[1]*(1-u*u)+.11*u*u,b=u>=1?.1*Math.abs(Math.sin((tau-IN_NET-.5)*9))*Math.exp(-(tau-IN_NET-.5)*3.5):0;
 return[lerp(NET_HIT[0],REST[0],u),Math.max(.11,h)+b,lerp(NET_HIT[2],REST[2],u)];
}
/** ball spin (panel rotation): a gentle backspin off the scoop */
const spinAt=(tau:number)=>tau<=0?0:-TAU*3*Math.min(tau,IN_NET)-TAU*1.2*Math.max(0,tau-IN_NET);
const bulgeAt=(tau:number)=>tau<IN_NET-.03?0:.8*Math.exp(-(tau-IN_NET+.03)*2.6)*(1+.3*Math.sin((tau-IN_NET)*12));

// ---------------------------------------------------------------- the cast: kits (athlete.ts styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.28],[B,.08]];
const italy=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[B,.95],shorts:[B,.95],socks:[B,.95],boots:K,skin:SKIN_M,hair:K,line:K,trim:'paper',numberInk:'paper',hairStyle:'short',...o});
const england=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:'paper',boots:K,skin:SKIN_L,hair:K,line:K,trim:R,numberInk:K,hairStyle:'short',...o});
const PIRLO_B={height:1.77,bulk:.95};
const PIRLO_ST=italy({number:21,hairStyle:'long',hair:[K,.95],build:PIRLO_B,seed:21});
const HART_ST:AthleteStyle={shirt:[Y,.95],shorts:[Y,.95],socks:[Y,.95],boots:K,skin:SKIN_L,hair:[R,.5],line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',number:1,numberInk:K,build:{height:1.96,bulk:1.04},seed:16};
const BUFFON_ST:AthleteStyle={shirt:[K,.5],shorts:[K,.5],socks:[K,.5],boots:K,skin:SKIN_M,hair:K,line:K,trim:Y,gloves:'paper',sleeves:'long',hairStyle:'short',number:1,numberInk:'paper',build:{height:1.92},seed:17};
const REF_ST:AthleteStyle={shirt:[K,.88],shorts:[K,.88],socks:[K,.88],boots:K,skin:SKIN_L,hair:K,line:K,trim:Y,hairStyle:'balding',build:{height:1.8},seed:30};

// ---------------------------------------------------------------- Pirlo: placing the ball, the walk back to his mark, the calm wait, the run, the chip
/** approach from the LEFT of the ball (≈ 20°), so the right foot comes through straight behind it */
const DIRN=Math.hypot(1,.36),DIR:[number,number]=[1/DIRN,.36/DIRN];
const YAW_P=yawTo(0,0,DIR[0],DIR[1]);
const SD=1.0,RUN_END=-STRIKE_CONTACT*SD,T_RUN0=-1.45,RUN_L=3.2,STRIKE_L=1.4,G_MARK=-(RUN_L+STRIKE_L),G_BALL=-.35;
const CHIP=.3;// strike power: a short backswing, a scoop, a short follow-through
/** where Pirlo's pelvis stands at contact so the toe of his RIGHT boot slides in under the back of the ball (solved once, FK) */
const PC:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{power:CHIP}),PIRLO_B,{x:0,z:0,yaw:YAW_P}),toe:[number,number]=[B0[0]-DIR[0]*.1,B0[2]-DIR[1]*.1];return[toe[0]-sk.rToe[0],toe[1]-sk.rToe[2]];})();
const gPos=(g:number):[number,number]=>[PC[0]+DIR[0]*g,PC[1]+DIR[1]*g];
/** crouched over the ball, setting it on the spot */
const P_PLACE=posed({lHipF:70,rHipF:40,lKnee:100,rKnee:60,lean:40,pitch:12,neckP:30,lShF:62,rShF:66,lElb:18,rElb:20,lShA:14,rShA:12,lHand:.8,rHand:.8});
/** at his mark: upright, arms loose, weight even, eyes on the keeper */
const P_WAIT=posed({lHipF:-4,rHipF:10,lKnee:10,rKnee:16,lAnk:0,rAnk:-4,lean:4,pitch:1,neckP:-2,lShA:12,rShA:12,lShF:2,rShF:0,lElb:16,rElb:18});
const P_GO=posed({lHipF:-18,rHipF:22,lKnee:24,rKnee:30,lAnk:16,rAnk:-6,lean:14,pitch:4,neckP:10,lShA:22,rShA:20,lShF:-12,rShF:14,lElb:40,rElb:46,twist:-8});
/** the walk: a very slow jog cycle with a short stride and low arms */
const walkPose=(ph:number)=>{const p=blendPose(runCycle(ph,{speed:0,stride:.55}),P_WAIT,.35);p.air=0;return p;};
/** after the kick he walks back toward the centre circle */
const T_TURN=1.55,T_WALKAWAY=2.05,AWAY:[number,number]=[-52,-8];
const runU=(tau:number)=>clamp((tau-T_RUN0)/(RUN_END-T_RUN0));
/** the run: g along the approach; he slows over the last strides (he "waited for him to move") */
function runG(tau:number){const u=runU(tau);return G_MARK+RUN_L*(1.25*u-.25*u*u);}
function pirloPose(tau:number,walk=1,it=0):Pose{
 if(tau<=T_RUN0){
  if(walk<1){const u=walk;if(u<.12)return blendPose(P_PLACE,stand(),sm(0,.12,u));
   const d=Math.abs(G_MARK-G_BALL)*sm(.12,.82,u,linear);let p=walkPose(d*.72);if(u>.82)p=blendPose(p,P_WAIT,sm(.82,1,u));return p;}
  const br=.5+.5*Math.sin(it*2.1),p=blendPose(P_WAIT,P_GO,sm(T_RUN0-.35,T_RUN0,tau));p.lean+=.02*br;p.neckP+=.03*br;return p;}
 if(tau<RUN_END){const u=runU(tau);return blendPose(P_GO,runCycle(2.2*Math.pow(u,.9),{speed:.45+.1*(1-u)}),sm(0,.2,u));}
 const us=STRIKE_CONTACT+tau/SD,run=runCycle(2.2+(tau-RUN_END)*1.4,{speed:.4});
 let p=blendPose(run,strike(Math.min(1,us),{power:CHIP}),sm(RUN_END,RUN_END+.14,tau));
 // the scoop: toe under the ball, the body a touch upright, a short, checked follow-through
 const lo=sm(RUN_END,-.02,tau)*(1-sm(.1,.4,tau));p.lean-=.08*lo;p.neckP+=.12*lo;p.rAnk-=.35*sm(-.2,0,tau)*(1-sm(.15,.4,tau));
 if(tau>0)p.rHipF*=1-.3*sm(0,.25,tau);
 // stand and watch it drop in, then turn and walk back — no celebration
 if(tau>.55)p=blendPose(p,P_WAIT,sm(.55,1.1,tau));
 if(tau>T_TURN){const d=Math.max(0,tau-T_WALKAWAY)*1.3;p=blendPose(p,walkPose(d*.72+(tau-T_TURN)*.9),sm(T_TURN,T_TURN+.4,tau)*.8+.2*sm(T_WALKAWAY,T_WALKAWAY+.3,tau));}
 return p;
}
function pirloPlace(tau:number,walk=1):Place{
 if(tau<=T_RUN0){
  if(walk<1){const u=walk,g=lerp(G_BALL,G_MARK,sm(.12,.82,u,linear)),[x,z]=gPos(g);
   return{x,z,yaw:u<.12?YAW_P:lerpAng(lerpAng(YAW_P,YAW_P+Math.PI,sm(.08,.2,u)),YAW_P+TAU,sm(.8,1,u))};}
  const[x,z]=gPos(G_MARK);return{x,z,yaw:YAW_P};}
 let g:number;
 if(tau<RUN_END)g=runG(tau);
 else if(tau<0){const v=(tau-RUN_END)/-RUN_END;g=-STRIKE_L+STRIKE_L*(.6*v+.4*(1-(1-v)*(1-v)));}
 else g=.45*(1-Math.pow(1-clamp(tau/.6),2));
 let[x,z]=gPos(g);
 if(tau>T_WALKAWAY){const d=(tau-T_WALKAWAY)*1.3,L=Math.hypot(AWAY[0]-x,AWAY[1]-z);x+=(AWAY[0]-x)*d/L;z+=(AWAY[1]-z)*d/L;}
 const[x0,z0]=gPos(.45);
 return{x,z,yaw:lerpAng(YAW_P,yawTo(x0,z0,AWAY[0],AWAY[1]),sm(T_TURN,T_TURN+.6,tau,easeInOutSine))};
}

// ---------------------------------------------------------------- Hart: jumping about on his line, set, the dive to his right
const T_DIVE=-.22,DIVE_S=1.15;
const HART_X=-.1;
/** arms up and waving, bouncing on his toes (it loops) */
function hartWave(it:number):Pose{const a=Math.sin(it*3.1),b=Math.sin(it*3.1+2.2),hop=Math.max(0,Math.sin(it*5.2));
 return posed({lShA:112+38*a,rShA:112+38*b,lShF:14+10*b,rShF:14+10*a,lElb:22+18*Math.max(0,a),rElb:22+18*Math.max(0,b),lHand:1,rHand:1,
  lHipF:24+16*hop,rHipF:24+16*hop,lKnee:38+26*(1-hop),rKnee:38+26*(1-hop),lAnk:10+20*hop,rAnk:10+20*hop,lHipA:12,rHipA:12,lean:8,neckP:-10,air:.16*hop,bend:6*Math.sin(it*1.7)});}
function hartAt(tau:number,it:number,wave:number):{pose:Pose;place:Place}{
 const sh=.45*Math.sin(it*1.5)*wave;
 let p=blendPose(keeperSet(it*1.3),hartWave(it),wave);
 if(tau>T_DIVE-.5)p=blendPose(p,keeperSet(.75),sm(T_DIVE-.5,T_DIVE,tau));
 if(tau>T_DIVE)p=blendPose(p,keeperDive(clamp((tau-T_DIVE)/DIVE_S),{side:'r',height:.4}),sm(T_DIVE,T_DIVE+.06,tau));
 // on the ground he lifts his head to look back at the ball in the net
 if(tau>1.1)p.neckP-=.5*sm(1.1,1.6,tau);
 return{pose:p,place:{x:HART_X,z:sh,yaw:Math.PI}};
}

// ---------------------------------------------------------------- everyone else
type Role='buffon'|'ref'|'ar'|'ita'|'eng';
type Actor={name:string;role:Role;st:AthleteStyle;x:number;z:number;phase:number};
/** the players arm in arm in the centre circle (Italy nearer the far side, England nearer the camera) */
const LINE:Actor[]=[];
{const ita=[[9,'curly'],[18,'short'],[23,'short'],[22,'short']] as [number,string][],eng=[[4,'short'],[10,'balding'],[11,'short'],[3,'short']] as [number,string][];
 ita.forEach(([n,h],i)=>LINE.push({name:'Italy '+n,role:'ita',st:italy({number:n,hairStyle:h as AthleteStyle['hairStyle'],build:{height:1.8+.02*(i%2)},seed:40+i,detail:'low'}),x:-52.5+.2*(i%2),z:-4.6+i*.62,phase:i*.23}));
 eng.forEach(([n,h],i)=>LINE.push({name:'England '+n,role:'eng',st:england({number:n,hairStyle:h as AthleteStyle['hairStyle'],build:{height:1.8+.03*(i%2)},seed:50+i,detail:'low'}),x:-52.5-.2*(i%2),z:1.8+i*.62,phase:i*.31}));}
const ACTORS:Actor[]=[
 {name:'Buffon',role:'buffon',st:BUFFON_ST,x:.4,z:-20.6,phase:.2},
 {name:'Proença',role:'ref',st:REF_ST,x:-7.5,z:-9.6,phase:.6},
 {name:'assistant',role:'ar',st:{...REF_ST,hairStyle:'short',seed:31},x:.6,z:9.4,phase:.1},
 ...LINE,
];
const LINKED=posed({lShA:26,rShA:26,lShF:-6,rShF:-6,lElb:12,rElb:12,lHipF:6,rHipF:6,lKnee:10,rKnee:10,lean:6,neckP:4});
const SLUMP=posed({lHipF:30,rHipF:30,lKnee:36,rKnee:36,lean:34,pitch:6,neckP:30,lShA:14,rShA:14,lShF:24,rShF:24,lElb:20,rElb:20});
/** one actor's pose + place at τ (it = idle clock) */
function actorAt(a:Actor,tau:number,it:number):{pose:Pose;place:Place}{
 const toBall=yawTo(a.x,a.z,B0[0],B0[2]),br=Math.sin(it*2.1+a.phase*TAU),goal=sm(IN_NET-.1,IN_NET+.3,tau);
 switch(a.role){
  case 'buffon':{let p=blendPose(stand(),LINKED,.3+.1*br);if(goal>0)p=blendPose(p,celebrate(.3,{kind:'arms'}),.55*goal);return{pose:p,place:{x:a.x,z:a.z,yaw:yawTo(a.x,a.z,0,0)}};}
  case 'ref':{const p=blendPose(stand(),LINKED,.2+.1*br);return{pose:p,place:{x:a.x,z:a.z,yaw:yawTo(a.x,a.z,0,.5)}};}
  case 'ar':{const p=blendPose(stand(),LINKED,.2);return{pose:p,place:{x:a.x,z:a.z,yaw:yawTo(a.x,a.z,0,0)}};}
  case 'ita':{let p=blendPose(LINKED,stand(),.2+.1*br);if(goal>0)p=blendPose(p,celebrate(it*.9+a.phase,{kind:'arms'}),goal);return{pose:p,place:{x:a.x,z:a.z,yaw:toBall}};}
  default:{let p=blendPose(LINKED,stand(),.2+.1*br);if(goal>0)p=blendPose(p,SLUMP,goal*.8);return{pose:p,place:{x:a.x,z:a.z,yaw:toBall}};}
 }
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
/** the flown path from τa to τb as projected points */
function pathPts(c:Cam,ta:number,tb:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<=n;i++){const p=pr(c,ballAt(lerp(ta,tb,i/n)));if(p)out.push(p);}return out;}

// ---------------------------------------------------------------- one frame of the world through a camera
type Env={it:number;walk?:number;wave?:number;smear?:boolean;minBall?:number;lines?:boolean;prevT?:number;hero?:'high'|'mid';line?:boolean};
/** everything on the pitch, depth-sorted (far first): the players at τp (poses on twos), their previous drawn pose, the ball at τ.
 * Heat: small figures print at `low` detail; inside a passage every figure is capped (the outgoing scene is zoomed past the camera). */
function play(s:Sheet,c:Cam,tau:number,tp:number,tpPrev:number,e:Env){
 const v=view(s),items:{d:number;draw:()=>void}[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending;
 const visible=(pl:Place,h=1.8)=>{const q=toCam(c,[pl.x??0,.9,pl.z??0]);if(q[2]<1)return -1;const g=scr(c,q),k=c.F/q[2]*h;return Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k?-1:q[2];};
 const detailFor=(st:AthleteStyle,d:number,hero:boolean):AthleteStyle=>{const px=c.F*1.8/d*ppu;if(passing)return{...st,detail:hero?'mid':'low'};if(!hero&&px<120)return{...st,detail:'low'};if(hero&&e.hero==='mid'&&px>170)return{...st,detail:'mid'};return st;};
 const walk=e.walk??1,wave=e.wave??0;
 {const pl=pirloPlace(tp,walk),d=visible(pl);if(d>0)items.push({d,draw:()=>{const pose=pirloPose(tp,walk,e.it),prev={pose:pirloPose(tpPrev,walk,e.it-1/12),place:pirloPlace(tpPrev,walk)};
  drawPlayer(s,pose,c,detailFor(PIRLO_ST,d,true),pl,prev,!!e.smear&&tp>T_RUN0+.2&&tp<.4);}});}
 {const cur=hartAt(tp,e.it,wave),d=visible(cur.place);if(d>0)items.push({d,draw:()=>{const prev=hartAt(tpPrev,e.it-1/12,wave);drawPlayer(s,cur.pose,c,detailFor(HART_ST,d,true),cur.place,prev,!!e.smear&&tp>T_DIVE&&tp<.7);}});}
 for(const a of ACTORS){if(!e.line&&(a.role==='ita'||a.role==='eng'))continue;const cur=actorAt(a,tp,e.it),d=visible(cur.place);if(d<0)continue;
  items.push({d,draw:()=>{const prev=actorAt(a,tpPrev,e.it-1/12);drawPlayer(s,cur.pose,c,detailFor(a.st,d,false),cur.place,prev);}});}
 const bq=toCam(c,ballAt(tau));if(bq[2]>=NEAR)items.push({d:bq[2],draw:()=>{drawBall(s,c,tau,{min:e.minBall,lines:e.lines,prev:e.prevT});}});
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
/** steps: [start, duration, shot]; each step eases in over the previous result */
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
const pxz=(tau:number,walk=1):V3=>{const p=pirloPlace(tau,walk);return[p.x??0,0,p.z??0];};

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time
/** contact lands so the ball drops into the net just after "Goal" — but never before he has had time to settle after "stays calm" */
const tS1=()=>Math.max(CUE(0,'Goal')-IN_NET+.15,CUE(0,'stays calm')+.5-T_RUN0);
const tau1=(t:number)=>Math.max(T_RUN0-4,t-tS1());
/** the walk back to his mark: from just after "Andrea Pirlo" until well before the run */
const walk1=(t:number)=>{const a=CUE(0,'Andrea Pirlo')+.25,b=Math.max(a+.8,Math.min(a+3.2,tS1()+T_RUN0-1.2));return sm(a,b,t,linear);};
const P1:V3=[-40,19,57];
function cam1(t:number):Cam{
 const tau=tau1(t),tRun=tS1()+T_RUN0,w=walk1(t);
 return plan(t,[
  [0,0,()=>({P:P1,T:[-34,2,-2],fov:44})],
  [CUE(0,'go to penalties')-.2,1.1,()=>({P:P1,T:[-52.5,1,-1.2],fov:10})],
  [CUE(0,'England lead')-.15,.8,()=>({P:P1,T:[-52.5,1,3],fov:6.5})],
  [CUE(0,'Andrea Pirlo')-.3,1,()=>({P:P1,T:add3(pxz(T_RUN0-.5,w),[0,1,0]),fov:5.5})],
  [CUE(0,'The keeper')-.25,.8,()=>({P:P1,T:[HART_X,1.3,0],fov:4.2})],
  [CUE(0,'stays calm')-.25,.8,()=>({P:P1,T:add3(pxz(T_RUN0),[.2,1,0]),fov:3.9})],
  [Math.max(tRun-.15,CUE(0,'stays calm')+.35),.8,()=>({P:P1,T:[-5.6,1.1,0],fov:15})],
  [tS1()+IN_NET-.2,.9,()=>({P:P1,T:[.3,1.1,.1],fov:9})],
  [tS1()+IN_NET+1.1,1.6,()=>({P:P1,T:mix3([.3,1.1,0],add3(pxz(tau),[0,1,0]),.5),fov:17})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tau=tau1(t),tt=twos(t),tp=tau1(tt),tpp=tau1(tt-1/12),tN=tS1()+IN_NET;
  const walk=walk1(tt),wave=1-sm(tS1()+T_RUN0-.6,tS1()+T_RUN0,t);
  stadium(s,c,t,[0,1,3],{roar:sm(tN-.1,tN+.4,t),flash:sm(tN,tN+.25,t)*(1-sm(tN+2.5,tN+3.5,t))});
  ground(s,c,{bulge:bulgeAt(tau)});
  play(s,c,tau,tp,tpp,{it:tt,walk,wave,minBall:14,lines:true,prevT:tau1(t-.06),hero:'mid',line:true});
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:13,
};

// ---------------------------------------------------------------- 2 · the slow-motion replay from low behind Pirlo: he waits, Hart goes, the ball floats in
const tau2=(t:number)=>key(t,mono([[0,T_RUN0+.05],[CUE(1,'Pirlo waits'),RUN_END-.12],[CUE(1,'keeper to move'),T_DIVE-.02],[CUE(1,'The keeper dives'),.06],[CUE(1,'the ball floats'),.42],[CUE(1,'into the middle'),FLY-.08],[SECS(1),IN_NET+.9]]),linear);
const E2:V3=[B0[0]-8.8,1.75,B0[2]-2.3];
function cam2(t:number):Cam{
 const tau=tau2(t),b=ballAt(Math.min(tau,FLY));
 return plan(t,[
  [0,0,()=>{const u=sm(T_RUN0,0,tau,easeInOutSine);return{P:mix3(E2,add3(E2,[2.2,-.2,.7]),u),T:mix3(add3(pxz(tau),[3,1,0]),[-3,1.1,0],u),fov:lerp(26,22,u)};}],
  [CUE(1,'keeper to move')-.3,.9,()=>({P:add3(E2,[2.2,-.2,.7]),T:[-2.5,1.1,-.4],fov:17})],
  [CUE(1,'the ball floats')-.2,.9,()=>({P:add3(E2,[2.4,-.1,.8]),T:mix3(b,[0,1.3,0],.4),fov:14})],
  [CUE(1,'into the middle')-.1,1.2,()=>({P:add3(E2,[2.6,0,.9]),T:[.3,1.2,.1],fov:11})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tau=tau2(t),tt=twos(t),tp=tau2(tt),tpp=tau2(tt-1/12);
  stadium(s,c,t,[0,1,2],{roar:sm(IN_NET,IN_NET+.4,tau),flash:sm(IN_NET+.1,IN_NET+.3,tau)});
  ground(s,c,{bulge:bulgeAt(tau)});
  // the replay trail: the soft loop so far, fading at the tail (under the players)
  if(tau>.02&&tau<IN_NET+.7){const pts=pathPts(c,Math.max(0,tau-.8),Math.min(tau,FLY+.001),20),fade=1-sm(FLY+.1,IN_NET+.7,tau);if(pts.length>2){const w=Math.max(8,kAt(c,ballAt(Math.min(tau,FLY)))*.16);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*fade);}}
  play(s,c,tau,tp,tpp,{it:tt,wave:0,smear:true,minBall:12});
 },
 aperture(t){const c=cam2(t),P=ballAt(tau2(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:5.6,
};

// ---------------------------------------------------------------- 3 · the reverse angle from behind the net: the ball drops in, Hart on the ground, then the fans' flags
const tau3=(t:number)=>key(t,mono([[0,.02],[CUE(2,'already'),FLY+.05],[CUE(2,'Italy go on'),IN_NET+1.3],[SECS(2),IN_NET+1.3+(SECS(2)-CUE(2,'Italy go on'))]]),linear);
const E3:V3=[5.2,1.4,1.9];
/** the far-end fans behind Pirlo: big flags held up and waving (tricolours and St George crosses) */
function bigFlags(s:Sheet,c:Cam,t:number,rise:number){
 if(rise<=.02)return;const tt=twos(t),fl=new Path2D(),cr=new Path2D(),gr=new Path2D();
 for(const[i,a0,b0,kind] of [[0,.3,.1,1],[1,.4,.22,1],[2,.5,.12,1],[3,.58,.26,0],[4,.66,.14,1],[5,.46,.32,1],[6,.36,.34,1]] as [number,number,number,number][]){
  const base=STANDS[3](a0,b0),sw=Math.sin(tt*5+i*1.7)*.6,W=4.2,H=2.7,top=1+2.2*rise;
  const P=(u:number,vv:number):V3=>[base[0]+.3*u,base[1]+top+H*(1-vv)+.35*Math.sin(u*3+tt*6+i),base[2]+W*(u-.5)+sw*vv*.6];
  const q=polyP(c,[P(0,0),P(.5,0),P(1,0),P(1,1),P(.5,1),P(0,1)]);if(q.length<3)continue;fl.addPath(polyPath(q,true));
  if(kind===1){addPoly(gr,polyP(c,[P(0,0),P(.333,0),P(.333,1),P(0,1)]));addPoly(cr,polyP(c,[P(.667,0),P(1,0),P(1,1),P(.667,1)]));}
  else{addPoly(cr,polyP(c,[P(.43,0),P(.57,0),P(.57,1),P(.43,1)]));addPoly(cr,polyP(c,[P(0,.42),P(1,.42),P(1,.58),P(0,.58)]));}}
 s.knockout(fl);s.fill(R,cr,.95);green(s,gr);s.stroke(K,fl,2,.8);
}
function cam3v(t:number):Cam{
 const tI=CUE(2,'Italy go on');
 return plan(t,[
  [0,0,()=>({P:E3,T:[-8,1.2,-.4],fov:30})],
  [CUE(2,'already')-.25,1,()=>({P:add3(E3,[-.3,.2,.3]),T:[-1.2,.5,-1.4],fov:34})],
  [tI-.2,1.3,()=>({P:add3(E3,[-.3,2.3,.3]),T:[-121,7.5,1],fov:8.5})],
  [CUE(2,'win the shootout')+.3,1.4,()=>({P:add3(E3,[-.3,2.3,.3]),T:[-121,8.5,1.5],fov:7})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tau=tau3(t),tt=twos(t),tp=tau3(tt),tpp=tau3(tt-1/12),tI=CUE(2,'Italy go on'),tW=CUE(2,'win the shootout');
  const rise=sm(tI-.1,tI+.8,t);
  stadium(s,c,t,[0,2,3],{roar:.35+.65*sm(IN_NET,IN_NET+.4,tau),flash:.3*sm(IN_NET,IN_NET+.3,tau)+.7*sm(tW-.1,tW+.3,t)});
  bigFlags(s,c,t,rise);
  ground(s,c,{goal:false});
  play(s,c,tau,tp,tpp,{it:tt,wave:0,smear:true,minBall:10,line:true});
  // from behind, the net is between the camera and the play
  goal3(s,c,bulgeAt(tau));
  const wc=sm(tW-.05,tW+.4,t);if(wc>0){const q=pr(c,[-121,11,1]);if(q)sparkBurst(s,Y,q[0],q[1],110+150*wc,{n:11,seed:9,g:easeOutBack(wc),width:14});}
 },
 aperture(t){const c=cam3v(t),q=pr(c,[-121,9,1])??[0,0];return apertureDisc(q[0],q[1],80,12);},
 still:3.2,
};

// ---------------------------------------------------------------- 4 · the lesson: pressure → calm → watch the keeper → the calm decision
const tau4=(t:number)=>key(t,mono([[0,T_RUN0-.6],[CUE(3,'watch the keeper'),T_RUN0-.05],[CUE(3,'A calm mind'),T_DIVE+.05],[CUE(3,'good decisions'),.35],[SECS(3),IN_NET+.6]]),linear);
function cam4v(t:number):Cam{
 const tau=tau4(t),pm=pxz(T_RUN0);
 return plan(t,[
  [0,0,()=>({P:add3(pm,[3.4,1.5,4.2]),T:add3(pm,[0,.85,0]),fov:36})],
  [CUE(3,'stay calm')-.2,1,()=>({P:add3(pm,[3,1.7,3.6]),T:add3(pm,[0,.9,0]),fov:33})],
  [CUE(3,'watch the keeper')-.25,1.2,()=>({P:add3(pm,[-4.4,2.4,-2.2]),T:[-2.5,1.1,-.2],fov:30})],
  [CUE(3,'A calm mind')-.15,1.3,()=>({P:[-15,2.3,7.2],T:mix3([-4.5,1.1,-.3],ballAt(Math.min(tau,FLY)),.2),fov:38})],
 ]);
}
/** a projected arrow (shaft + head) along 3D points, in one ink */
function arrow3(s:Sheet,c:Cam,pts:V3[],w:number,ink:string,cov=1){
 const q=pts.map(p=>pr(c,p)).filter((p):p is Pt=>!!p);if(q.length<2)return;
 const e=q[q.length-1],f=q[q.length-2],ang=Math.atan2(e[1]-f[1],e[0]-f[0]),ca=Math.cos(ang),sa=Math.sin(ang),hd=w*2.6;
 const shaft=q.slice(0,-1).concat([[e[0]-ca*hd*.7,e[1]-sa*hd*.7]]);
 const p=ribbon(shaft,w,{taper:.2,pressure:.2,wobble:.8});p.addPath(polyPath([[e[0]+ca*hd*.3,e[1]+sa*hd*.3],[e[0]-ca*hd-sa*hd*.62,e[1]-sa*hd+ca*hd*.62],[e[0]-ca*hd+sa*hd*.62,e[1]-sa*hd-ca*hd*.62]],true));
 s.knockout(p);s.fill(ink,p,cov);s.stroke(K,p,Math.max(2,w*.12),.85);
}
/** a ring on the ground round a point: jagged (pressure) → smooth (calm) */
function groundRing(s:Sheet,c:Cam,at:V3,r:number,jag:number,w:number,ink:string,cov:number,t:number){
 const pts:Pt[]=[];for(let i=0;i<48;i++){const a=i/48*TAU,k=1+jag*(.22*Math.sin(a*9+t*7)+.12*Math.sin(a*14-t*11)),p=pr(c,[at[0]+Math.cos(a)*r*k,.02,at[2]+Math.sin(a)*r*k]);if(p)pts.push(p);}
 if(pts.length<30)return;const rr=ribbon(pts,w,{close:true,seed:43,taper:0,wobble:jag*2+.6});s.knockout(rr,.9*cov);s.fill(ink,rr,.95*cov);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tau=tau4(t),tt=twos(t),tp=tau4(tt),tpp=tau4(tt-1/12);
  const tU=CUE(3,'Under pressure'),tC=CUE(3,'stay calm'),tW=CUE(3,'watch the keeper'),tM=CUE(3,'A calm mind'),tG=CUE(3,'good decisions');
  const pressure=sm(tU-.2,tU+.4,t)*(1-sm(tC-.1,tC+.6,t)),calm=sm(tC-.1,tC+.6,t)*(1-sm(tW+.6,tW+1.2,t));
  stadium(s,c,t,[0,1,3],{roar:.6*pressure,flash:.8*pressure});
  ground(s,c,{bulge:bulgeAt(tau)});
  const pm=pxz(T_RUN0);
  // 1 · pressure: a jagged red ring round him (the crowd, the score, the moment) → 2 · calm: it smooths into a steady yellow ring
  if(pressure>.02)groundRing(s,c,pm,1.1+.12*Math.sin(t*9),1,Math.max(7,kAt(c,pm)*.07),R,pressure,tt);
  if(calm>.02)groundRing(s,c,pm,1.05,0,Math.max(7,kAt(c,pm)*.06),Y,calm,tt);
  // 4 · the decision: the soft path into the middle, drawn as he chips it (under the players)
  const dv=sm(tM-.2,tM+.4,t);
  if(dv>.02){const pts=partial(pathPts(c,0,FLY,32),Math.max(.04,clamp(tau/FLY))),w=Math.max(10,kAt(c,[-5,1.5,0])*.13);if(pts.length>2){s.knockout(ribbon(pts,w*1.6,{taper:.4,pressure:.2,wobble:0}),.5*dv);s.fill(Y,ribbon(pts,w,{taper:.4,pressure:.2,wobble:0}),.95*dv);}
   // the empty middle where the keeper stood: a yellow target ring on the goal mouth
   const ring:Pt[]=[];for(let i=0;i<32;i++){const a=i/32*TAU,p=pr(c,[.02,1.45+Math.sin(a)*.55,.18+Math.cos(a)*.55]);if(p)ring.push(p);}
   if(ring.length>20){const rr=ribbon(ring,Math.max(6,kAt(c,[0,1.4,0])*.07),{close:true,seed:11,taper:0,wobble:1});s.knockout(rr,.85*dv);s.fill(Y,rr,.95*dv);}}
  play(s,c,tau,tp,tpp,{it:tt,wave:.45*(1-sm(tW,tM,t)),smear:true,minBall:13});
  // 3 · watch the keeper: a dashed yellow sight line from Pirlo's eyes to Hart, held until the keeper commits
  const sl=sm(tW-.15,tW+.5,t,easeOutBack)*(1-sm(tM+.2,tM+.7,t));
  if(sl>.02){const sk=solve(pirloPose(tp,1,tt),PIRLO_B,pirloPlace(tp)),hs=hartAt(tp,tt,0),hk=solve(hs.pose,HART_ST.build,hs.place),a=pr(c,sk.face),b=pr(c,hk.head);
   if(a&&b){const rb=new Path2D(),n=9,w=Math.max(9,kAt(c,pm)*.045),u1=clamp(sl);for(let i=0;i<n;i++){const u0=i/n*u1,ue=(i+.62)/n*u1,p0:Pt=[lerp(a[0],b[0],u0),lerp(a[1],b[1],u0)],p1:Pt=[lerp(a[0],b[0],ue),lerp(a[1],b[1],ue)];rb.addPath(ribbon([p0,p1],w,{seed:13+i,taper:.2,wobble:0}));}
    s.knockout(rb,.95);s.fill(Y,rb,.95);s.stroke(K,rb,1.8,.8);}}
  // the keeper commits: a red arrow along his dive, to one side
  const dv2=sm(T_DIVE,T_DIVE+.3,tau,easeOutBack)*(1-sm(tG+.4,tG+1,t));
  if(dv2>.02){const a:V3=[HART_X-.3,.9,0],b:V3=[HART_X-.3,.5,-2.4*dv2];arrow3(s,c,[a,mix3(a,b,.5),b],Math.max(8,kAt(c,a)*.06),R,.95);}
  // 5 · good decisions: it drops in — a yellow burst in the net
  const gd=sm(tG-.05,tG+.4,t);if(gd>0&&tau>FLY){const q=pr(c,[.6,1.3,.2]);if(q)sparkBurst(s,Y,q[0],q[1],Math.max(60,kAt(c,[0,1.3,0])*1.1)*easeOutBack(gd),{n:10,seed:61,width:Math.max(6,kAt(c,[0,1.3,0])*.05)});}
 },
 still:8.5,
};

const film:RisoStory={
 id:'pirlo-panenka-2012',format:'11v11',title:"Pirlo's chipped penalty v England",
 theme:'Penalties: under pressure, stay calm and watch the keeper — a calm mind makes good decisions',
 ageNote:'England 0–0 Italy (Italy won 4–2 on penalties), Euro 2012 quarter-final, Olympic Stadium, Kyiv, 24 June 2012. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a little Panenka — a soft yellow loop up and down, with a gently turning ball on its tip. Reduced motion: the still loop. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.6)),fade=age<=0?1:1-clamp((age-.65)/.25),r=rng(seed);
  const pts:Pt[]=[];for(let i=0;i<=16;i++){const k=i/16*u;pts.push([x+40*k,y-220*k+180*k*k]);}
  if(pts.length>2)s.fill(Y,ribbon(pts,13,{seed,taper:.8,pressure:.3,wobble:1}),.95*fade);
  const e=pts[pts.length-1];if(age>0&&age<.3)sparkBurst(s,Y,x,y,70,{n:7,seed,g:1-clamp(age/.3),width:9});
  footballPanels(s,e[0],e[1],32,{rot:-age*6+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
