/** Sophia Wilson's signature — the burst in behind. The moment: United States 1–0 Germany (after extra time), Olympic women's football
 * semi-final, Paris 2024, Stade de Lyon (Décines-Charpieu, Lyon), Tuesday 6 August 2024 (kick-off 18:00 CEST): her 95th-minute winner,
 * scored as Sophia Smith (she took the name Wilson on marrying in January 2025). An iconic-play riso film (RisoStory, chapters mode): a 1:1
 * reconstruction from WRITTEN accounts (the footage itself was not reviewed), printed as a riso sheet.
 *
 * WHY THIS MOMENT: iconicPlays.json gives Wilson a signature, not a match ("the burst in behind"; lesson "Run into the space behind the
 * defence, then finish before they catch you"). Her best-documented example is this goal: Mallory Swanson played the ball in behind Germany's
 * back line, Smith raced left-back Felicitas Rauch to it, got there "a moment sooner" and, sliding, lifted it over the onrushing, sliding
 * goalkeeper Ann-Katrin Berger — the run into the space behind and the finish before the defenders could recover, in extra time of an
 * Olympic semi-final that sent the USA to the final (they then beat Brazil 1–0 for gold).
 *
 * SOURCES (Sept 2026, read as raw pages with curl, cached under the build scratchpad films/src-cache/):
 *  - U.S. Soccer, "U.S. Women's National Team Defeats Germany 1-0 on Overtime Goal from Sophia Smith to Advance to Gold Medal Match at
 *    2024 Summer Olympics" (6 Aug 2024) https://www.ussoccer.com/stories/2024/08/usa-vs-germany-score-result-goals-stats-highlights-match-recap-paris-olympics-semifinal
 *    ("Midfielder Sam Coffey played to Swanson just past the center circle, where she took a touch before playing Smith cutting in from the
 *    right wing. It was a chase between the striker and German defender Felicitas Rauch for the ball and Smith got there a moment sooner,
 *    sliding to lift the ball over the onrushing goalkeeper"; "Swanson played to Smith, where the forward chased the ball around her mark and
 *    chipped it over the sliding 'keeper"; "Smith's effort to beat her defender to the ball and slide to shoot past the onrushing ... Berger")
 *  - Associated Press (Anne M. Peterson), "Sophia Smith's extra-time goal sends USWNT into the Olympic final with a 1-0 win over Germany"
 *    (6 Aug 2024, read via the web.archive.org copy) ("Glimpsing a sliver of the net"; "out maneuvering defender Felicitas Rauch and German
 *    goalkeeper Ann-Katrin Berger"; "Smith fell to the ground in celebration and joined in an embrace with teammate Mallory Swanson";
 *    Germany "hunkered down on defense")
 *  - USA Today live updates (Nancy Armour, 6 Aug 2024) ("Mallory Swanson charged up the middle of the field and slotted it to Smith in the
 *    box. She beat Felicitas Rauch, and Germany goalkeeper Ann-Katrin Berger came out ... But Berger came out too early and Smith put the ball
 *    right past her")
 *  - Wikipedia (raw wikitext): "Football at the 2024 Summer Olympics – Women's tournament – Knockout stage" (6 Aug 2024, 18:00, Stade de Lyon,
 *    11,716, referee Bouchra Karboubi (Morocco), Smith 95', a.e.t.; line-ups with numbers and substitutions; the kit boxes: United States
 *    WHITE shirts, RED shorts, WHITE socks; Germany PINK #DD42AA shirts, NAVY #241E76 shorts and socks) and "Sophia Wilson" (née Smith;
 *    5 ft 6 in; three goals at Paris 2024; gold with the USA)
 * CONFIRMED by those accounts: the date, time, ground, crowd and referee; USA 1–0 Germany after extra time, the goal in the 95th minute (five
 * minutes into extra time); Coffey (17) to Swanson (9) just past the centre circle, Swanson's touch and charge up the middle, her pass in
 * behind; Smith (11) cutting in from the right wing, racing Rauch (19) for the ball and getting there first, sliding to lift / chip it over
 * the onrushing, sliding Berger (12); Smith falling to the ground in celebration and Swanson's embrace; the kits (per the Wikipedia kit
 * boxes); the eleven of each side on the pitch at 95' (USA — Naeher, Fox, Girma, Sonnett, Nighswonger on for Dunn 91', Coffey, Albert on
 * for Horan 91', Williams, Rodman, Swanson, Smith; Germany — Berger, Gwinn, Hendrich, Schulze on for Hegering 78', Rauch, Nüsken, Senß on
 * for Lohmann 91', Minge, Brand, Freigang on for Anyomi 69', Bühl); the USA then won the gold medal.
 * INFERRED (illustrative reconstruction): Coffey's and Swanson's kicking feet (drawn right) and the passes' pace; which foot Smith slid in
 * with and lifted the ball with (drawn: the RIGHT, the leading leg of her slide); the number and timing of touches; every spot and position
 * (Swanson passed ≈ 69 m from her own goal; Smith and Rauch met the ball ≈ 15 m out, right of centre; Berger came out ≈ 12 m); the ball's
 * height, flight time and where it crossed the line; Berger's slide (drawn as a low spread dive), her keeper kit (drawn yellow) and hair;
 * the direction of play (USA drawn attacking left to right on the main camera) and which end; the stadium as drawn (a closed two-tier bowl
 * under a roof ring, blue-grey seats, a thin crowd for the 11,716 in a big ground, USA and Germany flags, purple Olympic boards), the
 * early-evening light, the ball (white with navy panels), boots, trim and number inks, hair (drawn in ponytails), the referee's kit, the
 * celebration's exact shape, the TV camera positions and lenses. None of the inferred details is named in the narration.
 *
 * FRAMING (the TV broadcast, never top-down; full-sheet card window 1.45:1 down to square, never sheet.safe): 1 = the high main-stand camera,
 * near real time, from Coffey's pass and Swanson's charge to the goal; 2 = slow-motion replay from a low camera behind Smith's right
 * shoulder: she starts her run before the pass (a yellow run trail past the navy line of the defence), races Rauch (a navy ring) into the
 * space behind (a yellow zone) and gets there first (a red ring, a spark); 3 = replay from behind Germany's goal: Berger slides out, the lift
 * over her into the net, then the pan to Smith on the ground and Swanson's embrace and a gold burst; 4 = the lesson from a raised coaching
 * angle (the line of the defence, the space behind it, her run, the finish, the chasers' arrows arriving too late). Every body is the shared
 * riso athlete (lib/plays/riso/athlete.ts) through ONE adapter, drawPlayer(): women's builds (1.6–1.78 m, slimmer bulk) with ponytails that
 * swing through `prev`. Handedness: the world is right-handed exactly like athlete.ts (x toward Germany's goal, y up, +z = the USA's right =
 * the near touchline under the main-stand camera), so slideTackle({foot:'r'}) leads with Smith's RIGHT leg. Scenes read only (t, c); every
 * action keys off cue times, so the recorded voice (withTiming) re-times the film; every random value is seeded. Heat: small figures print
 * at 'low', only named figures at full detail, everything capped in a passage (≈ 150–330 plate ops a frame). */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,rectPath,partial,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow,footballPanels} from '../../paths/riso/shapes';
