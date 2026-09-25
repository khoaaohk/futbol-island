/** Luis Díaz's signature — the direct dribble at defenders. The moment: Liverpool v Crystal Palace, Premier League, Anfield, Liverpool,
 * Monday 15 August 2022, kick-off 20:00 (Liverpool 1–1 Crystal Palace): the 61st-minute equaliser. An iconic-play riso film (RisoStory,
 * chapters mode): a 1:1 reconstruction from WRITTEN accounts (the footage itself was not reviewed), printed as a riso sheet. Kid-appropriate:
 * why Liverpool had ten men (a red card four minutes earlier) is not narrated beyond "only ten players".
 *
 * WHY THIS MOMENT: iconicPlays.json gives Díaz a signature, not a match ("the direct dribble at defenders", params side left, beaten ≥ 2;
 * lesson "Run straight at defenders to make them back off, then burst past"). Wikipedia's "Luis Díaz" says he "is known for his pace,
 * dribbling, and pressing ability", and this goal is the best-documented example of that trait: The Guardian's match report describes him
 * receiving the ball WIDE ON THE LEFT and weaving past FIVE defenders along the edge of the penalty area before scoring with his right foot.
 *
 * SOURCES (Sept 2026, read as raw pages with curl, cached under the build scratchpad films/src-cache/):
 *  - The Guardian, Andy Hunter at Anfield, "Darwin Núñez sees red before Luis Díaz gives Liverpool draw with Crystal Palace" (15 Aug 2022)
 *    https://www.theguardian.com/football/2022/aug/15/liverpool-crystal-palace-premier-league-match-report
 *  - Wikipedia (raw wikitext): "2022–23 Liverpool F.C. season" (match box: 15 August 2022, 20:00 BST, Liverpool 1–1 Crystal Palace, Zaha 32',
 *    Díaz 61', Núñez sent off 57', Tsimikas and Ward booked late) and "Luis Díaz (footballer, born 1997)" (winger; pace and dribbling; wore
 *    23 at Liverpool until changing to 7 for 2023–24).
 * CONFIRMED by those accounts: Anfield, Monday 15 August 2022, 20:00 kick-off; Zaha scored for Palace on 32 minutes; Núñez was sent off on
 * 57 minutes, so Liverpool had ten men; four minutes later (61') Díaz equalised; "Receiving the ball wide on the left, Díaz weaved his way
 * past five white shirts along the edge of the penalty area before unleashing a right-footed shot that flew beyond Guaita in the Palace
 * goal"; so Palace wore WHITE shirts that night; Vicente Guaita was Palace's keeper; Klopp celebrated in front of the Main Stand; referee
 * Paul Tierney; Tsimikas (Liverpool) and Ward (Palace) were on the pitch late on; the game ended 1–1; Díaz wore 23 that season.
 * INFERRED (illustrative reconstruction): Liverpool's 2022/23 home kit (all red, paper trim — the home side at Anfield); Palace's shorts and
 * socks (drawn white with blue trim) and Guaita's keeper kit (drawn yellow) — never named in the narration beyond the confirmed white
 * shirts; the direction of play (Liverpool drawn attacking the Kop end in the second half, left to right on the Main Stand camera); who
 * passed to him (drawn: the left-back, Tsimikas, who is only confirmed on the pitch) and from where; the exact line of the run, the number
 * and timing of his touches (right foot, with left-foot cuts), where each of the five Palace players stood, backed off and lunged (none of
 * them is named: the accounts do not say who they were); the shot's flight (drawn curling into the far top corner, ≈ 19 m, ≈ .8 s) and
 * Guaita's dive; the celebration run; every other player's position; the twilight sky (sunset ≈ 20:45, so floodlights on at 21:05); the
 * crowd colours, Anfield's stands, the TV camera positions and lenses.
 *
 * FRAMING (the TV broadcast, never top-down; full-sheet card window 1.45:1 down to square, never sheet.safe): 1 = the high Main Stand
 * camera, near real time, from the pass wide on the left to the goal and the roar; 2 = slow-motion replay from a low touchline camera beside Díaz: he
 * runs STRAIGHT at the first defender (red arrow), the defender backs off (navy retreat arrow), then he changes speed and bursts past
 * (speed lines); 3 = replay from behind Palace's goal: the weave along the edge of the box, one ring per beaten white shirt (five), the
 * right-foot shot past Guaita's dive, then the swing to the celebration; 4 = the lesson from a raised coaching angle on the second defender
 * (straight arrow, back-off arrow, burst arrow). Every body is the shared riso athlete (lib/plays/riso/athlete.ts) through ONE adapter,
 * drawPlayer(). Handedness: the world is right-handed exactly like athlete.ts (x toward Palace's goal, y up, +z = Liverpool's right = the
 * near touchline under the Main Stand camera; Liverpool's LEFT wing is the far side, −z), so strike({foot:'r'}) is Díaz's RIGHT foot.
 * Scenes read only (t, c); every action keys off cue times, so the recorded voice (withTiming) re-times the film; every random value is
 * seeded. Heat: small figures print at 'low', only named figures at full detail, everything capped in a passage. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,rectPath,partial,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow,footballPanels} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,runCycle,dribble,backpedal,lunge,strike,keeperSet,keeperDive,celebrate,stand,posed,blendPose,touchPhase,
 type Pose,type AthleteStyle,type InkFill,type Place,type Projector,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets (every cue starts with a plain word:
 * Kokoro splits contractions and hyphens); their `at` and each chapter's `seconds` are ESTIMATES until the Kokoro voice exists. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The goal, live',text:'Anfield, 2022. Liverpool are losing to Crystal Palace, with ten players. Luis Díaz gets the ball on the left, and runs straight at the defenders... past one... past two... still going... right foot... goal!',tail:2.4,
  cues:['Anfield','Liverpool are losing','with ten players','Luis Díaz','gets the ball','runs straight','past one','past two','still going','right foot','goal']},
 {label:'Watch it again',text:'Watch again, slowly. Díaz runs straight at each defender, so they back off. Then he changes speed and bursts past.',tail:1.6,
  cues:['Watch again','runs straight','each defender','back off','changes speed','bursts past']},
 {label:'Past five',text:'He weaves past five Palace players along the edge of the box, and fires it past keeper Vicente Guaita!',tail:2.4,
  cues:['He weaves','five Palace players','edge of the box','fires it','keeper Vicente Guaita']},
 {label:'Your turn',text:'Your turn: run straight at defenders to make them back off, then burst past them!',tail:1.8,
  cues:['Your turn','run straight','back off','burst past']},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py luis-diaz-signature, which writes timing.json next to script.json. Then add
 *   import timingJson from '../../../public/plays/narration/luis-diaz-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/luis-diaz-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (calibrated on the voiced films, ≈ 2.6 words/s): .2 s + .02 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.2+.02*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.16;if(/[.!?]$/.test(w))t+=.3;if(/\.\.\.$/.test(w))t+=.2;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('diaz: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('diaz: no cue '+w);return c.at;};
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
/** Pitch metres (right-handed, like athlete.ts): X along the length (Liverpool attack +X; Palace's goal line at 105, the Kop end), Y up,
 * Z across (0 = the middle, +34 = the near touchline under the Main Stand camera = Liverpool's right; −34 = the far side, their left). */
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

