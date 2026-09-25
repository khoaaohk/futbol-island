/** Roy Keane — "Signature: the midfield ball-winner" (lib/town/iconicPlays.json, kind:"signature"; lesson: "Be first to every loose ball,
 * then give a simple pass to a teammate"). An iconic-play riso film (RisoStory, chapters mode) played by the card's picture window
 * (components/CardFilmPlayer.tsx) or StoryFilmPlayer. A 1:1 reconstruction from WRITTEN accounts (the footage itself was not reviewed),
 * rendered as a riso print.
 *
 * THE MOMENT (why it shows the signature): Juventus 2–3 Manchester United, UEFA Champions League semi-final SECOND LEG, 21 April 1999,
 * Stadio Delle Alpi, Turin (United won 4–3 on aggregate). United were 2–0 down after 11 minutes; in the 24th minute their captain Keane
 * arrived late at the near post, got to Beckham's corner FIRST between two Juventus players and glanced it into the far corner — the goal
 * that started the comeback. It is the most documented moment of the game written up as "one of the best individual performances ever":
 * a ball-winner being first to the ball, then (the sources stress) no celebration, straight back to work, driving United on with simple,
 * "rhythmic" passing. The film shows the real goal and his real reaction; the lesson chapter teaches the entry's lesson over it.
 *
 * SOURCES (Sept 2026, read as raw pages; cached under the build scratchpad films/src-cache/):
 *  - Wikipedia, "Juventus FC 2–3 Manchester United F.C." (raw wikitext: date 21 April 1999, 20:45, Stadio Delle Alpi, attendance 60,806,
 *    referee Urs Meier, goals Inzaghi 6', 11', Keane 24', Yorke 34', Cole 83'; line-ups and shirt numbers; kit table; Ferguson's
 *    autobiography quote "When he leapt to meet a Beckham corner and headed in our first goal…")
 *    https://en.wikipedia.org/wiki/Juventus_FC_2%E2%80%933_Manchester_United_F.C.
 *  - Wikipedia, "1998–99 Manchester United F.C. season" (Keane "headed in a Beckham cross"; the comeback from 0–2)
 *  - BBC News, "United's glorious comeback" (21 April 1999) https://news.bbc.co.uk/2/hi/sport/football/325389.stm — "The 24th minute saw a
 *    corner bring them their first, as poor marking allowed Keane to score a header past Angelo Peruzzi"
 *  - The Guardian minute-by-minute (21 April 1999) https://www.theguardian.com/football/1999/apr/21/newsstory.sport6 — "24 Beckham corner.
 *    Keane climbs highest and leaves the Juve keeper for dead with a perfectly weighted glancing header"
 *  - The Guardian retro MBM, Rob Smyth (31 March 2020) https://www.theguardian.com/football/live/2020/mar/31/juventus-v-manchester-united-1999-
 *    champions-league-semi-final-live — "24 min United move the ball smoothly from right to left, where Cole wins a corner"; "Beckham fizzed
 *    the corner to the near post, where Keane arrived late to flick an emphatic header into the far corner. He got between Pessotto and
 *    Zidane … and flashed it past Peruzzi. There's no celebration from Keane: he points to Beckham, acknowledging the quality of the corner,
 *    and runs straight back to the halfway line to get on with business"; "Keane's progressive passing setting the agenda"
 *  - The Hard Tackle, "Classic Clashes: Juventus 2-3 Manchester United – The Roy Keane Show" (2012) — "Keane leapt up between Zidane and
 *    Pesotto to meet Beckham's corner"
 * CONFIRMED by those accounts: the match, date, place and score (2–0 down, won 3–2, 4–3 on aggregate); the 24th-minute goal; Beckham's
 *   corner from United's LEFT (the move went "from right to left, where Cole wins a corner"), fizzed to the NEAR post; Keane arriving LATE,
 *   climbing highest between Pessotto and Zidane; a glancing / flicked header into the FAR corner past Peruzzi; no celebration — he points
 *   to Beckham and runs straight back to the halfway line; Keane captain (16), Beckham 7, Zidane 21, Pessotto 17, Peruzzi 1, Stam 6, Yorke 19,
 *   Cole 9, Johnsen 5; kits (Wikipedia kit table): United red shirts, white shorts, white socks; Juventus black-and-white stripes, black
 *   shorts and black socks (the shorts colour is from the kit table only — not checked in the footage, never named in the narration).
 * INFERRED (illustrative reconstruction, never named in the narration): Beckham's RIGHT foot and an in-swinging flight (his kicking foot;
 *   "fizzed to the near post" fits an in-swinger from the left); every position, run and timing in metres and seconds (the corner ≈ 31 m in
 *   ≈ 1.25 s, apex ≈ 3.5 m; Keane starting near the penalty spot and arriving ≈ 5 m out just inside the near post; the glance crossing the
 *   line at mid height inside the far post ≈ .6 s later); which way the head turns (a flick to his right, back across goal); Peruzzi one step
 *   toward the near post, beaten (no touch drawn); where the other players stood (no numbers except the named ones); Beckham's and the
 *   others' walk after the goal; Peruzzi's kit (drawn grey); kit trims, number colours and the captain's armband colour (yellow); hair; the
 *   night light; the Delle Alpi as an open two-tier bowl behind a running track under a pale membrane roof with masts; crowd colours, the
 *   United end and flags; the main camera on the far side from the corner (United attacking right → left on screen); TV lenses. The lesson
 *   chapter's "simple pass" arrow is a TEACHING MARK (an arrow to the nearest teammate), not a pass that was played.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in REAL TIME (2–0 down, the captain, Beckham at the far corner
 * flag, the corner, Keane's late run, the glance, the net, he points and runs back); ch2 = the TV slow-motion REPLAY from a low camera behind
 * the near post, looking out at his late run, with a replay trail on the corner; ch3 = a second REPLAY angle, high behind the far post: the
 * glance comes across past Peruzzi, then live again: no celebration, he points to Beckham and runs back to work; ch4 = the lesson: a close,
 * very slow replay with teaching marks (a ring on the loose-ball spot, lit footprints of the run that gets there first, the take-off spark,
 * then the simple-pass arrow to a teammate). Composed on the FULL sheet (world units = sheet units centred on the canvas; never sheet.safe),
 * so it frames from the 1.45:1 card window down to square (a narrower window widens the lens a little).
 * FIGURES: every body goes through ONE adapter, drawPlayer() → athlete.ts (continuous silhouettes, FK skeleton, full range of motion, `prev`
 * secondary motion for hair and hems, motionSmear on the corner, the header, Peruzzi's dive). Handedness: the world is right-handed (x toward
 * Juventus' goal, y up, +z = United's right), exactly athlete.ts's convention, so Beckham's strike({foot:'r'}) is his RIGHT foot and the
 * corner from United's LEFT is the −z corner; the near post is z = −3.66. Keane meets the ball facing out toward the corner, so the goal is on
 * his RIGHT: the glance is a snap of the head and shoulders to his right. Inks: yellow, red, blue, navy. Everything is keyed to cue times
 * (withTiming swaps in the recorded word onsets), poses on twos, cameras on ones; all randomness seeded. Heat: small figures print at 'low',
 * every figure inside a passage is capped; ≈ 150–330 plate ops a frame. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc,PASSAGE} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,stand,keeperSet,keeperDive,celebrate,header,posed,blendPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3,type Build} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES (≈2.7 words/s + punctuation pauses) until the Kokoro voice exists. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'Two–nil down',text:'Turin, April twenty-first, 1999, the Champions League semi-final. Manchester United are two–nil down to Juventus. Captain Roy Keane won’t give up. Beckham swings in a corner... Keane gets there first. Goal!',tail:2.4,
  cues:['Turin','April','Champions League','two–nil down','Captain Roy Keane','give up','swings in','gets there first','Goal']},
 {label:'Watch it again',text:'Watch again. Keane arrives late at the near post, squeezes between two Juventus players, and glances it into the far corner.',tail:1.6,
  cues:['Watch again','arrives late','near post','squeezes between','glances it','far corner']},
 {label:'Back to work',text:'From behind: past the keeper, in! No big celebration. Keane points to Beckham and runs back to work. United win three–two!',tail:2.2,
  cues:['From behind','past the keeper','in!','No big celebration','points to Beckham','runs back','three–two']},
 {label:'First to the ball',text:'Like Keane: be first to every loose ball, then give a simple pass to a teammate.',tail:2.2,
  cues:['Like Keane','be first','loose ball','simple pass','teammate']},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/keane-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/keane-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/keane-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('keane: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('keane: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
/** key() needs increasing times: push each key at least `gap` after the previous one (real voice timings can crowd authored offsets) */
function mono(K:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of K)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}

