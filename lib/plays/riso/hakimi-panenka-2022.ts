/** Achraf Hakimi's chipped ("Panenka") winning penalty — Morocco 0–0 Spain (Morocco won 3–0 on penalties), 2022 FIFA World Cup round of
 * 16, Education City Stadium, Al Rayyan, Qatar, 6 December 2022 — an iconic-play riso film (RisoStory, chapters mode) played by the card's
 * picture window (components/CardFilmPlayer.tsx) or StoryFilmPlayer. A 1:1 reconstruction of the kick and the celebration from WRITTEN
 * accounts (the footage itself was not reviewed), rendered as a riso print.
 *
 * SOURCES (read Sept 2026, cached in scratchpad/films/src-cache/):
 *  - Wikipedia, "2022 FIFA World Cup knockout stage" (Morocco vs Spain: 6 Dec 2022, 18:00 local, Education City Stadium, Al Rayyan, 44,667,
 *    referee Fernando Rapallini (Argentina); line-ups + numbers + subs; the shoot-out Sabiri ✓, Sarabia ✗ (post), Ziyech ✓, Soler ✗ (saved),
 *    Benoun ✗, Busquets ✗ (saved), Hakimi ✓ "via a panenka kick in the middle of the goal", 3–0; Morocco's first World Cup quarter-final;
 *    the kit boxes: Morocco red shirts, GREEN shorts, red socks; Spain the pale-blue away shirt, white shorts)
 *    https://en.wikipedia.org/wiki/2022_FIFA_World_Cup_knockout_stage
 *  - Wikipedia, "Achraf Hakimi" (born 4 Nov 1998 in Madrid to Moroccan parents; Morocco's right-back) https://en.wikipedia.org/wiki/Achraf_Hakimi
 *  - Wikipedia, "Panenka (penalty kick)" (lists Hakimi's in this shoot-out) https://en.wikipedia.org/wiki/Panenka_(penalty_kick)
 *  - BBC Sport, Shamoon Hafez, "Morocco 0-0 Spain (3-0 pens)", 6 Dec 2022 ("dinking his penalty - a 'Panenka' - straight down the middle";
 *    "Unai Simon was left watching"; Education City "filled mostly by Morocco fans"; drums, whistles; Bounou saved from Soler and Busquets)
 *    https://www.bbc.com/sport/football/63789751
 *  - The Guardian, Sid Lowe at Education City Stadium, 6 Dec 2022 ("Hakimi barely broke into a run, virtually walking up, and dinked gently
 *    into the net ... He shuffled a little dance and smiled. In front of him, fans exploded. Behind him, teammates sprinted his way. Together
 *    they made for Yassine Bounou, goalkeeper and hero who waited, arms wide"; Hakimi's was the seventh kick of the shoot-out)
 *    https://www.theguardian.com/football/2022/dec/06/morocco-spain-world-cup-last-16-match-report
 *  - CNN, 6 Dec 2022 ("chipping the ball gently into the middle of the goal"; mobbed by teammates and staff)
 *    https://www.cnn.com/2022/12/06/football/morocco-spain-qatar-world-cup-spt-intl
 *  - talkSPORT, "What is Achraf Hakimi's penguin celebration ..." (the 'penguin' waddle, an in-joke with PSG team-mates; "as soon as Unai
 *    Simon dived out of the way") https://talksport.com/football/world-cup/1270857/
 *  - AP report via search snippets ("waited for Spain goalkeeper Unai Simón to lunge to his right before lightly pushing the ball into the
 *    center of the goal"; also "Unai Simon dived to his right") — search results cached as ddg-simon-dive-en.html.
 * CONFIRMED by those accounts: date, stadium, 0–0 after extra time; Morocco led 2–0 when Hakimi took the seventh kick (Busquets had just
 *  been saved); a very short, almost walking run-up; a gentle chip down the middle; Unai Simón (23) dived to HIS RIGHT; Hakimi wore 2;
 *  Bounou (1) Morocco's keeper; Morocco red shirts, green shorts, red socks, Spain pale blue; a crowd mostly of Morocco fans; after the goal
 *  he did a little 'penguin' dance facing the fans while his teammates sprinted toward him; Bounou waited with arms wide.
 * INFERRED (illustrative): Hakimi's RIGHT foot (he is right-footed; the accounts don't name the foot, so the narration doesn't); the run-up
 *  angle (≈ 23° from his left) and length (≈ 3.4 m), every position and time in metres/seconds (flight ≈ 1.1 s, peak ≈ 1.6 m, crossing ≈ 1.25 m
 *  high just left of centre); the penguin waddle as drawn (stiff arms, flapping hands, rocking steps); the keeper kits (Simón navy, Bounou
 *  yellow — not narrated), the referee's navy kit, where the referee, the assistant and Bounou stood (Bounou at the penalty-area corner of the
 *  goal line, as the Laws require), which end the shoot-out used, the teammates' arm-in-arm line and their numbers in it (from the men on
 *  the pitch at the end), the shirt-number ink, Hakimi's short dark hair (beard not drawn), the camera placements, the stadium as drawn (a
 *  steep, compact two-tier bowl under a roof ring whose triangular facet band nods to the stadium's "diamond" pattern), the crowd colours
 *  and the Moroccan flags (red with a green star).
 *
 * FRAMING (the TV broadcast, never top-down; made distinct from the Pirlo and Totti Panenka films): ch1 = the high camera on the FAR side
 * (the goal on the LEFT of frame, the bowl full of red behind), REAL TIME: the packed bowl → the linked players in the centre circle →
 * Simón on his line → Hakimi walks to his mark → the short, slow run and the dink → the net; ch2 = the slow-motion replay from LOW AT PITCH
 * LEVEL beside the six-yard box (his run in profile from his kicking side; Simón goes to his right; a riso trail marks the loop); ch3 = the
 * celebration from the photographers' spot beside the goal: Hakimi's penguin dance in front of the fans, his teammates sprinting in from
 * the halfway line behind him, then the lens lifts to the red far end and its star flags; ch4 = the lesson: know your plan (a dashed yellow
 * loop drawn before he moves) → breathe (green rings) → trust it (the real ball rides the planned loop) → a calm mind (the jagged red noise
 * ring smooths). Composed on the FULL sheet (world units = sheet units centred on the canvas; never sheet.safe) and kept inside the central
 * ~1000 units, so it frames from the 1.45:1 card window down to square (a narrower window widens the lens a little). Figures: every body
 * goes through ONE adapter, drawPlayer() → athlete.ts (continuous silhouettes, FK skeleton, `prev` secondary motion, a motion smear on the
 * run, the dive and the sprint); small figures in wide shots and every figure inside a passage print at `low` detail. Handedness: the world
 * is right-handed (x toward Spain's goal, y up, +z = Hakimi's right), exactly athlete.ts's convention, so his RIGHT foot strikes with no
 * mirrored projector; Simón faces −x, so his right is −z.
 * Inks: yellow, red (Morocco), green (Morocco's shorts and star, the grass), navy — a different set from the blue Panenka films. Everything
 * is keyed to cue times (withTiming swaps in the recorded word onsets), poses on twos, cameras on ones; all randomness seeded.
 * Budget: ~150–330 plate ops per frame. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,polyPath,ribbon,partial,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,stand,keeperSet,keeperDive,celebrate,posed,blendPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES (≈2.7 words/s + punctuation pauses) until the Kokoro voice exists. Once the lead has generated
 * public/plays/narration/hakimi-panenka-2022/timing.json, add
 *   import timingJson from '../../../public/plays/narration/hakimi-panenka-2022/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues).
 * NB withTiming matches a cue by its FIRST word, in order — so no cue starts with a word that also appears between it and the previous cue. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'Penalties, live',text:'Qatar, 2022. Morocco lead Spain in the shootout. One more goal, and Morocco reach their first World Cup quarter-final. Achraf Hakimi steps up. He barely runs... and chips it down the middle. Goal!',tail:2.3,
  cues:['Qatar','Morocco lead','One more goal','first World Cup','Achraf Hakimi','barely runs','chips it','Goal']},
 {label:'Watch it again',text:'Watch it again, slowly. A short, calm run-up. The keeper dives, and the ball floats into the empty middle.',tail:1.6,
  cues:['Watch it again','short, calm','The keeper dives','the ball floats','empty middle']},
 {label:'The penguin dance',text:'Hakimi does a funny penguin dance! His teammates sprint to join him, and the fans go wild.',tail:2,
  cues:['Hakimi does','penguin dance','His teammates','fans go wild']},
 {label:'The secret',text:'The secret? Know your plan before you step up. Then breathe, trust it, and keep a calm mind under pressure.',tail:1.9,
  cues:['The secret','Know your plan','breathe','trust it','calm mind']},
];
import timingJson from '../../../public/plays/narration/hakimi-panenka-2022/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , . ! ? : ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('hakimi: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('hakimi: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
/** key() needs increasing times: push each key at least `gap` after the previous one (real voice timings can crowd authored offsets) */
function mono(K:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of K)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}

