/** Ismaïla Sarr's SIGNATURE film, "the sprint in behind": his second goal in Watford 3–0 Liverpool, Premier League, Vicarage Road,
 * Watford, Saturday 29 February 2020 (17:30 kick-off, played under the floodlights), 60th minute (1–0 → 2–0). An iconic-play riso film
 * (RisoStory, chapters mode) played by the card's picture window: a 1:1 reconstruction from WRITTEN match reports and one press photograph
 * (the footage itself was not reviewed), printed as a riso sheet. Kid-appropriate: nobody on Liverpool is blamed or named as beaten.
 *
 * WHY THIS MOMENT: iconicPlays.json gives Sarr a signature, not a match ("the sprint in behind", lesson "Run in behind the defence the
 * moment your teammate looks up to pass"). This goal is that lesson in one documented action: Will Hughes's backheel set up the attack,
 * Troy Deeney played the pass, and Sarr "latched on to Deeney's pass and raced clean through on goal" (Sky Sports) before lifting the ball
 * over the advancing Alisson. It was the day Liverpool's unbeaten league season ended (26 wins and a draw before it). The written sources
 * DESCRIBE this play, so it is staged inside the real match (no separate "how he does it" demonstration is needed); nothing drawn
 * contradicts the accounts and every guess is listed below. The brief's other candidates were not used: the 2025 Community Shield is the
 * Frimpong film's match, and no cached source described a Palace FA Cup goal of his in enough detail.
 *
 * SOURCES (Sept 2026, read as raw pages with curl, cached under the build scratchpad films/src-cache/):
 *  - BBC Sport, "Watford 3-0 Liverpool: Jurgen Klopp's side lose first Premier League game of the season" (29 Feb 2020)
 *    https://www.bbc.com/sport/football/51595064
 *  - The Guardian, Sachin Nakrani at Vicarage Road, "Watford's Sarr blitzes Liverpool to end dream of matching Invincibles" (29 Feb 2020)
 *    https://www.theguardian.com/football/2020/feb/29/watford-liverpool-premier-league-match-report
 *  - ESPN / Reuters, "Liverpool's unbeaten league run ends with shock loss at Watford" https://www.espn.com/soccer/report/_/gameId/541570
 *  - Sky Sports match page (search snippet only): "Sarr latched on to Deeney's pass and raced clean through on goal, before keeping his
 *    cool to dink the ball over the advancing Alisson." https://www.skysports.com/football/watford-vs-liverpool/408259
 *  - Wikipedia, "2019–20 Liverpool F.C. season" (fixture box: 29 February 2020, 17:30 GMT, Vicarage Road, 21,634, Michael Oliver; Sarr 54',
 *    60', Deeney 72').
 *  - The press photograph on the Guardian page, "Ismaïla Sarr dinks a fine finish over Alisson to double Watford's advantage" (Justin
 *    Tallis / AFP): Sarr in a YELLOW shirt with number 23, BLACK shorts, YELLOW socks, red boots, black gloves; Alisson in an all-GREEN kit,
 *    number 1, white gloves, long hair, down on the grass with one arm up as the ball rises over him; a white ball; the floodlit crowd behind.
 * CONFIRMED by those accounts: the match, date, ground, evening kick-off (Klopp: "we were not good enough tonight"); Liverpool unbeaten in the
 *  league until this game; Sarr back from a hamstring injury, playing on the right wing; 1–0 on 54 minutes (Sarr, after Doucouré's cross);
 *  on the hour Hughes "set up an attack with a neat backheel" (ESPN), Deeney played the pass ("Deeney's cute pass", Guardian; BBC credits
 *  Hughes with putting him through), Sarr "sped through on goal", "raced clean through", and "calmly lifted the ball over" / "dinked" it
 *  over "the out-rushing Alisson" into the net for 2–0 — "two goals in six second-half minutes" (ESPN); Van Dijk and Lovren were Liverpool's
 *  centre-backs; the kits and numbers in the photograph (above).
 * INFERRED (illustrative reconstruction; none of it named in the narration): Liverpool's outfield kit (drawn all red, their home kit — no
 *  colour clash with Watford's yellow and black; not in the cached pages); every shirt number except Sarr's 23 and Alisson's 1 (Deeney 9,
 *  Hughes 19, Doucouré 16, Van Dijk 4, Lovren 6, Robertson 26, Alexander-Arnold 66); which way Watford attacked; where the move started
 *  (drawn: Doucouré to Hughes just inside Liverpool's half, the backheel forward to Deeney near the centre circle) and the exact pass line
 *  (drawn: from the middle into the right channel behind Van Dijk, Robertson caught upfield); Sarr's line (drawn: from wide right, level with the
 *  defence when the pass is played — onside — then diagonally in behind), his two carrying touches and his chipping foot (drawn: the right,
 *  which the photograph appears to show); how far out he chipped (≈ 19 m); the keeper's exact spot and fall; where the ball went in
 *  (drawn: just left of centre, under the bar); every other player's position; the celebration (drawn: away toward the near touchline,
 *  arms out); where the away fans sat; Vicarage Road as drawn (four separate single-tier stands under navy roofs with the floodlights along
 *  their fronts); the camera positions and lenses.
 *
 * FRAMING (the TV broadcast, never top-down; full-sheet card window 1.45:1 down to square, never sheet.safe): 1 = the high main-stand
 * camera, near real time, from Doucouré's pass through the backheel, Deeney looking up, the sprint, the chip and the roar; 2 = slow-motion
 * replay from a low near-touchline camera, side-on to Liverpool's back line: Deeney ringed as he looks up (yellow), the last defender's line
 * (navy dashes), Sarr's run past it (red arrow), the pass into the space (yellow arrow); 3 = replay from behind Liverpool's goal (the
 * photographer's side): the keeper rushes out, the chip rises over him (yellow arc), the net; 4 = the lesson from a raised coaching angle:
 * the teammate looks up (yellow ring), run in behind straight away (red), the pass meets the run (yellow). Every body is the shared riso
 * athlete (lib/plays/riso/athlete.ts) through ONE adapter, drawPlayer(). Handedness: the world is right-handed exactly like athlete.ts (x
 * toward Liverpool's goal, y up, +z = the near touchline under the main camera = Watford's right, Sarr's wing), so strike({foot:'r'}) is
 * Sarr's RIGHT foot. Scenes read only (t, c); every action keys off cue times, so the recorded voice (withTiming) re-times the film; every
 * random value is seeded. Heat: small figures print at 'low', only named figures at full detail, everything capped in a passage; four
 * plates (the keeper's green is yellow overprinted on blue, no fifth ink). */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,partial,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow,footballPanels} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,runCycle,strike,keeperSet,celebrate,stand,posed,blendPose,keyPoses,solve,
 type Pose,type AthleteStyle,type InkFill,type Place,type Projector,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets (every cue starts with a plain word:
 * Kokoro splits contractions and hyphens); their `at` and each chapter's `seconds` are ESTIMATES until the Kokoro voice exists. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The goal, live',text:'Watford against Liverpool, 2020. Liverpool were unbeaten in the league. Will Hughes backheels it, Troy Deeney looks up... and Ismaïla Sarr is already sprinting in behind. He races clear of everyone... and lifts it over the keeper. Goal!',tail:2.2,
  cues:['Watford','Liverpool were','Will Hughes','Troy Deeney','already sprinting','in behind','He races','and lifts','Goal']},
 {label:'Watch it again',text:'Watch again. The moment Deeney looks up, Sarr runs past the last defender.',tail:2.4,
  cues:['Watch again','The moment','Deeney looks up','Sarr runs','the last defender']},
 {label:'Behind the goal',text:'From behind the goal: the keeper rushes out, so Sarr stays calm and lifts it over him. Two goals in six minutes!',tail:2.2,
  cues:['From behind','the keeper rushes','Sarr stays calm','lifts it','Two goals']},
 {label:'Your turn',text:'Your turn: when your teammate looks up to pass, run in behind the defence straight away!',tail:2.2,
  cues:['Your turn','when your teammate','looks up','run in behind','straight away']},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py ismaila-sarr-signature, which writes timing.json next to script.json. Then add
 *   import timingJson from '../../../public/plays/narration/ismaila-sarr-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/ismaila-sarr-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (calibrated on the voiced films, ≈ 2.6 words/s): .2 s + .02 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.2+.02*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.16;if(/[.!?]$/.test(w))t+=.3;if(/\.\.\.$/.test(w))t+=.2;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('sarr: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('sarr: no cue '+w);return c.at;};
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
const bump=(t:number,c:number,w:number)=>Math.max(0,1-Math.abs(t-c)/w);
/** The film plays inside the player card's picture window (~1566 × 1080 units): world (x,y) on the CANVAS centre at z0 units per world unit
 * (the engine's arrival scale is kept, so passages and seams behave exactly as in the stories). Full-sheet framing, never sheet.safe. */
