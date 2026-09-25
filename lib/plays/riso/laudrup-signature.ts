/** Michael Laudrup's signature — "the no-look through ball" (lib/town/iconicPlays.json, kind "signature"), shown through ONE real,
 * well-documented moment: Osasuna 2–3 Barcelona, La Liga matchday 5, El Sadar, Pamplona, 3 October 1993 — Laudrup's lifted no-look pass
 * over the Osasuna defence for Romário, who lobbed keeper Unanua for Barcelona's second goal (0–2, 39th minute). An iconic-play riso film
 * (RisoStory, chapters mode) played in the player card's picture window or StoryFilmPlayer. A 1:1 reconstruction of the assist from WRITTEN
 * accounts (the footage itself was not reviewed), rendered as a riso print.
 *
 * WHY THIS MOMENT: Laudrup himself names it as the first time his no-look pass became famous ("la primera vez que fue famoso pasó en España,
 * cuando le di el pase a Romario en Pamplona contra Osasuna"); the Spanish press then called that kind of assist "el pase de Laudrup" — the
 * ball scooped over the defence with the foot like a spoon while his eyes were on the stand. It is the pass the signature is named after.
 *
 * SOURCES (read Sept 2026 with curl; cached under scratchpad/films/src-cache/):
 *  - El Enganche, "El pase de Laudrup" (elenganche.es, c. 2014, via the Wayback Machine): the pass "consiste en utilizar el pie como una
 *    cuchara para elevar el balón y que supere por arriba a la defensa rival, dejando a tu compañero solo ante el portero"; "el pase se
 *    realiza mirando al tendido. Mientras los ojos están clavados en la grada, el pie apunta en una dirección perpendicular"; Laudrup: "la
 *    primera vez que fue famoso pasó en España, cuando le di el pase a Romario en Pamplona contra Osasuna"; "Aquello fue el 3 de octubre de
 *    1993. El Barcelona visitaba a Osasuna en El Sadar y ganaba por 0-1 cuando Laudrup superó a la defensa rojiza con un pase picado, para que
 *    Romario batiera a Unanua con una vaselina e hiciera el 0-2. El encuentro terminó con victoria por 2-3 del Barcelona"; Laudrup on why:
 *    "Veía que no había sitio por abajo, que no había espacio entre los jugadores y la única manera de pasar el balón era por encima."
 *  - Wikipedia (en) "1993–94 FC Barcelona season" (action=raw): 3 October 1993, round 5, El Sadar, Pamplona, Osasuna 2–3 Barcelona; Romário
 *    33' 39', Stoichkov 82'; Merino 65', Ziober 89'. Season kits: home blaugrana, away teal.
 *  - Wikipedia (en) "Michael Laudrup": "Made in Laudrup" coined in the Spanish media for his trademark assists, "in particular his lobbed
 *    passes"; vision and range of passing incl. through balls. Wikipedia (es) "Michael Laudrup": his "pases sin mirar a la jugada".
 * CONFIRMED by those accounts: Osasuna v Barcelona at El Sadar, Pamplona, 3 October 1993; Barcelona led 0–1; Laudrup lifted ("picado", the
 * foot used like a spoon) the ball OVER the Osasuna defence because there was no room along the ground, while looking at the stand, not at
 * the play; Romário ran through and beat keeper Unanua with a LOB (vaselina) for 0–2 (Romário's second goal, 39'); Barcelona won 3–2.
 * INFERRED (illustrative reconstruction — the footage was not checked): every position, distance and timing (Laudrup ~27 m out, centre-right,
 * two Osasuna midfielders closing him and a back four stepping up ~17 m out; Romário starting level with the last defender, left of centre,
 * and running through the middle; the ball's height, one bounce with backspin, Romário's first-time lob on the half-volley and where it
 * crossed the line); which way Laudrup looked (drawn: to his left, at the main stand where the TV camera sits) and which foot lifted the ball
 * (drawn: the RIGHT — iconicPlays names it and Laudrup was right-footed, but it is never named in the narration); Unanua's late back-pedal
 * leap; the kits (drawn: Barcelona in their blaugrana home stripes with navy shorts and blue socks — the teal away kit is possible since
 * Osasuna wear red; Osasuna red shirts, navy shorts, red socks; Unanua in yellow; the referee in black); no shirt numbers printed; an
 * evening under floodlights (kick-off time not verified); El Sadar drawn as a compact four-sided ground close to the pitch with a red crowd;
 * the other players (unnamed); a plain white ball with dark panels.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in near REAL TIME (Laudrup brings it forward, looks at the crowd,
 * scoops it over the back line, Romário's lob, the net) · ch2 = the TV slow-motion REPLAY from a low pitch-side camera on Laudrup's left: his
 * eyes on the stand (a yellow sight line) while the foot lifts the ball the other way (the spoon, the red flight line) · ch3 = a reverse-angle
 * replay from BEHIND the passer: the red wall along the grass, the ball over the top, Romário's run and the lob over Unanua · ch4 = the lesson
 * from a low front camera on the same beat (look one way: the yellow eye line; pass the other: the red pass arrow; the fooled defenders).
 * Composed for the card window (≈ 1.45:1 down to square): the world is centred on the CANVAS centre (never sheet.safe), cameras are real
 * pinhole projections of metres.
 * FIGURES: every body goes through ONE adapter, drawPlayer() → the shared fluid-body library ./athlete. The scoop is authored as key poses
 * (plant, short back-lift, the toes pulled up under the ball, a lifting follow-through, the head turned to the stand throughout).
 * Inks: yellow, red, blue, navy. Scenes read only their local t; drawn objects on twos, cameras on ones; all randomness seeded.
 * Budget: ~150–250 plate ops per frame (4 plates); small figures in wide shots print at 'low' detail, passages cap figure detail. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,rectPath,easeOut,easeOutBack,easeInOutSine,linear,TAU,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,posed,keyPoses,blendPose,stand,runCycle,strike,keeperSet,keeperTip,celebrate,STRIKE_CONTACT,
 type Pose,type V3,type AthleteStyle,type Place,type InkFill,type Build,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Narration, cue words and provisional timings (≈2.5 words/s). `at` = word onset in the chapter's audio (s); `seconds` includes the silent
 * tail that carries the .65 s passage. The Kokoro generator (scripts/plays/kokoro-narrate.py) writes timing.json; withTiming then swaps in the
 * real clip lengths and word onsets and every action below re-times itself. Cue words must stay substrings of the text (script.json mirrors it). */
const TIMING:{label:string;text:string;seconds:number;cues:[number,string][]}[]=[
 {label:'The pass, live',text:'El Sadar, Pamplona, October 1993. Osasuna against Barcelona. Laudrup has the ball, and no gap to pass through. He looks at the crowd... but scoops it over the defence! Romário lobs the keeper. Goal!',seconds:15.4,
  cues:[[.2,'El Sadar'],[2.7,'Osasuna against'],[4.6,'Laudrup has'],[6.2,'no gap'],[8.2,'He looks'],[9.7,'but scoops'],[11.6,'Romário lobs'],[13.1,'Goal']]},
 {label:'Watch his eyes',text:'Watch his eyes. Laudrup looks to the side, but his foot lifts the ball forward, like a spoon. His famous no-look pass!',seconds:10,
  cues:[[.15,'Watch his eyes'],[1.4,'Laudrup looks'],[2.4,'to the side'],[3.6,'his foot lifts'],[5.4,'like a spoon'],[6.7,'His famous'],[7.5,'no-look pass']]},
 {label:'Over the top',text:'No space along the grass, so the ball flies over the top. Romário runs in and chips keeper Unanua.',seconds:9.2,
  cues:[[.15,'No space'],[1.9,'so the ball'],[2.7,'flies over'],[4.5,'Romário runs'],[5.8,'chips keeper'],[6.8,'Unanua']]},
 {label:'Your turn',text:'Your turn: look one way and pass the other, to fool the defenders!',seconds:7,
  cues:[[.15,'Your turn'],[1.3,'look one way'],[2.7,'pass the other'],[4.1,'fool the defenders']]},
];
/** Kokoro timing: null until the lead voices the film. After running kokoro-narrate.py, replace `null` with the import of
 * '../../../public/plays/narration/laudrup-signature/timing.json' (as the other films do) — nothing else changes. */
import timingJson from '../../../public/plays/narration/laudrup-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming(TIMING.map(c=>({label:c.label,narration:c.text,seconds:c.seconds,cues:c.cues.map(([at,words])=>({at,words}))})),VOICE);
/** onset of the cue whose words start with w in chapter i */
const CUEW=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('laudrup: cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
/** key() needs increasing times: push each key at least `gap` after the previous one (real voice timings can crowd authored offsets) */
function mono(K:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of K)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}