// ---------------------------------------------------------------- inks, vectors
const Y='yellow',R='red',G='green',K='navy';
const add3=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const mix3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const wrap=(a:number)=>{while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;return a;};
const lerpAng=(a:number,b:number,u:number)=>a+wrap(b-a)*u;
/** yaw (athlete.ts convention: 0 faces +x, + turns left) that faces from (x,z) toward (x2,z2) */
const yawTo=(x:number,z:number,x2:number,z2:number)=>Math.atan2(-(z2-z),x2-x);
/** a narrower (square) window gets a slightly wider lens so the action still fits; set by frame(), read by every camera */
let LENS=1;
/** Frame the FULL sheet: world (0,0) on the canvas centre at 1 unit per sheet unit (the passage arrival scale still multiplies in). */
function frame(s:Sheet){const S=s.arrival;s.camera((s.cx-s.W/2)/S,(s.cy-s.H/2)/S,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
/** half the visible extents with margin for the .68 passage preview */
const view=(s:Sheet)=>({hx:s.W/(2*.68)+120,hy:s.H/(2*.68)+120});

// ---------------------------------------------------------------- 3D: projection through an athlete.ts Camera (right-handed metres, y up)
/** Pitch: Spain's goal line is x = 0 (the kick goes +x), the goal centre z = 0, +z = Hakimi's right. */
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

// ---------------------------------------------------------------- Education City Stadium at night: a steep compact bowl, a red crowd, the facet roof ring
/** stand planes (a along, b up the rake 0..1), close to the pitch (no running track): 0 the near side for ch1 (z<0, where the ch1 gantry
 * hangs), 1 behind Spain's goal (x>0), 2 the far side (z>0), 3 the far end */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-113,8,a),1.4+30*b,-40-28*b],
 (a,b)=>[8+28*b,1.4+30*b,lerp(-54,54,a)],
 (a,b)=>[lerp(8,-113,a),1.4+30*b,40+28*b],
 (a,b)=>[-113-28*b,1.4+30*b,lerp(54,-54,a)],
];
const STAND_COLS=[112,80,112,80],STAND_ROWS=15,WALK=.45;
/** flags on the stand fronts: [stand, a, kind] kind 0 = Morocco (red, green star), 1 = Spain (red | yellow | red) */
const FLAGS:[number,number,number][]=[[1,.2,0],[1,.36,0],[1,.52,0],[1,.7,0],[1,.84,1],[2,.12,0],[2,.26,0],[2,.44,1],[2,.6,0],[2,.78,0],[3,.25,0],[3,.4,0],[3,.58,0],[3,.74,0],[0,.3,0],[0,.6,0]];
/** a five-point star outline (the Moroccan flag's green pentagram) through a flag's (u,v) parameter space */
function starPts(P:(u:number,v:number)=>V3,c:Cam,asp:number):Pt[]{const out:Pt[]=[];for(let k=0;k<5;k++){const i=(k*2)%5,a=-Math.PI/2+i*TAU/5,p=pr(c,P(.5+Math.cos(a)*.26/asp,.52+Math.sin(a)*.26));if(p)out.push(p);}return out;}
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t),Bnd=Math.max(s.W,s.H)*2;
 // a Gulf night under the roof: a deep green screen, navy over it, darker high up
 s.field(G,.42,.6);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]))?.[1]??0;
 s.tone(K,polyPath([[-Bnd,-Bnd],[Bnd,-Bnd],[Bnd,Bnd],[-Bnd,Bnd]],true),.5);
 s.tone(K,polyPath([[-Bnd,-Bnd],[Bnd,-Bnd],[Bnd,hz-560],[-Bnd,hz-460]],true),.3);
 const planes=new Path2D(),walk=new Path2D(),roof=new Path2D(),facet=new Path2D(),edge=new Path2D();
 for(const i of which){const S=STANDS[i],q=polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]);addPoly(planes,q);
  seg3(c,S(0,WALK),S(1,WALK),.5,walk);
  // the roof ring cantilevered over the stands; along its inner lip a band of triangular facets (the "diamond" motif)
  const lip=(a:number,dy=0)=>add3(S(a,.3),[0,24.5+dy,0]);
  addPoly(roof,polyP(c,[add3(S(0,1),[0,2,0]),add3(S(1,1),[0,2,0]),lip(1,.2),lip(0,.2)]));
  const n=18;for(let k=0;k<n;k++){const a0=k/n,a1=(k+1)/n,am=(a0+a1)/2;addPoly(facet,polyP(c,[lip(a0),lip(a1),lip(am,-3.4)]));}
  seg3(c,lip(0,-3.5),lip(1,-3.5),.4,edge);}
 s.knockout(planes);s.tone(K,planes,.5);s.tone(R,planes,.3);s.knockout(walk,.4);
 // the crowd: seeded dots (Morocco red above all, white, green; a little Spanish yellow), sized by distance; roar lifts them
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(Math.abs(b-WALK)<.04)continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,5);if(h<.22)continue;const a=(i+.5+(hash(i+j*31,9)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.68/q[2],3,19),lift=roar>0?roar*z*1.4*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const ink=h<.66?0:h<.8?1:h<.94?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.fill(R,inks[0],.95);s.knockout(inks[1],.75);s.fill(G,inks[2],.95);s.fill(Y,inks[3],.95);
 s.knockout(roof);s.tone(K,roof,.66);s.tone(G,roof,.3);
 s.knockout(facet,.8);s.tone(Y,facet,.45);s.fill(K,edge,.85);
 // flags on the stand fronts
 const fl=new Path2D(),red=new Path2D(),yel=new Path2D(),star=new Path2D();
 for(const[si,a,kind] of FLAGS){if(!which.includes(si))continue;const S=STANDS[si],w=.032,P=(u:number,vv:number)=>add3(S(a+u*w,.02),[0,2.6*(1-vv),0]);
  const q=polyP(c,[P(0,1),P(1,1),P(1,0),P(0,0)]);if(q.length<3)continue;fl.addPath(polyPath(q,true));
  if(kind===0){red.addPath(polyPath(q,true));const sp=starPts(P,c,1.3);if(sp.length===5)star.addPath(ribbon(sp,Math.max(1.2,kAt(c,P(.5,.5))*.07),{close:true,taper:0,wobble:0}));}
  else{addPoly(red,polyP(c,[P(0,1),P(1,1),P(1,.75),P(0,.75)]));addPoly(red,polyP(c,[P(0,.25),P(1,.25),P(1,0),P(0,0)]));addPoly(yel,polyP(c,[P(0,.75),P(1,.75),P(1,.25),P(0,.25)]));}}
 s.knockout(fl);s.fill(R,red,.95);s.fill(Y,yel,.95);s.fill(G,star,.95);
 // LED lamps under the roof lip, a soft yellow wash under them
 const lamp=new Path2D();for(const i of which){const S=STANDS[i];for(let k=0;k<8;k++){const u=(k+.5)/8,a=add3(S(u-.025,.3),[0,20.6,0]),b=add3(S(u+.025,.3),[0,20.6,0]);if(toCam(c,a)[2]<NEAR+2)continue;seg3(c,a,b,1,lamp);}}
 s.knockout(lamp);s.fill(Y,lamp,.8);
 if(flash>0){const p=new Path2D(),n=Math.round(24*flash);for(let i=0;i<n;i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,STANDS[si](r2,.1+.8*hash(i,Math.floor(tt*12))));if(!q)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
// ---------------------------------------------------------------- grass, lines, boards, the goal
function ground(s:Sheet,c:Cam,o:{bulge?:number;goal?:boolean}={}){
 // the dark surround, then the grass (yellow × green under the lights)
 const sur=polyP(c,[[-112,0,-40],[8,0,-40],[8,0,40],[-112,0,40]]);if(sur.length<3)return;const sp=polyPath(sur,true);
 s.knockout(sp);s.tone(G,sp,.55);s.tone(K,sp,.42);
 const g=polyP(c,[[-110,0,-38],[5.5,0,-38],[5.5,0,38],[-110,0,38]]),gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.92);s.tone(G,gp,.84);s.tone(K,gp,.1);
 // mowing stripes across the width, every 5.25 m
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]));s.tone(K,st,.13);
 // LED boards behind the goal and along both touchlines: navy with red panels
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([5.5,0,-36],[5.5,0,36]);board([-108,0,-37.5],[5.5,0,-37.5]);board([-108,0,37.5],[5.5,0,37.5]);
 for(let k=0;k<11;k++){const z=-34+k*6.3;addPoly(pn,polyP(c,[[5.4,.25,z],[5.4,.25,z+3.4],[5.4,.7,z+3.4],[5.4,.7,z]]));}
 for(const zz of[-37.4,37.4])for(let k=0;k<17;k++){const x=-106+k*6.4;addPoly(pn,polyP(c,[[x,.25,zz],[x+3.4,.25,zz],[x+3.4,.7,zz],[x,.7,zz]]));}
 s.knockout(bd);s.fill(K,bd,.9);s.fill(R,pn,.9);
 // painted lines
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
 for(let k=0;k<8;k++){L([-k*13.125,0,-34],[-(k+1)*13.125,0,-34]);L([-k*13.125,0,34],[-(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){L([0,0,-34+k*17],[0,0,-34+(k+1)*17]);L([-52.5,0,-34+k*17],[-52.5,0,-34+(k+1)*17]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(-52.5,0,9.15);
 L([0,0,-20.16],[-16.5,0,-20.16]);L([-16.5,0,-20.16],[-16.5,0,20.16]);L([-16.5,0,20.16],[0,0,20.16]);
 L([0,0,-9.16],[-5.5,0,-9.16]);L([-5.5,0,-9.16],[-5.5,0,9.16]);L([-5.5,0,9.16],[0,0,9.16]);
 {const a=Math.acos(5.5/9.15);circ(-11,0,9.15,Math.PI-a,Math.PI+a,12);}
 {const d:V3[]=[];for(let i=0;i<12;i++){const a=i/12*TAU;d.push([-11+Math.cos(a)*.15,0,Math.sin(a)*.15]);}addPoly(ln,polyP(c,d));}
 s.knockout(ln);
 if(o.goal!==false)goal3(s,c,o.bulge??0);
}
/** the goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep with a sloping roof; bulge pushes the back out round the middle (z −.1) */
function goal3(s:Sheet,c:Cam,bulge:number){
 const X=0,z0=-3.66,z1=3.66,H=2.44,bz=-.1,back=(z:number)=>X+2+bulge*.55*Math.exp(-Math.pow((z-bz)/1.6,2));
 const zs=[z0,-2.4,-1.2,0,1.2,2.4,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0),1.9,z0],[back(z0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1),1.9,z1],[back(z1),0,z1]],
  [[X,H,z0],[X,H,z1],...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)],
  [...zs.map(z=>[back(z),0,z] as V3),...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.32);s.tone(K,net,.1);
 const mesh=new Path2D();
 for(let i=0;i<=14;i++){const z=lerp(z0,z1,i/14);seg3(c,[X,H,z],[back(z),1.9,z],.022,mesh,.7);seg3(c,[back(z),1.9,z],[back(z),0,z],.022,mesh,.7);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<zs.length-1;i++)seg3(c,[back(zs[i]),y,zs[i]],[back(zs[i+1]),y,zs[i+1]],.022,mesh,.7);seg3(c,[X,y*H/1.9,z0],[back(z0),y,z0],.022,mesh,.7);seg3(c,[X,y*H/1.9,z1],[back(z1),y,z1],.022,mesh,.7);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+2*u,H-.54*u,z0],[X+2*u,H-.54*u,z1],.022,mesh,.7);}
 s.fill(K,mesh,.7);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.2,fo);seg3(c,[X,0,z1],[X,H,z1],.2,fo);seg3(c,[X,H,z0-.04],[X,H,z1+.04],.2,fo);
 s.fill(K,fo,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- the kick on one clock τ (seconds; τ = 0 is the contact)
/** the ball on the spot, 11 m out */
const B0:V3=[-11,.11,0];
const DXG=-B0[0];
/** the dink: a soft, fairly low loop down the middle — peak ≈ 1.6 m, crossing the line ≈ 1.25 m high, a touch left of centre (−z) */
const [HA,HB]=(()=>{const dp=7.2,yl=1.25-.11;const b=yl/(2*dp*DXG-DXG*DXG);return[2*dp*b,b];})();
const ZL=-.12;
const flight=(d:number):V3=>[B0[0]+d,.11+HA*d-HB*d*d,B0[2]+ZL*d/DXG];
const FLY=1.1;// "dinked gently": ≈ 36 km/h off the boot, easing a little
const dAt=(tau:number)=>{const u=clamp(tau/FLY);return DXG*u*(1.22-.22*u);};
const GOAL_PT=flight(DXG),NET_HIT:V3=[1.7,1.0,-.14],REST:V3=[1.3,.11,-.12],IN_NET=FLY+.22;
function ballAt(tau:number):V3{
 if(tau<=0)return B0;
 if(tau<FLY)return flight(dAt(tau));
 if(tau<IN_NET)return mix3(GOAL_PT,NET_HIT,easeOut((tau-FLY)/(IN_NET-FLY)));
 const u=clamp((tau-IN_NET)/.5),h=NET_HIT[1]*(1-u*u)+.11*u*u,b=u>=1?.1*Math.abs(Math.sin((tau-IN_NET-.5)*9))*Math.exp(-(tau-IN_NET-.5)*3.5):0;
 return[lerp(NET_HIT[0],REST[0],u),Math.max(.11,h)+b,lerp(NET_HIT[2],REST[2],u)];
}
/** ball spin (panel rotation): a gentle backspin off the dink */
const spinAt=(tau:number)=>tau<=0?0:-TAU*2.6*Math.min(tau,IN_NET)-TAU*1.1*Math.max(0,tau-IN_NET);
const bulgeAt=(tau:number)=>tau<IN_NET-.03?0:.7*Math.exp(-(tau-IN_NET+.03)*2.6)*(1+.3*Math.sin((tau-IN_NET)*12));

// ---------------------------------------------------------------- the cast: kits (athlete.ts styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.28],[K,.06]],SKIN_T:InkFill[]=[[Y,.46],[R,.34],[K,.12]];
/** Morocco: red shirts, GREEN shorts, red socks (the kit box), green trim, white numbers */
const morocco=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[R,.93],shorts:[G,.92],socks:[R,.93],boots:K,skin:SKIN_M,hair:K,line:K,trim:[G,.9],numberInk:'paper',hairStyle:'short',...o});
/** Spain: the pale-blue away shirt (a light navy screen in this ink set), white shorts */
const spain=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[K,.22],shorts:'paper',socks:[K,.22],boots:K,skin:SKIN_L,hair:K,line:K,trim:[R,.8],numberInk:[K,.85],hairStyle:'short',shade:[K,.24],...o});
const HAKIMI_B={height:1.81,bulk:.95};
const HAKIMI_ST=morocco({number:2,hairStyle:'short',hair:[K,.95],skin:SKIN_T,build:HAKIMI_B,seed:2});
const SIMON_ST:AthleteStyle={shirt:[K,.8],shorts:[K,.8],socks:[K,.8],boots:K,skin:SKIN_L,hair:[K,.9],line:K,trim:Y,gloves:'paper',sleeves:'long',hairStyle:'short',number:23,numberInk:Y,build:{height:1.9,bulk:1.02},seed:23};
const BOUNOU_ST:AthleteStyle={shirt:[Y,.95],shorts:[Y,.95],socks:[Y,.95],boots:K,skin:SKIN_M,hair:K,line:K,trim:[G,.9],gloves:'paper',sleeves:'long',hairStyle:'bald',number:1,numberInk:[G,.9],build:{height:1.95},seed:1};
const REF_ST:AthleteStyle={shirt:[K,.88],shorts:[K,.88],socks:[K,.88],boots:K,skin:SKIN_L,hair:K,line:K,trim:Y,hairStyle:'short',build:{height:1.8},seed:30};

