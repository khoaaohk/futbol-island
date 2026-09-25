/** Vinícius Júnior — "Signature: the lightning dribble from the left" (lib/town/iconicPlays.json, kind "signature"). The film recreates ONE
 * real moment that shows it: his goal in Borussia Dortmund 0–2 Real Madrid, UEFA Champions League final, Saturday 1 June 2024, Wembley
 * Stadium, London (83rd minute, 1–0 up). An iconic-play riso film (RisoStory, chapters mode) played by the card's picture window
 * (components/CardFilmPlayer.tsx) or StoryFilmPlayer: a 1:1 reconstruction from WRITTEN accounts (the broadcast footage itself was not
 * reviewed), rendered as a riso print.
 *
 * WHY THIS MOMENT: the signature is a sudden change of speed down the LEFT that leaves defenders behind. Of the two candidate final goals,
 * the 2022 winner v Liverpool was a far-post tap-in from Valverde's low cross (Guardian: "timing his run in behind Alexander-Arnold, had a
 * tap-in") — no dribble at all. The 2024 goal is the left-sided burst: Bellingham steals Maatsen's blind pass and rolls it into Vinícius's
 * PATH, he takes ONE touch down the inside-left channel at full speed and finishes past Kobel. The same second half the Guardian logged the
 * signature itself ("73 min: Vinicius Junior zips past Ryerson on the left"; Hytner: "flicking on the afterburners, making his moves,
 * including a jaw-dropping stop-and-go nutmeg on Ryerson"), and Wikipedia's player article describes exactly this trait ("explosive
 * acceleration ... ability to run at defences, change direction quickly, and beat opponents in one on one situations"). It shares its
 * match, stadium, kits and pitch orientation with carvajal-header-2024.ts (the 74th-minute goal), read-only, for continuity.
 *
 * SOURCES (read Sept 2026 with curl, cached under the build scratchpad films/src-cache/):
 *  - The Guardian, Scott Murray, "Borussia Dortmund 0–2 Real Madrid: Champions League final 2024 – as it happened", 1 June 2024: "GOAL!
 *    Borussia Dortmund 0-2 Real Madrid (Vinicius Junior 83) Maatsen plays an awful blind pass across the face of his own box from the
 *    Dortmund left. Bellingham intercepts and rolls the ball into the path of Vinicius Junior, who takes a touch down the inside-left channel
 *    before bundling the ball past Kobel and in"; photo captions "Vinicius Junior fires home", "Then wheels away in celebration", "Then is
 *    joined in the celebrations by Rodrygo"; 73 min (above); Vinícius played "with heavy flu"; subbed off 90+4.
 *    https://www.theguardian.com/football/live/2024/jun/01/borussia-dortmund-v-real-madrid-champions-league-final-2024-live
 *  - The Guardian, David Hytner, match report, 1 June 2024: "Ian Maatsen played a loose pass to Bellingham and he released Vinícius, who was
 *    never going to miss"; the afterburners / stop-and-go nutmeg line (above).
 *  - UEFA.com, Mark Pettit, "Real Madrid win Champions League: Carvajal and Vinícius Júnior see off Dortmund", 1 June 2024 (web.archive.org):
 *    "83': Vinícius Júnior sweeps in Madrid's second"; "receiving Bellingham's pass and sweeping his finish across Kobel to seal a 15th
 *    European crown"; "first Brazilian to score in two different European Cup/Champions League finals"; line-ups.
 *  - Sporting News, Brad Cox, final report + live blog, 1–2 June 2024 (web.archive.org): Vinícius "lifted the ball over Gregor Kobel after
 *    Jude Bellingham picked him out on the left side of the penalty area"; "He stroked home from the left past Kobel ... after Maatsen's
 *    error"; "84th minute: ... Vinicius Jr who strokes past Kobel brilliantly".
 *  - Wikipedia, "2024 UEFA Champions League final" (raw wikitext): "In the 83rd minute, Maatsen played a pass that was intercepted by
 *    Bellingham, who teed up Vinícius to his left, with the latter taking a touch and putting the ball past Kobel"; kits (Dortmund F7E503
 *    yellow shirts, black shorts, yellow socks; Real Madrid all white); numbers Vinícius 7, Bellingham 5, Rodrygo 11, Kobel 1, Maatsen 22,
 *    Ryerson 26, Hummels 15, Schlotterbeck 4, Sabitzer 20; Madrid's 15th title. https://en.wikipedia.org/wiki/2024_UEFA_Champions_League_final
 *  - Wikipedia, "Vinícius Júnior" (raw wikitext): height 1.76 m; "zippy left winger"; the playing-style paragraph quoted above.
 * CONFIRMED: date, Wembley, 83rd minute, Madrid already 1–0 up (Carvajal 74'); Maatsen's blind pass across the face of his own box from
 *  the Dortmund LEFT; Bellingham intercepted and rolled it into Vinícius's path, to Bellingham's LEFT; Vinícius on the LEFT side of the
 *  penalty area / inside-left channel; ONE touch, then the finish past Kobel ("sweeps ... across Kobel" — UEFA); he wheeled away and
 *  Rodrygo joined him; Madrid's 15th European Cup; kits and numbers as above.
 * INFERRED (illustrative reconstruction, never named in the narration): every position, run, speed and timing in metres and seconds (the
 *  pass ≈ 13 m in 1.2 s; the steal ≈ 18 m out; the lay-off ≈ 11 m; the touch ≈ 3.3 m; the shot from ≈ 12 m, 7.5 m left of centre, ≈ .7 s
 *  to the line); that Vinícius was jogging before the steal and burst after it; his FOOT for the touch and the finish (drawn RIGHT: his
 *  stronger foot, not confirmed in the fetched sources — the narration never names a foot); the finish's height and exact corner (the
 *  accounts differ: "sweeps across", "lifted over", "bundling past" — drawn as a low, sweeping shot across Kobel into the far, right-hand
 *  side of the net, the reading of UEFA's line); Kobel coming off his line and his late dive; Maatsen's LEFT-footed pass; which Dortmund
 *  player the pass was meant for (drawn: an unnamed midfielder); where Ryerson, Hummels and Schlotterbeck were (drawn chasing, too late);
 *  the heights of Bellingham (1.86), Kobel (1.94), Hummels (1.91), Ryerson (1.83), Maatsen (1.70) — not in the fetched sources; hair, skin
 *  screens, kit trims and number colours; Kobel's keeper kit (printed red, as in carvajal-header-2024); which end (kept identical to the
 *  Carvajal film: the main camera on Madrid's LEFT, so the goal comes on the NEAR side, and the arch over the far stand); the dusk sky; the
 *  celebration run toward the near touchline; every camera placement and lens.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in REAL TIME (Wembley at dusk → the stray pass → the steal →
 * the burst → the finish → he wheels away toward us); ch2 = the slow-motion replay from LOW BEHIND VINÍCIUS on the left, tracking with him
 * (the lay-off rolling into his path, the change of gear, the one touch), a riso replay trail; ch3 = a second replay from HIGH BEHIND THE
 * GOAL on the far side: the finish sweeps across Kobel's late dive toward the camera into the far corner, then he wheels away; ch4 = the
 * lesson from the near touchline: his footprints printed along the run, short navy strides for the jog, long yellow strides for the burst,
 * a ring on the one touch, and the defenders left a step behind. Composed on the FULL sheet (world units = sheet units centred on the
 * canvas; never sheet.safe), so it frames from the 1.45:1 card window down to square (a narrower window widens the lens a little).
 * FIGURES: every body goes through ONE adapter, drawPlayer() → athlete.ts (continuous silhouettes, FK skeleton, full range of motion, `prev`
 * secondary motion for hair and hems, motionSmear on the burst, the touch, the shot and the dive). Handedness: the world is right-handed
 * (x toward Dortmund's goal, y up, +z = Madrid's right), exactly athlete.ts's convention, so strike({foot:'r'}) is the RIGHT foot; Madrid's
 * left (Vinícius's wing) is −z; the Dortmund left (Maatsen's side) is +z. Kobel faces −x/−z toward the shot, so his dive to his LEFT
 * (keeperDive side 'l') goes toward +z, the far post. Inks: yellow, red, blue, navy. Everything is keyed to cue times (withTiming swaps in
 * the recorded word onsets), poses on twos, cameras on ones; all randomness seeded. Heat: small figures print at 'low', at most 4 non-hero
 * figures at full detail, every figure inside a passage is capped; ≈ 150–330 plate ops a frame. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,stand,keeperSet,keeperDive,celebrate,posed,blendPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3,type Build} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES (≈2.7 words/s + punctuation pauses) until the Kokoro voice exists. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'Wembley, 2024',text:'Wembley, 2024, the Champions League final. Real Madrid lead one–nil. Then a Dortmund pass goes astray... Bellingham steals it, Vinícius Júnior is away... two–nil!',tail:2.4,
  cues:['Wembley','Champions League final','Real Madrid lead','Dortmund pass','Bellingham steals','Vinícius Júnior','away','two–nil']},
 {label:'Watch it again',text:"Watch again, slowly. Bellingham rolls it into Vinícius's path. See him change gear: one quick touch, and he's clear!",tail:1.6,
  cues:['Watch again','rolls it',"Vinícius's path",'change gear','one quick touch',"he's clear"]},
 {label:'Across the keeper',text:'From behind the goal: he sweeps it across the keeper, into the far corner! Real Madrid win their fifteenth European Cup!',tail:2.2,
  cues:['From behind','sweeps it','across the keeper','far corner','fifteenth']},
 {label:'Change your speed',text:'Change your speed! Jog, then burst. Quick feet and a sudden sprint get you past defenders!',tail:2,
  cues:['Change your speed','Jog','burst','Quick feet','sudden sprint','past defenders']},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/vinicius-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/vinicius-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/vinicius-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('vinicius: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('vinicius: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
/** key() needs increasing times: push each key at least `gap` after the previous one (real voice timings can crowd authored offsets) */
function mono(K:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of K)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}

