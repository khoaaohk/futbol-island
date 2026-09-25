/** Salma Paralluelo's extra-time winner — Spain 2–1 Netherlands (a.e.t.), 2023 FIFA Women's World Cup quarter-final, Wellington Regional
 * Stadium (Sky Stadium), Wellington, Friday 11 August 2023, 13:00 local (goal timed at 110:34, "111'"). An iconic-play riso film
 * (RisoStory, chapters mode) played by the card's picture window (CardFilmPlayer) or StoryFilmPlayer. A 1:1 reconstruction of the goal
 * from WRITTEN accounts (the footage itself was not reviewed), rendered as a riso print.
 *
 * SOURCES (read Sept 2026; page text fetched with curl, cached in the film scratchpad src-cache/):
 *  - Wikipedia, "2023 FIFA Women's World Cup knockout stage" (Spain vs Netherlands: date, 13:00 UTC+12 kick-off, 2–1 a.e.t., Caldentey 81'
 *    pen, Van der Gragt 90+1', Paralluelo 111', Wellington Regional Stadium, 32,021, referee Stéphanie Frappart, line-ups, numbers and
 *    substitutions, player of the match Paralluelo, and the kit templates worn that day)
 *    https://en.wikipedia.org/wiki/2023_FIFA_Women%27s_World_Cup_knockout_stage
 *  - FIFA Training Centre post-match report 134405 (PDF): attempt list "110' 18 PARALLUELO Salma — On Target – Goal — Left Foot — Pass"
 *    https://www.fifatrainingcentre.com/media/native/tournaments/womens-world-cup/2023/report_134405.pdf
 *  - The Guardian, Jonathan Liew, "Spain secure spot in World Cup semi-finals with extra-time win over Netherlands", 11 Aug 2023
 *    https://www.theguardian.com/football/2023/aug/11/spain-secure-spot-in-world-cup-semi-finals-with-extra-time-win-over-netherlands
 *  - The Guardian live blog (Beau Dure), "Spain 2-1 Netherlands (aet): Women's World Cup 2023 quarter-final – as it happened"
 *    https://www.theguardian.com/football/live/2023/aug/10/spain-v-netherlands-womens-world-cup-2023-quarter-final-live
 *  - BBC Sport, "Women's World Cup 2023: 'Great day' as Spain reach first semi-final despite off-field issues", 11 Aug 2023 (timed 110:34)
 *    https://www.bbc.com/sport/football/66470730
 *  - Sky Sports match report 460884 (context: Vilda — "Salma with her speed"); Wikipedia "Salma Paralluelo" (1.74 m; former 400 m sprinter)
 * CONFIRMED by those accounts: extra time, 1–1; Beerensteyn had just hooked a bouncing ball over the bar (110') "and Beerensteyn was still
 * holding her head a few seconds later when Hermoso held the ball up and played a perfect through ball into the path of Paralluelo"
 * (Guardian); "Paralluelo ... races down the left inside channel on a counter. She doesn't have a great angle. It doesn't matter. She
 * confidently fires it to the far post, and it caroms into the net" (live blog); "Paralluelo's shot was left-footed ... hitting the net a
 * couple of inches above the ground", "crashing the winning goal past the luckless Daphne van Domselaar", "her yellow-soled boots", "a few
 * long white clouds sat in a brilliant blue sky" (Guardian); LEFT FOOT from a pass (FIFA report); she came on in the 71st minute; 19 years
 * old. Numbers on the pitch at 110': Spain — Paralluelo 18, Hermoso 10, Abelleira 3, Putellas 11, Navarro 15; Netherlands — Van Domselaar
 * 1, Janssen 20, Nouwen 4, Dijkstra 15. KITS (the match's Wikipedia kit templates): Spain ALL RED (red shirts, red shorts, red socks —
 * not the navy shorts of the final); the Netherlands in their very dark (near-black navy, #171728) change kit.
 * INFERRED (illustrative): every exact position, run and timing in metres and seconds; the "turn" (from the brief: she spins off her marker
 * as Hermoso holds it up — not described in the written sources); Abelleira's ball into Hermoso; Hermoso's passing foot (right); which
 * Dutch defender was beaten (shown as No. 4, not named); the strike ≈9 m out, ≈10.5 m left of centre; the shot going in off the INSIDE of
 * the far post ("caroms", read as off the post; not narrated as a fact beyond "far post"); Van Domselaar covering her near post and diving
 * late; her keeper kit colour (yellow here) and the Dutch trim/numbers (orange printed in red); Paralluelo's hair (dark curls tied back —
 * from memory of photographs, not a text source) and her boots printed all yellow for the yellow soles; the other players and their runs;
 * which side the main-stand camera films from (here the side of Spain's left, so her run is on the near side); the celebration run; the
 * crowd colours; the camera positions. The Cake Tin is an oval cricket ground, so the stands sit well back from the pitch (general
 * knowledge of the venue, not from the fetched pages).
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in REAL TIME, panning with the ball: Hermoso holds it up →
 * the through ball → Paralluelo turns and races into the box → the low left-footed shot → the far post → the net → the celebration; ch2 =
 * slow-motion replay from a LOW tracking touchline camera beside her: she spins away from her marker and sprints; a red arrow on the grass
 * measures the gap growing behind her, a yellow trail marks the run; ch3 = the second replay angle from BEHIND THE GOAL at the far post: the
 * tight angle (red lines from the ball to the posts), the shot skims low and across Van Domselaar into the far post (a yellow trail, a
 * spark off the post), then live again for "in off the far post!"; ch4 = the lesson: use your speed to create space → keep the shot low and
 * across the keeper. Composed on the FULL sheet (world units = sheet units centred on the canvas; never sheet.safe), framing from the 1.45:1
 * card window down to square. Figures: every body goes through ONE adapter, drawPlayer() → athlete.ts (continuous silhouettes, FK
 * skeleton, `prev` secondary motion so the ponytails swing, motionSmear on the sprint and the strike); women's builds (1.64–1.80 m, slimmer
 * bulk) with ponytails; small wide-shot figures and every figure inside a passage print at `low` detail. Handedness: the world is
 * right-handed (x toward the goal the Netherlands defend, y up, +z = the attackers' right), athlete.ts's own convention, so Paralluelo's
 * LEFT foot is the left foot. A bright winter afternoon. Inks: yellow, red, blue, navy. Everything is keyed to cue times (withTiming swaps
 * in the recorded word onsets), poses on twos, cameras on ones; all randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,stand,keeperSet,keeperDive,backpedal,celebrate,posed,blendPose,mirrorPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES (≈2.7 words/s + punctuation pauses) until the Kokoro voice exists. LEAD: once scripts/plays/kokoro-narrate.py
 * has written public/plays/narration/paralluelo-netherlands-2023/timing.json, add
 *   import timingJson from '../../../public/plays/narration/paralluelo-netherlands-2023/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The winner, live',text:'Wellington, a World Cup quarter-final, deep in extra time. Spain and the Netherlands are level. Jenni Hermoso holds the ball up and slides it through. Salma Paralluelo turns and races into the box, and shoots. Goal!',tail:2.4,
  cues:['Wellington','Spain and','Jenni Hermoso','slides it','Salma Paralluelo','turns','races','shoots','Goal']},
 {label:'Speed makes space',text:'Watch again. She spins away from her defender and sprints. Every stride makes the gap bigger.',tail:1.2,
  cues:['Watch again','spins away','sprints','Every stride','gap bigger']},
 {label:'Low and across',text:'The angle is tight, so she keeps it low and across the keeper... in off the far post!',tail:1.8,
  cues:['The angle','keeps it low','across the keeper','far post']},
 {label:'The secret',text:'The secret? Use your speed to create space. Then keep your shot low, and across the keeper.',tail:1.8,
  cues:['The secret','Use your speed','create space','keep your shot low','across the keeper']},
];
import timingJson from '../../../public/plays/narration/paralluelo-netherlands-2023/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (calibrated on the approved films' Kokoro timings, ≈ .32 s a word): .2 s + .02 s a letter, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.2+.02*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.2;if(/[.!?]$/.test(w))t+=.36;if(/\.\.\.$/.test(w))t+=.3;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('paralluelo: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('paralluelo: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
/** key() needs increasing times: push each key at least `gap` after the previous one (real voice timings can crowd authored offsets) */
function mono(K:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of K)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}

