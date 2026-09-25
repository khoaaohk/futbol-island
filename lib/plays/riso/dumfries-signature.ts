/** Denzel Dumfries — "Signature: the wing-back charge". Internazionale v Barcelona, Champions League semi-final, second leg, San Siro,
 * Milan, Tuesday 6 May 2025 (Inter won 4–3 after extra time, 7–6 on aggregate): the 21st-minute opening goal. Federico Dimarco wins the
 * ball from Dani Olmo with a crunching tackle and plays an instant through ball; Dumfries, already charging forward, is clean through and
 * sets up Lautaro Martínez's elementary finish. An iconic-play riso film (RisoStory, chapters mode): a reconstruction from WRITTEN accounts
 * and one match photo (we cannot watch the footage), printed as a riso sheet.
 *
 * WHY THIS MOMENT: his iconicPlays entry is a signature ("the wing-back charge", template overlap_run, side right; lesson "when your team
 * wins the ball, sprint forward on the outside to stretch the defence"). This goal is that lesson in one written sentence: the ball is won
 * (Dimarco's tackle), the pass is instant, and the wing-back is already far enough forward to be "clean through". The same report calls the
 * wing-backs Dumfries and Dimarco "rampant" all night. It is a real, documented play, so it is staged as it is described — no invented
 * events; only positions and body mechanics are inferred (listed below).
 *
 * SOURCES (pages cached under scratchpad/films/src-cache/):
 *  - The Guardian, Jonathan Liew at San Siro, "Frattesi fires Inter into final as Barcelona fall short in seven-goal instant classic",
 *    Tue 6 May 2025 https://www.theguardian.com/football/2025/may/06/champions-league-semi-final-inter-barcelona-match-report
 *    — "It was Olmo who got into trouble for Inter's first goal, Dimarco's crunching tackle and instant through ball putting Dumfries clean
 *    through. The finish for Martínez was elementary"; "The wing-backs Denzel Dumfries and Federico Dimarco were rampant"; Inter went two
 *    up (Martínez, Calhanoglu pen.), Barcelona led 3–2 (García, Olmo, Raphinha 87'), Acerbi 93', Frattesi 99'; Gerard Martín and García
 *    Barcelona's full-backs; Sommer in Inter's goal. (guardian-int-bar-2025-sf2.txt)
 *    Its photo "Raphinha's 87th-minute goal puts Barcelona ahead" (Jonathan Moscrop/Getty) shows THE KITS: Inter in the home shirt of
 *    blue and black stripes, black shorts, black socks, white numbers (Dumfries No. 2, Acerbi No. 15); Barcelona all in a light mint-green
 *    kit. (guardian-int-bar-2025-raphinha.jpg)
 *  - Wikipedia (en), "2024–25 UEFA Champions League knockout phase" (raw wikitext): Inter 4–3 Barcelona (a.e.t.), San Siro, 6 May 2025,
 *    21:00, L. Martínez 21', referee Szymon Marciniak, attendance 75,504; Inter won 7–6 on aggregate. (wiki-2024-25-ucl-ko.txt)
 *  - The Guardian, Sid Lowe, first leg 3–3 (30 Apr 2025): Dumfries "forever tearing into Barcelona", two goals + the cross for Thuram.
 *    (guardian-bar-int-2025-sf1.txt) — context only; that match is not staged.
 *  - lib/town/playerAppearance.json (Netherlands; skin 5, buzz cut, stubble) and lib/town/playerCareers.json (Inter 2021–2026).
 * CONFIRMED by those accounts: the match, city, stadium, date, round, the minute (21') and the score it made (1–0; Inter won 4–3 a.e.t.);
 * Olmo lost the ball; Dimarco's crunching tackle; his INSTANT through ball; Dumfries clean through; the chance he gave Martínez, who scored
 * an elementary finish; both wing-backs attacking all night; the kits (photo); Dumfries' No. 2; Barcelona's keeper Szczęsny (first-leg
 * report).
 * INFERRED (illustrative; none of it narrated): every position and timing; where on the pitch the tackle happened (drawn left of centre,
 * just inside Barcelona's half); that Dumfries charged from his right wing-back spot down the RIGHT, outside Barcelona's left-back, who
 * was caught upfield and infield of him (the card's "side: right" and his usual role); the through ball's line (diagonal, left to right); that Dumfries' ball
 * to Martínez was a low pass across the box with his RIGHT foot and that Martínez finished first time with his right, low to Szczęsny's
 * right; the Barcelona back line's names and spacing; shirt numbers other than Dumfries' 2 (Martínez 10, Dimarco 32, Olmo 20 from
 * memory); the keepers' and referee's colours; which way Inter attacked on screen (left → right from the main stand, so Inter's right
 * flank is the NEAR touchline); the stadium's look (San Siro's rectangular three-ring bowl, the corner ramp towers, the red roof trusses),
 * the night sky, the crowd colours, the camera placements, the celebration.
 *
 * FRAMING (TV broadcast, full-sheet card window 1.45:1 down to square, never sheet.safe): 1 = the high main-stand camera following the
 * ball from Olmo's carry to Martínez's finish, close to real time; 2 = slow-motion replay from a raised camera BEHIND Dumfries: it looks
 * across at the tackle (red ring on Dimarco, a yellow spark = the ball won), then swings down the wing as he goes — his run lane in red,
 * the empty grass behind the defence in yellow, the through ball as a yellow dashed arrow, the Barcelona back line as a navy band being
 * stretched; 3 = replay from behind the goal: the ball across (traced), the finish, the net, the celebration; 4 = the lesson from a raised
 * three-quarter camera behind him (ball won → sprint on the outside → the back line stretches). All figures are the shared riso athlete
 * (lib/plays/riso/athlete.ts) routed through ONE adapter, drawPlayer(). Scenes read only (t, c); every action keys off cue times, so the
 * recorded voice (withTiming) re-times the film; every random value is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,rectPath,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,runCycle,lunge,strike,keeperSet,keeperDive,celebrate,stand,posed,blendPose,
 STRIKE_CONTACT,type Pose,type AthleteStyle,type InkFill,type Place,type Projector,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Narration, cue words and provisional (≈2.6 words/s) timings. `at` = word onset in the chapter's audio (s); `seconds` = clip length incl.
 * the silent tail that carries the .65 s passage. Cue words must stay substrings of the text (script.json mirrors it); every cue starts
 * with a plain word (Kokoro splits contractions and hyphenated words). */
const TIMING:{label:string;text:string;seconds:number;cues:[number,string][]}[]=[
 {label:'The charge, live',text:'Milan, May 2025: Inter against Barcelona, a Champions League semi-final. Dimarco wins the ball with a crunching tackle. Straight away, Denzel Dumfries sprints forward. The pass sends him clean through, and he sets up Lautaro Martínez to score!',seconds:17.6,
  cues:[[.2,'Milan'],[2.2,'Inter against'],[5.1,'Dimarco wins'],[7.3,'crunching tackle'],[8.2,'Straight away'],[9.2,'Denzel Dumfries'],[9.9,'sprints forward'],[10.8,'The pass'],[12.3,'clean through'],[13.6,'he sets up'],[14.7,'Lautaro Martínez']]},
 {label:'Watch it again',text:'Watch again. The moment Inter win the ball, Dumfries runs, forward into the space behind the defence.',seconds:8.4,
  cues:[[.2,'Watch again'],[1.1,'The moment'],[3.5,'Dumfries runs'],[4.5,'forward into'],[5.9,'behind the defence']]},
 {label:'The finish',text:'From behind the goal: an easy finish for Lautaro. Inter won four three, after extra time.',seconds:8,
  cues:[[.2,'From behind'],[1.85,'an easy finish'],[2.9,'for Lautaro'],[3.9,'Inter won'],[5.5,'after extra']]},
 {label:'Your turn',text:'Your turn: when your team wins the ball, sprint forward on the outside to stretch the defence!',seconds:8.2,
  cues:[[.2,'Your turn'],[1.1,'when your team'],[3.5,'sprint forward'],[4.2,'on the outside'],[5.7,'stretch the defence']]},
];
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py dumfries-signature, which writes timing.json next to script.json. Then replace this
 * null with `import timingJson from '../../../public/plays/narration/dumfries-signature/timing.json'` and pass `timingJson as NarrationTiming`:
 * withTiming swaps in the clips, chapter lengths and word onsets and the whole film re-times itself.
 * (tests/play-film-dumfries-signature.cjs fails until this is wired once timing.json exists.) */