// ---------------------------------------------------------------- inks, vectors
const Y='yellow',R='red',B='blue',K='navy';
const add=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const sub=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const mul=(a:V3,k:number):V3=>[a[0]*k,a[1]*k,a[2]*k];
const dot=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const cross=(a:V3,b:V3):V3=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const nrm=(a:V3):V3=>{const l=Math.hypot(a[0],a[1],a[2])||1;return[a[0]/l,a[1]/l,a[2]/l];};
const mix3=(a:V3,b:V3,u:number):V3=>[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,a[2]+(b[2]-a[2])*u];
const lerpAng=(a:number,b:number,u:number)=>{const d=((b-a)%TAU+TAU*1.5)%TAU-Math.PI;return a+d*clamp(u);};

// ---------------------------------------------------------------- the card-window frame + the TV camera (a real pinhole projection)
/** world (0,0) on the CANVAS centre, 1 world unit = 1 sheet unit (× the engine's arrival scale, so passages and seams stay exact) */
function frame(s:Sheet){const S=s.arrival;s.camera((s.cx-s.W/2)/S,(s.cy-s.H/2)/S,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
/** a narrower (square) window gets a slightly wider lens so the action still fits (set by frame()) */
let LENS=1;
/** metres, right-handed, y up. Osasuna's goal line is x = 0 (posts z = ±3.66, net toward +x), the pitch runs to x = −105, touchlines
 * z = ±34. Barcelona attack +x; the main camera sits in the main stand on the −z side. A figure facing +x has its right side at +z. */
type Cam={eye:V3;F:number;f:V3;r:V3;u:V3;project(p:V3):[number,number,number];scale(p:V3):number};
function lookAt(eye:V3,target:V3,F:number):Cam{const f=nrm(sub(target,eye)),r=nrm(cross(f,[0,1,0])),u=cross(r,f);
 return{eye,F,f,r,u,project:p=>{const d=sub(p,eye),z=Math.max(.05,dot(d,f));return[F*dot(d,r)/z,-F*dot(d,u)/z,z];},scale:p=>F/Math.max(.05,dot(sub(p,eye),f))};}
const NEAR=.35;
const toCam=(c:Cam,P:V3):V3=>{const d=sub(P,c.eye);return[dot(d,c.r),dot(d,c.u),dot(d,c.f)];};
const scr=(c:Cam,q:V3):Pt=>[c.F*q[0]/q[2],-c.F*q[1]/q[2]];
function pr(c:Cam,P:V3):Pt|null{const q=toCam(c,P);return q[2]<NEAR?null:scr(c,q);}
function polyP(c:Cam,pts:V3[]):Pt[]{const q=pts.map(p=>toCam(c,p)),out:V3[]=[];
 for(let i=0;i<q.length;i++){const a=q[i],b=q[(i+1)%q.length],ia=a[2]>=NEAR,ib=b[2]>=NEAR;if(ia)out.push(a);if(ia!==ib){const k=(NEAR-a[2])/(b[2]-a[2]);out.push([a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,NEAR]);}}
 return out.map(p=>scr(c,p));}
const addPoly=(path:Path2D,q:Pt[])=>{if(q.length>2)path.addPath(polyPath(q,true));};
/** a 3D segment as a projected quad (near-clipped), width wm metres */
function seg3(c:Cam,a:V3,b:V3,wm:number,out:Path2D,cap=1e9){let qa=toCam(c,a),qb=toCam(c,b);if(qa[2]<NEAR&&qb[2]<NEAR)return;
 const cut=(p:V3,q:V3):V3=>{const k=(NEAR-p[2])/(q[2]-p[2]);return[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k,NEAR];};if(qa[2]<NEAR)qa=cut(qa,qb);else if(qb[2]<NEAR)qb=cut(qb,qa);
 const A=scr(c,qa),Bp=scr(c,qb),wa=clamp(c.F*wm/qa[2]/2,1.1,cap),wb=clamp(c.F*wm/qb[2]/2,1.1,cap),dx=Bp[0]-A[0],dy=Bp[1]-A[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 out.moveTo(A[0]+nx*wa,A[1]+ny*wa);out.lineTo(Bp[0]+nx*wb,Bp[1]+ny*wb);out.lineTo(Bp[0]-nx*wb,Bp[1]-ny*wb);out.lineTo(A[0]-nx*wa,A[1]-ny*wa);out.closePath();}
type View={hx:number;hy:number};
const view=(s:Sheet):View=>({hx:s.W/(2*.68)+80,hy:s.H/(2*.68)+80});
/** a projected ground ring (metres) */
function groundRing(c:Cam,cx:number,cz:number,rx:number,rz:number,n=36):Pt[]{const pts:Pt[]=[];for(let i=0;i<n;i++){const a=i/n*TAU,q=pr(c,[cx+Math.cos(a)*rx,0,cz+Math.sin(a)*rz]);if(q)pts.push(q);}return pts;}
const kAt=(c:Cam,P:V3)=>c.F/Math.max(1,toCam(c,P)[2]);

// ---------------------------------------------------------------- El Sadar on an October evening: a compact four-sided ground, stands close to the pitch, a red crowd
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-120,26,a),1.2+24*b,39+30*b],
 (a,b)=>[9+30*b,1.2+20*b,lerp(-66,70,a)],
 (a,b)=>[lerp(26,-120,a),1.2+26*b,-39-28*b],
 (a,b)=>[-114-30*b,1.2+20*b,lerp(70,-66,a)],
];
const STAND_COLS=[130,80,120,80],STAND_ROWS=[13,11,11,11],TIERS=[[.5],[.5],[.55],[.5]];
/** the roof edges of the stands (a dark band) and floodlights along them */
const ROOF:[V3,V3][]=[[[-120,25.6,69.5],[26,25.6,69.5]],[[39.5,21.6,-66],[39.5,21.6,70]],[[-120,27.6,-67.5],[26,27.6,-67.5]]];
const LAMPS:V3[]=[[-96,27,70],[-62,27,70],[-28,27,70],[6,27,70],[40,23,-40],[40,23,0],[40,23,40],[-96,29,-68],[-50,29,-68],[-4,29,-68]];
/** night sky, stand planes with a tier front, a crowd speckle (paper and Osasuna red, a few blue and yellow), roof bands, floodlight halos;
 * roar lifts the crowd, flash pops camera flashes */