import {beats,shotAt,reframe,steady,near,type View as DView,type Keep,type ReframeOpts,type Pin} from './director';
import {drawAthlete,motionSmear,runCycle,backpedal,lunge,strike,keeperSet,keeperDive,slideTackle,stand,posed,blendPose,
 type Pose,type AthleteStyle,type InkFill,type Place,type Projector,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets (every cue starts with a plain word);
 * their `at` and each chapter's `seconds` are ESTIMATES (≈2.7 words/s + punctuation pauses) until the Kokoro voice exists. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The goal, live',text:'Lyon, 2024, the Olympic semi-final: USA against Germany, in extra time. Mallory Swanson passes in behind. Sophia Smith, now Sophia Wilson, bursts past the defender... the keeper rushes out... she lifts it over her. Goal!',tail:2.4,
  cues:['Lyon','the Olympic','against Germany','extra time','Mallory Swanson','Sophia Smith','bursts past','the keeper','she lifts','Goal']},
 {label:'Watch it again',text:'Watch again. Sophia starts running before the pass. She races Felicitas Rauch into the space behind and gets there first.',tail:1.6,
  cues:['Watch again','Sophia starts','before the pass','She races','Felicitas Rauch','space behind','gets there first']},
 {label:'Over the keeper',text:'Ann-Katrin Berger slides out, so Sophia lifts the ball over her, into the net. The USA won gold!',tail:2.2,
  cues:['Berger slides','Sophia lifts','over her','into the net','won gold']},
 {label:'Your turn',text:'Your turn: run into the space behind the defence, then finish before they catch you.',tail:1.8,
  cues:['Your turn','run into','space behind','then finish','before they catch']},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py sophia-wilson-signature, which writes timing.json next to script.json. Then add
 *   import timingJson from '../../../public/plays/narration/sophia-wilson-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/sophia-wilson-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (calibrated on the voiced films, ≈ 2.6 words/s): .2 s + .02 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.2+.02*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.16;if(/[.!?]$/.test(w))t+=.3;if(/\.\.\.$/.test(w))t+=.2;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('wilson: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('wilson: no cue '+w);return c.at;};
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
const frame=(s:Sheet)=>{LENS=Math.pow(Math.min(1,s.W/1620),.45);const z=cam(s,0,0,1);DV={w:s.W/z,h:s.H/z};return view(s,z);};
/** the window in camera units (set by frame(); read by the director's reframing, aperture() included) */
let DV:DView={w:1566,h:1080};
/** steady() half-window (s); ch3: the eye stays behind the net (x ≥ PL3); ch1 recenter range */
const STEADY=.45,PL3=107.5,RCMIN=.3,RCMAX=.7;
/** ch1 aims between the framed points (director `recenter`) while two things must share the frame — the pass in behind (Swanson →
 * Smith, ball) and the lift into the net — and at the hero otherwise; eased over ≥ .8 s */
const RC1=(t:number)=>Math.max(sm(TP-1,TP-.2,t)*(1-sm(CUE(0,'bursts')-.8,CUE(0,'bursts'),t)),sm(CUE(0,'she lifts')-.4,CUE(0,'she lifts')+.4,t))*RCMAX+RCMIN;
/** the director's move on a look() camera: reframe the eye/aim/focal (a Pin in look()'s scaled focal units) */
const direct=(c:Cam,T:V3,hero:[number,number],ball:V3|null,keep:Keep[],t:number,B:ReturnType<typeof beats>,o?:ReframeOpts):Pin=>
 reframe({eye:c.C,target:T,F:c.F},{hero:[hero[0],0,hero[1]],ball,keep,height:1.7},shotAt(t,B),DV,o);
/** the directed camera averaged over ±STEADY s by the director's steady() (a keep point arriving or letting go becomes a smooth move,
 * never a snap), rebuilt once with look() */
const settle=(t:number,at:(t:number)=>Pin):Cam=>{const p=steady(t,at,STEADY,5);return look(p.eye,p.target,p.F/LENS);};
/** feet and head of actor k at τ as hard keep points */
const body=(k:number,tau:number):Keep[]=>{const[x,z]=posOf(k,tau);return[[x,0,z],[x,1.75,z]];};

// ---------------------------------------------------------------- the TV camera: a right-handed 3D projection of the pitch
/** Pitch metres (right-handed, like athlete.ts): X along the length (the USA attack +X; Germany's goal line at 105), Y up, Z across
 * (0 = the middle, +34 = the near touchline under the main-stand camera = the USA's right, the wing Smith cut in from). */
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

// ---------------------------------------------------------------- the Stade de Lyon on an August evening
/** stand planes (a along, b up the rake 0..1): 0 the far side (−z), 1 behind the USA's own goal (x < 0), 2 the main stand (+z, the camera
 * side), 3 behind Germany's goal (x > 105). A closed bowl: the planes run long so they meet in the corners. Two tiers each. */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-14,119,a),27*b,-38-27*b],
 (a,b)=>[-7-26*b,26*b,lerp(44+26*b,-44-26*b,a)],
 (a,b)=>[lerp(119,-14,a),28*b,38+28*b],
 (a,b)=>[112+26*b,26*b,lerp(-44-26*b,44+26*b,a)],
];
const STAND_COLS=[104,70,104,70],STAND_ROWS=[13,12,13,12],TIER=.46;
/** flags and banners at the stand fronts: [stand, a, b, 0 = a stars-and-stripes flag | 1 = a Germany flag (navy, red, gold bands) |
 * 2 = a long red-white-and-blue banner] */