// ---------------------------------------------------------------- inks, vectors
const Y='yellow',R='red',B='blue',K='navy';
const DEG=Math.PI/180;
const add3=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const mix3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const wrap=(a:number)=>{while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;return a;};
const lerpAng=(a:number,b:number,u:number)=>a+wrap(b-a)*u;
/** yaw (athlete.ts: 0 faces +x, + turns left) facing the ground direction (dx,dz) */
const yawTo=(dx:number,dz:number)=>Math.atan2(-dz,dx);
const nrm2=(x:number,z:number):[number,number]=>{const l=Math.hypot(x,z)||1;return[x/l,z/l];};
/** a narrower (square) window gets a slightly wider lens so the action still fits; set by frame(), read by every camera (also aperture()) */
let LENS=1;
/** Frame the FULL sheet: world (0,0) on the canvas centre at 1 unit per sheet unit (the passage arrival scale still multiplies in). */
function frame(s:Sheet){const S=s.arrival;s.camera((s.cx-s.W/2)/S,(s.cy-s.H/2)/S,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
/** half the visible extents with margin for the .68 passage preview */
const view=(s:Sheet)=>({hx:s.W/(2*.68)+120,hy:s.H/(2*.68)+120});

// ---------------------------------------------------------------- 3D: projection through an athlete.ts Camera (right-handed metres, y up)
/** Pitch: Dortmund's goal line is x = 0 (Madrid attack +x), goal centre z = 0, +z = Madrid's right; touchlines z = ±34, halfway x = −52.5. */
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

// ---------------------------------------------------------------- Wembley at dusk (the same bowl as carvajal-header-2024: same night)
const CX=-52.5;
/** stand planes (a along, b up the rake 0..1): 0 the far side (+z, under the arch), 1 behind Dortmund's goal (+x), 2 the main stand (−z,
 * the camera side), 3 the other end */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-122,17,a),1.2+40*b,43+40*b],
 (a,b)=>[9+38*b,1.2+40*b,lerp(62,-62,a)],
 (a,b)=>[lerp(17,-122,a),1.2+36*b,-43-36*b],
 (a,b)=>[-114-38*b,1.2+40*b,lerp(-62,62,a)],
];
const STAND_COLS=[110,76,110,76],STAND_ROWS=18;
const FASCIA:[number,number][]=[[.3,.36],[.6,.66]];
/** the arch: a 315 m span rising 133 m, leaning back over the far stand (side inferred) */
const ARCH:V3[]=Array.from({length:33},(_,i)=>{const u=i/32,y=133*(1-Math.pow(2*u-1,2));return[CX+(u-.5)*315,y,80+y*Math.tan(22*DEG)];});
/** crowd colour weights per stand: [paper (Madrid white), yellow (Dortmund), navy (Dortmund black), red (seats, scarves)] */
const CROWD_MIX:[number,number,number,number][]=[[.42,.34,.14,.1],[.3,.46,.16,.08],[.42,.34,.14,.1],[.5,.28,.12,.1]];
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 s.field(K,.72,.5);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz){s.tone(B,polyPath([[-1e4,hz[1]-1100],[1e4,hz[1]-1100],[1e4,hz[1]+60],[-1e4,hz[1]+60]],true),.3);s.tone(R,polyPath([[-1e4,hz[1]-420],[1e4,hz[1]-420],[1e4,hz[1]+60],[-1e4,hz[1]+60]],true),.1);}
 {const pts:Pt[]=[];let ok=true;for(const p of ARCH){const q=toCam(c,p);if(q[2]<8){ok=false;break;}pts.push(scr(c,q));}
  if(ok&&pts.length>2){const w=clamp(7.4*c.F/toCam(c,ARCH[16])[2],3,60),tube=ribbon(pts,w,{taper:.15,wobble:.4,pressure:0});s.knockout(tube,.85);s.tone(B,tube,.12);
   const tick=new Path2D();for(let i=1;i<pts.length-1;i++){const a=pts[i-1],b=pts[i+1],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1,nx=-dy/l*w*.5,ny=dx/l*w*.5;tick.moveTo(pts[i][0]-nx,pts[i][1]-ny);tick.lineTo(pts[i][0]+nx+dx/l*w*.4,pts[i][1]+ny+dy/l*w*.4);}
   s.stroke(K,tick,Math.max(1.5,w*.08),.45);}}
 const planes=new Path2D(),fas=new Path2D(),roof=new Path2D(),edge=new Path2D();
 for(const i of which){const S=STANDS[i];addPoly(planes,polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]));for(const[b0,b1] of FASCIA)addPoly(fas,polyP(c,[S(0,b0),S(1,b0),S(1,b1),S(0,b1)]));
  addPoly(roof,polyP(c,[add3(S(0,1),[0,1.5,0]),add3(S(1,1),[0,1.5,0]),add3(S(1,.86),[0,11,0]),add3(S(0,.86),[0,11,0])]));
  seg3(c,add3(S(0,.86),[0,10.8,0]),add3(S(1,.86),[0,10.8,0]),.45,edge);}
 s.knockout(planes);s.tone(R,planes,.5);s.tone(K,planes,.42);s.knockout(fas);s.fill(K,fas,.85);s.tone(Y,fas,.18);
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si],mx=CROWD_MIX[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(FASCIA.some(([b0,b1])=>b>b0-.02&&b<b1+.02))continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,6);if(h<.22)continue;const a=(i+.5+(hash(i+j*31,8)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const u=(h-.22)/.78,ink=u<mx[0]?0:u<mx[0]+mx[1]?1:u<mx[0]+mx[1]+mx[2]?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.8);s.knockout(inks[1],.7);s.fill(Y,inks[1],.95);s.fill(K,inks[2],.9);s.knockout(inks[3],.7);s.fill(R,inks[3],.95);
 s.knockout(roof);s.fill(K,roof,.95);s.knockout(edge,.7);
 const lamp=new Path2D(),halo=new Path2D();for(const i of which){const S=STANDS[i];for(let k=0;k<7;k++){const u=(k+.5)/7,a=add3(S(u-.025,.86),[0,10,0]),b=add3(S(u+.025,.86),[0,10,0]),m=mix3(a,b,.5);if(toCam(c,m)[2]<NEAR+2)continue;seg3(c,a,b,1.1,lamp);
  const g=pr(c,m);if(g){const r=clamp(kAt(c,m)*4.5,8,140);halo.moveTo(g[0]+r,g[1]);halo.ellipse(g[0],g[1],r,r*.62,0,0,TAU);}}}
 s.knockout(halo,.22);s.tone(Y,halo,.4);s.knockout(lamp);s.fill(Y,lamp,.75);
 if(flash>0){const p=new Path2D(),n=Math.round(24*flash);for(let i=0;i<n;i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,STANDS[si](r2,.1+.8*hash(i,Math.floor(tt*12))));if(!q)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.6);}
}
// ---------------------------------------------------------------- grass under the floodlights, lines, boards, corner flags
function ground(s:Sheet,c:Cam){
 const g=polyP(c,[[-118,0,-46],[13,0,-46],[13,0,46],[-118,0,46]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.88);s.tone(B,gp,.7);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]));s.tone(B,st,.2);
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([5.5,0,-38],[5.5,0,38]);board([-110,0,-38],[5.5,0,-38]);board([-110,0,38],[5.5,0,38]);
 for(let k=0;k<12;k++){const z=-36+k*6.2;addPoly(pn,polyP(c,[[5.4,.25,z],[5.4,.25,z+3.3],[5.4,.68,z+3.3],[5.4,.68,z]]));}
 for(const zz of[-37.9,37.9])for(let k=0;k<18;k++){const x=-108+k*6.4;addPoly(pn,polyP(c,[[x,.25,zz],[x+3.4,.25,zz],[x+3.4,.68,zz],[x,.68,zz]]));}
 s.knockout(bd);s.fill(K,bd,.9);s.knockout(pn,.85);s.fill(B,pn,.35);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
 for(let k=0;k<8;k++){L([-k*13.125,0,-34],[-(k+1)*13.125,0,-34]);L([-k*13.125,0,34],[-(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){L([0,0,-34+k*17],[0,0,-34+(k+1)*17]);L([CX,0,-34+k*17],[CX,0,-34+(k+1)*17]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(CX,0,9.15);
 L([0,0,-20.16],[-16.5,0,-20.16]);L([-16.5,0,-20.16],[-16.5,0,20.16]);L([-16.5,0,20.16],[0,0,20.16]);
 L([0,0,-9.16],[-5.5,0,-9.16]);L([-5.5,0,-9.16],[-5.5,0,9.16]);L([-5.5,0,9.16],[0,0,9.16]);
 {const a=Math.acos(5.5/9.15);circ(-11,0,9.15,Math.PI-a,Math.PI+a,12);}
 for(const cx of[-11,CX]){const d:V3[]=[];for(let i=0;i<12;i++){const a=i/12*TAU;d.push([cx+Math.cos(a)*.15,0,Math.sin(a)*.15]);}addPoly(ln,polyP(c,d));}
 circ(0,-34,1,Math.PI/2,Math.PI,4);circ(0,34,1,Math.PI,Math.PI*1.5,4);
 s.knockout(ln);
 const pole=new Path2D(),flag=new Path2D();for(const z of[-34,34]){seg3(c,[0,0,z],[0,1.55,z],.05,pole);addPoly(flag,polyP(c,[[0,1.55,z],[0,1.2,z],[-.45,1.38,z]]));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(Y,flag,.95);
}
/** Dortmund's goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep with a sloping roof; bulge pushes the back out around z = bz */
function goal3(s:Sheet,c:Cam,bulge:number,bz:number){
 const X=0,z0=-3.66,z1=3.66,H=2.44,back=(z:number)=>X+2+bulge*.75*Math.exp(-Math.pow((z-bz)/1.6,2));
 const zs=[z0,-1.8,0,1.4,2.6,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0),1.9,z0],[back(z0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1),1.9,z1],[back(z1),0,z1]],
  [[X,H,z0],[X,H,z1],...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)],
  [...zs.map(z=>[back(z),0,z] as V3),...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.3);s.tone(K,net,.12);
 const mesh=new Path2D();
 for(let i=0;i<=14;i++){const z=lerp(z0,z1,i/14);seg3(c,[X,H,z],[back(z),1.9,z],.022,mesh,.7);seg3(c,[back(z),1.9,z],[back(z),0,z],.022,mesh,.7);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<zs.length-1;i++)seg3(c,[back(zs[i]),y,zs[i]],[back(zs[i+1]),y,zs[i+1]],.022,mesh,.7);seg3(c,[X,y*H/1.9,z0],[back(z0),y,z0],.022,mesh,.7);seg3(c,[X,y*H/1.9,z1],[back(z1),y,z1],.022,mesh,.7);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+2*u,H-.54*u,z0],[X+2*u,H-.54*u,z1],.022,mesh,.7);}
 s.knockout(mesh,.8);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.2,fo);seg3(c,[X,0,z1],[X,H,z1],.2,fo);seg3(c,[X,H,z0-.04],[X,H,z1+.04],.2,fo);
 s.fill(K,fo,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- the cast: kits (athlete.ts styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.18]],SKIN_M:InkFill[]=[[Y,.42],[R,.26],[K,.06]],SKIN_D:InkFill[]=[[Y,.8],[R,.62],[K,.28]];