function stadium(s:Sheet,c:Cam,v:View,t:number,o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,tt=twos(t),all=rectPath(-1e4,-1e4,2e4,2e4);
 s.tone(K,all,.86);s.tone(B,all,.25);
 const planes=new Path2D(),fronts=new Path2D();
 const own=(si:number)=>si===2&&c.eye[2]<-38;
 STANDS.forEach((S,si)=>{if(own(si))return;addPoly(planes,polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]));for(const b of TIERS[si])seg3(c,S(0,b),S(1,b),1.2,fronts);seg3(c,S(0,0),S(1,0),.9,fronts);});
 ROOF.forEach(([a,b],i)=>{if(i===2&&c.eye[2]<-38)return;seg3(c,a,b,2.4,fronts);});
 s.knockout(planes);s.fill(B,planes,.62);s.tone(K,planes,.55);
 const dots=[new Path2D(),new Path2D(),new Path2D(),new Path2D()],any=[0,0,0,0];
 STANDS.forEach((S,si)=>{if(own(si))return;const cols=STAND_COLS[si],rows=STAND_ROWS[si];for(let j=0;j<rows;j++){const b=(j+.5)/rows;if(TIERS[si].some(q=>Math.abs(b-q)<.04))continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,6);if(h<.12)continue;const a=(i+.5+(hash(i+j*31,9)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR+1)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.5/q[2],2.4,12),lift=roar>0?roar*z*(.4+1.1*Math.max(0,Math.sin(tt*12+h*TAU))):0;
   const ink=h<.4?0:h<.86?1:h<.95?2:3;dots[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);any[ink]++;}}});
 if(any[0])s.knockout(dots[0],.75);if(any[1])s.fill(R,dots[1],.95);if(any[2])s.fill(B,dots[2],.95);if(any[3])s.fill(Y,dots[3],.9);
 s.fill(K,fronts,.85);
 const halo=[new Path2D(),new Path2D(),new Path2D()],core=new Path2D();let nl=0;
 for(const L of LAMPS){const q=toCam(c,L);if(q[2]<NEAR+2)continue;const p=scr(c,q),r=clamp(c.F*1.3/q[2],5,55);if(Math.abs(p[0])>v.hx+r*3||Math.abs(p[1])>v.hy+r*3)continue;nl++;
  for(let k=0;k<3;k++){const rr=r*(1+(3-k)*.55);halo[k].addPath(polyPath(blob(p[0],p[1],rr*1.5,rr,Math.round(L[0])+k,{amp:.04,n:14}),true));}
  core.addPath(rectPath(p[0]-r*1.3,p[1]-r*.32,r*2.6,r*.64));}
 if(nl){s.knockout(halo[2],.25);s.tone(Y,halo[0],.3);s.tone(Y,halo[1],.5);s.tone(Y,halo[2],.7);s.knockout(core,.95);s.fill(Y,core,.6);}
 if(flash>0){const p=new Path2D();const fr=Math.floor(tt*12);for(let i=0;i<12;i++){const r1=hash(i*17+fr*101,3),r2=hash(i*29+fr*7,4),si=r1<.55?0:r1<.8?1:3,q=pr(c,STANDS[si](r2,.08+.8*hash(i,fr)));if(!q||hash(i*5+fr,8)>flash)continue;const z=9+12*flash;
  p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.3],[q[0]+z,q[1]],[q[0],q[1]+z*.3]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}
  s.knockout(p);s.fill(Y,p,.6);}
}
/** grass under floodlights (yellow × blue), mowing stripes, boards with paper panels, paper lines */
function ground(s:Sheet,c:Cam){
 const g=polyP(c,[[-116,0,-40],[10,0,-40],[10,0,40],[-116,0,40]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.95);s.tone(B,gp,.8);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-37],[-(k+1)*5.25,0,-37],[-(k+1)*5.25,0,37],[-k*5.25,0,37]]));s.tone(K,st,.12);
 const bd=new Path2D(),pn=new Path2D();
 addPoly(bd,polyP(c,[[7.2,0,-30],[7.2,0,30],[7.2,.9,30],[7.2,.9,-30]]));addPoly(bd,polyP(c,[[-110,0,37],[5,0,37],[5,.9,37],[-110,.9,37]]));addPoly(bd,polyP(c,[[-110,0,-37],[5,0,-37],[5,.9,-37],[-110,.9,-37]]));
 for(let k=0;k<10;k++){const z=-28+k*6;addPoly(pn,polyP(c,[[7.15,.28,z],[7.15,.28,z+3],[7.15,.62,z+3],[7.15,.62,z]]));}
 for(let k=0;k<18;k++){const x=-106+k*6.2;addPoly(pn,polyP(c,[[x,.28,36.95],[x+3,.28,36.95],[x+3,.62,36.95],[x,.62,36.95]]));addPoly(pn,polyP(c,[[x,.28,-36.95],[x+3,.28,-36.95],[x+3,.62,-36.95],[x,.62,-36.95]]));}
 s.knockout(bd);s.fill(R,bd,.85);s.fill(K,bd,.3);s.knockout(pn,.9);s.tone(Y,pn,.3);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.12,ln);
 for(let k=0;k<8;k++){L([-k*13.125,0,-34],[-(k+1)*13.125,0,-34]);L([-k*13.125,0,34],[-(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){L([0,0,-34+k*17],[0,0,-34+(k+1)*17]);L([-52.5,0,-34+k*17],[-52.5,0,-34+(k+1)*17]);}
 L([0,0,-20.16],[-16.5,0,-20.16]);L([-16.5,0,-20.16],[-16.5,0,20.16]);L([-16.5,0,20.16],[0,0,20.16]);
 L([0,0,-9.16],[-5.5,0,-9.16]);L([-5.5,0,-9.16],[-5.5,0,9.16]);L([-5.5,0,9.16],[0,0,9.16]);
 const circ=(cx:number,cz:number,r:number,a0:number,a1:number,n:number)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(-11,0,9.15,Math.PI-.927,Math.PI+.927,10);circ(-52.5,0,9.15,0,TAU,24);
 addPoly(ln,polyP(c,[[-11.18,0,-.18],[-10.82,0,-.18],[-10.82,0,.18],[-11.18,0,.18]]));
 s.knockout(ln);
}
/** the goal: posts z ±3.66, bar 2.44, net 2 m deep with a sloping roof; bulge pushes the back out around bz */
function goal3(s:Sheet,c:Cam,bulge:number,bz:number){
 const z0=-3.66,z1=3.66,H=2.44,back=(z:number)=>2+bulge*.8*Math.exp(-Math.pow((z-bz)/1.6,2)),zs=[z0,-1.8,0,1.8,z1];
 const planes:V3[][]=[[[0,0,z0],[0,H,z0],[back(z0),1.9,z0],[back(z0),0,z0]],[[0,0,z1],[0,H,z1],[back(z1),1.9,z1],[back(z1),0,z1]],
  [[0,H,z0],[0,H,z1],...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)],[...zs.map(z=>[back(z),0,z] as V3),...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));s.knockout(net,.32);
 const mesh=new Path2D(),w=.022,S3=(a:V3,b:V3)=>seg3(c,a,b,w,mesh,2.2);
 for(let i=0;i<=12;i++){const z=lerp(z0,z1,i/12);S3([0,H,z],[back(z),1.9,z]);S3([back(z),1.9,z],[back(z),0,z]);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<4;i++)S3([back(zs[i]),y,zs[i]],[back(zs[i+1]),y,zs[i+1]]);S3([0,y*H/1.9,z0],[back(z0),y,z0]);S3([0,y*H/1.9,z1],[back(z1),y,z1]);}
 for(let j=1;j<4;j++){const u=j/4;S3([2*u,H-.54*u,z0],[2*u,H-.54*u,z1]);}
 s.fill(K,mesh,.75);
 const fr=new Path2D(),fo=new Path2D();for(const[a,b] of [[[0,0,z0],[0,H,z0]],[[0,0,z1],[0,H,z1]],[[0,H,z0-.06],[0,H,z1+.06]]] as [V3,V3][]){seg3(c,a,b,.13,fr);seg3(c,a,b,.2,fo);}
 s.knockout(fo);s.stroke(K,fo,2.2,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- the ball + marks
/** paper ball, navy panels, blue shade crescent, navy rim, glint. (x,y) = centre; r in sheet units; smear stretches it along dir */
function ball(s:Sheet,x:number,y:number,r:number,rot:number,smear=0,dir=0){
 let pts=blob(x,y,r,r,3,{amp:.02,n:28});
 if(smear>0){const dx=Math.cos(dir),dy=Math.sin(dir);pts=pts.map(q=>{const b=-((q[0]-x)*dx+(q[1]-y)*dy);return b>0?[q[0]-dx*smear*Math.min(1,b/r),q[1]-dy*smear*Math.min(1,b/r)] as Pt:q;});}
 const disc=polyPath(pts,true);s.knockout(disc);
 s.save();s.clip(disc);
 const sh=new Path2D();sh.arc(x,y,r*1.05,0,TAU);sh.moveTo(x-r*.28+r*1.2,y-r*.3);sh.arc(x-r*.28,y-r*.3,r*1.2,0,TAU,true);s.tone(B,sh,.45);
 if(r>5){const pan=new Path2D(),pent=(cx:number,cy:number,pr_:number,a0:number)=>{const q:Pt[]=[];for(let i=0;i<5;i++){const a=a0+i/5*TAU;q.push([cx+Math.cos(a)*pr_,cy+Math.sin(a)*pr_]);}return polyPath(q,true);};
  pan.addPath(pent(x+Math.cos(rot)*r*.2,y+Math.sin(rot)*r*.2,r*.3,rot));for(let i=0;i<5;i++){const a=rot+Math.PI/5+i/5*TAU;pan.addPath(pent(x+Math.cos(a)*r*.92,y+Math.sin(a)*r*.92,r*.28,a+Math.PI));}s.fill(K,pan,.95);}
 s.restore();
 s.fill(K,ribbon(pts,Math.max(2.2,r*.08),{seed:4,close:true,pressure:.4,wobble:r*.015}),.95);
 if(r>14)s.knockout(polyPath(blob(x-r*.42,y-r*.44,r*.14,r*.09,5,{amp:.05,n:10}),true));
}
/** a dashed yellow ribbon through projected points (the ball's path, a sight line) */
function dashes(s:Sheet,pts:Pt[],w:number,cov:number,seed:number,n=9,ink=Y){if(pts.length<2||cov<=0)return;const gaps:[number,number][]=[];for(let i=0;i<n;i++)gaps.push([(i+.62)/n,(i+.98)/n]);
 const p=ribbon(pts,w,{seed,taper:.2,wobble:.6,gaps});s.knockout(p,.85*cov);s.fill(ink,p,.95*cov);}
/** a solid ink ribbon with a knocked-out halo (so it reads over grass and bodies) */
function band(s:Sheet,pts:Pt[],w:number,ink:string,cov:number,seed:number,taper=.1){if(pts.length<2||cov<=0)return;s.knockout(ribbon(pts,w*1.7,{seed,taper,wobble:.8}),.8*cov);s.fill(ink,ribbon(pts,w,{seed,taper,wobble:.8}),.95*cov);}

// ---------------------------------------------------------------- kits (athlete styles)
const SKIN1:InkFill[]=[[R,.75],[Y,.2]],SKIN2:InkFill[]=[[Y,.32],[R,.2]],SKIN_ROM:InkFill[]=[[R,.8],[K,.2]],SKIN_LAU:InkFill[]=[[R,.75],[Y,.18]];
/** Barcelona 1993–94 home (inferred worn that night): blaugrana stripes (red shirt, blue stripes); navy shorts, blue socks; no numbers */
const BAR=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,pattern:'stripes',patternInk:B,shorts:[K,.95],socks:[B,.9],boots:K,skin:SKIN1,hair:K,line:K,trim:[K,.8],hairStyle:'short',seed:70,...o});
/** Osasuna home (inferred): red shirts, navy shorts, red socks */
const OSA=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,shorts:[K,.95],socks:R,boots:K,skin:SKIN2,hair:K,line:K,trim:'paper',hairStyle:'short',seed:40,...o});
const B_LAU:Build={height:1.83,bulk:.95},B_ROM:Build={height:1.67,bulk:1.03,thighs:1.12},B_GK:Build={height:1.84};
const LAU_ST=BAR({skin:SKIN_LAU,hair:[K,.72],build:B_LAU,seed:9});
const ROM_ST=BAR({skin:SKIN_ROM,hair:[K,.95],build:B_ROM,seed:11});
const UNA_ST:AthleteStyle={shirt:Y,shorts:[K,.9],socks:Y,boots:K,skin:SKIN2,hair:[K,.85],line:K,gloves:'paper',trim:K,sleeves:'long',hairStyle:'short',build:B_GK,seed:1};
const REF_ST:AthleteStyle={shirt:[K,.9],shorts:[K,.9],socks:[K,.9],trim:'paper',boots:K,skin:SKIN2,hair:[K,.7],hairStyle:'balding',line:K,seed:33};

