/** Trinity Rodman's signature — the run past the full-back. The moment: United States 1–0 Japan (after extra time), Olympic women's
 * football quarter-final, Paris 2024, Parc des Princes, Paris, Saturday 3 August 2024 (kick-off 15:00 CEST): her 105+2nd-minute winner.
 * An iconic-play riso film (RisoStory, chapters mode): a 1:1 reconstruction from WRITTEN accounts (the footage itself was not reviewed),
 * printed as a riso sheet.
 *
 * WHY THIS MOMENT: iconicPlays.json gives Rodman a signature, not a match ("the run past the full-back", on the RIGHT; lesson "Attack the
 * defender at speed and be brave enough to try a trick"). Her best-documented example is this goal: a long switch from Crystal Dunn found
 * her in the right corner, she RACED into the box straight at Japan's left wing-back Hikaru Kitagawa, cut the ball back past her ("Rodman
 * beat Hikaru Kitagawa on the dribble") and scored with her left foot — the wide player beating her full-back one-on-one at speed, on the
 * biggest stage, in extra time of an Olympic knockout game.
 *
 * SOURCES (Sept 2026, read as raw pages with curl, cached under the build scratchpad films/src-cache/):
 *  - U.S. Soccer, "Late Strike From Trinity Rodman Lifts U.S. Women's National Team to Semifinals of 2024 Summer Olympics With 1-0
 *    Overtime Win vs. Japan" (3 Aug 2024) https://www.ussoccer.com/stories/2024/08/usa-vs-japan-score-result-goals-stats-highlights-match-recap-paris-olympics-quarterfinal
 *    ("Girma tried ... a longer, angled ball over the top. ... Her delivery into the right corner was won by Rodman ... Dunn tried it
 *    seconds later, this time from the center circle. Rodman was open again and this time she brought the ball down, raced into the box
 *    and cut the ball back against Japan's Hikaru Kitagawa before unleashing a perfect left-footed blast over the flying Yamashita and
 *    into the upper-left corner of the net"; goal summary: "A beautiful, long-range switch of play from Dunn found Rodman in the right
 *    corner ... Rodman beat Hikaru Kitagawa on the dribble and whipped a left-footed shot across the face of goal and into the upper left
 *    corner"; Japan "defended in a low block"; line-ups and numbers)
 *  - ESPN, "Trinity Rodman on Olympic goal: 'Best moment in my career'" (3 Aug 2024)
 *    https://www.espn.com/olympics/story/_/id/40717042/trinity-rodman-olympic-2024-goal-best-moment-my-career ("After taking the ball
 *    down on the right flank, she dribbled inside and blasted a shot that ripped into the upper corner of the far post as the Parc des
 *    Princes erupted"; "a sumptuous left-footed strike"; "I kind of blacked out ... The last thing I remember is Crystal playing it")
 *  - Wikipedia (raw wikitext): "Football at the 2024 Summer Olympics – Women's tournament – Knockout stage" (3 Aug 2024, 15:00, Parc des
 *    Princes, 43,004, referee Tess Olofsson (Sweden), Rodman 105+2', a.e.t.; line-ups with numbers and substitutions; the kit boxes: United
 *    States ALL WHITE, Japan ALL DARK NAVY #001040) and "Trinity Rodman" (5 ft 8 in; three goals at Paris 2024; the USA won gold, beating
 *    Brazil 1–0 in the final)
 * CONFIRMED by those accounts: the date, time, ground, crowd and referee; USA 1–0 Japan after extra time, the goal at 105+2 (the end of the
 * first period of extra time); Japan in a low block; Dunn's long switch from the centre circle; Rodman (5) open in the right corner, brought
 * the ball down, raced into the box, cut the ball back / beat Kitagawa (13) on the dribble, and hit a LEFT-footed shot across the face of
 * goal, over the diving Ayaka Yamashita (1), into the upper corner of the FAR post; the kits (USA all white, Japan all dark navy); the eleven
 * of each side on the pitch at 105+2 (USA — Naeher, Fox, Girma, Sonnett, Dunn, Albert, Lavelle, Horan, Rodman, Smith, Williams on for
 * Swanson 91'; Japan — Yamashita, Takahashi on for Koga 91', Kumagai, Minami, Moriya, Hasegawa, Nagano, Kitagawa, Hamano, Ueki, Miyazawa);
 * the USA then went on to win the gold medal.
 * INFERRED (illustrative reconstruction): Dunn's kicking foot (drawn right) and the pass's height and flight time; how Rodman brought it down
 * (drawn: a cushion on the right instep); the number and timing of her touches; which foot cut the ball back (drawn: the inside of the RIGHT
 * foot, dragging it across onto her left); Kitagawa's lunge to the outside; every spot and position (Rodman received ≈ 17 m from the byline
 * near the right touchline, cut back ≈ 8 m out, shot from ≈ 19 m to the far top corner); the ball's pace and curve; Yamashita's starting
 * spot, her keeper kit (drawn yellow) and dive; the direction of play (USA drawn attacking left to right on the main camera) and which end;
 * the celebration (a run to the right touchline, arms out); the Parc des Princes as drawn (a closed two-tier bowl under a roof ring; seat
 * colours, crowd colours with a Japanese blue corner, purple Olympic boards), the summer-afternoon light, the ball (white with navy panels),
 * boots, trim and number inks, hair (drawn in ponytails), the referee's kit, the TV camera positions and lenses. None of the inferred details
 * is named in the narration.
 *
 * FRAMING (the TV broadcast, never top-down; full-sheet card window 1.45:1 down to square, never sheet.safe): 1 = the high main-stand camera,
 * near real time, from Dunn in the centre circle, the long ball, Rodman's run and the goal; 2 = slow-motion replay from a low camera behind
 * Rodman's right shoulder: she attacks Kitagawa at full speed (a red arrow at the defender, a yellow speed trail), cuts the ball back (a red
 * cut arrow, a yellow spark) and the defender is beaten (the goal opens: a wedge to the posts); 3 = replay from behind Japan's goal: the
 * left-foot shot over Yamashita's dive into the far top corner, then the pan to the celebration and a gold burst; 4 = the lesson from a
 * raised coaching angle behind her (attack arrow at the defender, speed trail, the trick spark, the beaten defender). Every body is the
 * shared riso athlete (lib/plays/riso/athlete.ts) through ONE adapter, drawPlayer(): women's builds (1.6–1.78 m, slimmer bulk) with
 * ponytails that swing through `prev`. Handedness: the world is right-handed exactly like athlete.ts (x toward Japan's goal, y up, +z =
 * the USA's right = the near touchline under the main-stand camera), so strike({foot:'l'}) is Rodman's LEFT foot. Scenes read only (t, c);
 * every action keys off cue times, so the recorded voice (withTiming) re-times the film; every random value is seeded. Heat: small figures
 * print at 'low', only named figures at full detail, everything capped in a passage (≈ 150–330 plate ops a frame). */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,rectPath,partial,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow,footballPanels} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,runCycle,backpedal,lunge,strike,keeperSet,keeperDive,celebrate,stand,posed,blendPose,
 type Pose,type AthleteStyle,type InkFill,type Place,type Projector,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets (every cue starts with a plain word);
 * their `at` and each chapter's `seconds` are ESTIMATES (≈2.7 words/s + punctuation pauses) until the Kokoro voice exists. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The goal, live',text:'Paris, 2024, the Olympics: USA against Japan, in extra time. Crystal Dunn hits a long pass to Trinity Rodman on the right. She races at the defender... cuts inside... left foot... what a goal!',tail:2.4,
  cues:['Paris','the Olympics','against Japan','extra time','Crystal Dunn','Trinity Rodman','She races','cuts inside','left foot','what a goal']},
 {label:'Watch it again',text:'Watch again, slowly. Rodman attacks Hikaru Kitagawa at full speed, then cuts the ball back inside. The defender is beaten.',tail:1.6,
  cues:['Watch again','Rodman attacks','Hikaru Kitagawa','full speed','cuts the ball back','The defender is beaten']},
 {label:'Top corner',text:'Her left foot fires it over the diving keeper, into the top corner. The USA went on to win gold!',tail:2.2,
  cues:['Her left foot','the diving keeper','top corner','went on to win gold']},
 {label:'Your turn',text:'Your turn: attack the defender at speed, and be brave enough to try a trick.',tail:1.8,
  cues:['Your turn','attack the defender','at speed','brave enough','try a trick']},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py rodman-signature, which writes timing.json next to script.json. Then add
 *   import timingJson from '../../../public/plays/narration/rodman-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/rodman-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (calibrated on the voiced films, ≈ 2.6 words/s): .2 s + .02 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.2+.02*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.16;if(/[.!?]$/.test(w))t+=.3;if(/\.\.\.$/.test(w))t+=.2;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('rodman: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('rodman: no cue '+w);return c.at;};
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
/** Pitch metres (right-handed, like athlete.ts): X along the length (the USA attack +X; Japan's goal line at 105), Y up, Z across
 * (0 = the middle, +34 = the near touchline under the main-stand camera = the USA's right, Rodman's flank). */
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

