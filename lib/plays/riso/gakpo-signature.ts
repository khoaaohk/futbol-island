/** Cody Gakpo's signature — cut inside from the left wing onto the right foot. The moment: Romania 0–3 Netherlands, UEFA Euro 2024 round of
 * 16, Munich Football Arena (Allianz Arena), Munich, Tuesday 2 July 2024, 18:00: Gakpo's 20th-minute opening goal. An iconic-play riso film
 * (RisoStory, chapters mode): a 1:1 reconstruction from WRITTEN accounts (the footage itself was not reviewed), printed as a riso sheet.
 *
 * WHY THIS MOMENT: iconicPlays.json gives Gakpo a signature, not a match ("cut inside and curl", template solo_dribble_goal, side left, foot
 * right, beaten 1; lesson "From the left wing, cut inside onto your right foot and aim for the far corner"). Wikipedia's "Cody Gakpo"
 * (playing style) describes that trait — "Usually deployed as a left winger … Gakpo often cuts inside on his right foot to move to a more
 * central attacking position, and uses his speed and dribbling skills to take on defenders until he finds the space to make an attempt on
 * goal". The Guardian's match report describes this goal as exactly that move, one defender beaten, from the left: "Simons spun and
 * released Gakpo out wide. The Liverpool forward took Andrei Ratiu towards the touchline then cut back away, took a touch across the
 * corner of the box and drilled a low shot inside Florin Nita's near post". He was player of the match.
 * THE FINISH IS NOT THE LESSON'S: that day the shot went LOW INTO THE NEAR POST, not curled into the far corner. Chapters 1–3 therefore show
 * only what the report describes (near post, drilled low). The far-corner curl of the lesson is staged ONLY in chapter 4, "How he does
 * it": a plainly separate training demonstration (a training pitch with no stadium, training tops and bibs), never inside the Munich match.
 *
 * SOURCES (Sept 2026, read as raw pages with curl, cached under the build scratchpad films/src-cache/):
 *  - The Guardian, Paul MacInnes at the Munich Football Arena, "Donyell Malen double sinks Romania to put Netherlands in last eight",
 *    Tue 2 Jul 2024 https://www.theguardian.com/football/article/2024/jul/02/donyell-malen-double-sinks-romania-to-put-netherlands-in-last-eight
 *    — "The opening goal came in the 20th and it was a delicious move, begun by the unassuming Jerdy Schouten. His little pass ran only
 *    10 yards, but it bisected the Romanian midfield entirely and found Xavi Simons in a pocket of space. Simons spun and released Gakpo out
 *    wide. The Liverpool forward took Andrei Ratiu towards the touchline then cut back away, took a touch across the corner of the box and
 *    drilled a low shot inside Florin Nita's near post. Could the keeper have saved it? Perhaps, but at 125kph, at least it was over
 *    quickly." Also: "the Oranje in blue"; Malen 83', 90+3'. (guardian-rou-ned-2024-report.txt)
 *  - Wikipedia (raw), "UEFA Euro 2024 knockout stage" — the Romania v Netherlands box: 2 July 2024, 18:00, Allianz Arena, Munich, attendance
 *    65,012, referee Felix Zwayer; Gakpo 20', Malen 83', 90+3'; line-ups and numbers (Gakpo LF 11, Simons 7, Schouten 24, Depay 10,
 *    Bergwijn 25, Reijnders 14, Dumfries 22; Romania Niță 1, Rațiu 2, Drăgușin 3, Burcă 15, Mogoș 22, M. Marin 6, Stanciu 21, R. Marin 18,
 *    Man 20, Hagi 10, Drăguș 19); kits from the UEFA tactical line-ups (Romania _rou23h: all YELLOW FEEE00; Netherlands _ned24a: the AWAY
 *    kit, all dark BLUE 010080); man of the match Gakpo   https://en.wikipedia.org/wiki/UEFA_Euro_2024_knockout_stage
 *  - Wikipedia (raw), "Cody Gakpo": playing style (above); player of the match v Romania, "scored the first goal and provided an assist in a
 *    3–0 victory"; joint Golden Boot with three goals   https://en.wikipedia.org/wiki/Cody_Gakpo
 *  - lib/town/playerAppearance.json (Netherlands; skin 4, short hair) and lib/town/playerCareers.json (PSV 2018–2023, Liverpool 2023–).
 * CONFIRMED by those accounts: date, kick-off, city, ground, round, attendance, referee; the minute (20') and the score it made (1–0; 3–0 at
 * the end); Schouten's short pass through the midfield to Simons in space; Simons SPUN and released Gakpo OUT WIDE (on the left: he played
 * LF and cuts in from the left by trade); Gakpo took Rațiu (Romania's right-back, 2) TOWARD THE TOUCHLINE, then CUT BACK inside, one touch
 * ACROSS THE CORNER OF THE BOX, and DRILLED it LOW inside Niță's NEAR POST at about 125 km/h (drawn: ≈ 25 m in .72 s); Niță (1) in goal;
 * Gakpo wore 11; the kits (Netherlands all blue, Romania all yellow).
 * INFERRED (illustrative reconstruction): the shooting foot — drawn RIGHT (his trademark, cutting inside from the left; the match chapters'
 * narration never names the foot, only the separate lesson does); every position, run and timing, the number of touches, the feint; where
 * on the field Simons received (drawn left of centre, 35 m out) and where Gakpo shot from (just outside the left corner of the box); Niță's
 * step and low dive to his right, his keeper kit (drawn red); the kits' trim and number colours; the referee's colours; which way the
 * Netherlands attacked on screen (drawn: right → left from the main stand, Gakpo's left wing the NEAR touchline); the arena's three tiers,
 * roof and seat colours, the crowd colours (Dutch orange, Romanian yellow and blue); the TV cameras; the celebration run toward the near
 * corner. Chapter 4 is a DEMONSTRATION, not the match: its training pitch, trees, kits (white training top, red bib, yellow keeper) and the
 * curl to the far corner are all illustrative, following the card's lesson.
 *
 * FRAMING (the TV broadcast, never top-down; full-sheet card window 1.45:1 down to square, never sheet.safe): 1 = the high main-stand
 * camera, near real time, from Schouten's pass to the goal; 2 = slow-motion replay from a low camera behind Gakpo's left shoulder: he drives
 * at the touchline (yellow arrow), Rațiu follows (navy ring), he cuts back inside (red arrow) and the goal opens up (the angle wedge);
 * 3 = replay from behind the Romanian goal: the low drill inside the near post (ring), Niță beaten, then the pan to the celebration;
 * 4 = "How he does it": the same move on a training pitch from a raised coaching angle, finished with a right-foot curl into the FAR corner.
 * Every body is the shared riso athlete (lib/plays/riso/athlete.ts) through ONE adapter, drawPlayer(). Handedness: the world is right-handed
 * exactly like athlete.ts (x toward Romania's goal, y up, +z = the Netherlands' right, so Gakpo's left wing is −z), so strike({foot:'r'}) is
 * Gakpo's RIGHT foot. Scenes read only (t, c); every action keys off cue times, so the recorded voice (withTiming) re-times the film; every
 * random value is seeded. Heat: small figures print at 'low', only named figures at full detail, everything capped in a passage. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,rectPath,partial,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow,footballPanels} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,runCycle,backpedal,lunge,strike,keeperSet,keeperDive,celebrate,stand,posed,blendPose,
 type Pose,type AthleteStyle,type InkFill,type Place,type Projector,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES (≈2.6 words/s + punctuation pauses) until the Kokoro voice exists. Every cue starts with a plain word (Kokoro
 * splits contractions and hyphens). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The goal, live',text:'Munich, Euro 2024: the Netherlands against Romania. Xavi Simons spins and finds Cody Gakpo on the left. He takes his defender toward the touchline... cuts back inside... shoots! Goal!',tail:2.4,
  cues:['Munich','the Netherlands','Romania','Xavi Simons','Cody Gakpo','He takes','cuts back','shoots','Goal']},
 {label:'Watch it again',text:'Watch again, slowly. Gakpo drives toward the line, and his defender follows. Then he cuts back inside, and the goal opens up.',tail:1.6,
  cues:['Watch again','drives toward','defender follows','cuts back','the goal opens']},
 {label:'Near post',text:"He drills it low and fast, inside the near post. Florin Nita can't stop it. One-nil to the Netherlands!",tail:2.2,
  cues:['He drills','low and fast','near post','Florin Nita','stop it','to the Netherlands']},
 {label:'How he does it',text:'Now try his move. From the left wing, cut inside onto your right foot, and aim for the far corner.',tail:1.8,
  cues:['Now try','left wing','cut inside','right foot','far corner']},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py gakpo-signature, which writes timing.json next to script.json. Then add
 *   import timingJson from '../../../public/plays/narration/gakpo-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/gakpo-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (calibrated on the voiced films, ≈ 2.6 words/s): .2 s + .02 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.2+.02*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.16;if(/[.!?]$/.test(w))t+=.3;if(/\.\.\.$/.test(w))t+=.2;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('gakpo: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('gakpo: no cue '+w);return c.at;};
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
/** Pitch metres (right-handed, like athlete.ts): X along the length (the Netherlands attack +X; Romania's goal line at 105), Y up, Z across
 * (0 = the middle, −34 = the near touchline under the main camera = the Netherlands' LEFT, Gakpo's wing). */
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

