/** Raúl Jiménez — "the striker's header" (signature card). The real moment: Arsenal 1–1 Wolverhampton Wanderers, Premier League,
 * Saturday 2 November 2019, Emirates Stadium, London — Jiménez's 76th-minute headed equaliser. Then a clearly labelled "how he does it"
 * demonstration of the card's lesson (today's Jiménez, in his head guard, on a training pitch). An iconic-play riso film (RisoStory,
 * chapters mode) played by the card's picture window (components/CardFilmPlayer.tsx) or StoryFilmPlayer. The match chapters are a 1:1
 * reconstruction from WRITTEN accounts plus one match photo (the broadcast footage itself was not reviewed), rendered as a riso print.
 *
 * WHY THIS MOMENT: iconicPlays.json lists Jiménez as kind "signature" ("the striker's header"; lesson "Watch the ball onto your forehead and
 * aim down towards the goal"). Wikipedia's playing-style section singles out "his ability in the air"; the Arsenal equaliser is a headed goal
 * confirmed by a full match report (The Guardian's headline is literally "Raúl Jiménez header earns Wolves draw"), with the build-up (a throw-in,
 * João Moutinho's cross, two defenders beaten) written down. Candidates checked and rejected: the 2025 Gold Cup final equaliser v USA and the
 * 2025 Nations League final goals v Panama (the fetched sources give only minutes, not how they were scored — not staged); his later headers
 * are unconfirmed in what we could read. Because the confirmed header is from 2019 — before his 2020 injury — he wears NO head guard in the
 * match chapters (the Guardian photo shows him bare-headed, short dark hair); the head guard he has worn since 2021 appears only in the
 * labelled demonstration chapter, where the narration mentions it kindly and nothing else about the injury.
 *
 * SOURCES (read Sept 2026 with curl, cached under the build scratchpad films/src-cache/):
 *  - The Guardian, Nick Ames at the Emirates Stadium, "Arsenal drop points again after Raúl Jiménez header earns Wolves draw", 2 Nov 2019
 *    [guardian-ars-wol-2019-report.txt]: "It was not Xhaka who dozed off at a throw-in to let João Moutinho stand up the cross that Raúl Jiménez
 *    threw himself at to equalise in the 76th minute; that was Dani Ceballos. Nor was it Xhaka who failed to prevent the Wolves forward from
 *    reaching that delivery, Calum Chambers and Sokratis Papastathopoulos instead being bullied"; Aubameyang had put Arsenal ahead in the first
 *    period ("side-footing home ... after Alexandre Lacazette's layoff"); Wolves out-shot Arsenal 25 to 10; Jota "just unable to touch past Bernd
 *    Leno" later; final score 1–1. Photo caption: "Raúl Jiménez (left) with a joyous Diogo Jota after Wolves' equaliser" (John Sibley, Action
 *    Images via Reuters) [guardian-ars-wol-2019-jimenez-jota.jpg — looked at]: Wolves in GOLD (orange-gold) shirts with black trim and BLACK
 *    shorts, poppies on the shirts; Jiménez bare-headed with short dark swept hair and stubble; the referee in black; the stadium clock reads
 *    16:33 (so a 15:00 kick-off, the goal at about 16:32 — a November dusk under floodlights).
 *  - Wikipedia, "Raúl Jiménez" (raw wikitext) [wiki-raul-jimenez.txt]: 1.88 m striker; "On 2 November, he would score his team's equalizer at
 *    the 76th minute in a 1–1 result against Arsenal" (citing the Guardian report above); "known for ... his ability in the air"; the 2020
 *    skull fracture and "he would have to wear a head guard for the rest of his career" (BBC Sport, Marca); Mexico international; Fulham
 *    2023–26, back at Wolves from June 2026.
 *  - Wikipedia, "2025 CONCACAF Gold Cup final" and "2025 CONCACAF Nations League final" [wiki-2025-goldcup-final.txt, wiki-2025-cnl-final.txt]:
 *    minutes only (checked for a header; not used). Card data: lib/town/playerAppearance.json (Mexico; bun, beard, head guard) and
 *    lib/town/playerCareers.json (Wolves 2018–23).
 * CONFIRMED: the date, the Emirates, Arsenal 1–0 up (Aubameyang, first half) until the 76th minute; the move = a Wolves THROW-IN, Ceballos slow
 *  to react, Moutinho STOOD UP A CROSS, Jiménez THREW HIMSELF AT IT and headed the equaliser, beating Chambers and Sokratis to the ball; Leno in
 *  goal; Jota celebrating with him; 1–1 at the end; Wolves in gold shirts and black shorts; Jiménez bare-headed; a floodlit dusk.
 * INFERRED (illustrative reconstruction, never named in the narration): every position, run, timing and height in metres and seconds (the
 *  throw on Wolves' RIGHT touchline, about 20 m out; Moutinho's one touch and a RIGHT-footed cross — his stronger foot, not verified in the
 *  footage; the cross ≈ 30 m, apex ≈ 4 m; the leap ≈ 8.6 m out, just left of centre; the header down and across into Leno's right-hand side;
 *  Leno's late dive); which end of the ground; the thrower (drawn unnamed); where the other players stood (unnamed, no numbers); Arsenal's home
 *  kit printed as red shirts, white shorts, red socks (their white sleeves are not printed — the figure library has one shirt ink); Wolves'
 *  gold socks; Leno's keeper kit (printed green); the away fans in one corner; the celebration run toward the near corner; every camera.
 *  The demonstration chapter is NOT a real match: a training pitch, a plain green Mexico-style training top, an unnamed teammate crossing, an
 *  empty goal; his head guard (black), hair bun and beard follow the card's appearance data.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in REAL TIME (the Emirates bowl at dusk → the far touchline
 * throw-in → Moutinho's cross → the leap → Jiménez wheels away toward us); ch2 = the slow-motion replay from LOW ON HIS RIGHT, side-on, the goal behind him
 * so we see his face as the ball comes onto his forehead (the two defenders ringed, an eye-line to the ball, a replay trail, the spark
 * at contact); ch3 = the lesson as a labelled demonstration: close on today's Jiménez in his head guard, then side-on as a teammate crosses and
 * he heads it DOWN, the ball bouncing in (an eye-line, a forehead ring, a down arrow, the bounce mark). Composed on the FULL sheet (world units
 * = sheet units centred on the canvas; never sheet.safe), so it frames from the 1.45:1 card window down to square.
 * FIGURES: every body goes through ONE adapter, drawPlayer() → athlete.ts (continuous silhouettes, FK skeleton, `prev` secondary motion,
 * motionSmear on the throw, the cross, the leap and the dive); the demo's head guard, bun and beard are overlays inside the same adapter.
 * Handedness: right-handed world (x toward Arsenal's goal, y up, +z = Wolves' right), exactly athlete.ts's convention, so strike({foot:'r'})
 * is Moutinho's RIGHT foot. Jiménez meets the cross facing back toward it with the goal over his LEFT shoulder, so the header is a nod down
 * with a turn of the head to his left. Leno faces −x; his dive to his RIGHT (keeperDive side 'r') goes to −z. Inks: yellow, red, green, navy.
 * Everything is keyed to cue times (withTiming swaps in the recorded word onsets), poses on twos, cameras on ones; all randomness seeded.
 * Heat: small figures print at 'low', at most 4 non-hero figures at full detail, every figure inside a passage is capped. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,stand,keeperSet,keeperDive,celebrate,header,posed,blendPose,keyPoses,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3,type Build,type Skeleton} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets (every cue starts with a plain word);
 * their `at` and each chapter's `seconds` are ESTIMATES (≈2.7 words/s + punctuation pauses) until the Kokoro voice exists. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'Arsenal v Wolves, 2019',text:'The Emirates Stadium, 2019. Wolves are losing to Arsenal, one goal to nil. A throw-in, and João Moutinho stands up a cross. Raúl Jiménez throws himself at it... Header! Goal! Wolves are level!',tail:2.4,
  cues:['Emirates','Wolves are losing','A throw','stands up','throws himself','Header','Wolves are level']},
 {label:'Watch it again',text:'Watch again, slowly. Two defenders are right beside him, but Raúl is stronger and gets there first. Eyes on the ball, he heads it past the keeper.',tail:1.6,
  cues:['Watch again','Two defenders','stronger','Eyes on the ball','past the keeper']},
 {label:'How he does it',text:'Today Raúl wears a head guard, and he still scores headers. Watch the ball onto your forehead, and aim down towards the goal!',tail:2.6,
  cues:['Today','head guard','still scores','Watch the ball','forehead','aim down','towards the goal']},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/raul-jimenez-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/raul-jimenez-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/raul-jimenez-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('jimenez: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('jimenez: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
/** key() needs increasing times: push each key at least `gap` after the previous one (real voice timings can crowd authored offsets) */
function mono(K:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of K)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}