// ---------------------------------------------------------------- the Parc des Princes on a summer afternoon
/** stand planes (a along, b up the rake 0..1): 0 the far side (−z), 1 behind the USA's own goal (x < 0), 2 the main stand (+z, the camera
 * side), 3 behind Japan's goal (x > 105). The Parc is a closed bowl: the planes run long so they meet in the corners. Two tiers each. */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-14,119,a),26*b,-38-26*b],
 (a,b)=>[-7-26*b,26*b,lerp(44+26*b,-44-26*b,a)],
 (a,b)=>[lerp(119,-14,a),28*b,38+28*b],
 (a,b)=>[112+26*b,26*b,lerp(-44-26*b,44+26*b,a)],
];
const STAND_COLS=[104,70,104,70],STAND_ROWS=[13,12,13,12],TIERS=[[.46],[.46],[.46],[.46]];
/** flags and banners at the stand fronts: [stand, a, b, 0 = a stars-and-stripes flag (red + paper stripes, a blue canton) | 1 = a Japan
 * flag (paper with a red disc) | 2 = a long red-white-and-blue banner] */
const FLAGS:[number,number,number,number][]=[[0,.2,.12,0],[0,.36,.56,2],[0,.55,.2,0],[0,.72,.6,1],[0,.86,.15,0],[1,.3,.2,0],[1,.62,.55,2],[3,.18,.22,1],[3,.34,.6,1],[3,.62,.2,0],[3,.8,.5,2],[2,.3,.15,0]];
function stadium(s:Sheet,c:Cam,v:View,t:number,which:number[],o:{roar?:number}={}){
 const{roar=0}=o,tt=twos(t);
 // a pale August sky, warmer toward the horizon
 s.tone(B,rectPath(-1e4,-1e4,2e4,2e4),.24);
 const hz=pr(c,add3(c.C,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz){s.knockout(polyPath([[-1e4,hz[1]+80],[1e4,hz[1]+80],[1e4,hz[1]-300],[-1e4,hz[1]-300]],true),.45);s.tone(Y,polyPath([[-1e4,hz[1]+80],[1e4,hz[1]+80],[1e4,hz[1]-160],[-1e4,hz[1]-160]],true),.2);}
 const planes=new Path2D(),tier=new Path2D(),roof=new Path2D(),edge=new Path2D();
 for(const i of which){const S=STANDS[i];addPoly(planes,polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]));for(const b of TIERS[i])seg3(c,S(0,b),S(1,b),.55,tier);
  // the roof ring: a deep cantilever over the upper tier, its concrete lip in shadow
  addPoly(roof,polyP(c,[add3(S(0,1),[0,1.2,0]),add3(S(1,1),[0,1.2,0]),add3(S(1,.55),[0,14,0]),add3(S(0,.55),[0,14,0])]));
  seg3(c,add3(S(0,.55),[0,13.8,0]),add3(S(1,.55),[0,13.8,0]),.7,edge);}
 // blue seats under the crowd, paper tier fascias
 s.knockout(planes);s.tone(B,planes,.6);s.tone(K,planes,.28);s.knockout(tier,.85);
 // the crowd: red, white and navy for the USA, a blue-and-white Japanese corner, a few yellow bibs; the roar lifts them
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si],rows=STAND_ROWS[si];for(let j=0;j<rows;j++){const b=(j+.5)/rows;if(TIERS[si].some(w=>Math.abs(b-w)<.04))continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,13);if(h<.2)continue;const a=(i+.5+(hash(i+j*31,9)-.5)*.6)/cols,q=toCam(c,S(a,b));if(q[2]<NEAR+3)continue;
   const p=scr(c,q);if(!inView(v,p))continue;const z=clamp(c.F*.6/q[2],2.4,16),jp=si===3&&a<.42,lift=roar>0&&!jp?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const ink=jp?(h<.6?3:0):h<.36?1:h<.66?0:h<.93?2:4;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.75);s.fill(R,inks[1],.95);s.fill(K,inks[2],.85);s.fill(B,inks[3],.95);s.fill(Y,inks[4],.95);
 s.knockout(roof);s.fill(K,roof,.92);s.knockout(edge,.7);
 const fl=new Path2D(),pap=new Path2D(),blu=new Path2D(),disc=new Path2D();
 for(const[si,a,b0,kind] of FLAGS){if(!which.includes(si))continue;const S=STANDS[si],w=kind===2?.1:.03,hb=kind===2?.04:.075,P=(u:number,b:number)=>S(a+u*w,b);
  const q=polyP(c,[P(0,b0),P(1,b0),P(1,b0+hb),P(0,b0+hb)]);if(q.length<3)continue;
  if(kind===1){pap.addPath(polyPath(q,true));const m=pr(c,P(.5,b0+hb/2)),e=pr(c,P(.72,b0+hb/2));if(m&&e){const r=Math.hypot(e[0]-m[0],e[1]-m[1])*.9;disc.moveTo(m[0]+r,m[1]);disc.arc(m[0],m[1],r,0,TAU);}continue;}
  fl.addPath(polyPath(q,true));
  if(kind===0){for(const k of[1,3])addPoly(pap,polyP(c,[P(0,b0+hb*k/5),P(1,b0+hb*k/5),P(1,b0+hb*(k+1)/5),P(0,b0+hb*(k+1)/5)]));addPoly(blu,polyP(c,[P(0,b0+hb*.55),P(.42,b0+hb*.55),P(.42,b0+hb),P(0,b0+hb)]));}
  else{addPoly(pap,polyP(c,[P(.33,b0),P(.66,b0),P(.66,b0+hb),P(.33,b0+hb)]));addPoly(blu,polyP(c,[P(.66,b0),P(1,b0),P(1,b0+hb),P(.66,b0+hb)]));}}
 s.knockout(fl);s.fill(R,fl,.95);s.knockout(pap,.95);s.knockout(blu);s.fill(B,blu,.95);s.fill(K,blu,.35);s.knockout(disc);s.fill(R,disc,.95);
}
/** grass with mowing stripes, the purple Olympic boards, paper lines, both goals (Japan's drawn later when the camera is behind it) */
function ground(s:Sheet,c:Cam,o:{bulge?:number;ballZ?:number;goalLater?:boolean}={}){
 const sr=polyP(c,[[-9,0,-38],[114,0,-38],[114,0,38],[-9,0,38]]);if(sr.length<3)return;const srp=polyPath(sr,true);s.knockout(srp);s.fill(Y,srp,.8);s.tone(B,srp,.9);s.tone(K,srp,.12);
 const g=polyP(c,[[-3,0,-36.5],[108,0,-36.5],[108,0,36.5],[-3,0,36.5]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.92);s.tone(B,gp,.8);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[k*5.25,0,-34],[(k+1)*5.25,0,-34],[(k+1)*5.25,0,34],[k*5.25,0,34]]));s.tone(K,st,.1);
 // the boards: Olympic purple (red over blue) with paper panels (no lettering) on the far side and behind both goals
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([-4,0,-37.2],[109,0,-37.2]);board([109,0,-37],[109,0,37]);board([-4,0,37],[-4,0,-37]);board([109,0,37.2],[-4,0,37.2]);
 for(let k=0;k<18;k++){const x=-2+k*6.2;addPoly(pn,polyP(c,[[x,.3,-37.15],[x+2.6,.3,-37.15],[x+2.6,.62,-37.15],[x,.62,-37.15]]));}
 for(let k=0;k<11;k++){const z=-34+k*6.4;addPoly(pn,polyP(c,[[108.95,.3,z],[108.95,.3,z+2.6],[108.95,.62,z+2.6],[108.95,.62,z]]));}
 s.knockout(bd);s.fill(R,bd,.7);s.fill(B,bd,.8);s.knockout(pn,.85);
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
/** a goal at X: posts at z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out around bz (high: the ball went in under the bar) */
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
const W_BUILD=(height:number,bulk=.9)=>({height,bulk,head:.97});
/** United States (confirmed: all white that day); navy trim and numbers (inferred) */
const USA=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:'paper',boots:K,skin:SKIN_L,hair:[Y,.8],line:K,trim:K,numberInk:K,hairStyle:'ponytail',build:W_BUILD(1.68),shade:[B,.32],...o});
/** Japan (confirmed: all dark navy that day); paper numbers, blue trim (inferred) */
const JPN=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[K,.9],shorts:[K,.9],socks:[K,.9],boots:K,skin:SKIN_L,hair:K,line:K,trim:[B,.9],numberInk:'paper',hairStyle:'ponytail',build:W_BUILD(1.62),shade:[K,.3],...o});
/** Trinity Rodman, number 5 (confirmed), 1.73 m (5 ft 8 in, confirmed); dark hair in a ponytail (inferred) */
const ROD_ST=USA({number:5,skin:SKIN_M,hair:K,build:W_BUILD(1.73,.9),seed:5});
/** Ayaka Yamashita, number 1: keeper kit inferred (yellow) */
const YAM_ST:AthleteStyle={shirt:[Y,.95],shorts:[Y,.95],socks:[Y,.95],boots:K,skin:SKIN_L,hair:K,hairStyle:'ponytail',line:K,gloves:'paper',sleeves:'long',trim:K,number:1,numberInk:K,build:W_BUILD(1.66,.92),seed:1};
/** Tess Olofsson: the referee's kit inferred (red shirt, navy shorts) */
const REF:AthleteStyle={shirt:[R,.9],shorts:[K,.9],socks:[K,.9],boots:K,skin:SKIN_L,hair:[Y,.75],hairStyle:'ponytail',line:K,trim:K,build:W_BUILD(1.7),seed:12};

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete: fluid FK body, kit inks, halftone shade, key line).
 * prev = the pose one drawing earlier (secondary motion: ponytails and hem trail); smear = a halftone echo + speed lines for fast limbs. */
