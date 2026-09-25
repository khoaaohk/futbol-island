/** Antoine Griezmann's penalty in the World Cup final — France 4–2 Croatia, 2018 FIFA World Cup final, Luzhniki Stadium, Moscow,
 * Sunday 15 July 2018, kick-off 18:00 local — an iconic-play riso film (RisoStory, chapters mode) played by the card's picture window
 * (components/CardFilmPlayer.tsx) or StoryFilmPlayer. A 1:1 reconstruction of the kick from WRITTEN accounts (the footage itself was
 * not reviewed), rendered as a riso print.
 *
 * SOURCES (read Sept 2026, fetched with curl, cached in scratchpad/films/src-cache/):
 *  - Wikipedia, "2018 FIFA World Cup final" (15 July 2018, Luzhniki Stadium, Moscow; Croatia kicked off at 18:00 local in 27 °C, 51 %
 *    humidity, partly cloudy; 78,011; "played through a minor thunderstorm"; the renovation moved the stands closer and REMOVED THE
 *    ATHLETICS TRACK, new polycarbonate roof skin; referee Néstor Pitana (Argentina), VAR Massimiliano Irrati; the penalty: Griezmann's
 *    corner, Matuidi's header, Perišić handled while marking Matuidi, "The video assistant referee alerted Pitana and after he reviewed
 *    the incident for several minutes, he gave a penalty ... taken by Griezmann in the 38th minute, and he scored with a low kick into the
 *    left-hand corner"; line-ups + numbers (Griezmann 7, Subašić 23, Pogba 6, Mbappé 10, Matuidi 14, Giroud 9, Kanté 13, Modrić 10,
 *    Rakitić 7, Perišić 4, Mandžukić 17, Lovren 6, Vida 21, Brozović 11); the kit boxes: France ALL DARK NAVY (#112855 shirt, shorts and
 *    socks), Croatia red-and-white checks (#F40000 base, check pattern) with WHITE shorts and WHITE socks; Griezmann man of the match)
 *    https://en.wikipedia.org/wiki/2018_FIFA_World_Cup_final
 *  - Wikipedia, "Antoine Griezmann" ("a versatile LEFT-FOOTED forward"; height 1.76 m; "scored a 38th-minute penalty after the referee
 *    ruled for handball (via a video assistant review) to give France a 2–1 lead") https://en.wikipedia.org/wiki/Antoine_Griezmann
 *  - The Guardian, "World Cup 2018 final: France v Croatia – live" (33', 36', 37', 38' entries: "Referee Nestor Pitana is going
 *    pitch-side for a look at his monitor"; "The ref studies his monitor at great length - then awards the penalty!"; "Antoine Griezmann
 *    waits to take the penalty as Subasic delays proceedings by refusing to get on his goal-line"; "GOAL! ... Antoine Griezmann
 *    nonchalantly rolls the ball past Danijel Subasic into the bottom left-hand corner") https://www.theguardian.com/football/live/2018/jul/15/world-cup-2018-final-france-v-croatia-live
 *  - The Guardian, Daniel Taylor, France–Croatia match report, 15 July 2018 ("the length of time he spent analysing the replays";
 *    "Griezmann held his nerve to guide the penalty past Danijel Subasic ... after nearly four minutes of arguments")
 *    https://www.theguardian.com/football/2018/jul/15/france-croatia-world-cup-final-match-report
 *  - BBC Sport, "France beat Croatia 4-2 in World Cup final" ("a corner struck Perisic's hand at the near post"; "Griezmann slipped home
 *    the penalty"; Subašić "still looked less than fully fit after injuring a hamstring") https://www.bbc.co.uk/sport/football/44754965
 * CONFIRMED by those accounts: 15 July 2018, an 18:00 kick-off in Moscow in 27 °C, partly cloudy (daylight); the 38th minute, 1–1 until
 *  then; Pitana went to the pitchside monitor and studied it at length before giving the penalty for Perišić's handball; Subašić delayed
 *  the kick by not getting on his line; Griezmann (7) took it and ROLLED it LOW into the bottom LEFT-HAND corner, past Subašić (23);
 *  Griezmann is left-footed and 1.76 m; France all dark navy, Croatia red-and-white checks, white shorts, white socks; Luzhniki has no
 *  running track since the renovation, a big roofed bowl; France won 4–2 (world champions).
 * INFERRED (illustrative): that he struck it with his LEFT foot as a side-foot (he is left-footed; the reports do not name the foot — the
 *  narration never does); "left-hand corner" read from HIS side (so the keeper's right), and the ball's exact line (≈ .1–.2 m high,
 *  ≈ .8 m inside the post) and pace (≈ 11 m in .66 s — "rolls"); the run-up as drawn (a short calm jog in from his right with a little
 *  stutter/pause before the last steps — his well-known penalty rhythm, as the brief describes; not described in these reports); that
 *  Subašić went early to HIS LEFT, the wrong way (the brief: "sending Subašić the wrong way"; the reports only say "past" — the narration
 *  says "one way ... the other", never a side); where Subašić stood while delaying; the celebration as drawn (a run toward the near corner,
 *  teammates arriving — the reports do not describe it); the goalkeeper's yellow kit, Pitana's light-blue kit, the ball (a white ball with
 *  red graphics, the knockout-stage adidas Telstar Mechta — from general knowledge, not these sources), every hair colour and build except
 *  Griezmann's height, where the players stood, which end of the ground and which stand the Croatian fans were in, the camera placements,
 *  the Luzhniki bowl as drawn (one steep tier, mitred corners, a pale roof ring), the clouds and the roof shadow; Croatia's checks are
 *  printed as a plain red shirt on the small figures (the figure library has stripes and hoops but no checks) — the Croatian fans in the
 *  stands carry the red-and-white checks instead.
 *
 * FRAMING (the TV broadcast, never top-down; deliberately unlike the other penalty films): ch1 = LIVE, real time: the wide main-stand shot
 * of the sunny Luzhniki under a partly cloudy sky → a hard cut to Pitana bent over the pitchside VAR monitor at the halfway line → he
 * straightens and points: penalty → a cut to the high main-stand camera level with the box, looking straight across (the goal on the
 * right): Subašić still off his line, strolling back → Griezmann's calm run, the little pause, the side-foot roll into the corner → the
 * net → he runs off; ch2 = the slow-motion replay from the HIGH camera BEHIND THE GOAL (over the net): footprints mark the calm, even
 * run-up, a pause mark on the stutter, a dashed sight line to the keeper, a red arrow as Subašić moves first, a yellow trail as the ball
 * rolls the other way; ch3 = the reverse angle LOW ON THE GOAL LINE beside the post: the keeper dives away, the ball rolls in past the
 * lens-side post, then the celebration runs toward this camera and the teammates pile in; ch4 = the lesson from a low front three-quarter
 * then over his shoulder: keep your run-up calm (even footprints), watch the keeper (sight line), if he moves (red arrow) strike the other
 * side (a ring in the open corner) with confidence.
 * Composed on the FULL sheet (world units = sheet units centred on the canvas; never sheet.safe) and kept inside the central ~1000 units, so
 * it frames from the 1.45:1 card window down to square (a narrower window widens the lens a little). Figures: every body goes through ONE
 * adapter, drawPlayer() → athlete.ts (continuous silhouettes, FK skeleton, `prev` secondary motion, a motion smear on the run, the strike
 * and the celebration sprint); small figures in the wide shots and every figure inside a passage print at `low` detail. Handedness: the
 * world is right-handed (x toward the goal, y up, +z = Griezmann's right when he faces the goal, the main-stand side), exactly athlete.ts's
 * convention, so foot 'l' is his LEFT foot with no mirrored projector; the keeper faces −x, so HIS right is −z — the side the ball goes.
 * Inks: yellow, red, blue, navy (navy for France, red for Croatia, blue + yellow for the grass, blue for the sky). Everything is keyed to
 * cue times (withTiming swaps in the recorded word onsets), poses on twos, cameras on ones; all randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,polyPath,ribbon,partial,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines,laneArrow} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,runCadence,stand,keeperSet,keeperDive,celebrate,posed,blendPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES (≈2.7 words/s + punctuation pauses) until the Kokoro voice exists. LEAD: once
 * public/plays/narration/griezmann-penalty-2018/timing.json exists, add
 *   import timingJson from '../../../public/plays/narration/griezmann-penalty-2018/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues).
 * NB withTiming matches a cue by its FIRST word, in order — so no cue starts with a word that also appears between it and the previous cue. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The final, live',text:'Moscow, 2018: the World Cup final. The referee checks the video. Penalty to France! The keeper takes his time. Antoine Griezmann runs in, pauses... and rolls it in. Goal!',tail:2.2,
  cues:['Moscow','World Cup final','The referee','Penalty','The keeper','Antoine Griezmann','pauses','rolls it','Goal']},
 {label:'Watch it again',text:'Watch it again, slowly. A calm run-up, then a pause. He watches Subašić move first... and rolls it the other way.',tail:1.6,
  cues:['Watch it again','A calm','a pause','He watches','move first','the other way']},
 {label:'The wrong way',text:'From the goal line: the keeper dives one way, the ball goes the other! France go on to be world champions!',tail:2,
  cues:['From the goal line','keeper dives','the ball goes','France go','world champions']},
 {label:'The secret',text:'The secret? Keep your run-up calm. Watch the keeper. If he moves, strike the other side with confidence!',tail:2,
  cues:['The secret','Keep your run-up','Watch the keeper','If he moves','strike the other side','confidence']},
];
import timingJson from '../../../public/plays/narration/griezmann-penalty-2018/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , . ! ? : ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('griezmann: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('griezmann: no cue '+w);return c.at;};
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
/** Pitch: the goal line is x = 0 (the kick goes +x), the goal centre z = 0, +z = Griezmann's right (the main-stand side), halfway x = −52.5. */
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