// ---------------------------------------------------------------- Anfield on an August night, just after sunset
/** stand planes (a along, b up the rake 0..1): 0 the far side (−z, two tiers), 1 the Anfield Road end behind Liverpool's own goal (x < 0,
 * the away fans in its far corner), 2 the Main Stand (+z, the camera side, three tiers), 3 the Kop behind Palace's goal (x > 105: one great
 * single tier). Corners open. */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-9,114,a),1.4+23*b,-41-30*b],
 (a,b)=>[-9-25*b,1.4+18*b,lerp(40,-40,a)],
 (a,b)=>[lerp(114,-9,a),1.4+33*b,41+37*b],
 (a,b)=>[114+36*b,1.4+31*b,lerp(-38,38,a)],
];
const STAND_COLS=[100,64,100,76],STAND_ROWS=[12,10,14,15],TIERS=[[.5],[],[.36,.7],[]];
/** flags and banners along the stand fronts: [stand, a, b, 0 = red flag | 1 = red-and-paper halves | 2 = a long red banner] */
const FLAGS:[number,number,number,number][]=[[3,.1,.3,0],[3,.24,.55,1],[3,.38,.2,0],[3,.5,.62,2],[3,.64,.35,0],[3,.78,.5,1],[3,.9,.25,0],[0,.3,.1,2],[0,.12,.55,0],[0,.5,.2,1],[0,.72,.4,0],[1,.6,.3,0],[1,.8,.5,1]];
function stadium(s:Sheet,c:Cam,v:View,t:number,which:number[],o:{roar?:number}={}){
 const{roar=0}=o,tt=twos(t);
 // a deep blue twilight sky, a last warm band low on the horizon
 s.tone(B,rectPath(-1e4,-1e4,2e4,2e4),.5);s.tone(K,rectPath(-1e4,-1e4,2e4,2e4),.34);
 const hz=pr(c,add3(c.C,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz){const band=polyPath([[-1e4,hz[1]+60],[1e4,hz[1]+60],[1e4,hz[1]-300],[-1e4,hz[1]-300]],true);s.knockout(band,.3);s.tone(Y,band,.35);s.tone(R,band,.18);}
 const planes=new Path2D(),tier=new Path2D(),roof=new Path2D(),edge=new Path2D();
 for(const i of which){const S=STANDS[i];addPoly(planes,polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]));for(const b of TIERS[i])seg3(c,S(0,b),S(1,b),1.2,tier);
  addPoly(roof,polyP(c,[add3(S(0,1),[0,1.5,0]),add3(S(1,1),[0,1.5,0]),add3(S(1,.7),[0,12,0]),add3(S(0,.7),[0,12,0])]));
  seg3(c,add3(S(0,.7),[0,11.8,0]),add3(S(1,.7),[0,11.8,0]),.5,edge);}
 // red seats under the crowd, paper tier fascias
 s.knockout(planes);s.tone(R,planes,.62);s.tone(K,planes,.34);s.knockout(tier,.75);
 // the crowd: Liverpool red, summer-shirt white, navy; a few yellow stewards; Palace's red-and-blue in the Anfield Road corner; the roar lifts them
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si],rows=STAND_ROWS[si];for(let j=0;j<rows;j++){const b=(j+.5)/rows;if(TIERS[si].some(w=>Math.abs(b-w)<.04))continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,13);if(h<.22)continue;const a=(i+.5+(hash(i+j*31,9)-.5)*.6)/cols,q=toCam(c,S(a,b));if(q[2]<NEAR+3)continue;
   const p=scr(c,q);if(!inView(v,p))continue;const z=clamp(c.F*.6/q[2],2.4,16),away=si===1&&a>.74,lift=roar>0&&!away?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const ink=away?(h<.55?3:1):h<.46?1:h<.7?0:h<.94?2:4;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.75);s.fill(R,inks[1],.95);s.fill(K,inks[2],.85);s.fill(B,inks[3],.95);s.fill(Y,inks[4],.95);
 s.knockout(roof);s.fill(K,roof,.92);s.knockout(edge,.8);
 const fl=new Path2D(),half=new Path2D();
 for(const[si,a,b0,kind] of FLAGS){if(!which.includes(si))continue;const S=STANDS[si],w=kind===2?.1:.028,hb=kind===2?.04:.07,P=(u:number,b:number)=>S(a+u*w,b);
  const q=polyP(c,[P(0,b0),P(1,b0),P(1,b0+hb),P(0,b0+hb)]);if(q.length<3)continue;fl.addPath(polyPath(q,true));
  if(kind===1)addPoly(half,polyP(c,[P(.5,b0),P(1,b0),P(1,b0+hb),P(.5,b0+hb)]));}
 s.knockout(fl);s.fill(R,fl,.95);s.knockout(half,.9);
 // the floodlights blazing along the roof lips (it is dusk): paper bars with a yellow glow
 const lamp=new Path2D(),glow=new Path2D();for(const i of which){const S=STANDS[i];for(let k=0;k<7;k++){const u=(k+.5)/7,a=add3(S(u-.03,.7),[0,11,0]),b=add3(S(u+.03,.7),[0,11,0]);if(toCam(c,a)[2]<NEAR+2)continue;seg3(c,a,b,1.1,lamp);seg3(c,a,b,4,glow);}}
 s.tone(Y,glow,.45);s.knockout(lamp);s.fill(Y,lamp,.35);
}
/** the dark surround, floodlit grass with mowing stripes, red boards, paper lines, both goals (Palace's drawn later when it is in front of
 * the players, i.e. from the camera behind it) */
