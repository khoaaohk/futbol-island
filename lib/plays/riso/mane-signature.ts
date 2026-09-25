/** Sadio Mané's SIGNATURE film, "the quick cut and finish": the press-and-score goal in the FA Cup semi-final, Manchester City 2–3
 * Liverpool, Wembley Stadium, London, Saturday 16 April 2022, 17th minute (0–1 → 0–2). An iconic-play riso film (RisoStory, chapters mode)
 * played by the card's picture window: a 1:1 reconstruction from WRITTEN accounts and two press photographs (the footage itself was not
 * reviewed), printed as a riso sheet. Kid-appropriate: the keeper's mistake is told kindly ("a heavy touch"); he is never named or mocked.
 *
 * WHY THIS MOMENT: iconicPlays.json gives Mané a signature, not a match ("the quick cut and finish", lesson "Press the defender straight
 * away: winning the ball high up leaves a short run to goal"). This goal is that lesson in one documented action: the ball goes back to
 * the keeper, Mané is already sprinting at him, the keeper's touch is heavy and Mané slides in to force the ball into the net. Mané said
 * afterwards (BBC, quoted by the Guardian live blog): "We started very well, we pressed them high, the goalkeeper made a mistake"; Jürgen
 * Klopp (Guardian) credited Mané's "acceleration and desire" more than the error. The brief's first candidate — the 2018 Champions League
 * final "from Karius's throw" — was NOT used: that goal (Karius's throw blocked into the net) is Benzema's, and Mané's goal in that final
 * was a close-range finish after a corner, not a press. The written sources DESCRIBE this play, so it is staged inside the real match
 * (no separate "how he does it" demonstration is needed); nothing in it contradicts the accounts, and every guess is listed below.
 *
 * SOURCES (Sept 2026, read as raw pages with curl, cached under the build scratchpad films/src-cache/):
 *  - The Guardian, David Hytner at Wembley, match report "Manchester City 2-3 Liverpool" (16 Apr 2022)
 *    https://www.theguardian.com/football/2022/apr/16/manchester-city-liverpool-fa-cup-semi-final-match-report
 *  - The Guardian, Andy Hunter, "Guardiola defends Zack Steffen after mistake against Liverpool costs City" (16 Apr 2022)
 *    https://www.theguardian.com/football/2022/apr/16/guardiola-defends-zack-steffen-after-mistake-against-liverpool-costs-city
 *  - The Guardian live blog, Scott Murray, "Manchester City 2-3 Liverpool: FA Cup semi-final – as it happened" (both pages)
 *    https://www.theguardian.com/football/live/2022/apr/16/manchester-city-v-liverpool-fa-cup-semi-final-live
 *  - Two press photographs on those pages: Konaté's header (Getty; the kits of both teams) and "Sadio Mané scores Liverpool's second goal
 *    after Zack Steffen's error" (Tom Jenkins / The Guardian, taken from behind the goal).
 * CONFIRMED by those accounts: Wembley, FA Cup semi-final, Saturday 16 April 2022, a sunny afternoon; Konaté headed in on 9 minutes, so it
 * was 0–1; on 17 minutes "City stroke it around the back", John Stones played a back pass to Zack Steffen (City's cup keeper, one of seven
 * changes); the ball reached Steffen "on the edge of his six-yard box"; he "took a heavy first touch and, after some hesitation, an even
 * heavier second one"; Mané "flew in to tackle the ball in" / "slide[s] in and force[s] the ball into the net" for 0–2; Liverpool pressed
 * high from the first minutes; Mané played through the middle; Liverpool wore RED shirts ("red shirts lurking"), City SKY-BLUE shirts
 * ("two sky blue shirts"); the photos show Liverpool all red (shirts, shorts, socks), City all sky blue, Steffen in a GREEN keeper kit
 * with 13 on his shorts, a white FA Cup ball with red and black markings, the goal photo shows Mané rising on the keeper's LEFT (the
 * near-post side, from behind the goal) and Steffen on his knees; City's other players (Cancelo, Aké, Zinchenko, Fernandinho, Silva,
 * Grealish, Foden, Jesus, Sterling) and Liverpool's (Salah, Díaz, Thiago, Keïta, Fabinho, Alexander-Arnold, Robertson) were on the pitch.
 * INFERRED (illustrative reconstruction; none of it named in the narration): Mané's shirt number (10, his Liverpool number from 2019, not in
 * the cached pages); which foot he slid with (drawn: his right, the slide's lead leg) and his exact line (drawn: pressing Aké, then Stones,
 * then an arc across to the keeper); where Stones passed from (drawn: the right of City's back line, ≈ 17 m out) and with which foot (right);
 * the direction of both touches (drawn across the six-yard box toward the near post side) and their timing; the keeper's late attempt to
 * clear; how the ball went in (drawn: off Mané's boot, low, inside the near post); every other player's position; the celebration (drawn:
 * Mané up and away toward the near touchline, arms out); which end of Wembley (drawn: City's goal on the right of the main camera, City fans
 * behind it, Liverpool fans at the far end — the goal photo shows mostly red behind the far end); the referee (not drawn); Wembley as
 * drawn (a two-tier bowl of red seats, the arch over the far stand, navy LED boards); the camera positions and lenses.
 *
 * FRAMING (the TV broadcast, never top-down; full-sheet card window 1.45:1 down to square, never sheet.safe): 1 = the high main-stand
 * camera, near real time, from City passing round the back to the goal and the roar; 2 = slow-motion replay from a low touchline camera
 * beside Mané: the back pass (navy arrow), his sprint the moment it goes (red arrow), the gap to the keeper closing (yellow line), the keeper
 * ringed; 3 = replay from behind City's goal (the photographer's view): the heavy touch runs away (yellow arrow), the slide, the ball in
 * the net; 4 = the lesson from a raised coaching angle: press straight away (red), win it high up (yellow ring), a short run to goal
 * (yellow arrow). Every body is the shared riso athlete (lib/plays/riso/athlete.ts) through ONE adapter, drawPlayer(). Handedness: the
 * world is right-handed exactly like athlete.ts (x toward City's goal, y up, +z = the near touchline under the main camera = Liverpool's
 * right), so slideTackle({foot:'r'}) is Mané's RIGHT foot. Scenes read only (t, c); every action keys off cue times, so the recorded voice
 * (withTiming) re-times the film; every random value is seeded. Heat: small figures print at 'low', only named figures at full detail,
 * everything capped in a passage; four plates (the keeper's green is yellow overprinted on blue, no fifth ink). */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,rectPath,partial,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow,footballPanels} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,runCycle,strike,keeperSet,slideTackle,celebrate,stand,posed,blendPose,solve,
 type Pose,type AthleteStyle,type InkFill,type Place,type Projector,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets (every cue starts with a plain word:
 * Kokoro splits contractions and hyphens); their `at` and each chapter's `seconds` are ESTIMATES until the Kokoro voice exists. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The goal, live',text:'Wembley, 2022. Liverpool play Manchester City. City pass the ball back to their keeper. Sadio Mané sprints straight at him. A heavy touch... Mané slides in... goal!',tail:2.4,
  cues:['Wembley','Liverpool play','City pass','back to their keeper','Sadio Mané','sprints straight','A heavy touch','Mané slides','goal']},
 {label:'Watch it again',text:'Watch again. The moment the ball goes back, Mané is already running, so the keeper has no time.',tail:1.6,
  cues:['Watch again','The moment','goes back','already running','no time']},
 {label:'Behind the goal',text:'From behind the goal: the touch runs away from the keeper, and Mané slides the ball into the net. Liverpool lead two-nil!',tail:2.4,
  cues:['From behind','the touch runs away','Mané slides','into the net','Liverpool lead']},
 {label:'Your turn',text:'Your turn: when they pass back, press straight away. Win the ball high up, and it is a short run to goal!',tail:1.8,
  cues:['Your turn','when they pass back','press straight away','Win the ball','short run']},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py mane-signature, which writes timing.json next to script.json. Then add
 *   import timingJson from '../../../public/plays/narration/mane-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/mane-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (calibrated on the voiced films, ≈ 2.6 words/s): .2 s + .02 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.2+.02*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.16;if(/[.!?]$/.test(w))t+=.3;if(/\.\.\.$/.test(w))t+=.2;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('mane: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('mane: no cue '+w);return c.at;};
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
/** The film plays inside the player card's picture window (~1566 × 1080 units): world (x,y) on the CANVAS centre at z0 units per world unit
 * (the engine's arrival scale is kept, so passages and seams behave exactly as in the stories). Full-sheet framing, never sheet.safe. */
