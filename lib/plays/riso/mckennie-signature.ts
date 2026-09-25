/** Weston McKennie — "the late header". Signature film: his 82nd-minute equalising header v Mexico, United States 3–2 Mexico (a.e.t.),
 * 2021 CONCACAF Nations League final, Sunday 6 June 2021, Empower Field at Mile High, Denver. An iconic-play riso film (RisoStory, chapters
 * mode) played by the card's picture window (components/CardFilmPlayer.tsx) or StoryFilmPlayer. A 1:1 reconstruction of the goal from
 * WRITTEN accounts (the broadcast footage itself was not reviewed), rendered as a riso print.
 *
 * WHY THIS MOMENT: the card's signature is "the late header" (lib/town/iconicPlays.json, kind:"signature"; lesson "Attack the ball in the
 * air: jump early and hit it with your forehead"). This is McKennie's best-documented headed goal: a late (82') header from a corner that
 * pulled the USA level in a final they went on to win. Written sources describe the play itself (a corner, his "soaring header", the
 * keeper's fingertips), so it is staged inside the real match; everything beyond those facts is marked INFERRED below.
 *
 * SOURCES (read Sept 2026 with curl, cached under the build scratchpad films/src-cache/):
 *  - Wikipedia, "2021 CONCACAF Nations League final" (raw wikitext): 6 June 2021, Empower Field at Mile High, Denver, 37,648, referee John
 *    Pitti (Panama); kick-off actually 19:36 local; Corona 2', Reyna 27' (McKennie's header off Pulisic's corner hit the post, Reyna scored
 *    the rebound), Lainez 79', McKennie 82', Pulisic 114' pen.; "three minutes later, the US equalized again, as McKennie headed a Reyna corner
 *    that grazed the fingertips of Ochoa but ultimately found the net, making the score 2–2"; kit boxes: United States white shirts, navy
 *    (#182F87) shorts, white socks; Mexico all black; numbers McKennie 8, Reyna 7, Ochoa 13 (captain); Reyna subbed off 83'.
 *    https://en.wikipedia.org/wiki/2021_CONCACAF_Nations_League_final
 *  - CONCACAF, "U.S. edge Mexico in thrilling style to win first CNLF", 7 June 2021: "a soaring header from McKennie brought the U.S. back on
 *    level terms 2-2 in the 82'"; earlier "Ochoa denying McKennie's header on the goal-line in the 69'".
 *    https://www.concacaf.com/nations-league/news/u-s-edge-mexico-in-thrilling-style-to-win-first-cnlf/
 *  - The Guardian (AP), "Pulisic's extra-time winner seals Nations League title for USA over Mexico", 7 June 2021: Mexico "appeared to be
 *    headed for the title until McKennie popped up in the 82nd minute to send the game into extra-time".
 *    https://www.theguardian.com/football/2021/jun/07/usa-mexico-concacaf-nations-league-soccer-final
 *  - Card data: lib/town/playerAppearance.json (McKennie: USA, skin 4, dark short hair); lib/town/playerCareers.json (Schalke, Juventus).
 * CONFIRMED: the date, venue, final; Mexico led 2–1 (Lainez 79'); in the 82nd minute McKennie HEADED a REYNA CORNER; the ball GRAZED OCHOA'S
 *  FINGERTIPS and went in: 2–2; described as a "soaring header"; the USA won 3–2 after extra time (Pulisic pen. 114'); kits as above.
 * INFERRED (illustrative reconstruction, never named in the narration): which corner (drawn: the far-side corner from the main camera, the USA's
 *  right) and so which way it swung (a right-footed out-swinger — Reyna's foot not verified); every position, run and timing in metres and
 *  seconds (the corner ≈ 33 m in ≈ 1.45 s; McKennie's run from ≈ 13 m out, take-off, contact ≈ 8.6 m out, just right of centre; the header
 *  ≈ .5 s to Ochoa's hand); where on the goal it went in (drawn: low-high toward the far post from the corner, Ochoa diving to his right);
 *  which end; Ochoa's keeper kit (printed yellow with navy shorts) and hair; heights (McKennie 1.85 m, Ochoa 1.85 m, not in the fetched
 *  sources); the other players (drawn unnamed, without numbers); the crowd's colours (many Mexico fans in green); the stadium's seat colour,
 *  video board and floodlights; the twilight sky (≈ 21:15 local; Denver sunset ≈ 20:27); his celebration run; every camera and lens.
 *
 * FRAMING (the TV broadcast, never top-down; kept distinct from the Carvajal / Ramos / Drogba / Puyol corner films): ch1 = the high
 * main-stand camera in REAL TIME with the corner on the FAR touchline (Mile High and its video board reading 1–2 → the box → Reyna far away
 * at the flag → the out-swinger → McKennie soars → the board flips to 2–2); ch2 = the slow-motion replay from HIGH BEHIND THE GOAL, looking
 * back up his run (the run in, the early take-off, the top of the leap), a riso replay trail; ch3 = a second replay, LOW AND CLOSE FROM THE
 * SIDE: the forehead contact, then Ochoa's fingertips graze it and it still goes in; ch4 = the lesson from behind his run: the run to
 * attack the ball, the early take-off spark, eyes-on-the-ball sight line, a forehead ring and the header's arrow. Composed on the FULL
 * sheet (world units = sheet units centred on the canvas; never sheet.safe), so it frames from the 1.45:1 card window down to square.
 * FIGURES: every body goes through ONE adapter, drawPlayer() → athlete.ts (continuous silhouettes, FK skeleton, `prev` secondary motion,
 * motionSmear on the corner, the header, the dive). Handedness: the world is right-handed (x toward Mexico's goal, y up, +z = the USA's
 * right), exactly athlete.ts's convention, so Reyna's strike({foot:'r'}) is his RIGHT foot and the corner from the USA's right is the +z
 * corner. Ochoa faces −x, so his dive to his RIGHT (keeperDive side 'r') goes to −z. Inks: yellow, red, blue, navy (Mexico's black prints
 * navy; green = yellow + blue). Everything is keyed to cue times (withTiming swaps in the recorded word onsets), poses on twos, cameras on
 * ones; all randomness seeded. Heat: small figures print at 'low', at most 4 non-hero figures at full detail, every figure inside a passage
 * is capped; ≈ 150–330 plate ops a frame. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,stand,keeperSet,keeperDive,celebrate,header,posed,blendPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3,type Build} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES (≈2.7 words/s + punctuation pauses) until the Kokoro voice exists. Every cue starts with a plain word. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'Denver, 2021',text:'Denver, 2021, the Nations League final. Mexico lead, late on. Gio Reyna swings in a corner... Weston McKennie soars! It clips the keeper and goes in! Level again!',tail:2.4,
  cues:['Denver','Nations League final','Mexico lead','Gio Reyna','swings in','Weston McKennie','soars','clips','goes in','Level again']},
 {label:'Watch it again',text:'Watch again, slowly. McKennie runs at the ball, takes off early. He meets it at the top of his jump.',tail:1.6,
  cues:['Watch again','runs at the ball','takes off early','meets it','top of his jump']},
 {label:'Forehead first',text:'From the side: he hits it with his forehead. Ochoa touches it... but it still goes in! The USA win the final!',tail:2.2,
  cues:['From the side','forehead','Ochoa','still goes in','USA win']},
 {label:'Attack the ball',text:'Attack the ball in the air! Jump early, keep your eyes on it, and hit it with your forehead.',tail:2,
  cues:['Attack the ball','Jump early','eyes on it','forehead']},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/mckennie-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/mckennie-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/mckennie-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('mckennie: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('mckennie: no cue '+w);return c.at;};
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
const len3=(a:V3)=>Math.hypot(a[0],a[1],a[2]);
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
/** Pitch: Mexico's goal line is x = 0 (the USA attack +x), goal centre z = 0, +z = the USA's right; touchlines z = ±34, halfway x = −52.5. */
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

