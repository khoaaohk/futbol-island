/** Rivaldo's overhead kick — Barcelona 3–2 Valencia, La Liga, last day of the season, Camp Nou, 17 June 2001 (89th minute). An iconic-play riso
 * film (RisoStory, chapters mode) played in the player card's picture window or StoryFilmPlayer. A 1:1 reconstruction of the goal from
 * WRITTEN accounts (the footage itself was not reviewed), rendered as a riso print.
 *
 * SOURCES (read Sept 2026 with curl; cached under scratchpad/films/src-cache/):
 *  - FourFourTwo, James Maw, "Rivaldo vs Valencia, 2001: Great Goals Retold" (Dec 2010 issue, web 19 Sep 2014)
 *    https://www.fourfourtwo.com/features/rivaldo-great-goals-retold
 *  - The Guardian, Rob Smyth, "The Joy of Six: classiest hat-tricks" (11 Sep 2007) https://www.theguardian.com/football/2007/sep/11/newsstory.sport9
 *  - The Guardian, Rob Smyth, "On Second Thoughts: Rivaldo" (19 Jun 2008) https://www.theguardian.com/football/2008/jun/19/barcelona.brazil
 *  - Wikipedia (en) "Rivaldo" (incl. the Sky Sports commentary quote and the Sports Illustrated/AP report of 18 Jun 2001) and
 *    "2000–01 FC Barcelona season" (result, scorers, squad numbers, kit colours); Wikipedia (es) "Rivaldo" ("un gol de chilena desde fuera del área").
 * CONFIRMED by those accounts: Sunday evening, 17 June 2001, Camp Nou, the last La Liga game of the season; Barcelona needed a win and Valencia
 * a draw for the last Champions League place; Rivaldo scored all three Barcelona goals (a free kick, a low 25-yard shot) and Rubén Baraja twice
 * equalised, so it was 2–2; in the 89th minute (FFT: "the last minute ... with the score tied") Rivaldo received FRANK DE BOER's CHIPPED pass
 * with his BACK TO GOAL on the EDGE OF THE PENALTY BOX, "surrounded by defenders", CHESTED the ball HIGH into the air and bicycle-kicked it from
 * OUTSIDE the box into the BOTTOM CORNER; it "swerved away from the dive of Santiago Cañizares"; 3–2, Barcelona took the Champions League place;
 * Rivaldo called it the best goal of his career; he tore off his shirt to celebrate; Rivaldo wore 10 and De Boer 3 that season; Barcelona's
 * home kit that season was blaugrana stripes with dark navy shorts.
 * INFERRED (illustrative reconstruction): every position and run (where De Boer chipped from, drawn deep centre-left; the pass's flight, ~1.75 s;
 * the chest pop's height, ~1.1 m); WHICH FOOT (drawn: his LEFT — Rivaldo was left-footed, but the footage was not checked, so the narration never
 * names the foot) and De Boer's (drawn left); WHICH bottom corner (drawn: the corner to Cañizares's left) and the swerve's size; which end
 * Barcelona attacked for the main camera (drawn: left to right); the number and places of the defenders and other players; the Valencia kit
 * (drawn: white shirts, black shorts and socks, their home strip — the strip worn that night was not confirmed); Cañizares's keeper kit (drawn
 * yellow) and number (1); Barcelona's socks (drawn navy) and number colour (drawn yellow); a floodlit night (kick-off time not confirmed; FFT
 * says "Sunday evening"); the Camp Nou bowl, crowd colours, boards and lights; Rivaldo's celebration run (drawn: arms out, shirt on).
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in REAL TIME (De Boer's chip, the chest, the kick, the net) ·
 * ch2 = the TV slow-motion REPLAY from a low pitch-side camera on Rivaldo's left, close on the soft chest touch (the cushion, the pop), then the
 * fall back and the leg over his head · ch3 = a replay from BEHIND THE GOAL: Cañizares dives, the ball swerves past him, then Rivaldo's run and
 * the crowd · ch4 = the lesson on a training pitch at dusk: a young player on a thick crash mat, a coach tossing, a soft chest touch that pops
 * the ball up, then the overhead kick landing on the mat, keyed to the words. Composed for the card window (≈ 1.45:1 down to square): the world
 * is centred on the CANVAS centre (never sheet.safe), cameras are real pinhole projections of metres.
 *
 * FIGURES: every body goes through ONE adapter, drawPlayer() → the shared fluid-body library ./athlete. The chest control is authored as key
 * poses; the overhead kick is the left-footed scissor (a mirrored scissor on the same skeleton) flown on a real ballistic pelvis arc.
 * Inks: yellow (grass with blue, floodlights, highlights, sunset), red (Barça stripes, crowd, skin screen), blue (Barça stripes, crowd, mats),
 * navy (key line, night sky, shorts). Scenes read only their local t; drawn objects on twos, cameras on ones; all randomness seeded.
 * Budget: ~150–250 plate ops per frame (4 plates); small figures in the wide shot print at 'low' detail, passages cap figure detail. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,rectPath,easeOut,easeOutBack,easeInOutSine,linear,settle,TAU,type Pt} from '../../paths/riso/motion';
import {sparkBurst} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,posed,clampPose,keyPoses,blendPose,mirrorPose,stand,runCycle,strike,keeperSet,keeperDive,celebrate,
 type Pose,type V3,type AthleteStyle,type Place,type InkFill,type Build,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Narration, cue words and provisional timings (≈2.5 words/s). `at` = word onset in the chapter's audio (s); `seconds` includes the silent
 * tail that carries the .65 s passage. The Kokoro generator (scripts/plays/kokoro-narrate.py) writes timing.json; withTiming then swaps in the
 * real clip lengths and word onsets and every action below re-times itself. */
const TIMING:{label:string;text:string;seconds:number;cues:[number,string][]}[]=[
 {label:'The goal, live',text:'Camp Nou, June 2001. Two-all, last minute. Barcelona must win. De Boer chips it forward. Rivaldo chests it up... overhead kick! Bottom corner!',seconds:12.6,
  cues:[[.2,'Camp Nou'],[2.1,'Two-all'],[3.5,'Barcelona must win'],[5,'De Boer chips'],[6.9,'Rivaldo'],[7.5,'chests it up'],[8.9,'overhead kick'],[10.2,'Bottom corner']]},
 {label:'Watch it again',text:'Slow motion. His chest is soft, like a pillow. It cushions the ball and pops it up. Then he falls back and swings his leg over his head.',seconds:12.2,
  cues:[[.15,'Slow motion'],[1.2,'His chest is soft'],[2.7,'like a pillow'],[4.1,'cushions'],[5.5,'pops it up'],[6.7,'Then he falls back'],[8.2,'swings his leg']]},
 {label:'Behind the goal',text:'Cañizares dives, but it swerves past him. Three-two! A hat-trick, and a Champions League place!',seconds:8.8,
  cues:[[.15,'Cañizares dives'],[1.4,'swerves past'],[2.9,'Three-two'],[4.1,'A hat-trick'],[5.4,'Champions League']]},
 {label:'Your turn',text:'Your turn. A soft first touch sets up your next move. Overhead kicks? Only practise on soft mats, with a coach.',seconds:10.8,
  cues:[[.15,'Your turn'],[1,'A soft first touch'],[2.5,'sets up'],[3.4,'next move'],[4.7,'Overhead kicks'],[6.2,'Only practise'],[7.3,'soft mats'],[8.3,'with a coach']]},
];
/** Kokoro timing: null until the lead voices the film. After running kokoro-narrate.py, replace `null` with the import of
 * '../../../public/plays/narration/rivaldo-overhead-2001/timing.json' (as the other films do) — nothing else changes. */
import timingJson from '../../../public/plays/narration/rivaldo-overhead-2001/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming(TIMING.map(c=>({label:c.label,narration:c.text,seconds:c.seconds,cues:c.cues.map(([at,words])=>({at,words}))})),VOICE);
/** onset of the cue whose words start with w in chapter i */
const CUEW=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('rivaldo: cue '+w);return c.at;};
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
const lerpAng=(a:number,b:number,u:number)=>{const d=((b-a)%TAU+TAU*1.5)%TAU-Math.PI;return a+d*u;};