// ---------------------------------------------------------------- the Munich arena on a July evening (a steep three-tier bowl under a roof)
/** stand planes (a along, b up the rake 0..1): 0 the main stand (−z, the camera side), 1 behind the Dutch goal (x < 0), 2 the far side
 * (+z), 3 behind Romania's goal (x > 105). Closed corners, three tiers (inferred). */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(117+28*b,-12-28*b,a),.2+30*b,-40-30*b],
 (a,b)=>[-10-28*b,.2+28*b,lerp(42+30*b,-42-30*b,a)],
 (a,b)=>[lerp(-12-28*b,117+28*b,a),.2+30*b,40+30*b],
 (a,b)=>[115+28*b,.2+28*b,lerp(-42-30*b,42+30*b,a)],
];
const STAND_COLS=[110,70,110,70],STAND_ROWS=[14,13,14,13],TIERS=[[.34,.67],[.34,.67],[.34,.67],[.34,.67]];
/** flags along the stand fronts: [stand, a, b, 0 = a Dutch flag (red / paper / blue bands) | 1 = a Romanian flag (blue / yellow / red)] */
const FLAGS:[number,number,number,number][]=[[2,.18,.14,0],[2,.34,.58,0],[2,.5,.22,1],[2,.68,.62,0],[2,.84,.16,0],[1,.3,.2,0],[1,.62,.55,0],[3,.25,.18,1],[3,.5,.6,1],[3,.75,.25,0],[0,.3,.15,0],[0,.66,.2,1]];
function stadium(s:Sheet,c:Cam,v:View,t:number,which:number[],o:{roar?:number}={}){
 const{roar=0}=o,tt=twos(t);
 // a warm summer-evening wash under the roof
 const all=rectPath(-1e4,-1e4,2e4,2e4);s.tone(B,all,.2);s.tone(Y,all,.12);
 const planes=new Path2D(),tier=new Path2D(),roof=new Path2D(),edge=new Path2D();
 for(const i of which){const S=STANDS[i];addPoly(planes,polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]));for(const b of TIERS[i])seg3(c,S(0,b),S(1,b),1.3,tier);
  addPoly(roof,polyP(c,[add3(S(0,1),[0,1.2,0]),add3(S(1,1),[0,1.2,0]),add3(S(1,.6),[0,14,0]),add3(S(0,.6),[0,14,0])]));
  seg3(c,add3(S(0,.6),[0,13.8,0]),add3(S(1,.6),[0,13.8,0]),.6,edge);}
 // grey-dark seats under the crowd (inferred), paper tier fascias
 s.knockout(planes);s.tone(K,planes,.5);s.tone(B,planes,.12);s.knockout(tier,.8);
 // the crowd: Dutch orange (yellow + red overprint) with some paper and blue; a Romanian end in yellow and blue (inferred); the roar lifts
 // the Dutch rows
 const orange=new Path2D(),paper=new Path2D(),blue=new Path2D(),yel=new Path2D();
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si],rows=STAND_ROWS[si];for(let j=0;j<rows;j++){const b=(j+.5)/rows;if(TIERS[si].some(w=>Math.abs(b-w)<.035))continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,23);if(h<.18)continue;const a=(i+.5+(hash(i+j*31,9)-.5)*.6)/cols,q=toCam(c,S(a,b));if(q[2]<NEAR+3)continue;
   const p=scr(c,q);if(!inView(v,p))continue;const z=clamp(c.F*.6/q[2],2.4,16),rom=si===3,lift=roar>0&&!rom?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const dst=rom?(h<.62?yel:h<.86?blue:paper):h<.6?orange:h<.8?paper:blue;dst.rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(orange,.8);s.fill(Y,orange,.95);s.fill(R,orange,.55);s.knockout(paper,.8);s.knockout(yel,.8);s.fill(Y,yel,.95);s.fill(B,blue,.9);
 s.knockout(roof);s.fill(K,roof,.85);s.tone(B,roof,.22);s.knockout(edge,.85);
 const fl=new Path2D(),red=new Path2D(),blu=new Path2D(),yl=new Path2D();
 for(const[si,a,b0,kind] of FLAGS){if(!which.includes(si))continue;const S=STANDS[si],w=.034,hb=.06,P=(u:number,bb:number)=>S(a+u*w,b0+bb*hb);
  const q=polyP(c,[P(0,0),P(1,0),P(1,1),P(0,1)]);if(q.length<3)continue;fl.addPath(polyPath(q,true));
  if(kind===0){addPoly(red,polyP(c,[P(0,.67),P(1,.67),P(1,1),P(0,1)]));addPoly(blu,polyP(c,[P(0,0),P(1,0),P(1,.33),P(0,.33)]));}
  else{addPoly(blu,polyP(c,[P(0,0),P(.33,0),P(.33,1),P(0,1)]));addPoly(yl,polyP(c,[P(.33,0),P(.67,0),P(.67,1),P(.33,1)]));addPoly(red,polyP(c,[P(.67,0),P(1,0),P(1,1),P(.67,1)]));}}
 s.knockout(fl);s.fill(R,red,.95);s.fill(B,blu,.95);s.fill(Y,yl,.95);s.stroke(K,fl,1.4,.6);
}
/** Chapter 4's training pitch (a demonstration, not the arena): an open sky, a line of trees and a low fence (all illustrative) */
function trainingGround(s:Sheet,c:Cam,v:View){
 const all=rectPath(-1e4,-1e4,2e4,2e4);s.tone(B,all,.16);s.tone(Y,all,.06);
 const trees=new Path2D(),fence=new Path2D();
 const line=(a:V3,b:V3,n:number,seed:number)=>{const top:V3[]=[],base:V3[]=[];for(let i=0;i<=n;i++){const u=i/n,x=lerp(a[0],b[0],u),z=lerp(a[2],b[2],u),h=7+5*hash(i*13+seed,7)+2*Math.sin(i*1.7+seed);top.push([x,h,z]);base.push([x,0,z]);}
  addPoly(trees,polyP(c,[...base,...top.reverse()]));};
 line([-20,0,62],[130,0,62],40,3);line([128,0,62],[128,0,-60],34,5);
 s.knockout(trees);s.fill(K,trees,.62);s.tone(B,trees,.5);s.tone(Y,trees,.25);
 for(let k=0;k<30;k++){const x=-10+k*4.6;seg3(c,[x,0,44],[x,1.3,44],.06,fence);}seg3(c,[-10,1.2,44],[126,1.2,44],.05,fence);
 for(let k=0;k<22;k++){const z=-46+k*4.4;seg3(c,[118,0,z],[118,1.3,z],.06,fence);}seg3(c,[118,1.2,-46],[118,1.2,46],.05,fence);
 s.fill(K,fence,.7);void v;
}
/** the grass surround, grass with mowing stripes, navy LED boards (match only) with paper and red panels, paper lines, both goals */
function ground(s:Sheet,c:Cam,o:{bulge?:number;ballZ?:number;goalLater?:boolean;boards?:boolean}={}){
 const{boards=true}=o;
 const sr=polyP(c,[[-14,0,-46],[119,0,-46],[119,0,46],[-14,0,46]]);if(sr.length<3)return;const srp=polyPath(sr,true);s.knockout(srp);s.fill(Y,srp,.8);s.tone(B,srp,.85);
 const g=polyP(c,[[-3,0,-36.5],[108,0,-36.5],[108,0,36.5],[-3,0,36.5]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.95);s.tone(B,gp,.78);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[k*5.25,0,-34],[(k+1)*5.25,0,-34],[(k+1)*5.25,0,34],[k*5.25,0,34]]));s.tone(K,st,.12);
 if(boards){const bd=new Path2D(),pn=new Path2D(),rp=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
  board([-4,0,38],[109,0,38]);board([109,0,-37],[109,0,37]);board([-4,0,37],[-4,0,-37]);
  for(let k=0;k<18;k++){const x=-2+k*6.2;addPoly(k%3===1?rp:pn,polyP(c,[[x,.25,37.95],[x+3.4,.25,37.95],[x+3.4,.68,37.95],[x,.68,37.95]]));}
  for(let k=0;k<11;k++){const z=-34+k*6.4;addPoly(k%3===1?rp:pn,polyP(c,[[108.95,.25,z],[108.95,.25,z+3.4],[108.95,.68,z+3.4],[108.95,.68,z]]));}
  s.knockout(bd);s.fill(K,bd,.88);s.knockout(pn,.85);s.fill(R,rp,.9);}
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
/** a goal at X: posts at z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out around bz, low (the ball went in along the ground) */
function goal3(s:Sheet,c:Cam,X:number,d:number,bulge:number,bz:number){
 const z0=-3.66,z1=3.66,H=2.44,back=(z:number,y:number)=>X+d*(2+bulge*.8*Math.exp(-Math.pow((z-bz)/1.6,2))*(1-.6*y/1.9));
 const zs=[z0,-2.6,-1.3,0,1.3,2.6,z1];
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
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.3],[B,.1]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.22]];
/** Netherlands Euro 2024 AWAY v Romania (UEFA tactical line-ups _ned24a): all dark blue; paper numbers, orange-ish trim (inferred) */
const NED=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:B,shorts:[B,1],socks:B,boots:K,skin:SKIN_L,hair:K,line:K,trim:[R,.7],numberInk:'paper',hairStyle:'short',build:{height:1.82,bulk:1},...o});
/** Romania Euro 2024 home (UEFA tactical line-ups _rou23h): all yellow; blue trim and numbers (inferred) */
const ROU=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:Y,shorts:[Y,1],socks:Y,boots:K,skin:SKIN_L,hair:K,line:K,trim:B,numberInk:B,hairStyle:'short',build:{height:1.8,bulk:1},...o});
/** Cody Gakpo, number 11 (confirmed), 1.89 m, short hair (playerAppearance: skin 4) */
const GAK_ST=NED({number:11,skin:SKIN_D,hairStyle:'short',build:{height:1.89,bulk:.98,thighs:1.02},seed:11});
/** Florin Niță, number 1: keeper kit inferred (drawn red) */
const NIT_ST:AthleteStyle={shirt:[R,.95],shorts:[R,.95],socks:[R,.95],boots:K,skin:SKIN_L,hair:K,hairStyle:'short',line:K,gloves:'paper',sleeves:'long',trim:K,number:1,numberInk:'paper',build:{height:1.87},seed:1};
const REF:AthleteStyle={shirt:[K,.88],shorts:[K,.9],socks:[K,.9],boots:K,skin:SKIN_L,hair:[K,.9],hairStyle:'short',line:K,seed:12};
/** chapter 4, the demonstration: a paper training top and navy shorts for Gakpo, a red bib for the defender, a yellow keeper (illustrative) */
const DEMO_GAK:AthleteStyle={...GAK_ST,shirt:'paper',shorts:[K,.9],socks:'paper',trim:K,number:null};
const DEMO_DEF:AthleteStyle=ROU({shirt:R,shorts:[K,.85],socks:K,trim:'paper',number:null,seed:2});
const DEMO_GK:AthleteStyle={...NIT_ST,shirt:[Y,.95],shorts:[K,.9],socks:[Y,.95],trim:K,number:null,numberInk:K};

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete: fluid FK body, kit inks, halftone shade, key line).
 * prev = the pose one drawing earlier (secondary motion: hair and hem trail); smear = a halftone echo + speed lines for fast limbs. */