// ---------------------------------------------------------------- inks, vectors
const Y='yellow',R='red',B='blue',K='navy';
const add3=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const mix3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const DEG=Math.PI/180;
const wrap=(a:number)=>{while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;return a;};
const lerpAng=(a:number,b:number,u:number)=>a+wrap(b-a)*u;
/** yaw (athlete.ts convention: 0 faces +x, + turns left) that faces from (x,z) toward (x2,z2) */
const yawTo=(x:number,z:number,x2:number,z2:number)=>Math.atan2(-(z2-z),x2-x);
let LENS=1;
/** Frame the FULL sheet: world (0,0) on the canvas centre at 1 unit per sheet unit (the passage arrival scale still multiplies in). */
function frame(s:Sheet){const S=s.arrival;s.camera((s.cx-s.W/2)/S,(s.cy-s.H/2)/S,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
const view=(s:Sheet)=>({hx:s.W/(2*.68)+120,hy:s.H/(2*.68)+120});

// ---------------------------------------------------------------- 3D: projection through an athlete.ts Camera (right-handed metres, y up)
/** Pitch: the goal line the Netherlands defend is x = 0 (Spain attack +x), goal centre z = 0, +z = the attackers' right. */
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
function seg3(c:Cam,a:V3,b:V3,wm:number,out:Path2D,minW=1.1){let qa=toCam(c,a),qb=toCam(c,b);if(qa[2]<NEAR&&qb[2]<NEAR)return;
 const cut=(p:V3,q:V3):V3=>{const k=(NEAR-p[2])/(q[2]-p[2]);return[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k,NEAR];};if(qa[2]<NEAR)qa=cut(qa,qb);else if(qb[2]<NEAR)qb=cut(qb,qa);
 const A=scr(c,qa),Bp=scr(c,qb),wa=Math.max(minW,c.F*wm/qa[2]/2),wb=Math.max(minW,c.F*wm/qb[2]/2),dx=Bp[0]-A[0],dy=Bp[1]-A[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 out.moveTo(A[0]+nx*wa,A[1]+ny*wa);out.lineTo(Bp[0]+nx*wb,Bp[1]+ny*wb);out.lineTo(Bp[0]-nx*wb,Bp[1]-ny*wb);out.lineTo(A[0]-nx*wa,A[1]-ny*wa);out.closePath();}
const cam3=(pos:V3,target:V3,fov:number)=>makeCamera({pos,target,fov,size:1080*LENS});

// ---------------------------------------------------------------- the Cake Tin: an oval bowl set well back from the pitch, a roof ring, a blue sky with long white clouds
/** the oval: centre on the halfway line; a = along the stand's arc 0..1, b = up the rake 0..1 */
const OX=-52.5,AX=74,AZ=54;
const oval=(th:number,b:number):V3=>[OX+(AX+24*b)*Math.cos(th),1.3+21*b,(AZ+24*b)*Math.sin(th)];
/** four arcs: 0 the far side (+z), 1 behind the goal Spain attack (+x), 2 the camera side (−z), 3 the other end */
const ARCS:[number,number][]=[[42,138],[-42,42],[-138,-42],[138,222]];
const STANDS:((a:number,b:number)=>V3)[]=ARCS.map(([a0,a1])=>(a:number,b:number)=>oval(lerp(a0,a1,a)*DEG,b));
const STAND_COLS=[110,84,110,84],STAND_ROWS=14,WALKS=[.46],NSEG=9;
/** banners on the stand fronts: [stand, a, kind 0 = Spain (red | yellow | red), 1 = Netherlands orange] */
const FLAGS:[number,number,number][]=[[0,.3,0],[0,.46,1],[0,.6,0],[0,.74,1],[1,.3,0],[1,.55,1],[1,.75,0],[3,.35,1],[3,.62,0],[2,.4,0],[2,.6,1]];
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 // a bright winter afternoon: a blue sky screen, deeper up high, long white clouds knocked out of it
 s.field(B,.34,.55);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz){const Bd=4000;s.tone(B,polyPath([[-Bd,-Bd],[Bd,-Bd],[Bd,hz[1]-640],[-Bd,hz[1]-560]],true),.3);
  const cl=new Path2D(),r=rng(2023);for(let i=0;i<6;i++){const x=(r()-.5)*2600,y=hz[1]-380-r()*560,w=380+r()*520;
   cl.addPath(polyPath(Array.from({length:18},(_,k)=>{const a=k/18*TAU;return[x+Math.cos(a)*w,y+Math.sin(a)*w*.07*(1+.4*Math.sin(a*3+i))] as Pt;}),true));}s.knockout(cl,.75);}
 const planes=new Path2D(),walk=new Path2D(),roof=new Path2D(),edge=new Path2D();
 for(const i of which){const S=STANDS[i];for(let k=0;k<NSEG;k++){const a0=k/NSEG,a1=(k+1)/NSEG;addPoly(planes,polyP(c,[S(a0,0),S(a1,0),S(a1,1),S(a0,1)]));
  for(const b of WALKS)seg3(c,S(a0,b),S(a1,b),.6,walk);
  addPoly(roof,polyP(c,[add3(S(a0,1),[0,1.5,0]),add3(S(a1,1),[0,1.5,0]),add3(S(a1,.8),[0,9,0]),add3(S(a0,.8),[0,9,0])]));
  seg3(c,add3(S(a0,.8),[0,8.8,0]),add3(S(a1,.8),[0,8.8,0]),.5,edge);}}
 s.knockout(planes);s.tone(B,planes,.42);s.tone(K,planes,.22);s.knockout(walk,.5);
 // the crowd: Spain red, Dutch orange (yellow under red), yellow, navy and white; the roar lifts them
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(WALKS.some(w=>Math.abs(b-w)<.045))continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,9);if(h<.3)continue;const a=(i+.5+(hash(i+j*31,8)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const ink=h<.6?0:h<.75?1:h<.84?2:h<.93?3:4;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.8);s.fill(R,inks[0],.92);s.knockout(inks[1],.8);s.fill(Y,inks[1],.95);s.tone(R,inks[1],.55);s.fill(Y,inks[2],.95);s.fill(K,inks[3],.85);s.knockout(inks[4],.8);
 // the roof ring: a pale canopy (paper with a light screen) and a navy lip
 s.knockout(roof);s.tone(B,roof,.16);s.fill(K,edge,.9);
 // banners: Spain red-yellow-red; Netherlands orange
 const red=new Path2D(),yel=new Path2D(),org=new Path2D();
 for(const[si,a,kind] of FLAGS){if(!which.includes(si))continue;const S=STANDS[si],w=.035,P=(u:number,b:number)=>S(a+u*w,b);
  const q=polyP(c,[P(0,.005),P(1,.005),P(1,.07),P(0,.07)]);if(q.length<3)continue;
  if(kind===0){red.addPath(polyPath(q,true));addPoly(yel,polyP(c,[P(0,.022),P(1,.022),P(1,.053),P(0,.053)]));}else org.addPath(polyPath(q,true));}
 s.knockout(red);s.knockout(org);s.fill(R,red,.95);s.fill(Y,yel,.95);s.fill(Y,org,.95);s.tone(R,org,.6);
 if(flash>0){const p=new Path2D(),n=Math.round(20*flash);for(let i=0;i<n;i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,STANDS[si](r2,.1+.8*hash(i,Math.floor(tt*12))));if(!q)continue;
  const z=8+11*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.6);}
}
// ---------------------------------------------------------------- grass in the sun (the whole oval), lines, boards, corner flags, the goal
function ground(s:Sheet,c:Cam,o:{bulge?:number}={}){
 const rim:V3[]=[];for(let i=0;i<40;i++){const th=i/40*TAU;rim.push([OX+(AX+.5)*Math.cos(th),0,(AZ+.5)*Math.sin(th)]);}
 const g=polyP(c,rim);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.92);s.tone(B,gp,.62);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]));s.tone(K,st,.12);
 // advertising boards: navy with yellow panels
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([6,0,-38],[6,0,38]);board([-111,0,-38],[6,0,-38]);board([-111,0,38],[6,0,38]);
 for(let k=0;k<12;k++){const z=-36+k*6.2;addPoly(pn,polyP(c,[[5.9,.25,z],[5.9,.25,z+3.3],[5.9,.68,z+3.3],[5.9,.68,z]]));}
 for(const zz of[-37.9,37.9])for(let k=0;k<18;k++){const x=-108+k*6.4;addPoly(pn,polyP(c,[[x,.25,zz],[x+3.4,.25,zz],[x+3.4,.68,zz],[x,.68,zz]]));}
 s.knockout(bd);s.fill(K,bd,.9);s.knockout(pn,.85);s.fill(Y,pn,.9);
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
 s.fill(K,pole,.9);s.knockout(flag);s.fill(Y,flag,.95);
 goal3(s,c,o.bulge??0);
}
/** the goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out LOW at the far post side where the ball went in (z ≈ 2.6) */
function goal3(s:Sheet,c:Cam,bulge:number){
 const X=0,z0=-3.66,z1=3.66,H=2.44,bz=2.5,back=(z:number,y:number)=>X+2+bulge*.7*Math.exp(-Math.pow((z-bz)/1.4,2))*(1-y/2.6);
 const zs=[z0,-1.8,0,1.6,2.8,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0,1.9),1.9,z0],[back(z0,0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1,1.9),1.9,z1],[back(z1,0),0,z1]],
  [[X,H,z0],[X,H,z1],...zs.slice().reverse().map(z=>[back(z,1.9),1.9,z] as V3)],
  [...zs.map(z=>[back(z,0),0,z] as V3),...zs.slice().reverse().map(z=>[back(z,1.9),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.3);s.tone(K,net,.12);
 const mesh=new Path2D();
 for(let i=0;i<=14;i++){const z=lerp(z0,z1,i/14);seg3(c,[X,H,z],[back(z,1.9),1.9,z],.022,mesh,.7);seg3(c,[back(z,1.9),1.9,z],[back(z,0),0,z],.022,mesh,.7);}
 for(let j=0;j<=5;j++){const y=1.9*j/6;for(let i=0;i<zs.length-1;i++)seg3(c,[back(zs[i],y),y,zs[i]],[back(zs[i+1],y),y,zs[i+1]],.022,mesh,.7);if(j>0){seg3(c,[X,y*H/1.9,z0],[back(z0,y),y,z0],.022,mesh,.7);seg3(c,[X,y*H/1.9,z1],[back(z1,y),y,z1],.022,mesh,.7);}}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+2*u,H-.54*u,z0],[X+2*u,H-.54*u,z1],.022,mesh,.7);}
 s.knockout(mesh,.8);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.2,fo);seg3(c,[X,0,z1],[X,H,z1],.2,fo);seg3(c,[X,H,z0-.04],[X,H,z1+.04],.2,fo);
 s.fill(K,fo,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- the cast: kits (athlete.ts styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.28],[B,.08]],SKIN_D:InkFill[]=[[Y,.46],[R,.36],[K,.2]];