function cam(s:Sheet,x:number,y:number,z0:number,r=0){const z=z0*Math.min(1,Math.pow(s.W/1566,.75)),k=z*s.arrival;s.camera(x-(s.W/2-s.cx)/k,y-(s.H/2-s.cy)/k,z/s.fit,r);return z;}
type View={hx:number;hy:number};
const view=(s:Sheet,z:number):View=>({hx:s.W/(2*z*.68)+60,hy:s.H/(2*z*.68)+60});
/** a narrower (square) window gets a slightly wider lens so the action still fits; set by frame(), read by every camera */
let LENS=1;
const frame=(s:Sheet)=>{LENS=Math.pow(Math.min(1,s.W/1620),.45);return view(s,cam(s,0,0,1));};

// ---------------------------------------------------------------- the TV camera: a right-handed 3D projection of the pitch
/** Pitch metres (right-handed, like athlete.ts): X along the length (Watford attack +X; Liverpool's goal line at 105), Y up, Z across
 * (0 = the middle, +34 = the near touchline under the main camera = Watford's right, Sarr's wing; −34 = the far side). */
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

// ---------------------------------------------------------------- Vicarage Road on a February night: four single-tier stands, floodlit roofs
/** stand planes (a along, b up the rake 0..1): 0 the far side (−z), 1 the end behind Watford's own goal (x < 0), 2 the near side under the
 * main camera (+z), 3 the end behind Liverpool's goal (x > 105). A compact ground: each stand ≈ 13 m high, separate, with open corners. */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-2,107,a),1.2+13*b,-39-24*b],
 (a,b)=>[-8-22*b,1.2+12*b,lerp(33,-33,a)],
 (a,b)=>[lerp(107,-2,a),1.2+13*b,39+24*b],
 (a,b)=>[113+22*b,1.2+12*b,lerp(-33,33,a)],
];
const STAND_COLS=[110,70,110,70],STAND_ROWS=11;
/** which fans sit where (inferred): Watford yellow nearly everywhere, the Liverpool fans in a block of the end behind Watford's goal */
const AWAY_FAN=(si:number,a:number)=>si===1&&a>.58;
function stadium(s:Sheet,c:Cam,v:View,t:number,which:number[],o:{roar?:number}={}){
 const{roar=0}=o,tt=twos(t);
 // a winter night: deep navy, a faint floodlit haze low over the roofs
 s.field(K,.86,.5);
 const hz=pr(c,add3(c.C,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz)s.tone(Y,polyPath([[-1e4,hz[1]-900],[1e4,hz[1]-900],[1e4,hz[1]+60],[-1e4,hz[1]+60]],true),.08);
 const planes=new Path2D(),roof=new Path2D(),edge=new Path2D();
 for(const i of which){const S=STANDS[i];addPoly(planes,polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]));
  addPoly(roof,polyP(c,[add3(S(0,1),[0,1.2,0]),add3(S(1,1),[0,1.2,0]),add3(S(1,.62),[0,6.2,0]),add3(S(0,.62),[0,6.2,0])]));
  seg3(c,add3(S(0,.62),[0,6,0]),add3(S(1,.62),[0,6,0]),.55,edge);}
 // the seats in shadow under the roofs
 s.knockout(planes);s.tone(K,planes,.55);s.tone(R,planes,.12);
 // the crowd: Watford fans in yellow and paper (shirts, scarves), Liverpool fans in red; the home fans jump at the goal
 const inks=[new Path2D(),new Path2D(),new Path2D()];let n=0;
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,6),a=(i+.5+(hash(i+j*31,8)-.5)*.6)/cols;if(h>.86)continue;
   const q=toCam(c,S(a,b));if(q[2]<NEAR+3)continue;
   const p=scr(c,q);if(!inView(v,p))continue;const away=AWAY_FAN(si,a),z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0&&!away?roar*z*1.2*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const hh=hash(i*7+j*13+si,9),ink=away?(hh<.66?1:0):(hh<.62?2:0);inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);n++;}}}
 if(n){s.knockout(inks[0],.7);s.knockout(inks[1],.6);s.fill(R,inks[1],.95);s.knockout(inks[2],.6);s.fill(Y,inks[2],.95);}
 s.knockout(roof);s.fill(K,roof,.92);s.fill(K,edge,.95);
 // the floodlights along the roof fronts: yellow lamp strips with soft haloes
 const lamp=new Path2D(),halo=new Path2D();
 for(const i of which){const S=STANDS[i],n2=i%2?4:7;for(let k=0;k<n2;k++){const u=(k+.5)/n2,a=add3(S(u-.025,.62),[0,5.6,0]),b2=add3(S(u+.025,.62),[0,5.6,0]),m=lerp3(a,b2,.5);if(toCam(c,m)[2]<NEAR+2)continue;seg3(c,a,b2,.9,lamp);
  const g=pr(c,m);if(g){const r=clamp(c.F*4.5/toCam(c,m)[2],8,140);halo.moveTo(g[0]+r,g[1]);halo.ellipse(g[0],g[1],r,r*.55,0,0,TAU);}}}
 s.knockout(halo,.2);s.tone(Y,halo,.4);s.knockout(lamp);s.fill(Y,lamp,.85);
}
/** the dark surround, floodlit grass with mowing stripes, navy LED boards, paper lines, both goals (Liverpool's drawn later when it is in
 * front of the players, i.e. from the camera behind it) */
