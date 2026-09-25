/** Daniel Passarella — SIGNATURE: "the defender who scores headers" (lib/town/iconicPlays.json: "Defenders can score too: attack set
 * pieces with a strong header."), shown through ONE real, well-documented moment: Argentina's FOURTH goal in Argentina 6–0 Peru, 1978 FIFA
 * World Cup, second round Group B, Estadio Gigante de Arroyito, Rosario, Wednesday 21 June 1978 (19:15 local, a winter night under
 * floodlights), about the 50th minute. Passarella, the captain and a centre-back, HEADED the ball on and Leopoldo Luque scored with a
 * DIVING HEADER (a "palomita"): 4–0, the margin Argentina needed to reach the final. An iconic-play riso film (RisoStory, chapters mode) played
 * by the card's picture window (components/CardFilmPlayer.tsx) or StoryFilmPlayer. A 1:1 reconstruction from WRITTEN accounts and one match
 * photograph (the TV footage itself was not reviewed), rendered as a riso print.
 *
 * WHY THIS MOMENT: the signature is the defender who attacks the ball in the air. The sources say that despite being only 1.73 m, "he
 * frequently scored headers ... many of his goals coming from headers" off indirect set pieces, and Maradona called him "the best header of the
 * ball he had seen". No single Passarella HEADED GOAL could be confirmed in writing (his only goal of the 1978 finals was a penalty v France,
 * and his famous 1985 set-piece goal-maker v Peru was chested, not headed), so the film uses the best-documented header of his most famous
 * tournament, as captain: a centre-back up in the opponents' box, winning the header that made the goal Argentina needed. The narration says
 * exactly that — he heads it on, Luque scores — and never claims the goal for him.
 *
 * SOURCES (read Sept 2026, cached in scratchpad/films/src-cache/):
 *  - Transfermarkt match report, Argentina v Peru 21/06/1978 (spielbericht 981171): "4:0 Leopoldo Luque, Header ... Assist: Daniel
 *    Passarella, Header"; "2:0 Alberto Tarantini, Header ... Assist: Daniel Bertoni, Corner"   [tm-arg-peru-1978.txt]
 *  - Wikipedia (es), "Argentina vs. Perú (Copa Mundial de Fútbol de 1978)": 21 June 1978, Gigante de Arroyito, Rosario, 37,315, referee
 *    Robert Wurtz; Kempes 3–0 three minutes into the second half, "a los 50 minutos de partido Leopoldo Luque marcó el 4-0 necesario para
 *    clasificar haciendo un gol de 'palomita'"; Argentina 8 corners   [eswiki-arg-peru-1978.txt]
 *  - Wikipedia (en), "Argentina v Peru (1978 FIFA World Cup)": goals Kempes 21' 49', Tarantini 43', Luque 50' 72', Houseman 67'; Argentina
 *    "had to win with a margin of four goals"; line-ups with numbers (Passarella 19 captain, Luque 14, Bertoni 4, Kempes 10, Tarantini 20,
 *    Larrosa 12, Ortiz 16; Peru Quiroga 21, Duarte 2, Manzo 3, Chumpitaz 4 captain, Rojas 22, Quesada 17, Velásquez 6 (off 51'), Cueto 8,
 *    Muñante 7, Oblitas 11, Cubillas 10; Bertoni off 64'); Argentina kit box: sky-blue and white stripes, black shorts, black socks
 *    [wiki-arg-peru-1978.txt]
 *  - Wikipedia (es), "Daniel Passarella": "Passarella brindó dos asistencias, de pase y de cabeza, en la victoria 6-0 ... más tarde a
 *    Leopoldo Luque, para el 4-0"; captain through the 1978 finals   [eswiki-daniel-passarella.txt]
 *  - Wikipedia (en), "Daniel Passarella": 1.73 m, "he frequently scored headers", good in the air, "a goal threat on indirect set pieces,
 *    with many of his goals coming from headers"   [wiki-daniel-passarella.txt]
 *  - These Football Times, M. Evans, "The art and controversy of Daniel Passarella", 5 Feb 2018: "described by Maradona as the best header of
 *    the ball he had seen"; "his usual sojourn up the field" for corners   [tft-passarella.txt]
 *  - Photograph "Argentina peru gol kempes.jpg" (Wikimedia, the 3–0 in this match): Peru in RED shirts with white trim, WHITE shorts, white
 *    socks with red tops; Argentina striped with black shorts and dark socks; Quiroga (21) in a BLUE long-sleeved jersey with white numbers and
 *    black shorts, pale gloves; a night match, dark stands, lamps along the stand tops   [arg-peru-1978-kempes.jpg]
 * CONFIRMED by those accounts: the match, place, date, night kick-off, the score before (3–0 at 49') and after (4–0, 50'); Argentina needed a
 *  four-goal margin; Passarella (No. 19, captain, a centre-back, 1.73 m) headed the ball on to Luque (No. 14); Luque scored with a diving
 *  header; the kits above; the numbers above; Velásquez and Bertoni were still on the pitch at 50'.
 * INFERRED (illustrative, not named in the narration): that the ball came from a CORNER (drawn from the far-side corner, taken by Bertoni
 *  right-footed — he took the corner for the 2–0 that night); which end and so the camera side; every position and run (Passarella coming up
 *  from the back and attacking the ball on the near side of the box, heading it back across goal; Luque diving in the middle); the exact
 *  height and spot of both headers; the keeper's movement and his late dive; Chumpitaz marking Passarella, Manzo near Luque; where the other
 *  players stood (extras drawn small); hair (Passarella short and dark, Luque curly — his moustache is not drawn), Quiroga's socks; the
 *  Gigante de Arroyito as drawn (open terraces close to the pitch, lamp rows on the stand tops), crowd colours and flags, the boards.
 *
 * FRAMING (the TV broadcast, never top-down; full-sheet card window 1.45:1 down to square, never sheet.safe): 1 = live, the high
 * main-stand camera in near real time (Rosario at night → Passarella comes up from the back into the box → the ball flies in from the corner
 * → his header back across → Luque's diving header → 4–0 and the roar); 2 = the slow-motion replay LOW from behind the far post, facing the
 * play: a yellow bar for his height (1.73 m) that grows with his jump, the arrow of his timed run, the ring where he takes off, the sightline
 * to the ball, the burst on his forehead and the flight on to Luque; 3 = the lesson from behind the attackers: the corner ring and the
 * delivery, his run into the box, the take-off ring, the strong header and a big tick. Every body goes through ONE adapter, drawPlayer() →
 * athlete.ts (continuous silhouettes, FK skeleton, `prev` secondary motion, motion smears on the fast moves); small figures and every figure
 * inside a passage print at `low` detail. Handedness: the world is right-handed like athlete.ts (x toward the Peru goal line at x = 0, y up,
 * +z = the near / main-stand side), so a player facing +x has his right at +z; Bertoni strikes with foot 'r' with no mirrored projector;
 * Quiroga faces −x, so his right is −z (he dives right, toward the far post). Poses on twos, cameras on ones, all randomness seeded, every
 * action keyed to cue times (withTiming swaps in the recorded word onsets).
 *
 * LEAD: when public/plays/narration/passarella-signature/timing.json exists, replace the null in the VOICE constant below with
 *   import timingJson from '../../../public/plays/narration/passarella-signature/timing.json';  (and `timingJson as NarrationTiming`). */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,partial,smoothPts,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,runCycle,strike,header,keeperSet,keeperDive,stand,posed,blendPose,keyPoses,celebrate,
 STRIKE_CONTACT,type Pose,type Camera,type AthleteStyle,type InkFill,type Place,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES (≈2.3 words/s + punctuation pauses) until the Kokoro voice exists. withTiming matches a cue by its FIRST word, in
 * order — so no cue starts with a word that also appears between it and the previous cue. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'Four-nil, live',text:"Rosario, World Cup 1978. Argentina must beat Peru by four goals to reach the final. It's three-nil. Captain Daniel Passarella, a defender, races into the box. The ball flies in. Passarella heads it on, and Leopoldo Luque dives... Four-nil!",tail:2.4,
  cues:['Rosario','World Cup','must beat',"It's three-nil",'Captain','races into','flies in','Passarella heads','Leopoldo Luque','dives','Four-nil']},
 {label:'Watch again',text:"Watch again. Passarella wasn't tall, but he scored many headers. He times his run, jumps high, eyes on the ball. Header! Luque's diving header does the rest.",tail:1.8,
  cues:['Watch again',"wasn't tall",'many headers','times his run','jumps high','eyes on','Header!',"Luque's diving",'does the rest']},
 {label:'Your turn',text:'Your turn. Defenders can score too! At corners and free kicks, run into the box and attack the ball with a strong header.',tail:2.2,
  cues:['Your turn','Defenders','At corners','run into','attack the ball','strong header']},
];
import timingJson from '../../../public/plays/narration/passarella-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (calibrated on the voiced films, ≈2.3 words/s): .2 s + .02 s a letter per word, pauses after , . ! ? : ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.2+.02*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.18;if(/[.!?]$/.test(w))t+=.34;if(/\.\.\.$/.test(w))t+=.28;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('passarella: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('passarella: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
/** key() needs increasing times: push each key at least `gap` after the previous one (real voice timings can crowd authored offsets) */
function mono(K:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of K)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}