function drawPlayer(s:Sheet,pose:Pose,camera:Projector,style:AthleteStyle,place:Place,o:{prev?:Pose;smear?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{threshold:10});
 return drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev}:{});
}

// ---------------------------------------------------------------- the players: keyframed tracks (τ = seconds after Rodman brings the ball down)
type Role='rod'|'usa'|'jpn'|'gk'|'ref';
/** a keyed move: lunge (full reach at `at`), a keeper dive (full stretch at `at`), a strike (contact at `at`) */
type Move={kind:'lunge'|'dive'|'strike';at:number;dur:number;side:'l'|'r';power?:number};
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];moves?:Move[];engage?:[number,number];key?:boolean};
const PASS=-2.35,CUT=2.5,SHOT=2.95,IN_NET=SHOT+.62;
/** Positions are Hermite-interpolated between keys [τ, X, Z]; the named beats follow the accounts, every spot is inferred. */
const ACTORS:Actor[]=[
 {name:'Rodman',role:'rod',style:ROD_ST,key:true,keys:[[-7,82.5,29],[-4.5,83.6,28.4],[-2.4,85.4,27.6],[-.8,87,26.7],[0,87.6,26.2],[.5,88.9,25.1],[1,90.8,23.2],[1.5,92.8,21],[2,95,18.5],[2.3,96.3,17],[2.5,96.9,16.3],[2.72,96.6,15.4],[2.95,96.2,14.6],[3.25,96.4,14.3],[3.8,97.2,15.6],[4.6,97.8,19.6],[5.4,97.8,24],[6.2,97.4,27.2],[7,97.2,28],[10,97.1,28.2]]},
 {name:'Dunn',role:'usa',style:USA({number:7,skin:SKIN_D,hair:K,build:W_BUILD(1.57),seed:7}),key:true,moves:[{kind:'strike',at:PASS,dur:.85,side:'r',power:.9}],keys:[[-7,47.2,-6.8],[-5,48.6,-6],[-3.2,50.2,-5.2],[PASS,51,-4.8],[-1,52,-4.3],[2,55,-3.4],[10,62,-2]]},
 {name:'Kitagawa',role:'jpn',style:JPN({number:13,build:W_BUILD(1.64),seed:13}),key:true,engage:[-.5,3.2],moves:[{kind:'lunge',at:2.55,dur:.75,side:'l'}],keys:[[-7,96.5,16],[-3,95.8,18.4],[0,95.2,20.2],[.8,96.2,19.4],[1.6,97.4,18.3],[2.2,98.1,17.3],[2.5,98.4,16.9],[2.8,98.8,17.2],[3.4,98.9,17.5],[4.5,98.4,17.2],[10,98,17]]},
 {name:'Minami',role:'jpn',style:JPN({number:3,build:W_BUILD(1.72),seed:3}),key:true,engage:[1,3.4],moves:[{kind:'lunge',at:3.02,dur:.7,side:'r'}],keys:[[-7,100,8],[0,99.6,9.6],[1.5,99.4,11],[2.5,99.2,12.2],[3.1,99,12.7],[10,99.2,12.8]]},
 {name:'Kumagai',role:'jpn',style:JPN({number:4,build:W_BUILD(1.72),seed:4}),engage:[1,3.4],keys:[[-7,100.6,1.5],[0,100.4,3],[3,100.2,4.8],[10,100.4,5]]},
 {name:'Takahashi',role:'jpn',style:JPN({number:5,build:W_BUILD(1.66),seed:15}),keys:[[-7,100.4,-6],[0,100.6,-4.5],[3,100.8,-2.4],[10,101,-2]]},
 {name:'Moriya',role:'jpn',style:JPN({number:20,build:W_BUILD(1.6),seed:20}),keys:[[-7,95,-19],[0,96.4,-15],[3,98.4,-10.5],[10,99,-9]]},
 {name:'Hasegawa',role:'jpn',style:JPN({number:14,build:W_BUILD(1.57),seed:14}),keys:[[-7,88,4.5],[0,90,6.4],[3,93.4,9.5],[10,95,10]]},
 {name:'Nagano',role:'jpn',style:JPN({number:10,build:W_BUILD(1.65),seed:10}),keys:[[-7,86.5,-3],[0,89,-1],[3,92.2,2.2],[10,94,3]]},
 {name:'Miyazawa',role:'jpn',style:JPN({number:7,build:W_BUILD(1.64),seed:17}),keys:[[-7,85,12],[0,88,16.2],[1.5,91,17.8],[3,93.8,17.6],[10,95,17]]},
 {name:'Hamano',role:'jpn',style:JPN({number:17,build:W_BUILD(1.62),seed:27}),keys:[[-7,72,5],[10,78,6]]},
 {name:'Ueki',role:'jpn',style:JPN({number:9,build:W_BUILD(1.64),seed:29}),keys:[[-7,69,-8],[10,74,-6]]},
 {name:'Smith',role:'usa',style:USA({number:11,skin:SKIN_D,hair:K,build:W_BUILD(1.68),seed:11}),keys:[[-7,95.5,-10],[0,97,-8.6],[3,99.6,-5.4],[5,99.8,-2],[10,98.6,10]]},
 {name:'Williams',role:'usa',style:USA({number:8,skin:SKIN_D,hair:K,build:W_BUILD(1.68),seed:8}),keys:[[-7,97.6,-1],[0,98.4,0],[3,100.2,1.6],[5,100,6],[10,98,16]]},
 {name:'Horan',role:'usa',style:USA({number:10,build:W_BUILD(1.75),seed:9}),keys:[[-7,80,2],[0,84,3.4],[3,89,6.5],[10,93,12]]},
 {name:'Lavelle',role:'usa',style:USA({number:16,hair:[Y,.55],build:W_BUILD(1.63),seed:16}),keys:[[-7,78,-12],[0,82,-10],[3,87,-6],[10,91,2]]},
 {name:'Fox',role:'usa',style:USA({number:2,hair:[Y,.7],build:W_BUILD(1.68),seed:2}),keys:[[-7,72,28],[0,78,27.6],[3,86,27],[10,92,26]]},
 {name:'Albert',role:'usa',style:USA({number:3,hair:[Y,.7],build:W_BUILD(1.72),seed:31}),keys:[[-7,64,2],[10,70,3]]},
 {name:'Girma',role:'usa',style:USA({number:4,skin:SKIN_D,hair:K,build:W_BUILD(1.7),seed:41}),keys:[[-7,54,8],[10,60,8]]},
 {name:'Sonnett',role:'usa',style:USA({number:14,hair:[Y,.8],build:W_BUILD(1.7),seed:42}),keys:[[-7,53,-12],[10,58,-11]]},
 {name:'Yamashita',role:'gk',style:YAM_ST,key:true,moves:[{kind:'dive',at:SHOT+.5,dur:.95,side:'r'}],keys:[[-7,103.4,.6],[0,103.6,1.6],[2,103.9,2.5],[2.8,104,2.8],[10,104,2.8]]},
 {name:'referee',role:'ref',style:REF,keys:[[-7,74,7],[0,80,10],[10,88,12]]},
];
const ROD=0,DUN=1,KIT=2,MIN=3,YAM=20;
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const T0=-7.5,T1=10,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const smooth=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau),b=posOf(k,tau-.3),d=posOf(k,tau-.6);return[(a[0]+b[0]+d[0])/3,(a[1]+b[1]+d[1])/3];};