function ground(s:Sheet,c:Cam,o:{bulge?:number;goalLater?:boolean}={}){
 const sn=polyP(c,[[-7,0,-38.6],[112,0,-38.6],[112,0,38.6],[-7,0,38.6]]);if(sn.length<3)return;const snp=polyPath(sn,true);s.knockout(snp);s.tone(K,snp,.45);s.tone(B,snp,.3);
 const g=polyP(c,[[-4,0,-37],[109,0,-37],[109,0,37],[-4,0,37]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.9);s.tone(B,gp,.8);s.tone(K,gp,.1);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[k*5.25,0,-34],[(k+1)*5.25,0,-34],[(k+1)*5.25,0,34],[k*5.25,0,34]]));s.tone(K,st,.13);
 // the LED boards: navy with lit yellow panels (no lettering) on the far side and behind both goals
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.9,0]),add3(a,[0,.9,0])]));
 board([-5,0,-37.5],[110,0,-37.5]);board([110,0,-36.5],[110,0,36.5]);board([-5,0,36.5],[-5,0,-36.5]);
 for(let k=0;k<18;k++){const x=-3+k*6.3;addPoly(pn,polyP(c,[[x,.25,-37.45],[x+3.4,.25,-37.45],[x+3.4,.66,-37.45],[x,.66,-37.45]]));}
 for(let k=0;k<11;k++){const z=-34+k*6.4;addPoly(pn,polyP(c,[[109.95,.25,z],[109.95,.25,z+3.4],[109.95,.66,z+3.4],[109.95,.66,z]]));}
 s.knockout(bd);s.fill(K,bd,.9);s.knockout(pn,.85);s.fill(Y,pn,.8);
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
/** a goal at X: posts at z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out around where the ball went in (GOALPT) */
function goal3(s:Sheet,c:Cam,X:number,d:number,bulge:number){
 const z0=-3.66,z1=3.66,H=2.44,bz=GOALPT[2],by=GOALPT[1],back=(z:number,y:number)=>X+d*(2+bulge*.8*Math.exp(-Math.pow((z-bz)/1.6,2))*(1-.6*Math.abs(y-by)/1.9));
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
/** Watford that day (confirmed by the photograph): yellow shirts, black shorts, yellow socks; navy numbers and trim */
const WFC=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:Y,shorts:K,socks:Y,boots:K,skin:SKIN_L,hair:K,line:K,trim:K,numberInk:K,hairStyle:'short',build:{height:1.8,bulk:1},...o});
/** Liverpool that day: all red (INFERRED: their home kit; no clash with yellow and black); paper trim and numbers */
const LFC=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,shorts:R,socks:R,boots:K,skin:SKIN_L,hair:K,line:K,trim:'paper',numberInk:'paper',hairStyle:'short',build:{height:1.82,bulk:1},...o});
/** Ismaïla Sarr (playerAppearance.json: darkest skin, short black hair, no facial hair; Senegal): 23 and red boots (the photograph),
 * 1.85 m, long-legged and slim */
const SARR_ST=WFC({number:23,skin:SKIN_DD,boots:R,hairStyle:'short',build:{height:1.85,bulk:.94,thighs:1.04},seed:23});
/** Alisson: the GREEN keeper kit and 1, white gloves, long hair (the photograph) — printed as blue, then overprinted yellow (drawPlayer) */
const GK_ST:AthleteStyle={shirt:[B,.9],shorts:[B,.9],socks:[B,.9],boots:K,skin:SKIN_M,hair:K,hairStyle:'long',line:K,gloves:'paper',sleeves:'long',trim:K,number:1,numberInk:K,build:{height:1.93,bulk:1.04},seed:1};

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

// ---------------------------------------------------------------- the players: keyframed tracks (τ = seconds after Deeney's pass)
type Role='sarr'|'wfc'|'lfc'|'gk';
type Move={kind:'strike';at:number;dur:number;side:'l'|'r';power?:number};
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];moves?:Move[];key?:boolean};
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}

/** the beats (inferred timing; the accounts give the order): Doucouré's pass in, Hughes's backheel, Deeney's control, he looks up (LOOK)
 * and Sarr goes, the pass (τ 0), Sarr's first touch (S_RX), a carrying touch (T2), the chip (CHIP), the ball in the net */
