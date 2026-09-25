/** Megan Rapinoe's penalty in the Women's World Cup final — United States 2–0 Netherlands, FIFA Women's World Cup 2019 final, Parc
 * Olympique Lyonnais, Décines-Charpieu (Lyon), Sunday 7 July 2019, kick-off 17:00 CEST — an iconic-play riso film (RisoStory, chapters
 * mode) played by the card's picture window (components/CardFilmPlayer.tsx) or StoryFilmPlayer. A 1:1 reconstruction of the kick from
 * WRITTEN accounts (the footage itself was not reviewed), rendered as a riso print.
 *
 * SOURCES (read Sept 2026, fetched with curl, cached in scratchpad/films/src-cache/):
 *  - Wikipedia, "2019 FIFA Women's World Cup final" (date, 17:00 CEST kick-off, Parc Olympique Lyonnais, 57,900, 31 °C and partly cloudy,
 *    referee Stéphanie Frappart (France), VAR Carlos del Cerro Grande; line-ups + numbers; the kit boxes: USA ALL WHITE, Netherlands ALL
 *    ORANGE; "a stand of Dutch fans organised behind one of the goals"; the ball = adidas Tricolore 19, "a red-coloured variant" with a
 *    blue-and-red graphic; the match report: "Van der Gragt kicked U.S. attacker Alex Morgan in the shoulder ... left uncalled until a VAR
 *    review by referee Stéphanie Frappart awarded a penalty ... scored in the 61st minute by U.S. captain Megan Rapinoe, who left Van
 *    Veenendaal standing on her line"; her sixth goal (Golden Boot), the oldest scorer in a final, the first penalty scored in a WWC final
 *    outside a shoot-out; Rapinoe (15, captain) off at 79'; Player of the Match) https://en.wikipedia.org/wiki/2019_FIFA_Women%27s_World_Cup_final
 *  - Wikipedia, "Megan Rapinoe" (her 50th international goal, from the penalty; height 5 ft 6 in) https://en.wikipedia.org/wiki/Megan_Rapinoe
 *  - The Guardian, Suzanne Wrack, "USA win Women's World Cup ..." match report, 7 July 2019 ("With Heath's cross headed on by Sherida
 *    Spitse, Morgan was on hand to collect but a high Van der Gragt leg caught Morgan's arm and missed the ball. There was a VAR
 *    intervention before the inevitable penalty was given. Up stepped Rapinoe to coolly sweep it down the middle"; "A coolly taken
 *    Rapinoe penalty") https://www.theguardian.com/football/2019/jul/07/womens-world-cup-final-report-usa-netherlands
 *  - The Guardian, Beau Dure, "Women's World Cup final: USA v Netherlands – live" (58', 60', 61' entries: VAR checking a high boot;
 *    "It's a penalty ... Yellow to van der Gragt"; "GOAL: USA 1-0 Netherlands (Rapinoe 61) Struck well as always"; photo captions "Megan
 *    Rapinoe of the USA celebrates after scoring from the penalty spot") https://www.theguardian.com/football/live/2019/jul/07/womens-world-cup-final-usa-netherlands-live
 *  - CBS Sports, Roger Gonzalez, "Women's World Cup final: USWNT's Megan Rapinoe opens the scoring, makes history with penalty kick goal",
 *    7 July 2019 ("Good thing for Rapinoe that Netherlands goalkeeper Sari van Veenendaal didn't move a bit to her left, or that might have
 *    been a fairly easy save") https://www.cbssports.com/soccer/world-cup/news/womens-world-cup-final-uswnts-megan-rapinoe-opens-the-scoring-makes-history-with-penalty-kick-goal/
 * CONFIRMED by those accounts: 7 July 2019, 17:00 in Lyon in 31 °C afternoon heat (daylight); 0–0 until the 61st minute; the penalty came
 *  from a VAR review (Van der Gragt's high boot on Morgan; yellow to Van der Gragt); Rapinoe (15, captain) took it and scored — cool, not
 *  blasted, "down the middle" but to the KEEPER'S LEFT of centre (CBS: had she moved "a bit to her left" it was an easy save), and Van
 *  Veenendaal (1, captain) was LEFT STANDING on her line; she celebrated (Guardian photo captions); the U.S. went on to win 2–0 (Lavelle
 *  69'); USA all white, Netherlands all orange; the Tricolore 19 ball (white with a red/blue graphic); referee Stéphanie Frappart; Dutch
 *  fans massed in one end stand; 57,900 crowd, mostly American.
 * INFERRED (illustrative): that she struck it with her RIGHT foot, a side-foot placement (she is right-footed; not stated in these
 *  reports — the narration never names the foot); the ball's exact line (low, ≈ .3 m high, ≈ 1.5 m right of centre from her side) and pace
 *  (≈ 11 m in .58 s); the run-up (a short, unhurried approach from her left, ≈ 17°); the keeper's tiny late shuffle; the celebration as
 *  drawn — a run toward the near corner, then the ARMS-OUT "pose" (her famous tournament celebration, as the brief describes; the written
 *  sources here only say "celebrates"); her short, dyed pinkish-lilac hair (printed as a light orange screen), every build and hair
 *  colour; the keeper's blue kit, Frappart's navy kit and ponytail, where she and the players stood, that she signalled the review by the
 *  box (the review screen is not drawn), which goal and which end the Dutch fans were at (drawn behind this goal), the camera placements,
 *  Parc OL as drawn (a close rectangular two-tier bowl, full translucent roof, no track), the roof's shadow on the pitch, the crowd's
 *  colours and flags, and the teammates who reach her first (Morgan, Lavelle, Mewis).
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in REAL TIME (Lyon in the afternoon sun → the referee
 * listening to VAR → she points to the spot → Rapinoe places the ball and walks back → Van Veenendaal on her line → the short run and the
 * cool side-foot → the net → she turns away); ch2 = the slow-motion replay from LOW BEHIND Rapinoe (a yellow ring shows the spot she had
 * already picked; the keeper stays still; a riso trail marks the low ball zipping past her); ch3 = the reverse angle from behind the net
 * (the ball comes at the lens past the rooted keeper) then the live pitchside camera for the celebration: she runs off and spreads her arms
 * wide as her teammates arrive; ch4 = the lesson: pick your spot (a ring in the corner) before you run up (a sight line locks it), don't
 * change your mind (the doubts fade), strike it with confidence (the ball follows the line into the ring).
 * Composed on the FULL sheet (world units = sheet units centred on the canvas; never sheet.safe) and kept inside the central ~1000 units, so
 * it frames from the 1.45:1 card window down to square (a narrower window widens the lens a little). Figures: every body goes through ONE
 * adapter, drawPlayer() → athlete.ts (continuous silhouettes, FK skeleton, `prev` secondary motion — ponytails and hems trail — and a
 * motion smear on the run, the strike and the celebration run); women's builds (1.60–1.80 m, slimmer bulk), ponytails; small figures in
 * the wide shots and every figure inside a passage print at `low` detail. Handedness: the world is right-handed (x toward the goal, y up,
 * +z = Rapinoe's right, the main-stand side), exactly athlete.ts's convention, so foot 'r' is her RIGHT foot with no mirrored projector;
 * the keeper faces −x, so HER left is +z — the side the ball goes.
 * Inks: yellow, orange, blue, navy (orange for the Dutch kit and fans; the white U.S. kit is the paper). Everything is keyed to cue times
 * (withTiming swaps in the recorded word onsets), poses on twos, cameras on ones; all randomness seeded. Budget: ~150–320 plate ops per frame. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,polyPath,ribbon,partial,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,runCadence,stand,keeperSet,celebrate,posed,blendPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES (≈2.7 words/s + punctuation pauses) until the Kokoro voice exists. LEAD: once
 * public/plays/narration/rapinoe-penalty-2019/timing.json exists, add
 *   import timingJson from '../../../public/plays/narration/rapinoe-penalty-2019/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues).
 * NB withTiming matches a cue by its FIRST word, in order — so no cue starts with a word that also appears between it and the previous cue. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The final, live',text:'Lyon, 2019: the World Cup final. The referee checks the video. Penalty to the USA! Megan Rapinoe steps up. The keeper waits. Rapinoe jogs in... and calmly sweeps it home. Goal!',tail:2.2,
  cues:['Lyon','World Cup final','The referee','Penalty','Megan Rapinoe','The keeper','jogs in','calmly sweeps','Goal']},
 {label:'Watch it again',text:'Watch it again, slowly. Rapinoe has picked her spot. The keeper stays still, and the ball zips low past her.',tail:1.6,
  cues:['Watch it again','picked her spot','keeper stays','the ball zips','past her']},
 {label:'Arms wide',text:'From behind the goal: in it goes! Rapinoe runs off and spreads her arms wide. The USA go on to win!',tail:2,
  cues:['From behind','in it goes','runs off','spreads her arms','The USA','win']},
 {label:'The secret',text:"The secret? Pick your spot before you run up. Don't change your mind. Then strike it with confidence!",tail:2,
  cues:['The secret','Pick your spot','before you run','change your mind','Then strike','confidence']},
];
import timingJson from '../../../public/plays/narration/rapinoe-penalty-2019/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , . ! ? : ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('rapinoe: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('rapinoe: no cue '+w);return c.at;};
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
/** Pitch: the goal line is x = 0 (the kick goes +x), the goal centre z = 0, +z = Rapinoe's right (the main-stand side). */
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