// ---------------------------------------------------------------- inks, vectors
const Y='yellow',R='red',B='blue',K='navy';
const add3=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const sub3=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const mul3=(a:V3,k:number):V3=>[a[0]*k,a[1]*k,a[2]*k];
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
/** Pitch: Juventus' goal line is x = 0 (United attack +x), goal centre z = 0, +z = United's right; touchlines z = ±34, halfway x = −52.5. */
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

// ---------------------------------------------------------------- the Stadio Delle Alpi at night: an open two-tier bowl behind a running track
/** stand planes (a along, b up the rake 0..1): 0 the +z side, 1 behind Juventus' goal (+x), 2 the −z side, 3 the other end. Set back behind
 * the athletics track (the Delle Alpi's stands were far from the pitch), a shallower rake than a football-only ground, two tiers. */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-136,32,a),1.6+27*b,47+34*b],
 (a,b)=>[17+30*b,1.6+25*b,lerp(-70,70,a)],
 (a,b)=>[lerp(32,-136,a),1.6+27*b,-47-34*b],
 (a,b)=>[-122-30*b,1.6+25*b,lerp(70,-70,a)],
];
/** corner joins: [stand, its end a, next stand, its end a] (rounded bowl ends, drawn as one chamfer) */
const CORNERS:[number,number,number,number][]=[[0,1,1,1],[1,0,2,0],[2,1,3,1],[3,0,0,0]];
const STAND_COLS=[104,72,104,72],STAND_ROWS=14,TIER=[.46];
/** flags on the stand fronts: [stand, a, 0 = Juventus (paper with a navy band) | 1 = United (red)] */
const FLAGS:[number,number,number][]=[[0,.22,0],[0,.38,0],[0,.55,0],[0,.72,0],[1,.25,0],[1,.45,0],[1,.7,0],[2,.2,0],[2,.36,0],[2,.52,0],[2,.7,0],[2,.84,0],[3,.3,1],[3,.42,1],[3,.62,0]];
/** where the United red sits in the crowd (inferred): a block of the far end (stand 3) */
const redAt=(si:number,a:number)=>si===3&&a>.24&&a<.5?.62:.03;
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 // an April night in Turin: a navy sky, a floodlit blue haze low down
 s.field(K,.5,.5);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz){[.12,.2,.3].forEach((d,i)=>s.tone(B,polyPath([[-1e4,hz[1]+120-i*160],[1e4,hz[1]+120-i*160],[1e4,hz[1]-190-i*160],[-1e4,hz[1]-190-i*160]],true),d));}
 const planes=new Path2D(),tier=new Path2D(),roof=new Path2D(),edge=new Path2D(),mast=new Path2D();
 for(const i of which){const S=STANDS[i];addPoly(planes,polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]));for(const b of TIER)seg3(c,S(0,b),S(1,b),1.3,tier);
  // the pale membrane roof over the upper tier, a paper lip along its front
  addPoly(roof,polyP(c,[add3(S(0,1),[0,2,0]),add3(S(1,1),[0,2,0]),add3(S(1,.7),[0,12,0]),add3(S(0,.7),[0,12,0])]));
  seg3(c,add3(S(0,.7),[0,11.8,0]),add3(S(1,.7),[0,11.8,0]),.6,edge);
  // the roof masts rising behind the stand, a cable down to the roof lip
  for(let k=0;k<3;k++){const u=(k+.5)/3,foot=S(u,1),top=add3(foot,[0,26,0]);if(toCam(c,foot)[2]<NEAR+4)continue;seg3(c,foot,top,.9,mast);seg3(c,top,add3(S(u,.7),[0,11.8,0]),.25,mast,.8);}}
 for(const[i,ai,j,aj] of CORNERS){if(!which.includes(i)&&!which.includes(j))continue;const A=STANDS[i],Bs=STANDS[j];
  addPoly(planes,polyP(c,[A(ai,0),Bs(aj,0),Bs(aj,1),A(ai,1)]));
  addPoly(roof,polyP(c,[add3(A(ai,1),[0,2,0]),add3(Bs(aj,1),[0,2,0]),add3(Bs(aj,.7),[0,12,0]),add3(A(ai,.7),[0,12,0])]));}
 // grey seats under the crowd, a paper tier fascia
 s.knockout(planes);s.tone(K,planes,.4);s.tone(B,planes,.18);s.knockout(tier,.8);
 // the crowd: seeded dots (Juventus black and white, a United red block, a few yellow), sized by distance; the roar lifts them
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(TIER.some(w=>Math.abs(b-w)<.04))continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,13);if(h<.24)continue;const a=(i+.5+(hash(i+j*31,9)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const hb=hash(i*7+j*53+si*3,21),ink=hb<redAt(si,a)?1:h<.6?0:h<.93?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.75);s.fill(R,inks[1],.95);s.fill(K,inks[2],.95);s.fill(Y,inks[3],.95);
 s.knockout(roof,.9);s.tone(B,roof,.12);s.knockout(edge,.8);s.fill(K,mast,.85);
 // flags on the stand fronts: Juventus black-and-white, United red
 const fl=new Path2D(),band=new Path2D(),red=new Path2D();
 for(const[si,a,kind] of FLAGS){if(!which.includes(si))continue;const S=STANDS[si],w=.03,P=(u:number,b:number)=>S(a+u*w,b);
  const q=polyP(c,[P(0,.005),P(1,.005),P(1,.075),P(0,.075)]);if(q.length<3)continue;fl.addPath(polyPath(q,true));
  if(kind===0){addPoly(band,polyP(c,[P(.33,.005),P(.66,.005),P(.66,.075),P(.33,.075)]));}
  else addPoly(red,q);}
 s.knockout(fl);s.fill(K,band,.95);s.fill(R,red,.95);
 // floodlights along the roof lip
 const lamp=new Path2D();for(const i of which){const S=STANDS[i];for(let k=0;k<8;k++){const u=(k+.5)/8,a=add3(S(u-.022,.7),[0,11,0]),b=add3(S(u+.022,.7),[0,11,0]);if(toCam(c,a)[2]<NEAR+2)continue;seg3(c,a,b,1,lamp);}}
 s.knockout(lamp);s.fill(Y,lamp,.75);
 if(flash>0){const p=new Path2D(),n=Math.round(24*flash);for(let i=0;i<n;i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,STANDS[si](r2,.1+.8*hash(i,Math.floor(tt*12))));if(!q)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
// ---------------------------------------------------------------- the track, grass, lines, boards, corner flags
function ground(s:Sheet,c:Cam){
 // the athletics track ring between the boards and the stands (tartan: a warm red screen)
 const tr=polyP(c,[[-124,0,-48],[19,0,-48],[19,0,48],[-124,0,48]]);if(tr.length>2){const tp=polyPath(tr,true);s.knockout(tp);s.fill(R,tp,.5);s.fill(Y,tp,.25);s.tone(K,tp,.12);}
 const g=polyP(c,[[-113,0,-39],[8,0,-39],[8,0,39],[-113,0,39]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.92);s.tone(B,gp,.8);
 // mowing stripes across the pitch, every 5.25 m
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]));s.tone(K,st,.13);
 // advertising boards: blue with paper panels (no lettering)
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([5.6,0,-37.5],[5.6,0,37.5]);board([-110,0,-37.5],[5.6,0,-37.5]);board([-110,0,37.5],[5.6,0,37.5]);
 for(let k=0;k<12;k++){const z=-36+k*6.2;addPoly(pn,polyP(c,[[5.5,.25,z],[5.5,.25,z+3.3],[5.5,.68,z+3.3],[5.5,.68,z]]));}
 for(const zz of[-37.4,37.4])for(let k=0;k<18;k++){const x=-108+k*6.4;addPoly(pn,polyP(c,[[x,.25,zz],[x+3.4,.25,zz],[x+3.4,.68,zz],[x,.68,zz]]));}
 s.knockout(bd);s.fill(B,bd,.9);s.fill(K,bd,.35);s.knockout(pn,.85);
 // painted lines
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.12,ln);
 for(let k=0;k<8;k++){L([-k*13.125,0,-34],[-(k+1)*13.125,0,-34]);L([-k*13.125,0,34],[-(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){L([0,0,-34+k*17],[0,0,-34+(k+1)*17]);L([-52.5,0,-34+k*17],[-52.5,0,-34+(k+1)*17]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(-52.5,0,9.15);
 L([0,0,-20.16],[-16.5,0,-20.16]);L([-16.5,0,-20.16],[-16.5,0,20.16]);L([-16.5,0,20.16],[0,0,20.16]);
 L([0,0,-9.16],[-5.5,0,-9.16]);L([-5.5,0,-9.16],[-5.5,0,9.16]);L([-5.5,0,9.16],[0,0,9.16]);
 {const a=Math.acos(5.5/9.15);circ(-11,0,9.15,Math.PI-a,Math.PI+a,12);}
 seg3(c,[-11.12,0,0],[-10.88,0,0],.24,ln);
 circ(0,-34,1,Math.PI/2,Math.PI,4);circ(0,34,1,Math.PI,Math.PI*1.5,4);
 s.knockout(ln);
 const pole=new Path2D(),flag=new Path2D();for(const z of[-34,34]){seg3(c,[0,0,z],[0,1.55,z],.05,pole);addPoly(flag,polyP(c,[[0,1.55,z],[0,1.2,z],[-.45,1.38,z]]));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(Y,flag,.95);
}
/** Juventus' goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep with a sloping roof; bulge pushes the back/roof out around (bz, by) */
function goal3(s:Sheet,c:Cam,bulge:number,bz:number){
 const X=0,z0=-3.66,z1=3.66,H=2.44,back=(z:number)=>X+2+bulge*.75*Math.exp(-Math.pow((z-bz)/1.6,2));
 const zs=[z0,-2.6,-1.3,0,1.8,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0),1.9,z0],[back(z0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1),1.9,z1],[back(z1),0,z1]],
  [[X,H,z0],[X,H,z1],...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)],
  [...zs.map(z=>[back(z),0,z] as V3),...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.3);s.tone(K,net,.1);
 const mesh=new Path2D();
 for(let i=0;i<=14;i++){const z=lerp(z0,z1,i/14);seg3(c,[X,H,z],[back(z),1.9,z],.022,mesh,.7);seg3(c,[back(z),1.9,z],[back(z),0,z],.022,mesh,.7);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<zs.length-1;i++)seg3(c,[back(zs[i]),y,zs[i]],[back(zs[i+1]),y,zs[i+1]],.022,mesh,.7);seg3(c,[X,y*H/1.9,z0],[back(z0),y,z0],.022,mesh,.7);seg3(c,[X,y*H/1.9,z1],[back(z1),y,z1],.022,mesh,.7);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+2*u,H-.54*u,z0],[X+2*u,H-.54*u,z1],.022,mesh,.7);}
 s.fill(K,mesh,.7);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.2,fo);seg3(c,[X,0,z1],[X,H,z1],.2,fo);seg3(c,[X,H,z0-.04],[X,H,z1+.04],.2,fo);
 s.fill(K,fo,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- the cast: kits (athlete.ts styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.28],[B,.08]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.2]];