const DOUC_PASS=-3.5,H_RX=-2.6,H_BH=-2.15,D_RX=-1.3,LOOK=-.7,PASS=0,S_RX=1.9,T2=2.6,CHIP=3.45,FLY=1.35,IN_NET=CHIP+FLY,SP0=CHIP-.4,SPD=.75;
const ACTORS:Actor[]=[
 {name:'Sarr',role:'sarr',style:SARR_ST,key:true,moves:[{kind:'strike',at:S_RX,dur:.46,side:'r',power:.12},{kind:'strike',at:T2,dur:.46,side:'r',power:.15},{kind:'strike',at:CHIP,dur:.85,side:'r',power:.42}],
  keys:[[-6,55.4,21.2],[-3,57.6,18.9],[-1.3,59.1,16.9],[LOOK,59.7,16.2],[PASS,62,14.5],[1,68.4,11.5],[S_RX,74.4,9.1],[T2,79.7,7.1],[CHIP,86,4.9],[4.2,90.6,4.6],[5,93.6,5.8],[6,95.8,9.2],[7.5,97.4,15],[9,98.2,19.4],[12,98.6,21]]},
 {name:'Deeney',role:'wfc',style:WFC({number:9,skin:SKIN_M,hairStyle:'bald',build:{height:1.8,bulk:1.12},seed:9}),key:true,moves:[{kind:'strike',at:PASS,dur:.8,side:'r',power:.55}],
  keys:[[-6,55.4,2.8],[-3,54.5,1.7],[D_RX,54.2,1.2],[LOOK,54.4,1.15],[PASS,54.8,1.1],[1,56.2,1.3],[3,62,2.2],[5,69,3.4],[7,78,6.5],[9,86,11],[12,90,14]]},
 {name:'Hughes',role:'wfc',style:WFC({number:19,hair:[K,.7],build:{height:1.85,bulk:.95},seed:19}),key:true,
  keys:[[-6,47.8,5.2],[-4,49,4.2],[H_RX,49.8,3.3],[H_BH,49.9,3.2],[-1,50.6,3.6],[1,53,4],[4,60,4.4],[10,68,5]]},
 {name:'Doucouré',role:'wfc',style:WFC({number:16,skin:SKIN_DD,build:{height:1.84,bulk:1.02},seed:16}),moves:[{kind:'strike',at:DOUC_PASS,dur:.8,side:'r',power:.4}],
  keys:[[-6,40.4,-6.8],[-4.6,42.6,-5.5],[DOUC_PASS,44,-4.6],[-2,46.6,-4.1],[0,51.5,-3],[3,60,-2],[6,68,0],[10,74,2]]},
 {name:'Alisson',role:'gk',style:GK_ST,key:true,
  keys:[[-6,95.2,.4],[-2,94.2,.7],[0,93.2,1],[1.5,92.6,1.7],[2.6,91.5,2.6],[SP0,90.6,3.2],[CHIP,90.3,3.4],[12,90.3,3.4]]},
 {name:'Van Dijk',role:'lfc',style:LFC({number:4,skin:SKIN_D,build:{height:1.93,bulk:1.06},seed:4}),key:true,
  keys:[[-6,63,8.2],[-2,62.2,7.5],[PASS,61.8,7],[.6,62.7,7.8],[1.5,66.6,8.5],[2.5,73,7.8],[CHIP,79.4,6.4],[4.5,84.6,5.2],[6,87.6,4.4],[10,88.6,3.6]]},
 {name:'Lovren',role:'lfc',style:LFC({number:6,seed:6}),keys:[[-6,63.2,-4],[PASS,62.3,-4.5],[1,64,-3],[2.5,70,-1.2],[CHIP,76,0],[5,82,1],[10,84,1.2]]},
 {name:'Robertson',role:'lfc',style:LFC({number:26,hair:[K,.6],build:{height:1.78,bulk:.95},seed:26}),keys:[[-6,42,27],[PASS,46,25],[1.5,52,22],[CHIP,62,17],[6,74,13],[10,80,11]]},
 {name:'Alexander-Arnold',role:'lfc',style:LFC({number:66,seed:66}),keys:[[-6,60,-19],[PASS,61,-17],[2,66,-13],[4,74,-9],[10,78,-6]]},
 {name:'Fabinho',role:'lfc',style:LFC({number:3,skin:SKIN_M,build:{height:1.88,bulk:1},seed:3}),keys:[[-6,45.6,-1.4],[-3,47,-2.6],[PASS,50,-2],[3,56,0],[10,64,2]]},
 {name:'mid',role:'lfc',style:LFC({number:null,skin:SKIN_D,seed:51}),keys:[[-6,49.5,8.5],[-3,51,6.4],[PASS,52.8,5.8],[3,58,6],[10,65,6]]},
 {name:'fwd',role:'lfc',style:LFC({number:null,skin:SKIN_M,seed:52}),keys:[[-6,44,4.5],[PASS,47,3],[10,58,4]]},
 {name:'wfc mid',role:'wfc',style:WFC({number:null,skin:SKIN_D,seed:53}),keys:[[-6,38,2],[PASS,43,1],[10,55,2]]},
 {name:'wfc left',role:'wfc',style:WFC({number:null,seed:54}),keys:[[-6,60,-21],[PASS,63,-16],[3,72,-12],[10,82,-8]]},
];
const SARR=0,DEENEY=1,HUGHES=2,DOUC=3,GK=4,VVD=5;
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const T0=-6,T1=12,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const smooth=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau),b=posOf(k,tau-.3),d=posOf(k,tau-.6);return[(a[0]+b[0]+d[0])/3,(a[1]+b[1]+d[1])/3];};
/** a player's kicking foot on the ground at τ: .5 m ahead along his run and a touch to his right */
const footOf=(k:number,tau:number,ahead=.5,right=.12):[number,number]=>{const p=posOf(k,tau),v=velOf(k,tau),l=Math.hypot(v[0],v[1])||1,ux=v[0]/l,uz=v[1]/l;return[p[0]+ux*ahead-uz*right,p[1]+uz*ahead+ux*right];};
/** Sarr's chip: his right toe at contact, solved from the athlete's own skeleton (so the boot and the ball meet exactly) */
const CHIP_YAW=(()=>{const v=velOf(SARR,CHIP-.05);return yawOf(v[0],v[1]);})();
const C_PT:[number,number]=(()=>{const q=posOf(SARR,CHIP),sk=solve(strike(.52,{foot:'r',power:.42}),SARR_ST.build,{x:q[0],z:q[1],yaw:CHIP_YAW});return[sk.rToe[0],sk.rToe[2]];})();