function drawPlayer(s:Sheet,pose:Pose,camera:Projector,style:AthleteStyle,place:Place,o:{prev?:Pose;smear?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{threshold:10});
 return drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev}:{});
}

// ---------------------------------------------------------------- the players: keyframed tracks (τ = seconds after Gakpo's first touch)
type Role='gak'|'ned'|'rou'|'gk'|'ref';
/** a keyed move: lunge (full reach at `at`), a keeper dive (full stretch at `at`), a strike (contact at `at`) */
type Move={kind:'lunge'|'dive'|'strike';at:number;dur:number;side:'l'|'r';power?:number};
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];moves?:Move[];engage?:[number,number];key?:boolean};
/** Positions are Hermite-interpolated between keys [τ, X, Z]; the confirmed beats (Schouten's short pass, Simons spins and releases him
 * wide, toward the touchline, cut back, a touch across the corner of the box, low into the near post) set the shape, every spot is inferred. */
const SHOT=3.25,IN_NET=SHOT+.72;
const ACTORS:Actor[]=[
 {name:'Gakpo',role:'gak',style:GAK_ST,key:true,keys:[[-6,71.5,-30.5],[-3,74,-29.6],[-1.2,76,-28.4],[-.3,77,-27.8],[0,77.3,-27.7],[.65,78.9,-28.3],[1.3,80.9,-29.2],[1.7,82.1,-29.8],[1.95,82.6,-30],[2.2,83.2,-29.4],[2.6,84.6,-27.4],[2.95,86.1,-24.7],[SHOT,87.2,-22.6],[3.6,88.1,-21.6],[4.4,89.6,-23.4],[5.4,91.4,-27],[6.4,93,-30.6],[7.2,93.7,-32],[9,93.9,-32.4]]},
 {name:'Simons',role:'ned',style:NED({number:7,skin:SKIN_M,build:{height:1.79},seed:7}),key:true,moves:[{kind:'strike',at:-1.2,dur:.8,side:'r',power:.55}],keys:[[-6,62,-10],[-3,65.4,-11.6],[-2.1,66.4,-12],[-1.2,67.1,-12.6],[0,68.5,-13.5],[3,74,-14],[9,80,-12]]},
 {name:'Schouten',role:'ned',style:NED({number:24,build:{height:1.85},seed:24}),key:true,moves:[{kind:'strike',at:-3,dur:.8,side:'r',power:.4}],keys:[[-6,55,-6],[-3,57.8,-8],[0,60,-8.5],[9,66,-6]]},
 {name:'Depay',role:'ned',style:NED({number:10,skin:SKIN_D,build:{height:1.76,bulk:1.06},seed:10}),keys:[[-6,90,-4],[0,93,-6.5],[3.2,97.5,-6],[9,97,-8]]},
 {name:'Bergwijn',role:'ned',style:NED({number:25,skin:SKIN_D,seed:25}),keys:[[-6,88,16],[0,92,12],[3,97,7],[9,97,8]]},
 {name:'Reijnders',role:'ned',style:NED({number:14,seed:14}),keys:[[-6,68,4],[0,74,2],[3,82,-4],[9,86,-8]]},
 {name:'Dumfries',role:'ned',style:NED({number:22,skin:SKIN_D,seed:22}),keys:[[-6,74,26],[0,80,24],[9,86,20]]},
 {name:'Ratiu',role:'rou',style:ROU({number:2,seed:2,build:{height:1.8,bulk:1}}),key:true,engage:[-.6,2.9],moves:[{kind:'lunge',at:2.45,dur:.72,side:'l'}],keys:[[-6,88,-22],[-2,86.5,-25],[0,85.4,-27.2],[.65,85.5,-28.2],[1.3,85.6,-29.3],[1.7,85.4,-30],[1.95,85.2,-30.4],[2.25,85.1,-30],[2.6,85.3,-28.6],[3,86.1,-26.4],[3.4,87,-24.6],[9,90,-20]]},
 {name:'Man',role:'rou',style:ROU({number:20,seed:20}),keys:[[-6,78,-17],[0,79.5,-19.5],[2,81.5,-20.5],[3.3,83,-20.8],[9,86,-19]]},
 {name:'Dragusin',role:'rou',style:ROU({number:3,build:{height:1.91},seed:3}),key:true,keys:[[-6,94,-9],[0,93.5,-11],[3,94,-12.5],[9,95,-11]]},
 {name:'Burca',role:'rou',style:ROU({number:15,build:{height:1.89},seed:15}),keys:[[-6,95,-1],[0,95.5,-2.5],[3,96,-4],[9,96,-3]]},
 {name:'Mogos',role:'rou',style:ROU({number:22,seed:122}),keys:[[-6,93,12],[0,94.5,9],[9,95,6]]},
 {name:'M. Marin',role:'rou',style:ROU({number:6,seed:6}),keys:[[-6,69,-5],[-2,68.4,-6.5],[0,70,-9],[4,75,-12],[9,79,-12]]},
 {name:'Stanciu',role:'rou',style:ROU({number:21,seed:21}),keys:[[-6,62,-17],[-2,63.4,-17.5],[0,66,-18],[4,72,-19],[9,76,-18]]},
 {name:'R. Marin',role:'rou',style:ROU({number:18,seed:18}),keys:[[-6,66,2],[0,68,0],[4,73,-3],[9,77,-4]]},
 {name:'Hagi',role:'rou',style:ROU({number:10,seed:110}),keys:[[-6,74,18],[0,77,14],[9,82,10]]},
 {name:'Nita',role:'gk',style:NIT_ST,key:true,moves:[{kind:'dive',at:SHOT+.6,dur:.95,side:'r'}],keys:[[-6,102.8,-.5],[0,103.2,-1.6],[2.5,103.6,-2.6],[SHOT,103.7,-2.9],[9,103.7,-2.9]]},
 {name:'referee',role:'ref',style:REF,keys:[[-6,70,-2],[0,74,-4],[9,82,-8]]},
];
const GAK=0,SIM=1,SCH=2,RAT=7,DRA=9,NIT=16;
/** chapter 4 casts only these three, restyled */
const DEMO_CAST=[GAK,RAT,NIT],DEMO_STYLE:Record<number,AthleteStyle>={[GAK]:DEMO_GAK,[RAT]:DEMO_DEF,[NIT]:DEMO_GK};
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

