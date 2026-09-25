/** Paul Scholes v Barcelona — Manchester United 1–0 Barcelona, UEFA Champions League semi-final second leg, Old Trafford, Manchester,
 * 29 April 2008 (first leg 0–0 at Camp Nou; United went through 1–0 on aggregate to the Moscow final). An iconic-play riso film (RisoStory,
 * chapters mode) played by the card's picture window (components/CardFilmPlayer.tsx) or StoryFilmPlayer. A 1:1 reconstruction of the
 * 14th-minute winner from WRITTEN accounts (the footage itself was not reviewed), printed as a riso sheet.
 *
 * SOURCES (fetched Sept 2026, cached under the session scratchpad films/src-cache/):
 *  - Wikipedia, "2007–08 UEFA Champions League knockout stage" (raw): date, 20:45 CET kick-off, 1–0, Scholes 14', Old Trafford,
 *    attendance 75,061, referee Herbert Fandel (Germany)  https://en.wikipedia.org/wiki/2007%E2%80%9308_UEFA_Champions_League_knockout_stage
 *  - Wikipedia, "2007–08 Manchester United F.C. season" (raw): "an outstanding goal by Paul Scholes in the 14th minute", squad number 18,
 *    the season's home-kit template (red shirt, white shorts, black socks)  https://en.wikipedia.org/wiki/2007%E2%80%9308_Manchester_United_F.C._season
 *  - The Guardian, minute-by-minute, 29 April 2008  https://www.theguardian.com/football/2008/apr/29/minutebyminute.manchesterunited
 *    ("Cristiano Ronaldo took on and beat Yaya Toure only to be dispossessed by Gianluca Zambrotta on the edge of the Barcelona penalty
 *    area. His dismal clearance only went as far as Paul Scholes, who sent a 25 yard right footed beauty fizzing past Victor Valdes into the
 *    top right-hand corner"; "They'll be playing into the Stretford End in the second half"; "Barcelona's players are kitted out in light
 *    blue shirts, shorts and socks tonight. Manchester United are in their usual home strip of Red shirts, white shorts and white socks";
 *    both line-ups with numbers)
 *  - The Guardian, Kevin McCarra, "Flash of vintage Scholes sends United back into dreamland", 30 April 2008
 *    https://www.theguardian.com/football/2008/apr/30/championsleague.manchesterunited1 ("When Gianluca Zambrotta mis-hit a clearance in
 *    panic ... the ball ran to Scholes. The handsome finish went high past the left hand of Víctor Valdés"; 25 yards; Scholes 33)
 *  - BBC Sport, "Man Utd 1-0 Barcelona", 29 April 2008  http://news.bbc.co.uk/sport2/hi/football/europe/7368730.stm ("Gianluca Zambrotta's
 *    wayward clearance landed at Scholes' feet, and he delivered a trademark rising drive from 25 yards that flew high into the net beyond
 *    the outstretched hands of Barcelona keeper Victor Valdes"; line-ups)
 * CONFIRMED by those accounts: the date, ground, tie and score; the 14th minute; Ronaldo beat Yaya Touré, then was dispossessed by Zambrotta
 * on the edge of the Barcelona box; Zambrotta's mis-hit, panicked clearance went straight to Scholes ("landed at Scholes' feet"); Scholes
 * hit it FIRST TIME with his RIGHT foot from about 25 YARDS (≈ 22.9 m); a RISING drive, high into the TOP RIGHT-HAND corner, past Valdés's
 * LEFT hand (so Valdés stretched to his left); United attacked the Scoreboard End in the first half (Stretford End in the second); kits:
 * United red shirts and white shorts, Barcelona light blue shirts, shorts and socks; numbers: Scholes 18, Ronaldo 7, Tevez 32, Park 13,
 * Carrick 16, Zambrotta 11, Puyol 5, Milito 3, Abidal 22, Xavi 6, Yaya Touré 24, Deco 20, Valdés 1.
 * FLAGGED: the Guardian live text says United wore WHITE socks that night, while the season's home-kit template has black socks. The film
 * follows the match-night account (white) and the narration never names the socks.
 * INFERRED (illustrative): every exact position — Ronaldo cutting in from United's left, where Touré was beaten, the tackle spot, Scholes
 * about 23 m out just left of centre, arriving from deep on a jog; the shape of the clearance (drawn as a scuffed, looping ball that drops,
 * bounces once and is hit first time as it comes up — "landed at his feet"); the flight (rising all the way, ≈ .95 s, no swerve drawn);
 * the other players' spots and runs, Xavi closing Scholes down; Valdés's kit colour (drawn yellow), the referee's dark kit; Barcelona's
 * trim and number colours; Scholes's short ginger hair and 1.70 m build; the celebration (drawn wheeling away toward the main stand with
 * his arms out, teammates piling in); the TV camera positions (the high main-stand gantry, which puts the Scoreboard End on the right); the
 * spring-evening light with the floodlights on; the crowd colours and the red-and-white flags; the advertising boards.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera, near real time (Old Trafford wide → Ronaldo takes on Touré
 * → Zambrotta's stab → the clearance loops and drops → Scholes, first time → pan with the ball into the top corner); ch2 = the slow-motion
 * replay from a LOW camera behind Scholes's right shoulder (no touch, eyes on the ball, head still, body over it, laces); ch3 = a second
 * replay angle from BEHIND THE GOAL (the ball rising at the lens past Valdés's left hand) that runs on live into the celebration; ch4 = the
 * lesson: a close side-on camera on the strike (the drop, no touch, the plumb line from head to ball, contact) pulling back to the whole
 * rising path into the corner. Composed on the FULL sheet (world units = sheet units centred on the canvas; never sheet.safe), kept inside
 * the central ~1000 units so it frames from the 1.45:1 card window down to square (a narrower window widens the lens a little).
 * Figures: every body goes through ONE adapter, drawPlayer() → athlete.ts (continuous silhouettes, FK skeleton, full range of motion,
 * `prev` secondary motion, motion smear on the strike); small figures and every figure inside a passage print at `low` detail.
 * Handedness: the world is right-handed (x toward Barcelona's goal, y up, +z = Scholes's right = the main-stand side), athlete.ts's own
 * convention, so his RIGHT foot strikes without a mirrored projector and Valdés's left is +z. Inks: yellow, red, blue, navy. Everything is
 * keyed to cue times (withTiming swaps in the recorded word onsets), poses on twos, cameras on ones; all randomness seeded.
 * Budget: ~150–320 plate ops per frame, passages up to ~600 (as the approved Old Trafford free-kick film). */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,partial,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,dribble,stand,keeperSet,keeperDive,lunge,celebrate,posed,blendPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES (≈2.7 words/s + punctuation pauses) until the Kokoro voice exists. Once the lead has generated
 * public/plays/narration/scholes-barcelona-2008/timing.json, add
 *   import timingJson from '../../../public/plays/narration/scholes-barcelona-2008/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The goal, live',text:'Old Trafford, 2008. Manchester United against Barcelona, Champions League semi-final. Ronaldo is tackled... the clearance drops to Paul Scholes. First time... goal!',tail:2.4,
  cues:['Old Trafford','Manchester United','Champions League','Ronaldo','tackled','clearance drops','Paul Scholes','First time','goal']},
 {label:'Watch it again',text:'Watch again, slowly. No touch to stop it. Eyes on the ball, head still, body over it, and he strikes it with his laces.',tail:1.6,
  cues:['Watch again','No touch','Eyes on','head still','body over','strikes','laces']},
 {label:'Top corner',text:'Twenty-five yards, rising, past Victor Valdés into the top corner! One-nil: United are going to the final.',tail:1.9,
  cues:['yards','rising','Victor Valdés','top corner','United are going','final']},
 {label:'Your turn',text:"Your turn: when a clearance drops to you, don't take a touch. Body over the ball, strike it first time.",tail:2.2,
  cues:['Your turn','clearance drops','take a touch','Body over','strike it','first time']},
];
import timingJson from '../../../public/plays/narration/scholes-barcelona-2008/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('scholes: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('scholes: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
/** key() needs increasing times: push each key at least `gap` after the previous one (real voice timings can crowd authored offsets) */
function mono(K:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of K)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}