// ---------------------------------------------------------------- the ball: in to Hughes, the backheel, Deeney, the through pass, two touches, the chip
/** where it goes in (inferred): just left of centre from Sarr's view, under the bar */
const GOALPT:V3=[105.1,1.45,.5],NET:V3=[106.7,1.05,.35],REST:V3=[106.4,.11,.4];
const D_FOOT=(tau:number):[number,number]=>{const g=posOf(DEENEY,tau);return[g[0]+.45,g[1]+.1];};
const H_FRONT=():[number,number]=>{const g=posOf(HUGHES,H_RX);return[g[0]-.45,g[1]];};
const H_HEEL=():[number,number]=>{const g=posOf(HUGHES,H_BH);return[g[0]+.32,g[1]+.12];};
const P_RX=footOf(SARR,S_RX),P_T2=footOf(SARR,T2);
/** the through pass's target: where Sarr's first touch meets it */
const PASS_TO=P_RX;
const eo=(u:number,p:number)=>1-Math.pow(1-clamp(u),p);
function ballAt(tau:number):V3{
 if(tau<DOUC_PASS){const g=posOf(DOUC,tau);return[g[0]+.5,.11,g[1]+.1];}
 if(tau<H_RX){const u=(tau-DOUC_PASS)/(H_RX-DOUC_PASS),g=posOf(DOUC,DOUC_PASS),a:[number,number]=[g[0]+.5,g[1]+.1],b=H_FRONT(),e=eo(u,1.5);return[lerp(a[0],b[0],e),.11,lerp(a[1],b[1],e)];}
 if(tau<H_BH){const u=(tau-H_RX)/(H_BH-H_RX),a=H_FRONT(),b=H_HEEL();return[lerp(a[0],b[0],u),.11,lerp(a[1],b[1],u)];}
 if(tau<D_RX){const u=(tau-H_BH)/(D_RX-H_BH),a=H_HEEL(),b=D_FOOT(D_RX),e=eo(u,1.6);return[lerp(a[0],b[0],e),.11,lerp(a[1],b[1],e)];}
 if(tau<PASS){const a=D_FOOT(tau);return[a[0],.11,a[1]];}
 if(tau<S_RX){const u=(tau-PASS)/(S_RX-PASS),a=D_FOOT(PASS),e=eo(u,1.55);return[lerp(a[0],PASS_TO[0],e),.11,lerp(a[1],PASS_TO[1],e)];}
 if(tau<T2){const u=(tau-S_RX)/(T2-S_RX),e=eo(u,1.8);return[lerp(P_RX[0],P_T2[0],e),.11,lerp(P_RX[1],P_T2[1],e)];}
 if(tau<CHIP){const u=(tau-T2)/(CHIP-T2),e=eo(u,1.8);return[lerp(P_T2[0],C_PT[0],e),.11,lerp(P_T2[1],C_PT[1],e)];}
 if(tau<IN_NET){const u=(tau-CHIP)/FLY;return[lerp(C_PT[0],GOALPT[0],u),.11+(GOALPT[1]-.11)*u+3.1*Math.sin(Math.PI*u)*(1-.25*u),lerp(C_PT[1],GOALPT[2],u)];}
 const u=clamp((tau-IN_NET)/.2);if(u<1)return lerp3(GOALPT,NET,u);
 const w=clamp((tau-IN_NET-.2)/.55);return[lerp(NET[0],REST[0],w),lerp(NET[1],REST[1],easeOut(w)),lerp(NET[2],REST[2],w)];
}
const bulgeAt=(tau:number)=>tau<IN_NET?0:Math.exp(-(tau-IN_NET)*2.2)*(1+.3*Math.sin((tau-IN_NET)*14));

// ---------------------------------------------------------------- poses (angles in degrees via posed; the athlete clamps to real range of motion)
const RAD=Math.PI/180;
const LIN=new Set(['dx','dz','air','lHand','rHand','squash']);
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LIN.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
/** Hughes's backheel (right heel flicks back at .5), keyed from his receiving stance */
const BACKHEEL=(u:number)=>keyPoses(clamp(u),[
 [0,posed({lHipF:16,rHipF:18,lKnee:26,rKnee:24,lean:14,pitch:4,neckP:30,lShA:22,rShA:22,lElb:40,rElb:40})],
 [.3,posed({lHipF:22,lKnee:30,rHipF:26,rKnee:70,rAnk:10,lean:18,pitch:6,neckP:40,lShA:34,rShA:26,lElb:40,rElb:40})],
 [.5,posed({lHipF:18,lKnee:30,rHipF:-34,rKnee:58,rAnk:20,lean:26,pitch:8,neckP:44,lShA:44,rShA:30,lShF:24,rShF:-10,lElb:36,rElb:44,twist:-6})],
 [.8,posed({lHipF:14,lKnee:28,rHipF:-12,rKnee:40,lean:16,pitch:4,neckP:10,neckY:30,lShA:26,rShA:24,lElb:44,rElb:44})],
 [1,stand()]]);
/** Deeney's look-up: chin up, chest open, the ball under his sole */
const LOOKUP:Partial<Pose>={neckP:-16,lean:4,pitch:1,lShA:26,rShA:24};
/** Alisson's spread: rushing out, he drops onto his left hip and knees, his right arm thrown up as the ball rises over him (the photograph) */
const SPREAD=(u:number)=>keyPoses(clamp(u),[
 [0,keeperSet(0)],
 [.3,posed({lHipF:40,rHipF:58,lHipA:20,rHipA:22,lKnee:90,rKnee:70,lean:26,pitch:6,roll:-8,lShA:50,rShA:70,lShF:40,rShF:50,lElb:40,rElb:30,neckP:-10,lHand:1,rHand:1})],
 [.6,posed({lHipF:14,rHipF:46,lHipA:24,rHipA:30,lKnee:118,rKnee:64,lean:16,pitch:4,roll:-26,bend:-10,lShA:58,rShA:150,lShF:30,rShF:24,lElb:30,rElb:12,neckP:-34,neckY:-10,lHand:1,rHand:1})],
 [1,posed({lHipF:10,rHipF:40,lHipA:22,rHipA:28,lKnee:120,rKnee:70,lean:12,pitch:2,roll:-30,bend:-12,lShA:56,rShA:156,lShF:30,rShF:22,lElb:36,rElb:14,neckP:-40,neckY:-14,lHand:1,rHand:1})]]);
/** the sprint: arms driving, chest low, head up on the pass */
const HEADUP:Partial<Pose>={neckP:-12};
/** the whole pose of actor k at τ, with its yaw */
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(tau);
 let yaw=sp>.45?yawOf(v[0],v[1]):yawOf(b[0]-x,b[2]-z);
 // passers face their target as they strike; Hughes faces back toward Doucouré until the backheel; the keeper watches the ball
 if(k===DEENEY&&tau>D_RX&&tau<PASS+.45)yaw=lerpA(yawOf(b[0]-x,b[2]-z),yawOf(PASS_TO[0]-x,PASS_TO[1]-z),sm(D_RX,LOOK,tau));
 if(k===DOUC&&tau>DOUC_PASS-.7&&tau<DOUC_PASS+.45){const g=H_FRONT();yaw=yawOf(g[0]-x,g[1]-z);}
 if(k===HUGHES&&tau<H_BH+.35)yaw=yawOf(-1,.05);
 if(a.role==='gk'){yaw=yawOf(b[0]-x,b[2]-z);if(tau>CHIP)yaw=lerpA(yawOf(C_PT[0]-x,C_PT[1]-z),yawOf(GOALPT[0]-x,GOALPT[2]-z),sm(CHIP+.1,CHIP+.9,tau));}
 let p:Pose;
 const idle=a.role==='gk'?keeperSet(tau*1.4):stand();
 const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(distOf(k,tau)/3.3,{speed:s}),clamp((sp-.4)/.9));
 for(const mv of a.moves??[]){const t0=mv.at-.52*mv.dur,u=(tau-t0)/mv.dur;
  if(u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:mv.side,power:mv.power??.7}),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));}
 if(k===HUGHES){const u=(tau-(H_BH-.35))/.7;if(u>-.2&&u<1.3)p=blendPose(p,BACKHEEL(u),Math.min(sm(-.2,0,u),1-sm(1,1.3,u)));}
 if(k===DEENEY)p=over(p,LOOKUP,sm(LOOK-.25,LOOK,tau)*(1-sm(PASS-.3,PASS-.15,tau)));
 if(k===GK&&tau>SP0-.05)p=blendPose(p,SPREAD((tau-SP0)/SPD),sm(SP0-.05,SP0+.12,tau));
 if(k===SARR){
  if(tau<CHIP-.6)p=over(p,HEADUP,sm(LOOK-.2,LOOK+.2,tau)*(1-sm(S_RX-.4,S_RX-.2,tau)));
  // the chip: leaning back a touch over the ball, then away toward the near touchline
  p=over(p,{lean:2,pitch:-4},bump(tau,CHIP,.3));
  if(tau>4.1){p=blendPose(p,celebrate(tau*.85,{kind:'run'}),sm(4.1,4.7,tau)*(1-sm(8.6,9.1,tau)));
   if(tau>8.6)p=blendPose(p,celebrate((tau-8.6)*.9,{kind:'arms'}),sm(8.6,9.1,tau));}
  if(tau>CHIP-.3&&tau<CHIP+.5)yaw=lerpA(yaw,CHIP_YAW,1-sm(CHIP+.25,CHIP+.5,tau));
 }
 return{p,yaw};
}