/** women's footballers: a lighter frame than the default 1.8 m build, just as athletic */
const W_BUILD=(height:number,bulk=.9)=>({height,bulk,head:.97});
/** Spain all in red that day (red shirts, shorts and socks), yellow numbers */
const esp=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,shorts:R,socks:R,boots:K,skin:SKIN_L,hair:K,line:K,trim:Y,numberInk:Y,hairStyle:'ponytail',build:W_BUILD(1.68),...o});
/** the Netherlands' near-black change kit (a heavy navy screen so the solid key line still reads), orange trim and numbers (red) */
const ned=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[K,.8],shorts:[K,.8],socks:[K,.8],boots:K,skin:SKIN_L,hair:[Y,.85],line:K,trim:R,numberInk:R,hairStyle:'ponytail',build:W_BUILD(1.7),shade:[K,.26],...o});
const SALMA_B=W_BUILD(1.74,.95);
/** Salma Paralluelo, No. 18: dark curls tied back, yellow(-soled) boots */
const SALMA_ST=esp({number:18,skin:SKIN_D,hair:K,boots:Y,build:SALMA_B,seed:18});
const MARKER_B=W_BUILD(1.73,.97);
const MARKER_ST=ned({number:4,hair:[Y,.8],build:MARKER_B,seed:4});
const VDOM_ST:AthleteStyle={shirt:Y,shorts:K,socks:Y,boots:K,skin:SKIN_L,hair:[Y,.9],line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'ponytail',number:1,numberInk:K,build:W_BUILD(1.73,.95),seed:1};

// ---------------------------------------------------------------- the play on one clock τ (seconds; τ = 0 is Paralluelo's strike)
/** the strike: ≈9 m out in the left inside channel (a tight angle); low to the inside of the far post (inferred), then in */
const S_BALL:V3=[-9,.11,-10.4];
const POST_PT:V3=[-.08,.13,3.44];
/** the approach for a LEFT-footed strike: the run comes in a little to the right of the line of the shot */
const KDIR:[number,number]=(()=>{const a=Math.atan2(POST_PT[2]-S_BALL[2],POST_PT[0]-S_BALL[0])-.42;return[Math.cos(a),Math.sin(a)];})();
const YAW_K=yawTo(0,0,KDIR[0],KDIR[1]);
const KSD=.8;
/** her pelvis at contact so her LEFT boot meets the ball (solved once through the skeleton) */
const PK:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'l'}),SALMA_B,{x:0,z:0,yaw:YAW_K});const tx=S_BALL[0]-KDIR[0]*.1,tz=S_BALL[2]-KDIR[1]*.1;return[tx-sk.lToe[0],tz-sk.lToe[2]];})();
/** Abelleira's ball into Hermoso; Hermoso holds it up; the through ball; Paralluelo's first touch */
const T_A=-10.4,T_HR=-9.2,T_PASS=-6.1,T_RCV=-4.2;
/** the turn: she spins off her marker as Hermoso holds it up */
const T_TURN0=-6.75,T_TURN1=-6.15;
/** the shot: skims ≈16.6 m along the grass, a couple of inches up, into the inside of the far post, then into the net */
const T_POST=.62,NET_HIT:V3=[1.55,.16,2.45],T_NET=T_POST+.2,REST:V3=[1.3,.11,2.2];
const shotAt=(u:number):V3=>{const p=mix3(S_BALL,POST_PT,u);p[1]=.11+.06*Math.sin(Math.PI*u);return p;};