function ground(s:Sheet,c:Cam,o:{bulge?:number;ballZ?:number;ballY?:number;goalLater?:boolean}={}){
 const sn=polyP(c,[[-12,0,-40],[117,0,-40],[117,0,40],[-12,0,40]]);if(sn.length<3)return;const snp=polyPath(sn,true);s.knockout(snp);s.tone(B,snp,.4);s.tone(K,snp,.3);
 const g=polyP(c,[[-3,0,-36.5],[108,0,-36.5],[108,0,36.5],[-3,0,36.5]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.92);s.tone(B,gp,.84);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[k*5.25,0,-34],[(k+1)*5.25,0,-34],[(k+1)*5.25,0,34],[k*5.25,0,34]]));s.tone(K,st,.12);
 // LED boards: red with paper panels (no lettering) on the far side and behind both goals
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([-4,0,-38],[109,0,-38]);board([109,0,-37],[109,0,37]);board([-4,0,37],[-4,0,-37]);
 for(let k=0;k<18;k++){const x=-2+k*6.2;addPoly(pn,polyP(c,[[x,.25,-37.95],[x+3.4,.25,-37.95],[x+3.4,.68,-37.95],[x,.68,-37.95]]));}
 for(let k=0;k<11;k++){const z=-34+k*6.4;addPoly(pn,polyP(c,[[108.95,.25,z],[108.95,.25,z+3.4],[108.95,.68,z+3.4],[108.95,.68,z]]));}
 s.knockout(bd);s.fill(R,bd,.85);s.fill(K,bd,.2);s.knockout(pn,.85);
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
 goal3(s,c,0,-1,0,0,1);
 if(!o.goalLater)goal3(s,c,105,1,o.bulge??0,o.ballZ??3,o.ballY??1.9);
}
/** a goal at X: posts at z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out around (bz, by) */
function goal3(s:Sheet,c:Cam,X:number,d:number,bulge:number,bz:number,by:number){
 const z0=-3.66,z1=3.66,H=2.44,back=(z:number,y:number)=>X+d*(2+bulge*.8*Math.exp(-Math.pow((z-bz)/1.6,2))*(1-.6*Math.abs(y-by)/1.9));
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
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.3],[B,.1]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.22]];
/** Liverpool 2022/23 home (inferred for the day, the home side at Anfield): all red; paper trim and numbers */
const LFC=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,shorts:R,socks:R,boots:K,skin:SKIN_L,hair:K,line:K,trim:'paper',numberInk:'paper',hairStyle:'short',build:{height:1.8,bulk:1},...o});
/** Crystal Palace that night: WHITE shirts (confirmed, "five white shirts"); white shorts and socks, blue trim (inferred) */
const CPFC=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:'paper',boots:K,skin:SKIN_L,hair:K,line:K,trim:B,numberInk:B,hairStyle:'short',build:{height:1.82,bulk:1},...o});
/** Luis Díaz, number 23 in 2022/23 (confirmed), right-footed shot (confirmed); his dark curly hair; slim and quick */
const DIAZ_ST=LFC({number:23,skin:SKIN_M,hairStyle:'curly',build:{height:1.78,bulk:.94,thighs:1.04},seed:23});
/** Vicente Guaita: keeper kit inferred (yellow) */
const GK_ST:AthleteStyle={shirt:[Y,.95],shorts:[Y,.95],socks:[Y,.95],boots:K,skin:SKIN_L,hair:K,hairStyle:'short',line:K,gloves:'paper',sleeves:'long',trim:K,number:13,numberInk:K,build:{height:1.9},seed:13};
const REF:AthleteStyle={shirt:[K,.88],shorts:[K,.9],socks:[K,.9],boots:K,skin:SKIN_L,hair:[K,.9],hairStyle:'balding',line:K,seed:12};

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete: fluid FK body, kit inks, halftone shade, key line).
 * prev = the pose one drawing earlier (secondary motion: hair and hem trail); smear = a halftone echo + speed lines for fast limbs. */
function drawPlayer(s:Sheet,pose:Pose,camera:Projector,style:AthleteStyle,place:Place,o:{prev?:Pose;smear?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{threshold:10});
 return drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev}:{});
}

// ---------------------------------------------------------------- the players: keyframed tracks (τ = seconds after Díaz's first touch)
type Role='diaz'|'lfc'|'cp'|'gk'|'ref';
/** a keyed move: lunge (full reach at `at`), a keeper dive (full stretch at `at`), a strike (contact at `at`) */
type Move={kind:'lunge'|'dive'|'strike';at:number;dur:number;side:'l'|'r';power?:number};
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];moves?:Move[];engage?:[number,number];key?:boolean};
/** Díaz's run (inferred line): received wide on the left, then diagonally inside and along the edge of the box toward the D */
const DIAZ_KEYS=[[-3.4,77.4,-31.4],[-2,78.4,-30.2],[-1,79.5,-28.8],[0,80.2,-27.6],[.5,81.3,-26.1],[1,82.6,-24.3],[1.5,83.8,-22.2],[2,84.8,-19.9],[2.5,85.7,-17.3],[2.9,86.3,-15.1],
 [3.3,86.8,-12.8],[3.65,87,-10.8],[3.95,87.2,-8.9],[4.25,87.2,-7.1],[4.5,87.1,-5.7],[4.75,87,-4.5],[4.95,87,-3.7],[5.3,87.5,-3],[6,89.2,-4.6],[7,92,-9.6],[8.2,94.8,-15.4],[9.5,96.6,-19.2],[11,97.2,-20.6]];
/** the five beats: the moment he goes past each white shirt (inferred timing) */
const BEATS=[1.5,2.5,3.3,3.95,4.5];
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** Díaz's direction of run at τ, and his left (the goal side) */
const runDir=(tau:number):[Pt,Pt]=>{const a=herm(DIAZ_KEYS,tau-.15),b=herm(DIAZ_KEYS,tau+.15),dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1;return[[dx/l,dz/l],[dz/l,-dx/l]];};
/** a defender who faces up to him: waits in the line, backs off as he runs straight at him (the gap still closes), lunges at the beat,
 * is left behind, turns and chases. Built from Díaz's own line so the spacing is always right. */