import timingJson from '../../../public/plays/narration/dumfries-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming(TIMING.map(c=>({label:c.label,narration:c.text,seconds:c.seconds,cues:c.cues.map(([at,words])=>({at,words}))})),VOICE);
/** onset of the cue whose words start with w in chapter i */
const CUEW=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('dumfries: cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;

// ---------------------------------------------------------------- inks, small helpers
const Y='yellow',R='red',B='blue',K='navy';
const lerp3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const wrapA=(a:number)=>{a=(a+Math.PI)%TAU;if(a<0)a+=TAU;return a-Math.PI;};
const lerpA=(a:number,b:number,u:number)=>a+wrapA(b-a)*clamp(u);
/** heading of a ground direction as an athlete yaw (yaw 0 faces +X, + turns left toward −Z) */
const yawOf=(dx:number,dz:number)=>Math.atan2(-dz,dx);
/** a smooth bump 0 → 1 → 0 over [a, b] */
const bump=(a:number,b:number,t:number)=>t<=a||t>=b?0:Math.sin(Math.PI*(t-a)/(b-a));
/** The film plays inside the player card's picture window (~1566 × 1080 units). Full-sheet framing, never sheet.safe. */
function cam(s:Sheet,x:number,y:number,z0:number,r=0){const z=z0*Math.min(1,Math.pow(s.W/1566,.75)),k=z*s.arrival;s.camera(x-(s.W/2-s.cx)/k,y-(s.H/2-s.cy)/k,z/s.fit,r);return z;}
type View={hx:number;hy:number};
const view=(s:Sheet,z:number):View=>({hx:s.W/(2*z*.68)+60,hy:s.H/(2*z*.68)+60});
const frame=(s:Sheet)=>view(s,cam(s,0,0,1));

// ---------------------------------------------------------------- the TV camera: a right-handed 3D projection of the pitch
/** Pitch metres (right-handed, like athlete.ts): X along the length (Inter defend X = 0 and attack +X, Barcelona's goal line at 105), Y up,
 * Z across (0 = the middle, +34 = the near touchline under the main-stand camera). A figure facing +X has its right side at +Z, so Inter's
 * right flank — Dumfries' side — is the near side (+Z). */
type Cam=Projector&{C:V3;F:number;f:V3;r:V3;u:V3};
const NEAR=.4;
const sub3=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
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
/** project a polygon, clipped against the near plane */
function polyP(c:Cam,pts:V3[]):Pt[]{const q=pts.map(p=>toCam(c,p)),out:V3[]=[];
 for(let i=0;i<q.length;i++){const a=q[i],b=q[(i+1)%q.length],ia=a[2]>=NEAR,ib=b[2]>=NEAR;if(ia)out.push(a);if(ia!==ib){const k=(NEAR-a[2])/(b[2]-a[2]);out.push([a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,NEAR]);}}
 return out.map(p=>scr(c,p));}
/** a 3D segment as a projected quad (near-clipped); width in metres */
function seg3(c:Cam,a:V3,b:V3,wm:number,out:Path2D){let qa=toCam(c,a),qb=toCam(c,b);if(qa[2]<NEAR&&qb[2]<NEAR)return;
 const cut=(p:V3,q:V3):V3=>{const k=(NEAR-p[2])/(q[2]-p[2]);return[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k,NEAR];};if(qa[2]<NEAR)qa=cut(qa,qb);else if(qb[2]<NEAR)qb=cut(qb,qa);
 const A=scr(c,qa),Bp=scr(c,qb),wa=Math.max(1.1,c.F*wm/qa[2]/2),wb=Math.max(1.1,c.F*wm/qb[2]/2),dx=Bp[0]-A[0],dy=Bp[1]-A[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 out.moveTo(A[0]+nx*wa,A[1]+ny*wa);out.lineTo(Bp[0]+nx*wb,Bp[1]+ny*wb);out.lineTo(Bp[0]-nx*wb,Bp[1]-ny*wb);out.lineTo(A[0]-nx*wa,A[1]-ny*wa);out.closePath();}
const inView=(v:View,p:Pt,m=0)=>Math.abs(p[0])<v.hx+m&&Math.abs(p[1])<v.hy+m;
/** a projected quad only when it is comfortably in front of the camera (near stand parts are culled) */
function quadP(c:Cam,q:V3[],minDepth=18):Pt[]|null{let lo=Infinity;for(const p of q)lo=Math.min(lo,toCam(c,p)[2]);if(lo<minDepth)return null;return q.map(p=>scr(c,toCam(c,p)));}
/** a closed ground ring (ellipse rx × rz round x,z) as a ribbon path, or null when off camera */
function groundRing(c:Cam,x:number,z:number,rx:number,rz:number,wm:number,seed:number):Path2D|null{const pts:Pt[]=[];
 for(let i=0;i<30;i++){const q=pr(c,[x+Math.cos(i/30*TAU)*rx,0,z+Math.sin(i/30*TAU)*rz]);if(q)pts.push(q);}
 if(pts.length<24)return null;const d=toCam(c,[x,0,z])[2];if(d<1)return null;return ribbon(pts,Math.max(3,c.F*wm/d),{close:true,seed,taper:0,wobble:1});}

// ---------------------------------------------------------------- San Siro at night: a steep rectangular bowl in three rings, corner ramp towers, red roof trusses
const CX=52.5,NS=64;
/** a point on the stands: angle th round the pitch centre, d metres out from the inner rim (a squared-off superellipse: San Siro is a
 * rectangle with tight corners), height y */
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CX+(60+d)*Math.sign(c)*Math.pow(Math.abs(c),.28),y,(40+d)*Math.sign(s)*Math.pow(Math.abs(s),.28)];}
const RING1=(b:number):[number,number]=>[2+15*b,1.5+10*b],RING2=(b:number):[number,number]=>[17+13*b,14+10*b],RING3=(b:number):[number,number]=>[30+12*b,27+11*b];
type Bowl={r1:V3[][];r2:V3[][];r3:V3[][];band:V3[][];roof:V3[][];truss:[V3,V3][];lamps:V3[][];towers:V3[][];seats:{P:V3;h:number;tier:number}[]};
const BOWL:Bowl=(()=>{const o:Bowl={r1:[],r2:[],r3:[],band:[],roof:[],truss:[],lamps:[],towers:[],seats:[]};
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU,Q=(f:(u:number)=>[number,number],u0:number,u1:number):V3[]=>{const[d0,y0]=f(u0),[d1,y1]=f(u1);return[rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)];};
  o.r1.push(Q(RING1,0,1));o.r2.push(Q(RING2,0,1));o.r3.push(Q(RING3,0,1));
  // the paper fascias between the rings
  o.band.push([rim(a,16.5,11.5),rim(b,16.5,11.5),rim(b,17.2,14),rim(a,17.2,14)]);o.band.push([rim(a,29.5,24),rim(b,29.5,24),rim(b,30.2,27),rim(a,30.2,27)]);
  // the roof over the third ring, carried on the famous red lattice trusses
  o.roof.push([rim(a,24,40),rim(b,24,40),rim(b,46,41.5),rim(a,46,41.5)]);
  if(i%2===0)o.truss.push([rim(a,22,40.8),rim(a,48,42.2)]);
  o.lamps.push([rim(a+.02,25,39),rim(b-.02,25,39),rim(b-.02,25,40),rim(a+.02,25,40)]);
  for(const [f,rows,tier] of [[RING1,7,0],[RING2,6,1],[RING3,6,2]] as [(u:number)=>[number,number],number,number][])for(let r=0;r<rows;r++)for(let k=0;k<4;k++){const h=hash(i*977+r*31+k*7+tier*5000,11);if(h<.12)continue;
   const[d,y]=f((r+.5)/rows);o.seats.push({P:rim((i+(k+.5+(hash(i+r*13+k,4)-.5)*.5)/4)/NS*TAU,d,y+.4),h,tier});}}
 // the spiral ramp towers outside the bowl (drawn at the four corners and mid-sides as plain cylinders: two faces each)
 for(const th of [.72,2.42,3.86,5.56]){const P=rim(th,52,0),r=5.5;for(let j=0;j<6;j++){const u0=j/6*TAU,u1=(j+1)/6*TAU;o.towers.push([[P[0]+Math.cos(u0)*r,0,P[2]+Math.sin(u0)*r],[P[0]+Math.cos(u1)*r,0,P[2]+Math.sin(u1)*r],[P[0]+Math.cos(u1)*r,46,P[2]+Math.sin(u1)*r],[P[0]+Math.cos(u0)*r,46,P[2]+Math.sin(u0)*r]]);}}
 return o;})();