// ---------------------------------------------------------------- Parc Olympique Lyonnais on a hot afternoon: a close two-tier bowl under a pale roof
/** stand planes (a along, b up the rake 0..1), close to the pitch (no running track): 0 the far side (z<0), 1 behind this goal (x>0, the
 * Dutch end), 2 the main stand (z>0, the camera side), 3 the far end */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-116,11,a),1.1+26*b,-41-30*b],
 (a,b)=>[10+29*b,1.1+26*b,lerp(-56,56,a)],
 (a,b)=>[lerp(11,-116,a),1.1+23*b,41+27*b],
 (a,b)=>[-115-29*b,1.1+26*b,lerp(56,-56,a)],
];
const STAND_COLS=[110,74,110,74],STAND_ROWS=14,WALK=.47;
/** flags on the stand fronts: [stand, a, kind] kind 0 = the Stars and Stripes (navy canton, orange-and-paper stripes), 1 = an orange Dutch banner */
const FLAGS:[number,number,number][]=[[0,.5,0],[0,.62,0],[0,.74,0],[0,.86,0],[1,.2,1],[1,.34,1],[1,.5,1],[1,.66,1],[1,.8,1],[2,.12,0],[2,.28,0],[3,.3,0],[3,.5,0],[3,.7,0]];
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number}={}){
 const{roar=0}=o,v=view(s),tt=twos(t);
 // a hazy summer sky: a pale blue screen; the bowl's roof shades the stands
 s.field(B,.22,.5);
 const planes=new Path2D(),bands=new Path2D(),walk=new Path2D(),roof=new Path2D(),edge=new Path2D();
 for(const i of which){const S=STANDS[i],q=polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]);addPoly(planes,q);
  // the lower-tier blocks catch the sun below the roof line
  for(let k=0;k<6;k++){const a0=k/6+.02,a1=k/6+.1;addPoly(bands,polyP(c,[S(a0,.04),S(a1,.04),S(a1,.36),S(a0,.36)]));}
  seg3(c,S(0,WALK),S(1,WALK),.45,walk);
  // the roof: a pale translucent canopy over the whole bowl, a navy fascia along its inner lip
  addPoly(roof,polyP(c,[add3(S(0,1),[0,2,0]),add3(S(1,1),[0,2,0]),add3(S(1,.25),[0,24,0]),add3(S(0,.25),[0,24,0])]));
  seg3(c,add3(S(0,.25),[0,23.8,0]),add3(S(1,.25),[0,23.8,0]),.6,edge);}
 s.knockout(planes);s.tone(K,planes,.4);if(which.includes(1)){const d=polyP(c,[STANDS[1](0,0),STANDS[1](1,0),STANDS[1](1,1),STANDS[1](0,1)]);if(d.length>2)s.tone(O,polyPath(d,true),.42);}s.tone(B,planes,.22);s.tone(Y,bands,.22);s.knockout(walk,.45);
 // the crowd: seeded dots — Americans in white, navy and blue; the Dutch end a wall of orange; roar lifts them
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si],dutch=si===1;for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(Math.abs(b-WALK)<.045)continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,5);if(h<.28)continue;const a=(i+.5+(hash(i+j*31,9)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const ink=dutch?(h<.82?2:0):(h<.6?0:h<.8?1:h<.94?3:2);inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.72);s.fill(K,inks[1],.9);s.fill(O,inks[2],.95);s.fill(B,inks[3],.95);
 s.knockout(roof);s.tone(B,roof,.3);s.tone(K,roof,.2);s.fill(K,edge,.85);
 // flags on the stand fronts
 const fl=new Path2D(),st=new Path2D(),cn=new Path2D(),or=new Path2D();
 for(const[si,a,kind] of FLAGS){if(!which.includes(si))continue;const S=STANDS[si],w=.03,P=(u:number,b:number)=>S(a+u*w,b);
  const q=polyP(c,[P(0,.005),P(1,.005),P(1,.08),P(0,.08)]);if(q.length<3)continue;fl.addPath(polyPath(q,true));
  if(kind===0){for(let k=0;k<3;k++){const b0=.005+k*.025;addPoly(st,polyP(c,[P(0,b0),P(1,b0),P(1,b0+.011),P(0,b0+.011)]));}addPoly(cn,polyP(c,[P(0,.045),P(.42,.045),P(.42,.08),P(0,.08)]));}
  else addPoly(or,q);}
 s.knockout(fl);s.fill(O,st,.9);s.fill(K,cn,.95);s.fill(O,or,.95);
}
// ---------------------------------------------------------------- grass, lines, boards, the goal
function ground(s:Sheet,c:Cam,o:{bulge?:number;goal?:boolean}={}){
 // the grass right up to the stands (Parc OL has no running track)
 const g=polyP(c,[[-112,0,-40],[9,0,-40],[9,0,40],[-112,0,40]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.92);s.tone(B,gp,.78);s.tone(K,gp,.08);
 // mowing stripes across the width, every 5.25 m
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]));s.tone(K,st,.12);
 // the roof's afternoon shadow across the far side of the pitch
 const sh=polyP(c,[[-112,0,-40],[9,0,-40],[9,0,-25],[-40,0,-19],[-112,0,-24]]);if(sh.length>2)s.tone(K,polyPath(sh,true),.18);
 // advertising boards behind the goal and along both touchlines: navy with yellow panels
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
 // corner arcs on the goal line
 circ(0,-34,1,Math.PI/2,Math.PI,4);circ(0,34,1,Math.PI,Math.PI*1.5,4);
 {const d:V3[]=[];for(let i=0;i<12;i++){const a=i/12*TAU;d.push([-11+Math.cos(a)*.15,0,Math.sin(a)*.15]);}addPoly(ln,polyP(c,d));}
 s.knockout(ln);
 if(o.goal!==false)goal3(s,c,o.bulge??0);
}
/** the goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep with a sloping roof; bulge pushes the back out low, where the ball hits (z BZ) */
const BZ=1.9;
function goal3(s:Sheet,c:Cam,bulge:number){
 const X=0,z0=-3.66,z1=3.66,H=2.44,back=(z:number,y:number)=>X+2+bulge*.55*Math.exp(-Math.pow((z-BZ)/1.4,2))*(1-.6*y/1.9);
 const zs=[z0,-2.4,-1.2,0,1.2,2.4,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0,1.9),1.9,z0],[back(z0,0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1,1.9),1.9,z1],[back(z1,0),0,z1]],
  [[X,H,z0],[X,H,z1],...zs.slice().reverse().map(z=>[back(z,1.9),1.9,z] as V3)],
  [...zs.map(z=>[back(z,0),0,z] as V3),...zs.slice().reverse().map(z=>[back(z,1.9),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.32);s.tone(K,net,.1);
 const mesh=new Path2D();
 for(let i=0;i<=14;i++){const z=lerp(z0,z1,i/14);seg3(c,[X,H,z],[back(z,1.9),1.9,z],.022,mesh,.7);seg3(c,[back(z,1.9),1.9,z],[back(z,0),0,z],.022,mesh,.7);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<zs.length-1;i++)seg3(c,[back(zs[i],y),y,zs[i]],[back(zs[i+1],y),y,zs[i+1]],.022,mesh,.7);seg3(c,[X,y*H/1.9,z0],[back(z0,y),y,z0],.022,mesh,.7);seg3(c,[X,y*H/1.9,z1],[back(z1,y),y,z1],.022,mesh,.7);}
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
/** the placement: low, to her right of centre (the keeper's left) — crossing the line ≈ .3 m up, 1.5 m from the middle */
const ZL=1.5,YL=.3;
const flight=(d:number):V3=>{const u=d/DXG;return[B0[0]+d,.11+(YL-.11)*u+.12*Math.sin(Math.PI*u),B0[2]+ZL*u];};
const FLY=.58;// 11 m in ≈ .6 s: a firm, placed side-foot, not a blast
const dAt=(tau:number)=>{const u=clamp(tau/FLY);return DXG*u*(1.12-.12*u);};
const GOAL_PT=flight(DXG),NET_HIT:V3=[1.85,.32,BZ],REST:V3=[1.5,.11,BZ+.1],IN_NET=FLY+.12;
function ballAt(tau:number):V3{
 if(tau<=0)return B0;
 if(tau<FLY)return flight(dAt(tau));
 if(tau<IN_NET)return mix3(GOAL_PT,NET_HIT,easeOut((tau-FLY)/(IN_NET-FLY)));
 const u=clamp((tau-IN_NET)/.45),h=NET_HIT[1]*(1-u)+.11*u,b=u>=1?.08*Math.abs(Math.sin((tau-IN_NET-.45)*9))*Math.exp(-(tau-IN_NET-.45)*3.5):0;
 return[lerp(NET_HIT[0],REST[0],u),Math.max(.11,h)+b,lerp(NET_HIT[2],REST[2],u)];
}
/** ball spin: a forward roll off the side-foot */
const spinAt=(tau:number)=>tau<=0?0:TAU*5*Math.min(tau,IN_NET)+TAU*1.2*Math.max(0,tau-IN_NET);
const bulgeAt=(tau:number)=>tau<IN_NET-.03?0:.8*Math.exp(-(tau-IN_NET+.03)*2.8)*(1+.3*Math.sin((tau-IN_NET)*12));

// ---------------------------------------------------------------- the cast: kits (athlete.ts styles)
const SKIN_L:InkFill[]=[[Y,.35],[O,.18]],SKIN_M:InkFill[]=[[Y,.42],[O,.3],[B,.08]],SKIN_D:InkFill[]=[[O,.5],[K,.42],[Y,.18]];
/** women's footballers: a lighter frame than the default 1.8 m build, just as athletic */
const W_BUILD=(height:number,bulk=.9)=>({height,bulk,head:.97});
/** USA all white (Wikipedia kit box for the final), navy numbers; Netherlands all orange, paper numbers */
const usa=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:'paper',boots:K,skin:SKIN_L,hair:[Y,.8],line:K,trim:K,numberInk:K,hairStyle:'ponytail',build:W_BUILD(1.68),...o});
const ned=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:O,shorts:O,socks:O,boots:K,skin:SKIN_L,hair:[Y,.9],line:K,trim:'paper',numberInk:'paper',hairStyle:'ponytail',build:W_BUILD(1.7),...o});
const RAP_B=W_BUILD(1.68,.92);
/** Rapinoe: 15, captain; short dyed hair (printed as a light orange screen: a pink-lilac tint on the cream paper) */
const RAP_ST=usa({number:15,hairStyle:'short',hair:[O,.5],build:RAP_B,seed:15});
const VV_ST:AthleteStyle={shirt:[B,.92],shorts:[B,.92],socks:[B,.92],boots:K,skin:SKIN_L,hair:[Y,.85],line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'ponytail',number:1,numberInk:'paper',build:W_BUILD(1.77,.95),seed:1};
const REF_ST:AthleteStyle={shirt:[K,.88],shorts:[K,.88],socks:[K,.88],boots:K,skin:SKIN_L,hair:[Y,.6],line:K,trim:Y,hairStyle:'ponytail',build:W_BUILD(1.67,.9),seed:30};