// ---------------------------------------------------------------- inks, vectors
const Y='yellow',R='red',B='blue',K='navy';
const add3=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const mix3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const wrap=(a:number)=>{while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;return a;};
const lerpAng=(a:number,b:number,u:number)=>a+wrap(b-a)*u;
/** yaw (athlete.ts convention: 0 faces +x, + turns left) that faces from (x,z) toward (x2,z2) */
const yawTo=(x:number,z:number,x2:number,z2:number)=>Math.atan2(-(z2-z),x2-x);
const RAD=Math.PI/180;
const LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
/** blend channel overrides (degrees) into a pose with weight w */
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const bump=(a:number,b:number,t:number)=>Math.sin(Math.PI*clamp((t-a)/(b-a)));
/** a narrower (square) window gets a slightly wider lens so the action still fits; set by frame(), read by every camera (also aperture()) */
let LENS=1;
/** Frame the FULL sheet: world (0,0) on the canvas centre at 1 unit per sheet unit (the passage arrival scale still multiplies in). */
function frame(s:Sheet){const S=s.arrival;s.camera((s.cx-s.W/2)/S,(s.cy-s.H/2)/S,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
/** half the visible extents with margin for the .68 passage preview */
const view=(s:Sheet)=>({hx:s.W/(2*.68)+120,hy:s.H/(2*.68)+120});

// ---------------------------------------------------------------- 3D: projection through an athlete.ts Camera (right-handed metres, y up)
/** Pitch: the goal line Barcelona defend (the Scoreboard End) is x = 0, United attack +x, goal centre z = 0, +z = the main-stand side. */
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

// ---------------------------------------------------------------- Old Trafford at dusk: red seats, a red-white-and-black crowd, roofs, floodlights
/** stand planes (a along, b up the rake 0..1): 0 the tall three-tier North Stand (z<0), 1 the Scoreboard End behind the goal (x>0),
 * 2 the South Stand (z>0, the camera side), 3 the Stretford End */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-118,14,a),1.4+29*b,-41-36*b],
 (a,b)=>[8+30*b,1.4+21*b,lerp(-56,56,a)],
 (a,b)=>[lerp(14,-118,a),1.4+15*b,41+22*b],
 (a,b)=>[-113-30*b,1.4+21*b,lerp(56,-56,a)],
];
const STAND_COLS=[100,70,100,70],STAND_ROWS=14,WALKS=[[.34,.68],[.5],[.55],[.5]];
/** red-and-white United flags and banners hung on the stand fronts: [stand, a] (inferred) */
const FLAGS:[number,number][]=[[0,.5],[0,.61],[0,.73],[0,.86],[1,.18],[1,.4],[1,.62],[1,.82],[2,.08],[2,.22],[3,.4],[3,.66]];
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 // a late-April evening: a deeper blue sky, a warm band of sunset low down (floodlights on)
 s.field(B,.3,.55);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz){s.tone(Y,polyPath([[-1e4,hz[1]-420],[1e4,hz[1]-420],[1e4,hz[1]+60],[-1e4,hz[1]+60]],true),.2);s.tone(R,polyPath([[-1e4,hz[1]-200],[1e4,hz[1]-200],[1e4,hz[1]+60],[-1e4,hz[1]+60]],true),.1);}
 const planes=new Path2D(),walk=new Path2D(),roof=new Path2D(),edge=new Path2D();
 for(const i of which){const S=STANDS[i],q=polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]);addPoly(planes,q);for(const b of WALKS[i])seg3(c,S(0,b),S(1,b),.5,walk);
  addPoly(roof,polyP(c,[add3(S(0,1),[0,2,0]),add3(S(1,1),[0,2,0]),add3(S(1,.78),[0,9.5,0]),add3(S(0,.78),[0,9.5,0])]));
  seg3(c,add3(S(0,.78),[0,9.3,0]),add3(S(1,.78),[0,9.3,0]),.35,edge);}
 s.knockout(planes);s.tone(R,planes,.55);s.tone(K,planes,.3);s.knockout(walk,.85);
 // the crowd: seeded dots (United red, white, black shown as navy), sized by distance; roar lifts them
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(WALKS[si].some(w=>Math.abs(b-w)<.045))continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,6);if(h<.3)continue;const a=(i+.5+(hash(i+j*31,9)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const ink=h<.55?1:h<.78?0:h<.96?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.7);s.fill(R,inks[1],.95);s.fill(K,inks[2],.9);s.fill(Y,inks[3],.95);
 s.knockout(roof);s.fill(K,roof,.92);s.knockout(edge,.8);
 // United flags on the stand fronts (red, a white band) — inferred
 const fl=new Path2D(),band=new Path2D();
 for(const[si,a] of FLAGS){if(!which.includes(si))continue;const S=STANDS[si],w=.03,P=(u:number,b:number)=>S(a+u*w,b);
  const q=polyP(c,[P(0,.005),P(1,.005),P(1,.075),P(0,.075)]);if(q.length<3)continue;fl.addPath(polyPath(q,true));
  addPoly(band,polyP(c,[P(0,.033),P(1,.033),P(1,.047),P(0,.047)]));}
 s.knockout(fl);s.fill(R,fl,.95);s.fill(K,fl,.18);s.knockout(band);
 // floodlights: lit lamp strips along the roof lip, with a glow
 const lamp=new Path2D(),glow=new Path2D();for(const i of which){const S=STANDS[i];for(let k=0;k<6;k++){const u=(k+.5)/6,a=add3(S(u-.03,.78),[0,8.6,0]),b=add3(S(u+.03,.78),[0,8.6,0]);if(toCam(c,a)[2]<NEAR+2)continue;seg3(c,a,b,.9,lamp);seg3(c,a,b,3.2,glow);}}
 s.tone(Y,glow,.35);s.knockout(lamp);s.fill(Y,lamp,.85);
 if(flash>0){const p=new Path2D(),n=Math.round(22*flash);for(let i=0;i<n;i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,STANDS[si](r2,.1+.8*hash(i,Math.floor(tt*12))));if(!q)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
// ---------------------------------------------------------------- grass, lines, boards, corner flags, the goal
function ground(s:Sheet,c:Cam,o:{bulge?:number}={}){
 const g=polyP(c,[[-118,0,-46],[14,0,-46],[14,0,46],[-118,0,46]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.92);s.tone(B,gp,.8);
 // mowing stripes across the width, every 5.5 m (floodlit: a touch darker)
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.5,0,-34],[-(k+1)*5.5,0,-34],[-(k+1)*5.5,0,34],[-k*5.5,0,34]]));s.tone(K,st,.14);
 // advertising boards behind the goal and along both touchlines: navy with paper panels (generic)
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([6,0,-38],[6,0,38]);board([-110,0,-38],[6,0,-38]);board([-110,0,38],[6,0,38]);
 for(let k=0;k<12;k++){const z=-36+k*6.2;addPoly(pn,polyP(c,[[5.9,.25,z],[5.9,.25,z+3.3],[5.9,.68,z+3.3],[5.9,.68,z]]));}
 for(const zz of[-37.9,37.9])for(let k=0;k<18;k++){const x=-108+k*6.4;addPoly(pn,polyP(c,[[x,.25,zz],[x+3.4,.25,zz],[x+3.4,.68,zz],[x,.68,zz]]));}
 s.knockout(bd);s.fill(K,bd,.9);s.knockout(pn,.85);s.fill(B,pn,.35);
 // painted lines
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
 for(let k=0;k<8;k++){L([-k*13.125,0,-34],[-(k+1)*13.125,0,-34]);L([-k*13.125,0,34],[-(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){L([0,0,-34+k*17],[0,0,-34+(k+1)*17]);L([-52.5,0,-34+k*17],[-52.5,0,-34+(k+1)*17]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(-52.5,0,9.15);
 L([0,0,-20.16],[-16.5,0,-20.16]);L([-16.5,0,-20.16],[-16.5,0,20.16]);L([-16.5,0,20.16],[0,0,20.16]);
 L([0,0,-9.16],[-5.5,0,-9.16]);L([-5.5,0,-9.16],[-5.5,0,9.16]);L([-5.5,0,9.16],[0,0,9.16]);
 {const a=Math.acos(5.5/9.15);circ(-11,0,9.15,Math.PI-a,Math.PI+a,12);}
 seg3(c,[-11.1,0,0],[-10.9,0,0],.22,ln);
 circ(0,-34,1,Math.PI/2,Math.PI,4);circ(0,34,1,Math.PI,Math.PI*1.5,4);
 s.knockout(ln);
 const pole=new Path2D(),flag=new Path2D();for(const z of[-34,34]){seg3(c,[0,0,z],[0,1.55,z],.05,pole);addPoly(flag,polyP(c,[[0,1.55,z],[0,1.2,z],[-.45,1.38,z]]));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(R,flag,.95);
 goal3(s,c,o.bulge??0);
}
/** the goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out at the top right-hand corner (z +3) */
function goal3(s:Sheet,c:Cam,bulge:number){
 const X=0,z0=-3.66,z1=3.66,H=2.44,bz=3,back=(z:number)=>X+2+bulge*.7*Math.exp(-Math.pow((z-bz)/1.5,2));
 const zs=[z0,-1.8,0,1.8,3,z1];
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

// ---------------------------------------------------------------- the cast: kits (athlete.ts styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.28],[B,.08]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.2]];
/** United: red shirts, white shorts, white socks (the match-night account; see FLAGGED) */
const utd=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,shorts:'paper',socks:'paper',boots:K,skin:SKIN_L,hair:K,line:K,trim:'paper',numberInk:'paper',hairStyle:'short',...o});
/** Barcelona: light blue shirts, shorts and socks (confirmed); navy numbers and trim (inferred) */
const LB:InkFill=[B,.5];
const barca=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:LB,shorts:LB,socks:LB,boots:K,skin:SKIN_M,hair:K,line:K,trim:K,numberInk:K,hairStyle:'short',...o});
const SCHOLES_B={height:1.7,bulk:1};
const SCHOLES_ST=utd({number:18,hair:[R,.8],build:SCHOLES_B,seed:18});
const VALDES_ST:AthleteStyle={shirt:[Y,.95],shorts:K,socks:[Y,.95],boots:K,skin:SKIN_M,hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',number:1,numberInk:K,build:{height:1.83},seed:1};
const REF_ST:AthleteStyle={shirt:[K,.88],shorts:[K,.88],socks:[K,.88],boots:K,skin:SKIN_L,hair:K,line:K,hairStyle:'balding',build:{height:1.84},seed:30};

// ---------------------------------------------------------------- the strike geometry (τ = seconds after Scholes's contact)
/** where the ball is met: ≈ 25 yards (22.9 m) out, just left of centre (inferred spot); the top right-hand corner (Scholes's view) */
const CX0=-22.9,CZ0=-1.2;
const GOAL_PT:V3=[0,2.12,2.95];
const YAW_S=yawTo(CX0,CZ0,GOAL_PT[0],GOAL_PT[2]);
const FWD:[number,number]=[Math.cos(YAW_S),-Math.sin(YAW_S)];
/** "body over the ball": chest and head over it, eyes down, standing knee bent — laid over the library strike through contact */
const BODY_OVER:Partial<Pose>={lean:30,pitch:9,neckP:30,lKnee:40,lHipF:24};
const SD=1.0,S_ST=-STRIKE_CONTACT*SD;
function sStrike(tau:number):Pose{const u=(tau-S_ST)/SD;return over(strike(clamp(u),{foot:'r',power:1}),BODY_OVER,bump(-.36,.26,tau));}
/** where his laces meet the ball at contact, relative to his pelvis (solved once, FK) */
const LACE=(()=>{const sk=solve(sStrike(0),SCHOLES_B,{x:0,z:0,yaw:YAW_S});return mix3(sk.rAn,sk.rToe,.62);})();
const C_BALL:V3=[CX0,clamp(LACE[1]+.02,.14,.34),CZ0];
const P0:[number,number]=[CX0-LACE[0],CZ0-LACE[2]];

// ---------------------------------------------------------------- the players: keyframed tracks [τ, X, Z]
type Role='hero'|'utd'|'bar'|'gk'|'ref';
type Actor={name:string;role:Role;st:AthleteStyle;keys:number[][];key?:boolean};
/** Zambrotta's stab that is also the clearance; the drop's bounce; the ball in the net */
const T_CLR=-2.1,T_BNC=-.3,FLY=.95,IN_NET=FLY+.12;
const S=(a:number,b:number)=>[P0[0]+a,P0[1]+b];
const SF=(k:number,side=0)=>[P0[0]+FWD[0]*k-FWD[1]*side,P0[1]+FWD[1]*k+FWD[0]*side];
/** where they all end up celebrating (in front of the main stand) */
const HUG:[number,number]=[-17.6,15.5];
const ACTORS:Actor[]=[
 {name:'Scholes',role:'hero',st:SCHOLES_ST,key:true,keys:[[-8,...S(-15,-1.6)],[-4,...S(-10,-1.2)],[-2.2,...SF(-7.4,-.5)],[-1.1,...SF(-3.9)],[-.5,...SF(-1.7)],[0,...P0],[.45,...SF(.85)],[1.25,...SF(1.7,.5)],[2.3,-19.8,2.4],[3.6,-18.9,8.2],[5.2,HUG[0],HUG[1]-1.2],[7,HUG[0]+.2,HUG[1]],[12,HUG[0]+.3,HUG[1]+.3]]},
 {name:'Ronaldo',role:'utd',st:utd({number:7,build:{height:1.86},seed:7}),key:true,keys:[[-8,-33,-22],[-5.5,-27.4,-19.6],[-3.4,-21.6,-15.2],[-2.1,-17.3,-11.2],[-1.6,-16.9,-10.8],[0,-16.2,-9.8],[1.5,-16.4,-8.4],[3.5,-17.6,3],[6,-18.3,13.9],[12,-18.4,14.2]]},
 {name:'Yaya Touré',role:'bar',st:barca({number:24,skin:SKIN_D,build:{height:1.9,bulk:1.1},seed:24}),key:true,keys:[[-8,-23.5,-12],[-4.2,-22.6,-14],[-3.4,-22.2,-15.8],[-2.4,-21.3,-14.8],[0,-19.8,-12.3],[12,-19,-10]]},
 {name:'Zambrotta',role:'bar',st:barca({number:11,build:{height:1.82},seed:11}),key:true,keys:[[-8,-13.2,-12.4],[-4,-13.8,-11.2],[-2.6,-15.4,-10.2],[-2.1,-15.9,-10.2],[-1.2,-16,-9.9],[0,-15.6,-9.2],[3,-14.5,-7.5],[12,-14,-6]]},
 {name:'Puyol',role:'bar',st:barca({number:5,hairStyle:'curly',hair:K,build:{height:1.78},seed:5}),keys:[[-8,-11.5,-3.5],[0,-12.8,-2.8],[3,-11.5,-2],[12,-10.5,-1.5]]},
 {name:'Milito',role:'bar',st:barca({number:3,build:{height:1.83},seed:3}),keys:[[-8,-10.4,3.6],[0,-12,3.2],[3,-10.8,2.8],[12,-10,2.5]]},
 {name:'Abidal',role:'bar',st:barca({number:22,skin:SKIN_D,hairStyle:'bald',build:{height:1.86},seed:22}),keys:[[-8,-12.2,12.5],[0,-13.2,9.6],[12,-12,8.6]]},
 {name:'Xavi',role:'bar',st:barca({number:6,build:{height:1.7},seed:6}),key:true,keys:[[-8,-25,3.5],[-3,-23.2,2.6],[0,-20.4,1.5],[1,-19.8,1.4],[12,-19,1.3]]},
 {name:'Deco',role:'bar',st:barca({number:20,skin:SKIN_M,build:{height:1.74},seed:20}),keys:[[-8,-28,9.5],[0,-25.2,7.2],[12,-23,6.5]]},
 {name:'Valdés',role:'gk',st:VALDES_ST,key:true,keys:[[-8,-2.2,-2.6],[-2.1,-1.8,-2.2],[-.4,-1.2,-.7],[0,-1.15,-.55],[12,-1.15,-.55]]},
 {name:'Tevez',role:'utd',st:utd({number:32,build:{height:1.73,bulk:1.06},seed:32}),keys:[[-8,-9,-7.5],[-2,-9.8,-5],[0,-10.2,-3.8],[1.4,-10,-3.4],[4,-14.5,9],[6.5,-17,15.8],[12,-17.1,16]]},
 {name:'Park',role:'utd',st:utd({number:13,skin:SKIN_M,build:{height:1.75},seed:13}),keys:[[-8,-15,18],[0,-15.8,14.6],[1.4,-16,14.6],[3.6,-16.6,15.6],[6,-16.8,16.6],[12,-16.9,16.7]]},
 {name:'Carrick',role:'utd',st:utd({number:16,build:{height:1.86},seed:16}),keys:[[-8,-40,-5],[0,-35,-3.5],[1.4,-34.5,-3],[5,-25,8],[8,-19.5,14.2],[12,-19,14.8]]},
 {name:'Fandel',role:'ref',st:REF_ST,keys:[[-8,-34,-9],[0,-29,-6.5],[12,-26,-4]]},
];
const HERO=0,RONALDO=1,TOURE=2,ZAMBROTTA=3,VALDES=ACTORS.findIndex(a=>a.role==='gk');
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const T0=-8,T1=12,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};

// ---------------------------------------------------------------- the ball: Ronaldo's dribble, the stab clearance, the loop and bounce, the drive, the net
/** Ronaldo's ball: a stride ahead of him, nudged forward on each touch */
function dribbleBall(tau:number):V3{const[x,z]=posOf(RONALDO,tau),v=velOf(RONALDO,tau),sp=Math.hypot(v[0],v[1])||1,ph=distOf(RONALDO,tau)/1.5,k=.55+.35*Math.max(0,Math.sin(TAU*ph));return[x+v[0]/sp*k,.11,z+v[1]/sp*k];}
const CLR_PT:V3=dribbleBall(T_CLR);
const DIRIN:[number,number]=(()=>{const dx=C_BALL[0]-CLR_PT[0],dz=C_BALL[2]-CLR_PT[2],l=Math.hypot(dx,dz);return[dx/l,dz/l];})();
const BNC:V3=[C_BALL[0]-DIRIN[0]*1.7,.11,C_BALL[2]-DIRIN[1]*1.7];
/** a ballistic loop from a to b over T seconds (x/z linear, y with gravity) */
function loopBall(a:V3,b:V3,u:number,T:number):V3{const g=9.8,vy=(b[1]-a[1]+.5*g*T*T)/T,tt=u*T;return[lerp(a[0],b[0],u),a[1]+vy*tt-.5*g*tt*tt,lerp(a[2],b[2],u)];}
/** the drive: fizzing, slowing a little, RISING all the way to the top right-hand corner (still climbing at the line) */
const flightE=(u:number)=>u*(1.2-.2*u);
const flight=(e:number):V3=>[lerp(C_BALL[0],GOAL_PT[0],e),C_BALL[1]+(GOAL_PT[1]-C_BALL[1])*e*(1.7-.7*e),lerp(C_BALL[2],GOAL_PT[2],e)];
const NET_HIT:V3=[1.6,1.92,3.1],REST:V3=[1.1,.11,2.5];
function ballAt(tau:number):V3{
 if(tau<T_CLR)return dribbleBall(tau);
 if(tau<T_BNC)return loopBall(CLR_PT,BNC,(tau-T_CLR)/(T_BNC-T_CLR),T_BNC-T_CLR);
 if(tau<0){const u=(tau-T_BNC)/-T_BNC;return[lerp(BNC[0],C_BALL[0],u),.11+(C_BALL[1]-.11)*u+.28*Math.sin(Math.PI*u),lerp(BNC[2],C_BALL[2],u)];}
 if(tau<FLY)return flight(flightE(tau/FLY));
 if(tau<IN_NET)return mix3(GOAL_PT,NET_HIT,easeOut((tau-FLY)/(IN_NET-FLY)));
 const u=clamp((tau-IN_NET)/.55),h=NET_HIT[1]*(1-u*u)+.11*u*u,b=u>=1?.12*Math.abs(Math.sin((tau-IN_NET-.55)*9))*Math.exp(-(tau-IN_NET-.55)*3.5):0;
 return[lerp(NET_HIT[0],REST[0],u),Math.max(.11,h)+b,lerp(NET_HIT[2],REST[2],u)];
}
const spinAt=(tau:number)=>tau<=0?TAU*3*tau:TAU*7*Math.min(tau,IN_NET)+TAU*2*Math.max(0,tau-IN_NET);
const bulgeAt=(tau:number)=>tau<IN_NET-.03?0:Math.exp(-(tau-IN_NET+.03)*2.4)*(1+.3*Math.sin((tau-IN_NET)*14));

// ---------------------------------------------------------------- poses
const READY=posed({lHipF:30,rHipF:26,lKnee:42,rKnee:38,lHipA:10,rHipA:10,lean:16,pitch:4,lShA:24,rShA:24,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
/** hands on heads (Barcelona) and arms up (United) after the goal */
const DESPAIR:Partial<Pose>={lShF:150,rShF:150,lShA:52,rShA:52,lElb:128,rElb:128,neckP:14,lean:6};
const JOY:Partial<Pose>={lShA:150,rShA:150,lShF:20,rShF:20,lElb:14,rElb:14,neckP:-20,lHand:1,rHand:1};
/** Scholes wheeling away: arms out wide, fists clenched (inferred) */
const WIDE:Partial<Pose>={lShA:92,rShA:92,lShF:8,rShF:8,lElb:30,rElb:30,neckP:-18,lean:2};
/** the whole pose of actor k at τ, with its yaw */
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(Math.min(tau,IN_NET));
 let yaw=sp>.6?yawTo(0,0,v[0],v[1]):yawTo(x,z,b[0],b[2]);
 if(a.role==='gk')yaw=yawTo(x,z,b[0],b[2]);
 if(tau>IN_NET+1.2&&sp<.6&&k!==HERO)yaw=yawTo(x,z,HUG[0],HUG[1]);
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 const idle=a.role==='gk'?keeperSet(tau*1.4+k*.1):a.role==='bar'?READY:stand();
 let p:Pose;
 if(sp>.5&&along<-.35*sp)p=blendPose(idle,runCycle(distOf(k,tau)/1.4,{speed:0}),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(distOf(k,tau)/(2.6+1.2*s),{speed:s}),clamp((sp-.5)/.9));}
 if(k===RONALDO&&tau<T_CLR+.1)p=blendPose(p,dribble(distOf(k,tau)/1.5,{foot:'r',speed:.7}),clamp((sp-.5)/.8));
 if(k===RONALDO&&tau>T_CLR-.1&&tau<T_CLR+1.4)p=over(p,{lean:-6,pitch:-6,lShA:48,rShA:48,neckP:-10},bump(T_CLR-.1,T_CLR+1.4,tau)*.8);
 if(k===TOURE&&tau>-4&&tau<-2)p=over(p,{lean:26,lHipF:44,lKnee:62,rKnee:46,bend:-14,lShA:40,rShA:36},bump(-4,-2,tau));
 if(k===ZAMBROTTA){const u=(tau-(T_CLR-.6*.8))/.8;if(u>0&&u<1.3){const w=Math.min(sm(0,.15,u),1-sm(1,1.3,u));p=blendPose(p,lunge(Math.min(1,u),{side:'r'}),w);yaw=lerpAng(yaw,yawTo(x,z,CLR_PT[0],CLR_PT[2]),w);}}
 if(k===VALDES){const at=.86,dur=.95,u=(tau-(at-.55*dur))/dur;if(u>0){p=blendPose(p,keeperDive(Math.min(1,u),{side:'l',height:.95}),sm(0,.1,u));yaw=Math.PI+.12;}}
 if(k===HERO){
  // eyes on the dropping ball as it loops over
  if(tau<-.2)p=over(p,{neckP:-18},bump(T_CLR,-.2,tau)*.8);
  const u=(tau-S_ST)/SD,w=Math.min(sm(-.1,.1,u),1-sm(1,1.35,u));
  if(w>0){p=blendPose(p,sStrike(tau),w);yaw=lerpAng(yaw,YAW_S,sm(-.3,.05,u));}
  if(tau>IN_NET+.3){const run=celebrate(distOf(k,tau)/4,{kind:'run'});p=blendPose(p,over(run,WIDE,.8),sm(IN_NET+.3,IN_NET+.8,tau)*clamp(sp/1.5+.2));
   if(sp<1.2&&tau>4)p=blendPose(p,celebrate(tau*.9,{kind:'arms'}),sm(4,5,tau)*.9);}
 }
 if(tau>IN_NET+.25&&k!==HERO){const w=sm(IN_NET+.25,IN_NET+.8,tau);if(a.role==='utd')p=over(p,JOY,w*(sp<2?1:.4));if(a.role==='bar')p=over(p,DESPAIR,w*.85);}
 return{p,yaw};
}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the pose one drawn frame earlier (secondary
 * motion: hair/hem trail), smear = halftone echo + speed lines on fast limbs (the strike, the celebration run). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:{pose:Pose;place:Place},smear=false):DrawResult{
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
}

// ---------------------------------------------------------------- the ball print
function drawBall(s:Sheet,c:Cam,tau:number,o:{min?:number;lines?:boolean;prev?:number}={}){
 const P=ballAt(tau),q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??18,c.F*.11/q[2]);
 const sh:Pt[]=[];const rad=.16+P[1]*.05;for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*1.3,0,P[2]+Math.sin(a)*rad]);if(p)sh.push(p);}
 if(sh.length>8&&P[0]<.05)s.tone(K,polyPath(sh,true),clamp(.5-P[1]*.1,.1,.5));
 if(o.lines&&o.prev!==undefined&&tau>0&&tau<IN_NET){const a=pr(c,ballAt(o.prev));if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.8)speedLines(s,K,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:4,seed:7,len:Math.min(260,d*1.4),spread:r*.9,width:Math.max(2.5,r*.18),cov:.8});}}
 footballPanels(s,g[0],g[1],r,{rot:spinAt(tau),key:K,shadow:B,seed:5});
 return{g,r,d:q[2]};
}
/** the flown path from τa to τb as projected points */
function pathPts(c:Cam,ta:number,tb:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<=n;i++){const p=pr(c,ballAt(lerp(ta,tb,i/n)));if(p)out.push(p);}return out;}