// ---------------------------------------------------------------- Hakimi: the walk to his mark, the calm wait, the almost-walking run, the dink, the penguin dance
/** approach from the LEFT of the ball (≈ 23°), so the right foot comes through straight behind it */
const DIRN=Math.hypot(1,.42),DIR:[number,number]=[1/DIRN,.42/DIRN];
const YAW_H=yawTo(0,0,DIR[0],DIR[1]);
const SD=1.0,RUN_END=-STRIKE_CONTACT*SD,T_RUN0=-1.95,RUN_L=2.3,STRIKE_L=1.1,G_MARK=-(RUN_L+STRIKE_L),G_BALL=-.35;
const CHIP=.25;// strike power: a short backswing, a dink under the ball, a short follow-through
/** where Hakimi's pelvis stands at contact so the toe of his RIGHT boot slides in under the back of the ball (solved once, FK) */
const PC:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{power:CHIP}),HAKIMI_B,{x:0,z:0,yaw:YAW_H}),toe:[number,number]=[B0[0]-DIR[0]*.1,B0[2]-DIR[1]*.1];return[toe[0]-sk.rToe[0],toe[1]-sk.rToe[2]];})();
const gPos=(g:number):[number,number]=>[PC[0]+DIR[0]*g,PC[1]+DIR[1]*g];
const P_PLACE=posed({lHipF:70,rHipF:40,lKnee:100,rKnee:60,lean:40,pitch:12,neckP:30,lShF:62,rShF:66,lElb:18,rElb:20,lShA:14,rShA:12,lHand:.8,rHand:.8});
/** at his mark: upright, loose, still — eyes on the keeper */
const P_WAIT=posed({lHipF:-2,rHipF:8,lKnee:10,rKnee:14,lean:3,pitch:1,neckP:-4,lShA:10,rShA:10,lShF:0,rShF:2,lElb:14,rElb:16});
const P_GO=posed({lHipF:-12,rHipF:18,lKnee:20,rKnee:26,lAnk:10,rAnk:-4,lean:10,pitch:3,neckP:6,lShA:16,rShA:16,lShF:-8,rShF:10,lElb:30,rElb:34,twist:-6});
/** a walk: the slowest run cycle, short stride, low arms */
const walkPose=(ph:number)=>{const p=blendPose(runCycle(ph,{speed:0,stride:.55}),P_WAIT,.35);p.air=0;return p;};
/** the penguin waddle: body stiff and upright, arms straight down and a little out with the hands flapping, rocking side to side on
 * short stiff-legged steps with the toes turned out (inferred from "he shuffled a little dance" and the 'penguin' reports) */