// ---------------------------------------------------------------- the ball: Schouten's pass, Simons' ball wide, the touches, the drill
const P_SCH=-3,R_SIM=-2.1,P_SIM=-1.2;
/** touches (right foot): receive, two carrying toward the touchline, the cut back inside, the touch across the box corner, the shot */
const TOUCHES=[0,.65,1.3,1.95,2.6,SHOT];
/** where the drill goes in: low, just inside the NEAR (left) post — and, chapter 4 only, the demo curl into the FAR corner */
const GOALPT:V3=[105,.3,-3.2],NET:V3=[106.7,.28,-3.35],REST:V3=[106.2,.11,-2.9];
const GOALD:V3=[105,.45,3.05],NETD:V3=[106.6,.42,3.3],RESTD:V3=[106.2,.11,2.9],IN_DEMO=SHOT+.86;
/** his forward and right directions on the ground (x, z) */
const fwdR=(y:number):[Pt,Pt]=>[[Math.cos(y),-Math.sin(y)],[Math.sin(y),Math.cos(y)]];
/** his heading: facing Simons to receive, then along his run; square to the shot; then free */
function yawGak(tau:number,demo=false):number{
 const v=velOf(GAK,tau),head=Math.hypot(v[0],v[1])>.4?yawOf(v[0],v[1]):yawOf(1,.3);
 if(tau<.4){const g=posOf(SIM,P_SIM),m=posOf(GAK,tau),face=yawOf(g[0]-m[0],g[1]-m[1]);return lerpA(face,head,sm(-.3,.4,tau,easeInOutSine));}
 const w=sm(SHOT-.7,SHOT-.2,tau)*(1-sm(SHOT+.5,SHOT+1.1,tau));return lerpA(head,demo?SHOT_YAW_D:SHOT_YAW,w);
}
/** ball spot for the RIGHT foot: ahead and a touch to his right */
function footAt(tau:number,yaw=yawGak(tau)):[number,number]{const p=posOf(GAK,tau),[f,r]=fwdR(yaw);return[p[0]+f[0]*.55+r[0]*.14,p[1]+f[1]*.55+r[1]*.14];}
/** square to the target at the strike (the drill: straight at the near post; the demo curl: aimed outside the far post) */
const yawTo=(T:V3,off:number)=>{const p=posOf(GAK,SHOT),dx=T[0]-p[0],dz=T[2]-p[1],l=Math.hypot(dx,dz),rx=-dz/l,rz=dx/l;return yawOf(dx/l+rx*off,dz/l+rz*off);};
const SHOT_YAW=yawTo(GOALPT,0),SHOT_YAW_D=yawTo(GOALD,.25);
const TP=TOUCHES.map(T=>footAt(T));
const S0=TP[TP.length-1];
/** a shot as a quadratic on the ground: k > 0 bows it to the RIGHT of the straight line (a right-footer's curl then bends back left) */
const bow=(T:V3,k:number):[Pt,Pt,Pt]=>{const dx=T[0]-S0[0],dz=T[2]-S0[1],l=Math.hypot(dx,dz),rx=-dz/l,rz=dx/l;return[[S0[0],S0[1]],[(S0[0]+T[0])/2+rx*k*l,(S0[1]+T[2])/2+rz*k*l],[T[0],T[2]]];};
const DRILL=bow(GOALPT,.015),CURL=bow(GOALD,.15);
function flight(P:[Pt,Pt,Pt],T:V3,lift:number,u:number):V3{const a=(1-u)*(1-u),b=2*u*(1-u),c=u*u;return[a*P[0][0]+b*P[1][0]+c*P[2][0],.12+(T[1]-.12)*u+lift*Math.sin(Math.PI*u),a*P[0][1]+b*P[1][1]+c*P[2][1]];}
const drillAt=(u:number)=>flight(DRILL,GOALPT,.22,u),curlAt=(u:number)=>flight(CURL,GOALD,.5,u);
/** the passes: Schouten's 10 yards to Simons, Simons' ball wide to Gakpo */
const foot=(k:number,tau:number):[number,number]=>{const g=posOf(k,tau);return[g[0]+.5,g[1]-.2];};
function ballAt(tau:number,demo=false):V3{
 if(tau<P_SCH){const u=clamp((tau+6)/3),e=1-Math.pow(1-u,1.6),g=foot(SCH,P_SCH);return[lerp(52,g[0],e),.11,lerp(-3,g[1],e)];}// worked to him
 if(tau<R_SIM){const u=(tau-P_SCH)/(R_SIM-P_SCH),a=foot(SCH,P_SCH),b=foot(SIM,R_SIM),e=1-Math.pow(1-u,1.6);return[lerp(a[0],b[0],e),.11,lerp(a[1],b[1],e)];}
 if(tau<P_SIM){const u=(tau-R_SIM)/(P_SIM-R_SIM),a=foot(SIM,R_SIM),b=foot(SIM,P_SIM),e=u*u*(3-2*u);return[lerp(a[0],b[0],e),.11,lerp(a[1],b[1],e)];}// the spin
 if(tau<0){const u=(tau-P_SIM)/-P_SIM,a=foot(SIM,P_SIM),b=TP[0],e=1-Math.pow(1-u,1.3);return[lerp(a[0],b[0],e),.11,lerp(a[1],b[1],e)];}
 if(tau<SHOT){let k=0;while(k+1<TOUCHES.length&&tau>=TOUCHES[k+1])k++;const u=(tau-TOUCHES[k])/(TOUCHES[k+1]-TOUCHES[k]),e=1-Math.pow(1-u,2.4);return[lerp(TP[k][0],TP[k+1][0],e),.11,lerp(TP[k][1],TP[k+1][1],e)];}
 const IN=demo?IN_DEMO:IN_NET,G=demo?GOALD:GOALPT,N=demo?NETD:NET,Rs=demo?RESTD:REST;
 if(tau<IN)return demo?curlAt((tau-SHOT)/(IN-SHOT)):drillAt((tau-SHOT)/(IN-SHOT));
 const u=clamp((tau-IN)/.2);if(u<1)return lerp3(G,N,u);
 const w=clamp((tau-IN-.2)/.5);return[lerp(N[0],Rs[0],w),lerp(N[1],Rs[1],w),lerp(N[2],Rs[2],w)];
}
const bulgeAt=(tau:number,demo=false)=>{const IN=demo?IN_DEMO:IN_NET;return tau<IN?0:Math.exp(-(tau-IN)*2.2)*(1+.3*Math.sin((tau-IN)*14));};