function cam(s:Sheet,x:number,y:number,z0:number,r=0){const z=z0*Math.min(1,Math.pow(s.W/1566,.75)),k=z*s.arrival;s.camera(x-(s.W/2-s.cx)/k,y-(s.H/2-s.cy)/k,z/s.fit,r);return z;}
type View={hx:number;hy:number};
const view=(s:Sheet,z:number):View=>({hx:s.W/(2*z*.68)+60,hy:s.H/(2*z*.68)+60});
/** a narrower (square) window gets a slightly wider lens so the action still fits; set by frame(), read by every camera */
let LENS=1;
const frame=(s:Sheet)=>{LENS=Math.pow(Math.min(1,s.W/1620),.45);return view(s,cam(s,0,0,1));};

// ---------------------------------------------------------------- the TV camera: a right-handed 3D projection of the pitch
/** Pitch metres (right-handed, like athlete.ts): X along the length (Liverpool attack +X; City's goal line at 105), Y up, Z across
 * (0 = the middle, +34 = the near touchline under the main camera = Liverpool's right; −34 = the far side, under the arch). */
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

// ---------------------------------------------------------------- Wembley on a sunny April afternoon: a bowl of red seats, the arch, a full house
/** stand planes (a along, b up the rake 0..1): 0 the far side (−z, the arch above it), 1 the west end behind Liverpool's own goal (x < 0,
 * the Liverpool end), 2 the near side under the main camera (+z), 3 the east end behind City's goal (x > 105, the City end). */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-16,121,a),1.2+32*b,-42-36*b],
 (a,b)=>[-12-34*b,1.2+32*b,lerp(52,-52,a)],
 (a,b)=>[lerp(121,-16,a),1.2+32*b,42+36*b],
 (a,b)=>[117+34*b,1.2+32*b,lerp(-52,52,a)],
];
const STAND_COLS=[100,70,100,70],STAND_ROWS=13,TIERS=[.44];
/** which fans sit where (inferred): the City end and the City halves of the side stands, the Liverpool end and theirs */
const CITY_FAN=(si:number,a:number)=>si===3?true:si===1?false:si===0?a>.52:a<.48;
/** the arch: a 315 m span rising 133 m, leaning back over the far stand */
const ARCH:V3[]=Array.from({length:25},(_,i)=>{const u=i/24,y=133*(1-Math.pow(2*u-1,2));return[52.5+(u-.5)*315,y,-(92+y*Math.tan(22*Math.PI/180))];});
function stadium(s:Sheet,c:Cam,v:View,t:number,which:number[],o:{roar?:number}={}){
 const{roar=0}=o,tt=twos(t);
 // a clear spring sky: a light blue field, a deeper band high up
 s.field(B,.24,.55);
 const hz=pr(c,add3(c.C,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz)s.tone(B,polyPath([[-1e4,hz[1]-1e4],[1e4,hz[1]-1e4],[1e4,hz[1]-700],[-1e4,hz[1]-560]],true),.2);
 // the arch: a paper tube with a navy edge behind the far roof
 if(which.includes(0)){const pts:Pt[]=[];let ok=true;for(const p of ARCH){const q=toCam(c,p);if(q[2]<8){ok=false;break;}pts.push(scr(c,q));}
  if(ok){const w=clamp(c.F*7.4/toCam(c,ARCH[12])[2],3,60),tube=ribbon(pts,w,{taper:.15,wobble:.4,pressure:0});s.knockout(tube,.9);s.stroke(K,tube,Math.max(1.4,w*.12),.55);}}
 const planes=new Path2D(),tier=new Path2D(),roof=new Path2D(),edge=new Path2D();
 for(const i of which){const S=STANDS[i];addPoly(planes,polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]));for(const b of TIERS)addPoly(tier,polyP(c,[S(0,b),S(1,b),S(1,b+.04),S(0,b+.04)]));
  addPoly(roof,polyP(c,[add3(S(0,1),[0,1.5,0]),add3(S(1,1),[0,1.5,0]),add3(S(1,.8),[0,9,0]),add3(S(0,.8),[0,9,0])]));
  seg3(c,add3(S(0,.8),[0,8.8,0]),add3(S(1,.8),[0,8.8,0]),.5,edge);}
 // Wembley's red seats, the tier fronts in navy
 s.knockout(planes);s.fill(R,planes,.5);s.tone(K,planes,.14);s.tone(K,tier,.6);
 // the crowd: City fans in sky blue and white, Liverpool fans in red and white; the Liverpool fans jump at the goal
 const inks=[new Path2D(),new Path2D(),new Path2D()];let n=0;
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(TIERS.some(w=>b>w-.03&&b<w+.07))continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,6),a=(i+.5+(hash(i+j*31,8)-.5)*.6)/cols;if(h>.84)continue;
   const q=toCam(c,S(a,b));if(q[2]<NEAR+3)continue;
   const p=scr(c,q);if(!inView(v,p))continue;const city=CITY_FAN(si,a),z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0&&!city?roar*z*1.2*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const hh=hash(i*7+j*13+si,9),ink=city?(hh<.62?2:0):(hh<.68?1:0);inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);n++;}}}
 if(n){s.knockout(inks[0],.72);s.knockout(inks[1],.6);s.fill(R,inks[1],.95);s.knockout(inks[2],.6);s.fill(B,inks[2],.55);}
 s.knockout(roof);s.fill(K,roof,.85);s.knockout(edge,.8);
}
/** the dark surround, sunlit grass with mowing stripes, navy LED boards, paper lines, both goals (City's drawn later when it is in front
 * of the players, i.e. from the camera behind it) */