/** everything behind the pitch: the night sky, the stands, the crowd (roar lifts the seat marks, flash = photographers) */
function stadium(s:Sheet,c:Cam,v:View,t:number,o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o;
 s.tone(B,rectPath(-1e4,-1e4,2e4,2e4),.6);s.tone(K,rectPath(-1e4,-1e4,2e4,2e4),.55);
 const tw=new Path2D(),r1=new Path2D(),r2=new Path2D(),r3=new Path2D(),band=new Path2D(),roof=new Path2D(),lamp=new Path2D(),truss=new Path2D();
 const add=(q:V3[],p:Path2D,md=18)=>{const r=quadP(c,q,md);if(r)p.addPath(polyPath(r,true));};
 for(const q of BOWL.towers)add(q,tw,30);
 for(let i=0;i<NS;i++){add(BOWL.r1[i],r1);add(BOWL.r2[i],r2);add(BOWL.r3[i],r3);add(BOWL.roof[i],roof);add(BOWL.lamps[i],lamp);}
 for(const q of BOWL.band)add(q,band);
 for(const [a,b] of BOWL.truss){if(Math.min(toCam(c,a)[2],toCam(c,b)[2])<20)continue;seg3(c,a,b,1.3,truss);}
 s.knockout(tw,.9);s.tone(K,tw,.62);
 s.knockout(r1);s.fill(B,r1,.55);s.tone(K,r1,.3);s.knockout(r2);s.fill(B,r2,.5);s.tone(K,r2,.42);s.knockout(r3);s.fill(B,r3,.45);s.tone(K,r3,.52);
 // the crowd: a full house of Inter blue, navy and white; a pocket of Barcelona fans (red and blue) high in the far right corner
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const q of BOWL.seats){const d=toCam(c,q.P);if(d[2]<18)continue;const p=scr(c,d);if(!inView(v,p))continue;const z=clamp(c.F*.55/d[2],2,12),aw=q.P[0]>100&&q.P[2]<-16&&q.tier===2,lift=roar>0&&!aw?roar*z*1.3*Math.max(0,Math.sin(t*11+q.h*TAU)):0;
  const ink=aw?(q.h<.55?1:2):q.h<.32?0:q.h<.78?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}
 s.knockout(inks[0],.7);s.fill(R,inks[1],.9);s.fill(B,inks[2],.95);s.fill(K,inks[3],.85);
 s.knockout(band,.85);s.tone(K,band,.14);
 s.knockout(roof);s.fill(K,roof,.9);
 s.knockout(truss,.9);s.fill(R,truss,.95);
 s.knockout(lamp);s.fill(Y,lamp,.95);
 if(flash>0){const p=new Path2D(),T12=Math.floor(t*12);for(let i=0;i<14;i++){const q=BOWL.seats[Math.floor(hash(i*17+T12*101,3)*BOWL.seats.length)],d=toCam(c,q.P);if(d[2]<18)continue;const g=scr(c,d);if(!inView(v,g))continue;const z=8+14*flash*hash(i,T12);
  p.addPath(polyPath([[g[0]-z,g[1]],[g[0],g[1]-z*.35],[g[0]+z,g[1]],[g[0],g[1]+z*.35]],true));p.addPath(polyPath([[g[0],g[1]-z],[g[0]+z*.3,g[1]],[g[0],g[1]+z],[g[0]-z*.3,g[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
/** the surround, floodlit grass (yellow × blue) with mowing stripes, boards, paper lines, both goals (Barcelona's goal drawn later when it
 * is in front of the players, i.e. from the camera behind it) */
function ground(s:Sheet,c:Cam,o:{bulge?:number;goalLater?:boolean}={}){
 const sur=polyP(c,[[-9,0,-40],[114,0,-40],[114,0,40],[-9,0,40]]);if(sur.length>2){const p=polyPath(sur,true);s.knockout(p);s.tone(B,p,.4);s.tone(K,p,.3);}
 const g=polyP(c,[[-6,0,-38],[111,0,-38],[111,0,38],[-6,0,38]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.95);s.tone(B,gp,.86);
 const st=new Path2D();for(let k=0;k<20;k+=2){const q=polyP(c,[[k*5.25,0,-38],[(k+1)*5.25,0,-38],[(k+1)*5.25,0,38],[k*5.25,0,38]]);if(q.length>2)st.addPath(polyPath(q,true));}s.tone(K,st,.1);
 // LED boards: far touchline and behind both goals, navy with blue and paper panels
 const bd=new Path2D(),pn=new Path2D();
 for(const q of [polyP(c,[[-4,0,-37],[109,0,-37],[109,.9,-37],[-4,.9,-37]]),polyP(c,[[108.5,0,-36],[108.5,0,36],[108.5,.9,36],[108.5,.9,-36]]),polyP(c,[[-3.5,0,36],[-3.5,0,-36],[-3.5,.9,-36],[-3.5,.9,36]])])if(q.length>2)bd.addPath(polyPath(q,true));
 for(let k=0;k<18;k++){const x=-2+k*6.2,q=polyP(c,[[x,.2,-36.95],[x+3.6,.2,-36.95],[x+3.6,.7,-36.95],[x,.7,-36.95]]);if(q.length>2)pn.addPath(polyPath(q,true));}
 for(let k=0;k<11;k++){const z=-34+k*6.4,q=polyP(c,[[108.45,.2,z],[108.45,.2,z+3.6],[108.45,.7,z+3.6],[108.45,.7,z]]);if(q.length>2)pn.addPath(polyPath(q,true));}
 s.knockout(bd,.9);s.fill(K,bd,.72);s.knockout(pn,.8);s.fill(B,pn,.7);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
 for(let k=0;k<8;k++){L([k*13.125,0,-34],[(k+1)*13.125,0,-34]);L([k*13.125,0,34],[(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){const z0=-34+k*17,z1=z0+17;L([105,0,z0],[105,0,z1]);L([0,0,z0],[0,0,z1]);L([52.5,0,z0],[52.5,0,z1]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(52.5,0,9.15);circ(52.5,0,.1,0,TAU,6);
 for(const [gx,d] of [[105,-1],[0,1]] as [number,number][]){const bx=gx+d*16.5,sx=gx+d*5.5;L([gx,0,-20.16],[bx,0,-20.16]);L([bx,0,-20.16],[bx,0,20.16]);L([bx,0,20.16],[gx,0,20.16]);L([gx,0,-9.16],[sx,0,-9.16]);L([sx,0,-9.16],[sx,0,9.16]);L([sx,0,9.16],[gx,0,9.16]);
  const a=Math.acos(5.5/9.15);circ(gx+d*11,0,9.15,d<0?Math.PI-a:-a,d<0?Math.PI+a:a,10);circ(gx+d*11,0,.08,0,TAU,6);}
 for(const [x,z,a0] of [[0,-34,0],[0,34,-Math.PI/2],[105,-34,Math.PI/2],[105,34,Math.PI]] as [number,number,number][])circ(x,z,1,a0,a0+Math.PI/2,5);
 s.knockout(ln);
 goal3(s,c,0,-1,0,0);
 if(!o.goalLater)goal3(s,c,105,1,o.bulge??0,NET[2]);
}
/** a goal at X: posts at z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out around ballZ */
function goal3(s:Sheet,c:Cam,X:number,d:number,bulge:number,bz:number){
 const z0=-3.66,z1=3.66,H=2.44,back=(z:number)=>X+d*(2+bulge*.8*Math.exp(-Math.pow((z-bz)/1.8,2)));
 const zs=[z0,-1.8,0,1.8,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0),1.9,z0],[back(z0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1),1.9,z1],[back(z1),0,z1]],
  [[X,H,z0],[X,H,z1],[back(z1),1.9,z1],...zs.slice(1,-1).reverse().map(z=>[back(z),1.9,z] as V3),[back(z0),1.9,z0]],
  [...zs.map(z=>[back(z),0,z] as V3),...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes){const q=polyP(c,P);if(q.length>2)net.addPath(polyPath(q,true));}
 s.knockout(net,.3);
 const mesh=new Path2D();
 for(let i=0;i<=12;i++){const z=lerp(z0,z1,i/12);seg3(c,[X,H,z],[back(z),1.9,z],.025,mesh);seg3(c,[back(z),1.9,z],[back(z),0,z],.025,mesh);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<4;i++){const za=zs[i],zb=zs[i+1];seg3(c,[back(za),y,za],[back(zb),y,zb],.025,mesh);}seg3(c,[X,y*H/1.9,z0],[back(z0),y,z0],.025,mesh);seg3(c,[X,y*H/1.9,z1],[back(z1),y,z1],.025,mesh);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+d*2*u,H-.54*u,z0],[X+d*2*u,H-.54*u,z1],.025,mesh);}
 s.fill(K,mesh,.75);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.19,fo);seg3(c,[X,0,z1],[X,H,z1],.19,fo);seg3(c,[X,H,z0],[X,H,z1],.19,fo);s.stroke(K,fo,2.5,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- kits (athlete styles)
const SKIN_L:InkFill[]=[[Y,.3],[R,.2]];
const SKIN_M:InkFill[]=[[Y,.4],[R,.3],[K,.1]];
const SKIN_D:InkFill[]=[[R,.45],[Y,.6],[K,.32]];
/** Inter: the home shirt of blue and black stripes, black shorts, black socks, white numbers (match photo) */
const INT=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:B,pattern:'stripes',patternInk:[K,.95],shorts:[K,.92],socks:[K,.92],trim:K,boots:K,skin:SKIN_L,hair:[K,.85],hairStyle:'short',line:K,shade:[K,.3],sleeves:'short',numberInk:'paper',seed:3,...o});
/** Denzel Dumfries: No. 2, 1.88 m, Netherlands; dark skin, buzz cut, stubble (playerAppearance: skin 5, buzz) — right-footed */
const DUMFRIES_STYLE=INT({number:2,skin:SKIN_D,hair:[K,.95],hairStyle:'short',build:{height:1.88,bulk:1.04,thighs:1.08},seed:2});
/** Lautaro Martínez: No. 10, 1.74 m, dark hair */
const LAUTARO_STYLE=INT({number:10,skin:SKIN_M,hair:K,build:{height:1.74,bulk:1.02},seed:10});
/** Federico Dimarco: No. 32, 1.75 m, left-footed */
const DIMARCO_STYLE=INT({number:32,hair:[K,.9],build:{height:1.75},seed:32});
/** Barcelona: all in the light mint-green change kit (match photo) — printed as a light yellow screen with a blue shade, navy numbers */
const FCB=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[Y,.55],shorts:[Y,.5],socks:[Y,.55],trim:[B,.8],boots:K,skin:SKIN_L,hair:[K,.85],hairStyle:'short',line:K,shade:[B,.5],sleeves:'short',numberInk:K,seed:5,...o});
/** Wojciech Szczęsny (keeper colours inferred: red), Yann Sommer (inferred: navy) */
const SZCZ:AthleteStyle={shirt:[R,.85],shorts:[R,.85],socks:[R,.85],trim:K,boots:K,skin:SKIN_L,hair:[K,.6],hairStyle:'short',line:K,gloves:[Y,.8],sleeves:'long',build:{height:1.95},seed:51};
const SOMMER:AthleteStyle={shirt:[K,.8],shorts:[K,.8],socks:[K,.8],trim:Y,boots:K,skin:SKIN_L,hair:[K,.7],hairStyle:'short',line:K,gloves:[Y,.6],sleeves:'long',build:{height:1.83},seed:52};
/** referee Szymon Marciniak: kit colour inferred (yellow), bald */
const REF:AthleteStyle={shirt:[Y,.95],shorts:[K,.92],socks:[K,.92],trim:K,boots:K,skin:SKIN_L,hair:null,hairStyle:'bald',line:K,seed:12};

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete: fluid FK body, kit inks, halftone shade, key line).
 * prev = the pose one drawing earlier (secondary motion: hair and hem trail); smear = a halftone echo + speed lines for fast limbs. */
function drawPlayer(s:Sheet,pose:Pose,camera:Projector,style:AthleteStyle,place:Place,o:{prev?:Pose;smear?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{threshold:10});
 return drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev}:{});
}

// ---------------------------------------------------------------- the players: keyframed tracks (τ = seconds after Dimarco's tackle)
type Role='dum'|'int'|'fcb'|'gk'|'ref';
/** a keyed move: kick (contact at `at`), dive (full stretch at `at`), lunge (full reach at `at`), take (a first touch that steps in at `at`) */
type Move={kind:'kick'|'dive'|'lunge'|'take';at:number;dur:number;side:'l'|'r';power?:number};
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];moves?:Move[];engage?:[number,number];key?:boolean};
/** Timeline (τ): Olmo carries it (−4 → 0) → Dimarco's crunching tackle (0) → he gathers (.45) → the instant through ball (1.0) → Dumfries,
 * charging since the tackle, takes it in stride (3.9) → two touches into the box (4.7, 5.5) → the ball across (6.2) → Martínez first time
 * (6.85) → the net. The tackle, the instant ball, "clean through" and Martínez's finish are confirmed; every position is illustrative. */