// ---------------------------------------------------------------- inks, vectors
const Y='yellow',R='red',B='blue',K='navy';
const add3=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const mix3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const arc3=(a:V3,b:V3,u:number,lift:number):V3=>{const p=mix3(a,b,u);p[1]+=lift*4*u*(1-u);return p;};
const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const wrap=(a:number)=>{while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;return a;};
const lerpAng=(a:number,b:number,u:number)=>a+wrap(b-a)*clamp(u);
/** yaw (athlete.ts convention: 0 faces +x, + turns left) that faces along the ground direction (dx,dz) */
const yawOf=(dx:number,dz:number)=>Math.atan2(-dz,dx);
/** a narrower (square) window gets a slightly wider lens so the action still fits; set by frame(), read by every camera */
let LENS=1;
/** Frame the FULL sheet: world (0,0) on the canvas centre at 1 unit per sheet unit (the passage arrival scale still multiplies in). */
function frame(s:Sheet){const S=s.arrival;s.camera((s.cx-s.W/2)/S,(s.cy-s.H/2)/S,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
/** half the visible extents with margin for the .68 passage preview */
const view=(s:Sheet)=>({hx:s.W/(2*.68)+120,hy:s.H/(2*.68)+120});

// ---------------------------------------------------------------- 3D: projection through an athlete.ts Camera (right-handed metres, y up)
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

// ---------------------------------------------------------------- the Gigante de Arroyito at night: navy sky, open terraces close to the pitch, lamp rows
/** terrace planes (a along, b up the rake 0..1), close behind the lines: 0 the far side (z<0), 1 behind the Peru goal (x>0), 2 the main
 * stand (z>0, the camera side), 3 the far end */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-113,8,a),1+21*b,-41-27*b],
 (a,b)=>[8+27*b,1+21*b,lerp(-68,68,a)],
 (a,b)=>[lerp(8,-113,a),1+19*b,41+25*b],
 (a,b)=>[-113-27*b,1+21*b,lerp(68,-68,a)],
];
const STAND_COLS=[112,70,112,70],STAND_ROWS=14,WALK=.5;
/** crowd colour mix per stand: cumulative thresholds for [paper, sky blue, red (Peru fans, few), navy (the dark)] — a home crowd in sky blue
 * and white */