// ---------------------------------------------------------------- the card-window frame + the TV camera (a real pinhole projection)
/** world (0,0) on the CANVAS centre, 1 world unit = 1 sheet unit (× the engine's arrival scale, so passages and seams stay exact) */
function frame(s:Sheet){const S=s.arrival;s.camera((s.cx-s.W/2)/S,(s.cy-s.H/2)/S,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
/** a narrower (square) window gets a slightly wider lens so the action still fits (set by frame()) */
let LENS=1;
/** metres, right-handed, y up. Valencia's goal line is x = 0 (posts z = ±3.66, net toward +x), the pitch runs to x = −105, touchlines z = ±34.
 * Barcelona attack +x; the main camera sits in the main stand on the −z side. */
type Cam={eye:V3;F:number;f:V3;r:V3;u:V3;project(p:V3):[number,number,number];scale(p:V3):number};
function lookAt(eye:V3,target:V3,F:number):Cam{const f=nrm(sub(target,eye)),r=nrm(cross(f,[0,1,0])),u=cross(r,f);
 return{eye,F,f,r,u,project:p=>{const d=sub(p,eye),z=Math.max(.05,dot(d,f));return[F*dot(d,r)/z,-F*dot(d,u)/z,z];},scale:p=>F/Math.max(.05,dot(sub(p,eye),f))};}
const NEAR=.35;
const toCam=(c:Cam,P:V3):V3=>{const d=sub(P,c.eye);return[dot(d,c.r),dot(d,c.u),dot(d,c.f)];};
const scr=(c:Cam,q:V3):Pt=>[c.F*q[0]/q[2],-c.F*q[1]/q[2]];
function pr(c:Cam,P:V3):Pt|null{const q=toCam(c,P);return q[2]<NEAR?null:scr(c,q);}
/** polygon clipped against the near plane, projected */
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
/** half the visible sheet (with margin for the .68 passage preview) */
const view=(s:Sheet):View=>({hx:s.W/(2*.68)+80,hy:s.H/(2*.68)+80});

// ---------------------------------------------------------------- the Camp Nou at night: a steep open bowl of three tiers, floodlights on the rim, a packed blaugrana crowd
/** stand planes (a along, b up the rake 0..1): the huge far lateral (+z), behind Valencia's goal (+x), the main stand (−z, the camera's own), the far end */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-150,45,a),1.4+46*b,40+50*b],
 (a,b)=>[12+42*b,1.4+42*b,lerp(-78,84,a)],
 (a,b)=>[lerp(45,-150,a),1.4+30*b,-40-34*b],
 (a,b)=>[-117-42*b,1.4+42*b,lerp(84,-78,a)],
];
const STAND_COLS=[150,90,130,90],STAND_ROWS=[20,17,13,17],TIERS=[[.3,.62],[.33,.66],[.45],[.33,.66]];
/** the floodlights: lamp banks along the rim of the bowl */
const LAMPS:V3[]=[[-110,49,92],[-60,49,92],[-10,49,92],[38,49,92],[56,46,-40],[56,46,40],[-120,46,-40],[-120,46,40],[-100,34,-76],[-20,34,-76],[30,34,-76]];
/** night sky, dark stand planes with tier fronts, a packed crowd speckle (paper, blaugrana red and blue, a few yellow), floodlight halos
 * batched into one path per step. roar lifts the crowd (jumping), flash pops camera flashes. */
function stadium(s:Sheet,c:Cam,v:View,t:number,o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,tt=twos(t),all=rectPath(-1e4,-1e4,2e4,2e4);
 s.tone(K,all,.86);s.tone(B,all,.25);
 const planes=new Path2D(),fronts=new Path2D();
 const own=(si:number)=>si===2&&c.eye[2]<-38;
 STANDS.forEach((S,si)=>{if(own(si))return;addPoly(planes,polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]));for(const b of TIERS[si])seg3(c,S(0,b),S(1,b),1.4,fronts);seg3(c,S(0,1),S(1,1),1.1,fronts);});
 s.knockout(planes);s.fill(B,planes,.7);s.tone(K,planes,.5);
 const dots=[new Path2D(),new Path2D(),new Path2D(),new Path2D()],any=[0,0,0,0];
 STANDS.forEach((S,si)=>{if(own(si))return;const cols=STAND_COLS[si],rows=STAND_ROWS[si];for(let j=0;j<rows;j++){const b=(j+.5)/rows;if(TIERS[si].some(q=>Math.abs(b-q)<.03))continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,6);if(h<.14)continue;const a=(i+.5+(hash(i+j*31,9)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR+1)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.52/q[2],2.4,12),lift=roar>0?roar*z*(.4+1.1*Math.max(0,Math.sin(tt*12+h*TAU))):0;
   const ink=h<.46?0:h<.72?1:h<.94?2:3;dots[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);any[ink]++;}}});
 if(any[0])s.knockout(dots[0],.75);if(any[1])s.fill(R,dots[1],.95);if(any[2])s.fill(B,dots[2],.95);if(any[3])s.fill(Y,dots[3],.9);
 s.fill(K,fronts,.85);
 // floodlight halos: three soft steps and a hot core, all lamps in one path per step
 const halo=[new Path2D(),new Path2D(),new Path2D()],core=new Path2D();let nl=0;
 for(const L of LAMPS){const q=toCam(c,L);if(q[2]<NEAR+2)continue;const p=scr(c,q),r=clamp(c.F*1.6/q[2],5,60);if(Math.abs(p[0])>v.hx+r*3||Math.abs(p[1])>v.hy+r*3)continue;nl++;
  for(let k=0;k<3;k++){const rr=r*(1+(3-k)*.55);halo[k].addPath(polyPath(blob(p[0],p[1],rr*1.5,rr,Math.round(L[0])+k,{amp:.04,n:14}),true));}
  core.addPath(rectPath(p[0]-r*1.4,p[1]-r*.35,r*2.8,r*.7));}
 if(nl){s.knockout(halo[2],.25);s.tone(Y,halo[0],.3);s.tone(Y,halo[1],.5);s.tone(Y,halo[2],.7);s.knockout(core,.95);s.fill(Y,core,.6);}
 if(flash>0){const p=new Path2D();const fr=Math.floor(tt*12);for(let i=0;i<12;i++){const r1=hash(i*17+fr*101,3),r2=hash(i*29+fr*7,4),si=r1<.55?0:r1<.8?1:3,q=pr(c,STANDS[si](r2,.08+.8*hash(i,fr)));if(!q||hash(i*5+fr,8)>flash)continue;const z=9+12*flash;
  p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.3],[q[0]+z,q[1]],[q[0],q[1]+z*.3]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}
  s.knockout(p);s.fill(Y,p,.6);}
}
/** grass under floodlights (yellow × blue = green), mowing stripes, boards with paper panels, paper lines */
function ground(s:Sheet,c:Cam){
 const g=polyP(c,[[-118,0,-50],[14,0,-50],[14,0,50],[-118,0,50]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.95);s.tone(B,gp,.78);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-37],[-(k+1)*5.25,0,-37],[-(k+1)*5.25,0,37],[-k*5.25,0,37]]));s.tone(K,st,.12);
 const bd=new Path2D(),pn=new Path2D();
 addPoly(bd,polyP(c,[[8.6,0,-30],[8.6,0,30],[8.6,.95,30],[8.6,.95,-30]]));addPoly(bd,polyP(c,[[-110,0,37.5],[6,0,37.5],[6,.95,37.5],[-110,.95,37.5]]));addPoly(bd,polyP(c,[[-110,0,-37.5],[6,0,-37.5],[6,.95,-37.5],[-110,.95,-37.5]]));
 for(let k=0;k<10;k++){const z=-28+k*6;addPoly(pn,polyP(c,[[8.55,.3,z],[8.55,.3,z+3],[8.55,.65,z+3],[8.55,.65,z]]));}
 for(let k=0;k<18;k++){const x=-106+k*6.2;addPoly(pn,polyP(c,[[x,.3,37.45],[x+3,.3,37.45],[x+3,.65,37.45],[x,.65,37.45]]));addPoly(pn,polyP(c,[[x,.3,-37.45],[x+3,.3,-37.45],[x+3,.65,-37.45],[x,.65,-37.45]]));}
 s.knockout(bd);s.fill(B,bd,.9);s.fill(K,bd,.3);s.knockout(pn,.9);s.tone(Y,pn,.3);
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
/** the goal: posts z ±3.66, bar 2.44, net 2 m deep with a sloping roof; bulge pushes the back out around (bz) */
function goal3(s:Sheet,c:Cam,bulge:number,bz:number){
 const z0=-3.66,z1=3.66,H=2.44,back=(z:number)=>2+bulge*.8*Math.exp(-Math.pow((z-bz)/1.6,2)),zs=[z0,-1.8,0,1.8,z1];
 const planes:V3[][]=[[[0,0,z0],[0,H,z0],[back(z0),1.9,z0],[back(z0),0,z0]],[[0,0,z1],[0,H,z1],[back(z1),1.9,z1],[back(z1),0,z1]],
  [[0,H,z0],[0,H,z1],...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)],[...zs.map(z=>[back(z),0,z] as V3),...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));s.knockout(net,.32);
 const mesh=new Path2D(),w=.022,S3=(a:V3,b:V3,ww:number,m:Path2D)=>seg3(c,a,b,ww,m,2.2);
 for(let i=0;i<=12;i++){const z=lerp(z0,z1,i/12);S3([0,H,z],[back(z),1.9,z],w,mesh);S3([back(z),1.9,z],[back(z),0,z],w,mesh);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<4;i++)S3([back(zs[i]),y,zs[i]],[back(zs[i+1]),y,zs[i+1]],w,mesh);S3([0,y*H/1.9,z0],[back(z0),y,z0],w,mesh);S3([0,y*H/1.9,z1],[back(z1),y,z1],w,mesh);}
 for(let j=1;j<4;j++){const u=j/4;S3([2*u,H-.54*u,z0],[2*u,H-.54*u,z1],w,mesh);}
 s.fill(K,mesh,.75);
 const fr=new Path2D(),fo=new Path2D();for(const[a,b] of [[[0,0,z0],[0,H,z0]],[[0,0,z1],[0,H,z1]],[[0,H,z0-.06],[0,H,z1+.06]]] as [V3,V3][]){seg3(c,a,b,.13,fr);seg3(c,a,b,.2,fo);}
 s.knockout(fo);s.stroke(K,fo,2.2,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- the ball
/** paper ball, navy pentagon panels, blue shade crescent, navy rim, glint. (x,y) = centre; r in sheet units */
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
function dashes(s:Sheet,pts:Pt[],w:number,cov:number,seed:number,n=9){if(pts.length<2||cov<=0)return;const gaps:[number,number][]=[];for(let i=0;i<n;i++)gaps.push([(i+.62)/n,(i+.98)/n]);
 const p=ribbon(pts,w,{seed,taper:.2,wobble:.6,gaps});s.knockout(p,.85*cov);s.fill(Y,p,.95*cov);}
/** a soft yellow halo (the "pillow" of a soft touch): three rings breathing out from (x,y) */
function cushion(s:Sheet,x:number,y:number,r:number,g:number,seed:number){
 if(g<=0)return;const p=new Path2D();for(let k=0;k<3;k++){const rr=r*(.7+.45*k)*(.85+.3*g),pts:Pt[]=[];for(let i=0;i<26;i++){const a=i/26*TAU;pts.push([x+Math.cos(a)*rr,y+Math.sin(a)*rr*.82]);}
  p.addPath(ribbon(pts,Math.max(3,r*(.16-.04*k)),{seed:seed+k,close:true,wobble:.8,pressure:.25}));}
 s.knockout(p,.85*g);s.fill(Y,p,.95*g);s.stroke(K,p,1.6,.45*g);
}

// ---------------------------------------------------------------- kits (athlete styles)
const SKIN1:InkFill[]=[[R,.75],[Y,.2]],SKIN2:InkFill[]=[[Y,.32],[R,.2]],SKIN_RIV:InkFill[]=[[R,.8],[K,.2]];
/** Barcelona 2000-01 home: blaugrana stripes (red shirt, blue stripes), dark navy shorts; navy socks and yellow numbers inferred */
const BAR=(n:number|null,o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,pattern:'stripes',patternInk:B,shorts:[K,.95],socks:[K,.9],boots:K,skin:SKIN1,hair:K,line:K,trim:[K,.8],number:n,numberInk:Y,hairStyle:'short',seed:n??70,...o});
/** Valencia (inferred): white shirt, black (navy) shorts and socks */
const VAL=(n:number|null,o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:[K,.95],socks:[K,.9],boots:K,skin:SKIN2,hair:K,line:K,trim:[K,.9],number:n,numberInk:K,hairStyle:'short',seed:40+(n??9),...o});
const B_RIV:Build={height:1.86,bulk:.95,thighs:1.02};