function defenderKeys(b:number,start:[number,number],side:number):number[][]{
 const p=herm(DIAZ_KEYS,b),[d,l]=runDir(b),P:[number,number]=[p[0]+l[0]*1.4*side+d[0]*.3,p[1]+l[1]*1.4*side+d[1]*.3];
 const at=(u:number,f:number,g=0)=>[u,P[0]+d[0]*f+l[0]*g,P[1]+d[1]*f+l[1]*g];
 return[[-3.4,start[0],start[1]],[Math.max(-3.2,b-2.4),lerp(start[0],P[0]+d[0]*3.6,.6),lerp(start[1],P[1]+d[1]*3.6,.6)],at(b-1.2,2.6,.1*side),at(b-.5,1,.05*side),at(b,0),at(b+.45,-.15,-.05*side),at(b+1.3,.9,.4*side),at(b+2.8,3.6,1.2*side),at(11,5.2,1.8*side)];
}
const ACTORS:Actor[]=[
 {name:'Díaz',role:'diaz',style:DIAZ_ST,key:true,keys:DIAZ_KEYS},
 {name:'Tsimikas',role:'lfc',style:LFC({number:21,hair:[K,.8],seed:21}),key:true,moves:[{kind:'strike',at:-1.3,dur:.8,side:'l',power:.45}],keys:[[-3.4,69,-29.8],[-2,70.4,-29.4],[-1.3,71,-29.2],[0,72.4,-28.4],[3,76,-24],[11,82,-18]]},
 {name:'Salah',role:'lfc',style:LFC({number:11,skin:SKIN_M,hairStyle:'curly',build:{height:1.75,bulk:.96},seed:11}),keys:[[-3.4,93.5,20],[0,95,17],[3,97.5,11],[5,98.5,7],[11,97,2]]},
 {name:'lfc-a',role:'lfc',style:LFC({skin:SKIN_D,seed:31}),keys:[[-3.4,90,6],[0,92,4],[3,95.6,1.5],[5,97,1],[11,96,-3]]},
 {name:'lfc-b',role:'lfc',style:LFC({seed:32,hair:[Y,.5]}),keys:[[-3.4,84,-6],[0,86,-5],[3,88.5,2],[11,90,4]]},
 {name:'lfc-c',role:'lfc',style:LFC({skin:SKIN_M,seed:33}),keys:[[-3.4,74,-12],[0,76,-12],[3,79,-9],[11,82,-8]]},
 {name:'lfc-d',role:'lfc',style:LFC({seed:34}),keys:[[-3.4,66,2],[11,72,2]]},
 {name:'lfc-e',role:'lfc',style:LFC({seed:35,skin:SKIN_D}),keys:[[-3.4,62,18],[11,68,14]]},
 {name:'lfc-f',role:'lfc',style:LFC({seed:36}),keys:[[-3.4,52,-8],[11,58,-6]]},
 {name:'cp-1',role:'cp',style:CPFC({seed:41}),key:true,engage:[-.6,1.9],moves:[{kind:'lunge',at:BEATS[0],dur:.7,side:'l'}],keys:defenderKeys(BEATS[0],[86,-25],1)},
 {name:'cp-2',role:'cp',style:CPFC({seed:42,skin:SKIN_D}),key:true,engage:[.6,2.9],moves:[{kind:'lunge',at:BEATS[1],dur:.7,side:'l'}],keys:defenderKeys(BEATS[1],[89.5,-19],1)},
 {name:'cp-3',role:'cp',style:CPFC({seed:43,hairStyle:'curly',skin:SKIN_M}),key:true,engage:[1.6,3.7],moves:[{kind:'lunge',at:BEATS[2],dur:.65,side:'l'}],keys:defenderKeys(BEATS[2],[91,-13],1)},
 {name:'cp-4',role:'cp',style:CPFC({seed:44,build:{height:1.9,bulk:1.05}}),key:true,engage:[2.4,4.3],moves:[{kind:'lunge',at:BEATS[3],dur:.6,side:'l'}],keys:defenderKeys(BEATS[3],[93,-8],1)},
 {name:'cp-5',role:'cp',style:CPFC({seed:45,skin:SKIN_D,build:{height:1.85,bulk:1.05}}),key:true,engage:[3,4.9],moves:[{kind:'lunge',at:BEATS[4],dur:.6,side:'r'}],keys:defenderKeys(BEATS[4],[92,-2],1)},
 {name:'cp-cb',role:'cp',style:CPFC({seed:46,hair:[Y,.5],build:{height:1.9}}),engage:[3,5.2],keys:[[-3.4,97,1],[0,96.4,0],[3,96,-1.5],[5,96.3,-1],[11,97,-2]]},
 {name:'cp-rb',role:'cp',style:CPFC({seed:47,skin:SKIN_D}),keys:[[-3.4,97,10],[0,96.5,9],[3,96.2,7],[5,97,6],[11,97.5,4]]},
 {name:'cp-m1',role:'cp',style:CPFC({seed:48}),keys:[[-3.4,80,-14],[0,82,-15],[3,84.5,-12],[11,88,-10]]},
 {name:'cp-m2',role:'cp',style:CPFC({seed:49,skin:SKIN_D}),keys:[[-3.4,78,2],[0,80,0],[3,83,-3],[11,86,-4]]},
 {name:'cp-f',role:'cp',style:CPFC({seed:50,skin:SKIN_D}),keys:[[-3.4,66,-4],[11,70,-4]]},
 {name:'Guaita',role:'gk',style:GK_ST,key:true,moves:[{kind:'dive',at:5.55,dur:.95,side:'l'}],keys:[[-3.4,103.4,-3.2],[0,103.2,-3],[3,103,-2],[4.6,103.2,-.9],[4.95,103.3,-.6],[11,103.3,-.6]]},
 {name:'referee',role:'ref',style:REF,keys:[[-3.4,74,-6],[0,76,-8],[4,80,-8],[11,84,-8]]},
];
const DIAZ=0,TSI=1,CP1=9,CP2=10,CP5=13,GK=19,DEF=[9,10,11,12,13];
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const T0=-3.4,T1=11,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const smooth=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau),b=posOf(k,tau-.3),d=posOf(k,tau-.6);return[(a[0]+b[0]+d[0])/3,(a[1]+b[1]+d[1])/3];};

// ---------------------------------------------------------------- the ball: the pass wide, right-foot touches, a cut at each beat, the shot
const PASS=-1.3,SHOT=4.95,IN_NET=SHOT+.8,CYC=2.7;
/** where the shot goes (inferred): the far top corner, inside the post on his right */
const GOALPT:V3=[105,1.95,2.9],NET:V3=[106.5,1.6,3.1],REST:V3=[106.2,.11,2.6];
/** Díaz's heading: toward the pass to receive, then along his run; square to the shot at the end; free after */
const SHOT_YAW=(()=>{const p=herm(DIAZ_KEYS,SHOT),dx=GOALPT[0]-p[0],dz=GOALPT[2]-p[1];return yawOf(dx,dz)+.12;})();
function yawDiaz(tau:number):number{
 const v=velOf(DIAZ,tau),head=Math.hypot(v[0],v[1])>.4?yawOf(v[0],v[1]):SHOT_YAW;
 if(tau<.3){const g=posOf(TSI,PASS),m=posOf(DIAZ,tau),face=yawOf(g[0]-m[0],g[1]-m[1]);return lerpA(lerpA(face,head,.35),head,sm(-.3,.3,tau,easeInOutSine));}
 const w=sm(SHOT-.55,SHOT-.15,tau)*(1-sm(SHOT+.5,SHOT+1.1,tau));return lerpA(head,SHOT_YAW,w);
}
/** his forward and right directions on the ground (x, z) */
const fwdR=(y:number):[Pt,Pt]=>[[Math.cos(y),-Math.sin(y)],[Math.sin(y),Math.cos(y)]];
/** ball spot for a touch: ahead and a touch to the side of the touching foot */
function footAt(tau:number,side=1):[number,number]{const p=posOf(DIAZ,tau),[f,r]=fwdR(yawDiaz(tau));return[p[0]+f[0]*.55+r[0]*.12*side,p[1]+f[1]*.55+r[1]*.12*side];}
/** the touches: one per dribble stride (right foot), plus a sharp cut away from each lunge (inferred count) */
const TOUCHES:number[]=(()=>{const forced=BEATS.map(b=>b-.12),out:number[]=[0];let prev=distOf(DIAZ,0)/CYC-touchPhase;
 for(let tau=DT;tau<SHOT-.3;tau+=DT){const ph=distOf(DIAZ,tau)/CYC-touchPhase;if(Math.floor(ph)>Math.floor(prev)&&tau-out[out.length-1]>.28&&forced.every(f=>Math.abs(f-tau)>.25))out.push(tau);prev=ph;}
 return[...out,...forced].sort((a,b)=>a-b).concat([SHOT]);})();