// ---------------------------------------------------------------- poses (angles in degrees via posed; the athlete clamps to real range of motion)
const RAD=Math.PI/180;
const LIN=new Set(['dx','dz','air','lHand','rHand','squash']);
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LIN.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
/** a defender's ready stance: side-on-ish, low, knees bent, arms out for balance */
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:10,rHipA:10,lean:16,pitch:4,lShA:26,rShA:26,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
/** the defender committed toward the line: weight on the outside (his right) leg, low */
const LEAN_OUT:Partial<Pose>={roll:10,bend:10,rKnee:62,lKnee:34,lHipA:20,rShA:40,lShA:20,lean:20,neckY:-10,squash:-.04};
/** showing for the pass: knees soft, arms out, eyes on the ball */
const RECEIVE:Partial<Pose>={lean:10,lHipF:24,lKnee:34,rHipF:20,rKnee:30,lShA:40,rShA:46,lElb:40,rElb:36,neckP:22};
/** a carrying touch: the right leg reaches forward, laces meet the ball, a glance down */
const PUSH_R:Partial<Pose>={rHipF:40,rKnee:24,rAnk:30,rHipR:-8,neckP:18};
/** heading for the touchline: body dipped to his left (outside), left shoulder dropped */
const OUTSIDE:Partial<Pose>={roll:-10,bend:-12,lean:18,lKnee:58,rKnee:36,lHipA:18,rShA:52,lShA:18,neckY:-12,squash:-.04};
/** the cut back: the right foot drags it across (to his right), body dipped right, left arm up for balance */
const CUTIN:Partial<Pose>={roll:12,bend:12,lean:22,rHipA:26,rHipF:30,rKnee:34,rAnk:18,rHipR:-20,lKnee:52,lShA:78,lShF:18,lElb:40,rShA:30,neckY:12,squash:-.05};
/** the whole pose of actor k at τ, with its yaw (demo = chapter 4's far-corner curl) */
function poseOf(k:number,tau:number,demo=false):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),m=posOf(GAK,tau),b=ballAt(tau,demo);
 let yaw=sp>.45?yawOf(v[0],v[1]):yawOf(b[0]-x,b[2]-z);
 if(a.engage&&tau>a.engage[0]-.4&&tau<a.engage[1]+.4)yaw=lerpA(yaw,yawOf(m[0]-x,m[1]-z),Math.min(sm(a.engage[0]-.4,a.engage[0],tau),1-sm(a.engage[1],a.engage[1]+.4,tau)));
 // the keeper tracks the ball, then is set square to the shooter (the dive's side is fixed at the set: right = the near post)
 if(a.role==='gk')yaw=lerpA(yawOf(b[0]-x,b[2]-z),yawOf(S0[0]-x,S0[1]-z),sm(SHOT-.4,SHOT,tau));
 if(k===GAK)yaw=yawGak(tau,demo);
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 let p:Pose;
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='rou'?READY:stand();
 if(sp>.5&&along<-.35*sp&&k!==GAK)p=blendPose(idle,backpedal(distOf(k,tau)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5),cyc=k===GAK?3.2:3.4;p=blendPose(idle,runCycle(distOf(k,tau)/cyc,{speed:s}),clamp((sp-.4)/.9));}
 // Rațiu follows him toward the line and commits his weight outside
 if(k===RAT)p=over(p,LEAN_OUT,bump(1.5,2.35,tau));
 for(const mv of a.moves??[]){const lead=mv.kind==='dive'?.55:mv.kind==='strike'?.52:.6,t0=mv.at-lead*mv.dur,u=(tau-t0)/mv.dur;
  if(mv.kind==='lunge'&&u>0&&u<1.5)p=blendPose(p,lunge(Math.min(1,u),{side:mv.side}),Math.min(sm(0,.12,u),1-sm(1,1.5,u)));
  if(mv.kind==='dive'&&u>0)p=keeperDive(Math.min(1,u),{side:demo?'l':mv.side,height:demo?.2:.05});
  if(mv.kind==='strike'&&u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:mv.side,power:mv.power??.7}),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));}
 if(k===GAK){
  p=over(p,RECEIVE,sm(-2.4,-1.4,tau)*(1-sm(-.3,.05,tau)));
  for(const T of TOUCHES)if(T>.3&&T<1.6&&Math.abs(tau-T)<.2)p=over(p,PUSH_R,bump(T-.2,T+.12,tau));
  p=over(p,OUTSIDE,bump(1.3,1.95,tau));
  p=over(p,CUTIN,bump(1.8,2.5,tau));
  p=over(p,PUSH_R,bump(2.4,2.72,tau));
  const D=.82,st=SHOT-.52*D,u=(tau-st)/D;
  if(u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:demo?.7:.9}),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));
  const IN=demo?IN_DEMO:IN_NET;
  if(tau>IN+.3)p=blendPose(p,celebrate(tau*.85,{kind:'run'}),sm(IN+.3,IN+.8,tau)*(1-sm(6.6,7,tau)));
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
function play(s:Sheet,c:Cam,v:View,tau:number,tauP:number,tauPrev:number,o:{minBall?:number;hero?:boolean;after?:(r:PlayOut)=>void;full?:number[];demo?:boolean}={}):PlayOut{
 const{minBall=6,hero=false,full,demo=false}=o;
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!s._passage.pending;
 const list:CastE[]=[];
 ACTORS.forEach((_,k)=>{if(demo&&!DEMO_CAST.includes(k))return;const[x,z]=posOf(k,tau),q=toCam(c,[x,.9,z]);if(q[2]<1.2)return;const g=scr(c,toCam(c,[x,0,z])),h=c.F*1.85/q[2];if(!inView(v,g,h*1.2)&&!inView(v,[g[0],g[1]-h],h))return;list.push({k,x,z,g,h,d:q[2]});});
 const b=ballAt(tau,demo),bq=toCam(c,b),bg=bq[2]>=NEAR?scr(c,bq):null,br=bg?Math.max(minBall,c.F*.11/bq[2]):0,bground=pr(c,[b[0],0,b[2]]);
 // soft ground shadows under the roof lights, batched in one op; big figures cast their own through the athlete
 const sh=new Path2D();for(const e of list)if(e.h<420)sh.addPath(polyPath(blob(e.g[0],e.g[1],e.h*.13,e.h*.035,ACTORS[e.k].style.seed??1,{amp:.05,n:14}),true));
 if(bground&&bg)sh.addPath(polyPath(blob(bground[0],bground[1],br*.8,br*.25,2,{amp:.05,n:12}),true));s.tone(K,sh,.38);
 list.sort((p,q)=>q.d-p.d);
 const drawBall=()=>{if(bg)ball(s,bg[0],bg[1],br,Math.hypot(b[0],b[2])/.11);};
 let ballDone=!list.length||bq[2]>=list[0].d,heroR:DrawResult|undefined;if(ballDone)drawBall();
 for(const e of list){if(!ballDone&&bq[2]>=e.d){drawBall();ballDone=true;}
  const a=ACTORS[e.k],{p,yaw}=poseOf(e.k,tauP,demo),px=e.h*ppu,big=e.h>=300,named=full?full.includes(e.k):a.key,style=demo?DEMO_STYLE[e.k]:a.style;
  // phone heat: low detail for small figures and extras; during a passage only the hero keeps 'mid'
  const detail=passing?(e.k===GAK?'mid':'low'):px<50||(!named&&px<120)?'low':'auto';
  const r=drawPlayer(s,p,c,{...style,shadow:e.h<420?false:undefined,detail},{x:e.x,z:e.z,yaw},big&&(e.k===GAK||e.h>520)&&!passing?{prev:poseOf(e.k,tauPrev,demo).p,smear:hero&&e.k===GAK}:{});
  if(e.k===GAK)heroR=r;}
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
/** the shooting angle: a wedge on the grass from the ball to both posts — narrow out wide, wide once he has cut back inside */
function angleWedge(s:Sheet,c:Cam,from:[number,number],w:number,ink=Y){if(w<=0)return;
 const a=pr(c,[from[0],0,from[1]]),p1=pr(c,[105,0,-3.66]),p2=pr(c,[105,0,3.66]);if(!a||!p1||!p2)return;
 const wedge=polyPath([a,p1,p2],true);s.knockout(wedge,.35*w);s.tone(ink,wedge,.55*w);
 const q=toCam(c,[from[0],0,from[1]]),lw=Math.max(3,c.F*.05/q[2]);s.fill(ink,ribbon([a,p1],lw,{seed:91,taper:.3,wobble:.6}),.95*w);s.fill(ink,ribbon([a,p2],lw,{seed:92,taper:.3,wobble:.6}),.95*w);}
/** his run as a dashed path on the grass between τ a0 and a1, arrowhead at the end (yellow = toward the line, red = the cut back inside) */
function runArrow(s:Sheet,c:Cam,w:number,prog:number,a0:number,a1:number,ink:string,seed:number){if(w<=0)return;
 const pts:Pt[]=[];for(let i=0;i<=24;i++){const tau=lerp(a0,a1,i/24),m=posOf(GAK,tau),q=pr(c,[m[0],0,m[1]]);if(q)pts.push(q);}if(pts.length<6)return;
 const sub=partial(pts,clamp(prog)),m=posOf(GAK,lerp(a0,a1,.5)),q=toCam(c,[m[0],0,m[1]]),wd=Math.max(5,c.F*.13/q[2]);
 s.knockout(ribbon(sub,wd*1.6,{seed,taper:.1,wobble:.8}),.7*w);s.fill(ink,ribbon(sub,wd,{seed:seed+1,taper:.1,wobble:.8,gaps:[[.18,.24],[.42,.48],[.66,.72]]}),.95*w);
 if(sub.length>2&&prog>.15){const e=sub[sub.length-1],pv=sub[Math.max(0,sub.length-3)];laneArrow(s,ink,pv,e,wd,{seed:seed+2,head:wd*3.2,cov:.95*w});}}
/** the shot's flight: a yellow dashed trail just above the grass, from the boot to where it is now (or all of it) */
function shotTrail(s:Sheet,c:Cam,tau:number,w:number,demo=false,full=false){if(w<=0)return;const IN=demo?IN_DEMO:IN_NET,at=demo?curlAt:drillAt,end=full?1:clamp((tau-SHOT)/(IN-SHOT));if(end<=.02)return;
 const pts:Pt[]=[];for(let i=0;i<=28;i++){const q=pr(c,at(end*i/28));if(q)pts.push(q);}if(pts.length<4)return;const q=toCam(c,at(end*.5)),wd=Math.max(4,c.F*.09/q[2]);
 s.knockout(ribbon(pts,wd*1.5,{seed:71,taper:.4,wobble:.6}),.6*w);s.fill(Y,ribbon(pts,wd,{seed:72,taper:.4,wobble:.6,gaps:[[.12,.18],[.3,.36],[.48,.54],[.66,.72],[.84,.9]]}),.95*w);}
/** a ring in the goal mouth where the ball goes in (near post in the match, far corner in the demo) */
function postRing(s:Sheet,c:Cam,w:number,G:V3,ink=Y){if(w<=0)return;const pts:Pt[]=[];
 for(let i=0;i<30;i++){const a=i/30*TAU,q=pr(c,[105,G[1]+.08+Math.sin(a)*.36,G[2]+Math.cos(a)*.48]);if(q)pts.push(q);}if(pts.length<20)return;
 const q=toCam(c,[105,G[1],G[2]]),rr=ribbon(pts,Math.max(4,c.F*.07/q[2]),{close:true,seed:77,taper:0,wobble:1});s.knockout(rr,.85*w);s.fill(ink,rr,.95*w);}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, near real time
const tau1=(t:number)=>{const G=CUE(0,'Goal');return key(t,mono([[0,-5.4],[CUE(0,'Romania'),-3.3],[CUE(0,'Xavi'),-2.3],[CUE(0,'Cody'),-.4],[CUE(0,'He takes'),.3],[CUE(0,'cuts back'),1.95],[CUE(0,'shoots'),SHOT-.05],[G,IN_NET+.05],[SECS(0)+1,IN_NET+.05+(SECS(0)+1-G)*.9]]),linear);};
const CAM1:V3=[70,22,-70];
function cam1(t:number):Cam{
 const G=CUE(0,'Goal'),S=SECS(0),tau=tau1(t);
 const bs=(u:number):V3=>{const b=ballAt(Math.min(u,SHOT));return[b[0],0,b[2]];},b0=bs(tau),b1=bs(tau-.35),b2=bs(tau-.7),bt:V3=[(b0[0]+b1[0]+b2[0])/3,0,(b0[2]+b1[2]+b2[2])/3];
 const open:V3=[70,3,-6],m=posOf(GAK,tau),cel:V3=[m[0]-.5,1,m[1]];
 const toBall=sm(CUE(0,'the Netherlands'),CUE(0,'Romania')+.3,t,easeInOutSine),toS=sm(G+.5,G+1.6,t,easeInOutSine),toGoal=sm(CUE(0,'cuts back'),CUE(0,'shoots'),t,easeInOutSine)*(1-toS);
 const tb:V3=[lerp(open[0],bt[0]+3+4*toGoal,toBall),lerp(open[1],1.4,toBall),lerp(open[2],lerp(bt[2],-4,.08+.2*toGoal),toBall)],T=lerp3(tb,cel,toS);
 const F=key(t,mono([[0,2100],[CUE(0,'the Netherlands'),2600],[CUE(0,'Romania'),3600],[CUE(0,'Xavi'),4000],[CUE(0,'Cody'),5200],[CUE(0,'He takes'),5800],[CUE(0,'cuts back'),5500],[G,5500],[G+1.6,7200],[S,7600]]),easeInOutSine);
 return look(CAM1,T,F);
}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),tau=tau1(t),tp=tau1(twos(t)),G=CUE(0,'Goal');
  stadium(s,c,v,t,[2,1,3],{roar:sm(G-.1,G+.5,t)});
  ground(s,c,{bulge:bulgeAt(tau),ballZ:GOALPT[2]});
  play(s,c,v,tau,tp,tau1(twos(t)-1/12),{minBall:8});
 },
 aperture(t){const c=cam1(t),[x,z]=posOf(GAK,tau1(t)),q=toCam(c,[x,1,z]),g=scr(c,q),h=c.F*1.65/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.09),12);},
 still:6,
};