// ---------------------------------------------------------------- one frame of the world through a camera
type Env={minBall?:number;lines?:boolean;prevT?:number;smear?:boolean;hero?:'high'|'mid'};
/** everything on the pitch, depth-sorted (far first): positions at τ, poses on twos at τp (τpp = the drawing before), the ball at τ.
 * Heat: small figures print at `low` detail; inside a passage every figure is capped (the outgoing scene is zoomed past the camera). */
function play(s:Sheet,c:Cam,tau:number,tp:number,tpp:number,e:Env={}):DrawResult|undefined{
 const v=view(s),items:{d:number;draw:()=>void}[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending;let heroR:DrawResult|undefined;
 ACTORS.forEach((a,k)=>{const[x,z]=posOf(k,tau),q=toCam(c,[x,.9,z]);if(q[2]<1)return;const g=scr(c,q),h=c.F*1.8/q[2];if(Math.abs(g[0])>v.hx+h||g[1]<-v.hy-h||g[1]>v.hy+h)return;
  items.push({d:q[2],draw:()=>{const{p,yaw}=poseOf(k,tp),px=h*ppu,hero=k===HERO;
   const detail:AthleteStyle['detail']=passing?(hero?'mid':'low'):px<50||(!a.key&&px<110)?'low':hero&&e.hero==='mid'&&px>170?'mid':'auto';
   const big=px>=90&&!passing,prev=big?(()=>{const q2=poseOf(k,tpp),[px2,pz2]=posOf(k,tpp);return{pose:q2.p,place:{x:px2,z:pz2,yaw:q2.yaw}};})():undefined;
   const r=drawPlayer(s,p,c,{...a.st,detail},{x,z,yaw},prev,!!e.smear&&hero&&big&&((tp>-.4&&tp<.4)||(tp>IN_NET+.5&&tp<4)));if(hero)heroR=r;}});});
 const bq=toCam(c,ballAt(tau));if(bq[2]>=NEAR)items.push({d:bq[2],draw:()=>{drawBall(s,c,tau,{min:e.minBall,lines:e.lines,prev:e.prevT});}});
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
 return heroR;
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
const at3=(k:number,tau:number,y=0):V3=>{const[x,z]=posOf(k,tau);return[x,y,z];};

// ---------------------------------------------------------------- teaching marks
/** the shot's path so far: a ribbon along the real flight from contact to τ */
function shotPath(s:Sheet,c:Cam,tau:number,w:number,o:{ink?:string;from?:number;min?:number}={}){if(w<=0||tau<=0)return;
 const{ink=Y,from=0,min=8}=o,pts=pathPts(c,from,Math.min(tau,FLY+.001),24);if(pts.length<3)return;const wd=Math.max(min,kAt(c,ballAt(Math.min(tau,FLY)))*.14);
 s.knockout(ribbon(pts,wd*1.6,{seed:61,taper:.8,pressure:.2,wobble:0}),.5*w);s.fill(ink,ribbon(pts,wd,{seed:61,taper:.8,pressure:.2,wobble:0}),.92*w);}
/** "head still / body over it": a yellow dashed plumb line from his head straight down to the ball, a ring round the ball */
function plumb(s:Sheet,c:Cam,r:DrawResult|undefined,w:number){if(!r||w<=0)return;
 const H=r.sk.head,a=pr(c,[H[0],H[1]+.14,H[2]]),b=pr(c,[H[0],0,H[2]]);if(!a||!b)return;const u=Math.max(3,c.F*.045/toCam(c,H)[2]),e:Pt=[a[0]+(b[0]-a[0])*w,a[1]+(b[1]-a[1])*w];
 s.knockout(ribbon([a,e],u*1.7,{seed:71,taper:0,wobble:.5}),.8*w);s.fill(Y,ribbon([a,e],u*.85,{seed:71,taper:0,wobble:.5,gaps:[[.2,.28],[.46,.54],[.72,.8]]}),.95*w);}
function ring(s:Sheet,c:Cam,P:V3,rad:number,w:number,ink=Y,seed=43){if(w<=0)return;const pts:Pt[]=[];for(let i=0;i<40;i++){const a=i/40*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*(.7+.3*w),0,P[2]+Math.sin(a)*rad*(.7+.3*w)]);if(p)pts.push(p);}
 if(pts.length>30){const rr=ribbon(pts,Math.max(5,kAt(c,P)*.05),{close:true,seed,taper:0,wobble:1.2});s.knockout(rr,.9*w);s.fill(ink,rr,.95*w);}}