const CROWD:[number,number,number][]=[[.36,.72,.75],[.34,.7,.73],[.36,.72,.75],[.34,.7,.73]];
/** flags on the terrace fronts: [stand, a, kind] kind 0 = Argentina (sky blue / white / sky blue bands, a yellow sun) */
const FLAGS:[number,number,number][]=[[0,.44,0],[0,.7,0],[0,.83,0],[1,.22,0],[1,.6,0],[1,.8,0],[2,.12,0],[2,.44,0],[3,.3,0],[3,.7,0]];
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t),Bnd=Math.max(s.W,s.H)*2;
 s.field(B,.5,.6);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]))?.[1]??0;
 s.tone(K,polyPath([[-Bnd,-Bnd],[Bnd,-Bnd],[Bnd,Bnd],[-Bnd,Bnd]],true),.56);
 s.tone(K,polyPath([[-Bnd,-Bnd],[Bnd,-Bnd],[Bnd,hz-560],[-Bnd,hz-460]],true),.36);
 const planes=new Path2D(),walk=new Path2D(),lip=new Path2D();
 for(const i of which){const S=STANDS[i],q=polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]);addPoly(planes,q);
  seg3(c,S(0,WALK),S(1,WALK),.45,walk);seg3(c,S(0,1),S(1,1),.6,lip);}
 s.knockout(planes);s.tone(K,planes,.6);s.tone(B,planes,.18);s.knockout(walk,.35);
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si],mix=CROWD[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(Math.abs(b-WALK)<.045)continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,5);if(h<.3)continue;const a=(i+.5+(hash(i+j*31,9)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const u=(h-.3)/.7,ink=u<mix[0]?0:u<mix[1]?1:u<mix[2]?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.6);s.tone(B,inks[1],.55);s.fill(R,inks[2],.9);s.tone(K,inks[3],.5);
 s.fill(K,lip,.85);
 const fl=new Path2D(),sky=new Path2D(),band=new Path2D();
 for(const[si,a,kind] of FLAGS){if(!which.includes(si))continue;const S=STANDS[si],w=.03,P=(u:number,b:number)=>S(a+u*w,b);
  const q=polyP(c,[P(0,.005),P(1,.005),P(1,.08),P(0,.08)]);if(q.length<3)continue;fl.addPath(polyPath(q,true));
  if(kind===0){addPoly(sky,polyP(c,[P(0,.005),P(1,.005),P(1,.03),P(0,.03)]));addPoly(sky,polyP(c,[P(0,.055),P(1,.055),P(1,.08),P(0,.08)]));addPoly(band,polyP(c,[P(.42,.038),P(.58,.038),P(.58,.047),P(.42,.047)]));}}
 s.knockout(fl);s.tone(B,sky,.62);s.fill(Y,band,.9);
 // lamp rows on posts along the terrace tops (the photograph: bright lamps along the tops of the stands)
 const lamp=new Path2D(),halo=new Path2D(),post=new Path2D();for(const i of which){const S=STANDS[i];for(let k=0;k<8;k++){const u=(k+.5)/8,a=add3(S(u-.025,1),[0,4.2,0]),b=add3(S(u+.025,1),[0,4.2,0]);if(toCam(c,a)[2]<NEAR+2)continue;
  seg3(c,S(u,1),add3(S(u,1),[0,3.8,0]),.35,post);seg3(c,a,b,1.2,lamp);seg3(c,a,b,6,halo);}}
 s.fill(K,post,.8);s.tone(Y,halo,.3);s.knockout(lamp);s.fill(Y,lamp,.85);
 if(flash>0){const p=new Path2D(),n=Math.round(22*flash);for(let i=0;i<n;i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,STANDS[si](r2,.1+.8*hash(i,Math.floor(tt*12))));if(!q)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
// ---------------------------------------------------------------- the grass under the floodlights, lines, boards, the goal
function ground(s:Sheet,c:Cam,o:{goal?:boolean}={}){
 const g=polyP(c,[[-113,0,-41],[8,0,-41],[8,0,41],[-113,0,41]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.8);s.tone(B,gp,.84);s.tone(K,gp,.26);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]));s.tone(K,st,.12);
 // advertising boards behind the goal and along both touchlines
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.9,0]),add3(a,[0,.9,0])]));
 board([5.5,0,-37],[5.5,0,37]);board([-108,0,-38.5],[5.5,0,-38.5]);board([-108,0,38.5],[5.5,0,38.5]);
 for(let k=0;k<11;k++){const z=-34+k*6.3;addPoly(pn,polyP(c,[[5.4,.22,z],[5.4,.22,z+3.6],[5.4,.68,z+3.6],[5.4,.68,z]]));}
 for(const zz of[-38.4,38.4])for(let k=0;k<17;k++){const x=-106+k*6.4;addPoly(pn,polyP(c,[[x,.22,zz],[x+3.6,.22,zz],[x+3.6,.68,zz],[x,.68,zz]]));}
 s.knockout(bd);s.fill(K,bd,.85);s.knockout(pn,.85);s.tone(B,pn,.5);
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
 circ(0,34,1,Math.PI/2,Math.PI,5);circ(0,-34,1,Math.PI,1.5*Math.PI,5);
 s.knockout(ln,.9);
 // corner flags (navy poles, yellow flags) at the Peru end
 const pole=new Path2D(),flag=new Path2D();
 for(const z of [34,-34]){seg3(c,[0,0,z],[0,1.55,z],.05,pole);const a=pr(c,[0,1.55,z]),b=pr(c,[-.45,1.4,z]),e=pr(c,[0,1.2,z]);if(a&&b&&e)flag.addPath(polyPath([a,b,e],true));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(Y,flag,.95);
 if(o.goal!==false)goal3(s,c);
}
/** the Peru goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep with a sloping roof */
const GOAL={x:0,z0:-3.66,z1:3.66,h:2.44};
/** the net bulge where the ball hits it (0..1) */
let BULGE=0;
function goal3(s:Sheet,c:Cam,veil=.28){
 const X=0,z0=-3.66,z1=3.66,H=2.44,bx=2,bz=NET_BACK[2];
 const back=(y:number,z:number):V3=>[bx+BULGE*.45*Math.max(0,1-Math.hypot((z-bz)/1.8,(y-.5)/1.1)),y,z];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[bx,1.9,z0],[bx,0,z0]],[[X,0,z1],[X,H,z1],[bx,1.9,z1],[bx,0,z1]],[[X,H,z0],[X,H,z1],[bx,1.9,z1],[bx,1.9,z0]],[[bx,0,z0],[bx,0,z1],[bx,1.9,z1],[bx,1.9,z0]]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,veil);s.tone(K,net,.12*veil/.28);
 const mesh=new Path2D();
 for(let i=0;i<=14;i++){const z=lerp(z0,z1,i/14);seg3(c,[X,H,z],back(1.9,z),.022,mesh,.7);for(let j=0;j<6;j++)seg3(c,back(1.9*(6-j)/6,z),back(1.9*(5-j)/6,z),.022,mesh,.7);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<14;i++)seg3(c,back(y,lerp(z0,z1,i/14)),back(y,lerp(z0,z1,(i+1)/14)),.022,mesh,.7);seg3(c,[X,y*H/1.9,z0],[bx,y,z0],.022,mesh,.7);seg3(c,[X,y*H/1.9,z1],[bx,y,z1],.022,mesh,.7);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+2*u,H-.54*u,z0],[X+2*u,H-.54*u,z1],.022,mesh,.7);}
 s.fill(K,mesh,.7);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.2,fo);seg3(c,[X,0,z1],[X,H,z1],.2,fo);seg3(c,[X,H,z0-.04],[X,H,z1+.04],.2,fo);
 s.fill(K,fo,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- kits (athlete styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.28],[B,.08]],SKIN_T:InkFill[]=[[Y,.44],[R,.34],[K,.1]];
/** Argentina: sky-blue and white stripes, black shorts, black socks (kit box + photograph); navy numbers */
const arg=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',pattern:'stripes',patternInk:[B,.62],shorts:[K,.9],socks:[K,.9],boots:K,trim:K,skin:SKIN_L,hair:[K,.88],line:K,numberInk:K,hairStyle:'short',sleeves:'short',...o});
/** Peru: red shirts (white trim), white shorts, white socks (photograph); paper numbers */
const peru=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[R,.95],shorts:'paper',socks:'paper',boots:K,trim:'paper',skin:SKIN_T,hair:[K,.92],line:K,numberInk:'paper',hairStyle:'short',sleeves:'short',...o});
/** Daniel Passarella: No. 19, captain, 1.73 m (confirmed) — a compact, strong centre-back; short dark hair (inferred) */
const PASS_B={height:1.73,bulk:1.05,thighs:1.06};
const PASS_ST=arg({number:19,build:PASS_B,hair:[K,.92],seed:19});
/** Leopoldo Luque: No. 14 (confirmed); curly dark hair (inferred; his moustache is not drawn) */
const LUQUE_B={height:1.8,bulk:1.02};
const LUQUE_ST=arg({number:14,build:LUQUE_B,hairStyle:'curly',hair:[K,.92],skin:SKIN_M,seed:14});
/** Ramón Quiroga: No. 21, the blue long-sleeved jersey with white numbers, black shorts, pale gloves (photograph); white socks (inferred) */
const QUIROGA_ST:AthleteStyle={shirt:[B,.95],shorts:[K,.9],socks:'paper',boots:K,skin:SKIN_T,hair:[K,.92],line:K,trim:'paper',gloves:'paper',sleeves:'long',hairStyle:'short',number:21,numberInk:'paper',build:{height:1.83},seed:21};
const BERTONI_ST=arg({number:4,skin:SKIN_M,build:{height:1.75},seed:4});

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete: fluid FK body, kit inks, halftone shade, key line).
 * prev = the pose one drawing earlier (secondary motion: the hem trails); smear = a halftone echo + speed lines for fast moves. */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,o:{prev?:Pose;prevPlace?:Place;smear?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{prevPlace:o.prevPlace,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev,prevPlace:o.prevPlace}:{});
}

// ---------------------------------------------------------------- the play (T = play seconds; T = 0 = Passarella's forehead meets the ball)
/** the corner is struck at T_KICK; Luque's diving header at T_LU; the ball crosses the line at T_IN and hits the net at T_NET */
const T_KICK=-1.5,T_LU=.42,T_IN=.7,T_NET=.84;
const GOAL_IN:V3=[0,.5,-1.55],NET_BACK:V3=[1.85,.42,-1.95];
/** the corner spot (inside the quarter-circle at the far-side corner, x 0 / z −34) */
const CORNER_SPOT:[number,number]=[-.55,-33.55];
type Role='pass'|'luque'|'gk'|'taker'|'mark'|'arg'|'per';
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];key?:boolean};
/** Passarella faces between the incoming ball (from the corner) and where he sends it (Luque): a glancing header back across goal */
const HEAD_YAW=yawOf(.45,-.84);
/** Luque dives toward the far side of the goal */
const LUQ_YAW=yawOf(5.4,-2.2);
/** Bertoni strikes the corner toward the near side of the box */
const TAKER_YAW=yawOf(-7.6,37.6);
/** Bertoni's pelvis at the strike, solved so his right boot meets the ball on the corner spot */
const TAKER_AT=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r',power:.8}),BERTONI_ST.build,{x:0,z:0,yaw:TAKER_YAW},1.04);return[CORNER_SPOT[0]-sk.rToe[0],CORNER_SPOT[1]-sk.rToe[2]];})();
/** Positions are Hermite-interpolated between keys [T, x, z]. Only Passarella, Luque (and the corner, inferred) have beats in the
 * accounts; everyone else is an illustrative marker (numbers from the line-ups, positions inferred). */