/** Real Madrid: all white (sourced); navy trim and numbers (inferred) */
const real=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:'paper',boots:K,skin:SKIN_L,hair:K,line:K,trim:[K,.8],numberInk:K,hairStyle:'short',build:{height:1.8,bulk:1},...o});
/** Borussia Dortmund: yellow shirts, black (navy) shorts, yellow socks (sourced); black trim and numbers */
const bvb=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[Y,.95],shorts:[K,.92],socks:[Y,.95],boots:K,skin:SKIN_L,hair:K,line:K,trim:[K,.9],numberInk:[K,.9],hairStyle:'short',build:{height:1.84,bulk:1},...o});
const B_VIN:Build={height:1.76,bulk:.9},B_BEL:Build={height:1.86,bulk:1},B_MAA:Build={height:1.7,bulk:.95},B_KOB:Build={height:1.94,bulk:1},B_HUM:Build={height:1.91,bulk:1.04},B_RYE:Build={height:1.83,bulk:1};
const VIN_ST=real({number:7,skin:SKIN_D,hair:[K,.95],build:B_VIN,seed:7});
const BEL_ST=real({number:5,skin:SKIN_M,hair:[K,.95],build:B_BEL,seed:5});
const ROD_ST=real({number:11,skin:SKIN_M,hair:[K,.9],build:{height:1.74,bulk:.92},seed:11});
const MAA_ST=bvb({number:22,skin:SKIN_M,hair:[K,.9],build:B_MAA,seed:22});
const HUM_ST=bvb({number:15,hair:[Y,.55],build:B_HUM,seed:15});
const RYE_ST=bvb({number:26,hair:[Y,.7],build:B_RYE,seed:26});
const KOB_ST:AthleteStyle={shirt:[R,.9],shorts:[R,.9],socks:[R,.9],boots:K,skin:SKIN_L,hair:[Y,.6],line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',number:1,numberInk:K,build:B_KOB,seed:1};

// ---------------------------------------------------------------- the play on one clock τ (seconds; τ = 0 is the finish)
const BALL_R=.11,GRAV=9.81;
/** beats: Maatsen's pass TM, Bellingham's steal TI, his lay-off TB, Vinícius's one touch TT, the finish TS = 0, the ball over the line TG */
const TM=-3.0,TI=-1.8,TB=-1.3,TT=-.45,TS=0,TG=.68;
/** where the ball is at each contact (all illustrative, see header): Maatsen's pass from the Dortmund left (+z) across the face of the box;
 * the steal ≈ 18 m out; Vinícius's touch on the left side of the area; the finish ≈ 12 m out, 7.5 m left of centre */
const M0:V3=[-12.6,BALL_R,13.2],IB0:V3=[-18.3,BALL_R,2.9],IB1:V3=[-18.0,BALL_R,2.3],RV:V3=[-15.3,BALL_R,-8.5],SP:V3=[-12.1,BALL_R,-7.4];
/** the finish crosses the line low on the FAR (+z, right-hand) side — swept across Kobel */
const GOAL_PT:V3=[0,.42,2.75],NET_HIT:V3=[1.55,.32,3.05],REST:V3=[1.2,BALL_R,2.8];
const G3:V3=[0,-GRAV,0];
const launch=(A:V3,Bp:V3,d:number,a:V3):V3=>[(Bp[0]-A[0]-.5*a[0]*d*d)/d,(Bp[1]-A[1]-.5*a[1]*d*d)/d,(Bp[2]-A[2]-.5*a[2]*d*d)/d];
const flyA=(A:V3,V:V3,a:V3,t:number):V3=>[A[0]+V[0]*t+.5*a[0]*t*t,A[1]+V[1]*t+.5*a[1]*t*t,A[2]+V[2]*t+.5*a[2]*t*t];
const V_SHOT=launch(SP,GOAL_PT,TG-TS,G3);
const dirOf=(a:V3,b:V3)=>nrm2(b[0]-a[0],b[2]-a[2]);
const D_M=dirOf(M0,IB0),D_B=dirOf(IB1,RV),D_T=dirOf(RV,SP),D_S=dirOf(SP,GOAL_PT);
/** strike windows: contact time, how long the kick takes (strike() spans 0..1 over `dur` s), power */
const KICK={m:{T:TM,dur:.9,power:.45,foot:'l' as const},b:{T:TB,dur:.8,power:.5,foot:'r' as const},t:{T:TT,dur:.55,power:.18,foot:'r' as const},s:{T:TS,dur:.9,power:1,foot:'r' as const}};
/** where a striker's pelvis must stand at contact so that boot meets the back of the ball, kicking along d (solved once, FK) */
function contactPelvis(ball:V3,d:[number,number],build:Build,foot:'l'|'r',power:number):[number,number]{
 const sk=solve(strike(STRIKE_CONTACT,{foot,power}),build,{x:0,z:0,yaw:yawTo(d[0],d[1])}),toe=foot==='r'?sk.rToe:sk.lToe;
 return[ball[0]-d[0]*.12-toe[0],ball[2]-d[1]*.12-toe[2]];}
const PM=contactPelvis(M0,D_M,B_MAA,'l',KICK.m.power),PB=contactPelvis(IB1,D_B,B_BEL,'r',KICK.b.power);
const PT=contactPelvis(RV,D_T,B_VIN,'r',KICK.t.power),PS=contactPelvis(SP,D_S,B_VIN,'r',KICK.s.power);

// ---------------------------------------------------------------- tracks: [τ, x, z], Hermite-interpolated (all illustrative, see header)
type Role='vin'|'bel'|'maa'|'gk'|'def'|'real'|'bvb';
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];hero?:boolean};
const T0=-4.2,T1=9,DT=.02,T_EARLY=-11;
const ACTORS:Actor[]=[
 // jogging up the left (≈ 2 m/s) until the steal, then the burst: ≈ 5 m/s to the touch, ≈ 7.5 m/s to the finish; then away toward us
 {name:'Vinícius Júnior',role:'vin',hero:true,style:VIN_ST,keys:[[T0,-27.6,-10.3],[TM,-25.4,-10.1],[TI,-23.3,-9.9],[TB,-21.2,-9.7],[TT,...PT],[TS,...PS],[TS+.45,PS[0]+D_S[0]*2.4,PS[1]+D_S[1]*1.2],[TG+1.1,-8.4,-8.9],[TG+3.4,-8.6,-16.5],[T1,-8,-24]]},
 {name:'Jude Bellingham',role:'bel',hero:true,style:BEL_ST,keys:[[T0,-25.5,6.6],[TM,-23.6,5.6],[TI,PB[0]-D_B[0]*.55-.2,PB[1]-D_B[1]*.55+.3],[TB,...PB],[TB+.8,PB[0]+1.6,PB[1]-1.9],[TG+.4,-14.6,-3.6],[TG+3,-11,-10],[T1,-9.4,-18]]},
 {name:'Gregor Kobel',role:'gk',hero:true,style:KOB_ST,keys:[[T0,-2.3,.8],[TM,-2.4,.4],[TB,-2.8,-1.1],[TT,-3.6,-2.3],[TS,-4.1,-2.9],[TS+.25,-4.15,-2.95],[T1,-3.9,-2.3]]},
 {name:'Ian Maatsen',role:'maa',hero:true,style:MAA_ST,keys:[[T0,PM[0]+2.1,PM[1]+1.2],[TM-.6,PM[0]+.9,PM[1]+.5],[TM,...PM],[TM+.8,PM[0]-1.2,PM[1]-1.2],[TS,-13.6,9.6],[T1,-12.4,8.2]]},
 {name:'Julian Ryerson',role:'def',hero:true,style:RYE_ST,keys:[[T0,-22.2,-15.6],[TM,-21.4,-15],[TI,-20.8,-14.4],[TB,-20.2,-13.6],[TT,-18.4,-11.8],[TS,-15.6,-10.6],[TG+.6,-12.6,-10.2],[T1,-11.2,-10.8]]},
 {name:'Mats Hummels',role:'def',hero:false,style:HUM_ST,keys:[[T0,-16.6,-1.2],[TM,-16.8,-1.6],[TI,-17.2,-2.6],[TB,-16.8,-3.8],[TT,-15.2,-5],[TS,-13.2,-5.6],[TG+.6,-11.4,-5.2],[T1,-10.2,-4.6]]},
 {name:'Nico Schlotterbeck',role:'def',style:bvb({number:4,build:{height:1.91},seed:4}),keys:[[T0,-15.8,5.2],[TM,-16,4.6],[TI,-16.2,3.6],[TB,-15.6,2.6],[TS,-11.4,.4],[TG+.6,-9.4,-.4],[T1,-8.6,-.6]]},
 {name:'Dortmund midfielder (the pass was meant for)',role:'bvb',style:bvb({number:20,build:{height:1.78},seed:20}),keys:[[T0,-21.6,1.4],[TM,-21.4,1.6],[TI,-20.6,2],[TB,-19.8,1.6],[TS,-17.4,-.8],[T1,-15.8,-1.6]]},
 {name:'Dortmund midfielder 2',role:'bvb',style:bvb({skin:SKIN_D,seed:23}),keys:[[T0,-26.4,4.2],[TM,-25.6,3.8],[TI,-24.6,3.2],[TS,-21.4,1],[T1,-18.6,-.4]]},
 {name:'Dortmund forward',role:'bvb',style:bvb({build:{height:1.89},seed:14}),keys:[[T0,-30,4],[TM,-29,3.6],[TS,-25,1.8],[T1,-22,0]]},
 {name:'Rodrygo',role:'real',style:ROD_ST,keys:[[T0,-22.4,11.4],[TM,-21.2,10.8],[TI,-19.6,10],[TS,-14.4,6.6],[TG+.8,-11.8,2.4],[TG+3.2,-9.6,-9],[T1,-8.8,-16]]},
 {name:'Real Madrid midfielder',role:'real',style:real({seed:62}),keys:[[T0,-30.5,7.5],[TM,-29.5,7],[TS,-24.5,5],[TG+1,-22,3],[T1,-15,-6]]},
];
const VIN=0,BEL=1,GK=2,MAA=3,RYE=4,HUM=5;
/** the build-up before the stray pass (live chapter only, inferred): Dortmund bring it out from the back — their players step up (−x) as
 * Maatsen walks the ball out of his corner of the box — and Madrid's press moves up to meet them (+x) */