// ---------------------------------------------------------------- Rapinoe: placing the ball, the walk back, the wait, the short run, the side-foot, the celebration
/** a short approach from her LEFT (≈ 17°) — the side-foot goes through the line of the run, to her right of centre */
const DIRN=Math.hypot(1,.3),DIR:[number,number]=[1/DIRN,.3/DIRN];
const YAW_P=yawTo(0,0,DIR[0],DIR[1]);
const SD=1.0,RUN_END=-STRIKE_CONTACT*SD,T_RUN0=-1.5,RUN_L=3.1,STRIKE_L=1.4,G_MARK=-(RUN_L+STRIKE_L),G_BALL=-.35;
const PWR=.55;// a firm placement: a modest backswing, a checked follow-through
/** the side-foot: kicking thigh rotated out so the inside of the boot faces the target, ankle locked */
function sideFoot(u:number):Pose{const p=strike(u,{foot:'r',power:PWR}),w=sm(.3,STRIKE_CONTACT,u)*(1-sm(.72,.95,u));p.rHipR+=.72*w;p.rAnk-=.5*w;p.yaw-=.12*w;return p;}
/** where her pelvis stands at contact so the inside of her RIGHT boot meets the back of the ball (solved once, FK) */
const PC:[number,number]=(()=>{const sk=solve(sideFoot(STRIKE_CONTACT),RAP_B,{x:0,z:0,yaw:YAW_P}),mid:[number,number]=[(sk.rToe[0]+sk.rHeel[0])/2,(sk.rToe[2]+sk.rHeel[2])/2],tgt:[number,number]=[B0[0]-DIR[0]*.14,B0[2]-DIR[1]*.14];return[tgt[0]-mid[0],tgt[1]-mid[1]];})();
const gPos=(g:number):[number,number]=>[PC[0]+DIR[0]*g,PC[1]+DIR[1]*g];
const P_PLACE=posed({lHipF:70,rHipF:40,lKnee:100,rKnee:60,lean:40,pitch:12,neckP:30,lShF:62,rShF:66,lElb:18,rElb:20,lShA:14,rShA:12,lHand:.8,rHand:.8});
/** at her mark: hands on hips, weight even, eyes on the goal — relaxed */
const P_WAIT=posed({lHipF:-2,rHipF:8,lKnee:10,rKnee:14,lAnk:0,rAnk:-4,lean:4,pitch:1,neckP:-2,lShA:38,rShA:38,lShF:-14,rShF:-14,lElb:96,rElb:96,lShR:30,rShR:30});
const P_GO=posed({lHipF:-18,rHipF:22,lKnee:24,rKnee:30,lAnk:16,rAnk:-6,lean:12,pitch:4,neckP:8,lShA:22,rShA:20,lShF:-12,rShF:14,lElb:40,rElb:46,twist:-8});
/** THE POSE: arms spread wide, chest open, chin up, feet set */
const P_POSE=posed({lShA:96,rShA:96,lShF:-6,rShF:-6,lElb:6,rElb:6,lShR:-10,rShR:-10,lHand:1,rHand:1,lHipF:4,rHipF:4,lHipA:9,rHipA:9,lKnee:8,rKnee:8,lean:-12,pitch:-3,neckP:-20,squash:.03});
const walkPose=(ph:number)=>{const p=blendPose(runCycle(ph,{speed:0,stride:.55}),P_WAIT,.2);p.air=0;return p;};
/** after the kick: watch it go in, turn, run toward the corner, set THE POSE facing the main stand */
const T_TURN=.75,T_CEL=3.1,CEL:[number,number]=[-4.6,7.6];
const CEL_YAW=yawTo(CEL[0],CEL[1],.5,16);
const runU=(tau:number)=>clamp((tau-T_RUN0)/(RUN_END-T_RUN0));
function runG(tau:number){const u=runU(tau);return G_MARK+RUN_L*(1.15*u-.15*u*u);}
const celU=(tau:number)=>sm(T_TURN+.2,T_CEL,tau,linear);
function rapPose(tau:number,walk=1,it=0):Pose{
 if(tau<=T_RUN0){
  if(walk<1){const u=walk;if(u<.12)return blendPose(P_PLACE,stand(),sm(0,.12,u));
   const d=Math.abs(G_MARK-G_BALL)*sm(.12,.82,u,linear);let p=walkPose(d*.72);if(u>.82)p=blendPose(p,P_WAIT,sm(.82,1,u));return p;}
  const br=.5+.5*Math.sin(it*2.1),p=blendPose(P_WAIT,P_GO,sm(T_RUN0-.4,T_RUN0,tau));p.lean+=.02*br;p.neckP+=.03*br;return p;}
 if(tau<RUN_END){const u=runU(tau);return blendPose(P_GO,runCycle(2.1*Math.pow(u,.9),{speed:.5}),sm(0,.2,u));}
 const us=STRIKE_CONTACT+tau/SD,run=runCycle(2.1+(tau-RUN_END)*1.4,{speed:.45});
 let p=blendPose(run,sideFoot(Math.min(1,us)),sm(RUN_END,RUN_END+.14,tau));
 if(tau>.55)p=blendPose(p,stand(),sm(.55,.8,tau));
 // the celebration run: a sprint that eases to the spot, then the pose
 if(tau>T_TURN){const u=celU(tau),ph=(tau-T_TURN)*runCadence(.8);p=blendPose(p,runCycle(ph,{speed:.85-.4*u}),sm(T_TURN,T_TURN+.25,tau));
  p=blendPose(p,P_POSE,sm(T_CEL-.35,T_CEL+.25,tau));
  if(tau>T_CEL+.25){const b=Math.sin((tau-T_CEL)*2.2);p.neckP+=.04*b;p.lShA+=.03*b;p.rShA+=.03*b;}}
 return p;
}
function rapPlace(tau:number,walk=1):Place{
 if(tau<=T_RUN0){
  if(walk<1){const u=walk,g=lerp(G_BALL,G_MARK,sm(.12,.82,u,linear)),[x,z]=gPos(g);
   return{x,z,yaw:u<.12?YAW_P:lerpAng(lerpAng(YAW_P,YAW_P+Math.PI,sm(.08,.2,u)),YAW_P+TAU,sm(.8,1,u))};}
  const[x,z]=gPos(G_MARK);return{x,z,yaw:YAW_P};}
 let g:number;
 if(tau<RUN_END)g=runG(tau);
 else if(tau<0){const v=(tau-RUN_END)/-RUN_END;g=-STRIKE_L+STRIKE_L*(.6*v+.4*(1-(1-v)*(1-v)));}
 else g=.5*(1-Math.pow(1-clamp(tau/.6),2));
 let[x,z]=gPos(g);
 const[x0,z0]=gPos(.5);
 if(tau>T_TURN){const u=celU(tau),e=u*(2-u);x=lerp(x0,CEL[0],e);z=lerp(z0,CEL[1],e);}
 const runYaw=yawTo(x0,z0,CEL[0],CEL[1]);
 return{x,z,yaw:lerpAng(lerpAng(YAW_P,runYaw,sm(T_TURN,T_TURN+.35,tau,easeInOutSine)),CEL_YAW,sm(T_CEL-.4,T_CEL+.2,tau,easeInOutSine))};
}