const FLAGS:[number,number,number,number][]=[[0,.22,.1,0],[0,.38,.14,2],[0,.52,.12,1],[0,.66,.1,0],[0,.8,.13,1],[1,.34,.14,0],[1,.6,.12,2],[3,.2,.12,1],[3,.36,.16,1],[3,.62,.12,0],[3,.8,.14,2],[2,.3,.12,0]];
function stadium(s:Sheet,c:Cam,v:View,t:number,which:number[],o:{roar?:number}={}){
 const{roar=0}=o,tt=twos(t);
 // an early-evening August sky, warm toward the horizon
 s.tone(B,rectPath(-1e4,-1e4,2e4,2e4),.22);
 const hz=pr(c,add3(c.C,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz){s.knockout(polyPath([[-1e4,hz[1]+80],[1e4,hz[1]+80],[1e4,hz[1]-300],[-1e4,hz[1]-300]],true),.45);s.tone(Y,polyPath([[-1e4,hz[1]+80],[1e4,hz[1]+80],[1e4,hz[1]-180],[-1e4,hz[1]-180]],true),.28);s.tone(R,polyPath([[-1e4,hz[1]+80],[1e4,hz[1]+80],[1e4,hz[1]-70],[-1e4,hz[1]-70]],true),.1);}
 const planes=new Path2D(),tier=new Path2D(),roof=new Path2D(),edge=new Path2D();
 for(const i of which){const S=STANDS[i];addPoly(planes,polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]));seg3(c,S(0,TIER),S(1,TIER),.55,tier);
  addPoly(roof,polyP(c,[add3(S(0,1),[0,1.2,0]),add3(S(1,1),[0,1.2,0]),add3(S(1,.55),[0,14,0]),add3(S(0,.55),[0,14,0])]));
  seg3(c,add3(S(0,.55),[0,13.8,0]),add3(S(1,.55),[0,13.8,0]),.7,edge);}
 // blue-grey seats, mostly empty (11,716 in a big bowl), paper tier fascias
 s.knockout(planes);s.tone(B,planes,.5);s.tone(K,planes,.34);s.knockout(tier,.85);
 // a thin crowd, thicker low and near the middle: red, white and navy for the USA, a German knot in pink and navy, a few gold shirts
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STAND_COLS[si],rows=STAND_ROWS[si],P=STANDS[si];for(let j=0;j<rows;j++){const b=(j+.5)/rows;if(Math.abs(b-TIER)<.04)continue;
  for(let i=0;i<S;i++){const a=(i+.5+(hash(i+j*31,9)-.5)*.6)/S,h=hash(i*131+j*7919+si*17,13),mid=si===0||si===2?1-Math.abs(a-.5)*1.2:.6,keep=(b<TIER?.55:.2)*mid;
   if(h>keep)continue;const q=toCam(c,P(a,b));if(q[2]<NEAR+3)continue;
   const p=scr(c,q);if(!inView(v,p))continue;const z=clamp(c.F*.6/q[2],2.4,16),de=si===3&&a>.55,hh=h/Math.max(.01,keep),lift=roar>0&&!de?roar*z*1.3*Math.max(0,Math.sin(tt*10+hh*TAU)):0;
   const ink=de?(hh<.55?1:2):hh<.36?1:hh<.66?0:hh<.93?2:4;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.75);s.fill(R,inks[1],.9);s.fill(K,inks[2],.85);s.fill(Y,inks[4],.95);
 s.knockout(roof);s.fill(K,roof,.92);s.knockout(edge,.7);
 const fl=new Path2D(),pap=new Path2D(),blu=new Path2D(),nav=new Path2D(),gold=new Path2D();
 for(const[si,a,b0,kind] of FLAGS){if(!which.includes(si))continue;const S=STANDS[si],w=kind===2?.1:.03,hb=kind===2?.04:.075,P=(u:number,b:number)=>S(a+u*w,b);
  const q=polyP(c,[P(0,b0),P(1,b0),P(1,b0+hb),P(0,b0+hb)]);if(q.length<3)continue;
  if(kind===1){addPoly(gold,polyP(c,[P(0,b0),P(1,b0),P(1,b0+hb/3),P(0,b0+hb/3)]));addPoly(fl,polyP(c,[P(0,b0+hb/3),P(1,b0+hb/3),P(1,b0+hb*2/3),P(0,b0+hb*2/3)]));addPoly(nav,polyP(c,[P(0,b0+hb*2/3),P(1,b0+hb*2/3),P(1,b0+hb),P(0,b0+hb)]));continue;}
  fl.addPath(polyPath(q,true));
  if(kind===0){for(const k of[1,3])addPoly(pap,polyP(c,[P(0,b0+hb*k/5),P(1,b0+hb*k/5),P(1,b0+hb*(k+1)/5),P(0,b0+hb*(k+1)/5)]));addPoly(blu,polyP(c,[P(0,b0+hb*.55),P(.42,b0+hb*.55),P(.42,b0+hb),P(0,b0+hb)]));}
  else{addPoly(pap,polyP(c,[P(.33,b0),P(.66,b0),P(.66,b0+hb),P(.33,b0+hb)]));addPoly(blu,polyP(c,[P(.66,b0),P(1,b0),P(1,b0+hb),P(.66,b0+hb)]));}}
 s.knockout(fl);s.fill(R,fl,.95);s.knockout(pap,.95);s.knockout(blu);s.fill(B,blu,.95);s.fill(K,blu,.35);s.knockout(nav);s.fill(K,nav,.95);s.knockout(gold);s.fill(Y,gold,.95);
}
/** grass with mowing stripes, the purple Olympic boards, paper lines, both goals (Germany's drawn later when the camera is behind it) */
function ground(s:Sheet,c:Cam,o:{bulge?:number;goalLater?:boolean}={}){
 const sr=polyP(c,[[-9,0,-38],[114,0,-38],[114,0,38],[-9,0,38]]);if(sr.length<3)return;const srp=polyPath(sr,true);s.knockout(srp);s.fill(Y,srp,.8);s.tone(B,srp,.9);s.tone(K,srp,.12);
 const g=polyP(c,[[-3,0,-36.5],[108,0,-36.5],[108,0,36.5],[-3,0,36.5]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.92);s.tone(B,gp,.8);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[k*5.25,0,-34],[(k+1)*5.25,0,-34],[(k+1)*5.25,0,34],[k*5.25,0,34]]));s.tone(K,st,.1);
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
 if(!o.goalLater)goal3(s,c,105,1,o.bulge??0,GOALPT[2]);
}
/** a goal at X: posts at z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out around bz */
function goal3(s:Sheet,c:Cam,X:number,d:number,bulge:number,bz:number){
 const z0=-3.66,z1=3.66,H=2.44,back=(z:number,y:number)=>X+d*(2+bulge*.8*Math.exp(-Math.pow((z-bz)/1.6,2))*(1-.5*y/1.9));
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
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.3],[B,.08]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.22]];
const W_BUILD=(height:number,bulk=.9)=>({height,bulk,head:.97});
/** United States (confirmed by the kit box: white shirts, red shorts, white socks); navy trim and numbers (inferred) */
const USA=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:[R,.92],socks:'paper',boots:K,skin:SKIN_L,hair:[Y,.8],line:K,trim:K,numberInk:K,hairStyle:'ponytail',build:W_BUILD(1.68),shade:[B,.32],...o});
/** Germany (confirmed by the kit box: pink shirts, navy shorts and socks); navy numbers and trim (inferred) */
const GER=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[R,.66],shorts:[K,.9],socks:[K,.9],boots:K,skin:SKIN_L,hair:[Y,.7],line:K,trim:[K,.85],numberInk:K,hairStyle:'ponytail',build:W_BUILD(1.7),shade:[B,.3],...o});
/** Sophia Smith (Wilson), number 11 (confirmed), 1.68 m (5 ft 6 in, confirmed); dark hair in a ponytail (inferred) */
const SMI_ST=USA({number:11,skin:SKIN_D,hair:K,build:W_BUILD(1.68,.9),seed:11});
/** Ann-Katrin Berger, number 12: keeper kit inferred (yellow), short hair inferred */
const BER_ST:AthleteStyle={shirt:[Y,.95],shorts:[Y,.95],socks:[Y,.95],boots:K,skin:SKIN_L,hair:[Y,.6],hairStyle:'short',line:K,gloves:'paper',sleeves:'long',trim:K,number:12,numberInk:K,build:W_BUILD(1.8,.95),seed:12};
/** Bouchra Karboubi: the referee's kit inferred (blue shirt, navy shorts) */
const REF:AthleteStyle={shirt:[B,.85],shorts:[K,.9],socks:[K,.9],boots:K,skin:SKIN_M,hair:K,hairStyle:'ponytail',line:K,trim:K,build:W_BUILD(1.68),seed:21};

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete: fluid FK body, kit inks, halftone shade, key line).
 * prev = the pose one drawing earlier (secondary motion: ponytails and hem trail); smear = a halftone echo + speed lines for fast limbs. */
function drawPlayer(s:Sheet,pose:Pose,camera:Projector,style:AthleteStyle,place:Place,o:{prev?:Pose;smear?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{threshold:10});
 return drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev}:{});
}