// ---------------------------------------------------------------- the play: keyframed tracks (τ = seconds after De Boer's chip)
/** TCH: the chest touch · TC: the overhead kick (after the pop) · TG: the ball crosses the line in the bottom corner */
const TCH=1.75,TC=TCH+.8,TG=TC+.85;
type Role='riv'|'deb'|'mark'|'gk'|'run';
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];hero?:boolean};
/** De Boer's contact spot (deep, centre-left) and Rivaldo's spot on the edge of the box, back to goal */
const DB0:[number,number]=[-50.5,-7],RIV_C:[number,number]=[-18.3,.8];
/** positions [τ, x, z], Hermite-interpolated. All inferred from the written accounts (see header). */
const ACTORS:Actor[]=[
 {name:'Rivaldo',role:'riv',hero:true,style:BAR(10,{build:B_RIV,skin:SKIN_RIV,seed:10}),keys:[[-10,-30,6],[-6,-25,3.6],[-3,-21.2,1.9],[0,-19.4,1.15],[TCH-.7,-18.7,.9],[TCH,-18.45,.84],[TC,RIV_C[0],RIV_C[1]],[TC+.6,-18.25,.8],[TC+1.9,-18.2,.8],[TC+3.2,-17,-2.6],[TC+6,-14,-10.5],[TC+9,-10.5,-18]]},
 {name:'Frank de Boer',role:'deb',style:BAR(3,{build:{height:1.8},skin:SKIN2,hairStyle:'balding',seed:3}),keys:[[-10,-68,-13],[-5,-58.6,-10],[-1.2,-52,-7.7],[0,DB0[0],DB0[1]],[.6,-50,-6.8],[3,-47,-5.6],[9,-40,-3]]},
 {name:'Valencia marker',role:'mark',style:VAL(null,{build:{height:1.86,bulk:1.04},seed:51}),keys:[[-10,-24,3.4],[-5,-19.8,2.8],[-1,-17.8,2.2],[TCH,-17.3,2.1],[TC,-17.1,2.2],[TC+2,-16.8,2.4],[TC+9,-15.5,3]]},
 {name:'Valencia defender',role:'run',style:VAL(null,{seed:52}),keys:[[-10,-26,-6],[-5,-22,-4],[0,-20.2,-2.9],[TC,-19.6,-2.2],[TC+2,-19.2,-2],[TC+9,-18,-2]]},
 {name:'Valencia midfielder',role:'run',style:VAL(null,{skin:SKIN1,seed:53}),keys:[[-10,-32,-12],[-5,-27,-9],[0,-23,-6.4],[TC,-21.8,-5.4],[TC+2,-21.4,-5.2],[TC+9,-20,-5]]},
 {name:'Valencia centre-back',role:'run',style:VAL(null,{build:{height:1.88},seed:54}),keys:[[-10,-18,-1],[-5,-14,.4],[0,-11.8,1.2],[TC,-11,1.6],[TC+2,-10.8,1.8],[TC+9,-10,2]]},
 {name:'Patrick Kluivert',role:'run',style:BAR(9,{build:{height:1.88},seed:9}),keys:[[-10,-26,-12],[-5,-18,-9.5],[0,-13.2,-7.4],[TC,-11.6,-6],[TC+2,-11.2,-5.6],[TC+9,-14,-10]]},
 {name:'Barcelona midfielder',role:'run',style:BAR(null,{skin:SKIN2,seed:71}),keys:[[-10,-44,12],[-5,-37,10],[0,-31,8],[TC+1,-27.5,6],[TC+9,-22,2]]},
 {name:'Santiago Cañizares',role:'gk',style:{shirt:Y,shorts:[K,.9],socks:Y,boots:K,skin:SKIN2,hair:K,line:K,gloves:[B,.9],trim:K,number:1,numberInk:K,sleeves:'long',hairStyle:'short',build:{height:1.81},seed:1},
  keys:[[-10,-3.2,-1.4],[-4,-2.2,-.8],[0,-1.6,-.4],[TCH,-1.3,0],[TC,-1.1,.35],[TC+9,-1.1,.35]]},
];
const RIV=0,DEB=1,GK=ACTORS.findIndex(a=>a.role==='gk');
/** Hermite through time-spaced keys (tangents scaled per segment so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (drives the gait phase) — built once */
const T0=-11,T1=14,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.06),b=posOf(k,tau+.06);return[(b[0]-a[0])/.12,(b[1]-a[1])/.12];};
/** yaw that faces the direction (dx,dz): athlete.ts faces +x at yaw 0 and yaw turns left, so facing = (cos y, −sin y) */
const yawTo=(dx:number,dz:number)=>Math.atan2(-dz,dx);

// ---------------------------------------------------------------- the chest touch + the overhead kick: key poses on the athlete skeleton (u = seconds from contact)
/** The scissor, authored for the right foot and MIRRORED to Rivaldo's left: plant, the right knee drives up while the left foot pushes off
 * (take-off .3 s before contact) → he tips back past horizontal → the left leg whips over, laces on the ball above the hips → arms back and out
 * → land on the hands, then the back and shoulder → roll up and run. The ball drops almost straight onto him, so the sideways roll is halved. */
const SCISSOR_RIGHT:[number,Pose][]=[
 [-.3,posed({pitch:-12,lean:-6,roll:-6,twist:8,lHipF:94,lKnee:84,lAnk:28,rHipF:-12,rKnee:16,rAnk:54,lShF:64,rShF:48,lShA:54,rShA:46,lElb:44,rElb:50,neckP:-34})],
 [-.16,posed({pitch:-54,lean:-14,roll:-14,twist:14,lHipF:120,lKnee:36,lAnk:40,rHipF:24,rKnee:108,rAnk:40,lShA:98,rShA:72,lShF:14,rShF:34,lElb:26,rElb:34,neckP:18})],
 [-.06,posed({pitch:-78,lean:-10,roll:-20,twist:16,lHipF:78,lKnee:44,lAnk:40,rHipF:70,rKnee:72,rAnk:46,lShA:106,rShA:80,lShF:-8,rShF:6,lElb:20,rElb:26,neckP:36})],
 [0,posed({pitch:-88,lean:-8,roll:-24,twist:18,rHipF:104,rKnee:6,rAnk:54,rHipA:-6,lHipF:-12,lKnee:56,lAnk:30,lShA:112,rShA:70,lShF:-34,rShF:-6,lElb:16,rElb:34,neckP:48,lHand:1,rHand:1})],
 [.14,posed({pitch:-96,lean:-2,roll:-30,twist:14,rHipF:124,rKnee:22,rAnk:40,rHipA:-14,lHipF:-22,lKnee:64,lAnk:24,lShA:82,rShA:52,lShF:-64,rShF:-40,lElb:10,rElb:24,neckP:46,lHand:1,rHand:1})],
 [.34,posed({pitch:-88,lean:8,roll:-38,twist:10,rHipF:96,rKnee:50,lHipF:10,lKnee:78,lShA:46,rShA:40,lShF:-80,rShF:-66,lElb:18,rElb:26,neckP:52,lHand:1,rHand:1})],
 [.56,posed({pitch:-86,lean:26,roll:-30,rHipF:84,rKnee:86,lHipF:72,lKnee:96,lShA:44,rShA:40,lShF:-58,rShF:-50,lElb:52,rElb:56,neckP:46,lHand:.8,rHand:.8})],
 [1.1,posed({pitch:-24,lean:18,roll:-10,lHipF:86,rHipF:70,lKnee:70,rKnee:40,lShA:28,rShA:26,lShF:-40,rShF:-44,lElb:20,rElb:20,neckP:4,lHand:1,rHand:1})],
 [1.7,posed({lHipF:96,lKnee:118,lAnk:10,rHipF:-8,rKnee:104,rAnk:40,lean:24,pitch:4,lShA:30,rShA:30,lShF:20,rShF:10,lElb:40,rElb:40,neckP:-8})],
 [2.3,runCycle(.55,{speed:.5})],
];
const leftScissor=(p:Pose):Pose=>{const m=mirrorPose(p);m.roll*=.5;m.twist*=.7;return clampPose(m);};
/** the chest touch: ready under the dropping ball → chest out, arms wide, leaning back (contact at −.8, the chest gives like a pillow) →
 * the chest pushes up and the ball pops, eyes up → set under it, then the scissor */