function penguin(it:number):Pose{const w=Math.sin(it*TAU*2),fl=Math.abs(Math.sin(it*TAU*4)),up=Math.max(0,w),dn=Math.max(0,-w);
 return posed({roll:11*w,bend:-6*w,lean:-2,pitch:-2,neckP:-10,neckY:6*w,lShA:18+26*fl,rShA:18+26*fl,lShF:-4,rShF:-4,lElb:4,rElb:4,lHand:1,rHand:1,
  lHipF:10*dn,rHipF:10*up,lKnee:6+14*dn,rKnee:6+14*up,lHipA:6+5*up,rHipA:6+5*dn,lHipR:26,rHipR:26,lAnk:-6,rAnk:-6,air:.03*Math.abs(w),squash:-.03*fl});}
/** the dance starts as the ball settles; the mob arrives from the halfway line (see mates) */
const T_DANCE=IN_NET+.25,T_GO=IN_NET+.3,T_MOB=IN_NET+5.1;
const runU=(tau:number)=>clamp((tau-T_RUN0)/(RUN_END-T_RUN0));
/** the run: g along the approach, barely faster than a walk, easing over the last steps */
function runG(tau:number){const u=runU(tau);return G_MARK+RUN_L*(1.18*u-.18*u*u);}
function hakimiPose(tau:number,walk=1,it=0):Pose{
 if(tau<=T_RUN0){
  if(walk<1){const u=walk;if(u<.12)return blendPose(P_PLACE,stand(),sm(0,.12,u));
   const d=Math.abs(G_MARK-G_BALL)*sm(.12,.82,u,linear);let p=walkPose(d*.72);if(u>.82)p=blendPose(p,P_WAIT,sm(.82,1,u));return p;}
  const br=.5+.5*Math.sin(it*1.9),p=blendPose(P_WAIT,P_GO,sm(T_RUN0-.3,T_RUN0,tau));p.lean+=.02*br;p.neckP+=.03*br;return p;}
 if(tau<RUN_END){const u=runU(tau);return blendPose(P_GO,blendPose(runCycle(1.7*u,{speed:.12,stride:.75}),P_WAIT,.12),sm(0,.2,u));}
 const us=STRIKE_CONTACT+tau/SD,run=runCycle(1.7+(tau-RUN_END)*1.3,{speed:.15});
 let p=blendPose(run,strike(Math.min(1,us),{power:CHIP}),sm(RUN_END,RUN_END+.14,tau));
 // the dink: toe under the ball, the body upright, a short checked follow-through
 const lo=sm(RUN_END,-.02,tau)*(1-sm(.1,.4,tau));p.lean-=.1*lo;p.neckP+=.12*lo;p.rAnk-=.35*sm(-.2,0,tau)*(1-sm(.15,.4,tau));
 if(tau>0)p.rHipF*=1-.35*sm(0,.25,tau);
 if(tau>.5)p=blendPose(p,P_WAIT,sm(.5,1,tau));
 if(tau>T_DANCE-.2)p=blendPose(p,penguin(tau-T_DANCE),sm(T_DANCE-.2,T_DANCE+.25,tau));
 // the mob arrives: he jumps with them
 if(tau>T_MOB-.3)p=blendPose(p,celebrate((tau-T_MOB)*.9,{kind:'arms'}),sm(T_MOB-.3,T_MOB+.2,tau));
 return p;
}
const H_END=gPos(.45);
function hakimiPlace(tau:number,walk=1):Place{
 if(tau<=T_RUN0){
  if(walk<1){const u=walk,g=lerp(G_BALL,G_MARK,sm(.12,.82,u,linear)),[x,z]=gPos(g);
   return{x,z,yaw:u<.12?YAW_H:lerpAng(lerpAng(YAW_H,YAW_H+Math.PI,sm(.08,.2,u)),YAW_H+TAU,sm(.8,1,u))};}
  const[x,z]=gPos(G_MARK);return{x,z,yaw:YAW_H};}
 let g:number;
 if(tau<RUN_END)g=runG(tau);
 else if(tau<0){const v=(tau-RUN_END)/-RUN_END;g=-STRIKE_L+STRIKE_L*(.6*v+.4*(1-(1-v)*(1-v)));}
 else g=.45*(1-Math.pow(1-clamp(tau/.6),2));
 let[x,z]=gPos(g);
 // the dance shuffles him a little toward the fans behind the goal, rocking side to side
 const d=sm(T_DANCE,T_DANCE+3,tau);x+=.9*d;z+=.12*Math.sin((tau-T_DANCE)*TAU*.5)*sm(T_DANCE,T_DANCE+.4,tau);
 return{x,z,yaw:lerpAng(YAW_H,0,sm(.5,1.2,tau,easeInOutSine))};
}

