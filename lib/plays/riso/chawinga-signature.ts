/** Temwa Chawinga's signature — the sprint and finish. The moment: Bay FC 0–1 Kansas City Current, NWSL regular season (round 24),
 * PayPal Park, San Jose, California, Saturday 12 October 2024 (kick-off 9:00 p.m. CDT = 7:00 p.m. local): her 34th/35th-minute winner, her
 * 19th league goal of 2024, which broke Sam Kerr's NWSL single-season record of 18 (2019).
 * An iconic-play riso film (RisoStory, chapters mode): a 1:1 reconstruction from WRITTEN accounts (the footage itself was not reviewed),
 * printed as a riso sheet.
 *
 * WHY THIS MOMENT: iconicPlays.json gives Chawinga a signature, not a match ("the sprint and finish", centre, one defender beaten; lesson
 * "Use your speed to get goal-side, then pick your corner"). Her best-documented 2024 goal is this one, the record-breaker, and the written
 * account is precise: she "dispossessed the opposition's midfielder, rode off the physical challenge and blasted a rocket into the back of
 * the net from outside the box" (The Equalizer). Her speed wins the ball, her strength keeps her goal-side of the beaten midfielder, and
 * she finishes from distance — the sprint and the finish in four seconds, on the night she set the record. Her coach, Vlatko Andonovski,
 * said teams had begun to close down "the area where she gets most of her chances. So we spent a little bit of time working on getting
 * shots from distance ... and she ran out and hit a bomb."
 *
 * SOURCES (Sept 2026, read as raw pages with curl, cached under the build scratchpad films/src-cache/):
 *  - The Equalizer (Bella Munson), "Temwa Chawinga sets new NWSL single-season scoring record" (13 Oct 2024)
 *    https://equalizersoccer.com/2024/10/13/temwa-chawinga-sets-new-nwsl-single-season-scoring-record-19-goals/ ("Chawinga scored 35
 *    minutes into a tightly contested matchup against expansion side Bay FC when she dispossessed the opposition's midfielder, rode off
 *    the physical challenge and blasted a rocket into the back of the net from outside the box"; "the game-winning incident"; Lo'eau
 *    LaBonta "trying to count all of her teammate's goals on her fingers"; Andonovski's quotes above; Kerr's 18 in 2019)
 *  - Wikipedia (raw wikitext), "2024 Kansas City Current season": the match box (12 Oct 2024, 9:00 p.m. CDT, round 24, Bay FC 0–1 Kansas
 *    City Current, Chawinga 34', PayPal Park, San Jose, referee Danielle Chesky; yellow cards Hocking 33', Oshoala 35', Mace 40') and the
 *    2024 kit templates (home: red shirt, red shorts, teal socks; away: a TEAL shirt with white sleeves, teal shorts, teal socks)
 *  - Wikipedia (raw wikitext), "Temwa Chaŵinga" (1.73 m; club number 6; 19th goal of the season in a 1–0 win over Bay FC on 12 Oct 2024,
 *    breaking Kerr's record of 18; 20 goals, the Golden Boot and the MVP in 2024), "Kansas City Current" (the same 2024 kit templates) and
 *    "Bay FC" (club colours: "Bay" navy blue and "Poppy" warm red; a navy home kit)
 * CONFIRMED by those accounts: the date, kick-off time, ground, round, referee and result (Bay FC 0–1 KC Current); the goal around the 34th
 * to 35th minute at 0–0, the only goal of the game; that it was her 19th of the season and broke the record of 18; that she took the ball off
 * a Bay FC MIDFIELDER, rode off a physical challenge and scored with a powerful shot from OUTSIDE the box; LaBonta counting the goals on her
 * fingers in the celebration; Chawinga's number 6 and 1.73 m.
 * INFERRED (illustrative reconstruction): which kit each side wore that night (drawn: KC in the 2024 teal away kit — a flat blue screen,
 * the white sleeves not printed — and Bay FC in navy with poppy-red trim); which midfielder it was (not named in the account; the film never
 * names her), how she lost it (drawn: a pass out from a centre-back, a heavy first touch, Chawinga sprinting in from behind and poking it
 * away with her RIGHT foot); the shove (drawn: from the midfielder on her left, both arms); every spot, speed and touch count (the steal
 * ≈ 29 m from goal in the centre, the shot ≈ 22 m out, just left of centre from her view); her shooting foot (drawn RIGHT); the corner
 * (drawn high, to the keeper's right) and the keeper's dive (Bay FC's keeper is not named; keeper kit drawn yellow); the direction of play
 * (KC drawn attacking left to right on the main camera); PayPal Park as drawn (four single-tier stands close to the pitch, a canopy on the
 * two side stands, floodlights on the canopy edges, a dark October evening sky — sunset in San Jose is ≈ 6:40 p.m., so a 7 p.m. kick-off
 * is played under lights by the 35th minute); the crowd colours with a small KC corner; hair styles (drawn tied back) and skin screens;
 * the referee's kit; the TV camera positions and lenses. None of the inferred details is named in the narration.
 *
 * FRAMING (the TV broadcast, never top-down; full-sheet card window 1.45:1 down to square, never sheet.safe): 1 = the high main-stand camera,
 * near real time: the pass out, her sprint, the steal, the shove, the run and the rocket; 2 = slow-motion replay from a low camera behind
 * her right shoulder: her yellow sprint trail, the spark as she nicks the ball, the red ring and shove arrow on the midfielder, a yellow
 * ring as she stays strong, then the GOAL-SIDE line (midfielder → Chawinga → goal); 3 = replay from behind Bay FC's goal: the target corner
 * ringed, her right boot, the rocket's trail over the dive, the net bulge, then the pan to LaBonta counting on her fingers; 4 = the lesson
 * from a raised coaching angle (speed trail → goal-side line → pick your corner: the wedge, the ring and the shot). Every body is the shared
 * riso athlete (lib/plays/riso/athlete.ts) through ONE adapter, drawPlayer(): women's builds (1.6–1.78 m, slimmer bulk) with tied-back hair
 * that swings through `prev`. Handedness: the world is right-handed exactly like athlete.ts (x toward Bay FC's goal, y up, +z = KC's right
 * = the near touchline under the main-stand camera), so strike({foot:'r'}) is her RIGHT foot. Scenes read only (t, c); every action keys
 * off cue times, so the recorded voice (withTiming) re-times the film; every random value is seeded. Heat: small figures print at 'low',
 * only the named figures at full detail, everything capped in a passage. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,rectPath,partial,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow,footballPanels} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,runCycle,backpedal,lunge,strike,keeperSet,keeperDive,celebrate,stand,posed,blendPose,
 type Pose,type AthleteStyle,type InkFill,type Place,type Projector,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets (every cue starts with a plain word,
 * never a contraction or a hyphenated one); their `at` and each chapter's `seconds` are ESTIMATES until the Kokoro voice exists. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The goal, live',text:'San Jose, 2024. Kansas City against Bay FC. Temwa Chawinga needs one more goal for the record. She steals the ball, rides the tackle, races on... and shoots from outside the box. What a rocket!',tail:2.2,
  cues:['San Jose','Kansas City','Temwa','one more','She steals','rides the','races on','shoots from','What a rocket']},
 {label:'Goal-side',text:'Watch again. She sprints in and nicks the ball away. The midfielder pushes, but Chawinga stays strong. Now she is goal-side.',tail:1.4,
  cues:['Watch again','sprints in','nicks the','midfielder pushes','stays strong','Now she']},
 {label:'Pick your corner',text:'From outside the box, she picks her corner and strikes. It rockets into the net: goal nineteen, a new NWSL record!',tail:2.2,
  cues:['From outside','picks her','strikes','rockets into','goal nineteen','new NWSL']},
 {label:'Your turn',text:'Your turn: use your speed to get goal-side, then pick your corner.',tail:1.8,
  cues:['Your turn','use your','speed','get goal','pick your corner']},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py chawinga-signature, which writes timing.json next to script.json. Then add
 *   import timingJson from '../../../public/plays/narration/chawinga-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/chawinga-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (calibrated on the voiced films, ≈ 2.6 words/s): .2 s + .02 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.2+.02*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.16;if(/[.!?]$/.test(w))t+=.3;if(/\.\.\.$/.test(w))t+=.2;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('chawinga: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('chawinga: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
/** key() needs increasing times: push each key at least `gap` after the previous one (real voice timings can crowd authored offsets) */
function mono(K:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of K)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}