// ---------------------------------------------------------------- the play: keyframed tracks (τ = seconds after the scoop's contact)
/** 0: the scoop (Laudrup's boot under the ball) · TL: the ball lands (backspin checks it) · TC: Romário's lob on the half-volley · TG: over
 * the line */
const TL=1.5,TC=1.85,TG=TC+1.05;
type Role='lau'|'rom'|'gk'|'def'|'press'|'run'|'ref';
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];hero?:boolean};
/** positions [τ, x, z], Hermite-interpolated. All inferred from the written accounts (see header). */
const ACTORS:Actor[]=[
 {name:'Michael Laudrup',role:'lau',hero:true,style:LAU_ST,keys:[[-12,-41,8.5],[-8,-36,6.4],[-5,-32,4.8],[-2.5,-28.9,3.7],[-1,-27.5,3.15],[-.35,-26.95,3],[0,-26.8,2.95],[.4,-26.6,2.9],[1.2,-25.6,2.6],[3,-23,2],[6,-19.5,1],[12,-14,.5]]},
 {name:'Romário',role:'rom',style:ROM_ST,keys:[[-12,-22,-6.6],[-6,-18.6,-4.9],[-2.5,-18.1,-4.5],[-.8,-18.2,-4.35],[0,-17.6,-3.95],[.5,-14.9,-3.2],[1,-12.6,-2.45],[1.5,-11.1,-1.85],[TC,-10.45,-1.6],[2.3,-9.2,-1.2],[TG,-8.3,-.6],[4,-7,1.4],[7,-6.5,6.5],[12,-8,12]]},
 {name:'Unanua',role:'gk',style:UNA_ST,keys:[[-12,-4.6,1.4],[-3,-5,.9],[0,-5.6,.4],[1,-6.6,-.2],[1.6,-7.2,-.5],[TC,-7.35,-.6],[2.4,-7.3,-.55],[12,-7.3,-.5]]},
 {name:'Osasuna left-back',role:'def',style:OSA({seed:41}),keys:[[-12,-19.5,11.5],[-3,-18,9.2],[0,-17.5,8.6],[1,-16.6,7.8],[3,-13,5.2],[12,-9,3]]},
 {name:'Osasuna centre-back',role:'def',style:OSA({seed:42,build:{height:1.86},hair:[K,.9]}),keys:[[-12,-19.4,3.6],[-3,-18,2.6],[0,-17.4,2.2],[.6,-17.2,1.8],[1.6,-15,.7],[3,-11.8,-.2],[12,-7,0]]},
 {name:'Osasuna centre-back 2',role:'def',style:OSA({seed:43,build:{height:1.85}}),keys:[[-12,-19.8,-4.8],[-3,-18.2,-3.3],[0,-17.5,-2.9],[.6,-17.3,-2.7],[1.6,-14.8,-2],[3,-11.2,-1],[12,-6.6,-.4]]},
 {name:'Osasuna right-back',role:'def',style:OSA({seed:44,hairStyle:'curly'}),keys:[[-12,-19.4,-11.6],[-3,-18,-10.2],[0,-17.4,-9.6],[1.5,-15.7,-8],[4,-12,-5],[12,-9,-4]]},
 {name:'Osasuna midfielder',role:'press',style:OSA({seed:45}),keys:[[-12,-31,1],[-5,-25.6,2.1],[-1,-24.6,2.6],[0,-24.4,2.7],[.8,-24.6,2.5],[3,-24,2],[12,-20,1]]},
 {name:'Osasuna midfielder 2',role:'press',style:OSA({seed:46,hair:[K,.6]}),keys:[[-12,-29,8],[-5,-25,6],[-1,-24,5.2],[0,-23.9,5.1],[1.5,-23,4.2],[12,-18,3]]},
 {name:'Osasuna midfielder 3',role:'press',style:OSA({seed:47}),keys:[[-12,-27,-4],[-4,-22.4,-1.6],[0,-21.2,-1],[2,-20.4,-1.2],[12,-17,-2]]},
 {name:'Barcelona forward',role:'run',style:BAR({seed:71}),keys:[[-12,-25,-15],[-4,-20.5,-13.2],[0,-18.6,-12.6],[2,-15.2,-10.4],[5,-11,-7],[12,-8,-3]]},
 {name:'Barcelona forward 2',role:'run',style:BAR({seed:72,skin:SKIN2}),keys:[[-12,-26,14],[-4,-21,12.6],[0,-19.4,12],[2,-16.4,10.2],[12,-12,8]]},
 {name:'Barcelona midfielder',role:'run',style:BAR({seed:73,hairStyle:'curly'}),keys:[[-12,-42,-3],[-4,-34,-2],[0,-31,-1.2],[4,-26,0],[12,-20,0]]},
 {name:'referee',role:'ref',style:REF_ST,keys:[[-12,-42,-10],[-4,-33,-8.4],[0,-30,-7.4],[4,-25,-6],[12,-19,-4]]},
];
const LAU=0,ROM=1,GK=2,DEF=[3,4,5,6],PRESS=[7,8,9];
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (drives the gait phase) — built once */
const T0=-13,T1=13,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.06),b=posOf(k,tau+.06);return[(b[0]-a[0])/.12,(b[1]-a[1])/.12];};
/** yaw that faces the direction (dx,dz): athlete.ts faces +x at yaw 0 and yaw turns left, so facing = (cos y, −sin y) */
const yawTo=(dx:number,dz:number)=>Math.atan2(-dz,dx);

// ---------------------------------------------------------------- the no-look scoop: key poses on the athlete skeleton (u = τ)
/** Head turned to his LEFT (at the main stand) the whole time; the left foot plants beside the ball, a short back-lift, then the right boot
 * slides UNDER the ball with the toes pulled up (the spoon) and lifts through it; he leans back a touch so the ball climbs; the follow-through
 * points the boot at the pass while the face still looks at the stand. */
const SCOOP:[number,Pose][]=[
 [-.6,posed({lHipF:30,lKnee:34,rHipF:-12,rKnee:52,rAnk:18,lean:10,pitch:4,twist:8,lShA:22,rShA:24,lElb:52,rElb:52,neckP:8,neckY:46})],
 [-.3,posed({lHipF:26,lKnee:30,lAnk:-8,rHipF:-26,rKnee:76,rAnk:20,lean:6,pitch:2,twist:16,lShA:50,rShA:34,lShF:10,rShF:-14,lElb:40,rElb:46,neckY:64,neckP:4,squash:-.04})],
 [0,posed({lHipF:22,lKnee:34,lAnk:-6,rHipF:24,rKnee:30,rAnk:-24,rHipR:12,lean:-2,pitch:-2,twist:20,lShA:62,rShA:40,lShF:14,rShF:-8,lElb:36,rElb:44,neckY:70,neckP:0,squash:.03})],
 [.22,posed({lHipF:10,lKnee:28,lAnk:10,rHipF:60,rKnee:14,rAnk:-16,lean:-5,pitch:-3,twist:16,lShA:56,rShA:36,lShF:4,rShF:10,lElb:40,rElb:46,neckY:56,neckP:2,air:.02})],
 [.6,posed({lHipF:-6,lKnee:26,rHipF:28,rKnee:36,lean:6,pitch:2,twist:4,lShA:30,rShA:26,lElb:50,rElb:50,neckY:18,neckP:0})],
];
/** his body yaw: his run → squared up to the pass (the landing spot L1, below) through the scoop → back to his run */
function lauYaw(tau:number):number{
 const v=velOf(LAU,tau),run=yawTo(v[0],v[1]);if(tau<-1.4)return run;
 const[x,z]=posOf(LAU,0),aim=yawTo(L1[0]-x,L1[2]-z);return lerpAng(run,aim,sm(-1.4,-.6,tau)*(1-sm(.9,1.6,tau)));
}
/** the look: how far his head is turned to the stand (0..1) — before, through and after the scoop */
const lookW=(tau:number)=>sm(-1.5,-.9,tau)*(1-sm(.45,1.1,tau));