for(const a of ACTORS){const k=a.keys[0],bvbSide=a.role==='maa'||a.role==='def'||a.role==='bvb',dx=a.role==='gk'?.3:a.role==='maa'?4.5:bvbSide?2.4:-3.6;
 a.keys.unshift([T_EARLY,k[1]+dx,k[2]+(a.role==='maa'?1.6:0)]);}
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const still=(a:number[],b:number[])=>Math.abs(a[1]-b[1])+Math.abs(a[2]-b[2])<1e-6;
 const f=(j:number)=>{const m1=still(k1,k2)||still(k0,k1)?0:(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=still(k1,k2)||still(k2,k3)?0:(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (drives the gait phase) — built once */
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T_EARLY)/DT;i++){const[x,z]=herm(a.keys,T_EARLY+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T_EARLY)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.06),b=posOf(k,tau+.06);return[(b[0]-a[0])/.12,(b[1]-a[1])/.12];};
const speedOf=(k:number,tau:number)=>{const v=velOf(k,tau);return Math.hypot(v[0],v[1]);};

// ---------------------------------------------------------------- the ball
/** a pass along the grass, slowing a little as it rolls (f(1) = 1, the end speed ≈ 65 % of the start) */
const roll=(A:V3,Bp:V3,u:number):V3=>mix3(A,Bp,clamp(u)*(1.35-.35*clamp(u)));
function ballAt(tau:number):V3{
 if(tau<=TM){// at Maatsen's feet as he walks it up (a stride ahead of him), settling on the pass spot
  const[x,z]=posOf(MAA,tau),v=velOf(MAA,tau),d=nrm2(v[0]||1e-6,v[1]),at:V3=[x+d[0]*.6,BALL_R,z+d[1]*.6];return mix3(at,M0,sm(TM-.5,TM,tau));}
 if(tau<TI)return roll(M0,IB0,(tau-TM)/(TI-TM));
 if(tau<TB)return mix3(IB0,IB1,easeOut((tau-TI)/(TB-TI)));
 if(tau<TT)return roll(IB1,RV,(tau-TB)/(TT-TB));
 if(tau<TS)return mix3(RV,SP,(tau-TT)/(TS-TT));
 if(tau<TG)return flyA(SP,V_SHOT,G3,tau-TS);
 if(tau<TG+.14)return mix3(GOAL_PT,NET_HIT,easeOut((tau-TG)/.14));
 const u=clamp((tau-TG-.14)/.5),b=u>=1?.08*Math.abs(Math.sin((tau-TG-.64)*9))*Math.exp(-(tau-TG-.64)*3.5):0;
 return[lerp(NET_HIT[0],REST[0],u),Math.max(BALL_R,lerp(NET_HIT[1],BALL_R,u*u))+b,lerp(NET_HIT[2],REST[2],u)];
}
const spinAt=(tau:number)=>tau<=TM?0:tau<TS?(tau-TM)*TAU*2.2:(TS-TM)*TAU*2.2+(tau-TS)*TAU*4;
const bulgeAt=(tau:number)=>tau<TG+.08?0:.8*Math.exp(-(tau-TG-.08)*2.4)*(1+.3*Math.sin((tau-TG)*14));

