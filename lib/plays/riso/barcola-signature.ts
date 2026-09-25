/** Bradley Barcola — "Signature: go before they're set" (lib/town/iconicPlays.json, kind "signature", template solo_dribble_goal, side left,
 * foot right; lesson "Use your speed early: run at the defender before they get set."). An iconic-play riso film (RisoStory, chapters mode):
 * a 1:1 reconstruction, from WRITTEN accounts (the footage itself was not reviewed), of ONE real goal that shows the signature:
 * Paris Saint-Germain 2–0 Real Sociedad, UEFA Champions League round of 16, first leg, Parc des Princes, Paris, Wednesday 14 February 2024
 * (21:00 CET, floodlit), PSG's second goal, 70th minute (1–0 → 2–0): a swift break from left to right; Barcola takes the ball on the
 * touchline, veers inside, finds the space opening up and tucks (pokes) the ball under Álex Remiro. His first Champions League goal.
 * WHY THIS MOMENT: it is a written, first-hand account of Barcola scoring by attacking at once, on a fast break, before the defence was
 * set: Barney Ronay (the Guardian, at the Parc) says La Real pressed high and left "three against three at the back", "leaving a reckless
 * amount of space behind", and that the goal "was made by a swift break from left to right, and scored by Barcola, who took the ball on
 * the touchline, veered inside, found the space opening up and tucked the ball under Remiro". That is the card's "go before they're set".
 * Wikipedia's Barcola article confirms it was his first Champions League goal. The 2025 final (an assist) and the Coupe de France final
 * (no written description of the goals found) were not used.
 *
 * SOURCES (read 24 Sep 2026 with curl, cached under scratchpad/films/src-cache/):
 *  - The Guardian match report, Barney Ronay at Parc des Princes, "Kylian Mbappé pounces to push PSG into driving seat against Real
 *    Sociedad", 14 Feb 2024  https://www.theguardian.com/football/2024/feb/14/paris-saint-germain-real-sociedad-champions-league-match-report
 *    (guardian-psg-rso-2024-report.txt): "on 70 minutes it was 2-0. The goal was made by a swift break from left to right, and scored by
 *    Barcola, who took the ball on the touchline, veered inside, found the space opening up and tucked the ball under Remiro"; photo
 *    caption "Bradley Barcola pokes the second goal past Alex Remiro"; Real Sociedad in WHITE ("glided past two white shirts", "the
 *    white-shirted cover"); La Real "set their game-line recklessly high", "Press high. Leave three against three at the back", "leaving a
 *    reckless amount of space behind"; Mbappé's 57th-minute opener at the back post from a corner.
 *  - Wikipedia, "2023–24 UEFA Champions League knockout phase" (14 Feb 2024, 21:00, Parc des Princes, 46,435; Mbappé 58', Barcola 70';
 *    referee Marco Guida)  https://en.wikipedia.org/wiki/2023%E2%80%9324_UEFA_Champions_League_knockout_phase (wiki-2023-24-ucl-ko.txt)
 *  - Wikipedia, "Bradley Barcola" (wiki-bradley-barcola.txt): "On 14 February 2024, Barcola scored his first UEFA Champions League goal in a
 *    2–0 victory over Real Sociedad in the first leg of the round of 16"; PSG number 29; "known for his speed, agility and dribbling".
 *  - Card facts: country France (lib/town/playerAppearance.json); clubs Lyon 2021–23, PSG 2023–26 (lib/town/playerCareers.json).
 * CONFIRMED: the match, date, venue, a floodlit night kick-off, the 70th minute, 1–0 → 2–0; a SWIFT BREAK from LEFT to RIGHT; Barcola took
 *  the ball ON THE TOUCHLINE (so on PSG's right, the side the break went to), VEERED INSIDE, the space OPENED UP, and he tucked/poked the
 *  ball UNDER the keeper, Álex Remiro; Real Sociedad in white shirts; La Real's high press leaving three v three at the back; his number 29;
 *  his first Champions League goal.
 * INFERRED (illustrative; never narrated unless noted): every position, path and timing in metres and seconds; who played the switch pass
 *  (drawn: an unnamed PSG team-mate carrying on the left, no number; the narration says only "from left to right") and that it was one
 *  lofted pass; where he received (drawn: on the near, right touchline, 23 m from Sociedad's goal line) and shot from (drawn: inside the
 *  box, 10 m out, right of goal); how many touches and which foot (drawn: right-foot touches and a right-foot poke — his stronger foot, the
 *  iconicPlays entry's "foot: right"; never narrated); the defender he ran at (unnamed, backing off; the entry's `beaten: 1`); that the
 *  defence was still getting back (the source's "swift break" into La Real's "reckless amount of space behind" — narrated as "the defence is
 *  still getting back"); Remiro coming off his line and going down to his right as the ball goes under him (the source: "under Remiro");
 *  the far-post side of the finish; PSG's 2023–24 home kit (dark navy with the red-and-white centre band, navy shorts and socks — PSG at
 *  home); Sociedad's white shorts and socks and blue trim; Remiro's keeper colours (drawn yellow with a blue shade); which end PSG attacked
 *  (screen-right from the main camera, so the right touchline is the near side); the other players (two PSG forwards, a midfielder, a
 *  full-back; three Sociedad defenders, three midfielders — no names, no numbers); the celebration (drawn: a run toward the corner, arms
 *  out); the crowd colours; the Parc as drawn (a steep two-tier bowl close to the pitch under one roof ring, floodlights in its lip); every
 *  camera.
 *
 * FRAMING (the TV broadcast, never top-down; full-sheet card window 1.45:1 down to square, never sheet.safe): 1 = the high main-stand camera
 * in near real time (the carry on the left → the switch → Barcola on the near touchline → straight at the defence → inside → under the
 * keeper → in); 2 = slow-motion replay from a LOW camera behind Barcola on the touchline: the defenders still running back (blue arrows),
 * his run at full speed (yellow), the defender not set (a wobbling ring), the space opening (a yellow lane); 3 = replay from BEHIND THE GOAL:
 * the veer inside, the poke under Remiro, the net, then a swing round to Barcola; 4 = the lesson from a low camera over the defender's
 * shoulder (use your speed early → run at him → before he's set). All bodies go through ONE adapter, drawPlayer() → athlete.ts (FK
 * skeleton, `prev` secondary motion, motionSmear on the fast moves); small wide-shot figures print at `low`. Handedness: the world is
 * right-handed like athlete.ts (x toward Sociedad's goal, y up, +z = the main-stand side), so a figure attacking +x has its right side at +z
 * and Barcola's RIGHT boot plays with no mirrored projector; PSG's right wing is +z (the near side); Remiro faces −x, so his RIGHT is −z.
 * Scenes read only (t, c); every action keys off cue times (withTiming re-times the film); all randomness is seeded. Heat: ≈ the doue film's
 * budget (one crowd pass of four batched plates, extras at 'low'). */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow,footballPanels} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,runCycle,dribble,backpedal,lunge,strike,keeperSet,keeperDive,celebrate,stand,posed,blendPose,
 touchPhase,STRIKE_CONTACT,type Pose,type AthleteStyle,type InkFill,type Place,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` key the action; their `at` and each chapter's `seconds` are ESTIMATES until the
 * Kokoro voice exists. withTiming matches a cue by its FIRST word only, in order; every cue starts with a plain word (no contraction or
 * hyphen — Kokoro splits them; "they're" sits mid-cue only). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The goal, live',text:'Paris, 2024, against Real Sociedad. Paris Saint-Germain break fast, from left to right. Bradley Barcola takes the ball on the touchline. He runs straight at the defence, cuts inside... and pokes it under the keeper! Two nil!',tail:1.9,
  cues:['Paris','against Real','Paris Saint-Germain','break fast','from left','Bradley Barcola','takes the ball','runs straight','cuts inside','pokes','Two nil']},
 {label:'Watch it again',text:'Watch again, slowly. The defence is still getting back. Barcola attacks at full speed, before they can get set. Space opens up!',tail:1.3,
  cues:['Watch again','defence is still','attacks','before they','Space opens']},
 {label:'The finish',text:'He veers inside, into the gap, and tucks it under Alex Remiro. Barcola scores!',tail:1.9,
  cues:['He veers','into the gap','tucks','Alex Remiro','Barcola scores']},
 {label:'Your turn',text:'Your turn: use your speed early. Run at the defender before they’re set!',tail:1.5,
  cues:['Your turn','use your speed','early','Run at','before']},
];
/** VOICE: null until the lead voices the film with scripts/plays/kokoro-narrate.py barcola-signature (writes timing.json next to script.json).
 * Then add `import timingJson from '../../../public/plays/narration/barcola-signature/timing.json';` and set VOICE to
 * `timingJson as NarrationTiming`: withTiming swaps in the clips, chapter lengths and word onsets and the film re-times itself. */
import timingJson from '../../../public/plays/narration/barcola-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (≈ .32 s a word, as calibrated on the approved films' Kokoro timings): pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.2+.02*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.2;if(/[.!?]$/.test(w))t+=.36;if(/\.\.\.$/.test(w))t+=.3;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('barcola: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUEW=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('barcola: cue '+w);return c.at;};
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
/** The film plays inside the player card's picture window: world (x,y) on the CANVAS centre (full-sheet framing, never sheet.safe). */
function cam(s:Sheet,x:number,y:number,z0:number,r=0){const z=z0*Math.min(1,Math.pow(s.W/1566,.75)),k=z*s.arrival;s.camera(x-(s.W/2-s.cx)/k,y-(s.H/2-s.cy)/k,z/s.fit,r);return z;}
type View={hx:number;hy:number};
const view=(s:Sheet,z:number):View=>({hx:s.W/(2*z*.68)+60,hy:s.H/(2*z*.68)+60});
const frame=(s:Sheet)=>view(s,cam(s,0,0,1));

// ---------------------------------------------------------------- the TV camera: a right-handed 3D projection of the pitch
/** Pitch metres (right-handed, like athlete.ts): X along the length (PSG attack +X, Sociedad's goal line at 105), Y up, Z across
 * (0 = the middle, +34 = the near touchline under the main-stand camera = PSG's right wing, where Barcola takes the ball). */
type Cam={C:V3;F:number;f:V3;r:V3;u:V3;eye:V3;project(p:V3):[number,number,number];scale(p:V3):number};
const NEAR=.4;
const sub3=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const add3=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const mul3=(a:V3,k:number):V3=>[a[0]*k,a[1]*k,a[2]*k];
const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const nrm3=(a:V3):V3=>{const l=Math.hypot(a[0],a[1],a[2])||1;return[a[0]/l,a[1]/l,a[2]/l];};
const cross3=(a:V3,b:V3):V3=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
/** a camera at C looking at T with focal length F (sheet units); +screen x = cross(forward, up) */
function look(C:V3,T:V3,F:number):Cam{const f=nrm3(sub3(T,C)),r=nrm3(cross3(f,[0,1,0])),u=cross3(r,f);
 return{C,F,f,r,u,eye:C,
  project(p:V3):[number,number,number]{const d=sub3(p,C),z=Math.max(NEAR,dot3(d,f));return[F*dot3(d,r)/z,-F*dot3(d,u)/z,z];},
  scale(p:V3){return F/Math.max(NEAR,dot3(sub3(p,C),f));}};}
function toCam(c:Cam,P:V3):V3{const d=sub3(P,c.C);return[dot3(d,c.r),dot3(d,c.u),dot3(d,c.f)];}
const scr=(c:Cam,q:V3):Pt=>[c.F*q[0]/q[2],-c.F*q[1]/q[2]];
function pr(c:Cam,P:V3):Pt|null{const q=toCam(c,P);return q[2]<NEAR?null:scr(c,q);}
const kAt=(c:Cam,P:V3)=>c.F/Math.max(NEAR,toCam(c,P)[2]);
/** project a polygon, clipped against the near plane */
function polyP(c:Cam,pts:V3[]):Pt[]{const q=pts.map(p=>toCam(c,p)),out:V3[]=[];
 for(let i=0;i<q.length;i++){const a=q[i],b=q[(i+1)%q.length],ia=a[2]>=NEAR,ib=b[2]>=NEAR;if(ia)out.push(a);if(ia!==ib){const k=(NEAR-a[2])/(b[2]-a[2]);out.push([a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,NEAR]);}}
 return out.map(p=>scr(c,p));}
const addPoly=(path:Path2D,q:Pt[])=>{if(q.length>2)path.addPath(polyPath(q,true));};
/** a 3D segment as a projected quad (near-clipped); width in metres */
function seg3(c:Cam,a:V3,b:V3,wm:number,out:Path2D,minW=1.1){let qa=toCam(c,a),qb=toCam(c,b);if(qa[2]<NEAR&&qb[2]<NEAR)return;
 const cut=(p:V3,q:V3):V3=>{const k=(NEAR-p[2])/(q[2]-p[2]);return[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k,NEAR];};if(qa[2]<NEAR)qa=cut(qa,qb);else if(qb[2]<NEAR)qb=cut(qb,qa);
 const A=scr(c,qa),Bp=scr(c,qb),wa=Math.max(minW,c.F*wm/qa[2]/2),wb=Math.max(minW,c.F*wm/qb[2]/2),dx=Bp[0]-A[0],dy=Bp[1]-A[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 out.moveTo(A[0]+nx*wa,A[1]+ny*wa);out.lineTo(Bp[0]+nx*wb,Bp[1]+ny*wb);out.lineTo(Bp[0]-nx*wb,Bp[1]-ny*wb);out.lineTo(A[0]-nx*wa,A[1]-ny*wa);out.closePath();}
const inView=(v:View,p:Pt,m=0)=>Math.abs(p[0])<v.hx+m&&Math.abs(p[1])<v.hy+m;
/** a ring of ground points (x, z, rx, rz) projected */
function ringPts(c:Cam,x:number,z:number,rx:number,rz:number,n=32):Pt[]{const o:Pt[]=[];for(let i=0;i<n;i++){const a=i/n*TAU,q=pr(c,[x+Math.cos(a)*rx,0,z+Math.sin(a)*rz]);if(q)o.push(q);}return o;}

// ---------------------------------------------------------------- the Parc des Princes at night: a steep two-tier bowl close to the pitch, one continuous roof
/** stand planes (a along 0..1, b up the rake 0..1): 0 the far side (z<0), 1 the main stand (z>0, the TV camera's side), 2 behind Sociedad's
 * goal (x>105), 3 behind PSG's goal (x<0). The shape is inferred: football-only, stands right against the touchlines, a roof all round. */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-9,114,a),1.2+27*b,-38.5-27*b],
 (a,b)=>[lerp(114,-9,a),1.2+25*b,38.5+26*b],
 (a,b)=>[110+26*b,1.2+25*b,lerp(-54,54,a)],
 (a,b)=>[-5-26*b,1.2+25*b,lerp(54,-54,a)],
];
const STAND_COLS=[96,96,64,64],STAND_ROWS=14,TIER=.46;
function stadium(s:Sheet,c:Cam,v:View,t:number,which:number[],o:{roar?:number;flash?:number;lamps?:number}={}){
 const{roar=0,flash=0,lamps=0}=o,tt=twos(t);
 // a February night in Paris: deep navy over the paper, a faint floodlit haze above the bowl
 s.field(K,.86,.5);
 const hz=pr(c,add3(c.C,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz)s.tone(Y,polyPath([[-1e4,hz[1]-700],[1e4,hz[1]-700],[1e4,hz[1]+80],[-1e4,hz[1]+80]],true),.12);
 const planes=new Path2D(),band=new Path2D(),roof=new Path2D(),edge=new Path2D();
 for(const i of which){const S=STANDS[i];addPoly(planes,polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]));
  // the tier split: a dark band of boxes between the lower and upper tiers
  addPoly(band,polyP(c,[S(0,TIER-.035),S(1,TIER-.035),S(1,TIER+.035),S(0,TIER+.035)]));
  addPoly(roof,polyP(c,[add3(S(0,1),[0,1.5,0]),add3(S(1,1),[0,1.5,0]),add3(S(1,.82),[0,9.5,0]),add3(S(0,.82),[0,9.5,0])]));
  seg3(c,add3(S(0,.82),[0,9.3,0]),add3(S(1,.82),[0,9.3,0]),.5,edge);}
 s.knockout(planes);s.tone(K,planes,.55);s.tone(B,planes,.24);
 // the crowd: PSG navy, red and white, a small block of Sociedad blue-and-white high in a far corner (inferred); the roar lifts them
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(Math.abs(b-TIER)<.05)continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,6);if(h<.2)continue;const a=(i+.5+(hash(i+j*31,8)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<2)continue;
   const p=scr(c,q);if(!inView(v,p))continue;const z=clamp(c.F*.55/q[2],2.4,16),away=si===0&&a>.84&&a<.96&&b>TIER,lift=roar>0&&!away?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const ink=away?(h<.6?3:1):h<.5?0:h<.72?1:2;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.fill(K,inks[0],.8);s.knockout(inks[1],.8);s.fill(R,inks[1],.95);s.knockout(inks[2],.75);s.knockout(inks[3]);s.fill(B,inks[3],.9);
 s.knockout(band);s.fill(K,band,.9);
 s.knockout(roof);s.fill(K,roof,.95);s.knockout(edge,.6);
 // floodlights along the roof lip with yellow haloes (brighter on `lamps`)
 const lamp=new Path2D(),halo=new Path2D();for(const i of which){const S=STANDS[i],n=i<2?9:6;for(let k=0;k<n;k++){const u=(k+.5)/n,a=add3(S(u-.02,.82),[0,8.8,0]),b=add3(S(u+.02,.82),[0,8.8,0]),m=lerp3(a,b,.5);if(toCam(c,m)[2]<NEAR+2)continue;seg3(c,a,b,1,lamp);
  const g=pr(c,m);if(g){const r=clamp(kAt(c,m)*(4.2+2.5*lamps),8,160);halo.moveTo(g[0]+r,g[1]);halo.ellipse(g[0],g[1],r,r*.62,0,0,TAU);}}}
 s.knockout(halo,.22+.2*lamps);s.tone(Y,halo,.4+.25*lamps);s.knockout(lamp);s.fill(Y,lamp,.8);
 if(flash>0){const p=new Path2D(),n=Math.round(24*flash),T12=Math.floor(tt*12);for(let i=0;i<n;i++){const r1=hash(i*17+T12*101,3),r2=hash(i*29+T12*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,STANDS[si](r2,.1+.8*hash(i,T12)));if(!q)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.6);}
}
/** floodlit grass (yellow under a blue screen) with mowing stripes, LED boards, paper lines and both goals (Sociedad's goal can be drawn
 * later, in front of the players, when the camera is behind it) */
function ground(s:Sheet,c:Cam,o:{bulge?:number;ballZ?:number;goalLater?:boolean}={}){
 const g=polyP(c,[[-6,0,-38],[111,0,-38],[111,0,38],[-6,0,38]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.88);s.tone(B,gp,.55);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[k*5.25,0,-34],[(k+1)*5.25,0,-34],[(k+1)*5.25,0,34],[k*5.25,0,34]]));s.tone(B,st,.18);
 // LED boards: navy with paper and yellow panels (the near-side boards only when the camera is not above them)
 const bd=new Path2D(),pn=new Path2D(),pn2=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.9,0]),add3(a,[0,.9,0])]));
 board([-4,0,-36.5],[109,0,-36.5]);board([109,0,-36],[109,0,36]);board([-4,0,36],[-4,0,-36]);
 for(let k=0;k<18;k++){const x=-2+k*6.2;addPoly(k%3?pn:pn2,polyP(c,[[x,.25,-36.45],[x+3.4,.25,-36.45],[x+3.4,.65,-36.45],[x,.65,-36.45]]));}
 for(let k=0;k<11;k++){const z=-34+k*6.4;addPoly(k%3?pn:pn2,polyP(c,[[108.95,.25,z],[108.95,.25,z+3.4],[108.95,.65,z+3.4],[108.95,.65,z]]));}
 s.knockout(bd);s.fill(K,bd,.9);s.knockout(pn,.85);s.knockout(pn2);s.fill(Y,pn2,.9);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
 for(let k=0;k<8;k++){L([k*13.125,0,-34],[(k+1)*13.125,0,-34]);L([k*13.125,0,34],[(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){const z0=-34+k*17,z1=z0+17;L([105,0,z0],[105,0,z1]);L([0,0,z0],[0,0,z1]);L([52.5,0,z0],[52.5,0,z1]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(52.5,0,9.15);circ(52.5,0,.1,0,TAU,6);
 for(const [gx,d] of [[105,-1],[0,1]] as [number,number][]){const bx=gx+d*16.5,sx=gx+d*5.5;L([gx,0,-20.16],[bx,0,-20.16]);L([bx,0,-20.16],[bx,0,20.16]);L([bx,0,20.16],[gx,0,20.16]);L([gx,0,-9.16],[sx,0,-9.16]);L([sx,0,-9.16],[sx,0,9.16]);L([sx,0,9.16],[gx,0,9.16]);
  const a=Math.acos(5.5/9.15);circ(gx+d*11,0,9.15,d<0?Math.PI-a:-a,d<0?Math.PI+a:a,10);circ(gx+d*11,0,.08,0,TAU,6);}
 // the corner arc and flag by the near touchline (Barcola's side)
 circ(105,34,1,Math.PI,Math.PI*1.5,6);
 s.knockout(ln);
 const flag=new Path2D();seg3(c,[105,0,34],[105,1.5,34],.04,flag,.8);s.fill(K,flag,.9);const fq=polyP(c,[[105,1.5,34],[105,1.2,34],[104.55,1.35,34]]);if(fq.length>2)s.fill(R,polyPath(fq,true),.95);
 goal3(s,c,0,-1,0,0);
 if(!o.goalLater)goal3(s,c,105,1,o.bulge??0,o.ballZ??-1.5);
}
/** a goal at X: posts at z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out around ballZ */
function goal3(s:Sheet,c:Cam,X:number,d:number,bulge:number,bz:number){
 const z0=-3.66,z1=3.66,H=2.44,back=(z:number,y=0)=>X+d*(2+bulge*.8*Math.exp(-Math.pow((z-bz)/1.6,2))*(1-y/2.6));
 const zs=[z0,-1.8,0,1.8,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0,1.9),1.9,z0],[back(z0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1,1.9),1.9,z1],[back(z1),0,z1]],
  [[X,H,z0],[X,H,z1],[back(z1,1.9),1.9,z1],...zs.slice(1,-1).reverse().map(z=>[back(z,1.9),1.9,z] as V3),[back(z0,1.9),1.9,z0]],
  [...zs.map(z=>[back(z),0,z] as V3),...zs.slice().reverse().map(z=>[back(z,1.9),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.3);s.tone(K,net,.12);
 const mesh=new Path2D();
 for(let i=0;i<=12;i++){const z=lerp(z0,z1,i/12);seg3(c,[X,H,z],[back(z,1.9),1.9,z],.025,mesh,.7);seg3(c,[back(z,1.9),1.9,z],[back(z),0,z],.025,mesh,.7);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<4;i++){const za=zs[i],zb=zs[i+1];seg3(c,[back(za,y),y,za],[back(zb,y),y,zb],.025,mesh,.7);}seg3(c,[X,y*H/1.9,z0],[back(z0,y),y,z0],.025,mesh,.7);seg3(c,[X,y*H/1.9,z1],[back(z1,y),y,z1],.025,mesh,.7);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+d*2*u,H-.54*u,z0],[X+d*2*u,H-.54*u,z1],.025,mesh,.7);}
 s.knockout(mesh,.8);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.19,fo);seg3(c,[X,0,z1],[X,H,z1],.19,fo);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.19,fo);s.fill(K,fo,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- kits (athlete styles)
const SKIN:InkFill[]=[[Y,.32],[R,.2]];
const SKIN_S:InkFill[]=[[Y,.36],[R,.26],[K,.04]];
const SKIN_M:InkFill[]=[[Y,.42],[R,.32],[K,.12]];
const SKIN_D:InkFill[]=[[R,.45],[Y,.5],[K,.24]];
/** PSG at home: the 2023–24 dark navy shirt with the red-and-white centre band (printed by drawPlayer on the shirt front); navy shorts and
 * socks (inferred: PSG's home kit at the Parc) */
const PSG=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[K,.95],shorts:[K,.95],socks:[K,.95],boots:K,trim:R,numberInk:'paper',skin:SKIN,hair:[K,.9],hairStyle:'short',line:K,shade:[B,.35],sleeves:'short',seed:5,...o});
/** Bradley Barcola: number 29 (confirmed), about 1.82 m and slim, short dark hair (playerAppearance: skin 5, hair 0, short) */
const BARCOLA_ST=PSG({number:29,skin:SKIN_D,hair:[K,.95],build:{height:1.82,bulk:.93},seed:29});
/** Real Sociedad: WHITE shirts (confirmed, Guardian); white shorts and socks, blue trim inferred; no numbers drawn (players unnamed) */
const RSO=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:'paper',boots:K,trim:[B,.8],skin:SKIN_S,hair:K,hairStyle:'short',line:K,shade:[K,.3],sleeves:'short',seed:3,...o});
/** the Sociedad defender Barcola runs at (unnamed) */
const DEF_ST=RSO({skin:SKIN_M,hair:[K,.95],build:{height:1.84,bulk:1.03},seed:41});
/** Álex Remiro: keeper colours inferred (drawn yellow with a blue shade), long sleeves, no number */
const GK_ST:AthleteStyle={shirt:[Y,.95],shorts:[Y,.95],socks:[Y,.95],boots:K,skin:SKIN_S,hair:[K,.9],hairStyle:'short',line:K,shade:[B,.5],gloves:'paper',sleeves:'long',trim:K,build:{height:1.91,bulk:1.02},seed:23};

/** PSG's red band with its white edges, printed on the shirt FRONT when it faces the camera (athlete.ts has no single-band pattern) */
function psgFlash(s:Sheet,c:Cam,r:DrawResult){
 if(r.detail==='low')return;const sk=r.sk,up=nrm3(sub3(sk.neck,sk.pelvis)),f=nrm3(cross3(up,nrm3(sub3(sk.rSh,sk.lSh)))),fh=nrm3(cross3(up,nrm3(sub3(sk.rHip,sk.lHip))));
 if(dot3(f,nrm3(sub3(c.C,sk.chest)))<.2)return;
 const P3:V3[]=[add3(add3(sk.neck,mul3(up,-.07)),mul3(f,.1)),add3(sk.chest,mul3(f,.14)),add3(add3(sk.pelvis,mul3(up,.12)),mul3(fh,.13))],pts:Pt[]=[];
 for(const p of P3){const q=pr(c,p);if(!q)return;pts.push(q);}
 const w=kAt(c,sk.chest);s.knockout(ribbon(pts,w*.17,{seed:7,taper:0,wobble:.3}),.9);s.fill(R,ribbon(pts,w*.1,{seed:7,taper:0,wobble:.3}),.95);
}
/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete: fluid FK body, kit inks, halftone shade, key line).
 * prev = the pose one drawing earlier (secondary motion: hair and hem trail); smear = a halftone echo + speed lines for fast limbs. */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,o:{prev?:Pose;smear?:boolean;flash?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{threshold:10});
 const r=drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev}:{});
 if(o.flash)psgFlash(s,camera,r);
 return r;
}

// ---------------------------------------------------------------- the players: keyframed tracks (τ = seconds after Barcola's first touch)
type Role='hero'|'psg'|'rso'|'def'|'gk';
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];engage?:[number,number];key?:boolean};
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** the ball events (τ): the switch from the left, Barcola's touches (the take on the touchline, two at speed at the defender, the VEER inside,
 * two carries through the gap), the poke, over the line, into the net */
const PASS=-2.2,SHOT=3.45,IN=SHOT+.92,NETHIT=IN+.2;
const TOUCHES=[0,.6,1.2,1.75,2.35,2.9];
const VEER=1.75,JAB=1.85;
/** Barcola: jogs up the near touchline waiting, takes the switch, straight at the defender at full speed, veers inside (−z) past him through
 * the gap, pokes it under the keeper, runs on toward the corner */
const BK:number[][]=[[-6,57,31.8],[-4,60.8,32],[-2.2,65.2,32.1],[-1,71.2,31.9],[0,75.8,31.4],[.6,80.4,30],[1.2,84.6,28],[1.5,86.6,26.5],[1.75,88.1,24.5],
 [2.35,90.9,19.9],[2.9,93.3,15.4],[3.45,95.2,11.3],[3.75,96.2,10.1],[4.4,98,10.5],[5.5,100.4,14.6],[7,102.2,20.4],[9,103.2,25.6]];
/** the right-foot ball spot at τ on a track: ahead and a touch to his right */
function footOn(keys:number[][],tau:number):[number,number]{const p=herm(keys,tau),a=herm(keys,tau-.08),b=herm(keys,tau+.08),dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,fx=dx/l,fz=dz/l;
 return[p[0]+fx*.45-fz*.12,p[1]+fz*.45+fx*.12];}
const ACTORS:Actor[]=[
 {name:'Barcola',role:'hero',style:BARCOLA_ST,key:true,keys:BK},
 {name:'Sociedad defender',role:'def',style:DEF_ST,key:true,engage:[-.4,1.95],keys:[[-6,74,23.5],[-4,79,24.4],[-2.2,84.2,26],[-1,86.9,26.9],[0,88.2,27.2],[.6,89,27.2],[1.2,89.5,26.9],[1.5,89.7,26.6],[1.75,89.8,26.2],[2.1,90.4,24.8],[2.6,92,21.6],[3.45,94.3,17],[5,96,14],[9,97,12]]},
 {name:'Remiro',role:'gk',style:GK_ST,key:true,keys:[[-6,103.8,1.2],[0,103.4,2.6],[2,102.6,4],[3.2,101.9,4.6],[9,101.9,4.6]]},
 {name:'PSG passer',role:'psg',style:PSG({skin:SKIN_M,seed:12,build:{height:1.78}}),key:true,keys:[[-6,47,-25],[-4.6,52.5,-22.8],[-3,58.5,-20],[-2.2,61.4,-18.6],[-1,64.6,-17.2],[1,68,-15],[4,72,-12],[9,77,-9]]},
 {name:'PSG striker',role:'psg',style:PSG({skin:SKIN_D,seed:17,build:{height:1.78,bulk:.96}}),key:true,keys:[[-6,70,4],[-3,79,3],[0,86,2.6],[1.5,89.6,2.2],[3.45,93.2,1.6],[4.5,94.2,2.6],[6,96.4,7],[9,99.4,14]]},
 {name:'PSG left forward',role:'psg',style:PSG({skin:SKIN,seed:18,hair:[K,.7]}),keys:[[-6,68,-14],[-3,77,-13],[0,84,-12],[3.45,91,-9],[9,97,2]]},
 {name:'PSG midfielder',role:'psg',style:PSG({skin:SKIN_S,seed:19,build:{height:1.74}}),keys:[[-6,56,-4],[0,67,2],[3.45,75,6],[9,85,10]]},
 {name:'PSG right-back',role:'psg',style:PSG({skin:SKIN_M,seed:20}),keys:[[-6,48,26],[0,61,27],[3.45,69,26],[9,79,24]]},
 {name:'Sociedad centre-back',role:'rso',style:RSO({seed:42,build:{height:1.88,bulk:1.05}}),key:true,engage:[1.4,4],keys:[[-6,76,10],[-3,82,8.5],[0,88,6.5],[1.5,91,5.5],[3.45,94.5,4.2],[5,96,4],[9,97,4]]},
 {name:'Sociedad defender 3',role:'rso',style:RSO({seed:43,skin:SKIN_M}),keys:[[-6,74,-6],[-3,80,-7],[0,86,-7.5],[3.45,93,-6.2],[9,96,-5]]},
 {name:'Sociedad midfielder 1',role:'rso',style:RSO({seed:44,hair:[Y,.7]}),keys:[[-6,50,-18],[-3,55.5,-17],[0,62,-13],[3.45,68,-9],[9,74,-6]]},
 {name:'Sociedad midfielder 2',role:'rso',style:RSO({seed:45,skin:SKIN_M,hairStyle:'long'}),keys:[[-6,62,14],[-3,68,15.5],[0,74,18],[3.45,80,17],[9,88,15]]},
 {name:'Sociedad midfielder 3',role:'rso',style:RSO({seed:46}),keys:[[-6,57,-2],[0,69,-1],[3.45,77,1],[9,86,3]]},
];
const BAR=0,DEF=1,GK=2,PAS=3,STR=4,CB=8;
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const T0=-6,T1=9,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const smooth=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau),b=posOf(k,tau-.3),d=posOf(k,tau-.6);return[(a[0]+b[0]+d[0])/3,(a[1]+b[1]+d[1])/3];};

// ---------------------------------------------------------------- the ball: the carry on the left, the switch, the run, the poke under the keeper
const TP=TOUCHES.map(t=>footOn(BK,t)),SHOT0=footOn(BK,SHOT);
/** the finish: low, just inside the far post (−z) under the diving keeper, into the side of the net */
const GOALIN:V3=[105.05,.16,-1.5],NETP:V3=[106.8,.3,-2.05],REST:V3=[106.35,.11,-1.9];
function passerBall():[number,number]{const p=posOf(PAS,PASS),v=velOf(PAS,PASS),l=Math.hypot(v[0],v[1])||1;return[p[0]+v[0]/l*.45,p[1]+v[1]/l*.45];}
function ballAt(tau:number):V3{
 if(tau<PASS){const p=posOf(PAS,tau),v=velOf(PAS,tau),l=Math.hypot(v[0],v[1])||1,ph=distOf(PAS,tau)/2.6,bob=.35*Math.abs(Math.sin(ph*Math.PI));return[p[0]+v[0]/l*(.45+bob),.11,p[1]+v[1]/l*(.45+bob)];}
 // the switch: a driven, lofted ball across the pitch, dropping onto the touchline in front of him
 if(tau<0){const a=passerBall(),u=(tau-PASS)/-PASS,e=u*(1.25-.25*u);return[lerp(a[0],TP[0][0],e),.11+4*3.4*u*(1-u),lerp(a[1],TP[0][1],e)];}
 if(tau<SHOT){let k=0;while(k+1<TOUCHES.length&&tau>=TOUCHES[k+1])k++;const a=TP[k],b=k+1<TP.length?TP[k+1]:SHOT0,t1=k+1<TOUCHES.length?TOUCHES[k+1]:SHOT,u=(tau-TOUCHES[k])/(t1-TOUCHES[k]),e=1-(1-u)*(1-u);
  return[lerp(a[0],b[0],e),.11,lerp(a[1],b[1],e)];}
 if(tau<IN){const u=(tau-SHOT)/(IN-SHOT);return[lerp(SHOT0[0],GOALIN[0],u),lerp(.11,GOALIN[1],u),lerp(SHOT0[1],GOALIN[2],u)];}
 if(tau<NETHIT){const u=(tau-IN)/(NETHIT-IN);return lerp3(GOALIN,NETP,u);}
 const u=clamp((tau-NETHIT)/.5),e=1-(1-u)*(1-u);return[lerp(NETP[0],REST[0],e),lerp(NETP[1],REST[1],e*e),lerp(NETP[2],REST[2],e)];
}
const bulgeAt=(tau:number)=>tau<NETHIT?0:Math.exp(-(tau-NETHIT)*2.2)*(1+.3*Math.sin((tau-NETHIT)*14));
/** where the ball passes under Remiro (τ and the ground point) */
const UNDER_T=SHOT+.62*(IN-SHOT);

// ---------------------------------------------------------------- poses (angles in degrees via posed; the athlete clamps to real range of motion)
const RAD=Math.PI/180;
const LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:12,rHipA:12,lean:16,pitch:4,lShA:26,rShA:26,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
/** the veer inside: hips and shoulders dropped toward the inside (his left, −z), knees bent, the outside (right) arm out for balance */
const VEERP:Partial<Pose>={roll:-14,bend:-12,twist:12,lean:24,lKnee:52,rKnee:58,rShA:74,lShA:26,neckY:10,squash:-.05};
/** Barcola's gait phase: running free by distance before the ball arrives; from the first touch one stride per touch, so the right foot
 * meets the ball at every touch (dribble's touchPhase) */
const PH0=Math.floor(distOf(BAR,0)/3.4)+touchPhase;
const PH_KEYS:[number,number][]=[[0,PH0],...TOUCHES.slice(1).map((t,i)=>[t,PH0+i+1] as [number,number]),[SHOT,PH0+TOUCHES.length]];
function gaitPh(tau:number):number{const f=(u:number)=>distOf(BAR,u)/3.4;
 if(tau<0)return f(tau)+PH0-f(0);if(tau>SHOT)return PH0+TOUCHES.length+f(tau)-f(SHOT);return key(tau,PH_KEYS,linear);}
function yawBar(tau:number):number{const v=velOf(BAR,tau),sp=Math.hypot(v[0],v[1]),b=ballAt(tau),[x,z]=posOf(BAR,tau);
 // waiting for the switch he glances back across at the ball
 if(tau<-.2&&tau>PASS-.6)return lerpA(yawOf(v[0],v[1]),yawOf(b[0]-x,b[2]-z),.35*bump(PASS-.6,-.2,tau));
 if(tau>SHOT-.45&&tau<SHOT+.4)return lerpA(sp>.5?yawOf(v[0],v[1]):0,yawOf(GOALIN[0]-x,GOALIN[2]-z),bump(SHOT-.45,SHOT+.4,tau)*.85);
 return sp>.5?yawOf(v[0],v[1]):yawOf(b[0]-x,b[2]-z);}
/** the whole pose of actor k at τ, with its yaw */
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),m=posOf(BAR,tau),b=ballAt(tau);
 let yaw=sp>.5?yawOf(v[0],v[1]):yawOf(b[0]-x,b[2]-z);
 if(a.engage&&tau>a.engage[0]&&tau<a.engage[1]+.4){const tx=k===DEF?m:[b[0],b[2]];yaw=lerpA(yaw,yawOf(tx[0]-x,tx[1]-z),Math.min(sm(a.engage[0],a.engage[0]+.4,tau),1-sm(a.engage[1],a.engage[1]+.4,tau)));}
 if(a.role==='gk')yaw=yawOf(b[0]-x,b[2]-z);
 if(k===BAR)yaw=yawBar(tau);
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 let p:Pose;
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='rso'||a.role==='def'?READY:stand();
 if(k===BAR){
  const s=clamp((sp-2)/4.5),ph=gaitPh(tau),run=runCycle(ph,{speed:.6+.4*s}),dr=dribble(ph,{foot:'r',speed:.55+.4*s});
  p=blendPose(idle,tau<-.25?run:dr,clamp((sp-.3)/.8));
  // the veer inside past the defender: a low, quick drop of the hips toward the inside
  p=over(p,VEERP,bump(VEER-.25,VEER+.35,tau));
  // the poke: a short, quick right-foot jab (low power) under the keeper
  {const D=.7,u=(tau-(SHOT-STRIKE_CONTACT*D))/D;if(u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.45}),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));}
  if(tau>NETHIT+.2)p=blendPose(p,celebrate(tau*.85,{kind:'run'}),sm(NETHIT+.2,NETHIT+.7,tau));
 }
 else if(sp>.5&&along<-.35*sp)p=blendPose(idle,backpedal(distOf(k,tau)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(distOf(k,tau)/3.4,{speed:s}),clamp((sp-.5)/.9));}
 if(k===DEF){// still backing off, feet moving, when Barcola veers: a late right-leg reach toward the ball going past on his right; he turns to chase
  const D=.8,u=(tau-(JAB-.6*D))/D;if(u>0&&u<1.5)p=blendPose(p,lunge(Math.min(1,u),{side:'r'}),Math.min(sm(0,.12,u),1-sm(1,1.5,u))*.85);
  if(tau>2&&tau<3.1)p=over(p,{twist:-34,neckY:-46,lean:18},bump(2,3.1,tau));}
 if(k===PAS){const D=.75,u=(tau-(PASS-STRIKE_CONTACT*D))/D;if(u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.7}),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));}
 if(k===GK){// off his line, then down to his right (−z) as the ball goes under him
  const D=.75,u=(tau-(UNDER_T-.55*D))/D;if(u>0)p=keeperDive(Math.min(1,u),{side:'r',height:0});}
 if(k===STR&&tau>NETHIT)p=over(p,{lShA:150,rShA:150,lShF:20,rShF:20,lElb:14,rElb:14,neckP:-20,lHand:1,rHand:1},sm(NETHIT,NETHIT+.5,tau));
 return{p,yaw};
}

// ---------------------------------------------------------------- drawing the match through a camera
function ball(s:Sheet,x:number,y:number,r:number,rot:number){footballPanels(s,x,y,r,{rot,key:K,shadow:B,seed:5});}
type CastE={k:number;x:number;z:number;g:Pt;h:number;d:number};
type PlayOut={list:CastE[];bg:Pt|null;br:number;hero?:DrawResult;def?:DrawResult};
/** everything on the pitch at τ (positions on ones, poses on twos at τp; τprev = the drawing before, for secondary motion) */
function play(s:Sheet,c:Cam,v:View,tau:number,tauP:number,tauPrev:number,o:{minBall?:number;hero?:boolean;before?:()=>void;after?:(r:PlayOut)=>void;trail?:number}={}):PlayOut{
 const{minBall=6,hero=false,trail=0}=o;
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!s._passage.pending;
 const list:CastE[]=[];
 ACTORS.forEach((_,k)=>{const[x,z]=posOf(k,tau),q=toCam(c,[x,.9,z]);if(q[2]<1.2)return;const g=scr(c,toCam(c,[x,0,z])),h=c.F*1.85/q[2];if(!inView(v,g,h*1.2)&&!inView(v,[g[0],g[1]-h],h))return;list.push({k,x,z,g,h,d:q[2]});});
 const b=ballAt(tau),bq=toCam(c,b),bg=bq[2]>=NEAR?scr(c,bq):null,br=bg?Math.max(minBall,c.F*.11/bq[2]):0,bground=pr(c,[b[0],0,b[2]]);
 // small ground shadows batched in one op (floodlights: soft and short); big figures cast their own through the athlete
 const sh=new Path2D();for(const e of list)if(e.h<420)sh.addPath(polyPath(blob(e.g[0],e.g[1],e.h*.13,e.h*.035,ACTORS[e.k].style.seed??1,{amp:.05,n:14}),true));
 if(bground&&bg)sh.addPath(polyPath(blob(bground[0],bground[1],br*.8,br*.25,2,{amp:.05,n:12}),true));s.tone(K,sh,.42);
 // the ball's riso trail (a yellow ribbon along the last stretch of its path)
 if(trail>0){const pts:Pt[]=[];for(let i=0;i<=12;i++){const q=pr(c,ballAt(tau-.4+.4*i/12));if(q)pts.push(q);}if(pts.length>4){s.knockout(ribbon(pts,br*1.2,{seed:44,taper:.9,wobble:.6}),.6*trail);s.fill(Y,ribbon(pts,br*.8,{seed:44,taper:.9,wobble:.6}),.9*trail);}}
 o.before?.();
 list.sort((p,q)=>q.d-p.d);
 const drawBall=()=>{if(bg)ball(s,bg[0],bg[1],br,Math.hypot(b[0],b[2])/.11);};
 let ballDone=!list.length||bq[2]>=list[0].d,heroR:DrawResult|undefined,defR:DrawResult|undefined;if(ballDone)drawBall();
 for(const e of list){if(!ballDone&&bq[2]>=e.d){drawBall();ballDone=true;}
  const a=ACTORS[e.k],{p,yaw}=poseOf(e.k,tauP),px=e.h*ppu,big=e.h>=300;
  // phone heat: low detail for small figures and extras; during a passage only the hero keeps 'mid'
  const detail=passing?(e.k===BAR?'mid':'low'):px<50||(!a.key&&px<110)?'low':'auto';
  const psg=a.role==='psg'||a.role==='hero';
  const r=drawPlayer(s,p,c,{...a.style,shadow:e.h<420?false:undefined,detail},{x:e.x,z:e.z,yaw},big&&(e.k===BAR||e.k===DEF||e.h>520)&&!passing?{prev:poseOf(e.k,tauPrev).p,smear:hero&&e.k===BAR,flash:psg}:{flash:psg&&!passing});
  if(e.k===BAR)heroR=r;if(e.k===DEF)defR=r;}
 if(!ballDone)drawBall();
 const out={list,bg,br,hero:heroR,def:defR};
 o.after?.(out);
 return out;
}
/** a broadcast speed streak (the replay wipe): long halftone strokes across the frame */
function streaks(s:Sheet,v:View,amt:number,seed:number,dir=0){if(amt<=.02)return;const p=new Path2D(),r=rng(seed);
 for(let i=0;i<16;i++){const y=(r()-.5)*2*v.hy,x0=(r()-.5)*2*v.hx,L=v.hx*(.6+r()*.9);p.addPath(ribbon([[x0-L*Math.cos(dir),y-L*Math.sin(dir)],[x0+L*Math.cos(dir),y+L*Math.sin(dir)]],12+r()*30,{seed:seed+i,taper:.8,wobble:1.5}));}
 s.tone(K,p,.55*amt);s.knockout(p,.35*amt);}

// ---------------------------------------------------------------- teaching marks, shared by the replays and the lesson
/** a ground arrow along a list of world points (drawn progressively with w) */
function groundArrow(s:Sheet,c:Cam,P:[number,number][],ink:string,w:number,seed:number,wm=.12){if(w<=0)return;
 const pts:Pt[]=[];let d=1;for(const[x,z] of P){const q=toCam(c,[x,.02,z]);if(q[2]<1)continue;pts.push(scr(c,q));d=q[2];}
 if(pts.length<3)return;const n=Math.max(2,Math.round(pts.length*clamp(w))),seg=pts.slice(0,n),wd=Math.min(60,c.F*wm/d);
 s.knockout(ribbon(seg,wd*1.7,{seed,taper:.1,wobble:.8}),.8);s.fill(ink,ribbon(seg,wd,{seed,taper:.1,wobble:.8}),.95);
 const a=seg[seg.length-2],b=seg[seg.length-1];laneArrow(s,ink,a,[b[0]+(b[0]-a[0])*.01,b[1]+(b[1]-a[1])*.01],wd,{seed:seed+1,head:wd*3});}
const pathOf=(k:number,t0:number,t1:number,n=16):[number,number][]=>{const o:[number,number][]=[];for(let i=0;i<=n;i++)o.push(posOf(k,lerp(t0,t1,i/n)));return o;};
const runPath=(t0:number,t1:number,n=16)=>pathOf(BAR,t0,t1,n);
/** a flat ring on the grass (x, z) */
function groundRing(s:Sheet,c:Cam,x:number,z:number,rx:number,rz:number,ink:string,w:number,seed:number,fill=0){if(w<=0)return;const pts=ringPts(c,x,z,rx*(.6+.4*w),rz*(.6+.4*w),36);if(pts.length<30)return;
 if(fill>0)s.tone(ink,polyPath(pts,true),fill*w);
 const rr=ribbon(pts,Math.max(4,Math.min(40,kAt(c,[x,0,z])*.07)),{close:true,seed,taper:0,wobble:1});s.knockout(rr,.9*w);s.fill(ink,rr,.95*w);}
/** "not set": a wobbling blue ring round a defender's feet that never settles (he is still moving back), redrawn on twos */
function notSet(s:Sheet,c:Cam,k:number,tau:number,t:number,w:number){if(w<=0)return;const[x,z]=posOf(k,tau),j=Math.floor(twos(t)*12);
 groundRing(s,c,x+.15*Math.sin(j*1.7),z+.15*Math.cos(j*2.3),1.1,1.1,B,w,90+(j%3),.18);}
/** the defenders still getting back: blue arrows along each back-line track toward their own goal */
function getBack(s:Sheet,c:Cam,tau:number,w:number){if(w<=0)return;for(const [k,sd] of [[DEF,71],[CB,72],[9,73]] as [number,number][])groundArrow(s,c,pathOf(k,tau-1.6,tau,10),B,w,sd,.1);}
/** the space opening: a yellow lane on the grass between the defender and the centre-back, pointing at goal */
function gap(s:Sheet,c:Cam,tau:number,w:number){if(w<=0)return;const a=posOf(DEF,tau),b=posOf(CB,tau),g=polyP(c,[[a[0]-1.2,.02,a[1]-1.6],[b[0]+.6,.02,b[1]+2.4],[b[0]+3.2,.02,b[1]+3.4],[a[0]+2.6,.02,a[1]-3.2]]);
 if(g.length<3)return;const p=polyPath(g,true);s.knockout(p,.45*w);s.tone(Y,p,.75*w);}
/** a red ring round his right boot */
function bootRing(s:Sheet,r:DrawResult|undefined,w:number){if(!r||w<=0)return;const toe=r.joints.rToe,an=r.joints.rAn,rad=Math.hypot(toe[0]-an[0],toe[1]-an[1])*1.25*w+2,cx=(toe[0]+an[0])/2,cy=(toe[1]+an[1])/2,pts:Pt[]=[];
 for(let i=0;i<26;i++){const a=i/26*TAU;pts.push([cx+Math.cos(a)*rad*1.2,cy+Math.sin(a)*rad*.8]);}s.fill(R,ribbon(pts,Math.max(3,rad*.2),{seed:82,close:true,taper:0,wobble:.8}),.95*w);}
/** a yellow spark at a world point */
function spark(s:Sheet,c:Cam,P:V3,age:number,r:number,seed:number,ink=Y){if(age<=-.2||age>=.6)return;const q=pr(c,P);if(!q)return;
 sparkBurst(s,ink,q[0],q[1],Math.min(220,kAt(c,P)*r),{n:9,seed,g:easeOutBack(clamp((age+.2)/.2))*(1-clamp((age-.35)/.25)),width:Math.max(5,Math.min(20,kAt(c,P)*.05)),cov:.95});}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, near real time
const tau1=(t:number)=>{const TW=CUEW(0,'Two'),S=SECS(0);return key(t,mono([[0,-5.4],[CUEW(0,'break'),-3.9],[CUEW(0,'from'),PASS],[CUEW(0,'Bradley'),-.7],[CUEW(0,'takes'),0],[CUEW(0,'runs'),.75],[CUEW(0,'cuts'),VEER-.1],[CUEW(0,'pokes'),SHOT],[TW,IN+.3],[S+1,IN+.3+(S+1-TW)*.95]]),linear);};
const CAM1:V3=[70,21,95];
function cam1(t:number):Cam{
 const Bb=CUEW(0,'Bradley'),TW=CUEW(0,'Two'),S=SECS(0),tau=tau1(t);
 const bs=(u:number):V3=>{const b=ballAt(Math.min(u,IN));return[b[0],0,b[2]];},b0=bs(tau),b1=bs(tau-.35),b2=bs(tau-.7),bt:V3=[(b0[0]+b1[0]+b2[0])/3,0,(b0[2]+b1[2]+b2[2])/3];
 const m=posOf(BAR,tau),cel:V3=[m[0]-1,1.1,m[1]];
 const goalward=.45*sm(CUEW(0,'cuts')-.3,CUEW(0,'pokes')+.2,t,easeInOutSine),toS=sm(TW+.5,TW+1.6,t,easeInOutSine);
 const tb:V3=[bt[0],lerp(3,1.4,sm(0,Bb,t)),bt[2]*.9],tg=lerp3(tb,[99,1.2,4],goalward*(1-toS)),T=lerp3(tg,cel,toS);
 const F=key(t,mono([[0,3600],[CUEW(0,'from'),3600],[Bb,6400],[CUEW(0,'runs'),8200],[CUEW(0,'cuts'),7600],[CUEW(0,'pokes'),5600],[TW,5200],[TW+1.6,7200],[S,7400]]),easeInOutSine);
 return look(CAM1,T,F);
}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),tau=tau1(t),tp=tau1(twos(t)),TW=CUEW(0,'Two');
  stadium(s,c,v,t,[0,2,3],{roar:sm(TW-.2,TW+.4,t),flash:sm(TW,TW+.3,t)*(1-sm(SECS(0)-.9,SECS(0)-.4,t))});
  ground(s,c,{bulge:bulgeAt(tau),ballZ:NETP[2]});
  play(s,c,v,tau,tp,tau1(twos(t)-1/12),{minBall:8});
 },
 aperture(t){const c=cam1(t),[x,z]=posOf(BAR,tau1(t)),q=toCam(c,[x,1,z]),g=scr(c,q),h=c.F*1.65/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.09),12);},
 still:9.5,
};

// ---------------------------------------------------------------- 2 · slow replay, low camera behind Barcola on the touchline: the defence still getting back, his run, the gap
const tau2=(t:number)=>key(t,mono([[0,-.35],[CUEW(1,'defence'),.05],[CUEW(1,'attacks'),.6],[CUEW(1,'before'),1.15],[CUEW(1,'Space'),1.6],[SECS(1),2.25]]),linear);
function cam2(t:number):Cam{
 const tau=tau2(t),m=smooth(BAR,tau),d=posOf(DEF,Math.min(tau,VEER)),open=1-sm(0,1.2,t,easeInOutSine),push=sm(CUEW(1,'attacks')-.2,CUEW(1,'before'),t,easeInOutSine),back=sm(CUEW(1,'Space')-.3,SECS(1),t,easeInOutSine);
 // from behind him: the defender ahead and to the right, the goal (and the space) straight ahead into the picture
 const goalward=.35+.35*back,T:V3=[lerp(d[0],97,goalward),.95-.1*push,lerp(d[1],3,goalward)],dx=T[0]-m[0],dz=T[2]-m[1],l=Math.hypot(dx,dz)||1,D=5.6+1.4*open-.8*push+.6*back;
 const C:V3=[m[0]-dx/l*D,1.5+.5*open+.4*back,m[1]-dz/l*D];
 return look(C,T,2300+400*push-300*back-300*open);
}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),tau=tau2(t),tp=tau2(twos(t)),df=CUEW(1,'defence'),at=CUEW(1,'attacks'),bf=CUEW(1,'before'),sp=CUEW(1,'Space'),E=SECS(1);
  stadium(s,c,v,t,[0,2]);
  ground(s,c);
  // "the defence is still getting back": blue arrows along their tracks; "attacks at full speed": his yellow run; "before they can get
  // set": the defender's feet never settle (wobbling ring); "space opens up": a yellow lane between the defenders, and the red veer into it
  getBack(s,c,Math.min(tau,.9),sm(df-.2,df+.4,t,easeOut)*(1-sm(at+.4,at+.8,t)));
  groundArrow(s,c,runPath(-.2,Math.max(.2,Math.min(tau+.9,VEER))),Y,sm(at-.2,at+.4,t,easeOut)*(1-sm(sp-.1,sp+.3,t)),61,.1);
  gap(s,c,Math.min(tau,VEER),sm(sp-.25,sp+.3,t,easeOut)*(1-sm(E-.8,E-.45,t)));
  groundArrow(s,c,runPath(VEER-.15,2.9),R,sm(sp-.1,sp+.5,t,easeOut)*(1-sm(E-.8,E-.45,t)),63);
  play(s,c,v,tau,tp,tau2(twos(t)-1/12),{minBall:5,hero:true,before:()=>notSet(s,c,DEF,tau,t,sm(bf-.2,bf+.2,t,easeOutBack)*(1-sm(sp+.2,sp+.6,t)))});
  streaks(s,v,1-sm(0,.5,t),21);
 },
 aperture(t){const c=cam2(t),b=ballAt(tau2(t)),q=toCam(c,b),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.1/q[2]),12);},
 still:4.6,
};

// ---------------------------------------------------------------- 3 · replay from behind the goal: the veer, the poke under Remiro, the net, then Barcola
const tau3=(t:number)=>{const bs=CUEW(2,'Barcola');return key(t,mono([[0,1.3],[CUEW(2,'He'),1.55],[CUEW(2,'into'),2.35],[CUEW(2,'tucks'),SHOT],[CUEW(2,'Alex'),UNDER_T+.1],[bs,NETHIT+.9],[SECS(2),NETHIT+.9+(SECS(2)-bs)*.8]]),linear);};
const swing3=(t:number)=>sm(CUEW(2,'Alex')+.6,CUEW(2,'Barcola')+.4,t,easeInOutSine);
function cam3(t:number):Cam{
 const tau=tau3(t),m=smooth(BAR,tau),e=sm(SHOT-.1,IN,tau,easeInOutSine),u=swing3(t),hold=sm(CUEW(2,'Barcola'),SECS(2),t,easeInOutSine);
 const C0:V3=[106.8,3,-12.5],T0:V3=[lerp(m[0],101,.2+.35*e),lerp(1,.6,e),lerp(m[1],4.5,.2+.35*e)];
 const C1:V3=[m[0]+5.5+hold,1.8+.4*hold,m[1]+5+1.2*hold],T1:V3=[m[0]-.2,1.1+.3*hold,m[1]-.3];
 const arc=Math.sin(Math.PI*u);// swing wide round the back of the net, over the bar, never through it
 return look(add3(lerp3(C0,C1,u),[7*arc,3.2*arc,-2*arc]),lerp3(T0,T1,u),lerp(4400-1500*sm(CUEW(2,'into'),CUEW(2,'tucks'),t,easeInOutSine),3000-250*hold,u)*(1+.1*e*(1-u)));
}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),tau=tau3(t),tp=tau3(twos(t)),he=CUEW(2,'He'),tk=CUEW(2,'tucks'),bs=CUEW(2,'Barcola'),u=swing3(t);
  stadium(s,c,v,t,u<.5?[0,1,3]:[0,1,2,3],{roar:sm(IN,IN+.3,tau),flash:sm(bs-.3,bs+.2,t)*(1-sm(SECS(2)-1.1,SECS(2)-.6,t)),lamps:sm(bs-.2,bs+.3,t)});
  ground(s,c,{goalLater:u<.5});
  // "veers inside, into the gap": the red veer arrow
  groundArrow(s,c,runPath(VEER-.15,SHOT-.1),R,sm(he-.2,he+.5,t,easeOut)*(1-sm(tk-.3,tk+.1,t)),64);
  play(s,c,v,tau,tp,tau3(twos(t)-1/12),{minBall:5,hero:true,trail:tau>SHOT&&tau<NETHIT+.4?1-sm(NETHIT,NETHIT+.4,tau):0,after:({hero})=>{
   // "tucks it": a red ring round his right boot as he pokes it
   bootRing(s,hero,sm(tk-.3,tk,t,easeOutBack)*(1-sm(tk+.3,tk+.6,t)));
   // "under Alex Remiro": a spark where the ball slips under him
   const ub=ballAt(UNDER_T);spark(s,c,[ub[0],.2,ub[2]],tau-UNDER_T,.5,91);}});
  if(u<.5){goal3(s,c,105,1,bulgeAt(tau),NETP[2]);
   const age=tau-IN;if(age>-.1&&age<.6)spark(s,c,GOALIN,age*1.4,.4,93);}
  streaks(s,v,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3(t),[x,z]=posOf(BAR,tau3(t)),q=toCam(c,[x,1.25,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.16/q[2]),12);},
 still:4.4,
};

// ---------------------------------------------------------------- 4 · the lesson: a low camera over the defender's shoulder, looking back at Barcola
const tau4=(t:number)=>key(t,mono([[0,-.3],[CUEW(3,'use'),0],[CUEW(3,'early'),.35],[CUEW(3,'Run'),.9],[CUEW(3,'before'),1.4],[SECS(3),1.95]]),linear);
function cam4(t:number):Cam{
 const tau=tau4(t),m=smooth(BAR,tau),d=posOf(DEF,Math.min(tau,1.5)),push=sm(CUEW(3,'use')-.3,CUEW(3,'Run'),t,easeInOutSine),back=sm(CUEW(3,'before')-.2,SECS(3),t,easeInOutSine);
 const C:V3=[d[0]+4.2+1.4*back-.6*push,1.3+.4*back,d[1]-2.4-1.6*back],T:V3=[lerp(d[0],m[0],.55)-.2,.8-.1*push+.1*back,lerp(d[1],m[1],.55)];
 return look(C,T,2200+500*push-300*back);
}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),tau=tau4(t),tp=tau4(twos(t)),us=CUEW(3,'use'),ea=CUEW(3,'early'),ra=CUEW(3,'Run'),bf=CUEW(3,'before'),E=SECS(3);
  stadium(s,c,v,t,[1,3]);
  ground(s,c);
  const m=posOf(BAR,tau);
  // "use your speed": his yellow run; "early": a yellow ring round him and the ball the moment he has it
  groundArrow(s,c,runPath(-.9,Math.max(-.5,Math.min(tau+.6,1.4))),Y,sm(us-.2,us+.4,t,easeOut)*(1-sm(ra-.1,ra+.3,t)),81,.1);
  groundRing(s,c,m[0]+.3,m[1]-.1,1.05,1.05,Y,sm(ea-.1,ea+.35,t,easeOutBack)*(1-sm(ra-.1,ra+.3,t)),7,.2);
  // "run at the defender": the red line straight at him; "before they're set": his feet still moving (blue), then the veer past
  groundArrow(s,c,runPath(.6,1.45),R,sm(ra-.25,ra+.4,t,easeOut)*(1-sm(bf+.2,bf+.5,t)),83);
  getBack(s,c,Math.min(tau,1.5),sm(bf-.2,bf+.3,t,easeOut)*(1-sm(E-.7,E-.35,t)));
  groundArrow(s,c,runPath(VEER-.15,2.6),R,sm(bf+.3,bf+.9,t,easeOut)*(1-sm(E-.7,E-.35,t)),84);
  play(s,c,v,tau,tp,tau4(twos(t)-1/12),{minBall:5,hero:true,before:()=>notSet(s,c,DEF,tau,t,sm(bf-.2,bf+.2,t,easeOutBack)*(1-sm(E-.7,E-.35,t)))});
 },
 still:4.4,
};

const film:RisoStory={
 id:'barcola-signature',format:'11v11',title:'Barcola: go before they’re set',theme:'Use your speed early: run at the defender before they get set',
 ageNote:'Champions League round of 16, first leg, Paris Saint-Germain 2–0 Real Sociedad, Parc des Princes, Paris, 14 February 2024 (70th minute). For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a kick of floodlit turf — grass bits thrown up, a yellow touch spark. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}spray(s,x,y,age,seed,2.2);if(age<.35)sparkBurst(s,Y,x,y-20,110,{n:7,seed:seed+1,g:easeOutBack(clamp(age/.15))*(1-clamp((age-.2)/.15)),width:15});},
};
/** turf spray: grass bits thrown from a point, ballistic, 0..1 s */
function spray(s:Sheet,x:number,y:number,age:number,seed:number,size=1){
 if(age<0||age>1)return;const r=rng(seed),a=new Path2D(),b=new Path2D(),u=easeOut(clamp(age/.7)),fl=Math.sin(Math.min(1,age/.8)*Math.PI);
 for(let i=0;i<14;i++){const ang=-Math.PI/2+(r()-.5)*2.2,d=(40+r()*170)*u*size,px=x+Math.cos(ang)*d,py=y+Math.sin(ang)*d*.5-fl*(30+r()*70)*size,z=(6+r()*9)*size,q:Pt[]=[[px-z,py-z*.4],[px+z*.6,py-z*.6],[px+z,py+z*.3],[px-z*.4,py+z*.5]];(i%3?a:b).addPath(polyPath(q,true));}
 const fade=1-clamp((age-.6)/.4);s.fill(R,b,.6*fade);s.fill(Y,a,.9*fade);s.tone(B,a,.6*fade);
}
export default film;
