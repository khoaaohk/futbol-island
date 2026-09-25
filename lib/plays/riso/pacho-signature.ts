/** Iconic-play film · Willian Pacho, "Signature: the recovery sprint" (lib/town/iconicPlays.json: kind "signature", template
 * last_ditch_tackle, side centre; lesson "Turn and sprint back goal-side before you try to win the ball."). A riso film (RisoStory, chapters
 * mode) played by the card's picture window (CardFilmPlayer) or StoryFilmPlayer.
 *
 * THE REAL MATCH (chapter 1 only): Paris Saint-Germain 5–0 Inter Milan, UEFA Champions League final, Saturday 31 May 2025, 21:00 CEST,
 * Allianz Arena ("Munich Football Arena"), Munich — the final whistle: PSG's first Champions League, Pacho (No. 51, left centre-back, on for
 * all 90 minutes) the first Ecuadorian ever to win the competition.
 * WHY / HONEST FALLBACK: the signature is a trait, not one goal. The written accounts I could reach describe the trait IN this match — the
 * Sporting News live blog at 35 minutes: "Inter have managed to get themselves into the attacking third at times, but William Pacho is a
 * world-class tracking back at pace to deal with the Inter breakaways" — but none describes ONE recovery sprint beat by beat (who, where,
 * which minute). So, per the brief, NO recovery, tackle or block is staged inside the real match: chapter 1 shows only confirmed things (the
 * arena at night, the 5–0 on the screen, PSG celebrating at the whistle, Pacho among them) and the narration quotes the reporter. The move
 * itself is chapters 2–4, a clearly labelled DEMONSTRATION ("Watch how he does it"): a training pitch by day, a plain blue training top,
 * red bibs, cones, no crowd, no opponent, no score, no date. His one described defensive action in the final — "acrobatically clearing the
 * ball on the end line" / "hooking his leg around Barella" before PSG's second goal — is not a recovery sprint and is the opening of the
 * approved dembele-signature film, so it is not restaged here; no other final goal is restaged either.
 *
 * SOURCES (read 24 Sep 2026 with curl, generic User-Agent, cached in scratchpad/films/src-cache/):
 *  - Sporting News live blog (Kyle Bonn), 31 May 2025: 35th min "William Pacho is a world-class tracking back at pace to deal with the Inter
 *    breakaways"; 47th min Pacho "cuts down Marcus Thuram on the right flank" (not used); "the defensive supremacy of Nuno Mendes and
 *    William Pacho"; PSG XI Donnarumma — Hakimi, Marquinhos, 51. Pacho, Mendes — Neves, Vitinha, F. Ruiz — Doué, Dembélé, Kvaratskhelia
 *    (subs: Barcola 67', L. Hernández 78', Mayulu, Zaïre-Emery, Ramos 83'; Pacho not replaced)
 *    https://www.sportingnews.com/ca/soccer/news/champions-league-final-live-score-highlights-psg-inter-milan/b2e383de259813761e2eea4a
 *    [sportingnews-psg-inter-final-2025.txt]
 *  - Wikipedia, "Willian Pacho" (raw): Ecuadorian centre-back, 1.88 m, PSG No. 51 (signed August 2024 from Eintracht Frankfurt); "On 31 May
 *    2025, he started in a 5–0 victory over Inter Milan in the Champions League final, becoming the first Ecuadorian to win the competition"
 *    https://en.wikipedia.org/wiki/Willian_Pacho  [wiki-willian-pacho.txt]
 *  - Wikipedia, "2025 UEFA Champions League final" (31 May 2025, 21:00 CEST, Allianz Arena, Munich; 5–0; kit boxes: PSG all dark navy with
 *    the 2024–25 home pattern; Inter the 2024–25 THIRD kit, yellow; Pacho 51 at CB; "Willian Pacho acrobatically clearing the ball on the
 *    end line to start a counterattack")  https://en.wikipedia.org/wiki/2025_UEFA_Champions_League_final  [wiki-2025-ucl-final.txt]
 *  - The Guardian minute-by-minute (Scott Murray), 31 May 2025: PSG XI (Pacho between Marquinhos and Nuno Mendes); "Pacho ensures it
 *    doesn't go out for a goal kick, hooking his leg around Barella" (the 20th-minute clearance, not used); Pacho 23 years old
 *    https://www.theguardian.com/football/live/2025/may/31/champions-league-final-paris-saint-germain-v-inter-live
 *    [guardian-psg-inter-final-2025-live.html]
 *  - Card data: lib/town/playerAppearance.json (Ecuador; skin 6, short black hair, no facial hair); lib/town/playerCareers.json
 *    (Independiente del Valle 2019–22, Royal Antwerp 2022–23, Eintracht Frankfurt 2023–24, Paris Saint-Germain 2024–).
 * CONFIRMED: the match, date, venue, night kick-off and result (PSG 5–0 Inter, PSG's first Champions League); Pacho started and played the
 *  whole final, No. 51, centre-back beside Marquinhos with Nuno Mendes outside him (left side); the first Ecuadorian to win the competition;
 *  a reporter's line that he was "world-class tracking back at pace to deal with the Inter breakaways"; kits: PSG dark navy shirts, shorts
 *  and socks; Inter yellow (2024–25 third kit); his height 1.88 m.
 * INFERRED (illustrative, never narrated): the celebration as drawn (who jumps, who kneels, where on the pitch, the Inter players' slumps);
 *  the big screen's place under the roof and its design (bars and digits, no lettering); the PSG shirt's central red-and-white band (not
 *  drawn, the figure library has no single band: navy with red trim); the crowd colours; the arena as drawn (steep three-tier bowl, roof
 *  ring, floodlights). Chapters 2–4 are a DEMONSTRATION, not match footage: the chipped ball over his head, the attacker, every position,
 *  path and timing, which way he turns (drawn: a drop-step to the side the ball goes, the coaching point), the tackling foot (solved from the
 *  geometry, never narrated), the training kit, the ground and the weather.
 *
 * FRAMING (TV cameras, never top-down): ch1 = the high main-stand camera, live, at the whistle (the bowl → the 5–0 on the big screen → Pacho
 * jumping with his team-mates → wider on the celebration); ch2 = "How he does it", a raised side camera in real time: a ball chipped over his
 * head, he turns and sprints back, gets goal-side, then steps in and pokes it away; ch3 = the slow-motion replay from LOW beside the goal he
 * is protecting: the hip turn, the arm drive, arriving between the ball and the goal, the poke; ch4 = the lesson from high behind that goal
 * (the only chapter with teaching marks: the attacker ringed, his sprint path, the ball-to-goal line with him on it, then the win). Composed on
 * the FULL sheet (world units = sheet units centred on the canvas; never sheet.safe), framing from the 1.45:1 card window down to square.
 * FIGURES: every body goes through ONE adapter, drawPlayer() → athlete.ts (`prev` secondary motion, motionSmear on the turn, the sprint and
 * the poke); small wide-shot figures and every figure inside a passage print at `low`/`mid` detail. Handedness: the world is right-handed,
 * athlete.ts's own convention (x toward the goal he defends in the demo, y up; a figure facing +x has +z on its right), so solved feet are
 * the feet drawn. Inks: yellow, red, blue, navy. Everything is keyed to cue times (withTiming swaps in the recorded word onsets), poses
 * on twos, cameras on ones; all randomness seeded. Heat: ≈ 150–320 plate ops a frame (at most 4 non-hero figures at full detail). */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,hash,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,dribble,stand,keeperSet,celebrate,posed,blendPose,backpedal,lunge,
 STRIKE_CONTACT,type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3,type Build} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets (every cue starts with a plain word:
 * Kokoro splits contractions and hyphens); `at` and each chapter's `seconds` are ESTIMATES until the Kokoro voice exists. LEAD: once
 * scripts/plays/kokoro-narrate.py has written public/plays/narration/pacho-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/pacho-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The final',text:'Munich, 2025, the Champions League final. Paris beat Inter five–nil, and Willian Pacho became the first Ecuadorian to win it! One reporter said he was world class at tracking back.',tail:1.6,
  cues:['Munich','Champions League final','Paris beat Inter','Willian Pacho','first Ecuadorian','One reporter','tracking back']},
 {label:'How he does it',text:'Watch how he does it. The ball goes over his head… so Pacho turns and sprints back!',tail:2.8,
  cues:['Watch how','The ball goes over','so Pacho turns','sprints back']},
 {label:'The replay',text:'Watch again, slowly. He turns his hips, pumps his arms, and gets between the ball and the goal. Now he wins it!',tail:1.6,
  cues:['Watch again','He turns his hips','pumps his arms','between the ball','Now he wins']},
 {label:'The lesson',text:'If an attacker gets past you, turn and sprint back goal side first. Then try to win the ball.',tail:2.4,
  cues:['If an attacker','turn and sprint','goal side first','Then try','win the ball']},
];
import timingJson from '../../../public/plays/narration/pacho-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (calibrated on the approved films' Kokoro timings, ≈ .32 s a word): .2 s + .02 s a letter, pauses after , . ! ? … */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.2+.02*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.2;if(/[.!?]$/.test(w))t+=.36;if(/…$/.test(w))t+=.4;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('pacho: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('pacho: no cue '+w);return c.at;};
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
/** Pitch: one goal line at x = 0 (the goal PACHO DEFENDS in the demonstration), the other at x = −105; goal centre z = 0; touchlines z = ±34. */
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

// ---------------------------------------------------------------- the Munich arena at night: a steep closed bowl, three tiers, the roof ring
const CX=-52.5;
/** stand planes (a along, b up the rake 0..1): 0 the far side (+z), 1 behind the x = 0 goal, 2 the main stand (−z, the camera side), 3 the
 * other end. Closed corners join them. Steep and tall (three stacked tiers), close to the pitch. */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-115,10,a),1.2+30*b,40+26*b],
 (a,b)=>[8+24*b,1.2+29*b,lerp(42,-42,a)],
 (a,b)=>[lerp(10,-115,a),1.2+30*b,-40-26*b],
 (a,b)=>[-113-24*b,1.2+29*b,lerp(-42,42,a)],
];
const CORNERS:[number,number,number,number][]=[[0,1,1,0],[1,1,2,0],[2,1,3,0],[3,1,0,0]];
const STAND_COLS=[92,64,92,64],STAND_ROWS=13,TIER=[.34,.67];
/** crowd colours (inferred): PSG red / blue and white round most of the ground, Inter's end in blue and yellow */
const interAt=(si:number,a:number)=>si===3?.6:si===0&&a<.3?.35:.06;
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 // a partly cloudy May night: a navy sky, a floodlit haze low down
 s.field(K,.55,.5);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz)[.12,.2,.28].forEach((d,i)=>s.tone(B,polyPath([[-1e4,hz[1]-120+i*160],[1e4,hz[1]-120+i*160],[1e4,hz[1]+190+i*160],[-1e4,hz[1]+190+i*160]],true),d));
 const planes=new Path2D(),tier=new Path2D(),roof=new Path2D(),edge=new Path2D();
 for(const i of which){const S=STANDS[i];addPoly(planes,polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]));for(const b of TIER)seg3(c,S(0,b),S(1,b),1.1,tier);
  addPoly(roof,polyP(c,[add3(S(0,1),[0,1.5,0]),add3(S(1,1),[0,1.5,0]),add3(S(1,.74),[0,11,0]),add3(S(0,.74),[0,11,0])]));
  seg3(c,add3(S(0,.74),[0,10.8,0]),add3(S(1,.74),[0,10.8,0]),.5,edge);}
 for(const[i,ai,j,aj]of CORNERS){if(!which.includes(i)||!which.includes(j))continue;const A=STANDS[i],Bs=STANDS[j];
  addPoly(planes,polyP(c,[A(ai,0),Bs(aj,0),Bs(aj,1),A(ai,1)]));
  addPoly(roof,polyP(c,[add3(A(ai,1),[0,1.5,0]),add3(Bs(aj,1),[0,1.5,0]),add3(Bs(aj,.74),[0,11,0]),add3(A(ai,.74),[0,11,0])]));}
 s.knockout(planes);s.tone(K,planes,.42);s.tone(B,planes,.2);s.knockout(tier,.8);
 // the crowd: seeded dots sized by distance (paper, red, blue, yellow); the roar lifts them
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(TIER.some(w=>Math.abs(b-w)<.035))continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,13);if(h<.22)continue;const a=(i+.5+(hash(i+j*31,9)-.5)*.6)/cols,q=toCam(c,S(a,b));if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const hb=hash(i*7+j*53+si*3,21),ink=hb<interAt(si,a)?(h<.6?2:3):h<.55?1:h<.85?0:2;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.75);s.fill(R,inks[1],.95);s.fill(B,inks[2],.95);s.fill(Y,inks[3],.95);
 s.knockout(roof);s.tone(K,roof,.35);s.knockout(edge,.8);
 // floodlights along the roof lip
 const lamp=new Path2D();for(const i of which){const S=STANDS[i];for(let k=0;k<8;k++){const u=(k+.5)/8,a=add3(S(u-.022,.74),[0,10,0]),b=add3(S(u+.022,.74),[0,10,0]);if(toCam(c,a)[2]<NEAR+2)continue;seg3(c,a,b,1,lamp);}}
 s.knockout(lamp);s.fill(Y,lamp,.75);
 // camera flashes round the bowl
 if(flash>0){const p=new Path2D(),n=Math.round(26*flash);for(let i=0;i<n;i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,STANDS[si](r2,.1+.8*hash(i,Math.floor(tt*12))));if(!q)continue;
  const z=8+12*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.6);}
}
/** seven-segment digits for the big screen: segments a..g as unit-box strokes */
const SEGS:Record<string,string>={'0':'abcdef','5':'acdfg'};
const SEG_XY:Record<string,[number,number,number,number]>={a:[0,1,1,1],b:[1,1,1,.5],c:[1,.5,1,0],d:[0,0,1,0],e:[0,0,0,.5],f:[0,.5,0,1],g:[0,.5,1,.5]};
/** the big screen hung under the roof behind the x = 0 goal (illustrative): PSG's navy-and-red half with a 5, Inter's yellow half with a 0 */
function bigScreen(s:Sheet,c:Cam,on:number){
 const X=15,z0=-10,z1=10,y0=16.5,y1=24,P=(z:number,y:number):V3=>[X,y,z];
 const frameP=polyP(c,[P(z0-.6,y0-.6),P(z1+.6,y0-.6),P(z1+.6,y1+.6),P(z0-.6,y1+.6)]);if(frameP.length<3)return;
 const fp=polyPath(frameP,true);s.knockout(fp);s.fill(K,fp,.95);
 // PSG on the left as the pitch sees it (facing +x, +z is on the right), Inter on the right
 const half=(za:number,zb:number)=>polyPath(polyP(c,[P(za,y0+.4),P(zb,y0+.4),P(zb,y1-.4),P(za,y1-.4)]),true);
 const L=half(z0+.4,-1.2),Rh=half(1.2,z1-.4);
 s.knockout(L,.5*on);s.fill(K,L,.9);s.fill(R,half(z0+.4,z0+1.6),.9*on);s.knockout(Rh,.9*on);s.fill(Y,Rh,.95*on);
 // digits (paper on navy for PSG's 5; navy on yellow for Inter's 0) and a dash between
 const dig=(ch:string,zc:number,ink:'paper'|string)=>{const p=new Path2D(),w=3.2,h=5.2,yb=y0+1.2;for(const sg of SEGS[ch]){const[a0,b0,a1,b1]=SEG_XY[sg];seg3(c,P(zc-w/2+a0*w,yb+b0*h),P(zc-w/2+a1*w,yb+b1*h),.62,p,2);}
  if(ink==='paper')s.knockout(p,.95*on);else s.fill(ink,p,.95*on);};
 dig('5',-5.4,'paper');dig('0',5.4,K);
 const d=new Path2D();seg3(c,P(.7,y0+3.8),P(-.7,y0+3.8),.5,d,2);s.knockout(d,.9*on);
}
/** the training pitch for the demonstration: a pale afternoon sky, a line of trees, no crowd */
function trainingGround(s:Sheet,c:Cam){
 s.field(B,.3,.5);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz)s.tone(Y,polyPath([[-1e4,hz[1]-300],[1e4,hz[1]-300],[1e4,hz[1]+60],[-1e4,hz[1]+60]],true),.3);
 const tr=new Path2D();const ring=(a:number):V3=>[-50+Math.cos(a)*120,0,Math.sin(a)*95];
 for(let i=0;i<72;i++){const a0=i/72*TAU,a1=(i+1)/72*TAU,h0=9+5*hash(i,3),h1=9+5*hash(i+1,3);addPoly(tr,polyP(c,[ring(a0),ring(a1),add3(ring(a1),[0,h1,0]),add3(ring(a0),[0,h0,0])]));}
 s.knockout(tr);s.fill(K,tr,.55);s.tone(B,tr,.4);
}
// ---------------------------------------------------------------- grass, lines, boards, corner flags, cones
function ground(s:Sheet,c:Cam,o:{boards?:boolean;night?:boolean;cones?:boolean}={}){
 const boards=o.boards??true;
 const g=polyP(c,[[-118,0,-46],[13,0,-46],[13,0,46],[-118,0,46]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,o.night?.9:.88);s.tone(B,gp,o.night?.78:.7);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]));s.tone(o.night?K:B,st,o.night?.13:.2);
 if(boards){const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
  board([4.5,0,-37.5],[4.5,0,37.5]);board([-109.5,0,-37.5],[-109.5,0,37.5]);board([-109.5,0,-37.5],[4.5,0,-37.5]);board([-109.5,0,37.5],[4.5,0,37.5]);
  for(let k=0;k<18;k++){const x=-107+k*6.2;for(const zz of[-37.45,37.45])addPoly(pn,polyP(c,[[x,.25,zz],[x+3.3,.25,zz],[x+3.3,.68,zz],[x,.68,zz]]));}
  for(let k=0;k<11;k++){const z=-35+k*6.6;for(const x of[4.45,-109.45])addPoly(pn,polyP(c,[[x,.25,z],[x,.25,z+3.4],[x,.68,z+3.4],[x,.68,z]]));}
  s.knockout(bd);s.fill(B,bd,.9);s.fill(K,bd,.35);s.knockout(pn,.85);}
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
 for(let k=0;k<8;k++){L([-k*13.125,0,-34],[-(k+1)*13.125,0,-34]);L([-k*13.125,0,34],[-(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){L([0,0,-34+k*17],[0,0,-34+(k+1)*17]);L([CX,0,-34+k*17],[CX,0,-34+(k+1)*17]);L([-105,0,-34+k*17],[-105,0,-34+(k+1)*17]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(CX,0,9.15);
 for(const[gx,dir]of[[0,-1],[-105,1]]as[number,number][]){
  L([gx,0,-20.16],[gx+dir*16.5,0,-20.16]);L([gx+dir*16.5,0,-20.16],[gx+dir*16.5,0,20.16]);L([gx+dir*16.5,0,20.16],[gx,0,20.16]);
  L([gx,0,-9.16],[gx+dir*5.5,0,-9.16]);L([gx+dir*5.5,0,-9.16],[gx+dir*5.5,0,9.16]);L([gx+dir*5.5,0,9.16],[gx,0,9.16]);
  const a=Math.acos(5.5/9.15),mid=dir<0?Math.PI:0;circ(gx+dir*11,0,9.15,mid-a,mid+a,12);}
 for(const cx of[-11,CX,-94]){const d:V3[]=[];for(let i=0;i<12;i++){const a=i/12*TAU;d.push([cx+Math.cos(a)*.15,0,Math.sin(a)*.15]);}addPoly(ln,polyP(c,d));}
 s.knockout(ln,.92);
 const pole=new Path2D(),flag=new Path2D();for(const x of[0,-105])for(const z of[-34,34]){seg3(c,[x,0,z],[x,1.55,z],.05,pole);addPoly(flag,polyP(c,[[x,1.55,z],[x,1.2,z],[x+(x?.45:-.45),1.38,z]]));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(Y,flag,.95);
 if(o.cones){const cn=new Path2D();for(const[x,z]of CONES){const q=polyP(c,[[x-.16,0,z],[x+.16,0,z],[x,.3,z]]),q2=polyP(c,[[x,0,z-.16],[x,0,z+.16],[x,.3,z]]);addPoly(cn,q);addPoly(cn,q2);}s.knockout(cn);s.fill(R,cn,.9);s.fill(Y,cn,.5);}
}
/** training cones marking the drill channel (inferred) */
const CONES:[number,number][]=[[-44,-12],[-34,-12],[-24,-12],[-44,9],[-34,9],[-24,9],[-18,-12],[-18,9]];
/** a goal on line gx whose net runs out by dir (the demo goal: gx 0, dir +1) */
function goal3(s:Sheet,c:Cam,gx=0,dir=1){
 const X=gx,z0=-3.66,z1=3.66,H=2.44,bx=X+2*dir;
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[bx,1.9,z0],[bx,0,z0]],[[X,0,z1],[X,H,z1],[bx,1.9,z1],[bx,0,z1]],[[X,H,z0],[X,H,z1],[bx,1.9,z1],[bx,1.9,z0]],[[bx,0,z0],[bx,0,z1],[bx,1.9,z1],[bx,1.9,z0]]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.3);s.tone(K,net,.12);
 const mesh=new Path2D();
 for(let i=0;i<=12;i++){const z=lerp(z0,z1,i/12);seg3(c,[X,H,z],[bx,1.9,z],.022,mesh,.7);seg3(c,[bx,1.9,z],[bx,0,z],.022,mesh,.7);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;seg3(c,[bx,y,z0],[bx,y,z1],.022,mesh,.7);seg3(c,[X,y*H/1.9,z0],[bx,y,z0],.022,mesh,.7);seg3(c,[X,y*H/1.9,z1],[bx,y,z1],.022,mesh,.7);}
 s.knockout(mesh,.8);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.2,fo);seg3(c,[X,0,z1],[X,H,z1],.2,fo);seg3(c,[X,H,z0-.04],[X,H,z1+.04],.2,fo);
 s.fill(K,fo,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- the cast: kits (athlete.ts styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.18]],SKIN_M:InkFill[]=[[Y,.42],[R,.26],[K,.06]],SKIN_D:InkFill[]=[[Y,.8],[R,.62],[K,.28]];
/** PSG (Wikipedia kit box): dark navy shirts, shorts and socks; red trim; paper numbers. The central band is not drawn (see INFERRED). */
const psg=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[K,.95],trim:R,shorts:[K,.95],socks:[K,.95],boots:K,skin:SKIN_L,hair:K,hairStyle:'short',line:K,shade:[B,.35],sleeves:'short',numberInk:'paper',build:{height:1.8},...o});
/** Inter (Wikipedia kit box: the 2024–25 third kit): yellow shirts, shorts and socks; black detail drawn as navy trim. */
const inter=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:Y,trim:K,shorts:Y,socks:Y,boots:K,skin:SKIN_L,hair:K,hairStyle:'short',line:K,shade:[K,.3],sleeves:'short',numberInk:K,build:{height:1.83},...o});
/** Willian Pacho: No. 51, 1.88 m, Ecuador; skin 6 (dark), short black hair, clean-shaven (card data) */
const B_PAC:Build={height:1.88,bulk:1.04,thighs:1.05};
const PAC_ST=psg({number:51,skin:SKIN_D,hair:[K,.95],build:B_PAC,seed:51});

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
type State={pose:Pose;place:Place};
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the state one drawn frame earlier (secondary
 * motion: hair and the shirt hem trail), smear = halftone echo + speed lines on fast limbs (the turn, the sprint, the poke). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:State,smear=false){
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
}
const BALL_R=.11,GRAV=9.81;
function drawBall(s:Sheet,c:Cam,P:V3,rot:number,o:{min?:number;prevP?:V3|null;lines?:boolean}={}){
 const q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??12,c.F*BALL_R/q[2]);
 const sh:Pt[]=[];const rad=.16+P[1]*.05;for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*1.3,0,P[2]+Math.sin(a)*rad]);if(p)sh.push(p);}
 if(sh.length>8)s.tone(K,polyPath(sh,true),clamp(.5-P[1]*.1,.08,.5));
 if(o.lines&&o.prevP){const a=pr(c,o.prevP);if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.8)speedLines(s,K,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:4,seed:7,len:Math.min(260,d*1.4),spread:r*.9,width:Math.max(2.5,r*.18),cov:.8});}}
 footballPanels(s,g[0],g[1],r,{rot,key:K,shadow:B,seed:5});
 return{g,r,d:q[2]};
}
type Item={d:number;draw:()=>void};
const FULL_CAP=4;
type Fig={st:State;prev?:State;style:AthleteStyle;hero:boolean;smear?:boolean};
/** depth-sorts figures, the ball and extras (far first). Heat: small figures print at `low`; inside a passage every figure is capped. */
function drawScene(s:Sheet,c:Cam,figs:Fig[],ball:{P:V3;rot:number;min?:number;prevP?:V3|null;lines?:boolean}|null,extra:Item[]=[]):{ball:{g:Pt;r:number}|null}{
 const v=view(s),items:Item[]=[...extra],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending;
 const near=figs.filter(f=>!f.hero).map(f=>toCam(c,[f.st.place.x??0,.9,f.st.place.z??0])[2]).filter(d=>d>=1).sort((a,b)=>a-b),dCap=near.length>FULL_CAP?near[FULL_CAP-1]:1e9;
 for(const f of figs){const q=toCam(c,[f.st.place.x??0,.9,f.st.place.z??0]);if(q[2]<1)continue;const g=scr(c,q),k=c.F/q[2]*1.8;if(Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k)continue;
  const px=k*ppu,style:AthleteStyle=passing?{...f.style,detail:f.hero?'mid':'low'}:(!f.hero&&(px<120||q[2]>dCap))||px<44?{...f.style,detail:'low'}:f.style;
  items.push({d:q[2],draw:()=>{drawPlayer(s,f.st.pose,c,style,f.st.place,f.prev,!!f.smear&&!passing);}});}
 let out:{g:Pt;r:number}|null=null;
 if(ball){const bq=toCam(c,ball.P);if(bq[2]>=NEAR)items.push({d:bq[2]-.3,draw:()=>{const r=drawBall(s,c,ball.P,ball.rot,ball);if(r)out={g:r.g,r:r.r};}});}
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
 return{ball:out};
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
/** steps: [start, duration, shot]; each step eases in over the previous result */
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
const win=(t:number,a:number,b:number,e=.15)=>sm(a,a+e,t)*(1-sm(b-e,b,t));
const READY=posed({lHipF:24,rHipF:18,lKnee:34,rKnee:30,lHipA:10,rHipA:10,lean:16,pitch:3,lShA:20,rShA:20,lShF:10,rShF:14,lElb:44,rElb:40,neckP:-4});
const SLUMP=posed({lHipF:30,rHipF:30,lKnee:36,rKnee:36,lean:34,pitch:6,neckP:30,lShA:14,rShA:14,lShF:24,rShF:24,lElb:20,rElb:20});
const HANDS_KNEES=posed({lHipF:62,rHipF:56,lKnee:40,rKnee:36,lean:44,pitch:10,neckP:16,lShF:70,rShF:66,lShA:8,rShA:8,lElb:18,rElb:22,lHipA:8,rHipA:8});
const HANDS_HEAD=posed({lHipF:6,rHipF:4,lKnee:8,rKnee:6,lean:-4,neckP:-18,lShF:120,rShF:118,lShA:60,rShA:60,lElb:130,rElb:128});

// ---------------------------------------------------------------- 1 · the final whistle in Munich: the high main-stand camera
/** the celebration (illustrative): Pacho jumping with both arms up near the centre circle, team-mates jumping, running, on their knees;
 * Inter players slumped. Unnamed figures carry no numbers. */
type Cel={at:[number,number];face:number;style:AthleteStyle;kind:'jump'|'run'|'knees'|'slump'|'hands'|'head';ph:number;hero?:boolean;run?:[number,number]};
const PAC_AT:[number,number]=[-47,-7];
const CEL:Cel[]=[
 {at:PAC_AT,face:-2.2,style:PAC_ST,kind:'jump',ph:0,hero:true},
 {at:[-48.6,-5.6],face:-1.4,style:psg({skin:SKIN_M,seed:61,build:{height:1.78}}),kind:'jump',ph:.37},
 {at:[-45.4,-5.9],face:-2.8,style:psg({seed:62,build:{height:1.74},hair:[Y,.5]}),kind:'jump',ph:.71},
 {at:[-50.5,-9.5],face:-1.7,style:psg({skin:SKIN_D,seed:63,build:{height:1.83}}),kind:'knees',ph:0},
 {at:[-42,-12],face:-2.4,style:psg({skin:SKIN_M,seed:64,build:{height:1.71}}),kind:'run',ph:.2,run:[-46,-8.5]},
 {at:[-56,-2],face:-1.1,style:psg({seed:65,build:{height:1.86}}),kind:'run',ph:.6,run:[-49.5,-6.2]},
 {at:[-38,4],face:-2,style:psg({skin:SKIN_D,seed:66,build:{height:1.8}}),kind:'jump',ph:.15},
 {at:[-54,6],face:.6,style:inter({seed:71}),kind:'slump',ph:0},
 {at:[-40,-1],face:2.4,style:inter({skin:SKIN_M,seed:72,build:{height:1.9}}),kind:'hands',ph:0},
 {at:[-60,-10],face:1.2,style:inter({seed:73,build:{height:1.8}}),kind:'head',ph:0},
 {at:[-33,9],face:2.8,style:inter({skin:SKIN_D,seed:74}),kind:'slump',ph:0},
];
function celState(k:number,t:number):State{
 const a=CEL[k];let x=a.at[0],z=a.at[1],yaw=a.face,pose:Pose;
 switch(a.kind){
  case 'jump':pose=celebrate(t*.95+a.ph,{kind:'arms'});break;
  case 'knees':pose=celebrate(.86,{kind:'kneeSlide'});break;
  case 'run':{const u=clamp(t/3.2),e=easeOut(u),r=a.run!;x=lerp(a.at[0],r[0],e);z=lerp(a.at[1],r[1],e);yaw=yawTo(r[0]-a.at[0],r[1]-a.at[1]);
   pose=blendPose(celebrate(t*1.3+a.ph,{kind:'run'}),celebrate(t*.95+a.ph,{kind:'arms'}),sm(.8,1,u));break;}
  case 'slump':pose=blendPose(SLUMP,HANDS_KNEES,.3+.1*Math.sin(t*.8+k));break;
  case 'hands':pose=blendPose(HANDS_KNEES,SLUMP,.2+.1*Math.sin(t*.7));break;
  default:pose=blendPose(HANDS_HEAD,stand(),.15+.1*Math.sin(t*.9));
 }
 return{pose,place:{x,z,yaw}};
}
const P1:V3=[-44,30,-88];
function cam1(t:number):Cam{
 const pa:V3=[PAC_AT[0],1.1,PAC_AT[1]];
 return plan(t,[
  [0,0,()=>({P:P1,T:[-34,5,6],fov:28})],
  [CUE(0,'Paris beat')-.3,1.4,()=>({P:P1,T:[13,19.5,0],fov:13})],
  [CUE(0,'Willian Pacho')-.25,1.2,()=>({P:P1,T:pa,fov:4.2})],
  [CUE(0,'first Ecuadorian')+.2,2,()=>({P:P1,T:add3(pa,[0,.1,0]),fov:3.6})],
  [CUE(0,'One reporter')-.2,1.6,()=>({P:P1,T:[-46,1,-4],fov:11})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tt=twos(t),tP=CUE(0,'Paris beat');
  stadium(s,c,t,[0,1,3],{roar:.7,flash:.55+.45*sm(tP-.2,tP+.4,t)*(1-sm(tP+3,tP+4,t))});
  bigScreen(s,c,sm(.1,.6,t));
  ground(s,c,{night:true});
  goal3(s,c,0,1);goal3(s,c,-105,-1);
  const figs:Fig[]=CEL.map((a,k)=>({st:celState(k,tt),prev:a.hero?celState(k,tt-1/12):undefined,style:a.style,hero:!!a.hero}));
  drawScene(s,c,figs,null);
 },
 aperture(t){const c=cam1(t),p=celState(0,twos(t)),sk=solve(p.pose,B_PAC,p.place),q=pr(c,sk.chest)??[0,0];return apertureDisc(q[0],q[1],60,12);},
 get still(){return CUE(0,'first Ecuadorian')+.4;},
};

// ---------------------------------------------------------------- 2–4 · "How he does it": a DEMONSTRATION on a training pitch (not match footage)
/** demo clock u (s). Pacho (blue training top) stands 38 m out, level with an attacker (red bib). A team-mate of the attacker chips the ball
 * over Pacho's head (u = 0) into the space behind him, to his right. Pacho drop-steps (opens his hips to the ball's side), turns and sprints
 * back on the inside line, straight for the spot between the ball and the middle of his goal; the attacker has to go wide to collect it and
 * slows to control it. Pacho arrives goal-side first, brakes and turns to face him, jockeys, and only then steps in and pokes the ball away. */
type Path=[number,number,number][];// [u, x, z]
function pathAt(p:Path,u:number):[number,number]{
 const n=p.length;if(u<=p[0][0])return[p[0][1],p[0][2]];if(u>=p[n-1][0])return[p[n-1][1],p[n-1][2]];
 let i=0;while(i<n-2&&u>=p[i+1][0])i++;
 const a=p[i],b=p[i+1],h=b[0]-a[0],v=(u-a[0])/h,v2=v*v,v3=v2*v;
 const tan=(j:number,k:1|2)=>{if(j<=0||j>=n-1)return 0;return(p[j+1][k]-p[j-1][k])/(p[j+1][0]-p[j-1][0]);};
 const f=(k:1|2)=>(2*v3-3*v2+1)*a[k]+(v3-2*v2+v)*h*tan(i,k)+(-2*v3+3*v2)*b[k]+(v3-v2)*h*tan(i+1,k);
 return[f(1),f(2)];
}
const U_MIN=-2,U_MAX=10,DU=.02;
function distTable(p:Path){const out:number[]=[0];let q=pathAt(p,U_MIN);for(let u=U_MIN+DU;u<=U_MAX+1e-9;u+=DU){const r=pathAt(p,u);out.push(out[out.length-1]+Math.hypot(r[0]-q[0],r[1]-q[1]));q=r;}return out;}
const distAt=(tab:number[],u:number)=>{const f=(clamp(u,U_MIN,U_MAX)-U_MIN)/DU,i=Math.min(tab.length-2,Math.floor(f));return lerp(tab[i],tab[i+1],f-i);};
const velAt=(p:Path,u:number):[number,number]=>{const a=pathAt(p,u-.06),b=pathAt(p,u+.06);return[(b[0]-a[0])/.12,(b[1]-a[1])/.12];};
const speedAt=(p:Path,u:number)=>{const v=velAt(p,u);return Math.hypot(v[0],v[1]);};
/** the chip: struck at u = 0 from B0, lands at LAND at U_LAND, one low bounce to the attacker's first touch at U_TOUCH */
const U_LAND=1.9,U_TOUCH=2.25,U_TK=5.35,LUNGE_D=.6,LUNGE_REACH=.6;
const B0:V3=[-56,BALL_R,5],LAND:V3=[-28.6,BALL_R,-7];
const G3:V3=[0,-GRAV,0];
const launch=(A:V3,Bp:V3,d:number,a:V3):V3=>[(Bp[0]-A[0]-.5*a[0]*d*d)/d,(Bp[1]-A[1]-.5*a[1]*d*d)/d,(Bp[2]-A[2]-.5*a[2]*d*d)/d];
const flyA=(A:V3,V:V3,a:V3,t:number):V3=>[A[0]+V[0]*t+.5*a[0]*t*t,A[1]+V[1]*t+.5*a[1]*t*t,A[2]+V[2]*t+.5*a[2]*t*t];
const V_CHIP=launch(B0,LAND,U_LAND,G3);
/** the attacker: level with Pacho, times his run, bends wide to the ball, first touch, then drives at goal and slows as Pacho blocks it */
const AT_PATH:Path=[[U_MIN,-40.6,2.9],[-.6,-40.1,2.6],[.3,-37.9,1.2],[1.2,-33,-3],[U_TOUCH-.05,-26.4,-7.5],[3.0,-23.4,-6.6],[3.8,-20.6,-5.3],[4.6,-18.4,-4.4],[5.2,-17.3,-3.95],[5.7,-17.0,-3.85],[6.6,-16.7,-3.9],[U_MAX,-16.6,-4]];
const AT_TAB=distTable(AT_PATH);
/** his ball while dribbling: a lead in front of him along his run, pulsing with each touch; exactly .62 m ahead at the poke */
const headingAt=(u:number):[number,number]=>{const a=pathAt(AT_PATH,u-.08),b=pathAt(AT_PATH,u+.08);return nrm2(b[0]-a[0],b[1]-a[1]);};
function dribbleBall(u:number):V3{const[x,z]=pathAt(AT_PATH,u),d=headingAt(Math.min(u,U_TK)),ph=distAt(AT_TAB,u)/1.5,lead=.62+.2*Math.sin(TAU*ph)*(1-sm(U_TK-.5,U_TK,u));return[x+d[0]*lead,BALL_R,z+d[1]*lead];}
const TK:V3=dribbleBall(U_TK);
/** the poke: Pacho faces the ball from the goal side; the lunge leg is the one on the ball's side (solved, never narrated) */
const P_JOCK:[number,number]=[-14.3,-3.1];
const FACE_TK=nrm2(TK[0]-P_JOCK[0],TK[2]-P_JOCK[1]),YAW_TK=yawTo(FACE_TK[0],FACE_TK[1]);
const SIDE_TK=('r' as 'l'|'r');
const PK:[number,number]=(()=>{const sk=solve(lunge(LUNGE_REACH,{side:SIDE_TK}),B_PAC,{x:0,z:0,yaw:YAW_TK}),t=SIDE_TK==='l'?sk.lToe:sk.rToe;return[TK[0]-t[0]-FACE_TK[0]*.06,TK[2]-t[2]-FACE_TK[1]*.06];})();
/** the ball squirts away off his toe, wide toward the touchline; he follows it and takes it away */
const POKE_END:V3=[-12.2,BALL_R,-9.4];
const L0=U_TK-LUNGE_REACH*LUNGE_D;
/** Pacho's run (all illustrative): set 38 m out → drop-step (U_T0..U_T1) → the sprint on the inside line → brake goal-side (≈ U_B) → jockey →
 * step in and poke (U_TK) → after the ball */
const U_T0=.2,U_T1=.8,U_B=4.1;
const PAC_PATH:Path=[[U_MIN,-38.4,-.8],[0,-38.2,-.9],[U_T0,-38.1,-1],[U_T1,-37.3,-1.4],[1.6,-33.6,-1.9],[2.6,-25.6,-2.5],[3.5,-18.4,-3],[U_B,-15.2,-3.2],[4.5,-14.4,-3.15],[L0-.35,...P_JOCK],[L0,...PK],[U_TK,...PK],[U_TK+.5,PK[0]+.3,PK[1]-.8],[U_TK+1.5,-12.6,-8.5],[U_TK+2.4,-15.5,-11.5],[U_MAX,-24,-15]];
const PAC_TAB=distTable(PAC_PATH);
function demoBall(u:number):V3{
 if(u<=0)return B0;
 if(u<U_LAND)return flyA(B0,V_CHIP,G3,u);
 if(u<U_TOUCH){const k=(u-U_LAND)/(U_TOUCH-U_LAND),T=dribbleBall(U_TOUCH);const p=mix3(LAND,T,k);p[1]=BALL_R+.45*Math.sin(Math.PI*k);return p;}
 if(u<U_TK)return dribbleBall(u);
 if(u<U_TK+1.3){const k=easeOut(clamp((u-U_TK)/1.3));return mix3(TK,POKE_END,k);}
 // Pacho has it: at his feet, carried away
 const[x,z]=pathAt(PAC_PATH,u),v=velAt(PAC_PATH,u),d=nrm2(v[0],v[1]);const own:V3=[x+d[0]*.6,BALL_R,z+d[1]*.6];return mix3(POKE_END,own,sm(U_TK+1.3,U_TK+1.7,u));
}
const spinOf=(u:number)=>u<=0?0:u*TAU*2.4;
/** yaw along a path's heading */
const heading=(p:Path,u:number)=>{const v=velAt(p,u);return yawTo(v[0],v[1]);};
/** Pacho, facing the passer before the chip; his drop-step turns him to HIS RIGHT (the ball's side): yaw DEcreases through facing −z */
const YAW0=yawTo(B0[0]-(-38.2),B0[2]-(-.9));
const YAW_RUN=heading(PAC_PATH,1.2);
const TURN=(()=>{let d=YAW_RUN-YAW0;while(d>0)d-=TAU;while(d<-TAU)d+=TAU;return d;})();
/** at the brake he spins back to face the attacker, again to his right */
const YAW_FACE_AT=(u:number)=>{const[x,z]=pathAt(PAC_PATH,u),b=demoBall(Math.min(u,U_TK));return yawTo(b[0]-x,b[2]-z);};
const BRAKE=posed({lHipF:44,rHipF:-8,lKnee:34,rKnee:58,lAnk:-14,rAnk:10,lean:4,pitch:-9,neckP:-6,lShF:-20,rShF:40,lShA:30,rShA:24,lElb:70,rElb:60,squash:-.08});
const DROP=posed({lHipF:14,rHipF:-26,rHipR:40,lKnee:40,rKnee:36,lean:22,pitch:10,twist:-24,neckY:-40,lShF:30,rShF:-30,lShA:26,rShA:20,lElb:80,rElb:80});
function demoPac(u:number):State{
 const[x,z]=pathAt(PAC_PATH,u),s=speedAt(PAC_PATH,u),ph=distAt(PAC_TAB,u)/(2.3+2.3*clamp(s/8.5));
 const run=runCycle(ph,{speed:clamp(s/8.5)});
 let p:Pose=READY,yaw=YAW0;
 if(u<U_T0){yaw=YAW0;p=READY;}
 else if(u<U_T1+.5){const k=clamp((u-U_T0)/(U_T1-U_T0));yaw=YAW0+TURN*easeInOutSine(k);
  // the drop-step: hips open to the right, head over the shoulder to the ball, then into the sprint
  p=blendPose(blendPose(READY,DROP,sm(0,.45,k)),run,sm(.35,1,k)*sm(U_T0,U_T1+.3,u));
  if(u>U_T1)yaw=lerpAng(YAW0+TURN,heading(PAC_PATH,u),sm(U_T1,U_T1+.4,u));}
 else if(u<U_B-.35){yaw=heading(PAC_PATH,u);p=run;}
 else{// brake, spin to face the ball (to his right), settle into the jockey
  const hd=heading(PAC_PATH,U_B-.35),tgt=YAW_FACE_AT(Math.min(u,L0));let d=tgt-hd;while(d>0)d-=TAU;while(d<-TAU)d+=TAU;
  const k=sm(U_B-.35,U_B+.35,u);yaw=k<1?hd+d*k:tgt;yaw=lerpAng(yaw,YAW_TK,sm(L0-.5,L0,u));
  p=blendPose(run,BRAKE,sm(U_B-.35,U_B-.05,u));p=blendPose(p,blendPose(READY,backpedal(distAt(PAC_TAB,u)/1.2),.35),sm(U_B+.05,U_B+.45,u));}
 // the poke: lunge to the ball, then recover and go after it
 if(u>L0-.2&&u<U_TK+.7){p=blendPose(p,lunge(clamp((u-L0)/LUNGE_D),{side:SIDE_TK}),sm(L0-.2,L0,u)*(1-sm(U_TK+.25,U_TK+.7,u)));yaw=lerpAng(yaw,YAW_TK,sm(L0-.3,L0,u));}
 if(u>U_TK+.35){const k=sm(U_TK+.35,U_TK+.9,u);yaw=lerpAng(u<L0?yaw:YAW_TK,heading(PAC_PATH,u),k);p=blendPose(p,u<U_TK+1.6?run:dribble(distAt(PAC_TAB,u)/1.7,{foot:'r',speed:clamp(s/6)}),k);}
 // head: looks for the ball over his shoulder during the sprint (two glances), otherwise at it
 if(u>U_T0&&u<U_B){const b=demoBall(u),look=wrap(yawTo(b[0]-x,b[2]-z)-yaw),g=Math.max(win(u,1.5,2.05,.2),win(u,2.9,3.4,.2),1-sm(U_T1-.1,U_T1+.2,u));p={...p,neckY:clamp(look,-1.2,1.2)*g,twist:p.twist+clamp(look,-1.2,1.2)*.25*g};}
 return{pose:p,place:{x,z,yaw}};
}
function demoAT(u:number):State{
 const[x,z]=pathAt(AT_PATH,u),s=speedAt(AT_PATH,u),ph=distAt(AT_TAB,u)/(2.2+2*clamp(s/8.5));
 let p:Pose=blendPose(READY,runCycle(ph,{speed:clamp(s/8.5)}),sm(.4,1.6,s));
 const b0=demoBall(u);let yaw=lerpAng(yawTo(b0[0]-x,b0[2]-z),heading(AT_PATH,Math.max(u,-.4)),sm(-1.1,-.3,u));
 if(u>U_TOUCH-.3&&u<U_TK+.2)p=blendPose(p,dribble(distAt(AT_TAB,u)/1.5,{foot:'r',speed:clamp(s/6)}),sm(U_TOUCH-.3,U_TOUCH,u));
 if(u>U_TK){p=blendPose(p,SLUMP,sm(U_TK+.3,U_TK+1.3,u)*.6);const b=demoBall(u);yaw=lerpAng(yaw,yawTo(b[0]-x,b[2]-z),sm(U_TK,U_TK+.6,u));}
 return{pose:p,place:{x,z,yaw}};
}
/** the passer (red bib): a right-footed chip at u = 0, solved so the boot meets the ball */
const DC=nrm2(V_CHIP[0],V_CHIP[2]),YAW_P=yawTo(DC[0],DC[1]);
const B_PS:Build={height:1.78};
const PPS:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r',power:.7}),B_PS,{x:0,z:0,yaw:YAW_P});return[B0[0]-DC[0]*.12-sk.rToe[0],B0[2]-DC[1]*.12-sk.rToe[2]];})();
function demoPS(u:number):State{
 const w=win(u,-.9,1,.25);let p=stand();if(w>0)p=blendPose(p,strike(clamp(u/1.0+STRIKE_CONTACT),{foot:'r',power:.7}),w);
 const run:[number,number]=[PPS[0]-DC[0]*1.4,PPS[1]-DC[1]*1.4],k=sm(-1.4,-.5,u),x=lerp(run[0],PPS[0],k),z=lerp(run[1],PPS[1],k);
 return{pose:p,place:{x,z,yaw:YAW_P}};
}
const DEMO_B:Build=B_PAC;
/** training kit (inferred): Pacho a plain blue top, navy shorts and socks; the attackers red bibs over white tops; the keeper grey */
const DEMO_P:AthleteStyle={shirt:[B,.95],shorts:K,socks:K,boots:K,skin:SKIN_D,hair:[K,.95],line:K,trim:'paper',hairStyle:'short',build:DEMO_B,seed:51};
const DEMO_A=(seed:number,o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[R,.95],shorts:K,socks:'paper',boots:K,skin:SKIN_L,hair:[K,.8],line:K,trim:'paper',hairStyle:'short',build:{height:1.8},seed,...o});
const DEMO_GK:AthleteStyle={shirt:[K,.4],shorts:[K,.6],socks:[K,.4],boots:K,skin:SKIN_M,hair:K,hairStyle:'short',line:K,sleeves:'long',gloves:'paper',build:{height:1.9},seed:81};
function demoGK(u:number):State{const b=demoBall(u),x=-1.4+Math.min(1,Math.max(0,(b[0]+30)/30))*-.8,z=clamp(b[2]*.12,-1.2,1.2);return{pose:keeperSet(u*1.2),place:{x,z,yaw:yawTo(b[0]-x,b[2]-z)}};}
/** the demonstration's figures + ball, depth-sorted */
function drawDemo(s:Sheet,c:Cam,u:number,up:number,upp:number,o:{smear?:boolean;extra?:Item[];lines?:boolean}={}){
 const sp=!!o.smear;
 const figs:Fig[]=[
  {st:demoPac(up),prev:demoPac(upp),style:DEMO_P,hero:true,smear:sp&&((up>U_T0&&up<U_T1+.6)||(up>L0-.1&&up<U_TK+.2))},
  {st:demoAT(up),prev:demoAT(upp),style:DEMO_A(31,{skin:SKIN_M,build:{height:1.8}}),hero:true},
  {st:demoPS(up),style:DEMO_A(32,{build:{height:1.78}}),hero:false},
  {st:demoGK(up),style:DEMO_GK,hero:false},
 ];
 return drawScene(s,c,figs,{P:demoBall(u),rot:spinOf(u),min:10,lines:o.lines,prevP:o.lines?demoBall(u-.06):null},o.extra);
}
const pacXZ=(u:number):V3=>{const p=pathAt(PAC_PATH,u);return[p[0],0,p[1]];};
const atXZ=(u:number):V3=>{const p=pathAt(AT_PATH,u);return[p[0],0,p[1]];};

// ---------------------------------------------------------------- 2 · live demonstration: a raised side camera, real time
/** near real time (×1.15, so the recorded 6 s chapter holds the whole move and the poke lands before the passage), anchored so the chip is
 * right over his head on "The ball goes over"; he is already sprinting as the voice says "so Pacho turns" (the replay syncs the turn) */
const RATE2=1.15,U_OVER=1.3;
const tau2=(t:number)=>Math.max(U_MIN,U_OVER+(t-CUE(1,'The ball goes'))*RATE2);
/** a side camera that keeps Pacho, the attacker, the ball (and the passer until the chip lands) in frame: it slides along the touchline
 * with them and zooms to their spread, like a broadcast operator following the play */
function cam2(t:number):Cam{
 const u=tau2(t),P=pacXZ(u),A=atXZ(u),b=demoBall(u),ps=demoPS(u).place,wP=1-sm(.4,1.6,u);
 const xs=[P[0],A[0],b[0],lerp(P[0],ps.x??P[0],wP)],x0=Math.min(...xs),x1=Math.max(...xs),zs=[P[2],A[2],b[2]];
 const cx=(x0+x1)/2,cz=(Math.min(...zs)+Math.max(...zs))/2,half=(x1-x0)/2+3,D=28,fov=clamp(2*Math.atan(half/1.45/D)*180/Math.PI,7,26);
 return cam3([cx+6,9,cz-D],[cx,.9+.3*Math.max(0,b[1]-1),cz],fov);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),u=tau2(t),tt=twos(t),up=tau2(tt),upp=tau2(tt-1/12);
  trainingGround(s,c);
  ground(s,c,{boards:false,cones:true});
  goal3(s,c,0,1);
  const r=drawDemo(s,c,u,up,upp,{smear:true,lines:true});
  const hit=sm(U_TK-.05,U_TK+.05,u)*(1-sm(U_TK+.2,U_TK+.5,u));if(hit>0&&r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],Math.max(40,r.ball.r*4)*hit,{n:8,seed:41,width:6});
 },
 aperture(t){const c=cam2(t),q=pr(c,add3(pacXZ(tau2(twos(t))),[0,1.2,0]))??[0,0];return apertureDisc(q[0],q[1],60,12);},
 get still(){return CUE(1,'sprints back')+.2;},
};