// ---------------------------------------------------------------- poses from the tracks
function loco(k:number,tau:number):Pose{
 const v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),q=clamp(sp/8),ph=distOf(k,tau)/(2.4+2.2*q)+k*.37;
 const run=runCycle(ph,{speed:q});if(sp>1.4)return run;
 const idle=blendPose(stand(),posed({lHipF:24,rHipF:18,lKnee:30,rKnee:26,lean:14,pitch:4,neckP:-10,lShA:18,rShA:16,lElb:40,rElb:36,rAnk:-6,lAnk:-6}),.5+.5*Math.sin(tau*1.7+k));
 return blendPose(idle,run,clamp((sp-.25)/1.15));
}
function faceYaw(k:number,tau:number,target?:V3):number{
 const v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),p=posOf(k,tau),b=target??ballAt(tau),tx=b[0]-p[0],tz=b[2]-p[1],tl=Math.hypot(tx,tz)||1,w=clamp((sp-.6)/1.6);
 return yawTo(lerp(tx/tl,v[0]/(sp||1),w),lerp(tz/tl,v[1]/(sp||1),w));
}
type State={pose:Pose;place:Place};
/** a presser closing Laudrup down: low, arms out, weight forward */
const CLOSE=posed({lHipF:30,rHipF:26,lKnee:46,rKnee:42,lHipA:14,rHipA:14,lean:18,pitch:4,lShA:38,rShA:34,lShF:18,rShF:14,lElb:50,rElb:48,neckP:16});
function lauPose(tau:number):Pose{
 let p=loco(LAU,tau);
 if(tau>-.95&&tau<1.2){const s=keyPoses(clamp(tau,-.6,.6),SCOOP);p=blendPose(p,s,sm(-.95,-.6,tau)*(1-sm(.6,1.2,tau)));}
 else if(tau<=-.95&&tau>-1.6)p.neckY=lerp(p.neckY,46*Math.PI/180,lookW(tau));
 if(tau>TG+.3)p=blendPose(p,celebrate((tau-TG-.3)*1.2,{kind:'arms'}),sm(TG+.3,TG+.9,tau));
 return p;
}
/** Romário: the sprint through, a half-volley lob with the right boot (a short strike, the ankle kept under the ball), the celebration run */
const CH_D=.62,CH_ST=TC-STRIKE_CONTACT*CH_D;
function chip(u:number):Pose{const p=strike(clamp(u),{foot:'r',power:.3});const w=Math.max(0,1-Math.abs(u-STRIKE_CONTACT)/.22);if(w>0){p.rAnk=lerp(p.rAnk,-10*Math.PI/180,w);p.lean=lerp(p.lean,2*Math.PI/180,w);}return p;}
function romPose(tau:number):Pose{
 let p=loco(ROM,tau);const u=(tau-CH_ST)/CH_D;
 if(u>0&&u<1.6)p=blendPose(p,chip(Math.min(1,u)),sm(0,.15,u)*(1-sm(1.05,1.6,u)));
 if(tau>TG+.1)p=blendPose(p,celebrate(distOf(ROM,tau)/4,{kind:'run'}),sm(TG+.1,TG+.7,tau));
 return p;
}
const SHOT_YAW=(()=>{const[x,z]=posOf(ROM,TC);return yawTo(0-x,.5-z);})();
function romYaw(tau:number):number{const v=velOf(ROM,tau),run=yawTo(v[0],v[1]);
 if(tau<TC-.5)return run;if(tau<TC+.45)return lerpAng(run,SHOT_YAW,sm(TC-.5,TC-.2,tau));return lerpAng(SHOT_YAW,run,sm(TC+.45,TC+1,tau));}
function stateOf(k:number,tau:number):State{
 const a=ACTORS[k],[x,z]=posOf(k,tau);
 if(a.role==='lau')return{pose:lauPose(tau),place:{x,z,yaw:lauYaw(tau)}};
 if(a.role==='rom')return{pose:romPose(tau),place:{x,z,yaw:romYaw(tau)}};
 let pose=loco(k,tau),yaw=faceYaw(k,tau);
 switch(a.role){
  case 'press':{const l=posOf(LAU,tau),w=1-sm(.2,.9,tau);
   if(w>0){pose=blendPose(pose,CLOSE,w*(1-clamp(Math.hypot(...velOf(k,tau))/3)));yaw=lerpAng(yaw,yawTo(l[0]-x,l[1]-z),w);}
   break;}
  case 'def':{// the line steps up, then the ball goes over: heads up, a turn to chase
   if(tau>.2&&tau<1.4){const up=Math.sin(Math.PI*clamp((tau-.2)/1.2));pose.neckP=lerp(pose.neckP,-40*Math.PI/180,up);pose.lean=lerp(pose.lean,-4*Math.PI/180,up*.6);}
   break;}
  case 'gk':{const r=posOf(ROM,tau),v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),td=TC-.1,du=.95;
   if(tau<td){pose=blendPose(keeperSet(tau*1.4),loco(k,tau),clamp((sp-1.2)/1.2));yaw=yawTo(r[0]-x,r[1]-z);}
   else{pose=keeperTip(clamp((tau-td)/du),{hand:'r'});yaw=lerpAng(yawTo(PC[0]-x,PC[2]-z),Math.PI,sm(td+.9,td+1.4,tau));}
   break;}
  default:break;
 }
 return{pose,place:{x,z,yaw}};
}

// ---------------------------------------------------------------- the ball: Laudrup's dribble → the scoop → over the line → the check-up bounce → Romário's lob → the net
const BALL_R=.11,G=9.81;
/** the half-volley point: just ahead of Romário's right toe at TC, ball rising off its bounce */
const PC:V3=(()=>{const st=stateOf(ROM,TC),sk=solve(st.pose,B_ROM,st.place),f:V3=[Math.cos(SHOT_YAW),0,-Math.sin(SHOT_YAW)];return add([sk.rToe[0],.26,sk.rToe[2]],mul(f,BALL_R+.05));})();
/** the landing (backspin: it checks up, 1.9 m on over .35 s) */
const L1:V3=(()=>{const[x,z]=posOf(LAU,0),d=nrm([PC[0]-x,0,PC[2]-z]);return[PC[0]-d[0]*1.9,BALL_R,PC[2]-d[2]*1.9];})();
/** the scoop: on the toes of the right boot at contact */
const P0:V3=(()=>{const st={pose:keyPoses(0,SCOOP),place:{x:posOf(LAU,0)[0],z:posOf(LAU,0)[1],yaw:lauYaw(0)}},sk=solve(st.pose,B_LAU,st.place),d=nrm([L1[0]-sk.rToe[0],0,L1[2]-sk.rToe[2]]);
 return[sk.rToe[0]+d[0]*.12,BALL_R,sk.rToe[2]+d[2]*.12];})();
const V0Y=G*TL/2,BOUNCE=(PC[1]-BALL_R+G*.5*(TC-TL)**2)/(TC-TL);
/** the lob: over Unanua, dropping under the bar a little right of centre */
const PG:V3=[0,1.45,.55],NETP:V3=[1.45,.95,.6],REST:V3=[1.7,BALL_R,.6],LOB=2.9;
function ballAt(tau:number):V3{
 if(tau<-.9){// Laudrup brings it forward: a touch every ~2 m
  const dr=(tt:number):V3=>{const p=posOf(LAU,tt),v=velOf(LAU,tt),l=Math.hypot(v[0],v[1])||1,f=((distOf(LAU,tt)/2)%1+1)%1,d=.42+.4*(f<.2?f/.2:1-(f-.2)/.8);return[p[0]+v[0]/l*d,BALL_R,p[1]+v[1]/l*d];};
  return dr(tau);}
 if(tau<0){const dr=(()=>{const tt=-.9,p=posOf(LAU,tt),v=velOf(LAU,tt),l=Math.hypot(v[0],v[1])||1,f=((distOf(LAU,tt)/2)%1+1)%1,d=.42+.4*(f<.2?f/.2:1-(f-.2)/.8);return[p[0]+v[0]/l*d,BALL_R,p[1]+v[1]/l*d] as V3;})();
  return mix3(dr,P0,easeOut((tau+.9)/.9));}
 if(tau<TL){const u=tau/TL,p=mix3(P0,L1,u);p[1]=BALL_R+V0Y*tau-G*tau*tau/2;return p;}
 if(tau<TC){const t=tau-TL,u=t/(TC-TL),p=mix3(L1,PC,1-(1-u)*(1-u)*.35-.65*(1-u));p[1]=BALL_R+BOUNCE*t-G*t*t/2;return p;}
 if(tau<TG){const u=(tau-TC)/(TG-TC),p=mix3(PC,PG,u);p[1]=lerp(PC[1],PG[1],u)+4*LOB*u*(1-u)*.95;return p;}
 if(tau<TG+.22)return mix3(PG,NETP,easeOut((tau-TG)/.22));
 const u=clamp((tau-TG-.22)/.45);return[lerp(NETP[0],REST[0],u),lerp(NETP[1],REST[1],u*u),lerp(NETP[2],REST[2],u)];
}
const velAt=(tau:number):V3=>{if(tau>=TG+.5)return[0,0,0];const a=ballAt(tau-.01),b=ballAt(tau+.01);return mul(sub(b,a),50);};
const ballSpin=(tau:number)=>tau<0?distOf(LAU,tau)/BALL_R:tau<TC?-tau*16:-TC*16+(Math.min(tau,TG)-TC)*-22;
const bulgeAt=(tau:number)=>tau<TG+.05?0:Math.exp(-(tau-TG-.05)*2.4)*(1+.3*Math.sin((tau-TG)*14));
/** the pass (scoop → landing) and the lob (half-volley → line), sampled for printed lines */
const PASS_PATH:V3[]=(()=>{const o:V3[]=[];for(let i=0;i<=24;i++)o.push(ballAt(TL*i/24));return o;})();
const LOB_PATH:V3[]=(()=>{const o:V3[]=[];for(let i=0;i<=18;i++)o.push(ballAt(TC+(TG-TC)*i/18));return o;})();