const CHEST:[number,Pose][]=[
 [-1.3,posed({lHipF:26,rHipF:22,lKnee:34,rKnee:30,lean:6,pitch:2,neckP:-36,lShA:34,rShA:34,lElb:48,rElb:48,lShF:12,rShF:10})],
 [-.98,posed({lHipF:24,rHipF:32,lKnee:40,rKnee:44,lean:-12,pitch:-3,neckP:-16,lShA:62,rShA:62,lShF:16,rShF:16,lElb:40,rElb:40,squash:.03})],
 [-.8,posed({lHipF:26,rHipF:34,lKnee:48,rKnee:50,lean:-26,pitch:-6,neckP:24,lShA:74,rShA:74,lShF:12,rShF:12,lElb:30,rElb:30,squash:-.05})],
 [-.62,posed({lHipF:18,rHipF:22,lKnee:24,rKnee:28,lean:-14,pitch:-3,neckP:-42,lShA:58,rShA:56,lShF:20,rShF:18,lElb:38,rElb:40,squash:.03})],
 [-.45,posed({rHipF:30,lHipF:34,rKnee:44,lKnee:52,lean:4,neckP:-50,lShA:44,rShA:48,lShF:24,rShF:20,lElb:50,rElb:48})],
];
const OVER:[number,Pose][]=[...CHEST,...SCISSOR_RIGHT.map(([u,p]):[number,Pose]=>[u,u>=2.3?p:leftScissor(p)])];
const CONTACT_POSE=OVER.find(k=>k[0]===0)![1],CHEST_POSE=OVER.find(k=>k[0]===-.8)![1],TAKEOFF_POSE=OVER.find(k=>k[0]===-.3)![1];
/** pelvis height of a pose when its lowest point touches the ground */
const pelvisY=(p:Pose,b:Build)=>solve({...p,air:0},b).pelvis[1];
/** the laces of the LEFT boot: 60 % from the ankle to the toe */
const lacesOf=(sk:{lAn:V3;lToe:V3})=>mix3(sk.lAn,sk.lToe,.6);
/** a ballistic pelvis: take-off at u = −.3 from standing height, through (0, hc) at contact, gravity 9.81 */
function jumpArc(b:Build,contactLaces:number){
 const sk=solve({...CONTACT_POSE,air:0},b),hc=contactLaces-(lacesOf(sk)[1]-sk.pelvis[1]),y0=pelvisY(TAKEOFF_POSE,b),v=(hc-y0+4.905*.09)/.3;
 return{hc,y0,v,h:(u:number)=>y0+v*(u+.3)-4.905*(u+.3)*(u+.3)};
}
function flyPose(p:Pose,u:number,arc:{h:(u:number)=>number},b:Build):Pose{if(u<=-.3||u>1.2)return p;return{...p,air:clamp(arc.h(u)-pelvisY(p,b),0,2)};}
const ARC_RIV=jumpArc(B_RIV,1.72);
/** Rivaldo: back to goal, facing the pass */
const R_YAW=yawTo(DB0[0]-RIV_C[0],DB0[1]-RIV_C[1]);
const R_F:[number,number]=[Math.cos(R_YAW),-Math.sin(R_YAW)],R_LT:[number,number]=[R_F[1],-R_F[0]];

// ---------------------------------------------------------------- the ball: De Boer's chip → the chest → the pop → the laces → the bottom corner (with a late swerve)
type State={pose:Pose;place:Place};
const BALL_R=.11;
/** De Boer's contact point (left foot) */
const PASS_DIR=(()=>{const dx=RIV_C[0]-DB0[0],dz=RIV_C[1]-DB0[1],l=Math.hypot(dx,dz);return[dx/l,dz/l] as [number,number];})();
const P0:V3=[DB0[0]+PASS_DIR[0]*.3+PASS_DIR[1]*.12,BALL_R,DB0[1]+PASS_DIR[1]*.3-PASS_DIR[0]*.12];
/** the chest point: just in front of Rivaldo's sternum at TCH */
const PCH:V3=(()=>{const[x,z]=posOf(RIV,TCH),sk=solve(CHEST_POSE,B_RIV,{x,z,yaw:R_YAW});return add(add(mix3(sk.chest,sk.neck,.35),[R_F[0]*(.13+BALL_R),.02,R_F[1]*(.13+BALL_R)]),[0,0,0]);})();
/** the contact point: the ball sits on the left laces at TC */
const PC:V3=(()=>{const sk=solve({...CONTACT_POSE,air:clamp(ARC_RIV.hc-pelvisY(CONTACT_POSE,B_RIV),0,2)},B_RIV,{x:RIV_C[0],z:RIV_C[1],yaw:R_YAW}),l=lacesOf(sk);return add(l,mul(nrm(sub([PCH[0],l[1]+4,PCH[2]],l)),BALL_R+.03));})();
/** where it crosses the line: the bottom corner to Cañizares's left (+z); SWERVE bends it away from his dive late in the flight */
const PG:V3=[0,.4,2.95],SWERVE:V3=[0,0,.95],NETP:V3=[1.5,.32,3.15],REST:V3=[1.7,BALL_R,3.05];
const ballistic=(A:V3,Bp:V3,d:number):V3=>[(Bp[0]-A[0])/d,(Bp[1]-A[1]+4.905*d*d)/d,(Bp[2]-A[2])/d];
const V_PASS=ballistic(P0,PCH,TCH),V_POP=ballistic(PCH,PC,TC-TCH),V_SHOT=ballistic(PC,sub(PG,SWERVE),TG-TC);
const fly=(A:V3,V:V3,t:number):V3=>[A[0]+V[0]*t,A[1]+V[1]*t-4.905*t*t,A[2]+V[2]*t];
function ballAt(tau:number):V3{
 if(tau<0){// De Boer brings it out from the back: touches every ~1.9 m, then sets it for the chip
  const dribble=(tt:number):V3=>{const p=posOf(DEB,tt),v=velOf(DEB,tt),l=Math.hypot(v[0],v[1])||1,f=((distOf(DEB,tt)/1.9)%1+1)%1,d=.42+.38*(f<.18?f/.18:1-(f-.18)/.82);return[p[0]+v[0]/l*d,BALL_R,p[1]+v[1]/l*d];};
  if(tau<-.4)return dribble(tau);const u=easeOut((tau+.4)/.4);return mix3(dribble(-.4),P0,u);}
 if(tau<TCH)return fly(P0,V_PASS,tau);
 if(tau<TC)return fly(PCH,V_POP,tau-TCH);
 if(tau<TG){const u=(tau-TC)/(TG-TC);return add(fly(PC,V_SHOT,tau-TC),mul(SWERVE,u*u));}
 if(tau<TG+.22)return mix3(PG,NETP,easeOut((tau-TG)/.22));
 const u=clamp((tau-TG-.22)/.45);return[lerp(NETP[0],REST[0],u),lerp(NETP[1],REST[1],u*u),lerp(NETP[2],REST[2],u)];
}
const velAt=(tau:number):V3=>{if(tau<=0||tau>=TG)return[0,0,0];const a=ballAt(tau-.01),b=ballAt(tau+.01);return mul(sub(b,a),50);};
const ballSpin=(tau:number)=>tau<0?distOf(DEB,tau)/BALL_R:tau<TCH?tau*9:tau<TC?TCH*9+(tau-TCH)*2:tau<TG?TCH*9+1.6-(tau-TC)*40:TCH*9+1.6-(TG-TC)*40;
const bulgeAt=(tau:number)=>tau<TG+.05?0:Math.exp(-(tau-TG-.05)*2.4)*(1+.3*Math.sin((tau-TG)*14));

// ---------------------------------------------------------------- poses from the tracks
function loco(k:number,tau:number):Pose{
 const v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),q=clamp(sp/8),ph=distOf(k,tau)/(2.4+2.2*q)+k*.37;
 const run=runCycle(ph,{speed:q});if(sp>1.4)return run;
 const idle=blendPose(stand(),posed({lHipF:24,rHipF:18,lKnee:30,rKnee:26,lean:14,pitch:4,neckP:-10,lShA:18,rShA:16,lElb:40,rElb:36,rAnk:-6,lAnk:-6}),.5+.5*Math.sin(tau*1.7+k));
 return blendPose(idle,run,clamp((sp-.25)/1.15));
}
/** face along the run when moving, else toward the ball (blended, so turns are continuous) */
function faceYaw(k:number,tau:number,target?:V3):number{
 const v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),p=posOf(k,tau),b=target??ballAt(tau),tx=b[0]-p[0],tz=b[2]-p[1],tl=Math.hypot(tx,tz)||1,w=clamp((sp-.6)/1.6);
 return yawTo(lerp(tx/tl,v[0]/(sp||1),w),lerp(tz/tl,v[1]/(sp||1),w));
}
/** the marker: a step in, both eyes on the ball above, then a flinch as the boot comes over */
const LOOK_UP=posed({lHipF:26,rHipF:22,lKnee:34,rKnee:30,lean:-4,neckP:-44,lShA:28,rShA:32,lElb:50,rElb:46});
const FLINCH=posed({lHipF:30,rHipF:26,lKnee:40,rKnee:36,lean:16,twist:-14,neckP:10,neckY:-30,lShA:40,rShA:36,lShF:40,rShF:44,lElb:100,rElb:96,squash:-.04});
function stateOf(k:number,tau:number):State{
 const a=ACTORS[k],[x,z]=posOf(k,tau);let pose=loco(k,tau),yaw=faceYaw(k,tau);
 switch(a.role){
  case 'riv':{const u=tau-TC;
   if(u>=-1.3&&u<2.3)pose=keyPoses(u,[[-1.3,blendPose(loco(k,TC-1.3),OVER[0][1],.5)],...OVER.slice(1)]);
   else if(u>=2.3){const run=celebrate(distOf(k,tau)/4,{kind:'run'});pose=blendPose(OVER[OVER.length-1][1],run,sm(2.3,2.9,u));}
   pose=flyPose(pose,u,ARC_RIV,B_RIV);
   // eyes on the chipped ball, then settled back to goal as it drops
   yaw=lerpAng(faceYaw(k,tau,[DB0[0],0,DB0[1]]),R_YAW,sm(-2.4,-1.4,u));
   if(u>1.6)yaw=lerpAng(R_YAW,faceYaw(k,tau),sm(1.6,2.8,u));
   break;}
  case 'deb':{const w=sm(-.75,-.5,tau)*(1-sm(.45,.9,tau));if(w>0)pose=blendPose(pose,strike(clamp((tau+.5)/.95),{foot:'l',power:.7}),w);
   yaw=lerpAng(yaw,yawTo(PASS_DIR[0],PASS_DIR[1]),sm(-1.4,-.6,tau)*(1-sm(.8,1.6,tau)));break;}
  case 'mark':{const w1=sm(TCH-.4,TCH,tau)*(1-sm(TC-.3,TC-.1,tau)),w2=sm(TC-.3,TC-.05,tau)*(1-sm(TC+.8,TC+1.6,tau));
   if(w1>0)pose=blendPose(pose,LOOK_UP,w1);if(w2>0)pose=blendPose(pose,FLINCH,w2);yaw=faceYaw(k,Math.min(tau,TC));break;}
  case 'gk':{const td=TC+.12,du=1.05;
   if(tau<td)pose=keeperSet(tau*1.4);else pose=keeperDive(clamp((tau-td)/du),{side:'l',height:.12});
   if(tau<td-.3)yaw=faceYaw(k,tau);else yaw=lerpAng(faceYaw(k,td-.3),Math.PI,sm(td-.3,td,tau));
   break;}
  default:break;
 }
 return{pose,place:{x,z,yaw}};
}