const TACK=0,GATH=.45,THRU=1,RECV=3.9,TCH1=4.7,TCH2=5.5,PASS=6.2,SHOT=6.85,IN_NET=SHOT+.38;
const ACTORS:Actor[]=[
 {name:'Dumfries',role:'dum',style:DUMFRIES_STYLE,key:true,moves:[{kind:'take',at:RECV,dur:.7,side:'r'},{kind:'kick',at:PASS,dur:.8,side:'r',power:.5}],
  keys:[[-4,39.4,25.6],[-2.5,40,25.4],[-1,40.8,25.1],[0,41.6,24.8],[.6,44.6,24.3],[1.5,51.6,23.1],[2.5,60.2,21.3],[3.3,67.2,19.7],[3.9,72.8,18.2],[4.7,79.4,16.2],[5.5,85.6,13.9],
   [6.2,90.4,11.8],[6.8,92.8,10.6],[7.6,94.6,9],[9,97,6],[11,98.4,4]]},
 {name:'Lautaro',role:'int',style:LAUTARO_STYLE,key:true,moves:[{kind:'kick',at:SHOT,dur:.85,side:'r',power:.85}],
  keys:[[-4,66,-1.5],[-2,67,-1.8],[0,68.4,-1.6],[1.5,72,-1],[3,78.6,-.2],[4.5,85.4,.5],[5.5,90.2,.9],[6.2,93,1.1],[6.85,94.9,1.25],[7.6,96.6,2.4],[8.6,97.6,6.2],[11,99.4,13]]},
 {name:'Dimarco',role:'int',style:DIMARCO_STYLE,key:true,engage:[-1.2,.1],moves:[{kind:'lunge',at:TACK,dur:.8,side:'l'},{kind:'take',at:GATH,dur:.6,side:'l'},{kind:'kick',at:THRU,dur:.8,side:'l',power:.7}],
  keys:[[-4,44,-14.5],[-2.5,45.6,-11.6],[-1.2,47.4,-9.4],[-.4,48.6,-8.5],[0,49.1,-8.2],[.45,49.5,-7.9],[1,50.2,-7.6],[2,53,-8],[4,60,-9.5],[8,72,-12],[11,78,-12]]},
 {name:'Barella',role:'int',style:INT({number:23,hair:K,seed:23}),keys:[[-4,50,9],[0,52,11],[3,60,13.5],[6.2,74,10],[11,86,6]]},
 {name:'Calhanoglu',role:'int',style:INT({hairStyle:'balding',hair:[K,.7],seed:20}),keys:[[-4,44,2],[0,46.4,0],[4,56,0],[11,66,0]]},
 {name:'Mkhitaryan',role:'int',style:INT({hair:[K,.8],seed:22}),keys:[[-4,54,-4],[0,52.4,-4.4],[3,60,-4],[11,72,-5]]},
 {name:'Thuram',role:'int',style:INT({number:9,skin:SKIN_D,hair:K,build:{height:1.92},seed:9}),keys:[[-4,62,-6],[0,65,-6.5],[3,74,-7.5],[6.2,86.5,-7.6],[7,89.6,-7.2],[11,95,-5]]},
 {name:'Acerbi',role:'int',style:INT({number:15,hairStyle:'bald',hair:null,build:{height:1.92},seed:15}),keys:[[-4,30,0],[0,32,0],[11,44,0]]},
 {name:'Bastoni',role:'int',style:INT({hair:K,build:{height:1.9},seed:95}),keys:[[-4,32,-13],[0,34,-13],[11,46,-12]]},
 {name:'Pavard',role:'int',style:INT({hair:[K,.6],seed:28}),keys:[[-4,31,13],[0,33,13],[11,46,12]]},
 {name:'Sommer',role:'gk',style:SOMMER,keys:[[-4,5,0],[11,9,0]]},
 // Barcelona: Olmo who lost it, the left-back caught upfield, the centre-backs stretched across, the right-back, the midfield, Szczęsny
 {name:'Olmo',role:'fcb',style:FCB({number:20,hair:[K,.85],build:{height:1.79},seed:41}),key:true,
  keys:[[-4,60.6,1.4],[-3,58.2,-.4],[-2,55.6,-2.6],[-1,52.9,-4.9],[-.3,51,-6.1],[0,50.3,-6.6],[.4,50.1,-6.4],[1.2,50.5,-6],[3,52.6,-5],[6,58,-3],[11,64,-2]]},
 {name:'Martín',role:'fcb',style:FCB({hair:[K,.9],seed:42}),key:true,
  keys:[[-4,58,20.4],[-2,55.6,19.8],[-.4,53.6,19.2],[.6,53.4,18.8],[1.6,55.4,18.2],[3,61.5,17.2],[4.5,70.5,15.6],[6.2,82,13.4],[7,86,12.4],[11,92,9]]},
 {name:'Cubarsí',role:'fcb',style:FCB({hair:[K,.95],build:{height:1.84},seed:43}),key:true,
  keys:[[-4,64,6.5],[-2,62.4,6.4],[0,61.4,6.6],[2,66,8],[4,75,9.8],[5.5,83.6,10.4],[6.2,88,9.6],[7,90.6,8.2],[11,95,6]]},
 {name:'Iñigo',role:'fcb',style:FCB({hairStyle:'balding',hair:[K,.7],build:{height:1.84},seed:44}),key:true,
  keys:[[-4,64,-6],[-2,62.4,-6],[0,61.4,-5.8],[2,67,-5.2],[4,76,-4.6],[6.2,87.6,-3.6],[7,90.2,-3.3],[11,94,-3]]},
 {name:'García',role:'fcb',style:FCB({hair:[K,.85],seed:45}),key:true,keys:[[-4,60,-23.5],[0,57.4,-22.6],[3,65,-20],[6.2,80,-14],[11,90,-8]]},
 {name:'Pedri',role:'fcb',style:FCB({hairStyle:'curly',hair:K,seed:46}),keys:[[-4,58,-10],[0,55,-10.5],[3,60,-8],[11,76,-4]]},
 {name:'deJong',role:'fcb',style:FCB({hair:[K,.6],seed:47}),keys:[[-4,60,9],[0,57,8],[3,63,8.5],[11,78,6]]},
 {name:'Yamal',role:'fcb',style:FCB({skin:SKIN_M,hair:K,seed:19}),keys:[[-4,48,-24],[0,45.6,-22],[11,56,-18]]},
 {name:'Raphinha',role:'fcb',style:FCB({skin:SKIN_M,hairStyle:'curly',hair:K,seed:11}),keys:[[-4,46,17],[0,44.4,15.6],[11,57,13]]},
 {name:'striker',role:'fcb',style:FCB({hair:[K,.6],seed:9}),keys:[[-4,42,-3],[0,41,-2],[11,54,-2]]},
 {name:'Szczęsny',role:'gk',style:SZCZ,key:true,moves:[{kind:'dive',at:SHOT+.22,dur:.8,side:'r'}],keys:[[-4,101.5,0],[3.9,101.8,1.6],[5.5,102.3,3.2],[6.2,102.2,3.2],[6.85,102.4,2.2],[11,102.4,2.2]]},
 {name:'referee',role:'ref',style:REF,keys:[[-4,52,5],[0,55,4.5],[5,68,4],[9,82,4],[11,86,4]]},
];
const DUM=0,LAU=1,DIM=2,OLMO=11,CUB=13,INI=14,GAR=15;
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const T0=-4,T1=11,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const smooth=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau),b=posOf(k,tau-.3),d=posOf(k,tau-.6);return[(a[0]+b[0]+d[0])/3,(a[1]+b[1]+d[1])/3];};
/** where actor k's foot (side) meets the ball at τ: ahead along his run and a touch to that side */
function footAt(k:number,tau:number,side:'l'|'r'='r'):[number,number]{const p=posOf(k,tau),v=velOf(k,tau),l=Math.hypot(v[0],v[1]);const f:Pt=l>.4?[v[0]/l,v[1]/l]:[1,0],right:Pt=[-f[1],f[0]],sg=side==='r'?.14:-.14;
 return[p[0]+f[0]*.5+right[0]*sg,p[1]+f[1]*.5+right[1]*sg];}