// ---------------------------------------------------------------- 3 · the slow-motion replay: LOW beside the goal he protects
const tau3=(t:number)=>{const w=CUE(2,'Watch again'),h=CUE(2,'He turns'),a=CUE(2,'pumps'),b=CUE(2,'between the ball'),n=CUE(2,'Now he wins');
 return key(t,mono([[0,-.5],[w+.5,-.1],[h,U_T0+.1],[h+.9,U_T1+.1],[a,1.5],[b,3.9],[n,U_TK-.2],[n+.6,U_TK+.1],[SECS(2),U_TK+.9]]),linear);};
const E3:V3=[3.5,1.3,-8.5];
function cam3v(t:number):Cam{
 const u=tau3(t),P:V3=add3(pacXZ(u),[0,1.3,0]),b=demoBall(u);
 return plan(t,[
  [0,0,()=>({P:E3,T:[-38,1.3,-1],fov:7})],
  [CUE(2,'He turns')-.3,.8,()=>({P:E3,T:P,fov:6.5})],
  [CUE(2,'pumps')-.3,1,()=>({P:E3,T:P,fov:lerp(6.5,11,sm(1.4,3.4,u))})],
  [CUE(2,'between the ball')-.4,1,()=>({P:add3(E3,[0,.4,0]),T:mix3(P,add3(b,[0,.8,0]),.4),fov:18})],
  [CUE(2,'Now he wins')-.2,.8,()=>({P:add3(E3,[0,.4,0]),T:mix3(P,add3(TK,[0,.6,0]),.5),fov:15})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),u=tau3(t),tt=twos(t),up=tau3(tt),upp=tau3(tt-1/12);
  trainingGround(s,c);
  ground(s,c,{boards:false,cones:true});
  goal3(s,c,0,1);
  // the replay graphic: a yellow ring under Pacho until he is up to speed
  groundRing(s,c,pacXZ(u),.9,Y,sm(.2,.6,t)*(1-sm(1.4,1.8,u)),.14);
  const r=drawDemo(s,c,u,up,upp,{smear:true});
  const hit=sm(U_TK-.05,U_TK+.05,u)*(1-sm(U_TK+.25,U_TK+.6,u));if(hit>0&&r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],Math.max(50,r.ball.r*4.5)*hit,{n:9,seed:17,width:Math.max(6,r.ball.r*.5)});
 },
 aperture(t){const c=cam3v(t),q=pr(c,add3(pacXZ(tau3(twos(t))),[0,1.2,0]))??[0,0];return apertureDisc(q[0],q[1],60,12);},
 get still(){return CUE(2,'between the ball')+.3;},
};