// ---------------------------------------------------------------- the sky over Moscow: a summer-evening blue, fair-weather cumulus
/** clouds at "infinity" (fixed directions, so they never parallax): [azimuth°, elevation°, size] */
const CLOUDS:[number,number,number][]=[[8,9,1.3],[40,14,.9],[75,7,1.6],[118,12,1.1],[160,8,1.4],[205,15,1],[240,9,1.5],[282,13,1.2],[318,7,1.7],[350,17,.8]];
function sky(s:Sheet,c:Cam){
 s.field(B,.32,.5);
 const cl=new Path2D(),sh=new Path2D(),v=view(s);
 for(const[i,[az,el,sz]] of CLOUDS.entries()){const a=az*Math.PI/180,e=el*Math.PI/180,d:V3=[Math.cos(a)*Math.cos(e),Math.sin(e),Math.sin(a)*Math.cos(e)],P=add3(c.eye,[d[0]*1500,d[1]*1500,d[2]*1500]);
  const g=pr(c,P);if(!g)continue;const r=c.F*sz*60/1500;if(Math.abs(g[0])>v.hx+r*3||Math.abs(g[1])>v.hy+r*2)continue;
  // a cumulus: overlapping puffs on a flat base; the lower third a shade of navy
  for(let k=0;k<5;k++){const h=hash(i*13+k,4),px=g[0]+(k-2)*r*.62+(h-.5)*r*.2,py=g[1]-r*(.15+.35*Math.sin(Math.PI*(k+.5)/5))-h*r*.15,rr=r*(.45+.25*Math.sin(Math.PI*(k+.5)/5));cl.moveTo(px+rr,py);cl.arc(px,py,rr,0,TAU);}
  sh.rect(g[0]-r*1.55,g[1]-r*.12,r*3.1,r*.3);}
 s.knockout(cl,.92,'nonzero');s.tone(K,sh,.1);
}