/** each cut knocks the ball a little further on, past the lunging leg (the ball is where the defender is not) */
const TP=TOUCHES.map(T=>{const f=footAt(T,1);if(BEATS.some(b=>Math.abs(b-.12-T)<1e-6)){const[d]=runDir(T);return[f[0]+d[0]*.35,f[1]+d[1]*.35] as [number,number];}return f;});
const S0=TP[TP.length-1];
/** the shot: a right-footer's inside-foot curl: starts out to his RIGHT of the target (wide of the far post) and bends back in; rises
 * to head height and dips under the bar */
const CURL:[Pt,Pt,Pt]=(()=>{const dx=GOALPT[0]-S0[0],dz=GOALPT[2]-S0[1],l=Math.hypot(dx,dz),rx=-dz/l,rz=dx/l,k=.16*l;return[[S0[0],S0[1]],[(S0[0]+GOALPT[0])/2+rx*k,(S0[1]+GOALPT[2])/2+rz*k],[GOALPT[0],GOALPT[2]]];})();
function curlAt(u:number):V3{const a=(1-u)*(1-u),b=2*u*(1-u),c=u*u;return[a*CURL[0][0]+b*CURL[1][0]+c*CURL[2][0],.12+(GOALPT[1]-.12)*Math.pow(u,1.2)+.7*Math.sin(Math.PI*u)*(1-.3*u),a*CURL[0][1]+b*CURL[1][1]+c*CURL[2][1]];}
/** Tsimikas's pass: from his left boot, rolled along the touchline to Díaz */
const GP=():[number,number]=>{const g=posOf(TSI,PASS);return[g[0]+.5,g[1]+.3];};
function ballAt(tau:number):V3{
 if(tau<PASS){const g=posOf(TSI,tau);return[g[0]+.5,.11,g[1]+.25];}
 if(tau<0){const u=(tau-PASS)/-PASS,a=GP(),b=TP[0],e=1-Math.pow(1-u,1.4);return[lerp(a[0],b[0],e),.11,lerp(a[1],b[1],e)];}
 if(tau<SHOT){let k=0;while(k+1<TOUCHES.length&&tau>=TOUCHES[k+1])k++;const u=(tau-TOUCHES[k])/(TOUCHES[k+1]-TOUCHES[k]),e=1-Math.pow(1-u,2.2);return[lerp(TP[k][0],TP[k+1][0],e),.11,lerp(TP[k][1],TP[k+1][1],e)];}
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
/** receiving the pass: knees soft, arms out, eyes on the ball */
const RECEIVE:Partial<Pose>={lean:10,lHipF:24,lKnee:34,rHipF:20,rKnee:30,lShA:40,rShA:46,lElb:40,rElb:36,neckP:22};
/** the burst past: body dipped away from the lunge, low and driving, arms out for balance */
const BURST:Partial<Pose>={roll:9,bend:10,lean:26,lKnee:58,rKnee:50,lShA:70,rShA:30,lShF:20,rShF:-10,lElb:38,rElb:50,neckP:10,squash:-.05};
/** the whole pose of actor k at τ, with its yaw */
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),m=posOf(DIAZ,tau),b=ballAt(tau);
 let yaw=sp>.45?yawOf(v[0],v[1]):yawOf(b[0]-x,b[2]-z);
 if(a.engage&&tau>a.engage[0]-.4&&tau<a.engage[1]+.4)yaw=lerpA(yaw,yawOf(m[0]-x,m[1]-z),Math.min(sm(a.engage[0]-.4,a.engage[0],tau),1-sm(a.engage[1],a.engage[1]+.4,tau)));
 // the keeper tracks the ball, then is set square to the shot (his LEFT = +z = the far post)
 if(a.role==='gk')yaw=lerpA(yawOf(b[0]-x,b[2]-z),yawOf(S0[0]-x,S0[1]-z),sm(SHOT-.4,SHOT,tau));
 if(k===DIAZ)yaw=yawDiaz(tau);
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 let p:Pose;
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='cp'?READY:stand();
 if(k===DIAZ&&tau>-.2&&tau<SHOT){// quick dribbling strides (right foot), more run in them at full speed
  const s=clamp((sp-2)/4.5),dr=dribble(distOf(DIAZ,tau)/CYC,{foot:'r',speed:.5+.4*s});p=blendPose(stand(),dr,clamp((sp-.3)/.8));}
 else if(sp>.5&&along<-.35*sp&&k!==DIAZ)p=blendPose(idle,backpedal(distOf(k,tau)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(distOf(k,tau)/3.3,{speed:s}),clamp((sp-.4)/.9));}
 for(const mv of a.moves??[]){const lead=mv.kind==='dive'?.55:mv.kind==='strike'?.52:.6,t0=mv.at-lead*mv.dur,u=(tau-t0)/mv.dur;
  if(mv.kind==='lunge'&&u>0&&u<1.5)p=blendPose(p,lunge(Math.min(1,u),{side:mv.side}),Math.min(sm(0,.12,u),1-sm(1,1.5,u)));
  if(mv.kind==='dive'&&u>0)p=keeperDive(Math.min(1,u),{side:mv.side,height:.8});
  if(mv.kind==='strike'&&u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:mv.side,power:mv.power??.7}),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));}
 if(k===DIAZ){
  p=over(p,RECEIVE,sm(-2,-1,tau)*(1-sm(-.25,.1,tau)));
  for(const bt of BEATS)p=over(p,BURST,bump(bt-.3,bt+.3,tau));
  const D=.8,st=SHOT-.52*D,u=(tau-st)/D;
  if(u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.75}),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));
  if(tau>IN_NET+.3)p=blendPose(p,celebrate(tau*.85,{kind:'run'}),sm(IN_NET+.3,IN_NET+.8,tau)*(1-sm(9.3,9.8,tau)));
  if(tau>9.3)p=blendPose(p,celebrate((tau-9.3)*.9,{kind:'arms'}),sm(9.3,9.8,tau));
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
 ACTORS.forEach((_,k)=>{const[x,z]=posOf(k,tau),q=toCam(c,[x,.9,z]);if(q[2]<1.2)return;const g=scr(c,toCam(c,[x,0,z])),h=c.F*1.85/q[2];if(!inView(v,g,h*1.2)&&!inView(v,[g[0],g[1]-h],h))return;list.push({k,x,z,g,h,d:q[2]});});
 const b=ballAt(tau),bq=toCam(c,b),bg=bq[2]>=NEAR?scr(c,bq):null,br=bg?Math.max(minBall,c.F*.11/bq[2]):0,bground=pr(c,[b[0],0,b[2]]);
 // floodlit ground shadows, batched in one op; big figures cast their own through the athlete
 const sh=new Path2D();for(const e of list)if(e.h<420)sh.addPath(polyPath(blob(e.g[0],e.g[1],e.h*.14,e.h*.035,ACTORS[e.k].style.seed??1,{amp:.05,n:14}),true));
 if(bground&&bg)sh.addPath(polyPath(blob(bground[0],bground[1],br*.8,br*.25,2,{amp:.05,n:12}),true));s.tone(K,sh,.42);
 list.sort((p,q)=>q.d-p.d);
 const drawBall=()=>{if(bg)ball(s,bg[0],bg[1],br,Math.hypot(b[0],b[2])/.11);};
 let ballDone=!list.length||bq[2]>=list[0].d,heroR:DrawResult|undefined;if(ballDone)drawBall();
 for(const e of list){if(!ballDone&&bq[2]>=e.d){drawBall();ballDone=true;}
  const a=ACTORS[e.k],{p,yaw}=poseOf(e.k,tauP),px=e.h*ppu,big=e.h>=300,named=full?full.includes(e.k):a.key;
  // phone heat: low detail for small figures and extras; during a passage only the hero keeps 'mid'
  const detail=passing?(e.k===DIAZ?'mid':'low'):px<50||(!named&&px<120)?'low':'auto';
  const r=drawPlayer(s,p,c,{...a.style,shadow:e.h<420?false:undefined,detail},{x:e.x,z:e.z,yaw},big&&(e.k===DIAZ||e.h>520)&&!passing?{prev:poseOf(e.k,tauPrev).p,smear:hero&&e.k===DIAZ}:{});
  if(e.k===DIAZ)heroR=r;}
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
function groundArrow(s:Sheet,c:Cam,a:[number,number],b:[number,number],ink:string,w:number,prog=1,seed=51,wm=.16){if(w<=0||prog<=.02)return;
 const pts:Pt[]=[];for(let i=0;i<=12;i++){const u=i/12*prog,q=pr(c,[lerp(a[0],b[0],u),0,lerp(a[1],b[1],u)]);if(q)pts.push(q);}if(pts.length<3)return;
 const q=toCam(c,[lerp(a[0],b[0],prog*.5),0,lerp(a[1],b[1],prog*.5)]),wd=Math.max(5,c.F*wm/q[2]);
 s.knockout(ribbon(pts,wd*1.6,{seed,taper:.1,wobble:.8}),.7*w);
 const e=pts[pts.length-1],pv=pts[Math.max(0,pts.length-3)];s.fill(ink,ribbon(pts.slice(0,-1),wd,{seed:seed+1,taper:.1,wobble:.8}),.95*w);laneArrow(s,ink,pv,e,wd,{seed:seed+2,head:wd*3,cov:.95*w});}