// ---------------------------------------------------------------- the ball: Dunn's switch, the cushion, the run, the cut back, the shot
/** Rodman's touches: the cushion (0), right-foot pushes on the run, the right-foot cut back (CUT); then the left-foot shot (inferred count) */
const TOUCHES=[0,.55,1.1,1.62,2.1,CUT,SHOT];
/** where the shot goes: the upper corner of the far post (confirmed), under the bar */
const GOALPT:V3=[105,2.14,-3.08],NET:V3=[106.5,1.75,-3.3],REST:V3=[106.2,.11,-2.8];
/** her heading: along the run, square to the shot around the strike (the ball goes across goal to the far post), then free */
const SHOT_YAW=(()=>{const p=posOf(ROD,SHOT),dx=GOALPT[0]-p[0],dz=GOALPT[2]-p[1];return yawOf(dx,dz)+.22;})();
function yawRod(tau:number):number{
 const v=velOf(ROD,tau),head=Math.hypot(v[0],v[1])>.4?yawOf(v[0],v[1]):yawOf(1,-.6);
 if(tau<.1){const d=posOf(DUN,PASS),m=posOf(ROD,tau),face=yawOf(d[0]-m[0],d[1]-m[1]);return lerpA(face,head,sm(-.9,.35,tau,easeInOutSine));}
 const w=sm(CUT+.05,SHOT-.12,tau)*(1-sm(SHOT+.45,SHOT+1,tau));return lerpA(head,SHOT_YAW,w);
}
/** her forward and right directions on the ground (x, z) */
const fwdR=(y:number):[Pt,Pt]=>[[Math.cos(y),-Math.sin(y)],[Math.sin(y),Math.cos(y)]];
/** the ball spot for a touch: ahead of her and a little to the side of the touching foot */
function footAt(tau:number,side:'l'|'r'):[number,number]{const y=yawRod(tau),p=posOf(ROD,tau),[f,r]=fwdR(y),sd=side==='r'?1:-1;return[p[0]+f[0]*.52+r[0]*.14*sd,p[1]+f[1]*.52+r[1]*.14*sd];}
const TP=TOUCHES.map(T=>footAt(T,T===SHOT?'l':'r'));
const S0=TP[TP.length-1];
/** the shot: whipped across the face of goal, rising all the way over the diving keeper (a gentle bend back toward the far post) */
const CURL:[Pt,Pt,Pt]=(()=>{const dx=GOALPT[0]-S0[0],dz=GOALPT[2]-S0[1],l=Math.hypot(dx,dz),rx=-dz/l,rz=dx/l,k=.07*l;return[[S0[0],S0[1]],[(S0[0]+GOALPT[0])/2+rx*k,(S0[1]+GOALPT[2])/2+rz*k],[GOALPT[0],GOALPT[2]]];})();
function curlAt(u:number):V3{const a=(1-u)*(1-u),b=2*u*(1-u),c=u*u;return[a*CURL[0][0]+b*CURL[1][0]+c*CURL[2][0],.12+(GOALPT[1]-.12)*Math.pow(u,1.05)+.45*Math.sin(Math.PI*u),a*CURL[0][1]+b*CURL[1][1]+c*CURL[2][1]];}
/** Dunn's boot at the pass, and the cushion spot (the ball dropping onto Rodman's raised right instep) */
const DP=():[number,number]=>{const d=posOf(DUN,PASS);return[d[0]+.5,d[1]+.12];};
function ballAt(tau:number):V3{
 if(tau<PASS){const d=posOf(DUN,tau);return[d[0]+.52+.08*Math.sin(tau*4),.11,d[1]+.12];}// at Dunn's feet in the centre circle
 if(tau<0){const u=(tau-PASS)/-PASS,a=DP(),b=TP[0],e=1-Math.pow(1-u,1.25);return[lerp(a[0],b[0],e),lerp(.11,.42,u)+4*8.2*u*(1-u),lerp(a[1],b[1],e)];}// the long switch
 if(tau<SHOT){let k=0;while(k+1<TOUCHES.length&&tau>=TOUCHES[k+1])k++;const u=(tau-TOUCHES[k])/(TOUCHES[k+1]-TOUCHES[k]),e=1-Math.pow(1-u,2.4);
  const y=k===0?.11+.31*Math.pow(1-u,2)+.12*Math.max(0,Math.sin(Math.PI*u*2))*(1-u):.11;return[lerp(TP[k][0],TP[k+1][0],e),y,lerp(TP[k][1],TP[k+1][1],e)];}
 if(tau<IN_NET)return curlAt((tau-SHOT)/(IN_NET-SHOT));
 const u=clamp((tau-IN_NET)/.2);if(u<1)return lerp3(GOALPT,NET,u);
 const w=clamp((tau-IN_NET-.2)/.5),e=w*w;return[lerp(NET[0],REST[0],w),lerp(NET[1],REST[1],e),lerp(NET[2],REST[2],w)];
}
const bulgeAt=(tau:number)=>tau<IN_NET?0:Math.exp(-(tau-IN_NET)*2.2)*(1+.3*Math.sin((tau-IN_NET)*14));