const ACTORS:Actor[]=[
 {name:'Passarella',role:'pass',style:PASS_ST,key:true,keys:[[-14,-38,6.5],[-12,-34,6.4],[-9,-27,6.2],[-6,-18.6,6.2],[-4,-14.6,6.5],[-2.4,-13.3,6.5],[T_KICK,-12.7,6.3],[-.9,-10.6,5.4],[-.45,-9.1,4.7],[0,-8.5,4.35],[.4,-8.25,4.2],[1.2,-8,4],[2.4,-7.1,3.6],[4,-5.2,3.2],[9,-4.2,3]]},
 {name:'Luque',role:'luque',style:LUQUE_ST,key:true,keys:[[-14,-16,-2],[-10,-12,1],[-6,-9,2.4],[-3,-8,1.6],[T_KICK,-7.7,1.45],[-.5,-7.2,1.2],[-.03,-6.7,1.05],[T_LU,-5.75,.72],[.87,-4.8,.36],[1.5,-4.7,.32],[2.2,-4.3,1.6],[3.4,-3.4,5],[5,-2.6,9],[9,-2,12]]},
 {name:'Quiroga',role:'gk',style:QUIROGA_ST,key:true,keys:[[-14,-1.1,0],[T_KICK,-1,-.8],[-.6,-1.1,.7],[0,-1.2,1.4],[.2,-1.2,1.25],[9,-1.2,1.25]]},
 {name:'Bertoni',role:'taker',style:BERTONI_ST,keys:[[-14,-3.2,-36.3],[-3,-3.1,-36.3],[-2.2,TAKER_AT[0]-1.1,TAKER_AT[1]-1.5],[T_KICK,TAKER_AT[0],TAKER_AT[1]],[-.7,TAKER_AT[0]-.8,TAKER_AT[1]+1.1],[1,-3,-30],[4,-5,-25],[9,-6,-21]]},
 {name:'Chumpitaz',role:'mark',style:peru({number:4,build:{height:1.8,bulk:1.04},seed:44}),keys:[[-14,-13,3],[-5,-13.4,6.8],[T_KICK,-12.8,7.1],[-.5,-9.9,5.6],[0,-9.3,5.15],[.6,-9.1,5],[3,-9.2,4.4],[9,-10,3]]},
 {name:'Manzo',role:'per',style:peru({number:3,seed:33}),keys:[[-14,-7,0],[T_KICK,-6.9,1.9],[-.2,-6.3,1.6],[.4,-5.9,1.3],[2,-6,1.5],[9,-7,2]]},
 {name:'Duarte',role:'per',style:peru({number:2,seed:22}),keys:[[-14,-.4,3.3],[9,-.45,3.3]]},
 {name:'Rojas',role:'per',style:peru({number:22,seed:222}),keys:[[-14,-.4,-3.3],[9,-.5,-3.2]]},
 {name:'Tarantini',role:'arg',style:arg({number:20,hairStyle:'curly',seed:20}),keys:[[-14,-9,-4],[T_KICK,-6.8,-3],[0,-5.9,-2.4],[1.5,-5.2,-1.4],[3,-4.3,.9],[9,-3.8,1.6]]},
 {name:'Quesada',role:'per',style:peru({number:17,seed:17}),keys:[[-14,-8,-4.6],[T_KICK,-6.3,-3.8],[0,-5.5,-3.2],[2,-5.1,-3],[9,-6,-3]]},
 {name:'Kempes',role:'arg',style:arg({number:10,hairStyle:'long',build:{height:1.84},seed:10}),keys:[[-14,-18,-4],[T_KICK,-15.5,-2.6],[0,-14.2,-1.2],[1.5,-10.4,.4],[3.5,-5.4,1.4],[9,-4.8,1.6]]},
 {name:'Cueto',role:'per',style:peru({number:8,seed:8}),keys:[[-14,-14,-1],[T_KICK,-13.4,-.8],[0,-12.6,0],[9,-12,0]]},
 {name:'Cubillas',role:'per',style:peru({number:10,seed:100}),keys:[[-14,-19,2],[T_KICK,-18.5,1.6],[9,-18,1.5]]},
 {name:'Velásquez',role:'per',style:peru({number:6,seed:6}),keys:[[-14,-12,7.5],[T_KICK,-11.2,8],[0,-10.4,7],[9,-10,6.4]]},
 {name:'Larrosa',role:'arg',style:arg({number:12,seed:12}),keys:[[-14,-26,9],[T_KICK,-22,8],[3,-18,6],[9,-16,5]]},
 {name:'Ortiz',role:'arg',style:arg({number:16,seed:16}),keys:[[-14,-10,-10],[T_KICK,-8.6,-8],[0,-7.6,-6.6],[3,-6,-3],[9,-5,-1]]},
 {name:'Oblitas',role:'per',style:peru({number:11,seed:11}),keys:[[-14,-30,-8],[9,-28,-7]]},
 {name:'Muñante',role:'per',style:peru({number:7,seed:7}),keys:[[-14,-30,10],[9,-29,10]]},
];
const PASS_I=0,LUQ_I=1,GK_I=2,TAKER_I=3,MARK_I=4;
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const T0=-14,T1=9,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],T:number)=>{const u=clamp((T-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,T:number):[number,number]=>[samp(TABLES[k].X,T),samp(TABLES[k].Z,T)];
const distOf=(k:number,T:number)=>samp(TABLES[k].D,T);
const velOf=(k:number,T:number):[number,number]=>{const a=posOf(k,T-.08),b=posOf(k,T+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};

// ---------------------------------------------------------------- poses
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:12,rHipA:12,lAnk:-8,rAnk:-8,lean:18,pitch:5,lShA:28,rShA:28,lShF:16,rShF:16,lElb:52,rElb:52,neckP:-10});
/** Peru after the goal: hands on hips, head down */
const P_DOWN=posed({lShA:34,rShA:34,lShF:-14,rShF:-14,lElb:104,rElb:104,lShR:30,rShR:30,lHipF:6,rHipF:8,lKnee:10,rKnee:12,lean:8,neckP:34});
/** Passarella's header (athlete.ts header: crouch → take-off → arched peak → neck snap at CONTACT .52 → land), contact at T = 0, with a
 * bigger spring ("jumps high": a short man meeting the ball above taller markers) */
const passHead=(T:number)=>{const u=clamp(.52+T/1.0),p=header(u);p.air+=.24*Math.sin(Math.PI*clamp((u-.2)/.62));return p;};
/** Luque's "palomita": the last stride, a push-off from the left foot, the body flat in the air with the chin up and the neck snapping
 * through the ball (contact .5), arms reaching down to break the fall, landing flat on the chest */
const DIVE_KEYS:[number,Pose][]=[
 [0,runCycle(.25,{speed:.85})],
 [.22,posed({pitch:34,lean:18,air:.05,lHipF:58,lKnee:62,lAnk:-6,rHipF:-26,rKnee:36,rAnk:40,lShF:70,rShF:62,lShA:22,rShA:22,lElb:60,rElb:60,neckP:-26,squash:-.07})],
 [.5,posed({pitch:76,air:.36,lean:-12,neckP:-40,lHipF:-8,rHipF:-14,lKnee:40,rKnee:62,lAnk:40,rAnk:44,lShF:104,rShF:98,lShA:28,rShA:30,lElb:40,rElb:44,squash:.06})],
 [.75,posed({pitch:84,air:.12,lean:-10,neckP:-34,lHipF:-4,rHipF:-8,lKnee:26,rKnee:40,lAnk:44,rAnk:44,lShF:128,rShF:124,lShA:26,rShA:26,lElb:24,rElb:26,lHand:1,rHand:1})],
 [1,posed({pitch:88,air:0,lean:-8,neckP:-28,lHipF:0,rHipF:-4,lKnee:18,rKnee:30,lAnk:40,rAnk:40,lShF:120,rShF:116,lShA:34,rShA:34,lElb:62,rElb:66,lHand:1,rHand:1,squash:-.06})],
];
const luqueDive=(T:number)=>keyPoses(clamp(.5+(T-T_LU)/.9),DIVE_KEYS);
/** Quiroga's late dive to his right (−z, toward the far post), low: beaten by the header */
const GK_DIVE=(T:number)=>keeperDive(clamp((T-.2)/.9),{side:'r',height:.2});
/** Bertoni's corner: a right-footed strike, contact at T_KICK */
const takerStrike=(T:number)=>strike(clamp(STRIKE_CONTACT+(T-T_KICK)/.9),{foot:'r',power:.8});
/** Chumpitaz's challenge: the same header a beat late */
const markHead=(T:number)=>header(clamp(.52+(T-.14)/1.0));
/** the whole pose of actor k at T, with its yaw */
function poseOf(k:number,T:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,T),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,T),b=ballAt(T);
 let yaw=sp>.9?yawOf(v[0],v[1]):yawOf(b[0]-x,b[2]-z);
 const idle=a.role==='gk'?keeperSet(T*1.3):READY;
 const s=clamp((sp-2.2)/5);let p=blendPose(idle,runCycle(distOf(k,T)/3.3,{speed:s}),clamp((sp-.5)/.9));
 if(a.role==='arg'||a.role==='per'){// markers watch the ball when they are not running hard
  if(sp<3)yaw=lerpAng(yaw,yawOf(b[0]-x,b[2]-z),.6);
  if(a.role==='per'&&T>T_IN+.3){const w=sm(T_IN+.3,T_IN+.9,T);p=blendPose(p,P_DOWN,w*.85);}
  if(a.role==='arg'&&T>T_IN+.2&&sp<2.5){const w=sm(T_IN+.2,T_IN+.7,T);p=blendPose(p,celebrate(T*.9+k*.13,{kind:'arms'}),w*.6);}}
 if(a.role==='taker'){
  const u=(T-T_KICK)/.9+STRIKE_CONTACT;if(u>0&&u<1.3){const w=Math.min(sm(0,.18,u),1-sm(1,1.3,u));p=blendPose(p,takerStrike(T),w);yaw=lerpAng(yaw,TAKER_YAW,Math.min(1,sm(T_KICK-.55,T_KICK-.2,T)+(Math.abs(T-T_KICK)<.02?1:0))*(1-sm(T_KICK+.5,T_KICK+1,T)));}
  if(T>T_IN+.3){const w=sm(T_IN+.3,T_IN+.8,T);p=blendPose(p,celebrate(T,{kind:'run'}),w*.6);}}
 if(a.role==='mark'){yaw=lerpAng(yaw,yawOf(b[0]-x,b[2]-z),.7);
  const w=sm(-.45,-.35,T)*(1-sm(.75,1.05,T));if(w>0)p=blendPose(p,markHead(T),w);
  if(T>T_IN+.3)p=blendPose(p,P_DOWN,sm(T_IN+.3,T_IN+.9,T)*.8);}
 if(a.role==='gk'){yaw=lerpAng(Math.PI,yawOf(b[0]-x,b[2]-z),.5);
  if(T>.2){p=blendPose(p,GK_DIVE(T),sm(.2,.28,T));yaw=Math.PI;}}
 if(a.role==='pass'){
  // the run from the back, then the attack on the ball; at the header he faces between the ball's flight and Luque
  if(T>-.6&&T<1.1)yaw=lerpAng(yaw,HEAD_YAW,sm(-.6,-.35,T)*(1-sm(.8,1.1,T)));
  const w=sm(-.58,-.48,T)*(1-sm(.55,.85,T));if(w>0)p=blendPose(p,passHead(T),w);
  if(T>1)p=blendPose(p,celebrate(T*.9,{kind:'arms'}),sm(1,1.4,T)*(1-sm(4.2,5,T))*.8);}
 if(a.role==='luque'){
  const w=sm(-.1,-.02,T)*(1-sm(1.35,1.75,T));
  if(T>-.1&&T<1.2)yaw=lerpAng(yaw,LUQ_YAW,sm(-.4,-.1,T));
  if(w>0)p=blendPose(p,luqueDive(T),w);
  if(T>1.35&&T<2.4)p=blendPose(p,stand(),sm(1.35,1.75,T)*(1-sm(2,2.4,T)));
  if(T>2)p=blendPose(p,celebrate(T*1.1,{kind:'run'}),sm(2,2.4,T));}
 return{p,yaw};
}