// ---------------------------------------------------------------- Van Veenendaal: set on her line, a tiny late shuffle — left standing
const VV_X=-.15;
function vvAt(tau:number,it:number):{pose:Pose;place:Place}{
 let p=keeperSet(it*1.2);
 // she holds her ground: a small sink as the ball is struck, a late half-reach to her LEFT (+z) that never gets there
 const r=sm(.05,.35,tau)*(1-sm(1.1,1.7,tau));
 if(r>0)p=blendPose(p,posed({lHipF:56,rHipF:44,lHipA:24,rHipA:12,lKnee:66,rKnee:52,lean:22,pitch:6,bend:-10,roll:-6,lShA:58,rShA:40,lShF:40,rShF:34,lElb:40,rElb:56,lHand:1,rHand:1,neckP:-4,neckY:22,dz:-.12}),r);
 // after it goes in: hands on hips, head down
 const d=sm(1.1,1.7,tau);if(d>0)p=blendPose(p,posed({lHipF:6,rHipF:6,lKnee:10,rKnee:10,lean:16,neckP:30,lShA:40,rShA:40,lShF:-12,rShF:-12,lElb:100,rElb:100,lShR:30,rShR:30}),d);
 return{pose:p,place:{x:VV_X,z:0,yaw:Math.PI}};
}