// ---------------------------------------------------------------- poses (angles in degrees via posed; the athlete clamps to real range of motion)
const RAD=Math.PI/180;
const LIN=new Set(['dx','dz','air','lHand','rHand','squash']);
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LIN.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:10,rHipA:10,lean:16,pitch:4,lShA:26,rShA:26,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
/** bringing it down: the right leg lifted, the instep cushioning the dropping ball, arms out for balance, eyes on the ball */
const CUSHION:Partial<Pose>={lean:8,lKnee:30,lHipF:6,rHipF:58,rKnee:62,rAnk:-8,rHipR:18,lShA:52,rShA:44,lElb:34,rElb:30,neckP:30,squash:-.03};
/** a push on the run: the right boot reaching the ball, a glance down */
const PUSH_R:Partial<Pose>={rHipF:40,rKnee:26,rAnk:28,rHipR:10,neckP:18};
/** the cut back: plant on the left, the right inside foot hooks the ball across her body, dipped low to the left, left arm out */
const CUTBACK:Partial<Pose>={roll:-12,bend:-12,lean:24,lKnee:58,lHipF:22,rHipF:30,rHipA:-20,rHipR:34,rKnee:42,rAnk:-6,lShA:76,lShF:10,lElb:30,rShA:36,rElb:40,neckP:24,neckY:14,squash:-.05};
/** the whole pose of actor k at τ, with its yaw */
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),m=posOf(ROD,tau),b=ballAt(tau);
 let yaw=sp>.45?yawOf(v[0],v[1]):yawOf(b[0]-x,b[2]-z);
 if(a.engage&&tau>a.engage[0]-.4&&tau<a.engage[1]+.4)yaw=lerpA(yaw,yawOf(m[0]-x,m[1]-z),Math.min(sm(a.engage[0]-.4,a.engage[0],tau),1-sm(a.engage[1],a.engage[1]+.4,tau)));
 // the keeper tracks the ball, then is set square to the shot (a dive's direction is fixed at the set: her right = −z, the far post)
 if(a.role==='gk')yaw=lerpA(yawOf(b[0]-x,b[2]-z),yawOf(-1,.9),sm(SHOT-.4,SHOT,tau));
 if(k===ROD)yaw=yawRod(tau);
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 let p:Pose;
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='jpn'?READY:stand();
 if(sp>.5&&along<-.35*sp&&k!==ROD)p=blendPose(idle,backpedal(distOf(k,tau)/1.2),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5),cyc=k===ROD?3:3.3;p=blendPose(idle,runCycle(distOf(k,tau)/cyc,{speed:s}),clamp((sp-.4)/.9));}
 for(const mv of a.moves??[]){const lead=mv.kind==='dive'?.55:mv.kind==='strike'?.52:.6,t0=mv.at-lead*mv.dur,u=(tau-t0)/mv.dur;
  if(mv.kind==='lunge'&&u>0&&u<1.6)p=blendPose(p,lunge(Math.min(1,u),{side:mv.side}),Math.min(sm(0,.12,u),1-sm(1.1,1.6,u)));
  if(mv.kind==='dive'&&u>0)p=keeperDive(Math.min(1,u),{side:mv.side,height:1});
  if(mv.kind==='strike'&&u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:mv.side,power:mv.power??.7}),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));}
 if(k===ROD){
  p=over(p,CUSHION,bump(-.45,.3,tau));
  for(const T of TOUCHES)if(T>.3&&T<CUT&&Math.abs(tau-T)<.2)p=over(p,PUSH_R,bump(T-.2,T+.12,tau));
  p=over(p,CUTBACK,bump(CUT-.22,CUT+.3,tau));
  const D=.8,st=SHOT-.52*D,u=(tau-st)/D;
  if(u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:'l',power:.95}),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));
  if(tau>IN_NET+.3)p=blendPose(p,celebrate(tau*.85,{kind:'run'}),sm(IN_NET+.3,IN_NET+.8,tau)*(1-sm(6.6,7,tau)));
  if(tau>6.6)p=blendPose(p,celebrate((tau-6.6)*.9,{kind:'arms'}),sm(6.6,7,tau));
 }
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
 // soft afternoon shadows, batched in one op; big figures cast their own through the athlete
 const sh=new Path2D();for(const e of list)if(e.h<420)sh.addPath(polyPath(blob(e.g[0]+e.h*.05,e.g[1],e.h*.14,e.h*.035,ACTORS[e.k].style.seed??1,{amp:.05,n:14}),true));
 if(bground&&bg)sh.addPath(polyPath(blob(bground[0],bground[1],br*.8,br*.25,2,{amp:.05,n:12}),true));s.tone(K,sh,.42);
 list.sort((p,q)=>q.d-p.d);
 const drawBall=()=>{if(bg)ball(s,bg[0],bg[1],br,Math.hypot(b[0],b[2])/.11);};
 let ballDone=!list.length||bq[2]>=list[0].d,heroR:DrawResult|undefined;if(ballDone)drawBall();
 for(const e of list){if(!ballDone&&bq[2]>=e.d){drawBall();ballDone=true;}
  const a=ACTORS[e.k],{p,yaw}=poseOf(e.k,tauP),px=e.h*ppu,big=e.h>=300,named=full?full.includes(e.k):a.key;
  // phone heat: low detail for small figures and extras; during a passage only the hero keeps 'mid'
  const detail=passing?(e.k===ROD?'mid':'low'):px<50||(!named&&px<120)?'low':'auto';
  const r=drawPlayer(s,p,c,{...a.style,shadow:e.h<420?false:undefined,detail},{x:e.x,z:e.z,yaw},big&&(e.k===ROD||e.h>520)&&!passing?{prev:poseOf(e.k,tauPrev).p,smear:hero&&e.k===ROD}:{});
  if(e.k===ROD)heroR=r;}
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
/** the shooting angle: a wedge on the grass from the ball to both posts — the goal opening up once the defender is beaten */
function angleWedge(s:Sheet,c:Cam,from:[number,number],w:number,ink=Y){if(w<=0)return;
 const a=pr(c,[from[0],0,from[1]]),p1=pr(c,[105,0,-3.66]),p2=pr(c,[105,0,3.66]);if(!a||!p1||!p2)return;
 const wedge=polyPath([a,p1,p2],true);s.knockout(wedge,.35*w);s.tone(ink,wedge,.55*w);
 const q=toCam(c,[from[0],0,from[1]]),lw=Math.max(3,c.F*.05/q[2]);s.fill(ink,ribbon([a,p1],lw,{seed:91,taper:.3,wobble:.6}),.95*w);s.fill(ink,ribbon([a,p2],lw,{seed:92,taper:.3,wobble:.6}),.95*w);}