// ---------------------------------------------------------------- inks, vectors
const Y='yellow',R='red',G='green',K='navy';
const DEG=Math.PI/180;
const add3=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const sub3=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const mul3=(a:V3,k:number):V3=>[a[0]*k,a[1]*k,a[2]*k];
const mix3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const nrm3=(a:V3):V3=>{const l=Math.hypot(a[0],a[1],a[2])||1;return[a[0]/l,a[1]/l,a[2]/l];};
const wrap=(a:number)=>{while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;return a;};
const lerpAng=(a:number,b:number,u:number)=>a+wrap(b-a)*u;
/** yaw (athlete.ts: 0 faces +x, + turns left) facing the ground direction (dx,dz) */
const yawTo=(dx:number,dz:number)=>Math.atan2(-dz,dx);
const nrm2=(x:number,z:number):[number,number]=>{const l=Math.hypot(x,z)||1;return[x/l,z/l];};
/** a narrower (square) window gets a slightly wider lens so the action still fits; set by frame(), read by every camera */
let LENS=1;
/** Frame the FULL sheet: world (0,0) on the canvas centre at 1 unit per sheet unit (the passage arrival scale still multiplies in). */
function frame(s:Sheet){const S=s.arrival;s.camera((s.cx-s.W/2)/S,(s.cy-s.H/2)/S,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
/** half the visible extents with margin for the .68 passage preview */
const view=(s:Sheet)=>({hx:s.W/(2*.68)+120,hy:s.H/(2*.68)+120});

// ---------------------------------------------------------------- 3D: projection through an athlete.ts Camera (right-handed metres, y up)
/** Pitch: Arsenal's goal line is x = 0 (Wolves attack +x), goal centre z = 0, +z = Wolves' right; touchlines z = ±34, halfway x = −52.5. */
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

// ---------------------------------------------------------------- the Emirates at a November dusk: a red-seated bowl, the pale roof ring
const CX=-52.5;
/** stand planes (a along, b up the rake 0..1): 0 the far side (+z), 1 behind Arsenal's goal (+x), 2 the main stand (−z, the camera side),
 * 3 the other end. The Emirates is one continuous bowl: the corners are closed by the end planes reaching past the touchlines. */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-118,14,a),1.2+30*b,42+34*b],
 (a,b)=>[8+34*b,1.2+30*b,lerp(58,-58,a)],
 (a,b)=>[lerp(14,-118,a),1.2+30*b,-42-34*b],
 (a,b)=>[-113-34*b,1.2+30*b,lerp(-58,58,a)],
];
const STAND_COLS=[104,70,104,70],STAND_ROWS=16;
/** the club-level band between the Emirates' two big tiers (b ranges up the rake) */
const FASCIA:[number,number][]=[[.42,.5]];
/** crowd colour weights per stand: [paper (Arsenal white), red (Arsenal), navy (dark coats), yellow (Wolves gold)] */
const CROWD_MIX:[number,number,number,number][]=[[.3,.46,.22,.02],[.3,.46,.22,.02],[.3,.46,.22,.02],[.3,.46,.22,.02]];
/** the away fans: a gold block in the lower tier of the far-end corner (stand 3, a > .78) — inferred */
const awayBlock=(si:number,a:number,b:number)=>si===3&&a>.78&&b<.42;
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 // a November dusk over London (≈ 16:30, just after sunset): deep navy sky, a thin warm glow low down over the roof
 s.field(K,.74,.5);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz){s.tone(R,polyPath([[-1e4,hz[1]-520],[1e4,hz[1]-520],[1e4,hz[1]+60],[-1e4,hz[1]+60]],true),.12);s.tone(Y,polyPath([[-1e4,hz[1]-260],[1e4,hz[1]-260],[1e4,hz[1]+60],[-1e4,hz[1]+60]],true),.1);}
 const planes=new Path2D(),fas=new Path2D(),roof=new Path2D(),edge=new Path2D();
 for(const i of which){const S=STANDS[i];addPoly(planes,polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]));for(const[b0,b1] of FASCIA)addPoly(fas,polyP(c,[S(0,b0),S(1,b0),S(1,b1),S(0,b1)]));
  addPoly(roof,polyP(c,[add3(S(0,1),[0,1.5,0]),add3(S(1,1),[0,1.5,0]),add3(S(1,.84),[0,9,0]),add3(S(0,.84),[0,9,0])]));
  seg3(c,add3(S(0,.84),[0,8.8,0]),add3(S(1,.84),[0,8.8,0]),.5,edge);}
 // the red seats in the dusk (red × navy), the club-level band dark with a lit strip
 s.knockout(planes);s.tone(R,planes,.55);s.tone(K,planes,.4);s.knockout(fas);s.fill(K,fas,.85);s.tone(Y,fas,.2);
 // the crowd: Arsenal red and white, dark coats, the Wolves fans' gold in one corner; the roar lifts them
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si],mx=CROWD_MIX[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(FASCIA.some(([b0,b1])=>b>b0-.02&&b<b1+.02))continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,6);if(h<.22)continue;const a=(i+.5+(hash(i+j*31,8)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),away=awayBlock(si,a,b),lift=roar>0&&away?roar*z*1.4*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const u=(h-.22)/.78,ink=away?(u<.8?3:2):u<mx[0]?0:u<mx[0]+mx[1]?1:u<mx[0]+mx[1]+mx[2]?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.8);s.knockout(inks[1],.7);s.fill(R,inks[1],.95);s.fill(K,inks[2],.9);s.knockout(inks[3],.7);s.fill(Y,inks[3],.95);
 // the roof: a pale underside (the Emirates' silver roof) with a navy lip
 s.knockout(roof,.8);s.tone(K,roof,.5);s.fill(K,edge,.9);
 // floodlights along the roof lip with yellow haloes
 const lamp=new Path2D(),halo=new Path2D();for(const i of which){const S=STANDS[i];for(let k=0;k<7;k++){const u=(k+.5)/7,a=add3(S(u-.025,.84),[0,8,0]),b=add3(S(u+.025,.84),[0,8,0]),m=mix3(a,b,.5);if(toCam(c,m)[2]<NEAR+2)continue;seg3(c,a,b,1.1,lamp);
  const g=pr(c,m);if(g){const r=clamp(kAt(c,m)*4.5,8,140);halo.moveTo(g[0]+r,g[1]);halo.ellipse(g[0],g[1],r,r*.62,0,0,TAU);}}}
 s.knockout(halo,.22);s.tone(Y,halo,.4);s.knockout(lamp);s.fill(Y,lamp,.75);
 if(flash>0){const p=new Path2D(),n=Math.round(22*flash);for(let i=0;i<n;i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,STANDS[si](r2,.1+.8*hash(i,Math.floor(tt*12))));if(!q)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.6);}
}
// ---------------------------------------------------------------- grass under the floodlights, lines, boards, corner flags
function pitchLines(c:Cam,ln:Path2D,full:boolean){
 const L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 if(full){for(let k=0;k<8;k++){L([-k*13.125,0,-34],[-(k+1)*13.125,0,-34]);L([-k*13.125,0,34],[-(k+1)*13.125,0,34]);}
  for(let k=0;k<4;k++){L([0,0,-34+k*17],[0,0,-34+(k+1)*17]);L([CX,0,-34+k*17],[CX,0,-34+(k+1)*17]);}circ(CX,0,9.15);
  circ(0,-34,1,Math.PI/2,Math.PI,4);circ(0,34,1,Math.PI,Math.PI*1.5,4);}
 else{L([0,0,-24],[0,0,24]);}
 L([0,0,-20.16],[-16.5,0,-20.16]);L([-16.5,0,-20.16],[-16.5,0,20.16]);L([-16.5,0,20.16],[0,0,20.16]);
 L([0,0,-9.16],[-5.5,0,-9.16]);L([-5.5,0,-9.16],[-5.5,0,9.16]);L([-5.5,0,9.16],[0,0,9.16]);
 {const a=Math.acos(5.5/9.15);circ(-11,0,9.15,Math.PI-a,Math.PI+a,12);}
 const d:V3[]=[];for(let i=0;i<12;i++){const a=i/12*TAU;d.push([-11+Math.cos(a)*.15,0,Math.sin(a)*.15]);}addPoly(ln,polyP(c,d));
}
function ground(s:Sheet,c:Cam){
 const g=polyP(c,[[-118,0,-46],[13,0,-46],[13,0,46],[-118,0,46]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(G,gp,.9);s.tone(K,gp,.18);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]));s.tone(Y,st,.22);
 // advertising boards: navy with red panels (no lettering)
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([5.5,0,-38],[5.5,0,38]);board([-110,0,-38],[5.5,0,-38]);board([-110,0,38],[5.5,0,38]);
 for(let k=0;k<12;k++){const z=-36+k*6.2;addPoly(pn,polyP(c,[[5.4,.25,z],[5.4,.25,z+3.3],[5.4,.68,z+3.3],[5.4,.68,z]]));}
 for(const zz of[-37.9,37.9])for(let k=0;k<18;k++){const x=-108+k*6.4;addPoly(pn,polyP(c,[[x,.25,zz],[x+3.4,.25,zz],[x+3.4,.68,zz],[x,.68,zz]]));}
 s.knockout(bd);s.fill(K,bd,.9);s.knockout(pn,.85);s.fill(R,pn,.55);
 const ln=new Path2D();pitchLines(c,ln,true);s.knockout(ln);
 const pole=new Path2D(),flag=new Path2D();for(const z of[-34,34]){seg3(c,[0,0,z],[0,1.55,z],.05,pole);addPoly(flag,polyP(c,[[0,1.55,z],[0,1.2,z],[-.45,1.38,z]]));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(R,flag,.95);
}
/** a goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep with a sloping roof; bulge pushes the back out around z = bz */
function goal3(s:Sheet,c:Cam,bulge:number,bz:number,by=.9){
 const X=0,z0=-3.66,z1=3.66,H=2.44,back=(z:number,y:number)=>X+2+bulge*.75*Math.exp(-Math.pow((z-bz)/1.6,2)-Math.pow((y-by)/1.1,2));
 const zs=[z0,-2.6,-1.4,0,1.8,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0,1.9),1.9,z0],[back(z0,0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1,1.9),1.9,z1],[back(z1,0),0,z1]],
  [[X,H,z0],[X,H,z1],...zs.slice().reverse().map(z=>[back(z,1.9),1.9,z] as V3)],
  [...zs.map(z=>[back(z,0),0,z] as V3),...zs.slice().reverse().map(z=>[back(z,1.9),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.3);s.tone(K,net,.12);
 const mesh=new Path2D();
 for(let i=0;i<=14;i++){const z=lerp(z0,z1,i/14);seg3(c,[X,H,z],[back(z,1.9),1.9,z],.022,mesh,.7);seg3(c,[back(z,1.9),1.9,z],[back(z,.95),.95,z],.022,mesh,.7);seg3(c,[back(z,.95),.95,z],[back(z,0),0,z],.022,mesh,.7);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<zs.length-1;i++)seg3(c,[back(zs[i],y),y,zs[i]],[back(zs[i+1],y),y,zs[i+1]],.022,mesh,.7);seg3(c,[X,y*H/1.9,z0],[back(z0,y),y,z0],.022,mesh,.7);seg3(c,[X,y*H/1.9,z1],[back(z1,y),y,z1],.022,mesh,.7);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+2*u,H-.54*u,z0],[X+2*u,H-.54*u,z1],.022,mesh,.7);}
 s.knockout(mesh,.8);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.2,fo);seg3(c,[X,0,z1],[X,H,z1],.2,fo);seg3(c,[X,H,z0-.04],[X,H,z1+.04],.2,fo);
 s.fill(K,fo,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- the cast: kits (athlete.ts styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.18]],SKIN_M:InkFill[]=[[Y,.42],[R,.26],[K,.06]],SKIN_D:InkFill[]=[[Y,.8],[R,.62],[K,.28]];