// ---------------------------------------------------------------- the contacts, solved from the bodies; the ball
const FIG=1.04;// figures 4 % over life size so they read in a small card window
function toe(k:number,T:number,foot:'l'|'r'):V3{const{p,yaw}=poseOf(k,T),[x,z]=posOf(k,T),sk=solve(p,ACTORS[k].style.build,{x,z,yaw},FIG),q=foot==='l'?sk.lToe:sk.rToe;return[q[0],.11,q[2]];}
/** the ball against the forehead: a ball radius in front of the face */
function forehead(k:number,T:number):V3{const{p,yaw}=poseOf(k,T),[x,z]=posOf(k,T),sk=solve(p,ACTORS[k].style.build,{x,z,yaw},FIG),d:V3=[sk.face[0]-sk.head[0],sk.face[1]-sk.head[1],sk.face[2]-sk.head[2]],l=Math.hypot(d[0],d[1],d[2])||1;return[sk.face[0]+d[0]/l*.11,sk.face[1]+d[1]/l*.11+.03,sk.face[2]+d[2]/l*.11];}
// ballAt is read by poseOf (yaws) before the contacts are solved: until then the ball sits at the defaults
let CORNER_PT:V3=[CORNER_SPOT[0],.11,CORNER_SPOT[1]],P_H:V3=[-8.2,2.2,4.1],L_H:V3=[-4.9,.7,.5],SOLVED=false;
/** the ball at play time T: on the corner spot, the high corner to the near side of the box, Passarella's header back across and down,
 * Luque's diving header into the far side of the net, the net bulging, the ball dropping in the goal */
function ballAt(T:number):V3{
 if(!SOLVED)return P_H;
 if(T<T_KICK)return CORNER_PT;
 if(T<0)return arc3(CORNER_PT,P_H,(T-T_KICK)/-T_KICK,5.4);
 if(T<T_LU)return arc3(P_H,L_H,T/T_LU,.3);
 if(T<T_IN)return mix3(L_H,GOAL_IN,(T-T_LU)/(T_IN-T_LU));
 if(T<T_NET)return mix3(GOAL_IN,NET_BACK,(T-T_IN)/(T_NET-T_IN));
 const u=clamp((T-T_NET)/.6);return arc3(NET_BACK,[1.45,.11,-1.8],easeOut(u),.15*(1-u));
}
const spinAt=(T:number)=>T<T_KICK?0:T<0?TAU*2.2*(T-T_KICK):T<T_NET?TAU*3.3+TAU*4*T:TAU*3.3+TAU*4*T_NET+TAU*1.2*(T-T_NET);
CORNER_PT=toe(TAKER_I,T_KICK,'r');P_H=forehead(PASS_I,0);L_H=forehead(LUQ_I,T_LU);SOLVED=true;

