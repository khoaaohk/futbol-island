/** Robert Lewandowski's five goals in nine minutes — Bayern Munich 5–1 VfL Wolfsburg, Bundesliga matchday 6, Tuesday 22 September 2015,
 * Allianz Arena, Munich (kick-off 20:00, a floodlit night game). An iconic-play riso film (RisoStory, chapters mode) for the card's picture
 * window (components/CardFilmPlayer.tsx) or StoryFilmPlayer. A reconstruction from WRITTEN accounts (the footage itself was not reviewed),
 * printed as a riso sheet. A 1:1 replay of all five goals cannot fit in ~40 s, so the live chapter is a fast broadcast MONTAGE of the five
 * finishes (a goal-counter bug fills one ball per goal), then two representative goals are replayed slowly and the lesson uses a third.
 *
 * SOURCES (Sept 2026, read as raw pages; cached under the build scratchpad films/src-cache/):
 *  - Wikipedia, "2015–16 FC Bayern Munich season" (raw wikitext: matchday 6, 22 September, home, 5–1, 75,000; Lewandowski 51' 52' 55'
 *    57' 60', Caligiuri 26'; the kit table: home body, shorts and socks all red, pattern _bayern1516h)
 *    https://en.wikipedia.org/wiki/2015%E2%80%9316_FC_Bayern_Munich_season
 *  - Wikipedia, "Robert Lewandowski" (2015–16: came on as a substitute with Bayern 0–1 down; five goals in 8 minutes 59 seconds; fastest
 *    Bundesliga hat-trick; most goals by a substitute; four Guinness World Records certificates; height 1.86 m)
 *    https://en.wikipedia.org/wiki/Robert_Lewandowski
 *  - ESPN FC, "Bayern striker Robert Lewandowski scores 5 goals in 9 minutes" (22 September 2015, via web.archive.org)
 *    http://www.espnfc.com/bayern-munich/story/2625497/bayern-robert-lewandowski-scores-five-in-nine-minutes
 *  - BBC Sport, "Robert Lewandowski: More goals in nine minutes than Liverpool" (23 September 2015) https://www.bbc.com/sport/football/34332408
 *  - Soccerway match page, Bayern München v Wolfsburg 5–1 (via web.archive.org, Dec 2015 capture: kick-off 20:00, half-time 0–1, line-ups
 *    and numbers, assists, substitutions, referee Tobias Stieler)
 *    http://int.soccerway.com/matches/2015/09/22/germany/bundesliga/fc-bayern-munchen/vfl-wolfsburg/2054236/
 * CONFIRMED by those accounts: Wolfsburg led 1–0 at half-time (Caligiuri, 26'); Lewandowski (number 9) came on at half-time; he scored at
 * 51', 52', 55', 57' and 60' — five goals in 8 min 59 s, Bayern won 5–1 in front of 75,000. The goals: (1) "levelled the score with a toe
 * poke from six yards" (ESPN), "sliding home from close range" (BBC); (2) "his blast from 20 yards a minute later" (ESPN), 58 seconds later,
 * "a brilliant effort from distance" (BBC), assist Douglas Costa (Soccerway); (3) "first hitting the post and seeing his follow-up saved
 * before finally finding the back of the net" (ESPN), "three attempts" (BBC); (4) "from a cross on a high bounce" (ESPN), "volleyed home a
 * fourth" (BBC); (5) "volleying Mario Götze's cross with a scissor kick" (ESPN), "a brilliant acrobatic volley" (BBC), assist Götze
 * (Soccerway). Wolfsburg's keeper Diego Benaglio (1). Numbers: Lewandowski 9, Douglas Costa 11, Götze 19. Bayern at home in all red
 * (shirts, shorts, socks — the season's home kit). Hecking: "A world-class striker shot five times on goal"; Lewandowski: "I just wanted
 * to shoot". Referee Tobias Stieler.
 * INFERRED (illustrative reconstruction, never named in the narration): WOLFSBURG'S KIT — drawn green shirts, white shorts, green socks
 * (their club colours; what they wore that night was not in the sources); Benaglio's kit (drawn dark grey) and the referee's (black); the
 * kit trims and number colours; which end Bayern attacked and the camera side (drawn: the main camera on the −z side, Bayern attacking
 * right → left on screen); EVERY position, run, timing and ball path in metres and seconds; which foot (drawn: his RIGHT foot for all five —
 * the accounts never name the foot); goal 1's low ball (drawn from an unnamed Bayern teammate on the right, drilled across the six-yard box)
 * and the slide/toe-poke with the right foot; goal 2's pass from Costa's left foot out on the left, the set touch before the shot, the
 * bottom corner; goal 3's post (drawn: the far post), the save (Benaglio's dive, one palm) and the tap-in; goal 4's cross (drawn from the
 * left, unnamed crosser) and where it bounced; goal 5's cross (drawn from the right), the scissor volley's height and the corner it went in;
 * which way each goal's keeper dived; every other player's position; the celebrations; the crowd colours (a green block of away fans),
 * flags, boards and the arena's shape (three steep tiers under one roof ring, as in drogba-header-2012.ts); the TV camera positions/lenses.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera at halfway, LIVE: the night arena, the substitution (he jogs
 * on at the halfway line), then a fast montage of the five finishes, each cut hidden in a broadcast whip (speed streaks), each goal
 * filling one ball of the goal-counter bug (a red chip with five ball slots against Wolfsburg's green chip with one); ch2 = the slow-motion
 * REPLAY of goal 5 from a low touchline camera (Götze's cross, the ring on "the right place", the leap, the scissor volley); ch3 = a second
 * replay: goal 1 from high behind the goal (the six-yard box lights up, the slide and toe-poke come at the camera); ch4 = the lesson on goal 2
 * from low behind him (ready bounce, the space he stands in, the one set touch, the straight line to the corner). Composed on the FULL sheet
 * (world units = sheet units centred on the canvas; never sheet.safe), so it frames from the 1.45:1 card window down to square.
 * FIGURES: every body goes through ONE adapter, drawPlayer() → athlete.ts (FK skeleton, continuous silhouettes, `prev` secondary motion,
 * motionSmear on the strikes). Handedness: the world is right-handed exactly like athlete.ts (x toward Wolfsburg's goal, y up, +z = Bayern's
 * right), so strike({foot:'r'}) is his RIGHT boot and the ball's contact points are SOLVED from that boot (FK) at each strike. Inks: yellow,
 * red, green, navy. Everything keys off cue times (withTiming swaps in the recorded word onsets); poses on twos, cameras on ones; all
 * randomness seeded. Heat: wide-shot figures print 'low', the non-hero crowd in a replay is capped, every figure in a passage prints 'low'. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc,PASSAGE} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,volley,runCycle,stand,keeperSet,keeperDive,celebrate,slideTackle,lunge,posed,blendPose,
 STRIKE_CONTACT,type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3,type Build} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES until the Kokoro voice exists. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'Off the bench',text:'Munich, 2015. Bayern trail Wolfsburg one–nil at half-time. On comes Robert Lewandowski. One: a toe-poke. Two: a long shot. Three: a rebound. Four: a volley. Five: a flying volley! Five goals in nine minutes!',tail:1.6,
  cues:['Munich','Bayern trail','one–nil','On comes','Robert Lewandowski','One:','toe-poke','Two:','long shot','Three:','rebound','Four:','a volley','Five:','flying volley','Five goals','nine minutes']},
 {label:'Watch it again',text:'Watch number five again, slowly. Mario Götze crosses. Lewandowski is already in the right place, leaps, and volleys it first time!',tail:1.5,
  cues:['Watch number five','slowly','Mario Götze','crosses','already','right place','leaps','volleys','first time']},
 {label:'Goal one',text:'Goal one was simple too: close to goal, one quick poke, and in!',tail:1.5,
  cues:['Goal one','simple','close to goal','quick poke','and in']},
 {label:'Your turn',text:'Your turn: stay ready, be in the right place, and keep your finish quick and simple.',tail:1.6,
  cues:['Your turn','stay ready','right place','quick','simple']},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/lewandowski-five-2015/timing.json, add
 *   import timingJson from '../../../public/plays/narration/lewandowski-five-2015/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/lewandowski-five-2015/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (calibrated on the Kokoro timings of the earlier films): .22 s + .025 s a letter per word, pauses after , ; : . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.22+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;]$/.test(w))t+=.2;if(/:$/.test(w))t+=.26;if(/[.!?]$/.test(w))t+=.4;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('lewandowski: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('lewandowski: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
/** key() needs increasing times: push each key at least `gap` after the previous one (real voice timings can crowd authored offsets) */
function mono(K:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of K)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}