/** Wolves 2019–20 home: gold shirts, black shorts (the match photo), gold socks (inferred); black trim and numbers */
const wol=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[Y,.95],shorts:[K,.92],socks:[Y,.95],boots:K,skin:SKIN_L,hair:K,line:K,trim:[K,.9],numberInk:[K,.9],hairStyle:'short',build:{height:1.8,bulk:1},...o});
/** Arsenal 2019–20 home (inferred, printed simply): red shirts, white shorts, red socks; white numbers */
const ars=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[R,.95],shorts:'paper',socks:[R,.9],boots:K,skin:SKIN_L,hair:K,line:K,trim:'paper',numberInk:'paper',hairStyle:'short',build:{height:1.83,bulk:1},...o});
const B_JIM:Build={height:1.88,bulk:1.05,thighs:1.04},B_MOU:Build={height:1.7,bulk:.95},B_SOK:Build={height:1.86,bulk:1.08},B_CHA:Build={height:1.83,bulk:1},B_LEN:Build={height:1.9,bulk:1},B_JOT:Build={height:1.78,bulk:.97};
/** Jiménez in 2019: bare-headed, short dark hair (the match photo) */
const JIM_ST=wol({number:9,hair:[K,.95],skin:SKIN_M,build:B_JIM,seed:9});
const MOU_ST=wol({number:28,hair:[K,.9],skin:SKIN_L,build:B_MOU,seed:28});
const JOT_ST=wol({number:18,hair:[K,.95],skin:SKIN_L,build:B_JOT,seed:18});
const SOK_ST=ars({number:5,hair:[K,.95],build:B_SOK,seed:5});
const CHA_ST=ars({number:21,hair:[K,.9],skin:SKIN_L,build:B_CHA,seed:21});
const LEN_ST:AthleteStyle={shirt:[G,.95],shorts:[G,.95],socks:[G,.9],boots:K,skin:SKIN_L,hair:[Y,.55],line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',number:1,numberInk:K,build:B_LEN,seed:1};
/** today's Jiménez for the demonstration: a plain green training top (Mexico, the card's country), navy shorts, the black head guard, his
 * hair tied in a bun and a beard (card appearance data) — not a match kit */
const JIM_NOW:AthleteStyle={shirt:[G,.95],shorts:[K,.9],socks:[K,.85],boots:K,skin:SKIN_M,hair:[K,.95],line:K,trim:'paper',hairStyle:'short',build:B_JIM,seed:91};
/** the demonstration's unnamed teammate who crosses: a navy training top */
const MATE_ST:AthleteStyle={shirt:[K,.85],shorts:[K,.92],socks:[K,.85],boots:K,skin:SKIN_L,hair:[Y,.6],line:K,trim:'paper',hairStyle:'short',build:{height:1.78},seed:77};
/** styles that wear the head guard (drawPlayer adds the guard, the bun and the beard) — ONLY the demonstration's Jiménez */
const HEADGUARD=new Set<AthleteStyle>([JIM_NOW]);

// ---------------------------------------------------------------- the play on one clock τ (seconds; τ = 0 is Moutinho's cross)
const BALL_R=.11,GRAV=9.81;
const G3:V3=[0,-GRAV,0];
const launch=(A:V3,Bp:V3,d:number,a:V3):V3=>[(Bp[0]-A[0]-.5*a[0]*d*d)/d,(Bp[1]-A[1]-.5*a[1]*d*d)/d,(Bp[2]-A[2]-.5*a[2]*d*d)/d];
const flyA=(A:V3,V:V3,a:V3,t:number):V3=>[A[0]+V[0]*t+.5*a[0]*t*t,A[1]+V[1]*t+.5*a[1]*t*t,A[2]+V[2]*t+.5*a[2]*t*t];
/** the stood-up cross flies TF s to Jiménez's head; the header reaches the goal line TG */
const TF=1.5,TG=TF+.46;
/** Jiménez's header: header() with the body thrown forward at the ball ("threw himself at"), a nod DOWN, and the head turning to his LEFT
 * (the goal side) through contact */
function jimHeader(u:number):Pose{const p=header(clamp(u));p.air*=1.08;const w=Math.sin(Math.PI*clamp((u-.3)/.42)),sn=clamp((u-.36)/.2);
 p.neckY+=lerp(-.12,.42,sn)*w;p.twist+=lerp(-.06,.2,sn)*w;p.pitch+=.22*w;p.lean+=.08*w;return p;}
/** contact on the header clock: mid-nod, eyes on the ball */
const CU=.48,HD=1.0,TJ=TF-CU*HD;
/** Jiménez's header spot (his pelvis) ≈ 8.6 m out, just left of centre. He meets it facing back toward the cross, the goal over his LEFT shoulder. */
const HP:[number,number]=[-8.6,-.6];
const P0:V3=[-18.5,BALL_R,28.2];
const FACE:[number,number]=(()=>{const a=nrm2(P0[0]-HP[0],P0[2]-HP[1]),b=nrm2(-HP[0],-HP[1]);return nrm2(a[0]+b[0]*1.05,a[1]+b[1]*1.05);})(),YAW_H=yawTo(FACE[0],FACE[1]);
/** the ball's centre at contact: one radius in front of his forehead (solved from the skeleton) */
function foreheadBall(hp:[number,number],yaw:number):V3{const sk=solve(jimHeader(CU),B_JIM,{x:hp[0],z:hp[1],yaw}),hd=sk.head,fc=sk.face,d=sub3(fc,hd),l=Math.hypot(d[0],d[1],d[2])||1;
 return[fc[0]+d[0]/l*(BALL_R+.02),fc[1]+d[1]/l*(BALL_R+.02)+.04,fc[2]+d[2]/l*(BALL_R+.02)];}
const HEAD_PT:V3=foreheadBall(HP,YAW_H);
/** a stood-up cross: a little drift toward the goal line on top of gravity */
const SWING:V3=[.6,-GRAV,0];
const V_CROSS=launch(P0,HEAD_PT,TF,SWING);
/** Moutinho strikes along the ball's launch direction */
const DC=nrm2(V_CROSS[0],V_CROSS[2]),YAW_M=yawTo(DC[0],DC[1]);
/** where Moutinho's pelvis stands at contact so his RIGHT boot meets the back of the ball (solved once, FK) */
const PCM:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r'}),B_MOU,{x:0,z:0,yaw:YAW_M});return[P0[0]-DC[0]*.12-sk.rToe[0],P0[2]-DC[1]*.12-sk.rToe[2]];})();
/** the throw-in: the thrower on Wolves' right touchline, the ball to Moutinho's feet, his touch rolls it onto the cross spot */
const TP:[number,number]=[-21.4,34.55],T_REL=-1.95,T_REC=-1.25,REC:V3=[-19.4,BALL_R,29.6];
/** the header crosses the goal line low, on Leno's right (−z) */
const GOAL_PT:V3=[0,.5,-1.95],NET_HIT:V3=[1.55,.35,-2.25],REST:V3=[1.15,BALL_R,-2.1];
const V_HEAD=launch(HEAD_PT,GOAL_PT,TG-TF,G3);

// ---------------------------------------------------------------- the throw-in (the thrower's pose drives the ball until release)
const THROW_KEYS:[number,Pose][]=[
 [0,posed({lShF:62,rShF:62,lElb:112,rElb:112,lShA:14,rShA:14,lHipF:6,rHipF:4,lKnee:10,rKnee:10,neckP:-4})],
 [.42,posed({lShF:178,rShF:178,lShA:12,rShA:12,lElb:100,rElb:100,lean:-20,pitch:-6,lHipF:22,rHipF:-12,lKnee:24,rKnee:14,lAnk:-8,neckP:-22})],
 [.6,posed({lShF:128,rShF:128,lShA:8,rShA:8,lElb:16,rElb:16,lean:20,pitch:6,lHipF:30,rHipF:-16,lKnee:20,rKnee:22,rAnk:30,neckP:10})],
 [1,posed({lShF:74,rShF:74,lShA:14,rShA:14,lElb:22,rElb:22,lean:14,pitch:3,lHipF:26,rHipF:-8,lKnee:18,rKnee:24,neckP:6})],
];
/** the throw on its own clock u ∈ [0,1] ↔ τ ∈ [THROW_A, THROW_A + THROW_L]; release at u = .6 (τ = T_REL) */
const THROW_L=1.6,THROW_A=T_REL-.6*THROW_L;
const throwU=(tau:number)=>(tau-THROW_A)/THROW_L;
const YAW_T=yawTo(REC[0]-TP[0],REC[2]-TP[1]);
function throwPose(tau:number):Pose{return keyPoses(clamp(throwU(tau)),THROW_KEYS);}

// ---------------------------------------------------------------- tracks: [τ, x, z], Hermite-interpolated (all illustrative, see header)
type Role='jim'|'mou'|'gk'|'sok'|'cha'|'jota'|'thr'|'cer'|'ars'|'wol';
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];hero?:boolean};
const T0=-10,T1=12,DT=.02;
const km=(u:number):[number,number]=>[PCM[0]+DC[0]*u,PCM[1]+DC[1]*u];
/** after the goal the Wolves players chase Jiménez toward the near corner */
const toFlag=(x:number,z:number,k:number):number[][]=>[[TG+.5+k*.2,x,z],[TG+4+k*.3,lerp(x,-7,.6),lerp(z,-22,.6)],[T1,lerp(x,-6,.8),lerp(z,-26,.85)]];
const ACTORS:Actor[]=[
 {name:'Raúl Jiménez',role:'jim',hero:true,style:JIM_ST,keys:[[T0,-15.4,-4.2],[-5,-15,-3.6],[-1.6,-14.2,-2.8],[-.7,-13.4,-2.4],[TJ-.28,HP[0],HP[1]],[TF+.45,HP[0],HP[1]],[TF+1.3,-7.6,-4.6],[TF+3.4,-7,-12.5],[TF+6.2,-6.2,-21],[T1,-5.6,-25]]},
 {name:'João Moutinho',role:'mou',hero:true,style:MOU_ST,keys:[[T0,-24,24],[-5,-22.6,26.2],[-2.6,-20.6,28.6],[T_REC,REC[0]-.35,REC[2]+.45],[-.5,...km(-1.6)],[0,...km(0)],[.7,...km(.9)],[3,...km(2.8)],[T1,-12,16]]},
 {name:'Bernd Leno',role:'gk',hero:true,style:LEN_ST,keys:[[T0,-.9,1.6],[-3,-1,2],[-1,-1.1,1.4],[0,-1.1,.8],[TF-.4,-1.05,-.1],[TF,-1.05,-.2],[T1,-1,-.4]]},
 {name:'Sokratis (beaten)',role:'sok',hero:true,style:SOK_ST,keys:[[T0,-10.6,-3.4],[-3,-10.4,-2.8],[-1,-10,-2.3],[0,-9.6,-2],[TF-.5,-8.4,-1.6],[TF,-7.9,-1.5],[TF+.6,-7.8,-1.4],[T1,-7,-1.2]]},
 {name:'Calum Chambers (beaten)',role:'cha',hero:true,style:CHA_ST,keys:[[T0,-12,2.8],[-3,-11.8,2.4],[-1,-11.4,2],[0,-11,1.6],[TF-.5,-10.1,1.1],[TF,-9.8,.9],[TF+.6,-9.7,.85],[T1,-9,.6]]},
 {name:'Diogo Jota',role:'jota',hero:true,style:JOT_ST,keys:[[T0,-9.4,-8.6],[-3,-9,-8],[0,-8.4,-7.2],[TF,-6.6,-6],[TF+.8,-6.6,-6],[TF+1.8,-7.4,-6],[TF+3.6,-7.2,-12],[TF+6.4,-6.4,-20.6],[T1,-5.8,-24.6]]},
 {name:'Wolves thrower',role:'thr',style:wol({skin:SKIN_L,seed:31,build:{height:1.84}}),keys:[[T0,-24,31],[-6,-22.4,33.6],[-4,-21.4,34.55],[T_REL+.8,TP[0],TP[1]],[T_REL+2.6,-20,31],[T1,-16,26]]},
 {name:'Dani Ceballos (slow)',role:'cer',style:ars({skin:SKIN_L,build:{height:1.76},seed:8}),keys:[[T0,-22,25.5],[-4,-21.6,26.2],[T_REC,-20.8,27.4],[-.2,-20,27.6],[1,-19.6,27.2],[T1,-17,22]]},
 {name:'Arsenal back post',role:'ars',style:ars({skin:SKIN_D,seed:41}),keys:[[T0,-6.4,-5.2],[-2,-6.2,-4.8],[0,-6,-4.6],[TF,-5.6,-4.4],[T1,-5,-3.6]]},
 {name:'Arsenal six-yard',role:'ars',style:ars({seed:42,build:{height:1.8}}),keys:[[T0,-5.6,2.2],[-2,-5.8,2],[0,-6,1.8],[TF,-5.5,1.2],[T1,-5,1]]},
 {name:'Arsenal edge',role:'ars',style:ars({skin:SKIN_M,seed:43}),keys:[[T0,-16.2,1.6],[-2,-15.8,2.2],[0,-15.4,2.4],[TF,-13.8,1.8],[T1,-13,1.4]]},
 {name:'Arsenal wide',role:'ars',style:ars({seed:44,build:{height:1.78}}),keys:[[T0,-14,12],[-2,-14.6,13.4],[0,-14.8,14.8],[TF,-13.4,12],[T1,-12.6,10.6]]},
 {name:'Wolves edge',role:'wol',style:wol({skin:SKIN_L,seed:61,build:{height:1.8}}),keys:[[T0,-21,-1],[-2,-20.4,-.6],[0,-19.8,-.2],[TF,-17.4,-.8],...toFlag(-16.6,-1,2)]},
 {name:'Wolves far',role:'wol',style:wol({skin:SKIN_D,seed:62,build:{height:1.9,bulk:1.06}}),keys:[[T0,-12.4,6.2],[-2,-12,5.6],[0,-11.6,5.2],[TF,-10.2,3.6],...toFlag(-9.6,3,1)]},
];
const JIM=0,MOU=1,GK=2,SOK=3,CHA=4,JOT=5,THR=6;
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const still=(a:number[],b:number[])=>Math.abs(a[1]-b[1])+Math.abs(a[2]-b[2])<1e-6;
 const f=(j:number)=>{const m1=still(k1,k2)||still(k0,k1)?0:(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=still(k1,k2)||still(k2,k3)?0:(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (drives the gait phase) — built once */
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.06),b=posOf(k,tau+.06);return[(b[0]-a[0])/.12,(b[1]-a[1])/.12];};

// ---------------------------------------------------------------- the ball
/** the ball held above the thrower's head, between his hands (from his drawn skeleton) */
function ballInHands(tau:number):V3{const st=stateOf(THR,tau),sk=solve(st.pose,{height:1.84},st.place),m=mix3(sk.lHa,sk.rHa,.5),up=nrm3(sub3(m,sk.chest));return add3(m,mul3(up,.1));}
let THROWN:[V3,V3]|null=null;
/** the release point and the throw's launch velocity (solved once, on first use: the tracks must exist) */
function throwLaunch():[V3,V3]{if(!THROWN){const R0=ballInHands(T_REL);THROWN=[R0,launch(R0,REC,T_REC-T_REL,G3)];}return THROWN;}
/** in the thrower's hands → the throw → Moutinho's touch rolls it on → the stood-up cross → the header → the net */
function ballAt(tau:number):V3{
 if(tau<=T_REL)return ballInHands(tau);
 if(tau<T_REC){const[R0,V]=throwLaunch();return flyA(R0,V,G3,tau-T_REL);}
 if(tau<0){const u=easeOut(clamp((tau-T_REC)/(-.3-T_REC)));return[lerp(REC[0],P0[0],u),BALL_R,lerp(REC[2],P0[2],u)];}
 if(tau<TF)return flyA(P0,V_CROSS,SWING,tau);
 if(tau<TG)return flyA(HEAD_PT,V_HEAD,G3,tau-TF);
 if(tau<TG+.14)return mix3(GOAL_PT,NET_HIT,easeOut((tau-TG)/.14));
 const u=clamp((tau-TG-.14)/.5),b=u>=1?.08*Math.abs(Math.sin((tau-TG-.64)*9))*Math.exp(-(tau-TG-.64)*3.5):0;
 return[lerp(NET_HIT[0],REST[0],u),Math.max(BALL_R,lerp(NET_HIT[1],BALL_R,u*u))+b,lerp(NET_HIT[2],REST[2],u)];
}
const spinAt=(tau:number)=>tau<=T_REL?0:tau<0?(tau-T_REL)*TAU*1.5:tau<TF?tau*TAU*4+3:TF*TAU*4+3+(tau-TF)*TAU*3;
const bulgeAt=(tau:number)=>tau<TG+.08?0:Math.exp(-(tau-TG-.08)*2.4)*(1+.3*Math.sin((tau-TG)*14));

// ---------------------------------------------------------------- poses from the tracks
function loco(k:number,tau:number):Pose{
 const v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),q=clamp(sp/7.5),ph=distOf(k,tau)/(2.3+2.1*q)+k*.37;
 const run=runCycle(ph,{speed:q});if(sp>1.4)return run;
 // open-play readiness: knees bent, arms out, a small shuffle
 const idle=blendPose(stand(),posed({lHipF:22,rHipF:16,lKnee:28,rKnee:24,lean:12,pitch:4,neckP:-8,lShA:22,rShA:20,lElb:40,rElb:36,rAnk:-6,lAnk:-6}),.5+.5*Math.sin(tau*1.7+k));
 return blendPose(idle,run,clamp((sp-.25)/1.15));
}
/** face along the run when moving, else toward the ball (blended, so turns are continuous) */
function faceYaw(k:number,tau:number,target?:V3):number{
 const v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),p=posOf(k,tau),b=target??ballAt(tau),tx=b[0]-p[0],tz=b[2]-p[1],tl=Math.hypot(tx,tz)||1,w=clamp((sp-.6)/1.6);
 return yawTo(lerp(tx/tl,v[0]/(sp||1),w),lerp(tz/tl,v[1]/(sp||1),w));
}
const win=(t:number,a:number,b:number,e=.15)=>sm(a,a+e,t)*(1-sm(b-e,b,t));
const DEJECT=posed({lHipF:26,rHipF:26,lKnee:30,rKnee:30,lean:30,pitch:6,neckP:34,lShA:14,rShA:14,lShF:20,rShF:20,lElb:24,rElb:24});
/** Leno: set, then a late dive to his RIGHT (side 'r' = −z for a keeper facing −x), too late for the header */
const DIVE=(u:number)=>keeperDive(clamp(u),{side:'r',height:.2}),T_DIVE=TF+.1,DIVE_L=.95;
type State={pose:Pose;place:Place};
function stateOf(k:number,tau:number):State{
 const a=ACTORS[k],[x,z]=posOf(k,tau);let pose=loco(k,tau),yaw=0;
 if(a.role!=='thr')yaw=faceYaw(k,tau);
 switch(a.role){
  case 'jim':{
   // eyes on the throw, the run in, then he throws himself at the cross, nods it down, lands and wheels away
   if(tau<-.7)yaw=faceYaw(k,tau,[P0[0],0,P0[2]]);
   if(tau>TJ-.3&&tau<TJ+HD+.6){const u=(tau-TJ)/HD,hp=jimHeader(u);pose=blendPose(pose,hp,sm(TJ-.3,TJ,tau)*(1-sm(TJ+HD,TJ+HD+.6,tau)));}
   if(tau>TJ+HD){const run=celebrate(distOf(k,tau)/4.2,{kind:'run'});pose=blendPose(pose,run,sm(TJ+HD+.1,TJ+HD+.8,tau));}
   const w=sm(TJ-.6,TJ-.15,tau)*(1-sm(TF+.5,TF+1.1,tau));yaw=w>=1?YAW_H:lerpAng(yaw,YAW_H,w);break;}
  case 'mou':{const w=win(tau,-.55,.85,.2);if(w>0)pose=blendPose(pose,strike(clamp(tau/1.0+STRIKE_CONTACT),{foot:'r'}),w);
   // he shows for the throw and cushions it on his right instep
   if(tau>T_REC-.5&&tau<T_REC+.5){pose=blendPose(pose,posed({lHipF:26,lKnee:30,rHipF:30,rHipR:40,rKnee:40,rAnk:-10,lean:18,pitch:4,neckP:34,lShA:40,rShA:36,lElb:40,rElb:40}),win(tau,T_REC-.5,T_REC+.5,.3)*.85);yaw=faceYaw(k,tau,REC);}
   if(tau>-2.8&&tau<T_REC)yaw=faceYaw(k,tau,ballAt(tau));
   yaw=lerpAng(yaw,YAW_M,sm(-.7,-.35,tau)*(1-sm(.9,1.6,tau)));
   if(tau>1.4)yaw=lerpAng(yaw,faceYaw(k,tau,[HP[0],0,HP[1]]),sm(1.4,1.9,tau));
   if(tau>TG+.6){const run=celebrate(distOf(k,tau)/4,{kind:'arms'});pose=blendPose(pose,run,sm(TG+.6,TG+1.2,tau)*.8);}
   break;}
  case 'thr':{yaw=YAW_T;const u=throwU(tau);
   if(tau<THROW_A+.1)yaw=lerpAng(faceYaw(k,tau,REC),YAW_T,sm(THROW_A-1.2,THROW_A,tau));
   if(u<.6){const hp=throwPose(tau);pose={...pose,lShF:hp.lShF,rShF:hp.rShF,lShA:hp.lShA,rShA:hp.rShA,lElb:hp.lElb,rElb:hp.rElb,lShR:0,rShR:0};}
   if(u>-.8&&u<1.4)pose=blendPose(pose,throwPose(tau),sm(-.8,-.05,u)*(1-sm(1,1.4,u)));
   if(u>=1.4)yaw=faceYaw(k,tau,[HP[0],0,HP[1]]);
   if(tau>TG+.6){const run=celebrate(distOf(k,tau)/4,{kind:'arms'});pose=blendPose(pose,run,sm(TG+.6,TG+1.2,tau)*.7);}
   break;}
  case 'gk':{const set=keeperSet(tau*1.3);pose=blendPose(set,pose,sm(.6,1.1,tau)*(1-sm(TF-.85,TF-.65,tau)));
   if(tau>T_DIVE-.15){pose=blendPose(pose,DIVE((tau-T_DIVE)/DIVE_L),sm(T_DIVE-.15,T_DIVE,tau));}
   if(tau>TG+1.4)pose=blendPose(pose,DEJECT,sm(TG+1.6,TG+2.4,tau)*.6);
   yaw=faceYaw(k,Math.min(tau,TF-.1));if(tau>TF-.1)yaw=lerpAng(yaw,Math.PI,sm(TF-.1,TF+.1,tau));break;}
  case 'sok':case 'cha':{// bullied: a late, lower jump beside / behind Jiménez, then hands on hips
   const late=a.role==='sok'?-.28:-.18,lift=a.role==='sok'?.66:.55;
   if(tau>TF-.6&&tau<TF+1){const hp=header(clamp((tau-(TF+late-.25))/1.0));hp.air*=lift;pose=blendPose(pose,hp,.6*sm(TF-.6,TF-.35,tau)*(1-sm(TF+.6,TF+1,tau)));}
   if(tau>TF+.9)pose=blendPose(pose,DEJECT,sm(TF+.9,TF+1.6,tau));yaw=faceYaw(k,Math.min(tau,TF));break;}
  case 'jota':if(tau>TG+.3){const run=celebrate(distOf(k,tau)/4,{kind:'arms'});pose=blendPose(pose,run,sm(TG+.4,TG+1,tau)*.8);if(tau>TF+1.8)yaw=faceYaw(k,tau,[...posOf(JIM,tau).slice(0,1),0,posOf(JIM,tau)[1]] as V3);}break;
  case 'cer':{if(tau<T_REC+.4)pose=blendPose(pose,stand(),.6);if(tau>TG+.5)pose=blendPose(pose,DEJECT,sm(TG+.8,TG+1.8,tau)*.8);break;}
  case 'ars':if(tau>TG+.5)pose=blendPose(pose,DEJECT,sm(TG+.8,TG+1.8,tau)*.8);if(tau>TF+.2)yaw=faceYaw(k,TF+.2);break;
  case 'wol':if(tau>TG+.3){const run=celebrate(distOf(k,tau)/4.2,{kind:'arms'});pose=blendPose(pose,run,sm(TG+.4,TG+1,tau)*.7);}break;
 }
 return{pose,place:{x,z,yaw}};
}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** a unit sphere, sampled once (the head guard's panels, the beard) */
const SPH:V3[]=(()=>{const o:V3[]=[];for(let i=0;i<=10;i++){const la=-Math.PI/2+i/10*Math.PI;for(let j=0;j<18;j++){const lo=j/18*TAU;o.push([Math.cos(la)*Math.cos(lo),Math.sin(la),Math.cos(la)*Math.sin(lo)]);}}return o;})();
/** head frame (row-major 3×3; columns forward, up, right) applied to a local direction */
const mv=(m:number[],v:V3):V3=>[m[0]*v[0]+m[1]*v[1]+m[2]*v[2],m[3]*v[0]+m[4]*v[1]+m[5]*v[2],m[6]*v[0]+m[7]*v[1]+m[8]*v[2]];
function hull2(pts:Pt[]):Pt[]{if(pts.length<3)return pts.slice();const p=pts.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]),cr=(o:Pt,a:Pt,b:Pt)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);
 const lo:Pt[]=[],up:Pt[]=[];for(const q of p){while(lo.length>=2&&cr(lo[lo.length-2],lo[lo.length-1],q)<=0)lo.pop();lo.push(q);}
 for(let i=p.length-1;i>=0;i--){const q=p[i];while(up.length>=2&&cr(up[up.length-2],up[up.length-1],q)<=0)up.pop();up.push(q);}up.pop();lo.pop();return lo.concat(up);}