// ---------------------------------------------------------------- everyone else
type Role='ref'|'usa'|'ned';
/** runTo: a teammate who sprints to Rapinoe in the celebration [start τ, arrival offset from CEL] */
type Actor={name:string;role:Role;st:AthleteStyle;x:number;z:number;phase:number;runTo?:[number,number,number]};
/** outside the box and the D while the kick is taken (Laws: behind the ball, 9.15 m from the spot) */
const ACTORS:Actor[]=[
 {name:'Frappart',role:'ref',st:REF_ST,x:-13.2,z:-8.4,phase:.6},
 {name:'Morgan',role:'usa',st:usa({number:13,hair:[K,.6],build:W_BUILD(1.7,.92),seed:13,detail:'low'}),x:-17.6,z:7.8,phase:.1,runTo:[3.2,-1.1,-.9]},
 {name:'Lavelle',role:'usa',st:usa({number:16,hair:[K,.7],build:W_BUILD(1.63,.9),seed:16,detail:'low'}),x:-20.8,z:-1.6,phase:.4,runTo:[3.4,1.1,-.6]},
 {name:'Mewis',role:'usa',st:usa({number:3,hair:[Y,.7],build:W_BUILD(1.8,.95),seed:3,detail:'low'}),x:-19.8,z:5.2,phase:.7,runTo:[3.6,-.2,-1.5]},
 {name:'Heath',role:'usa',st:usa({number:17,hair:[K,.7],build:W_BUILD(1.68,.9),seed:17,detail:'low'}),x:-17.4,z:12,phase:.25},
 {name:'Ertz',role:'usa',st:usa({number:8,hair:[Y,.75],build:W_BUILD(1.7,.94),seed:8,detail:'low'}),x:-22.4,z:2.4,phase:.85},
 {name:'Dunn',role:'usa',st:usa({number:19,skin:SKIN_D,hair:K,hairStyle:'curly',build:W_BUILD(1.6,.9),seed:19,detail:'low'}),x:-21.6,z:-7.4,phase:.5},
 {name:'Van der Gragt',role:'ned',st:ned({number:3,build:W_BUILD(1.78,.95),seed:33,detail:'low'}),x:-20.6,z:1.2,phase:.3},
 {name:'Spitse',role:'ned',st:ned({number:8,build:W_BUILD(1.71,.92),seed:38,detail:'low'}),x:-19.8,z:-4.6,phase:.9},
 {name:'Van de Donk',role:'ned',st:ned({number:10,hair:[K,.7],build:W_BUILD(1.6,.9),seed:40,detail:'low'}),x:-17.8,z:10.4,phase:.15},
 {name:'Dekker',role:'ned',st:ned({number:6,build:W_BUILD(1.76,.95),seed:36,detail:'low'}),x:-17.8,z:-9.8,phase:.65},
 {name:'Miedema',role:'ned',st:ned({number:9,hair:[O,.45],build:W_BUILD(1.75,.92),seed:39,detail:'low'}),x:-21.8,z:6.6,phase:.45},
];
const SLUMP=posed({lHipF:30,rHipF:30,lKnee:36,rKnee:36,lean:34,pitch:6,neckP:30,lShA:14,rShA:14,lShF:24,rShF:24,lElb:20,rElb:20});
/** the referee: a hand to her ear (VAR talking), then the arm out to the spot */
const P_EAR=posed({rShF:26,rShA:72,rShR:30,rElb:146,lShA:14,lElb:22,neckY:-14,neckP:6});
const P_POINT=posed({rShF:62,rShA:24,rElb:4,rHand:1,lShA:18,lShF:-8,lElb:20,lean:6,neckP:8,lHipF:10,rHipF:-4});
type Env={it:number;walk?:number;ear?:number;point?:number;smear?:boolean;minBall?:number;lines?:boolean;prevT?:number;hero?:'high'|'mid';crowd?:boolean};
/** one actor's pose + place at τ (it = idle clock) */
function actorAt(a:Actor,tau:number,it:number,e:Env):{pose:Pose;place:Place}{
 const toBall=yawTo(a.x,a.z,B0[0],B0[2]),br=Math.sin(it*2.1+a.phase*TAU),goal=sm(IN_NET-.1,IN_NET+.3,tau);
 if(a.role==='ref'){let p=blendPose(stand(),P_EAR,e.ear??0);p=blendPose(p,P_POINT,e.point??0);
  if(goal>0)p=blendPose(p,posed({rShF:20,rShA:18,lShA:18,lElb:20,rElb:20,neckP:0}),goal);
  return{pose:p,place:{x:a.x,z:a.z,yaw:yawTo(a.x,a.z,-9.6,-.5)}};}
 if(a.role==='ned'){let p=blendPose(stand(),SLUMP,.12+.05*br);if(goal>0)p=blendPose(p,SLUMP,goal*.85);return{pose:p,place:{x:a.x,z:a.z,yaw:toBall}};}
 // the Americans: up on their toes, then jumping, then (three of them) sprinting to her
 let p=blendPose(stand(),posed({lHipF:20,rHipF:20,lKnee:30,rKnee:30,lean:14,lShA:20,rShA:20,lElb:40,rElb:40}),.4+.1*br);
 if(goal>0)p=blendPose(p,celebrate(it*.9+a.phase,{kind:'arms'}),goal);
 if(a.runTo){const[t0,ox,oz]=a.runTo,dest:[number,number]=[CEL[0]+ox,CEL[1]+oz],L=Math.hypot(dest[0]-a.x,dest[1]-a.z),T=L/6.2,u=clamp((tau-t0)/T);
  if(tau>t0){const ph=(tau-t0)*runCadence(1);p=blendPose(p,runCycle(ph+a.phase,{speed:1-.5*u}),sm(t0,t0+.2,tau));
   if(u>=1)p=blendPose(p,celebrate(it*.9+a.phase,{kind:'arms'}),sm(t0+T,t0+T+.3,tau));
   const e2=u*(2-u),x=lerp(a.x,dest[0],e2),z=lerp(a.z,dest[1],e2);
   return{pose:p,place:{x,z,yaw:u<1?yawTo(a.x,a.z,dest[0],dest[1]):yawTo(x,z,CEL[0],CEL[1])}};}}
 return{pose:p,place:{x:a.x,z:a.z,yaw:toBall}};
}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the pose one drawn frame earlier (secondary
 * motion: ponytails and hems trail), smear = halftone echo + speed lines on fast limbs (the run, the strike, the celebration sprint). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:{pose:Pose;place:Place},smear=false){
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
}