// ---------------------------------------------------------------- the Luzhniki bowl: one steep tier close to the pitch (no track), a pale roof ring
/** stand planes (a along, b up the rake 0..1); the ends widen with the rake so the corners meet (a mitred bowl): 0 the far side (z<0),
 * 1 behind this goal (x>0), 2 the main stand (z>0, the camera side), 3 the far end */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-118-40*b,13+40*b,a),1.2+33*b,-43-40*b],
 (a,b)=>[12+40*b,1.2+33*b,lerp(-44-40*b,44+40*b,a)],
 (a,b)=>[lerp(13+40*b,-118-40*b,a),1.2+31*b,43+38*b],
 (a,b)=>[-117-40*b,1.2+33*b,lerp(44+40*b,-44-40*b,a)],
];
const STAND_COLS=[130,90,130,90],STAND_ROWS=15,ROOF_Y=46;
/** Croatian fans: a block of the far-side stand in red-and-white checks (stand, a0, a1) — inferred placement */
const CRO_BLOCK:[number,number,number]=[0,.56,.86];
/** flags: [stand, a, kind] kind 0 = the French tricolore (blue | paper | red, vertical), 1 = the Croatian flag (red / paper / blue, horizontal) */
const FLAGS:[number,number,number][]=[[0,.2,0],[0,.34,0],[0,.62,1],[0,.72,1],[0,.8,1],[1,.25,0],[1,.45,0],[1,.7,0],[2,.2,0],[2,.5,0],[3,.4,0],[3,.6,1]];
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number}={}){
 const{roar=0}=o,v=view(s),tt=twos(t);
 sky(s,c);
 const planes=new Path2D(),sun=new Path2D(),walk=new Path2D(),roof=new Path2D(),edge=new Path2D();
 for(const i of which){const S=STANDS[i],q=polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]);addPoly(planes,q);
  // the front wall under the first row, down to the grass
  addPoly(planes,polyP(c,[add3(S(0,0),[0,-1.25,0]),add3(S(1,0),[0,-1.25,0]),S(1,0),S(0,0)]));
  // the evening sun reaches the lower rows under the roof on the far side and the ends
  if(i!==2)addPoly(sun,polyP(c,[S(0,.02),S(1,.02),S(1,.3),S(0,.3)]));
  seg3(c,S(0,.5),S(1,.5),.5,walk);
  // the roof: a pale ring over the whole bowl, its inner lip a navy fascia with a yellow light line
  const L=(a:number):V3=>{const p=S(a,.18);return[p[0],ROOF_Y,p[2]];};
  addPoly(roof,polyP(c,[add3(S(0,1),[0,3,0]),add3(S(1,1),[0,3,0]),L(1),L(0)]));
  seg3(c,L(0),L(1),.9,edge);}
 s.knockout(planes);s.tone(K,planes,.42);s.tone(B,planes,.2);s.tone(Y,sun,.25);s.knockout(walk,.5);
 // the crowd: seeded dots — France in navy, blue, red and white; the Croatian block a chequerboard of red and white; roar lifts them
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(Math.abs(b-.5)<.04)continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,6);if(h<.24)continue;const a=(i+.5+(hash(i+j*31,9)-.5)*.5)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const cro=si===CRO_BLOCK[0]&&a>CRO_BLOCK[1]&&a<CRO_BLOCK[2],ink=cro?((i+j)&1?2:0):(h<.5?0:h<.72?1:h<.88?3:2);inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.72);s.fill(K,inks[1],.9);s.fill(R,inks[2],.95);s.fill(B,inks[3],.95);
 s.knockout(roof);s.tone(B,roof,.14);s.tone(K,roof,.1);s.fill(K,edge,.85);
 {const ln=new Path2D();for(const i of which){const S=STANDS[i],L=(a:number):V3=>{const p=S(a,.18);return[p[0],ROOF_Y-.9,p[2]];};seg3(c,L(0),L(1),.25,ln);}s.fill(Y,ln,.9);}
 // flags on the stand fronts
 const fl=new Path2D(),bl=new Path2D(),rd=new Path2D();
 for(const[si,a,kind] of FLAGS){if(!which.includes(si))continue;const S=STANDS[si],w=.035,P=(u:number,b:number)=>S(a+u*w,b);
  const q=polyP(c,[P(0,.005),P(1,.005),P(1,.09),P(0,.09)]);if(q.length<3)continue;fl.addPath(polyPath(q,true));
  if(kind===0){addPoly(bl,polyP(c,[P(0,.005),P(.33,.005),P(.33,.09),P(0,.09)]));addPoly(rd,polyP(c,[P(.67,.005),P(1,.005),P(1,.09),P(.67,.09)]));}
  else{addPoly(rd,polyP(c,[P(0,.062),P(1,.062),P(1,.09),P(0,.09)]));addPoly(bl,polyP(c,[P(0,.005),P(1,.005),P(1,.033),P(0,.033)]));}}
 s.knockout(fl);s.fill(B,bl,.95);s.fill(R,rd,.95);
}
// ---------------------------------------------------------------- grass, lines, boards, the VAR monitor, the goal
/** the review monitor on the far touchline at halfway (inferred side): its screen faces the pitch (+z), the main-stand cameras */
const MON:V3=[-52.5,0,-35.3];
function ground(s:Sheet,c:Cam,o:{bulge?:number;goal?:boolean;monitor?:boolean}={}){
 const g=polyP(c,[[-117,0,-43],[12,0,-43],[12,0,43],[-117,0,43]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.92);s.tone(B,gp,.78);s.tone(K,gp,.08);
 // mowing stripes across the width, every 5.25 m
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]));s.tone(K,st,.1);
 // the roof's evening shadow over the main-stand side of the pitch (the sun is behind the camera's stand, low in the west)
 const sh=polyP(c,[[-117,0,43],[12,0,43],[12,0,27],[-30,0,21],[-117,0,26]]);if(sh.length>2)s.tone(K,polyPath(sh,true),.2);
 // advertising boards behind the goal and along both touchlines: navy with red panels
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([5.5,0,-38],[5.5,0,38]);board([-110,0,-38.5],[5.5,0,-38.5]);board([-110,0,38.5],[5.5,0,38.5]);
 for(let k=0;k<11;k++){const z=-34+k*6.3;addPoly(pn,polyP(c,[[5.4,.25,z],[5.4,.25,z+3.4],[5.4,.7,z+3.4],[5.4,.7,z]]));}
 for(const zz of[-38.4,38.4])for(let k=0;k<17;k++){const x=-106+k*6.4;addPoly(pn,polyP(c,[[x,.25,zz],[x+3.4,.25,zz],[x+3.4,.7,zz],[x,.7,zz]]));}
 s.knockout(bd);s.fill(K,bd,.9);s.knockout(pn,.85);s.fill(R,pn,.8);
 // painted lines
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
 for(let k=0;k<8;k++){L([-k*13.125,0,-34],[-(k+1)*13.125,0,-34]);L([-k*13.125,0,34],[-(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){L([0,0,-34+k*17],[0,0,-34+(k+1)*17]);L([-52.5,0,-34+k*17],[-52.5,0,-34+(k+1)*17]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(-52.5,0,9.15);
 L([0,0,-20.16],[-16.5,0,-20.16]);L([-16.5,0,-20.16],[-16.5,0,20.16]);L([-16.5,0,20.16],[0,0,20.16]);
 L([0,0,-9.16],[-5.5,0,-9.16]);L([-5.5,0,-9.16],[-5.5,0,9.16]);L([-5.5,0,9.16],[0,0,9.16]);
 {const a=Math.acos(5.5/9.15);circ(-11,0,9.15,Math.PI-a,Math.PI+a,12);}
 circ(0,-34,1,Math.PI/2,Math.PI,4);circ(0,34,1,Math.PI,Math.PI*1.5,4);
 {const d:V3[]=[];for(let i=0;i<12;i++){const a=i/12*TAU;d.push([-11+Math.cos(a)*.15,0,Math.sin(a)*.15]);}addPoly(ln,polyP(c,d));}
 s.knockout(ln);
 if(o.monitor)monitor(s,c);
 if(o.goal!==false)goal3(s,c,o.bulge??0);
}
/** the pitchside review monitor at the halfway line (a screen on a post, a hood, a replay picture) */
function monitor(s:Sheet,c:Cam){
 if(toCam(c,MON)[2]<NEAR)return;const[x,,z]=MON;
 const body=new Path2D(),scr2=new Path2D(),pic=new Path2D();
 seg3(c,[x,0,z-.1],[x,1.05,z-.1],.09,body);addPoly(body,polyP(c,[[x-.34,0,z+.2],[x+.34,0,z+.2],[x+.34,0,z-.4],[x-.34,0,z-.4]]));
 addPoly(body,polyP(c,[[x-.5,1.02,z],[x+.5,1.02,z],[x+.5,1.72,z],[x-.5,1.72,z]]));
 addPoly(body,polyP(c,[[x-.54,1.72,z+.02],[x+.54,1.72,z+.02],[x+.54,1.78,z+.4],[x-.54,1.78,z+.4]]));
 addPoly(scr2,polyP(c,[[x-.44,1.08,z+.01],[x+.44,1.08,z+.01],[x+.44,1.66,z+.01],[x-.44,1.66,z+.01]]));
 addPoly(pic,polyP(c,[[x-.36,1.14,z+.02],[x+.1,1.14,z+.02],[x+.1,1.5,z+.02],[x-.36,1.5,z+.02]]));
 s.knockout(body);s.fill(K,body,.92);s.knockout(scr2);s.tone(B,scr2,.6);s.tone(Y,pic,.75);
}
/** the goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep with a sloping roof; bulge pushes the back out low, where the ball hits (z BZ) */
function goal3(s:Sheet,c:Cam,bulge:number){
 const X=0,z0=-3.66,z1=3.66,H=2.44,back=(z:number,y:number)=>X+2+bulge*.55*Math.exp(-Math.pow((z-BZ)/1.4,2))*(1-.6*y/1.9);
 const zs=[z0,-2.4,-1.2,0,1.2,2.4,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0,1.9),1.9,z0],[back(z0,0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1,1.9),1.9,z1],[back(z1,0),0,z1]],
  [[X,H,z0],[X,H,z1],...zs.slice().reverse().map(z=>[back(z,1.9),1.9,z] as V3)],
  [...zs.map(z=>[back(z,0),0,z] as V3),...zs.slice().reverse().map(z=>[back(z,1.9),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.3);s.tone(K,net,.1);
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
/** the placement: ROLLED low into HIS left-hand corner (−z, the keeper's right), ≈ .8 m inside the post */
const ZL=-2.85,BZ=ZL;
const flight=(d:number):V3=>{const u=d/DXG;return[B0[0]+d,.11+.07*Math.sin(Math.PI*u)*(1-u),B0[2]+ZL*u];};
const FLY=.66;// 11 m in ≈ .66 s: a calm, rolled side-foot
const dAt=(tau:number)=>{const u=clamp(tau/FLY);return DXG*u*(1.1-.1*u);};
const GOAL_PT=flight(DXG),NET_HIT:V3=[1.75,.2,ZL-.25],REST:V3=[1.3,.11,ZL-.15],IN_NET=FLY+.14;
function ballAt(tau:number):V3{
 if(tau<=0)return B0;
 if(tau<FLY)return flight(dAt(tau));
 if(tau<IN_NET)return mix3(GOAL_PT,NET_HIT,easeOut((tau-FLY)/(IN_NET-FLY)));
 const u=clamp((tau-IN_NET)/.45),h=NET_HIT[1]*(1-u)+.11*u;
 return[lerp(NET_HIT[0],REST[0],u),Math.max(.11,h),lerp(NET_HIT[2],REST[2],u)];
}
/** ball spin: a forward roll */
const spinAt=(tau:number)=>tau<=0?0:TAU*4.5*Math.min(tau,IN_NET)+TAU*1*Math.max(0,tau-IN_NET);
const bulgeAt=(tau:number)=>tau<IN_NET-.03?0:.6*Math.exp(-(tau-IN_NET+.03)*2.8)*(1+.3*Math.sin((tau-IN_NET)*12));

// ---------------------------------------------------------------- the cast: kits (athlete.ts styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.16]],SKIN_D:InkFill[]=[[R,.45],[K,.45],[Y,.18]];
/** France all dark navy (the kit box for the final), paper numbers; Croatia red (their checks — see INFERRED), white shorts and socks */
const fra=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:K,shorts:K,socks:K,boots:[Y,.9],skin:SKIN_L,hair:[K,.8],line:K,trim:'paper',numberInk:'paper',hairStyle:'short',...o});
const cro=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,shorts:'paper',socks:'paper',boots:K,skin:SKIN_L,hair:[K,.7],line:K,trim:'paper',numberInk:'paper',hairStyle:'short',...o});
const GZ_B={height:1.76,bulk:.94};
/** Griezmann: 7, 1.76 m, short light-brown hair (a light navy screen) */
const GZ_ST=fra({number:7,hair:[K,.5],build:GZ_B,seed:7});
/** Subašić: 23, a yellow goalkeeper kit (inferred), long sleeves, paper gloves */
const SUB_ST:AthleteStyle={shirt:[Y,.95],shorts:[Y,.95],socks:[Y,.95],boots:K,skin:SKIN_L,hair:[K,.85],line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',number:23,numberInk:K,build:{height:1.91,bulk:1},seed:23};
/** Pitana: a light-blue referee kit (inferred), dark shorts */
const REF_ST:AthleteStyle={shirt:[B,.55],shorts:[K,.9],socks:[K,.9],boots:K,skin:SKIN_L,hair:[K,.85],line:K,trim:K,hairStyle:'short',build:{height:1.93,bulk:1},seed:30};

// ---------------------------------------------------------------- Griezmann: the wait, a calm jog in from his right, the little pause, the left side-foot roll, the run off
/** approach from his RIGHT (≈ 19°): a left-footer comes in from the right and side-foots across to his left */
const DIRN=Math.hypot(1,.35),DIR:[number,number]=[1/DIRN,-.35/DIRN];
const YAW_P=yawTo(0,0,DIR[0],DIR[1]);
/** the run: jog from the mark (T_RUN0), the stutter/pause (T_ST0..T_ST1), two quick steps, the strike (from RUN_END), contact at 0 */
const SD=1.0,RUN_END=-STRIKE_CONTACT*SD,T_RUN0=-2.45,T_ST0=-1.2,T_ST1=-.72,G_MARK=-4.4,G_ST0=-1.95,G_ST1=-1.7,G_END=-1.1,G_BALL=-.35;
const PWR=.5;// a calm placement: a short backswing, a checked follow-through
/** the LEFT side-foot: kicking thigh rotated out so the inside of the boot faces the target, ankle locked */
function sideFoot(u:number):Pose{const p=strike(u,{foot:'l',power:PWR}),w=sm(.3,STRIKE_CONTACT,u)*(1-sm(.72,.95,u));p.lHipR+=.72*w;p.lAnk-=.5*w;p.yaw+=.12*w;return p;}
/** where his pelvis stands at contact so the inside of his LEFT boot meets the back of the ball (solved once, FK) */
const PC:[number,number]=(()=>{const sk=solve(sideFoot(STRIKE_CONTACT),GZ_B,{x:0,z:0,yaw:YAW_P}),mid:[number,number]=[(sk.lToe[0]+sk.lHeel[0])/2,(sk.lToe[2]+sk.lHeel[2])/2],tgt:[number,number]=[B0[0]-DIR[0]*.14,B0[2]-DIR[1]*.14];return[tgt[0]-mid[0],tgt[1]-mid[1]];})();
const gPos=(g:number):[number,number]=>[PC[0]+DIR[0]*g,PC[1]+DIR[1]*g];
const P_PLACE=posed({lHipF:70,rHipF:40,lKnee:100,rKnee:60,lean:40,pitch:12,neckP:30,lShF:62,rShF:66,lElb:18,rElb:20,lShA:14,rShA:12,lHand:.8,rHand:.8});
/** at his mark: upright, arms loose, eyes on the keeper — unhurried */
const P_WAIT=posed({lHipF:6,rHipF:2,lKnee:12,rKnee:8,lAnk:-2,rAnk:0,lean:5,pitch:1,neckP:-2,lShA:12,rShA:14,lShF:4,rShF:-4,lElb:22,rElb:26});
/** the little pause: weight on the right foot, the left lifted and held, chest up, head up at the keeper */
const P_STUT=posed({rHipF:12,rKnee:30,rAnk:-4,lHipF:30,lKnee:66,lAnk:26,lean:3,pitch:0,neckP:-6,lShA:36,rShA:30,lShF:12,rShF:-14,lElb:46,rElb:52,twist:4,squash:-.03});
const walkPose=(ph:number)=>{const p=blendPose(runCycle(ph,{speed:0,stride:.55}),P_WAIT,.2);p.air=0;return p;};
/** after the kick: watch it go in, turn, run toward the near corner (the goal-line camera side), arms up */
const T_TURN=.8,T_CEL=2.9,CEL:[number,number]=[-6.2,-11.2];
const CEL_YAW=yawTo(CEL[0],CEL[1],-3,-22);
const gRun=(tau:number)=>key(tau,[[T_RUN0,G_MARK],[T_ST0,G_ST0],[T_ST1,G_ST1],[RUN_END,G_END],[0,0]],linear);
/** the run phase: normal cadence, nearly frozen through the pause */
const runPh=(tau:number)=>{const a=clamp(tau,T_RUN0,T_ST0)-T_RUN0,b=clamp(tau,T_ST0,T_ST1)-T_ST0,c=Math.max(0,tau-T_ST1);return(a+.25*b)*runCadence(.3)+c*runCadence(.6);};
const celU=(tau:number)=>sm(T_TURN+.2,T_CEL,tau,linear);
function gzPose(tau:number,walk=1,it=0):Pose{
 if(tau<=T_RUN0){
  if(walk<=0)return stand();
  if(walk<1){const u=walk;if(u<.12)return blendPose(P_PLACE,stand(),sm(0,.12,u));
   const d=Math.abs(G_MARK-G_BALL)*sm(.12,.82,u,linear);let p=walkPose(d*.72);if(u>.82)p=blendPose(p,P_WAIT,sm(.82,1,u));return p;}
  const br=.5+.5*Math.sin(it*2.1),p=blendPose(P_WAIT,runCycle(0,{speed:.3}),sm(T_RUN0-.3,T_RUN0,tau));p.lean+=.02*br;p.neckP+=.03*br;return p;}
 let p:Pose;
 if(tau<RUN_END){const run=runCycle(runPh(tau),{speed:.35});p=blendPose(P_WAIT,run,sm(T_RUN0,T_RUN0+.3,tau));
  const stut=sm(T_ST0-.12,T_ST0+.12,tau)*(1-sm(T_ST1-.1,T_ST1+.1,tau));p=blendPose(p,P_STUT,stut);return p;}
 const us=STRIKE_CONTACT+tau/SD,run=runCycle(runPh(tau),{speed:.45});
 p=blendPose(run,sideFoot(Math.min(1,us)),sm(RUN_END,RUN_END+.14,tau));
 if(tau>.55)p=blendPose(p,stand(),sm(.55,.8,tau));
 // the celebration: a sprint that eases in, then both arms up
 if(tau>T_TURN){const u=celU(tau),ph=(tau-T_TURN)*runCadence(.85);p=blendPose(p,runCycle(ph,{speed:.9-.4*u}),sm(T_TURN,T_TURN+.25,tau));
  p=blendPose(p,celebrate((tau-T_CEL)*.9,{kind:'arms'}),sm(T_CEL-.3,T_CEL+.2,tau));}
 return p;
}
function gzPlace(tau:number,walk=1):Place{
 if(tau<=T_RUN0){
  if(walk<=0){const[x,z]=gPos(G_BALL-.9);return{x,z,yaw:YAW_P};}
  if(walk<1){const u=walk,g=lerp(G_BALL,G_MARK,sm(.12,.82,u,linear)),[x,z]=gPos(g);
   return{x,z,yaw:u<.12?YAW_P:lerpAng(lerpAng(YAW_P,YAW_P+Math.PI,sm(.08,.2,u)),YAW_P+TAU,sm(.8,1,u))};}
  const[x,z]=gPos(G_MARK);return{x,z,yaw:YAW_P};}
 let g:number;
 if(tau<0)g=gRun(tau);
 else g=.5*(1-Math.pow(1-clamp(tau/.6),2));
 let[x,z]=gPos(g);
 const[x0,z0]=gPos(.5);
 if(tau>T_TURN){const u=celU(tau),e=u*(2-u);x=lerp(x0,CEL[0],e);z=lerp(z0,CEL[1],e);}
 const runYaw=yawTo(x0,z0,CEL[0],CEL[1]);
 return{x,z,yaw:lerpAng(lerpAng(YAW_P,runYaw,sm(T_TURN,T_TURN+.35,tau,easeInOutSine)),CEL_YAW,sm(T_CEL-.4,T_CEL+.2,tau,easeInOutSine))};
}

// ---------------------------------------------------------------- Subašić: off his line (taking his time), set, a lean to his left, the dive the wrong way
const SUB_X=-.15,SUB_OFF:[number,number]=[-3.3,2.1];
/** dive start (he moves first, before the contact) and its length */
const KD0=-.3,KDUR=1.05;
function subAt(tau:number,it:number,kw=1):{pose:Pose;place:Place}{
 if(kw<1){const u=sm(.1,.85,kw,linear),x=lerp(SUB_OFF[0],SUB_X,u),z=lerp(SUB_OFF[1],0,u),walking=u>0&&u<1;
  let p=walking?walkPose(u*3.2):blendPose(stand(),posed({lShA:30,rShA:30,lShF:-10,rShF:-10,lElb:96,rElb:96,lShR:30,rShR:30,neckP:10}),.8);
  if(u>=1)p=blendPose(p,keeperSet(it*1.2),sm(.85,1,kw));
  const yaw=lerpAng(u>=1?Math.PI:yawTo(SUB_OFF[0],SUB_OFF[1],SUB_X,0),Math.PI,sm(.8,1,kw));
  return{pose:p,place:{x,z,yaw}};}
 let p=keeperSet(it*1.2);
 // the shift: weight leaning toward his LEFT (+z) during the pause — the tell
 const lean=sm(-1.05,-.55,tau)*(1-sm(KD0-.02,KD0+.1,tau));
 if(lean>0)p=blendPose(p,keeperDive(.14,{side:'l',height:.35}),lean*.8);
 if(tau>KD0)p=blendPose(p,keeperDive(clamp((tau-KD0)/KDUR),{side:'l',height:.35}),sm(KD0,KD0+.08,tau));
 return{pose:p,place:{x:SUB_X,z:0,yaw:Math.PI}};
}

// ---------------------------------------------------------------- everyone else
type Role='ref'|'fra'|'cro';
/** runTo: a teammate who sprints to Griezmann in the celebration [start τ, arrival offset from CEL] */
type Actor={name:string;role:Role;st:AthleteStyle;x:number;z:number;phase:number;runTo?:[number,number,number]};
/** outside the box and the D while the kick is taken; Pitana at the edge of the box on the main-stand side */
const REF_BOX:[number,number]=[-15.2,10.6];
const ACTORS:Actor[]=[
 {name:'Pitana',role:'ref',st:REF_ST,x:REF_BOX[0],z:REF_BOX[1],phase:.6},
 {name:'Mbappé',role:'fra',st:fra({number:10,skin:SKIN_D,hair:K,build:{height:1.78,bulk:.95},seed:10,detail:'low'}),x:-17.6,z:6.8,phase:.1,runTo:[1.1,-1,.9]},
 {name:'Pogba',role:'fra',st:fra({number:6,skin:SKIN_D,hair:[Y,.8],build:{height:1.91,bulk:1.02},seed:6,detail:'low'}),x:-20.4,z:-2.6,phase:.4,runTo:[1.4,1.1,.4]},
 {name:'Matuidi',role:'fra',st:fra({number:14,skin:SKIN_D,hair:K,hairStyle:'bald',build:{height:1.8},seed:14,detail:'low'}),x:-17.8,z:-9.6,phase:.7,runTo:[.9,-.4,-1.2]},
 {name:'Giroud',role:'fra',st:fra({number:9,hair:K,build:{height:1.93,bulk:1.04},seed:9,detail:'low'}),x:-21.2,z:2.4,phase:.25,runTo:[1.6,.3,1.5]},
 {name:'Kanté',role:'fra',st:fra({number:13,skin:SKIN_D,hair:K,build:{height:1.68,bulk:.95},seed:13,detail:'low'}),x:-26,z:-1.4,phase:.85},
 {name:'Modrić',role:'cro',st:cro({number:10,hairStyle:'long',hair:[Y,.8],build:{height:1.72,bulk:.92},seed:40,detail:'low'}),x:-20.6,z:-.8,phase:.3},
 {name:'Rakitić',role:'cro',st:cro({number:7,hair:[Y,.6],build:{height:1.84},seed:41,detail:'low'}),x:-18.4,z:3.6,phase:.9},
 {name:'Perišić',role:'cro',st:cro({number:4,hair:[K,.6],build:{height:1.86},seed:42,detail:'low'}),x:-17.8,z:-5.8,phase:.15},
 {name:'Mandžukić',role:'cro',st:cro({number:17,hair:[K,.8],hairStyle:'long',build:{height:1.9,bulk:1.02},seed:43,detail:'low'}),x:-21.4,z:5.2,phase:.65},
 {name:'Lovren',role:'cro',st:cro({number:6,hair:K,build:{height:1.88},seed:44,detail:'low'}),x:-17.6,z:10.2,phase:.45},
 {name:'Vida',role:'cro',st:cro({number:21,hair:[K,.7],build:{height:1.84},seed:45,detail:'low'}),x:-19.2,z:-8,phase:.55},
 {name:'Brozović',role:'cro',st:cro({number:11,hair:[K,.7],build:{height:1.81},seed:46,detail:'low'}),x:-23,z:1,phase:.35},
];
const SLUMP=posed({lHipF:30,rHipF:30,lKnee:36,rKnee:36,lean:34,pitch:6,neckP:30,lShA:14,rShA:14,lShF:24,rShF:24,lElb:20,rElb:20});
/** the referee at the monitor: bent to the screen, hands on hips; then upright, the arm out toward the goal */
const P_STUDY=posed({lHipF:14,rHipF:14,lKnee:14,rKnee:14,lean:26,pitch:6,neckP:20,lShA:34,rShA:34,lShF:-14,rShF:-14,lElb:100,rElb:100,lShR:30,rShR:30});
const P_POINT=posed({rShF:62,rShA:24,rElb:4,rHand:1,lShA:18,lShF:-8,lElb:20,lean:6,neckP:8,lHipF:10,rHipF:-4});
type Env={it:number;walk?:number;kw?:number;mon?:number;point?:number;smear?:boolean;minBall?:number;lines?:boolean;prevT?:number;hero?:'high'|'mid';crowd?:boolean};
/** one actor's pose + place at τ (it = idle clock) */
function actorAt(a:Actor,tau:number,it:number,e:Env):{pose:Pose;place:Place}{
 const toBall=yawTo(a.x,a.z,B0[0],B0[2]),br=Math.sin(it*2.1+a.phase*TAU),goal=sm(IN_NET-.1,IN_NET+.3,tau);
 if(a.role==='ref'){
  if((e.mon??0)>.5){const at:[number,number]=[MON[0],MON[2]+.8],pt=e.point??0;const p=blendPose(P_STUDY,P_POINT,pt);
   return{pose:p,place:{x:at[0],z:at[1],yaw:lerpAng(yawTo(at[0],at[1],MON[0],MON[2]),yawTo(at[0],at[1],-11,0),pt)}};}
  let p=stand();if(goal>0)p=blendPose(p,posed({rShF:20,rShA:18,lShA:18,lElb:20,rElb:20,neckP:0}),goal);
  return{pose:p,place:{x:a.x,z:a.z,yaw:yawTo(a.x,a.z,-9.6,-.5)}};}
 if(a.role==='cro'){let p=blendPose(stand(),SLUMP,.12+.05*br);if(goal>0)p=blendPose(p,SLUMP,goal*.85);return{pose:p,place:{x:a.x,z:a.z,yaw:toBall}};}
 // France: up on their toes, then jumping, then (four of them) sprinting to him
 let p=blendPose(stand(),posed({lHipF:20,rHipF:20,lKnee:30,rKnee:30,lean:14,lShA:20,rShA:20,lElb:40,rElb:40}),.4+.1*br);
 if(goal>0)p=blendPose(p,celebrate(it*.9+a.phase,{kind:'arms'}),goal);
 if(a.runTo){const[t0,ox,oz]=a.runTo,dest:[number,number]=[CEL[0]+ox,CEL[1]+oz],L=Math.hypot(dest[0]-a.x,dest[1]-a.z),T=L/6.4,u=clamp((tau-t0)/T);
  if(tau>t0){const ph=(tau-t0)*runCadence(1);p=blendPose(p,runCycle(ph+a.phase,{speed:1-.5*u}),sm(t0,t0+.2,tau));
   if(u>=1)p=blendPose(p,celebrate(it*.9+a.phase,{kind:'arms'}),sm(t0+T,t0+T+.3,tau));
   const e2=u*(2-u),x=lerp(a.x,dest[0],e2),z=lerp(a.z,dest[1],e2);
   return{pose:p,place:{x,z,yaw:u<1?yawTo(a.x,a.z,dest[0],dest[1]):yawTo(x,z,CEL[0],CEL[1])}};}}
 return{pose:p,place:{x:a.x,z:a.z,yaw:toBall}};
}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the pose one drawn frame earlier (secondary
 * motion: hems trail), smear = halftone echo + speed lines on fast limbs (the run, the strike, the celebration sprint). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:{pose:Pose;place:Place},smear=false){
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
}

// ---------------------------------------------------------------- the ball (white with red graphics → red panels)
function drawBall(s:Sheet,c:Cam,tau:number,o:{min?:number;lines?:boolean;prev?:number}={}){
 const P=ballAt(tau),q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??18,c.F*.11/q[2]);
 const sh:Pt[]=[];const rad=.16+P[1]*.05;for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*1.3,0,P[2]+Math.sin(a)*rad]);if(p)sh.push(p);}
 if(sh.length>8)s.tone(K,polyPath(sh,true),clamp(.5-P[1]*.15,.1,.5));
 if(o.lines&&o.prev!==undefined&&tau>0&&tau<IN_NET){const a=pr(c,ballAt(o.prev));if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.8)speedLines(s,K,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:3,seed:7,len:Math.min(200,d*1.2),spread:r*.8,width:Math.max(2.5,r*.16),cov:.75});}}
 footballPanels(s,g[0],g[1],r,{rot:spinAt(tau),key:R,shadow:B,seed:5});
 return{g,r,d:q[2]};
}
/** the rolled path from τa to τb as projected points */
function pathPts(c:Cam,ta:number,tb:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<=n;i++){const p=pr(c,ballAt(lerp(ta,tb,i/n)));if(p)out.push(p);}return out;}