/** a path on the grass along her run between two moments (optionally dashed), arrowhead at the end */
function runPath(s:Sheet,c:Cam,ink:string,w:number,prog:number,a0:number,a1:number,seed:number,dashed=true){if(w<=0)return;
 const pts:Pt[]=[];for(let i=0;i<=24;i++){const tau=lerp(a0,a1,i/24),m=posOf(ROD,tau),q=pr(c,[m[0],0,m[1]]);if(q)pts.push(q);}if(pts.length<6)return;
 const sub=partial(pts,clamp(prog)),m=posOf(ROD,lerp(a0,a1,.5)),q=toCam(c,[m[0],0,m[1]]),wd=Math.max(5,c.F*.13/q[2]);
 s.knockout(ribbon(sub,wd*1.6,{seed,taper:.1,wobble:.8}),.7*w);s.fill(ink,ribbon(sub,wd,{seed:seed+1,taper:.1,wobble:.8,gaps:dashed?[[.18,.24],[.42,.48],[.66,.72]]:[]}),.95*w);
 if(sub.length>2&&prog>.15){const e=sub[sub.length-1],pv=sub[Math.max(0,sub.length-3)];laneArrow(s,ink,pv,e,wd,{seed:seed+2,head:wd*3.2,cov:.95*w});}}
/** "attack the defender": a straight red arrow on the grass from her to the defender */
function attackArrow(s:Sheet,c:Cam,from:[number,number],to:[number,number],w:number,prog=1){if(w<=0)return;
 const e:[number,number]=[lerp(from[0],to[0],.82*clamp(prog)),lerp(from[1],to[1],.82*clamp(prog))],a=pr(c,[from[0],0,from[1]]),b=pr(c,[e[0],0,e[1]]);if(!a||!b)return;
 const q=toCam(c,[e[0],0,e[1]]),wd=Math.max(5,c.F*.16/q[2]);s.knockout(ribbon([a,b],wd*1.6,{seed:66,taper:.1,wobble:.6}),.7*w);laneArrow(s,R,a,b,wd,{seed:67,head:wd*3.2,cov:.95*w});}
/** a ring round a boot */
function bootRing(s:Sheet,hero:DrawResult|undefined,w:number,side:'l'|'r'='l',ink=Y){if(!hero||w<=0)return;const toe=side==='l'?hero.joints.lToe:hero.joints.rToe,an=side==='l'?hero.joints.lAn:hero.joints.rAn,r=Math.hypot(toe[0]-an[0],toe[1]-an[1])*1.3*w+2,cx=(toe[0]+an[0])/2,cy=(toe[1]+an[1])/2,pts:Pt[]=[];
 for(let i=0;i<26;i++){const a=i/26*TAU;pts.push([cx+Math.cos(a)*r*1.2,cy+Math.sin(a)*r*.85]);}
 const rr=ribbon(pts,Math.max(3,r*.2),{seed:82,close:true,taper:0,wobble:.8});s.knockout(rr,.8*w);s.fill(ink,rr,.95*w);}
/** the shot: a yellow dashed trail through the air along the ball's path, from the boot to where it is now (or all of it) */
function shotTrail(s:Sheet,c:Cam,tau:number,w:number,full=false){if(w<=0)return;const end=full?1:clamp((tau-SHOT)/(IN_NET-SHOT));if(end<=.02)return;
 const pts:Pt[]=[];for(let i=0;i<=28;i++){const q=pr(c,curlAt(end*i/28));if(q)pts.push(q);}if(pts.length<4)return;const q=toCam(c,curlAt(end*.5)),wd=Math.max(4,c.F*.09/q[2]);
 s.knockout(ribbon(pts,wd*1.5,{seed:71,taper:.4,wobble:.6}),.6*w);s.fill(Y,ribbon(pts,wd,{seed:72,taper:.4,wobble:.6,gaps:[[.12,.18],[.3,.36],[.48,.54],[.66,.72],[.84,.9]]}),.95*w);}
/** the far top corner: a ring in the goal mouth where the ball goes in */
function cornerRing(s:Sheet,c:Cam,w:number,ink=Y){if(w<=0)return;const pts:Pt[]=[];
 for(let i=0;i<30;i++){const a=i/30*TAU,q=pr(c,[105,GOALPT[1]+Math.sin(a)*.42,GOALPT[2]+Math.cos(a)*.5]);if(q)pts.push(q);}if(pts.length<20)return;
 const q=toCam(c,[105,GOALPT[1],GOALPT[2]]),rr=ribbon(pts,Math.max(4,c.F*.07/q[2]),{close:true,seed:77,taper:0,wobble:1});s.knockout(rr,.85*w);s.fill(ink,rr,.95*w);}