// ---------------------------------------------------------------- the players: keyframed tracks (τ = seconds after Swanson's pass in behind)
type Role='smi'|'usa'|'ger'|'gk'|'ref';
type Move={kind:'lunge'|'dive'|'strike';at:number;dur:number;side:'l'|'r';power?:number};
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];moves?:Move[];engage?:[number,number];key?:boolean};
/** COF = Coffey's pass, REC = Swanson receives, 0 = Swanson's pass, SHOT = Smith's sliding lift, IN_NET = over the line */
const COF=-4,REC=-3.2,SHOT=2,SLIDE=1.1,SL0=SHOT-.42*SLIDE,IN_NET=SHOT+1.22;
/** Positions are Hermite-interpolated between keys [τ, X, Z]; the named beats follow the accounts, every spot is inferred. */
const ACTORS:Actor[]=[
 {name:'Smith',role:'smi',style:SMI_ST,key:true,keys:[[-6.5,65.5,23.8],[-4,69.4,21.8],[-2,73.4,19.6],[-1,75.8,18],[0,78.6,15.8],[.5,80.9,13.6],[1,83.5,11.1],[1.5,86.4,8.2],[SL0,86.7,7.95],[SHOT,89.2,6.2],[2.4,90.4,5.4],[2.8,91,5],[3.2,91.2,4.9],[10,91.2,4.9]]},
 {name:'Swanson',role:'usa',style:USA({number:9,hair:[Y,.55],build:W_BUILD(1.68),seed:9}),key:true,moves:[{kind:'strike',at:0,dur:.8,side:'r',power:.75}],keys:[[-6.5,54,-2.8],[-5,55.6,-2.3],[REC,58.3,-1.5],[-2,62.4,-.8],[-1,65.9,-.2],[0,69.2,.4],[1,72,1],[3,79.5,2.4],[5,86.6,3.9],[6,89.6,4.4],[10,89.9,4.5]]},
 {name:'Rauch',role:'ger',style:GER({number:19,hair:[Y,.75],build:W_BUILD(1.73),seed:19}),key:true,engage:[.8,2.6],moves:[{kind:'lunge',at:SHOT+.08,dur:.75,side:'l'}],keys:[[-6.5,80,15],[-3,81.5,13.6],[0,84,11.2],[1,86.4,9.5],[1.5,87.8,8.6],[SHOT,89.1,7.6],[2.6,89.8,7.3],[3.5,89.8,8.4],[5,89.2,10],[10,89,10.4]]},
 {name:'Berger',role:'gk',style:BER_ST,key:true,moves:[{kind:'dive',at:SHOT+.12,dur:.95,side:'r'}],keys:[[-6.5,102,.5],[-1,100.8,1.3],[0,99.8,2],[1,96.8,3.3],[1.6,94.5,4.1],[SHOT,93.5,4.5],[3,93.4,4.6],[10,93.4,4.6]]},
 {name:'Hendrich',role:'ger',style:GER({number:3,hair:[Y,.6],build:W_BUILD(1.73),seed:3}),key:true,keys:[[-6.5,84,2.6],[0,86.5,1.5],[2,90,2.2],[4,92.4,.8],[10,92.2,-1]]},
 {name:'Schulze',role:'ger',style:GER({number:4,build:W_BUILD(1.76),seed:4}),keys:[[-6.5,84.5,-6],[0,87,-6.5],[3,90.5,-4],[10,92,-3]]},
 {name:'Gwinn',role:'ger',style:GER({number:15,hair:[Y,.65],build:W_BUILD(1.68),seed:15}),keys:[[-6.5,82,-17],[0,85,-16],[3,88.5,-13],[10,90,-12]]},
 {name:'Nüsken',role:'ger',style:GER({number:9,build:W_BUILD(1.75),seed:29}),keys:[[-6.5,70,-3],[0,74,-1.5],[3,80,.5],[10,84,1.5]]},
 {name:'Minge',role:'ger',style:GER({number:6,hair:K,build:W_BUILD(1.7),seed:6}),keys:[[-6.5,66,6],[0,70,5],[3,77,5],[10,81,5]]},
 {name:'Senß',role:'ger',style:GER({number:14,build:W_BUILD(1.7),seed:14}),keys:[[-6.5,68,-10],[0,71,-8],[3,76,-6],[10,80,-5]]},
 {name:'Brand',role:'ger',style:GER({number:16,hair:K,build:W_BUILD(1.7),seed:16}),keys:[[-6.5,60,12],[0,62,12],[3,66,12],[10,70,11]]},
 {name:'Bühl',role:'ger',style:GER({number:17,build:W_BUILD(1.7),seed:17}),keys:[[-6.5,58,-14],[10,63,-12]]},
 {name:'Freigang',role:'ger',style:GER({number:10,hair:K,build:W_BUILD(1.68),seed:10}),keys:[[-6.5,52,4],[10,56,4]]},
 {name:'Coffey',role:'usa',style:USA({number:17,hair:[Y,.7],build:W_BUILD(1.73),seed:17}),moves:[{kind:'strike',at:COF,dur:.8,side:'r',power:.6}],keys:[[-6.5,46.5,-5.2],[COF,49.4,-4.5],[0,55,-3],[10,64,-2]]},
 {name:'Rodman',role:'usa',style:USA({number:5,skin:SKIN_M,hair:K,build:W_BUILD(1.73),seed:5}),keys:[[-6.5,67,-18],[0,78,-14],[3,86,-10],[6,88.5,-2],[10,89,1]]},
 {name:'Williams',role:'usa',style:USA({number:8,skin:SKIN_D,hair:K,build:W_BUILD(1.68),seed:8}),keys:[[-6.5,69,-6.5],[0,79,-4.5],[3,87,-2],[6,90,2],[10,90.4,3]]},
 {name:'Albert',role:'usa',style:USA({number:3,hair:[Y,.7],build:W_BUILD(1.72),seed:31}),keys:[[-6.5,57,5],[0,65,4],[10,72,5]]},
 {name:'Nighswonger',role:'usa',style:USA({number:13,hair:[Y,.6],build:W_BUILD(1.68),seed:13}),keys:[[-6.5,54,-20],[10,62,-18]]},
 {name:'Fox',role:'usa',style:USA({number:2,hair:[Y,.7],build:W_BUILD(1.68),seed:2}),keys:[[-6.5,53,21],[10,61,20]]},
 {name:'referee',role:'ref',style:REF,keys:[[-6.5,62,9],[0,70,11],[10,82,12]]},
];
const SMI=0,SWA=1,RAU=2,BER=3,HEN=4,COFK=13;
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const T0=-7,T1=10,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const smooth=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau),b=posOf(k,tau-.3),d=posOf(k,tau-.6);return[(a[0]+b[0]+d[0])/3,(a[1]+b[1]+d[1])/3];};

// ---------------------------------------------------------------- the ball: Coffey's pass, Swanson's charge, the ball in behind, the lift
/** where the lift crosses the line (inferred): right of centre, below the bar, and the resting spot in the net */
const GOALPT:V3=[105,.95,1.1],NET:V3=[106.6,.7,1.3],REST:V3=[106.3,.11,1.2];
/** Smith's heading: along the run, turned toward the goal through the slide, then held while she lies on the grass */
const SLIDE_YAW=(()=>{const p=posOf(SMI,SHOT);return yawOf(GOALPT[0]-p[0],GOALPT[2]-p[1])-.12;})();
function yawSmith(tau:number):number{
 const v=velOf(SMI,Math.min(tau,SL0)),head=Math.hypot(v[0],v[1])>.4?yawOf(v[0],v[1]):yawOf(1,-.6);
 return lerpA(head,SLIDE_YAW,sm(SL0-.35,SL0+.1,tau));
}
const fwdR=(y:number):[Pt,Pt]=>[[Math.cos(y),-Math.sin(y)],[Math.sin(y),Math.cos(y)]];
/** the meeting point: the right boot at full stretch of the slide (the lead leg reaches ≈ .95 m ahead of the root) */
const M:[number,number]=(()=>{const p=posOf(SMI,SHOT),[f,r]=fwdR(SLIDE_YAW);return[p[0]+f[0]*.95+r[0]*.12,p[1]+f[1]*.95+r[1]*.12];})();
const swaFoot=(tau:number):[number,number]=>{const p=posOf(SWA,tau),v=velOf(SWA,tau),l=Math.hypot(v[0],v[1])||1;return[p[0]+v[0]/l*.5,p[1]+v[1]/l*.5+.12];};
const cofFoot=():[number,number]=>{const p=posOf(COFK,COF);return[p[0]+.5,p[1]+.12];};
/** the lift: rising off the boot over the sliding keeper, dropping under the bar (peak ≈ 1.6 m) */
function liftAt(u:number):V3{const e=1-Math.pow(1-u,1.15);return[lerp(M[0],GOALPT[0],e),.11+(GOALPT[1]-.11)*u+1.5*4*u*(1-u),lerp(M[1],GOALPT[2],e)];}
function ballAt(tau:number):V3{
 if(tau<COF){const d=cofFoot();return[d[0],.11,d[1]];}
 if(tau<REC){const u=(tau-COF)/(REC-COF),a=cofFoot(),b=swaFoot(REC),e=1-Math.pow(1-u,1.4);return[lerp(a[0],b[0],e),.11,lerp(a[1],b[1],e)];}
 if(tau<0){const f=swaFoot(tau),v=velOf(SWA,tau),l=Math.hypot(v[0],v[1])||1,push=.35*Math.abs(Math.sin(Math.PI*(tau-REC)/.62));return[f[0]+v[0]/l*push,.11,f[1]+v[1]/l*push];}// her touch, then the charge
 if(tau<SHOT){const u=tau/SHOT,a=swaFoot(0),e=1-Math.pow(1-u,1.5);return[lerp(a[0],M[0],e),.11,lerp(a[1],M[1],e)];}// the ball in behind
 if(tau<IN_NET)return liftAt((tau-SHOT)/(IN_NET-SHOT));
 const u=clamp((tau-IN_NET)/.2);if(u<1)return lerp3(GOALPT,NET,u);
 const w=clamp((tau-IN_NET-.2)/.5),e=w*w;return[lerp(NET[0],REST[0],w),lerp(NET[1],REST[1],e),lerp(NET[2],REST[2],w)];
}
const bulgeAt=(tau:number)=>tau<IN_NET?0:Math.exp(-(tau-IN_NET)*2.2)*(1+.3*Math.sin((tau-IN_NET)*14));