// ---------------------------------------------------------------- inks, small helpers
const Y='yellow',R='red',B='blue',K='navy';
const lerp3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const wrapA=(a:number)=>{a=(a+Math.PI)%TAU;if(a<0)a+=TAU;return a-Math.PI;};
const lerpA=(a:number,b:number,u:number)=>a+wrapA(b-a)*clamp(u);
/** heading of a ground direction as an athlete yaw (yaw 0 faces +X, + turns left toward −Z) */
const yawOf=(dx:number,dz:number)=>Math.atan2(-dz,dx);
/** a smooth bump 0 → 1 → 0 over [a, b] */
const bump=(a:number,b:number,t:number)=>t<=a||t>=b?0:Math.sin(Math.PI*(t-a)/(b-a));
/** The film plays inside the player card's picture window (~1566 × 1080 units): world (x,y) on the CANVAS centre at z0 units per world unit
 * (the engine's arrival scale is kept, so passages and seams behave exactly as in the stories). Full-sheet framing, never sheet.safe. */
function cam(s:Sheet,x:number,y:number,z0:number,r=0){const z=z0*Math.min(1,Math.pow(s.W/1566,.75)),k=z*s.arrival;s.camera(x-(s.W/2-s.cx)/k,y-(s.H/2-s.cy)/k,z/s.fit,r);return z;}
type View={hx:number;hy:number};
const view=(s:Sheet,z:number):View=>({hx:s.W/(2*z*.68)+60,hy:s.H/(2*z*.68)+60});
/** a narrower (square) window gets a slightly wider lens so the action still fits; set by frame(), read by every camera */
let LENS=1;
const frame=(s:Sheet)=>{LENS=Math.pow(Math.min(1,s.W/1620),.45);return view(s,cam(s,0,0,1));};

// ---------------------------------------------------------------- the TV camera: a right-handed 3D projection of the pitch
/** Pitch metres (right-handed, like athlete.ts): X along the length (KC attack +X; Bay FC's goal line at 105), Y up, Z across
 * (0 = the middle, +34 = the near touchline under the main-stand camera = KC's right). */
type Cam=Projector&{C:V3;F:number;f:V3;r:V3;u:V3};
const NEAR=.4;
const sub3=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const add3=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const nrm3=(a:V3):V3=>{const l=Math.hypot(a[0],a[1],a[2])||1;return[a[0]/l,a[1]/l,a[2]/l];};
const cross3=(a:V3,b:V3):V3=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
/** a camera at C looking at T with focal length F (sheet units, scaled by the window's LENS); +screen x = cross(forward, up) */
function look(C:V3,T:V3,F0:number):Cam{const F=F0*LENS,f=nrm3(sub3(T,C)),r=nrm3(cross3(f,[0,1,0])),u=cross3(r,f);
 return{C,F,f,r,u,eye:C,
  project(p:V3):[number,number,number]{const d=sub3(p,C),z=Math.max(NEAR,dot3(d,f));return[F*dot3(d,r)/z,-F*dot3(d,u)/z,z];},
  scale(p:V3){return F/Math.max(NEAR,dot3(sub3(p,C),f));}};}
function toCam(c:Cam,P:V3):V3{const d=sub3(P,c.C);return[dot3(d,c.r),dot3(d,c.u),dot3(d,c.f)];}
const scr=(c:Cam,q:V3):Pt=>[c.F*q[0]/q[2],-c.F*q[1]/q[2]];
function pr(c:Cam,P:V3):Pt|null{const q=toCam(c,P);return q[2]<NEAR?null:scr(c,q);}
/** project a polygon, clipped against the near plane */
function polyP(c:Cam,pts:V3[]):Pt[]{const q=pts.map(p=>toCam(c,p)),out:V3[]=[];
 for(let i=0;i<q.length;i++){const a=q[i],b=q[(i+1)%q.length],ia=a[2]>=NEAR,ib=b[2]>=NEAR;if(ia)out.push(a);if(ia!==ib){const k=(NEAR-a[2])/(b[2]-a[2]);out.push([a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,NEAR]);}}
 return out.map(p=>scr(c,p));}