// ---------------------------------------------------------------- the ball print
function drawBall(s:Sheet,c:Cam,T:number,o:{min?:number;lines?:boolean;prevT?:number}={}){
 const P=ballAt(T),q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??10,c.F*.11/q[2]);
 const sh:Pt[]=[];const rad=.16+P[1]*.05;for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*1.3,0,P[2]+Math.sin(a)*rad]);if(p)sh.push(p);}
 if(sh.length>8)s.tone(K,polyPath(sh,true),clamp(.5-P[1]*.1,.1,.5));
 if(o.lines&&o.prevT!==undefined&&T>T_KICK&&T<T_NET){const a=pr(c,ballAt(o.prevT));if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.8)speedLines(s,K,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:3,seed:7,len:Math.min(200,d*1.2),spread:r*.8,width:Math.max(2.5,r*.16),cov:.75});}}
 footballPanels(s,g[0],g[1],r,{rot:spinAt(T),key:K,shadow:B,seed:5});
 return{g,r,d:q[2]};
}

// ---------------------------------------------------------------- one frame of the match through a camera
type PlayOut={bg:Pt|null;pass?:DrawResult};
type Env={minBall?:number;lines?:boolean;hero?:boolean;near?:number;after?:(r:PlayOut)=>void};
/** everything on the pitch at T (the ball on ones, poses on twos at Tp; Tprev = the drawing before, for secondary motion), in depth order
 * with the goal (through its net when the camera is behind the line) */
function play(s:Sheet,c:Cam,T:number,Tp:number,Tprev:number,e:Env={}):PlayOut{
 const v=view(s),m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending;
 const items:{d:number;draw:()=>void}[]=[],out:PlayOut={bg:null};
 const behind=c.eye[0]>.5;
 BULGE=T<T_IN?0:T<T_NET?(T-T_IN)/(T_NET-T_IN):Math.max(0,1-(T-T_NET)/.5);
 items.push({d:behind?-1:toCam(c,[1,1.2,0])[2],draw:()=>goal3(s,c,behind?.18:.28)});
 // small ground shadows batched in one op; big figures cast their own through the athlete
 const sh=new Path2D();let nsh=0;
 ACTORS.forEach((a,k)=>{const[x,z]=posOf(k,T),q=toCam(c,[x,.9,z]);if(q[2]<(e.near??2.5))return;const g=scr(c,q),h=c.F*1.85/q[2];
  if(Math.abs(g[0])>v.hx+h||g[1]<-v.hy-h||g[1]>v.hy+h)return;
  const gg=pr(c,[x,0,z]);if(gg&&h<380){sh.addPath(polyPath(blob(gg[0],gg[1],h*.14,h*.04,a.style.seed??1,{amp:.05,n:14}),true));nsh++;}
  items.push({d:q[2],draw:()=>{const{p,yaw}=poseOf(k,Tp),px=h*ppu,big=h>=240;
   const detail=passing?(k===PASS_I?'mid':'low'):px<50||(!a.key&&px<150)?'low':'auto';
   const fast=e.hero&&((k===PASS_I&&Tp>-.4&&Tp<.3)||(k===LUQ_I&&Tp>.1&&Tp<.8)||(k===GK_I&&Tp>.25&&Tp<.9));
   const prv=big&&!passing?poseOf(k,Tprev):null,[px0,pz0]=posOf(k,Tprev);
   const r=drawPlayer(s,p,c,{...a.style,scale:FIG,shadow:h<380?false:undefined,detail},{x,z,yaw},prv?{prev:prv.p,prevPlace:{x:px0,z:pz0,yaw:prv.yaw},smear:!!fast}:{});
   if(k===PASS_I)out.pass=r;}});});
 if(nsh)s.tone(K,sh,.4);
 const bq=toCam(c,ballAt(T));if(bq[2]>=NEAR)items.push({d:bq[2],draw:()=>{const r=drawBall(s,c,T,{min:e.minBall,lines:e.lines,prevT:T-.06});out.bg=r?r.g:null;}});
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
 e.after?.(out);
 return out;
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}

// ---------------------------------------------------------------- teaching marks
/** a ring on the grass round a point (a stamped spot), knocked out under */
function groundRing(s:Sheet,c:Cam,x:number,z:number,r:number,w:number,ink=Y){if(w<=.02)return;const pts:Pt[]=[];for(let i=0;i<36;i++){const q=pr(c,[x+Math.cos(i/36*TAU)*r,.01,z+Math.sin(i/36*TAU)*r]);if(q)pts.push(q);}
 if(pts.length<30)return;const rr=ribbon(pts,Math.max(5,kAt(c,[x,0,z])*.06),{close:true,seed:7,taper:0,wobble:1});s.knockout(rr,.9*w);s.fill(ink,rr,.95*w);}
/** an arrow on the grass from a to b (world, y≈0), drawn to progress u */
function grassArrow(s:Sheet,c:Cam,a:V3,b:V3,u:number,ink:string,wm=.14,seed=70){if(u<=.02)return;const A=pr(c,a),Bp=pr(c,b);if(!A||!Bp)return;const wd=Math.max(6,kAt(c,mix3(a,b,.5))*wm);
 const e:Pt=[lerp(A[0],Bp[0],u),lerp(A[1],Bp[1],u)];s.knockout(ribbon([A,e],wd*2.1,{seed,taper:0,wobble:.6}),.85);laneArrow(s,ink,A,Bp,wd,{progress:u,seed:seed+1,head:wd*2.6});}
/** the ball's flight between play times a..b as a bold ribbon with an arrowhead (progress u) */
function flightArrow(s:Sheet,c:Cam,a:number,b:number,u:number,ink:string,wm=.12){if(u<=.02)return;const pts:Pt[]=[];let d=10;
 for(let i=0;i<=18;i++){const P=ballAt(lerp(a,b,i/18)),q=toCam(c,P);if(q[2]<1)continue;pts.push(scr(c,q));d=q[2];}
 if(pts.length<4)return;const line=partial(smoothPts(pts,false,6,2),u),wd=Math.max(7,c.F*wm/d);if(line.length<2)return;
 s.knockout(ribbon(line,wd*1.7,{seed:61,taper:.1,wobble:.8}),.8);s.fill(ink,ribbon(line,wd,{seed:61,taper:.1,wobble:.8}),.95);
 const e=line[line.length-1],p0=line[Math.max(0,line.length-3)];if(Math.hypot(e[0]-p0[0],e[1]-p0[1])>1)laneArrow(s,ink,p0,[e[0]+(e[0]-p0[0])*.02,e[1]+(e[1]-p0[1])*.02],wd,{seed:62,head:wd*3});}