function ground(s:Sheet,c:Cam,o:{bulge?:number;goalLater?:boolean}={}){
 const sn=polyP(c,[[-12,0,-41],[117,0,-41],[117,0,41],[-12,0,41]]);if(sn.length<3)return;const snp=polyPath(sn,true);s.knockout(snp);s.tone(K,snp,.35);s.tone(B,snp,.3);
 const g=polyP(c,[[-4,0,-37],[109,0,-37],[109,0,37],[-4,0,37]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.9);s.tone(B,gp,.78);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[k*5.25,0,-34],[(k+1)*5.25,0,-34],[(k+1)*5.25,0,34],[k*5.25,0,34]]));s.tone(K,st,.12);
 // the LED boards: navy with yellow panels (no lettering) on the far side and behind both goals
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.9,0]),add3(a,[0,.9,0])]));
 board([-5,0,-38.5],[110,0,-38.5]);board([110,0,-37.5],[110,0,37.5]);board([-5,0,37.5],[-5,0,-37.5]);
 for(let k=0;k<18;k++){const x=-3+k*6.3;addPoly(pn,polyP(c,[[x,.25,-38.45],[x+3.4,.25,-38.45],[x+3.4,.66,-38.45],[x,.66,-38.45]]));}
 for(let k=0;k<11;k++){const z=-34+k*6.4;addPoly(pn,polyP(c,[[109.95,.25,z],[109.95,.25,z+3.4],[109.95,.66,z+3.4],[109.95,.66,z]]));}
 s.knockout(bd);s.fill(K,bd,.9);s.knockout(pn,.85);s.fill(Y,pn,.85);
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
 s.fill(K,pole,.9);s.knockout(flag);s.fill(R,flag,.95);
 goal3(s,c,0,-1,0);
 if(!o.goalLater)goal3(s,c,105,1,o.bulge??0);
}
/** a goal at X: posts at z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out low around where the ball went in (GOALPT) */
function goal3(s:Sheet,c:Cam,X:number,d:number,bulge:number){
 const z0=-3.66,z1=3.66,H=2.44,bz=GOALPT[2],back=(z:number,y:number)=>X+d*(2+bulge*.8*Math.exp(-Math.pow((z-bz)/1.6,2))*(1-.6*Math.abs(y-.3)/1.9));
 const zs=[z0,-1.8,0,1.3,2.6,z1];
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
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.3],[B,.1]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.22]],SKIN_DD:InkFill[]=[[R,.4],[Y,.45],[K,.34]];
/** Liverpool that day: all red (confirmed: shirts, shorts and socks in the photographs); paper trim and numbers */
const LFC=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,shorts:R,socks:R,boots:K,skin:SKIN_L,hair:K,line:K,trim:'paper',numberInk:'paper',hairStyle:'short',build:{height:1.8,bulk:1},...o});
/** Manchester City that day: all sky blue (confirmed), printed as a half-tint of the blue plate; navy numbers and trim */
const MCFC=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[B,.5],shorts:[B,.5],socks:[B,.5],boots:K,skin:SKIN_L,hair:K,line:K,trim:K,numberInk:K,hairStyle:'short',build:{height:1.82,bulk:1},...o});
/** Sadio Mané (playerAppearance.json: darkest skin, buzz cut, stubble; Senegal): number 10 (inferred), 1.74 m, compact and quick */
const MANE_ST=LFC({number:10,skin:SKIN_DD,hairStyle:'short',build:{height:1.74,bulk:.98,thighs:1.06},seed:10});
/** Zack Steffen: the GREEN keeper kit and 13 (confirmed by the goal photo) — printed as blue, then overprinted yellow (see drawPlayer) */
const GK_ST:AthleteStyle={shirt:[B,.9],shorts:[B,.9],socks:[B,.9],boots:K,skin:SKIN_L,hair:K,hairStyle:'short',line:K,gloves:'paper',sleeves:'long',trim:K,number:13,numberInk:K,build:{height:1.91},seed:13};

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete: fluid FK body, kit inks, halftone shade, key line).
 * prev = the pose one drawing earlier (secondary motion: hair and hem trail); smear = a halftone echo + speed lines for fast limbs;
 * green = overprint yellow on the blue kit (shirt, sleeves, shorts) so the keeper prints green with four plates. */
function drawPlayer(s:Sheet,pose:Pose,camera:Projector,style:AthleteStyle,place:Place,o:{prev?:Pose;smear?:boolean;green?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{threshold:10});
 const r=drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev}:{});
 if(o.green){const j=r.joints,wd=Math.hypot(j.lSh[0]-j.rSh[0],j.lSh[1]-j.rSh[1]),hl=Math.hypot(j.chest[0]-j.pelvis[0],j.chest[1]-j.pelvis[1]),w=Math.max(wd,hl*.7)*.34,p=new Path2D();
  const hullP=(q:Pt[])=>{const cx=q.reduce((a,b)=>a+b[0],0)/q.length,cy=q.reduce((a,b)=>a+b[1],0)/q.length;return polyPath(q.slice().sort((a,b)=>Math.atan2(a[1]-cy,a[0]-cx)-Math.atan2(b[1]-cy,b[0]-cx)),true);};
  p.addPath(ribbon([j.chest,j.pelvis],w*2.3,{taper:0,wobble:.3}));
  p.addPath(ribbon([j.lSh,j.lEl,j.lHa],w*.8,{taper:.2,wobble:.3}));p.addPath(ribbon([j.rSh,j.rEl,j.rHa],w*.8,{taper:.2,wobble:.3}));
  p.addPath(hullP([j.lHip,j.rHip,[lerp(j.rHip[0],j.rKn[0],.45),lerp(j.rHip[1],j.rKn[1],.45)],[lerp(j.lHip[0],j.lKn[0],.45),lerp(j.lHip[1],j.lKn[1],.45)]]));
  s.fill(Y,p,.95);}
 return r;
}

// ---------------------------------------------------------------- the players: keyframed tracks (τ = seconds after Stones's back pass)
type Role='mane'|'lfc'|'mc'|'gk';
type Move={kind:'strike';at:number;dur:number;side:'l'|'r';power?:number};
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];moves?:Move[];key?:boolean};
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}

/** the beats (inferred timing; the accounts give the order): Aké's pass across, Stones's back pass (τ 0), the keeper's heavy first touch,
 * the hesitation, the heavier second touch, Mané's slide (lead foot on the ball at CONTACT), the ball in the net */