const addPoly=(p:Path2D,q:Pt[])=>{if(q.length>2)p.addPath(polyPath(q,true));};
/** a 3D segment as a projected quad (near-clipped); width in metres */
function seg3(c:Cam,a:V3,b:V3,wm:number,out:Path2D,minW=1.1){let qa=toCam(c,a),qb=toCam(c,b);if(qa[2]<NEAR&&qb[2]<NEAR)return;
 const cut=(p:V3,q:V3):V3=>{const k=(NEAR-p[2])/(q[2]-p[2]);return[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k,NEAR];};if(qa[2]<NEAR)qa=cut(qa,qb);else if(qb[2]<NEAR)qb=cut(qb,qa);
 const A=scr(c,qa),Bp=scr(c,qb),wa=Math.max(minW,c.F*wm/qa[2]/2),wb=Math.max(minW,c.F*wm/qb[2]/2),dx=Bp[0]-A[0],dy=Bp[1]-A[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 out.moveTo(A[0]+nx*wa,A[1]+ny*wa);out.lineTo(Bp[0]+nx*wb,Bp[1]+ny*wb);out.lineTo(Bp[0]-nx*wb,Bp[1]-ny*wb);out.lineTo(A[0]-nx*wa,A[1]-ny*wa);out.closePath();}
const inView=(v:View,p:Pt,m=0)=>Math.abs(p[0])<v.hx+m&&Math.abs(p[1])<v.hy+m;

// ---------------------------------------------------------------- PayPal Park on an October evening, under the lights (all inferred)
/** stand planes (a along, b up the rake 0..1): 0 the far side (−z), 1 behind KC's own goal (x < 0), 2 the main stand (+z, the camera
 * side), 3 behind Bay FC's goal (x > 105). A compact soccer ground: single-tier stands close to the pitch; canopies on the two side stands. */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-8,113,a),16*b,-39-18*b],
 (a,b)=>[-8-18*b,14*b,lerp(40+10*b,-40-10*b,a)],
 (a,b)=>[lerp(113,-8,a),16*b,39+18*b],
 (a,b)=>[113+18*b,14*b,lerp(-40-10*b,40+10*b,a)],
];
const STAND_COLS=[100,64,100,64],STAND_ROWS=[11,9,11,9],CANOPY=[true,false,true,false];
/** floodlight banks along the canopy edges (stand, a) */
const LIGHTS:[number,number][]=[[0,.12],[0,.34],[0,.56],[0,.78],[2,.14],[2,.4],[2,.66],[2,.88]];
/** the canopy's front lip over a side stand */
const lip=(S:(a:number,b:number)=>V3,a:number):V3=>{const p=S(a,.55);return[p[0],S(a,1)[1]+5,p[2]];};
function stadium(s:Sheet,c:Cam,v:View,t:number,which:number[],o:{roar?:number}={}){
 const{roar=0}=o,tt=twos(t);
 // a dark October evening sky: navy over blue, a faint glow over the lit bowl near the horizon
 s.tone(K,rectPath(-1e4,-1e4,2e4,2e4),.72);s.tone(B,rectPath(-1e4,-1e4,2e4,2e4),.4);
 const hz=pr(c,add3(c.C,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz)s.tone(B,polyPath([[-1e4,hz[1]+80],[1e4,hz[1]+80],[1e4,hz[1]-260],[-1e4,hz[1]-260]],true),.3);
 const planes=new Path2D(),roof=new Path2D(),edge=new Path2D();
 for(const i of which){const S=STANDS[i];addPoly(planes,polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]));
  if(CANOPY[i]){addPoly(roof,polyP(c,[add3(S(0,1),[0,1.2,0]),add3(S(1,1),[0,1.2,0]),lip(S,1),lip(S,0)]));seg3(c,lip(S,0),lip(S,1),.6,edge);}}
 // seats in the dark: blue under a navy screen
 s.knockout(planes);s.tone(B,planes,.55);s.tone(K,planes,.5);
 // the crowd: navy, poppy red and paper for Bay FC, a small teal (blue) corner for the KC fans; the roar lifts the KC corner
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si],rows=STAND_ROWS[si];for(let j=0;j<rows;j++){const b=(j+.5)/rows;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,19);if(h<.22)continue;const a=(i+.5+(hash(i+j*31,9)-.5)*.6)/cols,q=toCam(c,S(a,b));if(q[2]<NEAR+3)continue;
   const p=scr(c,q);if(!inView(v,p))continue;const z=clamp(c.F*.6/q[2],2.4,16),kc=si===3&&a>.72,lift=roar>0&&kc?roar*z*1.4*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const ink=kc?(h<.8?2:0):h<.4?0:h<.72?1:h<.9?3:2;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.8);s.fill(R,inks[1],.9);s.knockout(inks[2],.8);s.fill(B,inks[2],.8);s.fill(K,inks[3],.9);
 s.knockout(roof);s.fill(K,roof,.9);s.knockout(edge,.55);
 // floodlights: a paper halo and a hot yellow core on each bank
 const halo=new Path2D(),core=new Path2D();
 for(const[si,a] of LIGHTS){if(!which.includes(si))continue;const P=add3(lip(STANDS[si],a),[0,.6,0]),q=toCam(c,P);if(q[2]<NEAR+2)continue;const g=scr(c,q),r=clamp(c.F*2.6/q[2],6,90);if(!inView(v,g,r))continue;
  halo.addPath(polyPath(blob(g[0],g[1],r,r*.8,si*10+Math.round(a*50),{amp:.06,n:18}),true));core.rect(g[0]-r*.42,g[1]-r*.18,r*.84,r*.36);}
 s.knockout(halo,.45);s.tone(Y,halo,.35);s.knockout(core,.95);s.fill(Y,core,.9);
}
/** floodlit grass with mowing stripes, navy boards, paper lines, both goals (Bay FC's drawn later when the camera is behind it) */
function ground(s:Sheet,c:Cam,o:{bulge?:number;ballZ?:number;goalLater?:boolean}={}){
 const sr=polyP(c,[[-9,0,-39],[114,0,-39],[114,0,39],[-9,0,39]]);if(sr.length<3)return;const srp=polyPath(sr,true);s.knockout(srp);s.fill(Y,srp,.75);s.tone(B,srp,.9);s.tone(K,srp,.3);
 const g=polyP(c,[[-3,0,-36.5],[108,0,-36.5],[108,0,36.5],[-3,0,36.5]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.92);s.tone(B,gp,.82);s.tone(K,gp,.08);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[k*5.25,0,-34],[(k+1)*5.25,0,-34],[(k+1)*5.25,0,34],[k*5.25,0,34]]));s.tone(K,st,.12);
 // the boards: navy with poppy-red panels (no lettering)
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([-4,0,-37.2],[109,0,-37.2]);board([109,0,-37],[109,0,37]);board([-4,0,37],[-4,0,-37]);board([109,0,37.2],[-4,0,37.2]);
 for(let k=0;k<18;k++){const x=-2+k*6.2;addPoly(pn,polyP(c,[[x,.3,-37.15],[x+2.6,.3,-37.15],[x+2.6,.62,-37.15],[x,.62,-37.15]]));}
 for(let k=0;k<11;k++){const z=-34+k*6.4;addPoly(pn,polyP(c,[[108.95,.3,z],[108.95,.3,z+2.6],[108.95,.62,z+2.6],[108.95,.62,z]]));}
 s.knockout(bd);s.fill(K,bd,.9);s.knockout(pn,.85);s.fill(R,pn,.85);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.12,ln);
 for(let k=0;k<8;k++){L([k*13.125,0,-34],[(k+1)*13.125,0,-34]);L([k*13.125,0,34],[(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){const z0=-34+k*17,z1=z0+17;L([105,0,z0],[105,0,z1]);L([0,0,z0],[0,0,z1]);L([52.5,0,z0],[52.5,0,z1]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(52.5,0,9.15);
 for(const [gx,d] of [[105,-1],[0,1]] as [number,number][]){const bx=gx+d*16.5,sx=gx+d*5.5;L([gx,0,-20.16],[bx,0,-20.16]);L([bx,0,-20.16],[bx,0,20.16]);L([bx,0,20.16],[gx,0,20.16]);L([gx,0,-9.16],[sx,0,-9.16]);L([sx,0,-9.16],[sx,0,9.16]);L([sx,0,9.16],[gx,0,9.16]);
  const a=Math.acos(5.5/9.15);circ(gx+d*11,0,9.15,d<0?Math.PI-a:-a,d<0?Math.PI+a:a,10);circ(gx+d*11,0,.1,0,TAU,6);}
 circ(105,-34,1,Math.PI/2,Math.PI,4);circ(105,34,1,Math.PI,Math.PI*1.5,4);
 s.knockout(ln);
 const pole=new Path2D(),flag=new Path2D();for(const z of[-34,34]){seg3(c,[105,0,z],[105,1.55,z],.05,pole);addPoly(flag,polyP(c,[[105,1.55,z],[105,1.2,z],[104.55,1.38,z]]));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(Y,flag,.95);
 goal3(s,c,0,-1,0,0);
 if(!o.goalLater)goal3(s,c,105,1,o.bulge??0,o.ballZ??-3);
}
/** a goal at X: posts at z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out around bz */
function goal3(s:Sheet,c:Cam,X:number,d:number,bulge:number,bz:number){
 const z0=-3.66,z1=3.66,H=2.44,back=(z:number,y:number)=>X+d*(2+bulge*.8*Math.exp(-Math.pow((z-bz)/1.6,2))*(.4+.6*y/1.9));
 const zs=[z0,-2.6,-1.3,0,1.8,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0,1.9),1.9,z0],[back(z0,0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1,1.9),1.9,z1],[back(z1,0),0,z1]],
  [[X,H,z0],[X,H,z1],...zs.slice().reverse().map(z=>[back(z,1.9),1.9,z] as V3)],
  [...zs.map(z=>[back(z,0),0,z] as V3),...zs.slice().reverse().map(z=>[back(z,1.9),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.3);
 const mesh=new Path2D();
 for(let i=0;i<=12;i++){const z=lerp(z0,z1,i/12);seg3(c,[X,H,z],[back(z,1.9),1.9,z],.025,mesh,.7);seg3(c,[back(z,1.9),1.9,z],[back(z,0),0,z],.025,mesh,.7);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<zs.length-1;i++)seg3(c,[back(zs[i],y),y,zs[i]],[back(zs[i+1],y),y,zs[i+1]],.025,mesh,.7);seg3(c,[X,y*H/1.9,z0],[back(z0,y),y,z0],.025,mesh,.7);seg3(c,[X,y*H/1.9,z1],[back(z1,y),y,z1],.025,mesh,.7);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+d*2*u,H-.54*u,z0],[X+d*2*u,H-.54*u,z1],.025,mesh,.7);}
 s.fill(K,mesh,.72);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.19,fo);seg3(c,[X,0,z1],[X,H,z1],.19,fo);seg3(c,[X,H,z0],[X,H,z1],.19,fo);s.stroke(K,fo,2.5,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- kits (athlete styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.3],[B,.08]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.22]];
/** women's footballers: a lighter frame than the default 1.8 m build, just as athletic */
const W_BUILD=(height:number,bulk=.9)=>({height,bulk,head:.97});
/** Kansas City Current, the 2024 away kit: teal (a flat blue screen) shirt, shorts and socks (the white sleeves are not printed); red trim,
 * navy numbers — which kit was worn that night is inferred */
const KC=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[B,.58],shorts:[B,.58],socks:[B,.58],boots:K,skin:SKIN_M,hair:K,line:K,trim:R,numberInk:K,number:null,hairStyle:'ponytail',build:W_BUILD(1.68),shade:[K,.3],...o});
/** Bay FC in navy with poppy-red trim, paper numbers (inferred) */
const BAY=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[K,.92],shorts:[K,.92],socks:[K,.92],boots:K,skin:SKIN_L,hair:K,line:K,trim:[R,.95],numberInk:'paper',number:null,hairStyle:'ponytail',build:W_BUILD(1.68),shade:[B,.3],...o});
/** Temwa Chawinga, number 6 (confirmed), 1.73 m (confirmed); dark hair tied back (inferred) */
const TEM_ST=KC({number:6,skin:SKIN_D,hair:K,build:W_BUILD(1.73,.93),seed:6});
/** Bay FC's keeper (not named): kit inferred (yellow) */
const GK_ST:AthleteStyle={shirt:[Y,.95],shorts:[Y,.95],socks:[Y,.95],boots:K,skin:SKIN_L,hair:[Y,.7],hairStyle:'ponytail',line:K,gloves:'paper',sleeves:'long',trim:K,number:1,numberInk:K,build:W_BUILD(1.75,.95),seed:1};
/** Danielle Chesky: the referee's kit inferred (black-ish: a navy shirt and shorts, a yellow trim) */
const REF:AthleteStyle={shirt:[K,.75],shorts:[K,.9],socks:[K,.9],boots:K,skin:SKIN_L,hair:[Y,.75],hairStyle:'ponytail',line:K,trim:Y,build:W_BUILD(1.7),seed:12};

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete: fluid FK body, kit inks, halftone shade, key line).
 * prev = the pose one drawing earlier (secondary motion: ponytails and hem trail); smear = a halftone echo + speed lines for fast limbs. */