// ---------------------------------------------------------------- poses (angles in degrees via posed; the athlete clamps to real range of motion)
const RAD=Math.PI/180;
const LIN=new Set(['dx','dz','air','lHand','rHand','squash']);
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LIN.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:10,rHipA:10,lean:16,pitch:4,lShA:26,rShA:26,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
/** the lift: the leading right boot scoops under the ball at the end of the slide, toe up */
const SCOOP:Partial<Pose>={rAnk:-26,rHipF:52,rKnee:10};
/** down on the grass after the goal: propped on the hips, both arms flung up (she "fell to the ground in celebration") */
const JOY:Partial<Pose>={lShF:150,rShF:150,lShA:40,rShA:40,lElb:14,rElb:14,neckP:-26};
/** Swanson's embrace: crouched over her, arms wide and forward */
const HUG:Partial<Pose>={lHipF:70,rHipF:40,lKnee:96,rKnee:120,lean:42,lShF:80,rShF:80,lShA:34,rShA:34,lElb:50,rElb:50,neckP:10};
/** the whole pose of actor k at τ, with its yaw */
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),m=posOf(SMI,tau),b=ballAt(tau);
 let yaw=sp>.45?yawOf(v[0],v[1]):yawOf(b[0]-x,b[2]-z);
 if(a.engage&&tau>a.engage[0]-.4&&tau<a.engage[1]+.4)yaw=lerpA(yaw,yawOf(m[0]-x,m[1]-z),Math.min(sm(a.engage[0]-.4,a.engage[0],tau),1-sm(a.engage[1],a.engage[1]+.4,tau)));
 // the keeper rushes out square to Smith, then goes down across her (the dive's direction is fixed at the set)
 if(a.role==='gk')yaw=tau<SHOT-.3?yawOf(m[0]-x,m[1]-z):yawOf(M[0]-x,M[1]-z);
 if(k===SMI)yaw=yawSmith(tau);
 // Swanson turns to Smith as she arrives for the embrace
 if(k===SWA&&tau>5.2)yaw=lerpA(yaw,yawOf(m[0]-x,m[1]-z),sm(5.2,5.8,tau));
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 let p:Pose;
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='ger'?READY:stand();
 if(sp>.5&&along<-.35*sp&&k!==SMI)p=blendPose(idle,backpedal(distOf(k,tau)/1.2),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5),cyc=k===SMI?3.1:3.3;p=blendPose(idle,runCycle(distOf(k,tau)/cyc,{speed:s}),clamp((sp-.4)/.9));}
 if(a.role==='gk'&&tau<SHOT-.2&&sp>1)p=blendPose(p,runCycle(distOf(k,tau)/3,{speed:.8}),1);
 for(const mv of a.moves??[]){const lead=mv.kind==='dive'?.55:mv.kind==='strike'?.52:.6,t0=mv.at-lead*mv.dur,u=(tau-t0)/mv.dur;
  if(mv.kind==='lunge'&&u>0&&u<1.6)p=blendPose(p,lunge(Math.min(1,u),{side:mv.side}),Math.min(sm(0,.12,u),1-sm(1.1,1.6,u)));
  if(mv.kind==='dive'&&u>0)p=keeperDive(Math.min(1,u),{side:mv.side,height:0});
  if(mv.kind==='strike'&&u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:mv.side,power:mv.power??.7}),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));}
 if(k===SMI&&tau>SL0-.12){
  // the slide: slideTackle leading with the RIGHT leg; the track carries her, so the pose's own root shift is dropped
  const u=clamp((tau-SL0)/SLIDE);let q=slideTackle(u,{foot:'r'});q={...q,dx:0,dz:0};
  q=over(q,SCOOP,bump(SHOT-.18,SHOT+.2,tau));
  if(tau>IN_NET+.1)q=over(q,JOY,sm(IN_NET+.1,IN_NET+.6,tau));
  p=blendPose(p,q,sm(SL0-.12,SL0+.05,tau));
 }
 if(k===SWA&&tau>5.4)p=over(p,HUG,sm(5.4,6,tau));
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
 const sh=new Path2D();for(const e of list)if(e.h<420)sh.addPath(polyPath(blob(e.g[0]+e.h*.05,e.g[1],e.h*.14,e.h*.035,ACTORS[e.k].style.seed??1,{amp:.05,n:14}),true));
 if(bground&&bg)sh.addPath(polyPath(blob(bground[0],bground[1],br*.8,br*.25,2,{amp:.05,n:12}),true));s.tone(K,sh,.42);
 list.sort((p,q)=>q.d-p.d);
 const drawBall=()=>{if(bg)ball(s,bg[0],bg[1],br,Math.hypot(b[0],b[2])/.11);};
 let ballDone=!list.length||bq[2]>=list[0].d,heroR:DrawResult|undefined;if(ballDone)drawBall();
 for(const e of list){if(!ballDone&&bq[2]>=e.d){drawBall();ballDone=true;}
  const a=ACTORS[e.k],{p,yaw}=poseOf(e.k,tauP),px=e.h*ppu,big=e.h>=300,named=full?full.includes(e.k):a.key;
  // phone heat: low detail for small figures and extras; during a passage only the hero keeps 'mid'
  const detail=passing?(e.k===SMI?'mid':'low'):px<50||(!named&&px<120)?'low':'auto';
  const r=drawPlayer(s,p,c,{...a.style,shadow:e.h<420?false:undefined,detail},{x:e.x,z:e.z,yaw},big&&(e.k===SMI||e.h>520)&&!passing?{prev:poseOf(e.k,tauPrev).p,smear:hero&&e.k===SMI}:{});
  if(e.k===SMI)heroR=r;}
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
/** the line of Germany's defence when the pass is played (Gwinn, Schulze, Hendrich, Rauch at τ = 0), a navy dashed line on the grass */
const LINE_PTS:[number,number][]=(()=>{const g=posOf(6,0),s5=posOf(5,0),h=posOf(HEN,0),r=posOf(RAU,0);return[[g[0]-.5,g[1]-3],g,s5,h,r,[r[0]-.4,r[1]+3]];})();
function defenceLine(s:Sheet,c:Cam,w:number,prog=1){if(w<=0)return;const pts:Pt[]=[];for(let i=0;i<LINE_PTS.length-1;i++)for(let j=0;j<6;j++){const u=j/6,a=LINE_PTS[i],b=LINE_PTS[i+1],q=pr(c,[lerp(a[0],b[0],u),0,lerp(a[1],b[1],u)]);if(q)pts.push(q);}
 const l=LINE_PTS[LINE_PTS.length-1],e=pr(c,[l[0],0,l[1]]);if(e)pts.push(e);if(pts.length<6)return;const sub=partial(pts,clamp(prog)),q=toCam(c,[85,0,0]),wd=Math.max(4,c.F*.1/q[2]);
 s.knockout(ribbon(sub,wd*1.5,{seed:51,taper:0,wobble:.8}),.6*w);s.fill(K,ribbon(sub,wd,{seed:52,taper:0,wobble:.8,gaps:[[.1,.16],[.26,.32],[.42,.48],[.58,.64],[.74,.8],[.9,.95]]}),.95*w);}
/** the space behind the defence: a yellow screen on the grass between the line and the keeper's area */
function spaceZone(s:Sheet,c:Cam,w:number){if(w<=0)return;
 const edge=LINE_PTS.slice(2,5).map(p=>[p[0]+1.2,0,p[1]] as V3),z=polyP(c,[[edge[0][0],0,-7],...edge,[edge[2][0]+.6,0,13],[98,0,13],[98,0,-7]]);if(z.length<3)return;
 const P=polyPath(z,true);s.knockout(P,.3*w);s.tone(Y,P,.45*w);s.tone(R,P,.08*w);}