/** Manchester United (European kit, Wikipedia kit table): red shirts, white shorts, white socks; paper numbers and trim (trim inferred) */
const mun=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,shorts:'paper',socks:'paper',boots:K,skin:SKIN_L,hair:K,line:K,trim:'paper',numberInk:'paper',hairStyle:'short',build:{height:1.8,bulk:1},...o});
/** Juventus: black-and-white stripes, black shorts, black socks (kit table); navy numbers (inferred) */
const juv=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',pattern:'stripes',patternInk:K,shorts:K,socks:K,boots:K,skin:SKIN_L,hair:K,line:K,trim:K,numberInk:R,hairStyle:'short',build:{height:1.82,bulk:1},...o});
const B_KEA:Build={height:1.78,bulk:1.02,thighs:1.05},B_BEC:Build={height:1.83,bulk:.92},B_PER:Build={height:1.81,bulk:1.14},B_ZID:Build={height:1.85,bulk:1.02},B_PES:Build={height:1.8,bulk:.96};
const KEA_ST=mun({number:16,hair:[K,.8],build:B_KEA,seed:16});
const BEC_ST=mun({number:7,hair:[Y,.85],build:B_BEC,seed:7});
/** Peruzzi's kit colour is not in the sources: drawn grey (inferred) */
const PER_ST:AthleteStyle={shirt:[K,.45],shorts:[K,.8],socks:[K,.6],boots:K,skin:SKIN_L,hair:K,line:K,trim:'paper',gloves:'paper',sleeves:'long',hairStyle:'short',number:1,numberInk:'paper',build:B_PER,seed:1};
const ZID_ST=juv({number:21,hairStyle:'balding',skin:SKIN_M,build:B_ZID,seed:21});
const PES_ST=juv({number:17,build:B_PES,seed:17});

// ---------------------------------------------------------------- the play on one clock τ (seconds; τ = 0 is Beckham's corner)
const BALL_R=.11,GRAV=9.81;
/** the fizzed corner flies TF s to Keane's forehead; his glance crosses the far half of the goal line at TG */
const TF=1.25,TG=TF+.6;
/** Keane's header spot (his pelvis) ≈ 5 m out just inside the near post; he faces out toward the corner, the goal on his RIGHT */
const HP:[number,number]=[-5.3,-2.9],YAW_H=yawTo(.62,-.78);
/** Keane's header pose: header() with a strong spring off his late run and the head + shoulders flicking to his RIGHT (back across goal) */
function keaHeader(u:number):Pose{const p=header(clamp(u));p.air*=1.05;const w=Math.sin(Math.PI*clamp((u-.34)/.36)),sn=clamp((u-.36)/.18);
 p.neckY-=lerp(-.1,.55,sn)*w;p.twist-=lerp(-.06,.34,sn)*w;p.neckP+=.03*w;return p;}