const AKE_PASS=-2.9,STONES_RX=-1.6,PASS=0,TOUCH1=1.35,TOUCH2=2.05,SL0=2.2,SLD=.9,CONTACT=SL0+.42*SLD,IN_NET=CONTACT+.5,GETUP=3.45;
/** Mané's slide: from P_S along heading H (he arcs across from the right of City's back line toward the near-post side) */
const P_S:[number,number]=[97.2,1],H:[number,number]=(()=>{const l=Math.hypot(1,.8);return[1/l,.8/l];})(),SLIDE_YAW=yawOf(H[0],H[1]);
/** the slide carries the body forward along the ground (the generator's own dx), so the track takes it and the pose keeps dx 0 */
const slideP=(u:number)=>{const p=slideTackle(clamp(u),{foot:'r'});return p;};
const slidePos=(tau:number):[number,number]=>{const d=slideP((tau-SL0)/SLD).dx;return[P_S[0]+H[0]*d,P_S[1]+H[1]*d];};
const P_END=slidePos(SL0+SLD);
/** where his lead (right) toe meets the ball: solved from the athlete's own skeleton at contact */
const C_PT:[number,number]=(()=>{const p={...slideP(.42),dx:0},q=slidePos(CONTACT),sk=solve(p,MANE_ST.build,{x:q[0],z:q[1],yaw:SLIDE_YAW});return[sk.rToe[0],sk.rToe[2]];})();
/** the receiving spot (the edge of the six-yard box) and where the heavy first touch runs to */
const R1:[number,number]=[99.9,-.9],B1:[number,number]=[99.45,.6];

const ACTORS:Actor[]=[
 {name:'Mané',role:'mane',style:MANE_ST,key:true,
  keys:[[-7,82.4,2.6],[-4,83.6,1.6],[AKE_PASS,84.5,.4],[STONES_RX,85.2,-5.1],[0,85.9,-8.9],[.3,86.5,-8.4],[.8,88.6,-6.5],[1.3,91.9,-3.9],[1.8,94.9,-1.2],[SL0,P_S[0],P_S[1]],
   [SL0+SLD,P_END[0],P_END[1]],[3.9,P_END[0],P_END[1]],[4.6,P_END[0]-.6,P_END[1]+2.4],[5.6,P_END[0]-2,P_END[1]+7],[7,P_END[0]-3.6,P_END[1]+11],[8.5,P_END[0]-4.4,P_END[1]+13],[10,P_END[0]-4.6,P_END[1]+13.5]]},
 {name:'Stones',role:'mc',style:MCFC({number:5,seed:5,hair:[K,.85]}),key:true,moves:[{kind:'strike',at:PASS,dur:.8,side:'r',power:.5}],
  keys:[[-7,86.2,-15],[-4,86.8,-13.6],[STONES_RX,87.8,-11.8],[0,88.6,-10.8],[1,89.2,-10.2],[4,90.6,-7.5],[10,91.5,-6]]},
 {name:'Aké',role:'mc',style:MCFC({number:6,skin:SKIN_D,seed:6}),moves:[{kind:'strike',at:AKE_PASS,dur:.8,side:'l',power:.45}],
  keys:[[-7,85.6,6.4],[-4,86.4,5.4],[AKE_PASS,87,5],[-1,87.6,4.4],[2,90,3],[10,92,2]]},
 {name:'Steffen',role:'gk',style:GK_ST,key:true,moves:[{kind:'strike',at:TOUCH1,dur:.55,side:'r',power:.2},{kind:'strike',at:TOUCH2,dur:.55,side:'r',power:.32},{kind:'strike',at:CONTACT+.12,dur:.7,side:'r',power:.75}],
  keys:[[-7,102.6,-.3],[-2,102.1,-.5],[0,101.3,-.7],[1.2,100.35,-.55],[TOUCH1,100.3,-.5],[1.95,99.85,.25],[TOUCH2,99.8,.35],[CONTACT,99.7,1.05],[10,99.65,1.1]]},
 {name:'Salah',role:'lfc',style:LFC({number:11,skin:SKIN_M,hairStyle:'curly',build:{height:1.75,bulk:.96},seed:11}),
  keys:[[-7,84,9],[-3,85.4,8],[0,87.2,6.4],[2,91.5,5.2],[3.5,94.4,6.4],[5.6,94.5,8.6],[7,93.2,11.6],[10,93,12.4]]},
 {name:'Díaz',role:'lfc',style:LFC({number:23,skin:SKIN_M,hairStyle:'curly',seed:23}),keys:[[-7,79,22],[0,83,19],[3,88,15],[6,91,13.4],[10,91.5,13.8]]},
 {name:'Keïta',role:'lfc',style:LFC({number:8,skin:SKIN_D,seed:8}),keys:[[-7,77,-19],[0,80,-18],[3,84,-15],[10,87,-12]]},
 {name:'Thiago',role:'lfc',style:LFC({number:6,hair:[K,.8],seed:61}),keys:[[-7,72,2],[0,75,0],[3,79,1],[10,83,3]]},
 {name:'Trent',role:'lfc',style:LFC({number:66,seed:66}),keys:[[-7,70,-24],[0,73,-22],[10,78,-20]]},
 {name:'Fabinho',role:'lfc',style:LFC({number:3,skin:SKIN_M,seed:3}),keys:[[-7,64,-4],[10,70,-3]]},
 {name:'Cancelo',role:'mc',style:MCFC({number:7,seed:7,skin:SKIN_M}),keys:[[-7,82,-26],[0,83.5,-24],[3,86,-20],[10,88,-16]]},
 {name:'Zinchenko',role:'mc',style:MCFC({number:11,seed:71,hair:[Y,.5]}),keys:[[-7,81,24],[0,83,22],[3,86,19],[10,88,17]]},
 {name:'Fernandinho',role:'mc',style:MCFC({number:25,skin:SKIN_D,seed:25}),keys:[[-7,76,-3],[0,78,-4],[3,82,-3],[10,86,-2]]},
 {name:'Silva',role:'mc',style:MCFC({number:20,seed:20}),keys:[[-7,71,10],[0,73,9],[10,79,7]]},
 {name:'Foden',role:'mc',style:MCFC({number:47,seed:47}),keys:[[-7,68,-15],[0,70,-15],[10,76,-12]]},
];
const MANE=0,STONES=1,AKE=2,GK=3;
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const T0=-7,T1=10,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
/** position on the ground; Mané's slide follows the slide's own travel (so the body and the track never disagree) */
const posOf=(k:number,tau:number):[number,number]=>k===MANE&&tau>=SL0&&tau<=3.9?slidePos(tau):[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const smooth=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau),b=posOf(k,tau-.3),d=posOf(k,tau-.6);return[(a[0]+b[0]+d[0])/3,(a[1]+b[1]+d[1])/3];};