// ---------------------------------------------------------------- 2 · slow replay, a low camera behind Gakpo's left shoulder
const tau2=(t:number)=>key(t,mono([[0,-.5],[CUE(1,'drives toward'),.2],[CUE(1,'defender follows'),1.25],[CUE(1,'cuts back'),1.92],[CUE(1,'the goal opens'),2.9],[SECS(1),3.1]]),linear);
function cam2(t:number):Cam{
 const tau=tau2(t),m=smooth(GAK,Math.min(tau,3)),open=1-sm(0,1.2,t,easeInOutSine),wide=sm(CUE(1,'the goal opens')-.4,CUE(1,'the goal opens')+.5,t,easeInOutSine);
 const C:V3=[m[0]-5.4-1.5*open-1.2*wide,1.6+.4*open+.9*wide,m[1]-4.6-1*open-.8*wide],T:V3=[lerp(m[0]+3.5,100.5,wide*.8),lerp(.95,1.1,wide),lerp(m[1]+1.2,-2.5,wide*.8)];
 return look(C,T,lerp(2500-300*open,2050,wide));
}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),tau=tau2(t),tp=tau2(twos(t)),dt=CUE(1,'drives toward'),df=CUE(1,'defender follows'),cb=CUE(1,'cuts back'),go=CUE(1,'the goal opens'),E=SECS(1);
  stadium(s,c,v,t,[2,3]);
  ground(s,c);
  // "drives toward the line": the narrow angle from out wide, and his run to the touchline in yellow
  const st=sm(dt-.1,dt+.4,t)*(1-sm(cb-.1,cb+.4,t));angleWedge(s,c,[ballAt(Math.min(tau,1.9))[0],ballAt(Math.min(tau,1.9))[2]],st*.7,R);
  runArrow(s,c,st,sm(dt-.1,dt+1,t),0,1.95,Y,51);
  // "his defender follows": a navy ring round Rațiu as he goes with him
  groundRing(s,c,...posOf(RAT,Math.min(tau,2)),.85,K,sm(df-.15,df+.3,t,easeOutBack)*(1-sm(cb+.2,cb+.6,t)),44);
  // "cuts back inside": the red path across the corner of the box
  runArrow(s,c,sm(cb-.2,cb+.2,t)*(1-sm(E-.7,E-.3,t)),sm(cb-.2,cb+1,t),1.9,Math.min(SHOT-.05,Math.max(2,tau)),R,61);
  // "the goal opens up": the wedge from the ball, now wide
  angleWedge(s,c,[ballAt(Math.min(tau,SHOT))[0],ballAt(Math.min(tau,SHOT))[2]],sm(go-.15,go+.45,t,easeOutBack)*(1-sm(E-.5,E-.2,t)));
  play(s,c,v,tau,tp,tau2(twos(t)-1/12),{minBall:5,hero:true,full:[GAK,RAT,DRA,NIT]});
  streaks(s,v,1-sm(0,.5,t),21);
 },
 aperture(t){const c=cam2(t),m=posOf(GAK,tau2(t)),q=toCam(c,[m[0],1.4,m[1]]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.14/q[2]),12);},
 still:1.2,
};