// ---------------------------------------------------------------- THE ADAPTER: every body in this film goes through here
/** drawPlayer(sheet, pose, camera, style, place, motion): one call per figure → the shared fluid-body library (lib/plays/riso/athlete.ts).
 * `prev` (the pose one drawn frame earlier) turns on secondary motion (hair, shirt hem) and, with `smear`, a halftone motion trail. */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,o:{prev?:State;smear?:boolean}={}):DrawResult{
 if(o.prev&&o.smear)motionSmear(s,o.prev.pose,pose,camera,style,place,{prevPlace:o.prev.place,threshold:9});
 return drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev.pose,prevPlace:o.prev.place}:{});
}

// ---------------------------------------------------------------- the pitch through a camera: shadows, bodies, the ball, the goal, in depth order
type PlayOpts={dtau?:number;smear?:boolean;spark?:number;goalLast?:boolean;touch?:number};
/** τ = the play clock for this frame (on twos); dtau = τ per drawn frame (for secondary motion) */
function play(s:Sheet,c:Cam,v:View,tau:number,o:PlayOpts={}):{ball:Pt|null;br:number;riv?:DrawResult}{
 const{dtau=0,smear=false,spark=0,goalLast=false,touch=0}=o;
 const b=ballAt(tau),bq=toCam(c,b),bg=bq[2]>=NEAR?scr(c,bq):null,br=bg?Math.max(4,c.F*BALL_R/bq[2]):0;
 const gq=pr(c,[b[0],0,b[2]]);if(gq&&b[0]<.1){const k=c.F/Math.max(1,toCam(c,[b[0],0,b[2]])[2]),r=clamp(.16*k*(1-Math.min(.7,b[1]/5)),2,300);s.tone(K,polyPath(blob(gq[0],gq[1],r,r*.3,2,{amp:.05,n:12}),true),.45*(1-Math.min(.8,b[1]/7)));}
 type Item={d:number;draw:()=>void};const items:Item[]=[];let riv:DrawResult|undefined;const m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr;const passing=!!s._passage.pending;
 ACTORS.forEach((a,k)=>{const st=stateOf(k,tau),x=st.place.x??0,z=st.place.z??0,q=toCam(c,[x,1,z]);if(q[2]<NEAR+.5)return;const p=scr(c,q),h=c.F*1.9/q[2];
  if(Math.abs(p[0])>v.hx+h||Math.abs(p[1])>v.hy+h)return;
  const prev=dtau>0&&(a.hero||a.role==='gk')?stateOf(k,tau-dtau):undefined;
  // the outgoing scene of a passage is zoomed past the camera: its figures print simply; small figures in wide shots print at 'low'
  const key_=a.hero||a.role==='gk'||a.role==='mark',style=passing?{...a.style,detail:a.hero?'mid' as const:'low' as const}:!key_&&h*ppu<150?{...a.style,detail:'low' as const}:h*ppu<60?{...a.style,detail:'low' as const}:a.style;
  items.push({d:q[2],draw:()=>{const r=drawPlayer(s,st.pose,c,style,st.place,{prev,smear:smear&&(!!a.hero||a.role==='gk')});if(a.hero)riv=r;}});});
 const inNet=b[0]>.05;
 const drawBall=()=>{if(!bg)return;const V=velAt(tau),sp=Math.hypot(V[0],V[1],V[2]),nb=pr(c,sub(b,mul(V,.03)));
  const dir=nb?Math.atan2(bg[1]-nb[1],bg[0]-nb[0]):0,sm_=nb&&sp>3?Math.min(br*3,Math.hypot(bg[0]-nb[0],bg[1]-nb[1])*1.4):0;ball(s,bg[0],bg[1],br,ballSpin(tau),sm_,dir);
  if(spark>0)sparkBurst(s,Y,bg[0],bg[1],br*4.2,{n:9,seed:17,g:easeOutBack(clamp(spark*2))*(1-clamp((spark-.5)*2)),width:br*.5});};
 // the chest touch: a small soft halo where the ball meets his chest
 if(touch>0&&touch<1){const q=pr(c,PCH);if(q){const r=Math.max(14,c.F*.3/Math.max(1,toCam(c,PCH)[2]));items.push({d:toCam(c,PCH)[2]-.4,draw:()=>cushion(s,q[0],q[1],r,easeOutBack(clamp(touch*2.5))*(1-clamp((touch-.55)/.45)),23)});}}
 const goal=()=>goal3(s,c,bulgeAt(tau),b[2]);
 if(!goalLast){if(inNet)drawBall();goal();}
 if(!inNet||goalLast)items.push({d:bq[2],draw:drawBall});
 items.sort((p,q)=>q.d-p.d);for(const it of items)it.draw();
 if(goalLast)goal();
 return{ball:bg,br,riv};
}

// ---------------------------------------------------------------- 1 · LIVE: the high main-stand camera, real time
/** τ from chapter time: real time, with the chest touch on "chests" and the kick on "overhead" (the short stretch between is eased to fit) */
function tau1(t:number){const tC=CUEW(0,'chests')+.25,tO=Math.max(tC+.3,CUEW(0,'overhead')+.05);
 if(t<tC)return TCH+(t-tC);if(t<tO)return TCH+(TC-TCH)*(t-tC)/(tO-tC);return TC+(t-tO);}
const E1:V3=[-40,24,-70];
function cam1(t:number):Cam{
 const tau=tau1(t),tD=CUEW(0,'De Boer'),tR=CUEW(0,'Rivaldo'),tB=CUEW(0,'Bottom'),S=SECS(0);
 const bs=(u:number):V3=>{const q=ballAt(u);return[q[0],0,q[2]];},bt=mul(add(add(bs(tau),bs(tau-.3)),bs(tau-.6)),1/3);
 const r=posOf(RIV,tau),R3:V3=[r[0],0,r[1]],d=posOf(DEB,Math.min(tau,.4)),wide:V3=[d[0]+10,0,d[1]+5];
 const w1=sm(tD-.6,tD+1.2,t,easeInOutSine),w2=sm(tR-.8,tR+.6,t,easeInOutSine),w3=sm(tB+.2,tB+1.8,t,easeInOutSine);
 const T=mix3(mix3(mix3(wide,mix3(bt,R3,.35),w1),mix3(R3,[-9,0,1.5],.35),w2),mix3(R3,[-3,0,2],.55),w3);T[1]=1.2+1.4*w2;
 const F=key(t,[[0,2900],[CUEW(0,'Two'),3200],[CUEW(0,'Barcelona'),3400],[tD,3300],[tR,4300],[CUEW(0,'overhead'),4700],[tB,4900],[S,4500]],easeInOutSine)*LENS;
 return lookAt(E1,T,F);
}
const ch1:Scene={
 draw(s,t){frame(s);const v=view(s),c=cam1(t),tau=tau1(twos(t)),tB=CUEW(0,'Bottom'),tM=CUEW(0,'Barcelona must');
  stadium(s,c,v,t,{roar:sm(tB-.2,tB+.6,t),flash:.5*sm(tM-.2,tM+.4,t)*(1-sm(tM+1.2,tM+2,t))+sm(tB,tB+.4,t)});
  ground(s,c);play(s,c,v,tau,{touch:(tau-TCH)/.45});},
 aperture(t){const c=cam1(t),b=ballAt(tau1(twos(t))),q=toCam(c,b),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(16,c.F*BALL_R/q[2]*1.6),12);},
 still:9.8,
};