/** "eyes on the ball": a dotted yellow sightline from his eyes to the ball */
function sightline(s:Sheet,r:DrawResult|undefined,bg:Pt|null,w:number){if(!r||!bg||w<=.02)return;const h=r.joints.face,n=r.joints.head,hs=Math.hypot(h[0]-n[0],h[1]-n[1])*2.2+6;
 const L=Math.hypot(bg[0]-h[0],bg[1]-h[1]);if(L<hs)return;const dots=new Path2D(),N=Math.max(3,Math.min(14,Math.floor(L/(hs*1.1))));
 for(let i=1;i<N;i++){const u=i/N;if(u>w)break;const x=lerp(h[0],bg[0],u),y=lerp(h[1],bg[1],u),rr=hs*.28;dots.addPath(polyPath(blob(x,y,rr,rr,i+5,{amp:.1,n:10}),true));}
 s.knockout(dots,.8);s.fill(Y,dots,.95);}
/** "wasn't tall ... jumps high": a vertical bar beside him — yellow from the grass to 1.73 m, then red on top for the height the jump adds */
function heightBar(s:Sheet,c:Cam,T:number,wTall:number,wJump:number){if(wTall<=.02)return;const[x,z]=posOf(PASS_I,T),side=.75,b:V3=[x+c.r[0]*side,0,z+c.r[2]*side];
 const pt=(y:number)=>pr(c,[b[0],y,b[2]]),top=1.73,jump=P_H[1]+.1,wd=Math.max(5,kAt(c,b)*.07);
 const a0=pt(0),a1=pt(top*clamp(wTall));if(!a0||!a1)return;
 const cap=(p:Pt)=>ribbon([[p[0]-wd*1.6,p[1]],[p[0]+wd*1.6,p[1]]],wd*.8,{seed:83,taper:0,wobble:.4});
 const yl=new Path2D();yl.addPath(ribbon([a0,a1],wd,{seed:81,taper:0,wobble:.5}));yl.addPath(cap(a0));if(wTall>=1)yl.addPath(cap(a1));
 s.knockout(yl,.9);s.fill(Y,yl,.95);
 if(wJump>.02){const j1=pt(lerp(top,jump,clamp(wJump)));if(j1){const rd=new Path2D();rd.addPath(ribbon([a1,j1],wd,{seed:82,taper:0,wobble:.5}));if(wJump>=1)rd.addPath(cap(j1));s.knockout(rd,.9);s.fill(R,rd,.95);}}}
/** the contact: a yellow burst off the forehead */
function burstAt(s:Sheet,c:Cam,P:V3,age:number,seed:number,scale=.55,ink=Y){if(age<=-.03||age>=.4)return;const q=pr(c,P);if(!q)return;
 sparkBurst(s,ink,q[0],q[1],kAt(c,P)*scale,{n:10,seed,g:easeOutBack(clamp((age+.03)/.08))*(1-clamp((age-.22)/.18)),width:Math.max(6,kAt(c,P)*.04)});}
/** the net bulging: a red burst where the ball hits it */
function netBurst(s:Sheet,c:Cam,T:number,seed:number){burstAt(s,c,GOAL_IN,T-T_IN,seed,.8,R);}
/** a big yellow tick over the goal */
function tick(s:Sheet,c:Cam,w:number){if(w<=0)return;const a=pr(c,[.2,3.3,-2.2]),m=pr(c,[.2,2.8,-1.3]),z=pr(c,[.2,4.3,.5]);if(!a||!m||!z)return;const tk=partial([a,m,z],clamp(w)),wd=Math.max(10,kAt(c,[0,3,0])*.16);
 s.knockout(ribbon(tk,wd*1.6,{seed:95,taper:.2,wobble:1}),.9);s.fill(Y,ribbon(tk,wd,{seed:95,taper:.2,wobble:1}),.95);}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, near real time
/** T keyed to the words: Passarella comes up from the back ("Captain ... races into the box"), the corner flies on "flies in", his header
 * on "Passarella heads", Luque's dive on "dives", the net on "Four-nil" */