/** a path on the grass along an actor's run between two moments (optionally dashed), arrowhead at the end */
function runPath(s:Sheet,c:Cam,k:number,ink:string,w:number,prog:number,a0:number,a1:number,seed:number,dashed=true){if(w<=0)return;
 const pts:Pt[]=[];for(let i=0;i<=24;i++){const tau=lerp(a0,a1,i/24),m=posOf(k,tau),q=pr(c,[m[0],0,m[1]]);if(q)pts.push(q);}if(pts.length<6)return;
 const sub=partial(pts,clamp(prog)),m=posOf(k,lerp(a0,a1,.5)),q=toCam(c,[m[0],0,m[1]]),wd=Math.max(5,c.F*.13/q[2]);
 s.knockout(ribbon(sub,wd*1.6,{seed,taper:.1,wobble:.8}),.7*w);s.fill(ink,ribbon(sub,wd,{seed:seed+1,taper:.1,wobble:.8,gaps:dashed?[[.18,.24],[.42,.48],[.66,.72]]:[]}),.95*w);
 if(sub.length>2&&prog>.15){const e=sub[sub.length-1],pv=sub[Math.max(0,sub.length-3)];laneArrow(s,ink,pv,e,wd,{seed:seed+2,head:wd*3.2,cov:.95*w});}}
/** Swanson's pass in behind: a dashed paper-and-navy lane from her boot to the meeting point */
function passLane(s:Sheet,c:Cam,w:number,prog=1){if(w<=0)return;const a0=swaFoot(0),pts:Pt[]=[];for(let i=0;i<=16;i++){const u=i/16,q=pr(c,[lerp(a0[0],M[0],u),0,lerp(a0[1],M[1],u)]);if(q)pts.push(q);}if(pts.length<4)return;
 const sub=partial(pts,clamp(prog)),q=toCam(c,[(a0[0]+M[0])/2,0,(a0[1]+M[1])/2]),wd=Math.max(4,c.F*.1/q[2]);s.knockout(ribbon(sub,wd*1.6,{seed:37,taper:.2,wobble:.6}),.7*w);
 if(sub.length>2)laneArrow(s,K,sub[0],sub[sub.length-1],wd,{seed:38,head:wd*3,cov:.9*w,dashed:true});}
/** a chaser's arrow on the grass toward the meeting point, stopping short (they arrive too late) */
function chaseArrow(s:Sheet,c:Cam,k:number,w:number,prog=1){if(w<=0)return;const f=posOf(k,.9),e:[number,number]=[lerp(f[0],M[0],.72*clamp(prog)),lerp(f[1],M[1],.78*clamp(prog))],a=pr(c,[f[0],0,f[1]]),b=pr(c,[e[0],0,e[1]]);if(!a||!b)return;
 const q=toCam(c,[e[0],0,e[1]]),wd=Math.max(4,c.F*.12/q[2]);s.knockout(ribbon([a,b],wd*1.6,{seed:66+k,taper:.1,wobble:.6}),.7*w);laneArrow(s,K,a,b,wd,{seed:67+k,head:wd*3,cov:.9*w});}
/** a ring round a boot */
function bootRing(s:Sheet,hero:DrawResult|undefined,w:number,side:'l'|'r'='r',ink=Y){if(!hero||w<=0)return;const toe=side==='l'?hero.joints.lToe:hero.joints.rToe,an=side==='l'?hero.joints.lAn:hero.joints.rAn,r=Math.hypot(toe[0]-an[0],toe[1]-an[1])*1.3*w+2,cx=(toe[0]+an[0])/2,cy=(toe[1]+an[1])/2,pts:Pt[]=[];
 for(let i=0;i<26;i++){const a=i/26*TAU;pts.push([cx+Math.cos(a)*r*1.2,cy+Math.sin(a)*r*.85]);}
 const rr=ribbon(pts,Math.max(3,r*.2),{seed:82,close:true,taper:0,wobble:.8});s.knockout(rr,.8*w);s.fill(ink,rr,.95*w);}
/** the lift: a yellow dashed trail through the air along the ball's path, from the boot to where it is now (or all of it) */
function liftTrail(s:Sheet,c:Cam,tau:number,w:number,full=false){if(w<=0)return;const end=full?1:clamp((tau-SHOT)/(IN_NET-SHOT));if(end<=.02)return;
 const pts:Pt[]=[];for(let i=0;i<=28;i++){const q=pr(c,liftAt(end*i/28));if(q)pts.push(q);}if(pts.length<4)return;const q=toCam(c,liftAt(end*.5)),wd=Math.max(4,c.F*.09/q[2]);
 s.knockout(ribbon(pts,wd*1.5,{seed:71,taper:.4,wobble:.6}),.6*w);s.fill(Y,ribbon(pts,wd,{seed:72,taper:.4,wobble:.6,gaps:[[.12,.18],[.3,.36],[.48,.54],[.66,.72],[.84,.9]]}),.95*w);}
/** the spot where the ball crosses the line: a ring in the goal mouth */
function goalRing(s:Sheet,c:Cam,w:number,ink=Y){if(w<=0)return;const pts:Pt[]=[];
 for(let i=0;i<30;i++){const a=i/30*TAU,q=pr(c,[105,GOALPT[1]+Math.sin(a)*.42,GOALPT[2]+Math.cos(a)*.5]);if(q)pts.push(q);}if(pts.length<20)return;
 const q=toCam(c,[105,GOALPT[1],GOALPT[2]]),rr=ribbon(pts,Math.max(4,c.F*.07/q[2]),{close:true,seed:77,taper:0,wobble:1});s.knockout(rr,.85*w);s.fill(ink,rr,.95*w);}
/** first to the ball: a spark at the meeting point */
function firstSpark(s:Sheet,c:Cam,w:number,seed=58){if(w<=0)return;const q=toCam(c,[M[0],.25,M[1]]);if(q[2]<NEAR)return;const g=scr(c,q);
 sparkBurst(s,Y,g[0],g[1],c.F*.9/q[2],{n:9,seed,g:easeOutBack(clamp(w)),width:Math.max(6,c.F*.06/q[2]),cov:.95});}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, near real time
const tau1=(t:number)=>{const G=CUE(0,'Goal');return key(t,mono([[0,-6.2],[CUE(0,'against'),-4.4],[CUE(0,'Mallory'),-1.5],[CUE(0,'Sophia'),.2],[CUE(0,'bursts'),.95],[CUE(0,'the keeper'),1.5],[CUE(0,'she lifts'),SHOT-.05],[G,IN_NET+.05],[SECS(0)+1,IN_NET+.05+(SECS(0)+1-G)*.9]]),linear);};
const CAM1:V3=[62,24,68];
/** Director beats (lib/plays/riso/director.ts, Oct 4 2026): a short establishing wide of the stadium, then follow the ball up the pitch
 * (Coffey to Swanson); pull out as Swanson plays it in behind so the passer AND Smith's run are both in frame (the run starts before the
 * pass — the lesson); stay pulled out on Smith while the ball rolls into the space behind, with Rauch chasing; push in low as Berger comes
 * out and Smith slides to lift it over her (Rauch and Berger kept in frame, the ball kept all the way into the net); then Smith. */
const TP=lerp(CUE(0,'Mallory'),CUE(0,'Sophia'),1.5/1.7)-.6,TS=CUE(0,'Sophia')+.3;
const B1=beats([[0,'wide'],[.7,{from:'follow',size:.4}],[TP,{from:'space',size:.24,low:.5}],[TS,{from:'space',size:.3,low:.5}],
 [CUE(0,'bursts')-.35,'follow'],[CUE(0,'she lifts')-.45,'tight'],[CUE(0,'Goal')+.3,{from:'reaction',size:.62}]]);
/** the ch1 subject: the ball carrier (Coffey, then Swanson) handing over smoothly to Smith around the pass in behind (τ −.5 … .4) */
function hero1(tau:number):[number,number]{const c=posOf(COFK,tau),w=posOf(SWA,tau),m=posOf(SMI,tau),u=sm(COF,REC,tau,easeInOutSine),v=sm(-.5,.4,tau,easeInOutSine);
 return[lerp(lerp(c[0],w[0],u),m[0],v),lerp(lerp(c[1],w[1],u),m[1],v)];}