function drawPlayer(s:Sheet,pose:Pose,camera:Projector,style:AthleteStyle,place:Place,o:{prev?:Pose;smear?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{threshold:10});
 return drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev}:{});
}

// ---------------------------------------------------------------- the players: keyframed tracks (τ = seconds after Chawinga nicks the ball)
type Role='tem'|'kc'|'bay'|'mid'|'gk'|'ref';
/** a keyed move: lunge (full reach at `at`), a keeper dive (full stretch at `at`), a strike (contact at `at`) */
type Move={kind:'lunge'|'dive'|'strike';at:number;dur:number;side:'l'|'r';power?:number};
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];moves?:Move[];key?:boolean};
/** the pass out (Bay FC centre-back → the midfielder), its arrival, the steal (τ 0), the shove, the shot, the ball in the net */
const PASS=-2.2,RCV=-1.2,SHOVE=.4,SHOT=2.35,IN_NET=SHOT+.72;
/** Positions are Hermite-interpolated between keys [τ, X, Z]; the named beats follow the account, every spot is inferred. */
const ACTORS:Actor[]=[
 {name:'Chawinga',role:'tem',style:TEM_ST,key:true,keys:[[-6,59.6,13.6],[-3.2,63.2,12.4],[-2.2,64.8,11.6],[-1.5,67.2,10],[-.75,71.2,6.9],[0,74.9,3.9],[.4,77.1,3],[.85,78.9,2.1],[1.35,80.6,1.2],[1.85,82,.55],[2.1,82.6,.35],[SHOT,83,.25],[2.7,83.5,.3],[3.3,84.4,1],[4.3,86,3.5],[5.5,88,7.5],[6.6,89.2,10.5],[7.4,89.6,11.4],[10,89.7,11.6]]},
 {name:'midfielder',role:'mid',style:BAY({build:W_BUILD(1.66),seed:21}),key:true,keys:[[-6,80.2,.6],[-4,79.5,1],[-2.2,77.6,1.8],[RCV,76.8,2.2],[-.5,76.5,2.3],[0,76.4,2.4],[SHOVE,76.7,2.35],[.85,77.9,2.2],[1.35,79,2],[1.85,80.2,1.9],[SHOT,81.2,1.6],[3,82,1.6],[10,82.3,1.6]]},
 {name:'centre-back',role:'bay',style:BAY({build:W_BUILD(1.75),seed:4}),key:true,moves:[{kind:'strike',at:PASS,dur:.8,side:'r',power:.55}],keys:[[-6,91.5,-5.4],[-3.5,91,-4.8],[PASS,90.5,-4.5],[0,92,-3],[SHOT,94,-2.2],[10,95,-2]]},
 {name:'centre-back 2',role:'bay',style:BAY({build:W_BUILD(1.72),skin:SKIN_M,seed:5}),keys:[[-6,92.5,7],[0,93,4.5],[SHOT,95.4,2.6],[10,96,2.4]]},
 {name:'left-back',role:'bay',style:BAY({build:W_BUILD(1.64),seed:3}),keys:[[-6,88,20],[0,89,15],[SHOT,91.5,10],[10,93,9]]},
 {name:'right-back',role:'bay',style:BAY({build:W_BUILD(1.66),skin:SKIN_D,seed:2}),keys:[[-6,87,-19],[0,88.5,-14],[SHOT,91,-9.5],[10,92,-8]]},
 {name:'Bay mid 2',role:'bay',style:BAY({build:W_BUILD(1.62),seed:8}),keys:[[-6,79,-9],[0,80.5,-7],[SHOT,84.2,-4.8],[10,86,-4]]},
 {name:'Bay mid 3',role:'bay',style:BAY({build:W_BUILD(1.7),skin:SKIN_M,seed:10}),keys:[[-6,74,10],[0,76,8.5],[SHOT,80,6],[10,82,5]]},
 {name:'Bay fwd',role:'bay',style:BAY({build:W_BUILD(1.7),skin:SKIN_D,seed:9}),keys:[[-6,63,-5],[10,67,-4]]},
 {name:'Bay fwd 2',role:'bay',style:BAY({build:W_BUILD(1.68),seed:7}),keys:[[-6,61,6],[10,65,7]]},
 {name:'LaBonta',role:'kc',style:KC({skin:SKIN_L,hair:[Y,.6],build:W_BUILD(1.63),seed:10}),key:true,keys:[[-6,64,-5],[-2,68,-4.4],[1,74,-3.5],[SHOT,80,-2],[4,84,2],[5.5,86.6,6.4],[6.8,88.2,9.8],[7.4,88.6,10.5],[10,88.7,10.6]]},
 {name:'KC fwd',role:'kc',style:KC({skin:SKIN_M,build:W_BUILD(1.68),seed:11}),keys:[[-6,77,-13],[0,82,-11],[SHOT,88.5,-8],[5,90,-4],[10,90,-2]]},
 {name:'KC fwd 2',role:'kc',style:KC({skin:SKIN_L,hair:[Y,.7],build:W_BUILD(1.7),seed:14}),keys:[[-6,77,15],[0,82,14],[SHOT,89,11],[10,90,11]]},
 {name:'KC mid',role:'kc',style:KC({skin:SKIN_L,build:W_BUILD(1.65),seed:16}),keys:[[-6,60,1],[10,72,1.5]]},
 {name:'KC back',role:'kc',style:KC({skin:SKIN_D,build:W_BUILD(1.72),seed:17}),keys:[[-6,55,24],[10,66,24]]},
 {name:'keeper',role:'gk',style:GK_ST,key:true,moves:[{kind:'dive',at:SHOT+.55,dur:.95,side:'r'}],keys:[[-6,101.2,.4],[0,102.4,.3],[2,103.3,.05],[SHOT,103.5,0],[10,103.5,0]]},
 {name:'referee',role:'ref',style:REF,keys:[[-6,68,-9],[0,74,-8],[SHOT,79,-7],[10,84,-6]]},
];
const TEM=0,MID=1,CB=2,LAB=10,GK=15;
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const T0=-6.5,T1=10,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const smooth=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau),b=posOf(k,tau-.3),d=posOf(k,tau-.6);return[(a[0]+b[0]+d[0])/3,(a[1]+b[1]+d[1])/3];};