// ---------------------------------------------------------------- 4 · the lesson: high behind the goal, the same demonstration with teaching marks
/** a projected arrow (shaft + head) along 3D points, in one ink */
function arrow3(s:Sheet,c:Cam,pts:V3[],w:number,ink:string,cov=1){
 const q=pts.map(p=>pr(c,p)).filter((p):p is Pt=>!!p);if(q.length<2)return;
 const e=q[q.length-1],f=q[q.length-2],ang=Math.atan2(e[1]-f[1],e[0]-f[0]),ca=Math.cos(ang),sa=Math.sin(ang),hd=w*2.6;
 const shaft=q.slice(0,-1).concat([[e[0]-ca*hd*.7,e[1]-sa*hd*.7]]);
 const p=ribbon(shaft,w,{taper:.2,pressure:.2,wobble:.8});p.addPath(polyPath([[e[0]+ca*hd*.3,e[1]+sa*hd*.3],[e[0]-ca*hd-sa*hd*.62,e[1]-sa*hd+ca*hd*.62],[e[0]-ca*hd+sa*hd*.62,e[1]-sa*hd-ca*hd*.62]],true));
 s.knockout(p);s.fill(ink,p,cov);s.stroke(K,p,Math.max(2,w*.12),.85);
}
/** a flat (optionally dashed) ring on the grass */
function groundRing(s:Sheet,c:Cam,P:V3,rad:number,ink:string,a:number,w=.07,dashed=true){
 const X=pr(c,[P[0],.01,P[2]]);if(!X||a<=0.02)return;const pts:Pt[]=[];for(let i=0;i<28;i++){const u=i/28*TAU,p=pr(c,[P[0]+Math.cos(u)*rad,.01,P[2]+Math.sin(u)*rad]);if(p)pts.push(p);}
 if(pts.length<8)return;const gaps:[number,number][]=[];if(dashed)for(let i=0;i<14;i++)gaps.push([(i+.66)/14,(i+.96)/14]);
 const d=ribbon(pts,Math.max(5,kAt(c,P)*w),{seed:31,close:true,taper:0,wobble:.6,gaps});s.knockout(d,.8*a);s.fill(ink,d,.95*a);
}
/** replays the chip and the sprint, HOLDS with Pacho goal-side ("goal side first"), then plays the poke on "win the ball" */
const U_HOLD=4.55;
const tau4=(t:number)=>{const a=CUE(3,'If an'),s0=CUE(3,'turn and'),g=CUE(3,'goal side'),th=CUE(3,'Then try'),w=CUE(3,'win the ball');
 return key(t,mono([[0,-.4],[a+.3,.3],[s0,1.2],[g,U_HOLD-.25],[th,U_HOLD],[w,U_TK-.1],[w+.5,U_TK+.2],[SECS(3),U_TK+1]]),linear);};