// ---------------------------------------------------------------- 3 · replay from behind Romania's goal: the low drill, the near post, Niță, the celebration
const tau3=(t:number)=>{const tn=CUE(2,'to the Netherlands');return key(t,mono([[0,SHOT-.55],[CUE(2,'He drills'),SHOT-.1],[CUE(2,'low and fast'),SHOT+.3],[CUE(2,'near post'),IN_NET-.05],[CUE(2,'Florin'),IN_NET+.15],[CUE(2,'stop it'),IN_NET+.5],[tn,5.8],[SECS(2),5.8+(SECS(2)-tn)*.8]]),linear);};
const swing3=(t:number)=>sm(CUE(2,'stop it')+.2,CUE(2,'to the Netherlands')+.3,t,easeInOutSine);
function cam3(t:number):Cam{
 const tau=tau3(t),u=swing3(t),C:V3=[117.5,4.6+.8*u,7.8-2*u],e=sm(SHOT-.3,IN_NET,tau,easeInOutSine);
 const m=smooth(GAK,Math.min(tau,7.2)),T0:V3=[lerp(93,101.5,e),lerp(1,.9,e),lerp(-13,-2.2,e)],T1:V3=[m[0]-.3,1.1,m[1]+.5];
 return look(C,lerp3(T0,T1,u),lerp(lerp(3700,3600,e),8600,u));
}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),tau=tau3(t),tp=tau3(twos(t)),hd=CUE(2,'He drills'),lf=CUE(2,'low and fast'),np=CUE(2,'near post'),fn=CUE(2,'Florin'),tn=CUE(2,'to the Netherlands'),u=swing3(t);
  stadium(s,c,v,t,[0,1,2],{roar:sm(IN_NET,IN_NET+.3,tau)});
  ground(s,c,{goalLater:u<.5});
  // "Florin Nita": a navy ring under the keeper as he goes down
  groundRing(s,c,...posOf(NIT,Math.min(tau,SHOT)),.8,K,sm(fn-.15,fn+.3,t,easeOutBack)*(1-sm(tn-.4,tn,t)),45);
  play(s,c,v,tau,tp,tau3(twos(t)-1/12),{minBall:5,hero:true,full:[GAK,RAT,DRA,NIT],after:()=>{
   shotTrail(s,c,tau,sm(lf-.3,lf+.1,t)*(1-sm(tn-.3,tn+.1,t)));}});
  if(u<.5){goal3(s,c,105,1,bulgeAt(tau),GOALPT[2]);postRing(s,c,sm(np-.15,np+.3,t,easeOutBack)*(1-sm(tn-.3,tn+.1,t)),GOALPT);}
  // "One-nil to the Netherlands!": a yellow burst over the celebration
  const pw=sm(tn-.1,tn+.4,t);if(pw>0){const m=posOf(GAK,tau),q=pr(c,[m[0],2.6,m[1]]);if(q)sparkBurst(s,Y,q[0],q[1],c.F*1.4/toCam(c,[m[0],2.6,m[1]])[2],{n:10,seed:88,g:easeOutBack(pw),width:12,cov:.95});}
  void hd;streaks(s,v,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3(t),[x,z]=posOf(GAK,tau3(t)),q=toCam(c,[x,1.1,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.16/q[2]),12);},
 still:2.6,
};