// ---------------------------------------------------------------- inks, vectors
const Y='yellow',R='red',G='green',K='navy';
const add3=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const mix3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const wrap=(a:number)=>{while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;return a;};
const lerpAng=(a:number,b:number,u:number)=>a+wrap(b-a)*clamp(u);
/** yaw (athlete.ts: 0 faces +x, + turns left) facing the ground direction (dx,dz) */
const yawTo=(dx:number,dz:number)=>Math.atan2(-dz,dx);
/** a narrower (square) window gets a slightly wider lens so the action still fits; set by frame(), read by every camera */
let LENS=1;
/** Frame the FULL sheet: world (0,0) on the canvas centre at 1 unit per sheet unit (the passage arrival scale still multiplies in). */
function frame(s:Sheet){const S=s.arrival;s.camera((s.cx-s.W/2)/S,(s.cy-s.H/2)/S,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
/** half the visible extents with margin for the .68 passage preview */
const view=(s:Sheet)=>({hx:s.W/(2*.68)+120,hy:s.H/(2*.68)+120});

// ---------------------------------------------------------------- 3D: projection through an athlete.ts Camera (right-handed metres, y up)
/** Pitch: Wolfsburg's goal line is x = 0 (Bayern attack +x), goal centre z = 0, +z = Bayern's right; touchlines z = ±34, halfway x = −52.5. */
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

// ---------------------------------------------------------------- the Munich arena at night: a steep closed bowl, three tiers, a white roof ring
/** stand planes (a along, b up the rake 0..1): 0 the far side (+z), 1 behind Wolfsburg's goal (+x), 2 the main stand (−z, the camera
 * side), 3 the other end. Closed corners. */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-126,22,a),1.2+33*b,40+30*b],
 (a,b)=>[8+28*b,1.2+31*b,lerp(-62,62,a)],
 (a,b)=>[lerp(22,-126,a),1.2+33*b,-40-30*b],
 (a,b)=>[-112-28*b,1.2+31*b,lerp(62,-62,a)],
];
const CORNERS:[number,number,number,number][]=[[0,1,1,1],[1,0,2,0],[2,1,3,1],[3,0,0,0]];
const STAND_COLS=[104,72,104,72],STAND_ROWS=15,TIER=[.34,.67];
/** flags on the stand fronts: [stand, a, 0 = Bayern (red with a paper band) | 1 = Wolfsburg (green)] */
const FLAGS:[number,number,number][]=[[0,.2,0],[0,.36,0],[0,.52,0],[0,.68,0],[0,.83,0],[1,.22,0],[1,.44,0],[1,.66,1],[1,.84,1],[2,.25,0],[2,.5,0],[3,.3,0],[3,.5,0],[3,.72,0]];
/** where the Wolfsburg green sits (inferred): an away block in the corner of the end behind Wolfsburg's goal */
const greenAt=(si:number,a:number)=>si===1&&a>.6?.7:.03;
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 // a September night in Munich: a navy sky, the floodlit haze low down
 s.field(K,.5,.5);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz){[.1,.16,.24].forEach((d,i)=>s.tone(Y,polyPath([[-1e4,hz[1]+120-i*160],[1e4,hz[1]+120-i*160],[1e4,hz[1]-190-i*160],[-1e4,hz[1]-190-i*160]],true),d));}
 const planes=new Path2D(),tier=new Path2D(),roof=new Path2D(),edge=new Path2D();
 for(const i of which){const S=STANDS[i];addPoly(planes,polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]));for(const b of TIER)seg3(c,S(0,b),S(1,b),1.1,tier);
  addPoly(roof,polyP(c,[add3(S(0,1),[0,1.5,0]),add3(S(1,1),[0,1.5,0]),add3(S(1,.74),[0,11,0]),add3(S(0,.74),[0,11,0])]));
  seg3(c,add3(S(0,.74),[0,10.8,0]),add3(S(1,.74),[0,10.8,0]),.5,edge);}
 for(const[i,ai,j,aj] of CORNERS){if(!which.includes(i)&&!which.includes(j))continue;const A=STANDS[i],Bs=STANDS[j];
  addPoly(planes,polyP(c,[A(ai,0),Bs(aj,0),Bs(aj,1),A(ai,1)]));
  addPoly(roof,polyP(c,[add3(A(ai,1),[0,1.5,0]),add3(Bs(aj,1),[0,1.5,0]),add3(Bs(aj,.74),[0,11,0]),add3(A(ai,.74),[0,11,0])]));}
 // red seats under the crowd (the arena's lower bowl is red), paper tier fascias
 s.knockout(planes);s.tone(K,planes,.4);s.tone(R,planes,.22);s.knockout(tier,.8);
 // the crowd: seeded dots (Bayern red and white, a green away block, a few yellow), sized by distance; the roar lifts them
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(TIER.some(w=>Math.abs(b-w)<.035))continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,13);if(h<.22)continue;const a=(i+.5+(hash(i+j*31,9)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const hb=hash(i*7+j*53+si*3,21),ink=hb<greenAt(si,a)?2:h<.64?1:h<.9?0:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.75);s.fill(R,inks[1],.95);s.fill(G,inks[2],.95);s.fill(Y,inks[3],.95);
 s.knockout(roof);s.tone(K,roof,.35);s.knockout(edge,.8);
 const fl=new Path2D(),red=new Path2D(),grn=new Path2D();
 for(const[si,a,kind] of FLAGS){if(!which.includes(si))continue;const S=STANDS[si],w=.03,P=(u:number,b:number)=>S(a+u*w,b);
  const q=polyP(c,[P(0,.005),P(1,.005),P(1,.075),P(0,.075)]);if(q.length<3)continue;fl.addPath(polyPath(q,true));
  if(kind===0){addPoly(red,polyP(c,[P(0,.005),P(1,.005),P(1,.03),P(0,.03)]));addPoly(red,polyP(c,[P(0,.05),P(1,.05),P(1,.075),P(0,.075)]));}
  else addPoly(grn,q);}
 s.knockout(fl);s.fill(R,red,.95);s.fill(G,grn,.95);
 // floodlights along the roof lip
 const lamp=new Path2D();for(const i of which){const S=STANDS[i];for(let k=0;k<8;k++){const u=(k+.5)/8,a=add3(S(u-.022,.74),[0,10,0]),b=add3(S(u+.022,.74),[0,10,0]);if(toCam(c,a)[2]<NEAR+2)continue;seg3(c,a,b,1,lamp);}}
 s.knockout(lamp);s.fill(Y,lamp,.75);
 if(flash>0){const p=new Path2D(),n=Math.round(24*flash);for(let i=0;i<n;i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,STANDS[si](r2,.1+.8*hash(i,Math.floor(tt*12))));if(!q)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
// ---------------------------------------------------------------- grass, lines, boards, corner flags
function ground(s:Sheet,c:Cam){
 const g=polyP(c,[[-118,0,-44],[13,0,-44],[13,0,44],[-118,0,44]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(G,gp,.82);s.tone(Y,gp,.42);s.tone(K,gp,.12);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]));s.tone(K,st,.13);
 // advertising boards: dark with paper panels (no lettering)
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([5.6,0,-37.5],[5.6,0,37.5]);board([-110,0,-37.5],[5.6,0,-37.5]);board([-110,0,37.5],[5.6,0,37.5]);
 for(let k=0;k<12;k++){const z=-36+k*6.2;addPoly(pn,polyP(c,[[5.5,.25,z],[5.5,.25,z+3.3],[5.5,.68,z+3.3],[5.5,.68,z]]));}
 for(const zz of[-37.4,37.4])for(let k=0;k<18;k++){const x=-108+k*6.4;addPoly(pn,polyP(c,[[x,.25,zz],[x+3.4,.25,zz],[x+3.4,.68,zz],[x,.68,zz]]));}
 s.knockout(bd);s.fill(K,bd,.8);s.fill(R,bd,.35);s.knockout(pn,.85);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.12,ln);
 for(let k=0;k<8;k++){L([-k*13.125,0,-34],[-(k+1)*13.125,0,-34]);L([-k*13.125,0,34],[-(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){L([0,0,-34+k*17],[0,0,-34+(k+1)*17]);L([-52.5,0,-34+k*17],[-52.5,0,-34+(k+1)*17]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(-52.5,0,9.15);
 L([0,0,-20.16],[-16.5,0,-20.16]);L([-16.5,0,-20.16],[-16.5,0,20.16]);L([-16.5,0,20.16],[0,0,20.16]);
 L([0,0,-9.16],[-5.5,0,-9.16]);L([-5.5,0,-9.16],[-5.5,0,9.16]);L([-5.5,0,9.16],[0,0,9.16]);
 {const a=Math.acos(5.5/9.15);circ(-11,0,9.15,Math.PI-a,Math.PI+a,12);}
 addPoly(ln,polyP(c,Array.from({length:10},(_,i)=>[-11+Math.cos(i/10*TAU)*.13,0,Math.sin(i/10*TAU)*.13] as V3)));
 circ(0,-34,1,Math.PI/2,Math.PI,4);circ(0,34,1,Math.PI,Math.PI*1.5,4);
 s.knockout(ln);
 const pole=new Path2D(),flag=new Path2D();for(const z of[-34,34]){seg3(c,[0,0,z],[0,1.55,z],.05,pole);addPoly(flag,polyP(c,[[0,1.55,z],[0,1.2,z],[-.45,1.38,z]]));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(Y,flag,.95);
}
/** Wolfsburg's goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out around bz; post = a flash on a post (goal 3) */
function goal3(s:Sheet,c:Cam,bulge:number,bz:number,post=0){
 const X=0,z0=-3.66,z1=3.66,H=2.44,back=(z:number)=>X+2+bulge*.75*Math.exp(-Math.pow((z-bz)/1.6,2));
 const zs=[z0,-2.4,-1.2,0,1.2,2.4,z1];
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
 if(post>0){const p=pr(c,[0,.8,z0]);if(p)sparkBurst(s,Y,p[0],p[1],Math.max(40,kAt(c,[0,.8,z0])*.9),{n:9,seed:55,g:easeOutBack(clamp(post*2))*(1-clamp(post*2-1)),width:Math.max(5,kAt(c,[0,.8,z0])*.08)});}
}

// ---------------------------------------------------------------- the cast: kits (athlete.ts styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.28],[K,.08]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.2]];
/** Bayern: all red (shirts, shorts, socks — the 2015–16 home kit); paper numbers and trim (trim/number colour inferred) */
const fcb=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,shorts:R,socks:R,boots:K,skin:SKIN_L,hair:K,line:K,trim:'paper',numberInk:'paper',hairStyle:'short',build:{height:1.82},...o});
/** Wolfsburg (INFERRED, see the header): green shirts, white shorts, green socks, paper trim */
const wob=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:G,shorts:'paper',socks:G,boots:K,skin:SKIN_L,hair:K,line:K,trim:'paper',numberInk:'paper',hairStyle:'short',build:{height:1.84},...o});
const B_LEW:Build={height:1.86,bulk:1.04,thighs:1.05};
const LEW_ST=fcb({number:9,hair:[K,.7],build:B_LEW,seed:9});
const GOT_ST=fcb({number:19,hair:[K,.85],build:{height:1.76,bulk:.96},seed:19});
const COS_ST=fcb({number:11,skin:SKIN_M,hair:[K,.95],hairStyle:'curly',build:{height:1.72,bulk:.95},seed:11});
/** Diego Benaglio (1): kit colour not in the sources — drawn dark grey (inferred) */
const BEN_ST:AthleteStyle={shirt:[K,.55],shorts:[K,.75],socks:[K,.55],boots:K,skin:SKIN_L,hair:[K,.8],line:K,trim:Y,gloves:'paper',sleeves:'long',hairStyle:'short',number:1,numberInk:Y,build:{height:1.94,bulk:1.02},seed:1};
const REF_ST:AthleteStyle={shirt:[K,.9],shorts:[K,.9],socks:[K,.9],boots:K,skin:SKIN_L,hair:[K,.6],line:K,trim:Y,hairStyle:'short',seed:33};

// ---------------------------------------------------------------- a play: actors on keyed tracks, kicks, dives, and a ball path through solved contacts
const BALL_R=.11;
type Role='lew'|'fcb'|'wob'|'gk'|'ref';
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];hero?:boolean};
type KickKind='strike'|'touch'|'volley'|'scissor'|'slide';
/** a kick by actor `who` with contact at τ = at; aim = the ground point the ball goes toward (sets the body yaw at contact) */
type Kick={who:number;at:number;kind:KickKind;foot:'l'|'r';dur:number;aim:[number,number];power?:number;height?:number;yaw?:number};
type Dive={who:number;at:number;side:'l'|'r';height:number;dur:number};
type Jab={who:number;at:number;side:'l'|'r';dur:number};
/** ball waypoints: a fixed point, a kick's contact (the boot, solved by FK), or a keeper's glove at full stretch; h = arc height of the
 * segment arriving here */