const cam1=(t:number)=>settle(t,cam1At);
function cam1At(t:number):Pin{const tau=tau1(t),{c,T}=cam1Authored(t),h=hero1(tau),k=keep1(t,tau,h);return direct(c,T,h,null,k,t,B1,{recenter:RC1(t)});}
/** what ch1 must keep in frame. Keep points slide in from the hero's own spot (a moving point, not a fading weight, so nothing pops):
 * Smith's run while Swanson is the subject (passer and target both in frame at the pass); the ball until it is in the net; Rauch and
 * Berger near Smith (soft); and any other player close enough to the hero to be cut by the frame edge */
function keep1(t:number,tau:number,h:[number,number]):Keep[]{
 const ws=sm(TP-.2,TP+.6,t)*(1-sm(-.5,.4,tau)),wb=sm(IN_NET+.4,IN_NET+1,tau),tw=sm(CUE(0,'she lifts')-.6,CUE(0,'she lifts'),t),H:V3=[h[0],.9,h[1]];
 const out:Keep[]=[lerp3(ballAt(tau),H,wb)];
 if(ws>0)for(const P of body(SMI,tau))out.push(lerp3(H,P as V3,ws));
 const g=(k:number):V3=>{const[x,z]=posOf(k,tau);return[x,0,z];},rest=ACTORS.flatMap((_,k)=>k===RAU||k===BER?[]:[g(k)]).filter(P=>Math.hypot(P[0]-h[0],P[2]-h[1])>.3);
 return[...out,...near([h[0],0,h[1]],[g(RAU),g(BER)],3,7,1.7),...near([h[0],0,h[1]],rest,lerp(4.5,2,tw),lerp(8,4,tw),1.7)];}
function cam1Authored(t:number):{c:Cam;T:V3}{
 const G=CUE(0,'Goal'),S=SECS(0),tau=tau1(t);
 const bs=(u:number):V3=>{const b=ballAt(Math.min(u,SHOT));return[b[0],0,b[2]];},b0=bs(tau),b1=bs(tau-.35),b2=bs(tau-.7),bt:V3=[(b0[0]+b1[0]+b2[0])/3,0,(b0[2]+b1[2]+b2[2])/3];
 const open:V3=[66,4,2],m=posOf(SMI,tau),cel:V3=[m[0]+1,.8,m[1]-1];
 const toBall=sm(CUE(0,'the Olympic'),CUE(0,'against')+.4,t,easeInOutSine),toS=sm(G+.5,G+1.6,t,easeInOutSine),toGoal=sm(CUE(0,'Sophia'),CUE(0,'she lifts'),t,easeInOutSine)*(1-toS);
 const tb:V3=[lerp(open[0],bt[0]+4+2*toGoal,toBall),lerp(open[1],1.5,toBall),lerp(open[2],lerp(bt[2],7,.25+.2*toGoal),toBall)],T=lerp3(tb,cel,toS);
 const F=key(t,mono([[0,2100],[CUE(0,'against'),2600],[CUE(0,'Mallory'),3000],[CUE(0,'Sophia'),3500],[CUE(0,'bursts'),4200],[CUE(0,'the keeper'),4900],[G,5400],[G+1.6,7200],[S,7600]]),easeInOutSine);
 return{c:look(CAM1,T,F),T};
}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),tau=tau1(t),tp=tau1(twos(t)),G=CUE(0,'Goal');
  stadium(s,c,v,t,[0,1,3],{roar:sm(G-.1,G+.5,t)});
  ground(s,c,{bulge:bulgeAt(tau)});
  play(s,c,v,tau,tp,tau1(twos(t)-1/12),{minBall:8});
 },
 aperture(t){const c=cam1(t),[x,z]=posOf(SMI,tau1(t)),q=toCam(c,[x,.8,z]),g=scr(c,q),h=c.F*1.65/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.09),12);},
 still:6,
};

// ---------------------------------------------------------------- 2 · slow replay, a low camera behind Smith's right shoulder
const tau2=(t:number)=>key(t,mono([[0,-1.5],[CUE(1,'Sophia'),-1.1],[CUE(1,'before'),-.25],[CUE(1,'She races'),.55],[CUE(1,'Felicitas'),1],[CUE(1,'space'),1.5],[CUE(1,'gets there'),SHOT-.12],[SECS(1),SHOT+.3]]),linear);
function cam2(t:number):Cam{
 const tau=tau2(t),m=smooth(SMI,Math.min(tau,SHOT)),open=1-sm(0,1.2,t,easeInOutSine),wide=sm(CUE(1,'space')-.6,CUE(1,'space')+.4,t,easeInOutSine);
 const C:V3=[m[0]-5-1.5*open-1.2*wide,1.8+.4*open+1.1*wide,m[1]+6.2+1.5*open+1*wide],T:V3=[lerp(m[0]+4,92,wide*.7),lerp(.95,1,wide),lerp(m[1]-3,4.5,wide*.7)];
 return look(C,T,lerp(2500-300*open,2150,wide));
}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),tau=tau2(t),tp=tau2(twos(t)),ss=CUE(1,'Sophia'),bp=CUE(1,'before'),fr=CUE(1,'Felicitas'),sb=CUE(1,'space'),gf=CUE(1,'gets there'),E=SECS(1);
  stadium(s,c,v,t,[0,3]);
  ground(s,c);
  const out=1-sm(E-.7,E-.3,t);
  // "the space behind": the yellow zone behind the navy line of the defence
  spaceZone(s,c,sm(sb-.2,sb+.3,t)*out);
  defenceLine(s,c,sm(bp-.1,bp+.3,t)*out,sm(bp-.1,bp+.7,t));
  // "Sophia starts": a red ring at her feet; "before the pass": her run, a yellow trail ahead of her, and the pass lane
  groundRing(s,c,...posOf(SMI,Math.min(tau,0)),.8,R,sm(ss-.15,ss+.3,t,easeOutBack)*(1-sm(bp+.3,bp+.7,t)),42);
  runPath(s,c,SMI,Y,sm(bp-.2,bp+.2,t)*out,sm(bp-.2,bp+.9,t),-1.2,SL0,61);
  passLane(s,c,sm(bp+.2,bp+.5,t)*out,sm(bp+.2,bp+.9,t));
  // "Felicitas Rauch": a navy ring round her; "gets there first": a red ring on the meeting point
  groundRing(s,c,...posOf(RAU,Math.min(tau,SHOT+.3)),.85,K,sm(fr-.15,fr+.3,t,easeOutBack)*out,44);
  groundRing(s,c,M[0],M[1],.7,R,sm(gf-.2,gf+.2,t,easeOutBack)*out,46);
  play(s,c,v,tau,tp,tau2(twos(t)-1/12),{minBall:5,hero:true,full:[SMI,RAU,BER,SWA],after:()=>{firstSpark(s,c,sm(gf-.05,gf+.3,t)*out);}});
  streaks(s,v,1-sm(0,.5,t),21);
 },
 aperture(t){const c=cam2(t),m=posOf(SMI,tau2(t)),q=toCam(c,[m[0],1.2,m[1]]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.14/q[2]),12);},
 still:1.2,
};

// ---------------------------------------------------------------- 3 · replay from behind Germany's goal: the slide, the lift, the net, the embrace
const tau3=(t:number)=>{const wg=CUE(2,'won gold');return key(t,mono([[0,SHOT-1],[CUE(2,'Berger'),SHOT-.4],[CUE(2,'Sophia'),SHOT-.02],[CUE(2,'over her'),SHOT+.4],[CUE(2,'into the net'),IN_NET-.05],[wg,5.9],[SECS(2),5.9+(SECS(2)-wg)*.7]]),linear);};
const swing3=(t:number)=>sm(CUE(2,'into the net')+.5,CUE(2,'won gold')+.2,t,easeInOutSine);
/** Director beats: the replay from behind the goal starts as authored, pushes in on Smith as Berger slides out (Berger kept), goes low
 * and tight for the scooped lift, and lets the flight of the ball pull the frame back to the goal mouth (kept until the camera swings);
 * then holds Smith and Swanson for "won gold". */