// ---------------------------------------------------------------- THE ADAPTER: every body in this film goes through here
/** drawPlayer(sheet, pose, camera, style, place, motion): one call per figure → the shared fluid-body library (lib/plays/riso/athlete.ts).
 * `prev` (the pose one drawn frame earlier) turns on secondary motion (hair, shirt hem) and, with `smear`, a halftone motion trail. */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,o:{prev?:State;smear?:boolean}={}):DrawResult{
 if(o.prev&&o.smear)motionSmear(s,o.prev.pose,pose,camera,style,place,{prevPlace:o.prev.place,threshold:9});
 return drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev.pose,prevPlace:o.prev.place}:{});
}

// ---------------------------------------------------------------- the pitch through a camera: shadows, bodies, the ball, the goal, in depth order
type PlayOpts={dtau?:number;smear?:boolean;goalLast?:boolean;spark?:number};
type PlayOut={ball:Pt|null;br:number;lau?:DrawResult;rom?:DrawResult;gk?:DrawResult};
function play(s:Sheet,c:Cam,v:View,tau:number,o:PlayOpts={}):PlayOut{
 const{dtau=0,smear=false,goalLast=false,spark=0}=o;
 const b=ballAt(tau),bq=toCam(c,b),bg=bq[2]>=NEAR?scr(c,bq):null,br=bg?Math.max(4,c.F*BALL_R/bq[2]):0;
 const gq=pr(c,[b[0],0,b[2]]);if(gq&&b[0]<.1){const k=kAt(c,[b[0],0,b[2]]),r=clamp(.16*k,2,300)*(1/(1+b[1]*.5));s.tone(K,polyPath(blob(gq[0],gq[1],r,r*.3,2,{amp:.05,n:12}),true),.45/(1+b[1]*.4));}
 type Item={d:number;draw:()=>void};const items:Item[]=[];const out:PlayOut={ball:bg,br};const m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr;const passing=!!s._passage.pending;
 ACTORS.forEach((a,k)=>{const[x0,z0]=posOf(k,tau),q=toCam(c,[x0,1,z0]);if(q[2]<NEAR+.5)return;const p=scr(c,q),h=c.F*1.9/q[2];
  if(Math.abs(p[0])>v.hx+h||Math.abs(p[1])>v.hy+h)return;
  const st=stateOf(k,tau),keyA=a.hero||k===ROM||k===GK;
  const prev=dtau>0&&keyA?stateOf(k,tau-dtau):undefined;
  // passages print simply; small figures and extras in wide shots print at 'low'
  const style=passing?{...a.style,detail:a.hero?'mid' as const:'low' as const}:!keyA&&h*ppu<150?{...a.style,detail:'low' as const}:h*ppu<60?{...a.style,detail:'low' as const}:a.style;
  items.push({d:q[2],draw:()=>{const r=drawPlayer(s,st.pose,c,style,st.place,{prev,smear:smear&&keyA});if(a.hero)out.lau=r;if(k===ROM)out.rom=r;if(k===GK)out.gk=r;}});});
 const inNet=b[0]>.05;
 const drawBall=()=>{if(!bg)return;const V=velAt(tau),sp=Math.hypot(V[0],V[1],V[2]),nb=pr(c,sub(b,mul(V,.03)));
  const dir=nb?Math.atan2(bg[1]-nb[1],bg[0]-nb[0]):0,smr=nb&&sp>6?Math.min(br*3,Math.hypot(bg[0]-nb[0],bg[1]-nb[1])*1.4):0;ball(s,bg[0],bg[1],br,ballSpin(tau),smr,dir);
  if(spark>0&&spark<1)sparkBurst(s,Y,bg[0],bg[1],br*4.2,{n:9,seed:17,g:easeOutBack(clamp(spark*2))*(1-clamp((spark-.5)*2)),width:br*.5});};
 const goal=()=>goal3(s,c,bulgeAt(tau),b[2]);
 if(!goalLast){if(inNet)drawBall();goal();}
 if(!inNet||goalLast)items.push({d:bq[2],draw:drawBall});
 items.sort((p,q)=>q.d-p.d);for(const it of items)it.draw();
 if(goalLast)goal();
 return out;
}
/** a broadcast replay wipe: long halftone strokes across the frame */
function streaks(s:Sheet,v:View,amt:number,seed:number){if(amt<=.02)return;const p=new Path2D(),r=rng(seed);
 for(let i=0;i<14;i++){const y=(r()-.5)*2*v.hy,x0=(r()-.5)*2*v.hx,L=v.hx*(.6+r()*.9);p.addPath(ribbon([[x0-L,y],[x0+L,y]],12+r()*30,{seed:seed+i,taper:.8,wobble:1.5}));}
 s.tone(K,p,.55*amt);s.knockout(p,.35*amt);}
/** projected points of a 3D path, the first fraction w of it */
function pathPts(c:Cam,P:V3[],w=1):Pt[]{const n=Math.max(2,Math.round(P.length*clamp(w))),o:Pt[]=[];for(let i=0;i<n;i++){const q=pr(c,P[i]);if(q)o.push(q);}return o;}
/** his sight line: from the face along where the head points (the stand), printed as a yellow dashed beam; returns its screen points */
function sightLine(s:Sheet,c:Cam,r:DrawResult|undefined,cov:number,len:number,seed:number){if(!r||cov<=0)return;
 const h=r.sk.head,f=r.sk.face,d=nrm([f[0]-h[0],0,f[2]-h[2]]),a:V3=add(f,mul(d,.15)),pts:Pt[]=[];for(let i=0;i<=8;i++){const q=pr(c,add(a,[d[0]*len*i/8,-.25*i/8,d[2]*len*i/8]));if(q)pts.push(q);}
 if(pts.length<2)return;const w=clamp(kAt(c,a)*.07,4,16);dashes(s,pts,w,cov,seed,7);
 const e=pts[pts.length-1],p=pts[pts.length-2];laneArrow(s,Y,p,[e[0]+(e[0]-p[0])*.01,e[1]+(e[1]-p[1])*.01],w,{seed:seed+1,head:w*3,cov});}
/** the spoon: a yellow bowl cupped under the ball on the boot, with a handle up the shin */
function spoon(s:Sheet,r:DrawResult|undefined,bg:Pt|null,br:number,cov:number){if(!r||!bg||cov<=0)return;
 const pts:Pt[]=[];for(let i=0;i<=12;i++){const a=Math.PI*(.05+.9*i/12);pts.push([bg[0]+Math.cos(a)*br*1.7,bg[1]+br*.35+Math.sin(a)*br*1.25]);}
 const w=Math.max(4,br*.34);band(s,pts,w,Y,cov,91,.2);
 const toe=r.joints.rToe,kn=r.joints.rKn,an=r.joints.rAn,st:Pt=[bg[0]+(toe[0]-bg[0])*.2,bg[1]+br*1.5];band(s,[st,[(toe[0]+an[0])/2,(toe[1]+an[1])/2],[(an[0]*2+kn[0])/3,(an[1]*2+kn[1])/3]],w*.8,Y,cov,92,.5);}
/** a red wall along the grass: the Osasuna players' feet joined up (no pass along the ground) */
function wall(s:Sheet,c:Cam,tau:number,ids:number[],cov:number,seed:number){if(cov<=0)return;const P=ids.map(k=>posOf(k,tau)).sort((a,b)=>a[1]-b[1]),pts:Pt[]=[];
 for(let i=0;i+1<P.length;i++)for(let j=0;j<=4;j++){const u=j/4,q=pr(c,[lerp(P[i][0],P[i+1][0],u),.05,lerp(P[i][1],P[i+1][1],u)]);if(q)pts.push(q);}
 if(pts.length<2)return;const w=clamp(kAt(c,[P[0][0],0,P[0][1]])*.12,4,18);band(s,pts,w,R,cov,seed,.05);}