// ---------------------------------------------------------------- 2 · REPLAY: slow motion from a low pitch-side camera on Rivaldo's left
function tau2(t:number){return key(t,mono([[0,TCH-.75],[CUEW(1,'His chest'),TCH-.22],[CUEW(1,'like a pillow'),TCH+.02],[CUEW(1,'cushions'),TCH+.14],[CUEW(1,'pops'),TCH+.42],[CUEW(1,'Then he falls'),TC-.32],[CUEW(1,'swings'),TC-.08],[CUEW(1,'swings')+1.1,TC+.12],[SECS(1),TC+.75]]),linear);}
const E2:V3=[RIV_C[0]+R_LT[0]*8.2-R_F[0]*1.2,1.05,RIV_C[1]+R_LT[1]*8.2-R_F[1]*1.2];
function cam2(t:number):Cam{
 const tau=tau2(t),[x,z]=posOf(RIV,tau),S=SECS(1),tc=CUEW(1,'His chest'),tp=CUEW(1,'pops'),tf=CUEW(1,'Then he falls'),sc=CUEW(1,'swings');
 const b=ballAt(tau),onBall:V3=[b[0],Math.max(1,b[1]),b[2]],R3:V3=[x,1.35,z],chest:V3=[x,1.45,z];
 const lift=sm(tp-.4,tp+.6,t,easeInOutSine)*(1-sm(sc+.8,S,t)),follow=sm(sc+.9,S-.3,t,easeInOutSine);
 const T=mix3(mix3(mix3(onBall,chest,.45+.55*sm(tc-1,tc,t,easeInOutSine)),mix3(R3,[x,2.1,z],.6),lift),mix3(R3,[PG[0]-4,1,PG[2]],.55),follow);
 const F=key(t,[[0,3300],[tc,4600],[CUEW(1,'like'),5000],[CUEW(1,'cushions'),4800],[tp,3600],[tf,3200],[sc,3100],[S,2300]],easeInOutSine)*LENS;
 return lookAt(E2,T,F);
}
const ch2:Scene={
 draw(s,t){frame(s);const v=view(s),c=cam2(t),tp=twos(t),tau=tau2(tp),dtau=Math.max(.004,tau-tau2(tp-1/12));
  const tc=CUEW(1,'His chest'),tl=CUEW(1,'like'),tpop=CUEW(1,'pops'),tf=CUEW(1,'Then he falls'),tsw=CUEW(1,'swings');
  stadium(s,c,v,t);ground(s,c);
  // "pops it up": the pop printed as a dashed yellow arc from the chest up and over to where his boot will meet it
  const arc=sm(tpop-.2,tpop+.7,t)*(1-sm(tsw-.2,tsw+.3,t));
  if(arc>0){const pts:Pt[]=[];for(let i=0;i<=24;i++){const q=pr(c,fly(PCH,V_POP,i/24*(TC-TCH)));if(q)pts.push(q);}dashes(s,pts,7,arc,41,11);}
  const r=play(s,c,v,tau,{dtau,smear:true,spark:tau>=TC-.01?(tau-TC)/.18:0});
  // "His chest is soft, like a pillow": a soft yellow pillow printed on his chest, breathing as the ball sinks in
  const pil=sm(tc-.1,tc+.4,t)*(1-sm(CUEW(1,'cushions')+.8,tpop+.2,t));
  if(pil>0&&r.riv){const e=r.riv.joints.chest,n=r.riv.joints.neck,cx=lerp(e[0],n[0],.4),cy=lerp(e[1],n[1],.4),rr=Math.max(26,Math.hypot(n[0]-e[0],n[1]-e[1])*.9);
   cushion(s,cx,cy,rr*(1+.12*sm(tl,tl+.5,t)),pil,61);}
  // "falls back": a curved yellow arrow from over his head down behind him (goal side), the way his back goes
  const fb=sm(tf-.1,tf+.5,t)*(1-sm(tsw+.4,tsw+1,t));
  if(fb>0){const pts:Pt[]=[];for(let i=0;i<=16;i++){const a=(.1+1.25*i/16)*fb,q=pr(c,[RIV_C[0]-R_F[0]*1.25*Math.sin(a),.35+1.9*Math.cos(a),RIV_C[1]-R_F[1]*1.25*Math.sin(a)]);if(q)pts.push(q);}
   if(pts.length>2){const w=Math.max(5,c.F*.06/Math.max(1,toCam(c,[RIV_C[0],1,RIV_C[1]])[2])),p=ribbon(pts,w,{seed:31,taper:.3,wobble:.5});const e=pts[pts.length-1],d=pts[pts.length-2],ang=Math.atan2(e[1]-d[1],e[0]-d[0]),hd=w*2.4;
    p.addPath(polyPath([[e[0]+Math.cos(ang)*hd,e[1]+Math.sin(ang)*hd],[e[0]+Math.cos(ang+2.2)*hd,e[1]+Math.sin(ang+2.2)*hd],[e[0]+Math.cos(ang-2.2)*hd,e[1]+Math.sin(ang-2.2)*hd]],true));
    s.knockout(p,.85*fb);s.fill(Y,p,.95*fb);s.stroke(K,p,2,.6*fb);}}
 },
 aperture(t){const c=cam2(t),b=ballAt(tau2(twos(t))),q=toCam(c,b),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(22,c.F*BALL_R/q[2]*1.4),12);},
 still:8.6,
};

// ---------------------------------------------------------------- 3 · REPLAY behind the goal: Cañizares dives, the swerve, then Rivaldo's run and the crowd
function tau3(t:number){return key(t,mono([[0,TC-.35],[CUEW(2,'Cañizares')+.3,TC+.2],[CUEW(2,'swerves')+.4,TG],[CUEW(2,'Three')+.3,TG+.8],[CUEW(2,'A hat'),TG+2],[SECS(2),TG+5.6]]),linear);}
const E3:V3=[6.6,1.5,1.4];
/** the fans' section: the lower main stand (−z), x −30 … 0 */
const FANS=(()=>{const out:{a:number;b:number;h:number}[]=[];for(let j=0;j<9;j++)for(let i=0;i<40;i++){const h=hash(i*97+j*13,27);if(h<.08)continue;out.push({a:(i+.5+(hash(i,j+3)-.5)*.35)/40,b:.04+j*.07,h});}return out;})();
const fanPt=(a:number,b:number):V3=>[lerp(-30,0,a),1.4+22*b,-40-26*b];
function cam3(t:number):Cam{
 const tau=tau3(t),tH=CUEW(2,'A hat'),pan=sm(tH-.6,tH+1.2,t,easeInOutSine);
 const b=ballAt(Math.min(tau,TG)),toPlay:V3=mix3([-12,1.3,1],[b[0]-1.5,Math.max(.8,b[1]),b[2]],.5*sm(0,CUEW(2,'Three'),t));
 const[rx,rz]=posOf(RIV,tau),T=mix3(toPlay,mix3([rx,1.4,rz],fanPt(.5,.3),.45),pan),F=lerp(2200,2500,pan)*LENS;
 return lookAt(add(E3,[0,.4*pan,-.9*pan]),T,F);
}
/** the fans: rows jumping with both arms up, blaugrana scarves held high — batched: knockout, shirts, skin, scarves */
function fans(s:Sheet,c:Cam,v:View,t:number,rise:number){
 if(rise<=0)return;
 const sil=new Path2D(),red=new Path2D(),blue=new Path2D(),skin=new Path2D(),hair=new Path2D(),scarfR=new Path2D(),scarfB=new Path2D();let n=0;const tt=twos(t);
 for(const f of FANS){const up=clamp(rise*1.5-f.h*.5),jump=up*.18*Math.max(0,Math.sin(tt*9+f.h*TAU)),P=fanPt(f.a,f.b),q=toCam(c,add(P,[0,.5+.45*up+jump,0]));if(q[2]<NEAR+2)continue;const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;
  const k=c.F/q[2],w=.48*k,h=.64*k,hr=.13*k,x=p[0],y=p[1];n++;
  const body=polyPath([[x-w/2,y+h*.6],[x-w*.42,y-h*.35],[x-w*.18,y-h*.5],[x+w*.18,y-h*.5],[x+w*.42,y-h*.35],[x+w/2,y+h*.6]],true);sil.addPath(body);
  if(f.h<.45)red.addPath(body);else if(f.h<.8)blue.addPath(body);
  const head=polyPath(blob(x,y-h*.5-hr*.9,hr,hr*1.1,Math.floor(f.h*99),{amp:.06,n:10}),true);sil.addPath(head);skin.addPath(head);
  hair.addPath(polyPath(blob(x,y-h*.5-hr*1.35,hr*.95,hr*.55,Math.floor(f.h*77),{amp:.08,n:10}),true));
  if(up>.15){const ay=y-h*.45-hr*2.6*up,sw=Math.sin(tt*7+f.h*9)*w*.25;
   for(const sx of[-1,1]){const ax=x+sx*w*.42;sil.addPath(ribbon([[x+sx*w*.3,y-h*.3],[ax+sw*.3,ay]],w*.2,{seed:Math.floor(f.h*50)+sx}));skin.addPath(polyPath(blob(ax+sw*.3,ay,hr*.6,hr*.66,Math.floor(f.h*55)+sx,{amp:.05,n:8}),true));}
   if(f.h>.35&&f.h<.7){const sc=rectPath(x-w*.42+sw*.3,ay-hr*.5,w*.84,hr*.9);sil.addPath(sc);(f.h<.52?scarfR:scarfB).addPath(sc);}}}
 if(!n)return;s.knockout(sil);s.fill(R,red,.9);s.fill(B,blue,.9);s.tone(Y,skin,.4);s.tone(R,skin,.3);s.fill(K,hair,.85);s.fill(R,scarfR,.95);s.fill(B,scarfB,.95);s.stroke(K,sil,2.2,.9);
}
const ch3:Scene={
 draw(s,t){frame(s);const v=view(s),c=cam3(t),tp=twos(t),tau=tau3(tp),tT=CUEW(2,'Three'),tH=CUEW(2,'A hat'),tCL=CUEW(2,'Champions');
  stadium(s,c,v,t,{roar:.7*sm(tT,tH+.4,t),flash:sm(tT,tT+.4,t)*(1-sm(tCL+1,tCL+2,t))});
  fans(s,c,v,t,sm(tH-.4,tCL,t));
  ground(s,c);
  // "swerves past him": the ball's bending line printed ahead of it, from the kick to the corner
  const sw=sm(CUEW(2,'swerves')-.2,CUEW(2,'swerves')+.3,t)*(1-sm(tT+.2,tT+.9,t));
  if(sw>0){const pts:Pt[]=[];for(let i=0;i<=22;i++){const q=pr(c,ballAt(TC+(TG-TC)*i/22));if(q)pts.push(q);}dashes(s,pts,6,sw,47,10);}
  const r=play(s,c,v,tau,{dtau:Math.max(.004,tau-tau3(tp-1/12)),smear:true,goalLast:true});
  // "Three-two": the ball meets the net in the bottom corner — a yellow burst so it reads through the mesh
  const hn=(tau-TG)/.7;if(hn>0&&hn<1&&r.ball)sparkBurst(s,Y,r.ball[0],r.ball[1],Math.max(60,r.br*5),{n:10,seed:29,g:easeOutBack(clamp(hn*3))*(1-clamp((hn-.6)/.4)),width:Math.max(8,r.br*.6)});
  // "Champions League place": one blaugrana scarf held high in the stand, sparked yellow — the passage material into the lesson
  const fl=sm(tCL-.2,tCL+.6,t);if(fl>0){const q=pr(c,fanPt(.55,.36));if(q)sparkBurst(s,Y,q[0],q[1],90+120*fl,{n:10,seed:5,g:fl,width:14});}},
 aperture(t){const c=cam3(t),q=pr(c,fanPt(.55,.36))??[0,0];return apertureDisc(q[0],q[1],60,12);},
 still:4.8,
};