// ---------------------------------------------------------------- the ball (the Tricolore 19: white, a red-and-blue graphic → orange panels)
function drawBall(s:Sheet,c:Cam,tau:number,o:{min?:number;lines?:boolean;prev?:number}={}){
 const P=ballAt(tau),q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??18,c.F*.11/q[2]);
 const sh:Pt[]=[];const rad=.16+P[1]*.05;for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*1.3,0,P[2]+Math.sin(a)*rad]);if(p)sh.push(p);}
 if(sh.length>8)s.tone(K,polyPath(sh,true),clamp(.5-P[1]*.15,.1,.5));
 if(o.lines&&o.prev!==undefined&&tau>0&&tau<IN_NET){const a=pr(c,ballAt(o.prev));if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.8)speedLines(s,K,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:3,seed:7,len:Math.min(200,d*1.2),spread:r*.8,width:Math.max(2.5,r*.16),cov:.75});}}
 footballPanels(s,g[0],g[1],r,{rot:spinAt(tau),key:O,shadow:B,seed:5});
 return{g,r,d:q[2]};
}
/** the flown path from τa to τb as projected points */
function pathPts(c:Cam,ta:number,tb:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<=n;i++){const p=pr(c,ballAt(lerp(ta,tb,i/n)));if(p)out.push(p);}return out;}

// ---------------------------------------------------------------- one frame of the world through a camera
/** everything on the pitch, depth-sorted (far first): the players at τp (poses on twos), their previous drawn pose, the ball at τ.
 * Heat: small figures print at `low` detail; inside a passage every figure is capped (the outgoing scene is zoomed past the camera). */