// ---------------------------------------------------------------- the ball print: a white ball, navy panels, a red shadow ink
function ball(s:Sheet,x:number,y:number,r:number,rot:number){footballPanels(s,x,y,r,{rot,key:K,shadow:R,seed:7});}

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
 // floodlit ground shadows (soft, under each player), batched in one op; big figures cast their own through the athlete
 const sh=new Path2D();for(const e of list)if(e.h<420)sh.addPath(polyPath(blob(e.g[0],e.g[1]+e.h*.01,e.h*.15,e.h*.035,ACTORS[e.k].style.seed??1,{amp:.05,n:14}),true));
 if(bground&&bg)sh.addPath(polyPath(blob(bground[0],bground[1],br*.8,br*.25,2,{amp:.05,n:12}),true));s.tone(K,sh,.45);
 list.sort((p,q)=>q.d-p.d);
 const drawBall=()=>{if(bg)ball(s,bg[0],bg[1],br,Math.hypot(b[0],b[2])/.11);};
 let ballDone=!list.length||bq[2]>=list[0].d,heroR:DrawResult|undefined;if(ballDone)drawBall();
 for(const e of list){if(!ballDone&&bq[2]>=e.d){drawBall();ballDone=true;}
  const a=ACTORS[e.k],{p,yaw}=poseOf(e.k,tauP),px=e.h*ppu,big=e.h>=300,named=full?full.includes(e.k):a.key;
  // phone heat: low detail for small figures and extras; during a passage only the hero keeps 'mid'
  const detail=passing?(e.k===SARR?'mid':'low'):px<50||(!named&&px<120)?'low':'auto';
  const r=drawPlayer(s,p,c,{...a.style,shadow:e.h<420?false:undefined,detail},{x:e.x,z:e.z,yaw},{...(big&&(e.k===SARR||e.h>520)&&!passing?{prev:poseOf(e.k,tauPrev).p,smear:hero&&e.k===SARR}:{}),green:e.k===GK});
  if(e.k===SARR)heroR=r;}
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
/** Sarr's run on the grass (red), from τ a0 to a1, drawn on as prog goes 0 → 1 */
function runArrow(s:Sheet,c:Cam,w:number,prog=1,a0=LOOK,a1=S_RX){if(w<=0)return;
 const pts:Pt[]=[];for(let i=0;i<=30;i++){const tau=lerp(a0,a1,i/30),m=posOf(SARR,tau),q=pr(c,[m[0],0,m[1]]);if(q)pts.push(q);}if(pts.length<6)return;
 const sub=partial(pts,clamp(prog)),m=posOf(SARR,lerp(a0,a1,.5)),q=toCam(c,[m[0],0,m[1]]),wd=Math.max(5,c.F*.14/q[2]);
 s.knockout(ribbon(sub,wd*1.6,{seed:61,taper:.1,wobble:.8}),.7*w);s.fill(R,ribbon(sub,wd,{seed:62,taper:.1,wobble:.8}),.95*w);
 if(sub.length>2&&prog>.15){const e=sub[sub.length-1],pv=sub[Math.max(0,sub.length-3)];laneArrow(s,R,pv,e,wd,{seed:63,head:wd*3.2,cov:.95*w});}}
/** the through pass on the grass: a yellow arrow from Deeney's boot into the space where Sarr meets it */
const passArrow=(s:Sheet,c:Cam,w:number,prog=1)=>groundArrow(s,c,D_FOOT(PASS),PASS_TO,Y,w,prog,71,.13);
/** the last defender's line: navy dashes across the pitch through Liverpool's back line at the moment of the pass (Sarr level = onside) */
const LINE_X=posOf(VVD,PASS)[0]+.1;
function defLine(s:Sheet,c:Cam,w:number,prog=1,zMax=26){if(w<=0||prog<=.02)return;const z0=-26,z1=lerp(z0,zMax,prog),p=new Path2D();
 const n=Math.round((zMax-z0)/3);for(let i=0;i<n;i++){const a=lerp(z0,z1,i/n),b=lerp(z0,z1,(i+.5)/n);seg3(c,[LINE_X,0,a],[LINE_X,0,b],.16,p,1.4);}s.knockout(p,.8*w);s.fill(K,p,.95*w);}
/** a yellow flash at a point in the air (the touch, the chip) */
function flash(s:Sheet,c:Cam,P:V3,size:number,age:number,seed:number){if(age<-.2||age>.6)return;const q=pr(c,P);if(!q)return;const z=c.F/toCam(c,P)[2];
 sparkBurst(s,Y,q[0],q[1],z*size,{n:8,seed,g:easeOutBack(clamp((age+.2)/.2))*(1-clamp((age-.35)/.25)),width:Math.max(4,z*.05),cov:.95});}
/** "he looks up": a small yellow spark burst above a player's head */
function lookSpark(s:Sheet,c:Cam,k:number,tau:number,w:number,seed:number){if(w<=.02)return;const[x,z]=posOf(k,tau),P:V3=[x,2.35,z],q=pr(c,P);if(!q)return;const zz=c.F/toCam(c,P)[2];
 sparkBurst(s,Y,q[0],q[1],zz*.55,{n:7,seed,g:easeOutBack(clamp(w)),width:Math.max(4,zz*.05),cov:.95*clamp(w)});}