// ---------------------------------------------------------------- 4 · THE LESSON: a training pitch at dusk, a thick crash mat, a coach tossing the ball
/** metres: the mat centred on the origin (3.6 × 2.4 × .35 m); the player faces the coach (−x) with a small goal behind (+x);
 * the camera is a low front three-quarter from +z, so the kicking (left) leg is the near one. */
const B_KID:Build={height:1.4,bulk:.88,head:1.12},MAT_H=.35,MAT:[number,number,number,number]=[-1.8,1.8,-1.2,1.2];
const KID:AthleteStyle={shirt:R,pattern:'stripes',patternInk:B,shorts:[K,.9],socks:[K,.85],boots:K,skin:SKIN2,hair:[K,.9],line:K,trim:[K,.8],hairStyle:'ponytail',build:B_KID,seed:33};
const COACH:AthleteStyle={shirt:[B,.85],shorts:[K,.85],socks:'paper',boots:K,skin:SKIN1,hair:K,line:K,trim:[Y,.9],sleeves:'long',hairStyle:'short',build:{height:1.78,bulk:1.05},seed:34};
const TC4=1.5,TCH4=TC4-.8,KID_X=.1,COACH_X=-2.9;
const ARC_KID=jumpArc(B_KID,1.3);
/** the lesson clock (kid τ, contact at TC4): slow motion keyed to the words */
function tau4(t:number){return key(t,mono([[0,TCH4-2],[CUEW(3,'A soft'),TCH4-.3],[CUEW(3,'sets up'),TCH4+.12],[CUEW(3,'next move'),TCH4+.4],[CUEW(3,'Overhead'),TC4-.32],[CUEW(3,'Overhead')+1.3,TC4+.1],[CUEW(3,'soft mats'),TC4+.42],[CUEW(3,'with a coach'),TC4+.7],[SECS(3),TC4+1.4]]),linear);}
/** the coach stands and tosses underarm (release at TCH4 − 1.1) */
const CSET=posed({lHipF:14,rHipF:6,lKnee:14,rKnee:10,lean:8,rShF:10,rElb:60,lShF:10,lShA:18,lElb:40,neckP:4,rHand:.6});
const TOSS=[[-2.1,CSET],[-1.6,posed({lHipF:30,rHipF:-6,lKnee:30,rKnee:14,lean:22,rShF:-44,rElb:12,lShF:24,lShA:24,lElb:40,neckP:-4,rHand:.7})],
 [-1.1,posed({lHipF:22,rHipF:-10,lKnee:18,rKnee:10,lean:4,rShF:112,rElb:8,lShF:30,lShA:30,lElb:36,neckP:-18,rHand:1})],
 [-.5,posed({lHipF:14,rHipF:4,lKnee:14,rKnee:10,lean:2,rShF:88,rElb:16,lShF:12,lShA:22,lElb:30,neckP:-22,rHand:1})],
 [.8,CSET],[1.6,posed({lHipF:14,rHipF:6,lKnee:14,rKnee:10,lean:4,rShF:40,rShA:30,rElb:100,lShF:40,lShA:30,lElb:100,neckP:-4,lHand:1,rHand:1})]] as [number,Pose][];