// ---------------------------------------------------------------- poses from the tracks
function loco(k:number,tau:number):Pose{
 const sp=speedOf(k,tau),q=clamp(sp/7.5),ph=distOf(k,tau)/(2.3+2.1*q)+k*.37;
 const run=runCycle(ph,{speed:q});if(sp>1.4)return run;
 const idle=blendPose(stand(),posed({lHipF:22,rHipF:16,lKnee:28,rKnee:24,lean:14,pitch:4,neckP:-8,lShA:22,rShA:20,lElb:40,rElb:36,rAnk:-6,lAnk:-6}),.5+.5*Math.sin(tau*1.7+k));
 return blendPose(idle,run,clamp((sp-.25)/1.15));
}
/** face along the run when moving, else toward the ball (blended, so turns are continuous) */
function faceYaw(k:number,tau:number,target?:V3):number{
 const v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),p=posOf(k,tau),b=target??ballAt(tau),tx=b[0]-p[0],tz=b[2]-p[1],tl=Math.hypot(tx,tz)||1,w=clamp((sp-.6)/1.6);
 return yawTo(lerp(tx/tl,v[0]/(sp||1),w),lerp(tz/tl,v[1]/(sp||1),w));
}
const win=(t:number,a:number,b:number,e=.15)=>sm(a,a+e,t)*(1-sm(b-e,b,t));
const DEJECT=posed({lHipF:26,rHipF:26,lKnee:30,rKnee:30,lean:30,pitch:6,neckP:34,lShA:14,rShA:14,lShF:20,rShF:20,lElb:24,rElb:24});
/** a kick laid over the run: strike() spans the window, weight w eases in and out around contact */
function kick(pose:Pose,yaw:number,tau:number,k:{T:number;dur:number;power:number;foot:'l'|'r'},w0=1):{pose:Pose;yaw:number}{
 const u=(tau-k.T)/k.dur+STRIKE_CONTACT,w=w0*win(u,.02,.98,.16);if(w<=0)return{pose,yaw};
 const d=k===KICK.m?D_M:k===KICK.b?D_B:k===KICK.t?D_T:D_S;
 return{pose:blendPose(pose,strike(clamp(u),{foot:k.foot,power:k.power}),w),yaw:lerpAng(yaw,yawTo(d[0],d[1]),clamp(w*1.4))};}
/** Kobel: off his line, set, then a late dive to his LEFT (side 'l' = toward +z, the far post), beaten by the sweep across him */
const DIVE=(u:number)=>keeperDive(clamp(u),{side:'l',height:.18}),T_DIVE=TS+.1,DIVE_L=.95;
type State={pose:Pose;place:Place};
function stateOf(k:number,tau:number):State{
 const a=ACTORS[k],[x,z]=posOf(k,tau);let pose=loco(k,tau),yaw=faceYaw(k,tau);
 switch(a.role){
  case 'vin':{
   if(tau<TI-.2)yaw=lerpAng(faceYaw(k,tau),faceYaw(k,tau,ballAt(tau)),.35);// jogging, head turned to the ball
   ({pose,yaw}=kick(pose,yaw,tau,KICK.t,.6));({pose,yaw}=kick(pose,yaw,tau,KICK.s));
   if(tau>TG+.2){const run=celebrate(distOf(k,tau)/4.2,{kind:'run'});pose=blendPose(pose,run,sm(TG+.3,TG+1,tau));}
   break;}
  case 'bel':{
   // steps in front of the pass, cushions it (a small bend), then rolls it left into the path with his right foot
   if(tau>TI-.5&&tau<TB-.1){pose=blendPose(pose,posed({lHipF:30,rHipF:10,lKnee:40,rKnee:30,lean:18,pitch:4,neckP:36,lShA:34,rShA:26,lElb:40,rElb:40}),win(tau,TI-.5,TB-.1,.2)*.7);yaw=lerpAng(yaw,faceYaw(k,tau,ballAt(tau)),.6);}
   ({pose,yaw}=kick(pose,yaw,tau,KICK.b));
   if(tau>TG+.3){const run=celebrate(distOf(k,tau)/4,{kind:'arms'});pose=blendPose(pose,run,sm(TG+.4,TG+1,tau)*.7);}
   break;}
  case 'maa':{({pose,yaw}=kick(pose,yaw,tau,KICK.m));if(tau>TI&&tau<TG)yaw=faceYaw(k,tau,ballAt(tau));if(tau>TG+.3)pose=blendPose(pose,DEJECT,sm(TG+.5,TG+1.4,tau));break;}
  case 'gk':{const set=keeperSet(tau*1.3);pose=blendPose(set,pose,sm(.8,1.4,speedOf(k,tau)));
   if(tau>T_DIVE-.15)pose=blendPose(pose,DIVE((tau-T_DIVE)/DIVE_L),sm(T_DIVE-.15,T_DIVE,tau));
   if(tau>TG+1.4)pose=blendPose(pose,DEJECT,sm(TG+1.6,TG+2.4,tau)*.6);
   yaw=faceYaw(k,Math.min(tau,TS),SP);if(tau>TS)yaw=faceYaw(k,TS,SP);break;}
  case 'def':case 'bvb':{if(tau>TT&&tau<TG+.2)yaw=lerpAng(yaw,faceYaw(k,tau,ballAt(tau)),.5);if(tau>TG+.4)pose=blendPose(pose,DEJECT,sm(TG+.8,TG+1.8,tau)*.8);break;}
  case 'real':if(tau>TG+.3){const run=celebrate(distOf(k,tau)/4.2,{kind:'arms'});pose=blendPose(pose,run,sm(TG+.4,TG+1,tau)*.7);}break;
 }
 return{pose,place:{x,z,yaw}};
}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the pose one drawn frame earlier (secondary
 * motion: hair and the shirt hem trail), smear = halftone echo + speed lines on fast limbs (the burst, the touch, the finish, the dive). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:State,smear=false){
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
}