const E4:V3=[9,11,5];
function cam4v(t:number):Cam{
 return plan(t,[
  [0,0,()=>({P:E4,T:[-31,0,-2.5],fov:17})],
  [CUE(3,'turn and')-.2,1.6,()=>({P:E4,T:[-25,0,-3],fov:24})],
  [CUE(3,'goal side')-.3,1.4,()=>({P:add3(E4,[-2,-1.5,-1]),T:[-19,0,-3.5],fov:24})],
  [CUE(3,'win the ball')-.3,1.2,()=>({P:add3(E4,[-3,-2.5,-2]),T:[-16,0,-4.5],fov:19})],
 ]);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),u=tau4(t),tt=twos(t),up=tau4(tt),upp=tau4(tt-1/12);
  const tA=CUE(3,'If an'),tS=CUE(3,'turn and'),tG=CUE(3,'goal side'),tW=CUE(3,'win the ball');
  trainingGround(s,c);
  ground(s,c,{boards:false,cones:true});
  goal3(s,c,0,1);
  const P=pacXZ(up),A=atXZ(up),b=demoBall(u);
  // "turn and sprint": his sprint path drawn as a yellow arrow from where he stood to the goal-side spot
  const sa=sm(tS-.1,tS+1.2,t,easeInOutSine);
  if(sa>.02){const pts:V3[]=[];const u1=lerp(U_T0,U_B,sa);for(let i=0;i<=16;i++){const q=pathAt(PAC_PATH,lerp(U_T0,u1,i/16));pts.push([q[0],.03,q[1]]);}arrow3(s,c,pts,Math.max(10,kAt(c,P)*.22),Y,.95);}
  // "goal side": the line from the ball to the middle of the goal, and the goal-side lane he stands in
  const gs=sm(tG-.15,tG+.45,t);
  if(gs>.02&&u<U_TK+.3){const lane=polyP(c,[[b[0],.01,b[2]-.5],[0,.01,-2.6],[0,.01,2.6],[b[0],.01,b[2]+.5]]);if(lane.length>2){const lp=polyPath(lane,true);s.knockout(lp,.3*gs);s.tone(Y,lp,.3*gs);}
   const pts:Pt[]=[];for(let i=0;i<=12;i++){const k=i/12*gs,q=pr(c,[lerp(b[0],0,k),.02,lerp(b[2],0,k)]);if(q)pts.push(q);}
   if(pts.length>2){const gaps:[number,number][]=[];for(let i=0;i<10;i++)gaps.push([(i+.62)/10,(i+.96)/10]);const d=ribbon(pts,Math.max(5,kAt(c,P)*.08),{seed:21,taper:0,wobble:.5,gaps});s.knockout(d,.8*gs);s.fill(K,d,.95*gs);}}
  // "If an attacker gets past you": a red ring on the attacker and the ball
  groundRing(s,c,A,1.1,R,sm(tA-.1,tA+.4,t)*(1-sm(tW+.4,tW+1,t)),.12);
  // Pacho ringed on the goal-side line
  groundRing(s,c,P,1.2,Y,sm(tG-.1,tG+.4,t,easeOutBack),.14,false);
  const r=drawDemo(s,c,u,up,upp);
  const hit=sm(U_TK-.05,U_TK+.05,u)*(1-sm(U_TK+.25,U_TK+.6,u));if(hit>0&&r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],Math.max(50,r.ball.r*4.5)*hit,{n:9,seed:23,width:Math.max(6,r.ball.r*.5)});
 },
 get still(){return CUE(3,'goal side')+.5;},
};