/** today's Jiménez: the beard (a navy screen on the jaw), the black padded head guard over the crown and round the back (its rim just above
 * the brow, a pale seam over the top) and his hair bun poking out at the back. Printed after the body with the body's squash mapping;
 * skipped when a hand or elbow is in front of the head. */
function headgear(s:Sheet,c:Cam,sk:Skeleton,pose:Pose){
 const H=sk.fr.H,hc=sk.head,r=.105*sk.s*1.12,eye=c.eye,view3=nrm3(sub3(hc,eye));
 for(const j of [sk.lHa,sk.rHa,sk.lEl,sk.rEl]){if(toCam(c,j)[2]<toCam(c,hc)[2]-.05){const a=pr(c,j),b=pr(c,hc);if(a&&b&&Math.hypot(a[0]-b[0],a[1]-b[1])<kAt(c,hc)*r*1.9)return;}}
 const raw=(p:V3):Pt|null=>pr(c,p),kq=pose.squash||0;let px=raw;
 if(Math.abs(kq)>1e-3){let low:V3=sk.lToe;for(const j of [sk.rToe,sk.lHeel,sk.rHeel,sk.lKn,sk.rKn,sk.pelvis,sk.lHa,sk.rHa,sk.head])if(j[1]<low[1])low=j;
  const c0=raw(low),a0=raw(sk.pelvis),a1=raw(sk.neck);if(c0&&a0&&a1){let ax=a1[0]-a0[0],ay=a1[1]-a0[1];const al=Math.hypot(ax,ay);if(al<1e-6){ax=0;ay=-1;}else{ax/=al;ay/=al;}const al2=1+kq,pp=1/(1+kq);
   px=(p:V3)=>{const q=raw(p);if(!q)return null;const dx=q[0]-c0[0],dy=q[1]-c0[1],t=dx*ax+dy*ay,ox=dx-ax*t,oy=dy-ay*t;return[c0[0]+ax*t*al2+ox*pp,c0[1]+ay*t*al2+oy*pp];};}}
 const hpx=kAt(c,hc)*r;
 // the beard: the lower front of the face, where it faces the camera
 if(hpx>7){const bd:Pt[]=[];for(const u of SPH){if(u[1]>-.12||u[0]<.05)continue;const d=mv(H,u);if(dot3(d,view3)>.1)continue;const q=px(add3(hc,mul3(d,r*.9)));if(q)bd.push(q);}
  if(bd.length>4)s.tone(K,polyPath(hull2(bd),true),.5);}
 // the bun: a small navy knot at the back of the head, just below the guard's crown
 const bunC=add3(hc,mv(H,mul3(nrm3([-.9,.45,0]),r*1.05))),bq=px(bunC);
 if(bq){const br=Math.max(2.2,kAt(c,bunC)*r*.36),bp=polyPath(blob(bq[0],bq[1],br,br*.9,5,{n:14}),true);s.knockout(bp,.9);s.fill(K,bp,.95);}
 // the guard: a padded cap over the crown, the back of the head and the ears
 const pts:Pt[]=[];for(const u of SPH){if(-.36*u[0]+.93*u[1]<-.1)continue;const d=mv(H,u);if(dot3(d,view3)>.12)continue;const q=px(add3(hc,mul3(d,r)));if(q)pts.push(q);}
 if(pts.length<5)return;
 const capP=polyPath(hull2(pts),true);s.knockout(capP,.9);s.fill(K,capP,.95);
 if(hpx<9)return;
 // the pale seam over the crown, front to back, where it faces the camera
 const seam:Pt[]=[];for(let i=0;i<=10;i++){const a=-.1+i/10*2.1,u:V3=[Math.cos(a),Math.sin(a),0],d=mv(H,u);if(dot3(d,view3)>0||-.36*u[0]+.93*u[1]<-.08)continue;const q=px(add3(hc,mul3(d,r*1.01)));if(q)seam.push(q);}
 if(seam.length>2)s.knockout(ribbon(seam,Math.max(1.5,hpx*.08),{taper:.5,pressure:.2,wobble:0}),.8);
 // the padded band round the brow: a slightly paler rim
 const rim:Pt[]=[];for(let i=0;i<=16;i++){const a=i/16*TAU,x=Math.cos(a)*.9,u:V3=nrm3([x,(.36*x-.1)/.93+.02,Math.sin(a)*.9]),d=mv(H,u);if(dot3(d,view3)>.05)continue;const q=px(add3(hc,mul3(d,r*1.02)));if(q)rim.push(q);}
 if(rim.length>2)s.stroke(K,ribbon(rim,Math.max(1.4,hpx*.09),{taper:.3,pressure:0,wobble:0}),Math.max(1.2,hpx*.05),.9);
}
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the pose one drawn frame earlier (secondary
 * motion: hair and the shirt hem trail), smear = halftone echo + speed lines on fast limbs (the throw, the cross, the leap, the dive). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:State,smear=false){
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 const res=drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
 if(HEADGUARD.has(style)&&res.detail!=='low')headgear(s,camera,res.sk,pose);
 return res;
}