// ---------------------------------------------------------------- Mile High at twilight: a three-tier bowl, rim floodlights, a video board
const CX=-52.5;
/** stand planes (a along, b up the rake 0..1): 0 the far side (+z), 1 behind Mexico's goal (+x, the video board above it), 2 the main stand
 * (−z, the camera side), 3 the other end */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-122-36*b,17+28*b,a),1.2+38*b,43+42*b],
 (a,b)=>[9+36*b,1.2+34*b,lerp(62+23*b,-62-21*b,a)],
 (a,b)=>[lerp(17+28*b,-122-36*b,a),1.2+38*b,-43-40*b],
 (a,b)=>[-114-36*b,1.2+34*b,lerp(-62-21*b,62+23*b,a)],
];
const STAND_COLS=[110,76,110,76],STAND_ROWS=18;
/** the dark fascias between the three tiers (b ranges up the rake; illustrative) */
const FASCIA:[number,number][]=[[.34,.4],[.64,.7]];
/** crowd colour weights per stand: [paper (white shirts), green (Mexico fans: yellow + blue), navy (black shirts), red] — inferred */
const CROWD_MIX:[number,number,number,number][]=[[.3,.4,.18,.12],[.26,.44,.2,.1],[.3,.4,.18,.12],[.34,.36,.18,.12]];
/** the video board over the +x end (faces the pitch, −x): centre, half-width along z, half-height */
const BOARD={x:46,y:41.5,hz:13,hy:5.4};
/** the score on the board: USA 1–2 Mexico, then 2–2 once the header is in */
function scoreboard(s:Sheet,c:Cam,usa:number,flash:number){
 const P=(z:number,y:number):V3=>[BOARD.x,BOARD.y+y,z];
 const fr=polyP(c,[P(-BOARD.hz-1,-BOARD.hy-1),P(BOARD.hz+1,-BOARD.hy-1),P(BOARD.hz+1,BOARD.hy+1),P(-BOARD.hz-1,BOARD.hy+1)]);if(fr.length<3)return;
 const scr_=polyP(c,[P(-BOARD.hz,-BOARD.hy),P(BOARD.hz,-BOARD.hy),P(BOARD.hz,BOARD.hy),P(-BOARD.hz,BOARD.hy)]);
 const legs=new Path2D();seg3(c,[BOARD.x+1,0,-BOARD.hz*.6],[BOARD.x+1,BOARD.y-BOARD.hy,-BOARD.hz*.6],1.2,legs);seg3(c,[BOARD.x+1,0,BOARD.hz*.6],[BOARD.x+1,BOARD.y-BOARD.hy,BOARD.hz*.6],1.2,legs);
 s.fill(K,legs,.95);const f=polyPath(fr,true);s.knockout(f);s.fill(K,f,.98);const sp=polyPath(scr_,true);s.knockout(sp,.2);s.tone(B,sp,.5+.3*flash);
 // seven-segment digits (reading left → right = +z for a viewer facing +x): [USA] – [MEX]
 const SEG:[number,number,number,number][]=[[0,1,1,1],[1,1,1,.5],[1,.5,1,0],[0,0,1,0],[0,.5,0,0],[0,1,0,.5],[0,.5,1,.5]];
 const DIG:Record<number,number[]>={1:[1,2],2:[0,1,6,4,3]};
 const lit=new Path2D(),dig=(d:number,z0:number)=>{for(const k of DIG[d]){const[a,b,e,g]=SEG[k];seg3(c,P(z0+a*3.8,-3.6+b*7.2),P(z0+e*3.8,-3.6+g*7.2),1.1,lit);}};
 dig(usa,-10.5);dig(2,6.3);seg3(c,P(-1.6,0),P(1.6,0),1.1,lit);
 s.knockout(lit);s.fill(Y,lit,.9);if(flash>0){s.tone(R,sp,.35*flash);}
}
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number;flash?:number;board?:{usa:number;flash:number}}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 // a June twilight over Denver (≈ 21:15, some 50 minutes after sunset): deep navy sky, a faint blue glow low down
 s.field(K,.8,.5);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz){s.tone(B,polyPath([[-1e4,hz[1]-900],[1e4,hz[1]-900],[1e4,hz[1]+60],[-1e4,hz[1]+60]],true),.28);}
 const planes=new Path2D(),fas=new Path2D(),rim=new Path2D();
 for(const i of which){const S=STANDS[i];addPoly(planes,polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]));for(const[b0,b1] of FASCIA)addPoly(fas,polyP(c,[S(0,b0),S(1,b0),S(1,b1),S(0,b1)]));
  seg3(c,add3(S(0,1),[0,1.2,0]),add3(S(1,1),[0,1.2,0]),1.4,rim);}
 // orange seats in the dark (yellow + red under navy; illustrative), dark tier fascias with a thin lit band
 s.knockout(planes);s.tone(R,planes,.42);s.tone(Y,planes,.3);s.tone(K,planes,.45);s.knockout(fas);s.fill(K,fas,.85);s.tone(Y,fas,.16);
 // the crowd: white shirts, Mexico green, black, a scatter of red; the roar lifts them
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si],mx=CROWD_MIX[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(FASCIA.some(([b0,b1])=>b>b0-.02&&b<b1+.02))continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,6);if(h<.22)continue;const a=(i+.5+(hash(i+j*31,8)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const u=(h-.22)/.78,ink=u<mx[0]?0:u<mx[0]+mx[1]?1:u<mx[0]+mx[1]+mx[2]?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.8);s.knockout(inks[1],.7);s.fill(Y,inks[1],.9);s.fill(B,inks[1],.7);s.fill(K,inks[2],.9);s.knockout(inks[3],.7);s.fill(R,inks[3],.95);
 s.knockout(rim,.5);s.fill(K,rim,.9);
 if(o.board&&which.includes(1))scoreboard(s,c,o.board.usa,o.board.flash);
 // floodlight banks along the bowl's rim with yellow haloes
 const lamp=new Path2D(),halo=new Path2D();for(const i of which){const S=STANDS[i];for(let k=0;k<6;k++){const u=(k+.5)/6,a=add3(S(u-.03,1),[0,4,0]),b=add3(S(u+.03,1),[0,4,0]),m=mix3(a,b,.5);if(toCam(c,m)[2]<NEAR+2)continue;seg3(c,a,b,2.2,lamp);
  const g=pr(c,m);if(g){const r=clamp(kAt(c,m)*5,8,150);halo.moveTo(g[0]+r,g[1]);halo.ellipse(g[0],g[1],r,r*.62,0,0,TAU);}}}
 s.knockout(halo,.22);s.tone(Y,halo,.4);s.knockout(lamp);s.fill(Y,lamp,.8);
 if(flash>0){const p=new Path2D(),n=Math.round(24*flash);for(let i=0;i<n;i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,STANDS[si](r2,.1+.8*hash(i,Math.floor(tt*12))));if(!q)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.6);}
}
// ---------------------------------------------------------------- grass under the floodlights, lines, boards, corner flags
function ground(s:Sheet,c:Cam){
 const g=polyP(c,[[-118,0,-46],[13,0,-46],[13,0,46],[-118,0,46]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.85);s.tone(B,gp,.72);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]));s.tone(B,st,.2);
 // advertising boards: navy with blue panels (no lettering)
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([5.5,0,-38],[5.5,0,38]);board([-110,0,-38],[5.5,0,-38]);board([-110,0,38],[5.5,0,38]);
 for(let k=0;k<12;k++){const z=-36+k*6.2;addPoly(pn,polyP(c,[[5.4,.25,z],[5.4,.25,z+3.3],[5.4,.68,z+3.3],[5.4,.68,z]]));}
 for(const zz of[-37.9,37.9])for(let k=0;k<18;k++){const x=-108+k*6.4;addPoly(pn,polyP(c,[[x,.25,zz],[x+3.4,.25,zz],[x+3.4,.68,zz],[x,.68,zz]]));}
 s.knockout(bd);s.fill(K,bd,.9);s.knockout(pn,.85);s.fill(R,pn,.3);
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
 s.fill(K,pole,.9);s.knockout(flag);s.fill(R,flag,.95);
}
/** Mexico's goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep with a sloping roof; bulge pushes the back out around z = bz */
function goal3(s:Sheet,c:Cam,bulge:number,bz:number){
 const X=0,z0=-3.66,z1=3.66,H=2.44,back=(z:number)=>X+2+bulge*.75*Math.exp(-Math.pow((z-bz)/1.6,2));
 const zs=[z0,-2.6,-1.4,0,1.8,z1];
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
/** United States: white shirts, navy shorts, white socks (sourced); red/navy trim and navy numbers (inferred) */
const usa=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:[K,.92],socks:'paper',boots:K,skin:SKIN_L,hair:K,line:K,trim:[R,.8],numberInk:K,hairStyle:'short',build:{height:1.83,bulk:1},...o});
/** Mexico: all black (sourced) — printed navy; paper numbers, red trim (inferred) */
const mex=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[K,.95],shorts:[K,.95],socks:[K,.95],boots:K,skin:SKIN_M,hair:K,line:K,trim:[R,.7],numberInk:'paper',hairStyle:'short',build:{height:1.82,bulk:1},...o});
const B_MCK:Build={height:1.85,bulk:1.02},B_REY:Build={height:1.85,bulk:.92},B_OCH:Build={height:1.85,bulk:1},B_MRK:Build={height:1.87,bulk:1.04};
/** McKennie: card appearance skin 4 → the darker screen, dark short hair */
const MCK_ST=usa({number:8,hair:[K,.95],skin:SKIN_D,build:B_MCK,seed:8});
const REY_ST=usa({number:7,hair:[K,.8],build:B_REY,seed:7});
const MRK_ST=mex({build:B_MRK,seed:4});
/** Ochoa: No. 13, his curly hair; keeper kit colours inferred */
const OCH_ST:AthleteStyle={shirt:[Y,.92],shorts:[K,.9],socks:[Y,.92],boots:K,skin:SKIN_M,hair:[K,.95],line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'curly',number:13,numberInk:K,build:B_OCH,seed:13};