const B3=beats([[0,'wide'],[CUE(2,'Berger')-.4,{from:'follow',lens:0}],[CUE(2,'Sophia')-.4,{from:'tight',lens:0}],[CUE(2,'won gold')-.2,{from:'reaction',size:.45}]]);
const cam3=(t:number)=>settle(t,cam3At);
function cam3At(t:number):Pin{const tau=tau3(t),u=swing3(t),{c,T}=cam3Authored(t),m=posOf(SMI,tau);
 const b=lerp3(ballAt(tau),[m[0],.9,m[1]],sm(IN_NET+.8,IN_NET+1.6,tau)),keep:Keep[]=[b,...near([m[0],0,m[1]],[BER,RAU,SWA].map(k=>{const[x,z]=posOf(k,tau);return[x,0,z] as V3;}),3,7,1.7)];
 // the eye never comes in past the goal (it stays behind the net, x ≥ 107.5) until the camera swings round for "won gold"
 return direct(c,T,m,null,keep,t,B3,{minDist:lerp(Math.max(2.5,(PL3-m[0])*1.03),2.5,sm(.2,.6,u))});}
function cam3Authored(t:number):{c:Cam;T:V3}{
 const tau=tau3(t),u=swing3(t),C:V3=[117,4.4+.8*u,4.2-1*u],e=sm(SHOT-.3,IN_NET,tau,easeInOutSine);
 const T0:V3=[lerp(92,97,e),lerp(1,1.4,e),lerp(5,2.6,e)],T1:V3=[91,.8,4.8],T=lerp3(T0,T1,u);
 return{c:look(C,T,lerp(lerp(3500,3000,e),6000,u)),T};
}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),tau=tau3(t),tp=tau3(twos(t)),bs=CUE(2,'Berger'),sl=CUE(2,'Sophia'),oh=CUE(2,'over her'),it=CUE(2,'into the net'),wg=CUE(2,'won gold'),u=swing3(t);
  stadium(s,c,v,t,[0,1,2],{roar:sm(IN_NET,IN_NET+.3,tau)});
  ground(s,c,{goalLater:u<.5});
  groundRing(s,c,...posOf(BER,Math.min(tau,SHOT)),.9,K,sm(bs-.15,bs+.3,t,easeOutBack)*(1-sm(it,it+.4,t)),45);
  play(s,c,v,tau,tp,tau3(twos(t)-1/12),{minBall:5,hero:true,full:[SMI,RAU,BER,SWA],after:({hero})=>{
   bootRing(s,hero,sm(sl-.1,sl+.3,t,easeOutBack)*(1-sm(oh+.2,oh+.6,t)),'r');
   liftTrail(s,c,tau,sm(oh-.3,oh,t)*(1-sm(wg-.3,wg+.1,t)));}});
  if(u<.5){goal3(s,c,105,1,bulgeAt(tau),GOALPT[2]);goalRing(s,c,sm(it-.15,it+.3,t,easeOutBack)*(1-sm(wg-.6,wg-.2,t)));}
  // "won gold": a gold (yellow) burst over Smith and Swanson
  const gw=sm(wg-.1,wg+.4,t);if(gw>0){const m=posOf(SMI,tau),q=toCam(c,[m[0],2.2,m[1]]);if(q[2]>NEAR){const g=scr(c,q);sparkBurst(s,Y,g[0],g[1],c.F*1.5/q[2],{n:12,seed:88,g:easeOutBack(gw),width:12,cov:.95});}}
  streaks(s,v,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3(t),[x,z]=posOf(SMI,tau3(t)),q=toCam(c,[x,.8,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.16/q[2]),12);},
 still:2.6,
};

// ---------------------------------------------------------------- 4 · the lesson: a raised coaching angle behind her, the whole move marked out
const tau4=(t:number)=>key(t,mono([[0,-1.4],[CUE(3,'Your'),-1.2],[CUE(3,'run into'),-.6],[CUE(3,'space'),.4],[CUE(3,'then finish'),SHOT-.1],[CUE(3,'before'),SHOT+.35],[SECS(3),IN_NET+.1]]),linear);
/** Director beats: the coaching angle settles in closer behind Smith for "run into the space behind" while her start mark, the meeting
 * point (the space) and Rauch stay in frame, then frames the finish — Smith, Berger and the goal-ring spot — for "then finish". */
const B4=beats([[0,{from:'lesson',size:.42}],[CUE(3,'then finish')-.4,{from:'lesson',size:.4}]]);
const cam4=(t:number)=>settle(t,cam4At);
function cam4At(t:number):Pin{const tau=tau4(t),{c,T}=cam4Authored(t),m=smooth(SMI,Math.min(tau,SHOT)),wf=sm(CUE(3,'then finish')-1,CUE(3,'then finish')+.3,t);
 const H:V3=[m[0],.9,m[1]],wl=sm(CUE(3,'run into')-.8,CUE(3,'run into')+.1,t),keep:Keep[]=[lerp3(H,[M[0],0,M[1]],wl),lerp3(H,[LINE_PTS[3][0],0,LINE_PTS[3][1]],wl),lerp3(H,[LINE_PTS[4][0],0,LINE_PTS[4][1]],wl),lerp3(H,ballAt(tau),sm(.6,1,tau)),lerp3([M[0],.5,M[1]],GOALPT,wf),...near([m[0],0,m[1]],[RAU,BER].map(k=>{const[x,z]=posOf(k,tau);return[x,0,z] as V3;}),4,9,1.7)];
 return direct(c,T,m,null,keep,t,B4,{recenter:wf});}
function cam4Authored(t:number):{c:Cam;T:V3}{
 const tau=tau4(t),orbit=sm(CUE(3,'space')-.3,CUE(3,'then finish')+.3,t,easeInOutSine),m=smooth(SMI,Math.min(tau,SHOT));
 const C:V3=[lerp(66,72,orbit),lerp(13,12,orbit),lerp(38,34,orbit)],T:V3=[lerp(m[0]+6,92,orbit*.8),.2,lerp(m[1]-4,5,orbit*.8)];
 return{c:look(C,T,lerp(2400,2600,orbit)),T};
}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),tau=tau4(t),tp=tau4(twos(t)),yt=CUE(3,'Your'),ri=CUE(3,'run into'),sb=CUE(3,'space'),tf=CUE(3,'then finish'),bc=CUE(3,'before'),E=SECS(3),out=1-sm(E-.6,E-.3,t);
  stadium(s,c,v,t,[0,3]);
  ground(s,c,{bulge:bulgeAt(tau)});
  spaceZone(s,c,sm(sb-.2,sb+.3,t)*out);
  defenceLine(s,c,sm(ri-.1,ri+.3,t)*out,sm(ri-.1,ri+.8,t));
  groundRing(s,c,...posOf(SMI,Math.min(tau,-1.2)),.8,R,sm(yt,yt+.4,t,easeOutBack)*(1-sm(ri+.2,ri+.6,t)),42);
  runPath(s,c,SMI,Y,sm(ri-.2,ri+.2,t)*out,sm(ri-.2,ri+1,t),-1.2,SL0,61);
  chaseArrow(s,c,RAU,sm(bc-.2,bc+.2,t)*out,sm(bc-.2,bc+.6,t));chaseArrow(s,c,BER,sm(bc-.1,bc+.3,t)*out,sm(bc-.1,bc+.7,t));
  play(s,c,v,tau,tp,tau4(twos(t)-1/12),{minBall:5,hero:true,full:[SMI,RAU,BER,SWA],after:()=>{
   liftTrail(s,c,tau,sm(tf-.1,tf+.2,t)*out);}});
  goalRing(s,c,sm(tf+.4,tf+.8,t,easeOutBack)*out,R);
 },
 still:2.6,
};

const film:RisoStory={
 id:'sophia-wilson-signature',format:'11v11',title:"Wilson's burst in behind",theme:'Running into the space behind the defence, then finishing before they catch you',
 ageNote:'Olympic semi-final, United States 1–0 Germany (after extra time), Stade de Lyon, 6 August 2024: Sophia Wilson (then Sophia Smith) scores in the 95th minute. For players of every age.',
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