// ---------------------------------------------------------------- the ball: the pass out, the heavy touch, the steal, the run, the rocket
/** Chawinga's touches: the poke (0), two right-foot pushes on the run, then the right-foot shot (count inferred) */
const TOUCHES=[0,.85,1.6,SHOT];
/** where the shot goes: high, to the keeper's right (inferred), under the bar */
const GOALPT:V3=[105,1.95,-2.55],NET:V3=[106.6,1.6,-2.8],REST:V3=[106.2,.11,-2.4];
/** her forward and right directions on the ground (x, z) */
const fwdR=(y:number):[Pt,Pt]=>[[Math.cos(y),-Math.sin(y)],[Math.sin(y),Math.cos(y)]];
/** the shot's heading (square to the target, opened a touch for a right-foot strike) */
const SHOT_YAW=(()=>{const p=posOf(TEM,SHOT),dx=GOALPT[0]-p[0],dz=GOALPT[2]-p[1];return yawOf(dx,dz)-.12;})();
function yawTem(tau:number):number{
 const v=velOf(TEM,tau),head=Math.hypot(v[0],v[1])>.4?yawOf(v[0],v[1]):yawOf(1,0);
 const w=sm(SHOT-.5,SHOT-.15,tau)*(1-sm(SHOT+.45,SHOT+1,tau));return lerpA(head,SHOT_YAW,w);
}
/** the ball spot for a touch: ahead of her and a little to the side of the touching foot */
function footAt(tau:number,side:'l'|'r'):[number,number]{const y=yawTem(tau),p=posOf(TEM,tau),[f,r]=fwdR(y),sd=side==='r'?1:-1;return[p[0]+f[0]*.52+r[0]*.14*sd,p[1]+f[1]*.52+r[1]*.14*sd];}
const TP=TOUCHES.map(T=>footAt(T,'r'));
const S0=TP[TP.length-1];
/** the midfielder's feet as the pass arrives (she faces the passer, +X) and the centre-back's boot at the pass */
const RCVP:[number,number]=(()=>{const m=posOf(MID,RCV);return[m[0]+.5,m[1]];})();
const CBP:[number,number]=(()=>{const d=posOf(CB,PASS);return[d[0]-.5,d[1]+.1];})();
/** the rocket: a hard, low-to-high flight with a slight dip at the end */
function shotAt(u:number):V3{return[lerp(S0[0],GOALPT[0],u),.12+(GOALPT[1]-.12)*Math.pow(u,1.25)+.5*Math.sin(Math.PI*u),lerp(S0[1],GOALPT[2],u)];}
function ballAt(tau:number):V3{
 if(tau<PASS){const d=posOf(CB,tau);return[d[0]-.52,.11,d[1]+.1];}
 if(tau<RCV){const u=(tau-PASS)/(RCV-PASS),e=1-Math.pow(1-u,1.4);return[lerp(CBP[0],RCVP[0],e),.11,lerp(CBP[1],RCVP[1],e)];}// the pass out along the grass
 if(tau<0){const u=(tau-RCV)/-RCV,e=1-Math.pow(1-u,1.6);return[lerp(RCVP[0],TP[0][0],e),.11,lerp(RCVP[1],TP[0][1],e)];}// the heavy first touch, running loose
 if(tau<SHOT){let k=0;while(k+1<TOUCHES.length&&tau>=TOUCHES[k+1])k++;const u=(tau-TOUCHES[k])/(TOUCHES[k+1]-TOUCHES[k]),e=1-Math.pow(1-u,2.2);return[lerp(TP[k][0],TP[k+1][0],e),.11,lerp(TP[k][1],TP[k+1][1],e)];}
 if(tau<IN_NET)return shotAt((tau-SHOT)/(IN_NET-SHOT));
 const u=clamp((tau-IN_NET)/.2);if(u<1)return lerp3(GOALPT,NET,u);
 const w=clamp((tau-IN_NET-.2)/.5),e=w*w;return[lerp(NET[0],REST[0],w),lerp(NET[1],REST[1],e),lerp(NET[2],REST[2],w)];
}
const bulgeAt=(tau:number)=>tau<IN_NET?0:Math.exp(-(tau-IN_NET)*2.2)*(1+.3*Math.sin((tau-IN_NET)*14));

// ---------------------------------------------------------------- poses (angles in degrees via posed; the athlete clamps to real range of motion)
const RAD=Math.PI/180;
const LIN=new Set(['dx','dz','air','lHand','rHand','squash']);
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LIN.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:10,rHipA:10,lean:16,pitch:4,lShA:26,rShA:26,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
/** the steal: a long stretch of the right leg, the toe poking the ball away, low and leaning, arms wide */
const POKE:Partial<Pose>={rHipF:66,rKnee:12,rAnk:24,rHipR:14,lKnee:52,lHipF:6,lean:26,pitch:6,lShA:58,rShA:36,lElb:34,rElb:40,neckP:30,squash:-.04};
/** riding the shove from her left: dipped into it, the left shoulder braced, the left arm fending, the right arm out for balance */
const RIDE:Partial<Pose>={roll:-10,bend:-12,lean:18,lShA:50,lShF:30,lElb:70,rShA:52,rShF:-10,rElb:30,neckP:10,neckY:-12,lKnee:48,rKnee:40,squash:-.04};
/** a push on the run: the right boot reaching the ball, a glance down */
const PUSH_R:Partial<Pose>={rHipF:40,rKnee:26,rAnk:28,rHipR:10,neckP:18};
/** the midfielder's shove: both arms driving into Chawinga's side, leaning in */
const SHOVE_P:Partial<Pose>={lShF:78,rShF:70,lShA:22,rShA:22,lElb:24,rElb:30,lean:22,roll:6,lKnee:40,rKnee:48,neckP:6};
/** LaBonta counting the goals on her fingers (confirmed): both hands up in front of her, open */
const COUNT:Partial<Pose>={lShF:96,rShF:92,lShA:24,rShA:20,lElb:74,rElb:80,lHand:1,rHand:1,neckP:14,lean:4};
/** the whole pose of actor k at τ, with its yaw */
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),m=posOf(TEM,tau),b=ballAt(tau);
 let yaw=sp>.45?yawOf(v[0],v[1]):yawOf(b[0]-x,b[2]-z);
 // the midfielder faces the pass as it comes, then the loose ball, then Chawinga as she shoves, then chases
 if(k===MID){if(tau<SHOVE+.4)yaw=yawOf(b[0]-x,b[2]-z);yaw=lerpA(yaw,yawOf(m[0]-x,m[1]-z),bump(SHOVE-.3,SHOVE+.5,tau));}
 if(a.role==='gk')yaw=lerpA(yawOf(b[0]-x,b[2]-z),yawOf(-1,0),sm(SHOT-.4,SHOT,tau));
 if(a.role==='bay'&&k!==CB&&tau<SHOT+.2&&tau>-1)yaw=lerpA(yaw,yawOf(b[0]-x,b[2]-z),.7);
 if(k===TEM)yaw=yawTem(tau);
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 let p:Pose;
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='bay'||a.role==='mid'?READY:stand();
 if(sp>.5&&along<-.35*sp&&k!==TEM)p=blendPose(idle,backpedal(distOf(k,tau)/1.2),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/4.5),cyc=k===TEM?3.4:3.3;p=blendPose(idle,runCycle(distOf(k,tau)/cyc,{speed:s}),clamp((sp-.4)/.9));}
 for(const mv of a.moves??[]){const lead=mv.kind==='dive'?.55:mv.kind==='strike'?.52:.6,t0=mv.at-lead*mv.dur,u=(tau-t0)/mv.dur;
  if(mv.kind==='lunge'&&u>0&&u<1.6)p=blendPose(p,lunge(Math.min(1,u),{side:mv.side}),Math.min(sm(0,.12,u),1-sm(1.1,1.6,u)));
  if(mv.kind==='dive'&&u>0)p=keeperDive(Math.min(1,u),{side:mv.side,height:.85});
  if(mv.kind==='strike'&&u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:mv.side,power:mv.power??.7}),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));}
 if(k===MID){
  // the pass in: set to receive; the shove; then a late lunge after the ball as it goes
  p=over(p,SHOVE_P,bump(SHOVE-.3,SHOVE+.35,tau));
  const u=(tau-.55)/.8;if(u>0&&u<1.4)p=blendPose(p,lunge(Math.min(1,u),{side:'l'}),Math.min(sm(0,.15,u),1-sm(1,1.4,u))*.8);
 }
 if(k===TEM){
  p=over(p,POKE,bump(-.28,.22,tau));
  p=over(p,RIDE,bump(SHOVE-.2,SHOVE+.55,tau));
  for(const T of TOUCHES)if(T>.3&&T<SHOT&&Math.abs(tau-T)<.2)p=over(p,PUSH_R,bump(T-.2,T+.12,tau));
  const D=.8,st=SHOT-.52*D,u=(tau-st)/D;
  if(u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:1}),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));
  if(tau>IN_NET+.3)p=blendPose(p,celebrate(tau*.85,{kind:'run'}),sm(IN_NET+.3,IN_NET+.8,tau)*(1-sm(6.6,7,tau)));
  if(tau>6.6)p=blendPose(p,celebrate((tau-6.6)*.9,{kind:'arms'}),sm(6.6,7,tau));
 }
 if(k===LAB){p=over(p,COUNT,sm(6.9,7.4,tau));if(tau>6.9)yaw=lerpA(yaw,yawOf(m[0]-x,m[1]-z),sm(6.9,7.3,tau));}
 return{p,yaw};
}

// ---------------------------------------------------------------- the ball print: white with navy panels (inferred)
function ball(s:Sheet,x:number,y:number,r:number,rot:number){footballPanels(s,x,y,r,{rot,key:K,shadow:B,seed:5});}