// ---------------------------------------------------------------- one frame of the world through a camera
/** everything on the pitch, depth-sorted (far first): the players at τp (poses on twos), their previous drawn pose, the ball at τ.
 * Heat: small figures print at `low` detail; inside a passage every figure is capped (the outgoing scene is zoomed past the camera). */
function play(s:Sheet,c:Cam,tau:number,tp:number,tpPrev:number,e:Env){
 const v=view(s),items:{d:number;draw:()=>void}[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending;
 const visible=(pl:Place,h=1.8)=>{const q=toCam(c,[pl.x??0,.9,pl.z??0]);if(q[2]<1)return -1;const g=scr(c,q),k=c.F/q[2]*h;return Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k?-1:q[2];};
 const detailFor=(st:AthleteStyle,d:number,hero:boolean):AthleteStyle=>{const px=c.F*1.8/d*ppu;if(passing)return{...st,detail:hero?'mid':'low'};if(px<120)return{...st,detail:'low'};if(!hero)return{...st,detail:px>200?'mid':'low'};if(e.hero==='mid'&&px>170)return{...st,detail:'mid'};return{...st,detail:'auto'};};
 const walk=e.walk??1,kw=e.kw??1;
 {const pl=gzPlace(tp,walk),d=visible(pl);if(d>0)items.push({d,draw:()=>{const pose=gzPose(tp,walk,e.it),prev={pose:gzPose(tpPrev,walk,e.it-1/12),place:gzPlace(tpPrev,walk)};
  drawPlayer(s,pose,c,detailFor(GZ_ST,d,true),pl,prev,!!e.smear&&((tp>T_ST1&&tp<.4)||(tp>T_TURN+.1&&tp<T_CEL-.2)));}});}
 {const cur=subAt(tp,e.it,kw),d=visible(cur.place);if(d>0)items.push({d,draw:()=>{const prev=subAt(tpPrev,e.it-1/12,kw);drawPlayer(s,cur.pose,c,detailFor(SUB_ST,d,true),cur.place,prev,!!e.smear&&tp>KD0&&tp<KD0+.7);}});}
 for(const a of ACTORS){if(e.crowd===false&&a.role!=='ref'&&!a.runTo)continue;const cur=actorAt(a,tp,e.it,e),d=visible(cur.place);if(d<0)continue;
  items.push({d,draw:()=>{const prev=actorAt(a,tpPrev,e.it-1/12,e);drawPlayer(s,cur.pose,c,detailFor(a.st,d,a.role==='ref'&&(e.mon??0)>.5),cur.place,prev,!!e.smear&&!!a.runTo&&tp>a.runTo[0]);}});}
 const bq=toCam(c,ballAt(tau));if(bq[2]>=NEAR)items.push({d:bq[2],draw:()=>{drawBall(s,c,tau,{min:e.minBall,lines:e.lines,prev:e.prevT});}});
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
}

// ---------------------------------------------------------------- teaching marks (yellow = do this, red = the keeper's tell)
/** the run-up footprints: evenly spaced marks along the run, each printed as he passes it (calm = even) */
function footprints(s:Sheet,c:Cam,tau:number,cov:number){
 if(cov<.02)return;const fp=new Path2D();
 for(let k=0;k<6;k++){const g=lerp(G_MARK+.35,G_END+.1,k/5),tk=key(g,[[G_MARK,T_RUN0],[G_ST0,T_ST0],[G_ST1,T_ST1],[G_END,RUN_END]],linear);if(tau<tk-.05)continue;
  const[x,z]=gPos(g),side=(k%2?.16:-.16),cx=x-DIR[1]*side,cz=z+DIR[0]*side,pts:Pt[]=[];
  for(let i=0;i<10;i++){const a=i/10*TAU,p=pr(c,[cx+Math.cos(a)*.17*DIR[0]-Math.sin(a)*.08*DIR[1],0,cz+Math.cos(a)*.17*DIR[1]+Math.sin(a)*.08*DIR[0]]);if(p)pts.push(p);}
  if(pts.length>6)fp.addPath(polyPath(pts,true));}
 s.knockout(fp,.8*cov);s.fill(Y,fp,.95*cov);s.stroke(K,fp,1.6,.6*cov);
}
/** a dashed yellow sight line from his eyes to the keeper's face */
function sightLine(s:Sheet,c:Cam,tp:number,it:number,u:number,walk=1){
 if(u<.02)return;const sk=solve(gzPose(tp,walk,it),GZ_B,gzPlace(tp,walk)),kk=subAt(tp,it),ks=solve(kk.pose,SUB_ST.build,kk.place),a=pr(c,sk.face),b=pr(c,ks.face);
 if(!a||!b)return;const rb=new Path2D(),n=10,w=Math.max(7,kAt(c,sk.face)*.035),u1=clamp(u);
 for(let i=0;i<n;i++){const u0=i/n*u1,ue=(i+.62)/n*u1,p0:Pt=[lerp(a[0],b[0],u0),lerp(a[1],b[1],u0)],p1:Pt=[lerp(a[0],b[0],ue),lerp(a[1],b[1],ue)];rb.addPath(ribbon([p0,p1],w,{seed:13+i,taper:.2,wobble:0}));}
 s.knockout(rb,.95);s.fill(Y,rb,.95);s.stroke(K,rb,1.8,.8);
}
/** the keeper's tell: a red arrow on the grass from his feet toward his left (+z) */
function tellArrow(s:Sheet,c:Cam,u:number){
 if(u<.02)return;const a=pr(c,[SUB_X-.6,0,.2]),b=pr(c,[SUB_X-.6,0,2.6]);if(!a||!b)return;
 const w=Math.max(8,kAt(c,[SUB_X,0,1.2])*.12);laneArrow(s,R,a,b,w,{seed:23,cov:.95,progress:clamp(u)});
}
/** a pause mark ‖ above his head during the stutter */
function pauseMark(s:Sheet,c:Cam,tp:number,u:number){
 if(u<.02)return;const pl=gzPlace(tp),q=pr(c,[pl.x??0,2.35,pl.z??0]);if(!q)return;const h=Math.max(16,kAt(c,[pl.x??0,2.35,pl.z??0])*.32)*clamp(u,0,1.1),w=h*.32;
 const p=new Path2D();p.addPath(ribbon([[q[0]-w*.9,q[1]-h/2],[q[0]-w*.9,q[1]+h/2]],w,{seed:3,taper:0,wobble:.5}));p.addPath(ribbon([[q[0]+w*.9,q[1]-h/2],[q[0]+w*.9,q[1]+h/2]],w,{seed:4,taper:0,wobble:.5}));
 s.knockout(p,.9*Math.min(1,u));s.fill(Y,p,.95*Math.min(1,u));s.stroke(K,p,1.8,.7*Math.min(1,u));
}
/** a ring on the goal mouth at the open spot (x just in front of the line) */
function spotRing(s:Sheet,c:Cam,at:V3,rad:number,cov:number,ink=Y,wm=.09){
 const ring:Pt[]=[];for(let i=0;i<32;i++){const a=i/32*TAU,p=pr(c,[at[0],at[1]+Math.sin(a)*rad,at[2]+Math.cos(a)*rad]);if(p)ring.push(p);}
 if(ring.length<20)return;const rr=ribbon(ring,Math.max(5,kAt(c,at)*wm),{close:true,seed:11,taper:0,wobble:1});s.knockout(rr,.85*cov);s.fill(ink,rr,.95*cov);
}
const SPOT:V3=[.02,.42,ZL];
/** the rolled line so far, fading at the tail */
function trail(s:Sheet,c:Cam,tau:number,fromTau:number,cov:number){
 if(cov<.02||tau<=.02)return;const pts=pathPts(c,fromTau,Math.min(tau,FLY+.001),20);if(pts.length<3)return;
 const w=Math.max(8,kAt(c,ballAt(Math.min(tau,FLY)))*.16);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45*cov);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*cov);
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
const pxz=(tau:number,walk=1):V3=>{const p=gzPlace(tau,walk);return[p.x??0,0,p.z??0];};
const REF_MON:V3=[MON[0],1.2,MON[2]+.4];