// ---------------------------------------------------------------- the ball: across the back, the back pass, two heavy touches, the slide, the net
/** where it goes in (inferred): low, inside the near post side */
const GOALPT:V3=[105.1,.3,1.9],NET:V3=[106.6,.25,2.1],REST:V3=[106.3,.11,1.9];
const S_FOOT=():[number,number]=>{const g=posOf(STONES,PASS),dx=R1[0]-g[0],dz=R1[1]-g[1],l=Math.hypot(dx,dz);return[g[0]+dx/l*.55,g[1]+dz/l*.55];};
const A_FOOT=(tau:number):[number,number]=>{const g=posOf(AKE,tau);return[g[0]-.4,g[1]-.3];};
const ST_FOOT=(tau:number):[number,number]=>{const g=posOf(STONES,tau),s=S_FOOT(),o=posOf(STONES,PASS);return[g[0]+s[0]-o[0],g[1]+s[1]-o[1]];};
function ballAt(tau:number):V3{
 if(tau<AKE_PASS){const a=A_FOOT(tau);return[a[0],.11,a[1]];}
 if(tau<STONES_RX){const u=(tau-AKE_PASS)/(STONES_RX-AKE_PASS),a=A_FOOT(AKE_PASS),b=ST_FOOT(STONES_RX),e=1-Math.pow(1-u,1.5);return[lerp(a[0],b[0],e),.11,lerp(a[1],b[1],e)];}
 if(tau<PASS){const a=ST_FOOT(tau);return[a[0],.11,a[1]];}
 if(tau<TOUCH1){const u=(tau-PASS)/(TOUCH1-PASS),a=S_FOOT(),e=1-Math.pow(1-u,1.45);return[lerp(a[0],R1[0],e),.11,lerp(a[1],R1[1],e)];}
 if(tau<TOUCH2){const u=clamp((tau-TOUCH1)/.62),e=1-Math.pow(1-u,2);return[lerp(R1[0],B1[0],e),.11,lerp(R1[1],B1[1],e)];}
 if(tau<CONTACT){const u=(tau-TOUCH2)/(CONTACT-TOUCH2),e=1-Math.pow(1-u,1.4);return[lerp(B1[0],C_PT[0],e),.11,lerp(B1[1],C_PT[1],e)];}
 if(tau<IN_NET){const u=(tau-CONTACT)/(IN_NET-CONTACT);return[lerp(C_PT[0],GOALPT[0],u),.11+(GOALPT[1]-.11)*u+.12*Math.sin(Math.PI*u),lerp(C_PT[1],GOALPT[2],u)];}
 const u=clamp((tau-IN_NET)/.2);if(u<1)return lerp3(GOALPT,NET,u);
 const w=clamp((tau-IN_NET-.2)/.5);return[lerp(NET[0],REST[0],w),lerp(NET[1],REST[1],w),lerp(NET[2],REST[2],w)];
}
const bulgeAt=(tau:number)=>tau<IN_NET?0:Math.exp(-(tau-IN_NET)*2.2)*(1+.3*Math.sin((tau-IN_NET)*14));

// ---------------------------------------------------------------- poses (angles in degrees via posed; the athlete clamps to real range of motion)
const RAD=Math.PI/180;
const LIN=new Set(['dx','dz','air','lHand','rHand','squash']);
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LIN.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
/** the keeper's hesitation: upright, arms out a little, head up looking for a pass */
const HESITATE:Partial<Pose>={lean:6,lShA:26,rShA:30,lElb:30,rElb:30,neckP:-10,lHipF:10,rHipF:14,lKnee:18,rKnee:22};
/** the keeper afterwards: down on his knees, head bowed, hands on the grass (the goal photo) */
const KNEEL=posed({lHipF:6,rHipF:4,lKnee:118,rKnee:122,lean:52,pitch:6,neckP:36,lShF:48,rShF:44,lShA:12,rShA:12,lElb:14,rElb:18,lAnk:30,rAnk:30});
/** the pressing jog: arms a touch wider, chest over the feet, head up on the ball */
const PRESS:Partial<Pose>={lShA:22,rShA:22,neckP:-2};
/** the whole pose of actor k at τ, with its yaw */
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(tau);
 let yaw=sp>.45?yawOf(v[0],v[1]):yawOf(b[0]-x,b[2]-z);
 // passers face their target as they strike; the keeper watches the ball
 if(k===STONES&&tau>-.7&&tau<.45)yaw=yawOf(R1[0]-x,R1[1]-z);
 if(k===AKE&&tau>AKE_PASS-.7&&tau<AKE_PASS+.45){const g=ST_FOOT(STONES_RX);yaw=yawOf(g[0]-x,g[1]-z);}
 if(a.role==='gk'){yaw=yawOf(b[0]-x,b[2]-z);if(tau>CONTACT+.5)yaw=yawOf(C_PT[0]-x,C_PT[1]-z);}
 let p:Pose;
 const idle=a.role==='gk'?(tau<-.3?keeperSet(tau*1.4):stand()):stand();
 const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(distOf(k,tau)/3.3,{speed:s}),clamp((sp-.4)/.9));
 for(const mv of a.moves??[]){const t0=mv.at-.52*mv.dur,u=(tau-t0)/mv.dur;
  if(u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:mv.side,power:mv.power??.7}),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));}
 if(k===GK){p=over(p,HESITATE,sm(TOUCH1+.25,TOUCH1+.45,tau)*(1-sm(TOUCH2-.35,TOUCH2-.2,tau)));
  if(tau>CONTACT+.45)p=blendPose(p,KNEEL,sm(CONTACT+.45,CONTACT+1.1,tau,easeInOutSine));}
 if(k===MANE){
  if(tau<SL0){p=over(p,PRESS,1-sm(0,.4,tau));
   // turning onto the sprint the moment the ball goes back, then square to the slide
   yaw=lerpA(yaw,SLIDE_YAW,sm(SL0-.35,SL0,tau));}
  else{const sp0=slideP((tau-SL0)/SLD);p=blendPose({...sp0,dx:0},stand(),sm(GETUP,GETUP+.55,tau,easeInOutSine));yaw=SLIDE_YAW;
   if(tau>3.9){const v2=velOf(MANE,tau);yaw=lerpA(SLIDE_YAW,yawOf(v2[0],v2[1]),sm(3.9,4.4,tau));
    p=blendPose(p,celebrate(tau*.85,{kind:'run'}),sm(3.95,4.5,tau)*(1-sm(8.2,8.7,tau)));
    if(tau>8.2)p=blendPose(p,celebrate((tau-8.2)*.9,{kind:'arms'}),sm(8.2,8.7,tau));}}
 }
 return{p,yaw};
}

// ---------------------------------------------------------------- the ball print: the white FA Cup ball, navy panels, a red shadow ink
function ball(s:Sheet,x:number,y:number,r:number,rot:number){footballPanels(s,x,y,r,{rot,key:K,shadow:R,seed:5});}