/** the trick: a yellow spark at the ball as she cuts it back */
function trickSpark(s:Sheet,c:Cam,w:number,seed=58){if(w<=0)return;const b=TP[TOUCHES.indexOf(CUT)],q=toCam(c,[b[0],.25,b[1]]);if(q[2]<NEAR)return;const g=scr(c,q);
 sparkBurst(s,Y,g[0],g[1],c.F*.9/q[2],{n:9,seed,g:easeOutBack(clamp(w)),width:Math.max(6,c.F*.06/q[2]),cov:.95});}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, near real time
const tau1=(t:number)=>{const G=CUE(0,'what a goal');return key(t,mono([[0,-6.6],[CUE(0,'Crystal'),PASS-.3],[CUE(0,'Trinity'),-.2],[CUE(0,'She races'),.4],[CUE(0,'cuts inside'),CUT-.1],[CUE(0,'left foot'),SHOT-.05],[G,IN_NET+.05],[SECS(0)+1,IN_NET+.05+(SECS(0)+1-G)*.9]]),linear);};
const CAM1:V3=[60,24,68];
function cam1(t:number):Cam{
 const G=CUE(0,'what a goal'),S=SECS(0),tau=tau1(t);
 const bs=(u:number):V3=>{const b=ballAt(Math.min(u,SHOT));return[b[0],0,b[2]];},b0=bs(tau),b1=bs(tau-.35),b2=bs(tau-.7),bt:V3=[(b0[0]+b1[0]+b2[0])/3,0,(b0[2]+b1[2]+b2[2])/3];
 const open:V3=[68,4,2],m=posOf(ROD,tau),cel:V3=[m[0]-1,1,m[1]-1];
 const toBall=sm(CUE(0,'the Olympics'),CUE(0,'Crystal')+.2,t,easeInOutSine),toS=sm(G+.5,G+1.6,t,easeInOutSine),toGoal=sm(CUE(0,'She races'),CUE(0,'left foot'),t,easeInOutSine)*(1-toS);
 const tb:V3=[lerp(open[0],bt[0]+3+3*toGoal,toBall),lerp(open[1],1.5,toBall),lerp(open[2],lerp(bt[2],6,.2+.25*toGoal),toBall)],T=lerp3(tb,cel,toS);
 const F=key(t,mono([[0,2100],[CUE(0,'against Japan'),2500],[CUE(0,'Crystal'),3100],[CUE(0,'Trinity'),3600],[CUE(0,'She races'),4500],[CUE(0,'cuts inside'),5300],[G,5600],[G+1.6,7000],[S,7400]]),easeInOutSine);
 return look(CAM1,T,F);
}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),tau=tau1(t),tp=tau1(twos(t)),G=CUE(0,'what a goal');
  stadium(s,c,v,t,[0,1,3],{roar:sm(G-.1,G+.5,t)});
  ground(s,c,{bulge:bulgeAt(tau),ballZ:GOALPT[2]});
  play(s,c,v,tau,tp,tau1(twos(t)-1/12),{minBall:8});
 },
 aperture(t){const c=cam1(t),[x,z]=posOf(ROD,tau1(t)),q=toCam(c,[x,1,z]),g=scr(c,q),h=c.F*1.65/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.09),12);},
 still:6,
};

// ---------------------------------------------------------------- 2 · slow replay, a low camera behind Rodman's right shoulder
const tau2=(t:number)=>key(t,mono([[0,-.5],[CUE(1,'Rodman'),-.05],[CUE(1,'Hikaru'),.45],[CUE(1,'full speed'),1.15],[CUE(1,'cuts the ball'),CUT-.08],[CUE(1,'The defender'),CUT+.3],[SECS(1),CUT+.42]]),linear);
function cam2(t:number):Cam{
 const tau=tau2(t),m=smooth(ROD,Math.min(tau,SHOT)),open=1-sm(0,1.2,t,easeInOutSine),wide=sm(CUE(1,'The defender')-.4,CUE(1,'The defender')+.5,t,easeInOutSine);
 const C:V3=[m[0]-4.6-1.5*open-.5*wide,1.7+.4*open+1*wide,m[1]+6.6+1.5*open+1.4*wide],T:V3=[lerp(m[0]+3,100.5,wide*.75),lerp(.95,1.1,wide),lerp(m[1]-2.6,5,wide*.75)];
 return look(C,T,lerp(2600-300*open,2150,wide));
}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),tau=tau2(t),tp=tau2(twos(t)),ra=CUE(1,'Rodman'),hk=CUE(1,'Hikaru'),fs=CUE(1,'full speed'),cb=CUE(1,'cuts the ball'),db=CUE(1,'The defender'),E=SECS(1);
  stadium(s,c,v,t,[0,3]);
  ground(s,c);
  const out=1-sm(E-.7,E-.3,t);
  // "Rodman attacks": a red arrow at the defender; "Hikaru Kitagawa": a navy ring round her; "full speed": the yellow speed trail
  attackArrow(s,c,posOf(ROD,Math.min(tau,CUT-.4)),posOf(KIT,Math.min(tau,CUT)),sm(ra-.1,ra+.3,t)*(1-sm(cb-.2,cb+.2,t)),sm(ra-.1,ra+.6,t));
  groundRing(s,c,...posOf(KIT,Math.min(tau,CUT+.5)),.85,K,sm(hk-.15,hk+.3,t,easeOutBack)*out,44);
  runPath(s,c,Y,sm(fs-.2,fs+.2,t)*out,sm(fs-.2,fs+.8,t),-.2,Math.min(CUT-.05,Math.max(.3,tau)),61);
  // "cuts the ball back": the red cut arrow; "the defender is beaten": the goal opens up
  runPath(s,c,R,sm(cb-.15,cb+.2,t)*out,sm(cb-.15,cb+.6,t),CUT-.12,SHOT-.02,64,false);
  angleWedge(s,c,[ballAt(Math.min(tau,SHOT))[0],ballAt(Math.min(tau,SHOT))[2]],sm(db-.15,db+.45,t,easeOutBack)*(1-sm(E-.5,E-.2,t)));
  play(s,c,v,tau,tp,tau2(twos(t)-1/12),{minBall:5,hero:true,full:[ROD,KIT,MIN,YAM],after:()=>{
   trickSpark(s,c,sm(cb-.05,cb+.3,t)*(1-sm(db+.2,db+.6,t)));}});
  streaks(s,v,1-sm(0,.5,t),21);
 },
 aperture(t){const c=cam2(t),m=posOf(ROD,tau2(t)),q=toCam(c,[m[0],1.4,m[1]]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.14/q[2]),12);},
 still:1.2,
};