// ---------------------------------------------------------------- 1 · LIVE: the high main-stand camera, near real time
/** τ from chapter time: real time up to the scoop (on "but scoops"), then keyed to the words (the lob on "Romário lobs", the net on "Goal") */
function tau1(t:number){const ts=CUEW(0,'but scoops')+.3,tl=CUEW(0,'Romário lobs')+.35,tg=CUEW(0,'Goal')+.1;
 return key(t,mono([[0,-ts],[ts,0],[tl,TC],[tg,TG],[SECS(0)+1,TG+SECS(0)+1-tg]]),linear);}
const E1:V3=[-22,12.5,-45];
function cam1(t:number):Cam{
 const tau=tau1(t),tL=CUEW(0,'Laudrup has'),tS=CUEW(0,'but scoops'),tR=CUEW(0,'Romário lobs'),tG=CUEW(0,'Goal'),S=SECS(0);
 const bs=(u:number):V3=>{const q=ballAt(u);return[q[0],0,q[2]];},bt=mul(add(add(bs(tau),bs(tau-.25)),bs(tau-.5)),1/3);
 const l=posOf(LAU,tau),L3:V3=[l[0],0,l[1]],r=posOf(ROM,tau),R3:V3=[r[0],0,r[1]];
 const w1=sm(tL-.6,tL+.8,t,easeInOutSine)*(1-sm(tS-.2,tS+1,t,easeInOutSine)),w2=sm(tS-.2,tS+1.2,t,easeInOutSine),w3=sm(tG+.3,tG+1.8,t,easeInOutSine);
 const T=mix3(mix3(mix3(bt,mix3(L3,[-21,0,0],.35),w1),mix3(bt,[-9,0,-.5],.35),w2),mix3(R3,[-5,0,1],.4),w3);T[1]=1.2;
 const F=key(t,[[0,3700],[CUEW(0,'Osasuna'),4300],[tL,6200],[CUEW(0,'no gap'),5800],[CUEW(0,'He looks'),7000],[tS,5400],[tR,5600],[tG,6600],[S,6200]],easeInOutSine)*LENS;
 return lookAt(E1,T,F);
}
const ch1:Scene={
 draw(s,t){frame(s);const v=view(s),c=cam1(t),tau=tau1(twos(t)),tG=CUEW(0,'Goal');
  stadium(s,c,v,t,{roar:sm(tG-.1,tG+.6,t),flash:sm(tG,tG+.4,t)});
  ground(s,c);play(s,c,v,tau,{spark:tau/.3});},
 aperture(t){const c=cam1(t),[x,z]=posOf(LAU,tau1(twos(t))),q=toCam(c,[x,1,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(16,c.F*.35/q[2]),12);},
 still:9.8,
};

// ---------------------------------------------------------------- 2 · REPLAY: slow motion, a low pitch-side camera on Laudrup's left (the side he looks at)
function tau2(t:number){return key(t,mono([[0,-1.6],[CUEW(1,'Laudrup looks'),-1.05],[CUEW(1,'to the side'),-.7],[CUEW(1,'his foot'),-.2],[CUEW(1,'like a spoon'),.02],[CUEW(1,'His famous'),.3],[CUEW(1,'no-look'),.55],[SECS(1),1.25]]),linear);}
const L_AT0=posOf(LAU,0),E2:V3=[L_AT0[0]+4.5,1.2,L_AT0[1]-6.5];
function cam2(t:number):Cam{
 const tau=tau2(t),[x,z]=posOf(LAU,tau),S=SECS(1),tF=CUEW(1,'his foot'),tN=CUEW(1,'His famous');
 const b=ballAt(Math.min(tau,.8)),T=mix3(mix3([x,1.15,z],[x,.85,z],.6*sm(tF-.4,tF+.3,t)*(1-sm(tN-.4,tN+.4,t))),[mix3([x,1,z],b,.5)[0]+.8,1.2,z-.2],sm(tN-.4,S,t,easeInOutSine));
 const F=key(t,[[0,2300],[CUEW(1,'Laudrup'),2600],[CUEW(1,'to the side'),2700],[tF,2900],[CUEW(1,'like a spoon'),3100],[tN,2500],[S,2300]],easeInOutSine)*LENS;
 return lookAt(add(E2,[.4*sm(tN,S,t),.2*sm(tN,S,t),-.9*sm(tN,S,t)]),T,F);
}
const ch2:Scene={
 draw(s,t){frame(s);const v=view(s),c=cam2(t),tp=twos(t),tau=tau2(tp),dtau=Math.max(.004,tau-tau2(tp-1/12));
  const tW=CUEW(1,'Watch'),tL=CUEW(1,'Laudrup looks'),tSd=CUEW(1,'to the side'),tF=CUEW(1,'his foot'),tSp=CUEW(1,'like a spoon'),tN=CUEW(1,'no-look'),S=SECS(1);
  stadium(s,c,v,t);ground(s,c);
  // "his foot lifts the ball forward": the red flight line grows ahead of the ball (and stays up for "no-look pass")
  const fl=sm(tF-.1,tF+.5,t)*(1-sm(S-.6,S-.2,t));
  if(fl>0){const pts=pathPts(c,PASS_PATH,.25+.75*sm(tF-.1,tN+.3,t));if(pts.length>2){const w=clamp(kAt(c,PASS_PATH[0])*.06,4,16);band(s,pts,w,R,fl,71,.35);if(t>tN-.1){const a=pts[pts.length-2],b=pts[pts.length-1];laneArrow(s,R,a,[b[0]+(b[0]-a[0])*.01,b[1]+(b[1]-a[1])*.01],w,{seed:72,head:w*3.2,cov:fl});}}}
  const r=play(s,c,v,tau,{dtau,smear:true,spark:tau/.3});
  // "Watch his eyes": a yellow ring round his head
  const ey=sm(tW-.1,tW+.35,t,easeOutBack)*(1-sm(tL+.2,tSd+.3,t));
  if(ey>0&&r.lau){const h=r.lau.joints.head,rr=Math.max(10,r.lau.heightPx*.1)*(.7+.3*ey),pts:Pt[]=[];for(let i=0;i<28;i++){const a=i/28*TAU;pts.push([h[0]+Math.cos(a)*rr,h[1]+Math.sin(a)*rr]);}
   s.knockout(ribbon(pts,rr*.3,{close:true,seed:73,taper:0,wobble:1}),.8*ey);s.fill(Y,ribbon(pts,rr*.17,{close:true,seed:73,taper:0,wobble:1}),.95*ey);}
  // "Laudrup looks to the side": his sight line to the stand (yellow)
  sightLine(s,c,r.lau,sm(tL-.1,tSd+.2,t)*(1-sm(S-.6,S-.2,t)),3.2,75);
  // "like a spoon": the spoon under the ball on the boot, around the contact
  spoon(s,r.lau,r.ball,r.br,sm(tSp-.25,tSp+.15,t,easeOutBack)*(1-sm(tSp+1,tSp+1.5,t)));
  streaks(s,v,1-sm(0,.45,t),21);
 },
 aperture(t){const c=cam2(t),[x,z]=posOf(LAU,tau2(twos(t))),q=toCam(c,[x,1.6,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(22,c.F*.2/q[2]),12);},
 still:6,
};

// ---------------------------------------------------------------- 3 · REPLAY from behind the passer: the wall on the grass, the ball over the top, the run and the lob
function tau3(t:number){return key(t,mono([[0,-.9],[CUEW(2,'so the ball'),-.12],[CUEW(2,'flies over'),.2],[CUEW(2,'Romário runs'),1.15],[CUEW(2,'chips'),TC-.02],[CUEW(2,'Unanua'),TC+.5],[CUEW(2,'Unanua')+1.1,TG+.1],[SECS(2),TG+1.8]]),linear);}
const E3:V3=[-37.5,4.4,6.2];
function cam3(t:number):Cam{
 const tau=tau3(t),tO=CUEW(2,'flies over'),tR=CUEW(2,'Romário runs'),tU=CUEW(2,'Unanua'),S=SECS(2);
 const b=ballAt(tau),follow=sm(tO-.6,tR+.4,t,easeInOutSine),push=sm(tR-.2,tU+.5,t,easeInOutSine);
 const T=mix3(mix3([-22,1.2,1.2],[b[0],Math.min(1.8,b[1]),b[2]],.7*follow),[-5,1.2,.2],push);
 const F=key(t,[[0,2300],[CUEW(2,'so the'),2400],[tO,2500],[tR,3300],[CUEW(2,'chips'),4200],[tU,4600],[S,4200]],easeInOutSine)*LENS;
 return lookAt(add(E3,[14*push,-1.3*push,-4.4*push]),T,F);
}
const ch3:Scene={
 draw(s,t){frame(s);const v=view(s),c=cam3(t),tp=twos(t),tau=tau3(tp),tNs=CUEW(2,'No space'),tO=CUEW(2,'flies over'),tR=CUEW(2,'Romário runs'),tC=CUEW(2,'chips'),tU=CUEW(2,'Unanua'),S=SECS(2);
  stadium(s,c,v,t,{roar:.8*sm(tU+.6,tU+1.2,t),flash:sm(tU+.7,tU+1.2,t)*(1-sm(S-1,S,t))});
  ground(s,c);
  // "No space along the grass": red walls joining the Osasuna players' feet, the midfield three and the back four
  const nw=sm(tNs-.1,tNs+.4,t)*(1-sm(tO+.3,tR,t));wall(s,c,tau,PRESS,nw,81);wall(s,c,tau,DEF,nw,82);
  // "flies over the top": the flight line, dashed yellow, drawn ahead of the ball
  const fo=sm(tO-.3,tO+.2,t)*(1-sm(tC-.2,tC+.3,t));if(fo>0)dashes(s,pathPts(c,PASS_PATH,sm(tO-.4,tO+.4,t)),6,fo,83,11);
  // "Romário runs in": his run printed on the grass, a red arrow into the landing
  const rr=sm(tR-.2,tR+.4,t)*(1-sm(tC,tC+.5,t));
  if(rr>0){const pts:Pt[]=[];for(let i=0;i<=12;i++){const p=posOf(ROM,lerp(-.4,TC,i/12)),q=pr(c,[p[0],.03,p[1]]);if(q)pts.push(q);}
   if(pts.length>2){const w=clamp(kAt(c,L1)*.1,4,16),n=Math.max(2,Math.round(pts.length*rr));const seg=pts.slice(0,n);band(s,seg,w,R,1,84);if(seg.length>1){const a=seg[seg.length-2],b=seg[seg.length-1];laneArrow(s,R,a,[b[0]+(b[0]-a[0])*.01,b[1]+(b[1]-a[1])*.01],w,{seed:85,head:w*3});}}}
  // "chips keeper": the lob line over Unanua
  const cl=sm(tC-.2,tC+.3,t)*(1-sm(tU+.8,tU+1.4,t));if(cl>0)dashes(s,pathPts(c,LOB_PATH),6,cl,86,10);
  const r=play(s,c,v,tau,{dtau:Math.max(.004,tau-tau3(tp-1/12)),smear:true,goalLast:true,spark:(tau-TC)/.3});
  // "Unanua": a ring round the keeper as the ball goes over him
  const ur=sm(tU-.15,tU+.3,t,easeOutBack)*(1-sm(tU+.9,tU+1.3,t));
  if(ur>0&&r.gk){const h=r.gk.joints.chest,rad=Math.max(12,r.gk.heightPx*.42)*(.8+.2*ur),pts:Pt[]=[];for(let i=0;i<30;i++){const a=i/30*TAU;pts.push([h[0]+Math.cos(a)*rad,h[1]+Math.sin(a)*rad*1.1]);}
   s.knockout(ribbon(pts,rad*.1,{close:true,seed:87,taper:0,wobble:1}),.8*ur);s.fill(Y,ribbon(pts,rad*.055,{close:true,seed:87,taper:0,wobble:1}),.95*ur);}
  const hn=(tau-TG)/.7;if(hn>0&&hn<1&&r.ball)sparkBurst(s,Y,r.ball[0],r.ball[1],Math.max(60,r.br*5),{n:10,seed:29,g:easeOutBack(clamp(hn*3))*(1-clamp((hn-.6)/.4)),width:Math.max(8,r.br*.6)});
  streaks(s,v,1-sm(0,.45,t),23);
 },
 aperture(t){const c=cam3(t),tau=tau3(twos(t)),b=ballAt(Math.min(tau,TG)),q=toCam(c,b),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(16,c.F*.4/q[2]),12);},
 still:6.2,
};

// ---------------------------------------------------------------- 4 · THE LESSON: a low front camera on the same beat (the eye line one way, the pass the other)
function tau4(t:number){return key(t,mono([[0,-1.2],[CUEW(3,'look one'),-.8],[CUEW(3,'pass the'),-.15],[CUEW(3,'pass the')+.9,.35],[CUEW(3,'fool'),.6],[SECS(3),1]]),linear);}
function cam4(t:number):Cam{
 const tau=tau4(t),[x,z]=posOf(LAU,Math.min(tau,.4)),S=SECS(3),out=sm(CUEW(3,'pass the')-.2,S,t,easeInOutSine);
 const T:V3=mix3([x+.4,1,z-.3],[x+5,1.1,z-1.4],.55*out),F=key(t,[[0,2900],[CUEW(3,'look'),3300],[CUEW(3,'pass the'),2900],[CUEW(3,'fool'),2450],[S,2350]],easeInOutSine)*LENS;
 return lookAt([x+1+1.5*out,1.6+.5*out,z-9-1*out],T,F);
}
const ch4:Scene={
 draw(s,t){frame(s);const v=view(s),c=cam4(t),tp=twos(t),tau=tau4(tp);
  const tY=CUEW(3,'Your'),tL=CUEW(3,'look one'),tP=CUEW(3,'pass the'),tF=CUEW(3,'fool'),S=SECS(3);
  stadium(s,c,v,t);ground(s,c);
  // "fool the defenders": red rings on the grass under the pressers and the line, pulsing
  const fd=sm(tF-.1,tF+.4,t,easeOutBack)*(1-sm(S-.5,S-.1,t));
  if(fd>0)for(const k of [...PRESS,...DEF]){const[x,z]=posOf(k,tau),pts=groundRing(c,x,z,.7*fd,.55*fd,30);if(pts.length>24){const w=clamp(kAt(c,[x,0,z])*.06,3,14);s.knockout(ribbon(pts,w*1.7,{close:true,seed:90+k,taper:0,wobble:1}),.8*fd);s.fill(R,ribbon(pts,w,{close:true,seed:90+k,taper:0,wobble:1}),.95*fd);}}
  // "pass the other": the red pass arrow the other way
  const pa=sm(tP-.1,tP+.6,t,easeOut)*(1-sm(S-.5,S-.1,t));
  if(pa>0){const pts=pathPts(c,PASS_PATH,.2+.8*pa);if(pts.length>2){const w=clamp(kAt(c,PASS_PATH[0])*.06,4,16);band(s,pts,w,R,1,93,.35);const a=pts[pts.length-2],b=pts[pts.length-1];laneArrow(s,R,a,[b[0]+(b[0]-a[0])*.01,b[1]+(b[1]-a[1])*.01],w,{seed:94,head:w*3.2});}}
  const r=play(s,c,v,tau,{dtau:Math.max(.004,tau-tau4(tp-1/12)),smear:true,spark:tau/.3});
  // "look one way": the yellow eye line to the side
  sightLine(s,c,r.lau,sm(tL-.1,tL+.4,t)*(1-sm(S-.5,S-.1,t)),5,95);
  // "Your turn": a small spark on the ball as the lesson opens
  if(t>tY-.1&&t<tY+1&&r.ball)sparkBurst(s,Y,r.ball[0],r.ball[1],r.br*3.6,{n:8,seed:3,g:easeOutBack(sm(tY-.1,tY+.3,t))*(1-sm(tY+.6,tY+1,t)),width:r.br*.4});
 },
 still:5,
};

// ---------------------------------------------------------------- touch: a turf kick (grass bits + paper flecks) and a yellow spark
function spray(s:Sheet,x:number,y:number,age:number,seed:number,size=1){
 if(age<0||age>1)return;const r=rng(seed),a=new Path2D(),b=new Path2D(),u=easeOut(clamp(age/.7)),fl=Math.sin(Math.min(1,age/.8)*Math.PI);
 for(let i=0;i<14;i++){const ang=-Math.PI/2+(r()-.5)*2.2,d=(40+r()*170)*u*size,px=x+Math.cos(ang)*d,py=y+Math.sin(ang)*d*.5-fl*(30+r()*70)*size,z=(6+r()*9)*size;(i%3?a:b).addPath(polyPath([[px-z,py-z*.4],[px+z*.6,py-z*.6],[px+z,py+z*.3],[px-z*.4,py+z*.5]],true));}
 const fade=1-clamp((age-.6)/.4);s.knockout(b,.9*fade);s.fill(Y,a,.9*fade);s.tone(B,a,.6*fade);
}

const film:RisoStory={
 id:'laudrup-signature',format:'11v11',title:"Laudrup's no-look pass",theme:'Look one way and pass the other to fool the defenders',
 ageNote:'La Liga, Osasuna 2–3 Barcelona, El Sadar, Pamplona, 3 October 1993 (Romário\'s goal for 0–2). For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff4c3b',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a turf kick — grass bits and paper flecks thrown up, a yellow spark. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}spray(s,x,y,age,seed,2.2);if(age<.35)sparkBurst(s,Y,x,y-20,110,{n:7,seed:seed+1,g:easeOutBack(clamp(age/.15))*(1-clamp((age-.2)/.15)),width:15});},
};
export default film;