/** a projected arrow (shaft + head) along 3D points, in one ink */
function arrow3(s:Sheet,c:Cam,pts:V3[],w:number,ink:string,cov=1){
 const q=pts.map(p=>pr(c,p)).filter((p):p is Pt=>!!p);if(q.length<2)return;
 const e=q[q.length-1],f=q[q.length-2],ang=Math.atan2(e[1]-f[1],e[0]-f[0]),ca=Math.cos(ang),sa=Math.sin(ang),hd=w*2.6;
 const shaft=q.slice(0,-1).concat([[e[0]-ca*hd*.7,e[1]-sa*hd*.7]]);
 const p=ribbon(shaft,w,{taper:.2,pressure:.2,wobble:.8});p.addPath(polyPath([[e[0]+ca*hd*.3,e[1]+sa*hd*.3],[e[0]-ca*hd-sa*hd*.62,e[1]-sa*hd+ca*hd*.62],[e[0]-ca*hd+sa*hd*.62,e[1]-sa*hd-ca*hd*.62]],true));
 s.knockout(p);s.fill(ink,p,cov);s.stroke(K,p,Math.max(2,w*.12),.85);
}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, near real time
/** the stab-clearance lands on "tackled", the strike on "First time", the net on "goal"; real time elsewhere */
const tau1=(t:number)=>{const tk=CUE(0,'tackled'),ft=CUE(0,'First time'),g=CUE(0,'goal');const s0=Math.max(-7.6,T_CLR-(tk-.1));
 return key(t,mono([[0,s0],[tk-.1,T_CLR],[ft+.05,0],[Math.max(g,ft+.6)+.05,IN_NET],[SECS(0)+1,IN_NET+SECS(0)+1-Math.max(g,ft+.6)]]),linear);};