// ---------------------------------------------------------------- movement: time-keyed paths (C¹ Hermite) with a cumulative-distance table for the stride phase
type Path=[number,number,number][];// [τ, x, z]
function pathAt(p:Path,tau:number):[number,number]{
 const n=p.length;if(tau<=p[0][0])return[p[0][1],p[0][2]];if(tau>=p[n-1][0])return[p[n-1][1],p[n-1][2]];
 let i=0;while(i<n-2&&tau>=p[i+1][0])i++;
 const a=p[i],b=p[i+1],h=b[0]-a[0],u=(tau-a[0])/h,u2=u*u,u3=u2*u;
 const tan=(j:number,k:1|2)=>{if(j<=0||j>=n-1)return 0;return(p[j+1][k]-p[j-1][k])/(p[j+1][0]-p[j-1][0]);};
 const f=(k:1|2)=>(2*u3-3*u2+1)*a[k]+(u3-2*u2+u)*h*tan(i,k)+(-2*u3+3*u2)*b[k]+(u3-u2)*h*tan(i+1,k);
 return[f(1),f(2)];
}
const T_MIN=-13,T_MAX=10,DT=.02;
function distTable(p:Path){const out:number[]=[0];let q=pathAt(p,T_MIN);for(let t=T_MIN+DT;t<=T_MAX+1e-9;t+=DT){const r=pathAt(p,t);out.push(out[out.length-1]+Math.hypot(r[0]-q[0],r[1]-q[1]));q=r;}return out;}
const distAt=(tab:number[],tau:number)=>{const f=(clamp(tau,T_MIN,T_MAX)-T_MIN)/DT,i=Math.min(tab.length-2,Math.floor(f));return lerp(tab[i],tab[i+1],f-i);};
const speedAt=(p:Path,tau:number)=>{const a=pathAt(p,tau-.06),b=pathAt(p,tau+.06);return Math.hypot(b[0]-a[0],b[1]-a[1])/.12;};
/** metres per full run cycle (two strides); a former 400 m runner's long stride */
const CYCLE_M=4.1;

// ---------------------------------------------------------------- Paralluelo: checks back toward Hermoso, spins off her marker, sprints, carries it into the box, the strike, the celebration
const SALMA_PATH:Path=[[-13,-41.4,-13.1],[-9.5,-43.4,-13.8],[-7.6,-45,-14.3],[T_TURN0,-45.5,-14.4],[T_TURN1,-45.1,-14.3],[-5.5,-42,-13.7],[-4.8,-36.6,-12.7],[T_RCV,-31.4,-11.9],
 [-3.2,-24.4,-11.4],[-2.2,-18.2,-11.2],[-1.2,-13.4,-11.2],[-.5,PK[0]-KDIR[0]*1.8,PK[1]-KDIR[1]*1.8],[0,PK[0],PK[1]],[.55,PK[0]+KDIR[0]*1.3,PK[1]+KDIR[1]*1.3],
 // the celebration: she wheels away toward the near touchline
 [1.7,-6.4,-13.2],[2.9,-5.4,-18.6],[4.3,-5,-24.6],[5.7,-5.6,-29.4],[7.3,-6.6,-32]];
const SALMA_TAB=distTable(SALMA_PATH);
const salmaXZ=(tau:number):V3=>{const p=pathAt(SALMA_PATH,tau);return[p[0],0,p[1]];};
/** the carry: a push with the LEFT foot on each touch */
const TOUCHES=[T_RCV,-3.2,-2.2,-1.2];
const TRAP=posed({rHipF:10,lHipF:40,lKnee:40,lAnk:20,rKnee:24,lean:18,pitch:3,neckP:34,lShA:30,rShA:40,lElb:40,rElb:40});
const TOUCH=mirrorPose(posed({rHipF:36,rKnee:26,rAnk:30,rHipR:14,lHipF:-10,lKnee:30,lean:16,pitch:6,neckP:26,lShA:34,rShA:22,lShF:20,rShF:-24,lElb:70,rElb:70}));
/** the spin: low, arms out for balance, weight on the right foot, head already turning to the space */
const SPIN=posed({rHipF:30,rKnee:48,lHipF:-18,lKnee:40,lHipA:18,lean:24,pitch:6,bend:-10,twist:-24,neckY:-30,lShA:70,rShA:52,lShF:-10,rShF:24,lElb:40,rElb:50});
const ARMS_OUT=posed({lShA:104,rShA:100,lShF:10,rShF:14,lElb:14,rElb:18,lHand:1,rHand:1,neckP:-28,lean:-6,pitch:-3,lHipF:14,rHipF:-2,lKnee:18,rKnee:22,lHipA:8,rHipA:8});
function touchIndex(tau:number){let k=-1;for(let i=0;i<TOUCHES.length;i++)if(tau>=TOUCHES[i])k=i;return k;}
function salmaPose(tau:number):Pose{
 const sp=speedAt(SALMA_PATH,tau);
 if(tau<T_RCV+.1){const ph=distAt(SALMA_TAB,tau)/CYCLE_M;let p=blendPose(stand(),runCycle(ph,{speed:clamp((sp-1)/6)}),sm(.5,2,sp));
  const sw=Math.sin(Math.PI*clamp((tau-T_TURN0+.1)/(T_TURN1-T_TURN0+.35)));if(sw>0)p=blendPose(p,SPIN,sw*.8);
  const w=Math.sin(Math.PI*clamp((tau-T_RCV+.3)/.5));if(w>0)p=blendPose(p,TRAP,w*.8);return p;}
 // the carry: one run cycle per touch interval, the LEFT leg reaching as it meets the ball (run phase .42)
 const k=Math.max(0,touchIndex(tau)),t0=TOUCHES[k],t1=k+1<TOUCHES.length?TOUCHES[k+1]:0,u=(tau-t0)/(t1-t0);
 let p=runCycle(k+.42+u,{speed:clamp((sp-1)/5.5),stride:1.1});
 const tw=Math.max(0,1-Math.abs(u)/.13)*(k>0?.7:0)+Math.max(0,1-Math.abs(1-u)/.13)*(k+1<TOUCHES.length?.7:0);if(tw>0)p=blendPose(p,TOUCH,tw);
 // she glances up at the goal before she shoots
 p.neckP-=22*DEG*sm(-1,-.75,tau)*(1-sm(-.45,-.25,tau));
 // the strike (LEFT foot) and its follow-through
 const us=STRIKE_CONTACT+tau/KSD;
 if(us>.05){const w=sm(.05,.2,us)*(tau<1?1:1-sm(1,1.4,tau));p=blendPose(p,strike(clamp(us,0,1),{foot:'l',power:1}),w);}
 // then the celebration run, arms out
 if(tau>.5){const s=distAt(SALMA_TAB,tau);let c=celebrate(s/4.2,{kind:'run'});if(tau>5.4)c=blendPose(c,ARMS_OUT,clamp(1-sp/3)*sm(5.4,6.4,tau));p=blendPose(p,c,sm(.5,1.1,tau));}
 return p;
}
function salmaPlace(tau:number):Place{
 const[x,z]=pathAt(SALMA_PATH,tau),sp=speedAt(SALMA_PATH,tau),a=pathAt(SALMA_PATH,tau+.1),b=ballAt(tau);
 let yaw:number;
 if(tau<T_TURN1+.25){// checking back toward Hermoso (facing her own goal), then the spin: a half-turn away from the marker, through her left
  const back=yawTo(x,z,-50,-3),u=easeInOutSine(clamp((tau-T_TURN0)/(T_TURN1+.25-T_TURN0)));yaw=back+u*wrap(yawTo(x,z,-30,-12)-back+TAU*(yawTo(x,z,-30,-12)-back<0?1:0));
  if(u>=1)yaw=yawTo(x,z,-30,-12);}
 else yaw=lerpAng(yawTo(x,z,b[0],b[2]),yawTo(x,z,a[0],a[1]),sm(1.2,3,sp));
 const w=sm(-.5,-.28,tau)*(1-sm(.5,.9,tau));yaw=lerpAng(yaw,YAW_K,w);
 if(tau>5.4)yaw=lerpAng(yaw,yawTo(x,z,-8,-60),clamp(1-sp/2.5)*sm(5.4,6.4,tau));
 return{x,z,yaw};
}