// ---------------------------------------------------------------- the ball: Olmo's carry, the loose ball, the through ball, the run, the ball across, the finish
const NET:V3=[105.35,.3,-2.2],REST:V3=[106.2,.11,-2.5];
type Leg={t0:number;t1:number;a:V3;b:V3;peak:number;ease:'roll'|'air'};
const G=(p:[number,number]):V3=>[p[0],.11,p[1]];
const LEGS:Leg[]=(()=>{const L:Leg[]=[];const push=(t0:number,t1:number,a:V3,b:V3,peak=0,ease:'roll'|'air'='roll')=>L.push({t0,t1,a,b,peak,ease});
 // the tackle knocks it loose; Dimarco gathers and plays it at once
 push(TACK,GATH,G(footAt(OLMO,TACK)),G(footAt(DIM,GATH,'l')),.35,'air');
 push(GATH,THRU,G(footAt(DIM,GATH,'l')),G(footAt(DIM,THRU,'l')));
 push(THRU,RECV,G(footAt(DIM,THRU,'l')),G(footAt(DUM,RECV)));
 // Dumfries: in stride, two touches, then the ball across
 push(RECV,TCH1,G(footAt(DUM,RECV)),G(footAt(DUM,TCH1)));push(TCH1,TCH2,G(footAt(DUM,TCH1)),G(footAt(DUM,TCH2)));push(TCH2,PASS,G(footAt(DUM,TCH2)),G(footAt(DUM,PASS)));
 push(PASS,SHOT,G(footAt(DUM,PASS)),G(footAt(LAU,SHOT)));
 push(SHOT,IN_NET,G(footAt(LAU,SHOT)),NET,.15,'air');
 return L;})();
function ballAt(tau:number):V3{
 if(tau<TACK){const f=footAt(OLMO,tau);return[f[0],.11,f[1]];}
 for(const l of LEGS)if(tau<l.t1){const u=clamp((tau-l.t0)/(l.t1-l.t0)),uu=l.ease==='roll'?1-Math.pow(1-u,1.6):u;
  const p=lerp3(l.a,l.b,uu),arc=l.peak*4*uu*(1-uu);return[p[0],p[1]+arc,p[2]];}
 const u=clamp((tau-IN_NET)/.45),e=1-(1-u)*(1-u);return lerp3(NET,REST,e);
}
const bulgeAt=(tau:number)=>tau<IN_NET?0:Math.exp(-(tau-IN_NET)*2.2)*(1+.3*Math.sin((tau-IN_NET)*14));
const legAt=(t0:number)=>LEGS.find(l=>Math.abs(l.t0-t0)<1e-6)!;

// ---------------------------------------------------------------- poses (angles in degrees via posed; the athlete clamps to real range of motion)
const RAD=Math.PI/180;
const LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
/** blend channel overrides (degrees) into a pose with weight w */
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:10,rHipA:10,lean:16,pitch:4,lShA:26,rShA:26,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
/** a first touch in stride: the foot reaches to the ball, body over it, arms out */
const TAKE_R:Partial<Pose>={rHipF:40,rHipA:8,rKnee:34,rAnk:-10,lHipF:-8,lKnee:48,lean:20,bend:6,lShA:44,rShA:58,lElb:40,rElb:34,neckP:30,squash:-.05};
const TAKE_L:Partial<Pose>={lHipF:40,lHipA:10,lKnee:34,lAnk:-10,rHipF:-8,rKnee:48,lean:20,bend:-6,lShA:58,rShA:44,lElb:34,rElb:40,neckP:30,squash:-.05};
/** the charge: chest up, head up to see the space */
const HEADUP:Partial<Pose>={neckP:-10,lean:12};
/** Olmo loses it: knocked off balance, arms flung out */
const JOLT:Partial<Pose>={lean:-8,bend:14,lShA:70,rShA:40,lShF:30,lElb:30,rElb:50,neckP:-18,squash:.05};
/** where a kick is aimed (ground point) */
function kickTarget(k:number,at:number):[number,number]{if(k===LAU)return[NET[0],NET[2]];const l=legAt(at);return l?[l.b[0],l.b[2]]:posOf(k,at+.5);}
/** the whole pose of actor k at τ, with its yaw */
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(tau);
 let yaw=sp>.5?yawOf(v[0],v[1]):yawOf(b[0]-x,b[2]-z);
 if(a.engage&&tau>a.engage[0]&&tau<a.engage[1]+.4){const m=posOf(OLMO,tau);yaw=lerpA(yaw,yawOf(m[0]-x,m[1]-z),Math.min(sm(a.engage[0],a.engage[0]+.4,tau),1-sm(a.engage[1],a.engage[1]+.4,tau)));}
 if(a.role==='gk')yaw=yawOf(b[0]-x,b[2]-z);
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 let p:Pose;
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='fcb'&&tau>TACK?READY:stand();
 if(k===DUM||k===LAU){const s=clamp((sp-2)/4.5);p=blendPose(READY,runCycle(distOf(k,tau)/(k===DUM?4.5:3.9),{speed:.4+.6*s}),clamp((sp-.4)/1.2));}
 else if(sp>.5&&along<-.35*sp){const bp=runCycle(distOf(k,tau)/2.4,{speed:.2});p=blendPose(idle,bp,clamp((sp-.5)/.8));}
 else{const s=clamp((sp-2.2)/5);p=blendPose(idle,runCycle(distOf(k,tau)/3.6,{speed:s}),clamp((sp-.5)/.9));}
 for(const mv of a.moves??[]){
  if(mv.kind==='kick'){const u=(tau-(mv.at-STRIKE_CONTACT*mv.dur))/mv.dur;if(u>0&&u<1.4){const w=Math.min(sm(0,.12,u),1-sm(1,1.4,u)),tg=kickTarget(k,mv.at);p=blendPose(p,strike(Math.min(1,u),{foot:mv.side,power:mv.power??.6}),w);
    // the body opens a little away from the kicking foot
    yaw=lerpA(yaw,yawOf(tg[0]-x,tg[1]-z)+(mv.side==='l'?-.25:.25),w);}continue;}
  if(mv.kind==='take'){const w=bump(mv.at-.35,mv.at+.4,tau);if(w>0)p=over(p,mv.side==='r'?TAKE_R:TAKE_L,w*.85);continue;}
  const t0=mv.at-(mv.kind==='dive'?.55:.6)*mv.dur,u=(tau-t0)/mv.dur;
  if(mv.kind==='lunge'&&u>0&&u<1.5)p=blendPose(p,lunge(Math.min(1,u),{side:mv.side}),Math.min(sm(0,.12,u),1-sm(1,1.5,u)));
  if(mv.kind==='dive'&&u>0){p=keeperDive(Math.min(1,u),{side:mv.side,height:.1});yaw=yawOf(-1,0);}}
 if(k===OLMO){if(tau<TACK)p=blendPose(p,runCycle(distOf(k,tau)/3,{speed:.35}),.8);p=over(p,JOLT,bump(TACK-.05,TACK+.9,tau));}
 if(k===DUM){p=over(p,HEADUP,bump(-.2,1.6,tau)*.8);p=over(p,HEADUP,bump(2,3.7,tau)*.6);
  if(tau>IN_NET+.2)p=blendPose(p,celebrate(tau*.9,{kind:'arms'}),sm(IN_NET+.2,IN_NET+.7,tau));}
 if(k===LAU&&tau>IN_NET+.2){p=blendPose(p,celebrate(tau*.85,{kind:'run'}),sm(IN_NET+.2,IN_NET+.75,tau));}
 if((a.name==='Thuram'||a.name==='Barella'||k===DIM)&&tau>IN_NET+.3)p=over(p,{lShA:150,rShA:150,lShF:20,rShF:20,lElb:14,rElb:14,neckP:-20,lHand:1,rHand:1},sm(IN_NET+.3,IN_NET+.8,tau));
 return{p,yaw};
}