// ---------------------------------------------------------------- the play on one clock τ (seconds; τ = 0 is Reyna's corner)
const BALL_R=.11,GRAV=9.81;
/** the corner flies TF s to McKennie's head */
const TF=1.45;
/** McKennie's header spot (his pelvis) ≈ 8.6 m out, just right of centre (toward the corner). He meets it facing between the ball's line
 * and the goal, so he turns his head and shoulders to his LEFT to send it toward the far post from the corner. */
const HP:[number,number]=[-8.6,1.3],FACE:[number,number]=nrm2(.78,.62),YAW_H=yawTo(FACE[0],FACE[1]);
/** McKennie's header: header() with a big running spring (a "soaring header"), forehead-first, the head and shoulders turning LEFT */
function mckHeader(u:number):Pose{const p=header(clamp(u));p.air*=1.32;const w=Math.sin(Math.PI*clamp((u-.3)/.42)),sn=clamp((u-.36)/.2);
 p.neckY+=lerp(-.1,.42,sn)*w;p.twist+=lerp(-.06,.2,sn)*w;p.bend+=.08*w;return p;}
/** contact on the header clock: the neck snap; HD = the whole leap. Take-off (header .22) is well before the ball arrives: he jumps EARLY. */
const CU=.5,HD=1.0,TJ=TF-CU*HD;
/** his forehead at contact (solved from the skeleton): the ball's centre is one radius in front of it */
const HEAD_PT:V3=(()=>{const sk=solve(mckHeader(CU),B_MCK,{x:HP[0],z:HP[1],yaw:YAW_H}),hd=sk.head,fc=sk.face,d=sub3(fc,hd),l=Math.hypot(d[0],d[1],d[2])||1;return[fc[0]+d[0]/l*(BALL_R+.02),fc[1]+d[1]/l*(BALL_R+.02)+.03,fc[2]+d[2]/l*(BALL_R+.02)] as V3;})();
/** the corner spot (ball in the quadrant at the +z corner flag, the USA's right; side inferred) */
const P0:V3=[-.45,BALL_R,33.55];
/** a right-footer's out-swinger from the right: a steady sideways pull AWAY from the goal line (−x) on top of gravity */
const SWING:V3=[-2.0,-GRAV,0];
const launch=(A:V3,Bp:V3,d:number,a:V3):V3=>[(Bp[0]-A[0]-.5*a[0]*d*d)/d,(Bp[1]-A[1]-.5*a[1]*d*d)/d,(Bp[2]-A[2]-.5*a[2]*d*d)/d];
const flyA=(A:V3,V:V3,a:V3,t:number):V3=>[A[0]+V[0]*t+.5*a[0]*t*t,A[1]+V[1]*t+.5*a[1]*t*t,A[2]+V[2]*t+.5*a[2]*t*t];
const V_CROSS=launch(P0,HEAD_PT,TF,SWING);
/** Reyna strikes along the ball's launch direction */
const DC=nrm2(V_CROSS[0],V_CROSS[2]),YAW_R=yawTo(DC[0],DC[1]);
/** where Reyna's pelvis stands at contact so his RIGHT boot meets the back of the ball (solved once, FK) */
const PCR:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r'}),B_REY,{x:0,z:0,yaw:YAW_R});return[P0[0]-DC[0]*.12-sk.rToe[0],P0[2]-DC[1]*.12-sk.rToe[2]];})();
/** the run-up: from behind the ball and to its left (a right-footer's angle) */
const LEFT_R:[number,number]=[DC[1],-DC[0]],RUN0:[number,number]=[PCR[0]-DC[0]*3.2+LEFT_R[0]*1.5,PCR[1]-DC[1]*3.2+LEFT_R[1]*1.5];
const G3:V3=[0,-GRAV,0];
/** Ochoa: set at (OX, OZ), dives to his RIGHT (−z); the header reaches his fingertips at TT, then goes on into the net at TG */
const OX=-1.15,OZ=.55,T_DIVE=TF+.04,DIVE_L=.9,DIVE_U=.56,TT=T_DIVE+DIVE_U*DIVE_L;
const DIVE=(u:number)=>keeperDive(clamp(u),{side:'r',height:.62});