/** his path on the grass (red), from τ a0 to a1, drawn on as prog goes 0 → 1 */
function pathArrow(s:Sheet,c:Cam,w:number,prog=1,a0=0,a1=SHOT-.05){if(w<=0)return;
 const pts:Pt[]=[];for(let i=0;i<=30;i++){const tau=lerp(a0,a1,i/30),m=posOf(DIAZ,tau),q=pr(c,[m[0],0,m[1]]);if(q)pts.push(q);}if(pts.length<6)return;
 const sub=partial(pts,clamp(prog)),m=posOf(DIAZ,lerp(a0,a1,.5)),q=toCam(c,[m[0],0,m[1]]),wd=Math.max(5,c.F*.13/q[2]);
 s.knockout(ribbon(sub,wd*1.6,{seed:61,taper:.1,wobble:.8}),.7*w);s.fill(R,ribbon(sub,wd,{seed:62,taper:.1,wobble:.8,gaps:[[.18,.24],[.42,.48],[.66,.72]]}),.95*w);
 if(sub.length>2&&prog>.15){const e=sub[sub.length-1],pv=sub[Math.max(0,sub.length-3)];laneArrow(s,R,pv,e,wd,{seed:63,head:wd*3.2,cov:.95*w});}}
/** "straight at him": a red arrow on the grass from Díaz to defender k (both at τ) */
function straightAt(s:Sheet,c:Cam,tau:number,k:number,w:number,prog=1){const m=posOf(DIAZ,tau),d=posOf(k,tau),dx=d[0]-m[0],dz=d[1]-m[1],l=Math.hypot(dx,dz)||1;
 groundArrow(s,c,[m[0]+dx/l*.7,m[1]+dz/l*.7],[d[0]-dx/l*.8,d[1]-dz/l*.8],R,w,prog,71);}
/** "back off": navy chevrons stepping back behind defender k, along his retreat */
function backOff(s:Sheet,c:Cam,tau:number,k:number,w:number){if(w<=0)return;const d=posOf(k,tau),m=posOf(DIAZ,tau),dx=d[0]-m[0],dz=d[1]-m[1],l=Math.hypot(dx,dz)||1,ux=dx/l,uz=dz/l;
 groundArrow(s,c,[d[0]+ux*.7,d[1]+uz*.7],[d[0]+ux*2.9,d[1]+uz*2.9],K,w,clamp(w*1.4),81,.14);}
/** "bursts past": speed lines streaming off his back and a yellow flash where the lunge meets only air */
function burst(s:Sheet,c:Cam,tau:number,k:number,w:number,age:number){if(w<=0)return;const m=posOf(DIAZ,tau),v=velOf(DIAZ,tau),sp=Math.hypot(v[0],v[1])||1,q=pr(c,[m[0],1,m[1]]),q2=pr(c,[m[0]-v[0]/sp,1,m[1]-v[1]/sp]);
 if(q&&q2){const z=c.F/toCam(c,[m[0],1,m[1]])[2],dx=q2[0]-q[0],dy=q2[1]-q[1],L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L,p=new Path2D();
  for(let i=0;i<3;i++){const off=(i-1)*z*.42,sx=q[0]+ux*z*.5-uy*off,sy=q[1]+uy*z*.5+ux*off-z*.1;p.addPath(ribbon([[sx,sy],[sx+ux*z*(1.4+.4*(i%2)),sy+uy*z*(1.4+.4*(i%2))]],z*.07,{seed:90+i,taper:.9,wobble:.5}));}
  s.fill(K,p,.7*w);}
 if(age>-.2&&age<.6){const d=posOf(k,tau),g=pr(c,[d[0],.3,d[1]]);if(g)sparkBurst(s,Y,g[0],g[1],c.F*.55/toCam(c,[d[0],.3,d[1]])[2],{n:8,seed:83+k,g:easeOutBack(clamp((age+.2)/.2))*(1-clamp((age-.35)/.25)),width:Math.max(4,c.F*.05/toCam(c,[d[0],.3,d[1]])[2]),cov:.95});}}