// ---------------------------------------------------------------- the ball print (paper, navy panel marks)
function ball(s:Sheet,x:number,y:number,r:number,rot:number){
 const pts=blob(x,y,r,r,3,{amp:.02,n:32}),disc=polyPath(pts,true);s.knockout(disc);
 s.save();s.clip(disc);
 s.tone(B,(()=>{const p=new Path2D();p.arc(x,y,r*1.05,0,TAU);p.moveTo(x-r*.28+r*1.2,y-r*.3);p.arc(x-r*.28,y-r*.3,r*1.2,0,TAU,true);return p;})(),.45);
 const pan=new Path2D(),pent=(cx:number,cy:number,pr:number,a0:number)=>{const q:Pt[]=[];for(let i=0;i<5;i++){const a=a0+i/5*TAU;q.push([cx+Math.cos(a)*pr,cy+Math.sin(a)*pr]);}return polyPath(q,true);};
 pan.addPath(pent(x+Math.cos(rot)*r*.12,y+Math.sin(rot)*r*.12,r*.3,rot));
 for(let i=0;i<5;i++){const a=rot+Math.PI/5+i/5*TAU;pan.addPath(pent(x+Math.cos(a)*r*.9,y+Math.sin(a)*r*.9,r*.26,a));}
 s.fill(K,pan,.95);s.restore();
 s.fill(K,ribbon(pts,Math.max(2.5,r*.08),{seed:4,close:true,pressure:.4,wobble:r*.015}),.95);
 if(r>14)s.knockout(polyPath(blob(x-r*.42,y-r*.44,r*.14,r*.09,5,{amp:.05,n:10}),true));
}

// ---------------------------------------------------------------- drawing the match through a camera
type CastE={k:number;x:number;z:number;g:Pt;h:number;d:number};
type PlayOut={list:CastE[];bg:Pt|null;br:number;hero?:DrawResult;lau?:DrawResult;dim?:DrawResult};
/** everything on the pitch at τ (positions on ones, poses on twos at τp; τprev = the drawing before, for secondary motion) */
function play(s:Sheet,c:Cam,v:View,tau:number,tauP:number,tauPrev:number,o:{minBall?:number;hero?:boolean;before?:()=>void;after?:(r:PlayOut)=>void}={}):PlayOut{
 const{minBall=6,hero=false}=o;
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!s._passage.pending;
 const list:CastE[]=[];
 // replay cameras sit low among the players: an extra right in the lens (closer than 6 m) is left out so it never hides the move
 ACTORS.forEach((a,k)=>{const[x,z]=posOf(k,tau),q=toCam(c,[x,.9,z]);if(q[2]<(hero&&!a.key?6:1.2))return;const g=scr(c,toCam(c,[x,0,z])),h=c.F*1.85/q[2];if(!inView(v,g,h*1.2)&&!inView(v,[g[0],g[1]-h],h))return;list.push({k,x,z,g,h,d:q[2]});});
 const b=ballAt(tau),bq=toCam(c,b),bg=bq[2]>=NEAR?scr(c,bq):null,br=bg?Math.max(minBall,c.F*.11/bq[2]):0,bground=pr(c,[b[0],0,b[2]]);
 // small ground shadows batched in one op (floodlights: short, soft, straight down); big figures cast their own
 const sh=new Path2D();for(const e of list)if(e.h<420)sh.addPath(polyPath(blob(e.g[0],e.g[1],e.h*.17,e.h*.035,ACTORS[e.k].style.seed??1,{amp:.05,n:14}),true));
 if(bground&&bg)sh.addPath(polyPath(blob(bground[0],bground[1],br*.8,br*.25,2,{amp:.05,n:12}),true));s.tone(K,sh,.42);
 o.before?.();
 list.sort((p,q)=>q.d-p.d);
 const drawBall=()=>{if(bg&&inView(v,bg,br))ball(s,bg[0],bg[1],br,Math.hypot(b[0],b[2])/.11);};
 let ballDone=!list.length||bq[2]>=list[0].d,heroR:DrawResult|undefined,lauR:DrawResult|undefined,dimR:DrawResult|undefined;if(ballDone)drawBall();
 for(const e of list){if(!ballDone&&bq[2]>=e.d){drawBall();ballDone=true;}
  const a=ACTORS[e.k],{p,yaw}=poseOf(e.k,tauP),px=e.h*ppu,big=e.h>=300;
  // phone heat: low detail for small figures and extras; during a passage only the hero keeps 'mid'
  const detail=passing?(e.k===DUM?'mid':'low'):px<50||(!a.key&&px<150)?'low':'auto';
  const r=drawPlayer(s,p,c,{...a.style,shadow:e.h<420?false:undefined,detail},{x:e.x,z:e.z,yaw},big&&(e.k===DUM||e.k===LAU||e.h>520)&&!passing?{prev:poseOf(e.k,tauPrev).p,smear:hero&&(e.k===DUM||e.k===LAU)}:{});
  if(e.k===DUM)heroR=r;if(e.k===LAU)lauR=r;if(e.k===DIM)dimR=r;}
 if(!ballDone)drawBall();
 const out={list,bg,br,hero:heroR,lau:lauR,dim:dimR};
 o.after?.(out);
 return out;
}
/** a broadcast speed streak (the replay wipe): long halftone strokes across the frame */
function streaks(s:Sheet,v:View,amt:number,seed:number,dir=0){if(amt<=.02)return;const p=new Path2D(),r=rng(seed);
 for(let i=0;i<16;i++){const y=(r()-.5)*2*v.hy,x0=(r()-.5)*2*v.hx,L=v.hx*(.6+r()*.9);p.addPath(ribbon([[x0-L*Math.cos(dir),y-L*Math.sin(dir)],[x0+L*Math.cos(dir),y+L*Math.sin(dir)]],12+r()*30,{seed:seed+i,taper:.8,wobble:1.5}));}
 s.tone(K,p,.55*amt);s.knockout(p,.35*amt);}

// ---------------------------------------------------------------- teaching marks, shared by the replay and the lesson
/** the empty grass behind Barcelona's back line on Dumfries' side: a yellow wash from x0 to x1 (growing with w) */
function emptyGrass(s:Sheet,c:Cam,w:number,x0=66,x1=92){if(w<=0)return;const xe=x0+(x1-x0)*easeOut(clamp(w*1.2));
 const q=polyP(c,[[x0,.01,12],[xe,.01,10],[xe,.01,31],[x0,.01,31]]);if(q.length<3)return;const p=polyPath(q,true);s.knockout(p,.35*w);s.tone(Y,p,.6*w);}
/** a red ring on the grass round actor k */
function ringOn(s:Sheet,c:Cam,k:number,tau:number,w:number,seed:number){if(w<=0)return;const[x,z]=posOf(k,tau),r=groundRing(c,x,z,1.3*w,1.3*w,.1,seed);if(r){s.knockout(r,.85);s.fill(R,r,.95);}}
/** his run: a red lane along his track from τa to τb (progress w) */
function runLane(s:Sheet,c:Cam,k:number,ta:number,tb:number,w:number,width=.45){if(w<=0)return;
 const pts:Pt[]=[];let d=1;const n=30;for(let i=0;i<=n;i++){const tau=lerp(ta,lerp(ta,tb,clamp(w)),i/n),[x,z]=posOf(k,tau),q=toCam(c,[x,.02,z]);if(q[2]<1)continue;pts.push(scr(c,q));d=q[2];}
 if(pts.length<4)return;const wd=Math.max(5,c.F*width/d);
 s.knockout(ribbon(pts,wd*1.6,{seed:61,taper:.1,wobble:.8}),.8);s.fill(R,ribbon(pts,wd,{seed:61,taper:.1,wobble:.8}),.95);
 const a=pts[pts.length-2],b=pts[pts.length-1];laneArrow(s,R,a,[b[0]+(b[0]-a[0])*.01,b[1]+(b[1]-a[1])*.01],wd,{seed:62,head:wd*3});}