// ---------------------------------------------------------------- Simón: set on his line, then the dive to his right
const T_DIVE=-.2,DIVE_S=1.15,SIMON_X=-.1;
function simonAt(tau:number,it:number):{pose:Pose;place:Place}{
 let p=keeperSet(it*1.2);
 if(tau>T_DIVE-.4)p=blendPose(p,keeperSet(.75),sm(T_DIVE-.4,T_DIVE,tau));
 if(tau>T_DIVE)p=blendPose(p,keeperDive(clamp((tau-T_DIVE)/DIVE_S),{side:'r',height:.35}),sm(T_DIVE,T_DIVE+.06,tau));
 // on the ground he lifts his head to look back at the ball in the net ("left watching")
 if(tau>1.1)p.neckP-=.55*sm(1.1,1.6,tau);
 return{pose:p,place:{x:SIMON_X,z:.1*Math.sin(it*1.3)*(1-sm(T_DIVE-.4,T_DIVE,tau)),yaw:Math.PI}};
}

// ---------------------------------------------------------------- everyone else
type Role='bounou'|'ref'|'ar'|'mar'|'esp';
type Actor={name:string;role:Role;st:AthleteStyle;x:number;z:number;phase:number;tx?:number;tz?:number;delay?:number};
/** the players arm in arm in the centre circle (Morocco nearer the ch1 camera side, Spain beyond); Morocco's then sprint to Hakimi */
const LINE:Actor[]=[];
{const mar=[[4,'curly'],[6,'bald'],[7,'short'],[11,'short'],[16,'short'],[21,'short'],[24,'short'],[25,'short'],[18,'short']] as [number,string][],
  esp=[[5,'short'],[16,'short'],[24,'short'],[26,'curly'],[19,'short'],[22,'short']] as [number,string][];
 mar.forEach(([n,h],i)=>{const ang=Math.PI*(.3+.4*(i/(mar.length-1)))+Math.PI/2;LINE.push({name:'Morocco '+n,role:'mar',st:morocco({number:n,hairStyle:h as AthleteStyle['hairStyle'],build:{height:1.78+.03*(i%3)},seed:40+i,skin:i%3===1?SKIN_T:SKIN_M,detail:'low'}),
  x:-52.5+.25*(i%2),z:-5.8+i*.6,phase:i*.23,tx:H_END[0]+.9+Math.cos(ang)*(1.1+.45*(i%3)),tz:H_END[1]+Math.sin(ang)*(1.1+.45*(i%3))*1.6,delay:.12*i});});
 esp.forEach(([n,h],i)=>LINE.push({name:'Spain '+n,role:'esp',st:spain({number:n,hairStyle:h as AthleteStyle['hairStyle'],build:{height:1.8+.03*(i%2)},seed:60+i,detail:'low'}),x:-52.5-.25*(i%2),z:.4+i*.62,phase:i*.31}));}