// ---------------------------------------------------------------- drawing the match through a camera
type CastE={k:number;x:number;z:number;g:Pt;h:number;d:number};
type PlayOut={list:CastE[];bg:Pt|null;br:number;hero?:DrawResult};
/** everything on the pitch at τ (positions on ones, poses on twos at τp; τprev = the drawing before, for secondary motion) */
function play(s:Sheet,c:Cam,v:View,tau:number,tauP:number,tauPrev:number,o:{minBall?:number;hero?:boolean;after?:(r:PlayOut)=>void;full?:number[]}={}):PlayOut{
 const{minBall=6,hero=false,full}=o;
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!s._passage.pending;
 const list:CastE[]=[];
 ACTORS.forEach((_,k)=>{const[x,z]=posOf(k,tau),q=toCam(c,[x,.9,z]);if(q[2]<1.2)return;const g=scr(c,toCam(c,[x,0,z])),h=c.F*1.85/q[2];if(!inView(v,g,h*1.2)&&!inView(v,[g[0],g[1]-h],h))return;list.push({k,x,z,g,h,d:q[2]});});
 const b=ballAt(tau),bq=toCam(c,b),bg=bq[2]>=NEAR?scr(c,bq):null,br=bg?Math.max(minBall,c.F*.11/bq[2]):0,bground=pr(c,[b[0],0,b[2]]);
 // sunny ground shadows (the sun high over the far stand), batched in one op; big figures cast their own through the athlete
 const sh=new Path2D();for(const e of list)if(e.h<420)sh.addPath(polyPath(blob(e.g[0]+e.h*.05,e.g[1]+e.h*.02,e.h*.16,e.h*.04,ACTORS[e.k].style.seed??1,{amp:.05,n:14}),true));
 if(bground&&bg)sh.addPath(polyPath(blob(bground[0],bground[1],br*.8,br*.25,2,{amp:.05,n:12}),true));s.tone(K,sh,.45);
 list.sort((p,q)=>q.d-p.d);
 const drawBall=()=>{if(bg)ball(s,bg[0],bg[1],br,Math.hypot(b[0],b[2])/.11);};
 let ballDone=!list.length||bq[2]>=list[0].d,heroR:DrawResult|undefined;if(ballDone)drawBall();
 for(const e of list){if(!ballDone&&bq[2]>=e.d){drawBall();ballDone=true;}
  const a=ACTORS[e.k],{p,yaw}=poseOf(e.k,tauP),px=e.h*ppu,big=e.h>=300,named=full?full.includes(e.k):a.key;
  // phone heat: low detail for small figures and extras; during a passage only the hero keeps 'mid'
  const detail=passing?(e.k===MANE?'mid':'low'):px<50||(!named&&px<120)?'low':'auto';
  const r=drawPlayer(s,p,c,{...a.style,shadow:e.h<420?false:undefined,detail},{x:e.x,z:e.z,yaw},{...(big&&(e.k===MANE||e.h>520)&&!passing?{prev:poseOf(e.k,tauPrev).p,smear:hero&&e.k===MANE}:{}),green:e.k===GK});
  if(e.k===MANE)heroR=r;}
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
/** an arrow on the grass from a to b (metres), drawn on as prog goes 0 → 1 */
function groundArrow(s:Sheet,c:Cam,a:[number,number],b:[number,number],ink:string,w:number,prog=1,seed=51,wm=.16,dashed=false){if(w<=0||prog<=.02)return;
 const pts:Pt[]=[];for(let i=0;i<=12;i++){const u=i/12*prog,q=pr(c,[lerp(a[0],b[0],u),0,lerp(a[1],b[1],u)]);if(q)pts.push(q);}if(pts.length<3)return;
 const q=toCam(c,[lerp(a[0],b[0],prog*.5),0,lerp(a[1],b[1],prog*.5)]),wd=Math.max(5,c.F*wm/q[2]);
 s.knockout(ribbon(pts,wd*1.6,{seed,taper:.1,wobble:.8}),.7*w);
 const e=pts[pts.length-1],pv=pts[Math.max(0,pts.length-3)];s.fill(ink,ribbon(pts.slice(0,-1),wd,{seed:seed+1,taper:.1,wobble:.8,gaps:dashed?[[.14,.22],[.36,.44],[.58,.66],[.8,.86]]:undefined}),.95*w);laneArrow(s,ink,pv,e,wd,{seed:seed+2,head:wd*3,cov:.95*w});}
/** Mané's path on the grass (red), from τ a0 to a1, drawn on as prog goes 0 → 1 */
function pathArrow(s:Sheet,c:Cam,w:number,prog=1,a0=0,a1=CONTACT){if(w<=0)return;
 const pts:Pt[]=[];for(let i=0;i<=30;i++){const tau=lerp(a0,a1,i/30),m=posOf(MANE,tau),q=pr(c,[m[0],0,m[1]]);if(q)pts.push(q);}if(pts.length<6)return;
 const sub=partial(pts,clamp(prog)),m=posOf(MANE,lerp(a0,a1,.5)),q=toCam(c,[m[0],0,m[1]]),wd=Math.max(5,c.F*.13/q[2]);
 s.knockout(ribbon(sub,wd*1.6,{seed:61,taper:.1,wobble:.8}),.7*w);s.fill(R,ribbon(sub,wd,{seed:62,taper:.1,wobble:.8}),.95*w);
 if(sub.length>2&&prog>.15){const e=sub[sub.length-1],pv=sub[Math.max(0,sub.length-3)];laneArrow(s,R,pv,e,wd,{seed:63,head:wd*3.2,cov:.95*w});}}
/** the back pass on the grass: a navy dashed arrow from Stones's boot to the keeper */
const passArrow=(s:Sheet,c:Cam,w:number,prog=1)=>groundArrow(s,c,S_FOOT(),R1,K,w,prog,71,.13,true);
/** "no time": a yellow band on the grass from Mané to the ball that shortens as he closes */
function gapLine(s:Sheet,c:Cam,tau:number,w:number){if(w<=0)return;const m=posOf(MANE,tau),b=ballAt(tau),dx=b[0]-m[0],dz=b[2]-m[1],l=Math.hypot(dx,dz);if(l<1.4)return;
 const pts:Pt[]=[];for(let i=0;i<=10;i++){const u=.25/l+(1-.55/l)*i/10,q=pr(c,[m[0]+dx*u,.02,m[1]+dz*u]);if(q)pts.push(q);}if(pts.length<3)return;
 const q=toCam(c,[m[0]+dx*.5,0,m[1]+dz*.5]),wd=Math.max(4,c.F*.1/q[2]);s.knockout(ribbon(pts,wd*1.6,{seed:77,taper:0,wobble:.6}),.7*w);s.fill(Y,ribbon(pts,wd,{seed:78,taper:0,wobble:.6,gaps:[[.2,.28],[.46,.54],[.72,.8]]}),.95*w);}
/** the touch that runs away: a yellow arrow along the ball's roll from the receiving spot to where Mané meets it */
const touchArrow=(s:Sheet,c:Cam,w:number,prog=1)=>{groundArrow(s,c,R1,B1,Y,w,clamp(prog*2),81,.12);groundArrow(s,c,B1,C_PT,Y,w*sm(.45,.6,prog),clamp(prog*2-1),85,.12);};
/** a yellow flash at a point in the air (the touch, the tackle) */
function flash(s:Sheet,c:Cam,P:V3,size:number,age:number,seed:number){if(age<-.2||age>.6)return;const q=pr(c,P);if(!q)return;const z=c.F/toCam(c,P)[2];
 sparkBurst(s,Y,q[0],q[1],z*size,{n:8,seed,g:easeOutBack(clamp((age+.2)/.2))*(1-clamp((age-.35)/.25)),width:Math.max(4,z*.05),cov:.95});}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, near real time
const tau1=(t:number)=>{const G=CUE(0,'goal');return key(t,mono([[0,-6.2],[CUE(0,'Liverpool play'),-5],[CUE(0,'City pass'),-1.2],[CUE(0,'back to'),-.1],[CUE(0,'Sadio'),.5],[CUE(0,'sprints'),1.1],[CUE(0,'A heavy'),TOUCH1-.05],[CUE(0,'Mané slides'),SL0+.05],[G,IN_NET+.05],[SECS(0)+1,IN_NET+.05+(SECS(0)+1-G)*.9]]),linear);};
const CAM1:V3=[76,26,66];
function cam1(t:number):Cam{
 const G=CUE(0,'goal'),S=SECS(0),tau=tau1(t);
 const bs=(u:number):V3=>{const b=ballAt(Math.min(u,CONTACT));return[b[0],0,b[2]];},b0=bs(tau),b1=bs(tau-.35),b2=bs(tau-.7),bt:V3=[(b0[0]+b1[0]+b2[0])/3,0,(b0[2]+b1[2]+b2[2])/3];
 const open:V3=[90,3,-4],m=posOf(MANE,Math.min(tau,9)),cel:V3=[m[0]-.5,1,m[1]];
 const toBall=sm(CUE(0,'Liverpool play'),CUE(0,'City pass')+.3,t,easeInOutSine),toS=sm(G+.6,G+1.8,t,easeInOutSine),toGoal=sm(CUE(0,'back to'),CUE(0,'A heavy'),t,easeInOutSine)*(1-toS);
 const tb:V3=[lerp(open[0],lerp(bt[0],99,toGoal*.55),toBall),lerp(open[1],1.5,toBall),lerp(open[2],lerp(bt[2],0,.2),toBall)],T=lerp3(tb,cel,toS);
 const F=key(t,mono([[0,2600],[CUE(0,'Liverpool play'),3200],[CUE(0,'City pass'),4800],[CUE(0,'Sadio'),5400],[CUE(0,'A heavy'),6600],[G,6800],[G+1.8,7600],[S,7800]]),easeInOutSine);
 return look(CAM1,T,F);
}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),tau=tau1(t),tp=tau1(twos(t)),G=CUE(0,'goal');
  stadium(s,c,v,t,[0,1,3],{roar:sm(G-.1,G+.5,t)});
  ground(s,c,{bulge:bulgeAt(tau)});
  play(s,c,v,tau,tp,tau1(twos(t)-1/12),{minBall:8});
 },
 aperture(t){const c=cam1(t),[x,z]=posOf(MANE,tau1(t)),q=toCam(c,[x,1,z]),g=scr(c,q),h=c.F*1.65/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.09),12);},
 still:6,
};