function coachState(tau:number):State{return{pose:keyPoses(tau-TCH4,TOSS),place:{x:COACH_X,z:-.2,y:0,yaw:0}};}
const READY_KID=posed({lHipF:30,rHipF:36,lKnee:40,rKnee:48,lean:14,pitch:3,neckP:-22,lShA:28,rShA:26,lShF:10,rShF:4,lElb:50,rElb:50});
function kidState(tau:number):State{
 const u=tau-TC4,pre=(tt:number)=>blendPose(stand(),READY_KID,.45+.3*Math.sin(tt*3.2));let pose=pre(tau);
 if(u>=-1.3)pose=keyPoses(u,[[-1.3,pre(TC4-1.3)],...OVER.slice(1,OVER.length-2)]);
 pose=flyPose(pose,u,ARC_KID,B_KID);
 const x=KID_X+.3*sm(-.3,.4,u);return{pose,place:{x,z:0,y:MAT_H,yaw:Math.PI}};
}
/** toss: from the coach's hand on a ballistic arc to the kid's chest, the pop, the laces, then over the kid's head into the small goal */
const REL=TCH4-1.1;
const handAt=(tau:number)=>{const st=coachState(tau),sk=solve(st.pose,{height:1.78,bulk:1.05},st.place);return add(sk.rHa,[.1,.03,0]);};
const HAND0:V3=handAt(REL);
const KCH:V3=(()=>{const sk=solve(CHEST_POSE,B_KID,{x:KID_X,z:0,y:MAT_H,yaw:Math.PI});return add(mix3(sk.chest,sk.neck,.35),[-(.1+BALL_R),.02,0]);})();
const KC:V3=(()=>{const sk=solve({...CONTACT_POSE,air:clamp(ARC_KID.hc-pelvisY(CONTACT_POSE,B_KID),0,2)},B_KID,{x:KID_X+.3*sm(-.3,.4,0),z:0,y:MAT_H,yaw:Math.PI}),l=lacesOf(sk);return add(l,[-(BALL_R+.02),.05,0]);})();
const V_TOSS=ballistic(HAND0,KCH,TCH4-REL),V_KPOP=ballistic(KCH,KC,TC4-TCH4);
function kidBall(tau:number):V3{
 if(tau<REL)return handAt(tau);
 if(tau<TCH4)return fly(HAND0,V_TOSS,tau-REL);
 if(tau<TC4)return fly(KCH,V_KPOP,tau-TCH4);
 const d=tau-TC4;return[Math.min(5.9,KC[0]+7*d),Math.max(BALL_R,KC[1]+1*d-4.905*d*d),KC[2]+.3*d];
}
/** the crash mat as a projected box; `dip` squashes the top around dx (landing); glow rims it yellow */
function mats(s:Sheet,c:Cam,dip:number,dx:number,glow:number){
 const[x0,x1,z0,z1]=MAT,N=8,top=(x:number,z:number):V3=>[x,MAT_H-dip*.14*Math.exp(-Math.pow((x-dx)/.9,2))*(z>z0&&z<z1?1:.6),z];
 const topPts:V3[]=[];for(let i=0;i<=N;i++)topPts.push(top(lerp(x0,x1,i/N),z0));for(let i=N;i>=0;i--)topPts.push(top(lerp(x0,x1,i/N),z1));
 const front:V3[]=[];for(let i=0;i<=N;i++)front.push(top(lerp(x0,x1,i/N),z1));front.push([x1,0,z1],[x0,0,z1]);
 const sideL:V3[]=[top(x0,z0),top(x0,z1),[x0,0,z1],[x0,0,z0]];
 const all=new Path2D(),tp=new Path2D(),sd=new Path2D();addPoly(tp,polyP(c,topPts));for(const q of[front,sideL])addPoly(sd,polyP(c,q));all.addPath(tp);all.addPath(sd);
 s.knockout(all);s.fill(B,all,.95);s.tone(K,sd,.4);s.tone(Y,tp,.12);
 const seam=new Path2D();for(const hx of[-1.2,-.4,.4,1.2]){const a=pr(c,[hx-.14,.22,z1+.01]),b=pr(c,[hx+.14,.22,z1+.01]);if(a&&b)seam.addPath(ribbon([a,b],3,{seed:10,taper:.1}));}
 s.fill(K,seam,.7);
 const edge=polyP(c,topPts);if(edge.length>2){s.fill(K,ribbon(edge,3.4,{seed:11,close:true,pressure:.3,wobble:.8}),.9);
  if(glow>0){const e=ribbon(edge,10+8*glow,{seed:12,close:true,pressure:.2,wobble:1});s.knockout(e,.9*glow);s.fill(Y,e,.95*glow);}}
}
function cam4(t:number):Cam{
 const tY=CUEW(3,'Your'),tA=CUEW(3,'A soft'),tn=CUEW(3,'next'),to=CUEW(3,'Overhead'),tm=CUEW(3,'soft mats'),tc=CUEW(3,'with a coach'),S=SECS(3);
 const tx=key(t,[[0,-1.2],[tY+.6,-1.4],[tA,-.2],[tn,0],[to,.1],[tm,.2],[tc,-1],[S,-.8]],easeInOutSine);
 const ty=key(t,[[0,1],[tA,1.25],[tn,1.55],[to,1.4],[tm,.8],[tc,1],[S,1]],easeInOutSine);
 const F=key(t,[[0,1750],[tY+.6,1900],[tA,2700],[tn,2600],[to,2500],[tm,2250],[tc,1900],[S,1800]],easeInOutSine)*LENS;
 return lookAt([tx+1.8,1.2,6.4],[tx,ty,0],F);
}
/** "next move": a blue stencil of the contact shape printed where the kid will be, so the move has a shape to fly into */
function ghost(s:Sheet,c:Cam,show:number){
 if(show<=0)return;const st=kidState(TC4);
 drawPlayer(s,st.pose,c,{shirt:[B,.32*show],shorts:[B,.2*show],socks:[B,.2*show],boots:[B,.45*show],skin:[[B,.2*show]],hair:[B,.45*show],line:B,shade:null,shadow:false,detail:'mid',lineWeight:.8,build:B_KID,hairStyle:'ponytail',seed:50},st.place);
}
/** the training pitch at dusk: a warm sky in bands, a tree line and a fence, the grass, a line of cones, a small goal behind the mat */
function pitch(s:Sheet,c:Cam){
 const all=rectPath(-1e4,-1e4,2e4,2e4);s.fill(Y,all,.55);s.tone(R,all,.3);
 const band=(y0:number,y1:number)=>polyP(c,[[-400,y0,-130],[400,y0,-130],[400,y1,-130],[-400,y1,-130]]);
 {const p=new Path2D();addPoly(p,band(22,200));s.tone(B,p,.3);const q=new Path2D();addPoly(q,band(40,200));s.tone(B,q,.3);}
 // the tree line far behind: a low navy silhouette with rounded crowns on a dark band
 const tr=new Path2D();for(let i=0;i<40;i++){const x=-110+i*5.6+hash(i,3)*3,h=6+hash(i,7)*5,q=pr(c,[x,h*.7,-120]);if(!q)continue;const k=c.F/Math.max(1,toCam(c,[x,0,-120])[2]),r=h*.42*k;tr.addPath(polyPath(blob(q[0],q[1],r*1.2,r,i,{amp:.1,n:12}),true));}
 addPoly(tr,polyP(c,[[-300,-1,-120],[300,-1,-120],[300,4.4,-120],[-300,4.4,-120]]));
 s.knockout(tr);s.fill(K,tr,.7);s.tone(B,tr,.45);
 const fence=new Path2D();for(let i=0;i<40;i++){const x=-60+i*3;seg3(c,[x,0,-24],[x,2.2,-24],.06,fence);}seg3(c,[-60,2.2,-24],[60,2.2,-24],.05,fence);seg3(c,[-60,1.1,-24],[60,1.1,-24],.04,fence);s.fill(K,fence,.45);
 const g=polyP(c,[[-150,0,-121],[150,0,-121],[150,0,14],[-150,0,14]]);if(g.length>2){const gp=polyPath(g,true);s.knockout(gp);s.fill(Y,gp,.9);s.tone(B,gp,.75);s.tone(R,gp,.12);
  const st=new Path2D();for(let k=-6;k<6;k+=2)addPoly(st,polyP(c,[[k*4,0,-60],[(k+1)*4,0,-60],[(k+1)*4,0,14],[k*4,0,14]]));s.tone(K,st,.1);
  const ln=new Path2D();seg3(c,[-60,0,-8],[60,0,-8],.08,ln);s.knockout(ln);}
 // cones
 const cn=new Path2D();for(let i=0;i<6;i++){const x=-6+i*2.4,z=-4.5,a=pr(c,[x-.14,0,z]),b=pr(c,[x+.14,0,z]),tp=pr(c,[x,.3,z]);if(a&&b&&tp)cn.addPath(polyPath([a,b,tp],true));}s.knockout(cn);s.fill(Y,cn,.95);s.fill(R,cn,.5);s.stroke(K,cn,1.6,.8);
 // the small goal behind the mat (the ball's target)
 const gl=new Path2D();for(const[a,b] of[[[6,0,-1.5],[6,1.2,-1.5]],[[6,0,1.5],[6,1.2,1.5]],[[6,1.2,-1.56],[6,1.2,1.56]]] as [V3,V3][])seg3(c,a,b,.09,gl);
 const nt=new Path2D();addPoly(nt,polyP(c,[[6,1.2,-1.5],[6,1.2,1.5],[7,0,1.5],[7,0,-1.5]]));s.tone(K,nt,.25);s.knockout(gl);s.stroke(K,gl,2,.9);
}
const ch4:Scene={
 draw(s,t){frame(s);const c=cam4(t),tp=twos(t),tau=tau4(tp),u=tau-TC4;
  const tY=CUEW(3,'Your'),tA=CUEW(3,'A soft'),tS=CUEW(3,'sets up'),tN=CUEW(3,'next'),tO=CUEW(3,'Overhead'),tP=CUEW(3,'Only'),tM=CUEW(3,'soft mats'),tC=CUEW(3,'with a coach');
  pitch(s,c);
  const land=sm(.3,.45,u)*(1-sm(.8,1.3,u)),dip=(land+settle(u,.42,{amp:.35,freq:2.5,decay:4})*(u>.42?1:0))+.5*sm(tM,tM+.25,t)*(1-sm(tM+.25,tM+.9,t));
  mats(s,c,dip,KID_X+.3,sm(tP-.1,tP+.4,t)*(1-sm(tM+1.2,tM+1.8,t)));
  ghost(s,c,sm(tN-.1,tN+.5,t)*(1-sm(-.12,.02,u)));
  // "sets up": the pop's path printed ahead of the ball, from the chest up to the laces
  const ta=sm(tS-.1,tS+.5,t)*(1-sm(tO,tO+.5,t));
  if(ta>0){const pts:Pt[]=[];for(let i=0;i<=18;i++){const q=pr(c,fly(KCH,V_KPOP,(TC4-TCH4)*i/18));if(q)pts.push(q);}dashes(s,pts,6,ta,52,9);}
  const co=coachState(tau),kd=kidState(tau),prevK=kidState(tau4(tp-1/12));
  const cr=drawPlayer(s,co.pose,c,COACH,co.place);
  const b=kidBall(tau),bq=toCam(c,b),bg=bq[2]>NEAR?scr(c,bq):null,br=bg?c.F*BALL_R/bq[2]:0;
  const kr=drawPlayer(s,kd.pose,c,KID,kd.place,{prev:prevK,smear:u>-.35&&u<.3});
  // "A soft first touch": the pillow on the kid's chest as the ball lands on it
  const pil=sm(tA-.1,tA+.4,t)*(1-sm(tS+.3,tN,t));
  if(pil>0){const e=kr.joints.chest,n=kr.joints.neck;cushion(s,lerp(e[0],n[0],.4),lerp(e[1],n[1],.4),Math.max(22,Math.hypot(n[0]-e[0],n[1]-e[1])*.95),pil,62);}
  if(bg){ball(s,bg[0],bg[1],br,tau*6);
   if(t>tY-.1&&t<tY+1)sparkBurst(s,Y,bg[0],bg[1],br*3.4,{n:8,seed:3,g:easeOutBack(sm(tY-.1,tY+.3,t))*(1-sm(tY+.6,tY+1,t)),width:br*.4});}
  // "Overhead kicks?": a spark under the push-off foot as the kid jumps
  const jk=sm(tO-.05,tO+.25,t)*(1-sm(tO+.6,tO+1,t));if(jk>0){const f=kr.joints.rToe;sparkBurst(s,Y,f[0],f[1],80,{n:8,seed:21,g:easeOutBack(jk),width:11});}
  // "with a coach": the coach's hands come together, a yellow burst over them
  const cc=sm(tC-.1,tC+.4,t)*(1-sm(tC+1.2,tC+1.8,t));if(cc>0){const h=cr.joints.rHa,l=cr.joints.lHa;sparkBurst(s,Y,(h[0]+l[0])/2,(h[1]+l[1])/2-20,110,{n:9,seed:44,g:easeOutBack(cc),width:12});}
 },
 still:5.2,
};

// ---------------------------------------------------------------- touch: a turf kick (grass bits + paper flecks) and a yellow spark
function spray(s:Sheet,x:number,y:number,age:number,seed:number,size=1){
 if(age<0||age>1)return;const r=rng(seed),a=new Path2D(),b=new Path2D(),u=easeOut(clamp(age/.7)),fl=Math.sin(Math.min(1,age/.8)*Math.PI);
 for(let i=0;i<14;i++){const ang=-Math.PI/2+(r()-.5)*2.2,d=(40+r()*170)*u*size,px=x+Math.cos(ang)*d,py=y+Math.sin(ang)*d*.5-fl*(30+r()*70)*size,z=(6+r()*9)*size;(i%3?a:b).addPath(polyPath([[px-z,py-z*.4],[px+z*.6,py-z*.6],[px+z,py+z*.3],[px-z*.4,py+z*.5]],true));}
 const fade=1-clamp((age-.6)/.4);s.knockout(b,.9*fade);s.fill(Y,a,.9*fade);s.tone(B,a,.6*fade);
}

const film:RisoStory={
 id:'rivaldo-overhead-2001',format:'11v11',title:"Rivaldo's overhead kick",theme:'A soft first touch sets up your next move; overhead kicks only on soft mats, with a coach',
 ageNote:'La Liga, Barcelona v Valencia, Camp Nou, 17 June 2001. Beginners practise overhead kicks only on soft mats with a coach.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff4c3b',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a turf kick — grass bits and paper flecks thrown up, a yellow spark. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}spray(s,x,y,age,seed,2.2);if(age<.35)sparkBurst(s,Y,x,y-20,110,{n:7,seed:seed+1,g:easeOutBack(clamp(age/.15))*(1-clamp((age-.2)/.15)),width:15});},
};
export default film;