const tau1=(t:number)=>key(t,mono([[0,-12.4],[CUE(0,'Captain')-.1,-6.4],[CUE(0,'races into'),-4],[CUE(0,'flies in')-.25,T_KICK],[CUE(0,'Passarella heads')+.1,0],[CUE(0,'Leopoldo'),.2],[CUE(0,'dives')+.1,T_LU],[CUE(0,'Four-nil')-.1,T_IN+.08],[SECS(0),T_IN+.08+(SECS(0)-CUE(0,'Four-nil')+.1)*.95]]),linear);
const P1:V3=[-36,19,56];
function cam1(t:number):Cam{
 const T=tau1(t),[px,pz]=posOf(PASS_I,T);
 return plan(t,[
  [0,0,()=>({P:P1,T:[-30,3,-4],fov:36})],
  [CUE(0,'must beat')-.2,1.6,()=>({P:P1,T:[-20,1.5,-1],fov:24})],
  [CUE(0,'Captain')-.3,1.2,()=>({P:P1,T:[lerp(px,-10,.35),1,lerp(pz,0,.35)],fov:15})],
  [CUE(0,'flies in')-.5,.9,()=>({P:P1,T:[-8,2,-9],fov:25})],
  [CUE(0,'Passarella heads')-.45,.9,()=>({P:P1,T:[-6.8,1.5,2.2],fov:8})],
  [CUE(0,'dives')-.1,1,()=>({P:P1,T:[-3.6,.9,.2],fov:7.6})],
  [CUE(0,'Four-nil')+.4,1.4,()=>({P:P1,T:[-4.6,1.2,2],fov:11})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),T=tau1(t),tt=twos(t),tp=tau1(tt),tpp=tau1(tt-1/12),fn=CUE(0,'Four-nil');
  stadium(s,c,t,[0,1,3],{roar:sm(fn-.3,fn+.3,t),flash:sm(fn-.2,fn+.2,t)*(1-sm(fn+2,fn+2.8,t))});
  ground(s,c);
  play(s,c,T,tp,tpp,{minBall:8,lines:true,after:()=>netBurst(s,c,T,31)});
 },
 aperture(t){const c=cam1(t),[x,z]=posOf(PASS_I,tau1(t)),q=toCam(c,[x,1.3,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(10,c.F*.35/q[2]),12);},
 still:9.4,
};

// ---------------------------------------------------------------- 2 · slow-motion replay, LOW from behind the far post, facing the play
const tau2=(t:number)=>key(t,mono([[0,-1.25],[CUE(1,"wasn't"),-.9],[CUE(1,'many'),-.66],[CUE(1,'times'),-.5],[CUE(1,'jumps'),-.3],[CUE(1,'eyes'),-.1],[CUE(1,'Header!'),.02],[CUE(1,"Luque's"),T_LU-.06],[CUE(1,'does'),T_IN+.04],[SECS(1),T_NET+.9]]),linear);
const E2:V3=[2.6,2.3,-15];
function cam2(t:number):Cam{
 const T=tau2(t),[px,pz]=posOf(PASS_I,T);
 return plan(t,[
  [0,0,()=>({P:E2,T:[-8,2.2,2.6],fov:30})],
  [CUE(1,"wasn't")-.3,.9,()=>({P:add3(E2,[-.4,0,.6]),T:[px,1.2,pz],fov:17})],
  [CUE(1,'jumps')-.3,.8,()=>({P:add3(E2,[-.4,.1,.6]),T:[px,1.7,pz],fov:16})],
  [CUE(1,"Luque's")-.5,1,()=>({P:add3(E2,[.2,-.3,1.2]),T:[-4,.8,.1],fov:20})],
  [CUE(1,'does')-.2,1,()=>({P:E2,T:[-2.2,.9,-.4],fov:24})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),T=tau2(t),tt=twos(t),tp=tau2(tt),tpp=tau2(tt-1/12),E=SECS(1);
  const wt=CUE(1,"wasn't"),tr=CUE(1,'times'),jh=CUE(1,'jumps'),eo=CUE(1,'eyes'),hd=CUE(1,'Header!'),ld=CUE(1,"Luque's"),dr=CUE(1,'does');
  stadium(s,c,t,[2,3],{roar:sm(dr,dr+.4,t),flash:sm(dr,dr+.4,t)});
  ground(s,c);
  // "times his run": a yellow arrow from where he started his attack to where he takes off
  const[rx,rz]=posOf(PASS_I,T_KICK),[tx,tz]=posOf(PASS_I,-.3);grassArrow(s,c,[rx,.01,rz],[tx,.01,tz],sm(tr-.1,tr+.6,t,easeOut)*(1-sm(hd,hd+.5,t)),Y,.12,74);
  play(s,c,T,tp,tpp,{minBall:7,hero:true,lines:true,after:({pass,bg})=>{
   // "wasn't tall": his height as a yellow bar; "jumps high": the red extra the jump adds
   heightBar(s,c,tp,sm(wt-.1,wt+.5,t)*(1-sm(hd+.2,hd+.6,t)),sm(jh,jh+.6,t));
   groundRing(s,c,tx,tz,.45,sm(jh-.1,jh+.3,t)*(1-sm(hd+.2,hd+.6,t)));
   sightline(s,pass,bg,sm(eo-.15,eo+.35,t)*(1-sm(hd-.05,hd+.2,t)));
   burstAt(s,c,P_H,T,91);
   // "Header!": the flight on to Luque; "Luque's diving header": into the net
   flightArrow(s,c,0,Math.max(.01,Math.min(T,T_LU)),sm(hd,hd+.3,t)*(1-sm(E-.9,E-.6,t)),Y,.1);
   burstAt(s,c,L_H,T-T_LU,92,.5);
   flightArrow(s,c,T_LU,Math.max(T_LU+.01,Math.min(T,T_IN)),sm(ld,ld+.3,t)*(1-sm(E-.9,E-.6,t)),R,.1);
   netBurst(s,c,T,93);}});
 },
 aperture(t){const c=cam2(t),P=add3(P_H,[0,-.8,0]),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(30,c.F*.5/q[2]),12);},
 still:7.4,
};

// ---------------------------------------------------------------- 3 · the lesson: behind the attackers, the goal at the top of the frame
const tau3=(t:number)=>key(t,mono([[0,-5],[CUE(2,'Defenders'),-4.2],[CUE(2,'At corners'),T_KICK-.3],[CUE(2,'run into'),-1],[CUE(2,'attack'),-.35],[CUE(2,'strong'),.02],[SECS(2),.95]]),linear);
const E3:V3=[-25,6.5,11];
function cam3v(t:number):Cam{
 return plan(t,[
  [0,0,()=>({P:E3,T:[-13,1,2],fov:30})],
  [CUE(2,'At corners')-.3,1,()=>({P:add3(E3,[-2,3.5,2]),T:[-7,1,-17],fov:44})],
  [CUE(2,'run into')-.3,1,()=>({P:E3,T:[-9.5,1,3],fov:25})],
  [CUE(2,'strong')-.4,.9,()=>({P:add3(E3,[4.5,-1,-1.5]),T:[-6,1.4,2],fov:15})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),T=tau3(t),tt=twos(t),tp=tau3(tt),tpp=tau3(tt-1/12),E=SECS(2);
  const df=CUE(2,'Defenders'),ac=CUE(2,'At corners'),ri=CUE(2,'run into'),ab=CUE(2,'attack'),st=CUE(2,'strong');
  stadium(s,c,t,[0,1],{roar:sm(st+.3,st+.8,t),flash:.5*sm(st+.3,st+.7,t)});
  ground(s,c);
  // "At corners": a red ring on the corner spot
  groundRing(s,c,CORNER_PT[0],CORNER_PT[2],.9,sm(ac-.1,ac+.4,t)*(1-sm(ri,ri+.5,t)),R);
  // "run into the box": his run from the edge of the box to the take-off spot
  const[rx,rz]=posOf(PASS_I,-4),[tx,tz]=posOf(PASS_I,-.3);grassArrow(s,c,[rx,.01,rz],[tx,.01,tz],sm(ri-.1,ri+.7,t,easeOut)*(1-sm(E-1,E-.6,t)),Y,.16,76);
  play(s,c,T,tp,tpp,{minBall:8,hero:true,lines:true,near:6,after:({pass,bg})=>{
   // "Defenders can score too": a yellow ring under the centre-back as he comes up
   const[dx,dz]=posOf(PASS_I,tp);groundRing(s,c,dx,dz,.8,sm(df-.1,df+.4,t)*(1-sm(ac,ac+.4,t)));
   // the delivery
   flightArrow(s,c,T_KICK,Math.max(T_KICK+.01,Math.min(T,0)),sm(ac+.2,ac+.6,t)*(1-sm(st+.3,st+.7,t)),B,.1);
   // "attack the ball": the take-off ring and his eyes on the ball
   groundRing(s,c,tx,tz,.5,sm(ab-.1,ab+.3,t)*(1-sm(E-.9,E-.5,t)));
   sightline(s,pass,bg,sm(ab-.05,ab+.35,t)*(1-sm(st-.05,st+.2,t)));
   burstAt(s,c,P_H,T,93,.7);
   flightArrow(s,c,0,Math.max(.01,Math.min(T,T_LU)),sm(st,st+.3,t)*(1-sm(E-.8,E-.5,t)),Y,.12);
   netBurst(s,c,T,94);
   tick(s,c,sm(st+.5,st+1.1,t,easeOutBack));}});
 },
 still:7.2,
};

const film:RisoStory={
 id:'passarella-signature',format:'11v11',title:"Passarella's header",
 theme:'Defenders can score too — at corners and free kicks, run into the box and attack the ball with a strong header',
 ageNote:'Argentina 6–0 Peru, 1978 World Cup second round, Estadio Gigante de Arroyito, Rosario, 21 June 1978: the 4–0 (50th minute). For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3]);},
 /** Touch: a header burst — a yellow star off the tap with sky-blue rings. Reduced motion: the still loop. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.6)),fade=age<=0?1:1-clamp((age-.6)/.3),r=rng(seed);
  const rp=new Path2D();for(let k=0;k<2;k++){const rr=(24+44*k)*u+6,pts:Pt[]=[];for(let i=0;i<=28;i++){const a=i/28*TAU;pts.push([x+Math.cos(a)*rr,y+Math.sin(a)*rr]);}rp.addPath(ribbon(pts,5,{close:true,seed:seed+k,taper:0,wobble:.6}));}
  s.tone(B,rp,.7*fade);
  const dp=new Path2D();for(let i=0;i<7;i++){const a=-Math.PI*(.1+.8*r()),sp=50+80*r(),px=x+Math.cos(a)*sp*u,py=y+Math.sin(a)*sp*u;dp.moveTo(px+5,py);dp.arc(px,py,5,0,TAU);}
  s.knockout(dp,.95*fade);s.fill(Y,dp,.7*fade);
  if(age>0&&age<.35)sparkBurst(s,Y,x,y,70,{n:8,seed,g:1-clamp(age/.35),width:9});
 },
};
export default film;
/** Solved contact points (pitch metres; x to the Peru goal line at 0, z across; +z = the main-stand side) — checked by the test. */
export const FACTS={CORNER_PT,P_H,L_H,GOAL_IN,GOAL,ballAt,T_KICK,T_LU,T_IN,passAt:(T:number)=>posOf(PASS_I,T),luqueAt:(T:number)=>posOf(LUQ_I,T),keeperAt:(T:number)=>posOf(GK_I,T),markAt:(T:number)=>posOf(MARK_I,T)};