function play(s:Sheet,c:Cam,tau:number,tp:number,tpPrev:number,e:Env){
 const v=view(s),items:{d:number;draw:()=>void}[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending;
 const visible=(pl:Place,h=1.8)=>{const q=toCam(c,[pl.x??0,.9,pl.z??0]);if(q[2]<1)return -1;const g=scr(c,q),k=c.F/q[2]*h;return Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k?-1:q[2];};
 const detailFor=(st:AthleteStyle,d:number,hero:boolean):AthleteStyle=>{const px=c.F*1.8/d*ppu;if(passing)return{...st,detail:hero?'mid':'low'};if(px<120)return{...st,detail:'low'};if(!hero)return{...st,detail:px>200?'mid':'low'};if(e.hero==='mid'&&px>170)return{...st,detail:'mid'};return{...st,detail:'auto'};};
 const walk=e.walk??1;
 {const pl=rapPlace(tp,walk),d=visible(pl);if(d>0)items.push({d,draw:()=>{const pose=rapPose(tp,walk,e.it),prev={pose:rapPose(tpPrev,walk,e.it-1/12),place:rapPlace(tpPrev,walk)};
  drawPlayer(s,pose,c,detailFor(RAP_ST,d,true),pl,prev,!!e.smear&&((tp>T_RUN0+.2&&tp<.4)||(tp>T_TURN+.1&&tp<T_CEL-.2)));}});}
 {const cur=vvAt(tp,e.it),d=visible(cur.place);if(d>0)items.push({d,draw:()=>{const prev=vvAt(tpPrev,e.it-1/12);drawPlayer(s,cur.pose,c,detailFor(VV_ST,d,true),cur.place,prev);}});}
 for(const a of ACTORS){if(e.crowd===false&&a.role!=='ref'&&!a.runTo)continue;const cur=actorAt(a,tp,e.it,e),d=visible(cur.place);if(d<0)continue;
  items.push({d,draw:()=>{const prev=actorAt(a,tpPrev,e.it-1/12,e);drawPlayer(s,cur.pose,c,detailFor(a.st,d,false),cur.place,prev,!!e.smear&&!!a.runTo&&tp>a.runTo[0]);}});}
 const bq=toCam(c,ballAt(tau));if(bq[2]>=NEAR)items.push({d:bq[2],draw:()=>{drawBall(s,c,tau,{min:e.minBall,lines:e.lines,prev:e.prevT});}});
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
const pxz=(tau:number,walk=1):V3=>{const p=rapPlace(tau,walk);return[p.x??0,0,p.z??0];};
const REF_AT:V3=[-13.2,1,-8.4];

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time
/** contact lands between "calmly sweeps" and the ball being in the net on "Goal" — but never before the run (from "jogs in") has had time */
const tS1=()=>Math.max((CUE(0,'calmly sweeps')+.35+CUE(0,'Goal')-IN_NET+.1)/2,CUE(0,'jogs in')-T_RUN0-.1);
const tau1=(t:number)=>Math.max(T_RUN0-6,t-tS1());
/** placing the ball and the walk back to her mark: from "Megan Rapinoe" until before the run */
const walk1=(t:number)=>{const a=CUE(0,'Megan Rapinoe')-.1,b=Math.max(a+.8,Math.min(a+2.8,tS1()+T_RUN0-.8));return sm(a,b,t,linear);};
const P1:V3=[-36,19,54];
function cam1(t:number):Cam{
 const tau=tau1(t),tN=tS1()+IN_NET;
 return plan(t,[
  [0,0,()=>({P:P1,T:[-30,2,-4],fov:46})],
  [CUE(0,'World Cup')-.2,1.2,()=>({P:P1,T:[-14,1,0],fov:18})],
  [CUE(0,'The referee')-.25,.9,()=>({P:P1,T:add3(REF_AT,[0,.1,0]),fov:3.6})],
  [CUE(0,'Penalty')-.1,.8,()=>({P:P1,T:mix3(REF_AT,[-11,.6,0],.35),fov:5})],
  [CUE(0,'Megan Rapinoe')-.2,1,()=>({P:P1,T:add3(pxz(T_RUN0-.5,walk1(t)),[.6,1,0]),fov:6.5})],
  [CUE(0,'The keeper')-.25,.8,()=>({P:P1,T:[VV_X,1.2,0],fov:4.8})],
  [CUE(0,'jogs in')-.35,.8,()=>({P:P1,T:[-6.2,1,.6],fov:15})],
  [tN-.2,.8,()=>({P:P1,T:[-.6,1,1],fov:9.5})],
  [tN+.7,1.4,()=>({P:P1,T:add3(pxz(tau),[0,1,0]),fov:12})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tau=tau1(t),tt=twos(t),tp=tau1(tt),tpp=tau1(tt-1/12),tN=tS1()+IN_NET;
  const tR=CUE(0,'The referee'),tP=CUE(0,'Penalty'),ear=sm(tR-.1,tR+.4,tt)*(1-sm(tP-.15,tP+.1,tt)),point=sm(tP-.1,tP+.25,tt,easeOutBack)*(1-sm(tP+1.6,tP+2.3,tt));
  stadium(s,c,t,[0,1,3],{roar:sm(tN-.1,tN+.4,t)+.4*point});
  ground(s,c,{bulge:bulgeAt(tau)});
  play(s,c,tau,tp,tpp,{it:tt,walk:walk1(tt),ear,point,minBall:14,lines:true,prevT:tau1(t-.06),hero:'mid'});
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:13,
};

// ---------------------------------------------------------------- 2 · the slow-motion replay from low behind Rapinoe: the spot already picked, the keeper still, the ball zips past
const tau2=(t:number)=>key(t,mono([[0,T_RUN0-.3],[CUE(1,'picked her spot'),T_RUN0+.1],[CUE(1,'keeper stays'),RUN_END+.1],[CUE(1,'the ball zips'),.04],[CUE(1,'past her'),FLY-.05],[SECS(1),IN_NET+.7]]),linear);
const E2:V3=[B0[0]-8.6,1.6,B0[2]-2.6];
function cam2(t:number):Cam{
 const tau=tau2(t),b=ballAt(Math.min(tau,FLY));
 return plan(t,[
  [0,0,()=>({P:E2,T:[-3,1,.3],fov:24})],
  [CUE(1,'keeper stays')-.3,.9,()=>({P:add3(E2,[2,-.2,.8]),T:[-2,.9,.4],fov:19})],
  [CUE(1,'the ball zips')-.1,.9,()=>({P:add3(E2,[2.4,-.3,1]),T:mix3(b,[0,.6,.9],.5),fov:15})],
  [CUE(1,'past her')-.1,1.1,()=>({P:add3(E2,[2.6,-.2,1.1]),T:[-.4,.8,.9],fov:16})],
 ]);
}
/** a ring on the goal mouth at the chosen spot (x just in front of the line) */
function spotRing(s:Sheet,c:Cam,at:V3,rad:number,cov:number,ink=Y,wm=.09){
 const ring:Pt[]=[];for(let i=0;i<32;i++){const a=i/32*TAU,p=pr(c,[at[0],at[1]+Math.sin(a)*rad,at[2]+Math.cos(a)*rad]);if(p)ring.push(p);}
 if(ring.length<20)return;const rr=ribbon(ring,Math.max(5,kAt(c,at)*wm),{close:true,seed:11,taper:0,wobble:1});s.knockout(rr,.85*cov);s.fill(ink,rr,.95*cov);
}
const SPOT:V3=[.02,YL+.08,ZL];
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tau=tau2(t),tt=twos(t),tp=tau2(tt),tpp=tau2(tt-1/12);
  stadium(s,c,t,[0,1,2],{roar:sm(IN_NET,IN_NET+.4,tau)});
  ground(s,c,{bulge:bulgeAt(tau)});
  // the spot she had already picked: a yellow ring in the goal mouth, before she moves
  const tS=CUE(1,'picked her spot'),ring=sm(tS-.1,tS+.5,t,easeOutBack)*(1-sm(IN_NET,IN_NET+.5,tau));
  if(ring>.02)spotRing(s,c,SPOT,.5*clamp(ring,0,1.2),Math.min(1,ring));
  // the replay trail: the low line so far, fading at the tail (under the players)
  if(tau>.02&&tau<IN_NET+.6){const pts=pathPts(c,Math.max(0,tau-.5),Math.min(tau,FLY+.001),20),fade=1-sm(FLY+.1,IN_NET+.6,tau);if(pts.length>2){const w=Math.max(8,kAt(c,ballAt(Math.min(tau,FLY)))*.16);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*fade);}}
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:12,crowd:false});
 },
 aperture(t){const c=cam2(t),P=ballAt(tau2(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:5.4,
};

// ---------------------------------------------------------------- 3 · reverse angle from behind the net, then live pitchside for THE POSE
const tau3=(t:number)=>key(t,mono([[0,-.35],[CUE(2,'in it goes'),IN_NET+.05],[CUE(2,'runs off'),T_TURN+.35],[CUE(2,'spreads her arms'),T_CEL],[SECS(2),T_CEL+(SECS(2)-CUE(2,'spreads her arms'))]]),linear);
const E3:V3=[5,1.3,.9];
const CELV:V3=[CEL[0],1.2,CEL[1]];
function cam3v(t:number):Cam{
 const tau=tau3(t);
 return plan(t,[
  [0,0,()=>({P:E3,T:[-9,.8,.4],fov:30})],
  [CUE(2,'in it goes')-.3,.8,()=>({P:add3(E3,[-.2,.1,.4]),T:[-1.5,.4,.6],fov:34})],
  [CUE(2,'runs off')-.2,1.1,()=>({P:[2.5,1.5,14],T:add3(pxz(tau),[0,1,0]),fov:34})],
  [CUE(2,'spreads her arms')-.3,1.1,()=>({P:[1.8,1.4,15.5],T:add3(CELV,[0,-.1,0]),fov:16})],
  [CUE(2,'The USA')-.2,1.4,()=>({P:[2.4,1.6,16.5],T:add3(CELV,[.2,-.2,-.3]),fov:24})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tau=tau3(t),tt=twos(t),tp=tau3(tt),tpp=tau3(tt-1/12),tA=CUE(2,'spreads her arms'),tU=CUE(2,'The USA');
  stadium(s,c,t,[0,2,3],{roar:.35+.65*sm(IN_NET,IN_NET+.4,tau)});
  ground(s,c,{goal:false});
  // behind the net: the goal frame is nearer than the play until the camera swings round
  const behind=sm(CUE(2,'runs off')-.2,CUE(2,'runs off')+.4,t);
  if(behind>.5)goal3(s,c,bulgeAt(tau));
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:10});
  if(behind<=.5)goal3(s,c,bulgeAt(tau));
  // THE POSE: a yellow burst behind her, then the win
  const pz=sm(tA-.05,tA+.4,t);if(pz>0){const q=pr(c,[CEL[0],1.35,CEL[1]]);if(q)sparkBurst(s,Y,q[0],q[1],90+140*pz,{n:12,seed:15,g:easeOutBack(pz),width:12,cov:.9*(1-sm(tU+.6,tU+1.4,t))});}
  const wn=sm(tU-.05,tU+.4,t);if(wn>0){const q=pr(c,[CEL[0]-.5,2.6,CEL[1]]);if(q)sparkBurst(s,O,q[0],q[1],160+120*wn,{n:9,seed:21,g:easeOutBack(wn),width:10});}
 },
 aperture(t){const c=cam3v(t),q=pr(c,CELV)??[0,0];return apertureDisc(q[0],q[1],90,12);},
 still:6,
};

// ---------------------------------------------------------------- 4 · the lesson: pick your spot → before the run → no second thoughts → strike it with confidence
const tau4=(t:number)=>key(t,mono([[0,T_RUN0-.6],[CUE(3,'change your mind'),T_RUN0-.1],[CUE(3,'Then strike'),T_RUN0+.05],[CUE(3,'confidence'),.05],[SECS(3),IN_NET+.7]]),linear);
function cam4v(t:number):Cam{
 const pm=pxz(T_RUN0);
 return plan(t,[
  [0,0,()=>({P:add3(pm,[-3.4,1.6,-2.4]),T:add3(pm,[0,1,0]),fov:34})],
  [CUE(3,'Pick your spot')-.2,1.1,()=>({P:add3(pm,[-5,1.7,.6]),T:[-8,.9,-.4],fov:22})],
  [CUE(3,'Then strike')-.2,1.1,()=>({P:[-19,2.4,-3.6],T:[-4.5,.7,.6],fov:36})],
 ]);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tau=tau4(t),tt=twos(t),tp=tau4(tt),tpp=tau4(tt-1/12);
  const tK=CUE(3,'Pick your spot'),tB=CUE(3,'before you run'),tM=CUE(3,'change your mind'),tT=CUE(3,'Then strike'),tC=CUE(3,'confidence');
  stadium(s,c,t,[0,1,3],{roar:.8*sm(tC,tC+.4,t)});
  ground(s,c,{bulge:bulgeAt(tau)});
  // 2 · doubts: two faint orange rings elsewhere in the goal flicker, then fade away ("don't change your mind")
  const doubt=sm(tB+.1,tB+.5,t)*(1-sm(tM,tM+.7,t));
  if(doubt>.02){spotRing(s,c,[.02,1.7,-2.3],.42,.85*doubt*(.7+.3*Math.sin(tt*9)),O,.07);spotRing(s,c,[.02,.4,-1.6],.42,.85*doubt*(.7+.3*Math.sin(tt*9+2)),O,.07);}
  // 1 · pick your spot: the yellow ring, steady and locked
  const pick=sm(tK-.05,tK+.45,t,easeOutBack);
  if(pick>.02)spotRing(s,c,SPOT,.58*clamp(pick,0,1.2),Math.min(1,pick)*(1-sm(IN_NET+.2,IN_NET+.7,tau)));
  // 4 · strike it: the line into the ring, drawn as she strikes (under the players)
  const dv=sm(tT-.1,tT+.4,t);
  if(dv>.02){const pts=partial(pathPts(c,0,FLY,24),Math.max(.04,clamp(tau/FLY))),w=Math.max(9,kAt(c,[-5,.3,.8])*.12);if(pts.length>2){s.knockout(ribbon(pts,w*1.6,{taper:.4,pressure:.2,wobble:0}),.5*dv);s.fill(Y,ribbon(pts,w,{taper:.4,pressure:.2,wobble:0}),.95*dv);}}
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:13,crowd:false});
  // before you run up: a dashed yellow sight line from her eyes to the ring, held (it never wavers) until she runs
  const sl=sm(tB-.15,tB+.45,t,easeOutBack)*(1-sm(tT,tT+.4,t));
  if(sl>.02){const sk=solve(rapPose(tp,1,tt),RAP_B,rapPlace(tp)),a=pr(c,sk.face),b=pr(c,SPOT);
   if(a&&b){const rb=new Path2D(),n=10,w=Math.max(8,kAt(c,pxz(T_RUN0))*.04),u1=clamp(sl);for(let i=0;i<n;i++){const u0=i/n*u1,ue=(i+.62)/n*u1,p0:Pt=[lerp(a[0],b[0],u0),lerp(a[1],b[1],u0)],p1:Pt=[lerp(a[0],b[0],ue),lerp(a[1],b[1],ue)];rb.addPath(ribbon([p0,p1],w,{seed:13+i,taper:.2,wobble:0}));}
    s.knockout(rb,.95);s.fill(Y,rb,.95);s.stroke(K,rb,1.8,.8);}}
  // confidence: it goes in — a yellow burst in the net
  const gd=sm(tC-.05,tC+.4,t);if(gd>0&&tau>FLY){const q=pr(c,[.8,.5,ZL]);if(q)sparkBurst(s,Y,q[0],q[1],Math.max(60,kAt(c,[0,.5,ZL])*1.1)*easeOutBack(gd),{n:10,seed:61,width:Math.max(6,kAt(c,[0,.5,ZL])*.05)});}
 },
 still:9,
};