// ---------------------------------------------------------------- the ball + the scene assembly
function drawBall(s:Sheet,c:Cam,P:V3,rot:number,o:{min?:number;prevP?:V3|null;lines?:boolean}={}){
 const q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??12,c.F*BALL_R/q[2]);
 const sh:Pt[]=[];const rad=.16+P[1]*.05;for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*1.3,0,P[2]+Math.sin(a)*rad]);if(p)sh.push(p);}
 if(sh.length>8&&P[0]<.05)s.tone(K,polyPath(sh,true),clamp(.5-P[1]*.1,.08,.5));
 if(o.lines&&o.prevP){const a=pr(c,o.prevP);if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.8)speedLines(s,K,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:4,seed:7,len:Math.min(260,d*1.4),spread:r*.9,width:Math.max(2.5,r*.18),cov:.8});}}
 footballPanels(s,g[0],g[1],r,{rot,key:K,shadow:K,seed:5});
 return{g,r,d:q[2]};
}
type Item={d:number;draw:()=>void};
const FULL_CAP=4;
type Fig={st:State;prev?:State;style:AthleteStyle;hero:boolean;smear?:boolean};
/** depth-sorts figures, the ball and the goal (far first). Heat: small figures print at `low`; inside a passage every figure is capped. */
function drawScene(s:Sheet,c:Cam,figs:Fig[],ball:{P:V3;rot:number;min?:number;prevP?:V3|null;lines?:boolean}|null,goal:{bulge:number;bz:number;by?:number}|null):{ball:{g:Pt;r:number}|null}{
 const v=view(s),items:Item[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending;
 const near=figs.filter(f=>!f.hero).map(f=>toCam(c,[f.st.place.x??0,.9,f.st.place.z??0])[2]).filter(d=>d>=1).sort((a,b)=>a-b),dCap=near.length>FULL_CAP?near[FULL_CAP-1]:1e9;
 for(const f of figs){const q=toCam(c,[f.st.place.x??0,.9,f.st.place.z??0]);if(q[2]<1)continue;const g=scr(c,q),k=c.F/q[2]*1.8;if(Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k)continue;
  const px=k*ppu,style:AthleteStyle=passing?{...f.style,detail:f.hero?'mid':'low'}:(!f.hero&&(px<120||q[2]>dCap))||px<44?{...f.style,detail:'low'}:f.style;
  items.push({d:q[2],draw:()=>{drawPlayer(s,f.st.pose,c,style,f.st.place,f.prev,!!f.smear&&!passing);}});}
 let out:{g:Pt;r:number}|null=null;
 if(ball){const bq=toCam(c,ball.P);if(bq[2]>=NEAR)items.push({d:bq[2],draw:()=>{const r=drawBall(s,c,ball.P,ball.rot,ball);if(r)out={g:r.g,r:r.r};}});}
 if(goal){const gq=toCam(c,[1,1.2,0]);items.push({d:Math.max(NEAR,gq[2]),draw:()=>goal3(s,c,goal.bulge,goal.bz,goal.by)});}
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
 return{ball:out};
}
/** the pitch at play time τ (poses on twos): every actor (prev = one drawn frame earlier), the ball, the goal */
function play(s:Sheet,c:Cam,tau:number,tauPrev:number,o:{smear?:boolean;min?:number;lines?:boolean;prevBall?:number;only?:number[]}={}){
 const figs:Fig[]=ACTORS.flatMap((a,k)=>o.only&&!o.only.includes(k)?[]:[k]).map(k=>{const a=ACTORS[k];const st=stateOf(k,tau);const hero=!!a.hero||k===THR;return{st,prev:hero?stateOf(k,tauPrev):undefined,style:a.style,hero,
  smear:o.smear&&((k===JIM&&tau>TJ&&tau<TF+.3)||(k===MOU&&tau>-.25&&tau<.35)||(k===GK&&tau>T_DIVE+.1&&tau<T_DIVE+.7)||(k===THR&&tau>T_REL-.35&&tau<T_REL+.15))};});
 return drawScene(s,c,figs,{P:ballAt(tau),rot:spinAt(tau),min:o.min,lines:o.lines,prevP:o.prevBall!==undefined?ballAt(o.prevBall):null},{bulge:bulgeAt(tau),bz:REST[2],by:.5});
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
/** steps: [start, duration, shot]; each step eases in over the previous result */
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
const at=(k:number,tau:number,y=1):V3=>{const[x,z]=posOf(k,tau);return[x,y,z];};

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time
/** τ from chapter time: real time, anchored so his head meets the ball just after "throws himself" (the cross is struck TF earlier) */
function tau1(t:number){const tH=CUE(0,'throws himself')+.75;return Math.max(T0+.5,t-(tH-TF));}
const P1:V3=[-20,24,-72];
function cam1(t:number):Cam{
 const tau=tau1(t),b=ballAt(tau),tC=CUE(0,'throws himself')+.75-TF;
 return plan(t,[
  [0,0,()=>({P:P1,T:[-18,10,20],fov:38})],
  [CUE(0,'Wolves are losing')-.3,1.4,()=>({P:P1,T:[-13,1,10],fov:17})],
  [CUE(0,'A throw')-.7,1,()=>({P:P1,T:mix3([TP[0],1,TP[1]],[REC[0],.8,REC[2]],.5),fov:7.5})],
  [tC-.9,.6,()=>({P:P1,T:mix3(at(MOU,tau,.9),P0,.5),fov:7.5})],
  [tC+.02,1.1,()=>({P:P1,T:mix3(add3([b[0],0,b[2]],[0,1.1+.3*b[1],0]),[HP[0],1.6,HP[1]],.2+.6*sm(0,TF,tau)),fov:lerp(10,13,sm(0,.9,tau))})],
  [tC+TF-.35,.6,()=>({P:P1,T:[HP[0]+1.2,1.5,HP[1]+.6],fov:8})],
  [CUE(0,'Header')+.4,1.4,()=>{const w=at(JIM,tau,1.1);return{P:P1,T:mix3(w,[-6,1.2,-8],.3),fov:12};}],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tt=twos(t),tau=tau1(tt),tp=tau1(tt-1/12),tL=CUE(0,'Wolves are level'),tN=CUE(0,'Header');
  stadium(s,c,t,[0,1,3],{roar:sm(tN,tN+.5,t),flash:sm(tL-.3,tL+.2,t)*(1-sm(tL+2.2,tL+3,t))});
  ground(s,c);
  play(s,c,tau,tp,{min:17,lines:true,prevBall:tau1(t-.06)});
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return CUE(0,'throws himself')+.7;},
};

/** a projected arrow (shaft + head) along 3D points, in one ink */
function arrow3(s:Sheet,c:Cam,pts:V3[],w:number,ink:string,cov=1){
 const q=pts.map(p=>pr(c,p)).filter((p):p is Pt=>!!p);if(q.length<2)return;
 const e=q[q.length-1],f=q[q.length-2],ang=Math.atan2(e[1]-f[1],e[0]-f[0]),ca=Math.cos(ang),sa=Math.sin(ang),hd=w*2.6;
 const shaft=q.slice(0,-1).concat([[e[0]-ca*hd*.7,e[1]-sa*hd*.7]]);
 const p=ribbon(shaft,w,{taper:.2,pressure:.2,wobble:.8});p.addPath(polyPath([[e[0]+ca*hd*.3,e[1]+sa*hd*.3],[e[0]-ca*hd-sa*hd*.62,e[1]-sa*hd+ca*hd*.62],[e[0]-ca*hd+sa*hd*.62,e[1]-sa*hd-ca*hd*.62]],true));
 s.knockout(p);s.fill(ink,p,cov);s.stroke(K,p,Math.max(2,w*.12),.85);
}
/** a flat dashed ring on the grass */
function groundRing(s:Sheet,c:Cam,P:V3,rad:number,ink:string,a:number,w=.07){
 const X=pr(c,[P[0],.01,P[2]]);if(!X||a<=0)return;const pts:Pt[]=[];for(let i=0;i<28;i++){const u=i/28*TAU,p=pr(c,[P[0]+Math.cos(u)*rad,.01,P[2]+Math.sin(u)*rad]);if(p)pts.push(p);}
 if(pts.length<8)return;const gaps:[number,number][]=[];for(let i=0;i<14;i++)gaps.push([(i+.66)/14,(i+.96)/14]);
 const d=ribbon(pts,Math.max(5,kAt(c,P)*w),{seed:31,close:true,taper:0,wobble:.6,gaps});s.knockout(d,.8*a);s.fill(ink,d,.95*a);
}
/** a dashed "eye-line" from a face to the ball (yellow, navy-edged): the lesson's watch-the-ball mark */
function eyeLine(s:Sheet,c:Cam,from:V3,to:V3,a:number){
 if(a<=0)return;const A=pr(c,from),Bp=pr(c,to);if(!A||!Bp)return;const pts:Pt[]=[];for(let i=0;i<=10;i++){const u=i/10;pts.push([lerp(A[0],Bp[0],u),lerp(A[1],Bp[1],u)]);}
 const gaps:[number,number][]=[];for(let i=0;i<7;i++)gaps.push([(i+.62)/7,(i+.96)/7]);const w=Math.max(5,kAt(c,from)*.028);
 const d=ribbon(pts,w,{seed:51,taper:.1,wobble:.3,gaps});s.stroke(K,d,Math.max(2,w*.3),.85*a);s.knockout(d,a);s.fill(Y,d,.95*a);
}
/** the replay trail: the cross's path so far, a fading yellow ribbon (printed under the players) */
function trail(s:Sheet,c:Cam,tau:number,fade:number){
 if(fade<=0||tau<=0)return;const pts:Pt[]=[];const a=Math.max(0,tau-.8),b=Math.min(tau,TG);for(let i=0;i<=22;i++){const p=pr(c,ballAt(lerp(a,b,i/22)));if(p)pts.push(p);}
 if(pts.length<3)return;const w=Math.max(8,kAt(c,ballAt(Math.min(tau,TG)))*.16);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*fade);
}

// ---------------------------------------------------------------- 2 · the slow-motion replay from low beside the far post, in front of him
const tau2=(t:number)=>key(t,mono([[0,-.9],[CUE(1,'Two defenders'),-.1],[CUE(1,'stronger'),TJ-.05],[CUE(1,'Eyes on the ball'),TF-.1],[CUE(1,'Eyes on the ball')+1,TF-.02],[CUE(1,'past the keeper'),TF+.2],[SECS(1)-.2,TG+.9]]),linear);
const E2:V3=[-14.4,2.9,5.6];
function cam2(t:number):Cam{
 const tau=tau2(t),j=at(JIM,tau,1.4),sk=at(SOK,tau,1.3),ch=at(CHA,tau,1.3);
 return plan(t,[
  [0,0,()=>({P:E2,T:[-8,1.4,-1],fov:40})],
  [CUE(1,'Two defenders')-.3,1,()=>({P:E2,T:mix3(j,mix3(sk,ch,.5),.35),fov:17})],
  [CUE(1,'stronger')-.2,.9,()=>({P:add3(E2,[0,.2,0]),T:mix3(j,[HP[0],1.9,HP[1]],.5),fov:13})],
  [CUE(1,'Eyes on the ball')-.3,.8,()=>({P:add3(E2,[0,.2,0]),T:add3(mix3(HEAD_PT,ballAt(tau),.25),[0,-.25,0]),fov:10.5})],
  [CUE(1,'past the keeper')-.3,.9,()=>({P:add3(E2,[0,.3,0]),T:mix3(HEAD_PT,[-1,.8,-1.8],.3+.5*sm(TF,TG,tau)),fov:lerp(9,24,sm(TF,TG+.2,tau))})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tt=twos(t),tau=tau2(tt),tp=tau2(tt-1/12),tD=CUE(1,'Two defenders'),tS=CUE(1,'stronger'),tE=CUE(1,'Eyes on the ball');
  stadium(s,c,t,[0,1,2],{roar:sm(TG,TG+.4,tau),flash:sm(TG+.05,TG+.3,tau)});
  ground(s,c);
  trail(s,c,tau,1-sm(TG+.1,TG+.5,tau));
  // the replay graphics: red rings under the two defenders, a yellow ring under Jiménez ("that's him") until he takes off
  const dr=sm(tD-.3,tD+.2,t)*(1-sm(TJ-.1,TJ+.15,tau));groundRing(s,c,at(SOK,tau,0),.7,R,dr,.12);groundRing(s,c,at(CHA,tau,0),.7,R,dr,.12);
  groundRing(s,c,at(JIM,tau,0),.8,Y,sm(tS-.3,tS+.1,t)*(1-sm(TJ-.1,TJ+.1,tau)),.16);
  const r=play(s,c,tau,tp,{smear:true,min:10});
  // "Eyes on the ball": the eye-line from his face to the ball, all the way in
  const st=stateOf(JIM,tau),skj=solve(st.pose,B_JIM,st.place);eyeLine(s,c,skj.face,ballAt(tau),sm(tE-.2,tE+.2,t)*(1-sm(TF-.02,TF+.06,tau)));
  // the touch: a spark on his forehead at contact
  const hit=(tau-TF)/.18;if(hit>0&&hit<1&&r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],Math.max(40,r.ball.r*4.5),{n:9,seed:17,g:easeOutBack(clamp(hit*2))*(1-clamp((hit-.5)*2)),width:Math.max(5,r.ball.r*.5)});
 },
 aperture(t){const c=cam2(t),P=ballAt(tau2(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return CUE(1,'Eyes on the ball')+.6;},
};

// ---------------------------------------------------------------- 3 · how he does it: a demonstration on a training pitch (NOT a match)
/** the demo on its own clock σ (0 = the teammate's cross): a cross from Jiménez's right, a header DOWN that bounces in front of the line */
const D_TF=1.25,D_TB=D_TF+.3,D_TG=D_TB+.17;
const D_HP:[number,number]=[-7.4,.3];
const D_P0:V3=[-14.2,BALL_R,15.2];
const D_FACE:[number,number]=(()=>{const a=nrm2(D_P0[0]-D_HP[0],D_P0[2]-D_HP[1]),b=nrm2(-D_HP[0],-.8-D_HP[1]);return nrm2(a[0]+b[0]*1.05,a[1]+b[1]*1.05);})(),D_YAW=yawTo(D_FACE[0],D_FACE[1]);
const D_HEAD:V3=foreheadBall(D_HP,D_YAW);
const D_BOUNCE:V3=[-1.9,BALL_R,-.75],D_LINE:V3=[0,.62,-.95],D_NET:V3=[1.5,.5,-1.05],D_REST:V3=[1.1,BALL_R,-1.05];
const D_SWING:V3=[.4,-GRAV,0];
const D_VC=launch(D_P0,D_HEAD,D_TF,D_SWING),D_VH=launch(D_HEAD,D_BOUNCE,D_TB-D_TF,G3),D_VB=launch(D_BOUNCE,D_LINE,D_TG-D_TB,G3);
const D_DC=nrm2(D_VC[0],D_VC[2]),D_YAWM=yawTo(D_DC[0],D_DC[1]);
const D_PCM:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r'}),{height:1.78},{x:0,z:0,yaw:D_YAWM});return[D_P0[0]-D_DC[0]*.12-sk.rToe[0],D_P0[2]-D_DC[1]*.12-sk.rToe[2]];})();
function dBall(sg:number):V3{
 if(sg<=0)return D_P0;if(sg<D_TF)return flyA(D_P0,D_VC,D_SWING,sg);if(sg<D_TB)return flyA(D_HEAD,D_VH,G3,sg-D_TF);if(sg<D_TG)return flyA(D_BOUNCE,D_VB,G3,sg-D_TB);
 if(sg<D_TG+.14)return mix3(D_LINE,D_NET,easeOut((sg-D_TG)/.14));const u=clamp((sg-D_TG-.14)/.5);return[lerp(D_NET[0],D_REST[0],u),Math.max(BALL_R,lerp(D_NET[1],BALL_R,u*u)),lerp(D_NET[2],D_REST[2],u)];
}
const D_TJ=D_TF-CU*HD;
/** Jiménez in the demo: a ready stance watching the teammate (a small bounce), two steps in, the header, a clenched-fist landing */
function dJim(sg:number):State{
 const start:[number,number]=[D_HP[0]-D_FACE[0]*1.3-.4,D_HP[1]-D_FACE[1]*1.3],u=sm(-.6,D_TJ-.05,sg),x=lerp(start[0],D_HP[0],u),z=lerp(start[1],D_HP[1],u);
 const b=.5+.5*Math.sin(sg*6);let pose=blendPose(stand(),posed({lHipF:26,rHipF:20,lKnee:34,rKnee:30,lean:14,pitch:4,neckP:-4,lShA:24,rShA:22,lElb:50,rElb:50,air:.02*b}),.6);
 const run=runCycle((sg+.6)*1.6,{speed:.35});pose=blendPose(pose,run,win(sg,-.6,D_TJ,.25));
 if(sg>D_TJ-.3){pose=blendPose(pose,jimHeader((sg-D_TJ)/HD),sm(D_TJ-.3,D_TJ,sg));}
 if(sg>D_TJ+HD){pose=blendPose(pose,posed({lHipF:14,rHipF:14,lKnee:20,rKnee:20,lean:6,rShF:60,rShA:30,rElb:130,lShA:20,lElb:40,neckP:-10}),sm(D_TJ+HD,D_TJ+HD+.5,sg));}
 let yaw=yawTo(D_P0[0]-x,D_P0[2]-z);yaw=lerpAng(yaw,D_YAW,sm(-.4,D_TJ-.1,sg));if(sg>D_TG+.4)yaw=lerpAng(D_YAW,yawTo(1,-.2),sm(D_TG+.4,D_TG+1.2,sg));
 return{pose,place:{x,z,yaw}};
}
/** the teammate: stands over the ball, a short run-up and a RIGHT-footed cross */
function dMate(sg:number):State{
 const k=(u:number):[number,number]=>[D_PCM[0]+D_DC[0]*u,D_PCM[1]+D_DC[1]*u],L=[D_DC[1],-D_DC[0]];
 const r0:[number,number]=[D_PCM[0]-D_DC[0]*2.6+L[0]*1.2,D_PCM[1]-D_DC[1]*2.6+L[1]*1.2];
 const u=sm(-1.1,-.5,sg),v=sm(-.5,0,sg,linear),w=sm(0,.7,sg),pos:[number,number]=sg<-.5?[lerp(r0[0],k(-1.6)[0],u),lerp(r0[1],k(-1.6)[1],u)]:sg<0?[lerp(k(-1.6)[0],k(0)[0],v),lerp(k(-1.6)[1],k(0)[1],v)]:[lerp(k(0)[0],k(.9)[0],w),lerp(k(0)[1],k(.9)[1],w)];
 let pose=stand();pose=blendPose(pose,runCycle((sg+1.2)*1.5,{speed:.4}),win(sg,-1.2,-.4,.25));pose=blendPose(pose,strike(clamp(sg/1.0+STRIKE_CONTACT),{foot:'r'}),win(sg,-.55,.85,.2));
 return{pose,place:{x:pos[0],z:pos[1],yaw:D_YAWM}};
}
/** a floodlit training ground at dusk: navy sky, a dark tree line and fence, four lamp posts, green grass with a box marked out, a few cones */
function trainingGround(s:Sheet,c:Cam){
 s.field(K,.74,.5);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]));if(hz){s.tone(R,polyPath([[-1e4,hz[1]-420],[1e4,hz[1]-420],[1e4,hz[1]+60],[-1e4,hz[1]+60]],true),.12);s.tone(Y,polyPath([[-1e4,hz[1]-200],[1e4,hz[1]-200],[1e4,hz[1]+60],[-1e4,hz[1]+60]],true),.1);}
 // the tree line: a bumpy navy band far behind each side
 const trees=new Path2D();for(const[side,sgn] of [[0,1],[1,-1],[2,1]] as [number,number][]){const pts:V3[]=[];
  if(side===2){for(let i=0;i<=26;i++){const z=lerp(-70,70,i/26);pts.push([28,4+6*hash(i,33)+3*hash(i*3,34),z]);}pts.push([28,0,70],[28,0,-70]);}
  else{const zz=sgn*52;for(let i=0;i<=40;i++){const x=lerp(-110,30,i/40);pts.push([x,5+7*hash(i+side*50,31)+3*hash(i*3+side,32),zz]);}pts.push([30,0,zz],[-110,0,zz]);}
  addPoly(trees,polyP(c,pts));}
 s.knockout(trees,.7);s.fill(K,trees,.95);s.tone(G,trees,.3);
 const g=polyP(c,[[-110,0,-52],[28,0,-52],[28,0,52],[-110,0,52]]);if(g.length>2){const gp=polyPath(g,true);s.knockout(gp);s.fill(G,gp,.9);s.tone(K,gp,.14);
  const st=new Path2D();for(let k=0;k<16;k+=2)addPoly(st,polyP(c,[[-k*6,0,-40],[-(k+1)*6,0,-40],[-(k+1)*6,0,40],[-k*6,0,40]]));s.tone(Y,st,.2);}
 // a low fence behind the goal
 const fence=new Path2D();seg3(c,[9,1.1,-40],[9,1.1,40],.08,fence);for(let k=0;k<=16;k++)seg3(c,[9,0,-40+k*5],[9,1.2,-40+k*5],.08,fence);s.fill(K,fence,.8);
 // lamp posts with yellow haloes
 const post=new Path2D(),halo=new Path2D(),lamp=new Path2D();for(const[x,z] of [[-40,-46],[6,-46],[-40,46],[6,46]] as [number,number][]){seg3(c,[x,0,z],[x,16,z],.35,post);const q=pr(c,[x,16.4,z]);
  if(q){const r=clamp(kAt(c,[x,16,z])*3.2,8,160);halo.moveTo(q[0]+r,q[1]);halo.ellipse(q[0],q[1],r,r*.7,0,0,TAU);const r2=r*.28;lamp.moveTo(q[0]+r2,q[1]);lamp.ellipse(q[0],q[1],r2,r2*.6,0,0,TAU);}}
 s.fill(K,post,.9);s.knockout(halo,.2);s.tone(Y,halo,.4);s.knockout(lamp);s.fill(Y,lamp,.85);
 const ln=new Path2D();pitchLines(c,ln,false);s.knockout(ln);
 // training cones along the edge of the box
 const cone=new Path2D();for(const[x,z] of [[-16.5,-6],[-16.5,-2],[-16.5,2],[-16.5,6],[-12,12]] as [number,number][]){const a=pr(c,[x,.3,z]),b=pr(c,[x,0,z]);if(a&&b){const w=Math.max(3,kAt(c,[x,0,z])*.14);cone.addPath(polyPath([[a[0],a[1]],[b[0]+w,b[1]],[b[0]-w,b[1]]],true));}}
 s.knockout(cone);s.fill(Y,cone,.9);s.tone(R,cone,.35);
}
const tau3=(t:number)=>key(t,mono([[0,-2.6],[CUE(2,'Watch the ball')-.1,-.05],[CUE(2,'forehead'),D_TF-.06],[CUE(2,'forehead')+.9,D_TF+.01],[CUE(2,'aim down'),D_TF+.04],[CUE(2,'towards the goal')+.2,D_TG+.1],[SECS(2),D_TG+2.4]]),linear);
function cam3v(t:number):Cam{
 const sg=tau3(t),j=dJim(sg),sk=solve(j.pose,B_JIM,j.place),head=sk.head,fr:V3=[D_FACE[0],0,D_FACE[1]];
 const st0:[number,number]=[D_HP[0]-D_FACE[0]*1.3-.4,D_HP[1]-D_FACE[1]*1.3],md=nrm2(D_P0[0]-st0[0],D_P0[2]-st0[1]);
 /** close, three-quarter front: in front of him toward the teammate, a little to the goal side */
 const closeP:V3=[st0[0]+md[0]*2.6+md[1]*1.3,1.8,st0[1]+md[1]*2.6-md[0]*1.3];
 return plan(t,[
  [0,0,()=>({P:closeP,T:add3(head,[0,-.14,0]),fov:18})],
  [CUE(2,'still scores')-.2,1.1,()=>({P:[-3.4,2.3,-9.8],T:[-8.4,1.2,1.4],fov:44})],
  [CUE(2,'Watch the ball')+.2,.9,()=>({P:[-4.2,2,-7.4],T:mix3(head,dBall(sg),.3),fov:25})],
  [CUE(2,'forehead')-.3,.7,()=>({P:[-5,2.1,-4.6],T:mix3(D_HEAD,head,.4),fov:13})],
  [CUE(2,'aim down')-.1,1,()=>({P:[-8.4,2.4,-7.4],T:[-2.6,.9,-.6],fov:33})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tt=twos(t),sg=tau3(tt),sp=tau3(tt-1/12),tW=CUE(2,'Watch the ball'),tF=CUE(2,'forehead'),tA=CUE(2,'aim down');
  trainingGround(s,c);
  const J=dJim(sg),Jp=dJim(sp),M=dMate(sg),Mp=dMate(sp),P=dBall(sg);
  // "aim down": the target — a red ring where the ball should bounce, just in front of the goal line
  const aim=sm(tA-.2,tA+.3,t);groundRing(s,c,D_BOUNCE,.55,R,aim*(1-sm(SECS(2)-.4,SECS(2),t)),.1);
  const sk=solve(J.pose,B_JIM,J.place);
  const items:Item[]=[{d:toCam(c,[M.place.x!,1,M.place.z!])[2],draw:()=>drawPlayer(s,M.pose,c,MATE_ST,M.place,{pose:Mp.pose,place:Mp.place},sg>-.25&&sg<.35)},
   {d:toCam(c,[J.place.x!,1,J.place.z!])[2],draw:()=>drawPlayer(s,J.pose,c,JIM_NOW,J.place,{pose:Jp.pose,place:Jp.place},sg>D_TJ&&sg<D_TF+.3)},
   {d:1e4,draw:()=>goal3(s,c,sg<D_TG+.08?0:Math.exp(-(sg-D_TG-.08)*2.4)*(1+.3*Math.sin((sg-D_TG)*14)),-1,.6)}];
  let ball:{g:Pt;r:number}|null=null;
  items.push({d:toCam(c,P)[2],draw:()=>{const r=drawBall(s,c,P,sg*TAU*3,{min:9,lines:true,prevP:dBall(tau3(t-.06))});if(r)ball={g:r.g,r:r.r};}});
  items.filter(i=>i.d>NEAR).sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
  // "Watch the ball": the eye-line from his face to the ball until it meets his forehead
  eyeLine(s,c,sk.face,P,sm(tW-.1,tW+.3,t)*(1-sm(D_TF-.02,D_TF+.06,sg)));
  // "forehead": a yellow ring on the ball as it meets the forehead, and the spark
  const fh=sm(tF-.25,tF+.1,t)*(1-sm(tA-.1,tA+.3,t));const bl=ball as {g:Pt;r:number}|null;
  if(fh>0&&bl){const g=bl.g,rr=bl.r*1.9,ring:Pt[]=[];for(let i=0;i<28;i++){const a=i/28*TAU;ring.push([g[0]+Math.cos(a)*rr,g[1]+Math.sin(a)*rr]);}const rp=ribbon(ring,Math.max(5,bl.r*.28),{seed:8,close:true,wobble:.8,pressure:.2});s.knockout(rp,.9*fh);s.fill(Y,rp,.95*fh);}
  const hit=(sg-D_TF)/.2;if(hit>0&&hit<1&&bl)sparkBurst(s,Y,bl.g[0],bl.g[1],Math.max(50,bl.r*4.5),{n:9,seed:23,g:easeOutBack(clamp(hit*2))*(1-clamp((hit-.5)*2)),width:Math.max(6,bl.r*.5)});
  // "aim down towards the goal": the arrow from his forehead down to the bounce, then on into the net; a burst where it bounces
  const ar=sm(tA-.1,tA+.9,t,easeInOutSine)*(1-sm(SECS(2)-.5,SECS(2),t));
  if(ar>0){const q:V3[]=[];for(let i=0;i<=8;i++)q.push(flyA(D_HEAD,D_VH,G3,(D_TB-D_TF)*ar*i/8));arrow3(s,c,q,Math.max(8,kAt(c,D_HEAD)*.05),Y,.95);}
  const bb=(sg-D_TB)/.3;if(bb>0&&bb<1){const q=pr(c,D_BOUNCE);if(q)sparkBurst(s,Y,q[0],q[1],Math.max(40,kAt(c,D_BOUNCE)*.5),{n:8,seed:44,g:easeOutBack(clamp(bb*2))*(1-clamp((bb-.5)*2)),width:8});}
 },
 get still(){return CUE(2,'aim down')+.8;},
};

const film:RisoStory={
 id:'raul-jimenez-signature',format:'11v11',title:"Jiménez's header",
 theme:'The striker\'s header: watch the ball all the way onto your forehead and aim it down towards the goal',
 ageNote:'Arsenal 1–1 Wolves, Premier League, the Emirates, 2 November 2019 — then a "how he does it" demonstration. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',green:'#00a95c',navy:'#22366b'},order:['yellow','red','green','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3]);},
 /** Touch: a little header — a ball drops in from above, a yellow spark where it is met, and it is nodded down and away. Reduced motion: the spark. */
 touch(s,x,y,age,seed){
  const r=rng(seed);if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}
  const u=clamp(age/.3),out=clamp((age-.3)/.4),fade=1-clamp((age-.6)/.2);
  const bx=age<.3?x-160*(1-u):x+170*easeOut(out),by=age<.3?y-120*(1-u)*(1-u):y+90*out;
  if(age>.26&&age<.6)sparkBurst(s,Y,x,y,110,{n:9,seed:seed+1,g:easeOutBack(clamp((age-.26)/.12))*(1-clamp((age-.46)/.14)),width:14});
  if(fade>0)footballPanels(s,bx,by,30,{rot:age*14+r()*TAU,key:K,shadow:K,seed:5});
 },
};
export default film;
/** Solved contact points (pitch metres; Arsenal's goal line x = 0, +z = Wolves' right) — checked by tests/play-film-raul-jimenez-signature.cjs. */
export const FACTS={P0,REC,TP,HEAD_PT,HP,GOAL_PT,TF,TG,T_REL,T_REC,ballAt,crossFoot:'r' as const,
 headguardInMatch:[JIM_ST,MOU_ST,JOT_ST].some(st=>HEADGUARD.has(st)),headguardInDemo:HEADGUARD.has(JIM_NOW),
 moutinhoContact:()=>{const st=stateOf(MOU,0),sk=solve(st.pose,B_MOU,st.place);return{lToe:sk.lToe,rToe:sk.rToe};},
 jimenezAt:(tau:number)=>{const st=stateOf(JIM,tau),sk=solve(st.pose,B_JIM,st.place);return{head:sk.head,face:sk.face,air:st.pose.air,pelvis:sk.pelvis};},
 defenderAt:(which:'sok'|'cha',tau:number)=>{const k=which==='sok'?SOK:CHA,st=stateOf(k,tau),sk=solve(st.pose,which==='sok'?B_SOK:B_CHA,st.place);return{head:sk.head,pelvis:sk.pelvis};},
 lenoAt:(tau:number)=>{const st=stateOf(GK,tau),sk=solve(st.pose,B_LEN,st.place);return{lHa:sk.lHa,rHa:sk.rHa,pelvis:sk.pelvis};},
 demo:{D_TF,D_TB,D_HEAD,D_BOUNCE,D_LINE,dBall,jimAt:(sg:number)=>{const st=dJim(sg),sk=solve(st.pose,B_JIM,st.place);return{face:sk.face,head:sk.head,air:st.pose.air};},
  mateContact:()=>{const st=dMate(0),sk=solve(st.pose,{height:1.78},st.place);return{lToe:sk.lToe,rToe:sk.rToe};}}};