// ---------------------------------------------------------------- the ball + the scene assembly
function drawBall(s:Sheet,c:Cam,P:V3,rot:number,o:{min?:number;prevP?:V3|null;lines?:boolean}={}){
 const q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??12,c.F*BALL_R/q[2]);
 const sh:Pt[]=[];const rad=.16+P[1]*.05;for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*1.3,0,P[2]+Math.sin(a)*rad]);if(p)sh.push(p);}
 if(sh.length>8&&P[0]<.05)s.tone(K,polyPath(sh,true),clamp(.5-P[1]*.1,.08,.5));
 if(o.lines&&o.prevP){const a=pr(c,o.prevP);if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.8)speedLines(s,K,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:4,seed:7,len:Math.min(260,d*1.4),spread:r*.9,width:Math.max(2.5,r*.18),cov:.8});}}
 footballPanels(s,g[0],g[1],r,{rot,key:K,shadow:B,seed:5});
 return{g,r,d:q[2]};
}
type Item={d:number;draw:()=>void};
const FULL_CAP=4;
type Fig={st:State;prev?:State;style:AthleteStyle;hero:boolean;smear?:boolean};
/** depth-sorts figures, the ball and the goal (far first). Heat: small figures print at `low`; inside a passage every figure is capped. */
function drawScene(s:Sheet,c:Cam,figs:Fig[],ball:{P:V3;rot:number;min?:number;prevP?:V3|null;lines?:boolean}|null,goal:{bulge:number;bz:number}|null):{ball:{g:Pt;r:number}|null}{
 const v=view(s),items:Item[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending;
 const near=figs.filter(f=>!f.hero).map(f=>toCam(c,[f.st.place.x??0,.9,f.st.place.z??0])[2]).filter(d=>d>=1).sort((a,b)=>a-b),dCap=near.length>FULL_CAP?near[FULL_CAP-1]:1e9;
 for(const f of figs){const q=toCam(c,[f.st.place.x??0,.9,f.st.place.z??0]);if(q[2]<1)continue;const g=scr(c,q),k=c.F/q[2]*1.8;if(Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k)continue;
  const px=k*ppu,style:AthleteStyle=passing?{...f.style,detail:f.hero?'mid':'low'}:(!f.hero&&(px<120||q[2]>dCap))||px<44?{...f.style,detail:'low'}:f.style;
  items.push({d:q[2],draw:()=>{drawPlayer(s,f.st.pose,c,style,f.st.place,f.prev,!!f.smear&&!passing);}});}
 let out:{g:Pt;r:number}|null=null;
 if(ball){const bq=toCam(c,ball.P);if(bq[2]>=NEAR)items.push({d:bq[2],draw:()=>{const r=drawBall(s,c,ball.P,ball.rot,ball);if(r)out={g:r.g,r:r.r};}});}
 if(goal){const gq=toCam(c,[1,1.2,0]);items.push({d:Math.max(NEAR,gq[2]),draw:()=>goal3(s,c,goal.bulge,goal.bz)});}
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
 return{ball:out};
}
/** the pitch at play time τ (poses on twos): every actor (prev = one drawn frame earlier), the ball, the goal */
function play(s:Sheet,c:Cam,tau:number,tauPrev:number,o:{smear?:boolean;min?:number;lines?:boolean;prevBall?:number;only?:number[]}={}){
 const figs:Fig[]=ACTORS.flatMap((a,k)=>o.only&&!o.only.includes(k)?[]:[k]).map(k=>{const a=ACTORS[k];const st=stateOf(k,tau);const hero=!!a.hero;return{st,prev:hero?stateOf(k,tauPrev):undefined,style:a.style,hero,
  smear:o.smear&&((k===VIN&&tau>TI&&tau<TS+.3)||(k===BEL&&tau>TB-.25&&tau<TB+.3)||(k===GK&&tau>T_DIVE+.1&&tau<T_DIVE+.7))};});
 return drawScene(s,c,figs,{P:ballAt(tau),rot:spinAt(tau),min:o.min,lines:o.lines,prevP:o.prevBall!==undefined?ballAt(o.prevBall):null},{bulge:bulgeAt(tau),bz:REST[2]});
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
/** steps: [start, duration, shot]; each step eases in over the previous result */
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
const gnd=(P:V3,y=0):V3=>[P[0],y,P[2]];
const at=(k:number,tau:number,y=1):V3=>{const[x,z]=posOf(k,tau);return[x,y,z];};
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
/** the replay trail: the ball's path over the last `span` seconds, a fading yellow ribbon (printed under the players) */
function trail(s:Sheet,c:Cam,tau:number,fade:number,from:number,span=.9){
 if(fade<=0||tau<=from)return;const pts:Pt[]=[];const a=Math.max(from,tau-span),b=Math.min(tau,TG);if(b<=a)return;for(let i=0;i<=22;i++){const p=pr(c,ballAt(lerp(a,b,i/22)));if(p)pts.push(p);}
 if(pts.length<3)return;const w=Math.max(7,kAt(c,ballAt(b))*.15);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*fade);
}
/** the burst: speed lines streaming off Vinícius's back while he is sprinting */
function burstLines(s:Sheet,c:Cam,tau:number,a:number,seed=3){
 if(a<=0)return;const sp=speedOf(VIN,tau);if(sp<4)return;const p=at(VIN,tau,1.05),v=velOf(VIN,tau),q=pr(c,p),qb=pr(c,[p[0]-v[0]*.1,1.05,p[2]-v[1]*.1]);if(!q||!qb)return;
 const k=kAt(c,p),ang=Math.atan2(q[1]-qb[1],q[0]-qb[0]);if(!Number.isFinite(ang))return;
 speedLines(s,K,q[0]-Math.cos(ang)*k*.25,q[1]-Math.sin(ang)*k*.25,ang,{n:5,seed,len:Math.min(320,k*1.6*clamp(sp/8)),spread:k*.55,width:Math.max(3,k*.03),cov:.75*a});
}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time
/** τ from chapter time: real time, anchored so the finish lands on "away" (the steal then falls inside "Bellingham steals it, Vinícius") */
function tau1(t:number){const tF=CUE(0,'away')+.1;return Math.max(T_EARLY+.2,t-(tF-TS));}
const P1:V3=[-26,23,-70];
function cam1(t:number):Cam{
 const tau=tau1(t),b=ballAt(tau),v=at(VIN,tau,1);
 return plan(t,[
  [0,0,()=>({P:P1,T:[-22,9,18],fov:36})],
  [CUE(0,'Real Madrid lead')-.3,1.4,()=>({P:P1,T:[-17,1,1],fov:17})],
  [CUE(0,'Dortmund pass')-.9,1.2,()=>({P:P1,T:mix3(add3(gnd(b),[0,1,0]),[-17,1,-3],.35),fov:8.5})],
  [CUE(0,'Bellingham')-.3,.9,()=>({P:P1,T:mix3(add3(gnd(b),[0,1,0]),v,.45),fov:7.2})],
  [CUE(0,'Vinícius')-.4,1,()=>({P:P1,T:mix3(mix3(add3(gnd(b),[0,1,0]),v,.5),[-3,1,-1],.4*sm(TT,TS+.2,tau)),fov:lerp(6.9,8.6,sm(TT,TS+.2,tau))})],
  [CUE(0,'two')+.1,1.4,()=>({P:P1,T:mix3(at(VIN,tau,1.1),[-6,1,-6],.2),fov:6.6})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tt=twos(t),tau=tau1(tt),tp=tau1(tt-1/12),tN=CUE(0,'two');
  stadium(s,c,t,[0,1,3],{roar:Math.max(.25*sm(TI,TI+.6,tau),sm(TG,TG+.4,tau)),flash:sm(tN-.25,tN+.2,t)*(1-sm(tN+2.2,tN+3,t))});
  ground(s,c);
  play(s,c,tau,tp,{min:16,lines:true,prevBall:tau1(t-.06)});
 },
 aperture(t){const c=cam1(t),p=stateOf(VIN,tau1(twos(t))),sk=solve(p.pose,B_VIN,p.place),q=pr(c,sk.chest)??[0,0];return apertureDisc(q[0],q[1],Math.max(22,kAt(c,sk.chest)*.5),12);},
 get still(){return CUE(0,'away')+.2;},
};

// ---------------------------------------------------------------- 2 · the slow-motion replay: low behind Vinícius on the left, tracking
const tau2=(t:number)=>key(t,mono([[0,-2.4],[CUE(1,'rolls it'),TB-.05],[CUE(1,"Vinícius's path"),-.8],[CUE(1,'change gear'),-.62],[CUE(1,'one quick touch'),TT-.03],[CUE(1,"he's clear"),TS-.08],[SECS(1)-.2,TS+.18]]),linear);
function cam2(t:number):Cam{
 const tau=tau2(t),v=at(VIN,tau,1.1),b=ballAt(tau),follow=(off:V3):V3=>add3([v[0],0,v[2]],off);
 return plan(t,[
  [0,0,()=>({P:[-40,4.6,-5],T:[-20,.6,-3.5],fov:34})],
  [CUE(1,'rolls it')-.3,.9,()=>({P:[-37,4,-5],T:mix3(add3(gnd(b),[0,.6,0]),v,.45),fov:26})],
  [CUE(1,"Vinícius's path")-.2,1,()=>({P:follow([-9,2.8,1.4]),T:mix3(v,add3(gnd(b),[0,.5,0]),.4),fov:23})],
  [CUE(1,'change gear')-.2,.8,()=>({P:follow([-8,2.5,1.6]),T:add3(v,[1.4,-.2,0]),fov:19})],
  [CUE(1,'one quick touch')-.2,.7,()=>({P:follow([-6.8,2.2,1.6]),T:mix3(add3(gnd(b),[0,.5,0]),v,.4),fov:18})],
  [CUE(1,"he's clear")-.3,.9,()=>({P:follow([-8,3,1.2]),T:mix3(v,[-2,.8,0],.45),fov:30})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tt=twos(t),tau=tau2(tt),tp=tau2(tt-1/12),tG=CUE(1,'change gear');
  stadium(s,c,t,[0,1,3],{roar:.3});
  ground(s,c);
  trail(s,c,tau,1-sm(TS-.05,TS+.2,tau),TB,1.1);
  // the replay graphic: a yellow ring under Vinícius ("that's him"), then speed lines as he changes gear
  groundRing(s,c,at(VIN,tau,0),.75,Y,sm(CUE(1,'rolls it')-.2,CUE(1,'rolls it')+.3,t)*(1-sm(tG-.1,tG+.3,t)),.14);
  burstLines(s,c,tau,sm(tG-.15,tG+.25,t),5);
  const r=play(s,c,tau,tp,{smear:true,min:10});
  // the one touch: a spark on the boot
  const hit=(tau-TT)/.16;if(hit>0&&hit<1&&r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],Math.max(40,r.ball.r*4),{n:9,seed:17,g:easeOutBack(clamp(hit*2))*(1-clamp((hit-.5)*2)),width:Math.max(5,r.ball.r*.45)});
 },
 aperture(t){const c=cam2(t),P=ballAt(tau2(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return CUE(1,'one quick touch')+.1;},
};

// ---------------------------------------------------------------- 3 · a second replay: high behind the goal, the sweep comes across at us
const tau3=(t:number)=>key(t,mono([[0,TT-.35],[CUE(2,'sweeps it'),TS-.03],[CUE(2,'across the keeper'),TS+.34],[CUE(2,'far corner'),TG+.1],[CUE(2,'fifteenth')-.4,TG+2.2],[SECS(2),TG+5]]),linear);
const E3:V3=[5.5,6.5,11.5];
function cam3v(t:number):Cam{
 const tau=tau3(t),v=at(VIN,tau,1.2);
 return plan(t,[
  [0,0,()=>({P:E3,T:[-13,.8,-7.2],fov:24})],
  [CUE(2,'sweeps it')-.3,.8,()=>({P:E3,T:add3(SP,[.8,.6,.4]),fov:17})],
  [CUE(2,'across')-.2,.9,()=>({P:E3,T:[-5,.6,-2.2],fov:30})],
  [CUE(2,'far corner')+.1,1.1,()=>({P:E3,T:[-1.8,.7,.8],fov:30})],
  [CUE(2,'fifteenth')-.9,1.8,()=>({P:[4.5,6.5,9],T:v,fov:19})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tt=twos(t),tau=tau3(tt),tp=tau3(tt-1/12),tF=CUE(2,'fifteenth');
  stadium(s,c,t,[2,3],{roar:sm(TG,TG+.4,tau),flash:Math.max(sm(TG+.05,TG+.3,tau)*(1-sm(TG+1.4,TG+2,tau)),sm(tF-.1,tF+.3,t))});
  ground(s,c);
  const r=play(s,c,tau,tp,{smear:true,min:11,lines:true,prevBall:tau3(t-.06)});
  // the replay graphic: the finish's path printed over the net so the ball reads through the mesh
  const hf=sm(TS-.05,TS+.05,tau)*(1-sm(TG+.3,TG+.8,tau));if(hf>0){const pts:Pt[]=[];for(let i=0;i<=16;i++){const p=pr(c,ballAt(lerp(TS,Math.min(tau,TG),i/16)));if(p)pts.push(p);}
   if(pts.length>2){const w=Math.max(6,kAt(c,SP)*.12);const rb=ribbon(pts,w*1.3,{taper:.9,pressure:.2,wobble:0});s.stroke(K,rb,3,.8*hf);s.knockout(rb,hf);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.95*hf);}}
  const hit=(tau-TS)/.18;if(hit>0&&hit<1&&r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],Math.max(40,r.ball.r*4.5),{n:9,seed:23,g:easeOutBack(clamp(hit*2))*(1-clamp((hit-.5)*2)),width:Math.max(5,r.ball.r*.5)});
 },
 aperture(t){const c=cam3v(t),p=stateOf(VIN,tau3(twos(t))),sk=solve(p.pose,B_VIN,p.place),q=pr(c,sk.chest)??[0,0];return apertureDisc(q[0],q[1],60,12);},
 get still(){return CUE(2,'across')+.25;},
};

// ---------------------------------------------------------------- 4 · the lesson: from the near touchline, footprints of the change of speed
/** his footprints from the jog to the finish: one print per stride, the stride length set by his speed (fast = long), built once */
const PRINTS:{x:number;z:number;tau:number;fast:boolean}[]=(()=>{const o:{x:number;z:number;tau:number;fast:boolean}[]=[];let next=0,side=1;
 for(let tau=TM-.4;tau<=TS;tau+=DT){const d=distOf(VIN,tau);if(d<next)continue;const[x,z]=posOf(VIN,tau),v=velOf(VIN,tau),sp=Math.hypot(v[0],v[1]),n=nrm2(-v[1],v[0]);
  o.push({x:x+n[0]*.14*side,z:z+n[1]*.14*side,tau,fast:tau>TI+.15});side=-side;next=d+clamp(.45+.2*sp,.7,1.9);}return o;})();
const tau4=(t:number)=>key(t,mono([[0,TM-.5],[CUE(3,'Jog'),TM+.3],[CUE(3,'burst'),TI+.05],[CUE(3,'Quick feet'),TT-.02],[CUE(3,'sudden sprint'),TS-.12],[CUE(3,'past defenders'),TS+.02],[SECS(3),TS+.12]]),linear);
function cam4v(t:number):Cam{
 const tau=tau4(t),v=at(VIN,tau,1);
 return plan(t,[
  [0,0,()=>({P:[-18.5,5.2,-24],T:[-19,.2,-9.5],fov:44})],
  [CUE(3,'Jog')-.2,1,()=>({P:[v[0]+.5,5,-21.5],T:[v[0]+1.5,.5,v[2]],fov:30})],
  [CUE(3,'burst')-.2,1,()=>({P:[v[0]+1,5,-22],T:[v[0]+2.2,.5,v[2]],fov:30})],
  [CUE(3,'Quick feet')-.2,.8,()=>({P:[v[0]+1,5.2,-20.5],T:mix3(add3(gnd(ballAt(tau)),[0,.4,0]),v,.4),fov:25})],
  [CUE(3,'sudden sprint')-.2,1,()=>({P:[-15.5,5.6,-21.5],T:[-14,.5,-8.2],fov:34})],
 ]);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tt=twos(t),tau=tau4(tt),tp=tau4(tt-1/12);
  const tC=CUE(3,'Change'),tJ=CUE(3,'Jog'),tB=CUE(3,'burst'),tQ=CUE(3,'Quick feet'),tS=CUE(3,'sudden sprint'),tP=CUE(3,'past defenders');
  stadium(s,c,t,[0,1,3],{roar:.35+.3*sm(tP,tP+.6,t)});
  ground(s,c);
  // "Change your speed": the whole run's footprints appear dim; "Jog" lights the short navy strides, "burst" the long yellow ones, in order
  const fp=sm(tC-.1,tC+.4,t);
  if(fp>0){const dim=new Path2D(),slow=new Path2D(),fast=new Path2D();
   for(const p of PRINTS){const pts:Pt[]=[];for(let i=0;i<12;i++){const a=i/12*TAU,q=pr(c,[p.x+Math.cos(a)*.44,.01,p.z+Math.sin(a)*.25]);if(q)pts.push(q);}if(pts.length<6)continue;
    const lit=p.tau<=tau+.02&&(p.fast?t>tB-.2:t>tJ-.2);(lit?(p.fast?fast:slow):dim).addPath(polyPath(pts,true));}
   s.knockout(dim,.7*fp);s.stroke(K,dim,2.5,.5*fp);s.knockout(slow,fp);s.fill(K,slow,.85*fp);s.stroke(K,fast,5,.9*fp);s.knockout(fast,fp);s.fill(Y,fast,.95*fp);}
  // "burst": a spark where he changes gear (the steal), speed lines while he sprints
  const bp=sm(tB-.1,tB+.3,t)*(1-sm(tQ,tQ+.5,t));
  if(bp>0){const[x,z]=posOf(VIN,TI+.15),q=pr(c,[x,.05,z]);if(q)sparkBurst(s,Y,q[0],q[1],Math.max(60,kAt(c,[x,0,z])*.8)*bp,{n:9,seed:41,g:easeOutBack(bp),width:12});}
  burstLines(s,c,tau,sm(tB,tB+.3,t),9);
  // "past defenders": navy rings under the defenders he leaves a step behind, a red arrow of his run beyond them
  const pd=sm(tP-.15,tP+.35,t);
  if(pd>0){for(const k of[RYE,HUM])groundRing(s,c,at(k,tau,0),.9,K,pd,.15);
   const pts:V3[]=[];for(let i=0;i<=8;i++){const[x,z]=posOf(VIN,lerp(TT-.1,TS,i/8));pts.push([x,.05,z]);}arrow3(s,c,pts,Math.max(9,kAt(c,pts[4])*.1),R,.95*pd);}
  const r=play(s,c,tau,tp,{smear:true,min:12,only:[VIN,BEL,GK,RYE,HUM]});
  // "Quick feet": a ring on the ball at his one touch
  const qf=sm(tQ-.2,tQ+.2,t)*(1-sm(tS,tS+.4,t));
  if(qf>0&&r.ball){const g=r.ball.g,rr=r.ball.r*2,ring:Pt[]=[];for(let i=0;i<28;i++){const a=i/28*TAU;ring.push([g[0]+Math.cos(a)*rr,g[1]+Math.sin(a)*rr]);}const rp=ribbon(ring,Math.max(5,r.ball.r*.3),{seed:8,close:true,wobble:.8,pressure:.2});s.knockout(rp,.9*qf);s.fill(Y,rp,.95*qf);}
 },
 get still(){return CUE(3,'past defenders')+.3;},
};

const film:RisoStory={
 id:'vinicius-signature',format:'11v11',title:"Vinícius's lightning burst",
 theme:'Change your speed: jog, then burst — quick feet and a sudden sprint get you past defenders',
 ageNote:'Borussia Dortmund 0–2 Real Madrid, Champions League final, Wembley, 1 June 2024. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a lightning burst — the ball jinks one way, then shoots off with speed lines behind it. Reduced motion: a spark. */
 touch(s,x,y,age,seed){
  const r=rng(seed);if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}
  const u=clamp(age/.25),out=clamp((age-.25)/.45),fade=1-clamp((age-.62)/.18);
  const bx=age<.25?x-30*Math.sin(u*Math.PI):x+230*easeOut(out),by=y+10*Math.sin(u*Math.PI)-20*out;
  if(age>.22&&age<.7)speedLines(s,K,bx,by,0,{n:4,seed:seed+2,len:120*out+20,spread:26,width:4,cov:.8*fade});
  if(age>.2&&age<.5)sparkBurst(s,Y,x,y,90,{n:8,seed:seed+1,g:easeOutBack(clamp((age-.2)/.1))*(1-clamp((age-.36)/.14)),width:12});
  if(fade>0)footballPanels(s,bx,by,30,{rot:age*14+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
/** Solved contact points (pitch metres; Dortmund's goal line x = 0, +z = Madrid's right) — checked by tests/play-film-vinicius-signature.cjs. */
export const FACTS={PRINTS,M0,IB0,IB1,RV,SP,GOAL_PT,TM,TI,TB,TT,TS,TG,ballAt,shotFoot:'r' as const,
 speed:(k:'vin'|'bel',tau:number)=>speedOf(k==='vin'?VIN:BEL,tau),
 contact:(who:'maa'|'bel'|'vin',tau:number)=>{const k=who==='maa'?MAA:who==='bel'?BEL:VIN,b=who==='maa'?B_MAA:who==='bel'?B_BEL:B_VIN,st=stateOf(k,tau),sk=solve(st.pose,b,st.place);return{lToe:sk.lToe,rToe:sk.rToe,pelvis:sk.pelvis};},
 vinAt:(tau:number)=>{const[x,z]=posOf(VIN,tau);return{x,z};},
 belAt:(tau:number)=>{const[x,z]=posOf(BEL,tau);return{x,z};},
 defAt:(which:'rye'|'hum',tau:number)=>{const[x,z]=posOf(which==='rye'?RYE:HUM,tau);return{x,z};},
 kobelAt:(tau:number)=>{const st=stateOf(GK,tau),sk=solve(st.pose,B_KOB,st.place);return{lHa:sk.lHa,rHa:sk.rHa,pelvis:sk.pelvis,head:sk.head};}};