// ---------------------------------------------------------------- the ball
const A_BALL:V3=[-66.4,.11,3.2];
const HER_RCV:V3=[-50.4,.11,-2.3];
const HER_BALL:V3=[-49.5,.11,-3.1];
const RCV_BALL:V3=(()=>{const[x,z]=pathAt(SALMA_PATH,T_RCV);return[x+.5,.11,z+.05];})();
/** where each push leaves the ball: ahead of her boot along her run */
const PUSH:V3[]=TOUCHES.map((t,i)=>{if(i===0)return RCV_BALL;const[x,z]=pathAt(SALMA_PATH,t),a=pathAt(SALMA_PATH,t+.12),l=Math.hypot(a[0]-x,a[1]-z)||1;return[x+(a[0]-x)/l*.6,.11,z+(a[1]-z)/l*.6];});
function ballAt(tau:number):V3{
 if(tau<T_A)return mix3([-69,.11,4.4],A_BALL,clamp((tau-T_MIN)/(T_A-T_MIN)));
 if(tau<T_HR){const u=(tau-T_A)/(T_HR-T_A);return mix3(A_BALL,HER_RCV,u*(1.3-.3*u));}
 // Hermoso holds it up: the ball shuffles under her feet as she shields it
 if(tau<T_PASS){const u=(tau-T_HR)/(T_PASS-T_HR),p=mix3(HER_RCV,HER_BALL,easeInOutSine(u));p[2]+=.18*Math.sin(u*TAU*1.5);return p;}
 if(tau<T_RCV){const u=(tau-T_PASS)/(T_RCV-T_PASS);return mix3(HER_BALL,RCV_BALL,u*(1.35-.35*u));}
 if(tau<0){const k=touchIndex(tau),a=PUSH[k],b=k+1<PUSH.length?PUSH[k+1]:S_BALL,t0=TOUCHES[k],t1=k+1<TOUCHES.length?TOUCHES[k+1]:0,u=(tau-t0)/(t1-t0);return mix3(a,b,u*(1.45-.45*u));}
 if(tau<T_POST)return shotAt(tau/T_POST);
 if(tau<T_NET)return mix3(POST_PT,NET_HIT,easeOut((tau-T_POST)/(T_NET-T_POST)));
 const u=clamp((tau-T_NET)/.5);return[lerp(NET_HIT[0],REST[0],u),.11+.05*(1-u)*Math.abs(Math.sin(u*9)),lerp(NET_HIT[2],REST[2],u)];
}
const spinAt=(tau:number)=>tau<=0?TAU*1.3*(tau+13):TAU*1.3*13+TAU*3*Math.min(tau,T_NET)+TAU*.8*Math.max(0,tau-T_NET);
const bulgeAt=(tau:number)=>tau<T_NET-.03?0:.8*Math.exp(-(tau-T_NET+.03)*2.6)*(1+.3*Math.sin((tau-T_NET)*14));

// ---------------------------------------------------------------- everyone else
type Role='run'|'def'|'marker'|'keeper'|'passer'|'hermoso';
type Actor={name:string;role:Role;st:AthleteStyle;path:Path;phase:number;/** a pass: [contact τ, foot, power, target] */kick?:[number,'l'|'r',number,V3];esp:boolean;
 /** a defender turns from backing off to chasing at this τ */turn?:number};
const ACTORS:Actor[]=[
 {name:'Abelleira',role:'passer',esp:true,st:esp({number:3,build:W_BUILD(1.65,.9),seed:3}),path:[[-13,-68,6.2],[-11.4,-67.4,4.4],[T_A,A_BALL[0]-.6,A_BALL[2]+.25],[-8,-63.5,2.4],[-3,-55,.4],[4,-48,-1]],phase:.3,kick:[T_A,'r',.7,HER_RCV]},
 {name:'Hermoso',role:'hermoso',esp:true,st:esp({number:10,skin:SKIN_M,build:W_BUILD(1.78,1),seed:10}),path:[[-13,-53.5,-1.2],[-10.4,-51.8,-1.7],[T_HR,HER_RCV[0]-.35,HER_RCV[2]-.05],[-7.6,-50.1,-2.6],[T_PASS,HER_BALL[0]-.55,HER_BALL[2]+.2],[-4.6,-47.6,-3.4],[-1,-38,-4.2],[4,-30,-4.4]],phase:.6,kick:[T_PASS,'r',.8,RCV_BALL]},
 {name:'Groenen',role:'def',esp:false,st:ned({number:14,build:W_BUILD(1.64,.92),seed:14}),path:[[-13,-47.4,-1.9],[-9.6,-48.8,-2.1],[-7.6,-49.2,-2.5],[T_PASS,-48.7,-3.1],[-4.5,-46.8,-4.4],[-1,-40,-6],[4,-35,-7]],phase:.15,turn:-5.6},
 {name:'Nouwen',role:'marker',esp:false,st:MARKER_ST,path:[[-13,-40,-12.4],[-9.5,-42.2,-13.1],[-7.2,-43.5,-13.4],[-6.3,-43.7,-13.5],[-5.5,-42.8,-13.3],[-4.2,-37,-12.6],[-2.8,-28.5,-12],[-1.4,-20,-11.6],[0,-14.4,-11.3],[1.5,-10.6,-11.2],[4,-9,-11.6]],phase:.1,turn:-5.9},
 {name:'Janssen',role:'def',esp:false,st:ned({number:20,build:W_BUILD(1.75,.97),seed:20}),path:[[-13,-37,-3.6],[-8,-38.5,-4.4],[-5.5,-36.2,-5.2],[-3,-25.5,-6.8],[-1,-13.8,-7.2],[0,-10.2,-6.9],[2,-7.4,-5.8],[4,-6.8,-5.2]],phase:.55,turn:-5.2},
 {name:'Dijkstra',role:'def',esp:false,st:ned({number:15,build:W_BUILD(1.72,.95),seed:15}),path:[[-13,-36,5.4],[-8,-37.5,3.6],[-4,-29,1.4],[-1,-15.6,-.8],[0,-11.8,-1.4],[4,-8.4,-1.9]],phase:.8,turn:-5},
 {name:'Putellas',role:'run',esp:true,st:esp({number:11,build:W_BUILD(1.73,.95),hair:[Y,.7],seed:11}),path:[[-13,-55,7],[-8,-50,5.6],[-4,-38.4,3],[0,-20.4,.4],[3,-14,-2.4],[6,-11.6,-6]],phase:.45},
 {name:'Navarro',role:'run',esp:true,st:esp({number:15,build:W_BUILD(1.6,.9),seed:25}),path:[[-13,-50,17],[-7,-45,15.6],[-3,-32,12.6],[0,-22.6,10.2],[4,-16,7.4]],phase:.9},
 {name:'Van Domselaar',role:'keeper',esp:false,st:VDOM_ST,path:[[-13,-6.5,-.4],[-6,-5.6,-1.4],[-3,-4.3,-2.8],[-1.2,-3,-3.8],[0,-2.2,-4.2],[.5,-2,-4],[4,-1.7,-2.4]],phase:0},
];
const READY=posed({lHipF:24,rHipF:18,lKnee:34,rKnee:30,lHipA:10,rHipA:10,lean:16,pitch:3,lShA:20,rShA:20,lShF:10,rShF:14,lElb:44,rElb:40,neckP:-4});
/** Hermoso holding it up: low, wide, arms out to feel her marker, head over the ball */
const SHIELD=posed({lHipF:30,rHipF:22,lKnee:44,rKnee:40,lHipA:18,rHipA:16,lean:28,pitch:5,lShA:62,rShA:48,lShF:-24,rShF:-10,lElb:34,rElb:40,neckP:24});
const SLUMP=posed({lHipF:30,rHipF:30,lKnee:36,rKnee:36,lean:34,pitch:6,neckP:30,lShA:14,rShA:14,lShF:24,rShF:24,lElb:20,rElb:20});
const TABS=new Map<Path,number[]>();
function distTableCached(p:Path){let t=TABS.get(p);if(!t){t=distTable(p);TABS.set(p,t);}return t;}
/** one actor's pose + place at τ (it = idle clock). Spain celebrate after the goal; the Dutch heads drop. */
function actorAt(a:Actor,tau:number,it:number):{pose:Pose;place:Place}{
 const[x,z]=pathAt(a.path,tau),sp=speedAt(a.path,tau),ahead=pathAt(a.path,tau+.1),ball=ballAt(tau);
 const toBall=yawTo(x,z,ball[0],ball[2]),heading=yawTo(x,z,ahead[0],ahead[1]);let yaw=lerpAng(toBall,heading,sm(1.2,3,sp));
 const ph=distAt(distTableCached(a.path),tau)/CYCLE_M+a.phase,br=Math.sin(it*2.1+a.phase*TAU);
 let p=blendPose(blendPose(READY,stand(),.35+.15*br),runCycle(ph,{speed:clamp((sp-1)/5.5)}),sm(.5,2,sp));
 if(a.role==='keeper'){
  // Van Domselaar has come off her line to cover the near post; the low shot goes across her — a late dive to her left
  let kp=blendPose(keeperSet(it*1.3),backpedal(ph*1.6),sm(.3,1,sp)*.5);
  kp=blendPose(kp,runCycle(ph,{speed:.3}),sm(1,2.2,sp));
  if(tau>.08){const u=clamp((tau-.08)/1.2);kp=blendPose(kp,keeperDive(u*.8,{side:'l',height:.12}),sm(.08,.22,tau)*(1-sm(2.6,3.2,tau)));}
  if(tau>2.6)kp=blendPose(kp,SLUMP,sm(2.6,3.2,tau)*.6);
  return{pose:kp,place:{x,z,yaw:tau<.1?toBall:lerpAng(toBall,yawTo(x,z,-9,-10.4),sm(.1,.3,tau))}};
 }
 if(a.role==='hermoso'&&tau<T_PASS+.4){
  // back to goal, facing Abelleira; she holds off Groenen, then opens up and slides it through
  const w=sm(T_HR-.3,T_HR+.2,tau)*(1-sm(T_PASS-.7,T_PASS-.35,tau));p=blendPose(p,SHIELD,w*.9);
  yaw=lerpAng(yawTo(x,z,-66,3),yawTo(x,z,RCV_BALL[0],RCV_BALL[2]),sm(T_PASS-.9,T_PASS-.3,tau));
 }
 if(a.role==='def'||a.role==='marker'){
  // backing off / tight: facing the ball, shuffling; then turning to chase once the ball is through
  const turn=a.turn??-5,chase=sm(turn,turn+.5,tau);
  const back=blendPose(READY,backpedal(ph*1.4),sm(.4,1.2,sp));p=blendPose(back,p,chase);yaw=lerpAng(toBall,yaw,chase);
  // the marker: tight behind Paralluelo, facing her back; wrong-footed by the spin (she leans the wrong way for a beat)
  if(a.role==='marker'&&tau<-5.5){const[sx,sz]=pathAt(SALMA_PATH,tau);yaw=yawTo(x,z,sx,sz);const lean=Math.sin(Math.PI*clamp((tau-T_TURN0)/.8));if(lean>0){p.bend+=16*DEG*lean;p.lean+=8*DEG*lean;}}
 }
 if(a.kick){const[t0,foot,power,tgt]=a.kick,us=STRIKE_CONTACT+(tau-t0)/.8;
  if(us>.05&&us<1){const w=sm(.05,.2,us)*(1-sm(.85,1,us));p=blendPose(p,strike(us,{foot,power}),w);yaw=lerpAng(yaw,yawTo(x,z,tgt[0],tgt[2]),w);}}
 if(tau>T_NET+.2&&sp<1.4){if(a.esp)p=blendPose(p,celebrate(it*.9+a.phase,{kind:'arms'}),sm(T_NET+.2,T_NET+.7,tau)*.9);else p=blendPose(p,SLUMP,sm(T_NET+.2,T_NET+.9,tau)*.6);}
 return{pose:p,place:{x,z,yaw}};
}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the pose one drawn frame earlier (secondary
 * motion: ponytails and hems trail), smear = halftone echo + speed lines on fast limbs (the sprint, the strike). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:{pose:Pose;place:Place},smear=false){
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
}