// ---------------------------------------------------------------- 2 · slow replay, a low touchline camera beside Mané: the pass goes back, he is already running
const tau2=(t:number)=>key(t,mono([[0,-.45],[CUE(1,'The moment'),-.15],[CUE(1,'goes back'),.1],[CUE(1,'already'),.55],[CUE(1,'no time'),1.75],[SECS(1),2.45]]),linear);
function cam2(t:number):Cam{
 const tau=tau2(t),m=smooth(MANE,Math.min(tau,SL0+.2)),open=1-sm(0,1.2,t,easeInOutSine),gk=posOf(GK,Math.min(tau,CONTACT)),w=sm(.3,1.8,tau,easeInOutSine);
 // the chase camera: low behind Mané and a little to his left, looking down his run at the keeper — the gap closes in the frame
 const dx=gk[0]-m[0],dz=gk[1]-m[1],l=Math.hypot(dx,dz)||1,ux=dx/l,uz=dz/l,lx=uz,lz=-ux,back=8+3*open;
 const C:V3=[m[0]-ux*back+lx*2.6,2.8+.6*open,m[1]-uz*back+lz*2.6],T:V3=[lerp(m[0],gk[0],.42),.6,lerp(m[1],gk[1],.42)];
 return look(C,T,1500+300*w-200*open);
}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),tau=tau2(t),tp=tau2(twos(t)),mo=CUE(1,'The moment'),gb=CUE(1,'goes back'),ar=CUE(1,'already'),nt=CUE(1,'no time'),E=SECS(1);
  stadium(s,c,v,t,[0,2,3]);
  ground(s,c);
  const fade=1-sm(E-.6,E-.3,t);
  passArrow(s,c,sm(mo-.1,mo+.3,t)*fade,sm(mo-.1,gb+.5,t));
  groundRing(s,c,...posOf(GK,Math.min(tau,TOUCH1)),.9,K,sm(gb,gb+.4,t,easeOutBack)*fade,44);
  // straight at him: a red arrow on the grass from Mané to the keeper's ball, shortening as he closes
  {const m=posOf(MANE,Math.min(tau,SL0)),g=ballAt(Math.min(tau,CONTACT)),dx=g[0]-m[0],dz=g[2]-m[1],l=Math.hypot(dx,dz)||1;if(l>2.2)groundArrow(s,c,[m[0]+dx/l*1.2,m[1]+dz/l*1.2],[g[0]-dx/l*.6,g[2]-dz/l*.6],R,sm(ar-.1,ar+.25,t)*fade,sm(ar-.1,ar+.6,t),65,.14);}
  play(s,c,v,tau,tp,tau2(twos(t)-1/12),{minBall:5,hero:true,full:[MANE,GK,STONES],after:()=>{
   gapLine(s,c,tau,sm(ar+.2,ar+.5,t)*fade);
   flash(s,c,[R1[0],.3,R1[1]],.6,tau-TOUCH1,91);}});
  streaks(s,v,1-sm(0,.5,t),21);
 },
 aperture(t){const c=cam2(t),m=posOf(MANE,tau2(t)),q=toCam(c,[m[0],1.3,m[1]]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.14/q[2]),12);},
 still:1.2,
};