/** contact on the header clock: mid-flick */
const CU=.48,HD=.95,TJ=TF-CU*HD;
/** his forehead at contact (solved from the skeleton): the ball's centre is one radius in front of it */
const HEAD_PT:V3=(()=>{const sk=solve(keaHeader(CU),B_KEA,{x:HP[0],z:HP[1],yaw:YAW_H}),hd=sk.head,fc=sk.face,d=sub3(fc,hd),l=Math.hypot(d[0],d[1],d[2])||1;return[fc[0]+d[0]/l*(BALL_R+.02),fc[1]+d[1]/l*(BALL_R+.02)+.02,fc[2]+d[2]/l*(BALL_R+.02)] as V3;})();
/** the corner spot (ball in the quadrant at the −z corner flag: United's left) */
const P0:V3=[-.45,BALL_R,-33.55];
/** the in-swinger: a steady sideways pull TOWARD goal (+x) on top of gravity */
const SWING:V3=[2.6,-GRAV,0];
const launch=(A:V3,Bp:V3,d:number,a:V3):V3=>[(Bp[0]-A[0]-.5*a[0]*d*d)/d,(Bp[1]-A[1]-.5*a[1]*d*d)/d,(Bp[2]-A[2]-.5*a[2]*d*d)/d];
const flyA=(A:V3,V:V3,a:V3,t:number):V3=>[A[0]+V[0]*t+.5*a[0]*t*t,A[1]+V[1]*t+.5*a[1]*t*t,A[2]+V[2]*t+.5*a[2]*t*t];
const V_CROSS=launch(P0,HEAD_PT,TF,SWING);
/** Beckham strikes along the ball's launch direction */
const DC=nrm2(V_CROSS[0],V_CROSS[2]),YAW_B=yawTo(DC[0],DC[1]);
/** where Beckham's pelvis stands at contact so his RIGHT boot meets the back of the ball (solved once, FK) */
const PCB:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r'}),B_BEC,{x:0,z:0,yaw:YAW_B});return[P0[0]-DC[0]*.12-sk.rToe[0],P0[2]-DC[1]*.12-sk.rToe[2]];})();
/** the run-up: from behind the ball and to its left (a right-footer's angle) */
const LEFT_B:[number,number]=[DC[1],-DC[0]],RUN0:[number,number]=[PCB[0]-DC[0]*3.2+LEFT_B[0]*1.5,PCB[1]-DC[1]*3.2+LEFT_B[1]*1.5];
/** where the glance crosses the goal line: inside the FAR post (+z) at mid height, past Peruzzi */
const GOAL_PT:V3=[0,1.15,2.95],NET_HIT:V3=[1.5,.85,3.3],REST:V3=[1.1,BALL_R,2.9];
const G3:V3=[0,-GRAV,0];
const V_HEAD=launch(HEAD_PT,GOAL_PT,TG-TF,G3);