// ---------------------------------------------------------------- the ball on screen
function drawBall(s:Sheet,c:Cam,tau:number,o:{min?:number;lines?:boolean;prev?:number}={}){
 const P=ballAt(tau),q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??18,c.F*.11/q[2]);
 const sh:Pt[]=[];const rad=.16+P[1]*.05;for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*1.3,0,P[2]+Math.sin(a)*rad]);if(p)sh.push(p);}
 if(sh.length>8&&P[0]<.05)s.tone(K,polyPath(sh,true),clamp(.5-P[1]*.12,.1,.5));
 if(o.lines&&o.prev!==undefined&&((tau>0&&tau<T_NET)||(tau>T_PASS&&tau<T_RCV))){const a=pr(c,ballAt(o.prev));if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.8)speedLines(s,Y,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:4,seed:7,len:Math.min(280,d*1.5),spread:r*.9,width:Math.max(2.5,r*.18),cov:.85});}}
 footballPanels(s,g[0],g[1],r,{rot:spinAt(tau),key:K,shadow:B,seed:5});
 return{g,r,d:q[2]};
}

// ---------------------------------------------------------------- one frame of the world through a camera
type Env={it:number;smear?:boolean;minBall?:number;lines?:boolean;prevT?:number;hero?:'high'|'mid';only?:number};
/** everything on the pitch, depth-sorted (far first): the players at τp (poses on twos), their previous drawn pose, the ball at τ.
 * Heat: small figures print at `low` detail; inside a passage every figure is capped. `only` skips figures farther than that (m). */