// ---------------------------------------------------------------- 3 · replay from behind Japan's goal: the shot, the corner, the dive, the celebration
const tau3=(t:number)=>{const wg=CUE(2,'went on');return key(t,mono([[0,CUT+.15],[CUE(2,'Her left'),SHOT-.1],[CUE(2,'the diving'),SHOT+.3],[CUE(2,'top corner'),IN_NET-.05],[wg,5.4],[SECS(2),5.4+(SECS(2)-wg)*.8]]),linear);};
const swing3=(t:number)=>sm(CUE(2,'top corner')+.4,CUE(2,'went on')+.3,t,easeInOutSine);
function cam3(t:number):Cam{
 const tau=tau3(t),u=swing3(t),C:V3=[117,4.8+.8*u,-6.5+3*u],e=sm(SHOT-.3,IN_NET,tau,easeInOutSine);
 const m=smooth(ROD,Math.min(tau,7.2)),T0:V3=[lerp(97.5,101.8,e),lerp(1.2,1.6,e),lerp(11,2.2,e)],T1:V3=[m[0]-.3,1.1,m[1]-.5];
 return look(C,lerp3(T0,T1,u),lerp(lerp(3900,3500,e),6400,u));
}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),tau=tau3(t),tp=tau3(twos(t)),lf=CUE(2,'Her left'),dk=CUE(2,'the diving'),tc=CUE(2,'top corner'),wg=CUE(2,'went on'),u=swing3(t);
  stadium(s,c,v,t,[0,1,2],{roar:sm(IN_NET,IN_NET+.3,tau)});
  ground(s,c,{goalLater:u<.5});
  groundRing(s,c,...posOf(YAM,Math.min(tau,SHOT)),.8,K,sm(dk-.15,dk+.3,t,easeOutBack)*(1-sm(tc+.4,tc+.8,t)),45);
  play(s,c,v,tau,tp,tau3(twos(t)-1/12),{minBall:5,hero:true,full:[ROD,KIT,MIN,YAM],after:({hero})=>{
   bootRing(s,hero,sm(lf-.1,lf+.3,t,easeOutBack)*(1-sm(dk,dk+.4,t)),'l');
   shotTrail(s,c,tau,sm(lf-.05,lf+.2,t)*(1-sm(wg-.3,wg+.1,t)));}});
  if(u<.5){goal3(s,c,105,1,bulgeAt(tau),GOALPT[2]);cornerRing(s,c,sm(tc-.15,tc+.3,t,easeOutBack)*(1-sm(wg-.3,wg+.1,t)));}
  // "went on to win gold": a gold (yellow) burst over the celebration
  const gw=sm(wg-.1,wg+.4,t);if(gw>0){const m=posOf(ROD,tau),q=pr(c,[m[0],2.7,m[1]]);if(q)sparkBurst(s,Y,q[0],q[1],c.F*1.5/toCam(c,[m[0],2.7,m[1]])[2],{n:12,seed:88,g:easeOutBack(gw),width:12,cov:.95});}
  streaks(s,v,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3(t),[x,z]=posOf(ROD,tau3(t)),q=toCam(c,[x,1.1,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.16/q[2]),12);},
 still:2.6,
};

// ---------------------------------------------------------------- 4 · the lesson: a raised coaching angle behind her, the whole move marked out
const tau4=(t:number)=>key(t,mono([[0,-.3],[CUE(3,'Your'),-.2],[CUE(3,'attack'),.35],[CUE(3,'at speed'),1.5],[CUE(3,'brave'),CUT-.3],[CUE(3,'try a trick'),CUT+.05],[SECS(3),SHOT+.2]]),linear);
function cam4(t:number):Cam{
 const tau=tau4(t),orbit=sm(CUE(3,'brave')-.5,CUE(3,'try a trick')+.3,t,easeInOutSine),m=smooth(ROD,Math.min(tau,SHOT));
 const C:V3=[lerp(82.5,86,orbit),lerp(7,6.4,orbit),lerp(33,29,orbit)],T:V3=[lerp(m[0]+4,97.5,orbit*.7),.2,lerp(m[1]-3.2,13,orbit*.7)];
 return look(C,T,lerp(2700,2800,orbit));
}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),tau=tau4(t),tp=tau4(twos(t)),yt=CUE(3,'Your'),at=CUE(3,'attack'),as=CUE(3,'at speed'),br=CUE(3,'brave'),tr=CUE(3,'try a trick'),E=SECS(3),out=1-sm(E-.6,E-.3,t);
  stadium(s,c,v,t,[0,3]);
  ground(s,c);
  groundRing(s,c,...posOf(ROD,Math.min(tau,.2)),.8,R,sm(yt,yt+.4,t,easeOutBack)*(1-sm(as,as+.4,t)),42);
  attackArrow(s,c,posOf(ROD,.2),posOf(KIT,CUT),sm(at-.2,at+.2,t)*out,sm(at-.1,at+.7,t));
  groundRing(s,c,...posOf(KIT,Math.min(tau,CUT+.6)),.85,K,sm(at,at+.4,t,easeOutBack)*out,44);
  runPath(s,c,Y,sm(as-.2,as+.2,t)*out,sm(as-.2,as+.9,t),0,Math.min(CUT-.05,Math.max(.3,tau)),61);
  runPath(s,c,R,sm(tr-.15,tr+.2,t)*out,sm(tr-.15,tr+.6,t),CUT-.12,SHOT-.02,64,false);
  play(s,c,v,tau,tp,tau4(twos(t)-1/12),{minBall:5,hero:true,full:[ROD,KIT,MIN,YAM],after:({hero})=>{
   bootRing(s,hero,sm(br-.1,br+.3,t,easeOutBack)*(1-sm(tr+.2,tr+.6,t)),'r',R);
   trickSpark(s,c,sm(tr-.05,tr+.35,t)*out,59);}});
  angleWedge(s,c,S0,sm(tr+.4,tr+.9,t)*out*.8);
 },
 still:2.6,
};

const film:RisoStory={
 id:'rodman-signature',format:'11v11',title:"Rodman's run past the full-back",theme:'Attacking the defender at speed and being brave enough to try a trick',
 ageNote:'Olympic quarter-final, United States 1–0 Japan (after extra time), Parc des Princes, Paris, 3 August 2024: Trinity Rodman\'s 105+2nd-minute winner. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a divot of turf kicked up — green and paper bits thrown up, a yellow touch spark. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}puff(s,x,y,age,seed);if(age<.35)sparkBurst(s,Y,x,y-20,110,{n:7,seed:seed+1,g:easeOutBack(clamp(age/.15))*(1-clamp((age-.2)/.15)),width:15});},
};
/** turf puff: green and paper bits thrown from a point, ballistic, 0..1 s */
function puff(s:Sheet,x:number,y:number,age:number,seed:number){
 if(age<0||age>1)return;const r=rng(seed),a=new Path2D(),b=new Path2D(),u=easeOut(clamp(age/.7)),fl=Math.sin(Math.min(1,age/.8)*Math.PI);
 for(let i=0;i<14;i++){const ang=-Math.PI/2+(r()-.5)*2.2,d=(40+r()*170)*u*2,px=x+Math.cos(ang)*d,py=y+Math.sin(ang)*d*.5-fl*(30+r()*70)*2,z=12+r()*16;(i%3?b:a).addPath(polyPath(blob(px,py,z,z*.8,i+seed,{amp:.1,n:10}),true));}
 const fade=1-clamp((age-.6)/.4);s.knockout(a,.95*fade);s.fill(Y,b,.9*fade);s.tone(B,b,.7*fade);
}
export default film;