const P1:V3=[-32,19,58];
function cam1(t:number):Cam{
 const tau=tau1(t),rp=at3(RONALDO,tau,1),sp=at3(HERO,tau,1),g=CUE(0,'goal');
 return plan(t,[
  [0,0,()=>({P:P1,T:[-22,0,-4],fov:36})],
  [CUE(0,'Ronaldo')-.3,1,()=>({P:P1,T:add3(rp,[1.5,0,1]),fov:9})],
  [CUE(0,'tackled')-.25,.8,()=>({P:P1,T:mix3(at3(ZAMBROTTA,tau,1),sp,.35),fov:12})],
  [CUE(0,'Paul Scholes')-.3,.8,()=>({P:P1,T:mix3(sp,ballAt(Math.min(tau,0)),.4),fov:7.5})],
  [CUE(0,'First time')-.05,.8,()=>({P:P1,T:[-9,1.2,.5],fov:15})],
  [g+.25,1.8,()=>({P:P1,T:[-.6,1.5,2.4],fov:7})],
  [g+2.2,1.2,()=>({P:P1,T:add3(sp,[1,0,0]),fov:10})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tau=tau1(t),tt=twos(t),tp=tau1(tt),tpp=tau1(tt-1/12),tN=Math.max(CUE(0,'goal'),CUE(0,'First time')+.6);
  stadium(s,c,t,[0,1,3],{roar:sm(tN,tN+.4,t),flash:sm(tN,tN+.25,t)*(1-sm(tN+2.5,tN+3.5,t))});
  ground(s,c,{bulge:bulgeAt(tau)});
  play(s,c,tau,tp,tpp,{minBall:14,lines:true,prevT:tau1(t-.06),hero:'mid'});
 },
 aperture(t){const c=cam1(t),P=ballAt(Math.min(tau1(t),IN_NET+.4)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:0,
};
ch1.still=CUE(0,'goal')+.3;

// ---------------------------------------------------------------- 2 · slow-motion replay, low behind Scholes's right shoulder
const tau2=(t:number)=>key(t,mono([[0,-2.4],[CUE(1,'Watch again'),-2.2],[CUE(1,'No touch'),-1.25],[CUE(1,'Eyes on'),-.62],[CUE(1,'head still'),-.36],[CUE(1,'body over'),-.14],[CUE(1,'strikes'),0],[CUE(1,'laces'),.1],[SECS(1),.95]]),linear);
const E2:V3=[P0[0]-7.5,1.5,P0[1]+5.2];
function cam2(t:number):Cam{
 const tau=tau2(t),b=ballAt(Math.min(tau,FLY)),hp=at3(HERO,Math.min(tau,.3),.9);
 return plan(t,[
  [0,0,()=>({P:E2,T:mix3(hp,add3(CLR_PT,[0,1.5,0]),.35),fov:40})],
  [CUE(1,'No touch')-.3,.9,()=>({P:add3(E2,[2,-.3,-1]),T:mix3(hp,b,.5),fov:26})],
  [CUE(1,'head still')-.3,.8,()=>({P:add3(E2,[3.2,-.5,-1.8]),T:add3(hp,[.6,-.05,-.2]),fov:22})],
  [CUE(1,'laces')+.1,1.6,()=>({P:add3(E2,[2.4,.4,-1.4]),T:mix3(add3(C_BALL,[4,.8,1]),b,.55),fov:30})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tau=tau2(t),tt=twos(t),tp=tau2(tt),tpp=tau2(tt-1/12);
  stadium(s,c,t,[0,1],{roar:sm(.4,.9,tau)});
  ground(s,c);
  // the drop so far: a faint trail behind the looping clearance
  if(tau>T_CLR&&tau<.05){const pts=pathPts(c,Math.max(T_CLR,tau-.8),Math.min(tau,0),14);if(pts.length>2){const w=Math.max(6,kAt(c,ballAt(tau))*.1);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.55);}}
  shotPath(s,c,tau,1-sm(.9,1,tau),{min:7});
  const hr=play(s,c,tau,tp,tpp,{smear:true,minBall:12});
  const ey=sm(CUE(1,'Eyes on')-.1,CUE(1,'Eyes on')+.3,t)*(1-sm(CUE(1,'laces'),CUE(1,'laces')+.5,t));
  if(ey>.02&&hr){const h=pr(c,add3(hr.sk.head,[0,0,0])),bb=pr(c,ballAt(tau));if(h&&bb){const L=Math.hypot(bb[0]-h[0],bb[1]-h[1]),w=Math.max(4,L*.03),e:Pt=[lerp(h[0],bb[0],ey*.85),lerp(h[1],bb[1],ey*.85)];s.fill(Y,ribbon([h,e],w,{seed:19,taper:.5,wobble:.5,gaps:[[.25,.35],[.55,.65]]}),.9*ey);}}
  const hs=sm(CUE(1,'head still')-.1,CUE(1,'head still')+.3,t)*(1-sm(CUE(1,'strikes'),CUE(1,'strikes')+.4,t));plumb(s,c,hr,hs);
  const ls=sm(CUE(1,'laces')-.15,CUE(1,'laces')+.25,t,easeOutBack)*(1-sm(CUE(1,'laces')+.6,CUE(1,'laces')+1,t));
  if(ls>.02){const p=pr(c,C_BALL);if(p)sparkBurst(s,Y,p[0],p[1],Math.max(50,kAt(c,C_BALL)*.4)*ls,{n:9,seed:61,width:Math.max(5,kAt(c,C_BALL)*.04)});}
 },
 aperture(t){const c=cam2(t),P=ballAt(Math.min(tau2(t),FLY)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:0,
};
ch2.still=CUE(1,'body over')+.2;

// ---------------------------------------------------------------- 3 · the second replay angle, behind the goal, running on live into the celebration
const tau3=(t:number)=>{const ga=CUE(2,'United are going');return key(t,mono([[0,-.25],[CUE(2,'yards'),-.05],[CUE(2,'rising'),.3],[CUE(2,'Victor'),.72],[CUE(2,'top corner'),IN_NET],[ga,IN_NET+2.6],[SECS(2)+1,IN_NET+2.6+SECS(2)+1-ga]]),linear);};
const E3:V3=[9,2.6,5.2];
function cam3v(t:number):Cam{
 const tau=tau3(t),b=ballAt(Math.min(tau,IN_NET)),hp=at3(HERO,tau,1.1);
 return plan(t,[
  [0,0,()=>({P:E3,T:mix3([-20,1,-1],b,.3),fov:30})],
  [CUE(2,'rising')-.2,.9,()=>({P:E3,T:mix3([-8,1.6,.6],b,.5),fov:30})],
  [CUE(2,'Victor')-.3,.7,()=>({P:add3(E3,[-.8,-.2,.2]),T:[-1.2,1.6,1.6],fov:24})],
  [CUE(2,'top corner')+.3,1.4,()=>({P:add3(E3,[-.8,.5,.2]),T:add3(hp,[2,0,-1]),fov:24})],
  [CUE(2,'United are going')-.2,1.4,()=>({P:add3(E3,[-.8,.6,.2]),T:add3(hp,[0,.2,0]),fov:17})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tau=tau3(t),tt=twos(t),tp=tau3(tt),tpp=tau3(tt-1/12),tf=CUE(2,'final');
  stadium(s,c,t,[3,2],{roar:sm(IN_NET,IN_NET+.4,tau),flash:sm(IN_NET,IN_NET+.3,tau)*.7+.3*sm(tf-.1,tf+.3,t)});
  ground(s,c,{bulge:bulgeAt(tau)});
  if(tau>.02&&tau<IN_NET+.7){const fade=1-sm(FLY+.1,IN_NET+.7,tau);shotPath(s,c,tau,fade,{from:Math.max(0,tau-.6),min:8});}
  play(s,c,tau,tp,tpp,{smear:true,minBall:12});
  // "past Valdés's left hand": a red ring flashes round the corner as it goes in
  const tc=sm(CUE(2,'top corner')-.2,CUE(2,'top corner')+.3,t,easeOutBack)*(1-sm(CUE(2,'top corner')+.9,CUE(2,'top corner')+1.4,t));
  if(tc>.02){const q=pr(c,GOAL_PT);if(q){const r=Math.max(26,kAt(c,GOAL_PT)*.5)*(.7+.3*tc),pts:Pt[]=[];for(let i=0;i<32;i++){const a=i/32*TAU;pts.push([q[0]+Math.cos(a)*r,q[1]+Math.sin(a)*r]);}s.fill(R,ribbon(pts,Math.max(5,r*.14),{close:true,seed:77,taper:0,wobble:1}),.95*tc);}}
  // "the final!": a burst of paper and yellow over the celebration (the passage material into the lesson)
  const fb=sm(tf-.05,tf+.35,t);if(fb>0){const q=pr(c,[HUG[0],4.5,HUG[1]]);if(q)sparkBurst(s,Y,q[0],q[1],110+150*fb,{n:11,seed:9,g:easeOutBack(fb),width:14});}
 },
 aperture(t){const c=cam3v(t),q=pr(c,at3(HERO,tau3(t),1.2))??[0,0];return apertureDisc(q[0],q[1],70,12);},
 still:0,
};
ch3.still=CUE(2,'top corner')+.2;

// ---------------------------------------------------------------- 4 · the lesson: the drop → no touch → body over the ball → strike first time
const tau4=(t:number)=>key(t,mono([[0,-1.5],[CUE(3,'clearance drops'),-1.1],[CUE(3,'take a touch'),-.55],[CUE(3,'Body over'),-.18],[CUE(3,'strike it'),0],[CUE(3,'first time'),.2],[SECS(3),IN_NET+.3]]),linear);
function cam4v(t:number):Cam{
 const hp=add3(C_BALL,[-FWD[0]*.5,0,-FWD[1]*.5]);
 return plan(t,[
  [0,0,()=>({P:add3(hp,[FWD[1]*4.8-FWD[0]*.6,1.1,-FWD[0]*4.8-FWD[1]*.6]),T:add3(hp,[-DIRIN[0]*2.2,.9,-DIRIN[1]*2.2]),fov:40})],
  [CUE(3,'take a touch')-.3,.9,()=>({P:add3(hp,[FWD[1]*4.2,.9,-FWD[0]*4.2]),T:add3(hp,[0,.75,0]),fov:36})],
  [CUE(3,'first time')-.1,1.5,()=>({P:[P0[0]-13,5.5,P0[1]-2.5],T:[-9,1.4,1],fov:40})],
 ]);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tau=tau4(t),tt=twos(t),tp=tau4(tt),tpp=tau4(tt-1/12);
  const tD=CUE(3,'clearance drops'),tT=CUE(3,'take a touch'),tB=CUE(3,'Body over'),tS=CUE(3,'strike it'),tF=CUE(3,'first time');
  stadium(s,c,t,[0,1]);
  ground(s,c,{bulge:bulgeAt(tau)});
  // 1 · the drop: the clearance's loop down to the bounce, a yellow dashed arc, and a ring where it lands
  const dr=sm(tD-.2,tD+.5,t)*(1-sm(tB,tB+.5,t));
  if(dr>.02){const pts=partial(pathPts(c,T_CLR+.9,0,20),clamp(dr*1.2));if(pts.length>2){const w=Math.max(6,kAt(c,BNC)*.06);s.knockout(ribbon(pts,w*1.7,{taper:.3,wobble:0}),.5*dr);s.fill(Y,ribbon(pts,w,{taper:.3,wobble:0,gaps:[[.18,.26],[.44,.52],[.7,.78]]}),.95*dr);}ring(s,c,BNC,.5,dr,Y,44);}
  // 2 · "don't take a touch": a red stop-mark (a ring struck through) beside the ball — no controlling touch, hit it as it comes
  const nt=sm(tT-.15,tT+.3,t,easeOutBack)*(1-sm(tB+.1,tB+.5,t));
  if(nt>.02){const P=add3(C_BALL,[-FWD[0]*.2-FWD[1]*1.1,1.4,-FWD[1]*.2+FWD[0]*1.1]),q=pr(c,P);if(q){const r=Math.max(22,kAt(c,P)*.25)*nt,pts:Pt[]=[];for(let i=0;i<30;i++){const a=i/30*TAU;pts.push([q[0]+Math.cos(a)*r,q[1]+Math.sin(a)*r]);}
   const p=ribbon(pts,Math.max(4,r*.18),{close:true,seed:88,taper:0,wobble:.8});p.addPath(ribbon([[q[0]-r*.7,q[1]+r*.7],[q[0]+r*.7,q[1]-r*.7]],Math.max(4,r*.18),{seed:89,taper:.1,wobble:.5}));
   s.knockout(p,.9*nt);s.fill(R,p,.95*nt);
   // a little "touch" foot-stop glyph inside: the ball under a sole bar
   footballPanels(s,q[0],q[1]+r*.12,r*.32,{rot:0,key:K,shadow:B,seed:5});}}
  const sp=sm(tF-.2,tF+.5,t);if(sp>.02)shotPath(s,c,tau,sp,{min:9,ink:R});
  const hr=play(s,c,tau,tp,tpp,{smear:true,minBall:14});
  // 3 · body over the ball: the plumb line from his head down to the ball, a ring round it
  const bo=sm(tB-.2,tB+.3,t,easeOutBack)*(1-sm(tF,tF+.5,t));plumb(s,c,hr,bo);ring(s,c,C_BALL,.42,bo,Y,45);
  // 4 · strike it first time: the laces light up at contact, a red arrow toward the top corner
  const st=sm(tS-.1,tS+.3,t,easeOutBack)*(1-sm(tF+.3,tF+.8,t));
  if(st>.02){const p=pr(c,C_BALL);if(p)sparkBurst(s,Y,p[0],p[1],Math.max(60,kAt(c,C_BALL)*.4)*st,{n:9,seed:62,width:Math.max(6,kAt(c,C_BALL)*.04)});}
  const ar=sm(tF+.2,tF+.8,t,easeOutBack);
  if(ar>.02){const a=flight(.35),b=flight(.95);arrow3(s,c,[add3(a,[0,.9,0]),mix3(add3(a,[0,.9,0]),add3(b,[0,.7,0]),.5*ar),mix3(add3(a,[0,.9,0]),add3(b,[0,.7,0]),ar)],Math.max(9,kAt(c,a)*.2),R,.95);}
 },
 still:0,
};
ch4.still=CUE(3,'Body over')+.25;

const film:RisoStory={
 id:'scholes-barcelona-2008',format:'11v11',title:"Scholes's rocket v Barcelona",
 theme:'Long shots: when a clearance drops to you, strike it first time with your body over the ball',
 ageNote:'Manchester United 1–0 Barcelona, Champions League semi-final second leg, Old Trafford, Manchester, 29 April 2008. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a little rocket — a yellow path rising steeply into a corner, with a spinning ball on its tip. Reduced motion: the still path. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.45)),fade=age<=0?1:1-clamp((age-.5)/.25),r=rng(seed);
  const pts:Pt[]=[];for(let i=0;i<=16;i++){const k=i/16*u;pts.push([x+110*k,y-280*k*(1.3-.3*k)]);}
  if(pts.length>2)s.fill(Y,ribbon(pts,14,{seed,taper:.8,pressure:.3,wobble:1}),.95*fade);
  const e=pts[pts.length-1];if(age>0&&age<.3)sparkBurst(s,Y,x,y,90,{n:8,seed,g:1-clamp(age/.3),width:10});
  footballPanels(s,e[0],e[1],34,{rot:age*20+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