const film:RisoStory={
 id:'rapinoe-penalty-2019',format:'11v11',title:"Rapinoe's penalty in the World Cup final",
 theme:'Penalties: pick your spot before you run up, then strike it with confidence',
 ageNote:'United States 2–0 Netherlands, FIFA Women\'s World Cup final, Parc Olympique Lyonnais, Lyon, 7 July 2019. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',orange:'#ff6c2f',blue:'#0078bf',navy:'#22366b'},order:['yellow','orange','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a little placed penalty — a low yellow line into a ring, a ball on its tip. Reduced motion: the still line. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.5)),fade=age<=0?1:1-clamp((age-.65)/.25),r=rng(seed);
  const pts:Pt[]=[];for(let i=0;i<=12;i++){const k=i/12*u;pts.push([x+170*k,y-30*k-14*Math.sin(Math.PI*k)]);}
  if(pts.length>2)s.fill(Y,ribbon(pts,12,{seed,taper:.8,pressure:.3,wobble:1}),.95*fade);
  const ring:Pt[]=[];for(let i=0;i<24;i++){const a=i/24*TAU;ring.push([x+170+Math.cos(a)*34,y-30+Math.sin(a)*34]);}
  s.fill(Y,ribbon(ring,8,{close:true,seed,taper:0,wobble:1}),.9*fade);
  const e=pts[pts.length-1];if(age>.45&&age<.75)sparkBurst(s,Y,x+170,y-30,70,{n:7,seed,g:1-clamp((age-.45)/.3),width:9});
  footballPanels(s,e[0],e[1],26,{rot:age*8+r()*TAU,key:O,shadow:B,seed:5});
 },
};
export default film;