/** the curl: a yellow dashed trail through the air along the ball's path, from the boot to where it is now (or all of it) */
function curlTrail(s:Sheet,c:Cam,tau:number,w:number,full=false){if(w<=0)return;const end=full?1:clamp((tau-SHOT)/(IN_NET-SHOT));if(end<=.02)return;
 const pts:Pt[]=[];for(let i=0;i<=28;i++){const q=pr(c,curlAt(end*i/28));if(q)pts.push(q);}if(pts.length<4)return;const q=toCam(c,curlAt(end*.5)),wd=Math.max(4,c.F*.09/q[2]);
 s.knockout(ribbon(pts,wd*1.5,{seed:71,taper:.4,wobble:.6}),.6*w);s.fill(Y,ribbon(pts,wd,{seed:72,taper:.4,wobble:.6,gaps:[[.12,.18],[.3,.36],[.48,.54],[.66,.72],[.84,.9]]}),.95*w);}

// ---------------------------------------------------------------- 1 · live: the high Main Stand camera, near real time
const tau1=(t:number)=>{const G=CUE(0,'goal');return key(t,mono([[0,-3.4],[CUE(0,'Luis'),-1.6],[CUE(0,'gets the ball'),-.1],[CUE(0,'runs straight'),.8],[CUE(0,'past one'),BEATS[0]+.05],[CUE(0,'past two'),BEATS[1]+.05],[CUE(0,'still going'),BEATS[2]+.3],[CUE(0,'right foot'),SHOT-.1],[G,IN_NET+.05],[SECS(0)+1,IN_NET+.05+(SECS(0)+1-G)*.9]]),linear);};
const CAM1:V3=[70,24,60];
function cam1(t:number):Cam{
 const G=CUE(0,'goal'),S=SECS(0),tau=tau1(t);
 const bs=(u:number):V3=>{const b=ballAt(Math.min(u,SHOT));return[b[0],0,b[2]];},b0=bs(tau),b1=bs(tau-.35),b2=bs(tau-.7),bt:V3=[(b0[0]+b1[0]+b2[0])/3,0,(b0[2]+b1[2]+b2[2])/3];
 const open:V3=[84,3,-12],m=posOf(DIAZ,tau),cel:V3=[m[0]-.5,1,m[1]];
 const toBall=sm(CUE(0,'Liverpool are'),CUE(0,'Luis')+.3,t,easeInOutSine),toS=sm(G+.5,G+1.6,t,easeInOutSine),toGoal=sm(CUE(0,'still going'),CUE(0,'right foot'),t,easeInOutSine)*(1-toS);
 const tb:V3=[lerp(open[0],bt[0]+2+4*toGoal,toBall),lerp(open[1],1.5,toBall),lerp(open[2],lerp(bt[2],0,.15+.2*toGoal),toBall)],T=lerp3(tb,cel,toS);
 const F=key(t,mono([[0,2400],[CUE(0,'Liverpool are'),2800],[CUE(0,'Luis'),4700],[CUE(0,'runs straight'),5200],[CUE(0,'still going'),5300],[G,5200],[G+1.6,6200],[S,6500]]),easeInOutSine);
 return look(CAM1,T,F);
}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),tau=tau1(t),tp=tau1(twos(t)),G=CUE(0,'goal');
  stadium(s,c,v,t,[0,1,3],{roar:sm(G-.1,G+.5,t)});
  ground(s,c,{bulge:bulgeAt(tau),ballZ:GOALPT[2],ballY:GOALPT[1]});
  play(s,c,v,tau,tp,tau1(twos(t)-1/12),{minBall:8});
 },
 aperture(t){const c=cam1(t),[x,z]=posOf(DIAZ,tau1(t)),q=toCam(c,[x,1,z]),g=scr(c,q),h=c.F*1.65/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.09),12);},
 still:6,
};

// ---------------------------------------------------------------- 2 · slow replay, a low touchline camera beside Díaz: straight at him, he backs off, the burst
const tau2=(t:number)=>key(t,mono([[0,-.35],[CUE(1,'runs straight'),.35],[CUE(1,'each defender'),.7],[CUE(1,'back off'),1.02],[CUE(1,'changes speed'),1.38],[CUE(1,'bursts past'),1.62],[SECS(1),2.35]]),linear);
function cam2(t:number):Cam{
 const tau=tau2(t),m=smooth(DIAZ,tau),[d,l]=runDir(1),open=1-sm(0,1.2,t,easeInOutSine),side=sm(CUE(1,'each')-.4,CUE(1,'back off'),t,easeInOutSine);
 // behind his right shoulder, looking down his run at the first defender; swinging out to the side as he bursts past
 const q=posOf(CP1,Math.min(tau,BEATS[0]+.3)),mw=lerp(.12,.38,side),M:[number,number]=[lerp(m[0],q[0],mw),lerp(m[1],q[1],mw)],back=4.5*open+1.5*(1-side);
 // side-on from his right (the touchline side), a little behind: the gap between them reads as a distance across the frame
 const C:V3=[M[0]-l[0]*10-d[0]*back,1.6+.3*open,M[1]-l[1]*10-d[1]*back],T:V3=[M[0]+d[0]*.6,.9,M[1]+d[1]*.6];
 return look(C,T,2300-250*open);
}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),tau=tau2(t),tp=tau2(twos(t)),rs=CUE(1,'runs straight'),ed=CUE(1,'each defender'),bo=CUE(1,'back off'),cs=CUE(1,'changes speed'),bp=CUE(1,'bursts past'),E=SECS(1);
  stadium(s,c,v,t,[1,2,3]);
  ground(s,c);
  groundRing(s,c,...posOf(CP1,Math.min(tau,BEATS[0])),.8,K,sm(ed-.15,ed+.3,t,easeOutBack)*(1-sm(cs,cs+.3,t)),44);
  straightAt(s,c,tau,CP1,sm(rs-.1,rs+.3,t)*(1-sm(cs-.1,cs+.2,t)),sm(rs-.1,rs+.6,t));
  backOff(s,c,tau,CP1,sm(bo-.1,bo+.4,t,easeOut)*(1-sm(cs,cs+.3,t)));
  play(s,c,v,tau,tp,tau2(twos(t)-1/12),{minBall:5,hero:true,full:[DIAZ,CP1,CP2],after:()=>{
   burst(s,c,tau,CP1,sm(cs-.1,cs+.25,t)*(1-sm(E-.6,E-.3,t)),t-bp);}});
  streaks(s,v,1-sm(0,.5,t),21);
 },
 aperture(t){const c=cam2(t),m=posOf(DIAZ,tau2(t)),q=toCam(c,[m[0],1.3,m[1]]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.14/q[2]),12);},
 still:1.2,
};