function play(s:Sheet,c:Cam,tau:number,tp:number,tpPrev:number,e:Env){
 const v=view(s),items:{d:number;draw:()=>void}[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending;
 const visible=(pl:Place,h=1.8)=>{const q=toCam(c,[pl.x??0,.9,pl.z??0]);if(q[2]<1)return -1;if(e.only&&q[2]>e.only)return -1;const g=scr(c,q),k=c.F/q[2]*h;return Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k?-1:q[2];};
 const detailFor=(st:AthleteStyle,d:number,hero:boolean):AthleteStyle=>{const px=c.F*1.8/d*ppu;if(passing)return{...st,detail:hero?'mid':'low'};if(px<(hero?50:120))return{...st,detail:'low'};if(e.hero==='mid'&&px>170)return{...st,detail:'mid'};return st;};
 {const pl=salmaPlace(tp),d=visible(pl);if(d>0)items.push({d,draw:()=>{const pose=salmaPose(tp),prev={pose:salmaPose(tpPrev),place:salmaPlace(tpPrev)};
  drawPlayer(s,pose,c,detailFor(SALMA_ST,d,true),pl,prev,!!e.smear&&((tp>-6.4&&tp<.6)||(tp>1&&tp<4.5)));}});}
 for(const a of ACTORS){const cur=actorAt(a,tp,e.it),d=visible(cur.place);if(d<0)continue;items.push({d,draw:()=>{const prev=actorAt(a,tpPrev,e.it-1/12);
  drawPlayer(s,cur.pose,c,detailFor(a.st,d,a.role==='marker'||a.role==='keeper'),cur.place,prev,!!e.smear&&(a.role==='keeper'&&tp>-.1&&tp<1||a.role==='marker'&&tp>-5.6&&tp<-1));}});}
 const bq=toCam(c,ballAt(tau));if(bq[2]>=NEAR)items.push({d:bq[2]-.3,draw:()=>{drawBall(s,c,tau,{min:e.minBall,lines:e.lines,prev:e.prevT});}});
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
/** a broadcast pan: the ball's recent path averaged (the operator lags a touch), nudged toward the goal */
function panTarget(tau:number):V3{let x=0,y=0,z=0;for(let i=0;i<5;i++){const p=ballAt(tau-i*.1);x+=p[0];y+=p[1];z+=p[2];}return[x/5+3,Math.min(1.4,y/5)*.6+.6,z/5];}
/** smoothed ground point under Paralluelo (cameras ride this) */
const kxz=(tau:number):V3=>{let x=0,z=0;for(let i=-2;i<=2;i++){const p=pathAt(SALMA_PATH,tau+i*.12);x+=p[0];z+=p[1];}return[x/5,0,z/5];};

/** the run so far, traced on the grass (a riso replay trail under the players) */
function runTrail(s:Sheet,c:Cam,t0:number,t1:number,fade:number,wm=.34){
 if(t1<=t0+.05||fade<=.02)return;const pts:Pt[]=[];for(let i=0;i<=26;i++){const tau=lerp(t0,t1,i/26),p=pathAt(SALMA_PATH,tau),q=pr(c,[p[0],.02,p[1]]);if(q)pts.push(q);}
 if(pts.length<3)return;const w=Math.max(9,kAt(c,salmaXZ(t1))*wm);s.knockout(ribbon(pts,w*1.5,{taper:.8,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.8,pressure:.2,wobble:0}),.9*fade);}
/** a projected arrow (shaft + head) along 3D points, in one ink */
function arrow3(s:Sheet,c:Cam,pts:V3[],w:number,ink:string,cov=1,dashed=false){
 const q=pts.map(p=>pr(c,p)).filter((p):p is Pt=>!!p);if(q.length<2)return;
 const e=q[q.length-1],f=q[q.length-2],ang=Math.atan2(e[1]-f[1],e[0]-f[0]),ca=Math.cos(ang),sa=Math.sin(ang),hd=w*2.6;
 const shaft=q.slice(0,-1).concat([[e[0]-ca*hd*.7,e[1]-sa*hd*.7]]);
 const gaps:[number,number][]=[];if(dashed)for(let i=0;i<6;i++)gaps.push([(i+.55)/6,(i+.9)/6]);
 const p=ribbon(shaft,w,{taper:.2,pressure:.2,wobble:.8,gaps});p.addPath(polyPath([[e[0]+ca*hd*.3,e[1]+sa*hd*.3],[e[0]-ca*hd-sa*hd*.62,e[1]-sa*hd+ca*hd*.62],[e[0]-ca*hd+sa*hd*.62,e[1]-sa*hd-ca*hd*.62]],true));
 s.knockout(p);s.fill(ink,p,cov);s.stroke(K,p,Math.max(2,w*.12),.85);
}
/** a ring on the grass around a ground point (radius in metres), drawn as a projected ellipse */
function groundRing(s:Sheet,c:Cam,P:V3,rm:number,u:number,ink:string,seed:number){if(u<=.02)return;const pts:Pt[]=[];for(let i=0;i<36;i++){const a=i/36*TAU,q=pr(c,[P[0]+Math.cos(a)*rm*(.7+.3*u),.02,P[2]+Math.sin(a)*rm*(.7+.3*u)]);if(q)pts.push(q);}if(pts.length<10)return;
 const w=Math.max(5,kAt(c,P)*.07),rr=ribbon(pts,w,{close:true,seed,taper:0,wobble:1.2});s.knockout(rr,.9*u);s.fill(ink,rr,.95*u);}
/** "the gap": a red arrow on the grass from the chasing marker's boots to Paralluelo's heels — it stretches with every stride */
function gapArrow(s:Sheet,c:Cam,tau:number,u:number){if(u<=.02)return;
 const m=ACTORS.find(q=>q.name==='Nouwen')!,[mx,mz]=pathAt(m.path,tau),[sx,sz]=pathAt(SALMA_PATH,tau),dx=sx-mx,dz=sz-mz,l=Math.hypot(dx,dz)||1;if(l<1.6)return;
 const P0:V3=[mx+dx/l*.5,.03,mz+dz/l*.5],P1:V3=[mix3(P0,[sx-dx/l*.6,.03,sz-dz/l*.6],u)[0],.03,mix3(P0,[sx-dx/l*.6,.03,sz-dz/l*.6],u)[2]];
 arrow3(s,c,[P0,mix3(P0,P1,.5),P1],Math.max(7,kAt(c,P0)*.2),R,.95);}
/** the shot so far: a yellow trail from her boot, skimming the grass, into the far post (and on into the net) */
function shotTrail(s:Sheet,c:Cam,tau:number,fade:number){if(tau<=0||fade<=.02)return;const pts:Pt[]=[];const n=18,te=Math.min(tau,T_NET);
 for(let i=0;i<=n;i++){const p=pr(c,ballAt(lerp(0,te,i/n)));if(p)pts.push(p);}if(pts.length<3)return;
 const w=Math.max(8,kAt(c,ballAt(Math.min(tau,T_POST)))*.12);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*fade);}
/** the tight angle: two red lines on the grass from the ball to each post (the window she has to hit) */
function angleLines(s:Sheet,c:Cam,u:number){if(u<=.02)return;const p=new Path2D();for(const z of[-3.66,3.66]){const e=mix3(S_BALL,[0,.02,z],u);seg3(c,[S_BALL[0],.02,S_BALL[2]],[e[0],.02,e[2]],.1,p,2);}
 s.knockout(p,.8*u);s.fill(R,p,.95*u);}
/** the spark where the ball kisses the inside of the post */
function postSpark(s:Sheet,c:Cam,tau:number){const k=sm(T_POST-.02,T_POST+.03,tau)*(1-sm(T_POST+.12,T_POST+.34,tau));if(k<=0)return;const q=pr(c,POST_PT);if(q)sparkBurst(s,Y,q[0],q[1],Math.max(34,kAt(c,POST_PT)*.5)*k,{n:8,seed:44,width:Math.max(4,kAt(c,POST_PT)*.05)});}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time, panning with the ball
/** real time; the strike lands just after "shoots" */
const tS1=()=>CUE(0,'shoots')+.2;
const tau1=(t:number)=>t-tS1();
const P1:V3=[-30,21,-60];
function cam1(t:number):Cam{
 const tau=tau1(t);
 return plan(t,[
  [0,0,()=>({P:P1,T:[-50,0,-4],fov:22})],
  [CUE(0,'Spain and')-.2,1.4,()=>({P:P1,T:panTarget(tau),fov:15})],
  [CUE(0,'Jenni')-.3,1,()=>({P:P1,T:mix3(panTarget(tau),add3(kxz(tau),[0,.6,0]),.25),fov:12})],
  [CUE(0,'races')-.3,1,()=>({P:P1,T:mix3(panTarget(tau),[-8,1,-3],.3),fov:10})],
  [tS1()-.3,.7,()=>({P:P1,T:mix3(panTarget(tau),[-4,1,-2],.55),fov:10.5})],
  [tS1()+T_NET+.5,1.6,()=>({P:P1,T:add3(kxz(tau),[0,1,0]),fov:8})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tau=tau1(t),tt=twos(t),tp=tau1(tt),tpp=tau1(tt-1/12),tN=tS1()+T_NET;
  stadium(s,c,t,[0,1,3],{roar:sm(tN,tN+.4,t),flash:sm(tN,tN+.25,t)*(1-sm(tN+2.5,tN+3.5,t))});
  ground(s,c,{bulge:bulgeAt(tau)});
  play(s,c,tau,tp,tpp,{it:tt,minBall:12,lines:true,prevT:tau1(t-.06),hero:'mid',smear:true});
  postSpark(s,c,tau);
 },
 aperture(t){const c=cam1(t),q=pr(c,add3(kxz(tau1(t)),[0,1.1,0]))??[0,0];return apertureDisc(q[0],q[1],80,12);},
 still:9.8,
};

// ---------------------------------------------------------------- 2 · slow-motion replay, low tracking touchline camera beside her: the spin, the sprint, the gap growing
const tau2=(t:number)=>key(t,mono([[0,-7.4],[CUE(1,'spins away'),-6.85],[CUE(1,'sprints'),-5.9],[CUE(1,'Every stride'),-4.6],[CUE(1,'gap bigger'),-3.2],[SECS(1),-2.3]]),linear);
function cam2(t:number):Cam{
 const tau=tau2(t),k=kxz(tau);
 return plan(t,[
  [0,0,()=>({P:add3(k,[4,1.5,-11.5]),T:add3(k,[-.5,1,.5]),fov:26})],
  [CUE(1,'sprints')-.3,1.2,()=>({P:add3(k,[9,1.4,-10]),T:add3(k,[1.5,1,.6]),fov:26})],
  [CUE(1,'gap bigger')-.5,1,()=>({P:add3(k,[8,1.3,-9.5]),T:add3(k,[-1.6,1,.4]),fov:28})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tau=tau2(t),tt=twos(t),tp=tau2(tt),tpp=tau2(tt-1/12),tE=CUE(1,'Every stride');
  stadium(s,c,t,[0,1,3]);
  ground(s,c);
  runTrail(s,c,T_TURN0,Math.min(tau,-.5),sm(CUE(1,'sprints')-.2,CUE(1,'sprints')+.5,t));
  gapArrow(s,c,tau,sm(tE-.2,tE+.5,t,easeOut));
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:11,lines:true,prevT:tau2(t-.06),only:70});
 },
 aperture(t){const c=cam2(t),q=pr(c,add3(kxz(tau2(t)),[0,1.1,0]))??[0,0];return apertureDisc(q[0],q[1],70,12);},
 still:4.6,
};

// ---------------------------------------------------------------- 3 · second replay from behind the goal at the far post: the tight angle, low and across; then live for "in off the far post!"
const tau3=(t:number)=>{const a=CUE(2,'The angle'),l=CUE(2,'keeps it low'),x=CUE(2,'across'),f=CUE(2,'far post');
 return key(t,mono([[0,-1.9],[a+.4,-1.2],[l+.1,-.12],[x+.2,.2],[f-.1,T_POST+.02],[SECS(2),T_POST+.02+(SECS(2)-f+.1)]]),linear);};
const E3:V3=[4.4,1.5,5.6];
function cam3v(t:number):Cam{
 const tau=tau3(t),b=ballAt(Math.max(0,Math.min(tau,T_POST))),k=add3(kxz(tau),[0,1.1,0]);
 return plan(t,[
  [0,0,()=>({P:E3,T:mix3(k,[-4,1,-4],.3),fov:22})],
  [CUE(2,'keeps it low')-.2,.8,()=>({P:E3,T:mix3([-8,.8,-8.5],[-1,.6,-2],.5),fov:28})],
  [CUE(2,'across')-.1,.5,()=>({P:E3,T:mix3([-4,.8,-5],b,.5),fov:30})],
  [CUE(2,'far post')+.3,1.4,()=>({P:add3(E3,[.4,.4,-.8]),T:k,fov:18})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tau=tau3(t),tt=twos(t),tp=tau3(tt),tpp=tau3(tt-1/12),tA=CUE(2,'The angle'),tF=CUE(2,'far post');
  stadium(s,c,t,[3,2,0],{roar:sm(tF,tF+.4,t),flash:sm(tF,tF+.3,t)});
  ground(s,c,{bulge:bulgeAt(tau)});
  angleLines(s,c,sm(tA,tA+.6,t,easeOut)*(1-sm(CUE(2,'across')+.3,CUE(2,'across')+.8,t)));
  shotTrail(s,c,tau,1-sm(T_NET+.2,T_NET+1,tau));
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:12,lines:true,prevT:tau3(t-.06),only:60});
  const hit=sm(-.02,.04,tau)*(1-sm(.1,.28,tau));if(hit>0){const q=pr(c,S_BALL);if(q)sparkBurst(s,Y,q[0],q[1],Math.max(40,kAt(c,S_BALL)*.6)*hit,{n:9,seed:18,width:Math.max(5,kAt(c,S_BALL)*.05)});}
  postSpark(s,c,tau);
 },
 aperture(t){const c=cam3v(t),q=pr(c,add3(kxz(tau3(t)),[0,1.2,0]))??[0,0];return apertureDisc(q[0],q[1],70,12);},
 still:1.9,
};

// ---------------------------------------------------------------- 4 · the lesson: use your speed → create space → keep it low → across the keeper
const tau4=(t:number)=>{const u=CUE(3,'Use your'),c=CUE(3,'create'),l=CUE(3,'keep your'),a=CUE(3,'across');
 return key(t,mono([[0,-6.6],[u,-6.1],[c+.2,-4.2],[l-.3,-1.2],[l+.4,-.1],[a+.2,.35],[SECS(3),T_NET+.1]]),linear);};
function cam4v(t:number):Cam{
 const tau=tau4(t),k=kxz(tau);
 return plan(t,[
  [0,0,()=>({P:add3(k,[-6,4.2,-9]),T:add3(k,[6,.4,1]),fov:36})],
  [CUE(3,'create')-.3,1,()=>({P:add3(k,[-5,4.4,-10]),T:add3(k,[.8,.6,.2]),fov:36})],
  [CUE(3,'keep your')-.5,1,()=>({P:add3(S_BALL,[-3.4,1.1,-2.8]),T:[-2,.3,-.2],fov:40})],
  [CUE(3,'across')-.2,.8,()=>({P:add3(S_BALL,[-8.5,5,-2.6]),T:[-4.2,.3,-2.6],fov:40})],
 ]);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tau=tau4(t),tt=twos(t),tp=tau4(tt),tpp=tau4(tt-1/12);
  const tU=CUE(3,'Use your'),tC=CUE(3,'create'),tL=CUE(3,'keep your'),tA=CUE(3,'across');
  stadium(s,c,t,[0,1,2,3]);
  ground(s,c,{bulge:bulgeAt(tau)});
  // 1 · use your speed: her run traced on the grass; 2 · create space: the red gap arrow stretching behind her
  runTrail(s,c,T_TURN0,Math.min(tau,-.5),sm(tU-.2,tU+.4,t)*(1-sm(tL-.4,tL,t)),.28);
  gapArrow(s,c,tau,sm(tC-.1,tC+.5,t,easeOutBack)*(1-sm(tL-.5,tL-.1,t)));
  // 3 · keep your shot low: the shot's trail hugging the grass; 4 · across the keeper: a yellow ring at the far post, the keeper ringed red
  shotTrail(s,c,tau,sm(tL,tL+.3,t));
  {const u=sm(tA-.1,tA+.4,t,easeOutBack);if(u>.02){groundRing(s,c,[0,0,3.3],.8,u,Y,77);const a=ACTORS.find(q=>q.name==='Van Domselaar')!,[x,z]=pathAt(a.path,Math.min(tau,.05));groundRing(s,c,[x,0,z],.8,u,R,71);}}
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:13,only:45});
  postSpark(s,c,tau);
 },
 still:8.2,
};

const film:RisoStory={
 id:'paralluelo-netherlands-2023',format:'11v11',title:"Paralluelo's extra-time winner v Netherlands",
 theme:'Speed makes space, then finish low and across: use your pace to get away from your defender, then keep the shot low and across the keeper',
 ageNote:'Spain 2–1 Netherlands (after extra time), 2023 FIFA Women’s World Cup quarter-final, Wellington Regional Stadium, 11 August 2023. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a low finish — a yellow streak skims flat along the grass and the ball rolls away. Reduced motion: the still streak. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.45)),fade=age<=0?1:1-clamp((age-.5)/.3),r=rng(seed);
  const pts:Pt[]=[];for(let i=0;i<=12;i++){const k=i/12*u;pts.push([x+240*k,y-22*k-6*Math.sin(Math.PI*k)]);}
  if(pts.length>2)s.fill(Y,ribbon(pts,13,{seed,taper:.9,pressure:.3,wobble:1}),.95*fade);
  if(age>0&&age<.3)sparkBurst(s,Y,x,y,60,{n:8,seed,g:1-clamp(age/.3),width:9});
  const e=pts[pts.length-1];footballPanels(s,e[0],e[1],26,{rot:age*8+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