/** the chip's flight traced in the air (yellow), drawn on as the ball flies */
function chipArc(s:Sheet,c:Cam,tau:number,w:number){if(w<=0)return;const u1=clamp((tau-CHIP)/FLY);if(u1<.03)return;const pts:Pt[]=[];
 for(let i=0;i<=24;i++){const q=pr(c,ballAt(CHIP+FLY*u1*i/24));if(q)pts.push(q);}if(pts.length<4)return;
 const m=toCam(c,ballAt(CHIP+FLY*u1*.5)),wd=Math.max(4,c.F*.07/m[2]);s.knockout(ribbon(pts,wd*1.7,{seed:83,taper:.3,wobble:.4}),.6*w);s.fill(Y,ribbon(pts,wd,{seed:84,taper:.3,wobble:.4,gaps:[[.2,.26],[.42,.48],[.64,.7]]}),.95*w);}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, near real time
const tau1=(t:number)=>{const G=CUE(0,'Goal');return key(t,mono([[0,-5.6],[CUE(0,'Liverpool were'),-4.6],[CUE(0,'Will Hughes'),H_BH-.3],[CUE(0,'Troy Deeney'),D_RX+.1],[CUE(0,'already'),LOOK+.35],[CUE(0,'in behind'),PASS+.5],[CUE(0,'He races'),S_RX],[CUE(0,'and lifts'),CHIP-.05],[G,IN_NET+.05],[SECS(0)+1,IN_NET+.05+(SECS(0)+1-G)*.9]]),linear);};
const CAM1:V3=[62,24,66];
function cam1(t:number):Cam{
 const G=CUE(0,'Goal'),S=SECS(0),tau=tau1(t);
 const bs=(u:number):V3=>{const b=ballAt(Math.min(u,CHIP));return[b[0],0,b[2]];},b0=bs(tau),b1=bs(tau-.4),b2=bs(tau-.8),bt:V3=[(b0[0]+b1[0]+b2[0])/3,0,(b0[2]+b1[2]+b2[2])/3];
 const open:V3=[58,2,-2],m=posOf(SARR,Math.min(tau,10)),cel:V3=[m[0]-1,1,m[1]];
 // follow the ball, leading toward Sarr's run once the pass is on; after the goal settle on Sarr
 const toBall=sm(CUE(0,'Liverpool were'),CUE(0,'Will Hughes')+.3,t,easeInOutSine),toS=sm(G+.6,G+1.8,t,easeInOutSine),lead=sm(CUE(0,'already'),CUE(0,'in behind'),t,easeInOutSine)*(1-toS);
 const sr=posOf(SARR,Math.min(tau,CHIP));
 const tb:V3=[lerp(open[0],lerp(lerp(bt[0],lerp(sr[0],96,sm(S_RX,CHIP,tau)),lead*.5),100,sm(CHIP,IN_NET,tau)*(1-toS)),toBall),lerp(open[1],1.3,toBall),lerp(open[2],lerp(bt[2],sr[1],lead*.5),toBall)],T=lerp3(tb,cel,toS);
 const F=key(t,mono([[0,3800],[CUE(0,'Liverpool were'),4400],[CUE(0,'Will Hughes'),6400],[CUE(0,'already'),5600],[CUE(0,'He races'),6000],[CUE(0,'and lifts'),6800],[G,7000],[G+1.8,8200],[S,8400]]),easeInOutSine);
 return look(CAM1,T,F);
}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),tau=tau1(t),tp=tau1(twos(t)),G=CUE(0,'Goal');
  stadium(s,c,v,t,[0,1,3],{roar:sm(G-.1,G+.5,t)});
  ground(s,c,{bulge:bulgeAt(tau)});
  play(s,c,v,tau,tp,tau1(twos(t)-1/12),{minBall:8});
 },
 aperture(t){const c=cam1(t),[x,z]=posOf(SARR,tau1(t)),q=toCam(c,[x,1,z]),g=scr(c,q),h=c.F*1.65/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.09),12);},
 still:6,
};

// ---------------------------------------------------------------- 2 · slow replay, a low near-touchline camera side-on to Liverpool's back line
const tau2=(t:number)=>key(t,mono([[0,-1.5],[CUE(1,'The moment'),-1.15],[CUE(1,'Deeney looks'),LOOK-.1],[CUE(1,'Sarr runs'),PASS-.05],[CUE(1,'the last'),.55],[SECS(1),S_RX+.15]]),linear);
function cam2(t:number):Cam{
 const tau=tau2(t),m=smooth(SARR,Math.min(tau,S_RX+.3)),open=1-sm(0,1.2,t,easeInOutSine),w=sm(-.5,S_RX,tau,easeInOutSine);
 // the touchline camera trucks along with Sarr: low, just outside the pitch, looking across at the back line and Deeney behind it
 const C:V3=[lerp(53.5,m[0]-7,w),2.8+.8*open,m[1]+16],T:V3=[lerp(58,m[0]+5,w),.7,lerp(7,m[1]-5,w)];
 return look(C,T,lerp(2000,2400,w)-200*open);
}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),tau=tau2(t),tp=tau2(twos(t)),mo=CUE(1,'The moment'),dl=CUE(1,'Deeney looks'),sr=CUE(1,'Sarr runs'),ld=CUE(1,'the last'),E=SECS(1);
  stadium(s,c,v,t,[0,1,3]);
  ground(s,c);
  const fade=1-sm(E-.6,E-.3,t);
  // Deeney ringed as he looks up; the last defender's line; Sarr's run past it; the pass into the space
  groundRing(s,c,...posOf(DEENEY,Math.min(tau,PASS)),1,Y,sm(mo-.05,mo+.35,t,easeOutBack)*fade,44);
  defLine(s,c,sm(ld-.15,ld+.2,t)*fade,sm(ld-.15,ld+.5,t),20);
  runArrow(s,c,sm(sr-.1,sr+.2,t)*fade,Math.min(sm(sr-.1,sr+.5,t),clamp((tau-LOOK)/(S_RX-LOOK)+.3)),LOOK,S_RX);
  passArrow(s,c,sm(sr+.1,sr+.4,t)*fade,sm(sr+.1,E-.7,t));
  play(s,c,v,tau,tp,tau2(twos(t)-1/12),{minBall:5,hero:true,full:[SARR,DEENEY,VVD],after:()=>{
   lookSpark(s,c,DEENEY,Math.min(tau,PASS),sm(dl-.1,dl+.25,t)*(1-sm(dl+1,dl+1.4,t)),47);}});
  streaks(s,v,1-sm(0,.5,t),21);
 },
 aperture(t){const c=cam2(t),m=posOf(SARR,tau2(t)),q=toCam(c,[m[0],1.3,m[1]]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.14/q[2]),12);},
 still:1.2,
};