// ---------------------------------------------------------------- 3 · replay from behind City's goal (the photographer's view): the touch runs away, the slide, the net
const tau3=(t:number)=>{const nt=CUE(2,'into the net');return key(t,mono([[0,1.05],[CUE(2,'the touch'),TOUCH1+.05],[CUE(2,'Mané slides'),SL0+.1],[nt,IN_NET],[CUE(2,'Liverpool lead'),IN_NET+.9],[SECS(2),IN_NET+.9+(SECS(2)-CUE(2,'Liverpool lead'))*.85]]),linear);};
const swing3=(t:number)=>sm(CUE(2,'Liverpool lead')-.3,SECS(2)-.5,t,easeInOutSine);
function cam3(t:number):Cam{
 const tau=tau3(t),u=swing3(t),C:V3=[117,10.5-1.5*u,6+2*u],e=sm(CONTACT-.3,IN_NET,tau,easeInOutSine);
 const b=ballAt(Math.min(tau,CONTACT)),T0:V3=[lerp(b[0]-.6,101.5,e),lerp(.8,1,e),lerp(b[2],1.2,e)],m=posOf(MANE,Math.min(tau,9.5)),T1:V3=[m[0]-.3,1.1,m[1]];
 return look(C,lerp3(T0,T1,u),lerp(lerp(4300,4000,e),4600,u));
}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),tau=tau3(t),tp=tau3(twos(t)),tr=CUE(2,'the touch'),ms=CUE(2,'Mané slides'),nt=CUE(2,'into the net'),ll=CUE(2,'Liverpool lead'),u=swing3(t),E=SECS(2);
  stadium(s,c,v,t,[0,1,2],{roar:sm(IN_NET,IN_NET+.3,tau)});
  ground(s,c,{goalLater:u<.5});
  touchArrow(s,c,sm(tr-.1,tr+.25,t)*(1-sm(nt,nt+.4,t)),sm(tr-.1,ms+.2,t));
  play(s,c,v,tau,tp,tau3(twos(t)-1/12),{minBall:5,hero:true,full:[MANE,GK],after:()=>{
   flash(s,c,[C_PT[0],.25,C_PT[1]],.55,tau-CONTACT,93);}});
  if(u<.5)goal3(s,c,105,1,bulgeAt(tau));
  // the goal: a yellow burst over Mané as Liverpool lead
  const pw=sm(ll-.1,ll+.4,t)*(1-sm(E-.5,E-.2,t));if(pw>0){const m=posOf(MANE,tau),q=pr(c,[m[0],2.5,m[1]]);if(q)sparkBurst(s,Y,q[0],q[1],c.F*1.3/toCam(c,[m[0],2.5,m[1]])[2],{n:10,seed:88,g:easeOutBack(pw),width:12,cov:.95});}
  streaks(s,v,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3(t),[x,z]=posOf(MANE,tau3(t)),q=toCam(c,[x,1.1,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.16/q[2]),12);},
 still:2.6,
};

// ---------------------------------------------------------------- 4 · the lesson: a raised coaching angle behind Mané's press
const tau4=(t:number)=>key(t,mono([[0,-.5],[CUE(3,'when they'),-.1],[CUE(3,'press'),.5],[CUE(3,'Win the ball'),CONTACT-.05],[CUE(3,'short run'),IN_NET-.15],[SECS(3),IN_NET+.35]]),linear);
function cam4(t:number):Cam{
 const orbit=sm(CUE(3,'Win')-.4,SECS(3),t,easeInOutSine);
 const C:V3=[lerp(84,86,orbit),lerp(8,7.4,orbit),lerp(-13,-11.5,orbit)],T:V3=[lerp(95.5,99,orbit),.3,lerp(-2,.2,orbit)];
 return look(C,T,lerp(2300,2700,orbit));
}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),tau=tau4(t),tp=tau4(twos(t)),yt=CUE(3,'Your'),wt=CUE(3,'when they'),ps=CUE(3,'press'),wb=CUE(3,'Win the ball'),sr=CUE(3,'short run'),E=SECS(3),fade=1-sm(E-.6,E-.3,t);
  stadium(s,c,v,t,[0,3]);
  ground(s,c,{bulge:bulgeAt(tau)});
  passArrow(s,c,sm(wt-.1,wt+.3,t)*fade,sm(wt-.1,wt+.8,t));
  pathArrow(s,c,sm(ps-.1,ps+.2,t)*fade,sm(ps-.1,wb,t),0,CONTACT);
  groundRing(s,c,C_PT[0],C_PT[1],1.1,Y,sm(wb-.1,wb+.35,t,easeOutBack)*fade,42);
  groundArrow(s,c,[C_PT[0]+.9,C_PT[1]-.05],[104.6,GOALPT[2]],Y,sm(sr-.1,sr+.25,t)*fade,sm(sr-.1,sr+.6,t),47,.18);
  groundRing(s,c,...posOf(GK,Math.min(tau,TOUCH1)),.9,K,sm(yt,yt+.4,t,easeOutBack)*(1-sm(wb,wb+.4,t)),43);
  play(s,c,v,tau,tp,tau4(twos(t)-1/12),{minBall:5,hero:true,full:[MANE,GK,STONES],after:()=>{flash(s,c,[C_PT[0],.25,C_PT[1]],.5,tau-CONTACT,95);}});
 },
 still:2.6,
};

const film:RisoStory={
 id:'mane-signature',format:'11v11',title:"Mané's press and finish",theme:'Press the defender straight away: winning the ball high up leaves a short run to goal',
 ageNote:'FA Cup semi-final, Manchester City 2–3 Liverpool, Wembley, 16 April 2022: the press that made it 2–0. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a kick of sunny turf — green bits thrown up, a yellow touch spark. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}spray(s,x,y,age,seed);if(age<.35)sparkBurst(s,Y,x,y-20,110,{n:7,seed:seed+1,g:easeOutBack(clamp(age/.15))*(1-clamp((age-.2)/.15)),width:15});},
};
/** turf spray: green and yellow bits thrown from a point, ballistic, 0..1 s */
function spray(s:Sheet,x:number,y:number,age:number,seed:number){
 if(age<0||age>1)return;const r=rng(seed),a=new Path2D(),b=new Path2D(),u=easeOut(clamp(age/.7)),fl=Math.sin(Math.min(1,age/.8)*Math.PI);
 for(let i=0;i<14;i++){const ang=-Math.PI/2+(r()-.5)*2.2,d=(40+r()*170)*u*2,px=x+Math.cos(ang)*d,py=y+Math.sin(ang)*d*.5-fl*(30+r()*70)*2,z=10+r()*14;(i%3?a:b).addPath(polyPath(blob(px,py,z,z*.8,i+seed,{amp:.1,n:10}),true));}
 const fade=1-clamp((age-.6)/.4);s.fill(Y,a,.9*fade);s.tone(B,a,.7*fade);s.fill(R,b,.8*fade);
}
export default film;