// ---------------------------------------------------------------- 3 · replay from behind Palace's goal: the weave past five, the shot, Guaita, the celebration
const tau3=(t:number)=>{const kg=CUE(2,'keeper');return key(t,mono([[0,1.1],[CUE(2,'He weaves'),1.3],[CUE(2,'five'),2.2],[CUE(2,'edge of the box'),3.5],[CUE(2,'fires it'),SHOT-.1],[kg,SHOT+.45],[kg+1.2,IN_NET+.3],[SECS(2),IN_NET+.3+(SECS(2)-kg-1.2)*.9]]),linear);};
const swing3=(t:number)=>sm(CUE(2,'keeper')+1.1,SECS(2)-.6,t,easeInOutSine);
function cam3(t:number):Cam{
 const tau=tau3(t),u=swing3(t),C:V3=[119,6.4+.2*u,-3-1*u],e=sm(SHOT-.4,IN_NET,tau,easeInOutSine);
 const m=smooth(DIAZ,Math.min(tau,9.5)),T0:V3=[lerp(m[0]+2,100,e),lerp(1,1.4,e),lerp(m[1]+1.5,0,e)],T1:V3=[m[0]-.3,1.1,m[1]];
 return look(C,lerp3(T0,T1,u),lerp(lerp(3300,3000,e),5600,u));
}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),tau=tau3(t),tp=tau3(twos(t)),hw=CUE(2,'He weaves'),fr=CUE(2,'fires'),kg=CUE(2,'keeper'),u=swing3(t),E=SECS(2);
  stadium(s,c,v,t,[0,1,2],{roar:sm(IN_NET,IN_NET+.3,tau)});
  ground(s,c,{goalLater:u<.5});
  // the weave: his path along the edge of the box, and a ring under each white shirt the moment he goes past (five)
  pathArrow(s,c,sm(hw-.2,hw+.2,t)*(1-sm(E-1,E-.5,t)),clamp((tau-.2)/(SHOT-.3)),0,SHOT-.05);
  DEF.forEach((k,i)=>groundRing(s,c,...posOf(k,Math.min(tau,BEATS[i]+.2)),.75,K,sm(BEATS[i]-.1,BEATS[i]+.15,tau,easeOutBack)*(1-sm(fr+.4,fr+.8,t)),44+i));
  play(s,c,v,tau,tp,tau3(twos(t)-1/12),{minBall:5,hero:true,full:[DIAZ,...DEF,GK],after:()=>{
   curlTrail(s,c,tau,sm(fr-.1,fr+.2,t)*(1-sm(E-.8,E-.4,t)));}});
  if(u<.5)goal3(s,c,105,1,bulgeAt(tau),GOALPT[2],GOALPT[1]);
  // the goal: a yellow burst over the celebration
  const pw=sm(kg+.9,kg+1.4,t);if(pw>0){const m=posOf(DIAZ,tau),q=pr(c,[m[0],2.6,m[1]]);if(q)sparkBurst(s,Y,q[0],q[1],c.F*1.4/toCam(c,[m[0],2.6,m[1]])[2],{n:10,seed:88,g:easeOutBack(pw),width:12,cov:.95});}
  streaks(s,v,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3(t),[x,z]=posOf(DIAZ,tau3(t)),q=toCam(c,[x,1.1,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.16/q[2]),12);},
 still:2.6,
};

// ---------------------------------------------------------------- 4 · the lesson: a raised coaching angle on the second defender
const tau4=(t:number)=>key(t,mono([[0,1.45],[CUE(3,'Your'),1.55],[CUE(3,'run straight'),1.75],[CUE(3,'back off'),2.1],[CUE(3,'burst past'),2.45],[SECS(3),3.1]]),linear);
function cam4(t:number):Cam{
 const tau=tau4(t),m=smooth(DIAZ,tau),orbit=sm(CUE(3,'burst')-.5,SECS(3),t,easeInOutSine);
 const C:V3=[lerp(78,80,orbit),lerp(7,6.4,orbit),lerp(-26,-24,orbit)],T:V3=[m[0]+2.2,.4,m[1]+3.5];
 return look(C,T,lerp(2700,2500,orbit));
}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),tau=tau4(t),tp=tau4(twos(t)),yt=CUE(3,'Your'),rs=CUE(3,'run straight'),bo=CUE(3,'back off'),bp=CUE(3,'burst past'),E=SECS(3);
  stadium(s,c,v,t,[2,3]);
  ground(s,c);
  groundRing(s,c,...posOf(CP2,Math.min(tau,BEATS[1])),.8,K,sm(yt,yt+.4,t,easeOutBack)*(1-sm(E-.6,E-.3,t)),42);
  straightAt(s,c,Math.min(tau,BEATS[1]-.35),CP2,sm(rs-.1,rs+.3,t)*(1-sm(E-.6,E-.3,t)),sm(rs-.1,rs+.6,t));
  backOff(s,c,Math.min(tau,BEATS[1]-.35),CP2,sm(bo-.1,bo+.4,t,easeOut)*(1-sm(E-.6,E-.3,t)));
  play(s,c,v,tau,tp,tau4(twos(t)-1/12),{minBall:5,hero:true,full:[DIAZ,CP2,CP1],after:()=>{
   burst(s,c,tau,CP2,sm(bp-.1,bp+.25,t)*(1-sm(E-.6,E-.3,t)),t-bp);}});
  // the burst: his path on past the defender (the red arrow drawn on as he goes)
  pathArrow(s,c,sm(bp-.1,bp+.2,t)*(1-sm(E-.6,E-.3,t)),sm(bp-.1,bp+.7,t),BEATS[1]-.4,BEATS[1]+.7);
 },
 still:2.6,
};

const film:RisoStory={
 id:'luis-diaz-signature',format:'11v11',title:"Díaz's dribble at defenders",theme:'Run straight at defenders to make them back off, then burst past',
 ageNote:'Premier League, Liverpool 1–1 Crystal Palace, Anfield, 15 August 2022: the equaliser past five defenders. For players of every age.',
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