// ---------------------------------------------------------------- tracks: [τ, x, z], Hermite-interpolated (all illustrative, see header)
type Role='mck'|'rey'|'gk'|'mrk'|'usa'|'mex';
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];hero?:boolean};
const T0=-10,T1=12,DT=.02;
const rp=(u:number):[number,number]=>[PCR[0]+DC[0]*u,PCR[1]+DC[1]*u];
/** after the goal the US players chase McKennie toward the main-stand touchline (inferred) */
const toStand=(x:number,z:number,k:number):number[][]=>[[TF+1.2+k*.2,x,z],[TF+4.5+k*.3,lerp(x,-12,.6),lerp(z,-18,.6)],[T1,lerp(x,-12,.8),lerp(z,-24,.85)]];
const ACTORS:Actor[]=[
 {name:'Weston McKennie',role:'mck',hero:true,style:MCK_ST,keys:[[T0,-13.4,-3.6],[-6,-13.2,-3.2],[-2.4,-13,-3],[-1,-12.9,-2.8],[-.2,-12.4,-2.2],[TJ-.22,HP[0],HP[1]],[TF+.45,HP[0],HP[1]],[TF+1.4,-9.4,-3.5],[TF+3.6,-10.4,-11],[TF+6.4,-11.4,-19],[T1,-12,-25]]},
 {name:'Gio Reyna',role:'rey',hero:true,style:REY_ST,keys:[[T0,.4,36.2],[-6.4,0,35.2],[-5.2,...rp(-.7)],[-3.6,...RUN0],[-1,...RUN0],[-.5,...rp(-1.6)],[0,...rp(0)],[.7,...rp(.9)],[3,...rp(3.2)],[T1,-4,27]]},
 {name:'Guillermo Ochoa',role:'gk',hero:true,style:OCH_ST,keys:[[T0,-.8,.2],[-2,-.9,.4],[0,-1.05,.5],[TF-.4,OX,OZ],[T1,OX,OZ]]},
 {name:'Mexico marker (beaten)',role:'mrk',hero:true,style:MRK_ST,keys:[[T0,-11.8,-1.4],[-6,-11.9,-1.2],[-2.4,-11.8,-1],[-.2,-11.4,-.6],[TF-.6,-9.8,.2],[TF,-9.5,.4],[TF+.5,-9.4,.4],[T1,-8.6,.2]]},
 {name:'Mexico near post',role:'mex',style:mex({seed:41}),keys:[[T0,-.8,4.3],[0,-.7,4.2],[TF,-.9,3.9],[T1,-1.2,3.2]]},
 {name:'Mexico six-yard 1',role:'mex',style:mex({build:{height:1.88},skin:SKIN_L,seed:42}),keys:[[T0,-4.4,2.6],[-2,-4.6,2.8],[0,-4.7,2.9],[TF,-5,2.2],[T1,-4.5,1.6]]},
 {name:'Mexico six-yard 2',role:'mex',style:mex({build:{height:1.86},seed:43}),keys:[[T0,-4.8,-1.2],[-2,-5,-1],[0,-5.1,-.9],[TF,-5.5,-.4],[T1,-5,-.6]]},
 {name:'Mexico zone',role:'mex',style:mex({seed:44}),keys:[[T0,-8.4,4.6],[-2,-8.6,4.4],[0,-8.7,4.3],[TF,-8.2,3.6],[T1,-7.6,3]]},
 {name:'Mexico back post',role:'mex',style:mex({skin:SKIN_L,seed:45}),keys:[[T0,-6.4,-4.8],[0,-6.6,-4.6],[TF,-6.2,-3.8],[T1,-5.8,-3.2]]},
 {name:'Mexico edge',role:'mex',style:mex({build:{height:1.76},seed:46}),keys:[[T0,-16,2.4],[-2,-16.2,2],[0,-15.8,1.6],[TF,-14.4,1.2],[T1,-13.6,1]]},
 {name:'USA attacker 1',role:'usa',style:usa({build:{height:1.93,bulk:1.06},seed:61}),keys:[[T0,-7.2,3.6],[-2,-6.9,3.4],[0,-6.7,3.2],[TF,-5.6,2.6],...toStand(-5.4,2.2,0)]},
 {name:'USA attacker 2',role:'usa',style:usa({skin:SKIN_D,build:{height:1.9},seed:62}),keys:[[T0,-10.4,4.4],[-2,-10,4],[0,-9.8,3.8],[TF,-8.9,3.2],...toStand(-8.6,2.8,1)]},
 {name:'USA attacker 3',role:'usa',style:usa({skin:SKIN_M,seed:63}),keys:[[T0,-6.2,-2.6],[-2,-6,-2.4],[0,-5.8,-2.3],[TF,-5.1,-2],...toStand(-5,-2.2,2)]},
 {name:'USA attacker 4',role:'usa',style:usa({seed:64,hair:[Y,.5]}),keys:[[T0,-13.8,5.4],[-2,-13.4,5],[0,-13.2,4.8],[TF,-11.8,4.2],...toStand(-11,3.8,3)]},
];
const MCK=0,REY=1,GK=2,MRK=3;
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