const ACTORS:Actor[]=[
 {name:'Bounou',role:'bounou',st:BOUNOU_ST,x:-.4,z:-20.6,phase:.2},
 {name:'Rapallini',role:'ref',st:REF_ST,x:-8,z:-10.5,phase:.6},
 {name:'assistant',role:'ar',st:{...REF_ST,seed:31},x:.5,z:-9.3,phase:.1},
 ...LINE,
];
const LINKED=posed({lShA:26,rShA:26,lShF:-6,rShF:-6,lElb:12,rElb:12,lHipF:6,rHipF:6,lKnee:10,rKnee:10,lean:6,neckP:4});
const SLUMP=posed({lHipF:30,rHipF:30,lKnee:36,rKnee:36,lean:34,pitch:6,neckP:30,lShA:14,rShA:14,lShF:24,rShF:24,lElb:20,rElb:20});
/** Bounou "waited, arms wide" */
const WIDE=posed({lShA:92,rShA:92,lShF:4,rShF:4,lElb:6,rElb:6,lHand:1,rHand:1,lHipF:8,rHipF:8,lKnee:12,rKnee:12,lHipA:10,rHipA:10,lean:-6,neckP:-18});
const SPRINT=8;// m/s
/** one actor's pose + place at τ (it = idle clock) */
function actorAt(a:Actor,tau:number,it:number):{pose:Pose;place:Place}{
 const toBall=yawTo(a.x,a.z,B0[0],B0[2]),br=Math.sin(it*2.1+a.phase*TAU),goal=sm(IN_NET-.1,IN_NET+.3,tau);
 switch(a.role){
  case 'bounou':{let p=blendPose(stand(),LINKED,.3+.1*br);if(goal>0)p=blendPose(p,WIDE,goal);return{pose:p,place:{x:a.x,z:a.z,yaw:lerpAng(yawTo(a.x,a.z,-11,0),yawTo(a.x,a.z,H_END[0],H_END[1]),goal)}};}
  case 'ref':{const p=blendPose(stand(),LINKED,.2+.1*br);return{pose:p,place:{x:a.x,z:a.z,yaw:yawTo(a.x,a.z,0,0)}};}
  case 'ar':{const p=blendPose(stand(),LINKED,.2);return{pose:p,place:{x:a.x,z:a.z,yaw:yawTo(a.x,a.z,-11,0)}};}
  case 'mar':{
   const tx=a.tx??a.x,tz=a.tz??a.z,L=Math.hypot(tx-a.x,tz-a.z),t0=T_GO+(a.delay??0),d=Math.max(0,tau-t0),dist=Math.min(L,SPRINT*Math.max(0,d-.3*(1-Math.exp(-d/.3))));
   if(tau<t0){let p=blendPose(LINKED,stand(),.2+.1*br);if(goal>0)p=blendPose(p,celebrate(it*.9+a.phase,{kind:'arms'}),goal);return{pose:p,place:{x:a.x,z:a.z,yaw:toBall}};}
   const u=dist/L,x=lerp(a.x,tx,u),z=lerp(a.z,tz,u),arrived=sm(L-1.5,L,dist);
   let p=runCycle(dist*.19+a.phase,{speed:1});p=blendPose(p,celebrate(it*.95+a.phase,{kind:'arms'}),arrived);
   return{pose:p,place:{x,z,yaw:yawTo(a.x,a.z,tx,tz)}};}
  default:{let p=blendPose(LINKED,stand(),.2+.1*br);if(goal>0)p=blendPose(p,SLUMP,goal*.8);return{pose:p,place:{x:a.x,z:a.z,yaw:toBall}};}
 }
}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the pose one drawn frame earlier (secondary
 * motion: hair/hem trail), smear = halftone echo + speed lines on fast limbs (the run, the strike, the dive, the sprint). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:{pose:Pose;place:Place},smear=false){
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
}

// ---------------------------------------------------------------- the ball
function drawBall(s:Sheet,c:Cam,tau:number,o:{min?:number;lines?:boolean;prev?:number}={}){
 const P=ballAt(tau),q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??18,c.F*.11/q[2]);
 const sh:Pt[]=[];const rad=.16+P[1]*.05;for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*1.3,0,P[2]+Math.sin(a)*rad]);if(p)sh.push(p);}
 if(sh.length>8)s.tone(K,polyPath(sh,true),clamp(.5-P[1]*.15,.1,.5));
 if(o.lines&&o.prev!==undefined&&tau>0&&tau<IN_NET){const a=pr(c,ballAt(o.prev));if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.8)speedLines(s,K,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:3,seed:7,len:Math.min(200,d*1.2),spread:r*.8,width:Math.max(2.5,r*.16),cov:.75});}}
 footballPanels(s,g[0],g[1],r,{rot:spinAt(tau),key:K,shadow:G,seed:5});
 return{g,r,d:q[2]};
}
/** the flown path from τa to τb as projected points */
function pathPts(c:Cam,ta:number,tb:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<=n;i++){const p=pr(c,ballAt(lerp(ta,tb,i/n)));if(p)out.push(p);}return out;}

// ---------------------------------------------------------------- one frame of the world through a camera
type Env={it:number;walk?:number;smear?:boolean;minBall?:number;lines?:boolean;prevT?:number;hero?:'high'|'mid';line?:boolean};
/** everything on the pitch, depth-sorted (far first): the players at τp (poses on twos), their previous drawn pose, the ball at τ.
 * Heat: small figures print at `low` detail; inside a passage every figure is capped (the outgoing scene is zoomed past the camera). */