// ---------------------------------------------------------------- 1 · live: the wide shot, a cut to the monitor, a cut to the box camera, real time
/** contact between "Antoine Griezmann" + the run and "rolls it" (+ the roll) — never before the run has had time */
const tS1=()=>Math.max((CUE(0,'rolls it')+.2+CUE(0,'Antoine')-T_RUN0)/2,CUE(0,'Antoine')-T_RUN0-.25);
const tau1=(t:number)=>Math.max(T_RUN0-8,t-tS1());
/** the cut from the monitor to the box */
const tCut=()=>CUE(0,'The keeper')-.3;
/** placing the ball and the walk back to his mark: from the cut until before the run */
const walk1=(t:number)=>{const a=tCut()-.4,b=Math.max(a+1,Math.min(a+2.6,tS1()+T_RUN0-.5));return t<a?0:Math.max(1e-3,sm(a,b,t,linear));};
/** Subašić taking his time: strolling back to his line from the cut to just before the run */
const kw1=(t:number)=>sm(tCut()-.2,Math.max(tCut()+1.2,tS1()+T_RUN0-.35),t,linear);
/** P_K: the lower-tier main-stand camera level with the penalty spot (the run, the kick, the goal) */
const P_K:V3=[-6.6,9.5,30],P_BOX:V3=[-12,14.5,54],P_WIDE:V3=[-24,25,66],P_MON:V3=[-37,16,66];
function cam1(t:number):Cam{
 const tau=tau1(t),tN=tS1()+IN_NET;
 return plan(t,[
  [0,0,()=>({P:P_WIDE,T:[-38,9,-14],fov:50})],
  [CUE(0,'World Cup')-.2,1.6,()=>({P:P_WIDE,T:[-30,3,-6],fov:34})],
  [CUE(0,'The referee')-.25,.01,()=>({P:P_MON,T:REF_MON,fov:2.6})],
  [CUE(0,'Penalty')-.1,.9,()=>({P:P_MON,T:add3(REF_MON,[.7,0,.3]),fov:3.6})],
  [tCut(),.01,()=>({P:P_BOX,T:[SUB_OFF[0]+.3,1,SUB_OFF[1]],fov:5.2})],
  [tCut()+.1,Math.max(.5,tS1()+T_RUN0-.8-tCut()),()=>({P:P_BOX,T:[-1.6,1.1,.4],fov:5.2})],
  [CUE(0,'Antoine')-.4,.01,()=>({P:P_K,T:[-7.2,.9,.2],fov:27})],
  [tN-.3,.8,()=>({P:P_K,T:[-4.6,.9,-1.2],fov:27})],
  [tN+.7,1.4,()=>({P:P_K,T:add3(pxz(tau),[0,1,0]),fov:26})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tau=tau1(t),tt=twos(t),tp=tau1(tt),tpp=tau1(tt-1/12),tN=tS1()+IN_NET,mon=t<tCut()?1:0;
  const tP=CUE(0,'Penalty'),point=mon?sm(tP-.15,tP+.35,tt,easeOutBack):0;
  stadium(s,c,t,[0,1,3],{roar:sm(tN-.1,tN+.4,t)+.3*point});
  ground(s,c,{bulge:bulgeAt(tau),monitor:true});
  play(s,c,tau,tp,tpp,{it:tt,walk:walk1(tt),kw:kw1(tt),mon,point,minBall:12,lines:true,prevT:tau1(t-.06),hero:'mid'});
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:14,
};

// ---------------------------------------------------------------- 2 · the slow-motion replay from HIGH BEHIND THE GOAL: calm steps, the pause, the tell, the other way
const tau2=(t:number)=>key(t,mono([[0,T_RUN0-.3],[CUE(1,'A calm'),T_RUN0+.05],[CUE(1,'a pause'),T_ST0+.05],[CUE(1,'He watches'),T_ST0+.3],[CUE(1,'move first'),KD0+.05],[CUE(1,'the other way'),.08],[SECS(1),IN_NET+.7]]),linear);
const P2:V3=[6.2,5.3,1.6];
function cam2(t:number):Cam{
 return plan(t,[
  [0,0,()=>({P:P2,T:[-10.2,.9,.9],fov:13})],
  [CUE(1,'He watches')-.3,1,()=>({P:P2,T:[-5.6,.7,.4],fov:28})],
  [CUE(1,'move first')-.2,.9,()=>({P:P2,T:[-3.4,.5,.3],fov:30})],
  [CUE(1,'the other way')-.1,1.1,()=>({P:add3(P2,[0,0,-1]),T:[-2.2,.3,-1.2],fov:30})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tau=tau2(t),tt=twos(t),tp=tau2(tt),tpp=tau2(tt-1/12);
  const tA=CUE(1,'A calm'),tPz=CUE(1,'a pause'),tW=CUE(1,'He watches'),tM=CUE(1,'move first'),tO=CUE(1,'the other way');
  stadium(s,c,t,[0,2,3],{roar:sm(IN_NET,IN_NET+.4,tau)});
  ground(s,c,{goal:false});
  footprints(s,c,tau,sm(tA-.1,tA+.3,t)*(1-sm(tO+.4,tO+1,t)));
  tellArrow(s,c,sm(tM-.05,tM+.45,t)*(1-sm(SECS(1)-1,SECS(1)-.6,t)));
  trail(s,c,tau,Math.max(0,tau-.6),1-sm(FLY+.2,IN_NET+.7,tau));
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:12,crowd:false});
  // behind the goal: the net is nearer than the play
  goal3(s,c,bulgeAt(tau));
  pauseMark(s,c,tp,sm(tPz-.05,tPz+.3,t,easeOutBack)*(1-sm(tW+.6,tW+1,t)));
  sightLine(s,c,tp,tt,sm(tW-.1,tW+.45,t,easeOutBack)*(1-sm(tM+.3,tM+.7,t)));
 },
 aperture(t){const c=cam2(t),P=ballAt(tau2(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:4.6,
};

// ---------------------------------------------------------------- 3 · the reverse angle LOW ON THE GOAL LINE: the keeper one way, the ball the other; the celebration comes to us
const tau3=(t:number)=>key(t,mono([[0,-.9],[CUE(2,'keeper dives'),KD0+.25],[CUE(2,'the ball goes'),FLY-.05],[CUE(2,'France go'),T_TURN+.9],[SECS(2),T_CEL+Math.max(1,SECS(2)-CUE(2,'France go')-1.2)]]),linear);
const P3:V3=[-6.8,1.2,-14.6];
const CELV:V3=[CEL[0],1.2,CEL[1]];
function cam3v(t:number):Cam{
 const tau=tau3(t);
 return plan(t,[
  [0,0,()=>({P:P3,T:[-5.4,.8,.2],fov:34})],
  [CUE(2,'keeper dives')-.2,.8,()=>({P:P3,T:[-.8,.8,.2],fov:22})],
  [CUE(2,'the ball goes')-.2,.8,()=>({P:P3,T:[-.4,.6,-.9],fov:22})],
  [CUE(2,'France go')-.4,1.3,()=>({P:[-2.2,1.5,-23],T:add3(pxz(tau),[0,1,0]),fov:32})],
  [CUE(2,'world champions')-.3,1.2,()=>({P:[-2.4,1.7,-24.5],T:add3(CELV,[.3,-.1,0]),fov:30})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tau=tau3(t),tt=twos(t),tp=tau3(tt),tpp=tau3(tt-1/12),tW=CUE(2,'world champions'),tF=CUE(2,'France go');
  stadium(s,c,t,[1,2,3],{roar:.3+.7*sm(IN_NET,IN_NET+.4,tau)});
  ground(s,c,{bulge:bulgeAt(tau)});
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:10});
  const gl=sm(tF-.05,tF+.4,t);if(gl>0){const q=pr(c,[CEL[0],1.35,CEL[1]]);if(q)sparkBurst(s,Y,q[0],q[1],90+130*gl,{n:12,seed:7,g:easeOutBack(gl),width:12,cov:.9*(1-sm(tW+.8,tW+1.6,t))});}
  const wn=sm(tW-.05,tW+.4,t);if(wn>0){const q=pr(c,[CEL[0]+.6,2.7,CEL[1]]);if(q){sparkBurst(s,R,q[0],q[1],170+120*wn,{n:9,seed:21,g:easeOutBack(wn),width:10});sparkBurst(s,B,q[0],q[1],120+90*wn,{n:7,seed:22,g:easeOutBack(wn),width:9});}}
 },
 aperture(t){const c=cam3v(t),q=pr(c,CELV)??[0,0];return apertureDisc(q[0],q[1],90,12);},
 still:6,
};

// ---------------------------------------------------------------- 4 · the lesson: calm run-up → watch the keeper → if he moves → strike the other side with confidence
const tau4=(t:number)=>key(t,mono([[0,T_RUN0-.6],[CUE(3,'Keep your run-up'),T_RUN0],[CUE(3,'Watch the keeper'),T_ST0+.1],[CUE(3,'If he moves'),KD0-.05],[CUE(3,'strike the other side'),-.05],[CUE(3,'confidence'),FLY],[SECS(3),IN_NET+.8]]),linear);
function cam4v(t:number):Cam{
 const pm=pxz(T_RUN0);
 return plan(t,[
  [0,0,()=>({P:add3(pm,[4.4,1.5,-3.6]),T:add3(pm,[0,1.05,0]),fov:30})],
  [CUE(3,'Keep your run-up')-.1,1.4,()=>({P:[-12.8,3.2,8.4],T:[-12.8,.6,.5],fov:34})],
  [CUE(3,'Watch the keeper')-.2,1,()=>({P:add3(pm,[-3.4,2.1,1.2]),T:[-1.2,1,.3],fov:26})],
  [CUE(3,'strike the other side')-.2,1.1,()=>({P:[-17,3.2,4.6],T:[-4.6,.6,-1.2],fov:38})],
 ]);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tau=tau4(t),tt=twos(t),tp=tau4(tt),tpp=tau4(tt-1/12);
  const tK=CUE(3,'Keep your run-up'),tW=CUE(3,'Watch the keeper'),tI=CUE(3,'If he moves'),tS=CUE(3,'strike the other side'),tC=CUE(3,'confidence');
  stadium(s,c,t,[0,1,3],{roar:.8*sm(tC,tC+.4,t)});
  ground(s,c,{bulge:bulgeAt(tau)});
  // 1 · calm: even footprints along the run-up
  footprints(s,c,tau,sm(tK-.1,tK+.3,t)*(1-sm(tS+.6,tS+1.2,t)));
  // 3 · the tell: the red arrow as he moves
  tellArrow(s,c,sm(tI-.05,tI+.45,t)*(1-sm(tC+.6,tC+1.2,t)));
  // 4 · the other side: the yellow ring in the open corner and the line into it, drawn as he strikes
  const ring=sm(tS-.1,tS+.35,t,easeOutBack);if(ring>.02)spotRing(s,c,SPOT,.52*clamp(ring,0,1.2),Math.min(1,ring)*(1-sm(IN_NET+.2,IN_NET+.7,tau)));
  const dv=sm(tS-.1,tS+.4,t);
  if(dv>.02){const pts=partial(pathPts(c,0,FLY,24),Math.max(.04,clamp(tau/FLY))),w=Math.max(9,kAt(c,[-5,.2,-1.3])*.12);if(pts.length>2){s.knockout(ribbon(pts,w*1.6,{taper:.4,pressure:.2,wobble:0}),.5*dv);s.fill(Y,ribbon(pts,w,{taper:.4,pressure:.2,wobble:0}),.95*dv);}}
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:13,crowd:false});
  // 2 · watch the keeper: the sight line, held through the pause
  sightLine(s,c,tp,tt,sm(tW-.1,tW+.45,t,easeOutBack)*(1-sm(tS-.1,tS+.3,t)));
  // confidence: it goes in — a yellow burst in the net
  const gd=sm(tC-.05,tC+.4,t);if(gd>0&&tau>FLY){const q=pr(c,[.8,.4,ZL]);if(q)sparkBurst(s,Y,q[0],q[1],Math.max(60,kAt(c,[0,.4,ZL])*1.1)*easeOutBack(gd),{n:10,seed:61,width:Math.max(6,kAt(c,[0,.4,ZL])*.05)});}
 },
 still:9,
};

const film:RisoStory={
 id:'griezmann-penalty-2018',format:'11v11',title:"Griezmann's penalty in the World Cup final",
 theme:'Penalties: keep your run-up calm, watch the keeper, then strike the other side with confidence',
 ageNote:'France 4–2 Croatia, FIFA World Cup final, Luzhniki Stadium, Moscow, 15 July 2018. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a little penalty — two even footprints, a pause mark, then a low yellow line into a ring, a ball on its tip. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.5)),fade=age<=0?1:1-clamp((age-.65)/.25),r=rng(seed);
  const fp=new Path2D();for(let k=0;k<2;k++){const cx=x-60+k*34,cy=y+(k?-8:8);fp.moveTo(cx+9,cy);fp.arc(cx,cy,9,0,TAU);}s.fill(Y,fp,.9*fade);
  const pts:Pt[]=[];for(let i=0;i<=12;i++){const k=i/12*u;pts.push([x+170*k,y-24*k]);}
  if(pts.length>2)s.fill(Y,ribbon(pts,12,{seed,taper:.8,pressure:.3,wobble:1}),.95*fade);
  const ring:Pt[]=[];for(let i=0;i<24;i++){const a=i/24*TAU;ring.push([x+170+Math.cos(a)*34,y-24+Math.sin(a)*34]);}
  s.fill(Y,ribbon(ring,8,{close:true,seed,taper:0,wobble:1}),.9*fade);
  const e=pts[pts.length-1];if(age>.45&&age<.75)sparkBurst(s,Y,x+170,y-24,70,{n:7,seed,g:1-clamp((age-.45)/.3),width:9});
  footballPanels(s,e[0],e[1],26,{rot:age*8+r()*TAU,key:R,shadow:B,seed:5});
 },
};
export default film;