/** a pass: a yellow dashed arrow on the grass (progress w) */
function passArrow(s:Sheet,c:Cam,a3:V3,b3:V3,w:number,seed:number){if(w<=0)return;const pa=pr(c,[a3[0],.05,a3[2]]),pb=pr(c,[b3[0],.05,b3[2]]);if(!pa||!pb)return;
 const d=toCam(c,[(a3[0]+b3[0])/2,0,(a3[2]+b3[2])/2])[2],wd=Math.max(5,c.F*.2/Math.max(1,d));
 s.knockout(ribbon([pa,pb],wd*1.8,{seed,taper:.1,wobble:.8}),.7*w);laneArrow(s,Y,pa,pb,wd,{progress:w,seed:seed+1,head:wd*3,dashed:true});}
/** the Barcelona back line as a navy band on the grass through the defenders still goal-side (it stretches as Dumfries pulls it wide; the left-back is caught upfield) */
function backLine(s:Sheet,c:Cam,tau:number,w:number){if(w<=0)return;const pts:Pt[]=[];let d=0,n=0;
 for(const k of [GAR,INI,CUB]){const[x,z]=posOf(k,tau),q=toCam(c,[x,.03,z]);if(q[2]<1)return;pts.push(scr(c,q));d+=q[2];n++;}
 const wd=Math.max(4,c.F*.3/(d/n));s.knockout(ribbon(pts,wd*1.7,{seed:71,taper:.05,wobble:.6}),.6*w);s.fill(K,ribbon(pts,wd,{seed:71,taper:.05,wobble:.6,gaps:[[.3,.34],[.64,.68]]}),.85*w);}
/** a two-headed yellow arrow across the gap between two defenders: "stretched" */
function gapArrow(s:Sheet,c:Cam,ka:number,kb:number,tau:number,w:number,seed:number){if(w<=0)return;const[ax,az]=posOf(ka,tau),[bx,bz]=posOf(kb,tau),m:V3=[(ax+bx)/2,.05,(az+bz)/2];
 const pa=pr(c,[ax+(bx-ax)*.14,.05,az+(bz-az)*.14]),pb=pr(c,[bx+(ax-bx)*.14,.05,bz+(az-bz)*.14]),pm=pr(c,m);if(!pa||!pb||!pm)return;const wd=Math.max(4,c.F*.18/Math.max(1,toCam(c,m)[2]));
 laneArrow(s,Y,pm,pa,wd,{progress:w,seed,head:wd*3});laneArrow(s,Y,pm,pb,wd,{progress:w,seed:seed+1,head:wd*3});}
/** the ball across: its path traced (yellow) up to progress w */
function crossTrace(s:Sheet,c:Cam,w:number){if(w<=0)return;const pts:Pt[]=[];let d=1;for(let i=0;i<=20;i++){const tau=lerp(PASS,lerp(PASS,SHOT,w),i/20),q=toCam(c,ballAt(tau));if(q[2]<1)continue;pts.push(scr(c,q));d=q[2];}
 if(pts.length<4)return;const wd=Math.max(4,c.F*.09/d);s.knockout(ribbon(pts,wd*2,{seed:88,taper:.2,wobble:.6}),.6);s.fill(Y,ribbon(pts,wd,{seed:88,taper:.2,wobble:.6,gaps:[[.2,.28],[.45,.53],[.7,.78]]}),.95);}
/** speed lines streaming off actor k */
function speedLines(s:Sheet,c:Cam,k:number,tau:number,w:number){if(w<=0)return;const[x,z]=posOf(k,tau),v=velOf(k,tau),l=Math.hypot(v[0],v[1])||1,q=pr(c,[x,1,z]),q2=pr(c,[x+v[0]/l,1,z+v[1]/l]);if(!q||!q2)return;
 const dir=Math.atan2(q2[1]-q[1],q2[0]-q[0]),Z=c.F/toCam(c,[x,1,z])[2],p=new Path2D();
 for(let j=0;j<3;j++){const oy=(j-1)*Z*.45,ox=Z*(.7+j*.2);p.addPath(ribbon([[q[0]-Math.cos(dir)*ox,q[1]-Math.sin(dir)*ox+oy],[q[0]-Math.cos(dir)*(ox+Z*(1.1+.3*j)),q[1]-Math.sin(dir)*(ox+Z*(1.1+.3*j))+oy]],Z*.05,{seed:9+j,taper:.9,wobble:.5}));}
 s.fill(K,p,.6*w);}
/** "wins the ball": a yellow spark where the tackle lands */
function wonSpark(s:Sheet,c:Cam,age:number){if(age<-.05||age>.5)return;const b=legAt(TACK).a,q=pr(c,[b[0],.3,b[2]]);if(!q)return;
 sparkBurst(s,Y,q[0],q[1],c.F*1.1/Math.max(1,toCam(c,b)[2]),{n:9,seed:94,g:easeOutBack(clamp((age+.05)/.15))*(1-clamp((age-.3)/.2)),width:9});}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, close to real time
const tau1=(t:number)=>key(t,[[0,-5.2],[CUEW(0,'Inter against'),-4],[CUEW(0,'Dimarco wins'),-1.1],[CUEW(0,'crunching'),TACK],[CUEW(0,'Straight away'),.7],[CUEW(0,'Denzel'),1.5],[CUEW(0,'The pass'),3.1],[CUEW(0,'clean through'),RECV+.15],[CUEW(0,'he sets up'),PASS-.1],[CUEW(0,'Lautaro'),SHOT],[SECS(0)+1,SHOT+SECS(0)+1-CUEW(0,'Lautaro')]],linear);
const CAM1:V3=[52.5,26,74];
function cam1(t:number):Cam{
 const L=CUEW(0,'Lautaro'),S=SECS(0),tau=tau1(t);
 const bs=(u:number):V3=>{const b=ballAt(u);return[b[0],0,b[2]];},b0=bs(tau),b1=bs(tau-.35),b2=bs(tau-.7),bt:V3=[(b0[0]+b1[0]+b2[0])/3,0,(b0[2]+b1[2]+b2[2])/3];
 // while the through ball travels, frame both the passer's end and Dumfries' charge; settle on the box for the finish
 const d=posOf(DUM,tau),both=sm(.2,1.4,tau)*(1-sm(RECV-.3,RECV+.4,tau)),box:V3=[95,1,3];
 const P:V3=lerp3([bt[0]+3,1.2,bt[2]*.8],[bt[0]*.4+d[0]*.6+3,1.2,bt[2]*.4+d[1]*.6-2],both);
 const wide=1-sm(CUEW(0,'Inter against'),CUEW(0,'Dimarco wins'),t,easeInOutSine),T=lerp3(lerp3(P,[52.5,10,-10],wide),box,sm(CUEW(0,'he sets up')-.3,L-.2,t,easeInOutSine));
 const F=key(t,[[0,3500],[CUEW(0,'Inter against'),4200],[CUEW(0,'Dimarco wins'),6600],[CUEW(0,'crunching'),7200],[CUEW(0,'Denzel'),4300],[CUEW(0,'The pass'),4600],[CUEW(0,'clean through'),6200],[CUEW(0,'he sets up'),7000],[L,7600],[L+1.4,8600],[S,8800]],easeInOutSine);
 return look(CAM1,T,F);
}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),tau=tau1(t),tp=tau1(twos(t)),L=CUEW(0,'Lautaro'),goal=L+(IN_NET-SHOT);
  stadium(s,c,v,t,{roar:sm(goal,goal+.5,t),flash:sm(goal+.05,goal+.3,t)});
  ground(s,c,{bulge:bulgeAt(tau)});
  play(s,c,v,tau,tp,tau1(twos(t)-1/12),{minBall:9,after:()=>wonSpark(s,c,tau-TACK)});
 },
 aperture(t){const c=cam1(t),[x,z]=posOf(LAU,tau1(t)),q=toCam(c,[x,1,z]),g=scr(c,q),h=c.F*1.65/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.09),12);},
 still:9,
};