function play(s:Sheet,c:Cam,tau:number,tp:number,tpPrev:number,e:Env){
 const v=view(s),items:{d:number;draw:()=>void}[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending;
 const visible=(pl:Place,h=1.8)=>{const q=toCam(c,[pl.x??0,.9,pl.z??0]);if(q[2]<1)return -1;const g=scr(c,q),k=c.F/q[2]*h;return Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k?-1:q[2];};
 const detailFor=(st:AthleteStyle,d:number,hero:boolean):AthleteStyle=>{const px=c.F*1.8/d*ppu;if(passing)return{...st,detail:hero?'mid':'low'};if(!hero&&px<120)return{...st,detail:'low'};if(hero&&e.hero==='mid'&&px>170)return{...st,detail:'mid'};return st;};
 const walk=e.walk??1;
 {const pl=hakimiPlace(tp,walk),d=visible(pl);if(d>0)items.push({d,draw:()=>{const pose=hakimiPose(tp,walk,e.it),prev={pose:hakimiPose(tpPrev,walk,e.it-1/12),place:hakimiPlace(tpPrev,walk)};
  drawPlayer(s,pose,c,detailFor(HAKIMI_ST,d,true),pl,prev,!!e.smear&&tp>T_RUN0+.2&&tp<.4);}});}
 {const cur=simonAt(tp,e.it),d=visible(cur.place);if(d>0)items.push({d,draw:()=>{const prev=simonAt(tpPrev,e.it-1/12);drawPlayer(s,cur.pose,c,detailFor(SIMON_ST,d,true),cur.place,prev,!!e.smear&&tp>T_DIVE&&tp<.7);}});}
 for(const a of ACTORS){if(!e.line&&a.role==='esp')continue;if(!e.line&&a.role==='mar'&&tp<T_GO)continue;const cur=actorAt(a,tp,e.it),d=visible(cur.place);if(d<0)continue;
  items.push({d,draw:()=>{const prev=actorAt(a,tpPrev,e.it-1/12);drawPlayer(s,cur.pose,c,detailFor(a.st,d,false),cur.place,prev,!!e.smear&&a.role==='mar'&&tp>T_GO&&tp<T_MOB);}});}
 const bq=toCam(c,ballAt(tau));if(bq[2]>=NEAR)items.push({d:bq[2],draw:()=>{drawBall(s,c,tau,{min:e.minBall,lines:e.lines,prev:e.prevT});}});
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
/** steps: [start, duration, shot]; each step eases in over the previous result */
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
const pxz=(tau:number,walk=1):V3=>{const p=hakimiPlace(tau,walk);return[p.x??0,0,p.z??0];};

// ---------------------------------------------------------------- 1 · live: the high far-side camera, real time (the goal on the LEFT of frame)
/** contact lands so the ball drops into the net just after "Goal" — but never before he has had time to settle after "barely runs" */
const tS1=()=>Math.max(CUE(0,'Goal')-IN_NET+.15,CUE(0,'barely runs')+.2-T_RUN0);
const tau1=(t:number)=>Math.max(T_RUN0-4,t-tS1());
/** the walk back to his mark: from just after "Achraf Hakimi" until before the run */
const walk1=(t:number)=>{const a=CUE(0,'Achraf Hakimi')+.2,b=Math.max(a+.8,Math.min(a+3,tS1()+T_RUN0-.9));return sm(a,b,t,linear);};
const P1:V3=[-22,23,-54];
function cam1(t:number):Cam{
 const tau=tau1(t),tRun=tS1()+T_RUN0,w=walk1(t);
 return plan(t,[
  [0,0,()=>({P:P1,T:[-40,6,12],fov:48})],
  [CUE(0,'Morocco lead')-.2,1.2,()=>({P:P1,T:[-52.5,1,-.6],fov:10})],
  [CUE(0,'One more goal')-.2,1,()=>({P:P1,T:[SIMON_X,1.3,0],fov:5})],
  [CUE(0,'Achraf Hakimi')-.3,1,()=>({P:P1,T:add3(pxz(T_RUN0-.5,w),[0,1,0]),fov:5})],
  [Math.max(tRun-.2,CUE(0,'barely runs')-.1),.8,()=>({P:P1,T:[-5.5,1.1,0],fov:13})],
  [tS1()+IN_NET-.2,.9,()=>({P:P1,T:[-1,1.1,0],fov:9})],
  [tS1()+IN_NET+.9,1.4,()=>({P:P1,T:mix3([0,1.1,0],add3(pxz(tau),[0,1,0]),.6),fov:12})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tau=tau1(t),tt=twos(t),tp=tau1(tt),tpp=tau1(tt-1/12),tN=tS1()+IN_NET;
  stadium(s,c,t,[1,2,3],{roar:.15+.85*sm(tN-.1,tN+.4,t),flash:sm(tN,tN+.25,t)*(1-sm(tN+2.5,tN+3.5,t))});
  ground(s,c,{bulge:bulgeAt(tau)});
  play(s,c,tau,tp,tpp,{it:tt,walk:walk1(tt),minBall:14,lines:true,prevT:tau1(t-.06),hero:'mid',line:true});
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:13,
};

// ---------------------------------------------------------------- 2 · the slow-motion replay, low at pitch level beside the six-yard box
const tau2=(t:number)=>key(t,mono([[0,T_RUN0+.05],[CUE(1,'short'),T_RUN0+.5],[CUE(1,'The keeper dives'),T_DIVE+.02],[CUE(1,'the ball floats'),.3],[CUE(1,'empty middle'),FLY-.1],[SECS(1),IN_NET+.9]]),linear);
const E2:V3=[-4.5,1,16];
function cam2(t:number):Cam{
 const tau=tau2(t),b=ballAt(Math.min(tau,FLY));
 return plan(t,[
  [0,0,()=>({P:E2,T:add3(pxz(tau),[.5,.95,0]),fov:13})],
  [CUE(1,'The keeper dives')-.5,1,()=>({P:add3(E2,[.4,0,-.5]),T:mix3(add3(pxz(tau),[0,.95,0]),[SIMON_X,1,0],.5),fov:32})],
  [CUE(1,'the ball floats')-.2,1,()=>({P:add3(E2,[.8,.1,-.8]),T:mix3(b,[-1,1.1,0],.3),fov:19})],
  [CUE(1,'empty middle')-.1,1.2,()=>({P:add3(E2,[1,.1,-1]),T:[.2,1,-.3],fov:13})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tau=tau2(t),tt=twos(t),tp=tau2(tt),tpp=tau2(tt-1/12);
  stadium(s,c,t,[0,1,3],{roar:.2+.8*sm(IN_NET,IN_NET+.4,tau),flash:sm(IN_NET+.1,IN_NET+.3,tau)});
  ground(s,c,{bulge:bulgeAt(tau)});
  // the replay trail: the soft loop so far, fading at the tail (under the players)
  if(tau>.02&&tau<IN_NET+.7){const pts=pathPts(c,Math.max(0,tau-.9),Math.min(tau,FLY+.001),20),fade=1-sm(FLY+.1,IN_NET+.7,tau);if(pts.length>2){const w=Math.max(8,kAt(c,ballAt(Math.min(tau,FLY)))*.16);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*fade);}}
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:12});
 },
 aperture(t){const c=cam2(t),P=ballAt(tau2(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:6,
};

// ---------------------------------------------------------------- 3 · the penguin dance from beside the goal; the mob sprints in; the red far end
const tau3=(t:number)=>key(t,mono([[0,IN_NET+1.3],[SECS(2),IN_NET+1.3+SECS(2)]]),linear);
const E3:V3=[1.6,1.15,7.2];
/** the far-end fans behind the dance: big Moroccan flags held up and waving */
function bigFlags(s:Sheet,c:Cam,t:number,rise:number){
 if(rise<=.02)return;const tt=twos(t),fl=new Path2D(),star=new Path2D();
 for(const[i,a0,b0] of [[0,.3,.1],[1,.4,.24],[2,.5,.12],[3,.58,.28],[4,.66,.14],[5,.46,.36],[6,.36,.38],[7,.72,.3]] as [number,number,number][]){
  const base=STANDS[3](a0,b0),sw=Math.sin(tt*5+i*1.7)*.6,W=4.4,H=2.9,top=1+2.2*rise;
  const P=(u:number,vv:number):V3=>[base[0]+.3*u,base[1]+top+H*(1-vv)+.35*Math.sin(u*3+tt*6+i),base[2]-W*(u-.5)+sw*vv*.6];
  const q=polyP(c,[P(0,0),P(.5,0),P(1,0),P(1,1),P(.5,1),P(0,1)]);if(q.length<3)continue;fl.addPath(polyPath(q,true));
  const sp=starPts((u,vv)=>P(u,1-vv),c,W/H);if(sp.length===5)star.addPath(ribbon(sp,Math.max(2,kAt(c,base)*.16),{close:true,taper:0,wobble:.6,seed:i}));}
 s.knockout(fl);s.fill(R,fl,.95);s.fill(G,star,.95);s.stroke(K,fl,2,.8);
}
function cam3v(t:number):Cam{
 const tau=tau3(t),h=pxz(tau),tF=CUE(2,'fans go wild');
 return plan(t,[
  [0,0,()=>({P:E3,T:add3(h,[0,1,0]),fov:17})],
  [CUE(2,'penguin dance')-.2,1,()=>({P:add3(E3,[-.4,-.1,-.6]),T:add3(h,[0,.9,0]),fov:13})],
  [CUE(2,'His teammates')-.2,1.2,()=>({P:add3(E3,[0,.4,-.4]),T:add3(h,[-7,1.2,.2]),fov:24})],
  [tF-.15,1.4,()=>({P:add3(E3,[0,2,-.4]),T:[-118,9,-2],fov:9})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tau=tau3(t),tt=twos(t),tp=tau3(tt),tpp=tau3(tt-1/12),tF=CUE(2,'fans go wild');
  const rise=sm(tF-.1,tF+.8,t);
  stadium(s,c,t,[0,2,3],{roar:.55+.45*rise,flash:.25+.6*rise});
  bigFlags(s,c,t,rise);
  ground(s,c,{bulge:bulgeAt(tau)});
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:10,line:true});
  const wc=sm(tF-.05,tF+.4,t);if(wc>0){const q=pr(c,[-118,12,-2]);if(q)sparkBurst(s,Y,q[0],q[1],110+150*wc,{n:11,seed:9,g:easeOutBack(wc),width:14});}
 },
 aperture(t){const c=cam3v(t),q=pr(c,[-118,10,-2])??[0,0];return apertureDisc(q[0],q[1],80,12);},
 still:3.4,
};

// ---------------------------------------------------------------- 4 · the lesson: know your plan → breathe → trust it → a calm mind
const tau4=(t:number)=>key(t,mono([[0,T_RUN0-.8],[CUE(3,'trust it')-.1,T_RUN0],[CUE(3,'calm mind')-.1,FLY+.1],[SECS(3),IN_NET+.7]]),linear);
function cam4v(t:number):Cam{
 const pm=pxz(T_RUN0);
 return plan(t,[
  [0,0,()=>({P:add3(pm,[3.2,1.55,3.4]),T:add3(pm,[0,.9,0]),fov:36})],
  [CUE(3,'Know your plan')-.2,1.2,()=>({P:add3(pm,[-5.6,2.9,2.2]),T:[-4.5,.9,-.3],fov:42})],
  [CUE(3,'breathe')-.2,1,()=>({P:add3(pm,[-2.4,1.7,3.8]),T:add3(pm,[.2,.8,0]),fov:34})],
  [CUE(3,'trust it')-.25,1,()=>({P:add3(pm,[-5.6,2.9,2.2]),T:[-4.5,.9,-.3],fov:44})],
 ]);
}
/** a ring on the ground round a point: jagged (pressure) → smooth (calm) */
function groundRing(s:Sheet,c:Cam,at:V3,r:number,jag:number,w:number,ink:string,cov:number,t:number){
 const pts:Pt[]=[];for(let i=0;i<48;i++){const a=i/48*TAU,k=1+jag*(.22*Math.sin(a*9+t*7)+.12*Math.sin(a*14-t*11)),p=pr(c,[at[0]+Math.cos(a)*r*k,.02,at[2]+Math.sin(a)*r*k]);if(p)pts.push(p);}
 if(pts.length<30)return;const rr=ribbon(pts,w,{close:true,seed:43,taper:0,wobble:jag*2+.6});s.knockout(rr,.9*cov);s.fill(ink,rr,.95*cov);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tau=tau4(t),tt=twos(t),tp=tau4(tt),tpp=tau4(tt-1/12);
  const tK=CUE(3,'Know your plan'),tB=CUE(3,'breathe'),tT=CUE(3,'trust it'),tM=CUE(3,'calm mind');
  stadium(s,c,t,[1,2,3],{roar:.3,flash:.25*sm(tM,tM+.3,t)});
  ground(s,c,{bulge:bulgeAt(tau)});
  const pm=pxz(T_RUN0);
  // 1 · know your plan: a dashed yellow loop from the ball into the middle of the goal, drawn BEFORE he moves (under the players)
  const pl=sm(tK-.1,tK+1.2,t);
  if(pl>.02){const pts=pathPts(c,0,FLY,32),n=12,w=Math.max(9,kAt(c,[-5,1.4,0])*.14),rb=new Path2D(),upto=pl*n;
   for(let i=0;i<Math.floor(upto);i++){const a=Math.floor(i/n*32),b=Math.min(32,Math.floor((i+.6)/n*32));if(b-a>=1)rb.addPath(ribbon(pts.slice(a,b+1),w,{seed:13+i,taper:.2,wobble:0}));}
   s.knockout(rb,.85);s.fill(Y,rb,.95);
   // the target: a ring in the empty middle of the goal mouth
   const ring:Pt[]=[];for(let i=0;i<32;i++){const a=i/32*TAU,p=pr(c,[.02,1.25+Math.sin(a)*.5,-.12+Math.cos(a)*.5]);if(p)ring.push(p);}
   if(ring.length>20){const rr=ribbon(ring,Math.max(5,kAt(c,[0,1.3,0])*.06),{close:true,seed:11,taper:0,wobble:1});s.knockout(rr,.85*pl);s.fill(Y,rr,.95*pl);}}
  // 2 · breathe: green rings swell out from his feet and fade, twice
  const br=sm(tB-.15,tB+.2,t)*(1-sm(tT-.2,tT+.2,t));
  if(br>.02)for(let k=0;k<2;k++){const u=((t-tB)*.7+k*.5)%1;if(u<0)continue;groundRing(s,c,pm,.6+1.4*u,0,Math.max(6,kAt(c,pm)*.05),G,br*(1-u),tt);}
  // 3 · trust it: the real ball rides the plan, which fills in solid behind it
  if(tau>0&&tau<IN_NET+.5){const pts=partial(pathPts(c,0,FLY,32),clamp(tau/FLY)),w=Math.max(9,kAt(c,[-5,1.4,0])*.12);if(pts.length>2){s.knockout(ribbon(pts,w*1.5,{taper:.3,pressure:.2,wobble:0}),.5);s.fill(Y,ribbon(pts,w,{taper:.3,pressure:.2,wobble:0}),.95);}}
  // 4 · a calm mind under pressure: the crowd's jagged red noise ring round him smooths into a steady yellow one
  const noise=sm(tM-.2,tM+.2,t);
  if(noise>.02){const calm=sm(tM+.3,tM+1.1,t);groundRing(s,c,pxz(tau),1.25,1-calm,Math.max(7,kAt(c,pm)*.07),calm<.5?R:Y,noise,tt);}
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:13});
  const gd=sm(tM+.2,tM+.6,t);if(gd>0&&tau>FLY){const q=pr(c,[.6,1.2,-.1]);if(q)sparkBurst(s,Y,q[0],q[1],Math.max(60,kAt(c,[0,1.3,0])*1.1)*easeOutBack(gd),{n:10,seed:61,width:Math.max(6,kAt(c,[0,1.3,0])*.05)});}
 },
 still:9,
};

const film:RisoStory={
 id:'hakimi-panenka-2022',format:'11v11',title:"Hakimi's chipped penalty v Spain",
 theme:'Penalties: know your plan before you step up, then breathe, trust it and keep a calm mind under pressure',
 ageNote:'Morocco 0–0 Spain (Morocco won 3–0 on penalties), World Cup round of 16, Education City Stadium, Al Rayyan, Qatar, 6 December 2022. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',green:'#00a95c',navy:'#22366b'},order:['yellow','red','green','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a little dink — a soft red loop over a green star, with a gently turning ball on its tip. Reduced motion: the still loop. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.6)),fade=age<=0?1:1-clamp((age-.65)/.25),r=rng(seed);
  const pts:Pt[]=[];for(let i=0;i<=16;i++){const k=i/16*u;pts.push([x+40*k,y-200*k+160*k*k]);}
  if(pts.length>2)s.fill(R,ribbon(pts,13,{seed,taper:.8,pressure:.3,wobble:1}),.95*fade);
  const e=pts[pts.length-1];if(age>0&&age<.3)sparkBurst(s,G,x,y,70,{n:5,seed,g:1-clamp(age/.3),width:9});
  footballPanels(s,e[0],e[1],32,{rot:-age*6+r()*TAU,key:K,shadow:G,seed:5});
 },
};
export default film;