// ---------------------------------------------------------------- tracks: [τ, x, z], Hermite-interpolated (all illustrative, see header)
type Role='kea'|'bec'|'gk'|'mark'|'mun'|'juv';
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];hero?:boolean};
const T0=-13,T1=13,DT=.02;
const mp=(u:number):[number,number]=>[PCB[0]+DC[0]*u,PCB[1]+DC[1]*u];
/** after the goal the United players jog after Keane, arms up, as he heads back (inferred) */
const toKea=(x:number,z:number,k:number):number[][]=>[[TG+1+k*.2,x,z],[TG+4+k*.3,lerp(x,-14,.6),lerp(z,-6,.6)],[T1,lerp(x,-24,.8),lerp(z,-5,.8)]];
/** the late run: from near the penalty spot, a burst between Zidane and Pessotto to the near post */
const RUN_A:[number,number]=[-10.8,.6];
/** after the goal: he lands, points at Beckham (TG+.3 … TG+1.7), then runs straight back toward the halfway line */
const PT0=TG+.3,PT1=TG+1.7;
const ACTORS:Actor[]=[
 {name:'Roy Keane',role:'kea',hero:true,style:KEA_ST,keys:[[T0,-12.6,2],[-7,-12,1],[-3.4,-12.4,1.8],[-1.2,-11.8,1.3],[-.55,...RUN_A],[TJ-.3,HP[0]-.6,HP[1]+.5],[TJ-.05,HP[0],HP[1]],[TF+.45,HP[0]+.3,HP[1]-.3],[PT0,HP[0]+.2,HP[1]-.5],[PT1,HP[0]-.3,HP[1]-.8],[PT1+1.2,-9.5,-5],[PT1+4,-18,-7],[T1,-34,-6]]},
 {name:'David Beckham',role:'bec',hero:true,style:BEC_ST,keys:[[T0,.8,-36.2],[-6.4,.2,-35.3],[-5.2,...mp(-.7)],[-3.6,...RUN0],[-1,...RUN0],[-.5,...mp(-1.5)],[0,...mp(0)],[.7,...mp(.9)],[3,...mp(3.4)],[T1,-6,-26]]},
 {name:'Angelo Peruzzi',role:'gk',hero:true,style:PER_ST,keys:[[T0,-.7,-.3],[-2,-.8,-.7],[0,-.9,-1.1],[TF-.4,-1.2,-1.5],[TF,-1.25,-1.6],[T1,-1.25,-1.6]]},
 {name:'Zinedine Zidane (beaten, behind him)',role:'mark',hero:true,style:ZID_ST,keys:[[T0,-11.4,.2],[-3,-11.2,.6],[-1.2,-10.6,.5],[-.5,-10.2,.2],[TJ-.3,-6.9,-1.5],[TF,-6.4,-2.1],[TF+.8,-6,-2.4],[T1,-5.6,-2.6]]},
 {name:'Gianluca Pessotto (beaten, goal-side)',role:'mark',hero:true,style:PES_ST,keys:[[T0,-4.6,-4.9],[-2,-4.8,-4.7],[0,-4.8,-4.5],[TJ-.2,-4.5,-3.9],[TF,-4.4,-3.75],[TF+.8,-4.1,-3.6],[T1,-3.8,-3.4]]},
 {name:'Juventus six-yard 1',role:'juv',style:juv({build:{height:1.88},seed:22}),keys:[[T0,-4.6,-1.4],[-2,-4.8,-1.1],[0,-5,-.9],[TF,-4.6,-1.3],[T1,-4.2,-.8]]},
 {name:'Juventus six-yard 2',role:'juv',style:juv({skin:SKIN_M,seed:23}),keys:[[T0,-4.8,2.4],[-2,-5,2.2],[0,-5.3,2],[TF,-5,1.4],[T1,-4.6,1]]},
 {name:'Juventus zone 1',role:'juv',style:juv({build:{height:1.86},seed:24}),keys:[[T0,-8.6,-4.6],[-2,-8.4,-4.4],[0,-8.2,-4.2],[TF,-7.6,-3.9],[T1,-7.2,-3.4]]},
 {name:'Juventus zone 2',role:'juv',style:juv({skin:SKIN_M,seed:25}),keys:[[T0,-8.6,-.6],[-2,-8.4,-.4],[0,-8.2,-.3],[TF,-7.6,-.8],[T1,-7.2,-1]]},
 {name:'Juventus far post',role:'juv',style:juv({build:{height:1.84},seed:26}),keys:[[T0,-6.2,5.2],[0,-6.4,4.8],[TF,-6.2,4],[T1,-5.8,3.2]]},
 {name:'Juventus edge',role:'juv',style:juv({seed:27}),keys:[[T0,-15.6,-2.8],[-2,-15.4,-2.4],[0,-15.2,-2.2],[TF,-13.6,-2],[T1,-12.8,-2.2]]},
 {name:'Jaap Stam',role:'mun',style:mun({number:6,hairStyle:'bald',build:{height:1.91,bulk:1.1},seed:41}),keys:[[T0,-7,1.6],[-2,-6.8,1.4],[0,-6.6,1.2],[TF,-5.8,.4],...toKea(-5.6,0,0)]},
 {name:'Dwight Yorke',role:'mun',style:mun({number:19,skin:SKIN_D,seed:42}),keys:[[T0,-8.4,3.8],[-2,-8.2,3.6],[0,-8,3.4],[TF,-7.4,2.4],...toKea(-7.6,1.6,1)]},
 {name:'Ronny Johnsen',role:'mun',style:mun({number:5,build:{height:1.9},seed:43}),keys:[[T0,-9.4,-3.6],[-2,-9.2,-3.2],[0,-9,-3],[TF,-8.4,-3.2],...toKea(-8.2,-3.6,2)]},
 {name:'Andy Cole',role:'mun',style:mun({number:9,skin:SKIN_D,hairStyle:'bald',seed:44}),keys:[[T0,-14.4,.6],[-2,-14.2,.4],[0,-14,.3],[TF,-12.8,-.6],...toKea(-12,-1.4,3)]},
];
const KEA=0,BEC=1,GK=2,ZID=3,PES=4,STAM=11;
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 // a held key (same spot twice) keeps zero speed at its ends
 const still=(a:number[],b:number[])=>Math.abs(a[1]-b[1])+Math.abs(a[2]-b[2])<1e-6;
 const f=(j:number)=>{const m1=still(k1,k2)||still(k0,k1)?0:(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=still(k1,k2)||still(k2,k3)?0:(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (drives the gait phase) — built once */
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.06),b=posOf(k,tau+.06);return[(b[0]-a[0])/.12,(b[1]-a[1])/.12];};

// ---------------------------------------------------------------- the ball
/** placed in the quadrant (Beckham sets it down early) → the corner → the glance → the far side of the net */
function ballAt(tau:number):V3{
 if(tau<=0)return P0;
 if(tau<TF)return flyA(P0,V_CROSS,SWING,tau);
 if(tau<TG)return flyA(HEAD_PT,V_HEAD,G3,tau-TF);
 if(tau<TG+.12)return mix3(GOAL_PT,NET_HIT,easeOut((tau-TG)/.12));
 const u=clamp((tau-TG-.12)/.55),b=u>=1?.12*Math.abs(Math.sin((tau-TG-.67)*9))*Math.exp(-(tau-TG-.67)*3.5):0;
 return[lerp(NET_HIT[0],REST[0],u),Math.max(BALL_R,lerp(NET_HIT[1],BALL_R,u*u))+b,lerp(NET_HIT[2],REST[2],u)];
}
const spinAt=(tau:number)=>tau<=0?0:tau<TF?tau*TAU*5:TF*TAU*5-(tau-TF)*TAU*2;
const bulgeAt=(tau:number)=>tau<TG+.06?0:Math.exp(-(tau-TG-.06)*2.4)*(1+.3*Math.sin((tau-TG)*14));

// ---------------------------------------------------------------- poses from the tracks
function loco(k:number,tau:number):Pose{
 const v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),q=clamp(sp/7.5),ph=distOf(k,tau)/(2.3+2.1*q)+k*.37;
 const run=runCycle(ph,{speed:q});if(sp>1.4)return run;
 // set-piece jostling: knees bent, arms out, a small shuffle
 const idle=blendPose(stand(),posed({lHipF:24,rHipF:18,lKnee:30,rKnee:26,lean:14,pitch:4,neckP:-10,lShA:26,rShA:22,lElb:40,rElb:36,rAnk:-6,lAnk:-6}),.5+.5*Math.sin(tau*1.7+k));
 return blendPose(idle,run,clamp((sp-.25)/1.15));
}
/** face along the run when moving, else toward the ball (blended, so turns are continuous) */
function faceYaw(k:number,tau:number,target?:V3):number{
 const v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),p=posOf(k,tau),b=target??ballAt(tau),tx=b[0]-p[0],tz=b[2]-p[1],tl=Math.hypot(tx,tz)||1,w=clamp((sp-.6)/1.6);
 return yawTo(lerp(tx/tl,v[0]/(sp||1),w),lerp(tz/tl,v[1]/(sp||1),w));
}
const win=(t:number,a:number,b:number,e=.15)=>sm(a,a+e,t)*(1-sm(b-e,b,t));
const DEJECT=posed({lHipF:26,rHipF:26,lKnee:30,rKnee:30,lean:30,pitch:6,neckP:34,lShA:14,rShA:14,lShF:20,rShF:20,lElb:24,rElb:24});
/** Keane's point at Beckham: right arm out straight at the corner, weight settled, chin up (no celebration) */
const POINT=posed({rShF:88,rShA:14,rElb:6,rHand:.6,lShA:18,lShF:-8,lElb:34,lHipF:12,rHipF:16,lKnee:16,rKnee:18,lean:4,pitch:2,neckP:-6});
/** Peruzzi: set, a step toward the near post, then a late half dive to his left (+z, the far post) as the glance goes past */
const DIVE=(u:number)=>keeperDive(clamp(u),{side:'l',height:.55}),T_DV=TF+.08,DV_L=1.1;
type State={pose:Pose;place:Place};
function stateOf(k:number,tau:number):State{
 const a=ACTORS[k],[x,z]=posOf(k,tau);let pose=loco(k,tau),yaw=faceYaw(k,tau);
 switch(a.role){
  case 'kea':{
   // eyes on the corner, the late burst to the near post, the spring, the flick to his right, the landing, the point, the run back
   if(tau>TJ-.3&&tau<TJ+HD+.6){const u=(tau-TJ)/HD,hp=keaHeader(u);pose=blendPose(pose,hp,sm(TJ-.3,TJ,tau)*(1-sm(TJ+HD,TJ+HD+.6,tau)));}
   if(tau<-.6){yaw=faceYaw(k,tau,P0);}
   const w=sm(TJ-.5,TJ-.15,tau)*(1-sm(TF+.5,TF+1.1,tau));yaw=w>=1?YAW_H:lerpAng(yaw,YAW_H,w);
   if(tau>PT0-.3&&tau<PT1+.4){const pw=sm(PT0-.3,PT0+.1,tau)*(1-sm(PT1,PT1+.4,tau)),[bx,bz]=posOf(BEC,tau);pose=blendPose(pose,POINT,pw);yaw=lerpAng(yaw,yawTo(bx-x,bz-z),pw);}
   break;}
  case 'bec':{const w=win(tau,-.55,.85,.2);if(w>0)pose=blendPose(pose,strike(clamp(tau/1.0+STRIKE_CONTACT),{foot:'r'}),w);
   if(tau<-4.8&&tau>-6.6){// bends to set the ball in the quadrant
    pose=blendPose(pose,posed({lHipF:70,rHipF:40,lKnee:90,rKnee:60,lean:40,pitch:10,neckP:30,lShF:60,rShF:50,lElb:30,rElb:30}),win(tau,-6.6,-4.8,.5));yaw=faceYaw(k,tau,P0);}
   if(tau>-3.6&&tau<-1){yaw=lerpAng(faceYaw(k,tau,[HP[0],0,HP[1]]),YAW_B,sm(-2.2,-1.2,tau));}
   yaw=lerpAng(yaw,YAW_B,sm(-1.1,-.5,tau)*(1-sm(.9,1.6,tau)));
   if(tau>1.4)yaw=lerpAng(yaw,faceYaw(k,tau,[HP[0],0,HP[1]]),sm(1.4,1.9,tau));
   if(tau>TG+.6){const run=celebrate(distOf(k,tau)/4,{kind:'arms'});pose=blendPose(pose,run,sm(TG+.6,TG+1.2,tau)*.6);}
   break;}
  case 'gk':{const set=keeperSet(tau*1.3);pose=blendPose(set,pose,sm(.4,.8,tau)*(1-sm(TF-.7,TF-.5,tau)));
   if(tau>T_DV-.1){pose=blendPose(pose,DIVE((tau-T_DV)/DV_L),.6*sm(T_DV-.1,T_DV+.1,tau)*(1-sm(TG+.9,TG+1.5,tau)));}
   if(tau>TG+1.2)pose=blendPose(pose,DEJECT,sm(TG+1.4,TG+2.2,tau)*.6);
   yaw=faceYaw(k,Math.min(tau,TF-.05));if(tau>TF+.4)yaw=lerpAng(yaw,Math.PI,sm(TF+.4,TF+1,tau));break;}
  case 'mark':{// beaten to the near post: a late, lower jump either side of Keane, then hands on hips
   if(tau>TF-.5&&tau<TF+1){const hp=header(clamp((tau-(TF-.35))/.95));hp.air*=k===ZID?.45:.35;pose=blendPose(pose,hp,sm(TF-.5,TF-.35,tau)*(1-sm(TF+.6,TF+1,tau)));}
   if(tau>TF+.9)pose=blendPose(pose,DEJECT,sm(TF+.9,TF+1.6,tau));yaw=faceYaw(k,Math.min(tau,TF));break;}
  case 'juv':if(tau>TG+.5)pose=blendPose(pose,DEJECT,sm(TG+.8,TG+1.8,tau)*.8);if(tau>TF+.2)yaw=faceYaw(k,TF+.2);break;
  case 'mun':if(tau>TG+.3){const run=celebrate(distOf(k,tau)/4.2,{kind:'arms'});pose=blendPose(pose,run,sm(TG+.4,TG+1,tau)*.7);}break;
 }
 return{pose,place:{x,z,yaw}};
}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?, captain?): athlete.ts figure; prev = the pose one drawn frame earlier
 * (secondary motion: hair and the shirt hem trail), smear = halftone echo + speed lines on fast limbs (the corner, the header, the dive);
 * captain = the armband on the left upper arm (printed only when the arm faces the camera and the figure is big enough). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:State,smear=false,captain=false){
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 const r=drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
 if(captain&&r.detail!=='low'){const sk=r.sk,a=mix3(sk.lSh,sk.lEl,.3),b=mix3(sk.lSh,sk.lEl,.46),ca=toCam(camera,a),cc=toCam(camera,sk.chest);
  if(ca[2]<cc[2]+.06){const band=new Path2D();seg3(camera,a,b,.14,band);s.knockout(band);s.fill(Y,band,.95);s.stroke(K,band,2,.85);}}
 return r;
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
const FULL_CAP=3;
type Fig={st:State;prev?:State;style:AthleteStyle;hero:boolean;smear?:boolean;captain?:boolean};
/** depth-sorts figures, the ball and the goal (far first). Heat: small figures print at `low`; inside a passage every figure is capped. */
function drawScene(s:Sheet,c:Cam,figs:Fig[],ball:{P:V3;rot:number;min?:number;prevP?:V3|null;lines?:boolean}|null,goal:{bulge:number;bz:number}|null,cap=FULL_CAP):{ball:{g:Pt;r:number}|null}{
 const v=view(s),items:Item[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,preview=s.arrival<PASSAGE.seam-1e-3,scr0=s._passage.screen,passing=!!s._passage.pending||preview;// the outgoing shot of a passage, or the incoming preview (arrival < .88 only inside a passage, never a settled frame, so the seam stays exact)
 // heat cap: at most FULL_CAP big non-hero figures print at full detail (the nearest); the rest of a crowded box prints 'low'
 const near=figs.filter(f=>!f.hero).map(f=>toCam(c,[f.st.place.x??0,.9,f.st.place.z??0])[2]).filter(d=>d>=1).sort((a,b)=>a-b),dCap=near.length>cap?near[cap-1]:1e9;
 for(const f of figs){const q=toCam(c,[f.st.place.x??0,.9,f.st.place.z??0]);if(q[2]<1)continue;const g=scr(c,q),k=c.F/q[2]*1.8;if(Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k)continue;
  // true off-canvas cull (reads the live transform, so it also holds inside the passage's zoom): a figure wholly outside the card is skipped
  // (in the incoming preview the visible window is the aperture's screen polygon, so cull against its bounds instead)
  {const d=m.transformPoint(new DOMPoint(g[0],g[1])),rr=k*ppu*s.dpr;let x0=0,y0=0,x1=s.width*s.dpr,y1=s.height*s.dpr;
   if(preview&&scr0){x0=Math.max(x0,Math.min(...scr0.map(p=>p[0])));x1=Math.min(x1,Math.max(...scr0.map(p=>p[0])));y0=Math.max(y0,Math.min(...scr0.map(p=>p[1])));y1=Math.min(y1,Math.max(...scr0.map(p=>p[1])));}
   if(d.x<x0-rr||d.x>x1+rr||d.y<y0-rr||d.y>y1+rr)continue;}
  const px=k*ppu,style:AthleteStyle=passing?{...f.style,detail:'low'}:(!f.hero&&(px<120||q[2]>dCap))||px<44?{...f.style,detail:'low'}:f.style;
  items.push({d:q[2],draw:()=>{drawPlayer(s,f.st.pose,c,style,f.st.place,f.prev,!!f.smear&&!passing,!!f.captain);}});}
 let out:{g:Pt;r:number}|null=null;
 if(ball){const bq=toCam(c,ball.P);if(bq[2]>=NEAR)items.push({d:bq[2],draw:()=>{const r=drawBall(s,c,ball.P,ball.rot,ball);if(r)out={g:r.g,r:r.r};}});}
 if(goal){const gq=toCam(c,[1,1.2,0]);items.push({d:Math.max(NEAR,gq[2]),draw:()=>goal3(s,c,goal.bulge,goal.bz)});}
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
 return{ball:out};
}
/** the pitch at play time τ (poses on twos): every actor (prev = one drawn frame earlier), the ball, the goal */
function play(s:Sheet,c:Cam,tau:number,tauPrev:number,o:{smear?:boolean;min?:number;lines?:boolean;prevBall?:number;only?:number[];cap?:number}={}){
 const figs:Fig[]=ACTORS.flatMap((a,k)=>o.only&&!o.only.includes(k)?[]:[k]).map(k=>{const a=ACTORS[k];const st=stateOf(k,tau);const hero=!!a.hero;return{st,prev:hero?stateOf(k,tauPrev):undefined,style:a.style,hero,captain:k===KEA,
  smear:o.smear&&((k===KEA&&tau>TJ-.4&&tau<TF+.3)||(k===BEC&&tau>-.25&&tau<.35)||(k===GK&&tau>T_DV&&tau<T_DV+.6))};});
 return drawScene(s,c,figs,{P:ballAt(tau),rot:spinAt(tau),min:o.min,lines:o.lines,prevP:o.prevBall!==undefined?ballAt(o.prevBall):null},{bulge:bulgeAt(tau),bz:REST[2]},o.cap);
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
/** steps: [start, duration, shot]; each step eases in over the previous result */
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
const gnd=(P:V3,y=0):V3=>[P[0],y,P[2]];
const at=(k:number,tau:number,y=1):V3=>{const[x,z]=posOf(k,tau);return[x,y,z];};

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time
/** τ from chapter time: real time (×≈1), anchored so his forehead meets it on "gets there first" (the corner is struck on or just after "swings in") */
function tau1(t:number){const tW=CUE(0,'swings in')-.05,tH=CUE(0,'gets there first')+.1,k=clamp(TF/Math.max(.5,tH-tW),.85,1.15),tX=tH-TF/k;return Math.max(T0+.5,(t-tX)*k);}
const P1:V3=[-22,26,78];
function cam1(t:number):Cam{
 const tau=tau1(t),b=ballAt(tau);
 return plan(t,[
  [0,0,()=>({P:P1,T:[-10,0,-9],fov:25})],
  [CUE(0,'two–nil')-.2,1.4,()=>({P:P1,T:[-8,1,-2],fov:12})],
  [CUE(0,'Captain')-.1,1,()=>({P:P1,T:at(KEA,tau,1.1),fov:4.6})],
  [CUE(0,'give up')+.5,1,()=>({P:P1,T:mix3(at(BEC,tau,1),P0,.35),fov:3.4})],
  [CUE(0,'swings in')+.1,.9,()=>({P:P1,T:mix3(add3(gnd(b),[0,1.3+.3*b[1],0]),[HP[0],1.5,HP[1]],.3+.5*sm(0,TF,tau)),fov:lerp(11,13,sm(-.1,.6,tau))})],
  [CUE(0,'gets there first')-.3,.6,()=>({P:P1,T:[HP[0]+1.6,1.4,HP[1]+.6],fov:4.4})],
  [CUE(0,'Goal')+.3,1.5,()=>{const w=at(KEA,tau,1.2);return{P:P1,T:mix3(w,[-5,1.2,-8],.3),fov:10};}],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tt=twos(t),tau=tau1(tt),tp=tau1(tt-1/12),tA=CUE(0,'Goal'),tN=CUE(0,'gets there first')+.5;
  stadium(s,c,t,[2,1,3],{roar:sm(tN,tN+.5,t),flash:sm(tA-.1,tA+.4,t)*(1-sm(tA+2.2,tA+3,t))});
  ground(s,c);
  play(s,c,tau,tp,{min:19,lines:true,prevBall:tau1(t-.06)});
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return CUE(0,'gets there first')+.3;},
};

// ---------------------------------------------------------------- 2 · the slow-motion replay from low behind the near post, looking out at Keane's late run
const tau2=(t:number)=>key(t,mono([[0,-1.3],[CUE(1,'arrives late'),-.6],[CUE(1,'near post'),-.05],[CUE(1,'squeezes between'),TJ-.1],[CUE(1,'glances it'),TF-.1],[CUE(1,'far corner'),TF+.35],[SECS(1)-.2,TG+.7]]),linear);
const E2:V3=[3.4,.9,-8.6];
function cam2(t:number):Cam{
 const tau=tau2(t),r=at(KEA,tau,1.3);
 return plan(t,[
  [0,0,()=>({P:E2,T:[-9,1.2,.5],fov:34})],
  [CUE(1,'arrives')-.2,1,()=>({P:E2,T:mix3(r,[HP[0],1.3,HP[1]],.25),fov:24})],
  [CUE(1,'squeezes')-.3,1,()=>({P:add3(E2,[0,.2,.3]),T:[HP[0],1.9,HP[1]],fov:18})],
  [CUE(1,'glances')-.2,.8,()=>({P:add3(E2,[0,.3,.4]),T:[HEAD_PT[0]+.3,HEAD_PT[1]-.45,HEAD_PT[2]],fov:17})],
  [CUE(1,'far corner')-.1,1.1,()=>({P:add3(E2,[0,.3,.4]),T:mix3([HEAD_PT[0],1.5,HEAD_PT[2]],[0,1.2,2.9],.6),fov:44})],
 ]);
}
/** the replay trail: the corner's path so far, a fading yellow ribbon (printed under the players) */
function trail(s:Sheet,c:Cam,tau:number,fade:number){
 if(fade<=0||tau<=0)return;const pts:Pt[]=[];const a=Math.max(0,tau-.8),b=Math.min(tau,TG);for(let i=0;i<=22;i++){const p=pr(c,ballAt(lerp(a,b,i/22)));if(p)pts.push(p);}
 if(pts.length<3)return;const w=Math.max(8,kAt(c,ballAt(Math.min(tau,TG)))*.16);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*fade);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tt=twos(t),tau=tau2(tt),tp=tau2(tt-1/12);
  stadium(s,c,t,[0,3],{roar:sm(TG,TG+.4,tau),flash:sm(TG+.05,TG+.3,tau)});
  ground(s,c);
  trail(s,c,tau,1-sm(TG+.1,TG+.55,tau));
  const r=play(s,c,tau,tp,{smear:true,min:10,cap:2});
  // the touch: a spark on his forehead at contact
  const hit=(tau-TF)/.16;if(hit>0&&hit<1&&r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],r.ball.r*4.5,{n:9,seed:17,g:easeOutBack(clamp(hit*2))*(1-clamp((hit-.5)*2)),width:r.ball.r*.5});
 },
 aperture(t){const c=cam2(t),P=ballAt(tau2(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return CUE(1,'glances it')+.1;},
};

// ---------------------------------------------------------------- 3 · a second replay high behind the far post, then live: no celebration, back to work
const tau3=(t:number)=>key(t,mono([[0,TF-.8],[CUE(2,'past the keeper'),TF+.2],[CUE(2,'in!'),TG+.05],[CUE(2,'No big'),TG+.35],[CUE(2,'points to'),TG+.95],[CUE(2,'runs back'),PT1+.6],[CUE(2,'three–two'),PT1+2.6],[SECS(2),PT1+4.6]]),linear);
const E3:V3=[10.5,5.2,6.5];
function cam3v(t:number):Cam{
 const tau=tau3(t),r=at(KEA,tau,1.2),bk=at(BEC,tau,1);
 return plan(t,[
  [0,0,()=>({P:E3,T:[-5,1.4,-2],fov:30})],
  [CUE(2,'past the keeper')-.3,.9,()=>({P:E3,T:[-2.2,1.4,.4],fov:26})],
  [CUE(2,'No big')-.3,1.3,()=>({P:[-1,5,15],T:mix3(r,bk,.22),fov:30})],
  [CUE(2,'runs back')+.1,1.5,()=>({P:[-9,6,16],T:mix3(r,[-12,1,-6],.3),fov:30})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tt=twos(t),tau=tau3(tt),tp=tau3(tt-1/12),tE=CUE(2,'three–two');
  stadium(s,c,t,[0,2,3],{roar:sm(TG,TG+.4,tau),flash:Math.max(sm(TG+.05,TG+.3,tau)*(1-sm(TG+1.4,TG+2,tau)),sm(tE,tE+.3,t))});
  ground(s,c);
  const r=play(s,c,tau,tp,{smear:true,min:11,lines:true,prevBall:tau3(t-.06),cap:2});
  // the replay graphic: the glance's path printed over the net so the ball reads through the mesh
  const hf=sm(TF-.05,TF+.05,tau)*(1-sm(TG+.3,TG+.8,tau));if(hf>0){const pts:Pt[]=[];for(let i=0;i<=16;i++){const p=pr(c,ballAt(lerp(TF,Math.min(tau,TG),i/16)));if(p)pts.push(p);}
   if(pts.length>2){const w=Math.max(6,kAt(c,HEAD_PT)*.12);s.stroke(K,ribbon(pts,w*1.3,{taper:.9,pressure:.2,wobble:0}),3,.8*hf);s.knockout(ribbon(pts,w*1.3,{taper:.9,pressure:.2,wobble:0}),hf);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.95*hf);}}
  const hit=(tau-TF)/.16;if(hit>0&&hit<1&&r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],Math.max(50,r.ball.r*4.5),{n:9,seed:23,g:easeOutBack(clamp(hit*2))*(1-clamp((hit-.5)*2)),width:Math.max(6,r.ball.r*.5)});
 },
 aperture(t){const c=cam3v(t),p=stateOf(KEA,tau3(twos(t))),sk=solve(p.pose,B_KEA,p.place),q=pr(c,sk.chest)??[0,0];return apertureDisc(q[0],q[1],60,12);},
 get still(){return CUE(2,'points to')+.2;},
};

// ---------------------------------------------------------------- 4 · the lesson: a close, very slow replay with teaching marks
/** the loose-ball spot: where the corner drops at the near post, just outside the six-yard box */
const NPZ:V3=[-5.3,0,-3.1];
const tau4=(t:number)=>key(t,mono([[0,-1.1],[CUE(3,'be first'),-.5],[CUE(3,'loose ball'),TF-.05],[CUE(3,'simple pass'),TG+.5],[CUE(3,'teammate'),TG+.9],[SECS(3),TG+1.5]]),linear);
function cam4v(t:number):Cam{
 const tau=tau4(t),w=at(KEA,tau,1.2);
 return plan(t,[
  [0,0,()=>({P:[-9.5,2.6,-13.5],T:[-7.4,1,-.8],fov:46})],
  [CUE(3,'be first')-.2,1,()=>({P:[-9.2,2,-12.6],T:mix3(w,[HP[0],1,HP[1]],.45),fov:38})],
  [CUE(3,'loose ball')-.4,.8,()=>({P:[-8.8,1.8,-11.8],T:[HP[0]+.2,1.6,HP[1]],fov:26})],
  [CUE(3,'simple pass')-.3,1,()=>({P:[-11.5,4.2,-8.5],T:mix3(w,at(STAM,tau,1),.5),fov:36})],
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
/** a flat dashed ring on the grass */
function groundRing(s:Sheet,c:Cam,P:V3,rad:number,ink:string,a:number){
 const X=pr(c,[P[0],.01,P[2]]);if(!X||a<=0)return;const pts:Pt[]=[];for(let i=0;i<24;i++){const u=i/24*TAU,p=pr(c,[P[0]+Math.cos(u)*rad,.01,P[2]+Math.sin(u)*rad]);if(p)pts.push(p);}
 if(pts.length<8)return;const gaps:[number,number][]=[];for(let i=0;i<12;i++)gaps.push([(i+.66)/12,(i+.96)/12]);
 const d=ribbon(pts.concat([pts[0]]),Math.max(7,kAt(c,P)*.11),{seed:31,taper:0,wobble:.6,gaps});s.knockout(d,.8*a);s.fill(ink,d,.95*a);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tt=twos(t),tau=tau4(tt),tp=tau4(tt-1/12);
  const tL=CUE(3,'Like Keane'),tF=CUE(3,'be first'),tB=CUE(3,'loose ball'),tP=CUE(3,'simple pass'),tM=CUE(3,'teammate');
  stadium(s,c,t,[0,1,3],{roar:.35+.4*sm(tL,tL+.6,t)*(1-sm(tF+.6,tF+1.4,t))+.5*sm(tB+.2,tB+.8,t)});
  ground(s,c);
  // "be first": a red ring on the loose-ball spot and an arrow of his run into it
  const ap=sm(tF-.2,tF+.3,t)*(1-sm(tP-.2,tP+.4,t));groundRing(s,c,NPZ,1.4,R,ap);
  if(ap>0){const pts:V3[]=[];const u=sm(tF,tF+1,t,easeInOutSine);for(let i=0;i<=8;i++){const[x,z]=herm(ACTORS[KEA].keys,lerp(-.55,TJ-.05,u*i/8));pts.push([x,.02,z]);}arrow3(s,c,pts,Math.max(8,kAt(c,NPZ)*.08),R,.9*ap);}
  // his run's footprints light up in order as he arrives ahead of Zidane and Pessotto
  const run=sm(tF-.1,tF+.4,t)*(1-sm(tP-.2,tP+.4,t));
  if(run>0){const dim=new Path2D(),lit=new Path2D();for(let k=0;k<9;k++){const Tk=-.55+k*((TJ-.05+.55)/8),[x,z]=posOf(KEA,Tk),v=velOf(KEA,Tk),n=nrm2(-v[1],v[0]),side=k%2?.14:-.14,pts:Pt[]=[];
    for(let i=0;i<12;i++){const a=i/12*TAU,p=pr(c,[x+n[0]*side+Math.cos(a)*.16,.01,z+n[1]*side+Math.sin(a)*.1]);if(p)pts.push(p);}(Tk<=tau+.02?lit:dim).addPath(polyPath(pts,true));}
   s.knockout(dim,.75*run);s.stroke(K,lit,5,.9*run);s.knockout(lit,run);s.fill(Y,lit,.95*run);}
  const r=play(s,c,tau,tp,{smear:true,min:12,only:[KEA,GK,ZID,PES,STAM]});
  // "loose ball": a ring on the ball as he wins it, and a spark at contact
  const lb=sm(tB-.2,tB+.2,t);
  if(lb>0&&r.ball&&tau<TF+.1){const g=r.ball.g,rr=r.ball.r*1.9,ring:Pt[]=[];for(let i=0;i<28;i++){const a=i/28*TAU;ring.push([g[0]+Math.cos(a)*rr,g[1]+Math.sin(a)*rr]);}const rp_=ribbon(ring,Math.max(5,r.ball.r*.28),{seed:8,close:true,wobble:.8,pressure:.2});s.knockout(rp_,.9*lb);s.fill(Y,rp_,.95*lb);}
  const hit=(tau-TF)/.2;if(hit>0&&hit<1&&r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],Math.max(60,r.ball.r*5),{n:9,seed:41,g:easeOutBack(clamp(hit*2))*(1-clamp((hit-.5)*2)),width:Math.max(8,r.ball.r*.5)});
  // "simple pass … teammate": a teaching arrow (not a real pass) along the grass from Keane to the nearest teammate, a yellow ring on him
  const ps=sm(tP-.1,tP+.5,t);
  if(ps>0){const a=at(KEA,tau,.02),b=at(STAM,tau,.02),d=sub3(b,a),l=Math.hypot(d[0],d[2])||1,e=add3(a,mul3(d,(l-.7)/l)),u=sm(tP,tP+.8,t,easeInOutSine),pts:V3[]=[];
   for(let i=0;i<=6;i++)pts.push(mix3(add3(a,mul3(d,.45/l)),e,u*i/6));if(u>.05)arrow3(s,c,pts,Math.max(8,kAt(c,a)*.07),Y,.95*ps);
   groundRing(s,c,b,.8,Y,sm(tM-.2,tM+.3,t));}
  // his forehead glows as he wins it
  if(lb>0&&tau<TG+.4){const st=stateOf(KEA,tau),sk=solve(st.pose,B_KEA,st.place),h=sk.head,fc=sk.face,fp=add3(h,mul3(sub3(fc,h),1.05)),q=pr(c,add3(fp,[0,.05,0])),fade=1-sm(TF+.2,TG+.4,tau);
   if(q&&fade>0){const rr=kAt(c,fp)*.07,glow=polyPath(blob(q[0],q[1],rr,rr*.8,11,{amp:.06,n:16}),true);s.knockout(glow,.8*fade*lb);s.fill(Y,glow,.9*fade*lb);}}
 },
 get still(){return CUE(3,'simple pass')+.3;},
};

const film:RisoStory={
 id:'keane-signature',format:'11v11',title:'Keane: first to the ball',
 theme:'The midfield ball-winner: be first to every loose ball, then give a simple pass to a teammate',
 ageNote:'Juventus 2–3 Manchester United, Champions League semi-final second leg, Turin, 21 April 1999. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a near-post glance — a ball arrives from the side, a yellow spark where it is met, and it is flicked away. Reduced motion: the spark. */
 touch(s,x,y,age,seed){
  const r=rng(seed);if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}
  const u=clamp(age/.3),out=clamp((age-.3)/.35),fade=1-clamp((age-.55)/.2);
  const bx=age<.3?x+190*(1-u):x+220*easeOut(out),by=age<.3?y-90*(1-u)*(1-u)-10:y+30*out;
  if(age>.26&&age<.6)sparkBurst(s,Y,x,y,110,{n:9,seed:seed+1,g:easeOutBack(clamp((age-.26)/.12))*(1-clamp((age-.46)/.14)),width:14});
  if(fade>0)footballPanels(s,bx,by,30,{rot:age*16+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
/** Solved contact points (pitch metres; Juventus' goal line x = 0, +z = United's right) — checked by tests/play-film-keane-signature.cjs. */
export const FACTS={P0,HEAD_PT,HP,GOAL_PT,TF,TG,PT0,PT1,ballAt,cornerFoot:'r' as const,
 beckhamContact:()=>{const st=stateOf(BEC,0),sk=solve(st.pose,B_BEC,st.place);return{lToe:sk.lToe,rToe:sk.rToe};},
 keaneAt:(tau:number)=>{const st=stateOf(KEA,tau),sk=solve(st.pose,B_KEA,st.place);return{head:sk.head,face:sk.face,air:st.pose.air,pelvis:sk.pelvis,rHa:sk.rHa,yaw:st.place.yaw??0};},
 beckhamAt:(tau:number)=>{const[x,z]=posOf(BEC,tau);return[x,z] as [number,number];},
 markerAt:(k:'zidane'|'pessotto',tau:number)=>{const i=k==='zidane'?ZID:PES,st=stateOf(i,tau),sk=solve(st.pose,k==='zidane'?B_ZID:B_PES,st.place);return{head:sk.head};},
 peruzziAt:(tau:number)=>{const st=stateOf(GK,tau),sk=solve(st.pose,B_PER,st.place);return{lHa:sk.lHa,rHa:sk.rHa,pelvis:sk.pelvis};}};