// ---------------------------------------------------------------- 2 · slow replay, raised camera behind Dumfries: the ball won, he goes, the space behind the defence
const tau2=(t:number)=>key(t,[[0,-1.1],[CUEW(1,'The moment'),-.45],[CUEW(1,'The moment')+1.2,TACK+.25],[CUEW(1,'Dumfries runs'),.9],[CUEW(1,'forward into'),1.9],[CUEW(1,'behind the'),3.2],[SECS(1),4.2]],linear);
function cam2(t:number):Cam{
 const tau=tau2(t),m=smooth(DUM,tau),mo=CUEW(1,'The moment'),dr=CUEW(1,'Dumfries runs'),across=1-sm(dr-.5,dr+.8,t,easeInOutSine);
 // behind him, outside the touchline and up: first looking across at the tackle, then swinging down the wing with his charge
 const C:V3=[m[0]-9,4.4,m[1]+8.5],tk=legAt(TACK).a;
 const Ta:V3=[lerp(m[0],tk[0],.62),.6,lerp(m[1],tk[2],.62)],Tb:V3=[m[0]+16,.4,m[1]-6];
 const T=lerp3(Tb,Ta,across);const F=lerp(1500,2500,across)+sm(mo,mo+1,t)*150*across;
 return look(C,T,F);
}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),tau=tau2(t),tp=tau2(twos(t)),mo=CUEW(1,'The moment'),dr=CUEW(1,'Dumfries runs'),fi=CUEW(1,'forward into'),bd=CUEW(1,'behind the'),E=SECS(1),fade=1-sm(E-.9,E-.5,t);
  stadium(s,c,v,t);
  ground(s,c);
  emptyGrass(s,c,sm(fi-.2,bd+.3,t)*fade);
  runLane(s,c,DUM,Math.max(TACK,tau-.6),RECV+.6,sm(dr-.2,bd+.6,t,easeInOutSine)*fade,.42);
  passArrow(s,c,legAt(THRU).a,legAt(THRU).b,sm(fi,bd+.4,t,easeOut)*fade,64);
  play(s,c,v,tau,tp,tau2(twos(t)-1/12),{minBall:5,hero:true,before:()=>backLine(s,c,tau,sm(bd-.3,bd+.3,t)*fade),after:()=>{
   ringOn(s,c,DIM,tau,sm(mo+.3,mo+.8,t,easeOutBack)*(1-sm(dr+.4,dr+.9,t)),91);
   wonSpark(s,c,tau-TACK);
   speedLines(s,c,DUM,tau,sm(dr-.1,dr+.4,t)*fade);}});
  streaks(s,v,1-sm(0,.5,t),21);
 },
 aperture(t){const c=cam2(t),[x,z]=posOf(DUM,tau2(t)),q=toCam(c,[x,1.2,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.16/q[2]),12);},
 still:3.6,
};

// ---------------------------------------------------------------- 3 · replay from behind the goal: the ball across, the finish, the net, the celebration
const tau3=(t:number)=>{const w=CUEW(2,'Inter won');return key(t,[[0,PASS-1.4],[CUEW(2,'an easy'),PASS+.05],[CUEW(2,'for Lautaro'),SHOT+.05],[w,IN_NET+.9],[SECS(2),IN_NET+.9+(SECS(2)-w)*.8]],linear);};
const swing3=(t:number)=>sm(CUEW(2,'Inter won')-.2,CUEW(2,'after extra')+.4,t,easeInOutSine);
function cam3(t:number):Cam{
 const tau=tau3(t),m=smooth(LAU,tau),u=swing3(t),e=sm(PASS-1,SHOT,tau,easeInOutSine);
 // behind the goal, a little to the left of it: the ball comes across from the right, Martínez meets it
 const C0:V3=[118,5.2,-5.5],T0:V3=[lerp(89,94,e),1.1,lerp(9,2,e)];
 const C1:V3=[m[0]+7,2.6,m[1]+9],T1:V3=[m[0]-.5,1.1,m[1]-.5];
 return look(lerp3(C0,C1,u),lerp3(T0,T1,u),lerp(2700+700*e,2900,u));
}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),tau=tau3(t),tp=tau3(twos(t)),ef=CUEW(2,'an easy'),fl=CUEW(2,'for Lautaro'),u=swing3(t);
  stadium(s,c,v,t,{roar:sm(IN_NET,IN_NET+.3,tau),flash:sm(IN_NET,IN_NET+.2,tau)*(1-sm(IN_NET+1,IN_NET+1.4,tau))});
  ground(s,c,{goalLater:u<.5});
  crossTrace(s,c,sm(ef-.2,fl,t,linear)*(1-sm(fl+.8,fl+1.3,t)));
  play(s,c,v,tau,tp,tau3(twos(t)-1/12),{minBall:5,hero:true,after:({lau,bg})=>{
   // the finish: a spark on his boot at contact, and on the net
   const age=tau-SHOT;if(lau&&age>-.05&&age<.3){const f=lau.joints.rToe??lau.joints.rAn;if(f)sparkBurst(s,Y,f[0],f[1],c.F*.5/Math.max(1,toCam(c,ballAt(SHOT))[2]),{n:8,seed:93,g:easeOutBack(clamp((age+.05)/.15))*(1-clamp((age-.18)/.12)),width:9});}
   if(bg&&tau>IN_NET&&tau<IN_NET+.12)sparkBurst(s,Y,bg[0],bg[1],60,{n:7,seed:90,width:8});}});
  if(u<.5)goal3(s,c,105,1,bulgeAt(tau),NET[2]);
  streaks(s,v,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3(t),[x,z]=posOf(LAU,tau3(t)),q=toCam(c,[x,1.25,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.16/q[2]),12);},
 still:4.2,
};

// ---------------------------------------------------------------- 4 · the lesson: a raised three-quarter camera behind him — ball won, sprint on the outside, the line stretches
const tau4=(t:number)=>key(t,[[0,-.9],[CUEW(3,'when'),-.3],[CUEW(3,'when')+1.1,TACK+.3],[CUEW(3,'sprint'),.8],[CUEW(3,'on the'),1.6],[CUEW(3,'stretch'),3],[SECS(3),4.1]],linear);
function cam4(t:number):Cam{
 const tau=tau4(t),m=smooth(DUM,tau),go=sm(CUEW(3,'sprint')-.3,CUEW(3,'stretch')+1,t,easeInOutSine);
 const C:V3=[m[0]-8+2*go,6.5-1.5*go,m[1]+8-1*go],T:V3=[m[0]+12+3*go,.3,m[1]-13-5*go];
 return look(C,T,1900+300*go);
}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),tau=tau4(t),tp=tau4(twos(t)),wt=CUEW(3,'when'),sf=CUEW(3,'sprint'),ot=CUEW(3,'on the'),st=CUEW(3,'stretch'),E=SECS(3),fade=1-sm(E-.9,E-.5,t);
  stadium(s,c,v,t);
  ground(s,c);
  emptyGrass(s,c,sm(ot-.1,ot+.8,t)*fade,60,90);
  runLane(s,c,DUM,Math.max(TACK,tau-.6),RECV+.6,sm(sf-.2,st+.6,t,easeInOutSine)*fade,.45);
  play(s,c,v,tau,tp,tau4(twos(t)-1/12),{minBall:5,hero:true,before:()=>backLine(s,c,tau,sm(st-.3,st+.3,t)*fade),after:()=>{
   ringOn(s,c,DIM,tau,sm(wt+.6,wt+1.1,t,easeOutBack)*(1-sm(sf+.3,sf+.8,t)),97);
   wonSpark(s,c,tau-TACK);
   gapArrow(s,c,CUB,INI,tau,sm(st+.1,st+.7,t,easeOut)*fade,98);
   speedLines(s,c,DUM,tau,sm(sf,sf+.4,t)*fade);}});
 },
 still:4.4,
};

const film:RisoStory={
 id:'dumfries-signature',format:'11v11',title:'Dumfries: The Wing-Back Charge',theme:'When your team wins the ball, sprint forward on the outside to stretch the defence',
 ageNote:'Champions League semi-final, second leg, Inter 4–3 Barcelona (after extra time), San Siro, Milan, 6 May 2025. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a kick of turf — grass bits and dust thrown up, a yellow touch spark. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}spray(s,x,y,age,seed,2.2);if(age<.35)sparkBurst(s,Y,x,y-20,110,{n:7,seed:seed+1,g:easeOutBack(clamp(age/.15))*(1-clamp((age-.2)/.15)),width:15});},
};
/** turf spray: green bits and red dust thrown from a point, ballistic, 0..1 s */
function spray(s:Sheet,x:number,y:number,age:number,seed:number,size=1){
 if(age<0||age>1)return;const r=rng(seed),a=new Path2D(),b=new Path2D(),u=easeOut(clamp(age/.7)),fl=Math.sin(Math.min(1,age/.8)*Math.PI);
 for(let i=0;i<14;i++){const ang=-Math.PI/2+(r()-.5)*2.2,d=(40+r()*170)*u*size,px=x+Math.cos(ang)*d,py=y+Math.sin(ang)*d*.5-fl*(30+r()*70)*size,z=(6+r()*9)*size,q:Pt[]=[[px-z,py-z*.4],[px+z*.6,py-z*.6],[px+z,py+z*.3],[px-z*.4,py+z*.5]];(i%3?a:b).addPath(polyPath(q,true));}
 const fade=1-clamp((age-.6)/.4);s.fill(R,b,.8*fade);s.fill(Y,a,.9*fade);s.tone(B,a,.6*fade);
}
export default film;