// ---------------------------------------------------------------- drawing the match through a camera
type CastE={k:number;x:number;z:number;g:Pt;h:number;d:number};
type PlayOut={list:CastE[];bg:Pt|null;br:number;hero?:DrawResult};
/** everything on the pitch at τ (positions on ones, poses on twos at τp; τprev = the drawing before, for secondary motion) */
function play(s:Sheet,c:Cam,v:View,tau:number,tauP:number,tauPrev:number,o:{minBall?:number;hero?:boolean;after?:(r:PlayOut)=>void;full?:number[]}={}):PlayOut{
 const{minBall=6,hero=false,full}=o;
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!s._passage.pending;
 const list:CastE[]=[];
 ACTORS.forEach((_,k)=>{const[x,z]=posOf(k,tau),q=toCam(c,[x,.9,z]);if(q[2]<1.2)return;const g=scr(c,toCam(c,[x,0,z])),h=c.F*1.75/q[2];if(!inView(v,g,h*1.2)&&!inView(v,[g[0],g[1]-h],h))return;list.push({k,x,z,g,h,d:q[2]});});
 const b=ballAt(tau),bq=toCam(c,b),bg=bq[2]>=NEAR?scr(c,bq):null,br=bg?Math.max(minBall,c.F*.11/bq[2]):0,bground=pr(c,[b[0],0,b[2]]);
 // floodlit shadows, batched in one op; big figures cast their own through the athlete
 const sh=new Path2D();for(const e of list)if(e.h<420)sh.addPath(polyPath(blob(e.g[0]+e.h*.05,e.g[1],e.h*.14,e.h*.035,ACTORS[e.k].style.seed??1,{amp:.05,n:14}),true));
 if(bground&&bg)sh.addPath(polyPath(blob(bground[0],bground[1],br*.8,br*.25,2,{amp:.05,n:12}),true));s.tone(K,sh,.45);
 list.sort((p,q)=>q.d-p.d);
 const drawBall=()=>{if(bg)ball(s,bg[0],bg[1],br,Math.hypot(b[0],b[2])/.11);};
 let ballDone=!list.length||bq[2]>=list[0].d,heroR:DrawResult|undefined;if(ballDone)drawBall();
 for(const e of list){if(!ballDone&&bq[2]>=e.d){drawBall();ballDone=true;}
  const a=ACTORS[e.k],{p,yaw}=poseOf(e.k,tauP),px=e.h*ppu,big=e.h>=300,named=full?full.includes(e.k):a.key;
  // phone heat: low detail for small figures and extras; during a passage only the hero keeps 'mid'
  const detail=passing?(e.k===TEM?'mid':'low'):px<50||(!named&&px<120)?'low':'auto';
  const r=drawPlayer(s,p,c,{...a.style,shadow:e.h<420?false:undefined,detail},{x:e.x,z:e.z,yaw},big&&(e.k===TEM||e.h>520)&&!passing?{prev:poseOf(e.k,tauPrev).p,smear:hero&&e.k===TEM}:{});
  if(e.k===TEM)heroR=r;}
 if(!ballDone)drawBall();
 const out={list,bg,br,hero:heroR};
 o.after?.(out);
 return out;
}
/** a broadcast speed streak (the replay wipe): long halftone strokes across the frame */
function streaks(s:Sheet,v:View,amt:number,seed:number,dir=0){if(amt<=.02)return;const p=new Path2D(),r=rng(seed);
 for(let i=0;i<16;i++){const y=(r()-.5)*2*v.hy,x0=(r()-.5)*2*v.hx,L=v.hx*(.6+r()*.9);p.addPath(ribbon([[x0-L*Math.cos(dir),y-L*Math.sin(dir)],[x0+L*Math.cos(dir),y+L*Math.sin(dir)]],12+r()*30,{seed:seed+i,taper:.8,wobble:1.5}));}
 s.tone(K,p,.55*amt);s.knockout(p,.35*amt);}

// ---------------------------------------------------------------- teaching marks, shared by the replays and the lesson
/** a ground ring (ellipse on the grass) in an ink */
function groundRing(s:Sheet,c:Cam,x:number,z:number,rad:number,ink:string,w:number,seed=41){if(w<=0)return;const pts:Pt[]=[];
 for(let i=0;i<36;i++){const q=pr(c,[x+Math.cos(i/36*TAU)*rad*1.1,0,z+Math.sin(i/36*TAU)*rad]);if(q)pts.push(q);}if(pts.length<28)return;
 const q=toCam(c,[x,0,z]),rr=ribbon(pts,Math.max(5,c.F*.08/q[2]),{close:true,seed,taper:0,wobble:1.2});s.knockout(rr,.85*w);s.fill(ink,rr,.95*w);}
/** the shooting angle: a wedge on the grass from the ball to both posts — her corner to pick */
function angleWedge(s:Sheet,c:Cam,from:[number,number],w:number,ink=Y){if(w<=0)return;
 const a=pr(c,[from[0],0,from[1]]),p1=pr(c,[105,0,-3.66]),p2=pr(c,[105,0,3.66]);if(!a||!p1||!p2)return;
 const wedge=polyPath([a,p1,p2],true);s.knockout(wedge,.3*w);s.tone(ink,wedge,.5*w);
 const q=toCam(c,[from[0],0,from[1]]),lw=Math.max(3,c.F*.05/q[2]);s.fill(ink,ribbon([a,p1],lw,{seed:91,taper:.3,wobble:.6}),.95*w);s.fill(ink,ribbon([a,p2],lw,{seed:92,taper:.3,wobble:.6}),.95*w);}
/** a path on the grass along her run between two moments (optionally dashed), arrowhead at the end */
function runPath(s:Sheet,c:Cam,ink:string,w:number,prog:number,a0:number,a1:number,seed:number,dashed=true){if(w<=0)return;
 const pts:Pt[]=[];for(let i=0;i<=24;i++){const tau=lerp(a0,a1,i/24),m=posOf(TEM,tau),q=pr(c,[m[0],0,m[1]]);if(q)pts.push(q);}if(pts.length<6)return;
 const sub=partial(pts,clamp(prog)),m=posOf(TEM,lerp(a0,a1,.5)),q=toCam(c,[m[0],0,m[1]]),wd=Math.max(5,c.F*.13/q[2]);
 s.knockout(ribbon(sub,wd*1.6,{seed,taper:.1,wobble:.8}),.7*w);s.fill(ink,ribbon(sub,wd,{seed:seed+1,taper:.1,wobble:.8,gaps:dashed?[[.18,.24],[.42,.48],[.66,.72]]:[]}),.95*w);
 if(sub.length>2&&prog>.15){const e=sub[sub.length-1],pv=sub[Math.max(0,sub.length-3)];laneArrow(s,ink,pv,e,wd,{seed:seed+2,head:wd*3.2,cov:.95*w});}}
/** a short straight arrow on the grass (the shove: red, from the midfielder into Chawinga) */
function groundArrow(s:Sheet,c:Cam,from:[number,number],to:[number,number],ink:string,w:number,prog=1,seed=66){if(w<=0)return;
 const e:[number,number]=[lerp(from[0],to[0],clamp(prog)),lerp(from[1],to[1],clamp(prog))],a=pr(c,[from[0],0,from[1]]),b=pr(c,[e[0],0,e[1]]);if(!a||!b)return;
 const q=toCam(c,[e[0],0,e[1]]),wd=Math.max(5,c.F*.14/q[2]);s.knockout(ribbon([a,b],wd*1.6,{seed,taper:.1,wobble:.6}),.7*w);laneArrow(s,ink,a,b,wd,{seed:seed+1,head:wd*3,cov:.95*w});}
/** GOAL-SIDE: a dashed line on the grass from the beaten midfielder, through Chawinga, to the middle of Bay FC's goal (she is on it,
 * between the defender and the goal) */
function goalSide(s:Sheet,c:Cam,tau:number,w:number,prog=1){if(w<=0)return;
 const m=posOf(MID,tau),g:[number,number]=[105,0],pts:Pt[]=[];for(let i=0;i<=20;i++){const u=i/20*clamp(prog),q=pr(c,[lerp(m[0],g[0],u),0,lerp(m[1],g[1],u)]);if(q)pts.push(q);}if(pts.length<3)return;
 const q=toCam(c,[m[0],0,m[1]]),wd=Math.max(4,c.F*.1/q[2]),gaps:[number,number][]=[];for(let i=0;i<9;i++)gaps.push([(i+.55)/9,(i+.85)/9]);
 s.knockout(ribbon(pts,wd*1.5,{seed:73,taper:.2,wobble:.6,gaps}),.6*w);s.fill(Y,ribbon(pts,wd,{seed:74,taper:.2,wobble:.6,gaps}),.95*w);}