// ---------------------------------------------------------------- 3 · replay from behind Liverpool's goal (the photographer's side): the rush, the chip, the net
const tau3=(t:number)=>{const tb=CUE(2,'Two goals');return key(t,mono([[0,T2-.2],[CUE(2,'the keeper'),T2+.25],[CUE(2,'Sarr stays'),CHIP-.3],[CUE(2,'lifts it'),CHIP+.05],[tb,IN_NET+.25],[SECS(2),IN_NET+.25+(SECS(2)-tb)*.85]]),linear);};
const swing3=(t:number)=>sm(CUE(2,'Two goals')-.3,SECS(2)-.5,t,easeInOutSine);
function cam3(t:number):Cam{
 const tau=tau3(t),u=swing3(t),C:V3=[117.5,7.2+1.2*u,-5.5+3*u],e=sm(CHIP-.2,IN_NET,tau,easeInOutSine);
 const b=ballAt(Math.min(tau,CHIP)),T0:V3=[lerp(b[0]+1.5,97,e),lerp(1,1.6,e),lerp(b[2]-.6,1.6,e)],m=posOf(SARR,Math.min(tau,11)),T1:V3=[m[0]-.3,1.1,m[1]];
 return look(C,lerp3(T0,T1,u),lerp(lerp(5400,4300,e),5600,u));
}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),tau=tau3(t),tp=tau3(twos(t)),kr=CUE(2,'the keeper'),li=CUE(2,'lifts it'),tg=CUE(2,'Two goals'),u=swing3(t),E=SECS(2);
  stadium(s,c,v,t,[0,1,2],{roar:sm(IN_NET,IN_NET+.3,tau)});
  ground(s,c,{goalLater:u<.5});
  // the keeper's rush: a navy arrow on the grass from his line out toward Sarr
  groundArrow(s,c,posOf(GK,T2-.4),posOf(GK,CHIP),K,sm(kr-.1,kr+.25,t)*(1-sm(li+.6,li+1,t)),sm(kr-.1,kr+.8,t),74,.12,true);
  play(s,c,v,tau,tp,tau3(twos(t)-1/12),{minBall:5,hero:true,full:[SARR,GK,VVD],after:()=>{
   chipArc(s,c,tau,sm(li-.1,li+.2,t)*(1-sm(E-.6,E-.3,t)));
   flash(s,c,[C_PT[0],.25,C_PT[1]],.55,tau-CHIP,93);}});
  if(u<.5)goal3(s,c,105,1,bulgeAt(tau));
  // the goal: a yellow burst over Sarr — two goals in six minutes
  const pw=sm(tg-.1,tg+.4,t)*(1-sm(E-.5,E-.2,t));if(pw>0){const m=posOf(SARR,tau),q=pr(c,[m[0],2.5,m[1]]);if(q)sparkBurst(s,Y,q[0],q[1],c.F*1.3/toCam(c,[m[0],2.5,m[1]])[2],{n:10,seed:88,g:easeOutBack(pw),width:12,cov:.95});}
  streaks(s,v,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3(t),[x,z]=posOf(SARR,tau3(t)),q=toCam(c,[x,1.1,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.16/q[2]),12);},
 still:2.6,
};

// ---------------------------------------------------------------- 4 · the lesson: a raised coaching angle behind the play
const tau4=(t:number)=>key(t,mono([[0,-1.6],[CUE(3,'when your'),LOOK-.3],[CUE(3,'looks up'),LOOK],[CUE(3,'run in'),PASS+.1],[CUE(3,'straight away'),S_RX-.4],[SECS(3),S_RX+.5]]),linear);
function cam4(t:number):Cam{
 const orbit=sm(CUE(3,'run in')-.4,SECS(3),t,easeInOutSine);
 const C:V3=[lerp(37,40,orbit),lerp(12,11,orbit),lerp(-8,-6,orbit)],T:V3=[lerp(60,66,orbit),.3,lerp(7,7.5,orbit)];
 return look(C,T,lerp(3100,3000,orbit));
}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),tau=tau4(t),tp=tau4(twos(t)),wt=CUE(3,'when your'),lu=CUE(3,'looks up'),ri=CUE(3,'run in'),sa=CUE(3,'straight away'),E=SECS(3),fade=1-sm(E-.6,E-.3,t);
  stadium(s,c,v,t,[0,3]);
  ground(s,c);
  groundRing(s,c,...posOf(DEENEY,Math.min(tau,PASS)),1,Y,sm(wt-.1,wt+.3,t,easeOutBack)*fade,42);
  defLine(s,c,sm(ri-.2,ri+.2,t)*fade,sm(ri-.2,ri+.4,t));
  runArrow(s,c,sm(ri-.1,ri+.2,t)*fade,sm(ri-.1,sa+.2,t),LOOK,S_RX);
  passArrow(s,c,sm(sa-.1,sa+.25,t)*fade,sm(sa-.1,sa+.6,t));
  groundRing(s,c,PASS_TO[0],PASS_TO[1],1.1,Y,sm(sa+.3,sa+.6,t,easeOutBack)*fade,43);
  play(s,c,v,tau,tp,tau4(twos(t)-1/12),{minBall:5,hero:true,full:[SARR,DEENEY],after:()=>{
   lookSpark(s,c,DEENEY,Math.min(tau,PASS),sm(lu-.1,lu+.25,t)*(1-sm(lu+1.2,lu+1.6,t)),49);}});
 },
 still:2.6,
};

const film:RisoStory={
 id:'ismaila-sarr-signature',format:'11v11',title:"Sarr's sprint in behind",theme:'Run in behind the defence the moment your teammate looks up to pass',
 ageNote:'Premier League, Watford 3–0 Liverpool, Vicarage Road, 29 February 2020: the run in behind that made it 2–0. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a kick of floodlit turf — green bits thrown up, a yellow touch spark. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}spray(s,x,y,age,seed);if(age<.35)sparkBurst(s,Y,x,y-20,110,{n:7,seed:seed+1,g:easeOutBack(clamp(age/.15))*(1-clamp((age-.2)/.15)),width:15});},
};
/** turf spray: green and yellow bits thrown from a point, ballistic, 0..1 s */
function spray(s:Sheet,x:number,y:number,age:number,seed:number){
 if(age<0||age>1)return;const r=rng(seed),a=new Path2D(),b=new Path2D(),u=easeOut(clamp(age/.7)),fl=Math.sin(Math.min(1,age/.8)*Math.PI);
 for(let i=0;i<14;i++){const ang=-Math.PI/2+(r()-.5)*2.2,d=(40+r()*170)*u*2,px=x+Math.cos(ang)*d,py=y+Math.sin(ang)*d*.5-fl*(30+r()*70)*2,z=10+r()*14;(i%3?a:b).addPath(polyPath(blob(px,py,z,z*.8,i+seed,{amp:.1,n:10}),true));}
 const fade=1-clamp((age-.6)/.4);s.fill(Y,a,.9*fade);s.tone(B,a,.7*fade);s.fill(R,b,.8*fade);
}
export default film;