type WP={t?:number;P?:V3;kick?:number;hand?:number;h?:number};
type Play={name:string;minute:number;actors:Actor[];kicks:Kick[];dives:Dive[];jabs:Jab[];path:WP[];tIn:number;bz:number;celebAt:number;postAt?:number;T0:number;T1:number;
 tables?:{X:number[];Z:number[];D:number[]}[];pts?:{t:number;P:V3;h:number}[]};
/** contact fraction of each move's clock */
const CONTACT_U:Record<KickKind,number>={strike:STRIKE_CONTACT,touch:STRIKE_CONTACT,volley:.5,scissor:.5,slide:.5};
const DT=.02;
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const still=(a:number[],b:number[])=>Math.abs(a[1]-b[1])+Math.abs(a[2]-b[2])<1e-6;
 const f=(j:number)=>{const m1=still(k1,k2)||still(k0,k1)?0:(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=still(k1,k2)||still(k2,k3)?0:(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
function tables(g:Play){if(!g.tables)g.tables=g.actors.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(g.T1-g.T0)/DT;i++){const[x,z]=herm(a.keys,g.T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});return g.tables;}
const samp=(g:Play,arr:number[],tau:number)=>{const u=clamp((tau-g.T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(g:Play,k:number,tau:number):[number,number]=>{const T=tables(g)[k];return[samp(g,T.X,tau),samp(g,T.Z,tau)];};
const distOf=(g:Play,k:number,tau:number)=>samp(g,tables(g)[k].D,tau);
const velOf=(g:Play,k:number,tau:number):[number,number]=>{const a=posOf(g,k,tau-.06),b=posOf(g,k,tau+.06);return[(b[0]-a[0])/.12,(b[1]-a[1])/.12];};

// ---------------------------------------------------------------- poses
const RAD=Math.PI/180,LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
/** blend channel overrides (degrees) into a pose with weight w */
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const bump=(a:number,b:number,t:number)=>t<=a||t>=b?0:Math.sin(Math.PI*(t-a)/(b-a));
/** a striker's ready stance: knees bent, on the balls of the feet, a small bounce */
const READY=(tau:number)=>{const b=.5+.5*Math.sin(tau*TAU*1.6);return posed({lHipF:30,rHipF:22,lKnee:40-8*b,rKnee:34-8*b,lAnk:-8+10*b,rAnk:-8+10*b,lHipA:9,rHipA:9,lean:15,pitch:5,air:.025*b,lShA:22,rShA:22,lShF:12,rShF:-4,lElb:58,rElb:58,neckP:-4,squash:-.03*b});};
const DEJECT=posed({lHipF:26,rHipF:26,lKnee:30,rKnee:30,lean:30,pitch:6,neckP:34,lShA:14,rShA:14,lShF:20,rShF:20,lElb:24,rElb:24});
/** the scissor volley (right foot): the volley swivel, but both feet off the ground — the standing leg swings up first, the body lies back
 * sideways, the kicking leg whips through at hip height, then he lands on his side */
function scissor(u:number,foot:'l'|'r'):Pose{let p=volley(u,{foot:'r',height:1});
 const airT=Math.sin(Math.PI*clamp((u-.24)/.62));p.air+=.5*airT;
 p=over(p,{lHipF:74,lKnee:66,lAnk:30,pitch:-8},bump(.12,.5,u));
 p=over(p,{roll:-52,lean:-14,bend:-22,lHipF:-6,lKnee:26,lShA:118,lShF:-20,rShA:84,rShF:40,neckP:30},bump(.3,.78,u));
 p=over(p,{roll:-70,pitch:-6,air:0,lHipF:20,rHipF:36,lKnee:40,rKnee:50,lShA:110,rShA:60,neckP:14},sm(.8,1,u));
 if(foot==='l'){const m={...p};for(const k of Object.keys(p) as (keyof Pose)[])if(k[0]==='l'&&k!=='lean'){const r=('r'+k.slice(1)) as keyof Pose;m[k]=p[r];m[r]=p[k];}for(const k of ['yaw','roll','twist','bend','neckY','dz'] as (keyof Pose)[])m[k]=-p[k];return m;}
 return p;}
/** the sliding toe-poke: slideTackle without its own root shift (the track carries him forward) */
function slidePoke(u:number,foot:'l'|'r'):Pose{const p=slideTackle(u,{foot});p.dx=0;p.dz=0;return p;}
function kickPose(k:Kick,u:number):Pose{
 switch(k.kind){
  case 'strike':return strike(u,{foot:k.foot,power:k.power??1});
  case 'touch':return strike(u,{foot:k.foot,power:k.power??.15});
  case 'volley':return volley(u,{foot:k.foot,height:k.height??.6});
  case 'scissor':return scissor(u,k.foot);
  case 'slide':return slidePoke(u,k.foot);}
}
const YAW_OFF:Record<KickKind,number>={strike:0,touch:0,volley:24*RAD,scissor:24*RAD,slide:0};
function loco(g:Play,k:number,tau:number):Pose{
 const v=velOf(g,k,tau),sp=Math.hypot(v[0],v[1]),q=clamp(sp/7.5),ph=distOf(g,k,tau)/(2.3+2.1*q)+k*.37;
 const run=runCycle(ph,{speed:q});if(sp>1.4)return run;
 const idle=g.actors[k].role==='lew'?READY(tau):blendPose(stand(),posed({lHipF:22,rHipF:18,lKnee:28,rKnee:24,lean:12,pitch:4,neckP:-8,lShA:22,rShA:20,lElb:38,rElb:34}),.5+.5*Math.sin(tau*1.7+k));
 return blendPose(idle,run,clamp((sp-.25)/1.15));
}
/** face along the run when moving, else toward the ball (blended); noBall (while solving contacts) = the run direction only */
function faceYaw(g:Play,k:number,tau:number,noBall:boolean):number{
 const v=velOf(g,k,tau),sp=Math.hypot(v[0],v[1]);if(noBall)return sp>.05?yawTo(v[0],v[1]):Math.PI;
 const p=posOf(g,k,tau),b=ballAt(g,tau),tx=b[0]-p[0],tz=b[2]-p[1],tl=Math.hypot(tx,tz)||1,w=clamp((sp-.6)/1.6);
 return yawTo(lerp(tx/tl,v[0]/(sp||1),w),lerp(tz/tl,v[1]/(sp||1),w));
}
type State={pose:Pose;place:Place};
/** the whole figure of actor k at τ */
function stateOf(g:Play,k:number,tau:number,noBall=false):State{
 const a=g.actors[k],[x,z]=posOf(g,k,tau);let pose=loco(g,k,tau),yaw=faceYaw(g,k,tau,noBall);
 if(a.role==='gk'){const v=velOf(g,k,tau),sp=Math.hypot(v[0],v[1]);pose=blendPose(keeperSet(tau*1.3),pose,clamp((sp-1.2)/1.5));yaw=noBall?Math.PI:lerpAng(Math.PI,yaw,.6);}
 for(const kk of g.kicks){if(kk.who!==k)continue;const c=CONTACT_U[kk.kind],u=(tau-(kk.at-c*kk.dur))/kk.dur,out=kk.kind==='slide'||kk.kind==='scissor'?2:1.35;if(u<=0||u>=out)continue;
  const w=Math.min(sm(0,.14,u),1-sm(1,out,u));pose=blendPose(pose,kickPose(kk,Math.min(1,u)),w);yaw=lerpAng(yaw,kk.yaw!,sm(0,.3,u)*(1-sm(1,out,u)));}
 for(const d of g.dives){if(d.who!==k)continue;const u=(tau-(d.at-.55*d.dur))/d.dur;if(u<=0)continue;pose=blendPose(pose,keeperDive(Math.min(1,u),{side:d.side,height:d.height}),sm(0,.08,u));yaw=lerpAng(yaw,Math.PI,sm(0,.12,u));}
 for(const j of g.jabs){if(j.who!==k)continue;const u=(tau-(j.at-.6*j.dur))/j.dur;if(u>0&&u<1.5)pose=blendPose(pose,lunge(Math.min(1,u),{side:j.side}),Math.min(sm(0,.12,u),1-sm(1,1.5,u)));}
 if(!noBall){
  const cel=g.celebAt;
  if(a.role==='lew'&&tau>cel)pose=blendPose(pose,celebrate(distOf(g,k,tau)/4.2,{kind:'run'}),sm(cel,cel+.6,tau));
  if(a.role==='fcb'&&tau>g.tIn+.5)pose=blendPose(pose,celebrate(tau*.9+k*.3,{kind:'arms'}),sm(g.tIn+.5,g.tIn+1.1,tau)*.75);
  if(a.role==='wob'&&tau>g.tIn+.5)pose=blendPose(pose,DEJECT,sm(g.tIn+.6,g.tIn+1.4,tau)*.8);}
 return{pose,place:{x,z,yaw}};
}
/** resolve the ball path once: kick yaws (toward their aims), then the boot / glove contact points solved from the skeletons */
function resolve(g:Play){
 if(g.pts)return g.pts;
 for(const kk of g.kicks){const[x,z]=posOf(g,kk.who,kk.at);kk.yaw=yawTo(kk.aim[0]-x,kk.aim[1]-z)+YAW_OFF[kk.kind];}
 const boot=(kk:Kick):V3=>{const st=stateOf(g,kk.who,kk.at,true),sk=solve(st.pose,g.actors[kk.who].style.build??{},st.place),toe=kk.foot==='l'?sk.lToe:sk.rToe,[x,z]=posOf(g,kk.who,kk.at),a=yawTo(kk.aim[0]-x,kk.aim[1]-z),d:[number,number]=[Math.cos(a),-Math.sin(a)];
  return[toe[0]+d[0]*.1,Math.max(BALL_R,toe[1]+.05),toe[2]+d[1]*.1];};
 const glove=(d:Dive):V3=>{const st=stateOf(g,d.who,d.at,true),sk=solve(st.pose,g.actors[d.who].style.build??{},st.place),h=d.side==='r'?sk.rHa:sk.lHa;return[h[0]-.12,h[1],h[2]];};
 g.pts=g.path.map(w=>{if(w.kick!==undefined){const kk=g.kicks[w.kick];return{t:kk.at,P:boot(kk),h:w.h??0};}if(w.hand!==undefined){const d=g.dives[w.hand];return{t:d.at,P:glove(d),h:w.h??0};}return{t:w.t!,P:w.P!,h:w.h??0};});
 return g.pts;
}
function ballAt(g:Play,tau:number):V3{
 const W=resolve(g);if(tau<=W[0].t)return W[0].P;
 for(let i=0;i+1<W.length;i++){const a=W[i],b=W[i+1];if(tau<b.t){const u=(tau-a.t)/(b.t-a.t);return[lerp(a.P[0],b.P[0],u),lerp(a.P[1],b.P[1],u)+b.h*4*u*(1-u),lerp(a.P[2],b.P[2],u)];}}
 return W[W.length-1].P;
}
const spinAt=(g:Play,tau:number)=>{const b=ballAt(g,tau);return(b[0]*1.3+b[2])/BALL_R;};
const bulgeAt=(g:Play,tau:number)=>tau<g.tIn+.06?0:Math.exp(-(tau-g.tIn-.06)*2.4)*(1+.3*Math.sin((tau-g.tIn)*14));
/** net + settle waypoints after the ball crosses the line at (tIn, [0,y,z]) */
const netWps=(tIn:number,y:number,z:number):WP[]=>[{t:tIn,P:[0,y,z]},{t:tIn+.1,P:[1.35,Math.max(.3,y*.85),z*1.04]},{t:tIn+.75,P:[1.05,BALL_R,z*.95],h:.1}];
const mk=(p:Omit<Play,'T0'|'T1'|'dives'|'jabs'>&{dives?:Dive[];jabs?:Jab[]}):Play=>({T0:-4.5,T1:7,dives:[],jabs:[],...p});

// ---------------------------------------------------------------- the five goals (positions, runs and paths INFERRED — see the header)
const LEW=0,GK=1;
/** goal 1 (51'): a low ball drilled across the six-yard box from the right; he slides in and toe-pokes it home with his right boot */
const G1=mk({name:'toe-poke',minute:51,tIn:.3,bz:-2.2,celebAt:1.25,
 actors:[
  {name:'Lewandowski',role:'lew',hero:true,style:LEW_ST,keys:[[-4,-12,-4.5],[-2.4,-10.6,-3.4],[-1.2,-8.8,-1.9],[-.45,-7.3,-1.05],[0,-6.35,-.72],[.45,-5.2,-.5],[.9,-4.9,-.45],[1.25,-4.9,-.45],[2.4,-6.4,-4.2],[4.5,-9.5,-12],[7,-12,-19]]},
  {name:'Benaglio',role:'gk',hero:true,style:BEN_ST,keys:[[-4,-1.2,1.2],[-1.2,-1.4,2.4],[-.4,-1.5,1.9],[0,-1.6,1.1],[.5,-1.6,.7],[7,-1.5,.6]]},
  {name:'Bayern teammate (low ball)',role:'fcb',hero:true,style:fcb({seed:25,build:{height:1.86}}),keys:[[-4,-14,19],[-2.2,-11.2,16.6],[-1.1,-9.4,15.1],[-.8,-9.05,14.8],[0,-8.6,14],[1.5,-8.2,11],[7,-7,6]]},
  {name:'Wolfsburg defender (beaten)',role:'wob',style:wob({seed:41,build:{height:1.92}}),keys:[[-4,-9.6,1.4],[-1.2,-8,1.3],[-.4,-6.9,.7],[0,-6.4,.45],[.6,-5.8,.3],[7,-6,.5]]},
  {name:'Wolfsburg defender',role:'wob',style:wob({seed:42,skin:SKIN_D}),keys:[[-4,-12.5,-7],[-.6,-9.2,-4],[0,-8.4,-3.2],[7,-7.4,-2.6]]},
  {name:'Wolfsburg defender',role:'wob',style:wob({seed:43}),keys:[[-4,-8.5,7.5],[-1,-7.3,9.2],[0,-6.8,9.8],[7,-6.2,9]]},
  {name:'Bayern (far post)',role:'fcb',style:fcb({seed:26,skin:SKIN_M}),keys:[[-4,-15,-10],[0,-9.4,-7.2],[7,-8.2,-6]]},
  {name:'Wolfsburg midfielder',role:'wob',style:wob({seed:44}),keys:[[-4,-16,3],[0,-13.6,2],[7,-12.4,1]]},
 ],
 kicks:[{who:2,at:-.8,kind:'strike',foot:'r',dur:.95,power:.65,aim:[-6.3,-.7]},{who:LEW,at:0,kind:'slide',foot:'r',dur:.95,aim:[0,-2.2]}],
 dives:[{who:GK,at:.26,side:'r',height:.05,dur:.9}],jabs:[{who:3,at:-.05,side:'l',dur:.8}],
 path:[{kick:0},{kick:1,h:.12},...netWps(.3,.24,-2.2)]});
/** goal 2 (52', assist Douglas Costa): Costa's pass infield from the left, one set touch, a right-foot blast from 20 yards, low into the corner */
const G2=mk({name:'long shot',minute:52,tIn:.68,bz:2.7,celebAt:1.2,
 actors:[
  {name:'Lewandowski',role:'lew',hero:true,style:LEW_ST,keys:[[-4,-23,-5],[-2.2,-21.4,-2.95],[-1.2,-21.15,-2.75],[-.55,-20.25,-2.25],[0,-19.45,-1.95],[.35,-19.05,-1.85],[1.2,-18.2,-2.3],[4,-19,-9],[7,-22,-16]]},
  {name:'Benaglio',role:'gk',hero:true,style:BEN_ST,keys:[[-4,-2.6,-1.2],[-1.2,-3.2,-.9],[0,-3.4,-.6],[.4,-3.4,-.5],[7,-3.3,.2]]},
  {name:'Douglas Costa',role:'fcb',hero:true,style:COS_ST,keys:[[-4,-31,-20.5],[-2.3,-27.2,-16.8],[-1.55,-25.7,-15.2],[-1.35,-25.4,-14.95],[0,-24,-13],[3,-21,-12],[7,-20,-11]]},
  {name:'Wolfsburg defender (closing)',role:'wob',style:wob({seed:45,build:{height:1.9}}),keys:[[-4,-16.6,-.4],[-1.2,-16.3,-1.2],[0,-16.6,-1.7],[.35,-16.7,-1.8],[7,-15.5,-1]]},
  {name:'Wolfsburg defender',role:'wob',style:wob({seed:46,skin:SKIN_D}),keys:[[-4,-15,4.6],[0,-14.4,2.8],[7,-13,2.2]]},
  {name:'Wolfsburg defender',role:'wob',style:wob({seed:47}),keys:[[-4,-12.6,-6.4],[0,-12.1,-4.4],[7,-11,-3.2]]},
  {name:'Bayern',role:'fcb',style:fcb({seed:27,build:{height:1.86}}),keys:[[-4,-14.5,8.6],[0,-11.2,6.2],[7,-10,5]]},
  {name:'Wolfsburg midfielder',role:'wob',style:wob({seed:48}),keys:[[-4,-23,5.5],[0,-21.4,3.2],[7,-20,2]]},
 ],
 kicks:[{who:2,at:-1.35,kind:'strike',foot:'l',dur:.95,power:.55,aim:[-20.2,-2.2]},{who:LEW,at:-.55,kind:'touch',foot:'r',dur:.6,aim:[0,-.6]},{who:LEW,at:0,kind:'strike',foot:'r',dur:.95,power:1,aim:[0,2.8]}],
 dives:[{who:GK,at:.62,side:'l',height:.15,dur:.95}],jabs:[{who:3,at:.05,side:'r',dur:.8}],
 path:[{kick:0},{kick:1},{kick:2},...netWps(.68,.42,2.85)]});
/** goal 3 (55'): three attempts — the far post, Benaglio's save, then the tap-in */
const G3=mk({name:'rebound',minute:55,tIn:.24,bz:1.6,celebAt:1,postAt:-1.95,
 actors:[
  {name:'Lewandowski',role:'lew',hero:true,style:LEW_ST,keys:[[-4.5,-18,5.2],[-3.2,-15.4,3.6],[-2.45,-13.7,2.8],[-2.1,-13,2.4],[-1.3,-9.3,-.55],[-.9,-8.5,-.55],[-.4,-7,-.05],[0,-5.75,.5],[.3,-5.2,.62],[1,-5.3,-.4],[3,-8,-7],[7,-11,-15]]},
  {name:'Benaglio',role:'gk',hero:true,style:BEN_ST,keys:[[-4.5,-1.6,.6],[-2.45,-1.9,-.1],[-1.7,-2.1,-.5],[-1.3,-2.3,-.7],[7,-2.3,-.7]]},
  {name:'Wolfsburg defender',role:'wob',style:wob({seed:49,build:{height:1.92}}),keys:[[-4.5,-15.5,1.2],[-2.45,-13.4,1.1],[-1,-10.2,.2],[0,-8.4,-.2],[7,-7.4,0]]},
  {name:'Wolfsburg defender',role:'wob',style:wob({seed:50,skin:SKIN_D}),keys:[[-4.5,-9.2,-4.4],[-1.3,-8.1,-2.6],[0,-6.5,-1.4],[7,-6,-1]]},
  {name:'Bayern',role:'fcb',style:fcb({seed:28}),keys:[[-4.5,-12.4,-10.4],[0,-8.2,-6.2],[7,-7.2,-5]]},
  {name:'Wolfsburg defender',role:'wob',style:wob({seed:51}),keys:[[-4.5,-8.4,6.4],[0,-6.9,4.2],[7,-6.2,3.4]]},
  {name:'Bayern',role:'fcb',style:fcb({seed:29,skin:SKIN_M}),keys:[[-4.5,-21,-2.5],[0,-17,-1.2],[7,-15,-2]]},
 ],
 kicks:[{who:LEW,at:-2.45,kind:'strike',foot:'r',dur:.95,power:.9,aim:[0,-3.6]},{who:LEW,at:-1.3,kind:'strike',foot:'r',dur:.9,power:.8,aim:[0,-1.2]},{who:LEW,at:0,kind:'strike',foot:'r',dur:.8,power:.35,aim:[0,1.6]}],
 dives:[{who:GK,at:-1.02,side:'r',height:.35,dur:.95}],
 path:[{t:-3.6,P:[-19.5,BALL_R,4.2]},{kick:0},{t:-1.95,P:[-.08,.8,-3.52],h:.35},{kick:1,h:.5},{hand:0,h:.1},{kick:2,h:1.5},...netWps(.24,.36,1.6)]});
/** goal 4 (57'): a cross from the left on a high bounce, volleyed home */
const G4=mk({name:'volley',minute:57,tIn:.34,bz:1.8,celebAt:1.1,
 actors:[
  {name:'Lewandowski',role:'lew',hero:true,style:LEW_ST,keys:[[-4,-16.5,4.4],[-2,-13.4,2.2],[-.8,-10.9,.5],[-.3,-10.2,-.1],[0,-9.95,-.25],[.4,-9.6,-.2],[1.5,-10.2,-4],[4,-13,-11],[7,-15,-17]]},
  {name:'Benaglio',role:'gk',hero:true,style:BEN_ST,keys:[[-4,-1.8,-1.6],[-1,-2.4,-.9],[0,-2.6,-.3],[7,-2.5,0]]},
  {name:'Bayern crosser',role:'fcb',hero:true,style:fcb({seed:30,skin:SKIN_M}),keys:[[-4,-17,-30.5],[-2.1,-11.4,-28.6],[-1.5,-9.8,-27.6],[-1.3,-9.4,-27.3],[0,-8,-25.2],[7,-7,-21]]},
  {name:'Wolfsburg defender (marker)',role:'wob',style:wob({seed:52,build:{height:1.9}}),keys:[[-4,-12.4,1.6],[-1,-10.4,1.6],[0,-9.9,1.35],[7,-9,1]]},
  {name:'Wolfsburg defender',role:'wob',style:wob({seed:53,skin:SKIN_D}),keys:[[-4,-8.4,-4.6],[0,-6.6,-3.1],[7,-6,-2.5]]},
  {name:'Wolfsburg defender',role:'wob',style:wob({seed:54}),keys:[[-4,-8.2,5.6],[0,-6.9,4.5],[7,-6.5,4]]},
  {name:'Bayern',role:'fcb',style:fcb({seed:31}),keys:[[-4,-12.5,-8.4],[0,-8.2,-7],[7,-7.5,-6]]},
 ],
 kicks:[{who:2,at:-1.4,kind:'strike',foot:'l',dur:.95,power:.75,aim:[-11,-2]},{who:LEW,at:0,kind:'volley',foot:'r',dur:1,height:.55,aim:[0,1.8]}],
 dives:[{who:GK,at:.3,side:'l',height:.55,dur:.9}],
 path:[{kick:0},{t:-.42,P:[-11.3,BALL_R,-2.3],h:3.4},{kick:1,h:1.15},...netWps(.34,1.45,1.8)]});
/** goal 5 (60', assist Mario Götze): Götze's cross from the right, the scissor-kick volley */
const G5=mk({name:'flying volley',minute:60,tIn:.4,bz:-2.3,celebAt:1.35,
 actors:[
  {name:'Lewandowski',role:'lew',hero:true,style:LEW_ST,keys:[[-4,-17.2,-2.2],[-2.4,-14.6,-.9],[-1.4,-12.6,.05],[-.8,-11.8,.35],[-.35,-11.35,.45],[0,-11.15,.45],[.5,-10.95,.35],[1.35,-10.8,.2],[2.4,-11.8,-3.2],[4.5,-14,-10],[7,-16,-17]]},
  {name:'Benaglio',role:'gk',hero:true,style:BEN_ST,keys:[[-4,-1.5,1.6],[-1,-2.2,2.3],[0,-2.4,1.5],[7,-2.3,.6]]},
  {name:'Mario Götze',role:'fcb',hero:true,style:GOT_ST,keys:[[-4,-20.5,26.4],[-2.2,-15.8,24.4],[-1.4,-14.1,23.5],[-1.2,-13.8,23.3],[0,-12.8,22],[3,-11.5,18],[7,-11,15]]},
  {name:'Wolfsburg defender (marker)',role:'wob',style:wob({seed:55,build:{height:1.93}}),keys:[[-4,-14.2,4.4],[-1,-12.8,2.6],[0,-12.5,2.15],[.5,-12.2,2],[7,-11,1.6]]},
  {name:'Wolfsburg defender',role:'wob',style:wob({seed:56,skin:SKIN_D}),keys:[[-4,-7.2,2.2],[0,-6.1,1.6],[7,-5.8,1]]},
  {name:'Wolfsburg defender',role:'wob',style:wob({seed:57}),keys:[[-4,-9.2,7.4],[0,-8.1,6.2],[7,-7.6,5]]},
  {name:'Bayern',role:'fcb',style:fcb({seed:32,build:{height:1.86}}),keys:[[-4,-18,-5],[0,-15.4,3.6],[7,-13.5,4]]},
  {name:'Wolfsburg midfielder',role:'wob',style:wob({seed:58}),keys:[[-4,-17.6,8.2],[0,-15.4,9.2],[7,-14,10]]},
 ],
 kicks:[{who:2,at:-1.2,kind:'strike',foot:'r',dur:.95,power:.75,aim:[-11.2,.4]},{who:LEW,at:0,kind:'scissor',foot:'r',dur:1.15,aim:[0,-2.3]}],
 dives:[{who:GK,at:.36,side:'r',height:.7,dur:1}],
 path:[{kick:0},{kick:1,h:3.3},...netWps(.4,1.35,-2.3)]});
const GOALS=[G1,G2,G3,G4,G5];
/** the substitution: he jogs on at the halfway line (τ = 0 as he crosses the touchline); the half-time teams stand in their shape */
const GI=mk({name:'on comes',minute:46,tIn:99,bz:0,celebAt:99,
 actors:[
  {name:'Lewandowski',role:'lew',hero:true,style:LEW_ST,keys:[[-4.5,-51.2,-37.4],[-1,-51,-35.2],[0,-50.6,-34],[2,-49.4,-30.4],[4,-47.6,-26.6],[7,-45.4,-22.4]]},
  {name:'referee',role:'ref',style:REF_ST,keys:[[-4.5,-53,-6],[7,-52.5,-5]]},
  {name:'Bayern',role:'fcb',style:fcb({seed:34}),keys:[[-4.5,-50,-10],[7,-49.6,-9]]},
  {name:'Bayern',role:'fcb',style:fcb({seed:35,skin:SKIN_M}),keys:[[-4.5,-57,4],[7,-56.4,4.4]]},
  {name:'Bayern',role:'fcb',style:fcb({seed:36}),keys:[[-4.5,-61,-18],[7,-60,-17]]},
  {name:'Wolfsburg',role:'wob',style:wob({seed:59}),keys:[[-4.5,-45,-4],[7,-45.2,-3.6]]},
  {name:'Wolfsburg',role:'wob',style:wob({seed:60,skin:SKIN_D}),keys:[[-4.5,-43,12],[7,-43.4,11.6]]},
  {name:'Wolfsburg',role:'wob',style:wob({seed:61}),keys:[[-4.5,-40,-16],[7,-40.5,-15.4]]},
 ],
 kicks:[],path:[{t:-5,P:[-52.5,BALL_R,0]}]});

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the pose one drawn frame earlier (secondary
 * motion: hair and the shirt hem trail), smear = halftone echo + speed lines on fast limbs (the strikes, the volley, the slide). */
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
 footballPanels(s,g[0],g[1],r,{rot,key:K,shadow:K,seed:5});
 return{g,r,d:q[2]};
}
type Item={d:number;draw:()=>void};
type Fig={st:State;prev?:State;style:AthleteStyle;hero:boolean;smear?:boolean};
/** depth-sorts figures, the ball and the goal (far first). Heat: small figures print at `low`; inside a passage every figure is capped. */
function drawScene(s:Sheet,c:Cam,figs:Fig[],ball:{P:V3;rot:number;min?:number;prevP?:V3|null;lines?:boolean}|null,goal:{bulge:number;bz:number;post:number}|null,cap=3):{ball:{g:Pt;r:number}|null}{
 const v=view(s),items:Item[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,preview=s.arrival<PASSAGE.seam-1e-3,scr0=s._passage.screen,passing=!!s._passage.pending||preview;
 const near=figs.filter(f=>!f.hero).map(f=>toCam(c,[f.st.place.x??0,.9,f.st.place.z??0])[2]).filter(d=>d>=1).sort((a,b)=>a-b),dCap=near.length>cap?near[cap-1]:1e9;
 for(const f of figs){const q=toCam(c,[f.st.place.x??0,.9,f.st.place.z??0]);if(q[2]<1)continue;const g=scr(c,q),k=c.F/q[2]*1.8;if(Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k)continue;
  {const d=m.transformPoint(new DOMPoint(g[0],g[1])),rr=k*ppu*s.dpr;let x0=0,y0=0,x1=s.width*s.dpr,y1=s.height*s.dpr;
   if(preview&&scr0){x0=Math.max(x0,Math.min(...scr0.map(p=>p[0])));x1=Math.min(x1,Math.max(...scr0.map(p=>p[0])));y0=Math.max(y0,Math.min(...scr0.map(p=>p[1])));y1=Math.min(y1,Math.max(...scr0.map(p=>p[1])));}
   if(d.x<x0-rr||d.x>x1+rr||d.y<y0-rr||d.y>y1+rr)continue;}
  const px=k*ppu,style:AthleteStyle=passing?{...f.style,detail:'low'}:(!f.hero&&(px<120||q[2]>dCap))||px<44?{...f.style,detail:'low'}:f.style;
  items.push({d:q[2],draw:()=>{drawPlayer(s,f.st.pose,c,style,f.st.place,passing?undefined:f.prev,!!f.smear&&!passing);}});}
 let out:{g:Pt;r:number}|null=null;
 if(ball){const bq=toCam(c,ball.P);if(bq[2]>=NEAR)items.push({d:bq[2],draw:()=>{const r=drawBall(s,c,ball.P,ball.rot,ball);if(r)out={g:r.g,r:r.r};}});}
 if(goal){const gq=toCam(c,[1,1.2,0]);items.push({d:Math.max(NEAR,gq[2]),draw:()=>goal3(s,c,goal.bulge,goal.bz,goal.post)});}
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
 return{ball:out};
}
/** the pitch of play g at τ (poses on twos): every actor (heroes get prev = one drawn frame earlier), the ball, the goal */
function play(s:Sheet,c:Cam,g:Play,tau:number,tauPrev:number,o:{smear?:boolean;min?:number;lines?:boolean;prevBall?:number;only?:number[];cap?:number;goal?:boolean}={}){
 const figs:Fig[]=g.actors.flatMap((a,k)=>o.only&&!o.only.includes(k)?[]:[k]).map(k=>{const a=g.actors[k],st=stateOf(g,k,tau),hero=!!a.hero;
  return{st,prev:hero?stateOf(g,k,tauPrev):undefined,style:a.style,hero,smear:o.smear&&g.kicks.some(kk=>kk.who===k&&Math.abs(tau-kk.at)<.3)};});
 const post=g.postAt!==undefined?clamp((tau-g.postAt)/.5):0;
 return drawScene(s,c,figs,g.path.length>1||tau<99?{P:ballAt(g,tau),rot:spinAt(g,tau),min:o.min,lines:o.lines,prevP:o.prevBall!==undefined?ballAt(g,o.prevBall):null}:null,
  o.goal===false?null:{bulge:bulgeAt(g,tau),bz:g.bz,post:post>0&&post<1?post:0},o.cap);
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
const at=(g:Play,k:number,tau:number,y=1):V3=>{const[x,z]=posOf(g,k,tau);return[x,y,z];};
/** a broadcast whip: long halftone streaks across the frame (hides the montage cuts) */
function streaks(s:Sheet,amt:number,seed:number){if(amt<=.02)return;const v=view(s),p=new Path2D(),r=rng(seed);
 for(let i=0;i<16;i++){const y=(r()-.5)*2*v.hy,x0=(r()-.5)*2*v.hx,L=v.hx*(.6+r()*.9);p.addPath(ribbon([[x0-L,y],[x0+L,y+(r()-.5)*30]],14+r()*34,{seed:seed+i,taper:.8,wobble:1.5}));}
 s.tone(K,p,.6*amt);s.knockout(p,.4*amt);}

// ---------------------------------------------------------------- the goal-counter bug (top left): Bayern's chip with five ball slots, Wolfsburg's with one
function counterBug(s:Sheet,fills:number[],o:{wob?:number;show?:number;pulse?:number}={}){
 const{wob=1,show=1,pulse=0}=o;if(show<=0)return;
 const x0=-s.W/2+54,y0=-s.H/2+48,r=30,gap=70,w=2*r+5*gap+34,h=2*r+70,sc=easeOutBack(clamp(show));
 const tx=(x:number,y:number):Pt=>[x0+(x-x0)*sc,y0+(y-y0)*sc];
 const box=polyPath(blob(x0+w/2*sc,y0+h/2*sc,w/2*sc,h/2*sc,7,{amp:.03,n:22}),true);s.knockout(box,.9);s.tone(K,box,.82);
 // Bayern's red chip with the five slots (a ball printed in each as its goal goes in), Wolfsburg's green chip with its one goal
 const rc=polyPath(blob(...tx(x0+24,y0+36),14*sc,17*sc,3,{amp:.05,n:12}),true);s.fill(R,rc,.95);
 const gc=polyPath(blob(...tx(x0+24,y0+96),14*sc,17*sc,4,{amp:.05,n:12}),true);s.fill(G,gc,.95);
 const empty=new Path2D();
 fills.forEach((f,i)=>{const[cx,cy]=tx(x0+60+r+i*gap,y0+36),rr=r*sc*(f>0?.55+.45*easeOutBack(clamp(f))+.12*pulse:.8);
  if(f<=0){empty.addPath(polyPath(blob(cx,cy,rr,rr,i+2,{amp:.04,n:14}),true));return;}
  footballPanels(s,cx,cy,rr,{rot:i*1.3,key:K,shadow:K,seed:5+i});
  if(f<1)sparkBurst(s,Y,cx,cy,rr*3.2,{n:8,seed:60+i,g:easeOutBack(clamp(f*2))*(1-clamp(f*2-1)),width:Math.max(3,rr*.2)});});
 s.stroke(Y,empty,3,.7);
 if(wob>0){const[cx,cy]=tx(x0+60+r,y0+96);footballPanels(s,cx,cy,r*sc*.8*wob,{rot:.4,key:K,shadow:K,seed:4});}
}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera — the substitution, then the five-goal montage
const P1:V3=[-52.5,23,-80];
const SLOT_NUM=['One:','Two:','Three:','Four:','Five:'],SLOT_W=['toe-poke','long shot','rebound','a volley','flying volley'];
/** pre-roll τ shown for each goal (goal 3 needs its three attempts), and where the contact falls after the describing word's onset */
const PRE=[1.5,1.8,2.7,1.8,1.6],DEL=[.35,.35,.45,.3,.5];
const FOCUS:V3[]=[[-6,0,2.5],[-12,0,-3.5],[-7,0,.5],[-7,0,-4],[-8,0,3]];
const slotStart=(i:number)=>CUE(0,SLOT_NUM[i])-.3;
const contactT=(i:number)=>Math.max(CUE(0,SLOT_W[i])+DEL[i],slotStart(i)+.5);
function slotOf(t:number){let k=-1;for(let i=0;i<5;i++)if(t>=slotStart(i))k=i;return k;}
/** τ inside goal slot i: the pre-roll runs from slotStart to the contact (≥ real time), then real time */
function tauSlot(i:number,t:number){const S=slotStart(i),C=contactT(i),pre=Math.max(PRE[i],C-S);return t<C?-pre*(C-t)/(C-S):t-C;}
const tauIntro=(t:number)=>t-CUE(0,'On comes')-.2;
function cam1(t:number):Cam{
 const i=slotOf(t);
 if(i<0){const tau=tauIntro(t),L=at(GI,LEW,tau,1.2);
  return plan(t,[
   [0,0,()=>({P:P1,T:[-40,6,8],fov:44})],
   [CUE(0,'Bayern trail')-.3,1.6,()=>({P:P1,T:[-50,1,-12],fov:22})],
   [CUE(0,'On comes')-.4,1,()=>({P:P1,T:mix3(L,[-50,1,-26],.35),fov:8.5})],
   [CUE(0,'Robert')+.2,1.2,()=>({P:P1,T:L,fov:6.4})],
  ]);}
 const g=GOALS[i],tau=tauSlot(i,t),b=ballAt(g,tau),Lp=at(g,LEW,tau,1),C=contactT(i);
 const T=mix3(mix3([b[0],1,b[2]],Lp,.4),FOCUS[i],.35),fov=lerp(6.4,5.2,sm(C-.8,C,t))*(i===4?lerp(1,1.15,sm(C+1,C+2.5,t)):1);
 if(i===4&&t>C+1){const cel=at(g,LEW,tau,1.1);return cam3(P1,mix3(T,cel,sm(C+1,C+2.2,t,easeInOutSine)),fov);}
 return cam3(P1,T,fov);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tt=twos(t),i=slotOf(t);
  // the crowd roars and flashes on every goal
  let roar=0,flash=0;for(let k=0;k<5;k++){const tin=contactT(k)+GOALS[k].tIn;roar=Math.max(roar,bump(tin-.1,tin+1.6,t));flash=Math.max(flash,sm(tin,tin+.2,t)*(1-sm(tin+.8,tin+1.2,t)));}
  stadium(s,c,t,[0,1,3],{roar,flash});
  ground(s,c);
  if(i<0){const tau=tauIntro(tt);const r=play(s,c,GI,tau,tauIntro(tt-1/12),{min:7,goal:false});void r;
   // "Robert Lewandowski": a yellow ring picks him out as he runs on
   const rw=sm(CUE(0,'Robert')-.1,CUE(0,'Robert')+.4,t,easeOutBack)*(1-sm(slotStart(0)-.5,slotStart(0)-.1,t));
   if(rw>0){const[x,z]=posOf(GI,LEW,tau);groundRing(s,c,[x,0,z],1.3*rw+.2,Y,rw);}}
  else{const g=GOALS[i],tau=tauSlot(i,tt);play(s,c,g,tau,tauSlot(i,tt-1/12),{min:8,lines:true,prevBall:tauSlot(i,t-.06),cap:0});}
  // the whips between goals
  let wh=0;for(let k=0;k<5;k++)wh=Math.max(wh,1-Math.abs(t-slotStart(k))/.24);streaks(s,clamp(wh),11+i);
  // the counter: Wolfsburg's goal is already on it; each ball pops in as its goal crosses the line
  const fills=GOALS.map((g,k)=>clamp((t-(contactT(k)+g.tIn))/.5));
  counterBug(s,fills,{show:sm(CUE(0,'one–nil')-.2,CUE(0,'one–nil')+.3,t),wob:sm(CUE(0,'one–nil'),CUE(0,'one–nil')+.35,t,easeOutBack),pulse:bump(CUE(0,'Five goals')-.1,CUE(0,'nine')+.6,t)});
 },
 aperture(t){const c=cam1(t),g=GOALS[4],p=stateOf(g,LEW,tauSlot(4,twos(t))),sk=solve(p.pose,B_LEW,p.place),q=pr(c,sk.chest)??[0,0];return apertureDisc(q[0],q[1],Math.max(20,kAt(c,sk.chest)*.5),12);},
 get still(){return contactT(4)+.1;},
};

// ---------------------------------------------------------------- teaching marks (shared by the replays and the lesson)
/** a flat dashed ring on the grass */
function groundRing(s:Sheet,c:Cam,P:V3,rad:number,ink:string,a:number){
 const X=pr(c,[P[0],.01,P[2]]);if(!X||a<=0)return;const pts:Pt[]=[];for(let i=0;i<24;i++){const u=i/24*TAU,p=pr(c,[P[0]+Math.cos(u)*rad,.01,P[2]+Math.sin(u)*rad]);if(p)pts.push(p);}
 if(pts.length<8)return;const gaps:[number,number][]=[];for(let i=0;i<12;i++)gaps.push([(i+.66)/12,(i+.96)/12]);
 const d=ribbon(pts.concat([pts[0]]),Math.max(7,kAt(c,P)*.11),{seed:31,taper:0,wobble:.6,gaps});s.knockout(d,.8*a);s.fill(ink,d,.95*a);
}
/** a projected arrow (shaft + head) along 3D points, in one ink */
function arrow3(s:Sheet,c:Cam,pts:V3[],w:number,ink:string,cov=1){
 const q=pts.map(p=>pr(c,p)).filter((p):p is Pt=>!!p);if(q.length<2)return;
 const e=q[q.length-1],f=q[q.length-2],ang=Math.atan2(e[1]-f[1],e[0]-f[0]),ca=Math.cos(ang),sa=Math.sin(ang),hd=w*2.6;
 const shaft=q.slice(0,-1).concat([[e[0]-ca*hd*.7,e[1]-sa*hd*.7]]);
 const p=ribbon(shaft,w,{taper:.2,pressure:.2,wobble:.8});p.addPath(polyPath([[e[0]+ca*hd*.3,e[1]+sa*hd*.3],[e[0]-ca*hd-sa*hd*.62,e[1]-sa*hd+ca*hd*.62],[e[0]-ca*hd+sa*hd*.62,e[1]-sa*hd-ca*hd*.62]],true));
 s.knockout(p);s.fill(ink,p,cov);s.stroke(K,p,Math.max(2,w*.12),.85);
}
/** the replay trail: the ball's path over the last `span` seconds, a fading yellow ribbon */
function trail(s:Sheet,c:Cam,g:Play,tau:number,from:number,fade:number,span=1){
 if(fade<=0||tau<=from)return;const pts:Pt[]=[];const a=Math.max(from,tau-span);for(let i=0;i<=22;i++){const p=pr(c,ballAt(g,lerp(a,tau,i/22)));if(p)pts.push(p);}
 if(pts.length<3)return;const w=Math.max(7,kAt(c,ballAt(g,tau))*.14);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*fade);
}
/** a contact spark on the ball at a kick */
function hitSpark(s:Sheet,c:Cam,g:Play,tau:number,kAt0:number,seed:number){const u=(tau-kAt0)/.18;if(u<=0||u>=1)return;const P=ballAt(g,kAt0),q=pr(c,P);if(!q)return;const r=Math.max(9,kAt(c,P)*BALL_R);
 sparkBurst(s,Y,q[0],q[1],Math.max(50,r*5),{n:9,seed,g:easeOutBack(clamp(u*2))*(1-clamp((u-.5)*2)),width:Math.max(5,r*.5)});}

// ---------------------------------------------------------------- 2 · the slow-motion replay of goal 5 from a low touchline camera
const tau2=(t:number)=>key(t,mono([[0,-1.75],[CUE(1,'Mario'),-1.42],[CUE(1,'crosses'),-1.18],[CUE(1,'already'),-.72],[CUE(1,'right place'),-.46],[CUE(1,'leaps'),-.26],[CUE(1,'volleys'),.02],[CUE(1,'first time'),.3],[SECS(1)-.2,1.25]]),linear);
const E2:V3=[-13.8,1.35,-11.4];
function cam2(t:number):Cam{
 const tau=tau2(t),L=at(G5,LEW,tau,1.1),b=ballAt(G5,tau);
 return plan(t,[
  [0,0,()=>({P:E2,T:mix3(L,[-12,2,16],.35),fov:40})],
  [CUE(1,'Mario')-.3,1,()=>({P:E2,T:mix3(L,[b[0],Math.max(1,b[1]),b[2]],.45),fov:36})],
  [CUE(1,'right place')-.35,.9,()=>({P:add3(E2,[.6,-.1,1.2]),T:[L[0],1,L[2]],fov:27})],
  [CUE(1,'volleys')-.3,.7,()=>({P:add3(E2,[.8,-.05,1.4]),T:[L[0]+.8,1.1,L[2]-.2],fov:26})],
  [CUE(1,'first time')+.05,1.1,()=>({P:add3(E2,[1.6,.3,1]),T:mix3([L[0],1.2,L[2]],[0,1.3,-2.3],.62),fov:44})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tt=twos(t),tau=tau2(tt),tp=tau2(tt-1/12),rp=CUE(1,'right place'),lp=CUE(1,'leaps');
  stadium(s,c,t,[0,1,3],{roar:sm(G5.tIn,G5.tIn+.4,tau),flash:sm(G5.tIn+.05,G5.tIn+.3,tau)});
  ground(s,c);
  // "right place": a dashed yellow ring on the grass where he meets it — he is there before the ball
  const ring=sm(rp-.15,rp+.3,t,easeOutBack)*(1-sm(SECS(1)-1.2,SECS(1)-.8,t));const[lx,lz]=posOf(G5,LEW,0);groundRing(s,c,[lx,0,lz],1.2,Y,ring);
  trail(s,c,G5,tau,-1.2,1-sm(.45,.8,tau),1.2);
  const r=play(s,c,G5,tau,tp,{smear:true,min:9,cap:2});void r;
  // "leaps": a spark under his take-off
  const lpw=sm(lp-.1,lp+.25,t)*(1-sm(lp+.5,lp+.9,t));if(lpw>0){const q=pr(c,[lx,.02,lz]);if(q)sparkBurst(s,Y,q[0],q[1],Math.max(60,kAt(c,[lx,0,lz])*.8)*lpw,{n:9,seed:41,g:easeOutBack(lpw),width:10});}
  hitSpark(s,c,G5,tau,0,17);
 },
 aperture(t){const c=cam2(t),P=ballAt(G5,tau2(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(16,c.F*BALL_R/q[2]*1.4),12);},
 get still(){return CUE(1,'volleys')+.1;},
};

// ---------------------------------------------------------------- 3 · a second replay: goal 1 from high behind the goal
const tau3=(t:number)=>key(t,mono([[0,-1.55],[CUE(2,'simple'),-1.1],[CUE(2,'close to goal'),-.6],[CUE(2,'quick poke'),-.05],[CUE(2,'and in'),.3],[SECS(2),1.3]]),linear);
const E3:V3=[6.5,6.2,-6.5];
function cam3v(t:number):Cam{
 const tau=tau3(t),L=at(G1,LEW,tau,1);
 return plan(t,[
  [0,0,()=>({P:E3,T:[-7.5,.8,5],fov:34})],
  [CUE(2,'close')-.3,1,()=>({P:E3,T:mix3(L,[-4,.5,0],.4),fov:24})],
  [CUE(2,'and in')-.2,1,()=>({P:add3(E3,[-.5,-.4,-.5]),T:[-3,.8,-1.2],fov:28})],
 ]);
}
/** the six-yard box outline lit on the grass */
function sixYard(s:Sheet,c:Cam,a:number){if(a<=0)return;const pts:V3[]=[[0,.02,-9.16],[-5.5,.02,-9.16],[-5.5,.02,9.16],[0,.02,9.16]];
 const q=pts.map(p=>pr(c,p)).filter((p):p is Pt=>!!p);if(q.length<4)return;const w=Math.max(7,kAt(c,[-5.5,0,0])*.16);const r=ribbon(q,w,{seed:71,taper:0,wobble:.8,pressure:.2});
 s.knockout(r,.85*a);s.fill(Y,r,.95*a);const fill=polyPath(q,true);s.tone(Y,fill,.22*a);}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tt=twos(t),tau=tau3(tt),tp=tau3(tt-1/12),cl=CUE(2,'close'),ai=CUE(2,'and in');
  stadium(s,c,t,[2,3],{roar:sm(G1.tIn,G1.tIn+.4,tau),flash:sm(ai,ai+.3,t)});
  ground(s,c);
  sixYard(s,c,sm(cl-.15,cl+.3,t)*(1-sm(SECS(2)-1,SECS(2)-.7,t)));
  trail(s,c,G1,tau,-.8,1-sm(.5,.9,tau),.9);
  play(s,c,G1,tau,tp,{smear:true,min:9,cap:2,lines:true,prevBall:tau3(t-.06)});
  hitSpark(s,c,G1,tau,0,23);
 },
 aperture(t){const c=cam3v(t),p=stateOf(G1,LEW,tau3(twos(t))),sk=solve(p.pose,B_LEW,p.place),q=pr(c,sk.chest)??[0,0];return apertureDisc(q[0],q[1],Math.max(24,kAt(c,sk.chest)*.45),12);},
 get still(){return CUE(2,'quick poke')+.2;},
};

// ---------------------------------------------------------------- 4 · the lesson on goal 2: low behind him — ready, the space, one touch, the straight line
const tau4=(t:number)=>key(t,mono([[0,-2.2],[CUE(3,'stay ready'),-1.85],[CUE(3,'right place'),-1.25],[CUE(3,'quick'),-.5],[CUE(3,'simple'),.02],[SECS(3),.9]]),linear);
function cam4v(t:number):Cam{
 const tau=tau4(t),L=at(G2,LEW,tau,1);
 return plan(t,[
  [0,0,()=>({P:[-27,2.1,-6.8],T:mix3(L,[-12,1,0],.25),fov:40})],
  [CUE(3,'stay ready')-.25,.8,()=>({P:[-25.8,1.6,-5.6],T:[L[0],.9,L[2]],fov:24})],
  [CUE(3,'right place')-.2,.9,()=>({P:[-26.5,2.2,-6.4],T:mix3(L,[-16,.8,.5],.35),fov:34})],
  [CUE(3,'quick')-.2,.8,()=>({P:[-25.4,1.7,-5.4],T:mix3(L,[0,1,2.8],.25),fov:32})],
  [CUE(3,'simple')+.1,1,()=>({P:[-25.4,2,-5.4],T:mix3(L,[0,1.1,2.8],.55),fov:42})],
 ]);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tt=twos(t),tau=tau4(tt),tp=tau4(tt-1/12),E=SECS(3),sr=CUE(3,'stay ready'),rp=CUE(3,'right place'),qk=CUE(3,'quick'),si=CUE(3,'simple');
  stadium(s,c,t,[0,1,3],{roar:.3+.6*sm(G2.tIn,G2.tIn+.4,tau),flash:sm(G2.tIn+.05,G2.tIn+.3,tau)*(1-sm(E-.9,E-.5,t))});
  ground(s,c);
  const[lx,lz]=posOf(G2,LEW,tau);
  // "stay ready": springy yellow arcs under his feet as he bounces on his toes
  const rd=sm(sr-.1,sr+.3,t)*(1-sm(rp,rp+.4,t));
  if(rd>0){const b=.5+.5*Math.sin(tt*TAU*1.6);for(const k of[0,1]){const pts:Pt[]=[];for(let i=0;i<=10;i++){const a=Math.PI*i/10,p=pr(c,[lx+Math.cos(a)*(.5+.25*k),.08+(.25+.18*k)*Math.sin(a)*(.6+.4*b),lz]);if(p)pts.push(p);}
   if(pts.length>4){const rr=ribbon(pts,Math.max(5,kAt(c,[lx,0,lz])*.05),{seed:80+k,taper:.6,wobble:.6});s.knockout(rr,.8*rd);s.fill(Y,rr,.95*rd);}}}
  // "right place": the space between two defenders — a ring on his spot
  const rpw=sm(rp-.15,rp+.3,t,easeOutBack)*(1-sm(qk+.2,qk+.6,t));const[sx,sz]=posOf(G2,LEW,-.55);groundRing(s,c,[sx,0,sz],1.25,Y,rpw);
  // "simple": the straight line from the ball to the corner, drawn before he hits it
  const sw=sm(si-.3,si+.2,t)*(1-sm(E-1,E-.6,t));
  if(sw>0){const B0=ballAt(G2,0),pts:V3[]=[];for(let i=0;i<=8;i++){const u=i/8*sw;pts.push([lerp(B0[0],0,u),lerp(.15,.45,u),lerp(B0[2],2.85,u)]);}arrow3(s,c,pts,Math.max(7,kAt(c,B0)*.07),Y,.95);}
  play(s,c,G2,tau,tp,{smear:true,min:9,cap:3,lines:true,prevBall:tau4(t-.06)});
  // "quick": one set touch — a spark on it
  hitSpark(s,c,G2,tau,-.55,31);hitSpark(s,c,G2,tau,0,32);
 },
 get still(){return CUE(3,'simple')+.3;},
};

const film:RisoStory={
 id:'lewandowski-five-2015',format:'11v11',title:"Lewandowski's five in nine minutes",
 theme:'Strikers stay ready: be in the right place and keep your finish quick and simple',
 ageNote:'Bayern Munich 5–1 VfL Wolfsburg, Bundesliga, Allianz Arena, Munich, 22 September 2015. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',green:'#00a95c',navy:'#22366b'},order:['yellow','red','green','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a quick finish — a ball flicked away off the touch point with a yellow contact spark. Reduced motion: the spark. */
 touch(s,x,y,age,seed){
  const r=rng(seed);if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}
  if(age<.35)sparkBurst(s,Y,x,y,110,{n:9,seed:seed+1,g:easeOutBack(clamp(age/.12))*(1-clamp((age-.2)/.15)),width:14});
  const u=easeOut(clamp(age/.5)),fade=1-clamp((age-.45)/.2);if(fade>0)footballPanels(s,x+260*u,y-60*u+40*u*u,28,{rot:age*18+r()*TAU,key:K,shadow:K,seed:5});
 },
};
export default film;
/** Solved facts (pitch metres; Wolfsburg's goal line x = 0, +z = Bayern's right) — checked by tests/play-film-lewandowski-five-2015.cjs. */
export const FACTS={GOALS:GOALS.map(g=>({name:g.name,minute:g.minute,tIn:g.tIn,postAt:g.postAt,kicks:g.kicks.map(k=>({who:k.who,at:k.at,kind:k.kind,foot:k.foot})),
 ballAt:(tau:number)=>ballAt(g,tau),
 bootAt:(k:number,tau:number)=>{const kk=g.kicks[k],st=stateOf(g,kk.who,tau),sk=solve(st.pose,g.actors[kk.who].style.build??{},st.place);return{lToe:sk.lToe,rToe:sk.rToe,air:st.pose.air};},
 gloveAt:(tau:number)=>{const st=stateOf(g,GK,tau),sk=solve(st.pose,BEN_ST.build,st.place);return{lHa:sk.lHa,rHa:sk.rHa};},
 dives:g.dives.map(d=>({at:d.at,side:d.side})),actor:(k:number)=>g.actors[k].name})),
 LEW_NUMBER:9};