/** a ring round a boot */
function bootRing(s:Sheet,hero:DrawResult|undefined,w:number,side:'l'|'r'='r',ink=Y){if(!hero||w<=0)return;const toe=side==='l'?hero.joints.lToe:hero.joints.rToe,an=side==='l'?hero.joints.lAn:hero.joints.rAn,r=Math.hypot(toe[0]-an[0],toe[1]-an[1])*1.3*w+2,cx=(toe[0]+an[0])/2,cy=(toe[1]+an[1])/2,pts:Pt[]=[];
 for(let i=0;i<26;i++){const a=i/26*TAU;pts.push([cx+Math.cos(a)*r*1.2,cy+Math.sin(a)*r*.85]);}
 const rr=ribbon(pts,Math.max(3,r*.2),{seed:82,close:true,taper:0,wobble:.8});s.knockout(rr,.8*w);s.fill(ink,rr,.95*w);}
/** the rocket: a yellow dashed trail through the air along the ball's path, from the boot to where it is now (or all of it) */
function shotTrail(s:Sheet,c:Cam,tau:number,w:number,full=false){if(w<=0)return;const end=full?1:clamp((tau-SHOT)/(IN_NET-SHOT));if(end<=.02)return;
 const pts:Pt[]=[];for(let i=0;i<=28;i++){const q=pr(c,shotAt(end*i/28));if(q)pts.push(q);}if(pts.length<4)return;const q=toCam(c,shotAt(end*.5)),wd=Math.max(4,c.F*.09/q[2]);
 s.knockout(ribbon(pts,wd*1.5,{seed:71,taper:.4,wobble:.6}),.6*w);s.fill(Y,ribbon(pts,wd,{seed:72,taper:.4,wobble:.6,gaps:[[.12,.18],[.3,.36],[.48,.54],[.66,.72],[.84,.9]]}),.95*w);}
/** her corner: a ring in the goal mouth where the ball goes in */
function cornerRing(s:Sheet,c:Cam,w:number,ink=Y){if(w<=0)return;const pts:Pt[]=[];
 for(let i=0;i<30;i++){const a=i/30*TAU,q=pr(c,[105,GOALPT[1]+Math.sin(a)*.42,GOALPT[2]+Math.cos(a)*.5]);if(q)pts.push(q);}if(pts.length<20)return;
 const q=toCam(c,[105,GOALPT[1],GOALPT[2]]),rr=ribbon(pts,Math.max(4,c.F*.07/q[2]),{close:true,seed:77,taper:0,wobble:1});s.knockout(rr,.85*w);s.fill(ink,rr,.95*w);}
/** the steal: a yellow spark at the ball as she pokes it away */
function stealSpark(s:Sheet,c:Cam,w:number,seed=58){if(w<=0)return;const b=TP[0],q=toCam(c,[b[0],.25,b[1]]);if(q[2]<NEAR)return;const g=scr(c,q);
 sparkBurst(s,Y,g[0],g[1],c.F*.9/q[2],{n:9,seed,g:easeOutBack(clamp(w)),width:Math.max(6,c.F*.06/q[2]),cov:.95});}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, near real time
const tau1=(t:number)=>{const G=CUE(0,'What a rocket');return key(t,mono([[0,-6.2],[CUE(0,'Temwa'),-4.4],[CUE(0,'one more'),PASS-.3],[CUE(0,'She steals'),-.25],[CUE(0,'rides the'),SHOVE-.05],[CUE(0,'races on'),1.1],[CUE(0,'shoots from'),SHOT-.1],[G,IN_NET+.1],[SECS(0)+1,IN_NET+.1+(SECS(0)+1-G)*.9]]),linear);};
const CAM1:V3=[74,21,60];
function cam1(t:number):Cam{
 const G=CUE(0,'What a rocket'),S=SECS(0),tau=tau1(t);
 const bs=(u:number):V3=>{const b=ballAt(Math.min(u,SHOT));return[b[0],0,b[2]];},b0=bs(tau),b1=bs(tau-.35),b2=bs(tau-.7),bt:V3=[(b0[0]+b1[0]+b2[0])/3,0,(b0[2]+b1[2]+b2[2])/3];
 const open:V3=[78,6,0],m=posOf(TEM,tau),cel:V3=[m[0]-1,1,m[1]-1];
 const toBall=sm(CUE(0,'Kansas'),CUE(0,'Temwa')+.4,t,easeInOutSine),toS=sm(G+.6,G+1.8,t,easeInOutSine),toGoal=sm(CUE(0,'races on'),CUE(0,'shoots from')+.3,t,easeInOutSine)*(1-toS);
 const tb:V3=[lerp(open[0],bt[0]+2+7*toGoal,toBall),lerp(open[1],1.5,toBall),lerp(open[2],lerp(bt[2],0,.25+.3*toGoal),toBall)],T=lerp3(tb,cel,toS);
 const F=key(t,mono([[0,2500],[CUE(0,'Kansas'),2900],[CUE(0,'Temwa'),3700],[CUE(0,'She steals'),5200],[CUE(0,'rides'),5500],[CUE(0,'races on'),4900],[CUE(0,'shoots'),4300],[G,4600],[G+1.8,7000],[S,7400]]),easeInOutSine);
 return look(CAM1,T,F);
}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),tau=tau1(t),tp=tau1(twos(t)),G=CUE(0,'What a rocket');
  stadium(s,c,v,t,[0,1,3],{roar:sm(G-.1,G+.5,t)});
  ground(s,c,{bulge:bulgeAt(tau),ballZ:GOALPT[2]});
  play(s,c,v,tau,tp,tau1(twos(t)-1/12),{minBall:8});
 },
 aperture(t){const c=cam1(t),[x,z]=posOf(TEM,tau1(t)),q=toCam(c,[x,1,z]),g=scr(c,q),h=c.F*1.65/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.09),12);},
 still:6,
};

// ---------------------------------------------------------------- 2 · slow replay, a low camera behind Chawinga's right shoulder
const tau2=(t:number)=>key(t,mono([[0,-2.3],[CUE(1,'sprints in'),-1.5],[CUE(1,'nicks the'),-.12],[CUE(1,'midfielder'),SHOVE-.12],[CUE(1,'stays strong'),SHOVE+.3],[CUE(1,'Now she'),1.05],[SECS(1),1.45]]),linear);
function cam2(t:number):Cam{
 const tau=tau2(t),m=smooth(TEM,tau),open=1-sm(0,1.2,t,easeInOutSine),wide=sm(CUE(1,'Now she')-.5,CUE(1,'Now she')+.5,t,easeInOutSine);
 const C:V3=[m[0]-5-1.5*open-2*wide,1.8+.4*open+2.2*wide,m[1]+6+1.2*open+3*wide],T:V3=[lerp(m[0]+3.2,m[0]+9,wide),lerp(1,.6,wide),lerp(m[1]-2.2,m[1]-3,wide)];
 return look(C,T,lerp(2500-300*open,2000,wide));
}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),tau=tau2(t),tp=tau2(twos(t)),si=CUE(1,'sprints in'),nk=CUE(1,'nicks the'),mp=CUE(1,'midfielder'),ss=CUE(1,'stays strong'),ns=CUE(1,'Now she'),E=SECS(1);
  stadium(s,c,v,t,[0,3]);
  ground(s,c);
  const out=1-sm(E-.7,E-.3,t);
  // "sprints in": her yellow speed trail into the ball
  runPath(s,c,Y,sm(si-.2,si+.2,t)*out,sm(si-.2,si+1,t),-2,Math.min(0,Math.max(-1.7,tau)),61,false);
  // "midfielder pushes": a red ring under her and the shove arrow; "stays strong": a yellow ring under Chawinga
  const mr=sm(mp-.15,mp+.3,t,easeOutBack)*out;groundRing(s,c,...posOf(MID,Math.min(tau,SHOVE+.4)),.75,R,mr,44);
  groundArrow(s,c,posOf(MID,SHOVE),posOf(TEM,SHOVE),R,sm(mp-.1,mp+.2,t)*(1-sm(ns-.2,ns+.2,t)),sm(mp-.1,mp+.5,t));
  groundRing(s,c,...posOf(TEM,Math.min(tau,1.2)),.8,Y,sm(ss-.15,ss+.3,t,easeOutBack)*(1-sm(ns+.2,ns+.6,t)),46);
  // "now she is goal-side": the line from the midfielder, through her, to the goal
  goalSide(s,c,tau,sm(ns-.2,ns+.2,t)*out,sm(ns-.2,ns+.8,t));
  play(s,c,v,tau,tp,tau2(twos(t)-1/12),{minBall:5,hero:true,full:[TEM,MID],after:()=>{
   stealSpark(s,c,sm(nk-.05,nk+.3,t)*(1-sm(mp,mp+.4,t)));}});
  streaks(s,v,1-sm(0,.5,t),21);
 },
 aperture(t){const c=cam2(t),m=posOf(TEM,tau2(t)),q=toCam(c,[m[0],1.3,m[1]]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.14/q[2]),12);},
 still:1.2,
};