const film:RisoStory={
 id:'pacho-signature',format:'11v11',title:'Pacho: the recovery sprint',
 theme:'The recovery sprint: when the ball goes past you, turn and sprint back goal-side first, then win the ball (plus the 2025 Champions League final, where Pacho became the first Ecuadorian to win it)',
 ageNote:'Paris Saint-Germain 5–0 Inter, Champions League final, Munich, 31 May 2025; the last three chapters are a demonstration. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a recovery sprint — a yellow streak races past a ball to a stop, with a spark. Reduced motion: the streak and the ball. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:clamp(age/.35),fade=age<=0?1:1-clamp((age-.6)/.2),e=easeOut(u);
  const st=ribbon([[x-150,y+20],[x-150+190*e,y+20]],16,{seed,taper:.8,pressure:.3,wobble:1});s.fill(Y,st,.95*fade);
  if(age>.3&&age<.55)sparkBurst(s,Y,x+40,y+20,60,{n:7,seed,g:1-clamp((age-.3)/.25),width:7});
  if(fade>0)footballPanels(s,x+60,y+10,24,{rot:seed,key:K,shadow:B,seed:5});
 },
};
export default film;
/** Solved demo geometry (pitch metres; the demo goal line is x = 0, centre z = 0) — checked by tests/play-film-pacho-signature.cjs. */
export const FACTS={U_TK,tau2,RATE2,U_OVER,U_T0,U_T1,U_B,U_LAND,TK,B0,LAND,chipBall:demoBall,TURN,
 pacAt:(u:number)=>{const st=demoPac(u),sk=solve(st.pose,DEMO_B,st.place);return{place:st.place,lToe:sk.lToe,rToe:sk.rToe,head:sk.head};},
 attackerAt:(u:number)=>{const p=pathAt(AT_PATH,u);return p;},
 pokeToe:()=>{const st=demoPac(U_TK),sk=solve(st.pose,DEMO_B,st.place);return SIDE_TK==='l'?sk.lToe:sk.rToe;},
 passerToe:()=>{const st=demoPS(0),sk=solve(st.pose,B_PS,st.place);return sk.rToe;},
 pacSpeed:(u:number)=>speedAt(PAC_PATH,u),
 celebrationPacho:()=>CEL[0]};