// ---------------------------------------------------------------- 4 · HOW HE DOES IT: a separate training-pitch demonstration of the lesson
const tau4=(t:number)=>key(t,mono([[0,.4],[CUE(3,'Now try'),.55],[CUE(3,'left wing'),1],[CUE(3,'cut inside'),1.9],[CUE(3,'right foot'),SHOT-.2],[CUE(3,'far corner'),SHOT+.1],[SECS(3),IN_DEMO+.5]]),linear);
function cam4(t:number):Cam{
 const tau=tau4(t),orbit=sm(CUE(3,'right foot')-.3,CUE(3,'far corner')+.5,t,easeInOutSine),m=smooth(GAK,Math.min(tau,SHOT));
 const C:V3=[lerp(m[0]-7,80,orbit),lerp(5.6,6.4,orbit),lerp(-38.5,-36,orbit)],T:V3=[lerp(m[0]+5,97,orbit*.8),.4,lerp(m[1]+4,-1,orbit*.8)];
 return look(C,T,lerp(3100,2500,orbit));
}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),tau=tau4(t),tp=tau4(twos(t)),nt=CUE(3,'Now try'),lw=CUE(3,'left wing'),ci=CUE(3,'cut inside'),rf=CUE(3,'right foot'),fc=CUE(3,'far corner'),E=SECS(3);
  trainingGround(s,c,v);
  ground(s,c,{bulge:bulgeAt(tau,true),ballZ:GOALD[2],boards:false});
  // "left wing": a red ring where he starts, out wide
  groundRing(s,c,TP[1][0],TP[1][1],.9,R,sm(lw-.1,lw+.3,t,easeOutBack)*(1-sm(ci+.2,ci+.6,t)),42);
  // "cut inside": the red path in from the wing
  runArrow(s,c,sm(ci-.2,ci+.2,t)*(1-sm(E-.6,E-.3,t)),sm(ci-.1,ci+1,t),1.3,SHOT-.05,R,61);
  // "right foot": a yellow ring on the ball at his right boot, and the far-post wedge opening
  groundRing(s,c,S0[0],S0[1],.55,Y,sm(rf-.15,rf+.25,t,easeOutBack)*(1-sm(fc+.4,fc+.8,t)),43);
  angleWedge(s,c,S0,sm(rf-.1,rf+.4,t,easeOutBack)*(1-sm(E-.5,E-.2,t))*.8);
  play(s,c,v,tau,tp,tau4(twos(t)-1/12),{minBall:5,hero:true,demo:true,full:DEMO_CAST,after:()=>{
   shotTrail(s,c,tau,sm(fc-.2,fc+.1,t)*(1-sm(E-.6,E-.3,t)),true);}});
  // "far corner": the ring where the curl goes in
  postRing(s,c,sm(fc+.3,fc+.7,t,easeOutBack)*(1-sm(E-.5,E-.2,t)),GOALD);
  void nt;
 },
 still:2.6,
};

const film:RisoStory={
 id:'gakpo-signature',format:'11v11',title:"Gakpo's cut inside",theme:'From the left wing, cut inside onto your right foot and aim for the far corner',
 ageNote:'UEFA Euro 2024 round of 16, Romania 0–3 Netherlands, Munich, 2 July 2024 — then the move in training. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff4c3b',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a turf kick — grass bits and paper flecks thrown up, a yellow spark. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}spray(s,x,y,age,seed,2.2);if(age<.35)sparkBurst(s,Y,x,y-20,110,{n:7,seed:seed+1,g:easeOutBack(clamp(age/.15))*(1-clamp((age-.2)/.15)),width:15});},
};
/** turf kick: grass bits and paper flecks thrown from a point, ballistic, 0..1 s */
function spray(s:Sheet,x:number,y:number,age:number,seed:number,size=1){
 if(age<0||age>1)return;const r=rng(seed),a=new Path2D(),b=new Path2D(),u=easeOut(clamp(age/.7)),fl=Math.sin(Math.min(1,age/.8)*Math.PI);
 for(let i=0;i<14;i++){const ang=-Math.PI/2+(r()-.5)*2.2,d=(40+r()*170)*u*size,px=x+Math.cos(ang)*d,py=y+Math.sin(ang)*d*.5-fl*(30+r()*70)*size,z=(6+r()*9)*size;(i%3?a:b).addPath(polyPath([[px-z,py-z*.4],[px+z*.6,py-z*.6],[px+z,py+z*.3],[px-z*.4,py+z*.5]],true));}
 const fade=1-clamp((age-.6)/.4);s.knockout(b,.9*fade);s.fill(Y,a,.9*fade);s.tone(B,a,.6*fade);
}
export default film;