// ---------------------------------------------------------------- 3 · replay from behind Bay FC's goal: the corner, the strike, the rocket, LaBonta counting
const tau3=(t:number)=>{const nw=CUE(2,'new NWSL');return key(t,mono([[0,1.2],[CUE(2,'From outside'),1.5],[CUE(2,'picks her'),SHOT-.45],[CUE(2,'strikes'),SHOT-.02],[CUE(2,'rockets'),SHOT+.4],[CUE(2,'goal nineteen'),IN_NET+.35],[nw,6.2],[SECS(2),6.2+(SECS(2)-nw)*.9]]),linear);};
const swing3=(t:number)=>sm(CUE(2,'goal nineteen')+.2,CUE(2,'new NWSL')+.4,t,easeInOutSine);
function cam3(t:number):Cam{
 const tau=tau3(t),u=swing3(t),C:V3=[117,4.4+.8*u,4.5+4*u],e=sm(SHOT-.3,IN_NET,tau,easeInOutSine);
 const m=smooth(TEM,Math.min(tau,7.6)),T0:V3=[lerp(86,101,e),lerp(1.2,1.5,e),lerp(.6,-1.4,e)],T1:V3=[m[0]-.5,1.2,m[1]-.4];
 return look(C,lerp3(T0,T1,u),lerp(lerp(4300,3700,e),5600,u));
}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),tau=tau3(t),tp=tau3(twos(t)),fo=CUE(2,'From outside'),ph=CUE(2,'picks her'),st=CUE(2,'strikes'),ro=CUE(2,'rockets'),gn=CUE(2,'goal nineteen'),nw=CUE(2,'new NWSL'),u=swing3(t);
  stadium(s,c,v,t,[0,1,2],{roar:sm(IN_NET,IN_NET+.3,tau)});
  ground(s,c,{goalLater:u<.5});
  // "from outside the box": the box edge ringed at her feet; "picks her corner": the wedge to the posts
  groundRing(s,c,...posOf(TEM,Math.min(tau,SHOT)),.8,Y,sm(fo-.1,fo+.3,t,easeOutBack)*(1-sm(ph+.2,ph+.6,t)),45);
  angleWedge(s,c,S0,sm(ph-.1,ph+.35,t)*(1-sm(ro,ro+.4,t))*.85);
  play(s,c,v,tau,tp,tau3(twos(t)-1/12),{minBall:5,hero:true,full:[TEM,MID,GK,LAB],after:({hero})=>{
   bootRing(s,hero,sm(st-.1,st+.3,t,easeOutBack)*(1-sm(ro,ro+.4,t)),'r');
   shotTrail(s,c,tau,sm(st-.05,st+.2,t)*(1-sm(nw-.4,nw,t)));}});
  if(u<.5){goal3(s,c,105,1,bulgeAt(tau),GOALPT[2]);cornerRing(s,c,sm(ph-.15,ph+.3,t,easeOutBack)*(1-sm(gn,gn+.4,t)));}
  // "goal nineteen": a burst in the net; "a new NWSL record": a yellow burst over the celebration
  const gw=sm(gn-.1,gn+.3,t)*(1-sm(gn+.8,gn+1.3,t));if(gw>0&&u<.5){const q=pr(c,GOALPT);if(q)sparkBurst(s,Y,q[0],q[1],c.F*1.2/toCam(c,GOALPT)[2],{n:10,seed:84,g:easeOutBack(gw),width:10,cov:.95});}
  const rw=sm(nw-.1,nw+.4,t);if(rw>0){const m=posOf(TEM,tau),q=pr(c,[m[0],2.7,m[1]]);if(q)sparkBurst(s,Y,q[0],q[1],c.F*1.5/toCam(c,[m[0],2.7,m[1]])[2],{n:12,seed:88,g:easeOutBack(rw),width:12,cov:.95});}
  streaks(s,v,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3(t),[x,z]=posOf(TEM,tau3(t)),q=toCam(c,[x,1.1,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.16/q[2]),12);},
 still:2.6,
};

// ---------------------------------------------------------------- 4 · the lesson: a raised coaching angle, the whole move marked out
const tau4=(t:number)=>key(t,mono([[0,-2.2],[CUE(3,'Your'),-2],[CUE(3,'use your'),-1.4],[CUE(3,'speed'),-.4],[CUE(3,'get goal'),.9],[CUE(3,'pick your'),SHOT-.15],[SECS(3),IN_NET+.3]]),linear);
function cam4(t:number):Cam{
 const tau=tau4(t),orbit=sm(CUE(3,'get goal')-.3,CUE(3,'pick your')+.3,t,easeInOutSine),m=smooth(TEM,Math.min(tau,SHOT));
 const C:V3=[lerp(57,66,orbit),lerp(6.5,8.5,orbit),lerp(19,14,orbit)],T:V3=[lerp(m[0]+4,93,orbit*.5),.3,lerp(m[1]-1.6,-.6,orbit*.5)];
 return look(C,T,lerp(2700,2200,orbit));
}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),tau=tau4(t),tp=tau4(twos(t)),us=CUE(3,'use your'),sp=CUE(3,'speed'),gg=CUE(3,'get goal'),pc=CUE(3,'pick your'),E=SECS(3),out=1-sm(E-.6,E-.3,t);
  stadium(s,c,v,t,[0,3]);
  ground(s,c,{bulge:bulgeAt(tau),ballZ:GOALPT[2]});
  // 1 · use your speed: the yellow sprint trail into the ball; 2 · get goal-side: the midfielder ringed red, the goal-side line
  runPath(s,c,Y,sm(us-.2,us+.2,t)*out,sm(sp-.3,sp+.6,t),-2,Math.min(.2,Math.max(-1.7,tau)),61,false);
  groundRing(s,c,...posOf(MID,Math.min(tau,1.2)),.8,R,sm(gg-.2,gg+.3,t,easeOutBack)*out,44);
  goalSide(s,c,Math.min(tau,1.2),sm(gg-.1,gg+.3,t)*out*(1-sm(pc+.3,pc+.7,t)*.6),sm(gg-.1,gg+.8,t));
  // 3 · pick your corner: the wedge, the ring in the corner, the rocket
  angleWedge(s,c,S0,sm(pc-.15,pc+.3,t)*out*.8);
  cornerRing(s,c,sm(pc-.1,pc+.35,t,easeOutBack)*out);
  play(s,c,v,tau,tp,tau4(twos(t)-1/12),{minBall:5,hero:true,full:[TEM,MID,GK],after:()=>{
   shotTrail(s,c,tau,sm(pc,pc+.3,t)*out);
   stealSpark(s,c,sm(sp+.2,sp+.5,t)*(1-sm(gg,gg+.4,t)),59);}});
 },
 still:2.6,
};

const film:RisoStory={
 id:'chawinga-signature',format:'11v11',title:"Chawinga's sprint and finish",theme:'Using speed to win the ball and get goal-side, then picking a corner and finishing',
 ageNote:'NWSL, Bay FC 0–1 Kansas City Current, PayPal Park, San Jose, 12 October 2024: Temwa Chawinga\'s 19th goal of the season, a new NWSL single-season record. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a sprint streak — a yellow speed trail races in to the tap and a spark pops where the ball is nicked. Reduced motion: the still streak. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.25)),fade=age<=0?1:1-clamp((age-.6)/.35),pts:Pt[]=[];
  for(let i=0;i<=10;i++){const k=i/10*u;pts.push([x-220+220*k,y+60-60*k]);}
  s.fill(Y,ribbon(pts,14,{seed,taper:.9,pressure:.3,wobble:1}),.95*fade);
  if(age<=0||age>.2)sparkBurst(s,Y,x,y,90,{n:8,seed:seed+1,g:age<=0?1:easeOutBack(clamp((age-.2)/.15)),width:12,cov:.95*fade});
 },
};
export default film;