// ---------------------------------------------------------------- the ball: corner → header → Ochoa's fingertips → the net
/** Ochoa's leading (right, −z) glove at full stretch, solved from the dive: the ball's centre just grazes past its fingertips */
const GLOVE:V3=(()=>{const sk=solve(DIVE(DIVE_U),B_OCH,{x:OX,z:OZ,yaw:Math.PI});return sk.lHa[2]<sk.rHa[2]?sk.lHa:sk.rHa;})();
const TOUCH_PT:V3=add3(GLOVE,[.05,.06,-(BALL_R+.03)]);
/** the header: forehead → fingertips (a firm, rising header), then on, a little deflected (up and wide), over the line at TG */
const V_HEAD=launch(HEAD_PT,TOUCH_PT,TT-TF,G3);
const DIR_T:V3=(()=>{const v=add3(V_HEAD,mul3(G3,TT-TF)),l=len3(v);return mul3(v,1/l);})();
const GOAL_PT:V3=(()=>{const k=(0-TOUCH_PT[0])/DIR_T[0];return add3(add3(TOUCH_PT,mul3(DIR_T,k)),[0,.12,-.22]);})();
const TG=TT+Math.max(.07,len3(sub3(GOAL_PT,TOUCH_PT))/11);
const V_T=launch(TOUCH_PT,GOAL_PT,TG-TT,G3);
const NET_HIT:V3=[1.6,GOAL_PT[1]*.8,GOAL_PT[2]-.25],REST:V3=[1.25,BALL_R,GOAL_PT[2]-.1];
function ballAt(tau:number):V3{
 if(tau<=0)return P0;
 if(tau<TF)return flyA(P0,V_CROSS,SWING,tau);
 if(tau<TT)return flyA(HEAD_PT,V_HEAD,G3,tau-TF);
 if(tau<TG)return flyA(TOUCH_PT,V_T,G3,tau-TT);
 if(tau<TG+.14)return mix3(GOAL_PT,NET_HIT,easeOut((tau-TG)/.14));
 const u=clamp((tau-TG-.14)/.5),b=u>=1?.1*Math.abs(Math.sin((tau-TG-.64)*9))*Math.exp(-(tau-TG-.64)*3.5):0;
 return[lerp(NET_HIT[0],REST[0],u),Math.max(BALL_R,lerp(NET_HIT[1],BALL_R,u*u))+b,lerp(NET_HIT[2],REST[2],u)];
}
const spinAt=(tau:number)=>tau<=0?0:tau<TF?tau*TAU*5:TF*TAU*5+(tau-TF)*TAU*3;
const bulgeAt=(tau:number)=>tau<TG+.08?0:Math.exp(-(tau-TG-.08)*2.4)*(1+.3*Math.sin((tau-TG)*14));

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
type State={pose:Pose;place:Place};
function stateOf(k:number,tau:number):State{
 const a=ACTORS[k],[x,z]=posOf(k,tau);let pose=loco(k,tau),yaw=faceYaw(k,tau);
 switch(a.role){
  case 'mck':{
   // eyes on Reyna, then the run at the ball; an early spring, forehead through it with a turn of the head, lands and runs away
   if(tau<-.3)yaw=faceYaw(k,tau,P0);
   if(tau>TJ-.3&&tau<TJ+HD+.6){const u=(tau-TJ)/HD,hp=mckHeader(u);pose=blendPose(pose,hp,sm(TJ-.3,TJ,tau)*(1-sm(TJ+HD,TJ+HD+.6,tau)));}
   if(tau>TJ+HD){const run=celebrate(distOf(k,tau)/4.2,{kind:'run'});pose=blendPose(pose,run,sm(TJ+HD+.1,TJ+HD+.8,tau));}
   const w=sm(TJ-.6,TJ-.15,tau)*(1-sm(TF+.6,TF+1.2,tau));yaw=w>=1?YAW_H:lerpAng(yaw,YAW_H,w);break;}
  case 'rey':{const w=win(tau,-.55,.85,.2);if(w>0)pose=blendPose(pose,strike(clamp(tau/1.0+STRIKE_CONTACT),{foot:'r'}),w);
   if(tau<-4.8&&tau>-6.6){// bends to set the ball in the quadrant
    pose=blendPose(pose,posed({lHipF:70,rHipF:40,lKnee:90,rKnee:60,lean:40,pitch:10,neckP:30,lShF:60,rShF:50,lElb:30,rElb:30}),win(tau,-6.6,-4.8,.5));yaw=faceYaw(k,tau,P0);}
   if(tau>-3.6&&tau<-1){yaw=lerpAng(faceYaw(k,tau,[HP[0],0,HP[1]]),YAW_R,sm(-2.2,-1.2,tau));}
   // the raised arm: the signal before a set piece
   if(tau>-3.4&&tau<-1.4)pose=blendPose(pose,{...pose,lShF:40*Math.PI/180,lShA:150*Math.PI/180,lElb:10*Math.PI/180},win(tau,-3.4,-1.4,.4)*.9);
   yaw=lerpAng(yaw,YAW_R,sm(-1.1,-.5,tau)*(1-sm(.9,1.6,tau)));
   if(tau>1.4)yaw=lerpAng(yaw,faceYaw(k,tau,[HP[0],0,HP[1]]),sm(1.4,1.9,tau));
   if(tau>TG+.6){const run=celebrate(distOf(k,tau)/4,{kind:'arms'});pose=blendPose(pose,run,sm(TG+.6,TG+1.2,tau)*.8);}
   break;}
  case 'gk':{const set=keeperSet(tau*1.3);pose=blendPose(set,pose,sm(.6,1.1,tau)*(1-sm(TF-.85,TF-.65,tau)));
   if(tau>T_DIVE-.15){pose=blendPose(pose,DIVE((tau-T_DIVE)/DIVE_L),sm(T_DIVE-.15,T_DIVE,tau));}
   if(tau>TG+1.4)pose=blendPose(pose,DEJECT,sm(TG+1.6,TG+2.4,tau)*.6);
   yaw=faceYaw(k,Math.min(tau,TF-.1));if(tau>TF-.1)yaw=lerpAng(yaw,Math.PI,sm(TF-.1,TF+.04,tau));break;}
  case 'mrk':{// a step behind: a late, lower jump behind McKennie, then hands on knees
   if(tau<-.3)yaw=faceYaw(k,tau,P0);
   if(tau>TF-.45&&tau<TF+1){const hp=header(clamp((tau-(TF-.3))/1.0));hp.air*=.6;pose=blendPose(pose,hp,.6*sm(TF-.45,TF-.3,tau)*(1-sm(TF+.6,TF+1,tau)));}
   if(tau>TF+.9)pose=blendPose(pose,DEJECT,sm(TF+.9,TF+1.6,tau));if(tau>=-.3)yaw=faceYaw(k,Math.min(tau,TF));break;}
  case 'mex':if(tau>TG+.5)pose=blendPose(pose,DEJECT,sm(TG+.8,TG+1.8,tau)*.8);if(tau>TF+.2)yaw=faceYaw(k,TF+.2);break;
  case 'usa':if(tau>TG+.3){const run=celebrate(distOf(k,tau)/4.2,{kind:'arms'});pose=blendPose(pose,run,sm(TG+.4,TG+1,tau)*.7);}break;
 }
 return{pose,place:{x,z,yaw}};
}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the pose one drawn frame earlier (secondary
 * motion: hair and the shirt hem trail), smear = halftone echo + speed lines on fast limbs (the corner, the header, the dive). */
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
  smear:o.smear&&((k===MCK&&tau>TJ&&tau<TF+.3)||(k===REY&&tau>-.25&&tau<.35)||(k===GK&&tau>T_DIVE+.1&&tau<T_DIVE+.7))};});
 return drawScene(s,c,figs,{P:ballAt(tau),rot:spinAt(tau),min:o.min,lines:o.lines,prevP:o.prevBall!==undefined?ballAt(o.prevBall):null},{bulge:bulgeAt(tau),bz:REST[2]});
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
/** steps: [start, duration, shot]; each step eases in over the previous result */
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
const gnd=(P:V3,y=0):V3=>[P[0],y,P[2]];
const at=(k:number,tau:number,y=1):V3=>{const[x,z]=posOf(k,tau);return[x,y,z];};
/** a spark on the ball where the forehead meets it, and a smaller one at Ochoa's fingertips */
function touches(s:Sheet,tau:number,ball:{g:Pt;r:number}|null,big:number,seed:number){
 if(!ball)return;const h=(tau-TF)/.18,f=(tau-TT)/.16;
 if(h>0&&h<1)sparkBurst(s,Y,ball.g[0],ball.g[1],Math.max(big,ball.r*4.5),{n:9,seed,g:easeOutBack(clamp(h*2))*(1-clamp((h-.5)*2)),width:Math.max(6,ball.r*.5)});
 if(f>0&&f<1)sparkBurst(s,R,ball.g[0],ball.g[1],Math.max(big*.7,ball.r*3.2),{n:6,seed:seed+3,g:easeOutBack(clamp(f*2))*(1-clamp((f-.5)*2)),width:Math.max(5,ball.r*.4)});
}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time, the corner on the far side
/** τ from chapter time: real time, anchored so his head meets the ball on "soars" (the corner is struck TF earlier) */
function tau1(t:number){const tH=CUE(0,'soars')+.1;return Math.max(T0+.5,t-(tH-TF));}
const P1:V3=[-24,24,-72];
function cam1(t:number):Cam{
 const tau=tau1(t),b=ballAt(tau);
 return plan(t,[
  [0,0,()=>({P:P1,T:[14,12,2],fov:46})],
  [CUE(0,'Mexico lead')-.3,1.3,()=>({P:P1,T:[-7,1,4],fov:15})],
  [CUE(0,'Gio Reyna')-.6,1,()=>({P:P1,T:mix3(at(REY,tau,1.1),P0,.3),fov:3.4})],
  [CUE(0,'soars')-TF-.4,.5,()=>({P:P1,T:mix3(at(REY,tau,1),P0,.5),fov:4.2})],
  [CUE(0,'soars')-TF+.02,1.2,()=>({P:P1,T:mix3(add3(gnd(b),[0,1.2+.3*b[1],0]),[HP[0],1.8,HP[1]],.25+.6*sm(0,TF,tau)),fov:lerp(8,13,sm(0,1,tau))})],
  [CUE(0,'soars')-.25,.7,()=>({P:P1,T:[-5,1.6,0],fov:7.6})],
  [CUE(0,'Level again')-.2,1.4,()=>{const w=at(MCK,tau,1.1);return{P:P1,T:mix3(w,[-7,1.2,-4],.3),fov:13};}],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tt=twos(t),tau=tau1(tt),tp=tau1(tt-1/12),tL=CUE(0,'Level again'),tN=CUE(0,'soars')+.4;
  const scored=tau>TG+.1;
  stadium(s,c,t,[0,1,3],{roar:sm(tN,tN+.5,t),flash:sm(tL-.3,tL+.2,t)*(1-sm(tL+2.2,tL+3,t)),board:{usa:scored?2:1,flash:scored?sm(TG+.1,TG+.4,tau)*(.6+.4*Math.sin(tt*9)):0}});
  ground(s,c);
  const r=play(s,c,tau,tp,{min:17,lines:true,prevBall:tau1(t-.06)});
  touches(s,tau,r.ball,40,11);
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return CUE(0,'soars')+.3;},
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
/** the replay trail: the ball's path over the last .8 s, a fading yellow ribbon (printed under the players) */
function trail(s:Sheet,c:Cam,tau:number,fade:number){
 if(fade<=0||tau<=0)return;const pts:Pt[]=[];const a=Math.max(0,tau-.8),b=Math.min(tau,TG);for(let i=0;i<=22;i++){const p=pr(c,ballAt(lerp(a,b,i/22)));if(p)pts.push(p);}
 if(pts.length<3)return;const w=Math.max(8,kAt(c,ballAt(Math.min(tau,TG)))*.16);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*fade);
}
// ---------------------------------------------------------------- 2 · the slow-motion replay from high behind the goal, looking back up his run
const tau2=(t:number)=>key(t,mono([[0,-1.6],[CUE(1,'runs at the ball'),-.5],[CUE(1,'takes off early'),TJ+.12],[CUE(1,'meets it'),TF-.12],[CUE(1,'top of his jump'),TF+.02],[SECS(1)-.2,TT+.2]]),linear);
const E2:V3=[13,7.5,-5.5];
function cam2(t:number):Cam{
 const tau=tau2(t),m=at(MCK,tau,1.2);
 return plan(t,[
  [0,0,()=>({P:E2,T:[-9,1.2,1],fov:30})],
  [CUE(1,'runs at the ball')-.3,1,()=>({P:E2,T:mix3(m,[HP[0],1.4,HP[1]],.4),fov:17})],
  [CUE(1,'takes off early')-.2,.9,()=>({P:add3(E2,[-1,-.8,0]),T:mix3([HP[0],1.9,HP[1]],ballAt(tau),.3*(1-sm(TF-.5,TF-.1,tau))),fov:13})],
  [CUE(1,'top of his jump')-.3,.8,()=>({P:add3(E2,[-1.4,-1.2,0]),T:mix3(HEAD_PT,[-4,1.6,-.6],.2+.4*sm(TF,TT,tau)),fov:lerp(11,16,sm(TF,TT,tau))})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tt=twos(t),tau=tau2(tt),tp=tau2(tt-1/12);
  stadium(s,c,t,[0,2,3],{roar:sm(TG,TG+.4,tau),flash:sm(TG+.05,TG+.3,tau)});
  ground(s,c);
  trail(s,c,tau,1-sm(TG+.1,TG+.5,tau));
  // the replay graphic: a yellow ring under McKennie's feet ("that's him") until he takes off
  groundRing(s,c,at(MCK,tau,0),.75,Y,sm(CUE(1,'runs at the ball')-.3,CUE(1,'runs at the ball')+.1,t)*(1-sm(TJ+.1,TJ+.3,tau)),.16);
  const r=play(s,c,tau,tp,{smear:true,min:10});
  touches(s,tau,r.ball,30,17);
 },
 aperture(t){const c=cam2(t),P=ballAt(tau2(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return CUE(1,'top of his jump')+.1;},
};

// ---------------------------------------------------------------- 3 · a second replay: low and close from the side — forehead, fingertips, net
const tau3=(t:number)=>key(t,mono([[0,TJ-.35],[CUE(2,'forehead'),TF+.01],[CUE(2,'forehead')+.9,TF+.1],[CUE(2,'Ochoa'),TT-.03],[CUE(2,'still goes in'),TG+.15],[CUE(2,'USA win')-.3,TG+2],[SECS(2),TG+4.6]]),linear);
const E3:V3=[-9.4,1.6,-6.2];
function cam3v(t:number):Cam{
 const tau=tau3(t),m=at(MCK,tau,1.3);
 return plan(t,[
  [0,0,()=>({P:E3,T:[HP[0]+.3,1.9,HP[1]+.2],fov:26})],
  [CUE(2,'forehead')-.3,.8,()=>({P:E3,T:[HEAD_PT[0]+.15,HEAD_PT[1]-.1,HEAD_PT[2]],fov:15})],
  [CUE(2,'Ochoa')-.6,.8,()=>({P:add3(E3,[1.2,0,0]),T:mix3(HEAD_PT,TOUCH_PT,.72),fov:30})],
  [CUE(2,'still goes in')+.1,1,()=>({P:add3(E3,[1.6,.2,0]),T:[-1.2,1.3,-1.2],fov:34})],
  [CUE(2,'USA win')-.6,1.6,()=>({P:[-6,3.6,-12],T:m,fov:20})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tt=twos(t),tau=tau3(tt),tp=tau3(tt-1/12),tW=CUE(2,'USA win');
  stadium(s,c,t,[0,1,3],{roar:sm(TG,TG+.4,tau),flash:Math.max(sm(TG+.05,TG+.3,tau)*(1-sm(TG+1.4,TG+2,tau)),sm(tW-.1,tW+.3,t)),board:{usa:tau>TG+.1?2:1,flash:0}});
  ground(s,c);
  const r=play(s,c,tau,tp,{smear:true,min:11,lines:true,prevBall:tau3(t-.06),only:[MCK,REY,GK,MRK,4,5,7,9,10,11,13]});
  // the replay graphic: the header's path, printed over the net so the ball reads through the mesh
  const hf=sm(TF-.05,TF+.05,tau)*(1-sm(TG+.3,TG+.8,tau));if(hf>0){const pts:Pt[]=[];for(let i=0;i<=16;i++){const p=pr(c,ballAt(lerp(TF,Math.min(tau,TG),i/16)));if(p)pts.push(p);}
   if(pts.length>2){const w=clamp(kAt(c,HEAD_PT)*.045,6,16);s.stroke(K,ribbon(pts,w*1.3,{taper:.9,pressure:.2,wobble:0}),3,.8*hf);s.knockout(ribbon(pts,w*1.3,{taper:.9,pressure:.2,wobble:0}),hf);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.95*hf);}}
  touches(s,tau,r.ball,50,23);
 },
 aperture(t){const c=cam3v(t),p=stateOf(MCK,tau3(twos(t))),sk=solve(p.pose,B_MCK,p.place),q=pr(c,sk.chest)??[0,0];return apertureDisc(q[0],q[1],60,12);},
 get still(){return CUE(2,'forehead')+.4;},
};

// ---------------------------------------------------------------- 4 · the lesson: from behind his run, a slow replay with teaching marks
const tau4=(t:number)=>key(t,mono([[0,-1.1],[CUE(3,'Attack the ball')+.2,-.5],[CUE(3,'Jump early'),TJ+.1],[CUE(3,'eyes on it'),TJ+.3],[CUE(3,'forehead'),TF-.03],[CUE(3,'forehead')+1.1,TF+.04],[SECS(3),TF+.12]]),linear);
const E4:V3=[-19.5,3.2,10];
function cam4v(t:number):Cam{
 const tau=tau4(t),w=at(MCK,tau,1.3);
 return plan(t,[
  [0,0,()=>({P:E4,T:[-8.5,.9,-.4],fov:32})],
  [CUE(3,'Attack the ball')-.1,1,()=>({P:add3(E4,[1,-.4,-1]),T:mix3(w,[HP[0],1.5,HP[1]],.5),fov:24})],
  [CUE(3,'Jump early')-.2,.9,()=>({P:add3(E4,[2,-.8,-2]),T:[HP[0]+.6,2.5,HP[1]+.8],fov:25})],
  [CUE(3,'eyes on it')-.3,.8,()=>({P:add3(E4,[2.2,-.8,-2.1]),T:mix3(at(MCK,tau,2.3),ballAt(Math.min(tau,TF)),.45),fov:24})],
  [CUE(3,'forehead')-.3,.9,()=>({P:add3(E4,[2.4,-.9,-2.2]),T:mix3(HEAD_PT,[-2,1.8,-1],.28),fov:26})],
 ]);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tt=twos(t),tau=tau4(tt),tp=tau4(tt-1/12);
  const tA=CUE(3,'Attack'),tJ=CUE(3,'Jump early'),tE=CUE(3,'eyes on it'),tH=CUE(3,'forehead');
  stadium(s,c,t,[0,1,3],{roar:.35+.3*sm(tH+.3,tH+.9,t)});
  ground(s,c);
  // "Attack the ball": a red arrow along his run, into the ball's path
  const ra=sm(tA-.1,tA+.6,t)*(1-sm(tH+.6,tH+1.2,t));
  if(ra>0){const q:V3[]=[];for(let i=0;i<=8;i++){const[x,z]=posOf(MCK,lerp(-.3,TJ-.2,i/8*ra));q.push([x,.05,z]);}arrow3(s,c,q,Math.max(9,kAt(c,[HP[0],0,HP[1]])*.12),R,.95*ra);
   // the corner's remaining flight, dashed: the ball he is attacking
   const pts:Pt[]=[];for(let i=0;i<=16;i++){const p=pr(c,flyA(P0,V_CROSS,SWING,lerp(TF*.55,TF,i/16)));if(p)pts.push(p);}
   if(pts.length>2){const gaps:[number,number][]=[];for(let i=0;i<8;i++)gaps.push([(i+.62)/8,(i+.98)/8]);const d=ribbon(pts,Math.max(7,kAt(c,HEAD_PT)*.06),{seed:21,taper:.2,wobble:.6,gaps});s.knockout(d,.8*ra);s.fill(Y,d,.95*ra);}}
  const r=play(s,c,tau,tp,{smear:true,min:12,only:[MCK,GK,MRK,6,10]});
  // "Jump early": a spark under his take-off (while the ball is still coming), an up arrow beside him
  const jp=sm(tJ-.1,tJ+.3,t)*(1-sm(tE+.2,tE+.6,t));
  if(jp>0){const[x,z]=posOf(MCK,TJ+.22),q=pr(c,[x,.05,z]);if(q)sparkBurst(s,Y,q[0],q[1],Math.max(70,kAt(c,[x,0,z])*.7)*jp,{n:9,seed:41,g:easeOutBack(jp),width:12});
   const side:V3=[x-.3,0,z-.9];arrow3(s,c,[add3(side,[0,.4,0]),add3(side,[0,.4+.9*jp,0]),add3(side,[0,.4+1.8*jp,0])],Math.max(9,kAt(c,side)*.09),R,.95*jp);}
  // "keep your eyes on it": a dotted sight line from his face to the ball
  const ey=sm(tE-.1,tE+.3,t)*(1-sm(tH+.2,tH+.5,t));
  if(ey>0&&r.ball&&tau<TF){const st=stateOf(MCK,tau),sk=solve(st.pose,B_MCK,st.place),f=pr(c,sk.face);if(f){const n=9,dots=new Path2D();for(let i=1;i<n;i++){const u=i/n,x=lerp(f[0],r.ball.g[0],u),y=lerp(f[1],r.ball.g[1],u),rr=Math.max(8,kAt(c,sk.face)*.05);dots.moveTo(x+rr,y);dots.ellipse(x,y,rr,rr,0,0,TAU);}s.stroke(K,dots,5,.9*ey);s.knockout(dots,ey);}}
  // "hit it with your forehead": a ring on the forehead at contact, then the header's arrow toward goal
  const fh=sm(tH-.2,tH+.2,t);
  if(fh>0){const st=stateOf(MCK,Math.min(tau,TF)),sk=solve(st.pose,B_MCK,st.place),g=pr(c,sk.face);if(g){const rr=Math.max(14,kAt(c,sk.face)*.13),ring:Pt[]=[];for(let i=0;i<28;i++){const a=i/28*TAU;ring.push([g[0]+Math.cos(a)*rr,g[1]+Math.sin(a)*rr]);}
    const rp_=ribbon(ring,Math.max(5,rr*.2),{seed:8,close:true,wobble:.8,pressure:.2});s.knockout(rp_,.9*fh);s.fill(R,rp_,.95*fh);}
   const arr=sm(tH+.15,tH+1.1,t,easeInOutSine);if(arr>0){const q:V3[]=[];for(let i=0;i<=8;i++)q.push(flyA(HEAD_PT,V_HEAD,G3,(TT-TF)*arr*i/8));arrow3(s,c,q,Math.max(9,kAt(c,HEAD_PT)*.06),Y,.95*fh);}}
 },
 get still(){return CUE(3,'forehead')+.3;},
};

const film:RisoStory={
 id:'mckennie-signature',format:'11v11',title:"McKennie's late header",
 theme:'Attack the ball in the air: run at it, jump early, keep your eyes on it and hit it with your forehead',
 ageNote:'United States 3–2 Mexico (after extra time), CONCACAF Nations League final, Denver, 6 June 2021. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a little header — a ball drops in from one side, a yellow spark where it is met, and it is nodded away. Reduced motion: the spark. */
 touch(s,x,y,age,seed){
  const r=rng(seed);if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}
  const u=clamp(age/.3),out=clamp((age-.3)/.4),fade=1-clamp((age-.6)/.2);
  const bx=age<.3?x+200*(1-u):x-190*easeOut(out),by=age<.3?y-120*(1-u)*(1-u):y+30*out+40*out*out;
  if(age>.26&&age<.6)sparkBurst(s,Y,x,y,110,{n:9,seed:seed+1,g:easeOutBack(clamp((age-.26)/.12))*(1-clamp((age-.46)/.14)),width:14});
  if(fade>0)footballPanels(s,bx,by,30,{rot:age*14+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
/** Solved contact points (pitch metres; Mexico's goal line x = 0, +z = the USA's right) — checked by tests/play-film-mckennie-signature.cjs. */
export const FACTS={P0,HEAD_PT,HP,TOUCH_PT,GOAL_PT,TF,TT,TG,TJ,ballAt,cornerFoot:'r' as const,
 reynaContact:()=>{const st=stateOf(REY,0),sk=solve(st.pose,B_REY,st.place);return{lToe:sk.lToe,rToe:sk.rToe};},
 mckennieAt:(tau:number)=>{const st=stateOf(MCK,tau),sk=solve(st.pose,B_MCK,st.place);return{head:sk.head,face:sk.face,air:st.pose.air,pelvis:sk.pelvis};},
 markerAt:(tau:number)=>{const st=stateOf(MRK,tau),sk=solve(st.pose,B_MRK,st.place);return{head:sk.head,pelvis:sk.pelvis};},
 ochoaAt:(tau:number)=>{const st=stateOf(GK,tau),sk=solve(st.pose,B_OCH,st.place);return{lHa:sk.lHa,rHa:sk.rHa,pelvis:sk.pelvis};}};
